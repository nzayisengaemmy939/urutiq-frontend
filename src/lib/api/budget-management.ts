// Budget Management API service
import { apiService } from '../api'
import { getCompanyId } from '../config'

// Types
export interface Company {
  id: string
  name: string
  currency: string
}

export interface Dimension {
  id: string
  name: string
  type: 'DEPARTMENT' | 'PROJECT' | 'COST_CENTER' | 'PRODUCT_LINE' | 'GEOGRAPHY' | 'CUSTOM'
  isActive: boolean
  companyId?: string
  createdAt: string
  updatedAt: string
}

export interface Scenario {
  id: string
  name: string
  description?: string
  type: 'BASE' | 'OPTIMISTIC' | 'PESSIMISTIC' | 'SCENARIO'
  isActive: boolean
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

export interface Period {
  id: string
  name: string
  startDate: string
  endDate: string
  periodType: 'MONTHLY' | 'QUARTERLY' | 'YEARLY'
  isClosed: boolean
  isCurrent: boolean
  createdAt: string
  updatedAt: string
}

export interface Budget {
  id: string
  companyId: string
  name: string
  description?: string
  scenarioId: string
  periodId: string
  status: 'DRAFT' | 'APPROVED' | 'ACTIVE' | 'CLOSED'
  totalPlanned: number
  totalActual: number
  totalVariance: number
  totalVariancePercent: number
  createdBy: string
  approvedBy?: string
  approvedAt?: string
  createdAt: string
  updatedAt: string
}

export interface BudgetVariance {
  accountId: string
  accountName: string
  dimensionId: string
  dimensionName: string
  plannedAmount: number
  actualAmount: number
  variance: number
  variancePercent: number
  trend: 'IMPROVING' | 'DETERIORATING' | 'STABLE'
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
}

export interface RollingForecast {
  id: string
  companyId: string
  name: string
  description?: string
  basePeriod: string
  forecastPeriods: number
  frequency: 'MONTHLY' | 'QUARTERLY'
  isActive: boolean
  lastUpdated: string
  createdAt: string
  updatedAt: string
}

export interface PerformanceMetrics {
  budgetAccuracy: number
  varianceTrend: 'IMPROVING' | 'DETERIORATING' | 'STABLE'
  topPerformingDimensions: Array<{ dimensionId: string; dimensionName: string; performance: number }>
  underperformingDimensions: Array<{ dimensionId: string; dimensionName: string; performance: number }>
  recommendations: string[]
}

// Helper function to get headers
const getHeaders = () => ({
  'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
  'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo'
})

// Budget Management API
export const budgetManagementApi = {
  // Companies
  getCompanies: async (): Promise<Company[]> => {
    const response = await apiService.get<Company[]>('/api/companies', {
      headers: getHeaders()
    })
    // The apiService.get already extracts the data array from {data: [...], page: 1, ...}
    return response || []
  },

  // Dimensions
  getDimensions: async (companyId: string): Promise<Dimension[]> => {
    const response = await apiService.get<Dimension[]>(`/api/budget-management/${companyId}/dimensions`, {
      headers: getHeaders()
    })
    return response || []
  },

  createDimension: async (data: Partial<Dimension>): Promise<Dimension> => {
    const response = await apiService.post<Dimension>(`/api/budget-management/${data.companyId}/dimensions`, data, {
      headers: getHeaders()
    })
    return response
  },

  updateDimension: async (id: string, data: Partial<Dimension>): Promise<Dimension> => {
    const response = await apiService.put<Dimension>(`/api/budget-management/${data.companyId}/dimensions/${id}`, data, {
      headers: getHeaders()
    })
    return response
  },

  deleteDimension: async (id: string, companyId: string): Promise<void> => {
    await apiService.delete(`/api/budget-management/${companyId}/dimensions/${id}`, {
      headers: getHeaders()
    })
  },

  // Scenarios
  getScenarios: async (companyId: string): Promise<Scenario[]> => {
    const response = await apiService.get<Scenario[]>(`/api/budget-management/${companyId}/scenarios`, {
      headers: getHeaders()
    })
    return response || []
  },

  createScenario: async (companyId: string, data: Partial<Scenario>): Promise<Scenario> => {
    const response = await apiService.post<{ data: Scenario }>(`/api/budget-management/${companyId}/scenarios`, data, {
      headers: getHeaders()
    })
    return response.data
  },

  // Periods
  getPeriods: async (companyId: string): Promise<Period[]> => {
    const response = await apiService.get<Period[]>(`/api/budget-management/${companyId}/periods`, {
      headers: getHeaders()
    })
    return response || []
  },

  createPeriod: async (companyId: string, data: Partial<Period>): Promise<Period> => {
    const response = await apiService.post<{ data: Period }>(`/api/budget-management/${companyId}/periods`, data, {
      headers: getHeaders()
    })
    return response.data
  },

  // Budgets
  getBudgets: async (companyId: string): Promise<Budget[]> => {
    const response = await apiService.get<Budget[]>(`/api/budget-management/${companyId}/budgets`, {
      headers: getHeaders()
    })
    return response || []
  },

  createBudget: async (companyId: string, data: Partial<Budget>): Promise<Budget> => {
    const response = await apiService.post<{ data: Budget }>(`/api/budget-management/${companyId}/budgets`, data, {
      headers: getHeaders()
    })
    return response.data
  },

  updateBudget: async (companyId: string, budgetId: string, data: Partial<Budget>): Promise<Budget> => {
    const response = await apiService.put<{ data: Budget }>(`/api/budget-management/${companyId}/budgets/${budgetId}`, data, {
      headers: getHeaders()
    })
    return response.data
  },

  approveBudget: async (companyId: string, budgetId: string): Promise<Budget> => {
    const response = await apiService.post<{ data: Budget }>(`/api/budget-management/${companyId}/budgets/${budgetId}/approve`, {}, {
      headers: getHeaders()
    })
    return response.data
  },

  activateBudget: async (companyId: string, budgetId: string): Promise<Budget> => {
    const response = await apiService.post<{ data: Budget }>(`/api/budget-management/${companyId}/budgets/${budgetId}/activate`, {}, {
      headers: getHeaders()
    })
    return response.data
  },

  copyBudget: async (companyId: string, budgetId: string): Promise<Budget> => {
    const response = await apiService.post<{ data: Budget }>(`/api/budget-management/${companyId}/budgets/${budgetId}/copy`, {}, {
      headers: getHeaders()
    })
    return response.data
  },

  // Budget Line Items
  getBudgetLineItems: async (companyId: string, budgetId: string): Promise<any[]> => {
    const response = await apiService.get<{ data: any[] }>(`/api/budget-management/${companyId}/budgets/${budgetId}/line-items`, {
      headers: getHeaders()
    })
    return response.data || []
  },

  createBudgetLineItem: async (companyId: string, budgetId: string, data: any): Promise<any> => {
    const response = await apiService.post<{ data: any }>(`/api/budget-management/${companyId}/budgets/${budgetId}/line-items`, data, {
      headers: getHeaders()
    })
    return response.data
  },

  // Variances
  getVariances: async (companyId: string, budgetId: string): Promise<BudgetVariance[]> => {
    const response = await apiService.get<BudgetVariance[]>(`/api/budget-management/${companyId}/budgets/${budgetId}/variances`, {
      headers: getHeaders()
    })
    return response || []
  },

  // Rolling Forecasts
  getRollingForecasts: async (companyId: string): Promise<RollingForecast[]> => {
    const response = await apiService.get<RollingForecast[]>(`/api/budget-management/${companyId}/rolling-forecasts`, {
      headers: getHeaders()
    })
    return response || []
  },

  createRollingForecast: async (data: Partial<RollingForecast>): Promise<RollingForecast> => {
    const response = await apiService.post<RollingForecast>(`/api/budget-management/${data.companyId}/rolling-forecasts`, data, {
      headers: getHeaders()
    })
    return response
  },

  updateRollingForecast: async (id: string, data: Partial<RollingForecast>): Promise<RollingForecast> => {
    const response = await apiService.put<RollingForecast>(`/api/budget-management/${data.companyId}/rolling-forecasts/${id}`, data, {
      headers: getHeaders()
    })
    return response
  },

  deleteRollingForecast: async (id: string, companyId: string): Promise<void> => {
    await apiService.delete(`/api/budget-management/${companyId}/rolling-forecasts/${id}`, {
      headers: getHeaders()
    })
  },

  generateForecast: async (companyId: string, forecastId: string): Promise<any> => {
    const response = await apiService.post<{ data: any }>(`/api/budget-management/${companyId}/rolling-forecasts/${forecastId}/generate`, {}, {
      headers: getHeaders()
    })
    return response.data
  },

  // Performance Metrics
  getPerformanceMetrics: async (companyId: string, period?: string): Promise<PerformanceMetrics> => {
    const params = period ? `?period=${period}` : ''
    const response = await apiService.get<PerformanceMetrics>(`/api/budget-management/${companyId}/performance-metrics${params}`, {
      headers: getHeaders()
    })
    return response
  },

  // Reports
  getReports: async (companyId: string, reportType?: string): Promise<any> => {
    const params = reportType ? `?type=${reportType}` : ''
    const response = await apiService.get<{ data: any }>(`/api/budget-management/${companyId}/reports${params}`, {
      headers: getHeaders()
    })
    return response.data
  }
}

// Simple Budget API (from expenses)
export const simpleBudgetApi = {
  getBudgets: async (companyId?: string): Promise<any[]> => {
    const params = companyId ? `?companyId=${companyId}` : ''
    const response = await apiService.get<any[]>(`/api/budgets${params}`, {
      headers: getHeaders()
    })
    return response || []
  },

  createBudget: async (data: any): Promise<any> => {
    const response = await apiService.post<any>('/api/budgets', data, {
      headers: getHeaders()
    })
    return response
  },

  updateBudget: async (id: string, data: any): Promise<any> => {
    const response = await apiService.put<any>(`/api/budgets/${id}`, data, {
      headers: getHeaders()
    })
    return response
  },

  deleteBudget: async (id: string): Promise<void> => {
    await apiService.delete(`/api/budgets/${id}`, {
      headers: getHeaders()
    })
  },

  getBudgetAnalytics: async (companyId?: string): Promise<any> => {
    const activeCompanyId = companyId || getCompanyId()
    const params = activeCompanyId ? `?companyId=${activeCompanyId}` : ''
    const response = await apiService.get<any>(`/api/budgets/analytics${params}`, {
      headers: getHeaders()
    })
    return response
  },

  getBudgetAnalysis: async (companyId?: string, startDate?: string, endDate?: string): Promise<any> => {
    const searchParams = new URLSearchParams()
    if (companyId) searchParams.append('companyId', companyId)
    if (startDate) searchParams.append('startDate', startDate)
    if (endDate) searchParams.append('endDate', endDate)
    
    const params = searchParams.toString() ? `?${searchParams.toString()}` : ''
    const response = await apiService.get<any>(`/api/budget-analysis${params}`, {
      headers: getHeaders()
    })
    return response
  }
}
