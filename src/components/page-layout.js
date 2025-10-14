import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { BreadcrumbNavigation } from "./breadcrumb-navigation";
import { KeyboardShortcuts } from "./keyboard-shortcuts";
export function PageLayout({ children, showBreadcrumbs = true, title, description, breadcrumbs }) {
    const [mounted, setMounted] = React.useState(false);
    React.useEffect(() => setMounted(true), []);
    if (!mounted) {
        return (_jsx("div", { className: "min-h-screen bg-background", children: _jsx("main", { className: "flex-1 overflow-hidden pt-8 pl-0 pl-0", id: "main-content", children: _jsx("div", { className: "flex-1 space-y-6 px-4 py-6", children: _jsx("div", { className: "h-5 w-40 bg-muted rounded" }) }) }) }));
    }
    return (_jsxs("div", { className: "space-y-6 px-6 py-4", children: [(title || description) && (_jsxs("div", { className: "space-y-2", children: [title && (_jsx("h1", { className: "text-3xl font-bold tracking-tight", children: title })), description && (_jsx("p", { className: "text-muted-foreground", children: description }))] })), showBreadcrumbs && _jsx(BreadcrumbNavigation, { customBreadcrumbs: breadcrumbs }), _jsx("div", { className: "fixed bottom-6 right-6 z-50", children: _jsx(KeyboardShortcuts, {}) }), children] }));
}
