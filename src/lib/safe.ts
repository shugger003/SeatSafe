export function safeHref(value: string | null | undefined) {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) return null;
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) return trimmed;
  try {
    const url = new URL(trimmed);
    if (url.protocol === "https:" || url.protocol === "http:") return url.toString();
    if (url.protocol === "mailto:" || url.protocol === "tel:") return url.toString();
  } catch {
    return null;
  }
  return null;
}

export function slugify(value: string) {
  const slug = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return slug || "item";
}

export function parseJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export const CANONICAL_SITE_URL = "https://seatshieldghana.com";

export function siteUrl() {
  if (process.env.VERCEL_ENV === "preview") {
    const host = process.env.VERCEL_URL?.trim();
    if (host) return `https://${host.replace(/^https?:\/\//, "")}`;
  }
  if (process.env.NODE_ENV === "production") return CANONICAL_SITE_URL;
  return (process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000").replace(/\/$/, "");
}

export function newId() {
  return crypto.randomUUID();
}
