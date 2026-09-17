import { z } from "zod";

// ─────────────────────────────────────────────────────────────────────────────
// INPUT — Raw user query validation
// ─────────────────────────────────────────────────────────────────────────────

export const CampaignSearchInputSchema = z.object({
  query: z
    .string()
    .min(2, "Search query must be at least 2 characters")
    .max(500, "Search query too long (max 500 characters)")
    .transform((s) => s.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "").trim()),
});

export type CampaignSearchInput = z.infer<typeof CampaignSearchInputSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// OUTPUT — Structured search intent extracted by AI
// Must match actual Prisma CampaignCategory enum values exactly.
// ─────────────────────────────────────────────────────────────────────────────

export const VALID_CATEGORIES = [
  "EDUCATION",
  "HEALTHCARE",
  "ENVIRONMENT",
  "ANIMAL_WELFARE",
  "DISASTER_RELIEF",
  "FOOD",
  "SPORTS",
  "COMMUNITY",
  "CHILD_WELFARE",
  "ELDERLY_SUPPORT",
  "OTHER",
] as const;

export const VALID_SORT_OPTIONS = ["newest", "raised", "oldest"] as const;

export const SearchIntentSchema = z.object({
  category: z.enum(VALID_CATEGORIES).optional(),
  location: z.string().max(100).optional(),
  keywords: z.array(z.string().max(60)).max(5).optional(),
  minAmount: z.number().min(0).max(100_000_000).optional(),
  maxAmount: z.number().min(0).max(100_000_000).optional(),
  sortBy: z.enum(VALID_SORT_OPTIONS).optional(),
});

export type SearchIntent = z.infer<typeof SearchIntentSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// CAMPAIGN RESULT — Safe subset returned to the donor
// Never includes adminNotes, payment secrets, or internal verification data.
// ─────────────────────────────────────────────────────────────────────────────

export interface CampaignSearchResult {
  id: string;
  title: string;
  shortDescription: string;
  category: string;
  location: string | null;
  coverImageUrl: string | null;
  goalAmount: number;
  currentAmount: number;
  donorCount: number;
  endDate: string;
  status: string;
  slug: string;
  /** Safe AI-generated explanation (from real data only). */
  explanation?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// SEARCH RESPONSE — Full response returned from server action
// ─────────────────────────────────────────────────────────────────────────────

export interface CampaignSearchResponse {
  success: boolean;
  results: CampaignSearchResult[];
  intent?: SearchIntent;
  /** Human-readable summary of what the search found */
  summary?: string;
  error?: string;
  /** Whether results came from AI-powered search or plain keyword fallback */
  mode: "ai" | "fallback";
}

// ─────────────────────────────────────────────────────────────────────────────
// RECOMMENDATION RESPONSE
// ─────────────────────────────────────────────────────────────────────────────

export interface CampaignRecommendationsResponse {
  success: boolean;
  recommendations: CampaignSearchResult[];
  reason: string;
  error?: string;
}
