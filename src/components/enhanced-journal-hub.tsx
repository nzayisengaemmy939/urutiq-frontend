import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { 
  BookOpen, Search, Plus, Filter, Calendar, DollarSign, 
  CheckCircle, Clock, AlertCircle, XCircle, FileText, 
  Settings, Users, TrendingUp, BarChart3, Download,
  Eye, Edit, Trash2, Copy, Zap, RefreshCw, Lock, Unlock,
  ChevronDown, ChevronRight, MoreHorizontal, Star, Bookmark,
  RotateCcw, AlertTriangle, Shield, Activity, Target,
  ArrowLeftRight, Calculator, History, Settings2
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import apiService from '../lib/api';
import { useAuth } from '../contexts/auth-context';
import { getCompanyId } from '../lib/config';
import { UnifiedJournalWorkflow } from './unified-journal-workflow';
import { JournalDataOperations } from './journal-data-operations';
import { AdvancedJournalSearch } from './advanced-journal-search';
import { EmailNotificationSettings } from './email-notification-settings';
import { JournalPDFGeneration, QuickPDFActions, BatchPDFActions } from './journal-pdf-generation';

// Types
interface JournalEntry {
  id: string;
  date: string;
  memo?: string;
  reference?: string;
  status: 'DRAFT' | 'POSTED' | 'REVERSED' | 'PENDING_APPROVAL';
  entryType?: {
    id: string;
    name: string;
    category: string;
  };
  lines: JournalLine[];
  createdBy?: {
    id: string;
    name: string;
    email: string;
  };
  approvals?: JournalEntryApproval[];
  totalDebit?: number;
  totalCredit?: number;
  totalAmount?: number;
  isBalanced?: boolean;
  createdAt: string;
}

interface JournalLine {
  id: string;
  accountId: string;
  account?: {
    id: string;
    code: string;
    name: string;
  };
  debit: number;
  credit: number;
  memo?: string;
  department?: string;
  project?: string;
  location?: string;
}

interface JournalEntryApproval {
  id: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestedBy: {
    id: string;
    name: string;
  };
  approver?: {
    id: string;
    name: string;
  };
  requestedAt: string;
  approvedAt?: string;
  comments?: string;
}

interface JournalMetrics {
  totalEntries: number;
  postedEntries: number;
  draftEntries: number;
  pendingApprovals: number;
  unbalancedCount: number;
  successRate: number;
  avgProcessingTime: number;
  errorRate: number;
}

interface UserPermissions {
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canPost: boolean;
  canReverse: boolean;
  canApprove: boolean;
  canViewAll: boolean;
  maxApprovalAmount: number;
}

export function EnhancedJournalHub({ companyId }: { companyId: string }) {
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();
  const queryClient = useQueryClient();
  
  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [entryTypeFilter, setEntryTypeFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<{from?: string, to?: string}>({});
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [showWorkflow, setShowWorkflow] = useState(false);
  const [workflowMode, setWorkflowMode] = useState<'create' | 'edit' | 'duplicate'>('create');
  const [selectedEntryForWorkflow, setSelectedEntryForWorkflow] = useState<JournalEntry | null>(null);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [searchResults, setSearchResults] = useState<any>(null);
  const [showPDFDialog, setShowPDFDialog] = useState(false);
  const [selectedEntryForPDF, setSelectedEntryForPDF] = useState<string | null>(null);
  const [selectedEntriesForBatchPDF, setSelectedEntriesForBatchPDF] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Reset pagination when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, entryTypeFilter, dateRange]);
  const [activeTab, setActiveTab] = useState("entries");
  const [showReversalDialog, setShowReversalDialog] = useState(false);
  const [showAdjustmentDialog, setShowAdjustmentDialog] = useState(false);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [showMetricsDialog, setShowMetricsDialog] = useState(false);
  const [reversalData, setReversalData] = useState({ reason: '', reverseDate: '' });
  const [adjustmentData, setAdjustmentData] = useState<{ adjustments: any[], reason: string }>({ adjustments: [], reason: '' });
  const [approvalData, setApprovalData] = useState<{ approvers: string[], comments: string }>({ approvers: [], comments: '' });

  // Fetch data with error handling and fallback
  const { data: entriesResponse, isLoading: entriesLoading, error: entriesError } = useQuery({
    queryKey: ['journal-entries', companyId, searchTerm, statusFilter, entryTypeFilter, dateRange, currentPage, pageSize],
    queryFn: () => apiService.getJournalEntries({
      reference: searchTerm || undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      entryType: entryTypeFilter !== 'all' ? entryTypeFilter : undefined,
      dateFrom: dateRange.from,
      dateTo: dateRange.to,
      page: currentPage,
      pageSize: pageSize
    }),
    enabled: !!companyId && isAuthenticated,
    retry: false, // Don't retry on 400 errors
    staleTime: 0 // Always fetch fresh data
  });

  const { data: summaryResponse, isLoading: summaryLoading } = useQuery({
    queryKey: ['journal-hub-summary', companyId],
    queryFn: () => apiService.getJournalSummary({ companyId }),
    enabled: !!companyId && isAuthenticated
  });

  const { data: entryTypesResponse, isLoading: entryTypesLoading } = useQuery({
    queryKey: ['journal-entry-types', companyId],
    queryFn: () => apiService.getJournalEntryTypes({ companyId }),
    enabled: !!companyId && isAuthenticated
  });

  const { data: approvalsResponse, isLoading: approvalsLoading } = useQuery({
    queryKey: ['journal-pending-approvals', companyId],
    queryFn: () => apiService.getPendingApprovals(),
    enabled: !!companyId && isAuthenticated
  });

  const { data: metricsResponse, isLoading: metricsLoading } = useQuery({
    queryKey: ['journal-metrics', companyId],
    queryFn: () => apiService.getJournalMetrics({ companyId }),
    enabled: !!companyId && isAuthenticated
  });

  const { data: permissionsResponse, isLoading: permissionsLoading } = useQuery({
    queryKey: ['journal-permissions', user?.id, companyId],
    queryFn: () => apiService.getJournalPermissions(user?.id || '', companyId),
    enabled: !!user?.id && !!companyId && isAuthenticated
  });

  // Mutations
  const reverseEntryMutation = useMutation({
    mutationFn: ({ entryId, data }: { entryId: string, data: any }) => 
      apiService.reverseJournalEntry(entryId, data),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
      queryClient.invalidateQueries({ queryKey: ['journal-hub-summary'] });
      
      // Enhanced success message with inventory information
      const inventoryInfo = data?.data?.inventoryMovementsReversed > 0 
        ? ` and ${data.data.inventoryMovementsReversed} inventory movements reversed (${data.data.stockRestored} products restored)`
        : '';
      
      toast({ 
        title: "Success", 
        description: `Journal entry reversed successfully${inventoryInfo}` 
      });
      setShowReversalDialog(false);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error?.response?.data?.error || 'Failed to reverse entry', variant: "destructive" });
    }
  });

  const adjustEntryMutation = useMutation({
    mutationFn: ({ entryId, data }: { entryId: string, data: any }) => 
      apiService.adjustJournalEntry(entryId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
      queryClient.invalidateQueries({ queryKey: ['journal-hub-summary'] });
      toast({ title: "Success", description: "Adjustment entry created successfully" });
      setShowAdjustmentDialog(false);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error?.response?.data?.error || 'Failed to create adjustment', variant: "destructive" });
    }
  });

  const requestApprovalMutation = useMutation({
    mutationFn: ({ entryId, data }: { entryId: string, data: any }) => 
      apiService.requestJournalApproval(entryId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
      queryClient.invalidateQueries({ queryKey: ['journal-pending-approvals'] });
      toast({ title: "Success", description: "Approval request sent successfully" });
      setShowApprovalDialog(false);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error?.response?.data?.error || 'Failed to request approval', variant: "destructive" });
    }
  });

  // Handlers
  const handleWorkflowSuccess = (entry: any) => {
    setShowWorkflow(false);
    setSelectedEntryForWorkflow(null);
    queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
    queryClient.invalidateQueries({ queryKey: ['journal-hub-summary'] });
    toast({ title: "Success", description: "Journal entry created successfully" });
  };

  const handleWorkflowCancel = () => {
    setShowWorkflow(false);
    setSelectedEntryForWorkflow(null);
  };

  const handleEditEntry = (entry: JournalEntry) => {
    setWorkflowMode('edit');
    setSelectedEntryForWorkflow(entry);
    setShowWorkflow(true);
  };

  const handleDuplicateEntry = (entry: JournalEntry) => {
    setWorkflowMode('duplicate');
    setSelectedEntryForWorkflow(entry);
    setShowWorkflow(true);
  };

  const handleReverseEntry = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setReversalData({ reason: '', reverseDate: '' });
    setShowReversalDialog(true);
  };

  const handleAdjustEntry = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setAdjustmentData({ adjustments: [], reason: '' });
    setShowAdjustmentDialog(true);
  };

  const handleRequestApproval = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setApprovalData({ approvers: [], comments: '' });
    setShowApprovalDialog(true);
  };

  const handleSubmitReversal = () => {
    if (!selectedEntry || !reversalData.reason) return;
    reverseEntryMutation.mutate({
      entryId: selectedEntry.id,
      data: reversalData
    });
  };

  const handleSubmitAdjustment = () => {
    if (!selectedEntry || !adjustmentData.reason || adjustmentData.adjustments.length === 0) return;
    adjustEntryMutation.mutate({
      entryId: selectedEntry.id,
      data: adjustmentData
    });
  };

  const handleSubmitApproval = () => {
    if (!selectedEntry || approvalData.approvers.length === 0) return;
    requestApprovalMutation.mutate({
      entryId: selectedEntry.id,
      data: approvalData
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'DRAFT': { color: 'bg-gray-100 text-gray-800', icon: FileText },
      'POSTED': { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      'REVERSED': { color: 'bg-red-100 text-red-800', icon: RotateCcw },
      'PENDING_APPROVAL': { color: 'bg-yellow-100 text-yellow-800', icon: Clock }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['DRAFT'];
    const Icon = config.icon;
    
    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const entries = entriesResponse?.entries || [];
  const pagination = entriesResponse?.pagination || { total: 0, page: 1, pageSize: 10, totalPages: 0 };
  const summary = summaryResponse?.summary || {};
  const entryTypes = entryTypesResponse?.entryTypes || [];
  const pendingApprovals = approvalsResponse?.pendingApprovals || [];
  const metrics = metricsResponse?.metrics || {};
  const permissions = permissionsResponse?.permissions || {};

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-[1600px]">
      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Journal Entry Hub</h1>
          <p className="text-gray-600">Complete journal entry lifecycle management</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => setShowMetricsDialog(true)}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Metrics</span>
          </Button>
          <Button
            onClick={() => {
              setActiveTab('entries');
              setWorkflowMode('create');
              setSelectedEntryForWorkflow(null);
              setShowWorkflow(true);
            }}
            className="flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Entry</span>
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Entries</p>
                <p className="text-2xl font-bold text-gray-900">{summary.totalEntries || 0}</p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Posted Today</p>
                <p className="text-2xl font-bold text-green-600">{summary.postedToday || 0}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Approval</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingApprovals.length}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-blue-600">{metrics.successRate?.toFixed(1) || 0}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="entries">Entries</TabsTrigger>
          <TabsTrigger value="approvals">Approvals</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="metrics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Entries Tab */}
        <TabsContent value="entries" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-[200px]">
                  <Input
                    placeholder="Search entries..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="POSTED">Posted</SelectItem>
                    <SelectItem value="REVERSED">Reversed</SelectItem>
                    <SelectItem value="PENDING_APPROVAL">Pending Approval</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={entryTypeFilter} onValueChange={setEntryTypeFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Entry Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {entryTypes.map((type: any) => (
                      <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={() => {
                  setWorkflowMode('create');
                  setSelectedEntryForWorkflow(null);
                  setShowWorkflow(true);
                }} className="flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>New Entry</span>
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowAdvancedSearch(true)}
                  className="flex items-center space-x-2"
                >
                  <Search className="w-4 h-4" />
                  <span>Advanced Search</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Unified Data Operations (Batch Processing + Import/Export) */}
          <JournalDataOperations 
            companyId={companyId}
            entries={entries}
            currentFilters={{
              dateFrom: dateRange.from,
              dateTo: dateRange.to,
              status: statusFilter !== 'all' ? statusFilter : undefined,
              entryType: entryTypeFilter !== 'all' ? entryTypeFilter : undefined
            }}
            onRefresh={() => {
              queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
              queryClient.invalidateQueries({ queryKey: ['journal-hub-summary'] });
            }}
            permissions={permissions}
          />

          {/* Batch PDF Actions */}
          <BatchPDFActions 
            selectedEntries={selectedEntriesForBatchPDF}
            onClearSelection={() => setSelectedEntriesForBatchPDF([])}
          />

          {/* Entries List */}
          <div className="space-y-4">
            {entriesLoading ? (
              <div className="text-center py-8">Loading entries...</div>
            ) : entries.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No journal entries found</div>
            ) : (
              entries.map((entry: JournalEntry) => (
                <Card key={entry.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        {getStatusBadge(entry.status)}
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium text-gray-900">{entry.reference}</h3>
                            {(entry.reference?.startsWith('INV-') || entry.reference?.startsWith('POS-')) && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                📦 Inventory
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{entry.memo}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="text-right">
                          <div className="font-medium text-gray-900">
                            {formatCurrency(entry.totalAmount || 0)}
                          </div>
                          <div className="text-xs text-slate-500">
                            {entry.isBalanced ? 'Balanced' : 'Unbalanced'}
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          {permissions.canEdit && entry.status === 'DRAFT' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditEntry(entry)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          )}
                          {permissions.canReverse && entry.status === 'POSTED' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReverseEntry(entry)}
                            >
                              <RotateCcw className="w-4 h-4" />
                            </Button>
                          )}
                          {permissions.canApprove && entry.status === 'DRAFT' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRequestApproval(entry)}
                            >
                              <Shield className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDuplicateEntry(entry)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <QuickPDFActions entryId={entry.id} variant="icon" />
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Date:</span>
                        <div className="font-medium">{new Date(entry.date).toLocaleDateString()}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Type:</span>
                        <div className="font-medium">{entry.entryType?.name || 'N/A'}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Debit:</span>
                        <div className="font-medium">{formatCurrency(entry.totalDebit || 0)}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Credit:</span>
                        <div className="font-medium">{formatCurrency(entry.totalCredit || 0)}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Pagination Controls */}
          {entries.length > 0 && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 px-4 py-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">
                  Showing {((pagination.page - 1) * pagination.pageSize) + 1} to {Math.min(pagination.page * pagination.pageSize, pagination.total)} of {pagination.total} entries
                </span>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="pageSize" className="text-sm">Show:</Label>
                  <Select
                    value={pageSize.toString()}
                    onValueChange={(value) => {
                      setPageSize(Number(value));
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                >
                  First
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const startPage = Math.max(1, currentPage - 2);
                    const pageNum = startPage + i;
                    if (pageNum > pagination.totalPages) return null;
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === currentPage ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === pagination.totalPages}
                >
                  Next
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(pagination.totalPages)}
                  disabled={currentPage === pagination.totalPages}
                >
                  Last
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Approvals Tab */}
        <TabsContent value="approvals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Pending Approvals</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {approvalsLoading ? (
                <div className="text-center py-8">Loading approvals...</div>
              ) : pendingApprovals.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No pending approvals</div>
              ) : (
                <div className="space-y-4">
                  {pendingApprovals.map((approval: any) => (
                    <div key={approval.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{approval.entry?.reference}</h4>
                        <p className="text-sm text-gray-600">{approval.entry?.memo}</p>
                        <p className="text-xs text-gray-500">
                          Requested by {approval.requestedBy?.name} • {new Date(approval.requestedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button size="sm" variant="outline">
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Journal Templates</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                Template management coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="metrics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Success Rate:</span>
                    <span className="font-medium">{metrics.successRate?.toFixed(1) || 0}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg Processing Time:</span>
                    <span className="font-medium">{metrics.avgProcessingTime || 0}s</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Error Rate:</span>
                    <span className="font-medium text-red-600">{metrics.errorRate?.toFixed(1) || 0}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Unbalanced Entries:</span>
                    <span className="font-medium text-orange-600">{metrics.unbalancedCount || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Entry Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Entries:</span>
                    <span className="font-medium">{metrics.totalEntries || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Posted Entries:</span>
                    <span className="font-medium text-green-600">{metrics.postedEntries || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Draft Entries:</span>
                    <span className="font-medium text-gray-600">{metrics.draftEntries || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pending Approvals:</span>
                    <span className="font-medium text-yellow-600">{metrics.pendingApprovals || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings2 className="w-5 h-5" />
                <span>User Permissions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {permissionsLoading ? (
                <div className="text-center py-8">Loading permissions...</div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" checked={permissions.canCreate} disabled />
                    <span>Create</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" checked={permissions.canEdit} disabled />
                    <span>Edit</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" checked={permissions.canDelete} disabled />
                    <span>Delete</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" checked={permissions.canPost} disabled />
                    <span>Post</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" checked={permissions.canReverse} disabled />
                    <span>Reverse</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" checked={permissions.canApprove} disabled />
                    <span>Approve</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" checked={permissions.canViewAll} disabled />
                    <span>View All</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>Max Approval Amount:</span>
                    <span className="font-medium">{formatCurrency(permissions.maxApprovalAmount || 0)}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <EmailNotificationSettings companyId={companyId} />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      {showWorkflow && (
        <Dialog open={showWorkflow} onOpenChange={setShowWorkflow}>
          <DialogContent className="!max-w-7xl max-h-[95vh] overflow-y-auto w-[95vw] md:max-h-[90vh] md:w-[90vw]">
            <DialogHeader>
              <DialogTitle>
                {workflowMode === 'create' ? 'Create New Journal Entry' : 
                 workflowMode === 'edit' ? 'Edit Journal Entry' : 'Duplicate Journal Entry'}
              </DialogTitle>
            </DialogHeader>
            <UnifiedJournalWorkflow
              companyId={companyId}
              onSuccess={handleWorkflowSuccess}
              onCancel={handleWorkflowCancel}
              initialData={selectedEntryForWorkflow}
              mode={workflowMode}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Reversal Dialog */}
      <Dialog open={showReversalDialog} onOpenChange={setShowReversalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reverse Journal Entry</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reason">Reason for Reversal *</Label>
              <Textarea
                id="reason"
                value={reversalData.reason}
                onChange={(e) => setReversalData({ ...reversalData, reason: e.target.value })}
                placeholder="Enter reason for reversing this entry..."
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="reverseDate">Reverse Date</Label>
              <Input
                id="reverseDate"
                type="date"
                value={reversalData.reverseDate}
                onChange={(e) => setReversalData({ ...reversalData, reverseDate: e.target.value })}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowReversalDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSubmitReversal}
                disabled={!reversalData.reason || reverseEntryMutation.isPending}
              >
                {reverseEntryMutation.isPending ? 'Reversing...' : 'Reverse Entry'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Adjustment Dialog */}
      <Dialog open={showAdjustmentDialog} onOpenChange={setShowAdjustmentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Adjustment Entry</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="adjustmentReason">Reason for Adjustment *</Label>
              <Textarea
                id="adjustmentReason"
                value={adjustmentData.reason}
                onChange={(e) => setAdjustmentData({ ...adjustmentData, reason: e.target.value })}
                placeholder="Enter reason for adjustment..."
                rows={3}
              />
            </div>
            <div className="text-sm text-gray-500">
              Adjustment entries will be created to correct the original entry.
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowAdjustmentDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSubmitAdjustment}
                disabled={!adjustmentData.reason || adjustEntryMutation.isPending}
              >
                {adjustEntryMutation.isPending ? 'Creating...' : 'Create Adjustment'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Approval Request Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Approval</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="approvers">Approvers *</Label>
              <Input
                id="approvers"
                value={approvalData.approvers.join(', ')}
                onChange={(e) => setApprovalData({ ...approvalData, approvers: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                placeholder="Enter approver IDs separated by commas..."
              />
            </div>
            <div>
              <Label htmlFor="approvalComments">Comments</Label>
              <Textarea
                id="approvalComments"
                value={approvalData.comments}
                onChange={(e) => setApprovalData({ ...approvalData, comments: e.target.value })}
                placeholder="Optional comments for approvers..."
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowApprovalDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSubmitApproval}
                disabled={approvalData.approvers.length === 0 || requestApprovalMutation.isPending}
              >
                {requestApprovalMutation.isPending ? 'Sending...' : 'Request Approval'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Metrics Dialog */}
      <Dialog open={showMetricsDialog} onOpenChange={setShowMetricsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Performance Metrics</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {metricsLoading ? (
              <div className="text-center py-8">Loading metrics...</div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Processing Metrics</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Success Rate:</span>
                      <span className="font-medium">{metrics.successRate?.toFixed(1) || 0}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg Processing Time:</span>
                      <span className="font-medium">{metrics.avgProcessingTime || 0}s</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Error Rate:</span>
                      <span className="font-medium text-red-600">{metrics.errorRate?.toFixed(1) || 0}%</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Entry Statistics</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Total Entries:</span>
                      <span className="font-medium">{metrics.totalEntries || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Posted:</span>
                      <span className="font-medium text-green-600">{metrics.postedEntries || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Drafts:</span>
                      <span className="font-medium text-gray-600">{metrics.draftEntries || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Unbalanced:</span>
                      <span className="font-medium text-orange-600">{metrics.unbalancedCount || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Advanced Search Dialog */}
      <Dialog open={showAdvancedSearch} onOpenChange={setShowAdvancedSearch}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Advanced Search</DialogTitle>
            <DialogDescription>
              Use multiple filters to find specific journal entries
            </DialogDescription>
          </DialogHeader>
          <AdvancedJournalSearch
            companyId={companyId}
            onSearchResults={(results) => {
              setSearchResults(results);
              setShowAdvancedSearch(false);
              toast({ 
                title: "Search Complete", 
                description: `Found ${results.entries.length} entries matching your criteria` 
              });
            }}
            onClose={() => setShowAdvancedSearch(false)}
          />
        </DialogContent>
      </Dialog>

      {/* PDF Generation Dialog */}
      <JournalPDFGeneration
        entryId={selectedEntryForPDF || undefined}
        entryIds={selectedEntriesForBatchPDF.length > 0 ? selectedEntriesForBatchPDF : undefined}
        isOpen={showPDFDialog}
        onClose={() => {
          setShowPDFDialog(false);
          setSelectedEntryForPDF(null);
          setSelectedEntriesForBatchPDF([]);
        }}
      />
      </div>
    </div>
  );
}
