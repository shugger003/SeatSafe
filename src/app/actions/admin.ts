"use server";

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { clearSessionCookie, getSession, loginAdmin, setSessionCookie } from "@/lib/auth";
import {
  addAudit,
  getAbout,
  getAnnouncement,
  getBenefits,
  getCampaigns,
  getFaqs,
  getHomepage,
  getPolicies,
  getProductById,
  getSteps,
  getStore,
  getUseCases,
  listDiscounts,
  saveAbout,
  saveAnnouncement,
  saveBenefits,
  saveCampaigns,
  saveDiscount,
  saveFaqs,
  saveHomepage,
  savePolicies,
  saveProduct,
  saveSteps,
  saveStore,
  saveUseCases,
  updateProductImages,
} from "@/lib/db";
import { majorToMinor } from "@/lib/money";
import { reconcileOrder, updateFulfillment } from "@/lib/orders";
import { rateLimit } from "@/lib/rate-limit";
import { newId, slugify } from "@/lib/safe";
import { FAQ_CATEGORIES, ICON_KEYS, IMAGE_ROLES, PRODUCT_STATUSES, STORE_STATUSES } from "@/lib/types";
import type { Benefit, Faq, ImageRole, ProductImage, Step, UseCase } from "@/lib/types";

function bounce(path: string, message: string): never {
  redirect(`${path}?notice=${encodeURIComponent(message)}`);
}

async function admin() {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  return session;
}

function refresh() {
  revalidatePath("/", "layout");
}

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") || "");
  if (!rateLimit(`login:${email.toLowerCase()}`, 8, 15 * 60_000).ok) {
    return { error: "Too many attempts. Wait a few minutes." };
  }
  const token = await loginAdmin(email, String(formData.get("password") || ""));
  if (!token) return { error: "Those details were not accepted." };
  await setSessionCookie(token);
  redirect("/admin");
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/admin/login");
}

const variantSchema = z.object({
  id: z.string().min(1).max(80),
  name: z.string().trim().min(1).max(80),
  sku: z.string().trim().max(80),
  priceMinor: z.number().int().nonnegative().nullable(),
  compareAtPriceMinor: z.number().int().nonnegative().nullable(),
  stockQuantity: z.number().int().nonnegative(),
  available: z.boolean(),
});

const productSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1).max(160),
  slug: z.string().trim().max(80).optional(),
  shortDescription: z.string().trim().max(300),
  description: z.string().trim().max(8000),
  priceMinor: z.number().int().nonnegative().nullable(),
  compareAtPriceMinor: z.number().int().nonnegative().nullable(),
  sku: z.string().trim().max(80),
  stockQuantity: z.number().int().nonnegative(),
  lowStockThreshold: z.number().int().nonnegative(),
  status: z.enum(PRODUCT_STATUSES),
  featured: z.boolean(),
  category: z.string().trim().max(80),
  specs: z.array(z.object({ label: z.string().trim().max(80), value: z.string().trim().max(240) })).max(30),
  benefits: z.array(z.object({ label: z.string().trim().max(80), value: z.string().trim().max(300) })).max(12),
  instructions: z.array(z.object({ title: z.string().trim().max(80), body: z.string().trim().max(500) })).max(8),
  variants: z.array(variantSchema).max(12),
  seoTitle: z.string().trim().max(70),
  seoDescription: z.string().trim().max(180),
});

export async function saveProductAction(input: unknown) {
  const session = await admin();
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Check the product fields and try again." };
  const store = await getStore();
  const data = parsed.data;
  if (data.compareAtPriceMinor != null && data.priceMinor != null && data.compareAtPriceMinor <= data.priceMinor) {
    return { ok: false as const, error: "A comparison price must be higher than the selling price." };
  }
  const priced = data.variants.length
    ? data.variants.some((variant) => variant.available && variant.priceMinor != null && variant.priceMinor > 0)
    : data.priceMinor != null && data.priceMinor > 0;
  if (data.status === "published" && !priced) {
    return { ok: false as const, error: "Add a selling price before publishing." };
  }
  const saved = await saveProduct({
    ...data,
    id: data.id || newId(),
    currency: store.currency,
    images: [],
  });
  await addAudit(session.email, "save_product", "product", saved.id, saved.status);
  refresh();
  return { ok: true as const, id: saved.id, slug: saved.slug };
}

function sniff(bytes: Uint8Array) {
  if (bytes[0] === 0xff && bytes[1] === 0xd8) return "jpg";
  if (bytes[0] === 0x89 && bytes[1] === 0x50) return "png";
  if (bytes.length > 12 && String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP") return "webp";
  if (String.fromCharCode(...bytes.slice(0, 3)) === "GIF") return "gif";
  return null;
}

export async function uploadImageAction(formData: FormData) {
  const session = await admin();
  const product = await getProductById(String(formData.get("productId") || ""));
  if (!product) bounce("/admin/products", "Product not found.");
  const back = `/admin/products/${product.id}`;
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) bounce(back, "Choose an image.");
  if (file.size > 5_000_000) bounce(back, "Use an image under 5 MB.");
  const bytes = new Uint8Array(await file.arrayBuffer());
  const kind = sniff(bytes);
  if (!kind) bounce(back, "Use a JPEG, PNG, WEBP, or GIF.");
  const role = IMAGE_ROLES.includes(String(formData.get("role")) as ImageRole) ? (String(formData.get("role")) as ImageRole) : "primary";
  const id = newId();
  const filename = `${id}.${kind}`;
  const dir = path.join(process.cwd(), "data", "uploads");
  mkdirSync(dir, { recursive: true });
  writeFileSync(path.join(dir, filename), bytes);
  const image: ProductImage = {
    id,
    src: `/media/${filename}`,
    alt: String(formData.get("alt") || `${product.name} product image`).slice(0, 180),
    role,
  };
  await updateProductImages(product.id, [...product.images, image]);
  await addAudit(session.email, "upload_image", "product", product.id);
  refresh();
}

export async function removeImageAction(formData: FormData) {
  const session = await admin();
  const product = await getProductById(String(formData.get("productId") || ""));
  if (!product) return;
  await updateProductImages(product.id, product.images.filter((image) => image.id !== String(formData.get("imageId"))));
  await addAudit(session.email, "remove_image", "product", product.id);
  refresh();
}

export async function saveStoreAction(formData: FormData) {
  const session = await admin();
  const current = await getStore();
  const status = String(formData.get("storeStatus"));
  await saveStore({
    ...current,
    businessName: String(formData.get("businessName") || "Brand name").slice(0, 80),
    legalName: String(formData.get("legalName") || "").slice(0, 120),
    tagline: String(formData.get("tagline") || "").slice(0, 120),
    shortDescription: String(formData.get("shortDescription") || "").slice(0, 400),
    logoUrl: String(formData.get("logoUrl") || "").slice(0, 300),
    currency: String(formData.get("currency") || "GHS").toUpperCase().slice(0, 3),
    email: String(formData.get("email") || "").slice(0, 160),
    phone: String(formData.get("phone") || "").slice(0, 40),
    address: String(formData.get("address") || "").slice(0, 200),
    supportHours: String(formData.get("supportHours") || "").slice(0, 160),
    social: {
      instagram: String(formData.get("instagram") || "").slice(0, 200),
      facebook: String(formData.get("facebook") || "").slice(0, 200),
      tiktok: String(formData.get("tiktok") || "").slice(0, 200),
      youtube: String(formData.get("youtube") || "").slice(0, 200),
      whatsapp: String(formData.get("whatsapp") || "").slice(0, 200),
    },
    storeStatus: STORE_STATUSES.includes(status as (typeof STORE_STATUSES)[number]) ? (status as (typeof STORE_STATUSES)[number]) : current.storeStatus,
    showPreparationNotice: formData.get("showPreparationNotice") === "on",
    preparationNotice: String(formData.get("preparationNotice") || "").slice(0, 300),
    reservationMinutes: Math.min(180, Math.max(5, Number(formData.get("reservationMinutes")) || 30)),
    timezone: String(formData.get("timezone") || current.timezone).slice(0, 60),
  });
  await addAudit(session.email, "save_store", "settings", "store");
  refresh();
}

export async function saveDeliveryAction(formData: FormData) {
  const session = await admin();
  const store = await getStore();
  const id = String(formData.get("id") || "") || newId();
  const fee = majorToMinor(String(formData.get("fee") || ""));
  if (fee == null) bounce("/admin/settings", "Enter a delivery fee, using 0.00 if the business has confirmed there is no charge.");
  const next = store.deliveryMethods.filter((method) => method.id !== id);
  next.push({
    id,
    label: String(formData.get("label") || "Delivery").slice(0, 80),
    feeMinor: fee,
    summary: String(formData.get("summary") || "").slice(0, 240),
    active: formData.get("active") === "on",
  });
  await saveStore({ ...store, deliveryMethods: next });
  await addAudit(session.email, "save_delivery", "settings", id);
  refresh();
}

export async function removeDeliveryAction(formData: FormData) {
  const session = await admin();
  const id = String(formData.get("id") || "");
  const store = await getStore();
  await saveStore({ ...store, deliveryMethods: store.deliveryMethods.filter((method) => method.id !== id) });
  await addAudit(session.email, "remove_delivery", "settings", id);
  refresh();
}

export async function saveHeroAction(formData: FormData) {
  await admin();
  const home = await getHomepage();
  await saveHomepage({
    ...home,
    hero: {
      eyebrow: String(formData.get("eyebrow") || "").slice(0, 60),
      headline: String(formData.get("headline") || "").slice(0, 140),
      description: String(formData.get("description") || "").slice(0, 400),
      primaryLabel: String(formData.get("primaryLabel") || "").slice(0, 40),
      primaryHref: String(formData.get("primaryHref") || "/shop").slice(0, 120),
      secondaryLabel: String(formData.get("secondaryLabel") || "").slice(0, 40),
      secondaryHref: String(formData.get("secondaryHref") || "/how-it-works").slice(0, 120),
    },
    benefitsHeading: String(formData.get("benefitsHeading") || home.benefitsHeading).slice(0, 80),
    benefitsIntro: String(formData.get("benefitsIntro") || "").slice(0, 300),
    stepsHeading: String(formData.get("stepsHeading") || home.stepsHeading).slice(0, 80),
    stepsIntro: String(formData.get("stepsIntro") || "").slice(0, 300),
    showcaseHeading: String(formData.get("showcaseHeading") || home.showcaseHeading).slice(0, 80),
    showcaseIntro: String(formData.get("showcaseIntro") || "").slice(0, 300),
    faqHeading: String(formData.get("faqHeading") || home.faqHeading).slice(0, 80),
    faqIntro: String(formData.get("faqIntro") || "").slice(0, 300),
    trustHeading: String(formData.get("trustHeading") || home.trustHeading).slice(0, 80),
    trustIntro: String(formData.get("trustIntro") || "").slice(0, 300),
    useCasesHeading: String(formData.get("useCasesHeading") || home.useCasesHeading).slice(0, 80),
    useCasesIntro: String(formData.get("useCasesIntro") || "").slice(0, 300),
    finalHeading: String(formData.get("finalHeading") || home.finalHeading).slice(0, 80),
    finalText: String(formData.get("finalText") || "").slice(0, 300),
    video: {
      heading: String(formData.get("videoHeading") || "").slice(0, 80),
      description: String(formData.get("videoDescription") || "").slice(0, 300),
      url: String(formData.get("videoUrl") || "").slice(0, 300),
      posterUrl: String(formData.get("posterUrl") || "").slice(0, 300),
    },
  });
  refresh();
}

export async function saveAnnouncementAction(formData: FormData) {
  await admin();
  await saveAnnouncement({
    enabled: formData.get("enabled") === "on",
    message: String(formData.get("message") || "").slice(0, 180),
    href: String(formData.get("href") || "").slice(0, 200),
  });
  refresh();
}

function iconOf(value: string) {
  return ICON_KEYS.includes(value as (typeof ICON_KEYS)[number]) ? (value as (typeof ICON_KEYS)[number]) : "spark";
}

export async function saveBenefitAction(formData: FormData) {
  await admin();
  const items = await getBenefits();
  const id = String(formData.get("id") || "") || newId();
  const next: Benefit = {
    id,
    icon: iconOf(String(formData.get("icon") || "spark")),
    title: String(formData.get("title") || "").slice(0, 80),
    description: String(formData.get("description") || "").slice(0, 300),
    published: formData.get("published") === "on",
    sort: Number(formData.get("sort")) || items.length + 1,
  };
  await saveBenefits([...items.filter((item) => item.id !== id), next]);
  refresh();
}

export async function deleteContentAction(formData: FormData) {
  await admin();
  const kind = String(formData.get("kind"));
  const id = String(formData.get("id"));
  if (kind === "benefit") await saveBenefits((await getBenefits()).filter((item) => item.id !== id));
  if (kind === "step") await saveSteps((await getSteps()).filter((item) => item.id !== id));
  if (kind === "use") await saveUseCases((await getUseCases()).filter((item) => item.id !== id));
  if (kind === "faq") await saveFaqs((await getFaqs()).filter((item) => item.id !== id));
  if (kind === "campaign") await saveCampaigns((await getCampaigns()).filter((item) => item.id !== id));
  refresh();
}

export async function saveStepAction(formData: FormData) {
  await admin();
  const items = await getSteps();
  const id = String(formData.get("id") || "") || newId();
  const next: Step = {
    id,
    title: String(formData.get("title") || "").slice(0, 80),
    body: String(formData.get("body") || "").slice(0, 500),
    imageUrl: String(formData.get("imageUrl") || "").slice(0, 300),
    imageAlt: String(formData.get("imageAlt") || "").slice(0, 180),
    published: formData.get("published") === "on",
    sort: Number(formData.get("sort")) || items.length + 1,
  };
  await saveSteps([...items.filter((item) => item.id !== id), next]);
  refresh();
}

export async function saveUseCaseAction(formData: FormData) {
  await admin();
  const items = await getUseCases();
  const id = String(formData.get("id") || "") || newId();
  const next: UseCase = {
    id,
    icon: iconOf(String(formData.get("icon") || "home")),
    title: String(formData.get("title") || "").slice(0, 80),
    description: String(formData.get("description") || "").slice(0, 300),
    imageUrl: String(formData.get("imageUrl") || "").slice(0, 300),
    imageAlt: String(formData.get("imageAlt") || "").slice(0, 180),
    published: formData.get("published") === "on",
    sort: Number(formData.get("sort")) || items.length + 1,
  };
  await saveUseCases([...items.filter((item) => item.id !== id), next]);
  refresh();
}

export async function saveFaqAction(formData: FormData) {
  await admin();
  const items = await getFaqs();
  const id = String(formData.get("id") || "") || newId();
  const category = String(formData.get("category"));
  const next: Faq = {
    id,
    question: String(formData.get("question") || "").slice(0, 180),
    answer: String(formData.get("answer") || "").slice(0, 2000),
    category: FAQ_CATEGORIES.includes(category as (typeof FAQ_CATEGORIES)[number]) ? (category as (typeof FAQ_CATEGORIES)[number]) : "product",
    published: formData.get("published") === "on",
    sort: Number(formData.get("sort")) || items.length + 1,
  };
  await saveFaqs([...items.filter((item) => item.id !== id), next]);
  refresh();
}

export async function savePolicyAction(formData: FormData) {
  await admin();
  const key = String(formData.get("key"));
  if (key !== "shipping" && key !== "returns" && key !== "privacy" && key !== "terms") return;
  const policies = await getPolicies();
  policies[key] = {
    title: String(formData.get("title") || policies[key].title).slice(0, 80),
    body: String(formData.get("body") || "").slice(0, 8000),
    reviewed: formData.get("reviewed") === "on",
  };
  await savePolicies(policies);
  refresh();
}

export async function saveAboutAction(formData: FormData) {
  await admin();
  await saveAbout({
    heading: String(formData.get("heading") || "About").slice(0, 80),
    body: String(formData.get("body") || "").slice(0, 6000),
  });
  refresh();
}

export async function saveDiscountAction(formData: FormData) {
  const session = await admin();
  const type = String(formData.get("type")) === "fixed" ? "fixed" : "percent";
  const raw = String(formData.get("value") || "");
  const value = type === "percent" ? Number(raw) : majorToMinor(raw);
  if (value == null || !Number.isInteger(value) || value <= 0 || (type === "percent" && value > 100)) {
    bounce("/admin/discounts", "Enter a percentage from 1 to 100, or a fixed amount such as 10.00.");
  }
  const code = String(formData.get("code") || "").trim().toUpperCase();
  if (!/^[A-Z0-9-]{3,24}$/.test(code)) bounce("/admin/discounts", "Use 3–24 letters, numbers, or hyphens.");
  const existing = (await listDiscounts()).find((item) => item.code === code);
  await saveDiscount({
    id: existing?.id || newId(),
    code,
    type,
    value,
    minOrderMinor: majorToMinor(String(formData.get("minimum") || "0")) ?? 0,
    usageLimit: String(formData.get("usageLimit") || "").trim() ? Number(formData.get("usageLimit")) : null,
    expiresAt: String(formData.get("expiresAt") || "") || null,
    active: formData.get("active") === "on",
  });
  await addAudit(session.email, "save_discount", "discount", code);
  refresh();
}

export async function fulfillmentAction(formData: FormData) {
  const session = await admin();
  const status = String(formData.get("status"));
  const orderId = String(formData.get("orderId"));
  if (!["unfulfilled", "processing", "shipped", "completed", "cancelled"].includes(status)) {
    bounce(`/admin/orders/${orderId}`, "Choose a fulfillment status.");
  }
  const result = await updateFulfillment({
    orderId: String(formData.get("orderId")),
    status: status as "unfulfilled" | "processing" | "shipped" | "completed" | "cancelled",
    trackingCarrier: String(formData.get("carrier") || "").slice(0, 80),
    trackingNumber: String(formData.get("tracking") || "").slice(0, 80),
    note: String(formData.get("note") || "").slice(0, 500),
    restoreStock: formData.get("restoreStock") === "on",
    actor: session.email,
  });
  if (!result.ok) bounce(`/admin/orders/${orderId}`, result.error);
  await addAudit(session.email, "fulfillment", "order", orderId, status);
  refresh();
}

export async function reconcileAction(formData: FormData) {
  const session = await admin();
  const orderId = String(formData.get("orderId"));
  const result = await reconcileOrder({
    orderId,
    reason: String(formData.get("reason") || ""),
    externalReference: String(formData.get("reference") || ""),
    actor: session.email,
  });
  if (!result.ok) bounce(`/admin/orders/${orderId}`, result.error);
  await addAudit(session.email, "reconcile", "order", orderId);
  refresh();
}

export async function saveCampaignAction(formData: FormData) {
  await admin();
  const items = await getCampaigns();
  const id = String(formData.get("id") || "") || newId();
  const title = String(formData.get("title") || "Campaign").slice(0, 80);
  const next = {
    id,
    slug: slugify(String(formData.get("slug") || title)),
    eyebrow: String(formData.get("eyebrow") || "").slice(0, 60),
    title,
    description: String(formData.get("description") || "").slice(0, 240),
    body: String(formData.get("body") || "").slice(0, 4000),
    productSlug: slugify(String(formData.get("productSlug") || "")),
    published: formData.get("published") === "on",
    seoTitle: String(formData.get("seoTitle") || "").slice(0, 70),
    seoDescription: String(formData.get("seoDescription") || "").slice(0, 180),
  };
  await saveCampaigns([...items.filter((item) => item.id !== id), next]);
  refresh();
}
