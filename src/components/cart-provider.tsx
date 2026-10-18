"use client";

import { createContext, useContext, useEffect, useMemo, useState, useSyncExternalStore } from "react";
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

type CartSnapshot = { lines: CartLineInput[]; discountCode: string };

const CartContext = createContext<CartContextValue | null>(null);
const KEY = "seat-cart-v1";
const EMPTY: CartSnapshot = { lines: [], discountCode: "" };

let snapshot: CartSnapshot = EMPTY;
const listeners = new Set<() => void>();

function same(a: CartLineInput, b: CartLineInput) {
  return a.productId === b.productId && a.variantId === b.variantId;
}

function readStored(): CartSnapshot {
  try {
    const stored = localStorage.getItem(KEY);
    if (!stored) return EMPTY;
    const parsed = JSON.parse(stored) as { lines?: CartLineInput[]; discountCode?: string };
    const lines = Array.isArray(parsed.lines) ? parsed.lines.filter((line) => line.productId && line.quantity > 0) : [];
    const discountCode = typeof parsed.discountCode === "string" ? parsed.discountCode : "";
    return { lines, discountCode };
  } catch {
    return EMPTY;
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return snapshot;
}

function getServerSnapshot() {
  return EMPTY;
}

function publish(next: CartSnapshot) {
  snapshot = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // A full or private browser store keeps the cart in memory only.
  }
  listeners.forEach((listener) => listener());
}

let loaded = false;

function getClientSnapshot() {
  if (!loaded && typeof window !== "undefined") {
    loaded = true;
    snapshot = readStored();
  }
  return snapshot;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const stored = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 2800);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const value = useMemo<CartContextValue>(() => {
    const lines = stored.lines;
    const discountCode = stored.discountCode;
    return {
      lines,
      ready: true,
      count: lines.reduce((sum, line) => sum + line.quantity, 0),
      notice,
      discountCode,
      setDiscountCode: (code) => publish({ lines: getSnapshot().lines, discountCode: code }),
      add: (line, name) => {
        const quantity = Math.max(1, Math.min(20, Math.floor(line.quantity || 1)));
        const current = getSnapshot().lines;
        const match = current.find((item) => same(item, line));
        const next = match
          ? current.map((item) => (same(item, line) ? { ...item, quantity: Math.min(20, item.quantity + quantity) } : item))
          : [...current, { ...line, quantity }];
        publish({ lines: next, discountCode: getSnapshot().discountCode });
        setNotice(`${name} added to cart`);
      },
      setQuantity: (productId, variantId, quantity) => {
        const next = getSnapshot()
          .lines.map((item) => (item.productId === productId && item.variantId === variantId ? { ...item, quantity } : item))
          .filter((item) => item.quantity > 0);
        publish({ lines: next, discountCode: getSnapshot().discountCode });
      },
      remove: (productId, variantId) => {
        publish({
          lines: getSnapshot().lines.filter((item) => !(item.productId === productId && item.variantId === variantId)),
          discountCode: getSnapshot().discountCode,
        });
      },
      clear: () => publish({ lines: [], discountCode: getSnapshot().discountCode }),
    };
  }, [notice, stored]);

  return (
    <CartContext.Provider value={value}>
      {children}
      <div aria-live="polite" className="sr-only">
        {notice}
      </div>
      {notice ? (
        <div role="status" className="fixed bottom-24 left-1/2 z-40 max-w-[90vw] -translate-x-1/2 bg-ink px-4 py-3 text-sm text-paper shadow-soft lg:bottom-6">
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
