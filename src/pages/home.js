import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useAuth } from "../contexts/auth-context";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
export default function HomePage() {
    const { isAuthenticated, isLoading } = useAuth();
    const navigate = useNavigate();
    useEffect(() => {
        if (!isLoading) {
            if (isAuthenticated) {
                navigate("/dashboard");
            }
            else {
                navigate("/login");
            }
        }
    }, [isAuthenticated, isLoading, navigate]);
    // Show loading while determining redirect
    return (_jsx("div", { className: "min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50 flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" }), _jsx("p", { className: "text-gray-600", children: "Loading..." })] }) }));
}
