import { useAdminAuthContext } from "@/contexts/AdminAuthContext";
import { Navigate } from "react-router-dom";
import { Loader2, ShieldAlert } from "lucide-react";

export function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
    const { isAdmin, isLoading, user, error } = useAdminAuthContext();

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Verifying access...</p>
            </div>
        );
    }

    if (!user || !isAdmin) {
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

    return <>{children}</>;
}
