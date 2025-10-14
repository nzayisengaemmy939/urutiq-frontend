;

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Download, 
  Search, 
  RefreshCw, 
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  Calculator
} from 'lucide-react';
import { toast } from 'sonner';

interface IncomeStatementAccount {
  id: string;
  code: string;
  name: string;
  amount: number;
}

interface IncomeStatementData {
  reportType: string;
  period: {
    startDate: string;
    endDate: string;
  };
  revenue: {
    accounts: IncomeStatementAccount[];
    total: number;
  };
  expenses: {
    accounts: IncomeStatementAccount[];
    total: number;
  };
  summary: {
    totalRevenue: number;
    totalExpenses: number;
    grossProfit: number;
    netIncome: number;
    margin: number;
  };
  generatedAt: string;
}

interface IncomeStatementReportProps {
  dateRange: {
    startDate: string;
    endDate: string;
  };
  asOfDate: string;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

export function IncomeStatementReport({ dateRange, asOfDate, loading, setLoading }: IncomeStatementReportProps) {
  const [data, setData] = useState<IncomeStatementData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      });

      const response = await fetch(`/api/accounting-reports/income-statement?${params}`, {
        headers: {
          'x-tenant-id': 'tenant_demo',
          'x-company-id': 'seed-company-1'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch income statement data');
      }

      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching income statement:', error);
      toast.error('Failed to load income statement data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const filteredAccounts = (accounts: IncomeStatementAccount[]) => {
    return accounts.filter(account =>
      account.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const getMarginColor = (margin: number) => {
    if (margin > 20) return 'text-green-600';
    if (margin > 10) return 'text-yellow-600';
    if (margin > 0) return 'text-orange-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Loading income statement...</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <TrendingUp className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
        <p className="text-muted-foreground">No income statement data available</p>
        <Button onClick={fetchData} className="mt-4">
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(data.summary.totalRevenue)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(data.summary.totalExpenses)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Net Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              data.summary.netIncome >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatCurrency(data.summary.netIncome)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getMarginColor(data.summary.margin)}`}>
              {formatPercentage(data.summary.margin)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search accounts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Income Statement */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            INCOME STATEMENT
          </CardTitle>
          <CardDescription>
            Period: {formatDate(data.period.startDate)} - {formatDate(data.period.endDate)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Revenue Section */}
            <div>
              <h3 className="text-lg font-semibold text-green-600 mb-4 flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                REVENUE
              </h3>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Account</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAccounts(data.revenue.accounts).map((account) => (
                      <TableRow key={account.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-mono text-sm font-medium">
                              {account.code}
                            </div>
                            <div className="text-sm">
                              {account.name}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-mono font-medium text-green-600">
                          {formatCurrency(account.amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between items-center font-bold text-lg">
                  <span>Total Revenue</span>
                  <span className="font-mono text-green-600">
                    {formatCurrency(data.revenue.total)}
                  </span>
                </div>
              </div>
            </div>

            {/* Expenses Section */}
            <div>
              <h3 className="text-lg font-semibold text-red-600 mb-4 flex items-center">
                <TrendingDown className="h-5 w-5 mr-2" />
                EXPENSES
              </h3>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Account</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAccounts(data.expenses.accounts).map((account) => (
                      <TableRow key={account.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-mono text-sm font-medium">
                              {account.code}
                            </div>
                            <div className="text-sm">
                              {account.name}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-mono font-medium text-red-600">
                          {formatCurrency(account.amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between items-center font-bold text-lg">
                  <span>Total Expenses</span>
                  <span className="font-mono text-red-600">
                    {formatCurrency(data.expenses.total)}
                  </span>
                </div>
              </div>
            </div>

            {/* Net Income Section */}
            <div className="pt-6 border-t-2">
              <div className="flex justify-between items-center font-bold text-xl">
                <span className="flex items-center">
                  <Calculator className="h-5 w-5 mr-2" />
                  Net Income
                </span>
                <span className={`font-mono ${
                  data.summary.netIncome >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(data.summary.netIncome)}
                </span>
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                Revenue - Expenses = Net Income
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profitability Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Profitability Analysis</CardTitle>
          <CardDescription>
            Key financial ratios and metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {formatPercentage(data.summary.margin)}
              </div>
              <div className="text-sm text-muted-foreground">Profit Margin</div>
              <div className="text-xs text-muted-foreground mt-1">
                (Net Income / Revenue) × 100
              </div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(data.summary.totalRevenue)}
              </div>
              <div className="text-sm text-muted-foreground">Total Revenue</div>
              <div className="text-xs text-muted-foreground mt-1">
                Gross income before expenses
              </div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(data.summary.totalExpenses)}
              </div>
              <div className="text-sm text-muted-foreground">Total Expenses</div>
              <div className="text-xs text-muted-foreground mt-1">
                All operating costs
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Info */}
      <div className="text-xs text-muted-foreground">
        Generated on {new Date(data.generatedAt).toLocaleString()}
      </div>
    </div>
  );
}
