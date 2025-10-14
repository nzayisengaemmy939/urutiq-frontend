import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, FileText, CreditCard, Settings, Bell, LogOut, Menu, X, Home, User } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
export function SupplierPortalLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const handleLogout = async () => {
        await logout();
        navigate('/supplier-portal/login');
    };
    const navigation = [
        { name: 'Dashboard', href: '/dashboard/supplier-portal', icon: Home },
        { name: 'Invoices', href: '/dashboard/supplier-portal?tab=invoices', icon: FileText },
        { name: 'Payments', href: '/dashboard/supplier-portal?tab=payments', icon: CreditCard },
        { name: 'Profile', href: '/dashboard/supplier-portal?tab=profile', icon: User },
        { name: 'Settings', href: '/dashboard/supplier-portal?tab=settings', icon: Settings },
    ];
    return (_jsxs("div", { className: "min-h-screen bg-gray-50", children: [_jsxs("div", { className: `fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`, children: [_jsx("div", { className: "fixed inset-0 bg-gray-600 bg-opacity-75", onClick: () => setSidebarOpen(false) }), _jsxs("div", { className: "fixed inset-y-0 left-0 flex w-64 flex-col bg-white shadow-xl", children: [_jsxs("div", { className: "flex h-16 items-center justify-between px-4", children: [_jsxs("div", { className: "flex items-center", children: [_jsx(Building2, { className: "h-8 w-8 text-blue-600" }), _jsx("span", { className: "ml-2 text-lg font-semibold", children: "Supplier Portal" })] }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => setSidebarOpen(false), children: _jsx(X, { className: "h-5 w-5" }) })] }), _jsx("nav", { className: "flex-1 space-y-1 px-2 py-4", children: navigation.map((item) => (_jsxs(Button, { variant: "ghost", className: "w-full justify-start", onClick: () => {
                                        navigate(item.href);
                                        setSidebarOpen(false);
                                    }, children: [_jsx(item.icon, { className: "mr-3 h-5 w-5" }), item.name] }, item.name))) })] })] }), _jsx("div", { className: "hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col", children: _jsxs("div", { className: "flex flex-col flex-grow bg-white border-r border-gray-200", children: [_jsxs("div", { className: "flex h-16 items-center px-4", children: [_jsx(Building2, { className: "h-8 w-8 text-blue-600" }), _jsx("span", { className: "ml-2 text-lg font-semibold", children: "Supplier Portal" })] }), _jsx("nav", { className: "flex-1 space-y-1 px-2 py-4", children: navigation.map((item) => (_jsxs(Button, { variant: "ghost", className: "w-full justify-start", onClick: () => navigate(item.href), children: [_jsx(item.icon, { className: "mr-3 h-5 w-5" }), item.name] }, item.name))) }), _jsxs("div", { className: "border-t border-gray-200 p-4", children: [_jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("div", { className: "h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center", children: _jsx(User, { className: "h-5 w-5 text-blue-600" }) }) }), _jsxs("div", { className: "ml-3 flex-1", children: [_jsx("p", { className: "text-sm font-medium text-gray-700", children: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : 'Supplier User' }), _jsx("p", { className: "text-xs text-gray-500", children: user?.email || 'supplier@example.com' })] })] }), _jsxs(Button, { variant: "ghost", size: "sm", className: "w-full mt-2", onClick: handleLogout, children: [_jsx(LogOut, { className: "mr-2 h-4 w-4" }), "Sign out"] })] })] }) }), _jsxs("div", { className: "lg:pl-64", children: [_jsxs("div", { className: "sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8", children: [_jsx(Button, { variant: "ghost", size: "sm", className: "lg:hidden", onClick: () => setSidebarOpen(true), children: _jsx(Menu, { className: "h-5 w-5" }) }), _jsxs("div", { className: "flex flex-1 gap-x-4 self-stretch lg:gap-x-6", children: [_jsx("div", { className: "flex flex-1" }), _jsxs("div", { className: "flex items-center gap-x-4 lg:gap-x-6", children: [_jsx(Button, { variant: "ghost", size: "sm", children: _jsx(Bell, { className: "h-5 w-5" }) }), _jsx("div", { className: "hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" }), _jsxs("div", { className: "flex items-center gap-x-2", children: [_jsx(Badge, { variant: "outline", className: "text-xs", children: "Supplier" }), _jsx("div", { className: "hidden lg:block", children: _jsx("p", { className: "text-sm font-medium text-gray-700", children: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : 'Supplier User' }) })] })] })] })] }), _jsx("main", { className: "py-6", children: _jsx("div", { className: "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8", children: _jsx(Outlet, {}) }) })] })] }));
}
