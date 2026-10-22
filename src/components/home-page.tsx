import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { ProductMedia } from "@/components/product-media";
import { ProductPurchase } from "@/components/product-purchase";
import { StoreIcon } from "@/components/icons";
import { Button, EmptyState, Price } from "@/components/ui";
import { videoEmbed } from "@/lib/media";
import { purchaseBlockersForDisplay } from "@/lib/commerce";
import { formatMoney } from "@/lib/money";
import { paymentsMode } from "@/lib/moolre";
import type { Benefit, Faq, HomepageContent, Product, Step, StoreSettings, UseCase } from "@/lib/types";

export function HomePage({
  store,
  home,
  benefits,
  steps,
  products,
  useCases,
  faqs,
  paymentsReady,
}: {
  store: StoreSettings;
  home: HomepageContent;
  benefits: Benefit[];
  steps: Step[];
  products: Product[];
  useCases: UseCase[];
  faqs: Faq[];
  paymentsReady: boolean;
}) {
  const featured = products.find((product) => product.featured) ?? products[0];
  const openProduct = products.find((product) => purchaseBlockersForDisplay(product, store, paymentsReady).length === 0);
  const paused = store.storeStatus === "paused" || (products.length > 0 && products.every((product) => product.status === "unavailable"));
  const cta = openProduct
    ? { href: `/product/${openProduct.slug}`, label: "Shop now" }
    : paused
      ? { href: "/shop", label: "See availability" }
      : { href: featured ? `/product/${featured.slug}` : "/shop", label: home.hero.primaryLabel || "View the product" };
  const featuredBlockers = featured ? purchaseBlockersForDisplay(featured, store, paymentsReady) : [];
  const featuredBlocker = featured?.variants.length
    ? featuredBlockers.find((item) => !item.startsWith("This product is out of stock")) ?? null
    : featuredBlockers[0] ?? null;
  const video = videoEmbed(home.video.url);
  const trust = trustRows(store, paymentsReady);

  return (
    <div>
      <section className="bg-mist">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-5 py-10 sm:px-8 lg:grid-cols-2 lg:gap-16 lg:py-16">
        <div className="order-2">
          <ProductMedia
            src={featured?.images[0]?.src}
            alt={featured?.images[0]?.alt || featured?.name || store.businessName}
            logo={store.logoUrl}
            priority
            tone="stage"
          />
        </div>
