import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CreditCard, TrendingUp, AlertCircle, CheckCircle2, Search } from "lucide-react";
import { AdminDataTable } from "@/components/dashboard/admin/AdminDataTable";
import { StatsGrid } from "@/components/dashboard/widgets";
import type { StatItem } from "@/components/dashboard/widgets";
import { PaymentStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ q?: string; status?: string }>;
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

function formatDate(d: Date | null) {
  if (!d) return "—";
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const STATUS_STYLE: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  AUTHORIZED: "bg-blue-100 text-blue-700",
  CAPTURED: "bg-emerald-100 text-emerald-700",
  FAILED: "bg-red-100 text-red-700",
  REFUNDED: "bg-slate-100 text-slate-600",
};

export default async function PaymentsPage({ searchParams }: PageProps) {
  const { q, status } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const profile = await prisma.profile.findUnique({ where: { id: user.id } });
  if (profile?.role !== "ADMIN") redirect("/dashboard");

  const [payments, summary] = await Promise.all([
    prisma.payment.findMany({
      where: {
        ...(status && Object.values(PaymentStatus).includes(status as PaymentStatus)
          ? { status: status as PaymentStatus }
          : {}),
        ...(q
          ? {
              OR: [
                { gatewayPaymentId: { contains: q, mode: "insensitive" } },
                { gatewayOrderId: { contains: q, mode: "insensitive" } },
                {
                  donation: {
                    campaign: { title: { contains: q, mode: "insensitive" } },
                  },
                },
                {
                  donation: {
                    donor: { fullName: { contains: q, mode: "insensitive" } },
                  },
                },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        donation: {
          include: {
            donor: { select: { fullName: true, email: true } },
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
  const failed = summary.find((s) => s.status === "FAILED");
  const pending = summary.find((s) => s.status === "PENDING");

  const stats: StatItem[] = [
    {
      id: "total",
      title: "Total Processed",
      value: formatCurrency(Number(captured?._sum.amount ?? 0)),
      icon: <TrendingUp className="h-6 w-6" />,
      variant: "emerald",
    },
    {
      id: "captured",
      title: "Captured (Success)",
      value: captured?._count.id ?? 0,
      icon: <CheckCircle2 className="h-6 w-6" />,
      variant: "blue",
    },
    {
      id: "pending",
      title: "Pending Payments",
      value: pending?._count.id ?? 0,
      icon: <CreditCard className="h-6 w-6" />,
      variant: "amber",
    },
    {
      id: "failed",
      title: "Failed Payments",
      value: failed?._count.id ?? 0,
      icon: <AlertCircle className="h-6 w-6" />,
      variant: "red",
    },
  ];

  const STATUS_TABS = [
    { label: "All", value: "" },
    { label: "Captured", value: "CAPTURED" },
    { label: "Pending", value: "PENDING" },
    { label: "Failed", value: "FAILED" },
    { label: "Refunded", value: "REFUNDED" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Payment Management</h1>
        <p className="mt-1 text-sm text-slate-500">
          Monitor and audit all platform payment transactions.
        </p>
      </div>

      <StatsGrid stats={stats} cols={4} />

      {/* Search + Filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <form method="GET" className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            name="q"
            defaultValue={q ?? ""}
            placeholder="Search transaction, donor, campaign…"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm shadow-xs focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
          {status && <input type="hidden" name="status" value={status} />}
        </form>

        <div className="flex gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1 shadow-xs">
          {STATUS_TABS.map((tab) => (
            <a
              key={tab.value}
              href={`/admin/payments?${new URLSearchParams({
                ...(q ? { q } : {}),
                ...(tab.value ? { status: tab.value } : {}),
              }).toString()}`}
              className={[
                "whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                (status ?? "") === tab.value
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100",
              ].join(" ")}
            >
              {tab.label}
            </a>
          ))}
        </div>
      </div>

      <AdminDataTable
        rows={payments}
        rowKey={(r) => r.id}
        emptyMessage="No payment transactions found matching your filters."
        emptyIcon={<CreditCard className="h-10 w-10 text-slate-400" />}
        columns={[
          {
            key: "txn",
            header: "Transaction ID",
            render: (r) => (
              <div>
                <span className="font-mono text-xs font-semibold text-slate-800">
                  {r.gatewayPaymentId ? r.gatewayPaymentId : `${r.id.slice(0, 12)}…`}
                </span>
                {r.gatewayOrderId && (
                  <p className="font-mono text-[10px] text-slate-400">
                    Order: {r.gatewayOrderId}
                  </p>
                )}
              </div>
            ),
          },
          {
            key: "campaign",
            header: "Campaign",
            render: (r) => (
              <span className="max-w-[200px] truncate block text-sm font-medium text-slate-900">
                {r.donation.campaign.title}
              </span>
            ),
          },
          {
            key: "donor",
            header: "Donor",
            render: (r) => (
              <div>
                <p className="text-sm font-semibold text-slate-900 leading-tight">
                  {r.donation.donor.fullName}
                </p>
                <p className="text-[11px] text-slate-500">{r.donation.donor.email}</p>
              </div>
            ),
          },
          {
            key: "gateway",
            header: "Gateway",
            render: (r) => (
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-700">
                {r.gateway}
              </span>
            ),
          },
          {
            key: "amount",
            header: "Amount",
            render: (r) => (
              <span className="text-sm font-bold text-slate-900">
                {formatCurrency(Number(r.amount))}
              </span>
            ),
          },
          {
            key: "status",
            header: "Status",
            render: (r) => (
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                  STATUS_STYLE[r.status] ?? "bg-slate-100 text-slate-600"
                }`}
              >
                {r.status}
              </span>
            ),
          },
          {
            key: "date",
            header: "Date",
            render: (r) => (
              <span className="text-xs text-slate-500">
                {formatDate(r.createdAt)}
              </span>
            ),
          },
        ]}
      />
    </div>
  );
}
