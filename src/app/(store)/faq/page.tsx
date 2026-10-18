import type { Metadata } from "next";
import { EmptyState, PageHeader } from "@/components/ui";
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
    <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
      <PageHeader title={home.faqHeading} lede={home.faqIntro} />
      {faqs.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            title="No answers are published yet"
            body="Questions appear here after the business confirms them. Send a message if you need something sooner."
            href="/contact"
            action="Ask a question"
          />
        </div>
      ) : (
        groups.map((group) => (
          <section key={group} className="mt-12 grid gap-6 border-t border-line pt-8 md:grid-cols-[180px_1fr]">
            <h2 className="text-sm font-medium capitalize text-pine">{group}</h2>
            <div className="divide-y divide-line">
              {faqs.filter((faq) => faq.category === group).map((faq) => (
                <article key={faq.id} className="grid gap-2 py-5 md:grid-cols-2">
                  <h3 className="font-display text-2xl">{faq.question}</h3>
                  <p className="text-sm leading-6 text-muted">{faq.answer}</p>
                </article>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
