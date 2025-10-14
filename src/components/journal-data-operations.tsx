import React, { useState, useMemo, useRef } from 'react';
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
  CheckSquare,
  Square,
  RotateCcw,
  Info,
  Loader2,
  Database
} from 'lucide-react';

interface JournalEntry {
  id: string;
  reference: string;
  memo: string;
  status: string;
  totalAmount: number;
  isBalanced: boolean;
  date: string;
}

interface DataOperationsProps {
  companyId: string;
  entries: JournalEntry[];
  currentFilters?: {
    dateFrom?: string;
    dateTo?: string;
    status?: string;
    entryType?: string;
  };
  onRefresh: () => void;
  permissions: {
    canCreate: boolean;
    canApprove: boolean;
    canPost: boolean;
    canReverse: boolean;
  };
}

interface OperationResult {
  success: any[];
  errors: any[];
  summary: {
    total: number;
    successful: number;
    failed: number;
    processingTime: number;
    inventoryMovementsReversed?: number;
    stockRestored?: number;
  };
}

export function JournalDataOperations({ 
  companyId, 
  entries, 
  currentFilters, 
  onRefresh, 
  permissions 
}: DataOperationsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Batch Processing State
  const [selectedEntries, setSelectedEntries] = useState<string[]>([]);
  const [showBatchDialog, setShowBatchDialog] = useState(false);
  const [batchType, setBatchType] = useState<'approve' | 'post' | 'reverse'>('approve');
  const [batchComments, setBatchComments] = useState('');
  const [batchReason, setBatchReason] = useState('');
  
  // Import/Export State
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
  
  // Common State
  const [isProcessing, setIsProcessing] = useState(false);
  const [operationResult, setOperationResult] = useState<OperationResult | null>(null);
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
    mutationFn: (data: { entryIds: string[], comments: string }) => 
      apiService.batchApproveJournalEntries(data),
    onSuccess: (response) => {
      setOperationResult(response.data);
      setShowResults(true);
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
      toast({ title: "Success", description: `Approved ${response.data.summary.successful} entries` });
      onRefresh();
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error?.response?.data?.message || 'Batch approve failed', variant: "destructive" });
    }
  });

  const batchPostMutation = useMutation({
    mutationFn: (data: { entryIds: string[] }) => 
      apiService.batchPostJournalEntries(data),
    onSuccess: (response) => {
      setOperationResult(response.data);
      setShowResults(true);
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
      toast({ title: "Success", description: `Posted ${response.data.summary.successful} entries` });
      onRefresh();
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error?.response?.data?.message || 'Batch post failed', variant: "destructive" });
    }
  });

  const batchReverseMutation = useMutation({
    mutationFn: (data: { entryIds: string[], reason: string }) => 
      apiService.batchReverseJournalEntries(data),
    onSuccess: (response) => {
      setOperationResult(response.data);
      setShowResults(true);
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
      toast({ title: "Success", description: `Reversed ${response.data.summary.successful} entries` });
      onRefresh();
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error?.response?.data?.message || 'Batch reverse failed', variant: "destructive" });
    }
  });

  // Import/Export Mutations
  const importMutation = useMutation({
    mutationFn: (data: { csvData: string, options: any }) => 
      apiService.importJournalEntriesCsv(data),
    onSuccess: (response) => {
      setOperationResult(response.data);
      setShowResults(true);
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
      toast({ title: "Success", description: `Imported ${response.data.summary.successful} entries` });
      onRefresh();
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error?.response?.data?.message || 'Import failed', variant: "destructive" });
    }
  });

  const exportMutation = useMutation({
    mutationFn: (options: any) => 
      apiService.exportJournalEntriesCsv(options),
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
    onError: (error: any) => {
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
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleEntrySelection = (entryId: string) => {
    setSelectedEntries(prev => 
      prev.includes(entryId) 
        ? prev.filter(id => id !== entryId)
        : [...prev, entryId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedEntries.length === filteredEntries.length) {
      setSelectedEntries([]);
    } else {
      setSelectedEntries(filteredEntries.map(e => e.id));
    }
  };

  // Import/Export Handlers
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImportFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
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
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExport = async () => {
    setIsProcessing(true);
    try {
      await exportMutation.mutateAsync(exportOptions);
      setShowExportDialog(false);
    } finally {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          Data Operations
        </CardTitle>
        <CardDescription>
          Batch processing, import, and export journal entries
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="batch" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="batch">Batch Processing</TabsTrigger>
            <TabsTrigger value="import-export">Import/Export</TabsTrigger>
          </TabsList>

          {/* Batch Processing Tab */}
          <TabsContent value="batch" className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              <Dialog open={showBatchDialog} onOpenChange={setShowBatchDialog}>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    onClick={() => setBatchType('approve')}
                    disabled={!permissions.canApprove}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Batch Approve
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {batchType === 'approve' && 'Batch Approve Entries'}
                      {batchType === 'post' && 'Batch Post Entries'}
                      {batchType === 'reverse' && 'Batch Reverse Entries'}
                    </DialogTitle>
                    <DialogDescription>
                      Select entries to process in batch
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    {/* Select All */}
                    <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                      <Checkbox
                        id="select-all"
                        checked={selectedEntries.length === filteredEntries.length && filteredEntries.length > 0}
                        onCheckedChange={toggleSelectAll}
                      />
                      <Label htmlFor="select-all" className="cursor-pointer flex-1">
                        Select All ({filteredEntries.length} entries)
                      </Label>
                      <Badge variant="secondary">
                        {selectedEntries.length} selected
                      </Badge>
                    </div>

                    {/* Entry List */}
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                      {filteredEntries.length === 0 ? (
                        <Alert>
                          <Info className="h-4 w-4" />
                          <AlertDescription>
                            No entries available for {batchType}
                          </AlertDescription>
                        </Alert>
                      ) : (
                        filteredEntries.map(entry => (
                          <div
                            key={entry.id}
                            className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50"
                          >
                            <Checkbox
                              id={entry.id}
                              checked={selectedEntries.includes(entry.id)}
                              onCheckedChange={() => toggleEntrySelection(entry.id)}
                            />
                            <Label htmlFor={entry.id} className="cursor-pointer flex-1">
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-medium">{entry.reference}</div>
                                  <div className="text-sm text-gray-600">{entry.memo}</div>
                                </div>
                                <div className="text-right">
                                  <div className="font-medium">
                                    ${entry.totalAmount?.toFixed(2) || '0.00'}
                                  </div>
                                  <Badge variant={entry.isBalanced ? 'default' : 'destructive'} className="text-xs">
                                    {entry.isBalanced ? 'Balanced' : 'Unbalanced'}
                                  </Badge>
                                </div>
                              </div>
                            </Label>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Comments/Reason */}
                    {batchType === 'approve' && (
                      <div className="space-y-2">
                        <Label htmlFor="batch-comments">Comments (optional)</Label>
                        <Textarea
                          id="batch-comments"
                          value={batchComments}
                          onChange={(e) => setBatchComments(e.target.value)}
                          placeholder="Add comments for approval..."
                          rows={3}
                        />
                      </div>
                    )}

                    {batchType === 'reverse' && (
                      <div className="space-y-2">
                        <Label htmlFor="batch-reason">Reversal Reason *</Label>
                        <Textarea
                          id="batch-reason"
                          value={batchReason}
                          onChange={(e) => setBatchReason(e.target.value)}
                          placeholder="Provide reason for reversal..."
                          rows={3}
                          required
                        />
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-2 pt-4">
                      <Button
                        variant="outline"
                        onClick={() => setShowBatchDialog(false)}
                        disabled={isProcessing}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleBatchProcess}
                        disabled={selectedEntries.length === 0 || isProcessing}
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>Process {selectedEntries.length} Entries</>
                        )}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Button 
                variant="outline" 
                onClick={() => { setBatchType('post'); setShowBatchDialog(true); }}
                disabled={!permissions.canPost}
              >
                <FileText className="w-4 h-4 mr-2" />
                Batch Post
              </Button>

              <Button 
                variant="outline" 
                onClick={() => { setBatchType('reverse'); setShowBatchDialog(true); }}
                disabled={!permissions.canReverse}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Batch Reverse
              </Button>
            </div>
          </TabsContent>

          {/* Import/Export Tab */}
          <TabsContent value="import-export" className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              {/* Import Dialog */}
              <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Upload className="w-4 h-4 mr-2" />
                    Import Entries
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Import Journal Entries</DialogTitle>
                    <DialogDescription>
                      Upload a CSV file to import multiple journal entries
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    {/* File Upload */}
                    <div className="space-y-2">
                      <Label htmlFor="import-file">CSV File</Label>
                      <Input
                        id="import-file"
                        type="file"
                        accept=".csv"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                      />
                      {importFile && (
                        <div className="text-sm text-gray-600">
                          Selected: {importFile.name} ({(importFile.size / 1024).toFixed(2)} KB)
                        </div>
                      )}
                    </div>

                    {/* Options */}
                    <div className="space-y-3">
                      <Label>Import Options</Label>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="validate-balances"
                            checked={importOptions.validateBalances}
                            onCheckedChange={(checked) => 
                              setImportOptions(prev => ({ ...prev, validateBalances: checked as boolean }))
                            }
                          />
                          <Label htmlFor="validate-balances" className="text-sm">
                            Validate entry balances
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="create-draft"
                            checked={importOptions.createAsDraft}
                            onCheckedChange={(checked) => 
                              setImportOptions(prev => ({ ...prev, createAsDraft: checked as boolean }))
                            }
                          />
                          <Label htmlFor="create-draft" className="text-sm">
                            Create entries as drafts
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="skip-header"
                            checked={importOptions.skipHeaderRow}
                            onCheckedChange={(checked) => 
                              setImportOptions(prev => ({ ...prev, skipHeaderRow: checked as boolean }))
                            }
                          />
                          <Label htmlFor="skip-header" className="text-sm">
                            Skip header row
                          </Label>
                        </div>
                      </div>
                    </div>

                    {/* Template */}
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription className="flex items-center justify-between">
                        <span>Need a template?</span>
                        <Button variant="link" size="sm" onClick={downloadTemplate}>
                          Download CSV Template
                        </Button>
                      </AlertDescription>
                    </Alert>

                    {/* Actions */}
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setShowImportDialog(false)}
                        disabled={isProcessing}
                      >
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
                          <>Import Entries</>
                        )}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Export Dialog */}
              <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export Entries
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Export Journal Entries</DialogTitle>
                    <DialogDescription>
                      Configure export options and download entries
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Export Format</Label>
                      <Select
                        value={exportOptions.format}
                        onValueChange={(value) => 
                          setExportOptions(prev => ({ ...prev, format: value as 'detailed' | 'summary' }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="detailed">Detailed (with all fields)</SelectItem>
                          <SelectItem value="summary">Summary (essential fields only)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>File Format</Label>
                      <Select
                        value={exportOptions.fileFormat}
                        onValueChange={(value) => 
                          setExportOptions(prev => ({ ...prev, fileFormat: value as 'csv' | 'excel' }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="csv">CSV (.csv)</SelectItem>
                          <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        Export will use current filters: {currentFilters?.status || 'all statuses'}, 
                        {currentFilters?.dateFrom && currentFilters?.dateTo 
                          ? ` ${currentFilters.dateFrom} to ${currentFilters.dateTo}`
                          : ' all dates'}
                      </AlertDescription>
                    </Alert>

                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setShowExportDialog(false)}
                        disabled={isProcessing}
                      >
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
                          <>Export</>
                        )}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </TabsContent>
        </Tabs>

        {/* Results Dialog */}
        {showResults && operationResult && (
          <Dialog open={showResults} onOpenChange={setShowResults}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Operation Results</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {operationResult.summary.total}
                    </div>
                    <div className="text-sm text-gray-600">Total</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {operationResult.summary.successful}
                    </div>
                    <div className="text-sm text-gray-600">Successful</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {operationResult.summary.failed}
                    </div>
                    <div className="text-sm text-gray-600">Failed</div>
                  </div>
                </div>

                {operationResult.errors.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-red-600">Errors:</h4>
                    <div className="max-h-40 overflow-y-auto space-y-1">
                      {operationResult.errors.map((error, idx) => (
                        <Alert key={idx} variant="destructive">
                          <XCircle className="h-4 w-4" />
                          <AlertDescription>{error?.message || error?.toString() || 'Unknown error'}</AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <Button onClick={() => setShowResults(false)}>Close</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
}
