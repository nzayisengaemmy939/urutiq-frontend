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
  orderDate: string
  expectedDelivery?: string
  vendorId: string
  vendor?: Vendor
  companyId: string
  company?: Company
  status: 'draft' | 'sent' | 'confirmed' | 'received' | 'cancelled'
  orderSource: 'internal' | 'external'
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
  taxRate: number
  lineTotal: number
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
  const tenantId = getTenantId();
  const companyId = getCompanyId();
  console.log('🔧 getHeaders() - tenantId:', tenantId, 'companyId:', companyId);
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-tenant-id': tenantId,
    'x-company-id': companyId
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
    if (companyId || DEFAULT_COMPANY_ID) {
      params.append('companyId', companyId || DEFAULT_COMPANY_ID)
    }
    
    return await apiService.get<AccountType[]>(`/api/account-types?${params.toString()}`, {
      headers: getHeaders()
    })
  },

  getById: async (id: string): Promise<AccountType> => {
    return await apiService.get<AccountType>(`/api/account-types/${id}`, {
      headers: getHeaders()
    })
  },

  create: async (data: Partial<AccountType>): Promise<AccountType> => {
    // Get company ID from localStorage if not provided
    const companyId = data.companyId || (typeof window !== 'undefined' ? localStorage.getItem('company_id') : null);
    return await apiService.post<AccountType>('/api/account-types', {
      ...data,
      companyId: companyId
    }, {
      headers: getHeaders()
    })
  },

  update: async (id: string, data: Partial<AccountType>): Promise<AccountType> => {
    return await apiService.put<AccountType>(`/api/account-types/${id}`, data, {
      headers: getHeaders()
    })
  },

  delete: async (id: string): Promise<void> => {
    await apiService.delete<void>(`/api/account-types/${id}`, {
      headers: getHeaders()
    })
  }
}

// Chart of Accounts API (normalized return shape)
const chartOfAccountsApi = {
  // Always return { accounts, pagination }
  getAll: async (companyId?: string, includeInactive = false, page?: number, pageSize?: number): Promise<{ accounts: Account[]; pagination: PaginationInfo }> => {
    const params = new URLSearchParams()
    if (companyId || DEFAULT_COMPANY_ID) {
      params.append('companyId', companyId || DEFAULT_COMPANY_ID)
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
    
    const res = await apiService.get<Account[] | { accounts: Account[], pagination: PaginationInfo }>(`/api/accounts?${params.toString()}`, { headers: getHeaders() })
    if (Array.isArray(res)) {
      const pagination: PaginationInfo = { page: 1, pageSize: res.length, totalPages: 1, hasNext: false, hasPrev: false, totalCount: res.length }
      return { accounts: res, pagination }
    }
    return { accounts: (res as any)?.accounts || [], pagination: (res as any)?.pagination || { page: 1, pageSize: 0, totalPages: 1, hasNext: false, hasPrev: false, totalCount: 0 } }
  },

  getById: async (id: string): Promise<Account> => {
    return await apiService.get<Account>(`/api/accounts/${id}`, {
      headers: getHeaders()
    })
  },

    create: async (data: Partial<Account>): Promise<Account> => {
      const requestData = {
        ...data,
        companyId: data.companyId || DEFAULT_COMPANY_ID
      };
      return await apiService.post<Account>('/api/accounts', requestData, {
        headers: getHeaders()
      })
    },

  update: async (id: string, data: Partial<Account>): Promise<Account> => {
    return await apiService.put<Account>(`/api/accounts/${id}`, data, {
      headers: getHeaders()
    })
  },

  delete: async (id: string): Promise<void> => {
    await apiService.delete<void>(`/api/accounts/${id}`, {
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
    
    const res = await apiService.get<any>(`/api/journal?${params.toString()}`, { headers: getHeaders() })
    const entries: JournalEntry[] = (res as any)?.entries || res || []
    const pagination: PaginationInfo = (res as any)?.pagination || { page: page || 1, pageSize: entries.length, totalPages: 1, hasNext: false, hasPrev: !!page && page > 1, totalCount: entries.length }
    return { entries, pagination }
  },

  getById: async (id: string): Promise<JournalEntry> => {
    return await apiService.get<JournalEntry>(`/api/journal/${id}`, {
      headers: getHeaders()
    })
  },

  create: async (data: Partial<JournalEntry>): Promise<JournalEntry> => {
    return await apiService.post<JournalEntry>('/api/journal', {
      ...data,
      companyId: data.companyId || DEFAULT_COMPANY_ID
    }, {
      headers: getHeaders()
    })
  },

  update: async (id: string, data: Partial<JournalEntry>): Promise<JournalEntry> => {
    return await apiService.put<JournalEntry>(`/api/journal/${id}`, data, {
      headers: getHeaders()
    })
  },

  delete: async (id: string): Promise<void> => {
    await apiService.delete<void>(`/api/journal/${id}`, {
      headers: getHeaders()
    })
  },

  post: async (id: string): Promise<void> => {
    await apiService.post<void>(`/api/journal/${id}/post`, {}, {
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
    return await apiService.post<any>('/api/account-mappings', {
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
    
    return await apiService.get<TrialBalanceData>(`/api/journal/trial-balance?${params.toString()}`, {
      headers: getHeaders()
    })
  }
}

// Expense Journal Integration API
const expenseJournalApi = {
  getJournalEntries: async (expenseId: string): Promise<any[]> => {
    return await apiService.get<any[]>(`/api/expenses/${expenseId}/journal-entries`, {
      headers: getHeaders()
    })
  },

  createJournalEntry: async (data: any): Promise<any> => {
    return await apiService.post<any>('/journal-hub/entries', data, {
      headers: getHeaders()
    })
  },

  postJournalEntry: async (entryId: string): Promise<any> => {
    return await apiService.post<any>(`/journal-hub/entries/${entryId}/post`, {}, {
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
    
    return await apiService.get<GeneralLedgerData>(`/api/journal/general-ledger?${queryParams.toString()}`, {
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
    // Request a large page size to get all vendors
    params.append('pageSize', '100')
    
    const response = await apiService.get<{ items: Vendor[], pagination: any }>(`/api/vendors?${params.toString()}`, {
      headers: getHeaders()
    })
    
    // Return just the items array to match frontend expectations
    return response.items || []
  },

  createVendor: async (data: Partial<Vendor>): Promise<Vendor> => {
    return await apiService.post<Vendor>('/api/vendors', {
      ...data,
      companyId: data.companyId || DEFAULT_COMPANY_ID
    }, {
      headers: getHeaders()
    })
  },

  updateVendor: async (id: string, data: Partial<Vendor>): Promise<Vendor> => {
    const response = await apiService.put(`/api/vendors/${id}`, data, {
      headers: getHeaders()
    })
    return response.data
  },

  deleteVendor: async (id: string): Promise<void> => {
    await apiService.delete(`/api/vendors/${id}`, {
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
    return await apiService.post<Bill>('/api/bills', {
      ...data,
      companyId: data.companyId || DEFAULT_COMPANY_ID
    }, {
      headers: getHeaders()
    })
  },

  updateBill: async (id: string, data: Partial<Bill>): Promise<Bill> => {
    const response = await apiService.put(`/api/bills/${id}`, data, {
      headers: getHeaders()
    })
    return response.data
  },

  deleteBill: async (id: string): Promise<void> => {
    await apiService.delete(`/api/bills/${id}`, {
      headers: getHeaders()
    })
  },

  postBill: async (id: string, createTransaction = true): Promise<any> => {
    const response = await apiService.post(`/api/bills/${id}/post`, {
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
    return await apiService.post<Product>('/api/products', {
      ...data,
      companyId: data.companyId || DEFAULT_COMPANY_ID
    }, {
      headers: getHeaders()
    })
  },

  updateProduct: async (id: string, data: Partial<Product>): Promise<Product> => {
    const response = await apiService.put(`/api/products/${id}`, data, {
      headers: getHeaders()
    })
    return response.data
  },

  deleteProduct: async (id: string): Promise<void> => {
    await apiService.delete(`/api/products/${id}`, {
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
    // Request a large page size to get all purchase orders
    params.append('pageSize', '100')
    
    const response = await apiService.get<{ items: PurchaseOrder[], pagination: any }>(`/api/purchase-orders?${params.toString()}`, {
      headers: getHeaders()
    })
    
    // Return just the items array to match frontend expectations
    return response.items || []
  },

  getPurchaseOrderById: async (id: string): Promise<PurchaseOrder> => {
    return await apiService.get<PurchaseOrder>(`/api/purchase-orders/${id}`, {
      headers: getHeaders()
    })
  },

  createPurchaseOrder: async (data: Partial<PurchaseOrder>): Promise<PurchaseOrder> => {
    return await apiService.post<PurchaseOrder>('/api/purchase-orders', {
      ...data,
      companyId: data.companyId || DEFAULT_COMPANY_ID
    }, {
      headers: getHeaders()
    })
  },

  updatePurchaseOrder: async (id: string, data: Partial<PurchaseOrder>): Promise<PurchaseOrder> => {
    const response = await apiService.put(`/api/purchase-orders/${id}`, data, {
      headers: getHeaders()
    })
    return response.data
  },

  deletePurchaseOrder: async (id: string): Promise<void> => {
    await apiService.delete(`/api/purchase-orders/${id}`, {
      headers: getHeaders()
    })
  },

  // Create receipt for purchase order
  createReceipt: async (purchaseOrderId: string, data: {
    receiptNumber: string;
    receivedDate: string;
    receivedBy?: string;
    notes?: string;
    items: Array<{
      purchaseOrderLineId?: string;
      productId?: string;
      description: string;
      quantityReceived: number;
      quantityAccepted: number;
      quantityRejected: number;
      rejectionReason?: string;
    }>;
  }): Promise<any> => {
    return await apiService.post(`/api/purchase-orders/${purchaseOrderId}/receipts`, data, {
      headers: getHeaders()
    })
  },

  // Mark purchase order as delivered/received
  markAsDelivered: async (purchaseOrderId: string, data: {
    deliveredDate: string;
    deliveredBy?: string;
    notes?: string;
    journalEntryData?: {
      memo?: string;
      reference?: string;
    };
  }): Promise<any> => {
    return await apiService.post(`/api/purchase-orders/${purchaseOrderId}/deliver`, data, {
      headers: getHeaders()
    })
  },

  // Get delivery status for purchase order
  getDeliveryStatus: async (purchaseOrderId: string): Promise<any> => {
    const response = await apiService.get(`/api/purchase-orders/${purchaseOrderId}/delivery-status`, {
      headers: getHeaders()
    })
    return response
  },

  // Download good receipt PDF for purchase order
  downloadGoodReceiptPDF: async (purchaseOrderId: string): Promise<Blob> => {
    const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://urutiq-backend-clean-11.onrender.com'}/api/good-receipts/purchase-orders/${purchaseOrderId}/good-receipt/pdf`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token') || localStorage.getItem('auth_token')}`,
        'x-tenant-id': localStorage.getItem('tenant_id') || 'demo-tenant',
        'x-company-id': localStorage.getItem('company_id') || 'demo-company'
      }
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || `Failed to download good receipt: ${response.status} ${response.statusText}`)
    }

    return await response.blob()
  }
}

const expenseApi = {
  // Expense Categories
  // Accept optional search/q parameter and optional companyId for flexibility
  getExpenseCategories: async (opts?: { companyId?: string; q?: string }): Promise<ExpenseCategory[]> => {
    const params = new URLSearchParams()
    const companyId = opts?.companyId || getCompanyId()
    if (companyId) params.append('companyId', companyId)
    if (opts?.q) params.append('q', opts.q)

    return await apiService.get<ExpenseCategory[]>(`/api/expense-categories?${params.toString()}`, {
      headers: getHeaders()
    })
  },

  createExpenseCategory: async (data: Partial<ExpenseCategory>): Promise<ExpenseCategory> => {
    return await apiService.post<ExpenseCategory>('/api/expense-categories', {
      ...data,
      companyId: data.companyId || getCompanyId()
    }, {
      headers: getHeaders()
    })
  },

  updateExpenseCategory: async (id: string, data: Partial<ExpenseCategory>): Promise<ExpenseCategory> => {
    return await apiService.put<ExpenseCategory>(`/api/expense-categories/${id}`, {
      ...data,
      companyId: data.companyId || getCompanyId()
    }, {
      headers: getHeaders()
    })
  },

  // Expense rules (list/create)
  getExpenseRules: async (companyId?: string): Promise<any[]> => {
    const params = new URLSearchParams()
    const activeCompanyId = companyId || getCompanyId()
    if (activeCompanyId) {
      params.append('companyId', activeCompanyId)
    }
    return await apiService.get<any[]>(`/api/expense-rules?${params.toString()}`, {
      headers: getHeaders()
    })
  },

  createExpenseRule: async (data: any): Promise<any> => {
    return await apiService.post<any>('/api/expense-rules', {
      ...data,
      companyId: data.companyId || getCompanyId()
    }, {
      headers: getHeaders()
    })
  },

  updateExpenseRule: async (id: string, data: any): Promise<any> => {
    return await apiService.put<any>(`/api/expense-rules/${id}`, data, {
      headers: getHeaders()
    })
  },

  deleteExpenseRule: async (id: string): Promise<void> => {
    await apiService.delete<void>(`/api/expense-rules/${id}`, {
      headers: getHeaders()
    })
  },

  // Expenses
  getExpenses: async (companyId?: string, status?: string, categoryId?: string): Promise<Expense[]> => {
    const params = new URLSearchParams()
    const activeCompanyId = companyId || getCompanyId()
    if (activeCompanyId) {
      params.append('companyId', activeCompanyId)
    }
    if (status) {
      params.append('status', status)
    }
    if (categoryId) {
      params.append('categoryId', categoryId)
    }
    
    const response = await apiService.get<{ items: Expense[], pagination: any }>(`/api/expenses?${params.toString()}`, {
      headers: getHeaders()
    })
    
    // Return just the items array to match frontend expectations
    return response.items || []
  },

  getExpenseById: async (id: string): Promise<Expense> => {
    return await apiService.get<Expense>(`/api/expenses/${id}`, {
      headers: getHeaders()
    })
  },

  rejectExpense: async (id: string, reason: string): Promise<Expense> => {
    return await apiService.post<Expense>(`/api/expenses/${id}/reject`, { reason }, {
      headers: getHeaders()
    })
  },

  createExpense: async (data: Partial<Expense>): Promise<Expense> => {
    try {
      return await apiService.post<Expense>('/api/expenses', {
        ...data,
        companyId: data.companyId || getCompanyId()
      }, {
        headers: getHeaders()
      })
    } catch (error: any) {
      if (error.response?.data?.code === 'BUDGET_EXCEEDED') {
        throw new Error(`Budget exceeded: ${error.response.data.details || 'Insufficient budget available'}`)
      }
      throw error
    }
  },
  updateExpense: async (id: string, data: Partial<Expense>): Promise<Expense> => {
    try {
      return await apiService.put<Expense>(`/api/expenses/${id}`, data, {
        headers: getHeaders()
      });
    } catch (error: any) {
      if (error.response?.data?.code === 'BUDGET_EXCEEDED') {
        throw new Error(`Budget exceeded: ${error.response.data.details || 'Insufficient budget available'}`);
      }
      throw error;
    }
  },

  deleteExpense: async (id: string): Promise<void> => {
    try {
      await apiService.delete<void>(`/api/expenses/${id}`, {
        headers: getHeaders()
      });
    } catch (error: any) {
      if (error.response?.data?.code === 'BUDGET_EXCEEDED') {
        throw new Error(`Budget exceeded: ${error.response.data.details || 'Insufficient budget available'}`);
      }
      throw error;
    }
  },

  submitExpense: async (id: string): Promise<Expense> => {
    return await apiService.post<Expense>(`/api/expenses/${id}/submit`, {}, {
      headers: getHeaders()
    })
  },

  approveExpense: async (id: string): Promise<Expense> => {
    return await apiService.post<Expense>(`/api/expenses/${id}/approve`, {}, {
      headers: getHeaders()
    })
  },

  // Budgets API
  getBudgets: async (companyId?: string): Promise<Budget[]> => {
    const params = new URLSearchParams()
    const activeCompanyId = companyId || getCompanyId()
    if (activeCompanyId) params.append('companyId', activeCompanyId)
    return await apiService.get<Budget[]>(`/api/budgets?${params.toString()}`, {
      headers: getHeaders()
    })
  },

  createBudget: async (data: Partial<Budget>): Promise<Budget> => {
    return await apiService.post<Budget>('/api/budgets', {
      ...data,
      companyId: data.companyId || getCompanyId()
    }, {
      headers: getHeaders()
    })
  },

  updateBudget: async (id: string, data: Partial<Budget>): Promise<Budget> => {
    return await apiService.put<Budget>(`/api/budgets/${id}`, {
      ...data,
      companyId: data.companyId || getCompanyId()
    }, {
      headers: getHeaders()
    })
  },

  getBudgetAnalytics: async (companyId?: string): Promise<any> => {
    const params = new URLSearchParams()
    const activeCompanyId = companyId || getCompanyId()
    if (activeCompanyId) params.append('companyId', activeCompanyId)
    return await apiService.get<any>(`/api/budgets/analytics?${params.toString()}`, {
      headers: getHeaders()
    })
  }
}

// Companies helper
const companiesApi = {
  getCompanies: async (): Promise<Company[]> => {
    return await apiService.get<Company[]>('/api/companies', { headers: getHeaders() })
  }
};

// Export all APIs individually
export { accountTypesApi };
export { chartOfAccountsApi };
export { journalEntriesApi };
export { accountMappingsApi };
export { trialBalanceApi };
export { generalLedgerApi };
export { purchaseApi };
export { expenseApi };
export { companiesApi };

// Export as a consolidated object for backward compatibility
export const accountingApi = {
  // These will be populated by the imports above
  accountTypesApi: {} as any,
  chartOfAccountsApi: {} as any,
  journalEntriesApi: {} as any,
  accountMappingsApi: {} as any,
  trialBalanceApi: {} as any,
  generalLedgerApi: {} as any,
  purchaseApi: {} as any,
  expenseApi: {} as any,
  companiesApi: {} as any
};

// Assign the actual implementations after they're defined
Object.assign(accountingApi, {
  accountTypesApi,
  chartOfAccountsApi,
  journalEntriesApi,
  accountMappingsApi,
  trialBalanceApi,
  generalLedgerApi,
  purchaseApi,
  expenseApi,
  companiesApi
});

// Period Close API wrappers (using apiService for consistency)
export const periodCloseApi = {
  listPeriods: async (companyId: string) => {
    return await apiService.get(`/api/period-close/${companyId}/periods`, { headers: getHeaders() })
  },
  lock: async (companyId: string, period: string) => {
    return await apiService.post(`/api/period-close/${companyId}/${period}/lock`, {}, { headers: getHeaders() })
  },
  unlock: async (companyId: string, period: string) => {
    return await apiService.post(`/api/period-close/${companyId}/${period}/unlock`, {}, { headers: getHeaders() })
  },
  getChecklist: async (companyId: string, period: string) => {
    return await apiService.get(`/api/period-close/${companyId}/${period}/checklist`, { headers: getHeaders() })
  },
  updateChecklist: async (companyId: string, period: string, itemId: string, body: any) => {
    return await apiService.put(`/api/period-close/${companyId}/${period}/checklist/${itemId}`, body, { headers: getHeaders() })
  },
  runRecurring: async (companyId: string, period: string) => {
    return await apiService.post(`/api/period-close/${companyId}/${period}/run/recurring`, {}, { headers: getHeaders() })
  },
  runAllocations: async (companyId: string, period: string) => {
    return await apiService.post(`/api/period-close/${companyId}/${period}/run/allocations`, {}, { headers: getHeaders() })
  },
  runFxReval: async (companyId: string, period: string, baseCurrency = 'USD') => {
    return await apiService.post(`/api/period-close/${companyId}/${period}/run/fx-reval`, { baseCurrency }, { headers: getHeaders() })
  },
  // Additional methods needed by the frontend
  startClose: async (companyId: string, period: string) => {
    return await apiService.post(`/api/period-close/${companyId}/${period}/lock`, {}, { headers: getHeaders() })
  },
  completeClose: async (companyId: string, period: string) => {
    return await apiService.post(`/api/period-close/${companyId}/${period}/complete`, {}, { headers: getHeaders() })
  },
  getFxPreview: async (companyId: string, period: string, baseCurrency = 'USD') => {
    return await apiService.get(`/api/period-close/${companyId}/${period}/fx-preview?baseCurrency=${baseCurrency}`, { headers: getHeaders() })
  },
  getFxHistory: async (companyId: string, period: string) => {
    return await apiService.get(`/api/period-close/${companyId}/${period}/fx-history`, { headers: getHeaders() })
  },
  getAccounts: async (companyId: string) => {
    return await apiService.get(`/api/accounts?companyId=${companyId}`, { headers: getHeaders() })
  },
  getRuns: async (companyId: string, period: string) => {
    return await apiService.get(`/api/period-close/${companyId}/${period}/runs`, { headers: getHeaders() })
  },
  // Additional methods for enhanced functionality
  rollbackRun: async (companyId: string, period: string, runId: string) => {
    return await apiService.post(`/api/period-close/${companyId}/${period}/rollback`, { runId }, { headers: getHeaders() })
  },
  previewFxRevaluation: async (companyId: string, period: string, baseCurrency = 'USD') => {
    return await apiService.post(`/api/period-close/${companyId}/${period}/fx-reval/preview`, { baseCurrency }, { headers: getHeaders() })
  },
  postFxRevaluation: async (companyId: string, period: string, baseCurrency = 'USD') => {
    return await apiService.post(`/api/period-close/${companyId}/${period}/fx-reval/post`, { baseCurrency }, { headers: getHeaders() })
  },
  postPriorPeriodAdjustment: async (
    companyId: string,
    period: string,
    body: { amount: number; description?: string; transactionType?: 'expense'|'income'; currency?: string }
  ) => {
    return await apiService.post(
      `/api/period-close/${companyId}/${period}/adjustments/prior-period`,
      body,
      { headers: getHeaders() }
    )
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

// Revenue Recognition API
export const revenueRecognitionApi = {
  getSchedules: async (companyId?: string): Promise<any[]> => {
    const company = companyId || DEFAULT_COMPANY_ID
    return await apiService.get<{ items: any[] }>(`/api/revenue-recognition/${company}/schedules`, { headers: getHeaders() })
      .then(response => response?.items || [])
  },

  createSchedule: async (companyId: string, data: any): Promise<any> => {
    return await apiService.post(`/api/revenue-recognition/${companyId}/schedules`, data, { headers: getHeaders() })
  },

  runRecognition: async (companyId: string, periodStart: string, periodEnd: string): Promise<any> => {
    return await apiService.post(`/api/revenue-recognition/${companyId}/run`, { periodStart, periodEnd }, { headers: getHeaders() })
  },

  getContracts: async (companyId?: string): Promise<any[]> => {
    // For now, extract contracts from schedules since there's no separate contracts endpoint
    const schedules = await revenueRecognitionApi.getSchedules(companyId)
    const contractIds = [...new Set(schedules.map(s => s.contractId).filter(Boolean))]
    return contractIds.map(id => ({ id, name: `Contract ${id}` }))
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

// Bills API Base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://urutiq-backend-clean-11.onrender.com';

// Bills API
export const billsApi = {
  // Get all bills
  getAll: async (filters?: { status?: string; vendorId?: string; startDate?: string; endDate?: string }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.vendorId) params.append('vendorId', filters.vendorId);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    
    const queryString = params.toString();
    const headers = getHeaders();
    console.log('🔧 Bills API headers:', headers);
    
    const response = await fetch(
      `${API_BASE_URL}/api/bills${queryString ? `?${queryString}` : ''}`,
      { headers }
    );
    if (!response.ok) throw new Error('Failed to fetch bills');
    return await response.json();
  },

  // Get bill by ID
  getById: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/api/bills/${id}`, {
      headers: getHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch bill');
    return await response.json();
  },

  // Create new bill
  create: async (data: any) => {
    console.log('Creating bill with data:', data);
    const response = await fetch(`${API_BASE_URL}/api/bills`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const error = await response.json();
      console.error('Bill creation error - Full details:', JSON.stringify(error, null, 2));
      console.error('Error message:', error.message);
      console.error('Error details:', error.details);
      console.error('Error error:', error.error);
      throw new Error(error.details ? JSON.stringify(error.details) : (error.message || 'Failed to create bill'));
    }
    return await response.json();
  },

  // Update bill
  update: async (id: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}/api/bills/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update bill');
    }
    return await response.json();
  },

  // Delete bill
  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/api/bills/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete bill');
    }
    return await response.json();
  },

  // Post bill (move from draft to posted)
  post: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/api/bills/${id}/post`, {
      method: 'POST',
      headers: getHeaders()
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to post bill');
    }
    return await response.json();
  },

  // Record payment
  recordPayment: async (billId: string, paymentData: any) => {
    const response = await fetch(`${API_BASE_URL}/api/bills/${billId}/payment`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(paymentData)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to record payment');
    }
    return await response.json();
  },

  // Get aging report
  getAgingReport: async () => {
    const response = await fetch(`${API_BASE_URL}/api/bills/analytics/aging`, {
      headers: getHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch aging report');
    return await response.json();
  }
};

// Export all APIs
export {
  expenseJournalApi
}
