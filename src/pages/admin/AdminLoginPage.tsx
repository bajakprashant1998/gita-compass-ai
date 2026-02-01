import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Auth temporarily disabled - redirects to dashboard
export default function AdminLoginPage() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/admin', { replace: true });
  }, [navigate]);

  return null;
}
