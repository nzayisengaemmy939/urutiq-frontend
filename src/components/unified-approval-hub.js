import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { Progress } from './ui/progress';
import { CheckCircle, XCircle, Clock, AlertTriangle, Settings, Plus, Filter, Eye, Edit, Trash2, Copy, Download, Upload, TrendingUp, BarChart3, Calendar, FileText, DollarSign, ShoppingCart, Receipt, CreditCard, Building2 } from 'lucide-react';
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
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showCreateWorkflow, setShowCreateWorkflow] = useState(false);
    const [showCreateRequest, setShowCreateRequest] = useState(false);
    const [workflowForm, setWorkflowForm] = useState({
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
        mutationFn: ({ requestId, assigneeId, action, data }) => unifiedApprovalsApi.processApprovalAction(requestId, assigneeId, action, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['approval-requests'] });
            queryClient.invalidateQueries({ queryKey: ['approval-dashboard'] });
            setSelectedRequest(null);
        }
    });
    const createWorkflowMutation = useMutation({
        mutationFn: (workflow) => unifiedApprovalsApi.createWorkflow(workflow),
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
        onError: (error) => {
            console.error('❌ Create workflow error:', error);
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to create workflow';
            alert(`Error creating workflow: ${errorMessage}`);
        }
    });
    // ==================== HELPER FUNCTIONS ====================
    const getStatusIcon = (status) => {
        switch (status) {
            case 'approved': return _jsx(CheckCircle, { className: "h-4 w-4 text-green-500" });
            case 'rejected': return _jsx(XCircle, { className: "h-4 w-4 text-red-500" });
            case 'escalated': return _jsx(AlertTriangle, { className: "h-4 w-4 text-orange-500" });
            case 'cancelled': return _jsx(XCircle, { className: "h-4 w-4 text-gray-500" });
            default: return _jsx(Clock, { className: "h-4 w-4 text-yellow-500" });
        }
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return 'bg-green-100 text-green-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            case 'escalated': return 'bg-orange-100 text-orange-800';
            case 'cancelled': return 'bg-gray-100 text-gray-800';
            default: return 'bg-yellow-100 text-yellow-800';
        }
    };
    const getEntityIcon = (entityType) => {
        switch (entityType) {
            case 'journal_entry': return _jsx(FileText, { className: "h-4 w-4" });
            case 'invoice': return _jsx(Receipt, { className: "h-4 w-4" });
            case 'purchase_order': return _jsx(ShoppingCart, { className: "h-4 w-4" });
            case 'expense': return _jsx(DollarSign, { className: "h-4 w-4" });
            case 'bill': return _jsx(CreditCard, { className: "h-4 w-4" });
            case 'document': return _jsx(FileText, { className: "h-4 w-4" });
            case 'recurring_invoice': return _jsx(Calendar, { className: "h-4 w-4" });
            default: return _jsx(Building2, { className: "h-4 w-4" });
        }
    };
    const getPriorityColor = (priority) => {
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
        return (_jsxs("div", { className: "flex items-center justify-center h-64", children: [_jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" }), _jsx("div", { className: "ml-3 text-sm text-gray-600", children: "Loading authentication..." })] }));
    }
    // Show loading state while company ID is being retrieved
    if (!companyId || companyId.trim() === '') {
        return (_jsxs("div", { className: "flex items-center justify-center h-64", children: [_jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" }), _jsx("div", { className: "ml-3 text-sm text-gray-600", children: "Loading company information..." })] }));
    }
    // Show authentication required message
    if (!isAuthenticated) {
        return (_jsx("div", { className: "p-6", children: _jsx("div", { className: "bg-yellow-50 border border-yellow-200 rounded-lg p-4", children: _jsxs("div", { className: "flex", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("svg", { className: "h-5 w-5 text-yellow-400", viewBox: "0 0 20 20", fill: "currentColor", children: _jsx("path", { fillRule: "evenodd", d: "M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z", clipRule: "evenodd" }) }) }), _jsxs("div", { className: "ml-3", children: [_jsx("h3", { className: "text-sm font-medium text-yellow-800", children: "Authentication Required" }), _jsxs("div", { className: "mt-2 text-sm text-yellow-700", children: [_jsx("p", { children: "Please log in to access the approval hub." }), _jsxs("p", { className: "mt-1", children: ["Debug: isAuthenticated=", isAuthenticated.toString(), ", isLoading=", isLoading.toString()] })] })] })] }) }) }));
    }
    const renderDashboard = () => {
        if (dashboardLoading) {
            return _jsx("div", { className: "flex items-center justify-center h-64", children: "Loading dashboard..." });
        }
        if (dashboardError) {
            return (_jsx("div", { className: "bg-red-50 border border-red-200 rounded-lg p-4", children: _jsxs("div", { className: "flex", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("svg", { className: "h-5 w-5 text-red-400", viewBox: "0 0 20 20", fill: "currentColor", children: _jsx("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z", clipRule: "evenodd" }) }) }), _jsxs("div", { className: "ml-3", children: [_jsx("h3", { className: "text-sm font-medium text-red-800", children: "Error loading approval dashboard" }), _jsxs("div", { className: "mt-2 text-sm text-red-700", children: [_jsx("p", { children: "Failed to load approval data. Please check your authentication and try again." }), _jsxs("p", { className: "mt-1", children: ["Error: ", dashboardError?.message || 'Unknown error'] })] })] })] }) }));
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
            return (_jsx("div", { className: "p-6", children: _jsx("div", { className: "bg-red-50 border border-red-200 rounded-lg p-4", children: _jsxs("div", { className: "flex", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("svg", { className: "h-5 w-5 text-red-400", viewBox: "0 0 20 20", fill: "currentColor", children: _jsx("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z", clipRule: "evenodd" }) }) }), _jsxs("div", { className: "ml-3", children: [_jsx("h3", { className: "text-sm font-medium text-red-800", children: "No Dashboard Data" }), _jsx("div", { className: "mt-2 text-sm text-red-700", children: _jsx("p", { children: "Dashboard data is completely missing." }) })] })] }) }) }));
        }
        return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Total Requests" }), _jsx(BarChart3, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: summary?.totalRequests ?? 0 }), _jsx("p", { className: "text-xs text-muted-foreground", children: "All time requests" })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Pending" }), _jsx(Clock, { className: "h-4 w-4 text-yellow-500" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold text-yellow-600", children: summary?.pendingRequests ?? 0 }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Awaiting approval" })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Approved" }), _jsx(CheckCircle, { className: "h-4 w-4 text-green-500" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold text-green-600", children: summary?.approvedRequests ?? 0 }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Successfully approved" })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Approval Rate" }), _jsx(TrendingUp, { className: "h-4 w-4 text-blue-500" })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: "text-2xl font-bold text-blue-600", children: [(summary?.approvalRate ?? 0).toFixed(1), "%"] }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Success rate" })] })] })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Requests by Entity Type" }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-2", children: (byEntityType ?? []).map((item) => (_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [getEntityIcon(item.entityType), _jsx("span", { className: "text-sm font-medium capitalize", children: item.entityType.replace('_', ' ') })] }), _jsx(Badge, { variant: "secondary", children: item.count })] }, item.entityType))) }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Requests by Status" }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-2", children: (byStatus ?? []).map((item) => (_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [getStatusIcon(item.status), _jsx("span", { className: "text-sm font-medium capitalize", children: item.status })] }), _jsx(Badge, { variant: "secondary", children: item.count })] }, item.status))) }) })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Recent Requests" }), _jsx(CardDescription, { children: "Latest approval requests across all entities" })] }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: (recentRequests ?? []).map((request) => (_jsxs("div", { className: "flex items-center justify-between p-4 border rounded-lg", children: [_jsxs("div", { className: "flex items-center space-x-4", children: [getEntityIcon(request.entityType), _jsxs("div", { children: [_jsxs("div", { className: "font-medium", children: [request.entityType.replace('_', ' ').toUpperCase(), " #", request.entityId.slice(-8)] }), _jsxs("div", { className: "text-sm text-muted-foreground", children: ["Requested by ", request.requestedBy, " \u2022 ", new Date(request.requestedAt).toLocaleDateString()] })] })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Badge, { className: getStatusColor(request.status), children: request.status }), _jsxs("div", { className: "text-sm text-muted-foreground", children: ["Step ", request.currentStep, " of ", request.totalSteps] }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => setSelectedRequest(request), children: _jsx(Eye, { className: "h-4 w-4" }) })] })] }, request.id))) }) })] })] }));
    };
    const renderWorkflows = () => {
        if (workflowsLoading) {
            return _jsx("div", { className: "flex items-center justify-center h-64", children: "Loading workflows..." });
        }
        return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold", children: "Approval Workflows" }), _jsx("p", { className: "text-muted-foreground", children: "Manage approval workflows for different entity types" })] }), _jsxs(Button, { onClick: () => setShowCreateWorkflow(true), children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "Create Workflow"] })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: workflows?.workflows?.map((workflow) => (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx(CardTitle, { className: "text-lg", children: workflow.name }), _jsx(Badge, { className: getPriorityColor(workflow.priority), children: workflow.priority })] }), _jsx(CardDescription, { children: workflow.description })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [getEntityIcon(workflow.entityType), _jsx("span", { className: "text-sm font-medium", children: workflow.entityType.replace('_', ' ').toUpperCase() }), workflow.entitySubType && (_jsx(Badge, { variant: "outline", children: workflow.entitySubType }))] }), _jsxs("div", { className: "text-sm text-muted-foreground", children: [workflow.steps.length, " approval step", workflow.steps.length !== 1 ? 's' : ''] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Badge, { variant: workflow.isActive ? 'default' : 'secondary', children: workflow.isActive ? 'Active' : 'Inactive' }), workflow.autoApproval && (_jsx(Badge, { variant: "outline", children: "Auto-approval" }))] })] }), _jsxs("div", { className: "flex items-center space-x-2 mt-4", children: [_jsxs(Button, { variant: "outline", size: "sm", children: [_jsx(Edit, { className: "h-4 w-4 mr-2" }), "Edit"] }), _jsxs(Button, { variant: "outline", size: "sm", children: [_jsx(Copy, { className: "h-4 w-4 mr-2" }), "Copy"] }), _jsxs(Button, { variant: "outline", size: "sm", className: "text-red-600", children: [_jsx(Trash2, { className: "h-4 w-4 mr-2" }), "Delete"] })] })] })] }, workflow.id))) })] }));
    };
    const renderRequests = () => {
        if (requestsLoading) {
            return _jsx("div", { className: "flex items-center justify-center h-64", children: "Loading requests..." });
        }
        return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold", children: "Approval Requests" }), _jsx("p", { className: "text-muted-foreground", children: "Manage and process approval requests" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsxs(Button, { variant: "outline", children: [_jsx(Filter, { className: "h-4 w-4 mr-2" }), "Filter"] }), _jsxs(Button, { onClick: () => setShowCreateRequest(true), children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "New Request"] })] })] }), _jsx(Card, { children: _jsx(CardContent, { className: "pt-6", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "entityType", children: "Entity Type" }), _jsxs(Select, { value: filters.entityType || "all", onValueChange: (value) => setFilters({ ...filters, entityType: value === "all" ? "" : value }), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "All types" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All types" }), _jsx(SelectItem, { value: "journal_entry", children: "Journal Entry" }), _jsx(SelectItem, { value: "invoice", children: "Invoice" }), _jsx(SelectItem, { value: "purchase_order", children: "Purchase Order" }), _jsx(SelectItem, { value: "expense", children: "Expense" }), _jsx(SelectItem, { value: "bill", children: "Bill" }), _jsx(SelectItem, { value: "document", children: "Document" }), _jsx(SelectItem, { value: "recurring_invoice", children: "Recurring Invoice" })] })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "status", children: "Status" }), _jsxs(Select, { value: filters.status || "all", onValueChange: (value) => setFilters({ ...filters, status: value === "all" ? "" : value }), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "All statuses" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All statuses" }), _jsx(SelectItem, { value: "pending", children: "Pending" }), _jsx(SelectItem, { value: "approved", children: "Approved" }), _jsx(SelectItem, { value: "rejected", children: "Rejected" }), _jsx(SelectItem, { value: "escalated", children: "Escalated" }), _jsx(SelectItem, { value: "cancelled", children: "Cancelled" })] })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "requestedBy", children: "Requested By" }), _jsx(Input, { placeholder: "Search by user...", value: filters.requestedBy, onChange: (e) => setFilters({ ...filters, requestedBy: e.target.value }) })] })] }) }) }), _jsx("div", { className: "space-y-4", children: requests?.approvalRequests?.map((request) => (_jsx(Card, { children: _jsxs(CardContent, { className: "pt-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-4", children: [getEntityIcon(request.entityType), _jsxs("div", { children: [_jsxs("div", { className: "font-medium", children: [request.entityType.replace('_', ' ').toUpperCase(), " #", request.entityId.slice(-8)] }), _jsxs("div", { className: "text-sm text-muted-foreground", children: ["Requested by ", request.requestedBy, " \u2022 ", new Date(request.requestedAt).toLocaleDateString()] }), request.comments && (_jsx("div", { className: "text-sm text-muted-foreground mt-1", children: request.comments }))] })] }), _jsxs("div", { className: "flex items-center space-x-4", children: [_jsxs("div", { className: "text-right", children: [_jsxs("div", { className: "text-sm font-medium", children: ["Step ", request.currentStep, " of ", request.totalSteps] }), _jsxs("div", { className: "text-xs text-muted-foreground", children: [request.completedSteps, " completed"] })] }), _jsx(Badge, { className: getStatusColor(request.status), children: request.status }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Button, { variant: "outline", size: "sm", onClick: () => setSelectedRequest(request), children: _jsx(Eye, { className: "h-4 w-4" }) }), request.status === 'pending' && (_jsx(Button, { variant: "outline", size: "sm", onClick: () => {
                                                                // Handle approval action
                                                            }, children: _jsx(CheckCircle, { className: "h-4 w-4" }) }))] })] })] }), _jsxs("div", { className: "mt-4", children: [_jsxs("div", { className: "flex items-center justify-between text-sm text-muted-foreground mb-2", children: [_jsx("span", { children: "Progress" }), _jsxs("span", { children: [Math.round((request.completedSteps / request.totalSteps) * 100), "%"] })] }), _jsx(Progress, { value: (request.completedSteps / request.totalSteps) * 100, className: "h-2" })] }), _jsxs("div", { className: "mt-4", children: [_jsx("div", { className: "text-sm font-medium mb-2", children: "Approvers" }), _jsx("div", { className: "flex flex-wrap gap-2", children: request.approvers.map((approver) => (_jsxs("div", { className: "flex items-center space-x-2 text-sm", children: [_jsxs("div", { className: "flex items-center space-x-1", children: [getStatusIcon(approver.status), _jsx("span", { children: approver.user?.name || approver.userId })] }), _jsx(Badge, { variant: "outline", className: "text-xs", children: approver.stepName })] }, approver.id))) })] })] }) }, request.id))) })] }));
    };
    const renderRequestDetails = () => {
        if (!selectedRequest)
            return null;
        return (_jsx(Dialog, { open: !!selectedRequest, onOpenChange: () => setSelectedRequest(null), children: _jsxs(DialogContent, { className: "max-w-4xl", children: [_jsxs(DialogHeader, { children: [_jsxs(DialogTitle, { children: [selectedRequest.entityType.replace('_', ' ').toUpperCase(), " #", selectedRequest.entityId.slice(-8)] }), _jsx(DialogDescription, { children: "Approval request details and processing" })] }), _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { children: "Status" }), _jsx(Badge, { className: getStatusColor(selectedRequest.status), children: selectedRequest.status })] }), _jsxs("div", { children: [_jsx(Label, { children: "Progress" }), _jsxs("div", { className: "text-sm", children: ["Step ", selectedRequest.currentStep, " of ", selectedRequest.totalSteps] })] }), _jsxs("div", { children: [_jsx(Label, { children: "Requested By" }), _jsx("div", { className: "text-sm", children: selectedRequest.requestedBy })] }), _jsxs("div", { children: [_jsx(Label, { children: "Requested At" }), _jsx("div", { className: "text-sm", children: new Date(selectedRequest.requestedAt).toLocaleString() })] })] }), _jsxs("div", { children: [_jsx(Label, { children: "Approval Steps" }), _jsx("div", { className: "space-y-2 mt-2", children: selectedRequest.approvers.map((approver, index) => (_jsxs("div", { className: "flex items-center justify-between p-3 border rounded-lg", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [getStatusIcon(approver.status), _jsx("span", { className: "font-medium", children: approver.user?.name || approver.userId })] }), _jsx(Badge, { variant: "outline", children: approver.stepName })] }), _jsx("div", { className: "text-sm text-muted-foreground", children: approver.completedAt
                                                        ? `Completed ${new Date(approver.completedAt).toLocaleString()}`
                                                        : `Assigned ${new Date(approver.assignedAt).toLocaleString()}` })] }, approver.id))) })] }), selectedRequest.comments && (_jsxs("div", { children: [_jsx(Label, { children: "Comments" }), _jsx("div", { className: "mt-2 p-3 bg-muted rounded-lg", children: selectedRequest.comments })] })), selectedRequest.status === 'pending' && (_jsxs("div", { className: "flex items-center space-x-2", children: [_jsxs(Button, { onClick: () => {
                                            // Handle approve action
                                        }, className: "bg-green-600 hover:bg-green-700", children: [_jsx(CheckCircle, { className: "h-4 w-4 mr-2" }), "Approve"] }), _jsxs(Button, { variant: "outline", onClick: () => {
                                            // Handle reject action
                                        }, className: "text-red-600 border-red-600 hover:bg-red-50", children: [_jsx(XCircle, { className: "h-4 w-4 mr-2" }), "Reject"] }), _jsxs(Button, { variant: "outline", onClick: () => {
                                            // Handle escalate action
                                        }, className: "text-orange-600 border-orange-600 hover:bg-orange-50", children: [_jsx(AlertTriangle, { className: "h-4 w-4 mr-2" }), "Escalate"] })] }))] })] }) }));
    };
    const renderCreateWorkflowModal = () => {
        if (!showCreateWorkflow)
            return null;
        return (_jsx(Dialog, { open: showCreateWorkflow, onOpenChange: setShowCreateWorkflow, children: _jsxs(DialogContent, { className: "max-w-4xl max-h-[90vh] overflow-y-auto", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Create Approval Workflow" }), _jsx(DialogDescription, { children: "Define a new approval workflow for business processes" })] }), _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "workflowName", children: "Workflow Name *" }), _jsx(Input, { id: "workflowName", value: workflowForm.name, onChange: (e) => setWorkflowForm({ ...workflowForm, name: e.target.value }), placeholder: "Enter workflow name" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "entityType", children: "Entity Type *" }), _jsxs(Select, { value: workflowForm.entityType, onValueChange: (value) => setWorkflowForm({ ...workflowForm, entityType: value }), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select entity type" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "journal_entry", children: "Journal Entry" }), _jsx(SelectItem, { value: "invoice", children: "Invoice" }), _jsx(SelectItem, { value: "purchase_order", children: "Purchase Order" }), _jsx(SelectItem, { value: "expense", children: "Expense" }), _jsx(SelectItem, { value: "bill", children: "Bill" }), _jsx(SelectItem, { value: "document", children: "Document" }), _jsx(SelectItem, { value: "recurring_invoice", children: "Recurring Invoice" })] })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "entitySubType", children: "Entity Sub Type" }), _jsx(Input, { id: "entitySubType", value: workflowForm.entitySubType, onChange: (e) => setWorkflowForm({ ...workflowForm, entitySubType: e.target.value }), placeholder: "e.g., high_value, recurring" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "priority", children: "Priority" }), _jsxs(Select, { value: workflowForm.priority, onValueChange: (value) => setWorkflowForm({ ...workflowForm, priority: value }), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select priority" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "low", children: "Low" }), _jsx(SelectItem, { value: "medium", children: "Medium" }), _jsx(SelectItem, { value: "high", children: "High" }), _jsx(SelectItem, { value: "critical", children: "Critical" })] })] })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "description", children: "Description" }), _jsx(Textarea, { id: "description", value: workflowForm.description, onChange: (e) => setWorkflowForm({ ...workflowForm, description: e.target.value }), placeholder: "Describe the workflow purpose and when it should be used", rows: 3 })] }), _jsxs("div", { className: "flex items-center space-x-4", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "isActive", checked: workflowForm.isActive, onCheckedChange: (checked) => setWorkflowForm({ ...workflowForm, isActive: !!checked }) }), _jsx(Label, { htmlFor: "isActive", children: "Active" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "autoApproval", checked: workflowForm.autoApproval, onCheckedChange: (checked) => setWorkflowForm({ ...workflowForm, autoApproval: !!checked }) }), _jsx(Label, { htmlFor: "autoApproval", children: "Auto Approval" })] })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx(Label, { children: "Approval Steps" }), _jsx(Button, { type: "button", variant: "outline", size: "sm", onClick: () => {
                                                    const newStep = {
                                                        id: `step-${workflowForm.steps.length + 1}`,
                                                        name: '',
                                                        approverType: 'role',
                                                        role: '',
                                                        approverId: '',
                                                        isRequired: true,
                                                        autoApprove: false
                                                    };
                                                    setWorkflowForm({
                                                        ...workflowForm,
                                                        steps: [...workflowForm.steps, newStep]
                                                    });
                                                }, children: "Add Step" })] }), _jsxs("div", { className: "space-y-4 mt-2", children: [workflowForm.steps.map((step, index) => (_jsx(Card, { children: _jsxs(CardContent, { className: "pt-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { children: "Step Name" }), _jsx(Input, { value: step.name || '', onChange: (e) => {
                                                                                const newSteps = [...workflowForm.steps];
                                                                                newSteps[index] = { ...newSteps[index], name: e.target.value, id: `step-${index + 1}` };
                                                                                setWorkflowForm({ ...workflowForm, steps: newSteps });
                                                                            }, placeholder: "e.g., Manager Approval" })] }), _jsxs("div", { children: [_jsx(Label, { children: "Approver Type" }), _jsxs(Select, { value: step.approverType || 'role', onValueChange: (value) => {
                                                                                const newSteps = [...workflowForm.steps];
                                                                                newSteps[index] = { ...newSteps[index], approverType: value };
                                                                                setWorkflowForm({ ...workflowForm, steps: newSteps });
                                                                            }, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select approver type" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "role", children: "Role" }), _jsx(SelectItem, { value: "user", children: "User" }), _jsx(SelectItem, { value: "department", children: "Department" }), _jsx(SelectItem, { value: "amount_based", children: "Amount Based" })] })] })] }), _jsxs("div", { children: [_jsx(Label, { children: "Role/User" }), _jsx(Input, { value: step.role || step.approverId || '', onChange: (e) => {
                                                                                const newSteps = [...workflowForm.steps];
                                                                                if (step.approverType === 'role') {
                                                                                    newSteps[index] = { ...newSteps[index], role: e.target.value };
                                                                                }
                                                                                else {
                                                                                    newSteps[index] = { ...newSteps[index], approverId: e.target.value };
                                                                                }
                                                                                setWorkflowForm({ ...workflowForm, steps: newSteps });
                                                                            }, placeholder: "e.g., manager, finance_director" })] })] }), _jsxs("div", { className: "flex items-center justify-between mt-4", children: [_jsxs("div", { className: "flex items-center space-x-4", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { checked: step.isRequired !== false, onCheckedChange: (checked) => {
                                                                                        const newSteps = [...workflowForm.steps];
                                                                                        newSteps[index] = { ...newSteps[index], isRequired: !!checked };
                                                                                        setWorkflowForm({ ...workflowForm, steps: newSteps });
                                                                                    } }), _jsx(Label, { children: "Required" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { checked: step.autoApprove || false, onCheckedChange: (checked) => {
                                                                                        const newSteps = [...workflowForm.steps];
                                                                                        newSteps[index] = { ...newSteps[index], autoApprove: !!checked };
                                                                                        setWorkflowForm({ ...workflowForm, steps: newSteps });
                                                                                    } }), _jsx(Label, { children: "Auto Approve" })] })] }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => {
                                                                        const newSteps = workflowForm.steps.filter((_, i) => i !== index);
                                                                        setWorkflowForm({ ...workflowForm, steps: newSteps });
                                                                    }, className: "text-red-600", children: _jsx(Trash2, { className: "h-4 w-4" }) })] })] }) }, index))), workflowForm.steps.length === 0 && (_jsxs("div", { className: "text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg", children: [_jsx("p", { className: "text-sm", children: "No approval steps added yet." }), _jsx("p", { className: "text-xs text-gray-400 mt-1", children: "Click \"Add Step\" to get started." })] })), _jsxs(Button, { variant: "outline", onClick: () => {
                                                    const newStep = {
                                                        id: `step-${workflowForm.steps.length + 1}`,
                                                        name: '',
                                                        approverType: 'role',
                                                        isRequired: true,
                                                        order: workflowForm.steps.length + 1,
                                                        autoApprove: false
                                                    };
                                                    setWorkflowForm({ ...workflowForm, steps: [...workflowForm.steps, newStep] });
                                                }, className: "w-full", children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "Add Approval Step"] })] })] }), _jsxs("div", { className: "flex items-center justify-end space-x-2", children: [_jsx(Button, { variant: "outline", onClick: () => setShowCreateWorkflow(false), children: "Cancel" }), _jsx(Button, { onClick: () => {
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
                                        }, disabled: !companyId || companyId.trim() === '' || !workflowForm.name || workflowForm.steps.length === 0 || createWorkflowMutation.isPending, children: createWorkflowMutation.isPending ? 'Creating...' : 'Create Workflow' })] })] })] }) }));
    };
    // ==================== MAIN RENDER ====================
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold", children: "Approval Hub" }), _jsx("p", { className: "text-muted-foreground", children: "Centralized approval management for all business processes" }), companyId && (_jsxs("p", { className: "text-sm text-gray-500 mt-1", children: ["Company: ", companyId] }))] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsxs(Button, { variant: "outline", children: [_jsx(Download, { className: "h-4 w-4 mr-2" }), "Export"] }), _jsxs(Button, { variant: "outline", children: [_jsx(Upload, { className: "h-4 w-4 mr-2" }), "Import"] }), _jsxs(Button, { variant: "outline", children: [_jsx(Settings, { className: "h-4 w-4 mr-2" }), "Settings"] })] })] }), _jsxs(Tabs, { value: selectedTab, onValueChange: setSelectedTab, children: [_jsxs(TabsList, { children: [_jsxs(TabsTrigger, { value: "dashboard", children: [_jsx(BarChart3, { className: "h-4 w-4 mr-2" }), "Dashboard"] }), _jsxs(TabsTrigger, { value: "workflows", children: [_jsx(Settings, { className: "h-4 w-4 mr-2" }), "Workflows"] }), _jsxs(TabsTrigger, { value: "requests", children: [_jsx(FileText, { className: "h-4 w-4 mr-2" }), "Requests"] })] }), _jsx(TabsContent, { value: "dashboard", children: renderDashboard() }), _jsx(TabsContent, { value: "workflows", children: renderWorkflows() }), _jsx(TabsContent, { value: "requests", children: renderRequests() })] }), renderRequestDetails(), renderCreateWorkflowModal()] }));
}
