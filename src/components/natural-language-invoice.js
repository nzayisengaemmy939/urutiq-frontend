import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Textarea } from "../components/ui/textarea";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { MessageSquare, Sparkles, Lightbulb, Eye, Save, Loader2, Bot } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiService from '@/lib/api';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth-context';
export function NaturalLanguageInvoice({ onInvoiceCreated }) {
    const [text, setText] = useState('');
    const [parsedData, setParsedData] = useState(null);
    const [suggestions, setSuggestions] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [editingData, setEditingData] = useState(false);
    const [selectedCompanyId, setSelectedCompanyId] = useState('');
    const [autoCreateCustomer, setAutoCreateCustomer] = useState(true);
    const [debounceTimer, setDebounceTimer] = useState(null);
    const textareaRef = useRef(null);
    const queryClient = useQueryClient();
    const { user } = useAuth();
    // Get user's companies
    const { data: companies } = useQuery({
        queryKey: ['companies'],
        queryFn: () => apiService.getCompanies(),
        enabled: !!user
    });
    const companiesList = useMemo(() => {
        if (!companies)
            return [];
        const maybe = companies;
        if (Array.isArray(maybe))
            return maybe;
        if (maybe && Array.isArray(maybe.data))
            return maybe.data;
        if (maybe && Array.isArray(maybe.companies))
            return maybe.companies;
        return [];
    }, [companies]);
    useEffect(() => {
        try {
            const stored = localStorage.getItem('company_id') || localStorage.getItem('companyId') || localStorage.getItem('company');
            if (stored)
                setSelectedCompanyId(stored);
        }
        catch { }
    }, []);
    // Get suggestions when text changes
    useEffect(() => {
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }
        if (text.length > 3 && selectedCompanyId) {
            const timer = setTimeout(() => {
                getSuggestions();
            }, 500);
            setDebounceTimer(timer);
        }
        return () => {
            if (debounceTimer) {
                clearTimeout(debounceTimer);
            }
        };
    }, [text, selectedCompanyId]);
    // Parse text mutation
    const parseTextMutation = useMutation({
        mutationFn: (data) => apiService.parseInvoiceText({ ...data, context: {} }),
        onSuccess: (response) => {
            setParsedData(response.parsedData);
            setShowPreview(true);
            toast.success('Text parsed successfully!');
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to parse text');
        }
    });
    // Create invoice mutation
    const createInvoiceMutation = useMutation({
        mutationFn: (data) => apiService.createInvoiceFromText({ ...data, validateData: true }),
        onSuccess: (response) => {
            if (response.success && response.invoice) {
                toast.success('Invoice created successfully!');
                queryClient.invalidateQueries({ queryKey: ['invoices'] });
                onInvoiceCreated?.(response.invoice);
                setText('');
                setParsedData(null);
                setShowPreview(false);
            }
            else {
                toast.error(response.message || 'Failed to create invoice');
            }
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to create invoice');
        }
    });
    const getSuggestions = async () => {
        if (!selectedCompanyId)
            return;
        try {
            const response = await apiService.getInvoiceSuggestions(selectedCompanyId, text);
            setSuggestions(response.suggestions);
        }
        catch (error) {
            console.error('Error getting suggestions:', error);
        }
    };
    const handleParseText = () => {
        if (!text.trim() || !selectedCompanyId) {
            toast.error('Please enter text and select a company');
            return;
        }
        setIsProcessing(true);
        parseTextMutation.mutate({
            text: text.trim(),
            companyId: selectedCompanyId
        }).finally(() => {
            setIsProcessing(false);
        });
    };
    const handleCreateInvoice = () => {
        if (!text.trim() || !selectedCompanyId) {
            toast.error('Please enter text and select a company');
            return;
        }
        createInvoiceMutation.mutate({
            text: text.trim(),
            companyId: selectedCompanyId,
            autoCreateCustomer
        });
    };
    const handleSuggestionClick = (suggestion) => {
        setText(suggestion);
        textareaRef.current?.focus();
    };
    const getConfidenceColor = (confidence) => {
        if (confidence >= 0.8)
            return 'bg-green-100 text-green-800';
        if (confidence >= 0.6)
            return 'bg-yellow-100 text-yellow-800';
        return 'bg-red-100 text-red-800';
    };
    const getConfidenceText = (confidence) => {
        if (confidence >= 0.8)
            return 'High Confidence';
        if (confidence >= 0.6)
            return 'Medium Confidence';
        return 'Low Confidence';
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(MessageSquare, { className: "w-5 h-5" }), "Natural Language Invoice Creation"] }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "company", children: "Company *" }), _jsxs(Select, { value: selectedCompanyId, onValueChange: (val) => {
                                                    setSelectedCompanyId(val);
                                                    try {
                                                        localStorage.setItem('company_id', val);
                                                    }
                                                    catch { }
                                                }, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select company" }) }), _jsx(SelectContent, { children: companiesList?.map((company) => (_jsx(SelectItem, { value: company.id, children: company.name }, company.id))) })] })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("input", { type: "checkbox", id: "autoCreateCustomer", checked: autoCreateCustomer, onChange: (e) => setAutoCreateCustomer(e.target.checked), className: "rounded" }), _jsx(Label, { htmlFor: "autoCreateCustomer", className: "text-sm", children: "Auto-create customers if not found" })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "invoiceText", children: "Describe your invoice in natural language *" }), _jsx(Textarea, { ref: textareaRef, id: "invoiceText", placeholder: "Example: Create an invoice for Acme Corp for 10 hours of consulting at $150 per hour, due in 30 days", value: text, onChange: (e) => setText(e.target.value), className: "min-h-[120px] mt-2" }), _jsxs("div", { className: "flex items-center justify-between mt-2", children: [_jsxs("div", { className: "text-sm text-gray-500", children: [text.length, " characters"] }), _jsxs(Button, { onClick: handleParseText, disabled: !text.trim() || !selectedCompanyId || isProcessing, className: "flex items-center gap-2", children: [isProcessing ? (_jsx(Loader2, { className: "w-4 h-4 animate-spin" })) : (_jsx(Sparkles, { className: "w-4 h-4" })), isProcessing ? 'Processing...' : 'Parse & Preview'] })] })] }), suggestions.length > 0 && (_jsxs("div", { children: [_jsxs(Label, { className: "text-sm font-medium flex items-center gap-2", children: [_jsx(Lightbulb, { className: "w-4 h-4" }), "Suggestions"] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-2 mt-2", children: suggestions.map((suggestion, index) => (_jsx(Button, { variant: "outline", size: "sm", onClick: () => handleSuggestionClick(suggestion.suggestion), className: "justify-start text-left h-auto p-3", children: _jsxs("div", { children: [_jsx("div", { className: "font-medium", children: suggestion.suggestion }), _jsxs("div", { className: "text-xs text-gray-500 mt-1", children: [suggestion.context, " \u2022 ", Math.round(suggestion.confidence * 100), "% confidence"] })] }) }, index))) })] }))] })] }), _jsx(Dialog, { open: showPreview, onOpenChange: setShowPreview, children: _jsxs(DialogContent, { className: "max-w-4xl max-h-[90vh] overflow-y-auto", children: [_jsx(DialogHeader, { children: _jsxs(DialogTitle, { className: "flex items-center gap-2", children: [_jsx(Eye, { className: "w-5 h-5" }), "Invoice Preview", parsedData && (_jsx(Badge, { className: getConfidenceColor(parsedData.metadata.confidence), children: getConfidenceText(parsedData.metadata.confidence) }))] }) }), parsedData && (_jsxs("div", { className: "space-y-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-lg", children: "Customer Information" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { children: "Customer Name" }), _jsx(Input, { value: parsedData.customer.name, readOnly: true })] }), _jsxs("div", { children: [_jsx(Label, { children: "Email" }), _jsx(Input, { value: parsedData.customer.email || '', readOnly: true })] }), _jsxs("div", { children: [_jsx(Label, { children: "Phone" }), _jsx(Input, { value: parsedData.customer.phone || '', readOnly: true })] }), _jsxs("div", { children: [_jsx(Label, { children: "Address" }), _jsx(Input, { value: parsedData.customer.address || '', readOnly: true })] })] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-lg", children: "Invoice Items" }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: parsedData.items.map((item, index) => (_jsxs("div", { className: "flex items-center justify-between p-3 border rounded-lg", children: [_jsxs("div", { className: "flex-1", children: [_jsx("div", { className: "font-medium", children: item.description }), _jsxs("div", { className: "text-sm text-gray-500", children: [item.quantity, " \u00D7 $", item.unitPrice.toFixed(2)] })] }), _jsxs("div", { className: "text-right", children: [_jsxs("div", { className: "font-medium", children: ["$", item.lineTotal.toFixed(2)] }), item.category && (_jsx("div", { className: "text-xs text-gray-500", children: item.category }))] })] }, index))) }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-lg", children: "Invoice Totals" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Subtotal:" }), _jsxs("span", { children: ["$", parsedData.amounts.subtotal.toFixed(2)] })] }), _jsxs("div", { className: "flex justify-between", children: [_jsxs("span", { children: ["Tax (", parsedData.amounts.taxRate, "%):"] }), _jsxs("span", { children: ["$", parsedData.amounts.taxAmount.toFixed(2)] })] }), _jsxs("div", { className: "flex justify-between font-bold text-lg border-t pt-2", children: [_jsx("span", { children: "Total:" }), _jsxs("span", { children: ["$", parsedData.amounts.totalAmount.toFixed(2)] })] })] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-lg", children: "Dates" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { children: "Issue Date" }), _jsx(Input, { value: new Date(parsedData.dates.issueDate).toLocaleDateString(), readOnly: true })] }), _jsxs("div", { children: [_jsx(Label, { children: "Due Date" }), _jsx(Input, { value: new Date(parsedData.dates.dueDate).toLocaleDateString(), readOnly: true })] })] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "text-lg flex items-center gap-2", children: [_jsx(Bot, { className: "w-5 h-5" }), "AI Analysis"] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { children: "Intent" }), _jsx(Input, { value: parsedData.rawAnalysis.intent, readOnly: true })] }), _jsxs("div", { children: [_jsx(Label, { children: "Extracted Entities" }), _jsx("div", { className: "flex flex-wrap gap-2 mt-2", children: parsedData.metadata.extractedEntities.map((entity, index) => (_jsx(Badge, { variant: "outline", children: entity }, index))) })] }), _jsxs("div", { children: [_jsx(Label, { children: "Suggested Terms" }), _jsx(Input, { value: parsedData.metadata.suggestedTerms, readOnly: true })] }), _jsxs("div", { children: [_jsx(Label, { children: "Suggested Notes" }), _jsx(Textarea, { value: parsedData.metadata.suggestedNotes, readOnly: true })] })] }) })] }), _jsxs("div", { className: "flex gap-2 justify-end", children: [_jsx(Button, { variant: "outline", onClick: () => setShowPreview(false), children: "Cancel" }), _jsxs(Button, { onClick: handleCreateInvoice, disabled: createInvoiceMutation.isPending, className: "flex items-center gap-2", children: [createInvoiceMutation.isPending ? (_jsx(Loader2, { className: "w-4 h-4 animate-spin" })) : (_jsx(Save, { className: "w-4 h-4" })), createInvoiceMutation.isPending ? 'Creating...' : 'Create Invoice'] })] })] }))] }) })] }));
}
