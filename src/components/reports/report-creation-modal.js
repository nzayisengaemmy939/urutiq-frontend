import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { FileText, BarChart3, TrendingUp, Activity, PieChart, Plus } from 'lucide-react';
const reportTypes = [
    { value: 'balance_sheet', label: 'Balance Sheet', icon: BarChart3, description: 'Assets, liabilities, and equity' },
    { value: 'income_statement', label: 'Income Statement', icon: TrendingUp, description: 'Revenue, expenses, and net income' },
    { value: 'cash_flow', label: 'Cash Flow', icon: Activity, description: 'Operating, investing, and financing activities' },
    { value: 'equity', label: 'Equity', icon: PieChart, description: 'Changes in equity over time' },
    { value: 'custom', label: 'Custom Report', icon: FileText, description: 'User-defined custom report' }
];
export function ReportCreationModal({ isOpen, onClose, onCreateReport, templateData }) {
    const [formData, setFormData] = useState({
        name: templateData?.name || '',
        type: templateData?.type || '',
        description: templateData?.description || '',
        companyId: 'seed-company-1', // Default company ID
        isTemplate: false,
        isPublic: false,
        metadata: templateData?.configuration ? JSON.stringify(templateData.configuration) : undefined
    });
    const [errors, setErrors] = useState({});
    // Update form data when templateData changes (for editing)
    useEffect(() => {
        if (templateData) {
            setFormData({
                name: templateData.name || '',
                type: templateData.type || '',
                description: templateData.description || '',
                companyId: 'seed-company-1',
                isTemplate: templateData.isTemplate || false,
                isPublic: templateData.isPublic || false,
                metadata: templateData.configuration ? JSON.stringify(templateData.configuration) : undefined
            });
        }
        else {
            // Reset form for new report creation
            setFormData({
                name: '',
                type: '',
                description: '',
                companyId: 'seed-company-1',
                isTemplate: false,
                isPublic: false,
                metadata: undefined
            });
        }
        // Clear any existing errors
        setErrors({});
    }, [templateData]);
    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: undefined
            }));
        }
    };
    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) {
            newErrors.name = 'Report name is required';
        }
        if (!formData.type) {
            newErrors.type = 'Report type is required';
        }
        if (!formData.companyId.trim()) {
            newErrors.companyId = 'Company ID is required';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }
        onCreateReport(formData);
        onClose();
    };
    const handleCancel = () => {
        setFormData({
            name: '',
            type: '',
            description: '',
            companyId: 'seed-company-1',
            isTemplate: false,
            isPublic: false,
            metadata: undefined
        });
        setErrors({});
        onClose();
    };
    const selectedReportType = reportTypes.find(rt => rt.value === formData.type);
    return (_jsx(Dialog, { open: isOpen, onOpenChange: onClose, children: _jsxs(DialogContent, { className: "sm:max-w-[600px]", children: [_jsxs(DialogHeader, { children: [_jsxs(DialogTitle, { className: "flex items-center gap-2", children: [_jsx(Plus, { className: "h-5 w-5" }), templateData?.id ? 'Edit Report' : 'Create New Report'] }), _jsx(DialogDescription, { children: templateData?.id
                                ? `Edit the details of: ${templateData.name}`
                                : templateData
                                    ? `Create a report from template: ${templateData.name}`
                                    : 'Fill in the details to create a new financial report' })] }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "name", children: "Report Name *" }), _jsx(Input, { id: "name", placeholder: "Enter report name", value: formData.name, onChange: (e) => handleInputChange('name', e.target.value), className: errors.name ? 'border-red-500' : '' }), errors.name && (_jsx("p", { className: "text-sm text-red-500", children: errors.name }))] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "type", children: "Report Type *" }), _jsxs(Select, { value: formData.type, onValueChange: (value) => handleInputChange('type', value), children: [_jsx(SelectTrigger, { className: errors.type ? 'border-red-500' : '', children: _jsx(SelectValue, { placeholder: "Select report type" }) }), _jsx(SelectContent, { children: reportTypes.map((type) => (_jsx(SelectItem, { value: type.value, children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(type.icon, { className: "h-4 w-4" }), _jsxs("div", { children: [_jsx("div", { className: "font-medium", children: type.label }), _jsx("div", { className: "text-sm text-muted-foreground", children: type.description })] })] }) }, type.value))) })] }), errors.type && (_jsx("p", { className: "text-sm text-red-500", children: errors.type }))] }), selectedReportType && (_jsxs("div", { className: "p-3 bg-muted rounded-lg", children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [_jsx(selectedReportType.icon, { className: "h-4 w-4" }), _jsx("span", { className: "font-medium", children: selectedReportType.label })] }), _jsx("p", { className: "text-sm text-muted-foreground", children: selectedReportType.description })] })), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "description", children: "Description" }), _jsx(Textarea, { id: "description", placeholder: "Enter report description (optional)", value: formData.description, onChange: (e) => handleInputChange('description', e.target.value), rows: 3 })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "companyId", children: "Company ID *" }), _jsx(Input, { id: "companyId", placeholder: "Enter company ID", value: formData.companyId, onChange: (e) => handleInputChange('companyId', e.target.value), className: errors.companyId ? 'border-red-500' : '' }), errors.companyId && (_jsx("p", { className: "text-sm text-red-500", children: errors.companyId }))] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "isTemplate", checked: formData.isTemplate, onCheckedChange: (checked) => handleInputChange('isTemplate', checked) }), _jsx(Label, { htmlFor: "isTemplate", className: "text-sm", children: "Save as template for future use" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "isPublic", checked: formData.isPublic, onCheckedChange: (checked) => handleInputChange('isPublic', checked) }), _jsx(Label, { htmlFor: "isPublic", className: "text-sm", children: "Make this report public (visible to all users)" })] })] }), _jsxs(DialogFooter, { children: [_jsx(Button, { type: "button", variant: "outline", onClick: handleCancel, children: "Cancel" }), _jsxs(Button, { type: "submit", children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), templateData?.id ? 'Update Report' : 'Create Report'] })] })] })] }) }));
}
