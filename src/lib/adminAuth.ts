
// SessionStorage keys for admin caching
export const ADMIN_CACHE_KEY = "admin_verified";
export const ADMIN_USER_KEY = "admin_user_id";

// Helper functions for cache management
export const getAdminCache = (): { userId: string; verified: boolean } | null => {
    try {
        const userId = sessionStorage.getItem(ADMIN_USER_KEY);
        const verified = sessionStorage.getItem(ADMIN_CACHE_KEY);
        if (userId && verified === "true") {
            return { userId, verified: true };
        }
        return null;
    } catch {
        return null;
    }
};

export const setAdminCache = (userId: string) => {
    try {
        sessionStorage.setItem(ADMIN_USER_KEY, userId);
        sessionStorage.setItem(ADMIN_CACHE_KEY, "true");
    } catch {
        // Ignore storage errors
    }
};

export const clearAdminCache = () => {
    try {
        sessionStorage.removeItem(ADMIN_USER_KEY);
        sessionStorage.removeItem(ADMIN_CACHE_KEY);
    } catch {
        // Ignore storage errors
    }
};
