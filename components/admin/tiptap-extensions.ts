import { Extension } from "@tiptap/core";

/**
 * FontSize mark — extends TextStyle để set inline `style="font-size: ..."`.
 * TipTap không có sẵn extension này, nên tự viết bằng Mark API.
 *
 * Dùng: editor.chain().focus().setFontSize('18px').run()
 *       editor.chain().focus().unsetFontSize().run()
 */
export const FontSize = Extension.create<{
  types: string[];
}>({
  name: "fontSize",

  addOptions() {
    return { types: ["textStyle"] };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) => element.style.fontSize?.replace(/['"]+/g, "") || null,
            renderHTML: (attributes) => {
              if (!attributes.fontSize) return {};
              return { style: `font-size: ${attributes.fontSize}` };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setFontSize:
        (fontSize: string) =>
        ({ chain }: { chain: () => { setMark: (n: string, a: object) => { run: () => boolean } } }) => {
          return chain().setMark("textStyle", { fontSize }).run();
        },
      unsetFontSize:
        () =>
        ({ chain }: { chain: () => { setMark: (n: string, a: object) => { removeEmptyTextStyle: () => { run: () => boolean } } } }) => {
          return chain().setMark("textStyle", { fontSize: null }).removeEmptyTextStyle().run();
        },
    } as never;
  },
});

/**
 * LineHeight extension — set `style="line-height: ..."` trên block (paragraph/heading).
 * Khác FontSize: line-height áp dụng cho block element, không phải mark inline.
 */
export const LineHeight = Extension.create<{
  types: string[];
  defaults: string[];
}>({
  name: "lineHeight",

  addOptions() {
    return {
      types: ["paragraph", "heading"],
      defaults: ["1", "1.15", "1.5", "1.75", "2", "2.5"],
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          lineHeight: {
            default: null,
            parseHTML: (element) => element.style.lineHeight || null,
            renderHTML: (attributes) => {
              if (!attributes.lineHeight) return {};
              return { style: `line-height: ${attributes.lineHeight}` };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setLineHeight:
        (lineHeight: string) =>
        ({ commands }: { commands: { updateAttributes: (t: string, a: object) => boolean } }) => {
          return this.options.types.every((type) =>
            commands.updateAttributes(type, { lineHeight })
          );
        },
      unsetLineHeight:
        () =>
        ({ commands }: { commands: { resetAttributes: (t: string, n: string) => boolean } }) => {
          return this.options.types.every((type) => commands.resetAttributes(type, "lineHeight"));
        },
    } as never;
  },
});
