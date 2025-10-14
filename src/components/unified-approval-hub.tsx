import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { Alert, AlertDescription } from './ui/alert';
import { Progress } from './ui/progress';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  Users, 
  Settings, 
  Plus, 
  Search, 
  Filter,
  Eye,
  Edit,
  Trash2,
  Copy,
  Download,
  Upload,
  Bell,
  TrendingUp,
  BarChart3,
  Calendar,
  FileText,
  DollarSign,
  ShoppingCart,
  Receipt,
  CreditCard,
  Building2
} from 'lucide-react';

// ==================== TYPES ====================

interface ApprovalWorkflow {
  id: string;
  name: string;
  description?: string;
  entityType: string;
  entitySubType?: string;
  isActive: boolean;
  steps: ApprovalStep[];
  conditions: ApprovalCondition[];
  autoApproval: boolean;
  escalationRules: EscalationRule[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

interface ApprovalStep {
  id: string;
  name: string;
  approverType: 'user' | 'role' | 'department' | 'amount_based';
  approverId?: string;
  role?: string;
  department?: string;
  amountThreshold?: number;
  isRequired: boolean;
  order: number;
  escalationHours?: number;
  autoApprove?: boolean;
  conditions?: ApprovalCondition[];
}

interface ApprovalCondition {
  field: string;
  operator: 'equals' | 'greater_than' | 'less_than' | 'contains' | 'in';
  value: any;
  logicalOperator?: 'AND' | 'OR';
}

interface EscalationRule {
  stepId: string;
  escalationHours: number;
  escalateTo: 'manager' | 'director' | 'ceo' | 'specific_user';
  escalateToUserId?: string;
  notificationChannels: ('email' | 'sms' | 'slack' | 'teams')[];
}

interface ApprovalRequest {
  id: string;
  entityType: string;
  entityId: string;
  entitySubType?: string;
  workflowId: string;
  status: 'pending' | 'approved' | 'rejected' | 'escalated' | 'cancelled';
  currentStep: number;
  totalSteps: number;
  completedSteps: number;
  requestedBy: string;
  requestedAt: string;
  approvedAt?: string;
  rejectedAt?: string;
  comments?: string;
  metadata?: Record<string, any>;
  approvers: ApprovalAssignee[];
}

interface ApprovalAssignee {
  id: string;
  userId: string;
  stepId: string;
  stepName: string;
  status: 'pending' | 'approved' | 'rejected' | 'escalated' | 'skipped';
  assignedAt: string;
  completedAt?: string;
  comments?: string;
  escalatedTo?: string;
  escalationReason?: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

interface ApprovalDashboard {
  summary: {
    totalRequests: number;
    pendingRequests: number;
    approvedRequests: number;
    rejectedRequests: number;
    escalatedRequests: number;
    approvalRate: number;
    avgProcessingTime: number;
  };
  byEntityType: Array<{ entityType: string; count: number }>;
  byStatus: Array<{ status: string; count: number }>;
  recentRequests: ApprovalRequest[];
}

// ==================== API FUNCTIONS ====================

import { unifiedApprovalsApi } from '../lib/api/unified-approvals';
import { useAuth } from '../contexts/auth-context';
import { getCompanyId } from '../lib/config';

// ==================== MAIN COMPONENT ====================

export function UnifiedApprovalHub() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [companyId, setCompanyId] = useState(() => {
    const initialCompanyId = getCompanyId();
    console.log('🔍 Initial state - getCompanyId() returned:', initialCompanyId);
    console.log('🔍 Initial state - getCompanyId() type:', typeof initialCompanyId);
    return initialCompanyId;
  });
  
  // Get companyId using the utility function
  useEffect(() => {
    console.log('🔍 useEffect - Getting company ID...');
    const currentCompanyId = getCompanyId();
    console.log('🔍 useEffect - getCompanyId() returned:', currentCompanyId);
    console.log('🔍 useEffect - getCompanyId() type:', typeof currentCompanyId);
    setCompanyId(currentCompanyId);
  }, [user]);
  
  const [selectedTab, setSelectedTab] = useState('dashboard');
  const [filters, setFilters] = useState({
    entityType: '',
    status: '',
    requestedBy: ''
  });
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);
  const [showCreateWorkflow, setShowCreateWorkflow] = useState(false);
  const [showCreateRequest, setShowCreateRequest] = useState(false);
  const [workflowForm, setWorkflowForm] = useState({
    name: '',
    description: '',
    entityType: 'journal_entry' as const,
    entitySubType: '',
    isActive: true,
    steps: [] as any[],
    conditions: [] as any[],
    autoApproval: false,
    escalationRules: [] as any[],
    priority: 'medium' as const
  });

  const queryClient = useQueryClient();

  // ==================== QUERIES ====================

  const { data: workflows, isLoading: workflowsLoading, error: workflowsError } = useQuery({
    queryKey: ['approval-workflows', companyId],
    queryFn: () => {
      console.log('🔍 Fetching workflows - Auth state:', { isAuthenticated, isLoading, companyId });
      return unifiedApprovalsApi.getWorkflows(companyId);
    },
    enabled: !!companyId && isAuthenticated && !isLoading,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  const { data: requests, isLoading: requestsLoading, error: requestsError } = useQuery({
    queryKey: ['approval-requests', companyId, filters],
    queryFn: () => unifiedApprovalsApi.getApprovalRequests(companyId, filters),
    enabled: !!companyId && isAuthenticated && !isLoading
  });

  const { data: dashboard, isLoading: dashboardLoading, error: dashboardError } = useQuery({
    queryKey: ['approval-dashboard', companyId],
    queryFn: () => unifiedApprovalsApi.getDashboard(companyId),
    enabled: !!companyId && isAuthenticated && !isLoading
  });

  // ==================== MUTATIONS ====================

  const createRequestMutation = useMutation({
    mutationFn: unifiedApprovalsApi.createApprovalRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approval-requests'] });
      queryClient.invalidateQueries({ queryKey: ['approval-dashboard'] });
      setShowCreateRequest(false);
    }
  });

  const processActionMutation = useMutation({
    mutationFn: ({ requestId, assigneeId, action, data }: any) => 
      unifiedApprovalsApi.processApprovalAction(requestId, assigneeId, action, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approval-requests'] });
      queryClient.invalidateQueries({ queryKey: ['approval-dashboard'] });
      setSelectedRequest(null);
    }
  });

  const createWorkflowMutation = useMutation({
    mutationFn: (workflow: any) => unifiedApprovalsApi.createWorkflow(workflow),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approval-workflows'] });
      setShowCreateWorkflow(false);
      setWorkflowForm({
        name: '',
        description: '',
        entityType: 'journal_entry',
        entitySubType: '',
        isActive: true,
        steps: [],
        conditions: [],
        autoApproval: false,
        escalationRules: [],
        priority: 'medium'
      });
    },
    onError: (error: any) => {
      console.error('❌ Create workflow error:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to create workflow';
      alert(`Error creating workflow: ${errorMessage}`);
    }
  });

  // ==================== HELPER FUNCTIONS ====================

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'escalated': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'cancelled': return <XCircle className="h-4 w-4 text-gray-500" />;
      default: return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'escalated': return 'bg-orange-100 text-orange-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getEntityIcon = (entityType: string) => {
    switch (entityType) {
      case 'journal_entry': return <FileText className="h-4 w-4" />;
      case 'invoice': return <Receipt className="h-4 w-4" />;
      case 'purchase_order': return <ShoppingCart className="h-4 w-4" />;
      case 'expense': return <DollarSign className="h-4 w-4" />;
      case 'bill': return <CreditCard className="h-4 w-4" />;
      case 'document': return <FileText className="h-4 w-4" />;
      case 'recurring_invoice': return <Calendar className="h-4 w-4" />;
      default: return <Building2 className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // ==================== RENDER FUNCTIONS ====================


  // Show loading state while authentication is being checked
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <div className="ml-3 text-sm text-gray-600">Loading authentication...</div>
      </div>
    );
  }

  // Show loading state while company ID is being retrieved
  if (!companyId || companyId.trim() === '') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <div className="ml-3 text-sm text-gray-600">Loading company information...</div>
      </div>
    );
  }

  // Show authentication required message
  if (!isAuthenticated) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Authentication Required
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>Please log in to access the approval hub.</p>
                <p className="mt-1">Debug: isAuthenticated={isAuthenticated.toString()}, isLoading={isLoading.toString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderDashboard = () => {
    if (dashboardLoading) {
      return <div className="flex items-center justify-center h-64">Loading dashboard...</div>;
    }

    if (dashboardError) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error loading approval dashboard
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>Failed to load approval data. Please check your authentication and try again.</p>
                <p className="mt-1">Error: {dashboardError?.message || 'Unknown error'}</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    const summary = dashboard?.summary || {
      totalRequests: 0,
      pendingRequests: 0,
      approvedRequests: 0,
      rejectedRequests: 0,
      escalatedRequests: 0,
      approvalRate: 0,
      avgProcessingTime: 0
    };
    const byEntityType = dashboard?.byEntityType || [];
    const byStatus = dashboard?.byStatus || [];
    const recentRequests = dashboard?.recentRequests || [];


    if (!dashboard) {
      return (
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  No Dashboard Data
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>Dashboard data is completely missing.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary?.totalRequests ?? 0}</div>
              <p className="text-xs text-muted-foreground">
                All time requests
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{summary?.pendingRequests ?? 0}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting approval
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{summary?.approvedRequests ?? 0}</div>
              <p className="text-xs text-muted-foreground">
                Successfully approved
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {(summary?.approvalRate ?? 0).toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                Success rate
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* By Entity Type */}
          <Card>
            <CardHeader>
              <CardTitle>Requests by Entity Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {(byEntityType ?? []).map((item: any) => (
                  <div key={item.entityType} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getEntityIcon(item.entityType)}
                      <span className="text-sm font-medium capitalize">
                        {item.entityType.replace('_', ' ')}
                      </span>
                    </div>
                    <Badge variant="secondary">{item.count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* By Status */}
          <Card>
            <CardHeader>
              <CardTitle>Requests by Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {(byStatus ?? []).map((item: any) => (
                  <div key={item.status} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(item.status)}
                      <span className="text-sm font-medium capitalize">{item.status}</span>
                    </div>
                    <Badge variant="secondary">{item.count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Requests */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Requests</CardTitle>
            <CardDescription>Latest approval requests across all entities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(recentRequests ?? []).map((request: ApprovalRequest) => (
                <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    {getEntityIcon(request.entityType)}
                    <div>
                      <div className="font-medium">
                        {request.entityType.replace('_', ' ').toUpperCase()} #{request.entityId.slice(-8)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Requested by {request.requestedBy} • {new Date(request.requestedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(request.status)}>
                      {request.status}
                    </Badge>
                    <div className="text-sm text-muted-foreground">
                      Step {request.currentStep} of {request.totalSteps}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedRequest(request)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderWorkflows = () => {
    if (workflowsLoading) {
      return <div className="flex items-center justify-center h-64">Loading workflows...</div>;
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Approval Workflows</h2>
            <p className="text-muted-foreground">Manage approval workflows for different entity types</p>
          </div>
          <Button onClick={() => setShowCreateWorkflow(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Workflow
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(workflows as any)?.workflows?.map((workflow: ApprovalWorkflow) => (
            <Card key={workflow.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{workflow.name}</CardTitle>
                  <Badge className={getPriorityColor(workflow.priority)}>
                    {workflow.priority}
                  </Badge>
                </div>
                <CardDescription>{workflow.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    {getEntityIcon(workflow.entityType)}
                    <span className="text-sm font-medium">
                      {workflow.entityType.replace('_', ' ').toUpperCase()}
                    </span>
                    {workflow.entitySubType && (
                      <Badge variant="outline">{workflow.entitySubType}</Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {workflow.steps.length} approval step{workflow.steps.length !== 1 ? 's' : ''}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={workflow.isActive ? 'default' : 'secondary'}>
                      {workflow.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    {workflow.autoApproval && (
                      <Badge variant="outline">Auto-approval</Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2 mt-4">
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const renderRequests = () => {
    if (requestsLoading) {
      return <div className="flex items-center justify-center h-64">Loading requests...</div>;
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Approval Requests</h2>
            <p className="text-muted-foreground">Manage and process approval requests</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button onClick={() => setShowCreateRequest(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Request
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="entityType">Entity Type</Label>
                <Select value={filters.entityType || "all"} onValueChange={(value) => setFilters({...filters, entityType: value === "all" ? "" : value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    <SelectItem value="journal_entry">Journal Entry</SelectItem>
                    <SelectItem value="invoice">Invoice</SelectItem>
                    <SelectItem value="purchase_order">Purchase Order</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                    <SelectItem value="bill">Bill</SelectItem>
                    <SelectItem value="document">Document</SelectItem>
                    <SelectItem value="recurring_invoice">Recurring Invoice</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={filters.status || "all"} onValueChange={(value) => setFilters({...filters, status: value === "all" ? "" : value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="escalated">Escalated</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="requestedBy">Requested By</Label>
                <Input
                  placeholder="Search by user..."
                  value={filters.requestedBy}
                  onChange={(e) => setFilters({...filters, requestedBy: e.target.value})}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Requests List */}
        <div className="space-y-4">
          {(requests as any)?.approvalRequests?.map((request: ApprovalRequest) => (
            <Card key={request.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {getEntityIcon(request.entityType)}
                    <div>
                      <div className="font-medium">
                        {request.entityType.replace('_', ' ').toUpperCase()} #{request.entityId.slice(-8)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Requested by {request.requestedBy} • {new Date(request.requestedAt).toLocaleDateString()}
                      </div>
                      {request.comments && (
                        <div className="text-sm text-muted-foreground mt-1">
                          {request.comments}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        Step {request.currentStep} of {request.totalSteps}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {request.completedSteps} completed
                      </div>
                    </div>
                    <Badge className={getStatusColor(request.status)}>
                      {request.status}
                    </Badge>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedRequest(request)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {request.status === 'pending' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // Handle approval action
                          }}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                    <span>Progress</span>
                    <span>{Math.round((request.completedSteps / request.totalSteps) * 100)}%</span>
                  </div>
                  <Progress value={(request.completedSteps / request.totalSteps) * 100} className="h-2" />
                </div>

                {/* Approvers */}
                <div className="mt-4">
                  <div className="text-sm font-medium mb-2">Approvers</div>
                  <div className="flex flex-wrap gap-2">
                    {request.approvers.map((approver) => (
                      <div key={approver.id} className="flex items-center space-x-2 text-sm">
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(approver.status)}
                          <span>{approver.user?.name || approver.userId}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {approver.stepName}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const renderRequestDetails = () => {
    if (!selectedRequest) return null;

    return (
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {selectedRequest.entityType.replace('_', ' ').toUpperCase()} #{selectedRequest.entityId.slice(-8)}
            </DialogTitle>
            <DialogDescription>
              Approval request details and processing
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Request Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Status</Label>
                <Badge className={getStatusColor(selectedRequest.status)}>
                  {selectedRequest.status}
                </Badge>
              </div>
              <div>
                <Label>Progress</Label>
                <div className="text-sm">
                  Step {selectedRequest.currentStep} of {selectedRequest.totalSteps}
                </div>
              </div>
              <div>
                <Label>Requested By</Label>
                <div className="text-sm">{selectedRequest.requestedBy}</div>
              </div>
              <div>
                <Label>Requested At</Label>
                <div className="text-sm">
                  {new Date(selectedRequest.requestedAt).toLocaleString()}
                </div>
              </div>
            </div>

            {/* Approvers */}
            <div>
              <Label>Approval Steps</Label>
              <div className="space-y-2 mt-2">
                {selectedRequest.approvers.map((approver, index) => (
                  <div key={approver.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(approver.status)}
                        <span className="font-medium">
                          {approver.user?.name || approver.userId}
                        </span>
                      </div>
                      <Badge variant="outline">{approver.stepName}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {approver.completedAt 
                        ? `Completed ${new Date(approver.completedAt).toLocaleString()}`
                        : `Assigned ${new Date(approver.assignedAt).toLocaleString()}`
                      }
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Comments */}
            {selectedRequest.comments && (
              <div>
                <Label>Comments</Label>
                <div className="mt-2 p-3 bg-muted rounded-lg">
                  {selectedRequest.comments}
                </div>
              </div>
            )}

            {/* Actions */}
            {selectedRequest.status === 'pending' && (
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => {
                    // Handle approve action
                  }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    // Handle reject action
                  }}
                  className="text-red-600 border-red-600 hover:bg-red-50"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    // Handle escalate action
                  }}
                  className="text-orange-600 border-orange-600 hover:bg-orange-50"
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Escalate
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  const renderCreateWorkflowModal = () => {
    if (!showCreateWorkflow) return null;

    return (
      <Dialog open={showCreateWorkflow} onOpenChange={setShowCreateWorkflow}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Approval Workflow</DialogTitle>
            <DialogDescription>
              Define a new approval workflow for business processes
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="workflowName">Workflow Name *</Label>
                <Input
                  id="workflowName"
                  value={workflowForm.name}
                  onChange={(e) => setWorkflowForm({...workflowForm, name: e.target.value})}
                  placeholder="Enter workflow name"
                />
              </div>
              <div>
                <Label htmlFor="entityType">Entity Type *</Label>
                <Select 
                  value={workflowForm.entityType} 
                  onValueChange={(value: any) => setWorkflowForm({...workflowForm, entityType: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select entity type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="journal_entry">Journal Entry</SelectItem>
                    <SelectItem value="invoice">Invoice</SelectItem>
                    <SelectItem value="purchase_order">Purchase Order</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                    <SelectItem value="bill">Bill</SelectItem>
                    <SelectItem value="document">Document</SelectItem>
                    <SelectItem value="recurring_invoice">Recurring Invoice</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="entitySubType">Entity Sub Type</Label>
                <Input
                  id="entitySubType"
                  value={workflowForm.entitySubType}
                  onChange={(e) => setWorkflowForm({...workflowForm, entitySubType: e.target.value})}
                  placeholder="e.g., high_value, recurring"
                />
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select 
                  value={workflowForm.priority} 
                  onValueChange={(value: any) => setWorkflowForm({...workflowForm, priority: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={workflowForm.description}
                onChange={(e) => setWorkflowForm({...workflowForm, description: e.target.value})}
                placeholder="Describe the workflow purpose and when it should be used"
                rows={3}
              />
            </div>

            {/* Settings */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isActive"
                  checked={workflowForm.isActive}
                  onCheckedChange={(checked) => setWorkflowForm({...workflowForm, isActive: !!checked})}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="autoApproval"
                  checked={workflowForm.autoApproval}
                  onCheckedChange={(checked) => setWorkflowForm({...workflowForm, autoApproval: !!checked})}
                />
                <Label htmlFor="autoApproval">Auto Approval</Label>
              </div>
            </div>

            {/* Simple Workflow Steps */}
            <div>
              <div className="flex items-center justify-between">
                <Label>Approval Steps</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newStep = {
                      id: `step-${workflowForm.steps.length + 1}`,
                      name: '',
                      approverType: 'role' as const,
                      role: '',
                      approverId: '',
                      isRequired: true,
                      autoApprove: false
                    };
                    setWorkflowForm({
                      ...workflowForm,
                      steps: [...workflowForm.steps, newStep]
                    });
                  }}
                >
                  Add Step
                </Button>
              </div>
              <div className="space-y-4 mt-2">
                {workflowForm.steps.map((step, index) => (
                  <Card key={index}>
                    <CardContent className="pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label>Step Name</Label>
                          <Input
                            value={step.name || ''}
                            onChange={(e) => {
                              const newSteps = [...workflowForm.steps];
                              newSteps[index] = {...newSteps[index], name: e.target.value, id: `step-${index + 1}`};
                              setWorkflowForm({...workflowForm, steps: newSteps});
                            }}
                            placeholder="e.g., Manager Approval"
                          />
                        </div>
                        <div>
                          <Label>Approver Type</Label>
                          <Select 
                            value={step.approverType || 'role'} 
                            onValueChange={(value) => {
                              const newSteps = [...workflowForm.steps];
                              newSteps[index] = {...newSteps[index], approverType: value};
                              setWorkflowForm({...workflowForm, steps: newSteps});
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select approver type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="role">Role</SelectItem>
                              <SelectItem value="user">User</SelectItem>
                              <SelectItem value="department">Department</SelectItem>
                              <SelectItem value="amount_based">Amount Based</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Role/User</Label>
                          <Input
                            value={step.role || step.approverId || ''}
                            onChange={(e) => {
                              const newSteps = [...workflowForm.steps];
                              if (step.approverType === 'role') {
                                newSteps[index] = {...newSteps[index], role: e.target.value};
                              } else {
                                newSteps[index] = {...newSteps[index], approverId: e.target.value};
                              }
                              setWorkflowForm({...workflowForm, steps: newSteps});
                            }}
                            placeholder="e.g., manager, finance_director"
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              checked={step.isRequired !== false}
                              onCheckedChange={(checked) => {
                                const newSteps = [...workflowForm.steps];
                                newSteps[index] = {...newSteps[index], isRequired: !!checked};
                                setWorkflowForm({...workflowForm, steps: newSteps});
                              }}
                            />
                            <Label>Required</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              checked={step.autoApprove || false}
                              onCheckedChange={(checked) => {
                                const newSteps = [...workflowForm.steps];
                                newSteps[index] = {...newSteps[index], autoApprove: !!checked};
                                setWorkflowForm({...workflowForm, steps: newSteps});
                              }}
                            />
                            <Label>Auto Approve</Label>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newSteps = workflowForm.steps.filter((_, i) => i !== index);
                            setWorkflowForm({...workflowForm, steps: newSteps});
                          }}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {workflowForm.steps.length === 0 && (
                  <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                    <p className="text-sm">No approval steps added yet.</p>
                    <p className="text-xs text-gray-400 mt-1">Click "Add Step" to get started.</p>
                  </div>
                )}
                
                <Button
                  variant="outline"
                  onClick={() => {
                    const newStep = {
                      id: `step-${workflowForm.steps.length + 1}`,
                      name: '',
                      approverType: 'role',
                      isRequired: true,
                      order: workflowForm.steps.length + 1,
                      autoApprove: false
                    };
                    setWorkflowForm({...workflowForm, steps: [...workflowForm.steps, newStep]});
                  }}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Approval Step
                </Button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowCreateWorkflow(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  // Validate form data before sending
                  if (!companyId || companyId.trim() === '') {
                    alert('Company ID is not available. Please refresh the page and try again.');
                    return;
                  }
                  
                  if (!workflowForm.name.trim()) {
                    alert('Please enter a workflow name');
                    return;
                  }
                  
                  if (workflowForm.steps.length === 0) {
                    alert('Please add at least one approval step');
                    return;
                  }

                  // Validate each step
                  for (let i = 0; i < workflowForm.steps.length; i++) {
                    const step = workflowForm.steps[i];
                    if (!step.name?.trim()) {
                      alert(`Please enter a name for step ${i + 1}`);
                      return;
                    }
                    if (!step.approverType) {
                      alert(`Please select an approver type for step ${i + 1}`);
                      return;
                    }
                    if (step.approverType === 'role' && !step.role?.trim()) {
                      alert(`Please enter a role for step ${i + 1}`);
                      return;
                    }
                    if (step.approverType === 'user' && !step.approverId?.trim()) {
                      alert(`Please enter an approver ID for step ${i + 1}`);
                      return;
                    }
                  }

                  const workflowData = {
                    ...workflowForm,
                    companyId,
                    steps: workflowForm.steps.map((step, index) => ({
                      ...step,
                      id: step.id || `step-${index + 1}`,
                      order: index + 1,
                      isRequired: step.isRequired !== false,
                      autoApprove: step.autoApprove || false
                    }))
                  };
                  
                  console.log('🔍 Frontend - Workflow data being sent:', workflowData);
                  console.log('🔍 Frontend - Company ID:', companyId);
                  console.log('🔍 Frontend - Company ID type:', typeof companyId);
                  console.log('🔍 Frontend - Company ID length:', companyId?.length);
                  
                  createWorkflowMutation.mutate(workflowData);
                }}
                disabled={!companyId || companyId.trim() === '' || !workflowForm.name || workflowForm.steps.length === 0 || createWorkflowMutation.isPending}
              >
                {createWorkflowMutation.isPending ? 'Creating...' : 'Create Workflow'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  // ==================== MAIN RENDER ====================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Approval Hub</h1>
          <p className="text-muted-foreground">
            Centralized approval management for all business processes
          </p>
          {companyId && (
            <p className="text-sm text-gray-500 mt-1">Company: {companyId}</p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="dashboard">
            <BarChart3 className="h-4 w-4 mr-2" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="workflows">
            <Settings className="h-4 w-4 mr-2" />
            Workflows
          </TabsTrigger>
          <TabsTrigger value="requests">
            <FileText className="h-4 w-4 mr-2" />
            Requests
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          {renderDashboard()}
        </TabsContent>

        <TabsContent value="workflows">
          {renderWorkflows()}
        </TabsContent>

        <TabsContent value="requests">
          {renderRequests()}
        </TabsContent>
      </Tabs>

      {/* Request Details Modal */}
      {renderRequestDetails()}

      {/* Create Workflow Modal */}
      {renderCreateWorkflowModal()}
    </div>
  );
}
