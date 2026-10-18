"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { buildQuote, normalizeCode } from "@/lib/commerce";
import { getDiscountByCode, getOrderByReference, getProductById, getStore, saveInquiry } from "@/lib/db";
import { sendInquiryEmail } from "@/lib/email";
import { createPendingOrder, applyVerification } from "@/lib/orders";
import { notifyPaidOrder } from "@/lib/notify";
import { initializePaystack, paymentsMode, paymentsReady, verifyPaystackTransaction } from "@/lib/paystack";
import { rateLimit } from "@/lib/rate-limit";
import { siteUrl } from "@/lib/safe";
import type { CartLineInput, Quote } from "@/lib/types";

const lineSchema = z.object({
  productId: z.string().min(1).max(80),
  variantId: z.string().min(1).max(80).nullable(),
  quantity: z.number().int().min(1).max(20),
});

async function clientIp() {
  const headerList = await headers();
  return headerList.get("x-forwarded-for")?.split(",")[0]?.trim() || headerList.get("x-real-ip") || "local";
}

export async function quoteCartAction(lines: CartLineInput[], methodId: string | null, code: string): Promise<Quote> {
  const parsed = z.array(lineSchema).max(20).safeParse(lines);
  const safeLines = parsed.success ? parsed.data : [];
  const store = await getStore();
  const products = (await Promise.all(safeLines.map((line) => getProductById(line.productId)))).filter((product) => product != null);
  const discount = code.trim() ? await getDiscountByCode(normalizeCode(code)) : null;
  return buildQuote({
    lines: safeLines,
    products,
    store,
    discount,
    methodId,
    paymentsReady: paymentsReady(),
  });
}

const checkoutSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(160),
  phone: z.string().trim().min(8).max(30),
  address: z.string().trim().min(5).max(200),
  city: z.string().trim().min(2).max(80),
  region: z.string().trim().min(2).max(80),
  instructions: z.string().trim().max(300).optional().default(""),
  methodId: z.string().trim().max(80).nullable(),
  discountCode: z.string().trim().max(40).optional().default(""),
  lines: z.array(lineSchema).min(1).max(20),
});

export async function placeOrderAction(input: unknown): Promise<{ ok: true; token: string; url: string | null; message: string | null } | { ok: false; errors: string[] }> {
  const limit = rateLimit(`checkout:${await clientIp()}`, 8, 10 * 60_000);
  if (!limit.ok) return { ok: false, errors: ["Too many checkout attempts. Please wait a few minutes."] };
  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) return { ok: false, errors: ["Check the required name, email, phone, and delivery fields."] };
  const digits = parsed.data.phone.replace(/\D/g, "");
  if (digits.length < 8 || digits.length > 15) return { ok: false, errors: ["Enter a phone number the courier can use."] };
  if (paymentsMode() === "disabled") return { ok: false, errors: ["Payment is not configured yet, so checkout cannot take payment."] };

  let created: Awaited<ReturnType<typeof createPendingOrder>>;
  try {
    created = await createPendingOrder({
      lines: parsed.data.lines,
      customer: { name: parsed.data.name, email: parsed.data.email.toLowerCase(), phone: parsed.data.phone },
      delivery: {
        address: parsed.data.address,
        city: parsed.data.city,
        region: parsed.data.region,
        instructions: parsed.data.instructions,
        methodId: parsed.data.methodId,
      },
      discountCode: parsed.data.discountCode,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "STOCK" || message === "DISCOUNT") {
      return { ok: false, errors: ["The available quantity or code changed. Review the cart and try again."] };
    }
    console.error("order_create_failed");
    return { ok: false, errors: ["The order could not be created."] };
  }
  if (!created.ok) return { ok: false, errors: created.errors };

  if (paymentsMode() === "test") {
    return {
      ok: true,
      token: created.order.accessToken,
      url: `${siteUrl()}/checkout/test?reference=${encodeURIComponent(created.order.paymentReference)}`,
      message: null,
    };
  }

  try {
    const payment = await initializePaystack(created.order);
    if (!payment.ok) {
      return {
        ok: true,
        token: created.order.accessToken,
        url: null,
        message: "The order is reserved, but Paystack did not start the payment. Use the order page to try again.",
      };
    }
    return { ok: true, token: created.order.accessToken, url: payment.url, message: null };
  } catch (error) {
    console.error("paystack_initialize_failed", error instanceof Error ? error.message : "unknown");
    return {
      ok: true,
      token: created.order.accessToken,
      url: null,
      message: "The order is reserved, but the payment service could not be reached.",
    };
  }
}

export async function resumePaymentAction(reference: string) {
  const order = await getOrderByReference(reference);
  if (!order || order.paymentStatus !== "pending") return { ok: false as const, message: "This order is not waiting for payment." };
  if (paymentsMode() === "test") {
    return { ok: true as const, url: `${siteUrl()}/checkout/test?reference=${encodeURIComponent(order.paymentReference)}` };
  }
  if (paymentsMode() !== "live") return { ok: false as const, message: "Payment is not configured." };
  const payment = await initializePaystack(order);
  if (!payment.ok) return { ok: false as const, message: payment.message };
  return { ok: true as const, url: payment.url };
}

export async function verifyReturnAction(reference: string) {
  if (!reference) return { ok: false as const, message: "Missing payment reference." };
  if (paymentsMode() !== "live") return { ok: false as const, message: "Live payment verification is not active." };
  const verification = await verifyPaystackTransaction(reference);
  const result = await applyVerification(reference, verification);
  if (result.kind === "paid") await notifyPaidOrder({ reference });
  return { ok: true as const, kind: result.kind };
}

export async function simulateTestPaymentAction(reference: string, outcome: "success" | "failed" | "abandoned") {
  if (paymentsMode() !== "test") return { ok: false as const, message: "The test gateway is not enabled." };
  const order = await getOrderByReference(reference);
  if (!order) return { ok: false as const, message: "Order not found." };
  const verification =
    outcome === "success"
      ? { status: "success" as const, amount: order.totalMinor, currency: order.currency, providerReference: "test", rawStatus: "success" }
      : { status: outcome, amount: order.totalMinor, currency: order.currency, providerReference: "test", rawStatus: outcome };
  const result = await applyVerification(reference, verification);
  if (result.kind === "paid") await notifyPaidOrder({ reference });
  return { ok: true as const, token: order.accessToken };
}

const contactSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(160),
  phone: z.string().trim().max(30).optional().default(""),
  message: z.string().trim().min(10).max(2000),
  company: z.string().optional().default(""),
});

export async function contactAction(input: unknown) {
  const limit = rateLimit(`contact:${await clientIp()}`, 5, 10 * 60_000);
  if (!limit.ok) return { ok: false as const, message: "Please wait a few minutes before sending another message." };
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, message: "Add your name, a valid email, and a short message." };
  if (parsed.data.company) return { ok: true as const, emailed: false };
  await saveInquiry({
    name: parsed.data.name,
    email: parsed.data.email.toLowerCase(),
    phone: parsed.data.phone,
    message: parsed.data.message,
  });
  const email = await sendInquiryEmail(parsed.data);
  return { ok: true as const, emailed: email.sent };
}
