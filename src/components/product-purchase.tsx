"use client";

import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/components/cart-provider";
import { QuantityStepper } from "@/components/quantity-stepper";
import { Price } from "@/components/ui";
import { track } from "@/components/analytics";

type Option = {
  id: string;
  name: string;
  priceMinor: number | null;
  compareAtPriceMinor: number | null;
  stockQuantity: number;
  available: boolean;
};

export function ProductPurchase({
  productId,
  name,
  currency,
  options,
  basePrice,
  baseCompare,
  baseStock,
  blocked,
}: {
  productId: string;
  name: string;
  currency: string;
  options: Option[];
  basePrice: number | null;
  baseCompare: number | null;
  baseStock: number;
  blocked: string | null;
}) {
  const { add } = useCart();
  useEffect(() => {
    track("view_item", { item_id: productId, currency });
  }, [currency, productId]);
  const [variantId, setVariantId] = useState(options[0]?.id ?? "");
  const [quantity, setQuantity] = useState(1);
  const selected = options.find((option) => option.id === variantId) ?? null;
  const price = selected ? selected.priceMinor : basePrice;
  const compare = selected ? selected.compareAtPriceMinor : baseCompare;
  const stock = selected ? (selected.available ? selected.stockQuantity : 0) : baseStock;
  const reason = useMemo(() => {
    if (blocked) return blocked;
    if (options.length > 0 && !selected) return "Choose an option.";
    if (price == null || price <= 0) return "A price has not been published.";
    if (stock <= 0) return "Out of stock.";
    return null;
  }, [blocked, options.length, selected, price, stock]);
  const quantityCap = stock > 0 ? Math.min(20, stock) : blocked || price == null ? 20 : 1;

  function addToCart() {
    if (reason) return;
    add({ productId, variantId: selected?.id ?? null, quantity }, selected ? `${name}, ${selected.name}` : name);
    track("add_to_cart", { item_id: productId, quantity, currency });
  }

  const control = (
    <div className="grid gap-4 rounded-lg border border-line bg-surface p-5 text-left">
      {options.length > 0 ? (
        <label className="grid gap-1.5 text-sm">
          <span className="font-medium">Option</span>
          <select
            value={variantId}
            onChange={(event) => {
              setVariantId(event.target.value);
              setQuantity(1);
            }}
            className="field"
          >
            {options.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
                {option.available && option.stockQuantity > 0 ? "" : " (unavailable)"}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      <div className="flex flex-wrap items-end gap-4">
        <div className="grid gap-1.5 text-sm">
          <span className="font-medium">Quantity</span>
          <QuantityStepper value={quantity} max={quantityCap} onChange={setQuantity} />
          <span className="text-muted">{stock > 0 ? `${stock} in stock` : "Out of stock"}</span>
        </div>
        <Price minor={price} currency={currency} compare={compare} className="pb-2 text-lg" />
      </div>
      <button
        type="button"
        onClick={addToCart}
        disabled={Boolean(reason)}
        className="hidden min-h-12 w-full items-center justify-center rounded-md bg-pine px-5 font-medium text-paper transition-colors hover:bg-pine-dark active:translate-y-px disabled:opacity-50 lg:inline-flex"
      >
        {reason ? "Unavailable" : "Add to cart"}
      </button>
      {reason ? <p className="text-sm text-muted">{reason}</p> : <p className="text-sm text-muted">The final total is confirmed on the server at checkout.</p>}
      <div className="text-sm leading-6 text-muted">
        <p className="font-medium text-ink">Payment</p>
        <p>Checkout opens Paystack. You can pay by card, mobile money, or bank transfer. This site does not store the card number.</p>
      </div>
    </div>
  );

  return (
    <>
      {control}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper p-3 lg:hidden">
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <QuantityStepper value={quantity} max={quantityCap} onChange={setQuantity} />
          <Price minor={price} currency={currency} />
          <button type="button" onClick={addToCart} disabled={Boolean(reason)} className="ml-auto inline-flex min-h-11 items-center justify-center rounded-md bg-pine px-4 text-sm font-medium text-paper disabled:opacity-50">
            {reason ? "Unavailable" : "Add to cart"}
          </button>
        </div>
      </div>
    </>
  );
}
