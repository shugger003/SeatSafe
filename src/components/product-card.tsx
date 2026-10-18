import Link from "next/link";
import { ProductMedia } from "@/components/product-media";
import { Price } from "@/components/ui";
import { displayPrice } from "@/lib/commerce";
import type { Product } from "@/lib/types";

export function availabilityLabel(product: Product) {
  if (product.status === "coming_soon") return "Coming soon";
  if (product.status === "unavailable") return "Temporarily unavailable";
  if (product.status !== "published") return "Not available";
  const price = displayPrice(product);
  if (price == null) return "Price to be confirmed";
  const stock = product.variants.length
    ? product.variants.reduce((sum, variant) => sum + (variant.available ? variant.stockQuantity : 0), 0)
    : product.stockQuantity;
  if (stock <= 0) return "Out of stock";
  if (stock <= product.lowStockThreshold) return "Limited availability";
  return "In stock";
}

export function ProductCard({ product, heading = "h2" }: { product: Product; heading?: "h2" | "h3" }) {
  const Title = heading;
  return (
    <article className="group h-full">
      <Link href={`/product/${product.slug}`} className="block h-full">
        <ProductMedia src={product.images[0]?.src} alt={product.images[0]?.alt || `${product.name} image placeholder`} />
        <div className="mt-4 flex items-start justify-between gap-4">
          <Title className="font-display text-2xl leading-tight tracking-[-0.02em] underline-offset-4 group-hover:underline">{product.name}</Title>
          <Price minor={displayPrice(product)} currency={product.currency} compare={product.variants.length ? null : product.compareAtPriceMinor} />
        </div>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">{product.shortDescription}</p>
        <p className="mt-3 text-sm text-pine">{availabilityLabel(product)}</p>
      </Link>
    </article>
  );
}
