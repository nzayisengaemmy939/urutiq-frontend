'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import apiService from '@/lib/api'
import { PageLayout } from '@/components/page-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  CalendarDays,
  DollarSign, 
  Plus, 
  Minus, 
  HelpCircle, 
  BookOpen, 
  Calculator,
  Save,
  Eye,
  Trash2,
  Copy,
  X,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  FileText,
  Building,
  MapPin,
  Briefcase,
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
import { cn } from '@/lib/utils'

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
  type: string
  code: string
  description?: string
}

interface JournalEntry {
  id: string
  number: string
  date: string
  description: string
  reference?: string
  status: 'draft' | 'posted'
  lines: Line[]
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
  }
]

const RECENT_ENTRIES = [
  {
    id: 'JE-2025-052',
    description: 'Monthly rent payment',
    amount: 2500,
    date: '2025-06-22'
  },
  {
    id: 'JE-2025-051',
    description: 'Utility expense',
    amount: 850,
    date: '2025-06-21'
  },
  {
    id: 'JE-2025-050',
    description: 'Equipment purchase',
    amount: 3200,
    date: '2025-06-20'
  }
]

export default function NewJournalEntryPage() {
  const router = useRouter()
  const [companyId, setCompanyId] = useState<string>('seed-company-1')
  const [date, setDate] = useState<Date>(new Date())
  const [postingDate, setPostingDate] = useState<Date>(new Date())
  const [memo, setMemo] = useState<string>('')
  const [reference, setReference] = useState<string>('')
  const [entryType, setEntryType] = useState<string>('GENERAL')
  const [entryNumber, setEntryNumber] = useState<string>('JE-2025-001')
  const [lines, setLines] = useState<Line[]>([
    { id: '1', accountId: '5000', accountName: 'Office Expenses', debit: 1500, credit: 0, memo: 'Office supplies purchase' },
    { id: '2', accountId: '2100', accountName: 'Accounts Payable', debit: 0, credit: 0, memo: 'Amount owed to supplier' },
  ])
  const [posting, setPosting] = useState<boolean>(false)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [showTemplates, setShowTemplates] = useState<boolean>(false)
  const [errors, setErrors] = useState<string[]>([])
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([])
  const nextLineId = useRef(3)

  // Load accounts on component mount
  useEffect(() => {
    loadAccounts()
    generateAiSuggestions()
  }, [lines])

  const loadAccounts = async () => {
    try {
      // Mock accounts for demo - replace with actual API call
      const mockAccounts: Account[] = [
        { id: '1110', name: 'Cash and Cash Equivalents', type: 'Asset', code: '1110', description: 'Cash on hand and in bank' },
        { id: '1120', name: 'Accounts Receivable', type: 'Asset', code: '1120', description: 'Money owed by customers' },
        { id: '1200', name: 'Inventory', type: 'Asset', code: '1200', description: 'Products for sale' },
        { id: '1400', name: 'Accumulated Depreciation', type: 'Asset', code: '1400', description: 'Accumulated depreciation' },
        { id: '2100', name: 'Accounts Payable', type: 'Liability', code: '2100', description: 'Money owed to suppliers' },
        { id: '2200', name: 'Accrued Expenses', type: 'Liability', code: '2200', description: 'Accrued expenses' },
        { id: '3000', name: 'Revenue', type: 'Revenue', code: '3000', description: 'Income from sales' },
        { id: '4000', name: 'Equipment', type: 'Asset', code: '4000', description: 'Office equipment' },
        { id: '5000', name: 'Office Expenses', type: 'Expense', code: '5000', description: 'Office supplies and materials' },
        { id: '5100', name: 'Rent Expense', type: 'Expense', code: '5100', description: 'Monthly rent payments' },
        { id: '5200', name: 'Utilities Expense', type: 'Expense', code: '5200', description: 'Electricity, water, gas' },
        { id: '5300', name: 'Depreciation Expense', type: 'Expense', code: '5300', description: 'Depreciation expense' },
        { id: '6000', name: 'Cost of Goods Sold', type: 'Expense', code: '6000', description: 'Direct costs of products sold' },
      ]
      setAccounts(mockAccounts)
    } catch (error) {
      console.error('Failed to load accounts:', error)
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
    const newLines = template.lines.map((line: any, index: number) => ({
      id: (index + 1).toString(),
      accountId: line.accountId,
      accountName: line.accountName,
      debit: line.debit,
      credit: line.credit,
      memo: line.memo
    }))
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

    setPosting(true)
    try {
      const payload = { 
        date: format(date, 'yyyy-MM-dd'), 
        memo, 
        reference, 
        companyId, 
        lines: lines.filter(line => line.accountId && (line.debit || line.credit))
      }
      await apiService.postJournalEntry(payload)
      
      // Success - redirect to journal list with success message
      router.push('/journal?success=entry-created')
    } catch (e: any) {
      setErrors([e.message || 'Failed to create journal entry. Please try again.'])
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
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-4">
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
                <Button variant="outline" size="sm">
                  <History className="w-4 h-4 mr-2" />
                  Recent
                </Button>
                <Button variant="outline" size="lg" onClick={saveDraft} disabled={posting}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Draft
                </Button>
                <Button size="lg" onClick={postEntry} disabled={posting || !isBalanced()}>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Post Entry
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
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
                  <div className="overflow-x-auto">
                    <table className="w-full">
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
                                    accountType: account?.type
                                  })
                                }}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select Account" />
                                </SelectTrigger>
                                <SelectContent>
                                  {accounts.map((account) => (
                                    <SelectItem key={account.id} value={account.id}>
                                      <div className="flex items-center justify-between w-full">
                                        <span>{account.name}</span>
                                        <span className="text-xs text-gray-500 ml-2">
                                          {account.code}
                                        </span>
                                      </div>
                                    </SelectItem>
                                  ))}
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
                  {RECENT_ENTRIES.map((entry) => (
                    <div 
                      key={entry.id}
                      className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-primary-300 hover:shadow-sm transition-all"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium text-gray-900">{entry.id}</span>
                        <span className="font-mono font-medium text-green-600">
                          ${entry.amount.toFixed(2)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mb-1">{entry.description}</div>
                      <div className="text-xs text-gray-400">{entry.date}</div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
