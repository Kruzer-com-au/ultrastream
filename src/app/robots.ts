import type { MetadataRoute } from "next";
import { siteMetadata } from "@/lib/metadata";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: "/api/",
      },
    ],
    sitemap: `${siteMetadata.siteUrl}/sitemap.xml`,
  };
}
