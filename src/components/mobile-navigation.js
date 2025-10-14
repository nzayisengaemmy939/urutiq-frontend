import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Menu, X, Home, ShoppingCart, Receipt, Banknote, BarChart3, Brain, Settings, Package } from "lucide-react";
import { Button } from "../components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "../components/ui/sheet";
import { cn } from "../lib/utils";
const navigationItems = [
    { name: "Dashboard", icon: Home, href: "/", current: true },
    { name: "Sales & Invoicing", icon: ShoppingCart, href: "/sales" },
    { name: "Purchases & Expenses", icon: Receipt, href: "/purchases" },
    { name: "Banking & Cash", icon: Banknote, href: "/banking" },
    { name: "Inventory & Products", icon: Package, href: "/inventory" },
    { name: "Reports & Analytics", icon: BarChart3, href: "/reports" },
    { name: "AI Insights", icon: Brain, href: "/ai-insights" },
    { name: "Settings", icon: Settings, href: "/settings" },
];
export function MobileNavigation() {
    const [open, setOpen] = useState(false);
    return (_jsxs(Sheet, { open: open, onOpenChange: setOpen, children: [_jsx(SheetTrigger, { asChild: true, children: _jsxs(Button, { variant: "ghost", size: "sm", className: "lg:hidden", children: [_jsx(Menu, { className: "h-5 w-5" }), _jsx("span", { className: "sr-only", children: "Open navigation menu" })] }) }), _jsx(SheetContent, { side: "right", className: "w-80 p-0", children: _jsxs("div", { className: "flex flex-col h-full", children: [_jsx("div", { className: "p-4 border-b border-border", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-8 h-8 bg-primary rounded-lg flex items-center justify-center", children: _jsx("span", { className: "text-primary-foreground font-bold text-sm", children: "U" }) }), _jsxs("div", { children: [_jsx("h2", { className: "text-lg font-bold text-foreground", children: "UrutiIQ" }), _jsx("p", { className: "text-xs text-muted-foreground", children: "AI Accounting" })] })] }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => setOpen(false), children: _jsx(X, { className: "h-4 w-4" }) })] }) }), _jsx("nav", { className: "flex-1 overflow-y-auto p-4", children: _jsx("div", { className: "space-y-2", children: navigationItems.map((item) => (_jsxs("a", { href: item.href, className: cn("flex items-center gap-3 px-3 py-3 text-sm rounded-lg transition-colors", item.current
                                        ? "bg-primary text-primary-foreground font-medium"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"), onClick: () => setOpen(false), children: [_jsx(item.icon, { className: "w-5 h-5" }), item.name] }, item.name))) }) }), _jsx("div", { className: "p-4 border-t border-border", children: _jsx("div", { className: "bg-card p-3 rounded-lg border border-border", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-8 h-8 bg-muted rounded-full flex items-center justify-center", children: _jsx("span", { className: "text-xs font-medium", children: "JD" }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "text-sm font-medium text-foreground truncate", children: "John Doe" }), _jsx("p", { className: "text-xs text-muted-foreground truncate", children: "Senior Accountant" })] })] }) }) })] }) })] }));
}
