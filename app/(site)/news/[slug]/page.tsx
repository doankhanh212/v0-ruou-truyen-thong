import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";
import sanitizeHtml from "sanitize-html";
import { absoluteUrl, metaDescription, metaTitle, SITE_NAME } from "@/lib/seo";
import { isAuthenticated } from "@/lib/auth";

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: ["h1", "h2", "h3", "h4", "p", "br", "hr", "ul", "ol", "li", "strong", "em", "b", "i", "a", "img", "blockquote"],
  allowedAttributes: {
    a: ["href", "target", "rel"],
    img: ["src", "alt", "width", "height"],
  },
};

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
};

async function loadPost(slug: string, allowUnpublished: boolean) {
  return db.post.findFirst({
    where: {
      slug,
      isDeleted: false,
      ...(allowUnpublished ? {} : { isPublished: true }),
    },
  });
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const previewRequested = sp?.preview === "true";
  const authed = previewRequested ? await isAuthenticated() : false;
  const post = await loadPost(slug, previewRequested && authed);
  if (!post) return { title: "Không tìm thấy", robots: { index: false, follow: false } };

  const title = metaTitle(post.metaTitle || post.title);
  const description = metaDescription(post.metaDescription || post.content);
  const canonical = `/news/${slug}`;
  const imageUrl = post.image ? absoluteUrl(post.image) : undefined;

  const robots =
    !post.isPublished ? { index: false, follow: false } : undefined;

  return {
    title,
    description,
    alternates: { canonical },
    robots,
    openGraph: {
      type: "article",
      url: absoluteUrl(canonical),
      title,
      description,
      siteName: SITE_NAME,
      publishedTime: post.createdAt.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      images: imageUrl ? [{ url: imageUrl, alt: post.title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}

export default async function NewsDetailPage({ params, searchParams }: Props) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const previewRequested = sp?.preview === "true";
  const authed = previewRequested ? await isAuthenticated() : false;
  const allowUnpublished = previewRequested && authed;

  const [post, relatedProducts] = await Promise.all([
    loadPost(slug, allowUnpublished),
    db.product.findMany({
      where: { inStock: true, isDeleted: false, featured: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      take: 3,
      select: { slug: true, name: true, imageUrl: true, price: true },
    }),
  ]);

  if (!post) notFound();

  const isDraft = !post.isPublished;
  const canonical = `/news/${slug}`;
  const description = metaDescription(post.metaDescription || post.content);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: metaTitle(post.title, 110),
    description,
    image: post.image ? [absoluteUrl(post.image)] : undefined,
    datePublished: post.createdAt.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    mainEntityOfPage: { "@type": "WebPage", "@id": absoluteUrl(canonical) },
    author: { "@type": "Organization", name: SITE_NAME },
    publisher: { "@type": "Organization", name: SITE_NAME },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Trang chủ", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Tin tức", item: absoluteUrl("/news") },
      { "@type": "ListItem", position: 3, name: post.title, item: absoluteUrl(canonical) },
    ],
  };

  return (
    <div className="bg-white">
      {!isDraft && (
        <>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
          />
        </>
      )}
      {isDraft && (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-xs font-semibold text-amber-800">
          Đang xem trước bản nháp — chưa xuất bản
        </div>
      )}

      <article className="container mx-auto max-w-3xl px-4 py-12">
        <nav aria-label="breadcrumb" className="mb-4 text-sm text-gray-500">
          <ol className="flex flex-wrap items-center gap-1">
            <li>
              <Link href="/" className="hover:text-[#8B1A1A] hover:underline">Trang chủ</Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href="/news" className="hover:text-[#8B1A1A] hover:underline">Tin tức</Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-gray-700 line-clamp-1" aria-current="page">{post.title}</li>
          </ol>
        </nav>

        {post.image && (
          <div className="relative mb-8 aspect-video overflow-hidden rounded-lg">
            <Image
              src={post.image}
              alt={post.title}
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
              priority
            />
          </div>
        )}
        <time className="text-sm text-gray-400">
          {new Date(post.createdAt).toLocaleDateString("vi-VN")}
        </time>
        <h1 className="text-3xl font-bold mt-2 mb-6">{post.title}</h1>
        <div
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content, SANITIZE_OPTIONS) }}
        />

        {relatedProducts.length > 0 && (
          <aside className="mt-12 border-t pt-8">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Sản phẩm liên quan</h2>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {relatedProducts.map((product) => (
                <li key={product.slug}>
                  <Link
                    href={`/san-pham/${product.slug}`}
                    className="group block overflow-hidden rounded-lg border border-gray-200 transition-shadow hover:shadow-md"
                  >
                    {product.imageUrl && (
                      <div className="relative aspect-square bg-slate-100">
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover transition-transform group-hover:scale-105"
                        />
                      </div>
                    )}
                    <div className="p-3">
                      <p className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-[#8B1A1A]">
                        {product.name}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        {product.price.toLocaleString("vi-VN")}đ
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        )}
      </article>
    </div>
  );
}
