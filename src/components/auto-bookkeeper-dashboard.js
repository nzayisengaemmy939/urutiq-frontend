import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bot, Settings, TrendingUp, Activity, CheckCircle, AlertTriangle, Clock, Zap, Play, RefreshCw, BarChart3, Target, Lightbulb, Edit, Plus } from 'lucide-react';
// API Functions
const api = {
    getConfig: async (companyId) => {
        const response = await fetch(`/api/auto-bookkeeper/config/${companyId}`);
        return response.json();
    },
    updateConfig: async (companyId, updates) => {
        const response = await fetch(`/api/auto-bookkeeper/config/${companyId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
        });
        return response.json();
    },
    initialize: async (companyId) => {
        const response = await fetch(`/api/auto-bookkeeper/initialize/${companyId}`, {
            method: 'POST'
        });
        return response.json();
    },
    getStats: async (companyId, periodDays) => {
        const params = new URLSearchParams();
        if (periodDays)
            params.append('periodDays', periodDays.toString());
        const response = await fetch(`/api/auto-bookkeeper/stats/${companyId}?${params}`);
        return response.json();
    },
    getInsights: async (companyId) => {
        const response = await fetch(`/api/auto-bookkeeper/insights/${companyId}`);
        return response.json();
    },
    getDashboard: async (companyId) => {
        const response = await fetch(`/api/auto-bookkeeper/dashboard/${companyId}`);
        return response.json();
    },
    processPending: async (companyId) => {
        const response = await fetch(`/api/auto-bookkeeper/process-pending/${companyId}`, {
            method: 'POST'
        });
        return response.json();
    },
    categorizeTransaction: async (transactionId, companyId, forceAuto) => {
        const response = await fetch(`/api/auto-bookkeeper/categorize/${transactionId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ companyId, forceAuto })
        });
        return response.json();
    },
    generateJournalEntry: async (transactionId, companyId, forceAuto) => {
        const response = await fetch(`/api/auto-bookkeeper/journal-entry/${transactionId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ companyId, forceAuto })
        });
        return response.json();
    },
    reconcileTransaction: async (bankTransactionId, companyId, forceAuto) => {
        const response = await fetch(`/api/auto-bookkeeper/reconcile/${bankTransactionId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ companyId, forceAuto })
        });
        return response.json();
    }
};
// Auto-Bookkeeper Dashboard Component
export const AutoBookkeeperDashboard = ({ companyId }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [selectedPeriod, setSelectedPeriod] = useState(30);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showConfigModal, setShowConfigModal] = useState(false);
    const [editingRule, setEditingRule] = useState(null);
    const queryClient = useQueryClient();
    // Queries
    const { data: config, isLoading: configLoading } = useQuery({
        queryKey: ['autoBookkeeperConfig', companyId],
        queryFn: () => api.getConfig(companyId),
        enabled: activeTab === 'configuration'
    });
    const { data: stats, isLoading: statsLoading } = useQuery({
        queryKey: ['autoBookkeeperStats', companyId, selectedPeriod],
        queryFn: () => api.getStats(companyId, selectedPeriod),
        enabled: activeTab === 'overview'
    });
    const { data: insights, isLoading: insightsLoading } = useQuery({
        queryKey: ['autoBookkeeperInsights', companyId],
        queryFn: () => api.getInsights(companyId),
        enabled: activeTab === 'insights'
    });
    const { data: dashboard, isLoading: dashboardLoading } = useQuery({
        queryKey: ['autoBookkeeperDashboard', companyId],
        queryFn: () => api.getDashboard(companyId),
        enabled: activeTab === 'overview'
    });
    // Mutations
    const updateConfigMutation = useMutation({
        mutationFn: ({ updates }) => api.updateConfig(companyId, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['autoBookkeeperConfig', companyId] });
        }
    });
    const processPendingMutation = useMutation({
        mutationFn: () => api.processPending(companyId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['autoBookkeeperStats', companyId] });
            queryClient.invalidateQueries({ queryKey: ['autoBookkeeperDashboard', companyId] });
            queryClient.invalidateQueries({ queryKey: ['autoBookkeeperInsights', companyId] });
        }
    });
    // Tab Navigation
    const tabs = [
        { id: 'overview', label: 'Overview', icon: Activity },
        { id: 'configuration', label: 'Configuration', icon: Settings },
        { id: 'activity', label: 'Activity', icon: BarChart3 },
        { id: 'insights', label: 'Insights', icon: Lightbulb }
    ];
    // Handle configuration updates
    const handleConfigUpdate = (updates) => {
        updateConfigMutation.mutate({ updates });
    };
    // Handle process pending transactions
    const handleProcessPending = () => {
        setIsProcessing(true);
        processPendingMutation.mutate(undefined, {
            onSettled: () => {
                setIsProcessing(false);
            }
        });
    };
    return (_jsxs("div", { className: "min-h-screen bg-gray-50", children: [_jsx("div", { className: "bg-white shadow-sm border-b", children: _jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: [_jsxs("div", { className: "flex justify-between items-center py-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Auto-Bookkeeper Dashboard" }), _jsx("p", { className: "text-gray-600 mt-1", children: "Intelligent automation for day-to-day accounting tasks" })] }), _jsxs("div", { className: "flex items-center space-x-3", children: [_jsxs("div", { className: "flex items-center space-x-2 text-sm text-gray-500", children: [_jsx(Bot, { className: "w-4 h-4" }), _jsx("span", { children: "AI Powered" })] }), config?.data?.isEnabled && (_jsxs("div", { className: "flex items-center space-x-2 text-sm text-green-600", children: [_jsx(CheckCircle, { className: "w-4 h-4" }), _jsx("span", { children: "Active" })] }))] })] }), _jsx("div", { className: "flex space-x-8", children: tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (_jsxs("button", { onClick: () => setActiveTab(tab.id), className: `flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                                        ? 'border-teal-500 text-teal-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`, children: [_jsx(Icon, { className: "w-4 h-4" }), _jsx("span", { children: tab.label })] }, tab.id));
                            }) })] }) }), _jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: [activeTab === 'overview' && (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900", children: "Auto-Bookkeeper Status" }), _jsxs("div", { className: "flex items-center space-x-3", children: [_jsxs("select", { value: selectedPeriod, onChange: (e) => setSelectedPeriod(Number(e.target.value)), className: "border border-gray-300 rounded-md px-3 py-1 text-sm", children: [_jsx("option", { value: 7, children: "Last 7 days" }), _jsx("option", { value: 30, children: "Last 30 days" }), _jsx("option", { value: 90, children: "Last 90 days" })] }), _jsxs("button", { onClick: handleProcessPending, disabled: isProcessing || !config?.data?.isEnabled, className: "bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed", children: [isProcessing ? (_jsx(RefreshCw, { className: "w-4 h-4 animate-spin inline mr-2" })) : (_jsx(Play, { className: "w-4 h-4 inline mr-2" })), isProcessing ? 'Processing...' : 'Process Pending'] })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4 mb-6", children: [_jsxs("div", { className: "flex items-center p-4 bg-green-50 rounded-lg", children: [_jsx("div", { className: "p-2 bg-green-100 rounded-lg", children: _jsx(CheckCircle, { className: "w-6 h-6 text-green-600" }) }), _jsxs("div", { className: "ml-4", children: [_jsx("p", { className: "text-sm font-medium text-gray-500", children: "Status" }), _jsx("p", { className: "text-lg font-bold text-gray-900", children: config?.data?.isEnabled ? 'Active' : 'Inactive' })] })] }), _jsxs("div", { className: "flex items-center p-4 bg-blue-50 rounded-lg", children: [_jsx("div", { className: "p-2 bg-blue-100 rounded-lg", children: _jsx(Zap, { className: "w-6 h-6 text-blue-600" }) }), _jsxs("div", { className: "ml-4", children: [_jsx("p", { className: "text-sm font-medium text-gray-500", children: "Automation Rate" }), _jsx("p", { className: "text-lg font-bold text-gray-900", children: stats?.data?.automationRate ? `${(stats.data.automationRate * 100).toFixed(1)}%` : '0%' })] })] }), _jsxs("div", { className: "flex items-center p-4 bg-purple-50 rounded-lg", children: [_jsx("div", { className: "p-2 bg-purple-100 rounded-lg", children: _jsx(Target, { className: "w-6 h-6 text-purple-600" }) }), _jsxs("div", { className: "ml-4", children: [_jsx("p", { className: "text-sm font-medium text-gray-500", children: "Accuracy" }), _jsx("p", { className: "text-lg font-bold text-gray-900", children: stats?.data?.accuracy ? `${(stats.data.accuracy * 100).toFixed(1)}%` : '95%' })] })] }), _jsxs("div", { className: "flex items-center p-4 bg-orange-50 rounded-lg", children: [_jsx("div", { className: "p-2 bg-orange-100 rounded-lg", children: _jsx(Clock, { className: "w-6 h-6 text-orange-600" }) }), _jsxs("div", { className: "ml-4", children: [_jsx("p", { className: "text-sm font-medium text-gray-500", children: "Time Saved" }), _jsx("p", { className: "text-lg font-bold text-gray-900", children: stats?.data?.timeSaved ? `${Math.round(stats.data.timeSaved)} min` : '0 min' })] })] })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [_jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900", children: "Transactions" }), _jsx(TrendingUp, { className: "w-5 h-5 text-gray-400" })] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-sm text-gray-500", children: "Total" }), _jsx("span", { className: "font-medium", children: stats?.data?.totalTransactions || 0 })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-sm text-gray-500", children: "Auto-Categorized" }), _jsx("span", { className: "font-medium text-green-600", children: stats?.data?.autoCategorized || 0 })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-sm text-gray-500", children: "Auto-Journal Entries" }), _jsx("span", { className: "font-medium text-blue-600", children: stats?.data?.autoJournalEntries || 0 })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-sm text-gray-500", children: "Auto-Reconciled" }), _jsx("span", { className: "font-medium text-purple-600", children: stats?.data?.autoReconciled || 0 })] })] })] }), _jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900", children: "Performance" }), _jsx(BarChart3, { className: "w-5 h-5 text-gray-400" })] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-sm text-gray-500", children: "Learning Progress" }), _jsx("span", { className: "font-medium", children: stats?.data?.learningProgress ? `${(stats.data.learningProgress * 100).toFixed(1)}%` : '0%' })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-sm text-gray-500", children: "Efficiency" }), _jsx("span", { className: "font-medium text-green-600", children: "High" })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-sm text-gray-500", children: "Error Rate" }), _jsx("span", { className: "font-medium text-red-600", children: "Low" })] })] })] }), _jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900", children: "Pending Items" }), _jsx(AlertTriangle, { className: "w-5 h-5 text-gray-400" })] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-sm text-gray-500", children: "Categorizations" }), _jsx("span", { className: "font-medium text-orange-600", children: dashboard?.data?.pendingItems?.categorizations || 0 })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-sm text-gray-500", children: "Reconciliations" }), _jsx("span", { className: "font-medium text-orange-600", children: dashboard?.data?.pendingItems?.reconciliations || 0 })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-sm text-gray-500", children: "Total Pending" }), _jsx("span", { className: "font-medium text-red-600", children: (dashboard?.data?.pendingItems?.categorizations || 0) + (dashboard?.data?.pendingItems?.reconciliations || 0) })] })] })] })] }), dashboard?.data?.recentActivity && (_jsxs("div", { className: "bg-white rounded-lg shadow", children: [_jsx("div", { className: "px-6 py-4 border-b border-gray-200", children: _jsx("h3", { className: "text-lg font-semibold text-gray-900", children: "Recent Activity" }) }), _jsx("div", { className: "p-6", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsx("h4", { className: "font-medium text-gray-900 mb-3", children: "Recent Categorizations" }), _jsx("div", { className: "space-y-2", children: dashboard.data.recentActivity.categorizations?.slice(0, 5).map((cat) => (_jsxs("div", { className: "flex items-center justify-between p-2 bg-gray-50 rounded", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium", children: cat.transaction?.description || 'Unknown' }), _jsx("p", { className: "text-xs text-gray-500", children: cat.suggestedCategory })] }), _jsxs("span", { className: "text-xs bg-green-100 text-green-800 px-2 py-1 rounded", children: [Math.round(cat.confidence * 100), "%"] })] }, cat.id))) })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-medium text-gray-900 mb-3", children: "Recent Reconciliations" }), _jsx("div", { className: "space-y-2", children: dashboard.data.recentActivity.reconciliations?.slice(0, 5).map((rec) => (_jsxs("div", { className: "flex items-center justify-between p-2 bg-gray-50 rounded", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium", children: rec.bankTransaction?.description || 'Unknown' }), _jsx("p", { className: "text-xs text-gray-500", children: rec.matchType })] }), _jsx("span", { className: `text-xs px-2 py-1 rounded ${rec.status === 'matched' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`, children: rec.status })] }, rec.id))) })] })] }) })] }))] })), activeTab === 'configuration' && (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900", children: "Auto-Bookkeeper Configuration" }), _jsxs("button", { onClick: () => setShowConfigModal(true), className: "bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700", children: [_jsx(Edit, { className: "w-4 h-4 inline mr-2" }), "Edit Configuration"] })] }), configLoading ? (_jsxs("div", { className: "text-center py-8", children: [_jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto" }), _jsx("p", { className: "mt-2 text-sm text-gray-500", children: "Loading configuration..." })] })) : config?.data ? (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-medium text-gray-900 mb-3", children: "General Settings" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm text-gray-500", children: "Status" }), _jsx("span", { className: `text-sm font-medium ${config.data.isEnabled ? 'text-green-600' : 'text-red-600'}`, children: config.data.isEnabled ? 'Enabled' : 'Disabled' })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm text-gray-500", children: "Automation Level" }), _jsx("span", { className: "text-sm font-medium capitalize", children: config.data.automationLevel })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm text-gray-500", children: "Confidence Threshold" }), _jsxs("span", { className: "text-sm font-medium", children: [Math.round(config.data.confidenceThreshold * 100), "%"] })] })] })] }), _jsxs("div", { children: [_jsx("h3", { className: "font-medium text-gray-900 mb-3", children: "Automation Features" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm text-gray-500", children: "Auto-Categorization" }), _jsx("span", { className: `text-sm font-medium ${config.data.autoCategorization ? 'text-green-600' : 'text-red-600'}`, children: config.data.autoCategorization ? 'Enabled' : 'Disabled' })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm text-gray-500", children: "Auto-Journal Entry" }), _jsx("span", { className: `text-sm font-medium ${config.data.autoJournalEntry ? 'text-green-600' : 'text-red-600'}`, children: config.data.autoJournalEntry ? 'Enabled' : 'Disabled' })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm text-gray-500", children: "Auto-Reconciliation" }), _jsx("span", { className: `text-sm font-medium ${config.data.autoReconciliation ? 'text-green-600' : 'text-red-600'}`, children: config.data.autoReconciliation ? 'Enabled' : 'Disabled' })] })] })] })] })) : (_jsxs("div", { className: "text-center py-8", children: [_jsx(Bot, { className: "mx-auto h-12 w-12 text-gray-400" }), _jsx("p", { className: "mt-2 text-sm text-gray-500", children: "No configuration found" })] }))] }), _jsxs("div", { className: "bg-white rounded-lg shadow", children: [_jsx("div", { className: "px-6 py-4 border-b border-gray-200", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900", children: "Automation Rules" }), _jsxs("button", { onClick: () => setEditingRule({}), className: "bg-teal-600 text-white px-3 py-1 rounded-md hover:bg-teal-700 text-sm", children: [_jsx(Plus, { className: "w-4 h-4 inline mr-1" }), "Add Rule"] })] }) }), _jsx("div", { className: "p-6", children: config?.data?.rules?.length > 0 ? (_jsx("div", { className: "space-y-4", children: config.data.rules.map((rule) => (_jsxs("div", { className: "border rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("h4", { className: "font-medium text-gray-900", children: rule.name }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("span", { className: `text-xs px-2 py-1 rounded ${rule.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`, children: rule.isActive ? 'Active' : 'Inactive' }), _jsx("button", { onClick: () => setEditingRule(rule), className: "text-gray-400 hover:text-gray-600", children: _jsx(Edit, { className: "w-4 h-4" }) })] })] }), _jsx("p", { className: "text-sm text-gray-600 mb-2", children: rule.description }), _jsxs("div", { className: "text-xs text-gray-500", children: [_jsxs("div", { children: ["Condition: ", rule.condition] }), _jsxs("div", { children: ["Action: ", rule.action] }), _jsxs("div", { children: ["Priority: ", rule.priority] })] })] }, rule.id))) })) : (_jsxs("div", { className: "text-center py-8", children: [_jsx(Settings, { className: "mx-auto h-12 w-12 text-gray-400" }), _jsx("p", { className: "mt-2 text-sm text-gray-500", children: "No automation rules configured" })] })) })] })] })), activeTab === 'insights' && (_jsx("div", { className: "space-y-6", children: _jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900", children: "AI Insights" }), _jsxs("button", { onClick: () => queryClient.invalidateQueries({ queryKey: ['autoBookkeeperInsights', companyId] }), className: "bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700", children: [_jsx(RefreshCw, { className: "w-4 h-4 inline mr-2" }), "Refresh Insights"] })] }), insightsLoading ? (_jsxs("div", { className: "text-center py-8", children: [_jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto" }), _jsx("p", { className: "mt-2 text-sm text-gray-500", children: "Loading insights..." })] })) : insights?.data?.length > 0 ? (_jsx("div", { className: "space-y-4", children: insights.data.map((insight) => (_jsxs("div", { className: "border rounded-lg p-4", children: [_jsxs("div", { className: "flex items-start justify-between mb-2", children: [_jsxs("div", { children: [_jsx("h4", { className: "font-medium text-gray-900", children: insight.title }), _jsx("p", { className: "text-sm text-gray-600 mt-1", children: insight.description })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsxs("span", { className: "text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded", children: [Math.round(insight.confidence * 100), "% confidence"] }), _jsxs("span", { className: `text-xs px-2 py-1 rounded ${insight.impact === 'high' ? 'bg-red-100 text-red-800' :
                                                                    insight.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                                                        'bg-green-100 text-green-800'}`, children: [insight.impact, " impact"] })] })] }), _jsxs("div", { className: "mt-3", children: [_jsx("h5", { className: "text-sm font-medium text-gray-700 mb-2", children: "Recommendations:" }), _jsx("ul", { className: "space-y-1", children: insight.recommendations.map((rec, index) => (_jsxs("li", { className: "text-sm text-gray-600 flex items-start", children: [_jsx("span", { className: "text-teal-500 mr-2 mt-1", children: "\u2022" }), rec] }, index))) })] })] }, insight.id))) })) : (_jsxs("div", { className: "text-center py-8", children: [_jsx(Lightbulb, { className: "mx-auto h-12 w-12 text-gray-400" }), _jsx("p", { className: "mt-2 text-sm text-gray-500", children: "No insights available" })] }))] }) }))] })] }));
};
