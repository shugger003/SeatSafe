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
  productHref,
  productLabel,
}: {
  businessName: string;
  logoUrl: string;
  productHref?: string;
  productLabel?: string;
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
        <nav className="ml-auto hidden items-center gap-1 md:flex" aria-label="Primary">
          {links.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "px-3 py-2 text-sm text-paper/75 transition-colors hover:text-paper",
                  active && "text-paper",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <Link
          href="/cart"
          className="ml-auto inline-flex min-h-11 items-center gap-2 px-1 text-sm md:ml-2"
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
      {open ? (
        <div className="fixed inset-0 z-50 bg-pine text-paper md:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="flex h-16 items-center justify-between px-5">
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
          <nav className="grid px-5" aria-label="Mobile">
            {links.map((link) => {
              const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={cn("border-b border-paper/20 py-4 font-display text-3xl tracking-[-0.03em]", active && "text-paper")}
                >
                  {link.label}
                </Link>
              );
            })}
            <Link href="/cart" className="flex items-baseline justify-between border-b border-paper/20 py-4 font-display text-3xl tracking-[-0.03em]">
              Cart
              <span className="text-base tabular-nums text-paper/70">{count}</span>
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
