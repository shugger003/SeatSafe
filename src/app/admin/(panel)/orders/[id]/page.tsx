import { notFound } from "next/navigation";
import { fulfillmentAction, reconcileAction } from "@/app/actions/admin";
import { getOrderById, listOrderEvents } from "@/lib/db";
import { live } from "@/lib/live";
import { formatMoney, formatWhen } from "@/lib/money";
import { FULFILLMENT_STATUSES } from "@/lib/types";

export const instant = false;

export default async function OrderDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ notice?: string }> }) {
  await live();
  const { id } = await params;
  const { notice } = await searchParams;
  const order = await getOrderById(id);
  if (!order) notFound();
  const events = await listOrderEvents(order.id);
  return (
    <div className="grid gap-8">
      <div>
        {notice ? <p className="mb-4 rounded-[10px] bg-[#f8f1e6] px-3 py-2 text-sm">{notice}</p> : null}
        <h1 className="font-display text-4xl">{order.orderNumber}</h1>
        <p className="mt-2 text-sm text-muted">{order.paymentStatus} · {order.fulfillmentStatus} · {formatMoney(order.totalMinor, order.currency)}</p>
      </div>
      <section className="grid gap-2 text-sm">
        <h2 className="font-display text-2xl">Customer</h2>
        <p>{order.customerName}</p>
        <p>{order.customerEmail}</p>
        <p>{order.customerPhone}</p>
        <p>{order.deliveryAddress}, {order.deliveryCity}, {order.deliveryRegion}</p>
        {order.deliveryInstructions ? <p>Instructions: {order.deliveryInstructions}</p> : null}
        <p>Payment reference: {order.paymentReference}</p>
        {order.providerReference ? <p>Provider reference: {order.providerReference}</p> : null}
      </section>
      <ul className="text-sm">
        {order.lineItems.map((line) => (
          <li key={`${line.productId}-${line.variantId}`}>{line.quantity} × {line.name} {line.variantName} · {formatMoney(line.lineTotalMinor, order.currency)} · SKU {line.sku || "—"}</li>
        ))}
      </ul>
      <form action={fulfillmentAction} className="grid gap-3 rounded-[16px] border border-line p-4">
        <h2 className="font-display text-2xl">Fulfillment</h2>
        <input type="hidden" name="orderId" value={order.id} />
        <select name="status" defaultValue={order.fulfillmentStatus} className="min-h-11 rounded-[10px] border border-line px-3">
          {FULFILLMENT_STATUSES.map((status) => <option key={status}>{status}</option>)}
        </select>
        <input name="carrier" defaultValue={order.trackingCarrier} placeholder="Carrier" className="min-h-11 rounded-[10px] border border-line px-3" />
        <input name="tracking" defaultValue={order.trackingNumber} placeholder="Tracking number" className="min-h-11 rounded-[10px] border border-line px-3" />
        <textarea name="note" placeholder="Internal note" className="min-h-20 rounded-[10px] border border-line px-3 py-2" />
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="restoreStock" /> Return items to inventory once</label>
        <button className="min-h-11 w-fit rounded-[10px] bg-pine px-4 text-paper">Save fulfillment</button>
      </form>
      {order.paymentStatus !== "paid" ? (
        <form action={reconcileAction} className="grid gap-3 rounded-[16px] border border-line p-4">
          <h2 className="font-display text-2xl">Reconcile</h2>
          <p className="text-sm text-muted">This does not mark the order as gateway-verified paid and does not add it to verified revenue.</p>
          <input type="hidden" name="orderId" value={order.id} />
          <input name="reference" placeholder="External reference" className="min-h-11 rounded-[10px] border border-line px-3" />
          <textarea name="reason" required minLength={20} placeholder="Why this is being reconciled" className="min-h-24 rounded-[10px] border border-line px-3 py-2" />
          <button className="min-h-11 w-fit rounded-[10px] border border-line px-4">Record reconciliation</button>
        </form>
      ) : null}
      <section>
        <h2 className="font-display text-2xl">History</h2>
        <ol className="mt-3 space-y-3 text-sm">
          {events.map((event) => (
            <li key={event.id}>
              <p className="font-medium">{event.type} · {formatWhen(event.createdAt)}</p>
              <p className="text-muted">{event.message}</p>
              <p className="text-xs text-muted">{event.actor}</p>
            </li>
          ))}
        </ol>
        {order.internalNotes ? <pre className="mt-4 whitespace-pre-wrap text-sm">{order.internalNotes}</pre> : null}
      </section>
    </div>
  );
}
