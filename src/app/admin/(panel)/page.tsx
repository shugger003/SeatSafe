import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr/ArrowRight";
import { Card, EmptyRow, FulfillmentBadge, PageHeader, PaymentBadge } from "@/components/admin/ui";
import { adminConfigured } from "@/lib/auth";
import { cn } from "@/lib/cn";
import { dashboardMetrics, getPolicies, getStore } from "@/lib/db";
import { emailConfigured } from "@/lib/email";
import { live } from "@/lib/live";
import { formatMoney, formatWhen } from "@/lib/money";
import { paymentsMode } from "@/lib/moolre";

export const instant = false;

export default async function DashboardPage() {
  await live();
  const store = await getStore();
  const metrics = await dashboardMetrics();
  const policies = await getPolicies();
  const checks: Array<{ text: string; href: string } | null> = [
    store.businessName === "Brand name" ? { text: "Add the business name.", href: "/admin/settings" } : null,
    store.storeStatus !== "open" ? { text: `The store is set to “${store.storeStatus === "paused" ? "Paused" : "Coming soon"}”.`, href: "/admin/settings" } : null,
    store.deliveryMethods.some((method) => method.active) ? null : { text: "Add a delivery option so customers can choose how to get their order.", href: "/admin/settings#delivery" },
    paymentsMode() === "disabled" ? { text: "Online payment is not connected yet, so customers can’t pay on the site.", href: "/admin/settings" } : null,
    emailConfigured() ? null : { text: "Emails are not set up yet: order confirmations and password resets won’t be sent.", href: "/admin/settings" },
    Object.values(policies).every((policy) => policy.reviewed) ? null : { text: "Some policies are still drafts.", href: "/admin/content#policies" },
    adminConfigured() ? null : { text: "Admin sign-in is not fully set up.", href: "/admin/settings" },
  ];
  const todo = checks.filter((item): item is { text: string; href: string } => item !== null);
  const today = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: store.timezone || "Africa/Accra" }).format(new Date());

  return (
    <div className="grid gap-6">
      <PageHeader eyebrow={today} title="Overview" />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Stat label="To send" value={String(metrics.awaitingFulfillment)} hint="Paid, not delivered yet" href="/admin/orders?view=to-send" emphasis />
        <Stat label="Revenue" value={formatMoney(metrics.verifiedRevenueMinor, store.currency) || formatMoney(0, store.currency) || "0"} hint="From paid orders" />
        <Stat label="Awaiting payment" value={String(metrics.pendingOrders)} href="/admin/orders?view=awaiting-payment" />
        <Stat label="Delivered" value={String(metrics.completedOrders)} hint={`${metrics.totalOrders} orders in total`} href="/admin/orders?view=delivered" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Card
          title="Recent orders"
          actions={metrics.recent.length ? <Link href="/admin/orders" className="inline-flex min-h-9 items-center gap-1 text-sm font-medium text-pine hover:underline">All orders <ArrowRight size={14} aria-hidden="true" /></Link> : null}
        >
          {metrics.recent.length === 0 ? (
            <EmptyRow>No orders yet. New orders will show up here.</EmptyRow>
          ) : (
            <ul className="-mx-2 divide-y divide-line">
              {metrics.recent.map((order) => (
                <li key={order.id}>
                  <Link href={`/admin/orders/${order.id}`} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-md px-2 py-3 hover:bg-paper">
                    <span className="min-w-0">
                      <span className="block font-medium">{order.customerName}</span>
                      <span className="block text-xs text-muted">{order.orderNumber} · {formatWhen(order.createdAt)}</span>
                    </span>
                    <span className="flex flex-wrap items-center gap-2">
                      <PaymentBadge status={order.paymentStatus} />
                      <FulfillmentBadge status={order.fulfillmentStatus} />
                      <span className="w-24 text-right font-medium tabular-nums">{formatMoney(order.totalMinor, order.currency)}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <div className="grid content-start gap-6">
          <Card title="Stock">
            {metrics.products.length === 0 ? (
              <EmptyRow>No products yet.</EmptyRow>
            ) : (
              <ul className="grid gap-3">
                {metrics.products.map((product) => {
                  const low = metrics.lowStock.some((item) => item.id === product.id);
                  return (
                    <li key={product.id}>
                      <Link href={`/admin/products/${product.id}`} className="flex items-center justify-between gap-3 rounded-md hover:underline">
                        <span className="min-w-0 truncate text-sm">{product.name}</span>
                        <span className={cn("shrink-0 font-display text-2xl tabular-nums", low ? "text-danger" : "text-ink")}>{product.stockQuantity}</span>
                      </Link>
                      {low ? <p className="text-xs text-danger">Running low. Restock soon.</p> : null}
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>

          {todo.length > 0 ? (
            <Card title="Still to do" className="border-amber-200 bg-amber-50/60">
              <ul className="grid gap-1">
                {todo.map((item) => (
                  <li key={item.text}>
                    <Link href={item.href} className="group flex items-start gap-2.5 rounded-md py-1.5 text-sm leading-6 hover:text-pine">
                      <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-amber-600" aria-hidden="true" />
                      <span className="group-hover:underline">{item.text}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, hint, href, emphasis = false }: { label: string; value: string; hint?: string; href?: string; emphasis?: boolean }) {
  const body = (
    <>
      <p className={cn("text-sm", emphasis ? "text-paper/75" : "text-muted")}>{label}</p>
      <p className="mt-1 font-display text-3xl tabular-nums sm:text-4xl">{value}</p>
      {hint ? <p className={cn("mt-1 text-xs", emphasis ? "text-paper/65" : "text-muted")}>{hint}</p> : null}
    </>
  );
  const classes = cn("block h-full rounded-xl p-4 sm:p-5", emphasis ? "bg-pine text-paper" : "border border-line bg-surface", href && (emphasis ? "hover:bg-pine-dark" : "hover:border-pine"));
  return href ? <Link href={href} className={classes}>{body}</Link> : <div className={classes}>{body}</div>;
}
