import { useState } from "react";
import { Outlet } from "react-router-dom";
import { AdminSidebar } from "./AdminSidebar";
import { AdminNotificationsBell } from "./AdminNotificationsBell";
import { cn } from "@/lib/utils";

export default function AdminLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <AdminSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <main
        className={cn(
          "min-h-screen transition-all duration-300",
          sidebarCollapsed ? "ml-[60px]" : "ml-60"
        )}
      >
        {/* Top bar with notifications */}
        <div className="flex items-center justify-end px-6 pt-4 pb-0">
          <AdminNotificationsBell />
        </div>
        <div className="p-4 sm:p-6 lg:px-8 lg:pt-2 lg:pb-8 max-w-[1400px]">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
