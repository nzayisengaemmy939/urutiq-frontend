"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Download, 
  Search, 
  Filter, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle,
  Calculator,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';
import { exportToPDF, exportToCSV, formatCurrency as formatCurrencyUtil } from '@/lib/report-export';
import { apiClient } from '@/lib/api-client';

interface TrialBalanceAccount {
  accountId: string;
  accountCode: string;
  accountName: string;
  accountType: string;
  debitTotal: number;
  creditTotal: number;
  balance: number;
  isDebit: boolean;
}

interface TrialBalanceData {
  reportType: string;
  period: {
    startDate: string;
    endDate: string;
  };
  accounts: TrialBalanceAccount[];
  summary: {
    totalDebits: number;
    totalCredits: number;
    difference: number;
    isBalanced: boolean;
  };
  generatedAt: string;
}

interface TrialBalanceReportProps {
  dateRange: {
    startDate: string;
    endDate: string;
  };
  asOfDate: string;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

export function TrialBalanceReport({ dateRange, asOfDate, loading, setLoading }: TrialBalanceReportProps) {
  const [data, setData] = useState<TrialBalanceData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('code');

  const fetchData = async () => {
    setLoading(true);
    try {
      console.log('Fetching trial balance data...');
      
      const result = await apiClient.get<TrialBalanceData>('/api/accounting-reports/trial-balance', {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      });

      setData(result);
    } catch (error) {
      console.error('Error fetching trial balance:', error);
      toast.error('Failed to load trial balance data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const formatCurrency = formatCurrencyUtil;

  const filteredAccounts = data?.accounts.filter(account => {
    const matchesSearch = 
      account.accountCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.accountType.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === 'all' || account.accountType === filterType;
    
    return matchesSearch && matchesFilter;
  }) || [];

  const sortedAccounts = [...filteredAccounts].sort((a, b) => {
    switch (sortBy) {
      case 'code':
        return a.accountCode.localeCompare(b.accountCode);
      case 'name':
        return a.accountName.localeCompare(b.accountName);
      case 'type':
        return a.accountType.localeCompare(b.accountType);
      case 'balance':
        return Math.abs(b.balance) - Math.abs(a.balance);
      default:
        return 0;
    }
  });

  const getAccountTypeColor = (type: string) => {
    switch (type) {
      case 'Asset': return 'bg-blue-100 text-blue-800';
      case 'Liability': return 'bg-red-100 text-red-800';
      case 'Equity': return 'bg-green-100 text-green-800';
      case 'Revenue': return 'bg-purple-100 text-purple-800';
      case 'Expense': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleExportPDF = () => {
    if (!data) return;
    
    const exportData = sortedAccounts.map(account => ({
      accountCode: account.accountCode,
      accountName: account.accountName,
      accountType: account.accountType,
      debitTotal: account.debitTotal,
      creditTotal: account.creditTotal,
      balance: account.balance,
      balanceType: account.isDebit ? 'DR' : 'CR'
    }));

    exportToPDF({
      title: 'Trial Balance',
      subtitle: `Period: ${new Date(data.period.startDate).toLocaleDateString()} - ${new Date(data.period.endDate).toLocaleDateString()}`,
      data: exportData,
      columns: [
        { key: 'accountCode', label: 'Account Code', width: 20 },
        { key: 'accountName', label: 'Account Name', width: 40 },
        { key: 'accountType', label: 'Type', width: 15 },
        { key: 'debitTotal', label: 'Debit Total', width: 20, align: 'right' },
        { key: 'creditTotal', label: 'Credit Total', width: 20, align: 'right' },
        { key: 'balance', label: 'Balance', width: 20, align: 'right' },
        { key: 'balanceType', label: 'DR/CR', width: 10, align: 'center' }
      ],
      summary: [
        { label: 'Total Debits:', value: formatCurrency(data.summary.totalDebits) },
        { label: 'Total Credits:', value: formatCurrency(data.summary.totalCredits) },
        { label: 'Difference:', value: formatCurrency(data.summary.difference) },
        { label: 'Status:', value: data.summary.isBalanced ? 'Balanced' : 'Out of Balance' }
      ],
      filename: `Trial_Balance_${new Date().toISOString().split('T')[0]}.pdf`
    });
  };

  const handleExportCSV = () => {
    if (!data) return;
    
    const exportData = sortedAccounts.map(account => ({
      accountCode: account.accountCode,
      accountName: account.accountName,
      accountType: account.accountType,
      debitTotal: account.debitTotal,
      creditTotal: account.creditTotal,
      balance: account.balance,
      balanceType: account.isDebit ? 'DR' : 'CR'
    }));

    exportToCSV({
      title: 'Trial Balance',
      subtitle: `Period: ${new Date(data.period.startDate).toLocaleDateString()} - ${new Date(data.period.endDate).toLocaleDateString()}`,
      data: exportData,
      columns: [
        { key: 'accountCode', label: 'Account Code' },
        { key: 'accountName', label: 'Account Name' },
        { key: 'accountType', label: 'Type' },
        { key: 'debitTotal', label: 'Debit Total' },
        { key: 'creditTotal', label: 'Credit Total' },
        { key: 'balance', label: 'Balance' },
        { key: 'balanceType', label: 'DR/CR' }
      ],
      filename: `Trial_Balance_${new Date().toISOString().split('T')[0]}.csv`
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Loading trial balance...</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
        <p className="text-muted-foreground">No trial balance data available</p>
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
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Debits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(data.summary.totalDebits)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(data.summary.totalCredits)}
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
            {!data.summary.isBalanced && (
              <p className="text-xs text-muted-foreground mt-1">
                Difference: {formatCurrency(data.summary.difference)}
              </p>
            )}
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
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Asset">Assets</SelectItem>
              <SelectItem value="Liability">Liabilities</SelectItem>
              <SelectItem value="Equity">Equity</SelectItem>
              <SelectItem value="Revenue">Revenue</SelectItem>
              <SelectItem value="Expense">Expenses</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="code">Account Code</SelectItem>
              <SelectItem value="name">Account Name</SelectItem>
              <SelectItem value="type">Account Type</SelectItem>
              <SelectItem value="balance">Balance</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={fetchData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={handleExportPDF}>
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Trial Balance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Trial Balance</CardTitle>
          <CardDescription>
            Period: {new Date(data.period.startDate).toLocaleDateString()} - {new Date(data.period.endDate).toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account Code</TableHead>
                  <TableHead>Account Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Debit Total</TableHead>
                  <TableHead className="text-right">Credit Total</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedAccounts.map((account) => (
                  <TableRow key={account.accountId}>
                    <TableCell className="font-mono text-sm">
                      {account.accountCode}
                    </TableCell>
                    <TableCell className="font-medium">
                      {account.accountName}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={getAccountTypeColor(account.accountType)}
                      >
                        {account.accountType}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {account.debitTotal > 0 ? formatCurrency(account.debitTotal) : '-'}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {account.creditTotal > 0 ? formatCurrency(account.creditTotal) : '-'}
                    </TableCell>
                    <TableCell className={`text-right font-mono font-medium ${
                      account.balance > 0 ? 'text-red-600' : account.balance < 0 ? 'text-green-600' : 'text-muted-foreground'
                    }`}>
                      {account.balance !== 0 ? formatCurrency(Math.abs(account.balance)) : '-'}
                      {account.balance !== 0 && (
                        <span className="ml-1 text-xs">
                          {account.isDebit ? 'DR' : 'CR'}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Totals Row */}
          <div className="mt-4 pt-4 border-t">
            <div className="grid grid-cols-6 gap-4 text-sm font-medium">
              <div className="col-span-3"></div>
              <div className="text-right font-mono">
                {formatCurrency(data.summary.totalDebits)}
              </div>
              <div className="text-right font-mono">
                {formatCurrency(data.summary.totalCredits)}
              </div>
              <div className="text-right font-mono">
                {formatCurrency(data.summary.difference)}
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
