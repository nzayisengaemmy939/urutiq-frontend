import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useMemo } from "react";
// Utility function to ensure SelectItem values are never empty
const safeSelectValue = (value) => {
    if (!value || value.trim() === '') {
        return 'placeholder-value-' + Math.random().toString(36).substr(2, 9);
    }
    return value.trim();
};
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { useToast } from "../hooks/use-toast";
import { FileText, Plus, Edit, Trash2, CheckCircle, XCircle, AlertCircle, Calendar, DollarSign, Hash, ChevronLeft, ChevronRight, ChevronsRight, ChevronsLeft, Calculator, Search, Filter, Copy, RefreshCw } from "lucide-react";
import { accountingApi } from "../lib/api/accounting";
export function JournalEntries() {
    const { toast } = useToast();
    const [journalEntries, setJournalEntries] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // Form states
    const [showEntryDialog, setShowEntryDialog] = useState(false);
    const [editingEntry, setEditingEntry] = useState(null);
    const [entryForm, setEntryForm] = useState({
        reference: "",
        description: "",
        date: new Date().toISOString().split('T')[0],
        lines: [{ accountId: "", description: "", debit: 0, credit: 0 }]
    });
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [totalEntries, setTotalEntries] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    // Search and filtering
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [dateFilter, setDateFilter] = useState("all");
    const [showFilters, setShowFilters] = useState(false);
    // Load data on component mount
    useEffect(() => {
        loadData();
    }, [currentPage, pageSize]);
    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);
            const [entriesData, accountsData] = await Promise.all([
                accountingApi.journalEntriesApi.getAll(undefined, currentPage, pageSize),
                accountingApi.chartOfAccountsApi.getAll()
            ]);
            setJournalEntries(entriesData.entries || entriesData);
            // entriesData may be paginated or an array
            setTotalEntries(entriesData.pagination?.totalCount || entriesData.length || 0);
            setTotalPages(entriesData.pagination?.totalPages || 1);
            // Handle both paginated and non-paginated account responses
            if (Array.isArray(accountsData)) {
                setAccounts(accountsData);
            }
            else {
                setAccounts(accountsData.accounts || []);
            }
        }
        catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load data");
        }
        finally {
            setLoading(false);
        }
    };
    const handleEntrySubmit = async (e) => {
        e.preventDefault();
        // Validate balance
        if (!isEntryBalanced()) {
            toast({
                title: "Validation Error",
                description: "Journal entry must be balanced (total debits = total credits)",
                variant: "destructive"
            });
            return;
        }
        try {
            if (editingEntry) {
                await accountingApi.journalEntriesApi.update(editingEntry.id, entryForm);
                toast({
                    title: "Success",
                    description: "Journal entry updated successfully",
                    variant: "default"
                });
            }
            else {
                await accountingApi.journalEntriesApi.create(entryForm);
                toast({
                    title: "Success",
                    description: "Journal entry created successfully",
                    variant: "default"
                });
            }
            setShowEntryDialog(false);
            resetEntryForm();
            loadData();
            setError(null);
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to save journal entry";
            setError(errorMessage);
            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive"
            });
        }
    };
    const handleDeleteEntry = async (entryId) => {
        if (confirm("Are you sure you want to delete this journal entry? This action cannot be undone.")) {
            try {
                await accountingApi.journalEntriesApi.delete(entryId);
                toast({
                    title: "Success",
                    description: "Journal entry deleted successfully",
                    variant: "default"
                });
                loadData();
            }
            catch (err) {
                const errorMessage = err instanceof Error ? err.message : "Failed to delete journal entry";
                setError(errorMessage);
                toast({
                    title: "Error",
                    description: errorMessage,
                    variant: "destructive"
                });
            }
        }
    };
    const handlePostEntry = async (entryId) => {
        try {
            await accountingApi.journalEntriesApi.post(entryId);
            toast({
                title: "Success",
                description: "Journal entry posted successfully",
                variant: "default"
            });
            loadData();
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to post journal entry";
            setError(errorMessage);
            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive"
            });
        }
    };
    const handleCopyEntry = (entry) => {
        setEntryForm({
            reference: `${entry.reference}-COPY`,
            description: entry.description,
            date: new Date().toISOString().split('T')[0],
            lines: entry.lines.map(line => ({
                accountId: line.accountId,
                description: line.description,
                debit: line.debit,
                credit: line.credit
            }))
        });
        setEditingEntry(null);
        setShowEntryDialog(true);
        toast({
            title: "Entry Copied",
            description: "Journal entry copied to form for editing",
            variant: "default"
        });
    };
    const resetEntryForm = () => {
        setEntryForm({
            reference: "",
            description: "",
            date: new Date().toISOString().split('T')[0],
            lines: [{ accountId: "", description: "", debit: 0, credit: 0 }]
        });
        setEditingEntry(null);
    };
    const editEntry = (entry) => {
        setEditingEntry(entry);
        setEntryForm({
            reference: entry.reference,
            description: entry.description,
            date: entry.date.split('T')[0],
            lines: entry.lines.map(line => ({
                accountId: line.accountId,
                description: line.description,
                debit: line.debit,
                credit: line.credit
            }))
        });
        setShowEntryDialog(true);
    };
    const addLine = () => {
        setEntryForm(prev => ({
            ...prev,
            lines: [...prev.lines, { accountId: "", description: "", debit: 0, credit: 0 }]
        }));
    };
    const removeLine = (index) => {
        if (entryForm.lines.length > 1) {
            setEntryForm(prev => ({
                ...prev,
                lines: prev.lines.filter((_, i) => i !== index)
            }));
        }
    };
    const updateLine = (index, field, value) => {
        setEntryForm(prev => ({
            ...prev,
            lines: prev.lines.map((line, i) => i === index ? { ...line, [field]: value } : line)
        }));
    };
    const isEntryBalanced = () => {
        const totalDebits = entryForm.lines.reduce((sum, line) => sum + (line.debit || 0), 0);
        const totalCredits = entryForm.lines.reduce((sum, line) => sum + (line.credit || 0), 0);
        return Math.abs(totalDebits - totalCredits) < 0.01;
    };
    const getTotalDebits = () => {
        return entryForm.lines.reduce((sum, line) => sum + (line.debit || 0), 0);
    };
    const getTotalCredits = () => {
        return entryForm.lines.reduce((sum, line) => sum + (line.credit || 0), 0);
    };
    const getBalanceDifference = () => {
        return Math.abs(getTotalDebits() - getTotalCredits());
    };
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };
    const getAccountName = (accountId) => {
        const account = accounts.find(acc => acc.id === accountId);
        return account ? `${account.code} - ${account.name}` : "Unknown Account";
    };
    // Filtered entries based on search and filters
    const filteredEntries = useMemo(() => {
        let filtered = journalEntries;
        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(entry => entry.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
                entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                entry.lines.some(line => line.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    getAccountName(line.accountId).toLowerCase().includes(searchTerm.toLowerCase())));
        }
        // Status filter
        if (statusFilter !== "all") {
            filtered = filtered.filter(entry => statusFilter === "posted" ? entry.isPosted : !entry.isPosted);
        }
        // Date filter
        if (dateFilter !== "all") {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
            filtered = filtered.filter(entry => {
                const entryDate = new Date(entry.date);
                switch (dateFilter) {
                    case "today":
                        return entryDate >= today;
                    case "week":
                        return entryDate >= weekAgo;
                    case "month":
                        return entryDate >= monthAgo;
                    default:
                        return true;
                }
            });
        }
        return filtered;
    }, [journalEntries, searchTerm, statusFilter, dateFilter, accounts]);
    const clearFilters = () => {
        setSearchTerm("");
        setStatusFilter("all");
        setDateFilter("all");
    };
    if (loading) {
        return (_jsx("div", { className: "flex items-center justify-center h-64", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4" }), _jsx("p", { className: "text-gray-600", children: "Loading Journal Entries..." })] }) }));
    }
    if (error) {
        return (_jsx("div", { className: "flex items-center justify-center h-64", children: _jsxs("div", { className: "text-center", children: [_jsx(AlertCircle, { className: "h-12 w-12 text-red-500 mx-auto mb-4" }), _jsx("p", { className: "text-red-600 mb-4", children: error }), _jsx(Button, { onClick: loadData, children: "Retry" })] }) }));
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold", children: "Journal Entries" }), _jsx("p", { className: "text-gray-600", children: "Record and manage financial transactions" })] }), _jsxs(Dialog, { open: showEntryDialog, onOpenChange: setShowEntryDialog, children: [_jsx(DialogTrigger, { asChild: true, children: _jsxs(Button, { onClick: () => setShowEntryDialog(true), className: "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105", children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "New Entry"] }) }), _jsxs(DialogContent, { className: "max-w-5xl max-h-[90vh] overflow-y-auto", children: [_jsxs(DialogHeader, { className: "border-b pb-4", children: [_jsxs(DialogTitle, { className: "text-2xl font-bold flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center", children: _jsx(FileText, { className: "w-5 h-5 text-blue-600" }) }), editingEntry ? "Edit Journal Entry" : "New Journal Entry"] }), _jsx(DialogDescription, { className: "text-base text-muted-foreground mt-2", children: editingEntry ? "Update journal entry details and line items" : "Create a new journal entry with balanced debit and credit lines" })] }), _jsxs("form", { onSubmit: handleEntrySubmit, children: [_jsxs("div", { className: "space-y-6 pt-4", children: [_jsxs("div", { className: "bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200", children: [_jsxs("h3", { className: "text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2", children: [_jsx(Hash, { className: "w-5 h-5" }), "Entry Information"] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "reference", className: "text-sm font-medium text-blue-800", children: "Reference Number" }), _jsx(Input, { id: "reference", value: entryForm.reference, onChange: (e) => setEntryForm(prev => ({ ...prev, reference: e.target.value })), placeholder: "JE-001", className: "border-blue-200 focus:border-blue-400 focus:ring-blue-400", required: true })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "date", className: "text-sm font-medium text-blue-800", children: "Transaction Date" }), _jsx(Input, { id: "date", type: "date", value: entryForm.date, onChange: (e) => setEntryForm(prev => ({ ...prev, date: e.target.value })), className: "border-blue-200 focus:border-blue-400 focus:ring-blue-400", required: true })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "description", className: "text-sm font-medium text-blue-800", children: "Description" }), _jsx(Input, { id: "description", value: entryForm.description, onChange: (e) => setEntryForm(prev => ({ ...prev, description: e.target.value })), placeholder: "Transaction description", className: "border-blue-200 focus:border-blue-400 focus:ring-blue-400", required: true })] })] })] }), _jsxs("div", { className: "bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsxs("h3", { className: "text-lg font-semibold text-green-900 flex items-center gap-2", children: [_jsx(DollarSign, { className: "w-5 h-5" }), "Journal Lines"] }), _jsxs(Button, { type: "button", variant: "outline", size: "sm", onClick: addLine, className: "border-green-300 text-green-700 hover:bg-green-100 hover:border-green-400", children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "Add Line"] })] }), _jsx("div", { className: "space-y-4", children: entryForm.lines.map((line, index) => (_jsx("div", { className: "bg-white p-4 rounded-lg border border-green-200 shadow-sm hover:shadow-md transition-shadow", children: _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-12 gap-4 items-end", children: [_jsxs("div", { className: "lg:col-span-4", children: [_jsx(Label, { className: "text-sm font-medium text-green-800 mb-2 block", children: "Account" }), _jsxs(Select, { value: line.accountId, onValueChange: (value) => updateLine(index, 'accountId', value), children: [_jsx(SelectTrigger, { className: "border-green-200 focus:border-green-400 focus:ring-green-400", children: _jsx(SelectValue, { placeholder: "Select account" }) }), _jsx(SelectContent, { children: loading ? (_jsx(SelectItem, { value: "loading", disabled: true, children: "Loading accounts..." })) : (accounts || []).length === 0 ? (_jsx(SelectItem, { value: "no-accounts", disabled: true, children: "No accounts available" })) : ((accounts || []).map(account => (_jsx(SelectItem, { value: safeSelectValue(account.id), children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "font-mono text-sm", children: account.code }), _jsx("span", { className: "text-muted-foreground", children: "-" }), _jsx("span", { children: account.name })] }) }, account.id)))) })] })] }), _jsxs("div", { className: "lg:col-span-4", children: [_jsx(Label, { className: "text-sm font-medium text-green-800 mb-2 block", children: "Description" }), _jsx(Input, { value: line.description, onChange: (e) => updateLine(index, 'description', e.target.value), placeholder: "Line description", className: "border-green-200 focus:border-green-400 focus:ring-green-400" })] }), _jsxs("div", { className: "lg:col-span-2", children: [_jsx(Label, { className: "text-sm font-medium text-green-800 mb-2 block", children: "Debit Amount" }), _jsx(Input, { type: "number", step: "0.01", min: "0", value: line.debit, onChange: (e) => updateLine(index, 'debit', parseFloat(e.target.value) || 0), placeholder: "0.00", className: "border-green-200 focus:border-green-400 focus:ring-green-400 text-right" })] }), _jsxs("div", { className: "lg:col-span-1", children: [_jsx(Label, { className: "text-sm font-medium text-green-800 mb-2 block", children: "Credit Amount" }), _jsx(Input, { type: "number", step: "0.01", min: "0", value: line.credit, onChange: (e) => updateLine(index, 'credit', parseFloat(e.target.value) || 0), placeholder: "0.00", className: "border-green-200 focus:border-green-400 focus:ring-green-400 text-right" })] }), _jsx("div", { className: "lg:col-span-1", children: _jsx(Button, { type: "button", variant: "ghost", size: "sm", onClick: () => removeLine(index), disabled: entryForm.lines.length === 1, className: "h-10 w-10 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors", children: _jsx(Trash2, { className: "h-4 w-4" }) }) })] }) }, index))) })] }), _jsxs("div", { className: "bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200", children: [_jsxs("h3", { className: "text-lg font-semibold text-purple-900 mb-6 flex items-center gap-2", children: [_jsx(Calculator, { className: "w-5 h-5" }), "Balance Summary"] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6 mb-6", children: [_jsxs("div", { className: "bg-white p-4 rounded-lg border border-purple-200 shadow-sm", children: [_jsx(Label, { className: "text-sm font-medium text-purple-800 mb-2 block text-center", children: "Total Debits" }), _jsx("div", { className: "text-2xl font-bold text-green-600 text-center", children: formatCurrency(getTotalDebits()) })] }), _jsxs("div", { className: "bg-white p-4 rounded-lg border border-purple-200 shadow-sm", children: [_jsx(Label, { className: "text-sm font-medium text-purple-800 mb-2 block text-center", children: "Total Credits" }), _jsx("div", { className: "text-2xl font-bold text-blue-600 text-center", children: formatCurrency(getTotalCredits()) })] }), _jsxs("div", { className: "bg-white p-4 rounded-lg border border-purple-200 shadow-sm", children: [_jsx(Label, { className: "text-sm font-medium text-purple-800 mb-2 block text-center", children: "Difference" }), _jsx("div", { className: `text-2xl font-bold text-center ${getBalanceDifference() < 0.01 ? 'text-green-600' : 'text-red-600'}`, children: formatCurrency(getBalanceDifference()) })] })] }), getBalanceDifference() < 0.01 ? (_jsxs("div", { className: "bg-green-100 border border-green-300 rounded-lg p-4 flex items-center justify-center gap-3 text-green-800", children: [_jsx(CheckCircle, { className: "h-6 w-6 text-green-600" }), _jsx("span", { className: "text-lg font-semibold", children: "Entry is Balanced \u2713" })] })) : (_jsxs("div", { className: "bg-red-100 border border-red-300 rounded-lg p-4 flex items-center justify-center gap-3 text-red-800", children: [_jsx(XCircle, { className: "h-6 w-6 text-red-600" }), _jsx("span", { className: "text-lg font-semibold", children: "Entry is Not Balanced \u2717" }), _jsxs("span", { className: "text-sm text-red-600", children: ["(Difference: ", formatCurrency(getBalanceDifference()), ")"] })] }))] })] }), _jsx(DialogFooter, { className: "mt-8 pt-6 border-t border-gray-200", children: _jsxs("div", { className: "flex items-center gap-3 w-full", children: [_jsx(Button, { type: "button", variant: "outline", onClick: () => setShowEntryDialog(false), className: "flex-1 md:flex-none", children: "Cancel" }), _jsx(Button, { type: "submit", disabled: !isEntryBalanced(), className: `flex-1 md:flex-none ${isEntryBalanced()
                                                                ? 'bg-green-600 hover:bg-green-700 text-white'
                                                                : 'bg-gray-400 cursor-not-allowed'}`, children: editingEntry ? (_jsxs(_Fragment, { children: [_jsx(Edit, { className: "h-4 w-4 mr-2" }), "Update Entry"] })) : (_jsxs(_Fragment, { children: [_jsx(CheckCircle, { className: "h-4 w-4 mr-2" }), "Create Entry"] })) })] }) })] })] })] })] }), _jsx(Card, { children: _jsxs(CardHeader, { className: "pb-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" }), _jsx(Input, { placeholder: "Search journal entries...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "pl-10 w-80" })] }), _jsxs(Button, { variant: "outline", onClick: () => setShowFilters(!showFilters), className: "flex items-center gap-2", children: [_jsx(Filter, { className: "h-4 w-4" }), "Filters", (statusFilter !== "all" || dateFilter !== "all") && (_jsx(Badge, { variant: "secondary", className: "ml-1", children: (statusFilter !== "all" ? 1 : 0) + (dateFilter !== "all" ? 1 : 0) }))] }), (searchTerm || statusFilter !== "all" || dateFilter !== "all") && (_jsx(Button, { variant: "ghost", onClick: clearFilters, className: "text-gray-500 hover:text-gray-700", children: "Clear Filters" }))] }), _jsx("div", { className: "flex items-center gap-2", children: _jsxs(Button, { variant: "outline", size: "sm", onClick: loadData, disabled: loading, className: "flex items-center gap-2", children: [_jsx(RefreshCw, { className: `h-4 w-4 ${loading ? 'animate-spin' : ''}` }), "Refresh"] }) })] }), showFilters && (_jsx("div", { className: "mt-4 pt-4 border-t border-gray-200", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { className: "text-sm font-medium mb-2 block", children: "Status" }), _jsxs(Select, { value: statusFilter, onValueChange: (value) => setStatusFilter(value), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All Status" }), _jsx(SelectItem, { value: "draft", children: "Draft" }), _jsx(SelectItem, { value: "posted", children: "Posted" })] })] })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-sm font-medium mb-2 block", children: "Date Range" }), _jsxs(Select, { value: dateFilter, onValueChange: (value) => setDateFilter(value), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All Time" }), _jsx(SelectItem, { value: "today", children: "Today" }), _jsx(SelectItem, { value: "week", children: "Last 7 Days" }), _jsx(SelectItem, { value: "month", children: "Last 30 Days" })] })] })] }), _jsx("div", { className: "flex items-end", children: _jsx(Button, { variant: "outline", onClick: clearFilters, className: "w-full", children: "Clear All Filters" }) })] }) }))] }) }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium", children: "Total Entries" }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: filteredEntries.length }), _jsx("p", { className: "text-xs text-gray-600", children: filteredEntries.length !== journalEntries.length
                                            ? `Filtered from ${journalEntries.length} total`
                                            : 'All entries' })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium", children: "Posted Entries" }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold text-green-600", children: filteredEntries.filter(entry => entry.isPosted).length }), _jsx("p", { className: "text-xs text-gray-600", children: "Ready for posting" })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium", children: "Draft Entries" }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold text-orange-600", children: filteredEntries.filter(entry => !entry.isPosted).length }), _jsx("p", { className: "text-xs text-gray-600", children: "Pending review" })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium", children: "This Month" }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: filteredEntries.filter(entry => {
                                            const entryDate = new Date(entry.date);
                                            const now = new Date();
                                            return entryDate.getMonth() === now.getMonth() &&
                                                entryDate.getFullYear() === now.getFullYear();
                                        }).length }), _jsx("p", { className: "text-xs text-gray-600", children: "Current period" })] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(FileText, { className: "h-5 w-5" }), "All Journal Entries"] }), _jsx(CardDescription, { children: "View and manage all journal entries in the system" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-3", children: [filteredEntries.map(entry => (_jsx("div", { className: "border rounded-lg p-4 hover:bg-gray-50 transition-colors", children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-3 mb-2", children: [_jsx(Badge, { variant: entry.isPosted ? "default" : "secondary", children: entry.isPosted ? "Posted" : "Draft" }), _jsx("span", { className: "font-mono text-sm text-gray-600", children: entry.reference }), _jsxs("span", { className: "text-sm text-gray-500", children: [_jsx(Calendar, { className: "h-3 w-3 inline mr-1" }), new Date(entry.date).toLocaleDateString()] })] }), _jsx("h4", { className: "font-medium mb-2", children: entry.description }), _jsx("div", { className: "space-y-2", children: entry.lines.map((line, index) => (_jsxs("div", { className: "flex items-center gap-4 text-sm", children: [_jsx("span", { className: "w-32 text-gray-600", children: getAccountName(line.accountId) }), _jsx("span", { className: "w-48 text-gray-700", children: line.description }), _jsxs("div", { className: "flex gap-4", children: [_jsx("span", { className: `w-20 text-right ${line.debit > 0 ? 'text-green-600 font-medium' : 'text-gray-400'}`, children: line.debit > 0 ? formatCurrency(line.debit) : '-' }), _jsx("span", { className: `w-20 text-right ${line.credit > 0 ? 'text-blue-600 font-medium' : 'text-gray-400'}`, children: line.credit > 0 ? formatCurrency(line.credit) : '-' })] })] }, index))) })] }), _jsxs("div", { className: "flex items-center gap-2 ml-4", children: [!entry.isPosted && (_jsxs(Button, { variant: "outline", size: "sm", onClick: () => handlePostEntry(entry.id), className: "text-green-600 hover:text-green-700", children: [_jsx(CheckCircle, { className: "h-4 w-4 mr-1" }), "Post"] })), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => handleCopyEntry(entry), className: "h-8 w-8 p-0 text-blue-600 hover:text-blue-700", title: "Copy Entry", children: _jsx(Copy, { className: "h-4 w-4" }) }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => editEntry(entry), className: "h-8 w-8 p-0", title: "Edit Entry", children: _jsx(Edit, { className: "h-4 w-4" }) }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => handleDeleteEntry(entry.id), className: "h-8 w-8 p-0 text-red-600 hover:text-red-700", title: "Delete Entry", children: _jsx(Trash2, { className: "h-4 w-4" }) })] })] }) }, entry.id))), filteredEntries.length === 0 && (_jsxs("div", { className: "text-center py-8 text-gray-500", children: [_jsx(FileText, { className: "h-12 w-12 mx-auto mb-4 text-gray-300" }), journalEntries.length === 0 ? (_jsxs(_Fragment, { children: [_jsx("p", { children: "No journal entries found" }), _jsx("p", { className: "text-sm", children: "Create your first journal entry to get started" })] })) : (_jsxs(_Fragment, { children: [_jsx("p", { children: "No entries match your filters" }), _jsx("p", { className: "text-sm", children: "Try adjusting your search or filter criteria" }), _jsx(Button, { variant: "outline", onClick: clearFilters, className: "mt-4", children: "Clear Filters" })] }))] })), totalPages > 1 && (_jsxs("div", { className: "flex items-center justify-between mt-6 pt-6 border-t", children: [_jsxs("div", { className: "text-sm text-gray-600", children: ["Showing ", ((currentPage - 1) * pageSize) + 1, " to ", Math.min(currentPage * pageSize, totalEntries), " of ", totalEntries, " entries"] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Button, { variant: "outline", size: "sm", onClick: () => setCurrentPage(1), disabled: currentPage === 1, children: _jsx(ChevronsLeft, { className: "h-4 w-4" }) }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => setCurrentPage(currentPage - 1), disabled: currentPage === 1, children: _jsx(ChevronLeft, { className: "h-4 w-4" }) }), _jsxs("span", { className: "text-sm text-gray-600", children: ["Page ", currentPage, " of ", totalPages] }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => setCurrentPage(currentPage + 1), disabled: currentPage === totalPages, children: _jsx(ChevronRight, { className: "h-4 w-4" }) }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => setCurrentPage(totalPages), disabled: currentPage === totalPages, children: _jsx(ChevronsRight, { className: "h-4 w-4" }) })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-sm text-gray-600", children: "Page size:" }), _jsxs(Select, { value: pageSize.toString(), onValueChange: (value) => {
                                                        setPageSize(parseInt(value));
                                                        setCurrentPage(1);
                                                    }, children: [_jsx(SelectTrigger, { className: "w-20", children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "10", children: "10" }), _jsx(SelectItem, { value: "20", children: "20" }), _jsx(SelectItem, { value: "50", children: "50" }), _jsx(SelectItem, { value: "100", children: "100" })] })] })] })] }))] }) })] })] }));
}
