import { AdminShell } from "@/components/admin/shell";
import { PageEditorClient } from "../page-editor-client";

export const dynamic = "force-dynamic";

export default function AdminChinhSachBaoMatPage() {
  return (
    <AdminShell>
      <PageEditorClient
        slug="chinh-sach-bao-mat"
        pageTitle="Chính sách bảo mật"
        pageDescription="Soạn nội dung trang /chinh-sach/bao-mat. Link này được gắn trong cột Chính sách ở footer."
        previewHref="/chinh-sach/bao-mat"
      />
    </AdminShell>
  );
}
