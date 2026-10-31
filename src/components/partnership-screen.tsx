import Link from "next/link";
import { PartnershipForm } from "@/components/partnership-form";
import { catalogCached, getStore, listPublicProducts } from "@/lib/db";
import { PARTNERSHIPS, type PartnershipId } from "@/lib/partnerships";

export async function PartnershipScreen({ id }: { id: PartnershipId }) {
  const page = PARTNERSHIPS[id];
  const [store, catalog] = await Promise.all([
    catalogCached("store", getStore),
    catalogCached("public-products-1", () => listPublicProducts({ pageSize: 1 })),
  ]);
  const product = catalog.products[0];

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[1fr_1.05fr] lg:items-start">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-clay">Company</p>
        <h1 className="mt-2 font-display text-5xl leading-tight">{page.title}</h1>
        <p className="mt-4 max-w-xl text-lg leading-8">{page.lead}</p>
        <p className="mt-4 max-w-xl leading-7 text-muted">{page.detail}</p>
        <p className="mt-4 max-w-xl text-sm leading-6">{page.caveat}</p>
        <p className="mt-6 text-sm">
          {product ? (
            <Link href={`/product/${product.slug}`} className="underline underline-offset-4">
              {product.name}
            </Link>
          ) : null}
          {product ? <span className="text-muted"> \u00b7 </span> : null}
          <Link href="/shop" className="underline underline-offset-4">
            {page.shop}
          </Link>
        </p>
        {store.phone || store.email ? (
          <dl className="mt-8 space-y-3 text-sm">
            {store.phone ? (
              <div>
                <dt className="font-medium">Phone</dt>
                <dd>
                  <a href={`tel:${store.phone.replace(/\\s+/g, "")}`}>{store.phone}</a>
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
        <PartnershipForm kind={id} />
      </div>
    </div>
  );
}
