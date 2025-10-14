import { config } from './config';
export class ApiClient {
    constructor(baseUrl = config.api.baseUrl) {
        Object.defineProperty(this, "baseUrl", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.baseUrl = baseUrl;
    }
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const defaultHeaders = {
            'Content-Type': 'application/json',
            'x-tenant-id': 'tenant_demo',
            'x-company-id': 'seed-company-1',
        };
        const config = {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers,
            },
        };
        const response = await fetch(url, config);
        if (!response.ok) {
            let errorMessage = `HTTP ${response.status}`;
            let errorDetails = null;
            try {
                const errorData = await response.json();
                if (errorData.error) {
                    errorMessage = errorData.error.message || errorMessage;
                    errorDetails = errorData.error.details;
                }
                else if (errorData.message) {
                    errorMessage = errorData.message;
                }
            }
            catch (parseError) {
                const errorText = await response.text();
                errorMessage = errorText || errorMessage;
            }
            const error = new Error(errorMessage);
            error.status = response.status;
            error.details = errorDetails;
            throw error;
        }
        const data = await response.json();
        return data;
    }
    async get(endpoint, params) {
        const url = new URL(endpoint, this.baseUrl);
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                url.searchParams.append(key, value);
            });
        }
        return this.request(url.pathname + url.search);
    }
    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined,
        });
    }
    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: data ? JSON.stringify(data) : undefined,
        });
    }
    async delete(endpoint) {
        return this.request(endpoint, {
            method: 'DELETE',
        });
    }
}
export const apiClient = new ApiClient();
