import Link from "next/link";
import { listOrders } from "@/lib/db";
import { live } from "@/lib/live";
import { formatMoney, formatWhen } from "@/lib/money";
import { FULFILLMENT_STATUSES, PAYMENT_STATUSES } from "@/lib/types";

export const instant = false;

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ q?: string; payment?: string; fulfillment?: string; page?: string }> }) {
  await live();
  const params = await searchParams;
  const result = await listOrders({
    q: params.q,
    payment: params.payment,
    fulfillment: params.fulfillment,
    page: Number(params.page) || 1,
  });
  return (
    <div>
      <h1 className="font-display text-4xl">Orders</h1>
      <form className="mt-4 flex flex-wrap gap-2" action="/admin/orders">
        <input name="q" defaultValue={params.q} placeholder="Search name, email, or order" className="min-h-11 rounded-[10px] border border-line px-3" />
        <select name="payment" defaultValue={params.payment || ""} className="min-h-11 rounded-[10px] border border-line px-3" aria-label="Payment status">
          <option value="">Any payment</option>
          {PAYMENT_STATUSES.map((status) => <option key={status}>{status}</option>)}
        </select>
        <select name="fulfillment" defaultValue={params.fulfillment || ""} className="min-h-11 rounded-[10px] border border-line px-3" aria-label="Fulfillment">
          <option value="">Any fulfillment</option>
          {FULFILLMENT_STATUSES.map((status) => <option key={status}>{status}</option>)}
        </select>
        <button className="min-h-11 rounded-[10px] bg-pine px-4 text-paper">Filter</button>
      </form>
      <ul className="mt-6 divide-y divide-line border-y border-line text-sm">
        {result.orders.map((order) => (
          <li key={order.id} className="grid gap-1 py-3 sm:grid-cols-4">
            <Link href={`/admin/orders/${order.id}`} className="font-medium">{order.orderNumber}</Link>
            <span>{order.customerName}</span>
            <span>{order.paymentStatus} · {order.fulfillmentStatus}</span>
            <span>{formatMoney(order.totalMinor, order.currency)} · {formatWhen(order.createdAt)}</span>
          </li>
        ))}
      </ul>
      {result.orders.length === 0 ? <p className="mt-4 text-sm text-muted">No orders match.</p> : null}
    </div>
  );
}
