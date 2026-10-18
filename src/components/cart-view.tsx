"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { quoteCartAction } from "@/app/actions/store";
import { useCart } from "@/components/cart-provider";
import { Button, Notice, Price } from "@/components/ui";
import { formatMoney } from "@/lib/money";
import type { Quote, DeliveryMethod } from "@/lib/types";
import { track } from "@/components/analytics";

export function CartView({ methods, currency }: { methods: DeliveryMethod[]; currency: string }) {
  const cart = useCart();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [methodId, setMethodId] = useState(methods.length === 1 ? methods[0].id : "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!cart.ready) return;
    let cancelled = false;
    setLoading(true);
    quoteCartAction(cart.lines, methodId || null, cart.discountCode)
      .then((next) => {
        if (!cancelled) setQuote(next);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [cart.ready, cart.lines, cart.discountCode, methodId]);

  useEffect(() => {
    if (cart.ready) track("view_cart", { items: cart.count });
  }, [cart.ready, cart.count]);

  if (!cart.ready) return <p className="text-muted">Loading cart…</p>;
  if (cart.lines.length === 0) {
    return (
      <div className="rounded-[16px] border border-dashed border-line bg-surface px-6 py-14 text-center">
        <h1 className="font-display text-4xl">Your cart is empty</h1>
        <p className="mt-3 text-muted">When you add a product, it stays in this browser until you remove it.</p>
        <div className="mt-6">
          <Button href="/shop">Browse the shop</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">
      <div className="space-y-4">
        {quote?.lines.map((line) => (
          <article key={`${line.productId}-${line.variantId ?? "base"}`} className="rounded-[16px] border border-line bg-surface p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl">{line.name}</h2>
                {line.variantName ? <p className="text-sm text-muted">{line.variantName}</p> : null}
                {line.message ? <p className="mt-2 text-sm text-danger">{line.message}</p> : null}
              </div>
              <Price minor={line.unitPriceMinor} currency={currency} />
            </div>
            <div className="mt-4 flex items-center gap-3">
              <label className="text-sm">
                Quantity
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={line.quantity}
                  onChange={(event) => cart.setQuantity(line.productId, line.variantId, Math.max(0, Number(event.target.value) || 0))}
                  className="ml-2 h-11 w-20 rounded-[10px] border border-line px-2"
                />
              </label>
              <button type="button" className="min-h-11 text-sm underline underline-offset-4" onClick={() => cart.remove(line.productId, line.variantId)}>
                Remove
              </button>
            </div>
          </article>
        ))}
      </div>
      <aside className="h-fit rounded-[16px] border border-line bg-surface p-5">
        <h2 className="font-display text-2xl">Summary</h2>
        {methods.length > 1 ? (
          <label className="mt-4 grid gap-1.5 text-sm">
            Delivery
            <select value={methodId} onChange={(event) => setMethodId(event.target.value)} className="min-h-11 rounded-[10px] border border-line px-3">
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
            className="min-h-11 rounded-[10px] border border-line px-3 uppercase"
            autoComplete="off"
          />
        </label>
        <dl className="mt-5 space-y-2 text-sm">
          <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatMoney(quote?.subtotalMinor ?? 0, currency)}</dd></div>
          <div className="flex justify-between"><dt>Discount</dt><dd>{formatMoney(quote?.discountMinor ?? 0, currency)}</dd></div>
          <div className="flex justify-between gap-4"><dt>Delivery</dt><dd className="text-right">{quote?.deliveryFeeMinor == null ? "Calculated when a method is available" : formatMoney(quote.deliveryFeeMinor, currency)}</dd></div>
          <div className="flex justify-between border-t border-line pt-2 text-base font-medium"><dt>Estimated total</dt><dd>{quote?.totalMinor == null ? "—" : formatMoney(quote.totalMinor, currency)}</dd></div>
        </dl>
        {quote?.discountMessage ? <p className="mt-3 text-sm text-muted">{quote.discountMessage}</p> : null}
        {quote && !quote.purchasable ? (
          <div className="mt-4">
            <Notice tone="warn">{quote.blockers[0]}</Notice>
          </div>
        ) : null}
        <p className="mt-3 text-xs leading-5 text-muted">This summary is checked again on the server. It is not the final charge until checkout confirms it.</p>
        <div className="mt-4">
          <Button href="/checkout" className={loading ? "pointer-events-none opacity-60" : ""}>
            Continue to checkout
          </Button>
        </div>
        <p className="mt-3 text-sm">
          <Link href="/shop" className="underline underline-offset-4">Continue browsing</Link>
        </p>
      </aside>
    </div>
  );
}
