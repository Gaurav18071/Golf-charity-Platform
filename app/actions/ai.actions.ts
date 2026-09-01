"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import {
  CampaignEnhancementInput,
  CampaignEnhancementOutput,
  AiServiceResponse,
} from "@/lib/ai/types";
import { enhanceCampaignDescription } from "@/lib/ai/service";

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
