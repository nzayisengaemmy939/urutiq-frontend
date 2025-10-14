import { useEffect, useState } from "react";
import apiService from "../lib/api";
/**
 * Centralizes demo auth token bootstrap for local/dev.
 * Sets `auth_token` and initializes apiService with tenant.
 */
export function useDemoAuth(contextKey = "demo") {
    const [ready, setReady] = useState(false);
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);
    useEffect(() => {
        if (!mounted)
            return;
        let cancelled = false;
        (async () => {
            try {
                // Respect a guard that disables demo auth (used for real logout)
                if (typeof window !== 'undefined') {
                    const disabled = localStorage.getItem('disable_demo_auth') === 'true';
                    if (disabled) {
                        setReady(false);
                        return;
                    }
                }
                const tenant = typeof window !== 'undefined' ? (localStorage.getItem('tenant_id') || 'tenant_demo') : 'tenant_demo';
                // Set tenant first before calling getDemoToken
                apiService.setAuth('', tenant); // Set tenant without token first
                const demo = await apiService.getDemoToken(contextKey, ['admin', 'accountant']);
                if (cancelled)
                    return;
                if (demo?.token) {
                    try {
                        localStorage.setItem('auth_token', demo.token);
                    }
                    catch { }
                    // @ts-ignore
                    apiService.setAuth(demo.token, tenant);
                    if (!cancelled) {
                        setReady(true);
                    }
                }
            }
            catch (error) {
                // best-effort only
            }
        })();
        return () => { cancelled = true; };
    }, [contextKey, mounted]);
    // Don't log during SSR to prevent hydration mismatches
    return { ready };
}
export default useDemoAuth;
