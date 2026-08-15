import { createClient } from "@/lib/supabase/server";
import { DonationStatus } from "@prisma/client";
import { redirect } from "next/navigation";
import Link from "next/link";
import { HandCoins, TrendingUp, Calendar, Heart, Building2 } from "lucide-react";
import { StatsGrid, ChartCard } from "@/components/dashboard/widgets";
import type { StatItem } from "@/components/dashboard/widgets";
import { getDonorDonations, getDonorSummaryStats } from "@/features/donation/services/donation.service";

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

  const [completedDonations, summary] = await Promise.all([
    getDonorDonations(user.id, DonationStatus.COMPLETED),
    getDonorSummaryStats(user.id),
  ]);

  // ── Monthly aggregation ───────────────────────────────────────────────────
  const monthlyMap = new Map<string, number>();
  for (const d of completedDonations) {
    const key = formatMonth(d.donatedAt ?? d.createdAt);
    monthlyMap.set(key, (monthlyMap.get(key) ?? 0) + d.amount);
  }
  const monthlyData = Array.from(monthlyMap.entries()).reverse();

  const stats: StatItem[] = [
    {
      id: "total",
      title: "Total Donated",
      value: formatCurrency(summary.totalDonated),
      icon: <HandCoins className="h-6 w-6" />,
      description: `${summary.completedCount} successful transactions`,
      variant: "emerald",
    },
    {
      id: "campaigns",
      title: "Campaigns Supported",
      value: summary.campaignsSupportedCount,
      icon: <TrendingUp className="h-6 w-6" />,
      description: "Unique causes supported",
      variant: "blue",
    },
    {
      id: "avg",
      title: "Average Donation",
      value: formatCurrency(summary.averageDonation),
      icon: <Calendar className="h-6 w-6" />,
      description: "Per completed donation",
      variant: "purple",
    },
    {
      id: "largest",
      title: "Largest Contribution",
      value: formatCurrency(summary.largestDonation),
      icon: <Heart className="h-6 w-6" />,
      description: "Single highest transaction",
      variant: "amber",
    },
  ];

  const maxMonthly = Math.max(...monthlyData.map(([, v]) => v), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Donation History</h1>
          <p className="mt-1 text-sm text-slate-500">
            Your complete giving record and contribution analytics across all campaigns.
          </p>
        </div>
        <Link
          href="/donations"
          className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
        >
          ← Back to My Donations
        </Link>
      </div>

      <StatsGrid stats={stats} />

      {/* Monthly chart */}
      {monthlyData.length > 0 && (
        <ChartCard
          title="Monthly Contributions"
          description="Your verified donation amounts by month."
        >
          <div className="mt-2 space-y-2">
            {monthlyData.slice(0, 12).map(([month, amount]) => (
              <div key={month} className="flex items-center gap-3">
                <span className="w-24 shrink-0 text-xs font-semibold text-slate-600">{month}</span>
                <div className="flex-1 overflow-hidden rounded-full bg-slate-100 h-6">
                  <div
                    className="h-full rounded-full bg-emerald-600 transition-all duration-500 flex items-center justify-end pr-2"
                    style={{ width: `${(amount / maxMonthly) * 100}%` }}
                  >
                    <span className="text-xs font-bold text-white whitespace-nowrap">
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
      {completedDonations.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
          <HandCoins className="mb-4 h-10 w-10 text-slate-300" />
          <h3 className="text-base font-semibold text-slate-900">No contribution history yet</h3>
          <p className="mt-2 text-sm text-slate-500">
            Completed donations will appear here with analytics and tax receipt access.
          </p>
          <Link
            href="/campaigns/browse"
            className="mt-6 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            Explore Campaigns
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-4">
            <h2 className="text-base font-bold text-slate-900">
              Verified Giving Ledger ({completedDonations.length})
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  {["#", "Campaign", "Organization", "Amount", "Date", "Status"].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {completedDonations.map((d, i) => (
                  <tr key={d.id} className="transition-colors hover:bg-slate-50">
                    <td className="px-5 py-4 text-sm text-slate-400 font-mono">{i + 1}</td>
                    <td className="max-w-[260px] truncate px-5 py-4">
                      <Link
                        href={`/campaigns/${d.campaignId}`}
                        className="text-sm font-bold text-slate-900 hover:text-emerald-600"
                      >
                        {d.campaign.title}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-xs font-medium text-slate-600 flex items-center gap-1.5 mt-2">
                      <Building2 className="h-3.5 w-3.5 text-slate-400" />
                      {d.campaign.organization.name}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm font-bold text-emerald-600">
                      {formatCurrency(d.amount)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-500">
                      {(d.donatedAt ?? d.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                        COMPLETED
                      </span>
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
