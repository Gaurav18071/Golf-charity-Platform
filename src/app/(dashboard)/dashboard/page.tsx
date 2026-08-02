import { HandCoins, Target, Users, BarChart3, TrendingUp } from "lucide-react";
import Link from "next/link";

import {
  WelcomeBanner,
  StatsGrid,
  QuickActions,
  RecentActivity,
} from "@/src/components/dashboard/overview";
import { createClient } from "@/src/lib/supabase/server";
import { prisma } from "@/src/lib/prisma";
import { CampaignStatus, DonationStatus } from "@prisma/client";

// Always fetch fresh data — never serve a cached build
export const dynamic = "force-dynamic";

function formatCurrency(amount: number): string {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
  return `₹${amount}`;
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userName =
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Golfer";

  // Fetch all real stats in parallel
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());

  const [
    campaignCount,
    endingSoonCount,
    totalRaised,
    subscriberCount,
    newSubscribersThisWeek,
    recentDonations,
    recentCampaigns,
  ] = await Promise.all([
    prisma.campaign.count({ where: { status: CampaignStatus.ACTIVE } }),

    prisma.campaign.count({
      where: {
        status: CampaignStatus.ACTIVE,
        endDate: { lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
      },
    }),

    prisma.donation.aggregate({
      _sum: { amount: true },
      where: { status: DonationStatus.COMPLETED },
    }),

    prisma.profile.count({ where: { role: "DONOR" } }),

    prisma.profile.count({
      where: { role: "DONOR", createdAt: { gte: startOfWeek } },
    }),

    // Recent completed donations
    prisma.donation.findMany({
      where: { status: DonationStatus.COMPLETED },
      orderBy: { donatedAt: "desc" },
      take: 3,
      include: {
        donor: { select: { fullName: true } },
        campaign: { select: { title: true } },
      },
    }),

    // Recently created campaigns
    prisma.campaign.findMany({
      orderBy: { createdAt: "desc" },
      take: 2,
      select: { title: true, createdAt: true },
    }),
  ]);

  const stats = [
    {
      id: "campaigns",
      title: "Active Campaigns",
      value: campaignCount,
      icon: <Target className="h-6 w-6" />,
      description:
        endingSoonCount > 0
          ? `${endingSoonCount} campaign${endingSoonCount > 1 ? "s" : ""} ending this week`
          : "All campaigns on track",
    },
    {
      id: "donations",
      title: "Total Raised",
      value: formatCurrency(Number(totalRaised._sum.amount ?? 0)),
      icon: <HandCoins className="h-6 w-6" />,
      description: "Across all completed donations",
    },
    {
      id: "subscribers",
      title: "Subscribers",
      value: subscriberCount,
      icon: <Users className="h-6 w-6" />,
      description:
        newSubscribersThisWeek > 0
          ? `${newSubscribersThisWeek} joined this week`
          : "No new subscribers this week",
    },
    {
      id: "analytics",
      title: "Campaigns",
      value: campaignCount,
      icon: <TrendingUp className="h-6 w-6" />,
      description: "View analytics →",
    },
  ];

  const quickActions = [
    {
      id: "campaign",
      title: "New Campaign",
      description: "Launch a new fundraising campaign",
      icon: <Target className="h-6 w-6" />,
      href: "/campaigns/new",
    },
    {
      id: "analytics",
      title: "View Analytics",
      description: "Track fundraising performance",
      icon: <BarChart3 className="h-6 w-6" />,
      href: "/analytics",
    },
    {
      id: "donations",
      title: "Manage Donations",
      description: "Review incoming donations",
      icon: <HandCoins className="h-6 w-6" />,
      href: "/donations",
    },
    {
      id: "subscribers",
      title: "Subscribers",
      description: "Manage your community",
      icon: <Users className="h-6 w-6" />,
      href: "/subscribers",
    },
  ];

  // Build activity feed from real recent donations + campaigns
  const activities = [
    ...recentDonations.map((d) => ({
      id: d.id,
      title: "New donation received",
      description: `${formatCurrency(Number(d.amount))} donated to ${d.campaign.title} by ${d.donor.fullName}`,
      time: timeAgo(d.donatedAt ?? d.createdAt),
      icon: <HandCoins className="h-5 w-5" />,
    })),
    ...recentCampaigns.map((c) => ({
      id: c.title,
      title: "Campaign created",
      description: c.title,
      time: timeAgo(c.createdAt),
      icon: <Target className="h-5 w-5" />,
    })),
  ]
    .sort((a, b) => 0) // already sorted by recency from DB
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <WelcomeBanner userName={userName} />

      <StatsGrid stats={stats} />

      <div className="grid gap-8 xl:grid-cols-3">
        <div className="xl:col-span-1">
          <QuickActionsWithLinks actions={quickActions} />
        </div>

        <div className="xl:col-span-2">
          <RecentActivity activities={activities} />
        </div>
      </div>
    </div>
  );
}

// Wrapper that adds link navigation to QuickActions
function QuickActionsWithLinks({
  actions,
}: {
  actions: { id: string; title: string; description: string; icon: React.ReactNode; href: string }[];
}) {
  return (
    <section
      aria-labelledby="quick-actions-heading"
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="mb-5">
        <h2
          id="quick-actions-heading"
          className="text-lg font-semibold text-slate-900"
        >
          Quick Actions
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Frequently used shortcuts to manage your platform.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {actions.map((action) => (
          <Link
            key={action.id}
            href={action.href}
            className="flex items-start gap-4 rounded-xl border border-slate-200 p-4 transition-all duration-200 hover:border-emerald-500 hover:bg-emerald-50 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
              {action.icon}
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-slate-900">{action.title}</h3>
              <p className="mt-1 text-sm text-slate-500">{action.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
