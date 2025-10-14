"use client"

import React, { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  FileText, 
  Download, 
  Plus, 
  Settings,
  Eye,
  Calendar,
  DollarSign,
  Calculator,
  ChartBar
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import apiService from "@/lib/api"

interface FinancialReport {
  id: string
  name: string
  type: string
  data: any
  summary: any
  metadata: any
}

interface BalanceSheet {
  assets: any
  liabilities: any
  equity: any
  totalAssets: number
  totalLiabilities: number
  totalEquity: number
  date: Date
  ratios: any
}

interface ProfitAndLoss {
  revenue: any
  costOfGoodsSold: any
  grossProfit: number
  operatingExpenses: any
  operatingIncome: number
  netIncome: number
  period: any
  margins: any
}

interface CashFlow {
  operatingActivities: any
  investingActivities: any
  financingActivities: any
  netCashFlow: number
  beginningCash: number
  endingCash: number
  period: any
}

export function EnhancedFinancialReports() {
  const [selectedCompany, setSelectedCompany] = useState('seed-company-1')
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  })
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0])
  const [activeTab, setActiveTab] = useState('balance-sheet')
  const [isLoading, setIsLoading] = useState(false)
  const [balanceSheet, setBalanceSheet] = useState<BalanceSheet | null>(null)
  const [profitAndLoss, setProfitAndLoss] = useState<ProfitAndLoss | null>(null)
  const [cashFlow, setCashFlow] = useState<CashFlow | null>(null)
  const [financialRatios, setFinancialRatios] = useState<any>(null)
  const [savedReports, setSavedReports] = useState<FinancialReport[]>([])
  const { toast } = useToast()

  const generateBalanceSheet = async () => {
    setIsLoading(true)
    try {
      const data = await apiService.get(`/enhanced-financial-reports/balance-sheet?companyId=${selectedCompany}&asOfDate=${asOfDate}`)
      setBalanceSheet(data?.data || data)
      toast({
        title: "Success",
        description: "Balance sheet generated successfully",
      })
    } catch (error) {
      console.error('Balance sheet error:', error)
      toast({
        title: "Error",
        description: "Failed to generate balance sheet",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const generateProfitAndLoss = async () => {
    setIsLoading(true)
    try {
      const data = await apiService.get(`/enhanced-financial-reports/profit-loss?companyId=${selectedCompany}&startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`)
      setProfitAndLoss(data?.data || data)
      toast({
        title: "Success",
        description: "Profit & Loss statement generated successfully",
      })
    } catch (error) {
      console.error('Profit & Loss error:', error)
      toast({
        title: "Error",
        description: "Failed to generate Profit & Loss statement",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const generateCashFlow = async () => {
    setIsLoading(true)
    try {
      const data = await apiService.get(`/enhanced-financial-reports/cash-flow?companyId=${selectedCompany}&startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`)
      setCashFlow(data?.data || data)
      toast({
        title: "Success",
        description: "Cash flow statement generated successfully",
      })
    } catch (error) {
      console.error('Cash flow error:', error)
      toast({
        title: "Error",
        description: "Failed to generate cash flow statement",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const generateFinancialRatios = async () => {
    setIsLoading(true)
    try {
      const data = await apiService.get(`/enhanced-financial-reports/ratios?companyId=${selectedCompany}&asOfDate=${asOfDate}`)
      setFinancialRatios(data?.data?.ratios || data?.ratios || {})
      toast({
        title: "Success",
        description: "Financial ratios calculated successfully",
      })
    } catch (error) {
      console.error('Financial ratios error:', error)
      toast({
        title: "Error",
        description: "Failed to calculate financial ratios",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const exportReport = async (format: 'pdf' | 'excel' | 'csv') => {
    try {
      let reportData = null
      
      switch (activeTab) {
        case 'balance-sheet':
          reportData = balanceSheet
          break
        case 'profit-loss':
          reportData = profitAndLoss
          break
        case 'cash-flow':
          reportData = cashFlow
          break
        default:
          toast({
            title: "Error",
            description: "No report data to export",
            variant: "destructive",
          })
          return
      }

      const blob = await apiService.post('/enhanced-financial-reports/export', {
        report: reportData,
        format
      })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `financial-report-${Date.now()}.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: "Success",
        description: `Report exported as ${format.toUpperCase()} successfully`,
      })
    } catch (error) {
      console.error('Export error:', error)
      toast({
        title: "Error",
        description: "Failed to export report",
        variant: "destructive",
      })
    }
  }

  const renderBalanceSheet = () => {
    if (!balanceSheet) return <div className="text-center text-gray-500">Generate a balance sheet to view data</div>

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-600">Total Assets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${balanceSheet.totalAssets.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-600">Total Liabilities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${balanceSheet.totalLiabilities.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-600">Total Equity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${balanceSheet.totalEquity.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Assets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="font-medium text-green-600">Current Assets</div>
                  <div className="text-lg font-semibold">${balanceSheet.assets.totalCurrentAssets.toLocaleString()}</div>
                </div>
                <div>
                  <div className="font-medium text-green-600">Fixed Assets</div>
                  <div className="text-lg font-semibold">${balanceSheet.assets.totalFixedAssets.toLocaleString()}</div>
                </div>
                <div>
                  <div className="font-medium text-green-600">Other Assets</div>
                  <div className="text-lg font-semibold">${balanceSheet.assets.totalOtherAssets.toLocaleString()}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Liabilities & Equity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="font-medium text-red-600">Current Liabilities</div>
                  <div className="text-lg font-semibold">${balanceSheet.liabilities.totalCurrentLiabilities.toLocaleString()}</div>
                </div>
                <div>
                  <div className="font-medium text-red-600">Long-term Liabilities</div>
                  <div className="text-lg font-semibold">${balanceSheet.liabilities.totalLongTermLiabilities.toLocaleString()}</div>
                </div>
                <div>
                  <div className="font-medium text-blue-600">Total Equity</div>
                  <div className="text-lg font-semibold">${balanceSheet.totalEquity.toLocaleString()}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {balanceSheet.ratios && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Financial Ratios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Current Ratio</div>
                  <div className="text-lg font-semibold">{balanceSheet.ratios.currentRatio.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Quick Ratio</div>
                  <div className="text-lg font-semibold">{balanceSheet.ratios.quickRatio.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Debt to Equity</div>
                  <div className="text-lg font-semibold">{balanceSheet.ratios.debtToEquityRatio.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Equity Multiplier</div>
                  <div className="text-lg font-semibold">{balanceSheet.ratios.equityMultiplier.toFixed(2)}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  const renderProfitAndLoss = () => {
    if (!profitAndLoss) return <div className="text-center text-gray-500">Generate a Profit & Loss statement to view data</div>

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-600">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${profitAndLoss.revenue.totalRevenue.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-orange-600">Gross Profit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${profitAndLoss.grossProfit.toLocaleString()}</div>
              <div className="text-sm text-gray-600">{profitAndLoss.margins.grossMargin.toFixed(1)}% margin</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-600">Operating Income</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${profitAndLoss.operatingIncome.toLocaleString()}</div>
              <div className="text-sm text-gray-600">{profitAndLoss.margins.operatingMargin.toFixed(1)}% margin</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-600">Net Income</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${profitAndLoss.netIncome.toLocaleString()}</div>
              <div className="text-sm text-gray-600">{profitAndLoss.margins.netMargin.toFixed(1)}% margin</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Revenue Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="font-medium text-green-600">Sales Revenue</div>
                  <div className="text-lg font-semibold">${profitAndLoss.revenue.salesRevenue.reduce((sum: number, r: any) => sum + r.balance, 0).toLocaleString()}</div>
                </div>
                <div>
                  <div className="font-medium text-green-600">Service Revenue</div>
                  <div className="text-lg font-semibold">${profitAndLoss.revenue.serviceRevenue.reduce((sum: number, r: any) => sum + r.balance, 0).toLocaleString()}</div>
                </div>
                <div>
                  <div className="font-medium text-green-600">Other Revenue</div>
                  <div className="text-lg font-semibold">${profitAndLoss.revenue.otherRevenue.reduce((sum: number, r: any) => sum + r.balance, 0).toLocaleString()}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Operating Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="font-medium text-red-600">Selling Expenses</div>
                  <div className="text-lg font-semibold">${profitAndLoss.operatingExpenses.sellingExpenses.reduce((sum: number, e: any) => sum + e.balance, 0).toLocaleString()}</div>
                </div>
                <div>
                  <div className="font-medium text-red-600">Administrative Expenses</div>
                  <div className="text-lg font-semibold">${profitAndLoss.operatingExpenses.administrativeExpenses.reduce((sum: number, e: any) => sum + e.balance, 0).toLocaleString()}</div>
                </div>
                <div>
                  <div className="font-medium text-red-600">Research Expenses</div>
                  <div className="text-lg font-semibold">${profitAndLoss.operatingExpenses.researchExpenses.reduce((sum: number, e: any) => sum + e.balance, 0).toLocaleString()}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const renderCashFlow = () => {
    if (!cashFlow) return <div className="text-center text-gray-500">Generate a Cash Flow statement to view data</div>

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-600">Operating Cash Flow</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${cashFlow.operatingActivities.netCashFlow.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-600">Investing Cash Flow</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${cashFlow.investingActivities.netCashFlow.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-600">Financing Cash Flow</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${cashFlow.financingActivities.netCashFlow.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-orange-600">Net Cash Flow</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${cashFlow.netCashFlow.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Operating Activities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Cash Inflows</span>
                  <span className="font-semibold">${cashFlow.operatingActivities.inflows.reduce((sum: number, i: any) => sum + i.amount, 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Cash Outflows</span>
                  <span className="font-semibold">${cashFlow.operatingActivities.outflows.reduce((sum: number, i: any) => sum + i.amount, 0).toLocaleString()}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between font-bold">
                    <span>Net Operating</span>
                    <span>${cashFlow.operatingActivities.netCashFlow.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Investing Activities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Cash Inflows</span>
                  <span className="font-semibold">${cashFlow.investingActivities.inflows.reduce((sum: number, i: any) => sum + i.amount, 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Cash Outflows</span>
                  <span className="font-semibold">${cashFlow.investingActivities.outflows.reduce((sum: number, i: any) => sum + i.amount, 0).toLocaleString()}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between font-bold">
                    <span>Net Investing</span>
                    <span>${cashFlow.investingActivities.netCashFlow.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Cash Position
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Beginning Cash</span>
                  <span className="font-semibold">${cashFlow.beginningCash.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Net Cash Flow</span>
                  <span className="font-semibold">${cashFlow.netCashFlow.toLocaleString()}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between font-bold">
                    <span>Ending Cash</span>
                    <span>${cashFlow.endingCash.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const renderFinancialRatios = () => {
    if (!financialRatios) return <div className="text-center text-gray-500">Calculate financial ratios to view data</div>

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Current Ratio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{financialRatios.currentRatio.toFixed(2)}</div>
              <div className="text-sm text-gray-600">Liquidity measure</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Quick Ratio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{financialRatios.quickRatio.toFixed(2)}</div>
              <div className="text-sm text-gray-600">Acid test ratio</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Debt to Equity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{financialRatios.debtToEquityRatio.toFixed(2)}</div>
              <div className="text-sm text-gray-600">Leverage ratio</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">ROA</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{financialRatios.returnOnAssets.toFixed(2)}%</div>
              <div className="text-sm text-gray-600">Return on assets</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">ROE</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{financialRatios.returnOnEquity.toFixed(2)}%</div>
              <div className="text-sm text-gray-600">Return on equity</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Asset Turnover</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{financialRatios.assetTurnover.toFixed(2)}</div>
              <div className="text-sm text-gray-600">Efficiency ratio</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Gross Margin</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{financialRatios.grossProfitMargin.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">Profitability</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Net Margin</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{financialRatios.netProfitMargin.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">Net profitability</div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Enhanced Financial Reports</h1>
          <p className="text-gray-600">Advanced financial reporting with real-time analysis and export capabilities</p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-1">
          <ChartBar className="h-3 w-3" />
          Phase 1.1
        </Badge>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Report Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium">Company</label>
              <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="seed-company-1">Demo Company 1</SelectItem>
                  <SelectItem value="seed-company-2">Demo Company 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">As of Date</label>
              <Input
                type="date"
                value={asOfDate}
                onChange={(e) => setAsOfDate(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Start Date</label>
              <Input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium">End Date</label>
              <Input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} variant="pills">
        <TabsList variant="pills" className="grid w-full grid-cols-5">
          <TabsTrigger value="balance-sheet" variant="pills" icon={<PieChart className="h-4 w-4" />}>
            Balance Sheet
          </TabsTrigger>
          <TabsTrigger value="profit-loss" variant="pills" icon={<BarChart3 className="h-4 w-4" />}>
            Profit & Loss
          </TabsTrigger>
          <TabsTrigger value="cash-flow" variant="pills" icon={<TrendingUp className="h-4 w-4" />}>
            Cash Flow
          </TabsTrigger>
          <TabsTrigger value="ratios" variant="pills" icon={<Calculator className="h-4 w-4" />}>
            Ratios
          </TabsTrigger>
          <TabsTrigger value="custom" variant="pills" icon={<Settings className="h-4 w-4" />}>
            Custom
          </TabsTrigger>
        </TabsList>

        <TabsContent value="balance-sheet" className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={generateBalanceSheet} disabled={isLoading}>
              {isLoading ? 'Generating...' : 'Generate Balance Sheet'}
            </Button>
            {balanceSheet && (
              <>
                <Button variant="outline" onClick={() => exportReport('pdf')}>
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
                <Button variant="outline" onClick={() => exportReport('excel')}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Excel
                </Button>
                <Button variant="outline" onClick={() => exportReport('csv')}>
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </>
            )}
          </div>
          {renderBalanceSheet()}
        </TabsContent>

        <TabsContent value="profit-loss" className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={generateProfitAndLoss} disabled={isLoading}>
              {isLoading ? 'Generating...' : 'Generate Profit & Loss'}
            </Button>
            {profitAndLoss && (
              <>
                <Button variant="outline" onClick={() => exportReport('pdf')}>
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
                <Button variant="outline" onClick={() => exportReport('excel')}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Excel
                </Button>
                <Button variant="outline" onClick={() => exportReport('csv')}>
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </>
            )}
          </div>
          {renderProfitAndLoss()}
        </TabsContent>

        <TabsContent value="cash-flow" className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={generateCashFlow} disabled={isLoading}>
              {isLoading ? 'Generating...' : 'Generate Cash Flow'}
            </Button>
            {cashFlow && (
              <>
                <Button variant="outline" onClick={() => exportReport('pdf')}>
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
                <Button variant="outline" onClick={() => exportReport('excel')}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Excel
                </Button>
                <Button variant="outline" onClick={() => exportReport('csv')}>
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </>
            )}
          </div>
          {renderCashFlow()}
        </TabsContent>

        <TabsContent value="ratios" className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={generateFinancialRatios} disabled={isLoading}>
              {isLoading ? 'Calculating...' : 'Calculate Ratios'}
            </Button>
            {financialRatios && (
              <>
                <Button variant="outline" onClick={() => exportReport('pdf')}>
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
                <Button variant="outline" onClick={() => exportReport('excel')}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Excel
                </Button>
                <Button variant="outline" onClick={() => exportReport('csv')}>
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </>
            )}
          </div>
          {renderFinancialRatios()}
        </TabsContent>

        <TabsContent value="custom" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Custom Report Builder</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-gray-500 py-8">
                <Settings className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>Custom report builder coming soon...</p>
                <p className="text-sm">Drag-and-drop interface for creating custom financial reports</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
