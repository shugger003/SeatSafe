import { Badge, ContactButtons, EmptyRow, PageHeader } from "@/components/admin/ui";
import { getStore, listInquiries } from "@/lib/db";
import { live } from "@/lib/live";
import { formatWhen } from "@/lib/money";
import { inquiryBody, inquiryTopic } from "@/lib/partnerships";

export const instant = false;

export default async function InquiriesPage() {
  await live();
  const inquiries = await listInquiries();
  const store = await getStore();
  return (
    <div className="grid gap-6">
      <PageHeader title="Messages" description="Contact, bulk orders, affiliate applications, and distributor applications." />
      {inquiries.length === 0 ? (
        <EmptyRow>No messages yet.</EmptyRow>
      ) : (
        <ul className="grid gap-3">
          {inquiries.map((item) => {
            const topic = inquiryTopic(item.message);
            return (
              <li key={item.id} className="rounded-xl border border-line bg-surface p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    {topic ? <Badge tone="green">{topic}</Badge> : null}
                    <p className={topic ? "mt-2 font-medium" : "font-medium"}>{item.name}</p>
                    <p className="break-all text-xs text-muted">{[item.email, item.phone].filter(Boolean).join(" \u00b7 ")}</p>
                  </div>
                  <p className="text-xs text-muted">{formatWhen(item.createdAt, store.timezone)}</p>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-6">{inquiryBody(item.message)}</p>
                <div className="mt-4">
                  <ContactButtons
                    compact
                    phone={item.phone}
                    email={item.email}
                    message={`Hello ${item.name.split(" ")[0]}, this is ${store.businessName} ${topic ? `about your ${topic.toLowerCase()} request` : "replying to your message"}.`}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
