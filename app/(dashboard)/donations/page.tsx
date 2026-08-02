import { HandCoins, TrendingUp, CheckCircle2, AlertCircle } from "lucide-react";
import { prisma } from "@/src/lib/prisma";
import { DonationStatus } from "@prisma/client";
import { EmptyState } from "@/src/components/dashboard/shared";
import DonationsTable from "@/src/components/dashboard/donations/DonationsTable";
import DonationStatusFilter from "@/src/components/dashboard/donations/DonationStatusFilter";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ status?: string }>;
}

function formatCurrency(amount: number): string {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
  return `₹${amount}`;
}

export default async function DonationsPage({ searchParams }: PageProps) {
  const { status } = await searchParams;

  const statusFilter =
    status && Object.values(DonationStatus).includes(status as DonationStatus)
      ? (status as DonationStatus)
      : undefined;

  const [donations, aggregate, countByStatus] = await Promise.all([
    prisma.donation.findMany({
      where: statusFilter ? { status: statusFilter } : undefined,
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        campaign: { select: { title: true, slug: true } },
        donor: { select: { fullName: true } },
      },
    }),
    prisma.donation.aggregate({
      _sum: { amount: true },
      _count: { id: true },
      where: { status: DonationStatus.COMPLETED },
    }),
    prisma.donation.groupBy({
      by: ["status"],
      _count: { id: true },
      _sum: { amount: true },
    }),
  ]);

  const countMap = Object.fromEntries(
    countByStatus.map((s) => [s.status, s._count.id])
  );

  const summaryCards = [
    {
      label: "Total Raised",
      value: formatCurrency(Number(aggregate._sum.amount ?? 0)),
      icon: <TrendingUp className="h-5 w-5" />,
      color: "bg-emerald-100 text-emerald-600",
    },
    {
      label: "Completed",
      value: countMap["COMPLETED"] ?? 0,
      icon: <CheckCircle2 className="h-5 w-5" />,
      color: "bg-blue-100 text-blue-600",
    },
    {
      label: "Pending",
      value: countMap["PENDING"] ?? 0,
      icon: <HandCoins className="h-5 w-5" />,
      color: "bg-amber-100 text-amber-600",
    },
    {
      label: "Failed",
      value: (countMap["FAILED"] ?? 0) + (countMap["REFUNDED"] ?? 0),
      icon: <AlertCircle className="h-5 w-5" />,
      color: "bg-red-100 text-red-600",
    },
  ];

  const rows = donations.map((d) => ({
    id: d.id,
    donorName: d.donor.fullName,
    campaignTitle: d.campaign.title,
    amount: Number(d.amount),
    status: d.status,
    paymentProvider: d.paymentProvider,
    createdAt: d.createdAt.toISOString(),
    donatedAt: d.donatedAt?.toISOString() ?? null,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Donations</h1>
        <p className="mt-1 text-sm text-slate-500">
          Track all incoming donations across your campaigns.
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className={`rounded-xl p-2 ${card.color}`}>{card.icon}</div>
              <div>
                <p className="text-xs font-medium text-slate-500">{card.label}</p>
                <p className="text-2xl font-bold text-slate-900">{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Status filter */}
      <DonationStatusFilter activeStatus={status} />

      {/* Table */}
      {rows.length === 0 ? (
        <EmptyState
          icon={<HandCoins className="h-8 w-8" />}
          title="No donations yet"
          description="Donations will appear here once donors contribute to your campaigns."
        />
      ) : (
        <DonationsTable donations={rows} />
      )}
    </div>
  );
}
