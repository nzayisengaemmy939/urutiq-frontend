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
  CreditCard,
  AlertTriangle,
  Clock,
  DollarSign,
  TrendingDown
} from 'lucide-react';
import { toast } from 'sonner';

interface APAgingVendor {
  vendorId: string;
  vendorName: string;
  vendorEmail: string;
  totalOutstanding: number;
  aging: {
    current: number;
    days30: number;
    days60: number;
    days90: number;
    over90: number;
  };
  billCount: number;
}

interface APAgingData {
  reportType: string;
  asOfDate: string;
  vendors: APAgingVendor[];
  totals: {
    current: number;
    days30: number;
    days60: number;
    days90: number;
    over90: number;
    total: number;
  };
  generatedAt: string;
}

interface APAgingReportProps {
  dateRange: {
    startDate: string;
    endDate: string;
  };
  asOfDate: string;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

export function APAgingReport({ asOfDate, loading, setLoading }: APAgingReportProps) {
  const [data, setData] = useState<APAgingData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        asOfDate: asOfDate
      });

      const response = await fetch(`/api/accounting-reports/ap-aging?${params}`, {
        headers: {
          'x-tenant-id': 'tenant_demo',
          'x-company-id': 'seed-company-1'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch AP aging data');
      }

      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching AP aging:', error);
      toast.error('Failed to load AP aging data');
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

  const filteredVendors = data?.vendors.filter(vendor =>
    vendor.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.vendorEmail.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getAgingColor = (amount: number, category: string) => {
    if (amount === 0) return 'text-muted-foreground';
    
    switch (category) {
      case 'current': return 'text-green-600';
      case 'days30': return 'text-yellow-600';
      case 'days60': return 'text-orange-600';
      case 'days90': return 'text-red-600';
      case 'over90': return 'text-red-800';
      default: return 'text-muted-foreground';
    }
  };

  const getAgingBadgeColor = (amount: number, category: string) => {
    if (amount === 0) return 'bg-gray-100 text-gray-800';
    
    switch (category) {
      case 'current': return 'bg-green-100 text-green-800';
      case 'days30': return 'bg-yellow-100 text-yellow-800';
      case 'days60': return 'bg-orange-100 text-orange-800';
      case 'days90': return 'bg-red-100 text-red-800';
      case 'over90': return 'bg-red-200 text-red-900';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Loading AP aging report...</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <CreditCard className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
        <p className="text-muted-foreground">No AP aging data available</p>
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Outstanding</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(data.totals.total)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Current</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(data.totals.current)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">1-30 Days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {formatCurrency(data.totals.days30)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">31-60 Days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(data.totals.days60)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">61-90 Days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(data.totals.days90)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Over 90 Days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-800">
              {formatCurrency(data.totals.over90)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search vendors..."
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

      {/* AP Aging Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="h-5 w-5 mr-2" />
            ACCOUNTS PAYABLE AGING
          </CardTitle>
          <CardDescription>
            As of {formatDate(data.asOfDate)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendor</TableHead>
                  <TableHead className="text-right">Current</TableHead>
                  <TableHead className="text-right">1-30 Days</TableHead>
                  <TableHead className="text-right">31-60 Days</TableHead>
                  <TableHead className="text-right">61-90 Days</TableHead>
                  <TableHead className="text-right">Over 90 Days</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Bills</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVendors.map((vendor) => (
                  <TableRow key={vendor.vendorId}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{vendor.vendorName}</div>
                        <div className="text-sm text-muted-foreground">
                          {vendor.vendorEmail}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      <span className={getAgingColor(vendor.aging.current, 'current')}>
                        {formatCurrency(vendor.aging.current)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      <span className={getAgingColor(vendor.aging.days30, 'days30')}>
                        {formatCurrency(vendor.aging.days30)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      <span className={getAgingColor(vendor.aging.days60, 'days60')}>
                        {formatCurrency(vendor.aging.days60)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      <span className={getAgingColor(vendor.aging.days90, 'days90')}>
                        {formatCurrency(vendor.aging.days90)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      <span className={getAgingColor(vendor.aging.over90, 'over90')}>
                        {formatCurrency(vendor.aging.over90)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold">
                      {formatCurrency(vendor.totalOutstanding)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline">
                        {vendor.billCount}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Totals Row */}
          <div className="mt-4 pt-4 border-t">
            <div className="grid grid-cols-8 gap-4 text-sm font-bold">
              <div className="col-span-1">TOTALS</div>
              <div className="text-right font-mono text-green-600">
                {formatCurrency(data.totals.current)}
              </div>
              <div className="text-right font-mono text-yellow-600">
                {formatCurrency(data.totals.days30)}
              </div>
              <div className="text-right font-mono text-orange-600">
                {formatCurrency(data.totals.days60)}
              </div>
              <div className="text-right font-mono text-red-600">
                {formatCurrency(data.totals.days90)}
              </div>
              <div className="text-right font-mono text-red-800">
                {formatCurrency(data.totals.over90)}
              </div>
              <div className="text-right font-mono text-blue-600">
                {formatCurrency(data.totals.total)}
              </div>
              <div className="text-right">
                <Badge variant="outline">
                  {data.vendors.reduce((sum, v) => sum + v.billCount, 0)}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Aging Analysis */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingDown className="h-5 w-5 mr-2" />
              Aging Distribution
            </CardTitle>
            <CardDescription>
              Percentage breakdown by aging category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { label: 'Current', amount: data.totals.current, color: 'bg-green-500' },
                { label: '1-30 Days', amount: data.totals.days30, color: 'bg-yellow-500' },
                { label: '31-60 Days', amount: data.totals.days60, color: 'bg-orange-500' },
                { label: '61-90 Days', amount: data.totals.days90, color: 'bg-red-500' },
                { label: 'Over 90 Days', amount: data.totals.over90, color: 'bg-red-700' }
              ].map((item) => {
                const percentage = data.totals.total > 0 ? (item.amount / data.totals.total) * 100 : 0;
                return (
                  <div key={item.label} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{item.label}</span>
                      <span className="font-mono">{formatCurrency(item.amount)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${item.color}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground text-right">
                      {percentage.toFixed(1)}%
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Payment Priority
            </CardTitle>
            <CardDescription>
              Payment urgency by aging category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                  <span className="text-sm font-medium">On Time</span>
                </div>
                <span className="text-sm font-mono text-green-600">
                  {formatCurrency(data.totals.current)}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                  <span className="text-sm font-medium">Due Soon</span>
                </div>
                <span className="text-sm font-mono text-yellow-600">
                  {formatCurrency(data.totals.days30)}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full" />
                  <span className="text-sm font-medium">Overdue</span>
                </div>
                <span className="text-sm font-mono text-orange-600">
                  {formatCurrency(data.totals.days60 + data.totals.days90)}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full" />
                  <span className="text-sm font-medium">Critical</span>
                </div>
                <span className="text-sm font-mono text-red-600">
                  {formatCurrency(data.totals.over90)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Info */}
      <div className="text-xs text-muted-foreground">
        Generated on {new Date(data.generatedAt).toLocaleString()}
      </div>
    </div>
  );
}
