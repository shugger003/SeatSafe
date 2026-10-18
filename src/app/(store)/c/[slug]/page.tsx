import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Button, Prose } from "@/components/ui";
import { getCampaigns } from "@/lib/db";
import { live } from "@/lib/live";

export const instant = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  await live();
  const { slug } = await params;
  const campaign = (await getCampaigns()).find((item) => item.slug === slug && item.published);
  if (!campaign) return { title: "Campaign" };
  return {
    title: campaign.seoTitle || campaign.title,
    description: campaign.seoDescription || campaign.description,
    alternates: { canonical: `/c/${campaign.slug}` },
  };
}

export default async function CampaignPage({ params }: { params: Promise<{ slug: string }> }) {
  await live();
  const { slug } = await params;
  const campaign = (await getCampaigns()).find((item) => item.slug === slug && item.published);
  if (!campaign) notFound();
  return (
    <div className="mx-auto max-w-3xl px-5 py-12 sm:px-8">
      {campaign.eyebrow ? <p className="text-xs uppercase tracking-[0.16em] text-clay">{campaign.eyebrow}</p> : null}
      <h1 className="mt-3 font-display text-5xl">{campaign.title}</h1>
      <p className="mt-4 text-lg text-muted">{campaign.description}</p>
      <div className="mt-8"><Prose text={campaign.body} /></div>
      {campaign.productSlug ? (
        <div className="mt-8">
          <Button href={`/product/${campaign.productSlug}`}>View the product</Button>
        </div>
      ) : null}
    </div>
  );
}
