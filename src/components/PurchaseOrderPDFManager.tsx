import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { 
  Download, 
  Eye, 
  Mail, 
  Save, 
  FileText, 
  Printer, 
  Share2,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

interface PurchaseOrder {
  id: string;
  poNumber: string;
  orderDate: string;
  status: string;
  totalAmount: number;
  vendor: {
    name: string;
    email?: string;
  };
  company: {
    name: string;
    email?: string;
  };
}

interface PurchaseOrderPDFManagerProps {
  purchaseOrder: PurchaseOrder;
  onClose?: () => void;
}

export const PurchaseOrderPDFManager: React.FC<PurchaseOrderPDFManagerProps> = ({
  purchaseOrder,
  onClose
}) => {
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
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Failed to download PDF');
    } finally {
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
    } catch (error) {
      console.error('Error previewing PDF:', error);
      toast.error('Failed to preview PDF');
    } finally {
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
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('Failed to send email');
    } finally {
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
    } catch (error) {
      console.error('Error saving PDF:', error);
      toast.error('Failed to save PDF');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrint = () => {
    handlePreviewPDF();
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Purchase Order PDF</h2>
          <p className="text-gray-600">Generate and manage PDF documents for {purchaseOrder.poNumber}</p>
        </div>
        <Badge className={`px-3 py-1 ${getStatusColor(purchaseOrder.status)}`}>
          {purchaseOrder.status}
        </Badge>
      </div>

      {/* Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            PDF Options
          </CardTitle>
          <CardDescription>
            Configure PDF generation settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="includeReceived"
              checked={includeReceived}
              onCheckedChange={(checked) => setIncludeReceived(checked as boolean)}
            />
            <Label htmlFor="includeReceived">
              Include received quantities in PDF
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Download PDF */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Download className="w-5 h-5" />
              Download PDF
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Download the purchase order as a PDF file
            </p>
            <Button 
              onClick={handleDownloadPDF} 
              disabled={isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              {isGenerating ? 'Generating...' : 'Download PDF'}
            </Button>
          </CardContent>
        </Card>

        {/* Preview PDF */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Preview PDF
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Open PDF in a new tab for preview
            </p>
            <Button 
              onClick={handlePreviewPDF} 
              disabled={isGenerating}
              variant="outline"
              className="w-full"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Eye className="w-4 h-4 mr-2" />
              )}
              {isGenerating ? 'Generating...' : 'Preview PDF'}
            </Button>
          </CardContent>
        </Card>

        {/* Print PDF */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Printer className="w-5 h-5" />
              Print PDF
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Open PDF for printing
            </p>
            <Button 
              onClick={handlePrint} 
              disabled={isGenerating}
              variant="outline"
              className="w-full"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Printer className="w-4 h-4 mr-2" />
              )}
              {isGenerating ? 'Generating...' : 'Print PDF'}
            </Button>
          </CardContent>
        </Card>

        {/* Email PDF */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Email PDF
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Send PDF to vendor via email
            </p>
            <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  <Mail className="w-4 h-4 mr-2" />
                  Email PDF
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Email Purchase Order PDF</DialogTitle>
                  <DialogDescription>
                    Send the purchase order PDF to the vendor
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="emailTo">To *</Label>
                    <Input
                      id="emailTo"
                      type="email"
                      value={emailData.to}
                      onChange={(e) => setEmailData(prev => ({ ...prev, to: e.target.value }))}
                      placeholder="vendor@example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="emailCc">CC</Label>
                    <Input
                      id="emailCc"
                      type="email"
                      value={emailData.cc}
                      onChange={(e) => setEmailData(prev => ({ ...prev, cc: e.target.value }))}
                      placeholder="cc@example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="emailBcc">BCC</Label>
                    <Input
                      id="emailBcc"
                      type="email"
                      value={emailData.bcc}
                      onChange={(e) => setEmailData(prev => ({ ...prev, bcc: e.target.value }))}
                      placeholder="bcc@example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="emailSubject">Subject *</Label>
                    <Input
                      id="emailSubject"
                      value={emailData.subject}
                      onChange={(e) => setEmailData(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder="Purchase Order Subject"
                    />
                  </div>
                  <div>
                    <Label htmlFor="emailMessage">Message</Label>
                    <Textarea
                      id="emailMessage"
                      value={emailData.message}
                      onChange={(e) => setEmailData(prev => ({ ...prev, message: e.target.value }))}
                      rows={6}
                      placeholder="Email message..."
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowEmailDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleEmailPDF} disabled={isEmailing || !emailData.to}>
                      {isEmailing ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Mail className="w-4 h-4 mr-2" />
                      )}
                      {isEmailing ? 'Sending...' : 'Send Email'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Save PDF */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Save className="w-5 h-5" />
              Save PDF
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Save PDF to server file system
            </p>
            <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  <Save className="w-4 h-4 mr-2" />
                  Save PDF
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Save Purchase Order PDF</DialogTitle>
                  <DialogDescription>
                    Save the PDF to the server file system
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="savePath">File Path (Optional)</Label>
                    <Input
                      id="savePath"
                      value={savePath}
                      onChange={(e) => setSavePath(e.target.value)}
                      placeholder="Leave empty for default path"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      If empty, will use default path: uploads/purchase-orders/PO-{purchaseOrder.poNumber}-{Date.now()}.pdf
                    </p>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSavePDF} disabled={isSaving}>
                      {isSaving ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      {isSaving ? 'Saving...' : 'Save PDF'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Template Preview */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Template
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Preview PDF template
            </p>
            <Button 
              onClick={() => window.open('/api/purchase-orders/pdf/template', '_blank')}
              variant="outline"
              className="w-full"
            >
              <FileText className="w-4 h-4 mr-2" />
              View Template
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Close Button */}
      {onClose && (
        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      )}
    </div>
  );
};

export default PurchaseOrderPDFManager;
