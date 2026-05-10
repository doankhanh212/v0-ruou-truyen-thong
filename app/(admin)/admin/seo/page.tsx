import { isAuthenticated } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/shell";
import { SeoClient } from "./seo-client";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "SEO Pages | Admin" };
export const dynamic = "force-dynamic";

export default async function AdminSeoPage() {
  if (!(await isAuthenticated())) redirect("/admin/login");
  return (
    <AdminShell>
      <SeoClient />
    </AdminShell>
  );
}
