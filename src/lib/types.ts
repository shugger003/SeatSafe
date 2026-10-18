export const PRODUCT_STATUSES = ["draft", "coming_soon", "published", "unavailable"] as const;
export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

export const STORE_STATUSES = ["coming_soon", "open", "paused"] as const;
export type StoreStatus = (typeof STORE_STATUSES)[number];

export const IMAGE_ROLES = ["primary", "angle", "packaging", "lifestyle", "instruction"] as const;
export type ImageRole = (typeof IMAGE_ROLES)[number];

export const ICON_KEYS = [
  "bottle",
  "hand",
  "bag",
  "home",
  "clock",
  "spark",
  "leaf",
  "shield",
  "truck",
  "card",
  "office",
  "hotel",
  "dining",
  "travel",
] as const;
export type IconKey = (typeof ICON_KEYS)[number];

export const FAQ_CATEGORIES = [
  "product",
  "usage",
  "packaging",
  "ingredients",
  "safety",
  "storage",
  "delivery",
  "payment",
  "returns",
  "support",
] as const;
export type FaqCategory = (typeof FAQ_CATEGORIES)[number];

export const PAYMENT_STATUSES = [
  "pending",
  "paid",
  "failed",
  "cancelled",
  "expired",
  "review",
  "reconciled",
] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const FULFILLMENT_STATUSES = [
  "unfulfilled",
  "processing",
  "shipped",
  "completed",
  "cancelled",
] as const;
export type FulfillmentStatus = (typeof FULFILLMENT_STATUSES)[number];

export type ProductImage = {
  id: string;
  src: string;
  alt: string;
  role: ImageRole;
};

export type ProductVariant = {
  id: string;
  name: string;
  sku: string;
  priceMinor: number | null;
  compareAtPriceMinor: number | null;
  stockQuantity: number;
  available: boolean;
};

export type LabeledText = {
  label: string;
  value: string;
};

export type Instruction = {
  title: string;
  body: string;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  currency: string;
  priceMinor: number | null;
  compareAtPriceMinor: number | null;
  sku: string;
  stockQuantity: number;
  lowStockThreshold: number;
  status: ProductStatus;
  featured: boolean;
  category: string;
  images: ProductImage[];
  variants: ProductVariant[];
  specs: LabeledText[];
  benefits: LabeledText[];
  instructions: Instruction[];
  seoTitle: string;
  seoDescription: string;
  createdAt: string;
  updatedAt: string;
};

export type DeliveryMethod = {
  id: string;
  label: string;
  feeMinor: number;
  summary: string;
  active: boolean;
};

export type SocialLinks = {
  instagram: string;
  facebook: string;
  tiktok: string;
  youtube: string;
  whatsapp: string;
};

export type StoreSettings = {
  businessName: string;
  legalName: string;
  tagline: string;
  shortDescription: string;
  logoUrl: string;
  currency: string;
  email: string;
  phone: string;
  address: string;
  supportHours: string;
  social: SocialLinks;
  storeStatus: StoreStatus;
  showPreparationNotice: boolean;
  preparationNotice: string;
  deliveryMethods: DeliveryMethod[];
  reservationMinutes: number;
  timezone: string;
};

export type HeroContent = {
  eyebrow: string;
  headline: string;
  description: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
};

export type VideoContent = {
  heading: string;
  description: string;
  url: string;
  posterUrl: string;
};

export type HomepageContent = {
  hero: HeroContent;
  benefitsHeading: string;
  benefitsIntro: string;
  stepsHeading: string;
  stepsIntro: string;
  showcaseHeading: string;
  showcaseIntro: string;
  video: VideoContent;
  useCasesHeading: string;
  useCasesIntro: string;
  trustHeading: string;
  trustIntro: string;
  faqHeading: string;
  faqIntro: string;
  finalHeading: string;
  finalText: string;
};

export type Announcement = {
  enabled: boolean;
  message: string;
  href: string;
};

export type Benefit = {
  id: string;
  icon: IconKey;
  title: string;
  description: string;
  published: boolean;
  sort: number;
};

export type Step = {
  id: string;
  title: string;
  body: string;
  imageUrl: string;
  imageAlt: string;
  published: boolean;
  sort: number;
};

export type UseCase = {
  id: string;
  icon: IconKey;
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  published: boolean;
  sort: number;
};

export type Faq = {
  id: string;
  question: string;
  answer: string;
  category: FaqCategory;
  published: boolean;
  sort: number;
};

export type PolicyKey = "shipping" | "returns" | "privacy" | "terms";

export type Policy = {
  title: string;
  body: string;
  reviewed: boolean;
};

export type Policies = Record<PolicyKey, Policy>;

export type AboutContent = {
  heading: string;
  body: string;
};

export type Campaign = {
  id: string;
  slug: string;
  eyebrow: string;
  title: string;
  description: string;
  body: string;
  productSlug: string;
  published: boolean;
  seoTitle: string;
  seoDescription: string;
};

export type Discount = {
  id: string;
  code: string;
  type: "percent" | "fixed";
  value: number;
  minOrderMinor: number;
  usageLimit: number | null;
  usedCount: number;
  expiresAt: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type OrderLine = {
  productId: string;
  variantId: string | null;
  name: string;
  variantName: string;
  sku: string;
  quantity: number;
  unitPriceMinor: number;
  lineTotalMinor: number;
};

export type Order = {
  id: string;
  orderNumber: string;
  accessToken: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryRegion: string;
  deliveryInstructions: string;
  deliveryMethod: string;
  lineItems: OrderLine[];
  subtotalMinor: number;
  deliveryFeeMinor: number;
  discountMinor: number;
  totalMinor: number;
  currency: string;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  paymentProvider: string;
  paymentReference: string;
  providerReference: string;
  notificationStatus: string;
  inventoryHeld: boolean;
  trackingCarrier: string;
  trackingNumber: string;
  internalNotes: string;
  createdAt: string;
  updatedAt: string;
};

export type OrderEvent = {
  id: string;
  orderId: string;
  type: string;
  message: string;
  actor: string;
  createdAt: string;
};

export type Inquiry = {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  createdAt: string;
};

export type CartLineInput = {
  productId: string;
  variantId: string | null;
  quantity: number;
};

export type QuoteLine = {
  productId: string;
  variantId: string | null;
  name: string;
  variantName: string;
  sku: string;
  quantity: number;
  unitPriceMinor: number | null;
  lineTotalMinor: number | null;
  available: boolean;
  message: string | null;
};

export type Quote = {
  lines: QuoteLine[];
  subtotalMinor: number;
  discountMinor: number;
  discountMessage: string | null;
  deliveryFeeMinor: number | null;
  deliveryLabel: string | null;
  deliverySummary: string | null;
  totalMinor: number | null;
  currency: string;
  purchasable: boolean;
  blockers: string[];
};
