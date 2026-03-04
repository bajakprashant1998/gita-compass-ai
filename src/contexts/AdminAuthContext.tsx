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

async function verifyAdminRole(userId: string, accessToken: string): Promise<boolean> {
    try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const apiKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

        const resp = await fetch(
            `${supabaseUrl}/rest/v1/user_roles?select=role&user_id=eq.${userId}&role=eq.admin`,
            {
                headers: {
                    'apikey': apiKey,
                    'Authorization': `Bearer ${accessToken}`,
                },
            }
        );
        const data = await resp.json();
        return Array.isArray(data) && data.length > 0;
    } catch (err) {
        console.error('AdminAuth: role verification failed', err);
        return false;
    }
}

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isReady, setIsReady] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const mountedRef = useRef(true);
    const receivedAuthEvent = useRef(false);
    const tabHiddenAt = useRef<number | null>(null);

    // On mount: use cache for instant UI if available
    useEffect(() => {
        const cache = getAdminCache();
        if (cache && cache.verified) {
            setIsAdmin(true);
            setIsReady(true);
            // Keep isLoading true until onAuthStateChange confirms
        }
    }, []);

    useEffect(() => {
        mountedRef.current = true;
        receivedAuthEvent.current = false;

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (!mountedRef.current) return;
            receivedAuthEvent.current = true;

            if (event === 'SIGNED_OUT' || !session?.user) {
                setUser(null);
                setIsAdmin(false);
                setIsReady(false);
                setIsLoading(false);
                setError(null);
                clearAdminCache();
                return;
            }

            // We have a session — verify admin role
            const cachedAdmin = getAdminCache();
            const isCached = cachedAdmin && cachedAdmin.userId === session.user.id && cachedAdmin.verified;

            if (isCached) {
                // Trust cache, update state immediately
                setUser(session.user);
                setIsAdmin(true);
                setIsReady(true);
                setIsLoading(false);
                setError(null);
            }

            // Always verify in background (even if cached)
            const verified = await verifyAdminRole(session.user.id, session.access_token);
            if (!mountedRef.current) return;

            setUser(session.user);
            setIsAdmin(verified);
            setIsReady(true);
            setIsLoading(false);

            if (verified) {
                setAdminCache(session.user.id);
                setError(null);
            } else {
                clearAdminCache();
                setError("You don't have admin privileges.");
            }
        });

        // Safety timeout: if no auth event received within 5s, stop loading
        const safetyTimer = setTimeout(() => {
            if (!mountedRef.current || receivedAuthEvent.current) return;
            console.warn('AdminAuth: No auth event received within 5s');
            const cache = getAdminCache();
            if (cache && cache.verified) {
                setIsAdmin(true);
                setIsReady(true);
            }
            setIsLoading(false);
        }, 5000);

        // Tab visibility: re-verify after long inactivity
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                tabHiddenAt.current = Date.now();
            } else if (document.visibilityState === 'visible') {
                const hiddenDuration = tabHiddenAt.current ? Date.now() - tabHiddenAt.current : 0;
                tabHiddenAt.current = null;
                if (hiddenDuration > 5 * 60 * 1000) {
                    // Force re-check by getting session (triggers onAuthStateChange)
                    supabase.auth.getSession();
                }
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            mountedRef.current = false;
            clearTimeout(safetyTimer);
            subscription.unsubscribe();
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    const retry = useCallback(() => {
        setIsLoading(true);
        setError(null);
        receivedAuthEvent.current = false;
        // Re-trigger auth state by refreshing session
        supabase.auth.getSession();
        // Safety fallback
        setTimeout(() => {
            if (mountedRef.current && !receivedAuthEvent.current) {
                setIsLoading(false);
            }
        }, 5000);
    }, []);

    const signOut = useCallback(async () => {
        setIsLoading(true);
        try {
            await supabase.auth.signOut();
        } catch (e) {
            console.error("AdminAuth: signOut error", e);
        } finally {
            clearAdminCache();
            setUser(null);
            setIsAdmin(false);
            setIsReady(false);
            setIsLoading(false);
            navigate("/admin/login");
        }
    }, [navigate]);

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
