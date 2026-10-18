import Link from "next/link";
import { listProducts } from "@/lib/db";
import { live } from "@/lib/live";
import { formatMoney } from "@/lib/money";

export const instant = false;

export default async function ProductsPage() {
  await live();
  const products = await listProducts();
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-display text-4xl">Products</h1>
        <Link href="/admin/products/new" className="inline-flex min-h-11 items-center rounded-full bg-pine px-5 text-sm text-paper hover:bg-pine-dark">New product</Link>
      </div>
      <ul className="mt-6 divide-y divide-line overflow-hidden rounded-[20px] border border-line bg-surface shadow-soft">
        {products.map((product) => (
          <li key={product.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 text-sm">
            <Link href={`/admin/products/${product.id}`} className="font-medium">{product.name}</Link>
            <span>{product.status.replaceAll("_", " ")}</span>
            <span>{product.priceMinor == null ? "No price" : formatMoney(product.priceMinor, product.currency)}</span>
            <span>Stock {product.stockQuantity}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
