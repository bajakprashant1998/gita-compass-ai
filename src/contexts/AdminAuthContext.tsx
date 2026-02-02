import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';

interface AdminAuthContextType {
    user: User | null;
    session: Session | null;
    isAdmin: boolean;
    isLoading: boolean;
    error: string | null;
    signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    signOut: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
    const { user, session, profile, loading: authLoading, signIn: authSignIn, signOut: authSignOut } = useAuth();
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const checkAdminStatus = async () => {
            // Wait for the main auth to be ready
            if (authLoading) return;

            if (!user) {
                setIsAdmin(false);
                setIsLoading(false);
                return;
            }

            // Check if profile has role='admin'
            if (profile?.role === 'admin') {
                setIsAdmin(true);
                setError(null);
            } else {
                // Double check with DB if profile in context might be stale or incomplete
                // (though useAuth fetches profile, sometimes we want to be sure about sensitive roles)
                try {
                    const { data, error } = await supabase
                        .from('profiles')
                        .select('role')
                        .eq('user_id', user.id)
                        .single();

                    if (error) {
                        console.error('Error verifying admin status:', error);
                        setIsAdmin(false);
                        setError('Failed to verify admin privileges');
                    } else if (data?.role === 'admin') {
                        setIsAdmin(true);
                        setError(null);
                    } else {
                        setIsAdmin(false);
                        setError('You do not have administrative privileges.');
                    }
                } catch (err) {
                    console.error('Exception checking admin status:', err);
                    setIsAdmin(false);
                }
            }
            setIsLoading(false);
        };

        checkAdminStatus();
    }, [user, profile, authLoading]);

    const signIn = async (email: string, password: string) => {
        try {
            setIsLoading(true);
            await authSignIn(email, password);
            // The useEffect will trigger and verify admin status
            return { success: true };
        } catch (err: any) {
            setIsLoading(false);
            return { success: false, error: err.message || 'Failed to sign in' };
        }
    };

    const signOut = async () => {
        try {
            setIsLoading(true);
            await authSignOut();
            setIsAdmin(false);
            navigate('/admin/login');
        } catch (err: any) {
            toast.error('Failed to sign out');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AdminAuthContext.Provider
            value={{
                user,
                session,
                isAdmin,
                isLoading: isLoading || authLoading,
                error,
                signIn,
                signOut,
            }}
        >
            {children}
        </AdminAuthContext.Provider>
    );
}

export function useAdminAuthContext() {
    const context = useContext(AdminAuthContext);
    if (context === undefined) {
        throw new Error('useAdminAuthContext must be used within an AdminAuthProvider');
    }
    return context;
}
