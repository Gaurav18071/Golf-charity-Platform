"use client";

import { useState, useTransition, useRef } from "react";
import { Sparkles, Search, X, Loader2, AlertCircle, RotateCcw } from "lucide-react";
import { aiCampaignSearchAction } from "@/app/actions/campaign-search.actions";
import type { CampaignSearchResult, CampaignSearchResponse } from "@/lib/ai/search-types";
import Link from "next/link";

// ─────────────────────────────────────────────────────────────────────────────
// Example chips shown before a search is performed
// ─────────────────────────────────────────────────────────────────────────────
const EXAMPLE_QUERIES = [
  "Education campaigns in Delhi",
  "Health campaigns under ₹5000",
  "Support children",
  "Environmental causes",
  "Disaster relief campaigns",
  "Most raised campaigns",
];

// ─────────────────────────────────────────────────────────────────────────────
// Small currency formatter
// ─────────────────────────────────────────────────────────────────────────────
function fmt(n: number) {
  if (n >= 100_000) return `₹${(n / 100_000).toFixed(1)}L`;
  if (n >= 1_000) return `₹${(n / 1_000).toFixed(0)}K`;
  return `₹${n}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Result Card
// ─────────────────────────────────────────────────────────────────────────────
function SearchResultCard({ campaign }: { campaign: CampaignSearchResult }) {
  const progress = Math.min(
    Math.round((campaign.currentAmount / campaign.goalAmount) * 100),
    100
  );

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      {/* Cover */}
      <div className="relative h-40 bg-slate-100">
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
        <span className="absolute right-2 top-2 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
          {campaign.category.replace(/_/g, " ")}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <h3 className="line-clamp-2 text-sm font-semibold text-slate-900 leading-snug">
          {campaign.title}
        </h3>

        {/* AI explanation chip */}
        {campaign.explanation && (
          <p className="flex items-start gap-1.5 text-[11px] text-emerald-700 font-medium bg-emerald-50 rounded-lg px-2.5 py-1.5">
            <Sparkles className="h-3 w-3 shrink-0 mt-0.5" />
            {campaign.explanation}
          </p>
        )}

        {/* Progress */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-emerald-600">{fmt(campaign.currentAmount)} raised</span>
            <span className="text-slate-400">{progress}% of {fmt(campaign.goalAmount)}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between pt-1">
          <span className="text-[11px] text-slate-400">{campaign.donorCount} donors · ends {campaign.endDate}</span>
          {campaign.location && (
            <span className="text-[11px] text-slate-400">📍 {campaign.location}</span>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t px-4 py-2.5">
        <Link
          href={`/campaigns/${campaign.slug || campaign.id}`}
          className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
        >
          View campaign →
        </Link>
      </div>
    </article>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export function AiCampaignSearch() {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState<CampaignSearchResponse | null>(null);
  const [isPending, startTransition] = useTransition();
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = (q: string) => {
    const trimmed = q.trim();
    if (!trimmed || trimmed.length < 2) return;

    setQuery(trimmed);
    setHasSearched(true);

    startTransition(async () => {
      const result = await aiCampaignSearchAction(trimmed);
      setResponse(result);
    });
  };

  const handleClear = () => {
    setQuery("");
    setResponse(null);
    setHasSearched(false);
    inputRef.current?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  return (
    <section
      id="ai-search-section"
      className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50/40 p-5 shadow-sm"
    >
      {/* Header */}
      <div className="mb-4 flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 shadow-sm">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-900">
            AI Campaign Discovery
          </h2>
          <p className="text-xs text-slate-500">
            Describe what you&apos;re looking for in plain English
          </p>
        </div>
      </div>

      {/* Search Input */}
      <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            id="ai-search-input"
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. Education campaigns in Mumbai under ₹2000…"
            maxLength={500}
            aria-label="Natural language campaign search"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-10 text-sm text-slate-900 placeholder-slate-400 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <button
          type="submit"
          id="ai-search-submit"
          disabled={isPending || !query.trim() || query.trim().length < 2}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-emerald-700 hover:to-teal-800 disabled:opacity-60"
          aria-label="Run AI search"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          <span className="hidden sm:inline">Search</span>
        </button>
      </form>

      {/* Example query chips — shown before any search */}
      {!hasSearched && (
        <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Example searches">
          {EXAMPLE_QUERIES.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => handleSearch(ex)}
              className="rounded-full border border-emerald-200 bg-white px-3 py-1 text-xs font-medium text-emerald-700 transition hover:bg-emerald-600 hover:text-white hover:border-emerald-600"
            >
              {ex}
            </button>
          ))}
        </div>
      )}

      {/* Loading State */}
      {isPending && (
        <div className="mt-5 flex flex-col items-center justify-center gap-2 py-8 text-center">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
          <p className="text-sm font-medium text-slate-600">
            Searching for campaigns…
          </p>
          <p className="text-xs text-slate-400">
            AI is interpreting your query and filtering real campaigns
          </p>
        </div>
      )}

      {/* Results */}
      {!isPending && response && (
        <div className="mt-5 space-y-4">
          {/* Summary Bar */}
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm text-slate-600">
              {response.summary}
              {response.mode === "ai" && (
                <span className="ml-2 inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
                  <Sparkles className="h-2.5 w-2.5" />
                  AI-powered
                </span>
              )}
              {response.mode === "fallback" && (
                <span className="ml-2 text-[10px] text-slate-400">(keyword search)</span>
              )}
            </p>
            <button
              type="button"
              id="ai-search-clear"
              onClick={handleClear}
              className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition"
              aria-label="Clear results and start over"
            >
              <RotateCcw className="h-3 w-3" />
              Clear
            </button>
          </div>

          {/* Error State */}
          {!response.success && response.error && (
            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Search failed</p>
                <p className="mt-0.5 text-xs">{response.error}</p>
                <p className="mt-2 text-xs text-red-600">
                  You can still use the{" "}
                  <a href="#browse-search" className="underline hover:no-underline">
                    keyword search below
                  </a>
                  .
                </p>
              </div>
            </div>
          )}

          {/* Empty State */}
          {response.success && response.results.length === 0 && (
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-slate-200 bg-white py-10 text-center px-4">
              <div className="text-4xl">🔍</div>
              <p className="font-semibold text-slate-800">No matching campaigns found</p>
              <p className="text-sm text-slate-500 max-w-xs">
                Try a different query, or{" "}
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-emerald-600 underline hover:no-underline"
                >
                  browse all active campaigns
                </button>
                .
              </p>
            </div>
          )}

          {/* Campaign Grid */}
          {response.success && response.results.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {response.results.map((campaign) => (
                <SearchResultCard key={campaign.id} campaign={campaign} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Disclaimer */}
      <p className="mt-4 text-[11px] text-slate-400 italic">
        * AI interprets your query. All campaign data is retrieved directly from our verified database.
        AI does not invent or modify campaign information.
      </p>
    </section>
  );
}
