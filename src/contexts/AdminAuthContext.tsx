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

    const checkAdminRole = useCallback(async (userId: string): Promise<boolean> => {
        try {
            const cache = getAdminCache();
            if (cache && cache.userId === userId && cache.verified) {
                return true;
            }

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

            const { data: { session }, error: sessionError } = await supabase.auth.getSession();

            if (sessionError) {
                console.error("AdminAuthContext: getSession error", sessionError);
            }

            if (!mountedRef.current) return;

            if (session?.user) {
                const verified = await checkAdminRole(session.user.id);
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
                    clearAdminCache();
                }
            }
        } catch (err: any) {
            console.error("AdminAuthContext: Init error", err);
            if (mountedRef.current) setError(err.message);
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
                const verified = await checkAdminRole(session.user.id);
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
