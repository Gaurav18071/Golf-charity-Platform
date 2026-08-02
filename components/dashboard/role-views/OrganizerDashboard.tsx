import Link from "next/link";
import {
  PlusCircle,
  FolderKanban,
  BarChart2,
  HandCoins,
  Target,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import {
  WelcomeBannerWidget,
  StatsGrid,
  QuickActionsWidget,
  RecentDonationsWidget,
  type StatItem,
  type QuickAction,
  type RecentDonationItem,
} from "@/components/dashboard/widgets";

interface OrganizerDashboardProps {
  userName: string;
  stats: {
    totalCampaigns: number;
    activeCampaigns: number;
    totalRaised: number;
    pendingWithdrawals: number;
  };
  recentDonations: RecentDonationItem[];
}

function formatCurrency(n: number) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n}`;
}

/**
 * OrganizerDashboard
 *
 * Dashboard view for verified ORGANIZER role.
 */
export function OrganizerDashboard({
  userName,
  stats,
  recentDonations,
}: OrganizerDashboardProps) {
  const statItems: StatItem[] = [
    {
      id: "total-campaigns",
      title: "Total Campaigns",
      value: stats.totalCampaigns,
      icon: <Target className="h-6 w-6" />,
      description: "All campaigns created",
      variant: "slate",
    },
    {
      id: "active-campaigns",
      title: "Active Campaigns",
      value: stats.activeCampaigns,
      icon: <FolderKanban className="h-6 w-6" />,
      description: "Currently live",
      variant: "emerald",
    },
    {
      id: "total-raised",
      title: "Total Raised",
      value: formatCurrency(stats.totalRaised),
      icon: <TrendingUp className="h-6 w-6" />,
      description: "Across all campaigns",
      variant: "blue",
    },
    {
      id: "pending-withdrawals",
      title: "Pending Withdrawals",
      value: formatCurrency(stats.pendingWithdrawals),
      icon: <Wallet className="h-6 w-6" />,
      description: "Awaiting processing",
      variant: "amber",
    },
  ];

  const quickActions: QuickAction[] = [
    {
      id: "create",
      title: "Create Campaign",
      description: "Launch a new fundraiser",
      href: "/campaigns/new",
      icon: PlusCircle,
      variant: "primary",
    },
    {
      id: "manage",
      title: "My Campaigns",
      description: "Manage existing campaigns",
      href: "/campaigns",
      icon: FolderKanban,
    },
    {
      id: "analytics",
      title: "Analytics",
      description: "Track campaign performance",
      href: "/analytics",
      icon: BarChart2,
    },
    {
      id: "donations",
      title: "Donations",
      description: "Review incoming donations",
      href: "/donations",
      icon: HandCoins,
    },
  ];

  return (
    <div className="space-y-6">
      <WelcomeBannerWidget
        userName={userName}
        role="ORGANIZER"
        subtitle="Manage your campaigns and track your fundraising impact."
        actions={
          <Link
            href="/campaigns/new"
            className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-emerald-800 shadow-sm transition hover:bg-emerald-50"
          >
            + New Campaign
          </Link>
        }
      />

      <StatsGrid stats={statItems} />

      <div className="grid gap-6 xl:grid-cols-5">
        <div className="xl:col-span-2">
          <QuickActionsWidget actions={quickActions} />
        </div>
        <div className="xl:col-span-3">
          <RecentDonationsWidget
            donations={recentDonations}
            title="Recent Campaign Donations"
          />
        </div>
      </div>
    </div>
  );
}
