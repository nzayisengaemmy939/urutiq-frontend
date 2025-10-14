import React, { useState } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Download, Eye, FileText, Settings, Loader2 } from 'lucide-react';
import { apiService } from '../lib/api';
import { useToast } from '../hooks/use-toast';

interface JournalPDFGenerationProps {
  entryId?: string;
  entryIds?: string[];
  onClose?: () => void;
  isOpen?: boolean;
}

export function JournalPDFGeneration({ 
  entryId, 
  entryIds = [], 
  onClose, 
  isOpen = false 
}: JournalPDFGenerationProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [options, setOptions] = useState({
    includeAuditTrail: true,
    includeCompanyHeader: true,
    format: 'detailed' as 'detailed' | 'summary'
  });
  const { toast } = useToast();

  const isBatch = entryIds.length > 0;
  const targetIds = isBatch ? entryIds : (entryId ? [entryId] : []);

  const handleGeneratePDF = async () => {
    if (targetIds.length === 0) return;

    setIsGenerating(true);
    try {
      if (isBatch) {
        const blob = await apiService.generateBatchJournalEntryPDF(targetIds, options);
        downloadBlob(blob, `journal-entries-${Date.now()}.pdf`);
        toast({
          title: "PDF Generated",
          description: `Successfully generated PDF for ${targetIds.length} journal entries`
        });
      } else {
        const blob = await apiService.generateJournalEntryPDF(targetIds[0], options);
        downloadBlob(blob, `journal-entry-${targetIds[0]}.pdf`);
        toast({
          title: "PDF Generated",
          description: "Successfully generated PDF for journal entry"
        });
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePreview = async () => {
    if (targetIds.length === 0 || isBatch) return;

    setIsGenerating(true);
    try {
      const html = await apiService.getJournalEntryPreview(targetIds[0], options);
      setPreviewHtml(html);
      setShowPreview(true);
    } catch (error) {
      console.error('Error generating preview:', error);
      toast({
        title: "Error",
        description: "Failed to generate preview. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadBlob = (blob: Blob, filename: string) => {
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

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Generate PDF</span>
            </DialogTitle>
            <DialogDescription>
              {isBatch 
                ? `Generate PDF for ${entryIds.length} selected journal entries`
                : 'Generate PDF for this journal entry'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* PDF Options */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <Settings className="w-4 h-4" />
                <span>PDF Options</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Format Selection */}
                <div className="space-y-2">
                  <Label htmlFor="format">Format</Label>
                  <Select
                    value={options.format}
                    onValueChange={(value: 'detailed' | 'summary') => 
                      setOptions(prev => ({ ...prev, format: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="detailed">Detailed</SelectItem>
                      <SelectItem value="summary">Summary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Include Company Header */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeCompanyHeader"
                    checked={options.includeCompanyHeader}
                    onCheckedChange={(checked) => 
                      setOptions(prev => ({ ...prev, includeCompanyHeader: !!checked }))
                    }
                  />
                  <Label htmlFor="includeCompanyHeader">Include Company Header</Label>
                </div>

                {/* Include Audit Trail */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeAuditTrail"
                    checked={options.includeAuditTrail}
                    onCheckedChange={(checked) => 
                      setOptions(prev => ({ ...prev, includeAuditTrail: !!checked }))
                    }
                  />
                  <Label htmlFor="includeAuditTrail">Include Audit Trail</Label>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              {!isBatch && (
                <Button
                  variant="outline"
                  onClick={handlePreview}
                  disabled={isGenerating}
                  className="flex items-center space-x-2"
                >
                  {isGenerating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                  <span>Preview</span>
                </Button>
              )}

              <Button
                onClick={handleGeneratePDF}
                disabled={isGenerating || targetIds.length === 0}
                className="flex items-center space-x-2 flex-1"
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                <span>
                  {isGenerating 
                    ? 'Generating...' 
                    : isBatch 
                      ? `Generate PDF (${entryIds.length} entries)`
                      : 'Generate PDF'
                  }
                </span>
              </Button>
            </div>

            {/* Format Descriptions */}
            <div className="text-sm text-muted-foreground space-y-2">
              <div>
                <strong>Detailed Format:</strong> Includes all line details, memos, departments, projects, and locations.
              </div>
              <div>
                <strong>Summary Format:</strong> Shows only essential information for a concise view.
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span className="flex items-center space-x-2">
                <Eye className="w-5 h-5" />
                <span>PDF Preview</span>
              </span>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrintPreview}
                  className="flex items-center space-x-1"
                >
                  <FileText className="w-4 h-4" />
                  <span>Print</span>
                </Button>
                <Button
                  size="sm"
                  onClick={handleGeneratePDF}
                  disabled={isGenerating}
                  className="flex items-center space-x-1"
                >
                  {isGenerating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  <span>Download PDF</span>
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="overflow-auto max-h-[70vh] border rounded-lg">
            <iframe
              srcDoc={previewHtml}
              className="w-full h-full min-h-[600px] border-0"
              title="PDF Preview"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Quick PDF Actions Component for Journal Entry Lists
interface QuickPDFActionsProps {
  entryId: string;
  variant?: 'icon' | 'button';
}

export function QuickPDFActions({ entryId, variant = 'icon' }: QuickPDFActionsProps) {
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
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive"
      });
    }
  };

  const downloadBlob = (blob: Blob, filename: string) => {
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
    return (
      <>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowPDFDialog(true)}
          className="flex items-center space-x-1"
        >
          <FileText className="w-4 h-4" />
          <span>PDF</span>
        </Button>
        
        <JournalPDFGeneration
          entryId={entryId}
          isOpen={showPDFDialog}
          onClose={() => setShowPDFDialog(false)}
        />
      </>
    );
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleQuickPDF}
        className="h-8 w-8 p-0"
        title="Generate PDF"
      >
        <FileText className="w-4 h-4" />
      </Button>
    </>
  );
}

// Batch PDF Actions Component
interface BatchPDFActionsProps {
  selectedEntries: string[];
  onClearSelection?: () => void;
}

export function BatchPDFActions({ selectedEntries, onClearSelection }: BatchPDFActionsProps) {
  const [showPDFDialog, setShowPDFDialog] = useState(false);
  const { toast } = useToast();

  if (selectedEntries.length === 0) return null;

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setShowPDFDialog(true)}
        className="flex items-center space-x-2"
      >
        <FileText className="w-4 h-4" />
        <span>Generate PDF ({selectedEntries.length})</span>
      </Button>

      <JournalPDFGeneration
        entryIds={selectedEntries}
        isOpen={showPDFDialog}
        onClose={() => {
          setShowPDFDialog(false);
          onClearSelection?.();
        }}
      />
    </>
  );
}
