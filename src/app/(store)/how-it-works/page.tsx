import type { Metadata } from "next";
import { ProductMedia } from "@/components/product-media";
import { Notice } from "@/components/ui";
import { getHomepage, getSteps } from "@/lib/db";
import { live } from "@/lib/live";

export const instant = false;

export const metadata: Metadata = {
  title: "How it works",
  description: "Published usage steps for the toilet seat sanitizer.",
  alternates: { canonical: "/how-it-works" },
};

export default async function HowPage() {
  await live();
  const home = await getHomepage();
  const steps = (await getSteps()).filter((step) => step.published);
  return (
    <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
      <h1 className="font-display text-5xl">{home.stepsHeading}</h1>
      <p className="mt-4 max-w-2xl text-muted">{home.stepsIntro}</p>
      {steps.length === 0 ? (
        <div className="mt-8">
          <Notice>Usage instructions have not been published. Follow the directions supplied with the product once they are available.</Notice>
        </div>
      ) : (
        <ol className="mt-10 grid gap-6">
          {steps.map((step, index) => (
            <li key={step.id} className="grid gap-5 rounded-[16px] border border-line bg-surface p-5 md:grid-cols-[180px_1fr]">
              {step.imageUrl ? (
                <ProductMedia src={step.imageUrl} alt={step.imageAlt || step.title} className="aspect-square" />
              ) : (
                <p className="font-display text-4xl text-clay">0{index + 1}</p>
              )}
              <div>
                <h2 className="font-display text-3xl">{step.title}</h2>
                <p className="mt-3 leading-7 text-muted">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
