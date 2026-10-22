import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Prose } from "@/components/ui";
import { catalogCached, getPolicies } from "@/lib/db";
import type { PolicyKey } from "@/lib/types";

const keys: PolicyKey[] = ["shipping", "returns", "privacy", "terms"];

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  if (!keys.includes(slug as PolicyKey)) return { title: "Policy" };
  const policy = (await catalogCached("policies", getPolicies))[slug as PolicyKey];
  return { title: policy.title, description: policy.title, alternates: { canonical: `/policies/${slug}` } };
}

export default async function PolicyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!keys.includes(slug as PolicyKey)) notFound();
  const policy = (await catalogCached("policies", getPolicies))[slug as PolicyKey];
  return (
    <div className="mx-auto max-w-3xl px-5 py-12 sm:px-8">
      <h1 className="font-display text-5xl">{policy.title}</h1>
      <div className="mt-8"><Prose text={policy.body} /></div>
    </div>
  );
}
