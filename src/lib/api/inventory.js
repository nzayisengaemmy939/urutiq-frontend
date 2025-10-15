// Enhanced Inventory API service for comprehensive inventory management
import { apiService } from '../api';
import { config, getCompanyId, getTenantId } from '../config';
// Default company ID for demo purposes
const DEFAULT_COMPANY_ID = config.demo.companyId;
// Helper function to get API headers
const getHeaders = () => {
    const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        'x-tenant-id': getTenantId(),
        'x-company-id': getCompanyId()
    };
};
// Enhanced Inventory API
export const inventoryApi = {
    // Products
    getProducts: async (params) => {
        const queryParams = new URLSearchParams();
        if (params?.companyId || DEFAULT_COMPANY_ID) {
            queryParams.append('companyId', params?.companyId || DEFAULT_COMPANY_ID);
        }
        if (params?.page)
            queryParams.append('page', params.page.toString());
        if (params?.pageSize)
            queryParams.append('pageSize', params.pageSize.toString());
        if (params?.q)
            queryParams.append('q', params.q);
        if (params?.category)
            queryParams.append('category', params.category);
        if (params?.status)
            queryParams.append('status', params.status);
        if (params?.locationId)
            queryParams.append('locationId', params.locationId);
        
        const headers = getHeaders();
        console.log('=== INVENTORY API getProducts ===');
        console.log('Params:', params);
        console.log('Headers:', headers);
        console.log('Query string:', queryParams.toString());
        
        return await apiService.get(`/api/products?${queryParams.toString()}`, {
            headers: headers
        });
    },
    getProduct: async (id) => {
        return await apiService.get(`/api/products/${id}`, {
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
        return await apiService.put(`/api/products/${id}`, data, {
            headers: getHeaders()
        });
    },
    deleteProduct: async (id) => {
        await apiService.delete(`/api/products/${id}`, {
            headers: getHeaders()
        });
    },
    // Locations
    getLocations: async (companyId) => {
        const params = new URLSearchParams();
        if (companyId || DEFAULT_COMPANY_ID) {
            params.append('companyId', companyId || DEFAULT_COMPANY_ID);
        }
        return await apiService.get(`/api/locations?${params.toString()}`, {
            headers: getHeaders()
        });
    },
    createLocation: async (data) => {
        return await apiService.post('/api/locations', {
            ...data,
            companyId: data.companyId || DEFAULT_COMPANY_ID
        }, {
            headers: getHeaders()
        });
    },
    updateLocation: async (id, data) => {
        return await apiService.put(`/api/locations/${id}`, data, {
            headers: getHeaders()
        });
    },
    deleteLocation: async (id) => {
        await apiService.delete(`/api/locations/${id}`, {
            headers: getHeaders()
        });
    },
    // Inventory Movements
    getMovements: async (params) => {
        const queryParams = new URLSearchParams();
        if (params?.companyId || DEFAULT_COMPANY_ID) {
            queryParams.append('companyId', params?.companyId || DEFAULT_COMPANY_ID);
        }
        if (params?.productId)
            queryParams.append('productId', params.productId);
        if (params?.locationId)
            queryParams.append('locationId', params.locationId);
        if (params?.movementType)
            queryParams.append('movementType', params.movementType);
        if (params?.page)
            queryParams.append('page', params.page.toString());
        if (params?.pageSize)
            queryParams.append('pageSize', params.pageSize.toString());
        return await apiService.get(`/api/movements?${queryParams.toString()}`, {
            headers: getHeaders()
        });
    },
    createMovement: async (data) => {
        return await apiService.post('/api/inventory-movements', data, {
            headers: getHeaders()
        });
    },
    // Product-Location management
    createProductLocation: async (data) => {
        return await apiService.post('/api/product-locations', data, {
            headers: getHeaders()
        });
    },
    getProductLocations: async (params) => {
        const queryParams = new URLSearchParams();
        if (params?.companyId)
            queryParams.append('companyId', params.companyId);
        if (params?.locationId)
            queryParams.append('locationId', params.locationId);
        if (params?.productId)
            queryParams.append('productId', params.productId);
        return await apiService.get(`/api/product-locations?${queryParams.toString()}`, {
            headers: getHeaders()
        });
    },
    deleteProductLocation: async (id) => {
        return await apiService.delete(`/api/product-locations/${id}`, {
            headers: getHeaders()
        });
    },
    // Inventory Transfers
    getTransfers: async (params) => {
        const queryParams = new URLSearchParams();
        if (params?.companyId || DEFAULT_COMPANY_ID) {
            queryParams.append('companyId', params?.companyId || DEFAULT_COMPANY_ID);
        }
        if (params?.status)
            queryParams.append('status', params.status);
        if (params?.page)
            queryParams.append('page', params.page.toString());
        if (params?.pageSize)
            queryParams.append('pageSize', params.pageSize.toString());
        return await apiService.get(`/transfers?${queryParams.toString()}`, {
            headers: getHeaders()
        });
    },
    createTransfer: async (data) => {
        return await apiService.post('/api/transfers', {
            ...data,
            companyId: data.companyId || DEFAULT_COMPANY_ID
        }, {
            headers: getHeaders()
        });
    },
    // Reorder Alerts
    getAlerts: async (params) => {
        const queryParams = new URLSearchParams();
        if (params?.companyId || DEFAULT_COMPANY_ID) {
            queryParams.append('companyId', params?.companyId || DEFAULT_COMPANY_ID);
        }
        if (params?.status)
            queryParams.append('status', params.status);
        return await apiService.get(`/api/alerts?${queryParams.toString()}`, {
            headers: getHeaders()
        });
    },
    generateAlerts: async (companyId) => {
        return await apiService.post(`/api/alerts/generate?companyId=${companyId}`, {}, {
            headers: getHeaders()
        });
    },
    acknowledgeAlert: async (alertId) => {
        return await apiService.post(`/api/alerts/${alertId}/acknowledge`, {}, {
            headers: getHeaders()
        });
    },
    dismissAlert: async (alertId) => {
        return await apiService.post(`/api/alerts/${alertId}/dismiss`, {}, {
            headers: getHeaders()
        });
    },
    // Alert Settings
    getAlertSettings: async () => {
        return await apiService.get('/api/alerts/settings', {
            headers: getHeaders()
        });
    },
    updateAlertSettings: async (settings) => {
        return await apiService.post('/api/alerts/settings', settings, {
            headers: getHeaders()
        });
    },
    // Inventory Transfers
    updateTransferStatus: async (transferId, status, completedBy) => {
        return await apiService.post(`/api/transfers/${transferId}/status`, {
            status,
            completedBy
        }, {
            headers: getHeaders()
        });
    },
    // Analytics
    getAnalytics: async (params) => {
        const queryParams = new URLSearchParams();
        const companyId = params?.companyId || getCompanyId();
        if (companyId) {
            queryParams.append('companyId', companyId);
        }
        if (params?.period)
            queryParams.append('period', params.period);
        if (params?.location)
            queryParams.append('location', params.location);
        return await apiService.get(`/api/analytics?${queryParams.toString()}`, {
            headers: getHeaders()
        });
    },
    getKPIs: async (params) => {
        const queryParams = new URLSearchParams();
        const companyId = params?.companyId || getCompanyId();
        if (companyId) {
            queryParams.append('companyId', companyId);
        }
        if (params?.period)
            queryParams.append('period', params.period);
        if (params?.location)
            queryParams.append('location', params.location);
        return await apiService.get(`/api/kpis?${queryParams.toString()}`, {
            headers: getHeaders()
        });
    },
    // Serial Numbers
    getSerialNumbers: async (productId, params) => {
        const queryParams = new URLSearchParams();
        if (params?.status)
            queryParams.append('status', params.status);
        return await apiService.get(`/api/products/${productId}/serial-numbers?${queryParams.toString()}`, {
            headers: getHeaders()
        });
    },
    // Batches
    getBatches: async (productId, params) => {
        const queryParams = new URLSearchParams();
        if (params?.status)
            queryParams.append('status', params.status);
        return await apiService.get(`/api/products/${productId}/batches?${queryParams.toString()}`, {
            headers: getHeaders()
        });
    },
    // AI Forecasting
    getForecasts: async (params) => {
        const queryParams = new URLSearchParams();
        if (params?.companyId || DEFAULT_COMPANY_ID) {
            queryParams.append('companyId', params?.companyId || DEFAULT_COMPANY_ID);
        }
        if (params?.period)
            queryParams.append('period', params.period);
        if (params?.category)
            queryParams.append('category', params.category);
        if (params?.location)
            queryParams.append('location', params.location);
        if (params?.horizon)
            queryParams.append('horizon', params.horizon);
        return await apiService.get(`/api/forecasts?${queryParams.toString()}`, {
            headers: getHeaders()
        });
    },
    getForecastInsights: async (params) => {
        const queryParams = new URLSearchParams();
        if (params?.companyId || DEFAULT_COMPANY_ID) {
            queryParams.append('companyId', params?.companyId || DEFAULT_COMPANY_ID);
        }
        if (params?.period)
            queryParams.append('period', params.period);
        if (params?.category)
            queryParams.append('category', params.category);
        if (params?.location)
            queryParams.append('location', params.location);
        const url = `/api/forecast-insights?${queryParams.toString()}`;
        console.log('Calling forecast insights API:', url, 'with headers:', getHeaders());
        const result = await apiService.get(url, {
            headers: getHeaders()
        });
        console.log('Forecast insights API response:', result);
        return result;
    },
    getAIRecommendations: async (params) => {
        const queryParams = new URLSearchParams();
        if (params?.companyId || DEFAULT_COMPANY_ID) {
            queryParams.append('companyId', params?.companyId || DEFAULT_COMPANY_ID);
        }
        if (params?.period)
            queryParams.append('period', params.period);
        if (params?.category)
            queryParams.append('category', params.category);
        if (params?.location)
            queryParams.append('location', params.location);
        return await apiService.get(`/api/ai-recommendations?${queryParams.toString()}`, {
            headers: getHeaders()
        });
    }
};
export default inventoryApi;
