import Link from "next/link";
import { getStore } from "@/lib/db";
import { safeHref } from "@/lib/safe";

export async function AuthShell({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  const store = await getStore();
  const logo = safeHref(store.logoUrl);
  return (
    <main id="main" className="grid min-h-dvh lg:grid-cols-[1fr_1.1fr]">
      <section className="flex flex-col justify-between gap-10 bg-pine px-6 py-8 text-paper sm:px-10 lg:px-14 lg:py-14">
        <div className="flex items-center gap-3">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white">
            {logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logo} alt="" className="size-9 object-contain" />
            ) : null}
          </span>
          <span>
            <span className="block font-semibold tracking-[0.18em]">{store.businessName}</span>
            <span className="block text-xs text-paper/65">Admin</span>
          </span>
        </div>
        <p className="hidden max-w-md font-display text-5xl leading-[1.05] lg:block">Orders, stock, and store content in one place.</p>
        <Link href="/" className="hidden text-sm text-paper/70 underline-offset-4 hover:text-paper hover:underline lg:inline">Back to the store</Link>
      </section>
      <section className="flex items-start px-6 py-10 sm:px-10 lg:items-center">
        <div className="mx-auto w-full max-w-sm">
          <h1 className="font-display text-4xl tracking-[-0.02em]">{title}</h1>
          {description ? <p className="mt-2 text-sm leading-6 text-muted">{description}</p> : null}
          <div className="mt-8">{children}</div>
        </div>
      </section>
    </main>
  );
}
