import Link from "next/link";
import { FacebookLogo } from "@phosphor-icons/react/dist/ssr/FacebookLogo";
import { InstagramLogo } from "@phosphor-icons/react/dist/ssr/InstagramLogo";
import { TiktokLogo } from "@phosphor-icons/react/dist/ssr/TiktokLogo";
import { WhatsappLogo } from "@phosphor-icons/react/dist/ssr/WhatsappLogo";
import { YoutubeLogo } from "@phosphor-icons/react/dist/ssr/YoutubeLogo";
import { POLICY_LINKS } from "@/lib/defaults";
import { safeHref } from "@/lib/safe";
import type { StoreSettings } from "@/lib/types";

export function Footer({ store, year }: { store: StoreSettings; year: number }) {
  const socials = [
    { href: safeHref(store.social.instagram), label: "Instagram", icon: InstagramLogo },
    { href: safeHref(store.social.facebook), label: "Facebook", icon: FacebookLogo },
    { href: safeHref(store.social.tiktok), label: "TikTok", icon: TiktokLogo },
    { href: safeHref(store.social.youtube), label: "YouTube", icon: YoutubeLogo },
    { href: safeHref(store.social.whatsapp), label: "WhatsApp", icon: WhatsappLogo },
  ].filter((item) => item.href);

  return (
    <footer className="mt-16 bg-pine text-paper">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:px-8 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="font-display text-3xl">{store.businessName}</p>
          <p className="mt-3 max-w-md text-sm leading-6 text-paper/75">{store.shortDescription}</p>
          {store.legalName ? <p className="mt-3 text-sm text-paper/70">{store.legalName}</p> : null}
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-paper/60">Shopping</p>
          <ul className="mt-4 space-y-2 text-sm text-paper/85">
            <li><Link href="/shop">Shop</Link></li>
            <li><Link href="/how-it-works">How it works</Link></li>
            <li><Link href="/faq">FAQs</Link></li>
            <li><Link href="/cart">Cart</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-paper/60">Support</p>
          <ul className="mt-4 space-y-2 text-sm text-paper/85">
            <li><Link href="/contact">Contact</Link></li>
            <li><Link href="/about">About us</Link></li>
            {POLICY_LINKS.map((policy) => (
              <li key={policy.href}>
                <Link href={policy.href}>{policy.label}</Link>
              </li>
            ))}
          </ul>
          <div className="mt-4 space-y-1 text-sm text-paper/70">
            {store.email ? <p><a href={`mailto:${store.email}`}>{store.email}</a></p> : null}
            {store.phone ? <p><a href={`tel:${store.phone}`}>{store.phone}</a></p> : null}
            {store.address ? <p>{store.address}</p> : null}
            {store.supportHours ? <p>{store.supportHours}</p> : null}
          </div>
          {socials.length > 0 ? (
            <ul className="mt-4 flex gap-3">
              {socials.map((item) => (
                <li key={item.label}>
                  <a href={item.href!} aria-label={item.label} className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-paper/25 hover:bg-paper/10">
                    <item.icon size={20} aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
      <div className="border-t border-paper/15 px-5 py-4 text-center text-xs text-paper/60 sm:px-8">
        © {year} {store.businessName}
      </div>
    </footer>
  );
}
