import { useState } from "react";
import { Outlet } from "react-router-dom";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader"; // Import AdminHeader to ensure it's used
import { cn } from "@/lib/utils";
import { useAdminAuthContext } from "@/contexts/AdminAuthContext";

export default function AdminLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user } = useAdminAuthContext(); // Just to ensuring context is available if needed

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <main
        className={cn(
          "min-h-screen transition-all duration-300 ease-in-out",
          sidebarCollapsed ? "ml-16" : "ml-64"
        )}
      >
        {/* We generally expect pages to provide their own header now, but AdminLayout provides the structural container */}
        <div className="container py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
