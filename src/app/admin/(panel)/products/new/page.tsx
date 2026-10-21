import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr/ArrowLeft";
import { ProductEditor } from "@/components/admin/product-editor";
import { PageHeader } from "@/components/admin/ui";
import { getStore } from "@/lib/db";
import { live } from "@/lib/live";

export const instant = false;

export default async function NewProductPage() {
  await live();
  const store = await getStore();
  return (
    <div className="grid gap-6">
      <div>
        <Link href="/admin/products" className="inline-flex min-h-10 items-center gap-1.5 text-sm text-muted hover:text-ink">
          <ArrowLeft size={16} aria-hidden="true" />
          Products
        </Link>
        <PageHeader title="New product" description="Save the product first, then add photos." />
      </div>
      <ProductEditor product={null} currency={store.currency} />
    </div>
  );
}
