import { createClient } from "@/src/lib/supabase/server";
import { redirect } from "next/navigation";
import { prisma } from "@/src/lib/prisma";
import { BarChart3, TrendingUp, HandCoins, Users } from "lucide-react";
import { StatsGrid, ChartCard } from "@/components/dashboard/widgets";
import type { StatItem } from "@/components/dashboard/widgets";
import { DonationStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

function formatCurrency(n: number) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n}`;
}

function formatMonth(d: Date) {
  return d.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
}

export default async function ReportsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const profile = await prisma.profile.findUnique({ where: { id: user.id } });
  if (profile?.role !== "ADMIN") redirect("/dashboard");

  const [totalRevenue, totalDonations, totalUsers, topCampaigns, recentDonations] =
    await Promise.all([
      prisma.donation.aggregate({
        where: { status: DonationStatus.COMPLETED },
        _sum: { amount: true },
        _count: { id: true },
      }),
      prisma.donation.count(),
      prisma.profile.count(),
      prisma.campaign.findMany({
        orderBy: { currentAmount: "desc" },
        take: 5,
        select: { title: true, currentAmount: true, goalAmount: true },
      }),
      prisma.donation.findMany({
        where: { status: DonationStatus.COMPLETED },
        orderBy: { donatedAt: "desc" },
        take: 30,
        select: { amount: true, donatedAt: true, createdAt: true },
      }),
    ]);

  // Monthly aggregation for chart
  const monthlyMap = new Map<string, number>();
  for (const d of recentDonations) {
    const key = formatMonth(d.donatedAt ?? d.createdAt);
    monthlyMap.set(key, (monthlyMap.get(key) ?? 0) + Number(d.amount));
  }
  const monthly = Array.from(monthlyMap.entries()).reverse().slice(0, 6);
  const maxVal = Math.max(...monthly.map(([, v]) => v), 1);

  const stats: StatItem[] = [
    { id: "revenue", title: "Total Revenue", value: formatCurrency(Number(totalRevenue._sum.amount ?? 0)), icon: <TrendingUp className="h-6 w-6" />, variant: "emerald" },
    { id: "donations", title: "Total Donations", value: totalDonations, icon: <HandCoins className="h-6 w-6" />, variant: "blue" },
    { id: "completed", title: "Completed", value: totalRevenue._count.id, icon: <BarChart3 className="h-6 w-6" />, variant: "purple" },
    { id: "users", title: "Platform Users", value: totalUsers, icon: <Users className="h-6 w-6" />, variant: "amber" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Reports & Analytics</h1>
        <p className="mt-1 text-sm text-slate-500">Platform-wide performance metrics.</p>
      </div>

      <StatsGrid stats={stats} />

      <div className="grid gap-6 xl:grid-cols-2">
        {/* Monthly revenue chart */}
        <ChartCard title="Monthly Donations" description="Revenue over the last 6 months.">
          <div className="mt-2 space-y-2">
            {monthly.map(([month, amount]) => (
              <div key={month} className="flex items-center gap-3">
                <span className="w-20 shrink-0 text-xs text-slate-500">{month}</span>
                <div className="flex-1 h-5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-emerald-500 flex items-center justify-end pr-2 transition-all duration-500"
                    style={{ width: `${(amount / maxVal) * 100}%` }}
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

        {/* Top campaigns */}
        <ChartCard title="Top Campaigns by Amount Raised">
          <div className="mt-2 space-y-3">
            {topCampaigns.map((c, i) => {
              const pct = Math.min(Math.round((Number(c.currentAmount) / Number(c.goalAmount)) * 100), 100);
              return (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="truncate max-w-[200px] font-medium text-slate-700">{c.title}</span>
                    <span className="text-slate-500 shrink-0 ml-2">{formatCurrency(Number(c.currentAmount))}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
