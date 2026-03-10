import { siteMetadata } from "@/lib/metadata";

/**
 * Renders JSON-LD structured data for Organization and WebSite schemas.
 * Placed in root layout <body> for search engine discovery.
 */
export function StructuredData() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteMetadata.siteName,
    url: siteMetadata.siteUrl,
    logo: `${siteMetadata.siteUrl}/opengraph-image`,
    description: siteMetadata.description,
    sameAs: [],
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteMetadata.siteName,
    url: siteMetadata.siteUrl,
    description: siteMetadata.description,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteSchema),
        }}
      />
    </>
  );
}
