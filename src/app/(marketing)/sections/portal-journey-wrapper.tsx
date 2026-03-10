"use client";

import { PortalJourney } from "@/components/stargate/PortalJourney";

interface PortalJourneyWrapperProps {
  children: React.ReactNode;
}

/**
 * Client component wrapper for PortalJourney.
 * Allows the server component page.tsx to use the scroll-driven
 * Stargate -> WarpTunnel -> Battle reveal orchestration.
 */
export function PortalJourneyWrapper({ children }: PortalJourneyWrapperProps) {
  return <PortalJourney>{children}</PortalJourney>;
}
