import { Navigate } from 'react-router-dom';
import { useAdminAuthContext } from '@/contexts/AdminAuthContext';
import { Loader2, ShieldAlert } from 'lucide-react';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

export function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const { user, isAdmin, isLoading, error } = useAdminAuthContext();

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Verifying access...</p>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  // Authenticated but not admin - show error
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background px-4">
        <div className="flex flex-col items-center gap-4 text-center max-w-md">
          <ShieldAlert className="h-16 w-16 text-destructive" />
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="text-muted-foreground">
            {error || 'You do not have permission to access the admin panel.'}
          </p>
          <a
            href="/admin/login"
            className="text-primary hover:underline mt-4"
          >
            Sign in with a different account
          </a>
        </div>
      </div>
    );
  }

  // Authorized - render children
  return <>{children}</>;
}
