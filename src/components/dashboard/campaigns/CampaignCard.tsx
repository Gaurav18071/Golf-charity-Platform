"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Calendar, Users, TrendingUp } from "lucide-react";

type CampaignStatus = "DRAFT" | "ACTIVE" | "COMPLETED" | "CANCELLED";

interface CampaignCardProps {
  campaign: {
    id: string;
    title: string;
    slug: string;
    description: string;
    coverImageUrl: string | null;
    goalAmount: number;
    currentAmount: number;
    status: CampaignStatus;
    startDate: string;
    endDate: string;
    donationCount: number;
  };
}

const STATUS_STYLES: Record<CampaignStatus, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-700",
  DRAFT: "bg-amber-100 text-amber-700",
  COMPLETED: "bg-blue-100 text-blue-700",
  CANCELLED: "bg-red-100 text-red-700",
};

function formatCurrency(amount: number): string {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}K`;
  return `₹${amount}`;
}

export default function CampaignCard({ campaign }: CampaignCardProps) {
  const [daysLeft, setDaysLeft] = useState(0);

  useEffect(() => {
    const endDate = new Date(campaign.endDate);
    setDaysLeft(
      Math.max(
        0,
        Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      )
    );
  }, [campaign.endDate]);

  const progress = Math.min(
    Math.round((campaign.currentAmount / campaign.goalAmount) * 100),
    100
  );

  return (
    <article className="flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md overflow-hidden">
      {/* Cover image */}
      <div className="relative h-40 bg-slate-100">
        {campaign.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={campaign.coverImageUrl}
            alt={campaign.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-400">
            <TrendingUp className="h-10 w-10" />
          </div>
        )}
        <span
          className={`absolute right-3 top-3 rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[campaign.status]}`}
        >
          {campaign.status}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="font-semibold text-slate-900 leading-snug line-clamp-2">
          {campaign.title}
        </h3>
        <p className="text-sm text-slate-500 line-clamp-2">
          {campaign.description}
        </p>

        {/* Progress */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-emerald-600">
              {formatCurrency(campaign.currentAmount)}
            </span>
            <span className="text-slate-400">
              of {formatCurrency(campaign.goalAmount)} • {progress}%
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Meta */}
        <div className="mt-auto flex items-center gap-4 pt-2 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {campaign.donationCount} donations
          </span>
          {campaign.status === "ACTIVE" && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {daysLeft}d left
            </span>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t px-5 py-3">
        <Link
          href={`/campaigns/${campaign.id}`}
          className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
        >
          View details →
        </Link>
      </div>
    </article>
  );
}
