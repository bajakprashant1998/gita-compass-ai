import { useEffect, useState } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { useInstallPrompt } from '@/hooks/useInstallPrompt';

const MOBILE_REGEX = /Android|iPhone|iPad|iPod|webOS|BlackBerry|Opera Mini|IEMobile/i;

/**
 * On mobile devices, redirects users to /install unless the app
 * is running in standalone (installed) mode.
 * Allows /admin routes through so admins can still manage content.
 */
export function MobileInstallGate({ children }: { children: React.ReactNode }) {
  const { isInstalled } = useInstallPrompt();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setIsMobile(MOBILE_REGEX.test(navigator.userAgent));
    setChecked(true);
  }, []);

  if (!checked) return null;

  // Allow desktop users, installed PWA users, admin routes, and the install page itself
  const isExemptRoute = location.pathname === '/install' || location.pathname.startsWith('/admin');
  const isSkipped = typeof window !== 'undefined' && sessionStorage.getItem('install-skipped') === '1';

  if (isMobile && !isInstalled && !isExemptRoute && !isSkipped) {
    return <Navigate to="/install" replace />;
  }

  return <>{children}</>;
}
