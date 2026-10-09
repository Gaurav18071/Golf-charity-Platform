/**
 * Diagnostic script to identify authentication issues
 * 
 * Run with: npx tsx scripts/diagnose-auth.ts
 */

console.log("🔍 Golf Charity Platform - Authentication Diagnostics\n");
console.log("=" .repeat(60));

// Check environment variables
console.log("\n📋 Environment Variables Check:");
console.log("-".repeat(60));

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const databaseUrl = process.env.DATABASE_URL;

console.log(`✓ NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? '✅ Set' : '❌ Missing'}`);
if (supabaseUrl) {
  console.log(`  Value: ${supabaseUrl}`);
}

console.log(`✓ NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseKey ? '✅ Set' : '❌ Missing'}`);
if (supabaseKey) {
  console.log(`  Value: ${supabaseKey.substring(0, 20)}...${supabaseKey.substring(supabaseKey.length - 10)}`);
}

console.log(`✓ DATABASE_URL: ${databaseUrl ? '✅ Set' : '❌ Missing'}`);

// Test Supabase connectivity
console.log("\n🌐 Testing Supabase Connectivity:");
console.log("-".repeat(60));

if (supabaseUrl) {
  console.log(`Testing: ${supabaseUrl}`);
  
  fetch(supabaseUrl)
    .then((response) => {
      console.log(`✅ Status: ${response.status} ${response.statusText}`);
      console.log(`✅ Supabase project is accessible!`);
      return response.text();
    })
    .then((text) => {
      if (text.includes("supabase")) {
        console.log("✅ Response contains expected Supabase content");
      }
    })
    .catch((error) => {
      console.log(`❌ Connection failed: ${error.message}`);
      console.log("\n🔧 Troubleshooting Steps:");
      console.log("1. Check if your Supabase project is paused or deleted");
      console.log("2. Verify the project URL in Supabase Dashboard → Settings → API");
      console.log("3. Ensure your internet connection is working");
      console.log("4. Try accessing the URL directly in your browser:");
      console.log(`   ${supabaseUrl}`);
    });
} else {
  console.log("❌ NEXT_PUBLIC_SUPABASE_URL is not set");
}

// Test database connectivity
console.log("\n🗄️  Testing Database Connectivity:");
console.log("-".repeat(60));

if (databaseUrl) {
  import("@/lib/prisma").then(({ prisma }) => {
    return prisma.$queryRaw`SELECT 1 as connected`;
  })
  .then(() => {
    console.log("✅ Database connection successful!");
  })
  .catch((error) => {
    console.log(`❌ Database connection failed: ${error.message}`);
    console.log("\n🔧 Troubleshooting Steps:");
    console.log("1. Check if your Neon database is active");
    console.log("2. Verify DATABASE_URL in .env.local");
    console.log("3. Check IP allowlist in Neon dashboard");
  });
} else {
  console.log("❌ DATABASE_URL is not set");
}

console.log("\n" + "=".repeat(60));
console.log("\n💡 Tips:");
console.log("- Restart your dev server after changing .env.local");
console.log("- Check Supabase Dashboard: https://supabase.com/dashboard");
console.log("- Check Neon Dashboard: https://console.neon.tech");
console.log("\n");
