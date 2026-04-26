-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Category_isDeleted_isActive_sortOrder_idx" ON "Category"("isDeleted", "isActive", "sortOrder");

-- CreateIndex
CREATE INDEX "Post_isDeleted_isPublished_createdAt_idx" ON "Post"("isDeleted", "isPublished", "createdAt");

-- CreateIndex
CREATE INDEX "Product_isDeleted_inStock_idx" ON "Product"("isDeleted", "inStock");
