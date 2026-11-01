import { cn } from "@/lib/cn";

export function stockLabel(quantity: number) {
  if (quantity <= 0) return "Out of stock";
  const amount = String(Math.trunc(quantity)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${amount} in stock`;
}

export function StockBadge({ inStock, label, className }: { inStock: boolean; label?: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium tabular-nums",
        inStock ? "bg-mist text-pine-dark" : "bg-line text-muted",
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", inStock ? "bg-pine" : "bg-muted")} aria-hidden="true" />
      {label ?? (inStock ? "In stock" : "Out of stock")}
    </span>
  );
}
