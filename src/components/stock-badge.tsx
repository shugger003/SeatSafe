import { cn } from "@/lib/cn";

export function StockBadge({ inStock, label, className }: { inStock: boolean; label?: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
        inStock ? "bg-[#dcf3e3] text-[#166534]" : "bg-line text-muted",
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", inStock ? "bg-[#16a34a]" : "bg-muted")} aria-hidden="true" />
      {label ?? (inStock ? "In stock" : "Out of stock")}
    </span>
  );
}
