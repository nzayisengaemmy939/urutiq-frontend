import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './dialog';
import { Button } from './button';
import { Badge } from './badge';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { FileText, BarChart3, TrendingUp, Activity, PieChart, User, Calendar, X, Share2, Lock } from 'lucide-react';
export function TemplateDetailsModal({ isOpen, onClose, template }) {
    if (!template)
        return null;
    const getReportTypeIcon = (type) => {
        switch (type) {
            case 'balance_sheet':
                return _jsx(BarChart3, { className: "h-5 w-5 text-blue-600" });
            case 'income_statement':
                return _jsx(TrendingUp, { className: "h-5 w-5 text-green-600" });
            case 'cash_flow':
                return _jsx(Activity, { className: "h-5 w-5 text-purple-600" });
            case 'equity':
                return _jsx(PieChart, { className: "h-5 w-5 text-orange-600" });
            case 'custom':
                return _jsx(FileText, { className: "h-5 w-5 text-gray-600" });
            default:
                return _jsx(FileText, { className: "h-5 w-5 text-gray-600" });
        }
    };
    const getReportTypeLabel = (type) => {
        switch (type) {
            case 'balance_sheet':
                return 'Balance Sheet';
            case 'income_statement':
                return 'Income Statement';
            case 'cash_flow':
                return 'Cash Flow';
            case 'equity':
                return 'Equity Report';
            case 'custom':
                return 'Custom Report';
            default:
                return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
        }
    };
    return (_jsx(Dialog, { open: isOpen, onOpenChange: onClose, children: _jsxs(DialogContent, { className: "sm:max-w-[600px] max-h-[90vh] flex flex-col", children: [_jsxs(DialogHeader, { className: "flex-shrink-0", children: [_jsxs(DialogTitle, { className: "flex items-center gap-3", children: [getReportTypeIcon(template.type), _jsx("span", { children: template.name })] }), _jsx(DialogDescription, { children: "Template details and configuration" })] }), _jsxs("div", { className: "relative flex-1 overflow-y-auto space-y-6 pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-lg", children: "Template Overview" }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-muted-foreground", children: "Type" }), _jsxs("div", { className: "flex items-center gap-2 mt-1", children: [getReportTypeIcon(template.type), _jsx("span", { className: "font-medium", children: getReportTypeLabel(template.type) })] })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-muted-foreground", children: "Category" }), _jsx("div", { className: "mt-1", children: _jsx(Badge, { variant: "outline", children: template.category }) })] })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-muted-foreground", children: "Description" }), _jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: template.description || 'No description provided' })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-sm font-medium text-muted-foreground", children: "Visibility:" }), template.isPublic ? (_jsxs(Badge, { variant: "secondary", className: "flex items-center gap-1", children: [_jsx(Share2, { className: "h-3 w-3" }), "Public"] })) : (_jsxs(Badge, { variant: "outline", className: "flex items-center gap-1", children: [_jsx(Lock, { className: "h-3 w-3" }), "Private"] }))] })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-lg", children: "Creator Information" }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center", children: _jsx(User, { className: "h-5 w-5 text-primary" }) }), _jsxs("div", { children: [_jsx("p", { className: "font-medium", children: template.createdByUser.name }), _jsx("p", { className: "text-sm text-muted-foreground", children: template.createdByUser.email })] })] }), template.createdAt && (_jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground", children: [_jsx(Calendar, { className: "h-4 w-4" }), _jsxs("span", { children: ["Created: ", new Date(template.createdAt).toLocaleDateString()] })] })), template.updatedAt && (_jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground", children: [_jsx(Calendar, { className: "h-4 w-4" }), _jsxs("span", { children: ["Updated: ", new Date(template.updatedAt).toLocaleDateString()] })] }))] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-lg", children: "Template Configuration" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-sm text-muted-foreground", children: "Template ID:" }), _jsx("span", { className: "text-sm font-mono", children: template.id })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-sm text-muted-foreground", children: "Report Type:" }), _jsx("span", { className: "text-sm", children: getReportTypeLabel(template.type) })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-sm text-muted-foreground", children: "Category:" }), _jsx("span", { className: "text-sm", children: template.category })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-sm text-muted-foreground", children: "Visibility:" }), _jsx("span", { className: "text-sm", children: template.isPublic ? 'Public' : 'Private' })] })] }) })] })] }), _jsx("div", { className: "flex justify-end gap-2 pt-4 border-t flex-shrink-0", children: _jsxs(Button, { variant: "outline", onClick: onClose, children: [_jsx(X, { className: "h-4 w-4 mr-2" }), "Close"] }) })] }) }));
}
