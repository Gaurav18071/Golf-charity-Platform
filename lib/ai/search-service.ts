import { checkAiRateLimit } from "./rate-limiter";
import { executeSearchIntentExtraction } from "./search-provider";
import {
  CampaignSearchInputSchema,
  SearchIntent,
} from "./search-types";
import { AiServiceResponse } from "./types";

/**
 * High-level AI Campaign Search Service.
 *
 * Validates the raw query, enforces rate limiting, then dispatches to the
 * search provider to extract a structured SearchIntent.
 *
 * CRITICAL SAFETY CONTRACT:
 * - userId must come from the server (Supabase session), NOT from the browser.
 * - For anonymous requests, pass a derived key like "ip:<address>".
 * - The returned SearchIntent is validated with Zod — never executed raw.
 * - AI never receives database records, campaign IDs, or user PII.
 */
export async function extractCampaignSearchIntent(
  /** Server-verified userId or an "ip:<address>" key for anonymous users */
  rateLimitKey: string,
  /** Raw natural-language query from the donor */
  rawQuery: string
): Promise<AiServiceResponse<SearchIntent>> {
  try {
    // 1. Rate limiting — anonymous users get a stricter 5 req/60s limit
    const isAnonymous = rateLimitKey.startsWith("ip:");
    const { allowed, retryAfterSeconds } = checkAiRateLimit(
      rateLimitKey,
      isAnonymous ? 5 : 10,
      60_000
    );

    if (!allowed) {
      return {
        success: false,
        error: `Too many AI search requests. Please wait ${retryAfterSeconds} seconds before searching again.`,
      };
    }

    // 2. Validate and sanitize the raw query
    const parsed = CampaignSearchInputSchema.safeParse({ query: rawQuery });
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid search query",
      };
    }

    const sanitizedQuery = parsed.data.query;

    // 3. Extract structured intent via AI (never touches database)
    const result = await executeSearchIntentExtraction(sanitizedQuery);
    return result;
  } catch (error) {
    console.error("[SearchService] Unexpected error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Search intent extraction failed",
    };
  }
}
