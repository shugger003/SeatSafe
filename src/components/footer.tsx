import { Fragment } from "react";
import Link from "next/link";
import { FacebookLogo } from "@phosphor-icons/react/dist/ssr/FacebookLogo";
import { InstagramLogo } from "@phosphor-icons/react/dist/ssr/InstagramLogo";
import { TiktokLogo } from "@phosphor-icons/react/dist/ssr/TiktokLogo";
import { WhatsappLogo } from "@phosphor-icons/react/dist/ssr/WhatsappLogo";
import { YoutubeLogo } from "@phosphor-icons/react/dist/ssr/YoutubeLogo";
import { POLICY_LINKS } from "@/lib/defaults";
import { safeHref } from "@/lib/safe";
import type { StoreSettings } from "@/lib/types";

const QUICK_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About us" },
  { href: "/shop", label: "Shop" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/faq", label: "FAQs" },
  { href: "/contact", label: "Contact us" },
];

const COMPANY_LINKS = [
  { href: "/contact", label: "Bulk Buying" },
  { href: "/contact", label: "Become an Affiliate" },
  { href: "/contact", label: "Become a Distributor" },
];

const REGIONS = ["Ahafo", "Ashanti", "Bono", "Bono East", "Central", "Eastern", "Greater Accra", "North East", "Northern", "Oti", "Savannah", "Upper East", "Upper West", "Volta", "Western", "Western North"];

const SANS_HEADING = { fontFamily: "var(--font-sans)", fontWeight: 700 };

const linkClass = "text-paper/80 underline-offset-4 hover:text-paper hover:underline";

function FooterColumn({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <h2 className="text-sm uppercase tracking-[0.14em]" style={SANS_HEADING}>{title}</h2>
      <ul className="mt-5 space-y-3 text-sm">
        {links.map((link) => (
          <li key={link.label}>
            <Link href={link.href} className={linkClass}>{link.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer({ store, year }: { store: StoreSettings; year: number }) {
  const socials = [
    { href: safeHref(store.social.facebook), label: "Facebook", icon: FacebookLogo },
    { href: safeHref(store.social.instagram), label: "Instagram", icon: InstagramLogo },
    { href: safeHref(store.social.tiktok), label: "TikTok", icon: TiktokLogo },
    { href: safeHref(store.social.youtube), label: "YouTube", icon: YoutubeLogo },
    { href: safeHref(store.social.whatsapp), label: "WhatsApp", icon: WhatsappLogo },
  ].filter((item) => item.href);

  return (
    <footer className="bg-pine text-paper">
      <div className="mx-auto max-w-6xl px-5 pt-16 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.25fr_2fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-3">
              {store.logoUrl ? (
                <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-paper">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={store.logoUrl} alt="" className="h-12 w-12 object-contain" />
                </span>
              ) : (
                <svg viewBox="0 0 32 32" className="h-12 w-12" aria-hidden="true">
                  <circle cx="16" cy="16" r="15" fill="#f3eee4" />
                  <circle cx="16" cy="16" r="8" fill="none" stroke="#1c4f45" strokeWidth="1.8" />
                  <circle cx="16" cy="16" r="3.2" fill="none" stroke="#1c4f45" strokeWidth="1.6" />
                </svg>
              )}
              <span>
                <span className="block text-lg font-semibold tracking-[0.22em]">{store.businessName}</span>
                {store.tagline ? <span className="block text-xs text-paper/70">{store.tagline}</span> : null}
              </span>
            </Link>
            <ul className="mt-7 space-y-2 text-sm">
              {store.phone ? <li><a className={linkClass} href={`tel:${store.phone.replace(/\s+/g, "")}`}>{store.phone}</a></li> : null}
              {store.email ? <li><a className={linkClass} href={`mailto:${store.email}`}>{store.email}</a></li> : null}
              {store.address ? <li className="text-paper/80">{store.address}</li> : null}
              {store.supportHours ? <li className="text-paper/80">{store.supportHours}</li> : null}
            </ul>
            {socials.length > 0 ? (
              <ul className="mt-7 flex flex-wrap gap-3">
                {socials.map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href!}
                      aria-label={item.label}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-paper text-pine transition-colors hover:bg-mist"
                    >
                      <item.icon size={20} weight="fill" aria-hidden="true" />
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3">
            <FooterColumn title="Information" links={POLICY_LINKS} />
            <FooterColumn title="Quick links" links={QUICK_LINKS} />
            <FooterColumn title="Company" links={COMPANY_LINKS} />
          </nav>
        </div>

        <div className="mt-14">
          <h2 className="text-base" style={SANS_HEADING}>Ordering across Ghana</h2>
          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-paper/70">Regions</p>
          <p className="mt-2 text-sm leading-7 text-paper/80">
            {REGIONS.map((region, index) => (
              <Fragment key={region}>
                <span className="whitespace-nowrap">
                  {region}
                  {index < REGIONS.length - 1 ? <span className="pl-2 pr-1 text-paper/40" aria-hidden="true">|</span> : null}
                </span>{" "}
              </Fragment>
            ))}
          </p>
        </div>

        <div className="mt-12 border-t border-paper/20 py-6 text-center text-sm text-paper/75">
          <p>
            Copyright © {year} · All rights reserved {store.businessName}
            <span className="px-2 text-paper/40" aria-hidden="true">|</span>
            <a href="/sitemap.xml" className={linkClass}>Sitemap</a>
          </p>
          {store.storeStatus === "paused" ? <p className="mt-2 text-xs">Ordering is paused.</p> : null}
          {store.storeStatus === "coming_soon" ? <p className="mt-2 text-xs">Orders open when the catalog, delivery, and payment details are published.</p> : null}
        </div>
      </div>
    </footer>
  );
}
