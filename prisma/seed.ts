/**
 * COMPREHENSIVE SEED FILE FOR DEMO/RECRUITER SHOWCASE
 * 
 * Creates realistic demo data including:
 * - Demo accounts (Admin, Organizer, Donor)
 * - Multiple organizations
 * - Active campaigns with donations
 * - Complete transaction history
 * 
 * Usage:
 *   npm run db:seed
 * 
 * ⚠️ NOTE: This creates users in the database only.
 * To login, you need to create these users in Supabase Auth first!
 * 
 * Demo Credentials:
 * - Admin: admin@golfcharity.com / Demo@123
 * - Organizer: organizer@golfcharity.com / Demo@123
 * - Donor: donor@golfcharity.com / Demo@123
 */

import { config } from "dotenv";
import { 
  PrismaClient, 
  CampaignStatus, 
  UserRole, 
  OrganizationType, 
  VerificationStatus,
  DocumentType,
  DonationStatus,
  PaymentGateway,
  PaymentStatus
} from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

config();

const prisma = new PrismaClient();

// ─────────────────────────────────────────────────────────────────────────────
// DEMO ACCOUNTS (Replace the ADMIN email with your actual email!)
// ─────────────────────────────────────────────────────────────────────────────

const YOUR_EMAIL = "gaurav@example.com"; // ⚠️ REPLACE WITH YOUR ACTUAL EMAIL

const DEMO_ACCOUNTS = {
  // Main Admin (YOU)
  ADMIN: {
    id: "00000000-0000-0000-0000-000000000001",
    fullName: "Gaurav Mishra (Admin)",
    email: YOUR_EMAIL,
    role: UserRole.ADMIN,
    avatarUrl: "https://ui-avatars.com/api/?name=Gaurav+Mishra&background=059669&color=fff",
  },
  // Demo Admin (for testing)
  DEMO_ADMIN: {
    id: "00000000-0000-0000-0000-000000000002",
    fullName: "Admin Demo",
    email: "admin@golfcharity.com",
    role: UserRole.ADMIN,
    avatarUrl: "https://ui-avatars.com/api/?name=Admin+Demo&background=dc2626&color=fff",
  },
  // Demo Organizer
  ORGANIZER: {
    id: "00000000-0000-0000-0000-000000000003",
    fullName: "Sarah Johnson",
    email: "organizer@golfcharity.com",
    role: UserRole.ORGANIZER,
    avatarUrl: "https://ui-avatars.com/api/?name=Sarah+Johnson&background=2563eb&color=fff",
  },
  // Demo Donor
  DONOR: {
    id: "00000000-0000-0000-0000-000000000004",
    fullName: "Michael Chen",
    email: "donor@golfcharity.com",
    role: UserRole.DONOR,
    avatarUrl: "https://ui-avatars.com/api/?name=Michael+Chen&background=7c3aed&color=fff",
  },
  // Additional Donors for realistic data
  DONOR_2: {
    id: "00000000-0000-0000-0000-000000000005",
    fullName: "Priya Sharma",
    email: "priya@example.com",
    role: UserRole.DONOR,
    avatarUrl: "https://ui-avatars.com/api/?name=Priya+Sharma&background=ea580c&color=fff",
  },
  DONOR_3: {
    id: "00000000-0000-0000-0000-000000000006",
    fullName: "Rahul Verma",
    email: "rahul@example.com",
    role: UserRole.DONOR,
    avatarUrl: "https://ui-avatars.com/api/?name=Rahul+Verma&background=0891b2&color=fff",
  },
  // Pending Organizer
  PENDING_ORGANIZER: {
    id: "00000000-0000-0000-0000-000000000007",
    fullName: "Amit Patel",
    email: "pending@golfcharity.com",
    role: UserRole.PENDING_ORGANIZER,
    avatarUrl: "https://ui-avatars.com/api/?name=Amit+Patel&background=ca8a04&color=fff",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

function daysFromNow(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}

function daysAgo(n: number): Date {
  return daysFromNow(-n);
}

function randomAmount(min: number, max: number): Decimal {
  return new Decimal(Math.floor(Math.random() * (max - min + 1)) + min);
}

// ─────────────────────────────────────────────────────────────────────────────
// ORGANIZATIONS
// ─────────────────────────────────────────────────────────────────────────────

const ORGANIZATIONS = [
  {
    id: "org-00000000-0000-0000-0000-000000000001",
    profileId: DEMO_ACCOUNTS.ORGANIZER.id,
    name: "Golf For Good Foundation",
    type: OrganizationType.FOUNDATION,
    description: "A premier non-profit foundation dedicated to organizing charity golf tournaments to support education, healthcare, and environmental causes across India. Since 2020, we've raised over ₹5 crores for various social initiatives.",
    website: "https://golfforgood.org",
    email: "info@golfforgood.org",
    phone: "+91 98765 43210",
    address: "123 Golf Course Road, Prestige Towers",
    city: "Bangalore",
    state: "Karnataka",
    country: "India",
    postalCode: "560001",
    registrationNo: "NGO-KA-2020-001234",
    panNumber: "AABCG1234F",
    gstNumber: "29AABCG1234F1Z5",
    taxExemptionNo: "80G-KA-2020-001234",
    accountHolder: "Golf For Good Foundation",
    accountNumber: "123456789012",
    bankName: "HDFC Bank",
    ifscCode: "HDFC0001234",
    branchName: "MG Road Branch",
    logoUrl: "https://ui-avatars.com/api/?name=Golf+For+Good&background=059669&color=fff&size=200",
    verificationStatus: VerificationStatus.APPROVED,
    submittedAt: daysAgo(90),
    reviewedAt: daysAgo(85),
  },
  {
    id: "org-00000000-0000-0000-0000-000000000002",
    profileId: DEMO_ACCOUNTS.PENDING_ORGANIZER.id,
    name: "Green Earth Trust",
    type: OrganizationType.TRUST,
    description: "Environmental conservation trust focused on reforestation and wildlife protection through sports events.",
    website: "https://greenearth.org",
    email: "contact@greenearth.org",
    phone: "+91 98765 11111",
    address: "45 Nature Park Road",
    city: "Pune",
    state: "Maharashtra",
    country: "India",
    postalCode: "411001",
    registrationNo: "TRUST-MH-2021-5678",
    panNumber: "AABGE5678P",
    accountHolder: "Green Earth Trust",
    accountNumber: "987654321098",
    bankName: "State Bank of India",
    ifscCode: "SBIN0012345",
    branchName: "Camp Branch",
    logoUrl: "https://ui-avatars.com/api/?name=Green+Earth&background=16a34a&color=fff&size=200",
    verificationStatus: VerificationStatus.PENDING,
    submittedAt: daysAgo(5),
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// CAMPAIGNS
// ─────────────────────────────────────────────────────────────────────────────

const CAMPAIGNS = [
  {
    slug: "summer-charity-golf-championship-2026",
    organizerId: DEMO_ACCOUNTS.ORGANIZER.id,
    organizationId: ORGANIZATIONS[0].id,
    title: "Summer Charity Golf Championship 2026",
    category: "EDUCATION",
    shortDescription: "Annual golf tournament raising funds for underprivileged children's education across Karnataka.",
    description: `Join us for the 5th Annual Summer Charity Golf Championship at the prestigious Eagleton Golf Resort. This year, we're raising funds to provide quality education to 500+ underprivileged children across Karnataka.

**Event Details:**
- Date: ${daysFromNow(15).toDateString()}
- Venue: Eagleton Golf Resort, Bangalore
- Format: 18-hole stroke play
- Expected Participants: 120+ golfers

**Your contribution will support:**
- School fees and supplies for 200 students
- Computer labs in 5 rural schools
- Teacher training programs
- Mid-day meal program for 300 children

Every donation makes a direct impact on a child's future. Join 80+ golfers in this noble cause!`,
    story: "Started in 2022, this tournament has helped over 1,200 children access quality education. Our alumni include students who've gone on to engineering and medical colleges.",
    beneficiaryName: "Bright Future School Network",
    beneficiaryStory: "A network of 10 schools in rural Karnataka serving 2,000+ children from farming communities.",
    location: "Eagleton Golf Resort, Bangalore",
    coverImageUrl: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=1200&h=600&fit=crop",
    goalAmount: new Decimal(500000),
    currentAmount: new Decimal(342500),
    status: CampaignStatus.ACTIVE,
    featured: true,
    startDate: daysAgo(10),
    endDate: daysFromNow(20),
  },
  {
    slug: "junior-golf-development-fund-2026",
    organizerId: DEMO_ACCOUNTS.ORGANIZER.id,
    organizationId: ORGANIZATIONS[0].id,
    title: "Junior Golf Development Fund 2026",
    category: "SPORTS",
    shortDescription: "Sponsor talented young golfers from underprivileged backgrounds to pursue their dreams.",
    description: `Help nurture the next generation of Indian golfing talent! This fund sponsors junior golfers from economically disadvantaged backgrounds, covering their training, equipment, and tournament fees.

**Program Benefits:**
- Professional coaching from PGA-certified trainers
- Complete golf equipment and apparel
- Entry fees for state and national tournaments
- Mental conditioning and fitness training
- Academic tutoring support

**Success Stories:**
- 2 beneficiaries now playing at state level
- 1 recipient secured golf scholarship to USA
- 15 juniors competing in national circuit

Your support can change a young athlete's life trajectory!`,
    location: "Multiple Golf Academies across India",
    coverImageUrl: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=1200&h=600&fit=crop",
    goalAmount: new Decimal(300000),
    currentAmount: new Decimal(187000),
    status: CampaignStatus.ACTIVE,
    featured: true,
    startDate: daysAgo(5),
    endDate: daysFromNow(25),
  },
  {
    slug: "clean-water-golf-classic-2025",
    organizerId: DEMO_ACCOUNTS.ORGANIZER.id,
    organizationId: ORGANIZATIONS[0].id,
    title: "Clean Water Golf Classic 2025",
    category: "ENVIRONMENT",
    shortDescription: "Every birdie counts! ₹1,000 per birdie to build water purification plants in rural Maharashtra.",
    description: `This innovative tournament links golf performance directly to social impact. For every birdie scored during the event, ₹1,000 is donated to install water purification plants in drought-affected villages of Maharashtra.

**Project Impact:**
- 5 water purification plants installed
- 10,000+ villagers now have access to clean drinking water
- Reduced waterborne diseases by 60% in target areas
- Created 15 jobs for plant maintenance

**Tournament Format:**
- 36-hole event over 2 days
- Birdie Challenge: Estimate total birdies, win prizes
- Closest to Pin contests
- Pro-Am format with celebrity golfers

This campaign has COMPLETED its goal - thank you to all participants! 🎉`,
    location: "Poona Club Golf Course, Pune",
    coverImageUrl: "https://images.unsplash.com/photo-1541544537156-7627a7a4aa1c?w=1200&h=600&fit=crop",
    goalAmount: new Decimal(350000),
    currentAmount: new Decimal(350000),
    status: CampaignStatus.COMPLETED,
    featured: false,
    startDate: daysAgo(60),
    endDate: daysAgo(30),
  },
  {
    slug: "childrens-health-invitational-2026",
    organizerId: DEMO_ACCOUNTS.ORGANIZER.id,
    organizationId: ORGANIZATIONS[0].id,
    title: "Children's Health Invitational 2026",
    category: "HEALTHCARE",
    shortDescription: "Premium invitational raising funds for mobile medical units serving children in underserved communities.",
    description: `An exclusive 36-hole invitational tournament bringing together business leaders and golf enthusiasts to fund mobile medical units that bring healthcare to children in remote areas.

**Medical Program:**
- 3 fully-equipped mobile medical vans
- Free health checkups for 5,000+ children annually
- Vaccination drives in 50 villages
- Emergency medical response capability
- Health education programs

**Tournament Highlights:**
- Limited to 60 participants (invitation only)
- Gala dinner with healthcare leaders
- Silent auction of golf memorabilia
- Awards ceremony and impact presentation

**Target Areas:**
- Remote villages in Uttarakhand hills
- Tribal communities in Madhya Pradesh
- Slums in Tier-2 cities

Join us in making healthcare accessible to every child!`,
    beneficiaryName: "Doctors Without Borders - India Chapter",
    location: "KGA Golf Club, Bangalore",
    coverImageUrl: "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=1200&h=600&fit=crop",
    goalAmount: new Decimal(750000),
    currentAmount: new Decimal(125000),
    status: CampaignStatus.ACTIVE,
    featured: true,
    startDate: daysFromNow(7),
    endDate: daysFromNow(45),
  },
  {
    slug: "animal-welfare-charity-open",
    organizerId: DEMO_ACCOUNTS.ORGANIZER.id,
    organizationId: ORGANIZATIONS[0].id,
    title: "Animal Welfare Charity Open",
    category: "ANIMAL_WELFARE",
    shortDescription: "Stroke-play open supporting animal rescue shelters and veterinary care for 500+ rescued animals.",
    description: `Support our four-legged friends while enjoying a day on the greens! All proceeds go to animal rescue shelters, covering veterinary care, food, and rehabilitation for abandoned and injured animals.

**Beneficiary Shelters:**
- CUPA (Compassion Unlimited Plus Action), Bangalore
- Wildlife SOS, Agra
- PFA (People For Animals), Delhi

**How Funds Are Used:**
- Emergency veterinary surgeries
- Daily food and shelter maintenance
- Adoption programs
- Street animal vaccination camps
- Rescue vehicle maintenance

**Tournament Features:**
- Open to all skill levels
- Separate flights for professionals and amateurs
- Pet-friendly course areas
- Adoption fair at the venue
- Special prizes for animal lovers

"Until one has loved an animal, a part of one's soul remains unawakened." - Anatole France`,
    location: "Delhi Golf Club, New Delhi",
    coverImageUrl: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1200&h=600&fit=crop",
    goalAmount: new Decimal(150000),
    currentAmount: new Decimal(67500),
    status: CampaignStatus.ACTIVE,
    featured: false,
    startDate: daysAgo(15),
    endDate: daysFromNow(15),
  },
  {
    slug: "monsoon-tree-plantation-scramble",
    organizerId: DEMO_ACCOUNTS.ORGANIZER.id,
    organizationId: ORGANIZATIONS[0].id,
    title: "Monsoon Tree Plantation Scramble",
    category: "ENVIRONMENT",
    shortDescription: "Four-player scramble format. Each team sponsors 100 native trees toward our 10,000 tree goal.",
    description: `Get ready for a unique golf experience combined with environmental impact! This four-player scramble format tournament funds the plantation of 10,000 native trees during the monsoon season.

**Environmental Impact:**
- 10,000 native trees (Neem, Banyan, Peepal, Teak)
- 50 acres of degraded land restored
- Carbon sequestration: ~200 tons/year
- Wildlife habitat creation
- Employment for 50 local farmers

**Tournament Format:**
- Four-player scramble (best ball)
- Fun, relaxed format suitable for all levels
- Tree naming opportunities for top donors
- Drone video of your sponsored plantation area
- Certificate of environmental contribution

**Plantation Sites:**
- Western Ghats restoration project
- Aravalli hill reforestation
- Delhi Ridge forest expansion

**Timeline:**
- Tournament: ${daysFromNow(30).toDateString()}
- Plantation: Monsoon 2026 (June-August)
- Progress Updates: Monthly photos & reports

This campaign is in DRAFT status - coming soon!`,
    location: "Oxford Golf Resort, Pune",
    coverImageUrl: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=1200&h=600&fit=crop",
    goalAmount: new Decimal(200000),
    currentAmount: new Decimal(0),
    status: CampaignStatus.DRAFT,
    featured: false,
    startDate: daysFromNow(30),
    endDate: daysFromNow(90),
  },
  {
    slug: "golf-for-senior-citizens-health",
    organizerId: DEMO_ACCOUNTS.ORGANIZER.id,
    organizationId: ORGANIZATIONS[0].id,
    title: "Golf for Senior Citizens Health",
    category: "HEALTHCARE",
    shortDescription: "Senior-friendly tournament supporting free health checkup camps and physiotherapy for elderly citizens.",
    description: `A special tournament designed for senior golfers (55+) while raising funds for comprehensive health programs for elderly citizens who cannot afford regular medical care.

**Health Program Includes:**
- Free health checkup camps in 20 locations
- Physiotherapy sessions for 200 seniors
- Cataract surgery sponsorships
- Medicine subsidies for chronic conditions
- Mental health counseling

**Senior-Friendly Tournament:**
- Shorter course (Par 65)
- Golf cart included for all participants
- Modified rules for accessibility
- Professional physiotherapist on-site
- Health screening for participants

Perfect for senior golfers who want to give back to their community!`,
    location: "Bombay Presidency Golf Club, Mumbai",
    coverImageUrl: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&h=600&fit=crop",
    goalAmount: new Decimal(180000),
    currentAmount: new Decimal(42000),
    status: CampaignStatus.ACTIVE,
    featured: false,
    startDate: daysAgo(8),
    endDate: daysFromNow(22),
  },
  {
    slug: "women-empowerment-golf-cup",
    organizerId: DEMO_ACCOUNTS.ORGANIZER.id,
    organizationId: ORGANIZATIONS[0].id,
    title: "Women Empowerment Golf Cup",
    category: "EDUCATION",
    shortDescription: "All-women tournament supporting vocational training and entrepreneurship programs for underprivileged women.",
    description: `An empowering tournament BY women, FOR women! All participants are women golfers, and 100% of proceeds support skill development and entrepreneurship programs for economically disadvantaged women.

**Empowerment Programs:**
- Vocational training (tailoring, beauty services, handicrafts)
- Small business startup grants (₹25,000 each)
- Digital literacy and online business training
- Legal rights awareness workshops
- Mentorship from successful women entrepreneurs

**Success Metrics:**
- 150 women trained in 2025
- 45 small businesses launched
- Average income increase: 300%
- Financial independence achieved: 80% of beneficiaries

**Tournament Highlights:**
- Women-only event
- Professional women golfers as mentors
- Panel discussion on women in sports
- Networking opportunities
- Fashion show by beneficiary boutiques

"Empowering women isn't just the right thing to do - it's the smart thing to do."`,
    location: "Cosmo Club, Bangalore",
    coverImageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=1200&h=600&fit=crop",
    goalAmount: new Decimal(250000),
    currentAmount: new Decimal(98000),
    status: CampaignStatus.ACTIVE,
    featured: false,
    startDate: daysAgo(12),
    endDate: daysFromNow(18),
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// MAIN SEED FUNCTION
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Starting comprehensive database seeding for demo/recruiter showcase...\n");
  console.log("=" .repeat(70));

  // ───────────────────────────────────────────────────────────────────────────
  // 1. CREATE DEMO PROFILES
  // ───────────────────────────────────────────────────────────────────────────
  console.log("\n📋 Creating Demo Profiles:");
  console.log("-".repeat(70));

  const profiles = Object.values(DEMO_ACCOUNTS);
  
  for (const profile of profiles) {
    await prisma.profile.upsert({
      where: { id: profile.id },
      update: {
        fullName: profile.fullName,
        email: profile.email,
        role: profile.role,
        avatarUrl: profile.avatarUrl,
        verificationStatus: VerificationStatus.APPROVED,
      },
      create: {
        ...profile,
        verificationStatus: profile.role === UserRole.PENDING_ORGANIZER 
          ? VerificationStatus.PENDING 
          : VerificationStatus.APPROVED,
      },
    });
    console.log(`  ✓ ${profile.fullName} (${profile.role})`);
  }

  console.log(`\n  ✅ Created ${profiles.length} demo profiles`);

  // ───────────────────────────────────────────────────────────────────────────
  // 2. CREATE ORGANIZATIONS
  // ───────────────────────────────────────────────────────────────────────────
  console.log("\n🏢 Creating Organizations:");
  console.log("-".repeat(70));

  for (const org of ORGANIZATIONS) {
    await prisma.organization.upsert({
      where: { id: org.id },
      update: org,
      create: org,
    });
    console.log(`  ✓ ${org.name} (${org.verificationStatus})`);
  }

  console.log(`\n  ✅ Created ${ORGANIZATIONS.length} organizations`);

  // ───────────────────────────────────────────────────────────────────────────
  // 3. CREATE ORGANIZATION DOCUMENTS (for approved org)
  // ───────────────────────────────────────────────────────────────────────────
  console.log("\n📄 Creating Organization Documents:");
  console.log("-".repeat(70));

  const documents = [
    {
      organizationId: ORGANIZATIONS[0].id,
      documentType: DocumentType.REGISTRATION_CERTIFICATE,
      originalFileName: "registration_certificate.pdf",
      storagePath: `organization-documents/${ORGANIZATIONS[0].id}/registration/reg_cert_001.pdf`,
      mimeType: "application/pdf",
      fileSize: 245678,
      verificationStatus: VerificationStatus.APPROVED,
      reviewedAt: daysAgo(85),
    },
    {
      organizationId: ORGANIZATIONS[0].id,
      documentType: DocumentType.PAN_CARD,
      originalFileName: "pan_card.pdf",
      storagePath: `organization-documents/${ORGANIZATIONS[0].id}/pan/pan_001.pdf`,
      mimeType: "application/pdf",
      fileSize: 89123,
      verificationStatus: VerificationStatus.APPROVED,
      reviewedAt: daysAgo(85),
    },
    {
      organizationId: ORGANIZATIONS[0].id,
      documentType: DocumentType.TAX_EXEMPTION_CERTIFICATE,
      originalFileName: "80g_certificate.pdf",
      storagePath: `organization-documents/${ORGANIZATIONS[0].id}/tax/80g_cert_001.pdf`,
      mimeType: "application/pdf",
      fileSize: 123456,
      verificationStatus: VerificationStatus.APPROVED,
      reviewedAt: daysAgo(85),
    },
  ];

  for (const doc of documents) {
    await prisma.organizationDocument.create({
      data: doc,
    });
    console.log(`  ✓ ${doc.documentType} (${doc.verificationStatus})`);
  }

  console.log(`\n  ✅ Created ${documents.length} documents`);

  // ───────────────────────────────────────────────────────────────────────────
  // 4. CREATE CAMPAIGNS
  // ───────────────────────────────────────────────────────────────────────────
  console.log("\n🎯 Creating Campaigns:");
  console.log("-".repeat(70));

  for (const campaign of CAMPAIGNS) {
    await prisma.campaign.upsert({
      where: { slug: campaign.slug },
      update: campaign,
      create: campaign,
    });
    console.log(`  ✓ ${campaign.title}`);
    console.log(`    Status: ${campaign.status} | Goal: ₹${campaign.goalAmount.toString()} | Raised: ₹${campaign.currentAmount.toString()}`);
  }

  console.log(`\n  ✅ Created ${CAMPAIGNS.length} campaigns`);

  // ───────────────────────────────────────────────────────────────────────────
  // 5. CREATE DONATIONS & PAYMENTS (for active campaigns with currentAmount > 0)
  // ───────────────────────────────────────────────────────────────────────────
  console.log("\n💰 Creating Donations & Payments:");
  console.log("-".repeat(70));

  let totalDonations = 0;
  const donors = [
    DEMO_ACCOUNTS.DONOR,
    DEMO_ACCOUNTS.DONOR_2,
    DEMO_ACCOUNTS.DONOR_3,
  ];

  // Get campaigns that need donations
  const activeCampaigns = CAMPAIGNS.filter(c => c.currentAmount.greaterThan(0));

  for (const campaign of activeCampaigns) {
    const targetAmount = campaign.currentAmount;
    let raised = new Decimal(0);
    let donationCount = 0;

    // Get actual campaign from DB
    const dbCampaign = await prisma.campaign.findUnique({
      where: { slug: campaign.slug },
    });

    if (!dbCampaign) continue;

    // Create 5-10 donations per campaign
    const numDonations = Math.floor(Math.random() * 6) + 5;

    for (let i = 0; i < numDonations && raised.lessThan(targetAmount); i++) {
      const donor = donors[i % donors.length];
      const remainingAmount = targetAmount.minus(raised);
      const maxDonation = remainingAmount.dividedBy(numDonations - i);
      
      // Random donation between 1000 and maxDonation
      const donationAmount = Decimal.min(
        randomAmount(1000, Number(maxDonation.toFixed(0))),
        remainingAmount
      );

      const isAnonymous = Math.random() > 0.7; // 30% anonymous
      const hasMessage = Math.random() > 0.5; // 50% with message

      const messages = [
        "Great initiative! Happy to support.",
        "Keep up the excellent work!",
        "Proud to contribute to this cause.",
        "Together we can make a difference.",
        "God bless this noble cause!",
        null,
      ];

      const donation = await prisma.donation.create({
        data: {
          donorId: donor.id,
          campaignId: dbCampaign.id,
          amount: donationAmount,
          currency: "INR",
          isAnonymous,
          message: hasMessage ? messages[Math.floor(Math.random() * messages.length)] : null,
          status: DonationStatus.COMPLETED,
          donatedAt: daysAgo(Math.floor(Math.random() * 30)),
        },
      });

      // Create corresponding payment
      await prisma.payment.create({
        data: {
          donationId: donation.id,
          gateway: PaymentGateway.RAZORPAY,
          gatewayOrderId: `order_${Date.now()}_${i}`,
          gatewayPaymentId: `pay_${Date.now()}_${i}`,
          currency: "INR",
          amount: donationAmount,
          fee: donationAmount.times(0.02), // 2% fee
          tax: donationAmount.times(0.02).times(0.18), // 18% GST on fee
          netAmount: donationAmount.times(0.98),
          status: PaymentStatus.CAPTURED,
          processedAt: daysAgo(Math.floor(Math.random() * 30)),
        },
      });

      raised = raised.plus(donationAmount);
      donationCount++;
    }

    totalDonations += donationCount;
    console.log(`  ✓ ${campaign.title}: ${donationCount} donations, ₹${raised.toFixed(0)} raised`);
  }

  console.log(`\n  ✅ Created ${totalDonations} donations with payments`);

  // ───────────────────────────────────────────────────────────────────────────
  // SUMMARY
  // ───────────────────────────────────────────────────────────────────────────
  console.log("\n" + "=".repeat(70));
  console.log("\n🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY!\n");
  
  console.log("📊 Summary:");
  console.log(`  • ${profiles.length} demo profiles created`);
  console.log(`  • ${ORGANIZATIONS.length} organizations created`);
  console.log(`  • ${documents.length} documents uploaded`);
  console.log(`  • ${CAMPAIGNS.length} campaigns created`);
  console.log(`  • ${totalDonations} donations with payments`);

  console.log("\n🔐 Demo Login Credentials (for Supabase Auth):");
  console.log("-".repeat(70));
  console.log("  Admin:          admin@golfcharity.com / Demo@123");
  console.log("  Organizer:      organizer@golfcharity.com / Demo@123");
  console.log("  Donor:          donor@golfcharity.com / Demo@123");
  console.log("  Pending Org:    pending@golfcharity.com / Demo@123");
  console.log(`  Your Account:   ${YOUR_EMAIL} / <your-password>`);

  console.log("\n⚠️  IMPORTANT: Create these users in Supabase Auth to login!");
  console.log("   Go to: Supabase Dashboard → Authentication → Add User\n");

  console.log("✨ Your recruiter demo is ready to showcase!");
  console.log("=" .repeat(70) + "\n");
}

// ─────────────────────────────────────────────────────────────────────────────
// EXECUTE
// ─────────────────────────────────────────────────────────────────────────────

main()
  .catch((e) => {
    console.error("\n❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
