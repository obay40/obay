import { Hero } from "@/features/home/Hero";
import { SearchTeaser } from "@/features/home/SearchTeaser";
import { HowItWorks } from "@/features/home/HowItWorks";
import { TrustSection } from "@/features/home/TrustSection";
import { FaqTeaser } from "@/features/home/FaqTeaser";

export default function HomePage() {
  return (
    <>
      <Hero />
      <SearchTeaser />
      <HowItWorks />
      <TrustSection />
      <FaqTeaser />
    </>
  );
}
