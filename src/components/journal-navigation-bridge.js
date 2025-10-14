import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { BookOpen, ArrowRight, Plus, Edit, CheckCircle, Clock, FileText, Zap, RefreshCw, ExternalLink, Brain, Activity } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import apiService from '../lib/api';
import { useAuth } from '../contexts/auth-context';
import { getCompanyId } from '../lib/config';
export function JournalNavigationBridge({ companyId, onNavigate, showQuickStats = true, showRecentActivity = true, compact = false }) {
    const { isAuthenticated } = useAuth();
    const currentCompanyId = companyId || getCompanyId();
    const [activeView, setActiveView] = useState('overview');
    // Fetch quick stats
    const { data: statsData, isLoading: statsLoading } = useQuery({
        queryKey: ['journal-quick-stats', currentCompanyId],
        queryFn: () => apiService.getJournalSummary({ companyId: currentCompanyId }),
        enabled: !!currentCompanyId && isAuthenticated && showQuickStats
    });
    // Fetch recent activity
    const { data: activityData, isLoading: activityLoading } = useQuery({
        queryKey: ['journal-recent-activity', currentCompanyId],
        queryFn: async () => {
            const [entries, approvals] = await Promise.all([
                apiService.getJournalEntries({
                    pageSize: 3,
                    sortBy: 'createdAt',
                    sortOrder: 'desc'
                }),
                apiService.getPendingApprovals()
            ]);
            return {
                entries: entries.entries || [],
                approvals: approvals || []
            };
        },
        enabled: !!currentCompanyId && isAuthenticated && showRecentActivity
    });
    const handleNavigate = (path) => {
        if (onNavigate) {
            onNavigate(path);
        }
        else {
            window.location.href = path;
        }
    };
    const getActivityIcon = (type) => {
        switch (type) {
            case 'entry_created':
                return _jsx(Plus, { className: "w-4 h-4 text-blue-500" });
            case 'entry_posted':
                return _jsx(CheckCircle, { className: "w-4 h-4 text-green-500" });
            case 'approval_requested':
                return _jsx(Clock, { className: "w-4 h-4 text-yellow-500" });
            case 'template_used':
                return _jsx(FileText, { className: "w-4 h-4 text-purple-500" });
            default:
                return _jsx(Activity, { className: "w-4 h-4 text-gray-500" });
        }
    };
    const getActivityColor = (type) => {
        switch (type) {
            case 'entry_created':
                return 'bg-blue-100 text-blue-800';
            case 'entry_posted':
                return 'bg-green-100 text-green-800';
            case 'approval_requested':
                return 'bg-yellow-100 text-yellow-800';
            case 'template_used':
                return 'bg-purple-100 text-purple-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };
    if (!isAuthenticated) {
        return null;
    }
    if (compact) {
        return (_jsx(Card, { className: "w-full", children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(BookOpen, { className: "w-5 h-5 text-blue-500" }), _jsxs("div", { children: [_jsx("p", { className: "font-medium text-sm", children: "Journal Entries Hub" }), _jsx("p", { className: "text-xs text-gray-500", children: statsLoading ? 'Loading...' : `${statsData?.totalEntries || 0} entries` })] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [statsData?.pendingApprovals > 0 && (_jsxs(Badge, { className: "bg-yellow-100 text-yellow-800", children: [statsData.pendingApprovals, " pending"] })), _jsx(Button, { size: "sm", onClick: () => handleNavigate('/dashboard/journal-hub'), children: _jsx(ArrowRight, { className: "w-4 h-4" }) })] })] }) }) }));
    }
    return (_jsxs("div", { className: "space-y-6", children: [showQuickStats && (_jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [_jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Total Entries" }), _jsx("p", { className: "text-2xl font-bold", children: statsLoading ? '...' : statsData?.totalEntries || 0 })] }), _jsx(BookOpen, { className: "w-8 h-8 text-blue-500" })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Pending" }), _jsx("p", { className: "text-2xl font-bold text-yellow-600", children: statsLoading ? '...' : statsData?.pendingApprovals || 0 })] }), _jsx(Clock, { className: "w-8 h-8 text-yellow-500" })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Drafts" }), _jsx("p", { className: "text-2xl font-bold text-blue-600", children: statsLoading ? '...' : statsData?.draftEntries || 0 })] }), _jsx(Edit, { className: "w-8 h-8 text-blue-500" })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Posted Today" }), _jsx("p", { className: "text-2xl font-bold text-green-600", children: statsLoading ? '...' : statsData?.postedToday || 0 })] }), _jsx(CheckCircle, { className: "w-8 h-8 text-green-500" })] }) }) })] })), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: [_jsx(Card, { className: "hover:shadow-md transition-shadow cursor-pointer", onClick: () => handleNavigate('/dashboard/journal-hub'), children: _jsxs(CardContent, { className: "p-6", children: [_jsxs("div", { className: "flex items-center gap-3 mb-4", children: [_jsx(BookOpen, { className: "w-8 h-8 text-blue-500" }), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-lg", children: "Journal Entries Hub" }), _jsx("p", { className: "text-sm text-gray-600", children: "Centralized journal management" })] })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm text-gray-500", children: "Complete journal workflow" }), _jsx(ArrowRight, { className: "w-4 h-4 text-gray-400" })] })] }) }), _jsx(Card, { className: "hover:shadow-md transition-shadow cursor-pointer", onClick: () => handleNavigate('/dashboard/enhanced-journal-management'), children: _jsxs(CardContent, { className: "p-6", children: [_jsxs("div", { className: "flex items-center gap-3 mb-4", children: [_jsx(Brain, { className: "w-8 h-8 text-purple-500" }), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-lg", children: "Smart Journal" }), _jsx("p", { className: "text-sm text-gray-600", children: "AI-powered journal creation" })] })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm text-gray-500", children: "AI assistance & automation" }), _jsx(ArrowRight, { className: "w-4 h-4 text-gray-400" })] })] }) }), _jsx(Card, { className: "hover:shadow-md transition-shadow", children: _jsxs(CardContent, { className: "p-6", children: [_jsxs("div", { className: "flex items-center gap-3 mb-4", children: [_jsx(Zap, { className: "w-8 h-8 text-orange-500" }), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-lg", children: "Quick Actions" }), _jsx("p", { className: "text-sm text-gray-600", children: "Fast journal operations" })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs(Button, { size: "sm", variant: "outline", className: "w-full justify-start", onClick: () => handleNavigate('/dashboard/journal-hub?action=create'), children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), "New Entry"] }), _jsxs(Button, { size: "sm", variant: "outline", className: "w-full justify-start", onClick: () => handleNavigate('/dashboard/journal-hub?tab=templates'), children: [_jsx(FileText, { className: "w-4 h-4 mr-2" }), "Use Template"] })] })] }) })] }), showRecentActivity && (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center justify-between", children: [_jsxs("span", { className: "flex items-center gap-2", children: [_jsx(Activity, { className: "w-5 h-5" }), "Recent Activity"] }), _jsxs(Button, { variant: "outline", size: "sm", onClick: () => handleNavigate('/dashboard/journal-hub'), children: ["View All", _jsx(ExternalLink, { className: "w-4 h-4 ml-1" })] })] }) }), _jsx(CardContent, { children: activityLoading ? (_jsx("div", { className: "flex items-center justify-center py-4", children: _jsx(RefreshCw, { className: "w-4 h-4 animate-spin" }) })) : (_jsx("div", { className: "space-y-3", children: activityData?.entries?.map((entry) => (_jsxs("div", { className: "flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Plus, { className: "w-4 h-4 text-blue-500" }), _jsxs("div", { children: [_jsx("p", { className: "font-medium text-sm", children: entry.reference }), _jsx("p", { className: "text-xs text-gray-500", children: entry.memo }), _jsx("p", { className: "text-xs text-gray-400", children: new Date(entry.createdAt).toLocaleDateString() })] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Badge, { className: entry.status === 'POSTED' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800', children: entry.status }), _jsxs("span", { className: "text-sm font-medium", children: ["$", entry.totalAmount?.toFixed(2) || '0.00'] })] })] }, entry.id))) || (_jsx("p", { className: "text-sm text-gray-500 text-center py-4", children: "No recent activity" })) })) })] }))] }));
}
