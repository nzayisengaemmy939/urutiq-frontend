import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  FileText, 
  AlertCircle,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2
} from "lucide-react"
import { useDashboardData } from "../hooks/useDashboardData"

interface FinancialMetric {
  title: string
  value: string
  change: string
  trend: "up" | "down" | "neutral"
  icon: any
  color: string
  description?: string
}

interface ChartData {
  month: string
  revenue: number
  expenses: number
  profit: number
}

const financialMetrics: FinancialMetric[] = [
  {
    title: "Total Revenue",
    value: "$2,847,392",
    change: "+12.5%",
    trend: "up",
    icon: DollarSign,
    color: "text-green-600",
    description: "vs. last month"
  },
  {
    title: "Total Expenses",
    value: "$1,923,847",
    change: "+8.2%",
    trend: "up",
    icon: TrendingDown,
    color: "text-orange-600",
    description: "vs. last month"
  },
  {
    title: "Net Profit",
    value: "$923,545",
    change: "+18.7%",
    trend: "up",
    icon: TrendingUp,
    color: "text-blue-600",
    description: "vs. last month"
  },
  {
    title: "Profit Margin",
    value: "32.4%",
    change: "+4.2%",
    trend: "up",
    icon: Target,
    color: "text-purple-600",
    description: "vs. last month"
  },
  {
    title: "Active Clients",
    value: "47",
    change: "+3",
    trend: "up",
    icon: Users,
    color: "text-cyan-600",
    description: "new this month"
  },
  {
    title: "Pending Invoices",
    value: "$184,293",
    change: "-8.2%",
    trend: "down",
    icon: FileText,
    color: "text-red-600",
    description: "vs. last month"
  },
  {
    title: "Cash Flow",
    value: "$456,789",
    change: "+15.3%",
    trend: "up",
    icon: Activity,
    color: "text-emerald-600",
    description: "vs. last month"
  },
  {
    title: "AI Anomalies",
    value: "12",
    change: "+4",
    trend: "up",
    icon: AlertCircle,
    color: "text-amber-600",
    description: "detected this month"
  }
]

const monthlyData: ChartData[] = [
  { month: "Jan", revenue: 185000, expenses: 142000, profit: 43000 },
  { month: "Feb", revenue: 192000, expenses: 148000, profit: 44000 },
  { month: "Mar", revenue: 198000, expenses: 151000, profit: 47000 },
  { month: "Apr", revenue: 205000, expenses: 155000, profit: 50000 },
  { month: "May", revenue: 212000, expenses: 158000, profit: 54000 },
  { month: "Jun", revenue: 218000, expenses: 162000, profit: 56000 },
  { month: "Jul", revenue: 225000, expenses: 165000, profit: 60000 },
  { month: "Aug", revenue: 232000, expenses: 168000, profit: 64000 },
  { month: "Sep", revenue: 238000, expenses: 172000, profit: 66000 },
  { month: "Oct", revenue: 245000, expenses: 175000, profit: 70000 },
  { month: "Nov", revenue: 252000, expenses: 178000, profit: 74000 },
  { month: "Dec", revenue: 259000, expenses: 182000, profit: 77000 }
]

const topRevenueSources = [
  { name: "Consulting Services", revenue: "$892,456", percentage: 31.3, trend: "up" },
  { name: "Software Licenses", revenue: "$567,234", percentage: 19.9, trend: "up" },
  { name: "Training & Support", revenue: "$445,123", percentage: 15.6, trend: "up" },
  { name: "Custom Development", revenue: "$334,567", percentage: 11.8, trend: "down" },
  { name: "Maintenance", revenue: "$223,456", percentage: 7.9, trend: "neutral" }
]

const recentTransactions = [
  { id: "TXN-001", description: "Invoice #INV-2024-001", amount: "$12,500", type: "revenue", date: "2 hours ago" },
  { id: "TXN-002", description: "Office Supplies", amount: "$1,250", type: "expense", date: "4 hours ago" },
  { id: "TXN-003", description: "Client Payment - ABC Corp", amount: "$8,750", type: "revenue", date: "1 day ago" },
  { id: "TXN-004", description: "Software Subscription", amount: "$2,100", type: "expense", date: "2 days ago" },
  { id: "TXN-005", description: "Consulting Fee", amount: "$15,000", type: "revenue", date: "3 days ago" }
]

interface FinancialOverviewProps {
  companyId?: string;
}

export function FinancialOverview({ companyId }: FinancialOverviewProps) {
  const { data: dashboardData, loading, error } = useDashboardData(companyId);
  
  // Pagination for Recent Transactions
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(2) // Show only 2 recent transactions
  
  // Use real data or fallback to mock data
  const currentMonth = dashboardData ? {
    revenue: dashboardData.metrics.totalRevenue,
    expenses: dashboardData.metrics.totalExpenses,
    profit: dashboardData.metrics.netProfit
  } : monthlyData[monthlyData.length - 1]
  
  const previousMonth = dashboardData?.monthlyTrend?.[dashboardData.monthlyTrend.length - 2] || monthlyData[monthlyData.length - 2]

  const safeChange = (current: number, prev: number) => {
    if (!isFinite(current) || !isFinite(prev)) return 0
    if (prev === 0) return 0
    return ((current - prev) / prev) * 100
  }
  
  const revenueChange = (dashboardData?.changes?.revenue ?? safeChange(currentMonth.revenue, previousMonth.revenue))
  const expensesChange = (dashboardData?.changes?.expenses ?? safeChange(currentMonth.expenses, previousMonth.expenses))
  const profitChange = (dashboardData?.changes?.profit ?? safeChange(currentMonth.profit, previousMonth.profit))
  
  // Create financial metrics from real data
  const realFinancialMetrics: FinancialMetric[] = dashboardData ? [
    {
      title: "Total Revenue",
      value: `$${dashboardData.metrics.totalRevenue.toLocaleString()}`,
      change: `${revenueChange > 0 ? '+' : ''}${revenueChange.toFixed(1)}%`,
      trend: revenueChange > 0 ? "up" : revenueChange < 0 ? "down" : "neutral",
      icon: DollarSign,
      color: "text-green-600",
      description: "vs. last period"
    },
    {
      title: "Total Expenses",
      value: `$${dashboardData.metrics.totalExpenses.toLocaleString()}`,
      change: `${expensesChange > 0 ? '+' : ''}${expensesChange.toFixed(1)}%`,
      trend: expensesChange > 0 ? "up" : expensesChange < 0 ? "down" : "neutral",
      icon: TrendingDown,
      color: "text-orange-600",
      description: "vs. last period"
    },
    {
      title: "Net Profit",
      value: `$${dashboardData.metrics.netProfit.toLocaleString()}`,
      change: `${profitChange > 0 ? '+' : ''}${profitChange.toFixed(1)}%`,
      trend: profitChange > 0 ? "up" : profitChange < 0 ? "down" : "neutral",
      icon: TrendingUp,
      color: "text-blue-600",
      description: "vs. last period"
    },
    {
      title: "Profit Margin",
      value: `${dashboardData.metrics.profitMargin.toFixed(1)}%`,
      change: `${profitChange > 0 ? '+' : ''}${profitChange.toFixed(1)}%`,
      trend: profitChange > 0 ? "up" : profitChange < 0 ? "down" : "neutral",
      icon: Target,
      color: "text-purple-600",
      description: "vs. last period"
    },
    {
      title: "Active Clients",
      value: dashboardData.metrics.activeCustomers.toString(),
      change: "+0",
      trend: "neutral",
      icon: Users,
      color: "text-cyan-600",
      description: "total customers"
    },
    {
      title: "Pending Invoices",
      value: `$${dashboardData.metrics.pendingInvoices.toLocaleString()}`,
      change: "-0%",
      trend: "neutral",
      icon: FileText,
      color: "text-red-600",
      description: "awaiting payment"
    },
    {
      title: "Cash Flow",
      value: `$${dashboardData.metrics.netProfit.toLocaleString()}`,
      change: `${profitChange > 0 ? '+' : ''}${profitChange.toFixed(1)}%`,
      trend: profitChange > 0 ? "up" : profitChange < 0 ? "down" : "neutral",
      icon: Activity,
      color: "text-emerald-600",
      description: "vs. last period"
    },
    {
      title: "Overdue Invoices",
      value: `$${dashboardData.metrics.overdueInvoices.toLocaleString()}`,
      change: "+0",
      trend: "neutral",
      icon: AlertCircle,
      color: "text-amber-600",
      description: "past due"
    }
  ] : financialMetrics;
  
  // Use real revenue sources or fallback to mock data
  const realRevenueSources = dashboardData?.revenueSources || topRevenueSources;
  
  
  // Use real recent transactions or fallback to mock data
  const realRecentTransactions = dashboardData?.recentActivity?.map(activity => ({
    id: activity.id,
    description: activity.title,
    amount: `$${activity.amount.toLocaleString()}`,
    type: activity.type === 'journal_entry' ? 'revenue' : 'expense',
    date: new Date(activity.date).toLocaleDateString()
  })) || recentTransactions;
  
  // Pagination logic for recent transactions
  const totalTransactions = realRecentTransactions.length
  const totalPages = Math.ceil(totalTransactions / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedTransactions = realRecentTransactions.slice(startIndex, endIndex)
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading financial data...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-600">
        <AlertCircle className="h-8 w-8 mr-2" />
        <span>Error loading financial data: {error?.message || error?.toString() || 'Unknown error'}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="px-6 pt-4">
          <h2 className="text-2xl font-bold text-foreground">Financial Overview</h2>
          <p className="text-muted-foreground">
            Comprehensive view of your financial performance and key metrics
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="w-4 h-4 mr-2" />
            This Month
          </Button>
          <Button variant="outline" size="sm">
            <BarChart3 className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Enhanced Key Financial Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 px-8 py-2">
        {realFinancialMetrics.slice(0, 4).map((metric, index) => {
          const gradientClasses = [
            'from-green-50 to-emerald-100 border-green-200',
            'from-orange-50 to-amber-100 border-orange-200', 
            'from-blue-50 to-cyan-100 border-blue-200',
            'from-purple-50 to-indigo-100 border-purple-200'
          ][index] || 'from-gray-50 to-slate-100 border-gray-200'
          
          return (
            <Card key={metric.title} className={`bg-gradient-to-br ${gradientClasses} hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-2`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <div>
                  <CardTitle className="text-sm font-semibold text-slate-700">
                    {metric.title}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <div className={`p-2 rounded-lg ${metric.color.includes('green') ? 'bg-green-500' : metric.color.includes('orange') ? 'bg-orange-500' : metric.color.includes('blue') ? 'bg-blue-500' : 'bg-purple-500'}`}>
                      <metric.icon className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-3xl font-bold text-slate-900 mb-2">{metric.value}</div>
                <div className="flex items-center gap-2 text-sm">
                  {metric.trend === "up" ? (
                    <div className="flex items-center gap-1 text-green-600 bg-green-100 px-2 py-1 rounded-full">
                      <ArrowUpRight className="w-3 h-3" />
                      <span className="font-semibold">{metric.change}</span>
                    </div>
                  ) : metric.trend === "down" ? (
                    <div className="flex items-center gap-1 text-red-600 bg-red-100 px-2 py-1 rounded-full">
                      <ArrowDownRight className="w-3 h-3" />
                      <span className="font-semibold">{metric.change}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-slate-600 bg-slate-100 px-2 py-1 rounded-full">
                      <span className="font-semibold">{metric.change}</span>
                    </div>
                  )}
                  <span className="text-slate-600 font-medium">{metric.description}</span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Detailed Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4  px-6">
        {realFinancialMetrics.slice(4).map((metric) => (
          <Card key={metric.title} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.title}
              </CardTitle>
              <metric.icon className={`w-4 h-4 ${metric.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{metric.value}</div>
              <div className="flex items-center gap-1 text-xs">
                {metric.trend === "up" ? (
                  <ArrowUpRight className="w-3 h-3 text-green-500" />
                ) : metric.trend === "down" ? (
                  <ArrowDownRight className="w-3 h-3 text-red-500" />
                ) : (
                  <div className="w-3 h-3" />
                )}
                <span className={metric.trend === "up" ? "text-green-500" : metric.trend === "down" ? "text-red-500" : "text-muted-foreground"}>
                  {metric.change}
                </span>
                <span className="text-muted-foreground">{metric.description}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue Sources and Recent Transactions */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Revenue Sources */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Top Revenue Sources
            </CardTitle>
            <CardDescription>
              Breakdown of revenue by business line
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {realRevenueSources.length > 0 ? realRevenueSources.map((source, index) => (
                <div key={`${source.name}-${index}`} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-primary" />
                    <div>
                      <p className="font-medium text-sm">{source.name}</p>
                      <p className="text-xs text-muted-foreground">{source.percentage}% of total</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">${typeof source.revenue === 'number' ? source.revenue.toLocaleString() : source.revenue}</p>
                    <div className="flex items-center gap-1 text-xs">
                      {source.trend === "up" ? (
                        <ArrowUpRight className="w-3 h-3 text-green-500" />
                      ) : source.trend === "down" ? (
                        <ArrowDownRight className="w-3 h-3 text-red-500" />
                      ) : (
                        <div className="w-3 h-3" />
                      )}
                      <span className={source.trend === "up" ? "text-green-500" : source.trend === "down" ? "text-red-500" : "text-muted-foreground"}>
                        {source.trend === "up" ? "+" : source.trend === "down" ? "-" : "0"}
                      </span>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-muted-foreground">
                  <PieChart className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No revenue data available</p>
                  <p className="text-xs">Revenue sources will appear here once you have paid invoices</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Recent Transactions
            </CardTitle>
            <CardDescription>
              Latest financial activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {paginatedTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      transaction.type === "revenue" ? "bg-green-500" : "bg-red-500"
                    }`} />
                    <div>
                      <p className="text-sm font-medium">{transaction.description}</p>
                      <p className="text-xs text-muted-foreground">{transaction.id}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium text-sm ${
                      transaction.type === "revenue" ? "text-green-600" : "text-red-600"
                    }`}>
                      {transaction.type === "revenue" ? "+" : "-"}{transaction.amount}
                    </p>
                    <p className="text-xs text-muted-foreground">{transaction.date}</p>
                  </div>
                </div>
              ))}
              
              {/* Pagination Controls for Recent Transactions */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-6 border-t border-border">
                  <div className="text-sm text-muted-foreground">
                    Showing {startIndex + 1} to {Math.min(endIndex, totalTransactions)} of {totalTransactions} transactions
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronsRight className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Page size:</span>
                    <Select value={pageSize.toString()} onValueChange={(value) => {
                      setPageSize(parseInt(value))
                      setCurrentPage(1)
                    }}>
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3</SelectItem>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trend Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Monthly Performance Summary
          </CardTitle>
          <CardDescription>
            Key metrics comparison with previous month
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 rounded-lg border">
              <p className="text-sm font-medium text-muted-foreground">Revenue</p>
              <p className="text-2xl font-bold text-foreground">${currentMonth.revenue.toLocaleString()}</p>
              <div className="flex items-center justify-center gap-1 text-sm">
                {parseFloat(revenueChange.toString()) > 0 ? (
                  <ArrowUpRight className="w-4 h-4 text-green-500" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 text-red-500" />
                )}
                <span className={parseFloat(revenueChange.toString()) > 0 ? "text-green-500" : "text-red-500"}>
                  {revenueChange}%
                </span>
                <span className="text-muted-foreground">vs last month</span>
              </div>
            </div>
            
            <div className="text-center p-4 rounded-lg border">
              <p className="text-sm font-medium text-muted-foreground">Expenses</p>
              <p className="text-2xl font-bold text-foreground">${currentMonth.expenses.toLocaleString()}</p>
              <div className="flex items-center justify-center gap-1 text-sm">
                {parseFloat(expensesChange.toString()) > 0 ? (
                  <ArrowUpRight className="w-4 h-4 text-orange-500" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 text-green-500" />
                )}
                <span className={parseFloat(expensesChange.toString()) > 0 ? "text-orange-500" : "text-green-500"}>
                  {expensesChange}%
                </span>
                <span className="text-muted-foreground">vs last month</span>
              </div>
            </div>
            
            <div className="text-center p-4 rounded-lg border">
              <p className="text-sm font-medium text-muted-foreground">Net Profit</p>
              <p className="text-2xl font-bold text-foreground">${currentMonth.profit.toLocaleString()}</p>
              <div className="flex items-center justify-center gap-1 text-sm">
                {parseFloat(profitChange.toString()) > 0 ? (
                  <ArrowUpRight className="w-4 h-4 text-green-500" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 text-red-500" />
                )}
                <span className={parseFloat(profitChange.toString()) > 0 ? "text-green-500" : "text-red-500"}>
                  {profitChange}%
                </span>
                <span className="text-muted-foreground">vs last month</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
