import "server-only";
import type { Order } from "@/lib/types";
import { formatMoney } from "@/lib/money";
import { siteUrl } from "@/lib/safe";
import { getStore } from "@/lib/db";

export function emailConfigured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

export async function sendOrderEmails(order: Order) {
  if (!emailConfigured()) return { sent: false as const, reason: "not_configured" as const };
  const store = await getStore();
  const total = formatMoney(order.totalMinor, order.currency) ?? "";
  const link = `${siteUrl()}/order/${order.accessToken}`;
  const lines = order.lineItems
    .map((line) => `${line.quantity} × ${line.name}${line.variantName ? ` (${line.variantName})` : ""}`)
    .join("\n");
  const customer = await sendEmail({
    to: order.customerEmail,
    subject: `Order ${order.orderNumber}`,
    text: `Thank you. Payment for ${order.orderNumber} was verified.\n\n${lines}\n\nTotal: ${total}\nFulfillment: ${order.fulfillmentStatus}\n\nOrder details: ${link}\n\n${store.businessName}`,
  });
  if (!customer.ok) return { sent: false as const, reason: "failed" as const };
  const adminTo = process.env.ADMIN_NOTIFY_EMAIL || store.email;
  if (adminTo) {
    await sendEmail({
      to: adminTo,
      subject: `New paid order ${order.orderNumber}`,
      text: `${order.customerName} placed ${order.orderNumber}.\nTotal: ${total}\nReference: ${order.paymentReference}\n\nOpen the dashboard to fulfill it.`,
    });
  }
  return { sent: true as const };
}

export async function sendInquiryEmail(input: { name: string; email: string; message: string }) {
  const store = await getStore();
  const to = process.env.ADMIN_NOTIFY_EMAIL || store.email;
  if (!emailConfigured() || !to) return { sent: false as const };
  const result = await sendEmail({
    to,
    subject: `New message from ${input.name}`,
    text: `${input.name} <${input.email}>\n\n${input.message}`,
  });
  return { sent: result.ok };
}

export async function sendPasswordResetEmail(to: string, token: string) {
  if (!emailConfigured()) return { sent: false as const };
  const store = await getStore();
  const link = `${siteUrl()}/admin/reset?token=${encodeURIComponent(token)}`;
  const result = await sendEmail({
    to,
    subject: `Reset your ${store.businessName} admin password`,
    text: `Someone asked to reset the admin password for ${store.businessName}.\n\nTo choose a new password, open this link within 30 minutes:\n${link}\n\nIf you did not ask for this, ignore this email. Your password stays the same.`,
  });
  return { sent: result.ok };
}

async function sendEmail(input: { to: string; subject: string; text: string }) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM,
      to: [input.to],
      subject: input.subject,
      text: input.text,
    }),
  });
  if (!response.ok) return { ok: false as const };
  return { ok: true as const };
}
