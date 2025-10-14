import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";
export class AccountingErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        console.error('Accounting component error:', error, errorInfo);
    }
    render() {
        if (this.state.hasError && this.state.error) {
            if (this.props.fallback) {
                const FallbackComponent = this.props.fallback;
                return (_jsx(FallbackComponent, { error: this.state.error, reset: () => this.setState({ hasError: false, error: null }) }));
            }
            return (_jsxs(Card, { className: "border-red-200 bg-red-50", children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2 text-red-600", children: [_jsx(AlertCircle, { className: "h-5 w-5" }), "Something went wrong"] }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsx("p", { className: "text-sm text-red-600", children: this.state.error.message || 'An unexpected error occurred' }), _jsxs(Button, { variant: "outline", size: "sm", onClick: () => this.setState({ hasError: false, error: null }), className: "text-red-600 border-red-200 hover:bg-red-100", children: [_jsx(RefreshCw, { className: "h-4 w-4 mr-2" }), "Try Again"] })] })] }));
        }
        return this.props.children;
    }
}
