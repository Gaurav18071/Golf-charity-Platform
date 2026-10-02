import { z } from "zod";

// ─────────────────────────────────────────────────────────────────────────────
// INPUT — validated question from the donor/visitor
// ─────────────────────────────────────────────────────────────────────────────

export const ImpactQuestionInputSchema = z.object({
  question: z
    .string()
    .min(3, "Question must be at least 3 characters")
    .max(400, "Question too long (max 400 characters)")
    .transform((s) => s.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "").trim()),

  /** campaignId or slug — verified server-side before any data is fetched */
  campaignId: z
    .string()
    .min(1, "Campaign ID is required")
    .max(200)
    .transform((s) => s.trim()),
});

export type ImpactQuestionInput = z.infer<typeof ImpactQuestionInputSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// GROUNDED CAMPAIGN CONTEXT — sent to AI (only safe public fields)
// Never includes: adminNotes, payment data, tokens, private org docs,
// internal verification data, or donor PII.
// ─────────────────────────────────────────────────────────────────────────────

export interface GroundedCampaignContext {
  title: string;
  category: string;
  status: string;
  location: string | null;
  description: string;
  story: string | null;
  shortDescription: string;
  goalAmount: number;
  currentAmount: number;
  percentFunded: number;
  remainingAmount: number;
  donorCount: number;
  endDate: string;
  daysLeft: number;
  isActive: boolean;
  coverImageUrl: string | null;
  slug: string;

  // Organizer-provided (may be unverified — flagged as such in prompt)
  beneficiaryName: string | null;
  beneficiaryStory: string | null;

  // Organization (public info only)
  organizationName: string;
  organizationType: string;
  organizationCity: string | null;
  organizationState: string | null;
  organizationWebsite: string | null;
  organizationVerified: boolean;

  // Data quality signals
  hasStory: boolean;
  hasBeneficiaryInfo: boolean;
  hasDescription: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// CAMPAIGN SOURCE REFERENCE — included in AI answer to ground sources
// ─────────────────────────────────────────────────────────────────────────────

export const CampaignSourceSchema = z.object({
  title: z.string().max(200),
  /** Route path only — generated from trusted slug/id, never from AI output */
  path: z.string().max(200),
  category: z.string().max(50).optional(),
});

export type CampaignSource = z.infer<typeof CampaignSourceSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// AI ANSWER OUTPUT — validated with Zod before returning to client
// ─────────────────────────────────────────────────────────────────────────────

export const ImpactAnswerOutputSchema = z.object({
  /** The main human-readable answer */
  answer: z.string().min(10).max(3000),

  /**
   * One of:
   * - "verified"        — sourced from platform database fields
   * - "organizer_claim" — from organizer-provided text (story/description)
   * - "unavailable"     — information not present in campaign data
   */
  confidence: z.enum(["verified", "organizer_claim", "unavailable"]),

  /** Short disclaimer when confidence is "organizer_claim" or "unavailable" */
  disclaimer: z.string().max(300).optional(),

  /** Suggested follow-up questions (max 3, based on available data) */
  suggestedQuestions: z.array(z.string().max(200)).max(3).optional(),
});

export type ImpactAnswerOutput = z.infer<typeof ImpactAnswerOutputSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// FULL RESPONSE — returned from server action to client
// ─────────────────────────────────────────────────────────────────────────────

export interface ImpactAssistantResponse {
  success: boolean;
  answer?: ImpactAnswerOutput;
  /** Source reference linking to the campaign page */
  source?: CampaignSource;
  error?: string;
  /** Whether the answer was AI-generated or a plain fallback */
  mode: "ai" | "fallback";
}

// ─────────────────────────────────────────────────────────────────────────────
// SUGGESTED QUESTIONS — pre-seeded per campaign based on available data
// ─────────────────────────────────────────────────────────────────────────────

export interface SuggestedQuestion {
  id: string;
  text: string;
  /** Only shown if relevant data exists */
  condition: "always" | "hasStory" | "hasBeneficiary" | "hasProgress";
}

export const DEFAULT_SUGGESTED_QUESTIONS: SuggestedQuestion[] = [
  {
    id: "purpose",
    text: "What is this campaign trying to achieve?",
    condition: "always",
  },
  {
    id: "funds",
    text: "How will the funds be used, according to the organizer?",
    condition: "hasStory",
  },
  {
    id: "progress",
    text: "What progress has this campaign made so far?",
    condition: "hasProgress",
  },
  {
    id: "beneficiary",
    text: "Who will benefit from this campaign?",
    condition: "hasBeneficiary",
  },
  {
    id: "impact",
    text: "What impact information is available?",
    condition: "always",
  },
  {
    id: "goal",
    text: "What is the fundraising goal and how much remains?",
    condition: "always",
  },
];
