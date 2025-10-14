import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createContext, useContext, useState, useCallback, useRef } from "react";
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from "lucide-react";
import { Button } from "../components/ui/button";
const ToastContext = createContext(undefined);
export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
};
const toastIcons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
};
const toastStyles = {
    success: "bg-green-50 border-green-200 text-green-800",
    error: "bg-red-50 border-red-200 text-red-800",
    warning: "bg-amber-50 border-amber-200 text-amber-800",
    info: "bg-blue-50 border-blue-200 text-blue-800",
};
export function ToastProvider({ children }) {
    const toastIdCounterRef = useRef(0);
    const [toasts, setToasts] = useState([]);
    const addToast = useCallback((toast) => {
        const id = `toast-${toastIdCounterRef.current++}`;
        const newToast = { ...toast, id };
        setToasts((prev) => [...prev, newToast]);
        // Auto remove after duration
        const duration = toast.duration || 5000;
        setTimeout(() => {
            removeToast(id);
        }, duration);
    }, []);
    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);
    const success = useCallback((title, description) => {
        addToast({ type: "success", title, description });
    }, [addToast]);
    const error = useCallback((title, description) => {
        addToast({ type: "error", title, description, duration: 8000 });
    }, [addToast]);
    const warning = useCallback((title, description) => {
        addToast({ type: "warning", title, description });
    }, [addToast]);
    const info = useCallback((title, description) => {
        addToast({ type: "info", title, description });
    }, [addToast]);
    return (_jsxs(ToastContext.Provider, { value: { toasts, addToast, removeToast, success, error, warning, info }, children: [children, _jsx("div", { className: "fixed top-4 right-4 z-50 space-y-2 max-w-sm", children: toasts.map((toast) => {
                    const Icon = toastIcons[toast.type];
                    return (_jsx("div", { className: `p-4 rounded-lg border shadow-lg animate-in slide-in-from-right-full ${toastStyles[toast.type]}`, children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx(Icon, { className: "w-5 h-5 flex-shrink-0 mt-0.5" }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("h4", { className: "text-sm font-semibold", children: toast.title }), toast.description && _jsx("p", { className: "text-sm opacity-90 mt-1", children: toast.description })] }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => removeToast(toast.id), className: "h-6 w-6 p-0 hover:bg-black/10", children: _jsx(X, { className: "w-4 h-4" }) })] }) }, toast.id));
                }) })] }));
}
