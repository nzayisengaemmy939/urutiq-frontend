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
  Eye,
  ChevronLeft,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { toast } from 'sonner';

interface GeneralLedgerEntry {
  id: string;
  date: string;
  account: {
    id: string;
    code: string;
    name: string;
    type: string;
  };
  entry: {
    id: string;
    memo: string;
    reference: string;
    status: string;
  };
  debit: number;
  credit: number;
  balance: number;
}

interface GeneralLedgerData {
  reportType: string;
  period: {
    startDate: string;
    endDate: string;
  };
  entries: GeneralLedgerEntry[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  generatedAt: string;
}

interface GeneralLedgerReportProps {
  dateRange: {
    startDate: string;
    endDate: string;
  };
  asOfDate: string;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

export function GeneralLedgerReport({ dateRange, asOfDate, loading, setLoading }: GeneralLedgerReportProps) {
  const [data, setData] = useState<GeneralLedgerData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAccount, setFilterAccount] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<string>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const fetchData = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        page: page.toString(),
        limit: '50'
      });

      if (filterAccount !== 'all') {
        params.append('accountId', filterAccount);
      }

      const response = await fetch(`/api/accounting-reports/general-ledger?${params}`, {
        headers: {
          'x-tenant-id': 'tenant_demo',
          'x-company-id': 'seed-company-1'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch general ledger data');
      }

      const result = await response.json();
      setData(result);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error fetching general ledger:', error);
      toast.error('Failed to load general ledger data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1);
  }, [dateRange, filterAccount]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'POSTED': return 'bg-green-100 text-green-800';
      case 'DRAFT': return 'bg-yellow-100 text-yellow-800';
      case 'PENDING': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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

  const filteredEntries = data?.entries.filter(entry => {
    const matchesSearch = 
      entry.account.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.entry.memo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.entry.reference.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  }) || [];

  const sortedEntries = [...filteredEntries].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'date':
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
        break;
      case 'account':
        comparison = a.account.code.localeCompare(b.account.code);
        break;
      case 'amount':
        comparison = Math.abs(a.debit - a.credit) - Math.abs(b.debit - b.credit);
        break;
      default:
        comparison = 0;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= (data?.pagination.pages || 1)) {
      fetchData(newPage);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Loading general ledger...</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <BookOpen className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
        <p className="text-muted-foreground">No general ledger data available</p>
        <Button onClick={() => fetchData(1)} className="mt-4">
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.pagination.total.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Current Page</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.pagination.page} of {data.pagination.pages}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Entries per Page</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.pagination.limit}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Filtered Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredEntries.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search entries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <div className="flex gap-2">
          <Select value={filterAccount} onValueChange={setFilterAccount}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by account" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Accounts</SelectItem>
              {/* In a real app, you'd fetch accounts from the API */}
              <SelectItem value="1000">1000 - Cash</SelectItem>
              <SelectItem value="1100">1100 - Accounts Receivable</SelectItem>
              <SelectItem value="2000">2000 - Accounts Payable</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="account">Account</SelectItem>
              <SelectItem value="amount">Amount</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </Button>
          <Button variant="outline" onClick={() => fetchData(currentPage)}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* General Ledger Table */}
      <Card>
        <CardHeader>
          <CardTitle>General Ledger</CardTitle>
          <CardDescription>
            Period: {formatDate(data.period.startDate)} - {formatDate(data.period.endDate)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Debit</TableHead>
                  <TableHead className="text-right">Credit</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-mono text-sm">
                      {formatDate(entry.date)}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-mono text-sm font-medium">
                          {entry.account.code}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {entry.account.name}
                        </div>
                        <Badge
                          variant="secondary"
                          className={`text-xs ${getAccountTypeColor(typeof entry.account.type === 'string' ? entry.account.type : entry.account.type?.name)}`}
                        >
                          {typeof entry.account.type === 'string' ? entry.account.type : (entry.account.type?.name || 'Unknown')}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="truncate" title={entry.entry.memo}>
                        {entry.entry.memo || '-'}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {entry.entry.reference || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={getStatusColor(entry.entry.status)}
                      >
                        {entry.entry.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {entry.debit > 0 ? formatCurrency(entry.debit) : '-'}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {entry.credit > 0 ? formatCurrency(entry.credit) : '-'}
                    </TableCell>
                    <TableCell className={`text-right font-mono font-medium ${
                      entry.balance > 0 ? 'text-red-600' : entry.balance < 0 ? 'text-green-600' : 'text-muted-foreground'
                    }`}>
                      {entry.balance !== 0 ? formatCurrency(Math.abs(entry.balance)) : '-'}
                      {entry.balance !== 0 && (
                        <span className="ml-1 text-xs">
                          {entry.balance > 0 ? 'DR' : 'CR'}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {data.pagination.pages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {((data.pagination.page - 1) * data.pagination.limit) + 1} to{' '}
                {Math.min(data.pagination.page * data.pagination.limit, data.pagination.total)} of{' '}
                {data.pagination.total} entries
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, data.pagination.pages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                        className="w-8 h-8 p-0"
                      >
                        {page}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= data.pagination.pages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Report Info */}
      <div className="text-xs text-muted-foreground">
        Generated on {new Date(data.generatedAt).toLocaleString()}
      </div>
    </div>
  );
}
