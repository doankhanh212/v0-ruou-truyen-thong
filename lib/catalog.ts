export interface CatalogPricingOption {
  packaging: string;
  volume: string;
  priceBeforeVAT: number;
  priceWithVAT: number;
}

export interface CatalogProduct {
  id: string;
  dbId?: number;
  slug: string;
  kind: "product" | "gift-set";
  name: string;
  category: string;
  price: string;
  priceMin: number;
  image: string;
  detailImage?: string;
  gallery?: string[];
  description: string;
  alcohol: string;
  ingredients: string[];
  benefits: string[];
  target: string;
  pricing: CatalogPricingOption[];
  isBestSeller?: boolean;
  tag?: string;
}

export interface CatalogListParams {
  category?: string | null;
  featured?: boolean;
  search?: string | null;
  page?: number;
  limit?: number;
}

export interface CatalogListResponse {
  products: CatalogProduct[];
  total: number;
  page: number;
  totalPages: number;
  source: "db";
}

export function formatCatalogPrice(value: number): string {
  return value.toLocaleString("vi-VN");
}

export function buildCatalogPriceLabel(min: number, max?: number | null): string {
  if (max == null || max === min) return formatCatalogPrice(min);
  return `${formatCatalogPrice(min)} – ${formatCatalogPrice(max)}`;
}
