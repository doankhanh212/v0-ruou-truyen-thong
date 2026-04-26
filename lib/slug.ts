/**
 * Slugify Vietnamese input: lowercase, strip diacritics, replace ₫/đ, keep only
 * [a-z0-9-], collapse and trim dashes. Returns "" for empty/invalid input.
 */
export function slugify(input: string | null | undefined): string {
  if (!input) return "";

  const normalized = input
    .toString()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

  return normalized;
}

/** True if the string is already a clean slug. */
export function isValidSlug(input: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input);
}
