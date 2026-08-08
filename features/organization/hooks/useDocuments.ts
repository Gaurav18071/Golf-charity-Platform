/**
 * useDocuments Hook
 * 
 * React hook for managing organization documents.
 * Handles fetching, deleting, and refreshing document lists.
 * 
 * @module features/organization/hooks/useDocuments
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import type { DocumentType } from "@prisma/client";
import {
  getDocumentsAction,
  deleteDocumentAction,
  getDocumentPreviewAction,
  type GetDocumentsActionResponse,
} from "../actions/document.actions";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface Document {
  id: string;
  documentType: DocumentType;
  originalFileName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: Date;
  verificationStatus: string;
  reviewerNotes: string | null;
}

export interface DocumentsState {
  /** List of documents */
  documents: Document[];
  
  /** Loading state */
  loading: boolean;
  
  /** Error message */
  error: string | null;
  
  /** Delete operation in progress */
  deleting: Record<string, boolean>;
  
  /** Preview URLs cache */
  previewUrls: Record<string, string>;
}

export interface UseDocumentsOptions {
  /** Organization ID */
  organizationId: string;
  
  /** Auto-fetch on mount */
  autoFetch?: boolean;
  
  /** Callback when documents are loaded */
  onLoad?: (documents: Document[]) => void;
  
  /** Callback when document is deleted */
  onDelete?: (documentId: string) => void;
}

export interface UseDocumentsReturn {
  /** Current state */
  state: DocumentsState;
  
  /** Fetch documents */
  fetch: () => Promise<void>;
  
  /** Refresh documents (re-fetch) */
  refresh: () => Promise<void>;
  
  /** Delete a document */
  deleteDocument: (documentId: string) => Promise<boolean>;
  
  /** Get preview URL for a document */
  getPreviewUrl: (documentId: string) => Promise<string | null>;
  
  /** Find document by ID */
  findDocument: (documentId: string) => Document | undefined;
  
  /** Find documents by type */
  findDocumentsByType: (documentType: DocumentType) => Document[];
  
  /** Check if document type exists */
  hasDocumentType: (documentType: DocumentType) => boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// HOOK IMPLEMENTATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Hook for managing organization documents
 * 
 * @param options - Configuration options
 * @returns Documents state and control functions
 * 
 * @example
 * ```tsx
 * const { state, refresh, deleteDocument, getPreviewUrl } = useDocuments({
 *   organizationId: "123",
 *   autoFetch: true,
 * });
 * 
 * // Delete document
 * const handleDelete = async (id: string) => {
 *   const success = await deleteDocument(id);
 *   if (success) {
 *     toast.success("Document deleted");
 *   }
 * };
 * 
 * // Preview document
 * const handlePreview = async (id: string) => {
 *   const url = await getPreviewUrl(id);
 *   if (url) window.open(url, '_blank');
 * };
 * ```
 */
export function useDocuments(
  options: UseDocumentsOptions
): UseDocumentsReturn {
  const { organizationId, autoFetch = true, onLoad, onDelete } = options;

  // ── State ──────────────────────────────────────────────────────────────────
  const [state, setState] = useState<DocumentsState>({
    documents: [],
    loading: false,
    error: null,
    deleting: {},
    previewUrls: {},
  });

  // ── Fetch Documents ────────────────────────────────────────────────────────
  const fetch = useCallback(async () => {
    setState((prev) => ({
      ...prev,
      loading: true,
      error: null,
    }));

    try {
      const result = await getDocumentsAction(organizationId);

      if (result.success && result.documents) {
        const documents = result.documents.map((doc) => ({
          ...doc,
          uploadedAt: new Date(doc.uploadedAt),
        }));

        setState((prev) => ({
          ...prev,
          documents,
          loading: false,
        }));

        onLoad?.(documents);
      } else {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: result.error || "Failed to load documents",
        }));
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : "Unexpected error",
      }));
    }
  }, [organizationId, onLoad]);

  // ── Refresh Documents ──────────────────────────────────────────────────────
  const refresh = useCallback(async () => {
    await fetch();
  }, [fetch]);

  // ── Delete Document ────────────────────────────────────────────────────────
  const deleteDocument = useCallback(
    async (documentId: string): Promise<boolean> => {
      // Set deleting state
      setState((prev) => ({
        ...prev,
        deleting: { ...prev.deleting, [documentId]: true },
      }));

      try {
        const result = await deleteDocumentAction(documentId);

        if (result.success) {
          // Remove document from state
          setState((prev) => ({
            ...prev,
            documents: prev.documents.filter((doc) => doc.id !== documentId),
            deleting: { ...prev.deleting, [documentId]: false },
          }));

          onDelete?.(documentId);
          return true;
        } else {
          setState((prev) => ({
            ...prev,
            deleting: { ...prev.deleting, [documentId]: false },
            error: result.error || "Failed to delete document",
          }));
          return false;
        }
      } catch (error) {
        setState((prev) => ({
          ...prev,
          deleting: { ...prev.deleting, [documentId]: false },
          error: error instanceof Error ? error.message : "Unexpected error",
        }));
        return false;
      }
    },
    [onDelete]
  );

  // ── Get Preview URL ────────────────────────────────────────────────────────
  const getPreviewUrl = useCallback(
    async (documentId: string): Promise<string | null> => {
      // Check cache first
      if (state.previewUrls[documentId]) {
        return state.previewUrls[documentId];
      }

      try {
        const result = await getDocumentPreviewAction(documentId);

        if (result.success && result.signedUrl) {
          // Cache the URL
          setState((prev) => ({
            ...prev,
            previewUrls: {
              ...prev.previewUrls,
              [documentId]: result.signedUrl!,
            },
          }));

          return result.signedUrl;
        } else {
          setState((prev) => ({
            ...prev,
            error: result.error || "Failed to generate preview URL",
          }));
          return null;
        }
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : "Unexpected error",
        }));
        return null;
      }
    },
    [state.previewUrls]
  );

  // ── Find Document ──────────────────────────────────────────────────────────
  const findDocument = useCallback(
    (documentId: string): Document | undefined => {
      return state.documents.find((doc) => doc.id === documentId);
    },
    [state.documents]
  );

  // ── Find Documents By Type ─────────────────────────────────────────────────
  const findDocumentsByType = useCallback(
    (documentType: DocumentType): Document[] => {
      return state.documents.filter((doc) => doc.documentType === documentType);
    },
    [state.documents]
  );

  // ── Has Document Type ──────────────────────────────────────────────────────
  const hasDocumentType = useCallback(
    (documentType: DocumentType): boolean => {
      return state.documents.some((doc) => doc.documentType === documentType);
    },
    [state.documents]
  );

  // ── Auto-fetch on Mount ────────────────────────────────────────────────────
  useEffect(() => {
    if (autoFetch && organizationId) {
      void fetch();
    }
  }, [autoFetch, organizationId, fetch]);

  // ── Return ─────────────────────────────────────────────────────────────────
  return {
    state,
    fetch,
    refresh,
    deleteDocument,
    getPreviewUrl,
    findDocument,
    findDocumentsByType,
    hasDocumentType,
  };
}
