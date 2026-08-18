"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Bookmark, BookOpen, Heart, ArrowRight, Trash2 } from "lucide-react";
import { getSavedCampaignIds, SaveCampaignButton } from "./SaveCampaignButton";

export interface CampaignItem {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  category: string;
  goalAmount: number;
  currentAmount: number;
  coverImageUrl?: string | null;
  status: string;
  organization?: {
    name: string;
  } | null;
}

interface SavedCampaignsListProps {
  allCampaigns: CampaignItem[];
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function SavedCampaignsList({ allCampaigns }: SavedCampaignsListProps) {
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    setSavedIds(getSavedCampaignIds());

    const handleUpdate = () => {
      setSavedIds(getSavedCampaignIds());
    };

    window.addEventListener("saved_campaigns_updated", handleUpdate);
    return () => {
      window.removeEventListener("saved_campaigns_updated", handleUpdate);
    };
  }, []);

  if (!mounted) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-80 w-full animate-pulse rounded-2xl bg-slate-100"
          />
        ))}
      </div>
    );
  }

  const savedCampaigns = allCampaigns.filter((c) => savedIds.includes(c.id));

  if (savedCampaigns.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-20 text-center shadow-xs">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <Bookmark className="h-8 w-8 text-emerald-600" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">No saved campaigns yet</h3>
        <p className="mt-2 max-w-sm text-sm text-slate-500">
          Browse active campaigns and click the <strong>Save Campaign</strong> button to bookmark them for quick access.
        </p>
        <Link
          href="/campaigns/browse"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
        >
          <BookOpen className="h-4 w-4" />
          Browse Campaigns
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
        {savedCampaigns.length} {savedCampaigns.length === 1 ? "Campaign" : "Campaigns"} Saved
      </p>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {savedCampaigns.map((campaign) => {
          const goal = Number(campaign.goalAmount);
          const current = Number(campaign.currentAmount);
          const percent = Math.min(100, Math.round((current / (goal || 1)) * 100));

          return (
            <div
              key={campaign.id}
              className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs transition hover:shadow-md"
            >
              <div>
                {/* Image */}
                <div className="relative h-44 w-full bg-slate-100">
                  {campaign.coverImageUrl ? (
                    <Image
                      src={campaign.coverImageUrl}
                      alt={campaign.title}
                      fill
                      className="object-cover transition duration-300 group-hover:scale-105"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-100 text-emerald-600">
                      <Heart className="h-12 w-12 opacity-30" />
                    </div>
                  )}

                  {/* Bookmark Button Overlay */}
                  <div className="absolute top-3 right-3 z-10">
                    <SaveCampaignButton
                      campaignId={campaign.id}
                      campaignTitle={campaign.title}
                      showLabel={false}
                      className="!p-2 !rounded-full !bg-white/90 backdrop-blur-xs shadow-md"
                    />
                  </div>

                  {/* Category Pill */}
                  <span className="absolute bottom-3 left-3 rounded-full bg-white/90 backdrop-blur-xs px-2.5 py-1 text-[11px] font-bold text-slate-800 uppercase tracking-wider shadow-xs">
                    {campaign.category.replace(/_/g, " ")}
                  </span>
                </div>

                {/* Body */}
                <div className="p-5">
                  <h3 className="text-base font-bold text-slate-900 line-clamp-1 group-hover:text-emerald-700 transition">
                    <Link href={`/campaigns/${campaign.slug || campaign.id}`}>
                      {campaign.title}
                    </Link>
                  </h3>

                  {campaign.organization && (
                    <p className="mt-0.5 text-xs text-slate-500 font-medium">
                      by {campaign.organization.name}
                    </p>
                  )}

                  <p className="mt-2 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {campaign.shortDescription}
                  </p>

                  {/* Progress */}
                  <div className="mt-4 space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-emerald-700">{formatCurrency(current)}</span>
                      <span className="text-slate-500">Goal: {formatCurrency(goal)}</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full bg-emerald-600 rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="border-t border-slate-100 bg-slate-50/50 p-4">
                <Link
                  href={`/campaigns/${campaign.slug || campaign.id}`}
                  className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-emerald-700"
                >
                  <span>Donate / View Details</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
