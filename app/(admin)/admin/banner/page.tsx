import { AdminShell } from "@/components/admin/shell";
import { BannerClient } from "./banner-client";

export const dynamic = "force-dynamic";

export default function AdminBannerPage() {
  return (
    <AdminShell>
      <BannerClient />
    </AdminShell>
  );
}
