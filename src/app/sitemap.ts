import type { MetadataRoute } from "next";
import { catalogCached, getCampaigns, listPublicProducts } from "@/lib/db";
import { siteUrl } from "@/lib/safe";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const staticRoutes = ["", "/shop", "/how-it-works", "/about", "/faq", "/contact", "/policies/shipping", "/policies/returns", "/policies/privacy", "/policies/terms"].map((path) => ({
    url: `${base}${path || "/"}`,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));
  const products = (await catalogCached("public-products-200", () => listPublicProducts({ pageSize: 200 }))).products.map((product) => ({
    url: `${base}/product/${product.slug}`,
    lastModified: product.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));
  const campaigns = (await catalogCached("campaigns", getCampaigns))
    .filter((campaign) => campaign.published)
    .map((campaign) => ({ url: `${base}/c/${campaign.slug}`, changeFrequency: "weekly" as const, priority: 0.6 }));
  return [...staticRoutes, ...products, ...campaigns];
}
