import { recordPaymentEvent } from "@/lib/db";
import { moolreCallbackReference, moolreCallbackSecret, paymentsMode, verifyMoolreSecret, verifyMoolreTransaction, type MoolreEnvelope } from "@/lib/moolre";
import { notifyPaidOrder } from "@/lib/notify";
import { applyVerification } from "@/lib/orders";

export async function POST(request: Request) {
  if (paymentsMode() !== "live") return new Response("Payment webhook is not active.", { status: 404 });
  const raw = await request.text();
  let body: MoolreEnvelope;
  try {
    body = JSON.parse(raw) as MoolreEnvelope;
  } catch {
    return new Response("Invalid payload", { status: 400 });
  }
  if (!verifyMoolreSecret(moolreCallbackSecret(body))) return new Response("Invalid signature", { status: 401 });

  const reference = moolreCallbackReference(body);
  if (!reference) return new Response("Missing reference", { status: 400 });

  try {
    const verification = await verifyMoolreTransaction(reference);
    const result = await applyVerification(reference, verification);
    if (result.kind === "paid" || result.kind === "already") {
      const notice = await notifyPaidOrder({ reference });
      if (notice && "reason" in notice && notice.reason === "failed") {
        return new Response("Notification failed", { status: 500 });
      }
    }
    const eventId = verification.providerReference ? `moolre:${verification.providerReference}` : `moolre:${reference}:${verification.rawStatus}`;
    await recordPaymentEvent(eventId, reference, verification.rawStatus);
  } catch (error) {
    console.error("webhook_failed", error instanceof Error ? error.message : "unknown");
    return new Response("Verification failed", { status: 500 });
  }
  return Response.json({ received: true });
}
