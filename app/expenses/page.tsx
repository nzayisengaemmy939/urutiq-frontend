'use client'

import { useState, useMemo } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useDemoAuth } from '@/hooks/useDemoAuth'
import { expenseApi, budgetsApi, companiesApi } from '@/lib/api/accounting'
import { PageLayout } from '@/components/page-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { SegmentedTabs } from '@/components/ui/segmented-tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { ReceiptCaptureModal } from '@/components/receipt-capture'
import { ExpenseReportModal } from '@/components/expense-report-modal'
import { ReimburseExpenseModal } from '@/components/reimburse-expense-modal'
import { ExpenseMatchingModal } from '@/components/expense-matching-modal'
import { EditExpenseModal } from '@/components/edit-expense-modal'
import { CardCsvImportModal } from '@/components/card-csv-import'
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
  ChevronDown
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
  conditions: z.string().min(1, 'Conditions are required'),
  actions: z.string().min(1, 'Actions are required'),
  priority: z.coerce.number().int().min(1, 'Priority must be at least 1')
})

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
  const [isCreateRuleOpen, setIsCreateRuleOpen] = useState(false)
  const [editingRule, setEditingRule] = useState<ExpenseRule | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory | null>(null)
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [receiptOpen, setReceiptOpen] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)
  const [reimburseOpen, setReimburseOpen] = useState(false)
  const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(null)
  const [matchingOpen, setMatchingOpen] = useState(false)
  const [matchingContext, setMatchingContext] = useState<{ amount?: number; date?: string; description?: string } | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<any | null>(null)
  const [cardImportOpen, setCardImportOpen] = useState(false)
  
  const queryClient = useQueryClient()

  // Fetch data
  const { data: categories, isLoading: categoriesLoading } = useQuery<any>({
    queryKey: ['expense-categories', searchTerm],
    queryFn: async () => {
  return await expenseApi.getExpenseCategories({ q: searchTerm || undefined }) as any
    }
  })

  const { data: budgets, isLoading: budgetsLoading } = useQuery<any>({
    queryKey: ['budgets'],
  queryFn: async () => await budgetsApi.getBudgets() as any
  })

  const { data: rules, isLoading: rulesLoading } = useQuery<any>({
    queryKey: ['expense-rules'],
  queryFn: async () => await expenseApi.getExpenseRules() as any
  })

  const { data: companies } = useQuery<any>({
    queryKey: ['companies'],
    queryFn: async () => await companiesApi.getCompanies() as any,
    enabled: authReady
  })

  const { data: analytics } = useQuery<any>({
    queryKey: ['budget-analytics'],
  queryFn: async () => await budgetsApi.getBudgetAnalytics() as any
  })

  // Expenses list (loaded when expenses tab is active)
  const { data: expenses, isLoading: expensesLoading } = useQuery<any>({
    queryKey: ['expenses', expenseStatus, expenseCategoryId, expenseDepartment, expenseProject],
    enabled: activeTab === 'expenses',
    queryFn: async () => await expenseApi.getExpenses(undefined, expenseStatus === 'all' ? undefined : expenseStatus, expenseCategoryId || undefined) as any
  })

  const submitExpense = useMutation({
    mutationFn: async (id: string) => expenseApi.submitExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      toast.success('Expense submitted')
    }
  })

  const approveExpense = useMutation({
    mutationFn: async (id: string) => expenseApi.approveExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      toast.success('Expense approved')
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

  // Mutations
  const createCategory = useMutation({
    mutationFn: async (data: any) => expenseApi.createExpenseCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense-categories'] })
      setIsCreateCategoryOpen(false)
      toast.success('Expense category created successfully')
    },
    onError: (error) => {
      toast.error('Failed to create expense category')
    }
  })

  const createBudget = useMutation({
    mutationFn: async (data: any) => budgetsApi.createBudget(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
      queryClient.invalidateQueries({ queryKey: ['budget-analytics'] })
      setIsCreateBudgetOpen(false)
      toast.success('Budget created successfully')
    },
    onError: (error) => {
      toast.error('Failed to create budget')
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
      toast.success('Expense rule updated')
    },
    onError: () => toast.error('Failed to update expense rule')
  })

  const deleteRule = useMutation({
    mutationFn: async (id: string) => expenseApi.deleteExpenseRule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense-rules'] })
      toast.success('Expense rule deleted')
    },
    onError: () => toast.error('Failed to delete expense rule')
  })

  // Form setup
  const categoryForm = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: {}
  })

  const budgetForm = useForm({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      period: 'monthly' as const
    }
  })

  const ruleForm = useForm({
    resolver: zodResolver(ruleSchema),
    defaultValues: {
      priority: 1
    }
  })

  // Computed values
  const filteredCategories = useMemo(() => {
  if (!categories) return []
  // API may return an array or a paginated object { items: [] } or { data: [] }
  if (Array.isArray(categories)) return categories
  if (categories.items) return categories.items
  if ((categories as any).data) return (categories as any).data
  return []
  }, [categories])

  const filteredBudgets = useMemo(() => {
  if (!budgets) return []
  if (Array.isArray(budgets)) return budgets
  if (budgets.items) return budgets.items
  if ((budgets as any).data) return (budgets as any).data
  return []
  }, [budgets])

  const filteredRules = useMemo(() => {
  if (!rules) return []
  if (Array.isArray(rules)) return rules
  if (rules.items) return rules.items
  if ((rules as any).data) return (rules as any).data
  return []
  }, [rules])

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
    createCategory.mutate(data)
  }

  const onSubmitBudget = (data: any) => {
    createBudget.mutate(data)
  }

  const onSubmitRule = (data: any) => {
    if (editingRule) {
      updateRule.mutate({ id: (editingRule as any).id, data })
    } else {
      createRule.mutate(data)
    }
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
            <Button variant="outline" size="sm" aria-label={`Edit category ${category.name}`}>
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Expense Management</h1>
            <p className="text-gray-600 mt-1">Manage expense categories, budgets, and spending rules</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setReceiptOpen(true)}>Scan Receipt</Button>
            <Button variant="outline" onClick={() => setReportOpen(true)}>Export Report</Button>
          </div>
        </div>

        {/* Analytics Cards */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <FolderTree className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Categories</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.totalCategories}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Budgets</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.activeBudgets}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Budgeted</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${analytics.totalBudgetedAmount?.toLocaleString() || '0'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Spent</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${analytics.totalSpentAmount?.toLocaleString() || '0'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Expense Management</CardTitle>
              <div className="flex items-center space-x-2">
                {activeTab === 'categories' && (
                  <Dialog open={isCreateCategoryOpen} onOpenChange={setIsCreateCategoryOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        New Category
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create Expense Category</DialogTitle>
                      </DialogHeader>
                      <Form {...categoryForm}>
                        <form onSubmit={categoryForm.handleSubmit(onSubmitCategory)} className="space-y-4">
                          <FormField
                            control={categoryForm.control}
                            name="companyId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Company</FormLabel>
                                <Select value={field.value} onValueChange={field.onChange}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select company" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {(Array.isArray(companies) ? companies : (companies as any)?.items || (companies as any)?.data || []).map((company: any) => (
                                      <SelectItem key={company.id} value={company.id}>
                                        {company.name}
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
                            <Button type="button" variant="outline" onClick={() => setIsCreateCategoryOpen(false)}>
                              Cancel
                            </Button>
                            <Button type="submit" disabled={createCategory.status === 'pending'}>
                              {createCategory.status === 'pending' ? 'Creating...' : 'Create Category'}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                )}
                
                {activeTab === 'budgets' && (
                  <Dialog open={isCreateBudgetOpen} onOpenChange={setIsCreateBudgetOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        New Budget
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create Budget</DialogTitle>
                      </DialogHeader>
                      <Form {...budgetForm}>
                        <form onSubmit={budgetForm.handleSubmit(onSubmitBudget)} className="space-y-4">
                          <FormField
                            control={budgetForm.control}
                            name="companyId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Company</FormLabel>
                                <Select value={field.value} onValueChange={field.onChange}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select company" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {(Array.isArray(companies) ? companies : (companies as any)?.items || (companies as any)?.data || []).map((company: any) => (
                                      <SelectItem key={company.id} value={company.id}>
                                        {company.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={budgetForm.control}
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
                            control={budgetForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Budget Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Q1 Office Supplies Budget" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={budgetForm.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                  <Textarea placeholder="Budget description..." {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={budgetForm.control}
                              name="period"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Period</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
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
                            
                            <FormField
                              control={budgetForm.control}
                              name="amount"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Amount</FormLabel>
                                  <FormControl>
                                    <Input type="number" step="0.01" placeholder="0.00" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={budgetForm.control}
                              name="startDate"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Start Date</FormLabel>
                                  <FormControl>
                                    <Input type="date" {...field} />
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
                                  <FormLabel>End Date</FormLabel>
                                  <FormControl>
                                    <Input type="date" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <FormField
                            control={budgetForm.control}
                            name="alertThreshold"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Alert Threshold (%)</FormLabel>
                                <FormControl>
                                  <Input type="number" step="1" placeholder="80" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="flex justify-end space-x-2">
                            <Button type="button" variant="outline" onClick={() => setIsCreateBudgetOpen(false)}>
                              Cancel
                            </Button>
                            <Button type="submit" disabled={createBudget.status === 'pending'}>
                              {createBudget.status === 'pending' ? 'Creating...' : 'Create Budget'}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                )}
                
                {activeTab === 'rules' && (
                  <Dialog open={isCreateRuleOpen} onOpenChange={setIsCreateRuleOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        New Rule
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create Expense Rule</DialogTitle>
                      </DialogHeader>
                      <Form {...ruleForm}>
                        <form onSubmit={ruleForm.handleSubmit(onSubmitRule)} className="space-y-4">
                          <FormField
                            control={ruleForm.control}
                            name="companyId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Company</FormLabel>
                                <Select value={field.value} onValueChange={field.onChange}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select company" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {(Array.isArray(companies) ? companies : (companies as any)?.items || (companies as any)?.data || []).map((company: any) => (
                                      <SelectItem key={company.id} value={company.id}>
                                        {company.name}
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
                          
                          <FormField
                            control={ruleForm.control}
                            name="conditions"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Conditions (JSON)</FormLabel>
                                <FormControl>
                                  <Textarea placeholder='{"amount": 1000, "vendor": "restricted"}' {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={ruleForm.control}
                            name="actions"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Actions (JSON)</FormLabel>
                                <FormControl>
                                  <Textarea placeholder='{"require_approval": true, "notify_manager": true}' {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
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
                          
                          <div className="flex justify-end space-x-2">
                            <Button type="button" variant="outline" onClick={() => setIsCreateRuleOpen(false)}>
                              Cancel
                            </Button>
                            <Button type="submit" disabled={createRule.status === 'pending'}>
                              {createRule.status === 'pending' ? 'Creating...' : 'Create Rule'}
                            </Button>
                          </div>
                        </form>
                      </Form>
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
          <CardContent>
            <SegmentedTabs
              tabs={[
                { id: 'categories', label: 'Categories' },
                { id: 'budgets', label: 'Budgets' },
                { id: 'rules', label: 'Rules' },
                { id: 'expenses', label: 'Expenses' },
              ]}
              value={activeTab}
              onChange={(id) => setActiveTab(id)}
            />

            {activeTab === 'categories' && (
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search categories..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
                
                {categoriesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {renderCategoryTree(filteredCategories)}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'budgets' && (
              <div className="space-y-4">
                {budgetsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Budget Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Period</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Spent</TableHead>
                        <TableHead>Utilization</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredBudgets.map((budget: Budget) => {
                        const status = getBudgetStatus(budget)
                        const utilization = getBudgetUtilization(budget)
                        
                        return (
                          <TableRow key={budget.id}>
                            <TableCell className="font-medium">{budget.name}</TableCell>
                            <TableCell>{budget.category.name}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{budget.period}</Badge>
                            </TableCell>
                            <TableCell>
                              ${budget.amount.toLocaleString()}
                            </TableCell>
                            <TableCell>
                              ${budget.spentAmount.toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Progress value={utilization} className="w-20" />
                                <span className="text-sm text-gray-600">
                                  {Math.round(utilization)}%
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={getBudgetStatusColor(status)}>
                                {status === 'over-budget' && <AlertTriangle className="w-3 h-3 mr-1" />}
                                {status === 'near-limit' && <AlertTriangle className="w-3 h-3 mr-1" />}
                                {status === 'within-budget' && <CheckCircle className="w-3 h-3 mr-1" />}
                                {status.replace('-', ' ')}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Button variant="outline" size="sm" aria-label={`View budget ${budget.name}`}>
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button variant="outline" size="sm" aria-label={`Edit budget ${budget.name}`}>
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
            )}

            {activeTab === 'rules' && (
              <div className="space-y-4">
                {rulesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Rule Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRules.map((rule: ExpenseRule) => (
                        <TableRow key={rule.id}>
                          <TableCell className="font-medium">{rule.name}</TableCell>
                          <TableCell>{rule.category.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{rule.ruleType.replace('_', ' ')}</Badge>
                          </TableCell>
                          <TableCell>{rule.priority}</TableCell>
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
                                  ruleForm.reset({
                                    companyId: (companies as any)?.[0]?.id || '',
                                    categoryId: rule.category?.id || '',
                                    name: rule.name,
                                    description: rule.description || '',
                                    ruleType: rule.ruleType as any,
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
            )}

            {activeTab === 'expenses' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
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
                  <Select value={expenseCategoryId || 'all'} onValueChange={(v) => setExpenseCategoryId(v === 'all' ? '' : v)}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
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
                    const lines = [header.join(','), ...rows.map(r => [r.date, JSON.stringify(r.description || '').replaceAll('"','""'), JSON.stringify(r.category || '').replaceAll('"','""'), JSON.stringify(r.department || '').replaceAll('"','""'), JSON.stringify(r.project || '').replaceAll('"','""'), r.status, r.amount].join(','))]
                    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `expenses_${new Date().toISOString().slice(0,10)}.csv`
                    a.click()
                    setTimeout(() => URL.revokeObjectURL(url), 30000)
                  }}>Export CSV</Button>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Dept</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expensesLoading ? (
                      <TableRow>
                        <TableCell colSpan={6}>
                          <div className="flex items-center justify-center py-6">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      ((Array.isArray(expenses) ? expenses : expenses?.items || expenses?.data || []) as any[])
                        .filter((e) => !searchTerm || (e.description || '').toLowerCase().includes(searchTerm.toLowerCase()))
                        .filter((e) => !expenseStartDate || String(e.expenseDate || '').slice(0,10) >= expenseStartDate)
                        .filter((e) => !expenseEndDate || String(e.expenseDate || '').slice(0,10) <= expenseEndDate)
                        .filter((e) => !expenseDepartment || ((e.description || '').toLowerCase().includes(`[dept: ${expenseDepartment.toLowerCase()}`)))
                        .filter((e) => !expenseProject || ((e.description || '').toLowerCase().includes(`[proj: ${expenseProject.toLowerCase()}`)))
                        .map((e) => (
                          <TableRow key={e.id}>
                            <TableCell>{e.expenseDate?.slice(0,10)}</TableCell>
                            <TableCell className="font-medium">{e.description}</TableCell>
                            <TableCell>{e.category?.name || '-'}</TableCell>
                            <TableCell>{(e as any).department ? String((e as any).department).toUpperCase() : (() => { const m = String(e.description || '').toLowerCase().match(/\[dept:\s*([^\]]+)/); return m ? m[1].toUpperCase() : '-' })()}</TableCell>
                            <TableCell>{(e as any).project || (() => { const m = String(e.description || '').toLowerCase().match(/\[proj:\s*([^\]]+)/); return m ? m[1] : '-' })()}</TableCell>
                            <TableCell>
                              <Badge variant={e.status === 'paid' ? 'default' : 'secondary'}>{e.status}</Badge>
                            </TableCell>
                            <TableCell>${Number(e.totalAmount ?? e.amount ?? 0).toLocaleString()}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {e.status === 'draft' && (
                                  <Button size="sm" variant="outline" disabled={submitExpense.isPending} onClick={() => handleSubmitExpense(e)}>Submit</Button>
                                )}
                                {e.status === 'submitted' && (
                                  <>
                                    <Button size="sm" variant="outline" disabled={approveExpense.isPending} onClick={() => handleApproveExpense(e)}>Approve</Button>
                                    <Button size="sm" variant="outline" onClick={() => { setMatchingContext({ amount: Number(e.totalAmount ?? e.amount ?? 0), date: e.expenseDate?.slice(0,10), description: e.description }); setMatchingOpen(true) }}>Match</Button>
                                  </>
                                )}
                                {e.status === 'approved' && (
                                  <Button size="sm" variant="outline" onClick={() => { setSelectedExpenseId(e.id); setReimburseOpen(true) }}>Reimburse</Button>
                                )}
                                <Button size="sm" variant="outline" onClick={() => { setEditingExpense(e); setEditOpen(true) }}>Edit</Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <ReceiptCaptureModal open={receiptOpen} onOpenChange={setReceiptOpen} onCreated={() => queryClient.invalidateQueries({ queryKey: ['expenses'] })} />
      <ExpenseReportModal open={reportOpen} onOpenChange={setReportOpen} />
      <ReimburseExpenseModal open={reimburseOpen} onOpenChange={(v) => { setReimburseOpen(v); if (!v) { setSelectedExpenseId(null); queryClient.invalidateQueries({ queryKey: ['expenses'] }) } }} expenseId={selectedExpenseId} />
      <ExpenseMatchingModal open={matchingOpen} onOpenChange={setMatchingOpen} amount={matchingContext?.amount} date={matchingContext?.date} description={matchingContext?.description} />
      <EditExpenseModal open={editOpen} onOpenChange={(v) => { setEditOpen(v); if (!v) { setEditingExpense(null); queryClient.invalidateQueries({ queryKey: ['expenses'] }) } }} expense={editingExpense} />
      <CardCsvImportModal open={cardImportOpen} onOpenChange={(v) => { setCardImportOpen(v); if (!v) { queryClient.invalidateQueries({ queryKey: ['expenses'] }) } }} />
    </PageLayout>
  )
}
