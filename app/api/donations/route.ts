import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createDonation } from "@/features/donation/services/donation.service";
import { createDonationSchema } from "@/features/donation/schemas/donation.schema";
import { getDonorDonations, getDonorSummaryStats } from "@/features/donation/services/donation.service";
import { DonationStatus } from "@prisma/client";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createDonationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid donation details" },
        { status: 400 }
      );
    }

    const result = await createDonation(user.id, parsed.data);

    return NextResponse.json({ donation: result }, { status: 201 });
  } catch (err) {
    console.error("POST /api/donations error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create donation" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get("status");
    const statusFilter =
      statusParam && Object.values(DonationStatus).includes(statusParam as DonationStatus)
        ? (statusParam as DonationStatus)
        : undefined;

    const [donations, summary] = await Promise.all([
      getDonorDonations(user.id, statusFilter),
      getDonorSummaryStats(user.id),
    ]);

    return NextResponse.json({ donations, summary });
  } catch (err) {
    console.error("GET /api/donations error:", err);
    return NextResponse.json(
      { error: "Failed to fetch donations" },
      { status: 500 }
    );
  }
}
