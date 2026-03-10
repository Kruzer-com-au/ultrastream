"use client";

import Script from "next/script";

const PLAUSIBLE_DOMAIN =
  process.env.NEXT_PUBLIC_PLAUSIBLE_SITE || "ultrastream.gg";
const PLAUSIBLE_HOST =
  process.env.NEXT_PUBLIC_PLAUSIBLE_HOST || "https://plausible.io";

/**
 * Plausible Analytics provider.
 * Injects the Plausible script tag in production only.
 * Supports self-hosted Plausible via NEXT_PUBLIC_PLAUSIBLE_HOST env var.
 *
 * Custom events are tracked via window.plausible() calls (see src/lib/analytics.ts).
 */
export function PlausibleProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const isProduction = process.env.NODE_ENV === "production";

  return (
    <>
      {isProduction && (
        <Script
          defer
          data-domain={PLAUSIBLE_DOMAIN}
          src={`${PLAUSIBLE_HOST}/js/script.tagged-events.outbound-links.file-downloads.js`}
          strategy="afterInteractive"
        />
      )}
      {/* Plausible custom event queue -- ensures events aren't lost before script loads */}
      {isProduction && (
        <Script
          id="plausible-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `window.plausible = window.plausible || function() { (window.plausible.q = window.plausible.q || []).push(arguments) }`,
          }}
        />
      )}
      {children}
    </>
  );
}
