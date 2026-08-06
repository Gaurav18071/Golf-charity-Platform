import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { DonationStatus } from "@prisma/client";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  HandCoins,
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw,
  Receipt,
} from "lucide-react";
import { StatsGrid } from "@/components/dashboard/widgets";
import type { StatItem } from "@/components/dashboard/widgets";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ status?: string }>;
}

type DonationStatusType = "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";

const STATUS_STYLES: Record<DonationStatusType, string> = {
  COMPLETED: "bg-emerald-100 text-emerald-700",
  PENDING:   "bg-amber-100 text-amber-700",
  FAILED:    "bg-red-100 text-red-700",
  REFUNDED:  "bg-slate-100 text-slate-600",
};

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR", maximumFractionDigits: 0,
  }).format(n);
}

function formatDate(d: Date | string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
}

export default async function MyDonationsPage({ searchParams }: PageProps) {
  const { status } = await searchParams;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const statusFilter =
    status && Object.values(DonationStatus).includes(status as DonationStatus)
      ? (status as DonationStatus)
      : undefined;

  const [donations, summary] = await Promise.all([
    prisma.donation.findMany({
      where: {
        donorId: user.id,
        ...(statusFilter ? { status: statusFilter } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { campaign: { select: { title: true, slug: true } } },
    }),
    prisma.donation.groupBy({
      by: ["status"],
      where: { donorId: user.id },
      _count: { id: true },
      _sum: { amount: true },
    }),
  ]);

  const countMap = Object.fromEntries(summary.map((s) => [s.status, s._count.id]));
  const amountMap = Object.fromEntries(summary.map((s) => [s.status, Number(s._sum.amount ?? 0)]));
  const totalRaised = amountMap["COMPLETED"] ?? 0;

  const stats: StatItem[] = [
    {
      id: "total",
      title: "Total Donated",
      value: formatCurrency(totalRaised),
      icon: <HandCoins className="h-6 w-6" />,
      description: "Completed donations",
      variant: "emerald",
    },
    {
      id: "completed",
      title: "Successful",
      value: countMap["COMPLETED"] ?? 0,
      icon: <CheckCircle2 className="h-6 w-6" />,
      description: "Completed transactions",
      variant: "blue",
    },
    {
      id: "pending",
      title: "Pending",
      value: countMap["PENDING"] ?? 0,
      icon: <Clock className="h-6 w-6" />,
      description: "Awaiting completion",
      variant: "amber",
    },
    {
      id: "failed",
      title: "Failed / Refunded",
      value: (countMap["FAILED"] ?? 0) + (countMap["REFUNDED"] ?? 0),
      icon: <AlertCircle className="h-6 w-6" />,
      description: "Unsuccessful transactions",
      variant: "red",
    },
  ];

  const STATUS_TABS = [
    { label: "All",      value: "" },
    { label: "Completed", value: "COMPLETED" },
    { label: "Pending",   value: "PENDING" },
    { label: "Failed",    value: "FAILED" },
    { label: "Refunded",  value: "REFUNDED" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Donations</h1>
          <p className="mt-1 text-sm text-slate-500">
            Track all your donations across every campaign.
          </p>
        </div>
        <Link
          href="/campaigns/browse"
          className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
        >
          Browse Campaigns
        </Link>
      </div>

      {/* Summary stats */}
      <StatsGrid stats={stats} />

      {/* Status filter tabs */}
      <div className="flex gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
        {STATUS_TABS.map((tab) => {
          const isActive = (status ?? "") === tab.value;
          const href = tab.value ? `/donations?status=${tab.value}` : "/donations";
          return (
            <Link
              key={tab.value}
              href={href}
              className={[
                "whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
              ].join(" ")}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {/* Donations table */}
      {donations.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
          <HandCoins className="mb-4 h-10 w-10 text-slate-300" />
          <h3 className="text-base font-semibold text-slate-900">No donations yet</h3>
          <p className="mt-2 text-sm text-slate-500">
            When you donate to a campaign, it will appear here.
          </p>
          <Link
            href="/campaigns/browse"
            className="mt-6 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            Browse Campaigns
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  {["Campaign", "Amount", "Date", "Status", ""].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {donations.map((d) => (
                  <tr key={d.id} className="transition-colors hover:bg-slate-50">
                    <td className="max-w-[220px] px-5 py-4">
                      <Link
                        href={`/campaigns/${d.campaignId}`}
                        className="text-sm font-medium text-slate-900 hover:text-emerald-600 truncate block"
                      >
                        {d.campaign.title}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-emerald-600">
                      {formatCurrency(Number(d.amount))}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-500">
                      {formatDate(d.donatedAt ?? d.createdAt)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[d.status as DonationStatusType]}`}>
                        {d.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-right">
                      {d.status === "COMPLETED" && (
                        <button
                          type="button"
                          title="Download receipt"
                          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                        >
                          <Receipt className="h-3.5 w-3.5" />
                          Receipt
                        </button>
                      )}
                      {d.status === "PENDING" && (
                        <span className="inline-flex items-center gap-1 text-xs text-amber-600">
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          Processing
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
