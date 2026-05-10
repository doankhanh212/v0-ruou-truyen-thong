import {
  LayoutDashboard,
  BarChart2,
  Package,
  FolderTree,
  Newspaper,
  LayoutTemplate,
  Megaphone,
  Image as ImageIcon,
  Search,
  Bot,
  Settings,
  Activity,
  type LucideIcon,
} from "lucide-react";

/**
 * Single source of truth for the admin sidebar.
 * Add a new entry here → it shows up everywhere (sidebar, mobile drawer, breadcrumbs).
 */

export type MenuItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Match `pathname.startsWith(href)` (vs strict equality). Default: true. */
  matchPrefix?: boolean;
};

export type MenuGroup = {
  id: string;
  label: string;
  items: MenuItem[];
  /** Default open state. Defaults to true. */
  defaultOpen?: boolean;
};

export const ADMIN_MENU: MenuGroup[] = [
  {
    id: "overview",
    label: "Tổng quan",
    items: [
      { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/analytics", label: "Phân tích", icon: BarChart2 },
    ],
  },
  {
    id: "content",
    label: "Quản lý nội dung",
    items: [
      { href: "/admin/products", label: "Sản phẩm", icon: Package },
      { href: "/admin/categories", label: "Danh mục", icon: FolderTree },
      { href: "/admin/posts", label: "Tin tức / Blog", icon: Newspaper },
      { href: "/admin/sections", label: "Nội dung Section", icon: LayoutTemplate },
      { href: "/admin/banner", label: "Banner", icon: Megaphone },
      { href: "/admin/media", label: "Thư viện ảnh", icon: ImageIcon },
      { href: "/admin/seo", label: "SEO Pages", icon: Search },
    ],
  },
  {
    id: "automation",
    label: "Tự động hoá",
    items: [{ href: "/admin/rules", label: "Chatbot Rules", icon: Bot }],
  },
  {
    id: "system",
    label: "Hệ thống",
    items: [
      { href: "/admin/settings", label: "Cài đặt", icon: Settings },
      { href: "/admin/tracking", label: "Tracking logs", icon: Activity },
    ],
  },
];

export function isItemActive(itemHref: string, pathname: string | null): boolean {
  if (!pathname) return false;
  if (pathname === itemHref) return true;
  return pathname.startsWith(itemHref + "/");
}
