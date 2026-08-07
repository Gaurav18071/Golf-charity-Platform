/**
 * Document Service
 * 
 * Business logic layer for organization document management.
 * Orchestrates storage and database operations.
 * 
 * Responsibilities:
 * - Document upload workflow (storage + database)
 * - Document replacement workflow
 * - Document deletion workflow
 * - Permission validation
 * - File validation
 * - Business rules enforcement
 * 
 * @module features/organization/services/document.service
 */

import type { DocumentType } from "@prisma/client";
import { OrganizationStorageRepository } from "../repositories/storage.repository";
import * as documentRepository from "../repositories/document.repository";
import * as organizationRepository from "../repositories/organization.repository";
import type {
  OrganizationDocument,
  CreateDocumentInput,
} from "../types/organization.types";
import {
  MAX_FILE_SIZE,
  ALLOWED_MIME_TYPES,
} from "@/lib/supabase/storage";

/**
 * Service error types
 */
export enum DocumentServiceErrorType {
  ORGANIZATION_NOT_FOUND = "ORGANIZATION_NOT_FOUND",
  PERMISSION_DENIED = "PERMISSION_DENIED",
  DOCUMENT_NOT_FOUND = "DOCUMENT_NOT_FOUND",
  INVALID_FILE_TYPE = "INVALID_FILE_TYPE",
  FILE_TOO_LARGE = "FILE_TOO_LARGE",
  DUPLICATE_DOCUMENT_TYPE = "DUPLICATE_DOCUMENT_TYPE",
  UPLOAD_FAILED = "UPLOAD_FAILED",
  DELETE_FAILED = "DELETE_FAILED",
  VALIDATION_FAILED = "VALIDATION_FAILED",
}

/**
 * Custom service error class
 */
export class DocumentServiceError extends Error {
  constructor(
    public type: DocumentServiceErrorType,
    message: string,
    public originalError?: unknown
  ) {
    super(message);
    this.name = "DocumentServiceError";
  }
}

/**
 * File validation result
 */
interface FileValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Upload document input
 */
export interface UploadDocumentInput {
  file: File;
  organizationId: string;
  documentType: DocumentType;
  userId: string; // For permission check
}

/**
 * Upload document result
 */
export interface UploadDocumentResult {
  document: OrganizationDocument;
  message: string;
}

/**
 * Delete document input
 */
export interface DeleteDocumentInput {
  documentId: string;
  userId: string; // For permission check
}

/**
 * Replace document input
 */
export interface ReplaceDocumentInput {
  documentId: string;
  newFile: File;
  userId: string; // For permission check
}

/**
 * Document Service
 */
export class DocumentService {
  private storageRepository: OrganizationStorageRepository;

  constructor() {
    this.storageRepository = new OrganizationStorageRepository();
  }

  // ───────────────────────────────────────────────────────────────────────────
  // VALIDATION
  // ───────────────────────────────────────────────────────────────────────────

  /**
   * Validate file before upload
   * 
   * @param file - File to validate
   * @returns Validation result
   */
  private validateFile(file: File): FileValidationResult {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `File size exceeds maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)} MB`,
      };
    }

    // Check file type
    if (!ALLOWED_MIME_TYPES.includes(file.type as typeof ALLOWED_MIME_TYPES[number])) {
      return {
        valid: false,
        error: `File type ${file.type} is not allowed. Allowed types: PDF, PNG, JPEG, JPG`,
      };
    }

    // Check file name
    if (!file.name || file.name.trim().length === 0) {
      return {
        valid: false,
        error: "File name is required",
      };
    }

    return { valid: true };
  }

  /**
   * Check if user has permission to manage organization documents
   * 
   * @param userId - User ID
   * @param organizationId - Organization ID
   * @returns True if user owns the organization
   */
  private async checkPermission(
    userId: string,
    organizationId: string
  ): Promise<boolean> {
    const organization = await organizationRepository.findOrganizationById(
      organizationId
    );

    if (!organization) {
      return false;
    }

    return organization.profileId === userId;
  }

  /**
   * Check if document type already exists for organization
   * 
   * @param organizationId - Organization ID
   * @param documentType - Document type to check
   * @returns True if document type already exists
   */
  private async isDocumentTypeDuplicate(
    organizationId: string,
    documentType: DocumentType
  ): Promise<boolean> {
    const count = await documentRepository.countDocumentsByType(
      organizationId,
      documentType
    );

    return count > 0;
  }

  // ───────────────────────────────────────────────────────────────────────────
  // UPLOAD WORKFLOW
  // ───────────────────────────────────────────────────────────────────────────

  /**
   * Upload a document
   * 
   * Workflow:
   * 1. Validate user permissions
   * 2. Validate file (type, size)
   * 3. Check for duplicate document type
   * 4. Upload file to storage
   * 5. Save metadata to database
   * 6. Return document record
   * 
   * On failure: Rollback storage upload if database save fails
   * 
   * @param input - Upload input
   * @returns Upload result
   */
  async uploadDocument(
    input: UploadDocumentInput
  ): Promise<UploadDocumentResult> {
    const { file, organizationId, documentType, userId } = input;

    try {
      // ── Step 1: Validate organization exists ────────────────────────────────
      const organization = await organizationRepository.findOrganizationById(
        organizationId
      );

      if (!organization) {
        throw new DocumentServiceError(
          DocumentServiceErrorType.ORGANIZATION_NOT_FOUND,
          "Organization not found"
        );
      }

      // ── Step 2: Check permissions ───────────────────────────────────────────
      const hasPermission = await this.checkPermission(userId, organizationId);

      if (!hasPermission) {
        throw new DocumentServiceError(
          DocumentServiceErrorType.PERMISSION_DENIED,
          "You do not have permission to upload documents for this organization"
        );
      }

      // ── Step 3: Validate file ───────────────────────────────────────────────
      const validation = this.validateFile(file);

      if (!validation.valid) {
        throw new DocumentServiceError(
          DocumentServiceErrorType.VALIDATION_FAILED,
          validation.error || "File validation failed"
        );
      }

      // ── Step 4: Check for duplicate document type ───────────────────────────
      const isDuplicate = await this.isDocumentTypeDuplicate(
        organizationId,
        documentType
      );

      if (isDuplicate) {
        throw new DocumentServiceError(
          DocumentServiceErrorType.DUPLICATE_DOCUMENT_TYPE,
          `A ${documentType} document already exists. Please delete the existing document first or use replace.`
        );
      }

      // ── Step 5: Generate storage path ───────────────────────────────────────
      const storagePath = this.storageRepository.generatePath(
        organizationId,
        documentType,
        file.name
      );

      // ── Step 6: Upload to storage ───────────────────────────────────────────
      let uploadResult;
      try {
        uploadResult = await this.storageRepository.upload(
          file,
          storagePath,
          file.type
        );
      } catch (error) {
        throw new DocumentServiceError(
          DocumentServiceErrorType.UPLOAD_FAILED,
          "Failed to upload file to storage",
          error
        );
      }

      // ── Step 7: Save to database ────────────────────────────────────────────
      const documentData: CreateDocumentInput = {
        organizationId,
        documentType,
        originalFileName: file.name,
        storagePath: uploadResult.path,
        mimeType: file.type,
        fileSize: file.size,
      };

      let document: OrganizationDocument;
      try {
        document = await documentRepository.createDocument(documentData);
      } catch (error) {
        // ── Rollback: Delete from storage if database save fails ─────────────
        console.error("Database save failed, rolling back storage upload...");
        try {
          await this.storageRepository.delete(uploadResult.path);
        } catch (deleteError) {
          console.error("Failed to rollback storage upload:", deleteError);
        }

        throw new DocumentServiceError(
          DocumentServiceErrorType.UPLOAD_FAILED,
          "Failed to save document metadata to database",
          error
        );
      }

      return {
        document,
        message: "Document uploaded successfully",
      };
    } catch (error) {
      if (error instanceof DocumentServiceError) {
        throw error;
      }

      throw new DocumentServiceError(
        DocumentServiceErrorType.UPLOAD_FAILED,
        "Unexpected error during document upload",
        error
      );
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // DELETE WORKFLOW
  // ───────────────────────────────────────────────────────────────────────────

  /**
   * Delete a document
   * 
   * Workflow:
   * 1. Find document by ID
   * 2. Validate user permissions
   * 3. Delete from database
   * 4. Delete from storage
   * 
   * @param input - Delete input
   * @returns Success message
   */
  async deleteDocument(input: DeleteDocumentInput): Promise<{ message: string }> {
    const { documentId, userId } = input;

    try {
      // ── Step 1: Find document ───────────────────────────────────────────────
      const document = await documentRepository.findDocumentById(documentId);

      if (!document) {
        throw new DocumentServiceError(
          DocumentServiceErrorType.DOCUMENT_NOT_FOUND,
          "Document not found"
        );
      }

      // ── Step 2: Check permissions ───────────────────────────────────────────
      const hasPermission = await this.checkPermission(
        userId,
        document.organizationId
      );

      if (!hasPermission) {
        throw new DocumentServiceError(
          DocumentServiceErrorType.PERMISSION_DENIED,
          "You do not have permission to delete this document"
        );
      }

      // ── Step 3: Delete from database ────────────────────────────────────────
      try {
        await documentRepository.deleteDocument(documentId);
      } catch (error) {
        throw new DocumentServiceError(
          DocumentServiceErrorType.DELETE_FAILED,
          "Failed to delete document from database",
          error
        );
      }

      // ── Step 4: Delete from storage ─────────────────────────────────────────
      try {
        await this.storageRepository.delete(document.storagePath);
      } catch (error) {
        // Log but don't fail - database record is already deleted
        console.error("Failed to delete file from storage:", error);
        console.warn(`Orphaned file in storage: ${document.storagePath}`);
      }

      return {
        message: "Document deleted successfully",
      };
    } catch (error) {
      if (error instanceof DocumentServiceError) {
        throw error;
      }

      throw new DocumentServiceError(
        DocumentServiceErrorType.DELETE_FAILED,
        "Unexpected error during document deletion",
        error
      );
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // REPLACE WORKFLOW
  // ───────────────────────────────────────────────────────────────────────────

  /**
   * Replace an existing document
   * 
   * Workflow:
   * 1. Find existing document
   * 2. Validate user permissions
   * 3. Validate new file
   * 4. Upload new file to storage
   * 5. Update database record
   * 6. Delete old file from storage
   * 
   * @param input - Replace input
   * @returns Updated document
   */
  async replaceDocument(
    input: ReplaceDocumentInput
  ): Promise<UploadDocumentResult> {
    const { documentId, newFile, userId } = input;

    try {
      // ── Step 1: Find existing document ──────────────────────────────────────
      const existingDocument = await documentRepository.findDocumentById(
        documentId
      );

      if (!existingDocument) {
        throw new DocumentServiceError(
          DocumentServiceErrorType.DOCUMENT_NOT_FOUND,
          "Document not found"
        );
      }

      // ── Step 2: Check permissions ───────────────────────────────────────────
      const hasPermission = await this.checkPermission(
        userId,
        existingDocument.organizationId
      );

      if (!hasPermission) {
        throw new DocumentServiceError(
          DocumentServiceErrorType.PERMISSION_DENIED,
          "You do not have permission to replace this document"
        );
      }

      // ── Step 3: Validate new file ───────────────────────────────────────────
      const validation = this.validateFile(newFile);

      if (!validation.valid) {
        throw new DocumentServiceError(
          DocumentServiceErrorType.VALIDATION_FAILED,
          validation.error || "File validation failed"
        );
      }

      // ── Step 4: Generate new storage path ───────────────────────────────────
      const newStoragePath = this.storageRepository.generatePath(
        existingDocument.organizationId,
        existingDocument.documentType,
        newFile.name
      );

      // ── Step 5: Upload new file to storage ──────────────────────────────────
      let uploadResult;
      try {
        uploadResult = await this.storageRepository.upload(
          newFile,
          newStoragePath,
          newFile.type
        );
      } catch (error) {
        throw new DocumentServiceError(
          DocumentServiceErrorType.UPLOAD_FAILED,
          "Failed to upload replacement file to storage",
          error
        );
      }

      // ── Step 6: Update database record ──────────────────────────────────────
      let updatedDocument: OrganizationDocument;
      try {
        updatedDocument = await documentRepository.updateDocument(documentId, {
          originalFileName: newFile.name,
          storagePath: uploadResult.path,
          mimeType: newFile.type,
          fileSize: newFile.size,
          verificationStatus: "PENDING", // Reset verification status
          reviewerNotes: null, // Clear previous review notes
          reviewedAt: null,
        });
      } catch (error) {
        // ── Rollback: Delete new file if database update fails ────────────────
        console.error("Database update failed, rolling back new file upload...");
        try {
          await this.storageRepository.delete(uploadResult.path);
        } catch (deleteError) {
          console.error("Failed to rollback new file upload:", deleteError);
        }

        throw new DocumentServiceError(
          DocumentServiceErrorType.UPLOAD_FAILED,
          "Failed to update document metadata in database",
          error
        );
      }

      // ── Step 7: Delete old file from storage ────────────────────────────────
      try {
        await this.storageRepository.delete(existingDocument.storagePath);
      } catch (error) {
        // Log but don't fail - new file is already uploaded and database updated
        console.error("Failed to delete old file from storage:", error);
        console.warn(`Orphaned file in storage: ${existingDocument.storagePath}`);
      }

      return {
        document: updatedDocument,
        message: "Document replaced successfully",
      };
    } catch (error) {
      if (error instanceof DocumentServiceError) {
        throw error;
      }

      throw new DocumentServiceError(
        DocumentServiceErrorType.UPLOAD_FAILED,
        "Unexpected error during document replacement",
        error
      );
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // READ OPERATIONS
  // ───────────────────────────────────────────────────────────────────────────

  /**
   * Get all documents for an organization
   * 
   * @param organizationId - Organization ID
   * @param userId - User ID for permission check
   * @returns Array of documents with signed URLs
   */
  async getDocuments(
    organizationId: string,
    userId: string
  ): Promise<OrganizationDocument[]> {
    // Check permissions
    const hasPermission = await this.checkPermission(userId, organizationId);

    if (!hasPermission) {
      throw new DocumentServiceError(
        DocumentServiceErrorType.PERMISSION_DENIED,
        "You do not have permission to view documents for this organization"
      );
    }

    return await documentRepository.findDocumentsByOrganizationId(
      organizationId
    );
  }

  /**
   * Get signed URL for document preview
   * 
   * @param documentId - Document ID
   * @param userId - User ID for permission check
   * @returns Signed URL
   */
  async getDocumentSignedUrl(
    documentId: string,
    userId: string
  ): Promise<{ signedUrl: string; expiresIn: number }> {
    // Find document
    const document = await documentRepository.findDocumentById(documentId);

    if (!document) {
      throw new DocumentServiceError(
        DocumentServiceErrorType.DOCUMENT_NOT_FOUND,
        "Document not found"
      );
    }

    // Check permissions
    const hasPermission = await this.checkPermission(
      userId,
      document.organizationId
    );

    if (!hasPermission) {
      throw new DocumentServiceError(
        DocumentServiceErrorType.PERMISSION_DENIED,
        "You do not have permission to view this document"
      );
    }

    // Generate signed URL (valid for 1 hour)
    return await this.storageRepository.getSignedUrl(document.storagePath, 3600);
  }
}

/**
 * Default document service instance
 */
export const documentService = new DocumentService();
