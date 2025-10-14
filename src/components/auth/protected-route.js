import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/auth-context";
import { SkeletonCard } from "../skeleton-card";
export function ProtectedRoute({ children, requiredRole }) {
    const { user, isLoading, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const hasRequiredRole = () => {
        if (!requiredRole)
            return true;
        if (user?.role === requiredRole)
            return true;
        // Also check roles from the JWT to support multi-role users
        try {
            const token = localStorage.getItem('auth_token') || '';
            const [, payloadB64] = token.split('.');
            if (!payloadB64)
                return false;
            const json = JSON.parse(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/')));
            const roles = Array.isArray(json?.roles) ? json.roles : [];
            return roles.includes(requiredRole);
        }
        catch {
            return false;
        }
    };
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            navigate("/login");
        }
    }, [isLoading, isAuthenticated, navigate]);
    useEffect(() => {
        if (user && requiredRole && !hasRequiredRole()) {
            // User doesn't have required role, redirect to unauthorized page
            navigate("/unauthorized");
        }
    }, [user, requiredRole, navigate]);
    if (isLoading) {
        return (_jsx("div", { className: "min-h-screen bg-background", children: _jsxs("div", { className: "p-6 space-y-6", children: [_jsx(SkeletonCard, { className: "h-8 w-64" }), _jsx("div", { className: "grid gap-6 md:grid-cols-2 lg:grid-cols-4", children: [...Array(4)].map((_, i) => (_jsx(SkeletonCard, { className: "h-32" }, i))) }), _jsx(SkeletonCard, { className: "h-96" })] }) }));
    }
    if (!isAuthenticated) {
        return null; // Will redirect to login
    }
    if (requiredRole && !hasRequiredRole()) {
        return null; // Will redirect to unauthorized
    }
    return _jsx(_Fragment, { children: children });
}
