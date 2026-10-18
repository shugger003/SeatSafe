import type { Metadata } from "next";
import { ProductMedia } from "@/components/product-media";
import { EmptyState, PageHeader } from "@/components/ui";
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
    <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
      <PageHeader title={home.stepsHeading} lede={home.stepsIntro} />
      {steps.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            title="Instructions are not published yet"
            body="Follow the directions supplied with the product once the business publishes them. You can ask a question in the meantime."
            href="/contact"
            action="Ask a question"
          />
        </div>
      ) : (
        <ol className="mt-12 grid gap-10">
          {steps.map((step, index) => (
            <li key={step.id} className="grid gap-6 border-t border-line pt-8 md:grid-cols-[8rem_1fr]">
              {step.imageUrl ? (
                <ProductMedia src={step.imageUrl} alt={step.imageAlt || step.title} className="aspect-square" />
              ) : (
                <p className="font-display text-5xl text-pine tabular-nums">{String(index + 1).padStart(2, "0")}</p>
              )}
              <div>
                <h2 className="font-display text-3xl tracking-[-0.02em]">{step.title}</h2>
                <p className="mt-3 max-w-2xl leading-7 text-muted">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
