import React, { useState, useRef } from 'react';
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
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Download, 
  Upload, 
  FileText, 
  FileSpreadsheet, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Info,
  Loader2,
  Calendar,
  Filter,
  Settings
} from 'lucide-react';

interface ImportExportProps {
  companyId: string;
  currentFilters?: {
    dateFrom?: string;
    dateTo?: string;
    status?: string;
    entryType?: string;
  };
  onRefresh: () => void;
}

interface ImportResult {
  success: any[];
  errors: any[];
  summary: {
    total: number;
    successful: number;
    failed: number;
    processingTime: number;
  };
}

export function JournalImportExport({ companyId, currentFilters, onRefresh }: ImportExportProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState('');
  const [importOptions, setImportOptions] = useState({
    validateBalances: true,
    createAsDraft: true,
    skipHeaderRow: true,
    dateFormat: 'YYYY-MM-DD'
  });
  const [exportOptions, setExportOptions] = useState({
    format: 'detailed' as 'detailed' | 'summary',
    fileFormat: 'csv' as 'csv' | 'excel',
    dateFrom: currentFilters?.dateFrom || '',
    dateTo: currentFilters?.dateTo || '',
    status: currentFilters?.status || 'all',
    entryType: currentFilters?.entryType || 'all'
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [showResults, setShowResults] = useState(false);

  // Import mutation
  const importMutation = useMutation({
    mutationFn: (data: { csvData: string, options: any }) => 
      apiService.importJournalEntriesCsv(data),
    onSuccess: (response) => {
      setImportResult(response.data);
      setShowResults(true);
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
      queryClient.invalidateQueries({ queryKey: ['journal-hub-summary'] });
      toast({ title: "Success", description: response.message });
      onRefresh();
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error?.response?.data?.message || 'Import failed', variant: "destructive" });
    }
  });

  // Handlers
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImportFile(file);
      
      // Read file content
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
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

      let blob: Blob;
      let filename: string;

      if (exportOptions.fileFormat === 'csv') {
        blob = await apiService.exportJournalEntriesCsv(params);
        filename = `journal-entries-${new Date().toISOString().split('T')[0]}.csv`;
      } else {
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
    } catch (error: any) {
      toast({ title: "Error", description: error.message || 'Export failed', variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadTemplate = async (format: 'csv' | 'excel') => {
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
    } catch (error: any) {
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

  return (
    <div className="space-y-4">
      {/* Import/Export Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Import & Export</span>
          </CardTitle>
          <CardDescription>
            Import journal entries from CSV/Excel or export existing entries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  Import CSV/Excel
                </Button>
              </DialogTrigger>
            </Dialog>

            <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </Button>
              </DialogTrigger>
            </Dialog>

            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleDownloadTemplate('csv')}
            >
              <FileText className="w-4 h-4 mr-2" />
              CSV Template
            </Button>

            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleDownloadTemplate('excel')}
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Excel Template
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Import Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Import Journal Entries</DialogTitle>
            <DialogDescription>
              Upload a CSV or Excel file to import journal entries
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* File Upload */}
            <div>
              <Label htmlFor="import-file">Select File</Label>
              <Input
                id="import-file"
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileSelect}
                ref={fileInputRef}
                className="mt-1"
              />
              {importFile && (
                <div className="mt-2 text-sm text-gray-600">
                  Selected: {importFile.name} ({(importFile.size / 1024).toFixed(1)} KB)
                </div>
              )}
            </div>

            {/* Import Options */}
            <div className="space-y-4">
              <h4 className="font-medium">Import Options</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="validate-balances"
                    checked={importOptions.validateBalances}
                    onCheckedChange={(checked) => 
                      setImportOptions(prev => ({ ...prev, validateBalances: !!checked }))
                    }
                  />
                  <Label htmlFor="validate-balances">Validate Balances</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="create-as-draft"
                    checked={importOptions.createAsDraft}
                    onCheckedChange={(checked) => 
                      setImportOptions(prev => ({ ...prev, createAsDraft: !!checked }))
                    }
                  />
                  <Label htmlFor="create-as-draft">Create as Draft</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="skip-header"
                    checked={importOptions.skipHeaderRow}
                    onCheckedChange={(checked) => 
                      setImportOptions(prev => ({ ...prev, skipHeaderRow: !!checked }))
                    }
                  />
                  <Label htmlFor="skip-header">Skip Header Row</Label>
                </div>
              </div>

              <div>
                <Label htmlFor="date-format">Date Format</Label>
                <Select
                  value={importOptions.dateFormat}
                  onValueChange={(value) => 
                    setImportOptions(prev => ({ ...prev, dateFormat: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                    <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* CSV Preview */}
            {csvData && (
              <div>
                <Label>File Preview (first 5 lines)</Label>
                <Textarea
                  value={csvData.split('\n').slice(0, 5).join('\n')}
                  readOnly
                  rows={5}
                  className="mt-1 font-mono text-xs"
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={handleCloseImportDialog}>
                Cancel
              </Button>
              <Button
                onClick={handleImport}
                disabled={!csvData || isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Import Entries
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Export Journal Entries</DialogTitle>
            <DialogDescription>
              Export journal entries to CSV or Excel format
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Tabs defaultValue="format" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="format">Format Options</TabsTrigger>
                <TabsTrigger value="filters">Filters</TabsTrigger>
              </TabsList>

              <TabsContent value="format" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="export-format">Data Format</Label>
                    <Select
                      value={exportOptions.format}
                      onValueChange={(value: 'detailed' | 'summary') => 
                        setExportOptions(prev => ({ ...prev, format: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="detailed">Detailed (All Lines)</SelectItem>
                        <SelectItem value="summary">Summary (Entry Totals)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="file-format">File Format</Label>
                    <Select
                      value={exportOptions.fileFormat}
                      onValueChange={(value: 'csv' | 'excel') => 
                        setExportOptions(prev => ({ ...prev, fileFormat: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="csv">CSV</SelectItem>
                        <SelectItem value="excel">Excel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="filters" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date-from">Date From</Label>
                    <Input
                      id="date-from"
                      type="date"
                      value={exportOptions.dateFrom}
                      onChange={(e) => setExportOptions(prev => ({ ...prev, dateFrom: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="date-to">Date To</Label>
                    <Input
                      id="date-to"
                      type="date"
                      value={exportOptions.dateTo}
                      onChange={(e) => setExportOptions(prev => ({ ...prev, dateTo: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="status-filter">Status</Label>
                    <Select
                      value={exportOptions.status}
                      onValueChange={(value) => setExportOptions(prev => ({ ...prev, status: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="DRAFT">Draft</SelectItem>
                        <SelectItem value="POSTED">Posted</SelectItem>
                        <SelectItem value="REVERSED">Reversed</SelectItem>
                        <SelectItem value="PENDING_APPROVAL">Pending Approval</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="entry-type-filter">Entry Type</Label>
                    <Select
                      value={exportOptions.entryType}
                      onValueChange={(value) => setExportOptions(prev => ({ ...prev, entryType: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="sales">Sales</SelectItem>
                        <SelectItem value="expense">Expense</SelectItem>
                        <SelectItem value="adjustment">Adjustment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={handleCloseExportDialog}>
                Cancel
              </Button>
              <Button
                onClick={handleExport}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Export Data
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Import Results Dialog */}
      <Dialog open={showResults} onOpenChange={setShowResults}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Import Results</DialogTitle>
            <DialogDescription>
              Import processing completed
            </DialogDescription>
          </DialogHeader>

          {importResult && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{importResult.summary.successful}</div>
                  <div className="text-sm text-gray-600">Successful</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{importResult.summary.failed}</div>
                  <div className="text-sm text-gray-600">Failed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{importResult.summary.total}</div>
                  <div className="text-sm text-gray-600">Total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{importResult.summary.processingTime}ms</div>
                  <div className="text-sm text-gray-600">Time</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Success Rate</span>
                  <span>{Math.round((importResult.summary.successful / importResult.summary.total) * 100)}%</span>
                </div>
                <Progress 
                  value={(importResult.summary.successful / importResult.summary.total) * 100} 
                  className="h-2"
                />
              </div>

              {/* Errors */}
              {importResult.errors.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-red-600">Errors ({importResult.errors.length})</h4>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {importResult.errors.slice(0, 10).map((error, index) => (
                      <div key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                        <strong>Row {error.index + 1}:</strong> {error.error}
                      </div>
                    ))}
                    {importResult.errors.length > 10 && (
                      <div className="text-sm text-gray-500">
                        ... and {importResult.errors.length - 10} more errors
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Success Details */}
              {importResult.success.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-green-600">Successful ({importResult.success.length})</h4>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {importResult.success.slice(0, 10).map((success, index) => (
                      <div key={index} className="text-sm text-green-600 bg-green-50 p-2 rounded">
                        <strong>{success.reference}:</strong> ${success.totalDebit} DR / ${success.totalCredit} CR
                      </div>
                    ))}
                    {importResult.success.length > 10 && (
                      <div className="text-sm text-gray-500">
                        ... and {importResult.success.length - 10} more entries
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <Button onClick={() => setShowResults(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
