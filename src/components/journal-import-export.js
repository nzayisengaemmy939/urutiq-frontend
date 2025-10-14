import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useRef } from 'react';
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
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Upload, FileText, FileSpreadsheet, Loader2 } from 'lucide-react';
export function JournalImportExport({ companyId, currentFilters, onRefresh }) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const fileInputRef = useRef(null);
    // State
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
    const [isProcessing, setIsProcessing] = useState(false);
    const [importResult, setImportResult] = useState(null);
    const [showResults, setShowResults] = useState(false);
    // Import mutation
    const importMutation = useMutation({
        mutationFn: (data) => apiService.importJournalEntriesCsv(data),
        onSuccess: (response) => {
            setImportResult(response.data);
            setShowResults(true);
            queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
            queryClient.invalidateQueries({ queryKey: ['journal-hub-summary'] });
            toast({ title: "Success", description: response.message });
            onRefresh();
        },
        onError: (error) => {
            toast({ title: "Error", description: error?.response?.data?.message || 'Import failed', variant: "destructive" });
        }
    });
    // Handlers
    const handleFileSelect = (event) => {
        const file = event.target.files?.[0];
        if (file) {
            setImportFile(file);
            // Read file content
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target?.result;
                setCsvData(content);
            };
            reader.readAsText(file);
        }
    };
    const handleImport = () => {
        if (!csvData.trim()) {
            toast({ title: "Error", description: "Please select a file to import", variant: "destructive" });
            return;
        }
        setIsProcessing(true);
        importMutation.mutate({
            csvData,
            options: importOptions
        });
    };
    const handleExport = async () => {
        try {
            setIsProcessing(true);
            const params = {
                companyId,
                dateFrom: exportOptions.dateFrom || undefined,
                dateTo: exportOptions.dateTo || undefined,
                status: exportOptions.status !== 'all' ? exportOptions.status : undefined,
                entryType: exportOptions.entryType !== 'all' ? exportOptions.entryType : undefined,
                format: exportOptions.format
            };
            let blob;
            let filename;
            if (exportOptions.fileFormat === 'csv') {
                blob = await apiService.exportJournalEntriesCsv(params);
                filename = `journal-entries-${new Date().toISOString().split('T')[0]}.csv`;
            }
            else {
                blob = await apiService.exportJournalEntriesExcel(params);
                filename = `journal-entries-${new Date().toISOString().split('T')[0]}.xlsx`;
            }
            // Download file
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            toast({ title: "Success", description: "Export completed successfully" });
        }
        catch (error) {
            toast({ title: "Error", description: error.message || 'Export failed', variant: "destructive" });
        }
        finally {
            setIsProcessing(false);
        }
    };
    const handleDownloadTemplate = async (format) => {
        try {
            const blob = await apiService.downloadImportTemplate(format);
            const filename = `journal-entries-template.${format}`;
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            toast({ title: "Success", description: "Template downloaded successfully" });
        }
        catch (error) {
            toast({ title: "Error", description: error.message || 'Failed to download template', variant: "destructive" });
        }
    };
    const handleCloseImportDialog = () => {
        setShowImportDialog(false);
        setImportFile(null);
        setCsvData('');
        setImportResult(null);
        setShowResults(false);
        setIsProcessing(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };
    const handleCloseExportDialog = () => {
        setShowExportDialog(false);
        setIsProcessing(false);
    };
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center space-x-2", children: [_jsx(FileText, { className: "w-5 h-5" }), _jsx("span", { children: "Import & Export" })] }), _jsx(CardDescription, { children: "Import journal entries from CSV/Excel or export existing entries" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "flex flex-wrap gap-2", children: [_jsx(Dialog, { open: showImportDialog, onOpenChange: setShowImportDialog, children: _jsx(DialogTrigger, { asChild: true, children: _jsxs(Button, { variant: "outline", size: "sm", children: [_jsx(Upload, { className: "w-4 h-4 mr-2" }), "Import CSV/Excel"] }) }) }), _jsx(Dialog, { open: showExportDialog, onOpenChange: setShowExportDialog, children: _jsx(DialogTrigger, { asChild: true, children: _jsxs(Button, { variant: "outline", size: "sm", children: [_jsx(Download, { className: "w-4 h-4 mr-2" }), "Export Data"] }) }) }), _jsxs(Button, { variant: "outline", size: "sm", onClick: () => handleDownloadTemplate('csv'), children: [_jsx(FileText, { className: "w-4 h-4 mr-2" }), "CSV Template"] }), _jsxs(Button, { variant: "outline", size: "sm", onClick: () => handleDownloadTemplate('excel'), children: [_jsx(FileSpreadsheet, { className: "w-4 h-4 mr-2" }), "Excel Template"] })] }) })] }), _jsx(Dialog, { open: showImportDialog, onOpenChange: setShowImportDialog, children: _jsxs(DialogContent, { className: "max-w-2xl", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Import Journal Entries" }), _jsx(DialogDescription, { children: "Upload a CSV or Excel file to import journal entries" })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "import-file", children: "Select File" }), _jsx(Input, { id: "import-file", type: "file", accept: ".csv,.xlsx,.xls", onChange: handleFileSelect, ref: fileInputRef, className: "mt-1" }), importFile && (_jsxs("div", { className: "mt-2 text-sm text-gray-600", children: ["Selected: ", importFile.name, " (", (importFile.size / 1024).toFixed(1), " KB)"] }))] }), _jsxs("div", { className: "space-y-4", children: [_jsx("h4", { className: "font-medium", children: "Import Options" }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "validate-balances", checked: importOptions.validateBalances, onCheckedChange: (checked) => setImportOptions(prev => ({ ...prev, validateBalances: !!checked })) }), _jsx(Label, { htmlFor: "validate-balances", children: "Validate Balances" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "create-as-draft", checked: importOptions.createAsDraft, onCheckedChange: (checked) => setImportOptions(prev => ({ ...prev, createAsDraft: !!checked })) }), _jsx(Label, { htmlFor: "create-as-draft", children: "Create as Draft" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "skip-header", checked: importOptions.skipHeaderRow, onCheckedChange: (checked) => setImportOptions(prev => ({ ...prev, skipHeaderRow: !!checked })) }), _jsx(Label, { htmlFor: "skip-header", children: "Skip Header Row" })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "date-format", children: "Date Format" }), _jsxs(Select, { value: importOptions.dateFormat, onValueChange: (value) => setImportOptions(prev => ({ ...prev, dateFormat: value })), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "YYYY-MM-DD", children: "YYYY-MM-DD" }), _jsx(SelectItem, { value: "MM/DD/YYYY", children: "MM/DD/YYYY" }), _jsx(SelectItem, { value: "DD/MM/YYYY", children: "DD/MM/YYYY" })] })] })] })] }), csvData && (_jsxs("div", { children: [_jsx(Label, { children: "File Preview (first 5 lines)" }), _jsx(Textarea, { value: csvData.split('\n').slice(0, 5).join('\n'), readOnly: true, rows: 5, className: "mt-1 font-mono text-xs" })] })), _jsxs("div", { className: "flex justify-end space-x-2", children: [_jsx(Button, { variant: "outline", onClick: handleCloseImportDialog, children: "Cancel" }), _jsx(Button, { onClick: handleImport, disabled: !csvData || isProcessing, children: isProcessing ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "w-4 h-4 mr-2 animate-spin" }), "Importing..."] })) : (_jsxs(_Fragment, { children: [_jsx(Upload, { className: "w-4 h-4 mr-2" }), "Import Entries"] })) })] })] })] }) }), _jsx(Dialog, { open: showExportDialog, onOpenChange: setShowExportDialog, children: _jsxs(DialogContent, { className: "max-w-2xl", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Export Journal Entries" }), _jsx(DialogDescription, { children: "Export journal entries to CSV or Excel format" })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs(Tabs, { defaultValue: "format", className: "w-full", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-2", children: [_jsx(TabsTrigger, { value: "format", children: "Format Options" }), _jsx(TabsTrigger, { value: "filters", children: "Filters" })] }), _jsx(TabsContent, { value: "format", className: "space-y-4", children: _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "export-format", children: "Data Format" }), _jsxs(Select, { value: exportOptions.format, onValueChange: (value) => setExportOptions(prev => ({ ...prev, format: value })), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "detailed", children: "Detailed (All Lines)" }), _jsx(SelectItem, { value: "summary", children: "Summary (Entry Totals)" })] })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "file-format", children: "File Format" }), _jsxs(Select, { value: exportOptions.fileFormat, onValueChange: (value) => setExportOptions(prev => ({ ...prev, fileFormat: value })), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "csv", children: "CSV" }), _jsx(SelectItem, { value: "excel", children: "Excel" })] })] })] })] }) }), _jsx(TabsContent, { value: "filters", className: "space-y-4", children: _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "date-from", children: "Date From" }), _jsx(Input, { id: "date-from", type: "date", value: exportOptions.dateFrom, onChange: (e) => setExportOptions(prev => ({ ...prev, dateFrom: e.target.value })) })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "date-to", children: "Date To" }), _jsx(Input, { id: "date-to", type: "date", value: exportOptions.dateTo, onChange: (e) => setExportOptions(prev => ({ ...prev, dateTo: e.target.value })) })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "status-filter", children: "Status" }), _jsxs(Select, { value: exportOptions.status, onValueChange: (value) => setExportOptions(prev => ({ ...prev, status: value })), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All Status" }), _jsx(SelectItem, { value: "DRAFT", children: "Draft" }), _jsx(SelectItem, { value: "POSTED", children: "Posted" }), _jsx(SelectItem, { value: "REVERSED", children: "Reversed" }), _jsx(SelectItem, { value: "PENDING_APPROVAL", children: "Pending Approval" })] })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "entry-type-filter", children: "Entry Type" }), _jsxs(Select, { value: exportOptions.entryType, onValueChange: (value) => setExportOptions(prev => ({ ...prev, entryType: value })), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All Types" }), _jsx(SelectItem, { value: "sales", children: "Sales" }), _jsx(SelectItem, { value: "expense", children: "Expense" }), _jsx(SelectItem, { value: "adjustment", children: "Adjustment" })] })] })] })] }) })] }), _jsxs("div", { className: "flex justify-end space-x-2", children: [_jsx(Button, { variant: "outline", onClick: handleCloseExportDialog, children: "Cancel" }), _jsx(Button, { onClick: handleExport, disabled: isProcessing, children: isProcessing ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "w-4 h-4 mr-2 animate-spin" }), "Exporting..."] })) : (_jsxs(_Fragment, { children: [_jsx(Download, { className: "w-4 h-4 mr-2" }), "Export Data"] })) })] })] })] }) }), _jsx(Dialog, { open: showResults, onOpenChange: setShowResults, children: _jsxs(DialogContent, { className: "max-w-2xl", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Import Results" }), _jsx(DialogDescription, { children: "Import processing completed" })] }), importResult && (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [_jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-2xl font-bold text-green-600", children: importResult.summary.successful }), _jsx("div", { className: "text-sm text-gray-600", children: "Successful" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-2xl font-bold text-red-600", children: importResult.summary.failed }), _jsx("div", { className: "text-sm text-gray-600", children: "Failed" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-2xl font-bold text-blue-600", children: importResult.summary.total }), _jsx("div", { className: "text-sm text-gray-600", children: "Total" })] }), _jsxs("div", { className: "text-center", children: [_jsxs("div", { className: "text-2xl font-bold text-purple-600", children: [importResult.summary.processingTime, "ms"] }), _jsx("div", { className: "text-sm text-gray-600", children: "Time" })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { children: "Success Rate" }), _jsxs("span", { children: [Math.round((importResult.summary.successful / importResult.summary.total) * 100), "%"] })] }), _jsx(Progress, { value: (importResult.summary.successful / importResult.summary.total) * 100, className: "h-2" })] }), importResult.errors.length > 0 && (_jsxs("div", { className: "space-y-2", children: [_jsxs("h4", { className: "font-medium text-red-600", children: ["Errors (", importResult.errors.length, ")"] }), _jsxs("div", { className: "max-h-32 overflow-y-auto space-y-1", children: [importResult.errors.slice(0, 10).map((error, index) => (_jsxs("div", { className: "text-sm text-red-600 bg-red-50 p-2 rounded", children: [_jsxs("strong", { children: ["Row ", error.index + 1, ":"] }), " ", error.error] }, index))), importResult.errors.length > 10 && (_jsxs("div", { className: "text-sm text-gray-500", children: ["... and ", importResult.errors.length - 10, " more errors"] }))] })] })), importResult.success.length > 0 && (_jsxs("div", { className: "space-y-2", children: [_jsxs("h4", { className: "font-medium text-green-600", children: ["Successful (", importResult.success.length, ")"] }), _jsxs("div", { className: "max-h-32 overflow-y-auto space-y-1", children: [importResult.success.slice(0, 10).map((success, index) => (_jsxs("div", { className: "text-sm text-green-600 bg-green-50 p-2 rounded", children: [_jsxs("strong", { children: [success.reference, ":"] }), " $", success.totalDebit, " DR / $", success.totalCredit, " CR"] }, index))), importResult.success.length > 10 && (_jsxs("div", { className: "text-sm text-gray-500", children: ["... and ", importResult.success.length - 10, " more entries"] }))] })] })), _jsx("div", { className: "flex justify-end", children: _jsx(Button, { onClick: () => setShowResults(false), children: "Close" }) })] }))] }) })] }));
}
