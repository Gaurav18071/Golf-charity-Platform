import { prisma } from "@/lib/prisma";
import { DonationStatus, CampaignStatus, PaymentStatus } from "@prisma/client";
import { DateRangeFilter } from "../utils/date-range";

export interface AdminAnalyticsSummary {
  totalRevenue: number;
  totalDonations: number;
  completedDonations: number;
  pendingDonations: number;
  failedDonations: number;
  totalUsers: number;
  totalDonors: number;
  totalOrganizers: number;
  totalCampaigns: number;
  activeCampaigns: number;
  completedCampaigns: number;
  pendingCampaigns: number;
  averageDonation: number;
  donationsByStatus: { status: string; count: number; amount: number }[];
  monthlyTrend: { month: string; amount: number; count: number }[];
  topCampaigns: {
    id: string;
    title: string;
    goalAmount: number;
    currentAmount: number;
    status: CampaignStatus;
    donationCount: number;
  }[];
}

export interface OrganizerAnalyticsSummary {
  totalRaised: number;
  totalDonations: number;
  completedDonations: number;
  uniqueDonors: number;
  averageDonation: number;
  totalCampaigns: number;
  activeCampaigns: number;
  completedCampaigns: number;
  donationsByStatus: { status: string; count: number; amount: number }[];
  topCampaigns: {
    id: string;
    title: string;
    goalAmount: number;
    currentAmount: number;
    status: CampaignStatus;
    donationCount: number;
  }[];
  recentDonations: {
    id: string;
    campaignTitle: string;
    donorName: string;
    amount: number;
    status: DonationStatus;
    createdAt: Date;
  }[];
}

function buildDateFilter(range?: DateRangeFilter) {
  if (!range?.startDate && !range?.endDate) return {};
  const filter: any = {};
  if (range.startDate) filter.gte = range.startDate;
  if (range.endDate) filter.lte = range.endDate;
  return filter;
}

/**
 * Platform-wide analytics for administrators
 */
export async function getAdminPlatformAnalytics(
  range?: DateRangeFilter
): Promise<AdminAnalyticsSummary> {
  const dateFilter = buildDateFilter(range);
  const donationDateWhere = Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {};

  const [
    revenueAgg,
    donationsCount,
    donationsByStatusGroup,
    usersCount,
    donorsCount,
    organizersCount,
    campaignsByStatus,
    topCampaignsRaw,
    recentCompletedDonations,
  ] = await Promise.all([
    prisma.donation.aggregate({
      where: {
        status: DonationStatus.COMPLETED,
        ...donationDateWhere,
      },
      _sum: { amount: true },
      _avg: { amount: true },
      _count: { id: true },
    }),
    prisma.donation.count({ where: donationDateWhere }),
    prisma.donation.groupBy({
      by: ["status"],
      where: donationDateWhere,
      _count: { id: true },
      _sum: { amount: true },
    }),
    prisma.profile.count(),
    prisma.profile.count({ where: { role: "DONOR" } }),
    prisma.profile.count({ where: { role: "ORGANIZER" } }),
    prisma.campaign.groupBy({
      by: ["status"],
      _count: { id: true },
    }),
    prisma.campaign.findMany({
      orderBy: { currentAmount: "desc" },
      take: 6,
      include: {
        _count: { select: { donations: { where: { status: DonationStatus.COMPLETED } } } },
      },
    }),
    prisma.donation.findMany({
      where: { status: DonationStatus.COMPLETED },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: { amount: true, createdAt: true },
    }),
  ]);

  const statusMap = new Map<string, { count: number; amount: number }>();
  donationsByStatusGroup.forEach((g) => {
    statusMap.set(g.status, {
      count: g._count.id,
      amount: Number(g._sum.amount ?? 0),
    });
  });

  const allStatuses: DonationStatus[] = [
    DonationStatus.COMPLETED,
    DonationStatus.PENDING,
    DonationStatus.FAILED,
    DonationStatus.REFUNDED,
  ];

  const donationsByStatus = allStatuses.map((s) => ({
    status: s,
    count: statusMap.get(s)?.count ?? 0,
    amount: statusMap.get(s)?.amount ?? 0,
  }));

  const campMap = new Map<string, number>();
  campaignsByStatus.forEach((c) => campMap.set(c.status, c._count.id));

  // Monthly breakdown
  const monthlyTrendMap = new Map<string, { amount: number; count: number }>();
  for (const d of recentCompletedDonations) {
    const key = new Date(d.createdAt).toLocaleDateString("en-IN", {
      month: "short",
      year: "numeric",
    });
    const current = monthlyTrendMap.get(key) || { amount: 0, count: 0 };
    monthlyTrendMap.set(key, {
      amount: current.amount + Number(d.amount),
      count: current.count + 1,
    });
  }

  const monthlyTrend = Array.from(monthlyTrendMap.entries())
    .map(([month, data]) => ({ month, ...data }))
    .reverse()
    .slice(0, 6);

  const topCampaigns = topCampaignsRaw.map((c) => ({
    id: c.id,
    title: c.title,
    goalAmount: Number(c.goalAmount),
    currentAmount: Number(c.currentAmount),
    status: c.status,
    donationCount: c._count.donations,
  }));

  return {
    totalRevenue: Number(revenueAgg._sum.amount ?? 0),
    totalDonations: donationsCount,
    completedDonations: revenueAgg._count.id,
    pendingDonations: statusMap.get(DonationStatus.PENDING)?.count ?? 0,
    failedDonations: statusMap.get(DonationStatus.FAILED)?.count ?? 0,
    totalUsers: usersCount,
    totalDonors: donorsCount,
    totalOrganizers: organizersCount,
    totalCampaigns: campaignsByStatus.reduce((a, b) => a + b._count.id, 0),
    activeCampaigns: campMap.get(CampaignStatus.ACTIVE) ?? 0,
    completedCampaigns: campMap.get(CampaignStatus.COMPLETED) ?? 0,
    pendingCampaigns: campMap.get(CampaignStatus.DRAFT) ?? 0,
    averageDonation: Math.round(Number(revenueAgg._avg.amount ?? 0)),
    donationsByStatus,
    monthlyTrend,
    topCampaigns,
  };
}

/**
 * Analytics scoped strictly to an organizer's campaigns
 */
export async function getOrganizerAnalytics(
  organizerId: string,
  range?: DateRangeFilter
): Promise<OrganizerAnalyticsSummary> {
  const dateFilter = buildDateFilter(range);
  const donationDateWhere = Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {};

  const [
    raisedAgg,
    totalDonationsCount,
    donationsByStatusGroup,
    uniqueDonorsGroup,
    campaignsByStatus,
    topCampaignsRaw,
    recentDonationsRaw,
  ] = await Promise.all([
    prisma.donation.aggregate({
      where: {
        campaign: { organizerId },
        status: DonationStatus.COMPLETED,
        ...donationDateWhere,
      },
      _sum: { amount: true },
      _avg: { amount: true },
      _count: { id: true },
    }),
    prisma.donation.count({
      where: {
        campaign: { organizerId },
        ...donationDateWhere,
      },
    }),
    prisma.donation.groupBy({
      by: ["status"],
      where: {
        campaign: { organizerId },
        ...donationDateWhere,
      },
      _count: { id: true },
      _sum: { amount: true },
    }),
    prisma.donation.groupBy({
      by: ["donorId"],
      where: {
        campaign: { organizerId },
        status: DonationStatus.COMPLETED,
        ...donationDateWhere,
      },
    }),
    prisma.campaign.groupBy({
      by: ["status"],
      where: { organizerId },
      _count: { id: true },
    }),
    prisma.campaign.findMany({
      where: { organizerId },
      orderBy: { currentAmount: "desc" },
      take: 6,
      include: {
        _count: { select: { donations: { where: { status: DonationStatus.COMPLETED } } } },
      },
    }),
    prisma.donation.findMany({
      where: {
        campaign: { organizerId },
        ...donationDateWhere,
      },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        campaign: { select: { title: true } },
        donor: { select: { fullName: true } },
      },
    }),
  ]);

  const statusMap = new Map<string, { count: number; amount: number }>();
  donationsByStatusGroup.forEach((g) => {
    statusMap.set(g.status, {
      count: g._count.id,
      amount: Number(g._sum.amount ?? 0),
    });
  });

  const allStatuses: DonationStatus[] = [
    DonationStatus.COMPLETED,
    DonationStatus.PENDING,
    DonationStatus.FAILED,
    DonationStatus.REFUNDED,
  ];

  const donationsByStatus = allStatuses.map((s) => ({
    status: s,
    count: statusMap.get(s)?.count ?? 0,
    amount: statusMap.get(s)?.amount ?? 0,
  }));

  const campMap = new Map<string, number>();
  campaignsByStatus.forEach((c) => campMap.set(c.status, c._count.id));

  const topCampaigns = topCampaignsRaw.map((c) => ({
    id: c.id,
    title: c.title,
    goalAmount: Number(c.goalAmount),
    currentAmount: Number(c.currentAmount),
    status: c.status,
    donationCount: c._count.donations,
  }));

  const recentDonations = recentDonationsRaw.map((d) => ({
    id: d.id,
    campaignTitle: d.campaign.title,
    donorName: d.donor.fullName,
    amount: Number(d.amount),
    status: d.status,
    createdAt: d.createdAt,
  }));

  return {
    totalRaised: Number(raisedAgg._sum.amount ?? 0),
    totalDonations: totalDonationsCount,
    completedDonations: raisedAgg._count.id,
    uniqueDonors: uniqueDonorsGroup.length,
    averageDonation: Math.round(Number(raisedAgg._avg.amount ?? 0)),
    totalCampaigns: campaignsByStatus.reduce((a, b) => a + b._count.id, 0),
    activeCampaigns: campMap.get(CampaignStatus.ACTIVE) ?? 0,
    completedCampaigns: campMap.get(CampaignStatus.COMPLETED) ?? 0,
    donationsByStatus,
    topCampaigns,
    recentDonations,
  };
}
