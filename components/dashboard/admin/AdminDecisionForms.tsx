"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, AlertCircle, Loader2, ShieldCheck, XCircle, AlertTriangle } from "lucide-react";
import {
  approveOrganizationAction,
  rejectOrganizationAction,
  requestChangesOrganizationAction,
} from "@/features/organization/actions/organization.actions";

interface AdminDecisionFormsProps {
  organizationId: string;
  currentStatus: string;
}

export function AdminDecisionForms({
  organizationId,
  currentStatus,
}: AdminDecisionFormsProps) {
  const router = useRouter();

  // Form states
  const [approveNotes, setApproveNotes] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [rejectNotes, setRejectNotes] = useState("");
  const [changeNotes, setChangeNotes] = useState("");
  const [changeAdminNotes, setChangeAdminNotes] = useState("");

  // Loading & status states
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleApprove = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingAction("approve");
    setFeedback(null);

    try {
      const res = await approveOrganizationAction({
        organizationId,
        adminNotes: approveNotes,
      });

      if (!res.success) {
        setFeedback({
          type: "error",
          message: res.error || "Failed to approve organization",
        });
      } else {
        setFeedback({
          type: "success",
          message: "Organization approved successfully! Profile promoted to Organizer.",
        });
        router.refresh();
      }
    } catch (err) {
      setFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Error approving organization",
      });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectReason.trim()) {
      setFeedback({
        type: "error",
        message: "Please enter a rejection reason.",
      });
      return;
    }

    setLoadingAction("reject");
    setFeedback(null);

    try {
      const res = await rejectOrganizationAction({
        organizationId,
        rejectionReason: rejectReason,
        adminNotes: rejectNotes,
      });

      if (!res.success) {
        setFeedback({
          type: "error",
          message: res.error || "Failed to reject organization",
        });
      } else {
        setFeedback({
          type: "success",
          message: "Organization rejected and status updated.",
        });
        router.refresh();
      }
    } catch (err) {
      setFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Error rejecting organization",
      });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleRequestChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!changeNotes.trim()) {
      setFeedback({
        type: "error",
        message: "Please specify required changes.",
      });
      return;
    }

    setLoadingAction("changes");
    setFeedback(null);

    try {
      const res = await requestChangesOrganizationAction({
        organizationId,
        changeRequestNotes: changeNotes,
        adminNotes: changeAdminNotes,
      });

      if (!res.success) {
        setFeedback({
          type: "error",
          message: res.error || "Failed to request changes",
        });
      } else {
        setFeedback({
          type: "success",
          message: "Change request submitted to organizer.",
        });
        router.refresh();
      }
    } catch (err) {
      setFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Error requesting changes",
      });
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="space-y-4">
      {feedback && (
        <div
          className={`flex items-start gap-2.5 rounded-xl p-4 text-sm font-medium border animate-in fade-in ${
            feedback.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          )}
          <div className="flex-1">{feedback.message}</div>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Approve Form */}
        <form onSubmit={handleApprove} className="rounded-xl border border-emerald-200 bg-white p-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="mb-3">
              <div className="text-sm font-bold text-emerald-700 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4" />
                Approve Organization
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Approve verification, promote user to Organizer role, and approve submitted documents.
              </p>
            </div>
            <label className="block text-xs font-semibold text-slate-600">
              Admin notes (Optional)
              <textarea
                value={approveNotes}
                onChange={(e) => setApproveNotes(e.target.value)}
                className="mt-1 min-h-[90px] w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none"
                placeholder="Optional approval notes for records..."
              />
            </label>
          </div>
          <button
            type="submit"
            disabled={loadingAction !== null}
            className="mt-4 w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
          >
            {loadingAction === "approve" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Approving...
              </>
            ) : (
              "Approve Organization"
            )}
          </button>
        </form>

        {/* Reject Form */}
        <form onSubmit={handleReject} className="rounded-xl border border-red-200 bg-white p-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="mb-3">
              <div className="text-sm font-bold text-red-700 flex items-center gap-1.5">
                <XCircle className="h-4 w-4" />
                Reject
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Reject request and send reason to the organizer.
              </p>
            </div>
            <label className="block text-xs font-semibold text-slate-600">
              Rejection reason (Required)
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                required
                className="mt-1 min-h-[70px] w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 resize-none"
                placeholder="Explain why this request is rejected..."
              />
            </label>
            <label className="mt-2 block text-xs font-semibold text-slate-600">
              Admin internal notes
              <input
                type="text"
                value={rejectNotes}
                onChange={(e) => setRejectNotes(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs outline-none focus:border-red-500"
                placeholder="Optional internal notes"
              />
            </label>
          </div>
          <button
            type="submit"
            disabled={loadingAction !== null}
            className="mt-4 w-full rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
          >
            {loadingAction === "reject" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Rejecting...
              </>
            ) : (
              "Reject Request"
            )}
          </button>
        </form>

        {/* Request Changes Form */}
        <form onSubmit={handleRequestChanges} className="rounded-xl border border-amber-200 bg-white p-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="mb-3">
              <div className="text-sm font-bold text-amber-700 flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4" />
                Request Changes
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Send feedback back to organizer to modify and re-submit.
              </p>
            </div>
            <label className="block text-xs font-semibold text-slate-600">
              Change request notes (Required)
              <textarea
                value={changeNotes}
                onChange={(e) => setChangeNotes(e.target.value)}
                required
                className="mt-1 min-h-[70px] w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 resize-none"
                placeholder="Describe corrections required..."
              />
            </label>
            <label className="mt-2 block text-xs font-semibold text-slate-600">
              Admin internal notes
              <input
                type="text"
                value={changeAdminNotes}
                onChange={(e) => setChangeAdminNotes(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs outline-none focus:border-amber-500"
                placeholder="Optional internal notes"
              />
            </label>
          </div>
          <button
            type="submit"
            disabled={loadingAction !== null}
            className="mt-4 w-full rounded-xl border border-amber-400 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-800 hover:bg-amber-100 disabled:opacity-50 transition flex items-center justify-center gap-2"
          >
            {loadingAction === "changes" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Request Changes"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
