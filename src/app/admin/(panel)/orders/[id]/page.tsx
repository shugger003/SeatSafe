import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr/ArrowLeft";
import { fulfillmentAction, reconcileAction } from "@/app/actions/admin";
import { SmsForm } from "@/components/admin/sms-form";
import { Card, ContactButtons, FULFILLMENT_LABELS, FulfillmentBadge, Label, Notice, PaymentBadge, SubmitButton, field, textarea } from "@/components/admin/ui";
import { getOrderById, getStore, listOrderEvents } from "@/lib/db";
import { live } from "@/lib/live";
import { formatMoney, formatWhen } from "@/lib/money";
import { smsConfigured } from "@/lib/sms";
import { FULFILLMENT_STATUSES, type FulfillmentStatus, type Order } from "@/lib/types";

export const instant = false;

const NEXT_STEP: Partial<Record<FulfillmentStatus, FulfillmentStatus>> = {
  unfulfilled: "processing",
  processing: "shipped",
  shipped: "completed",
};

export default async function OrderDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ notice?: string }> }) {
  await live();
  const { id } = await params;
  const { notice } = await searchParams;
  const order = await getOrderById(id);
  if (!order) notFound();
  const store = await getStore();
  const events = await listOrderEvents(order.id);
  const paid = order.paymentStatus === "paid" || order.paymentStatus === "reconciled";
  const smsReady = smsConfigured();
  const saved = notice === "Order updated." || notice === "Reconciliation recorded." || notice === "SMS sent.";
  const next = NEXT_STEP[order.fulfillmentStatus];
  const money = (minor: number) => formatMoney(minor, order.currency);

  return (
    <div className="grid gap-6">
      <div>
        <Link href="/admin/orders" className="inline-flex min-h-10 items-center gap-1.5 text-sm text-muted hover:text-ink">
          <ArrowLeft size={16} aria-hidden="true" />
          Orders
        </Link>
        <div className="mt-1 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl leading-tight tracking-[-0.02em] sm:text-5xl">{order.customerName}</h1>
            <p className="mt-1 text-sm text-muted">{order.orderNumber} · {formatWhen(order.createdAt, store.timezone)}</p>
          </div>
          <p className="font-display text-4xl tabular-nums">{money(order.totalMinor)}</p>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <PaymentBadge status={order.paymentStatus} />
          <FulfillmentBadge status={order.fulfillmentStatus} />
        </div>
      </div>

      {notice ? <Notice tone={saved ? "success" : "warn"}>{notice}</Notice> : null}

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="grid content-start gap-6">
          <Card title="Customer">
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <Detail label="Phone" value={order.customerPhone} />
              <Detail label="Email" value={order.customerEmail} />
              <Detail label="Delivery address" value={[order.deliveryAddress, order.deliveryCity, order.deliveryRegion].filter(Boolean).join(", ")} wide />
              {order.deliveryInstructions ? <Detail label="Delivery notes" value={order.deliveryInstructions} wide /> : null}
              {order.deliveryMethod ? <Detail label="Delivery option" value={order.deliveryMethod} /> : null}
            </dl>
            <div className="mt-5">
              <ContactButtons phone={order.customerPhone} email={order.customerEmail} message={`Hello ${order.customerName.split(" ")[0]}, this is ${store.businessName} about your order ${order.orderNumber}.`} />
            </div>
          </Card>

          <Card title="Items">
            <ul className="divide-y divide-line text-sm">
              {order.lineItems.map((line) => (
                <li key={`${line.productId}-${line.variantId}`} className="flex items-start justify-between gap-4 py-3 first:pt-0">
                  <span>
                    <span className="font-medium">{line.quantity} × {line.name}</span>
                    {line.variantName ? <span className="block text-muted">{line.variantName}</span> : null}
                  </span>
                  <span className="tabular-nums">{money(line.lineTotalMinor)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-3 grid gap-1.5 border-t border-line pt-3 text-sm">
              <Row label="Subtotal" value={money(order.subtotalMinor)} />
              <Row label="Delivery" value={money(order.deliveryFeeMinor)} />
              {order.discountMinor > 0 ? <Row label={`Discount${order.discountCode ? ` (${order.discountCode})` : ""}`} value={`−${money(order.discountMinor)}`} /> : null}
              <Row label="Total" value={money(order.totalMinor)} strong />
            </dl>
          </Card>

          <Card title="History">
            {events.length === 0 ? (
              <p className="text-sm text-muted">Nothing recorded yet.</p>
            ) : (
              <ol className="grid gap-4 border-l border-line pl-5 text-sm">
                {events.map((event) => (
                  <li key={event.id} className="relative">
                    <span className="absolute -left-[25px] top-1.5 size-2 rounded-full bg-pine" aria-hidden="true" />
                    <p className="font-medium">{eventText(event.message)}</p>
                    <p className="text-xs text-muted">{formatWhen(event.createdAt, store.timezone)}{event.actor ? ` · ${event.actor}` : ""}</p>
                  </li>
                ))}
              </ol>
            )}
            {order.internalNotes ? (
              <div className="mt-5 border-t border-line pt-4">
                <p className="text-sm font-medium">Notes</p>
                <pre className="mt-1 whitespace-pre-wrap font-sans text-sm leading-6 text-muted">{order.internalNotes}</pre>
              </div>
            ) : null}
          </Card>
        </div>

        <div className="grid content-start gap-6">
          <Card title="Delivery" description={paid ? undefined : "You can update delivery once the order is paid."}>
            {paid && next ? (
              <form action={fulfillmentAction} className="mb-5">
                <Hidden order={order} status={next} />
                <SubmitButton className="w-full">Mark as {FULFILLMENT_LABELS[next][0].toLowerCase()}</SubmitButton>
              </form>
            ) : null}
            <form action={fulfillmentAction} className="grid gap-4">
              <input type="hidden" name="orderId" value={order.id} />
              <fieldset disabled={!paid} className="grid gap-4 disabled:opacity-60">
                <Label label="Status">
                  <select name="status" defaultValue={order.fulfillmentStatus} className={field}>
                    {FULFILLMENT_STATUSES.map((status) => <option key={status} value={status}>{FULFILLMENT_LABELS[status][0]}</option>)}
                  </select>
                </Label>
                <Label label="Delivered by" hint="Rider name or delivery company">
                  <input name="carrier" defaultValue={order.trackingCarrier} className={field} />
                </Label>
                <Label label="Tracking or rider phone">
                  <input name="tracking" defaultValue={order.trackingNumber} className={field} />
                </Label>
                <Label label="Add a note" hint="Only you can see notes.">
                  <textarea name="note" className={textarea} />
                </Label>
                <label className="flex items-start gap-2.5 text-sm leading-6">
                  <input type="checkbox" name="restoreStock" className="mt-1 size-4 accent-pine" />
                  Put these items back into stock (for cancelled or returned orders, only once)
                </label>
                <SubmitButton variant="secondary">Save changes</SubmitButton>
              </fieldset>
            </form>
          </Card>

          {!paid ? (
            <Card title="Paid another way?" description="If the customer paid you directly, for example by mobile money transfer, record it here. The order will show as paid, recorded by hand.">
              <form action={reconcileAction} className="grid gap-4">
                <input type="hidden" name="orderId" value={order.id} />
                <Label label="Transaction ID" hint="Optional. The mobile money or bank reference.">
                  <input name="reference" className={field} />
                </Label>
                <Label label="What happened" hint="At least 20 characters, for your records.">
                  <textarea name="reason" required minLength={20} className={textarea} placeholder="For example: paid by mobile money on 20 October, confirmed on my phone." />
                </Label>
                <SubmitButton variant="secondary">Record payment</SubmitButton>
              </form>
            </Card>
          ) : null}

          <Card title="Text the customer" description="Sends one SMS through Moolre to this phone number.">
            <SmsForm
              phone={order.customerPhone}
              message={`Hello ${order.customerName.split(" ")[0]}, this is ${store.businessName} about order ${order.orderNumber}.`}
              orderId={order.id}
              returnTo={`/admin/orders/${order.id}`}
              ready={smsReady}
            />
          </Card>

          <Card title="Payment">
            <dl className="grid gap-3 text-sm">
              <Detail label="Reference" value={order.paymentReference} />
              {order.providerReference ? <Detail label="Transaction ID" value={order.providerReference} /> : null}
            </dl>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Hidden({ order, status }: { order: Order; status: FulfillmentStatus }) {
  return (
    <>
      <input type="hidden" name="orderId" value={order.id} />
      <input type="hidden" name="status" value={status} />
      <input type="hidden" name="carrier" value={order.trackingCarrier} />
      <input type="hidden" name="tracking" value={order.trackingNumber} />
    </>
  );
}

function eventText(message: string) {
  const match = /^Fulfillment set to (\w+)\.$/.exec(message);
  if (match && match[1] in FULFILLMENT_LABELS) return `Marked as ${FULFILLMENT_LABELS[match[1] as FulfillmentStatus][0].toLowerCase()}.`;
  return message;
}

function Detail({ label, value, wide = false }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={wide ? "sm:col-span-2" : undefined}>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mt-0.5 break-words">{value || "None"}</dd>
    </div>
  );
}

function Row({ label, value, strong = false }: { label: string; value: string | null; strong?: boolean }) {
  return (
    <div className={strong ? "flex justify-between gap-4 pt-1 font-medium" : "flex justify-between gap-4 text-muted"}>
      <dt>{label}</dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  );
}
