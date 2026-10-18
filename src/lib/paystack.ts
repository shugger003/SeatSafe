import { createHmac, timingSafeEqual } from "node:crypto";
import type { Order } from "@/lib/types";
import { siteUrl } from "@/lib/safe";

export type ProviderStatus = "success" | "failed" | "abandoned" | "pending";

export type Verification = {
  status: ProviderStatus;
  amount: number | null;
  currency: string | null;
  providerReference: string;
  rawStatus: string;
};

export function paymentsMode(): "live" | "test" | "disabled" {
  if (process.env.PAYMENTS_MODE === "test") {
    return process.env.NODE_ENV === "production" ? "disabled" : "test";
  }
  if (process.env.PAYSTACK_SECRET_KEY) return "live";
  return "disabled";
}

export function paymentsReady() {
  return paymentsMode() === "live" || paymentsMode() === "test";
}

export function verifyPaystackSignature(rawBody: string, signature: string | null) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret || !signature) return false;
  const digest = createHmac("sha512", secret).update(rawBody).digest("hex");
  const left = Buffer.from(digest);
  const right = Buffer.from(signature);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export async function initializePaystack(order: Order) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) return { ok: false as const, message: "Paystack is not configured." };
  const response = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: order.customerEmail,
      amount: order.totalMinor,
      currency: order.currency,
      reference: order.paymentReference,
      callback_url: `${siteUrl()}/checkout/return?reference=${encodeURIComponent(order.paymentReference)}`,
      metadata: {
        order_number: order.orderNumber,
        custom_fields: [{ display_name: "Order", variable_name: "order_number", value: order.orderNumber }],
      },
    }),
    cache: "no-store",
  });
  const body = (await response.json().catch(() => null)) as {
    status?: boolean;
    message?: string;
    data?: { authorization_url?: string };
  } | null;
  const url = body?.data?.authorization_url;
  if (!response.ok || !body?.status || !url) {
    return { ok: false as const, message: body?.message || "Paystack did not start the payment." };
  }
  return { ok: true as const, url };
}

export async function verifyPaystackTransaction(reference: string): Promise<Verification> {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    return { status: "pending", amount: null, currency: null, providerReference: "", rawStatus: "not_configured" };
  }
  const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${secret}` },
    cache: "no-store",
  });
  const body = (await response.json().catch(() => null)) as {
    status?: boolean;
    data?: { status?: string; amount?: number; currency?: string; id?: number | string };
  } | null;
  if (!response.ok || !body?.status || !body.data) {
    return { status: "pending", amount: null, currency: null, providerReference: "", rawStatus: "verify_unavailable" };
  }
  const raw = body.data.status ?? "unknown";
  const status: ProviderStatus =
    raw === "success" ? "success" : raw === "failed" ? "failed" : raw === "abandoned" ? "abandoned" : "pending";
  return {
    status,
    amount: typeof body.data.amount === "number" ? body.data.amount : null,
    currency: body.data.currency ?? null,
    providerReference: body.data.id != null ? String(body.data.id) : "",
    rawStatus: raw,
  };
}
