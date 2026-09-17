"use client";

import { useState, useEffect } from "react";
import { Sparkles, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { getCampaignRecommendationsAction } from "@/app/actions/campaign-search.actions";
import type { CampaignSearchResult, CampaignRecommendationsResponse } from "@/lib/ai/search-types";
import Link from "next/link";

// ─────────────────────────────────────────────────────────────────────────────
// Mini Campaign Card for recommendations
// ─────────────────────────────────────────────────────────────────────────────
function RecommendationCard({ campaign }: { campaign: CampaignSearchResult }) {
  const progress = Math.min(
    Math.round((campaign.currentAmount / campaign.goalAmount) * 100),
    100
  );

  const fmt = (n: number) => {
    if (n >= 100_000) return `₹${(n / 100_000).toFixed(1)}L`;
    if (n >= 1_000) return `₹${(n / 1_000).toFixed(0)}K`;
    return `₹${n}`;
  };

  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      {/* Cover image */}
      <div className="relative h-32 bg-slate-100">
        {campaign.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={campaign.coverImageUrl}
            alt={campaign.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-200 text-4xl">
            🎯
          </div>
        )}
        <span className="absolute left-2 top-2 rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-emerald-700">
          {campaign.category.replace(/_/g, " ")}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-2 p-3.5">
        <h3 className="line-clamp-2 text-xs font-semibold text-slate-900 leading-snug">
          {campaign.title}
        </h3>

        {/* AI explanation */}
        {campaign.explanation && (
          <p className="flex items-start gap-1 text-[10px] text-emerald-700 font-medium bg-emerald-50 rounded-lg px-2 py-1">
            <Sparkles className="h-2.5 w-2.5 shrink-0 mt-0.5" />
            {campaign.explanation}
          </p>
        )}

        {/* Progress bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] font-medium">
            <span className="text-emerald-600">{fmt(campaign.currentAmount)}</span>
            <span className="text-slate-400">{progress}% of {fmt(campaign.goalAmount)}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between">
          <span className="text-[10px] text-slate-400">{campaign.donorCount} donors</span>
          {campaign.location && (
            <span className="text-[10px] text-slate-400 truncate max-w-[100px]">
              📍 {campaign.location}
            </span>
          )}
        </div>
      </div>

      {/* Footer link */}
      <div className="border-t px-3.5 py-2">
        <Link
          href={`/campaigns/${campaign.slug || campaign.id}`}
          className="text-xs font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
        >
          View details →
        </Link>
      </div>
    </article>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

interface CampaignRecommendationsProps {
  /** Title shown at top of the section */
  title?: string;
}

export function CampaignRecommendations({
  title = "Recommended for You",
}: CampaignRecommendationsProps) {
  const [data, setData] = useState<CampaignRecommendationsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const result = await getCampaignRecommendationsAction();
        if (!cancelled) setData(result);
      } catch {
        if (!cancelled) {
          setData({
            success: false,
            recommendations: [],
            reason: "",
            error: "Failed to load recommendations.",
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [refreshKey]);

  // Hide entirely if auth not available (server action returns auth error)
  if (!loading && data && !data.success && data.error === "Authentication required") {
    return null;
  }

  return (
    <section
      id="campaign-recommendations"
      aria-label="Campaign recommendations"
      className="space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-indigo-700 shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">{title}</h2>
            {data?.reason && !loading && (
              <p className="text-xs text-slate-500">{data.reason}</p>
            )}
          </div>
        </div>
        <button
          type="button"
          id="recommendations-refresh"
          onClick={() => setRefreshKey((k) => k + 1)}
          disabled={loading}
          aria-label="Refresh recommendations"
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition disabled:opacity-40"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-200 bg-white py-10">
          <Loader2 className="h-5 w-5 animate-spin text-emerald-500" />
          <span className="text-sm text-slate-500">Loading recommendations…</span>
        </div>
      )}

      {/* Error State */}
      {!loading && data && !data.success && data.error !== "Authentication required" && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <p>{data.error ?? "Could not load recommendations."}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && data?.success && data.recommendations.length === 0 && (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-slate-200 bg-white py-8 text-center px-4">
          <div className="text-3xl">🌱</div>
          <p className="text-sm font-semibold text-slate-800">No recommendations yet</p>
          <p className="text-xs text-slate-500 max-w-xs">
            Start donating to campaigns and we&apos;ll tailor suggestions based on your interests.
          </p>
          <Link
            href="/campaigns/browse"
            className="mt-2 inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition"
          >
            Browse all campaigns
          </Link>
        </div>
      )}

      {/* Campaign Grid */}
      {!loading && data?.success && data.recommendations.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.recommendations.map((campaign) => (
            <RecommendationCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      )}

      {/* Privacy notice */}
      {!loading && data?.success && data.recommendations.length > 0 && (
        <p className="text-[11px] text-slate-400 italic">
          * Recommendations are based on your donation history (categories only).
          No sensitive personal information is used or shared.
        </p>
      )}
    </section>
  );
}
