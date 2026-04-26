import { AdminShell } from "@/components/admin/shell";
import { SettingsClient } from "./settings-client";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const initial = await getSettings();
  return (
    <AdminShell>
      <SettingsClient initial={initial} />
    </AdminShell>
  );
}
