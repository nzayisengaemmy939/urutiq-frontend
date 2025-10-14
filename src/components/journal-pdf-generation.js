import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Download, Eye, FileText, Settings, Loader2 } from 'lucide-react';
import { apiService } from '../lib/api';
import { useToast } from '../hooks/use-toast';
export function JournalPDFGeneration({ entryId, entryIds = [], onClose, isOpen = false }) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [previewHtml, setPreviewHtml] = useState('');
    const [options, setOptions] = useState({
        includeAuditTrail: true,
        includeCompanyHeader: true,
        format: 'detailed'
    });
    const { toast } = useToast();
    const isBatch = entryIds.length > 0;
    const targetIds = isBatch ? entryIds : (entryId ? [entryId] : []);
    const handleGeneratePDF = async () => {
        if (targetIds.length === 0)
            return;
        setIsGenerating(true);
        try {
            if (isBatch) {
                const blob = await apiService.generateBatchJournalEntryPDF(targetIds, options);
                downloadBlob(blob, `journal-entries-${Date.now()}.pdf`);
                toast({
                    title: "PDF Generated",
                    description: `Successfully generated PDF for ${targetIds.length} journal entries`
                });
            }
            else {
                const blob = await apiService.generateJournalEntryPDF(targetIds[0], options);
                downloadBlob(blob, `journal-entry-${targetIds[0]}.pdf`);
                toast({
                    title: "PDF Generated",
                    description: "Successfully generated PDF for journal entry"
                });
            }
        }
        catch (error) {
            console.error('Error generating PDF:', error);
            toast({
                title: "Error",
                description: "Failed to generate PDF. Please try again.",
                variant: "destructive"
            });
        }
        finally {
            setIsGenerating(false);
        }
    };
    const handlePreview = async () => {
        if (targetIds.length === 0 || isBatch)
            return;
        setIsGenerating(true);
        try {
            const html = await apiService.getJournalEntryPreview(targetIds[0], options);
            setPreviewHtml(html);
            setShowPreview(true);
        }
        catch (error) {
            console.error('Error generating preview:', error);
            toast({
                title: "Error",
                description: "Failed to generate preview. Please try again.",
                variant: "destructive"
            });
        }
        finally {
            setIsGenerating(false);
        }
    };
    const downloadBlob = (blob, filename) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };
    const handlePrintPreview = () => {
        if (previewHtml) {
            const printWindow = window.open('', '_blank');
            if (printWindow) {
                printWindow.document.write(previewHtml);
                printWindow.document.close();
                printWindow.focus();
                printWindow.print();
            }
        }
    };
    return (_jsxs(_Fragment, { children: [_jsx(Dialog, { open: isOpen, onOpenChange: onClose, children: _jsxs(DialogContent, { className: "max-w-2xl", children: [_jsxs(DialogHeader, { children: [_jsxs(DialogTitle, { className: "flex items-center space-x-2", children: [_jsx(FileText, { className: "w-5 h-5" }), _jsx("span", { children: "Generate PDF" })] }), _jsx(DialogDescription, { children: isBatch
                                        ? `Generate PDF for ${entryIds.length} selected journal entries`
                                        : 'Generate PDF for this journal entry' })] }), _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "space-y-4", children: [_jsxs("h3", { className: "text-lg font-semibold flex items-center space-x-2", children: [_jsx(Settings, { className: "w-4 h-4" }), _jsx("span", { children: "PDF Options" })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "format", children: "Format" }), _jsxs(Select, { value: options.format, onValueChange: (value) => setOptions(prev => ({ ...prev, format: value })), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "detailed", children: "Detailed" }), _jsx(SelectItem, { value: "summary", children: "Summary" })] })] })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "includeCompanyHeader", checked: options.includeCompanyHeader, onCheckedChange: (checked) => setOptions(prev => ({ ...prev, includeCompanyHeader: !!checked })) }), _jsx(Label, { htmlFor: "includeCompanyHeader", children: "Include Company Header" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "includeAuditTrail", checked: options.includeAuditTrail, onCheckedChange: (checked) => setOptions(prev => ({ ...prev, includeAuditTrail: !!checked })) }), _jsx(Label, { htmlFor: "includeAuditTrail", children: "Include Audit Trail" })] })] })] }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-3", children: [!isBatch && (_jsxs(Button, { variant: "outline", onClick: handlePreview, disabled: isGenerating, className: "flex items-center space-x-2", children: [isGenerating ? (_jsx(Loader2, { className: "w-4 h-4 animate-spin" })) : (_jsx(Eye, { className: "w-4 h-4" })), _jsx("span", { children: "Preview" })] })), _jsxs(Button, { onClick: handleGeneratePDF, disabled: isGenerating || targetIds.length === 0, className: "flex items-center space-x-2 flex-1", children: [isGenerating ? (_jsx(Loader2, { className: "w-4 h-4 animate-spin" })) : (_jsx(Download, { className: "w-4 h-4" })), _jsx("span", { children: isGenerating
                                                        ? 'Generating...'
                                                        : isBatch
                                                            ? `Generate PDF (${entryIds.length} entries)`
                                                            : 'Generate PDF' })] })] }), _jsxs("div", { className: "text-sm text-muted-foreground space-y-2", children: [_jsxs("div", { children: [_jsx("strong", { children: "Detailed Format:" }), " Includes all line details, memos, departments, projects, and locations."] }), _jsxs("div", { children: [_jsx("strong", { children: "Summary Format:" }), " Shows only essential information for a concise view."] })] })] })] }) }), _jsx(Dialog, { open: showPreview, onOpenChange: setShowPreview, children: _jsxs(DialogContent, { className: "max-w-6xl max-h-[90vh] overflow-hidden", children: [_jsx(DialogHeader, { children: _jsxs(DialogTitle, { className: "flex items-center justify-between", children: [_jsxs("span", { className: "flex items-center space-x-2", children: [_jsx(Eye, { className: "w-5 h-5" }), _jsx("span", { children: "PDF Preview" })] }), _jsxs("div", { className: "flex space-x-2", children: [_jsxs(Button, { variant: "outline", size: "sm", onClick: handlePrintPreview, className: "flex items-center space-x-1", children: [_jsx(FileText, { className: "w-4 h-4" }), _jsx("span", { children: "Print" })] }), _jsxs(Button, { size: "sm", onClick: handleGeneratePDF, disabled: isGenerating, className: "flex items-center space-x-1", children: [isGenerating ? (_jsx(Loader2, { className: "w-4 h-4 animate-spin" })) : (_jsx(Download, { className: "w-4 h-4" })), _jsx("span", { children: "Download PDF" })] })] })] }) }), _jsx("div", { className: "overflow-auto max-h-[70vh] border rounded-lg", children: _jsx("iframe", { srcDoc: previewHtml, className: "w-full h-full min-h-[600px] border-0", title: "PDF Preview" }) })] }) })] }));
}
export function QuickPDFActions({ entryId, variant = 'icon' }) {
    const [showPDFDialog, setShowPDFDialog] = useState(false);
    const { toast } = useToast();
    const handleQuickPDF = async () => {
        try {
            const blob = await apiService.generateJournalEntryPDF(entryId, {
                includeAuditTrail: true,
                includeCompanyHeader: true,
                format: 'detailed'
            });
            downloadBlob(blob, `journal-entry-${entryId}.pdf`);
            toast({
                title: "PDF Generated",
                description: "Successfully generated PDF for journal entry"
            });
        }
        catch (error) {
            console.error('Error generating PDF:', error);
            toast({
                title: "Error",
                description: "Failed to generate PDF. Please try again.",
                variant: "destructive"
            });
        }
    };
    const downloadBlob = (blob, filename) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };
    if (variant === 'button') {
        return (_jsxs(_Fragment, { children: [_jsxs(Button, { variant: "outline", size: "sm", onClick: () => setShowPDFDialog(true), className: "flex items-center space-x-1", children: [_jsx(FileText, { className: "w-4 h-4" }), _jsx("span", { children: "PDF" })] }), _jsx(JournalPDFGeneration, { entryId: entryId, isOpen: showPDFDialog, onClose: () => setShowPDFDialog(false) })] }));
    }
    return (_jsx(_Fragment, { children: _jsx(Button, { variant: "ghost", size: "sm", onClick: handleQuickPDF, className: "h-8 w-8 p-0", title: "Generate PDF", children: _jsx(FileText, { className: "w-4 h-4" }) }) }));
}
export function BatchPDFActions({ selectedEntries, onClearSelection }) {
    const [showPDFDialog, setShowPDFDialog] = useState(false);
    const { toast } = useToast();
    if (selectedEntries.length === 0)
        return null;
    return (_jsxs(_Fragment, { children: [_jsxs(Button, { variant: "outline", onClick: () => setShowPDFDialog(true), className: "flex items-center space-x-2", children: [_jsx(FileText, { className: "w-4 h-4" }), _jsxs("span", { children: ["Generate PDF (", selectedEntries.length, ")"] })] }), _jsx(JournalPDFGeneration, { entryIds: selectedEntries, isOpen: showPDFDialog, onClose: () => {
                    setShowPDFDialog(false);
                    onClearSelection?.();
                } })] }));
}
