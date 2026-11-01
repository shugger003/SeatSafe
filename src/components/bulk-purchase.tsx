"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart-provider";
import { saveBulkDetails } from "@/lib/bulk-details";
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
        const form = new FormData(event.currentTarget);
        const next = bulkQuantity(parsed, stock);
        if (!next.ok) {
          setMessage(next.message);
          return;
        }
        const place = String(form.get("place") || "").trim();
        if (place.length < 2) {
          setMessage("Tell us where to deliver.");
          return;
        }
        saveBulkDetails({
          name: String(form.get("name") || "").trim(),
          email: String(form.get("email") || "").trim(),
          phone: String(form.get("phone") || "").trim(),
          organisation: String(form.get("organisation") || "").trim(),
          place,
          note: String(form.get("note") || "").trim(),
        });
        cart.setLine({ productId, variantId: null, quantity: next.quantity });
        router.push("/checkout");
      }}
    >
      <p className="text-sm leading-6">
        Each bottle is {each}, the same price as the shop. You may resell each bottle for {resale}.
      </p>
      <Field label="Name">
        <input name="name" required autoComplete="name" className={field} />
      </Field>
      <Field label="Email">
        <input name="email" type="email" required autoComplete="email" className={field} />
      </Field>
      <Field label="Phone">
        <input name="phone" type="tel" required autoComplete="tel" inputMode="tel" className={field} />
      </Field>
      <Field label="Organisation" hint="Optional. A hotel, office, school, clinic, or shop.">
        <input name="organisation" autoComplete="organization" className={field} />
      </Field>
      <Field label="How many bottles" hint={`${BULK_MIN_BOTTLES} or more. ${stock} in stock.`}>
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
      </Field>
      <Field label="Where should we deliver">
        <input name="place" required autoComplete="street-address" className={field} />
      </Field>
      <Field label="Anything else" hint="Optional.">
        <textarea name="note" maxLength={300} className={`${field} min-h-28 py-2`} />
      </Field>
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

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="font-medium">{label}</span>
      {children}
      {hint ? <span className="text-xs text-muted">{hint}</span> : null}
    </label>
  );
}
