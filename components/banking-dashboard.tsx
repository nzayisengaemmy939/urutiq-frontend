"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CreditCard, 
  Building2, 
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  PieChart,
  Activity
} from "lucide-react"
import { bankingApi, BankAccount, BankTransaction } from '@/lib/api/banking'

interface BankingDashboardProps {
  companyId?: string
}

interface DashboardData {
  totalBalance: number
  totalTransactions: number
  reconciledTransactions: number
  pendingTransactions: number
  uncategorizedTransactions: number
  monthlyInflow: number
  monthlyOutflow: number
  netCashFlow: number
  accountBreakdown: Array<{
    account: BankAccount
    balance: number
    transactionCount: number
    lastActivity: string
  }>
  recentTransactions: BankTransaction[]
  categoryBreakdown: Record<string, number>
  cashFlowTrend: Array<{
    date: string
    inflow: number
    outflow: number
    net: number
  }>
}

export function BankingDashboard({ companyId }: BankingDashboardProps) {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('30')
  const [selectedAccount, setSelectedAccount] = useState<string>('all')

  useEffect(() => {
    loadDashboardData()
  }, [selectedPeriod, selectedAccount])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      const currentCompanyId = companyId || localStorage.getItem('company_id') || localStorage.getItem('companyId') || 'seed-company-1'
      
      // Load bank accounts
      const accountsResponse = await bankingApi.getBankAccounts(currentCompanyId)
      
      // Load transactions
      const transactionsResponse = await bankingApi.getBankTransactions(undefined, currentCompanyId, undefined, 1, 100)
      
      // Calculate dashboard metrics
      const totalBalance = accountsResponse.reduce((sum, account) => sum + Number(account.balance || 0), 0)
      const totalTransactions = transactionsResponse.items.length
      const reconciledTransactions = transactionsResponse.items.filter(t => t.status === 'reconciled').length
      const pendingTransactions = transactionsResponse.items.filter(t => t.status === 'pending').length
      const uncategorizedTransactions = transactionsResponse.items.filter(t => !t.category || t.category === 'Uncategorized').length
      
      // Calculate monthly cash flow
      const now = new Date()
      const thirtyDaysAgo = new Date(now.getTime() - (parseInt(selectedPeriod) * 24 * 60 * 60 * 1000))
      
      const recentTransactions = transactionsResponse.items.filter(t => 
        new Date(t.transactionDate) >= thirtyDaysAgo
      )
      
      const monthlyInflow = recentTransactions
        .filter(t => Number(t.amount) > 0)
        .reduce((sum, t) => sum + Number(t.amount), 0)
      
      const monthlyOutflow = Math.abs(recentTransactions
        .filter(t => Number(t.amount) < 0)
        .reduce((sum, t) => sum + Number(t.amount), 0))
      
      const netCashFlow = monthlyInflow - monthlyOutflow
      
      // Account breakdown
      const accountBreakdown = accountsResponse.map(account => {
        const accountTransactions = transactionsResponse.items.filter(t => t.bankAccountId === account.id)
        const lastTransaction = accountTransactions.sort((a, b) => 
          new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime()
        )[0]
        
        return {
          account,
          balance: Number(account.balance || 0),
          transactionCount: accountTransactions.length,
          lastActivity: lastTransaction ? lastTransaction.transactionDate : account.createdAt || ''
        }
      })
      
      // Category breakdown
      const categoryBreakdown = recentTransactions.reduce((acc, t) => {
        const category = t.category || 'Uncategorized'
        acc[category] = (acc[category] || 0) + Math.abs(Number(t.amount))
        return acc
      }, {} as Record<string, number>)
      
      // Cash flow trend (last 7 days)
      const cashFlowTrend = []
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000))
        const dayStart = new Date(date.setHours(0, 0, 0, 0))
        const dayEnd = new Date(date.setHours(23, 59, 59, 999))
        
        const dayTransactions = recentTransactions.filter(t => {
          const transactionDate = new Date(t.transactionDate)
          return transactionDate >= dayStart && transactionDate <= dayEnd
        })
        
        const inflow = dayTransactions
          .filter(t => Number(t.amount) > 0)
          .reduce((sum, t) => sum + Number(t.amount), 0)
        
        const outflow = Math.abs(dayTransactions
          .filter(t => Number(t.amount) < 0)
          .reduce((sum, t) => sum + Number(t.amount), 0))
        
        cashFlowTrend.push({
          date: dayStart.toISOString().split('T')[0],
          inflow,
          outflow,
          net: inflow - outflow
        })
      }
      
      setDashboardData({
        totalBalance,
        totalTransactions,
        reconciledTransactions,
        pendingTransactions,
        uncategorizedTransactions,
        monthlyInflow,
        monthlyOutflow,
        netCashFlow,
        accountBreakdown,
        recentTransactions: recentTransactions.slice(0, 10),
        categoryBreakdown,
        cashFlowTrend
      })
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const getCashFlowColor = (amount: number) => {
    if (amount > 0) return 'text-green-600'
    if (amount < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  const getCashFlowIcon = (amount: number) => {
    if (amount > 0) return <TrendingUp className="w-4 h-4 text-green-600" />
    if (amount < 0) return <TrendingDown className="w-4 h-4 text-red-600" />
    return <Activity className="w-4 h-4 text-gray-600" />
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return <div>Error loading dashboard data</div>
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Banking Dashboard</h2>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedAccount} onValueChange={setSelectedAccount}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Accounts</SelectItem>
              {dashboardData.accountBreakdown.map((item) => (
                <SelectItem key={item.account.id} value={item.account.id}>
                  {item.account.bankName} - {item.account.accountNumber}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium">Total Balance</span>
            </div>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(dashboardData.totalBalance)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              {getCashFlowIcon(dashboardData.netCashFlow)}
              <span className="text-sm font-medium">Net Cash Flow</span>
            </div>
            <div className={`text-2xl font-bold ${getCashFlowColor(dashboardData.netCashFlow)}`}>
              {formatCurrency(dashboardData.netCashFlow)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Last {selectedPeriod} days
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium">Total Transactions</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {dashboardData.totalTransactions}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {dashboardData.reconciledTransactions} reconciled
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <span className="text-sm font-medium">Pending Items</span>
            </div>
            <div className="text-2xl font-bold text-orange-600">
              {dashboardData.pendingTransactions + dashboardData.uncategorizedTransactions}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {dashboardData.pendingTransactions} pending, {dashboardData.uncategorizedTransactions} uncategorized
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Account Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-purple-600" />
            Account Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dashboardData.accountBreakdown.map((item) => (
              <div key={item.account.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-medium">{item.account.bankName}</div>
                    <div className="text-sm text-muted-foreground">
                      {item.account.accountNumber} • {item.account.accountType}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="font-medium">{formatCurrency(item.balance)}</div>
                  <div className="text-sm text-muted-foreground">
                    {item.transactionCount} transactions
                  </div>
                </div>
                
                <div className="text-right">
                  <Badge variant="secondary">
                    {item.account.status}
                  </Badge>
                  <div className="text-xs text-muted-foreground mt-1">
                    Last activity: {new Date(item.lastActivity).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cash Flow Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Cash Flow Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Money In</span>
                <span className="text-green-600 font-bold">
                  {formatCurrency(dashboardData.monthlyInflow)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Money Out</span>
                <span className="text-red-600 font-bold">
                  {formatCurrency(dashboardData.monthlyOutflow)}
                </span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Net Cash Flow</span>
                  <span className={`font-bold ${getCashFlowColor(dashboardData.netCashFlow)}`}>
                    {formatCurrency(dashboardData.netCashFlow)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-blue-600" />
              Category Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(dashboardData.categoryBreakdown)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .map(([category, amount]) => (
                  <div key={category} className="flex justify-between items-center">
                    <span className="text-sm">{category}</span>
                    <span className="font-medium">{formatCurrency(amount)}</span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-600" />
            Recent Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {dashboardData.recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    Number(transaction.amount) > 0 ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {Number(transaction.amount) > 0 ? (
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-600" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium">{transaction.description || 'Transaction'}</div>
                    <div className="text-sm text-muted-foreground">
                      {transaction.merchantName && `${transaction.merchantName} • `}
                      {new Date(transaction.transactionDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`font-medium ${
                    Number(transaction.amount) > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {Number(transaction.amount) > 0 ? '+' : ''}{formatCurrency(Number(transaction.amount))}
                  </div>
                  <div className="flex items-center gap-2">
                    {transaction.category && (
                      <Badge variant="outline" className="text-xs">
                        {transaction.category}
                      </Badge>
                    )}
                    <Badge 
                      variant={transaction.status === 'reconciled' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {transaction.status}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
