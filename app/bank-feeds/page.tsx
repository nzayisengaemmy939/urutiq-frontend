'use client';

import React, { useState, useEffect } from 'react';
import { PageLayout } from '@/components/page-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Building2, 
  CreditCard, 
  RefreshCw, 
  Plus, 
  Search, 
  Filter,
  Download,
  Share2,
  Settings,
  Calendar,
  Users,
  Database,
  Zap,
  Eye,
  Edit,
  Trash2,
  Play,
  Clock,
  CheckCircle,
  AlertCircle,
  Link,
  Unlink,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Banknote,
  Activity,
  Shield,
  Key,
  Wifi,
  WifiOff,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Circle,
  Square,
  CheckSquare
} from 'lucide-react';

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
  syncFrequency: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    bankTransactions: number;
    syncLogs: number;
  };
}

interface BankTransaction {
  id: string;
  connectionId: string;
  externalId?: string;
  transactionDate: string;
  postedDate?: string;
  amount: number;
  currency: string;
  description?: string;
  merchantName?: string;
  merchantCategory?: string;
  transactionType: string;
  reference?: string;
  category?: string;
  tags?: string;
  isReconciled: boolean;
  reconciledAt?: string;
  confidence: number;
  connection: {
    id: string;
    bankName: string;
    accountNumber: string;
  };
  reconciledByUser?: {
    id: string;
    name: string;
    email: string;
  };
  matchedTransaction?: {
    id: string;
    amount: number;
    transactionDate: string;
  };
}

interface ReconciliationRule {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  priority: number;
  createdAt: string;
  createdByUser: {
    id: string;
    name: string;
    email: string;
  };
}

interface SyncLog {
  id: string;
  connectionId: string;
  syncType: string;
  status: string;
  startedAt: string;
  completedAt?: string;
  transactionsFound: number;
  transactionsImported: number;
  transactionsUpdated: number;
  errorMessage?: string;
  connection: {
    id: string;
    bankName: string;
    accountNumber: string;
  };
}

export default function BankFeedsPage() {
  const [connections, setConnections] = useState<BankConnection[]>([]);
  const [transactions, setTransactions] = useState<BankTransaction[]>([]);
  const [rules, setRules] = useState<ReconciliationRule[]>([]);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    fetchConnections();
    fetchTransactions();
    fetchRules();
    fetchSyncLogs();
  }, []);

  const fetchConnections = async () => {
    try {
      const response = await fetch('/api/bank-feeds/connections');
      const data = await response.json();
      setConnections(data.connections || []);
    } catch (error) {
      console.error('Error fetching connections:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/bank-feeds/transactions');
      const data = await response.json();
      setTransactions(data.transactions || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const fetchRules = async () => {
    try {
      const response = await fetch('/api/bank-feeds/reconciliation-rules');
      const data = await response.json();
      setRules(data.rules || []);
    } catch (error) {
      console.error('Error fetching rules:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSyncLogs = async () => {
    try {
      const response = await fetch('/api/bank-feeds/sync-logs');
      const data = await response.json();
      setSyncLogs(data.logs || []);
    } catch (error) {
      console.error('Error fetching sync logs:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>;
      case 'inactive':
        return <Badge variant="secondary"><Circle className="h-3 w-3 mr-1" />Inactive</Badge>;
      case 'error':
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Error</Badge>;
      case 'pending':
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getConnectionTypeIcon = (type: string) => {
    switch (type) {
      case 'plaid':
        return <Link className="h-4 w-4" />;
      case 'yodlee':
        return <Wifi className="h-4 w-4" />;
      case 'manual':
        return <Key className="h-4 w-4" />;
      case 'api':
        return <Database className="h-4 w-4" />;
      default:
        return <Building2 className="h-4 w-4" />;
    }
  };

  const getTransactionTypeIcon = (type: string) => {
    switch (type) {
      case 'credit':
        return <ArrowUp className="h-4 w-4 text-green-600" />;
      case 'debit':
        return <ArrowDown className="h-4 w-4 text-red-600" />;
      case 'transfer':
        return <ArrowUpDown className="h-4 w-4 text-blue-600" />;
      default:
        return <Circle className="h-4 w-4" />;
    }
  };

  const getSyncStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Success</Badge>;
      case 'error':
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Error</Badge>;
      case 'running':
        return <Badge variant="secondary"><RefreshCw className="h-3 w-3 mr-1 animate-spin" />Running</Badge>;
      case 'partial':
        return <Badge variant="outline"><Square className="h-3 w-3 mr-1" />Partial</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredConnections = connections.filter(connection => {
    const matchesSearch = connection.bankName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         connection.accountNumber.includes(searchTerm);
    const matchesStatus = filterStatus === 'all' || connection.status === filterStatus;
    const matchesType = filterType === 'all' || connection.accountType === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = (transaction.description && transaction.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (transaction.merchantName && transaction.merchantName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (transaction.reference && transaction.reference.includes(searchTerm));
    const matchesStatus = filterStatus === 'all' || (filterStatus === 'reconciled' ? transaction.isReconciled : !transaction.isReconciled);
    const matchesType = filterType === 'all' || transaction.transactionType === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <PageLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Bank Feeds</h1>
            <p className="text-muted-foreground">
              Real-time bank transaction synchronization and automated reconciliation
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Connection
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Connections</CardTitle>
              <Link className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{connections.filter(c => c.status === 'active').length}</div>
              <p className="text-xs text-muted-foreground">
                +2 new this month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
              <Banknote className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{transactions.length}</div>
              <p className="text-xs text-muted-foreground">
                +156 this week
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reconciled</CardTitle>
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{transactions.filter(t => t.isReconciled).length}</div>
              <p className="text-xs text-muted-foreground">
                {((transactions.filter(t => t.isReconciled).length / transactions.length) * 100).toFixed(1)}% rate
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Sync</CardTitle>
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2h ago</div>
              <p className="text-xs text-muted-foreground">
                Next sync in 22h
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="connections">Connections</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="reconciliation">Reconciliation</TabsTrigger>
            <TabsTrigger value="sync-logs">Sync Logs</TabsTrigger>
            <TabsTrigger value="rules">Rules</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Building2 className="h-5 w-5 mr-2" />
                    Bank Connections
                  </CardTitle>
                  <CardDescription>Active bank account connections</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {connections.slice(0, 3).map((connection) => (
                      <div key={connection.id} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center space-x-2">
                          {getConnectionTypeIcon(connection.connectionType)}
                          <div>
                            <p className="font-medium">{connection.bankName}</p>
                            <p className="text-sm text-muted-foreground">****{connection.accountNumber.slice(-4)}</p>
                          </div>
                        </div>
                        {getStatusBadge(connection.status)}
                      </div>
                    ))}
                  </div>
                  <Button className="w-full mt-4" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View All
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="h-5 w-5 mr-2" />
                    Recent Transactions
                  </CardTitle>
                  <CardDescription>Latest bank transactions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {transactions.slice(0, 3).map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center space-x-2">
                          {getTransactionTypeIcon(transaction.transactionType)}
                          <div>
                            <p className="font-medium">{transaction.description || 'No description'}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(transaction.transactionDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${Number(transaction.amount).toFixed(2)}</p>
                          <Badge variant={transaction.isReconciled ? "default" : "secondary"} className="text-xs">
                            {transaction.isReconciled ? 'Reconciled' : 'Unreconciled'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button className="w-full mt-4" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View All
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <RefreshCw className="h-5 w-5 mr-2" />
                    Sync Status
                  </CardTitle>
                  <CardDescription>Recent synchronization activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {syncLogs.slice(0, 3).map((log) => (
                      <div key={log.id} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <p className="font-medium">{log.connection.bankName}</p>
                          <p className="text-sm text-muted-foreground">
                            {log.transactionsImported} imported, {log.transactionsUpdated} updated
                          </p>
                        </div>
                        {getSyncStatusBadge(log.status)}
                      </div>
                    ))}
                  </div>
                  <Button className="w-full mt-4" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View All
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Reconciliation Summary</CardTitle>
                <CardDescription>Automated transaction matching results</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {transactions.filter(t => t.isReconciled).length}
                    </div>
                    <p className="text-sm text-muted-foreground">Reconciled</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600">
                      {transactions.filter(t => !t.isReconciled && t.confidence > 0.5).length}
                    </div>
                    <p className="text-sm text-muted-foreground">High Confidence</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-600">
                      {transactions.filter(t => !t.isReconciled && t.confidence <= 0.5).length}
                    </div>
                    <p className="text-sm text-muted-foreground">Needs Review</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Connections Tab */}
          <TabsContent value="connections" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search connections..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 w-64"
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="checking">Checking</SelectItem>
                    <SelectItem value="savings">Savings</SelectItem>
                    <SelectItem value="credit">Credit</SelectItem>
                    <SelectItem value="loan">Loan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Connection
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredConnections.map((connection) => (
                <Card key={connection.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getConnectionTypeIcon(connection.connectionType)}
                        <CardTitle className="text-lg">{connection.bankName}</CardTitle>
                      </div>
                      {getStatusBadge(connection.status)}
                    </div>
                    <CardDescription>
                      Account: ****{connection.accountNumber.slice(-4)} | {connection.accountType}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Type:</span>
                        <span className="font-medium">{connection.connectionType}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Currency:</span>
                        <span className="font-medium">{connection.currency}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Sync Frequency:</span>
                        <span className="font-medium">{connection.syncFrequency}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Transactions:</span>
                        <span className="font-medium">{connection._count.bankTransactions}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Last Sync:</span>
                        <span className="font-medium">
                          {connection.lastSyncAt ? new Date(connection.lastSyncAt).toLocaleDateString() : 'Never'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 mt-4">
                      <Button size="sm" className="flex-1">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Sync Now
                      </Button>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 w-64"
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="reconciled">Reconciled</SelectItem>
                    <SelectItem value="unreconciled">Unreconciled</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="credit">Credit</SelectItem>
                    <SelectItem value="debit">Debit</SelectItem>
                    <SelectItem value="transfer">Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button>
                <ArrowUpDown className="h-4 w-4 mr-2" />
                Reconcile
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="space-y-0">
                  {filteredTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border-b last:border-b-0">
                      <div className="flex items-center space-x-3">
                        {getTransactionTypeIcon(transaction.transactionType)}
                        <div>
                          <p className="font-medium">{transaction.description || 'No description'}</p>
                          <p className="text-sm text-muted-foreground">
                            {transaction.merchantName && `${transaction.merchantName} • `}
                            {new Date(transaction.transactionDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="font-medium">${Number(transaction.amount).toFixed(2)}</p>
                          <p className="text-sm text-muted-foreground">{transaction.currency}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={transaction.isReconciled ? "default" : "secondary"}>
                            {transaction.isReconciled ? 'Reconciled' : 'Unreconciled'}
                          </Badge>
                          {transaction.confidence > 0 && (
                            <Badge variant="outline">
                              {Math.round(transaction.confidence * 100)}% match
                            </Badge>
                          )}
                        </div>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reconciliation Tab */}
          <TabsContent value="reconciliation" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckSquare className="h-5 w-5 mr-2" />
                    Reconciliation Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Total Transactions</span>
                      <span className="font-semibold">{transactions.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Reconciled</span>
                      <span className="font-semibold text-green-600">
                        {transactions.filter(t => t.isReconciled).length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Unreconciled</span>
                      <span className="font-semibold text-red-600">
                        {transactions.filter(t => !t.isReconciled).length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Match Rate</span>
                      <span className="font-semibold">
                        {transactions.length > 0 ? 
                          ((transactions.filter(t => t.isReconciled).length / transactions.length) * 100).toFixed(1) : 0}%
                      </span>
                    </div>
                  </div>
                  <Button className="w-full mt-4">
                    <ArrowUpDown className="h-4 w-4 mr-2" />
                    Run Reconciliation
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    Auto-Matching Rules
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {rules.slice(0, 3).map((rule) => (
                      <div key={rule.id} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <p className="font-medium">{rule.name}</p>
                          <p className="text-sm text-muted-foreground">Priority: {rule.priority}</p>
                        </div>
                        <Badge variant={rule.isActive ? "default" : "secondary"}>
                          {rule.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                  <Button className="w-full mt-4" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Manage Rules
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="h-5 w-5 mr-2" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="font-medium">Auto-reconciliation completed</p>
                        <p className="text-sm text-muted-foreground">2 hours ago</p>
                      </div>
                      <Badge variant="default">Success</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="font-medium">New transactions imported</p>
                        <p className="text-sm text-muted-foreground">4 hours ago</p>
                      </div>
                      <Badge variant="secondary">Info</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="font-medium">Manual reconciliation</p>
                        <p className="text-sm text-muted-foreground">1 day ago</p>
                      </div>
                      <Badge variant="outline">Manual</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Sync Logs Tab */}
          <TabsContent value="sync-logs" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Synchronization Logs</h3>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Logs
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="space-y-0">
                  {syncLogs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-4 border-b last:border-b-0">
                      <div className="flex items-center space-x-3">
                        <div>
                          <p className="font-medium">{log.connection.bankName}</p>
                          <p className="text-sm text-muted-foreground">
                            {log.syncType} sync • {new Date(log.startedAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm">
                            {log.transactionsImported} imported, {log.transactionsUpdated} updated
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {log.transactionsFound} total found
                          </p>
                        </div>
                        {getSyncStatusBadge(log.status)}
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rules Tab */}
          <TabsContent value="rules" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Reconciliation Rules</h3>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Rule
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {rules.map((rule) => (
                <Card key={rule.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{rule.name}</CardTitle>
                      <Badge variant={rule.isActive ? "default" : "secondary"}>
                        {rule.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <CardDescription>
                      {rule.description || 'No description'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Priority:</span>
                        <span className="font-medium">{rule.priority}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Created by:</span>
                        <span className="font-medium">{rule.createdByUser.name}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Created:</span>
                        <span className="font-medium">
                          {new Date(rule.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 mt-4">
                      <Button size="sm" className="flex-1">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}
