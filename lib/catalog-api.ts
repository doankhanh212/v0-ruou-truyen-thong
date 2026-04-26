import type { CatalogListParams, CatalogListResponse, CatalogProduct } from "@/lib/catalog";

async function throwCatalogApiError(response: Response, fallbackMessage: string): Promise<never> {
  let message = fallbackMessage;

  try {
    const payload = (await response.json()) as { error?: string };
    if (payload.error) {
      message = payload.error;
    }
  } catch {
    // Ignore invalid JSON bodies and use the fallback message.
  }

  const error = new Error(message) as Error & { status?: number };
  error.status = response.status;
  throw error;
}

function buildSearchParams(params: CatalogListParams = {}) {
  const searchParams = new URLSearchParams();

  if (params.category) searchParams.set("category", params.category);
  if (params.featured) searchParams.set("featured", "true");
  if (params.search) searchParams.set("search", params.search);
  if (params.page) searchParams.set("page", String(params.page));
  if (params.limit) searchParams.set("limit", String(params.limit));

  return searchParams.toString();
}

export async function fetchCatalogProducts(params: CatalogListParams = {}, init?: RequestInit): Promise<CatalogListResponse> {
  const query = buildSearchParams(params);
  const response = await fetch(`/api/products${query ? `?${query}` : ""}`, init);

  if (!response.ok) {
    await throwCatalogApiError(response, "Khong the tai du lieu san pham tu co so du lieu.");
  }

  return response.json() as Promise<CatalogListResponse>;
}

/**
 * Walk every page of the public catalog and concatenate the results.
 * Used by the listing page so the catalog is never silently truncated.
 */
export async function fetchAllCatalogProducts(
  baseParams: CatalogListParams = {},
  init?: RequestInit
): Promise<CatalogProduct[]> {
  const PAGE_SIZE = 100;
  const HARD_CAP = 5000; // safety net against runaway loops
  const all: CatalogProduct[] = [];
  let page = 1;

  while (all.length < HARD_CAP) {
    const response = await fetchCatalogProducts(
      { ...baseParams, page, limit: PAGE_SIZE },
      init
    );
    all.push(...response.products);
    if (page >= response.totalPages || response.products.length === 0) break;
    page += 1;
  }

  return all;
}

export async function fetchCatalogProductBySlug(slug: string, init?: RequestInit): Promise<CatalogProduct | null> {
  const response = await fetch(`/api/products/${slug}`, init);

  if (response.status === 404) return null;
  if (!response.ok) {
    await throwCatalogApiError(response, "Khong the tai chi tiet san pham tu co so du lieu.");
  }

  return response.json() as Promise<CatalogProduct>;
}
