import { NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";
import { prisma } from "@/src/lib/prisma";
import { z } from "zod";

const schema = z.object({
  title: z.string().min(5),
  description: z.string().min(20),
  category: z.string().min(1),
  goalAmount: z.coerce.number().min(1000),
  coverImageUrl: z.string().url().optional().or(z.literal("")),
  story: z.string().min(50),
  location: z.string().min(2),
  endDate: z.string().min(1),
  beneficiaryName: z.string().min(2),
  beneficiaryDescription: z.string().min(10),
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

    const campaign = await prisma.campaign.create({
      data: {
        organizerId: user.id,
        title: data.title,
        slug: toSlug(data.title),
        description: data.description,
        coverImageUrl: data.coverImageUrl || null,
        goalAmount: data.goalAmount,
        currentAmount: 0,
        status: "DRAFT",
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
