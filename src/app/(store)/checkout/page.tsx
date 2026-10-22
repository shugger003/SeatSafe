import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout-form";
import { activeDeliveryMethods } from "@/lib/commerce";
import { catalogCached, getStore } from "@/lib/db";

export const metadata: Metadata = { title: "Checkout", robots: { index: false, follow: false } };

export default async function CheckoutPage() {
  const store = await catalogCached("store", getStore);
  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
      <h1 className="font-display text-5xl">Checkout</h1>
      <div className="mt-8">
        <CheckoutForm methods={activeDeliveryMethods(store)} currency={store.currency} />
      </div>
    </div>
  );
}
