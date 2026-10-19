import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductMedia } from "@/components/product-media";
import { ProductPurchase } from "@/components/product-purchase";
import { Prose } from "@/components/ui";
import { displayPrice, purchaseBlockersForDisplay } from "@/lib/commerce";
import { getFaqs, getProductBySlug, getStore, listPublicProducts } from "@/lib/db";
import { live } from "@/lib/live";
import { paymentsReady } from "@/lib/paystack";
import { siteUrl } from "@/lib/safe";

export const instant = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  await live();
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product || product.status === "draft") return { title: "Product" };
  const title = product.seoTitle || product.name;
  const description = product.seoDescription || product.shortDescription;
  return {
    title,
    description,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: { title, description, url: `${siteUrl()}/product/${product.slug}`, type: "website" },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  await live();
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product || product.status === "draft") notFound();
  const store = await getStore();
  const ready = paymentsReady();
  const blockers = purchaseBlockersForDisplay(product, store, ready);
  const price = displayPrice(product);
  const stock = product.variants.length
    ? product.variants.reduce((sum, variant) => sum + (variant.available ? variant.stockQuantity : 0), 0)
    : product.stockQuantity;
  const related = (await listPublicProducts({ pageSize: 4 })).products.filter((item) => item.id !== product.id).slice(0, 3);
  const faqs = (await getFaqs()).filter((faq) => faq.published).slice(0, 4);
  const jsonLd =
    product.status === "published" && price != null
      ? {
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.name,
          description: product.shortDescription,
          sku: product.sku || undefined,
          image: product.images.map((image) => image.src),
          offers: {
            "@type": "Offer",
            priceCurrency: product.currency,
            price: (price / 100).toFixed(2),
            availability: stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            url: `${siteUrl()}/product/${product.slug}`,
          },
        }
      : null;

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 pb-28 sm:px-8 lg:pb-10">
      {jsonLd ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} /> : null}
      <nav className="text-sm text-muted" aria-label="Breadcrumb">
        <Link href="/">Home</Link> / <Link href="/shop">Shop</Link> / <span>{product.name}</span>
      </nav>
      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto">
          {product.images.length === 0 ? (
            <div className="min-w-full">
              <ProductMedia alt={product.name} logo={store.logoUrl} priority />
            </div>
          ) : (
            product.images.map((image, index) => (
              <div key={image.id} className="min-w-full snap-center">
                <ProductMedia src={image.src} alt={image.alt || `${product.name} image ${index + 1}`} priority={index === 0} />
              </div>
            ))
          )}
        </div>
        <div>
          {product.category ? <p className="mb-2 text-xs uppercase tracking-[0.16em] text-clay">{product.category}</p> : null}
          <h1 className="font-display text-5xl leading-tight">{product.name}</h1>
          <p className="mt-4 text-lg text-muted">{product.shortDescription}</p>
          <div className="mt-6 pb-24 lg:pb-0">
            <ProductPurchase
              productId={product.id}
              name={product.name}
              currency={product.currency}
              options={product.variants.map((variant) => ({
                id: variant.id,
                name: variant.name,
                priceMinor: variant.priceMinor,
                compareAtPriceMinor: variant.compareAtPriceMinor,
                stockQuantity: variant.stockQuantity,
                available: variant.available,
              }))}
              basePrice={product.priceMinor}
              baseCompare={product.compareAtPriceMinor}
              baseStock={product.stockQuantity}
              blocked={product.variants.length === 0 ? blockers[0] ?? null : blockers.find((item) => !item.startsWith("This product is out of stock")) ?? null}
            />
          </div>
        </div>
      </div>
      <div className="mt-12 grid gap-10 lg:grid-cols-2">
        {product.description ? (
          <section>
            <h2 className="font-display text-3xl">Description</h2>
            <div className="mt-4"><Prose text={product.description} /></div>
          </section>
        ) : null}
        {product.benefits.length > 0 ? (
          <section>
            <h2 className="font-display text-3xl">Details</h2>
            <ul className="mt-4 space-y-3">
              {product.benefits.map((benefit) => (
                <li key={benefit.label}>
                  <p className="font-medium">{benefit.label}</p>
                  <p className="text-sm text-muted">{benefit.value}</p>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
      {product.instructions.length > 0 ? (
        <section className="mt-10">
          <h2 className="font-display text-3xl">Usage</h2>
          <ol className="mt-4 grid gap-3 md:grid-cols-2">
            {product.instructions.map((step, index) => (
              <li key={step.title} className="rounded-[16px] border border-line bg-surface p-4">
                <p className="text-sm text-clay">0{index + 1}</p>
                <h3 className="font-display text-2xl">{step.title}</h3>
                <p className="mt-2 text-sm text-muted">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>
      ) : null}
      {product.specs.length > 0 ? (
        <section className="mt-10">
          <h2 className="font-display text-3xl">Specifications</h2>
          <dl className="mt-4 divide-y divide-line border-y border-line">
            {product.specs.map((spec) => (
              <div key={spec.label} className="grid gap-1 py-3 sm:grid-cols-[200px_1fr]">
                <dt className="text-sm font-medium">{spec.label}</dt>
                <dd className="text-sm text-muted">{spec.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}
      {faqs.length > 0 ? (
        <section className="mt-10">
          <h2 className="font-display text-3xl">Questions</h2>
          <div className="mt-4 divide-y divide-line border-y border-line">
            {faqs.map((faq) => (
              <details key={faq.id} className="py-3">
                <summary>{faq.question}</summary>
                <p className="pt-2 text-sm text-muted">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>
      ) : null}
      {related.length > 0 ? (
        <section className="mt-12">
          <h2 className="font-display text-3xl">Also in the shop</h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-3">
            {related.map((item) => (
              <li key={item.id}>
                <Link href={`/product/${item.slug}`} className="font-medium underline underline-offset-4">{item.name}</Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
