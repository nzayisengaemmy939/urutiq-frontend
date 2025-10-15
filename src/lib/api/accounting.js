// API service for accounting-related backend interactions
import { apiService } from '../api';
import { config, getCompanyId, getTenantId } from '../config';
// Default company ID for demo purposes
const DEFAULT_COMPANY_ID = config.demo.companyId;
const DEFAULT_TENANT_ID = config.demo.tenantId;
// NOTE: `apiService` already returns the typed payload (not a {data,..} wrapper),
// so call it directly and return the result.
// Helper function to get API headers.
// Prefer tenant/company IDs stored in localStorage (set by auth flow) when running in browser.
// Fall back to defaults for server or demo environments.
const getHeaders = () => {
    const tenantId = getTenantId();
    const companyId = getCompanyId();
    console.log('🔧 getHeaders() - tenantId:', tenantId, 'companyId:', companyId);
    const headers = {
        'Content-Type': 'application/json',
        'x-tenant-id': tenantId,
        'x-company-id': companyId
    };
    // Add Authorization header if token exists
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('auth_token');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
    }
    return headers;
};
// Account Types API
const accountTypesApi = {
    getAll: async (companyId) => {
        const params = new URLSearchParams();
        if (companyId || DEFAULT_COMPANY_ID) {
            params.append('companyId', companyId || DEFAULT_COMPANY_ID);
        }
        return await apiService.get(`/api/account-types?${params.toString()}`, {
            headers: getHeaders()
        });
    },
    getById: async (id) => {
        return await apiService.get(`/api/account-types/${id}`, {
            headers: getHeaders()
        });
    },
    create: async (data) => {
        // Get company ID from localStorage if not provided
        const companyId = data.companyId || (typeof window !== 'undefined' ? localStorage.getItem('company_id') : null);
        return await apiService.post('/api/account-types', {
            ...data,
            companyId: companyId
        }, {
            headers: getHeaders()
        });
    },
    update: async (id, data) => {
        return await apiService.put(`/api/account-types/${id}`, data, {
            headers: getHeaders()
        });
    },
    delete: async (id) => {
        await apiService.delete(`/api/account-types/${id}`, {
            headers: getHeaders()
        });
    }
};
// Chart of Accounts API (normalized return shape)
const chartOfAccountsApi = {
    // Always return { accounts, pagination }
    getAll: async (companyId, includeInactive = false, page, pageSize) => {
        const params = new URLSearchParams();
        if (companyId || DEFAULT_COMPANY_ID) {
            params.append('companyId', companyId || DEFAULT_COMPANY_ID);
        }
        if (includeInactive) {
            params.append('includeInactive', 'true');
        }
        if (page) {
            params.append('page', page.toString());
        }
        if (pageSize) {
            params.append('pageSize', pageSize.toString());
        }
        const res = await apiService.get(`/api/accounts?${params.toString()}`, { headers: getHeaders() });
        if (Array.isArray(res)) {
            const pagination = { page: 1, pageSize: res.length, totalPages: 1, hasNext: false, hasPrev: false, totalCount: res.length };
            return { accounts: res, pagination };
        }
        return { accounts: res?.accounts || [], pagination: res?.pagination || { page: 1, pageSize: 0, totalPages: 1, hasNext: false, hasPrev: false, totalCount: 0 } };
    },
    getById: async (id) => {
        return await apiService.get(`/api/accounts/${id}`, {
            headers: getHeaders()
        });
    },
    create: async (data) => {
        const requestData = {
            ...data,
            companyId: data.companyId || DEFAULT_COMPANY_ID
        };
        return await apiService.post('/api/accounts', requestData, {
            headers: getHeaders()
        });
    },
    update: async (id, data) => {
        return await apiService.put(`/api/accounts/${id}`, data, {
            headers: getHeaders()
        });
    },
    delete: async (id) => {
        await apiService.delete(`/api/accounts/${id}`, {
            headers: getHeaders()
        });
    },
    getBalance: async (id, asOf) => {
        const params = new URLSearchParams();
        if (asOf) {
            params.append('asOf', asOf);
        }
        return await apiService.get(`/accounts/${id}/balance?${params.toString()}`, {
            headers: getHeaders()
        });
    },
    getSummary: async (companyId) => {
        const params = new URLSearchParams();
        if (companyId || DEFAULT_COMPANY_ID) {
            params.append('companyId', companyId || DEFAULT_COMPANY_ID);
        }
        return await apiService.get(`/accounts/summary?${params.toString()}`, {
            headers: getHeaders()
        });
    }
};
// Journal Entries API (normalized)
const journalEntriesApi = {
    getAll: async (companyId, page, pageSize) => {
        const params = new URLSearchParams();
        if (companyId || DEFAULT_COMPANY_ID) {
            params.append('companyId', companyId || DEFAULT_COMPANY_ID);
        }
        if (page) {
            params.append('page', page.toString());
        }
        if (pageSize) {
            params.append('pageSize', pageSize.toString());
        }
        const res = await apiService.get(`/api/journal?${params.toString()}`, { headers: getHeaders() });
        const entries = res?.entries || res || [];
        const pagination = res?.pagination || { page: page || 1, pageSize: entries.length, totalPages: 1, hasNext: false, hasPrev: !!page && page > 1, totalCount: entries.length };
        return { entries, pagination };
    },
    getById: async (id) => {
        return await apiService.get(`/api/journal/${id}`, {
            headers: getHeaders()
        });
    },
    create: async (data) => {
        return await apiService.post('/api/journal', {
            ...data,
            companyId: data.companyId || DEFAULT_COMPANY_ID
        }, {
            headers: getHeaders()
        });
    },
    update: async (id, data) => {
        return await apiService.put(`/api/journal/${id}`, data, {
            headers: getHeaders()
        });
    },
    delete: async (id) => {
        await apiService.delete(`/api/journal/${id}`, {
            headers: getHeaders()
        });
    },
    post: async (id) => {
        await apiService.post(`/api/journal/${id}/post`, {}, {
            headers: getHeaders()
        });
    }
};
// Account Mappings API
const accountMappingsApi = {
    getAll: async (companyId) => {
        const params = new URLSearchParams();
        if (companyId || DEFAULT_COMPANY_ID) {
            params.append('companyId', companyId || DEFAULT_COMPANY_ID);
        }
        return await apiService.get(`/account-mappings?${params.toString()}`, {
            headers: getHeaders()
        });
    },
    create: async (data) => {
        return await apiService.post('/api/account-mappings', {
            ...data,
            companyId: data.companyId || DEFAULT_COMPANY_ID
        }, {
            headers: getHeaders()
        });
    }
};
// Trial Balance API
const trialBalanceApi = {
    getTrialBalance: async (asOf, companyId, page, pageSize) => {
        const params = new URLSearchParams();
        params.append('asOf', asOf);
        if (companyId || DEFAULT_COMPANY_ID) {
            params.append('companyId', companyId || DEFAULT_COMPANY_ID);
        }
        if (page) {
            params.append('page', page.toString());
        }
        if (pageSize) {
            params.append('pageSize', pageSize.toString());
        }
        return await apiService.get(`/api/journal/trial-balance?${params.toString()}`, {
            headers: getHeaders()
        });
    }
};
// Expense Journal Integration API
const expenseJournalApi = {
    getJournalEntries: async (expenseId) => {
        return await apiService.get(`/api/expenses/${expenseId}/journal-entries`, {
            headers: getHeaders()
        });
    },
    createJournalEntry: async (data) => {
        return await apiService.post('/journal-hub/entries', data, {
            headers: getHeaders()
        });
    },
    postJournalEntry: async (entryId) => {
        return await apiService.post(`/journal-hub/entries/${entryId}/post`, {}, {
            headers: getHeaders()
        });
    }
};
// General Ledger API
const generalLedgerApi = {
    getGeneralLedger: async (params) => {
        const queryParams = new URLSearchParams();
        queryParams.append('startDate', params.startDate);
        queryParams.append('endDate', params.endDate);
        if (params.accountId) {
            queryParams.append('accountId', params.accountId);
        }
        if (params.accountType) {
            queryParams.append('accountType', params.accountType);
        }
        if (params.companyId || DEFAULT_COMPANY_ID) {
            queryParams.append('companyId', params.companyId || DEFAULT_COMPANY_ID);
        }
        if (params.page) {
            queryParams.append('page', params.page.toString());
        }
        if (params.pageSize) {
            queryParams.append('pageSize', params.pageSize.toString());
        }
        return await apiService.get(`/api/journal/general-ledger?${queryParams.toString()}`, {
            headers: getHeaders()
        });
    }
};
// Purchase and Expense API
const purchaseApi = {
    // Vendors
    getVendors: async (companyId) => {
        const params = new URLSearchParams();
        if (companyId || DEFAULT_COMPANY_ID) {
            params.append('companyId', companyId || DEFAULT_COMPANY_ID);
        }
        // Request a large page size to get all vendors
        params.append('pageSize', '100');
        const response = await apiService.get(`/api/vendors?${params.toString()}`, {
            headers: getHeaders()
        });
        // Return just the data array to match frontend expectations
        return response.data || response.items || [];
    },
    createVendor: async (data) => {
        return await apiService.post('/api/vendors', {
            ...data,
            companyId: data.companyId || DEFAULT_COMPANY_ID
        }, {
            headers: getHeaders()
        });
    },
    updateVendor: async (id, data) => {
        const response = await apiService.put(`/api/vendors/${id}`, data, {
            headers: getHeaders()
        });
        return response.data;
    },
    deleteVendor: async (id) => {
        await apiService.delete(`/api/vendors/${id}`, {
            headers: getHeaders()
        });
    },
    // Bills
    getBills: async (companyId, status, page, pageSize) => {
        const params = new URLSearchParams();
        if (companyId || DEFAULT_COMPANY_ID) {
            params.append('companyId', companyId || DEFAULT_COMPANY_ID);
        }
        if (status) {
            params.append('status', status);
        }
        if (page) {
            params.append('page', page.toString());
        }
        if (pageSize) {
            params.append('pageSize', pageSize.toString());
        }
        return await apiService.get(`/bills?${params.toString()}`, {
            headers: getHeaders()
        });
    },
    getBillById: async (id) => {
        return await apiService.get(`/bills/${id}`, {
            headers: getHeaders()
        });
    },
    createBill: async (data) => {
        return await apiService.post('/api/bills', {
            ...data,
            companyId: data.companyId || DEFAULT_COMPANY_ID
        }, {
            headers: getHeaders()
        });
    },
    updateBill: async (id, data) => {
        const response = await apiService.put(`/api/bills/${id}`, data, {
            headers: getHeaders()
        });
        return response.data;
    },
    deleteBill: async (id) => {
        await apiService.delete(`/api/bills/${id}`, {
            headers: getHeaders()
        });
    },
    postBill: async (id, createTransaction = true) => {
        const response = await apiService.post(`/api/bills/${id}/post`, {
            createTransaction
        }, {
            headers: getHeaders()
        });
        return response.data;
    },
    // Products
    getProducts: async (companyId, type) => {
        const params = new URLSearchParams();
        if (companyId || DEFAULT_COMPANY_ID) {
            params.append('companyId', companyId || DEFAULT_COMPANY_ID);
        }
        if (type) {
            params.append('type', type);
        }
        return await apiService.get(`/products?${params.toString()}`, {
            headers: getHeaders()
        });
    },
    createProduct: async (data) => {
        return await apiService.post('/api/products', {
            ...data,
            companyId: data.companyId || DEFAULT_COMPANY_ID
        }, {
            headers: getHeaders()
        });
    },
    updateProduct: async (id, data) => {
        const response = await apiService.put(`/api/products/${id}`, data, {
            headers: getHeaders()
        });
        return response.data;
    },
    deleteProduct: async (id) => {
        await apiService.delete(`/api/products/${id}`, {
            headers: getHeaders()
        });
    },
    // Purchase Orders
    getPurchaseOrders: async (companyId, status) => {
        const params = new URLSearchParams();
        if (companyId || DEFAULT_COMPANY_ID) {
            params.append('companyId', companyId || DEFAULT_COMPANY_ID);
        }
        if (status) {
            params.append('status', status);
        }
        // Request a large page size to get all purchase orders
        params.append('pageSize', '100');
        const response = await apiService.get(`/api/purchase-orders?${params.toString()}`, {
            headers: getHeaders()
        });
        // Return just the items array to match frontend expectations
        return response.items || [];
    },
    getPurchaseOrderById: async (id) => {
        return await apiService.get(`/api/purchase-orders/${id}`, {
            headers: getHeaders()
        });
    },
    createPurchaseOrder: async (data) => {
        return await apiService.post('/api/purchase-orders', {
            ...data,
            companyId: data.companyId || DEFAULT_COMPANY_ID
        }, {
            headers: getHeaders()
        });
    },
    updatePurchaseOrder: async (id, data) => {
        const response = await apiService.put(`/api/purchase-orders/${id}`, data, {
            headers: getHeaders()
        });
        return response.data;
    },
    deletePurchaseOrder: async (id) => {
        await apiService.delete(`/api/purchase-orders/${id}`, {
            headers: getHeaders()
        });
    },
    // Create receipt for purchase order
    createReceipt: async (purchaseOrderId, data) => {
        return await apiService.post(`/api/purchase-orders/${purchaseOrderId}/receipts`, data, {
            headers: getHeaders()
        });
    },
    // Mark purchase order as delivered/received
    markAsDelivered: async (purchaseOrderId, data) => {
        return await apiService.post(`/api/purchase-orders/${purchaseOrderId}/deliver`, data, {
            headers: getHeaders()
        });
    },
    // Get delivery status for purchase order
    getDeliveryStatus: async (purchaseOrderId) => {
        const response = await apiService.get(`/api/purchase-orders/${purchaseOrderId}/delivery-status`, {
            headers: getHeaders()
        });
        return response;
    },
    // Download good receipt PDF for purchase order
    downloadGoodReceiptPDF: async (purchaseOrderId) => {
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://urutiq-backend-clean-af6v.onrender.com'}/api/good-receipts/purchase-orders/${purchaseOrderId}/good-receipt/pdf`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token') || localStorage.getItem('auth_token')}`,
                'x-tenant-id': localStorage.getItem('tenant_id') || 'demo-tenant',
                'x-company-id': localStorage.getItem('company_id') || 'demo-company'
            }
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Failed to download good receipt: ${response.status} ${response.statusText}`);
        }
        return await response.blob();
    }
};
const expenseApi = {
    // Expense Categories
    // Accept optional search/q parameter and optional companyId for flexibility
    getExpenseCategories: async (opts) => {
        const params = new URLSearchParams();
        const companyId = opts?.companyId || getCompanyId();
        if (companyId)
            params.append('companyId', companyId);
        if (opts?.q)
            params.append('q', opts.q);
        return await apiService.get(`/api/expense-categories?${params.toString()}`, {
            headers: getHeaders()
        });
    },
    createExpenseCategory: async (data) => {
        return await apiService.post('/api/expense-categories', {
            ...data,
            companyId: data.companyId || getCompanyId()
        }, {
            headers: getHeaders()
        });
    },
    updateExpenseCategory: async (id, data) => {
        return await apiService.put(`/api/expense-categories/${id}`, {
            ...data,
            companyId: data.companyId || getCompanyId()
        }, {
            headers: getHeaders()
        });
    },
    // Expense rules (list/create)
    getExpenseRules: async (companyId) => {
        const params = new URLSearchParams();
        const activeCompanyId = companyId || getCompanyId();
        if (activeCompanyId) {
            params.append('companyId', activeCompanyId);
        }
        return await apiService.get(`/api/expense-rules?${params.toString()}`, {
            headers: getHeaders()
        });
    },
    createExpenseRule: async (data) => {
        return await apiService.post('/api/expense-rules', {
            ...data,
            companyId: data.companyId || getCompanyId()
        }, {
            headers: getHeaders()
        });
    },
    updateExpenseRule: async (id, data) => {
        return await apiService.put(`/api/expense-rules/${id}`, data, {
            headers: getHeaders()
        });
    },
    deleteExpenseRule: async (id) => {
        await apiService.delete(`/api/expense-rules/${id}`, {
            headers: getHeaders()
        });
    },
    // Expenses
    getExpenses: async (companyId, status, categoryId) => {
        const params = new URLSearchParams();
        const activeCompanyId = companyId || getCompanyId();
        if (activeCompanyId) {
            params.append('companyId', activeCompanyId);
        }
        if (status) {
            params.append('status', status);
        }
        if (categoryId) {
            params.append('categoryId', categoryId);
        }
        const response = await apiService.get(`/api/expenses?${params.toString()}`, {
            headers: getHeaders()
        });
        // Return just the items array to match frontend expectations
        return response.items || [];
    },
    getExpenseById: async (id) => {
        return await apiService.get(`/api/expenses/${id}`, {
            headers: getHeaders()
        });
    },
    rejectExpense: async (id, reason) => {
        return await apiService.post(`/api/expenses/${id}/reject`, { reason }, {
            headers: getHeaders()
        });
    },
    createExpense: async (data) => {
        try {
            return await apiService.post('/api/expenses', {
                ...data,
                companyId: data.companyId || getCompanyId()
            }, {
                headers: getHeaders()
            });
        }
        catch (error) {
            if (error.response?.data?.code === 'BUDGET_EXCEEDED') {
                throw new Error(`Budget exceeded: ${error.response.data.details || 'Insufficient budget available'}`);
            }
            throw error;
        }
    },
    updateExpense: async (id, data) => {
        try {
            return await apiService.put(`/api/expenses/${id}`, data, {
                headers: getHeaders()
            });
        }
        catch (error) {
            if (error.response?.data?.code === 'BUDGET_EXCEEDED') {
                throw new Error(`Budget exceeded: ${error.response.data.details || 'Insufficient budget available'}`);
            }
            throw error;
        }
    },
    deleteExpense: async (id) => {
        try {
            await apiService.delete(`/api/expenses/${id}`, {
                headers: getHeaders()
            });
        }
        catch (error) {
            if (error.response?.data?.code === 'BUDGET_EXCEEDED') {
                throw new Error(`Budget exceeded: ${error.response.data.details || 'Insufficient budget available'}`);
            }
            throw error;
        }
    },
    submitExpense: async (id) => {
        return await apiService.post(`/api/expenses/${id}/submit`, {}, {
            headers: getHeaders()
        });
    },
    approveExpense: async (id) => {
        return await apiService.post(`/api/expenses/${id}/approve`, {}, {
            headers: getHeaders()
        });
    },
    // Budgets API
    getBudgets: async (companyId) => {
        const params = new URLSearchParams();
        const activeCompanyId = companyId || getCompanyId();
        if (activeCompanyId)
            params.append('companyId', activeCompanyId);
        return await apiService.get(`/api/budgets?${params.toString()}`, {
            headers: getHeaders()
        });
    },
    createBudget: async (data) => {
        return await apiService.post('/api/budgets', {
            ...data,
            companyId: data.companyId || getCompanyId()
        }, {
            headers: getHeaders()
        });
    },
    updateBudget: async (id, data) => {
        return await apiService.put(`/api/budgets/${id}`, {
            ...data,
            companyId: data.companyId || getCompanyId()
        }, {
            headers: getHeaders()
        });
    },
    getBudgetAnalytics: async (companyId) => {
        const params = new URLSearchParams();
        const activeCompanyId = companyId || getCompanyId();
        if (activeCompanyId)
            params.append('companyId', activeCompanyId);
        return await apiService.get(`/api/budgets/analytics?${params.toString()}`, {
            headers: getHeaders()
        });
    }
};
// Companies helper
const companiesApi = {
    getCompanies: async () => {
        return await apiService.get('/api/companies', { headers: getHeaders() });
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
    accountTypesApi: {},
    chartOfAccountsApi: {},
    journalEntriesApi: {},
    accountMappingsApi: {},
    trialBalanceApi: {},
    generalLedgerApi: {},
    purchaseApi: {},
    expenseApi: {},
    companiesApi: {}
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
    listPeriods: async (companyId) => {
        return await apiService.get(`/api/period-close/${companyId}/periods`, { headers: getHeaders() });
    },
    lock: async (companyId, period) => {
        return await apiService.post(`/api/period-close/${companyId}/${period}/lock`, {}, { headers: getHeaders() });
    },
    unlock: async (companyId, period) => {
        return await apiService.post(`/api/period-close/${companyId}/${period}/unlock`, {}, { headers: getHeaders() });
    },
    getChecklist: async (companyId, period) => {
        return await apiService.get(`/api/period-close/${companyId}/${period}/checklist`, { headers: getHeaders() });
    },
    updateChecklist: async (companyId, period, itemId, body) => {
        return await apiService.put(`/api/period-close/${companyId}/${period}/checklist/${itemId}`, body, { headers: getHeaders() });
    },
    runRecurring: async (companyId, period) => {
        return await apiService.post(`/api/period-close/${companyId}/${period}/run/recurring`, {}, { headers: getHeaders() });
    },
    runAllocations: async (companyId, period) => {
        return await apiService.post(`/api/period-close/${companyId}/${period}/run/allocations`, {}, { headers: getHeaders() });
    },
    runFxReval: async (companyId, period, baseCurrency = 'USD') => {
        return await apiService.post(`/api/period-close/${companyId}/${period}/run/fx-reval`, { baseCurrency }, { headers: getHeaders() });
    },
    // Additional methods needed by the frontend
    startClose: async (companyId, period) => {
        return await apiService.post(`/api/period-close/${companyId}/${period}/lock`, {}, { headers: getHeaders() });
    },
    completeClose: async (companyId, period) => {
        return await apiService.post(`/api/period-close/${companyId}/${period}/complete`, {}, { headers: getHeaders() });
    },
    getFxPreview: async (companyId, period, baseCurrency = 'USD') => {
        return await apiService.get(`/api/period-close/${companyId}/${period}/fx-preview?baseCurrency=${baseCurrency}`, { headers: getHeaders() });
    },
    getFxHistory: async (companyId, period) => {
        return await apiService.get(`/api/period-close/${companyId}/${period}/fx-history`, { headers: getHeaders() });
    },
    getAccounts: async (companyId) => {
        return await apiService.get(`/api/accounts?companyId=${companyId}`, { headers: getHeaders() });
    },
    getRuns: async (companyId, period) => {
        return await apiService.get(`/api/period-close/${companyId}/${period}/runs`, { headers: getHeaders() });
    },
    // Additional methods for enhanced functionality
    rollbackRun: async (companyId, period, runId) => {
        return await apiService.post(`/api/period-close/${companyId}/${period}/rollback`, { runId }, { headers: getHeaders() });
    },
    previewFxRevaluation: async (companyId, period, baseCurrency = 'USD') => {
        return await apiService.post(`/api/period-close/${companyId}/${period}/fx-reval/preview`, { baseCurrency }, { headers: getHeaders() });
    },
    postFxRevaluation: async (companyId, period, baseCurrency = 'USD') => {
        return await apiService.post(`/api/period-close/${companyId}/${period}/fx-reval/post`, { baseCurrency }, { headers: getHeaders() });
    },
    postPriorPeriodAdjustment: async (companyId, period, body) => {
        return await apiService.post(`/api/period-close/${companyId}/${period}/adjustments/prior-period`, body, { headers: getHeaders() });
    }
};
export const bankRulesApi = {
    list: async (companyId) => {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/bank-rules/${companyId}`, { headers: getHeaders() });
        return res.json();
    },
    upsert: async (companyId, rule) => {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/bank-rules/${companyId}`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(rule) });
        return res.json();
    },
    remove: async (companyId, id) => {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/bank-rules/${companyId}/${id}`, { method: 'DELETE', headers: getHeaders() });
        return res.json();
    },
    evaluate: async (companyId, transactions) => {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/bank-rules/${companyId}/evaluate`, { method: 'POST', headers: getHeaders(), body: JSON.stringify({ transactions }) });
        return res.json();
    }
};
// Revenue Recognition API
export const revenueRecognitionApi = {
    getSchedules: async (companyId) => {
        const company = companyId || DEFAULT_COMPANY_ID;
        return await apiService.get(`/api/revenue-recognition/${company}/schedules`, { headers: getHeaders() })
            .then(response => response?.items || []);
    },
    createSchedule: async (companyId, data) => {
        return await apiService.post(`/api/revenue-recognition/${companyId}/schedules`, data, { headers: getHeaders() });
    },
    runRecognition: async (companyId, periodStart, periodEnd) => {
        return await apiService.post(`/api/revenue-recognition/${companyId}/run`, { periodStart, periodEnd }, { headers: getHeaders() });
    },
    getContracts: async (companyId) => {
        // For now, extract contracts from schedules since there's no separate contracts endpoint
        const schedules = await revenueRecognitionApi.getSchedules(companyId);
        const contractIds = [...new Set(schedules.map(s => s.contractId).filter(Boolean))];
        return contractIds.map(id => ({ id, name: `Contract ${id}` }));
    }
};
// Card Transactions / Exceptions API
export const cardApi = {
    importTransactions: async (rows, companyId) => {
        return await apiService.post(`/card-transactions/import`, {
            companyId: companyId || DEFAULT_COMPANY_ID,
            rows
        }, { headers: getHeaders() });
    },
    getExceptions: async (opts) => {
        const params = new URLSearchParams();
        if (opts?.reason)
            params.append('reason', opts.reason);
        const q = params.toString();
        const res = await apiService.get(`/card-exceptions${q ? `?${q}` : ''}`, { headers: getHeaders() });
        return res?.exceptions || [];
    },
    resolveCreate: async (id, opts) => {
        return await apiService.post(`/card-exceptions/${id}/resolve-create`, { receiptDataUrl: opts?.receiptDataUrl }, { headers: getHeaders() });
    },
    resolveMatch: async (id, expenseId) => {
        return await apiService.post(`/card-exceptions/${id}/resolve-match`, { expenseId }, { headers: getHeaders() });
    },
    dismiss: async (id) => {
        return await apiService.delete(`/card-exceptions/${id}`, { headers: getHeaders() });
    }
};
// Bills API Base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://urutiq-backend-clean-af6v.onrender.com';
// Bills API
export const billsApi = {
    // Get all bills
    getAll: async (filters) => {
        const params = new URLSearchParams();
        if (filters?.status)
            params.append('status', filters.status);
        if (filters?.vendorId)
            params.append('vendorId', filters.vendorId);
        if (filters?.startDate)
            params.append('startDate', filters.startDate);
        if (filters?.endDate)
            params.append('endDate', filters.endDate);
        const queryString = params.toString();
        const headers = getHeaders();
        console.log('🔧 Bills API headers:', headers);
        const response = await fetch(`${API_BASE_URL}/api/bills${queryString ? `?${queryString}` : ''}`, { headers });
        if (!response.ok)
            throw new Error('Failed to fetch bills');
        return await response.json();
    },
    // Get bill by ID
    getById: async (id) => {
        const response = await fetch(`${API_BASE_URL}/api/bills/${id}`, {
            headers: getHeaders()
        });
        if (!response.ok)
            throw new Error('Failed to fetch bill');
        return await response.json();
    },
    // Create new bill
    create: async (data) => {
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
    update: async (id, data) => {
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
    delete: async (id) => {
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
    post: async (id) => {
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
    recordPayment: async (billId, paymentData) => {
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
        if (!response.ok)
            throw new Error('Failed to fetch aging report');
        return await response.json();
    }
};
// Export all APIs
export { expenseJournalApi };
