import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BarChart3, TrendingUp, Target, Gauge, Plus, RefreshCw, Eye, Zap, ChevronUp, ChevronDown, Minus } from 'lucide-react';
// API Functions
const api = {
    getStats: async (companyId) => {
        const response = await fetch(`/api/advanced-analytics/stats/${companyId}`);
        return response.json();
    },
    getPredictiveModels: async (companyId) => {
        const response = await fetch(`/api/advanced-analytics/predictive-models/${companyId}`);
        return response.json();
    },
    trainModel: async (modelId) => {
        const response = await fetch(`/api/advanced-analytics/predictive-models/${modelId}/train`, {
            method: 'POST'
        });
        return response.json();
    },
    getDashboards: async (companyId, userId) => {
        const response = await fetch(`/api/advanced-analytics/dashboards/${companyId}/${userId}`);
        return response.json();
    },
    createDashboard: async (companyId, userId, data) => {
        const response = await fetch(`/api/advanced-analytics/dashboards/${companyId}/${userId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return response.json();
    },
    getRealTimeMetrics: async (companyId) => {
        const response = await fetch(`/api/advanced-analytics/real-time-metrics/${companyId}`);
        return response.json();
    },
    getInsights: async (companyId) => {
        const response = await fetch(`/api/advanced-analytics/insights/${companyId}`);
        return response.json();
    },
    generateInsights: async (companyId) => {
        const response = await fetch(`/api/advanced-analytics/insights/${companyId}/generate`, {
            method: 'POST'
        });
        return response.json();
    },
    getBenchmarks: async (companyId) => {
        const response = await fetch(`/api/advanced-analytics/benchmarks/${companyId}`);
        return response.json();
    },
    getDashboardTemplates: async () => {
        const response = await fetch('/api/advanced-analytics/dashboard-templates');
        return response.json();
    },
    getWidgetTemplates: async () => {
        const response = await fetch('/api/advanced-analytics/widget-templates');
        return response.json();
    }
};
// Advanced Analytics Dashboard Component
export const AdvancedAnalyticsDashboard = ({ companyId, userId }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [selectedDashboard, setSelectedDashboard] = useState(null);
    const [showCreateDashboard, setShowCreateDashboard] = useState(false);
    const queryClient = useQueryClient();
    // Queries
    const { data: stats, isLoading: statsLoading } = useQuery({
        queryKey: ['analyticsStats', companyId],
        queryFn: () => api.getStats(companyId)
    });
    const { data: models, isLoading: modelsLoading } = useQuery({
        queryKey: ['predictiveModels', companyId],
        queryFn: () => api.getPredictiveModels(companyId)
    });
    const { data: dashboards, isLoading: dashboardsLoading } = useQuery({
        queryKey: ['dashboards', companyId, userId],
        queryFn: () => api.getDashboards(companyId, userId)
    });
    const { data: metrics, isLoading: metricsLoading } = useQuery({
        queryKey: ['realTimeMetrics', companyId],
        queryFn: () => api.getRealTimeMetrics(companyId),
        refetchInterval: 30000 // Refresh every 30 seconds
    });
    const { data: insights, isLoading: insightsLoading } = useQuery({
        queryKey: ['insights', companyId],
        queryFn: () => api.getInsights(companyId)
    });
    const { data: benchmarks, isLoading: benchmarksLoading } = useQuery({
        queryKey: ['benchmarks', companyId],
        queryFn: () => api.getBenchmarks(companyId)
    });
    const { data: dashboardTemplates } = useQuery({
        queryKey: ['dashboardTemplates'],
        queryFn: () => api.getDashboardTemplates()
    });
    // Mutations
    const trainModelMutation = useMutation({
        mutationFn: ({ modelId }) => api.trainModel(modelId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['predictiveModels', companyId] });
        }
    });
    const generateInsightsMutation = useMutation({
        mutationFn: () => api.generateInsights(companyId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['insights', companyId] });
        }
    });
    const createDashboardMutation = useMutation({
        mutationFn: ({ data }) => api.createDashboard(companyId, userId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dashboards', companyId, userId] });
            setShowCreateDashboard(false);
        }
    });
    // Tab Navigation
    const tabs = [
        { id: 'overview', label: 'Overview', icon: BarChart3 },
        { id: 'predictive', label: 'Predictive Analytics', icon: TrendingUp },
        { id: 'dashboards', label: 'Dashboards', icon: Target },
        { id: 'insights', label: 'Insights', icon: Eye },
        { id: 'benchmarks', label: 'Benchmarks', icon: Gauge }
    ];
    const getTrendIcon = (trend) => {
        switch (trend) {
            case 'up': return _jsx(ChevronUp, { className: "w-4 h-4 text-green-600" });
            case 'down': return _jsx(ChevronDown, { className: "w-4 h-4 text-red-600" });
            default: return _jsx(Minus, { className: "w-4 h-4 text-gray-600" });
        }
    };
    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'low': return 'text-green-600 bg-green-100';
            case 'medium': return 'text-yellow-600 bg-yellow-100';
            case 'high': return 'text-orange-600 bg-orange-100';
            case 'critical': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };
    const formatValue = (value, unit) => {
        if (unit === 'USD') {
            return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
        }
        else if (unit === '%') {
            return `${value.toFixed(1)}%`;
        }
        return value.toLocaleString();
    };
    return (_jsxs("div", { className: "min-h-screen bg-gray-50", children: [_jsx("div", { className: "bg-white shadow-sm border-b", children: _jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: [_jsxs("div", { className: "flex justify-between items-center py-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Advanced Analytics Dashboard" }), _jsx("p", { className: "text-gray-600 mt-1", children: "Predictive analytics, business intelligence, and real-time monitoring" })] }), _jsxs("div", { className: "flex items-center space-x-3", children: [_jsxs("button", { onClick: () => generateInsightsMutation.mutate(), className: "bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 flex items-center space-x-2", children: [_jsx(Zap, { className: "w-4 h-4" }), _jsx("span", { children: "Generate Insights" })] }), _jsx("button", { onClick: () => queryClient.invalidateQueries(), className: "bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700", children: _jsx(RefreshCw, { className: "w-4 h-4" }) })] })] }), _jsx("div", { className: "flex space-x-8", children: tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (_jsxs("button", { onClick: () => setActiveTab(tab.id), className: `flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                                        ? 'border-teal-500 text-teal-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`, children: [_jsx(Icon, { className: "w-4 h-4" }), _jsx("span", { children: tab.label })] }, tab.id));
                            }) })] }) }), _jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: [activeTab === 'overview' && (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsx("div", { className: "bg-white rounded-lg shadow p-6", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "p-2 bg-blue-100 rounded-lg", children: _jsx(TrendingUp, { className: "w-6 h-6 text-blue-600" }) }), _jsxs("div", { className: "ml-4", children: [_jsx("p", { className: "text-sm font-medium text-gray-500", children: "Active Models" }), _jsx("p", { className: "text-lg font-bold text-gray-900", children: stats?.data?.activeModels || 0 })] })] }) }), _jsx("div", { className: "bg-white rounded-lg shadow p-6", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "p-2 bg-green-100 rounded-lg", children: _jsx(Target, { className: "w-6 h-6 text-green-600" }) }), _jsxs("div", { className: "ml-4", children: [_jsx("p", { className: "text-sm font-medium text-gray-500", children: "Dashboards" }), _jsx("p", { className: "text-lg font-bold text-gray-900", children: stats?.data?.dashboards || 0 })] })] }) }), _jsx("div", { className: "bg-white rounded-lg shadow p-6", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "p-2 bg-purple-100 rounded-lg", children: _jsx(Eye, { className: "w-6 h-6 text-purple-600" }) }), _jsxs("div", { className: "ml-4", children: [_jsx("p", { className: "text-sm font-medium text-gray-500", children: "Insights" }), _jsx("p", { className: "text-lg font-bold text-gray-900", children: stats?.data?.insights || 0 })] })] }) }), _jsx("div", { className: "bg-white rounded-lg shadow p-6", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "p-2 bg-orange-100 rounded-lg", children: _jsx(Gauge, { className: "w-6 h-6 text-orange-600" }) }), _jsxs("div", { className: "ml-4", children: [_jsx("p", { className: "text-sm font-medium text-gray-500", children: "Model Accuracy" }), _jsxs("p", { className: "text-lg font-bold text-gray-900", children: [((stats?.data?.accuracy || 0) * 100).toFixed(1), "%"] })] })] }) })] }), _jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 mb-4", children: "Real-time Metrics" }), metricsLoading ? (_jsxs("div", { className: "text-center py-8", children: [_jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto" }), _jsx("p", { className: "mt-2 text-sm text-gray-500", children: "Loading metrics..." })] })) : metrics?.data?.length > 0 ? (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: metrics.data.map((metric) => (_jsxs("div", { className: "border rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("h4", { className: "font-medium text-gray-900", children: metric.name }), getTrendIcon(metric.trend)] }), _jsx("p", { className: "text-2xl font-bold text-gray-900 mb-1", children: formatValue(metric.value, metric.unit) }), _jsxs("div", { className: "flex items-center justify-between text-sm", children: [_jsxs("span", { className: `${metric.change >= 0 ? 'text-green-600' : 'text-red-600'}`, children: [metric.change >= 0 ? '+' : '', formatValue(metric.change, metric.unit)] }), _jsxs("span", { className: "text-gray-500", children: [metric.changePercent >= 0 ? '+' : '', metric.changePercent.toFixed(1), "%"] })] })] }, metric.id))) })) : (_jsx("p", { className: "text-sm text-gray-500", children: "No real-time metrics available" }))] }), _jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 mb-4", children: "Recent Insights" }), insightsLoading ? (_jsxs("div", { className: "text-center py-8", children: [_jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto" }), _jsx("p", { className: "mt-2 text-sm text-gray-500", children: "Loading insights..." })] })) : insights?.data?.length > 0 ? (_jsx("div", { className: "space-y-4", children: insights.data.slice(0, 3).map((insight) => (_jsxs("div", { className: "border rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("h4", { className: "font-medium text-gray-900", children: insight.title }), _jsx("span", { className: `text-xs px-2 py-1 rounded ${getSeverityColor(insight.severity)}`, children: insight.severity })] }), _jsx("p", { className: "text-sm text-gray-600 mb-2", children: insight.description }), _jsx("div", { className: "text-xs text-gray-500", children: new Date(insight.createdAt).toLocaleDateString() })] }, insight.id))) })) : (_jsx("p", { className: "text-sm text-gray-500", children: "No insights available" }))] })] })), activeTab === 'predictive' && (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900", children: "Predictive Models" }), _jsx("button", { className: "bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700", children: _jsx(Plus, { className: "w-4 h-4" }) })] }), modelsLoading ? (_jsxs("div", { className: "text-center py-8", children: [_jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto" }), _jsx("p", { className: "mt-2 text-sm text-gray-500", children: "Loading models..." })] })) : models?.data?.length > 0 ? (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: models.data.map((model) => (_jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h3", { className: "font-medium text-gray-900", children: model.name }), _jsx("span", { className: `text-xs px-2 py-1 rounded ${model.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`, children: model.status })] }), _jsx("p", { className: "text-sm text-gray-600 mb-4", children: model.description }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-gray-500", children: "Algorithm" }), _jsx("span", { className: "font-medium", children: model.algorithm })] }), _jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-gray-500", children: "Accuracy" }), _jsxs("span", { className: "font-medium", children: [(model.accuracy * 100).toFixed(1), "%"] })] }), _jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-gray-500", children: "Last Trained" }), _jsx("span", { className: "font-medium", children: new Date(model.lastTrained).toLocaleDateString() })] })] }), _jsxs("div", { className: "mt-4 flex space-x-2", children: [_jsx("button", { onClick: () => trainModelMutation.mutate({ modelId: model.id }), className: "bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 text-sm", children: "Train" }), _jsx("button", { className: "bg-gray-600 text-white px-3 py-1 rounded-md hover:bg-gray-700 text-sm", children: "Predict" })] })] }, model.id))) })) : (_jsxs("div", { className: "text-center py-8", children: [_jsx(TrendingUp, { className: "mx-auto h-12 w-12 text-gray-400" }), _jsx("p", { className: "mt-2 text-sm text-gray-500", children: "No predictive models available" })] }))] })), activeTab === 'dashboards' && (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900", children: "Custom Dashboards" }), _jsx("button", { onClick: () => setShowCreateDashboard(true), className: "bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700", children: _jsx(Plus, { className: "w-4 h-4" }) })] }), dashboardsLoading ? (_jsxs("div", { className: "text-center py-8", children: [_jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto" }), _jsx("p", { className: "mt-2 text-sm text-gray-500", children: "Loading dashboards..." })] })) : dashboards?.data?.length > 0 ? (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: dashboards.data.map((dashboard) => (_jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h3", { className: "font-medium text-gray-900", children: dashboard.name }), dashboard.isDefault && (_jsx("span", { className: "text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded", children: "Default" }))] }), _jsx("p", { className: "text-sm text-gray-600 mb-4", children: dashboard.description }), _jsxs("div", { className: "flex items-center justify-between text-sm text-gray-500 mb-4", children: [_jsxs("span", { children: [dashboard.widgets.length, " widgets"] }), _jsx("span", { children: new Date(dashboard.updatedAt).toLocaleDateString() })] }), _jsxs("div", { className: "flex space-x-2", children: [_jsx("button", { className: "bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 text-sm", children: "View" }), _jsx("button", { className: "bg-gray-600 text-white px-3 py-1 rounded-md hover:bg-gray-700 text-sm", children: "Edit" }), _jsx("button", { className: "bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 text-sm", children: "Delete" })] })] }, dashboard.id))) })) : (_jsxs("div", { className: "text-center py-8", children: [_jsx(Target, { className: "mx-auto h-12 w-12 text-gray-400" }), _jsx("p", { className: "mt-2 text-sm text-gray-500", children: "No dashboards available" })] }))] })), activeTab === 'insights' && (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900", children: "Analytics Insights" }), _jsx("button", { onClick: () => generateInsightsMutation.mutate(), className: "bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700", children: "Generate Insights" })] }), insightsLoading ? (_jsxs("div", { className: "text-center py-8", children: [_jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto" }), _jsx("p", { className: "mt-2 text-sm text-gray-500", children: "Loading insights..." })] })) : insights?.data?.length > 0 ? (_jsx("div", { className: "space-y-4", children: insights.data.map((insight) => (_jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h3", { className: "font-medium text-gray-900", children: insight.title }), _jsx("span", { className: `text-xs px-2 py-1 rounded ${getSeverityColor(insight.severity)}`, children: insight.severity })] }), _jsx("p", { className: "text-sm text-gray-600 mb-4", children: insight.description }), insight.recommendations.length > 0 && (_jsxs("div", { className: "mb-4", children: [_jsx("h4", { className: "font-medium text-gray-900 mb-2", children: "Recommendations:" }), _jsx("ul", { className: "list-disc list-inside text-sm text-gray-600 space-y-1", children: insight.recommendations.map((rec, index) => (_jsx("li", { children: rec }, index))) })] })), _jsx("div", { className: "text-xs text-gray-500", children: new Date(insight.createdAt).toLocaleDateString() })] }, insight.id))) })) : (_jsxs("div", { className: "text-center py-8", children: [_jsx(Eye, { className: "mx-auto h-12 w-12 text-gray-400" }), _jsx("p", { className: "mt-2 text-sm text-gray-500", children: "No insights available" })] }))] })), activeTab === 'benchmarks' && (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900", children: "Performance Benchmarks" }), _jsx("button", { className: "bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700", children: _jsx(Plus, { className: "w-4 h-4" }) })] }), benchmarksLoading ? (_jsxs("div", { className: "text-center py-8", children: [_jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto" }), _jsx("p", { className: "mt-2 text-sm text-gray-500", children: "Loading benchmarks..." })] })) : benchmarks?.data?.length > 0 ? (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: benchmarks.data.map((benchmark) => (_jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h3", { className: "font-medium text-gray-900", children: benchmark.name }), _jsx("span", { className: "text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded", children: benchmark.category })] }), _jsx("p", { className: "text-sm text-gray-600 mb-4", children: benchmark.description }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-gray-500", children: "Current Value" }), _jsx("span", { className: "font-medium", children: formatValue(benchmark.value, 'USD') })] }), _jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-gray-500", children: "Target" }), _jsx("span", { className: "font-medium", children: formatValue(benchmark.target, 'USD') })] }), benchmark.industryAverage && (_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-gray-500", children: "Industry Avg" }), _jsx("span", { className: "font-medium", children: formatValue(benchmark.industryAverage, 'USD') })] })), _jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-gray-500", children: "Period" }), _jsx("span", { className: "font-medium capitalize", children: benchmark.period })] })] }), _jsxs("div", { className: "mt-4", children: [_jsxs("div", { className: "flex justify-between text-sm mb-1", children: [_jsx("span", { className: "text-gray-500", children: "Progress" }), _jsxs("span", { className: "font-medium", children: [((benchmark.value / benchmark.target) * 100).toFixed(1), "%"] })] }), _jsx("div", { className: "w-full bg-gray-200 rounded-full h-2", children: _jsx("div", { className: "bg-teal-600 h-2 rounded-full transition-all duration-300", style: { width: `${Math.min((benchmark.value / benchmark.target) * 100, 100)}%` } }) })] })] }, benchmark.id))) })) : (_jsxs("div", { className: "text-center py-8", children: [_jsx(Gauge, { className: "mx-auto h-12 w-12 text-gray-400" }), _jsx("p", { className: "mt-2 text-sm text-gray-500", children: "No benchmarks available" })] }))] }))] })] }));
};
