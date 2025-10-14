import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Bot,
  Settings,
  TrendingUp,
  Activity,
  CheckCircle,
  AlertTriangle,
  Clock,
  Zap,
  Play,
  Pause,
  RefreshCw,
  BarChart3,
  Target,
  Lightbulb,
  Users,
  DollarSign,
  Calendar,
  Filter,
  Search,
  Eye,
  Edit,
  Trash2,
  Plus,
  Save,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

// Types
interface AutoBookkeeperConfig {
  id: string;
  companyId: string;
  isEnabled: boolean;
  automationLevel: 'basic' | 'intermediate' | 'advanced';
  autoCategorization: boolean;
  autoJournalEntry: boolean;
  autoReconciliation: boolean;
  learningEnabled: boolean;
  confidenceThreshold: number;
  notificationPreferences: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  rules: AutoBookkeeperRule[];
  metadata?: any;
}

interface AutoBookkeeperRule {
  id: string;
  name: string;
  description: string;
  condition: string;
  action: string;
  priority: number;
  isActive: boolean;
  metadata?: any;
}

interface AutoBookkeeperStats {
  totalTransactions: number;
  autoCategorized: number;
  autoJournalEntries: number;
  autoReconciled: number;
  accuracy: number;
  timeSaved: number;
  automationRate: number;
  learningProgress: number;
}

interface AutoBookkeeperInsight {
  id: string;
  type: 'pattern' | 'anomaly' | 'optimization' | 'trend';
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  recommendations: string[];
  metadata?: any;
}

// API Functions
const api = {
  getConfig: async (companyId: string) => {
    const response = await fetch(`/api/auto-bookkeeper/config/${companyId}`);
    return response.json();
  },

  updateConfig: async (companyId: string, updates: Partial<AutoBookkeeperConfig>) => {
    const response = await fetch(`/api/auto-bookkeeper/config/${companyId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return response.json();
  },

  initialize: async (companyId: string) => {
    const response = await fetch(`/api/auto-bookkeeper/initialize/${companyId}`, {
      method: 'POST'
    });
    return response.json();
  },

  getStats: async (companyId: string, periodDays?: number) => {
    const params = new URLSearchParams();
    if (periodDays) params.append('periodDays', periodDays.toString());

    const response = await fetch(`/api/auto-bookkeeper/stats/${companyId}?${params}`);
    return response.json();
  },

  getInsights: async (companyId: string) => {
    const response = await fetch(`/api/auto-bookkeeper/insights/${companyId}`);
    return response.json();
  },

  getDashboard: async (companyId: string) => {
    const response = await fetch(`/api/auto-bookkeeper/dashboard/${companyId}`);
    return response.json();
  },

  processPending: async (companyId: string) => {
    const response = await fetch(`/api/auto-bookkeeper/process-pending/${companyId}`, {
      method: 'POST'
    });
    return response.json();
  },

  categorizeTransaction: async (transactionId: string, companyId: string, forceAuto?: boolean) => {
    const response = await fetch(`/api/auto-bookkeeper/categorize/${transactionId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ companyId, forceAuto })
    });
    return response.json();
  },

  generateJournalEntry: async (transactionId: string, companyId: string, forceAuto?: boolean) => {
    const response = await fetch(`/api/auto-bookkeeper/journal-entry/${transactionId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ companyId, forceAuto })
    });
    return response.json();
  },

  reconcileTransaction: async (bankTransactionId: string, companyId: string, forceAuto?: boolean) => {
    const response = await fetch(`/api/auto-bookkeeper/reconcile/${bankTransactionId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ companyId, forceAuto })
    });
    return response.json();
  }
};

// Auto-Bookkeeper Dashboard Component
export const AutoBookkeeperDashboard: React.FC<{ companyId: string }> = ({ companyId }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'configuration' | 'activity' | 'insights'>('overview');
  const [selectedPeriod, setSelectedPeriod] = useState(30);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [editingRule, setEditingRule] = useState<AutoBookkeeperRule | null>(null);

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
    mutationFn: ({ updates }: { updates: Partial<AutoBookkeeperConfig> }) => 
      api.updateConfig(companyId, updates),
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
  const handleConfigUpdate = (updates: Partial<AutoBookkeeperConfig>) => {
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Auto-Bookkeeper Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Intelligent automation for day-to-day accounting tasks
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Bot className="w-4 h-4" />
                <span>AI Powered</span>
              </div>
              {config?.data?.isEnabled && (
                <div className="flex items-center space-x-2 text-sm text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span>Active</span>
                </div>
              )}
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
            {/* Status and Controls */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Auto-Bookkeeper Status</h2>
                <div className="flex items-center space-x-3">
                  <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(Number(e.target.value))}
                    className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                  >
                    <option value={7}>Last 7 days</option>
                    <option value={30}>Last 30 days</option>
                    <option value={90}>Last 90 days</option>
                  </select>
                  <button
                    onClick={handleProcessPending}
                    disabled={isProcessing || !config?.data?.isEnabled}
                    className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      <RefreshCw className="w-4 h-4 animate-spin inline mr-2" />
                    ) : (
                      <Play className="w-4 h-4 inline mr-2" />
                    )}
                    {isProcessing ? 'Processing...' : 'Process Pending'}
                  </button>
                </div>
              </div>

              {/* Status Indicators */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="flex items-center p-4 bg-green-50 rounded-lg">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <p className="text-lg font-bold text-gray-900">
                      {config?.data?.isEnabled ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center p-4 bg-blue-50 rounded-lg">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Zap className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Automation Rate</p>
                    <p className="text-lg font-bold text-gray-900">
                      {stats?.data?.automationRate ? `${(stats.data.automationRate * 100).toFixed(1)}%` : '0%'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center p-4 bg-purple-50 rounded-lg">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Target className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Accuracy</p>
                    <p className="text-lg font-bold text-gray-900">
                      {stats?.data?.accuracy ? `${(stats.data.accuracy * 100).toFixed(1)}%` : '95%'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center p-4 bg-orange-50 rounded-lg">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Clock className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Time Saved</p>
                    <p className="text-lg font-bold text-gray-900">
                      {stats?.data?.timeSaved ? `${Math.round(stats.data.timeSaved)} min` : '0 min'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Transactions</h3>
                  <TrendingUp className="w-5 h-5 text-gray-400" />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Total</span>
                    <span className="font-medium">{stats?.data?.totalTransactions || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Auto-Categorized</span>
                    <span className="font-medium text-green-600">{stats?.data?.autoCategorized || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Auto-Journal Entries</span>
                    <span className="font-medium text-blue-600">{stats?.data?.autoJournalEntries || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Auto-Reconciled</span>
                    <span className="font-medium text-purple-600">{stats?.data?.autoReconciled || 0}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Performance</h3>
                  <BarChart3 className="w-5 h-5 text-gray-400" />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Learning Progress</span>
                    <span className="font-medium">{stats?.data?.learningProgress ? `${(stats.data.learningProgress * 100).toFixed(1)}%` : '0%'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Efficiency</span>
                    <span className="font-medium text-green-600">High</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Error Rate</span>
                    <span className="font-medium text-red-600">Low</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Pending Items</h3>
                  <AlertTriangle className="w-5 h-5 text-gray-400" />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Categorizations</span>
                    <span className="font-medium text-orange-600">{dashboard?.data?.pendingItems?.categorizations || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Reconciliations</span>
                    <span className="font-medium text-orange-600">{dashboard?.data?.pendingItems?.reconciliations || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Total Pending</span>
                    <span className="font-medium text-red-600">
                      {(dashboard?.data?.pendingItems?.categorizations || 0) + (dashboard?.data?.pendingItems?.reconciliations || 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            {dashboard?.data?.recentActivity && (
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Recent Categorizations</h4>
                      <div className="space-y-2">
                        {dashboard.data.recentActivity.categorizations?.slice(0, 5).map((cat: any) => (
                          <div key={cat.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div>
                              <p className="text-sm font-medium">{cat.transaction?.description || 'Unknown'}</p>
                              <p className="text-xs text-gray-500">{cat.suggestedCategory}</p>
                            </div>
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                              {Math.round(cat.confidence * 100)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Recent Reconciliations</h4>
                      <div className="space-y-2">
                        {dashboard.data.recentActivity.reconciliations?.slice(0, 5).map((rec: any) => (
                          <div key={rec.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div>
                              <p className="text-sm font-medium">{rec.bankTransaction?.description || 'Unknown'}</p>
                              <p className="text-xs text-gray-500">{rec.matchType}</p>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded ${
                              rec.status === 'matched' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {rec.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Configuration Tab */}
        {activeTab === 'configuration' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Auto-Bookkeeper Configuration</h2>
                <button
                  onClick={() => setShowConfigModal(true)}
                  className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700"
                >
                  <Edit className="w-4 h-4 inline mr-2" />
                  Edit Configuration
                </button>
              </div>

              {configLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-500">Loading configuration...</p>
                </div>
              ) : config?.data ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">General Settings</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Status</span>
                        <span className={`text-sm font-medium ${
                          config.data.isEnabled ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {config.data.isEnabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Automation Level</span>
                        <span className="text-sm font-medium capitalize">{config.data.automationLevel}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Confidence Threshold</span>
                        <span className="text-sm font-medium">{Math.round(config.data.confidenceThreshold * 100)}%</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Automation Features</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Auto-Categorization</span>
                        <span className={`text-sm font-medium ${
                          config.data.autoCategorization ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {config.data.autoCategorization ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Auto-Journal Entry</span>
                        <span className={`text-sm font-medium ${
                          config.data.autoJournalEntry ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {config.data.autoJournalEntry ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Auto-Reconciliation</span>
                        <span className={`text-sm font-medium ${
                          config.data.autoReconciliation ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {config.data.autoReconciliation ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Bot className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">No configuration found</p>
                </div>
              )}
            </div>

            {/* Automation Rules */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Automation Rules</h3>
                  <button
                    onClick={() => setEditingRule({} as AutoBookkeeperRule)}
                    className="bg-teal-600 text-white px-3 py-1 rounded-md hover:bg-teal-700 text-sm"
                  >
                    <Plus className="w-4 h-4 inline mr-1" />
                    Add Rule
                  </button>
                </div>
              </div>
              <div className="p-6">
                {config?.data?.rules?.length > 0 ? (
                  <div className="space-y-4">
                    {config.data.rules.map((rule) => (
                      <div key={rule.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{rule.name}</h4>
                          <div className="flex items-center space-x-2">
                            <span className={`text-xs px-2 py-1 rounded ${
                              rule.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {rule.isActive ? 'Active' : 'Inactive'}
                            </span>
                            <button
                              onClick={() => setEditingRule(rule)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{rule.description}</p>
                        <div className="text-xs text-gray-500">
                          <div>Condition: {rule.condition}</div>
                          <div>Action: {rule.action}</div>
                          <div>Priority: {rule.priority}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Settings className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">No automation rules configured</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Insights Tab */}
        {activeTab === 'insights' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">AI Insights</h2>
                <button
                  onClick={() => queryClient.invalidateQueries({ queryKey: ['autoBookkeeperInsights', companyId] })}
                  className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700"
                >
                  <RefreshCw className="w-4 h-4 inline mr-2" />
                  Refresh Insights
                </button>
              </div>

              {insightsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-500">Loading insights...</p>
                </div>
              ) : insights?.data?.length > 0 ? (
                <div className="space-y-4">
                  {insights.data.map((insight: AutoBookkeeperInsight) => (
                    <div key={insight.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900">{insight.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {Math.round(insight.confidence * 100)}% confidence
                          </span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            insight.impact === 'high' ? 'bg-red-100 text-red-800' :
                            insight.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {insight.impact} impact
                          </span>
                        </div>
                      </div>
                      <div className="mt-3">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Recommendations:</h5>
                        <ul className="space-y-1">
                          {insight.recommendations.map((rec, index) => (
                            <li key={index} className="text-sm text-gray-600 flex items-start">
                              <span className="text-teal-500 mr-2 mt-1">•</span>
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Lightbulb className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">No insights available</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
