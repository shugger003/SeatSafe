"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { List } from "@phosphor-icons/react/dist/ssr/List";
import { Phone } from "@phosphor-icons/react/dist/ssr/Phone";
import { ShoppingBag } from "@phosphor-icons/react/dist/ssr/ShoppingBag";
import { WhatsappLogo } from "@phosphor-icons/react/dist/ssr/WhatsappLogo";
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

  const links = [
    productHref ? { href: productHref, label: productLabel || "Product" } : { href: "/shop", label: "Shop" },
    ...LINKS.filter((link) => link.href !== "/shop"),
  ];

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
          <div className="absolute inset-0 bg-ink/50" aria-hidden="true" onClick={() => setOpen(false)} />
          <div className="relative ml-auto flex h-full w-[85%] max-w-sm flex-col overflow-y-auto bg-pine text-paper shadow-2xl md:w-full md:max-w-md">
            <div className="flex h-16 items-center justify-between px-5 md:px-8">
              <p className="flex min-w-0 items-center gap-3 text-sm font-medium tracking-[0.22em]">
                {logoUrl ? (
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={logoUrl} alt="" className="h-8 w-8 object-contain" />
                  </span>
                ) : null}
                <span className="truncate">{businessName}</span>
              </p>
              <button ref={closeRef} type="button" className="inline-flex h-11 w-11 items-center justify-center" aria-label="Close menu" onClick={() => setOpen(false)}>
                <X size={22} aria-hidden="true" />
              </button>
            </div>
            <nav className="grid px-5 md:px-8" aria-label="Primary">
              {links.map((link) => {
                const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setOpen(false)}
                    className={cn("border-b border-paper/20 py-4 font-display text-3xl tracking-[-0.03em] transition-colors hover:text-paper", active ? "text-paper" : "text-paper/75")}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <Link
                href="/cart"
                aria-current={pathname === "/cart" ? "page" : undefined}
                onClick={() => setOpen(false)}
                className={cn("flex items-baseline justify-between border-b border-paper/20 py-4 font-display text-3xl tracking-[-0.03em] transition-colors hover:text-paper", pathname === "/cart" ? "text-paper" : "text-paper/75")}
              >
                Cart
                <span className="text-base tabular-nums text-paper/70">{count}</span>
              </Link>
            </nav>
            {phone || whatsappHref ? (
              <div className="mt-auto grid grid-cols-2 gap-3 px-5 pb-8 pt-10 md:px-8">
                {phone ? (
                  <a
                    href={`tel:${phone.replace(/\s+/g, "")}`}
                    className={cn("inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-paper px-3 font-medium text-pine", !whatsappHref && "col-span-2")}
                  >
                    <Phone size={20} weight="fill" aria-hidden="true" />
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
                    <WhatsappLogo size={20} weight="fill" aria-hidden="true" />
                    WhatsApp
                  </a>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </header>
  );
}
