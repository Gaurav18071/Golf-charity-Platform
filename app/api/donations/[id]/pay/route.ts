import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { processPayment } from "@/features/donation/services/donation.service";
import { processPaymentSchema } from "@/features/donation/schemas/donation.schema";
import { getDonationById } from "@/features/donation/services/donation.service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const donation = await getDonationById(id);

    if (!donation) {
      return NextResponse.json({ error: "Donation not found" }, { status: 404 });
    }

    if (donation.donorId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const parsed = processPaymentSchema.safeParse({
      ...body,
      donationId: id,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid payment data" },
        { status: 400 }
      );
    }

    const result = await processPayment(parsed.data);

    return NextResponse.json({ payment: result });
  } catch (err) {
    console.error("POST /api/donations/[id]/pay error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Payment failed" },
      { status: 500 }
    );
  }
}
