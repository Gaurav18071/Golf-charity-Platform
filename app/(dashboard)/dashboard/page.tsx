import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { DonationStatus, CampaignStatus, OrganizationVerificationStatus } from "@prisma/client";
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

  // ── Profile Resolution ───────────────────────────────────────────────────
  let profile = null;
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id);

  try {
    if (isUuid) {
      profile = await prisma.profile.findUnique({
        where: { id: user.id },
      });
    }

    if (!profile && user.email) {
      profile = await prisma.profile.findUnique({
        where: { email: user.email },
      });
    }

    if (!profile && isUuid) {
      profile = await prisma.profile.create({
        data: {
          id: user.id,
          email: user.email ?? "",
          fullName:
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            user.email?.split("@")[0] ||
            "User",
          role: (user.user_metadata?.role as any) || "DONOR",
        },
      });
    }
  } catch (e) {
    console.warn("Profile resolution in dashboard warning:", e);
  }

  // Role — always trust DB profile as source of truth.
  // user_metadata.role is only used as fallback if profile row doesn't exist yet.
  const role = profile?.role ?? (user.user_metadata?.role as string) ?? "DONOR";

  // ── Shared: recent donations for current user ─────────────────────────────
  let sharedDonations: any[] = [];
  if (isUuid) {
    try {
      sharedDonations = await prisma.donation.findMany({
        where: { donorId: user.id },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { campaign: { select: { title: true } } },
      });
    } catch (err) {
      console.warn("Could not fetch user donations:", err);
    }
  }

  const recentDonations: RecentDonationItem[] = sharedDonations.map((d) => ({
    id: d.id,
    campaignTitle: d.campaign?.title ?? "Campaign",
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
      prisma.profile.count().catch(() => 0),
      prisma.campaign.count().catch(() => 0),
      prisma.donation.count({ where: { status: DonationStatus.COMPLETED } }).catch(() => 0),
      prisma.donation.aggregate({
        where: { status: DonationStatus.COMPLETED },
        _sum: { amount: true },
      }).catch(() => ({ _sum: { amount: 0 } })),
      prisma.organization.count({ 
        where: { 
          verificationStatus: { in: [OrganizationVerificationStatus.PENDING, OrganizationVerificationStatus.UNDER_REVIEW] },
          deletedAt: null,
        } 
      }).catch(() => 0),
      prisma.campaign.count({ where: { status: CampaignStatus.DRAFT } }).catch(() => 0),
      prisma.donation.findMany({
        where: { status: DonationStatus.COMPLETED },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { campaign: { select: { title: true } } },
      }).catch(() => []),
    ]);

    const adminDonations: RecentDonationItem[] = adminRecentDonations.map((d) => ({
      id: d.id,
      campaignTitle: d.campaign?.title ?? "Campaign",
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
        isUuid
          ? prisma.donation.aggregate({
              where: { donorId: user.id, status: DonationStatus.COMPLETED },
              _sum: { amount: true },
            }).catch(() => ({ _sum: { amount: 0 } }))
          : { _sum: { amount: 0 } },
        isUuid
          ? prisma.donation.groupBy({
              by: ["campaignId"],
              where: { donorId: user.id, status: DonationStatus.COMPLETED },
            }).catch(() => [])
          : [],
        isUuid
          ? prisma.donation.count({
              where: { donorId: user.id, status: DonationStatus.PENDING },
            }).catch(() => 0)
          : 0,
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
    const organization = isUuid ? await getOrganizationByProfileId(user.id, false) : null;

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
        isUuid ? getOrganizationByProfileId(user.id, true) : null,
        isUuid ? prisma.campaign.count({ where: { organizerId: user.id } }).catch(() => 0) : 0,
        isUuid
          ? prisma.campaign.count({
              where: { organizerId: user.id, status: CampaignStatus.ACTIVE },
            }).catch(() => 0)
          : 0,
        isUuid
          ? prisma.campaign.aggregate({
              where: { organizerId: user.id },
              _sum: { currentAmount: true },
            }).catch(() => ({ _sum: { currentAmount: 0 } }))
          : { _sum: { currentAmount: 0 } },
        isUuid
          ? prisma.donation.count({
              where: {
                campaign: { organizerId: user.id },
                status: DonationStatus.COMPLETED,
              },
            }).catch(() => 0)
          : 0,
      ]);

    const docCount =
      organization && "documents" in organization && Array.isArray(organization.documents)
        ? organization.documents.length
        : 0;

    const completionPercentage = organization
      ? calculateCompletionPercentage(organization, docCount)
      : 100;

    let orgDonations: any[] = [];
    if (isUuid) {
      try {
        orgDonations = await prisma.donation.findMany({
          where: {
            campaign: { organizerId: user.id },
            status: DonationStatus.COMPLETED,
          },
          orderBy: { createdAt: "desc" },
          take: 5,
          include: { campaign: { select: { title: true } } },
        });
      } catch (e) {
        console.warn("Could not fetch org donations:", e);
      }
    }

    const orgRecentDonations: RecentDonationItem[] = orgDonations.map((d) => ({
      id: d.id,
      campaignTitle: d.campaign?.title ?? "Campaign",
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

  // ── Fallback to DONOR ──
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
