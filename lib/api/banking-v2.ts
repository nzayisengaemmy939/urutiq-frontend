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
  reconciledPaymentId?: string
  createdAt?: string
  updatedAt?: string
  bankAccount?: BankAccount
  payment?: Payment
}

export type Payment = {
  id: string
  tenantId?: string
  companyId?: string
  bankAccountId?: string
  bankTransactionId?: string
  amount: number
  currency?: string
  method: string
  reference?: string
  paymentDate: string
  description?: string
}

export const bankingApiV2 = {
  // Generic GET method for direct API calls
  async get<T = any>(endpoint: string): Promise<T> {
    console.log('🏦 bankingApiV2.get called with endpoint:', endpoint)
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
      total: number
      page: number
      pageSize: number
      totalPages: number
    }>(endpoint)
    return res || { items: [], total: 0, page: 1, pageSize: 50, totalPages: 0 }
  },

  async createBankTransaction(data: Partial<BankTransaction>) {
    const res = await apiService.post<BankTransaction>('/bank-transactions', data)
    return res.data
  },

  async reconcileTransaction(transactionId: string, data: { paymentId?: string }) {
    const res = await apiService.post<BankTransaction>(`/bank-transactions/${transactionId}/reconcile`, data)
    return res.data
  },

  async getPayments(companyId?: string) {
    const q = companyId ? `?companyId=${encodeURIComponent(companyId)}` : ''
    const res = await apiService.get<Payment[]>(`/payments${q}`)
    return res || []
  },

  async createPayment(data: Partial<Payment>) {
    const res = await apiService.post<Payment>('/payments', data)
    return res.data
  },

  // Currency methods
  async getCurrencies() {
    const res = await apiService.get('/currencies')
    return res
  },

  async getExchangeRate(fromCurrency: string, toCurrency: string) {
    const res = await apiService.get(`/exchange-rates/${fromCurrency}/${toCurrency}`)
    return res
  },

  async convertCurrency(fromCurrency: string, toCurrency: string, amount: number) {
    const res = await apiService.post('/convert-currency', { fromCurrency, toCurrency, amount })
    return res
  },

  async getHistoricalRates(currency: string, days: number = 30) {
    const res = await apiService.get(`/exchange-rates/${currency}/history?days=${days}`)
    return res
  },

  async updateExchangeRates() {
    const res = await apiService.post('/exchange-rates/update')
    return res
  },

  formatCurrency(amount: number, currency: string = 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount)
  },

  // Payment processor methods
  async initializeProcessor(processor: string, config: any) {
    const res = await apiService.post('/payment-processors/initialize', { processor, config })
    return res
  },

  async createPaymentIntent(data: any) {
    const res = await apiService.post('/payment-intents', data)
    return res
  },

  async confirmPaymentIntent(intentId: string, data: any) {
    const res = await apiService.post(`/payment-intents/${intentId}/confirm`, data)
    return res
  },

  async createCustomer(data: any) {
    const res = await apiService.post('/customers', data)
    return res
  },

  async addPaymentMethod(customerId: string, data: any) {
    const res = await apiService.post(`/customers/${customerId}/payment-methods`, data)
    return res
  },

  async getProcessorStats() {
    const res = await apiService.get('/payment-processors/stats')
    return res
  },

  // Bank connection methods
  async getInstitutions() {
    const res = await apiService.get('/institutions')
    return res
  },

  async createConnection(data: any) {
    const res = await apiService.post('/connections', data)
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
    const res = await apiService.get('/mobile-banking/stats')
    return res
  },

  async getMobileTransactions(limit?: number) {
    const params = limit ? `?limit=${limit}` : ''
    const res = await apiService.get(`/mobile-banking/transactions${params}`)
    return res
  },

  async getMobileAccounts() {
    const res = await apiService.get('/mobile-banking/accounts')
    return res
  },

  async getMobileInsights() {
    const res = await apiService.get('/mobile-banking/insights')
    return res
  },

  async getMobileNotifications() {
    const res = await apiService.get('/mobile-banking/notifications')
    return res
  },

  async getQuickActions() {
    const res = await apiService.get('/mobile-banking/quick-actions')
    return res
  },

  async executeQuickAction(actionId: string, data?: any) {
    const res = await apiService.post(`/mobile-banking/quick-actions/${actionId}/execute`, data)
    return res
  },

  // Mobile money methods
  async getMobileMoneyProviders(country?: string) {
    const params = country ? `?country=${country}` : ''
    const res = await apiService.get(`/mobile-money/providers${params}`)
    return res
  },

  async getMobileMoneyProvider(providerId: string) {
    const res = await apiService.get(`/mobile-money/providers/${providerId}`)
    return res
  },

  async createMobileMoneyAccount(data: any) {
    const res = await apiService.post('/mobile-money/accounts', data)
    return res
  },

  async getMobileMoneyAccounts() {
    const res = await apiService.get('/mobile-money/accounts')
    return res
  },

  async initiateMobileMoneyPayment(data: any) {
    const res = await apiService.post('/mobile-money/payments', data)
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

// Debug log to verify bankingApiV2 is properly constructed
console.log('🏦 bankingApiV2 object constructed with methods:', Object.keys(bankingApiV2))

export default bankingApiV2
