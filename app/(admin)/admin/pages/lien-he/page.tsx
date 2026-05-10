import { AdminShell } from "@/components/admin/shell";
import { PageEditorClient } from "../page-editor-client";

export const dynamic = "force-dynamic";

export default function AdminLienHePage() {
  return (
    <AdminShell>
      <PageEditorClient
        slug="lien-he"
        pageTitle="Trang Liên hệ"
        pageDescription="Quản lý nội dung trang /lien-he hiển thị trên website."
        previewHref="/lien-he"
      />
    </AdminShell>
  );
}
