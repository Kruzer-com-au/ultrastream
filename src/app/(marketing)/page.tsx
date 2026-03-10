import { ScrollProgress } from "@/components/animation/ScrollProgress";
import { ScrollDepthTracker } from "@/components/analytics/scroll-depth-tracker";
import { SectionTransitionWrapper } from "./sections/section-wrappers";
import { PortalJourneyWrapper } from "./sections/portal-journey-wrapper";
import { BattleGameWrapper } from "./sections/battle-wrapper";
import { VillainsSection } from "@/components/sections/villains-section";
import { RevenueComparison } from "@/components/sections/revenue-section";
import { FeaturesShowcase } from "@/components/sections/features-section";
import { UltraverseSection } from "@/components/sections/ultraverse-section";
import { CTASection } from "@/components/sections/cta-section";
import { InlineCTA } from "@/components/waitlist/inline-cta";
import { StickyCTA } from "@/components/waitlist/sticky-cta";
import { WaitlistProvider } from "@/components/waitlist/waitlist-provider";
import { AudioToggle } from "@/components/ui/audio-toggle";
import { Footer } from "@/components/layout/footer";

export default function HomePage() {
  return (
    <WaitlistProvider>
      <div id="main-content" className="min-h-screen">
        <ScrollProgress />
        <ScrollDepthTracker />

        {/* ═══════════════════════════════════════════════════════════════
            ACT 1-2: THE PORTAL JOURNEY
            Stargate hero → Warp tunnel → Battle arena reveal
            PortalJourney orchestrates the entire scroll-driven sequence.
        ═══════════════════════════════════════════════════════════════ */}
        <PortalJourneyWrapper>
          <BattleGameWrapper />
        </PortalJourneyWrapper>

        {/* ═══════════════════════════════════════════════════════════════
            ACT 3: THE VILLAINS — Who we're fighting
        ═══════════════════════════════════════════════════════════════ */}
        <SectionTransitionWrapper effect="scale-up">
          <VillainsSection />
        </SectionTransitionWrapper>

        {/* Revenue: where the money goes */}
        <SectionTransitionWrapper effect="clip-expand">
          <RevenueComparison />
        </SectionTransitionWrapper>

        {/* The Arsenal: our weapons */}
        <SectionTransitionWrapper effect="curtain-reveal">
          <FeaturesShowcase />
        </SectionTransitionWrapper>

        {/* Mid-page CTA: catch them while they're excited */}
        <InlineCTA />

        {/* The Ecosystem: ULTRAVERSE connection */}
        <SectionTransitionWrapper effect="parallax-stack">
          <UltraverseSection />
        </SectionTransitionWrapper>

        {/* Final CTA: the call to arms */}
        <SectionTransitionWrapper effect="scale-up">
          <CTASection />
        </SectionTransitionWrapper>

        {/* Sticky CTA bar: follows scroll */}
        <StickyCTA />

        <AudioToggle />
      </div>
      <Footer />
    </WaitlistProvider>
  );
}
