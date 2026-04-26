"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, Bot, Activity, Settings, ImageIcon, FileText, FolderTree, Newspaper, Megaphone, LayoutTemplate, BarChart2 } from "lucide-react";

const NAV = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/categories", label: "Danh mục", icon: FolderTree },
  { href: "/admin/products", label: "Sản phẩm", icon: Package },
  { href: "/admin/posts", label: "Tin tức", icon: Newspaper },
  { href: "/admin/pages", label: "Trang CMS", icon: FileText },
  { href: "/admin/sections", label: "Nội dung Section", icon: LayoutTemplate },
  { href: "/admin/banner", label: "Banner", icon: Megaphone },
  { href: "/admin/rules", label: "Chatbot Rules", icon: Bot },
  { href: "/admin/media", label: "Media", icon: ImageIcon },
  { href: "/admin/settings", label: "Cài đặt", icon: Settings },
  { href: "/admin/tracking", label: "Tracking", icon: Activity },
  { href: "/admin/analytics", label: "Phân tích", icon: BarChart2 },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:w-60 md:flex-col border-r bg-white min-h-screen">
      <div className="px-6 py-5 border-b">
        <Link href="/admin/dashboard" className="font-semibold text-[#8B1A1A]">
          Rượu Cửu Long
        </Link>
        <p className="text-xs text-gray-500 mt-1">Admin panel</p>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded text-sm ${
                active ? "bg-[#8B1A1A]/10 text-[#8B1A1A] font-medium" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
