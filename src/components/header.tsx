"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { List } from "@phosphor-icons/react/dist/ssr/List";
import { ShoppingBag } from "@phosphor-icons/react/dist/ssr/ShoppingBag";
import { X } from "@phosphor-icons/react/dist/ssr/X";
import { useCart } from "@/components/cart-provider";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/about", label: "About us" },
  { href: "/faq", label: "FAQs" },
  { href: "/contact", label: "Contact" },
];

export function Header({ businessName, logoUrl }: { businessName: string; logoUrl: string }) {
  const { count } = useCart();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-5 sm:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-2 font-display text-xl tracking-tight">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="" className="h-8 w-auto" />
          ) : null}
          <span className="truncate">{businessName}</span>
        </Link>
        <nav className="ml-auto hidden items-center gap-6 text-sm lg:flex" aria-label="Primary">
          {LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="text-ink/80 hover:text-ink">
              {link.label}
            </Link>
          ))}
        </nav>
        <Link href="/cart" className="ml-auto inline-flex min-h-11 items-center gap-2 rounded-[10px] px-2 lg:ml-4" aria-label={`Cart, ${count} items`}>
          <ShoppingBag size={22} aria-hidden="true" />
          <span className="min-w-5 text-sm tabular-nums">{count}</span>
        </Link>
        <button type="button" className="inline-flex h-11 w-11 items-center justify-center lg:hidden" aria-label="Open menu" onClick={() => setOpen(true)}>
          <List size={24} aria-hidden="true" />
        </button>
      </div>
      {open ? (
        <div className="fixed inset-0 z-50 bg-paper lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="flex h-16 items-center justify-between px-5">
            <p className="font-display text-xl">{businessName}</p>
            <button type="button" className="inline-flex h-11 w-11 items-center justify-center" aria-label="Close menu" onClick={() => setOpen(false)}>
              <X size={22} aria-hidden="true" />
            </button>
          </div>
          <nav className="grid px-5" aria-label="Mobile">
            {LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="border-b border-line py-4 font-display text-2xl" onClick={() => pathname === link.href && setOpen(false)}>
                {link.label}
              </Link>
            ))}
            <Link href="/cart" className="py-4 font-display text-2xl" onClick={() => pathname === "/cart" && setOpen(false)}>
              Cart
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
