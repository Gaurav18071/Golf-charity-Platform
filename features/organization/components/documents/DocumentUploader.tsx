/**
 * DocumentUploader Component
 * 
 * Drag & drop file upload interface with validation and progress tracking.
 * Supports both drag-and-drop and click-to-browse file selection.
 * 
 * @module features/organization/components/documents/DocumentUploader
 */

"use client";

import { useState, useRef, type ChangeEvent, type DragEvent } from "react";
import { Upload, FileText, AlertCircle, CheckCircle, X } from "lucide-react";
import type { DocumentType } from "@prisma/client";
import { useDocumentUpload } from "../../hooks/useDocumentUpload";
import {
  validateFile,
  getFileIcon,
  formatFileSize,
  truncateFileName,
  getDocumentTypeLabel,
  getDocumentTypeDescription,
  DOCUMENT_TYPE_METADATA,
} from "../../utils/document-helpers";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface DocumentUploaderProps {
  /** Organization ID for the upload */
  organizationId: string;
  
  /** Pre-selected document type (optional) */
  documentType?: DocumentType;
  
  /** Allow document type selection */
  allowTypeSelection?: boolean;
  
  /** Callback when upload succeeds */
  onSuccess?: (document: any) => void;
  
  /** Callback when upload fails */
  onError?: (error: string) => void;
  
  /** Show compact version */
  compact?: boolean;
  
  /** Custom className */
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * DocumentUploader Component
 * 
 * @example
 * ```tsx
 * <DocumentUploader
 *   organizationId="123"
 *   documentType="REGISTRATION_CERTIFICATE"
 *   onSuccess={(doc) => {
 *     toast.success("Document uploaded!");
 *     refresh();
 *   }}
 * />
 * ```
 */
export function DocumentUploader({
  organizationId,
  documentType: initialDocumentType,
  allowTypeSelection = !initialDocumentType,
  onSuccess,
  onError,
  compact = false,
  className = "",
}: DocumentUploaderProps) {
  // ── State ──────────────────────────────────────────────────────────────────
  const [isDragging, setIsDragging] = useState(false);
  const [selectedType, setSelectedType] = useState<DocumentType | null>(
    initialDocumentType || null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Upload Hook ────────────────────────────────────────────────────────────
  const upload = useDocumentUpload({
    organizationId,
    onSuccess: (document) => {
      onSuccess?.(document);
      // Reset after successful upload
      setTimeout(() => {
        upload.reset();
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }, 2000);
    },
    onError: (error) => {
      onError?.(error);
    },
    autoValidate: true,
  });

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleFileSelect = (file: File) => {
    if (!selectedType) {
      onError?.("Please select a document type first");
      return;
    }

    upload.selectFile(file, selectedType);
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleUploadClick = () => {
    upload.upload();
  };

  const handleCancel = () => {
    upload.reset();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // ── Render Helpers ─────────────────────────────────────────────────────────
  const FileIcon = upload.state.file ? getFileIcon(upload.state.file) : Upload;
  const metadata = selectedType ? DOCUMENT_TYPE_METADATA[selectedType] : null;

  // ── Compact View ───────────────────────────────────────────────────────────
  if (compact) {
    return (
      <div className={`space-y-3 ${className}`}>
        {/* Type Selector */}
        {allowTypeSelection && (
          <select
            value={selectedType || ""}
            onChange={(e) => setSelectedType(e.target.value as DocumentType)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            disabled={upload.state.uploading}
          >
            <option value="">Select document type...</option>
            {Object.entries(DOCUMENT_TYPE_METADATA).map(([type, meta]) => (
              <option key={type} value={type}>
                {meta.label} {meta.required && "*"}
              </option>
            ))}
          </select>
        )}

        {/* File Input */}
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.png,.jpeg,.jpg"
            onChange={handleFileInputChange}
            className="flex-1 text-sm"
            disabled={upload.state.uploading || !selectedType}
          />
          
          {upload.state.file && !upload.state.success && (
            <button
              onClick={handleUploadClick}
              disabled={upload.state.uploading || !upload.state.validation?.valid}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-sm font-medium"
            >
              {upload.state.uploading ? `${upload.state.progress}%` : "Upload"}
            </button>
          )}
        </div>

        {/* Validation Errors */}
        {upload.state.validation && !upload.state.validation.valid && (
          <div className="text-sm text-red-600 space-y-1">
            {upload.state.validation.errors.map((err) => (
              <p key={err.code}>• {err.message}</p>
            ))}
          </div>
        )}

        {/* Progress */}
        {upload.state.uploading && (
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div
              className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${upload.state.progress}%` }}
            />
          </div>
        )}

        {/* Success */}
        {upload.state.success && (
          <div className="flex items-center gap-2 text-emerald-600 text-sm">
            <CheckCircle className="h-4 w-4" />
            <span>Document uploaded successfully!</span>
          </div>
        )}

        {/* Error */}
        {upload.state.error && (
          <div className="flex items-center gap-2 text-red-600 text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>{upload.state.error}</span>
          </div>
        )}
      </div>
    );
  }

  // ── Full View ──────────────────────────────────────────────────────────────
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Document Type Selector */}
      {allowTypeSelection && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Document Type <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedType || ""}
            onChange={(e) => setSelectedType(e.target.value as DocumentType)}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            disabled={upload.state.uploading}
          >
            <option value="">Select document type...</option>
            {Object.entries(DOCUMENT_TYPE_METADATA).map(([type, meta]) => (
              <option key={type} value={type}>
                {meta.label} {meta.required && "*"}
              </option>
            ))}
          </select>
          
          {metadata && (
            <p className="mt-1.5 text-sm text-slate-500">
              {metadata.description}
            </p>
          )}
        </div>
      )}

      {/* Upload Area */}
      <div>
        {!upload.state.file ? (
          // ── Drag & Drop Zone ─────────────────────────────────────────────
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleBrowseClick}
            className={`
              relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
              transition-all duration-200
              ${isDragging
                ? "border-emerald-500 bg-emerald-50"
                : "border-slate-300 hover:border-emerald-400 hover:bg-slate-50"
              }
              ${!selectedType ? "opacity-50 cursor-not-allowed" : ""}
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.png,.jpeg,.jpg"
              onChange={handleFileInputChange}
              className="hidden"
              disabled={!selectedType}
            />

            <div className="flex flex-col items-center gap-3">
              <div className={`
                p-3 rounded-full
                ${isDragging ? "bg-emerald-100" : "bg-slate-100"}
              `}>
                <Upload className={`h-8 w-8 ${isDragging ? "text-emerald-600" : "text-slate-400"}`} />
              </div>

              <div>
                <p className="text-base font-medium text-slate-700">
                  {isDragging ? "Drop file here" : "Drag & drop file here"}
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  or click to browse
                </p>
              </div>

              {metadata && (
                <div className="mt-2 text-xs text-slate-500 space-y-0.5">
                  <p>Accepted formats: {metadata.acceptedFormats}</p>
                  <p>Maximum size: 10 MB</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          // ── Selected File Preview ────────────────────────────────────────
          <div className="border border-slate-300 rounded-xl p-6 bg-white">
            <div className="flex items-start gap-4">
              {/* File Icon */}
              <div className="flex-shrink-0 p-3 bg-slate-100 rounded-lg">
                <FileIcon className="h-8 w-8 text-slate-600" />
              </div>

              {/* File Info */}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-slate-900 truncate">
                  {truncateFileName(upload.state.file.name, 50)}
                </h4>
                <p className="text-sm text-slate-500 mt-0.5">
                  {formatFileSize(upload.state.file.size)}
                </p>

                {/* Validation Messages */}
                {upload.state.validation && (
                  <div className="mt-3 space-y-1.5">
                    {/* Errors */}
                    {upload.state.validation.errors.map((err) => (
                      <div
                        key={err.code}
                        className="flex items-start gap-2 text-sm text-red-600"
                      >
                        <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                        <span>{err.message}</span>
                      </div>
                    ))}

                    {/* Warnings */}
                    {upload.state.validation.warnings.map((warn) => (
                      <div
                        key={warn.code}
                        className="flex items-start gap-2 text-sm text-amber-600"
                      >
                        <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                        <span>{warn.message}</span>
                      </div>
                    ))}

                    {/* Success */}
                    {upload.state.validation.valid && (
                      <div className="flex items-center gap-2 text-sm text-emerald-600">
                        <CheckCircle className="h-4 w-4" />
                        <span>File is valid and ready to upload</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Progress Bar */}
                {upload.state.uploading && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-slate-600">Uploading...</span>
                      <span className="font-medium text-emerald-600">
                        {upload.state.progress}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${upload.state.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Success Message */}
                {upload.state.success && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-emerald-600">
                    <CheckCircle className="h-4 w-4" />
                    <span>Document uploaded successfully!</span>
                  </div>
                )}

                {/* Error Message */}
                {upload.state.error && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <span>{upload.state.error}</span>
                  </div>
                )}
              </div>

              {/* Remove Button */}
              {!upload.state.uploading && !upload.state.success && (
                <button
                  onClick={handleCancel}
                  className="flex-shrink-0 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Remove file"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Action Buttons */}
            {!upload.state.uploading && !upload.state.success && (
              <div className="mt-6 flex gap-3">
                <button
                  onClick={handleUploadClick}
                  disabled={!upload.state.validation?.valid}
                  className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed font-medium transition-colors"
                >
                  Upload Document
                </button>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
