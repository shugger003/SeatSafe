import { notFound } from "next/navigation";
import { TestPayment } from "@/components/test-payment";
import { getOrderByToken } from "@/lib/db";
import { live } from "@/lib/live";
import { paymentsMode } from "@/lib/moolre";

export const instant = false;

export default async function TestCheckoutPage({ searchParams }: { searchParams: Promise<{ reference?: string; token?: string }> }) {
  await live();
  if (paymentsMode() !== "test") notFound();
  const { reference, token } = await searchParams;
  if (!reference || !token) return <p className="px-5 py-16">Missing reference.</p>;
  const order = await getOrderByToken(token);
  if (!order || order.paymentReference !== reference) return <p className="px-5 py-16">Missing reference.</p>;
  return <TestPayment reference={reference} token={token} />;
}
