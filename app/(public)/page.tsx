import { prisma } from "@/lib/prisma";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import LiveShowcaseSection from "@/components/landing/LiveShowcaseSection";
import CTASection from "@/components/landing/CTASection";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let campaigns: any[] = [];

  try {
    const dbCampaigns = await prisma.campaign.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: { createdAt: "desc" },
      take: 6,
      include: {
        organization: {
          select: { name: true },
        },
      },
    });

    campaigns = dbCampaigns.map((c) => ({
      id: c.id,
      slug: c.slug,
      title: c.title,
      shortDescription: c.shortDescription || c.description.slice(0, 100) + "...",
      category: c.category,
      goalAmount: Number(c.goalAmount),
      currentAmount: Number(c.currentAmount),
      coverImageUrl: c.coverImageUrl,
      organizationName: c.organization?.name,
    }));
  } catch (error) {
    console.warn("Could not fetch campaigns for home page:", error);
  }

  const featuredCampaign = campaigns.length > 0 ? campaigns[0] : null;
  const recentCampaigns = campaigns.length > 1 ? campaigns.slice(1) : campaigns;

  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <LiveShowcaseSection
        featuredCampaign={featuredCampaign}
        recentCampaigns={recentCampaigns}
      />
      <CTASection />
    </>
  );
}