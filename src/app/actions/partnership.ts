"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { saveInquiry } from "@/lib/db";
import { sendInquiryEmail } from "@/lib/email";
import { partnershipMessage } from "@/lib/partnerships";
import { rateLimit } from "@/lib/rate-limit";

const schema = z.object({
  kind: z.string().trim().max(40),
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(160),
  phone: z.string().trim().min(8).max(30),
  organisation: z.string().trim().max(120).optional().default(""),
  quantity: z.string().trim().max(8).optional().default(""),
  place: z.string().trim().max(80).optional().default(""),
  channel: z.string().trim().max(160).optional().default(""),
  selling: z.string().trim().max(40).optional().default(""),
  note: z.string().trim().max(1000).optional().default(""),
  company: z.string().optional().default(""),
});

async function clientIp() {
  const headerList = await headers();
  return headerList.get("x-forwarded-for")?.split(",")[0]?.trim() || headerList.get("x-real-ip") || "local";
}

export async function partnershipAction(input: unknown) {
  const limit = rateLimit(`contact:${await clientIp()}`, 5, 10 * 60_000);
  if (!limit.ok) return { ok: false as const, message: "Please wait a few minutes before sending another message." };
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false as const, message: "Add your name, a valid email, and a phone number." };
  if (parsed.data.company) return { ok: true as const };
  const request = partnershipMessage(parsed.data);
  if (!request.ok) return request;
  const email = parsed.data.email.toLowerCase();
  await saveInquiry({ name: parsed.data.name, email, phone: parsed.data.phone, message: request.message });
  await sendInquiryEmail({ name: parsed.data.name, email, message: request.message });
  return { ok: true as const };
}
