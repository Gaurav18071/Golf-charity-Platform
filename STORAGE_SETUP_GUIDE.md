# 📦 Supabase Storage Setup Guide

## Quick Setup (5 minutes)

Since we don't have the service role key in the environment, we'll set up storage manually via the Supabase Dashboard.

---

## Step 1: Access Supabase Dashboard

1. Go to: https://gqlmmbdhkkfctyuvlaef.supabase.co
2. Login with your Supabase credentials
3. Navigate to: **Storage** (left sidebar)

---

## Step 2: Create Storage Bucket

1. Click **"New bucket"**
2. Fill in the form:

   **Bucket name:** `organization-documents`
   
   **Public bucket:** ❌ **OFF** (keep it private)
   
   **File size limit:** `10485760` bytes (10 MB)
   
   **Allowed MIME types:** Click "+ Add type" for each:
   - `application/pdf`
   - `image/png` ← **Important: PNG not PDF!**
   - `image/jpeg`
   - `image/jpg`

3. Click **"Create bucket"**

---

## Step 3: Configure Storage Policies

1. In the Storage section, click on **`organization-documents`** bucket
2. Click the **"Policies"** tab
3. Click **"New policy"**

### Policy 1: Allow Upload (INSERT)

- **Policy name:** `Users can upload documents`
- **Allowed operation:** `INSERT`
- **Target roles:** `authenticated`
- **Policy definition:**

```sql
(bucket_id = 'organization-documents'::text)
```

- Click **"Review"** → **"Save policy"**

### Policy 2: Allow Read (SELECT)

- **Policy name:** `Users can read documents`
- **Allowed operation:** `SELECT`
- **Target roles:** `authenticated`
- **Policy definition:**

```sql
(bucket_id = 'organization-documents'::text)
```

- Click **"Review"** → **"Save policy"**

### Policy 3: Allow Delete (DELETE)

- **Policy name:** `Users can delete documents`
- **Allowed operation:** `DELETE`
- **Target roles:** `authenticated`
- **Policy definition:**

```sql
(bucket_id = 'organization-documents'::text)
```

- Click **"Review"** → **"Save policy"**

### Policy 4: Allow Update (UPDATE)

- **Policy name:** `Users can update documents`
- **Allowed operation:** `UPDATE`
- **Target roles:** `authenticated`
- **Policy definition:**

```sql
(bucket_id = 'organization-documents'::text)
```

- Click **"Review"** → **"Save policy"**

---

## Step 4: Verify Setup

### Check Bucket Configuration

1. Go to Storage → `organization-documents`
2. Verify settings:
   - ✅ Public: OFF
   - ✅ File size limit: 10 MB
   - ✅ Allowed MIME types: 4 types configured

### Check Policies

1. Go to Policies tab
2. Verify 4 policies exist:
   - ✅ INSERT policy
   - ✅ SELECT policy
   - ✅ DELETE policy
   - ✅ UPDATE policy

---

## Step 5: Test (Optional)

You can test the bucket by uploading a test file:

1. Go to Storage → `organization-documents`
2. Click **"Upload file"**
3. Select a PDF or image file (< 10 MB)
4. Upload it
5. Try to view/download it
6. Delete the test file

---

## What's Next?

✅ Storage bucket created  
✅ Policies configured  
→ **Ready for Task 2:** Document Upload Service Implementation

The storage infrastructure is now ready. The application will automatically use this bucket when users upload organization documents.

---

## Folder Structure (Automatic)

When users upload documents, they'll be automatically organized like this:

```
organization-documents/
├── {org-uuid-1}/
│   ├── registration-certificate-1705234567890.pdf
│   ├── pan-card-1705234567891.png
│   └── gst-certificate-1705234567892.pdf
└── {org-uuid-2}/
    ├── registration-certificate-1705234567893.pdf
    └── bank-statement-1705234567894.pdf
```

Each organization gets its own folder, and files are timestamped to prevent conflicts.

---

## Security Notes

✅ **Private bucket** - files not publicly accessible  
✅ **Authentication required** - only logged-in users can access  
✅ **Application-level checks** - verify organization ownership  
✅ **Signed URLs** - temporary access for previews (1 hour expiration)  
✅ **No direct path exposure** - paths never sent to client  

---

## Troubleshooting

### "Bucket not found" error

**Solution:** Create the bucket following Step 2 above.

### "Row level security policy" error

**Solution:** Configure the 4 policies from Step 3 above.

### "File too large" error

**Solution:** 
- Check file size limit in bucket settings (should be 10 MB)
- Verify file is actually < 10 MB
- Client-side validation should prevent this

### "Invalid MIME type" error

**Solution:**
- Verify file is PDF, PNG, JPEG, or JPG
- Check allowed MIME types in bucket settings
- Add missing types if needed

---

## Need Help?

If you encounter issues:

1. Check Supabase Dashboard for error messages
2. Verify all policies are created and enabled
3. Check browser console for detailed errors
4. Review the Storage documentation: https://supabase.com/docs/guides/storage

---

**Status:** ✅ Ready to proceed to Task 2
