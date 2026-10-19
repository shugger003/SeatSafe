"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { quoteCartAction } from "@/app/actions/store";
import { useCart } from "@/components/cart-provider";
import { CheckoutForm } from "@/components/checkout-form";
import { QuantityStepper } from "@/components/quantity-stepper";
import { Button, EmptyState, Notice } from "@/components/ui";
import { formatMoney } from "@/lib/money";
import type { Quote, DeliveryMethod } from "@/lib/types";
import { track } from "@/components/analytics";

export function CartView({ methods, currency }: { methods: DeliveryMethod[]; currency: string }) {
  const cart = useCart();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [methodId, setMethodId] = useState(methods.length === 1 ? methods[0].id : "");
  const [settledKey, setSettledKey] = useState("");
  const quoteKey = cart.lines.length > 0 ? JSON.stringify({ lines: cart.lines, methodId, code: cart.discountCode }) : "";
  const loading = Boolean(quoteKey) && settledKey !== quoteKey;

  useEffect(() => {
    if (!quoteKey) return;
    let cancelled = false;
    const key = quoteKey;
    quoteCartAction(cart.lines, methodId || null, cart.discountCode).then((next) => {
      if (!cancelled) {
        setQuote(next);
        setSettledKey(key);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [cart.discountCode, cart.lines, methodId, quoteKey]);

  useEffect(() => {
    if (cart.ready) track("view_cart", { items: cart.count });
  }, [cart.ready, cart.count]);

  if (cart.lines.length === 0) {
    return (
      <EmptyState
        title="Your cart is empty"
        href="/shop"
        action="Browse the shop"
      />
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">
      <div className="space-y-4">
        {loading && !quote ? <p className="text-sm text-muted">Checking the amount…</p> : null}
        {quote?.lines.map((line) => (
          <article key={`${line.productId}-${line.variantId ?? "base"}`} className="border-b border-line py-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl">{line.name}</h2>
                {line.variantName ? <p className="text-sm text-muted">{line.variantName}</p> : null}
                <p className="mt-1 text-sm text-muted">{line.quantity} × {formatMoney(line.unitPriceMinor, currency) ?? "Not set"}</p>
                {line.message ? <p className="mt-2 text-sm text-danger">{line.message}</p> : null}
              </div>
              <p className="text-lg font-medium tabular-nums">{line.lineTotalMinor == null ? "Not set" : formatMoney(line.lineTotalMinor, currency)}</p>
            </div>
            <div className="mt-4 flex items-center gap-4">
              <QuantityStepper
                value={line.quantity}
                max={20}
                onChange={(quantity) => cart.setQuantity(line.productId, line.variantId, quantity)}
              />
              <button type="button" className="min-h-11 text-sm underline underline-offset-4" onClick={() => cart.remove(line.productId, line.variantId)}>
                Remove
              </button>
            </div>
          </article>
        ))}
      </div>
      <aside className="h-fit border border-line bg-surface p-6 lg:sticky lg:top-24">
        <h2 className="font-display text-2xl">Summary</h2>
        {methods.length > 1 ? (
          <label className="mt-4 grid gap-1.5 text-sm">
            Delivery
            <select value={methodId} onChange={(event) => setMethodId(event.target.value)} className="field">
              <option value="">Choose</option>
              {methods.map((method) => (
                <option key={method.id} value={method.id}>
                  {method.label} · {formatMoney(method.feeMinor, currency)}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <label className="mt-4 grid gap-1.5 text-sm">
          Discount code
          <input
            value={cart.discountCode}
            onChange={(event) => cart.setDiscountCode(event.target.value)}
            className="field uppercase"
            autoComplete="off"
          />
        </label>
        <dl className="mt-5 space-y-2 text-sm">
          <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatMoney(quote?.subtotalMinor ?? 0, currency)}</dd></div>
          <div className="flex justify-between"><dt>Discount</dt><dd>{formatMoney(quote?.discountMinor ?? 0, currency)}</dd></div>
          <div className="flex justify-between gap-4"><dt>Delivery</dt><dd className="text-right">{quote?.deliveryFeeMinor == null ? "Not set" : formatMoney(quote.deliveryFeeMinor, currency)}</dd></div>
          <div className="flex justify-between border-t border-line pt-3 text-base font-medium"><dt>Total</dt><dd>{quote?.totalMinor == null ? "Not ready" : formatMoney(quote.totalMinor, currency)}</dd></div>
        </dl>
        {quote?.discountMessage ? <p className="mt-3 text-sm text-muted">{quote.discountMessage}</p> : null}
        {quote && !quote.purchasable ? (
          <div className="mt-4">
            <Notice tone="warn">{quote.blockers[0]}</Notice>
          </div>
        ) : null}
        <div className="mt-4">
          <Button href="#checkout" className={loading ? "pointer-events-none opacity-60" : ""}>
            Checkout
          </Button>
        </div>
        <p className="mt-3 text-sm">
          <Link href="/shop" className="underline underline-offset-4">Continue browsing</Link>
        </p>
      </aside>
      <section id="checkout" className="border-t border-line pt-10 lg:col-span-2">
        <h2 className="font-display text-4xl tracking-[-0.03em]">Checkout</h2>
        <div className="mt-8">
          <CheckoutForm methods={methods} currency={currency} />
        </div>
      </section>
    </div>
  );
}
