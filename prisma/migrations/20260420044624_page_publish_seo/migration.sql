-- DropIndex
DROP INDEX "Page_slug_isActive_idx";

-- AlterTable
ALTER TABLE "Page" ADD COLUMN     "isPublished" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "metaDescription" TEXT,
ADD COLUMN     "metaTitle" TEXT;

-- CreateIndex
CREATE INDEX "Page_slug_isActive_isPublished_idx" ON "Page"("slug", "isActive", "isPublished");
