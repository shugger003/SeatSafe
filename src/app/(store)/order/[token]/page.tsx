import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PurchaseBeacon } from "@/components/analytics";
import { ResumePayment } from "@/components/resume-payment";
import { getOrderByToken } from "@/lib/db";
import { live } from "@/lib/live";
import { formatMoney, formatWhen } from "@/lib/money";

export const instant = false;

export const metadata: Metadata = { title: "Order", robots: { index: false, follow: false } };

const paymentCopy: Record<string, string> = {
  pending: "We are waiting for your payment to go through.",
  paid: "Payment received. Thank you for your order.",
  failed: "The payment did not go through.",
  cancelled: "The payment was cancelled.",
  expired: "The payment window expired.",
  review: "We are checking your payment. We will contact you shortly.",
  reconciled: "Payment received. Thank you for your order.",
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
          {emailed ? "A confirmation email was sent." : "Keep this page for your reference."}
        </p>
      ) : null}
      {order.paymentStatus === "pending" ? <ResumePayment reference={order.paymentReference} token={order.accessToken} /> : null}
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
