import Link from "next/link";
import { ClipboardList, CheckCircle2, XCircle } from "lucide-react";
import { AdminDataTable } from "@/components/dashboard/admin/AdminDataTable";
import { StatsGrid } from "@/components/dashboard/widgets";
import type { StatItem } from "@/components/dashboard/widgets";
import { requireAdmin } from "@/features/organization/utils/organization-guards";
import {
  getOrganizationsForAdminReview,
  getOrganizationsPendingReview,
} from "@/features/organization/services/organization.service";
import { VERIFICATION_STATUS_COLORS } from "@/features/organization/constants/organization.constants";

export const dynamic = "force-dynamic";

function formatDate(d: Date | null) {
  if (!d) return "—";
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getStatusClass(status: string) {
  return (
    VERIFICATION_STATUS_COLORS[status as keyof typeof VERIFICATION_STATUS_COLORS] ??
    "bg-slate-100 text-slate-700"
  );
}

export default async function OrganizerRequestsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdmin();

  const rawParams = searchParams ? await searchParams : {};

  const query =
    typeof rawParams.q === "string"
      ? rawParams.q.trim()
      : typeof rawParams.q === "object" && rawParams.q
        ? String(rawParams.q[0] ?? "")
        : "";

  const requestedStatus =
    typeof rawParams.status === "string"
      ? rawParams.status
      : typeof rawParams.status === "object" && rawParams.status
        ? String(rawParams.status[0] ?? "")
        : "";

  const normalizedStatus =
    requestedStatus &&
    ["DRAFT", "PENDING", "UNDER_REVIEW", "APPROVED", "REJECTED"].includes(requestedStatus)
      ? requestedStatus
      : undefined;

  const [reviewRows, pendingReview, draftCount, rejectedCount, approvedCount] = await Promise.all([
    getOrganizationsForAdminReview({
      status: normalizedStatus as any,
      search: query || undefined,
      page: 1,
      pageSize: 50,
      sortBy: "submittedAt",
      sortOrder: "desc",
    }),
    getOrganizationsPendingReview(),
    getOrganizationsForAdminReview({ status: "DRAFT" }),
    getOrganizationsForAdminReview({ status: "REJECTED" }),
    getOrganizationsForAdminReview({ status: "APPROVED" }),
  ]);

  const stats: StatItem[] = [
    {
      id: "draft",
      title: "Drafts (In Setup)",
      value: draftCount.total,
      icon: <ClipboardList className="h-6 w-6" />,
      variant: "slate",
    },
    {
      id: "pending",
      title: "Pending Review",
      value: pendingReview.length,
      icon: <ClipboardList className="h-6 w-6" />,
      variant: "amber",
    },
    {
      id: "approved",
      title: "Approved",
      value: approvedCount.total,
      icon: <CheckCircle2 className="h-6 w-6" />,
      variant: "emerald",
    },
    {
      id: "rejected",
      title: "Rejected",
      value: rejectedCount.total,
      icon: <XCircle className="h-6 w-6" />,
      variant: "red",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Organization Verification</h1>
          <p className="mt-1 text-sm text-slate-500">Admin review queue</p>
        </div>
        <form className="flex items-center gap-2" method="GET">
          <input
            name="q"
            defaultValue={query}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-500"
            placeholder="Search organizations"
          />
          <select
            name="status"
            defaultValue={normalizedStatus ?? ""}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-500"
          >
            <option value="">All statuses</option>
            <option value="DRAFT">Draft (Unsubmitted)</option>
            <option value="PENDING">Pending Review</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
          <button className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
            Filter
          </button>
        </form>
      </div>

      <StatsGrid stats={stats} cols={4} />

      <AdminDataTable
        rows={reviewRows.organizations}
        rowKey={(r) => r.id}
        emptyMessage="No matching organization reviews found."
        emptyIcon={<ClipboardList className="h-10 w-10" />}
        columns={[
          {
            key: "name",
            header: "Organization Name",
            render: (r) => (
              <div>
                <p className="text-sm font-semibold text-slate-900">{r.name}</p>
                <p className="text-xs text-slate-500">{r.profile.fullName}</p>
              </div>
            ),
          },
          {
            key: "type",
            header: "Organization Type",
            render: (r) => (
              <span className="text-sm text-slate-600">{r.type}</span>
            ),
          },
          {
            key: "owner",
            header: "Owner Name",
            render: (r) => (
              <span className="text-sm text-slate-600">{r.profile.fullName}</span>
            ),
          },
          {
            key: "email",
            header: "Email",
            render: (r) => (
              <span className="text-sm text-slate-600">{r.email}</span>
            ),
          },
          {
            key: "submittedAt",
            header: "Submission Date",
            render: (r) => (
              <span className="text-sm text-slate-500">
                {formatDate(r.submittedAt)}
              </span>
            ),
          },
          {
            key: "status",
            header: "Verification Status",
            render: (r) => (
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusClass(r.verificationStatus)}`}>
                {r.verificationStatus}
              </span>
            ),
          },
          {
            key: "documents",
            header: "Number of Documents",
            render: (r) => (
              <span className="text-sm font-medium text-slate-700">
                {r.documentsCount}
              </span>
            ),
          },
          {
            key: "action",
            header: "Action",
            render: (r) => (
              <Link
                href={`/admin/organizations/${r.id}`}
                className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition-colors"
              >
                Review
              </Link>
            ),
          },
        ]}
      />
    </div>
  );
}
