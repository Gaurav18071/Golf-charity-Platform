import {
  TrendingUp,
  HandCoins,
  Target,
  Users,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { CampaignStatus, DonationStatus } from "@prisma/client";
import TopCampaignsTable from "@/components/dashboard/analytics/TopCampaignsTable";
import DonationsByStatusChart from "@/components/dashboard/analytics/DonationsByStatusChart";

export const dynamic = "force-dynamic";

function formatCurrency(amount: number): string {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
  return `₹${amount}`;
}

export default async function AnalyticsPage() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  const [
    totalRaised,
    thisMonthRaised,
    lastMonthRaised,
    campaignStats,
    subscriberCount,
    thisMonthSubscribers,
    lastMonthSubscribers,
    donationsByStatus,
    topCampaigns,
    recentDonations,
  ] = await Promise.all([
    // Total raised (completed donations)
    prisma.donation.aggregate({
      _sum: { amount: true },
      where: { status: DonationStatus.COMPLETED },
    }),

    // This month raised
    prisma.donation.aggregate({
      _sum: { amount: true },
      where: {
        status: DonationStatus.COMPLETED,
        createdAt: { gte: startOfMonth },
      },
    }),

    // Last month raised
    prisma.donation.aggregate({
      _sum: { amount: true },
      where: {
        status: DonationStatus.COMPLETED,
        createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
      },
    }),

    // Campaign counts
    prisma.campaign.groupBy({
      by: ["status"],
      _count: { id: true },
    }),

    // Total subscribers (donors)
    prisma.profile.count({ where: { role: "DONOR" } }),

    // New this month
    prisma.profile.count({
      where: { role: "DONOR", createdAt: { gte: startOfMonth } },
    }),

    // New last month
    prisma.profile.count({
      where: {
        role: "DONOR",
        createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
      },
    }),

    // Donations grouped by status
    prisma.donation.groupBy({
      by: ["status"],
      _count: { id: true },
      _sum: { amount: true },
    }),

    // Top 5 campaigns by current_amount
    prisma.campaign.findMany({
      orderBy: { currentAmount: "desc" },
      take: 5,
      include: { _count: { select: { donations: true } } },
    }),

    // 5 most recent completed donations
    prisma.donation.findMany({
      where: { status: DonationStatus.COMPLETED },
      orderBy: { donatedAt: "desc" },
      take: 5,
      include: {
        donor: { select: { fullName: true } },
        campaign: { select: { title: true } },
      },
    }),
  ]);

  const thisMonth = Number(thisMonthRaised._sum.amount ?? 0);
  const lastMonth = Number(lastMonthRaised._sum.amount ?? 0);
  const raisedChange =
    lastMonth === 0 ? 100 : Math.round(((thisMonth - lastMonth) / lastMonth) * 100);

  const subChange =
    lastMonthSubscribers === 0
      ? 100
      : Math.round(
          ((thisMonthSubscribers - lastMonthSubscribers) / lastMonthSubscribers) * 100
        );

  const campaignCountMap = Object.fromEntries(
    campaignStats.map((s) => [s.status, s._count.id])
  );
  const activeCampaigns = campaignCountMap[CampaignStatus.ACTIVE] ?? 0;
  const totalCampaigns = Object.values(campaignCountMap).reduce((a, b) => a + b, 0);

  const kpiCards = [
    {
      title: "Total Raised",
      value: formatCurrency(Number(totalRaised._sum.amount ?? 0)),
      sub: `${formatCurrency(thisMonth)} this month`,
      change: raisedChange,
      icon: <TrendingUp className="h-6 w-6" />,
    },
    {
      title: "Active Campaigns",
      value: activeCampaigns,
      sub: `${totalCampaigns} total campaigns`,
      change: null,
      icon: <Target className="h-6 w-6" />,
    },
    {
      title: "Total Subscribers",
      value: subscriberCount,
      sub: `+${thisMonthSubscribers} this month`,
      change: subChange,
      icon: <Users className="h-6 w-6" />,
    },
    {
      title: "Total Donations",
      value: donationsByStatus.reduce((a, b) => a + b._count.id, 0),
      sub: `${donationsByStatus.find((d) => d.status === "COMPLETED")?._count.id ?? 0} completed`,
      change: null,
      icon: <HandCoins className="h-6 w-6" />,
    },
  ];

  const chartData = donationsByStatus.map((d) => ({
    status: d.status,
    count: d._count.id,
    amount: Number(d._sum.amount ?? 0),
  }));

  const topCampaignRows = topCampaigns.map((c) => ({
    id: c.id,
    title: c.title,
    goalAmount: Number(c.goalAmount),
    currentAmount: Number(c.currentAmount),
    status: c.status as "DRAFT" | "ACTIVE" | "COMPLETED" | "CANCELLED",
    donationCount: c._count.donations,
  }));

  const recentRows = recentDonations.map((d) => ({
    id: d.id,
    donorName: d.donor.fullName,
    campaignTitle: d.campaign.title,
    amount: Number(d.amount),
    donatedAt: (d.donatedAt ?? d.createdAt).toISOString(),
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
        <p className="mt-1 text-sm text-slate-500">
          Platform-wide performance metrics and insights.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {kpiCards.map((card) => (
          <div
            key={card.title}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{card.title}</p>
                <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                  {card.value}
                </h2>
                <p className="mt-1 text-xs text-slate-500">{card.sub}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                {card.icon}
              </div>
            </div>
            {card.change !== null && (
              <div
                className={`mt-3 flex items-center gap-1 text-xs font-medium ${
                  card.change >= 0 ? "text-emerald-600" : "text-red-500"
                }`}
              >
                {card.change >= 0 ? (
                  <ArrowUpRight className="h-3.5 w-3.5" />
                ) : (
                  <ArrowDownRight className="h-3.5 w-3.5" />
                )}
                {Math.abs(card.change)}% vs last month
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Charts + Tables row */}
      <div className="grid gap-6 xl:grid-cols-5">
        {/* Donations by status */}
        <div className="xl:col-span-2">
          <DonationsByStatusChart data={chartData} />
        </div>

        {/* Top campaigns */}
        <div className="xl:col-span-3">
          <TopCampaignsTable campaigns={topCampaignRows} />
        </div>
      </div>

      {/* Recent donations */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          Recent Completed Donations
        </h2>
        {recentRows.length === 0 ? (
          <p className="text-sm text-slate-500">No completed donations yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {recentRows.map((d) => (
              <li
                key={d.id}
                className="flex items-center justify-between py-3 text-sm"
              >
                <div className="min-w-0">
                  <p className="font-medium text-slate-900">{d.donorName}</p>
                  <p className="truncate text-slate-500">{d.campaignTitle}</p>
                </div>
                <div className="ml-4 shrink-0 text-right">
                  <p className="font-semibold text-emerald-600">
                    {new Intl.NumberFormat("en-IN", {
                      style: "currency",
                      currency: "INR",
                      maximumFractionDigits: 0,
                    }).format(d.amount)}
                  </p>
                  <p className="text-xs text-slate-400">
                    {new Date(d.donatedAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
