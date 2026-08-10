/**
 * Quick script to make a specific user an ORGANIZER
 * 
 * Usage:
 *   npx tsx scripts/make-organizer.ts <user-id-or-email>
 * 
 * Example:
 *   npx tsx scripts/make-organizer.ts gaurav@example.com
 *   npx tsx scripts/make-organizer.ts 7247c9b6-55b8-4300-9ef2-94d090b823dd
 */

import { config } from "dotenv";
import { PrismaClient, UserRole } from "@prisma/client";

config();

const prisma = new PrismaClient();

async function main() {
  const input = process.argv[2];

  if (!input) {
    console.error("❌ Usage: npx tsx scripts/make-organizer.ts <user-id-or-email>");
    console.error("\nExample:");
    console.error("  npx tsx scripts/make-organizer.ts gaurav@example.com");
    console.error("  npx tsx scripts/make-organizer.ts 7247c9b6-55b8-4300-9ef2-94d090b823dd");
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
    console.log("\nAvailable profiles:");
    const all = await prisma.profile.findMany({
      select: { id: true, email: true, fullName: true, role: true },
    });
    all.forEach((p) =>
      console.log(`  - ${p.fullName} (${p.email}) - Role: ${p.role}`)
    );
    process.exit(1);
  }

  console.log(`\nFound: ${profile.fullName} (${profile.email})`);
  console.log(`Current role: ${profile.role}`);

  if (profile.role === UserRole.ORGANIZER) {
    console.log("\n✅ User is already an ORGANIZER!");
    return;
  }

  console.log(`\nUpdating to ORGANIZER...`);

  await prisma.profile.update({
    where: { id: profile.id },
    data: {
      role: UserRole.ORGANIZER,
    },
  });

  console.log(`\n✅ Success! ${profile.fullName} is now an ORGANIZER`);
  console.log(`\nPlease logout and login again to see the changes.`);
}

main()
  .catch((e) => {
    console.error("❌ Failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
