import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";
import { absoluteUrl, metaDescription, SITE_NAME } from "@/lib/seo";
import { getSections } from "@/lib/sections";
import { getHeroColorStyle } from "@/lib/hero-colors";
import { ArrowRight, BookOpen, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Tin tức",
  description: `Tin tức và bài viết mới nhất từ ${SITE_NAME}.`,
  alternates: { canonical: "/tin-tuc" },
  openGraph: {
    type: "website",
    url: absoluteUrl("/tin-tuc"),
    title: `Tin tức — ${SITE_NAME}`,
    description: `Tin tức và bài viết mới nhất từ ${SITE_NAME}.`,
    siteName: SITE_NAME,
  },
};

export const dynamic = "force-dynamic";

export default async function TinTucPage() {
  const [posts, sections] = await Promise.all([
    db.post.findMany({
      where: { isPublished: true, isDeleted: false },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        image: true,
        content: true,
        createdAt: true,
      },
    }),
    getSections(),
  ]);

  const [featured, ...rest] = posts;
  const heroBadge = sections["tin-tuc.hero.badge"]?.text?.trim() || "Cập nhật thường xuyên";
  const heroTitle = sections["tin-tuc.hero.title"]?.text?.trim() || "Tin Tức & Bài Viết";
  const heroSubtitle =
    sections["tin-tuc.hero.subtitle"]?.text?.trim() ||
    "Kiến thức về rượu truyền thống, sức khỏe và văn hóa ẩm thực Việt Nam";
  const heroColor = getHeroColorStyle(sections["tin-tuc.hero.color"]?.text, "blue");

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      {/* Page header */}
      <section
        className={`relative overflow-hidden ${heroColor.className} px-4 py-12 text-center sm:py-16`}
        style={heroColor.style}
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, #d4af37 1px, transparent 1px), radial-gradient(circle at 80% 70%, #d4af37 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="relative mx-auto max-w-4xl">
          {heroBadge ? (
            <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.22em] text-[#d4af37] ring-1 ring-white/20 backdrop-blur">
              <Sparkles size={12} />
              {heroBadge}
            </p>
          ) : null}
          <h1 className="text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl">{heroTitle}</h1>
          {heroSubtitle ? (
            <p className="mx-auto mt-3 max-w-2xl text-sm text-white/85 sm:text-base">{heroSubtitle}</p>
          ) : null}
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        {posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center shadow-sm">
            <BookOpen className="mx-auto mb-3 h-10 w-10 text-gray-300" />
            <p className="text-base font-semibold text-gray-800">Chưa có bài viết nào được xuất bản.</p>
            <p className="mt-2 text-sm text-gray-500">Hãy ghé lại sau — chúng tôi sẽ sớm cập nhật tin mới.</p>
            <Link
              href="/san-pham"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#8B1A1A] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#6f1414]"
            >
              Xem sản phẩm <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <>
            {/* Featured post */}
            {featured && (
              <Link
                href={`/tin-tuc/${featured.slug}`}
                className="group mb-10 flex flex-col overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-black/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl md:flex-row"
              >
                <div className="relative aspect-video w-full shrink-0 overflow-hidden bg-slate-100 md:aspect-auto md:w-1/2">
                  {featured.image ? (
                    <Image
                      src={featured.image}
                      alt={featured.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      priority
                    />
                  ) : (
                    <div className="flex h-full min-h-[200px] w-full items-center justify-center bg-gradient-to-br from-blue-50 to-amber-50 text-sm font-bold text-[#004a99]">
                      Rượu Truyền Thống
                    </div>
                  )}
                  <div className="absolute left-3 top-3 rounded-full bg-[#d4af37] px-3 py-1 text-xs font-bold text-[#003b7a]">
                    Nổi bật
                  </div>
                </div>
                <div className="flex flex-col justify-center p-6 sm:p-8">
                  <time className="text-xs font-medium text-gray-400">
                    {new Date(featured.createdAt).toLocaleDateString("vi-VN", {
                      day: "2-digit", month: "long", year: "numeric",
                    })}
                  </time>
                  <h2 className="mt-2 text-xl font-bold leading-snug text-gray-900 transition-colors group-hover:text-[#004a99] sm:text-2xl">
                    {featured.title}
                  </h2>
                  <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-gray-500 sm:text-base">
                    {metaDescription(featured.content, 200)}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-[#8B1A1A]">
                    Đọc bài viết <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            )}

            {/* Rest of posts grid */}
            {rest.length > 0 && (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((post) => {
                  const excerpt = metaDescription(post.content, 130);
                  return (
                    <Link
                      key={post.id}
                      href={`/tin-tuc/${post.slug}`}
                      className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                    >
                      <div className="relative aspect-video overflow-hidden bg-slate-100">
                        {post.image ? (
                          <Image
                            src={post.image}
                            alt={post.title}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-50 to-amber-50 text-xs font-bold text-[#2b6cb0]">
                            Rượu Truyền Thống
                          </div>
                        )}
                      </div>
                      <div className="flex flex-1 flex-col p-5">
                        <time className="text-xs font-medium text-gray-400">
                          {new Date(post.createdAt).toLocaleDateString("vi-VN", {
                            day: "2-digit", month: "long", year: "numeric",
                          })}
                        </time>
                        <h2 className="mt-2 line-clamp-2 flex-1 text-base font-bold leading-snug text-gray-900 transition-colors group-hover:text-[#004a99]">
                          {post.title}
                        </h2>
                        {excerpt && (
                          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-gray-500">
                            {excerpt}
                          </p>
                        )}
                        <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-[#8B1A1A]">
                          Đọc tiếp <span className="transition-transform group-hover:translate-x-1">→</span>
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
