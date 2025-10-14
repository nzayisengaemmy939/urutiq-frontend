import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Keyboard, Search, Plus, Calculator, FileText, BarChart3, Brain, Settings } from "lucide-react";
import { Button } from "../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Badge } from "../components/ui/badge";
const shortcuts = [
    // Navigation
    { key: "Ctrl + /", description: "Search sidebar menu", category: "Navigation", icon: Search },
    { key: "Ctrl + K", description: "Open global search", category: "Navigation", icon: Search },
    { key: "Ctrl + N", description: "Quick add transaction", category: "Navigation", icon: Plus },
    // Quick Actions
    { key: "Ctrl + E", description: "Record expense", category: "Quick Actions", icon: Calculator },
    { key: "Ctrl + I", description: "Create invoice", category: "Quick Actions", icon: FileText },
    { key: "Ctrl + R", description: "Generate report", category: "Quick Actions", icon: BarChart3 },
    // AI Features
    { key: "Ctrl + A", description: "Open AI insights", category: "AI Features", icon: Brain },
    // System
    { key: "Ctrl + ,", description: "Open settings", category: "System", icon: Settings },
    { key: "Escape", description: "Close modal/dialog", category: "System", icon: Settings },
];
const categories = ["Navigation", "Quick Actions", "AI Features", "System"];
export function KeyboardShortcuts() {
    const [open, setOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState("all");
    const filteredShortcuts = selectedCategory === "all"
        ? shortcuts
        : shortcuts.filter(shortcut => shortcut.category === selectedCategory);
    return (_jsxs(Dialog, { open: open, onOpenChange: setOpen, children: [_jsx(DialogTrigger, { asChild: true, children: _jsxs(Button, { variant: "ghost", size: "sm", className: "text-xs", children: [_jsx(Keyboard, { className: "h-3 w-3 mr-1" }), "Shortcuts"] }) }), _jsxs(DialogContent, { className: "max-w-2xl", children: [_jsx(DialogHeader, { children: _jsxs(DialogTitle, { className: "flex items-center gap-2", children: [_jsx(Keyboard, { className: "h-5 w-5" }), "Keyboard Shortcuts"] }) }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { variant: selectedCategory === "all" ? "default" : "outline", size: "sm", onClick: () => setSelectedCategory("all"), children: "All" }), categories.map(category => (_jsx(Button, { variant: selectedCategory === category ? "default" : "outline", size: "sm", onClick: () => setSelectedCategory(category), children: category }, category)))] }), _jsx("div", { className: "grid gap-3", children: filteredShortcuts.map((shortcut, index) => (_jsxs("div", { className: "flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center", children: _jsx(shortcut.icon, { className: "h-4 w-4 text-primary" }) }), _jsxs("div", { children: [_jsx("p", { className: "font-medium text-sm", children: shortcut.description }), _jsx(Badge, { variant: "outline", className: "text-xs mt-1", children: shortcut.category })] })] }), _jsx("kbd", { className: "text-xs bg-muted px-2 py-1 rounded font-mono", children: shortcut.key })] }, index))) }), _jsxs("div", { className: "p-4 bg-cyan-50 border border-cyan-200 rounded-lg", children: [_jsx("h4", { className: "font-medium text-cyan-800 mb-2", children: "\uD83D\uDCA1 Tips" }), _jsxs("ul", { className: "text-sm text-cyan-700 space-y-1", children: [_jsx("li", { children: "\u2022 Use Ctrl + / to quickly search the sidebar menu" }), _jsx("li", { children: "\u2022 Press Ctrl + K to open global search from anywhere" }), _jsx("li", { children: "\u2022 Most shortcuts work from any page in the application" }), _jsx("li", { children: "\u2022 Hover over buttons to see tooltips with shortcuts" })] })] })] })] })] }));
}
