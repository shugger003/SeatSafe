import Link from "next/link";
import { logoutAction } from "@/app/actions/admin";

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
  return (
    <div className="min-h-dvh bg-paper">
      <div className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3">
          <Link href="/admin" className="font-display text-xl">
            Store admin
          </Link>
          <nav className="flex flex-wrap gap-x-4 gap-y-2 text-sm" aria-label="Admin">
            {LINKS.map(([label, href]) => (
              <Link key={href} href={href}>
                {label}
              </Link>
            ))}
          </nav>
          <form action={logoutAction} className="ml-auto">
            <span className="mr-3 text-xs text-muted">{email}</span>
            <button className="min-h-11 text-sm underline underline-offset-4">Sign out</button>
          </form>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 py-8">{children}</div>
    </div>
  );
}
