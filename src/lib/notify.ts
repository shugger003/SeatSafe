import "server-only";
import { getOrderById, getOrderByReference } from "@/lib/db";
import { sendOrderEmails } from "@/lib/email";
import { setNotificationStatus } from "@/lib/orders";

export async function notifyPaidOrder(referenceOrId: { reference?: string; id?: string }) {
  const order = referenceOrId.reference
    ? await getOrderByReference(referenceOrId.reference)
    : referenceOrId.id
      ? await getOrderById(referenceOrId.id)
      : null;
  if (!order || order.paymentStatus !== "paid") return { sent: false as const, reason: "not_paid" as const };
  if (order.notificationStatus === "sent" || order.notificationStatus === "not_configured") {
    return { sent: order.notificationStatus === "sent", reason: order.notificationStatus as "sent" | "not_configured" };
  }
  try {
    const result = await sendOrderEmails(order);
    if (result.sent) {
      await setNotificationStatus(order.id, "sent");
      return { sent: true as const };
    }
    await setNotificationStatus(order.id, result.reason);
    return result;
  } catch (error) {
    console.error("order_email_failed", error instanceof Error ? error.message : "unknown");
    await setNotificationStatus(order.id, "failed");
    return { sent: false as const, reason: "failed" as const };
  }
}
