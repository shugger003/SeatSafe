import { describe, expect, it } from "vitest";
import { buildQuote, evaluateDiscount } from "@/lib/commerce";
import type { Discount, Product, StoreSettings } from "@/lib/types";
import { defaultStore } from "@/lib/defaults";

function store(patch: Partial<StoreSettings> = {}): StoreSettings {
  return {
    ...defaultStore(),
    storeStatus: "open",
    deliveryMethods: [{ id: "standard", label: "Standard", feeMinor: 2000, summary: "Confirmed test delivery", active: true }],
    ...patch,
  };
}

function product(patch: Partial<Product> = {}): Product {
  return {
    id: "p1",
    name: "Product name",
    slug: "product-name",
    shortDescription: "",
    description: "",
    currency: "GHS",
    priceMinor: 5000,
    compareAtPriceMinor: null,
    sku: "SKU",
    stockQuantity: 4,
    lowStockThreshold: 2,
    status: "published",
    featured: false,
    category: "",
    images: [],
    variants: [],
    specs: [],
    benefits: [],
    instructions: [],
    seoTitle: "",
    seoDescription: "",
    createdAt: "",
    updatedAt: "",
    ...patch,
  };
}

describe("quote", () => {
  it("recalculates the total on the server inputs", () => {
    const quote = buildQuote({
      lines: [{ productId: "p1", variantId: null, quantity: 2 }],
      products: [product()],
      store: store(),
      discount: null,
      methodId: "standard",
      paymentsReady: true,
    });
    expect(quote.subtotalMinor).toBe(10000);
    expect(quote.deliveryFeeMinor).toBe(2000);
    expect(quote.totalMinor).toBe(12000);
    expect(quote.purchasable).toBe(true);
  });

  it("accepts a quantity above 20 when that many are in stock", () => {
    const quote = buildQuote({
      lines: [{ productId: "p1", variantId: null, quantity: 21 }],
      products: [product({ stockQuantity: 1000 })],
      store: store(),
      discount: null,
      methodId: "standard",
      paymentsReady: true,
    });
    expect(quote.purchasable).toBe(true);
    expect(quote.lines[0]?.stock).toBe(1000);
    expect(quote.subtotalMinor).toBe(105000);
  });

  it("rejects quantities above stock", () => {
    const quote = buildQuote({
      lines: [{ productId: "p1", variantId: null, quantity: 5 }],
      products: [product()],
      store: store(),
      discount: null,
      methodId: "standard",
      paymentsReady: true,
    });
    expect(quote.purchasable).toBe(false);
    expect(quote.blockers.join(" ")).toMatch(/Only 4 available/);
  });

  it("does not treat a missing price as zero", () => {
    const quote = buildQuote({
      lines: [{ productId: "p1", variantId: null, quantity: 1 }],
      products: [product({ priceMinor: null, status: "coming_soon" })],
      store: store(),
      discount: null,
      methodId: "standard",
      paymentsReady: true,
    });
    expect(quote.purchasable).toBe(false);
  });
});

describe("discounts", () => {
  const code: Discount = {
    id: "d1",
    code: "SAVE10",
    type: "percent",
    value: 10,
    minOrderMinor: 1000,
    usageLimit: 1,
    usedCount: 0,
    expiresAt: null,
    active: true,
    createdAt: "",
    updatedAt: "",
  };

  it("caps a percentage discount at the subtotal", () => {
    expect(evaluateDiscount(1500, code).discountMinor).toBe(150);
  });

  it("rejects an exhausted code", () => {
    expect(evaluateDiscount(1500, { ...code, usedCount: 1 }).ok).toBe(false);
  });
});
