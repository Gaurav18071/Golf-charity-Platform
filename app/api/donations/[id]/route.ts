import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDonationById } from "@/features/donation/services/donation.service";
import { prisma } from "@/lib/prisma";

export async function GET(
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

    // Check ownership or admin/organizer role
    const profile = await prisma.profile.findUnique({
      where: { id: user.id },
      select: { role: true },
    });

    const isOwner = donation.donorId === user.id;
    const isAdmin = profile?.role === "ADMIN";
    const isOrganizer =
      profile?.role === "ORGANIZER" &&
      donation.campaign?.organization?.id;

    if (!isOwner && !isAdmin && !isOrganizer) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ donation });
  } catch (err) {
    console.error("GET /api/donations/[id] error:", err);
    return NextResponse.json({ error: "Failed to fetch donation" }, { status: 500 });
  }
}
