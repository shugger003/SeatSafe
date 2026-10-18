import { saveDiscountAction } from "@/app/actions/admin";
import { listDiscounts } from "@/lib/db";
import { live } from "@/lib/live";
import { minorToMajorInput } from "@/lib/money";

export const instant = false;

export default async function DiscountsPage({ searchParams }: { searchParams: Promise<{ notice?: string }> }) {
  await live();
  const { notice } = await searchParams;
  const discounts = await listDiscounts();
  return (
    <div className="grid gap-8">
      {notice ? <p className="rounded-[10px] bg-[#f8f1e6] px-3 py-2 text-sm">{notice}</p> : null}
      <h1 className="font-display text-4xl">Discount codes</h1>
      <form action={saveDiscountAction} className="grid gap-3 rounded-[16px] border border-line p-4">
        <input name="code" required placeholder="CODE" className="min-h-11 rounded-[10px] border border-line px-3 uppercase" />
        <select name="type" className="min-h-11 rounded-[10px] border border-line px-3"><option value="percent">Percent</option><option value="fixed">Fixed amount</option></select>
        <input name="value" required placeholder="10 or 10.00" className="min-h-11 rounded-[10px] border border-line px-3" />
        <input name="minimum" placeholder="Minimum order, 0.00" className="min-h-11 rounded-[10px] border border-line px-3" />
        <input name="usageLimit" placeholder="Usage limit, blank for none" className="min-h-11 rounded-[10px] border border-line px-3" />
        <input name="expiresAt" type="datetime-local" className="min-h-11 rounded-[10px] border border-line px-3" />
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="active" defaultChecked /> Active</label>
        <button className="min-h-11 w-fit rounded-[10px] bg-pine px-4 text-paper">Save code</button>
      </form>
      <ul className="divide-y divide-line border-y border-line text-sm">
        {discounts.map((discount) => (
          <li key={discount.id} className="py-3">{discount.code} · {discount.type} · {discount.type === "percent" ? `${discount.value}%` : minorToMajorInput(discount.value)} · used {discount.usedCount}{discount.usageLimit != null ? ` / ${discount.usageLimit}` : ""} · {discount.active ? "active" : "inactive"}</li>
        ))}
      </ul>
    </div>
  );
}
