"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Menu as MenuIcon, X } from "lucide-react";
import { ADMIN_MENU, isItemActive, type MenuGroup } from "@/lib/admin/menu";
import { BrandLogo } from "@/components/brand-logo";

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  // Persist collapsed groups across navigations using localStorage.
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  useEffect(() => {
    try {
      const raw = localStorage.getItem("admin:menu:collapsed");
      if (raw) setCollapsed(JSON.parse(raw));
    } catch {
      /* noop */
    }
  }, []);

  function toggle(id: string) {
    setCollapsed((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem("admin:menu:collapsed", JSON.stringify(next));
      } catch {
        /* noop */
      }
      return next;
    });
  }

  // Auto-expand the group containing the active route (in case user collapsed it).
  const activeGroupId = useMemo(() => {
    for (const group of ADMIN_MENU) {
      if (group.items.some((i) => isItemActive(i.href, pathname))) return group.id;
    }
    return null;
  }, [pathname]);

  return (
    <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
      {ADMIN_MENU.map((group: MenuGroup) => {
        const isCollapsed =
          collapsed[group.id] !== undefined
            ? collapsed[group.id]
            : group.defaultOpen === false;
        const showOpen = !isCollapsed || group.id === activeGroupId;
        return (
          <div key={group.id}>
            <button
              type="button"
              onClick={() => toggle(group.id)}
              className="flex w-full items-center justify-between px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-400 hover:text-gray-600"
            >
              <span>{group.label}</span>
              <ChevronDown
                size={14}
                className={`transition-transform ${showOpen ? "" : "-rotate-90"}`}
              />
            </button>
            {showOpen && (
              <ul className="mt-1 space-y-0.5">
                {group.items.map(({ href, label, icon: Icon }) => {
                  const active = isItemActive(href, pathname);
                  return (
                    <li key={href}>
                      <Link
                        href={href}
                        onClick={onNavigate}
                        className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                          active
                            ? "bg-[#8B1A1A]/10 text-[#8B1A1A] font-semibold"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <Icon size={16} className="flex-shrink-0" />
                        <span className="truncate">{label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })}
    </nav>
  );
}

export function AdminSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // Auto-close drawer on route change.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Lock body scroll when drawer open.
  useEffect(() => {
    if (!mobileOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mobileOpen]);

  return (
    <>
      {/* Mobile toggle button — visible only on small screens */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        aria-label="Mở menu"
        className="fixed left-4 top-3 z-30 inline-flex h-10 w-10 items-center justify-center rounded-lg border bg-white text-gray-700 shadow-sm md:hidden"
      >
        <MenuIcon size={18} />
      </button>

      {/* Desktop sidebar */}
      <aside className="hidden min-h-screen w-60 flex-col border-r bg-white md:flex">
        <SidebarHeader />
        <SidebarNav />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-[min(288px,calc(100vw-48px))] flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <SidebarBrand />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Đóng menu"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>
            <SidebarNav onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}
    </>
  );
}

function SidebarBrand() {
  return (
    <Link href="/admin/dashboard" className="flex min-w-0 items-center gap-3">
      <BrandLogo className="h-9 w-9" sizes="36px" />
      <span className="min-w-0">
        <span className="block truncate font-semibold text-[#8B1A1A]">Rượu Truyền Thống</span>
        <span className="block text-xs text-gray-500">Admin Panel</span>
      </span>
    </Link>
  );
}

function SidebarHeader() {
  return (
    <div className="border-b px-6 py-5">
      <SidebarBrand />
    </div>
  );
}
