import Link from "next/link";
import {
  Users,
  Target,
  HandCoins,
  TrendingUp,
  ClipboardList,
  CheckSquare,
  CreditCard,
  BarChart3,
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

interface AdminDashboardProps {
  userName: string;
  stats: {
    totalUsers: number;
    totalCampaigns: number;
    totalDonations: number;
    totalRevenue: number;
    pendingOrganizerRequests: number;
    pendingCampaignApprovals: number;
  };
  recentDonations: RecentDonationItem[];
}

function formatCurrency(n: number) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n}`;
}

/**
 * AdminDashboard
 *
 * Dashboard view for ADMIN role — platform-wide overview.
 */
export function AdminDashboard({
  userName,
  stats,
  recentDonations,
}: AdminDashboardProps) {
  const statItems: StatItem[] = [
    {
      id: "users",
      title: "Total Users",
      value: stats.totalUsers,
      icon: <Users className="h-6 w-6" />,
      description: "Registered platform users",
      variant: "blue",
    },
    {
      id: "campaigns",
      title: "Total Campaigns",
      value: stats.totalCampaigns,
      icon: <Target className="h-6 w-6" />,
      description: "All time",
      variant: "emerald",
    },
    {
      id: "donations",
      title: "Total Donations",
      value: stats.totalDonations,
      icon: <HandCoins className="h-6 w-6" />,
      description: "Completed transactions",
      variant: "purple",
    },
    {
      id: "revenue",
      title: "Platform Revenue",
      value: formatCurrency(stats.totalRevenue),
      icon: <TrendingUp className="h-6 w-6" />,
      description: "Total raised across all campaigns",
      variant: "amber",
    },
  ];

  const quickActions: QuickAction[] = [
    {
      id: "org-requests",
      title: "Organizer Requests",
      description: `${stats.pendingOrganizerRequests} pending`,
      href: "/admin/organizer-requests",
      icon: ClipboardList,
      variant: "primary",
    },
    {
      id: "approvals",
      title: "Campaign Approvals",
      description: `${stats.pendingCampaignApprovals} pending`,
      href: "/admin/campaign-approvals",
      icon: CheckSquare,
      variant: stats.pendingCampaignApprovals > 0 ? "primary" : "default",
    },
    {
      id: "users",
      title: "User Management",
      description: "View and manage all users",
      href: "/admin/users",
      icon: Users,
    },
    {
      id: "payments",
      title: "Payment Management",
      description: "Review transactions",
      href: "/admin/payments",
      icon: CreditCard,
    },
    {
      id: "reports",
      title: "Reports & Analytics",
      description: "Platform performance",
      href: "/admin/reports",
      icon: BarChart3,
    },
  ];

  return (
    <div className="space-y-6">
      <WelcomeBannerWidget
        userName={userName}
        role="ADMIN"
        subtitle="Monitor platform activity and manage users, campaigns, and payments."
        actions={
          <Link
            href="/admin/reports"
            className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
          >
            View Reports
          </Link>
        }
      />

      <StatsGrid stats={statItems} />

      {/* Pending approvals alert */}
      {(stats.pendingOrganizerRequests > 0 || stats.pendingCampaignApprovals > 0) && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
          <strong>Action required:</strong>{" "}
          {stats.pendingOrganizerRequests > 0 && (
            <Link href="/admin/organizer-requests" className="underline hover:opacity-80 mr-3">
              {stats.pendingOrganizerRequests} organizer request{stats.pendingOrganizerRequests > 1 ? "s" : ""}
            </Link>
          )}
          {stats.pendingCampaignApprovals > 0 && (
            <Link href="/admin/campaign-approvals" className="underline hover:opacity-80">
              {stats.pendingCampaignApprovals} campaign approval{stats.pendingCampaignApprovals > 1 ? "s" : ""}
            </Link>
          )}
          {" "}awaiting review.
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-5">
        <div className="xl:col-span-2">
          <QuickActionsWidget
            title="Admin Actions"
            description="Platform management shortcuts."
            actions={quickActions}
          />
        </div>
        <div className="xl:col-span-3">
          <RecentDonationsWidget
            donations={recentDonations}
            title="Recent Platform Donations"
            viewAllHref="/admin/payments"
          />
        </div>
      </div>
    </div>
  );
}
