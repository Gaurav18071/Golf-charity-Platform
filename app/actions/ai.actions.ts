"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import {
  CampaignEnhancementInput,
  CampaignEnhancementOutput,
  AiServiceResponse,
} from "@/lib/ai/types";
import { enhanceCampaignDescription } from "@/lib/ai/service";
import { runOrganizerAiOperation } from "@/lib/ai/organizer-service";
import {
  OrganizerAiInput,
  OrganizerAiOperation,
  OrganizerAiResponse,
} from "@/lib/ai/organizer-types";

// ─────────────────────────────────────────────────────────────────────────────
// Phase 12 — Campaign enhancement (preserved unchanged)
// ─────────────────────────────────────────────────────────────────────────────

export async function enhanceCampaignWithAiAction(
  input: CampaignEnhancementInput
): Promise<AiServiceResponse<CampaignEnhancementOutput>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "Authentication required to use AI Campaign Assistant.",
      };
    }

    const profile = await prisma.profile.findUnique({
      where: { id: user.id },
      select: { id: true, role: true },
    });

    if (!profile || (profile.role !== "ORGANIZER" && profile.role !== "ADMIN")) {
      return {
        success: false,
        error: "Forbidden: Organizer or Admin privileges required.",
      };
    }

    return await enhanceCampaignDescription(user.id, input);
  } catch (error) {
    console.error("enhanceCampaignWithAiAction error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "AI generation failed.",
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Phase 14 — Organizer AI Assistant operations
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Server Action for all Phase 14 Organizer AI operations.
 *
 * AUTHORIZATION CONTRACT:
 * - userId is NEVER accepted from the client.
 * - User identity is always resolved from the server-side Supabase session.
 * - Role must be ORGANIZER or ADMIN.
 * - If campaignId is provided, ownership is verified (organizerId === user.id) unless ADMIN.
 * - All input is Zod-validated in the service layer.
 * - AI never queries or modifies the database.
 * - AI suggestions are ephemeral — they are only applied if the organizer explicitly chooses.
 *
 * SECURITY:
 * - No PII, payment data, admin notes, or tokens are forwarded to the AI provider.
 * - `campaignId` is used only to verify ownership — campaign data is not blindly sent to AI.
 * - The AI operation payload is controlled by the organizer via the UI (fields they see and edit).
 */
export async function runOrganizerAssistantAction(
  operation: OrganizerAiOperation,
  /** Campaign context provided by the organizer — only safe fields */
  aiInput: Omit<OrganizerAiInput, "operation">,
  /** Optional: if provided, ownership is verified server-side */
  campaignId?: string
): Promise<OrganizerAiResponse> {
  try {
    // 1. Resolve user identity server-side — NEVER from client params
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        operation,
        error: "Authentication required to use the AI Organizer Assistant.",
      };
    }

    // 2. Verify role — ORGANIZER or ADMIN only
    const profile = await prisma.profile.findUnique({
      where: { id: user.id },
      select: { id: true, role: true },
    });

    if (!profile || (profile.role !== "ORGANIZER" && profile.role !== "ADMIN")) {
      return {
        success: false,
        operation,
        error: "Forbidden: Organizer or Admin access required.",
      };
    }

    // 3. If a campaignId is supplied, verify the organizer owns it
    //    Prevents IDOR: one organizer cannot use another's private campaign context
    if (campaignId) {
      const isUuid =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(campaignId);

      const campaign = await prisma.campaign.findFirst({
        where: isUuid ? { id: campaignId } : { slug: campaignId },
        select: { id: true, organizerId: true },
      });

      if (!campaign) {
        return {
          success: false,
          operation,
          error: "Campaign not found.",
        };
      }

      // Only the owner or an admin can use AI on this campaign
      if (campaign.organizerId !== user.id && profile.role !== "ADMIN") {
        return {
          success: false,
          operation,
          error: "Forbidden: You do not have access to this campaign.",
        };
      }
    }

    // 4. Dispatch to service (rate-limit + input validation + provider)
    return await runOrganizerAiOperation(user.id, operation, aiInput);
  } catch (error) {
    console.error("[runOrganizerAssistantAction] Unexpected error:", error);
    return {
      success: false,
      operation,
      error:
        error instanceof Error
          ? error.message
          : "AI assistant unavailable. Please try again.",
    };
  }
}
