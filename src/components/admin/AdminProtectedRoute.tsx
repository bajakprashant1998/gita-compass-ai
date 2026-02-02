interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

// Auth bypassed for development - simply render children
export function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  return <>{children}</>;
}
