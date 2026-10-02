import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
export default function sitemap(): MetadataRoute.Sitemap {
  return siteConfig.url
    ? [
        { url: siteConfig.url, changeFrequency: "monthly", priority: 1 },
        {
          url: `${siteConfig.url}/privacidade`,
          changeFrequency: "yearly",
          priority: 0.2,
        },
      ]
    : [];
}
