import type { Metadata } from "next";

/**
 * Centralized site metadata configuration.
 * Single source of truth for SEO, OG, and structured data values.
 */
export const siteMetadata = {
  siteName: "ULTRASTREAM",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://ultrastream.gg",
  title: "ULTRASTREAM — Take Streaming Back",
  description:
    "The decentralized streaming platform built for creators and gamers. 0-5% fees, creator-owned channels, censorship-resistant streaming. Take back the stream.",
  keywords: [
    "streaming",
    "gaming",
    "creator economy",
    "decentralized streaming",
    "Web3",
    "Twitch alternative",
    "creator monetization",
    "live streaming platform",
    "censorship resistant",
    "ULTRASTREAM",
    "ULTRAVERSE",
  ],
  locale: "en_US",
  type: "website" as const,
};

/**
 * Generate a Next.js Metadata object with optional page-level overrides.
 * Used as the default metadata export in root layout, and can be called
 * from individual pages with custom title/description.
 */
export function generatePageMetadata(
  overrides: Partial<Metadata> = {}
): Metadata {
  const {
    title: overrideTitle,
    description: overrideDescription,
    ...rest
  } = overrides;

  return {
    metadataBase: new URL(siteMetadata.siteUrl),
    title: overrideTitle ?? {
      default: siteMetadata.title,
      template: `%s | ${siteMetadata.siteName}`,
    },
    description: overrideDescription ?? siteMetadata.description,
    keywords: siteMetadata.keywords,
    authors: [{ name: siteMetadata.siteName }],
    creator: siteMetadata.siteName,
    publisher: siteMetadata.siteName,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      type: siteMetadata.type,
      locale: siteMetadata.locale,
      url: siteMetadata.siteUrl,
      siteName: siteMetadata.siteName,
      title: (overrideTitle as string) ?? siteMetadata.title,
      description: overrideDescription ?? siteMetadata.description,
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: siteMetadata.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: (overrideTitle as string) ?? siteMetadata.title,
      description: overrideDescription ?? siteMetadata.description,
      images: ["/twitter-image"],
    },
    ...rest,
  };
}
