"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowSquareOut } from "@phosphor-icons/react/dist/ssr/ArrowSquareOut";
import { ChatCircleText } from "@phosphor-icons/react/dist/ssr/ChatCircleText";
import { GearSix } from "@phosphor-icons/react/dist/ssr/GearSix";
import { House } from "@phosphor-icons/react/dist/ssr/House";
import { List } from "@phosphor-icons/react/dist/ssr/List";
import { Package } from "@phosphor-icons/react/dist/ssr/Package";
import { PaperPlaneTilt } from "@phosphor-icons/react/dist/ssr/PaperPlaneTilt";
import { Receipt } from "@phosphor-icons/react/dist/ssr/Receipt";
import { SignOut } from "@phosphor-icons/react/dist/ssr/SignOut";
import { Tag } from "@phosphor-icons/react/dist/ssr/Tag";
import { TextAa } from "@phosphor-icons/react/dist/ssr/TextAa";
import { X } from "@phosphor-icons/react/dist/ssr/X";
import { logoutAction } from "@/app/actions/admin";
import { cn } from "@/lib/cn";

const LINKS = [
  { label: "Overview", href: "/admin", icon: House },
  { label: "Orders", href: "/admin/orders", icon: Receipt },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Messages", href: "/admin/inquiries", icon: ChatCircleText },
  { label: "SMS", href: "/admin/sms", icon: PaperPlaneTilt },
  { label: "Content", href: "/admin/content", icon: TextAa },
  { label: "Discounts", href: "/admin/discounts", icon: Tag },
  { label: "Settings", href: "/admin/settings", icon: GearSix },
];

export function AdminFrame({ email, businessName, logoUrl, children }: { email: string; businessName: string; logoUrl: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const opened = useRef(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (open) {
      opened.current = true;
      closeRef.current?.focus();
      return;
    }
    if (opened.current) menuRef.current?.focus();
  }, [open]);

  return (
    <div className="min-h-dvh bg-paper lg:grid lg:grid-cols-[256px_1fr]">
      <header className="sticky top-0 z-30 flex items-center gap-3 bg-pine px-4 py-3 text-paper lg:hidden">
        <Brand href="/admin" businessName={businessName} logoUrl={logoUrl} compact />
        <button
          ref={menuRef}
          type="button"
          className="ml-auto inline-flex size-11 items-center justify-center rounded-md text-paper hover:bg-paper/10"
          aria-label="Open menu"
          aria-expanded={open}
          onClick={() => setOpen(true)}
        >
          <List size={22} aria-hidden="true" />
        </button>
      </header>

      <aside className="hidden bg-pine text-paper lg:sticky lg:top-0 lg:block lg:h-dvh lg:overflow-y-auto">
        <div className="px-5 pt-6">
          <Brand href="/admin" businessName={businessName} logoUrl={logoUrl} />
        </div>
        <Nav pathname={pathname} className="mt-8 grid px-3" />
        <Account email={email} className="mt-8" />
      </aside>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="absolute inset-0 bg-ink/50" aria-hidden="true" onClick={() => setOpen(false)} />
          <div className="relative ml-auto flex h-full w-[85%] max-w-sm flex-col overflow-y-auto bg-pine text-paper shadow-2xl">
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <Brand businessName={businessName} logoUrl={logoUrl} compact />
              <button
                ref={closeRef}
                type="button"
                className="inline-flex size-11 items-center justify-center rounded-md hover:bg-paper/10"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
              >
                <X size={22} aria-hidden="true" />
              </button>
            </div>
            <Nav pathname={pathname} className="mt-2 grid px-3" />
            <Account email={email} className="mt-auto" />
          </div>
        </div>
      ) : null}

      <main id="main" className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-8 sm:py-10">{children}</main>
    </div>
  );
}

function Brand({ href, businessName, logoUrl, compact = false }: { href?: string; businessName: string; logoUrl: string; compact?: boolean }) {
  const inner = (
    <>
      <span className={cn("flex shrink-0 items-center justify-center rounded-full bg-white", compact ? "size-10" : "size-12")}>
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt="" className={cn("object-contain", compact ? "size-7" : "size-9")} />
        ) : null}
      </span>
      <span className="min-w-0">
        <span className="block truncate font-semibold tracking-[0.14em]">{businessName}</span>
        <span className="block text-xs text-paper/65">Admin</span>
      </span>
    </>
  );
  const className = "flex min-w-0 items-center gap-3";
  return href ? <Link href={href} className={className}>{inner}</Link> : <p className={className}>{inner}</p>;
}

function Nav({ pathname, className }: { pathname: string; className?: string }) {
  return (
    <nav aria-label="Admin" className={className}>
      {LINKS.map(({ label, href, icon: Icon }) => {
        const active = href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex min-h-11 items-center gap-2.5 rounded-md px-3 text-sm transition-colors",
              active ? "bg-paper font-medium text-pine" : "text-paper/75 hover:bg-paper/10 hover:text-paper",
            )}
          >
            <Icon size={18} weight={active ? "fill" : "regular"} aria-hidden="true" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

function Account({ email, className }: { email: string; className?: string }) {
  return (
    <div className={cn("border-t border-paper/15 px-5 py-5", className)}>
      <a href="/" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center gap-2 text-sm text-paper/80 hover:text-paper">
        <ArrowSquareOut size={18} aria-hidden="true" />
        View store
      </a>
      <p className="mt-4 truncate text-xs text-paper/60" title={email}>{email}</p>
      <form action={logoutAction}>
        <button className="mt-1 inline-flex min-h-10 items-center gap-2 text-sm text-paper/80 hover:text-paper">
          <SignOut size={18} aria-hidden="true" />
          Sign out
        </button>
      </form>
    </div>
  );
}
