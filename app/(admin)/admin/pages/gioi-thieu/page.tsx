import { AdminShell } from "@/components/admin/shell";
import { PageEditorClient } from "../page-editor-client";

export const dynamic = "force-dynamic";

export default function AdminGioiThieuPage() {
  return (
    <AdminShell>
      <PageEditorClient
        slug="gioi-thieu"
        pageTitle="Trang Giới thiệu"
        pageDescription="Quản lý nội dung trang /gioi-thieu hiển thị trên website."
        previewHref="/gioi-thieu"
      />
    </AdminShell>
  );
}
