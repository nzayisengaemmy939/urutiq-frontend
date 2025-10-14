import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useSidebar } from "../contexts/sidebar-context";
import { Building2, BarChart3, Users, FileText, Settings, Brain, CreditCard, Calculator, ChevronRight, Home, ShoppingCart, Receipt, Banknote, Package, UserCheck, FolderOpen, HelpCircle, Zap, MessageSquare, BookOpen, ShoppingBag, Wallet, } from "lucide-react";
import { cn } from "../lib/utils";
import { Link, useLocation } from "react-router-dom";
import { useKeyboardNavigation } from "./keyboard-navigation-provider";
const adaptiveMenuConfig = {
    core: ["Dashboard", "Sales & Invoicing", "Purchases & Expenses", "Banking & Cash", "Tax Management"],
    optional: ["Inventory & Products", "Payroll & HR", "Projects & Time", "Multi-Company", "International"],
    utility: [
        "Reports & Analytics",
        "AI Insights",
        "AI Powered Features",
        "Settings",
        "Help & Support",
        "Documents",
        "Client Portal",
        "Security",
    ],
};
const userPreferences = {
    enabledModules: new Set([
        "Dashboard",
        "Sales & Invoicing",
        "Purchases & Expenses",
        "Banking & Cash",
        "Inventory & Products",
        "Accounting",
        "Journal Entries Hub",
        "Tax Management",
        "Reports & Analytics",
        "AI Insights",
        "AI Powered Features",
        "Client Portal",
        "System Settings",
    ]),
    favoriteItems: new Set([
        "Financial Overview",
        "AI Smart Insights",
        "AI Powered Features",
        "Client Portal",
        "Invoices",
        "Expenses",
        "Accounts Payable",
        "Journal Entries Hub",
        "Bank Accounts & Reconciliation",
        "Enhanced Financial Reports",
        "Advanced Analytics Dashboard",
        "AI Financial Coach",
        "Fixed Assets",
    ]),
    recentlyUsed: ["Invoices", "Expenses", "Accounts Payable", "AI Smart Insights", "AI Powered Features", "Client Portal", "Bank Accounts & Reconciliation", "Enhanced Financial Reports", "Advanced Analytics Dashboard", "AI Financial Coach", "Fixed Assets"],
};
// Simplified navigation structure - single level for better UX
const navigationItems = [
    {
        name: "Dashboard",
        icon: Home,
        href: "/dashboard",
        favorite: true
    },
    {
        name: "Sales & Invoicing",
        icon: ShoppingCart,
        href: "/dashboard/sales",
        badge: "Core"
    },
    {
        name: "Point of Sale",
        icon: CreditCard,
        href: "/dashboard/pos",
        badge: "New",
        favorite: true
    },
    {
        name: "Expenses & Purchases",
        icon: Receipt,
        href: "/dashboard/expenses",
        favorite: true,
        recent: true
    },
    {
        name: "Purchase Orders",
        icon: ShoppingBag,
        href: "/dashboard/purchase-orders",
        badge: "Procurement",
        favorite: true
    },
    {
        name: "Accounts Payable",
        icon: Wallet,
        href: "/dashboard/enhanced-accounts-payable",
        badge: "Enhanced",
        favorite: true
    },
    {
        name: "Supplier Portal",
        icon: Building2,
        href: "/dashboard/supplier-portal",
        badge: "New",
        favorite: true
    },
    {
        name: "Banking & Cash",
        icon: Banknote,
        href: "/dashboard/banking",
        favorite: true
    },
    {
        name: "Inventory & Products",
        icon: Package,
        href: "/dashboard/inventory"
    },
    {
        name: "Tax Management",
        icon: Calculator,
        href: "/dashboard/tax",
        badge: "Enhanced"
    },
    {
        name: "Tax Calculation",
        icon: Calculator,
        href: "/dashboard/tax-calculation",
        badge: "New"
    },
    {
        name: "Accounting",
        icon: FileText,
        href: "/dashboard/accounting",
        favorite: true
    },
    {
        name: "Journal Entries Hub",
        icon: BookOpen,
        href: "/dashboard/journal-hub",
        badge: "New",
        favorite: true
    },
    {
        name: "Approval Hub",
        icon: UserCheck,
        href: "/dashboard/approval-hub",
        badge: "New",
        favorite: true
    },
    {
        name: "Smart Ledger",
        icon: MessageSquare,
        href: "/dashboard/enhanced-journal-management",
        badge: "Smart"
    },
    {
        name: "Reports & Analytics",
        icon: BarChart3,
        href: "/dashboard/reports",
        favorite: true
    },
    {
        name: "AI Insights",
        icon: Brain,
        href: "/dashboard/ai-insights",
        badge: "AI",
        favorite: true
    },
    {
        name: "AI Powered Features",
        icon: Zap,
        href: "/dashboard/llama-ai",
        badge: "AI+",
        favorite: true
    },
    {
        name: "Documents",
        icon: FolderOpen,
        href: "/dashboard/documents"
    },
    {
        name: "Companies",
        icon: Building2,
        href: "/dashboard/companies"
    },
    {
        name: "Client Portal",
        icon: Users,
        href: "/dashboard/clients",
        badge: "Portal",
        favorite: true
    },
    {
        name: "Settings",
        icon: Settings,
        href: "/dashboard/settings"
    },
    {
        name: "Help & Support",
        icon: HelpCircle,
        href: "/dashboard/help-support"
    }
];
export function Sidebar() {
    const location = useLocation();
    const { isCollapsed, setIsCollapsed } = useSidebar();
    const [focusedIndex, setFocusedIndex] = useState(-1);
    const { setFocusedElement } = useKeyboardNavigation();
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (document.activeElement?.closest("[data-sidebar]")) {
                const allItems = document.querySelectorAll("[data-sidebar-item]");
                if (e.key === "ArrowDown") {
                    e.preventDefault();
                    const nextIndex = Math.min(focusedIndex + 1, allItems.length - 1);
                    setFocusedIndex(nextIndex);
                    allItems[nextIndex]?.focus();
                }
                else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    const prevIndex = Math.max(focusedIndex - 1, 0);
                    setFocusedIndex(prevIndex);
                    allItems[prevIndex]?.focus();
                }
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [focusedIndex]);
    return (_jsxs("div", { className: cn("fixed left-0 top-0 bg-sidebar border-r border-sidebar-border transition-all duration-300 z-40 hidden lg:flex lg:flex-col", 
        // Responsive height: full height on desktop, adapt to content on smaller screens
        "h-screen min-h-screen max-h-screen", 
        // Ensure proper flex behavior
        "flex-shrink-0", 
        // Responsive behavior for different screen sizes
        "lg:h-screen xl:h-screen 2xl:h-screen", 
        // Responsive width
        isCollapsed ? "w-16" : "w-64"), "data-sidebar": true, role: "navigation", "aria-label": "Main navigation", style: {
            // Ensure sidebar takes full available height
            height: '100vh',
            maxHeight: '100vh',
            // Add responsive behavior
            minHeight: '100vh',
        }, children: [_jsx("div", { className: "p-4 border-b border-sidebar-border flex-shrink-0", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-8 h-8 bg-primary rounded-lg flex items-center justify-center", children: _jsx(Brain, { className: "w-5 h-5 text-primary-foreground" }) }), !isCollapsed && (_jsxs("div", { children: [_jsx("h2", { className: "text-lg font-bold text-sidebar-foreground", children: "UrutiIQ" }), _jsx("p", { className: "text-xs text-muted-foreground", children: "AI Accounting" })] })), _jsx("button", { onClick: () => setIsCollapsed(!isCollapsed), className: "ml-auto p-1 hover:bg-sidebar-accent/50 rounded focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2", "aria-label": isCollapsed ? "Expand sidebar" : "Collapse sidebar", "aria-expanded": !isCollapsed, children: _jsx(ChevronRight, { className: cn("w-4 h-4 transition-transform", isCollapsed ? "rotate-0" : "rotate-180") }) })] }) }), !isCollapsed && (_jsxs("div", { className: "px-3 py-2 border-b border-sidebar-border flex-shrink-0", children: [_jsx("h3", { className: "text-xs font-medium text-muted-foreground mb-2", children: "Quick Access" }), _jsx("div", { className: "space-y-1", role: "list", "aria-label": "Quick access items", children: userPreferences.recentlyUsed.slice(0, 4).map((itemName) => {
                            const item = navigationItems.find((i) => i.name === itemName);
                            if (!item)
                                return null;
                            return (_jsxs(Link, { to: item.href, className: "flex items-center gap-2 px-2 py-1.5 text-xs rounded-md hover:bg-sidebar-accent/30 text-muted-foreground hover:text-sidebar-foreground focus:ring-2 focus:ring-cyan-500 focus:ring-offset-1", "data-sidebar-item": true, role: "listitem", "aria-label": `Quick access: ${itemName}`, onFocus: () => setFocusedElement("quick-access"), children: [_jsx(item.icon, { className: "w-3 h-3" }), _jsx("span", { className: "truncate", children: itemName })] }, itemName));
                        }) })] })), _jsx("nav", { className: "flex-1 overflow-y-auto px-3 py-4 space-y-1 sidebar-scrollbar min-h-0 max-h-full", role: "navigation", "aria-label": "Main menu", children: navigationItems.map((item) => {
                    const isActive = location.pathname === item.href ||
                        (item.href?.includes('?') && location.pathname === item.href?.split('?')[0]);
                    return (_jsxs(Link, { to: item.href, className: cn("flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors focus:ring-2 focus:ring-cyan-500 focus:ring-offset-1", isActive
                            ? "bg-blue-100 text-blue-700 font-medium border-l-2 border-blue-500"
                            : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"), "data-sidebar-item": true, "aria-current": isActive ? "page" : undefined, "aria-label": item.name, onFocus: () => setFocusedElement("nav-item"), children: [_jsx(item.icon, { className: "w-5 h-5 flex-shrink-0" }), !isCollapsed && _jsx("span", { className: "flex-1", children: item.name })] }, item.name));
                }) }), _jsx("div", { className: "p-4 border-t border-sidebar-border flex-shrink-0", children: !isCollapsed ? (_jsx("div", { className: "bg-card p-3 rounded-lg border border-border", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-8 h-8 bg-muted rounded-full flex items-center justify-center", children: _jsx("span", { className: "text-xs font-medium", children: "JD" }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "text-sm font-medium text-foreground truncate", children: "John Doe" }), _jsx("p", { className: "text-xs text-muted-foreground truncate", children: "Senior Accountant" })] }), _jsx("button", { className: "p-1 hover:bg-muted rounded focus:ring-2 focus:ring-cyan-500 focus:ring-offset-1", "aria-label": "User settings", "data-sidebar-item": true, children: _jsx(Settings, { className: "w-4 h-4" }) })] }) })) : (_jsx("div", { className: "flex justify-center", children: _jsx("button", { className: "w-8 h-8 bg-muted rounded-full flex items-center justify-center focus:ring-2 focus:ring-cyan-500 focus:ring-offset-1", "aria-label": "User profile: John Doe", "data-sidebar-item": true, children: _jsx("span", { className: "text-xs font-medium", children: "JD" }) }) })) })] }));
}
