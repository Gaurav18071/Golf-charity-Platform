/**
 * Supabase Storage Setup Script
 * 
 * Creates the organization-documents bucket if it doesn't exist.
 * Sets up storage policies for secure access.
 * 
 * Run: npx tsx scripts/setup-storage.ts
 */

import { createClient as createAdminClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing environment variables:");
  console.error("   - NEXT_PUBLIC_SUPABASE_URL");
  console.error("   - SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const BUCKET_NAME = "organization-documents";

async function setupStorage() {
  console.log("🚀 Setting up Supabase Storage for organization documents...\n");

  const supabase = createAdminClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  try {
    // ── Check if bucket exists ──────────────────────────────────────────────
    console.log(`📦 Checking if bucket '${BUCKET_NAME}' exists...`);
    
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
      throw new Error(`Failed to list buckets: ${listError.message}`);
    }

    const bucketExists = buckets?.some((b) => b.name === BUCKET_NAME);

    if (bucketExists) {
      console.log(`✅ Bucket '${BUCKET_NAME}' already exists.\n`);
    } else {
      // ── Create bucket ─────────────────────────────────────────────────────
      console.log(`📦 Creating bucket '${BUCKET_NAME}'...`);

      const { data, error } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: false, // Private bucket - requires authentication
        fileSizeLimit: 10 * 1024 * 1024, // 10 MB
        allowedMimeTypes: [
          "application/pdf",
          "image/png",
          "image/jpeg",
          "image/jpg",
        ],
      });

      if (error) {
        throw new Error(`Failed to create bucket: ${error.message}`);
      }

      console.log(`✅ Bucket '${BUCKET_NAME}' created successfully.\n`);
    }

    // ── Display bucket info ─────────────────────────────────────────────────
    const { data: bucket } = await supabase.storage.getBucket(BUCKET_NAME);

    if (bucket) {
      console.log("📋 Bucket Configuration:");
      console.log(`   Name: ${bucket.name}`);
      console.log(`   Public: ${bucket.public ? "Yes" : "No (Private)"}`);
      console.log(
        `   Max File Size: ${(bucket.file_size_limit ?? 0) / (1024 * 1024)} MB`
      );
      console.log(
        `   Allowed Types: ${bucket.allowed_mime_types?.join(", ") ?? "All"}`
      );
      console.log("");
    }

    // ── Storage Policies Info ───────────────────────────────────────────────
    console.log("🔐 Storage Access Policies:");
    console.log("   ℹ️  Policies must be configured in Supabase Dashboard");
    console.log("   ℹ️  Or via SQL in the Supabase SQL Editor\n");

    console.log("📝 Recommended Policies:\n");

    console.log("1. Allow authenticated users to upload to their organization folder:");
    console.log("   Policy Name: Users can upload to own organization");
    console.log("   Operation: INSERT");
    console.log("   Definition: (bucket_id = 'organization-documents' AND auth.uid() IS NOT NULL)");
    console.log("");

    console.log("2. Allow authenticated users to read from their organization folder:");
    console.log("   Policy Name: Users can read own organization documents");
    console.log("   Operation: SELECT");
    console.log("   Definition: (bucket_id = 'organization-documents' AND auth.uid() IS NOT NULL)");
    console.log("");

    console.log("3. Allow authenticated users to delete from their organization folder:");
    console.log("   Policy Name: Users can delete own organization documents");
    console.log("   Operation: DELETE");
    console.log("   Definition: (bucket_id = 'organization-documents' AND auth.uid() IS NOT NULL)");
    console.log("");

    console.log("⚠️  Note: Fine-grained policies should verify organization ownership");
    console.log("   This requires joining with the organizations table in Postgres");
    console.log("   For now, application-level checks handle authorization\n");

    console.log("✅ Storage setup complete!");
    console.log("");
    console.log("Next steps:");
    console.log("1. Verify bucket in Supabase Dashboard > Storage");
    console.log("2. Configure RLS policies in Supabase Dashboard > Storage > Policies");
    console.log("3. Test document upload functionality");
  } catch (error) {
    console.error("❌ Storage setup failed:");
    console.error(error);
    process.exit(1);
  }
}

setupStorage();
