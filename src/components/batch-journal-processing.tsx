import React, { useState, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText, 
  CheckSquare, 
  Square, 
  RotateCcw, 
  Upload,
  Download,
  AlertTriangle,
  Info,
  Loader2
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

interface BatchProcessingProps {
  entries: JournalEntry[];
  onRefresh: () => void;
  permissions: {
    canCreate: boolean;
    canApprove: boolean;
    canPost: boolean;
    canReverse: boolean;
  };
}

interface BatchResult {
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

export function BatchJournalProcessing({ entries, onRefresh, permissions }: BatchProcessingProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State
  const [selectedEntries, setSelectedEntries] = useState<string[]>([]);
  const [showBatchDialog, setShowBatchDialog] = useState(false);
  const [batchType, setBatchType] = useState<'approve' | 'post' | 'reverse' | 'create'>('approve');
  const [batchComments, setBatchComments] = useState('');
  const [batchReason, setBatchReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [batchResult, setBatchResult] = useState<BatchResult | null>(null);
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
    mutationFn: (data: { entryIds: string[], comments: string }) => 
      apiService.batchApproveJournalEntries(data),
    onSuccess: (response) => {
      setBatchResult(response.data);
      setShowResults(true);
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
      queryClient.invalidateQueries({ queryKey: ['journal-hub-summary'] });
      toast({ title: "Success", description: response.message });
      onRefresh();
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error?.response?.data?.message || 'Batch approval failed', variant: "destructive" });
    }
  });

  const batchPostMutation = useMutation({
    mutationFn: (data: { entryIds: string[] }) => 
      apiService.batchPostJournalEntries(data),
    onSuccess: (response) => {
      setBatchResult(response.data);
      setShowResults(true);
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
      queryClient.invalidateQueries({ queryKey: ['journal-hub-summary'] });
      toast({ title: "Success", description: response.message });
      onRefresh();
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error?.response?.data?.message || 'Batch posting failed', variant: "destructive" });
    }
  });

  const batchReverseMutation = useMutation({
    mutationFn: (data: { entryIds: string[], reason: string }) => 
      apiService.batchReverseJournalEntries(data),
    onSuccess: (response) => {
      setBatchResult(response.data);
      setShowResults(true);
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
      queryClient.invalidateQueries({ queryKey: ['journal-hub-summary'] });
      toast({ title: "Success", description: response.message });
      onRefresh();
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error?.response?.data?.message || 'Batch reversal failed', variant: "destructive" });
    }
  });

  // Handlers
  const handleSelectAll = () => {
    if (selectedEntries.length === filteredEntries.length) {
      setSelectedEntries([]);
    } else {
      setSelectedEntries(filteredEntries.map(entry => entry.id));
    }
  };

  const handleSelectEntry = (entryId: string) => {
    setSelectedEntries(prev => 
      prev.includes(entryId) 
        ? prev.filter(id => id !== entryId)
        : [...prev, entryId]
    );
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'POSTED': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'DRAFT': return <FileText className="w-4 h-4 text-blue-600" />;
      case 'PENDING_APPROVAL': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'REVERSED': return <RotateCcw className="w-4 h-4 text-red-600" />;
      default: return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      'POSTED': 'default',
      'DRAFT': 'secondary',
      'PENDING_APPROVAL': 'outline',
      'REVERSED': 'destructive'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const isProcessingAny = batchApproveMutation.isPending || batchPostMutation.isPending || batchReverseMutation.isPending;

  return (
    <div className="space-y-4">
      {/* Batch Processing Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="w-5 h-5" />
            <span>Batch Processing</span>
          </CardTitle>
          <CardDescription>
            Process multiple journal entries at once for improved efficiency
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {permissions.canApprove && (
              <Dialog open={showBatchDialog && batchType === 'approve'} onOpenChange={(open) => {
                if (open) setBatchType('approve');
                setShowBatchDialog(open);
              }}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <CheckSquare className="w-4 h-4 mr-2" />
                    Batch Approve ({filteredEntries.filter(e => e.status === 'PENDING_APPROVAL').length})
                  </Button>
                </DialogTrigger>
              </Dialog>
            )}

            {permissions.canPost && (
              <Dialog open={showBatchDialog && batchType === 'post'} onOpenChange={(open) => {
                if (open) setBatchType('post');
                setShowBatchDialog(open);
              }}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Upload className="w-4 h-4 mr-2" />
                    Batch Post ({filteredEntries.filter(e => e.status === 'DRAFT').length})
                  </Button>
                </DialogTrigger>
              </Dialog>
            )}

            {permissions.canReverse && (
              <Dialog open={showBatchDialog && batchType === 'reverse'} onOpenChange={(open) => {
                if (open) setBatchType('reverse');
                setShowBatchDialog(open);
              }}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Batch Reverse ({filteredEntries.filter(e => e.status === 'POSTED').length})
                  </Button>
                </DialogTrigger>
              </Dialog>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Batch Processing Dialog */}
      <Dialog open={showBatchDialog} onOpenChange={setShowBatchDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Batch {batchType.charAt(0).toUpperCase() + batchType.slice(1)} Journal Entries
            </DialogTitle>
            <DialogDescription>
              Select entries to process in batch. {filteredEntries.length} entries available for {batchType}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Selection Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="select-all"
                  checked={selectedEntries.length === filteredEntries.length && filteredEntries.length > 0}
                  onCheckedChange={handleSelectAll}
                />
                <Label htmlFor="select-all">
                  Select All ({selectedEntries.length}/{filteredEntries.length})
                </Label>
              </div>
              <Badge variant="outline">
                {selectedEntries.length} selected
              </Badge>
            </div>

            {/* Entries List */}
            <div className="max-h-60 overflow-y-auto border rounded-lg">
              {filteredEntries.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No entries available for {batchType}
                </div>
              ) : (
                <div className="space-y-1 p-2">
                  {filteredEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className={`flex items-center space-x-3 p-2 rounded hover:bg-gray-50 cursor-pointer ${
                        selectedEntries.includes(entry.id) ? 'bg-blue-50 border border-blue-200' : ''
                      }`}
                      onClick={() => handleSelectEntry(entry.id)}
                    >
                      <Checkbox
                        checked={selectedEntries.includes(entry.id)}
                        onChange={() => handleSelectEntry(entry.id)}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(entry.status)}
                          <span className="font-medium truncate">{entry.reference}</span>
                          {getStatusBadge(entry.status)}
                        </div>
                        <p className="text-sm text-gray-600 truncate">{entry.memo}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>${entry.totalAmount?.toFixed(2) || '0.00'}</span>
                          <span className={entry.isBalanced ? 'text-green-600' : 'text-red-600'}>
                            {entry.isBalanced ? 'Balanced' : 'Unbalanced'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Batch Options */}
            {(batchType === 'approve' || batchType === 'reverse') && (
              <div className="space-y-4">
                {batchType === 'approve' && (
                  <div>
                    <Label htmlFor="batch-comments">Comments (Optional)</Label>
                    <Textarea
                      id="batch-comments"
                      placeholder="Add comments for batch approval..."
                      value={batchComments}
                      onChange={(e) => setBatchComments(e.target.value)}
                      rows={3}
                    />
                  </div>
                )}

                {batchType === 'reverse' && (
                  <div>
                    <Label htmlFor="batch-reason">Reason (Required)</Label>
                    <Textarea
                      id="batch-reason"
                      placeholder="Enter reason for batch reversal..."
                      value={batchReason}
                      onChange={(e) => setBatchReason(e.target.value)}
                      rows={3}
                      required
                    />
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button
                onClick={handleBatchOperation}
                disabled={selectedEntries.length === 0 || isProcessingAny || (batchType === 'reverse' && !batchReason.trim())}
              >
                {isProcessingAny ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    {batchType === 'approve' && <CheckSquare className="w-4 h-4 mr-2" />}
                    {batchType === 'post' && <Upload className="w-4 h-4 mr-2" />}
                    {batchType === 'reverse' && <RotateCcw className="w-4 h-4 mr-2" />}
                    {batchType.charAt(0).toUpperCase() + batchType.slice(1)} {selectedEntries.length} Entries
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Batch Results Dialog */}
      <Dialog open={showResults} onOpenChange={setShowResults}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Batch Processing Results</DialogTitle>
            <DialogDescription>
              Processing completed for {batchResult?.summary.total} entries
            </DialogDescription>
          </DialogHeader>

          {batchResult && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{batchResult.summary.successful}</div>
                  <div className="text-sm text-gray-600">Successful</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{batchResult.summary.failed}</div>
                  <div className="text-sm text-gray-600">Failed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{batchResult.summary.total}</div>
                  <div className="text-sm text-gray-600">Total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{batchResult.summary.processingTime}ms</div>
                  <div className="text-sm text-gray-600">Time</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Success Rate</span>
                  <span>{Math.round((batchResult.summary.successful / batchResult.summary.total) * 100)}%</span>
                </div>
                <Progress 
                  value={(batchResult.summary.successful / batchResult.summary.total) * 100} 
                  className="h-2"
                />
              </div>

              {/* Inventory Information */}
              {batchResult.summary.inventoryMovementsReversed && batchResult.summary.inventoryMovementsReversed > 0 && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Inventory Impact:</strong> {batchResult.summary.inventoryMovementsReversed} inventory movements reversed, 
                    {batchResult.summary.stockRestored} products restored.
                  </AlertDescription>
                </Alert>
              )}

              {/* Errors */}
              {batchResult.errors.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-red-600">Errors ({batchResult.errors.length})</h4>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {batchResult.errors.map((error, index) => (
                      <div key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                        <strong>{error.entryId || error.index}:</strong> {error.error}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Success Details */}
              {batchResult.success.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-green-600">Successful ({batchResult.success.length})</h4>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {batchResult.success.slice(0, 10).map((success, index) => (
                      <div key={index} className="text-sm text-green-600 bg-green-50 p-2 rounded">
                        <strong>{success.reference || success.entryId}:</strong> {success.status || 'Processed'}
                      </div>
                    ))}
                    {batchResult.success.length > 10 && (
                      <div className="text-sm text-gray-500">
                        ... and {batchResult.success.length - 10} more
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
