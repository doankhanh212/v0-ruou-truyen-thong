import { isAuthenticated } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AnalyticsClient } from "./analytics-client";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Báo cáo kinh doanh | Admin" };

export default async function AnalyticsPage() {
  if (!(await isAuthenticated())) redirect("/admin/login");
  return <AnalyticsClient />;
}
