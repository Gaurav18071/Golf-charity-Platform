import Link from "next/link";
import {
  BadgeCheck,
  Clock,
  AlertTriangle,
  FileEdit,
  PlusCircle,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";
import type { OrganizationVerificationStatus } from "@prisma/client";
import { SubmitForReviewButton } from "./SubmitForReviewButton";

interface VerificationCardProps {
  status: OrganizationVerificationStatus;
  organizationId?: string;
  submittedAt?: Date | string | null;
  reviewedAt?: Date | string | null;
  adminNotes?: string | null;
  className?: string;
}

function formatDate(d: Date | string | null | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function VerificationCard({
  status,
  organizationId,
  submittedAt,
  reviewedAt,
  adminNotes,
  className = "",
}: VerificationCardProps) {
  const getStatusConfig = () => {
    switch (status) {
      case "DRAFT":
        return {
          title: "Organization Profile Draft",
          badgeLabel: "Draft",
          badgeColor: "bg-slate-100 text-slate-700 border-slate-200",
          cardBorder: "border-slate-200 bg-white",
          icon: FileEdit,
          iconColor: "text-slate-600 bg-slate-100",
          message:
            "Complete your organization profile details and click 'Submit for Review' to request verification from admin.",
          primaryAction: organizationId ? null : {
            label: "Continue Setup",
            href: "/organizer/profile",
            icon: ArrowRight,
          },
        };

      case "PENDING":
        return {
          title: "Application Submitted",
          badgeLabel: "Pending Review",
          badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
          cardBorder: "border-amber-200 bg-amber-50/40",
          icon: Clock,
          iconColor: "text-amber-600 bg-amber-100",
          message:
            "Application submitted. Your details are waiting for admin review.",
          primaryAction: {
            label: "View Verification Status",
            href: "/organizer/verification",
            icon: ArrowRight,
          },
        };

      case "UNDER_REVIEW":
        return {
          title: "Application Under Review",
          badgeLabel: "Under Review",
          badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
          cardBorder: "border-blue-200 bg-blue-50/40",
          icon: Clock,
          iconColor: "text-blue-600 bg-blue-100",
          message:
            "Application is currently being reviewed by our compliance team. We will notify you once complete.",
          primaryAction: {
            label: "Check Progress",
            href: "/organizer/verification",
            icon: ArrowRight,
          },
        };

      case "APPROVED":
        return {
          title: "Organization Verified",
          badgeLabel: "Verified",
          badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
          cardBorder: "border-emerald-200 bg-emerald-50/30",
          icon: BadgeCheck,
          iconColor: "text-emerald-600 bg-emerald-100",
          message:
            "Your organization is verified! Campaign creation is available.",
          primaryAction: {
            label: "Create Campaign",
            href: "/campaigns/new",
            icon: PlusCircle,
          },
        };

      case "REJECTED":
        return {
          title: "Application Rejected / Action Required",
          badgeLabel: "Rejected",
          badgeColor: "bg-red-100 text-red-800 border-red-200",
          cardBorder: "border-red-200 bg-red-50/40",
          icon: ShieldAlert,
          iconColor: "text-red-600 bg-red-100",
          message:
            "Application rejected. Please review feedback from the administration team and resubmit.",
          primaryAction: {
            label: "Edit & Resubmit",
            href: "/organizer/profile",
            icon: FileEdit,
          },
        };

      default:
        return {
          title: "Verification Status",
          badgeLabel: status,
          badgeColor: "bg-slate-100 text-slate-700 border-slate-200",
          cardBorder: "border-slate-200 bg-white",
          icon: AlertTriangle,
          iconColor: "text-slate-600 bg-slate-100",
          message: "Check your organization status details.",
          primaryAction: {
            label: "View Status",
            href: "/organizer/verification",
            icon: ArrowRight,
          },
        };
    }
  };

  const config = getStatusConfig();
  const IconComponent = config.icon;
  const ActionIcon = config.primaryAction?.icon;

  return (
    <div
      className={`rounded-2xl border p-6 shadow-sm transition-all ${config.cardBorder} ${className}`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3.5">
          <div className={`rounded-xl p-3 shrink-0 ${config.iconColor}`}>
            <IconComponent className="h-6 w-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h3 className="text-lg font-bold text-slate-900">
                {config.title}
              </h3>
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${config.badgeColor}`}
              >
                {config.badgeLabel}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-600">{config.message}</p>
          </div>
        </div>

        {organizationId && (status === "DRAFT" || status === "REJECTED") ? (
          <SubmitForReviewButton organizationId={organizationId} />
        ) : (
          config.primaryAction && (
            <Link
              href={config.primaryAction.href}
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              {config.primaryAction.label}
              {ActionIcon && <ActionIcon className="h-4 w-4" />}
            </Link>
          )
        )}
      </div>

      {/* Dates metadata line */}
      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-slate-200/60 pt-3.5 text-xs text-slate-500">
        {submittedAt && (
          <div>
            <span className="font-medium text-slate-700">Submitted:</span>{" "}
            {formatDate(submittedAt)}
          </div>
        )}
        {reviewedAt && (
          <div>
            <span className="font-medium text-slate-700">Reviewed:</span>{" "}
            {formatDate(reviewedAt)}
          </div>
        )}
      </div>

      {/* Admin Notes block for REJECTED / UNDER_REVIEW */}
      {adminNotes && (status === "REJECTED" || status === "UNDER_REVIEW") && (
        <div className="mt-4 rounded-xl border border-red-200/80 bg-red-100/50 p-3.5 text-xs text-red-900">
          <p className="font-semibold uppercase tracking-wider text-red-800">
            Admin Feedback:
          </p>
          <p className="mt-1 whitespace-pre-wrap font-medium">{adminNotes}</p>
        </div>
      )}
    </div>
  );
}
