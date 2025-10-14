import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import apiService from '../lib/api'
import { PageLayout } from '../components/page-layout'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Badge } from '../components/ui/badge'
import { Calendar } from '../components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog'
import { 
  CalendarDays,
  Plus, 
  Save,
  Trash2,
  Copy,
  CheckCircle,
  AlertTriangle,
  FileText,
  Receipt,
  History,
  Sparkles,
  Scale,
  ArrowLeftRight,
  Download,
  CheckCircle2,
  Clock,
  Bot,
  Zap,
  Clipboard
} from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '../lib/utils'

type Line = { 
  id: string
  accountId: string
  accountName?: string
  accountType?: string
  debit?: number
  credit?: number
  memo?: string
}

interface Account {
  id: string
  name: string
  type: string | { id: string; name: string; code: string }
  code: string
  description?: string
}


const TEMPLATES = [
  {
    id: 'office_expense',
    title: 'Office Expense',
    description: 'Standard office expense with accounts payable',
    lines: [
      { accountId: '5000', accountName: 'Office Expenses', debit: 500, credit: 0, memo: 'Office supplies purchase' },
      { accountId: '2100', accountName: 'Accounts Payable', debit: 0, credit: 500, memo: 'Amount owed to supplier' }
    ]
  },
  {
    id: 'revenue_recognition',
    title: 'Revenue Recognition',
    description: 'Record revenue with accounts receivable',
    lines: [
      { accountId: '1120', accountName: 'Accounts Receivable', debit: 1000, credit: 0, memo: 'Customer invoice' },
      { accountId: '3000', accountName: 'Revenue', debit: 0, credit: 1000, memo: 'Service revenue earned' }
    ]
  },
  {
    id: 'depreciation',
    title: 'Depreciation',
    description: 'Monthly depreciation adjustment',
    lines: [
      { accountId: '5300', accountName: 'Depreciation Expense', debit: 250, credit: 0, memo: 'Depreciation expense' },
      { accountId: '1400', accountName: 'Accumulated Depreciation', debit: 0, credit: 250, memo: 'Accumulated depreciation' }
    ]
  },
  {
    id: 'accrual',
    title: 'Accrual',
    description: 'Expense accrual entry',
    lines: [
      { accountId: '5200', accountName: 'Utilities Expense', debit: 300, credit: 0, memo: 'Accrued utility expense' },
      { accountId: '2200', accountName: 'Accrued Expenses', debit: 0, credit: 300, memo: 'Accrued expenses payable' }
    ]
  },
  {
    id: 'inventory',
    title: 'Inventory Adjustment',
    description: 'Adjust inventory levels and COGS',
    lines: [
      { accountId: '6000', accountName: 'Cost of Goods Sold', debit: 750, credit: 0, memo: 'Cost of goods sold' },
      { accountId: '1200', accountName: 'Inventory', debit: 0, credit: 750, memo: 'Inventory reduction' }
    ]
  },
  {
    id: 'payment',
    title: 'Payment Entry',
    description: 'Record payment to supplier',
    lines: [
      { accountId: '2100', accountName: 'Accounts Payable', debit: 1200, credit: 0, memo: 'Accounts payable payment' },
      { accountId: '1110', accountName: 'Cash', debit: 0, credit: 1200, memo: 'Cash payment' }
    ]
  },
  {
    id: 'bank_loan',
    title: 'Bank Loan Received',
    description: 'Receive bank loan (increases liabilities)',
    lines: [
      { accountId: '1110', accountName: 'Cash', debit: 10000, credit: 0, memo: 'Loan proceeds received' },
      { accountId: '2101', accountName: 'Bank Loan', debit: 0, credit: 10000, memo: 'Bank loan liability' }
    ]
  },
  {
    id: 'equipment_credit',
    title: 'Equipment Purchase on Credit',
    description: 'Buy equipment on account (increases liabilities)',
    lines: [
      { accountId: '1300', accountName: 'Equipment', debit: 5000, credit: 0, memo: 'Equipment purchase' },
      { accountId: '2100', accountName: 'Accounts Payable', debit: 0, credit: 5000, memo: 'Amount owed to supplier' }
    ]
  },
  {
    id: 'customer_prepayment',
    title: 'Customer Prepayment',
    description: 'Customer pays in advance (unearned revenue)',
    lines: [
      { accountId: '1110', accountName: 'Cash', debit: 2000, credit: 0, memo: 'Customer advance payment' },
      { accountId: '2104', accountName: 'Unearned Revenue', debit: 0, credit: 2000, memo: 'Unearned revenue liability' }
    ]
  },
  {
    id: 'rent_accrual',
    title: 'Accrue Monthly Rent',
    description: 'Accrue rent expense (increases liabilities)',
    lines: [
      { accountId: '5001', accountName: 'Rent Expense', debit: 1500, credit: 0, memo: 'Monthly rent expense' },
      { accountId: '2103', accountName: 'Accrued Expenses', debit: 0, credit: 1500, memo: 'Accrued rent payable' }
    ]
  },
  {
    id: 'credit_card_purchase',
    title: 'Credit Card Purchase',
    description: 'Make purchase with credit card',
    lines: [
      { accountId: '5000', accountName: 'Office Expenses', debit: 300, credit: 0, memo: 'Office supplies on credit card' },
      { accountId: '2102', accountName: 'Credit Card Payable', debit: 0, credit: 300, memo: 'Credit card liability' }
    ]
  }
]

// Recent entries will be fetched from the API

export default function NewJournalEntryPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [companyId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('company_id') || localStorage.getItem('companyId') || localStorage.getItem('company') || ''
    }
    return ''
  })
  const [date, setDate] = useState<Date>(new Date())
  const [postingDate, setPostingDate] = useState<Date>(new Date())
  const [memo, setMemo] = useState<string>('')
  const [reference, setReference] = useState<string>('')
  const [entryType, setEntryType] = useState<string>('GENERAL')
  const [entryNumber, setEntryNumber] = useState<string>('JE-2025-001')
  const [lines, setLines] = useState<Line[]>([
    { id: '1', accountId: '', accountName: '', debit: 0, credit: 0, memo: '' },
    { id: '2', accountId: '', accountName: '', debit: 0, credit: 0, memo: '' },
  ])
  const [posting, setPosting] = useState<boolean>(false)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [accountsLoading, setAccountsLoading] = useState<boolean>(true)
  const [recentEntries, setRecentEntries] = useState<any[]>([])
  const [recentEntriesLoading, setRecentEntriesLoading] = useState<boolean>(false)
  const [showTemplates, setShowTemplates] = useState<boolean>(false)
  const [errors, setErrors] = useState<string[]>([])
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([])
  const [successMessage, setSuccessMessage] = useState<string>('')
  const nextLineId = useRef(3)

  // Load accounts and recent entries on component mount
  useEffect(() => {
    loadAccounts()
    loadRecentEntries()
    generateAiSuggestions()
    
    // Check for success message from URL
    if (searchParams.get('success') === 'entry-created') {
      setSuccessMessage('Journal entry created successfully!')
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000)
    }
  }, [lines, searchParams])

  const loadAccounts = async () => {
    setAccountsLoading(true)
    try {
      // First, try to create some basic accounts if they don't exist
      await createBasicAccounts()
      
      // Then load accounts from API
      const accountsData = await apiService.get(`/api/accounts?companyId=${companyId}`)
      console.log('Loaded accounts:', accountsData)
      
      // Handle different response formats
      let accountsList = []
      if (accountsData?.flat) {
        accountsList = accountsData.flat
      } else if (accountsData?.data) {
        accountsList = accountsData.data
      } else if (Array.isArray(accountsData)) {
        accountsList = accountsData
      }
      
      if (accountsList && accountsList.length > 0) {
        setAccounts(accountsList)
      } else {
        console.log('No accounts found, using fallback')
        setAccounts([])
      }
    } catch (error) {
      console.error('Failed to load accounts:', error)
      setAccounts([])
      setErrors(['Failed to load accounts. Please check your connection.'])
    } finally {
      setAccountsLoading(false)
    }
  }

  const createBasicAccounts = async () => {
    try {
      // Create account types first
      const accountTypes = [
        { code: 'ASSET', name: 'Asset' },
        { code: 'LIABILITY', name: 'Liability' },
        { code: 'REVENUE', name: 'Revenue' },
        { code: 'EXPENSE', name: 'Expense' }
      ]

      const typeMap: { [key: string]: string } = {}

      for (const type of accountTypes) {
        try {
          const existingTypes = await apiService.get(`/api/account-types?companyId=${companyId}`)
          const existingType = existingTypes.find((t: any) => t.code === type.code)
          
          if (existingType) {
            typeMap[type.code] = existingType.id
          } else {
            const createdType = await apiService.post('/api/account-types', {
              ...type,
              companyId
            })
            typeMap[type.code] = createdType.id
          }
        } catch (error) {
          console.log(`Account type ${type.name} creation failed:`, error)
        }
      }

      // Create basic accounts
      const basicAccounts = [
        // Assets
        { name: 'Cash', code: '1110', typeCode: 'ASSET' },
        { name: 'Accounts Receivable', code: '1120', typeCode: 'ASSET' },
        { name: 'Equipment', code: '1300', typeCode: 'ASSET' },
        
        // Liabilities
        { name: 'Accounts Payable', code: '2100', typeCode: 'LIABILITY' },
        { name: 'Bank Loan', code: '2101', typeCode: 'LIABILITY' },
        { name: 'Credit Card Payable', code: '2102', typeCode: 'LIABILITY' },
        { name: 'Accrued Expenses', code: '2103', typeCode: 'LIABILITY' },
        { name: 'Unearned Revenue', code: '2104', typeCode: 'LIABILITY' },
        
        // Equity
        { name: 'Owner Equity', code: '3000', typeCode: 'EQUITY' },
        
        // Revenue
        { name: 'Sales Revenue', code: '4000', typeCode: 'REVENUE' },
        
        // Expenses
        { name: 'Office Expenses', code: '5000', typeCode: 'EXPENSE' },
        { name: 'Rent Expense', code: '5001', typeCode: 'EXPENSE' }
      ]

      for (const account of basicAccounts) {
        try {
          const existingAccounts = await apiService.get(`/api/accounts?companyId=${companyId}`)
          const existingAccount = existingAccounts?.flat?.find((a: any) => a.code === account.code) || 
                                 existingAccounts?.data?.find((a: any) => a.code === account.code)
          
          if (!existingAccount && typeMap[account.typeCode]) {
            await apiService.post('/api/accounts', {
              name: account.name,
              code: account.code,
              typeId: typeMap[account.typeCode],
              companyId
            })
            console.log(`Created account: ${account.name}`)
          }
        } catch (error) {
          console.log(`Account ${account.name} creation failed:`, error)
        }
      }
    } catch (error) {
      console.error('Failed to create basic accounts:', error)
    }
  }

  const loadRecentEntries = async () => {
    setRecentEntriesLoading(true)
    try {
      // Fetch recent journal entries from API
      const entriesData = await apiService.get(`/api/journal?companyId=${companyId}&page=1&pageSize=5`)
      console.log('Loaded recent entries:', entriesData)
      
      // Handle different response formats
      let entriesList = []
      if (entriesData?.entries) {
        entriesList = entriesData.entries
      } else if (entriesData?.data) {
        entriesList = entriesData.data
      } else if (Array.isArray(entriesData)) {
        entriesList = entriesData
      }
      
      if (entriesList && entriesList.length > 0) {
        // Transform the data to match the expected format
        const transformedEntries = entriesList.map((entry: any) => {
          // Calculate total amount from journal lines
          const totalAmount = entry.lines?.reduce((sum: number, line: any) => {
            return sum + (Number(line.debit) || 0) + (Number(line.credit) || 0)
          }, 0) || 0

          // Create a shorter, more user-friendly entry number
          const shortId = entry.id ? entry.id.substring(0, 8).toUpperCase() : 'N/A'
          const friendlyEntryNumber = entry.reference || `JE-${shortId}` || `JE-${entry.id?.substring(0, 8)}`

          return {
            id: entry.id,
            description: entry.memo || entry.description || 'Journal Entry',
            amount: Number(totalAmount) || 0,
            date: entry.date ? new Date(entry.date).toISOString().split('T')[0] : 
                  entry.createdAt ? new Date(entry.createdAt).toISOString().split('T')[0] : 
                  new Date().toISOString().split('T')[0],
            status: entry.status || 'Posted',
            entryNumber: friendlyEntryNumber,
            lines: entry.lines || []
          }
        })
        setRecentEntries(transformedEntries)
      } else {
        setRecentEntries([])
      }
    } catch (error) {
      console.error('Failed to load recent entries:', error)
      setRecentEntries([])
    } finally {
      setRecentEntriesLoading(false)
    }
  }

  const generateAiSuggestions = () => {
    const totalDebits = lines.reduce((sum, line) => sum + (line.debit || 0), 0)
    const totalCredits = lines.reduce((sum, line) => sum + (line.credit || 0), 0)
    const difference = totalDebits - totalCredits

    const suggestions = []
    
    if (Math.abs(difference) > 0.01) {
      if (difference > 0) {
        suggestions.push(`The debit entry suggests an expense transaction. Consider adding a credit to Accounts Payable (2100) to balance the entry.`)
        suggestions.push(`Based on similar transactions, credit amount should be $${difference.toFixed(2)} to Accounts Payable.`)
      } else {
        suggestions.push(`The credit entry needs a corresponding debit. Consider adding a debit to complete the transaction.`)
      }
    }

    setAiSuggestions(suggestions)
  }

  const copyFromRecentEntry = (entry: any) => {
    // This function would copy the entry details to the current form
    // For now, we'll just show a message
    setMemo(entry.description || '')
    setSuccessMessage(`Copied details from ${entry.entryNumber}`)
    setTimeout(() => setSuccessMessage(''), 3000)
  }

  const validateEntry = (): string[] => {
    const validationErrors: string[] = []
    
    if (!memo.trim()) {
      validationErrors.push('Please add a description for this transaction')
    }
    
    const totalDebits = lines.reduce((sum, line) => sum + (line.debit || 0), 0)
    const totalCredits = lines.reduce((sum, line) => sum + (line.credit || 0), 0)
    
    if (Math.abs(totalDebits - totalCredits) > 0.01) {
      validationErrors.push(`Debits ($${totalDebits.toFixed(2)}) must equal Credits ($${totalCredits.toFixed(2)})`)
    }
    
    if (totalDebits === 0 && totalCredits === 0) {
      validationErrors.push('Please enter some amounts for the transaction')
    }
    
    const linesWithoutAccount = lines.filter(line => !line.accountId)
    if (linesWithoutAccount.length > 0) {
      validationErrors.push('Please select accounts for all transaction lines')
    }
    
    return validationErrors
  }

  const updateLine = (lineId: string, patch: Partial<Line>) => {
    setLines(prev => prev.map(line => line.id === lineId ? { ...line, ...patch } : line))
    // Clear errors when user makes changes
    if (errors.length > 0) {
      setErrors([])
    }
  }

  const addLine = () => {
    const newLine: Line = {
      id: nextLineId.current.toString(),
      accountId: '',
      debit: 0,
      credit: 0,
      memo: ''
    }
    setLines(prev => [...prev, newLine])
    nextLineId.current++
  }

  const removeLine = (lineId: string) => {
    if (lines.length > 2) {
      setLines(prev => prev.filter(line => line.id !== lineId))
    }
  }

  const duplicateLine = (lineId: string) => {
    const lineToDuplicate = lines.find(line => line.id === lineId)
    if (lineToDuplicate) {
      const newLine: Line = {
        ...lineToDuplicate,
        id: nextLineId.current.toString(),
        debit: 0,
        credit: 0,
        memo: ''
      }
      setLines(prev => {
        const index = prev.findIndex(line => line.id === lineId)
        return [...prev.slice(0, index + 1), newLine, ...prev.slice(index + 1)]
      })
      nextLineId.current++
    }
  }

  const applyTemplate = (template: any) => {
    const newLines = template.lines.map((line: any, index: number) => {
      // Find the account by code or name
      const account = accounts.find(acc => acc.code === line.accountId || acc.name === line.accountName)
      return {
        id: (index + 1).toString(),
        accountId: account?.id || line.accountId,
        accountName: account?.name || line.accountName,
        debit: line.debit,
        credit: line.credit,
        memo: line.memo
      }
    })
    setLines(newLines)
    setMemo(template.title)
    setShowTemplates(false)
    nextLineId.current = newLines.length + 1
  }

  const autoBalance = () => {
    const totalDebits = lines.reduce((sum, line) => sum + (line.debit || 0), 0)
    const totalCredits = lines.reduce((sum, line) => sum + (line.credit || 0), 0)
    const difference = totalDebits - totalCredits

    if (Math.abs(difference) > 0.01) {
      // Find the first empty credit or debit field
      const emptyLine = lines.find(line => !line.debit && !line.credit)
      if (emptyLine) {
        if (difference > 0) {
          updateLine(emptyLine.id, { credit: difference })
        } else {
          updateLine(emptyLine.id, { debit: Math.abs(difference) })
        }
      }
    }
  }

  const applyAiSuggestions = () => {
    const totalDebits = lines.reduce((sum, line) => sum + (line.debit || 0), 0)
    const totalCredits = lines.reduce((sum, line) => sum + (line.credit || 0), 0)
    const difference = totalDebits - totalCredits

    if (Math.abs(difference) > 0.01) {
      const emptyLine = lines.find(line => !line.debit && !line.credit)
      if (emptyLine) {
        updateLine(emptyLine.id, { 
          accountId: '2100',
          accountName: 'Accounts Payable',
          credit: difference,
          memo: 'Auto-balanced by AI suggestion'
        })
      }
    }
  }

  const postEntry = async () => {
    const validationErrors = validateEntry()
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }

    // Clear previous errors
    setErrors([])
    setPosting(true)
    
    try {
      // Filter and validate lines
      const validLines = lines.filter(line => {
        return line.accountId && 
               line.accountId.trim() !== '' && 
               ((line.debit && line.debit > 0) || (line.credit && line.credit > 0))
      })

      if (validLines.length < 2) {
        setErrors(['Please add at least 2 journal entry lines with valid accounts and amounts'])
        setPosting(false)
        return
      }

      const payload = { 
        date: format(date, 'yyyy-MM-dd'), 
        memo, 
        reference, 
        companyId, 
        lines: validLines.map(line => ({
          accountId: line.accountId,
          debit: line.debit || undefined,
          credit: line.credit || undefined,
          memo: line.memo || undefined
        }))
      }
      
      console.log('Posting journal entry:', payload)
      const result = await apiService.postJournalEntry(payload)
      console.log('Journal entry created successfully:', result)
      
      // Reload recent entries to show the new entry
      loadRecentEntries()
      
      // Trigger financial reports refresh if user is on accounting page
      window.dispatchEvent(new CustomEvent('journalEntryCreated', { 
        detail: { entryId: result.id, companyId } 
      }))
      
      // Success - redirect to journal list with success message
      navigate('/dashboard/journal/new?success=entry-created')
    } catch (e: any) {
      console.error('Error creating journal entry:', e)
      const errorMessage = e.message || e.error?.message || 'Failed to create journal entry. Please try again.'
      setErrors([errorMessage])
    } finally {
      setPosting(false)
    }
  }

  const saveDraft = async () => {
    setPosting(true)
    try {
      // Save as draft logic here
      console.log('Saving draft...')
    } catch (e: any) {
      setErrors([e.message || 'Failed to save draft. Please try again.'])
    } finally {
      setPosting(false)
    }
  }

  const getTotalDebits = () => lines.reduce((sum, line) => sum + (line.debit || 0), 0)
  const getTotalCredits = () => lines.reduce((sum, line) => sum + (line.credit || 0), 0)
  const isBalanced = () => Math.abs(getTotalDebits() - getTotalCredits()) < 0.01
  const getDifference = () => Math.abs(getTotalDebits() - getTotalCredits())

  return (
    <PageLayout>
      <div className="space-y-6">
      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="font-semibold text-green-800">{successMessage}</span>
          </div>
        </div>
      )}

      {/* Error Display */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h3 className="font-semibold text-red-800">Please fix the following errors:</h3>
          </div>
          <ul className="list-disc list-inside space-y-1">
            {errors.map((error, index) => (
              <li key={index} className="text-red-700 text-sm">{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
              <Receipt className="w-6 h-6" />
              Journal Entries
            </h1>
            <nav className="text-sm text-gray-500 mt-1">
              Accounting / Journal Entries / New Entry
            </nav>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Clipboard className="w-4 h-4 mr-2" />
                Templates
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Journal Entry Templates</DialogTitle>
                <DialogDescription>
                  Choose a template to quickly create common journal entries
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                {TEMPLATES.map((template) => (
                  <Card 
                    key={template.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => applyTemplate(template)}
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">{template.title}</CardTitle>
                      <CardDescription className="text-sm">
                        {template.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </DialogContent>
          </Dialog>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <History className="w-4 h-4 mr-2" />
                          Recent
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl">
                        <DialogHeader>
                          <DialogTitle>Recent Journal Entries</DialogTitle>
                          <DialogDescription>
                            View and copy from your recent journal entries
                          </DialogDescription>
                        </DialogHeader>
                        <div className="mt-4 max-h-96 overflow-y-auto">
                          {recentEntriesLoading ? (
                            <div className="flex items-center justify-center py-8">
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
                                Loading recent entries...
                              </div>
                            </div>
                          ) : recentEntries.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                              No recent entries found
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {recentEntries.map((entry) => (
                                <Card 
                                  key={entry.id}
                                  className="cursor-pointer hover:shadow-md transition-shadow"
                                  onClick={() => copyFromRecentEntry(entry)}
                                >
                                  <CardContent className="p-4">
                                    <div className="flex items-center justify-between gap-2">
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                          <span className="font-medium truncate" title={entry.entryNumber}>
                                            {entry.entryNumber.length > 15 ? `${entry.entryNumber.substring(0, 15)}...` : entry.entryNumber}
                                          </span>
                                          <Badge variant="outline" className="text-xs flex-shrink-0">
                                            {entry.status}
                                          </Badge>
                                        </div>
                                        <p className="text-sm text-gray-600 mt-1 truncate">{entry.description}</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                          {new Date(entry.date).toLocaleDateString()}
                                        </p>
                                      </div>
                                      <div className="text-right flex-shrink-0">
                                        <span className="font-semibold">${(Number(entry.amount) || 0).toFixed(2)}</span>
                                        <p className="text-xs text-gray-500">Click to copy</p>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
          <Button variant="outline" size="lg" onClick={saveDraft} disabled={posting}>
            <Save className="w-4 h-4 mr-2" />
            {posting ? 'Saving...' : 'Save Draft'}
          </Button>
          <Button size="lg" onClick={postEntry} disabled={posting || !isBalanced()}>
            {posting ? (
              <>
                <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                Posting...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Post Entry
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-3 space-y-6">
              {/* Entry Information Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Entry Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="entryNumber">Journal Entry Number</Label>
                      <Input
                        id="entryNumber"
                        value={entryNumber}
                        onChange={(e) => setEntryNumber(e.target.value)}
                        readOnly
                        className="bg-gray-50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="entryType">Entry Type</Label>
                      <Select value={entryType} onValueChange={setEntryType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="GENERAL">General Journal</SelectItem>
                          <SelectItem value="ADJUSTING">Adjusting Entry</SelectItem>
                          <SelectItem value="CLOSING">Closing Entry</SelectItem>
                          <SelectItem value="REVERSING">Reversing Entry</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="transactionDate">Transaction Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !date && "text-muted-foreground"
                            )}
                          >
                            <CalendarDays className="mr-2 h-4 w-4" />
                            {date ? format(date, "MMM dd, yyyy") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={date}
                            onSelect={(newDate) => newDate && setDate(newDate)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postingDate">Posting Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !postingDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarDays className="mr-2 h-4 w-4" />
                            {postingDate ? format(postingDate, "MMM dd, yyyy") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={postingDate}
                            onSelect={(newDate) => newDate && setPostingDate(newDate)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reference">Reference Number</Label>
                      <Input
                        id="reference"
                        placeholder="External reference"
                        value={reference}
                        onChange={(e) => setReference(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                        <FileText className="w-3 h-3 mr-1" />
                        Draft
                      </Badge>
                    </div>
                  </div>
                  <div className="mt-6 space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      placeholder="Enter journal entry description"
                      value={memo}
                      onChange={(e) => setMemo(e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Journal Lines Card */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Journal Entry Lines
                    </CardTitle>
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium",
                        isBalanced() 
                          ? "bg-green-50 text-green-700 border border-green-200" 
                          : "bg-red-50 text-red-700 border border-red-200"
                      )}>
                        {isBalanced() ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <AlertTriangle className="w-4 h-4" />
                        )}
                        {isBalanced() ? 'Balanced' : `Out of Balance: $${getDifference().toFixed(2)}`}
                      </div>
                      <Button size="sm" onClick={autoBalance}>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Auto Balance
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto max-w-full">
                    <table className="w-full min-w-[800px]">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">#</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[280px]">Account</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">Description</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">Debit</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">Credit</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {lines.map((line, index) => (
                          <tr key={line.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium text-gray-500 text-center">
                              {index + 1}
                            </td>
                            <td className="px-4 py-3">
                              <Select
                                value={line.accountId}
                                onValueChange={(value) => {
                                  const account = accounts.find(acc => acc.id === value)
                                  updateLine(line.id, { 
                                    accountId: value, 
                                    accountName: account?.name,
                                    accountType: typeof account?.type === 'string' ? account.type : account?.type?.name
                                  })
                                }}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select Account" />
                                </SelectTrigger>
                                <SelectContent>
                                  {accountsLoading ? (
                                    <SelectItem value="loading" disabled>
                                      <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
                                        Loading accounts...
                                      </div>
                                    </SelectItem>
                                  ) : accounts.length === 0 ? (
                                    <SelectItem value="no-accounts" disabled>
                                      No accounts available
                                    </SelectItem>
                                  ) : (
                                    accounts.map((account) => (
                                      <SelectItem key={account.id} value={account.id}>
                                        <div className="flex items-center justify-between w-full">
                                          <div className="flex flex-col">
                                            <span>{account.name}</span>
                                            <span className="text-xs text-gray-500">
                                              {typeof account.type === 'string' ? account.type : account.type?.name} - {account.code}
                                            </span>
                                          </div>
                                        </div>
                                      </SelectItem>
                                    ))
                                  )}
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="px-4 py-3">
                              <Input
                                placeholder="Line description"
                                value={line.memo || ''}
                                onChange={(e) => updateLine(line.id, { memo: e.target.value })}
                                className="w-full"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                value={line.debit || ''}
                                onChange={(e) => updateLine(line.id, { 
                                  debit: e.target.value ? Number(e.target.value) : 0,
                                  credit: 0
                                })}
                                className="text-right font-mono"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                value={line.credit || ''}
                                onChange={(e) => updateLine(line.id, { 
                                  credit: e.target.value ? Number(e.target.value) : 0,
                                  debit: 0
                                })}
                                className="text-right font-mono"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => duplicateLine(line.id)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeLine(line.id)}
                                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                  disabled={lines.length <= 2}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="p-4 border-t border-gray-200">
                    <Button 
                      variant="outline" 
                      onClick={addLine}
                      className="w-full border-dashed border-2 border-gray-300 hover:border-primary-400 hover:bg-primary-50"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add New Line
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Totals Card */}
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-200">
                        <span className="text-sm text-gray-600">Total Debits:</span>
                        <span className="font-mono font-medium text-green-600">
                          ${getTotalDebits().toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-200">
                        <span className="text-sm text-gray-600">Total Credits:</span>
                        <span className="font-mono font-medium text-red-600">
                          ${getTotalCredits().toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-200">
                        <span className="text-sm text-gray-600">Difference:</span>
                        <span className={cn(
                          "font-mono font-medium",
                          isBalanced() ? "text-green-600" : "text-red-600"
                        )}>
                          ${getDifference().toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-3">
                        <span className="text-sm text-gray-600">Status:</span>
                        <span className={cn(
                          "font-medium",
                          isBalanced() ? "text-green-600" : "text-red-600"
                        )}>
                          {isBalanced() ? 'Balanced' : 'Unbalanced'}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* AI Assistant */}
              <Card className="bg-gradient-to-br from-purple-600 to-blue-600 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Bot className="w-5 h-5" />
                    AI Assistant
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {aiSuggestions.map((suggestion, index) => (
                    <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                      <div className="text-sm font-medium mb-1">
                        <strong>Suggestion:</strong> {suggestion}
                      </div>
                      <div className="text-xs opacity-80">
                        Confidence: {92 - index * 5}%
                      </div>
                    </div>
                  ))}
                  <Button 
                    size="sm" 
                    className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30"
                    onClick={applyAiSuggestions}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Apply AI Suggestions
                  </Button>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start" onClick={autoBalance}>
                    <Scale className="w-4 h-4 mr-2" />
                    Auto-Balance Entry
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Copy className="w-4 h-4 mr-2" />
                    Duplicate Entry
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <ArrowLeftRight className="w-4 h-4 mr-2" />
                    Reverse Entry
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Download className="w-4 h-4 mr-2" />
                    Export to PDF
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Validate Entry
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Entries */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Recent Entries
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recentEntriesLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
                        Loading...
                      </div>
                    </div>
                  ) : recentEntries.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                      No recent entries found
                    </div>
                  ) : (
                    recentEntries.map((entry: any) => (
                      <div 
                        key={entry.id}
                        className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-primary-300 hover:shadow-sm transition-all"
                        onClick={() => copyFromRecentEntry(entry)}
                      >
                        <div className="flex justify-between items-center mb-1 gap-2">
                          <span className="font-medium text-gray-900 truncate flex-1 min-w-0" title={entry.entryNumber}>
                            {entry.entryNumber.length > 12 ? `${entry.entryNumber.substring(0, 12)}...` : entry.entryNumber}
                          </span>
                          <span className="font-mono font-medium text-green-600 flex-shrink-0">
                            ${(Number(entry.amount) || 0).toFixed(2)}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 mb-1">{entry.description}</div>
                        <div className="text-xs text-gray-400">{entry.date}</div>
                        <div className="text-xs text-blue-600 mt-1">Click to copy</div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    
    </PageLayout>
  )
}
