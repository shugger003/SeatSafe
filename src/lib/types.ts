export type QuoteLine = {
  productId: string;
  variantId: string | null;
  name: string;
  variantName: string;
  sku: string;
  quantity: number;
  stock: number;
  unitPriceMinor: number | null;
  lineTotalMinor: number | null;
  available: boolean;
  message: string | null;
};