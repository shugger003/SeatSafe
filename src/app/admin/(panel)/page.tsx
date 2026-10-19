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
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-clay">Today</p>
      <h1 className="mt-2 font-display text-5xl">Overview</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">Verified revenue counts only orders whose payment status is paid after provider verification. Failed, pending, and manually reconciled orders are excluded.</p>
      {checks.length > 0 ? (
        <section className="mt-6 rounded-[20px] border border-clay/30 bg-[#f8f1e6] p-5">
          <h2 className="font-display text-2xl">Before launch</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {checks.map((item) => <li key={item} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-clay" aria-hidden="true" /><span>{item}</span></li>)}
          </ul>
        </section>
      ) : null}
      <dl className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <Stat label="Verified revenue" value={formatMoney(metrics.verifiedRevenueMinor, store.currency) || "None"} emphasis />
        <Stat label="Orders" value={String(metrics.totalOrders)} />
        <Stat label="Pending payment" value={String(metrics.pendingOrders)} />
        <Stat label="Paid" value={String(metrics.paidOrders)} />
        <Stat label="Awaiting fulfillment" value={String(metrics.awaitingFulfillment)} />
        <Stat label="Completed" value={String(metrics.completedOrders)} />
      </dl>
      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <section className="rounded-[20px] border border-line bg-surface p-5 shadow-soft">
          <h2 className="font-display text-2xl">Low stock</h2>
          {metrics.lowStock.length === 0 ? <p className="mt-3 text-sm leading-6 text-muted">No published products are at or below their threshold.</p> : (
            <ul className="mt-3 space-y-2 text-sm">
              {metrics.lowStock.map((product) => <li key={product.id}><Link href={`/admin/products/${product.id}`} className="underline underline-offset-4">{product.name}</Link> · stock {product.stockQuantity}</li>)}
            </ul>
          )}
        </section>
        <section className="rounded-[20px] border border-line bg-surface p-5 shadow-soft">
          <h2 className="font-display text-2xl">Recent orders</h2>
          {metrics.recent.length === 0 ? <p className="mt-3 text-sm leading-6 text-muted">No orders yet.</p> : (
            <ul className="mt-3 divide-y divide-line text-sm">
              {metrics.recent.map((order) => (
                <li key={order.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                  <Link href={`/admin/orders/${order.id}`} className="font-medium underline underline-offset-4">{order.orderNumber}</Link>
                  <span className="text-muted">{order.paymentStatus} · {order.fulfillmentStatus}</span>
                  <span className="tabular-nums">{formatMoney(order.totalMinor, order.currency)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function Stat({ label, value, emphasis = false }: { label: string; value: string; emphasis?: boolean }) {
  return (
    <div className={emphasis ? "rounded-[20px] bg-pine p-5 text-paper shadow-soft sm:col-span-2 xl:col-span-1" : "rounded-[20px] border border-line bg-surface p-5 shadow-soft"}>
      <dt className={emphasis ? "text-sm text-paper/70" : "text-sm text-muted"}>{label}</dt>
      <dd className="mt-2 font-display text-4xl tabular-nums">{value}</dd>
    </div>
  );
}
