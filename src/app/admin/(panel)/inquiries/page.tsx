import { listInquiries } from "@/lib/db";
import { live } from "@/lib/live";
import { formatWhen } from "@/lib/money";

export const instant = false;

export default async function InquiriesPage() {
  await live();
  const inquiries = await listInquiries();
  return (
    <div>
      <h1 className="font-display text-4xl">Inquiries</h1>
      <ul className="mt-6 space-y-4">
        {inquiries.map((item) => (
          <li key={item.id} className="rounded-[16px] border border-line p-4 text-sm">
            <p className="font-medium">{item.name} · {item.email}</p>
            <p className="text-muted">{formatWhen(item.createdAt)} {item.phone}</p>
            <p className="mt-2 whitespace-pre-wrap">{item.message}</p>
          </li>
        ))}
      </ul>
      {inquiries.length === 0 ? <p className="mt-4 text-sm text-muted">No messages yet.</p> : null}
    </div>
  );
}
