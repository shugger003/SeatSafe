import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/safe";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api", "/checkout", "/cart", "/order"],
    },
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
