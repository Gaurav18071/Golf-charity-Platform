/**
 * Supabase Storage Helper
 * 
 * Provides utility functions for interacting with Supabase Storage.
 * Handles bucket operations, file uploads, downloads, and URL generation.
 * 
 * @module lib/supabase/storage
 */

import { createClient } from "@/lib/supabase/server";

/**
 * Storage bucket name for organization documents
 */
export const ORGANIZATION_DOCUMENTS_BUCKET = "organization-documents";

/**
 * Maximum file size in bytes (10 MB)
 */
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

/**
 * Allowed MIME types for document uploads
 * Note: Ensure these match the Supabase Storage bucket configuration
 */
export const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/png",  // PNG images
  "image/jpeg", // JPEG images
  "image/jpg",  // JPG images (alternate MIME type)
] as const;

/**
 * Allowed file extensions
 */
export const ALLOWED_EXTENSIONS = [".pdf", ".png", ".jpeg", ".jpg"] as const;

/**
 * Storage error types
 */
export enum StorageErrorType {
  BUCKET_NOT_FOUND = "BUCKET_NOT_FOUND",
  UPLOAD_FAILED = "UPLOAD_FAILED",
  DELETE_FAILED = "DELETE_FAILED",
  DOWNLOAD_FAILED = "DOWNLOAD_FAILED",
  URL_GENERATION_FAILED = "URL_GENERATION_FAILED",
  INVALID_FILE_TYPE = "INVALID_FILE_TYPE",
  FILE_TOO_LARGE = "FILE_TOO_LARGE",
  UNAUTHORIZED = "UNAUTHORIZED",
}

/**
 * Custom storage error class
 */
export class StorageError extends Error {
  constructor(
    public type: StorageErrorType,
    message: string,
    public originalError?: unknown
  ) {
    super(message);
    this.name = "StorageError";
  }
}

/**
 * Upload result
 */
export interface UploadResult {
  path: string;
  fullPath: string;
}

/**
 * Signed URL result
 */
export interface SignedUrlResult {
  signedUrl: string;
  expiresIn: number;
}

/**
 * SupabaseStorageClient
 * 
 * Wrapper around Supabase Storage API with error handling and type safety.
 */
export class SupabaseStorageClient {
  private bucketName: string;

  constructor(bucketName: string = ORGANIZATION_DOCUMENTS_BUCKET) {
    this.bucketName = bucketName;
  }

  /**
   * Upload a file to storage
   * 
   * @param path - Storage path (e.g., "org-id/document.pdf")
   * @param file - File or Buffer to upload
   * @param contentType - MIME type
   * @returns Upload result with path
   */
  async upload(
    path: string,
    file: File | Buffer | ArrayBuffer,
    contentType: string
  ): Promise<UploadResult> {
    try {
      const supabase = await createClient();

      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .upload(path, file, {
          contentType,
          upsert: false, // Prevent accidental overwrites
        });

      if (error) {
        throw new StorageError(
          StorageErrorType.UPLOAD_FAILED,
          `Failed to upload file: ${error.message}`,
          error
        );
      }

      if (!data) {
        throw new StorageError(
          StorageErrorType.UPLOAD_FAILED,
          "Upload succeeded but no data returned"
        );
      }

      return {
        path: data.path,
        fullPath: data.fullPath,
      };
    } catch (error) {
      if (error instanceof StorageError) throw error;

      throw new StorageError(
        StorageErrorType.UPLOAD_FAILED,
        "Unexpected error during file upload",
        error
      );
    }
  }

  /**
   * Delete a file from storage
   * 
   * @param path - Storage path to delete
   */
  async delete(path: string): Promise<void> {
    try {
      const supabase = await createClient();

      const { error } = await supabase.storage
        .from(this.bucketName)
        .remove([path]);

      if (error) {
        throw new StorageError(
          StorageErrorType.DELETE_FAILED,
          `Failed to delete file: ${error.message}`,
          error
        );
      }
    } catch (error) {
      if (error instanceof StorageError) throw error;

      throw new StorageError(
        StorageErrorType.DELETE_FAILED,
        "Unexpected error during file deletion",
        error
      );
    }
  }

  /**
   * Delete multiple files from storage
   * 
   * @param paths - Array of storage paths to delete
   */
  async deleteMany(paths: string[]): Promise<void> {
    if (paths.length === 0) return;

    try {
      const supabase = await createClient();

      const { error } = await supabase.storage
        .from(this.bucketName)
        .remove(paths);

      if (error) {
        throw new StorageError(
          StorageErrorType.DELETE_FAILED,
          `Failed to delete files: ${error.message}`,
          error
        );
      }
    } catch (error) {
      if (error instanceof StorageError) throw error;

      throw new StorageError(
        StorageErrorType.DELETE_FAILED,
        "Unexpected error during batch file deletion",
        error
      );
    }
  }

  /**
   * Generate a signed URL for temporary file access
   * 
   * @param path - Storage path
   * @param expiresIn - Expiration time in seconds (default: 1 hour)
   * @returns Signed URL and expiration
   */
  async getSignedUrl(
    path: string,
    expiresIn: number = 3600
  ): Promise<SignedUrlResult> {
    try {
      const supabase = await createClient();

      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .createSignedUrl(path, expiresIn);

      if (error) {
        throw new StorageError(
          StorageErrorType.URL_GENERATION_FAILED,
          `Failed to generate signed URL: ${error.message}`,
          error
        );
      }

      if (!data?.signedUrl) {
        throw new StorageError(
          StorageErrorType.URL_GENERATION_FAILED,
          "Signed URL generation succeeded but no URL returned"
        );
      }

      return {
        signedUrl: data.signedUrl,
        expiresIn,
      };
    } catch (error) {
      if (error instanceof StorageError) throw error;

      throw new StorageError(
        StorageErrorType.URL_GENERATION_FAILED,
        "Unexpected error during URL generation",
        error
      );
    }
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
    const results = new Map<string, string>();

    await Promise.all(
      paths.map(async (path) => {
        try {
          const { signedUrl } = await this.getSignedUrl(path, expiresIn);
          results.set(path, signedUrl);
        } catch (error) {
          console.error(`Failed to generate signed URL for ${path}:`, error);
          // Continue with other URLs even if one fails
        }
      })
    );

    return results;
  }

  /**
   * Download a file from storage
   * 
   * @param path - Storage path
   * @returns File blob
   */
  async download(path: string): Promise<Blob> {
    try {
      const supabase = await createClient();

      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .download(path);

      if (error) {
        throw new StorageError(
          StorageErrorType.DOWNLOAD_FAILED,
          `Failed to download file: ${error.message}`,
          error
        );
      }

      if (!data) {
        throw new StorageError(
          StorageErrorType.DOWNLOAD_FAILED,
          "Download succeeded but no data returned"
        );
      }

      return data;
    } catch (error) {
      if (error instanceof StorageError) throw error;

      throw new StorageError(
        StorageErrorType.DOWNLOAD_FAILED,
        "Unexpected error during file download",
        error
      );
    }
  }

  /**
   * Check if a file exists in storage
   * 
   * @param path - Storage path
   * @returns True if file exists
   */
  async exists(path: string): Promise<boolean> {
    try {
      const supabase = await createClient();

      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .list(path.split("/").slice(0, -1).join("/"), {
          search: path.split("/").pop(),
        });

      if (error) return false;
      return (data?.length ?? 0) > 0;
    } catch {
      return false;
    }
  }

  /**
   * Get the public URL for a file (if bucket is public)
   * Note: For private buckets, use getSignedUrl instead
   * 
   * @param path - Storage path
   * @returns Public URL
   */
  getPublicUrl(path: string): string {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    return `${supabaseUrl}/storage/v1/object/public/${this.bucketName}/${path}`;
  }
}

/**
 * Default storage client instance for organization documents
 */
export const organizationDocumentsStorage = new SupabaseStorageClient(
  ORGANIZATION_DOCUMENTS_BUCKET
);
