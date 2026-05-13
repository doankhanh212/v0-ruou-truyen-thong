import { isAuthenticated } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getSettings } from "@/lib/settings";
import { AdminShell } from "@/components/admin/shell";
import { AppearanceClient } from "./appearance-client";

export const dynamic = "force-dynamic";
export const metadata = { title: "Giao diện – Header & Footer" };

export default async function AppearancePage() {
  if (!(await isAuthenticated())) redirect("/admin/login");
  const settings = await getSettings();
  return (
    <AdminShell>
      <AppearanceClient settings={settings} />
    </AdminShell>
  );
}
