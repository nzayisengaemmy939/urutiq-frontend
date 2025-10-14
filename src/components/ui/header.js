import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Bell } from 'lucide-react';
import { Button } from './button';
export function Header() {
    return (_jsx("header", { className: "bg-white shadow-sm border-b border-gray-200", children: _jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: _jsxs("div", { className: "flex justify-between items-center h-16", children: [_jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("h1", { className: "text-xl font-bold text-gray-900 md:hidden", children: "UrutiIQ" }) }), _jsx("div", { className: "hidden md:ml-6 md:flex md:space-x-8" })] }), _jsxs("div", { className: "flex items-center space-x-4", children: [_jsx(Button, { variant: "ghost", size: "sm", children: _jsx(Bell, { className: "h-5 w-5" }) }), _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "w-8 h-8 bg-gray-300 rounded-full" }), _jsx("span", { className: "text-sm font-medium text-gray-700", children: "Demo User" })] })] })] }) }) }));
}
