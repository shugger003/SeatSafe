"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart-provider";
import { formatMoney } from "@/lib/money";
import { BULK_MIN_BOTTLES, BULK_RESALE_MINOR, bulkQuantity } from "@/lib/partnerships";

const field = "min-h-11 w-full rounded-[10px] border border-line bg-paper px-3";

export function BulkPurchase({
  productId,
  name,
  priceMinor,
  currency,
  stock,
}: {
  productId: string;
  name: string;
  priceMinor: number;
  currency: string;
  stock: number;
}) {
  const cart = useCart();
  const router = useRouter();
  const [quantity, setQuantity] = useState(String(BULK_MIN_BOTTLES));
  const [message, setMessage] = useState("");
  const parsed = quantity.length > 0 && [...quantity].every((char) => char >= "0" && char <= "9") ? Number(quantity) : Number.NaN;
  const ready = bulkQuantity(parsed, stock);
  const bottles = ready.ok ? ready.quantity : null;
  const each = formatMoney(priceMinor, currency);
  const resale = formatMoney(BULK_RESALE_MINOR, currency);
  const total = bottles == null ? null : formatMoney(priceMinor * bottles, currency);

  return (
    <form
      className="grid gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        const next = bulkQuantity(parsed, stock);
        if (!next.ok) {
          setMessage(next.message);
          return;
        }
        cart.setLine({ productId, variantId: null, quantity: next.quantity });
        router.push("/checkout");
      }}
    >
      <p className="text-sm leading-6">
        Each bottle is {each}, the same price as the shop. You may resell each bottle for {resale}.
      </p>
      <label className="grid gap-1 text-sm">
        <span className="font-medium">How many bottles</span>
        <input
          name="quantity"
          type="number"
          required
          min={BULK_MIN_BOTTLES}
          max={stock}
          inputMode="numeric"
          value={quantity}
          onChange={(event) => {
            setQuantity(event.target.value);
            setMessage("");
          }}
          className={field}
        />
        <span className="text-xs text-muted">{BULK_MIN_BOTTLES} or more. {stock} in stock.</span>
      </label>
      {bottles != null && total ? (
        <p className="text-sm">
          <span className="font-medium">{bottles} × {name}</span>
          <span className="mt-1 block text-muted">Total {total}</span>
        </p>
      ) : (
        <p className="text-sm text-muted">Enter 50 or more.</p>
      )}
      <button disabled={!ready.ok} className="min-h-11 rounded-[10px] bg-pine px-4 text-paper disabled:opacity-50">
        Continue to checkout
      </button>
      {message ? (
        <p className="text-sm text-danger" role="status">
          {message}
        </p>
      ) : null}
    </form>
  );
}
