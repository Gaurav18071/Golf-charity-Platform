/**
 * List all profiles in the database
 * 
 * Usage:
 *   npx tsx scripts/list-profiles.ts
 */

import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";

config();

const prisma = new PrismaClient();

async function main() {
  console.log("📋 Current profiles in database:\n");

  const profiles = await prisma.profile.findMany({
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      verificationStatus: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  if (profiles.length === 0) {
    console.log("❌ No profiles found in database.");
    return;
  }

  profiles.forEach((p, idx) => {
    console.log(`${idx + 1}. ${p.fullName}`);
    console.log(`   Email: ${p.email}`);
    console.log(`   Role: ${p.role}`);
    console.log(`   Status: ${p.verificationStatus}`);
    console.log(`   ID: ${p.id}`);
    console.log(`   Created: ${p.createdAt.toLocaleString()}`);
    console.log();
  });

  console.log(`Total: ${profiles.length} profiles`);
}

main()
  .catch((e) => {
    console.error("❌ Failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
