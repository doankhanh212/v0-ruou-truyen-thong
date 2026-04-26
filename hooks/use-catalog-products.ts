"use client";

import { useEffect, useState } from "react";
import type { CatalogListParams, CatalogProduct } from "@/lib/catalog";
import {
  fetchAllCatalogProducts,
  fetchCatalogProductBySlug,
  fetchCatalogProducts,
} from "@/lib/catalog-api";

export function useCatalogProducts(params: CatalogListParams = {}) {
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const queryKey = JSON.stringify({
    category: params.category ?? "",
    featured: Boolean(params.featured),
    search: params.search ?? "",
    page: params.page ?? 1,
    limit: params.limit ?? 12,
  });

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchCatalogProducts(params, { signal: controller.signal });
        setProducts(data.products);
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setProducts([]);
        setError(err instanceof Error ? err.message : "Khong tai duoc danh sach san pham.");
      } finally {
        setLoading(false);
      }
    }

    void load();

    return () => controller.abort();
  }, [queryKey]);

  return { products, loading, error };
}

/**
 * Fetches the entire catalog (server-paginated under the hood). For the
 * listing page so it doesn't silently cap at 100.
 */
export function useAllCatalogProducts(params: Omit<CatalogListParams, "page" | "limit"> = {}) {
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const queryKey = JSON.stringify({
    category: params.category ?? "",
    featured: Boolean(params.featured),
    search: params.search ?? "",
  });

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const all = await fetchAllCatalogProducts(params, { signal: controller.signal });
        setProducts(all);
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setProducts([]);
        setError(err instanceof Error ? err.message : "Khong tai duoc danh sach san pham.");
      } finally {
        setLoading(false);
      }
    }

    void load();
    return () => controller.abort();
  }, [queryKey]);

  return { products, loading, error };
}

export function useCatalogProduct(slug: string) {
  const [product, setProduct] = useState<CatalogProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setProduct(null);
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchCatalogProductBySlug(slug, { signal: controller.signal });
        setProduct(data);
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setProduct(null);
        setError(err instanceof Error ? err.message : "Khong tai duoc chi tiet san pham.");
      } finally {
        setLoading(false);
      }
    }

    void load();

    return () => controller.abort();
  }, [slug]);

  return { product, loading, error };
}
