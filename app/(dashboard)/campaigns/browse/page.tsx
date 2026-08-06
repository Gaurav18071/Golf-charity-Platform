import { Search } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { CampaignStatus } from "@prisma/client";
import { CampaignCardWidget } from "@/components/dashboard/widgets";
import type { CampaignWidgetItem } from "@/components/dashboard/widgets";
import SortSelect from "@/components/dashboard/campaigns/SortSelect";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{
    q?: string;
    status?: string;
    sort?: string;
  }>;
}

function formatDate(d: Date) {
  return d.toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
}

export default async function BrowseCampaignsPage({ searchParams }: PageProps) {
  const { q, status, sort } = await searchParams;

  const statusFilter =
    status && Object.values(CampaignStatus).includes(status as CampaignStatus)
      ? (status as CampaignStatus)
      : CampaignStatus.ACTIVE;

  const campaigns = await prisma.campaign.findMany({
    where: {
      status: statusFilter,
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy:
      sort === "raised"
        ? { currentAmount: "desc" }
        : sort === "oldest"
          ? { createdAt: "asc" }
          : { createdAt: "desc" },
    include: {
      _count: { select: { donations: true } },
    },
  });

  const widgetItems: CampaignWidgetItem[] = campaigns.map((c) => ({
    id: c.id,
    title: c.title,
    coverImageUrl: c.coverImageUrl,
    goalAmount: Number(c.goalAmount),
    currentAmount: Number(c.currentAmount),
    status: c.status,
    endDate: formatDate(c.endDate),
    donorCount: c._count.donations,
    href: `/campaigns/${c.id}`,
  }));

  const STATUS_TABS = [
    { label: "Active",    value: "ACTIVE" },
    { label: "Completed", value: "COMPLETED" },
    { label: "Draft",     value: "DRAFT" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Browse Campaigns</h1>
        <p className="mt-1 text-sm text-slate-500">
          Discover causes to support across all active campaigns.
        </p>
      </div>

      {/* Search + Filters bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <form method="GET" className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            name="q"
            defaultValue={q ?? ""}
            placeholder="Search campaigns…"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm text-slate-900 placeholder-slate-400 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
          {/* preserve other params */}
          {status && <input type="hidden" name="status" value={status} />}
          {sort && <input type="hidden" name="sort" value={sort} />}
        </form>

        {/* Sort */}
        <SortSelect defaultValue={sort ?? "newest"} q={q} status={status} />
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
        {STATUS_TABS.map((tab) => {
          const isActive = (statusFilter ?? "ACTIVE") === tab.value;
          return (
            <a
              key={tab.value}
              href={`/campaigns/browse?${new URLSearchParams({
                ...(q ? { q } : {}),
                status: tab.value,
                ...(sort ? { sort } : {}),
              }).toString()}`}
              className={[
                "whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
              ].join(" ")}
            >
              {tab.label}
            </a>
          );
        })}
      </div>

      {/* Results count */}
      <p className="text-sm text-slate-500">
        {widgetItems.length} campaign{widgetItems.length !== 1 ? "s" : ""} found
        {q ? ` for "${q}"` : ""}
      </p>

      {/* Campaign grid */}
      {widgetItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
          <div className="mb-4 text-5xl">🎯</div>
          <h3 className="text-base font-semibold text-slate-900">
            No campaigns found
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            {q
              ? `No results for "${q}". Try a different search term.`
              : "There are no campaigns in this category yet."}
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {widgetItems.map((campaign) => (
            <CampaignCardWidget key={campaign.id} campaign={campaign} />
          ))}
        </div>
      )}
    </div>
  );
}
