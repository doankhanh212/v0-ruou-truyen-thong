import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";
import sanitizeHtml from "sanitize-html";
import { absoluteUrl, metaDescription, metaTitle, SITE_NAME } from "@/lib/seo";
import { isAuthenticated } from "@/lib/auth";
import { Calendar, ArrowLeft, ArrowRight, ChevronRight } from "lucide-react";

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "h1", "h2", "h3", "h4",
    "p", "br", "hr", "blockquote",
    "ul", "ol", "li",
    "strong", "em", "b", "i", "u", "s",
    "a", "img",
    "code", "pre",
    "span",
  ],
  allowedAttributes: {
    a: ["href", "target", "rel", "class"],
    img: ["src", "alt", "width", "height", "class"],
    p: ["style"],
    h1: ["style"], h2: ["style"], h3: ["style"], h4: ["style"],
    span: ["style"],
  },
  allowedStyles: {
    "*": { "text-align": [/^left$/, /^right$/, /^center$/, /^justify$/] },
  },
};

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
};

async function loadPost(slug: string, allowUnpublished: boolean) {
  return db.post.findFirst({
    where: { slug, isDeleted: false, ...(allowUnpublished ? {} : { isPublished: true }) },
  });
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const authed = sp?.preview === "true" ? await isAuthenticated() : false;
  const post = await loadPost(slug, sp?.preview === "true" && authed);
  if (!post) return { title: "Không tìm thấy", robots: { index: false, follow: false } };

  const title = metaTitle(post.metaTitle || post.title);
  const description = metaDescription(post.metaDescription || post.content);
  const canonical = `/news/${slug}`;
  const imageUrl = post.image ? absoluteUrl(post.image) : undefined;

  return {
    title,
    description,
    alternates: { canonical },
    robots: !post.isPublished ? { index: false, follow: false } : undefined,
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

  const [post, relatedPosts, relatedProducts] = await Promise.all([
    loadPost(slug, allowUnpublished),
    db.post.findMany({
      where: { isPublished: true, isDeleted: false, slug: { not: slug } },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: { slug: true, title: true, image: true, createdAt: true, content: true },
    }),
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
    "@type": "BlogPosting",
    headline: metaTitle(post.title, 110),
    description,
    image: post.image ? [absoluteUrl(post.image)] : undefined,
    datePublished: post.createdAt.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    mainEntityOfPage: { "@type": "WebPage", "@id": absoluteUrl(canonical) },
    author: { "@type": "Organization", name: SITE_NAME, url: absoluteUrl("/") },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: absoluteUrl("/"),
      logo: { "@type": "ImageObject", url: absoluteUrl("/icon-light-32x32.png") },
    },
  };

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      {!isDraft && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      )}

      {isDraft && (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-center text-xs font-semibold text-amber-800">
          Đang xem trước bản nháp — chưa xuất bản
        </div>
      )}

      {/* Hero image */}
      {post.image && (
        <div className="relative h-64 w-full overflow-hidden bg-slate-200 md:h-80 lg:h-[420px]">
          <Image
            src={post.image}
            alt={post.title}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 px-4 pb-8 md:px-8">
            <div className="mx-auto max-w-3xl">
              <nav className="mb-3 flex flex-wrap items-center gap-1.5 text-xs text-white/70">
                <Link href="/" className="hover:text-white transition-colors">Trang chủ</Link>
                <ChevronRight size={12} />
                <Link href="/news" className="hover:text-white transition-colors">Tin tức</Link>
                <ChevronRight size={12} />
                <span className="text-white/90 line-clamp-1">{post.title}</span>
              </nav>
              <h1 className="text-2xl font-bold text-white md:text-3xl lg:text-4xl leading-tight">
                {post.title}
              </h1>
              <div className="mt-3 flex items-center gap-2 text-sm text-white/75">
                <Calendar size={14} />
                {new Date(post.createdAt).toLocaleDateString("vi-VN", { day: "2-digit", month: "long", year: "numeric" })}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb (no hero image) */}
        {!post.image && (
          <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-sm text-gray-500">
            <Link href="/" className="hover:text-[#8B1A1A] transition-colors">Trang chủ</Link>
            <ChevronRight size={14} />
            <Link href="/news" className="hover:text-[#8B1A1A] transition-colors">Tin tức</Link>
            <ChevronRight size={14} />
            <span className="text-gray-700 line-clamp-1">{post.title}</span>
          </nav>
        )}

        {/* Title (no hero image) */}
        {!post.image && (
          <div className="mb-8">
            <div className="mb-3 flex items-center gap-2 text-sm text-gray-400">
              <Calendar size={14} />
              {new Date(post.createdAt).toLocaleDateString("vi-VN", { day: "2-digit", month: "long", year: "numeric" })}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 leading-tight md:text-4xl">
              {post.title}
            </h1>
          </div>
        )}

        {/* Article body */}
        <article className="rounded-2xl bg-white px-6 py-8 shadow-sm sm:px-8 md:px-10">
          <div
            className="prose prose-lg max-w-none
              prose-headings:font-bold prose-headings:text-gray-900
              prose-h2:text-2xl prose-h3:text-xl
              prose-p:leading-relaxed prose-p:text-gray-700
              prose-a:text-[#8B1A1A] prose-a:no-underline hover:prose-a:underline
              prose-strong:text-gray-900
              prose-img:rounded-xl prose-img:shadow-sm prose-img:mx-auto
              prose-blockquote:border-l-[#8B1A1A] prose-blockquote:bg-amber-50 prose-blockquote:py-1 prose-blockquote:rounded-r-lg
              prose-li:text-gray-700
              prose-hr:border-amber-200"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content, SANITIZE_OPTIONS) }}
          />
        </article>

        {/* Back / share nav */}
        <div className="mt-8 flex items-center justify-between">
          <Link
            href="/news"
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:border-[#8B1A1A] hover:text-[#8B1A1A] transition-colors"
          >
            <ArrowLeft size={15} /> Tất cả bài viết
          </Link>
          {isDraft && (
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
              Bản nháp
            </span>
          )}
        </div>

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <aside className="mt-12 rounded-2xl border border-amber-100 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-900">Sản phẩm nổi bật</h2>
              <Link href="/san-pham" className="flex items-center gap-1 text-xs font-semibold text-[#8B1A1A] hover:underline">
                Xem tất cả <ArrowRight size={12} />
              </Link>
            </div>
            <ul className="grid gap-4 sm:grid-cols-3">
              {relatedProducts.map((product) => (
                <li key={product.slug}>
                  <Link
                    href={`/san-pham/${product.slug}`}
                    className="group block overflow-hidden rounded-xl border border-gray-100 transition-all hover:border-amber-200 hover:shadow-md"
                  >
                    <div className="relative aspect-square overflow-hidden bg-slate-50">
                      {product.imageUrl ? (
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          fill
                          sizes="(max-width: 640px) 33vw, 150px"
                          className="object-cover transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-2xl">🍶</div>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-[#8B1A1A] transition-colors leading-snug">
                        {product.name}
                      </p>
                      <p className="mt-1 text-xs font-medium text-amber-700">
                        {product.price.toLocaleString("vi-VN")}đ
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        )}

        {/* Related posts */}
        {relatedPosts.length > 0 && (
          <aside className="mt-8 rounded-2xl border border-amber-100 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-base font-bold text-gray-900">Bài viết khác</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {relatedPosts.map((p) => (
                <Link
                  key={p.slug}
                  href={`/news/${p.slug}`}
                  className="group block overflow-hidden rounded-xl border border-gray-100 transition-all hover:border-amber-200 hover:shadow-md"
                >
                  <div className="relative aspect-video overflow-hidden bg-slate-50">
                    {p.image ? (
                      <Image
                        src={p.image}
                        alt={p.title}
                        fill
                        sizes="(max-width: 640px) 100vw, 33vw"
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-amber-50 text-amber-300 text-2xl">📰</div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-xs text-gray-400 mb-1">
                      {new Date(p.createdAt).toLocaleDateString("vi-VN", { day: "2-digit", month: "long" })}
                    </p>
                    <p className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-[#8B1A1A] transition-colors leading-snug">
                      {p.title}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
