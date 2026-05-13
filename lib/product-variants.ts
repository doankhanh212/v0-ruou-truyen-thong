import { z } from "zod";

export const ProductVariantSchema = z.object({
  size: z.string().trim().min(1).max(50),
  price: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.coerce.number().int().nonnegative()
  ),
});

export const ProductVariantsSchema = z.array(ProductVariantSchema);

export type ProductVariantInput = z.infer<typeof ProductVariantSchema>;

export function normalizeProductVariants(input: unknown): ProductVariantInput[] {
  if (input == null) return [];
  if (!Array.isArray(input)) {
    throw new Error("variants must be an array");
  }

  const cleaned = input
    .filter((item) => item && typeof item === "object")
    .map((item) => {
      const value = item as Record<string, unknown>;
      return {
        size: typeof value.size === "string" ? value.size.trim() : "",
        price: value.price,
      };
    })
    .filter((item) => Boolean(item.size || (item.price !== "" && item.price != null)));

  return ProductVariantsSchema.parse(cleaned);
}
