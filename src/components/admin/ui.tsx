import Link from "next/link";
import { CheckCircle } from "@phosphor-icons/react/dist/ssr/CheckCircle";
import { EnvelopeSimple } from "@phosphor-icons/react/dist/ssr/EnvelopeSimple";
import { Phone } from "@phosphor-icons/react/dist/ssr/Phone";
import { WarningCircle } from "@phosphor-icons/react/dist/ssr/WarningCircle";
import { WhatsappLogo } from "@phosphor-icons/react/dist/ssr/WhatsappLogo";
import { cn } from "@/lib/cn";
import { telLink, whatsappLink } from "@/lib/contact";
import type { FulfillmentStatus, PaymentStatus } from "@/lib/types";

export const field = "min-h-11 w-full rounded-md border border-line bg-paper/60 px-3 text-[0.95rem] transition-colors focus:border-pine focus:bg-surface focus:outline-none";
export const textarea = `${field} min-h-24 py-2.5 leading-6`;

type Variant = "primary" | "secondary" | "quiet" | "danger";

export function buttonClass(variant: Variant = "primary", className?: string) {
  return cn(
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-5 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
    variant === "primary" && "bg-pine text-paper hover:bg-pine-dark",
    variant === "secondary" && "border border-line bg-surface text-ink hover:border-pine hover:text-pine",
    variant === "quiet" && "px-2 text-muted underline-offset-4 hover:text-ink hover:underline",
    variant === "danger" && "border border-danger/30 text-danger hover:bg-danger hover:text-paper",
    className,
  );
}

export function SubmitButton({ children, variant = "primary", className, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button type="submit" className={buttonClass(variant, className)} {...rest}>
      {children}
    </button>
  );
}

export function PageHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description?: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {eyebrow ? <p className="text-xs font-medium uppercase tracking-[0.16em] text-clay">{eyebrow}</p> : null}
        <h1 className="mt-1 font-display text-4xl leading-tight tracking-[-0.02em] sm:text-5xl">{title}</h1>
        {description ? <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </header>
  );
}

export function Card({ id, title, description, actions, children, className }: { id?: string; title?: string; description?: React.ReactNode; actions?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section id={id} className={cn("scroll-mt-24 rounded-xl border border-line bg-surface p-5 sm:p-6", className)}>
      {title ? (
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl leading-tight">{title}</h2>
            {description ? <p className="mt-1 text-sm leading-6 text-muted">{description}</p> : null}
          </div>
          {actions}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function Notice({ children, tone = "success" }: { children: React.ReactNode; tone?: "success" | "warn" }) {
  const Icon = tone === "success" ? CheckCircle : WarningCircle;
  return (
    <p role="status" className={cn("flex items-start gap-2 rounded-md px-4 py-3 text-sm leading-6", tone === "success" ? "bg-mist text-pine" : "bg-amber-50 text-amber-900")}>
      <Icon size={18} weight="fill" className="mt-0.5 shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </p>
  );
}

export function Label({ label, hint, children, className }: { label: string; hint?: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={cn("grid content-start gap-1.5 text-sm", className)}>
      <span className="font-medium">{label}</span>
      {children}
      {hint ? <span className="text-xs leading-5 text-muted">{hint}</span> : null}
    </label>
  );
}

export function Check({ name, label, defaultChecked }: { name: string; label: string; defaultChecked?: boolean }) {
  return (
    <label className="flex min-h-11 items-center gap-2.5 text-sm">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="size-4 accent-pine" />
      {label}
    </label>
  );
}

type Tone = "green" | "amber" | "red" | "blue" | "grey";

export function Badge({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium",
        tone === "green" && "bg-mist text-pine",
        tone === "amber" && "bg-amber-100 text-amber-900",
        tone === "red" && "bg-red-100 text-danger",
        tone === "blue" && "bg-sky-100 text-sky-900",
        tone === "grey" && "bg-stone text-muted",
      )}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {children}
    </span>
  );
}

export const PAYMENT_LABELS: Record<PaymentStatus, [string, Tone]> = {
  pending: ["Awaiting payment", "amber"],
  paid: ["Paid", "green"],
  failed: ["Payment failed", "red"],
  cancelled: ["Cancelled", "grey"],
  expired: ["Expired", "grey"],
  review: ["Needs review", "amber"],
  reconciled: ["Paid, recorded by hand", "green"],
};

export const FULFILLMENT_LABELS: Record<FulfillmentStatus, [string, Tone]> = {
  unfulfilled: ["Not sent yet", "amber"],
  processing: ["Preparing", "blue"],
  shipped: ["On the way", "blue"],
  completed: ["Delivered", "green"],
  cancelled: ["Cancelled", "grey"],
};

export function PaymentBadge({ status }: { status: PaymentStatus }) {
  const [label, tone] = PAYMENT_LABELS[status] ?? [status, "grey"];
  return <Badge tone={tone}>{label}</Badge>;
}

export function FulfillmentBadge({ status }: { status: FulfillmentStatus }) {
  const [label, tone] = FULFILLMENT_LABELS[status] ?? [status, "grey"];
  return <Badge tone={tone}>{label}</Badge>;
}

export function ContactButtons({ phone, email, message, compact = false }: { phone?: string; email?: string; message?: string; compact?: boolean }) {
  const call = phone ? telLink(phone) : null;
  const chat = phone ? whatsappLink(phone, message) : null;
  const size = compact ? "min-h-9 px-3 text-xs" : "";
  if (!call && !chat && !email) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {call ? (
        <a href={call} className={buttonClass("secondary", size)}>
          <Phone size={compact ? 14 : 16} weight="bold" aria-hidden="true" />
          Call
        </a>
      ) : null}
      {chat ? (
        <a href={chat} target="_blank" rel="noopener noreferrer" className={buttonClass("secondary", cn(size, "hover:border-[#1f8f4e] hover:text-[#1f8f4e]"))}>
          <WhatsappLogo size={compact ? 14 : 16} weight="bold" aria-hidden="true" />
          WhatsApp
        </a>
      ) : null}
      {email ? (
        <a href={`mailto:${email}`} className={buttonClass("secondary", size)}>
          <EnvelopeSimple size={compact ? 14 : 16} weight="bold" aria-hidden="true" />
          Email
        </a>
      ) : null}
    </div>
  );
}

export function EmptyRow({ children }: { children: React.ReactNode }) {
  return <p className="rounded-xl border border-dashed border-line px-5 py-10 text-center text-sm text-muted">{children}</p>;
}

export function TextLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="font-medium text-pine underline-offset-4 hover:underline">
      {children}
    </Link>
  );
}
