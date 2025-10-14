import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Plus, Save, Eye, Trash2, GripVertical, BarChart3, TrendingUp, Activity, PieChart, FileText, Calculator } from 'lucide-react';
export function ReportBuilder({ onCreateReport, onSaveAsDraft }) {
    const [reportName, setReportName] = useState('');
    const [reportType, setReportType] = useState('');
    const [description, setDescription] = useState('');
    const [reportItems, setReportItems] = useState([]);
    const [selectedItemType, setSelectedItemType] = useState('');
    const reportTypes = [
        { value: 'balance_sheet', label: 'Balance Sheet', icon: BarChart3 },
        { value: 'income_statement', label: 'Income Statement', icon: TrendingUp },
        { value: 'cash_flow', label: 'Cash Flow', icon: Activity },
        { value: 'equity', label: 'Equity', icon: PieChart },
        { value: 'custom', label: 'Custom Report', icon: FileText }
    ];
    const itemTypes = [
        { value: 'account', label: 'Account', icon: FileText },
        { value: 'calculation', label: 'Calculation', icon: Calculator },
        { value: 'section', label: 'Section Header', icon: BarChart3 },
        { value: 'text', label: 'Text/Description', icon: FileText }
    ];
    const handleAddItem = () => {
        if (!selectedItemType)
            return;
        const newItem = {
            id: `item-${Date.now()}`,
            type: selectedItemType,
            name: `New ${selectedItemType}`,
            order: reportItems.length
        };
        setReportItems([...reportItems, newItem]);
        setSelectedItemType('');
    };
    const handleRemoveItem = (itemId) => {
        setReportItems(reportItems.filter(item => item.id !== itemId));
    };
    const handleMoveItem = (itemId, direction) => {
        const itemIndex = reportItems.findIndex(item => item.id === itemId);
        if (itemIndex === -1)
            return;
        const newItems = [...reportItems];
        const targetIndex = direction === 'up' ? itemIndex - 1 : itemIndex + 1;
        if (targetIndex >= 0 && targetIndex < newItems.length) {
            [newItems[itemIndex], newItems[targetIndex]] = [newItems[targetIndex], newItems[itemIndex]];
            setReportItems(newItems);
        }
    };
    const handleCreateReport = () => {
        if (!reportName || !reportType) {
            alert('Please fill in report name and type');
            return;
        }
        const reportData = {
            name: reportName,
            type: reportType,
            description,
            items: reportItems,
            createdAt: new Date().toISOString()
        };
        onCreateReport(reportData);
    };
    const handleSaveDraft = () => {
        const reportData = {
            name: reportName || 'Untitled Report',
            type: reportType || 'custom',
            description,
            items: reportItems,
            status: 'draft',
            createdAt: new Date().toISOString()
        };
        onSaveAsDraft(reportData);
    };
    const getReportTypeIcon = (type) => {
        const reportType = reportTypes.find(rt => rt.value === type);
        return reportType ? _jsx(reportType.icon, { className: "h-4 w-4" }) : _jsx(FileText, { className: "h-4 w-4" });
    };
    const getItemTypeIcon = (type) => {
        const itemType = itemTypes.find(it => it.value === type);
        return itemType ? _jsx(itemType.icon, { className: "h-4 w-4" }) : _jsx(FileText, { className: "h-4 w-4" });
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Report Builder" }), _jsx(CardDescription, { children: "Create custom financial reports with drag-and-drop interface" })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: "grid gap-6 md:grid-cols-2", children: [_jsxs("div", { className: "space-y-4", children: [_jsx("h4", { className: "font-semibold", children: "Report Configuration" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium", children: "Report Name" }), _jsx(Input, { placeholder: "Enter report name", value: reportName, onChange: (e) => setReportName(e.target.value) })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium", children: "Report Type" }), _jsxs(Select, { value: reportType, onValueChange: setReportType, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select report type" }) }), _jsx(SelectContent, { children: reportTypes.map((type) => (_jsx(SelectItem, { value: type.value, children: _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(type.icon, { className: "h-4 w-4" }), _jsx("span", { children: type.label })] }) }, type.value))) })] })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium", children: "Description" }), _jsx(Input, { placeholder: "Enter description", value: description, onChange: (e) => setDescription(e.target.value) })] })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsx("h4", { className: "font-semibold", children: "Report Items" }), _jsx("div", { className: "border rounded-lg p-4 min-h-[200px] max-h-[400px] overflow-y-auto", children: reportItems.length === 0 ? (_jsx("p", { className: "text-muted-foreground text-center py-8", children: "Drag and drop items here to build your report" })) : (_jsx("div", { className: "space-y-2", children: reportItems.map((item, index) => (_jsxs("div", { className: "flex items-center justify-between p-2 border rounded bg-gray-50", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(GripVertical, { className: "h-4 w-4 text-gray-400 cursor-move" }), getItemTypeIcon(item.type), _jsx("span", { className: "text-sm font-medium", children: item.name }), _jsx(Badge, { variant: "outline", className: "text-xs", children: item.type })] }), _jsxs("div", { className: "flex items-center space-x-1", children: [_jsx(Button, { size: "sm", variant: "ghost", onClick: () => handleMoveItem(item.id, 'up'), disabled: index === 0, children: "\u2191" }), _jsx(Button, { size: "sm", variant: "ghost", onClick: () => handleMoveItem(item.id, 'down'), disabled: index === reportItems.length - 1, children: "\u2193" }), _jsx(Button, { size: "sm", variant: "ghost", onClick: () => handleRemoveItem(item.id), children: _jsx(Trash2, { className: "h-3 w-3" }) })] })] }, item.id))) })) }), _jsxs("div", { className: "flex space-x-2", children: [_jsxs(Select, { value: selectedItemType, onValueChange: setSelectedItemType, children: [_jsx(SelectTrigger, { className: "flex-1", children: _jsx(SelectValue, { placeholder: "Select item type" }) }), _jsx(SelectContent, { children: itemTypes.map((type) => (_jsx(SelectItem, { value: type.value, children: _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(type.icon, { className: "h-4 w-4" }), _jsx("span", { children: type.label })] }) }, type.value))) })] }), _jsxs(Button, { onClick: handleAddItem, disabled: !selectedItemType, children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "Add Item"] })] })] })] }), _jsxs("div", { className: "flex items-center justify-end space-x-2 pt-4 border-t", children: [_jsxs(Button, { variant: "outline", onClick: handleSaveDraft, children: [_jsx(Save, { className: "h-4 w-4 mr-2" }), "Save as Draft"] }), _jsxs(Button, { onClick: handleCreateReport, children: [_jsx(Eye, { className: "h-4 w-4 mr-2" }), "Create Report"] })] })] })] }), reportItems.length > 0 && (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center space-x-2", children: [getReportTypeIcon(reportType), _jsx("span", { children: "Report Preview" })] }), _jsx(CardDescription, { children: "Preview of your report structure" })] }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-2", children: reportItems.map((item, index) => (_jsxs("div", { className: "flex items-center space-x-2 text-sm", children: [_jsxs("span", { className: "text-muted-foreground", children: [index + 1, "."] }), getItemTypeIcon(item.type), _jsx("span", { children: item.name }), _jsx(Badge, { variant: "outline", className: "text-xs", children: item.type })] }, item.id))) }) })] }))] }));
}
