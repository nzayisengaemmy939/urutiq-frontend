"use client";

import React, { useState, useEffect } from 'react';
import { PageLayout } from '@/components/page-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  FileText, 
  Settings, 
  Download,
  Plus,
  Eye,
  Edit,
  Trash2,
  Filter,
  Search,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  CreditCard,
  Receipt,
  Calculator,
  BookOpen,
  Activity
} from 'lucide-react';
import { toast } from 'sonner';

// Import individual report components
import { TrialBalanceReport } from '@/components/reports/trial-balance-report';
import { GeneralLedgerReport } from '@/components/reports/general-ledger-report';
import { BalanceSheetReport } from '@/components/reports/balance-sheet-report';
import { IncomeStatementReport } from '@/components/reports/income-statement-report';
import { CashFlowReport } from '@/components/reports/cash-flow-report';
import { ARAgingReport } from '@/components/reports/ar-aging-report';
import { APAgingReport } from '@/components/reports/ap-aging-report';
import { DebugReport } from '@/components/reports/debug-report';

interface ReportDefinition {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  category: 'financial' | 'operational' | 'compliance';
  complexity: 'basic' | 'intermediate' | 'advanced';
  frequency: 'real-time' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
}

const reportDefinitions: ReportDefinition[] = [
  {
    id: 'trial-balance',
    name: 'Trial Balance',
    description: 'Shows all account balances with debits and credits',
    icon: Calculator,
    category: 'financial',
    complexity: 'basic',
    frequency: 'real-time'
  },
  {
    id: 'general-ledger',
    name: 'General Ledger',
    description: 'Detailed transaction history for all accounts',
    icon: BookOpen,
    category: 'financial',
    complexity: 'basic',
    frequency: 'real-time'
  },
  {
    id: 'balance-sheet',
    name: 'Balance Sheet',
    description: 'Assets, liabilities, and equity at a point in time',
    icon: BarChart3,
    category: 'financial',
    complexity: 'intermediate',
    frequency: 'monthly'
  },
  {
    id: 'income-statement',
    name: 'Income Statement',
    description: 'Revenue, expenses, and profit/loss for a period',
    icon: TrendingUp,
    category: 'financial',
    complexity: 'intermediate',
    frequency: 'monthly'
  },
  {
    id: 'cash-flow',
    name: 'Cash Flow Statement',
    description: 'Cash inflows and outflows for a period',
    icon: Activity,
    category: 'financial',
    complexity: 'advanced',
    frequency: 'monthly'
  },
  {
    id: 'ar-aging',
    name: 'Accounts Receivable Aging',
    description: 'Outstanding customer invoices by age',
    icon: Users,
    category: 'operational',
    complexity: 'basic',
    frequency: 'weekly'
  },
  {
    id: 'ap-aging',
    name: 'Accounts Payable Aging',
    description: 'Outstanding vendor bills by age',
    icon: CreditCard,
    category: 'operational',
    complexity: 'basic',
    frequency: 'weekly'
  },
  {
    id: 'debug',
    name: 'Debug Report',
    description: 'Test API connection and data',
    icon: Settings,
    category: 'compliance',
    complexity: 'basic',
    frequency: 'real-time'
  }
];

export default function AccountingReportsPage() {
  const [selectedReport, setSelectedReport] = useState<string>('trial-balance');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const filteredReports = reportDefinitions.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || report.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getReportComponent = (reportId: string) => {
    const commonProps = {
      dateRange,
      asOfDate,
      loading,
      setLoading
    };

    switch (reportId) {
      case 'trial-balance':
        return <TrialBalanceReport {...commonProps} />;
      case 'general-ledger':
        return <GeneralLedgerReport {...commonProps} />;
      case 'balance-sheet':
        return <BalanceSheetReport {...commonProps} />;
      case 'income-statement':
        return <IncomeStatementReport {...commonProps} />;
      case 'cash-flow':
        return <CashFlowReport {...commonProps} />;
      case 'ar-aging':
        return <ARAgingReport {...commonProps} />;
      case 'ap-aging':
        return <APAgingReport {...commonProps} />;
      case 'debug':
        return <DebugReport />;
      default:
        return <div>Report not found</div>;
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'basic': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'financial': return 'bg-blue-100 text-blue-800';
      case 'operational': return 'bg-purple-100 text-purple-800';
      case 'compliance': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <PageLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-balance">Accounting Reports</h1>
            <p className="text-muted-foreground">Generate comprehensive financial and operational reports</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button>
              <Download className="w-4 h-4 mr-2" />
              Export All
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportDefinitions.length}</div>
              <p className="text-xs text-muted-foreground">
                Available reports
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Financial</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {reportDefinitions.filter(r => r.category === 'financial').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Financial reports
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Operational</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {reportDefinitions.filter(r => r.category === 'operational').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Operational reports
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Generated</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2m</div>
              <p className="text-xs text-muted-foreground">
                ago
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-4">
          {/* Report List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Available Reports</CardTitle>
                <CardDescription>Select a report to generate</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search and Filter */}
                <div className="space-y-2">
                  <Input
                    placeholder="Search reports..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-8"
                  />
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="financial">Financial</SelectItem>
                      <SelectItem value="operational">Operational</SelectItem>
                      <SelectItem value="compliance">Compliance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Report List */}
                <div className="space-y-2">
                  {filteredReports.map((report) => {
                    const Icon = report.icon;
                    return (
                      <div
                        key={report.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedReport === report.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:bg-muted/50'
                        }`}
                        onClick={() => setSelectedReport(report.id)}
                      >
                        <div className="flex items-start space-x-3">
                          <Icon className="h-5 w-5 mt-0.5 text-muted-foreground" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-medium truncate">
                                {report.name}
                              </h4>
                              <div className="flex gap-1">
                                <Badge
                                  variant="secondary"
                                  className={`text-xs ${getComplexityColor(report.complexity)}`}
                                >
                                  {report.complexity}
                                </Badge>
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {report.description}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge
                                variant="outline"
                                className={`text-xs ${getCategoryColor(report.category)}`}
                              >
                                {report.category}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {report.frequency}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Report Content */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>
                      {reportDefinitions.find(r => r.id === selectedReport)?.name}
                    </CardTitle>
                    <CardDescription>
                      {reportDefinitions.find(r => r.id === selectedReport)?.description}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh
                    </Button>
                    <Button size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Date Range Controls */}
                <div className="mb-6 p-4 bg-muted/50 rounded-lg">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={dateRange.startDate}
                        onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={dateRange.endDate}
                        onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <Label htmlFor="asOfDate">As Of Date (for point-in-time reports)</Label>
                    <Input
                      id="asOfDate"
                      type="date"
                      value={asOfDate}
                      onChange={(e) => setAsOfDate(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Report Content */}
                {getReportComponent(selectedReport)}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
