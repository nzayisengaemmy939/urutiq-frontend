import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, Clock, FileText, CheckSquare, RotateCcw, Upload, Info, Loader2 } from 'lucide-react';
export function BatchJournalProcessing({ entries, onRefresh, permissions }) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    // State
    const [selectedEntries, setSelectedEntries] = useState([]);
    const [showBatchDialog, setShowBatchDialog] = useState(false);
    const [batchType, setBatchType] = useState('approve');
    const [batchComments, setBatchComments] = useState('');
    const [batchReason, setBatchReason] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [batchResult, setBatchResult] = useState(null);
    const [showResults, setShowResults] = useState(false);
    // Filter entries based on batch type
    const filteredEntries = useMemo(() => {
        switch (batchType) {
            case 'approve':
                return entries.filter(entry => entry.status === 'PENDING_APPROVAL');
            case 'post':
                return entries.filter(entry => entry.status === 'DRAFT');
            case 'reverse':
                return entries.filter(entry => entry.status === 'POSTED');
            default:
                return entries;
        }
    }, [entries, batchType]);
    // Batch operations
    const batchApproveMutation = useMutation({
        mutationFn: (data) => apiService.batchApproveJournalEntries(data),
        onSuccess: (response) => {
            setBatchResult(response.data);
            setShowResults(true);
            queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
            queryClient.invalidateQueries({ queryKey: ['journal-hub-summary'] });
            toast({ title: "Success", description: response.message });
            onRefresh();
        },
        onError: (error) => {
            toast({ title: "Error", description: error?.response?.data?.message || 'Batch approval failed', variant: "destructive" });
        }
    });
    const batchPostMutation = useMutation({
        mutationFn: (data) => apiService.batchPostJournalEntries(data),
        onSuccess: (response) => {
            setBatchResult(response.data);
            setShowResults(true);
            queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
            queryClient.invalidateQueries({ queryKey: ['journal-hub-summary'] });
            toast({ title: "Success", description: response.message });
            onRefresh();
        },
        onError: (error) => {
            toast({ title: "Error", description: error?.response?.data?.message || 'Batch posting failed', variant: "destructive" });
        }
    });
    const batchReverseMutation = useMutation({
        mutationFn: (data) => apiService.batchReverseJournalEntries(data),
        onSuccess: (response) => {
            setBatchResult(response.data);
            setShowResults(true);
            queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
            queryClient.invalidateQueries({ queryKey: ['journal-hub-summary'] });
            toast({ title: "Success", description: response.message });
            onRefresh();
        },
        onError: (error) => {
            toast({ title: "Error", description: error?.response?.data?.message || 'Batch reversal failed', variant: "destructive" });
        }
    });
    // Handlers
    const handleSelectAll = () => {
        if (selectedEntries.length === filteredEntries.length) {
            setSelectedEntries([]);
        }
        else {
            setSelectedEntries(filteredEntries.map(entry => entry.id));
        }
    };
    const handleSelectEntry = (entryId) => {
        setSelectedEntries(prev => prev.includes(entryId)
            ? prev.filter(id => id !== entryId)
            : [...prev, entryId]);
    };
    const handleBatchOperation = () => {
        if (selectedEntries.length === 0) {
            toast({ title: "Error", description: "Please select at least one entry", variant: "destructive" });
            return;
        }
        setIsProcessing(true);
        switch (batchType) {
            case 'approve':
                batchApproveMutation.mutate({
                    entryIds: selectedEntries,
                    comments: batchComments
                });
                break;
            case 'post':
                batchPostMutation.mutate({
                    entryIds: selectedEntries
                });
                break;
            case 'reverse':
                if (!batchReason.trim()) {
                    toast({ title: "Error", description: "Reason is required for reversal", variant: "destructive" });
                    setIsProcessing(false);
                    return;
                }
                batchReverseMutation.mutate({
                    entryIds: selectedEntries,
                    reason: batchReason
                });
                break;
        }
    };
    const handleCloseDialog = () => {
        setShowBatchDialog(false);
        setSelectedEntries([]);
        setBatchComments('');
        setBatchReason('');
        setBatchResult(null);
        setShowResults(false);
        setIsProcessing(false);
    };
    const getStatusIcon = (status) => {
        switch (status) {
            case 'POSTED': return _jsx(CheckCircle, { className: "w-4 h-4 text-green-600" });
            case 'DRAFT': return _jsx(FileText, { className: "w-4 h-4 text-blue-600" });
            case 'PENDING_APPROVAL': return _jsx(Clock, { className: "w-4 h-4 text-yellow-600" });
            case 'REVERSED': return _jsx(RotateCcw, { className: "w-4 h-4 text-red-600" });
            default: return _jsx(FileText, { className: "w-4 h-4 text-gray-600" });
        }
    };
    const getStatusBadge = (status) => {
        const variants = {
            'POSTED': 'default',
            'DRAFT': 'secondary',
            'PENDING_APPROVAL': 'outline',
            'REVERSED': 'destructive'
        };
        return (_jsx(Badge, { variant: variants[status] || 'secondary', children: status.replace('_', ' ') }));
    };
    const isProcessingAny = batchApproveMutation.isPending || batchPostMutation.isPending || batchReverseMutation.isPending;
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center space-x-2", children: [_jsx(Upload, { className: "w-5 h-5" }), _jsx("span", { children: "Batch Processing" })] }), _jsx(CardDescription, { children: "Process multiple journal entries at once for improved efficiency" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "flex flex-wrap gap-2", children: [permissions.canApprove && (_jsx(Dialog, { open: showBatchDialog && batchType === 'approve', onOpenChange: (open) => {
                                        if (open)
                                            setBatchType('approve');
                                        setShowBatchDialog(open);
                                    }, children: _jsx(DialogTrigger, { asChild: true, children: _jsxs(Button, { variant: "outline", size: "sm", children: [_jsx(CheckSquare, { className: "w-4 h-4 mr-2" }), "Batch Approve (", filteredEntries.filter(e => e.status === 'PENDING_APPROVAL').length, ")"] }) }) })), permissions.canPost && (_jsx(Dialog, { open: showBatchDialog && batchType === 'post', onOpenChange: (open) => {
                                        if (open)
                                            setBatchType('post');
                                        setShowBatchDialog(open);
                                    }, children: _jsx(DialogTrigger, { asChild: true, children: _jsxs(Button, { variant: "outline", size: "sm", children: [_jsx(Upload, { className: "w-4 h-4 mr-2" }), "Batch Post (", filteredEntries.filter(e => e.status === 'DRAFT').length, ")"] }) }) })), permissions.canReverse && (_jsx(Dialog, { open: showBatchDialog && batchType === 'reverse', onOpenChange: (open) => {
                                        if (open)
                                            setBatchType('reverse');
                                        setShowBatchDialog(open);
                                    }, children: _jsx(DialogTrigger, { asChild: true, children: _jsxs(Button, { variant: "outline", size: "sm", children: [_jsx(RotateCcw, { className: "w-4 h-4 mr-2" }), "Batch Reverse (", filteredEntries.filter(e => e.status === 'POSTED').length, ")"] }) }) }))] }) })] }), _jsx(Dialog, { open: showBatchDialog, onOpenChange: setShowBatchDialog, children: _jsxs(DialogContent, { className: "max-w-4xl max-h-[80vh] overflow-y-auto", children: [_jsxs(DialogHeader, { children: [_jsxs(DialogTitle, { children: ["Batch ", batchType.charAt(0).toUpperCase() + batchType.slice(1), " Journal Entries"] }), _jsxs(DialogDescription, { children: ["Select entries to process in batch. ", filteredEntries.length, " entries available for ", batchType, "."] })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "select-all", checked: selectedEntries.length === filteredEntries.length && filteredEntries.length > 0, onCheckedChange: handleSelectAll }), _jsxs(Label, { htmlFor: "select-all", children: ["Select All (", selectedEntries.length, "/", filteredEntries.length, ")"] })] }), _jsxs(Badge, { variant: "outline", children: [selectedEntries.length, " selected"] })] }), _jsx("div", { className: "max-h-60 overflow-y-auto border rounded-lg", children: filteredEntries.length === 0 ? (_jsxs("div", { className: "p-4 text-center text-gray-500", children: ["No entries available for ", batchType] })) : (_jsx("div", { className: "space-y-1 p-2", children: filteredEntries.map((entry) => (_jsxs("div", { className: `flex items-center space-x-3 p-2 rounded hover:bg-gray-50 cursor-pointer ${selectedEntries.includes(entry.id) ? 'bg-blue-50 border border-blue-200' : ''}`, onClick: () => handleSelectEntry(entry.id), children: [_jsx(Checkbox, { checked: selectedEntries.includes(entry.id), onChange: () => handleSelectEntry(entry.id) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [getStatusIcon(entry.status), _jsx("span", { className: "font-medium truncate", children: entry.reference }), getStatusBadge(entry.status)] }), _jsx("p", { className: "text-sm text-gray-600 truncate", children: entry.memo }), _jsxs("div", { className: "flex items-center space-x-4 text-xs text-gray-500", children: [_jsxs("span", { children: ["$", entry.totalAmount?.toFixed(2) || '0.00'] }), _jsx("span", { className: entry.isBalanced ? 'text-green-600' : 'text-red-600', children: entry.isBalanced ? 'Balanced' : 'Unbalanced' })] })] })] }, entry.id))) })) }), (batchType === 'approve' || batchType === 'reverse') && (_jsxs("div", { className: "space-y-4", children: [batchType === 'approve' && (_jsxs("div", { children: [_jsx(Label, { htmlFor: "batch-comments", children: "Comments (Optional)" }), _jsx(Textarea, { id: "batch-comments", placeholder: "Add comments for batch approval...", value: batchComments, onChange: (e) => setBatchComments(e.target.value), rows: 3 })] })), batchType === 'reverse' && (_jsxs("div", { children: [_jsx(Label, { htmlFor: "batch-reason", children: "Reason (Required)" }), _jsx(Textarea, { id: "batch-reason", placeholder: "Enter reason for batch reversal...", value: batchReason, onChange: (e) => setBatchReason(e.target.value), rows: 3, required: true })] }))] })), _jsxs("div", { className: "flex justify-end space-x-2", children: [_jsx(Button, { variant: "outline", onClick: handleCloseDialog, children: "Cancel" }), _jsx(Button, { onClick: handleBatchOperation, disabled: selectedEntries.length === 0 || isProcessingAny || (batchType === 'reverse' && !batchReason.trim()), children: isProcessingAny ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "w-4 h-4 mr-2 animate-spin" }), "Processing..."] })) : (_jsxs(_Fragment, { children: [batchType === 'approve' && _jsx(CheckSquare, { className: "w-4 h-4 mr-2" }), batchType === 'post' && _jsx(Upload, { className: "w-4 h-4 mr-2" }), batchType === 'reverse' && _jsx(RotateCcw, { className: "w-4 h-4 mr-2" }), batchType.charAt(0).toUpperCase() + batchType.slice(1), " ", selectedEntries.length, " Entries"] })) })] })] })] }) }), _jsx(Dialog, { open: showResults, onOpenChange: setShowResults, children: _jsxs(DialogContent, { className: "max-w-2xl", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Batch Processing Results" }), _jsxs(DialogDescription, { children: ["Processing completed for ", batchResult?.summary.total, " entries"] })] }), batchResult && (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [_jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-2xl font-bold text-green-600", children: batchResult.summary.successful }), _jsx("div", { className: "text-sm text-gray-600", children: "Successful" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-2xl font-bold text-red-600", children: batchResult.summary.failed }), _jsx("div", { className: "text-sm text-gray-600", children: "Failed" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-2xl font-bold text-blue-600", children: batchResult.summary.total }), _jsx("div", { className: "text-sm text-gray-600", children: "Total" })] }), _jsxs("div", { className: "text-center", children: [_jsxs("div", { className: "text-2xl font-bold text-purple-600", children: [batchResult.summary.processingTime, "ms"] }), _jsx("div", { className: "text-sm text-gray-600", children: "Time" })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { children: "Success Rate" }), _jsxs("span", { children: [Math.round((batchResult.summary.successful / batchResult.summary.total) * 100), "%"] })] }), _jsx(Progress, { value: (batchResult.summary.successful / batchResult.summary.total) * 100, className: "h-2" })] }), batchResult.summary.inventoryMovementsReversed && batchResult.summary.inventoryMovementsReversed > 0 && (_jsxs(Alert, { children: [_jsx(Info, { className: "h-4 w-4" }), _jsxs(AlertDescription, { children: [_jsx("strong", { children: "Inventory Impact:" }), " ", batchResult.summary.inventoryMovementsReversed, " inventory movements reversed,", batchResult.summary.stockRestored, " products restored."] })] })), batchResult.errors.length > 0 && (_jsxs("div", { className: "space-y-2", children: [_jsxs("h4", { className: "font-medium text-red-600", children: ["Errors (", batchResult.errors.length, ")"] }), _jsx("div", { className: "max-h-32 overflow-y-auto space-y-1", children: batchResult.errors.map((error, index) => (_jsxs("div", { className: "text-sm text-red-600 bg-red-50 p-2 rounded", children: [_jsxs("strong", { children: [error.entryId || error.index, ":"] }), " ", error.error] }, index))) })] })), batchResult.success.length > 0 && (_jsxs("div", { className: "space-y-2", children: [_jsxs("h4", { className: "font-medium text-green-600", children: ["Successful (", batchResult.success.length, ")"] }), _jsxs("div", { className: "max-h-32 overflow-y-auto space-y-1", children: [batchResult.success.slice(0, 10).map((success, index) => (_jsxs("div", { className: "text-sm text-green-600 bg-green-50 p-2 rounded", children: [_jsxs("strong", { children: [success.reference || success.entryId, ":"] }), " ", success.status || 'Processed'] }, index))), batchResult.success.length > 10 && (_jsxs("div", { className: "text-sm text-gray-500", children: ["... and ", batchResult.success.length - 10, " more"] }))] })] })), _jsx("div", { className: "flex justify-end", children: _jsx(Button, { onClick: () => setShowResults(false), children: "Close" }) })] }))] }) })] }));
}
