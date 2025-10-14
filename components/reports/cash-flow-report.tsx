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
  Activity,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { toast } from 'sonner';

interface CashFlowItem {
  id: string;
  name: string;
  amount: number;
  type: 'operating' | 'investing' | 'financing';
}

interface CashFlowData {
  reportType: string;
  period: {
    startDate: string;
    endDate: string;
  };
  operating: {
    items: CashFlowItem[];
    total: number;
  };
  investing: {
    items: CashFlowItem[];
    total: number;
  };
  financing: {
    items: CashFlowItem[];
    total: number;
  };
  summary: {
    netCashFlow: number;
    beginningCash: number;
    endingCash: number;
  };
  generatedAt: string;
}

interface CashFlowReportProps {
  dateRange: {
    startDate: string;
    endDate: string;
  };
  asOfDate: string;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

export function CashFlowReport({ dateRange, asOfDate, loading, setLoading }: CashFlowReportProps) {
  const [data, setData] = useState<CashFlowData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      });

      const response = await fetch(`/api/accounting-reports/cash-flow?${params}`, {
        headers: {
          'x-tenant-id': 'tenant_demo',
          'x-company-id': 'seed-company-1'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch cash flow data');
      }

      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching cash flow:', error);
      toast.error('Failed to load cash flow data');
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

  const filteredItems = (items: CashFlowItem[]) => {
    return items.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'operating': return 'bg-blue-100 text-blue-800';
      case 'investing': return 'bg-green-100 text-green-800';
      case 'financing': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'operating': return <Activity className="h-4 w-4" />;
      case 'investing': return <TrendingUp className="h-4 w-4" />;
      case 'financing': return <DollarSign className="h-4 w-4" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Loading cash flow statement...</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <Activity className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
        <p className="text-muted-foreground">No cash flow data available</p>
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
            <CardTitle className="text-sm font-medium">Operating Cash Flow</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              data.operating.total >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatCurrency(data.operating.total)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Investing Cash Flow</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              data.investing.total >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatCurrency(data.investing.total)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Financing Cash Flow</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              data.financing.total >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatCurrency(data.financing.total)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Net Cash Flow</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              data.summary.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatCurrency(data.summary.netCashFlow)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search cash flow items..."
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

      {/* Cash Flow Statement */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            CASH FLOW STATEMENT
          </CardTitle>
          <CardDescription>
            Period: {formatDate(data.period.startDate)} - {formatDate(data.period.endDate)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Operating Activities */}
            <div>
              <h3 className="text-lg font-semibold text-blue-600 mb-4 flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                OPERATING ACTIVITIES
              </h3>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems(data.operating.items).map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getTypeIcon(item.type)}
                            <span>{item.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-mono font-medium">
                          <div className="flex items-center justify-end space-x-1">
                            {item.amount >= 0 ? (
                              <ArrowUpRight className="h-4 w-4 text-green-600" />
                            ) : (
                              <ArrowDownRight className="h-4 w-4 text-red-600" />
                            )}
                            <span className={item.amount >= 0 ? 'text-green-600' : 'text-red-600'}>
                              {formatCurrency(Math.abs(item.amount))}
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between items-center font-bold text-lg">
                  <span>Net Cash from Operating Activities</span>
                  <span className={`font-mono ${
                    data.operating.total >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(data.operating.total)}
                  </span>
                </div>
              </div>
            </div>

            {/* Investing Activities */}
            <div>
              <h3 className="text-lg font-semibold text-green-600 mb-4 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                INVESTING ACTIVITIES
              </h3>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems(data.investing.items).map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getTypeIcon(item.type)}
                            <span>{item.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-mono font-medium">
                          <div className="flex items-center justify-end space-x-1">
                            {item.amount >= 0 ? (
                              <ArrowUpRight className="h-4 w-4 text-green-600" />
                            ) : (
                              <ArrowDownRight className="h-4 w-4 text-red-600" />
                            )}
                            <span className={item.amount >= 0 ? 'text-green-600' : 'text-red-600'}>
                              {formatCurrency(Math.abs(item.amount))}
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between items-center font-bold text-lg">
                  <span>Net Cash from Investing Activities</span>
                  <span className={`font-mono ${
                    data.investing.total >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(data.investing.total)}
                  </span>
                </div>
              </div>
            </div>

            {/* Financing Activities */}
            <div>
              <h3 className="text-lg font-semibold text-purple-600 mb-4 flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                FINANCING ACTIVITIES
              </h3>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems(data.financing.items).map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getTypeIcon(item.type)}
                            <span>{item.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-mono font-medium">
                          <div className="flex items-center justify-end space-x-1">
                            {item.amount >= 0 ? (
                              <ArrowUpRight className="h-4 w-4 text-green-600" />
                            ) : (
                              <ArrowDownRight className="h-4 w-4 text-red-600" />
                            )}
                            <span className={item.amount >= 0 ? 'text-green-600' : 'text-red-600'}>
                              {formatCurrency(Math.abs(item.amount))}
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between items-center font-bold text-lg">
                  <span>Net Cash from Financing Activities</span>
                  <span className={`font-mono ${
                    data.financing.total >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(data.financing.total)}
                  </span>
                </div>
              </div>
            </div>

            {/* Net Cash Flow Summary */}
            <div className="pt-6 border-t-2">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Net Increase (Decrease) in Cash</span>
                  <span className={`text-lg font-mono font-bold ${
                    data.summary.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(data.summary.netCashFlow)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Cash at Beginning of Period</span>
                  <span className="text-lg font-mono font-bold">
                    {formatCurrency(data.summary.beginningCash)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xl font-bold border-t pt-4">
                  <span>Cash at End of Period</span>
                  <span className="font-mono text-blue-600">
                    {formatCurrency(data.summary.endingCash)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cash Flow Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Cash Flow Analysis</CardTitle>
          <CardDescription>
            Key cash flow metrics and trends
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(data.operating.total)}
              </div>
              <div className="text-sm text-muted-foreground">Operating Cash Flow</div>
              <div className="text-xs text-muted-foreground mt-1">
                Cash from core business operations
              </div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(data.investing.total)}
              </div>
              <div className="text-sm text-muted-foreground">Investing Cash Flow</div>
              <div className="text-xs text-muted-foreground mt-1">
                Cash from investments and assets
              </div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {formatCurrency(data.financing.total)}
              </div>
              <div className="text-sm text-muted-foreground">Financing Cash Flow</div>
              <div className="text-xs text-muted-foreground mt-1">
                Cash from debt and equity
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
