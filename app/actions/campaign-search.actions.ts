"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { CampaignStatus, CampaignCategory } from "@prisma/client";
import { extractCampaignSearchIntent } from "@/lib/ai/search-service";
import { buildSearchSummary } from "@/lib/ai/prompts";
import {
  CampaignSearchResponse,
  CampaignRecommendationsResponse,
  CampaignSearchResult,
  SearchIntent,
} from "@/lib/ai/search-types";

// ─────────────────────────────────────────────────────────────────────────────
// SAFE CAMPAIGN SELECT — never includes adminNotes, payment secrets, or
// internal organization verification data
// ─────────────────────────────────────────────────────────────────────────────

const SAFE_CAMPAIGN_SELECT = {
  id: true,
  title: true,
  slug: true,
  shortDescription: true,
  category: true,
  location: true,
  coverImageUrl: true,
  goalAmount: true,
  currentAmount: true,
  status: true,
  endDate: true,
  _count: { select: { donations: true } },
} as const;

type SafeCampaignRow = {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  category: CampaignCategory;
  location: string | null;
  coverImageUrl: string | null;
  goalAmount: { toNumber: () => number } | number;
  currentAmount: { toNumber: () => number } | number;
  status: CampaignStatus;
  endDate: Date;
  _count: { donations: number };
};

function toResult(c: SafeCampaignRow, explanation?: string): CampaignSearchResult {
  return {
    id: c.id,
    title: c.title,
    slug: c.slug,
    shortDescription: c.shortDescription,
    category: c.category,
    location: c.location,
    coverImageUrl: c.coverImageUrl,
    goalAmount: typeof c.goalAmount === "number" ? c.goalAmount : c.goalAmount.toNumber(),
    currentAmount: typeof c.currentAmount === "number" ? c.currentAmount : c.currentAmount.toNumber(),
    donorCount: c._count.donations,
    endDate: c.endDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    status: c.status,
    explanation,
  };
}

/**
 * Builds a Prisma `where` clause from a validated SearchIntent.
 * Only returns ACTIVE campaigns that are publicly discoverable.
 * No adminNotes, no payment data, no internal org verification.
 */
function buildPrismaWhere(intent: SearchIntent) {
  const where: Record<string, unknown> = {
    status: CampaignStatus.ACTIVE,
    deletedAt: null,
  };

  if (intent.category) {
    where.category = intent.category as CampaignCategory;
  }

  if (intent.location) {
    where.location = { contains: intent.location, mode: "insensitive" };
  }

  if (intent.keywords?.length) {
    where.OR = intent.keywords.flatMap((kw) => [
      { title: { contains: kw, mode: "insensitive" } },
      { shortDescription: { contains: kw, mode: "insensitive" } },
      { description: { contains: kw, mode: "insensitive" } },
    ]);
  }

  if (intent.minAmount !== undefined || intent.maxAmount !== undefined) {
    const amountFilter: Record<string, number> = {};
    if (intent.minAmount !== undefined) amountFilter.gte = intent.minAmount;
    if (intent.maxAmount !== undefined) amountFilter.lte = intent.maxAmount;
    where.goalAmount = amountFilter;
  }

  return where;
}

function buildOrderBy(sortBy?: string) {
  if (sortBy === "raised") return { currentAmount: "desc" as const };
  if (sortBy === "oldest") return { createdAt: "asc" as const };
  return { createdAt: "desc" as const };
}

// ─────────────────────────────────────────────────────────────────────────────
// ACTION 1 — AI Campaign Search
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Natural-language campaign search.
 *
 * Authentication is OPTIONAL — public donors can search without an account.
 * Rate limiting key:
 *   - Authenticated: user.id
 *   - Anonymous:     "ip:<x-forwarded-for>" (stricter limit: 5 req/60s)
 *
 * CRITICAL: userId is resolved server-side from Supabase session.
 *           It is NEVER accepted from the browser as a parameter.
 */
export async function aiCampaignSearchAction(
  rawQuery: string
): Promise<CampaignSearchResponse> {
  try {
    // 1. Resolve server-side identity for rate limiting
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let rateLimitKey: string;
    if (user) {
      rateLimitKey = user.id;
    } else {
      // Use IP address for anonymous rate limiting
      const headersList = await headers();
      const ip =
        headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        headersList.get("x-real-ip") ??
        "anonymous";
      rateLimitKey = `ip:${ip}`;
    }

    // 2. Extract structured intent via AI service
    const intentResult = await extractCampaignSearchIntent(rateLimitKey, rawQuery);

    if (!intentResult.success) {
      return {
        success: false,
        results: [],
        error: intentResult.error,
        mode: "fallback",
      };
    }

    const intent = intentResult.data!;

    // 3. Build and execute Prisma query
    //    Database is the ONLY source of truth — AI never invents campaigns
    const campaigns = await (prisma.campaign.findMany as Function)({
      where: buildPrismaWhere(intent),
      orderBy: buildOrderBy(intent.sortBy),
      take: 12,
      select: SAFE_CAMPAIGN_SELECT,
    });

    const results: CampaignSearchResult[] = (campaigns as SafeCampaignRow[]).map((c) =>
      toResult(c)
    );

    const summary = buildSearchSummary(rawQuery, intent, results.length);

    return {
      success: true,
      results,
      intent,
      summary,
      mode: "ai",
    };
  } catch (error) {
    console.error("[aiCampaignSearchAction] Error:", error);
    return {
      success: false,
      results: [],
      error: "Search failed. Please try again.",
      mode: "fallback",
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ACTION 2 — Campaign Recommendations (authenticated only)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Personalized campaign recommendations for authenticated donors.
 *
 * Architecture:
 *   1. Verify user server-side (NEVER trust userId from browser)
 *   2. Load donor's past donation categories (last 10 completed)
 *   3. Query up to 20 ACTIVE candidate campaigns by matching categories
 *   4. If no history → return top 6 newest ACTIVE campaigns
 *   5. Generate safe deterministic explanation text (no AI call needed —
 *      explanations are based on verifiable donation history signals only)
 *
 * Privacy:
 *   - No PII sent to AI
 *   - No sensitive profile data used
 *   - No cross-donor data leakage
 *
 * NEVER allows AI to return arbitrary campaign IDs.
 * All campaigns are verified against Neon before returning.
 */
export async function getCampaignRecommendationsAction(): Promise<CampaignRecommendationsResponse> {
  try {
    // 1. Require authentication (server-side)
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        recommendations: [],
        reason: "Authentication required for personalized recommendations.",
        error: "Authentication required",
      };
    }

    // 2. Load donor's past donation categories (non-sensitive signal)
    //    Only COMPLETED donations — no pending, failed, or refunded
    const pastDonations = await prisma.donation.findMany({
      where: {
        donorId: user.id,
        status: "COMPLETED",
      },
      select: {
        campaign: {
          select: { category: true },
        },
      },
      orderBy: { donatedAt: "desc" },
      take: 10,
    });

    const donatedCategories = [
      ...new Set(pastDonations.map((d) => d.campaign.category)),
    ];

    let campaigns: SafeCampaignRow[];
    let reason: string;

    if (donatedCategories.length > 0) {
      // 3a. Candidate set: campaigns in categories the donor has supported
      campaigns = await (prisma.campaign.findMany as Function)({
        where: {
          status: CampaignStatus.ACTIVE,
          deletedAt: null,
          category: { in: donatedCategories },
        },
        orderBy: { currentAmount: "desc" },
        take: 20,
        select: SAFE_CAMPAIGN_SELECT,
      });

      // Shuffle lightly to avoid always showing the same campaigns
      campaigns = campaigns.sort(() => Math.random() - 0.5).slice(0, 6);

      const categoryLabels = donatedCategories
        .slice(0, 2)
        .map((c) => c.replace(/_/g, " ").toLowerCase())
        .join(" and ");

      reason = `Based on your previous donations to ${categoryLabels} campaigns.`;
    } else {
      // 3b. No history → newest ACTIVE campaigns (cold start)
      campaigns = await (prisma.campaign.findMany as Function)({
        where: {
          status: CampaignStatus.ACTIVE,
          deletedAt: null,
        },
        orderBy: { createdAt: "desc" },
        take: 6,
        select: SAFE_CAMPAIGN_SELECT,
      });

      reason = "Popular new campaigns to get you started.";
    }

    // 4. Build results with safe deterministic explanation text
    const recommendations: CampaignSearchResult[] = (
      campaigns as SafeCampaignRow[]
    ).map((c) => {
      const categoryLabel = c.category.replace(/_/g, " ").toLowerCase();
      let explanation: string;

      if (donatedCategories.includes(c.category)) {
        explanation = `Matches your interest in ${categoryLabel} campaigns.`;
      } else {
        explanation = `A new ${categoryLabel} campaign seeking support.`;
      }

      return toResult(c, explanation);
    });

    return {
      success: true,
      recommendations,
      reason,
    };
  } catch (error) {
    console.error("[getCampaignRecommendationsAction] Error:", error);
    return {
      success: false,
      recommendations: [],
      reason: "",
      error: "Failed to load recommendations. Please try again.",
    };
  }
}
