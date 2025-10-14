import apiService from '../api';
export const bankingApiV2 = {
    // Generic GET method for direct API calls
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
        const res = await apiService.get(`/bank-accounts${q}`);
        return res || [];
    },
    async createBankAccount(data) {
        const res = await apiService.post('/api/bank-accounts', data);
        return res.data;
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
        const endpoint = `/bank-transactions${q}`;
        const res = await apiService.get(endpoint);
        return res || { items: [], total: 0, page: 1, pageSize: 50, totalPages: 0 };
    },
    async createBankTransaction(data) {
        const res = await apiService.post('/api/bank-transactions', data);
        return res.data;
    },
    async reconcileTransaction(transactionId, data) {
        const res = await apiService.post(`/bank-transactions/${transactionId}/reconcile`, data);
        return res.data;
    },
    async getPayments(companyId) {
        const q = companyId ? `?companyId=${encodeURIComponent(companyId)}` : '';
        const res = await apiService.get(`/payments${q}`);
        return res || [];
    },
    async createPayment(data) {
        const res = await apiService.post('/api/payments', data);
        return res.data;
    },
    // Currency methods
    async getCurrencies() {
        const res = await apiService.get('/api/currencies');
        return res;
    },
    async getExchangeRate(fromCurrency, toCurrency) {
        const res = await apiService.get(`/api/exchange-rates/${fromCurrency}/${toCurrency}`);
        return res;
    },
    async convertCurrency(fromCurrency, toCurrency, amount) {
        const res = await apiService.post('/api/convert-currency', { fromCurrency, toCurrency, amount });
        return res;
    },
    async getHistoricalRates(currency, days = 30) {
        const res = await apiService.get(`/api/exchange-rates/${currency}/history?days=${days}`);
        return res;
    },
    async updateExchangeRates() {
        const res = await apiService.post('/api/exchange-rates/update');
        return res;
    },
    formatCurrency(amount, currency = 'USD') {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
        }).format(amount);
    },
    // Payment processor methods
    async initializeProcessor(processor, config) {
        const res = await apiService.post('/api/payment-processors/initialize', { processor, config });
        return res;
    },
    async createPaymentIntent(data) {
        const res = await apiService.post('/api/payment-intents', data);
        return res;
    },
    async confirmPaymentIntent(intentId, data) {
        const res = await apiService.post(`/api/payment-intents/${intentId}/confirm`, data);
        return res;
    },
    async createCustomer(data) {
        const res = await apiService.post('/api/customers', data);
        return res;
    },
    async addPaymentMethod(customerId, data) {
        const res = await apiService.post(`/api/customers/${customerId}/payment-methods`, data);
        return res;
    },
    async getProcessorStats() {
        const res = await apiService.get('/api/payment-processors/stats');
        return res;
    },
    // Bank connection methods
    async getInstitutions() {
        const res = await apiService.get('/api/institutions');
        return res;
    },
    async createConnection(data) {
        const res = await apiService.post('/api/connections', data);
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
        const res = await apiService.get('/api/mobile-banking/stats');
        return res;
    },
    async getMobileTransactions(limit) {
        const params = limit ? `?limit=${limit}` : '';
        const res = await apiService.get(`/api/mobile-banking/transactions${params}`);
        return res;
    },
    async getMobileAccounts() {
        const res = await apiService.get('/api/mobile-banking/accounts');
        return res;
    },
    async getMobileInsights() {
        const res = await apiService.get('/api/mobile-banking/insights');
        return res;
    },
    async getMobileNotifications() {
        const res = await apiService.get('/api/mobile-banking/notifications');
        return res;
    },
    async getQuickActions() {
        const res = await apiService.get('/api/mobile-banking/quick-actions');
        return res;
    },
    async executeQuickAction(actionId, data) {
        const res = await apiService.post(`/api/mobile-banking/quick-actions/${actionId}/execute`, data);
        return res;
    },
    // Mobile money methods
    async getMobileMoneyProviders(country) {
        const params = country ? `?country=${country}` : '';
        const res = await apiService.get(`/api/mobile-money/providers${params}`);
        return res;
    },
    async getMobileMoneyProvider(providerId) {
        const res = await apiService.get(`/api/mobile-money/providers/${providerId}`);
        return res;
    },
    async createMobileMoneyAccount(data) {
        const res = await apiService.post('/api/mobile-money/accounts', data);
        return res;
    },
    async getMobileMoneyAccounts() {
        const res = await apiService.get('/api/mobile-money/accounts');
        return res;
    },
    async initiateMobileMoneyPayment(data) {
        const res = await apiService.post('/api/mobile-money/payments', data);
        return res;
    },
    async getMobileMoneyTransactions(provider, limit) {
        const params = new URLSearchParams();
        if (provider)
            params.append('provider', provider);
        if (limit)
            params.append('limit', limit.toString());
        const url = `/mobile-money/transactions${params.toString() ? `?${params.toString()}` : ''}`;
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
    async forceRefreshRate(fromCurrency, toCurrency) {
        const res = await apiService.post(`/api/force-refresh-rate/${fromCurrency}/${toCurrency}`);
        return res;
    }
};
export default bankingApiV2;
