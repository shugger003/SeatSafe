import { ProductEditor } from "@/components/admin/product-editor";
import { getStore } from "@/lib/db";
import { live } from "@/lib/live";

export const instant = false;

export default async function NewProductPage() {
  await live();
  const store = await getStore();
  return (
    <div>
      <h1 className="mb-6 font-display text-4xl">New product</h1>
      <ProductEditor product={null} currency={store.currency} />
    </div>
  );
}
