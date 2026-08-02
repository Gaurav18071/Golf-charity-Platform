import Link from "next/link";
import {
  HandCoins,
  BookOpen,
  Bookmark,
  User,
  TrendingUp,
  Target,
  Clock,
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

interface DonorDashboardProps {
  userName: string;
  stats: {
    totalDonated: number;
    campaignsSupported: number;
    activeDonations: number;
    impactScore: number;
  };
  recentDonations: RecentDonationItem[];
}

function formatCurrency(n: number) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n}`;
}

/**
 * DonorDashboard
 *
 * Dashboard view rendered for users with DONOR role.
 * Server component — receives data as props from the parent page.
 */
export function DonorDashboard({
  userName,
  stats,
  recentDonations,
}: DonorDashboardProps) {
  const statItems: StatItem[] = [
    {
      id: "total-donated",
      title: "Total Donated",
      value: formatCurrency(stats.totalDonated),
      icon: <HandCoins className="h-6 w-6" />,
      description: "Lifetime giving",
      variant: "emerald",
    },
    {
      id: "campaigns-supported",
      title: "Campaigns Supported",
      value: stats.campaignsSupported,
      icon: <Target className="h-6 w-6" />,
      description: "Across all causes",
      variant: "blue",
    },
    {
      id: "active-donations",
      title: "Active Donations",
      value: stats.activeDonations,
      icon: <Clock className="h-6 w-6" />,
      description: "Pending completion",
      variant: "amber",
    },
    {
      id: "impact",
      title: "Donation Impact",
      value: stats.impactScore,
      icon: <TrendingUp className="h-6 w-6" />,
      description: "Community impact score",
      variant: "purple",
    },
  ];

  const quickActions: QuickAction[] = [
    {
      id: "browse",
      title: "Browse Campaigns",
      description: "Discover causes to support",
      href: "/campaigns/browse",
      icon: BookOpen,
      variant: "primary",
    },
    {
      id: "donations",
      title: "My Donations",
      description: "View your giving history",
      href: "/donations",
      icon: HandCoins,
    },
    {
      id: "saved",
      title: "Saved Campaigns",
      description: "Campaigns you bookmarked",
      href: "/campaigns/saved",
      icon: Bookmark,
    },
    {
      id: "profile",
      title: "Edit Profile",
      description: "Update your information",
      href: "/profile",
      icon: User,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <WelcomeBannerWidget
        userName={userName}
        role="DONOR"
        subtitle="Thank you for making a difference through golf and giving."
        actions={
          <Link
            href="/campaigns/browse"
            className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-emerald-800 shadow-sm transition hover:bg-emerald-50"
          >
            Browse Campaigns
          </Link>
        }
      />

      {/* Stats */}
      <StatsGrid stats={statItems} />

      {/* Quick Actions + Recent Donations */}
      <div className="grid gap-6 xl:grid-cols-5">
        <div className="xl:col-span-2">
          <QuickActionsWidget
            title="Quick Actions"
            description="Jump to what matters most."
            actions={quickActions}
          />
        </div>
        <div className="xl:col-span-3">
          <RecentDonationsWidget
            donations={recentDonations}
            viewAllHref="/donations"
            title="My Recent Donations"
          />
        </div>
      </div>
    </div>
  );
}
