import type { Discount, Product, ProductVariant, Quote, QuoteLine, StoreSettings, CartLineInput } from "@/lib/types";

export type CatalogProduct = Pick<
  Product,
  | "id"
  | "name"
  | "slug"
  | "status"
  | "currency"
  | "priceMinor"
  | "compareAtPriceMinor"
  | "sku"
  | "stockQuantity"
  | "variants"
>;

export function availableStock(product: CatalogProduct, variant: ProductVariant | null) {
  if (variant) return variant.available ? variant.stockQuantity : 0;
  return product.stockQuantity;
}

export function unitPrice(product: CatalogProduct, variant: ProductVariant | null) {
  if (variant) return variant.priceMinor;
  return product.priceMinor;
}

export function displayPrice(product: CatalogProduct) {
  if (product.variants.length === 0) return product.priceMinor;
  const prices = product.variants
    .filter((variant) => variant.available && variant.priceMinor != null)
    .map((variant) => variant.priceMinor as number);
  if (prices.length === 0) return null;
  return Math.min(...prices);
}

export function activeDeliveryMethods(store: StoreSettings) {
  return store.deliveryMethods.filter((method) => method.active && method.label.trim() && method.feeMinor >= 0);
}

export function normalizeCode(code: string | null | undefined) {
  return (code ?? "").trim().toUpperCase();
}

export function evaluateDiscount(subtotalMinor: number, discount: Discount | null, now = new Date()) {
  if (!discount) return { discountMinor: 0, message: null as string | null, ok: true };
  if (!discount.active) return { discountMinor: 0, message: "That code is not active.", ok: false };
  if (discount.expiresAt && new Date(discount.expiresAt).getTime() < now.getTime()) {
    return { discountMinor: 0, message: "That code has expired.", ok: false };
  }
  if (discount.usageLimit != null && discount.usedCount >= discount.usageLimit) {
    return { discountMinor: 0, message: "That code has reached its usage limit.", ok: false };
  }
  if (subtotalMinor < discount.minOrderMinor) {
    return { discountMinor: 0, message: "The order has not reached this code’s minimum.", ok: false };
  }
  const raw = discount.type === "percent" ? Math.floor((subtotalMinor * discount.value) / 100) : discount.value;
  const discountMinor = Math.min(Math.max(0, raw), subtotalMinor);
  if (discountMinor <= 0) return { discountMinor: 0, message: "That code does not change this order.", ok: false };
  return { discountMinor, message: null, ok: true };
}
