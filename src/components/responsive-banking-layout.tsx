import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { 
  Smartphone, 
  Monitor, 
  Tablet,
  Wifi,
  Settings,
  Menu,
  X,
  Search,
  Bell,
  User,
  Building2
} from "lucide-react"
import { BankingDashboard } from './banking-dashboard'
import { AICategorization } from './ai-categorization'
import { MultiCurrencyConverter } from './multi-currency-converter'
import { CurrencyDashboard } from './currency-dashboard'
import { PaymentProcessorManager } from './payment-processor-manager'
import { AdvancedAnalytics } from './advanced-analytics'
import { BankConnectionManager } from './bank-connection-manager'
import { MobileMoneyManager } from './mobile-money-manager'
import { bankingApi, BankAccount, BankTransaction } from '@/lib/api/banking'
import { useAuth } from '@/contexts/auth-context'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from './ui/dialog'
import { Plus } from 'lucide-react'

interface ResponsiveBankingLayoutProps {
  companyId?: string
  accountsRefreshKey?: number
  setAccountsRefreshKey?: (fn: (k: number) => number) => void
  isAddTransactionOpen?: boolean
  setIsAddTransactionOpen?: (open: boolean) => void
  transactionForm?: any
  setTransactionForm?: (fn: (prev: any) => any) => void
  transactionFormErrors?: Record<string, string>
  setTransactionFormErrors?: (errors: Record<string, string>) => void
  handleTransactionFormChange?: (field: string, value: string) => void
  handleCreateTransaction?: () => void
}

export function ResponsiveBankingLayout({ 
  companyId,
  accountsRefreshKey,
  setAccountsRefreshKey,
  isAddTransactionOpen,
  setIsAddTransactionOpen,
  transactionForm,
  setTransactionForm,
  transactionFormErrors,
  setTransactionFormErrors,
  handleTransactionFormChange,
  handleCreateTransaction
}: ResponsiveBankingLayoutProps) {
  console.log('ResponsiveBankingLayout received companyId:', companyId)
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('desktop')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [batteryLevel, setBatteryLevel] = useState(85)
  const [signalStrength, setSignalStrength] = useState(4)
  const [manualViewOverride, setManualViewOverride] = useState<'mobile' | 'tablet' | 'desktop' | null>(null)

  // Debug authentication state changes
  useEffect(() => {
    console.log('🔐 Auth state changed:', { 
      isAuthenticated, 
      authLoading, 
      companyId,
      timestamp: new Date().toISOString()
    })
  }, [isAuthenticated, authLoading, companyId])

  useEffect(() => {
    const checkDeviceType = () => {
      if (manualViewOverride) {
        setDeviceType(manualViewOverride)
        return
      }
      
      const width = window.innerWidth
      if (width < 768) {
        setDeviceType('mobile')
      } else if (width < 1024) {
        setDeviceType('tablet')
      } else {
        setDeviceType('desktop')
      }
    }

    checkDeviceType()
    window.addEventListener('resize', checkDeviceType)

    return () => {
      window.removeEventListener('resize', checkDeviceType)
    }
  }, [manualViewOverride])


  const getSignalIcon = () => {
    const bars = Math.floor(signalStrength)
    return (
      <div className="flex items-center gap-1">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className={`w-1 h-${i < bars ? '3' : '1'} bg-green-500 rounded-sm`}
          />
        ))}
      </div>
    )
  }

  const getBatteryIcon = () => {
    return (
      <div className="flex items-center gap-1">
        <div className="w-6 h-3 border border-gray-400 rounded-sm relative">
          <div
            className="bg-green-500 h-full rounded-sm"
            style={{ width: `${batteryLevel}%` }}
          />
        </div>
        <div className="w-1 h-2 bg-gray-400 rounded-r-sm"></div>
      </div>
    )
  }

  const mobileTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'transactions', label: 'Transactions', icon: '💳' },
    { id: 'ai', label: 'AI', icon: '🤖' },
    { id: 'currency', label: 'Currency', icon: '💱' },
    { id: 'payments', label: 'Payments', icon: '💸' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'connections', label: 'Banks', icon: '🏦' },
    { id: 'mobile-money', label: 'Mobile Money', icon: '📱' }
  ]

  const renderMobileInterface = () => (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Status Bar */}
      <div className="bg-black text-white text-xs px-4 py-1 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="font-medium">9:41</span>
        </div>
        <div className="flex items-center gap-2">
          {getSignalIcon()}
          <Wifi className="w-3 h-3" />
          {getBatteryIcon()}
        </div>
      </div>

      {/* Mobile Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
          <h1 className="text-lg font-semibold">Banking</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setManualViewOverride(manualViewOverride === 'desktop' ? null : 'desktop')}
            title="Switch to Desktop View"
          >
            <Monitor className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Search className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Bell className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <User className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="grid grid-cols-2 gap-3">
            {mobileTabs.map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'default' : 'outline'}
                className="flex items-center gap-2 justify-start"
                onClick={() => {
                  setActiveTab(tab.id)
                  setIsMobileMenuOpen(false)
                }}
              >
                <span className="text-lg">{tab.icon}</span>
                <span className="text-sm">{tab.label}</span>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Mobile Content */}
      <div className="pb-20">
        {activeTab === 'dashboard' && (
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Bank Accounts</h2>
              <Button 
                onClick={() => setAccountsRefreshKey && setAccountsRefreshKey((k) => k + 1)}
                variant="outline"
                size="sm"
              >
                Refresh
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <AccountCards />
            </div>
          </div>
        )}
        {activeTab === 'transactions' && (
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Recent Transactions</h2>
              <div className="flex gap-2">
                <Button 
                  onClick={() => setIsAddTransactionOpen && setIsAddTransactionOpen(true)}
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Transaction
                </Button>
                <Button 
                  onClick={() => setAccountsRefreshKey && setAccountsRefreshKey((k) => k + 1)}
                  variant="outline"
                  size="sm"
                >
                  Refresh
                </Button>
              </div>
            </div>
            <TransactionsList />
          </div>
        )}
        {activeTab === 'ai' && (
          <div className="p-4">
            <AICategorization companyId={companyId} />
          </div>
        )}
        {activeTab === 'currency' && (
          <div className="p-4">
            <MultiCurrencyConverter />
          </div>
        )}
        {activeTab === 'payments' && (
          <div className="p-4">
            <PaymentProcessorManager companyId={companyId} />
          </div>
        )}
        {activeTab === 'analytics' && (
          <div className="p-4">
            <AdvancedAnalytics />
          </div>
        )}
        {activeTab === 'connections' && (
          <div className="p-4">
            <BankConnectionManager companyId={companyId} />
          </div>
        )}
        {activeTab === 'mobile-money' && (
          <div className="p-4">
            <MobileMoneyManager companyId={companyId} />
          </div>
        )}
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="flex items-center justify-around py-2">
          {mobileTabs.slice(0, 5).map((tab) => (
            <Button
              key={tab.id}
              variant="ghost"
              size="sm"
              className={`flex flex-col items-center gap-1 ${
                activeTab === tab.id ? 'text-blue-600' : 'text-gray-600'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="text-lg">{tab.icon}</span>
              <span className="text-xs">{tab.label}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  )

  // Banking Components - Memoized to prevent recreation
  const AccountCards = useMemo(() => {
    const Component = () => {
      const [accounts, setAccounts] = useState<BankAccount[] | null>(null)
      const [loading, setLoading] = useState(true)
      const [error, setError] = useState<string | null>(null)

      const fetchAccounts = async () => {
        console.log('🔄 fetchAccounts called', { 
          isAuthenticated, 
          authLoading, 
          companyId,
          timestamp: new Date().toISOString()
        })
        
        if (!isAuthenticated || authLoading || !companyId) {
          console.log('❌ fetchAccounts blocked:', { 
            hasCompanyId: !!companyId, 
            isAuthenticated, 
            authLoading 
          })
          return
        }
        
        let isMounted = true
        setLoading(true)
        
        try {
          console.log('📡 Fetching accounts...')
          const rows = await bankingApi.getBankAccounts(companyId)
          if (!isMounted) return
          console.log('✅ Accounts fetched:', rows.length)
          setAccounts(rows)
          setError(null)
        } catch (err: any) {
          if (!isMounted) return
          const errorMessage = err.message || String(err)
          console.error('❌ Error fetching accounts:', errorMessage)
          setError(errorMessage)
        } finally {
          if (isMounted) setLoading(false)
        }
      }

      useEffect(() => {
        fetchAccounts()
      }, [accountsRefreshKey, companyId, isAuthenticated, authLoading])

    if (loading) return (
      <>
        <Card><CardContent className="p-4">Loading accounts...</CardContent></Card>
        <Card><CardContent className="p-4">&nbsp;</CardContent></Card>
        <Card><CardContent className="p-4">&nbsp;</CardContent></Card>
      </>
    )

    if (error) return <Card><CardContent className="p-4">Error: {error?.message || error?.toString() || 'Unknown error'}</CardContent></Card>

    if (!accounts || accounts.length === 0) return (
      <Card><CardContent className="p-4">No connected accounts</CardContent></Card>
    )

    return (
      <>
        {accounts.map((account) => (
          <Card key={account.id}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{account.bankName}</p>
                  <p className="text-xl font-bold">{typeof account.balance === 'number' ? `$${account.balance.toFixed(2)}` : account.balance ?? '—'}</p>
                  <p className="text-xs text-muted-foreground">{account.accountNumber}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </>
    )
    }
    return Component
  }, [companyId, isAuthenticated, authLoading, accountsRefreshKey])

  const TransactionsList = useMemo(() => {
    const Component = () => {
    const [txns, setTxns] = useState<BankTransaction[] | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    
    // Pagination state - using constants since they don't change
    const currentPage = 1
    const pageSize = 10

    const fetchTransactions = async () => {
      console.log('🔄 fetchTransactions called', { 
        isAuthenticated, 
        authLoading, 
        companyId,
        timestamp: new Date().toISOString()
      })
      
      if (!companyId || !isAuthenticated || authLoading) {
        console.log('❌ fetchTransactions blocked:', { 
          hasCompanyId: !!companyId, 
          isAuthenticated, 
          authLoading 
        })
        return
      }
      
      let isMounted = true
      setLoading(true)
      
      try {
        console.log('📡 Fetching transactions...')
        const response = await bankingApi.getBankTransactions(undefined, companyId, undefined, currentPage, pageSize)
        
        if (!isMounted) return
        
        if (response && response.items) {
          console.log('✅ Transactions fetched:', response.items.length)
          setTxns(response.items)
        } else {
          console.log('✅ No transactions found')
          setTxns([])
        }
        setError(null)
      } catch (err: any) {
        if (!isMounted) return
        const errorMessage = err.message || String(err)
        console.error('❌ Error fetching transactions:', errorMessage)
        setError(errorMessage)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    useEffect(() => {
      fetchTransactions()
    }, [companyId, isAuthenticated, authLoading])

    if (loading) return <div className="space-y-4">Loading transactions...</div>
    if (error) return <div className="space-y-4">Error loading transactions: {error?.message || error?.toString() || 'Unknown error'}</div>
    if (!txns || txns.length === 0) {
      return (
        <div className="space-y-4">
          <p>No transactions found</p>
          <div className="flex gap-2 mt-2">
            <Button onClick={() => fetchTransactions()}>Retry</Button>
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {txns.map((transaction) => (
          <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${transaction.transactionType === 'credit' ? 'bg-green-100' : 'bg-red-100'}`}>
                {transaction.transactionType === 'credit' ? <span className="text-green-600 font-semibold">↑</span> : <span className="text-red-600 font-semibold">↓</span>}
              </div>
              <div>
                <p className="font-medium">{transaction.description || 'Bank transaction'}</p>
                <p className="text-sm text-muted-foreground">{new Date(transaction.transactionDate).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className={`font-medium ${Number(transaction.amount) >= 0 ? 'text-green-600' : 'text-red-600'}`}>${Number(transaction.amount).toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">{transaction.status || 'unreconciled'}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
    }
    return Component
  }, [companyId, isAuthenticated, authLoading])

  const renderTabletInterface = () => (
    <div className="min-h-screen bg-gray-50">
      {/* Tablet Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Tablet className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-semibold">Banking Dashboard</h1>
            <Badge variant="secondary">Tablet View</Badge>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Button 
                variant={deviceType === 'mobile' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setManualViewOverride(manualViewOverride === 'mobile' ? null : 'mobile')}
              >
                <Smartphone className="w-3 h-3" />
              </Button>
              <Button 
                variant={deviceType === 'tablet' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setManualViewOverride(manualViewOverride === 'tablet' ? null : 'tablet')}
              >
                <Tablet className="w-3 h-3" />
              </Button>
              <Button 
                variant={deviceType === 'desktop' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setManualViewOverride(manualViewOverride === 'desktop' ? null : 'desktop')}
              >
                <Monitor className="w-3 h-3" />
              </Button>
            </div>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button variant="outline" size="sm">
              <User className="w-4 h-4 mr-2" />
              Profile
            </Button>
          </div>
        </div>
      </div>

      {/* Tablet Content */}
      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="ai">AI Features</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="connections">Connections</TabsTrigger>
            <TabsTrigger value="mobile-money">Mobile Money</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <BankingDashboard companyId={companyId} />
          </TabsContent>

          <TabsContent value="ai" className="space-y-6">
            <AICategorization companyId={companyId} />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <AdvancedAnalytics />
          </TabsContent>

          <TabsContent value="connections" className="space-y-6">
            <BankConnectionManager companyId={companyId} />
          </TabsContent>

          <TabsContent value="mobile-money" className="space-y-6">
            <MobileMoneyManager companyId={companyId} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )

  const renderDesktopInterface = () => (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Monitor className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-semibold">Banking Management</h1>
            <Badge variant="secondary">Desktop View</Badge>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button 
                variant={deviceType === 'mobile' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setManualViewOverride(manualViewOverride === 'mobile' ? null : 'mobile')}
              >
                <Smartphone className="w-4 h-4 mr-1" />
                Mobile
              </Button>
              <Button 
                variant={deviceType === 'tablet' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setManualViewOverride(manualViewOverride === 'tablet' ? null : 'tablet')}
              >
                <Tablet className="w-4 h-4 mr-1" />
                Tablet
              </Button>
              <Button 
                variant={deviceType === 'desktop' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setManualViewOverride(manualViewOverride === 'desktop' ? null : 'desktop')}
              >
                <Monitor className="w-4 h-4 mr-1" />
                Desktop
              </Button>
            </div>
            <Button variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button variant="outline">
              <User className="w-4 h-4 mr-2" />
              Profile
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop Content */}
      <div className="p-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex w-full mb-8 overflow-x-auto gap-1">
            <TabsTrigger value="dashboard" className="whitespace-nowrap">Dashboard</TabsTrigger>
            <TabsTrigger value="transactions" className="whitespace-nowrap">Transactions</TabsTrigger>
            <TabsTrigger value="ai" className="whitespace-nowrap">AI Categorization</TabsTrigger>
            <TabsTrigger value="currency" className="whitespace-nowrap">Multi-Currency</TabsTrigger>
            <TabsTrigger value="payments" className="whitespace-nowrap">Payment Processors</TabsTrigger>
            <TabsTrigger value="analytics" className="whitespace-nowrap">Advanced Analytics</TabsTrigger>
            <TabsTrigger value="connections" className="whitespace-nowrap">Bank Connections</TabsTrigger>
            <TabsTrigger value="mobile-money" className="whitespace-nowrap">Mobile Money</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Bank Accounts</h2>
                <Button 
                  onClick={() => setAccountsRefreshKey && setAccountsRefreshKey((k) => k + 1)}
                  variant="outline"
                >
                  Refresh
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <AccountCards />
              </div>
              <BankingDashboard companyId={companyId} />
            </div>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Recent Transactions</h2>
              <div className="flex gap-2">
                <Button 
                  onClick={() => setIsAddTransactionOpen && setIsAddTransactionOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Transaction
                </Button>
                <Button 
                  onClick={() => setAccountsRefreshKey && setAccountsRefreshKey((k) => k + 1)}
                  variant="outline"
                >
                  Refresh
                </Button>
              </div>
            </div>
            <TransactionsList />
          </TabsContent>

          <TabsContent value="ai" className="space-y-6">
            <AICategorization companyId={companyId} />
          </TabsContent>

          <TabsContent value="currency" className="space-y-6">
            <CurrencyDashboard />
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <PaymentProcessorManager companyId={companyId} />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <AdvancedAnalytics />
          </TabsContent>

          <TabsContent value="connections" className="space-y-6">
            <BankConnectionManager companyId={companyId} />
          </TabsContent>

          <TabsContent value="mobile-money" className="space-y-6">
            <MobileMoneyManager companyId={companyId} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )

  // BankAccountSelect component for transaction dialog
  // BankAccountSelect component - moved outside useMemo to avoid hook issues
  const BankAccountSelect = () => {
    const [accounts, setAccounts] = useState<BankAccount[]>([])
    const [loading, setLoading] = useState(true)

    const fetchAccounts = async () => {
      if (!isAuthenticated || authLoading || !companyId) return
      
      try {
        const response = await bankingApi.getBankAccounts(companyId)
        setAccounts(response)
      } catch (error) {
        console.error('Error fetching bank accounts:', error)
      } finally {
        setLoading(false)
      }
    }

    useEffect(() => {
      fetchAccounts()
    }, [companyId, isAuthenticated, authLoading])

    if (loading) {
      return <SelectItem value="loading" disabled>Loading accounts...</SelectItem>
    }

    if (accounts.length === 0) {
      return <SelectItem value="no-accounts" disabled>No bank accounts found</SelectItem>
    }

    return (
      <>
        {accounts.map((account) => (
          <SelectItem key={account.id} value={account.id}>
            {account.bankName} - {account.accountNumber} ({account.accountType})
          </SelectItem>
        ))}
      </>
    )
  }

  // Transaction Dialog Component
  const TransactionDialog = () => (
    <Dialog open={isAddTransactionOpen || false} onOpenChange={setIsAddTransactionOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Bank Transaction</DialogTitle>
          <DialogDescription>Create a new bank transaction manually.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="bankAccount">Bank Account</Label>
            <Select
              value={transactionForm?.bankAccountId || ''}
              onValueChange={(value) => handleTransactionFormChange?.('bankAccountId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select bank account..." />
              </SelectTrigger>
              <SelectContent>
                <BankAccountSelect />
              </SelectContent>
            </Select>
            {transactionFormErrors?.bankAccountId && (
              <p className="text-sm text-destructive mt-1">{transactionFormErrors.bankAccountId}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={transactionForm?.description || ''}
              onChange={(e) => handleTransactionFormChange?.('description', e.target.value)}
              placeholder="Transaction description"
            />
            {transactionFormErrors?.description && (
              <p className="text-sm text-destructive mt-1">{transactionFormErrors.description}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={transactionForm?.amount || ''}
              onChange={(e) => handleTransactionFormChange?.('amount', e.target.value)}
              placeholder="0.00"
            />
            {transactionFormErrors?.amount && (
              <p className="text-sm text-destructive mt-1">{transactionFormErrors.amount}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="transactionType">Type</Label>
            <Select
              value={transactionForm?.transactionType || 'debit'}
              onValueChange={(value) => handleTransactionFormChange?.('transactionType', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="credit">Credit (Money In)</SelectItem>
                <SelectItem value="debit">Debit (Money Out)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="transactionDate">Date</Label>
            <Input
              id="transactionDate"
              type="date"
              value={transactionForm?.transactionDate || ''}
              onChange={(e) => handleTransactionFormChange?.('transactionDate', e.target.value)}
            />
            {transactionFormErrors?.transactionDate && (
              <p className="text-sm text-destructive mt-1">{transactionFormErrors.transactionDate}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="merchantName">Merchant (Optional)</Label>
            <Input
              id="merchantName"
              value={transactionForm?.merchantName || ''}
              onChange={(e) => handleTransactionFormChange?.('merchantName', e.target.value)}
              placeholder="Merchant name"
            />
          </div>
          
          <div>
            <Label htmlFor="category">Category (Optional)</Label>
            <Input
              id="category"
              value={transactionForm?.category || ''}
              onChange={(e) => handleTransactionFormChange?.('category', e.target.value)}
              placeholder="Transaction category"
            />
          </div>
          
          <div>
            <Label htmlFor="reference">Reference (Optional)</Label>
            <Input
              id="reference"
              value={transactionForm?.reference || ''}
              onChange={(e) => handleTransactionFormChange?.('reference', e.target.value)}
              placeholder="Reference number"
            />
          </div>
          
          <div>
            <Label htmlFor="memo">Memo (Optional)</Label>
            <Input
              id="memo"
              value={transactionForm?.memo || ''}
              onChange={(e) => handleTransactionFormChange?.('memo', e.target.value)}
              placeholder="Additional notes"
            />
          </div>
          
          {transactionFormErrors?.submit && (
            <p className="text-sm text-destructive">{transactionFormErrors.submit}</p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsAddTransactionOpen?.(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreateTransaction}>
            Create Transaction
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  // Device-specific rendering
  switch (deviceType) {
    case 'mobile':
      return (
        <>
          {renderMobileInterface()}
          <TransactionDialog />
        </>
      )
    case 'tablet':
      return (
        <>
          {renderTabletInterface()}
          <TransactionDialog />
        </>
      )
    case 'desktop':
      return (
        <>
          {renderDesktopInterface()}
          <TransactionDialog />
        </>
      )
    default:
      return (
        <>
          {renderDesktopInterface()}
          <TransactionDialog />
        </>
      )
  }
}
