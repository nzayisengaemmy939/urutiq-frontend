"use client"

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Smartphone, 
  Plus, 
  Send, 
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Globe,
  MapPin,
  Phone,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Clock,
  RefreshCw,
  Eye,
  EyeOff,
  Filter,
  Download,
  Share
} from "lucide-react"
import { bankingApiV2 as bankingApi } from '@/lib/api/banking-v2'

interface MobileMoneyProvider {
  id: string
  name: string
  country: string
  currency: string
  logo?: string
  primaryColor?: string
  isActive: boolean
  supportedOperations: string[]
  fees: {
    deposit: number
    withdrawal: number
    transfer: number
    payment: number
  }
  limits: {
    daily: number
    monthly: number
    perTransaction: number
  }
}

interface MobileMoneyAccount {
  id: string
  provider: string
  accountNumber: string
  accountName: string
  phoneNumber: string
  balance: number
  currency: string
  status: 'active' | 'inactive' | 'suspended' | 'pending'
  isVerified: boolean
  createdAt: string
}

interface MobileMoneyTransaction {
  id: string
  provider: string
  transactionType: 'deposit' | 'withdrawal' | 'transfer' | 'payment' | 'reversal'
  amount: number
  currency: string
  reference: string
  phoneNumber: string
  recipientPhoneNumber?: string
  recipientName?: string
  description: string
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  fees: number
  netAmount: number
  createdAt: string
}

interface MobileMoneyStats {
  totalAccounts: number
  activeAccounts: number
  totalTransactions: number
  totalVolume: number
  totalFees: number
  providers: Array<{
    provider: string
    accounts: number
    transactions: number
    volume: number
  }>
}

export function MobileMoneyManager() {
  const [providers, setProviders] = useState<MobileMoneyProvider[]>([])
  const [accounts, setAccounts] = useState<MobileMoneyAccount[]>([])
  const [transactions, setTransactions] = useState<MobileMoneyTransaction[]>([])
  const [stats, setStats] = useState<MobileMoneyStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedCountry, setSelectedCountry] = useState<string>('all')
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false)
  const [isSendMoneyOpen, setIsSendMoneyOpen] = useState(false)
  const [balanceVisible, setBalanceVisible] = useState(true)

  // Form states
  const [accountForm, setAccountForm] = useState({
    provider: '',
    accountNumber: '',
    accountName: '',
    phoneNumber: '',
    currency: ''
  })

  const [paymentForm, setPaymentForm] = useState({
    provider: '',
    amount: '',
    currency: '',
    phoneNumber: '',
    recipientPhoneNumber: '',
    recipientName: '',
    description: ''
  })

  const countries = [
    'Kenya', 'Tanzania', 'Rwanda', 'Ghana', 'Nigeria', 'Uganda', 'Senegal', 
    'Côte d\'Ivoire', 'Togo', 'Benin', 'Cameroon', 'Zimbabwe', 'Zambia', 'Global'
  ]

  useEffect(() => {
    loadData()
  }, [selectedCountry])

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      // Load providers
      const providersResponse = await bankingApi.get(`/mobile-money/providers${selectedCountry && selectedCountry !== 'all' ? `?country=${selectedCountry}` : ''}`)
      setProviders(providersResponse.providers || [])

      // Load accounts
      const accountsResponse = await bankingApi.get('/mobile-money/accounts')
      setAccounts(accountsResponse.accounts || [])

      // Load transactions
      const transactionsResponse = await bankingApi.get('/mobile-money/transactions')
      setTransactions(transactionsResponse.transactions || [])

      // Load stats
      const statsResponse = await bankingApi.get('/mobile-money/stats')
      setStats(statsResponse)
    } catch (error) {
      console.error('Error loading mobile money data:', error)
    } finally {
      setLoading(false)
    }
  }, [selectedCountry])

  const createAccount = async () => {
    if (!accountForm.provider || !accountForm.accountNumber || !accountForm.accountName || !accountForm.phoneNumber) {
      alert('Please fill in all required fields')
      return
    }

    try {
      const response = await bankingApi.post('/mobile-money/accounts', accountForm)
      alert('Mobile money account created successfully!')
      setAccountForm({
        provider: '',
        accountNumber: '',
        accountName: '',
        phoneNumber: '',
        currency: ''
      })
      setIsAddAccountOpen(false)
      loadData()
    } catch (error) {
      console.error('Error creating account:', error)
      alert('Failed to create mobile money account')
    }
  }

  const sendMoney = async () => {
    if (!paymentForm.provider || !paymentForm.amount || !paymentForm.phoneNumber || !paymentForm.recipientPhoneNumber) {
      alert('Please fill in all required fields')
      return
    }

    try {
      const response = await bankingApi.post('/mobile-money/payments', paymentForm)
      if (response.success) {
        alert('Payment initiated successfully!')
        setPaymentForm({
          provider: '',
          amount: '',
          currency: '',
          phoneNumber: '',
          recipientPhoneNumber: '',
          recipientName: '',
          description: ''
        })
        setIsSendMoneyOpen(false)
        loadData()
      } else {
        alert(response.message || 'Failed to initiate payment')
      }
    } catch (error) {
      console.error('Error sending money:', error)
      alert('Failed to send money')
    }
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100'
      case 'completed': return 'text-green-600 bg-green-100'
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      case 'failed': return 'text-red-600 bg-red-100'
      case 'cancelled': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />
      case 'failed': return <AlertCircle className="w-4 h-4 text-red-600" />
      case 'cancelled': return <AlertCircle className="w-4 h-4 text-gray-600" />
      default: return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit': return <TrendingUp className="w-5 h-5 text-green-600" />
      case 'withdrawal': return <TrendingDown className="w-5 h-5 text-red-600" />
      case 'transfer': return <ArrowUpDown className="w-5 h-5 text-blue-600" />
      case 'payment': return <Send className="w-5 h-5 text-purple-600" />
      case 'reversal': return <RefreshCw className="w-5 h-5 text-orange-600" />
      default: return <CreditCard className="w-5 h-5 text-gray-600" />
    }
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Smartphone className="w-8 h-8 text-green-600" />
          <div>
            <h2 className="text-2xl font-bold">Mobile Money</h2>
            <p className="text-muted-foreground">Manage mobile money accounts and payments</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setBalanceVisible(!balanceVisible)}>
            {balanceVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </Button>
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={isSendMoneyOpen} onOpenChange={setIsSendMoneyOpen}>
            <DialogTrigger asChild>
              <Button>
                <Send className="w-4 h-4 mr-2" />
                Send Money
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Send Mobile Money</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Provider</Label>
                    <Select value={paymentForm.provider} onValueChange={(value) => setPaymentForm(prev => ({ ...prev, provider: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select provider" />
                      </SelectTrigger>
                      <SelectContent>
                        {providers.map((provider) => (
                          <SelectItem key={provider.id} value={provider.id || `provider-${Math.random()}`}>
                            {provider.name} ({provider.country})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Amount</Label>
                    <Input
                      type="number"
                      value={paymentForm.amount}
                      onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: e.target.value }))}
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Your Phone Number</Label>
                    <Input
                      value={paymentForm.phoneNumber}
                      onChange={(e) => setPaymentForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
                      placeholder="+254700000000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Recipient Phone Number</Label>
                    <Input
                      value={paymentForm.recipientPhoneNumber}
                      onChange={(e) => setPaymentForm(prev => ({ ...prev, recipientPhoneNumber: e.target.value }))}
                      placeholder="+254700000000"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Recipient Name (Optional)</Label>
                  <Input
                    value={paymentForm.recipientName}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, recipientName: e.target.value }))}
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    value={paymentForm.description}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Payment description"
                  />
                </div>
                <Button onClick={sendMoney} className="w-full">
                  <Send className="w-4 h-4 mr-2" />
                  Send Money
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={isAddAccountOpen} onOpenChange={setIsAddAccountOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Account
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Mobile Money Account</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Provider</Label>
                  <Select value={accountForm.provider} onValueChange={(value) => {
                    const provider = providers.find(p => p.id === value)
                    setAccountForm(prev => ({ 
                      ...prev, 
                      provider: value,
                      currency: provider?.currency || ''
                    }))
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent>
                        {providers.map((provider) => (
                          <SelectItem key={provider.id} value={provider.id || `provider-${Math.random()}`}>
                            {provider.name} ({provider.country})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Account Number</Label>
                    <Input
                      value={accountForm.accountNumber}
                      onChange={(e) => setAccountForm(prev => ({ ...prev, accountNumber: e.target.value }))}
                      placeholder="Account number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Account Name</Label>
                    <Input
                      value={accountForm.accountName}
                      onChange={(e) => setAccountForm(prev => ({ ...prev, accountName: e.target.value }))}
                      placeholder="Account name"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input
                    value={accountForm.phoneNumber}
                    onChange={(e) => setAccountForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    placeholder="+254700000000"
                  />
                </div>
                <Button onClick={createAccount} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Account
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium">Total Accounts</span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {stats.totalAccounts}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {stats.activeAccounts} active
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium">Transactions</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {stats.totalTransactions}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                All time
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium">Total Volume</span>
              </div>
              <div className="text-2xl font-bold text-purple-600">
                {formatCurrency(stats.totalVolume, 'USD')}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Processed
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-orange-600" />
                <span className="text-sm font-medium">Total Fees</span>
              </div>
              <div className="text-2xl font-bold text-orange-600">
                {formatCurrency(stats.totalFees, 'USD')}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Paid
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Country Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Label htmlFor="country-filter">Filter by Country:</Label>
            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger id="country-filter" className="w-48">
                <SelectValue placeholder="All countries" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Countries</SelectItem>
                {countries.filter(country => country && country.trim()).map((country) => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Main Interface */}
      <Tabs defaultValue="accounts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="providers">Providers</TabsTrigger>
        </TabsList>

        <TabsContent value="accounts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-green-600" />
                Mobile Money Accounts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {accounts.length === 0 ? (
                  <div className="text-center py-8">
                    <Smartphone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Mobile Money Accounts</h3>
                    <p className="text-gray-500 mb-4">Add your first mobile money account to get started.</p>
                    <Button onClick={() => setIsAddAccountOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Account
                    </Button>
                  </div>
                ) : (
                  accounts.map((account) => (
                    <div key={account.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <Smartphone className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <div className="font-medium">{account.accountName}</div>
                          <div className="text-sm text-muted-foreground">
                            {account.provider} • {account.phoneNumber}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-semibold">
                          {balanceVisible ? formatCurrency(account.balance, account.currency) : '••••••'}
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(account.status)}
                          <Badge className={getStatusColor(account.status)}>
                            {account.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowUpDown className="w-5 h-5 text-blue-600" />
                Recent Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {transactions.length === 0 ? (
                  <div className="text-center py-8">
                    <ArrowUpDown className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Transactions</h3>
                    <p className="text-gray-500 mb-4">Transactions will appear here once you start using your accounts.</p>
                  </div>
                ) : (
                  transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getTransactionIcon(transaction.transactionType)}
                        <div>
                          <div className="font-medium">{transaction.description}</div>
                          <div className="text-sm text-muted-foreground">
                            {transaction.provider} • {new Date(transaction.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-semibold ${
                          transaction.transactionType === 'deposit' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.transactionType === 'deposit' ? '+' : ''}{formatCurrency(transaction.amount, transaction.currency)}
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(transaction.status)}
                          <Badge className={getStatusColor(transaction.status)}>
                            {transaction.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="providers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-purple-600" />
                Supported Providers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {providers.map((provider) => (
                  <div key={provider.id} className="p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-3 mb-3">
                      {provider.logo && (
                        <img src={provider.logo} alt={provider.name} className="w-8 h-8" />
                      )}
                      <div>
                        <div className="font-medium">{provider.name}</div>
                        <div className="text-sm text-muted-foreground">{provider.country}</div>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Currency:</span>
                        <span className="font-medium">{provider.currency}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Daily Limit:</span>
                        <span className="font-medium">{formatCurrency(provider.limits.daily, provider.currency)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Transfer Fee:</span>
                        <span className="font-medium">{provider.fees.transfer}%</span>
                      </div>
                    </div>
                    <div className="mt-3">
                      <Badge variant={provider.isActive ? 'default' : 'secondary'}>
                        {provider.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
