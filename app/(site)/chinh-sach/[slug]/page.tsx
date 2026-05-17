import type { Metadata } from "next";
import { notFound } from "next/navigation";
import sanitizeHtml from "sanitize-html";
import { FileText, ShieldCheck } from "lucide-react";
import { absoluteUrl, SITE_NAME } from "@/lib/seo";
import { getSeoByPath } from "@/lib/seo-pages";
import { getStaticPage } from "@/lib/static-pages";
import { PAGE_HTML_OPTIONS } from "@/lib/sanitize-page-html";
import { getSections } from "@/lib/sections";
import { getHeroColorStyle } from "@/lib/hero-colors";
import { POLICY_PAGES, getPolicyPageByPublicSlug } from "@/lib/policy-pages";

type Props = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return POLICY_PAGES.map((page) => ({ slug: page.publicSlug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const policy = getPolicyPageByPublicSlug(slug);
  if (!policy) return { title: "Không tìm thấy", robots: { index: false, follow: false } };

  const [seo, page] = await Promise.all([
    getSeoByPath(policy.href),
    getStaticPage(policy.pageSlug),
  ]);
  const title = seo?.title || page?.metaTitle || page?.title || policy.title;
  const description = seo?.description || page?.metaDescription || policy.description;

  return {
    title,
    description,
    keywords: seo?.keywords || undefined,
    alternates: { canonical: policy.href },
    openGraph: {
      type: "website",
      url: absoluteUrl(policy.href),
      title,
      description,
      siteName: SITE_NAME,
    },
    twitter: { card: "summary", title, description },
  };
}

export default async function PolicyPage({ params }: Props) {
  const { slug } = await params;
  const policy = getPolicyPageByPublicSlug(slug);
  if (!policy) notFound();

  const [page, sections] = await Promise.all([
    getStaticPage(policy.pageSlug),
    getSections(),
  ]);

  const safeContent = page?.content ? sanitizeHtml(page.content, PAGE_HTML_OPTIONS) : "";
  const title = page?.title || policy.title;
  const heroBadge = sections[`${policy.pageSlug}.hero.badge`]?.text?.trim() ?? "";
  const heroSubtitle = sections[`${policy.pageSlug}.hero.subtitle`]?.text?.trim() ?? "";
  const heroColor = getHeroColorStyle(sections[`${policy.pageSlug}.hero.color`]?.text, "blue");

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <section
        className={`relative overflow-hidden ${heroColor.className} px-4 py-14 sm:py-20`}
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
        <div className="relative mx-auto max-w-4xl text-center">
          {heroBadge ? (
            <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.22em] text-[#d4af37] ring-1 ring-white/20 backdrop-blur">
              <ShieldCheck size={12} />
              {heroBadge}
            </p>
          ) : null}
          <h1 className="text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl">
            {title}
          </h1>
          {heroSubtitle ? (
            <p className="mx-auto mt-4 max-w-2xl text-sm text-white/85 sm:text-base">
              {heroSubtitle}
            </p>
          ) : null}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        {safeContent ? (
          <article className="rounded-3xl bg-white px-6 py-10 shadow-md ring-1 ring-black/5 sm:px-10 md:px-14">
            <div
              className="article-content max-w-none"
              dangerouslySetInnerHTML={{ __html: safeContent }}
            />
          </article>
        ) : (
          <div className="rounded-3xl border border-dashed border-amber-300 bg-white px-6 py-16 text-center shadow-sm">
            <FileText className="mx-auto mb-3 h-10 w-10 text-amber-300" />
            <p className="text-sm font-semibold text-gray-600">
              Nội dung trang này sẽ hiển thị sau khi admin lưu trong khu vực Quản lý trang tĩnh.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
