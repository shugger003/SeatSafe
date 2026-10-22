import "server-only";
import { buildQuote, normalizeCode } from "@/lib/commerce";
import { getDiscountByCode, getOrderById, getOrderByReference, getProductById, getStore, refreshCatalog } from "@/lib/db";
import { paymentsReady } from "@/lib/moolre";
import { newId } from "@/lib/safe";
import { rpc, supabaseAdmin } from "@/lib/supabase";
import type { CartLineInput, Order, OrderLine, PaymentStatus } from "@/lib/types";

type VerificationShape = {
  status: "success" | "failed" | "abandoned" | "pending";
  amount: number | null;
  currency: string | null;
  providerReference: string;
  rawStatus: string;
};

async function releaseExpiredReservations() {
  await rpc<null>("release_expired_reservations", {});
}

export async function createPendingOrder(input: {
  lines: CartLineInput[];
  customer: { name: string; email: string; phone: string };
  delivery: { address: string; city: string; region: string; instructions: string; methodId: string | null };
  discountCode: string;
}) {
  await releaseExpiredReservations();
  const store = await getStore();
  const products = (await Promise.all(input.lines.map((line) => getProductById(line.productId)))).filter((product) => product != null);
  const code = normalizeCode(input.discountCode);
  const discount = code ? await getDiscountByCode(code) : null;
  const quote = buildQuote({
    lines: input.lines,
    products,
    store,
    discount,
    methodId: input.delivery.methodId,
    paymentsReady: paymentsReady(),
  });
  if (!quote.purchasable || quote.totalMinor == null || quote.deliveryFeeMinor == null) {
    return { ok: false as const, errors: quote.blockers.length ? quote.blockers : ["This order cannot be placed."] };
  }
  const freshProducts = (await Promise.all(input.lines.map((line) => getProductById(line.productId)))).filter((product) => product != null);
  const freshDiscount = code ? await getDiscountByCode(code) : null;
  const rechecked = buildQuote({
    lines: input.lines,
    products: freshProducts,
    store: await getStore(),
    discount: freshDiscount,
    methodId: input.delivery.methodId,
    paymentsReady: paymentsReady(),
  });
  if (!rechecked.purchasable || rechecked.totalMinor == null || rechecked.deliveryFeeMinor == null) {
    return { ok: false as const, errors: rechecked.blockers };
  }
  const lineItems: OrderLine[] = rechecked.lines.map((line) => ({
    productId: line.productId,
    variantId: line.variantId,
    name: line.name,
    variantName: line.variantName,
    sku: line.sku,
    quantity: line.quantity,
    unitPriceMinor: line.unitPriceMinor ?? 0,
    lineTotalMinor: line.lineTotalMinor ?? 0,
  }));
  const now = new Date().toISOString();
  const id = newId();
  const orderNumber = `ORD-${now.slice(0, 10).replace(/-/g, "")}-${id.slice(0, 4).toUpperCase()}`;
  const accessToken = newId().replace(/-/g, "") + newId().replace(/-/g, "");
  const paymentReference = `ord_${id.replace(/-/g, "")}`;
  await rpc<string>("commit_pending_order", {
    p_order: {
      id,
      order_number: orderNumber,
      access_token: accessToken,
      customer_name: input.customer.name,
      customer_email: input.customer.email,
      customer_phone: input.customer.phone,
      delivery_address: input.delivery.address,
      delivery_city: input.delivery.city,
      delivery_region: input.delivery.region,
      delivery_instructions: input.delivery.instructions,
      delivery_method: rechecked.deliveryLabel ?? "",
      line_items: lineItems,
      subtotal_minor: rechecked.subtotalMinor,
      delivery_fee_minor: rechecked.deliveryFeeMinor,
      discount_minor: rechecked.discountMinor,
      discount_code: freshDiscount && rechecked.discountMinor > 0 ? freshDiscount.code : "",
      discount_id: freshDiscount && rechecked.discountMinor > 0 ? freshDiscount.id : "",
      total_minor: rechecked.totalMinor,
      currency: rechecked.currency,
      payment_provider: paymentsReady() && process.env.MOOLRE_ACCOUNT_NUMBER ? "moolre" : "test",
      payment_reference: paymentReference,
    },
  });
  const order = await getOrderById(id);
  if (!order) throw new Error("ORDER");
  refreshCatalog();
  return { ok: true as const, order };
}

export async function applyVerification(reference: string, verification: VerificationShape) {
  const result = await rpc<{ kind: string }>("apply_payment_result", {
    p_reference: reference,
    p_status: verification.status,
    p_amount: verification.amount,
    p_currency: verification.currency,
    p_provider_reference: verification.providerReference,
    p_raw_status: verification.rawStatus,
  });
  if (result.kind === "missing") return { kind: "missing" as const };
  const order = await getOrderByReference(reference);
  if (!order) return { kind: "missing" as const };
  if (result.kind === "paid" || verification.status === "failed" || verification.status === "abandoned") {
    refreshCatalog();
  }
  return { kind: result.kind as "already" | "pending" | "mismatch" | "paid" | PaymentStatus, order };
}

export async function setNotificationStatus(orderId: string, status: string) {
  const result = await supabaseAdmin().from("orders").update({ notification_status: status, updated_at: new Date().toISOString() }).eq("id", orderId);
  if (result.error) throw new Error("Database request failed.");
}

export async function updateFulfillment(input: {
  orderId: string;
  status: Order["fulfillmentStatus"];
  trackingCarrier: string;
  trackingNumber: string;
  note: string;
  restoreStock: boolean;
  actor: string;
}) {
  const result = await rpc<{ ok: boolean; error?: string }>("update_fulfillment", {
    p_order_id: input.orderId,
    p_status: input.status,
    p_carrier: input.trackingCarrier,
    p_tracking: input.trackingNumber,
    p_note: input.note,
    p_restore: input.restoreStock,
    p_actor: input.actor,
  });
  if (!result.ok) return { ok: false as const, error: result.error || "The order could not be updated." };
  const order = await getOrderById(input.orderId);
  if (!order) return { ok: false as const, error: "Order not found." };
  if (input.restoreStock) refreshCatalog();
  return { ok: true as const, order };
}

export async function reconcileOrder(input: { orderId: string; reason: string; externalReference: string; actor: string }) {
  const result = await rpc<{ ok: boolean; error?: string }>("reconcile_order", {
    p_order_id: input.orderId,
    p_reason: input.reason,
    p_reference: input.externalReference,
    p_actor: input.actor,
  });
  if (!result.ok) return { ok: false as const, error: result.error || "The order could not be reconciled." };
  return { ok: true as const };
}

export async function retryReference(reference: string) {
  return getOrderByReference(reference);
}
