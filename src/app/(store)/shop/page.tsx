import type { Metadata } from "next";
import Link from "next/link";
import { availabilityLabel } from "@/components/product-card";
import { ProductMedia } from "@/components/product-media";
import { StockBadge } from "@/components/stock-badge";
import { Price } from "@/components/ui";
import { displayPrice } from "@/lib/commerce";
import { listPublicProducts } from "@/lib/db";
import { live } from "@/lib/live";

export const instant = false;

export const metadata: Metadata = {
  title: "Shop",
  description: "Browse published toilet seat sanitizer products.",
  alternates: { canonical: "/shop" },
};

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ q?: string; sort?: string; page?: string }> }) {
  await live();
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const result = await listPublicProducts({ q: params.q, sort: params.sort, page });
  const pages = Math.max(1, Math.ceil(result.total / result.pageSize));

  return (
    <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-clay">Catalog</p>
      <h1 className="mt-2 font-display text-5xl sm:text-6xl">Shop</h1>
      <form className="mt-6 grid grid-cols-[minmax(0,1fr)_auto] gap-3 sm:flex" action="/shop">
        <label className="sr-only" htmlFor="q">Search products</label>
        <input id="q" name="q" defaultValue={params.q} placeholder="Search" className="col-span-2 min-h-11 flex-1 rounded-[10px] border border-line bg-surface px-3" />
        <select name="sort" defaultValue={params.sort || "featured"} className="min-h-11 min-w-0 rounded-[10px] border border-line bg-surface px-3" aria-label="Sort">
          <option value="featured">Featured</option>
          <option value="newest">Newest</option>
          <option value="name">Name</option>
          <option value="price_asc">Price, low to high</option>
          <option value="price_desc">Price, high to low</option>
        </select>
        <button className="min-h-11 rounded-[10px] bg-pine px-5 text-paper">Apply</button>
      </form>
      {result.products.length === 0 ? (
        <p className="mt-10 text-muted">No published products match this search.</p>
      ) : (
        <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {result.products.map((product) => (
            <li key={product.id} className="rounded-[22px] border border-line bg-surface p-3 shadow-soft transition-transform duration-200 hover:-translate-y-0.5">
              <Link href={`/product/${product.slug}`}>
                <ProductMedia src={product.images[0]?.src} alt={product.images[0]?.alt || `${product.name} image placeholder`} />
                <h2 className="mt-4 font-display text-2xl">{product.name}</h2>
              </Link>
              <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted">{product.shortDescription}</p>
              <StockBadge inStock={availabilityLabel(product) === "In stock"} label={availabilityLabel(product)} className="mt-3" />
              <p className="mt-1"><Price minor={displayPrice(product)} currency={product.currency} compare={product.variants.length ? null : product.compareAtPriceMinor} /></p>
            </li>
          ))}
        </ul>
      )}
      {pages > 1 ? (
        <nav className="mt-8 flex gap-3 text-sm" aria-label="Pagination">
          {page > 1 ? <Link href={`/shop?page=${page - 1}&q=${params.q || ""}&sort=${params.sort || "featured"}`}>Previous</Link> : null}
          <span>Page {page} of {pages}</span>
          {page < pages ? <Link href={`/shop?page=${page + 1}&q=${params.q || ""}&sort=${params.sort || "featured"}`}>Next</Link> : null}
        </nav>
      ) : null}
    </div>
  );
}
