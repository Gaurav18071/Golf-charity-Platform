"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { checkAiRateLimit } from "@/lib/ai/rate-limiter";
import { executeImpactAnswer } from "@/lib/ai/impact-provider";
import {
  ImpactQuestionInputSchema,
  ImpactAssistantResponse,
  GroundedCampaignContext,
  DEFAULT_SUGGESTED_QUESTIONS,
  SuggestedQuestion,
} from "@/lib/ai/impact-types";

// ─────────────────────────────────────────────────────────────────────────────
// SAFE CAMPAIGN SELECT — only public fields; never adminNotes, payment data,
// internal verification documents, or private donor data.
// ─────────────────────────────────────────────────────────────────────────────

const IMPACT_CAMPAIGN_SELECT = {
  id: true,
  title: true,
  slug: true,
  shortDescription: true,
  description: true,
  story: true,
  category: true,
  status: true,
  location: true,
  goalAmount: true,
  currentAmount: true,
  endDate: true,
  coverImageUrl: true,
  beneficiaryName: true,
  beneficiaryStory: true,
  organizerId: true,
  organization: {
    select: {
      name: true,
      type: true,
      city: true,
      state: true,
      website: true,
      verificationStatus: true,
    },
  },
  _count: { select: { donations: true } },
} as const;

/**
 * Server Action — Ask the AI Impact Assistant a question about a specific campaign.
 *
 * GROUNDING CONTRACT:
 * - Campaign data is retrieved from Prisma BEFORE any AI call.
 * - AI receives only the GroundedCampaignContext — never raw DB records.
 * - AI never queries the database directly.
 * - Financial calculations are done server-side with real numbers, not by AI.
 * - Campaign must be public (status ACTIVE or DRAFT, not deleted).
 *
 * AUTHORIZATION:
 * - Anonymous users may ask about public campaigns.
 * - Rate limit: 8 req/60s for authenticated, 4 req/60s for anonymous (IP-keyed).
 * - No private donation history is exposed to AI or to the response.
 *
 * SECURITY:
 * - campaignId/slug NEVER trusted as authoritative — re-fetched from DB.
 * - adminNotes, payment data, tokens, and donor PII never reach AI.
 * - IDOR: only publicly visible campaigns are returned.
 */
export async function askCampaignImpactAction(
  rawQuestion: string,
  rawCampaignId: string
): Promise<ImpactAssistantResponse> {
  const start = Date.now();

  try {
    // 1. Resolve server-side identity for rate limiting
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let rateLimitKey: string;
    if (user) {
      rateLimitKey = `impact:${user.id}`;
    } else {
      const headersList = await headers();
      const ip =
        headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        headersList.get("x-real-ip") ??
        "anonymous";
      rateLimitKey = `impact:ip:${ip}`;
    }

    // 2. Rate limit — authenticated: 8/60s, anonymous: 4/60s
    const rateLimit = checkAiRateLimit(rateLimitKey, user ? 8 : 4, 60_000);
    if (!rateLimit.allowed) {
      return {
        success: false,
        mode: "fallback",
        error: `Too many requests. Please wait ${rateLimit.retryAfterSeconds} seconds before asking another question.`,
      };
    }

    // 3. Validate and sanitize inputs
    const inputValidation = ImpactQuestionInputSchema.safeParse({
      question: rawQuestion,
      campaignId: rawCampaignId,
    });

    if (!inputValidation.success) {
      const firstError = inputValidation.error.issues[0];
      return {
        success: false,
        mode: "fallback",
        error: firstError?.message ?? "Invalid input.",
      };
    }

    const { question, campaignId } = inputValidation.data;

    // 4. Fetch campaign from DB — never trust client-supplied data
    //    Only publicly visible campaigns (not deleted, status not REJECTED)
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(campaignId);

    const campaign = await prisma.campaign.findFirst({
      where: {
        ...(isUuid ? { id: campaignId } : { slug: campaignId }),
        deletedAt: null,
        // Only allow public statuses — never show REJECTED to public
        status: { in: ["ACTIVE", "DRAFT", "COMPLETED"] },
      },
      select: IMPACT_CAMPAIGN_SELECT,
    });

    if (!campaign) {
      return {
        success: false,
        mode: "fallback",
        error: "Campaign not found or is not publicly accessible.",
      };
    }

    // 5. Compute financial figures server-side — NEVER by AI
    const goalAmount = typeof campaign.goalAmount === "number"
      ? campaign.goalAmount
      : (campaign.goalAmount as { toNumber(): number }).toNumber();
    const currentAmount = typeof campaign.currentAmount === "number"
      ? campaign.currentAmount
      : (campaign.currentAmount as { toNumber(): number }).toNumber();
    const percentFunded = Math.min(100, Math.round((currentAmount / (goalAmount || 1)) * 100));
    const remainingAmount = Math.max(0, goalAmount - currentAmount);

    const now = new Date();
    const endDateObj = new Date(campaign.endDate);
    const daysLeft = Math.max(0, Math.ceil((endDateObj.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    const isActive = campaign.status === "ACTIVE" && daysLeft > 0;

    // 6. Build the grounded context — only safe, public fields
    const ctx: GroundedCampaignContext = {
      title: campaign.title,
      category: campaign.category,
      status: campaign.status,
      location: campaign.location,
      description: campaign.description,
      story: campaign.story,
      shortDescription: campaign.shortDescription,
      goalAmount,
      currentAmount,
      percentFunded,
      remainingAmount,
      donorCount: campaign._count.donations,
      endDate: endDateObj.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
      daysLeft,
      isActive,
      coverImageUrl: campaign.coverImageUrl,
      slug: campaign.slug,
      beneficiaryName: campaign.beneficiaryName,
      beneficiaryStory: campaign.beneficiaryStory,
      organizationName: campaign.organization.name,
      organizationType: campaign.organization.type,
      organizationCity: campaign.organization.city,
      organizationState: campaign.organization.state,
      organizationWebsite: campaign.organization.website,
      organizationVerified: campaign.organization.verificationStatus === "APPROVED",
      hasStory: !!(campaign.story && campaign.story.trim().length > 20),
      hasBeneficiaryInfo: !!(campaign.beneficiaryName || campaign.beneficiaryStory),
      hasDescription: !!(campaign.shortDescription && campaign.shortDescription.trim().length > 10),
    };

    // 7. Call AI provider with grounded context
    const { data: answer, provider } = await executeImpactAnswer(question, ctx);

    const latencyMs = Date.now() - start;
    console.info(
      `[ImpactAction] campaignId=${campaign.id} userId=${user?.id ?? "anon"} confidence=${answer.confidence} provider="${provider}" latency=${latencyMs}ms`
    );

    // 8. Build source reference from trusted DB fields — NEVER from AI output
    const source = {
      title: campaign.title,
      path: `/campaigns/${campaign.slug || campaign.id}`,
      category: campaign.category,
    };

    return {
      success: true,
      answer,
      source,
      mode: "ai",
    };
  } catch (error) {
    const latencyMs = Date.now() - start;
    console.error(`[ImpactAction] FAILED latency=${latencyMs}ms`, error);
    return {
      success: false,
      mode: "fallback",
      error: "The assistant is temporarily unavailable. Please try again shortly.",
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Suggested questions — filtered by available campaign data
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns contextually relevant suggested questions for a campaign.
 * Filters out questions for missing data to avoid asking about nonexistent info.
 *
 * This is a deterministic function — no AI call needed.
 */
export async function getCampaignSuggestedQuestionsAction(
  rawCampaignId: string
): Promise<{ success: boolean; questions: string[]; error?: string }> {
  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(rawCampaignId);

    const campaign = await prisma.campaign.findFirst({
      where: {
        ...(isUuid ? { id: rawCampaignId } : { slug: rawCampaignId }),
        deletedAt: null,
        status: { in: ["ACTIVE", "DRAFT", "COMPLETED"] },
      },
      select: {
        story: true,
        beneficiaryName: true,
        beneficiaryStory: true,
        currentAmount: true,
        _count: { select: { donations: true } },
      },
    });

    if (!campaign) {
      return { success: false, questions: [], error: "Campaign not found." };
    }

    const hasStory = !!(campaign.story && campaign.story.trim().length > 20);
    const hasBeneficiary = !!(campaign.beneficiaryName || campaign.beneficiaryStory);
    const hasProgress = campaign._count.donations > 0;

    const filtered = DEFAULT_SUGGESTED_QUESTIONS.filter((q: SuggestedQuestion) => {
      if (q.condition === "always") return true;
      if (q.condition === "hasStory") return hasStory;
      if (q.condition === "hasBeneficiary") return hasBeneficiary;
      if (q.condition === "hasProgress") return hasProgress;
      return false;
    }).map((q: SuggestedQuestion) => q.text);

    return { success: true, questions: filtered };
  } catch (error) {
    console.error("[getCampaignSuggestedQuestionsAction] Error:", error);
    return { success: false, questions: [], error: "Failed to load suggested questions." };
  }
}
