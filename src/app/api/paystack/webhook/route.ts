import { recordPaymentEvent } from "@/lib/db";
import { notifyPaidOrder } from "@/lib/notify";
import { applyVerification } from "@/lib/orders";
import { paymentsMode, verifyPaystackSignature, verifyPaystackTransaction } from "@/lib/paystack";

export async function POST(request: Request) {
  if (paymentsMode() !== "live") return new Response("Payment webhook is not active.", { status: 404 });
  const raw = await request.text();
  const signature = request.headers.get("x-paystack-signature");
  if (!verifyPaystackSignature(raw, signature)) return new Response("Invalid signature", { status: 401 });

  let event: { event?: string; data?: { reference?: string; id?: number | string } };
  try {
    event = JSON.parse(raw) as typeof event;
  } catch {
    return new Response("Invalid payload", { status: 400 });
  }
  const reference = event.data?.reference;
  if (!reference) return new Response("Missing reference", { status: 400 });

  const eventId = event.data?.id ? `${event.event || "event"}:${event.data.id}` : "";

  try {
    const verification = await verifyPaystackTransaction(reference);
    const result = await applyVerification(reference, verification);
    if (result.kind === "paid" || result.kind === "already") {
      const notice = await notifyPaidOrder({ reference });
      if (notice && "reason" in notice && notice.reason === "failed") {
        return new Response("Notification failed", { status: 500 });
      }
    }
    if (eventId) await recordPaymentEvent(eventId, reference, event.event || "unknown");
  } catch (error) {
    console.error("webhook_failed", error instanceof Error ? error.message : "unknown");
    return new Response("Verification failed", { status: 500 });
  }
  return Response.json({ received: true });
}
