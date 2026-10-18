import type { Metadata } from "next";
import { CartView } from "@/components/cart-view";
import { activeDeliveryMethods } from "@/lib/commerce";
import { getStore } from "@/lib/db";
import { live } from "@/lib/live";

export const instant = false;

export const metadata: Metadata = { title: "Cart", robots: { index: false, follow: false } };

export default async function CartPage() {
  await live();
  const store = await getStore();
  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
      <h1 className="mb-8 font-display text-5xl">Cart</h1>
      <CartView methods={activeDeliveryMethods(store)} currency={store.currency} />
    </div>
  );
}
