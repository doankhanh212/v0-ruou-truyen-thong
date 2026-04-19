"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function AdminHeader() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <header className="bg-white border-b px-6 py-3 flex items-center justify-between">
      <h2 className="text-sm text-gray-600">Admin Console</h2>
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 text-sm text-gray-700 hover:text-[#8B1A1A]"
      >
        <LogOut size={14} />
        Đăng xuất
      </button>
    </header>
  );
}
