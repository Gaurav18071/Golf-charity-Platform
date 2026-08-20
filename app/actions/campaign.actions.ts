"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { CampaignStatus, CampaignCategory } from "@prisma/client";
import { createNotification } from "@/features/notification/services/notification.service";

async function requireAdminAuth() {
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
    select: { id: true, role: true },
  });

  if (profile?.role !== "ADMIN") {
    throw new Error("Forbidden: Admin access required");
  }

  return { user, profile };
}

export async function approveCampaignAction(campaignId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    await requireAdminAuth();

    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(campaignId);

    const campaign = await prisma.campaign.findFirst({
      where: isUuid ? { id: campaignId } : { slug: campaignId },
      select: { id: true, slug: true, title: true, organizerId: true, status: true },
    });

    if (!campaign) {
      return { success: false, error: "Campaign not found" };
    }

    await prisma.campaign.update({
      where: { id: campaign.id },
      data: {
        status: CampaignStatus.ACTIVE,
      },
    });

    createNotification({
      userId: campaign.organizerId,
      type: "CAMPAIGN_APPROVED",
      title: "Campaign Approved! 🚀",
      message: `Your campaign "${campaign.title}" has been approved by admin and is now live to receive donations.`,
      actionUrl: `/campaigns/${campaign.slug || campaign.id}`,
    }).catch((e) => console.warn("Failed to dispatch campaign approval notification:", e));

    revalidatePath("/admin/campaign-approvals");
    revalidatePath("/campaigns");
    revalidatePath(`/campaigns/${campaign.id}`);
    revalidatePath(`/campaigns/${campaign.slug}`);
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("approveCampaignAction error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to approve campaign",
    };
  }
}

export async function rejectCampaignAction(
  campaignId: string,
  reason?: string
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    await requireAdminAuth();

    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(campaignId);

    const campaign = await prisma.campaign.findFirst({
      where: isUuid ? { id: campaignId } : { slug: campaignId },
      select: { id: true, slug: true, title: true, organizerId: true },
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

    createNotification({
      userId: campaign.organizerId,
      type: "CAMPAIGN_REJECTED",
      title: "Campaign Moderation Update",
      message: reason
        ? `Your campaign "${campaign.title}" was not approved: "${reason}".`
        : `Your campaign "${campaign.title}" was not approved by moderation.`,
      actionUrl: `/campaigns/${campaign.id}/edit`,
    }).catch((e) => console.warn("Failed to dispatch campaign rejection notification:", e));

    revalidatePath("/admin/campaign-approvals");
    revalidatePath("/campaigns");
    revalidatePath(`/campaigns/${campaign.id}`);
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("rejectCampaignAction error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to reject campaign",
    };
  }
}

export interface UpdateCampaignInput {
  campaignId: string;
  title: string;
  shortDescription?: string;
  description: string;
  category: string;
  goalAmount: number;
  coverImageUrl?: string;
  story?: string;
  location?: string;
  endDate: string;
  beneficiaryName?: string;
  beneficiaryDescription?: string;
}

export async function updateCampaignAction(input: UpdateCampaignInput): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Authentication required" };
    }

    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        input.campaignId
      );

    const existing = await prisma.campaign.findFirst({
      where: isUuid ? { id: input.campaignId } : { slug: input.campaignId },
      include: {
        organizer: { select: { id: true, role: true } },
      },
    });

    if (!existing) {
      return { success: false, error: "Campaign not found" };
    }

    const userProfile = await prisma.profile.findUnique({
      where: { id: user.id },
      select: { role: true },
    });

    // Check authorization: must be campaign owner or ADMIN
    if (existing.organizerId !== user.id && userProfile?.role !== "ADMIN") {
      return { success: false, error: "Unauthorized to edit this campaign" };
    }

    const categoryMap: Record<string, CampaignCategory> = {
      EDUCATION: CampaignCategory.EDUCATION,
      HEALTHCARE: CampaignCategory.HEALTHCARE,
      ENVIRONMENT: CampaignCategory.ENVIRONMENT,
      ANIMAL_WELFARE: CampaignCategory.ANIMAL_WELFARE,
      DISASTER_RELIEF: CampaignCategory.DISASTER_RELIEF,
      FOOD: CampaignCategory.FOOD,
      SPORTS: CampaignCategory.SPORTS,
      COMMUNITY: CampaignCategory.COMMUNITY,
      CHILD_WELFARE: CampaignCategory.CHILD_WELFARE,
      ELDERLY_SUPPORT: CampaignCategory.ELDERLY_SUPPORT,
      OTHER: CampaignCategory.OTHER,
    };

    const category =
      categoryMap[input.category.toUpperCase()] ||
      (CampaignCategory[input.category.toUpperCase() as keyof typeof CampaignCategory] ??
        existing.category);

    const shortDesc =
      input.shortDescription?.trim() ||
      (input.description.length > 150
        ? input.description.slice(0, 147) + "..."
        : input.description);

    await prisma.campaign.update({
      where: { id: existing.id },
      data: {
        title: input.title,
        shortDescription: shortDesc,
        description: input.description,
        category,
        goalAmount: input.goalAmount,
        coverImageUrl: input.coverImageUrl || null,
        story: input.story || null,
        location: input.location || null,
        endDate: new Date(input.endDate),
        beneficiaryName: input.beneficiaryName || null,
        beneficiaryStory: input.beneficiaryDescription || null,
      },
    });

    revalidatePath("/campaigns");
    revalidatePath(`/campaigns/${existing.id}`);
    revalidatePath(`/campaigns/${existing.slug}`);
    revalidatePath("/dashboard");

    return { success: true };
  } catch (err) {
    console.error("updateCampaignAction error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update campaign",
    };
  }
}
