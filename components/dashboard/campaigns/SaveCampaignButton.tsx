"use client";

import { useState, useEffect } from "react";
import { Bookmark, Check } from "lucide-react";

interface SaveCampaignButtonProps {
  campaignId: string;
  campaignTitle?: string;
  showLabel?: boolean;
  className?: string;
}

const STORAGE_KEY = "golf_saved_campaign_ids";

export function getSavedCampaignIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function SaveCampaignButton({
  campaignId,
  campaignTitle,
  showLabel = true,
  className = "",
}: SaveCampaignButtonProps) {
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    const ids = getSavedCampaignIds();
    setIsSaved(ids.includes(campaignId));

    const handleUpdate = () => {
      const updatedIds = getSavedCampaignIds();
      setIsSaved(updatedIds.includes(campaignId));
    };

    window.addEventListener("saved_campaigns_updated", handleUpdate);
    return () => {
      window.removeEventListener("saved_campaigns_updated", handleUpdate);
    };
  }, [campaignId]);

  const toggleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const ids = getSavedCampaignIds();
    let newIds: string[];

    if (ids.includes(campaignId)) {
      newIds = ids.filter((id) => id !== campaignId);
      setIsSaved(false);
      setToastMessage("Removed from saved campaigns");
    } else {
      newIds = [...ids, campaignId];
      setIsSaved(true);
      setToastMessage("Campaign saved to bookmarks!");
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newIds));
      window.dispatchEvent(new Event("saved_campaigns_updated"));
    } catch (err) {
      console.error("Failed to save campaign:", err);
    }

    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  if (!mounted) {
    return (
      <button
        type="button"
        disabled
        className={`inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs opacity-60 ${className}`}
      >
        <Bookmark className="h-4 w-4" />
        {showLabel && <span>Save</span>}
      </button>
    );
  }

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onClick={toggleSave}
        title={isSaved ? "Remove from saved" : "Save this campaign"}
        className={`inline-flex items-center gap-1.5 rounded-xl border transition-all ${
          isSaved
            ? "border-emerald-600 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 shadow-xs"
            : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 shadow-xs"
        } px-3.5 py-2 text-xs font-semibold cursor-pointer ${className}`}
      >
        <Bookmark
          className={`h-4 w-4 transition-transform ${
            isSaved ? "fill-emerald-600 text-emerald-600 scale-110" : "text-slate-500"
          }`}
        />
        {showLabel && <span>{isSaved ? "Saved" : "Save Campaign"}</span>}
      </button>

      {toastMessage && (
        <div className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-medium text-white shadow-lg animate-in fade-in slide-in-from-bottom-1 z-50">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
