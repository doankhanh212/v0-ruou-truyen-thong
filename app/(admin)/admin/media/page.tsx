import { AdminShell } from "@/components/admin/shell";
import { MediaClient } from "./media-client";

export const dynamic = "force-dynamic";

export default function AdminMediaPage() {
  return (
    <AdminShell>
      <MediaClient />
    </AdminShell>
  );
}
