import type { Metadata } from "next";
import { Notice } from "@/components/ui";
import { getFaqs, getHomepage } from "@/lib/db";
import { live } from "@/lib/live";

export const instant = false;

export const metadata: Metadata = { title: "FAQs", description: "Published answers about the product, delivery, and support.", alternates: { canonical: "/faq" } };

export default async function FaqPage() {
  await live();
  const home = await getHomepage();
  const faqs = (await getFaqs()).filter((faq) => faq.published);
  const groups = [...new Set(faqs.map((faq) => faq.category))];
  return (
    <div className="mx-auto max-w-3xl px-5 py-12 sm:px-8">
      <h1 className="font-display text-5xl">{home.faqHeading}</h1>
      <p className="mt-4 text-muted">{home.faqIntro}</p>
      {faqs.length === 0 ? (
        <div className="mt-8"><Notice>Questions and answers will be published when the business confirms them.</Notice></div>
      ) : (
        groups.map((group) => (
          <section key={group} className="mt-10">
            <h2 className="text-sm uppercase tracking-[0.16em] text-clay">{group}</h2>
            <div className="mt-3 divide-y divide-line border-y border-line">
              {faqs.filter((faq) => faq.category === group).map((faq) => (
                <details key={faq.id} className="py-4">
                  <summary className="text-lg">{faq.question}</summary>
                  <p className="pt-3 text-sm leading-6 text-muted">{faq.answer}</p>
                </details>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
