"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { CartLineInput } from "@/lib/types";

type CartContextValue = {
  lines: CartLineInput[];
  ready: boolean;
  count: number;
  notice: string;
  add: (line: CartLineInput, name: string) => void;
  setQuantity: (productId: string, variantId: string | null, quantity: number) => void;
  remove: (productId: string, variantId: string | null) => void;
  clear: () => void;
  discountCode: string;
  setDiscountCode: (code: string) => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const KEY = "seat-cart-v1";

function same(a: CartLineInput, b: CartLineInput) {
  return a.productId === b.productId && a.variantId === b.variantId;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLineInput[]>([]);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState("");
  const [discountCode, setDiscountCode] = useState("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as { lines?: CartLineInput[]; discountCode?: string };
        if (Array.isArray(parsed.lines)) setLines(parsed.lines.filter((line) => line.productId && line.quantity > 0));
        if (typeof parsed.discountCode === "string") setDiscountCode(parsed.discountCode);
      }
    } catch {
      /* ignore damaged local cart */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(KEY, JSON.stringify({ lines, discountCode }));
  }, [lines, discountCode, ready]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 2800);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      ready,
      count: lines.reduce((sum, line) => sum + line.quantity, 0),
      notice,
      discountCode,
      setDiscountCode,
      add: (line, name) => {
        const quantity = Math.max(1, Math.min(20, Math.floor(line.quantity || 1)));
        setLines((current) => {
          const match = current.find((item) => same(item, line));
          if (!match) return [...current, { ...line, quantity }];
          return current.map((item) => (same(item, line) ? { ...item, quantity: Math.min(20, item.quantity + quantity) } : item));
        });
        setNotice(`${name} added to cart`);
      },
      setQuantity: (productId, variantId, quantity) => {
        setLines((current) =>
          current
            .map((item) => (item.productId === productId && item.variantId === variantId ? { ...item, quantity } : item))
            .filter((item) => item.quantity > 0),
        );
      },
      remove: (productId, variantId) => {
        setLines((current) => current.filter((item) => !(item.productId === productId && item.variantId === variantId)));
      },
      clear: () => setLines([]),
    }),
    [lines, ready, notice, discountCode],
  );

  return (
    <CartContext.Provider value={value}>
      {children}
      <div aria-live="polite" className="sr-only">
        {notice}
      </div>
      {notice ? (
        <div role="status" className="fixed bottom-4 left-1/2 z-40 max-w-[90vw] -translate-x-1/2 rounded-[10px] bg-ink px-4 py-3 text-sm text-paper shadow-soft">
          {notice}
        </div>
      ) : null}
    </CartContext.Provider>
  );
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error("Cart is unavailable");
  return value;
}
