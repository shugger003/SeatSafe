import type { Metadata } from "next";
import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { EmptyState } from "@/components/ui";
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
  const query = params.q?.trim() || "";

  function hrefFor(nextPage: number) {
    const search = new URLSearchParams();
    if (query) search.set("q", query);
    if (params.sort && params.sort !== "featured") search.set("sort", params.sort);
    if (nextPage > 1) search.set("page", String(nextPage));
    const value = search.toString();
    return value ? `/shop?${value}` : "/shop";
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
      <h1 className="font-display text-5xl tracking-[-0.03em] sm:text-6xl">Shop</h1>
      <p className="mt-3 max-w-xl text-muted">Published products only. A price appears after the business confirms it.</p>
      <form className="mt-10 grid gap-4 sm:grid-cols-[minmax(0,1fr)_14rem_auto] sm:items-end" action="/shop">
        <label className="grid gap-1.5 text-sm" htmlFor="q">
          <span className="font-medium">Search</span>
          <input id="q" name="q" defaultValue={query} placeholder="Product name" className="field" />
        </label>
        <label className="grid gap-1.5 text-sm">
          <span className="font-medium">Sort</span>
          <select name="sort" defaultValue={params.sort || "featured"} className="field">
            <option value="featured">Featured</option>
            <option value="newest">Newest</option>
            <option value="name">Name</option>
            <option value="price_asc">Price, low to high</option>
            <option value="price_desc">Price, high to low</option>
          </select>
        </label>
        <button className="min-h-11 bg-ink px-5 text-paper transition-colors hover:bg-pine">Apply</button>
      </form>
      <p className="mt-6 text-sm text-muted">
        {result.total === 0 ? "No matches" : `${result.total} ${result.total === 1 ? "product" : "products"}`}
        {query ? ` for \u201c${query}\u201d` : ""}
      </p>
      {result.products.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title={query ? "Nothing matches that search" : "The catalog is still being prepared"}
            body={query ? "Try a shorter word, or clear the search to see everything that is published." : "Products appear here after they are published. Ordering stays closed until price and delivery are confirmed."}
            href={query ? "/shop" : "/contact"}
            action={query ? "Clear search" : "Ask a question"}
          />
        </div>
      ) : (
        <ul className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {result.products.map((product) => (
            <li key={product.id}>
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      )}
      {pages > 1 ? (
        <nav className="mt-10 flex items-center gap-4 text-sm" aria-label="Pagination">
          {page > 1 ? <Link href={hrefFor(page - 1)} className="underline underline-offset-4">Previous</Link> : <span className="text-muted">Previous</span>}
          <span className="tabular-nums">Page {page} of {pages}</span>
          {page < pages ? <Link href={hrefFor(page + 1)} className="underline underline-offset-4">Next</Link> : <span className="text-muted">Next</span>}
        </nav>
      ) : null}
    </div>
  );
}
