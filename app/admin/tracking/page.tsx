import { AdminShell } from "@/components/admin/shell";
import { TrackingClient } from "./tracking-client";

export const dynamic = "force-dynamic";

export default function AdminTrackingPage() {
  return (
    <AdminShell>
      <TrackingClient />
    </AdminShell>
  );
}
