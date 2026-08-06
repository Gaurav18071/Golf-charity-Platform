/**
 * Seed file — creates profiles for existing auth users, then inserts
 * demo campaign data into the database.
 *
 * Usage:
 *   npx tsx prisma/seed.ts
 *
 * Re-running is safe — uses upsert throughout.
 */

import { config } from "dotenv";
import { PrismaClient, CampaignStatus, UserRole, VerificationStatus } from "@prisma/client";

// Load environment variables
config();

const prisma = new PrismaClient();

// ── known auth users (from auth.users) ───────────────────────────────────────
const AUTH_USERS = [
  {
    id: "7247c9b6-55b8-4300-9ef2-94d090b823dd",
    fullName: "Gaurav Mishra",
    role: UserRole.ORGANIZER,
    verificationStatus: VerificationStatus.VERIFIED,
  },
  {
    id: "0eb533ec-e9fb-4cfe-a8a1-4224cc1abaa0",
    fullName: "Demo Donor",
    role: UserRole.DONOR,
    verificationStatus: VerificationStatus.VERIFIED,
  },
  {
    id: "83e57e0c-3f9b-436d-9f4b-25eab7532c46",
    fullName: "School Account",
    role: UserRole.DONOR,
    verificationStatus: VerificationStatus.PENDING,
  },
];

// ── organizer is Gaurav ───────────────────────────────────────────────────────
const ORGANIZER_ID = "7247c9b6-55b8-4300-9ef2-94d090b823dd";

// ── helpers ───────────────────────────────────────────────────────────────────
function daysFromNow(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}
function daysAgo(n: number): Date {
  return daysFromNow(-n);
}

// ── campaigns ─────────────────────────────────────────────────────────────────
const campaignTemplates = [
  {
    title: "Summer Charity Cup 2026",
    slug: "summer-charity-cup-2026",
    description:
      "Annual golf tournament raising funds for underprivileged children's education. Join 80+ golfers at Eagleton Golf Resort for a day of sport and giving.",
    coverImageUrl:
      "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800",
    goalAmount: 500000,
    currentAmount: 312000,
    status: CampaignStatus.ACTIVE,
    startDate: daysAgo(10),
    endDate: daysFromNow(20),
  },
  {
    title: "Junior Golf Championship",
    slug: "junior-golf-championship-2026",
    description:
      "Fundraiser to sponsor junior golfers from lower-income families — covering coaching fees, equipment, and national tournament entries.",
    coverImageUrl:
      "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=800",
    goalAmount: 300000,
    currentAmount: 145000,
    status: CampaignStatus.ACTIVE,
    startDate: daysAgo(5),
    endDate: daysFromNow(25),
  },
  {
    title: "Clean Water Golf Classic",
    slug: "clean-water-golf-classic",
    description:
      "Every birdie counts — this tournament donates ₹1,000 per birdie to build water purification plants in rural Maharashtra.",
    coverImageUrl:
      "https://images.unsplash.com/photo-1541544537156-7627a7a4aa1c?w=800",
    goalAmount: 350000,
    currentAmount: 350000,
    status: CampaignStatus.COMPLETED,
    startDate: daysAgo(60),
    endDate: daysAgo(30),
  },
  {
    title: "Children Health Invitational",
    slug: "children-health-invitational",
    description:
      "A 36-hole charity invitational raising funds for mobile medical units that serve children in underserved communities.",
    coverImageUrl:
      "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=800",
    goalAmount: 750000,
    currentAmount: 89000,
    status: CampaignStatus.ACTIVE,
    startDate: daysFromNow(7),
    endDate: daysFromNow(45),
  },
  {
    title: "Tree Plantation Scramble",
    slug: "tree-plantation-scramble",
    description:
      "Four-man scramble format — each team sponsors 100 trees. Help us reach our target of 10,000 native trees this season.",
    coverImageUrl:
      "https://images.unsplash.com/photo-1448375240586-882707db888b?w=800",
    goalAmount: 200000,
    currentAmount: 0,
    status: CampaignStatus.DRAFT,
    startDate: daysFromNow(30),
    endDate: daysFromNow(90),
  },
  {
    title: "Animal Welfare Open",
    slug: "animal-welfare-open",
    description:
      "Stroke-play open raising funds for animal rescue shelters — covering veterinary care and shelter operations for 500+ rescued animals.",
    coverImageUrl:
      "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800",
    goalAmount: 150000,
    currentAmount: 67500,
    status: CampaignStatus.ACTIVE,
    startDate: daysAgo(15),
    endDate: daysFromNow(15),
  },
];

// ── main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log("🌱 Seeding database...\n");

  // 1. Upsert profiles for all known auth users
  console.log("── Profiles ──");
  for (const u of AUTH_USERS) {
    await prisma.profile.upsert({
      where: { id: u.id },
      update: { fullName: u.fullName, role: u.role, verificationStatus: u.verificationStatus },
      create: u,
    });
    console.log(`  ✓ ${u.fullName}`);
  }

  // 2. Upsert campaigns
  console.log("\n── Campaigns ──");
  let seeded = 0;
  for (const tpl of campaignTemplates) {
    await prisma.campaign.upsert({
      where: { slug: tpl.slug },
      update: {
        title: tpl.title,
        description: tpl.description,
        coverImageUrl: tpl.coverImageUrl,
        goalAmount: tpl.goalAmount,
        currentAmount: tpl.currentAmount,
        status: tpl.status,
        startDate: tpl.startDate,
        endDate: tpl.endDate,
      },
      create: {
        organizerId: ORGANIZER_ID,
        ...tpl,
      },
    });
    console.log(`  ✓ ${tpl.title}`);
    seeded++;
  }

  console.log(`\n✅ Done — ${AUTH_USERS.length} profiles, ${seeded} campaigns seeded.`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
