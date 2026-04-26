import { AdminShell } from "@/components/admin/shell";
import { CategoriesClient } from "./categories-client";

export const dynamic = "force-dynamic";

export default function AdminCategoriesPage() {
  return (
    <AdminShell>
      <CategoriesClient />
    </AdminShell>
  );
}
