import Link from "next/link";
import { ProductCard, availabilityLabel } from "@/components/product-card";
import { ProductMedia } from "@/components/product-media";
import { StoreIcon } from "@/components/icons";
import { Button, EmptyState, Price } from "@/components/ui";
import { videoEmbed } from "@/lib/media";
import { purchaseBlockersForDisplay, displayPrice } from "@/lib/commerce";
import { formatMoney } from "@/lib/money";
import type { Benefit, Faq, HomepageContent, Product, Step, StoreSettings, UseCase } from "@/lib/types";

export function HomePage({
  store,
  home,
  benefits,
  steps,
  products,
  useCases,
  faqs,
  paymentsReady,
}: {
  store: StoreSettings;
  home: HomepageContent;
  benefits: Benefit[];
  steps: Step[];
  products: Product[];
  useCases: UseCase[];
  faqs: Faq[];
  paymentsReady: boolean;
}) {
  const featured = products.find((product) => product.featured) ?? products[0];
  const openProduct = products.find((product) => purchaseBlockersForDisplay(product, store, paymentsReady).length === 0);
  const paused = store.storeStatus === "paused" || (products.length > 0 && products.every((product) => product.status === "unavailable"));
  const cta = openProduct
    ? { href: `/product/${openProduct.slug}`, label: "Shop now", note: "The price is confirmed again on the server before payment." }
    : paused
      ? { href: "/shop", label: "See availability", note: "Ordering is paused or the product is temporarily unavailable." }
      : { href: featured ? `/product/${featured.slug}` : "/shop", label: home.hero.primaryLabel || "View the product", note: "Orders open when the product, delivery, and payment details are published." };
  const video = videoEmbed(home.video.url);
  const trust = trustRows(store, paymentsReady);

  return (
    <div>
      <section className="mx-auto max-w-3xl px-5 pb-4 pt-14 text-center sm:px-8 sm:pt-20">
        <h1 className="text-balance font-display text-4xl leading-tight tracking-[-0.03em] text-ink sm:text-5xl">
          {home.hero.headline}
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-ink">{home.hero.description}</p>
      </section>

      <section className="bg-surface">
        <div className="mx-auto max-w-3xl px-5 py-14 text-center sm:px-8">
          <h2 className="text-balance font-display text-4xl leading-tight tracking-[-0.02em] text-pine sm:text-5xl">
            {featured?.name || "The product"}
          </h2>
          {featured ? <p className="mx-auto mt-4 max-w-xl text-muted">{featured.shortDescription}</p> : null}
          <div className="mt-4">
            <Price minor={featured ? displayPrice(featured) : null} currency={featured?.currency || store.currency} compare={featured && featured.variants.length === 0 ? featured.compareAtPriceMinor : null} className="text-lg" />
          </div>
          {featured ? <p className="mt-3 text-sm text-pine">{availabilityLabel(featured)}</p> : null}
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button href={featured ? `/product/${featured.slug}` : cta.href}>
              {home.hero.primaryLabel || "View the product"}
            </Button>
            <Button href={home.hero.secondaryHref || "/how-it-works"} variant="quiet">
              {home.hero.secondaryLabel || "How it works"}
            </Button>
          </div>
          {featured && purchaseBlockersForDisplay(featured, store, paymentsReady)[0] ? (
            <p className="mx-auto mt-4 max-w-md text-sm text-muted">{purchaseBlockersForDisplay(featured, store, paymentsReady)[0]}</p>
          ) : (
            <p className="mx-auto mt-4 max-w-md text-sm text-muted">{cta.note}</p>
          )}
        </div>
        <div className="stage mx-auto max-w-4xl px-5 pb-14 sm:px-8">
          <ProductMedia
            src={featured?.images[0]?.src}
            alt={featured?.images[0]?.alt || "Product image placeholder"}
            priority
            tone="stage"
          />
        </div>
      </section>

      {benefits.length > 0 ? (
        <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
          <SectionHeading title={home.benefitsHeading} intro={home.benefitsIntro} />
          <ul className="mt-10 divide-y divide-line border-y border-line">
            {benefits.map((benefit) => (
              <li key={benefit.id} className="grid gap-3 py-6 sm:grid-cols-[220px_1fr] sm:items-baseline">
                <h3 className="flex items-center gap-3 font-display text-2xl">
                  <StoreIcon name={benefit.icon} />
                  {benefit.title}
                </h3>
                <p className="max-w-2xl text-sm leading-6 text-muted">{benefit.description}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {steps.length > 0 ? (
        <section className="mx-auto max-w-6xl px-5 py-8 sm:px-8" id="how-it-works">
          <SectionHeading title={home.stepsHeading} intro={home.stepsIntro} />
          <ol className="mt-12 divide-y divide-line border-y border-line">
            {steps.map((step, index) => (
              <li key={step.id} className="grid gap-3 py-8 sm:grid-cols-[4.5rem_1fr] sm:items-baseline">
                <p className="font-display text-2xl text-pine tabular-nums">{String(index + 1).padStart(2, "0")}</p>
                <div>
                  <h3 className="font-display text-3xl tracking-[-0.03em]">{step.title}</h3>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {products.length > 1 ? (
        <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
          <SectionHeading title={home.showcaseHeading} intro={home.showcaseIntro} />
          <ul className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <li key={product.id}>
                <ProductCard product={product} heading="h3" />
              </li>
            ))}
          </ul>
        </section>
      ) : products.length === 0 ? (
        <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
          <EmptyState
            title="No products are published yet"
            body="The shop stays empty until the business publishes a listing. You can still send a question."
            href="/contact"
            action="Ask a question"
          />
        </section>
      ) : null}

      {benefits.length + steps.length + useCases.length + faqs.length === 0 ? (
        <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
          <h2 className="font-display text-4xl tracking-[-0.03em] sm:text-5xl">What you can do now</h2>
          <ul className="mt-10 divide-y divide-line border-y border-line">
            {NEXT_STEPS.map((item) => (
              <li key={item.href} className="grid gap-2 py-6 sm:grid-cols-[220px_1fr] sm:items-baseline">
                <h3 className="font-display text-2xl">
                  <Link href={item.href} className="underline-offset-4 hover:underline">{item.title}</Link>
                </h3>
                <p className="max-w-2xl text-sm leading-6 text-muted">{item.body}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {video ? (
        <section className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
          <SectionHeading title={home.video.heading} intro={home.video.description} />
          <div className="mt-8 overflow-hidden bg-ink">
            {video.kind === "file" ? (
              <video className="aspect-video w-full" controls preload="none" poster={home.video.posterUrl || undefined}>
                <source src={video.src} />
              </video>
            ) : (
              <iframe className="aspect-video w-full" src={video.src} title={home.video.heading || "Product demonstration"} loading="lazy" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
            )}
          </div>
        </section>
      ) : null}

      {useCases.length > 0 ? (
        <section className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
          <SectionHeading title={home.useCasesHeading} intro={home.useCasesIntro} />
          <ul className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2">
            {useCases.map((item) => (
              <li key={item.id} className="border-t border-line pt-5">
                <h3 className="flex items-center gap-3 font-display text-2xl">
                  <StoreIcon name={item.icon} />
                  {item.title}
                </h3>
                <p className="mt-2 max-w-md text-sm leading-6 text-muted">{item.description}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {trust.length > 0 ? (
        <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
          <SectionHeading title={home.trustHeading} intro={home.trustIntro} />
          <dl className="mt-8 divide-y divide-line border-y border-line">
            {trust.map((row) => (
              <div key={row.label} className="grid gap-1 py-4 sm:grid-cols-[180px_1fr]">
                <dt className="text-sm font-medium">{row.label}</dt>
                <dd className="text-sm leading-6 text-muted">{row.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      {faqs.length > 0 ? (
        <section className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
          <SectionHeading title={home.faqHeading} intro={home.faqIntro} />
          <div className="mt-8 divide-y divide-line border-y border-line">
            {faqs.map((faq) => (
              <article key={faq.id} className="grid gap-2 py-5 md:grid-cols-[1fr_1.2fr] md:gap-10">
                <h3 className="font-display text-2xl">{faq.question}</h3>
                <p className="max-w-xl text-sm leading-6 text-muted">{faq.answer}</p>
              </article>
            ))}
          </div>
          <div className="mt-4">
            <Link href="/faq" className="text-sm underline underline-offset-4">All questions</Link>
          </div>
        </section>
      ) : null}

      <section className="bg-surface">
        <div className="mx-auto max-w-3xl px-5 py-16 text-center sm:px-8">
          <h2 className="font-display text-4xl leading-tight tracking-[-0.02em] text-pine sm:text-5xl">{home.finalHeading}</h2>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-muted">{home.finalText}</p>
          <div className="mt-8">
            <Button href={cta.href}>{cta.label}</Button>
          </div>
        </div>
      </section>
    </div>
  );
}

const NEXT_STEPS = [
  {
    href: "/shop",
    title: "Shop",
    body: "The catalog lists published products only. A price appears after the business confirms it.",
  },
  {
    href: "/how-it-works",
    title: "How it works",
    body: "Usage steps appear when the manufacturer’s instructions are published.",
  },
  {
    href: "/contact",
    title: "Contact",
    body: "Send a question while company details and ordering are still being confirmed.",
  },
];

function SectionHeading({ title, intro }: { title: string; intro: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <h2 className="text-balance font-display text-4xl leading-tight tracking-[-0.02em] text-pine sm:text-5xl">{title}</h2>
      {intro ? <p className="mt-4 leading-7 text-muted">{intro}</p> : null}
    </div>
  );
}

function trustRows(store: StoreSettings, paymentsReady: boolean) {
  const rows: Array<{ label: string; value: string }> = [];
  if (store.supportHours) rows.push({ label: "Support hours", value: store.supportHours });
  if (store.email) rows.push({ label: "Email", value: store.email });
  if (store.phone) rows.push({ label: "Phone", value: store.phone });
  for (const method of store.deliveryMethods.filter((item) => item.active)) {
    rows.push({
      label: method.label,
      value: `${formatMoney(method.feeMinor, store.currency) ?? ""} ${method.summary}`.trim(),
    });
  }
  if (paymentsReady && process.env.PAYSTACK_SECRET_KEY) {
    rows.push({
      label: "Payment",
      value: "Payments are confirmed with Paystack before an order is marked paid. Card details are not stored on this website.",
    });
  } else if (paymentsReady) {
    rows.push({
      label: "Payment",
      value: "A test payment gateway is enabled in this environment. It does not collect real money.",
    });
  }
  return rows;
}
