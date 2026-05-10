"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
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
} from "lucide-react";

export interface TiptapEditorProps {
  /** Initial HTML content (sanitized server-side on save). */
  value: string;
  /** Fires on every change with serialized HTML. */
  onChange: (html: string) => void;
  /** Placeholder shown when the document is empty. */
  placeholder?: string;
  /** Min height of the editing surface (Tailwind class, default `min-h-[320px]`). */
  className?: string;
}

/**
 * Production Tiptap editor — toolbar + WYSIWYG.
 *
 * - Stores HTML; sanitised server-side via `sanitize-html`.
 * - Image upload goes through `/api/media` so it benefits from auth + size + MIME checks.
 * - Vietnamese typing supported (Tiptap uses contenteditable IME path natively).
 */
export function TiptapEditor({
  value,
  onChange,
  placeholder = "Bắt đầu viết...",
  className = "min-h-[320px]",
}: TiptapEditorProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false, // Avoid SSR hydration mismatch
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: {
          rel: "noopener noreferrer",
          target: "_blank",
          class: "text-blue-600 underline",
        },
      }),
      Image.configure({
        HTMLAttributes: { class: "rounded-lg max-w-full h-auto" },
      }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder }),
    ],
    content: value || "",
    onUpdate({ editor }) {
      const html = editor.getHTML();
      // Tiptap returns `<p></p>` for an empty doc — normalise to empty string.
      onChange(html === "<p></p>" ? "" : html);
    },
    editorProps: {
      attributes: {
        class: `prose prose-sm sm:prose-base max-w-none focus:outline-none px-4 py-3 ${className}`,
      },
    },
  });

  // Keep editor in sync if parent resets `value` (e.g. opening a different post).
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (current === value || (current === "<p></p>" && !value)) return;
    editor.commands.setContent(value || "", { emitUpdate: false });
  }, [value, editor]);

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

  if (!editor) {
    return (
      <div className="flex h-[320px] items-center justify-center rounded-lg border bg-gray-50 text-sm text-gray-400">
        Đang tải trình soạn thảo...
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-300 bg-white">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b bg-gray-50 px-2 py-1.5">
        <ToolbarGroup>
          <ToolbarBtn
            active={editor.isActive("bold")}
            onClick={() => editor.chain().focus().toggleBold().run()}
            label="Đậm (Ctrl+B)"
          >
            <Bold size={15} />
          </ToolbarBtn>
          <ToolbarBtn
            active={editor.isActive("italic")}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            label="Nghiêng (Ctrl+I)"
          >
            <Italic size={15} />
          </ToolbarBtn>
          <ToolbarBtn
            active={editor.isActive("underline")}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            label="Gạch chân (Ctrl+U)"
          >
            <UnderlineIcon size={15} />
          </ToolbarBtn>
        </ToolbarGroup>

        <Divider />

        <ToolbarGroup>
          <ToolbarBtn
            active={editor.isActive("paragraph")}
            onClick={() => editor.chain().focus().setParagraph().run()}
            label="Đoạn văn"
          >
            <Pilcrow size={15} />
          </ToolbarBtn>
          <ToolbarBtn
            active={editor.isActive("heading", { level: 1 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            label="Tiêu đề 1"
          >
            <Heading1 size={15} />
          </ToolbarBtn>
          <ToolbarBtn
            active={editor.isActive("heading", { level: 2 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            label="Tiêu đề 2"
          >
            <Heading2 size={15} />
          </ToolbarBtn>
          <ToolbarBtn
            active={editor.isActive("heading", { level: 3 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            label="Tiêu đề 3"
          >
            <Heading3 size={15} />
          </ToolbarBtn>
        </ToolbarGroup>

        <Divider />

        <ToolbarGroup>
          <ToolbarBtn
            active={editor.isActive("bulletList")}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            label="Danh sách dấu chấm"
          >
            <List size={15} />
          </ToolbarBtn>
          <ToolbarBtn
            active={editor.isActive("orderedList")}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            label="Danh sách số"
          >
            <ListOrdered size={15} />
          </ToolbarBtn>
        </ToolbarGroup>

        <Divider />

        <ToolbarGroup>
          <ToolbarBtn
            active={editor.isActive({ textAlign: "left" })}
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            label="Canh trái"
          >
            <AlignLeft size={15} />
          </ToolbarBtn>
          <ToolbarBtn
            active={editor.isActive({ textAlign: "center" })}
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            label="Canh giữa"
          >
            <AlignCenter size={15} />
          </ToolbarBtn>
          <ToolbarBtn
            active={editor.isActive({ textAlign: "right" })}
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            label="Canh phải"
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
          >
            <LinkIcon size={15} />
          </ToolbarBtn>
          <ToolbarBtn
            onClick={triggerImageUpload}
            disabled={uploading}
            label={uploading ? "Đang tải ảnh..." : "Chèn ảnh"}
          >
            <ImageIcon size={15} />
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
            disabled={!editor.can().undo()}
            label="Hoàn tác (Ctrl+Z)"
          >
            <Undo size={15} />
          </ToolbarBtn>
          <ToolbarBtn
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            label="Làm lại (Ctrl+Y)"
          >
            <Redo size={15} />
          </ToolbarBtn>
        </ToolbarGroup>
      </div>

      <EditorContent editor={editor} />
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
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      aria-pressed={active}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        active
          ? "bg-[#8B1A1A] text-white"
          : "text-gray-700 hover:bg-gray-200"
      }`}
    >
      {children}
    </button>
  );
}

// Re-export for convenience when type-importing only the editor instance.
export type { Editor };
