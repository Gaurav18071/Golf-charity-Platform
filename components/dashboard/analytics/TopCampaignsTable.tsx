"use client";

import Link from "next/link";

type CampaignStatus = "DRAFT" | "ACTIVE" | "COMPLETED" | "CANCELLED" | "UNDER_REVIEW" | "REJECTED";

interface TopCampaignRow {
  id: string;
  title: string;
  goalAmount: number;
  currentAmount: number;
  status: CampaignStatus;
  donationCount: number;
}

interface TopCampaignsTableProps {
  campaigns: TopCampaignRow[];
}

const STATUS_STYLES: Record<CampaignStatus, string> = {
  ACTIVE:       "bg-emerald-100 text-emerald-700",
  DRAFT:        "bg-amber-100 text-amber-700",
  COMPLETED:    "bg-blue-100 text-blue-700",
  CANCELLED:    "bg-red-100 text-red-700",
  UNDER_REVIEW: "bg-purple-100 text-purple-700",
  REJECTED:     "bg-red-100 text-red-700",
};

function formatCurrency(n: number) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`;
  return `₹${n}`;
}

export default function TopCampaignsTable({ campaigns }: TopCampaignsTableProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Top Campaigns</h2>
        <Link
          href="/campaigns"
          className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
        >
          View all →
        </Link>
      </div>

      {campaigns.length === 0 ? (
        <p className="text-sm text-slate-500">No campaigns yet.</p>
      ) : (
        <div className="space-y-4">
          {campaigns.map((c, i) => {
            const progress = Math.min(
              Math.round((c.currentAmount / c.goalAmount) * 100),
              100
            );
            return (
              <div key={c.id} className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2 min-w-0">
                    <span className="mt-0.5 shrink-0 text-xs font-bold text-slate-400">
                      #{i + 1}
                    </span>
                    <p className="truncate text-sm font-medium text-slate-900">
                      {c.title}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_STYLES[c.status]}`}
                    >
                      {c.status}
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>
                      {formatCurrency(c.currentAmount)} raised · {c.donationCount} donations
                    </span>
                    <span>
                      {progress}% of {formatCurrency(c.goalAmount)}
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
