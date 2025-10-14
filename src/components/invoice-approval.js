import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { CheckCircle, XCircle, AlertTriangle, Clock } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiService from '@/lib/api';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';
export function InvoiceApproval({ invoiceId, onApprovalComplete }) {
    const [action, setAction] = useState(null);
    const [comments, setComments] = useState('');
    const [escalationReason, setEscalationReason] = useState('');
    const [selectedApprovalId, setSelectedApprovalId] = useState(null);
    const queryClient = useQueryClient();
    const { isAuthenticated, ensureValidToken, handleAuthError } = useAuth();
    // Load pending approvals
    const { data: pendingApprovals, isLoading: loadingApprovals } = useQuery({
        queryKey: ['pending-approvals'],
        enabled: isAuthenticated && typeof window !== 'undefined' && !!localStorage.getItem('auth_token') && !!localStorage.getItem('tenant_id') && !!(localStorage.getItem('company_id') || localStorage.getItem('companyId') || localStorage.getItem('company')),
        queryFn: async () => {
            const ok = await ensureValidToken();
            if (!ok)
                throw new Error('Unauthorized');
            try {
                return await apiService.getPendingApprovals();
            }
            catch (err) {
                try {
                    await handleAuthError();
                }
                catch { }
                // Gracefully degrade to empty data on persistent auth failure
                return { approvals: [] };
            }
        },
        refetchInterval: isAuthenticated ? 30000 : false,
    });
    // Load approval status for current invoice
    const { data: approvalStatus, isLoading: loadingStatus } = useQuery({
        queryKey: ['invoice-approval-status', invoiceId],
        queryFn: () => apiService.getInvoiceApprovalStatus(invoiceId),
        enabled: !!invoiceId
    });
    // Process approval action mutation
    const processApprovalMutation = useMutation({
        mutationFn: ({ approvalId, action, comments, escalationReason }) => apiService.processApprovalAction(approvalId, action, comments, escalationReason),
        onSuccess: () => {
            toast.success('Approval action processed successfully');
            queryClient.invalidateQueries({ queryKey: ['pending-approvals'] });
            queryClient.invalidateQueries({ queryKey: ['invoice-approval-status', invoiceId] });
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
            setAction(null);
            setComments('');
            setEscalationReason('');
            setSelectedApprovalId(null);
            onApprovalComplete?.();
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to process approval action');
        }
    });
    // Trigger approval workflow mutation
    const triggerApprovalMutation = useMutation({
        mutationFn: (workflowId) => apiService.triggerInvoiceApproval(invoiceId, workflowId),
        onSuccess: () => {
            toast.success('Approval workflow triggered');
            queryClient.invalidateQueries({ queryKey: ['invoice-approval-status', invoiceId] });
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to trigger approval workflow');
        }
    });
    const handleApprovalAction = () => {
        if (!selectedApprovalId || !action)
            return;
        processApprovalMutation.mutate({
            approvalId: selectedApprovalId,
            action,
            comments: comments || undefined,
            escalationReason: action === 'escalate' ? escalationReason : undefined
        });
    };
    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'approved': return 'bg-green-100 text-green-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'escalated': return 'bg-orange-100 text-orange-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    const getStatusIcon = (status) => {
        switch (status.toLowerCase()) {
            case 'approved': return _jsx(CheckCircle, { className: "w-4 h-4" });
            case 'rejected': return _jsx(XCircle, { className: "w-4 h-4" });
            case 'pending': return _jsx(Clock, { className: "w-4 h-4" });
            case 'escalated': return _jsx(AlertTriangle, { className: "w-4 h-4" });
            default: return _jsx(Clock, { className: "w-4 h-4" });
        }
    };
    if (loadingApprovals || loadingStatus) {
        return (_jsx(Card, { children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "animate-pulse space-y-4", children: [_jsx("div", { className: "h-4 bg-gray-200 rounded w-1/3" }), _jsx("div", { className: "h-20 bg-gray-200 rounded" })] }) }) }));
    }
    return (_jsxs("div", { className: "space-y-6", children: [pendingApprovals && pendingApprovals.approvals.length > 0 && (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Clock, { className: "w-5 h-5" }), "Pending Approvals (", pendingApprovals.approvals.length, ")"] }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: pendingApprovals.approvals.map((approval) => (_jsxs("div", { className: "border rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsxs("div", { children: [_jsx("h4", { className: "font-medium", children: approval.invoiceNumber }), _jsxs("div", { className: "text-sm text-gray-600", children: [approval.customerName, " \u2022 ", approval.currency, " ", approval.amount.toFixed(2)] }), _jsxs("div", { className: "text-xs text-gray-500", children: ["Due: ", new Date(approval.dueDate).toLocaleDateString()] })] }), _jsxs(Badge, { className: "bg-yellow-100 text-yellow-800", children: [_jsx(Clock, { className: "w-3 h-3 mr-1" }), "PENDING"] })] }), approval.comments && (_jsxs("div", { className: "mb-3 p-2 bg-gray-50 rounded text-sm", children: [_jsx("strong", { children: "Comments:" }), " ", approval.comments] })), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Dialog, { children: [_jsx(DialogTrigger, { asChild: true, children: _jsxs(Button, { size: "sm", variant: "outline", onClick: () => {
                                                                setSelectedApprovalId(approval.id);
                                                                setAction('approve');
                                                            }, children: [_jsx(CheckCircle, { className: "w-4 h-4 mr-1" }), "Approve"] }) }), _jsxs(DialogContent, { children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { children: "Approve Invoice" }) }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { children: "Comments (Optional)" }), _jsx(Textarea, { value: comments, onChange: (e) => setComments(e.target.value), placeholder: "Add approval comments..." })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { onClick: handleApprovalAction, disabled: processApprovalMutation.isPending, className: "flex-1", children: processApprovalMutation.isPending ? 'Processing...' : 'Approve' }), _jsx(Button, { variant: "outline", onClick: () => {
                                                                                    setAction(null);
                                                                                    setComments('');
                                                                                    setSelectedApprovalId(null);
                                                                                }, children: "Cancel" })] })] })] })] }), _jsxs(Dialog, { children: [_jsx(DialogTrigger, { asChild: true, children: _jsxs(Button, { size: "sm", variant: "outline", onClick: () => {
                                                                setSelectedApprovalId(approval.id);
                                                                setAction('reject');
                                                            }, children: [_jsx(XCircle, { className: "w-4 h-4 mr-1" }), "Reject"] }) }), _jsxs(DialogContent, { children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { children: "Reject Invoice" }) }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { children: "Reason for Rejection *" }), _jsx(Textarea, { value: comments, onChange: (e) => setComments(e.target.value), placeholder: "Please provide a reason for rejection...", required: true })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { variant: "destructive", onClick: handleApprovalAction, disabled: processApprovalMutation.isPending || !comments.trim(), className: "flex-1", children: processApprovalMutation.isPending ? 'Processing...' : 'Reject' }), _jsx(Button, { variant: "outline", onClick: () => {
                                                                                    setAction(null);
                                                                                    setComments('');
                                                                                    setSelectedApprovalId(null);
                                                                                }, children: "Cancel" })] })] })] })] }), _jsxs(Dialog, { children: [_jsx(DialogTrigger, { asChild: true, children: _jsxs(Button, { size: "sm", variant: "outline", onClick: () => {
                                                                setSelectedApprovalId(approval.id);
                                                                setAction('escalate');
                                                            }, children: [_jsx(AlertTriangle, { className: "w-4 h-4 mr-1" }), "Escalate"] }) }), _jsxs(DialogContent, { children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { children: "Escalate Invoice" }) }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { children: "Escalation Reason *" }), _jsx(Textarea, { value: escalationReason, onChange: (e) => setEscalationReason(e.target.value), placeholder: "Please provide a reason for escalation...", required: true })] }), _jsxs("div", { children: [_jsx(Label, { children: "Additional Comments" }), _jsx(Textarea, { value: comments, onChange: (e) => setComments(e.target.value), placeholder: "Additional comments..." })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { onClick: handleApprovalAction, disabled: processApprovalMutation.isPending || !escalationReason.trim(), className: "flex-1", children: processApprovalMutation.isPending ? 'Processing...' : 'Escalate' }), _jsx(Button, { variant: "outline", onClick: () => {
                                                                                    setAction(null);
                                                                                    setComments('');
                                                                                    setEscalationReason('');
                                                                                    setSelectedApprovalId(null);
                                                                                }, children: "Cancel" })] })] })] })] })] })] }, approval.id))) }) })] })), pendingApprovals && pendingApprovals.approvals.length === 0 && (_jsx(Card, { children: _jsxs(CardContent, { className: "p-6 text-center", children: [_jsx(Clock, { className: "w-12 h-12 mx-auto text-gray-400 mb-4" }), _jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "No Pending Approvals" }), _jsx("p", { className: "text-gray-600", children: "You have no invoices waiting for your approval." })] }) }))] }));
}
