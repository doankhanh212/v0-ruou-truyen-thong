import type { MetadataRoute } from 'next'
import { db } from '@/lib/db'
import { absoluteUrl } from '@/lib/seo'

export const revalidate = 300

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, posts] = await Promise.all([
    db.product.findMany({
      where: { inStock: true, isDeleted: false },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
    }),
    db.post.findMany({
      where: { isPublished: true, isDeleted: false },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
    }),
  ])

  const now = new Date()
  const latestProductUpdate = products[0]?.updatedAt ?? now
  const latestPostUpdate = posts[0]?.updatedAt ?? now
  const latestAny =
    latestProductUpdate > latestPostUpdate ? latestProductUpdate : latestPostUpdate

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absoluteUrl('/'), lastModified: latestAny, changeFrequency: 'daily', priority: 1 },
    { url: absoluteUrl('/san-pham'), lastModified: latestProductUpdate, changeFrequency: 'daily', priority: 0.9 },
    { url: absoluteUrl('/news'), lastModified: latestPostUpdate, changeFrequency: 'daily', priority: 0.8 },
    { url: absoluteUrl('/gioi-thieu'), lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: absoluteUrl('/lien-he'), lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
  ]

  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: absoluteUrl(`/san-pham/${p.slug}`),
    lastModified: p.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const postRoutes: MetadataRoute.Sitemap = posts.map((p) => ({
    url: absoluteUrl(`/news/${p.slug}`),
    lastModified: p.updatedAt,
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  return [...staticRoutes, ...productRoutes, ...postRoutes]
}
