'use client'

import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { PageLayout } from '@/components/page-layout'
import { useDemoAuth } from '@/hooks/useDemoAuth'
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
  Clock
} from 'lucide-react'
import { toast } from 'sonner'
import apiService from '@/lib/api'

// Types
interface FinancialStatement {
  period: { startDate: string; endDate: string }
  revenue: { grossRevenue: number; accounts: any[] }
  costOfGoodsSold: { total: number; accounts: any[] }
  grossProfit: number
  expenses: { total: number; accounts: any[] }
  netIncome: number
  margin: { grossMargin: number; netMargin: number }
}

interface BalanceSheet {
  asOfDate: string
  assets: { total: number; accounts: any[] }
  liabilities: { total: number; accounts: any[] }
  equity: { total: number; accounts: any[] }
  balance: number
}

interface CashFlow {
  period: { startDate: string; endDate: string }
  operatingActivities: { amount: number; entries: any[] }
  investingActivities: { amount: number; entries: any[] }
  financingActivities: { amount: number; entries: any[] }
  netCashFlow: number
}

interface KPI {
  period: { startDate: string; endDate: string }
  profitability: {
    revenue: number
    netIncome: number
    grossMargin: number
    netMargin: number
    returnOnAssets: number
    returnOnEquity: number
  }
  liquidity: {
    currentRatio: number
    operatingCashFlow: number
    cashFlowMargin: number
  }
  growth: {
    revenueGrowth: number
    profitGrowth: number
  }
  efficiency: {
    assetTurnover: number
    equityMultiplier: number
  }
}

interface BudgetVariance {
  period: { startDate: string; endDate: string }
  summary: {
    totalBudgeted: number
    totalActual: number
    totalVariance: number
    totalVariancePercent: number
    status: string
  }
  variances: Array<{
    budgetId: string
    category: any
    budgeted: number
    actual: number
    variance: number
    variancePercent: number
    status: string
  }>
}

interface CustomReport {
  id: string
  name: string
  description?: string
  templateId?: string
  filters: any
  columns: any[]
  grouping?: string[]
  sorting?: any[]
  isPublic: boolean
  createdAt: string
  updatedAt: string
}

interface ReportTemplate {
  id: string
  name: string
  description: string
  type: string
  columns: any[]
}

export default function FinancialReportsPage() {
  const { ready: authReady } = useDemoAuth('financial-reports-page')
  const queryClient = useQueryClient()
  const [selectedCompany, setSelectedCompany] = useState('seed-company-1')
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  })
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0])
  const [period, setPeriod] = useState('monthly')
  const [format, setFormat] = useState('standard')

  // Fetch companies
  const companiesQuery = useQuery({
    queryKey: ['companies'],
    queryFn: () => apiService.getCompanies(),
    enabled: authReady,
    staleTime: 5 * 60 * 1000
  })

  // Fetch financial statements
  const profitLossQuery = useQuery({
    queryKey: ['financial-reports', 'profit-loss', selectedCompany, dateRange, period, format],
    queryFn: () => apiService.get(`/enhanced-financial-reports/profit-loss?companyId=${selectedCompany}&startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`),
    enabled: !!selectedCompany,
    staleTime: 2 * 60 * 1000
  })

  const balanceSheetQuery = useQuery({
    queryKey: ['financial-reports', 'balance-sheet', selectedCompany, asOfDate],
    queryFn: () => apiService.get(`/enhanced-financial-reports/balance-sheet?companyId=${selectedCompany}&asOfDate=${asOfDate}`),
    enabled: !!selectedCompany,
    staleTime: 2 * 60 * 1000
  })

  const cashFlowQuery = useQuery({
    queryKey: ['financial-reports', 'cash-flow', selectedCompany, dateRange],
    queryFn: () => apiService.get(`/enhanced-financial-reports/cash-flow?companyId=${selectedCompany}&startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`),
    enabled: !!selectedCompany,
    staleTime: 2 * 60 * 1000
  })

  // Fetch KPIs
  const kpisQuery = useQuery({
    queryKey: ['financial-reports', 'kpis', selectedCompany, dateRange],
    queryFn: () => apiService.get(`/enhanced-financial-reports/ratios?companyId=${selectedCompany}&asOfDate=${dateRange.endDate}`),
    enabled: !!selectedCompany,
    staleTime: 1 * 60 * 1000
  })

  // Fetch budget variance
  const budgetVarianceQuery = useQuery({
    queryKey: ['financial-reports', 'budget-variance', selectedCompany, dateRange],
    queryFn: () => apiService.get(`/financial-reports/budget-variance?companyId=${selectedCompany}&startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`),
    enabled: !!selectedCompany,
    staleTime: 2 * 60 * 1000
  })

  // Fetch report templates
  const templatesQuery = useQuery({
    queryKey: ['financial-reports', 'templates'],
    queryFn: () => apiService.get('/enhanced-financial-reports/templates'),
    staleTime: 10 * 60 * 1000
  })

  // Fetch custom reports
  const customReportsQuery = useQuery({
    queryKey: ['financial-reports', 'custom', selectedCompany],
    queryFn: () => apiService.get(`/financial-reports/custom?companyId=${selectedCompany}`),
    enabled: !!selectedCompany,
    staleTime: 2 * 60 * 1000
  })

  // Dashboard data
  const dashboardQuery = useQuery({
    queryKey: ['financial-reports', 'dashboard', selectedCompany],
    queryFn: () => apiService.get(`/financial-reports/dashboard?companyId=${selectedCompany}`),
    enabled: !!selectedCompany,
    staleTime: 1 * 60 * 1000
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
      case 'good':
      case 'on_target':
        return 'bg-green-100 text-green-800'
      case 'fair':
      case 'over':
        return 'bg-yellow-100 text-yellow-800'
      case 'poor':
      case 'under':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent':
      case 'good':
      case 'on_target':
        return <CheckCircle className="w-4 h-4" />
      case 'fair':
      case 'over':
        return <AlertTriangle className="w-4 h-4" />
      case 'poor':
      case 'under':
        return <AlertTriangle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  return (
    <PageLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Advanced Financial Reporting</h1>
            <p className="text-muted-foreground">
              Comprehensive financial analysis, reporting, and insights
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Report Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="company">Company</Label>
                <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                  <SelectContent>
                    {companiesQuery.data?.data?.map((company: any) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="period">Period</Label>
                <Select value={period} onValueChange={setPeriod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs defaultValue="statements" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="statements" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Financial Statements
            </TabsTrigger>
            <TabsTrigger value="custom" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Custom Builder
            </TabsTrigger>
            <TabsTrigger value="kpis" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              KPIs Dashboard
            </TabsTrigger>
            <TabsTrigger value="budget" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Budget vs Actual
            </TabsTrigger>
          </TabsList>

          {/* Financial Statements Tab */}
          <TabsContent value="statements" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profit & Loss */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Profit & Loss
                  </CardTitle>
                  <CardDescription>
                    {profitLossQuery.data?.period?.startDate && profitLossQuery.data?.period?.endDate && (
                      `${new Date(profitLossQuery.data.period.startDate).toLocaleDateString()} - ${new Date(profitLossQuery.data.period.endDate).toLocaleDateString()}`
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {profitLossQuery.isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <RefreshCw className="w-6 h-6 animate-spin" />
                    </div>
                  ) : profitLossQuery.data ? (
                    <>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Revenue</span>
                          <span className="font-semibold">{formatCurrency(profitLossQuery.data?.revenue?.totalRevenue || 0)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Cost of Goods Sold</span>
                          <span>{formatCurrency(profitLossQuery.data?.costOfGoodsSold?.totalCOGS || 0)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-semibold">
                          <span>Gross Profit</span>
                          <span>{formatCurrency(profitLossQuery.data?.grossProfit || 0)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Operating Expenses</span>
                          <span>{formatCurrency(profitLossQuery.data?.operatingExpenses?.totalOperatingExpenses || 0)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between text-lg font-bold">
                          <span>Net Income</span>
                          <span className={(profitLossQuery.data?.netIncome || 0) >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {formatCurrency(profitLossQuery.data?.netIncome || 0)}
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 pt-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {formatPercentage(profitLossQuery.data?.margins?.grossMargin || 0)}
                          </div>
                          <div className="text-sm text-muted-foreground">Gross Margin</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {formatPercentage(profitLossQuery.data?.margins?.netMargin || 0)}
                          </div>
                          <div className="text-sm text-muted-foreground">Net Margin</div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No data available
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Balance Sheet */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Balance Sheet
                  </CardTitle>
                  <CardDescription>
                    As of {asOfDate && new Date(asOfDate).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="asOfDate">As of Date</Label>
                    <Input
                      type="date"
                      value={asOfDate}
                      onChange={(e) => setAsOfDate(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  {balanceSheetQuery.isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <RefreshCw className="w-6 h-6 animate-spin" />
                    </div>
                  ) : balanceSheetQuery.data ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between font-semibold">
                          <span>Total Assets</span>
                          <span>{formatCurrency(balanceSheetQuery.data?.totalAssets || 0)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Total Liabilities</span>
                          <span>{formatCurrency(balanceSheetQuery.data?.totalLiabilities || 0)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Total Equity</span>
                          <span>{formatCurrency(balanceSheetQuery.data?.totalEquity || 0)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between text-lg font-bold">
                          <span>Balance Check</span>
                          <span className={(balanceSheetQuery.data?.totalAssets || 0) === (balanceSheetQuery.data?.totalLiabilities || 0) + (balanceSheetQuery.data?.totalEquity || 0) ? 'text-green-600' : 'text-red-600'}>
                            {(balanceSheetQuery.data?.totalAssets || 0) === (balanceSheetQuery.data?.totalLiabilities || 0) + (balanceSheetQuery.data?.totalEquity || 0) ? 'Balanced' : 'Unbalanced'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No data available
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Cash Flow */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Cash Flow
                  </CardTitle>
                  <CardDescription>
                    {cashFlowQuery.data?.period?.startDate && cashFlowQuery.data?.period?.endDate && (
                      `${new Date(cashFlowQuery.data.period.startDate).toLocaleDateString()} - ${new Date(cashFlowQuery.data.period.endDate).toLocaleDateString()}`
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cashFlowQuery.isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <RefreshCw className="w-6 h-6 animate-spin" />
                    </div>
                  ) : cashFlowQuery.data ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Operating Activities</span>
                          <span className={(cashFlowQuery.data?.operatingActivities?.netCashFlow || 0) >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {formatCurrency(cashFlowQuery.data?.operatingActivities?.netCashFlow || 0)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Investing Activities</span>
                          <span className={(cashFlowQuery.data?.investingActivities?.netCashFlow || 0) >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {formatCurrency(cashFlowQuery.data?.investingActivities?.netCashFlow || 0)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Financing Activities</span>
                          <span className={(cashFlowQuery.data?.financingActivities?.netCashFlow || 0) >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {formatCurrency(cashFlowQuery.data?.financingActivities?.netCashFlow || 0)}
                          </span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-semibold">
                          <span>Net Cash Flow</span>
                          <span className={(cashFlowQuery.data?.netCashFlow || 0) >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {formatCurrency(cashFlowQuery.data?.netCashFlow || 0)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Custom Report Builder Tab */}
          <TabsContent value="custom" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Custom Report Builder</h2>
                <p className="text-muted-foreground">Create and manage custom financial reports</p>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    New Report
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create Custom Report</DialogTitle>
                    <DialogDescription>
                      Build a custom financial report with your own filters, columns, and calculations
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="reportName">Report Name</Label>
                      <Input id="reportName" placeholder="Enter report name" />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Input id="description" placeholder="Enter description" />
                    </div>
                    <div>
                      <Label htmlFor="template">Template</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select template" />
                        </SelectTrigger>
                        <SelectContent>
                          {templatesQuery.data?.map((template: ReportTemplate) => (
                            <SelectItem key={template.id} value={template.id}>
                              {template.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline">Cancel</Button>
                      <Button>Create Report</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Custom Reports List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {customReportsQuery.isLoading ? (
                <div className="col-span-full flex items-center justify-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin" />
                </div>
              ) : customReportsQuery.data?.length > 0 ? (
                customReportsQuery.data.map((report: CustomReport) => (
                  <Card key={report.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{report.name}</CardTitle>
                      <CardDescription>{report.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <Badge variant={report.isPublic ? 'default' : 'secondary'}>
                          {report.isPublic ? 'Public' : 'Private'}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  No custom reports found. Create your first report to get started.
                </div>
              )}
            </div>
          </TabsContent>

          {/* KPIs Dashboard Tab */}
          <TabsContent value="kpis" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Key Performance Indicators</h2>
              <p className="text-muted-foreground">Real-time financial metrics and insights</p>
            </div>

            {kpisQuery.isLoading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="w-6 h-6 animate-spin" />
              </div>
            ) : kpisQuery.data ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Profitability KPIs */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(kpisQuery.data?.ratios?.totalRevenue || 0)}</div>
                    <p className="text-xs text-muted-foreground">Current period</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Net Income</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(kpisQuery.data?.ratios?.netIncome || 0)}
                    </div>
                    <p className="text-xs text-muted-foreground">Current period</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Gross Margin</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatPercentage(kpisQuery.data?.ratios?.grossProfitMargin || 0)}</div>
                    <p className="text-xs text-muted-foreground">Current period</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">ROE</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatPercentage(kpisQuery.data?.ratios?.returnOnEquity || 0)}</div>
                    <p className="text-xs text-muted-foreground">Return on Equity</p>
                  </CardContent>
                </Card>

                {/* Liquidity KPIs */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Current Ratio</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{(kpisQuery.data?.ratios?.currentRatio || 0).toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground">Liquidity measure</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Operating Cash Flow</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(kpisQuery.data?.ratios?.operatingCashFlow || 0)}
                    </div>
                    <p className="text-xs text-muted-foreground">Current period</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Cash Flow Margin</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatPercentage(kpisQuery.data?.ratios?.cashFlowMargin || 0)}</div>
                    <p className="text-xs text-muted-foreground">Cash flow to revenue</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Asset Turnover</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{(kpisQuery.data?.ratios?.assetTurnover || 0).toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground">Efficiency measure</p>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No KPI data available
              </div>
            )}
          </TabsContent>

          {/* Budget vs Actual Tab */}
          <TabsContent value="budget" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Budget vs Actual Analysis</h2>
              <p className="text-muted-foreground">Track budget performance and variance analysis</p>
            </div>

            {budgetVarianceQuery.isLoading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="w-6 h-6 animate-spin" />
              </div>
            ) : budgetVarianceQuery.data ? (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-medium">Total Budgeted</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatCurrency(budgetVarianceQuery.data.summary.totalBudgeted)}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-medium">Total Actual</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatCurrency(budgetVarianceQuery.data.summary.totalActual)}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-medium">Total Variance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className={`text-2xl font-bold ${budgetVarianceQuery.data.summary.totalVariance >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {formatCurrency(budgetVarianceQuery.data.summary.totalVariance)}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-medium">Variance %</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className={`text-2xl font-bold ${budgetVarianceQuery.data.summary.totalVariancePercent >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {formatPercentage(budgetVarianceQuery.data.summary.totalVariancePercent)}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Overall Status */}
                <Card>
                  <CardHeader>
                    <CardTitle>Overall Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <Badge className={getStatusColor(budgetVarianceQuery.data.summary.status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(budgetVarianceQuery.data.summary.status)}
                          {budgetVarianceQuery.data.summary.status.replace('_', ' ')}
                        </div>
                      </Badge>
                      <Progress 
                        value={Math.abs(budgetVarianceQuery.data.summary.totalVariancePercent)} 
                        className="flex-1"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Variance Details Table */}
                <Card>
                  <CardHeader>
                    <CardTitle>Variance Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Category</TableHead>
                          <TableHead>Budgeted</TableHead>
                          <TableHead>Actual</TableHead>
                          <TableHead>Variance</TableHead>
                          <TableHead>Variance %</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {budgetVarianceQuery.data.variances.map((variance: any) => (
                          <TableRow key={variance.budgetId}>
                            <TableCell>{variance.category?.name || 'Unknown'}</TableCell>
                            <TableCell>{formatCurrency(variance.budgeted)}</TableCell>
                            <TableCell>{formatCurrency(variance.actual)}</TableCell>
                            <TableCell className={variance.variance >= 0 ? 'text-red-600' : 'text-green-600'}>
                              {formatCurrency(variance.variance)}
                            </TableCell>
                            <TableCell className={variance.variancePercent >= 0 ? 'text-red-600' : 'text-green-600'}>
                              {formatPercentage(variance.variancePercent)}
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(variance.status)}>
                                <div className="flex items-center gap-1">
                                  {getStatusIcon(variance.status)}
                                  {variance.status.replace('_', ' ')}
                                </div>
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No budget variance data available
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  )
}
