import { AdminShell } from "@/components/admin/shell";
import { PageEditorClient } from "../page-editor-client";

export const dynamic = "force-dynamic";

export default function AdminChinhSachDoiTraHangPage() {
  return (
    <AdminShell>
      <PageEditorClient
        slug="chinh-sach-doi-tra-hang"
        pageTitle="Chính sách đổi trả hàng"
        pageDescription="Soạn nội dung trang /chinh-sach/doi-tra-hang. Link này được gắn trong cột Chính sách ở footer."
        previewHref="/chinh-sach/doi-tra-hang"
      />
    </AdminShell>
  );
}
