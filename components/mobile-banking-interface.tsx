"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  Smartphone, 
  CreditCard, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  BarChart3,
  PieChart,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Plus,
  Search,
  Filter,
  Download,
  Share,
  Eye,
  EyeOff,
  QrCode,
  Fingerprint,
  Touch,
  Wifi,
  Signal
} from "lucide-react"
import { bankingApiV2 as bankingApi } from '@/lib/api/banking-v2'

interface MobileBankingStats {
  totalBalance: number
  monthlyInflow: number
  monthlyOutflow: number
  netCashFlow: number
  activeAccounts: number
  pendingTransactions: number
  lastSyncAt: string
}

interface QuickAction {
  id: string
  title: string
  icon: React.ReactNode
  color: string
  action: () => void
}

interface RecentTransaction {
  id: string
  amount: number
  description: string
  date: string
  type: 'credit' | 'debit'
  category?: string
  status: 'completed' | 'pending' | 'failed'
}

export function MobileBankingInterface() {
  const [stats, setStats] = useState<MobileBankingStats | null>(null)
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [balanceVisible, setBalanceVisible] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Detect mobile device
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    loadMobileData()
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const loadMobileData = async () => {
    setLoading(true)
    try {
      // Load dashboard stats
      const dashboardResponse = await bankingApi.get('/bank-transactions?limit=50')
      const transactions = dashboardResponse.items || []
      
      // Calculate mobile stats
      const totalBalance = transactions.reduce((sum: number, t: any) => sum + Number(t.amount), 0)
      const monthlyInflow = transactions
        .filter((t: any) => Number(t.amount) > 0)
        .reduce((sum: number, t: any) => sum + Number(t.amount), 0)
      const monthlyOutflow = Math.abs(transactions
        .filter((t: any) => Number(t.amount) < 0)
        .reduce((sum: number, t: any) => sum + Number(t.amount), 0))
      
      setStats({
        totalBalance,
        monthlyInflow,
        monthlyOutflow,
        netCashFlow: monthlyInflow - monthlyOutflow,
        activeAccounts: 3, // Mock data
        pendingTransactions: transactions.filter((t: any) => t.status === 'pending').length,
        lastSyncAt: new Date().toISOString()
      })

      // Load recent transactions
      setRecentTransactions(transactions.slice(0, 10).map((t: any) => ({
        id: t.id,
        amount: Number(t.amount),
        description: t.description || 'Transaction',
        date: t.transactionDate,
        type: Number(t.amount) > 0 ? 'credit' : 'debit',
        category: t.category,
        status: t.status === 'reconciled' ? 'completed' : 'pending'
      })))
    } catch (error) {
      console.error('Error loading mobile banking data:', error)
    } finally {
      setLoading(false)
    }
  }

  const quickActions: QuickAction[] = [
    {
      id: 'transfer',
      title: 'Transfer',
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'bg-blue-500',
      action: () => console.log('Transfer money')
    },
    {
      id: 'pay',
      title: 'Pay Bills',
      icon: <CreditCard className="w-6 h-6" />,
      color: 'bg-green-500',
      action: () => console.log('Pay bills')
    },
    {
      id: 'deposit',
      title: 'Deposit',
      icon: <Plus className="w-6 h-6" />,
      color: 'bg-purple-500',
      action: () => console.log('Make deposit')
    },
    {
      id: 'scan',
      title: 'Scan QR',
      icon: <QrCode className="w-6 h-6" />,
      color: 'bg-orange-500',
      action: () => console.log('Scan QR code')
    }
  ]

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const getTransactionIcon = (type: string, category?: string) => {
    if (type === 'credit') {
      return <TrendingUp className="w-5 h-5 text-green-600" />
    } else {
      switch (category?.toLowerCase()) {
        case 'food': return <DollarSign className="w-5 h-5 text-red-600" />
        case 'transport': return <TrendingDown className="w-5 h-5 text-blue-600" />
        case 'shopping': return <CreditCard className="w-5 h-5 text-purple-600" />
        default: return <TrendingDown className="w-5 h-5 text-red-600" />
      }
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100'
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      case 'failed': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 p-4">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="h-20 bg-gray-200 rounded-lg"></div>
            <div className="h-20 bg-gray-200 rounded-lg"></div>
          </div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 p-4 max-w-md mx-auto">
      {/* Mobile Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Smartphone className="w-6 h-6 text-blue-600" />
          <h1 className="text-xl font-bold">Banking</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => setBalanceVisible(!balanceVisible)}>
            {balanceVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </Button>
          <Button size="sm" variant="outline" onClick={loadMobileData}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Balance Card */}
      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-blue-100 text-sm">Total Balance</p>
              <p className="text-3xl font-bold">
                {balanceVisible ? formatCurrency(stats?.totalBalance || 0) : '••••••'}
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-blue-100 text-sm">
                <Wifi className="w-4 h-4" />
                <span>Live</span>
              </div>
              <p className="text-xs text-blue-200">
                Last sync: {new Date(stats?.lastSyncAt || '').toLocaleTimeString()}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="text-center">
              <p className="text-blue-100 text-xs">Money In</p>
              <p className="text-lg font-semibold">
                {balanceVisible ? formatCurrency(stats?.monthlyInflow || 0) : '••••'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-blue-100 text-xs">Money Out</p>
              <p className="text-lg font-semibold">
                {balanceVisible ? formatCurrency(stats?.monthlyOutflow || 0) : '••••'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-3">
        {quickActions.map((action) => (
          <Button
            key={action.id}
            variant="outline"
            className="flex flex-col items-center gap-2 h-20 p-2"
            onClick={action.action}
          >
            <div className={`w-8 h-8 rounded-full ${action.color} flex items-center justify-center text-white`}>
              {action.icon}
            </div>
            <span className="text-xs font-medium">{action.title}</span>
          </Button>
        ))}
      </div>

      {/* Mobile Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Account Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Account Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">Business Checking</p>
                    <p className="text-sm text-muted-foreground">****1234</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    {balanceVisible ? formatCurrency(15420.50) : '••••••'}
                  </p>
                  <Badge variant="secondary" className="text-xs">Active</Badge>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">Business Savings</p>
                    <p className="text-sm text-muted-foreground">****5678</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    {balanceVisible ? formatCurrency(8750.25) : '••••••'}
                  </p>
                  <Badge variant="secondary" className="text-xs">Active</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Recent Activity</CardTitle>
                <Button size="sm" variant="outline">
                  <Calendar className="w-4 h-4 mr-1" />
                  Filter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentTransactions.slice(0, 5).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getTransactionIcon(transaction.type, transaction.category)}
                      <div>
                        <p className="font-medium text-sm">{transaction.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(transaction.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold text-sm ${
                        transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'credit' ? '+' : ''}{formatCurrency(transaction.amount)}
                      </p>
                      <Badge className={`text-xs ${getStatusColor(transaction.status)}`}>
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          {/* Transaction Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  className="flex-1 bg-transparent outline-none text-sm"
                />
                <Button size="sm" variant="outline">
                  <Filter className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Transaction List */}
          <div className="space-y-3">
            {recentTransactions.map((transaction) => (
              <Card key={transaction.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getTransactionIcon(transaction.type, transaction.category)}
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-muted-foreground">
                            {new Date(transaction.date).toLocaleDateString()}
                          </p>
                          {transaction.category && (
                            <Badge variant="outline" className="text-xs">
                              {transaction.category}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'credit' ? '+' : ''}{formatCurrency(transaction.amount)}
                      </p>
                      <Badge className={`text-xs ${getStatusColor(transaction.status)}`}>
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          {/* Spending Insights */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Spending Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <TrendingDown className="w-4 h-4 text-red-600" />
                    </div>
                    <div>
                      <p className="font-medium">Food & Dining</p>
                      <p className="text-sm text-muted-foreground">This month</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-red-600">$450.00</p>
                    <p className="text-xs text-muted-foreground">+12% vs last month</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <CreditCard className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Shopping</p>
                      <p className="text-sm text-muted-foreground">This month</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-blue-600">$320.00</p>
                    <p className="text-xs text-muted-foreground">-5% vs last month</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Income</p>
                      <p className="text-sm text-muted-foreground">This month</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">$5,200.00</p>
                    <p className="text-xs text-muted-foreground">+8% vs last month</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Budget Progress */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Budget Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Food & Dining</span>
                    <span>$450 / $600</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-red-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Shopping</span>
                    <span>$320 / $500</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '64%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Transportation</span>
                    <span>$180 / $300</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 max-w-md mx-auto">
        <div className="flex items-center justify-around">
          <Button variant="ghost" size="sm" className="flex flex-col items-center gap-1">
            <BarChart3 className="w-5 h-5" />
            <span className="text-xs">Overview</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex flex-col items-center gap-1">
            <CreditCard className="w-5 h-5" />
            <span className="text-xs">Cards</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex flex-col items-center gap-1">
            <TrendingUp className="w-5 h-5" />
            <span className="text-xs">Transfer</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex flex-col items-center gap-1">
            <PieChart className="w-5 h-5" />
            <span className="text-xs">Insights</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
