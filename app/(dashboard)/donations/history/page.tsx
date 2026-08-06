import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { DonationStatus } from "@prisma/client";
import { redirect } from "next/navigation";
import Link from "next/link";
import { HandCoins, TrendingUp, Calendar } from "lucide-react";
import { StatsGrid, ChartCard } from "@/components/dashboard/widgets";
import type { StatItem } from "@/components/dashboard/widgets";

export const dynamic = "force-dynamic";

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR", maximumFractionDigits: 0,
  }).format(n);
}

function formatMonth(d: Date) {
  return d.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
}

export default async function DonationHistoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const donations = await prisma.donation.findMany({
    where: { donorId: user.id, status: DonationStatus.COMPLETED },
    orderBy: { donatedAt: "desc" },
    include: { campaign: { select: { title: true } } },
  });

  // ── Monthly aggregation ───────────────────────────────────────────────────
  const monthlyMap = new Map<string, number>();
  for (const d of donations) {
    const key = formatMonth(d.donatedAt ?? d.createdAt);
    monthlyMap.set(key, (monthlyMap.get(key) ?? 0) + Number(d.amount));
  }
  const monthlyData = Array.from(monthlyMap.entries()).reverse();

  // ── Stats ─────────────────────────────────────────────────────────────────
  const totalDonated = donations.reduce((acc, d) => acc + Number(d.amount), 0);
  const uniqueCampaigns = new Set(donations.map((d) => d.campaignId)).size;
  const avgDonation = donations.length > 0 ? totalDonated / donations.length : 0;
  const largestDonation = donations.length > 0
    ? Math.max(...donations.map((d) => Number(d.amount)))
    : 0;

  const stats: StatItem[] = [
    {
      id: "total",
      title: "Total Donated",
      value: formatCurrency(totalDonated),
      icon: <HandCoins className="h-6 w-6" />,
      description: `${donations.length} transactions`,
      variant: "emerald",
    },
    {
      id: "campaigns",
      title: "Campaigns Supported",
      value: uniqueCampaigns,
      icon: <TrendingUp className="h-6 w-6" />,
      description: "Unique campaigns",
      variant: "blue",
    },
    {
      id: "avg",
      title: "Average Donation",
      value: formatCurrency(avgDonation),
      icon: <Calendar className="h-6 w-6" />,
      description: "Per transaction",
      variant: "purple",
    },
    {
      id: "largest",
      title: "Largest Donation",
      value: formatCurrency(largestDonation),
      icon: <TrendingUp className="h-6 w-6" />,
      description: "Single transaction",
      variant: "amber",
    },
  ];

  // ── Max for bar chart scaling ─────────────────────────────────────────────
  const maxMonthly = Math.max(...monthlyData.map(([, v]) => v), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Donation History</h1>
          <p className="mt-1 text-sm text-slate-500">
            Your complete giving record across all campaigns.
          </p>
        </div>
        <Link
          href="/donations"
          className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
        >
          ← My Donations
        </Link>
      </div>

      <StatsGrid stats={stats} />

      {/* Monthly chart */}
      {monthlyData.length > 0 && (
        <ChartCard
          title="Monthly Giving"
          description="Your donation amounts by month."
        >
          <div className="mt-2 space-y-2">
            {monthlyData.slice(0, 12).map(([month, amount]) => (
              <div key={month} className="flex items-center gap-3">
                <span className="w-20 shrink-0 text-xs text-slate-500">{month}</span>
                <div className="flex-1 overflow-hidden rounded-full bg-slate-100 h-5">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-500 flex items-center justify-end pr-2"
                    style={{ width: `${(amount / maxMonthly) * 100}%` }}
                  >
                    <span className="text-xs font-medium text-white whitespace-nowrap">
                      {formatCurrency(amount)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      )}

      {/* Full history table */}
      {donations.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
          <HandCoins className="mb-4 h-10 w-10 text-slate-300" />
          <h3 className="text-base font-semibold text-slate-900">No donation history</h3>
          <p className="mt-2 text-sm text-slate-500">
            Complete donations will appear here.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b px-6 py-4">
            <h2 className="text-base font-semibold text-slate-900">
              All Transactions ({donations.length})
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  {["#", "Campaign", "Amount", "Date"].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {donations.map((d, i) => (
                  <tr key={d.id} className="transition-colors hover:bg-slate-50">
                    <td className="px-5 py-4 text-sm text-slate-400">{i + 1}</td>
                    <td className="max-w-[260px] truncate px-5 py-4 text-sm font-medium text-slate-900">
                      {d.campaign.title}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-emerald-600">
                      {formatCurrency(Number(d.amount))}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-500">
                      {(d.donatedAt ?? d.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
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
