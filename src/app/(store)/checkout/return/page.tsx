import { redirect } from "next/navigation";
import { getOrderByReference } from "@/lib/db";
import { live } from "@/lib/live";
import { notifyPaidOrder } from "@/lib/notify";
import { applyVerification } from "@/lib/orders";
import { paymentsMode, verifyPaystackTransaction } from "@/lib/paystack";

export const instant = false;

export default async function ReturnPage({ searchParams }: { searchParams: Promise<{ reference?: string }> }) {
  await live();
  const { reference } = await searchParams;
  if (!reference) return <p className="px-5 py-16 text-center">The payment reference is missing.</p>;
  if (paymentsMode() === "live") {
    const verification = await verifyPaystackTransaction(reference);
    const result = await applyVerification(reference, verification);
    if (result.kind === "paid") await notifyPaidOrder({ reference });
  }
  const order = await getOrderByReference(reference);
  if (!order) return <p className="px-5 py-16 text-center">No order matches that payment reference.</p>;
  redirect(`/order/${order.accessToken}`);
}
