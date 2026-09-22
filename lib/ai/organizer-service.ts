import { checkAiRateLimit } from "./rate-limiter";
import { executeOrganizerAiOperation } from "./organizer-provider";
import {
  OrganizerAiInputSchema,
  OrganizerAiInput,
  OrganizerAiOperation,
  OrganizerAiResponse,
} from "./organizer-types";

/**
 * High-level AI Organizer Assistant Service.
 *
 * Validates input, enforces rate limiting per-user, then dispatches
 * to the provider for the requested operation.
 *
 * CRITICAL SAFETY CONTRACT:
 * - userId MUST come from the server (Supabase session). NEVER from the browser.
 * - Input is Zod-stripped before reaching the AI provider.
 * - Output is Zod-validated by the provider before returning.
 * - AI never queries or modifies the database.
 * - AI never makes financial, approval, or authorization decisions.
 *
 * Rate limit: 15 organizer AI requests per 60 seconds per user.
 * (Higher than donor search limit because organizers actively create content.)
 */
export async function runOrganizerAiOperation(
  userId: string,
  operation: OrganizerAiOperation,
  rawInput: Omit<OrganizerAiInput, "operation">
): Promise<OrganizerAiResponse> {
  const start = Date.now();

  try {
    // 1. Rate limit — keyed by userId (server-resolved)
    const rateLimit = checkAiRateLimit(`organizer:${userId}`, 15, 60_000);
    if (!rateLimit.allowed) {
      return {
        success: false,
        operation,
        error: `AI request limit reached. Please wait ${rateLimit.retryAfterSeconds} seconds before generating more content.`,
      };
    }

    // 2. Validate and strip input with Zod (removes unknown fields, enforces lengths)
    const fullInput = { ...rawInput, operation };
    const validationResult = OrganizerAiInputSchema.safeParse(fullInput);

    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      return {
        success: false,
        operation,
        error: firstError?.message ?? "Invalid input for AI operation.",
      };
    }

    // 3. Dispatch to provider (Gemini → OpenAI → fallback)
    const result = await executeOrganizerAiOperation(operation, validationResult.data);

    const latencyMs = Date.now() - start;
    console.info(
      `[OrganizerService] op=${operation} userId=${userId} success=${result.success} provider="${result.provider}" latency=${latencyMs}ms`
    );

    return result;
  } catch (error) {
    const latencyMs = Date.now() - start;
    console.error(
      `[OrganizerService] op=${operation} userId=${userId} FAILED latency=${latencyMs}ms`,
      error
    );
    return {
      success: false,
      operation,
      error:
        error instanceof Error
          ? error.message
          : "AI operation failed unexpectedly. Please try again.",
    };
  }
}
