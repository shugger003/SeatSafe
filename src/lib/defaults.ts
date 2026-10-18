import type {
  AboutContent,
  Announcement,
  Benefit,
  Campaign,
  Faq,
  HomepageContent,
  Policies,
  Step,
  StoreSettings,
  UseCase,
} from "@/lib/types";

/** Placeholder copy only. Nothing here is a verified product claim. */
export const defaultStore = (): StoreSettings => ({
  businessName: "Brand name",
  legalName: "",
  tagline: "Everyday toilet hygiene",
  shortDescription:
    "A toilet seat sanitizer intended for convenient everyday use. Replace this description when the brand story is confirmed.",
  logoUrl: "",
  currency: "GHS",
  email: "",
  phone: "",
  address: "",
  supportHours: "",
  social: {
    instagram: "",
    facebook: "",
    tiktok: "",
    youtube: "",
    whatsapp: "",
  },
  storeStatus: "coming_soon",
  showPreparationNotice: true,
  preparationNotice:
    "Store details are still being confirmed. Only information the business has published should be treated as final.",
  deliveryMethods: [],
  reservationMinutes: 30,
  timezone: "Africa/Accra",
});

export const defaultHomepage = (): HomepageContent => ({
  hero: {
    eyebrow: "Everyday hygiene",
    headline: "A toilet seat sanitizer for everyday use.",
    description:
      "Specifications, instructions, ingredients, and price are published only after the business confirms them.",
    primaryLabel: "View the product",
    primaryHref: "/shop",
    secondaryLabel: "How it works",
    secondaryHref: "/how-it-works",
  },
  benefitsHeading: "Designed for a simple routine",
  benefitsIntro:
    "Benefits appear here only after they are published. Draft ideas stay in the dashboard until the manufacturer supports them.",
  stepsHeading: "How it works",
  stepsIntro: "Usage steps will appear here when the manufacturer\u2019s instructions are published.",
  showcaseHeading: "The product",
  showcaseIntro: "Pricing and availability come from the catalog, not from this introduction.",
  video: {
    heading: "See it in use",
    description: "A demonstration video can be added from the dashboard when the footage is ready.",
    url: "",
    posterUrl: "",
  },
  useCasesHeading: "Where it fits",
  useCasesIntro:
    "Use cases stay unpublished until they match the product\u2019s intended purpose and instructions.",
  trustHeading: "Before you order",
  trustIntro: "This section lists only the support, delivery, and payment details the business has actually configured.",
  faqHeading: "Questions",
  faqIntro: "Answers are published by the business. Unpublished drafts are not shown here.",
  finalHeading: "When you are ready",
  finalText: "The next step depends on whether the product is open for orders, coming soon, or paused.",
});

export const defaultAnnouncement = (): Announcement => ({
  enabled: false,
  message: "",
  href: "",
});

export const defaultBenefits = (): Benefit[] => [
  {
    id: "benefit-application",
    icon: "hand",
    title: "Convenient application",
    description:
      "Draft only. Replace this with a manufacturer-supported description before publishing.",
    published: false,
    sort: 1,
  },
  {
    id: "benefit-packaging",
    icon: "bag",
    title: "Portable packaging",
    description: "Draft only. Do not publish until the packaging format is confirmed.",
    published: false,
    sort: 2,
  },
  {
    id: "benefit-routine",
    icon: "spark",
    title: "Everyday routine",
    description: "Draft only. Describe the intended routine without unsupported performance claims.",
    published: false,
    sort: 3,
  },
];

export const defaultSteps = (): Step[] => [
  {
    id: "step-1",
    title: "Step title",
    body: "Do not publish until the manufacturer\u2019s instructions are confirmed. Do not invent contact times, drying times, or wiping steps.",
    imageUrl: "",
    imageAlt: "",
    published: false,
    sort: 1,
  },
  {
    id: "step-2",
    title: "Step title",
    body: "Replace this with the next confirmed instruction.",
    imageUrl: "",
    imageAlt: "",
    published: false,
    sort: 2,
  },
  {
    id: "step-3",
    title: "Step title",
    body: "Replace this with the next confirmed instruction.",
    imageUrl: "",
    imageAlt: "",
    published: false,
    sort: 3,
  },
];

export const defaultUseCases = (): UseCase[] => [
  {
    id: "use-home",
    icon: "home",
    title: "Home",
    description: "Draft setting. Publish only if home use matches the product instructions.",
    imageUrl: "",
    imageAlt: "",
    published: false,
    sort: 1,
  },
  {
    id: "use-office",
    icon: "office",
    title: "Office",
    description: "Draft setting. Publish only if this matches the intended purpose.",
    imageUrl: "",
    imageAlt: "",
    published: false,
    sort: 2,
  },
  {
    id: "use-travel",
    icon: "travel",
    title: "Travel",
    description: "Draft setting. Publish only if the packaging and instructions support it.",
    imageUrl: "",
    imageAlt: "",
    published: false,
    sort: 3,
  },
  {
    id: "use-hotel",
    icon: "hotel",
    title: "Hotels",
    description: "Draft setting. Publish only if this matches the intended purpose.",
    imageUrl: "",
    imageAlt: "",
    published: false,
    sort: 4,
  },
  {
    id: "use-dining",
    icon: "dining",
    title: "Restaurants",
    description: "Draft setting. Publish only if this matches the intended purpose.",
    imageUrl: "",
    imageAlt: "",
    published: false,
    sort: 5,
  },
];

export const defaultFaqs = (): Faq[] => {
  const drafts: Array<Pick<Faq, "id" | "category" | "question">> = [
    { id: "faq-what", category: "product", question: "What is this product?" },
    { id: "faq-use", category: "usage", question: "How should it be used?" },
    { id: "faq-size", category: "packaging", question: "What size is the packaging?" },
    { id: "faq-ingredients", category: "ingredients", question: "What are the ingredients?" },
    { id: "faq-safety", category: "safety", question: "What safety instructions apply?" },
    { id: "faq-storage", category: "storage", question: "How should it be stored?" },
    { id: "faq-delivery", category: "delivery", question: "How does delivery work?" },
    { id: "faq-payment", category: "payment", question: "Which payment methods are accepted?" },
    { id: "faq-returns", category: "returns", question: "What is the return policy?" },
    { id: "faq-support", category: "support", question: "How do I contact support?" },
  ];
  return drafts.map((item, index) => ({
    ...item,
    answer: "This answer has not been supplied by the business yet.",
    published: false,
    sort: index + 1,
  }));
};

const reviewLine =
  "This page is a draft for the business to complete. It is not legal advice and it is not a finished policy until it is reviewed and marked as reviewed.";

export const defaultPolicies = (): Policies => ({
  shipping: {
    title: "Shipping policy",
    reviewed: false,
    body: `# Delivery\n\nDelivery areas, fees, and timelines have not been published.\n\nCheckout stays unavailable until at least one delivery method is saved in store settings.\n\n# Review\n\n${reviewLine}`,
  },
  returns: {
    title: "Return and refund policy",
    reviewed: false,
    body: `# Returns\n\nA return window, condition rules, and refund method have not been published.\n\n# Refunds\n\nRefunds are not promised on this page. Card or mobile-money refunds, when offered, are handled through the payment provider and recorded against the order.\n\n# Review\n\n${reviewLine}`,
  },
  privacy: {
    title: "Privacy policy",
    reviewed: false,
    body: `# What this store collects\n\nGuest checkout asks for a name, email address, phone number, and delivery address so an order can be fulfilled. The store also keeps the products, quantities, and prices from that order.\n\n# Payments\n\nCard and mobile-money details are entered with the payment provider. This website is built not to store raw card numbers.\n\n# Messages\n\nThe contact form stores the message so the business can reply. Email delivery works only after an email service is configured.\n\n# Analytics\n\nOptional analytics stays off until an analytics ID is configured and the visitor accepts it.\n\n# Review\n\n${reviewLine}`,
  },
  terms: {
    title: "Terms and conditions",
    reviewed: false,
    body: `# Using this store\n\nOrders are offers to buy the published products at the price confirmed on the server at checkout.\n\n# Product information\n\nDescriptions, instructions, and availability can be updated by the business. Historical orders keep the details captured at purchase.\n\n# Review\n\n${reviewLine}`,
  },
});

export const defaultAbout = (): AboutContent => ({
  heading: "About",
  body: "This brand is preparing a toilet seat sanitizer for everyday hygiene.\n\nA full introduction, team, and company details will be published when the business confirms them.",
});

export const defaultCampaigns = (): Campaign[] => [];

export const POLICY_LINKS: Array<{ key: keyof Policies; href: string; label: string }> = [
  { key: "shipping", href: "/policies/shipping", label: "Shipping policy" },
  { key: "returns", href: "/policies/returns", label: "Return and refund policy" },
  { key: "privacy", href: "/policies/privacy", label: "Privacy policy" },
  { key: "terms", href: "/policies/terms", label: "Terms and conditions" },
];
