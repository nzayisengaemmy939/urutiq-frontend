

import React, { useState, useEffect } from 'react';
import { PageLayout } from '../../components/page-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Checkbox } from '../../components/ui/checkbox';
import apiService from '../../lib/api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { 
  FileText, 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Plus, 
  Search, 
  Filter,
  Download,
  Share2,
  Settings,
  RefreshCw,
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
  FileText as Template,
  FolderOpen,
  BarChart,
  LineChart,
  PieChart as PieChartIcon,
  Activity
} from 'lucide-react';

interface FinancialReport {
  id: string;
  name: string;
  type: string;
  description?: string;
  isTemplate: boolean;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  createdByUser: {
    id: string;
    name: string;
    email: string;
  };
  _count: {
    reportItems: number;
    reportSchedules: number;
  };
}

interface ReportTemplate {
  id: string;
  name: string;
  type: string;
  category: string;
  description?: string;
  isPublic: boolean;
  createdByUser: {
    id: string;
    name: string;
    email: string;
  };
}

interface ReportExecution {
  id: string;
  executedAt: string;
  status: string;
  executedByUser: {
    id: string;
    name: string;
    email: string;
  };
}

export default function ReportsPage() {
  const [reports, setReports] = useState<FinancialReport[]>([]);
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [executions, setExecutions] = useState<ReportExecution[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [createTplOpen, setCreateTplOpen] = useState(false);
  const [tplName, setTplName] = useState('');
  const [tplType, setTplType] = useState('balance_sheet');
  const [tplCategory, setTplCategory] = useState('standard');
  const [tplDescription, setTplDescription] = useState('');
  const [tplIsPublic, setTplIsPublic] = useState(false);
  const [tplConfig, setTplConfig] = useState<string>(JSON.stringify({ sections: [] }, null, 2));
  const [submittingTpl, setSubmittingTpl] = useState(false);
  const [createReportOpen, setCreateReportOpen] = useState(false);
  const [repName, setRepName] = useState('');
  const [repType, setRepType] = useState('balance_sheet');
  const [repDescription, setRepDescription] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);

  // Derived analytics from real data
  const totalExecutions = executions.length;
  const successCount = executions.filter((e) => e.status === 'success').length;
  const errorCount = executions.filter((e) => e.status === 'error').length;
  const processingCount = executions.filter((e) => e.status === 'processing').length;
  const successRate = totalExecutions ? Math.round((successCount / totalExecutions) * 1000) / 10 : 0;
  const errorRate = totalExecutions ? Math.round((errorCount / totalExecutions) * 1000) / 10 : 0;
  const typeCounts = reports.reduce<Record<string, number>>((acc, r) => {
    acc[r.type] = (acc[r.type] || 0) + 1;
    return acc;
  }, {});

  useEffect(() => {
    fetchReports();
    fetchTemplates();
    fetchExecutions();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await fetch('/api/reports');
      const data = await response.json();
      setReports(data.reports || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  const fetchTemplates = async () => {
    try {
      const data: any = await apiService.get('/reports/templates');
      setTemplates((data?.templates ?? data ?? []) as any[]);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchExecutions = async () => {
    try {
      let companyId = 'seed-company-1';
      try {
        const stored = localStorage.getItem('company_id') || localStorage.getItem('companyId') || localStorage.getItem('company');
        if (stored) companyId = stored;
      } catch {}
      const resp: any = await apiService.get(`/reports/executions?companyId=${encodeURIComponent(companyId)}&limit=100`);
      const list = resp?.data ?? resp ?? [];
      setExecutions(Array.isArray(list) ? list : (list.executions || []));
    } catch (error) {
      console.error('Error fetching executions:', error);
      setExecutions([]);
    }
  };

  const getReportTypeIcon = (type: string) => {
    switch (type) {
      case 'balance_sheet':
        return <BarChart3 className="h-4 w-4" />;
      case 'income_statement':
        return <TrendingUp className="h-4 w-4" />;
      case 'cash_flow':
        return <Activity className="h-4 w-4" />;
      case 'equity':
        return <PieChart className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getReportTypeLabel = (type: string) => {
    switch (type) {
      case 'balance_sheet':
        return 'Balance Sheet';
      case 'income_statement':
        return 'Income Statement';
      case 'cash_flow':
        return 'Cash Flow';
      case 'equity':
        return 'Equity';
      default:
        return 'Custom';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Success</Badge>;
      case 'error':
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Error</Badge>;
      case 'processing':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Processing</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (report.description && report.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === 'all' || report.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <PageLayout>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Financial Reports</h1>
            <p className="text-muted-foreground">
              Create, manage, and execute comprehensive financial reports and analytics
            </p>
        </div>
          <div className="flex items-center space-x-2">
          <Dialog open={createTplOpen} onOpenChange={setCreateTplOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" >
                <Template className="h-4 w-4 mr-2" />
                Templates
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Report Template</DialogTitle>
                <DialogDescription>
                  Define a reusable report template and save it for later use.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="tplName">Name</Label>
                  <Input id="tplName" value={tplName} onChange={(e) => setTplName(e.target.value)} placeholder="e.g., Standard Balance Sheet" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label>Type</Label>
                    <Select value={tplType} onValueChange={setTplType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="balance_sheet">Balance Sheet</SelectItem>
                        <SelectItem value="income_statement">Income Statement</SelectItem>
                        <SelectItem value="cash_flow">Cash Flow</SelectItem>
                        <SelectItem value="equity">Equity</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Category</Label>
                    <Select value={tplCategory} onValueChange={setTplCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="industry">Industry</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2 items-end">
                    <div className="flex items-center gap-2 mt-6">
                      <Checkbox id="tplPublic" checked={tplIsPublic} onCheckedChange={(v) => setTplIsPublic(Boolean(v))} />
                      <Label htmlFor="tplPublic">Public</Label>
                    </div>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="tplDesc">Description</Label>
                  <Input id="tplDesc" value={tplDescription} onChange={(e) => setTplDescription(e.target.value)} placeholder="Optional description" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="tplConfig">Configuration (JSON)</Label>
                  <Textarea id="tplConfig" value={tplConfig} onChange={(e) => setTplConfig(e.target.value)} className="font-mono text-xs min-h-[160px]" />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setCreateTplOpen(false)}>Cancel</Button>
                  <Button disabled={submittingTpl || !tplName.trim()} onClick={async () => {
                    try {
                      setSubmittingTpl(true);
                      let configuration = tplConfig;
                      try { configuration = JSON.stringify(JSON.parse(tplConfig)); } catch {}
                      const allowedCategories = new Set(['industry','standard','custom']);
                      const allowedTypes = new Set(['balance_sheet','income_statement','cash_flow','equity','custom']);
                      const category = (tplCategory || '').toString().trim().toLowerCase();
                      const type = (tplType || '').toString().trim().toLowerCase();
                      const safeCategory = allowedCategories.has(category) ? category : 'custom';
                      const safeType = allowedTypes.has(type) ? type : 'custom';
                      await apiService.post('/reports/templates', {
                        name: tplName.trim(),
                        type: safeType,
                        category: safeCategory,
                        description: tplDescription || undefined,
                        configuration,
                        isPublic: tplIsPublic
                      });
                      await fetchTemplates();
                      setCreateTplOpen(false);
                      setTplName('');
                      setTplDescription('');
                      setTplIsPublic(false);
                      setTplType('balance_sheet');
                      setTplCategory('standard');
                      setTplConfig(JSON.stringify({ sections: [] }, null, 2));
                    } catch (e) {
                      console.error('Failed to create template', e);
                    } finally {
                      setSubmittingTpl(false);
                    }
                  }}>{submittingTpl ? 'Creating...' : 'Create Template'}</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline" onClick={() => { fetchReports(); fetchTemplates(); fetchExecutions(); }}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
          <Button variant="outline" onClick={() => setCreateTplOpen(true)}>
            Create Template
          </Button>
          <Dialog open={createReportOpen} onOpenChange={setCreateReportOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setCreateReportOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Report
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create Report</DialogTitle>
                <DialogDescription>
                  Provide basic details to create a new financial report.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="repName">Name</Label>
                  <Input id="repName" value={repName} onChange={(e) => setRepName(e.target.value)} placeholder="e.g., Monthly Balance Sheet" />
                </div>
                <div className="grid gap-2">
                  <Label>Type</Label>
                  <Select value={repType} onValueChange={setRepType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="balance_sheet">Balance Sheet</SelectItem>
                      <SelectItem value="income_statement">Income Statement</SelectItem>
                      <SelectItem value="cash_flow">Cash Flow</SelectItem>
                      <SelectItem value="equity">Equity</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="repDesc">Description</Label>
                  <Input id="repDesc" value={repDescription} onChange={(e) => setRepDescription(e.target.value)} placeholder="Optional description" />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setCreateReportOpen(false)}>Cancel</Button>
                  <Button disabled={submittingReport || !repName.trim()} onClick={async () => {
                    try {
                      setSubmittingReport(true);
                      let companyId = 'seed-company-1';
                      try { const stored = localStorage.getItem('company_id') || localStorage.getItem('companyId') || localStorage.getItem('company'); if (stored) companyId = stored; } catch {}
                      const allowedTypes = new Set(['balance_sheet','income_statement','cash_flow','equity','custom']);
                      const safeType = allowedTypes.has(repType) ? repType : 'custom';
                      // POST to /reports with companyId in query, items optional
                      const payload = {
                        name: repName.trim(),
                        type: safeType,
                        description: repDescription || undefined,
                        isTemplate: false,
                        isPublic: false,
                      } as any;
                      await apiService.post(`/reports?companyId=${encodeURIComponent(companyId)}`, payload);
                      // Refresh reports list
                      await fetchReports();
                      setCreateReportOpen(false);
                      setRepName('');
                      setRepDescription('');
                      setRepType('balance_sheet');
                    } catch (e) {
                      console.error('Failed to create report', e);
                    } finally {
                      setSubmittingReport(false);
                    }
                  }}>{submittingReport ? 'Creating...' : 'Create Report'}</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      {/* Quick filters */}
      <div className="flex flex-wrap items-center gap-2 -mt-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Company</span>
          <input className="h-8 w-48 border rounded px-2 text-sm" placeholder="seed-company-1" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Period</span>
          <div className="inline-flex rounded-md border overflow-hidden">
            <button className="px-2 py-1 text-xs hover:bg-muted">MTD</button>
            <button className="px-2 py-1 text-xs hover:bg-muted">QTD</button>
            <button className="px-2 py-1 text-xs hover:bg-muted">YTD</button>
          </div>
          <input className="h-8 w-40 border rounded px-2 text-sm" placeholder="YYYY-MM-DD" />
        </div>
      </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reports.length}</div>
              <p className="text-xs text-muted-foreground">
                +12% from last month
              </p>
          </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Templates</CardTitle>
              <Template className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{templates.length}</div>
              <p className="text-xs text-muted-foreground">
                +5 new templates
              </p>
          </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Executions</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{executions.length}</div>
              <p className="text-xs text-muted-foreground">
                +8% from last week
              </p>
          </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">
                Active schedules
              </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="executions">Executions</TabsTrigger>
            <TabsTrigger value="builder">Report Builder</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Balance Sheet
                  </CardTitle>
                  <CardDescription>Current financial position</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total Assets</span>
                      <span className="font-semibold">$1,234,567</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Liabilities</span>
                      <span className="font-semibold">$567,890</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Equity</span>
                      <span className="font-semibold text-green-600">$666,677</span>
                    </div>
                  </div>
                  <Button className="w-full mt-4" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View Report
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Income Statement
                  </CardTitle>
                  <CardDescription>Revenue and expenses</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total Revenue</span>
                      <span className="font-semibold text-green-600">$890,123</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Expenses</span>
                      <span className="font-semibold text-red-600">$456,789</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Net Income</span>
                      <span className="font-semibold text-green-600">$433,334</span>
                    </div>
                  </div>
                  <Button className="w-full mt-4" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View Report
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="h-5 w-5 mr-2" />
                    Cash Flow
                  </CardTitle>
                  <CardDescription>Cash movement analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Operating Cash</span>
                      <span className="font-semibold text-green-600">$234,567</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Investing Cash</span>
                      <span className="font-semibold text-red-600">-$123,456</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Net Cash Flow</span>
                      <span className="font-semibold text-green-600">$111,111</span>
                    </div>
                  </div>
                  <Button className="w-full mt-4" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View Report
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Report Executions</CardTitle>
                <CardDescription>Latest report runs and their status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {executions.slice(0, 5).map((execution) => (
                    <div key={execution.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div>
                          <p className="font-medium">Balance Sheet Report</p>
                          <p className="text-sm text-muted-foreground">
                            Executed by {execution.executedByUser.name}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(execution.status)}
                        <span className="text-sm text-muted-foreground">
                          {new Date(execution.executedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search reports..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 w-64"
                  />
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="balance_sheet">Balance Sheet</SelectItem>
                    <SelectItem value="income_statement">Income Statement</SelectItem>
                    <SelectItem value="cash_flow">Cash Flow</SelectItem>
                    <SelectItem value="equity">Equity</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={() => setCreateReportOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Report
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredReports.map((report) => (
                <Card key={report.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getReportTypeIcon(report.type)}
                        <CardTitle className="text-lg">{report.name}</CardTitle>
                      </div>
                      <div className="flex items-center space-x-1">
                        {report.isTemplate && (
                          <Badge variant="secondary" className="text-xs">
                            <Template className="h-3 w-3 mr-1" />
                            Template
                          </Badge>
                        )}
                        {report.isPublic && (
                          <Badge variant="outline" className="text-xs">
                            <Share2 className="h-3 w-3 mr-1" />
                            Public
                          </Badge>
                        )}
                      </div>
                    </div>
                    <CardDescription>
                      {report.description || getReportTypeLabel(report.type)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Items:</span>
                        <span className="font-medium">{report._count.reportItems}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Schedules:</span>
                        <span className="font-medium">{report._count.reportSchedules}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Created by:</span>
                        <span className="font-medium">{report.createdByUser.name}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Updated:</span>
                        <span className="font-medium">
                          {new Date(report.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 mt-4">
                      <Button size="sm" className="flex-1">
                        <Play className="h-4 w-4 mr-2" />
                        Execute
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

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Report Templates</h3>
              <Button onClick={() => setCreateTplOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Template
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {templates.map((template) => (
                <Card key={template.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getReportTypeIcon(template.type)}
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                      </div>
                      <Badge variant={template.isPublic ? "default" : "secondary"}>
                        {template.category}
                      </Badge>
                    </div>
                    <CardDescription>
                      {template.description || `${getReportTypeLabel(template.type)} template`}
                    </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Type:</span>
                        <span className="font-medium">{getReportTypeLabel(template.type)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Created by:</span>
                        <span className="font-medium">{template.createdByUser.name}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Visibility:</span>
                        <span className="font-medium">
                          {template.isPublic ? 'Public' : 'Private'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 mt-4">
                      <Button size="sm" className="flex-1">
                        <FolderOpen className="h-4 w-4 mr-2" />
                        Use Template
                      </Button>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Executions Tab */}
          <TabsContent value="executions" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Report Executions</h3>
              <div className="flex items-center space-x-2">
                <Select defaultValue="all">
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
                        </div>

            <Card>
              <CardContent className="p-0">
                <div className="space-y-0">
                  {executions.map((execution) => (
                    <div key={execution.id} className="flex items-center justify-between p-4 border-b last:border-b-0">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div>
                          <p className="font-medium">Balance Sheet Report</p>
                          <p className="text-sm text-muted-foreground">
                            Executed by {execution.executedByUser.name}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        {getStatusBadge(execution.status)}
                        <span className="text-sm text-muted-foreground">
                          {new Date(execution.executedAt).toLocaleString()}
                        </span>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Report Builder Tab */}
          <TabsContent value="builder" className="space-y-4">
          <Card>
            <CardHeader>
                <CardTitle>Report Builder</CardTitle>
                <CardDescription>
                  Create custom financial reports with drag-and-drop interface
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Report Configuration</h4>
              <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium">Report Name</label>
                        <Input placeholder="Enter report name" />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Report Type</label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select report type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="balance_sheet">Balance Sheet</SelectItem>
                            <SelectItem value="income_statement">Income Statement</SelectItem>
                            <SelectItem value="cash_flow">Cash Flow</SelectItem>
                            <SelectItem value="equity">Equity</SelectItem>
                            <SelectItem value="custom">Custom</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Description</label>
                        <Input placeholder="Enter description" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-semibold">Report Items</h4>
                    <div className="border rounded-lg p-4 min-h-[200px]">
                      <p className="text-muted-foreground text-center">
                        Drag and drop items here to build your report
                      </p>
                    </div>
                    <Button className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Item
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-end space-x-2 pt-4">
                  <Button variant="outline">Save as Draft</Button>
                  <Button>Create Report</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart className="h-5 w-5 mr-2" />
                    Report Usage
                  </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Most Used</span>
                    <span className="font-semibold">{Object.entries(typeCounts).sort((a,b)=>b[1]-a[1])[0]?.[0]?.replace('_',' ') || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Executions</span>
                    <span className="font-semibold">{totalExecutions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg. Runtime</span>
                    <span className="font-semibold">—</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                  <CardTitle className="flex items-center">
                    <LineChart className="h-5 w-5 mr-2" />
                    Performance
                  </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Success Rate</span>
                    <span className="font-semibold text-green-600">{successRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Error Rate</span>
                    <span className="font-semibold text-red-600">{errorRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Processing</span>
                    <span className="font-semibold">{processingCount}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                  <CardTitle className="flex items-center">
                    <PieChartIcon className="h-5 w-5 mr-2" />
                    Report Types
                  </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Balance Sheets</span>
                    <span className="font-semibold">{reports.length ? Math.round(((typeCounts['balance_sheet']||0)/reports.length)*100) : 0}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Income Statements</span>
                    <span className="font-semibold">{reports.length ? Math.round(((typeCounts['income_statement']||0)/reports.length)*100) : 0}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cash Flow</span>
                    <span className="font-semibold">{reports.length ? Math.round(((typeCounts['cash_flow']||0)/reports.length)*100) : 0}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Custom</span>
                    <span className="font-semibold">{reports.length ? Math.round(((typeCounts['custom']||0)/reports.length)*100) : 0}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      </div>
    </PageLayout>
  );
}
