/**
 * useDocumentUpload Hook
 * 
 * React hook for managing document upload state and operations.
 * Handles file validation, upload progress, error states, and success feedback.
 * 
 * @module features/organization/hooks/useDocumentUpload
 */

"use client";

import { useState, useCallback } from "react";
import type { DocumentType } from "@prisma/client";
import { uploadDocumentAction, type UploadDocumentActionResponse } from "../actions/document.actions";
import { validateFile, createUploadFormData, type FileValidationResult } from "../utils/document-helpers";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface UploadState {
  /** Current file being uploaded */
  file: File | null;
  
  /** Document type for the upload */
  documentType: DocumentType | null;
  
  /** Upload progress (0-100) */
  progress: number;
  
  /** Whether upload is in progress */
  uploading: boolean;
  
  /** Error message if upload failed */
  error: string | null;
  
  /** Success message after upload */
  success: boolean;
  
  /** Validation result for current file */
  validation: FileValidationResult | null;
  
  /** Uploaded document data */
  uploadedDocument: UploadDocumentActionResponse["document"] | null;
}

export interface UseDocumentUploadOptions {
  /** Organization ID for the upload */
  organizationId: string;
  
  /** Callback when upload succeeds */
  onSuccess?: (document: UploadDocumentActionResponse["document"]) => void;
  
  /** Callback when upload fails */
  onError?: (error: string) => void;
  
  /** Callback for progress updates */
  onProgress?: (progress: number) => void;
  
  /** Auto-validate file on selection */
  autoValidate?: boolean;
}

export interface UseDocumentUploadReturn {
  /** Current upload state */
  state: UploadState;
  
  /** Select a file for upload */
  selectFile: (file: File, documentType: DocumentType) => void;
  
  /** Validate the selected file */
  validateSelectedFile: () => FileValidationResult | null;
  
  /** Upload the selected file */
  upload: () => Promise<void>;
  
  /** Reset upload state */
  reset: () => void;
  
  /** Clear error state */
  clearError: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// HOOK IMPLEMENTATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Hook for managing document uploads
 * 
 * @param options - Upload configuration
 * @returns Upload state and control functions
 * 
 * @example
 * ```tsx
 * const { state, selectFile, upload, reset } = useDocumentUpload({
 *   organizationId: "123",
 *   onSuccess: (doc) => toast.success("Uploaded!"),
 *   onError: (err) => toast.error(err),
 * });
 * 
 * // Select file
 * const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
 *   const file = e.target.files?.[0];
 *   if (file) {
 *     selectFile(file, "REGISTRATION_CERTIFICATE");
 *   }
 * };
 * 
 * // Upload
 * <button onClick={upload} disabled={state.uploading}>
 *   {state.uploading ? "Uploading..." : "Upload"}
 * </button>
 * ```
 */
export function useDocumentUpload(
  options: UseDocumentUploadOptions
): UseDocumentUploadReturn {
  const {
    organizationId,
    onSuccess,
    onError,
    onProgress,
    autoValidate = true,
  } = options;

  // ── State ──────────────────────────────────────────────────────────────────
  const [state, setState] = useState<UploadState>({
    file: null,
    documentType: null,
    progress: 0,
    uploading: false,
    error: null,
    success: false,
    validation: null,
    uploadedDocument: null,
  });

  // ── Select File ────────────────────────────────────────────────────────────
  const selectFile = useCallback(
    (file: File, documentType: DocumentType) => {
      // Validate if auto-validate is enabled
      const validation = autoValidate ? validateFile(file) : null;

      setState({
        file,
        documentType,
        progress: 0,
        uploading: false,
        error: null,
        success: false,
        validation,
        uploadedDocument: null,
      });
    },
    [autoValidate]
  );

  // ── Validate Selected File ─────────────────────────────────────────────────
  const validateSelectedFile = useCallback((): FileValidationResult | null => {
    if (!state.file) {
      return {
        valid: false,
        errors: [{ code: "NO_FILE", message: "No file selected" }],
        warnings: [],
      };
    }

    const validation = validateFile(state.file);

    setState((prev) => ({
      ...prev,
      validation,
    }));

    return validation;
  }, [state.file]);

  // ── Upload ─────────────────────────────────────────────────────────────────
  const upload = useCallback(async () => {
    // ── Validation ─────────────────────────────────────────────────────────
    if (!state.file) {
      const error = "No file selected";
      setState((prev) => ({ ...prev, error }));
      onError?.(error);
      return;
    }

    if (!state.documentType) {
      const error = "Document type not specified";
      setState((prev) => ({ ...prev, error }));
      onError?.(error);
      return;
    }

    // Validate file
    const validation = validateFile(state.file);
    if (!validation.valid) {
      const error = validation.errors[0]?.message || "File validation failed";
      setState((prev) => ({ ...prev, error, validation }));
      onError?.(error);
      return;
    }

    // ── Start Upload ───────────────────────────────────────────────────────
    setState((prev) => ({
      ...prev,
      uploading: true,
      error: null,
      progress: 0,
      success: false,
    }));

    try {
      // Simulate progress (since FormData upload doesn't provide real progress)
      const progressInterval = setInterval(() => {
        setState((prev) => {
          const newProgress = Math.min(prev.progress + 10, 90);
          onProgress?.(newProgress);
          return { ...prev, progress: newProgress };
        });
      }, 200);

      // Create FormData and upload
      const formData = createUploadFormData(
        state.file,
        organizationId,
        state.documentType
      );

      const result = await uploadDocumentAction(formData);

      // Clear progress simulation
      clearInterval(progressInterval);

      // ── Handle Response ────────────────────────────────────────────────────
      if (result.success && result.document) {
        setState((prev) => ({
          ...prev,
          uploading: false,
          progress: 100,
          success: true,
          uploadedDocument: result.document,
        }));

        onProgress?.(100);
        onSuccess?.(result.document);
      } else {
        const error = result.error || "Upload failed";
        setState((prev) => ({
          ...prev,
          uploading: false,
          progress: 0,
          error,
        }));

        onError?.(error);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unexpected error during upload";

      setState((prev) => ({
        ...prev,
        uploading: false,
        progress: 0,
        error: errorMessage,
      }));

      onError?.(errorMessage);
    }
  }, [state.file, state.documentType, organizationId, onSuccess, onError, onProgress]);

  // ── Reset ──────────────────────────────────────────────────────────────────
  const reset = useCallback(() => {
    setState({
      file: null,
      documentType: null,
      progress: 0,
      uploading: false,
      error: null,
      success: false,
      validation: null,
      uploadedDocument: null,
    });
  }, []);

  // ── Clear Error ────────────────────────────────────────────────────────────
  const clearError = useCallback(() => {
    setState((prev) => ({
      ...prev,
      error: null,
    }));
  }, []);

  // ── Return ─────────────────────────────────────────────────────────────────
  return {
    state,
    selectFile,
    validateSelectedFile,
    upload,
    reset,
    clearError,
  };
}
