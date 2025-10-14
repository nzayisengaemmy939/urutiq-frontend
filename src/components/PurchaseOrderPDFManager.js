import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { Download, Eye, Mail, Save, FileText, Printer, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
export const PurchaseOrderPDFManager = ({ purchaseOrder, onClose }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [isEmailing, setIsEmailing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [includeReceived, setIncludeReceived] = useState(false);
    const [emailData, setEmailData] = useState({
        to: purchaseOrder.vendor.email || '',
        cc: '',
        bcc: '',
        subject: `Purchase Order ${purchaseOrder.poNumber} - ${purchaseOrder.company.name}`,
        message: `Dear ${purchaseOrder.vendor.name},\n\nPlease find attached the purchase order ${purchaseOrder.poNumber} from ${purchaseOrder.company.name}.\n\nOrder Details:\n- PO Number: ${purchaseOrder.poNumber}\n- Order Date: ${new Date(purchaseOrder.orderDate).toLocaleDateString()}\n- Total Amount: $${purchaseOrder.totalAmount.toFixed(2)}\n\nPlease confirm receipt of this purchase order and provide an estimated delivery date.\n\nIf you have any questions, please contact us at ${purchaseOrder.company.email || 'our support team'}.\n\nBest regards,\n${purchaseOrder.company.name}`
    });
    const [showEmailDialog, setShowEmailDialog] = useState(false);
    const [showSaveDialog, setShowSaveDialog] = useState(false);
    const [savePath, setSavePath] = useState('');
    const handleDownloadPDF = async () => {
        setIsGenerating(true);
        try {
            const response = await fetch(`/api/purchase-orders/${purchaseOrder.id}/pdf?includeReceived=${includeReceived}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'x-tenant-id': localStorage.getItem('tenantId') || '',
                    'x-company-id': localStorage.getItem('companyId') || ''
                }
            });
            if (!response.ok) {
                throw new Error('Failed to generate PDF');
            }
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `PO-${purchaseOrder.poNumber}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            toast.success('PDF downloaded successfully');
        }
        catch (error) {
            console.error('Error downloading PDF:', error);
            toast.error('Failed to download PDF');
        }
        finally {
            setIsGenerating(false);
        }
    };
    const handlePreviewPDF = async () => {
        setIsGenerating(true);
        try {
            const response = await fetch(`/api/purchase-orders/${purchaseOrder.id}/pdf/preview?includeReceived=${includeReceived}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'x-tenant-id': localStorage.getItem('tenantId') || '',
                    'x-company-id': localStorage.getItem('companyId') || ''
                }
            });
            if (!response.ok) {
                throw new Error('Failed to generate PDF preview');
            }
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            window.open(url, '_blank');
            toast.success('PDF preview opened');
        }
        catch (error) {
            console.error('Error previewing PDF:', error);
            toast.error('Failed to preview PDF');
        }
        finally {
            setIsGenerating(false);
        }
    };
    const handleEmailPDF = async () => {
        setIsEmailing(true);
        try {
            const response = await fetch(`/api/purchase-orders/${purchaseOrder.id}/pdf/email`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'x-tenant-id': localStorage.getItem('tenantId') || '',
                    'x-company-id': localStorage.getItem('companyId') || ''
                },
                body: JSON.stringify({
                    ...emailData,
                    includeReceived
                })
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.message || 'Failed to send email');
            }
            toast.success('Purchase order PDF sent successfully');
            setShowEmailDialog(false);
        }
        catch (error) {
            console.error('Error sending email:', error);
            toast.error('Failed to send email');
        }
        finally {
            setIsEmailing(false);
        }
    };
    const handleSavePDF = async () => {
        setIsSaving(true);
        try {
            const response = await fetch(`/api/purchase-orders/${purchaseOrder.id}/pdf/save`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'x-tenant-id': localStorage.getItem('tenantId') || '',
                    'x-company-id': localStorage.getItem('companyId') || ''
                },
                body: JSON.stringify({
                    filePath: savePath || undefined,
                    includeReceived
                })
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.message || 'Failed to save PDF');
            }
            toast.success(`PDF saved successfully${result.data.filePath ? ` at ${result.data.filePath}` : ''}`);
            setShowSaveDialog(false);
        }
        catch (error) {
            console.error('Error saving PDF:', error);
            toast.error('Failed to save PDF');
        }
        finally {
            setIsSaving(false);
        }
    };
    const handlePrint = () => {
        handlePreviewPDF();
    };
    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'draft': return 'bg-gray-100 text-gray-800';
            case 'sent': return 'bg-blue-100 text-blue-800';
            case 'confirmed': return 'bg-green-100 text-green-800';
            case 'delivered': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900", children: "Purchase Order PDF" }), _jsxs("p", { className: "text-gray-600", children: ["Generate and manage PDF documents for ", purchaseOrder.poNumber] })] }), _jsx(Badge, { className: `px-3 py-1 ${getStatusColor(purchaseOrder.status)}`, children: purchaseOrder.status })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(FileText, { className: "w-5 h-5" }), "PDF Options"] }), _jsx(CardDescription, { children: "Configure PDF generation settings" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "includeReceived", checked: includeReceived, onCheckedChange: (checked) => setIncludeReceived(checked) }), _jsx(Label, { htmlFor: "includeReceived", children: "Include received quantities in PDF" })] }) })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: [_jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-3", children: _jsxs(CardTitle, { className: "text-lg flex items-center gap-2", children: [_jsx(Download, { className: "w-5 h-5" }), "Download PDF"] }) }), _jsxs(CardContent, { children: [_jsx("p", { className: "text-sm text-gray-600 mb-4", children: "Download the purchase order as a PDF file" }), _jsxs(Button, { onClick: handleDownloadPDF, disabled: isGenerating, className: "w-full", children: [isGenerating ? (_jsx(Loader2, { className: "w-4 h-4 mr-2 animate-spin" })) : (_jsx(Download, { className: "w-4 h-4 mr-2" })), isGenerating ? 'Generating...' : 'Download PDF'] })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-3", children: _jsxs(CardTitle, { className: "text-lg flex items-center gap-2", children: [_jsx(Eye, { className: "w-5 h-5" }), "Preview PDF"] }) }), _jsxs(CardContent, { children: [_jsx("p", { className: "text-sm text-gray-600 mb-4", children: "Open PDF in a new tab for preview" }), _jsxs(Button, { onClick: handlePreviewPDF, disabled: isGenerating, variant: "outline", className: "w-full", children: [isGenerating ? (_jsx(Loader2, { className: "w-4 h-4 mr-2 animate-spin" })) : (_jsx(Eye, { className: "w-4 h-4 mr-2" })), isGenerating ? 'Generating...' : 'Preview PDF'] })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-3", children: _jsxs(CardTitle, { className: "text-lg flex items-center gap-2", children: [_jsx(Printer, { className: "w-5 h-5" }), "Print PDF"] }) }), _jsxs(CardContent, { children: [_jsx("p", { className: "text-sm text-gray-600 mb-4", children: "Open PDF for printing" }), _jsxs(Button, { onClick: handlePrint, disabled: isGenerating, variant: "outline", className: "w-full", children: [isGenerating ? (_jsx(Loader2, { className: "w-4 h-4 mr-2 animate-spin" })) : (_jsx(Printer, { className: "w-4 h-4 mr-2" })), isGenerating ? 'Generating...' : 'Print PDF'] })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-3", children: _jsxs(CardTitle, { className: "text-lg flex items-center gap-2", children: [_jsx(Mail, { className: "w-5 h-5" }), "Email PDF"] }) }), _jsxs(CardContent, { children: [_jsx("p", { className: "text-sm text-gray-600 mb-4", children: "Send PDF to vendor via email" }), _jsxs(Dialog, { open: showEmailDialog, onOpenChange: setShowEmailDialog, children: [_jsx(DialogTrigger, { asChild: true, children: _jsxs(Button, { variant: "outline", className: "w-full", children: [_jsx(Mail, { className: "w-4 h-4 mr-2" }), "Email PDF"] }) }), _jsxs(DialogContent, { className: "max-w-2xl", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Email Purchase Order PDF" }), _jsx(DialogDescription, { children: "Send the purchase order PDF to the vendor" })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "emailTo", children: "To *" }), _jsx(Input, { id: "emailTo", type: "email", value: emailData.to, onChange: (e) => setEmailData(prev => ({ ...prev, to: e.target.value })), placeholder: "vendor@example.com" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "emailCc", children: "CC" }), _jsx(Input, { id: "emailCc", type: "email", value: emailData.cc, onChange: (e) => setEmailData(prev => ({ ...prev, cc: e.target.value })), placeholder: "cc@example.com" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "emailBcc", children: "BCC" }), _jsx(Input, { id: "emailBcc", type: "email", value: emailData.bcc, onChange: (e) => setEmailData(prev => ({ ...prev, bcc: e.target.value })), placeholder: "bcc@example.com" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "emailSubject", children: "Subject *" }), _jsx(Input, { id: "emailSubject", value: emailData.subject, onChange: (e) => setEmailData(prev => ({ ...prev, subject: e.target.value })), placeholder: "Purchase Order Subject" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "emailMessage", children: "Message" }), _jsx(Textarea, { id: "emailMessage", value: emailData.message, onChange: (e) => setEmailData(prev => ({ ...prev, message: e.target.value })), rows: 6, placeholder: "Email message..." })] }), _jsxs("div", { className: "flex justify-end space-x-2", children: [_jsx(Button, { variant: "outline", onClick: () => setShowEmailDialog(false), children: "Cancel" }), _jsxs(Button, { onClick: handleEmailPDF, disabled: isEmailing || !emailData.to, children: [isEmailing ? (_jsx(Loader2, { className: "w-4 h-4 mr-2 animate-spin" })) : (_jsx(Mail, { className: "w-4 h-4 mr-2" })), isEmailing ? 'Sending...' : 'Send Email'] })] })] })] })] })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-3", children: _jsxs(CardTitle, { className: "text-lg flex items-center gap-2", children: [_jsx(Save, { className: "w-5 h-5" }), "Save PDF"] }) }), _jsxs(CardContent, { children: [_jsx("p", { className: "text-sm text-gray-600 mb-4", children: "Save PDF to server file system" }), _jsxs(Dialog, { open: showSaveDialog, onOpenChange: setShowSaveDialog, children: [_jsx(DialogTrigger, { asChild: true, children: _jsxs(Button, { variant: "outline", className: "w-full", children: [_jsx(Save, { className: "w-4 h-4 mr-2" }), "Save PDF"] }) }), _jsxs(DialogContent, { children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Save Purchase Order PDF" }), _jsx(DialogDescription, { children: "Save the PDF to the server file system" })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "savePath", children: "File Path (Optional)" }), _jsx(Input, { id: "savePath", value: savePath, onChange: (e) => setSavePath(e.target.value), placeholder: "Leave empty for default path" }), _jsxs("p", { className: "text-xs text-gray-500 mt-1", children: ["If empty, will use default path: uploads/purchase-orders/PO-", purchaseOrder.poNumber, "-", Date.now(), ".pdf"] })] }), _jsxs("div", { className: "flex justify-end space-x-2", children: [_jsx(Button, { variant: "outline", onClick: () => setShowSaveDialog(false), children: "Cancel" }), _jsxs(Button, { onClick: handleSavePDF, disabled: isSaving, children: [isSaving ? (_jsx(Loader2, { className: "w-4 h-4 mr-2 animate-spin" })) : (_jsx(Save, { className: "w-4 h-4 mr-2" })), isSaving ? 'Saving...' : 'Save PDF'] })] })] })] })] })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-3", children: _jsxs(CardTitle, { className: "text-lg flex items-center gap-2", children: [_jsx(FileText, { className: "w-5 h-5" }), "Template"] }) }), _jsxs(CardContent, { children: [_jsx("p", { className: "text-sm text-gray-600 mb-4", children: "Preview PDF template" }), _jsxs(Button, { onClick: () => window.open('/api/purchase-orders/pdf/template', '_blank'), variant: "outline", className: "w-full", children: [_jsx(FileText, { className: "w-4 h-4 mr-2" }), "View Template"] })] })] })] }), onClose && (_jsx("div", { className: "flex justify-end", children: _jsx(Button, { variant: "outline", onClick: onClose, children: "Close" }) }))] }));
};
export default PurchaseOrderPDFManager;
