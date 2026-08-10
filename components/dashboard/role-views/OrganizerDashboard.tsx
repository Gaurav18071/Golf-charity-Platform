import Link from "next/link";
import {
  PlusCircle,
  FolderKanban,
  Building2,
  HandCoins,
  Target,
  TrendingUp,
  FileText,
  CheckCircle2,
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
import { VerificationCard } from "@/components/dashboard/organizer/VerificationCard";
import type { OrganizationVerificationStatus } from "@prisma/client";

interface OrganizerDashboardProps {
  userName: string;
  organization?: {
    id: string;
    name: string;
    verificationStatus: OrganizationVerificationStatus;
    submittedAt?: Date | string | null;
    reviewedAt?: Date | string | null;
    adminNotes?: string | null;
  } | null;
  completionPercentage?: number;
  stats: {
    totalCampaigns: number;
    activeCampaigns: number;
    totalRaised: number;
    totalDonations: number;
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
 * Comprehensive dashboard overview for verified ORGANIZER role.
 */
export function OrganizerDashboard({
  userName,
  organization,
  completionPercentage = 100,
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
      id: "total-donations",
      title: "Total Donations",
      value: stats.totalDonations,
      icon: <HandCoins className="h-6 w-6" />,
      description: "Completed contributions",
      variant: "amber",
    },
    {
      id: "total-raised",
      title: "Total Raised",
      value: formatCurrency(stats.totalRaised),
      icon: <TrendingUp className="h-6 w-6" />,
      description: "Across all campaigns",
      variant: "blue",
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
      id: "organization",
      title: "Organization Profile",
      description: "View & edit organization info",
      href: "/organizer/organization",
      icon: Building2,
    },
    {
      id: "documents",
      title: "Manage Documents",
      description: "Upload & review verification files",
      href: "/organizer/documents",
      icon: FileText,
    },
    {
      id: "campaigns",
      title: "My Campaigns",
      description: "Manage existing campaigns",
      href: "/campaigns",
      icon: FolderKanban,
    },
  ];

  const verificationStatus = organization?.verificationStatus ?? "APPROVED";

  return (
    <div className="space-y-6">
      <WelcomeBannerWidget
        userName={userName}
        role="ORGANIZER"
        subtitle={
          organization?.name
            ? `Managing ${organization.name}. Welcome to your organizer workspace.`
            : "Manage your organization, campaigns, and track fundraising impact."
        }
        actions={
          <Link
            href="/campaigns/new"
            className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-emerald-800 shadow-sm transition hover:bg-emerald-50"
          >
            + New Campaign
          </Link>
        }
      />

      {/* Organization Status & Verification Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <VerificationCard
            status={verificationStatus}
            organizationId={organization?.id}
            submittedAt={organization?.submittedAt}
            reviewedAt={organization?.reviewedAt}
            adminNotes={organization?.adminNotes}
          />
        </div>

        {/* Profile Completion Indicator */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700">
                Organization Profile
              </span>
              <span className="text-sm font-bold text-emerald-600">
                {completionPercentage}%
              </span>
            </div>
            <div className="mt-3 h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <p className="mt-3 text-xs text-slate-500">
              {completionPercentage >= 100
                ? "Your organization details and required legal documents are complete."
                : "Complete all required fields and document uploads for fast verification."}
            </p>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">
              {organization?.name || "Organization"}
            </span>
            <Link
              href="/organizer/organization"
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
            >
              View Profile →
            </Link>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <StatsGrid stats={statItems} />

      {/* Quick Actions & Recent Donations */}
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
