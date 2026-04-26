import "server-only";

import type { Product as DbProduct, Category as DbCategory, ProductImage } from "@prisma/client";
import { db } from "@/lib/db";
import type { CatalogListParams, CatalogListResponse, CatalogPricingOption, CatalogProduct } from "@/lib/catalog";
import { buildCatalogPriceLabel } from "@/lib/catalog";

type ProductWithRelations = DbProduct & {
  images: ProductImage[];
  categoryRel: DbCategory | null;
};

const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 500;

const CATEGORY_TARGETS: Record<string, string> = {
  "qua-tang": "Phù hợp biếu tặng đối tác, gia đình và khách VIP",
  "ruou-thuoc": "Phù hợp người tìm dòng rượu dược liệu và quà biếu cao cấp",
  "ruou-nep": "Phù hợp sử dụng hàng ngày và tiếp khách thân mật",
  "ruou-trai-cay": "Phù hợp người thích hương vị nhẹ, dễ uống",
};

const DEFAULT_BENEFITS_BY_CATEGORY: Record<string, string[]> = {
  "qua-tang": ["Đóng gói chỉn chu", "Phù hợp biếu tặng", "Dễ tư vấn theo nhu cầu"],
  "ruou-thuoc": ["Dòng rượu nổi bật", "Phù hợp quà biếu", "Sản phẩm đang có sẵn"],
  "ruou-nep": ["Hương vị truyền thống", "Dễ tiếp cận", "Phù hợp nhu cầu phổ thông"],
  "ruou-trai-cay": ["Hương vị dễ uống", "Phù hợp tiệc nhẹ", "Màu sắc đẹp mắt"],
};

export class CatalogDataAccessError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CatalogDataAccessError";
  }
}

function trimDecimal(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1).replace(/\.0$/, "");
}

function unique(values: Array<string | undefined | null>) {
  return [...new Set(values.filter((value): value is string => Boolean(value && value.trim())))];
}

function formatTag(value: string) {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function wrapCatalogError(error: unknown, message: string) {
  console.error("[catalog-service]", message, error);
  if (error instanceof CatalogDataAccessError) return error;
  const wrapped = new CatalogDataAccessError(message) as CatalogDataAccessError & { cause?: unknown };
  wrapped.cause = error;
  return wrapped;
}

function deriveBenefits(categorySlug: string, tags: string[]) {
  const fromTags = tags.map(formatTag).filter(Boolean).slice(0, 3);
  if (fromTags.length > 0) return fromTags;
  return DEFAULT_BENEFITS_BY_CATEGORY[categorySlug] ?? ["Sản phẩm đang có sẵn", "Liên hệ để được tư vấn", "Phù hợp nhiều nhu cầu"];
}

function deriveTarget(product: ProductWithRelations, categorySlug: string) {
  const targetCopy = CATEGORY_TARGETS[categorySlug] ?? "Phù hợp nhu cầu tư vấn trực tiếp";
  if (product.origin) return `Xuất xứ ${product.origin}, ${targetCopy}`;
  return targetCopy;
}

function toPrimaryImage(product: ProductWithRelations) {
  const orderedImages = [...product.images].sort((left, right) => {
    if (left.isPrimary !== right.isPrimary) return Number(right.isPrimary) - Number(left.isPrimary);
    return left.sortOrder - right.sortOrder;
  });
  return product.imageUrl || orderedImages[0]?.url || "/placeholder.jpg";
}

function toGallery(product: ProductWithRelations) {
  const primaryImage = toPrimaryImage(product);
  return unique([primaryImage, ...product.images.map((image) => image.url)]);
}

function toPricing(product: ProductWithRelations, categorySlug: string): CatalogPricingOption[] {
  return [
    {
      packaging: categorySlug === "qua-tang" ? "Combo" : "Tiêu chuẩn",
      volume: product.volume || "Mặc định",
      priceBeforeVAT: product.price,
      priceWithVAT: Math.round(product.price * 1.1),
    },
  ];
}

function adaptDbProduct(product: ProductWithRelations): CatalogProduct {
  const categorySlug = product.categoryRel?.slug ?? "";
  const gallery = toGallery(product);
  const kind = categorySlug === "qua-tang" ? "gift-set" : "product";
  const benefits = deriveBenefits(categorySlug, product.tags);
  const price = buildCatalogPriceLabel(product.price, product.priceOld ?? null);

  return {
    id: product.slug,
    dbId: product.id,
    slug: product.slug,
    kind,
    name: product.name,
    category: categorySlug,
    price,
    priceMin: product.price,
    image: gallery[0] ?? "/placeholder.jpg",
    detailImage: gallery[1] ?? gallery[0] ?? "/placeholder.jpg",
    gallery,
    description: product.description || "",
    alcohol: product.alcohol != null ? `${trimDecimal(product.alcohol)}% ACL.VOL` : "",
    ingredients: [],
    benefits,
    target: deriveTarget(product, categorySlug),
    pricing: toPricing(product, categorySlug),
    isBestSeller: product.featured,
    tag: product.tags[0] ? formatTag(product.tags[0]) : undefined,
  };
}

function normalizeListParams(params: CatalogListParams) {
  const page = Math.max(1, Number(params.page ?? 1) || 1);
  const limit = Math.min(MAX_LIMIT, Math.max(1, Number(params.limit ?? DEFAULT_LIMIT) || DEFAULT_LIMIT));
  return { page, limit };
}

export async function listCatalogProducts(params: CatalogListParams = {}): Promise<CatalogListResponse> {
  const { page, limit } = normalizeListParams(params);
  const search = params.search?.trim() || undefined;

  try {
    const where: {
      inStock: boolean;
      isDeleted: boolean;
      featured?: boolean;
      name?: { contains: string; mode: "insensitive" };
      categoryRel?: { slug: string; isActive: true; isDeleted: false };
    } = {
      inStock: true,
      isDeleted: false,
    };

    if (params.category) {
      where.categoryRel = { slug: params.category, isActive: true, isDeleted: false };
    }
    if (params.featured) where.featured = true;
    if (search) where.name = { contains: search, mode: "insensitive" };

    const [rows, total] = await Promise.all([
      db.product.findMany({
        where,
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
        include: {
          images: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }] },
          categoryRel: true,
        },
      }),
      db.product.count({ where }),
    ]);

    return {
      products: (rows as ProductWithRelations[]).map(adaptDbProduct),
      total,
      page,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      source: "db",
    };
  } catch (error) {
    throw wrapCatalogError(error, "Failed to load catalog products from the database.");
  }
}

export async function getCatalogProductBySlug(slug: string): Promise<CatalogProduct | null> {
  try {
    const row = await db.product.findFirst({
      where: { slug, inStock: true, isDeleted: false },
      include: {
        images: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }] },
        categoryRel: true,
      },
    });

    if (!row) return null;
    return adaptDbProduct(row as ProductWithRelations);
  } catch (error) {
    throw wrapCatalogError(error, `Failed to load product "${slug}" from the database.`);
  }
}

export async function getAllCatalogProducts(): Promise<CatalogProduct[]> {
  const response = await listCatalogProducts({ page: 1, limit: MAX_LIMIT });
  return response.products;
}
