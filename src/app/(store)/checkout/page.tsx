import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout-form";
import { activeDeliveryMethods } from "@/lib/commerce";
import { getStore } from "@/lib/db";
import { live } from "@/lib/live";

export const instant = false;

export const metadata: Metadata = { title: "Checkout", robots: { index: false, follow: false } };

export default async function CheckoutPage() {
  await live();
  const store = await getStore();
  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
      <h1 className="font-display text-5xl">Checkout</h1>
      <p className="mt-3 max-w-xl text-muted">Guest checkout. Only the details needed to deliver the order are collected.</p>
      <div className="mt-8">
        <CheckoutForm methods={activeDeliveryMethods(store)} currency={store.currency} />
      </div>
    </div>
  );
}
