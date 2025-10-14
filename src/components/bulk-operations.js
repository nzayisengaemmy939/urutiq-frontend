import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Upload, Download, FileSpreadsheet, FileText, CheckCircle, AlertCircle, X, RefreshCw } from 'lucide-react';
export function BulkOperations({ onImport, onExport, trigger, className }) {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('import');
    const [importFile, setImportFile] = useState(null);
    const [importFormat, setImportFormat] = useState('csv');
    const [importResult, setImportResult] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [exportFormat, setExportFormat] = useState('csv');
    const [exportFilters, setExportFilters] = useState({
        category: 'all',
        location: 'all',
        status: 'all'
    });
    const fileInputRef = useRef(null);
    const { toast } = useToast();
    const handleFileSelect = (event) => {
        const file = event.target.files?.[0];
        if (file) {
            setImportFile(file);
            setImportResult(null);
            // Auto-detect format from file extension
            const extension = file.name.split('.').pop()?.toLowerCase();
            if (extension === 'xlsx' || extension === 'xls') {
                setImportFormat('excel');
            }
            else if (extension === 'json') {
                setImportFormat('json');
            }
            else {
                setImportFormat('csv');
            }
        }
    };
    const processImport = async () => {
        if (!importFile)
            return;
        setIsProcessing(true);
        setProgress(0);
        try {
            // Simulate processing with progress updates
            const interval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(interval);
                        return 90;
                    }
                    return prev + 10;
                });
            }, 200);
            // Parse file based on format
            const text = await importFile.text();
            let data = [];
            if (importFormat === 'csv') {
                data = parseCSV(text);
            }
            else if (importFormat === 'json') {
                data = JSON.parse(text);
            }
            else if (importFormat === 'excel') {
                // In a real implementation, you'd use a library like xlsx
                data = parseCSV(text); // Fallback to CSV parsing
            }
            // Validate data
            const validation = validateImportData(data);
            clearInterval(interval);
            setProgress(100);
            setTimeout(() => {
                setImportResult(validation);
                setIsProcessing(false);
                if (validation.success) {
                    toast({
                        title: "Import Successful",
                        description: `Successfully imported ${validation.processed} items`,
                    });
                    if (onImport) {
                        onImport(data);
                    }
                }
                else {
                    toast({
                        title: "Import Failed",
                        description: `Found ${validation.errors.length} errors`,
                        variant: "destructive"
                    });
                }
            }, 500);
        }
        catch (error) {
            setIsProcessing(false);
            setProgress(0);
            toast({
                title: "Import Error",
                description: "Failed to process the file",
                variant: "destructive"
            });
        }
    };
    const parseCSV = (text) => {
        const lines = text.split('\n').filter(line => line.trim());
        if (lines.length < 2)
            return [];
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const data = [];
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
            const row = {};
            headers.forEach((header, index) => {
                row[header] = values[index] || '';
            });
            data.push(row);
        }
        return data;
    };
    const validateImportData = (data) => {
        const errors = [];
        const warnings = [];
        let processed = 0;
        data.forEach((row, index) => {
            const rowNum = index + 2; // Account for header row
            // Required fields validation
            if (!row.name || !row.sku) {
                errors.push(`Row ${rowNum}: Missing required fields (name, sku)`);
                return;
            }
            // Numeric validation
            if (row.price && isNaN(parseFloat(row.price))) {
                errors.push(`Row ${rowNum}: Invalid price format`);
            }
            if (row.stock && isNaN(parseInt(row.stock))) {
                errors.push(`Row ${rowNum}: Invalid stock quantity`);
            }
            // Warning for missing optional fields
            if (!row.category) {
                warnings.push(`Row ${rowNum}: Missing category (will be set to 'Uncategorized')`);
            }
            processed++;
        });
        return {
            success: errors.length === 0,
            processed,
            errors,
            warnings
        };
    };
    const handleExport = () => {
        if (onExport) {
            onExport(exportFormat);
        }
        toast({
            title: "Export Started",
            description: `Exporting data in ${exportFormat.toUpperCase()} format`,
        });
        setIsOpen(false);
    };
    const clearImport = () => {
        setImportFile(null);
        setImportResult(null);
        setProgress(0);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };
    const downloadTemplate = () => {
        const template = [
            ['name', 'sku', 'description', 'category', 'price', 'stock', 'reorder_point', 'location'],
            ['Sample Product 1', 'SKU001', 'Sample description', 'Electronics', '29.99', '100', '10', 'Main Warehouse'],
            ['Sample Product 2', 'SKU002', 'Another sample', 'Clothing', '19.99', '50', '5', 'Store Location']
        ].map(row => row.join(',')).join('\n');
        const blob = new Blob([template], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'inventory_template.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };
    return (_jsxs(Dialog, { open: isOpen, onOpenChange: setIsOpen, children: [_jsx(DialogTrigger, { asChild: true, children: trigger || (_jsxs(Button, { variant: "outline", className: className, children: [_jsx(Upload, { className: "w-4 h-4 mr-2" }), "Bulk Operations"] })) }), _jsxs(DialogContent, { className: "max-w-4xl max-h-[90vh] overflow-y-auto", children: [_jsx(DialogHeader, { children: _jsxs(DialogTitle, { className: "flex items-center gap-2", children: [_jsx(FileSpreadsheet, { className: "w-5 h-5" }), "Bulk Import/Export Operations"] }) }), _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex space-x-1 bg-muted p-1 rounded-lg", children: [_jsxs("button", { className: `flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'import'
                                            ? 'bg-background text-foreground shadow-sm'
                                            : 'text-muted-foreground hover:text-foreground'}`, onClick: () => setActiveTab('import'), children: [_jsx(Upload, { className: "w-4 h-4 mr-2 inline" }), "Import Data"] }), _jsxs("button", { className: `flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'export'
                                            ? 'bg-background text-foreground shadow-sm'
                                            : 'text-muted-foreground hover:text-foreground'}`, onClick: () => setActiveTab('export'), children: [_jsx(Download, { className: "w-4 h-4 mr-2 inline" }), "Export Data"] })] }), activeTab === 'import' && (_jsx("div", { className: "space-y-4", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-lg", children: "Import Inventory Data" }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "import-file", children: "Select File" }), _jsx(Input, { id: "import-file", type: "file", accept: ".csv,.xlsx,.xls,.json", onChange: handleFileSelect, ref: fileInputRef }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Supported formats: CSV, Excel (.xlsx, .xls), JSON" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "import-format", children: "File Format" }), _jsxs(Select, { value: importFormat, onValueChange: setImportFormat, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "csv", children: "CSV" }), _jsx(SelectItem, { value: "excel", children: "Excel" }), _jsx(SelectItem, { value: "json", children: "JSON" })] })] })] }), importFile && (_jsxs("div", { className: "flex items-center justify-between p-3 bg-muted rounded-lg", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(FileText, { className: "w-4 h-4" }), _jsx("span", { className: "font-medium", children: importFile.name }), _jsxs(Badge, { variant: "outline", children: [(importFile.size / 1024).toFixed(1), " KB"] })] }), _jsx(Button, { variant: "ghost", size: "sm", onClick: clearImport, children: _jsx(X, { className: "w-4 h-4" }) })] })), isProcessing && (_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between text-sm", children: [_jsx("span", { children: "Processing..." }), _jsxs("span", { children: [progress, "%"] })] }), _jsx(Progress, { value: progress })] })), importResult && (_jsx(Card, { className: importResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50', children: _jsxs(CardContent, { className: "p-4", children: [_jsxs("div", { className: "flex items-center gap-2 mb-3", children: [importResult.success ? (_jsx(CheckCircle, { className: "w-5 h-5 text-green-600" })) : (_jsx(AlertCircle, { className: "w-5 h-5 text-red-600" })), _jsx("span", { className: "font-medium", children: importResult.success ? 'Import Successful' : 'Import Failed' })] }), _jsxs("div", { className: "space-y-2 text-sm", children: [_jsxs("p", { children: ["Processed: ", importResult.processed, " items"] }), importResult.errors.length > 0 && (_jsxs("div", { children: [_jsx("p", { className: "font-medium text-red-600", children: "Errors:" }), _jsx("ul", { className: "list-disc list-inside space-y-1", children: importResult.errors.map((error, index) => (_jsx("li", { className: "text-red-600", children: error }, index))) })] })), importResult.warnings.length > 0 && (_jsxs("div", { children: [_jsx("p", { className: "font-medium text-amber-600", children: "Warnings:" }), _jsx("ul", { className: "list-disc list-inside space-y-1", children: importResult.warnings.map((warning, index) => (_jsx("li", { className: "text-amber-600", children: warning }, index))) })] }))] })] }) })), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { onClick: downloadTemplate, variant: "outline", children: [_jsx(Download, { className: "w-4 h-4 mr-2" }), "Download Template"] }), _jsx(Button, { onClick: processImport, disabled: !importFile || isProcessing, className: "flex-1", children: isProcessing ? (_jsxs(_Fragment, { children: [_jsx(RefreshCw, { className: "w-4 h-4 mr-2 animate-spin" }), "Processing..."] })) : (_jsxs(_Fragment, { children: [_jsx(Upload, { className: "w-4 h-4 mr-2" }), "Import Data"] })) })] })] })] }) })), activeTab === 'export' && (_jsx("div", { className: "space-y-4", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-lg", children: "Export Inventory Data" }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "export-format", children: "Export Format" }), _jsxs(Select, { value: exportFormat, onValueChange: setExportFormat, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "csv", children: "CSV" }), _jsx(SelectItem, { value: "excel", children: "Excel" }), _jsx(SelectItem, { value: "json", children: "JSON" }), _jsx(SelectItem, { value: "pdf", children: "PDF Report" })] })] })] }), _jsxs("div", { className: "grid grid-cols-3 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "export-category", children: "Category" }), _jsxs(Select, { value: exportFilters.category, onValueChange: (value) => setExportFilters(prev => ({ ...prev, category: value })), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All Categories" }), _jsx(SelectItem, { value: "electronics", children: "Electronics" }), _jsx(SelectItem, { value: "clothing", children: "Clothing" }), _jsx(SelectItem, { value: "books", children: "Books" })] })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "export-location", children: "Location" }), _jsxs(Select, { value: exportFilters.location, onValueChange: (value) => setExportFilters(prev => ({ ...prev, location: value })), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All Locations" }), _jsx(SelectItem, { value: "main-warehouse", children: "Main Warehouse" }), _jsx(SelectItem, { value: "store-location", children: "Store Location" })] })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "export-status", children: "Status" }), _jsxs(Select, { value: exportFilters.status, onValueChange: (value) => setExportFilters(prev => ({ ...prev, status: value })), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All Status" }), _jsx(SelectItem, { value: "active", children: "Active" }), _jsx(SelectItem, { value: "inactive", children: "Inactive" }), _jsx(SelectItem, { value: "discontinued", children: "Discontinued" })] })] })] })] }), _jsx("div", { className: "flex gap-2", children: _jsxs(Button, { onClick: handleExport, className: "flex-1", children: [_jsx(Download, { className: "w-4 h-4 mr-2" }), "Export Data"] }) })] })] }) }))] })] })] }));
}
export default BulkOperations;
