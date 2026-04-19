import { AdminShell } from "@/components/admin/shell";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [productCount, ruleCount, trackingCount, zaloClicks] = await Promise.all([
    db.product.count().catch(() => 0),
    db.chatbotRule.count().catch(() => 0),
    db.trackingLog.count().catch(() => 0),
    db.trackingLog.count({ where: { event: "click_zalo" } }).catch(() => 0),
  ]);

  const cards = [
    { label: "Sản phẩm", value: productCount },
    { label: "Chatbot rules", value: ruleCount },
    { label: "Tracking logs", value: trackingCount },
    { label: "Click Zalo", value: zaloClicks },
  ];

  return (
    <AdminShell>
      <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-white border rounded p-5">
            <div className="text-xs text-gray-500 uppercase">{c.label}</div>
            <div className="text-2xl font-semibold mt-2">{c.value}</div>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
