'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { 
  Banknote, 
  RefreshCw, 
  Shield, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Activity,
  Zap,
  Settings,
  Eye,
  Search,
  Filter,
  Download,
  Upload
} from 'lucide-react';

// Types
interface BankConnection {
  id: string;
  bankName: string;
  accountNumber: string;
  accountType: string;
  currency: string;
  connectionType: string;
  status: string;
  lastSyncAt?: string;
  nextSyncAt?: string;
  healthStatus: string;
  daysSinceLastSync?: number;
  testResult: {
    success: boolean;
    message: string;
    details?: any;
  };
  _count: {
    bankTransactions: number;
    syncLogs: number;
  };
}

interface BankTransaction {
  id: string;
  transactionDate: string;
  amount: number;
  currency: string;
  description?: string;
  merchantName?: string;
  merchantCategory?: string;
  transactionType: string;
  reference?: string;
  category?: string;
  isReconciled: boolean;
  reconciledAt?: string;
  confidence: number;
  aiInsights?: {
    riskScore: number;
    fraudScore: number;
    confidence: number;
    requiresReview: boolean;
    suggestedCategory?: string;
    suggestedVendor?: string;
  };
  connection: {
    id: string;
    bankName: string;
    accountNumber: string;
  };
  reconciledByUser?: {
    name: string;
    email: string;
  };
  matchedTransaction?: {
    id: string;
    amount: number;
    transactionDate: string;
    description: string;
  };
}

interface BankIntegrationStats {
  totalConnections: number;
  activeConnections: number;
  totalTransactions: number;
  reconciledTransactions: number;
  pendingReconciliation: number;
  fraudAlerts: number;
  averageProcessingTime: number;
  lastSyncTime?: string;
  syncSuccessRate: number;
}

interface ReconciliationRule {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  priority: number;
  conditions: string;
  actions: string;
  createdByUser: {
    name: string;
    email: string;
  };
}

interface BankReconciliationResult {
  connectionId: string;
  processedTransactions: number;
  matchedTransactions: number;
  unmatchedTransactions: number;
  autoReconciled: number;
  requiresReview: number;
  fraudAlerts: number;
  processingTime: number;
  summary: {
    totalAmount: number;
    averageConfidence: number;
    riskLevel: 'low' | 'medium' | 'high';
  };
}

// Enhanced Bank Integration Component
export default function EnhancedBankIntegration() {
  const [selectedCompany, setSelectedCompany] = useState('seed-company-1');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [connections, setConnections] = useState<BankConnection[]>([]);
  const [transactions, setTransactions] = useState<BankTransaction[]>([]);
  const [stats, setStats] = useState<BankIntegrationStats | null>(null);
  const [rules, setRules] = useState<ReconciliationRule[]>([]);
  const [selectedConnection, setSelectedConnection] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [syncResult, setSyncResult] = useState<BankReconciliationResult | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showSettings, setShowSettings] = useState(false);
  const [config, setConfig] = useState({
    autoReconciliation: true,
    confidenceThreshold: 0.8,
    fraudDetectionEnabled: true,
    autoCategorization: true,
    realTimeSync: true,
    syncFrequency: 'daily' as 'hourly' | 'daily' | 'weekly',
    notificationSettings: {
      email: false,
      slack: false,
      webhook: ''
    }
  });

  const { toast } = useToast();

  // Load initial data
  useEffect(() => {
    loadConnections();
    loadStats();
    loadRules();
  }, [selectedCompany]);

  // Load bank connections
  const loadConnections = async () => {
    try {
      const response = await fetch(`/api/enhanced-bank-integration/connections/${selectedCompany}`);
      const data = await response.json();
      if (data.success) {
        setConnections(data.connections);
        if (data.connections.length > 0 && !selectedConnection) {
          setSelectedConnection(data.connections[0].id);
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load bank connections",
        variant: "destructive",
      });
    }
  };

  // Load bank integration statistics
  const loadStats = async () => {
    try {
      const response = await fetch(`/api/enhanced-bank-integration/stats/${selectedCompany}`);
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load bank integration statistics",
        variant: "destructive",
      });
    }
  };

  // Load reconciliation rules
  const loadRules = async () => {
    try {
      const response = await fetch(`/api/enhanced-bank-integration/rules/${selectedCompany}`);
      const data = await response.json();
      if (data.success) {
        setRules(data.rules);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load reconciliation rules",
        variant: "destructive",
      });
    }
  };

  // Load transactions for selected connection
  const loadTransactions = async () => {
    if (!selectedConnection) return;

    try {
      const params = new URLSearchParams({
        page: '1',
        limit: '50',
        ...(filterStatus !== 'all' && { isReconciled: filterStatus === 'reconciled' ? 'true' : 'false' }),
        ...(searchTerm && { search: searchTerm })
      });

      const response = await fetch(`/api/enhanced-bank-integration/transactions/${selectedConnection}?${params}`);
      const data = await response.json();
      if (data.success) {
        setTransactions(data.transactions);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load transactions",
        variant: "destructive",
      });
    }
  };

  // Trigger bank sync
  const triggerSync = async (connectionId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/enhanced-bank-integration/sync/${connectionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ syncType: 'incremental' })
      });
      const data = await response.json();
      if (data.success) {
        setSyncResult(data.result);
        toast({
          title: "Success",
          description: `Sync completed: ${data.result.processedTransactions} transactions processed`,
        });
        loadConnections();
        loadStats();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to trigger sync",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Run reconciliation
  const runReconciliation = async () => {
    if (!selectedConnection) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/enhanced-bank-integration/reconcile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          connectionId: selectedConnection,
          config
        })
      });
      const data = await response.json();
      if (data.success) {
        setSyncResult(data.result);
        toast({
          title: "Success",
          description: `Reconciliation completed: ${data.result.matchedTransactions} matched, ${data.result.unmatchedTransactions} unmatched`,
        });
        loadTransactions();
        loadStats();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to run reconciliation",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-categorize transaction
  const autoCategorizeTransaction = async (transactionId: string) => {
    try {
      const response = await fetch(`/api/enhanced-bank-integration/auto-categorize/${transactionId}`, {
        method: 'POST'
      });
      const data = await response.json();
      if (data.success) {
        toast({
          title: "Success",
          description: `Transaction categorized as: ${data.category}`,
        });
        loadTransactions();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to auto-categorize transaction",
        variant: "destructive",
      });
    }
  };

  // Analyze fraud for transaction
  const analyzeFraud = async (transactionId: string) => {
    try {
      const response = await fetch(`/api/enhanced-bank-integration/fraud-analysis/${transactionId}`, {
        method: 'POST'
      });
      const data = await response.json();
      if (data.success) {
        toast({
          title: "Fraud Analysis",
          description: `Risk Level: ${data.analysis.riskLevel}, Fraud Score: ${(data.analysis.fraudScore * 100).toFixed(1)}%`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to analyze fraud",
        variant: "destructive",
      });
    }
  };

  // Get health status color
  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Get risk level color
  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Enhanced Bank Integration</h1>
          <p className="text-gray-600 mt-2">AI-powered real-time bank feed processing and reconciliation</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button onClick={() => loadConnections()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <Card>
          <CardHeader>
            <CardTitle>Integration Settings</CardTitle>
            <CardDescription>Configure AI-powered bank integration features</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Auto Reconciliation</Label>
                <Switch
                  checked={config.autoReconciliation}
                  onCheckedChange={(checked) => setConfig({ ...config, autoReconciliation: checked })}
                />
              </div>
              <div className="space-y-2">
                <Label>Fraud Detection</Label>
                <Switch
                  checked={config.fraudDetectionEnabled}
                  onCheckedChange={(checked) => setConfig({ ...config, fraudDetectionEnabled: checked })}
                />
              </div>
              <div className="space-y-2">
                <Label>Auto Categorization</Label>
                <Switch
                  checked={config.autoCategorization}
                  onCheckedChange={(checked) => setConfig({ ...config, autoCategorization: checked })}
                />
              </div>
              <div className="space-y-2">
                <Label>Real-time Sync</Label>
                <Switch
                  checked={config.realTimeSync}
                  onCheckedChange={(checked) => setConfig({ ...config, realTimeSync: checked })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Confidence Threshold</Label>
              <Input
                type="number"
                min="0"
                max="1"
                step="0.1"
                value={config.confidenceThreshold}
                onChange={(e) => setConfig({ ...config, confidenceThreshold: parseFloat(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>Sync Frequency</Label>
              <Select
                value={config.syncFrequency}
                onValueChange={(value: 'hourly' | 'daily' | 'weekly') => setConfig({ ...config, syncFrequency: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Connections</CardTitle>
              <Banknote className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalConnections}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeConnections} active
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTransactions}</div>
              <p className="text-xs text-muted-foreground">
                {stats.reconciledTransactions} reconciled
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Reconciliation</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingReconciliation}</div>
              <p className="text-xs text-muted-foreground">
                {stats.fraudAlerts} fraud alerts
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sync Success Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(stats.syncSuccessRate * 100).toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                Last sync: {stats.lastSyncTime ? new Date(stats.lastSyncTime).toLocaleDateString() : 'Never'}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="connections">Connections</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="rules">Rules</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bank Connections Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Banknote className="w-5 h-5" />
                  Bank Connections
                </CardTitle>
                <CardDescription>Active bank connections and their health status</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {connections.map((connection) => (
                      <div key={connection.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">{connection.bankName}</div>
                          <div className="text-sm text-gray-600">
                            {connection.accountNumber} • {connection.accountType}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getHealthStatusColor(connection.healthStatus)}>
                            {connection.healthStatus}
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => triggerSync(connection.id)}
                            disabled={isLoading}
                          >
                            <RefreshCw className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Latest bank integration activities</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {syncResult && (
                      <div className="p-3 border rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="font-medium">Sync Completed</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          Processed {syncResult.processedTransactions} transactions
                          • {syncResult.matchedTransactions} matched
                          • {syncResult.unmatchedTransactions} unmatched
                          • {syncResult.fraudAlerts} fraud alerts
                        </div>
                        <div className="mt-2">
                          <Badge className={getRiskLevelColor(syncResult.summary.riskLevel)}>
                            Risk: {syncResult.summary.riskLevel}
                          </Badge>
                        </div>
                      </div>
                    )}
                    {/* Add more activity items here */}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Connections Tab */}
        <TabsContent value="connections" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bank Connections</CardTitle>
              <CardDescription>Manage your bank account connections</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {connections.map((connection) => (
                  <div key={connection.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">{connection.bankName}</h3>
                        <p className="text-sm text-gray-600">
                          Account: {connection.accountNumber} • Type: {connection.accountType}
                        </p>
                      </div>
                      <Badge className={getHealthStatusColor(connection.healthStatus)}>
                        {connection.healthStatus}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Status:</span> {connection.status}
                      </div>
                      <div>
                        <span className="text-gray-600">Type:</span> {connection.connectionType}
                      </div>
                      <div>
                        <span className="text-gray-600">Transactions:</span> {connection._count.bankTransactions}
                      </div>
                      <div>
                        <span className="text-gray-600">Last Sync:</span> {connection.lastSyncAt ? new Date(connection.lastSyncAt).toLocaleDateString() : 'Never'}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedConnection(connection.id);
                          setActiveTab('transactions');
                        }}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Transactions
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => triggerSync(connection.id)}
                        disabled={isLoading}
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Sync Now
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Bank Transactions</CardTitle>
                  <CardDescription>AI-powered transaction processing and reconciliation</CardDescription>
                </div>
                <Button onClick={runReconciliation} disabled={!selectedConnection || isLoading}>
                  <Zap className="w-4 h-4 mr-2" />
                  Run Reconciliation
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Filters */}
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search transactions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="reconciled">Reconciled</SelectItem>
                      <SelectItem value="unreconciled">Unreconciled</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" onClick={loadTransactions}>
                    <Search className="w-4 h-4" />
                  </Button>
                </div>

                {/* Transactions List */}
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {transactions.map((transaction) => (
                      <div key={transaction.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {transaction.merchantName || transaction.description}
                            </span>
                            <Badge variant={transaction.isReconciled ? "default" : "secondary"}>
                              {transaction.isReconciled ? "Reconciled" : "Unreconciled"}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">
                              {transaction.transactionType === 'debit' ? '-' : '+'}
                              ${Math.abs(transaction.amount).toFixed(2)}
                            </div>
                            <div className="text-sm text-gray-600">
                              {new Date(transaction.transactionDate).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        
                        {transaction.aiInsights && (
                          <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                            <div>
                              <span className="text-gray-600">Risk Score:</span> {(transaction.aiInsights.riskScore * 100).toFixed(1)}%
                            </div>
                            <div>
                              <span className="text-gray-600">Fraud Score:</span> {(transaction.aiInsights.fraudScore * 100).toFixed(1)}%
                            </div>
                            <div>
                              <span className="text-gray-600">Confidence:</span> {(transaction.aiInsights.confidence * 100).toFixed(1)}%
                            </div>
                            <div>
                              <span className="text-gray-600">Category:</span> {transaction.aiInsights.suggestedCategory || 'Unknown'}
                            </div>
                          </div>
                        )}

                        <div className="flex gap-2">
                          {!transaction.isReconciled && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => autoCategorizeTransaction(transaction.id)}
                            >
                              Auto-Categorize
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => analyzeFraud(transaction.id)}
                          >
                            <Shield className="w-4 h-4 mr-2" />
                            Fraud Analysis
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rules Tab */}
        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reconciliation Rules</CardTitle>
              <CardDescription>AI-powered rules for automatic transaction matching</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rules.map((rule) => (
                  <div key={rule.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="font-semibold">{rule.name}</h3>
                        <p className="text-sm text-gray-600">{rule.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={rule.isActive ? "default" : "secondary"}>
                          {rule.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Badge variant="outline">Priority: {rule.priority}</Badge>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      <div>Created by: {rule.createdByUser.name}</div>
                      <div>Conditions: {rule.conditions}</div>
                      <div>Actions: {rule.actions}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
