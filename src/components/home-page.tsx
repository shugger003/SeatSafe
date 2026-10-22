import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { ProductMedia } from "@/components/product-media";
import { ProductPurchase } from "@/components/product-purchase";
import { StoreIcon } from "@/components/icons";
import { Button, EmptyState, Price } from "@/components/ui";
import { videoEmbed } from "@/lib/media";
import { purchaseBlockersForDisplay } from "@/lib/commerce";
import { formatMoney } from "@/lib/money";
import { paymentsMode } from "@/lib/moolre";
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
    ? { href: `/product/${openProduct.slug}`, label: "Shop now" }
    : paused
      ? { href: "/shop", label: "See availability" }
      : { href: featured ? `/product/${featured.slug}` : "/shop", label: home.hero.primaryLabel || "View the product" };
  const featuredBlockers = featured ? purchaseBlockersForDisplay(featured, store, paymentsReady) : [];
  const featuredBlocker = featured?.variants.length
    ? featuredBlockers.find((item) => !item.startsWith("This product is out of stock")) ?? null
    : featuredBlockers[0] ?? null;
  const video = videoEmbed(home.video.url);
  const trust = trustRows(store, paymentsReady);

  return (
    <div>
      <section className="bg-mist">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-5 py-10 sm:px-8 lg:grid-cols-2 lg:gap-16 lg:py-16">
        <div className="order-2">
          <ProductMedia
            src={featured?.images[0]?.src}
            alt={featured?.images[0]?.alt || featured?.name || store.businessName}
            logo={store.logoUrl}
            priority
            tone="stage"
          />
        </div>
        <div>
          <p className="text-xs font-medium tracking-[0.22em] text-pine">{store.businessName}</p>
          <h1 className="mt-3 max-w-xl text-balance font-display text-5xl leading-[0.95] tracking-[-0.03em] sm:text-6xl">
            {featured?.name || home.hero.headline}
          </h1>
          <p className="mt-5 max-w-md text-lg leading-8 text-muted">{featured?.shortDescription || home.hero.description}</p>
          {featured ? (
            <div className="mt-6 max-w-md">
              <ProductPurchase
                productId={featured.id}
                name={featured.name}
                currency={featured.currency}
                options={featured.variants.map((variant) => ({
                  id: variant.id,
                  name: variant.name,
                  priceMinor: variant.priceMinor,
                  compareAtPriceMinor: variant.compareAtPriceMinor,
                  stockQuantity: variant.stockQuantity,
                  available: variant.available,
                }))}
                basePrice={featured.priceMinor}
                baseCompare={featured.compareAtPriceMinor}
                baseStock={featured.stockQuantity}
                blocked={featuredBlocker}
                stickyBar={false}
              />
            </div>
          ) : (
            <div className="mt-6">
              <Price minor={null} currency={store.currency} className="text-lg" />
            </div>
          )}
          {featured ? (
            <div className="mt-4 grid max-w-md grid-cols-2 gap-3 sm:mt-6 sm:flex sm:items-center sm:gap-8">
              <Link href={`/product/${featured.slug}`} className={HERO_LINK}>
                {home.hero.primaryLabel || "View product"}
              </Link>
              <Link href={home.hero.secondaryHref || "/how-it-works"} className={HERO_LINK}>
                {home.hero.secondaryLabel || "How it works"}
              </Link>
            </div>
          ) : (
            <div className="mt-6 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <Button href={cta.href}>{home.hero.primaryLabel || "View the product"}</Button>
              <Button href={home.hero.secondaryHref || "/how-it-works"} variant="quiet">
                {home.hero.secondaryLabel || "How it works"}
              </Button>
            </div>
          )}
        </div>
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
                <ProductCard product={product} logo={store.logoUrl} heading="h3" />
              </li>
            ))}
          </ul>
        </section>
      ) : products.length === 0 ? (
        <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
          <EmptyState
            title="Nothing in the shop yet"
            body="Send us a question and we will get back to you."
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

      <section className="bg-pine text-paper">
        <div className="mx-auto max-w-3xl px-5 py-16 text-center sm:px-8">
          <h2 className="font-display text-4xl leading-tight tracking-[-0.03em] text-paper sm:text-5xl">{home.finalHeading}</h2>
          {home.finalText ? <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-paper/80">{home.finalText}</p> : null}
          <div className="mt-8">
            <Button href={cta.href} variant="light">{cta.label}</Button>
          </div>
        </div>
      </section>
    </div>
  );
}

const HERO_LINK =
  "inline-flex min-h-11 items-center justify-center rounded-md border border-pine/20 bg-surface px-3 text-center text-[0.95rem] font-medium text-ink transition-colors hover:bg-paper sm:border-0 sm:bg-transparent sm:px-0 sm:underline-offset-4 sm:hover:bg-transparent sm:hover:underline";

const NEXT_STEPS = [
  {
    href: "/shop",
    title: "Shop",
    body: "See what is available to order.",
  },
  {
    href: "/how-it-works",
    title: "How it works",
    body: "How to use the product.",
  },
  {
    href: "/contact",
    title: "Contact",
    body: "Send us a question.",
  },
];

function SectionHeading({ title, intro }: { title: string; intro: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <h2 className="text-balance font-display text-4xl leading-tight tracking-[-0.03em] sm:text-5xl">{title}</h2>
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
    if (method.feeMinor <= 0 && !method.summary) continue;
    rows.push({
      label: method.label,
      value: [method.feeMinor > 0 ? formatMoney(method.feeMinor, store.currency) : "", method.summary].filter(Boolean).join(". "),
    });
  }
  if (paymentsReady && paymentsMode() === "live") {
    rows.push({ label: "Payment", value: "MTN, Telecel, or AirtelTigo mobile money through Moolre." });
  } else if (paymentsReady) {
    rows.push({ label: "Payment", value: "Test payments only. No real money is collected." });
  } else if (store.phone || store.social.whatsapp) {
    rows.push({ label: "Payment", value: "Online payment is not open yet. Call or WhatsApp us to order." });
  }
  return rows;
}
