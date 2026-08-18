import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { CampaignCategory, CampaignStatus } from "@prisma/client";
import { z } from "zod";

const schema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  shortDescription: z.string().optional(),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Category is required"),
  goalAmount: z.coerce.number().min(1000, "Goal amount must be at least ₹1,000"),
  coverImageUrl: z.string().url().optional().or(z.literal("")),
  story: z.string().optional().or(z.literal("")),
  location: z.string().optional().or(z.literal("")),
  endDate: z.string().min(1, "End date is required"),
  beneficiaryName: z.string().optional().or(z.literal("")),
  beneficiaryDescription: z.string().optional().or(z.literal("")),
});

function toSlug(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim() +
    "-" +
    Date.now()
  );
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const startDate = new Date();
    const endDate = new Date(data.endDate);

    if (endDate <= startDate) {
      return NextResponse.json(
        { error: "End date must be in the future" },
        { status: 400 }
      );
    }

    const organization = await prisma.organization.findFirst({
      where: {
        profileId: user.id,
      },
      select: {
        id: true,
      },
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Organization profile is required to create a campaign" },
        { status: 403 }
      );
    }

    const categoryMap: Record<string, CampaignCategory> = {
      EDUCATION: CampaignCategory.EDUCATION,
      HEALTHCARE: CampaignCategory.HEALTHCARE,
      ENVIRONMENT: CampaignCategory.ENVIRONMENT,
      ANIMAL_WELFARE: CampaignCategory.ANIMAL_WELFARE,
      ANIMALS: CampaignCategory.ANIMAL_WELFARE,
      DISASTER_RELIEF: CampaignCategory.DISASTER_RELIEF,
      "DISASTER RELIEF": CampaignCategory.DISASTER_RELIEF,
      COMMUNITY: CampaignCategory.COMMUNITY,
      SPORTS: CampaignCategory.SPORTS,
      FOOD: CampaignCategory.FOOD,
      CHILD_WELFARE: CampaignCategory.CHILD_WELFARE,
      ELDERLY_SUPPORT: CampaignCategory.ELDERLY_SUPPORT,
      OTHER: CampaignCategory.OTHER,
    };

    const normalizedCategoryKey = data.category.toUpperCase().replace(/\s+/g, "_");
    const category =
      categoryMap[normalizedCategoryKey] ||
      categoryMap[data.category.toUpperCase()] ||
      CampaignCategory[normalizedCategoryKey as keyof typeof CampaignCategory] ||
      CampaignCategory.OTHER;

    const shortDescription =
      data.shortDescription?.trim() ||
      (data.description.length > 150
        ? data.description.slice(0, 147) + "..."
        : data.description);

    const description = data.description || shortDescription;

    const campaign = await prisma.campaign.create({
      data: {
        organizerId: user.id,
        organizationId: organization.id,
        title: data.title,
        slug: toSlug(data.title),
        category,
        shortDescription,
        description,
        story: data.story || null,
        beneficiaryName: data.beneficiaryName || null,
        beneficiaryStory: data.beneficiaryDescription || null,
        location: data.location || null,
        coverImageUrl: data.coverImageUrl || null,
        goalAmount: data.goalAmount,
        currentAmount: 0,
        status: CampaignStatus.DRAFT,
        startDate,
        endDate,
      },
    });

    return NextResponse.json({ id: campaign.id }, { status: 201 });
  } catch (err) {
    console.error("POST /api/campaigns error:", err);
    return NextResponse.json({ error: "Failed to create campaign" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const campaigns = await prisma.campaign.findMany({
      where: { status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { _count: { select: { donations: true } } },
    });

    return NextResponse.json({ campaigns });
  } catch (err) {
    console.error("GET /api/campaigns error:", err);
    return NextResponse.json({ error: "Failed to fetch campaigns" }, { status: 500 });
  }
}
