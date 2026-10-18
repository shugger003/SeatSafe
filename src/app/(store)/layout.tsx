import { AnalyticsGate } from "@/components/analytics";
import { CartProvider } from "@/components/cart-provider";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { getAnnouncement, getStore } from "@/lib/db";
import { live } from "@/lib/live";
import { safeHref } from "@/lib/safe";

export const instant = false;

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  await live();
  const store = await getStore();
  const announcement = await getAnnouncement();
  const href = safeHref(announcement.href);
  const logo = safeHref(store.logoUrl) || "";

  return (
    <CartProvider>
      <div className="flex min-h-dvh flex-col">
        {announcement.enabled && announcement.message ? (
          <div className="bg-pine px-4 py-2 text-center text-sm text-paper">
            {href ? (
              <a href={href} className="underline underline-offset-4">
                {announcement.message}
              </a>
            ) : (
              announcement.message
            )}
          </div>
        ) : null}
        {store.showPreparationNotice && store.preparationNotice ? (
          <p className="border-b border-line bg-[#f8f1e6] px-4 py-2 text-center text-sm">{store.preparationNotice}</p>
        ) : null}
        <Header businessName={store.businessName} logoUrl={logo} />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer store={store} year={new Date().getFullYear()} />
        <AnalyticsGate />
      </div>
    </CartProvider>
  );
}
