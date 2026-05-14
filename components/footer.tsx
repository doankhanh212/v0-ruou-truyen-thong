import Link from "next/link";
import sanitizeHtml from "sanitize-html";
import type { FooterConfig } from "@/lib/settings";
import { DEFAULT_FOOTER_CONFIG } from "@/lib/settings";
import { PAGE_HTML_OPTIONS } from "@/lib/sanitize-page-html";

interface FooterProps {
  config?: FooterConfig;
}

function safeHtml(html: string) {
  return sanitizeHtml(html, PAGE_HTML_OPTIONS);
}

function FooterLinks({ title, links }: { title: string; links: FooterConfig["newsLinks"] }) {
  return (
    <div>
      <h4 className="mb-4 text-sm font-bold uppercase tracking-wide text-amber-200">{title}</h4>
      <ul className="space-y-2">
        {links.map((link) => {
          const isExternal = /^https?:\/\//i.test(link.href);
          const className =
            "inline-flex min-h-10 items-center text-sm text-white/80 transition-colors hover:text-amber-200";
          return (
            <li key={`${link.label}-${link.href}`}>
              {isExternal ? (
                <a href={link.href} target="_blank" rel="noopener noreferrer" className={className}>
                  {link.label}
                </a>
              ) : (
                <Link href={link.href} className={className}>
                  {link.label}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function Footer({ config = DEFAULT_FOOTER_CONFIG }: FooterProps) {
  const currentYear = new Date().getFullYear();
  const shopInfo = safeHtml(config.shopInfoHtml);
  const fanpageIframe = safeHtml(config.fanpageIframe);
  const copyright =
    config.copyright?.trim() || DEFAULT_FOOTER_CONFIG.copyright;

  return (
    <footer className="bg-[#2b6cb0] text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <h3 className="mb-4 text-lg font-bold text-amber-200">Thông tin Shop</h3>
            <div
              className="prose prose-sm max-w-none text-white prose-p:text-white/85 prose-strong:text-amber-200 prose-a:text-amber-200 prose-li:text-white/85"
              dangerouslySetInnerHTML={{ __html: shopInfo }}
            />
          </div>

          <FooterLinks title="Tin tức" links={config.newsLinks} />
          <FooterLinks title="Chính sách" links={config.policyLinks} />

          <div>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-wide text-amber-200">
              Fanpage
            </h4>
            {fanpageIframe ? (
              <div
                className="overflow-hidden rounded-md bg-white/10 [&_iframe]:max-w-full"
                dangerouslySetInnerHTML={{ __html: fanpageIframe }}
              />
            ) : (
              <p className="text-sm text-white/75">Fanpage sẽ hiển thị khi có mã nhúng.</p>
            )}
          </div>
        </div>

        <div className="mt-10 border-t border-white/20 pt-6">
          <p className="text-center text-sm text-white/75 md:text-left">
            © {currentYear} {copyright}
          </p>
        </div>
      </div>
    </footer>
  );
}
