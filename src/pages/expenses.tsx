'use client'

import * as React from 'react'
import { useState, useMemo, useEffect } from 'react'
import { useAuth } from '../contexts/auth-context'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useDemoAuth } from '../hooks/useDemoAuth'
import { expenseApi, chartOfAccountsApi, expenseJournalApi, purchaseApi } from '../lib/api/accounting'
import { apiService } from '../lib/api'
import { getCompanyId } from '../lib/config'
import { PageLayout } from '../components/page-layout'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Input } from '../components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog'
import { SegmentedTabs } from '../components/ui/segmented-tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../components/ui/form'
import { Textarea } from '../components/ui/textarea'
import { Progress } from '../components/ui/progress'
import { Separator } from '../components/ui/separator'
import { ReceiptCaptureModal } from '../components/receipt-capture'
import { ExpenseReportModal } from '../components/expense-report-modal'
import { ReimburseExpenseModal } from '../components/reimburse-expense-modal'
import { ExpenseMatchingModal } from '../components/expense-matching-modal'
import { EditExpenseModal } from '../components/edit-expense-modal'
import { CardCsvImportModal } from '../components/card-csv-import'
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  FolderTree,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Calendar,
  BarChart3,
  PieChart,
  Target,
  Settings,
  ChevronRight,
  ChevronDown,
  FileText,
  Building,
  Upload,
  Calculator,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  Download,
  RefreshCw,
  Check,
  X,
  FileSpreadsheet,
  Printer,
  Archive,
  BookOpen,
  Receipt,
  CreditCard,
  Banknote
} from 'lucide-react'
import { format } from 'date-fns'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
// Local page types (keeps shape independent from shared API types)
// Types
interface ExpenseCategory {
  id: string
  name: string
  description?: string
  parentId?: string
  color?: string
  icon?: string
  isActive: boolean
  taxTreatment?: 'deductible' | 'non-deductible' | 'partially_deductible'
  approvalThreshold?: number
  children: ExpenseCategory[]
  budgets: Budget[]
  createdAt: string
  updatedAt: string
}

interface Budget {
  id: string
  name: string
  description?: string
  period: 'monthly' | 'quarterly' | 'yearly'
  startDate: string
  endDate: string
  amount: number
  spentAmount: number
  isActive: boolean
  alertThreshold?: number
  category: { id: string; name: string }
  companyId?: string
  createdAt: string
  updatedAt: string
}

interface ExpenseRule {
  id: string
  name: string
  description?: string
  ruleType: 'amount_limit' | 'vendor_restriction' | 'approval_required'
  conditions: string
  actions: string
  isActive: boolean
  priority: number
  category: { id: string; name: string }
  createdAt: string
  updatedAt: string
}

interface Company {
  id: string
  name: string
}

// Validation schemas
const categorySchema = z.object({
  companyId: z.string().min(1, 'Company is required'),
  name: z.string().min(1, 'Category name is required'),
  description: z.string().optional(),
  parentId: z.string().optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
  taxTreatment: z.enum(['deductible', 'non-deductible', 'partially_deductible']).optional(),
  approvalThreshold: z.coerce.number().positive().optional()
})

const budgetSchema = z.object({
  companyId: z.string().min(1, 'Company is required'),
  categoryId: z.string().min(1, 'Category is required'),
  name: z.string().min(1, 'Budget name is required'),
  description: z.string().optional(),
  period: z.enum(['monthly', 'quarterly', 'yearly']),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  amount: z.coerce.number().positive('Amount must be positive'),
  alertThreshold: z.coerce.number().optional()
})

const ruleSchema = z.object({
  companyId: z.string().min(1, 'Company is required'),
  categoryId: z.string().min(1, 'Category is required'),
  name: z.string().min(1, 'Rule name is required'),
  description: z.string().optional(),
  ruleType: z.enum(['amount_limit', 'vendor_restriction', 'approval_required']),
  // User-friendly condition fields
  amountLimit: z.coerce.number().positive().optional(),
  blockedVendors: z.string().optional(),
  requireApproval: z.boolean().optional(),
  notifyManager: z.boolean().optional(),
  autoReject: z.boolean().optional(),
  // Legacy JSON fields (hidden, auto-generated)
  conditions: z.string().optional(),
  actions: z.string().optional(),
  priority: z.coerce.number().int().min(1, 'Priority must be at least 1')
})

// Journal Entry Indicator Component
const ExpenseJournalIndicator = ({ expenseId }: { expenseId: string }) => {
  const { data: journalEntries, isLoading } = useQuery({
    queryKey: ['expense-journal-entries', expenseId],
    queryFn: () => expenseJournalApi.getJournalEntries(expenseId),
    enabled: !!expenseId
  })

  if (isLoading) {
    return (
      <div className="w-4 h-4 animate-pulse bg-gray-200 rounded"></div>
    )
  }

  const hasEntries = journalEntries && journalEntries.length > 0

  return (
    <div 
      className={`w-2 h-2 rounded-full ${
        hasEntries ? 'bg-green-500' : 'bg-gray-300'
      }`}
      title={hasEntries ? 'Journal entries exist' : 'No journal entries'}
    />
  )
}

// Journal Entries Component
const ExpenseJournalEntries = ({ expenseId }: { expenseId: string }) => {
  const { data: journalEntries, isLoading, error } = useQuery({
    queryKey: ['expense-journal-entries', expenseId],
    queryFn: () => expenseJournalApi.getJournalEntries(expenseId),
    enabled: !!expenseId
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-4 text-red-600">
        <p>Error loading journal entries</p>
      </div>
    )
  }

  if (!journalEntries || journalEntries.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No journal entries found for this expense</p>
        <p className="text-sm">Journal entries are created automatically when expenses are approved</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {journalEntries.map((entry, index) => (
        <Card key={entry.id} className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="h-4 w-4 text-blue-600" />
                <CardTitle className="text-sm font-medium">
                  Journal Entry #{index + 1}
                </CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={entry.status === 'POSTED' ? 'default' : 'secondary'}>
                  {entry.status}
                </Badge>
                <span className="text-xs text-gray-500">
                  {format(new Date(entry.date), 'MMM dd, yyyy')}
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-600">{entry.memo}</p>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {entry.lines?.map((line, lineIndex) => (
                <div key={lineIndex} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {line.debit > 0 ? (
                        <div className="flex items-center gap-1 text-red-600">
                          <ArrowUp className="h-3 w-3" />
                          <span className="text-xs font-medium">DR</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-green-600">
                          <ArrowDown className="h-3 w-3" />
                          <span className="text-xs font-medium">CR</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{line.account?.name}</p>
                      <p className="text-xs text-gray-500">{line.account?.code}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      ${(line.debit || line.credit || 0).toLocaleString()}
                    </p>
                    {line.memo && (
                      <p className="text-xs text-gray-500">{line.memo}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {entry.createdBy && (
              <div className="mt-3 pt-2 border-t text-xs text-gray-500">
                Created by {entry.createdBy.name || entry.createdBy.email} on{' '}
                {format(new Date(entry.createdAt), 'MMM dd, yyyy HH:mm')}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default function ExpensesPage() {
  const { ready: authReady } = useDemoAuth('expenses-page')
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('categories')
  const [expenseStatus, setExpenseStatus] = useState<string>('all')
  const [expenseCategoryId, setExpenseCategoryId] = useState<string>('')
  const [expenseStartDate, setExpenseStartDate] = useState<string>('')
  const [expenseEndDate, setExpenseEndDate] = useState<string>('')
  const [expenseDepartment, setExpenseDepartment] = useState<string>('')
  const [expenseProject, setExpenseProject] = useState<string>('')
  const [isCreateCategoryOpen, setIsCreateCategoryOpen] = useState(false)
  const [isCreateBudgetOpen, setIsCreateBudgetOpen] = useState(false)
  const [isViewBudgetOpen, setIsViewBudgetOpen] = useState(false)
  const [isCreateRuleOpen, setIsCreateRuleOpen] = useState(false)
  const [editingRule, setEditingRule] = useState<ExpenseRule | null>(null)
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null)
  const [editingCategory, setEditingCategory] = useState<ExpenseCategory | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory | null>(null)
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [receiptOpen, setReceiptOpen] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)
  const [reimburseOpen, setReimburseOpen] = useState(false)
  const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(null)
  const [selectedExpense, setSelectedExpense] = useState<any | null>(null)
  const [isViewExpenseOpen, setIsViewExpenseOpen] = useState(false)
  const [isCreateExpenseOpen, setIsCreateExpenseOpen] = useState(false)
  const [matchingOpen, setMatchingOpen] = useState(false)
  const [matchingContext, setMatchingContext] = useState<{ amount?: number; date?: string; description?: string } | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<any | null>(null)
  const [cardImportOpen, setCardImportOpen] = useState(false)
  
  // Sorting and pagination state
  const [sortField, setSortField] = useState<string>('expenseDate')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [selectedExpenses, setSelectedExpenses] = useState<Set<string>>(new Set())
  const [expenseJournalEntries, setExpenseJournalEntries] = useState<Map<string, any[]>>(new Map())
  
  const queryClient = useQueryClient()

  // Company ID is managed by header component and stored in localStorage

  // Get company ID directly from localStorage (header ensures it's seed-company-1)
  const firstCompanyId = useMemo(() => {
    return getCompanyId();
  }, [])

  // Fetch company data to get the company name
  const { data: companyData, isLoading: companyLoading, error: companyError } = useQuery({
    queryKey: ['company', firstCompanyId],
    queryFn: async () => {
      return await apiService.getCompany(firstCompanyId);
    },
    enabled: !!firstCompanyId,
    retry: 2,
    retryDelay: 1000
  })

  // Get company name for display
  const companyName = companyData?.name || (companyLoading ? 'Loading...' : 'Company')

  // Fetch expense categories (uses company ID from localStorage)
  const { data: categories, isLoading: categoriesLoading } = useQuery<any>({
    queryKey: ['expense-categories', searchTerm, firstCompanyId],
    queryFn: async () => {
      const result = await expenseApi.getExpenseCategories({ companyId: firstCompanyId, q: searchTerm || undefined }) as any;
      // Handle different response formats
      if (Array.isArray(result)) return result;
      if (result?.data && Array.isArray(result.data)) return result.data;
      if (result?.items && Array.isArray(result.items)) return result.items;
      return [];
    },
    enabled: authReady && !!firstCompanyId
  })

  const { data: budgets, isLoading: budgetsLoading } = useQuery<any>({
    queryKey: ['budgets', firstCompanyId],
    queryFn: async () => {
      const result = await expenseApi.getBudgets() as any;
      // Handle different response formats
      if (Array.isArray(result)) return result;
      if (result?.data && Array.isArray(result.data)) return result.data;
      if (result?.items && Array.isArray(result.items)) return result.items;
      return [];
    },
    enabled: authReady && !!firstCompanyId
  })

  const { data: rules, isLoading: rulesLoading } = useQuery<any>({
    queryKey: ['expense-rules', firstCompanyId],
    queryFn: async () => await expenseApi.getExpenseRules() as any,
    enabled: authReady && !!firstCompanyId
  })

  const { data: analytics } = useQuery<any>({
    queryKey: ['budget-analytics'],
    queryFn: async () => await expenseApi.getBudgetAnalytics() as any
  })

  // Fetch GL accounts for expense form
  const { data: accountsData } = useQuery<any>({
    queryKey: ['gl-accounts', firstCompanyId],
    queryFn: async () => {
      const result = await chartOfAccountsApi.getAll(firstCompanyId) as any;
      return result;
    },
    enabled: authReady && !!firstCompanyId
  })

  // Fetch vendors for expense form
  const { data: vendors } = useQuery<any>({
    queryKey: ['vendors', firstCompanyId],
    queryFn: async () => {
      const result = await purchaseApi.getVendors(firstCompanyId) as any;
      // Handle different response formats
      if (Array.isArray(result)) return result;
      if (result?.data && Array.isArray(result.data)) return result.data;
      if (result?.items && Array.isArray(result.items)) return result.items;
      return [];
    },
    enabled: authReady && !!firstCompanyId
  })

  // Expenses list (loaded when expenses tab is active)
  const { data: expenses, isLoading: expensesLoading } = useQuery<any>({
    queryKey: ['expenses', expenseStatus, expenseCategoryId, expenseDepartment, expenseProject],
    enabled: activeTab === 'expenses',
    queryFn: async () => await expenseApi.getExpenses(undefined, expenseStatus === 'all' ? undefined : expenseStatus, expenseCategoryId || undefined) as any
  })

  // Fetch individual expense details
  const { data: expenseDetails, isLoading: expenseDetailsLoading } = useQuery<any>({
    queryKey: ['expense', selectedExpense?.id],
    enabled: !!selectedExpense?.id,
    queryFn: async () => await expenseApi.getExpenseById(selectedExpense.id) as any
  })

  const submitExpense = useMutation({
    mutationFn: async (id: string) => expenseApi.submitExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      toast.success('Expense submitted')
    }
  })

  const approveExpense = useMutation({
    mutationFn: async (id: string) => {
      try {
        return await expenseApi.approveExpense(id);
      } catch (error: any) {
        // Extract error message from the error response
        const errorMessage = error?.response?.data?.details || 
                           error?.response?.data?.error?.message || 
                           error?.message || 
                           'Failed to approve expense';
        throw new Error(errorMessage);
      }
    },
    onSuccess: async (data, id) => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast.success('Expense approved');
      
      // Automatically trigger accounting after approval
      try {
        const hasEntries = await hasJournalEntries(id);
        if (!hasEntries) {
          // Generate journal entry automatically after approval
          generateJournalEntry.mutate(id);
          toast.success('Journal entry will be generated automatically');
        } else {
          toast.info('Journal entries already exist for this expense');
        }
      } catch (error) {
        console.error('Failed to check journal entries:', error);
        // Don't show error toast for this, as the main approval was successful
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to approve expense');
    }
  })

  const markPaid = useMutation({
    mutationFn: async (id: string) => expenseApi.updateExpense(id, { status: 'paid' } as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      toast.success('Expense marked as paid')
    }
  })

  // Simple client-side policy enforcement using expense rules
  const checkPolicies = async (expense: any): Promise<{ ok: boolean; message?: string }> => {
    try {
      const rules = await expenseApi.getExpenseRules()
      for (const r of (rules || [])) {
        const type = r.ruleType || r.type || ''
        let conditions: any = {}
        try { conditions = r.conditions ? JSON.parse(r.conditions) : {} } catch {}
        if (type === 'amount_limit') {
          const limit = Number(conditions.amount || conditions.limit || 0)
          if (limit && Number(expense.totalAmount ?? expense.amount ?? 0) > limit) {
            return { ok: false, message: `Amount exceeds policy limit of ${limit}` }
          }
        }
        if (type === 'vendor_restriction') {
          const blocked = (conditions.vendors || conditions.blocked || []) as string[]
          const name = expense.vendor?.name || expense.vendorName || ''
          if (Array.isArray(blocked) && blocked.some(v => v && name && name.toLowerCase().includes(String(v).toLowerCase()))) {
            return { ok: false, message: `Vendor restricted by policy` }
          }
        }
        if (type === 'approval_required') {
          // If a rule explicitly requires approval, block direct submit to paid/approved paths
          // Here we allow submit (moves to submitted) but prevent direct approve if not yet reviewed
          // Enforcement handled in handlers
        }
      }
    } catch {}
    return { ok: true }
  }

  const handleSubmitExpense = async (e: any) => {
    const res = await checkPolicies(e)
    if (!res.ok) { toast.error(res.message || 'Policy violation'); return }
    submitExpense.mutate(e.id)
  }

  const handleApproveExpense = async (e: any) => {
    try {
      const rules = await expenseApi.getExpenseRules()
      const requiresApproval = (rules || []).some((r: any) => (r.ruleType || r.type) === 'approval_required')
      const role = (user as any)?.role || 'employee'
      const isApprover = role === 'admin' || role === 'accountant'
      if (requiresApproval && !isApprover) {
        toast.error('Approval requires an approver role')
        return
      }
    } catch {}
    approveExpense.mutate(e.id)
  }

  // Export and bulk operations functions
  const exportToCSV = (expensesToExport: any[]) => {
    if (expensesToExport.length === 0) {
      toast.error('No expenses to export')
      return
    }

    const headers = ['Date', 'Description', 'Category', 'Vendor', 'Amount', 'Currency', 'Tax', 'Total', 'Status', 'Payment Method', 'Reference', 'Department', 'Project']
    const rows = expensesToExport.map(e => [
      e.expenseDate ? format(new Date(e.expenseDate), 'yyyy-MM-dd') : '',
      e.description || '',
      e.category?.name || '',
      (e as any).vendorName || '',
      Number(e.amount || 0).toFixed(2),
      e.currency || 'USD',
      Number((e as any).taxAmount || 0).toFixed(2),
      Number(e.totalAmount || e.amount || 0).toFixed(2),
      e.status || 'draft',
      (e as any).paymentMethod || '',
      (e as any).referenceNumber || '',
      (e as any).department || '',
      (e as any).project || ''
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `expenses_${format(new Date(), 'yyyy-MM-dd_HHmmss')}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast.success(`Exported ${expensesToExport.length} expense(s) to CSV`)
  }

  const exportToExcel = (expensesToExport: any[]) => {
    if (expensesToExport.length === 0) {
      toast.error('No expenses to export')
      return
    }

    // Create HTML table for Excel
    const headers = ['Date', 'Description', 'Category', 'Vendor', 'Amount', 'Currency', 'Tax', 'Total', 'Status', 'Payment Method', 'Reference', 'Department', 'Project']
    const rows = expensesToExport.map(e => [
      e.expenseDate ? format(new Date(e.expenseDate), 'yyyy-MM-dd') : '',
      e.description || '',
      e.category?.name || '',
      (e as any).vendorName || '',
      Number(e.amount || 0).toFixed(2),
      e.currency || 'USD',
      Number((e as any).taxAmount || 0).toFixed(2),
      Number(e.totalAmount || e.amount || 0).toFixed(2),
      e.status || 'draft',
      (e as any).paymentMethod || '',
      (e as any).referenceNumber || '',
      (e as any).department || '',
      (e as any).project || ''
    ])

    const htmlTable = `
      <html xmlns:x="urn:schemas-microsoft-com:office:excel">
        <head>
          <meta charset="UTF-8">
          <xml>
            <x:ExcelWorkbook>
              <x:ExcelWorksheets>
                <x:ExcelWorksheet>
                  <x:Name>Expenses</x:Name>
                  <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
                </x:ExcelWorksheet>
              </x:ExcelWorksheets>
            </x:ExcelWorkbook>
          </xml>
        </head>
        <body>
          <table border="1">
            <thead>
              <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
            </thead>
            <tbody>
              ${rows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `

    const blob = new Blob([htmlTable], { type: 'application/vnd.ms-excel' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `expenses_${format(new Date(), 'yyyy-MM-dd_HHmmss')}.xls`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast.success(`Exported ${expensesToExport.length} expense(s) to Excel`)
  }

  const printExpenses = (expensesToPrint: any[]) => {
    if (expensesToPrint.length === 0) {
      toast.error('No expenses to print')
      return
    }

    const printWindow = window.open('', '', 'height=800,width=1000')
    if (!printWindow) {
      toast.error('Please allow popups to print')
      return
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Expenses Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #333; border-bottom: 2px solid #10b981; padding-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #10b981; color: white; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .total { font-weight: bold; background-color: #e0f2f1; }
            .header-info { margin-bottom: 20px; }
            @media print {
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header-info">
            <h1>Expenses Report</h1>
            <p><strong>Generated:</strong> ${format(new Date(), 'MMMM dd, yyyy - hh:mm a')}</p>
            <p><strong>Total Expenses:</strong> ${expensesToPrint.length}</p>
            <p><strong>Total Amount:</strong> $${expensesToPrint.reduce((sum, e) => sum + Number(e.totalAmount || e.amount || 0), 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>Vendor</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${expensesToPrint.map(e => `
                <tr>
                  <td>${e.expenseDate ? format(new Date(e.expenseDate), 'MMM dd, yyyy') : '-'}</td>
                  <td>${e.description || ''}</td>
                  <td>${e.category?.name || 'Uncategorized'}</td>
                  <td>${(e as any).vendorName || '-'}</td>
                  <td>${e.currency || 'USD'} $${Number(e.totalAmount || e.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td>${e.status || 'draft'}</td>
                </tr>
              `).join('')}
              <tr class="total">
                <td colspan="4" style="text-align: right;"><strong>TOTAL:</strong></td>
                <td colspan="2"><strong>$${expensesToPrint.reduce((sum, e) => sum + Number(e.totalAmount || e.amount || 0), 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></td>
              </tr>
            </tbody>
          </table>
        </body>
      </html>
    `

    printWindow.document.write(htmlContent)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
    }, 250)

    toast.success(`Printing ${expensesToPrint.length} expense(s)`)
  }

  const handleBulkApprove = async () => {
    if (selectedExpenses.size === 0) {
      toast.error('No expenses selected')
      return
    }

    try {
      const rules = await expenseApi.getExpenseRules()
      const requiresApproval = (rules || []).some((r: any) => (r.ruleType || r.type) === 'approval_required')
      const role = (user as any)?.role || 'employee'
      const isApprover = role === 'admin' || role === 'accountant'
      if (requiresApproval && !isApprover) {
        toast.error('Bulk approval requires an approver role')
        return
      }

      const expenseIds = Array.from(selectedExpenses)
      let successCount = 0
      let errorCount = 0

      for (const id of expenseIds) {
        try {
          await approveExpense.mutateAsync(id)
          successCount++
        } catch (error) {
          errorCount++
        }
      }

      setSelectedExpenses(new Set())
      queryClient.invalidateQueries({ queryKey: ['expenses'] })

      if (errorCount === 0) {
        toast.success(`Approved ${successCount} expense(s)`)
      } else {
        toast.warning(`Approved ${successCount} expense(s), ${errorCount} failed`)
      }
    } catch (error) {
      toast.error('Failed to bulk approve expenses')
    }
  }

  const handleBulkReject = async () => {
    if (selectedExpenses.size === 0) {
      toast.error('No expenses selected')
      return
    }

    const expenseIds = Array.from(selectedExpenses)
    let successCount = 0
    let errorCount = 0

    for (const id of expenseIds) {
      try {
        await updateExpense.mutateAsync({ id, data: { status: 'rejected' } })
        successCount++
      } catch (error) {
        errorCount++
      }
    }

    setSelectedExpenses(new Set())
    queryClient.invalidateQueries({ queryKey: ['expenses'] })

    if (errorCount === 0) {
      toast.success(`Rejected ${successCount} expense(s)`)
    } else {
      toast.warning(`Rejected ${successCount} expense(s), ${errorCount} failed`)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedExpenses.size === 0) {
      toast.error('No expenses selected')
      return
    }

    if (!confirm(`Are you sure you want to delete ${selectedExpenses.size} expense(s)? This action cannot be undone.`)) {
      return
    }

    const expenseIds = Array.from(selectedExpenses)
    let successCount = 0
    let errorCount = 0

    for (const id of expenseIds) {
      try {
        await deleteExpense.mutateAsync(id)
        successCount++
      } catch (error) {
        errorCount++
      }
    }

    setSelectedExpenses(new Set())
    queryClient.invalidateQueries({ queryKey: ['expenses'] })

    if (errorCount === 0) {
      toast.success(`Deleted ${successCount} expense(s)`)
    } else {
      toast.warning(`Deleted ${successCount} expense(s), ${errorCount} failed`)
    }
  }

  // Mutations
  const createCategory = useMutation({
    mutationFn: async (data: any) => expenseApi.createExpenseCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense-categories'] })
      queryClient.invalidateQueries({ queryKey: ['budget-analytics'] }) // Invalidate analytics to update count
      setIsCreateCategoryOpen(false)
      toast.success('Expense category created successfully')
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.error || 'Failed to create expense category'
      toast.error(errorMessage)
    }
  })

  const updateCategory = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => expenseApi.updateExpenseCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense-categories'] })
      queryClient.invalidateQueries({ queryKey: ['budget-analytics'] }) // Invalidate analytics to update count
      setIsCreateCategoryOpen(false)
      setEditingCategory(null)
      toast.success('Expense category updated successfully')
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.error || 'Failed to update expense category'
      toast.error(errorMessage)
    }
  })

  const createBudget = useMutation({
    mutationFn: async (data: any) => expenseApi.createBudget(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
      queryClient.invalidateQueries({ queryKey: ['budget-analytics'] })
      setIsCreateBudgetOpen(false)
      setEditingBudget(null)
      toast.success('Budget created successfully')
    },
    onError: (error) => {
      toast.error('Failed to create budget')
    }
  })

  const updateBudget = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => expenseApi.updateBudget(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
      queryClient.invalidateQueries({ queryKey: ['budget-analytics'] })
      setIsCreateBudgetOpen(false)
      setEditingBudget(null)
      toast.success('Budget updated successfully')
    },
    onError: (error) => {
      toast.error('Failed to update budget')
    }
  })

  const createRule = useMutation({
    mutationFn: async (data: any) => expenseApi.createExpenseRule(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense-rules'] })
      setIsCreateRuleOpen(false)
      toast.success('Expense rule created successfully')
    },
    onError: (error) => {
      toast.error('Failed to create expense rule')
    }
  })

  const updateRule = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => expenseApi.updateExpenseRule(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense-rules'] })
      setIsCreateRuleOpen(false)
      setEditingRule(null)
      toast.success('Expense rule updated successfully')
    },
    onError: (error) => {
      toast.error('Failed to update expense rule')
    }
  })
  
  const createExpense = useMutation({
    mutationFn: async (data: any) => {
      return await expenseApi.createExpense({
        ...data,
        companyId: data.companyId || getCompanyId()
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      queryClient.invalidateQueries({ queryKey: ['budget-analytics'] })
      setIsCreateExpenseOpen(false)
      toast.success('Expense created successfully')
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.error || 'Failed to create expense'
      toast.error(errorMessage)
    }
  })

  const deleteRule = useMutation({
    mutationFn: async (id: string) => expenseApi.deleteExpenseRule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense-rules'] })
      toast.success('Expense rule deleted')
    },
    onError: () => toast.error('Failed to delete expense rule')
  })

  const updateExpense = useMutation({
    mutationFn: async (data: any) => expenseApi.updateExpense(data.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      setEditOpen(false)
      setSelectedExpense(null)
      toast.success('Expense updated successfully')
    },
    onError: (error: any) => {
      // Handle budget exceeded error
      if (error.message?.startsWith('Budget exceeded:')) {
        toast.error(error.message, { duration: 10000 })
      } else if (error?.response?.data?.error?.startsWith('Budget exceeded:')) {
        toast.error(error.response.data.error, { duration: 10000 })
      } else {
        const errorMessage = error?.response?.data?.error || 'Failed to update expense'
        toast.error(errorMessage)
      }
    }
  })

  // Helper function to check if expense has journal entries
  const hasJournalEntries = async (expenseId: string): Promise<boolean> => {
    try {
      const entries = await expenseJournalApi.getJournalEntries(expenseId)
      return entries && entries.length > 0
    } catch (error) {
      return false
    }
  }

  const generateJournalEntry = useMutation({
    mutationFn: async (expenseId: string) => {
      // First check if journal entries already exist
      const existingEntries = await expenseJournalApi.getJournalEntries(expenseId)
      if (existingEntries && existingEntries.length > 0) {
        throw new Error('Journal entries already exist for this expense')
      }
      
      // Get the expense details
      const expense = await expenseApi.getExpenseById(expenseId)
      if (!expense) {
        throw new Error('Expense not found')
      }
      
      // Create journal entry by updating the expense (this will trigger journal creation)
      return await expenseApi.updateExpense(expenseId, { 
        ...expense, 
        status: expense.status === 'draft' ? 'submitted' : expense.status 
      })
    },
    onSuccess: (data, expenseId) => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      queryClient.invalidateQueries({ queryKey: ['expense-journal-entries', expenseId] })
      toast.success('Journal entry generated successfully')
    },
    onError: (error: any) => {
      const errorMessage = error?.message || 'Failed to generate journal entry'
      toast.error(errorMessage)
    }
  })

  // Form setup
  const categoryForm = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: {}
  })

  const expenseForm = useForm({
    resolver: zodResolver(z.object({
      companyId: z.string().min(1, 'Company is required'),
      categoryId: z.string().min(1, 'Category is required'),
      budgetId: z.string().optional(), // Optional budget selection
      description: z.string().min(1, 'Description is required'),
      amount: z.coerce.number().positive('Amount must be positive'),
      expenseDate: z.string().min(1, 'Expense date is required'),
      vendorId: z.string().optional(),
      vendorName: z.string().optional(),
      notes: z.string().optional(),
      department: z.string().optional(),
      project: z.string().optional(),
      // Enhanced accounting fields
      accountId: z.string().optional(), // GL Account
      referenceNumber: z.string().optional(), // Invoice/Receipt #
      paymentMethod: z.string().optional(), // Payment method
      currency: z.string().optional(),
      taxRate: z.coerce.number().min(0).max(100).optional(), // Tax percentage
      taxAmount: z.coerce.number().min(0).optional(),
      isBillable: z.boolean().optional(),
      isRecurring: z.boolean().optional(),
      recurringPeriod: z.string().optional(),
      mileage: z.coerce.number().min(0).optional(),
      mileageRate: z.coerce.number().min(0).optional()
    })),
    defaultValues: {
      companyId: '',
      categoryId: '',
      budgetId: 'auto', // Default to auto-select
      description: '',
      amount: 0,
      expenseDate: new Date().toISOString().split('T')[0],
      vendorId: '',
      vendorName: '',
      currency: 'USD',
      paymentMethod: '',
      isBillable: false,
      isRecurring: false,
      notes: '',
      department: '',
      project: ''
    }
  })

  const budgetForm = useForm({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      period: 'monthly' as const
    }
  })

  // Initialize form when editing budget changes
  useEffect(() => {
    if (editingBudget) {
      budgetForm.reset({
        companyId: (editingBudget as any).companyId || getCompanyId(), // ✅ Use getCompanyId() as fallback
        categoryId: editingBudget.category?.id || '',
        name: editingBudget.name || '',
        description: editingBudget.description || '',
        period: editingBudget.period || 'monthly',
        startDate: editingBudget.startDate || '',
        endDate: editingBudget.endDate || '',
        amount: editingBudget.amount || 0,
        alertThreshold: editingBudget.alertThreshold || 80
      })
    } else {
      budgetForm.reset({
        companyId: getCompanyId(), // ✅ Set companyId for new budgets
        period: 'monthly' as const
      })
    }
  }, [editingBudget, budgetForm])

  const ruleForm = useForm({
    resolver: zodResolver(ruleSchema),
    defaultValues: {
      companyId: '',
      categoryId: '',
      name: '',
      description: '',
      ruleType: 'approval_required' as const,
      amountLimit: undefined,
      blockedVendors: '',
      requireApproval: true,
      notifyManager: false,
      autoReject: false,
      conditions: '',
      actions: '',
      priority: 1
    }
  })

  // Computed values
  const filteredCategories = React.useMemo(() => {
    try {
  if (!categories) return []
  // API may return an array or a paginated object { items: [] } or { data: [] }
  if (Array.isArray(categories)) return categories
  if (categories.items) return categories.items
  if ((categories as any).data) return (categories as any).data
  return []
    } catch (error) {
      return []
    }
  }, [categories])

  const filteredBudgets = React.useMemo(() => {
    try {
  if (!budgets) return []
  if (Array.isArray(budgets)) return budgets
  if (budgets.items) return budgets.items
  if ((budgets as any).data) return (budgets as any).data
  return []
    } catch (error) {
      return []
    }
  }, [budgets])

  const filteredRules = React.useMemo(() => {
    try {
  if (!rules) return []
  if (Array.isArray(rules)) return rules
  if (rules.items) return rules.items
  if ((rules as any).data) return (rules as any).data
  return []
    } catch (error) {
      return []
    }
  }, [rules])

  const glAccounts = React.useMemo(() => {
    try {
      if (!accountsData) return []
      if (Array.isArray(accountsData)) return accountsData
      if (accountsData.accounts) return accountsData.accounts
      if (accountsData.items) return accountsData.items
      if ((accountsData as any).data) return (accountsData as any).data
      return []
    } catch (error) {
      return []
    }
  }, [accountsData])

  // Filter expense accounts (typically type EXPENSE) - show only expense accounts
  const expenseAccounts = React.useMemo(() => {
    return glAccounts.filter((acc: any) => {
      // Check if account type is EXPENSE
      const accountType = acc.type?.code || acc.accountType?.code;
      return accountType === 'EXPENSE' && acc.isActive !== false;
    });
  }, [glAccounts])

  const getTaxTreatmentColor = (treatment?: string) => {
    switch (treatment) {
      case 'deductible': return 'bg-green-100 text-green-800'
      case 'non-deductible': return 'bg-red-100 text-red-800'
      case 'partially_deductible': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getBudgetUtilization = (budget: Budget) => {
    return (budget.spentAmount / budget.amount) * 100
  }

  const getBudgetStatus = (budget: Budget) => {
    const utilization = getBudgetUtilization(budget)
    if (utilization >= 100) return 'over-budget'
    if (utilization >= 80) return 'near-limit'
    return 'within-budget'
  }

  const getBudgetStatusColor = (status: string) => {
    switch (status) {
      case 'over-budget': return 'bg-red-100 text-red-800'
      case 'near-limit': return 'bg-yellow-100 text-yellow-800'
      case 'within-budget': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const toggleCategoryExpansion = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }

  const onSubmitCategory = (data: any) => {
    // Convert "none" to undefined for parentId
    if (data.parentId === 'none') {
      data.parentId = undefined
    }
    
    if (editingCategory) {
      // Update existing category
      updateCategory.mutate({ id: editingCategory.id, data })
    } else {
      // Create new category
      createCategory.mutate(data)
    }
  }

  const onSubmitBudget = (data: any) => {
    if (editingBudget) {
      // Update existing budget
      updateBudget.mutate({ id: editingBudget.id, data })
    } else {
      // Create new budget
      createBudget.mutate(data)
    }
  }

  const onSubmitRule = (data: any) => {
    // Convert user-friendly fields to JSON
    const processedData = { ...data }
    
    // Generate conditions JSON based on rule type
    switch (data.ruleType) {
      case 'amount_limit':
        processedData.conditions = JSON.stringify({
          amount: data.amountLimit || 0
        })
        break
      case 'vendor_restriction':
        processedData.conditions = JSON.stringify({
          vendors: data.blockedVendors ? data.blockedVendors.split(',').map((v: string) => v.trim()) : []
        })
        break
      case 'approval_required':
        processedData.conditions = JSON.stringify({})
        break
    }
    
    // Generate actions JSON based on user selections
    const actions: any = {}
    if (data.requireApproval) actions.require_approval = true
    if (data.notifyManager) actions.notify_manager = true
    if (data.autoReject) actions.auto_reject = true
    
    processedData.actions = JSON.stringify(actions)
    
    // Remove user-friendly fields before sending to API
    delete processedData.amountLimit
    delete processedData.blockedVendors
    delete processedData.requireApproval
    delete processedData.notifyManager
    delete processedData.autoReject
    
    if (editingRule) {
      updateRule.mutate({ id: (editingRule as any).id, data: processedData })
    } else {
      createRule.mutate(processedData)
    }
  }

  const onSubmitExpense = (data: any) => {
    // Calculate total amount including tax if provided
    const baseAmount = Number(data.amount) || 0;
    const taxAmount = data.taxAmount || (data.taxRate ? (baseAmount * Number(data.taxRate) / 100) : 0);
    const totalAmount = baseAmount + taxAmount;
    
    // Clean up empty strings for optional foreign key fields
    const cleanedData = {
      ...data,
      taxAmount,
      totalAmount,
      // Convert empty strings to undefined for optional foreign key fields
      vendorId: data.vendorId && data.vendorId.trim() !== '' ? data.vendorId : undefined,
      accountId: data.accountId && data.accountId.trim() !== '' ? data.accountId : undefined,
      splitAccountId: data.splitAccountId && data.splitAccountId.trim() !== '' ? data.splitAccountId : undefined
    };
    
    // Create expense as draft - user can approve it later
    createExpense.mutate(cleanedData)
  }

  const renderCategoryTree = (categories: ExpenseCategory[] = [], level = 0) => {
    return (categories || []).map((category) => (
      <div key={category.id}>
        <div 
          className={`flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 ${
            level > 0 ? 'ml-6' : ''
          }`}
        >
          <div className="flex items-center space-x-3">
            {(category.children && category.children.length > 0) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleCategoryExpansion(category.id)}
              >
                {expandedCategories.has(category.id) ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </Button>
            )}
            <div 
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: (category as any).color || '#6b7280' }}
            />
            <div>
              <h4 className="font-medium">{category.name}</h4>
              {category.description && (
                <p className="text-sm text-gray-600">{category.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {(category as any).taxTreatment && (
              <Badge className={getTaxTreatmentColor((category as any).taxTreatment)}>
                {(category as any).taxTreatment}
              </Badge>
            )}
            <Badge variant={(category as any).isActive ? 'default' : 'secondary'}>
              {(category as any).isActive ? 'Active' : 'Inactive'}
            </Badge>
            <Button 
              variant="outline" 
              size="sm" 
              aria-label={`Edit category ${category.name}`}
              onClick={() => {
                setEditingCategory(category)
                categoryForm.reset({
                  companyId: (category as any).companyId || getCompanyId(),
                  name: category.name,
                  description: category.description || '',
                  parentId: category.parentId || '',
                  color: (category as any).color || '',
                  icon: (category as any).icon || '',
                  taxTreatment: (category as any).taxTreatment || 'deductible',
                  approvalThreshold: (category as any).approvalThreshold || undefined
                })
                setIsCreateCategoryOpen(true)
              }}
            >
              <Edit className="w-4 h-4" />
            </Button>
          </div>
        </div>
  {expandedCategories.has(category.id) && (category.children && category.children.length > 0) && (
          <div className="mt-2">
            {renderCategoryTree(category.children, level + 1)}
          </div>
        )}
      </div>
    ))
  }

  return (
    <PageLayout>
      <div className="space-y-8">
        {/* Enhanced Header Section */}
        <div className="bg-gradient-to-r from-cyan-50 via-blue-50 to-indigo-50 rounded-2xl p-8 border border-cyan-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <DollarSign className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                  Expense Management
                </h1>
                <p className="text-slate-600 mt-2 text-lg font-medium">
                  Track, categorize, and manage your business expenses efficiently
                </p>
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
                    <CheckCircle className="w-4 h-4" />
                    <span>System Active</span>
                  </div>
                  <div className="text-sm text-slate-500">
                    Last sync: {new Date().toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                onClick={() => setReceiptOpen(true)}
                className="h-12 px-6 bg-white hover:bg-cyan-50 border-cyan-200 hover:border-cyan-300 transition-all duration-200"
              >
                <FileText className="w-4 h-4 mr-2" />
                Scan Receipt
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setReportOpen(true)}
                className="h-12 px-6 bg-white hover:bg-blue-50 border-blue-200 hover:border-blue-300 transition-all duration-200"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Export Report
              </Button>
              <Button 
                onClick={() => setIsCreateExpenseOpen(true)}
                className="h-12 px-8 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Expense
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced Analytics Cards */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600 mb-1">Total Categories</p>
                    <p className="text-3xl font-bold text-blue-900">{analytics.totalCategories}</p>
                    <p className="text-xs text-blue-600 mt-1">Expense categories</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                    <FolderTree className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600 mb-1">Active Budgets</p>
                    <p className="text-3xl font-bold text-green-900">{analytics.activeBudgets}</p>
                    <p className="text-xs text-green-600 mt-1">Currently active</p>
                  </div>
                  <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200 hover:shadow-lg transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-teal-600 mb-1">Total Budgeted</p>
                    <p className="text-3xl font-bold text-teal-900">
                      ${analytics.totalBudgetedAmount?.toLocaleString() || '0'}
                    </p>
                    <p className="text-xs text-teal-600 mt-1">Budget allocation</p>
                  </div>
                  <div className="w-12 h-12 bg-teal-500 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-lg transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-600 mb-1">Total Spent</p>
                    <p className="text-3xl font-bold text-orange-900">
                      ${analytics.totalSpentAmount?.toLocaleString() || '0'}
                    </p>
                    <p className="text-xs text-orange-600 mt-1">Expenses incurred</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Enhanced Main Content */}
        <Card className="shadow-lg border-slate-200">
          <CardHeader className="pb-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold text-slate-900">Expense Management</CardTitle>
                <p className="text-slate-600 mt-1">Organize and track your business expenses</p>
              </div>
              <div className="flex items-center space-x-3">
                {activeTab === 'categories' && (
                  <Dialog open={isCreateCategoryOpen} onOpenChange={setIsCreateCategoryOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        onClick={() => {
                          setEditingCategory(null)
                          categoryForm.reset({
                            companyId: getCompanyId(),
                            name: '',
                            description: '',
                            parentId: '',
                            color: '#3B82F6',
                            icon: '',
                            taxTreatment: 'deductible',
                            approvalThreshold: undefined
                          })
                        }}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        New Category
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{editingCategory ? 'Edit Expense Category' : 'Create Expense Category'}</DialogTitle>
                        <DialogDescription>
                          {editingCategory ? 'Update category information and settings' : 'Create a new category to organize your expenses'}
                        </DialogDescription>
                      </DialogHeader>
                      <Form {...categoryForm}>
                        <form onSubmit={categoryForm.handleSubmit(onSubmitCategory)} className="space-y-4">
                          <FormField
                            control={categoryForm.control}
                            name="companyId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Company</FormLabel>
                                <FormControl>
                                  <Input 
                                    value={companyName} 
                                    disabled 
                                    className="bg-slate-50"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={categoryForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Category Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Office Supplies" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={categoryForm.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                  <Textarea placeholder="Category description..." {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={categoryForm.control}
                            name="parentId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Parent Category (Optional)</FormLabel>
                                <Select value={field.value} onValueChange={field.onChange}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select parent category" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="none">None (Top Level)</SelectItem>
                                    {filteredCategories.map((category: any) => (
                                      <SelectItem key={category.id} value={category.id}>
                                        {category.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={categoryForm.control}
                            name="color"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Color</FormLabel>
                                <FormControl>
                                  <Input type="color" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={categoryForm.control}
                            name="taxTreatment"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Tax Treatment</FormLabel>
                                <Select value={field.value} onValueChange={field.onChange}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select tax treatment" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="deductible">Fully Deductible</SelectItem>
                                    <SelectItem value="partially_deductible">Partially Deductible</SelectItem>
                                    <SelectItem value="non-deductible">Non-Deductible</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={categoryForm.control}
                            name="approvalThreshold"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Approval Threshold ($)</FormLabel>
                                <FormControl>
                                  <Input type="number" step="0.01" placeholder="0.00" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="flex justify-end space-x-2">
                            <Button type="button" variant="outline" onClick={() => {
                              setIsCreateCategoryOpen(false)
                              setEditingCategory(null)
                              categoryForm.reset()
                            }}>
                              Cancel
                            </Button>
                            <Button type="submit" disabled={createCategory.status === 'pending' || updateCategory.status === 'pending'}>
                              {createCategory.status === 'pending' || updateCategory.status === 'pending' 
                                ? (editingCategory ? 'Updating...' : 'Creating...') 
                                : (editingCategory ? 'Update Category' : 'Create Category')}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                )}

                {activeTab === 'expenses' && (
                  <Button onClick={() => {
                    expenseForm.reset({
                      companyId: getCompanyId(),
                      categoryId: '',
                      description: '',
                      amount: 0,
                      expenseDate: new Date().toISOString().split('T')[0],
                      vendorName: '',
                      notes: '',
                      department: '',
                      project: ''
                    })
                    setIsCreateExpenseOpen(true)
                  }}>
                    <Plus className="w-4 h-4 mr-2" />
                    New Expense
                  </Button>
                )}
                
                {activeTab === 'budgets' && (
                  <Dialog open={isCreateBudgetOpen} onOpenChange={(open) => {
                    setIsCreateBudgetOpen(open)
                    if (!open) {
                      budgetForm.reset()
                      setEditingBudget(null)
                    }
                  }}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        New Budget
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="!max-w-7xl max-h-[95vh] overflow-hidden w-[95vw] flex flex-col">
                      <DialogHeader className="pb-6 border-b border-slate-200">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-teal-600 to-teal-700 rounded-xl flex items-center justify-center">
                                <Target className="w-5 h-5 text-white" />
                          </div>
                          <div>
                                <DialogTitle className="text-2xl font-bold text-slate-900">
                                  {editingBudget ? 'Edit Budget' : 'Create New Budget'}
                                </DialogTitle>
                                <DialogDescription className="text-slate-600 mt-1">
                                  {editingBudget ? 'Update your budget settings and allocations' : 'Set up a new budget to track and control expenses'}
                                </DialogDescription>
                          </div>
                        </div>
                      </DialogHeader>
                      
                      <Form {...budgetForm}>
                        <form onSubmit={budgetForm.handleSubmit(onSubmitBudget)} className="flex flex-col h-full">
                            <div className="flex-1 overflow-y-auto max-h-[calc(95vh-200px)] scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 hover:scrollbar-thumb-slate-400 relative">
                              
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 py-6 pr-2 pb-8">
                                  {/* Left Column - Basic Information */}
                                  <div className="lg:col-span-1 space-y-6">
                                    {/* Company & Category Selection */}
                                    <div className="bg-slate-50 rounded-xl p-6">
                                      <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                        <Building className="w-5 h-5 text-teal-600" />
                                        Company & Category
                                      </h3>
                                      <div className="space-y-4">
                          <FormField
                            control={budgetForm.control}
                            name="companyId"
                            render={({ field }) => (
                              <FormItem>
                                              <FormLabel className="text-sm font-medium text-slate-700">Company *</FormLabel>
                                <FormControl>
                                  <Input 
                                    value={companyName} 
                                    disabled 
                                    className="bg-slate-50 h-12"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={budgetForm.control}
                            name="categoryId"
                            render={({ field }) => (
                              <FormItem>
                                              <FormLabel className="text-sm font-medium text-slate-700">Category *</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                                  <SelectTrigger className="h-12 bg-white border-slate-300">
                                      <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {filteredCategories.map((category: any) => (
                                      <SelectItem key={category.id} value={category.id}>
                                        {category.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                                      </div>
                                    </div>

                                    {/* Budget Details */}
                                    <div className="bg-slate-50 rounded-xl p-6">
                                  <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                    <DollarSign className="w-5 h-5 text-teal-600" />
                                    Budget Details
                                  </h3>
                                  <div className="space-y-4">
                          <FormField
                            control={budgetForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                          <FormLabel className="text-sm font-medium text-slate-700">Budget Name *</FormLabel>
                                <FormControl>
                                            <Input placeholder="Q1 Office Supplies Budget" className="h-12 bg-white border-slate-300" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={budgetForm.control}
                                      name="amount"
                            render={({ field }) => (
                              <FormItem>
                                          <FormLabel className="text-sm font-medium text-slate-700">Amount *</FormLabel>
                                <FormControl>
                                            <Input type="number" step="0.01" placeholder="0.00" className="h-12 bg-white border-slate-300" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                            <FormField
                              control={budgetForm.control}
                              name="period"
                              render={({ field }) => (
                                <FormItem>
                                          <FormLabel className="text-sm font-medium text-slate-700">Period *</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                              <SelectTrigger className="h-12 bg-white border-slate-300">
                                        <SelectValue />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="monthly">Monthly</SelectItem>
                                      <SelectItem value="quarterly">Quarterly</SelectItem>
                                      <SelectItem value="yearly">Yearly</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                                  </div>
                                </div>

                          </div>
                          
                          {/* Right Column - Description & Dates */}
                          <div className="lg:col-span-1 space-y-6">
                                <div className="bg-slate-50 rounded-xl p-6">
                                  <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-teal-600" />
                                    Budget Description
                                  </h3>
                            <FormField
                              control={budgetForm.control}
                                    name="description"
                              render={({ field }) => (
                                <FormItem>
                                        <FormLabel className="text-sm font-medium text-slate-700">Description</FormLabel>
                                  <FormControl>
                                          <Textarea 
                                            placeholder="Describe the purpose and scope of this budget..." 
                                            className="min-h-[120px] bg-white border-slate-300 resize-none" 
                                            {...field} 
                                          />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                                {/* Dates & Alerts */}
                                <div className="bg-slate-50 rounded-xl p-6">
                                  <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-teal-600" />
                                    Dates & Alerts
                                  </h3>
                                  <div className="space-y-4">
                            <FormField
                              control={budgetForm.control}
                              name="startDate"
                              render={({ field }) => (
                                <FormItem>
                                          <FormLabel className="text-sm font-medium text-slate-700">Start Date *</FormLabel>
                                  <FormControl>
                                            <Input type="date" className="h-12 bg-white border-slate-300" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={budgetForm.control}
                              name="endDate"
                              render={({ field }) => (
                                <FormItem>
                                          <FormLabel className="text-sm font-medium text-slate-700">End Date</FormLabel>
                                  <FormControl>
                                            <Input type="date" className="h-12 bg-white border-slate-300" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          
                          <FormField
                            control={budgetForm.control}
                            name="alertThreshold"
                            render={({ field }) => (
                              <FormItem>
                                          <FormLabel className="text-sm font-medium text-slate-700">Alert Threshold (%)</FormLabel>
                                <FormControl>
                                            <Input type="number" step="1" placeholder="80" className="h-12 bg-white border-slate-300" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                                  </div>
                                </div>
                          </div>
                        </div>
                        
                            </div>
                            
                            <div className="sticky bottom-0 bg-white border-t border-slate-200 p-6">
                              <div className="flex items-center justify-between w-full">
                                <Button 
                                  type="button" 
                                  variant="outline" 
                                  onClick={() => {
                              setIsCreateBudgetOpen(false)
                              setEditingBudget(null)
                                  }}
                                  className="h-12 px-6"
                                >
                              Cancel
                            </Button>
                                <Button 
                                  type="submit" 
                                  disabled={createBudget.status === 'pending' || updateBudget.status === 'pending'}
                                  className="h-12 px-8 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 shadow-lg hover:shadow-xl transition-all duration-200"
                                >
                                  {createBudget.status === 'pending' || updateBudget.status === 'pending' ? (
                                    <>
                                      <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                      {editingBudget ? 'Updating...' : 'Creating...'}
                                    </>
                                  ) : (
                                    <>
                                      <Target className="w-4 h-4 mr-2" />
                                      {editingBudget ? 'Update Budget' : 'Create Budget'}
                                    </>
                                  )}
                            </Button>
                              </div>
                          </div>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                )}

                {/* View Budget Dialog */}
                <Dialog open={isViewBudgetOpen} onOpenChange={setIsViewBudgetOpen}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Budget Details</DialogTitle>
                      <DialogDescription>View complete information about this budget</DialogDescription>
                    </DialogHeader>
                    {selectedBudget && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-500">Budget Name</label>
                            <p className="text-lg font-semibold">{selectedBudget.name}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">Category</label>
                            <p className="text-lg">{selectedBudget.category?.name || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">Period</label>
                            <p className="text-lg capitalize">{selectedBudget.period}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">Status</label>
                            <p className="text-lg">
                              <Badge variant={getBudgetStatus(selectedBudget) === 'within-budget' ? 'default' : getBudgetStatus(selectedBudget) === 'near-limit' ? 'secondary' : 'destructive'}>
                                {getBudgetStatus(selectedBudget)}
                              </Badge>
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">Budget Amount</label>
                            <p className="text-lg font-semibold text-green-600">${selectedBudget.amount.toLocaleString()}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">Amount Spent</label>
                            <p className="text-lg font-semibold text-red-600">${selectedBudget.spentAmount.toLocaleString()}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">Start Date</label>
                            <p className="text-lg">{format(new Date(selectedBudget.startDate), 'MMM dd, yyyy')}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">End Date</label>
                            <p className="text-lg">{format(new Date(selectedBudget.endDate), 'MMM dd, yyyy')}</p>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Description</label>
                          <p className="text-lg">{selectedBudget.description || 'No description provided'}</p>
                        </div>
                        <div className="pt-4">
                          <label className="text-sm font-medium text-gray-500">Utilization</label>
                          <div className="mt-2">
                            <Progress value={getBudgetUtilization(selectedBudget)} className="w-full" />
                            <p className="text-sm text-gray-600 mt-1">
                              {getBudgetUtilization(selectedBudget).toFixed(1)}% utilized
                            </p>
                          </div>
                        </div>
                        <div className="flex justify-end pt-4">
                          <Button variant="outline" onClick={() => setIsViewBudgetOpen(false)}>
                            Close
                          </Button>
                        </div>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
                
                {activeTab === 'rules' && (
                  <Dialog open={isCreateRuleOpen} onOpenChange={(open) => {
                    setIsCreateRuleOpen(open)
                    if (!open) {
                      setEditingRule(null)
                    }
                  }}>
                    <DialogTrigger asChild>
                  <Button onClick={() => {
                    setEditingRule(null)
                    ruleForm.reset({
                      companyId: '',
                      categoryId: '',
                      name: '',
                      description: '',
                      ruleType: 'approval_required' as const,
                      amountLimit: undefined,
                      blockedVendors: '',
                      requireApproval: true,
                      notifyManager: false,
                      autoReject: false,
                      conditions: '',
                      actions: '',
                      priority: 1
                    })
                  }}>
                    <Plus className="w-4 h-4 mr-2" />
                    New Rule
                  </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                      <DialogHeader className="flex-shrink-0">
                        <DialogTitle>{editingRule ? 'Edit Expense Rule' : 'Create Expense Rule'}</DialogTitle>
                        <DialogDescription>
                          {editingRule ? 'Modify expense rule settings and conditions' : 'Create automated rules for expense approval and validation'}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex-1 overflow-y-auto px-1">
                        <Form {...ruleForm}>
                          <form onSubmit={ruleForm.handleSubmit(onSubmitRule)} className="space-y-4">
                          <FormField
                            control={ruleForm.control}
                            name="companyId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Company</FormLabel>
                                <FormControl>
                                  <Input 
                                    value={companyName} 
                                    disabled 
                                    className="bg-slate-50"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={ruleForm.control}
                            name="categoryId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Category</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {filteredCategories.map((category: any) => (
                                      <SelectItem key={category.id} value={category.id}>
                                        {category.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={ruleForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Rule Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="High Amount Approval Rule" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={ruleForm.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                  <Textarea placeholder="Rule description..." {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={ruleForm.control}
                            name="ruleType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Rule Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select rule type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="amount_limit">Amount Limit</SelectItem>
                                    <SelectItem value="vendor_restriction">Vendor Restriction</SelectItem>
                                    <SelectItem value="approval_required">Approval Required</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          {/* Conditional fields based on rule type */}
                          {ruleForm.watch('ruleType') === 'amount_limit' && (
                            <FormField
                              control={ruleForm.control}
                              name="amountLimit"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Maximum Amount</FormLabel>
                                  <FormControl>
                                    <Input type="number" step="0.01" placeholder="1000.00" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          )}
                          
                          {ruleForm.watch('ruleType') === 'vendor_restriction' && (
                            <FormField
                              control={ruleForm.control}
                              name="blockedVendors"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Blocked Vendors</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Vendor1, Vendor2, Vendor3" {...field} />
                                  </FormControl>
                                  <p className="text-sm text-gray-500">Separate multiple vendors with commas</p>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          )}
                          
                          {/* Action checkboxes */}
                          <div className="space-y-3">
                            <h4 className="text-sm font-medium">Actions</h4>
                            <FormField
                              control={ruleForm.control}
                              name="requireApproval"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <input
                                      type="checkbox"
                                      checked={field.value}
                                      onChange={field.onChange}
                                      className="rounded border-gray-300"
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal">
                                    Require approval before payment
                                  </FormLabel>
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={ruleForm.control}
                              name="notifyManager"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <input
                                      type="checkbox"
                                      checked={field.value}
                                      onChange={field.onChange}
                                      className="rounded border-gray-300"
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal">
                                    Notify manager when rule is triggered
                                  </FormLabel>
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={ruleForm.control}
                              name="autoReject"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <input
                                      type="checkbox"
                                      checked={field.value}
                                      onChange={field.onChange}
                                      className="rounded border-gray-300"
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal">
                                    Automatically reject expenses that violate this rule
                                  </FormLabel>
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <FormField
                            control={ruleForm.control}
                            name="priority"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Priority</FormLabel>
                                <FormControl>
                                  <Input type="number" min="1" placeholder="1" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </form>
                      </Form>
                      </div>
                      <div className="flex-shrink-0 border-t border-slate-200 p-4 bg-slate-50">
                        <div className="flex justify-end space-x-2">
                          <Button type="button" variant="outline" onClick={() => setIsCreateRuleOpen(false)}>
                            Cancel
                          </Button>
                          <Button type="button" disabled={createRule.status === 'pending' || updateRule.status === 'pending'} onClick={ruleForm.handleSubmit(onSubmitRule)}>
                            {createRule.status === 'pending' || updateRule.status === 'pending' 
                              ? (editingRule ? 'Updating...' : 'Creating...') 
                              : (editingRule ? 'Update Rule' : 'Create Rule')}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
                {activeTab === 'rules' && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsCreateRuleOpen(true)
                      ruleForm.reset({
                        companyId: '',
                        categoryId: '',
                        name: 'Require Approval',
                        description: 'All expenses require approval before payment',
                        ruleType: 'approval_required',
                        amountLimit: undefined,
                        blockedVendors: '',
                        requireApproval: true,
                        notifyManager: false,
                        autoReject: false,
                        conditions: JSON.stringify({}, null, 2),
                        actions: JSON.stringify({ require_approval: true }, null, 2),
                        priority: 1,
                      })
                    }}
                  >
                    Require Approval Policy
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {/* Enhanced Search and Filter Section */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex-1 min-w-[300px]">
                    <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <Input
                      placeholder="Search expenses, categories, budgets..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-11 bg-white border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Select value={expenseStatus} onValueChange={setExpenseStatus}>
                    <SelectTrigger className="w-40 h-11 bg-white border-slate-300">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={expenseCategoryId || 'all-categories'} onValueChange={(v) => setExpenseCategoryId(v === 'all-categories' ? '' : v)}>
                    <SelectTrigger className="w-48 h-11 bg-white border-slate-300">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-categories">All Categories</SelectItem>
                      {filteredCategories.map((category: any) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" className="h-11 px-4 bg-white border-slate-300">
                    <Filter className="w-4 h-4 mr-2" />
                    Filters
                  </Button>
                    </div>
                  </div>
                </div>

            {/* Enhanced Navigation Tabs */}
            <div className="px-6 py-4">
              <SegmentedTabs
                tabs={[
                  { id: 'categories', label: 'Categories', icon: FolderTree },
                  { id: 'budgets', label: 'Budgets', icon: Target },
                  { id: 'rules', label: 'Rules', icon: Settings },
                  { id: 'expenses', label: 'Expenses', icon: DollarSign },
                ]}
                value={activeTab}
                onChange={(id) => setActiveTab(id)}
              />
            </div>

            {activeTab === 'categories' && (
              <div className="px-6 py-6">
                <div className="space-y-6">
                
                {categoriesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  </div>
                ) : filteredCategories.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                      <FolderTree className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">No expense categories found</h3>
                    <p className="text-slate-600 mb-6 max-w-md">
                      Create your first expense category to start organizing your business expenses efficiently.
                    </p>
                    <Button 
                      onClick={() => {
                        categoryForm.reset({
                          companyId: getCompanyId(),
                          name: '',
                          description: '',
                          parentId: '',
                          color: '#6b7280',
                          icon: '',
                          taxTreatment: 'deductible',
                          approvalThreshold: undefined
                        })
                        setIsCreateCategoryOpen(true)
                      }}
                      className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Category
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {renderCategoryTree(filteredCategories)}
                  </div>
                )}
                </div>
              </div>
            )}

            {activeTab === 'budgets' && (
              <div className="px-6 py-6">
                <div className="space-y-6">
                <div className="flex items-center gap-4 flex-wrap">
                  <Input placeholder="Search budgets..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="max-w-xs" />
                  <Select value={expenseStatus} onValueChange={setExpenseStatus}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Periods</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={expenseCategoryId || 'all-categories'} onValueChange={(v) => setExpenseCategoryId(v === 'all-categories' ? '' : v)}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-categories">All Categories</SelectItem>
                      {filteredCategories.map((c: any) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {budgetsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  </div>
                ) : filteredBudgets.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                      <Target className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">No budgets created yet</h3>
                    <p className="text-slate-600 mb-6 max-w-md">
                      Set up your first budget to track and control your expense spending across different categories.
                    </p>
                    <Button 
                      onClick={() => {
                        budgetForm.reset({
                          companyId: getCompanyId(), // ✅ Use getCompanyId() instead of companies array
                          categoryId: '',
                          name: '',
                          description: '',
                          period: 'monthly',
                          startDate: '',
                          endDate: '',
                          amount: 0,
                          alertThreshold: 80
                        })
                        setIsCreateBudgetOpen(true)
                      }}
                      className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Budget
                    </Button>
                  </div>
                ) : (
                  <Table>
                     <TableHeader>
                       <TableRow>
                         <TableHead className="px-4">Budget Name</TableHead>
                         <TableHead className="px-4">Amount</TableHead>
                         <TableHead className="px-4">Spent</TableHead>
                         <TableHead className="px-4">Status</TableHead>
                         <TableHead className="px-4">Actions</TableHead>
                       </TableRow>
                     </TableHeader>
                    <TableBody>
                      {filteredBudgets.map((budget: Budget) => {
                        const status = getBudgetStatus(budget)
                        const utilization = getBudgetUtilization(budget)
                        
                        return (
                          <TableRow key={budget.id} className="hover:bg-slate-50">
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                {budget.name}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-lg font-semibold text-slate-900">
                              ${budget.amount.toLocaleString()}
                              </div>
                              <div className="text-sm text-slate-500">Total Budget</div>
                            </TableCell>
                            <TableCell>
                              <div className="text-lg font-semibold text-slate-900">
                              ${budget.spentAmount.toLocaleString()}
                              </div>
                              <div className="text-sm text-slate-500">Spent</div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-2">
                                <Badge className={`${getBudgetStatusColor(status)} px-3 py-1`}>
                                {status === 'over-budget' && <AlertTriangle className="w-3 h-3 mr-1" />}
                                {status === 'near-limit' && <AlertTriangle className="w-3 h-3 mr-1" />}
                                {status === 'within-budget' && <CheckCircle className="w-3 h-3 mr-1" />}
                                {status.replace('-', ' ')}
                              </Badge>
                                <div className="w-full bg-slate-200 rounded-full h-2">
                                  <div 
                                    className={`h-2 rounded-full transition-all duration-300 ${
                                      status === 'over-budget' ? 'bg-red-500' :
                                      status === 'near-limit' ? 'bg-yellow-500' :
                                      'bg-green-500'
                                    }`}
                                    style={{ width: `${Math.min(utilization * 100, 100)}%` }}
                                  ></div>
                                </div>
                                <div className="text-xs text-slate-500">
                                  {utilization.toFixed(1)}% utilized
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  aria-label={`View budget ${budget.name}`}
                                  onClick={() => {
                                    setSelectedBudget(budget)
                                    setIsViewBudgetOpen(true)
                                  }}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  aria-label={`Edit budget ${budget.name}`}
                                  onClick={() => {
                                    setEditingBudget(budget)
                                    budgetForm.reset({
                                      companyId: (budget as any).companyId || getCompanyId(), // ✅ Use getCompanyId() as fallback
                                      categoryId: budget.category?.id || '',
                                      name: budget.name,
                                      description: budget.description || '',
                                      period: budget.period,
                                      startDate: budget.startDate ? new Date(budget.startDate).toISOString().split('T')[0] : '',
                                      endDate: budget.endDate ? new Date(budget.endDate).toISOString().split('T')[0] : '',
                                      amount: budget.amount,
                                      alertThreshold: budget.alertThreshold || 80
                                    })
                                    setIsCreateBudgetOpen(true)
                                  }}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                )}
                </div>
              </div>
            )}

            {activeTab === 'rules' && (
              <div className="px-6 py-6">
                <div className="space-y-6">
                <div className="flex items-center gap-4 flex-wrap">
                  <Input placeholder="Search rules..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="max-w-xs" />
                  <Select value={expenseStatus} onValueChange={setExpenseStatus}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="amount_limit">Amount Limit</SelectItem>
                      <SelectItem value="vendor_restriction">Vendor Restriction</SelectItem>
                      <SelectItem value="approval_required">Approval Required</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={expenseCategoryId || 'all-categories'} onValueChange={(v) => setExpenseCategoryId(v === 'all-categories' ? '' : v)}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-categories">All Categories</SelectItem>
                      {filteredCategories.map((c: any) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {rulesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  </div>
                ) : filteredRules.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                      <Settings className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">No expense rules configured</h3>
                    <p className="text-slate-600 mb-6 max-w-md">
                      Create expense rules to automate approval workflows and enforce spending policies across your organization.
                    </p>
                    <div className="flex gap-3">
                      <Button 
                        onClick={() => {
                          ruleForm.reset({
                            companyId: getCompanyId(),
                            categoryId: '',
                            name: 'Require Approval',
                            description: 'All expenses require approval before payment',
                            ruleType: 'approval_required',
                            amountLimit: undefined,
                            blockedVendors: '',
                            requireApproval: true,
                            notifyManager: false,
                            autoReject: false,
                            conditions: JSON.stringify({}, null, 2),
                            actions: JSON.stringify({ require_approval: true }, null, 2),
                            priority: 1,
                          })
                          setIsCreateRuleOpen(true)
                        }}
                        className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Approval Rule
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => {
                          ruleForm.reset({
                            companyId: getCompanyId(),
                            categoryId: '',
                            name: 'Amount Limit Rule',
                            description: 'Set spending limits for expense categories',
                            ruleType: 'amount_limit',
                            amountLimit: 1000,
                            blockedVendors: '',
                            requireApproval: false,
                            notifyManager: true,
                            autoReject: false,
                            conditions: '',
                            actions: '',
                            priority: 1,
                          })
                          setIsCreateRuleOpen(true)
                        }}
                      >
                        <DollarSign className="w-4 h-4 mr-2" />
                        Create Limit Rule
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Table>
                     <TableHeader>
                       <TableRow>
                         <TableHead className="px-4">Rule Name</TableHead>
                         <TableHead className="px-4">Type</TableHead>
                         <TableHead className="px-4">Status</TableHead>
                         <TableHead className="px-4">Actions</TableHead>
                       </TableRow>
                     </TableHeader>
                    <TableBody>
                      {filteredRules.map((rule: ExpenseRule) => (
                        <TableRow key={rule.id}>
                          <TableCell className="font-medium">{rule.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{rule.ruleType.replace('_', ' ')}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={rule.isActive ? 'default' : 'secondary'}>
                              {rule.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button variant="outline" size="sm" aria-label={`Toggle rule ${rule.name}`} onClick={() => updateRule.mutate({ id: rule.id, data: { isActive: !rule.isActive } })}>
                                {rule.isActive ? 'Disable' : 'Enable'}
                              </Button>
                              <Button variant="outline" size="sm" aria-label={`Edit rule ${rule.name}`} onClick={() => {
                                setEditingRule(rule)
                                setIsCreateRuleOpen(true)
                                try {
                                  // Parse existing JSON data
                                  let conditions = {}
                                  let actions = {}
                                  
                                  try {
                                    conditions = typeof (rule as any).conditions === 'string' 
                                      ? JSON.parse((rule as any).conditions) 
                                      : (rule as any).conditions || {}
                                  } catch {}
                                  
                                  try {
                                    actions = typeof (rule as any).actions === 'string' 
                                      ? JSON.parse((rule as any).actions) 
                                      : (rule as any).actions || {}
                                  } catch {}
                                  
                                  // Extract user-friendly values
                                  const amountLimit = (conditions as any).amount || (conditions as any).limit
                                  const blockedVendors = Array.isArray((conditions as any).vendors) 
                                    ? (conditions as any).vendors.join(', ') 
                                    : ''
                                  
                                  ruleForm.reset({
                                    companyId: getCompanyId(),
                                    categoryId: rule.category?.id || '',
                                    name: rule.name,
                                    description: rule.description || '',
                                    ruleType: rule.ruleType as any,
                                    amountLimit: amountLimit,
                                    blockedVendors: blockedVendors,
                                    requireApproval: (actions as any).require_approval || false,
                                    notifyManager: (actions as any).notify_manager || false,
                                    autoReject: (actions as any).auto_reject || false,
                                    conditions: typeof (rule as any).conditions === 'string' ? (rule as any).conditions : JSON.stringify((rule as any).conditions || {}, null, 2),
                                    actions: typeof (rule as any).actions === 'string' ? (rule as any).actions : JSON.stringify((rule as any).actions || {}, null, 2),
                                    priority: rule.priority,
                                  })
                                } catch {}
                              }}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="outline" size="sm" aria-label={`Delete rule ${rule.name}`} onClick={() => deleteRule.mutate(rule.id)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
                </div>
              </div>
            )}

            {activeTab === 'expenses' && (
              <div className="px-6 py-6">
                <div className="space-y-6">
                <div className="flex items-center gap-4 flex-wrap">
                  <Input placeholder="Search expenses..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="max-w-xs" />
                  <Select value={expenseStatus} onValueChange={setExpenseStatus}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="submitted">Submitted</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={expenseCategoryId || 'all-categories'} onValueChange={(v) => setExpenseCategoryId(v === 'all-categories' ? '' : v)}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-categories">All Categories</SelectItem>
                      {filteredCategories.map((c: any) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input type="date" value={expenseStartDate} onChange={(e) => setExpenseStartDate(e.target.value)} className="w-40" />
                  <Input type="date" value={expenseEndDate} onChange={(e) => setExpenseEndDate(e.target.value)} className="w-40" />
                  <Input placeholder="Dept filter" value={expenseDepartment} onChange={(e) => setExpenseDepartment(e.target.value)} className="w-40" />
                  <Input placeholder="Project filter" value={expenseProject} onChange={(e) => setExpenseProject(e.target.value)} className="w-40" />
                  <Button variant="outline" onClick={() => setReceiptOpen(true)}>New from Receipt</Button>
                  <Button variant="outline" onClick={() => setCardImportOpen(true)}>Import Card CSV</Button>
                  <Button variant="outline" onClick={() => { window.location.href = '/expenses/exceptions' }}>Exceptions</Button>
                  <Button variant="outline" onClick={() => {
                    const rows = ((Array.isArray(expenses) ? expenses : expenses?.items || expenses?.data || []) as any[])
                      .filter((e) => !searchTerm || (e.description || '').toLowerCase().includes(searchTerm.toLowerCase()))
                      .filter((e) => !expenseStartDate || String(e.expenseDate || '').slice(0,10) >= expenseStartDate)
                      .filter((e) => !expenseEndDate || String(e.expenseDate || '').slice(0,10) <= expenseEndDate)
                      .filter((e) => !expenseDepartment || String((e as any).department || '').toLowerCase().includes(expenseDepartment.toLowerCase()))
                      .filter((e) => !expenseProject || String((e as any).project || '').toLowerCase().includes(expenseProject.toLowerCase()))
                      .map((e) => ({
                        date: e.expenseDate,
                        description: e.description,
                        category: e.category?.name,
                        department: (e as any).department || '',
                        project: (e as any).project || '',
                        status: e.status,
                        amount: e.totalAmount
                      }))
                    const header = ['Date','Description','Category','Department','Project','Status','Amount']
                    const lines = [header.join(','), ...rows.map(r => [r.date, JSON.stringify(r.description || '').replace(/"/g,'""'), JSON.stringify(r.category || '').replace(/"/g,'""'), JSON.stringify(r.department || '').replace(/"/g,'""'), JSON.stringify(r.project || '').replace(/"/g,'""'), r.status, r.amount].join(','))]
                    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `expenses_${new Date().toISOString().slice(0,10)}.csv`
                    a.click()
                    setTimeout(() => URL.revokeObjectURL(url), 30000)
                  }}>Export CSV</Button>
                </div>

                {expensesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  </div>
                ) : (!expenses || expenses.length === 0) ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                      <DollarSign className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">No expenses recorded</h3>
                    <p className="text-slate-600 mb-6 max-w-md">
                      Start tracking your business expenses by creating your first expense entry or importing from receipts.
                    </p>
                    <div className="flex gap-3">
                      <Button 
                        onClick={() => {
                          expenseForm.reset({
                            companyId: getCompanyId(),
                            categoryId: '',
                            budgetId: 'auto',
                            description: '',
                            amount: 0,
                            expenseDate: new Date().toISOString().split('T')[0],
                            vendorName: '',
                            notes: '',
                            department: '',
                            project: ''
                          })
                          setIsCreateExpenseOpen(true)
                        }}
                        className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create First Expense
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => setReceiptOpen(true)}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Scan Receipt
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => setCardImportOpen(true)}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Import CSV
                      </Button>
                    </div>
                  </div>
                ) : (
                <>
                {/* Enhanced Sortable Expense Table */}
                {(() => {
                  // Filter expenses
                  let filteredExpenses = ((Array.isArray(expenses) ? expenses : expenses?.items || expenses?.data || []) as any[])
                    .filter((e) => !searchTerm || (e.description || '').toLowerCase().includes(searchTerm.toLowerCase()) || (e.vendorName || '').toLowerCase().includes(searchTerm.toLowerCase()) || (e.referenceNumber || '').toLowerCase().includes(searchTerm.toLowerCase()))
                    .filter((e) => !expenseStartDate || String(e.expenseDate || '').slice(0,10) >= expenseStartDate)
                    .filter((e) => !expenseEndDate || String(e.expenseDate || '').slice(0,10) <= expenseEndDate)
                    .filter((e) => !expenseDepartment || ((e.description || '').toLowerCase().includes(`[dept: ${expenseDepartment.toLowerCase()}`)))
                    .filter((e) => !expenseProject || ((e.description || '').toLowerCase().includes(`[proj: ${expenseProject.toLowerCase()}`)))
                  
                  // Sort expenses
                  const sortedExpenses = [...filteredExpenses].sort((a, b) => {
                    let aVal: any = sortField === 'expenseDate' ? a.expenseDate : 
                                     sortField === 'amount' ? Number(a.totalAmount ?? a.amount ?? 0) :
                                     sortField === 'description' ? (a.description || '') :
                                     sortField === 'category' ? (a.category?.name || '') :
                                     sortField === 'vendor' ? (a.vendorName || '') :
                                     sortField === 'status' ? (a.status || '') :
                                     a[sortField]
                    let bVal: any = sortField === 'expenseDate' ? b.expenseDate : 
                                     sortField === 'amount' ? Number(b.totalAmount ?? b.amount ?? 0) :
                                     sortField === 'description' ? (b.description || '') :
                                     sortField === 'category' ? (b.category?.name || '') :
                                     sortField === 'vendor' ? (b.vendorName || '') :
                                     sortField === 'status' ? (b.status || '') :
                                     b[sortField]
                    
                    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
                    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
                    return 0
                  })
                  
                  // Paginate
                  const totalItems = sortedExpenses.length
                  const totalPages = Math.ceil(totalItems / itemsPerPage)
                  const startIndex = (currentPage - 1) * itemsPerPage
                  const paginatedExpenses = sortedExpenses.slice(startIndex, startIndex + itemsPerPage)
                  
                  const SortHeader = ({ field, label }: { field: string, label: string }) => (
                    <TableHead className="px-4 cursor-pointer select-none hover:bg-slate-50" onClick={() => {
                      if (sortField === field) {
                        setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
                      } else {
                        setSortField(field)
                        setSortDirection('asc')
                      }
                    }}>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{label}</span>
                        {sortField === field ? (
                          sortDirection === 'asc' ? <ArrowUp className="w-4 h-4 text-green-600" /> : <ArrowDown className="w-4 h-4 text-green-600" />
                        ) : (
                          <ArrowUpDown className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </TableHead>
                  )
                  
                  return (
                    <div className="space-y-4">
                      {/* Bulk Actions Toolbar */}
                      {selectedExpenses.size > 0 && (
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-4 shadow-md">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Badge className="bg-green-600 text-white px-3 py-1 text-base font-semibold">
                                {selectedExpenses.size} {selectedExpenses.size === 1 ? 'Expense' : 'Expenses'} Selected
                              </Badge>
                              <Separator orientation="vertical" className="h-6 bg-green-300" />
                              <span className="text-sm text-slate-600 font-medium">
                                Total: ${sortedExpenses.filter(e => selectedExpenses.has(e.id)).reduce((sum, e) => sum + Number(e.totalAmount || e.amount || 0), 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white border-green-700"
                                onClick={handleBulkApprove}
                              >
                                <Check className="w-4 h-4 mr-2" />
                                Approve Selected
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="bg-orange-600 hover:bg-orange-700 text-white border-orange-700"
                                onClick={handleBulkReject}
                              >
                                <X className="w-4 h-4 mr-2" />
                                Reject Selected
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="bg-red-600 hover:bg-red-700 text-white border-red-700"
                                onClick={handleBulkDelete}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Selected
                              </Button>
                              <Separator orientation="vertical" className="h-6 bg-green-300" />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedExpenses(new Set())}
                              >
                                <X className="w-4 h-4 mr-2" />
                                Clear Selection
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Table Controls */}
                      <div className="flex items-center justify-between bg-slate-50 p-4 rounded-lg border border-slate-200">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-slate-700">Show</span>
                            <Select value={String(itemsPerPage)} onValueChange={(val) => {
                              setItemsPerPage(Number(val))
                              setCurrentPage(1)
                            }}>
                              <SelectTrigger className="w-20 h-9">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="5">5</SelectItem>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="25">25</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                                <SelectItem value="100">100</SelectItem>
                              </SelectContent>
                            </Select>
                            <span className="text-sm text-slate-600">
                              {totalItems === 0 ? 'No expenses' : `Showing ${startIndex + 1}-${Math.min(startIndex + itemsPerPage, totalItems)} of ${totalItems} expenses`}
                            </span>
                          </div>
                          {selectedExpenses.size > 0 && (
                            <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                              {selectedExpenses.size} selected
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              queryClient.invalidateQueries({ queryKey: ['expenses'] })
                              toast.success('Expenses refreshed')
                            }}
                          >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Refresh
                          </Button>
                          <Select 
                            value=""
                            onValueChange={(value) => {
                              const expensesToExport = selectedExpenses.size > 0
                                ? sortedExpenses.filter(e => selectedExpenses.has(e.id))
                                : sortedExpenses
                              
                              if (value === 'csv') exportToCSV(expensesToExport)
                              else if (value === 'excel') exportToExcel(expensesToExport)
                              else if (value === 'print') printExpenses(expensesToExport)
                            }}
                          >
                            <SelectTrigger className="w-[140px] h-9">
                              <div className="flex items-center gap-2">
                                <Download className="w-4 h-4" />
                                <span>Export</span>
                              </div>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="csv">
                                <div className="flex items-center gap-2">
                                  <FileText className="w-4 h-4" />
                                  <span>Export as CSV</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="excel">
                                <div className="flex items-center gap-2">
                                  <FileSpreadsheet className="w-4 h-4" />
                                  <span>Export as Excel</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="print">
                                <div className="flex items-center gap-2">
                                  <Printer className="w-4 h-4" />
                                  <span>Print Report</span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      {/* Enhanced Table */}
                      <div className="border border-slate-200 rounded-lg overflow-hidden">
                        <Table>
                          <TableHeader className="bg-gradient-to-r from-slate-50 to-slate-100">
                            <TableRow>
                              <TableHead className="px-4 w-12">
                                <input 
                                  type="checkbox" 
                                  className="w-4 h-4 rounded border-slate-300 text-green-600 focus:ring-green-500"
                                  checked={paginatedExpenses.length > 0 && paginatedExpenses.every(e => selectedExpenses.has(e.id))}
                                  onChange={(event) => {
                                    if (event.target.checked) {
                                      setSelectedExpenses(new Set([...selectedExpenses, ...paginatedExpenses.map(e => e.id)]))
                                    } else {
                                      const newSet = new Set(selectedExpenses)
                                      paginatedExpenses.forEach(e => newSet.delete(e.id))
                                      setSelectedExpenses(newSet)
                                    }
                                  }}
                                />
                              </TableHead>
                              <SortHeader field="expenseDate" label="Date" />
                              <SortHeader field="description" label="Description & Vendor" />
                              <SortHeader field="category" label="Category" />
                              <SortHeader field="amount" label="Amount" />
                              <SortHeader field="status" label="Status" />
                              <TableHead className="px-4"><span className="font-semibold">Actions</span></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {paginatedExpenses.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={7} className="text-center py-12">
                                  <div className="flex flex-col items-center gap-2 text-slate-500">
                                    <FileText className="w-12 h-12 text-slate-300" />
                                    <p className="text-lg font-medium">No expenses found</p>
                                    <p className="text-sm">Try adjusting your filters or create a new expense</p>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ) : (
                              paginatedExpenses.map((e) => (
                                <TableRow 
                                  key={e.id} 
                                  className={`hover:bg-slate-50 transition-colors ${selectedExpenses.has(e.id) ? 'bg-green-50' : ''}`}
                                >
                                  <TableCell className="px-4">
                                    <input 
                                      type="checkbox" 
                                      className="w-4 h-4 rounded border-slate-300 text-green-600 focus:ring-green-500"
                                      checked={selectedExpenses.has(e.id)}
                                      onChange={(event) => {
                                        const newSet = new Set(selectedExpenses)
                                        if (event.target.checked) {
                                          newSet.add(e.id)
                                        } else {
                                          newSet.delete(e.id)
                                        }
                                        setSelectedExpenses(newSet)
                                      }}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-3">
                                      <div className="w-2 h-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full shadow-sm"></div>
                                      <div>
                                        <div className="font-semibold text-slate-900">
                                          {e.expenseDate ? format(new Date(e.expenseDate), 'MMM dd, yyyy') : '-'}
                                        </div>
                                        <div className="text-xs text-slate-500">
                                          {e.expenseDate ? format(new Date(e.expenseDate), 'hh:mm a') : ''}
                                        </div>
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell className="max-w-xs">
                                    <div className="space-y-1">
                                      <div className="font-semibold text-slate-900 truncate">{e.description || 'No description'}</div>
                                      <div className="flex items-center gap-2">
                                        {(e as any).vendorName && (
                                          <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                                            {(e as any).vendorName}
                                          </Badge>
                                        )}
                                        {(e as any).referenceNumber && (
                                          <span className="text-xs text-slate-500">Ref: {(e as any).referenceNumber}</span>
                                        )}
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant="outline" className="px-3 py-1 font-medium">
                                      {e.category?.name || 'Uncategorized'}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <div className="space-y-1">
                                      <div className="text-lg font-bold text-slate-900">
                                        {e.currency || 'USD'} ${Number(e.totalAmount ?? e.amount ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                      </div>
                                      {(e as any).taxAmount && Number((e as any).taxAmount) > 0 && (
                                        <div className="text-xs text-slate-500">
                                          Tax: ${Number((e as any).taxAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </div>
                                      )}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Badge className={`px-3 py-1 flex items-center gap-1 w-fit ${
                                      e.status === 'approved' ? 'bg-green-100 text-green-800 border-green-200' :
                                      e.status === 'pending' || e.status === 'submitted' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                      e.status === 'rejected' ? 'bg-red-100 text-red-800 border-red-200' :
                                      'bg-gray-100 text-gray-800 border-gray-200'
                                    }`}>
                                      {e.status === 'approved' && <CheckCircle className="w-3 h-3" />}
                                      {(e.status === 'pending' || e.status === 'submitted') && <AlertTriangle className="w-3 h-3" />}
                                      {e.status === 'rejected' && <AlertTriangle className="w-3 h-3" />}
                                      <span className="capitalize font-medium">{e.status || 'draft'}</span>
                                    </Badge>
                                    {e.status !== 'draft' && (
                                      <ExpenseJournalIndicator expenseId={e.id} />
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      {e.status === 'draft' && (
                                        <Button size="sm" variant="outline" className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200" disabled={submitExpense.isPending} onClick={() => handleSubmitExpense(e)}>
                                          Submit
                                        </Button>
                                      )}
                                      {e.status === 'submitted' && (
                                        <>
                                          <Button size="sm" variant="outline" className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200" disabled={approveExpense.isPending} onClick={() => handleApproveExpense(e)}>
                                            Approve
                                          </Button>
                                          <Button size="sm" variant="outline" onClick={() => { setMatchingContext({ amount: Number(e.totalAmount ?? e.amount ?? 0), date: e.expenseDate?.slice(0,10), description: e.description }); setMatchingOpen(true) }}>
                                            Match
                                          </Button>
                                        </>
                                      )}
                                      {e.status === 'approved' && (
                                        <Button size="sm" variant="outline" className="bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200" onClick={() => { setSelectedExpenseId(e.id); setReimburseOpen(true) }}>
                                          Reimburse
                                        </Button>
                                      )}
                                      <Button size="sm" variant="ghost" onClick={() => { setSelectedExpense(e); setIsViewExpenseOpen(true) }}>
                                        <Eye className="w-4 h-4" />
                                      </Button>
                                      <Button size="sm" variant="ghost" onClick={() => { setEditingExpense(e); setEditOpen(true) }}>
                                        <Edit className="w-4 h-4" />
                                      </Button>
                                      {e.status !== 'draft' && (
                                        <Button 
                                          size="sm" 
                                          variant="outline" 
                                          className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                                          disabled={generateJournalEntry.isPending}
                                          onClick={async () => {
                                            const hasEntries = await hasJournalEntries(e.id)
                                            if (hasEntries) {
                                              toast.error('Journal entries already exist for this expense')
                                              return
                                            }
                                            generateJournalEntry.mutate(e.id)
                                          }}
                                          title="Generate Journal Entry"
                                        >
                                          {generateJournalEntry.isPending ? (
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700"></div>
                                          ) : (
                                            <BookOpen className="w-4 h-4" />
                                          )}
                                        </Button>
                                      )}
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </div>
                      
                      {/* Pagination */}
                      {totalPages > 1 && (
                        <div className="flex items-center justify-between bg-slate-50 p-4 rounded-lg border border-slate-200">
                          <div className="text-sm text-slate-600">
                            Page {currentPage} of {totalPages}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={currentPage === 1}
                              onClick={() => setCurrentPage(1)}
                            >
                              First
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={currentPage === 1}
                              onClick={() => setCurrentPage(currentPage - 1)}
                            >
                              <ChevronLeft className="w-4 h-4 mr-1" />
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
                                    variant={currentPage === pageNum ? 'default' : 'outline'}
                                    size="sm"
                                    className={currentPage === pageNum ? 'bg-green-600 hover:bg-green-700' : ''}
                                    onClick={() => setCurrentPage(pageNum)}
                                  >
                                    {pageNum}
                                  </Button>
                                )
                              })}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={currentPage === totalPages}
                              onClick={() => setCurrentPage(currentPage + 1)}
                            >
                              Next
                              <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={currentPage === totalPages}
                              onClick={() => setCurrentPage(totalPages)}
                            >
                              Last
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })()}
                </>
                )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Modal Components */}
      <>
      <ReceiptCaptureModal open={receiptOpen} onOpenChange={setReceiptOpen} onCreated={() => queryClient.invalidateQueries({ queryKey: ['expenses'] })} />
      <ExpenseReportModal open={reportOpen} onOpenChange={setReportOpen} />
      <ReimburseExpenseModal open={reimburseOpen} onOpenChange={(v) => { setReimburseOpen(v); if (!v) { setSelectedExpenseId(null); queryClient.invalidateQueries({ queryKey: ['expenses'] }) } }} expenseId={selectedExpenseId} />
      <ExpenseMatchingModal open={matchingOpen} onOpenChange={setMatchingOpen} amount={matchingContext?.amount} date={matchingContext?.date} description={matchingContext?.description} />
      <EditExpenseModal open={editOpen} onOpenChange={(v) => { setEditOpen(v); if (!v) { setEditingExpense(null); queryClient.invalidateQueries({ queryKey: ['expenses'] }) } }} expense={editingExpense} />
      <CardCsvImportModal open={cardImportOpen} onOpenChange={(v) => { setCardImportOpen(v); if (!v) { queryClient.invalidateQueries({ queryKey: ['expenses'] }) } }} />
      
      {/* Create Expense Dialog */}
      <Dialog open={isCreateExpenseOpen} onOpenChange={(open) => {
        setIsCreateExpenseOpen(open)
        if (!open) {
          expenseForm.reset()
        }
      }}>
        <DialogContent className="!max-w-7xl max-h-[95vh] overflow-hidden w-[95vw] flex flex-col bg-gradient-to-br from-slate-50 to-white">
          <DialogHeader className="pb-6 border-b border-slate-200 bg-white/80 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/30">
                    <DollarSign className="w-7 h-7 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full border-2 border-white flex items-center justify-center">
                    <Plus className="w-3 h-3 text-white" />
                  </div>
                </div>
                <div>
                  <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                    Create New Expense
                  </DialogTitle>
                  <DialogDescription className="text-slate-600 mt-1 text-sm">
                    Professional expense tracking • Full audit trail • Real-time calculations
                  </DialogDescription>
                </div>
              </div>
              <Badge className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-green-200 px-4 py-2 text-sm font-semibold">
                Draft Mode
              </Badge>
            </div>
          </DialogHeader>
          
          <Form {...expenseForm}>
            <form onSubmit={expenseForm.handleSubmit(onSubmitExpense)} className="flex flex-col h-full">
              <div className="flex-1 overflow-y-auto max-h-[calc(95vh-200px)] scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 hover:scrollbar-thumb-slate-400 relative">
            
            <div className="flex flex-col lg:flex-row gap-6 py-6 pr-2 pb-8 h-full">
              {/* Left Column - Basic Information */}
              <div className="lg:w-1/2 space-y-6 flex flex-col">
                {/* Company & Category Selection */}
                <div className="bg-slate-50 rounded-xl p-6 flex-1">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <Building className="w-5 h-5 text-green-600" />
                    Company & Category
                  </h3>
                  <div className="space-y-4">
                <FormField
                  control={expenseForm.control}
                  name="companyId"
                  render={({ field }) => (
                    <FormItem>
                          <FormLabel className="text-sm font-medium text-slate-700">Company *</FormLabel>
                        <FormControl>
                          <Input 
                            value={companyName} 
                            disabled 
                            className="bg-slate-50 h-12"
                          />
                        </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={expenseForm.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                          <FormLabel className="text-sm font-medium text-slate-700">Category *</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                                  <SelectTrigger className="h-12 bg-white border-slate-300">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {filteredCategories.map((category: any) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Budget Selection - Always show if category is selected */}
                {expenseForm.watch('categoryId') && (
                  <FormField
                    control={expenseForm.control}
                    name="budgetId"
                    render={({ field }) => {
                      const categoryBudgets = filteredBudgets.filter((b: any) => b.categoryId === expenseForm.watch('categoryId'));
                      const hasBudgets = categoryBudgets.length > 0;
                      
                      return (
                        <FormItem>
                                  <FormLabel className="text-sm font-medium text-slate-700">
                            Budget to Use {hasBudgets ? `(${categoryBudgets.length} available)` : '(No budgets)'}
                          </FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                                      <SelectTrigger className="h-12 bg-white border-slate-300">
                                <SelectValue placeholder={hasBudgets ? "Auto-select best budget" : "No budgets available"}>
                                  {field.value && field.value !== 'auto' ? (
                                    (() => {
                                      const selectedBudget = categoryBudgets.find((b: any) => b.id === field.value);
                                      if (!selectedBudget) return null;
                                      const available = selectedBudget.amount - selectedBudget.spentAmount;
                                      const utilization = selectedBudget.amount > 0 ? Math.round((selectedBudget.spentAmount / selectedBudget.amount) * 100) : 0;
                                      return (
                                        <div className="flex flex-col text-left">
                                          <span>{selectedBudget.name}</span>
                                          <span className="text-xs text-muted-foreground">
                                            ${available.toLocaleString()} available ({utilization}% used)
                                          </span>
                                        </div>
                                      );
                                    })()
                                  ) : null}
                                </SelectValue>
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="auto">
                                {hasBudgets ? "Auto-select best budget" : "No budget (expense will be unbudgeted)"}
                              </SelectItem>
                              {categoryBudgets.map((budget: any) => {
                                const available = budget.amount - budget.spentAmount;
                                const utilization = budget.amount > 0 ? Math.round((budget.spentAmount / budget.amount) * 100) : 0;
                                return (
                                  <SelectItem key={budget.id} value={budget.id}>
                                    <div className="flex flex-col">
                                      <span>{budget.name}</span>
                                      <span className="text-xs text-muted-foreground">
                                        ${available.toLocaleString()} available ({utilization}% used)
                                      </span>
                                    </div>
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                          <p className="text-xs text-muted-foreground">
                            {hasBudgets 
                              ? "Choose which budget to deduct from. Leave blank for automatic selection."
                              : "No budgets exist for this category. Create a budget in the Budgets tab first."}
                          </p>
                        </FormItem>
                      );
                    }}
                  />
                )}
                  </div>
                </div>
              </div>

              {/* Right Column - Expense Details */}
              <div className="lg:w-1/2 space-y-6 flex flex-col">
                <div className="bg-slate-50 rounded-xl p-6 flex-1">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    Expense Details
                  </h3>
                  <div className="space-y-4">
                <FormField
                  control={expenseForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                          <FormLabel className="text-sm font-medium text-slate-700">Description *</FormLabel>
                      <FormControl>
                                <Input placeholder="Expense description" className="h-12 bg-white border-slate-300" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={expenseForm.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                            <FormLabel className="text-sm font-medium text-slate-700">Amount *</FormLabel>
                        <FormControl>
                                  <Input type="number" step="0.01" placeholder="0.00" className="h-12 bg-white border-slate-300" {...field} onChange={(e) => {
                                    field.onChange(e);
                                    // Auto-calculate tax if rate is set
                                    const taxRate = expenseForm.watch('taxRate');
                                    if (taxRate) {
                                      const taxAmount = (Number(e.target.value) || 0) * (Number(taxRate) / 100);
                                      expenseForm.setValue('taxAmount', taxAmount);
                                    }
                                  }} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={expenseForm.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                            <FormLabel className="text-sm font-medium text-slate-700">Currency</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                                    <SelectTrigger className="h-12 bg-white border-slate-300">
                              <SelectValue placeholder="USD" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="USD">USD</SelectItem>
                            <SelectItem value="EUR">EUR</SelectItem>
                            <SelectItem value="GBP">GBP</SelectItem>
                            <SelectItem value="CAD">CAD</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={expenseForm.control}
                  name="expenseDate"
                  render={({ field }) => (
                    <FormItem>
                          <FormLabel className="text-sm font-medium text-slate-700">Expense Date *</FormLabel>
                      <FormControl>
                                <Input type="date" className="h-12 bg-white border-slate-300" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                  </div>
                </div>

              </div>

              {/* Right Column - Vendor & Notes */}
              <div className="lg:w-1/2 space-y-6 flex flex-col">
                {/* Vendor & Organization */}
                <div className="bg-slate-50 rounded-xl p-6 flex-1">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <Building className="w-5 h-5 text-green-600" />
                    Vendor & Organization
                  </h3>
                  <div className="space-y-4">
                <FormField
                  control={expenseForm.control}
                  name="vendorId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-slate-700">Vendor</FormLabel>
                      <Select 
                        value={field.value} 
                        onValueChange={(value) => {
                          field.onChange(value);
                          // Auto-fill vendor name when vendor is selected
                          const selectedVendor = (vendors || []).find((v: any) => v.id === value);
                          if (selectedVendor) {
                            expenseForm.setValue('vendorName', selectedVendor.name);
                          }
                        }}
                      >
                        <FormControl>
                          <SelectTrigger className="h-12 bg-white border-slate-300">
                            <SelectValue placeholder="Select vendor">
                              {field.value && (() => {
                                const vendor = (vendors || []).find((v: any) => v.id === field.value);
                                return vendor ? (
                                  <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-semibold">
                                      {vendor.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <span>{vendor.name}</span>
                                  </div>
                                ) : null;
                              })()}
                            </SelectValue>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Plus className="w-4 h-4" />
                              <span>No vendor (cash/misc)</span>
                            </div>
                          </SelectItem>
                          {(vendors || []).map((vendor: any) => (
                            <SelectItem key={vendor.id} value={vendor.id}>
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-semibold">
                                  {vendor.name?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div className="font-medium">{vendor.name}</div>
                                  {vendor.email && (
                                    <div className="text-xs text-muted-foreground">{vendor.email}</div>
                                  )}
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={expenseForm.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                          <FormLabel className="text-sm font-medium text-slate-700">Department</FormLabel>
                      <FormControl>
                                <Input placeholder="Department" className="h-12 bg-white border-slate-300" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={expenseForm.control}
                  name="project"
                  render={({ field }) => (
                    <FormItem>
                          <FormLabel className="text-sm font-medium text-slate-700">Project</FormLabel>
                      <FormControl>
                                <Input placeholder="Project" className="h-12 bg-white border-slate-300" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-6 flex-1">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-green-600" />
                    Additional Notes
                  </h3>
              <FormField
                control={expenseForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                        <FormLabel className="text-sm font-medium text-slate-700">Notes</FormLabel>
                    <FormControl>
                          <Textarea 
                                placeholder="Additional notes about this expense..." 
                                className="min-h-[120px] bg-white border-slate-300 resize-none" 
                                {...field} 
                          />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
                </div>
              </div>
              
              {/* NEW ROW - Accounting & Tax Details */}
              <div className="lg:w-1/2 space-y-6 flex flex-col">
                {/* Accounting Details */}
                <div className="bg-slate-50 rounded-xl p-6 flex-1">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-green-600" />
                    Accounting Details
                  </h3>
                  <div className="space-y-4">
                    {/* GL Account field hidden - accounts are selected during journal entry creation */}
                    {/* <FormField
                      control={expenseForm.control}
                      name="accountId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-slate-700">GL Account</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger className="h-12 bg-white border-slate-300">
                                <SelectValue placeholder="Select GL account" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {expenseAccounts.map((account: any) => (
                                <SelectItem key={account.id} value={account.id}>
                                  {account.code} - {account.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    /> */}

                    <FormField
                      control={expenseForm.control}
                      name="referenceNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-slate-700">Reference/Invoice #</FormLabel>
                          <FormControl>
                            <Input placeholder="INV-12345" className="h-12 bg-white border-slate-300" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={expenseForm.control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-slate-700">Payment Method</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger className="h-12 bg-white border-slate-300">
                                <SelectValue placeholder="Select payment method" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="cash">Cash</SelectItem>
                              <SelectItem value="check">Check</SelectItem>
                              <SelectItem value="credit_card">Credit Card</SelectItem>
                              <SelectItem value="debit_card">Debit Card</SelectItem>
                              <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                              <SelectItem value="ach">ACH</SelectItem>
                              <SelectItem value="wire">Wire Transfer</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Tax & Additional Options */}
              <div className="lg:w-1/2 space-y-6 flex flex-col">
                <div className="bg-slate-50 rounded-xl p-6 flex-1">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-green-600" />
                    Tax & Options
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={expenseForm.control}
                        name="taxRate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-slate-700">Tax Rate (%)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.01" 
                                placeholder="7.5" 
                                className="h-12 bg-white border-slate-300" 
                                {...field} 
                                onChange={(e) => {
                                  field.onChange(e);
                                  // Auto-calculate tax amount
                                  const amount = expenseForm.watch('amount');
                                  if (amount) {
                                    const taxAmount = (Number(amount) || 0) * (Number(e.target.value) / 100);
                                    expenseForm.setValue('taxAmount', taxAmount);
                                  }
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={expenseForm.control}
                        name="taxAmount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-slate-700">Tax Amount</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" placeholder="0.00" className="h-12 bg-white border-slate-300" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-3">
                      <FormField
                        control={expenseForm.control}
                        name="isBillable"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border border-slate-300 bg-white p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base font-medium">Billable to Client</FormLabel>
                              <p className="text-sm text-muted-foreground">
                                Mark if this expense can be billed to a customer/project
                              </p>
                            </div>
                            <FormControl>
                              <input
                                type="checkbox"
                                checked={field.value}
                                onChange={(e) => field.onChange(e.target.checked)}
                                className="h-5 w-5"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={expenseForm.control}
                        name="isRecurring"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border border-slate-300 bg-white p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base font-medium">Recurring Expense</FormLabel>
                              <p className="text-sm text-muted-foreground">
                                This expense repeats regularly
                              </p>
                            </div>
                            <FormControl>
                              <input
                                type="checkbox"
                                checked={field.value}
                                onChange={(e) => field.onChange(e.target.checked)}
                                className="h-5 w-5"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      {expenseForm.watch('isRecurring') && (
                        <FormField
                          control={expenseForm.control}
                          name="recurringPeriod"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium text-slate-700">Recurring Period</FormLabel>
                              <Select value={field.value} onValueChange={field.onChange}>
                                <FormControl>
                                  <SelectTrigger className="h-12 bg-white border-slate-300">
                                    <SelectValue placeholder="Select period" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="weekly">Weekly</SelectItem>
                                  <SelectItem value="monthly">Monthly</SelectItem>
                                  <SelectItem value="quarterly">Quarterly</SelectItem>
                                  <SelectItem value="yearly">Yearly</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>

                    {/* Mileage Fields */}
                    <div className="pt-4 border-t border-slate-300">
                      <h4 className="text-sm font-semibold text-slate-900 mb-3">Mileage (Optional)</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={expenseForm.control}
                          name="mileage"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium text-slate-700">Miles/KM</FormLabel>
                              <FormControl>
                                <Input type="number" step="0.1" placeholder="0" className="h-12 bg-white border-slate-300" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={expenseForm.control}
                          name="mileageRate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium text-slate-700">Rate per Mile/KM</FormLabel>
                              <FormControl>
                                <Input type="number" step="0.01" placeholder="0.67" className="h-12 bg-white border-slate-300" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              </div>
              
              {/* Expense Summary Card */}
              <div className="px-6 pb-4">
                <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-700">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Calculator className="w-5 h-5 text-emerald-400" />
                      Expense Summary
                    </h3>
                    <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                      Live Preview
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    {/* Base Amount */}
                    <div className="flex items-center justify-between py-2 border-b border-slate-700/50">
                      <span className="text-slate-300 text-sm font-medium">Base Amount</span>
                      <span className="text-white text-lg font-semibold">
                        {expenseForm.watch('currency') || 'USD'} {(Number(expenseForm.watch('amount')) || 0).toFixed(2)}
                      </span>
                    </div>
                    
                    {/* Tax Amount */}
                    {(expenseForm.watch('taxRate') || expenseForm.watch('taxAmount')) && (
                      <div className="flex items-center justify-between py-2 border-b border-slate-700/50">
                        <span className="text-slate-300 text-sm font-medium flex items-center gap-2">
                          Tax
                          {expenseForm.watch('taxRate') && (
                            <Badge className="bg-slate-700 text-slate-300 text-xs">
                              {Number(expenseForm.watch('taxRate')).toFixed(2)}%
                            </Badge>
                          )}
                        </span>
                        <span className="text-emerald-400 text-lg font-semibold">
                          +{(Number(expenseForm.watch('taxAmount')) || 0).toFixed(2)}
                        </span>
                      </div>
                    )}
                    
                    {/* Mileage Calculation */}
                    {(expenseForm.watch('mileage') && expenseForm.watch('mileageRate')) && (
                      <div className="flex items-center justify-between py-2 border-b border-slate-700/50">
                        <span className="text-slate-300 text-sm font-medium flex items-center gap-2">
                          Mileage
                          <Badge className="bg-slate-700 text-slate-300 text-xs">
                            {Number(expenseForm.watch('mileage')).toFixed(1)} × ${Number(expenseForm.watch('mileageRate')).toFixed(2)}
                          </Badge>
                        </span>
                        <span className="text-blue-400 text-lg font-semibold">
                          ${((Number(expenseForm.watch('mileage')) || 0) * (Number(expenseForm.watch('mileageRate')) || 0)).toFixed(2)}
                        </span>
                      </div>
                    )}
                    
                    {/* Total Amount */}
                    <div className="flex items-center justify-between pt-3 mt-2 border-t-2 border-emerald-500/30">
                      <span className="text-white text-lg font-bold">Total Expense</span>
                      <div className="text-right">
                        <div className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
                          {expenseForm.watch('currency') || 'USD'} {(
                            (Number(expenseForm.watch('amount')) || 0) + 
                            (Number(expenseForm.watch('taxAmount')) || 0)
                          ).toFixed(2)}
                        </div>
                        {expenseForm.watch('isBillable') && (
                          <Badge className="mt-1 bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Billable to Client
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
              
              <div className="sticky bottom-0 bg-gradient-to-r from-white via-slate-50 to-white border-t-2 border-slate-200 p-6 shadow-2xl">
                <div className="flex items-center justify-between w-full">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsCreateExpenseOpen(false)}
                    disabled={createExpense.isPending}
                    className="h-14 px-8 text-base font-semibold border-2 border-slate-300 hover:bg-slate-100 transition-all duration-200"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createExpense.isPending}
                    className="h-14 px-10 text-base font-bold bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 hover:from-emerald-700 hover:via-green-700 hover:to-teal-700 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                  >
                    {createExpense.isPending ? (
                      <>
                        <div className="w-5 h-5 mr-2 animate-spin rounded-full border-3 border-white border-t-transparent"></div>
                        Creating Expense...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Create Expense
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* View Expense Dialog */}
      <Dialog open={isViewExpenseOpen} onOpenChange={(open) => {
        setIsViewExpenseOpen(open)
        if (!open) {
          setSelectedExpense(null)
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Expense Details</DialogTitle>
            <DialogDescription>View complete information about this expense</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 hover:scrollbar-thumb-slate-400 pr-2">
            {expenseDetailsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : expenseDetails ? (
              <div className="space-y-6 pb-4">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Description</label>
                  <p className="text-lg font-medium">{expenseDetails.description}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Amount</label>
                  <p className="text-lg font-bold text-green-600">${Number(expenseDetails.totalAmount ?? expenseDetails.amount ?? 0).toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Date</label>
                  <p className="text-lg">{expenseDetails.expenseDate ? new Date(expenseDetails.expenseDate).toLocaleDateString() : '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <div className="mt-1">
                    <Badge variant={expenseDetails.status === 'paid' ? 'default' : 'secondary'}>
                      {expenseDetails.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Category</label>
                  <p className="text-lg">{expenseDetails.category?.name || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Vendor</label>
                  <p className="text-lg">{expenseDetails.vendorName || '-'}</p>
                </div>
              </div>

              {/* Additional Information */}
              {(expenseDetails.notes || expenseDetails.department || expenseDetails.project) && (
                <div className="space-y-4">
                  <Separator />
                  <h3 className="text-lg font-medium">Additional Information</h3>
                  <div className="grid grid-cols-1 gap-4">
                    {expenseDetails.notes && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Notes</label>
                        <p className="text-lg">{expenseDetails.notes}</p>
                      </div>
                    )}
                    {expenseDetails.department && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Department</label>
                        <p className="text-lg">{expenseDetails.department}</p>
                      </div>
                    )}
                    {expenseDetails.project && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Project</label>
                        <p className="text-lg">{expenseDetails.project}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Receipt */}
              {expenseDetails.receiptUrl && (
                <div className="space-y-4">
                  <Separator />
                  <h3 className="text-lg font-medium">Receipt</h3>
                  <div className="flex items-center space-x-4">
                    <Button variant="outline" onClick={() => window.open(expenseDetails.receiptUrl, '_blank')}>
                      View Receipt
                    </Button>
                  </div>
                </div>
              )}

              {/* Journal Entries */}
              <div className="space-y-4">
                <Separator />
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Journal Entries
                </h3>
                <ExpenseJournalEntries expenseId={expenseDetails.id} />
              </div>

              {/* Timestamps */}
              <div className="space-y-4">
                <Separator />
                <h3 className="text-lg font-medium">Timestamps</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Created</label>
                    <p className="text-lg">{expenseDetails.createdAt ? new Date(expenseDetails.createdAt).toLocaleString() : '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Last Updated</label>
                    <p className="text-lg">{expenseDetails.updatedAt ? new Date(expenseDetails.updatedAt).toLocaleString() : '-'}</p>
                  </div>
                </div>
              </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No expense details found</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      </>
    </PageLayout>
  )
}
