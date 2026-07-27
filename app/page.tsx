import Navbar from "@/components/Layout/Navbar";
import FeaturesSection from "@/components/landing/FeaturesSection";
import HeroSection from "@/components/landing/HeroSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
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