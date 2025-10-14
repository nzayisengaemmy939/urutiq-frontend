import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '@/lib/utils';
export function SegmentedTabs({ tabs, value, onChange, className }) {
    return (_jsx("div", { className: cn('bg-white rounded-lg shadow-sm border p-4', className), children: _jsx("div", { className: "flex space-x-6 overflow-x-auto", children: tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = value === tab.id;
                return (_jsxs("button", { onClick: () => onChange(tab.id), className: cn('flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap', isActive
                        ? 'border-purple-500 text-purple-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'), "aria-current": isActive ? 'page' : undefined, children: [Icon ? _jsx(Icon, { className: "w-4 h-4" }) : null, _jsx("span", { children: tab.label })] }, tab.id));
            }) }) }));
}
