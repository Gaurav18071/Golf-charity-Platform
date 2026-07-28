import Navbar from "@/components/layout/Navbar";
import FeaturesSection from "@/components/landing/FeaturesSection";
import HeroSection from "@/components/landing/HeroSection";
import HowItWorksSection from "@/app/(public)/how-it-works/HowItWorksSection";
import LeaderboardPreviewSection from "@/components/landing/LeaderboardPreviewSection";
import TrustSection from "@/components/landing/TrustSection";

export default function HomePage() {
  return (
    <>
      
      <main>
        <HeroSection />
        <TrustSection />
        <HowItWorksSection />
        <FeaturesSection />
        <LeaderboardPreviewSection />
      </main>
    </>
  );
}