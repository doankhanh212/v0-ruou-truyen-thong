import { AdminShell } from "@/components/admin/shell";
import { PageEditorClient } from "../page-editor-client";

export const dynamic = "force-dynamic";

export default function AdminPhuongThucThanhToanPage() {
  return (
    <AdminShell>
      <PageEditorClient
        slug="phuong-thuc-thanh-toan"
        pageTitle="Phương thức thanh toán"
        pageDescription="Soạn nội dung trang /chinh-sach/phuong-thuc-thanh-toan. Link này được gắn trong cột Chính sách ở footer."
        previewHref="/chinh-sach/phuong-thuc-thanh-toan"
      />
    </AdminShell>
  );
}
