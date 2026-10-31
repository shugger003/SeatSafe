import { redirect } from "next/navigation";
import { getOrderByToken } from "@/lib/db";
import { live } from "@/lib/live";
import { notifyPaidOrder } from "@/lib/notify";
import { applyVerification } from "@/lib/orders";
import { paymentsMode, verifyMoolreTransaction } from "@/lib/moolre";

export const instant = false;

export default async function ReturnPage({ searchParams }: { searchParams: Promise<{ reference?: string; token?: string }> }) {
  await live();
  const { reference, token } = await searchParams;
  if (!reference || !token) return <p className="px-5 py-16 text-center">The payment reference is missing.</p>;
  const order = await getOrderByToken(token);
  if (!order || order.paymentReference !== reference) return <p className="px-5 py-16 text-center">No order matches that payment reference.</p>;
  if (paymentsMode() === "live") {
    const verification = await verifyMoolreTransaction(reference);
    const result = await applyVerification(reference, verification);
    if (result.kind === "paid") await notifyPaidOrder({ reference });
  }
  redirect(`/order/${order.accessToken}`);
}
