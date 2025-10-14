import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { WifiOff, RefreshCw } from "lucide-react";
import { Button } from "../components/ui/button";
import { useToast } from "./toast-provider";
export function NetworkStatus() {
    const [isOnline, setIsOnline] = useState(true);
    const [isRetrying, setIsRetrying] = useState(false);
    const { warning, success } = useToast();
    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            success("Connection restored", "You're back online");
        };
        const handleOffline = () => {
            setIsOnline(false);
            warning("Connection lost", "Some features may not work properly");
        };
        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);
        // Initial check
        setIsOnline(navigator.onLine);
        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, [warning, success]);
    const handleRetry = async () => {
        setIsRetrying(true);
        try {
            // Attempt to fetch a small resource to test connectivity
            await fetch("/api/health", { method: "HEAD" });
            setIsOnline(true);
            success("Connection restored", "Successfully reconnected");
        }
        catch (error) {
            warning("Still offline", "Please check your internet connection");
        }
        finally {
            setIsRetrying(false);
        }
    };
    if (isOnline)
        return null;
    return (_jsx("div", { className: "fixed bottom-4 left-4 z-50 bg-amber-50 border border-amber-200 rounded-lg p-4 shadow-lg max-w-sm", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(WifiOff, { className: "w-5 h-5 text-amber-600" }), _jsxs("div", { className: "flex-1", children: [_jsx("h4", { className: "text-sm font-semibold text-amber-800", children: "You're offline" }), _jsx("p", { className: "text-xs text-amber-700", children: "Some features may not work properly" })] }), _jsx(Button, { variant: "outline", size: "sm", onClick: handleRetry, disabled: isRetrying, className: "bg-transparent border-amber-300 text-amber-700 hover:bg-amber-100", children: isRetrying ? _jsx(RefreshCw, { className: "w-3 h-3 animate-spin" }) : _jsx(RefreshCw, { className: "w-3 h-3" }) })] }) }));
}
