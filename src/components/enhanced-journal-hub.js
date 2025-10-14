import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { BookOpen, Search, Plus, CheckCircle, Clock, XCircle, FileText, TrendingUp, BarChart3, Edit, Copy, RotateCcw, Shield, Settings2 } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import apiService from '../lib/api';
import { useAuth } from '../contexts/auth-context';
import { UnifiedJournalWorkflow } from './unified-journal-workflow';
import { JournalDataOperations } from './journal-data-operations';
import { AdvancedJournalSearch } from './advanced-journal-search';
import { EmailNotificationSettings } from './email-notification-settings';
import { JournalPDFGeneration, QuickPDFActions, BatchPDFActions } from './journal-pdf-generation';
export function EnhancedJournalHub({ companyId }) {
    const { toast } = useToast();
    const { isAuthenticated, user } = useAuth();
    const queryClient = useQueryClient();
    // State
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [entryTypeFilter, setEntryTypeFilter] = useState("all");
    const [dateRange, setDateRange] = useState({});
    const [selectedEntry, setSelectedEntry] = useState(null);
    const [showWorkflow, setShowWorkflow] = useState(false);
    const [workflowMode, setWorkflowMode] = useState('create');
    const [selectedEntryForWorkflow, setSelectedEntryForWorkflow] = useState(null);
    const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
    const [searchResults, setSearchResults] = useState(null);
    const [showPDFDialog, setShowPDFDialog] = useState(false);
    const [selectedEntryForPDF, setSelectedEntryForPDF] = useState(null);
    const [selectedEntriesForBatchPDF, setSelectedEntriesForBatchPDF] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    // Reset pagination when filters change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter, entryTypeFilter, dateRange]);
    const [activeTab, setActiveTab] = useState("entries");
    const [showReversalDialog, setShowReversalDialog] = useState(false);
    const [showAdjustmentDialog, setShowAdjustmentDialog] = useState(false);
    const [showApprovalDialog, setShowApprovalDialog] = useState(false);
    const [showMetricsDialog, setShowMetricsDialog] = useState(false);
    const [reversalData, setReversalData] = useState({ reason: '', reverseDate: '' });
    const [adjustmentData, setAdjustmentData] = useState({ adjustments: [], reason: '' });
    const [approvalData, setApprovalData] = useState({ approvers: [], comments: '' });
    // Fetch data with error handling and fallback
    const { data: entriesResponse, isLoading: entriesLoading, error: entriesError } = useQuery({
        queryKey: ['journal-entries', companyId, searchTerm, statusFilter, entryTypeFilter, dateRange, currentPage, pageSize],
        queryFn: () => apiService.getJournalEntries({
            reference: searchTerm || undefined,
            status: statusFilter !== 'all' ? statusFilter : undefined,
            entryType: entryTypeFilter !== 'all' ? entryTypeFilter : undefined,
            dateFrom: dateRange.from,
            dateTo: dateRange.to,
            page: currentPage,
            pageSize: pageSize
        }),
        enabled: !!companyId && isAuthenticated,
        retry: false, // Don't retry on 400 errors
        staleTime: 0 // Always fetch fresh data
    });
    const { data: summaryResponse, isLoading: summaryLoading } = useQuery({
        queryKey: ['journal-hub-summary', companyId],
        queryFn: () => apiService.getJournalSummary({ companyId }),
        enabled: !!companyId && isAuthenticated
    });
    const { data: entryTypesResponse, isLoading: entryTypesLoading } = useQuery({
        queryKey: ['journal-entry-types', companyId],
        queryFn: () => apiService.getJournalEntryTypes({ companyId }),
        enabled: !!companyId && isAuthenticated
    });
    const { data: approvalsResponse, isLoading: approvalsLoading } = useQuery({
        queryKey: ['journal-pending-approvals', companyId],
        queryFn: () => apiService.getPendingApprovals(),
        enabled: !!companyId && isAuthenticated
    });
    const { data: metricsResponse, isLoading: metricsLoading } = useQuery({
        queryKey: ['journal-metrics', companyId],
        queryFn: () => apiService.getJournalMetrics({ companyId }),
        enabled: !!companyId && isAuthenticated
    });
    const { data: permissionsResponse, isLoading: permissionsLoading } = useQuery({
        queryKey: ['journal-permissions', user?.id, companyId],
        queryFn: () => apiService.getJournalPermissions(user?.id || '', companyId),
        enabled: !!user?.id && !!companyId && isAuthenticated
    });
    // Mutations
    const reverseEntryMutation = useMutation({
        mutationFn: ({ entryId, data }) => apiService.reverseJournalEntry(entryId, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
            queryClient.invalidateQueries({ queryKey: ['journal-hub-summary'] });
            // Enhanced success message with inventory information
            const inventoryInfo = data?.data?.inventoryMovementsReversed > 0
                ? ` and ${data.data.inventoryMovementsReversed} inventory movements reversed (${data.data.stockRestored} products restored)`
                : '';
            toast({
                title: "Success",
                description: `Journal entry reversed successfully${inventoryInfo}`
            });
            setShowReversalDialog(false);
        },
        onError: (error) => {
            toast({ title: "Error", description: error?.response?.data?.error || 'Failed to reverse entry', variant: "destructive" });
        }
    });
    const adjustEntryMutation = useMutation({
        mutationFn: ({ entryId, data }) => apiService.adjustJournalEntry(entryId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
            queryClient.invalidateQueries({ queryKey: ['journal-hub-summary'] });
            toast({ title: "Success", description: "Adjustment entry created successfully" });
            setShowAdjustmentDialog(false);
        },
        onError: (error) => {
            toast({ title: "Error", description: error?.response?.data?.error || 'Failed to create adjustment', variant: "destructive" });
        }
    });
    const requestApprovalMutation = useMutation({
        mutationFn: ({ entryId, data }) => apiService.requestJournalApproval(entryId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
            queryClient.invalidateQueries({ queryKey: ['journal-pending-approvals'] });
            toast({ title: "Success", description: "Approval request sent successfully" });
            setShowApprovalDialog(false);
        },
        onError: (error) => {
            toast({ title: "Error", description: error?.response?.data?.error || 'Failed to request approval', variant: "destructive" });
        }
    });
    // Handlers
    const handleWorkflowSuccess = (entry) => {
        setShowWorkflow(false);
        setSelectedEntryForWorkflow(null);
        queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
        queryClient.invalidateQueries({ queryKey: ['journal-hub-summary'] });
        toast({ title: "Success", description: "Journal entry created successfully" });
    };
    const handleWorkflowCancel = () => {
        setShowWorkflow(false);
        setSelectedEntryForWorkflow(null);
    };
    const handleEditEntry = (entry) => {
        setWorkflowMode('edit');
        setSelectedEntryForWorkflow(entry);
        setShowWorkflow(true);
    };
    const handleDuplicateEntry = (entry) => {
        setWorkflowMode('duplicate');
        setSelectedEntryForWorkflow(entry);
        setShowWorkflow(true);
    };
    const handleReverseEntry = (entry) => {
        setSelectedEntry(entry);
        setReversalData({ reason: '', reverseDate: '' });
        setShowReversalDialog(true);
    };
    const handleAdjustEntry = (entry) => {
        setSelectedEntry(entry);
        setAdjustmentData({ adjustments: [], reason: '' });
        setShowAdjustmentDialog(true);
    };
    const handleRequestApproval = (entry) => {
        setSelectedEntry(entry);
        setApprovalData({ approvers: [], comments: '' });
        setShowApprovalDialog(true);
    };
    const handleSubmitReversal = () => {
        if (!selectedEntry || !reversalData.reason)
            return;
        reverseEntryMutation.mutate({
            entryId: selectedEntry.id,
            data: reversalData
        });
    };
    const handleSubmitAdjustment = () => {
        if (!selectedEntry || !adjustmentData.reason || adjustmentData.adjustments.length === 0)
            return;
        adjustEntryMutation.mutate({
            entryId: selectedEntry.id,
            data: adjustmentData
        });
    };
    const handleSubmitApproval = () => {
        if (!selectedEntry || approvalData.approvers.length === 0)
            return;
        requestApprovalMutation.mutate({
            entryId: selectedEntry.id,
            data: approvalData
        });
    };
    const getStatusBadge = (status) => {
        const statusConfig = {
            'DRAFT': { color: 'bg-gray-100 text-gray-800', icon: FileText },
            'POSTED': { color: 'bg-green-100 text-green-800', icon: CheckCircle },
            'REVERSED': { color: 'bg-red-100 text-red-800', icon: RotateCcw },
            'PENDING_APPROVAL': { color: 'bg-yellow-100 text-yellow-800', icon: Clock }
        };
        const config = statusConfig[status] || statusConfig['DRAFT'];
        const Icon = config.icon;
        return (_jsxs(Badge, { className: config.color, children: [_jsx(Icon, { className: "w-3 h-3 mr-1" }), status.replace('_', ' ')] }));
    };
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };
    const entries = entriesResponse?.entries || [];
    const pagination = entriesResponse?.pagination || { total: 0, page: 1, pageSize: 10, totalPages: 0 };
    const summary = summaryResponse?.summary || {};
    const entryTypes = entryTypesResponse?.entryTypes || [];
    const pendingApprovals = approvalsResponse?.pendingApprovals || [];
    const metrics = metricsResponse?.metrics || {};
    const permissions = permissionsResponse?.permissions || {};
    return (_jsx("div", { className: "container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-[1600px]", children: _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Journal Entry Hub" }), _jsx("p", { className: "text-gray-600", children: "Complete journal entry lifecycle management" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsxs(Button, { onClick: () => setShowMetricsDialog(true), variant: "outline", className: "flex items-center space-x-2", children: [_jsx(BarChart3, { className: "w-4 h-4" }), _jsx("span", { children: "Metrics" })] }), _jsxs(Button, { onClick: () => {
                                        setActiveTab('entries');
                                        setWorkflowMode('create');
                                        setSelectedEntryForWorkflow(null);
                                        setShowWorkflow(true);
                                    }, className: "flex items-center space-x-2", children: [_jsx(Plus, { className: "w-4 h-4" }), _jsx("span", { children: "New Entry" })] })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Total Entries" }), _jsx("p", { className: "text-2xl font-bold text-gray-900", children: summary.totalEntries || 0 })] }), _jsx(BookOpen, { className: "w-8 h-8 text-blue-600" })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Posted Today" }), _jsx("p", { className: "text-2xl font-bold text-green-600", children: summary.postedToday || 0 })] }), _jsx(CheckCircle, { className: "w-8 h-8 text-green-600" })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Pending Approval" }), _jsx("p", { className: "text-2xl font-bold text-yellow-600", children: pendingApprovals.length })] }), _jsx(Clock, { className: "w-8 h-8 text-yellow-600" })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Success Rate" }), _jsxs("p", { className: "text-2xl font-bold text-blue-600", children: [metrics.successRate?.toFixed(1) || 0, "%"] })] }), _jsx(TrendingUp, { className: "w-8 h-8 text-blue-600" })] }) }) })] }), _jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, className: "space-y-4", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-5", children: [_jsx(TabsTrigger, { value: "entries", children: "Entries" }), _jsx(TabsTrigger, { value: "approvals", children: "Approvals" }), _jsx(TabsTrigger, { value: "templates", children: "Templates" }), _jsx(TabsTrigger, { value: "metrics", children: "Analytics" }), _jsx(TabsTrigger, { value: "settings", children: "Settings" })] }), _jsxs(TabsContent, { value: "entries", className: "space-y-4", children: [_jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex flex-wrap items-center gap-4", children: [_jsx("div", { className: "flex-1 min-w-[200px]", children: _jsx(Input, { placeholder: "Search entries...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "w-full" }) }), _jsxs(Select, { value: statusFilter, onValueChange: setStatusFilter, children: [_jsx(SelectTrigger, { className: "w-[150px]", children: _jsx(SelectValue, { placeholder: "Status" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All Status" }), _jsx(SelectItem, { value: "DRAFT", children: "Draft" }), _jsx(SelectItem, { value: "POSTED", children: "Posted" }), _jsx(SelectItem, { value: "REVERSED", children: "Reversed" }), _jsx(SelectItem, { value: "PENDING_APPROVAL", children: "Pending Approval" })] })] }), _jsxs(Select, { value: entryTypeFilter, onValueChange: setEntryTypeFilter, children: [_jsx(SelectTrigger, { className: "w-[150px]", children: _jsx(SelectValue, { placeholder: "Entry Type" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All Types" }), entryTypes.map((type) => (_jsx(SelectItem, { value: type.id, children: type.name }, type.id)))] })] }), _jsxs(Button, { onClick: () => {
                                                        setWorkflowMode('create');
                                                        setSelectedEntryForWorkflow(null);
                                                        setShowWorkflow(true);
                                                    }, className: "flex items-center space-x-2", children: [_jsx(Plus, { className: "w-4 h-4" }), _jsx("span", { children: "New Entry" })] }), _jsxs(Button, { variant: "outline", onClick: () => setShowAdvancedSearch(true), className: "flex items-center space-x-2", children: [_jsx(Search, { className: "w-4 h-4" }), _jsx("span", { children: "Advanced Search" })] })] }) }) }), _jsx(JournalDataOperations, { companyId: companyId, entries: entries, currentFilters: {
                                        dateFrom: dateRange.from,
                                        dateTo: dateRange.to,
                                        status: statusFilter !== 'all' ? statusFilter : undefined,
                                        entryType: entryTypeFilter !== 'all' ? entryTypeFilter : undefined
                                    }, onRefresh: () => {
                                        queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
                                        queryClient.invalidateQueries({ queryKey: ['journal-hub-summary'] });
                                    }, permissions: permissions }), _jsx(BatchPDFActions, { selectedEntries: selectedEntriesForBatchPDF, onClearSelection: () => setSelectedEntriesForBatchPDF([]) }), _jsx("div", { className: "space-y-4", children: entriesLoading ? (_jsx("div", { className: "text-center py-8", children: "Loading entries..." })) : entries.length === 0 ? (_jsx("div", { className: "text-center py-8 text-gray-500", children: "No journal entries found" })) : (entries.map((entry) => (_jsx(Card, { className: "hover:shadow-md transition-shadow", children: _jsxs(CardContent, { className: "p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [getStatusBadge(entry.status), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("h3", { className: "font-medium text-gray-900", children: entry.reference }), (entry.reference?.startsWith('INV-') || entry.reference?.startsWith('POS-')) && (_jsx("span", { className: "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800", children: "\uD83D\uDCE6 Inventory" }))] }), _jsx("p", { className: "text-sm text-gray-600", children: entry.memo })] })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsxs("div", { className: "text-right", children: [_jsx("div", { className: "font-medium text-gray-900", children: formatCurrency(entry.totalAmount || 0) }), _jsx("div", { className: "text-xs text-slate-500", children: entry.isBalanced ? 'Balanced' : 'Unbalanced' })] }), _jsxs("div", { className: "flex items-center space-x-1", children: [permissions.canEdit && entry.status === 'DRAFT' && (_jsx(Button, { size: "sm", variant: "outline", onClick: () => handleEditEntry(entry), children: _jsx(Edit, { className: "w-4 h-4" }) })), permissions.canReverse && entry.status === 'POSTED' && (_jsx(Button, { size: "sm", variant: "outline", onClick: () => handleReverseEntry(entry), children: _jsx(RotateCcw, { className: "w-4 h-4" }) })), permissions.canApprove && entry.status === 'DRAFT' && (_jsx(Button, { size: "sm", variant: "outline", onClick: () => handleRequestApproval(entry), children: _jsx(Shield, { className: "w-4 h-4" }) })), _jsx(Button, { size: "sm", variant: "outline", onClick: () => handleDuplicateEntry(entry), children: _jsx(Copy, { className: "w-4 h-4" }) }), _jsx(QuickPDFActions, { entryId: entry.id, variant: "icon" })] })] })] }), _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("span", { className: "text-gray-500", children: "Date:" }), _jsx("div", { className: "font-medium", children: new Date(entry.date).toLocaleDateString() })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-500", children: "Type:" }), _jsx("div", { className: "font-medium", children: entry.entryType?.name || 'N/A' })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-500", children: "Debit:" }), _jsx("div", { className: "font-medium", children: formatCurrency(entry.totalDebit || 0) })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-500", children: "Credit:" }), _jsx("div", { className: "font-medium", children: formatCurrency(entry.totalCredit || 0) })] })] })] }) }, entry.id)))) }), entries.length > 0 && pagination.totalPages > 1 && (_jsxs("div", { className: "flex items-center justify-between mt-6 px-4 py-3 bg-gray-50 rounded-lg", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsxs("span", { className: "text-sm text-gray-700", children: ["Showing ", ((pagination.page - 1) * pagination.pageSize) + 1, " to ", Math.min(pagination.page * pagination.pageSize, pagination.total), " of ", pagination.total, " entries"] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Label, { htmlFor: "pageSize", className: "text-sm", children: "Show:" }), _jsxs(Select, { value: pageSize.toString(), onValueChange: (value) => {
                                                                setPageSize(Number(value));
                                                                setCurrentPage(1);
                                                            }, children: [_jsx(SelectTrigger, { className: "w-20", children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "5", children: "5" }), _jsx(SelectItem, { value: "10", children: "10" }), _jsx(SelectItem, { value: "25", children: "25" }), _jsx(SelectItem, { value: "50", children: "50" }), _jsx(SelectItem, { value: "100", children: "100" })] })] })] })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Button, { variant: "outline", size: "sm", onClick: () => setCurrentPage(1), disabled: currentPage === 1, children: "First" }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => setCurrentPage(currentPage - 1), disabled: currentPage === 1, children: "Previous" }), _jsx("div", { className: "flex items-center space-x-1", children: Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                                        const startPage = Math.max(1, currentPage - 2);
                                                        const pageNum = startPage + i;
                                                        if (pageNum > pagination.totalPages)
                                                            return null;
                                                        return (_jsx(Button, { variant: pageNum === currentPage ? "default" : "outline", size: "sm", onClick: () => setCurrentPage(pageNum), className: "w-8 h-8 p-0", children: pageNum }, pageNum));
                                                    }) }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => setCurrentPage(currentPage + 1), disabled: currentPage === pagination.totalPages, children: "Next" }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => setCurrentPage(pagination.totalPages), disabled: currentPage === pagination.totalPages, children: "Last" })] })] }))] }), _jsx(TabsContent, { value: "approvals", className: "space-y-4", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center space-x-2", children: [_jsx(Shield, { className: "w-5 h-5" }), _jsx("span", { children: "Pending Approvals" })] }) }), _jsx(CardContent, { children: approvalsLoading ? (_jsx("div", { className: "text-center py-8", children: "Loading approvals..." })) : pendingApprovals.length === 0 ? (_jsx("div", { className: "text-center py-8 text-gray-500", children: "No pending approvals" })) : (_jsx("div", { className: "space-y-4", children: pendingApprovals.map((approval) => (_jsxs("div", { className: "flex items-center justify-between p-4 border rounded-lg", children: [_jsxs("div", { children: [_jsx("h4", { className: "font-medium", children: approval.entry?.reference }), _jsx("p", { className: "text-sm text-gray-600", children: approval.entry?.memo }), _jsxs("p", { className: "text-xs text-gray-500", children: ["Requested by ", approval.requestedBy?.name, " \u2022 ", new Date(approval.requestedAt).toLocaleDateString()] })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsxs(Button, { size: "sm", className: "bg-green-600 hover:bg-green-700", children: [_jsx(CheckCircle, { className: "w-4 h-4 mr-1" }), "Approve"] }), _jsxs(Button, { size: "sm", variant: "outline", children: [_jsx(XCircle, { className: "w-4 h-4 mr-1" }), "Reject"] })] })] }, approval.id))) })) })] }) }), _jsx(TabsContent, { value: "templates", className: "space-y-4", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center space-x-2", children: [_jsx(FileText, { className: "w-5 h-5" }), _jsx("span", { children: "Journal Templates" })] }) }), _jsx(CardContent, { children: _jsx("div", { className: "text-center py-8 text-gray-500", children: "Template management coming soon..." }) })] }) }), _jsx(TabsContent, { value: "metrics", className: "space-y-4", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Performance Metrics" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Success Rate:" }), _jsxs("span", { className: "font-medium", children: [metrics.successRate?.toFixed(1) || 0, "%"] })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Avg Processing Time:" }), _jsxs("span", { className: "font-medium", children: [metrics.avgProcessingTime || 0, "s"] })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Error Rate:" }), _jsxs("span", { className: "font-medium text-red-600", children: [metrics.errorRate?.toFixed(1) || 0, "%"] })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Unbalanced Entries:" }), _jsx("span", { className: "font-medium text-orange-600", children: metrics.unbalancedCount || 0 })] })] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Entry Statistics" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Total Entries:" }), _jsx("span", { className: "font-medium", children: metrics.totalEntries || 0 })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Posted Entries:" }), _jsx("span", { className: "font-medium text-green-600", children: metrics.postedEntries || 0 })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Draft Entries:" }), _jsx("span", { className: "font-medium text-gray-600", children: metrics.draftEntries || 0 })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Pending Approvals:" }), _jsx("span", { className: "font-medium text-yellow-600", children: metrics.pendingApprovals || 0 })] })] }) })] })] }) }), _jsxs(TabsContent, { value: "settings", className: "space-y-4", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center space-x-2", children: [_jsx(Settings2, { className: "w-5 h-5" }), _jsx("span", { children: "User Permissions" })] }) }), _jsx(CardContent, { children: permissionsLoading ? (_jsx("div", { className: "text-center py-8", children: "Loading permissions..." })) : (_jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("input", { type: "checkbox", checked: permissions.canCreate, disabled: true }), _jsx("span", { children: "Create" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("input", { type: "checkbox", checked: permissions.canEdit, disabled: true }), _jsx("span", { children: "Edit" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("input", { type: "checkbox", checked: permissions.canDelete, disabled: true }), _jsx("span", { children: "Delete" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("input", { type: "checkbox", checked: permissions.canPost, disabled: true }), _jsx("span", { children: "Post" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("input", { type: "checkbox", checked: permissions.canReverse, disabled: true }), _jsx("span", { children: "Reverse" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("input", { type: "checkbox", checked: permissions.canApprove, disabled: true }), _jsx("span", { children: "Approve" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("input", { type: "checkbox", checked: permissions.canViewAll, disabled: true }), _jsx("span", { children: "View All" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("span", { children: "Max Approval Amount:" }), _jsx("span", { className: "font-medium", children: formatCurrency(permissions.maxApprovalAmount || 0) })] })] })) })] }), _jsx(EmailNotificationSettings, { companyId: companyId })] })] }), showWorkflow && (_jsx(Dialog, { open: showWorkflow, onOpenChange: setShowWorkflow, children: _jsxs(DialogContent, { className: "!max-w-7xl max-h-[95vh] overflow-y-auto w-[95vw] md:max-h-[90vh] md:w-[90vw]", children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { children: workflowMode === 'create' ? 'Create New Journal Entry' :
                                        workflowMode === 'edit' ? 'Edit Journal Entry' : 'Duplicate Journal Entry' }) }), _jsx(UnifiedJournalWorkflow, { companyId: companyId, onSuccess: handleWorkflowSuccess, onCancel: handleWorkflowCancel, initialData: selectedEntryForWorkflow, mode: workflowMode })] }) })), _jsx(Dialog, { open: showReversalDialog, onOpenChange: setShowReversalDialog, children: _jsxs(DialogContent, { children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { children: "Reverse Journal Entry" }) }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "reason", children: "Reason for Reversal *" }), _jsx(Textarea, { id: "reason", value: reversalData.reason, onChange: (e) => setReversalData({ ...reversalData, reason: e.target.value }), placeholder: "Enter reason for reversing this entry...", rows: 3 })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "reverseDate", children: "Reverse Date" }), _jsx(Input, { id: "reverseDate", type: "date", value: reversalData.reverseDate, onChange: (e) => setReversalData({ ...reversalData, reverseDate: e.target.value }) })] }), _jsxs("div", { className: "flex justify-end space-x-2", children: [_jsx(Button, { variant: "outline", onClick: () => setShowReversalDialog(false), children: "Cancel" }), _jsx(Button, { onClick: handleSubmitReversal, disabled: !reversalData.reason || reverseEntryMutation.isPending, children: reverseEntryMutation.isPending ? 'Reversing...' : 'Reverse Entry' })] })] })] }) }), _jsx(Dialog, { open: showAdjustmentDialog, onOpenChange: setShowAdjustmentDialog, children: _jsxs(DialogContent, { children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { children: "Create Adjustment Entry" }) }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "adjustmentReason", children: "Reason for Adjustment *" }), _jsx(Textarea, { id: "adjustmentReason", value: adjustmentData.reason, onChange: (e) => setAdjustmentData({ ...adjustmentData, reason: e.target.value }), placeholder: "Enter reason for adjustment...", rows: 3 })] }), _jsx("div", { className: "text-sm text-gray-500", children: "Adjustment entries will be created to correct the original entry." }), _jsxs("div", { className: "flex justify-end space-x-2", children: [_jsx(Button, { variant: "outline", onClick: () => setShowAdjustmentDialog(false), children: "Cancel" }), _jsx(Button, { onClick: handleSubmitAdjustment, disabled: !adjustmentData.reason || adjustEntryMutation.isPending, children: adjustEntryMutation.isPending ? 'Creating...' : 'Create Adjustment' })] })] })] }) }), _jsx(Dialog, { open: showApprovalDialog, onOpenChange: setShowApprovalDialog, children: _jsxs(DialogContent, { children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { children: "Request Approval" }) }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "approvers", children: "Approvers *" }), _jsx(Input, { id: "approvers", value: approvalData.approvers.join(', '), onChange: (e) => setApprovalData({ ...approvalData, approvers: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }), placeholder: "Enter approver IDs separated by commas..." })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "approvalComments", children: "Comments" }), _jsx(Textarea, { id: "approvalComments", value: approvalData.comments, onChange: (e) => setApprovalData({ ...approvalData, comments: e.target.value }), placeholder: "Optional comments for approvers...", rows: 3 })] }), _jsxs("div", { className: "flex justify-end space-x-2", children: [_jsx(Button, { variant: "outline", onClick: () => setShowApprovalDialog(false), children: "Cancel" }), _jsx(Button, { onClick: handleSubmitApproval, disabled: approvalData.approvers.length === 0 || requestApprovalMutation.isPending, children: requestApprovalMutation.isPending ? 'Sending...' : 'Request Approval' })] })] })] }) }), _jsx(Dialog, { open: showMetricsDialog, onOpenChange: setShowMetricsDialog, children: _jsxs(DialogContent, { className: "max-w-2xl", children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { children: "Performance Metrics" }) }), _jsx("div", { className: "space-y-4", children: metricsLoading ? (_jsx("div", { className: "text-center py-8", children: "Loading metrics..." })) : (_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx("h4", { className: "font-medium", children: "Processing Metrics" }), _jsxs("div", { className: "space-y-1 text-sm", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Success Rate:" }), _jsxs("span", { className: "font-medium", children: [metrics.successRate?.toFixed(1) || 0, "%"] })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Avg Processing Time:" }), _jsxs("span", { className: "font-medium", children: [metrics.avgProcessingTime || 0, "s"] })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Error Rate:" }), _jsxs("span", { className: "font-medium text-red-600", children: [metrics.errorRate?.toFixed(1) || 0, "%"] })] })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("h4", { className: "font-medium", children: "Entry Statistics" }), _jsxs("div", { className: "space-y-1 text-sm", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Total Entries:" }), _jsx("span", { className: "font-medium", children: metrics.totalEntries || 0 })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Posted:" }), _jsx("span", { className: "font-medium text-green-600", children: metrics.postedEntries || 0 })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Drafts:" }), _jsx("span", { className: "font-medium text-gray-600", children: metrics.draftEntries || 0 })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Unbalanced:" }), _jsx("span", { className: "font-medium text-orange-600", children: metrics.unbalancedCount || 0 })] })] })] })] })) })] }) }), _jsx(Dialog, { open: showAdvancedSearch, onOpenChange: setShowAdvancedSearch, children: _jsxs(DialogContent, { className: "max-w-4xl max-h-[90vh] overflow-y-auto", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Advanced Search" }), _jsx(DialogDescription, { children: "Use multiple filters to find specific journal entries" })] }), _jsx(AdvancedJournalSearch, { companyId: companyId, onSearchResults: (results) => {
                                    setSearchResults(results);
                                    setShowAdvancedSearch(false);
                                    toast({
                                        title: "Search Complete",
                                        description: `Found ${results.entries.length} entries matching your criteria`
                                    });
                                }, onClose: () => setShowAdvancedSearch(false) })] }) }), _jsx(JournalPDFGeneration, { entryId: selectedEntryForPDF || undefined, entryIds: selectedEntriesForBatchPDF.length > 0 ? selectedEntriesForBatchPDF : undefined, isOpen: showPDFDialog, onClose: () => {
                        setShowPDFDialog(false);
                        setSelectedEntryForPDF(null);
                        setSelectedEntriesForBatchPDF([]);
                    } })] }) }));
}
