"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { UserRole, CampaignStatus } from "@prisma/client";

/**
 * Server-side Admin Authentication Guard
 */
export async function requireAdminAuth() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Authentication required");
  }

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
    select: { id: true, role: true, email: true },
  });

  if (profile?.role !== "ADMIN") {
    throw new Error("Forbidden: Admin privileges required");
  }

  return { user, profile };
}

/**
 * Admin action to update a user's role with self-lockout prevention
 */
export async function updateUserRoleAction(
  targetUserId: string,
  newRole: UserRole
): Promise<{ success: boolean; error?: string }> {
  try {
    const { profile: currentAdmin } = await requireAdminAuth();

    // Prevent admin from removing their own administrative rights
    if (currentAdmin.id === targetUserId && newRole !== "ADMIN") {
      return {
        success: false,
        error: "Safety protection: You cannot demote your own administrator account.",
      };
    }

    const targetUser = await prisma.profile.findUnique({
      where: { id: targetUserId },
      select: { id: true, email: true, role: true },
    });

    if (!targetUser) {
      return { success: false, error: "Target user not found" };
    }

    await prisma.profile.update({
      where: { id: targetUserId },
      data: { role: newRole },
    });

    revalidatePath("/admin/users");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("updateUserRoleAction error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update user role",
    };
  }
}

/**
 * Admin action to suspend/cancel an active campaign
 */
export async function suspendCampaignAction(
  campaignId: string,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdminAuth();

    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        campaignId
      );

    const campaign = await prisma.campaign.findFirst({
      where: isUuid ? { id: campaignId } : { slug: campaignId },
      select: { id: true, slug: true, status: true },
    });

    if (!campaign) {
      return { success: false, error: "Campaign not found" };
    }

    await prisma.campaign.update({
      where: { id: campaign.id },
      data: {
        status: CampaignStatus.CANCELLED,
      },
    });

    revalidatePath("/admin/campaign-approvals");
    revalidatePath("/campaigns");
    revalidatePath(`/campaigns/${campaign.id}`);
    revalidatePath(`/campaigns/${campaign.slug}`);
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("suspendCampaignAction error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to suspend campaign",
    };
  }
}
