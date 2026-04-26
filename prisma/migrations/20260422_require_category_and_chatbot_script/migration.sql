-- Phase 1: require Product.categoryId (FK), backfill from legacy Product.category slug.
-- Keeps the legacy `category` string column in place until Phase 2.

-- 1. Create any Category row implied by existing Product.category slugs that don't yet have a matching Category.
INSERT INTO "Category" ("name", "slug", "isActive", "isDeleted", "sortOrder", "createdAt")
SELECT DISTINCT
  INITCAP(REPLACE(p."category", '-', ' ')) AS name,
  p."category" AS slug,
  true,
  false,
  0,
  NOW()
FROM "Product" p
WHERE p."category" IS NOT NULL
  AND p."category" <> ''
  AND NOT EXISTS (SELECT 1 FROM "Category" c WHERE c."slug" = p."category");

-- 2. Backfill Product.categoryId from legacy slug where missing.
UPDATE "Product" p
SET "categoryId" = c."id"
FROM "Category" c
WHERE p."categoryId" IS NULL
  AND c."slug" = p."category";

-- 3. Any Product that still has NULL categoryId has no matching Category AND no slug string.
--    Attach them to a safeguard 'uncategorised' Category so the NOT NULL constraint can be applied.
INSERT INTO "Category" ("name", "slug", "isActive", "isDeleted", "sortOrder", "createdAt")
SELECT 'Chưa phân loại', 'chua-phan-loai', true, false, 999, NOW()
WHERE EXISTS (SELECT 1 FROM "Product" WHERE "categoryId" IS NULL)
  AND NOT EXISTS (SELECT 1 FROM "Category" WHERE "slug" = 'chua-phan-loai');

UPDATE "Product"
SET "categoryId" = (SELECT "id" FROM "Category" WHERE "slug" = 'chua-phan-loai')
WHERE "categoryId" IS NULL;

-- 4. Enforce NOT NULL on Product.categoryId.
ALTER TABLE "Product" ALTER COLUMN "categoryId" SET NOT NULL;

-- 5. ChatbotScript table (content blocks for the rebuilt bot).
CREATE TABLE "ChatbotScript" (
  "id" SERIAL PRIMARY KEY,
  "key" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE UNIQUE INDEX "ChatbotScript_key_key" ON "ChatbotScript"("key");
CREATE INDEX "ChatbotScript_key_isActive_idx" ON "ChatbotScript"("key", "isActive");
