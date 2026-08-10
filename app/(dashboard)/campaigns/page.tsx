import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { CampaignStatus } from "@prisma/client";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  PlusCircle,
  TrendingUp,
  Target,
  FolderKanban,
  CheckCircle2,
  MoreHorizontal,
  Eye,
  Pencil,
  BarChart2,
  Trash2,
} from "lucide-react";
import { StatsGrid } from "@/components/dashboard/widgets";
import type { StatItem } from "@/components/dashboard/widgets";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ status?: string }>;
}

type CampaignStatusType = "DRAFT" | "ACTIVE" | "COMPLETED" | "CANCELLED";

const STATUS_STYLES: Record<CampaignStatusType, string> = {
  ACTIVE:    "bg-emerald-100 text-emerald-700",
  DRAFT:     "bg-amber-100 text-amber-700",
  COMPLETED: "bg-blue-100 text-blue-700",
  CANCELLED: "bg-red-100 text-red-700",
};

function formatCurrency(n: number) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`;
  return `₹${n}`;
}

function formatDate(d: Date) {
  return d.toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
}

export default async function MyCampaignsPage({ searchParams }: PageProps) {
  const { status } = await searchParams;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const statusFilter =
    status && Object.values(CampaignStatus).includes(status as CampaignStatus)
      ? (status as CampaignStatus)
      : undefined;

  const [organization, campaigns, summary] = await Promise.all([
    prisma.organization.findUnique({
      where: { profileId: user.id },
      select: { verificationStatus: true, name: true },
    }),
    prisma.campaign.findMany({
      where: {
        organizerId: user.id,
        ...(statusFilter ? { status: statusFilter } : {}),
      },
      orderBy: { updatedAt: "desc" },
      include: { _count: { select: { donations: true } } },
    }),
    prisma.campaign.groupBy({
      by: ["status"],
      where: { organizerId: user.id },
      _count: { id: true },
      _sum: { currentAmount: true },
    }),
  ]);

  const countMap = Object.fromEntries(summary.map((s) => [s.status, s._count.id]));
  const totalRaised = summary.reduce((a, s) => a + Number(s._sum.currentAmount ?? 0), 0);

  const stats: StatItem[] = [
    {
      id: "total",
      title: "Total Campaigns",
      value: Object.values(countMap).reduce((a, b) => a + b, 0),
      icon: <FolderKanban className="h-6 w-6" />,
      description: "All campaigns",
      variant: "slate",
    },
    {
      id: "active",
      title: "Active",
      value: countMap["ACTIVE"] ?? 0,
      icon: <Target className="h-6 w-6" />,
      description: "Currently live",
      variant: "emerald",
    },
    {
      id: "raised",
      title: "Total Raised",
      value: formatCurrency(totalRaised),
      icon: <TrendingUp className="h-6 w-6" />,
      description: "Across all campaigns",
      variant: "blue",
    },
    {
      id: "completed",
      title: "Completed",
      value: countMap["COMPLETED"] ?? 0,
      icon: <CheckCircle2 className="h-6 w-6" />,
      description: "Successfully closed",
      variant: "purple",
    },
  ];

  const STATUS_TABS = [
    { label: "All",       value: "" },
    { label: "Active",    value: "ACTIVE" },
    { label: "Draft",     value: "DRAFT" },
    { label: "Completed", value: "COMPLETED" },
    { label: "Cancelled", value: "CANCELLED" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Campaigns</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage and track all your fundraising campaigns.
          </p>
        </div>
        <Link
          href="/campaigns/new"
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
        >
          <PlusCircle className="h-4 w-4" />
          New Campaign
        </Link>
      </div>

      <StatsGrid stats={stats} />

      {/* Status tabs */}
      <div className="flex gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
        {STATUS_TABS.map((tab) => {
          const isActive = (status ?? "") === tab.value;
          const href = tab.value ? `/campaigns?status=${tab.value}` : "/campaigns";
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

      {/* Campaigns table */}
      {campaigns.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center px-4">
          <FolderKanban className="mb-4 h-10 w-10 text-slate-300" />
          <h3 className="text-base font-semibold text-slate-900">No campaigns yet</h3>
          {organization?.verificationStatus === "APPROVED" ? (
            <>
              <p className="mt-2 text-sm text-slate-500 max-w-md">
                Your organization is verified! You can now create your first campaign to start raising funds.
              </p>
              <Link
                href="/campaigns/new"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                <PlusCircle className="h-4 w-4" />
                Create Campaign
              </Link>
            </>
          ) : (
            <>
              <p className="mt-2 text-sm text-slate-500 max-w-md">
                If your organization is verified, you can create your first campaign.
              </p>
              <Link
                href="/organizer/verification"
                className="mt-6 inline-flex items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-5 py-2.5 text-sm font-semibold text-amber-800 transition hover:bg-amber-100"
              >
                View Verification Status
              </Link>
            </>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  {["Campaign", "Status", "Goal", "Raised", "Progress", "Last Updated", "Actions"].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {campaigns.map((c) => {
                  const progress = Math.min(
                    Math.round((Number(c.currentAmount) / Number(c.goalAmount)) * 100),
                    100
                  );
                  return (
                    <tr key={c.id} className="transition-colors hover:bg-slate-50">
                      <td className="px-5 py-4">
                        <div className="max-w-[200px]">
                          <p className="truncate text-sm font-semibold text-slate-900">{c.title}</p>
                          <p className="text-xs text-slate-500">{c._count.donations} donations</p>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[c.status as CampaignStatusType]}`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                        {formatCurrency(Number(c.goalAmount))}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-emerald-600">
                        {formatCurrency(Number(c.currentAmount))}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-emerald-500"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-500">{progress}%</span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-500">
                        {formatDate(c.updatedAt)}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4">
                        <div className="flex items-center gap-1">
                          <Link
                            href={`/campaigns/${c.id}`}
                            title="View"
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link
                            href={`/campaigns/${c.id}/edit`}
                            title="Edit"
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>
                          <Link
                            href={`/analytics?campaign=${c.id}`}
                            title="Analytics"
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                          >
                            <BarChart2 className="h-4 w-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
