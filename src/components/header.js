import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Brain, Search, Bell, Settings, User, LogOut } from "lucide-react";
import React from "react";
import { GlobalSearch } from "./global-search";
import { MobileNavigation } from "./mobile-navigation";
import { useAuth } from "../contexts/auth-context";
import { useSidebar } from "../contexts/sidebar-context";
import { Button } from "./ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiService } from "../lib/api";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
export function Header() {
    const { user, logout, isAuthenticated, isLoading } = useAuth();
    const { isCollapsed } = useSidebar();
    const [mounted, setMounted] = React.useState(false);
    React.useEffect(() => setMounted(true), []);
    const qc = useQueryClient();
    React.useEffect(() => {
        console.log('🔐 Header - Auth state:', { isAuthenticated, user, isLoading });
    }, [isAuthenticated, user, isLoading]);
    const { data: companies } = useQuery({
        queryKey: ['companies'],
        queryFn: async () => {
            const result = await apiService.getCompanies();
            console.log('🏢 Header - Companies API response:', result);
            // Handle different response formats
            if (Array.isArray(result)) {
                console.log('✅ Header - Returning array directly:', result.length, 'companies');
                return result;
            }
            if (result?.data && Array.isArray(result.data)) {
                console.log('✅ Header - Returning result.data:', result.data.length, 'companies');
                return result.data;
            }
            if (result?.items && Array.isArray(result.items)) {
                console.log('✅ Header - Returning result.items:', result.items.length, 'companies');
                return result.items;
            }
            console.log('⚠️ Header - No companies found, returning empty array');
            return [];
        },
        enabled: isAuthenticated
    });
    const companiesList = React.useMemo(() => {
        console.log('🏢 Header - companiesList memo:', companies);
        if (!companies)
            return [];
        if (Array.isArray(companies))
            return companies;
        if (companies.data && Array.isArray(companies.data))
            return companies.data;
        return [];
    }, [companies]);
    const [activeCompany, setActiveCompany] = React.useState(undefined);
    React.useEffect(() => {
        if (!mounted)
            return;
        try {
            const c = localStorage.getItem('company_id') || localStorage.getItem('companyId') || localStorage.getItem('company');
            if (c)
                setActiveCompany(c);
        }
        catch { }
    }, [mounted]);
    const onCompanyChange = (e) => {
        const id = e.target.value;
        console.log('🔄 Company changing from', activeCompany, 'to', id);
        setActiveCompany(id);
        try {
            localStorage.setItem('company_id', id);
            // Also set the other keys for compatibility
            localStorage.setItem('companyId', id);
            localStorage.setItem('company', id);
            console.log('✅ Company ID saved to localStorage:', id);
        }
        catch (error) {
            console.error('❌ Error saving company ID:', error);
        }
        // Invalidate all queries to force refetch with new company ID
        try {
            qc.invalidateQueries();
            // Also clear the cache to ensure fresh data
            qc.clear();
            console.log('✅ React Query cache cleared');
            // Dispatch custom event for pages that don't use React Query
            const event = new CustomEvent('companyChanged', {
                detail: { companyId: id, oldCompanyId: activeCompany }
            });
            window.dispatchEvent(event);
            console.log('✅ Company change event dispatched');
        }
        catch (error) {
            console.error('❌ Error clearing cache:', error);
        }
    };
    if (!mounted) {
        return (_jsx("header", { className: `fixed top-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border transition-all duration-300 ${isCollapsed ? 'left-16' : 'left-64'}`, suppressHydrationWarning: true, children: _jsx("div", { className: "h-14 lg:h-16" }) }));
    }
    // Don't render if auth is still loading
    if (isLoading) {
        return (_jsxs("header", { className: "h-16 bg-white border-b border-gray-200 px-4 flex items-center justify-between", children: [_jsx("div", { className: "flex items-center space-x-4", children: _jsx("div", { className: "h-8 w-8 bg-gray-200 rounded animate-pulse" }) }), _jsx("div", { className: "flex items-center space-x-4", children: _jsx("div", { className: "h-8 w-8 bg-gray-200 rounded-full animate-pulse" }) })] }));
    }
    return (_jsxs("header", { className: `fixed top-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border transition-all duration-300 ${isCollapsed ? 'left-16' : 'left-64'}`, children: [_jsxs("div", { className: "flex items-center justify-between px-4 py-3 lg:px-6 lg:py-4", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-8 h-8 bg-primary rounded-lg flex items-center justify-center", children: _jsx(Brain, { className: "w-5 h-5 text-primary-foreground" }) }), _jsxs("div", { className: "hidden sm:block", children: [_jsx("h1", { className: "text-lg font-bold text-foreground", children: "UrutiIQ" }), _jsx("p", { className: "text-xs text-muted-foreground", children: "AI Accounting" })] })] }), _jsxs("div", { className: "hidden md:flex items-center gap-4 flex-1 max-w-2xl mx-8", children: [_jsx("div", { className: "flex-1", children: _jsx(GlobalSearch, {}) }), _jsxs("select", { value: activeCompany, onChange: onCompanyChange, className: "px-3 py-2 bg-card border border-border rounded-lg text-sm focus:ring-2 focus:ring-border focus:border-border min-w-[200px]", children: [!companiesList.length && _jsx("option", { value: "", children: "No companies" }), companiesList.map((c) => (_jsx("option", { value: c.id, children: c.name }, c.id)))] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { className: "p-2 hover:bg-muted rounded-lg transition-colors", children: _jsx(Search, { className: "w-4 h-4 md:hidden" }) }), _jsxs("button", { className: "p-2 hover:bg-muted rounded-lg transition-colors relative", children: [_jsx(Bell, { className: "w-4 h-4" }), _jsx("span", { className: "absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" })] }), _jsx("button", { className: "p-2 hover:bg-muted rounded-lg transition-colors", children: _jsx(Settings, { className: "w-4 h-4" }) }), user ? (_jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsx(Button, { variant: "ghost", className: "relative h-8 w-8 rounded-full", children: _jsxs(Avatar, { className: "h-8 w-8", children: [_jsx(AvatarImage, { src: "", alt: user.firstName }), _jsxs(AvatarFallback, { children: [user.firstName.charAt(0), user.lastName.charAt(0)] })] }) }) }), _jsxs(DropdownMenuContent, { className: "w-56", align: "end", forceMount: true, children: [_jsx(DropdownMenuLabel, { className: "font-normal", children: _jsxs("div", { className: "flex flex-col space-y-1", children: [_jsxs("p", { className: "text-sm font-medium leading-none", children: [user.firstName, " ", user.lastName] }), _jsx("p", { className: "text-xs leading-none text-muted-foreground", children: user.email }), _jsx("p", { className: "text-xs leading-none text-muted-foreground", children: user.companyName })] }) }), _jsx(DropdownMenuSeparator, {}), _jsxs(DropdownMenuItem, { children: [_jsx(User, { className: "mr-2 h-4 w-4" }), _jsx("span", { children: "Profile" })] }), _jsxs(DropdownMenuItem, { children: [_jsx(Settings, { className: "mr-2 h-4 w-4" }), _jsx("span", { children: "Settings" })] }), _jsx(DropdownMenuSeparator, {}), _jsxs(DropdownMenuItem, { onClick: () => logout(), children: [_jsx(LogOut, { className: "mr-2 h-4 w-4" }), _jsx("span", { children: "Log out" })] })] })] })) : (_jsx(Button, { variant: "ghost", size: "sm", children: _jsx(User, { className: "w-4 h-4" }) })), _jsx("div", { className: "md:hidden", children: _jsx(MobileNavigation, {}) })] })] }), mounted && companiesList.length === 0 && (_jsx("div", { className: "px-4 lg:px-6 pb-3", children: _jsxs(Alert, { children: [_jsx(AlertTitle, { children: "No company found" }), _jsx(AlertDescription, { children: "Create a company to start recording transactions. Go to Settings to add your first company." })] }) }))] }));
}
