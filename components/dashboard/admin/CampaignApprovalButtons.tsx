"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, Loader2, ExternalLink } from "lucide-react";
import {
  approveCampaignAction,
  rejectCampaignAction,
} from "@/app/actions/campaign.actions";

interface CampaignApprovalButtonsProps {
  campaignId: string;
  campaignSlug?: string;
}

export function CampaignApprovalButtons({
  campaignId,
  campaignSlug,
}: CampaignApprovalButtonsProps) {
  const router = useRouter();
  const [loadingAction, setLoadingAction] = useState<"approve" | "reject" | null>(
    null
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleApprove = async () => {
    setLoadingAction("approve");
    setErrorMessage(null);
    try {
      const res = await approveCampaignAction(campaignId);
      if (!res.success) {
        setErrorMessage(res.error || "Failed to approve campaign");
      } else {
        router.refresh();
      }
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Error approving campaign"
      );
    } finally {
      setLoadingAction(null);
    }
  };

  const handleReject = async () => {
    if (!confirm("Are you sure you want to reject this campaign?")) return;

    setLoadingAction("reject");
    setErrorMessage(null);
    try {
      const res = await rejectCampaignAction(campaignId);
      if (!res.success) {
        setErrorMessage(res.error || "Failed to reject campaign");
      } else {
        router.refresh();
      }
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Error rejecting campaign"
      );
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-1.5">
        <Link
          href={`/campaigns/${campaignSlug || campaignId}`}
          target="_blank"
          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
        >
          <ExternalLink className="h-3.5 w-3.5" /> View
        </Link>

        <button
          type="button"
          onClick={handleApprove}
          disabled={loadingAction !== null}
          className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-50 transition-colors"
        >
          {loadingAction === "approve" ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <CheckCircle2 className="h-3.5 w-3.5" />
          )}
          {loadingAction === "approve" ? "Approving..." : "Approve"}
        </button>

        <button
          type="button"
          onClick={handleReject}
          disabled={loadingAction !== null}
          className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50 transition-colors"
        >
          {loadingAction === "reject" ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <XCircle className="h-3.5 w-3.5" />
          )}
          {loadingAction === "reject" ? "Rejecting..." : "Reject"}
        </button>
      </div>

      {errorMessage && (
        <span className="text-[11px] text-red-600 mt-1">{errorMessage}</span>
      )}
    </div>
  );
}
