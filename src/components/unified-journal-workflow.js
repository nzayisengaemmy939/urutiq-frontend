import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { BookOpen, Plus, CheckCircle, AlertCircle, Zap, RefreshCw, Save, Trash2, X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '../lib/api';
import { useAuth } from '../contexts/auth-context';
import { getCompanyId } from '../lib/config';
import { useToast } from '../hooks/use-toast';
export function UnifiedJournalWorkflow({ companyId, onSuccess, onCancel, initialData, mode = 'create' }) {
    const { toast } = useToast();
    const { isAuthenticated } = useAuth();
    const queryClient = useQueryClient();
    const currentCompanyId = companyId || getCompanyId();
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        reference: '',
        memo: '',
        entryTypeId: '',
        lines: [
            { accountId: '', debit: 0, credit: 0, memo: '' }
        ]
    });
    const [isBalanced, setIsBalanced] = useState(false);
    const [validationErrors, setValidationErrors] = useState([]);
    // Fetch accounts
    const { data: accountsResponse, isLoading: accountsLoading } = useQuery({
        queryKey: ['accounts', currentCompanyId],
        queryFn: () => apiService.getAccounts(currentCompanyId),
        enabled: !!currentCompanyId && isAuthenticated
    });
    const accounts = accountsResponse?.accounts || [];
    // Fetch entry types
    const { data: entryTypesResponse, isLoading: entryTypesLoading } = useQuery({
        queryKey: ['journal-entry-types', currentCompanyId],
        queryFn: () => apiService.getJournalEntryTypes({ companyId: currentCompanyId }),
        enabled: !!currentCompanyId && isAuthenticated
    });
    const entryTypes = entryTypesResponse?.entryTypes || [];
    // Fetch templates
    const { data: templatesResponse, isLoading: templatesLoading } = useQuery({
        queryKey: ['journal-templates', currentCompanyId],
        queryFn: () => apiService.getJournalTemplates({ companyId: currentCompanyId }),
        enabled: !!currentCompanyId && isAuthenticated
    });
    const templates = templatesResponse?.templates || [];
    // Initialize form data
    useEffect(() => {
        if (initialData) {
            setFormData({
                date: initialData.date || new Date().toISOString().split('T')[0],
                reference: initialData.reference || '',
                memo: initialData.memo || '',
                entryTypeId: initialData.entryTypeId || '',
                lines: initialData.lines || [{ accountId: '', debit: 0, credit: 0, memo: '' }]
            });
        }
    }, [initialData]);
    // Check if journal entry is balanced
    useEffect(() => {
        const totalDebit = formData.lines.reduce((sum, line) => {
            const debit = Number(line.debit) || 0;
            return sum + (isNaN(debit) ? 0 : debit);
        }, 0);
        const totalCredit = formData.lines.reduce((sum, line) => {
            const credit = Number(line.credit) || 0;
            return sum + (isNaN(credit) ? 0 : credit);
        }, 0);
        const balanced = Math.abs(totalDebit - totalCredit) < 0.01;
        setIsBalanced(balanced);
    }, [formData.lines]);
    // Validate form
    const validateForm = () => {
        const errors = [];
        if (!formData.date)
            errors.push('Date is required');
        if (!isBalanced)
            errors.push('Journal entry must be balanced (debits = credits)');
        const hasEmptyLines = formData.lines.some(line => !line.accountId || (line.debit === 0 && line.credit === 0));
        if (hasEmptyLines)
            errors.push('All lines must have an account and either debit or credit amount');
        setValidationErrors(errors);
        return errors.length === 0;
    };
    // Create/Update journal entry mutation
    const createEntryMutation = useMutation({
        mutationFn: (data) => {
            if (mode === 'edit' && initialData?.id) {
                return apiService.updateJournalEntry(initialData.id, data);
            }
            return apiService.createJournalEntry(data);
        },
        onSuccess: (data) => {
            toast({
                title: "Success",
                description: `Journal entry ${mode === 'edit' ? 'updated' : 'created'} successfully`,
            });
            queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
            queryClient.invalidateQueries({ queryKey: ['journal-hub-summary'] });
            if (onSuccess)
                onSuccess(data);
        },
        onError: (error) => {
            toast({
                title: "Error",
                description: error?.response?.data?.error || 'Failed to save journal entry',
                variant: "destructive",
            });
        }
    });
    // Post journal entry mutation
    const postEntryMutation = useMutation({
        mutationFn: (entryId) => apiService.postJournalEntry(entryId),
        onSuccess: () => {
            toast({
                title: "Success",
                description: "Journal entry posted successfully",
            });
            queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
            queryClient.invalidateQueries({ queryKey: ['journal-hub-summary'] });
        },
        onError: (error) => {
            toast({
                title: "Error",
                description: error?.response?.data?.error || 'Failed to post journal entry',
                variant: "destructive",
            });
        }
    });
    const handleSave = async () => {
        if (!validateForm())
            return;
        const entryData = {
            ...formData,
            companyId: currentCompanyId,
            status: 'DRAFT'
        };
        createEntryMutation.mutate(entryData);
    };
    const handleSaveAndPost = async () => {
        if (!validateForm())
            return;
        const entryData = {
            ...formData,
            companyId: currentCompanyId,
            status: 'POSTED'
        };
        createEntryMutation.mutate(entryData);
    };
    const handleAddLine = () => {
        setFormData(prev => ({
            ...prev,
            lines: [...prev.lines, { accountId: '', debit: 0, credit: 0, memo: '' }]
        }));
    };
    const handleRemoveLine = (index) => {
        if (formData.lines.length > 1) {
            setFormData(prev => ({
                ...prev,
                lines: prev.lines.filter((_, i) => i !== index)
            }));
        }
    };
    const handleLineChange = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            lines: prev.lines.map((line, i) => i === index ? { ...line, [field]: value } : line)
        }));
    };
    const handleUseTemplate = (template) => {
        if (template.lines && template.lines.length > 0) {
            setFormData(prev => ({
                ...prev,
                entryTypeId: template.entryTypeId,
                lines: template.lines.map((line) => ({
                    accountId: line.accountId,
                    debit: line.debitFormula ? 0 : line.debit || 0,
                    credit: line.creditFormula ? 0 : line.credit || 0,
                    memo: line.memo || '',
                    department: line.department || '',
                    project: line.project || '',
                    location: line.location || ''
                }))
            }));
            // Show success toast
            toast({
                title: "Template Applied",
                description: `"${template.name}" has been applied successfully`,
            });
        }
    };
    const totalDebit = formData.lines.reduce((sum, line) => {
        const debit = Number(line.debit) || 0;
        return sum + (isNaN(debit) ? 0 : debit);
    }, 0);
    const totalCredit = formData.lines.reduce((sum, line) => {
        const credit = Number(line.credit) || 0;
        return sum + (isNaN(credit) ? 0 : credit);
    }, 0);
    if (!isAuthenticated) {
        return null;
    }
    return (_jsxs("div", { className: "space-y-4", children: [_jsx("div", { className: "sticky top-0 z-10 bg-white border-b border-gray-200 pb-4", children: _jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center", children: _jsx(BookOpen, { className: "w-5 h-5 text-white" }) }), _jsxs("div", { children: [_jsx("h2", { className: "text-xl font-semibold text-gray-900", children: mode === 'edit' ? 'Edit Journal Entry' : mode === 'duplicate' ? 'Duplicate Journal Entry' : 'New Journal Entry' }), _jsx("p", { className: "text-sm text-gray-500", children: "Record manual accounting transactions" })] })] }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("div", { className: "text-right", children: [_jsx("div", { className: "text-xs text-gray-500 mb-1", children: "DIFFERENCE" }), _jsxs("div", { className: `text-lg font-bold ${isBalanced ? 'text-green-600' : 'text-red-600'}`, children: ["$", Math.abs(totalDebit - totalCredit).toFixed(2)] })] }), _jsx("div", { className: "w-px h-10 bg-gray-300" }), _jsxs("div", { className: "text-right", children: [_jsx("div", { className: "text-xs text-gray-500 mb-1", children: "DEBITS" }), _jsxs("div", { className: "text-lg font-semibold text-gray-900", children: ["$", (totalDebit || 0).toFixed(2)] })] }), _jsxs("div", { className: "text-right", children: [_jsx("div", { className: "text-xs text-gray-500 mb-1", children: "CREDITS" }), _jsxs("div", { className: "text-lg font-semibold text-gray-900", children: ["$", (totalCredit || 0).toFixed(2)] })] }), isBalanced ? (_jsxs("div", { className: "flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg", children: [_jsx(CheckCircle, { className: "w-5 h-5 text-green-600" }), _jsx("span", { className: "text-sm font-medium text-green-700", children: "Balanced" })] })) : (_jsxs("div", { className: "flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg", children: [_jsx(AlertCircle, { className: "w-5 h-5 text-red-600" }), _jsx("span", { className: "text-sm font-medium text-red-700", children: "Out of Balance" })] }))] })] }) }), _jsxs("div", { className: "grid grid-cols-12 gap-6", children: [_jsxs("div", { className: "col-span-12 lg:col-span-4 space-y-4", children: [_jsxs(Card, { className: "shadow-sm", children: [_jsx(CardHeader, { className: "pb-3", children: _jsx(CardTitle, { className: "text-base font-semibold", children: "Entry Details" }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { children: [_jsxs(Label, { htmlFor: "date", className: "text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2", children: ["Date ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx(Input, { id: "date", type: "date", value: formData.date, onChange: (e) => setFormData(prev => ({ ...prev, date: e.target.value })), className: "border-gray-300 focus:border-blue-500 focus:ring-blue-500 mt-1" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "reference", className: "text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2", children: "Journal # (optional)" }), _jsx(Input, { id: "reference", value: formData.reference, onChange: (e) => setFormData(prev => ({ ...prev, reference: e.target.value })), placeholder: "e.g., JE-2025-001", className: "border-gray-300 focus:border-blue-500 focus:ring-blue-500 mt-1" }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Auto-generated if left blank" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "entryType", className: "text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2", children: "Entry Type" }), _jsxs(Select, { value: formData.entryTypeId, onValueChange: (value) => setFormData(prev => ({ ...prev, entryTypeId: value })), children: [_jsx(SelectTrigger, { className: "border-gray-300 focus:border-blue-500 focus:ring-blue-500 mt-1", children: _jsx(SelectValue, { placeholder: "Select type..." }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "__placeholder__", disabled: true, children: _jsx("span", { className: "text-gray-500", children: "No type selected" }) }), entryTypes.map((type) => (_jsx(SelectItem, { value: type.id, children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-2 h-2 rounded-full bg-blue-500" }), type.name] }) }, type.id)))] })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "memo", className: "text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2", children: "Description / Memo" }), _jsx(Textarea, { id: "memo", value: formData.memo, onChange: (e) => setFormData(prev => ({ ...prev, memo: e.target.value })), placeholder: "Enter a description for this journal entry...", rows: 4, className: "border-gray-300 focus:border-blue-500 focus:ring-blue-500 resize-none mt-1" })] })] })] }), templates.length > 0 && (_jsxs(Card, { className: "shadow-sm", children: [_jsx(CardHeader, { className: "pb-3", children: _jsxs(CardTitle, { className: "text-base font-semibold flex items-center gap-2", children: [_jsx(Zap, { className: "w-4 h-4 text-amber-500" }), "Quick Templates"] }) }), _jsxs(CardContent, { className: "space-y-2", children: [templatesLoading ? (_jsx("div", { className: "flex items-center justify-center py-4", children: _jsx(RefreshCw, { className: "w-4 h-4 animate-spin text-gray-400" }) })) : (templates.slice(0, 5).map((template) => (_jsxs("button", { onClick: () => handleUseTemplate(template), className: "w-full text-left p-3 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-colors group", children: [_jsx("div", { className: "font-medium text-sm text-gray-900 group-hover:text-blue-600", children: template.name }), _jsxs("div", { className: "text-xs text-gray-500 mt-1", children: [template.lines?.length || 0, " line items"] })] }, template.id)))), templates.length > 5 && (_jsx("button", { className: "w-full text-center text-xs text-blue-600 hover:text-blue-700 font-medium py-2", children: "View all templates \u2192" }))] })] }))] }), _jsxs("div", { className: "col-span-12 lg:col-span-8", children: [_jsxs(Card, { className: "shadow-sm", children: [_jsx(CardHeader, { className: "pb-3 border-b border-gray-200", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx(CardTitle, { className: "text-base font-semibold", children: "Line Items" }), _jsxs(Button, { onClick: handleAddLine, size: "sm", className: "bg-blue-600 hover:bg-blue-700", children: [_jsx(Plus, { className: "w-4 h-4 mr-1" }), "Add Line"] })] }) }), _jsxs(CardContent, { className: "p-0", children: [_jsxs("div", { className: "grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-700 uppercase tracking-wide", children: [_jsx("div", { className: "col-span-1", children: "#" }), _jsx("div", { className: "col-span-4", children: "Account" }), _jsx("div", { className: "col-span-3", children: "Description" }), _jsx("div", { className: "col-span-2 text-right", children: "Debit" }), _jsx("div", { className: "col-span-2 text-right", children: "Credit" })] }), _jsx("div", { className: "divide-y divide-gray-200", children: formData.lines.map((line, index) => (_jsxs("div", { className: "grid grid-cols-12 gap-4 px-4 py-3 hover:bg-gray-50 group transition-colors", children: [_jsx("div", { className: "col-span-1 flex items-center", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-sm font-medium text-gray-500", children: index + 1 }), formData.lines.length > 1 && (_jsx(Button, { size: "sm", variant: "ghost", onClick: () => handleRemoveLine(index), className: "opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 hover:bg-red-50 hover:text-red-600", children: _jsx(Trash2, { className: "w-3 h-3" }) }))] }) }), _jsx("div", { className: "col-span-4", children: _jsxs(Select, { value: line.accountId, onValueChange: (value) => handleLineChange(index, 'accountId', value), disabled: accountsLoading, children: [_jsx(SelectTrigger, { className: "border-gray-300 focus:border-blue-500 h-9 text-sm", children: _jsx(SelectValue, { placeholder: accountsLoading ? "Loading..." : "Select account" }) }), _jsx(SelectContent, { className: "max-h-[300px]", children: accountsLoading ? (_jsx(SelectItem, { value: "loading", disabled: true, children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(RefreshCw, { className: "w-3 h-3 animate-spin" }), "Loading accounts..."] }) })) : accounts.length === 0 ? (_jsx(SelectItem, { value: "no-accounts", disabled: true, children: _jsx("span", { className: "text-gray-500", children: "No accounts found" }) })) : (accounts.map((account) => (_jsx(SelectItem, { value: account.id, children: _jsxs("div", { className: "flex flex-col", children: [_jsxs("span", { className: "font-medium", children: [account.code, " - ", account.name] }), _jsxs("span", { className: "text-xs text-gray-500", children: [typeof account.type === 'string' ? account.type : account.type?.name || 'N/A', ' • ', typeof account.category === 'string' ? account.category : account.category?.name || 'N/A'] })] }) }, account.id)))) })] }) }), _jsx("div", { className: "col-span-3", children: _jsx(Input, { value: line.memo || '', onChange: (e) => handleLineChange(index, 'memo', e.target.value), placeholder: "Description...", className: "border-gray-300 focus:border-blue-500 h-9 text-sm" }) }), _jsx("div", { className: "col-span-2", children: _jsxs("div", { className: "relative", children: [_jsx("span", { className: "absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm", children: "$" }), _jsx(Input, { type: "number", step: "0.01", min: "0", value: line.debit || '', onChange: (e) => handleLineChange(index, 'debit', parseFloat(e.target.value) || 0), placeholder: "0.00", className: "border-gray-300 focus:border-blue-500 h-9 text-sm text-right pl-6 font-mono" })] }) }), _jsx("div", { className: "col-span-2", children: _jsxs("div", { className: "relative", children: [_jsx("span", { className: "absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm", children: "$" }), _jsx(Input, { type: "number", step: "0.01", min: "0", value: line.credit || '', onChange: (e) => handleLineChange(index, 'credit', parseFloat(e.target.value) || 0), placeholder: "0.00", className: "border-gray-300 focus:border-blue-500 h-9 text-sm text-right pl-6 font-mono" })] }) })] }, index))) }), _jsxs("div", { className: "grid grid-cols-12 gap-4 px-4 py-4 bg-gray-50 border-t-2 border-gray-300", children: [_jsx("div", { className: "col-span-8 flex items-center justify-end", children: _jsx("span", { className: "text-sm font-bold text-gray-900 uppercase", children: "Totals" }) }), _jsx("div", { className: "col-span-2 text-right", children: _jsxs("div", { className: "text-base font-bold text-gray-900", children: ["$", (totalDebit || 0).toFixed(2)] }) }), _jsx("div", { className: "col-span-2 text-right", children: _jsxs("div", { className: "text-base font-bold text-gray-900", children: ["$", (totalCredit || 0).toFixed(2)] }) })] })] })] }), validationErrors.length > 0 && (_jsx(Card, { className: "mt-4 border-red-200 bg-red-50 shadow-sm", children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex gap-3", children: [_jsx(AlertCircle, { className: "w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" }), _jsxs("div", { className: "flex-1", children: [_jsx("h4", { className: "text-sm font-semibold text-red-800 mb-2", children: "Please fix the following issues:" }), _jsx("ul", { className: "space-y-1", children: validationErrors.map((error, index) => (_jsxs("li", { className: "text-sm text-red-700 flex items-center gap-2", children: [_jsx("div", { className: "w-1 h-1 rounded-full bg-red-600" }), error] }, index))) })] })] }) }) }))] })] }), _jsx("div", { className: "sticky bottom-0 z-10 bg-white border-t border-gray-200 pt-4 mt-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("div", { className: "flex items-center gap-2", children: onCancel && (_jsxs(Button, { variant: "outline", onClick: onCancel, className: "border-gray-300", children: [_jsx(X, { className: "w-4 h-4 mr-2" }), "Cancel"] })) }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Button, { variant: "outline", onClick: handleSave, disabled: createEntryMutation.isPending || !formData.date, className: "border-gray-300", children: createEntryMutation.isPending ? (_jsxs(_Fragment, { children: [_jsx(RefreshCw, { className: "w-4 h-4 mr-2 animate-spin" }), "Saving..."] })) : (_jsxs(_Fragment, { children: [_jsx(Save, { className: "w-4 h-4 mr-2" }), "Save as Draft"] })) }), _jsx(Button, { onClick: handleSaveAndPost, disabled: createEntryMutation.isPending || !isBalanced || validationErrors.length > 0, className: "bg-blue-600 hover:bg-blue-700 shadow-sm", children: createEntryMutation.isPending ? (_jsxs(_Fragment, { children: [_jsx(RefreshCw, { className: "w-4 h-4 mr-2 animate-spin" }), "Posting..."] })) : (_jsxs(_Fragment, { children: [_jsx(CheckCircle, { className: "w-4 h-4 mr-2" }), "Save and Post"] })) })] })] }) })] }));
}
