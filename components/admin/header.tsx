"use client";

import { useRouter, usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { ADMIN_MENU } from "@/lib/admin/menu";

export function AdminHeader() {
  const router = useRouter();
  const pathname = usePathname();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  // Resolve current page label for breadcrumb header.
  const currentLabel = (() => {
    for (const group of ADMIN_MENU) {
      for (const item of group.items) {
        if (pathname === item.href || pathname?.startsWith(item.href + "/")) {
          return item.label;
        }
      }
    }
    return "Admin Console";
  })();

  return (
    <header className="flex items-center justify-between border-b bg-white px-4 py-3 sm:px-6">
      {/* Left padding on mobile so the floating menu button doesn't overlap */}
      <h2 className="ml-12 text-sm font-medium text-gray-700 md:ml-0">
        {currentLabel}
      </h2>
      <button
        onClick={handleLogout}
        className="inline-flex items-center gap-2 text-sm text-gray-700 transition-colors hover:text-[#8B1A1A]"
      >
        <LogOut size={14} />
        <span className="hidden sm:inline">Đăng xuất</span>
      </button>
    </header>
  );
}
