"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { List } from "@phosphor-icons/react/dist/ssr/List";
import { ShoppingBag } from "@phosphor-icons/react/dist/ssr/ShoppingBag";
import { X } from "@phosphor-icons/react/dist/ssr/X";
import { useCart } from "@/components/cart-provider";
import { cn } from "@/lib/cn";

const LINKS = [
  { href: "/shop", label: "Shop" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "Questions" },
  { href: "/contact", label: "Contact" },
];

export function Header({
  businessName,
  logoUrl,
  phone,
  email,
}: {
  businessName: string;
  logoUrl: string;
  phone: string;
  email: string;
}) {
  const { count } = useCart();
  const pathname = usePathname();
  const [openPath, setOpenPath] = useState<string | null>(null);
  const open = openPath === pathname;
  function setOpen(next: boolean) {
    setOpenPath(next ? pathname : null);
  }
  const opened = useRef(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpenPath(null);
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
    <header className="z-30">
      <div className="bg-pine text-paper">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-6 gap-y-1 px-5 py-3 text-sm">
          {phone ? <a href={`tel:${phone}`}>Mobile: {phone}</a> : null}
          {email ? <a href={`mailto:${email}`}>Email: {email}</a> : null}
          {!phone && !email ? <span>Contact details have not been published</span> : null}
          <Link href="/shop" className="font-medium tracking-[0.16em]">SHOP ONLINE</Link>
        </div>
      </div>
      <div className="border-b border-line bg-surface">
        <Link href="/" className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-5 py-6 text-center">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="" className="h-14 w-auto" />
          ) : (
            <Mark name={businessName} />
          )}
          <span className="font-display text-3xl tracking-[-0.03em] text-pine">{businessName}</span>
        </Link>
      </div>
      <div className="sticky top-0 border-b border-line bg-surface/95 backdrop-blur-md">
      <div className="mx-auto grid h-14 max-w-6xl grid-cols-[1fr_auto_auto] items-center px-5 md:grid-cols-[1fr_auto_1fr] md:px-8">
        <p className="text-sm font-medium tracking-[0.14em] md:hidden">MENU</p>
        <nav className="col-start-2 hidden items-center justify-center gap-1 md:flex" aria-label="Primary">
          {LINKS.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "px-3 py-2 text-sm text-muted transition-colors hover:text-pine",
                  active && "text-pine",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <Link
          href="/cart"
          className="ml-auto inline-flex min-h-11 items-center gap-2 px-1 text-sm md:col-start-3 md:ml-0 md:justify-self-end"
          aria-label={`Cart, ${count} ${count === 1 ? "item" : "items"}`}
        >
          <ShoppingBag size={18} aria-hidden="true" />
          <span className="min-w-4 tabular-nums">{count}</span>
        </Link>
        <button
          ref={menuRef}
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center md:hidden"
          aria-label="Open menu"
          aria-expanded={open}
          onClick={() => setOpen(true)}
        >
          <List size={22} aria-hidden="true" />
        </button>
      </div>
      </div>
      {open ? (
        <div className="fixed inset-0 z-50 bg-surface md:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="flex h-16 items-center justify-between px-5">
            <p className="font-display text-xl">{businessName}</p>
            <button ref={closeRef} type="button" className="inline-flex h-11 w-11 items-center justify-center" aria-label="Close menu" onClick={() => setOpen(false)}>
              <X size={22} aria-hidden="true" />
            </button>
          </div>
          <nav className="grid px-5" aria-label="Mobile">
            {LINKS.map((link) => {
              const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={cn("border-b border-line py-4 font-display text-3xl tracking-[-0.03em]", active && "text-pine")}
                >
                  {link.label}
                </Link>
              );
            })}
            <Link href="/cart" className="flex items-baseline justify-between border-b border-line py-4 font-display text-3xl tracking-[-0.03em]">
              Cart
              <span className="text-base tabular-nums text-muted">{count}</span>
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}

function Mark({ name }: { name: string }) {
  const letter = name.trim().charAt(0).toUpperCase() || "S";
  return (
    <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-mist font-display text-2xl text-pine" aria-hidden="true">
      {letter}
    </span>
  );
}
