import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Loader2 } from 'lucide-react';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

export function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const { user, isAdmin, isLoading, error } = useAdminAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Only redirect after loading is complete
    if (!isLoading) {
      if (!user) {
        // Not logged in - redirect to login
        navigate('/admin/login', { replace: true });
      } else if (!isAdmin) {
        // Logged in but not admin - redirect to home
        navigate('/', { replace: true });
      }
    }
  }, [user, isAdmin, isLoading, navigate]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // Show error state if there's an error
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="text-center max-w-md p-6 rounded-xl border border-destructive/20 bg-destructive/5">
          <p className="text-destructive mb-4">{error}</p>
          <button 
            onClick={() => navigate('/admin/login', { replace: true })}
            className="text-primary hover:underline"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // If not authenticated or not admin, show nothing (redirect will happen)
  if (!user || !isAdmin) {
    return null;
  }

  // Authenticated admin - render children
  return <>{children}</>;
}
