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
    console.log('🏦 bankingApi.get called with endpoint:', endpoint)
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
    const res = await apiService.get<BankAccount[]>(`/bank-accounts${q}`)
    return res || []
  },

  async createBankAccount(data: Partial<BankAccount>) {
    const res = await apiService.post<BankAccount>('/bank-accounts', data)
    return res.data
  },

  async getBankTransactions(bankAccountId?: string, companyId?: string, status?: string, page = 1, pageSize = 50) {
    const params = new URLSearchParams()
    if (bankAccountId) params.append('bankAccountId', bankAccountId)
    if (companyId) params.append('companyId', companyId)
    if (status) params.append('status', status)
    params.append('page', page.toString())
    params.append('pageSize', pageSize.toString())
    
    const q = params.toString() ? `?${params.toString()}` : ''
    const endpoint = `/bank-transactions${q}`
    console.log('🏦 Banking API calling endpoint:', endpoint)
    console.log('🏦 Banking API params:', { bankAccountId, companyId, status, page, pageSize })
    
    const res = await apiService.get<{
      items: BankTransaction[]
      page: number
      pageSize: number
      total: number
      totalPages: number
      hasNext: boolean
      hasPrev: boolean
    }>(endpoint)
    
    console.log('🏦 Banking API response:', res)
    // The backend returns the data directly, not wrapped in a 'data' property
    return res || { items: [], page: 1, pageSize: 50, total: 0, totalPages: 0, hasNext: false, hasPrev: false }
  },

  async createBankTransaction(data: Partial<BankTransaction>) {
    const res = await apiService.post<BankTransaction>('/bank-transactions', data)
    return res.data
  },

  async getPayments(companyId?: string) {
    const q = companyId ? `?companyId=${encodeURIComponent(companyId)}` : ''
    const res = await apiService.get<Payment[]>(`/payments${q}`)
    return res || []
  },

  async postBankFeed(feed: any[], companyId?: string) {
    const res = await apiService.post('/bank-feed?companyId=' + encodeURIComponent(companyId || ''), { feed })
    return res.data
  },

  async reconcileTransaction(id: string, data: { paymentId?: string; bankAccountId?: string }) {
    const res = await apiService.post(`/bank-transactions/${encodeURIComponent(id)}/reconcile`, data)
    return res.data
  },

  // Currency methods
  async getCurrencies() {
    const res = await apiService.get('/currencies')
    return res
  },

  async getExchangeRate(fromCurrency: string, toCurrency: string, date?: string) {
    const url = `/exchange-rates/${fromCurrency}/${toCurrency}${date ? `?date=${date}` : ''}`
    const res = await apiService.get(url)
    return res
  },

  async convertCurrency(amount: number, fromCurrency: string, toCurrency: string, date?: string) {
    const res = await apiService.post('/convert-currency', {
      amount,
      fromCurrency,
      toCurrency,
      date
    })
    return res
  },

  async getHistoricalRates(fromCurrency: string, toCurrency: string, startDate: string, endDate: string) {
    const url = `/historical-rates/${fromCurrency}/${toCurrency}?startDate=${startDate}&endDate=${endDate}`
    const res = await apiService.get(url)
    return res
  },

  async updateExchangeRates() {
    const res = await apiService.post('/update-exchange-rates')
    return res
  },

  async formatCurrency(amount: number, currency: string) {
    const res = await apiService.post('/format-currency', { amount, currency })
    return res
  },

  // Payment processor methods
  async initializeProcessor(processorType: string, config: any) {
    const res = await apiService.post('/payment-processors/initialize', { processorType, config })
    return res
  },

  async createPaymentIntent(amount: number, currency: string, options: any = {}) {
    const res = await apiService.post('/payment-intents', { amount, currency, ...options })
    return res
  },

  async confirmPaymentIntent(paymentIntentId: string, paymentMethodId?: string) {
    const res = await apiService.post(`/payment-intents/${paymentIntentId}/confirm`, { paymentMethodId })
    return res
  },

  async createCustomer(customerData: any) {
    const res = await apiService.post('/customers', customerData)
    return res
  },

  async addPaymentMethod(paymentMethodData: any) {
    const res = await apiService.post('/payment-methods', paymentMethodData)
    return res
  },

  async getProcessorStats() {
    const res = await apiService.get('/payment-processors/stats')
    return res
  },

  // Advanced analytics methods
  async getFinancialInsights(industry?: string) {
    const url = industry ? `/analytics/insights?industry=${industry}` : '/analytics/insights'
    const res = await apiService.get(url)
    return res
  },

  async getIndustryBenchmarks(industry: string) {
    const res = await apiService.get(`/analytics/benchmarks/${industry}`)
    return res
  },

  async getCashFlowForecast(months: number = 6) {
    const res = await apiService.get(`/analytics/cash-flow-forecast?months=${months}`)
    return res
  },

  // Bank connection methods
  async getInstitutions(provider?: string, country?: string, search?: string) {
    const params = new URLSearchParams()
    if (provider) params.append('provider', provider)
    if (country) params.append('country', country)
    if (search) params.append('search', search)
    
    const url = `/institutions${params.toString() ? `?${params.toString()}` : ''}`
    const res = await apiService.get(url)
    return res
  },

  async createConnection(provider: string, institutionId: string, credentials: any) {
    const res = await apiService.post('/connections', { provider, institutionId, credentials })
    return res
  },

  async getConnections() {
    const res = await apiService.get('/connections')
    return res
  },

  async getConnectionStatus(connectionId: string) {
    const res = await apiService.get(`/connections/${connectionId}/status`)
    return res
  },

  async syncConnection(connectionId: string) {
    const res = await apiService.post(`/connections/${connectionId}/sync`)
    return res
  },

  async disconnectConnection(connectionId: string) {
    const res = await apiService.post(`/connections/${connectionId}/disconnect`)
    return res
  },

  async reconnectConnection(connectionId: string) {
    const res = await apiService.post(`/connections/${connectionId}/reconnect`)
    return res
  },

  async getConnectionStats() {
    const res = await apiService.get('/connections/stats')
    return res
  },

  // Mobile banking methods
  async getMobileStats() {
    const res = await apiService.get('/mobile/stats')
    return res
  },

  async getMobileTransactions(limit: number = 20) {
    const res = await apiService.get(`/mobile/transactions?limit=${limit}`)
    return res
  },

  async getMobileAccounts() {
    const res = await apiService.get('/mobile/accounts')
    return res
  },

  async getMobileInsights() {
    const res = await apiService.get('/mobile/insights')
    return res
  },

  async getMobileNotifications() {
    const res = await apiService.get('/mobile/notifications')
    return res
  },

  async getQuickActions() {
    const res = await apiService.get('/mobile/quick-actions')
    return res
  },

  async executeQuickAction(actionId: string, params?: any) {
    const res = await apiService.post(`/mobile/quick-actions/${actionId}`, params)
    return res
  },

  // Mobile money methods
  async getMobileMoneyProviders(country?: string) {
    const url = `/mobile-money/providers${country ? `?country=${country}` : ''}`
    const res = await apiService.get(url)
    return res
  },

  async getMobileMoneyProvider(providerId: string) {
    const res = await apiService.get(`/mobile-money/providers/${providerId}`)
    return res
  },

  async createMobileMoneyAccount(accountData: any) {
    const res = await apiService.post('/mobile-money/accounts', accountData)
    return res
  },

  async getMobileMoneyAccounts() {
    const res = await apiService.get('/mobile-money/accounts')
    return res
  },

  async initiateMobileMoneyPayment(paymentData: any) {
    const res = await apiService.post('/mobile-money/payments', paymentData)
    return res
  },

  async getMobileMoneyTransactions(provider?: string, limit?: number) {
    const params = new URLSearchParams()
    if (provider) params.append('provider', provider)
    if (limit) params.append('limit', limit.toString())
    
    const url = `/mobile-money/transactions${params.toString() ? `?${params.toString()}` : ''}`
    const res = await apiService.get(url)
    return res
  },

  async getMobileMoneyBalance(provider: string, phoneNumber: string) {
    const res = await apiService.get(`/mobile-money/balance?provider=${provider}&phoneNumber=${phoneNumber}`)
    return res
  },

  async getMobileMoneyStats() {
    const res = await apiService.get('/mobile-money/stats')
    return res
  }
}

// Debug log to verify bankingApi is properly constructed
console.log('🏦 bankingApi object constructed with methods:', Object.keys(bankingApi))

export default bankingApi
