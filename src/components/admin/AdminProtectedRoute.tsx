import { useAdminAuthContext } from "@/contexts/AdminAuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { ShieldAlert } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

function AdminLoadingSkeleton() {
    return (
        <div className="p-8 space-y-8">
            <div>
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-4 w-72" />
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="p-6 border rounded-lg bg-card">
                        <Skeleton className="h-4 w-20 mb-2" />
                        <Skeleton className="h-8 w-16" />
                    </div>
                ))}
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="p-6 border rounded-lg bg-card space-y-4">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
    const { isAdmin, isLoading, user, error, retry, signOut } = useAdminAuthContext();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoading && !user && !error) {
            navigate("/admin/login", { replace: true });
        }
    }, [isLoading, user, error, navigate]);

    if (isLoading) {
        return <AdminLoadingSkeleton />;
    }

    if (!user || !isAdmin) {
        if (error) {
            return (
                <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background px-4">
                    <ShieldAlert className="h-16 w-16 text-destructive" />
                    <h1 className="text-2xl font-bold">Access Denied</h1>
                    <p className="text-muted-foreground">{error}</p>
                    <div className="flex gap-4 items-center">
                        <Button variant="outline" onClick={retry}>Retry</Button>
                        <Button variant="destructive" onClick={signOut}>Log Out</Button>
                    </div>
                </div>
            );
        }
        // Navigating to login via useEffect above
        return <AdminLoadingSkeleton />;
    }

    return <>{children}</>;
}
