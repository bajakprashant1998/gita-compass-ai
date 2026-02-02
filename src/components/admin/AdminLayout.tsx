
import { useState, useEffect, useRef } from "react";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Loader2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
// We reuse the helpers we created
import {
  getAdminCache,
  setAdminCache,
  clearAdminCache,
} from "@/lib/adminAuth";
import { AdminSidebar } from "./AdminSidebar";
import { cn } from "@/lib/utils";

export default function AdminLayout() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Track verification to prevent duplicate checks
  const adminVerifiedRef = useRef(false);

  useEffect(() => {
    let mounted = true;

    const checkAdminRole = async (userId: string, background: boolean = false) => {
      if (!background) setLoading(true);
      setError(null);

      // Timeout promise
      const timeoutPromise = new Promise<{ timeout: true }>((resolve) => {
        setTimeout(() => resolve({ timeout: true }), 9000);
      });

      // Query promise
      const queryPromise = supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle();

      try {
        console.log('AdminLayout: Verifying role for', userId);
        const result = await Promise.race([queryPromise, timeoutPromise]) as any;

        if (!mounted) return;

        if (result.timeout) {
          console.warn('AdminLayout: Verification timed out');
          throw new Error("Connection timed out");
        }

        const { data, error } = result;

        if (error) throw error;

        if (data) {
          console.log('AdminLayout: Verified admin');
          setIsAdmin(true);
          adminVerifiedRef.current = true;
          setAdminCache(userId);
        } else {
          console.warn('AdminLayout: No admin role found');
          setIsAdmin(false);
          adminVerifiedRef.current = false;
          clearAdminCache();
          setError("You don't have admin privileges.");
          if (!background) {
            toast.error("Access Denied");
            navigate("/admin/login");
          }
        }
      } catch (err: any) {
        console.error('AdminLayout: Verification error', err);

        // Important: If background check fails (e.g. network), keep session if previously verified
        if (background && adminVerifiedRef.current) {
          console.log('AdminLayout: keeping session despite background error');
          return;
        }

        setIsAdmin(false);
        clearAdminCache();
        setError(err.message === "Connection timed out" ? "Verification timed out. Please refresh." : "Access Denied");
      } finally {
        if (mounted && !background) setLoading(false);
      }
    };

    const init = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();

      if (!mounted) return;

      if (!session?.user) {
        console.log('AdminLayout: No session');
        setIsAdmin(false);
        setLoading(false);
        navigate("/admin/login");
        return;
      }

      // OPTIMISTIC CACHE CHECK
      const cache = getAdminCache();
      if (cache && cache.userId === session.user.id && cache.verified) {
        console.log('AdminLayout: Cache hit');
        setIsAdmin(true);
        adminVerifiedRef.current = true;
        setLoading(false);
        // Verify in background
        checkAdminRole(session.user.id, true);
        return;
      }

      await checkAdminRole(session.user.id);
    };

    init();

    return () => { mounted = false; };
  }, [navigate]);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // ... (keep auth effects) ...

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Verifying access...</p>
      </div>
    );
  }

  if (!isAdmin) {
    if (error) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background px-4">
          <ShieldAlert className="h-16 w-16 text-destructive" />
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="text-muted-foreground">{error}</p>
          <div className="flex gap-4">
            <button onClick={() => window.location.reload()} className="text-primary hover:underline">Retry</button>
            <a href="/admin/login" className="text-primary hover:underline">Sign in with different account</a>
          </div>
        </div>
      );
    }
    return <Navigate to="/admin/login" replace />;
  }

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
        <div className="container py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
