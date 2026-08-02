import { createClient } from "@/src/lib/supabase/server";
import { redirect } from "next/navigation";
import { prisma } from "@/src/lib/prisma";
import { CreditCard, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react";
import { AdminDataTable } from "@/components/dashboard/admin/AdminDataTable";
import { StatsGrid } from "@/components/dashboard/widgets";
import type { StatItem } from "@/components/dashboard/widgets";

export const dynamic = "force-dynamic";

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}

function formatDate(d: Date | null) {
  if (!d) return "—";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

const STATUS_STYLE: Record<string, string> = {
  PENDING:    "bg-amber-100 text-amber-700",
  AUTHORIZED: "bg-blue-100 text-blue-700",
  CAPTURED:   "bg-emerald-100 text-emerald-700",
  FAILED:     "bg-red-100 text-red-700",
  REFUNDED:   "bg-slate-100 text-slate-600",
};

export default async function PaymentsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const profile = await prisma.profile.findUnique({ where: { id: user.id } });
  if (profile?.role !== "ADMIN") redirect("/dashboard");

  const [payments, summary] = await Promise.all([
    prisma.payment.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        donation: {
          include: {
            donor: { select: { fullName: true } },
            campaign: { select: { title: true } },
          },
        },
      },
    }),
    prisma.payment.groupBy({
      by: ["status"],
      _count: { id: true },
      _sum: { amount: true },
    }),
  ]);

  const captured = summary.find((s) => s.status === "CAPTURED");
  const failed   = summary.find((s) => s.status === "FAILED");
  const pending  = summary.find((s) => s.status === "PENDING");

  const stats: StatItem[] = [
    { id: "total", title: "Total Processed", value: formatCurrency(Number(captured?._sum.amount ?? 0)), icon: <TrendingUp className="h-6 w-6" />, variant: "emerald" },
    { id: "captured", title: "Captured", value: captured?._count.id ?? 0, icon: <CheckCircle2 className="h-6 w-6" />, variant: "blue" },
    { id: "pending", title: "Pending", value: pending?._count.id ?? 0, icon: <CreditCard className="h-6 w-6" />, variant: "amber" },
    { id: "failed", title: "Failed", value: failed?._count.id ?? 0, icon: <AlertCircle className="h-6 w-6" />, variant: "red" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Payment Management</h1>
        <p className="mt-1 text-sm text-slate-500">Monitor all platform payment transactions.</p>
      </div>

      <StatsGrid stats={stats} />

      <AdminDataTable
        rows={payments}
        rowKey={(r) => r.id}
        emptyMessage="No payment transactions found."
        emptyIcon={<CreditCard className="h-10 w-10" />}
        columns={[
          {
            key: "txn",
            header: "Transaction ID",
            render: (r) => (
              <span className="font-mono text-xs text-slate-600">
                {(r.gatewayPaymentId ?? r.id).slice(0, 16)}…
              </span>
            ),
          },
          {
            key: "campaign",
            header: "Campaign",
            render: (r) => (
              <span className="max-w-[180px] truncate block text-sm font-medium text-slate-900">
                {r.donation.campaign.title}
              </span>
            ),
          },
          {
            key: "donor",
            header: "Donor",
            render: (r) => (
              <span className="text-sm text-slate-600">{r.donation.donor.fullName}</span>
            ),
          },
          {
            key: "amount",
            header: "Amount",
            render: (r) => (
              <span className="text-sm font-semibold text-emerald-600">
                {formatCurrency(Number(r.amount))}
              </span>
            ),
          },
          {
            key: "status",
            header: "Status",
            render: (r) => (
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLE[r.status] ?? "bg-slate-100 text-slate-600"}`}>
                {r.status}
              </span>
            ),
          },
          {
            key: "date",
            header: "Date",
            render: (r) => (
              <span className="text-sm text-slate-500">
                {formatDate(r.processedAt ?? r.createdAt)}
              </span>
            ),
          },
        ]}
      />
    </div>
  );
}
