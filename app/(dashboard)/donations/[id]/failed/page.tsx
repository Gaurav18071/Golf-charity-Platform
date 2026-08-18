import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getDonationById } from "@/features/donation/services/donation.service";
import {
  AlertCircle,
  RefreshCw,
  ArrowLeft,
  ShieldAlert,
  Building2,
  Heart,
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

export default async function DonationFailedPage({ params }: PageProps) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const donation = await getDonationById(id);

  if (!donation) {
    notFound();
  }

  return (
    <div className="max-w-xl mx-auto py-12 px-4 space-y-6 text-center animate-in fade-in duration-300">
      {/* Failure Icon */}
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600 shadow-sm">
        <AlertCircle className="h-10 w-10" />
      </div>

      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Payment Was Not Completed
        </h1>
        <p className="text-sm text-slate-600 mt-2">
          Your payment of <span className="font-bold text-slate-800">{formatCurrency(donation.amount)}</span> for{" "}
          <span className="font-medium text-slate-900">{donation.campaign.title}</span> could not be processed.
        </p>
      </div>

      {/* Details Box */}
      <div className="rounded-2xl border border-red-100 bg-red-50/50 p-5 text-left text-xs space-y-2 text-slate-700">
        <div className="flex justify-between">
          <span className="text-slate-500">Status:</span>
          <span className="font-bold text-red-600">{donation.status}</span>
        </div>
        {donation.payment?.failureReason && (
          <div className="flex justify-between">
            <span className="text-slate-500">Reason:</span>
            <span className="font-medium text-slate-800">{donation.payment.failureReason}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-slate-500">Beneficiary Org:</span>
          <span className="font-medium text-slate-800">{donation.campaign.organization.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Gateway:</span>
          <span className="font-medium text-slate-800">{donation.payment?.gateway ?? "RAZORPAY"}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-2 flex flex-col sm:flex-row gap-3">
        <Link
          href={`/campaigns/${donation.campaign.id}`}
          className="flex-1 rounded-xl bg-emerald-600 py-3 text-center text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition flex items-center justify-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Retry Donation
        </Link>
        <Link
          href="/donations"
          className="flex-1 rounded-xl border border-slate-200 bg-white py-3 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
        >
          View Giving History
        </Link>
      </div>

      <div className="text-xs text-slate-400">
        No funds were deducted from your account. If you believe this is an error, please contact your bank or support.
      </div>
    </div>
  );
}
