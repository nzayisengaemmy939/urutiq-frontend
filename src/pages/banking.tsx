import { PageLayout } from "../components/page-layout"
import { useEffect, useState } from 'react'
import { ResponsiveBankingLayout } from '@/components/responsive-banking-layout'
import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/components/ui/use-toast'
import { bankingApi } from '@/lib/api/banking'

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
    // Get companyId from localStorage, but ensure it's valid
    const storedCompanyId = localStorage.getItem('company_id') || localStorage.getItem('companyId') || 'seed-company-1'
    const storedCompanyName = localStorage.getItem('company_name')
    
    // If the stored companyId points to "personal" company, use the correct one for "mmcmc"
    let validCompanyId = storedCompanyId
    if (storedCompanyName === 'mmcmc') {
      // Use the correct company ID for mmcmc
      validCompanyId = 'cmg0qxjh9003nao3ftbaz1oc1'
    } else if (!storedCompanyId || storedCompanyId === 'personal') {
      validCompanyId = 'seed-company-1'
    }
    
    setCompanyId(validCompanyId)
    
    console.log('Banking page companyId:', validCompanyId, 'from localStorage:', storedCompanyId, 'company name:', storedCompanyName)
    console.log('Banking page will pass companyId to ResponsiveBankingLayout:', validCompanyId)
    
    // Auto-login with demo credentials if not authenticated
    if (!isLoading && !isAuthenticated) {
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
      await bankingApi.createBankTransaction({
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
      })

      toast({
        title: "Transaction Created",
        description: "Bank transaction has been successfully created.",
      })

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
      
    } catch (error) {
      console.error('Error creating transaction:', error)
      toast({
        title: "Failed to Create Transaction",
        description: "An error occurred while creating the transaction.",
        variant: "destructive",
      })
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
          </div>
        </div>
      </PageLayout>
    )
  }

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
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
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
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Company</span>
          <input 
            className="h-8 w-48 border rounded px-2 text-sm" 
            value={companyId} 
            onChange={(e) => setCompanyId(e.target.value)} 
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Date</span>
          <div className="inline-flex rounded-md border overflow-hidden">
            <button 
              className="px-2 py-1 text-xs hover:bg-muted" 
              onClick={() => setAccountsRefreshKey((k) => k + 1)}
            >
              Refresh
            </button>
          </div>
        </div>
      </div>
      
      {/* Responsive Banking Layout */}
      <ResponsiveBankingLayout 
        companyId={companyId}
        accountsRefreshKey={accountsRefreshKey}
        setAccountsRefreshKey={setAccountsRefreshKey}
        isAddTransactionOpen={isAddTransactionOpen}
        setIsAddTransactionOpen={setIsAddTransactionOpen}
        transactionForm={transactionForm}
        setTransactionForm={setTransactionForm}
        transactionFormErrors={transactionFormErrors}
        setTransactionFormErrors={setTransactionFormErrors}
        handleTransactionFormChange={handleTransactionFormChange}
        handleCreateTransaction={handleCreateTransaction}
      />
    </PageLayout>
  )
}