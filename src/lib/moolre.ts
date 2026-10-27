import { timingSafeEqual } from "node:crypto";
import { majorToMinor, minorToMajorInput } from "@/lib/money";
import { siteUrl } from "@/lib/safe";
import type { Order } from "@/lib/types";

export type ProviderStatus = "success" | "failed" | "abandoned" | "pending";

export type Verification = {
  status: ProviderStatus;
  amount: number | null;
  currency: string | null;
  providerReference: string;
  rawStatus: string;
};

export type MoolreEnvelope = {
  status?: number | string;
  code?: string;
  message?: string;
  txstatus?: number | string;
  data?:
    | {
        authorization_url?: string;
        reference?: string;
        txstatus?: number | string;
        amount?: string | number;
        currency?: string;
        accountnumber?: string;
        transactionid?: string | number | null;
        externalref?: string;
        secret?: string;
      }
    | string
    | null;
};

function moolreUser() {
  return process.env.MOOLRE_API_USER?.trim() || "";
}

function moolreKey() {
  return process.env.MOOLRE_API_PUBKEY?.trim() || "";
}

function moolreAccount() {
  return process.env.MOOLRE_ACCOUNT_NUMBER?.trim() || "";
}

function moolreSecret() {
  return process.env.MOOLRE_WEBHOOK_SECRET?.trim() || "";
}

export function moolreConfigured() {
  return Boolean(moolreUser() && moolreKey() && moolreAccount() && moolreSecret());
}

export function paymentsMode(): "live" | "test" | "disabled" {
  if (process.env.PAYMENTS_MODE === "test") {
    return process.env.NODE_ENV === "production" ? "disabled" : "test";
  }
  if (moolreConfigured()) return "live";
  return "disabled";
}

export function paymentsReady() {
  return paymentsMode() === "live" || paymentsMode() === "test";
}

export function verifyMoolreSecret(actual: string | null | undefined) {
  const expected = moolreSecret();
  if (!expected || !actual) return false;
  const left = Buffer.from(actual);
  const right = Buffer.from(expected);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

function headers() {
  return {
    "X-API-USER": moolreUser(),
    "X-API-PUBKEY": moolreKey(),
    "Content-Type": "application/json",
  };
}

function numericStatus(value: unknown) {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

function txStatus(body: MoolreEnvelope | null) {
  const data = body && typeof body.data === "object" && body.data ? body.data : null;
  return numericStatus(data?.txstatus) ?? numericStatus(body?.txstatus);
}

function amountMinor(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Number.isInteger(value) && value >= 100 ? value : Math.round(value * 100);
  }
  if (typeof value !== "string" || !value.trim()) return null;
  return majorToMinor(value.trim());
}

export async function initializeMoolre(order: Order) {
  if (!moolreConfigured()) return { ok: false as const, message: "Moolre is not configured." };
  const { getStore } = await import("@/lib/db");
  const store = await getStore();
  const email = store.email.trim() || order.customerEmail;
  const response = await fetch("https://api.moolre.com/embed/link", {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      type: 1,
      amount: minorToMajorInput(order.totalMinor),
      email,
      externalref: order.paymentReference,
      callback: `${siteUrl()}/api/moolre/webhook`,
      redirect: `${siteUrl()}/checkout/return?reference=${encodeURIComponent(order.paymentReference)}`,
      reusable: "0",
      expiration_time: Math.max(1, store.reservationMinutes || 30),
      currency: order.currency,
      accountnumber: moolreAccount(),
      metadata: { order_number: order.orderNumber },
    }),
    cache: "no-store",
  });
  const body = (await response.json().catch(() => null)) as MoolreEnvelope | null;
  const data = body && typeof body.data === "object" && body.data ? body.data : null;
  const url = data?.authorization_url;
  if (url && (numericStatus(body?.status) === 1 || body?.code === "POS09")) {
    return { ok: true as const, url };
  }
  if (body?.code === "INP02") {
    return { ok: true as const, url: `${siteUrl()}/checkout/return?reference=${encodeURIComponent(order.paymentReference)}` };
  }
  return { ok: false as const, message: body?.message || "Moolre did not start the payment." };
}

export async function verifyMoolreTransaction(reference: string): Promise<Verification> {
  if (!moolreConfigured()) {
    return { status: "pending", amount: null, currency: null, providerReference: "", rawStatus: "not_configured" };
  }
  const response = await fetch("https://api.moolre.com/open/transact/status", {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      type: 1,
      idtype: "1",
      id: reference,
      accountnumber: moolreAccount(),
    }),
    cache: "no-store",
  });
  const body = (await response.json().catch(() => null)) as MoolreEnvelope | null;
  if (!body) {
    return { status: "pending", amount: null, currency: null, providerReference: "", rawStatus: "verify_unavailable" };
  }
  const data = body && typeof body.data === "object" && body.data ? body.data : null;
  if (data?.accountnumber && data.accountnumber !== moolreAccount()) {
    return { status: "pending", amount: null, currency: null, providerReference: "", rawStatus: "account_mismatch" };
  }
  const tx = txStatus(body);
  const raw = tx === 1 ? "success" : tx === 2 ? "failed" : "pending";
  const status: ProviderStatus = raw === "success" ? "success" : raw === "failed" ? "failed" : "pending";
  return {
    status,
    amount: amountMinor(data?.amount),
    currency: typeof data?.currency === "string" && data.currency ? data.currency : "GHS",
    providerReference: data?.transactionid != null ? String(data.transactionid) : "",
    rawStatus: raw,
  };
}

export function moolreCallbackReference(body: MoolreEnvelope | null) {
  const data = body && typeof body.data === "object" && body.data ? body.data : null;
  return data?.externalref?.trim() || "";
}

export function moolreCallbackSecret(body: MoolreEnvelope | null) {
  const data = body && typeof body.data === "object" && body.data ? body.data : null;
  return data?.secret ?? null;
}
