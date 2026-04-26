import { AdminShell } from "@/components/admin/shell";
import { PagesClient } from "./pages-client";

export const dynamic = "force-dynamic";

export default function AdminPagesPage() {
  return (
    <AdminShell>
      <PagesClient />
    </AdminShell>
  );
}
