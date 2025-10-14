import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { apiService } from "../lib/api";
import { config } from "../lib/config";
// ---- Helpers ---- //
function base64UrlDecode(base64Url) {
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, "=");
    if (typeof window === "undefined") {
        return Buffer.from(padded, "base64").toString("utf-8");
    }
    return atob(padded);
}
function parseJwt(token) {
    try {
        const [, payload] = token.split(".");
        return JSON.parse(base64UrlDecode(payload));
    }
    catch {
        return null;
    }
}
function isTokenExpired(token, bufferMinutes = 5) {
    const payload = parseJwt(token);
    if (!payload?.exp)
        return true;
    const now = Date.now() / 1000;
    return (payload.exp - now) < (bufferMinutes * 60);
}
// ---- Context ---- //
const AuthContext = createContext(undefined);
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [mounted, setMounted] = useState(false);
    const qc = useQueryClient();
    const navigate = useNavigate();
    // Only log after mounting to prevent SSR issues
    useEffect(() => {
        if (mounted) {
            console.log("🔐 AuthProvider: Component mounted and ready");
        }
    }, [mounted]);
    // Ensure a company id is present in storage after login/refresh
    const ensureCompanyId = async (payload) => {
        try {
            const existing = localStorage.getItem("company_id") || localStorage.getItem("companyId") || localStorage.getItem("company");
            // If a company is already selected and valid, keep it unless there is exactly one company available
            // Wait a bit to ensure auth headers are properly set
            await new Promise(resolve => setTimeout(resolve, 200));
            // Try to fetch first company for this tenant
            const companies = await apiService.getCompanies({ page: 1, pageSize: 1 });
            const list = companies?.data || companies || [];
            const first = Array.isArray(list) ? list[0] : undefined;
            if (first?.id) {
                // If there is only one company returned (or none selected yet), enforce it as the active company
                const isDemo = existing === config.demo.companyId;
                if (!existing || list.length === 1 || existing !== first.id || isDemo) {
                    localStorage.setItem("company_id", first.id);
                    if (first.name)
                        localStorage.setItem("company_name", first.name);
                }
            }
        }
        catch (error) {
            console.log('Failed to fetch companies for company ID setup:', error);
            // Do not set any fallback; preserve existing selection if any
        }
    };
    // ---- Token Refresh ---- //
    const refreshTokens = async () => {
        // Only run on client side
        if (typeof window === "undefined") {
            return false;
        }
        if (isRefreshing) {
            // Prevent multiple simultaneous refresh attempts
            return false;
        }
        const rt = localStorage.getItem("refresh_token");
        const tenantId = localStorage.getItem("tenant_id");
        if (!rt || !tenantId) {
            return false;
        }
        setIsRefreshing(true);
        try {
            const { accessToken } = await apiService.refresh(rt);
            const payload = parseJwt(accessToken);
            if (!payload)
                throw new Error("Invalid JWT received on refresh");
            // Update tokens in storage and API service
            localStorage.setItem("auth_token", accessToken);
            localStorage.setItem("tenant_id", payload.tenantId);
            apiService.setAuth(accessToken, payload.tenantId);
            apiService.setRefreshToken(rt); // Keep the same refresh token
            await ensureCompanyId(payload);
            // Update user state
            const companyName = localStorage.getItem('company_name') || 'My Company';
            setUser({
                id: payload.sub,
                email: payload.sub,
                firstName: "User",
                lastName: "",
                companyName,
                role: payload.roles?.[0] || "employee",
                isEmailVerified: true,
                createdAt: new Date().toISOString(),
                tenantId: payload.tenantId
            });
            console.log("Tokens refreshed successfully");
            return true;
        }
        catch (err) {
            console.error("Token refresh failed", err);
            return false;
        }
        finally {
            setIsRefreshing(false);
        }
    };
    // Check and refresh token if needed before API calls
    const ensureValidToken = async () => {
        // Only run on client side
        if (typeof window === "undefined") {
            return false;
        }
        const token = localStorage.getItem("auth_token");
        if (!token)
            return false;
        if (isTokenExpired(token)) {
            console.log("Token expired, refreshing before API call");
            return await refreshTokens();
        }
        return true;
    };
    // Handle 401 errors by attempting token refresh
    const handleAuthError = async () => {
        console.log("Handling authentication error, attempting token refresh");
        const success = await refreshTokens();
        if (!success) {
            console.log("Token refresh failed, logging out user");
            await logout();
        }
        return success;
    };
    // ---- Auth Status ---- //
    const checkAuthStatus = async () => {
        console.log("🔐 checkAuthStatus called");
        // Only run on client side
        if (typeof window === "undefined") {
            console.log("🔐 checkAuthStatus: SSR, setting loading false");
            setIsLoading(false);
            return;
        }
        try {
            const token = localStorage.getItem("auth_token");
            const tenantId = localStorage.getItem("tenant_id");
            console.log("🔐 checkAuthStatus: token present:", !!token, "tenantId present:", !!tenantId);
            if (!token || !tenantId) {
                console.log("🔐 checkAuthStatus: no token or tenantId, logging out");
                await logout();
                return;
            }
            const payload = parseJwt(token);
            if (!payload) {
                await logout();
                return;
            }
            // Check if token is expired or will expire soon (within 5 minutes)
            const now = Date.now() / 1000;
            const expiresSoon = payload.exp && (payload.exp - now) < 300; // 5 minutes
            if (payload.exp && (now >= payload.exp || expiresSoon)) {
                console.warn("Access token expired or expiring soon, attempting refresh");
                const refreshSuccess = await refreshTokens();
                if (!refreshSuccess) {
                    console.warn("Token refresh failed, logging out");
                    await logout();
                }
                return;
            }
            apiService.setAuth(token, tenantId);
            // Ensure refresh token is available for 401 auto-refresh on first load
            try {
                const rt = localStorage.getItem("refresh_token");
                if (rt)
                    apiService.setRefreshToken(rt);
            }
            catch { }
            // Add a small delay to ensure auth headers are properly set
            await new Promise(resolve => setTimeout(resolve, 100));
            await ensureCompanyId(payload);
            setUser({
                id: payload.sub,
                email: payload.sub,
                firstName: "User",
                lastName: "",
                companyName: localStorage.getItem('company_name') || 'My Company',
                role: payload.roles?.[0] || "employee",
                isEmailVerified: true,
                createdAt: new Date().toISOString(),
                tenantId
            });
        }
        catch (error) {
            console.error("Auth check failed", error);
            await logout();
        }
        finally {
            console.log("🔐 checkAuthStatus: setting isLoading to false");
            setIsLoading(false);
        }
    };
    // ---- Login ---- //
    const login = async (email, password) => {
        setIsLoading(true);
        try {
            try {
                if (typeof window !== 'undefined')
                    localStorage.removeItem('disable_demo_auth');
            }
            catch { }
            console.log("🔐 Login attempt for:", email);
            console.log("📡 Making API call to login endpoint...");
            // Attempt MFA-aware login
            const result = await apiService.loginMfa(email, password);
            if (!result.ok) {
                // Show prompt for MFA code
                const code = typeof window !== 'undefined' ? window.prompt('Enter your MFA code or a backup code:') : '';
                if (!code)
                    throw new Error('MFA code is required');
                const tokens = await apiService.verifyMfaLogin(result.challengeToken, code);
                const payload = parseJwt(tokens.accessToken);
                if (!payload)
                    throw new Error('Invalid JWT received');
                const tenantId = payload.tenantId || "tenant_default";
                try {
                    localStorage.setItem("auth_token", tokens.accessToken);
                }
                catch { }
                try {
                    if (tokens.refreshToken)
                        localStorage.setItem("refresh_token", tokens.refreshToken);
                }
                catch { }
                try {
                    localStorage.setItem("tenant_id", tenantId);
                }
                catch { }
                apiService.setAuth(tokens.accessToken, tenantId);
                if (tokens.refreshToken)
                    apiService.setRefreshToken(tokens.refreshToken);
                await ensureCompanyId(payload);
                setUser({
                    id: payload.sub,
                    email,
                    firstName: "User",
                    lastName: "",
                    companyName: localStorage.getItem('company_name') || 'My Company',
                    role: payload.roles?.[0] || "employee",
                    isEmailVerified: true,
                    createdAt: new Date().toISOString(),
                    tenantId
                });
                return;
            }
            const loginResp = result.tokens;
            console.log("✅ Login API call successful, raw response:", loginResp);
            const accessToken = loginResp.accessToken ?? loginResp.access_token ?? loginResp.token ?? loginResp.data?.accessToken;
            const refreshToken = loginResp.refreshToken ?? loginResp.refresh_token ?? loginResp.data?.refreshToken ?? loginResp.refreshToken;
            console.log("🎫 Access token received:", !!accessToken);
            console.log("🔄 Refresh token received:", !!refreshToken);
            if (!accessToken || typeof accessToken !== 'string') {
                console.error('Login response missing access token or token is not a string', loginResp);
                throw new Error('Invalid JWT received');
            }
            // Quick sanity check for JWT structure
            if (!accessToken.includes('.') || accessToken.split('.').length !== 3) {
                console.error('Access token does not look like a JWT (missing dot separators)', accessToken);
                throw new Error('Invalid JWT received');
            }
            const payload = parseJwt(accessToken);
            if (!payload) {
                console.error('Failed to parse JWT payload for token', accessToken.substring(0, 32));
                throw new Error('Invalid JWT received');
            }
            const tenantId = payload.tenantId || "tenant_default";
            try {
                localStorage.setItem("auth_token", accessToken);
            }
            catch { }
            try {
                if (refreshToken)
                    localStorage.setItem("refresh_token", refreshToken);
            }
            catch { }
            try {
                localStorage.setItem("tenant_id", tenantId);
            }
            catch { }
            apiService.setAuth(accessToken, tenantId);
            if (refreshToken)
                apiService.setRefreshToken(refreshToken);
            await ensureCompanyId(payload);
            // Get company name from localStorage or use a default
            const companyName = localStorage.getItem('company_name') || 'My Company';
            const userData = {
                id: payload.sub,
                email,
                firstName: "User",
                lastName: "",
                companyName,
                role: payload.roles?.[0] || "employee",
                isEmailVerified: true,
                createdAt: new Date().toISOString(),
                tenantId
            };
            console.log("🎉 Login successful, setting user data:", userData);
            setUser(userData);
            console.log("✅ User state updated, isAuthenticated should now be:", !!userData);
        }
        catch (error) {
            console.error("❌ Login failed:", error);
            throw error;
        }
        finally {
            setIsLoading(false);
        }
    };
    // ---- Demo Login ---- //
    const loginWithDemo = async (sub, roles = ["admin"]) => {
        setIsLoading(true);
        try {
            try {
                if (typeof window !== 'undefined')
                    localStorage.removeItem('disable_demo_auth');
            }
            catch { }
            const { token } = await apiService.getDemoToken(sub, roles);
            const payload = parseJwt(token);
            if (!payload)
                throw new Error("Invalid demo JWT");
            localStorage.setItem("auth_token", token);
            localStorage.setItem("tenant_id", payload.tenantId);
            apiService.setAuth(token, payload.tenantId);
            await ensureCompanyId(payload);
            setUser({
                id: payload.sub,
                email: payload.sub,
                firstName: "Demo",
                lastName: "User",
                companyName: localStorage.getItem('company_name') || 'My Company',
                role: payload.roles?.[0] || "admin",
                isEmailVerified: true,
                createdAt: new Date().toISOString(),
                tenantId: payload.tenantId
            });
        }
        finally {
            setIsLoading(false);
        }
    };
    // ---- Register ---- //
    const register = async (_userData) => {
        throw new Error("Registration not implemented yet.");
    };
    // ---- Clear All Data ---- //
    const clearAllData = () => {
        if (typeof window === "undefined")
            return;
        try {
            // Get all localStorage keys
            const keys = Object.keys(localStorage);
            // Remove all keys except those that should persist
            const keysToKeep = ['disable_demo_auth']; // Keep this to prevent demo login after logout
            keys.forEach(key => {
                if (!keysToKeep.includes(key)) {
                    try {
                        localStorage.removeItem(key);
                    }
                    catch (error) {
                        console.warn(`Failed to remove ${key} from localStorage:`, error);
                    }
                }
            });
            console.log('All user data cleared from localStorage');
        }
        catch (error) {
            console.error('Failed to clear localStorage:', error);
        }
    };
    // ---- Logout ---- //
    const logout = async () => {
        // Only run on client side
        if (typeof window === "undefined") {
            setUser(null);
            return;
        }
        try {
            const rt = localStorage.getItem("refresh_token");
            if (rt)
                await apiService.logout(rt);
        }
        catch (error) {
            console.error("Logout failed", error);
        }
        finally {
            // Clear all user data from localStorage
            clearAllData();
            // Set disable_demo_auth to true to prevent demo login after logout
            try {
                localStorage.setItem('disable_demo_auth', 'true');
            }
            catch (error) {
                console.warn('Failed to set disable_demo_auth:', error);
            }
            // Clear API service auth
            apiService.setAuth("", "");
            setUser(null);
            // Clear query cache
            try {
                await qc.clear();
            }
            catch { }
            // Navigate to home page
            try {
                navigate('/');
            }
            catch { }
        }
    };
    // ---- Update User ---- //
    const updateUser = async (userData) => {
        if (user)
            setUser({ ...user, ...userData });
    };
    // ---- useEffect hooks (after function definitions) ---- //
    useEffect(() => {
        setMounted(true);
    }, []);
    useEffect(() => {
        if (mounted) {
            console.log("🔐 AuthProvider: Checking auth status...");
            checkAuthStatus();
        }
    }, [mounted]);
    // Set up periodic token refresh check
    useEffect(() => {
        // Only run on client side
        if (typeof window === "undefined" || !mounted)
            return;
        if (!user)
            return;
        const checkTokenExpiry = () => {
            const token = localStorage.getItem("auth_token");
            if (!token)
                return;
            const payload = parseJwt(token);
            if (!payload?.exp)
                return;
            const now = Date.now() / 1000;
            const timeUntilExpiry = payload.exp - now;
            // If token expires in less than 10 minutes, refresh it
            if (timeUntilExpiry < 600) {
                console.log("Token expiring soon, proactively refreshing");
                refreshTokens().catch(err => {
                    console.error("Proactive token refresh failed:", err);
                });
            }
        };
        // Check every 2 minutes
        const interval = setInterval(checkTokenExpiry, 2 * 60 * 1000);
        // Also check immediately
        checkTokenExpiry();
        return () => clearInterval(interval);
    }, [user, mounted]);
    const value = {
        user,
        isLoading,
        isAuthenticated: !!user,
        isRefreshing,
        login,
        loginWithDemo,
        register,
        logout,
        updateUser,
        refreshTokens,
        ensureValidToken,
        handleAuthError,
        clearAllData,
    };
    return _jsx(AuthContext.Provider, { value: value, children: children });
}
// ---- Hook ---- //
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
