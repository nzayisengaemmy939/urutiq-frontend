"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SegmentedTabs } from "@/components/ui/segmented-tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { PageLayout } from "@/components/page-layout"
import { Plus, Search, Filter, Eye, Edit, Upload, CreditCard, Building2, ArrowUpDown, CheckCircle } from "lucide-react"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog'
import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { bankingApi, BankAccount, BankTransaction, Payment } from '@/lib/api/banking'
import { CashFlowForecast } from '@/components/cash-flow-forecast'
import { AICategorization } from '@/components/ai-categorization'
import { BankingDashboard } from '@/components/banking-dashboard'
import { MultiCurrencyConverter } from '@/components/multi-currency-converter'
import { PaymentProcessorManager } from '@/components/payment-processor-manager'
import { AdvancedAnalytics } from '@/components/advanced-analytics'
import { BankConnectionManager } from '@/components/bank-connection-manager'
import { ResponsiveBankingLayout } from '@/components/responsive-banking-layout'
import { useToast } from '@/components/ui/use-toast'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/contexts/auth-context'

// Utility function to ensure SelectItem values are never empty
const safeSelectValue = (value: string | undefined | null): string => {
  if (!value || value.trim() === '') {
    return 'placeholder-value-' + Math.random().toString(36).substr(2, 9)
  }
  return value.trim()
}

// Common currencies for the dropdown
const COMMON_CURRENCIES = [
  { code: 'USD', name: 'US Dollar' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'British Pound' },
  { code: 'JPY', name: 'Japanese Yen' },
  { code: 'CAD', name: 'Canadian Dollar' },
  { code: 'AUD', name: 'Australian Dollar' },
  { code: 'CHF', name: 'Swiss Franc' },
  { code: 'CNY', name: 'Chinese Yuan' },
  { code: 'SEK', name: 'Swedish Krona' },
  { code: 'NZD', name: 'New Zealand Dollar' },
  { code: 'MXN', name: 'Mexican Peso' },
  { code: 'SGD', name: 'Singapore Dollar' },
  { code: 'HKD', name: 'Hong Kong Dollar' },
  { code: 'NOK', name: 'Norwegian Krone' },
  { code: 'KRW', name: 'South Korean Won' },
  { code: 'TRY', name: 'Turkish Lira' },
  { code: 'RUB', name: 'Russian Ruble' },
  { code: 'INR', name: 'Indian Rupee' },
  { code: 'BRL', name: 'Brazilian Real' },
  { code: 'ZAR', name: 'South African Rand' },
]

// Bank account types
const ACCOUNT_TYPES = [
  { value: 'checking', label: 'Checking Account' },
  { value: 'savings', label: 'Savings Account' },
  { value: 'credit', label: 'Credit Card' },
  { value: 'business_checking', label: 'Business Checking' },
  { value: 'business_savings', label: 'Business Savings' },
  { value: 'money_market', label: 'Money Market' },
  { value: 'line_of_credit', label: 'Line of Credit' },
]

export default function BankingPage() {
  const { isAuthenticated, isLoading, loginWithDemo } = useAuth()
  const { toast } = useToast()
  const [accountsRefreshKey, setAccountsRefreshKey] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [companyId, setCompanyId] = useState<string>('')
  
  // Add Transaction Dialog State
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false)
  const [transactionForm, setTransactionForm] = useState({
    bankAccountId: '',
    description: '',
    amount: '',
    transactionType: 'debit' as 'credit' | 'debit',
    transactionDate: new Date().toISOString().split('T')[0],
    merchantName: '',
    category: '',
    reference: '',
    memo: ''
  })
  const [transactionFormErrors, setTransactionFormErrors] = useState<Record<string, string>>({})
  
  useEffect(() => {
    setMounted(true)
    // Get companyId from localStorage
    const storedCompanyId = localStorage.getItem('company_id') || localStorage.getItem('companyId') || 'seed-company-1'
    setCompanyId(storedCompanyId)
    console.log('🏦 BankingPage mounted, auth state:', { isAuthenticated, isLoading, companyId: storedCompanyId })
    console.log('🏦 BankingPage auth values:', { 
      isAuthenticated: typeof isAuthenticated, 
      isLoading: typeof isLoading,
      isAuthenticatedValue: isAuthenticated,
      isLoadingValue: isLoading
    })
    
    // Auto-login with demo credentials if not authenticated
    if (!isLoading && !isAuthenticated) {
      console.log('🔑 Not authenticated, attempting demo login')
      loginWithDemo('banking-page', ['admin', 'accountant']).catch(console.error)
    }
  }, [isAuthenticated, isLoading, loginWithDemo])

  // Transaction creation functions
  const handleTransactionFormChange = (field: string, value: string) => {
    setTransactionForm(prev => ({ ...prev, [field]: value }))
    // Clear error for this field when user starts typing
    if (transactionFormErrors[field]) {
      setTransactionFormErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateTransactionForm = () => {
    const errors: Record<string, string> = {}
    
    if (!transactionForm.bankAccountId.trim()) {
      errors.bankAccountId = 'Bank account is required'
    }
    if (!transactionForm.description.trim()) {
      errors.description = 'Description is required'
    }
    if (!transactionForm.amount.trim()) {
      errors.amount = 'Amount is required'
    } else if (isNaN(Number(transactionForm.amount)) || Number(transactionForm.amount) === 0) {
      errors.amount = 'Amount must be a valid number'
    }
    if (!transactionForm.transactionDate.trim()) {
      errors.transactionDate = 'Transaction date is required'
    }
    
    setTransactionFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleCreateTransaction = async () => {
    if (!validateTransactionForm()) return
    
    try {
      const transactionData = {
        bankAccountId: transactionForm.bankAccountId,
        description: transactionForm.description.trim(),
        amount: Number(transactionForm.amount),
        transactionType: transactionForm.transactionType,
        transactionDate: new Date(transactionForm.transactionDate).toISOString(),
        merchantName: transactionForm.merchantName.trim() || undefined,
        category: transactionForm.category.trim() || undefined,
        reference: transactionForm.reference.trim() || undefined,
        memo: transactionForm.memo.trim() || undefined,
        status: 'unreconciled' as const
      }
      
      await bankingApi.createBankTransaction(transactionData)
      
      // Reset form and close dialog
      setTransactionForm({
        bankAccountId: '',
        description: '',
        amount: '',
        transactionType: 'debit',
        transactionDate: new Date().toISOString().split('T')[0],
        merchantName: '',
        category: '',
        reference: '',
        memo: ''
      })
      setTransactionFormErrors({})
      setIsAddTransactionOpen(false)
      
      // Refresh transactions list
      setAccountsRefreshKey(prev => prev + 1)
      
      // Show success message
      toast({
        title: "Transaction Created",
        description: "Bank transaction has been successfully created.",
      })
      
    } catch (error) {
      console.error('Error creating transaction:', error)
      setTransactionFormErrors({ submit: 'Failed to create transaction. Please try again.' })
    }
  }

  if (isLoading) {
    return (
      <PageLayout 
        title="Banking & Cash Management" 
        description="Manage bank accounts, transactions, reconciliation, and advanced banking features"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Banking", href: "/banking" }
        ]}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading authentication...</p>
            <p className="text-sm text-muted-foreground mt-2">State: {JSON.stringify({ isAuthenticated, isLoading, companyId })}</p>
          </div>
        </div>
      </PageLayout>
    )
  }

  if (!isAuthenticated) {
    return (
      <PageLayout 
        title="Banking & Cash Management" 
        description="Manage bank accounts, transactions, reconciliation, and advanced banking features"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Banking", href: "/banking" }
        ]}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-muted-foreground">Please log in to access banking features.</p>
            <p className="text-sm text-muted-foreground mt-2">State: {JSON.stringify({ isAuthenticated, isLoading, companyId })}</p>
            <p className="text-sm text-muted-foreground mt-2">Token: {localStorage.getItem('auth_token') ? 'Present' : 'Missing'}</p>
            <p className="text-sm text-muted-foreground mt-2">Tenant: {localStorage.getItem('tenant_id') || 'Missing'}</p>
          </div>
        </div>
      </PageLayout>
    )
  }
  
  const triggerAccountsRefresh = () => setAccountsRefreshKey((k) => k + 1)
  
  if (!mounted) {
    return (
      <PageLayout 
        title="Banking & Cash Management" 
        description="Manage bank accounts, transactions, reconciliation, and advanced banking features"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Banking", href: "/banking" }
        ]}
      >
        <div className="flex-1 space-y-6 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-balance">Banking & Cash Management</h1>
              <p className="text-muted-foreground">Manage bank accounts, transactions, and reconciliation</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                Import Bank Data
              </Button>
              <Button onClick={() => setIsAddTransactionOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Transaction
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card><CardContent className="p-4">Loading...</CardContent></Card>
            <Card><CardContent className="p-4">Loading...</CardContent></Card>
            <Card><CardContent className="p-4">Loading...</CardContent></Card>
          </div>
        </div>
      </PageLayout>
    )
  }
  return (
    <PageLayout 
      title="Banking & Cash Management" 
      description="Manage bank accounts, transactions, reconciliation, and advanced banking features"
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Banking", href: "/banking" }
      ]}
    >
      <SegmentedTabs
        tabs={[
          { id: 'overview', label: 'Overview' },
          { id: 'accounts', label: 'Accounts' },
          { id: 'transactions', label: 'Transactions' },
          { id: 'analytics', label: 'Analytics' },
        ]}
        value={'overview'}
        onChange={() => {}}
        className="mb-3"
      />
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Company</span>
          <input className="h-8 w-48 border rounded px-2 text-sm" value={companyId} onChange={(e) => setCompanyId(e.target.value)} />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Date</span>
          <div className="inline-flex rounded-md border overflow-hidden">
            <button className="px-2 py-1 text-xs hover:bg-muted" onClick={() => setAccountsRefreshKey((k) => k + 1)}>Refresh</button>
          </div>
        </div>
      </div>
      <ResponsiveBankingLayout companyId={companyId} />
    </PageLayout>
  )
}

function BankAccountSelect({ companyId, value, onValueChange }: { 
  companyId: string
  value: string
  onValueChange: (value: string) => void
}) {
  const [accounts, setAccounts] = useState<BankAccount[]>([])
  const [loading, setLoading] = useState(true)
  const { isAuthenticated, isLoading: authLoading } = useAuth()

  useEffect(() => {
    if (!isAuthenticated || authLoading || !companyId) return
    
    const fetchAccounts = async () => {
      try {
        const response = await bankingApi.getBankAccounts(companyId)
        setAccounts(response)
      } catch (error) {
        console.error('Error fetching bank accounts:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchAccounts()
  }, [isAuthenticated, authLoading, companyId])

  if (loading) {
    return <SelectItem value="loading" disabled>Loading accounts...</SelectItem>
  }

  if (accounts.length === 0) {
    return <SelectItem value="no-accounts" disabled>No bank accounts found</SelectItem>
  }

  return (
    <>
      {accounts.map((account) => (
        <SelectItem key={account.id} value={safeSelectValue(account.id)}>
          {account.bankName} - {account.accountNumber} ({account.accountType})
        </SelectItem>
      ))}
    </>
  )
}

function AccountCards({ refreshKey }: { refreshKey?: number }) {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const [accounts, setAccounts] = useState<BankAccount[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [companyId, setCompanyId] = useState<string>('')
  const { toast } = useToast()

  useEffect(() => {
    setMounted(true)
    // Get companyId from localStorage
    const storedCompanyId = localStorage.getItem('company_id') || localStorage.getItem('companyId') || 'seed-company-1'
    setCompanyId(storedCompanyId)
  }, [])

  useEffect(() => {
    if (!mounted || !companyId || !isAuthenticated || authLoading) return
    
    let isMounted = true
    setLoading(true)
    
    const loadingToast = toast({
      title: "Loading Accounts...",
      description: "Fetching your connected bank accounts.",
      duration: Infinity,
    })
    
    bankingApi
      .getBankAccounts(companyId)
      .then((rows) => {
        if (!isMounted) return
        setAccounts(rows)
        loadingToast.dismiss()
      })
      .catch((err) => {
        const errorMessage = err.message || String(err)
        setError(errorMessage)
        
        loadingToast.dismiss()
        toast({
          title: "Failed to Load Accounts",
          description: errorMessage,
          variant: "destructive",
        })
      })
      .finally(() => setLoading(false))
    return () => {
      isMounted = false
    }
  }, [refreshKey, toast, mounted, companyId, isAuthenticated, authLoading])

  if (loading) return (
    <>
      <Card><CardContent className="p-4">Loading accounts...</CardContent></Card>
      <Card><CardContent className="p-4">&nbsp;</CardContent></Card>
      <Card><CardContent className="p-4">&nbsp;</CardContent></Card>
    </>
  )

  if (error) return <Card><CardContent className="p-4">Error: {error}</CardContent></Card>

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

function TransactionsList() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const [txns, setTxns] = useState<BankTransaction[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reconLoadingIds, setReconLoadingIds] = useState<string[]>([])
  const [reconError, setReconError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [companyId, setCompanyId] = useState<string>('')
  const { toast } = useToast()
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(0)
  const [totalItems, setTotalItems] = useState(0)

  useEffect(() => {
    setMounted(true)
    // Get companyId from localStorage
    const storedCompanyId = localStorage.getItem('company_id') || localStorage.getItem('companyId') || 'seed-company-1'
    setCompanyId(storedCompanyId)
  }, [])

  const fetchTransactions = async (showLoadingToast = false) => {
    let loadingToast: any = null
    
    if (showLoadingToast) {
      loadingToast = toast({
        title: "Loading Transactions...",
        description: "Fetching your latest transactions.",
        duration: Infinity,
      })
    }
    
    try {
      console.log('🔍 Fetching transactions for companyId:', companyId)
      console.log('🔑 Token from localStorage:', localStorage.getItem('auth_token') ? 'Present' : 'Missing')
      console.log('🔑 Tenant from localStorage:', localStorage.getItem('tenant_id'))
      console.log('🚀 About to call bankingApi.getBankTransactions...')
      
      const response = await bankingApi.getBankTransactions(undefined, companyId, undefined, currentPage, pageSize)
      console.log('📊 Transactions response:', response)
      console.log('📊 Response items:', response.items)
      console.log('📊 Response items length:', response.items?.length)
      console.log('📊 Response type:', typeof response)
      console.log('📊 Response keys:', Object.keys(response || {}))
      
      if (response && response.items) {
        console.log('✅ Setting transactions:', response.items.length, 'items')
        setTxns(response.items)
        setTotalPages(response.totalPages || 0)
        setTotalItems(response.total || 0)
      } else {
        console.log('❌ No items in response, setting empty array')
        setTxns([])
        setTotalPages(0)
        setTotalItems(0)
      }
      setError(null)
      
      if (loadingToast) {
        loadingToast.dismiss()
      }
    } catch (err: any) {
      console.error('❌ Error in fetchTransactions:', err)
      const errorMessage = err.message || String(err)
      setError(errorMessage)
      
      if (loadingToast) {
        loadingToast.dismiss()
      }
      
      toast({
        title: "Failed to Load Transactions",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    console.log('🔄 TransactionsList useEffect triggered:', { mounted, companyId, isAuthenticated, authLoading })
    console.log('🔄 useEffect dependencies:', { mounted, companyId, isAuthenticated, authLoading })
    
    if (!mounted) {
      console.log('⏸️ useEffect skipped: not mounted')
      return
    }
    
    if (!companyId) {
      console.log('⏸️ useEffect skipped: no companyId')
      return
    }
    
    if (!isAuthenticated) {
      console.log('⏸️ useEffect skipped: not authenticated')
      return
    }
    
    if (authLoading) {
      console.log('⏸️ useEffect skipped: auth loading')
      return
    }
    
    console.log('✅ All conditions met, starting fetchTransactions')
    let isMounted = true
    setLoading(true)
    console.log('🚀 TransactionsList starting fetchTransactions')
    fetchTransactions(true) // Show loading toast for initial load
      .finally(() => { 
        console.log('🏁 fetchTransactions completed')
        if (isMounted) setLoading(false) 
      })
    return () => { 
      console.log('🧹 useEffect cleanup')
      isMounted = false 
    }
  }, [mounted, companyId, isAuthenticated, authLoading, currentPage, pageSize])

  if (loading) return <div className="space-y-4">Loading transactions...</div>
  if (error) return <div className="space-y-4">Error loading transactions: {error}</div>
  if (!txns || txns.length === 0) {
    return (
      <div className="space-y-4">
        <p>No transactions found</p>
        <p className="text-sm text-muted-foreground">Debug info:</p>
        <p className="text-sm text-muted-foreground">- CompanyId: {companyId}</p>
        <p className="text-sm text-muted-foreground">- Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
        <p className="text-sm text-muted-foreground">- AuthLoading: {authLoading ? 'Yes' : 'No'}</p>
        <p className="text-sm text-muted-foreground">- Token: {localStorage.getItem('auth_token') ? 'Present' : 'Missing'}</p>
        <p className="text-sm text-muted-foreground">- Tenant: {localStorage.getItem('tenant_id') || 'Missing'}</p>
        <div className="flex gap-2 mt-2">
          <Button onClick={() => fetchTransactions(true)}>Retry</Button>
          <Button onClick={() => {
            console.log('🧪 Manual test - calling fetchTransactions directly')
            fetchTransactions(true)
          }} variant="outline">Manual Test</Button>
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
            <Badge variant={transaction.status === 'reconciled' ? 'default' : 'secondary'}>{transaction.status || 'unreconciled'}</Badge>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm"><Eye className="w-4 h-4" /></Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={transaction.status === 'reconciled' || reconLoadingIds.includes(transaction.id)}
                  >
                    {reconLoadingIds.includes(transaction.id) ? 'Recon...' : 'Reconcile'}
                  </Button>
                </AlertDialogTrigger>
                <ReconcileDialog 
                  transaction={transaction} 
                  onReconcile={async (paymentId) => {
                    setReconError(null)
                    setReconLoadingIds((ids) => [...ids, transaction.id])
                    
                    try {
                      await bankingApi.reconcileTransaction(transaction.id, { paymentId })
                      toast({
                        title: "Transaction Reconciled",
                        description: "Transaction has been successfully reconciled.",
                      })
                      await fetchTransactions()
                    } catch (err: any) {
                      const errorMessage = err?.message || String(err)
                      setReconError(errorMessage)
                      toast({
                        title: "Reconciliation Failed",
                        description: errorMessage,
                        variant: "destructive",
                      })
                    } finally {
                      setReconLoadingIds((ids) => ids.filter((i) => i !== transaction.id))
                    }
                  }}
                />
              </AlertDialog>
            </div>
          </div>
        </div>
      ))}
      {reconError && <div className="text-sm text-destructive">{reconError}</div>}
      
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems} transactions
            </span>
            <Select value={pageSize.toString()} onValueChange={(value) => {
              setPageSize(Number(value))
              setCurrentPage(1) // Reset to first page when changing page size
            }}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">per page</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }
                
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className="w-8 h-8 p-0"
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function ConnectAccountButton({ onSuccess }: { onSuccess?: () => void }) {
  const [open, setOpen] = useState(false)
  const [bankName, setBankName] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [accountType, setAccountType] = useState('checking')
  const [currency, setCurrency] = useState('USD')
  const [loading, setLoading] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [companyId, setCompanyId] = useState<string>('')
  const { toast } = useToast()

  useEffect(() => {
    // Get companyId from localStorage
    const storedCompanyId = localStorage.getItem('company_id') || localStorage.getItem('companyId') || 'seed-company-1'
    setCompanyId(storedCompanyId)
  }, [])

  // Validation function
  const validateForm = () => {
    const errors: Record<string, string> = {}
    
    // Bank name validation
    if (!bankName.trim()) {
      errors.bankName = 'Bank name is required'
    } else if (bankName.trim().length < 2) {
      errors.bankName = 'Bank name must be at least 2 characters'
    } else if (bankName.trim().length > 100) {
      errors.bankName = 'Bank name cannot exceed 100 characters'
    }
    
    // Account number validation
    if (!accountNumber.trim()) {
      errors.accountNumber = 'Account number is required'
    } else if (!/^[a-zA-Z0-9\-\*]+$/.test(accountNumber.trim())) {
      errors.accountNumber = 'Account number can only contain letters, numbers, hyphens, and asterisks'
    } else if (accountNumber.trim().length < 4) {
      errors.accountNumber = 'Account number must be at least 4 characters'
    } else if (accountNumber.trim().length > 50) {
      errors.accountNumber = 'Account number cannot exceed 50 characters'
    }
    
    // Account type validation
    if (!accountType.trim()) {
      errors.accountType = 'Account type is required'
    } else if (!ACCOUNT_TYPES.find(t => t.value === accountType.trim())) {
      errors.accountType = 'Please select a valid account type'
    }
    
    // Currency validation
    if (!currency.trim()) {
      errors.currency = 'Currency is required'
    } else if (!COMMON_CURRENCIES.find(c => c.code === currency.trim())) {
      errors.currency = 'Please select a valid currency'
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Real-time validation on field change
  const handleBankNameChange = (value: string) => {
    setBankName(value)
    if (validationErrors.bankName) {
      const errors = { ...validationErrors }
      delete errors.bankName
      setValidationErrors(errors)
    }
  }

  const handleAccountNumberChange = (value: string) => {
    setAccountNumber(value)
    if (validationErrors.accountNumber) {
      const errors = { ...validationErrors }
      delete errors.accountNumber
      setValidationErrors(errors)
    }
  }

  const handleAccountTypeChange = (value: string) => {
    setAccountType(value)
    if (validationErrors.accountType) {
      const errors = { ...validationErrors }
      delete errors.accountType
      setValidationErrors(errors)
    }
  }

  const handleCurrencyChange = (value: string) => {
    setCurrency(value)
    if (validationErrors.currency) {
      const errors = { ...validationErrors }
      delete errors.currency
      setValidationErrors(errors)
    }
  }

  async function handleCreate(isRetry = false) {
    // Validate form before submission
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors below before continuing.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    setError(null)
    
    // Show loading toast with retry indication
    const loadingToast = toast({
      title: isRetry ? "Retrying Connection..." : "Connecting Account...",
      description: isRetry 
        ? `Retry attempt ${retryCount + 1}/3. Please wait while we connect your bank account.`
        : "Please wait while we connect your bank account.",
      duration: Infinity,
    })
    
    try {
      await bankingApi.createBankAccount({ 
        companyId,
        bankName: bankName.trim(), 
        accountNumber: accountNumber.trim(),
        accountType: accountType,
        currency: currency
      })
      
      // Dismiss loading toast and show success
      loadingToast.dismiss()
      toast({
        title: "Account Connected",
        description: `Successfully connected ${bankName.trim()} ${ACCOUNT_TYPES.find(t => t.value === accountType)?.label}.`,
      })
      
      // Reset form and retry count
      setBankName('')
      setAccountNumber('')
      setAccountType('checking')
      setCurrency('USD')
      setValidationErrors({})
      setRetryCount(0)
      
      if (onSuccess) onSuccess()
      setOpen(false)
    } catch (err: any) {
      const errorMessage = err?.message || String(err)
      setError(errorMessage)
      
      // Dismiss loading toast
      loadingToast.dismiss()
      
      // Check if we should offer retry (max 3 attempts)
      if (retryCount < 2) {
        toast({
          title: "Connection Failed",
          description: errorMessage,
          variant: "destructive",
          action: (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setRetryCount(prev => prev + 1)
                handleCreate(true)
              }}
            >
              Retry
            </Button>
          ),
        })
      } else {
        toast({
          title: "Connection Failed",
          description: `${errorMessage}. Maximum retry attempts reached.`,
          variant: "destructive",
        })
        setRetryCount(0) // Reset for next attempt
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Connect Account
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Connect Bank Account</DialogTitle>
          <DialogDescription>Please enter the account details to connect a bank account.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 mt-2">
          <div>
            <label className="text-sm text-muted-foreground">Bank name *</label>
            <Input 
              value={bankName} 
              onChange={(e) => handleBankNameChange((e.target as HTMLInputElement).value)} 
              placeholder="e.g. Chase Bank"
              className={validationErrors.bankName ? 'border-destructive' : ''}
            />
            {validationErrors.bankName && (
              <p className="text-sm text-destructive mt-1">{validationErrors.bankName}</p>
            )}
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Account type *</label>
            <Select value={accountType} onValueChange={handleAccountTypeChange}>
              <SelectTrigger className={validationErrors.accountType ? 'border-destructive' : ''}>
                <SelectValue placeholder="Select account type" />
              </SelectTrigger>
              <SelectContent>
                {ACCOUNT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {validationErrors.accountType && (
              <p className="text-sm text-destructive mt-1">{validationErrors.accountType}</p>
            )}
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Account number *</label>
            <Input 
              value={accountNumber} 
              onChange={(e) => handleAccountNumberChange((e.target as HTMLInputElement).value)} 
              placeholder="**** 1234 or account number"
              className={validationErrors.accountNumber ? 'border-destructive' : ''}
            />
            {validationErrors.accountNumber && (
              <p className="text-sm text-destructive mt-1">{validationErrors.accountNumber}</p>
            )}
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Currency *</label>
            <Select value={currency} onValueChange={handleCurrencyChange}>
              <SelectTrigger className={validationErrors.currency ? 'border-destructive' : ''}>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {COMMON_CURRENCIES.map((curr) => (
                  <SelectItem key={curr.code} value={curr.code}>
                    {curr.code} - {curr.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {validationErrors.currency && (
              <p className="text-sm text-destructive mt-1">{validationErrors.currency}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">Select your account's base currency</p>
          </div>
          {error && <div className="text-sm text-destructive">{error}</div>}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={loading}>Cancel</Button>
          </DialogClose>
          <Button 
            onClick={() => handleCreate(false)} 
            disabled={loading || !bankName.trim() || !accountNumber.trim() || !accountType.trim() || !currency.trim()}
          >
            {loading ? 'Connecting...' : 'Connect'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ReconcileDialog({ 
  transaction, 
  onReconcile 
}: { 
  transaction: BankTransaction
  onReconcile: (paymentId?: string) => Promise<void>
}) {
  const [payments, setPayments] = useState<Payment[]>([])
  const [selectedPaymentId, setSelectedPaymentId] = useState<string>('none')
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [retryCount, setRetryCount] = useState(0)
  const [step, setStep] = useState<'select' | 'processing' | 'complete'>('select')
  const [companyId, setCompanyId] = useState<string>('')
  const { toast } = useToast()

  useEffect(() => {
    // Get companyId from localStorage
    const storedCompanyId = localStorage.getItem('company_id') || localStorage.getItem('companyId') || 'seed-company-1'
    setCompanyId(storedCompanyId)
  }, [])

  // Load payments when dialog opens
  useEffect(() => {
    if (!companyId) return
    
    const loadPayments = async () => {
      try {
        const paymentList = await bankingApi.getPayments(companyId)
        // Filter payments that could match this transaction amount
        const matchingPayments = paymentList.filter((p: Payment) => 
          Math.abs(p.amount - Math.abs(Number(transaction.amount))) < 0.01
        )
        setPayments(matchingPayments)
      } catch (err) {
        toast({
          title: "Failed to Load Payments",
          description: "Could not load available payments for reconciliation.",
          variant: "destructive",
        })
      }
    }
    loadPayments()
  }, [transaction.amount, toast, companyId])

  const handleReconcile = async (isRetry = false) => {
    setLoading(true)
    setStep('processing')
    setProgress(0)

    // Progress simulation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + 10
      })
    }, 200)

    try {
      await onReconcile(selectedPaymentId === 'none' ? undefined : selectedPaymentId)
      
      // Complete progress
      setProgress(100)
      setStep('complete')
      setRetryCount(0)
      
      // Auto-close after success
      setTimeout(() => {
        setStep('select')
        setProgress(0)
      }, 1500)
      
    } catch (err: any) {
      clearInterval(progressInterval)
      setStep('select')
      setProgress(0)
      
      // Handle retry logic
      if (retryCount < 2) {
        toast({
          title: "Reconciliation Failed",
          description: err?.message || "An error occurred during reconciliation.",
          variant: "destructive",
          action: (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setRetryCount(prev => prev + 1)
                handleReconcile(true)
              }}
            >
              Retry ({retryCount + 1}/3)
            </Button>
          ),
        })
      } else {
        toast({
          title: "Reconciliation Failed",
          description: `${err?.message || "An error occurred"}. Maximum retry attempts reached.`,
          variant: "destructive",
        })
        setRetryCount(0)
      }
    } finally {
      clearInterval(progressInterval)
      setLoading(false)
    }
  }

  return (
    <AlertDialogContent className="max-w-lg">
      <AlertDialogHeader>
        <AlertDialogTitle>Reconcile Transaction</AlertDialogTitle>
        <AlertDialogDescription>
          Match this ${Math.abs(Number(transaction.amount)).toFixed(2)} transaction with a payment record.
        </AlertDialogDescription>
      </AlertDialogHeader>

      {step === 'processing' && (
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {retryCount > 0 ? `Retry attempt ${retryCount}/3...` : 'Processing reconciliation...'}
            </p>
          </div>
          <Progress value={progress} className="w-full" />
          <div className="text-center text-xs text-muted-foreground">
            {progress}% complete
          </div>
        </div>
      )}

      {step === 'complete' && (
        <div className="text-center py-4">
          <div className="text-green-600 font-medium">✓ Reconciliation Complete</div>
          <p className="text-sm text-muted-foreground">Transaction has been successfully reconciled.</p>
        </div>
      )}

      {step === 'select' && (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Select Payment (Optional)</label>
            <Select value={selectedPaymentId} onValueChange={setSelectedPaymentId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a payment to link, or leave blank" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No payment selected</SelectItem>
                {payments.map((payment) => (
                  <SelectItem key={payment.id} value={safeSelectValue(payment.id)}>
                    ${Number(payment.amount).toFixed(2)} - {payment.method} 
                    {payment.reference && ` (${payment.reference})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {payments.length === 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                No matching payments found for this amount.
              </p>
            )}
          </div>
        </div>
      )}

      <AlertDialogFooter>
        <AlertDialogCancel disabled={loading}>
          {step === 'complete' ? 'Close' : 'Cancel'}
        </AlertDialogCancel>
        {step === 'select' && (
          <Button onClick={() => handleReconcile(false)} disabled={loading}>
            {loading ? 'Processing...' : 'Reconcile'}
          </Button>
        )}
      </AlertDialogFooter>
    </AlertDialogContent>
  )
}
