type ProductImageRecord = {
  url: string;
  isPrimary: boolean;
  sortOrder: number;
};

function cleanUrl(value: unknown) {
  if (typeof value !== "string") return "";
  return value.trim();
}

export function normalizeProductImages(primaryInput: unknown, galleryInput: unknown) {
  const orderedUrls: string[] = [];
  const seen = new Set<string>();

  const pushUrl = (value: unknown) => {
    const url = cleanUrl(value);
    if (!url || seen.has(url)) return;
    seen.add(url);
    orderedUrls.push(url);
  };

  pushUrl(primaryInput);

  if (Array.isArray(galleryInput)) {
    for (const value of galleryInput) {
      pushUrl(value);
    }
  }

  if (orderedUrls.length === 0) {
    return null;
  }

  return {
    imageUrl: orderedUrls[0],
    records: orderedUrls.map<ProductImageRecord>((url, index) => ({
      url,
      isPrimary: index === 0,
      sortOrder: index,
    })),
  };
}

export function getSecondaryProductImageUrls(
  primaryImageUrl: string | null,
  images: Array<{ url: string; isPrimary: boolean }>
) {
  return images
    .filter((image) => !image.isPrimary && image.url !== primaryImageUrl)
    .map((image) => image.url);
}