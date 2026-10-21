import Link from "next/link";
import { Plus } from "@phosphor-icons/react/dist/ssr/Plus";
import { Badge, EmptyRow, PageHeader, buttonClass } from "@/components/admin/ui";
import { cn } from "@/lib/cn";
import { listProducts } from "@/lib/db";
import { live } from "@/lib/live";
import { formatMoney } from "@/lib/money";
import type { ProductStatus } from "@/lib/types";

export const instant = false;

const STATUS: Record<ProductStatus, [string, "green" | "amber" | "grey" | "red"]> = {
  published: ["On sale", "green"],
  coming_soon: ["Coming soon", "amber"],
  draft: ["Draft", "grey"],
  unavailable: ["Unavailable", "red"],
};

export default async function ProductsPage() {
  await live();
  const products = await listProducts();
  return (
    <div className="grid gap-6">
      <PageHeader
        title="Products"
        actions={
          <Link href="/admin/products/new" className={buttonClass("primary")}>
            <Plus size={16} weight="bold" aria-hidden="true" />
            New product
          </Link>
        }
      />
      {products.length === 0 ? (
        <EmptyRow>No products yet.</EmptyRow>
      ) : (
        <ul className="grid gap-3">
          {products.map((product) => {
            const [label, tone] = STATUS[product.status] ?? [product.status, "grey"];
            const low = product.stockQuantity <= product.lowStockThreshold;
            return (
              <li key={product.id}>
                <Link href={`/admin/products/${product.id}`} className="flex items-center gap-4 rounded-xl border border-line bg-surface p-3 transition-colors hover:border-pine/50 sm:p-4">
                  <span className="size-16 shrink-0 overflow-hidden rounded-lg bg-stone sm:size-20">
                    {product.images[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={product.images[0].src} alt="" className="size-full object-cover" />
                    ) : null}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium">{product.name}</span>
                    <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
                      <Badge tone={tone}>{label}</Badge>
                      <span className="tabular-nums">{product.priceMinor == null ? "No price" : formatMoney(product.priceMinor, product.currency)}</span>
                      <span className={cn("tabular-nums", low && "font-medium text-danger")}>{product.stockQuantity} in stock</span>
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
