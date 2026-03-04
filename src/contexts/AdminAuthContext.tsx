import { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { getAdminCache, setAdminCache, clearAdminCache } from "@/lib/adminAuth";
import { useNavigate } from "react-router-dom";

interface AdminAuthContextType {
    user: User | null;
    isAdmin: boolean;
    isLoading: boolean;
    isReady: boolean;
    error: string | null;
    retry: () => void;
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
    const mountedRef = useRef(true);
    const tabHiddenAt = useRef<number | null>(null);

    const checkAdminRole = useCallback(async (userId: string, accessToken?: string): Promise<boolean> => {
        try {
            const cache = getAdminCache();
            if (cache && cache.userId === userId && cache.verified) {
                return true;
            }

            // Use direct fetch to avoid supabase client session race conditions
            const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
            const apiKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
            
            // Get token from param or current session
            let token = accessToken;
            if (!token) {
                const { data: { session } } = await supabase.auth.getSession();
                token = session?.access_token;
            }
            if (!token) return false;

            const resp = await fetch(
                `${supabaseUrl}/rest/v1/user_roles?select=role&user_id=eq.${userId}&role=eq.admin`,
                {
                    headers: {
                        'apikey': apiKey,
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );
            const data = await resp.json();

            const verified = Array.isArray(data) && data.length > 0;
            if (verified) {
                setAdminCache(userId);
            } else {
                clearAdminCache();
            }
            return verified;
        } catch (err) {
            console.error('AdminAuthContext: Role check error', err);
            const cache = getAdminCache();
            if (cache && cache.userId === userId && cache.verified) {
                return true;
            }
            return false;
        }
    }, []);

    const initAuth = useCallback(async () => {
        try {
            setError(null);

            // Add timeout to prevent hanging
            const sessionPromise = supabase.auth.getSession();
            const timeoutPromise = new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error('Session check timed out')), 8000)
            );

            let session;
            try {
                const result = await Promise.race([sessionPromise, timeoutPromise]);
                session = result.data?.session;
                if (result.error) {
                    console.warn("AdminAuthContext: getSession error", result.error);
                }
            } catch (timeoutErr) {
                console.warn("AdminAuthContext: getSession timed out, checking cache");
                // Try cache fallback
                const cache = getAdminCache();
                if (cache && cache.verified) {
                    if (mountedRef.current) {
                        setIsAdmin(true);
                        setIsReady(true);
                        setIsLoading(false);
                    }
                    return;
                }
                if (mountedRef.current) {
                    setUser(null);
                    setIsAdmin(false);
                    setIsReady(false);
                    setIsLoading(false);
                }
                return;
            }

            if (!mountedRef.current) return;

            if (session?.user) {
                const verified = await checkAdminRole(session.user.id, session.access_token);
                if (mountedRef.current) {
                    setUser(session.user);
                    setIsAdmin(verified);
                    setIsReady(true);
                    if (!verified) setError("You don't have admin privileges.");
                }
            } else {
                if (mountedRef.current) {
                    setUser(null);
                    setIsAdmin(false);
                    setIsReady(false);
                    clearAdminCache();
                }
            }
        } catch (err: any) {
            console.error("AdminAuthContext: Init error", err);
            if (mountedRef.current) {
                setError(null);
                setUser(null);
                setIsAdmin(false);
                setIsReady(false);
                clearAdminCache();
            }
        } finally {
            if (mountedRef.current) setIsLoading(false);
        }
    }, [checkAdminRole]);

    const retry = useCallback(() => {
        setIsLoading(true);
        setError(null);
        initAuth();
    }, [initAuth]);

    useEffect(() => {
        mountedRef.current = true;
        initAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (!mountedRef.current) return;

            if (event === 'SIGNED_OUT') {
                setUser(null);
                setIsAdmin(false);
                setIsLoading(false);
                setIsReady(false);
                clearAdminCache();
                return;
            }

            if (session?.user) {
                const verified = await checkAdminRole(session.user.id, session.access_token);
                if (mountedRef.current) {
                    setUser(session.user);
                    setIsAdmin(verified);
                    setIsReady(true);
                    setIsLoading(false);
                }
            }
        });

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                tabHiddenAt.current = Date.now();
            } else if (document.visibilityState === 'visible') {
                const hiddenDuration = tabHiddenAt.current ? Date.now() - tabHiddenAt.current : 0;
                tabHiddenAt.current = null;
                if (hiddenDuration > 5 * 60 * 1000) {
                    initAuth();
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            mountedRef.current = false;
            subscription.unsubscribe();
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [initAuth, checkAdminRole]);

    const signOut = async () => {
        setIsLoading(true);
        try {
            await supabase.auth.signOut();
        } catch (e) {
            console.error("AdminAuthContext: SignOut exception", e);
        } finally {
            clearAdminCache();
            setUser(null);
            setIsAdmin(false);
            setIsReady(false);
            setIsLoading(false);
            navigate("/admin/login");
        }
    };

    return (
        <AdminAuthContext.Provider value={{ user, isAdmin, isLoading, isReady, error, retry, signOut }}>
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
