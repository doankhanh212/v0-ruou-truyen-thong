import { AdminShell } from "@/components/admin/shell";
import { RulesClient } from "./rules-client";

export const dynamic = "force-dynamic";

export default function AdminRulesPage() {
  return (
    <AdminShell>
      <RulesClient />
    </AdminShell>
  );
}
