import { AdminShell } from "@/components/admin/shell";
import { db } from "@/lib/db";
import { DashboardChart } from "./dashboard-chart";
import { DashboardStats, type DashboardCard } from "./dashboard-stats";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [productCount, ruleCount, categoryCount, postCount, trackingCount, zaloClicks] =
    await Promise.all([
      db.product.count().catch(() => 0),
      db.chatbotRule.count().catch(() => 0),
      db.category.count().catch(() => 0),
      db.post.count().catch(() => 0),
      db.trackingLog.count().catch(() => 0),
      db.trackingLog.count({ where: { event: "click_zalo" } }).catch(() => 0),
    ]);

  const cards: DashboardCard[] = [
    { label: "Sản phẩm", value: productCount },
    { label: "Danh mục", value: categoryCount },
    { label: "Bài viết", value: postCount },
    { label: "Chatbot rules", value: ruleCount },
    { label: "Tracking logs", value: trackingCount },
    { label: "Click Zalo", value: zaloClicks },
  ];

  return (
    <AdminShell>
      <h1 className="mb-6 text-2xl font-semibold">Dashboard</h1>
      <DashboardStats initialCards={cards} />
      <DashboardChart />
    </AdminShell>
  );
}
