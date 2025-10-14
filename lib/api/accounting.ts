// API service for accounting-related backend interactions
import { apiService } from '../api'

// Types for Account Types
export interface AccountType {
  id: string
  code: string
  name: string
  description?: string
  normalBalance: 'debit' | 'credit'
  category?: string
  companyId?: string
  tenantId?: string
  createdAt?: string
  updatedAt?: string
}

// Types for Chart of Accounts
export interface Account {
  id: string
  code: string
  name: string
  description?: string
  accountTypeId: string
  accountType?: string
  parentId?: string
  parent?: Account
  children: Account[]
  isActive: boolean
  companyId?: string
  tenantId?: string
  createdAt?: string
  updatedAt?: string
}

// Types for Journal Entries
export interface JournalEntry {
  id: string
  reference: string
  description: string
  date: string
  lines: JournalLine[]
  isPosted: boolean
  companyId?: string
  tenantId?: string
  createdAt?: string
  updatedAt?: string
}

export interface JournalLine {
  id: string
  accountId: string
  description: string
  debit: number
  credit: number
  account?: Account
}

// Types for Account Balances
export interface AccountBalance {
  accountId: string
  debitBalance: number
  creditBalance: number
  netBalance: number
  asOf: string
}

// Types for Account Summary
export interface AccountSummary {
  totalAccounts: number
  activeAccounts: number
  totalAccountTypes: number
  maxDepth: number
  lastUpdated: string
}

// Types for Trial Balance
export interface TrialBalanceData {
  accounts: AccountBalance[]
  totalDebits: number
  totalCredits: number
  difference: number
  asOf: string
  pagination: PaginationInfo
}

// Pagination interface
export interface PaginationInfo {
  page: number
  pageSize: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
  totalCount: number
}

// Types for General Ledger
export interface GeneralLedgerData {
  entries: LedgerEntry[]
  totalEntries: number
  period: {
    start: string
    end: string
  }
  runningBalance: number
  pagination: PaginationInfo
}

export interface LedgerEntry {
  id: string
  date: string
  accountId: string
  reference: string
  description: string
  debit: number
  credit: number
  account?: Account
}

// Company interface
export interface Company {
  id: string
  name: string
  description?: string
  tenantId?: string
  createdAt?: string
  updatedAt?: string
}

// Types for Purchase and Expense Management
export interface Vendor {
  id: string
  name: string
  email?: string
  phone?: string
  taxNumber?: string
  address?: string
  companyId: string
  tenantId?: string
  createdAt?: string
  updatedAt?: string
}

export interface Bill {
  id: string
  billNumber: string
  billDate: string
  dueDate?: string
  vendorId: string
  vendor?: Vendor
  companyId: string
  company?: Company
  status: 'draft' | 'posted' | 'paid' | 'cancelled'
  totalAmount: number
  balanceDue: number
  currency: string
  purchaseType: 'local' | 'import'
  vendorCurrency?: string
  exchangeRate?: number
  freightCost?: number
  customsDuty?: number
  otherImportCosts?: number
  allocateLandedCost?: boolean
  landedCostAllocated?: boolean
  lines: BillLine[]
  tenantId?: string
  createdAt?: string
  updatedAt?: string
}

export interface BillLine {
  id: string
  billId: string
  productId?: string
  product?: Product
  description: string
  quantity: number
  unitPrice: number
  taxRate: number
  lineTotal: number
  tenantId?: string
}

export interface Product {
  id: string
  name: string
  sku: string
  description?: string
  type: 'inventory' | 'non-inventory' | 'service'
  unitPrice: number
  costPrice: number
  stockQuantity: number
  companyId: string
  tenantId?: string
  createdAt?: string
  updatedAt?: string
}

export interface ExpenseCategory {
  id: string
  name: string
  description?: string
  accountId: string
  account?: Account
  companyId: string
  tenantId?: string
  createdAt?: string
  updatedAt?: string
}

// Budget interface (used by budgetsApi and frontend pages)
export interface Budget {
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
  tenantId?: string
  createdAt?: string
  updatedAt?: string
}

export interface Employee {
  id: string
  name: string
  email?: string
  employeeId?: string
  companyId: string
  tenantId?: string
  createdAt?: string
  updatedAt?: string
}

export interface Expense {
  id: string
  expenseNumber: string
  expenseDate: string
  categoryId: string
  category?: ExpenseCategory
  vendorId?: string
  vendor?: Vendor
  employeeId?: string
  employee?: Employee
  amount: number
  taxAmount: number
  totalAmount: number
  description: string
  department?: string
  project?: string
  receiptUrl?: string
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'paid'
  companyId: string
  tenantId?: string
  createdAt?: string
  updatedAt?: string
}

export interface PurchaseOrder {
  id: string
  poNumber: string
  poDate: string
  expectedDeliveryDate?: string
  vendorId: string
  vendor?: Vendor
  companyId: string
  company?: Company
  status: 'draft' | 'sent' | 'confirmed' | 'received' | 'cancelled'
  totalAmount: number
  currency: string
  notes?: string
  lines: PurchaseOrderLine[]
  tenantId?: string
  createdAt?: string
  updatedAt?: string
}

export interface PurchaseOrderLine {
  id: string
  purchaseOrderId: string
  productId?: string
  product?: Product
  description: string
  quantity: number
  unitPrice: number
  totalAmount: number
  tenantId?: string
}

import { config, getCompanyId, getTenantId } from '../config'

// Default company ID for demo purposes
const DEFAULT_COMPANY_ID = config.demo.companyId
const DEFAULT_TENANT_ID = config.demo.tenantId

// NOTE: `apiService` already returns the typed payload (not a {data,..} wrapper),
// so call it directly and return the result.

// Helper function to get API headers.
// Prefer tenant/company IDs stored in localStorage (set by auth flow) when running in browser.
// Fall back to defaults for server or demo environments.
const getHeaders = () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-tenant-id': getTenantId(),
    'x-company-id': getCompanyId()
  }
  
  // Add Authorization header if token exists
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token')
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
  }
  
  return headers
}

// Account Types API
const accountTypesApi = {
  getAll: async (companyId?: string): Promise<AccountType[]> => {
    const params = new URLSearchParams()
    if (companyId) {
      params.append('companyId', companyId)
    }
    
    return await apiService.get<AccountType[]>(`/account-types?${params.toString()}`, {
      headers: getHeaders()
    })
  },

  getById: async (id: string): Promise<AccountType> => {
    return await apiService.get<AccountType>(`/account-types/${id}`, {
      headers: getHeaders()
    })
  },

  create: async (data: Partial<AccountType>): Promise<AccountType> => {
    return await apiService.post<AccountType>('/account-types', {
      ...data,
      companyId: data.companyId // Don't use DEFAULT_COMPANY_ID fallback
    }, {
      headers: getHeaders()
    })
  },

  update: async (id: string, data: Partial<AccountType>): Promise<AccountType> => {
    return await apiService.put<AccountType>(`/account-types/${id}`, data, {
      headers: getHeaders()
    })
  },

  delete: async (id: string): Promise<void> => {
    await apiService.delete<void>(`/account-types/${id}`, {
      headers: getHeaders()
    })
  }
}

// Chart of Accounts API (normalized return shape)
const chartOfAccountsApi = {
  // Always return { accounts, pagination }
  getAll: async (companyId?: string, includeInactive = false, page?: number, pageSize?: number): Promise<{ accounts: Account[]; pagination: PaginationInfo }> => {
    const params = new URLSearchParams()
    if (companyId) {
      params.append('companyId', companyId)
    }
    if (includeInactive) {
      params.append('includeInactive', 'true')
    }
    if (page) {
      params.append('page', page.toString())
    }
    if (pageSize) {
      params.append('pageSize', pageSize.toString())
    }
    
    const res = await apiService.get<Account[] | { accounts: Account[], pagination: PaginationInfo }>(`/accounts?${params.toString()}`, { headers: getHeaders() })
    if (Array.isArray(res)) {
      const pagination: PaginationInfo = { page: 1, pageSize: res.length, totalPages: 1, hasNext: false, hasPrev: false, totalCount: res.length }
      return { accounts: res, pagination }
    }
    return { accounts: (res as any)?.accounts || [], pagination: (res as any)?.pagination || { page: 1, pageSize: 0, totalPages: 1, hasNext: false, hasPrev: false, totalCount: 0 } }
  },

  getById: async (id: string): Promise<Account> => {
    return await apiService.get<Account>(`/accounts/${id}`, {
      headers: getHeaders()
    })
  },

    create: async (data: Partial<Account>): Promise<Account> => {
      const requestData = {
        ...data,
        companyId: data.companyId // Don't use DEFAULT_COMPANY_ID fallback - let backend get it from x-company-id header
      };
      return await apiService.post<Account>('/accounts', requestData, {
        headers: getHeaders()
      })
    },

  update: async (id: string, data: Partial<Account>): Promise<Account> => {
    return await apiService.put<Account>(`/accounts/${id}`, data, {
      headers: getHeaders()
    })
  },

  delete: async (id: string): Promise<void> => {
    await apiService.delete<void>(`/accounts/${id}`, {
      headers: getHeaders()
    })
  },

  getBalance: async (id: string, asOf?: string): Promise<AccountBalance> => {
    const params = new URLSearchParams()
    if (asOf) {
      params.append('asOf', asOf)
    }
    
    return await apiService.get<AccountBalance>(`/accounts/${id}/balance?${params.toString()}`, {
      headers: getHeaders()
    })
  },

  getSummary: async (companyId?: string): Promise<AccountSummary> => {
    const params = new URLSearchParams()
    if (companyId || DEFAULT_COMPANY_ID) {
      params.append('companyId', companyId || DEFAULT_COMPANY_ID)
    }
    
    return await apiService.get<AccountSummary>(`/accounts/summary?${params.toString()}`, {
      headers: getHeaders()
    })
  }
}

// Journal Entries API (normalized)
const journalEntriesApi = {
  getAll: async (companyId?: string, page?: number, pageSize?: number): Promise<{ entries: JournalEntry[]; pagination: PaginationInfo }> => {
    const params = new URLSearchParams()
    if (companyId || DEFAULT_COMPANY_ID) {
      params.append('companyId', companyId || DEFAULT_COMPANY_ID)
    }
    if (page) {
      params.append('page', page.toString())
    }
    if (pageSize) {
      params.append('pageSize', pageSize.toString())
    }
    
    const res = await apiService.get<any>(`/journal?${params.toString()}`, { headers: getHeaders() })
    const entries: JournalEntry[] = (res as any)?.entries || res || []
    const pagination: PaginationInfo = (res as any)?.pagination || { page: page || 1, pageSize: entries.length, totalPages: 1, hasNext: false, hasPrev: !!page && page > 1, totalCount: entries.length }
    return { entries, pagination }
  },

  getById: async (id: string): Promise<JournalEntry> => {
    return await apiService.get<JournalEntry>(`/journal/${id}`, {
      headers: getHeaders()
    })
  },

  create: async (data: Partial<JournalEntry>): Promise<JournalEntry> => {
    return await apiService.post<JournalEntry>('/journal', {
      ...data,
      companyId: data.companyId || DEFAULT_COMPANY_ID
    }, {
      headers: getHeaders()
    })
  },

  update: async (id: string, data: Partial<JournalEntry>): Promise<JournalEntry> => {
    return await apiService.put<JournalEntry>(`/journal/${id}`, data, {
      headers: getHeaders()
    })
  },

  delete: async (id: string): Promise<void> => {
    await apiService.delete<void>(`/journal/${id}`, {
      headers: getHeaders()
    })
  },

  post: async (id: string): Promise<void> => {
    await apiService.post<void>(`/journal/${id}/post`, {}, {
      headers: getHeaders()
    })
  }
}

// Account Mappings API
const accountMappingsApi = {
  getAll: async (companyId?: string): Promise<any[]> => {
    const params = new URLSearchParams()
    if (companyId || DEFAULT_COMPANY_ID) {
      params.append('companyId', companyId || DEFAULT_COMPANY_ID)
    }
    
    return await apiService.get<any[]>(`/account-mappings?${params.toString()}`, {
      headers: getHeaders()
    })
  },

  create: async (data: any): Promise<any> => {
    return await apiService.post<any>('/account-mappings', {
      ...data,
      companyId: data.companyId || DEFAULT_COMPANY_ID
    }, {
      headers: getHeaders()
    })
  }
}

// Trial Balance API
const trialBalanceApi = {
  getTrialBalance: async (asOf: string, companyId?: string, page?: number, pageSize?: number): Promise<TrialBalanceData> => {
    const params = new URLSearchParams()
    params.append('asOf', asOf)
    if (companyId || DEFAULT_COMPANY_ID) {
      params.append('companyId', companyId || DEFAULT_COMPANY_ID)
    }
    if (page) {
      params.append('page', page.toString())
    }
    if (pageSize) {
      params.append('pageSize', pageSize.toString())
    }
    
    return await apiService.get<TrialBalanceData>(`/journal/trial-balance?${params.toString()}`, {
      headers: getHeaders()
    })
  }
}

// General Ledger API
const generalLedgerApi = {
  getGeneralLedger: async (params: {
    startDate: string
    endDate: string
    accountId?: string
    accountType?: string
    companyId?: string
    page?: number
    pageSize?: number
  }): Promise<GeneralLedgerData> => {
    const queryParams = new URLSearchParams()
    queryParams.append('startDate', params.startDate)
    queryParams.append('endDate', params.endDate)
    if (params.accountId) {
      queryParams.append('accountId', params.accountId)
    }
    if (params.accountType) {
      queryParams.append('accountType', params.accountType)
    }
    if (params.companyId || DEFAULT_COMPANY_ID) {
      queryParams.append('companyId', params.companyId || DEFAULT_COMPANY_ID)
    }
    if (params.page) {
      queryParams.append('page', params.page.toString())
    }
    if (params.pageSize) {
      queryParams.append('pageSize', params.pageSize.toString())
    }
    
    return await apiService.get<GeneralLedgerData>(`/journal/general-ledger?${queryParams.toString()}`, {
      headers: getHeaders()
    })
  }
}

// Purchase and Expense API
const purchaseApi = {
  // Vendors
  getVendors: async (companyId?: string): Promise<Vendor[]> => {
    const params = new URLSearchParams()
    if (companyId || DEFAULT_COMPANY_ID) {
      params.append('companyId', companyId || DEFAULT_COMPANY_ID)
    }
    
    return await apiService.get<Vendor[]>(`/vendors?${params.toString()}`, {
      headers: getHeaders()
    })
  },

  createVendor: async (data: Partial<Vendor>): Promise<Vendor> => {
    return await apiService.post<Vendor>('/vendors', {
      ...data,
      companyId: data.companyId || DEFAULT_COMPANY_ID
    }, {
      headers: getHeaders()
    })
  },

  updateVendor: async (id: string, data: Partial<Vendor>): Promise<Vendor> => {
    const response = await apiService.put(`/vendors/${id}`, data, {
      headers: getHeaders()
    })
    return response.data
  },

  deleteVendor: async (id: string): Promise<void> => {
    await apiService.delete(`/vendors/${id}`, {
      headers: getHeaders()
    })
  },

  // Bills
  getBills: async (companyId?: string, status?: string, page?: number, pageSize?: number): Promise<{ bills: Bill[], pagination: PaginationInfo }> => {
    const params = new URLSearchParams()
    if (companyId || DEFAULT_COMPANY_ID) {
      params.append('companyId', companyId || DEFAULT_COMPANY_ID)
    }
    if (status) {
      params.append('status', status)
    }
    if (page) {
      params.append('page', page.toString())
    }
    if (pageSize) {
      params.append('pageSize', pageSize.toString())
    }
    
    return await apiService.get<{ bills: Bill[], pagination: PaginationInfo }>(`/bills?${params.toString()}`, {
      headers: getHeaders()
    })
  },

  getBillById: async (id: string): Promise<Bill> => {
    return await apiService.get<Bill>(`/bills/${id}`, {
      headers: getHeaders()
    })
  },

  createBill: async (data: Partial<Bill>): Promise<Bill> => {
    return await apiService.post<Bill>('/bills', {
      ...data,
      companyId: data.companyId || DEFAULT_COMPANY_ID
    }, {
      headers: getHeaders()
    })
  },

  updateBill: async (id: string, data: Partial<Bill>): Promise<Bill> => {
    const response = await apiService.put(`/bills/${id}`, data, {
      headers: getHeaders()
    })
    return response.data
  },

  deleteBill: async (id: string): Promise<void> => {
    await apiService.delete(`/bills/${id}`, {
      headers: getHeaders()
    })
  },

  postBill: async (id: string, createTransaction = true): Promise<any> => {
    const response = await apiService.post(`/bills/${id}/post`, {
      createTransaction
    }, {
      headers: getHeaders()
    })
    return response.data
  },

  // Products
  getProducts: async (companyId?: string, type?: string): Promise<Product[]> => {
    const params = new URLSearchParams()
    if (companyId || DEFAULT_COMPANY_ID) {
      params.append('companyId', companyId || DEFAULT_COMPANY_ID)
    }
    if (type) {
      params.append('type', type)
    }
    
    return await apiService.get<Product[]>(`/products?${params.toString()}`, {
      headers: getHeaders()
    })
  },

  createProduct: async (data: Partial<Product>): Promise<Product> => {
    return await apiService.post<Product>('/products', {
      ...data,
      companyId: data.companyId || DEFAULT_COMPANY_ID
    }, {
      headers: getHeaders()
    })
  },

  updateProduct: async (id: string, data: Partial<Product>): Promise<Product> => {
    const response = await apiService.put(`/products/${id}`, data, {
      headers: getHeaders()
    })
    return response.data
  },

  deleteProduct: async (id: string): Promise<void> => {
    await apiService.delete(`/products/${id}`, {
      headers: getHeaders()
    })
  },

  // Purchase Orders
  getPurchaseOrders: async (companyId?: string, status?: string): Promise<PurchaseOrder[]> => {
    const params = new URLSearchParams()
    if (companyId || DEFAULT_COMPANY_ID) {
      params.append('companyId', companyId || DEFAULT_COMPANY_ID)
    }
    if (status) {
      params.append('status', status)
    }
    
    return await apiService.get<PurchaseOrder[]>(`/purchase-orders?${params.toString()}`, {
      headers: getHeaders()
    })
  },

  createPurchaseOrder: async (data: Partial<PurchaseOrder>): Promise<PurchaseOrder> => {
    return await apiService.post<PurchaseOrder>('/purchase-orders', {
      ...data,
      companyId: data.companyId || DEFAULT_COMPANY_ID
    }, {
      headers: getHeaders()
    })
  },

  updatePurchaseOrder: async (id: string, data: Partial<PurchaseOrder>): Promise<PurchaseOrder> => {
    const response = await apiService.put(`/purchase-orders/${id}`, data, {
      headers: getHeaders()
    })
    return response.data
  },

  deletePurchaseOrder: async (id: string): Promise<void> => {
    await apiService.delete(`/purchase-orders/${id}`, {
      headers: getHeaders()
    })
  }
}

const expenseApi = {
  // Expense Categories
  // Accept optional search/q parameter and optional companyId for flexibility
  getExpenseCategories: async (opts?: { companyId?: string; q?: string }): Promise<ExpenseCategory[]> => {
    const params = new URLSearchParams()
    const companyId = opts?.companyId || DEFAULT_COMPANY_ID
    if (companyId) params.append('companyId', companyId)
    if (opts?.q) params.append('q', opts.q)

    return await apiService.get<ExpenseCategory[]>(`/expense-categories?${params.toString()}`, {
      headers: getHeaders()
    })
  },

  createExpenseCategory: async (data: Partial<ExpenseCategory>): Promise<ExpenseCategory> => {
    return await apiService.post<ExpenseCategory>('/expense-categories', {
      ...data,
      companyId: data.companyId || DEFAULT_COMPANY_ID
    }, {
      headers: getHeaders()
    })
  },

  // Expense rules (list/create)
  getExpenseRules: async (companyId?: string): Promise<any[]> => {
    const params = new URLSearchParams()
    if (companyId || DEFAULT_COMPANY_ID) {
      params.append('companyId', companyId || DEFAULT_COMPANY_ID)
    }
    return await apiService.get<any[]>(`/expense-rules?${params.toString()}`, {
      headers: getHeaders()
    })
  },

  createExpenseRule: async (data: any): Promise<any> => {
    return await apiService.post<any>('/expense-rules', {
      ...data,
      companyId: data.companyId || DEFAULT_COMPANY_ID
    }, {
      headers: getHeaders()
    })
  },

  updateExpenseRule: async (id: string, data: any): Promise<any> => {
    return await apiService.put<any>(`/expense-rules/${id}`, data, {
      headers: getHeaders()
    })
  },

  deleteExpenseRule: async (id: string): Promise<void> => {
    await apiService.delete<void>(`/expense-rules/${id}`, {
      headers: getHeaders()
    })
  },

  // Expenses
  getExpenses: async (companyId?: string, status?: string, categoryId?: string): Promise<Expense[]> => {
    const params = new URLSearchParams()
    if (companyId || DEFAULT_COMPANY_ID) {
      params.append('companyId', companyId || DEFAULT_COMPANY_ID)
    }
    if (status) {
      params.append('status', status)
    }
    if (categoryId) {
      params.append('categoryId', categoryId)
    }
    
    return await apiService.get<Expense[]>(`/expenses?${params.toString()}`, {
      headers: getHeaders()
    })
  },

  createExpense: async (data: Partial<Expense>): Promise<Expense> => {
    return await apiService.post<Expense>('/expenses', {
      ...data,
      companyId: data.companyId || DEFAULT_COMPANY_ID
    }, {
      headers: getHeaders()
    })
  },

  updateExpense: async (id: string, data: Partial<Expense>): Promise<Expense> => {
    return await apiService.put<Expense>(`/expenses/${id}`, data, {
      headers: getHeaders()
    })
  },

  deleteExpense: async (id: string): Promise<void> => {
    await apiService.delete<void>(`/expenses/${id}`, {
      headers: getHeaders()
    })
  },

  submitExpense: async (id: string): Promise<Expense> => {
    return await apiService.post<Expense>(`/expenses/${id}/submit`, {}, {
      headers: getHeaders()
    })
  },

  approveExpense: async (id: string): Promise<Expense> => {
    return await apiService.post<Expense>(`/expenses/${id}/approve`, {}, {
      headers: getHeaders()
    })
  },

  rejectExpense: async (id: string, reason: string): Promise<Expense> => {
    return await apiService.post<Expense>(`/expenses/${id}/reject`, { reason }, {
      headers: getHeaders()
    })
  }
}

// Budgets API (missing in earlier helpers)
const budgetsApi = {
  getBudgets: async (companyId?: string): Promise<Budget[]> => {
    const params = new URLSearchParams()
    if (companyId || DEFAULT_COMPANY_ID) params.append('companyId', companyId || DEFAULT_COMPANY_ID)
    return await apiService.get<Budget[]>(`/budgets?${params.toString()}`, {
      headers: getHeaders()
    })
  },

  createBudget: async (data: Partial<Budget>): Promise<Budget> => {
    return await apiService.post<Budget>('/budgets', {
      ...data,
      companyId: data.companyId || DEFAULT_COMPANY_ID
    }, {
      headers: getHeaders()
    })
  },

  getBudgetAnalytics: async (companyId?: string): Promise<any> => {
    const params = new URLSearchParams()
    if (companyId || DEFAULT_COMPANY_ID) params.append('companyId', companyId || DEFAULT_COMPANY_ID)
    return await apiService.get<any>(`/budgets/analytics?${params.toString()}`, {
      headers: getHeaders()
    })
  }
}

// Companies helper
const companiesApi = {
  getCompanies: async (): Promise<Company[]> => {
    return await apiService.get<Company[]>('/companies', { headers: getHeaders() })
  }
}

// Export all APIs individually
export {
  accountTypesApi,
  chartOfAccountsApi,
  journalEntriesApi,
  accountMappingsApi,
  trialBalanceApi,
  generalLedgerApi,
  purchaseApi,
  expenseApi,
  budgetsApi,
  companiesApi
}

// Also export as a consolidated object for backward compatibility
export const accountingApi = {
  accountTypesApi,
  chartOfAccountsApi,
  journalEntriesApi,
  accountMappingsApi,
  trialBalanceApi,
  generalLedgerApi,
  purchaseApi,
  expenseApi,
  budgetsApi,
  companiesApi
}

// Period Close API wrappers (direct fetch to avoid coupling to apiService path base)
export const periodCloseApi = {
  listPeriods: async (companyId: string) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/period-close/${companyId}/periods`, { headers: getHeaders() })
    return res.json()
  },
  lock: async (companyId: string, period: string) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/period-close/${companyId}/${period}/lock`, { method: 'POST', headers: getHeaders() })
    return res.json()
  },
  unlock: async (companyId: string, period: string) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/period-close/${companyId}/${period}/unlock`, { method: 'POST', headers: getHeaders() })
    return res.json()
  },
  getChecklist: async (companyId: string, period: string) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/period-close/${companyId}/${period}/checklist`, { headers: getHeaders() })
    return res.json()
  },
  updateChecklist: async (companyId: string, period: string, itemId: string, body: any) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/period-close/${companyId}/${period}/checklist/${itemId}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(body) })
    return res.json()
  },
  runRecurring: async (companyId: string, period: string) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/period-close/${companyId}/${period}/run/recurring`, { method: 'POST', headers: getHeaders() })
    return res.json()
  },
  runAllocations: async (companyId: string, period: string) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/period-close/${companyId}/${period}/run/allocations`, { method: 'POST', headers: getHeaders() })
    return res.json()
  },
  runFxReval: async (companyId: string, period: string, baseCurrency = 'USD') => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/period-close/${companyId}/${period}/run/fx-reval`, { method: 'POST', headers: getHeaders(), body: JSON.stringify({ baseCurrency }) })
    return res.json()
  }
}

export const bankRulesApi = {
  list: async (companyId: string) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/bank-rules/${companyId}`, { headers: getHeaders() })
    return res.json()
  },
  upsert: async (companyId: string, rule: any) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/bank-rules/${companyId}`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(rule) })
    return res.json()
  },
  remove: async (companyId: string, id: string) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/bank-rules/${companyId}/${id}`, { method: 'DELETE', headers: getHeaders() })
    return res.json()
  },
  evaluate: async (companyId: string, transactions: any[]) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/bank-rules/${companyId}/evaluate`, { method: 'POST', headers: getHeaders(), body: JSON.stringify({ transactions }) })
    return res.json()
  }
}

// Card Transactions / Exceptions API
export const cardApi = {
  importTransactions: async (rows: Array<{ date: string; description: string; amount: number; merchant?: string; source?: string }>, companyId?: string): Promise<{ ok: boolean; created: number }> => {
    return await apiService.post<{ ok: boolean; created: number }>(`/card-transactions/import`, {
      companyId: companyId || DEFAULT_COMPANY_ID,
      rows
    }, { headers: getHeaders() })
  },

  getExceptions: async (opts?: { reason?: string }): Promise<Array<{ id: string; transactionId: string; companyId: string; date?: string; description?: string; amount?: number; reason: string }>> => {
    const params = new URLSearchParams()
    if (opts?.reason) params.append('reason', opts.reason)
    const q = params.toString()
    const res = await apiService.get<{ exceptions: any[] }>(`/card-exceptions${q ? `?${q}` : ''}`, { headers: getHeaders() })
    return (res as any)?.exceptions || []
  },

  resolveCreate: async (id: string, opts?: { receiptDataUrl?: string }): Promise<{ ok: boolean; expenseId?: string; receiptAttached?: boolean }> => {
    return await apiService.post<{ ok: boolean; expenseId?: string; receiptAttached?: boolean }>(`/card-exceptions/${id}/resolve-create`, { receiptDataUrl: opts?.receiptDataUrl }, { headers: getHeaders() })
  },

  resolveMatch: async (id: string, expenseId: string): Promise<{ ok: boolean }> => {
    return await apiService.post<{ ok: boolean }>(`/card-exceptions/${id}/resolve-match`, { expenseId }, { headers: getHeaders() })
  },

  dismiss: async (id: string): Promise<{ ok: boolean }> => {
    return await apiService.delete<{ ok: boolean }>(`/card-exceptions/${id}`, { headers: getHeaders() })
  }
}
