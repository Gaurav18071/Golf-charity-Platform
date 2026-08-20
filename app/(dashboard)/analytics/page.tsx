import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  TrendingUp,
  HandCoins,
  Target,
  Users,
  Download,
  Calendar,
  HeartHandshake,
} from "lucide-react";
import { parseDateRange } from "@/features/analytics/utils/date-range";
import {
  getAdminPlatformAnalytics,
  getOrganizerAnalytics,
} from "@/features/analytics/services/analytics.service";
import TopCampaignsTable from "@/components/dashboard/analytics/TopCampaignsTable";
import DonationsByStatusChart from "@/components/dashboard/analytics/DonationsByStatusChart";
import { StatsGrid } from "@/components/dashboard/widgets";
import type { StatItem } from "@/components/dashboard/widgets";

export const dynamic = "force-dynamic";

interface AnalyticsPageProps {
  searchParams: Promise<{ range?: string }>;
}

function formatCurrency(n: number): string {
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n}`;
}

const RANGE_TABS = [
  { label: "All Time", value: "all" },
  { label: "Last 7 Days", value: "7d" },
  { label: "Last 30 Days", value: "30d" },
  { label: "Last 90 Days", value: "90d" },
  { label: "This Month", value: "this_month" },
  { label: "Last Month", value: "last_month" },
];

export default async function AnalyticsPage({
  searchParams,
}: AnalyticsPageProps) {
  const { range = "all" } = await searchParams;
  const dateRange = parseDateRange(range);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
    select: { id: true, role: true },
  });

  const role = profile?.role || "DONOR";

  // ── ADMIN VIEW ─────────────────────────────────────────────────────────────
  if (role === "ADMIN") {
    const data = await getAdminPlatformAnalytics(dateRange);

    const stats: StatItem[] = [
      {
        id: "revenue",
        title: "Total Revenue Raised",
        value: formatCurrency(data.totalRevenue),
        icon: <TrendingUp className="h-6 w-6" />,
        variant: "emerald",
      },
      {
        id: "donations",
        title: "Total Donations",
        value: data.totalDonations,
        icon: <HandCoins className="h-6 w-6" />,
        variant: "blue",
      },
      {
        id: "active_campaigns",
        title: "Active Campaigns",
        value: data.activeCampaigns,
        icon: <Target className="h-6 w-6" />,
        variant: "purple",
      },
      {
        id: "users",
        title: "Platform Users",
        value: data.totalUsers,
        icon: <Users className="h-6 w-6" />,
        variant: "amber",
      },
    ];

    return (
      <div className="space-y-6">
        {/* Header with Title, Range Filter & Export */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Platform Analytics</h1>
            <p className="mt-1 text-sm text-slate-500">
              Platform-wide performance, transaction velocity, and campaign metrics.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={`/api/analytics/export?range=${range}`}
              download
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 hover:border-slate-300 transition"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export CSV</span>
            </a>
          </div>
        </div>

        {/* Date Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-2xs">
          <div className="flex items-center gap-1.5 px-3 text-xs font-semibold text-slate-400">
            <Calendar className="h-3.5 w-3.5" />
            <span>Range:</span>
          </div>
          {RANGE_TABS.map((tab) => (
            <Link
              key={tab.value}
              href={`/analytics?range=${tab.value}`}
              className={[
                "whitespace-nowrap rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-colors",
                range === tab.value
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100",
              ].join(" ")}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        <StatsGrid stats={stats} cols={4} />

        {/* Charts & Breakdown */}
        <div className="grid gap-6 lg:grid-cols-2">
          <DonationsByStatusChart data={data.donationsByStatus} />
          <TopCampaignsTable campaigns={data.topCampaigns} />
        </div>
      </div>
    );
  }

  // ── ORGANIZER VIEW ─────────────────────────────────────────────────────────
  if (role === "ORGANIZER") {
    const data = await getOrganizerAnalytics(user.id, dateRange);

    const stats: StatItem[] = [
      {
        id: "raised",
        title: "Total Raised",
        value: formatCurrency(data.totalRaised),
        icon: <TrendingUp className="h-6 w-6" />,
        variant: "emerald",
      },
      {
        id: "donations",
        title: "Donations Received",
        value: data.completedDonations,
        icon: <HandCoins className="h-6 w-6" />,
        variant: "blue",
      },
      {
        id: "donors",
        title: "Unique Donors",
        value: data.uniqueDonors,
        icon: <Users className="h-6 w-6" />,
        variant: "purple",
      },
      {
        id: "avg",
        title: "Avg. Donation",
        value: formatCurrency(data.averageDonation),
        icon: <HeartHandshake className="h-6 w-6" />,
        variant: "amber",
      },
    ];

    return (
      <div className="space-y-6">
        {/* Header with Title, Range Filter & Export */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Campaign Analytics</h1>
            <p className="mt-1 text-sm text-slate-500">
              Track fundraising performance, donor demographics, and campaign milestones.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={`/api/analytics/export?range=${range}`}
              download
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 hover:border-slate-300 transition"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export CSV</span>
            </a>
          </div>
        </div>

        {/* Date Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-2xs">
          <div className="flex items-center gap-1.5 px-3 text-xs font-semibold text-slate-400">
            <Calendar className="h-3.5 w-3.5" />
            <span>Range:</span>
          </div>
          {RANGE_TABS.map((tab) => (
            <Link
              key={tab.value}
              href={`/analytics?range=${tab.value}`}
              className={[
                "whitespace-nowrap rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-colors",
                range === tab.value
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100",
              ].join(" ")}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        <StatsGrid stats={stats} cols={4} />

        <div className="grid gap-6 lg:grid-cols-2">
          <DonationsByStatusChart data={data.donationsByStatus} />
          <TopCampaignsTable campaigns={data.topCampaigns} />
        </div>
      </div>
    );
  }

  // ── DONOR VIEW ─────────────────────────────────────────────────────────────
  redirect("/donations/history");
}
