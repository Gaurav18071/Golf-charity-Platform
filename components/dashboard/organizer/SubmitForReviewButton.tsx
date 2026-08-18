"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Send, Loader2, CheckCircle2, AlertCircle, FileText } from "lucide-react";
import { submitOrganizationAction } from "@/features/organization/actions/organization.actions";

interface SubmitForReviewButtonProps {
  organizationId: string;
  className?: string;
  buttonText?: string;
}

export function SubmitForReviewButton({
  organizationId,
  className = "",
  buttonText = "Submit for Review",
}: SubmitForReviewButtonProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await submitOrganizationAction(organizationId);
      if (!res.success) {
        setError(res.error || "Failed to submit organization for review.");
        return;
      }

      setSuccess(true);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const isMissingDocsError = error?.toLowerCase().includes("missing required documents");

  return (
    <div className="space-y-2">
      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800">
          <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span>{error}</span>
            {isMissingDocsError && (
              <Link
                href="/organizer/documents"
                className="mt-1.5 flex items-center gap-1.5 font-semibold text-red-700 underline underline-offset-2 hover:text-red-900"
              >
                <FileText className="h-3.5 w-3.5" />
                Go to Documents to upload required files →
              </Link>
            )}
          </div>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-medium text-emerald-800">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>Submitted successfully! Verification status is now Pending Review.</span>
        </div>
      )}

      {!success && (
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className={`inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50 ${className}`}
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin shrink-0" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 shrink-0" />
              {buttonText}
            </>
          )}
        </button>
      )}
    </div>
  );
}
