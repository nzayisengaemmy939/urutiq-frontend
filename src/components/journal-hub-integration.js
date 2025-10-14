import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { BookOpen, Plus, Eye, Edit, CheckCircle, Clock, AlertCircle, TrendingUp, BarChart3, FileText, Zap, RefreshCw, ExternalLink } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import apiService from '../lib/api';
import { useAuth } from '../contexts/auth-context';
import { getCompanyId } from '../lib/config';
export function JournalHubIntegration({ companyId, onNavigate, showQuickActions = true, showRecentEntries = true, showSummary = true }) {
    const { isAuthenticated } = useAuth();
    const currentCompanyId = companyId || getCompanyId();
    const [activeTab, setActiveTab] = useState('overview');
    // Fetch journal hub summary
    const { data: summaryData, isLoading: summaryLoading } = useQuery({
        queryKey: ['journal-hub-summary', currentCompanyId],
        queryFn: () => apiService.getJournalSummary({ companyId: currentCompanyId }),
        enabled: !!currentCompanyId && isAuthenticated
    });
    // Fetch recent entries
    const { data: recentEntries, isLoading: entriesLoading } = useQuery({
        queryKey: ['journal-recent-entries', currentCompanyId],
        queryFn: () => apiService.getJournalEntries({
            pageSize: 5,
            sortBy: 'createdAt',
            sortOrder: 'desc'
        }),
        enabled: !!currentCompanyId && isAuthenticated && showRecentEntries
    });
    // Fetch pending approvals
    const { data: pendingApprovals, isLoading: approvalsLoading } = useQuery({
        queryKey: ['journal-pending-approvals', currentCompanyId],
        queryFn: () => apiService.getPendingApprovals(),
        enabled: !!currentCompanyId && isAuthenticated
    });
    const handleNavigate = (path) => {
        if (onNavigate) {
            onNavigate(path);
        }
        else {
            window.location.href = path;
        }
    };
    const getStatusIcon = (status) => {
        switch (status) {
            case 'POSTED':
                return _jsx(CheckCircle, { className: "w-4 h-4 text-green-500" });
            case 'DRAFT':
                return _jsx(Edit, { className: "w-4 h-4 text-blue-500" });
            case 'PENDING_APPROVAL':
                return _jsx(Clock, { className: "w-4 h-4 text-yellow-500" });
            case 'REVERSED':
                return _jsx(AlertCircle, { className: "w-4 h-4 text-red-500" });
            default:
                return _jsx(FileText, { className: "w-4 h-4 text-gray-500" });
        }
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'POSTED':
                return 'bg-green-100 text-green-800';
            case 'DRAFT':
                return 'bg-blue-100 text-blue-800';
            case 'PENDING_APPROVAL':
                return 'bg-yellow-100 text-yellow-800';
            case 'REVERSED':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };
    if (!isAuthenticated) {
        return null;
    }
    return (_jsxs("div", { className: "space-y-6", children: [showSummary && (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Total Entries" }), _jsx("p", { className: "text-2xl font-bold", children: summaryLoading ? '...' : summaryData?.totalEntries || 0 })] }), _jsx(BookOpen, { className: "w-8 h-8 text-blue-500" })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Pending Approval" }), _jsx("p", { className: "text-2xl font-bold text-yellow-600", children: approvalsLoading ? '...' : pendingApprovals?.pendingApprovals?.length || 0 })] }), _jsx(Clock, { className: "w-8 h-8 text-yellow-500" })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Draft Entries" }), _jsx("p", { className: "text-2xl font-bold text-blue-600", children: summaryLoading ? '...' : summaryData?.draftEntries || 0 })] }), _jsx(Edit, { className: "w-8 h-8 text-blue-500" })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Posted Today" }), _jsx("p", { className: "text-2xl font-bold text-green-600", children: summaryLoading ? '...' : summaryData?.postedToday || 0 })] }), _jsx(CheckCircle, { className: "w-8 h-8 text-green-500" })] }) }) })] })), _jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, className: "w-full", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-3", children: [_jsx(TabsTrigger, { value: "overview", children: "Overview" }), _jsx(TabsTrigger, { value: "recent", children: "Recent Entries" }), _jsx(TabsTrigger, { value: "approvals", children: "Approvals" })] }), _jsx(TabsContent, { value: "overview", className: "space-y-4", children: _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [showQuickActions && (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Zap, { className: "w-5 h-5" }), "Quick Actions"] }) }), _jsxs(CardContent, { className: "space-y-3", children: [_jsxs(Button, { onClick: () => handleNavigate('/dashboard/journal-hub'), className: "w-full justify-start", variant: "outline", children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), "Create New Entry"] }), _jsxs(Button, { onClick: () => handleNavigate('/dashboard/journal-hub?tab=templates'), className: "w-full justify-start", variant: "outline", children: [_jsx(FileText, { className: "w-4 h-4 mr-2" }), "Use Template"] }), _jsxs(Button, { onClick: () => handleNavigate('/dashboard/enhanced-journal-management'), className: "w-full justify-start", variant: "outline", children: [_jsx(BookOpen, { className: "w-4 h-4 mr-2" }), "Smart Journal Management"] }), _jsxs(Button, { onClick: () => handleNavigate('/dashboard/journal-hub?tab=reports'), className: "w-full justify-start", variant: "outline", children: [_jsx(BarChart3, { className: "w-4 h-4 mr-2" }), "View Reports"] })] })] })), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(TrendingUp, { className: "w-5 h-5" }), "Entry Types"] }) }), _jsx(CardContent, { children: summaryLoading ? (_jsx("div", { className: "flex items-center justify-center py-4", children: _jsx(RefreshCw, { className: "w-4 h-4 animate-spin" }) })) : (_jsx("div", { className: "space-y-2", children: summaryData?.entryTypes?.map((type) => (_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: type.name }), _jsx(Badge, { variant: "secondary", children: type.count })] }, type.id))) || (_jsx("p", { className: "text-sm text-gray-500", children: "No entry types found" })) })) })] })] }) }), _jsx(TabsContent, { value: "recent", className: "space-y-4", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center justify-between", children: [_jsxs("span", { className: "flex items-center gap-2", children: [_jsx(Clock, { className: "w-5 h-5" }), "Recent Journal Entries"] }), _jsxs(Button, { variant: "outline", size: "sm", onClick: () => handleNavigate('/dashboard/journal-hub'), children: ["View All", _jsx(ExternalLink, { className: "w-4 h-4 ml-1" })] })] }) }), _jsx(CardContent, { children: entriesLoading ? (_jsx("div", { className: "flex items-center justify-center py-4", children: _jsx(RefreshCw, { className: "w-4 h-4 animate-spin" }) })) : (_jsx("div", { className: "space-y-3", children: recentEntries?.entries?.map((entry) => (_jsxs("div", { className: "flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50", children: [_jsxs("div", { className: "flex items-center gap-3", children: [getStatusIcon(entry.status), _jsxs("div", { children: [_jsx("p", { className: "font-medium text-sm", children: entry.reference }), _jsx("p", { className: "text-xs text-gray-500", children: entry.memo }), _jsxs("p", { className: "text-xs text-gray-400", children: [new Date(entry.date).toLocaleDateString(), entry.entryType && ` • ${entry.entryType.name}`] })] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Badge, { className: getStatusColor(entry.status), children: entry.status.replace('_', ' ') }), _jsxs("span", { className: "text-sm font-medium", children: ["$", entry.totalAmount.toFixed(2)] })] })] }, entry.id))) || (_jsx("p", { className: "text-sm text-gray-500 text-center py-4", children: "No recent entries found" })) })) })] }) }), _jsx(TabsContent, { value: "approvals", className: "space-y-4", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center justify-between", children: [_jsxs("span", { className: "flex items-center gap-2", children: [_jsx(Clock, { className: "w-5 h-5" }), "Pending Approvals"] }), _jsxs(Button, { variant: "outline", size: "sm", onClick: () => handleNavigate('/dashboard/journal-hub?tab=approvals'), children: ["View All", _jsx(ExternalLink, { className: "w-4 h-4 ml-1" })] })] }) }), _jsx(CardContent, { children: approvalsLoading ? (_jsx("div", { className: "flex items-center justify-center py-4", children: _jsx(RefreshCw, { className: "w-4 h-4 animate-spin" }) })) : (_jsx("div", { className: "space-y-3", children: (pendingApprovals?.pendingApprovals || [])?.map((approval) => (_jsxs("div", { className: "flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Clock, { className: "w-4 h-4 text-yellow-500" }), _jsxs("div", { children: [_jsx("p", { className: "font-medium text-sm", children: approval.entry?.reference }), _jsx("p", { className: "text-xs text-gray-500", children: approval.entry?.memo }), _jsxs("p", { className: "text-xs text-gray-400", children: ["Requested by ", approval.requestedBy?.name] })] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Badge, { className: "bg-yellow-100 text-yellow-800", children: "Pending" }), _jsx(Button, { size: "sm", variant: "outline", children: _jsx(Eye, { className: "w-4 h-4" }) })] })] }, approval.id))) || (_jsx("p", { className: "text-sm text-gray-500 text-center py-4", children: "No pending approvals" })) })) })] }) })] })] }));
}
