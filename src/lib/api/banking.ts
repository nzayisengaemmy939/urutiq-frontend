import apiService from '../api'

export type BankAccount = {
  id: string
  tenantId?: string
  companyId?: string
  bankName: string
  accountNumber: string
  accountType?: string
  currency?: string
  balance?: number | string
  status?: string
  routingNumber?: string
  swiftCode?: string
  iban?: string
  accountHolder?: string
  branchCode?: string
  branchName?: string
  lastSyncAt?: string
  notes?: string
  createdAt?: string
  updatedAt?: string
  _count?: {
    transactions: number
  }
}

export type BankTransaction = {
  id: string
  tenantId?: string
  bankAccountId?: string
  connectionId?: string
  externalId?: string
  transactionDate: string
  postedDate?: string
  amount: number
  currency?: string
  description?: string
  merchantName?: string
  merchantCategory?: string
  transactionType: 'credit' | 'debit' | 'transfer'
  reference?: string
  checkNumber?: string
  memo?: string
  category?: string
  tags?: string
  status?: string
  isReconciled?: boolean
  reconciledAt?: string
  reconciledBy?: string
  matchedTransactionId?: string
  confidence?: number
  fees?: number
  exchangeRate?: number
  originalAmount?: number
  originalCurrency?: string
  location?: string
  authorizationCode?: string
  createdAt?: string
  updatedAt?: string
  bankAccount?: {
    id: string
    bankName: string
    accountNumber: string
    accountType: string
  }
  reconciledByUser?: {
    id: string
    name: string
    email: string
  }
}

export type Payment = {
  id: string
  amount: number
  method: string
  reference?: string
  paymentDate: string
  description?: string
}

export const bankingApi = {
  // Generic GET method for direct API calls - Updated to fix webpack caching
  async get<T = any>(endpoint: string): Promise<T> {
    return await apiService.get<T>(endpoint)
  },

  // Generic POST method for direct API calls
  async post<T = any>(endpoint: string, data?: any): Promise<T> {
    return await apiService.post<T>(endpoint, data)
  },

  // Generic PUT method for direct API calls
  async put<T = any>(endpoint: string, data?: any): Promise<T> {
    return await apiService.put<T>(endpoint, data)
  },

  // Generic DELETE method for direct API calls
  async delete<T = any>(endpoint: string): Promise<T> {
    return await apiService.delete<T>(endpoint)
  },

  async getBankAccounts(companyId?: string) {
    const q = companyId ? `?companyId=${encodeURIComponent(companyId)}` : ''
    const res = await apiService.get<BankAccount[]>(`/api/bank-accounts${q}`)
    return res || []
  },

  async createBankAccount(data: Partial<BankAccount>) {
    const res = await apiService.post<BankAccount>('/api/bank-accounts', data)
    return res
  },

  async getBankTransactions(bankAccountId?: string, companyId?: string, status?: string, page = 1, pageSize = 50) {
    const params = new URLSearchParams()
    if (bankAccountId) params.append('bankAccountId', bankAccountId)
    if (companyId) params.append('companyId', companyId)
    if (status) params.append('status', status)
    params.append('page', page.toString())
    params.append('pageSize', pageSize.toString())
    
    const q = params.toString() ? `?${params.toString()}` : ''
    const endpoint = `/api/bank-transactions${q}`
    
    const res = await apiService.get<{
      items: BankTransaction[]
      page: number
      pageSize: number
      total: number
      totalPages: number
      hasNext: boolean
      hasPrev: boolean
    }>(endpoint)
    
    // The backend returns the data directly, not wrapped in a 'data' property
    return res || { items: [], page: 1, pageSize: 50, total: 0, totalPages: 0, hasNext: false, hasPrev: false }
  },

  async createBankTransaction(data: Partial<BankTransaction>) {
    const res = await apiService.post<BankTransaction>('/api/bank-transactions', data)
    return res
  },

  async getPayments(companyId?: string) {
    const q = companyId ? `?companyId=${encodeURIComponent(companyId)}` : ''
    const res = await apiService.get<Payment[]>(`/api/payments${q}`)
    return res || []
  },

  async postBankFeed(feed: any[], companyId?: string) {
    const res = await apiService.post('/api/bank-feed?companyId=' + encodeURIComponent(companyId || ''), { feed })
    return res.data
  },

  async reconcileTransaction(id: string, data: { paymentId?: string; bankAccountId?: string }) {
    const res = await apiService.post(`/api/bank-transactions/${encodeURIComponent(id)}/reconcile`, data)
    return res.data
  },

  // Currency methods
  async getCurrencies() {
    const res = await apiService.get('/api/currencies')
    return res
  },

  async getExchangeRate(fromCurrency: string, toCurrency: string, date?: string) {
    const url = `/api/exchange-rates/${fromCurrency}/${toCurrency}${date ? `?date=${date}` : ''}`
    const res = await apiService.get(url)
    return res
  },

  async convertCurrency(amount: number, fromCurrency: string, toCurrency: string, date?: string) {
    const res = await apiService.post('/api/convert-currency', {
      amount,
      fromCurrency,
      toCurrency,
      date
    })
    return res
  },

  async getHistoricalRates(fromCurrency: string, toCurrency: string, startDate: string, endDate: string) {
    const url = `/api/historical-rates/${fromCurrency}/${toCurrency}?startDate=${startDate}&endDate=${endDate}`
    const res = await apiService.get(url)
    return res
  },

  async updateExchangeRates() {
    const res = await apiService.post('/api/update-exchange-rates')
    return res
  },

  async forceRefreshRate(fromCurrency: string, toCurrency: string) {
    const res = await apiService.post(`/api/force-refresh-rate/${fromCurrency}/${toCurrency}`)
    return res
  },

  async formatCurrency(amount: number, currency: string) {
    const res = await apiService.post('/api/format-currency', { amount, currency })
    return res
  },

  // Payment processor methods
  async initializeProcessor(processorType: string, config: any) {
    const res = await apiService.post('/api/payment-processors/initialize', { processorType, config })
    return res
  },

  async createPaymentIntent(amount: number, currency: string, options: any = {}) {
    const res = await apiService.post('/api/payment-intents', { amount, currency, ...options })
    return res
  },

  async confirmPaymentIntent(paymentIntentId: string, paymentMethodId?: string) {
    const res = await apiService.post(`/api/payment-intents/${paymentIntentId}/confirm`, { paymentMethodId })
    return res
  },

  async createCustomer(customerData: any) {
    console.log('=== BANKING API DEBUG ===')
    console.log('bankingApi.createCustomer called with:', customerData)
    console.log('Calling endpoint: /api/payment-customers')
    const res = await apiService.post('/api/payment-customers', customerData)
    console.log('API response:', res)
    return res
  },

  async addPaymentMethod(paymentMethodData: any) {
    console.log('=== BANKING API DEBUG ===')
    console.log('bankingApi.addPaymentMethod called with:', paymentMethodData)
    console.log('Calling endpoint: /api/payment-methods')
    const res = await apiService.post('/api/payment-methods', paymentMethodData)
    console.log('API response:', res)
    return res
  },

  async getProcessorStats() {
    const res = await apiService.get('/api/payment-processors/stats')
    return res
  },

  async getPaymentIntents(options: { limit?: number; status?: string; processor?: string } = {}) {
    const params = new URLSearchParams()
    if (options.limit) params.append('limit', options.limit.toString())
    if (options.status) params.append('status', options.status)
    if (options.processor) params.append('processor', options.processor)
    
    const url = `/api/payment-intents${params.toString() ? `?${params.toString()}` : ''}`
    const res = await apiService.get(url)
    return res
  },

  async getPaymentCustomers(options: { limit?: number; search?: string; companyId?: string } = {}) {
    const params = new URLSearchParams()
    if (options.limit) params.append('limit', options.limit.toString())
    if (options.search) params.append('search', options.search)
    if (options.companyId) params.append('companyId', options.companyId)
    
    const url = `/api/payment-customers${params.toString() ? `?${params.toString()}` : ''}`
    const res = await apiService.get(url)
    return res
  },

  async getPaymentMethods(options: { customerId?: string; limit?: number; companyId?: string } = {}) {
    const params = new URLSearchParams()
    if (options.customerId) params.append('customerId', options.customerId)
    if (options.limit) params.append('limit', options.limit.toString())
    if (options.companyId) params.append('companyId', options.companyId)
    
    const url = `/api/payment-methods${params.toString() ? `?${params.toString()}` : ''}`
    const res = await apiService.get(url)
    return res
  },

  // Advanced analytics methods
  async getFinancialInsights(industry?: string) {
    const url = industry ? `/api/analytics/insights?industry=${industry}` : '/api/analytics/insights'
    const res = await apiService.get(url)
    return res
  },

  async getIndustryBenchmarks(industry: string) {
    const res = await apiService.get(`/api/analytics/benchmarks/${industry}`)
    return res
  },

  async getCashFlowForecast(months: number = 6) {
    const res = await apiService.get(`/api/analytics/cash-flow-forecast?months=${months}`)
    return res
  },

  // Bank connection methods
  async getInstitutions(provider?: string, country?: string, search?: string) {
    const params = new URLSearchParams()
    if (provider) params.append('provider', provider)
    if (country) params.append('country', country)
    if (search) params.append('search', search)
    
    const url = `/api/institutions${params.toString() ? `?${params.toString()}` : ''}`
    const res = await apiService.get(url)
    return res
  },

  async createConnection(provider: string, institutionId: string, credentials: any) {
    const res = await apiService.post('/api/connections', { provider, institutionId, credentials })
    return res
  },

  async getConnections() {
    const res = await apiService.get('/api/connections')
    return res
  },

  async getConnectionStatus(connectionId: string) {
    const res = await apiService.get(`/api/connections/${connectionId}/status`)
    return res
  },

  async syncConnection(connectionId: string) {
    const res = await apiService.post(`/api/connections/${connectionId}/sync`)
    return res
  },

  async disconnectConnection(connectionId: string) {
    const res = await apiService.post(`/api/connections/${connectionId}/disconnect`)
    return res
  },

  async reconnectConnection(connectionId: string) {
    const res = await apiService.post(`/api/connections/${connectionId}/reconnect`)
    return res
  },

  async getConnectionStats() {
    const res = await apiService.get('/api/connections/stats')
    return res
  },

  // Mobile banking methods
  async getMobileStats() {
    const res = await apiService.get('/api/mobile/stats')
    return res
  },

  async getMobileTransactions(limit: number = 20) {
    const res = await apiService.get(`/api/mobile/transactions?limit=${limit}`)
    return res
  },

  async getMobileAccounts() {
    const res = await apiService.get('/api/mobile/accounts')
    return res
  },

  async getMobileInsights() {
    const res = await apiService.get('/api/mobile/insights')
    return res
  },

  async getMobileNotifications() {
    const res = await apiService.get('/api/mobile/notifications')
    return res
  },

  async getQuickActions() {
    const res = await apiService.get('/api/mobile/quick-actions')
    return res
  },

  async executeQuickAction(actionId: string, params?: any) {
    const res = await apiService.post(`/api/mobile/quick-actions/${actionId}`, params)
    return res
  },

  // Mobile money methods
  async getMobileMoneyProviders(country?: string) {
    const url = `/api/mobile-money/providers${country ? `?country=${country}` : ''}`
    const res = await apiService.get(url)
    return res
  },

  async getMobileMoneyProvider(providerId: string) {
    const res = await apiService.get(`/api/mobile-money/providers/${providerId}`)
    return res
  },

  async createMobileMoneyAccount(accountData: any) {
    const res = await apiService.post('/api/mobile-money/accounts', accountData)
    return res
  },

  async getMobileMoneyAccounts() {
    const res = await apiService.get('/api/mobile-money/accounts')
    return res
  },

  async initiateMobileMoneyPayment(paymentData: any) {
    const res = await apiService.post('/api/mobile-money/payments', paymentData)
    return res
  },

  async getMobileMoneyTransactions(provider?: string, limit?: number) {
    const params = new URLSearchParams()
    if (provider) params.append('provider', provider)
    if (limit) params.append('limit', limit.toString())
    
    const url = `/api/mobile-money/transactions${params.toString() ? `?${params.toString()}` : ''}`
    const res = await apiService.get(url)
    return res
  },

  async getMobileMoneyBalance(provider: string, phoneNumber: string) {
    const res = await apiService.get(`/api/mobile-money/balance?provider=${provider}&phoneNumber=${phoneNumber}`)
    return res
  },

  async getMobileMoneyStats() {
    const res = await apiService.get('/api/mobile-money/stats')
    return res
  },

  async forceRefreshHistorical(fromCurrency: string, toCurrency: string, startDate?: string, endDate?: string) {
    const res = await apiService.post(`/api/force-refresh-historical/${fromCurrency}/${toCurrency}`, {
      startDate,
      endDate
    })
    return res
  }
}


export default bankingApi
