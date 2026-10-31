import "server-only";
import { addAudit, addOrderEvent, getOrderById } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { newId } from "@/lib/safe";
import { sendMoolreSms } from "@/lib/sms";

export async function sendAdminSms(actor: string, input: { phone: string; message: string; network?: string; orderId?: string }) {
  if (!rateLimit(`sms:${actor}`, 15, 10 * 60_000).ok) {
    return { ok: false as const, status: 429, message: "Too many messages. Wait a few minutes." };
  }
  const orderId = input.orderId?.trim() || "";
  if (orderId) {
    const order = await getOrderById(orderId);
    if (!order) return { ok: false as const, status: 404, message: "That order was not found." };
  }
  const result = await sendMoolreSms({
    phone: input.phone,
    message: input.message,
    network: input.network,
    ref: newId().replaceAll("-", "").slice(0, 20),
  });
  if (!result.ok) return { ok: false as const, status: 400, message: result.message };
  await addAudit(actor, "send_sms", "sms", result.recipient, orderId);
  if (orderId) await addOrderEvent(orderId, "sms", `SMS sent to ${result.recipient}.`, actor);
  return { ok: true as const, status: 200, recipient: result.recipient };
}
