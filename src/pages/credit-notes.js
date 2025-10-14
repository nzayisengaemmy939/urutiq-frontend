import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageLayout } from '../components/page-layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { format } from 'date-fns';
import { Plus, Search, Eye, Trash2, FileText, CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';
import apiService from '../lib/api';
import { creditNotesApi } from '../lib/api/credit-notes';
import { useDemoAuth } from '../hooks/useDemoAuth';
export default function CreditNotesPage() {
    const { ready: authReady } = useDemoAuth('credit-notes-page');
    const queryClient = useQueryClient();
    const [companyFilter, setCompanyFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [createOpen, setCreateOpen] = useState(false);
    const [viewOpen, setViewOpen] = useState(false);
    const [selectedCreditNote, setSelectedCreditNote] = useState(null);
    const [createForm, setCreateForm] = useState({
        reason: '',
        notes: '',
        terms: '',
        customerId: undefined,
        lines: [{ description: '', quantity: 1, unitPrice: 0 }]
    });
    const [selectedInvoiceId, setSelectedInvoiceId] = useState('');
    const { data: companies } = useQuery({
        queryKey: ['companies'],
        queryFn: async () => {
            const response = await apiService.getCompanies();
            return Array.isArray(response) ? response : (response?.data || []);
        },
        enabled: authReady,
    });
    const companyId = companyFilter !== 'all' ? companyFilter : (Array.isArray(companies) && companies.length > 0 ? companies[0]?.id : '');
    // Fetch invoices for the selected company
    const { data: invoices, isLoading: invoicesLoading, error: invoicesError } = useQuery({
        queryKey: ['invoices', companyId],
        queryFn: async () => {
            if (!companyId)
                return [];
            const response = await apiService.getInvoices({
                companyId,
                pageSize: 100 // Get all invoices
            });
            // The API returns { items: [...] } structure, but TypeScript expects { data: [...] }
            return response.items || response.data || [];
        },
        enabled: authReady && !!companyId,
    });
    // Fetch customers for the selected company
    const { data: customers } = useQuery({
        queryKey: ['customers', companyId],
        queryFn: async () => {
            if (!companyId)
                return [];
            const response = await apiService.getCustomers({
                companyId,
                pageSize: 100 // Get all customers
            });
            return response.items || [];
        },
        enabled: authReady && !!companyId,
    });
    const { data: creditNotes, isLoading } = useQuery({
        queryKey: ['credit-notes', companyId, searchTerm, statusFilter],
        queryFn: async () => {
            if (!companyId)
                return { data: [] };
            return await creditNotesApi.getCreditNotes({
                companyId,
                search: searchTerm || undefined,
                status: statusFilter !== 'all' ? statusFilter : undefined
            });
        },
        enabled: authReady && !!companyId,
    });
    const items = useMemo(() => creditNotes?.data || [], [creditNotes]);
    const createMutation = useMutation({
        mutationFn: async (data) => {
            if (!companyId)
                throw new Error('No company selected');
            return await creditNotesApi.createCreditNote(companyId, {
                ...data,
                invoiceId: selectedInvoiceId && selectedInvoiceId !== 'none' ? selectedInvoiceId : undefined
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['credit-notes'] });
            setCreateOpen(false);
            setCreateForm({
                reason: '',
                notes: '',
                terms: '',
                customerId: undefined,
                lines: [{ description: '', quantity: 1, unitPrice: 0 }]
            });
            setSelectedInvoiceId('none');
        },
        onError: (error) => {
            console.error('Error creating credit note:', error);
        }
    });
    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            if (!companyId)
                throw new Error('No company selected');
            return await creditNotesApi.deleteCreditNote(companyId, id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['credit-notes'] });
        }
    });
    const getStatusBadge = (status) => {
        const statusConfig = {
            draft: { color: 'bg-gray-100 text-gray-800', icon: FileText },
            sent: { color: 'bg-blue-100 text-blue-800', icon: Clock },
            viewed: { color: 'bg-yellow-100 text-yellow-800', icon: Eye },
            approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
            rejected: { color: 'bg-red-100 text-red-800', icon: XCircle },
            applied: { color: 'bg-purple-100 text-purple-800', icon: CheckCircle },
            cancelled: { color: 'bg-gray-100 text-gray-800', icon: XCircle }
        };
        const config = statusConfig[status] || statusConfig.draft;
        const Icon = config.icon;
        return (_jsxs(Badge, { className: config.color, children: [_jsx(Icon, { className: "w-3 h-3 mr-1" }), status.charAt(0).toUpperCase() + status.slice(1)] }));
    };
    const handleCreateCreditNote = () => {
        if (createForm.reason && createForm.lines.length > 0) {
            createMutation.mutate(createForm);
        }
    };
    const handleViewCreditNote = (creditNote) => {
        setSelectedCreditNote(creditNote);
        setViewOpen(true);
    };
    const handleDeleteCreditNote = (id) => {
        if (confirm('Are you sure you want to delete this credit note?')) {
            deleteMutation.mutate(id);
        }
    };
    const addCreditNoteLine = () => {
        setCreateForm(prev => ({
            ...prev,
            lines: [...prev.lines, { description: '', quantity: 1, unitPrice: 0 }]
        }));
    };
    const removeCreditNoteLine = (index) => {
        setCreateForm(prev => ({
            ...prev,
            lines: prev.lines.filter((_, i) => i !== index)
        }));
    };
    const updateCreditNoteLine = (index, field, value) => {
        setCreateForm(prev => ({
            ...prev,
            lines: prev.lines.map((line, i) => i === index ? { ...line, [field]: value } : line)
        }));
    };
    const handleInvoiceSelection = (invoiceId) => {
        if (invoiceId === 'none') {
            setSelectedInvoiceId('');
            setCreateForm(prev => ({
                ...prev,
                lines: [{ description: '', quantity: 1, unitPrice: 0 }]
            }));
            return;
        }
        setSelectedInvoiceId(invoiceId);
        if (invoiceId && invoices) {
            const selectedInvoice = invoices.find((inv) => inv.id === invoiceId);
            if (selectedInvoice) {
                // Set customer ID from the selected invoice (this will override manual customer selection)
                setCreateForm(prev => ({
                    ...prev,
                    customerId: selectedInvoice.customerId
                }));
                // Auto-populate credit note lines from invoice
                if (selectedInvoice.lines) {
                    const creditLines = selectedInvoice.lines.map((line) => ({
                        description: line.description || 'Credit for: ' + (line.product?.name || 'Item'),
                        quantity: line.quantity,
                        unitPrice: line.unitPrice,
                        taxRate: line.taxRate || 0,
                        discountRate: line.discountRate || 0,
                        productId: line.productId
                    }));
                    setCreateForm(prev => ({
                        ...prev,
                        lines: creditLines.length > 0 ? creditLines : [{ description: '', quantity: 1, unitPrice: 0 }]
                    }));
                }
            }
        }
    };
    return (_jsx(PageLayout, { children: _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Credit Notes" }), _jsx("p", { className: "text-gray-600 mt-1", children: "Manage customer credit notes and returns" })] }), _jsxs(Button, { onClick: () => setCreateOpen(true), className: "flex items-center gap-2", children: [_jsx(Plus, { className: "w-4 h-4" }), "New Credit Note"] })] }), _jsx(Card, { children: _jsx(CardContent, { className: "pt-6", children: _jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [_jsxs("div", { className: "relative flex-1 min-w-64", children: [_jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" }), _jsx(Input, { placeholder: "Search credit notes...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "pl-10" })] }), _jsxs(Select, { value: companyFilter, onValueChange: setCompanyFilter, children: [_jsx(SelectTrigger, { className: "w-52", children: _jsx(SelectValue, { placeholder: "All Companies" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All Companies" }), Array.isArray(companies) ? companies.map((c) => (_jsx(SelectItem, { value: c.id, children: c.name }, c.id))) : null] })] }), _jsxs(Select, { value: statusFilter, onValueChange: setStatusFilter, children: [_jsx(SelectTrigger, { className: "w-40", children: _jsx(SelectValue, { placeholder: "All Status" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All Status" }), _jsx(SelectItem, { value: "draft", children: "Draft" }), _jsx(SelectItem, { value: "sent", children: "Sent" }), _jsx(SelectItem, { value: "viewed", children: "Viewed" }), _jsx(SelectItem, { value: "approved", children: "Approved" }), _jsx(SelectItem, { value: "rejected", children: "Rejected" }), _jsx(SelectItem, { value: "applied", children: "Applied" }), _jsx(SelectItem, { value: "cancelled", children: "Cancelled" })] })] })] }) }) }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center justify-between", children: [_jsx("span", { children: "Credit Notes" }), _jsxs("span", { className: "text-sm font-normal text-gray-500", children: [items.length, " credit note", items.length !== 1 ? 's' : ''] })] }) }), _jsx(CardContent, { children: isLoading ? (_jsx("div", { className: "flex items-center justify-center py-8", children: _jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" }) })) : items.length === 0 ? (_jsxs("div", { className: "text-center py-12", children: [_jsx(FileText, { className: "w-12 h-12 text-gray-400 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "No credit notes found" }), _jsx("p", { className: "text-gray-500 mb-4", children: "Get started by creating your first credit note." }), _jsxs(Button, { onClick: () => setCreateOpen(true), children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), "Create Credit Note"] })] })) : (_jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { children: "Credit Note #" }), _jsx(TableHead, { children: "Status" }), _jsx(TableHead, { children: "Invoice" }), _jsx(TableHead, { children: "Customer" }), _jsx(TableHead, { children: "Date" }), _jsx(TableHead, { children: "Reason" }), _jsx(TableHead, { children: "Amount" }), _jsx(TableHead, { children: "Actions" })] }) }), _jsx(TableBody, { children: items.map((cn) => (_jsxs(TableRow, { className: "hover:bg-gray-50", children: [_jsx(TableCell, { className: "font-medium", children: cn.creditNoteNumber }), _jsx(TableCell, { children: getStatusBadge(cn.status) }), _jsx(TableCell, { children: cn.invoice ? (_jsx("span", { className: "text-blue-600 hover:underline cursor-pointer", children: cn.invoice.invoiceNumber })) : (_jsx("span", { className: "text-gray-400", children: "-" })) }), _jsx(TableCell, { children: cn.customer ? (_jsxs("div", { children: [_jsx("div", { className: "font-medium", children: cn.customer.name }), cn.customer.email && (_jsx("div", { className: "text-sm text-gray-500", children: cn.customer.email }))] })) : (_jsx("span", { className: "text-gray-400", children: "-" })) }), _jsx(TableCell, { children: format(new Date(cn.issueDate), 'MMM dd, yyyy') }), _jsx(TableCell, { className: "truncate max-w-xs", title: cn.reason, children: cn.reason || '-' }), _jsx(TableCell, { className: "font-medium", children: new Intl.NumberFormat('en-US', {
                                                        style: 'currency',
                                                        currency: cn.currency || 'USD'
                                                    }).format(cn.totalAmount || 0) }), _jsx(TableCell, { children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Button, { variant: "ghost", size: "sm", onClick: () => handleViewCreditNote(cn), className: "h-8 w-8 p-0", children: _jsx(Eye, { className: "w-4 h-4" }) }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => handleDeleteCreditNote(cn.id), className: "h-8 w-8 p-0 text-red-600 hover:text-red-700", disabled: deleteMutation.isPending, children: _jsx(Trash2, { className: "w-4 h-4" }) })] }) })] }, cn.id))) })] })) })] }), _jsx(Dialog, { open: createOpen, onOpenChange: setCreateOpen, children: _jsxs(DialogContent, { className: "max-w-4xl max-h-[90vh] overflow-y-auto", children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { children: "Create New Credit Note" }) }), _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-700 mb-1 block", children: "Reason *" }), _jsx(Input, { value: createForm.reason, onChange: (e) => setCreateForm(prev => ({ ...prev, reason: e.target.value })), placeholder: "Reason for credit note" })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-700 mb-1 block", children: "Customer" }), _jsxs(Select, { value: createForm.customerId || 'none', onValueChange: (value) => setCreateForm(prev => ({ ...prev, customerId: value === 'none' ? undefined : value })), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select customer..." }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "none", children: "No customer selected" }), customers && customers.length > 0 ? (customers.map((customer) => (_jsx(SelectItem, { value: customer.id, children: _jsxs("div", { className: "flex flex-col", children: [_jsx("span", { className: "font-medium", children: customer.name }), customer.email && (_jsx("span", { className: "text-sm text-gray-500", children: customer.email }))] }) }, customer.id)))) : (_jsx("div", { className: "px-2 py-1 text-sm text-gray-500", children: "No customers available" }))] })] })] })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-700 mb-1 block", children: "Select Invoice (Optional)" }), _jsxs(Select, { value: selectedInvoiceId, onValueChange: handleInvoiceSelection, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Choose an invoice..." }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "none", children: "No invoice selected" }), invoices && invoices.length > 0 ? (invoices.map((invoice) => (_jsx(SelectItem, { value: invoice.id, children: _jsxs("div", { className: "flex flex-col", children: [_jsx("span", { className: "font-medium", children: invoice.invoiceNumber }), _jsxs("span", { className: "text-sm text-gray-500", children: [invoice.customer?.name || 'Unknown Customer', " \u2022", new Intl.NumberFormat('en-US', {
                                                                                        style: 'currency',
                                                                                        currency: invoice.currency || 'USD'
                                                                                    }).format(invoice.totalAmount || 0), " \u2022", format(new Date(invoice.issueDate), 'MMM dd, yyyy')] })] }) }, invoice.id)))) : (_jsx("div", { className: "px-2 py-1 text-sm text-gray-500", children: invoicesLoading ? 'Loading invoices...' :
                                                                        invoicesError ? `Error loading invoices: ${invoicesError.message}` :
                                                                            'No invoices available for this company' }))] })] }), selectedInvoiceId && selectedInvoiceId !== 'none' && (_jsxs("div", { className: "flex items-center justify-between mt-1", children: [_jsx("p", { className: "text-xs text-green-600", children: "\u2713 Invoice selected - Credit note lines will be auto-populated" }), _jsx(Button, { type: "button", variant: "ghost", size: "sm", onClick: () => {
                                                                setSelectedInvoiceId('none');
                                                                setCreateForm(prev => ({
                                                                    ...prev,
                                                                    lines: [{ description: '', quantity: 1, unitPrice: 0 }]
                                                                }));
                                                            }, className: "h-6 px-2 text-xs text-gray-500 hover:text-gray-700", children: "Clear" })] }))] }) }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-700 mb-1 block", children: "Notes" }), _jsx(Textarea, { value: createForm.notes || '', onChange: (e) => setCreateForm(prev => ({ ...prev, notes: e.target.value })), placeholder: "Additional notes", rows: 3 })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-700 mb-1 block", children: "Terms" }), _jsx(Textarea, { value: createForm.terms || '', onChange: (e) => setCreateForm(prev => ({ ...prev, terms: e.target.value })), placeholder: "Payment terms", rows: 3 })] })] }), selectedInvoiceId && selectedInvoiceId !== 'none' && invoices && (_jsxs("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-4", children: [_jsx("h4", { className: "font-medium text-blue-900 mb-2", children: "Selected Invoice Details" }), (() => {
                                                const selectedInvoice = invoices.find((inv) => inv.id === selectedInvoiceId);
                                                return selectedInvoice ? (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("span", { className: "text-blue-700 font-medium", children: "Invoice #:" }), _jsx("span", { className: "ml-2", children: selectedInvoice.invoiceNumber })] }), _jsxs("div", { children: [_jsx("span", { className: "text-blue-700 font-medium", children: "Customer:" }), _jsx("span", { className: "ml-2", children: selectedInvoice.customer?.name || 'Unknown' })] }), _jsxs("div", { children: [_jsx("span", { className: "text-blue-700 font-medium", children: "Total Amount:" }), _jsx("span", { className: "ml-2", children: new Intl.NumberFormat('en-US', {
                                                                        style: 'currency',
                                                                        currency: selectedInvoice.currency || 'USD'
                                                                    }).format(selectedInvoice.totalAmount || 0) })] }), _jsxs("div", { children: [_jsx("span", { className: "text-blue-700 font-medium", children: "Issue Date:" }), _jsx("span", { className: "ml-2", children: format(new Date(selectedInvoice.issueDate), 'MMM dd, yyyy') })] }), _jsxs("div", { children: [_jsx("span", { className: "text-blue-700 font-medium", children: "Status:" }), _jsx("span", { className: "ml-2 capitalize", children: selectedInvoice.status })] }), _jsxs("div", { children: [_jsx("span", { className: "text-blue-700 font-medium", children: "Lines:" }), _jsxs("span", { className: "ml-2", children: [selectedInvoice.lines?.length || 0, " items"] })] })] })) : null;
                                            })()] })), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("label", { className: "text-sm font-medium text-gray-700", children: "Credit Note Lines *" }), _jsxs(Button, { type: "button", variant: "outline", size: "sm", onClick: addCreditNoteLine, className: "flex items-center gap-2", children: [_jsx(Plus, { className: "w-4 h-4" }), "Add Line"] })] }), _jsx("div", { className: "space-y-3", children: createForm.lines.map((line, index) => (_jsxs("div", { className: "grid grid-cols-12 gap-2 items-end p-3 border rounded-lg", children: [_jsxs("div", { className: "col-span-5", children: [_jsx("label", { className: "text-xs text-gray-600 mb-1 block", children: "Description" }), _jsx(Input, { value: line.description, onChange: (e) => updateCreditNoteLine(index, 'description', e.target.value), placeholder: "Item description" })] }), _jsxs("div", { className: "col-span-2", children: [_jsx("label", { className: "text-xs text-gray-600 mb-1 block", children: "Quantity" }), _jsx(Input, { type: "number", value: line.quantity, onChange: (e) => updateCreditNoteLine(index, 'quantity', parseFloat(e.target.value) || 0), placeholder: "1" })] }), _jsxs("div", { className: "col-span-2", children: [_jsx("label", { className: "text-xs text-gray-600 mb-1 block", children: "Unit Price" }), _jsx(Input, { type: "number", step: "0.01", value: line.unitPrice, onChange: (e) => updateCreditNoteLine(index, 'unitPrice', parseFloat(e.target.value) || 0), placeholder: "0.00" })] }), _jsxs("div", { className: "col-span-2", children: [_jsx("label", { className: "text-xs text-gray-600 mb-1 block", children: "Total" }), _jsx(Input, { value: (line.quantity * line.unitPrice).toFixed(2), disabled: true, className: "bg-gray-50" })] }), _jsx("div", { className: "col-span-1", children: _jsx(Button, { type: "button", variant: "ghost", size: "sm", onClick: () => removeCreditNoteLine(index), className: "h-8 w-8 p-0 text-red-600 hover:text-red-700", disabled: createForm.lines.length === 1, children: _jsx(Trash2, { className: "w-4 h-4" }) }) })] }, index))) })] }), _jsx("div", { className: "bg-gray-50 p-4 rounded-lg", children: _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-lg font-medium", children: "Total Amount:" }), _jsx("span", { className: "text-lg font-bold", children: new Intl.NumberFormat('en-US', {
                                                        style: 'currency',
                                                        currency: 'USD'
                                                    }).format(createForm.lines.reduce((sum, line) => sum + (line.quantity * line.unitPrice), 0)) })] }) }), (!createForm.reason || createForm.lines.length === 0) && (_jsx("div", { className: "bg-yellow-50 border border-yellow-200 rounded-lg p-3", children: _jsxs("p", { className: "text-sm text-yellow-800", children: [!createForm.reason && 'Please provide a reason for the credit note. ', createForm.lines.length === 0 && 'Please add at least one line item.'] }) })), _jsxs("div", { className: "flex justify-end gap-3", children: [_jsx(Button, { variant: "outline", onClick: () => setCreateOpen(false), children: "Cancel" }), _jsx(Button, { onClick: handleCreateCreditNote, disabled: !createForm.reason || createForm.lines.length === 0 || createMutation.isPending, className: "min-w-[140px]", children: createMutation.isPending ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "w-4 h-4 mr-2 animate-spin" }), "Creating..."] })) : (_jsxs(_Fragment, { children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), "Create Credit Note"] })) })] })] })] }) }), _jsx(Dialog, { open: viewOpen, onOpenChange: setViewOpen, children: _jsxs(DialogContent, { className: "max-w-4xl max-h-[90vh] overflow-y-auto", children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { children: "Credit Note Details" }) }), selectedCreditNote && (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold mb-4", children: "Credit Note Information" }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600", children: "Credit Note #:" }), _jsx("span", { className: "font-medium", children: selectedCreditNote.creditNoteNumber })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600", children: "Status:" }), getStatusBadge(selectedCreditNote.status)] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600", children: "Issue Date:" }), _jsx("span", { children: format(new Date(selectedCreditNote.issueDate), 'MMM dd, yyyy') })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600", children: "Total Amount:" }), _jsx("span", { className: "font-bold", children: new Intl.NumberFormat('en-US', {
                                                                            style: 'currency',
                                                                            currency: selectedCreditNote.currency || 'USD'
                                                                        }).format(selectedCreditNote.totalAmount) })] })] })] }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold mb-4", children: "Related Information" }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600", children: "Customer:" }), _jsx("span", { children: selectedCreditNote.customer?.name || '-' })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600", children: "Invoice:" }), _jsx("span", { children: selectedCreditNote.invoice?.invoiceNumber || '-' })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600", children: "Reason:" }), _jsx("span", { className: "text-right max-w-48", children: selectedCreditNote.reason || '-' })] })] })] })] }), selectedCreditNote.lines && selectedCreditNote.lines.length > 0 && (_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold mb-4", children: "Credit Note Lines" }), _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { children: "Description" }), _jsx(TableHead, { children: "Quantity" }), _jsx(TableHead, { children: "Unit Price" }), _jsx(TableHead, { children: "Total" })] }) }), _jsx(TableBody, { children: selectedCreditNote.lines.map((line, index) => (_jsxs(TableRow, { children: [_jsx(TableCell, { children: line.description }), _jsx(TableCell, { children: line.quantity }), _jsx(TableCell, { children: new Intl.NumberFormat('en-US', {
                                                                        style: 'currency',
                                                                        currency: selectedCreditNote.currency || 'USD'
                                                                    }).format(line.unitPrice) }), _jsx(TableCell, { className: "font-medium", children: new Intl.NumberFormat('en-US', {
                                                                        style: 'currency',
                                                                        currency: selectedCreditNote.currency || 'USD'
                                                                    }).format(line.totalAmount) })] }, index))) })] })] })), (selectedCreditNote.notes || selectedCreditNote.terms) && (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [selectedCreditNote.notes && (_jsxs("div", { children: [_jsx("h4", { className: "font-medium mb-2", children: "Notes" }), _jsx("p", { className: "text-gray-600 text-sm", children: selectedCreditNote.notes })] })), selectedCreditNote.terms && (_jsxs("div", { children: [_jsx("h4", { className: "font-medium mb-2", children: "Terms" }), _jsx("p", { className: "text-gray-600 text-sm", children: selectedCreditNote.terms })] }))] })), _jsx("div", { className: "flex justify-end gap-3 pt-4 border-t", children: _jsx(Button, { variant: "outline", onClick: () => setViewOpen(false), children: "Close" }) })] }))] }) })] }) }));
}
