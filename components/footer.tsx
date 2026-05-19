import Link from "next/link";
import sanitizeHtml from "sanitize-html";
import type { FooterConfig } from "@/lib/settings";
import { DEFAULT_FOOTER_CONFIG } from "@/lib/settings";
import { getFooterColorStyle } from "@/lib/footer-colors";

interface FooterProps {
  config?: FooterConfig;
}

const SHOP_INFO_HTML_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "p",
    "br",
    "strong",
    "em",
    "b",
    "i",
    "u",
    "a",
    "ul",
    "ol",
    "li",
    "span",
    "div",
    "h1",
    "h2",
    "h3",
    "blockquote",
  ],
  allowedAttributes: {
    a: ["href", "target", "rel", "class", "style"],
    span: ["class", "style"],
    div: ["class", "style"],
    p: ["class", "style"],
    h1: ["class", "style"],
    h2: ["class", "style"],
    h3: ["class", "style"],
    blockquote: ["class", "style"],
  },
  allowedStyles: {
    "*": {
      color: [/^#[0-9a-fA-F]{3,8}$/, /^rgb\(/, /^rgba\(/],
      "background-color": [/^#[0-9a-fA-F]{3,8}$/, /^rgb\(/, /^rgba\(/],
      "font-size": [/^\d+(?:\.\d+)?(?:px|em|rem|%)$/],
      "font-family": [/^[\w\s"',.-]+$/],
      "font-weight": [/^(?:normal|bold|[1-9]00)$/],
      "font-style": [/^(?:normal|italic)$/],
      "text-align": [/^(?:left|center|right|justify)$/],
      "line-height": [/^\d+(?:\.\d+)?(?:px|em|rem|%)?$/],
    },
  },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  transformTags: {
    a: (tagName, attribs) => ({
      tagName,
      attribs: {
        href: attribs.href || "",
        rel: "noopener noreferrer",
        target: attribs.target || "_blank",
        ...(attribs.class ? { class: attribs.class } : {}),
      },
    }),
  },
};

function safeShopInfo(html: string) {
  return sanitizeHtml(html, SHOP_INFO_HTML_OPTIONS);
}

function extractIframeSrc(value: string) {
  const match = value.match(/<iframe\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/i);
  return match?.[1] || value;
}

function normalizeFacebookPageUrl(raw: string) {
  const input = extractIframeSrc(raw.trim());
  if (!input) return "";

  try {
    const url = new URL(input);
    const host = url.hostname.toLowerCase();
    if (!host.includes("facebook.com")) return "";

    if (url.pathname.includes("/plugins/page.php")) {
      const href = url.searchParams.get("href");
      return href ? decodeURIComponent(href) : "";
    }

    return `https://www.facebook.com${url.pathname}`.replace(/\/$/, "");
  } catch {
    return "";
  }
}

function buildFacebookPageIframe(value: string) {
  const pageUrl = normalizeFacebookPageUrl(value);
  if (!pageUrl) return "";

  const params = new URLSearchParams({
    href: pageUrl,
    tabs: "timeline",
    width: "340",
    height: "340",
    small_header: "false",
    adapt_container_width: "true",
    hide_cover: "false",
    show_facepile: "true",
  });

  return `<iframe title="Facebook Fanpage" src="https://www.facebook.com/plugins/page.php?${params.toString()}" width="340" height="340" style="border:none;overflow:hidden" scrolling="no" frameborder="0" allowfullscreen="true" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share" loading="lazy"></iframe>`;
}

function FooterLinks({ title, links }: { title: string; links: FooterConfig["newsLinks"] }) {
  return (
    <div className="min-w-0">
      <h4 className="mb-4 text-sm font-bold uppercase tracking-wide text-amber-200">{title}</h4>
      <ul className="space-y-3">
        {links.map((link) => {
          const isExternal = /^https?:\/\//i.test(link.href);
          const className =
            "inline-flex min-h-8 max-w-full items-start break-words text-sm leading-6 text-white/80 transition-colors hover:text-amber-200";
          return (
            <li key={`${link.label}-${link.href}`} className="min-w-0">
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
  const shopInfo = safeShopInfo(config.shopInfoHtml);
  const fanpageIframe = buildFacebookPageIframe(config.fanpageIframe);
  const copyright = config.copyright?.trim() ?? "";
  const { className: colorClass, style: colorStyle } = getFooterColorStyle(
    config.colorPreset,
    "blue",
  );

  return (
    <footer className={`${colorClass} text-white`} style={colorStyle}>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-x-12 gap-y-10 md:grid-cols-2 xl:grid-cols-[minmax(0,1.25fr)_minmax(160px,0.75fr)_minmax(180px,0.85fr)_minmax(280px,340px)]">
          <div className="min-w-0">
            <h3 className="mb-4 text-lg font-bold text-amber-200">Thông tin Shop</h3>
            <div
              className="prose prose-sm max-w-none break-words text-white prose-p:my-2 prose-p:text-white/85 prose-headings:text-amber-200 prose-strong:text-amber-200 prose-a:break-words prose-a:text-amber-200 prose-li:text-white/85"
              dangerouslySetInnerHTML={{ __html: shopInfo }}
            />
          </div>

          <FooterLinks title="Tin tức" links={config.newsLinks} />
          <FooterLinks title="Chính sách" links={config.policyLinks} />

          <div className="min-w-0 xl:max-w-[340px]">
            <h4 className="mb-4 text-sm font-bold uppercase tracking-wide text-amber-200">
              Fanpage
            </h4>
            {fanpageIframe ? (
              <div
                className="aspect-square overflow-hidden rounded-md bg-white/10 [&_iframe]:block [&_iframe]:h-full [&_iframe]:w-full [&_iframe]:max-w-full"
                dangerouslySetInnerHTML={{ __html: fanpageIframe }}
              />
            ) : (
              <p className="text-sm leading-6 text-white/75">Fanpage sẽ hiển thị khi có link hoặc mã nhúng.</p>
            )}
          </div>
        </div>

        {copyright ? (
          <div className="mt-10 border-t border-white/20 pt-6">
            <p className="break-words text-center text-sm leading-6 text-white/75 md:text-left">
              {copyright}
            </p>
          </div>
        ) : null}
      </div>
    </footer>
  );
}
