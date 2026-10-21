import Link from "next/link";
import { MagnifyingGlass } from "@phosphor-icons/react/dist/ssr/MagnifyingGlass";
import { ContactButtons, EmptyRow, FulfillmentBadge, PageHeader, PaymentBadge, buttonClass, field } from "@/components/admin/ui";
import { cn } from "@/lib/cn";
import { getStore, listOrders } from "@/lib/db";
import { live } from "@/lib/live";
import { formatMoney, formatWhen } from "@/lib/money";

export const instant = false;

const VIEWS = {
  all: { label: "All", payment: undefined, fulfillment: undefined },
  "to-send": { label: "To send", payment: ["paid", "reconciled"], fulfillment: ["unfulfilled", "processing"] },
  "on-the-way": { label: "On the way", payment: undefined, fulfillment: "shipped" },
  "awaiting-payment": { label: "Awaiting payment", payment: "pending", fulfillment: undefined },
  delivered: { label: "Delivered", payment: undefined, fulfillment: "completed" },
  cancelled: { label: "Cancelled", payment: undefined, fulfillment: "cancelled" },
} as const;

type View = keyof typeof VIEWS;

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ q?: string; view?: string; page?: string }> }) {
  await live();
  const params = await searchParams;
  const view: View = params.view && params.view in VIEWS ? (params.view as View) : "all";
  const filter = VIEWS[view];
  const store = await getStore();
  const result = await listOrders({
    q: params.q,
    payment: filter.payment as string | string[] | undefined,
    fulfillment: filter.fulfillment as string | string[] | undefined,
    page: Number(params.page) || 1,
  });
  const pages = Math.max(1, Math.ceil(result.total / result.pageSize));
  const href = (next: { view?: View; page?: number }) => {
    const query = new URLSearchParams();
    const nextView = next.view ?? view;
    if (nextView !== "all") query.set("view", nextView);
    if (params.q) query.set("q", params.q);
    if (next.page && next.page > 1) query.set("page", String(next.page));
    const text = query.toString();
    return `/admin/orders${text ? `?${text}` : ""}`;
  };

  return (
    <div className="grid gap-6">
      <PageHeader title="Orders" description={`${result.total} ${result.total === 1 ? "order" : "orders"}${view === "all" ? "" : ` · ${filter.label.toLowerCase()}`}`} />

      <div className="grid gap-3">
        <nav aria-label="Order filters" className="-mx-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0">
          {(Object.keys(VIEWS) as View[]).map((key) => (
            <Link
              key={key}
              href={href({ view: key })}
              aria-current={key === view ? "page" : undefined}
              className={cn(
                "inline-flex min-h-10 shrink-0 items-center rounded-full border px-4 text-sm transition-colors",
                key === view ? "border-pine bg-pine text-paper" : "border-line bg-surface text-ink hover:border-pine",
              )}
            >
              {VIEWS[key].label}
            </Link>
          ))}
        </nav>
        <form action="/admin/orders" className="flex gap-2">
          {view !== "all" ? <input type="hidden" name="view" value={view} /> : null}
          <label className="relative min-w-0 flex-1 sm:max-w-md">
            <span className="sr-only">Search orders</span>
            <MagnifyingGlass size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
            <input name="q" defaultValue={params.q} placeholder="Name, email, or order number" className={cn(field, "pl-10")} />
          </label>
          <button className={buttonClass("primary")}>Search</button>
        </form>
      </div>

      {result.orders.length === 0 ? (
        <EmptyRow>{params.q ? `No orders match “${params.q}”.` : view === "all" ? "No orders yet. New orders will show up here." : "No orders here right now."}</EmptyRow>
      ) : (
        <ul className="grid gap-3">
          {result.orders.map((order) => (
            <li key={order.id} className="rounded-xl border border-line bg-surface p-4 transition-colors hover:border-pine/50 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <Link href={`/admin/orders/${order.id}`} className="min-w-0 hover:underline">
                  <span className="block font-medium">{order.customerName}</span>
                  <span className="block text-xs text-muted">{order.orderNumber} · {formatWhen(order.createdAt, store.timezone)}</span>
                </Link>
                <span className="font-display text-2xl tabular-nums">{formatMoney(order.totalMinor, order.currency)}</span>
              </div>
              <p className="mt-2 text-sm text-muted">
                {order.lineItems.map((line) => `${line.quantity} × ${line.name}`).join(", ")}
                {order.deliveryCity ? ` · ${order.deliveryCity}` : ""}
              </p>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <span className="flex flex-wrap gap-2">
                  <PaymentBadge status={order.paymentStatus} />
                  <FulfillmentBadge status={order.fulfillmentStatus} />
                </span>
                <span className="flex flex-wrap items-center gap-2">
                  <ContactButtons compact phone={order.customerPhone} message={`Hello ${order.customerName.split(" ")[0]}, this is ${store.businessName} about your order ${order.orderNumber}.`} />
                  <Link href={`/admin/orders/${order.id}`} className={buttonClass("primary", "min-h-9 px-3 text-xs")}>Open</Link>
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}

      {pages > 1 ? (
        <nav aria-label="Pages" className="flex items-center justify-between gap-3 text-sm">
          {result.page > 1 ? <Link href={href({ page: result.page - 1 })} className={buttonClass("secondary")}>Previous</Link> : <span />}
          <span className="text-muted">Page {result.page} of {pages}</span>
          {result.page < pages ? <Link href={href({ page: result.page + 1 })} className={buttonClass("secondary")}>Next</Link> : <span />}
        </nav>
      ) : null}
    </div>
  );
}
