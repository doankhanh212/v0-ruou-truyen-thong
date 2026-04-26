import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ProductDetailClient } from '@/components/product-detail-client'
import { getCatalogProductBySlug } from '@/lib/catalog-service'
import { db } from '@/lib/db'
import { absoluteUrl, metaDescription, metaTitle, SITE_NAME } from '@/lib/seo'

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params
  const product = await getCatalogProductBySlug(slug)
  if (!product) {
    return { title: 'Không tìm thấy sản phẩm', robots: { index: false, follow: false } }
  }

  const title = metaTitle(product.name)
  const description = metaDescription(product.description)
  const canonical = `/san-pham/${product.slug}`
  const imageUrl = absoluteUrl(product.image)

  return {
    title,
    description,
    keywords: product.tag ? [product.tag, product.name, SITE_NAME] : [product.name, SITE_NAME],
    alternates: { canonical },
    openGraph: {
      type: 'website',
      url: absoluteUrl(canonical),
      title,
      description,
      siteName: SITE_NAME,
      images: [{ url: imageUrl, alt: product.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  }
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params
  const [catalog, raw] = await Promise.all([
    getCatalogProductBySlug(slug),
    db.product.findFirst({
      where: { slug, inStock: true, isDeleted: false },
      select: {
        name: true,
        slug: true,
        price: true,
        tags: true,
        description: true,
        categoryRel: { select: { slug: true, name: true, isActive: true, isDeleted: true } },
      },
    }),
  ])

  if (!catalog || !raw) notFound()

  const categoryRel =
    raw.categoryRel && raw.categoryRel.isActive && !raw.categoryRel.isDeleted
      ? { slug: raw.categoryRel.slug, name: raw.categoryRel.name }
      : null

  const categoryHref = categoryRel ? `/san-pham?category=${categoryRel.slug}` : '/san-pham'
  const categoryLabel = categoryRel?.name ?? catalog.category

  const description = metaDescription(catalog.description) || catalog.name
  const canonical = `/san-pham/${catalog.slug}`

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: catalog.name,
    image: [absoluteUrl(catalog.image)],
    description,
    sku: catalog.slug,
    brand: { '@type': 'Brand', name: SITE_NAME },
    category: categoryLabel,
    offers: {
      '@type': 'Offer',
      url: absoluteUrl(canonical),
      price: String(raw.price),
      priceCurrency: 'VND',
      availability: 'https://schema.org/InStock',
      seller: { '@type': 'Organization', name: SITE_NAME },
    },
  }

  const breadcrumbItems: { name: string; item: string }[] = [
    { name: 'Trang chủ', item: absoluteUrl('/') },
    { name: 'Sản phẩm', item: absoluteUrl('/san-pham') },
  ]
  if (categoryRel) {
    breadcrumbItems.push({
      name: categoryRel.name,
      item: absoluteUrl(categoryHref),
    })
  }
  breadcrumbItems.push({ name: catalog.name, item: absoluteUrl(canonical) })

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems.map((entry, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: entry.name,
      item: entry.item,
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ProductDetailClient
        slug={slug}
        categoryHref={categoryHref}
        categoryLabel={categoryLabel}
      />
    </>
  )
}
