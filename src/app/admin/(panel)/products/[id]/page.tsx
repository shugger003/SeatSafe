import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr/ArrowLeft";
import { ArrowSquareOut } from "@phosphor-icons/react/dist/ssr/ArrowSquareOut";
import { removeImageAction, uploadImageAction } from "@/app/actions/admin";
import { ProductEditor } from "@/components/admin/product-editor";
import { Card, Label, Notice, PageHeader, SubmitButton, buttonClass, field } from "@/components/admin/ui";
import { getProductById, getStore } from "@/lib/db";
import { live } from "@/lib/live";
import { IMAGE_ROLES } from "@/lib/types";

export const instant = false;

const ROLE_LABELS: Record<string, string> = {
  primary: "Main photo",
  angle: "Another angle",
  packaging: "Packaging",
  lifestyle: "In use",
  instruction: "How to use",
};

export default async function EditProductPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ notice?: string }> }) {
  await live();
  const { id } = await params;
  const { notice } = await searchParams;
  const product = await getProductById(id);
  if (!product) notFound();
  const store = await getStore();
  return (
    <div className="grid gap-6">
      <div>
        <Link href="/admin/products" className="inline-flex min-h-10 items-center gap-1.5 text-sm text-muted hover:text-ink">
          <ArrowLeft size={16} aria-hidden="true" />
          Products
        </Link>
        <PageHeader
          title={product.name}
          actions={
            <a href={`/product/${product.slug}`} target="_blank" rel="noopener noreferrer" className={buttonClass("secondary")}>
              <ArrowSquareOut size={16} aria-hidden="true" />
              View on store
            </a>
          }
        />
      </div>
      {notice ? <Notice>{notice}</Notice> : null}

      <Card id="photos" title="Photos" description="The main photo shows first on the store. JPEG, PNG, or WEBP, up to 5 MB.">
        {product.images.length > 0 ? (
          <ul className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {product.images.map((image) => (
              <li key={image.id} className="overflow-hidden rounded-lg border border-line bg-paper">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image.src} alt={image.alt} className="aspect-square w-full object-cover" />
                <div className="flex items-center justify-between gap-2 p-2 text-xs">
                  <span className="truncate text-muted">{ROLE_LABELS[image.role] ?? image.role}</span>
                  <form action={removeImageAction}>
                    <input type="hidden" name="productId" value={product.id} />
                    <input type="hidden" name="imageId" value={image.id} />
                    <button className="min-h-9 px-1 text-danger underline-offset-4 hover:underline">Remove</button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        ) : null}
        <form action={uploadImageAction} className="grid gap-4 sm:grid-cols-2">
          <input type="hidden" name="productId" value={product.id} />
          <Label label="Photo" className="sm:col-span-2">
            <input type="file" name="file" accept="image/jpeg,image/png,image/webp,image/gif" required className="text-sm file:mr-3 file:min-h-10 file:rounded-md file:border-0 file:bg-mist file:px-4 file:text-sm file:font-medium file:text-pine" />
          </Label>
          <Label label="Describe the photo" hint="Read aloud to people using screen readers.">
            <input name="alt" placeholder={`${product.name} bottle`} className={field} />
          </Label>
          <Label label="Type">
            <select name="role" className={field}>
              {IMAGE_ROLES.map((role) => <option key={role} value={role}>{ROLE_LABELS[role] ?? role}</option>)}
            </select>
          </Label>
          <div className="sm:col-span-2">
            <SubmitButton>Upload photo</SubmitButton>
          </div>
        </form>
      </Card>

      <ProductEditor product={product} currency={store.currency} />
    </div>
  );
}
