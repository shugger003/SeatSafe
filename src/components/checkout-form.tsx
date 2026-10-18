"use client";

import { useEffect, useState } from "react";
import { placeOrderAction, quoteCartAction } from "@/app/actions/store";
import { track } from "@/components/analytics";
import { useCart } from "@/components/cart-provider";
import { EmptyState, Notice } from "@/components/ui";
import { formatMoney } from "@/lib/money";
import type { DeliveryMethod, Quote } from "@/lib/types";

const REGIONS = ["Ahafo", "Ashanti", "Bono", "Bono East", "Central", "Eastern", "Greater Accra", "North East", "Northern", "Oti", "Savannah", "Upper East", "Upper West", "Volta", "Western", "Western North"];

export function CheckoutForm({ methods, currency }: { methods: DeliveryMethod[]; currency: string }) {
  const cart = useCart();
  const [methodId, setMethodId] = useState(methods[0]?.id ?? "");
  const [quote, setQuote] = useState<Quote | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!cart.ready || cart.lines.length === 0) return;
    quoteCartAction(cart.lines, methodId || null, cart.discountCode).then(setQuote);
  }, [cart.ready, cart.lines, cart.discountCode, methodId]);

  useEffect(() => {
    track("begin_checkout", { currency });
  }, [currency]);

  async function onSubmit(formData: FormData) {
    setPending(true);
    setErrors([]);
    const result = await placeOrderAction({
      name: String(formData.get("name") || ""),
      email: String(formData.get("email") || ""),
      phone: String(formData.get("phone") || ""),
      address: String(formData.get("address") || ""),
      city: String(formData.get("city") || ""),
      region: String(formData.get("region") || ""),
      instructions: String(formData.get("instructions") || ""),
      methodId: methodId || null,
      discountCode: cart.discountCode,
      lines: cart.lines,
    });
    if (!result.ok) {
      setErrors(result.errors);
      setPending(false);
      return;
    }
    track("payment_initiated", { currency });
    cart.clear();
    window.location.href = result.url || `/order/${result.token}`;
  }

  if (cart.lines.length === 0) {
    return (
      <EmptyState
        title="Your cart is empty"
        body="Add a published product before checkout. The total is confirmed on the server, not in this browser."
        href="/shop"
        action="Browse the shop"
      />
    );
  }

  return (
    <form action={onSubmit} className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="grid gap-4">
        {errors.map((error) => (
          <Notice key={error} tone="warn">{error}</Notice>
        ))}
        <div className="grid gap-4 sm:grid-cols-2">
          <Text label="Full name" name="name" autoComplete="name" required />
          <Text label="Email" name="email" type="email" autoComplete="email" required />
          <Text label="Phone" name="phone" type="tel" autoComplete="tel" required />
          <Text label="City or locality" name="city" autoComplete="address-level2" required />
        </div>
        <Text label="Delivery address" name="address" autoComplete="street-address" required />
        <label className="grid gap-1.5 text-sm">
          <span className="font-medium">Region</span>
          <input name="region" list="regions" required autoComplete="address-level1" className="field" />
          <datalist id="regions">
            {REGIONS.map((region) => (
              <option key={region} value={region} />
            ))}
          </datalist>
        </label>
        <label className="grid gap-1.5 text-sm">
          <span className="font-medium">Delivery instructions</span>
          <textarea name="instructions" maxLength={300} className="field min-h-24" />
        </label>
        {methods.length > 0 ? (
          <fieldset className="grid gap-2">
            <legend className="text-sm font-medium">Delivery method</legend>
            {methods.map((method) => (
              <label key={method.id} className={`flex min-h-11 cursor-pointer items-start gap-3 border px-3 py-3 ${
                methodId === method.id ? "border-ink bg-mist" : "border-line bg-surface"
              }`}>
                <input type="radio" name="method" checked={methodId === method.id} onChange={() => setMethodId(method.id)} className="mt-1" />
                <span>
                  <span className="block font-medium">{method.label} · {formatMoney(method.feeMinor, currency)}</span>
                  {method.summary ? <span className="block text-sm text-muted">{method.summary}</span> : null}
                </span>
              </label>
            ))}
          </fieldset>
        ) : (
          <Notice tone="warn">Delivery pricing has not been published, so payment cannot start.</Notice>
        )}
      </div>
      <aside className="h-fit border border-line bg-surface p-5 lg:sticky lg:top-24">
        <h2 className="font-display text-2xl">Order</h2>
        <ul className="mt-4 space-y-3 text-sm">
          {quote?.lines.map((line) => (
            <li key={`${line.productId}-${line.variantId}`} className="flex justify-between gap-3">
              <span>{line.quantity} × {line.name}{line.variantName ? ` (${line.variantName})` : ""}</span>
              <span>{line.lineTotalMinor == null ? "Not set" : formatMoney(line.lineTotalMinor, currency)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
          <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatMoney(quote?.subtotalMinor ?? 0, currency)}</dd></div>
          <div className="flex justify-between"><dt>Delivery</dt><dd>{quote?.deliveryFeeMinor == null ? "Not set" : formatMoney(quote.deliveryFeeMinor, currency)}</dd></div>
          <div className="flex justify-between"><dt>Discount</dt><dd>{formatMoney(quote?.discountMinor ?? 0, currency)}</dd></div>
          <div className="flex justify-between text-base font-medium"><dt>Total to pay</dt><dd>{quote?.purchasable && quote.totalMinor != null ? formatMoney(quote.totalMinor, currency) : "Not ready"}</dd></div>
        </dl>
        <button type="submit" disabled={pending || !quote?.purchasable} className="mt-5 inline-flex min-h-12 w-full items-center justify-center bg-ink px-4 font-medium text-paper transition-colors hover:bg-pine disabled:opacity-50">
          {pending ? "Starting payment\u2026" : "Continue to payment"}
        </button>
        <p className="mt-3 text-xs leading-5 text-muted">You can check out as a guest. The button starts payment only after the server accepts the products, prices, and delivery fee.</p>
      </aside>
    </form>
  );
}

function Text({ label, name, type = "text", autoComplete, required }: { label: string; name: string; type?: string; autoComplete?: string; required?: boolean }) {
  return (
    <label className="grid gap-1.5 text-sm">
      <span className="font-medium">{label}</span>
      <input name={name} type={type} required={required} autoComplete={autoComplete} className="field" />
    </label>
  );
}
