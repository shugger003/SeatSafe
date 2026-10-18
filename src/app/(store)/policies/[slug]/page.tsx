import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Notice, Prose } from "@/components/ui";
import { getPolicies } from "@/lib/db";
import { live } from "@/lib/live";
import type { PolicyKey } from "@/lib/types";

export const instant = false;

const keys: PolicyKey[] = ["shipping", "returns", "privacy", "terms"];

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  await live();
  const { slug } = await params;
  if (!keys.includes(slug as PolicyKey)) return { title: "Policy" };
  const policy = (await getPolicies())[slug as PolicyKey];
  return { title: policy.title, description: policy.title, alternates: { canonical: `/policies/${slug}` } };
}

export default async function PolicyPage({ params }: { params: Promise<{ slug: string }> }) {
  await live();
  const { slug } = await params;
  if (!keys.includes(slug as PolicyKey)) notFound();
  const policy = (await getPolicies())[slug as PolicyKey];
  return (
    <div className="mx-auto max-w-3xl px-5 py-12 sm:px-8">
      <h1 className="font-display text-5xl">{policy.title}</h1>
      {!policy.reviewed ? (
        <div className="mt-6">
          <Notice tone="warn">This policy has not been marked as reviewed by the business. It is not a finished legal document.</Notice>
        </div>
      ) : null}
      <div className="mt-8"><Prose text={policy.body} /></div>
    </div>
  );
}
