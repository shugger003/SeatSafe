import type { Metadata } from "next";
import { ProductMedia } from "@/components/product-media";
import { Notice } from "@/components/ui";
import { catalogCached, getHomepage, getSteps } from "@/lib/db";

export const metadata: Metadata = {
  title: "How it works",
  description: "How to use Seat Shield: shake, spray, wait 30 seconds, and sit.",
  alternates: { canonical: "/how-it-works" },
};

export default async function HowPage() {
  const [home, allSteps] = await Promise.all([catalogCached("homepage", getHomepage), catalogCached("steps", getSteps)]);
  const steps = allSteps.filter((step) => step.published);
  return (
    <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
      <h1 className="font-display text-5xl">{home.stepsHeading}</h1>
      {home.stepsIntro ? <p className="mt-4 max-w-2xl text-muted">{home.stepsIntro}</p> : null}
      {steps.length === 0 ? (
        <div className="mt-8">
          <Notice>Follow the directions on the bottle label.</Notice>
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
