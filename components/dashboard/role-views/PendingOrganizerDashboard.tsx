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
  verificationStatus: "DRAFT" | "PENDING" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";
  profileCompletion: number;   // 0–100
  recentDonations: RecentDonationItem[];
}

function buildVerificationSteps(
  status: "DRAFT" | "PENDING" | "UNDER_REVIEW" | "APPROVED" | "REJECTED"
): ProgressStep[] {
  const isApproved = status === "APPROVED";
  const isRejected = status === "REJECTED";
  const isUnderReview = status === "UNDER_REVIEW" || status === "PENDING";

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
      status: isUnderReview || isApproved || isRejected ? "completed" : "current",
    },
    {
      id: "decision",
      title: isRejected ? "Changes Requested" : isApproved ? "Approved" : "Decision Pending",
      description:
        isRejected
          ? "Please update your organization profile."
          : isApproved
            ? "Your account has been approved."
            : "Awaiting final decision.",
      status:
        isApproved
          ? "completed"
          : isRejected
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
      verificationStatus === "APPROVED" ? "bg-emerald-100 text-emerald-700" :
      verificationStatus === "REJECTED" ? "bg-red-100 text-red-700" :
      verificationStatus === "UNDER_REVIEW" ? "bg-blue-100 text-blue-700" :
      verificationStatus === "PENDING" ? "bg-amber-100 text-amber-700" :
      "bg-gray-100 text-gray-700",
    ].join(" ")}>
      {verificationStatus === "APPROVED" ? "Approved" :
       verificationStatus === "REJECTED" ? "Changes Requested" :
       verificationStatus === "UNDER_REVIEW" ? "Under Review" :
       verificationStatus === "PENDING" ? "Pending Review" : "Draft"}
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
            verificationStatus === "APPROVED" ? 100 :
            verificationStatus === "REJECTED" ? 40 :
            verificationStatus === "UNDER_REVIEW" || verificationStatus === "PENDING" ? 60 :
            20
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
