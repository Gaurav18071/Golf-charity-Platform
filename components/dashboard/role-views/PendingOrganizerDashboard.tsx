import Link from "next/link";
import { Building2, BadgeCheck, HandCoins, BookOpen } from "lucide-react";
import {
  WelcomeBannerWidget,
  ProgressCard,
  QuickActionsWidget,
  RecentDonationsWidget,
  type QuickAction,
  type RecentDonationItem,
  type ProgressStep,
} from "@/components/dashboard/widgets";

interface PendingOrganizerDashboardProps {
  userName: string;
  verificationStatus: "PENDING" | "VERIFIED" | "REJECTED";
  profileCompletion: number;   // 0–100
  recentDonations: RecentDonationItem[];
}

function buildVerificationSteps(
  status: "PENDING" | "VERIFIED" | "REJECTED"
): ProgressStep[] {
  return [
    {
      id: "submitted",
      title: "Application Submitted",
      description: "Your organizer request has been received.",
      status: "completed",
    },
    {
      id: "review",
      title: "Under Review",
      description: "Our team is reviewing your application.",
      status: status === "PENDING" ? "current" : "completed",
    },
    {
      id: "decision",
      title: status === "REJECTED" ? "Changes Requested" : "Approved",
      description:
        status === "REJECTED"
          ? "Please update your organization profile."
          : status === "VERIFIED"
            ? "Your account has been approved."
            : "Awaiting final decision.",
      status:
        status === "VERIFIED"
          ? "completed"
          : status === "REJECTED"
            ? "current"
            : "pending",
    },
  ];
}

/**
 * PendingOrganizerDashboard
 *
 * Dashboard for users who applied as organizers and are awaiting approval.
 */
export function PendingOrganizerDashboard({
  userName,
  verificationStatus,
  profileCompletion,
  recentDonations,
}: PendingOrganizerDashboardProps) {
  const steps = buildVerificationSteps(verificationStatus);

  const quickActions: QuickAction[] = [
    {
      id: "org-profile",
      title: "Complete Organization Profile",
      description: "Fill in all required details",
      href: "/organizer/profile",
      icon: Building2,
      variant: "primary",
    },
    {
      id: "verification",
      title: "Track Verification",
      description: "Check your application status",
      href: "/organizer/verification",
      icon: BadgeCheck,
    },
    {
      id: "browse",
      title: "Browse Campaigns",
      description: "Explore active campaigns",
      href: "/campaigns/browse",
      icon: BookOpen,
    },
    {
      id: "donations",
      title: "My Donations",
      description: "View your donation history",
      href: "/donations",
      icon: HandCoins,
    },
  ];

  const statusBadge = (
    <span className={[
      "rounded-full px-3 py-1 text-xs font-semibold",
      verificationStatus === "PENDING"  ? "bg-amber-100 text-amber-700" :
      verificationStatus === "VERIFIED" ? "bg-emerald-100 text-emerald-700" :
                                          "bg-red-100 text-red-700",
    ].join(" ")}>
      {verificationStatus === "PENDING" ? "Under Review" :
       verificationStatus === "VERIFIED" ? "Approved" : "Changes Requested"}
    </span>
  );

  return (
    <div className="space-y-6">
      <WelcomeBannerWidget
        userName={userName}
        role="PENDING_ORGANIZER"
        subtitle="Complete your organization profile to unlock campaign creation."
        actions={
          <Link
            href="/organizer/profile"
            className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-amber-800 shadow-sm transition hover:bg-amber-50"
          >
            Complete Profile
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Verification progress */}
        <ProgressCard
          title="Verification Status"
          description="Track your organizer application progress."
          steps={steps}
          percentage={
            verificationStatus === "PENDING" ? 60 :
            verificationStatus === "VERIFIED" ? 100 : 40
          }
          badge={statusBadge}
        />

        {/* Profile completion */}
        <ProgressCard
          title="Profile Completion"
          description="Complete your organization profile to speed up verification."
          steps={[
            {
              id: "basic",
              title: "Basic Information",
              status: profileCompletion >= 25 ? "completed" : "current",
            },
            {
              id: "docs",
              title: "Upload Documents",
              status:
                profileCompletion >= 50 ? "completed" :
                profileCompletion >= 25 ? "current" : "pending",
            },
            {
              id: "bank",
              title: "Bank Details",
              status:
                profileCompletion >= 75 ? "completed" :
                profileCompletion >= 50 ? "current" : "pending",
            },
            {
              id: "review",
              title: "Ready for Review",
              status: profileCompletion === 100 ? "completed" : "pending",
            },
          ]}
          percentage={profileCompletion}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-5">
        <div className="xl:col-span-2">
          <QuickActionsWidget actions={quickActions} />
        </div>
        <div className="xl:col-span-3">
          <RecentDonationsWidget donations={recentDonations} />
        </div>
      </div>
    </div>
  );
}
