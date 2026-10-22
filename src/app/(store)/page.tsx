import type { Metadata } from "next";
import { HomePage } from "@/components/home-page";
import { paymentsReady } from "@/lib/moolre";
import { catalogCached, getBenefits, getFaqs, getHomepage, getSteps, getStore, getUseCases, listPublicProducts } from "@/lib/db";
import { siteUrl } from "@/lib/safe";

export async function generateMetadata(): Promise<Metadata> {
  const [store, home] = await Promise.all([catalogCached("store", getStore), catalogCached("homepage", getHomepage)]);
  const title = store.businessName;
  const description = home.hero.description;
  return {
    title,
    description,
    alternates: { canonical: siteUrl() },
    openGraph: { title, description, url: siteUrl(), type: "website" },
  };
}

export default async function Page() {
  const [store, home, benefits, steps, catalog, useCases, faqs] = await Promise.all([
    catalogCached("store", getStore),
    catalogCached("homepage", getHomepage),
    catalogCached("benefits", getBenefits),
    catalogCached("steps", getSteps),
    catalogCached("public-products-12", () => listPublicProducts({ pageSize: 12 })),
    catalogCached("use-cases", getUseCases),
    catalogCached("faqs", getFaqs),
  ]);
  return (
    <>
      {store.businessName !== "Brand name" ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: store.businessName,
              url: siteUrl(),
              email: store.email || undefined,
              telephone: store.phone || undefined,
            }),
          }}
        />
      ) : null}
      <HomePage
        store={store}
        home={home}
        benefits={benefits.filter((item) => item.published)}
        steps={steps.filter((item) => item.published)}
        products={catalog.products}
        useCases={useCases.filter((item) => item.published)}
        faqs={faqs.filter((item) => item.published).slice(0, 6)}
        paymentsReady={paymentsReady()}
      />
    </>
  );
}
