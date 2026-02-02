import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { getAdminCache, setAdminCache, clearAdminCache } from "@/lib/adminAuth";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface AdminAuthContextType {
    user: User | null;
    isAdmin: boolean;
    isLoading: boolean;
    isReady: boolean;
    error: string | null;
    signOut: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isReady, setIsReady] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    // Check admin role using secure RPC function or table query
    const checkAdminRole = async (userId: string) => {
        try {
            // First check cache
            const cache = getAdminCache();
            if (cache && cache.userId === userId && cache.verified) {
                console.log('AdminAuthContext: Cache hit');
                return true;
            }

            // Query database
            const { data, error } = await supabase
                .from("user_roles")
                .select("role")
                .eq("user_id", userId)
                .eq("role", "admin")
                .maybeSingle();

            if (error) throw error;

            const verified = !!data;

            if (verified) {
                setAdminCache(userId);
            } else {
                clearAdminCache();
            }

            return verified;
        } catch (err) {
            console.error('AdminAuthContext: Role verification error', err);
            // If network error but we have cache, might be worth handling?
            // For now, fail safe
            return false;
        }
    };

    useEffect(() => {
        let mounted = true;

        // Initial session check
        const initAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();

                if (!mounted) return;

                if (session?.user) {
                    // Force refresh session and GET the new session data
                    // This fixes issues where stale tokens cause DB queries to hang
                    const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
                    if (refreshError) console.warn('AdminAuthContext: Session refresh warning', refreshError);

                    // Use the refreshed session if available, fallback to original
                    const activeSession = refreshData?.session || session;
                    
                    // Small delay to ensure token propagation to Supabase client
                    await new Promise(resolve => setTimeout(resolve, 100));

                    const verified = await checkAdminRole(activeSession.user.id);
                    if (mounted) {
                        setUser(activeSession.user);
                        setIsAdmin(verified);
                        setIsReady(true);
                        if (!verified) setError("You don't have admin privileges.");
                    }
                } else {
                    if (mounted) {
                        setUser(null);
                        setIsAdmin(false);
                    }
                }
            } catch (err: any) {
                console.error("AdminAuthContext: Init error", err);
                if (mounted) setError(err.message);
            } finally {
                if (mounted) setIsLoading(false);
            }
        };

        initAuth();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (!mounted) return;

            if (session?.user) {
                // Only re-verify if user changed or we weren't admin
                if (session.user.id !== user?.id) {
                    setIsLoading(true);
                    const verified = await checkAdminRole(session.user.id);
                    if (mounted) {
                        setUser(session.user);
                        setIsAdmin(verified);
                        setIsLoading(false);
                    }
                }
            } else {
                setUser(null);
                setIsAdmin(false);
                setIsLoading(false);
                clearAdminCache();
            }
        });

        // Visibility change handler for tab switching to ensure auth is fresh
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && !user) {
                supabase.auth.getSession().then(({ data: { session } }) => {
                    if (session?.user && session.user.id !== user?.id) {
                        // Trigger re-verification via the existing logic or just reload
                        // Simpler to just let the user refresh if stuck, but let's try to update
                        initAuth();
                    }
                });
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            mounted = false;
            subscription.unsubscribe();
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    const signOut = async () => {
        setIsLoading(true);
        try {
            // Attempt sign out but don't wait forever
            const { error } = await Promise.race([
                supabase.auth.signOut(),
                new Promise<{ error: null }>((resolve) => setTimeout(() => resolve({ error: null }), 2000))
            ]);
            if (error) console.error("AdminAuthContext: SignOut error", error);
        } catch (e) {
            console.error("AdminAuthContext: SignOut exception", e);
        } finally {
            // Always clear local state
            clearAdminCache();

            // Force clear Supabase tokens from localStorage to prevent stale sessions
            // Supabase default keys start with 'sb-'
            Object.keys(localStorage).forEach((key) => {
                if (key.startsWith('sb-')) {
                    localStorage.removeItem(key);
                }
            });

            setUser(null);
            setIsAdmin(false);
            setIsLoading(false);
            navigate("/admin/login");
        }
    };

    return (
        <AdminAuthContext.Provider value={{ user, isAdmin, isLoading, isReady, error, signOut }}>
            {children}
        </AdminAuthContext.Provider>
    );
}

export const useAdminAuthContext = () => {
    const context = useContext(AdminAuthContext);
    if (context === undefined) {
        throw new Error("useAdminAuthContext must be used within an AdminAuthProvider");
    }
    return context;
};
