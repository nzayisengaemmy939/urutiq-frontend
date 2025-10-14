import apiService from '../api';
export const bankingApi = {
    // Generic GET method for direct API calls - Updated to fix webpack caching
    async get(endpoint) {
        return await apiService.get(endpoint);
    },
    // Generic POST method for direct API calls
    async post(endpoint, data) {
        return await apiService.post(endpoint, data);
    },
    // Generic PUT method for direct API calls
    async put(endpoint, data) {
        return await apiService.put(endpoint, data);
    },
    // Generic DELETE method for direct API calls
    async delete(endpoint) {
        return await apiService.delete(endpoint);
    },
    async getBankAccounts(companyId) {
        const q = companyId ? `?companyId=${encodeURIComponent(companyId)}` : '';
        const res = await apiService.get(`/api/bank-accounts${q}`);
        return res || [];
    },
    async createBankAccount(data) {
        const res = await apiService.post('/api/bank-accounts', data);
        return res;
    },
    async getBankTransactions(bankAccountId, companyId, status, page = 1, pageSize = 50) {
        const params = new URLSearchParams();
        if (bankAccountId)
            params.append('bankAccountId', bankAccountId);
        if (companyId)
            params.append('companyId', companyId);
        if (status)
            params.append('status', status);
        params.append('page', page.toString());
        params.append('pageSize', pageSize.toString());
        const q = params.toString() ? `?${params.toString()}` : '';
        const endpoint = `/api/bank-transactions${q}`;
        const res = await apiService.get(endpoint);
        // The backend returns the data directly, not wrapped in a 'data' property
        return res || { items: [], page: 1, pageSize: 50, total: 0, totalPages: 0, hasNext: false, hasPrev: false };
    },
    async createBankTransaction(data) {
        const res = await apiService.post('/api/bank-transactions', data);
        return res;
    },
    async getPayments(companyId) {
        const q = companyId ? `?companyId=${encodeURIComponent(companyId)}` : '';
        const res = await apiService.get(`/api/payments${q}`);
        return res || [];
    },
    async postBankFeed(feed, companyId) {
        const res = await apiService.post('/api/bank-feed?companyId=' + encodeURIComponent(companyId || ''), { feed });
        return res.data;
    },
    async reconcileTransaction(id, data) {
        const res = await apiService.post(`/api/bank-transactions/${encodeURIComponent(id)}/reconcile`, data);
        return res.data;
    },
    // Currency methods
    async getCurrencies() {
        const res = await apiService.get('/api/currencies');
        return res;
    },
    async getExchangeRate(fromCurrency, toCurrency, date) {
        const url = `/api/exchange-rates/${fromCurrency}/${toCurrency}${date ? `?date=${date}` : ''}`;
        const res = await apiService.get(url);
        return res;
    },
    async convertCurrency(amount, fromCurrency, toCurrency, date) {
        const res = await apiService.post('/api/convert-currency', {
            amount,
            fromCurrency,
            toCurrency,
            date
        });
        return res;
    },
    async getHistoricalRates(fromCurrency, toCurrency, startDate, endDate) {
        const url = `/api/historical-rates/${fromCurrency}/${toCurrency}?startDate=${startDate}&endDate=${endDate}`;
        const res = await apiService.get(url);
        return res;
    },
    async updateExchangeRates() {
        const res = await apiService.post('/api/update-exchange-rates');
        return res;
    },
    async forceRefreshRate(fromCurrency, toCurrency) {
        const res = await apiService.post(`/api/force-refresh-rate/${fromCurrency}/${toCurrency}`);
        return res;
    },
    async formatCurrency(amount, currency) {
        const res = await apiService.post('/api/format-currency', { amount, currency });
        return res;
    },
    // Payment processor methods
    async initializeProcessor(processorType, config) {
        const res = await apiService.post('/api/payment-processors/initialize', { processorType, config });
        return res;
    },
    async createPaymentIntent(amount, currency, options = {}) {
        const res = await apiService.post('/api/payment-intents', { amount, currency, ...options });
        return res;
    },
    async confirmPaymentIntent(paymentIntentId, paymentMethodId) {
        const res = await apiService.post(`/api/payment-intents/${paymentIntentId}/confirm`, { paymentMethodId });
        return res;
    },
    async createCustomer(customerData) {
        console.log('=== BANKING API DEBUG ===');
        console.log('bankingApi.createCustomer called with:', customerData);
        console.log('Calling endpoint: /api/payment-customers');
        const res = await apiService.post('/api/payment-customers', customerData);
        console.log('API response:', res);
        return res;
    },
    async addPaymentMethod(paymentMethodData) {
        console.log('=== BANKING API DEBUG ===');
        console.log('bankingApi.addPaymentMethod called with:', paymentMethodData);
        console.log('Calling endpoint: /api/payment-methods');
        const res = await apiService.post('/api/payment-methods', paymentMethodData);
        console.log('API response:', res);
        return res;
    },
    async getProcessorStats() {
        const res = await apiService.get('/api/payment-processors/stats');
        return res;
    },
    async getPaymentIntents(options = {}) {
        const params = new URLSearchParams();
        if (options.limit)
            params.append('limit', options.limit.toString());
        if (options.status)
            params.append('status', options.status);
        if (options.processor)
            params.append('processor', options.processor);
        const url = `/api/payment-intents${params.toString() ? `?${params.toString()}` : ''}`;
        const res = await apiService.get(url);
        return res;
    },
    async getPaymentCustomers(options = {}) {
        const params = new URLSearchParams();
        if (options.limit)
            params.append('limit', options.limit.toString());
        if (options.search)
            params.append('search', options.search);
        if (options.companyId)
            params.append('companyId', options.companyId);
        const url = `/api/payment-customers${params.toString() ? `?${params.toString()}` : ''}`;
        const res = await apiService.get(url);
        return res;
    },
    async getPaymentMethods(options = {}) {
        const params = new URLSearchParams();
        if (options.customerId)
            params.append('customerId', options.customerId);
        if (options.limit)
            params.append('limit', options.limit.toString());
        if (options.companyId)
            params.append('companyId', options.companyId);
        const url = `/api/payment-methods${params.toString() ? `?${params.toString()}` : ''}`;
        const res = await apiService.get(url);
        return res;
    },
    // Advanced analytics methods
    async getFinancialInsights(industry) {
        const url = industry ? `/api/analytics/insights?industry=${industry}` : '/api/analytics/insights';
        const res = await apiService.get(url);
        return res;
    },
    async getIndustryBenchmarks(industry) {
        const res = await apiService.get(`/api/analytics/benchmarks/${industry}`);
        return res;
    },
    async getCashFlowForecast(months = 6) {
        const res = await apiService.get(`/api/analytics/cash-flow-forecast?months=${months}`);
        return res;
    },
    // Bank connection methods
    async getInstitutions(provider, country, search) {
        const params = new URLSearchParams();
        if (provider)
            params.append('provider', provider);
        if (country)
            params.append('country', country);
        if (search)
            params.append('search', search);
        const url = `/api/institutions${params.toString() ? `?${params.toString()}` : ''}`;
        const res = await apiService.get(url);
        return res;
    },
    async createConnection(provider, institutionId, credentials) {
        const res = await apiService.post('/api/connections', { provider, institutionId, credentials });
        return res;
    },
    async getConnections() {
        const res = await apiService.get('/api/connections');
        return res;
    },
    async getConnectionStatus(connectionId) {
        const res = await apiService.get(`/api/connections/${connectionId}/status`);
        return res;
    },
    async syncConnection(connectionId) {
        const res = await apiService.post(`/api/connections/${connectionId}/sync`);
        return res;
    },
    async disconnectConnection(connectionId) {
        const res = await apiService.post(`/api/connections/${connectionId}/disconnect`);
        return res;
    },
    async reconnectConnection(connectionId) {
        const res = await apiService.post(`/api/connections/${connectionId}/reconnect`);
        return res;
    },
    async getConnectionStats() {
        const res = await apiService.get('/api/connections/stats');
        return res;
    },
    // Mobile banking methods
    async getMobileStats() {
        const res = await apiService.get('/api/mobile/stats');
        return res;
    },
    async getMobileTransactions(limit = 20) {
        const res = await apiService.get(`/api/mobile/transactions?limit=${limit}`);
        return res;
    },
    async getMobileAccounts() {
        const res = await apiService.get('/api/mobile/accounts');
        return res;
    },
    async getMobileInsights() {
        const res = await apiService.get('/api/mobile/insights');
        return res;
    },
    async getMobileNotifications() {
        const res = await apiService.get('/api/mobile/notifications');
        return res;
    },
    async getQuickActions() {
        const res = await apiService.get('/api/mobile/quick-actions');
        return res;
    },
    async executeQuickAction(actionId, params) {
        const res = await apiService.post(`/api/mobile/quick-actions/${actionId}`, params);
        return res;
    },
    // Mobile money methods
    async getMobileMoneyProviders(country) {
        const url = `/api/mobile-money/providers${country ? `?country=${country}` : ''}`;
        const res = await apiService.get(url);
        return res;
    },
    async getMobileMoneyProvider(providerId) {
        const res = await apiService.get(`/api/mobile-money/providers/${providerId}`);
        return res;
    },
    async createMobileMoneyAccount(accountData) {
        const res = await apiService.post('/api/mobile-money/accounts', accountData);
        return res;
    },
    async getMobileMoneyAccounts() {
        const res = await apiService.get('/api/mobile-money/accounts');
        return res;
    },
    async initiateMobileMoneyPayment(paymentData) {
        const res = await apiService.post('/api/mobile-money/payments', paymentData);
        return res;
    },
    async getMobileMoneyTransactions(provider, limit) {
        const params = new URLSearchParams();
        if (provider)
            params.append('provider', provider);
        if (limit)
            params.append('limit', limit.toString());
        const url = `/api/mobile-money/transactions${params.toString() ? `?${params.toString()}` : ''}`;
        const res = await apiService.get(url);
        return res;
    },
    async getMobileMoneyBalance(provider, phoneNumber) {
        const res = await apiService.get(`/api/mobile-money/balance?provider=${provider}&phoneNumber=${phoneNumber}`);
        return res;
    },
    async getMobileMoneyStats() {
        const res = await apiService.get('/api/mobile-money/stats');
        return res;
    },
    async forceRefreshHistorical(fromCurrency, toCurrency, startDate, endDate) {
        const res = await apiService.post(`/api/force-refresh-historical/${fromCurrency}/${toCurrency}`, {
            startDate,
            endDate
        });
        return res;
    }
};
export default bankingApi;
