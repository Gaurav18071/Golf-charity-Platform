"use client";

import { useState } from "react";
import { Eye, Download, Loader2, AlertCircle, ExternalLink } from "lucide-react";
import { getDocumentPreviewAction } from "@/features/organization/actions/document.actions";

interface AdminDocumentActionsProps {
  documentId: string;
  fileName: string;
}

export function AdminDocumentActions({
  documentId,
  fileName,
}: AdminDocumentActionsProps) {
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [loadingDownload, setLoadingDownload] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handlePreview = async () => {
    setLoadingPreview(true);
    setErrorMessage(null);

    try {
      const res = await getDocumentPreviewAction(documentId);

      if (!res.success || !res.signedUrl) {
        setErrorMessage(res.error || "Failed to generate preview URL");
        return;
      }

      window.open(res.signedUrl, "_blank", "noopener,noreferrer");
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Error opening preview"
      );
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleDownload = async () => {
    setLoadingDownload(true);
    setErrorMessage(null);

    try {
      const res = await getDocumentPreviewAction(documentId);

      if (!res.success || !res.signedUrl) {
        setErrorMessage(res.error || "Failed to generate download link");
        return;
      }

      // Trigger download
      const response = await fetch(res.signedUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName || "document";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Error downloading document"
      );
    } finally {
      setLoadingDownload(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handlePreview}
          disabled={loadingPreview || loadingDownload}
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition disabled:opacity-50"
        >
          {loadingPreview ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <Eye className="h-3.5 w-3.5" />
              Preview
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleDownload}
          disabled={loadingPreview || loadingDownload}
          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition disabled:opacity-50"
        >
          {loadingDownload ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Downloading...
            </>
          ) : (
            <>
              <Download className="h-3.5 w-3.5" />
              Download
            </>
          )}
        </button>
      </div>

      {errorMessage && (
        <span className="text-[11px] text-red-600 flex items-center gap-1 mt-1">
          <AlertCircle className="h-3 w-3 shrink-0" />
          {errorMessage}
        </span>
      )}
    </div>
  );
}
