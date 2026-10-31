import { phoneDigits } from "@/lib/contact";

export const PARTNERSHIPS = {
  bulk: {
    href: "/bulk",
    nav: "Bulk Buying",
    title: "Bulk buying",
    request: "Bulk buying",
    description: "Ask for a price on a larger order of SitSafe toilet seat sanitizer.",
    lead: "Hotels, offices, schools, clinics, and shops can order 50 bottles or more.",
    detail: "Tell us how many bottles you need and where they should go. We reply with a price for that order and how delivery would work.",
    caveat: "A bulk price is not listed on this page. We confirm it when we reply. Orders under 50 bottles stay on the shop.",
    submit: "Ask for a quote",
    shop: "For fewer than 50 bottles, use the shop.",
  },
  affiliate: {
    href: "/affiliate",
    nav: "Become an Affiliate",
    title: "Become an affiliate",
    request: "Affiliate",
    description: "Tell SitSafe where you would share the toilet seat sanitizer.",
    lead: "Share SitSafe with people who would use a toilet seat sanitizer.",
    detail: "Tell us where you would talk about it, such as Instagram, WhatsApp, a website, or a shop. We reply with how an affiliate arrangement would work.",
    caveat: "A commission is not listed on this page. We confirm it when we reply.",
    submit: "Apply to be an affiliate",
    shop: "See the product in the shop.",
  },
  distributor: {
    href: "/distributor",
    nav: "Become a Distributor",
    title: "Become a distributor",
    request: "Distributor",
    description: "Ask to stock SitSafe and sell it in your part of Ghana.",
    lead: "Stock SitSafe and sell it where you already reach customers.",
    detail: "Tell us the business name, the region you cover, and whether you have a shop, delivery, or both. We reply with the terms for stocking it.",
    caveat: "A territory is not assigned on this page. We confirm it when we reply.",
    submit: "Apply to be a distributor",
    shop: "See the product in the shop.",
  },
} as const;

export type PartnershipId = keyof typeof PARTNERSHIPS;

export const PARTNERSHIP_LINKS = (Object.keys(PARTNERSHIPS) as PartnershipId[]).map((id) => ({
  href: PARTNERSHIPS[id].href,
  label: PARTNERSHIPS[id].nav,
}));

export const SELLING_OPTIONS = ["A shop", "Delivery", "A shop and delivery"] as const;

export function inquiryTopic(message: string) {
  const first = message.split("\n", 1)[0] ?? "";
  const match = /^Request: (.+)$/.exec(first);
  if (!match) return "";
  const title = match[1];
  return (Object.keys(PARTNERSHIPS) as PartnershipId[]).some((id) => PARTNERSHIPS[id].request === title) ? title : "";
}

export function inquiryBody(message: string) {
  if (!inquiryTopic(message)) return message;
  return message.split("\n").slice(1).join("\n").trim();
}

type PartnershipInput = {
  kind: string;
  name: string;
  phone: string;
  organisation: string;
  quantity: string;
  place: string;
  channel: string;
  selling: string;
  note: string;
};

export function partnershipMessage(input: PartnershipInput): { ok: true; message: string } | { ok: false; message: string } {
  const kind = input.kind as PartnershipId;
  const page = PARTNERSHIPS[kind];
  if (!page) return { ok: false, message: "Choose bulk buying, affiliate, or distributor." };
  if (!phoneDigits(input.phone)) return { ok: false, message: "Enter a phone number we can call." };

  const lines = [`Request: ${page.request}`];
  const note = input.note.trim();

  if (kind === "bulk") {
    if (!/^\d+$/.test(input.quantity) || Number(input.quantity) < 50 || Number(input.quantity) > 10000) {
      return { ok: false, message: "Bulk orders start at 50 bottles." };
    }
    const place = input.place.trim();
    if (place.length < 2) return { ok: false, message: "Tell us where to deliver." };
    if (input.organisation.trim()) lines.push(`Organisation: ${input.organisation.trim()}`);
    lines.push(`Bottles: ${Number(input.quantity)}`);
    lines.push(`Deliver to: ${place}`);
  }

  if (kind === "affiliate") {
    const channel = input.channel.trim();
    if (channel.length < 2) return { ok: false, message: "Tell us where you would share SitSafe." };
    lines.push(`Where they would share it: ${channel}`);
  }

  if (kind === "distributor") {
    const organisation = input.organisation.trim();
    const place = input.place.trim();
    if (organisation.length < 2) return { ok: false, message: "Enter the business name." };
    if (place.length < 2) return { ok: false, message: "Tell us which region you cover." };
    if (!SELLING_OPTIONS.includes(input.selling as (typeof SELLING_OPTIONS)[number])) {
      return { ok: false, message: "Choose whether you have a shop, delivery, or both." };
    }
    lines.push(`Business: ${organisation}`);
    lines.push(`Region: ${place}`);
    lines.push(`Selling: ${input.selling}`);
  }

  if (note) lines.push("", note);
  return { ok: true, message: lines.join("\n").slice(0, 2000) };
}
