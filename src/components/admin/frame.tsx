"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowSquareOut } from "@phosphor-icons/react/dist/ssr/ArrowSquareOut";
import { ChatCircleText } from "@phosphor-icons/react/dist/ssr/ChatCircleText";
import { GearSix } from "@phosphor-icons/react/dist/ssr/GearSix";
import { House } from "@phosphor-icons/react/dist/ssr/House";
import { Package } from "@phosphor-icons/react/dist/ssr/Package";
import { Receipt } from "@phosphor-icons/react/dist/ssr/Receipt";
import { SignOut } from "@phosphor-icons/react/dist/ssr/SignOut";
import { Tag } from "@phosphor-icons/react/dist/ssr/Tag";
import { TextAa } from "@phosphor-icons/react/dist/ssr/TextAa";
import { logoutAction } from "@/app/actions/admin";
import { cn } from "@/lib/cn";

const LINKS = [
  { label: "Overview", href: "/admin", icon: House },
  { label: "Orders", href: "/admin/orders", icon: Receipt },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Messages", href: "/admin/inquiries", icon: ChatCircleText },
  { label: "Content", href: "/admin/content", icon: TextAa },
  { label: "Discounts", href: "/admin/discounts", icon: Tag },
  { label: "Settings", href: "/admin/settings", icon: GearSix },
];

export function AdminFrame({ email, businessName, logoUrl, children }: { email: string; businessName: string; logoUrl: string; children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-dvh bg-paper lg:grid lg:grid-cols-[256px_1fr]">
      <aside className="sticky top-0 z-30 bg-pine text-paper lg:h-dvh lg:overflow-y-auto">
        <div className="flex items-center justify-between gap-3 px-4 pt-4 lg:block lg:px-5 lg:pt-6">
          <Link href="/admin" className="flex min-w-0 items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white lg:size-12">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt="" className="size-7 object-contain lg:size-9" />
              ) : null}
            </span>
            <span className="min-w-0">
              <span className="block truncate font-semibold tracking-[0.14em]">{businessName}</span>
              <span className="block text-xs text-paper/65">Admin</span>
            </span>
          </Link>
          <div className="flex items-center gap-1 lg:hidden">
            <a href="/" target="_blank" rel="noopener noreferrer" aria-label="View store" className="inline-flex size-11 items-center justify-center rounded-md text-paper/80 hover:bg-paper/10 hover:text-paper">
              <ArrowSquareOut size={20} aria-hidden="true" />
            </a>
            <form action={logoutAction}>
              <button aria-label="Sign out" className="inline-flex size-11 items-center justify-center rounded-md text-paper/80 hover:bg-paper/10 hover:text-paper">
                <SignOut size={20} aria-hidden="true" />
              </button>
            </form>
          </div>
        </div>
        <nav aria-label="Admin" className="mt-3 flex gap-1 overflow-x-auto px-3 pb-3 [scrollbar-width:none] lg:mt-8 lg:grid lg:overflow-visible lg:pb-0">
          {LINKS.map(({ label, href, icon: Icon }) => {
            const active = href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-10 shrink-0 items-center gap-2.5 rounded-md px-3 text-sm transition-colors lg:min-h-11",
                  active ? "bg-paper font-medium text-pine" : "text-paper/75 hover:bg-paper/10 hover:text-paper",
                )}
              >
                <Icon size={18} weight={active ? "fill" : "regular"} aria-hidden="true" />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="hidden border-t border-paper/15 px-5 py-5 lg:mt-8 lg:block">
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
      </aside>
      <main id="main" className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-8 sm:py-10">{children}</main>
    </div>
  );
}
