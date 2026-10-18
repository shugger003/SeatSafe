import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr/ArrowRight";
import { ProductMedia } from "@/components/product-media";
import { StoreIcon } from "@/components/icons";
import { Button, Notice, Price } from "@/components/ui";
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
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-14 sm:px-8 lg:grid-cols-12 lg:py-24">
        <div className="rise lg:col-span-6">
          {home.hero.eyebrow ? <p className="text-xs font-medium uppercase tracking-[0.18em] text-clay">{home.hero.eyebrow}</p> : null}
          <h1 className="mt-4 max-w-xl text-balance font-display text-5xl leading-[1.02] sm:text-7xl">{home.hero.headline}</h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-muted">{home.hero.description}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button href={home.hero.primaryHref || cta.href}>
              {home.hero.primaryLabel || cta.label}
              <ArrowRight size={16} aria-hidden="true" />
            </Button>
            <Button href={home.hero.secondaryHref || "/how-it-works"} variant="secondary">
              {home.hero.secondaryLabel || "How it works"}
            </Button>
          </div>
        </div>
        <div className="lg:col-span-6 lg:pl-6">
          <ProductMedia
            src={featured?.images[0]?.src}
            alt={featured?.images[0]?.alt || "Product image placeholder"}
            priority
          />
        </div>
      </section>

      {benefits.length > 0 ? (
        <section className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
          <SectionHeading title={home.benefitsHeading} intro={home.benefitsIntro} />
          <ol className="mt-8 divide-y divide-line overflow-hidden rounded-[22px] border border-line bg-surface shadow-soft">
            {benefits.map((benefit, index) => (
              <li key={benefit.id} className="grid gap-4 p-5 sm:grid-cols-[auto_1fr] sm:items-start sm:p-6">
                <span className="font-display text-3xl text-clay tabular-nums">0{index + 1}</span>
                <div>
                  <div className="flex items-center gap-3">
                    <StoreIcon name={benefit.icon} />
                    <h3 className="font-display text-2xl">{benefit.title}</h3>
                  </div>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{benefit.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      <section className="mx-auto max-w-6xl px-5 py-12 sm:px-8" id="how-it-works">
        <SectionHeading title={home.stepsHeading} intro={home.stepsIntro} />
        {steps.length > 0 ? (
          <ol className="mt-8 grid gap-px overflow-hidden rounded-[22px] bg-line md:grid-cols-3">
            {steps.map((step, index) => (
              <li key={step.id} className="bg-paper p-6">
                <p className="font-display text-4xl text-pine tabular-nums">0{index + 1}</p>
                <h3 className="mt-4 font-display text-2xl">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{step.body}</p>
              </li>
            ))}
          </ol>
        ) : (
          <div className="mt-6">
            <Notice>Usage instructions have not been published. Follow the directions supplied with the product once they are available.</Notice>
          </div>
        )}
      </section>

      <section className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        <SectionHeading title={home.showcaseHeading} intro={home.showcaseIntro} />
        {products.length === 0 ? (
          <div className="mt-6">
            <Notice>No products are published yet.</Notice>
          </div>
        ) : products.length === 1 && featured ? (
          <FeaturedProduct product={featured} store={store} paymentsReady={paymentsReady} />
        ) : (
          <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <li key={product.id}>
                <ProductLink product={product} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {video ? (
        <section className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
          <SectionHeading title={home.video.heading} intro={home.video.description} />
          <div className="mt-8 overflow-hidden rounded-[16px] border border-line bg-ink">
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
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {useCases.map((item) => (
              <li key={item.id} className="grid gap-4 rounded-[16px] border border-line bg-surface p-5 sm:grid-cols-[120px_1fr]">
                {item.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.imageUrl} alt={item.imageAlt || ""} className="h-28 w-full rounded-[10px] object-cover" loading="lazy" />
                ) : (
                  <div className="flex h-28 items-center justify-center rounded-[10px] bg-mist text-pine">
                    <StoreIcon name={item.icon} size={28} />
                  </div>
                )}
                <div>
                  <h3 className="font-display text-2xl">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted">{item.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
        <SectionHeading title={home.trustHeading} intro={home.trustIntro} />
        {trust.length > 0 ? (
          <dl className="mt-8 divide-y divide-line rounded-[16px] border border-line bg-surface">
            {trust.map((row) => (
              <div key={row.label} className="grid gap-1 px-5 py-4 sm:grid-cols-[180px_1fr]">
                <dt className="text-sm font-medium">{row.label}</dt>
                <dd className="text-sm leading-6 text-muted">{row.value}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <div className="mt-6">
            <Notice>Support, delivery, and payment details will appear here when the business publishes them.</Notice>
          </div>
        )}
      </section>

      <section className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        <SectionHeading title={home.faqHeading} intro={home.faqIntro} />
        {faqs.length > 0 ? (
          <div className="mt-6 divide-y divide-line border-y border-line">
            {faqs.map((faq) => (
              <details key={faq.id} className="group py-4">
                <summary className="flex items-center justify-between gap-4 text-lg">
                  {faq.question}
                  <span aria-hidden="true" className="text-muted group-open:hidden">+</span>
                  <span aria-hidden="true" className="hidden text-muted group-open:inline">–</span>
                </summary>
                <p className="max-w-3xl pt-3 text-sm leading-6 text-muted">{faq.answer}</p>
              </details>
            ))}
          </div>
        ) : (
          <div className="mt-6">
            <Notice>Questions and answers will be published when the business confirms them.</Notice>
          </div>
        )}
        <div className="mt-4">
          <Link href="/faq" className="text-sm underline underline-offset-4">All questions</Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <div className="relative overflow-hidden rounded-[28px] bg-pine px-6 py-14 text-paper sm:px-12">
          <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-paper/10" aria-hidden="true" />
          <h2 className="max-w-xl font-display text-4xl leading-tight sm:text-5xl">{home.finalHeading}</h2>
          <p className="mt-4 max-w-xl text-paper/80">{home.finalText}</p>
          <p className="mt-2 max-w-xl text-sm text-paper/70">{cta.note}</p>
          <div className="mt-8">
            <Link href={cta.href} className="inline-flex min-h-11 items-center rounded-full bg-paper px-5 font-medium text-pine hover:bg-surface">
              {cta.label}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function SectionHeading({ title, intro }: { title: string; intro: string }) {
  return (
    <div className="max-w-2xl">
      <h2 className="text-balance font-display text-4xl leading-tight sm:text-5xl">{title}</h2>
      {intro ? <p className="mt-3 text-muted">{intro}</p> : null}
    </div>
  );
}

function FeaturedProduct({ product, store, paymentsReady }: { product: Product; store: StoreSettings; paymentsReady: boolean }) {
  const blockers = purchaseBlockersForDisplay(product, store, paymentsReady);
  return (
    <article className="mt-8 grid items-center gap-8 rounded-[24px] border border-line bg-surface p-4 shadow-soft sm:p-6 lg:grid-cols-2">
      <ProductMedia src={product.images[0]?.src} alt={product.images[0]?.alt || `${product.name} image placeholder`} />
      <div>
        <p className="text-xs uppercase tracking-[0.16em] text-clay">{statusLabel(product)}</p>
        <h3 className="mt-2 font-display text-4xl">{product.name}</h3>
        <p className="mt-3 text-muted">{product.shortDescription}</p>
        <div className="mt-4">
          <Price minor={displayPrice(product)} currency={product.currency} compare={product.variants.length ? null : product.compareAtPriceMinor} className="text-xl" />
          {product.variants.length > 0 && displayPrice(product) != null ? <p className="mt-1 text-sm text-muted">From this price. Options are on the product page.</p> : null}
        </div>
        {blockers[0] ? <p className="mt-3 text-sm text-muted">{blockers[0]}</p> : null}
        <div className="mt-6">
          <Button href={`/product/${product.slug}`}>View details</Button>
        </div>
      </div>
    </article>
  );
}

function ProductLink({ product }: { product: Product }) {
  return (
    <article className="h-full rounded-[16px] border border-line bg-surface p-3">
      <Link href={`/product/${product.slug}`}>
        <ProductMedia src={product.images[0]?.src} alt={product.images[0]?.alt || `${product.name} image placeholder`} />
        <h3 className="mt-4 font-display text-2xl">{product.name}</h3>
      </Link>
      <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted">{product.shortDescription}</p>
      <p className="mt-3 text-sm">{statusLabel(product)}</p>
      <p className="mt-1">
        <Price minor={displayPrice(product)} currency={product.currency} compare={product.variants.length ? null : product.compareAtPriceMinor} />
      </p>
      <Link href={`/product/${product.slug}`} className="mt-4 inline-flex min-h-11 items-center text-sm underline underline-offset-4">
        View details
      </Link>
    </article>
  );
}

function statusLabel(product: Product) {
  if (product.status === "coming_soon") return "Coming soon";
  if (product.status === "unavailable") return "Temporarily unavailable";
  if (product.status !== "published") return "Not available";
  const price = displayPrice(product);
  if (price == null) return "Price to be confirmed";
  const stock = product.variants.length
    ? product.variants.reduce((sum, variant) => sum + (variant.available ? variant.stockQuantity : 0), 0)
    : product.stockQuantity;
  if (stock <= 0) return "Out of stock";
  if (stock <= product.lowStockThreshold) return "Limited availability";
  return "In stock";
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
  rows.push({ label: "Policies", value: "Shipping, returns, privacy, and terms are linked in the footer. Draft policies say so on the page." });
  return rows;
}
