import type { Metadata } from "next";
import Link from "next/link";
import { BulkPurchase } from "@/components/bulk-purchase";
import { ghanaDisplay } from "@/lib/contact";
import { catalogCached, getStore, listPublicProducts } from "@/lib/db";
import { PARTNERSHIPS } from "@/lib/partnerships";
import { safeHref } from "@/lib/safe";

const page = PARTNERSHIPS.bulk;

export const metadata: Metadata = {
  title: page.title,
  description: page.description,
  alternates: { canonical: page.href },
};

export default async function BulkPage() {
  const [store, catalog] = await Promise.all([
    catalogCached("store", getStore),
    catalogCached("public-products-1", () => listPublicProducts({ pageSize: 1 })),
  ]);
  const product = catalog.products[0];
  const priceMinor = product?.priceMinor ?? null;
  const canBuy = Boolean(product && priceMinor != null && priceMinor > 0 && product.stockQuantity >= 50);
  const phone = store.phone.replaceAll(" ", "");
  const whatsapp = safeHref(store.social.whatsapp);

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[1fr_1.05fr] lg:items-start">
      <div>
        <h1 className="font-display text-5xl leading-tight">{page.title}</h1>
        <p className="mt-4 max-w-xl text-lg leading-8">{page.lead}</p>
        <p className="mt-4 max-w-xl leading-7 text-muted">{page.detail}</p>
        <p className="mt-4 max-w-xl text-sm leading-6">{page.caveat}</p>
        <p className="mt-6 text-sm">
          {product ? (
            <Link href={`/product/${product.slug}`} className="underline underline-offset-4">
              {product.name}
            </Link>
          ) : null}
          {product ? <span className="text-muted"> · </span> : null}
          <Link href="/shop" className="underline underline-offset-4">
            {page.shop}
          </Link>
        </p>
        {store.phone || store.email || whatsapp ? (
          <dl className="mt-8 space-y-3 text-sm">
            {store.phone ? (
              <div>
                <dt className="font-medium">Call</dt>
                <dd>
                  <a href={`tel:${phone}`}>{store.phone}</a>
                </dd>
              </div>
            ) : null}
            {whatsapp ? (
              <div>
                <dt className="font-medium">WhatsApp</dt>
                <dd>
                  <a href={whatsapp}>{ghanaDisplay(whatsapp)}</a>
                </dd>
              </div>
            ) : null}
            {store.email ? (
              <div>
                <dt className="font-medium">Email</dt>
                <dd>
                  <a href={`mailto:${store.email}`}>{store.email}</a>
                </dd>
              </div>
            ) : null}
          </dl>
        ) : null}
      </div>
      <div className="rounded-[16px] border border-line bg-surface p-5 sm:p-6">
        {canBuy && product && priceMinor != null ? (
          <BulkPurchase productId={product.id} name={product.name} priceMinor={priceMinor} currency={product.currency || store.currency} stock={product.stockQuantity} />
        ) : (
          <p className="text-sm leading-6">Bulk orders start at 50 bottles. There are not enough bottles in stock for that right now.</p>
        )}
      </div>
    </div>
  );
}
