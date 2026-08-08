/**
 * DocumentPreview Component
 * 
 * Modal component for previewing documents (PDF and images).
 * Supports fullscreen view, download, and close actions.
 * 
 * @module features/organization/components/documents/DocumentPreview
 */

"use client";

import { useState, useEffect } from "react";
import { X, Download, Maximize2, Minimize2, Loader2 } from "lucide-react";
import { getDocumentPreviewAction } from "../../actions/document.actions";
import { truncateFileName, isImageFile, isPDFFile } from "../../utils/document-helpers";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface DocumentPreviewProps {
  /** Document ID to preview */
  documentId: string;
  
  /** Document file name */
  fileName: string;
  
  /** Document MIME type */
  mimeType: string;
  
  /** Is preview open */
  isOpen: boolean;
  
  /** Callback when preview is closed */
  onClose: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * DocumentPreview Component
 * 
 * @example
 * ```tsx
 * const [previewId, setPreviewId] = useState<string | null>(null);
 * 
 * <DocumentPreview
 *   documentId={previewId!}
 *   fileName="certificate.pdf"
 *   mimeType="application/pdf"
 *   isOpen={!!previewId}
 *   onClose={() => setPreviewId(null)}
 * />
 * ```
 */
export function DocumentPreview({
  documentId,
  fileName,
  mimeType,
  isOpen,
  onClose,
}: DocumentPreviewProps) {
  // ── State ──────────────────────────────────────────────────────────────────
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // ── Fetch Signed URL ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen || !documentId) return;

    const fetchUrl = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await getDocumentPreviewAction(documentId);

        if (result.success && result.signedUrl) {
          setSignedUrl(result.signedUrl);
        } else {
          setError(result.error || "Failed to generate preview URL");
        }
      } catch (err) {
        setError("Failed to load preview");
      } finally {
        setLoading(false);
      }
    };

    void fetchUrl();
  }, [documentId, isOpen]);

  // ── Cleanup ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) {
      setSignedUrl(null);
      setError(null);
      setIsFullscreen(false);
    }
  }, [isOpen]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleDownload = () => {
    if (signedUrl) {
      const link = document.createElement("a");
      link.href = signedUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // ── Keyboard Shortcuts ─────────────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "f" || e.key === "F") {
        toggleFullscreen();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // ── Render Helpers ─────────────────────────────────────────────────────────
  const isImage = mimeType.startsWith("image/");
  const isPDF = mimeType === "application/pdf";

  // ── Don't render if not open ───────────────────────────────────────────────
  if (!isOpen) return null;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={handleBackdropClick}
    >
      <div
        className={`
          bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden
          ${isFullscreen ? "w-full h-full" : "w-full max-w-5xl h-[90vh]"}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-slate-900 truncate">
              {truncateFileName(fileName, 60)}
            </h3>
            <p className="text-sm text-slate-500 mt-0.5">
              {mimeType}
            </p>
          </div>

          <div className="flex items-center gap-2 ml-4">
            {/* Download Button */}
            {signedUrl && (
              <button
                onClick={handleDownload}
                className="p-2 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                title="Download (Ctrl+D)"
              >
                <Download className="h-5 w-5" />
              </button>
            )}

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="p-2 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
              title={isFullscreen ? "Exit Fullscreen (F)" : "Fullscreen (F)"}
            >
              {isFullscreen ? (
                <Minimize2 className="h-5 w-5" />
              ) : (
                <Maximize2 className="h-5 w-5" />
              )}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Close (Esc)"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden bg-slate-100">
          {loading && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Loader2 className="h-12 w-12 text-emerald-600 animate-spin mx-auto mb-4" />
                <p className="text-slate-600">Loading preview...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                  <X className="h-8 w-8 text-red-600" />
                </div>
                <p className="text-lg font-medium text-slate-900 mb-2">
                  Preview Failed
                </p>
                <p className="text-sm text-slate-600">{error}</p>
              </div>
            </div>
          )}

          {signedUrl && !loading && !error && (
            <>
              {/* PDF Preview */}
              {isPDF && (
                <iframe
                  src={signedUrl}
                  className="w-full h-full border-none"
                  title={fileName}
                />
              )}

              {/* Image Preview */}
              {isImage && (
                <div className="flex items-center justify-center h-full p-8">
                  <img
                    src={signedUrl}
                    alt={fileName}
                    className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                  />
                </div>
              )}

              {/* Unsupported Type */}
              {!isPDF && !isImage && (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <p className="text-slate-600 mb-4">
                      Preview not available for this file type
                    </p>
                    <button
                      onClick={handleDownload}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium transition-colors inline-flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download File
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Hints */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-4">
              <span>Press <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded text-xs font-mono">Esc</kbd> to close</span>
              <span>Press <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded text-xs font-mono">F</kbd> for fullscreen</span>
            </div>
            {signedUrl && (
              <span>Preview URL expires in 1 hour</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
