import "server-only";
export { catalogCached, refreshCatalog } from "@/lib/catalog-cache";
import {
  defaultAbout,
  defaultAnnouncement,
  defaultBenefits,
  defaultCampaigns,
  defaultFaqs,
  defaultHomepage,
  defaultPolicies,
  defaultSteps,
  defaultStore,
  defaultUseCases,
} from "@/lib/defaults";
import { newId, parseJson, slugify } from "@/lib/safe";
import { supabaseAdmin } from "@/lib/supabase";
import type {
  AboutContent,
  Announcement,
  Benefit,
  Campaign,
  Discount,
  Faq,
  HomepageContent,
  Inquiry,
  Order,
  OrderEvent,
  OrderLine,
  Policies,
  Product,
  ProductImage,
  ProductStatus,
  ProductVariant,
  Step,
  StoreSettings,
  UseCase,
} from "@/lib/types";

type Row = Record<string, unknown>;

function fail(error: { message: string } | null) {
  if (!error) return;
  console.error("database_request_failed");
  throw new Error("Database request failed.");
}

function asData<T>(value: unknown, fallback: T): T {
  if (value == null) return fallback;
  if (typeof value === "string") return parseJson(value, fallback);
  return value as T;
}

function flag(value: unknown) {
  return value === true || value === 1;
}

let seeding: Promise<void> | null = null;

function ensureSeeded() {
  seeding ??= seedIfEmpty().catch((error) => {
    seeding = null;
    throw error;
  });
  return seeding;
}

async function seedIfEmpty() {
  const existing = await supabaseAdmin().from("settings").select("key").eq("key", "store").maybeSingle();
  fail(existing.error);
  if (existing.data) return;
  const now = new Date().toISOString();
  const settings = [
    ["store", defaultStore()],
    ["homepage", defaultHomepage()],
    ["announcement", defaultAnnouncement()],
    ["benefits", defaultBenefits()],
    ["steps", defaultSteps()],
    ["useCases", defaultUseCases()],
    ["faqs", defaultFaqs()],
    ["policies", defaultPolicies()],
    ["about", defaultAbout()],
    ["campaigns", defaultCampaigns()],
  ] as const;
  const saved = await supabaseAdmin()
    .from("settings")
    .upsert(settings.map(([key, value]) => ({ key, value, updated_at: now })));
  fail(saved.error);
  const products = await supabaseAdmin().from("products").select("id", { count: "exact", head: true });
  fail(products.error);
  if ((products.count ?? 0) > 0) return;
  const inserted = await supabaseAdmin().from("products").insert({
    id: newId(),
    name: "Product name",
    slug: "product-name",
    short_description: "Placeholder listing for a toilet seat sanitizer. Replace the name, description, and price before launch.",
    description:
      "This is a placeholder product record. Publish verified details, packaging, and instructions before offering it for sale. No performance claims are included.",
    currency: "GHS",
    price_minor: null,
    compare_at_price_minor: null,
    sku: "",
    stock_quantity: 0,
    low_stock_threshold: 5,
    status: "coming_soon",
    featured: true,
    category: "Toilet seat sanitizer",
    images: [],
    variants: [],
    specs: [],
    benefits: [],
    instructions: [],
    seo_title: "",
    seo_description: "",
    created_at: now,
    updated_at: now,
  });
  if (inserted.error && !inserted.error.message.toLowerCase().includes("duplicate")) fail(inserted.error);
}

async function readSetting(key: string) {
  await ensureSeeded();
  const result = await supabaseAdmin().from("settings").select("value").eq("key", key).maybeSingle();
  fail(result.error);
  return result.data?.value ?? null;
}

async function writeSetting(key: string, value: unknown) {
  await ensureSeeded();
  const result = await supabaseAdmin().from("settings").upsert({ key, value, updated_at: new Date().toISOString() });
  fail(result.error);
}

async function setting<T>(key: string, fallback: () => T): Promise<T> {
  const raw = await readSetting(key);
  if (raw == null) return fallback();
  return asData(raw, fallback());
}

export async function getStore() {
  return { ...defaultStore(), ...(await setting("store", defaultStore)) };
}

export async function saveStore(value: StoreSettings) {
  await writeSetting("store", value);
}

export async function getHomepage() {
  const stored = await setting("homepage", defaultHomepage);
  const base = defaultHomepage();
  return {
    ...base,
    ...stored,
    hero: { ...base.hero, ...stored.hero },
    video: { ...base.video, ...stored.video },
  };
}

export async function saveHomepage(value: HomepageContent) {
  await writeSetting("homepage", value);
}

export async function getAnnouncement() {
  return { ...defaultAnnouncement(), ...(await setting("announcement", defaultAnnouncement)) };
}

export async function saveAnnouncement(value: Announcement) {
  await writeSetting("announcement", value);
}

export async function getBenefits() {
  return (await setting("benefits", defaultBenefits)).slice().sort((a, b) => a.sort - b.sort);
}

export async function saveBenefits(value: Benefit[]) {
  await writeSetting("benefits", value);
}

export async function getSteps() {
  return (await setting("steps", defaultSteps)).slice().sort((a, b) => a.sort - b.sort);
}

export async function saveSteps(value: Step[]) {
  await writeSetting("steps", value);
}

export async function getUseCases() {
  return (await setting("useCases", defaultUseCases)).slice().sort((a, b) => a.sort - b.sort);
}

export async function saveUseCases(value: UseCase[]) {
  await writeSetting("useCases", value);
}

export async function getFaqs() {
  return (await setting("faqs", defaultFaqs)).slice().sort((a, b) => a.sort - b.sort);
}

export async function saveFaqs(value: Faq[]) {
  await writeSetting("faqs", value);
}

export async function getPolicies() {
  return { ...defaultPolicies(), ...(await setting("policies", defaultPolicies)) };
}

export async function savePolicies(value: Policies) {
  await writeSetting("policies", value);
}

export async function getAbout() {
  return { ...defaultAbout(), ...(await setting("about", defaultAbout)) };
}

export async function saveAbout(value: AboutContent) {
  await writeSetting("about", value);
}

export async function getCampaigns() {
  return setting("campaigns", defaultCampaigns);
}

export async function saveCampaigns(value: Campaign[]) {
  await writeSetting("campaigns", value);
}

function mapProduct(row: Row): Product {
  return {
    id: String(row.id),
    name: String(row.name),
    slug: String(row.slug),
    shortDescription: String(row.short_description ?? ""),
    description: String(row.description ?? ""),
    currency: String(row.currency),
    priceMinor: row.price_minor == null ? null : Number(row.price_minor),
    compareAtPriceMinor: row.compare_at_price_minor == null ? null : Number(row.compare_at_price_minor),
    sku: String(row.sku ?? ""),
    stockQuantity: Number(row.stock_quantity ?? 0),
    lowStockThreshold: Number(row.low_stock_threshold ?? 0),
    status: String(row.status) as ProductStatus,
    featured: flag(row.featured),
    category: String(row.category ?? ""),
    images: asData<ProductImage[]>(row.images, []),
    variants: asData<ProductVariant[]>(row.variants, []),
    specs: asData(row.specs, []),
    benefits: asData(row.benefits, []),
    instructions: asData(row.instructions, []),
    seoTitle: String(row.seo_title ?? ""),
    seoDescription: String(row.seo_description ?? ""),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

async function productBy(column: "id" | "slug", value: string) {
  await ensureSeeded();
  const result = await supabaseAdmin().from("products").select("*").eq(column, value).maybeSingle();
  fail(result.error);
  return result.data ? mapProduct(result.data) : null;
}

export function getProductById(id: string) {
  return productBy("id", id);
}

export function getProductBySlug(slug: string) {
  return productBy("slug", slug);
}

export async function listProducts() {
  await ensureSeeded();
  const result = await supabaseAdmin().from("products").select("*").order("featured", { ascending: false }).order("updated_at", { ascending: false });
  fail(result.error);
  return (result.data ?? []).map(mapProduct);
}

export async function listPublicProducts(input: { q?: string; sort?: string; page?: number; pageSize?: number }) {
  await ensureSeeded();
  const pageSize = input.pageSize ?? 12;
  const page = Math.max(1, input.page ?? 1);
  let query = supabaseAdmin().from("products").select("*", { count: "exact" }).neq("status", "draft");
  const q = input.q?.trim().replace(/[%_,.()]/g, "");
  if (q) {
    const like = `%${q}%`;
    query = query.or(
      `name.ilike.${like},short_description.ilike.${like},description.ilike.${like},category.ilike.${like},sku.ilike.${like}`,
    );
  }
  const sort = input.sort ?? "featured";
  if (sort === "newest") query = query.order("created_at", { ascending: false });
  else if (sort === "name") query = query.order("name", { ascending: true });
  else if (sort === "price_asc") query = query.order("price_minor", { ascending: true, nullsFirst: false });
  else if (sort === "price_desc") query = query.order("price_minor", { ascending: false, nullsFirst: false });
  else query = query.order("featured", { ascending: false }).order("updated_at", { ascending: false });
  const from = (page - 1) * pageSize;
  const result = await query.range(from, from + pageSize - 1);
  fail(result.error);
  return { products: (result.data ?? []).map(mapProduct), total: result.count ?? 0, page, pageSize };
}

export async function uniqueSlug(name: string, currentId?: string) {
  await ensureSeeded();
  const base = slugify(name);
  let slug = base;
  let n = 2;
  while (true) {
    const result = await supabaseAdmin().from("products").select("id").eq("slug", slug).maybeSingle();
    fail(result.error);
    if (!result.data || result.data.id === currentId) return slug;
    slug = `${base}-${n}`;
    n += 1;
  }
}

export type ProductInput = Omit<Product, "createdAt" | "updatedAt" | "slug"> & { slug?: string };

export async function saveProduct(input: ProductInput) {
  const now = new Date().toISOString();
  const existing = input.id ? await getProductById(input.id) : null;
  const id = existing?.id ?? input.id ?? newId();
  const slug = await uniqueSlug(input.slug?.trim() || input.name, id);
  const images = existing?.images ?? input.images ?? [];
  const record = {
    name: input.name,
    slug,
    short_description: input.shortDescription,
    description: input.description,
    currency: input.currency,
    price_minor: input.priceMinor,
    compare_at_price_minor: input.compareAtPriceMinor,
    sku: input.sku,
    stock_quantity: input.stockQuantity,
    low_stock_threshold: input.lowStockThreshold,
    status: input.status,
    featured: input.featured,
    category: input.category,
    variants: input.variants,
    specs: input.specs,
    benefits: input.benefits,
    instructions: input.instructions,
    seo_title: input.seoTitle,
    seo_description: input.seoDescription,
    updated_at: now,
  };
  const result = existing
    ? await supabaseAdmin().from("products").update(record).eq("id", id)
    : await supabaseAdmin().from("products").insert({ ...record, id, images, created_at: now });
  fail(result.error);
  const saved = await getProductById(id);
  if (!saved) throw new Error("Database request failed.");
  return saved;
}

export async function updateProductImages(id: string, images: ProductImage[]) {
  const result = await supabaseAdmin().from("products").update({ images, updated_at: new Date().toISOString() }).eq("id", id);
  fail(result.error);
}

function mapDiscount(row: Row): Discount {
  return {
    id: String(row.id),
    code: String(row.code),
    type: row.type === "fixed" ? "fixed" : "percent",
    value: Number(row.value),
    minOrderMinor: Number(row.min_order_minor ?? 0),
    usageLimit: row.usage_limit == null ? null : Number(row.usage_limit),
    usedCount: Number(row.used_count ?? 0),
    expiresAt: row.expires_at == null ? null : String(row.expires_at),
    active: flag(row.active),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export async function getDiscountByCode(code: string) {
  const result = await supabaseAdmin().from("discount_codes").select("*").eq("code", code.trim().toUpperCase()).maybeSingle();
  fail(result.error);
  return result.data ? mapDiscount(result.data) : null;
}

export async function listDiscounts() {
  const result = await supabaseAdmin().from("discount_codes").select("*").order("created_at", { ascending: false });
  fail(result.error);
  return (result.data ?? []).map(mapDiscount);
}

export async function saveDiscount(input: Omit<Discount, "createdAt" | "updatedAt" | "usedCount"> & { usedCount?: number }) {
  const now = new Date().toISOString();
  const code = input.code.trim().toUpperCase();
  const existing = await getDiscountByCode(code);
  if (existing && existing.id !== input.id) throw new Error("A code with that name already exists.");
  const current = await supabaseAdmin().from("discount_codes").select("id").eq("id", input.id).maybeSingle();
  fail(current.error);
  const expiresAt = input.expiresAt || null;
  const result = current.data
    ? await supabaseAdmin()
        .from("discount_codes")
        .update({
          code,
          type: input.type,
          value: input.value,
          min_order_minor: input.minOrderMinor,
          usage_limit: input.usageLimit,
          expires_at: expiresAt,
          active: input.active,
          updated_at: now,
        })
        .eq("id", input.id)
    : await supabaseAdmin().from("discount_codes").insert({
        id: input.id,
        code,
        type: input.type,
        value: input.value,
        min_order_minor: input.minOrderMinor,
        usage_limit: input.usageLimit,
        used_count: 0,
        expires_at: expiresAt,
        active: input.active,
        created_at: now,
        updated_at: now,
      });
  fail(result.error);
}

export function mapOrder(row: Row): Order {
  return {
    id: String(row.id),
    orderNumber: String(row.order_number),
    accessToken: String(row.access_token),
    customerName: String(row.customer_name),
    customerEmail: String(row.customer_email),
    customerPhone: String(row.customer_phone),
    deliveryAddress: String(row.delivery_address),
    deliveryCity: String(row.delivery_city),
    deliveryRegion: String(row.delivery_region),
    deliveryInstructions: String(row.delivery_instructions ?? ""),
    deliveryMethod: String(row.delivery_method ?? ""),
    lineItems: asData<OrderLine[]>(row.line_items, []),
    subtotalMinor: Number(row.subtotal_minor),
    deliveryFeeMinor: Number(row.delivery_fee_minor),
    discountMinor: Number(row.discount_minor ?? 0),
    discountCode: row.discount_code == null ? null : String(row.discount_code),
    totalMinor: Number(row.total_minor),
    currency: String(row.currency),
    paymentStatus: String(row.payment_status) as Order["paymentStatus"],
    fulfillmentStatus: String(row.fulfillment_status) as Order["fulfillmentStatus"],
    paymentProvider: String(row.payment_provider),
    paymentReference: String(row.payment_reference),
    providerReference: String(row.provider_reference ?? ""),
    notificationStatus: String(row.notification_status ?? ""),
    inventoryHeld: flag(row.inventory_held),
    trackingCarrier: String(row.tracking_carrier ?? ""),
    trackingNumber: String(row.tracking_number ?? ""),
    internalNotes: String(row.internal_notes ?? ""),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

async function orderBy(column: "payment_reference" | "access_token" | "id", value: string) {
  const result = await supabaseAdmin().from("orders").select("*").eq(column, value).maybeSingle();
  fail(result.error);
  return result.data ? mapOrder(result.data) : null;
}

export function getOrderByReference(reference: string) {
  return orderBy("payment_reference", reference);
}

export function getOrderByToken(token: string) {
  return orderBy("access_token", token);
}

export function getOrderById(id: string) {
  return orderBy("id", id);
}

export async function listOrders(input: { q?: string; payment?: string | string[]; fulfillment?: string | string[]; page?: number; pageSize?: number }) {
  const pageSize = input.pageSize ?? 20;
  const page = Math.max(1, input.page ?? 1);
  let query = supabaseAdmin().from("orders").select("*", { count: "exact" });
  if (typeof input.payment === "string" && input.payment) query = query.eq("payment_status", input.payment);
  if (Array.isArray(input.payment)) query = query.in("payment_status", input.payment);
  if (typeof input.fulfillment === "string" && input.fulfillment) query = query.eq("fulfillment_status", input.fulfillment);
  if (Array.isArray(input.fulfillment)) query = query.in("fulfillment_status", input.fulfillment);
  const q = input.q?.trim().replace(/[%_,.()]/g, "");
  if (q) {
    const like = `%${q}%`;
    query = query.or(`order_number.ilike.${like},customer_email.ilike.${like},customer_name.ilike.${like},payment_reference.ilike.${like}`);
  }
  const from = (page - 1) * pageSize;
  const result = await query.order("created_at", { ascending: false }).range(from, from + pageSize - 1);
  fail(result.error);
  return { orders: (result.data ?? []).map(mapOrder), total: result.count ?? 0, page, pageSize };
}

export async function addOrderEvent(orderId: string, type: string, message: string, actor: string) {
  const result = await supabaseAdmin().from("order_events").insert({
    id: newId(),
    order_id: orderId,
    type,
    message,
    actor,
    created_at: new Date().toISOString(),
  });
  fail(result.error);
}

export async function listOrderEvents(orderId: string): Promise<OrderEvent[]> {
  const result = await supabaseAdmin().from("order_events").select("*").eq("order_id", orderId).order("created_at", { ascending: true });
  fail(result.error);
  return (result.data ?? []).map((row) => ({
    id: String(row.id),
    orderId: String(row.order_id),
    type: String(row.type),
    message: String(row.message),
    actor: String(row.actor),
    createdAt: String(row.created_at),
  }));
}

export async function addAudit(actor: string, action: string, entity: string, entityId: string, detail = "") {
  const result = await supabaseAdmin().from("audit_log").insert({
    id: newId(),
    actor,
    action,
    entity,
    entity_id: entityId,
    detail: detail.slice(0, 1000),
    created_at: new Date().toISOString(),
  });
  fail(result.error);
}

export async function saveInquiry(input: { name: string; email: string; phone: string; message: string }) {
  const id = newId();
  const result = await supabaseAdmin().from("inquiries").insert({
    id,
    name: input.name,
    email: input.email,
    phone: input.phone,
    message: input.message,
    created_at: new Date().toISOString(),
  });
  fail(result.error);
  return id;
}

export async function listInquiries(): Promise<Inquiry[]> {
  const result = await supabaseAdmin().from("inquiries").select("*").order("created_at", { ascending: false }).limit(200);
  fail(result.error);
  return (result.data ?? []).map((row) => ({
    id: String(row.id),
    name: String(row.name),
    email: String(row.email),
    phone: String(row.phone ?? ""),
    message: String(row.message),
    createdAt: String(row.created_at),
  }));
}

export async function recordPaymentEvent(id: string, reference: string, eventType: string) {
  const result = await supabaseAdmin().from("payment_events").insert({
    id,
    reference,
    event_type: eventType,
    created_at: new Date().toISOString(),
  });
  return !result.error;
}

async function orderCount(filters: { payment?: string | string[]; fulfillment?: string | string[] } = {}) {
  let query = supabaseAdmin().from("orders").select("id", { count: "exact", head: true });
  if (typeof filters.payment === "string") query = query.eq("payment_status", filters.payment);
  if (Array.isArray(filters.payment)) query = query.in("payment_status", filters.payment);
  if (typeof filters.fulfillment === "string") query = query.eq("fulfillment_status", filters.fulfillment);
  if (Array.isArray(filters.fulfillment)) query = query.in("fulfillment_status", filters.fulfillment);
  const result = await query;
  fail(result.error);
  return result.count ?? 0;
}

export async function dashboardMetrics() {
  const [totalOrders, pendingOrders, paidOrders, awaitingFulfillment, completedOrders, revenue, products, recent] = await Promise.all([
    orderCount(),
    orderCount({ payment: "pending" }),
    orderCount({ payment: "paid" }),
    orderCount({ payment: ["paid", "reconciled"], fulfillment: ["unfulfilled", "processing"] }),
    orderCount({ fulfillment: "completed" }),
    supabaseAdmin().rpc("verified_revenue_minor"),
    listProducts(),
    listOrders({ pageSize: 8 }),
  ]);
  if (revenue.error) fail(revenue.error);
  const lowStock = products.filter((product) => {
    if (product.status !== "published") return false;
    const stock = product.variants.length
      ? product.variants.reduce((sum, variant) => sum + (variant.available ? variant.stockQuantity : 0), 0)
      : product.stockQuantity;
    return stock <= product.lowStockThreshold;
  });
  return {
    totalOrders,
    pendingOrders,
    paidOrders,
    awaitingFulfillment,
    completedOrders,
    verifiedRevenueMinor: Number(revenue.data ?? 0),
    products,
    lowStock,
    recent: recent.orders,
  };
}
