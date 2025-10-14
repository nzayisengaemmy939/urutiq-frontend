// Budget Management API service
import { apiService } from '../api';
import { getCompanyId } from '../config';
// Helper function to get headers
const getHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
    'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo'
});
// Budget Management API
export const budgetManagementApi = {
    // Companies
    getCompanies: async () => {
        const response = await apiService.get('/api/companies', {
            headers: getHeaders()
        });
        // The apiService.get already extracts the data array from {data: [...], page: 1, ...}
        return response || [];
    },
    // Dimensions
    getDimensions: async (companyId) => {
        const response = await apiService.get(`/api/budget-management/${companyId}/dimensions`, {
            headers: getHeaders()
        });
        return response || [];
    },
    createDimension: async (data) => {
        const response = await apiService.post(`/api/budget-management/${data.companyId}/dimensions`, data, {
            headers: getHeaders()
        });
        return response;
    },
    updateDimension: async (id, data) => {
        const response = await apiService.put(`/api/budget-management/${data.companyId}/dimensions/${id}`, data, {
            headers: getHeaders()
        });
        return response;
    },
    deleteDimension: async (id, companyId) => {
        await apiService.delete(`/api/budget-management/${companyId}/dimensions/${id}`, {
            headers: getHeaders()
        });
    },
    // Scenarios
    getScenarios: async (companyId) => {
        const response = await apiService.get(`/api/budget-management/${companyId}/scenarios`, {
            headers: getHeaders()
        });
        return response || [];
    },
    createScenario: async (companyId, data) => {
        const response = await apiService.post(`/api/budget-management/${companyId}/scenarios`, data, {
            headers: getHeaders()
        });
        return response.data;
    },
    // Periods
    getPeriods: async (companyId) => {
        const response = await apiService.get(`/api/budget-management/${companyId}/periods`, {
            headers: getHeaders()
        });
        return response || [];
    },
    createPeriod: async (companyId, data) => {
        const response = await apiService.post(`/api/budget-management/${companyId}/periods`, data, {
            headers: getHeaders()
        });
        return response.data;
    },
    // Budgets
    getBudgets: async (companyId) => {
        const response = await apiService.get(`/api/budget-management/${companyId}/budgets`, {
            headers: getHeaders()
        });
        return response || [];
    },
    createBudget: async (companyId, data) => {
        const response = await apiService.post(`/api/budget-management/${companyId}/budgets`, data, {
            headers: getHeaders()
        });
        return response.data;
    },
    updateBudget: async (companyId, budgetId, data) => {
        const response = await apiService.put(`/api/budget-management/${companyId}/budgets/${budgetId}`, data, {
            headers: getHeaders()
        });
        return response.data;
    },
    approveBudget: async (companyId, budgetId) => {
        const response = await apiService.post(`/api/budget-management/${companyId}/budgets/${budgetId}/approve`, {}, {
            headers: getHeaders()
        });
        return response.data;
    },
    activateBudget: async (companyId, budgetId) => {
        const response = await apiService.post(`/api/budget-management/${companyId}/budgets/${budgetId}/activate`, {}, {
            headers: getHeaders()
        });
        return response.data;
    },
    copyBudget: async (companyId, budgetId) => {
        const response = await apiService.post(`/api/budget-management/${companyId}/budgets/${budgetId}/copy`, {}, {
            headers: getHeaders()
        });
        return response.data;
    },
    // Budget Line Items
    getBudgetLineItems: async (companyId, budgetId) => {
        const response = await apiService.get(`/api/budget-management/${companyId}/budgets/${budgetId}/line-items`, {
            headers: getHeaders()
        });
        return response.data || [];
    },
    createBudgetLineItem: async (companyId, budgetId, data) => {
        const response = await apiService.post(`/api/budget-management/${companyId}/budgets/${budgetId}/line-items`, data, {
            headers: getHeaders()
        });
        return response.data;
    },
    // Variances
    getVariances: async (companyId, budgetId) => {
        const response = await apiService.get(`/api/budget-management/${companyId}/budgets/${budgetId}/variances`, {
            headers: getHeaders()
        });
        return response || [];
    },
    // Rolling Forecasts
    getRollingForecasts: async (companyId) => {
        const response = await apiService.get(`/api/budget-management/${companyId}/rolling-forecasts`, {
            headers: getHeaders()
        });
        return response || [];
    },
    createRollingForecast: async (data) => {
        const response = await apiService.post(`/api/budget-management/${data.companyId}/rolling-forecasts`, data, {
            headers: getHeaders()
        });
        return response;
    },
    updateRollingForecast: async (id, data) => {
        const response = await apiService.put(`/api/budget-management/${data.companyId}/rolling-forecasts/${id}`, data, {
            headers: getHeaders()
        });
        return response;
    },
    deleteRollingForecast: async (id, companyId) => {
        await apiService.delete(`/api/budget-management/${companyId}/rolling-forecasts/${id}`, {
            headers: getHeaders()
        });
    },
    generateForecast: async (companyId, forecastId) => {
        const response = await apiService.post(`/api/budget-management/${companyId}/rolling-forecasts/${forecastId}/generate`, {}, {
            headers: getHeaders()
        });
        return response.data;
    },
    // Performance Metrics
    getPerformanceMetrics: async (companyId, period) => {
        const params = period ? `?period=${period}` : '';
        const response = await apiService.get(`/api/budget-management/${companyId}/performance-metrics${params}`, {
            headers: getHeaders()
        });
        return response;
    },
    // Reports
    getReports: async (companyId, reportType) => {
        const params = reportType ? `?type=${reportType}` : '';
        const response = await apiService.get(`/api/budget-management/${companyId}/reports${params}`, {
            headers: getHeaders()
        });
        return response.data;
    }
};
// Simple Budget API (from expenses)
export const simpleBudgetApi = {
    getBudgets: async (companyId) => {
        const params = companyId ? `?companyId=${companyId}` : '';
        const response = await apiService.get(`/api/budgets${params}`, {
            headers: getHeaders()
        });
        return response || [];
    },
    createBudget: async (data) => {
        const response = await apiService.post('/api/budgets', data, {
            headers: getHeaders()
        });
        return response;
    },
    updateBudget: async (id, data) => {
        const response = await apiService.put(`/api/budgets/${id}`, data, {
            headers: getHeaders()
        });
        return response;
    },
    deleteBudget: async (id) => {
        await apiService.delete(`/api/budgets/${id}`, {
            headers: getHeaders()
        });
    },
    getBudgetAnalytics: async (companyId) => {
        const activeCompanyId = companyId || getCompanyId();
        const params = activeCompanyId ? `?companyId=${activeCompanyId}` : '';
        const response = await apiService.get(`/api/budgets/analytics${params}`, {
            headers: getHeaders()
        });
        return response;
    },
    getBudgetAnalysis: async (companyId, startDate, endDate) => {
        const searchParams = new URLSearchParams();
        if (companyId)
            searchParams.append('companyId', companyId);
        if (startDate)
            searchParams.append('startDate', startDate);
        if (endDate)
            searchParams.append('endDate', endDate);
        const params = searchParams.toString() ? `?${searchParams.toString()}` : '';
        const response = await apiService.get(`/api/budget-analysis${params}`, {
            headers: getHeaders()
        });
        return response;
    }
};
