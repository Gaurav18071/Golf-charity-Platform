# Supabase Storage Setup for Organization Documents

## Overview

This document explains how to set up Supabase Storage for organization document uploads.

---

## Bucket Configuration

**Bucket Name:** `organization-documents`

**Settings:**
- **Access:** Private (requires authentication)
- **Max File Size:** 10 MB
- **Allowed MIME Types:**
  - `application/pdf`
  - `image/png`
  - `image/jpeg`
  - `image/jpg`

---

## Setup Instructions

### Option 1: Automatic Setup (Recommended)

Run the setup script:

```bash
npx tsx scripts/setup-storage.ts
```

This will:
1. Create the `organization-documents` bucket (if it doesn't exist)
2. Configure bucket settings
3. Display policy recommendations

### Option 2: Manual Setup

1. **Go to Supabase Dashboard:**
   - Navigate to: Storage > Create a new bucket

2. **Create Bucket:**
   - Name: `organization-documents`
   - Public: **OFF** (keep it private)
   - File size limit: `10485760` (10 MB in bytes)
   - Allowed MIME types: Add each type separately:
     - `application/pdf`
     - `image/png`
     - `image/jpeg`
     - `image/jpg`

3. **Save Bucket**

---

## Storage Policies (RLS)

Supabase Storage uses Row Level Security (RLS) policies. Configure these policies to control access:

### Policy 1: Allow Upload

**Policy Name:** `Users can upload to own organization`  
**Operation:** `INSERT`  
**Target roles:** `authenticated`  
**Policy Definition:**

```sql
(bucket_id = 'organization-documents'::text)
```

### Policy 2: Allow Read

**Policy Name:** `Users can read own organization documents`  
**Operation:** `SELECT`  
**Target roles:** `authenticated`  
**Policy Definition:**

```sql
(bucket_id = 'organization-documents'::text)
```

### Policy 3: Allow Delete

**Policy Name:** `Users can delete own organization documents`  
**Operation:** `DELETE`  
**Target roles:** `authenticated`  
**Policy Definition:**

```sql
(bucket_id = 'organization-documents'::text)
```

### Policy 4: Allow Update

**Policy Name:** `Users can update own organization documents`  
**Operation:** `UPDATE`  
**Target roles:** `authenticated`  
**Policy Definition:**

```sql
(bucket_id = 'organization-documents'::text)
```

---

## Folder Structure

Files are organized by organization ID:

```
organization-documents/
├── {organization-id-1}/
│   ├── registration-certificate-1234567890.pdf
│   ├── pan-card-1234567891.pdf
│   ├── gst-certificate-1234567892.pdf
│   └── bank-statement-1234567893.pdf
├── {organization-id-2}/
│   ├── registration-certificate-1234567894.pdf
│   └── pan-card-1234567895.pdf
└── ...
```

**Path Format:**
```
{organizationId}/{document-type}-{timestamp}.{extension}
```

**Example:**
```
123e4567-e89b-12d3-a456-426614174000/registration-certificate-1705234567890.pdf
```

---

## Security Notes

### Application-Level Authorization

While RLS policies control bucket access, **application-level checks** verify:
- User owns the organization
- User has permission to upload/delete documents
- File type and size are valid

**Why not use path-based policies?**

Fine-grained policies (checking organization ownership) require joining with the `organizations` table. This is complex in Supabase Storage policies and better handled in application code.

### File Access

Files are **not publicly accessible**. Access methods:

1. **Signed URLs (Recommended):**
   - Temporary URLs with expiration
   - Generated via `getSignedUrl()`
   - Valid for 1 hour by default

2. **Download Method:**
   - Authenticated downloads
   - Returns file blob

**Never expose storage paths directly to clients!**

---

## Environment Variables

Ensure these are set in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key  # For admin operations
```

---

## Testing the Setup

### 1. Verify Bucket Exists

```bash
npx tsx scripts/setup-storage.ts
```

Look for: ✅ Bucket 'organization-documents' exists

### 2. Test Upload (will be implemented in later tasks)

```typescript
import { organizationStorageRepository } from "@/features/organization/repositories/storage.repository";

const file = new File(["content"], "test.pdf", { type: "application/pdf" });
const path = organizationStorageRepository.generatePath(
  "org-id",
  "REGISTRATION_CERTIFICATE",
  "test.pdf"
);

const result = await organizationStorageRepository.upload(file, path, "application/pdf");
console.log("Uploaded to:", result.path);
```

### 3. Test Signed URL

```typescript
const signedUrl = await organizationStorageRepository.getSignedUrl(result.path);
console.log("Preview URL:", signedUrl.signedUrl);
```

---

## Troubleshooting

### Error: "Bucket not found"

**Solution:** Run `npx tsx scripts/setup-storage.ts` to create the bucket.

### Error: "New row violates row-level security policy"

**Solution:** 
1. Check RLS policies in Supabase Dashboard > Storage
2. Ensure authenticated users have INSERT/SELECT/DELETE permissions
3. Verify user is authenticated

### Error: "File too large"

**Solution:**
- Client-side: Check file size before upload (max 10 MB)
- Server-side: Validation should reject files > 10 MB
- Bucket setting: Increase `file_size_limit` if needed

### Error: "Invalid MIME type"

**Solution:**
- Verify file type is one of: PDF, PNG, JPEG, JPG
- Check bucket `allowed_mime_types` setting
- Update bucket settings if needed

---

## Cleanup

To delete the bucket (⚠️ **WARNING: This deletes all files**):

```typescript
// In Supabase Dashboard:
// Storage > organization-documents > Settings > Delete bucket
```

Or via API:

```typescript
const supabase = createAdminClient(url, serviceKey);
await supabase.storage.deleteBucket('organization-documents');
```

---

## Next Steps

After storage setup:

1. ✅ Bucket created
2. ✅ Policies configured
3. → Implement document upload service (Task 2)
4. → Build upload UI components (Task 3)
5. → Add preview functionality (Task 4)
