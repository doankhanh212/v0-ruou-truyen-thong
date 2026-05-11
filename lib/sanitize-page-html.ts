import sanitizeHtml from "sanitize-html";

/**
 * Sanitize options for rich-content static pages (giới thiệu, liên hệ) and posts.
 *
 * Allows: full WYSIWYG output from TipTap (table, color, highlight, alignment) plus
 * raw HTML edited via the editor's HTML toggle. We keep the schema permissive enough
 * for marketing pages (admin-only input) while still stripping scripts and event
 * handlers via sanitize-html defaults.
 */
export const PAGE_HTML_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "h1", "h2", "h3", "h4", "h5", "h6",
    "p", "br", "hr", "blockquote",
    "ul", "ol", "li",
    "strong", "em", "b", "i", "u", "s", "mark", "small", "sub", "sup",
    "a", "img",
    "code", "pre",
    "span", "div",
    "table", "thead", "tbody", "tfoot", "tr", "th", "td", "caption", "colgroup", "col",
    "figure", "figcaption",
  ],
  allowedAttributes: {
    a: ["href", "target", "rel", "class", "style"],
    img: ["src", "alt", "width", "height", "class", "style"],
    p: ["style", "class"],
    h1: ["style", "class"],
    h2: ["style", "class"],
    h3: ["style", "class"],
    h4: ["style", "class"],
    h5: ["style", "class"],
    h6: ["style", "class"],
    span: ["style", "class"],
    div: ["style", "class"],
    mark: ["style", "data-color"],
    blockquote: ["style", "class"],
    table: ["style", "class", "border", "cellpadding", "cellspacing"],
    thead: ["style", "class"],
    tbody: ["style", "class"],
    tr: ["style", "class"],
    th: ["style", "class", "colspan", "rowspan"],
    td: ["style", "class", "colspan", "rowspan"],
    figure: ["style", "class"],
    figcaption: ["style", "class"],
    li: ["style", "class"],
    ul: ["style", "class"],
    ol: ["style", "class", "start"],
  },
  allowedStyles: {
    "*": {
      "text-align": [/^left$/, /^right$/, /^center$/, /^justify$/],
      // Hex (#rgb, #rrggbb), rgb()/rgba(), and named colors
      "color": [/^#(0x)?[0-9a-f]+$/i, /^rgba?\(\s*(\d+%?\s*,\s*){2,3}[\d.]+%?\s*\)$/i, /^[a-z]+$/i],
      "background-color": [/^#(0x)?[0-9a-f]+$/i, /^rgba?\(\s*(\d+%?\s*,\s*){2,3}[\d.]+%?\s*\)$/i, /^[a-z]+$/i],
      "font-size": [/^\d+(?:px|em|rem|%|pt)$/],
      "font-family": [/^[\w\s,'"-]{1,200}$/],
      "font-weight": [/^(?:bold|normal|\d{3})$/],
      "font-style": [/^(?:italic|normal)$/],
      "text-decoration": [/^(?:underline|line-through|none)$/],
      "line-height": [/^[\d.]+(?:px|em|rem|%)?$/],
      "width": [/^\d+(?:px|%|em|rem)$/, /^auto$/],
      "height": [/^\d+(?:px|%|em|rem)$/, /^auto$/],
      "border": [/^.{0,80}$/],
      "border-color": [/^#(0x)?[0-9a-f]+$/i, /^rgba?\(\s*(\d+%?\s*,\s*){2,3}[\d.]+%?\s*\)$/i, /^[a-z]+$/i],
      "padding": [/^\d+(?:px|em|rem|%)(?:\s+\d+(?:px|em|rem|%)){0,3}$/],
      "margin": [/^\d+(?:px|em|rem|%)(?:\s+\d+(?:px|em|rem|%)){0,3}$/],
    },
  },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  allowedSchemesByTag: { img: ["http", "https"] },
  transformTags: {
    a: (tagName, attribs) => ({
      tagName,
      attribs: {
        href: attribs.href || "",
        rel: "noopener noreferrer",
        target: attribs.target || "_blank",
        class: attribs.class || "",
        ...(attribs.style ? { style: attribs.style } : {}),
      },
    }),
  },
};
