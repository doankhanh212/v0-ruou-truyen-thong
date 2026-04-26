import { AdminShell } from "@/components/admin/shell";
import { SectionsClient } from "./sections-client";
import { getSections, SECTION_KEYS } from "@/lib/sections";

export const dynamic = "force-dynamic";

export default async function AdminSectionsPage() {
  const values = await getSections();
  return (
    <AdminShell>
      <SectionsClient
        keys={SECTION_KEYS as unknown as string[]}
        initialValues={values}
      />
    </AdminShell>
  );
}
