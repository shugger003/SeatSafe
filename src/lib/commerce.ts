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

export function buildQuote(input: {
  lines: CartLineInput[];
  products: CatalogProduct[];
  store: StoreSettings;
  discount: Discount | null;
  methodId: string | null;
  paymentsReady: boolean;
  now?: Date;
}): Quote {
  const currency = input.store.currency || "GHS";
  const blockers: string[] = [];
  const byId = new Map(input.products.map((product) => [product.id, product]));
  const quoteLines: QuoteLine[] = [];

  if (input.lines.length === 0) blockers.push("Your cart is empty.");

  for (const line of input.lines) {
    const quantity = Math.floor(line.quantity);
    const product = byId.get(line.productId);
    if (!product) {
      quoteLines.push(emptyLine(line, "This product is no longer available."));
      blockers.push("A product in the cart is no longer available.");
      continue;
    }
    if (product.currency !== currency) {
      quoteLines.push(emptyLine(line, "This product uses a different currency.", product.name));
      blockers.push(`${product.name} uses a different currency from the store.`);
      continue;
    }
    const variant = line.variantId ? product.variants.find((item) => item.id === line.variantId) ?? null : null;
    if (line.variantId && !variant) {
      quoteLines.push(emptyLine(line, "That option is no longer available.", product.name));
      blockers.push(`An option for ${product.name} is no longer available.`);
      continue;
    }
    if (!line.variantId && product.variants.length > 0) {
      quoteLines.push(emptyLine(line, "Choose an option.", product.name));
      blockers.push(`Choose an option for ${product.name}.`);
      continue;
    }
    const price = unitPrice(product, variant);
    const stock = availableStock(product, variant);
    const name = product.name;
    const variantName = variant?.name ?? "";
    const sku = variant?.sku || product.sku;
    let message: string | null = null;
    let available = true;
    if (product.status !== "published") {
      available = false;
      message = product.status === "coming_soon" ? "Coming soon." : "Not available to purchase.";
    } else if (price == null || price <= 0) {
      available = false;
      message = "Price has not been published.";
    } else if (!Number.isInteger(quantity) || quantity < 1) {
      available = false;
      message = "Enter a quantity of at least 1.";
    } else if (quantity > stock) {
      available = false;
      message = stock > 0 ? `Only ${stock} available.` : "Out of stock.";
    } else if (quantity > 20) {
      available = false;
      message = "Quantity is above the limit of 20 per order.";
    }
    if (!available && message) blockers.push(`${name}: ${message}`);
    quoteLines.push({
      productId: product.id,
      variantId: variant?.id ?? null,
      name,
      variantName,
      sku,
      quantity: quantity > 0 ? quantity : 0,
      unitPriceMinor: available ? price : price,
      lineTotalMinor: available && price != null ? price * quantity : null,
      available,
      message,
    });
  }

  const subtotalMinor = quoteLines.reduce((sum, line) => sum + (line.available && line.lineTotalMinor != null ? line.lineTotalMinor : 0), 0);
  const priced = quoteLines.every((line) => line.available);
  const discountResult = input.discount && priced ? evaluateDiscount(subtotalMinor, input.discount, input.now) : { discountMinor: 0, message: input.discount && !priced ? "The code will be checked when every item is available." : null, ok: !input.discount };
  if (input.discount && priced && !discountResult.ok && discountResult.message) blockers.push(discountResult.message);

  const methods = activeDeliveryMethods(input.store);
  const selected = input.methodId ? methods.find((method) => method.id === input.methodId) ?? null : methods.length === 1 ? methods[0] : null;
  let deliveryFeeMinor: number | null = null;
  let deliveryLabel: string | null = null;
  let deliverySummary: string | null = null;
  if (methods.length === 0) {
    blockers.push("Delivery pricing has not been published.");
  } else if (!selected) {
    blockers.push("Choose a delivery method.");
  } else {
    deliveryFeeMinor = selected.feeMinor;
    deliveryLabel = selected.label;
    deliverySummary = selected.summary || null;
  }

  if (input.store.storeStatus === "coming_soon") blockers.push("The store is not open for orders yet.");
  if (input.store.storeStatus === "paused") blockers.push("Ordering is temporarily paused.");
  if (!input.paymentsReady) blockers.push("Payment is not configured yet, so checkout cannot take payment.");

  const discountMinor = discountResult.ok ? discountResult.discountMinor : 0;
  const totalMinor = priced && deliveryFeeMinor != null ? subtotalMinor - discountMinor + deliveryFeeMinor : null;
  if (totalMinor != null && totalMinor < 1) blockers.push("Orders need a payable total.");

  const uniqueBlockers = [...new Set(blockers)];
  return {
    lines: quoteLines,
    subtotalMinor,
    discountMinor,
    discountMessage: discountResult.message,
    deliveryFeeMinor,
    deliveryLabel,
    deliverySummary,
    totalMinor: uniqueBlockers.length === 0 ? totalMinor : totalMinor,
    currency,
    purchasable: uniqueBlockers.length === 0 && totalMinor != null && totalMinor >= 1,
    blockers: uniqueBlockers,
  };
}

function emptyLine(line: CartLineInput, message: string, name = "Unavailable item"): QuoteLine {
  return {
    productId: line.productId,
    variantId: line.variantId,
    name,
    variantName: "",
    sku: "",
    quantity: line.quantity,
    unitPriceMinor: null,
    lineTotalMinor: null,
    available: false,
    message,
  };
}

export function purchaseBlockersForDisplay(product: CatalogProduct, store: StoreSettings, paymentsReady: boolean) {
  const blockers: string[] = [];
  if (store.storeStatus === "coming_soon") blockers.push("The store is not open for orders yet.");
  if (store.storeStatus === "paused") blockers.push("Ordering is temporarily paused.");
  if (product.status === "coming_soon") blockers.push("This product is coming soon.");
  if (product.status === "draft") blockers.push("This product is not published.");
  if (product.status === "unavailable") blockers.push("This product is temporarily unavailable.");
  if (product.status === "published") {
    const price = displayPrice(product);
    if (price == null || price <= 0) blockers.push("A price has not been published.");
    const stock = product.variants.length
      ? product.variants.reduce((sum, variant) => sum + (variant.available ? variant.stockQuantity : 0), 0)
      : product.stockQuantity;
    if (stock <= 0) blockers.push("This product is out of stock.");
  }
  if (activeDeliveryMethods(store).length === 0) blockers.push("Delivery pricing has not been published.");
  if (!paymentsReady) blockers.push("Payment setup is still pending.");
  return blockers;
}
