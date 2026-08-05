import Link from "next/link";
import { Calendar, Users } from "lucide-react";

type CampaignStatus = "DRAFT" | "ACTIVE" | "COMPLETED" | "CANCELLED" | "UNDER_REVIEW" | "REJECTED";

export interface CampaignWidgetItem {
  id: string;
  title: string;
  coverImageUrl: string | null;
  goalAmount: number;
  currentAmount: number;
  status: CampaignStatus;
  endDate: string;
  donorCount: number;
  href: string;
}

interface CampaignCardWidgetProps {
  campaign: CampaignWidgetItem;
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

/**
 * CampaignCardWidget
 *
 * Reusable campaign card used in browse, organizer dashboard, and saved pages.
 */
export function CampaignCardWidget({ campaign }: CampaignCardWidgetProps) {
  const progress = Math.min(
    Math.round((campaign.currentAmount / campaign.goalAmount) * 100),
    100
  );

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      {/* Cover */}
      <div className="relative h-44 bg-slate-100">
        {campaign.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={campaign.coverImageUrl}
            alt={campaign.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-300">
            <span className="text-4xl">🎯</span>
          </div>
        )}
        <span className={`absolute right-3 top-3 rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[campaign.status]}`}>
          {campaign.status}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="line-clamp-2 text-sm font-semibold text-slate-900 leading-snug">
          {campaign.title}
        </h3>

        {/* Progress */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-emerald-600">
              {formatCurrency(campaign.currentAmount)} raised
            </span>
            <span className="text-slate-400">
              {progress}% of {formatCurrency(campaign.goalAmount)}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Meta */}
        <div className="mt-auto flex items-center gap-4 pt-1 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {campaign.donorCount} donors
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {campaign.endDate}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t px-5 py-3">
        <Link
          href={campaign.href}
          className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
        >
          View details →
        </Link>
      </div>
    </article>
  );
}
