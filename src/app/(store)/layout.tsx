import type { Metadata } from "next";
import { AnalyticsGate } from "@/components/analytics";
import { CartProvider } from "@/components/cart-provider";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { WhatsAppBubble } from "@/components/whatsapp-bubble";
import { catalogCached, getAnnouncement, getStore, listPublicProducts } from "@/lib/db";
import { safeHref } from "@/lib/safe";

const YEAR = new Date().getFullYear();

export async function generateMetadata(): Promise<Metadata> {
  const store = await catalogCached("store", getStore);
  return {
    title: {
      default: store.businessName,
      template: `%s · ${store.businessName}`,
    },
    description: store.shortDescription,
  };
}

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const [store, announcement, catalog] = await Promise.all([
    catalogCached("store", getStore),
    catalogCached("announcement", getAnnouncement),
    catalogCached("public-products-1", () => listPublicProducts({ pageSize: 1 })),
  ]);
  const only = catalog.total === 1 ? catalog.products[0] : null;
  const href = safeHref(announcement.href);
  const logo = safeHref(store.logoUrl) || "";
  const whatsapp = safeHref(store.social.whatsapp);

  return (
    <CartProvider>
      <div className="flex min-h-dvh flex-col">
        {announcement.enabled && announcement.message ? (
          <div className="bg-pine-dark px-4 py-2 text-center text-sm text-paper">
            {href ? (
              <a href={href} className="underline underline-offset-4">
                {announcement.message}
              </a>
            ) : (
              announcement.message
            )}
          </div>
        ) : null}
        <Header
          businessName={store.businessName}
          logoUrl={logo}
          productHref={only ? `/product/${only.slug}` : undefined}
          productLabel={only ? only.name.replace(/\s+toilet sanitizer$/i, "") : undefined}
          phone={store.phone}
          whatsappHref={whatsapp}
        />
        {store.showPreparationNotice && store.preparationNotice ? (
          <p className="bg-pine-dark px-5 py-2.5 text-center text-sm leading-6 text-paper/80">
            <span className="mx-auto block max-w-3xl text-balance">{store.preparationNotice}</span>
          </p>
        ) : null}
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer store={store} year={YEAR} />
        {whatsapp ? <WhatsAppBubble href={whatsapp} phone={store.phone} /> : null}
        <AnalyticsGate />
      </div>
    </CartProvider>
  );
}
