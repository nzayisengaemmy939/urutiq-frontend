import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { useSidebar } from '../contexts/sidebar-context';
export default function Layout() {
    const { isCollapsed } = useSidebar();
    const location = useLocation();
    const isPOSPage = location.pathname === '/pos';
    return (_jsxs("div", { className: "min-h-screen bg-background", children: [_jsx(Sidebar, {}), _jsxs("div", { className: `flex flex-col min-h-screen transition-all duration-300 ${isCollapsed ? 'ml-16' : 'ml-64'}`, children: [_jsx(Header, {}), _jsx("main", { className: isPOSPage
                            ? "flex-1 overflow-hidden pt-20 h-screen"
                            : "flex-1 overflow-y-auto pb-6 pt-20", id: "main-content", children: _jsx(Outlet, {}) })] })] }));
}
