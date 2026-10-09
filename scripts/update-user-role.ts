/**
 * Quick script to update a user's role to ORGANIZER
 * 
 * Usage:
 *   npx tsx scripts/update-user-role.ts <user-email> ORGANIZER
 * 
 * Requires:
 *   DATABASE_URL environment variable to be set in .env.local
 */

import { PrismaClient, UserRole } from "@prisma/client";

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL environment variable is not set");
  console.error("Please ensure .env.local contains DATABASE_URL");
  process.exit(1);
}

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  const role = process.argv[3] as UserRole;

  if (!email || !role) {
    console.error("Usage: npx tsx scripts/update-user-role.ts <email> <ROLE>");
    console.error("Example: npx tsx scripts/update-user-role.ts gaurav@example.com ORGANIZER");
    process.exit(1);
  }

  console.log(`Looking for user with email: ${email}...`);

  // Since we can't query auth.users directly via Prisma, we'll update by profile email
  const profile = await prisma.profile.findFirst({
    where: { email: email },
  });

  if (!profile) {
    console.error(`❌ No profile found for email: ${email}`);
    console.log("\nAvailable profiles:");
    const all = await prisma.profile.findMany({ select: { email: true, fullName: true, role: true } });
    all.forEach(p => console.log(`  - ${p.email} (${p.fullName}) - ${p.role}`));
    process.exit(1);
  }

  console.log(`Found profile: ${profile.fullName} (${profile.email})`);
  console.log(`Current role: ${profile.role}`);
  console.log(`Updating to: ${role}...`);

  await prisma.profile.update({
    where: { id: profile.id },
    data: {
      role: role,
    },
  });

  console.log(`✅ Successfully updated ${profile.fullName}'s role to ${role}`);
}

main()
  .catch((e) => {
    console.error("❌ Update failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
