import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";
import { Badge } from "../components/ui/badge";
import { CheckSquare, Trash2, Tag, Building2, Download, Upload, Zap, MoreHorizontal } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";
const bulkActions = [
    { id: "categorize", label: "Bulk Categorize", icon: Tag, description: "Apply category to selected items" },
    { id: "assign-client", label: "Assign Client", icon: Building2, description: "Assign client to transactions" },
    { id: "export", label: "Export Selected", icon: Download, description: "Export selected items to CSV" },
    { id: "duplicate", label: "Duplicate", icon: Upload, description: "Create copies of selected items" },
    { id: "delete", label: "Delete Selected", icon: Trash2, description: "Remove selected items", destructive: true },
];
export function BulkActions({ selectedItems, totalItems, onSelectAll, onClearSelection, onBulkAction, }) {
    const [showActions, setShowActions] = useState(false);
    if (selectedItems.length === 0) {
        return null;
    }
    return (_jsx(Card, { className: "bg-cyan-50 border-cyan-200", children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Checkbox, { checked: selectedItems.length === totalItems, onCheckedChange: (checked) => (checked ? onSelectAll() : onClearSelection()) }), _jsxs("span", { className: "text-sm font-medium", children: [selectedItems.length, " of ", totalItems, " selected"] })] }), _jsxs(Badge, { variant: "secondary", className: "bg-cyan-100 text-cyan-700", children: [_jsx(Zap, { className: "w-3 h-3 mr-1" }), "Bulk Actions Available"] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Button, { variant: "ghost", size: "sm", onClick: onClearSelection, children: "Clear Selection" }), _jsxs(Popover, { open: showActions, onOpenChange: setShowActions, children: [_jsx(PopoverTrigger, { asChild: true, children: _jsxs(Button, { variant: "outline", size: "sm", className: "gap-2 bg-transparent", children: [_jsx(CheckSquare, { className: "w-4 h-4" }), "Bulk Actions", _jsx(MoreHorizontal, { className: "w-3 h-3" })] }) }), _jsx(PopoverContent, { className: "w-80 p-0", align: "end", children: _jsxs("div", { className: "p-2", children: [_jsxs("div", { className: "text-sm font-medium text-foreground mb-2 px-2", children: ["Actions for ", selectedItems.length, " items"] }), _jsx("div", { className: "space-y-1", children: bulkActions.map((action) => (_jsxs("button", { onClick: () => {
                                                            onBulkAction(action.id);
                                                            setShowActions(false);
                                                        }, className: `w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors text-left ${action.destructive ? "hover:bg-red-50 hover:text-red-700" : "hover:bg-muted text-foreground"}`, children: [_jsx(action.icon, { className: "w-4 h-4 flex-shrink-0" }), _jsxs("div", { children: [_jsx("div", { className: "font-medium", children: action.label }), _jsx("div", { className: "text-xs text-muted-foreground", children: action.description })] })] }, action.id))) })] }) })] })] })] }) }) }));
}
