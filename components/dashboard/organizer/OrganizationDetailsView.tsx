import Link from "next/link";
import {
  Building2,
  MapPin,
  FileText,
  CreditCard,
  Image as ImageIcon,
  Edit,
  Globe,
  Mail,
  Phone,
  CheckCircle2,
  ShieldAlert,
  Clock,
  ArrowRight,
} from "lucide-react";
import type { OrganizationWithDocuments } from "@/features/organization/types/organization.types";
import { VerificationCard } from "./VerificationCard";

interface OrganizationDetailsViewProps {
  organization: OrganizationWithDocuments;
}

function maskAccountNumber(acc: string): string {
  if (!acc) return "—";
  if (acc.length <= 4) return acc;
  return `•••• ${acc.slice(-4)}`;
}

export function OrganizationDetailsView({
  organization,
}: OrganizationDetailsViewProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">
              {organization.name}
            </h1>
            <span className="rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-semibold text-emerald-800 border border-emerald-200">
              {organization.type}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            View and manage your organization details, legal information, and documents.
          </p>
        </div>

        <Link
          href="/organizer/organization/edit"
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 shrink-0"
        >
          <Edit className="h-4 w-4" />
          Edit Organization
        </Link>
      </div>

      {/* Verification Status Card */}
      <VerificationCard
        status={organization.verificationStatus}
        organizationId={organization.id}
        submittedAt={organization.submittedAt}
        reviewedAt={organization.reviewedAt}
        adminNotes={organization.adminNotes}
      />

      {/* Details Sections Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Details */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
              <Building2 className="h-5 w-5" />
            </div>
            <h2 className="text-base font-bold text-slate-900">
              Basic Details
            </h2>
          </div>

          <div className="space-y-3 text-sm">
            <div>
              <span className="text-xs font-medium uppercase text-slate-400">
                Organization Name
              </span>
              <p className="font-semibold text-slate-900">{organization.name}</p>
            </div>

            <div>
              <span className="text-xs font-medium uppercase text-slate-400">
                Description
              </span>
              <p className="text-slate-700 mt-0.5 leading-relaxed">
                {organization.description || "No description provided."}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <span className="text-xs font-medium uppercase text-slate-400 flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5" /> Email Address
                </span>
                <p className="font-medium text-slate-900">{organization.email}</p>
              </div>

              <div>
                <span className="text-xs font-medium uppercase text-slate-400 flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5" /> Phone Number
                </span>
                <p className="font-medium text-slate-900">{organization.phone}</p>
              </div>

              {organization.website && (
                <div className="sm:col-span-2">
                  <span className="text-xs font-medium uppercase text-slate-400 flex items-center gap-1">
                    <Globe className="h-3.5 w-3.5" /> Website
                  </span>
                  <a
                    href={organization.website}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-emerald-600 hover:underline"
                  >
                    {organization.website}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
              <MapPin className="h-5 w-5" />
            </div>
            <h2 className="text-base font-bold text-slate-900">Address</h2>
          </div>

          <div className="space-y-3 text-sm">
            <div>
              <span className="text-xs font-medium uppercase text-slate-400">
                Street Address
              </span>
              <p className="font-semibold text-slate-900">
                {organization.address || "—"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <span className="text-xs font-medium uppercase text-slate-400">
                  City
                </span>
                <p className="font-medium text-slate-900">
                  {organization.city || "—"}
                </p>
              </div>

              <div>
                <span className="text-xs font-medium uppercase text-slate-400">
                  State
                </span>
                <p className="font-medium text-slate-900">
                  {organization.state || "—"}
                </p>
              </div>

              <div>
                <span className="text-xs font-medium uppercase text-slate-400">
                  Country
                </span>
                <p className="font-medium text-slate-900">
                  {organization.country || "India"}
                </p>
              </div>

              <div>
                <span className="text-xs font-medium uppercase text-slate-400">
                  Postal Code
                </span>
                <p className="font-medium text-slate-900">
                  {organization.postalCode || "—"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Legal Information */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <div className="rounded-lg bg-purple-50 p-2 text-purple-600">
              <FileText className="h-5 w-5" />
            </div>
            <h2 className="text-base font-bold text-slate-900">
              Legal Information
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-xs font-medium uppercase text-slate-400">
                Registration No.
              </span>
              <p className="font-semibold text-slate-900">
                {organization.registrationNo || "—"}
              </p>
            </div>

            <div>
              <span className="text-xs font-medium uppercase text-slate-400">
                PAN Number
              </span>
              <p className="font-semibold text-slate-900">
                {organization.panNumber || "—"}
              </p>
            </div>

            <div>
              <span className="text-xs font-medium uppercase text-slate-400">
                GST Number
              </span>
              <p className="font-medium text-slate-900">
                {organization.gstNumber || "Not Provided"}
              </p>
            </div>

            <div>
              <span className="text-xs font-medium uppercase text-slate-400">
                Tax Exemption No. (80G)
              </span>
              <p className="font-medium text-slate-900">
                {organization.taxExemptionNo || "Not Provided"}
              </p>
            </div>
          </div>
        </div>

        {/* Bank Information */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <div className="rounded-lg bg-amber-50 p-2 text-amber-600">
              <CreditCard className="h-5 w-5" />
            </div>
            <h2 className="text-base font-bold text-slate-900">
              Bank Details
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-xs font-medium uppercase text-slate-400">
                Account Holder
              </span>
              <p className="font-semibold text-slate-900">
                {organization.accountHolder || "—"}
              </p>
            </div>

            <div>
              <span className="text-xs font-medium uppercase text-slate-400">
                Account Number
              </span>
              <p className="font-mono font-semibold text-slate-900">
                {maskAccountNumber(organization.accountNumber)}
              </p>
            </div>

            <div>
              <span className="text-xs font-medium uppercase text-slate-400">
                Bank Name
              </span>
              <p className="font-medium text-slate-900">
                {organization.bankName || "—"}
              </p>
            </div>

            <div>
              <span className="text-xs font-medium uppercase text-slate-400">
                IFSC Code
              </span>
              <p className="font-mono font-medium text-slate-900">
                {organization.ifscCode || "—"}
              </p>
            </div>

            <div className="sm:col-span-2">
              <span className="text-xs font-medium uppercase text-slate-400">
                Branch Name
              </span>
              <p className="font-medium text-slate-900">
                {organization.branchName || "—"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Documents Summary Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Uploaded Documents ({organization.documents?.length || 0})
              </h2>
              <p className="text-xs text-slate-500">
                Documents submitted for organization verification.
              </p>
            </div>
          </div>

          <Link
            href="/organizer/documents"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
          >
            Manage Documents <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {organization.documents && organization.documents.length > 0 ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {organization.documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 text-xs"
              >
                <div className="truncate pr-2">
                  <p className="font-semibold text-slate-800 truncate">
                    {doc.originalFileName}
                  </p>
                  <p className="text-slate-500">{doc.documentType}</p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                    doc.verificationStatus === "APPROVED"
                      ? "bg-emerald-100 text-emerald-800"
                      : doc.verificationStatus === "REJECTED"
                      ? "bg-red-100 text-red-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {doc.verificationStatus}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-500">
            No documents uploaded yet. Upload required verification documents to proceed.
          </div>
        )}
      </div>
    </div>
  );
}
