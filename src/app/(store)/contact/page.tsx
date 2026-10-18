import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";
import { getStore } from "@/lib/db";
import { live } from "@/lib/live";

export const instant = false;

export const metadata: Metadata = { title: "Contact", description: "Contact the store.", alternates: { canonical: "/contact" } };

export default async function ContactPage() {
  await live();
  const store = await getStore();
  const published = Boolean(store.email || store.phone || store.address || store.supportHours);
  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 sm:px-8 lg:grid-cols-2">
      <div>
        <h1 className="font-display text-5xl">Contact</h1>
        {published ? (
          <dl className="mt-6 space-y-3 text-sm">
            {store.email ? <div><dt className="font-medium">Email</dt><dd><a href={`mailto:${store.email}`}>{store.email}</a></dd></div> : null}
            {store.phone ? <div><dt className="font-medium">Phone</dt><dd><a href={`tel:${store.phone}`}>{store.phone}</a></dd></div> : null}
            {store.address ? <div><dt className="font-medium">Address</dt><dd>{store.address}</dd></div> : null}
            {store.supportHours ? <div><dt className="font-medium">Hours</dt><dd>{store.supportHours}</dd></div> : null}
          </dl>
        ) : (
          <p className="mt-4 text-muted">Contact details have not been published yet. You can still send a message.</p>
        )}
      </div>
      <ContactForm />
    </div>
  );
}
