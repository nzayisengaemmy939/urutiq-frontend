import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Plus, Eye, FolderOpen, FileText, BarChart3, TrendingUp, Activity, PieChart } from 'lucide-react';
export function TemplateManager({ templates, onCreateTemplate, onUseTemplate, onViewTemplate }) {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const getReportTypeIcon = (type) => {
        switch (type) {
            case 'balance_sheet':
                return _jsx(BarChart3, { className: "h-4 w-4" });
            case 'income_statement':
                return _jsx(TrendingUp, { className: "h-4 w-4" });
            case 'cash_flow':
                return _jsx(Activity, { className: "h-4 w-4" });
            case 'equity':
                return _jsx(PieChart, { className: "h-4 w-4" });
            default:
                return _jsx(FileText, { className: "h-4 w-4" });
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
                return 'Equity';
            default:
                return 'Custom';
        }
    };
    const filteredTemplates = selectedCategory === 'all'
        ? templates
        : templates.filter(template => template.category === selectedCategory);
    const categories = ['all', ...new Set(templates.map(t => t.category))];
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold", children: "Report Templates" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Pre-built templates to quickly create reports" })] }), _jsxs(Button, { onClick: onCreateTemplate, children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "Create Template"] })] }), _jsx("div", { className: "flex flex-wrap gap-2", children: categories.map((category) => (_jsx(Button, { variant: selectedCategory === category ? "default" : "outline", size: "sm", onClick: () => setSelectedCategory(category), children: category === 'all' ? 'All Categories' : category }, category))) }), _jsx("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-3", children: filteredTemplates.map((template) => (_jsxs(Card, { className: "hover:shadow-md transition-shadow", children: [_jsxs(CardHeader, { children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [getReportTypeIcon(template.type), _jsx(CardTitle, { className: "text-lg", children: template.name })] }), _jsx(Badge, { variant: template.isPublic ? "default" : "secondary", children: template.category })] }), _jsx(CardDescription, { children: template.description || `${getReportTypeLabel(template.type)} template` })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { children: "Type:" }), _jsx("span", { className: "font-medium", children: getReportTypeLabel(template.type) })] }), _jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { children: "Created by:" }), _jsx("span", { className: "font-medium", children: template.createdByUser.name })] }), _jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { children: "Visibility:" }), _jsx("span", { className: "font-medium", children: template.isPublic ? 'Public' : 'Private' })] })] }), _jsxs("div", { className: "flex items-center space-x-2 mt-4", children: [_jsxs(Button, { size: "sm", className: "flex-1", onClick: () => onUseTemplate(template.id), children: [_jsx(FolderOpen, { className: "h-4 w-4 mr-2" }), "Use Template"] }), _jsx(Button, { size: "sm", variant: "outline", onClick: () => onViewTemplate(template.id), children: _jsx(Eye, { className: "h-4 w-4" }) })] })] })] }, template.id))) }), filteredTemplates.length === 0 && (_jsxs("div", { className: "text-center py-8", children: [_jsx(FileText, { className: "h-12 w-12 mx-auto text-muted-foreground mb-4" }), _jsx("h3", { className: "text-lg font-semibold mb-2", children: "No templates found" }), _jsx("p", { className: "text-muted-foreground mb-4", children: selectedCategory === 'all'
                            ? "Create your first template to get started"
                            : `No templates found in the ${selectedCategory} category` }), _jsxs(Button, { onClick: onCreateTemplate, children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "Create Template"] })] }))] }));
}
