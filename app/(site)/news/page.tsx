import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";
import { absoluteUrl, metaDescription, SITE_NAME } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Tin tức",
  description: `Tin tức và bài viết mới nhất từ ${SITE_NAME}.`,
  alternates: { canonical: "/news" },
  openGraph: {
    type: "website",
    url: absoluteUrl("/news"),
    title: `Tin tức — ${SITE_NAME}`,
    description: `Tin tức và bài viết mới nhất từ ${SITE_NAME}.`,
    siteName: SITE_NAME,
  },
};

export const dynamic = "force-dynamic";

export default async function NewsPage() {
  const posts = await db.post.findMany({
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
  });

  return (
    <div className="bg-white">
      <div className="container mx-auto max-w-5xl px-4 py-12">
        <h1 className="text-3xl font-bold mb-8 text-center">Tin tức</h1>

        {posts.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 bg-slate-50 p-10 text-center">
            <p className="text-base font-semibold text-gray-800">Chưa có bài viết nào được xuất bản.</p>
            <p className="mt-2 text-sm text-gray-500">
              Hãy ghé lại sau — chúng tôi sẽ sớm cập nhật tin mới.
            </p>
            <Link
              href="/san-pham"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#8B1A1A] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#6f1414]"
            >
              Xem sản phẩm
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => {
              const excerpt = metaDescription(post.content, 150);
              return (
                <Link
                  key={post.id}
                  href={`/news/${post.slug}`}
                  className="group border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {post.image && (
                    <div className="relative aspect-video overflow-hidden bg-slate-100">
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <time className="text-xs text-gray-400">
                      {new Date(post.createdAt).toLocaleDateString("vi-VN")}
                    </time>
                    <h2 className="font-semibold mt-1 group-hover:text-[#8B1A1A] transition-colors">
                      {post.title}
                    </h2>
                    <p className="text-sm text-gray-600 mt-2 line-clamp-3">
                      {excerpt}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
