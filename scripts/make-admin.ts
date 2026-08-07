/**
 * Make a user an ADMIN
 * 
 * Usage:
 *   npx tsx scripts/make-admin.ts <email-or-user-id>
 * 
 * Example:
 *   npx tsx scripts/make-admin.ts gaurav@example.com
 */

import { config } from "dotenv";
import { PrismaClient, UserRole } from "@prisma/client";

config();

const prisma = new PrismaClient();

async function main() {
  const input = process.argv[2];

  if (!input) {
    console.error("❌ Usage: npx tsx scripts/make-admin.ts <email-or-user-id>");
    console.error("\nExample:");
    console.error("  npx tsx scripts/make-admin.ts gaurav@example.com");
    console.error("\nRun 'npx tsx scripts/list-profiles.ts' to see all users");
    process.exit(1);
  }

  // Try to find by ID first, then by email
  let profile = await prisma.profile.findUnique({
    where: { id: input },
  });

  if (!profile) {
    profile = await prisma.profile.findFirst({
      where: { email: input },
    });
  }

  if (!profile) {
    console.error(`❌ No profile found for: ${input}`);
    console.log("\n📋 Available profiles:");
    const all = await prisma.profile.findMany({
      select: { id: true, email: true, fullName: true, role: true },
    });
    all.forEach((p) =>
      console.log(`  - ${p.fullName} (${p.email}) - Role: ${p.role}`)
    );
    process.exit(1);
  }

  console.log(`\n👤 Found: ${profile.fullName} (${profile.email})`);
  console.log(`   Current role: ${profile.role}`);

  if (profile.role === UserRole.ADMIN) {
    console.log("\n✅ User is already an ADMIN!");
    return;
  }

  console.log(`\n🔄 Updating to ADMIN...`);

  await prisma.profile.update({
    where: { id: profile.id },
    data: {
      role: UserRole.ADMIN,
    },
  });

  console.log(`\n✅ Success! ${profile.fullName} is now an ADMIN`);
  console.log(`\n⚠️  Please logout and login again to see the changes.`);
}

main()
  .catch((e) => {
    console.error("❌ Failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
