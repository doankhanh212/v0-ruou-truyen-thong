import { ReactNode } from "react";
import { AdminSidebar } from "./sidebar";
import { AdminHeader } from "./header";

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader />
        <main className="flex-1 overflow-x-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
