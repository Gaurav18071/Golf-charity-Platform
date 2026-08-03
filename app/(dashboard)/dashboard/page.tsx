import { createClient } from "@/src/lib/supabase/server";
import { prisma } from "@/src/lib/prisma";
import { DonationStatus, CampaignStatus } from "@prisma/client";
import { redirect } from "next/navigation";

import { DonorDashboard } from "@/components/dashboard/role-views/DonorDashboard";
import { OrganizerDashboard } from "@/components/dashboard/role-views/OrganizerDashboard";
import { PendingOrganizerDashboard } from "@/components/dashboard/role-views/PendingOrganizerDashboard";
import { AdminDashboard } from "@/components/dashboard/role-views/AdminDashboard";
import type { RecentDonationItem } from "@/components/dashboard/widgets";
import type { VerificationStatus } from "@/src/features/profile/profile.types";

// Always server-render — never cache
export const dynamic = "force-dynamic";

function formatDate(d: Date | string | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
}

export default async function DashboardPage() {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const userName =
    user.user_metadata?.full_name ||
    user.email?.split("@")[0] ||
    "User";

  // ── Profile ───────────────────────────────────────────────────────────────
  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
  });

  // Role — always trust DB profile as source of truth.
  // user_metadata.role is only used as fallback if profile row doesn't exist yet.
  const role = profile?.role ?? (user.user_metadata?.role as string) ?? "DONOR";

  // ── Shared: recent donations for current user ─────────────────────────────
  const sharedDonations = await prisma.donation.findMany({
    where: { donorId: user.id },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { campaign: { select: { title: true } } },
  });

  const recentDonations: RecentDonationItem[] = sharedDonations.map((d) => ({
    id: d.id,
    campaignTitle: d.campaign.title,
    amount: Number(d.amount),
    status: d.status as RecentDonationItem["status"],
    date: formatDate(d.donatedAt ?? d.createdAt),
  }));

  // ── DONOR view ────────────────────────────────────────────────────────────
  if (role === "DONOR") {
    const [totalDonated, campaignsSupported, activeDonations] =
      await Promise.all([
        prisma.donation.aggregate({
          where: { donorId: user.id, status: DonationStatus.COMPLETED },
          _sum: { amount: true },
        }),
        prisma.donation.groupBy({
          by: ["campaignId"],
          where: { donorId: user.id, status: DonationStatus.COMPLETED },
        }),
        prisma.donation.count({
          where: { donorId: user.id, status: DonationStatus.PENDING },
        }),
      ]);

    return (
      <DonorDashboard
        userName={userName}
        stats={{
          totalDonated: Number(totalDonated._sum.amount ?? 0),
          campaignsSupported: campaignsSupported.length,
          activeDonations,
          impactScore: campaignsSupported.length * 10,
        }}
        recentDonations={recentDonations}
      />
    );
  }

  // ── PENDING_ORGANIZER view ────────────────────────────────────────────────
  if (role === "PENDING_ORGANIZER") {
    return (
      <PendingOrganizerDashboard
        userName={userName}
        verificationStatus={(profile?.verificationStatus ?? "PENDING") as VerificationStatus}
        profileCompletion={25}
        recentDonations={recentDonations}
      />
    );
  }

  // ── ORGANIZER view ────────────────────────────────────────────────────────
  if (role === "ORGANIZER") {
    const [totalCampaigns, activeCampaigns, totalRaised] = await Promise.all([
      prisma.campaign.count({ where: { organizerId: user.id } }),
      prisma.campaign.count({
        where: { organizerId: user.id, status: CampaignStatus.ACTIVE },
      }),
      prisma.campaign.aggregate({
        where: { organizerId: user.id },
        _sum: { currentAmount: true },
      }),
    ]);

    const orgDonations = await prisma.donation.findMany({
      where: {
        campaign: { organizerId: user.id },
        status: DonationStatus.COMPLETED,
      },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { campaign: { select: { title: true } } },
    });

    const orgRecentDonations: RecentDonationItem[] = orgDonations.map((d) => ({
      id: d.id,
      campaignTitle: d.campaign.title,
      amount: Number(d.amount),
      status: d.status as RecentDonationItem["status"],
      date: formatDate(d.donatedAt ?? d.createdAt),
    }));

    return (
      <OrganizerDashboard
        userName={userName}
        stats={{
          totalCampaigns,
          activeCampaigns,
          totalRaised: Number(totalRaised._sum.currentAmount ?? 0),
          pendingWithdrawals: 0,
        }}
        recentDonations={orgRecentDonations}
      />
    );
  }

  // ── ADMIN view ────────────────────────────────────────────────────────────
  const [
    totalUsers,
    totalCampaigns,
    totalDonationCount,
    totalRevenue,
    pendingOrganizerRequests,
    pendingCampaignApprovals,
    adminRecentDonations,
  ] = await Promise.all([
    prisma.profile.count(),
    prisma.campaign.count(),
    prisma.donation.count({ where: { status: DonationStatus.COMPLETED } }),
    prisma.donation.aggregate({
      where: { status: DonationStatus.COMPLETED },
      _sum: { amount: true },
    }),
    // Pending organizer requests = profiles with PENDING_ORGANIZER role
    // (stored as DONOR in DB for now — approximation)
    prisma.profile.count({ where: { verificationStatus: "PENDING" } }),
    prisma.campaign.count({ where: { status: CampaignStatus.DRAFT } }),
    prisma.donation.findMany({
      where: { status: DonationStatus.COMPLETED },
      orderBy: { donatedAt: "desc" },
      take: 5,
      include: { campaign: { select: { title: true } } },
    }),
  ]);

  const adminDonations: RecentDonationItem[] = adminRecentDonations.map((d) => ({
    id: d.id,
    campaignTitle: d.campaign.title,
    amount: Number(d.amount),
    status: d.status as RecentDonationItem["status"],
    date: formatDate(d.donatedAt ?? d.createdAt),
  }));

  return (
    <AdminDashboard
      userName={userName}
      stats={{
        totalUsers,
        totalCampaigns,
        totalDonations: totalDonationCount,
        totalRevenue: Number(totalRevenue._sum.amount ?? 0),
        pendingOrganizerRequests,
        pendingCampaignApprovals,
      }}
      recentDonations={adminDonations}
    />
  );
}
