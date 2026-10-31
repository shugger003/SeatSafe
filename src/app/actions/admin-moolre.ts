"use server";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { addAudit, getOrderById } from "@/lib/db";
import { paymentsMode, verifyMoolreTransaction } from "@/lib/moolre";
import { notifyPaidOrder } from "@/lib/notify";
import { applyVerification } from "@/lib/orders";

function bounce(path: string, message: string): never {
  redirect(`${path}?notice=${encodeURIComponent(message)}`);
}

export async function checkMoolrePaymentAction(formData: FormData) {
  const session = await getSession();
  if (!session) bounce("/admin/login", "Sign in required.");
  const orderId = String(formData.get("orderId") || "");
  const back = `/admin/orders/${orderId}`;
  if (paymentsMode() !== "live") bounce(back, "Moolre is not connected on this site.");
  const order = await getOrderById(orderId);
  if (!order) bounce("/admin/orders", "Order not found.");
  if (order.paymentProvider !== "moolre") bounce(back, "This order was not sent to Moolre.");
  if (order.paymentStatus !== "pending") bounce(back, "This order is no longer waiting on Moolre.");

  let verification;
  try {
    verification = await verifyMoolreTransaction(order.paymentReference);
  } catch {
    bounce(back, "Moolre could not be reached. Try again.");
  }
  const result = await applyVerification(order.paymentReference, verification);
  if (result.kind === "paid") await notifyPaidOrder({ reference: order.paymentReference });
  await addAudit(session.email, "moolre_check", "order", orderId, result.kind);

  const message =
    result.kind === "paid"
      ? "Moolre confirmed this payment. The order is paid."
      : result.kind === "pending"
        ? "Moolre has not confirmed this payment yet."
        : result.kind === "failed" || result.kind === "cancelled"
          ? "Moolre says this payment did not go through."
          : result.kind === "mismatch"
            ? "Moolre reported a different amount. The order needs a review."
            : result.kind === "already"
              ? "This order was already updated."
              : "Moolre did not return a payment for this order.";
  bounce(back, message);
}
