import "server-only";
import { addOrderEvent, getOrderById, getOrderByReference, getStore } from "@/lib/db";
import { sendOrderEmails } from "@/lib/email";
import { formatMoney } from "@/lib/money";
import { claimPaymentSms, setNotificationStatus, setSmsStatus } from "@/lib/orders";
import { paymentConfirmationSms, sendMoolreSms, smsConfigured, smsNetworkForPhone } from "@/lib/sms";
import type { Order } from "@/lib/types";

export async function notifyPaidOrder(referenceOrId: { reference?: string; id?: string }) {
  const order = referenceOrId.reference
    ? await getOrderByReference(referenceOrId.reference)
    : referenceOrId.id
      ? await getOrderById(referenceOrId.id)
      : null;
  if (!order || (order.paymentStatus !== "paid" && order.paymentStatus !== "reconciled")) {
    return { sent: false as const, reason: "not_paid" as const };
  }

  const sms = await sendPaymentConfirmation(order);
  const email = await sendPaymentEmail(order);
  if (sms.reason === "failed" || email.reason === "failed") return { sent: false as const, reason: "failed" as const };
  if (sms.sent || email.sent) return { sent: true as const };
  if (email.reason === "not_configured" || sms.reason === "not_configured") {
    return { sent: false as const, reason: "not_configured" as const };
  }
  return { sent: false as const, reason: "skipped" as const };
}

async function sendPaymentEmail(order: Order) {
  if (order.notificationStatus === "sent" || order.notificationStatus === "not_configured") {
    return { sent: order.notificationStatus === "sent", reason: order.notificationStatus as "sent" | "not_configured" };
  }
  try {
    const result = await sendOrderEmails(order);
    if (result.sent) {
      await setNotificationStatus(order.id, "sent");
      return { sent: true as const, reason: "sent" as const };
    }
    await setNotificationStatus(order.id, result.reason);
    return { sent: false as const, reason: result.reason };
  } catch (error) {
    console.error("order_email_failed", error instanceof Error ? error.message : "unknown");
    await setNotificationStatus(order.id, "failed");
    return { sent: false as const, reason: "failed" as const };
  }
}

async function sendPaymentConfirmation(order: Order) {
  if (!smsConfigured()) return { sent: false as const, reason: "not_configured" as const };
  let claim = "";
  try {
    const claimed = await claimPaymentSms(order.id);
    claim = typeof claimed === "string" ? claimed.trim() : "";
  } catch (error) {
    console.error("order_sms_claim_failed", error instanceof Error ? error.message : "unknown");
    return { sent: false as const, reason: "failed" as const };
  }
  if (claim === "sending" || claim === "") return { sent: false as const, reason: "failed" as const };
  if (claim !== "claimed") return { sent: claim === "sent", reason: claim === "sent" ? ("sent" as const) : ("skipped" as const) };

  try {
    const store = await getStore();
    const total = Array.from(formatMoney(order.totalMinor, order.currency) ?? "", (char) =>
      char.codePointAt(0) === 0x00a0 || char.codePointAt(0) === 0x202f ? " " : char,
    ).join("");
    const message = paymentConfirmationSms({
      businessName: store.businessName,
      orderNumber: order.orderNumber,
      total,
      phone: store.phone,
    });
    const result = await sendMoolreSms({
      phone: order.customerPhone,
      message,
      network: smsNetworkForPhone(order.customerPhone),
      ref: `pay${order.id.replaceAll("-", "")}`.slice(0, 40),
    });
    if (!result.ok) {
      const invalidPhone = result.message === "Enter a Ghana phone number.";
      await setSmsStatus(order.id, invalidPhone ? "skipped" : "failed");
      await addOrderEvent(
        order.id,
        "sms",
        invalidPhone ? "Payment text was not sent. The phone number is not a Ghana mobile number." : `Payment text was not sent. ${result.message}`.slice(0, 500),
        "system",
      );
      return { sent: false as const, reason: invalidPhone ? ("skipped" as const) : ("failed" as const) };
    }
    await setSmsStatus(order.id, "sent");
    await addOrderEvent(order.id, "sms", `Payment confirmation sent to ${result.recipient}.`, "system");
    return { sent: true as const, reason: "sent" as const };
  } catch (error) {
    console.error("order_sms_failed", error instanceof Error ? error.message : "unknown");
    try {
      await setSmsStatus(order.id, "failed");
    } catch (statusError) {
      console.error("order_sms_status_failed", statusError instanceof Error ? statusError.message : "unknown");
    }
    return { sent: false as const, reason: "failed" as const };
  }
}
