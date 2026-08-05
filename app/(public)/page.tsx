import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import CharitySpotlightSection from "@/components/landing/CharitySpotlightSection";
import LeaderboardPreviewSection from "@/components/landing/LeaderboardPreviewSection";
import TrustSection from "@/components/landing/TrustSection";
import CTASection from "@/components/landing/CTASection";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <CharitySpotlightSection />
      <LeaderboardPreviewSection />
      <TrustSection />
      <CTASection />
    </>
  );
}