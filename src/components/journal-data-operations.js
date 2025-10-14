import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useMemo, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, Upload, FileText, CheckCircle, XCircle, RotateCcw, Info, Loader2, Database } from 'lucide-react';
export function JournalDataOperations({ companyId, entries, currentFilters, onRefresh, permissions }) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const fileInputRef = useRef(null);
    // Batch Processing State
    const [selectedEntries, setSelectedEntries] = useState([]);
    const [showBatchDialog, setShowBatchDialog] = useState(false);
    const [batchType, setBatchType] = useState('approve');
    const [batchComments, setBatchComments] = useState('');
    const [batchReason, setBatchReason] = useState('');
    // Import/Export State
    const [showImportDialog, setShowImportDialog] = useState(false);
    const [showExportDialog, setShowExportDialog] = useState(false);
    const [importFile, setImportFile] = useState(null);
    const [csvData, setCsvData] = useState('');
    const [importOptions, setImportOptions] = useState({
        validateBalances: true,
        createAsDraft: true,
        skipHeaderRow: true,
        dateFormat: 'YYYY-MM-DD'
    });
    const [exportOptions, setExportOptions] = useState({
        format: 'detailed',
        fileFormat: 'csv',
        dateFrom: currentFilters?.dateFrom || '',
        dateTo: currentFilters?.dateTo || '',
        status: currentFilters?.status || 'all',
        entryType: currentFilters?.entryType || 'all'
    });
    // Common State
    const [isProcessing, setIsProcessing] = useState(false);
    const [operationResult, setOperationResult] = useState(null);
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
    // Batch Mutations
    const batchApproveMutation = useMutation({
        mutationFn: (data) => apiService.batchApproveJournalEntries(data),
        onSuccess: (response) => {
            setOperationResult(response.data);
            setShowResults(true);
            queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
            toast({ title: "Success", description: `Approved ${response.data.summary.successful} entries` });
            onRefresh();
        },
        onError: (error) => {
            toast({ title: "Error", description: error?.response?.data?.message || 'Batch approve failed', variant: "destructive" });
        }
    });
    const batchPostMutation = useMutation({
        mutationFn: (data) => apiService.batchPostJournalEntries(data),
        onSuccess: (response) => {
            setOperationResult(response.data);
            setShowResults(true);
            queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
            toast({ title: "Success", description: `Posted ${response.data.summary.successful} entries` });
            onRefresh();
        },
        onError: (error) => {
            toast({ title: "Error", description: error?.response?.data?.message || 'Batch post failed', variant: "destructive" });
        }
    });
    const batchReverseMutation = useMutation({
        mutationFn: (data) => apiService.batchReverseJournalEntries(data),
        onSuccess: (response) => {
            setOperationResult(response.data);
            setShowResults(true);
            queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
            toast({ title: "Success", description: `Reversed ${response.data.summary.successful} entries` });
            onRefresh();
        },
        onError: (error) => {
            toast({ title: "Error", description: error?.response?.data?.message || 'Batch reverse failed', variant: "destructive" });
        }
    });
    // Import/Export Mutations
    const importMutation = useMutation({
        mutationFn: (data) => apiService.importJournalEntriesCsv(data),
        onSuccess: (response) => {
            setOperationResult(response.data);
            setShowResults(true);
            queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
            toast({ title: "Success", description: `Imported ${response.data.summary.successful} entries` });
            onRefresh();
        },
        onError: (error) => {
            toast({ title: "Error", description: error?.response?.data?.message || 'Import failed', variant: "destructive" });
        }
    });
    const exportMutation = useMutation({
        mutationFn: (options) => apiService.exportJournalEntriesCsv(options),
        onSuccess: (blob) => {
            // Response is already a Blob from the API
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `journal-entries-${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            toast({ title: "Success", description: "Entries exported successfully" });
        },
        onError: (error) => {
            toast({ title: "Error", description: error?.response?.data?.message || 'Export failed', variant: "destructive" });
        }
    });
    // Batch Processing Handlers
    const handleBatchProcess = async () => {
        if (selectedEntries.length === 0) {
            toast({ title: "Error", description: "Please select at least one entry", variant: "destructive" });
            return;
        }
        setIsProcessing(true);
        try {
            switch (batchType) {
                case 'approve':
                    await batchApproveMutation.mutateAsync({ entryIds: selectedEntries, comments: batchComments });
                    break;
                case 'post':
                    await batchPostMutation.mutateAsync({ entryIds: selectedEntries });
                    break;
                case 'reverse':
                    if (!batchReason) {
                        toast({ title: "Error", description: "Reason is required for reversal", variant: "destructive" });
                        setIsProcessing(false);
                        return;
                    }
                    await batchReverseMutation.mutateAsync({ entryIds: selectedEntries, reason: batchReason });
                    break;
            }
            setSelectedEntries([]);
            setShowBatchDialog(false);
        }
        finally {
            setIsProcessing(false);
        }
    };
    const toggleEntrySelection = (entryId) => {
        setSelectedEntries(prev => prev.includes(entryId)
            ? prev.filter(id => id !== entryId)
            : [...prev, entryId]);
    };
    const toggleSelectAll = () => {
        if (selectedEntries.length === filteredEntries.length) {
            setSelectedEntries([]);
        }
        else {
            setSelectedEntries(filteredEntries.map(e => e.id));
        }
    };
    // Import/Export Handlers
    const handleFileSelect = (event) => {
        const file = event.target.files?.[0];
        if (file) {
            setImportFile(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target?.result;
                setCsvData(text);
            };
            reader.readAsText(file);
        }
    };
    const handleImport = async () => {
        if (!csvData) {
            toast({ title: "Error", description: "Please select a file to import", variant: "destructive" });
            return;
        }
        setIsProcessing(true);
        try {
            await importMutation.mutateAsync({ csvData, options: importOptions });
            setShowImportDialog(false);
            setImportFile(null);
            setCsvData('');
        }
        finally {
            setIsProcessing(false);
        }
    };
    const handleExport = async () => {
        setIsProcessing(true);
        try {
            await exportMutation.mutateAsync(exportOptions);
            setShowExportDialog(false);
        }
        finally {
            setIsProcessing(false);
        }
    };
    const downloadTemplate = () => {
        const template = `date,reference,memo,account_code,debit,credit,department,project
2024-01-01,JE-001,Sample Entry,1000,1000,0,,
2024-01-01,JE-001,Sample Entry,2000,0,1000,,`;
        const blob = new Blob([template], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'journal-entry-template.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toast({ title: "Success", description: "Template downloaded" });
    };
    return (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Database, { className: "w-5 h-5" }), "Data Operations"] }), _jsx(CardDescription, { children: "Batch processing, import, and export journal entries" })] }), _jsxs(CardContent, { children: [_jsxs(Tabs, { defaultValue: "batch", className: "w-full", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-2", children: [_jsx(TabsTrigger, { value: "batch", children: "Batch Processing" }), _jsx(TabsTrigger, { value: "import-export", children: "Import/Export" })] }), _jsx(TabsContent, { value: "batch", className: "space-y-4", children: _jsxs("div", { className: "flex gap-2 flex-wrap", children: [_jsxs(Dialog, { open: showBatchDialog, onOpenChange: setShowBatchDialog, children: [_jsx(DialogTrigger, { asChild: true, children: _jsxs(Button, { variant: "outline", onClick: () => setBatchType('approve'), disabled: !permissions.canApprove, children: [_jsx(CheckCircle, { className: "w-4 h-4 mr-2" }), "Batch Approve"] }) }), _jsxs(DialogContent, { className: "max-w-4xl max-h-[80vh] overflow-y-auto", children: [_jsxs(DialogHeader, { children: [_jsxs(DialogTitle, { children: [batchType === 'approve' && 'Batch Approve Entries', batchType === 'post' && 'Batch Post Entries', batchType === 'reverse' && 'Batch Reverse Entries'] }), _jsx(DialogDescription, { children: "Select entries to process in batch" })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center space-x-2 p-3 bg-gray-50 rounded-lg", children: [_jsx(Checkbox, { id: "select-all", checked: selectedEntries.length === filteredEntries.length && filteredEntries.length > 0, onCheckedChange: toggleSelectAll }), _jsxs(Label, { htmlFor: "select-all", className: "cursor-pointer flex-1", children: ["Select All (", filteredEntries.length, " entries)"] }), _jsxs(Badge, { variant: "secondary", children: [selectedEntries.length, " selected"] })] }), _jsx("div", { className: "space-y-2 max-h-[300px] overflow-y-auto", children: filteredEntries.length === 0 ? (_jsxs(Alert, { children: [_jsx(Info, { className: "h-4 w-4" }), _jsxs(AlertDescription, { children: ["No entries available for ", batchType] })] })) : (filteredEntries.map(entry => (_jsxs("div", { className: "flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50", children: [_jsx(Checkbox, { id: entry.id, checked: selectedEntries.includes(entry.id), onCheckedChange: () => toggleEntrySelection(entry.id) }), _jsx(Label, { htmlFor: entry.id, className: "cursor-pointer flex-1", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("div", { className: "font-medium", children: entry.reference }), _jsx("div", { className: "text-sm text-gray-600", children: entry.memo })] }), _jsxs("div", { className: "text-right", children: [_jsxs("div", { className: "font-medium", children: ["$", entry.totalAmount?.toFixed(2) || '0.00'] }), _jsx(Badge, { variant: entry.isBalanced ? 'default' : 'destructive', className: "text-xs", children: entry.isBalanced ? 'Balanced' : 'Unbalanced' })] })] }) })] }, entry.id)))) }), batchType === 'approve' && (_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "batch-comments", children: "Comments (optional)" }), _jsx(Textarea, { id: "batch-comments", value: batchComments, onChange: (e) => setBatchComments(e.target.value), placeholder: "Add comments for approval...", rows: 3 })] })), batchType === 'reverse' && (_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "batch-reason", children: "Reversal Reason *" }), _jsx(Textarea, { id: "batch-reason", value: batchReason, onChange: (e) => setBatchReason(e.target.value), placeholder: "Provide reason for reversal...", rows: 3, required: true })] })), _jsxs("div", { className: "flex justify-end gap-2 pt-4", children: [_jsx(Button, { variant: "outline", onClick: () => setShowBatchDialog(false), disabled: isProcessing, children: "Cancel" }), _jsx(Button, { onClick: handleBatchProcess, disabled: selectedEntries.length === 0 || isProcessing, children: isProcessing ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "w-4 h-4 mr-2 animate-spin" }), "Processing..."] })) : (_jsxs(_Fragment, { children: ["Process ", selectedEntries.length, " Entries"] })) })] })] })] })] }), _jsxs(Button, { variant: "outline", onClick: () => { setBatchType('post'); setShowBatchDialog(true); }, disabled: !permissions.canPost, children: [_jsx(FileText, { className: "w-4 h-4 mr-2" }), "Batch Post"] }), _jsxs(Button, { variant: "outline", onClick: () => { setBatchType('reverse'); setShowBatchDialog(true); }, disabled: !permissions.canReverse, children: [_jsx(RotateCcw, { className: "w-4 h-4 mr-2" }), "Batch Reverse"] })] }) }), _jsx(TabsContent, { value: "import-export", className: "space-y-4", children: _jsxs("div", { className: "flex gap-2 flex-wrap", children: [_jsxs(Dialog, { open: showImportDialog, onOpenChange: setShowImportDialog, children: [_jsx(DialogTrigger, { asChild: true, children: _jsxs(Button, { variant: "outline", children: [_jsx(Upload, { className: "w-4 h-4 mr-2" }), "Import Entries"] }) }), _jsxs(DialogContent, { className: "max-w-2xl", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Import Journal Entries" }), _jsx(DialogDescription, { children: "Upload a CSV file to import multiple journal entries" })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "import-file", children: "CSV File" }), _jsx(Input, { id: "import-file", type: "file", accept: ".csv", ref: fileInputRef, onChange: handleFileSelect }), importFile && (_jsxs("div", { className: "text-sm text-gray-600", children: ["Selected: ", importFile.name, " (", (importFile.size / 1024).toFixed(2), " KB)"] }))] }), _jsxs("div", { className: "space-y-3", children: [_jsx(Label, { children: "Import Options" }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "validate-balances", checked: importOptions.validateBalances, onCheckedChange: (checked) => setImportOptions(prev => ({ ...prev, validateBalances: checked })) }), _jsx(Label, { htmlFor: "validate-balances", className: "text-sm", children: "Validate entry balances" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "create-draft", checked: importOptions.createAsDraft, onCheckedChange: (checked) => setImportOptions(prev => ({ ...prev, createAsDraft: checked })) }), _jsx(Label, { htmlFor: "create-draft", className: "text-sm", children: "Create entries as drafts" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "skip-header", checked: importOptions.skipHeaderRow, onCheckedChange: (checked) => setImportOptions(prev => ({ ...prev, skipHeaderRow: checked })) }), _jsx(Label, { htmlFor: "skip-header", className: "text-sm", children: "Skip header row" })] })] })] }), _jsxs(Alert, { children: [_jsx(Info, { className: "h-4 w-4" }), _jsxs(AlertDescription, { className: "flex items-center justify-between", children: [_jsx("span", { children: "Need a template?" }), _jsx(Button, { variant: "link", size: "sm", onClick: downloadTemplate, children: "Download CSV Template" })] })] }), _jsxs("div", { className: "flex justify-end gap-2", children: [_jsx(Button, { variant: "outline", onClick: () => setShowImportDialog(false), disabled: isProcessing, children: "Cancel" }), _jsx(Button, { onClick: handleImport, disabled: !csvData || isProcessing, children: isProcessing ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "w-4 h-4 mr-2 animate-spin" }), "Importing..."] })) : (_jsx(_Fragment, { children: "Import Entries" })) })] })] })] })] }), _jsxs(Dialog, { open: showExportDialog, onOpenChange: setShowExportDialog, children: [_jsx(DialogTrigger, { asChild: true, children: _jsxs(Button, { variant: "outline", children: [_jsx(Download, { className: "w-4 h-4 mr-2" }), "Export Entries"] }) }), _jsxs(DialogContent, { children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Export Journal Entries" }), _jsx(DialogDescription, { children: "Configure export options and download entries" })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Export Format" }), _jsxs(Select, { value: exportOptions.format, onValueChange: (value) => setExportOptions(prev => ({ ...prev, format: value })), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "detailed", children: "Detailed (with all fields)" }), _jsx(SelectItem, { value: "summary", children: "Summary (essential fields only)" })] })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "File Format" }), _jsxs(Select, { value: exportOptions.fileFormat, onValueChange: (value) => setExportOptions(prev => ({ ...prev, fileFormat: value })), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "csv", children: "CSV (.csv)" }), _jsx(SelectItem, { value: "excel", children: "Excel (.xlsx)" })] })] })] }), _jsxs(Alert, { children: [_jsx(Info, { className: "h-4 w-4" }), _jsxs(AlertDescription, { children: ["Export will use current filters: ", currentFilters?.status || 'all statuses', ",", currentFilters?.dateFrom && currentFilters?.dateTo
                                                                                    ? ` ${currentFilters.dateFrom} to ${currentFilters.dateTo}`
                                                                                    : ' all dates'] })] }), _jsxs("div", { className: "flex justify-end gap-2", children: [_jsx(Button, { variant: "outline", onClick: () => setShowExportDialog(false), disabled: isProcessing, children: "Cancel" }), _jsx(Button, { onClick: handleExport, disabled: isProcessing, children: isProcessing ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "w-4 h-4 mr-2 animate-spin" }), "Exporting..."] })) : (_jsx(_Fragment, { children: "Export" })) })] })] })] })] })] }) })] }), showResults && operationResult && (_jsx(Dialog, { open: showResults, onOpenChange: setShowResults, children: _jsxs(DialogContent, { className: "max-w-2xl", children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { children: "Operation Results" }) }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-3 gap-4", children: [_jsxs("div", { className: "text-center p-4 bg-blue-50 rounded-lg", children: [_jsx("div", { className: "text-2xl font-bold text-blue-600", children: operationResult.summary.total }), _jsx("div", { className: "text-sm text-gray-600", children: "Total" })] }), _jsxs("div", { className: "text-center p-4 bg-green-50 rounded-lg", children: [_jsx("div", { className: "text-2xl font-bold text-green-600", children: operationResult.summary.successful }), _jsx("div", { className: "text-sm text-gray-600", children: "Successful" })] }), _jsxs("div", { className: "text-center p-4 bg-red-50 rounded-lg", children: [_jsx("div", { className: "text-2xl font-bold text-red-600", children: operationResult.summary.failed }), _jsx("div", { className: "text-sm text-gray-600", children: "Failed" })] })] }), operationResult.errors.length > 0 && (_jsxs("div", { className: "space-y-2", children: [_jsx("h4", { className: "font-medium text-red-600", children: "Errors:" }), _jsx("div", { className: "max-h-40 overflow-y-auto space-y-1", children: operationResult.errors.map((error, idx) => (_jsxs(Alert, { variant: "destructive", children: [_jsx(XCircle, { className: "h-4 w-4" }), _jsx(AlertDescription, { children: error?.message || error?.toString() || 'Unknown error' })] }, idx))) })] })), _jsx("div", { className: "flex justify-end", children: _jsx(Button, { onClick: () => setShowResults(false), children: "Close" }) })] })] }) }))] })] }));
}
