/**
 * Database Connection Test Script
 * 
 * Tests if the Neon database is reachable and wakes it up if needed.
 * 
 * Usage:
 *   npx ts-node scripts/test-db-connection.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testConnection() {
  console.log("\n🔌 Testing Database Connection...\n");
  console.log("=" . repeat(80));

  try {
    console.log("📡 Attempting to connect to Neon database...");
    console.log("   (This may take 10-15 seconds if the database is sleeping)\n");

    const start = Date.now();
    
    // Try a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    
    const duration = Date.now() - start;

    console.log("✅ Database connection successful!");
    console.log(`⏱️  Response time: ${duration}ms`);
    console.log(`📊 Query result:`, result);

    // Test a real table
    console.log("\n📋 Testing campaigns table...");
    const campaignCount = await prisma.campaign.count();
    console.log(`✅ Found ${campaignCount} campaigns in database`);

    // Test profiles table
    console.log("\n👥 Testing profiles table...");
    const profileCount = await prisma.profile.count();
    console.log(`✅ Found ${profileCount} profiles in database`);

    console.log("\n" + "=".repeat(80));
    console.log("✅ All database tests passed!");
    console.log("\n💡 Your database is working correctly.");
    console.log("   If you were seeing connection errors, they should be resolved now.");
    console.log("\n");

  } catch (error) {
    console.log("\n" + "=".repeat(80));
    console.log("❌ Database connection failed!\n");

    if (error instanceof Error) {
      console.log("Error details:");
      console.log(`  Type: ${error.name}`);
      console.log(`  Message: ${error.message}\n`);

      if (error.message.includes("Can't reach database server")) {
        console.log("🔍 Troubleshooting steps:");
        console.log("  1. Check your internet connection");
        console.log("  2. Verify DATABASE_URL in .env file");
        console.log("  3. Ensure Neon database is not paused");
        console.log("  4. Try accessing Neon dashboard: https://console.neon.tech");
        console.log("  5. Check if your IP is whitelisted (if IP restrictions enabled)");
        console.log("\n");
        console.log("📝 Your connection string:");
        console.log(`  ${process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':***@')}`);
      }
    } else {
      console.log("Unknown error:", error);
    }

    console.log("\n");
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection().catch(console.error);
