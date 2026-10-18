import { notFound } from "next/navigation";
import { removeImageAction, uploadImageAction } from "@/app/actions/admin";
import { ProductEditor } from "@/components/admin/product-editor";
import { getProductById, getStore } from "@/lib/db";
import { live } from "@/lib/live";
import { IMAGE_ROLES } from "@/lib/types";

export const instant = false;

export default async function EditProductPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ notice?: string }> }) {
  await live();
  const { id } = await params;
  const { notice } = await searchParams;
  const product = await getProductById(id);
  if (!product) notFound();
  const store = await getStore();
  return (
    <div className="grid gap-10">
      <div>
        {notice ? <p className="mb-4 rounded-[10px] bg-[#f8f1e6] px-3 py-2 text-sm">{notice}</p> : null}
      <h1 className="mb-6 font-display text-4xl">Edit product</h1>
        <ProductEditor product={product} currency={store.currency} />
      </div>
      <section>
        <h2 className="font-display text-3xl">Images</h2>
        <p className="mt-2 text-sm text-muted">Upload photographs when they are available. Empty frames on the storefront stay labeled as placeholders.</p>
        <ul className="mt-4 grid gap-3">
          {product.images.map((image) => (
            <li key={image.id} className="flex flex-wrap items-center gap-3 text-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image.src} alt={image.alt} className="h-16 w-16 rounded-[8px] object-cover" />
              <span>{image.role}</span>
              <span>{image.alt}</span>
              <form action={removeImageAction}>
                <input type="hidden" name="productId" value={product.id} />
                <input type="hidden" name="imageId" value={image.id} />
                <button className="min-h-11 underline">Remove</button>
              </form>
            </li>
          ))}
        </ul>
        <form action={uploadImageAction} className="mt-4 grid gap-3">
          <input type="hidden" name="productId" value={product.id} />
          <input type="file" name="file" accept="image/jpeg,image/png,image/webp,image/gif" required className="text-sm" />
          <input name="alt" placeholder="Alt text" className="min-h-11 rounded-[10px] border border-line px-3" />
          <select name="role" className="min-h-11 rounded-[10px] border border-line px-3">
            {IMAGE_ROLES.map((role) => <option key={role} value={role}>{role}</option>)}
          </select>
          <button className="min-h-11 w-fit rounded-[10px] bg-pine px-4 text-paper">Upload image</button>
        </form>
      </section>
    </div>
  );
}
