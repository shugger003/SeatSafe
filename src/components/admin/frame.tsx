"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/actions/admin";
import { cn } from "@/lib/cn";

const LINKS = [
  ["Overview", "/admin"],
  ["Products", "/admin/products"],
  ["Orders", "/admin/orders"],
  ["Inquiries", "/admin/inquiries"],
  ["Content", "/admin/content"],
  ["Discounts", "/admin/discounts"],
  ["Settings", "/admin/settings"],
];

export function AdminFrame({ email, children }: { email: string; children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-dvh bg-paper lg:grid lg:grid-cols-[250px_1fr]">
      <aside className="border-b border-pine-dark bg-pine-dark text-paper lg:min-h-dvh lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between gap-4 px-5 py-5 lg:block">
          <Link href="/admin" className="block">
            <p className="text-[11px] uppercase tracking-[0.18em] text-paper/55">Store</p>
            <p className="font-display text-2xl leading-tight">Admin</p>
          </Link>
          <form action={logoutAction} className="lg:mt-6">
            <p className="hidden truncate text-xs text-paper/60 lg:block">{email}</p>
            <button className="mt-2 min-h-11 text-sm text-paper/80 underline underline-offset-4 hover:text-paper">Sign out</button>
          </form>
        </div>
        <nav className="flex gap-2 overflow-x-auto px-3 pb-4 lg:grid lg:gap-1 lg:px-3" aria-label="Admin">
          {LINKS.map(([label, href]) => {
            const active = href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "shrink-0 rounded-full px-3 py-2 text-sm lg:rounded-[12px]",
                  active ? "bg-paper text-pine" : "text-paper/75 hover:bg-paper/10 hover:text-paper",
                )}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-8 sm:py-10">{children}</div>
    </div>
  );
}
