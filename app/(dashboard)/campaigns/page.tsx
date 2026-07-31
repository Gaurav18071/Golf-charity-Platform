import { Target, Plus, TrendingUp, CheckCircle2, Clock } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/src/lib/prisma";
import { CampaignStatus } from "@prisma/client";
import { EmptyState } from "@/src/components/dashboard/shared";
import CampaignCard from "@/src/components/dashboard/campaigns/CampaignCard";
import CampaignStatusFilter from "@/src/components/dashboard/campaigns/CampaignStatusFilter";

interface PageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function CampaignsPage({ searchParams }: PageProps) {
  const { status } = await searchParams;

  const statusFilter =
    status && Object.values(CampaignStatus).includes(status as CampaignStatus)
      ? (status as CampaignStatus)
      : undefined;

  const [campaigns, stats] = await Promise.all([
    prisma.campaign.findMany({
      where: statusFilter ? { status: statusFilter } : undefined,
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { donations: true } },
      },
    }),
    prisma.campaign.groupBy({
      by: ["status"],
      _count: { id: true },
    }),
  ]);

  const countByStatus = Object.fromEntries(
    stats.map((s) => [s.status, s._count.id])
  );

  const summaryCards = [
    {
      label: "Total",
      value: Object.values(countByStatus).reduce((a, b) => a + b, 0),
      icon: <Target className="h-5 w-5" />,
      color: "bg-slate-100 text-slate-600",
    },
    {
      label: "Active",
      value: countByStatus["ACTIVE"] ?? 0,
      icon: <TrendingUp className="h-5 w-5" />,
      color: "bg-emerald-100 text-emerald-600",
    },
    {
      label: "Completed",
      value: countByStatus["COMPLETED"] ?? 0,
      icon: <CheckCircle2 className="h-5 w-5" />,
      color: "bg-blue-100 text-blue-600",
    },
    {
      label: "Draft",
      value: countByStatus["DRAFT"] ?? 0,
      icon: <Clock className="h-5 w-5" />,
      color: "bg-amber-100 text-amber-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Campaigns</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage and track all your fundraising campaigns.
          </p>
        </div>
        <Link
          href="/campaigns/new"
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <Plus className="h-4 w-4" />
          New Campaign
        </Link>
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

      {/* Filter tabs */}
      <CampaignStatusFilter activeStatus={status} />

      {/* Campaign list */}
      {campaigns.length === 0 ? (
        <EmptyState
          icon={<Target className="h-8 w-8" />}
          title="No campaigns yet"
          description="Create your first fundraising campaign to start collecting donations."
          actionLabel="+ New Campaign"
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {campaigns.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={{
                id: campaign.id,
                title: campaign.title,
                slug: campaign.slug,
                description: campaign.description,
                coverImageUrl: campaign.coverImageUrl,
                goalAmount: Number(campaign.goalAmount),
                currentAmount: Number(campaign.currentAmount),
                status: campaign.status,
                startDate: campaign.startDate.toISOString(),
                endDate: campaign.endDate.toISOString(),
                donationCount: campaign._count.donations,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
