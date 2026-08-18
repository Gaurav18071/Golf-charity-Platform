import Link from "next/link";
import { notFound } from "next/navigation";
import { FileText, ShieldCheck, ClipboardList } from "lucide-react";
import { requireAdmin } from "@/features/organization/utils/organization-guards";
import { getOrganizationForAdminReview } from "@/features/organization/services/organization.service";
import {
  approveOrganizationFormAction,
  rejectOrganizationFormAction,
  requestChangesOrganizationFormAction,
} from "@/features/organization";
import { AdminDocumentActions } from "@/components/dashboard/admin/AdminDocumentActions";
import { AdminDecisionForms } from "@/components/dashboard/admin/AdminDecisionForms";
import {
  VERIFICATION_STATUS_COLORS,
  DOCUMENT_STATUS_COLORS,
  DOCUMENT_TYPE_LABELS,
  DOCUMENT_STATUS_LABELS,
} from "@/features/organization/constants/organization.constants";

export const dynamic = "force-dynamic";

function formatDate(date: Date | null) {
  if (!date) return "—";
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function maskBankAccount(account: string) {
  if (!account) return "—";
  const visible = account.slice(-4);
  return `${"*".repeat(Math.max(4, account.length - 4))}${visible}`;
}

function getStatusClass(status: string) {
  return (
    VERIFICATION_STATUS_COLORS[
      status as keyof typeof VERIFICATION_STATUS_COLORS
    ] ?? "bg-slate-100 text-slate-700"
  );
}

function getDocumentStatusClass(status: string) {
  return (
    DOCUMENT_STATUS_COLORS[
      status as keyof typeof DOCUMENT_STATUS_COLORS
    ] ?? "bg-slate-100 text-slate-700"
  );
}

export default async function AdminOrganizationReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  await requireAdmin();

  const organization = await getOrganizationForAdminReview(id);

  if (!organization) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusClass(organization.verificationStatus)}`}> 
              {organization.verificationStatus}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{organization.name}</h1>
          <p className="mt-1 text-sm text-slate-500">
            Submitted {formatDate(organization.submittedAt)}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/organizations"
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Back to List
          </Link>
          <Link
            href="#review-actions"
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
          >
            Review Actions
          </Link>
        </div>
      </div>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Organization Overview</h2>
            <span className="text-xs font-semibold uppercase text-slate-500">
              {organization.type}
            </span>
          </div>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Organization Name
              </dt>
              <dd className="mt-1 text-sm font-semibold text-slate-900">
                {organization.name}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Website
              </dt>
              <dd className="mt-1 text-sm text-slate-700">
                {organization.website || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Email
              </dt>
              <dd className="mt-1 text-sm text-slate-700">{organization.email}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Phone
              </dt>
              <dd className="mt-1 text-sm text-slate-700">{organization.phone}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Description
              </dt>
              <dd className="mt-1 text-sm text-slate-700">
                {organization.description}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Logo
              </dt>
              <dd className="mt-1 text-sm text-slate-700">
                {organization.logoUrl ? "Attached" : "Not uploaded"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Cover Image
              </dt>
              <dd className="mt-1 text-sm text-slate-700">
                {organization.coverImageUrl ? "Attached" : "Not uploaded"}
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Address</h2>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              Registered Location
            </span>
          </div>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Address
              </dt>
              <dd className="mt-1 text-sm text-slate-700">{organization.address}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                City
              </dt>
              <dd className="mt-1 text-sm text-slate-700">{organization.city}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                State
              </dt>
              <dd className="mt-1 text-sm text-slate-700">{organization.state}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Country
              </dt>
              <dd className="mt-1 text-sm text-slate-700">{organization.country}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Postal Code
              </dt>
              <dd className="mt-1 text-sm text-slate-700">{organization.postalCode}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Legal Information</h2>
            <ShieldCheck className="h-5 w-5 text-slate-500" />
          </div>
          <dl className="grid grid-cols-1 gap-4">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Registration Number
              </dt>
              <dd className="mt-1 text-sm text-slate-700">{organization.registrationNo}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                PAN Number
              </dt>
              <dd className="mt-1 text-sm text-slate-700">{organization.panNumber}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                GST Number
              </dt>
              <dd className="mt-1 text-sm text-slate-700">{organization.gstNumber || "—"}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Tax Exemption Number
              </dt>
              <dd className="mt-1 text-sm text-slate-700">{organization.taxExemptionNo || "—"}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Bank Information</h2>
            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
              Sensitive
            </span>
          </div>
          <dl className="grid grid-cols-1 gap-4">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Account Holder
              </dt>
              <dd className="mt-1 text-sm text-slate-700">{organization.accountHolder}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Bank Name
              </dt>
              <dd className="mt-1 text-sm text-slate-700">{organization.bankName}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Account Number
              </dt>
              <dd className="mt-1 text-sm text-slate-700">
                {maskBankAccount(organization.accountNumber)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                IFSC
              </dt>
              <dd className="mt-1 text-sm text-slate-700">{organization.ifscCode}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Branch
              </dt>
              <dd className="mt-1 text-sm text-slate-700">{organization.branchName}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Documents</h2>
          <span className="text-sm font-semibold text-slate-500">
            {organization.documents.length} uploaded
          </span>
        </div>
        <div className="space-y-3">
          {organization.documents.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500">
              No documents uploaded
            </div>
          )}

          {organization.documents.map((document) => (
            <div
              key={document.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-slate-100 p-2">
                  <FileText className="h-4 w-4 text-slate-700" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    {DOCUMENT_TYPE_LABELS[document.documentType]}
                  </div>
                  <div className="text-xs text-slate-500">
                    {document.originalFileName} • {document.fileSize} bytes
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getDocumentStatusClass(document.verificationStatus)}`}> 
                  {DOCUMENT_STATUS_LABELS[document.verificationStatus]}
                </span>
                <AdminDocumentActions
                  documentId={document.id}
                  fileName={document.originalFileName}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Verification History</h2>
          <ClipboardList className="h-5 w-5 text-slate-500" />
        </div>
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Current Status
            </dt>
            <dd className="mt-1 text-sm font-semibold text-slate-900">
              {organization.verificationStatus}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Submitted At
            </dt>
            <dd className="mt-1 text-sm text-slate-700">
              {formatDate(organization.submittedAt)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Reviewed At
            </dt>
            <dd className="mt-1 text-sm text-slate-700">
              {formatDate(organization.reviewedAt)}
            </dd>
          </div>
          <div className="sm:col-span-3">
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Admin Notes
            </dt>
            <dd className="mt-1 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
              {organization.adminNotes || "—"}
            </dd>
          </div>
        </dl>
      </section>

      <section id="review-actions" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Admin Decision</h2>
        </div>
        <AdminDecisionForms
          organizationId={organization.id}
          currentStatus={organization.verificationStatus}
        />
      </section>
    </div>
  );
}
