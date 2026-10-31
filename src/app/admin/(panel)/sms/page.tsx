import { SmsForm } from "@/components/admin/sms-form";
import { Card, Notice, PageHeader } from "@/components/admin/ui";
import { live } from "@/lib/live";
import { smsConfigured } from "@/lib/sms";

export const instant = false;

export default async function SmsPage({ searchParams }: { searchParams: Promise<{ notice?: string; phone?: string; order?: string }> }) {
  await live();
  const query = await searchParams;
  const ready = smsConfigured();
  const phone = (query.phone || "").slice(0, 30);
  const orderId = /^[0-9a-f-]{36}$/i.test(query.order || "") ? query.order || "" : "";
  return (
    <div className="grid gap-6">
      <PageHeader title="SMS" description="Send a text from this dashboard through the Moolre SMS API." />
      {query.notice ? <Notice tone={query.notice === "SMS sent." ? "success" : "warn"}>{query.notice}</Notice> : null}
      {ready ? null : (
        <Notice tone="warn">
          SMS is not connected yet. Add MOOLRE_SMS_VASKEY and MOOLRE_SMS_SENDER_ID in the host. The Sender ID must already be approved in Moolre, and it can be at most 11 letters or numbers.
        </Notice>
      )}
      <Card title="New message">
        <SmsForm phone={phone} orderId={orderId} returnTo="/admin/sms" ready={ready} />
      </Card>
    </div>
  );
}
