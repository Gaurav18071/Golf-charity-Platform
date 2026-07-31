import HeroSection from "@/src/components/landing/HeroSection";
import FeaturesSection from "@/src/components/landing/FeaturesSection";
import CharitySpotlightSection from "@/src/components/landing/CharitySpotlightSection";
import LeaderboardPreviewSection from "@/src/components/landing/LeaderboardPreviewSection";
import TrustSection from "@/src/components/landing/TrustSection";
import CTASection from "@/src/components/landing/CTASection";

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