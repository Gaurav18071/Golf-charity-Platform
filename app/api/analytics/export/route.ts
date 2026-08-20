import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { parseDateRange } from "@/features/analytics/utils/date-range";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const profile = await prisma.profile.findUnique({
      where: { id: user.id },
      select: { id: true, role: true },
    });

    if (!profile) {
      return new NextResponse("Profile not found", { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const rangeParam = searchParams.get("range") || "all";
    const dateRange = parseDateRange(rangeParam);

    const dateFilter: any = {};
    if (dateRange.startDate) dateFilter.gte = dateRange.startDate;
    if (dateRange.endDate) dateFilter.lte = dateRange.endDate;

    const dateWhere = Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {};

    let donations: any[] = [];

    if (profile.role === "ADMIN") {
      donations = await prisma.donation.findMany({
        where: dateWhere,
        orderBy: { createdAt: "desc" },
        include: {
          campaign: { select: { title: true } },
          donor: { select: { fullName: true, email: true } },
        },
      });
    } else if (profile.role === "ORGANIZER") {
      donations = await prisma.donation.findMany({
        where: {
          campaign: { organizerId: user.id },
          ...dateWhere,
        },
        orderBy: { createdAt: "desc" },
        include: {
          campaign: { select: { title: true } },
          donor: { select: { fullName: true, email: true } },
        },
      });
    } else {
      donations = await prisma.donation.findMany({
        where: {
          donorId: user.id,
          ...dateWhere,
        },
        orderBy: { createdAt: "desc" },
        include: {
          campaign: { select: { title: true } },
          donor: { select: { fullName: true, email: true } },
        },
      });
    }

    // Generate CSV
    const headers = [
      "Donation Reference",
      "Campaign Title",
      "Donor Name",
      "Amount (INR)",
      "Status",
      "Date",
    ];

    const rows = donations.map((d) => [
      `"${d.id}"`,
      `"${d.campaign?.title?.replace(/"/g, '""') || "N/A"}"`,
      `"${d.donor?.fullName?.replace(/"/g, '""') || "Anonymous"}"`,
      d.amount.toString(),
      d.status,
      `"${new Date(d.createdAt).toISOString()}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join(
      "\n"
    );

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="donations_export_${rangeParam}.csv"`,
      },
    });
  } catch (error) {
    console.error("Export CSV error:", error);
    return new NextResponse("Export failed", { status: 500 });
  }
}
