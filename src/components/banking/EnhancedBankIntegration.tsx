;

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Building2, 
  CreditCard, 
  TrendingUp, 
  TrendingDown, 
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Calendar,
  BarChart3,
  PieChart,
  Download
} from 'lucide-react';

interface BankConnection {
  id: string;
  bankName: string;
  accountType: string;
  accountName: string;
  currency: string;
  isActive: boolean;
  lastSyncAt?: string;
  nextSyncAt?: string;
  status: 'connected' | 'disconnected' | 'error' | 'pending';
  errorMessage?: string;
}

interface CashFlowForecast {
  id: string;
  forecastPeriod: string;
  confidence: number;
  totalInflows: number;
  totalOutflows: number;
  netCashFlow: number;
  endingBalance: number;
  dailyProjections: DailyProjection[];
  riskFactors: RiskFactor[];
  recommendations: string[];
  createdAt: string;
}

interface DailyProjection {
  date: string;
  expectedInflows: number;
  expectedOutflows: number;
  netFlow: number;
  projectedBalance: number;
  confidence: number;
}

interface RiskFactor {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  impact: number;
  probability: number;
  mitigation: string;
}

interface BankTransaction {
  id: string;
  date: string;
  amount: number;
  currency: string;
  description: string;
  merchantName?: string;
  category?: string;
  transactionType: 'debit' | 'credit';
  status: 'pending' | 'posted';
  isReconciled: boolean;
}

const EnhancedBankIntegration: React.FC = () => {
  const [bankConnections, setBankConnections] = useState<BankConnection[]>([]);
  const [forecasts, setForecasts] = useState<CashFlowForecast[]>([]);
  const [transactions, setTransactions] = useState<BankTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedConnection, setSelectedConnection] = useState<string>('');
  const [forecastPeriod, setForecastPeriod] = useState<'7d' | '14d' | '30d' | '60d' | '90d'>('30d');

  useEffect(() => {
    loadBankConnections();
    loadForecasts();
  }, []);

  const loadBankConnections = async () => {
    try {
      const response = await fetch('/api/banking/connections', {
        headers: {
          'x-tenant-id': 'default',
          'x-company-id': 'default'
        }
      });
      const data = await response.json();
      if (data.success) {
        setBankConnections(data.data);
      }
    } catch (error) {
      console.error('Error loading bank connections:', error);
    }
  };

  const loadForecasts = async () => {
    try {
      const response = await fetch('/api/banking/forecasts?limit=5', {
        headers: {
          'x-tenant-id': 'default',
          'x-company-id': 'default'
        }
      });
      const data = await response.json();
      if (data.success) {
        setForecasts(data.data);
      }
    } catch (error) {
      console.error('Error loading forecasts:', error);
    }
  };

  const loadTransactions = async (connectionId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/banking/transactions?bankConnectionId=${connectionId}&limit=50`, {
        headers: {
          'x-tenant-id': 'default',
          'x-company-id': 'default'
        }
      });
      const data = await response.json();
      if (data.success) {
        setTransactions(data.data);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const syncBankAccount = async (connectionId: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/banking/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': 'default',
          'x-company-id': 'default'
        },
        body: JSON.stringify({
          bankConnectionId: connectionId,
          forceSync: true
        })
      });
      const data = await response.json();
      if (data.success) {
        loadBankConnections();
        if (selectedConnection === connectionId) {
          loadTransactions(connectionId);
        }
      }
    } catch (error) {
      console.error('Error syncing bank account:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateForecast = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/banking/forecast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': 'default',
          'x-company-id': 'default'
        },
        body: JSON.stringify({
          companyId: 'default',
          forecastPeriod
        })
      });
      const data = await response.json();
      if (data.success) {
        loadForecasts();
      }
    } catch (error) {
      console.error('Error generating forecast:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-800';
      case 'disconnected': return 'bg-gray-100 text-gray-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Enhanced Bank Integration</h1>
          <p className="text-gray-600">Real-time bank feeds and advanced cash flow forecasting</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={generateForecast} disabled={loading}>
            <TrendingUp className="h-4 w-4 mr-2" />
            Generate Forecast
          </Button>
          <Button variant="outline">
            <Building2 className="h-4 w-4 mr-2" />
            Connect Bank
          </Button>
        </div>
      </div>

      <Tabs defaultValue="connections" className="space-y-4">
        <TabsList>
          <TabsTrigger value="connections">Bank Connections</TabsTrigger>
          <TabsTrigger value="forecasts">Cash Flow Forecasts</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Bank Connections Tab */}
        <TabsContent value="connections" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bankConnections.map((connection) => (
              <Card key={connection.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{connection.bankName}</CardTitle>
                    <Badge className={getStatusColor(connection.status)}>
                      {connection.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{connection.accountName}</p>
                  <p className="text-xs text-gray-500 capitalize">{connection.accountType}</p>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Last Sync:</span>
                      <span className="text-gray-600">
                        {connection.lastSyncAt 
                          ? new Date(connection.lastSyncAt).toLocaleDateString()
                          : 'Never'
                        }
                      </span>
                    </div>
                    {connection.nextSyncAt && (
                      <div className="flex items-center justify-between text-sm">
                        <span>Next Sync:</span>
                        <span className="text-gray-600">
                          {new Date(connection.nextSyncAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {connection.errorMessage && (
                      <Alert className="mt-2">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                          {connection.errorMessage}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => syncBankAccount(connection.id)}
                      disabled={loading}
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Sync
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        setSelectedConnection(connection.id);
                        loadTransactions(connection.id);
                      }}
                    >
                      View Transactions
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Cash Flow Forecasts Tab */}
        <TabsContent value="forecasts" className="space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <Select value={forecastPeriod} onValueChange={(value: any) => setForecastPeriod(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">7 Days</SelectItem>
                <SelectItem value="14d">14 Days</SelectItem>
                <SelectItem value="30d">30 Days</SelectItem>
                <SelectItem value="60d">60 Days</SelectItem>
                <SelectItem value="90d">90 Days</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={generateForecast} disabled={loading}>
              Generate New Forecast
            </Button>
          </div>

          {forecasts.map((forecast) => (
            <Card key={forecast.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    Cash Flow Forecast - {forecast.forecastPeriod}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {forecast.confidence}% Confidence
                    </Badge>
                    <Badge className={getStatusColor('connected')}>
                      {new Date(forecast.createdAt).toLocaleDateString()}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      ${forecast.totalInflows.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Total Inflows</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      ${forecast.totalOutflows.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Total Outflows</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${forecast.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${forecast.netCashFlow.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Net Cash Flow</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      ${forecast.endingBalance.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Ending Balance</div>
                  </div>
                </div>

                {/* Risk Factors */}
                {forecast.riskFactors.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">Risk Factors</h3>
                    <div className="space-y-2">
                      {forecast.riskFactors.map((risk, index) => (
                        <Alert key={index}>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            <div className="flex items-center justify-between">
                              <span>{risk.description}</span>
                              <Badge className={getSeverityColor(risk.severity)}>
                                {risk.severity}
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              {risk.mitigation}
                            </div>
                          </AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {forecast.recommendations.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">Recommendations</h3>
                    <ul className="space-y-1">
                      {forecast.recommendations.map((recommendation, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>{recommendation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Daily Projections Chart */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Daily Projections</h3>
                  <div className="space-y-2">
                    {forecast.dailyProjections.slice(0, 7).map((projection, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div className="flex items-center gap-4">
                          <div className="text-sm font-medium">
                            {new Date(projection.date).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {projection.confidence}% confidence
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="text-green-600">
                            +${projection.expectedInflows.toLocaleString()}
                          </div>
                          <div className="text-red-600">
                            -${projection.expectedOutflows.toLocaleString()}
                          </div>
                          <div className={`font-medium ${projection.netFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ${projection.netFlow.toLocaleString()}
                          </div>
                          <div className="text-blue-600 font-medium">
                            ${projection.projectedBalance.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <Select value={selectedConnection} onValueChange={setSelectedConnection}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select bank connection" />
              </SelectTrigger>
              <SelectContent>
                {bankConnections.map((connection) => (
                  <SelectItem key={connection.id} value={connection.id}>
                    {connection.bankName} - {connection.accountName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedConnection && (
              <Button 
                onClick={() => loadTransactions(selectedConnection)}
                disabled={loading}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Load Transactions
              </Button>
            )}
          </div>

          {loading && (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              Loading transactions...
            </div>
          )}

          {transactions.length > 0 && (
            <div className="space-y-2">
              {transactions.map((transaction) => (
                <Card key={transaction.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-full ${transaction.transactionType === 'credit' ? 'bg-green-100' : 'bg-red-100'}`}>
                          {transaction.transactionType === 'credit' ? (
                            <TrendingUp className="h-4 w-4 text-green-600" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{transaction.description}</div>
                          <div className="text-sm text-gray-600">
                            {transaction.merchantName && `${transaction.merchantName} • `}
                            {new Date(transaction.date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {transaction.category && (
                          <Badge variant="outline">{transaction.category}</Badge>
                        )}
                        <div className={`font-medium ${transaction.transactionType === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.transactionType === 'credit' ? '+' : '-'}${Math.abs(transaction.amount).toLocaleString()}
                        </div>
                        <Badge className={transaction.isReconciled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {transaction.isReconciled ? 'Reconciled' : 'Pending'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Accounts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{bankConnections.length}</div>
                <p className="text-xs text-gray-600">Connected bank accounts</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Connections</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {bankConnections.filter(c => c.isActive).length}
                </div>
                <p className="text-xs text-gray-600">Currently syncing</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Recent Forecasts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{forecasts.length}</div>
                <p className="text-xs text-gray-600">Generated this month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Avg Confidence</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {forecasts.length > 0 
                    ? Math.round(forecasts.reduce((sum, f) => sum + f.confidence, 0) / forecasts.length)
                    : 0}%
                </div>
                <p className="text-xs text-gray-600">Forecast accuracy</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedBankIntegration;
