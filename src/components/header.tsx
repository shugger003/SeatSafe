"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr/ArrowRight";
import { List } from "@phosphor-icons/react/dist/ssr/List";
import { Phone } from "@phosphor-icons/react/dist/ssr/Phone";
import { ShoppingBag } from "@phosphor-icons/react/dist/ssr/ShoppingBag";
import { WhatsappLogo } from "@phosphor-icons/react/dist/ssr/WhatsappLogo";
import { X } from "@phosphor-icons/react/dist/ssr/X";
import { useCart } from "@/components/cart-provider";
import { cn } from "@/lib/cn";
import { PARTNERSHIP_LINKS } from "@/lib/partnerships";

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
  productHref,
  productLabel,
  phone,
  whatsappHref,
}: {
  businessName: string;
  logoUrl: string;
  productHref?: string;
  productLabel?: string;
  phone?: string;
  whatsappHref?: string | null;
}) {
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const [pathname, setPathname] = useState("");
  function openMenu() {
    setPathname(window.location.pathname);
    setOpen(true);
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

  const featured = productHref
    ? { href: productHref, title: productLabel || "SitSafe", action: "View the product" }
    : { href: "/shop", title: "Shop", action: "Browse the shop" };
  const pages = LINKS.filter((link) => link.href !== "/shop");

  function current(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <header className="sticky top-0 z-40 bg-pine text-paper">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-5 sm:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-3 text-sm font-medium tracking-[0.22em] text-paper">
          {logoUrl ? (
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logoUrl} alt="" className="h-8 w-8 object-contain" />
            </span>
          ) : null}
          <span className="truncate">{businessName}</span>
        </Link>
        <Link
          href="/cart"
          className="ml-auto inline-flex min-h-11 items-center gap-2 px-1 text-sm"
          aria-label={`Cart, ${count} ${count === 1 ? "item" : "items"}`}
        >
          <ShoppingBag size={18} aria-hidden="true" />
          <span className="min-w-4 tabular-nums">{count}</span>
        </Link>
        <button
          ref={menuRef}
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-md transition-colors hover:bg-paper/10"
          aria-label="Open menu"
          aria-expanded={open}
          onClick={openMenu}
        >
          <List size={22} aria-hidden="true" />
        </button>
      </div>
      {open ? (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="absolute inset-0 bg-ink/45" aria-hidden="true" onClick={() => setOpen(false)} />
          <div className="animate-[menu-in_220ms_ease-out] absolute inset-y-0 right-0 flex w-full flex-col bg-paper text-ink shadow-2xl sm:w-[26rem]">
            <div className="flex h-[calc(4rem+env(safe-area-inset-top))] shrink-0 items-center justify-between bg-pine px-5 pt-[env(safe-area-inset-top)] text-paper">
              <p className="flex min-w-0 items-center gap-3 text-sm font-medium tracking-[0.22em]">
                {logoUrl ? (
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={logoUrl} alt="" className="h-8 w-8 object-contain" />
                  </span>
                ) : null}
                <span className="truncate">{businessName}</span>
              </p>
              <button
                ref={closeRef}
                type="button"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-paper/15"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>
            <nav className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-6" aria-label="Primary">
              <Link
                href={featured.href}
                aria-current={current(featured.href) ? "page" : undefined}
                onClick={() => setOpen(false)}
                className={cn(
                  "block rounded-lg bg-white px-4 py-4 shadow-soft ring-1 ring-line transition-colors hover:ring-pine",
                  current(featured.href) && "ring-pine",
                )}
              >
                <span className="text-xs font-medium uppercase tracking-[0.16em] text-muted">Shop</span>
                <span className="mt-1 block text-balance font-display text-[1.7rem] leading-[1.05] tracking-[-0.03em] text-ink">{featured.title}</span>
                <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-pine">
                  {featured.action}
                  <ArrowRight size={16} aria-hidden="true" />
                </span>
              </Link>
              <ul className="mt-6">
                {pages.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      aria-current={current(link.href) ? "page" : undefined}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex min-h-12 items-center font-display text-[1.65rem] leading-none tracking-[-0.03em] transition-colors hover:text-pine",
                        current(link.href) ? "text-pine" : "text-ink",
                      )}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                href="/cart"
                aria-current={current("/cart") ? "page" : undefined}
                onClick={() => setOpen(false)}
                className="mt-4 flex min-h-12 items-center justify-between border-t border-line pt-3"
              >
                <span className={cn("font-display text-[1.65rem] leading-none tracking-[-0.03em]", current("/cart") ? "text-pine" : "text-ink")}>Cart</span>
                <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-mist px-2 text-sm font-medium tabular-nums text-pine">{count}</span>
              </Link>
              <p className="mb-2 mt-8 text-xs font-medium uppercase tracking-[0.16em] text-muted">For businesses</p>
              <ul>
                {PARTNERSHIP_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      aria-current={current(link.href) ? "page" : undefined}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex min-h-11 items-center text-base transition-colors hover:text-pine",
                        current(link.href) ? "text-pine" : "text-ink",
                      )}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            {phone || whatsappHref ? (
              <div className="shrink-0 border-t border-line px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4">
                <div className="grid grid-cols-2 gap-2">
                  {phone ? (
                    <a
                      href={`tel:${phone.replace(/\s+/g, "")}`}
                      className={cn("inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-pine px-3 font-medium text-paper", !whatsappHref && "col-span-2")}
                    >
                      <Phone size={18} weight="fill" aria-hidden="true" />
                      Call us
                    </a>
                  ) : null}
                  {whatsappHref ? (
                    <a
                      href={whatsappHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn("inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[#25d366] px-3 font-medium text-white", !phone && "col-span-2")}
                    >
                      <WhatsappLogo size={18} weight="fill" aria-hidden="true" />
                      WhatsApp
                    </a>
                  ) : null}
                </div>
                {phone ? <p className="mt-3 text-center text-sm text-muted">{phone}</p> : null}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </header>
  );
}
