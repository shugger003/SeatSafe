import Link from "next/link";
import { adminConfigured } from "@/lib/auth";
import { dashboardMetrics, getPolicies, getStore } from "@/lib/db";
import { emailConfigured } from "@/lib/email";
import { live } from "@/lib/live";
import { formatMoney } from "@/lib/money";
import { paymentsMode } from "@/lib/paystack";

export const instant = false;

export default async function DashboardPage() {
  await live();
  const store = await getStore();
  const metrics = await dashboardMetrics();
  const policies = await getPolicies();
  const checks = [
    store.businessName !== "Brand name" ? null : "Replace the placeholder business name.",
    store.deliveryMethods.some((method) => method.active) ? null : "Add a delivery method before opening checkout.",
    paymentsMode() === "disabled" ? "Payment is not configured." : null,
    emailConfigured() ? null : "Email delivery is not configured.",
    Object.values(policies).every((policy) => policy.reviewed) ? null : "Policies are still marked as drafts.",
    adminConfigured() ? null : "Administrator sign-in is not fully configured.",
  ].filter(Boolean);

  return (
    <div>
      <h1 className="font-display text-4xl">Overview</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">Verified revenue counts only orders whose payment status is paid after provider verification. Failed, pending, and manually reconciled orders are excluded.</p>
      {checks.length > 0 ? (
        <ul className="mt-4 list-disc space-y-1 rounded-[16px] border border-line bg-[#f8f1e6] px-8 py-4 text-sm">
          {checks.map((item) => <li key={item}>{item}</li>)}
        </ul>
      ) : null}
      <dl className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Orders" value={String(metrics.totalOrders)} />
        <Stat label="Pending payment" value={String(metrics.pendingOrders)} />
        <Stat label="Paid" value={String(metrics.paidOrders)} />
        <Stat label="Awaiting fulfillment" value={String(metrics.awaitingFulfillment)} />
        <Stat label="Completed" value={String(metrics.completedOrders)} />
        <Stat label="Verified revenue" value={formatMoney(metrics.verifiedRevenueMinor, store.currency) || "—"} />
      </dl>
      <section className="mt-8">
        <h2 className="font-display text-2xl">Low stock</h2>
        {metrics.lowStock.length === 0 ? <p className="mt-2 text-sm text-muted">No published products are at or below their threshold.</p> : (
          <ul className="mt-3 space-y-2 text-sm">
            {metrics.lowStock.map((product) => <li key={product.id}><Link href={`/admin/products/${product.id}`}>{product.name}</Link> · stock {product.stockQuantity}</li>)}
          </ul>
        )}
      </section>
      <section className="mt-8">
        <h2 className="font-display text-2xl">Recent orders</h2>
        <ul className="mt-3 divide-y divide-line border-y border-line text-sm">
          {metrics.recent.map((order) => (
            <li key={order.id} className="flex flex-wrap justify-between gap-2 py-3">
              <Link href={`/admin/orders/${order.id}`}>{order.orderNumber}</Link>
              <span>{order.paymentStatus} · {order.fulfillmentStatus}</span>
              <span>{formatMoney(order.totalMinor, order.currency)}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[16px] border border-line bg-surface p-4">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="mt-1 font-display text-3xl">{value}</dd>
    </div>
  );
}
