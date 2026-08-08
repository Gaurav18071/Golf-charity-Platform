/**
 * DocumentManager Component
 * 
 * Complete document management interface combining all document components.
 * This is a full-featured example showing how to integrate:
 * - DocumentUploader
 * - DocumentList
 * - DocumentPreview
 * 
 * @module features/organization/components/documents/DocumentManager
 */

"use client";

import { useState } from "react";
import { Plus, FileText } from "lucide-react";
import { DocumentUploader } from "./DocumentUploader";
import { DocumentList } from "./DocumentList";
import { DocumentPreview } from "./DocumentPreview";
import { useDocuments } from "../../hooks/useDocuments";
import type { DocumentType } from "@prisma/client";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface DocumentManagerProps {
  /** Organization ID */
  organizationId: string;
  
  /** Show upload section initially */
  showUploaderInitially?: boolean;
  
  /** Allow uploading new documents */
  allowUpload?: boolean;
  
  /** Show document actions (preview, replace, delete) */
  showActions?: boolean;
  
  /** Show verification status badges */
  showStatus?: boolean;
  
  /** Custom className */
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * DocumentManager Component
 * 
 * Complete document management interface.
 * 
 * @example
 * ```tsx
 * <DocumentManager
 *   organizationId="123e4567-e89b-12d3-a456-426614174000"
 *   allowUpload={true}
 *   showActions={true}
 *   showStatus={true}
 * />
 * ```
 */
export function DocumentManager({
  organizationId,
  showUploaderInitially = false,
  allowUpload = true,
  showActions = true,
  showStatus = true,
  className = "",
}: DocumentManagerProps) {
  // ── State ──────────────────────────────────────────────────────────────────
  const [showUploader, setShowUploader] = useState(showUploaderInitially);
  const [previewDocument, setPreviewDocument] = useState<{
    id: string;
    fileName: string;
    mimeType: string;
  } | null>(null);

  // ── Hooks ──────────────────────────────────────────────────────────────────
  const documents = useDocuments({
    organizationId,
    autoFetch: true,
    onLoad: (docs) => {
      console.log(`Loaded ${docs.length} documents`);
    },
    onDelete: (id) => {
      console.log(`Document ${id} deleted`);
    },
  });

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleUploadSuccess = () => {
    setShowUploader(false);
    documents.refresh();
  };

  const handlePreview = (doc: any) => {
    setPreviewDocument({
      id: doc.id,
      fileName: doc.originalFileName,
      mimeType: doc.mimeType,
    });
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Documents</h2>
          <p className="text-sm text-slate-600 mt-1">
            Upload and manage your organization documents
          </p>
        </div>

        {allowUpload && !showUploader && (
          <button
            onClick={() => setShowUploader(true)}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium transition-colors inline-flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Upload Document
          </button>
        )}
      </div>

      {/* Upload Section */}
      {showUploader && (
        <div className="border border-slate-200 rounded-xl p-6 bg-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">
              Upload New Document
            </h3>
            <button
              onClick={() => setShowUploader(false)}
              className="text-sm text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
          </div>

          <DocumentUploader
            organizationId={organizationId}
            onSuccess={handleUploadSuccess}
            onError={(error) => {
              console.error("Upload failed:", error);
            }}
          />
        </div>
      )}

      {/* Statistics */}
      {!documents.state.loading && documents.state.documents.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            label="Total Documents"
            value={documents.state.documents.length}
            icon={FileText}
          />
          <StatCard
            label="Pending Review"
            value={documents.state.documents.filter(d => d.verificationStatus === "PENDING").length}
            icon={FileText}
            color="amber"
          />
          <StatCard
            label="Approved"
            value={documents.state.documents.filter(d => d.verificationStatus === "APPROVED").length}
            icon={FileText}
            color="emerald"
          />
        </div>
      )}

      {/* Document List */}
      <div>
        <DocumentList
          organizationId={organizationId}
          showActions={showActions}
          showStatus={showStatus}
        />
      </div>

      {/* Preview Modal */}
      {previewDocument && (
        <DocumentPreview
          documentId={previewDocument.id}
          fileName={previewDocument.fileName}
          mimeType={previewDocument.mimeType}
          isOpen={true}
          onClose={() => setPreviewDocument(null)}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STAT CARD COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: number;
  icon: typeof FileText;
  color?: "slate" | "amber" | "emerald";
}

function StatCard({ label, value, icon: Icon, color = "slate" }: StatCardProps) {
  const colorClasses = {
    slate: "bg-slate-100 text-slate-600",
    amber: "bg-amber-100 text-amber-600",
    emerald: "bg-emerald-100 text-emerald-600",
  };

  return (
    <div className="border border-slate-200 rounded-xl p-4 bg-white">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
          <p className="text-sm text-slate-600">{label}</p>
        </div>
      </div>
    </div>
  );
}
