"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus } from "@phosphor-icons/react/dist/ssr/Plus";
import { X } from "@phosphor-icons/react/dist/ssr/X";
import { saveProductAction } from "@/app/actions/admin";
import { Card, Check, Label, Notice, buttonClass, field, textarea } from "@/components/admin/ui";
import { majorToMinor, minorToMajorInput } from "@/lib/money";
import type { LabeledText, Instruction, Product, ProductVariant } from "@/lib/types";

export function ProductEditor({ product, currency }: { product: Product | null; currency: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [variants, setVariants] = useState<ProductVariant[]>(product?.variants ?? []);
  const [specs, setSpecs] = useState<LabeledText[]>(product?.specs ?? []);
  const [benefits, setBenefits] = useState<LabeledText[]>(product?.benefits ?? []);
  const [instructions, setInstructions] = useState<Instruction[]>(product?.instructions ?? []);

  return (
    <form
      className="grid gap-6"
      onSubmit={async (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        setPending(true);
        setError("");
        const result = await saveProductAction({
          id: product?.id,
          name: String(data.get("name") || ""),
          slug: String(data.get("slug") || ""),
          shortDescription: String(data.get("shortDescription") || ""),
          description: String(data.get("description") || ""),
          priceMinor: majorToMinor(String(data.get("price") || "")),
          compareAtPriceMinor: majorToMinor(String(data.get("compare") || "")),
          sku: String(data.get("sku") || ""),
          stockQuantity: Number(data.get("stock") || 0),
          lowStockThreshold: Number(data.get("low") || 5),
          status: String(data.get("status") || "draft"),
          featured: data.get("featured") === "on",
          category: String(data.get("category") || ""),
          specs: specs.filter((item) => item.label.trim()),
          benefits: benefits.filter((item) => item.label.trim()),
          instructions: instructions.filter((item) => item.title.trim()),
          variants: variants.filter((item) => item.name.trim()),
          seoTitle: String(data.get("seoTitle") || ""),
          seoDescription: String(data.get("seoDescription") || ""),
        });
        setPending(false);
        if (!result.ok) {
          setError(result.error);
          return;
        }
        router.push(`/admin/products/${result.id}?notice=${encodeURIComponent("Product saved.")}`);
        router.refresh();
      }}
    >
      <Card title="Price and stock">
        <div className="grid gap-4 sm:grid-cols-2">
          <Label label={`Price (${currency})`}>
            <input name="price" inputMode="decimal" defaultValue={minorToMajorInput(product?.priceMinor)} placeholder="0.00" className={field} />
          </Label>
          <Label label="Old price" hint="Optional. Shown crossed out next to the price.">
            <input name="compare" inputMode="decimal" defaultValue={minorToMajorInput(product?.compareAtPriceMinor)} className={field} />
          </Label>
          <Label label="In stock">
            <input name="stock" type="number" min={0} defaultValue={product?.stockQuantity ?? 0} className={field} />
          </Label>
          <Label label="Warn me when stock reaches">
            <input name="low" type="number" min={0} defaultValue={product?.lowStockThreshold ?? 5} className={field} />
          </Label>
          <Label label="Status">
            <select name="status" defaultValue={product?.status || "draft"} className={field}>
              <option value="published">On sale</option>
              <option value="coming_soon">Coming soon</option>
              <option value="unavailable">Temporarily unavailable</option>
              <option value="draft">Draft (hidden)</option>
            </select>
          </Label>
          <div className="flex items-end">
            <Check name="featured" label="Feature on the homepage" defaultChecked={product?.featured} />
          </div>
        </div>
      </Card>

      <Card title="Description">
        <div className="grid gap-4">
          <Label label="Name">
            <input name="name" required defaultValue={product?.name} className={field} />
          </Label>
          <Label label="Short description" hint="One or two sentences, shown near the price.">
            <textarea name="shortDescription" defaultValue={product?.shortDescription} className={textarea} />
          </Label>
          <Label label="Full description">
            <textarea name="description" defaultValue={product?.description} className={`${textarea} min-h-40`} />
          </Label>
          <div className="grid gap-4 sm:grid-cols-2">
            <Label label="Category">
              <input name="category" defaultValue={product?.category} className={field} />
            </Label>
            <Label label="SKU" hint="Optional stock code.">
              <input name="sku" defaultValue={product?.sku} className={field} />
            </Label>
          </div>
        </div>
      </Card>

      <Card title="How to use" description="Only add steps the manufacturer has confirmed.">
        <div className="grid gap-3">
          {instructions.map((step, index) => (
            <div key={index} className="grid gap-2 rounded-lg border border-line bg-paper/50 p-3">
              <div className="flex items-center gap-2">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-mist text-xs font-medium text-pine">{index + 1}</span>
                <input value={step.title} onChange={(event) => setInstructions(instructions.map((item, itemIndex) => (itemIndex === index ? { ...item, title: event.target.value } : item)))} placeholder="Step title" aria-label={`Step ${index + 1} title`} className={field} />
                <RemoveButton label={`Remove step ${index + 1}`} onClick={() => setInstructions(instructions.filter((_, itemIndex) => itemIndex !== index))} />
              </div>
              <textarea value={step.body} onChange={(event) => setInstructions(instructions.map((item, itemIndex) => (itemIndex === index ? { ...item, body: event.target.value } : item)))} aria-label={`Step ${index + 1} details`} className={textarea} />
            </div>
          ))}
          <AddButton onClick={() => setInstructions([...instructions, { title: "", body: "" }])}>Add step</AddButton>
        </div>
      </Card>

      <PairList title="Details" description="Short facts such as size or scent." rows={specs} onChange={setSpecs} />
      <PairList title="Benefits" rows={benefits} onChange={setBenefits} />

      <Card title="Options" description="Different sizes or scents. Leave empty to sell one version at the price above.">
        <div className="grid gap-3">
          {variants.map((variant, index) => (
            <div key={variant.id} className="grid gap-3 rounded-lg border border-line bg-paper/50 p-3 sm:grid-cols-2">
              <Label label="Name"><input value={variant.name} onChange={(event) => update(setVariants, index, { name: event.target.value })} className={field} /></Label>
              <Label label="Price"><input inputMode="decimal" value={minorToMajorInput(variant.priceMinor)} onChange={(event) => update(setVariants, index, { priceMinor: majorToMinor(event.target.value) })} className={field} /></Label>
              <Label label="In stock"><input type="number" min={0} value={variant.stockQuantity} onChange={(event) => update(setVariants, index, { stockQuantity: Number(event.target.value) || 0 })} className={field} /></Label>
              <Label label="SKU"><input value={variant.sku} onChange={(event) => update(setVariants, index, { sku: event.target.value })} className={field} /></Label>
              <label className="flex min-h-11 items-center gap-2.5 text-sm">
                <input type="checkbox" checked={variant.available} onChange={(event) => update(setVariants, index, { available: event.target.checked })} className="size-4 accent-pine" />
                Available
              </label>
              <button type="button" className="min-h-11 justify-self-end text-sm text-danger underline-offset-4 hover:underline" onClick={() => setVariants(variants.filter((_, item) => item !== index))}>Remove option</button>
            </div>
          ))}
          <AddButton onClick={() => setVariants([...variants, { id: crypto.randomUUID(), name: "", sku: "", priceMinor: null, compareAtPriceMinor: null, stockQuantity: 0, available: true }])}>Add option</AddButton>
        </div>
      </Card>

      <Card title="Search engines" description="How the product appears in Google results.">
        <div className="grid gap-4">
          <Label label="Page title" hint="Up to 70 characters.">
            <input name="seoTitle" maxLength={70} defaultValue={product?.seoTitle} className={field} />
          </Label>
          <Label label="Description" hint="Up to 180 characters.">
            <textarea name="seoDescription" maxLength={180} defaultValue={product?.seoDescription} className={textarea} />
          </Label>
          <Label label="Web address" hint="The part after /product/. Changing it breaks links people have already shared.">
            <input name="slug" defaultValue={product?.slug} className={field} />
          </Label>
        </div>
      </Card>

      <div className="sticky bottom-0 z-10 -mx-4 grid gap-3 border-t border-line bg-paper/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-xl sm:border sm:px-5">
        {error ? <Notice tone="warn">{error}</Notice> : null}
        <button disabled={pending} className={buttonClass("primary", "w-full sm:w-fit")}>{pending ? "Saving…" : "Save product"}</button>
      </div>
    </form>
  );
}

function update<T>(setter: React.Dispatch<React.SetStateAction<T[]>>, index: number, patch: Partial<T>) {
  setter((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)));
}

function AddButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className={buttonClass("secondary", "w-fit")}>
      <Plus size={16} weight="bold" aria-hidden="true" />
      {children}
    </button>
  );
}

function RemoveButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" aria-label={label} onClick={onClick} className="inline-flex size-11 shrink-0 items-center justify-center rounded-md text-muted hover:bg-stone hover:text-danger">
      <X size={18} aria-hidden="true" />
    </button>
  );
}

function PairList({ title, description, rows, onChange }: { title: string; description?: string; rows: LabeledText[]; onChange: (rows: LabeledText[]) => void }) {
  return (
    <Card title={title} description={description}>
      <div className="grid gap-3">
        {rows.map((row, index) => (
          <div key={index} className="flex items-start gap-2">
            <div className="grid flex-1 gap-2 sm:grid-cols-[1fr_2fr]">
              <input value={row.label} onChange={(event) => onChange(rows.map((item, itemIndex) => (itemIndex === index ? { ...item, label: event.target.value } : item)))} placeholder="Label" aria-label={`${title} ${index + 1} label`} className={field} />
              <input value={row.value} onChange={(event) => onChange(rows.map((item, itemIndex) => (itemIndex === index ? { ...item, value: event.target.value } : item)))} placeholder="Value" aria-label={`${title} ${index + 1} value`} className={field} />
            </div>
            <RemoveButton label={`Remove ${title.toLowerCase()} ${index + 1}`} onClick={() => onChange(rows.filter((_, itemIndex) => itemIndex !== index))} />
          </div>
        ))}
        <AddButton onClick={() => onChange([...rows, { label: "", value: "" }])}>Add row</AddButton>
      </div>
    </Card>
  );
}
