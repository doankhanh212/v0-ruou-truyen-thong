import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";
import sanitizeHtml from "sanitize-html";
import { absoluteUrl, metaDescription, metaTitle, SITE_NAME } from "@/lib/seo";
import { isAuthenticated } from "@/lib/auth";
import { Calendar, ArrowLeft, ArrowRight, ChevronRight } from "lucide-react";
import { NewsShareActions } from "@/components/news-share-actions";

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

  const [post, relatedPosts] = await Promise.all([
    loadPost(slug, allowUnpublished),
    db.post.findMany({
      where: { isPublished: true, isDeleted: false, slug: { not: slug } },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: { slug: true, title: true, image: true, createdAt: true, content: true },
    }),
  ]);

  if (!post) notFound();

  const isDraft = !post.isPublished;
  const canonical = `/news/${slug}`;
  const canonicalUrl = absoluteUrl(canonical);
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

        <section className="mt-8 space-y-10">
          <div className="border-t border-amber-200/80 pt-6">
            <div className="flex flex-col gap-4 rounded-2xl bg-white/70 px-5 py-4 shadow-sm ring-1 ring-black/5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-bold text-gray-900">Chia sẻ bài viết:</p>
                <p className="mt-1 text-xs text-gray-500">Gửi bài viết này cho bạn bè hoặc lưu lại để đọc sau.</p>
              </div>
              <NewsShareActions url={canonicalUrl} title={post.title} />
            </div>
          </div>

          <section className="overflow-hidden rounded-xl bg-gradient-to-r from-[#004a99] to-[#2b6cb0] px-6 py-7 text-white shadow-xl shadow-blue-950/10 ring-1 ring-white/10 sm:px-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="max-w-xl">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#d4af37]">Rượu Truyền Thống</p>
                <h2 className="mt-2 text-2xl font-bold leading-tight md:text-3xl">
                  Trải nghiệm Tinh hoa Rượu Truyền Thống Việt Nam.
                </h2>
                <p className="mt-3 text-sm font-medium leading-6 text-blue-50 md:text-base">
                  Đậm đà bản sắc - Khẳng định đẳng cấp.
                </p>
              </div>
              <Link
                href="/san-pham"
                className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#d4af37] px-6 py-3 text-sm font-extrabold text-[#003b7a] shadow-lg shadow-blue-950/20 transition-all hover:scale-105 hover:bg-[#e2c15b] focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:ring-offset-2 focus:ring-offset-[#004a99]"
              >
                Khám phá Sản Phẩm
                <ArrowRight size={16} />
              </Link>
            </div>
          </section>

          {relatedPosts.length > 0 && (
            <aside>
              <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#2b6cb0]">Đọc thêm</p>
                  <h2 className="mt-1 text-2xl font-bold text-gray-900">Bài viết liên quan</h2>
                </div>
                <Link href="/news" className="hidden items-center gap-1 text-sm font-bold text-[#004a99] hover:underline sm:inline-flex">
                  Xem tất cả <ArrowRight size={14} />
                </Link>
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {relatedPosts.map((p) => (
                  <Link
                    key={p.slug}
                    href={`/news/${p.slug}`}
                    className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="relative aspect-video overflow-hidden bg-slate-100">
                      {p.image ? (
                        <Image
                          src={p.image}
                          alt={p.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-50 to-amber-50 text-sm font-bold text-[#2b6cb0]">
                          Rượu Truyền Thống
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <p className="text-xs font-medium text-gray-400">
                        {new Date(p.createdAt).toLocaleDateString("vi-VN", { day: "2-digit", month: "long", year: "numeric" })}
                      </p>
                      <h3 className="mt-2 line-clamp-2 min-h-[3rem] text-base font-bold leading-6 text-[#004a99] transition-colors group-hover:text-[#2b6cb0]">
                        {p.title}
                      </h3>
                      <p className="mt-4 inline-flex items-center text-sm font-bold text-[#d4af37]">
                        Đọc tiếp <span className="ml-1 transition-transform group-hover:translate-x-1">→</span>
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </aside>
          )}
        </section>

        <div className="mt-8 flex items-center justify-between">
          <Link
            href="/news"
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:border-[#8B1A1A] hover:text-[#8B1A1A]"
          >
            <ArrowLeft size={15} /> Tất cả bài viết
          </Link>
          {isDraft && (
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
              Bản nháp
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
