import type { Metadata } from "next";
import { Notice } from "@/components/ui";
import { catalogCached, getFaqs, getHomepage } from "@/lib/db";

export const metadata: Metadata = { title: "FAQs", description: "Answers about Seat Shield, payment, and support.", alternates: { canonical: "/faq" } };

export default async function FaqPage() {
  const [home, allFaqs] = await Promise.all([catalogCached("homepage", getHomepage), catalogCached("faqs", getFaqs)]);
  const faqs = allFaqs.filter((faq) => faq.published);
  const groups = [...new Set(faqs.map((faq) => faq.category))];
  return (
    <div className="mx-auto max-w-3xl px-5 py-12 sm:px-8">
      <h1 className="font-display text-5xl">{home.faqHeading}</h1>
      {home.faqIntro ? <p className="mt-4 text-muted">{home.faqIntro}</p> : null}
      {faqs.length === 0 ? (
        <div className="mt-8"><Notice>Have a question? Contact us and we will answer it.</Notice></div>
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
