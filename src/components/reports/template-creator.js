import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Save, X, FileText, BarChart3, TrendingUp, Activity, PieChart, Plus, Trash2 } from 'lucide-react';
export function TemplateCreator({ onSaveTemplate, onCancel }) {
    const [templateName, setTemplateName] = useState('');
    const [templateType, setTemplateType] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [isPublic, setIsPublic] = useState(false);
    const [templateItems, setTemplateItems] = useState([]);
    const [selectedItemType, setSelectedItemType] = useState('');
    const templateTypes = [
        { value: 'balance_sheet', label: 'Balance Sheet', icon: BarChart3 },
        { value: 'income_statement', label: 'Income Statement', icon: TrendingUp },
        { value: 'cash_flow', label: 'Cash Flow', icon: Activity },
        { value: 'equity', label: 'Equity', icon: PieChart },
        { value: 'custom', label: 'Custom Template', icon: FileText }
    ];
    const categories = [
        'Standard',
        'Custom',
        'Industry Specific',
        'Management',
        'Compliance',
        'Tax'
    ];
    const itemTypes = [
        { value: 'account', label: 'Account', icon: FileText },
        { value: 'calculation', label: 'Calculation', icon: BarChart3 },
        { value: 'section', label: 'Section Header', icon: BarChart3 },
        { value: 'text', label: 'Text/Description', icon: FileText }
    ];
    const handleAddItem = () => {
        if (!selectedItemType)
            return;
        const newItem = {
            id: `item-${Date.now()}`,
            type: selectedItemType,
            name: `New ${selectedItemType}`
        };
        setTemplateItems([...templateItems, newItem]);
        setSelectedItemType('');
    };
    const handleRemoveItem = (itemId) => {
        setTemplateItems(templateItems.filter(item => item.id !== itemId));
    };
    const handleSaveTemplate = () => {
        if (!templateName || !templateType || !category) {
            alert('Please fill in template name, type, and category');
            return;
        }
        const templateData = {
            name: templateName,
            type: templateType,
            category,
            description,
            isPublic,
            items: templateItems,
            createdAt: new Date().toISOString()
        };
        onSaveTemplate(templateData);
    };
    const getTemplateTypeIcon = (type) => {
        const templateType = templateTypes.find(tt => tt.value === type);
        return templateType ? _jsx(templateType.icon, { className: "h-4 w-4" }) : _jsx(FileText, { className: "h-4 w-4" });
    };
    const getItemTypeIcon = (type) => {
        const itemType = itemTypes.find(it => it.value === type);
        return itemType ? _jsx(itemType.icon, { className: "h-4 w-4" }) : _jsx(FileText, { className: "h-4 w-4" });
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx(CardTitle, { children: "Create Template" }), _jsx(CardDescription, { children: "Create a reusable report template" })] }), _jsx(Button, { variant: "outline", onClick: onCancel, children: _jsx(X, { className: "h-4 w-4" }) })] }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "grid gap-6 md:grid-cols-2", children: [_jsxs("div", { className: "space-y-4", children: [_jsx("h4", { className: "font-semibold", children: "Template Configuration" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium", children: "Template Name" }), _jsx(Input, { placeholder: "Enter template name", value: templateName, onChange: (e) => setTemplateName(e.target.value) })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium", children: "Template Type" }), _jsxs(Select, { value: templateType, onValueChange: setTemplateType, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select template type" }) }), _jsx(SelectContent, { children: templateTypes.map((type) => (_jsx(SelectItem, { value: type.value, children: _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(type.icon, { className: "h-4 w-4" }), _jsx("span", { children: type.label })] }) }, type.value))) })] })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium", children: "Category" }), _jsxs(Select, { value: category, onValueChange: setCategory, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select category" }) }), _jsx(SelectContent, { children: categories.map((cat) => (_jsx(SelectItem, { value: cat, children: cat }, cat))) })] })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium", children: "Description" }), _jsx(Input, { placeholder: "Enter description", value: description, onChange: (e) => setDescription(e.target.value) })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("input", { type: "checkbox", id: "isPublic", checked: isPublic, onChange: (e) => setIsPublic(e.target.checked) }), _jsx("label", { htmlFor: "isPublic", className: "text-sm font-medium", children: "Make this template public" })] })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsx("h4", { className: "font-semibold", children: "Template Items" }), _jsx("div", { className: "border rounded-lg p-4 min-h-[200px] max-h-[400px] overflow-y-auto", children: templateItems.length === 0 ? (_jsx("p", { className: "text-muted-foreground text-center py-8", children: "Add items to build your template" })) : (_jsx("div", { className: "space-y-2", children: templateItems.map((item, index) => (_jsxs("div", { className: "flex items-center justify-between p-2 border rounded bg-gray-50", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsxs("span", { className: "text-sm text-muted-foreground", children: [index + 1, "."] }), getItemTypeIcon(item.type), _jsx("span", { className: "text-sm font-medium", children: item.name }), _jsx(Badge, { variant: "outline", className: "text-xs", children: item.type })] }), _jsx(Button, { size: "sm", variant: "ghost", onClick: () => handleRemoveItem(item.id), children: _jsx(Trash2, { className: "h-3 w-3" }) })] }, item.id))) })) }), _jsxs("div", { className: "flex space-x-2", children: [_jsxs(Select, { value: selectedItemType, onValueChange: setSelectedItemType, children: [_jsx(SelectTrigger, { className: "flex-1", children: _jsx(SelectValue, { placeholder: "Select item type" }) }), _jsx(SelectContent, { children: itemTypes.map((type) => (_jsx(SelectItem, { value: type.value, children: _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(type.icon, { className: "h-4 w-4" }), _jsx("span", { children: type.label })] }) }, type.value))) })] }), _jsxs(Button, { onClick: handleAddItem, disabled: !selectedItemType, children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "Add Item"] })] })] })] }), _jsxs("div", { className: "flex items-center justify-end space-x-2 pt-4 border-t", children: [_jsx(Button, { variant: "outline", onClick: onCancel, children: "Cancel" }), _jsxs(Button, { onClick: handleSaveTemplate, children: [_jsx(Save, { className: "h-4 w-4 mr-2" }), "Save Template"] })] })] })] }), templateItems.length > 0 && (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center space-x-2", children: [getTemplateTypeIcon(templateType), _jsx("span", { children: "Template Preview" })] }), _jsx(CardDescription, { children: "Preview of your template structure" })] }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-2", children: templateItems.map((item, index) => (_jsxs("div", { className: "flex items-center space-x-2 text-sm", children: [_jsxs("span", { className: "text-muted-foreground", children: [index + 1, "."] }), getItemTypeIcon(item.type), _jsx("span", { children: item.name }), _jsx(Badge, { variant: "outline", className: "text-xs", children: item.type })] }, item.id))) }) })] }))] }));
}
