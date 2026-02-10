import { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";
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
    retry: () => void;
    signOut: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

const SESSION_TIMEOUT = 8000;
const ROLE_CHECK_TIMEOUT = 10000;
const TAB_HIDDEN_THRESHOLD = 5 * 60 * 1000; // 5 minutes

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isReady, setIsReady] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const tabHiddenAt = useRef<number | null>(null);
    const mountedRef = useRef(true);

    const checkAdminRole = async (userId: string): Promise<boolean> => {
        try {
            const cache = getAdminCache();
            if (cache && cache.userId === userId && cache.verified) {
                console.log('AdminAuthContext: Cache hit');
                return true;
            }

            const { data, error } = await Promise.race([
                supabase
                    .from("user_roles")
                    .select("role")
                    .eq("user_id", userId)
                    .eq("role", "admin")
                    .maybeSingle(),
                new Promise<{ data: null, error: any }>((resolve) =>
                    setTimeout(() => resolve({ data: null, error: new Error('Verification timed out') }), ROLE_CHECK_TIMEOUT)
                )
            ]);

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
            // If we have a valid cache, trust it on network failure
            const cache = getAdminCache();
            if (cache && cache.userId === userId && cache.verified) {
                return true;
            }
            return false;
        }
    };

    const initAuth = useCallback(async (useCache = true) => {
        try {
            console.log('AdminAuthContext: Starting initAuth');
            setError(null);

            // Cache-first: if we have a valid admin cache, set isReady immediately
            const cache = getAdminCache();
            if (useCache && cache?.verified) {
                const { data: { session } } = await Promise.race([
                    supabase.auth.getSession(),
                    new Promise<{ data: { session: null } }>((resolve) =>
                        setTimeout(() => resolve({ data: { session: null } }), SESSION_TIMEOUT)
                    )
                ]) as any;

                if (session?.user && cache.userId === session.user.id) {
                    console.log('AdminAuthContext: Cache-first fast path');
                    if (mountedRef.current) {
                        setUser(session.user);
                        setIsAdmin(true);
                        setIsReady(true);
                        setIsLoading(false);
                    }
                    // Background verify
                    checkAdminRole(session.user.id).then(verified => {
                        if (mountedRef.current && !verified) {
                            setIsAdmin(false);
                            setError("Admin privileges revoked.");
                            clearAdminCache();
                        }
                    });
                    return;
                }
            }

            // Full flow
            const { data: { session }, error: sessionError } = await Promise.race([
                supabase.auth.getSession(),
                new Promise<{ data: { session: null }, error: any }>((resolve) =>
                    setTimeout(() => resolve({ data: { session: null }, error: new Error('GetSession timed out') }), SESSION_TIMEOUT)
                )
            ]) as any;

            if (sessionError) {
                console.error("AdminAuthContext: getSession error", sessionError);
            }

            if (!mountedRef.current) return;

            if (session?.user) {
                const { data: refreshData, error: refreshError } = await Promise.race([
                    supabase.auth.refreshSession(),
                    new Promise<{ data: { session: null, user: null }, error: any }>((resolve) =>
                        setTimeout(() => resolve({ data: { session: null, user: null }, error: new Error('Refresh timed out') }), SESSION_TIMEOUT)
                    )
                ]);

                if (refreshError) {
                    console.warn('AdminAuthContext: Session refresh failed', refreshError);
                    // Retry once instead of force logout
                    try {
                        const retryResult = await Promise.race([
                            supabase.auth.refreshSession(),
                            new Promise<{ data: { session: null, user: null }, error: any }>((resolve) =>
                                setTimeout(() => resolve({ data: { session: null, user: null }, error: new Error('Retry refresh timed out') }), SESSION_TIMEOUT)
                            )
                        ]);
                        if (retryResult.error || !retryResult.data?.session) {
                            if (mountedRef.current) {
                                setError('Session expired. Please log in again.');
                                setUser(null);
                                setIsAdmin(false);
                                setIsLoading(false);
                                clearAdminCache();
                            }
                            return;
                        }
                        // Use retry result
                        const activeSession = retryResult.data.session;
                        await new Promise(resolve => setTimeout(resolve, 100));
                        const verified = await checkAdminRole(activeSession.user.id);
                        if (mountedRef.current) {
                            setUser(activeSession.user);
                            setIsAdmin(verified);
                            setIsReady(true);
                            if (!verified) setError("You don't have admin privileges.");
                        }
                        return;
                    } catch {
                        if (mountedRef.current) {
                            setError('Session expired. Please log in again.');
                            setUser(null);
                            setIsAdmin(false);
                            setIsLoading(false);
                            clearAdminCache();
                        }
                        return;
                    }
                }

                const activeSession = refreshData?.session;
                if (!activeSession) {
                    if (mountedRef.current) {
                        setError('Session expired. Please log in again.');
                        clearAdminCache();
                        setUser(null);
                        setIsAdmin(false);
                        setIsLoading(false);
                    }
                    return;
                }

                await new Promise(resolve => setTimeout(resolve, 100));
                const verified = await checkAdminRole(activeSession.user.id);
                if (mountedRef.current) {
                    setUser(activeSession.user);
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
    }, []);

    const retry = useCallback(() => {
        setIsLoading(true);
        setError(null);
        initAuth(false);
    }, [initAuth]);

    useEffect(() => {
        mountedRef.current = true;
        initAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (!mountedRef.current) return;

            if (session?.user) {
                if (session.user.id !== user?.id) {
                    setIsLoading(true);
                    const verified = await checkAdminRole(session.user.id);
                    if (mountedRef.current) {
                        setUser(session.user);
                        setIsAdmin(verified);
                        setIsReady(true);
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

        // Smart visibility handler: only re-init after 5+ minutes hidden
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                tabHiddenAt.current = Date.now();
            } else if (document.visibilityState === 'visible') {
                const hiddenDuration = tabHiddenAt.current ? Date.now() - tabHiddenAt.current : 0;
                tabHiddenAt.current = null;
                if (hiddenDuration > TAB_HIDDEN_THRESHOLD) {
                    console.log('AdminAuthContext: Tab was hidden >5min, re-verifying');
                    initAuth(true);
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            mountedRef.current = false;
            subscription.unsubscribe();
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    const signOut = async () => {
        setIsLoading(true);
        try {
            const { error } = await Promise.race([
                supabase.auth.signOut(),
                new Promise<{ error: null }>((resolve) => setTimeout(() => resolve({ error: null }), 3000))
            ]);
            if (error) console.error("AdminAuthContext: SignOut error", error);
        } catch (e) {
            console.error("AdminAuthContext: SignOut exception", e);
        } finally {
            clearAdminCache();
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith('sb-') && key.endsWith('-auth-token')) {
                    localStorage.removeItem(key);
                }
            });
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
