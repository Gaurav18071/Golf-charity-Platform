import {
  CampaignEnhancementInput,
  CampaignEnhancementInputSchema,
  CampaignEnhancementOutput,
  AiServiceResponse,
} from "./types";
import { checkAiRateLimit } from "./rate-limiter";
import { executeAiCompletion } from "./provider";

/**
 * High-level AI Campaign Enhancement Service
 */
export async function enhanceCampaignDescription(
  userId: string,
  rawInput: CampaignEnhancementInput
): Promise<AiServiceResponse<CampaignEnhancementOutput>> {
  try {
    // 1. Rate Limiting Check
    const rateLimit = checkAiRateLimit(userId);
    if (!rateLimit.allowed) {
      return {
        success: false,
        error: `AI request limit reached. Please wait ${rateLimit.retryAfterSeconds} seconds before requesting more suggestions.`,
      };
    }

    const validatedInput = CampaignEnhancementInputSchema.safeParse(rawInput);
    if (!validatedInput.success) {
      const errorMsg =
        validatedInput.error.issues?.[0]?.message ||
        "Invalid input data";
      return {
        success: false,
        error: errorMsg,
      };
    }

    // 3. Dispatch to Provider with Schema Validation
    const result = await executeAiCompletion(validatedInput.data);
    return result;
  } catch (error) {
    console.error("[AiService] Unexpected enhancement error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate AI enhancement",
    };
  }

}

