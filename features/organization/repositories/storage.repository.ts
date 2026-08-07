/**
 * Storage Repository
 * 
 * Handles file storage operations for organization documents.
 * Provides abstraction over Supabase Storage.
 * 
 * Responsibilities:
 * - Upload files to storage
 * - Delete files from storage
 * - Generate signed URLs for file access
 * - Generate unique file paths
 * 
 * @module features/organization/repositories/storage.repository
 */

import {
  SupabaseStorageClient,
  ORGANIZATION_DOCUMENTS_BUCKET,
  type UploadResult,
  type SignedUrlResult,
} from "@/lib/supabase/storage";
import type { DocumentType } from "@prisma/client";

/**
 * Storage repository for organization documents
 */
export class OrganizationStorageRepository {
  private storage: SupabaseStorageClient;

  constructor() {
    this.storage = new SupabaseStorageClient(ORGANIZATION_DOCUMENTS_BUCKET);
  }

  /**
   * Generate a unique storage path for a document
   * 
   * @param organizationId - Organization UUID
   * @param documentType - Type of document
   * @param originalFileName - Original file name
   * @returns Storage path
   * 
   * @example
   * generatePath(
   *   "123e4567-e89b-12d3-a456-426614174000",
   *   "REGISTRATION_CERTIFICATE",
   *   "certificate.pdf"
   * )
   * // Returns: "123e4567-e89b-12d3-a456-426614174000/registration-certificate-1234567890.pdf"
   */
  generatePath(
    organizationId: string,
    documentType: DocumentType,
    originalFileName: string
  ): string {
    // Get file extension
    const extension = originalFileName.substring(
      originalFileName.lastIndexOf(".")
    );

    // Convert document type to kebab-case
    const documentTypeName = documentType.toLowerCase().replace(/_/g, "-");

    // Add timestamp for uniqueness
    const timestamp = Date.now();

    // Construct path: organizationId/document-type-timestamp.ext
    return `${organizationId}/${documentTypeName}-${timestamp}${extension}`;
  }

  /**
   * Upload a file to storage
   * 
   * @param file - File to upload
   * @param path - Storage path
   * @param contentType - MIME type
   * @returns Upload result
   */
  async upload(
    file: File | Buffer | ArrayBuffer,
    path: string,
    contentType: string
  ): Promise<UploadResult> {
    return this.storage.upload(path, file, contentType);
  }

  /**
   * Delete a file from storage
   * 
   * @param path - Storage path to delete
   */
  async delete(path: string): Promise<void> {
    return this.storage.delete(path);
  }

  /**
   * Delete multiple files from storage
   * 
   * @param paths - Array of storage paths
   */
  async deleteMany(paths: string[]): Promise<void> {
    return this.storage.deleteMany(paths);
  }

  /**
   * Generate a signed URL for file preview
   * 
   * @param path - Storage path
   * @param expiresIn - Expiration time in seconds (default: 1 hour)
   * @returns Signed URL result
   */
  async getSignedUrl(
    path: string,
    expiresIn: number = 3600
  ): Promise<SignedUrlResult> {
    return this.storage.getSignedUrl(path, expiresIn);
  }

  /**
   * Generate signed URLs for multiple files
   * 
   * @param paths - Array of storage paths
   * @param expiresIn - Expiration time in seconds
   * @returns Map of path to signed URL
   */
  async getSignedUrls(
    paths: string[],
    expiresIn: number = 3600
  ): Promise<Map<string, string>> {
    return this.storage.getSignedUrls(paths, expiresIn);
  }

  /**
   * Download a file from storage
   * 
   * @param path - Storage path
   * @returns File blob
   */
  async download(path: string): Promise<Blob> {
    return this.storage.download(path);
  }

  /**
   * Check if a file exists in storage
   * 
   * @param path - Storage path
   * @returns True if file exists
   */
  async exists(path: string): Promise<boolean> {
    return this.storage.exists(path);
  }

  /**
   * Delete all documents for an organization
   * Used when deleting an organization
   * 
   * @param organizationId - Organization UUID
   */
  async deleteAllForOrganization(organizationId: string): Promise<void> {
    // List all files in the organization folder
    // Then delete them all
    // Note: Supabase Storage doesn't have a "list" method in the current implementation
    // This would need to be implemented by fetching document records from DB first
    // and then deleting the files
    
    // For now, this is a placeholder
    // In practice, you'd get the paths from the database and call deleteMany
    console.warn(
      `deleteAllForOrganization called for ${organizationId} - implement based on DB records`
    );
  }
}

/**
 * Default storage repository instance
 */
export const organizationStorageRepository =
  new OrganizationStorageRepository();
