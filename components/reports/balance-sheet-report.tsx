"use client";

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
  BarChart3,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

interface BalanceSheetAccount {
  id: string;
  code: string;
  name: string;
  balance: number;
  isDebit: boolean;
}

interface BalanceSheetData {
  reportType: string;
  asOfDate: string;
  assets: {
    accounts: BalanceSheetAccount[];
    total: number;
  };
  liabilities: {
    accounts: BalanceSheetAccount[];
    total: number;
  };
  equity: {
    accounts: BalanceSheetAccount[];
    total: number;
  };
  summary: {
    totalAssets: number;
    totalLiabilities: number;
    totalEquity: number;
    totalLiabilitiesAndEquity: number;
    isBalanced: boolean;
  };
  generatedAt: string;
}

interface BalanceSheetReportProps {
  dateRange: {
    startDate: string;
    endDate: string;
  };
  asOfDate: string;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

export function BalanceSheetReport({ asOfDate, loading, setLoading }: BalanceSheetReportProps) {
  const [data, setData] = useState<BalanceSheetData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        asOfDate: asOfDate
      });

      const response = await fetch(`/api/accounting-reports/balance-sheet?${params}`, {
        headers: {
          'x-tenant-id': 'tenant_demo',
          'x-company-id': 'seed-company-1'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch balance sheet data');
      }

      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching balance sheet:', error);
      toast.error('Failed to load balance sheet data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [asOfDate]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const filteredAccounts = (accounts: BalanceSheetAccount[]) => {
    return accounts.filter(account =>
      account.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const getAccountTypeColor = (type: string) => {
    switch (type) {
      case 'Asset': return 'bg-blue-100 text-blue-800';
      case 'Liability': return 'bg-red-100 text-red-800';
      case 'Equity': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Loading balance sheet...</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <BarChart3 className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
        <p className="text-muted-foreground">No balance sheet data available</p>
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
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(data.summary.totalAssets)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Liabilities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(data.summary.totalLiabilities)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Equity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(data.summary.totalEquity)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Balance Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {data.summary.isBalanced ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-red-600" />
              )}
              <span className={`text-sm font-medium ${
                data.summary.isBalanced ? 'text-green-600' : 'text-red-600'
              }`}>
                {data.summary.isBalanced ? 'Balanced' : 'Out of Balance'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Assets = Liabilities + Equity
            </p>
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

      {/* Balance Sheet */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Assets */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-blue-600">
              <BarChart3 className="h-5 w-5 mr-2" />
              ASSETS
            </CardTitle>
            <CardDescription>
              Resources owned by the company
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Account</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAccounts(data.assets.accounts).map((account) => (
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
                      <TableCell className="text-right font-mono font-medium">
                        {formatCurrency(account.balance)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between items-center font-bold text-lg">
                <span>Total Assets</span>
                <span className="font-mono text-blue-600">
                  {formatCurrency(data.assets.total)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Liabilities & Equity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-red-600">
              <TrendingDown className="h-5 w-5 mr-2" />
              LIABILITIES & EQUITY
            </CardTitle>
            <CardDescription>
              What the company owes and owns
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Liabilities */}
            <div>
              <h4 className="font-semibold text-red-600 mb-3">LIABILITIES</h4>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Account</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAccounts(data.liabilities.accounts).map((account) => (
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
                        <TableCell className="text-right font-mono font-medium">
                          {formatCurrency(account.balance)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-3 pt-3 border-t">
                <div className="flex justify-between items-center font-semibold">
                  <span>Total Liabilities</span>
                  <span className="font-mono text-red-600">
                    {formatCurrency(data.liabilities.total)}
                  </span>
                </div>
              </div>
            </div>

            {/* Equity */}
            <div>
              <h4 className="font-semibold text-green-600 mb-3">EQUITY</h4>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Account</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAccounts(data.equity.accounts).map((account) => (
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
                        <TableCell className="text-right font-mono font-medium">
                          {formatCurrency(account.balance)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-3 pt-3 border-t">
                <div className="flex justify-between items-center font-semibold">
                  <span>Total Equity</span>
                  <span className="font-mono text-green-600">
                    {formatCurrency(data.equity.total)}
                  </span>
                </div>
              </div>
            </div>

            {/* Total Liabilities & Equity */}
            <div className="pt-4 border-t-2">
              <div className="flex justify-between items-center font-bold text-lg">
                <span>Total Liabilities & Equity</span>
                <span className="font-mono text-red-600">
                  {formatCurrency(data.summary.totalLiabilitiesAndEquity)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Balance Verification */}
      <Card>
        <CardHeader>
          <CardTitle>Balance Verification</CardTitle>
          <CardDescription>
            The fundamental accounting equation: Assets = Liabilities + Equity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(data.summary.totalAssets)}
              </div>
              <div className="text-sm text-muted-foreground">Total Assets</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">=</div>
              <div className="text-sm text-muted-foreground">Equals</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(data.summary.totalLiabilitiesAndEquity)}
              </div>
              <div className="text-sm text-muted-foreground">Liabilities + Equity</div>
            </div>
          </div>
          <div className="mt-4 text-center">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              data.summary.isBalanced 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {data.summary.isBalanced ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Balance Sheet is Balanced
                </>
              ) : (
                <>
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  Balance Sheet is Out of Balance
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Info */}
      <div className="text-xs text-muted-foreground">
        Generated on {new Date(data.generatedAt).toLocaleString()} • As of {formatDate(data.asOfDate)}
      </div>
    </div>
  );
}
