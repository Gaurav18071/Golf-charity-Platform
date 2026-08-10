import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { DonationStatus, CampaignStatus } from "@prisma/client";
import { redirect } from "next/navigation";

import { DonorDashboard } from "@/components/dashboard/role-views/DonorDashboard";
import { OrganizerDashboard } from "@/components/dashboard/role-views/OrganizerDashboard";
import { PendingOrganizerDashboard } from "@/components/dashboard/role-views/PendingOrganizerDashboard";
import { AdminDashboard } from "@/components/dashboard/role-views/AdminDashboard";
import { getOrganizationByProfileId } from "@/features/organization/services/organization.service";
import { calculateCompletionPercentage } from "@/features/organization/utils/organization-helpers";
import type { RecentDonationItem } from "@/components/dashboard/widgets";

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
  
  // DEBUG: Log role detection
  console.log("=== DASHBOARD ROLE DEBUG ===");
  console.log("User ID:", user.id);
  console.log("User Email:", user.email);
  console.log("Profile Role:", profile?.role);
  console.log("User Metadata Role:", user.user_metadata?.role);
  console.log("Final Role:", role);
  console.log("============================");

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

  // ── ADMIN view (check first to prevent fallthrough) ──────────────────────
  if (role === "ADMIN") {
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
      // Pending organizer requests = organizations with PENDING/UNDER_REVIEW status
      prisma.organization.count({ 
        where: { 
          verificationStatus: { in: ["PENDING", "UNDER_REVIEW"] },
          deletedAt: null,
        } 
      }),
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
    const organization = await getOrganizationByProfileId(user.id, false);

    return (
      <PendingOrganizerDashboard
        userName={userName}
        verificationStatus={organization?.verificationStatus ?? "DRAFT"}
        profileCompletion={25}
        recentDonations={recentDonations}
      />
    );
  }

  // ── ORGANIZER view ────────────────────────────────────────────────────────
  if (role === "ORGANIZER") {
    const [organization, totalCampaigns, activeCampaigns, totalRaised, totalDonationsCount] =
      await Promise.all([
        getOrganizationByProfileId(user.id, true),
        prisma.campaign.count({ where: { organizerId: user.id } }),
        prisma.campaign.count({
          where: { organizerId: user.id, status: CampaignStatus.ACTIVE },
        }),
        prisma.campaign.aggregate({
          where: { organizerId: user.id },
          _sum: { currentAmount: true },
        }),
        prisma.donation.count({
          where: {
            campaign: { organizerId: user.id },
            status: DonationStatus.COMPLETED,
          },
        }),
      ]);

    const docCount =
      organization && "documents" in organization && Array.isArray(organization.documents)
        ? organization.documents.length
        : 0;

    const completionPercentage = organization
      ? calculateCompletionPercentage(organization, docCount)
      : 100;

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
        organization={
          organization
            ? {
                id: organization.id,
                name: organization.name,
                verificationStatus: organization.verificationStatus,
                submittedAt: organization.submittedAt,
                reviewedAt: organization.reviewedAt,
                adminNotes: organization.adminNotes,
              }
            : null
        }
        completionPercentage={completionPercentage}
        stats={{
          totalCampaigns,
          activeCampaigns,
          totalRaised: Number(totalRaised._sum.currentAmount ?? 0),
          totalDonations: totalDonationsCount,
        }}
        recentDonations={orgRecentDonations}
      />
    );
  }

  // ── Fallback to DONOR (should never reach here with proper role assignment) ──
  return (
    <DonorDashboard
      userName={userName}
      stats={{
        totalDonated: 0,
        campaignsSupported: 0,
        activeDonations: 0,
        impactScore: 0,
      }}
      recentDonations={recentDonations}
    />
  );
}
