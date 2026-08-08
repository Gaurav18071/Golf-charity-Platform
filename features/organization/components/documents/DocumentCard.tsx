/**
 * DocumentCard Component
 * 
 * Displays an uploaded document with metadata and action buttons.
 * Supports preview, replace, and delete operations.
 * 
 * @module features/organization/components/documents/DocumentCard
 */

"use client";

import { useState, useRef, type ChangeEvent } from "react";
import {
  FileText,
  Eye,
  RefreshCw,
  Trash2,
  Download,
  MoreVertical,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import type { DocumentType } from "@prisma/client";
import { replaceDocumentAction, deleteDocumentAction, getDocumentPreviewAction } from "../../actions/document.actions";
import {
  getFileIcon,
  formatFileSize,
  formatUploadDate,
  getDocumentTypeLabel,
  getVerificationStatusColor,
  getVerificationStatusLabel,
  truncateFileName,
} from "../../utils/document-helpers";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface DocumentCardProps {
  /** Document data */
  document: {
    id: string;
    documentType: DocumentType;
    originalFileName: string;
    fileSize: number;
    mimeType: string;
    uploadedAt: Date;
    verificationStatus: string;
    reviewerNotes: string | null;
  };
  
  /** Callback when document is replaced */
  onReplace?: () => void;
  
  /** Callback when document is deleted */
  onDelete?: () => void;
  
  /** Show actions (preview, replace, delete) */
  showActions?: boolean;
  
  /** Show verification status */
  showStatus?: boolean;
  
  /** Compact mode */
  compact?: boolean;
  
  /** Custom className */
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * DocumentCard Component
 * 
 * @example
 * ```tsx
 * <DocumentCard
 *   document={doc}
 *   onReplace={() => refreshDocuments()}
 *   onDelete={() => refreshDocuments()}
 *   showActions={true}
 *   showStatus={true}
 * />
 * ```
 */
export function DocumentCard({
  document,
  onReplace,
  onDelete,
  showActions = true,
  showStatus = true,
  compact = false,
  className = "",
}: DocumentCardProps) {
  // ── State ──────────────────────────────────────────────────────────────────
  const [showMenu, setShowMenu] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [replacing, setReplacing] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handlePreview = async () => {
    setPreviewing(true);
    setShowMenu(false);

    try {
      const result = await getDocumentPreviewAction(document.id);

      if (result.success && result.signedUrl) {
        window.open(result.signedUrl, "_blank");
      } else {
        alert(result.error || "Failed to generate preview URL");
      }
    } catch (error) {
      alert("Failed to preview document");
    } finally {
      setPreviewing(false);
    }
  };

  const handleReplaceClick = () => {
    setShowMenu(false);
    fileInputRef.current?.click();
  };

  const handleReplaceFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setReplacing(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("documentId", document.id);

      const result = await replaceDocumentAction(formData);

      if (result.success) {
        onReplace?.();
      } else {
        alert(result.error || "Failed to replace document");
      }
    } catch (error) {
      alert("Failed to replace document");
    } finally {
      setReplacing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDeleteClick = () => {
    setShowMenu(false);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleting(true);

    try {
      const result = await deleteDocumentAction(document.id);

      if (result.success) {
        onDelete?.();
      } else {
        alert(result.error || "Failed to delete document");
        setDeleting(false);
      }
    } catch (error) {
      alert("Failed to delete document");
      setDeleting(false);
    }

    setShowDeleteConfirm(false);
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
  };

  // ── Render Helpers ─────────────────────────────────────────────────────────
  const Icon = getFileIcon(document.mimeType);
  const statusColor = getVerificationStatusColor(document.verificationStatus);
  const statusLabel = getVerificationStatusLabel(document.verificationStatus);

  const getStatusIcon = () => {
    switch (document.verificationStatus) {
      case "APPROVED":
        return CheckCircle;
      case "REJECTED":
        return XCircle;
      case "PENDING":
        return Clock;
      default:
        return AlertCircle;
    }
  };

  const StatusIcon = getStatusIcon();

  // ── Compact View ───────────────────────────────────────────────────────────
  if (compact) {
    return (
      <div className={`flex items-center gap-3 p-3 border border-slate-200 rounded-lg bg-white hover:border-slate-300 transition-colors ${className}`}>
        {/* Icon */}
        <div className="flex-shrink-0 p-2 bg-slate-100 rounded-lg">
          <Icon className="h-5 w-5 text-slate-600" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-900 truncate">
            {truncateFileName(document.originalFileName, 30)}
          </p>
          <p className="text-xs text-slate-500">
            {formatFileSize(document.fileSize)} • {formatUploadDate(document.uploadedAt)}
          </p>
        </div>

        {/* Status Badge */}
        {showStatus && (
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>
            {statusLabel}
          </div>
        )}

        {/* Actions */}
        {showActions && !deleting && (
          <div className="flex items-center gap-1">
            <button
              onClick={handlePreview}
              disabled={previewing}
              className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
              title="Preview"
            >
              <Eye className="h-4 w-4" />
            </button>
            <button
              onClick={handleDeleteClick}
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}

        {deleting && (
          <span className="text-xs text-slate-500">Deleting...</span>
        )}

        {/* Hidden file input for replace */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.png,.jpeg,.jpg"
          onChange={handleReplaceFile}
          className="hidden"
        />

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <DeleteConfirmModal
            fileName={document.originalFileName}
            onConfirm={handleDeleteConfirm}
            onCancel={handleDeleteCancel}
          />
        )}
      </div>
    );
  }

  // ── Full View ──────────────────────────────────────────────────────────────
  return (
    <div className={`border border-slate-200 rounded-xl bg-white hover:border-slate-300 transition-all ${className}`}>
      <div className="p-6">
        <div className="flex items-start gap-4">
          {/* File Icon */}
          <div className="flex-shrink-0 p-3 bg-slate-100 rounded-lg">
            <Icon className="h-8 w-8 text-slate-600" />
          </div>

          {/* Document Info */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-slate-900 truncate">
                  {document.originalFileName}
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  {getDocumentTypeLabel(document.documentType)}
                </p>
              </div>

              {/* Actions Menu */}
              {showActions && !deleting && !replacing && (
                <div className="relative flex-shrink-0">
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <MoreVertical className="h-5 w-5" />
                  </button>

                  {showMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowMenu(false)}
                      />
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-20">
                        <button
                          onClick={handlePreview}
                          className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          Preview
                        </button>
                        <button
                          onClick={handleReplaceClick}
                          className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                        >
                          <RefreshCw className="h-4 w-4" />
                          Replace
                        </button>
                        <hr className="my-1 border-slate-200" />
                        <button
                          onClick={handleDeleteClick}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Metadata */}
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-600">
              <span>{formatFileSize(document.fileSize)}</span>
              <span>•</span>
              <span>Uploaded {formatUploadDate(document.uploadedAt)}</span>
            </div>

            {/* Verification Status */}
            {showStatus && (
              <div className="mt-4">
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${statusColor}`}>
                  <StatusIcon className="h-4 w-4" />
                  {statusLabel}
                </div>

                {/* Reviewer Notes */}
                {document.reviewerNotes && (
                  <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs font-medium text-slate-700 mb-1">
                      Reviewer Notes:
                    </p>
                    <p className="text-sm text-slate-600">
                      {document.reviewerNotes}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Loading States */}
            {(deleting || replacing) && (
              <div className="mt-4 flex items-center gap-2 text-sm text-slate-600">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-300 border-t-emerald-600" />
                <span>{deleting ? "Deleting..." : "Replacing..."}</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions (visible state) */}
        {showActions && !deleting && !replacing && (
          <div className="mt-6 flex gap-3">
            <button
              onClick={handlePreview}
              disabled={previewing}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Eye className="h-4 w-4" />
              {previewing ? "Loading..." : "Preview"}
            </button>
            <button
              onClick={handleReplaceClick}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition-colors flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Replace
            </button>
          </div>
        )}
      </div>

      {/* Hidden file input for replace */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.png,.jpeg,.jpg"
        onChange={handleReplaceFile}
        className="hidden"
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <DeleteConfirmModal
          fileName={document.originalFileName}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DELETE CONFIRMATION MODAL
// ─────────────────────────────────────────────────────────────────────────────

interface DeleteConfirmModalProps {
  fileName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

function DeleteConfirmModal({
  fileName,
  onConfirm,
  onCancel,
}: DeleteConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 p-3 bg-red-100 rounded-full">
            <Trash2 className="h-6 w-6 text-red-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-900">
              Delete Document
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Are you sure you want to delete <strong>{truncateFileName(fileName, 40)}</strong>?
              This action cannot be undone.
            </p>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
