import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Component } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
export class RootErrorBoundary extends Component {
    constructor(props) {
        super(props);
        Object.defineProperty(this, "handleRetry", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => {
                this.setState({ hasError: false, error: undefined, errorInfo: undefined });
            }
        });
        Object.defineProperty(this, "handleGoHome", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => {
                if (typeof window !== 'undefined') {
                    window.location.href = '/';
                }
            }
        });
        this.state = { hasError: false };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        console.error("🚨 Root Error Boundary caught an error:", error, errorInfo);
        this.setState({ error, errorInfo });
        // Log to external service if available
        if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
            // In production, you might want to send this to an error tracking service
            console.error("Production error:", { error: error.message, stack: error.stack, errorInfo });
        }
    }
    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }
            return (_jsx("div", { className: "min-h-screen bg-background flex items-center justify-center p-4", children: _jsxs(Card, { className: "w-full max-w-2xl", children: [_jsxs(CardHeader, { className: "text-center", children: [_jsx("div", { className: "mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center", children: _jsx(AlertTriangle, { className: "w-8 h-8 text-red-600" }) }), _jsx(CardTitle, { className: "text-2xl", children: "Application Error" })] }), _jsxs(CardContent, { className: "space-y-6", children: [_jsx("div", { className: "text-center", children: _jsx("p", { className: "text-muted-foreground mb-4", children: "We're sorry, but something went wrong with the application. This error has been logged and our team will investigate." }) }), this.state.error && (_jsxs("div", { className: "space-y-2", children: [_jsx("h4", { className: "font-medium text-sm", children: "Error Details:" }), _jsxs("div", { className: "bg-muted p-3 rounded-md", children: [_jsx("p", { className: "text-sm font-mono text-red-600", children: this.state.error.message }), this.state.error.stack && (_jsxs("details", { className: "mt-2", children: [_jsx("summary", { className: "text-xs text-muted-foreground cursor-pointer", children: "Stack Trace" }), _jsx("pre", { className: "text-xs text-muted-foreground mt-2 whitespace-pre-wrap overflow-auto max-h-32", children: this.state.error.stack })] }))] })] })), _jsxs("div", { className: "flex flex-col sm:flex-row gap-3 justify-center", children: [_jsxs(Button, { onClick: this.handleRetry, className: "gap-2", children: [_jsx(RefreshCw, { className: "w-4 h-4" }), "Try Again"] }), _jsxs(Button, { variant: "outline", onClick: this.handleGoHome, className: "gap-2", children: [_jsx(Home, { className: "w-4 h-4" }), "Go Home"] }), _jsxs(Button, { variant: "outline", onClick: () => window.location.reload(), className: "gap-2", children: [_jsx(RefreshCw, { className: "w-4 h-4" }), "Reload Page"] })] }), _jsxs("div", { className: "text-center text-xs text-muted-foreground", children: [_jsx("p", { children: "If this problem persists, please contact support." }), _jsxs("p", { className: "mt-1", children: ["Error ID: ", Date.now().toString(36)] })] })] })] }) }));
        }
        return this.props.children;
    }
}
export default RootErrorBoundary;
