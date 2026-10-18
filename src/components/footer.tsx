import Link from "next/link";
import { FacebookLogo } from "@phosphor-icons/react/dist/ssr/FacebookLogo";
import { InstagramLogo } from "@phosphor-icons/react/dist/ssr/InstagramLogo";
import { TiktokLogo } from "@phosphor-icons/react/dist/ssr/TiktokLogo";
import { WhatsappLogo } from "@phosphor-icons/react/dist/ssr/WhatsappLogo";
import { YoutubeLogo } from "@phosphor-icons/react/dist/ssr/YoutubeLogo";
import { POLICY_LINKS } from "@/lib/defaults";
import { safeHref } from "@/lib/safe";
import type { StoreSettings } from "@/lib/types";

const SHOP = [
  { href: "/shop", label: "Shop" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/faq", label: "Questions" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Footer({ store, year }: { store: StoreSettings; year: number }) {
  const socials = [
    { href: safeHref(store.social.instagram), label: "Instagram", icon: InstagramLogo },
    { href: safeHref(store.social.facebook), label: "Facebook", icon: FacebookLogo },
    { href: safeHref(store.social.tiktok), label: "TikTok", icon: TiktokLogo },
    { href: safeHref(store.social.youtube), label: "YouTube", icon: YoutubeLogo },
    { href: safeHref(store.social.whatsapp), label: "WhatsApp", icon: WhatsappLogo },
  ].filter((item) => item.href);

  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
        <div>
          <p className="font-display text-3xl tracking-[-0.02em] text-pine">{store.businessName}</p>
          <p className="mt-5 max-w-md text-sm leading-6 text-muted">{store.shortDescription}</p>
          {store.legalName ? <p className="mt-3 text-sm text-muted">{store.legalName}</p> : null}
          <div className="mt-5 space-y-1 text-sm text-muted">
            {store.email ? <p><a className="underline-offset-4 hover:text-ink hover:underline" href={`mailto:${store.email}`}>{store.email}</a></p> : null}
            {store.phone ? <p><a className="underline-offset-4 hover:text-ink hover:underline" href={`tel:${store.phone}`}>{store.phone}</a></p> : null}
            {store.address ? <p>{store.address}</p> : null}
            {store.supportHours ? <p>{store.supportHours}</p> : null}
          </div>
          {socials.length > 0 ? (
            <ul className="mt-6 flex gap-1">
              {socials.map((item) => (
                <li key={item.label}>
                  <a href={item.href!} aria-label={item.label} className="inline-flex h-11 w-11 items-center justify-center text-ink hover:text-pine">
                    <item.icon size={20} aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <div>
          <h2 className="text-sm font-medium">Shop</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {SHOP.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-muted underline-offset-4 hover:text-ink hover:underline">{link.label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-medium">Information</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {POLICY_LINKS.map((policy) => (
              <li key={policy.href}>
                <Link href={policy.href} className="text-muted underline-offset-4 hover:text-ink hover:underline">{policy.label}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-line px-5 py-5 text-xs text-muted sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-2">
          <p>© {year} {store.businessName}</p>
          {store.storeStatus === "paused" ? <p>Ordering is paused.</p> : null}
          {store.storeStatus === "coming_soon" ? <p>Orders open when the catalog, delivery, and payment details are published.</p> : null}
        </div>
      </div>
    </footer>
  );
}
