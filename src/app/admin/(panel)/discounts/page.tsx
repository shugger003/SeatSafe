import { saveDiscountAction } from "@/app/actions/admin";
import { Badge, Card, Check, EmptyRow, Label, Notice, PageHeader, SubmitButton, field } from "@/components/admin/ui";
import { getStore, listDiscounts } from "@/lib/db";
import { live } from "@/lib/live";
import { formatMoney, formatWhen } from "@/lib/money";

export const instant = false;

export default async function DiscountsPage({ searchParams }: { searchParams: Promise<{ notice?: string }> }) {
  await live();
  const { notice } = await searchParams;
  const discounts = await listDiscounts();
  const store = await getStore();
  return (
    <div className="grid gap-6">
      <PageHeader title="Discount codes" description="Customers enter these in the cart. Saving a code that already exists updates it." />
      {notice ? <Notice tone={notice.endsWith("saved.") ? "success" : "warn"}>{notice}</Notice> : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <Card title="Create or update a code">
          <form action={saveDiscountAction} className="grid gap-4">
            <Label label="Code" hint="3 to 24 letters, numbers, or hyphens.">
              <input name="code" required placeholder="WELCOME10" className={`${field} uppercase`} />
            </Label>
            <div className="grid gap-4 sm:grid-cols-2">
              <Label label="Type">
                <select name="type" className={field}>
                  <option value="percent">Percentage off</option>
                  <option value="fixed">Amount off ({store.currency})</option>
                </select>
              </Label>
              <Label label="Value" hint="10 means 10% or 10.00.">
                <input name="value" required inputMode="decimal" className={field} />
              </Label>
              <Label label="Minimum order" hint="Optional">
                <input name="minimum" inputMode="decimal" placeholder="0.00" className={field} />
              </Label>
              <Label label="Times it can be used" hint="Blank for unlimited">
                <input name="usageLimit" type="number" min={1} className={field} />
              </Label>
            </div>
            <Label label="Expires" hint="Optional">
              <input name="expiresAt" type="datetime-local" className={field} />
            </Label>
            <Check name="active" label="Active" defaultChecked />
            <SubmitButton className="w-fit">Save code</SubmitButton>
          </form>
        </Card>

        <Card title="Your codes">
          {discounts.length === 0 ? (
            <EmptyRow>No discount codes yet.</EmptyRow>
          ) : (
            <ul className="divide-y divide-line">
              {discounts.map((discount) => {
                const expired = hasExpired(discount.expiresAt);
                const usedUp = discount.usageLimit != null && discount.usedCount >= discount.usageLimit;
                return (
                  <li key={discount.id} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0">
                    <div>
                      <p className="font-mono text-sm font-medium tracking-wide">{discount.code}</p>
                      <p className="text-xs text-muted">
                        {discount.type === "percent" ? `${discount.value}% off` : `${formatMoney(discount.value, store.currency)} off`}
                        {` · used ${discount.usedCount}${discount.usageLimit != null ? ` of ${discount.usageLimit}` : ""}`}
                        {discount.expiresAt ? ` · ends ${formatWhen(discount.expiresAt, store.timezone)}` : ""}
                      </p>
                    </div>
                    {!discount.active ? <Badge tone="grey">Off</Badge> : expired ? <Badge tone="grey">Expired</Badge> : usedUp ? <Badge tone="amber">Used up</Badge> : <Badge tone="green">Active</Badge>}
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

function hasExpired(iso: string | null) {
  return iso ? new Date(iso).getTime() < Date.now() : false;
}
