/**
 * DocumentList Component
 * 
 * Displays a list of uploaded documents with filtering and sorting.
 * Integrates with useDocuments hook.
 * 
 * @module features/organization/components/documents/DocumentList
 */

"use client";

import { FileX } from "lucide-react";
import type { DocumentType } from "@prisma/client";
import { useDocuments } from "../../hooks/useDocuments";
import { DocumentCard } from "./DocumentCard";
import { getDocumentTypeLabel } from "../../utils/document-helpers";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface DocumentListProps {
  /** Organization ID */
  organizationId: string;
  
  /** Filter by document type */
  filterType?: DocumentType;
  
  /** Show actions on cards */
  showActions?: boolean;
  
  /** Show verification status */
  showStatus?: boolean;
  
  /** Compact card view */
  compact?: boolean;
  
  /** Empty state message */
  emptyMessage?: string;
  
  /** Custom className */
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * DocumentList Component
 * 
 * @example
 * ```tsx
 * <DocumentList
 *   organizationId="123"
 *   showActions={true}
 *   showStatus={true}
 * />
 * ```
 */
export function DocumentList({
  organizationId,
  filterType,
  showActions = true,
  showStatus = true,
  compact = false,
  emptyMessage = "No documents uploaded yet",
  className = "",
}: DocumentListProps) {
  // ── Hook ───────────────────────────────────────────────────────────────────
  const { state, refresh } = useDocuments({
    organizationId,
    autoFetch: true,
    onDelete: () => {
      // Refresh after delete
      setTimeout(() => refresh(), 500);
    },
  });

  // ── Filter Documents ───────────────────────────────────────────────────────
  const filteredDocuments = filterType
    ? state.documents.filter((doc) => doc.documentType === filterType)
    : state.documents;

  // ── Loading State ──────────────────────────────────────────────────────────
  if (state.loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="border border-slate-200 rounded-xl p-6 animate-pulse"
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-slate-200 rounded-lg" />
              <div className="flex-1 space-y-3">
                <div className="h-4 bg-slate-200 rounded w-3/4" />
                <div className="h-3 bg-slate-200 rounded w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ── Error State ────────────────────────────────────────────────────────────
  if (state.error) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="inline-flex items-center gap-2 text-red-600 mb-4">
          <FileX className="h-5 w-5" />
          <span className="font-medium">Failed to load documents</span>
        </div>
        <p className="text-sm text-slate-600 mb-4">{state.error}</p>
        <button
          onClick={() => refresh()}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  // ── Empty State ────────────────────────────────────────────────────────────
  if (filteredDocuments.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <FileX className="h-12 w-12 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-600 font-medium">{emptyMessage}</p>
        {filterType && (
          <p className="text-sm text-slate-500 mt-1">
            No {getDocumentTypeLabel(filterType)} documents found
          </p>
        )}
      </div>
    );
  }

  // ── Document List ──────────────────────────────────────────────────────────
  return (
    <div className={`space-y-4 ${className}`}>
      {filteredDocuments.map((document) => (
        <DocumentCard
          key={document.id}
          document={document}
          onReplace={() => refresh()}
          onDelete={() => {
            // Document removed from state by useDocuments hook
          }}
          showActions={showActions}
          showStatus={showStatus}
          compact={compact}
        />
      ))}
    </div>
  );
}
