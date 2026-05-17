import { AdminShell } from "@/components/admin/shell";
import { PageEditorClient } from "../page-editor-client";

export const dynamic = "force-dynamic";

export default function AdminChinhSachGiaoNhanHangPage() {
  return (
    <AdminShell>
      <PageEditorClient
        slug="chinh-sach-giao-nhan-hang"
        pageTitle="Chính sách giao nhận hàng"
        pageDescription="Soạn nội dung trang /chinh-sach/giao-nhan-hang. Link này được gắn trong cột Chính sách ở footer."
        previewHref="/chinh-sach/giao-nhan-hang"
      />
    </AdminShell>
  );
}
