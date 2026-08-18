import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getDonationReceipt } from "@/features/donation/services/donation.service";
import {
  CheckCircle2,
  ShieldCheck,
  Building2,
  Calendar,
  CreditCard,
  Printer,
  ArrowRight,
  HeartHandshake,
  Download,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(date: Date | string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function DonationSuccessPage({ params }: PageProps) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const receipt = await getDonationReceipt(id);

  if (!receipt) {
    notFound();
  }

  const isCompleted = receipt.status === "COMPLETED";

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="text-center space-y-3">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-sm">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">
          {isCompleted ? "Thank You for Your Generosity!" : "Donation Processing"}
        </h1>
        <p className="text-sm text-slate-600 max-w-md mx-auto">
          Your contribution is making an immediate positive impact. A verified digital receipt has been generated below.
        </p>
      </div>

      {/* Official Tax-Deductible Receipt Card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6 relative overflow-hidden print:border-none print:shadow-none">
        {/* Top watermark/badge */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
              <HeartHandshake className="h-6 w-6" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">Official Donation Receipt</div>
              <div className="text-lg font-bold text-slate-900">Golf Charity Platform</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-700 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              Verified Transaction
            </span>
          </div>
        </div>

        {/* Amount Box */}
        <div className="rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-slate-50 p-6 border border-emerald-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Donation Amount</div>
            <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-1">
              {formatCurrency(receipt.amount)}
            </div>
            <div className="text-xs text-emerald-700 font-medium mt-1">
              Currency: {receipt.currency} • 100% Directed to Campaign Cause
            </div>
          </div>

          <div className="text-right sm:border-l sm:border-slate-200 sm:pl-6">
            <div className="text-xs text-slate-500 font-medium">Receipt No.</div>
            <div className="text-sm font-mono font-bold text-slate-800 mt-0.5">{receipt.donationId.slice(0, 16).toUpperCase()}</div>
            <div className="text-xs text-slate-400 mt-1">{formatDate(receipt.donatedAt || new Date())}</div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
          {/* Campaign Details */}
          <div className="space-y-1.5">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Supported Campaign</div>
            <div className="font-bold text-slate-900 text-base leading-snug">{receipt.campaign.title}</div>
            <Link
              href={`/campaigns/${receipt.campaign.id}`}
              className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
            >
              View campaign page <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {/* Organization Details */}
          <div className="space-y-1.5">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Beneficiary Charity Organization</div>
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <Building2 className="h-4 w-4 text-slate-500" />
              {receipt.campaign.organization.name}
            </div>
            {receipt.campaign.organization.panNumber && (
              <div className="text-xs text-slate-500">
                PAN: <span className="font-mono">{receipt.campaign.organization.panNumber}</span>
              </div>
            )}
            {receipt.campaign.organization.taxExemptionNo && (
              <div className="text-xs text-emerald-700 font-medium">
                Tax Exemption Ref: {receipt.campaign.organization.taxExemptionNo}
              </div>
            )}
          </div>

          {/* Donor Details */}
          <div className="space-y-1.5">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Donor Information</div>
            <div className="font-medium text-slate-900">
              {receipt.isAnonymous ? "Anonymous Donor" : receipt.donor.fullName}
            </div>
            <div className="text-xs text-slate-500">
              {receipt.isAnonymous ? "Identity masked on public feeds" : receipt.donor.email}
            </div>
          </div>

          {/* Gateway & Payment Details */}
          <div className="space-y-1.5">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Payment Reference</div>
            <div className="text-xs font-mono text-slate-800 bg-slate-50 p-2 rounded-lg border border-slate-100 space-y-1">
              <div>Gateway: <span className="font-semibold text-slate-900">{receipt.payment?.gateway ?? "RAZORPAY"}</span></div>
              {receipt.payment?.gatewayPaymentId && (
                <div>Ref: <span className="font-bold text-emerald-700">{receipt.payment.gatewayPaymentId}</span></div>
              )}
              <div>Status: <span className="font-semibold text-emerald-600">{receipt.payment?.status ?? "CAPTURED"}</span></div>
            </div>
          </div>
        </div>

        {/* Tax Deductible Note */}
        <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 text-xs text-slate-500 flex items-start gap-2.5">
          <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
          <p>
            This donation qualifies for tax exemption benefits under section 80G of the Indian Income Tax Act where eligible. Please retain this receipt along with your PAN details for filing tax returns.
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        <Link
          href="/donations"
          className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition"
        >
          View Giving History
        </Link>

        <div className="flex gap-3">
          <Link
            href={`/campaigns/${receipt.campaign.id}`}
            className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-2.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 transition"
          >
            Back to Campaign
          </Link>
          <Link
            href="/campaigns/browse"
            className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition"
          >
            Browse More Causes
          </Link>
        </div>
      </div>
    </div>
  );
}
