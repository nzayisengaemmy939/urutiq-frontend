import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  BarChart3, TrendingUp, Target, Gauge, Table, AlertTriangle,
  Plus, Settings, Download, RefreshCw, Eye, Edit, Trash2,
  LineChart, PieChart, Activity, Zap, Clock, Calendar,
  ChevronUp, ChevronDown, Minus, DollarSign, Percent
} from 'lucide-react';

// Types
interface PredictiveModel {
  id: string;
  name: string;
  description: string;
  type: string;
  algorithm: string;
  accuracy: number;
  status: string;
  lastTrained: Date;
}

interface Dashboard {
  id: string;
  name: string;
  description: string;
  layout: any;
  widgets: any[];
  isDefault: boolean;
  updatedAt: Date;
}

interface RealTimeMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
  changePercent: number;
  lastUpdated: Date;
}

interface AnalyticsInsight {
  id: string;
  title: string;
  description: string;
  type: string;
  severity: string;
  dataPoints: any[];
  recommendations: string[];
  createdAt: Date;
}

interface Benchmark {
  id: string;
  name: string;
  description: string;
  category: string;
  metric: string;
  value: number;
  target: number;
  industryAverage?: number;
  period: string;
}

// API Functions
const api = {
  getStats: async (companyId: string) => {
    const response = await fetch(`/api/advanced-analytics/stats/${companyId}`);
    return response.json();
  },

  getPredictiveModels: async (companyId: string) => {
    const response = await fetch(`/api/advanced-analytics/predictive-models/${companyId}`);
    return response.json();
  },

  trainModel: async (modelId: string) => {
    const response = await fetch(`/api/advanced-analytics/predictive-models/${modelId}/train`, {
      method: 'POST'
    });
    return response.json();
  },

  getDashboards: async (companyId: string, userId: string) => {
    const response = await fetch(`/api/advanced-analytics/dashboards/${companyId}/${userId}`);
    return response.json();
  },

  createDashboard: async (companyId: string, userId: string, data: any) => {
    const response = await fetch(`/api/advanced-analytics/dashboards/${companyId}/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  getRealTimeMetrics: async (companyId: string) => {
    const response = await fetch(`/api/advanced-analytics/real-time-metrics/${companyId}`);
    return response.json();
  },

  getInsights: async (companyId: string) => {
    const response = await fetch(`/api/advanced-analytics/insights/${companyId}`);
    return response.json();
  },

  generateInsights: async (companyId: string) => {
    const response = await fetch(`/api/advanced-analytics/insights/${companyId}/generate`, {
      method: 'POST'
    });
    return response.json();
  },

  getBenchmarks: async (companyId: string) => {
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
export const AdvancedAnalyticsDashboard: React.FC<{ companyId: string; userId: string }> = ({ 
  companyId, 
  userId 
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'predictive' | 'dashboards' | 'insights' | 'benchmarks'>('overview');
  const [selectedDashboard, setSelectedDashboard] = useState<Dashboard | null>(null);
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
    mutationFn: ({ modelId }: { modelId: string }) => api.trainModel(modelId),
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
    mutationFn: ({ data }: { data: any }) => api.createDashboard(companyId, userId, data),
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

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <ChevronUp className="w-4 h-4 text-green-600" />;
      case 'down': return <ChevronDown className="w-4 h-4 text-red-600" />;
      default: return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatValue = (value: number, unit: string) => {
    if (unit === 'USD') {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
    } else if (unit === '%') {
      return `${value.toFixed(1)}%`;
    }
    return value.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Advanced Analytics Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Predictive analytics, business intelligence, and real-time monitoring
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => generateInsightsMutation.mutate()}
                className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 flex items-center space-x-2"
              >
                <Zap className="w-4 h-4" />
                <span>Generate Insights</span>
              </button>
              <button
                onClick={() => queryClient.invalidateQueries()}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-teal-500 text-teal-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Active Models</p>
                    <p className="text-lg font-bold text-gray-900">{stats?.data?.activeModels || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Target className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Dashboards</p>
                    <p className="text-lg font-bold text-gray-900">{stats?.data?.dashboards || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Eye className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Insights</p>
                    <p className="text-lg font-bold text-gray-900">{stats?.data?.insights || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Gauge className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Model Accuracy</p>
                    <p className="text-lg font-bold text-gray-900">{((stats?.data?.accuracy || 0) * 100).toFixed(1)}%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Real-time Metrics */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Real-time Metrics</h3>
              {metricsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-500">Loading metrics...</p>
                </div>
              ) : metrics?.data?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {metrics.data.map((metric: RealTimeMetric) => (
                    <div key={metric.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{metric.name}</h4>
                        {getTrendIcon(metric.trend)}
                      </div>
                      <p className="text-2xl font-bold text-gray-900 mb-1">
                        {formatValue(metric.value, metric.unit)}
                      </p>
                      <div className="flex items-center justify-between text-sm">
                        <span className={`${
                          metric.change >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {metric.change >= 0 ? '+' : ''}{formatValue(metric.change, metric.unit)}
                        </span>
                        <span className="text-gray-500">
                          {metric.changePercent >= 0 ? '+' : ''}{metric.changePercent.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No real-time metrics available</p>
              )}
            </div>

            {/* Recent Insights */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Insights</h3>
              {insightsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-500">Loading insights...</p>
                </div>
              ) : insights?.data?.length > 0 ? (
                <div className="space-y-4">
                  {insights.data.slice(0, 3).map((insight: AnalyticsInsight) => (
                    <div key={insight.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{insight.title}</h4>
                        <span className={`text-xs px-2 py-1 rounded ${getSeverityColor(insight.severity)}`}>
                          {insight.severity}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{insight.description}</p>
                      <div className="text-xs text-gray-500">
                        {new Date(insight.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No insights available</p>
              )}
            </div>
          </div>
        )}

        {/* Predictive Analytics Tab */}
        {activeTab === 'predictive' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Predictive Models</h2>
              <button className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700">
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {modelsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-500">Loading models...</p>
              </div>
            ) : models?.data?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {models.data.map((model: PredictiveModel) => (
                  <div key={model.id} className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium text-gray-900">{model.name}</h3>
                      <span className={`text-xs px-2 py-1 rounded ${
                        model.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {model.status}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-4">{model.description}</p>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Algorithm</span>
                        <span className="font-medium">{model.algorithm}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Accuracy</span>
                        <span className="font-medium">{(model.accuracy * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Last Trained</span>
                        <span className="font-medium">{new Date(model.lastTrained).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex space-x-2">
                      <button
                        onClick={() => trainModelMutation.mutate({ modelId: model.id })}
                        className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 text-sm"
                      >
                        Train
                      </button>
                      <button className="bg-gray-600 text-white px-3 py-1 rounded-md hover:bg-gray-700 text-sm">
                        Predict
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <TrendingUp className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">No predictive models available</p>
              </div>
            )}
          </div>
        )}

        {/* Dashboards Tab */}
        {activeTab === 'dashboards' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Custom Dashboards</h2>
              <button
                onClick={() => setShowCreateDashboard(true)}
                className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {dashboardsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-500">Loading dashboards...</p>
              </div>
            ) : dashboards?.data?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dashboards.data.map((dashboard: Dashboard) => (
                  <div key={dashboard.id} className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium text-gray-900">{dashboard.name}</h3>
                      {dashboard.isDefault && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Default</span>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-4">{dashboard.description}</p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span>{dashboard.widgets.length} widgets</span>
                      <span>{new Date(dashboard.updatedAt).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 text-sm">
                        View
                      </button>
                      <button className="bg-gray-600 text-white px-3 py-1 rounded-md hover:bg-gray-700 text-sm">
                        Edit
                      </button>
                      <button className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 text-sm">
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Target className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">No dashboards available</p>
              </div>
            )}
          </div>
        )}

        {/* Insights Tab */}
        {activeTab === 'insights' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Analytics Insights</h2>
              <button
                onClick={() => generateInsightsMutation.mutate()}
                className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700"
              >
                Generate Insights
              </button>
            </div>

            {insightsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-500">Loading insights...</p>
              </div>
            ) : insights?.data?.length > 0 ? (
              <div className="space-y-4">
                {insights.data.map((insight: AnalyticsInsight) => (
                  <div key={insight.id} className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium text-gray-900">{insight.title}</h3>
                      <span className={`text-xs px-2 py-1 rounded ${getSeverityColor(insight.severity)}`}>
                        {insight.severity}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-4">{insight.description}</p>
                    
                    {insight.recommendations.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Recommendations:</h4>
                        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                          {insight.recommendations.map((rec, index) => (
                            <li key={index}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div className="text-xs text-gray-500">
                      {new Date(insight.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Eye className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">No insights available</p>
              </div>
            )}
          </div>
        )}

        {/* Benchmarks Tab */}
        {activeTab === 'benchmarks' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Performance Benchmarks</h2>
              <button className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700">
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {benchmarksLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-500">Loading benchmarks...</p>
              </div>
            ) : benchmarks?.data?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {benchmarks.data.map((benchmark: Benchmark) => (
                  <div key={benchmark.id} className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium text-gray-900">{benchmark.name}</h3>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {benchmark.category}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-4">{benchmark.description}</p>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Current Value</span>
                        <span className="font-medium">{formatValue(benchmark.value, 'USD')}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Target</span>
                        <span className="font-medium">{formatValue(benchmark.target, 'USD')}</span>
                      </div>
                      {benchmark.industryAverage && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Industry Avg</span>
                          <span className="font-medium">{formatValue(benchmark.industryAverage, 'USD')}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Period</span>
                        <span className="font-medium capitalize">{benchmark.period}</span>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-500">Progress</span>
                        <span className="font-medium">{((benchmark.value / benchmark.target) * 100).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-teal-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min((benchmark.value / benchmark.target) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Gauge className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">No benchmarks available</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
