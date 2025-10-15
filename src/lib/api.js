import { config, getTenantId } from './config';
class ApiService {
    constructor() {
        Object.defineProperty(this, "baseUrl", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "token", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "tenantId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "refreshTokenValue", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.baseUrl = config.api.baseUrl;
        console.log('API Service initialized with base URL:', this.baseUrl);
    }
    setAuth(token, tenantId) {
        this.token = token;
        this.tenantId = tenantId;
    }
    setRefreshToken(token) {
        this.refreshTokenValue = token;
    }
    async request(endpoint, options = {}) {
        // Add /api prefix to the endpoint if it doesn't already have it, except for journal-hub routes
        const apiEndpoint = endpoint.startsWith('/api') || endpoint.startsWith('/journal-hub') ? endpoint : `/api${endpoint}`;
        const url = `${this.baseUrl}${apiEndpoint}`;
        // Best-effort hydrate auth from storage if missing
        try {
            if (typeof window !== 'undefined') {
                if (!this.token) {
                    const t = localStorage.getItem('auth_token');
                    if (t)
                        this.token = t;
                }
                if (!this.tenantId) {
                    const tid = localStorage.getItem('tenant_id');
                    if (tid)
                        this.tenantId = tid;
                }
                if (!this.refreshTokenValue) {
                    const rt = localStorage.getItem('refresh_token');
                    if (rt)
                        this.refreshTokenValue = rt;
                }
                // Debug logging for API requests
                console.log('=== API REQUEST DEBUG ===');
                console.log('URL:', url);
                console.log('apiService.token:', this.token ? 'Set' : 'Missing');
                console.log('apiService.tenantId:', this.tenantId);
                console.log('localStorage auth_token:', localStorage.getItem('auth_token') ? 'Set' : 'Missing');
                console.log('localStorage tenant_id:', localStorage.getItem('tenant_id'));
            }
        }
        catch { }
        const headers = {
            ...options.headers,
        };
        // Only set Content-Type to application/json if body is not FormData
        if (!(options.body instanceof FormData)) {
            headers['Content-Type'] = 'application/json';
        }
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        headers['x-tenant-id'] = this.tenantId || getTenantId();
        try {
            if (typeof window !== 'undefined') {
                const companyId = localStorage.getItem('company_id') || localStorage.getItem('companyId') || localStorage.getItem('company');
                if (companyId)
                    headers['x-company-id'] = companyId;
            }
        }
        catch { }
        console.log('Final headers being sent:', headers);
        // Debug logging for unified approval requests
        if (apiEndpoint.includes('/unified-approvals/')) {
            console.log('🔍 API Request Debug:', {
                url: apiEndpoint,
                method: options.method || 'GET',
                headers: {
                    'x-tenant-id': headers['x-tenant-id'],
                    'Authorization': headers['Authorization'] ? 'Bearer ***' : 'None',
                    'x-company-id': headers['x-company-id'] || 'None'
                },
                token: this.token ? 'Present' : 'Missing',
                tenantId: this.tenantId || 'Using fallback'
            });
        }
        const doFetch = async () => {
            return fetch(url, { ...options, headers });
        };
        let response = await doFetch();
        // Attempt refresh once on 401; if unavailable or fails, fall back to demo token
        if (response.status === 401) {
            try {
                // Best-effort hydrate from storage
                if (!this.refreshTokenValue && typeof window !== 'undefined') {
                    try {
                        const rt = localStorage.getItem('refresh_token');
                        if (rt)
                            this.refreshTokenValue = rt;
                    }
                    catch { }
                }
                if (!this.token && typeof window !== 'undefined') {
                    try {
                        const t = localStorage.getItem('auth_token');
                        if (t)
                            this.token = t;
                    }
                    catch { }
                }
                let retried = false;
                // Try refresh if we have a refresh token
                if (this.refreshTokenValue) {
                    const refreshResp = await fetch(`${this.baseUrl}/api/auth/refresh`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'x-tenant-id': this.tenantId || getTenantId() },
                        body: JSON.stringify({ refreshToken: this.refreshTokenValue })
                    });
                    if (refreshResp.ok) {
                        const refreshData = await refreshResp.json();
                        const newAccess = (refreshData.data?.accessToken) || refreshData.accessToken;
                        if (newAccess) {
                            this.token = newAccess;
                            try {
                                localStorage.setItem('auth_token', newAccess);
                            }
                            catch { }
                            headers['Authorization'] = `Bearer ${newAccess}`;
                            response = await doFetch();
                            retried = true;
                        }
                    }
                }
                // If still unauthorized or no refresh available, obtain a demo token and retry once
                if (!retried && (response.status === 401)) {
                    try {
                        const demoResp = await fetch(`${this.baseUrl}/api/auth/demo-token`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', 'x-tenant-id': this.tenantId || getTenantId() },
                            body: JSON.stringify({ sub: 'demo_user', roles: ['admin', 'accountant'] })
                        });
                        if (demoResp.ok) {
                            const { token } = await demoResp.json();
                            if (token) {
                                this.token = token;
                                try {
                                    localStorage.setItem('auth_token', token);
                                }
                                catch { }
                                ;
                                headers['Authorization'] = `Bearer ${token}`;
                                response = await doFetch();
                            }
                        }
                    }
                    catch { }
                }
            }
            catch { }
        }
        if (!response.ok) {
            let errorMessage = `HTTP ${response.status}`;
            let errorData = null;
            try {
                // Read response as text first
                const responseText = await response.text();
                if (responseText) {
                    try {
                        // Try to parse as JSON
                        errorData = JSON.parse(responseText);
                        // Extract error message from various structures
                        if (errorData.message) {
                            errorMessage = errorData.message;
                        }
                        else if (errorData.error && typeof errorData.error === 'string') {
                            errorMessage = errorData.error;
                        }
                        else if (errorData.error && errorData.error.message) {
                            errorMessage = errorData.error.message;
                        }
                    }
                    catch (e) {
                        // Not JSON, use raw text as error
                        errorMessage = responseText;
                        errorData = { raw: responseText };
                    }
                }
            }
            catch (e) {
                // Failed to read response
            }
            // Create error with all the data
            const error = new Error(errorMessage);
            error.status = response.status;
            error.response = {
                status: response.status,
                data: errorData
            };
            error.data = errorData;
            throw error;
        }
        // Some endpoints (for example logout) may return an empty body or a non-JSON payload.
        // Read the raw text first and only parse JSON when present to avoid "Unexpected end of JSON input" errors.
        const raw = await response.text();
        let data = {};
        if (raw && raw.length > 0) {
            try {
                data = JSON.parse(raw);
            }
            catch (err) {
                console.error('JSON parsing error:', err);
                console.error('Raw text that failed to parse:', raw);
                // If parsing fails, fall back to returning the raw text under a `data` field so callers get something useful.
                data = raw;
            }
        }
        return data;
    }
    // Convenience HTTP helpers that return the typed data payload (not the ApiResponse wrapper)
    async get(endpoint, options = {}) {
        const resp = await this.request(endpoint, { ...options, method: options.method || 'GET' });
        // For products endpoint, return the full response to preserve items and data arrays
        if (endpoint.includes('/api/products')) {
            return resp;
        }
        // For companies endpoint, return the companies array directly
        if (endpoint.includes('/api/companies')) {
            return resp.companies || [];
        }
        // For vendors endpoint, return the data array directly
        if (endpoint.includes('/api/vendors')) {
            return resp.data || resp.items || [];
        }
        // Handle both wrapped responses (resp.data) and direct responses (resp)
        const result = resp.data ?? resp ?? {};
        return result;
    }
    async post(endpoint, body, options = {}) {
        // Handle FormData specially - don't stringify it and let the browser set Content-Type
        let requestBody = body;
        let requestOptions = { ...options };
        if (body instanceof FormData) {
            // For FormData, don't stringify and don't set Content-Type
            requestBody = body;
        }
        else if (body) {
            // For regular objects, stringify as JSON
            requestBody = JSON.stringify(body);
        }
        else {
            requestBody = options.body;
        }
        const resp = await this.request(endpoint, { method: 'POST', body: requestBody, ...requestOptions });
        // Handle both wrapped responses (resp.data) and direct responses (resp)
        // If resp.data exists, use it; otherwise use the entire response
        return resp.data ?? resp ?? {};
    }
    async put(endpoint, body, options = {}) {
        const resp = await this.request(endpoint, { method: 'PUT', body: body ? JSON.stringify(body) : options.body, ...options });
        // Handle both wrapped responses (resp.data) and direct responses (resp)
        return resp.data ?? resp ?? {};
    }
    async delete(endpoint, options = {}) {
        const resp = await this.request(endpoint, { method: 'DELETE', ...options });
        // Handle both wrapped responses (resp.data) and direct responses (resp)
        return resp.data ?? resp ?? {};
    }
    // Authentication
    async getDemoToken(sub, roles = ['admin']) {
        const response = await this.request('/api/auth/demo-token', {
            method: 'POST',
            body: JSON.stringify({ sub, roles }),
        });
        const payload = response.data ?? response;
        return payload || { token: '' };
    }
    async register(data) {
        const response = await this.request('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        const payload = response.data ?? response;
        return payload || { id: '', email: '' };
    }
    // ✅ Register with company
    async registerWithCompany(data) {
        const response = await this.request('/api/companies', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        const payload = response.data ?? response;
        return payload || { id: '', name: '' };
    }
    async getUsers() {
        const response = await this.request('/api/auth/users', {
            method: 'GET',
        });
        return response.data || { users: [], totalCount: 0 };
    }
    async createUser(userData) {
        const response = await this.request('/api/auth/users', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
        return response.data || response.data;
    }
    async updateUser(userId, userData) {
        const response = await this.request(`/api/auth/users/${userId}`, {
            method: 'PUT',
            body: JSON.stringify(userData),
        });
        return response.data || response.data;
    }
    async deleteUser(userId) {
        const response = await this.request(`/api/auth/users/${userId}`, {
            method: 'DELETE',
        });
        return response.data || response.data;
    }
    async login(email, password) {
        const response = await this.request('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        const payload = response.data ?? response;
        return payload || { accessToken: '', refreshToken: '', tokenType: 'Bearer', expiresIn: 3600 };
    }
    // MFA-aware login: returns either tokens or challenge
    async loginMfa(email, password) {
        const url = `${this.baseUrl}/api/auth/login`;
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-tenant-id': this.tenantId || getTenantId() },
            body: JSON.stringify({ email, password })
        });
        const bodyText = await res.text();
        let body = {};
        try {
            body = bodyText ? JSON.parse(bodyText) : {};
        }
        catch { }
        if (res.status === 200 && body) {
            const data = body.data ?? body;
            return { ok: true, tokens: data };
        }
        if (res.status === 401 && body && (body.challengeRequired || body.challengeToken)) {
            const data = body.data ?? body;
            return { ok: false, challengeToken: data.challengeToken };
        }
        const message = (body && (body.error?.message || body.message)) || `HTTP ${res.status}`;
        throw new Error(message);
    }
    async verifyMfaLogin(challengeToken, code) {
        const url = `${this.baseUrl}/api/auth/mfa/login/verify`;
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-tenant-id': this.tenantId || getTenantId() },
            body: JSON.stringify({ challengeToken, code })
        });
        const text = await res.text();
        let body = {};
        try {
            body = text ? JSON.parse(text) : {};
        }
        catch { }
        if (!res.ok) {
            const msg = (body && (body.error?.message || body.message)) || `HTTP ${res.status}`;
            throw new Error(msg);
        }
        const data = body.data ?? body;
        return data;
    }
    async refresh(refreshToken) {
        const response = await this.request('/api/auth/refresh', {
            method: 'POST',
            body: JSON.stringify({ refreshToken }),
        });
        const payload = response.data ?? response;
        return payload || { accessToken: '', tokenType: 'Bearer', expiresIn: 3600 };
    }
    async logout(refreshToken) {
        await this.request('/api/auth/logout', {
            method: 'POST',
            body: JSON.stringify({ refreshToken }),
        });
        return;
    }
    // Companies
    async getCompanies(params) {
        const searchParams = new URLSearchParams();
        if (params?.page)
            searchParams.append('page', params.page.toString());
        if (params?.pageSize)
            searchParams.append('pageSize', params.pageSize.toString());
        if (params?.country)
            searchParams.append('country', params.country);
        if (params?.currency)
            searchParams.append('currency', params.currency);
        if (params?.q)
            searchParams.append('q', params.q);
        const queryString = searchParams.toString();
        return this.request(`/api/companies${queryString ? `?${queryString}` : ''}`);
    }
    async getCompany(id) {
        const response = await this.request(`/api/companies/${id}`);
        return response.data || response.data || { id: '', name: '', createdAt: '', updatedAt: '' };
    }
    async createCompany(data) {
        const response = await this.request('/api/companies', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        return response.data || response.data || { id: '', name: '', createdAt: '', updatedAt: '' };
    }
    async updateCompany(id, data) {
        const response = await this.request(`/api/companies/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
        return response.data || response.data || { id: '', name: '', createdAt: '', updatedAt: '' };
    }
    async deleteCompany(id) {
        await this.request(`/api/companies/${id}`, {
            method: 'DELETE',
        });
        return;
    }
    async uploadCompanyLogo(id, file) {
        const formData = new FormData();
        formData.append('logo', file);
        const response = await this.request(`/api/companies/${id}/logo`, {
            method: 'POST',
            body: formData,
        });
        console.log('Raw API response:', response);
        console.log('Response data:', response.data);
        return response.data || response.data || { id: '', name: '', createdAt: '', updatedAt: '' };
    }
    // Invoices
    async getInvoices(params) {
        const searchParams = new URLSearchParams();
        if (params?.page)
            searchParams.append('page', params.page.toString());
        if (params?.pageSize)
            searchParams.append('pageSize', params.pageSize.toString());
        if (params?.companyId)
            searchParams.append('companyId', params.companyId);
        if (params?.status)
            searchParams.append('status', params.status);
        if (params?.q)
            searchParams.append('q', params.q);
        return this.request(`/api/invoices?${searchParams.toString()}`);
    }
    async createInvoice(data) {
        const response = await this.request('/api/invoices', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        return response.data || { id: '', companyId: '', customerId: '', invoiceNumber: '', issueDate: '', totalAmount: 0, balanceDue: 0, status: '', createdAt: '', updatedAt: '' };
    }
    async postInvoice(id) {
        const response = await this.request(`/api/invoices/${id}/post`, {
            method: 'POST',
        });
        return response.data || { id: '', companyId: '', customerId: '', invoiceNumber: '', issueDate: '', totalAmount: 0, balanceDue: 0, status: '', createdAt: '', updatedAt: '' };
    }
    async updateInvoice(id, data) {
        const response = await this.request(`/api/invoices/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
        return response.data || { id: '', companyId: '', customerId: '', invoiceNumber: '', issueDate: '', totalAmount: 0, balanceDue: 0, status: '', createdAt: '', updatedAt: '' };
    }
    async getNextInvoiceNumber(companyId) {
        const sp = new URLSearchParams();
        if (companyId)
            sp.append('companyId', companyId);
        const response = await this.request(`/api/invoices/next-number?${sp.toString()}`);
        const payload = response?.data ?? response;
        if (payload && payload.invoiceNumber)
            return payload;
        const fallback = `INV-${Date.now().toString().slice(-6)}`;
        return { invoiceNumber: fallback };
    }
    async sendInvoiceEmail(id, opts) {
        console.log('🔍 API Service Debug:', {
            hasPdfBlob: !!opts.pdfBlob,
            pdfBlobSize: opts.pdfBlob?.size,
            pdfBlobType: opts.pdfBlob?.type,
            attachPdf: opts.attachPdf
        });
        if (opts.pdfBlob) {
            // Send with frontend-generated PDF
            console.log('✅ API Service: Using frontend PDF');
            const formData = new FormData();
            formData.append('to', opts.to);
            if (opts.subject)
                formData.append('subject', opts.subject);
            if (opts.message)
                formData.append('message', opts.message);
            formData.append('attachPdf', 'true');
            formData.append('pdf', opts.pdfBlob, `invoice-${id}.pdf`);
            console.log('📤 API Service: Sending FormData with PDF');
            console.log('📤 FormData entries:', Array.from(formData.entries()));
            const response = await fetch(`/api/invoices/${id}/send`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                    'x-tenant-id': localStorage.getItem('tenant_id') || '',
                    'x-company-id': localStorage.getItem('company_id') || ''
                }
            });
            if (!response.ok) {
                throw new Error(`Email failed: ${response.statusText}`);
            }
            return await response.json();
        }
        else {
            // Original method without PDF
            console.log('⚠️ API Service: Using backend PDF (no pdfBlob provided)');
            const response = await this.request(`/api/invoices/${id}/send`, { method: 'POST', body: JSON.stringify(opts) });
            const payload = response?.data ?? response;
            return payload || { ok: true };
        }
    }
    // Sales Accounting Integration
    async processInvoicePayment(invoiceId) {
        console.log('🔍 processInvoicePayment called with invoiceId:', invoiceId);
        const url = `/api/sales-accounting/process-payment/${invoiceId}`;
        console.log('🔍 Calling URL:', url);
        const response = await this.request(url, {
            method: 'POST',
        });
        console.log('🔍 processInvoicePayment response:', response);
        return response.data || { journalEntryId: '', inventoryMovements: [], success: false };
    }
    async getInvoiceAccountingEntries(invoiceId) {
        const response = await this.request(`/api/sales-accounting/invoice/${invoiceId}/entries`);
        return response.data || [];
    }
    async getInvoiceInventoryMovements(invoiceId) {
        const response = await this.request(`/api/sales-accounting/invoice/${invoiceId}/inventory-movements`);
        return response.data || [];
    }
    async getInvoicePdf(id) {
        const headers = { 'x-tenant-id': this.tenantId || getTenantId() };
        if (this.token)
            headers['Authorization'] = `Bearer ${this.token}`;
        const res = await fetch(`${this.baseUrl}/api/invoices/${id}/pdf`, { headers });
        if (!res.ok)
            throw new Error(`Failed to fetch PDF`);
        return await res.blob();
    }
    async createPaymentLink(id, opts) {
        const response = await this.request(`/api/invoices/${id}/payment-link`, { method: 'POST', body: JSON.stringify(opts || {}) });
        const payload = response?.data ?? response;
        if (payload && payload.url)
            return payload;
        return { url: `${this.baseUrl}/pay/${id}`, expiresAt: new Date(), amount: 0, currency: 'USD' };
    }
    async createPaymentIntent(id, opts) {
        const response = await this.request(`/api/invoices/${id}/payment-intent`, { method: 'POST', body: JSON.stringify(opts || {}) });
        const payload = response?.data ?? response;
        return payload;
    }
    async getPaymentStatus(id) {
        const response = await this.request(`/api/invoices/${id}/payment-status`);
        const payload = response?.data ?? response;
        return payload;
    }
    async createCustomerPortalSession(customerEmail, returnUrl) {
        const response = await this.request('/api/customer-portal', { method: 'POST', body: JSON.stringify({ customerEmail, returnUrl }) });
        const payload = response?.data ?? response;
        return payload;
    }
    async getExchangeRate(base, target) {
        try {
            const headers = { 'x-tenant-id': this.tenantId || getTenantId() };
            if (this.token)
                headers['Authorization'] = `Bearer ${this.token}`;
            const res = await fetch(`${this.baseUrl}/fx/rate?base=${encodeURIComponent(base)}&target=${encodeURIComponent(target)}`, { headers });
            if (!res.ok)
                throw new Error('rate_error');
            const body = await res.json().catch(() => ({}));
            const data = body.data ?? body;
            if (data && typeof data.rate === 'number')
                return { rate: data.rate };
        }
        catch { }
        return { rate: 1 };
    }
    async getInvoiceActivity(id) {
        return this.get(`/api/invoices/${id}/activity`);
    }
    async addInvoiceActivity(id, data) {
        return this.post(`/api/invoices/${id}/activity`, data);
    }
    async getInvoiceAttachments(id) {
        return this.get(`/api/invoices/${id}/attachments`);
    }
    async addInvoiceAttachment(id, data) {
        return this.post(`/api/invoices/${id}/attachments`, data);
    }
    async getInvoicePayments(id) {
        return this.get(`/api/invoices/${id}/payments`);
    }
    async addInvoicePayment(id, data) {
        return this.post(`/api/invoices/${id}/payments`, data);
    }
    async getInvoiceReminders(id) {
        return this.get(`/api/invoices/${id}/reminders`);
    }
    async sendInvoiceReminder(id, data) {
        return this.post(`/api/invoices/${id}/reminders`, data);
    }
    // Estimates
    async getEstimates(params) {
        const searchParams = new URLSearchParams();
        if (params?.page)
            searchParams.append('page', params.page.toString());
        if (params?.pageSize)
            searchParams.append('pageSize', params.pageSize.toString());
        if (params?.companyId)
            searchParams.append('companyId', params.companyId);
        if (params?.status)
            searchParams.append('status', params.status);
        if (params?.q)
            searchParams.append('q', params.q);
        return this.request(`/api/estimates?${searchParams.toString()}`);
    }
    async createEstimate(data) {
        const response = await this.request('/api/estimates', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        return response.data || { id: '', companyId: '', customerId: '', estimateNumber: '', issueDate: '', totalAmount: 0, currency: 'USD', status: '', createdAt: '', updatedAt: '' };
    }
    async updateEstimate(id, data) {
        const response = await this.request(`/api/estimates/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
        return response.data || { id: '', companyId: '', customerId: '', estimateNumber: '', issueDate: '', totalAmount: 0, currency: 'USD', status: '', createdAt: '', updatedAt: '' };
    }
    async convertEstimateToInvoice(id) {
        const response = await this.request(`/api/estimates/${id}/convert`, {
            method: 'POST',
        });
        return response.data || { id: '', companyId: '', customerId: '', invoiceNumber: '', issueDate: '', totalAmount: 0, balanceDue: 0, status: '', createdAt: '', updatedAt: '' };
    }
    async getNextEstimateNumber(companyId) {
        const sp = new URLSearchParams();
        if (companyId)
            sp.append('companyId', companyId);
        const response = await this.request(`/api/estimates/next-number?${sp.toString()}`);
        const payload = response?.data ?? response;
        if (payload && payload.estimateNumber)
            return payload;
        const fallback = `EST-${Date.now().toString().slice(-6)}`;
        return { estimateNumber: fallback };
    }
    async getEstimatePdf(id) {
        const headers = { 'x-tenant-id': this.tenantId || getTenantId() };
        if (this.token)
            headers['Authorization'] = `Bearer ${this.token}`;
        const res = await fetch(`${this.baseUrl}/api/estimates/${id}/pdf`, { headers });
        if (!res.ok)
            throw new Error(`Failed to fetch PDF`);
        return await res.blob();
    }
    // Recurring Invoices
    async getRecurringInvoices(params) {
        const searchParams = new URLSearchParams();
        if (params?.page)
            searchParams.set('page', params.page.toString());
        if (params?.pageSize)
            searchParams.set('pageSize', params.pageSize.toString());
        if (params?.companyId)
            searchParams.set('companyId', params.companyId);
        if (params?.status)
            searchParams.set('status', params.status);
        if (params?.q)
            searchParams.set('q', params.q);
        return this.get(`/api/recurring-invoices?${searchParams.toString()}`);
    }
    async createRecurringInvoice(data) {
        return this.post('/api/recurring-invoices', data);
    }
    async updateRecurringInvoice(id, data) {
        return this.put(`/api/recurring-invoices/${id}`, data);
    }
    async getRecurringInvoice(id) {
        return this.get(`/api/recurring-invoices/${id}`);
    }
    async deleteRecurringInvoice(id) {
        return this.delete(`/api/recurring-invoices/${id}`);
    }
    async generateInvoiceFromRecurring(id, issueDate) {
        return this.post(`/api/recurring-invoices/${id}/generate`, { issueDate });
    }
    // Update recurring invoice status
    async updateRecurringInvoiceStatus(id, status) {
        return this.put(`/api/recurring-invoices/${id}/status`, { status });
    }
    // Get generated invoices history for a recurring invoice
    async getRecurringInvoiceHistory(id, page = 1, pageSize = 20) {
        return this.get(`/api/recurring-invoices/${id}/history?page=${page}&pageSize=${pageSize}`);
    }
    // Process payment for a bill
    async processPayment(data) {
        return this.post('/api/accounts-payable/payments/process', data);
    }
    // Fetch bills with normalized response shape
    async getBills(params) {
        const searchParams = new URLSearchParams();
        if (params?.companyId)
            searchParams.append('companyId', params.companyId);
        if (params?.status)
            searchParams.append('status', params.status);
        if (params?.page)
            searchParams.append('page', String(params.page));
        if (params?.pageSize)
            searchParams.append('pageSize', String(params.pageSize));
        const res = await this.get(`/api/bills${searchParams.toString() ? `?${searchParams.toString()}` : ''}`);
        // Normalize various possible backend shapes to { items, pagination }
        const rawItems = res?.items || res?.bills || (Array.isArray(res) ? res : []);
        const pagination = res?.pagination ?? { page: res?.page ?? 1, pageSize: res?.pageSize ?? rawItems.length, total: res?.total ?? rawItems.length, totalPages: res?.totalPages ?? 1 };
        // Map to Accounts Payable page expected shape
        const items = (rawItems || []).map((b) => ({
            id: b.id,
            billNumber: b.billNumber || b.number || b.reference || '',
            vendor: {
                name: b.vendor?.name || b.vendorName || b.supplier?.name || 'Unknown Vendor',
            },
            totalAmount: Number(b.totalAmount ?? b.amount ?? 0),
            balanceDue: Number(b.balanceDue ?? b.outstandingAmount ?? b.totalAmount ?? 0),
            status: b.status || 'pending',
            dueDate: b.dueDate || b.paymentDueDate || b.billDate || new Date().toISOString(),
            invoiceDate: b.invoiceDate || b.billDate || b.createdAt || new Date().toISOString(),
        }));
        return { items, pagination };
    }
    async createBill(data) {
        return this.post('/api/bills', data);
    }
    async postBill(id) {
        return this.post(`/bills/${id}/post`);
    }
    // Customers
    async getCustomers(params) {
        const searchParams = new URLSearchParams();
        if (params?.page)
            searchParams.append('page', params.page.toString());
        if (params?.pageSize)
            searchParams.append('pageSize', params.pageSize.toString());
        if (params?.companyId)
            searchParams.append('companyId', params.companyId);
        if (params?.q)
            searchParams.append('q', params.q);
        return this.get(`/api/customers?${searchParams.toString()}`);
    }
    async createCustomer(data) {
        return this.post('/api/customers', data);
    }
    async getCustomer(id) {
        return this.get(`/api/customers/${id}`);
    }
    async updateCustomer(id, data) {
        return this.put(`/api/customers/${id}`, data);
    }
    async getCustomerContacts(id) {
        return this.get(`/api/customers/${id}/contacts`);
    }
    async addCustomerContact(id, data) {
        return this.post(`/api/customers/${id}/contacts`, data);
    }
    async getCustomerAddresses(id) {
        return this.get(`/api/customers/${id}/addresses`);
    }
    async addCustomerAddress(id, data) {
        return this.post(`/api/customers/${id}/addresses`, data);
    }
    async getCustomerActivities(id) {
        return this.get(`/api/customers/${id}/activities`);
    }
    async addCustomerActivity(id, data) {
        return this.post(`/api/customers/${id}/activities`, data);
    }
    // Vendors
    async getVendors(params) {
        const searchParams = new URLSearchParams();
        if (params?.page)
            searchParams.append('page', params.page.toString());
        if (params?.pageSize)
            searchParams.append('pageSize', params.pageSize.toString());
        if (params?.companyId)
            searchParams.append('companyId', params.companyId);
        if (params?.q)
            searchParams.append('q', params.q);
        return this.get(`/vendors?${searchParams.toString()}`);
    }
    async createVendor(data) {
        return this.post('/api/vendors', data);
    }
    // Transactions
    async getTransactions(params) {
        const searchParams = new URLSearchParams();
        if (params?.page)
            searchParams.append('page', params.page.toString());
        if (params?.pageSize)
            searchParams.append('pageSize', params.pageSize.toString());
        if (params?.companyId)
            searchParams.append('companyId', params.companyId);
        if (params?.type)
            searchParams.append('type', params.type);
        if (params?.status)
            searchParams.append('status', params.status);
        if (params?.q)
            searchParams.append('q', params.q);
        return this.get(`/transactions?${searchParams.toString()}`);
    }
    // AI Insights
    async getAIInsights(params) {
        const searchParams = new URLSearchParams();
        if (params?.companyId)
            searchParams.append('companyId', params.companyId);
        if (params?.category)
            searchParams.append('category', params.category);
        if (params?.priority)
            searchParams.append('priority', params.priority);
        return this.get(`/ai/insights?${searchParams.toString()}`);
    }
    async generateAIInsights(companyId) {
        return this.post('/ai/insights/generate', { companyId });
    }
    async getAIAnomalies(params) {
        const searchParams = new URLSearchParams();
        if (params?.companyId)
            searchParams.append('companyId', params.companyId);
        if (params?.status)
            searchParams.append('status', params.status);
        return this.get(`/ai/anomalies?${searchParams.toString()}`);
    }
    async detectAIAnomalies(companyId) {
        return this.post('/ai/anomalies/detect', { companyId });
    }
    async getAIRecommendations(params) {
        const searchParams = new URLSearchParams();
        if (params?.companyId)
            searchParams.append('companyId', params.companyId);
        if (params?.status)
            searchParams.append('status', params.status);
        if (params?.type)
            searchParams.append('type', params.type);
        return this.get(`/ai/recommendations?${searchParams.toString()}`);
    }
    async generateAIRecommendations(companyId) {
        return this.post('/ai/recommendations/generate', { companyId });
    }
    // Health check
    async healthCheck() {
        return this.get('/api/health');
    }
    // Tax API
    async listTaxRates(params) {
        const sp = new URLSearchParams();
        if (params?.companyId)
            sp.append('companyId', params.companyId);
        if (params?.isActive !== undefined)
            sp.append('isActive', String(params.isActive));
        if (params?.taxName)
            sp.append('taxName', params.taxName);
        if (params?.appliesTo)
            sp.append('appliesTo', params.appliesTo);
        if (params?.page)
            sp.append('page', String(params.page));
        if (params?.limit)
            sp.append('limit', String(params.limit));
        return this.get(`/api/tax/rates?${sp.toString()}`);
    }
    async createTaxRate(data) {
        return this.post('/api/tax/rates', data);
    }
    async updateTaxRate(id, data) {
        return this.request(`/tax/rates/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    }
    async deleteTaxRate(id) {
        return this.request(`/tax/rates/${id}`, { method: 'DELETE' });
    }
    async calculateTax(data) {
        return this.post('/api/tax/calculate', data);
    }
    // Report Builder API
    async previewReportBuilder(data) {
        return this.request('/api/reports/builder/preview', { method: 'POST', body: JSON.stringify(data) });
    }
    async saveReportBuilderTemplate(data) {
        return this.request('/api/reports/builder/templates', { method: 'POST', body: JSON.stringify({
                name: data.name,
                type: data.type,
                category: data.category ?? 'custom',
                description: data.description,
                isPublic: data.isPublic ?? false,
                spec: data.spec
            }) });
    }
    // Accounts API (for pickers)
    async getAccounts(companyId, includeInactive = false) {
        const sp = new URLSearchParams();
        if (companyId)
            sp.append('companyId', companyId);
        if (includeInactive)
            sp.append('includeInactive', 'true');
        const resp = await this.request(`/api/accounts?${sp.toString()}`);
        return resp ?? { accounts: [], flat: [], total: 0 };
    }
    async getAccountTypes(companyId) {
        const sp = new URLSearchParams();
        if (companyId)
            sp.append('companyId', companyId);
        const resp = await this.request(`/api/account-types?${sp.toString()}`);
        return resp ?? [];
    }
    // Products (for invoice/product pickers)
    async getProducts(params) {
        const sp = new URLSearchParams();
        if (params?.companyId)
            sp.append('companyId', params.companyId);
        if (params?.type)
            sp.append('type', params.type);
        const resp = await this.request(`/api/products?${sp.toString()}`);
        return resp ?? [];
    }
    // Journal/Reports for Accounting page
    async getTrialBalance(companyId, asOf) {
        const sp = new URLSearchParams();
        sp.append('companyId', companyId);
        if (asOf)
            sp.append('asOf', asOf);
        return this.request(`/api/journal/trial-balance?${sp.toString()}`);
    }
    async getGeneralLedger(params) {
        const sp = new URLSearchParams();
        sp.append('companyId', params.companyId);
        if (params.startDate)
            sp.append('startDate', params.startDate);
        if (params.endDate)
            sp.append('endDate', params.endDate);
        if (params.accountId)
            sp.append('accountId', params.accountId);
        if (params.accountType)
            sp.append('accountType', params.accountType);
        if (params.page)
            sp.append('page', String(params.page));
        if (params.pageSize)
            sp.append('pageSize', String(params.pageSize));
        return this.request(`/api/journal/general-ledger?${sp.toString()}`);
    }
    // Report schedules
    async listReportSchedules(reportId) {
        const resp = await this.request(`/reports/${reportId}/schedules`);
        return resp?.data ?? [];
    }
    async createReportSchedule(reportId, data) {
        const resp = await this.request(`/reports/${reportId}/schedules`, { method: 'POST', body: JSON.stringify(data) });
        return resp?.data ?? resp;
    }
    async updateReportSchedule(reportId, scheduleId, data) {
        const resp = await this.request(`/reports/${reportId}/schedules/${scheduleId}`, { method: 'PUT', body: JSON.stringify(data) });
        return resp?.data ?? resp;
    }
    async deleteReportSchedule(reportId, scheduleId) {
        await this.request(`/reports/${reportId}/schedules/${scheduleId}`, { method: 'DELETE' });
        return;
    }
    // Reports
    async listReports(params) {
        const sp = new URLSearchParams();
        if (params?.type)
            sp.append('type', params.type);
        if (params?.isTemplate !== undefined)
            sp.append('isTemplate', String(params.isTemplate));
        if (params?.isPublic !== undefined)
            sp.append('isPublic', String(params.isPublic));
        if (params?.page)
            sp.append('page', String(params.page));
        if (params?.limit)
            sp.append('limit', String(params.limit));
        if (params?.search)
            sp.append('search', params.search);
        const resp = await this.request(`/reports?${sp.toString()}`);
        return resp;
    }
    async createReportFromBuilder(spec) {
        const payload = {
            name: spec.name,
            type: spec.type,
            description: spec.description,
            isTemplate: false,
            isPublic: false,
            items: spec.items.map((it, idx) => ({
                name: it.name,
                type: it.type,
                order: it.order ?? idx,
                configuration: it.configuration ? JSON.stringify(it.configuration) : undefined,
                formula: it.formula,
                accountIds: it.accountIds && it.accountIds.length ? it.accountIds.join(',') : undefined
            }))
        };
        const resp = await this.request('/api/reports', { method: 'POST', body: JSON.stringify(payload) });
        return resp ?? resp;
    }
    async deliverReport(reportId, opts) {
        const resp = await this.request(`/reports/${reportId}/deliver`, { method: 'POST', body: JSON.stringify(opts) });
        return resp ?? resp;
    }
    async getReportItemLineage(reportId, itemId) {
        return this.request(`/reports/${reportId}/items/${itemId}/lineage`);
    }
    async getReportItemAudit(reportId, itemId) {
        return this.request(`/reports/${reportId}/items/${itemId}/audit`);
    }
    // Journal API
    async createJournalEntryOld(data) {
        return this.request('/api/journal', { method: 'POST', body: JSON.stringify(data) });
    }
    // Notification methods
    async sendPaymentReminder(invoiceId, type = 'overdue') {
        const response = await this.request(`/api/invoices/${invoiceId}/send-reminder`, {
            method: 'POST',
            body: JSON.stringify({ type })
        });
        return response?.data ?? response;
    }
    async sendInvoiceNotification(invoiceId, type = 'sent') {
        const response = await this.request(`/api/invoices/${invoiceId}/send-notification`, {
            method: 'POST',
            body: JSON.stringify({ type })
        });
        return response?.data ?? response;
    }
    async sendPaymentConfirmation(invoiceId, paymentData) {
        const response = await this.request(`/api/invoices/${invoiceId}/send-confirmation`, {
            method: 'POST',
            body: JSON.stringify({ paymentData })
        });
        return response?.data ?? response;
    }
    async sendBulkReminders(invoiceIds, type = 'overdue') {
        const response = await this.request(`/api/invoices/send-bulk-reminders`, {
            method: 'POST',
            body: JSON.stringify({ invoiceIds, type })
        });
        return response?.data ?? response;
    }
    async getNotificationTemplates() {
        const response = await this.request(`/api/notification-templates`);
        return response?.data ?? response;
    }
    // Invoice Approval Workflow methods
    async createInvoiceApprovalWorkflow(data) {
        const response = await this.request(`/api/approval-workflows`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
        return response?.data ?? response;
    }
    async triggerInvoiceApproval(invoiceId, workflowId) {
        const response = await this.request(`/api/invoices/${invoiceId}/trigger-approval`, {
            method: 'POST',
            body: JSON.stringify({ workflowId })
        });
        return response?.data ?? response;
    }
    async processApprovalAction(approvalId, action, comments, escalationReason) {
        const response = await this.request(`/approvals/${approvalId}/action`, {
            method: 'POST',
            body: JSON.stringify({ action, comments, escalationReason })
        });
        return response?.data ?? response;
    }
    async getPendingApprovalsOld() {
        const response = await this.request(`/approvals/pending`);
        return response?.data ?? response;
    }
    async getInvoiceApprovalStatus(invoiceId) {
        const response = await this.request(`/api/invoices/${invoiceId}/approval-status`);
        return response?.data ?? response;
    }
    // OCR Invoice Processing methods
    async processInvoiceDocument(fileData, fileName, mimeType) {
        const response = await this.request(`/invoices/process-document`, {
            method: 'POST',
            body: JSON.stringify({ fileData, fileName, mimeType })
        });
        return response?.data ?? response;
    }
    async createInvoiceFromOCR(data) {
        const response = await this.request(`/invoices/create-from-ocr`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
        return response?.data ?? response;
    }
    async matchExpensesToInvoice(invoiceId) {
        const response = await this.request(`/invoices/${invoiceId}/match-expenses`);
        return response?.data ?? response;
    }
    async applyExpenseMatches(invoiceId, matches) {
        const response = await this.request(`/invoices/${invoiceId}/apply-expense-matches`, {
            method: 'POST',
            body: JSON.stringify({ matches })
        });
        return response?.data ?? response;
    }
    // Natural Language Invoice Creation methods
    async parseInvoiceText(data) {
        const response = await this.request(`/invoices/parse-text`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
        return response?.data ?? response;
    }
    async createInvoiceFromText(data) {
        const response = await this.request(`/invoices/create-from-text`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
        return response?.data ?? response;
    }
    async getInvoiceSuggestions(companyId, text) {
        const params = new URLSearchParams({ companyId });
        if (text)
            params.append('text', text);
        const response = await this.request(`/invoices/suggestions?${params}`);
        return response?.data ?? response;
    }
    async validateParsedData(parsedData) {
        const response = await this.request(`/invoices/validate-parsed-data`, {
            method: 'POST',
            body: JSON.stringify({ parsedData })
        });
        return response?.data ?? response;
    }
    // AI Conversational Accounting methods
    async sendChatMessage(data) {
        const response = await this.request(`/ai-chat/message`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
        return response?.data ?? response;
    }
    async executeChatAction(action) {
        const response = await this.request(`/ai-chat/execute-action`, {
            method: 'POST',
            body: JSON.stringify({ action })
        });
        return response?.data ?? response;
    }
    async getChatHistory(sessionId, limit) {
        const params = new URLSearchParams();
        if (limit)
            params.append('limit', limit.toString());
        const response = await this.request(`/ai-chat/history/${sessionId}?${params}`);
        return response?.data ?? response;
    }
    async getFinancialInsights(companyId) {
        const response = await this.request(`/ai-chat/insights/${companyId}`);
        return response?.data ?? response;
    }
    async startChatSession(companyId) {
        const response = await this.request(`/ai-chat/start-session`, {
            method: 'POST',
            body: JSON.stringify({ companyId })
        });
        return response?.data ?? response;
    }
    // Reconciliation API
    async getReconciliationStatus(params) {
        const sp = new URLSearchParams();
        sp.append('companyId', params.companyId);
        sp.append('bankAccountId', params.bankAccountId);
        return this.get(`/api/reconciliation/status?${sp.toString()}`);
    }
    async getReconciliationCandidates(params) {
        const sp = new URLSearchParams();
        sp.append('companyId', params.companyId);
        sp.append('bankAccountId', params.bankAccountId);
        if (params.startDate)
            sp.append('startDate', params.startDate);
        if (params.endDate)
            sp.append('endDate', params.endDate);
        return this.get(`/api/reconciliation/candidates?${sp.toString()}`);
    }
    async reconciliationMatch(data) {
        return this.post('/api/reconciliation/match', data);
    }
    async reconciliationUnmatch(data) {
        return this.post('/api/reconciliation/unmatch', data);
    }
    // AI Intelligence Methods
    async getAIStats() {
        return this.get('/api/ai-intelligence/stats');
    }
    async searchDocuments(query, filters) {
        return this.post('/api/ai-intelligence/search', { query, filters });
    }
    async getQualityAnalysis() {
        return this.get('/api/ai-intelligence/quality-analysis');
    }
    async getCategorizationSuggestions() {
        return this.get('/api/ai-intelligence/categorization-suggestions');
    }
    async getAITags() {
        return this.get('/api/ai-intelligence/tags');
    }
    async getAIExtractions() {
        return this.get('/api/ai-intelligence/extractions');
    }
    async getAISummaries() {
        return this.get('/api/ai-intelligence/summaries');
    }
    async generateAISummary(type, documentIds) {
        return this.post('/api/ai-intelligence/summaries/generate', { type, documentIds });
    }
    // Workflow management methods
    async getWorkflows() {
        const response = await this.request('/api/workflows');
        return response.data || response;
    }
    async getWorkflowStats() {
        const response = await this.request('/api/workflows/stats');
        return response.data || response;
    }
    async getWorkflowTemplates() {
        const response = await this.request('/api/workflows/templates');
        return response.data || response.data || response;
    }
    // Create workflow
    async createWorkflow(data) {
        const response = await this.request('/api/workflows', {
            method: 'POST',
            body: JSON.stringify(data)
        });
        return response.data || response.data || response;
    }
    // ==================== JOURNAL ENTRIES HUB ====================
    // Journal Entry Types
    async getJournalEntryTypes(params) {
        const response = await this.request(`/journal-hub/entry-types`);
        return response;
    }
    async createJournalEntryType(data) {
        const response = await this.request('/journal-hub/entry-types', {
            method: 'POST',
            body: JSON.stringify(data)
        });
        return response;
    }
    // Journal Entries
    async getJournalEntries(params) {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                searchParams.append(key, String(value));
            }
        });
        const response = await this.request(`/journal-hub/entries?${searchParams.toString()}`);
        return response;
    }
    async createJournalEntry(data) {
        const response = await this.request('/journal-hub/entries', {
            method: 'POST',
            body: JSON.stringify(data)
        });
        return response;
    }
    async updateJournalEntry(id, data) {
        const response = await this.request(`/journal-hub/entries/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
        return response;
    }
    async deleteJournalEntry(id) {
        await this.request(`/journal-hub/entries/${id}`, {
            method: 'DELETE'
        });
    }
    async postJournalEntry(id) {
        const response = await this.request(`/journal-hub/entries/${id}/post`, {
            method: 'POST'
        });
        return response;
    }
    // Journal Entry Templates
    async getJournalTemplates(params) {
        const response = await this.request(`/journal-hub/templates`);
        return response;
    }
    async createJournalTemplate(data) {
        const response = await this.request('/journal-hub/templates', {
            method: 'POST',
            body: JSON.stringify(data)
        });
        return response;
    }
    async createTemplateFromEntry(entryId, data) {
        const response = await this.request(`/journal-hub/templates/from-entry/${entryId}`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
        return response;
    }
    // Journal Entry Summary & Analytics
    async getJournalSummary(params) {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                searchParams.append(key, String(value));
            }
        });
        const response = await this.request(`/journal-hub/summary?${searchParams.toString()}`);
        return response;
    }
    // Approval Workflow
    async getPendingApprovals() {
        const response = await this.request(`/journal-hub/pending-approvals`);
        return response;
    }
    async approveJournalEntry(approvalId, data) {
        const response = await this.request(`/journal-hub/approvals/${approvalId}/approve`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
        return response;
    }
    async rejectJournalEntry(approvalId, data) {
        const response = await this.request(`/journal-hub/approvals/${approvalId}/reject`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
        return response;
    }
    // Recurring Entries
    async getRecurringEntries(params) {
        const response = await this.request(`/journal-hub/recurring`);
        return response;
    }
    async processRecurringEntries(data) {
        const response = await this.request('/journal-hub/recurring/process', {
            method: 'POST',
            body: JSON.stringify(data)
        });
        return response;
    }
    // Audit Trail
    async getJournalEntryAudit(entryId) {
        const response = await this.request(`/journal-hub/entries/${entryId}/audit`);
        return response;
    }
    // ==================== ADVANCED JOURNAL FEATURES ====================
    // Reverse journal entry
    async reverseJournalEntry(entryId, data) {
        const response = await this.request(`/journal-hub/entries/${entryId}/reverse`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
        return response;
    }
    // Create adjustment entry
    async adjustJournalEntry(entryId, data) {
        const response = await this.request(`/journal-hub/entries/${entryId}/adjust`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
        return response;
    }
    // Request approval for journal entry
    async requestJournalApproval(entryId, data) {
        const response = await this.request(`/journal-hub/entries/${entryId}/request-approval`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
        return response;
    }
    // Get user permissions for journal operations
    async getJournalPermissions(userId, companyId) {
        const params = new URLSearchParams();
        if (companyId)
            params.append('companyId', companyId);
        const response = await this.request(`/journal-hub/permissions/${userId}?${params.toString()}`);
        return response;
    }
    // Get performance metrics
    async getJournalMetrics(params) {
        const queryParams = new URLSearchParams();
        if (params.companyId)
            queryParams.append('companyId', params.companyId);
        if (params.startDate)
            queryParams.append('startDate', params.startDate);
        if (params.endDate)
            queryParams.append('endDate', params.endDate);
        const response = await this.request(`/journal-hub/metrics?${queryParams.toString()}`);
        return response;
    }
    // ==================== BATCH PROCESSING METHODS ====================
    // Batch create journal entries
    async batchCreateJournalEntries(data) {
        const response = await this.request('/journal-hub/entries/batch', {
            method: 'POST',
            body: JSON.stringify(data)
        });
        return response;
    }
    // Batch approve journal entries
    async batchApproveJournalEntries(data) {
        const response = await this.request('/journal-hub/entries/batch/approve', {
            method: 'POST',
            body: JSON.stringify(data)
        });
        return response;
    }
    // Batch post journal entries
    async batchPostJournalEntries(data) {
        const response = await this.request('/journal-hub/entries/batch/post', {
            method: 'POST',
            body: JSON.stringify(data)
        });
        return response;
    }
    // Batch reverse journal entries
    async batchReverseJournalEntries(data) {
        const response = await this.request('/journal-hub/entries/batch/reverse', {
            method: 'POST',
            body: JSON.stringify(data)
        });
        return response;
    }
    // Get batch processing status
    async getBatchProcessingStatus(batchId) {
        const response = await this.request(`/journal-hub/entries/batch/status/${batchId}`);
        return response;
    }
    // ==================== IMPORT/EXPORT METHODS ====================
    // Export journal entries to CSV
    async exportJournalEntriesCsv(params) {
        const queryParams = new URLSearchParams();
        if (params.companyId)
            queryParams.append('companyId', params.companyId);
        if (params.dateFrom)
            queryParams.append('dateFrom', params.dateFrom);
        if (params.dateTo)
            queryParams.append('dateTo', params.dateTo);
        if (params.status)
            queryParams.append('status', params.status);
        if (params.entryType)
            queryParams.append('entryType', params.entryType);
        if (params.format)
            queryParams.append('format', params.format);
        const response = await fetch(`${this.baseUrl}/journal-hub/entries/export/csv?${queryParams.toString()}`, {
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error('Failed to export CSV');
        }
        return response.blob();
    }
    // Export journal entries to Excel
    async exportJournalEntriesExcel(params) {
        const queryParams = new URLSearchParams();
        if (params.companyId)
            queryParams.append('companyId', params.companyId);
        if (params.dateFrom)
            queryParams.append('dateFrom', params.dateFrom);
        if (params.dateTo)
            queryParams.append('dateTo', params.dateTo);
        if (params.status)
            queryParams.append('status', params.status);
        if (params.entryType)
            queryParams.append('entryType', params.entryType);
        if (params.format)
            queryParams.append('format', params.format);
        const response = await fetch(`${this.baseUrl}/journal-hub/entries/export/excel?${queryParams.toString()}`, {
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error('Failed to export Excel');
        }
        return response.blob();
    }
    // Import journal entries from CSV
    async importJournalEntriesCsv(data) {
        const response = await this.request('/journal-hub/entries/import/csv', {
            method: 'POST',
            body: JSON.stringify(data)
        });
        return response;
    }
    // Download import template
    async downloadImportTemplate(format = 'csv') {
        const response = await fetch(`${this.baseUrl}/journal-hub/entries/import/template?format=${format}`, {
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error('Failed to download template');
        }
        return response.blob();
    }
    // ==================== ADVANCED SEARCH METHODS ====================
    // Advanced search with multiple filters
    async searchJournalEntriesAdvanced(params) {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                queryParams.append(key, value.toString());
            }
        });
        const response = await this.request(`/journal-hub/entries/search/advanced?${queryParams.toString()}`);
        return response;
    }
    // Save search query
    async saveJournalSearch(data) {
        const response = await this.request('/journal-hub/search/save', {
            method: 'POST',
            body: JSON.stringify(data)
        });
        return response;
    }
    // Get saved searches
    async getSavedJournalSearches(includePublic = true) {
        const response = await this.request(`/journal-hub/search/saved?includePublic=${includePublic}`);
        return response;
    }
    // Update saved search
    async updateJournalSearch(id, data) {
        const response = await this.request(`/journal-hub/search/saved/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
        return response;
    }
    // Delete saved search
    async deleteJournalSearch(id) {
        const response = await this.request(`/journal-hub/search/saved/${id}`, {
            method: 'DELETE'
        });
        return response;
    }
    // Get search suggestions
    async getJournalSearchSuggestions(field, query) {
        const response = await this.request(`/journal-hub/search/suggestions?field=${field}&query=${encodeURIComponent(query)}`);
        return response;
    }
    // ==================== PDF GENERATION METHODS ====================
    // Generate PDF for single journal entry
    async generateJournalEntryPDF(entryId, options) {
        const queryParams = new URLSearchParams();
        if (options?.includeAuditTrail !== undefined)
            queryParams.append('includeAuditTrail', options.includeAuditTrail.toString());
        if (options?.includeCompanyHeader !== undefined)
            queryParams.append('includeCompanyHeader', options.includeCompanyHeader.toString());
        if (options?.format)
            queryParams.append('format', options.format);
        // Build auth/tenant/company headers similar to request()
        const headers = {
            'Content-Type': 'application/json'
        };
        try {
            const tenantId = this.tenantId || (typeof window !== 'undefined' ? localStorage.getItem('tenant_id') : '') || 'demo-tenant';
            const token = this.token || (typeof window !== 'undefined' ? localStorage.getItem('auth_token') : '');
            const companyId = (typeof window !== 'undefined' ? (localStorage.getItem('company_id') || localStorage.getItem('companyId') || localStorage.getItem('company')) : '') || '';
            if (tenantId)
                headers['x-tenant-id'] = tenantId;
            if (token)
                headers['Authorization'] = `Bearer ${token}`;
            if (companyId)
                headers['x-company-id'] = companyId;
        }
        catch { }
        const response = await fetch(`${this.baseUrl}/journal-hub/entries/${entryId}/pdf?${queryParams.toString()}`, {
            headers
        });
        if (!response.ok) {
            throw new Error('Failed to generate PDF');
        }
        return response.blob();
    }
    // Generate PDF for multiple journal entries
    async generateBatchJournalEntryPDF(entryIds, options) {
        const response = await this.request('/journal-hub/entries/pdf/batch', {
            method: 'POST',
            body: JSON.stringify({
                entryIds,
                includeAuditTrail: options?.includeAuditTrail ?? true,
                includeCompanyHeader: options?.includeCompanyHeader ?? true,
                format: options?.format ?? 'detailed'
            })
        });
        if (!response.success) {
            throw new Error(response.message || 'Failed to generate batch PDF');
        }
        // This would need to be implemented differently in a real app
        // For now, we'll return a mock blob
        return new Blob(['Mock PDF content'], { type: 'application/pdf' });
    }
    // Get PDF preview (HTML)
    async getJournalEntryPreview(entryId, options) {
        const queryParams = new URLSearchParams();
        if (options?.includeAuditTrail !== undefined)
            queryParams.append('includeAuditTrail', options.includeAuditTrail.toString());
        if (options?.includeCompanyHeader !== undefined)
            queryParams.append('includeCompanyHeader', options.includeCompanyHeader.toString());
        if (options?.format)
            queryParams.append('format', options.format);
        const response = await fetch(`${this.baseUrl}/journal-hub/entries/${entryId}/preview?${queryParams.toString()}`, {
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error('Failed to generate preview');
        }
        return response.text();
    }
    // ==================== SUPPLIER PORTAL API METHODS ====================
    // Get supplier profile
    async getSupplierProfile(supplierId) {
        const response = await this.request(`/api/supplier-portal/profile/${supplierId}`);
        return response;
    }
    // Update supplier profile
    async updateSupplierProfile(supplierId, profileData) {
        const response = await this.request(`/api/supplier-portal/profile/${supplierId}`, {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });
        return response;
    }
    // Get supplier statistics
    async getSupplierStats(supplierId) {
        const response = await this.request(`/api/supplier-portal/stats/${supplierId}`);
        return response;
    }
    // Get supplier invoices
    async getSupplierInvoices(supplierId, params) {
        const queryParams = new URLSearchParams();
        if (params?.status)
            queryParams.append('status', params.status);
        if (params?.dateFrom)
            queryParams.append('dateFrom', params.dateFrom);
        if (params?.dateTo)
            queryParams.append('dateTo', params.dateTo);
        if (params?.page)
            queryParams.append('page', params.page.toString());
        if (params?.pageSize)
            queryParams.append('pageSize', params.pageSize.toString());
        const response = await this.request(`/api/supplier-portal/invoices/${supplierId}?${queryParams.toString()}`);
        return response.invoices || [];
    }
    // Get supplier payments
    async getSupplierPayments(supplierId, params) {
        const queryParams = new URLSearchParams();
        if (params?.status)
            queryParams.append('status', params.status);
        if (params?.dateFrom)
            queryParams.append('dateFrom', params.dateFrom);
        if (params?.dateTo)
            queryParams.append('dateTo', params.dateTo);
        if (params?.page)
            queryParams.append('page', params.page.toString());
        if (params?.pageSize)
            queryParams.append('pageSize', params.pageSize.toString());
        const response = await this.request(`/api/supplier-portal/payments/${supplierId}?${queryParams.toString()}`);
        return response.payments || [];
    }
    // Download invoice PDF
    async downloadInvoicePDF(supplierId, invoiceId) {
        const response = await fetch(`${this.baseUrl}/api/supplier-portal/invoices/${supplierId}/${invoiceId}/pdf`, {
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'x-tenant-id': this.tenantId || 'demo-tenant'
            }
        });
        if (!response.ok) {
            throw new Error('Failed to download invoice PDF');
        }
        return response.blob();
    }
    // Get invoice details
    async getInvoiceDetails(supplierId, invoiceId) {
        const response = await this.request(`/api/supplier-portal/invoices/${supplierId}/${invoiceId}`);
        return response;
    }
    // Get payment details
    async getPaymentDetails(supplierId, paymentId) {
        const response = await this.request(`/api/supplier-portal/payments/${supplierId}/${paymentId}`);
        return response;
    }
    // Update supplier settings
    async updateSupplierSettings(supplierId, settings) {
        const response = await this.request(`/api/supplier-portal/settings/${supplierId}`, {
            method: 'PUT',
            body: JSON.stringify(settings)
        });
        return response;
    }
    // Get supplier notifications
    async getSupplierNotifications(supplierId) {
        const response = await this.request(`/api/supplier-portal/notifications/${supplierId}`);
        return response.notifications || [];
    }
    // Mark notification as read
    async markNotificationAsRead(supplierId, notificationId) {
        const response = await this.request(`/api/supplier-portal/notifications/${supplierId}/${notificationId}/read`, {
            method: 'PUT'
        });
        return response;
    }
}
const apiService = new ApiService();
export { apiService };
export default apiService;
