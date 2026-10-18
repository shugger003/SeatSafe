import type { Metadata } from "next";
import { Button, PageHeader, Prose } from "@/components/ui";
import { getAbout, getStore } from "@/lib/db";
import { live } from "@/lib/live";

export const instant = false;

export async function generateMetadata(): Promise<Metadata> {
  await live();
  const about = await getAbout();
  return { title: about.heading, description: about.body.slice(0, 160), alternates: { canonical: "/about" } };
}

export default async function AboutPage() {
  await live();
  const about = await getAbout();
  const store = await getStore();
  return (
    <div className="mx-auto grid max-w-6xl gap-16 px-5 py-16 sm:px-8 lg:grid-cols-[1.4fr_0.6fr]">
      <div>
        <PageHeader title={about.heading} />
        <div className="mt-8 max-w-prose"><Prose text={about.body} /></div>
      </div>
      <aside className="h-fit border border-line bg-surface p-6 lg:mt-16">
        <h2 className="font-display text-3xl tracking-[-0.02em]">Company</h2>
        {store.legalName || store.address ? (
          <dl className="mt-4 space-y-3 text-sm text-muted">
            {store.legalName ? <div><dt className="text-ink">Legal name</dt><dd>{store.legalName}</dd></div> : null}
            {store.address ? <div><dt className="text-ink">Address</dt><dd>{store.address}</dd></div> : null}
          </dl>
        ) : (
          <div className="mt-4">
            <p className="text-sm leading-6 text-muted">Company details have not been published. You can still send a question.</p>
            <div className="mt-5">
              <Button href="/contact">Ask a question</Button>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
