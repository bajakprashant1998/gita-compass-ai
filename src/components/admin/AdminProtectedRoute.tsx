interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

// Auth temporarily disabled - renders children directly
// To re-enable: restore useAdminAuth hook and navigation logic
export function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  return <>{children}</>;
}
