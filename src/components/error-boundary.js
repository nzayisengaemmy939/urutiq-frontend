import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Component } from 'react';
export class ErrorBoundary extends Component {
    constructor() {
        super(...arguments);
        Object.defineProperty(this, "state", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {
                hasError: false
            }
        });
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }
            return (_jsx("div", { className: "min-h-screen bg-gray-50 flex items-center justify-center", children: _jsxs("div", { className: "max-w-md w-full bg-white shadow-lg rounded-lg p-6", children: [_jsxs("div", { className: "flex items-center mb-4", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("svg", { className: "h-8 w-8 text-red-500", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" }) }) }), _jsx("div", { className: "ml-3", children: _jsx("h3", { className: "text-lg font-medium text-gray-900", children: "Something went wrong" }) })] }), _jsxs("div", { className: "text-sm text-gray-600", children: [_jsx("p", { children: "An unexpected error occurred. Please refresh the page or contact support if the problem persists." }), this.state.error && (_jsxs("details", { className: "mt-4", children: [_jsx("summary", { className: "cursor-pointer text-gray-800 font-medium", children: "Error Details" }), _jsx("pre", { className: "mt-2 text-xs text-gray-500 bg-gray-100 p-2 rounded overflow-auto", children: this.state.error.message })] }))] }), _jsx("div", { className: "mt-6", children: _jsx("button", { onClick: () => window.location.reload(), className: "w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors", children: "Refresh Page" }) })] }) }));
        }
        return this.props.children;
    }
}
