import { FeatureGrid } from "@/components/FeatureGrid";
import { FutureRoadmap } from "@/components/FutureRoadmap";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { Lifecycle } from "@/components/Lifecycle";
import { PlanCards } from "@/components/PlanCards";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { WaitlistForm } from "@/components/WaitlistForm";

export default function Home() {
  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[var(--background)]">
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <FeatureGrid />
        <HowItWorks />
        <PlanCards />
        <Lifecycle />
        <FutureRoadmap />
        <WaitlistForm />
      </main>
      <SiteFooter />
    </div>
  );
}
