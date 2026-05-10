CREATE TABLE "SeoPage" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "keywords" TEXT,
  "ogImage" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SeoPage_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SeoPage_slug_key" ON "SeoPage"("slug");
