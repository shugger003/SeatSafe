import Link from "next/link";
import { cn } from "@/lib/cn";
import { formatMoney } from "@/lib/money";

export function Button({
  href,
  variant = "primary",
  type = "button",
  disabled,
  children,
  className,
  onClick,
}: {
  href?: string;
  variant?: "primary" | "secondary" | "quiet" | "danger";
  type?: "button" | "submit";
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  const classes = cn(
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-[10px] px-4 text-[0.95rem] font-medium transition-[transform,background-color,border-color] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] disabled:pointer-events-none disabled:opacity-50",
    variant === "primary" && "bg-pine text-paper hover:bg-pine-dark active:scale-[0.99]",
    variant === "secondary" && "border border-line bg-surface text-ink hover:border-ink/30",
    variant === "quiet" && "px-0 text-ink underline-offset-4 hover:underline",
    variant === "danger" && "bg-danger text-paper",
    className,
  );
  if (href) return <Link href={href} className={classes}>{children}</Link>;
  return (
    <button type={type} disabled={disabled} onClick={onClick} className={classes}>
      {children}
    </button>
  );
}

export function Price({
  minor,
  currency,
  compare,
  className,
}: {
  minor: number | null;
  currency: string;
  compare?: number | null;
  className?: string;
}) {
  if (minor == null) return <span className={cn("text-muted", className)}>Price to be confirmed</span>;
  const current = formatMoney(minor, currency);
  const previous = compare != null && compare > minor ? formatMoney(compare, currency) : null;
  return (
    <span className={cn("inline-flex items-baseline gap-2", className)}>
      <span className="font-medium tabular-nums">{current}</span>
      {previous ? <s className="text-sm text-muted">{previous}</s> : null}
    </span>
  );
}

export function Notice({ children, tone = "plain" }: { children: React.ReactNode; tone?: "plain" | "warn" }) {
  return (
    <p className={cn("rounded-[10px] border px-4 py-3 text-sm leading-6", tone === "warn" ? "border-clay/40 bg-[#f8f1e6] text-ink" : "border-line bg-surface text-muted")}>
      {children}
    </p>
  );
}

export function Prose({ text }: { text: string }) {
  const blocks = text.split(/\n{2,}/).map((block) => block.trim()).filter(Boolean);
  return (
    <div className="space-y-4 text-[1.05rem] leading-7 text-ink">
      {blocks.map((block, index) => {
        const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
        return (
          <div key={index} className="space-y-3">
            {lines.map((line, lineIndex) =>
              line.startsWith("# ") ? (
                <h2 key={lineIndex} className="font-display text-3xl leading-tight">
                  {line.slice(2)}
                </h2>
              ) : (
                <p key={lineIndex}>{line}</p>
              ),
            )}
          </div>
        );
      })}
    </div>
  );
}

export function EmptyState({ title, body, href, action }: { title: string; body: string; href?: string; action?: string }) {
  return (
    <div className="rounded-[16px] border border-dashed border-line bg-surface px-6 py-12 text-center">
      <h2 className="font-display text-3xl">{title}</h2>
      <p className="mx-auto mt-3 max-w-md text-muted">{body}</p>
      {href && action ? (
        <div className="mt-6">
          <Button href={href}>{action}</Button>
        </div>
      ) : null}
    </div>
  );
}

export function Field({
  label,
  name,
  type = "text",
  required,
  defaultValue,
  autoComplete,
  hint,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
  autoComplete?: string;
  hint?: string;
}) {
  return (
    <label className="grid gap-1.5 text-sm">
      <span className="font-medium text-ink">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        autoComplete={autoComplete}
        className="min-h-11 rounded-[10px] border border-line bg-surface px-3 text-base text-ink"
      />
      {hint ? <span className="text-muted">{hint}</span> : null}
    </label>
  );
}
