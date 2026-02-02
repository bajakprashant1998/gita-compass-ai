import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

interface AdminAuthState {
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AdminAuthContextValue extends AdminAuthState {
  signIn: (email: string, password: string) => Promise<{ success: boolean; error: string | null }>;
  signOut: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextValue | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AdminAuthState>({
    user: null,
    isAdmin: false,
    isLoading: true,
    error: null,
  });

  const checkAdminRole = useCallback(async (userId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('has_role', {
        _user_id: userId,
        _role: 'admin',
      });

      if (error) {
        console.error('Error checking admin role:', error);
        return false;
      }

      return data === true;
    } catch (err) {
      console.error('Exception checking admin role:', err);
      return false;
    }
  }, []);

  // Handle visibility change - refresh session when tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session?.user) {
            const isAdmin = await checkAdminRole(session.user.id);
            setState({
              user: session.user,
              isAdmin,
              isLoading: false,
              error: null,
            });
          } else {
            setState({
              user: null,
              isAdmin: false,
              isLoading: false,
              error: null,
            });
          }
        } catch (error) {
          console.error('Visibility change auth check failed:', error);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [checkAdminRole]);

  // Main auth initialization and subscription
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted) return;

        if (session?.user) {
          const isAdmin = await checkAdminRole(session.user.id);
          if (mounted) {
            setState({
              user: session.user,
              isAdmin,
              isLoading: false,
              error: null,
            });
          }
        } else {
          if (mounted) {
            setState({ user: null, isAdmin: false, isLoading: false, error: null });
          }
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        if (mounted) {
          setState({ user: null, isAdmin: false, isLoading: false, error: 'Init failed' });
        }
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        if (event === 'SIGNED_OUT') {
          setState({ user: null, isAdmin: false, isLoading: false, error: null });
          return;
        }

        if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user) {
          const isAdmin = await checkAdminRole(session.user.id);
          if (mounted) {
            setState({ user: session.user, isAdmin, isLoading: false, error: null });
          }
        }
      }
    );

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [checkAdminRole]);

  const signIn = async (email: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setState(prev => ({ ...prev, isLoading: false, error: error.message }));
        return { success: false, error: error.message };
      }

      if (!data.user) {
        setState(prev => ({ ...prev, isLoading: false, error: 'Sign in failed' }));
        return { success: false, error: 'Sign in failed' };
      }

      const isAdmin = await checkAdminRole(data.user.id);

      if (!isAdmin) {
        await supabase.auth.signOut();
        setState({
          user: null,
          isAdmin: false,
          isLoading: false,
          error: 'You do not have admin access',
        });
        return { success: false, error: 'You do not have admin access' };
      }

      setState({
        user: data.user,
        isAdmin: true,
        isLoading: false,
        error: null,
      });

      return { success: true, error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign in failed';
      setState(prev => ({ ...prev, isLoading: false, error: message }));
      return { success: false, error: message };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setState({ user: null, isAdmin: false, isLoading: false, error: null });
  };

  return (
    <AdminAuthContext.Provider value={{ ...state, signIn, signOut }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuthContext() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuthContext must be used within AdminAuthProvider');
  }
  return context;
}
