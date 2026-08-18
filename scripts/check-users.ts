import { prisma } from "../lib/prisma";

async function main() {
  const profiles = await prisma.profile.findMany({
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
    },
  });

  console.log("Registered Profiles in DB:");
  profiles.forEach((p) => {
    console.log(`- Email: "${p.email}", Name: "${p.fullName}", Role: "${p.role}", ID: "${p.id}"`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
