import { Fragment } from "react";
import Link from "next/link";
import type { ReactNode } from "react";
import { CaretDown } from "@phosphor-icons/react/dist/ssr/CaretDown";
import { FacebookLogo } from "@phosphor-icons/react/dist/ssr/FacebookLogo";
import { InstagramLogo } from "@phosphor-icons/react/dist/ssr/InstagramLogo";
import { TiktokLogo } from "@phosphor-icons/react/dist/ssr/TiktokLogo";
import { WhatsappLogo } from "@phosphor-icons/react/dist/ssr/WhatsappLogo";
import { YoutubeLogo } from "@phosphor-icons/react/dist/ssr/YoutubeLogo";
import { POLICY_LINKS } from "@/lib/defaults";
import { PARTNERSHIP_LINKS } from "@/lib/partnerships";
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

const COMPANY_LINKS = PARTNERSHIP_LINKS;

const REGIONS = ["Ahafo", "Ashanti", "Bono", "Bono East", "Central", "Eastern", "Greater Accra", "North East", "Northern", "Oti", "Savannah", "Upper East", "Upper West", "Volta", "Western", "Western North"];

const SANS_HEADING = { fontFamily: "var(--font-sans)", fontWeight: 700 };

const linkClass = "text-paper/80 underline-offset-4 hover:text-paper hover:underline";
const tapLinkClass = `${linkClass} inline-flex min-h-10 items-center lg:min-h-0`;

type FooterLink = { href: string; label: string };

function FooterLinks({ links, className }: { links: FooterLink[]; className?: string }) {
  return (
    <ul className={className ? `text-sm ${className}` : "text-sm"}>
      {links.map((link) => (
        <li key={link.label}>
          <Link href={link.href} className={tapLinkClass}>{link.label}</Link>
        </li>
      ))}
    </ul>
  );
}

function FooterColumn({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <div>
      <h2 className="text-sm uppercase tracking-[0.14em]" style={SANS_HEADING}>{title}</h2>
      <FooterLinks links={links} className="mt-3 lg:mt-5 lg:space-y-3" />
    </div>
  );
}

function FooterAccordion({ title, children }: { title: string; children: ReactNode }) {
  return (
    <details className="group border-b border-paper/20">
      <summary
        className="flex min-h-11 cursor-pointer list-none items-center justify-between text-xs uppercase tracking-[0.14em] [&::-webkit-details-marker]:hidden"
        style={SANS_HEADING}
      >
        {title}
        <CaretDown size={14} aria-hidden="true" className="transition-transform group-open:rotate-180" />
      </summary>
      <div className="pb-3">{children}</div>
    </details>
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

  const socialList = (className: string, buttonClass: string) => (
    <ul className={className}>
      {socials.map((item) => (
        <li key={item.label}>
          <a
            href={item.href!}
            aria-label={item.label}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center justify-center rounded-full bg-paper text-pine transition-colors hover:bg-mist ${buttonClass}`}
          >
            <item.icon size={20} weight="fill" aria-hidden="true" />
          </a>
        </li>
      ))}
    </ul>
  );

  const regionList = (
    <p className="text-sm leading-7 text-paper/80">
      {REGIONS.map((region, index) => (
        <Fragment key={region}>
          <span className="whitespace-nowrap">
            {region}
            {index < REGIONS.length - 1 ? <span className="pl-2 pr-1 text-paper/40" aria-hidden="true">|</span> : null}
          </span>{" "}
        </Fragment>
      ))}
    </p>
  );

  return (
    <footer className="bg-pine text-paper">
      <div className="mx-auto max-w-6xl px-5 pt-7 sm:px-8 sm:pt-16">
        <div className="grid gap-5 sm:gap-12 lg:grid-cols-[1.25fr_2fr]">
          <div>
            <div className="flex items-center justify-between gap-4 sm:block">
              <Link href="/" className="inline-flex min-w-0 items-center gap-3">
                {store.logoUrl ? (
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white sm:size-16">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={store.logoUrl} alt="" className="size-9 object-contain sm:size-12" />
                  </span>
                ) : (
                  <svg viewBox="0 0 32 32" className="size-10 shrink-0 sm:size-12" aria-hidden="true">
                    <circle cx="16" cy="16" r="15" fill="#f3eee4" />
                    <circle cx="16" cy="16" r="8" fill="none" stroke="#1c4f45" strokeWidth="1.8" />
                    <circle cx="16" cy="16" r="3.2" fill="none" stroke="#1c4f45" strokeWidth="1.6" />
                  </svg>
                )}
                <span className="min-w-0">
                  <span className="block font-semibold tracking-[0.18em] sm:text-lg sm:tracking-[0.22em]">{store.businessName}</span>
                  {store.tagline ? <span className="block text-xs text-paper/70">{store.tagline}</span> : null}
                </span>
              </Link>
              {socials.length > 0 ? socialList("flex shrink-0 gap-2 sm:hidden", "size-10") : null}
            </div>
            <ul className="mt-3 flex flex-wrap gap-x-5 text-sm sm:mt-5 sm:block lg:mt-7 lg:space-y-2">
              {store.phone ? <li><a className={tapLinkClass} href={`tel:${store.phone.replace(/\s+/g, "")}`}>{store.phone}</a></li> : null}
              {store.email ? <li><a className={tapLinkClass} href={`mailto:${store.email}`}>{store.email}</a></li> : null}
              {store.address ? <li className="text-paper/80">{store.address}</li> : null}
              {store.supportHours ? <li className="text-paper/80">{store.supportHours}</li> : null}
            </ul>
            {socials.length > 0 ? socialList("mt-7 hidden flex-wrap gap-3 sm:flex", "size-11") : null}
          </div>
          <div className="border-t border-paper/20 sm:hidden">
            <nav aria-label="Footer">
              <FooterAccordion title="Information"><FooterLinks links={POLICY_LINKS} /></FooterAccordion>
              <FooterAccordion title="Quick links"><FooterLinks links={QUICK_LINKS} /></FooterAccordion>
              <FooterAccordion title="Company"><FooterLinks links={COMPANY_LINKS} /></FooterAccordion>
            </nav>
            <FooterAccordion title="Ordering across Ghana">{regionList}</FooterAccordion>
          </div>
          <nav aria-label="Footer" className="hidden grid-cols-3 gap-x-6 gap-y-10 sm:grid">
            <FooterColumn title="Information" links={POLICY_LINKS} />
            <FooterColumn title="Quick links" links={QUICK_LINKS} />
            <FooterColumn title="Company" links={COMPANY_LINKS} />
          </nav>
        </div>

        <div className="mt-14 hidden sm:block">
          <h2 className="text-base" style={SANS_HEADING}>Ordering across Ghana</h2>
          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-paper/70">Regions</p>
          <div className="mt-2">{regionList}</div>
        </div>

        <div className="py-3 text-center text-xs text-paper/75 sm:mt-12 sm:border-t sm:border-paper/20 sm:py-6 sm:text-sm">
          <p>
            <span className="sm:hidden">© {year} {store.businessName}</span>
            <span className="hidden sm:inline">Copyright © {year} · All rights reserved {store.businessName}</span>
            <span className="px-2 text-paper/40" aria-hidden="true">|</span>
            <a href="/sitemap.xml" className={`${linkClass} inline-flex min-h-10 items-center sm:inline sm:min-h-0`}>Sitemap</a>
          </p>
          {store.storeStatus === "paused" ? <p className="mt-2 text-xs">Ordering is paused.</p> : null}
          {store.storeStatus === "coming_soon" ? <p className="mt-2 text-xs">Orders open soon.</p> : null}
        </div>
      </div>
    </footer>
  );
}
