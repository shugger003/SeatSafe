import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PurchaseBeacon } from "@/components/analytics";
import { ResumePayment } from "@/components/resume-payment";
import { getOrderByToken } from "@/lib/db";
import { live } from "@/lib/live";
import { formatMoney, formatWhen } from "@/lib/money";
import { emailConfigured } from "@/lib/email";

export const instant = false;

export const metadata: Metadata = { title: "Order", robots: { index: false, follow: false } };

const paymentCopy: Record<string, string> = {
  pending: "Payment has not been verified yet.",
  paid: "Payment was verified.",
  failed: "The payment failed. Stock from this attempt has been released.",
  cancelled: "The payment was cancelled. Stock from this attempt has been released.",
  expired: "The payment window expired. Stock was released.",
  review: "The provider response did not match the order total. It needs a manual review and is not marked paid.",
  reconciled: "This order was reconciled in the dashboard. It is not counted as gateway-verified revenue.",
};

export default async function OrderPage({ params }: { params: Promise<{ token: string }> }) {
  await live();
  const { token } = await params;
  const order = await getOrderByToken(token);
  if (!order) notFound();
  const emailed = order.notificationStatus === "sent";
  return (
    <div className="mx-auto max-w-3xl px-5 py-10 sm:px-8">
      <PurchaseBeacon orderNumber={order.orderNumber} totalMinor={order.totalMinor} currency={order.currency} paid={order.paymentStatus === "paid"} />
      <p className="text-xs uppercase tracking-[0.16em] text-clay">{order.orderNumber}</p>
      <h1 className="mt-2 font-display text-5xl">Order update</h1>
      <p className="mt-4 text-lg">{paymentCopy[order.paymentStatus] || order.paymentStatus}</p>
      <p className="mt-2 text-sm text-muted">Fulfillment: {order.fulfillmentStatus.replaceAll("_", " ")}</p>
      {order.paymentStatus === "paid" ? (
        <p className="mt-3 text-sm text-muted">
          {emailed
            ? "A confirmation email was sent."
            : emailConfigured()
              ? "The confirmation email could not be sent yet. Keep this page for your reference."
              : "Email delivery is not configured, so no confirmation email was sent. Keep this page for your reference."}
        </p>
      ) : null}
      {order.paymentStatus === "pending" ? <ResumePayment reference={order.paymentReference} /> : null}
      <dl className="mt-8 divide-y divide-line border-y border-line text-sm">
        <Row label="Placed" value={formatWhen(order.createdAt)} />
        <Row label="Payment reference" value={order.paymentReference} />
        <Row label="Subtotal" value={formatMoney(order.subtotalMinor, order.currency) || ""} />
        <Row label="Delivery" value={`${order.deliveryMethod} · ${formatMoney(order.deliveryFeeMinor, order.currency)}`} />
        <Row label="Discount" value={formatMoney(order.discountMinor, order.currency) || ""} />
        <Row label="Total" value={formatMoney(order.totalMinor, order.currency) || ""} />
        <Row label="Deliver to" value={`${order.customerName}, ${order.deliveryAddress}, ${order.deliveryCity}, ${order.deliveryRegion}`} />
        {order.trackingNumber ? <Row label="Tracking" value={`${order.trackingCarrier} ${order.trackingNumber}`.trim()} /> : null}
      </dl>
      <ul className="mt-6 space-y-2 text-sm">
        {order.lineItems.map((line) => (
          <li key={`${line.productId}-${line.variantId}`}>
            {line.quantity} × {line.name}
            {line.variantName ? ` (${line.variantName})` : ""} · {formatMoney(line.lineTotalMinor, order.currency)}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 py-3 sm:grid-cols-[180px_1fr]">
      <dt className="font-medium">{label}</dt>
      <dd className="text-muted">{value}</dd>
    </div>
  );
}
