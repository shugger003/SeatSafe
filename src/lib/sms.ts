import "server-only";
import { phoneDigits } from "@/lib/contact";

const NETWORKS = ["MTN", "TELECEL"] as const;

export function smsSenderId() {
  const id = process.env.MOOLRE_SMS_SENDER_ID?.trim() || "";
  return /^[A-Za-z0-9]{1,11}$/.test(id) ? id : "";
}

export function smsConfigured() {
  return Boolean(process.env.MOOLRE_SMS_VASKEY?.trim() && smsSenderId());
}

/** Ghana mobile number in the form Moolre expects, such as 233265617666. */
export function smsRecipient(phone: string) {
  const digits = phoneDigits(phone);
  return /^233\d{9}$/.test(digits) ? digits : "";
}

export function smsNetwork(value: string | null | undefined) {
  const network = value?.trim().toUpperCase() || "";
  return NETWORKS.find((item) => item === network) || "";
}

const MTN_PREFIXES = new Set(["024", "025", "053", "054", "055", "059"]);
const TELECEL_PREFIXES = new Set(["020", "050"]);

/** MTN or Telecel when the Ghana prefix is known. Other networks are left for Moolre to route. */
export function smsNetworkForPhone(phone: string) {
  const digits = smsRecipient(phone);
  if (!digits) return "";
  const prefix = `0${digits.slice(3, 5)}`;
  if (MTN_PREFIXES.has(prefix)) return "MTN";
  if (TELECEL_PREFIXES.has(prefix)) return "TELECEL";
  return "";
}

/** One payment receipt, kept within a single SMS. */
export function paymentConfirmationSms(input: { businessName: string; orderNumber: string; total: string; phone: string }) {
  const name = input.businessName.trim() || "SitSafe";
  const total = input.total.trim();
  const call = input.phone.trim();
  const full = call
    ? `${name}: payment received for ${input.orderNumber}. Total ${total}. We will deliver your order. Call ${call} with questions.`
    : `${name}: payment received for ${input.orderNumber}. Total ${total}. We will deliver your order.`;
  if (full.length <= 160) return full;
  const short = `${name}: payment received for ${input.orderNumber}. Total ${total}.`;
  return short.length <= 160 ? short : short.slice(0, 160);
}

export async function sendMoolreSms(input: { phone: string; message: string; network?: string; ref?: string }) {
  const key = process.env.MOOLRE_SMS_VASKEY?.trim() || "";
  const senderid = smsSenderId();
  if (!key || !senderid) return { ok: false as const, message: "SMS is not configured. Add the Moolre VAS key and approved Sender ID." };
  const recipient = smsRecipient(input.phone);
  if (!recipient) return { ok: false as const, message: "Enter a Ghana phone number." };
  const message = input.message.trim();
  if (message.length < 1 || message.length > 160) return { ok: false as const, message: "The message must be 1 to 160 characters." };

  const item: { recipient: string; message: string; ref?: string } = { recipient, message };
  const ref = input.ref?.trim().slice(0, 40) || "";
  if (ref) item.ref = ref;
  const body: { type: 1; senderid: string; messages: Array<{ recipient: string; message: string; ref?: string }>; network?: string } = {
    type: 1,
    senderid,
    messages: [item],
  };
  const network = smsNetwork(input.network);
  if (network) body.network = network;

  let response: Response;
  try {
    response = await fetch("https://api.moolre.com/open/sms/send", {
      method: "POST",
      headers: {
        "X-API-VASKEY": key,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });
  } catch {
    return { ok: false as const, message: "Moolre could not be reached." };
  }

  const payload = (await response.json().catch(() => null)) as { status?: number | string; code?: string; message?: string } | null;
  const status = Number(payload?.status);
  const code = payload?.code || "";
  if (response.ok && status === 1 && code === "SMS01") return { ok: true as const, recipient };
  const text = payload?.message?.replace(key, "").trim().slice(0, 180);
  return { ok: false as const, message: text || "Moolre did not send the SMS." };
}
