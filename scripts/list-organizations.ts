import { prisma } from "@/lib/prisma";

async function main() {
  console.log("📋 Organizations in database:\n");

  try {
    const organizations = await prisma.organization.findMany({
      include: {
        profile: {
          select: {
            email: true,
            fullName: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (organizations.length === 0) {
      console.log("❌ No organizations found\n");
    } else {
      organizations.forEach((org, index) => {
        console.log(`${index + 1}. ${org.name}`);
        console.log(`   Email: ${org.profile.email}`);
        console.log(`   Full Name: ${org.profile.fullName}`);
        console.log(`   Profile Role: ${org.profile.role}`);
        console.log(`   Verification Status: ${org.verificationStatus}`);
        console.log(`   Org ID: ${org.id}`);
        console.log(`   Profile ID: ${org.profileId}`);
        console.log(`   Created: ${org.createdAt.toLocaleString()}`);
        console.log("");
      });
      console.log(`Total: ${organizations.length} organizations`);
    }
  } catch (error) {
    console.error("❌ Failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
