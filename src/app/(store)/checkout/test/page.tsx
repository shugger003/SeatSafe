import { notFound } from "next/navigation";
import { TestPayment } from "@/components/test-payment";
import { live } from "@/lib/live";
import { paymentsMode } from "@/lib/moolre";

export const instant = false;

export default async function TestCheckoutPage({ searchParams }: { searchParams: Promise<{ reference?: string }> }) {
  await live();
  if (paymentsMode() !== "test") notFound();
  const { reference } = await searchParams;
  if (!reference) return <p className="px-5 py-16">Missing reference.</p>;
  return <TestPayment reference={reference} />;
}
