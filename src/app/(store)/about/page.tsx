import type { Metadata } from "next";
import { Prose } from "@/components/ui";
import { catalogCached, getAbout, getStore } from "@/lib/db";

export async function generateMetadata(): Promise<Metadata> {
  const about = await catalogCached("about", getAbout);
  return { title: about.heading, description: about.body.slice(0, 160), alternates: { canonical: "/about" } };
}

export default async function AboutPage() {
  const [about, store] = await Promise.all([catalogCached("about", getAbout), catalogCached("store", getStore)]);
  return (
    <div className="mx-auto max-w-3xl px-5 py-12 sm:px-8">
      <h1 className="font-display text-5xl">{about.heading}</h1>
      <div className="mt-6"><Prose text={about.body} /></div>
      {store.legalName || store.address ? (
        <dl className="mt-10 space-y-2 text-sm text-muted">
          {store.legalName ? <div>Legal name: {store.legalName}</div> : null}
          {store.address ? <div>{store.address}</div> : null}
        </dl>
      ) : null}
    </div>
  );
}
