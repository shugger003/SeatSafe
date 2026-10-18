"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { saveProductAction } from "@/app/actions/admin";
import { majorToMinor, minorToMajorInput } from "@/lib/money";
import type { LabeledText, Instruction, Product, ProductVariant } from "@/lib/types";

const field = "min-h-11 w-full rounded-[10px] border border-line bg-surface px-3";

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
      className="grid gap-4"
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
        router.push(`/admin/products/${result.id}`);
        router.refresh();
      }}
    >
      {error ? <p className="rounded-[10px] bg-[#f8f1e6] px-3 py-2 text-sm">{error}</p> : null}
      <label className="grid gap-1 text-sm">Name<input name="name" required defaultValue={product?.name} className={field} /></label>
      <label className="grid gap-1 text-sm">Slug<input name="slug" defaultValue={product?.slug} className={field} /></label>
      <label className="grid gap-1 text-sm">Short description<textarea name="shortDescription" defaultValue={product?.shortDescription} className={`${field} min-h-20 py-2`} /></label>
      <label className="grid gap-1 text-sm">Description<textarea name="description" defaultValue={product?.description} className={`${field} min-h-36 py-2`} /></label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1 text-sm">Price ({currency})<input name="price" defaultValue={minorToMajorInput(product?.priceMinor)} placeholder="0.00" className={field} /></label>
        <label className="grid gap-1 text-sm">Comparison price<input name="compare" defaultValue={minorToMajorInput(product?.compareAtPriceMinor)} placeholder="Optional" className={field} /></label>
        <label className="grid gap-1 text-sm">SKU<input name="sku" defaultValue={product?.sku} className={field} /></label>
        <label className="grid gap-1 text-sm">Stock<input name="stock" type="number" min={0} defaultValue={product?.stockQuantity ?? 0} className={field} /></label>
        <label className="grid gap-1 text-sm">Low-stock threshold<input name="low" type="number" min={0} defaultValue={product?.lowStockThreshold ?? 5} className={field} /></label>
        <label className="grid gap-1 text-sm">Category<input name="category" defaultValue={product?.category} className={field} /></label>
      </div>
      <label className="grid gap-1 text-sm">Status
        <select name="status" defaultValue={product?.status || "draft"} className={field}>
          <option value="draft">Draft</option>
          <option value="coming_soon">Coming soon</option>
          <option value="published">Published</option>
          <option value="unavailable">Temporarily unavailable</option>
        </select>
      </label>
      <label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" name="featured" defaultChecked={product?.featured} /> Featured</label>
      <Repeater title="Options" hint="Leave empty to sell one version at the price above.">
        {variants.map((variant, index) => (
          <div key={variant.id} className="grid gap-2 rounded-[10px] border border-line p-3 sm:grid-cols-2">
            <input value={variant.name} onChange={(event) => update(setVariants, index, { name: event.target.value })} placeholder="Name" className={field} />
            <input value={variant.sku} onChange={(event) => update(setVariants, index, { sku: event.target.value })} placeholder="SKU" className={field} />
            <input value={minorToMajorInput(variant.priceMinor)} onChange={(event) => update(setVariants, index, { priceMinor: majorToMinor(event.target.value) })} placeholder="Price" className={field} />
            <input type="number" min={0} value={variant.stockQuantity} onChange={(event) => update(setVariants, index, { stockQuantity: Number(event.target.value) || 0 })} className={field} />
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={variant.available} onChange={(event) => update(setVariants, index, { available: event.target.checked })} /> Available</label>
            <button type="button" className="text-sm underline" onClick={() => setVariants(variants.filter((_, item) => item !== index))}>Remove</button>
          </div>
        ))}
        <button type="button" className="text-sm underline" onClick={() => setVariants([...variants, { id: crypto.randomUUID(), name: "", sku: "", priceMinor: null, compareAtPriceMinor: null, stockQuantity: 0, available: true }])}>Add option</button>
      </Repeater>
      <PairList title="Specifications" rows={specs} onChange={setSpecs} />
      <PairList title="Product benefits" rows={benefits} onChange={setBenefits} />
      <Repeater title="Usage steps" hint="Publish only the manufacturer’s instructions.">
        {instructions.map((step, index) => (
          <div key={`${step.title}-${index}`} className="grid gap-2">
            <input value={step.title} onChange={(event) => setInstructions(instructions.map((item, itemIndex) => itemIndex === index ? { ...item, title: event.target.value } : item))} placeholder="Step title" className={field} />
            <textarea value={step.body} onChange={(event) => setInstructions(instructions.map((item, itemIndex) => itemIndex === index ? { ...item, body: event.target.value } : item))} className={`${field} min-h-20 py-2`} />
          </div>
        ))}
        <button type="button" className="text-sm underline" onClick={() => setInstructions([...instructions, { title: "", body: "" }])}>Add step</button>
      </Repeater>
      <label className="grid gap-1 text-sm">SEO title<input name="seoTitle" defaultValue={product?.seoTitle} className={field} /></label>
      <label className="grid gap-1 text-sm">SEO description<textarea name="seoDescription" defaultValue={product?.seoDescription} className={`${field} min-h-20 py-2`} /></label>
      <button disabled={pending} className="min-h-11 rounded-[10px] bg-pine px-4 text-paper disabled:opacity-50">{pending ? "Saving…" : "Save product"}</button>
    </form>
  );
}

function update<T>(setter: React.Dispatch<React.SetStateAction<T[]>>, index: number, patch: Partial<T>) {
  setter((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)));
}

function Repeater({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-3 rounded-[16px] border border-line p-4">
      <h2 className="font-display text-2xl">{title}</h2>
      {hint ? <p className="text-sm text-muted">{hint}</p> : null}
      {children}
    </section>
  );
}

function PairList({ title, rows, onChange }: { title: string; rows: LabeledText[]; onChange: (rows: LabeledText[]) => void }) {
  return (
    <Repeater title={title}>
      {rows.map((row, index) => (
        <div key={index} className="grid gap-2 sm:grid-cols-2">
          <input value={row.label} onChange={(event) => onChange(rows.map((item, itemIndex) => itemIndex === index ? { ...item, label: event.target.value } : item))} placeholder="Label" className={field} />
          <input value={row.value} onChange={(event) => onChange(rows.map((item, itemIndex) => itemIndex === index ? { ...item, value: event.target.value } : item))} placeholder="Value" className={field} />
        </div>
      ))}
      <button type="button" className="text-sm underline" onClick={() => onChange([...rows, { label: "", value: "" }])}>Add row</button>
    </Repeater>
  );
}
