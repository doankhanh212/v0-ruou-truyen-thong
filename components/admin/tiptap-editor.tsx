"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { Highlight } from "@tiptap/extension-highlight";
import { FontFamily } from "@tiptap/extension-font-family";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { FontSize, LineHeight } from "@/components/admin/tiptap-extensions";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  Image as ImageIcon,
  Undo,
  Redo,
  Pilcrow,
  Quote,
  Minus,
  Code,
  Table as TableIcon,
  Highlighter,
  Palette,
  Eraser,
  Code2,
} from "lucide-react";

export interface TiptapEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
}

const TEXT_COLORS = [
  "#000000", "#374151", "#6b7280", "#ef4444", "#f59e0b",
  "#22c55e", "#0ea5e9", "#8b5cf6", "#ec4899", "#8B1A1A",
];

const HIGHLIGHT_COLORS = [
  "#fef08a", "#bbf7d0", "#bfdbfe", "#fecaca", "#fed7aa",
  "#e9d5ff", "#fbcfe8",
];

const FONT_FAMILIES = [
  { label: "Mặc định", value: "" },
  { label: "Inter", value: "Inter, system-ui, sans-serif" },
  { label: "Arial", value: "Arial, sans-serif" },
  { label: "Helvetica", value: "Helvetica, Arial, sans-serif" },
  { label: "Times New Roman", value: '"Times New Roman", Times, serif' },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Tahoma", value: "Tahoma, sans-serif" },
  { label: "Verdana", value: "Verdana, sans-serif" },
  { label: "Courier New", value: '"Courier New", monospace' },
];

const FONT_SIZES = [
  "12px", "14px", "16px", "18px", "20px", "24px", "28px", "32px", "36px", "48px", "64px",
];

const LINE_HEIGHTS = [
  { label: "Bình thường", value: "" },
  { label: "1.0", value: "1" },
  { label: "1.15", value: "1.15" },
  { label: "1.5", value: "1.5" },
  { label: "1.75", value: "1.75" },
  { label: "2.0", value: "2" },
  { label: "2.5", value: "2.5" },
];

export function TiptapEditor({
  value,
  onChange,
  placeholder = "Bắt đầu viết...",
  className = "min-h-[320px]",
}: TiptapEditorProps) {
  const [uploading, setUploading] = useState(false);
  const [showHtml, setShowHtml] = useState(false);
  const [htmlDraft, setHtmlDraft] = useState("");
  const [showColorMenu, setShowColorMenu] = useState(false);
  const [showHighlightMenu, setShowHighlightMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        // Cấu hình lại các extension StarterKit đã include sẵn (link, underline trong v3)
        link: {
          openOnClick: false,
          autolink: true,
          HTMLAttributes: {
            rel: "noopener noreferrer",
            target: "_blank",
            class: "text-blue-600 underline",
          },
        },
      }),
      TextStyle,
      Color,
      FontFamily,
      FontSize,
      LineHeight,
      Highlight.configure({ multicolor: true }),
      Image.configure({
        HTMLAttributes: { class: "rounded-lg max-w-full h-auto" },
      }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder }),
      Table.configure({ resizable: true, HTMLAttributes: { class: "border-collapse w-full my-4" } }),
      TableRow,
      TableHeader.configure({ HTMLAttributes: { class: "border border-gray-300 bg-gray-50 px-3 py-2 font-semibold" } }),
      TableCell.configure({ HTMLAttributes: { class: "border border-gray-300 px-3 py-2" } }),
    ],
    content: value || "",
    onUpdate({ editor }) {
      const html = editor.getHTML();
      onChange(html === "<p></p>" ? "" : html);
    },
    editorProps: {
      attributes: {
        class: `prose prose-sm sm:prose-base max-w-none focus:outline-none px-4 py-3 ${className}`,
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (current === value || (current === "<p></p>" && !value)) return;
    editor.commands.setContent(value || "", { emitUpdate: false });
  }, [value, editor]);

  // Close popovers on outside click
  useEffect(() => {
    function handleClick() {
      setShowColorMenu(false);
      setShowHighlightMenu(false);
    }
    if (showColorMenu || showHighlightMenu) {
      document.addEventListener("click", handleClick);
      return () => document.removeEventListener("click", handleClick);
    }
  }, [showColorMenu, showHighlightMenu]);

  const triggerImageUpload = useCallback(() => fileInputRef.current?.click(), []);

  const handleImageFile = useCallback(
    async (file: File) => {
      if (!editor) return;
      setUploading(true);
      try {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("type", "section");
        const res = await fetch("/api/media", { method: "POST", body: fd });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          alert(data.error || "Tải ảnh thất bại");
          return;
        }
        const data = await res.json();
        if (typeof data.url === "string" && data.url) {
          editor.chain().focus().setImage({ src: data.url }).run();
        }
      } catch (err) {
        console.error("[tiptap upload]", err);
        alert("Không kết nối được tới server");
      } finally {
        setUploading(false);
      }
    },
    [editor]
  );

  const promptForLink = useCallback(() => {
    if (!editor) return;
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL liên kết (để trống để bỏ link):", previous ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  function toggleHtmlMode() {
    if (!editor) return;
    if (showHtml) {
      // Going back to WYSIWYG: apply htmlDraft
      editor.commands.setContent(htmlDraft, { emitUpdate: true });
      setShowHtml(false);
    } else {
      // Going to HTML mode: snapshot current HTML
      setHtmlDraft(editor.getHTML());
      setShowHtml(true);
    }
  }

  if (!editor) {
    return (
      <div className="flex h-[320px] items-center justify-center rounded-lg border bg-gray-50 text-sm text-gray-400">
        Đang tải trình soạn thảo...
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-300 bg-white">
      <div className="flex flex-wrap items-center gap-0.5 border-b bg-gray-50 px-2 py-1.5">
        <ToolbarGroup>
          <ToolbarBtn
            active={editor.isActive("bold")}
            onClick={() => editor.chain().focus().toggleBold().run()}
            label="Đậm (Ctrl+B)"
            disabled={showHtml}
          >
            <Bold size={15} />
          </ToolbarBtn>
          <ToolbarBtn
            active={editor.isActive("italic")}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            label="Nghiêng (Ctrl+I)"
            disabled={showHtml}
          >
            <Italic size={15} />
          </ToolbarBtn>
          <ToolbarBtn
            active={editor.isActive("underline")}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            label="Gạch chân (Ctrl+U)"
            disabled={showHtml}
          >
            <UnderlineIcon size={15} />
          </ToolbarBtn>
          <ToolbarBtn
            active={editor.isActive("strike")}
            onClick={() => editor.chain().focus().toggleStrike().run()}
            label="Gạch ngang"
            disabled={showHtml}
          >
            <span className="line-through text-xs font-bold">S</span>
          </ToolbarBtn>
          <ToolbarBtn
            active={editor.isActive("code")}
            onClick={() => editor.chain().focus().toggleCode().run()}
            label="Code inline"
            disabled={showHtml}
          >
            <Code size={15} />
          </ToolbarBtn>
        </ToolbarGroup>

        <Divider />

        <ToolbarGroup>
          <ToolbarBtn
            active={editor.isActive("paragraph")}
            onClick={() => editor.chain().focus().setParagraph().run()}
            label="Đoạn văn"
            disabled={showHtml}
          >
            <Pilcrow size={15} />
          </ToolbarBtn>
          <ToolbarBtn
            active={editor.isActive("heading", { level: 1 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            label="Tiêu đề 1"
            disabled={showHtml}
          >
            <Heading1 size={15} />
          </ToolbarBtn>
          <ToolbarBtn
            active={editor.isActive("heading", { level: 2 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            label="Tiêu đề 2"
            disabled={showHtml}
          >
            <Heading2 size={15} />
          </ToolbarBtn>
          <ToolbarBtn
            active={editor.isActive("heading", { level: 3 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            label="Tiêu đề 3"
            disabled={showHtml}
          >
            <Heading3 size={15} />
          </ToolbarBtn>
        </ToolbarGroup>

        <Divider />

        {/* Font family / size / line height */}
        <ToolbarGroup>
          <select
            disabled={showHtml}
            value={(editor.getAttributes("textStyle").fontFamily as string) || ""}
            onChange={(e) => {
              const v = e.target.value;
              if (v) editor.chain().focus().setFontFamily(v).run();
              else editor.chain().focus().unsetFontFamily().run();
            }}
            title="Phông chữ"
            className="h-8 max-w-[110px] rounded-md border border-gray-200 bg-white px-1.5 text-xs disabled:opacity-40"
          >
            {FONT_FAMILIES.map((f) => (
              <option key={f.label} value={f.value}>{f.label}</option>
            ))}
          </select>

          <select
            disabled={showHtml}
            value={(editor.getAttributes("textStyle").fontSize as string) || ""}
            onChange={(e) => {
              const v = e.target.value;
              if (v) {
                (editor.chain().focus() as unknown as { setFontSize: (s: string) => { run: () => void } })
                  .setFontSize(v)
                  .run();
              } else {
                (editor.chain().focus() as unknown as { unsetFontSize: () => { run: () => void } })
                  .unsetFontSize()
                  .run();
              }
            }}
            title="Cỡ chữ"
            className="h-8 w-[68px] rounded-md border border-gray-200 bg-white px-1.5 text-xs disabled:opacity-40"
          >
            <option value="">Cỡ</option>
            {FONT_SIZES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <select
            disabled={showHtml}
            value={
              (editor.getAttributes("paragraph").lineHeight as string) ||
              (editor.getAttributes("heading").lineHeight as string) ||
              ""
            }
            onChange={(e) => {
              const v = e.target.value;
              if (v) {
                (editor.chain().focus() as unknown as { setLineHeight: (s: string) => { run: () => void } })
                  .setLineHeight(v)
                  .run();
              } else {
                (editor.chain().focus() as unknown as { unsetLineHeight: () => { run: () => void } })
                  .unsetLineHeight()
                  .run();
              }
            }}
            title="Dãn dòng"
            className="h-8 max-w-[100px] rounded-md border border-gray-200 bg-white px-1.5 text-xs disabled:opacity-40"
          >
            {LINE_HEIGHTS.map((lh) => (
              <option key={lh.label} value={lh.value}>{lh.label}</option>
            ))}
          </select>
        </ToolbarGroup>

        <Divider />

        {/* Color picker */}
        <ToolbarGroup>
          <div className="relative">
            <ToolbarBtn
              onClick={(e) => {
                e?.stopPropagation();
                setShowColorMenu((v) => !v);
                setShowHighlightMenu(false);
              }}
              label="Màu chữ"
              disabled={showHtml}
              active={showColorMenu}
            >
              <Palette size={15} />
            </ToolbarBtn>
            {showColorMenu && (
              <div
                className="absolute left-0 top-9 z-20 grid grid-cols-5 gap-1 rounded-lg border bg-white p-2 shadow-lg"
                onClick={(e) => e.stopPropagation()}
              >
                {TEXT_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      editor.chain().focus().setColor(c).run();
                      setShowColorMenu(false);
                    }}
                    className="h-6 w-6 rounded border border-gray-200"
                    style={{ background: c }}
                    title={c}
                  />
                ))}
                <button
                  type="button"
                  onClick={() => {
                    editor.chain().focus().unsetColor().run();
                    setShowColorMenu(false);
                  }}
                  className="col-span-5 mt-1 flex items-center justify-center gap-1 rounded border px-2 py-1 text-xs text-gray-600 hover:bg-gray-50"
                >
                  <Eraser size={11} /> Bỏ màu
                </button>
              </div>
            )}
          </div>

          <div className="relative">
            <ToolbarBtn
              onClick={(e) => {
                e?.stopPropagation();
                setShowHighlightMenu((v) => !v);
                setShowColorMenu(false);
              }}
              label="Tô nền"
              disabled={showHtml}
              active={showHighlightMenu}
            >
              <Highlighter size={15} />
            </ToolbarBtn>
            {showHighlightMenu && (
              <div
                className="absolute left-0 top-9 z-20 grid grid-cols-4 gap-1 rounded-lg border bg-white p-2 shadow-lg"
                onClick={(e) => e.stopPropagation()}
              >
                {HIGHLIGHT_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      editor.chain().focus().toggleHighlight({ color: c }).run();
                      setShowHighlightMenu(false);
                    }}
                    className="h-6 w-6 rounded border border-gray-200"
                    style={{ background: c }}
                    title={c}
                  />
                ))}
                <button
                  type="button"
                  onClick={() => {
                    editor.chain().focus().unsetHighlight().run();
                    setShowHighlightMenu(false);
                  }}
                  className="col-span-4 mt-1 flex items-center justify-center gap-1 rounded border px-2 py-1 text-xs text-gray-600 hover:bg-gray-50"
                >
                  <Eraser size={11} /> Bỏ tô
                </button>
              </div>
            )}
          </div>
        </ToolbarGroup>

        <Divider />

        <ToolbarGroup>
          <ToolbarBtn
            active={editor.isActive("bulletList")}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            label="Danh sách dấu chấm"
            disabled={showHtml}
          >
            <List size={15} />
          </ToolbarBtn>
          <ToolbarBtn
            active={editor.isActive("orderedList")}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            label="Danh sách số"
            disabled={showHtml}
          >
            <ListOrdered size={15} />
          </ToolbarBtn>
          <ToolbarBtn
            active={editor.isActive("blockquote")}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            label="Trích dẫn"
            disabled={showHtml}
          >
            <Quote size={15} />
          </ToolbarBtn>
          <ToolbarBtn
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            label="Đường ngang"
            disabled={showHtml}
          >
            <Minus size={15} />
          </ToolbarBtn>
        </ToolbarGroup>

        <Divider />

        <ToolbarGroup>
          <ToolbarBtn
            active={editor.isActive({ textAlign: "left" })}
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            label="Canh trái"
            disabled={showHtml}
          >
            <AlignLeft size={15} />
          </ToolbarBtn>
          <ToolbarBtn
            active={editor.isActive({ textAlign: "center" })}
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            label="Canh giữa"
            disabled={showHtml}
          >
            <AlignCenter size={15} />
          </ToolbarBtn>
          <ToolbarBtn
            active={editor.isActive({ textAlign: "right" })}
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            label="Canh phải"
            disabled={showHtml}
          >
            <AlignRight size={15} />
          </ToolbarBtn>
        </ToolbarGroup>

        <Divider />

        <ToolbarGroup>
          <ToolbarBtn
            active={editor.isActive("link")}
            onClick={promptForLink}
            label="Chèn liên kết"
            disabled={showHtml}
          >
            <LinkIcon size={15} />
          </ToolbarBtn>
          <ToolbarBtn
            onClick={triggerImageUpload}
            disabled={uploading || showHtml}
            label={uploading ? "Đang tải ảnh..." : "Chèn ảnh"}
          >
            <ImageIcon size={15} />
          </ToolbarBtn>
          <ToolbarBtn
            onClick={() =>
              editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
            }
            label="Chèn bảng 3×3"
            disabled={showHtml}
          >
            <TableIcon size={15} />
          </ToolbarBtn>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void handleImageFile(f);
              e.currentTarget.value = "";
            }}
          />
        </ToolbarGroup>

        <Divider />

        <ToolbarGroup>
          <ToolbarBtn
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo() || showHtml}
            label="Hoàn tác (Ctrl+Z)"
          >
            <Undo size={15} />
          </ToolbarBtn>
          <ToolbarBtn
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo() || showHtml}
            label="Làm lại (Ctrl+Y)"
          >
            <Redo size={15} />
          </ToolbarBtn>
        </ToolbarGroup>

        <Divider />

        <ToolbarGroup>
          <button
            type="button"
            onClick={toggleHtmlMode}
            title={showHtml ? "Quay lại trình soạn thảo" : "Chỉnh sửa HTML thô"}
            className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-semibold transition-colors ${
              showHtml ? "bg-amber-100 text-amber-800" : "text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Code2 size={13} />
            {showHtml ? "Trình soạn thảo" : "HTML"}
          </button>
        </ToolbarGroup>
      </div>

      {showHtml ? (
        <textarea
          value={htmlDraft}
          onChange={(e) => {
            setHtmlDraft(e.target.value);
            // Push raw HTML up immediately so admin can save without leaving HTML mode
            onChange(e.target.value);
          }}
          spellCheck={false}
          className="w-full resize-y border-0 px-4 py-3 font-mono text-xs text-gray-800 outline-none focus:ring-0"
          style={{ minHeight: 320 }}
          placeholder="<p>Nhập HTML thô tại đây...</p>"
        />
      ) : (
        <EditorContent editor={editor} />
      )}
    </div>
  );
}

function ToolbarGroup({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-0.5">{children}</div>;
}

function Divider() {
  return <span className="mx-1 h-5 w-px bg-gray-300" aria-hidden />;
}

function ToolbarBtn({
  children,
  onClick,
  active,
  disabled,
  label,
}: {
  children: React.ReactNode;
  onClick: (e?: React.MouseEvent) => void;
  active?: boolean;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={(e) => onClick(e)}
      disabled={disabled}
      title={label}
      aria-label={label}
      aria-pressed={active}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        active ? "bg-[#8B1A1A] text-white" : "text-gray-700 hover:bg-gray-200"
      }`}
    >
      {children}
    </button>
  );
}

export type { Editor };
