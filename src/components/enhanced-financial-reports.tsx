import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Badge } from "../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Settings,
  DollarSign,
  Calculator,
  ChartBar,
  RefreshCw
} from "lucide-react"
import { useToast } from "../components/ui/use-toast"
import apiService from "../lib/api"
import { FinancialReportExportDropdown } from "./financial-report-exporter"
import { getCompanyId } from "../lib/config"


interface BalanceSheet {
  assets: any
  liabilities: any
  equity: any
  totalAssets: number
  totalLiabilities: number
  totalEquity: number
  date: Date
  changes?: {
    assetsChange: number
    liabilitiesChange: number
    equityChange: number
    workingCapitalChange: number
  }
  ratios?: {
    currentRatio: number
    quickRatio: number
    debtToEquityRatio: number
    returnOnAssets: number
    returnOnEquity: number
    assetTurnover: number
    equityMultiplier: number
  }
}

interface ProfitAndLoss {
  revenue: {
    salesRevenue: any[]
    serviceRevenue: any[]
    otherRevenue: any[]
    totalRevenue: number
  }
  costOfGoodsSold: {
    directMaterials: any[]
    directLabor: any[]
    overhead: any[]
    totalCOGS: number
  }
  grossProfit: number
  operatingExpenses: {
    sellingExpenses: any[]
    administrativeExpenses: any[]
    researchExpenses: any[]
    totalOperatingExpenses: number
  }
  operatingIncome: number
  otherIncome: {
    interestIncome: any[]
    investmentIncome: any[]
    otherIncome: any[]
    totalOtherIncome: number
  }
  otherExpenses: {
    interestExpense: any[]
    taxes: any[]
    otherExpenses: any[]
    totalOtherExpenses: number
  }
  netIncome: number
  period: {
    startDate: string
    endDate: string
  }
  changes?: {
    revenueChange: number
    expenseChange: number
    netIncomeChange: number
    grossProfitChange: number
  }
  margins?: {
    grossMargin: number
    operatingMargin: number
    netMargin: number
  }
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

interface EnhancedFinancialReportsProps {
  selectedCompany?: string;
  defaultReportType?: string;
  initialData?: any;
}

export function EnhancedFinancialReports({ selectedCompany: propSelectedCompany, defaultReportType, initialData }: EnhancedFinancialReportsProps = {}) {
  const [selectedCompany, setSelectedCompany] = useState(propSelectedCompany || getCompanyId() || '')
  const [companies, setCompanies] = useState<Array<{id: string, name: string}>>([])
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  })
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0])
  const [activeTab, setActiveTab] = useState(defaultReportType || 'balance-sheet')
  const [isLoading, setIsLoading] = useState(false)
  const [balanceSheet, setBalanceSheet] = useState<BalanceSheet | null>(null)
  const [profitAndLoss, setProfitAndLoss] = useState<ProfitAndLoss | null>(null)
  const [cashFlow, setCashFlow] = useState<CashFlow | null>(null)
  const [financialRatios, setFinancialRatios] = useState<any>(null)
  const { toast } = useToast()

  // Load companies on component mount
  useEffect(() => {
    loadCompanies()
  }, [])

  const loadCompanies = async () => {
    try {
      const response = await apiService.getCompanies({ page: 1, pageSize: 50 })
      const companiesData = (response as any)?.data || response || []
      setCompanies(Array.isArray(companiesData) ? companiesData : [])
    } catch (err) {
      console.error('Error loading companies:', err)
      // Fallback to current company if loading fails
      const currentCompanyId = getCompanyId()
      if (currentCompanyId) {
        setCompanies([{ id: currentCompanyId, name: 'Current Company' }])
      }
    }
  }

  // Generate sample data for demonstrational data if provided, but allow it to be overridden
  useEffect(() => {
    if (initialData) {
      if (initialData['balance-sheet']) setBalanceSheet(initialData['balance-sheet'])
      if (initialData['profit-loss']) setProfitAndLoss(initialData['profit-loss'])
      if (initialData['cash-flow']) setCashFlow(initialData['cash-flow'])
    }
  }, [initialData])

  // Listen for journal entry creation events to auto-refresh reports
  useEffect(() => {
    const handleJournalEntryCreated = () => {
      // Auto-refresh the currently active report
      if (activeTab === 'balance-sheet') {
        generateBalanceSheet()
      } else if (activeTab === 'profit-loss') {
        generateProfitAndLoss()
      } else if (activeTab === 'cash-flow') {
        generateCashFlow()
      }
    }

    window.addEventListener('journalEntryCreated', handleJournalEntryCreated)
    return () => window.removeEventListener('journalEntryCreated', handleJournalEntryCreated)
  }, [activeTab])

  const generateBalanceSheet = async () => {
    setIsLoading(true)
    try {
      console.log('Generating balance sheet for company:', selectedCompany, 'as of:', asOfDate)
      const data = await apiService.get(`/api/enhanced-financial-reports/balance-sheet?companyId=${selectedCompany}&asOfDate=${asOfDate}`)
      console.log('Balance sheet data received:', data)
      
      // Clear any cached data and set fresh data
      const freshData = data?.data || data
      console.log('Setting fresh balance sheet data:', freshData)
      setBalanceSheet(freshData)
      
      toast({
        title: "Success",
        description: "Balance sheet generated successfully",
      })
    } catch (error) {
      console.error('Balance sheet error:', error)
      toast({
        title: "Error",
        description: `Failed to generate balance sheet: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const generateProfitAndLoss = async () => {
    setIsLoading(true)
    try {
      const data = await apiService.get(`/api/enhanced-financial-reports/profit-loss?companyId=${selectedCompany}&startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`)
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
      const data = await apiService.get(`/api/enhanced-financial-reports/cash-flow?companyId=${selectedCompany}&startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`)
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
      const data = await apiService.get(`/api/enhanced-financial-reports/ratios?companyId=${selectedCompany}&asOfDate=${asOfDate}`)
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
              <div className="space-y-4">
                <div>
                  <div className="font-medium text-green-600">Current Assets</div>
                  <div className="text-lg font-semibold">${balanceSheet.assets.totalCurrentAssets.toLocaleString()}</div>
                  <ul className="list-disc list-inside text-sm text-gray-700 mt-2 space-y-1">
                    {balanceSheet.assets.currentAssets.map((asset: any) => (
                      <li key={asset.accountId}>
                        {asset.accountName} ({asset.accountNumber}): ${asset.balance.toLocaleString()}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="font-medium text-green-600">Fixed Assets</div>
                  <div className="text-lg font-semibold">${balanceSheet.assets.totalFixedAssets.toLocaleString()}</div>
                  <ul className="list-disc list-inside text-sm text-gray-700 mt-2 space-y-1">
                    {balanceSheet.assets.fixedAssets.map((asset: any) => (
                      <li key={asset.accountId}>
                        {asset.accountName} ({asset.accountNumber}): ${asset.balance.toLocaleString()}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="font-medium text-green-600">Other Assets</div>
                  <div className="text-lg font-semibold">${balanceSheet.assets.totalOtherAssets.toLocaleString()}</div>
                  <ul className="list-disc list-inside text-sm text-gray-700 mt-2 space-y-1">
                    {balanceSheet.assets.otherAssets.map((asset: any) => (
                      <li key={asset.accountId}>
                        {asset.accountName} ({asset.accountNumber}): ${asset.balance.toLocaleString()}
                      </li>
                    ))}
                  </ul>
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
              <div className="space-y-4">
                <div>
                  <div className="font-medium text-red-600">Current Liabilities</div>
                  <div className="text-lg font-semibold">${balanceSheet.liabilities.totalCurrentLiabilities.toLocaleString()}</div>
                  <ul className="list-disc list-inside text-sm text-gray-700 mt-2 space-y-1">
                    {balanceSheet.liabilities.currentLiabilities.map((liability: any) => (
                      <li key={liability.accountId}>
                        {liability.accountName} ({liability.accountNumber}): ${liability.balance.toLocaleString()}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="font-medium text-red-600">Long-term Liabilities</div>
                  <div className="text-lg font-semibold">${balanceSheet.liabilities.totalLongTermLiabilities.toLocaleString()}</div>
                  <ul className="list-disc list-inside text-sm text-gray-700 mt-2 space-y-1">
                    {balanceSheet.liabilities.longTermLiabilities.map((liability: any) => (
                      <li key={liability.accountId}>
                        {liability.accountName} ({liability.accountNumber}): ${liability.balance.toLocaleString()}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="font-medium text-blue-600">Equity</div>
                  <div className="text-lg font-semibold">${balanceSheet.equity.totalContributedCapital.toLocaleString()}</div>
                  <ul className="list-disc list-inside text-sm text-gray-700 mt-2 space-y-1">
                    {balanceSheet.equity.contributedCapital.map((equity: any) => (
                      <li key={equity.accountId}>
                        {equity.accountName} ({equity.accountNumber}): ${equity.balance.toLocaleString()}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Changes Summary */}
        {balanceSheet.changes && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Changes Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Assets Change</div>
                  <div className={`text-lg font-semibold ${balanceSheet.changes.assetsChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${balanceSheet.changes.assetsChange?.toLocaleString() || '0'}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Liabilities Change</div>
                  <div className={`text-lg font-semibold ${balanceSheet.changes.liabilitiesChange >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                    ${balanceSheet.changes.liabilitiesChange?.toLocaleString() || '0'}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Equity Change</div>
                  <div className={`text-lg font-semibold ${balanceSheet.changes.equityChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${balanceSheet.changes.equityChange?.toLocaleString() || '0'}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Working Capital Change</div>
                  <div className={`text-lg font-semibold ${balanceSheet.changes.workingCapitalChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${balanceSheet.changes.workingCapitalChange?.toLocaleString() || '0'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

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
                  <div className="text-lg font-semibold">{balanceSheet.ratios.currentRatio?.toFixed(2) || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Quick Ratio</div>
                  <div className="text-lg font-semibold">{balanceSheet.ratios.quickRatio?.toFixed(2) || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Debt to Equity</div>
                  <div className="text-lg font-semibold">{balanceSheet.ratios.debtToEquityRatio?.toFixed(2) || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Equity Multiplier</div>
                  <div className="text-lg font-semibold">{balanceSheet.ratios.equityMultiplier?.toFixed(2) || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Return on Assets</div>
                  <div className="text-lg font-semibold">{balanceSheet.ratios.returnOnAssets?.toFixed(2) || 'N/A'}%</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Return on Equity</div>
                  <div className="text-lg font-semibold">{balanceSheet.ratios.returnOnEquity?.toFixed(2) || 'N/A'}%</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Asset Turnover</div>
                  <div className="text-lg font-semibold">{balanceSheet.ratios.assetTurnover?.toFixed(2) || 'N/A'}</div>
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
        {/* Key Metrics Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-600">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${profitAndLoss.revenue?.totalRevenue?.toLocaleString() || '0'}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-orange-600">Gross Profit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${profitAndLoss.grossProfit?.toLocaleString() || '0'}</div>
              <div className="text-sm text-gray-600">{profitAndLoss.margins?.grossMargin?.toFixed(1) || '0'}% margin</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-600">Operating Income</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${profitAndLoss.operatingIncome?.toLocaleString() || '0'}</div>
              <div className="text-sm text-gray-600">{profitAndLoss.margins?.operatingMargin?.toFixed(1) || '0'}% margin</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-600">Net Income</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${profitAndLoss.netIncome?.toLocaleString() || '0'}</div>
              <div className="text-sm text-gray-600">{profitAndLoss.margins?.netMargin?.toFixed(1) || '0'}% margin</div>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Revenue Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="font-medium text-green-600">Sales Revenue</div>
                <div className="text-lg font-semibold">${profitAndLoss.revenue?.salesRevenue?.reduce((sum: number, r: any) => sum + r.balance, 0)?.toLocaleString() || '0'}</div>
                <ul className="list-disc list-inside text-sm text-gray-700 mt-2 space-y-1">
                  {profitAndLoss.revenue?.salesRevenue?.map((item: any) => (
                    <li key={item.accountId}>
                      {item.accountName} ({item.accountNumber}): ${item.balance.toLocaleString()}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="font-medium text-green-600">Service Revenue</div>
                <div className="text-lg font-semibold">${profitAndLoss.revenue?.serviceRevenue?.reduce((sum: number, r: any) => sum + r.balance, 0)?.toLocaleString() || '0'}</div>
                <ul className="list-disc list-inside text-sm text-gray-700 mt-2 space-y-1">
                  {profitAndLoss.revenue?.serviceRevenue?.map((item: any) => (
                    <li key={item.accountId}>
                      {item.accountName} ({item.accountNumber}): ${item.balance.toLocaleString()}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="font-medium text-green-600">Other Revenue</div>
                <div className="text-lg font-semibold">${profitAndLoss.revenue?.otherRevenue?.reduce((sum: number, r: any) => sum + r.balance, 0)?.toLocaleString() || '0'}</div>
                <ul className="list-disc list-inside text-sm text-gray-700 mt-2 space-y-1">
                  {profitAndLoss.revenue?.otherRevenue?.map((item: any) => (
                    <li key={item.accountId}>
                      {item.accountName} ({item.accountNumber}): ${item.balance.toLocaleString()}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cost of Goods Sold */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Cost of Goods Sold
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="font-medium text-red-600">Direct Materials</div>
                <div className="text-lg font-semibold">${profitAndLoss.costOfGoodsSold?.directMaterials?.reduce((sum: number, item: any) => sum + item.balance, 0)?.toLocaleString() || '0'}</div>
                <ul className="list-disc list-inside text-sm text-gray-700 mt-2 space-y-1">
                  {profitAndLoss.costOfGoodsSold?.directMaterials?.map((item: any) => (
                    <li key={item.accountId}>
                      {item.accountName} ({item.accountNumber}): ${item.balance.toLocaleString()}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="font-medium text-red-600">Direct Labor</div>
                <div className="text-lg font-semibold">${profitAndLoss.costOfGoodsSold?.directLabor?.reduce((sum: number, item: any) => sum + item.balance, 0)?.toLocaleString() || '0'}</div>
                <ul className="list-disc list-inside text-sm text-gray-700 mt-2 space-y-1">
                  {profitAndLoss.costOfGoodsSold?.directLabor?.map((item: any) => (
                    <li key={item.accountId}>
                      {item.accountName} ({item.accountNumber}): ${item.balance.toLocaleString()}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="font-medium text-red-600">Overhead</div>
                <div className="text-lg font-semibold">${profitAndLoss.costOfGoodsSold?.overhead?.reduce((sum: number, item: any) => sum + item.balance, 0)?.toLocaleString() || '0'}</div>
                <ul className="list-disc list-inside text-sm text-gray-700 mt-2 space-y-1">
                  {profitAndLoss.costOfGoodsSold?.overhead?.map((item: any) => (
                    <li key={item.accountId}>
                      {item.accountName} ({item.accountNumber}): ${item.balance.toLocaleString()}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="border-t pt-2">
                <div className="font-bold text-red-600">Total COGS</div>
                <div className="text-xl font-bold">${profitAndLoss.costOfGoodsSold?.totalCOGS?.toLocaleString() || '0'}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Operating Expenses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Operating Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="font-medium text-red-600">Selling Expenses</div>
                <div className="text-lg font-semibold">${profitAndLoss.operatingExpenses?.sellingExpenses?.reduce((sum: number, item: any) => sum + item.balance, 0)?.toLocaleString() || '0'}</div>
                <ul className="list-disc list-inside text-sm text-gray-700 mt-2 space-y-1">
                  {profitAndLoss.operatingExpenses?.sellingExpenses?.map((item: any) => (
                    <li key={item.accountId}>
                      {item.accountName} ({item.accountNumber}): ${item.balance.toLocaleString()}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="font-medium text-red-600">Administrative Expenses</div>
                <div className="text-lg font-semibold">${profitAndLoss.operatingExpenses?.administrativeExpenses?.reduce((sum: number, item: any) => sum + item.balance, 0)?.toLocaleString() || '0'}</div>
                <ul className="list-disc list-inside text-sm text-gray-700 mt-2 space-y-1">
                  {profitAndLoss.operatingExpenses?.administrativeExpenses?.map((item: any) => (
                    <li key={item.accountId}>
                      {item.accountName} ({item.accountNumber}): ${item.balance.toLocaleString()}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="font-medium text-red-600">Research & Development</div>
                <div className="text-lg font-semibold">${profitAndLoss.operatingExpenses?.researchExpenses?.reduce((sum: number, item: any) => sum + item.balance, 0)?.toLocaleString() || '0'}</div>
                <ul className="list-disc list-inside text-sm text-gray-700 mt-2 space-y-1">
                  {profitAndLoss.operatingExpenses?.researchExpenses?.map((item: any) => (
                    <li key={item.accountId}>
                      {item.accountName} ({item.accountNumber}): ${item.balance.toLocaleString()}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="border-t pt-2">
                <div className="font-bold text-red-600">Total Operating Expenses</div>
                <div className="text-xl font-bold">${profitAndLoss.operatingExpenses?.totalOperatingExpenses?.toLocaleString() || '0'}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Other Income & Expenses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Other Income
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="font-medium text-green-600">Interest Income</div>
                  <div className="text-lg font-semibold">${profitAndLoss.otherIncome?.interestIncome?.reduce((sum: number, item: any) => sum + item.balance, 0)?.toLocaleString() || '0'}</div>
                </div>
                <div>
                  <div className="font-medium text-green-600">Investment Income</div>
                  <div className="text-lg font-semibold">${profitAndLoss.otherIncome?.investmentIncome?.reduce((sum: number, item: any) => sum + item.balance, 0)?.toLocaleString() || '0'}</div>
                </div>
                <div>
                  <div className="font-medium text-green-600">Other Income</div>
                  <div className="text-lg font-semibold">${profitAndLoss.otherIncome?.otherIncome?.reduce((sum: number, item: any) => sum + item.balance, 0)?.toLocaleString() || '0'}</div>
                </div>
                <div className="border-t pt-2">
                  <div className="font-bold text-green-600">Total Other Income</div>
                  <div className="text-xl font-bold">${profitAndLoss.otherIncome?.totalOtherIncome?.toLocaleString() || '0'}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Other Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="font-medium text-red-600">Interest Expense</div>
                  <div className="text-lg font-semibold">${profitAndLoss.otherExpenses?.interestExpense?.reduce((sum: number, item: any) => sum + item.balance, 0)?.toLocaleString() || '0'}</div>
                </div>
                <div>
                  <div className="font-medium text-red-600">Taxes</div>
                  <div className="text-lg font-semibold">${profitAndLoss.otherExpenses?.taxes?.reduce((sum: number, item: any) => sum + item.balance, 0)?.toLocaleString() || '0'}</div>
                </div>
                <div>
                  <div className="font-medium text-red-600">Other Expenses</div>
                  <div className="text-lg font-semibold">${profitAndLoss.otherExpenses?.otherExpenses?.reduce((sum: number, item: any) => sum + item.balance, 0)?.toLocaleString() || '0'}</div>
                </div>
                <div className="border-t pt-2">
                  <div className="font-bold text-red-600">Total Other Expenses</div>
                  <div className="text-xl font-bold">${profitAndLoss.otherExpenses?.totalOtherExpenses?.toLocaleString() || '0'}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Period Changes */}
        {profitAndLoss.changes && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Period Changes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Revenue Change</div>
                  <div className={`text-lg font-semibold ${profitAndLoss.changes.revenueChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${profitAndLoss.changes.revenueChange?.toLocaleString() || '0'}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Expense Change</div>
                  <div className={`text-lg font-semibold ${profitAndLoss.changes.expenseChange >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                    ${profitAndLoss.changes.expenseChange?.toLocaleString() || '0'}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Net Income Change</div>
                  <div className={`text-lg font-semibold ${profitAndLoss.changes.netIncomeChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${profitAndLoss.changes.netIncomeChange?.toLocaleString() || '0'}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Gross Profit Change</div>
                  <div className={`text-lg font-semibold ${profitAndLoss.changes.grossProfitChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${profitAndLoss.changes.grossProfitChange?.toLocaleString() || '0'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
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
                  {companies.length > 0 ? (
                    companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value={selectedCompany || getCompanyId() || ''}>
                      Current Company
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            
            {/* Balance Sheet & Ratios - Only As of Date */}
            {(activeTab === 'balance-sheet' || activeTab === 'ratios') && (
              <div>
                <label className="text-sm font-medium">As of Date</label>
                <Input
                  type="date"
                  value={asOfDate}
                  onChange={(e) => setAsOfDate(e.target.value)}
                  placeholder="Select date"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {activeTab === 'balance-sheet' 
                    ? 'Financial position at this date' 
                    : 'Ratios calculated as of this date'}
                </p>
              </div>
            )}
            
            {/* Profit & Loss and Cash Flow - Date Range */}
            {(activeTab === 'profit-loss' || activeTab === 'cash-flow') && (
              <>
                <div>
                  <label className="text-sm font-medium">Start Date</label>
                  <Input
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                    placeholder="Start date"
                  />
                  <p className="text-xs text-gray-500 mt-1">Period start</p>
                </div>
                <div>
                  <label className="text-sm font-medium">End Date</label>
                  <Input
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                    placeholder="End date"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {activeTab === 'profit-loss' ? 'Income & expenses period' : 'Cash flow period'}
                  </p>
                </div>
              </>
            )}
            
            {/* Custom Reports - Show all date options */}
            {activeTab === 'custom' && (
              <>
                <div>
                  <label className="text-sm font-medium">As of Date</label>
                  <Input
                    type="date"
                    value={asOfDate}
                    onChange={(e) => setAsOfDate(e.target.value)}
                    placeholder="Select date"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Start Date</label>
                  <Input
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                    placeholder="Start date"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">End Date</label>
                  <Input
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                    placeholder="End date"
                  />
                </div>
              </>
            )}
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
            <Button variant="outline" onClick={() => { setBalanceSheet(null); generateBalanceSheet(); }} disabled={isLoading}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Force Refresh
            </Button>
            <FinancialReportExportDropdown
              reportType="balance-sheet"
              reportData={balanceSheet}
              companyId={selectedCompany}
              disabled={isLoading}
            />
          </div>
          {renderBalanceSheet()}
        </TabsContent>

        <TabsContent value="profit-loss" className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={generateProfitAndLoss} disabled={isLoading}>
              {isLoading ? 'Generating...' : 'Generate Profit & Loss'}
            </Button>
            <Button variant="outline" onClick={() => { setProfitAndLoss(null); generateProfitAndLoss(); }} disabled={isLoading}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Force Refresh
            </Button>
            <FinancialReportExportDropdown
              reportType="profit-loss"
              reportData={profitAndLoss}
              companyId={selectedCompany}
              disabled={isLoading}
            />
          </div>
          {renderProfitAndLoss()}
        </TabsContent>

        <TabsContent value="cash-flow" className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={generateCashFlow} disabled={isLoading}>
              {isLoading ? 'Generating...' : 'Generate Cash Flow'}
            </Button>
            <Button variant="outline" onClick={() => { setCashFlow(null); generateCashFlow(); }} disabled={isLoading}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Force Refresh
            </Button>
            <FinancialReportExportDropdown
              reportType="cash-flow"
              reportData={cashFlow}
              companyId={selectedCompany}
              disabled={isLoading}
            />
          </div>
          {renderCashFlow()}
        </TabsContent>

        <TabsContent value="ratios" className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={generateFinancialRatios} disabled={isLoading}>
              {isLoading ? 'Calculating...' : 'Calculate Ratios'}
            </Button>
            <FinancialReportExportDropdown
              reportType="ratios"
              reportData={financialRatios}
              companyId={selectedCompany}
              disabled={isLoading}
            />
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
