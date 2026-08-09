import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Building2 } from "lucide-react";
import { ProgressCard } from "@/components/dashboard/widgets";
import type { ProgressStep } from "@/components/dashboard/widgets";
import { requireAuth } from "@/features/organization/utils/organization-guards";
import { getOrganizationByProfileId } from "@/features/organization/services/organization.service";

export const dynamic = "force-dynamic";

function buildSteps(status: "PENDING" | "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "DRAFT"):
  ProgressStep[] {
  const isApproved = status === "APPROVED";
  const isRejected = status === "REJECTED";
  const isUnderReview = status === "UNDER_REVIEW";
  const isPending = status === "PENDING";

  return [
    {
      id: "submitted",
      title: "Application Submitted",
      description: "Your organizer request has been received by the platform.",
      status: "completed",
    },
    {
      id: "profile",
      title: "Organization Profile Reviewed",
      description: "Our team is reviewing your organization details.",
      status: isApproved || isRejected || isUnderReview || isPending ? "completed" : "current",
    },
    {
      id: "documents",
      title: "Documents Verified",
      description: "Registration, PAN and bank details verified.",
      status: isApproved ? "completed" : isRejected ? "current" : "pending",
    },
    {
      id: "decision",
      title: isRejected ? "Changes Requested" : isApproved ? "Account Approved" : "Decision Pending",
      description: isApproved
        ? "Congratulations! You can now create and manage campaigns."
        : isRejected
          ? "Please update your organization profile and resubmit."
          : "Final approval pending — we'll notify you by email.",
      status: isApproved ? "completed" : isRejected ? "current" : "pending",
    },
  ];
}

export default async function VerificationStatusPage() {
  const { profile } = await requireAuth();

  if (profile.role === "ADMIN") {
    redirect("/dashboard");
  }

  if (!["PENDING_ORGANIZER", "ORGANIZER"].includes(profile.role)) {
    redirect("/dashboard");
  }

  const organization = await getOrganizationByProfileId(profile.id, false);

  const verificationStatus = organization?.verificationStatus ?? "DRAFT";

  const steps = buildSteps(verificationStatus);

  const pct =
    verificationStatus === "APPROVED"
      ? 100
      : verificationStatus === "REJECTED"
        ? 40
        : verificationStatus === "UNDER_REVIEW" || verificationStatus === "PENDING"
          ? 60
          : 20;

  const STATUS_META: Record<string, { label: string; color: string }> = {
    DRAFT: { label: "Draft", color: "bg-gray-100 text-gray-700" },
    PENDING: { label: "Under Review", color: "bg-amber-100 text-amber-700" },
    UNDER_REVIEW: { label: "Under Review", color: "bg-blue-100 text-blue-700" },
    APPROVED: { label: "Approved", color: "bg-emerald-100 text-emerald-700" },
    REJECTED: { label: "Changes Requested", color: "bg-red-100 text-red-700" },
  };

  const meta = STATUS_META[verificationStatus] ?? STATUS_META.DRAFT;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/organizer/profile"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Verification Status</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Track your organizer application progress.
          </p>
        </div>
        <span className={`ml-auto rounded-full px-3 py-1 text-xs font-semibold ${meta.color}`}>
          {meta.label}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ProgressCard
            title="Application Progress"
            description="Each step is reviewed by our moderation team."
            steps={steps}
            percentage={pct}
          />
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-slate-900">What happens next?</h2>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                Our team reviews your organization profile and documents within 2–3 business days.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                You'll receive an email notification when the decision is made.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                Once approved, you can immediately create and publish campaigns.
              </li>
            </ul>
          </div>

          {verificationStatus === "REJECTED" && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
              <h2 className="mb-2 text-sm font-semibold text-red-800">Action Required</h2>
              <p className="mb-4 text-sm text-red-700">
                Please review and update your organization profile, then resubmit for approval.
              </p>
              <Link
                href="/organizer/profile"
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                <Building2 className="h-4 w-4" />
                Update Profile
              </Link>
            </div>
          )}

          {verificationStatus === "PENDING" || verificationStatus === "UNDER_REVIEW" ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <h2 className="mb-2 text-sm font-semibold text-amber-800">While you wait…</h2>
              <p className="mb-4 text-sm text-amber-700">
                Make sure your organization profile is complete to avoid delays.
              </p>
              <Link
                href="/organizer/profile"
                className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-700"
              >
                <Building2 className="h-4 w-4" />
                Complete Profile
              </Link>
            </div>
          ) : null}

          {verificationStatus === "APPROVED" && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
              <h2 className="mb-2 text-sm font-semibold text-emerald-800">You&apos;re all set!</h2>
              <p className="mb-4 text-sm text-emerald-700">
                Your account is verified. Start creating campaigns today.
              </p>
              <Link
                href="/campaigns/new"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                Create Campaign
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
