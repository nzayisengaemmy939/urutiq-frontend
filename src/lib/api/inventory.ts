// Enhanced Inventory API service for comprehensive inventory management
import { apiService } from '../api'
import { Category } from './categories'

// Enhanced Product interface with comprehensive features
export interface Product {
  // Core Product Information
  id: string
  name: string
  sku: string
  description?: string
  shortDescription?: string
  type: 'PRODUCT' | 'SERVICE' | 'DIGITAL' | 'BUNDLE'
  
  // Pricing Information
  unitPrice: number
  costPrice: number
  
  // Stock & Inventory Management
  stockQuantity: number
  reservedQuantity: number
  availableQuantity: number
  minStockLevel?: number
  maxStockLevel?: number
  reorderPoint?: number
  reorderQuantity?: number
  
  // Classification & Organization
  category?: string
  categoryId?: string
  categoryObject?: Category
  brand?: string
  model?: string
  tags?: string
  
  // Physical Properties
  weight?: number
  dimensions?: string | {
    length: number
    width: number
    height: number
  }
  
  // Identification & Tracking
  barcode?: string
  qrCode?: string
  trackSerialNumbers?: boolean
  trackBatches?: boolean
  costingMethod?: 'FIFO' | 'LIFO' | 'WEIGHTED_AVERAGE' | 'SPECIFIC_IDENTIFICATION'
  
  // Tax Information
  taxRate?: number
  taxInclusive?: boolean
  taxCode?: string
  taxExempt?: boolean
  
  // Product Type Flags
  isDigital?: boolean
  isService?: boolean
  isPhysical?: boolean
  trackInventory?: boolean
  
  // Business Rules & Options
  allowBackorder?: boolean
  allowPreorder?: boolean
  preorderDate?: string
  
  // Product Features & Marketing
  isFeatured?: boolean
  isBestSeller?: boolean
  isNewArrival?: boolean
  
  // Warranty & Returns
  warrantyPeriod?: number
  warrantyUnit?: 'DAYS' | 'WEEKS' | 'MONTHS' | 'YEARS'
  returnPolicy?: string
  
  // Shipping & Fulfillment
  shippingClass?: string
  
  // SEO & Marketing
  seoTitle?: string
  seoDescription?: string
  metaKeywords?: string
  
  // Media & Variants
  images?: string[]
  variants?: ProductVariant[]
  
  // Related Products & Cross-selling
  relatedProducts?: string[]
  upsellProducts?: string[]
  crossSellProducts?: string[]
  
  // Custom Fields & Extensions
  customFields?: Record<string, any>
  
  // System Fields
  status: 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED' | 'DRAFT'
  companyId: string
  tenantId?: string
  createdAt: string
  updatedAt: string
  
  // Relations
  locations?: ProductLocation[]
  movements?: InventoryMovement[]
  _count?: {
    movements: number
    serialNumbers: number
    batches: number
  }
}

// Product Variant Interface for different product options
export interface ProductVariant {
  id?: string
  productId?: string
  name: string
  sku?: string
  unitPrice?: number
  costPrice?: number
  stockQuantity?: number
  weight?: number
  dimensions?: string
  barcode?: string
  attributes: Record<string, string> // e.g., { color: 'red', size: 'M' }
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface ProductLocation {
  id: string
  productId: string
  locationId: string
  stockQuantity: number
  reservedQuantity: number
  availableQuantity: number
  reorderPoint?: number
  maxStockLevel?: number
  binLocation?: string
  createdAt: string
  updatedAt: string
  location: {
    id: string
    name: string
    code: string
  }
}

export interface Location {
  id: string
  name: string
  code: string
  type: 'WAREHOUSE' | 'STORE' | 'OFFICE' | 'VEHICLE' | 'CUSTOMER_LOCATION'
  address?: string
  isActive: boolean
  isDefault: boolean
  contactName?: string
  phone?: string
  email?: string
  companyId: string
  tenantId?: string
  createdAt: string
  updatedAt: string
  _count: {
    products: number
    movements: number
  }
}

export interface InventoryMovement {
  id: string
  productId: string
  locationId?: string
  movementType: 'INBOUND' | 'OUTBOUND' | 'TRANSFER_IN' | 'TRANSFER_OUT' | 'ADJUSTMENT_IN' | 'ADJUSTMENT_OUT' | 'RETURN_IN' | 'RETURN_OUT' | 'DAMAGE' | 'THEFT' | 'CYCLE_COUNT'
  quantity: number
  unitCost?: number
  totalCost?: number
  reference?: string
  referenceType?: string
  referenceId?: string
  serialNumbers?: string
  batchNumber?: string
  batchId?: string
  movementDate: string
  reason?: string
  notes?: string
  performedBy?: string
  createdAt: string
  product: {
    id: string
    name: string
    sku: string
  }
  location?: {
    id: string
    name: string
    code: string
  }
  user?: {
    id: string
    name: string
    email: string
  }
}

export interface SerialNumber {
  id: string
  productId: string
  serialNumber: string
  status: 'AVAILABLE' | 'RESERVED' | 'SOLD' | 'DAMAGED' | 'RETURNED'
  purchaseDate?: string
  purchaseCost?: number
  supplier?: string
  saleDate?: string
  salePrice?: number
  customerId?: string
  warrantyStart?: string
  warrantyEnd?: string
  currentLocation?: string
  notes?: string
  createdAt: string
  updatedAt: string
  product: {
    id: string
    name: string
    sku: string
  }
  customer?: {
    id: string
    name: string
  }
}

export interface ProductBatch {
  id: string
  productId: string
  batchNumber: string
  quantity: number
  manufactureDate?: string
  expirationDate?: string
  supplier?: string
  unitCost?: number
  totalCost?: number
  status: 'ACTIVE' | 'EXPIRED' | 'DAMAGED' | 'QUARANTINED'
  locationId?: string
  qualityNotes?: string
  testedBy?: string
  testDate?: string
  createdAt: string
  updatedAt: string
  product: {
    id: string
    name: string
    sku: string
  }
  location?: {
    id: string
    name: string
    code: string
  }
}

export interface AlertSettings {
  id?: string
  tenantId?: string
  lowStockThreshold: number
  overstockThreshold: number
  criticalStockThreshold: number
  emailNotifications: boolean
  smsNotifications: boolean
  dashboardAlerts: boolean
  autoAcknowledgeDays: number
  dailyDigestTime: string
  weeklySummaryDay: string
  weeklySummaryTime: string
  immediateAlerts: boolean
  immediateAlertsCriticalOnly: boolean
  createdAt?: string
  updatedAt?: string
}

export interface InventoryTransfer {
  id: string
  tenantId: string
  productId: string
  fromLocationId?: string
  toLocationId: string
  quantity: number
  transferDate: string
  status: 'PENDING' | 'IN_TRANSIT' | 'COMPLETED' | 'CANCELLED'
  reference?: string
  notes?: string
  requestedBy?: string
  approvedBy?: string
  completedBy?: string
  completedAt?: string
  createdAt: string
  updatedAt: string
  product: {
    id: string
    name: string
    sku: string
    stockQuantity: number
  }
  fromLocation?: {
    id: string
    name: string
    code: string
  }
  toLocation: {
    id: string
    name: string
    code: string
  }
}

export interface ReorderAlert {
  id: string
  companyId: string
  productId: string
  locationId?: string
  alertType: 'LOW_STOCK' | 'OUT_OF_STOCK' | 'OVERSTOCK' | 'EXPIRING_SOON' | 'EXPIRED'
  threshold: number
  isActive: boolean
  status: 'PENDING' | 'ACKNOWLEDGED' | 'RESOLVED' | 'DISMISSED'
  triggeredAt?: string
  acknowledgedAt?: string
  acknowledgedBy?: string
  autoReorder: boolean
  reorderQuantity?: number
  supplierId?: string
  message?: string
  createdAt: string
  updatedAt: string
  product: {
    id: string
    name: string
    sku: string
    stockQuantity: number
  }
  location?: {
    id: string
    name: string
    code: string
  }
  supplier?: {
    id: string
    name: string
  }
  acknowledgedByUser?: {
    id: string
    name: string
  }
}


export interface InventoryTransferLine {
  id: string
  transferId: string
  productId: string
  quantity: number
  unitCost?: number
  serialNumbers?: string
  batchNumber?: string
  status: 'PENDING' | 'IN_TRANSIT' | 'COMPLETED' | 'CANCELLED'
  transfer: InventoryTransfer
  product: {
    id: string
    name: string
    sku: string
  }
}

export interface InventoryAnalytics {
  totalProducts: number
  totalValue: number
  lowStockItems: number
  outOfStockItems: number
  topProducts: Array<{
    id: string
    name: string
    sku: string
    stockQuantity: number
    costPrice: number
  }>
  categoryBreakdown: Array<{
    category: string
    _count: { category: number }
    _sum: { stockQuantity: number }
  }>
  monthlyTrends: Array<{
    movementType: string
    totalQuantity: number
  }>
}

export interface InventoryKPIs {
  inventoryTurnover: number
  averageDaysInStock: number
  stockoutRate: number
  overstockRate: number
  accuracyRate: number
  carryingCost: number
}

export interface DemandForecast {
  productId: string
  productName: string
  sku: string
  currentStock: number
  forecastedDemand: Array<{
    period: string
    predictedDemand: number
    confidence: number
    seasonality: number
    trend: 'increasing' | 'decreasing' | 'stable'
  }>
  recommendations: {
    suggestedReorderQuantity: number
    suggestedReorderDate: string
    riskLevel: 'low' | 'medium' | 'high'
    reasoning: string
  }
  historicalData: Array<{
    period: string
    actualDemand: number
    forecastedDemand: number
    accuracy: number
  }>
}

export interface ForecastInsights {
  overallAccuracy: number
  demandTrend: number
  seasonalTrends: Array<{
    month: string
    demand: number
    trend: string
  }>
  topPerformingProducts: Array<{
    productId: string
    productName: string
    category: string | null
    totalMovements: number
    stockLevel: number
  }>
  riskAlerts: Array<{
    productId: string
    productName: string
    riskLevel: string
    message: string
  }>
  totalProducts: number
  totalMovements: number
  avgDailyDemand: number
}

export interface AIRecommendations {
  reorderSuggestions: Array<{
    productId: string
    productName: string
    currentStock: number
    suggestedQuantity: number
    urgency: 'low' | 'medium' | 'high'
    reasoning: string
  }>
  pricingOptimizations: Array<{
    productId: string
    productName: string
    currentPrice: number
    suggestedPrice: number
    expectedImpact: string
  }>
  inventoryOptimizations: Array<{
    category: string
    currentValue: number
    suggestedValue: number
    optimization: string
  }>
}

export interface PaginationInfo {
  page: number
  pageSize: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

import { config, getCompanyId, getTenantId } from '../config'

// Default company ID for demo purposes
const DEFAULT_COMPANY_ID = config.demo.companyId

// Helper function to get API headers
const getHeaders = () => {
  const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
    'x-tenant-id': getTenantId(),
    'x-company-id': getCompanyId()
  }
}

// Enhanced Inventory API
export const inventoryApi = {
  // Products
  getProducts: async (params?: {
    companyId?: string
    page?: number
    pageSize?: number
    q?: string
    category?: string
    status?: string
    locationId?: string
  }): Promise<{ items: Product[], pagination: PaginationInfo }> => {
    const queryParams = new URLSearchParams()
    if (params?.companyId || DEFAULT_COMPANY_ID) {
      queryParams.append('companyId', params?.companyId || DEFAULT_COMPANY_ID)
    }
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString())
    if (params?.q) queryParams.append('q', params.q)
    if (params?.category) queryParams.append('category', params.category)
    if (params?.status) queryParams.append('status', params.status)
    if (params?.locationId) queryParams.append('locationId', params.locationId)

    return await apiService.get<{ items: Product[], pagination: PaginationInfo }>(`/api/products?${queryParams.toString()}`, {
      headers: getHeaders()
    })
  },

  getProduct: async (id: string): Promise<Product> => {
    return await apiService.get<Product>(`/api/products/${id}`, {
      headers: getHeaders()
    })
  },

  createProduct: async (data: Partial<Product>): Promise<Product> => {
    return await apiService.post<Product>('/api/products', {
      ...data,
      companyId: data.companyId || DEFAULT_COMPANY_ID
    }, {
      headers: getHeaders()
    })
  },

  updateProduct: async (id: string, data: Partial<Product>): Promise<Product> => {
    return await apiService.put<Product>(`/api/products/${id}`, data, {
      headers: getHeaders()
    })
  },

  deleteProduct: async (id: string): Promise<void> => {
    await apiService.delete<void>(`/api/products/${id}`, {
      headers: getHeaders()
    })
  },

  // Locations
  getLocations: async (companyId?: string): Promise<Location[]> => {
    const params = new URLSearchParams()
    if (companyId || DEFAULT_COMPANY_ID) {
      params.append('companyId', companyId || DEFAULT_COMPANY_ID)
    }

    return await apiService.get<Location[]>(`/api/locations?${params.toString()}`, {
      headers: getHeaders()
    })
  },

  createLocation: async (data: Partial<Location>): Promise<Location> => {
    return await apiService.post<Location>('/api/locations', {
      ...data,
      companyId: data.companyId || DEFAULT_COMPANY_ID
    }, {
      headers: getHeaders()
    })
  },

  updateLocation: async (id: string, data: Partial<Location>): Promise<Location> => {
    return await apiService.put<Location>(`/api/locations/${id}`, data, {
      headers: getHeaders()
    })
  },

  deleteLocation: async (id: string): Promise<void> => {
    await apiService.delete<void>(`/api/locations/${id}`, {
      headers: getHeaders()
    })
  },

  // Inventory Movements
  getMovements: async (params?: {
    companyId?: string
    productId?: string
    locationId?: string
    movementType?: string
    page?: number
    pageSize?: number
  }): Promise<{ items: InventoryMovement[], pagination: PaginationInfo }> => {
    const queryParams = new URLSearchParams()
    if (params?.companyId || DEFAULT_COMPANY_ID) {
      queryParams.append('companyId', params?.companyId || DEFAULT_COMPANY_ID)
    }
    if (params?.productId) queryParams.append('productId', params.productId)
    if (params?.locationId) queryParams.append('locationId', params.locationId)
    if (params?.movementType) queryParams.append('movementType', params.movementType)
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString())

    return await apiService.get<{ items: InventoryMovement[], pagination: PaginationInfo }>(`/api/movements?${queryParams.toString()}`, {
      headers: getHeaders()
    })
  },

  createMovement: async (data: Partial<InventoryMovement>): Promise<{ movement: InventoryMovement, newStockQuantity: number }> => {
    return await apiService.post<{ movement: InventoryMovement, newStockQuantity: number }>('/api/inventory-movements', data, {
      headers: getHeaders()
    })
  },

  // Product-Location management
  createProductLocation: async (data: { productId: string, locationId: string, quantity?: number, reorderPoint?: number, maxQuantity?: number }): Promise<any> => {
    return await apiService.post<any>('/api/product-locations', data, {
      headers: getHeaders()
    })
  },

  getProductLocations: async (params?: { companyId?: string, locationId?: string, productId?: string }): Promise<any[]> => {
    const queryParams = new URLSearchParams()
    if (params?.companyId) queryParams.append('companyId', params.companyId)
    if (params?.locationId) queryParams.append('locationId', params.locationId)
    if (params?.productId) queryParams.append('productId', params.productId)

    return await apiService.get<any[]>(`/api/product-locations?${queryParams.toString()}`, {
      headers: getHeaders()
    })
  },

  deleteProductLocation: async (id: string): Promise<void> => {
    return await apiService.delete<void>(`/api/product-locations/${id}`, {
      headers: getHeaders()
    })
  },

  // Inventory Transfers
  getTransfers: async (params?: {
    companyId?: string
    status?: string
    page?: number
    pageSize?: number
  }): Promise<{ items: InventoryTransfer[], pagination: PaginationInfo }> => {
    const queryParams = new URLSearchParams()
    if (params?.companyId || DEFAULT_COMPANY_ID) {
      queryParams.append('companyId', params?.companyId || DEFAULT_COMPANY_ID)
    }
    if (params?.status) queryParams.append('status', params.status)
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString())

    return await apiService.get<{ items: InventoryTransfer[], pagination: PaginationInfo }>(`/transfers?${queryParams.toString()}`, {
      headers: getHeaders()
    })
  },

  createTransfer: async (data: Partial<InventoryTransfer>): Promise<{ transfer: InventoryTransfer, lines: InventoryTransferLine[] }> => {
    return await apiService.post<{ transfer: InventoryTransfer, lines: InventoryTransferLine[] }>('/api/transfers', {
      ...data,
      companyId: data.companyId || DEFAULT_COMPANY_ID
    }, {
      headers: getHeaders()
    })
  },

  // Reorder Alerts
  getAlerts: async (params?: {
    companyId?: string
    status?: string
  }): Promise<ReorderAlert[]> => {
    const queryParams = new URLSearchParams()
    if (params?.companyId || DEFAULT_COMPANY_ID) {
      queryParams.append('companyId', params?.companyId || DEFAULT_COMPANY_ID)
    }
    if (params?.status) queryParams.append('status', params.status)

    return await apiService.get<ReorderAlert[]>(`/api/alerts?${queryParams.toString()}`, {
      headers: getHeaders()
    })
  },

  generateAlerts: async (companyId: string): Promise<{ message: string, alerts: any[] }> => {
    return await apiService.post<{ message: string, alerts: any[] }>(`/api/alerts/generate?companyId=${companyId}`, {}, {
      headers: getHeaders()
    })
  },

  acknowledgeAlert: async (alertId: string): Promise<any> => {
    return await apiService.post<any>(`/api/alerts/${alertId}/acknowledge`, {}, {
      headers: getHeaders()
    })
  },

  dismissAlert: async (alertId: string): Promise<any> => {
    return await apiService.post<any>(`/api/alerts/${alertId}/dismiss`, {}, {
      headers: getHeaders()
    })
  },

  // Alert Settings
  getAlertSettings: async (): Promise<AlertSettings> => {
    return await apiService.get<AlertSettings>('/api/alerts/settings', {
      headers: getHeaders()
    })
  },

  updateAlertSettings: async (settings: Partial<AlertSettings>): Promise<AlertSettings> => {
    return await apiService.post<AlertSettings>('/api/alerts/settings', settings, {
      headers: getHeaders()
    })
  },

  // Inventory Transfers
  

  

  updateTransferStatus: async (transferId: string, status: string, completedBy?: string): Promise<InventoryTransfer> => {
    return await apiService.post<InventoryTransfer>(`/api/transfers/${transferId}/status`, {
      status,
      completedBy
    }, {
      headers: getHeaders()
    })
  },

  // Analytics
  getAnalytics: async (params?: {
    companyId?: string
    period?: string
    location?: string
  }): Promise<InventoryAnalytics> => {
    const queryParams = new URLSearchParams()
    const companyId = params?.companyId || getCompanyId()
    if (companyId) {
      queryParams.append('companyId', companyId)
    }
    if (params?.period) queryParams.append('period', params.period)
    if (params?.location) queryParams.append('location', params.location)

    return await apiService.get<InventoryAnalytics>(`/api/analytics?${queryParams.toString()}`, {
      headers: getHeaders()
    })
  },

  getKPIs: async (params?: {
    companyId?: string
    period?: string
    location?: string
  }): Promise<InventoryKPIs> => {
    const queryParams = new URLSearchParams()
    const companyId = params?.companyId || getCompanyId()
    if (companyId) {
      queryParams.append('companyId', companyId)
    }
    if (params?.period) queryParams.append('period', params.period)
    if (params?.location) queryParams.append('location', params.location)

    return await apiService.get<InventoryKPIs>(`/api/kpis?${queryParams.toString()}`, {
      headers: getHeaders()
    })
  },

  // Serial Numbers
  getSerialNumbers: async (productId: string, params?: {
    status?: string
  }): Promise<SerialNumber[]> => {
    const queryParams = new URLSearchParams()
    if (params?.status) queryParams.append('status', params.status)

    return await apiService.get<SerialNumber[]>(`/api/products/${productId}/serial-numbers?${queryParams.toString()}`, {
      headers: getHeaders()
    })
  },

  // Batches
  getBatches: async (productId: string, params?: {
    status?: string
  }): Promise<ProductBatch[]> => {
    const queryParams = new URLSearchParams()
    if (params?.status) queryParams.append('status', params.status)

    return await apiService.get<ProductBatch[]>(`/api/products/${productId}/batches?${queryParams.toString()}`, {
      headers: getHeaders()
    })
  },

  // AI Forecasting
  getForecasts: async (params?: {
    companyId?: string
    period?: string
    category?: string
    location?: string
    horizon?: string
  }): Promise<DemandForecast[]> => {
    const queryParams = new URLSearchParams()
    if (params?.companyId || DEFAULT_COMPANY_ID) {
      queryParams.append('companyId', params?.companyId || DEFAULT_COMPANY_ID)
    }
    if (params?.period) queryParams.append('period', params.period)
    if (params?.category) queryParams.append('category', params.category)
    if (params?.location) queryParams.append('location', params.location)
    if (params?.horizon) queryParams.append('horizon', params.horizon)

    return await apiService.get<DemandForecast[]>(`/api/forecasts?${queryParams.toString()}`, {
      headers: getHeaders()
    })
  },

  getForecastInsights: async (params?: {
    companyId?: string
    period?: string
    category?: string
    location?: string
  }): Promise<ForecastInsights> => {
    const queryParams = new URLSearchParams()
    if (params?.companyId || DEFAULT_COMPANY_ID) {
      queryParams.append('companyId', params?.companyId || DEFAULT_COMPANY_ID)
    }
    if (params?.period) queryParams.append('period', params.period)
    if (params?.category) queryParams.append('category', params.category)
    if (params?.location) queryParams.append('location', params.location)

    const url = `/api/forecast-insights?${queryParams.toString()}`
    console.log('Calling forecast insights API:', url, 'with headers:', getHeaders())
    
    const result = await apiService.get<ForecastInsights>(url, {
      headers: getHeaders()
    })
    
    console.log('Forecast insights API response:', result)
    return result
  },

  getAIRecommendations: async (params?: {
    companyId?: string
    period?: string
    category?: string
    location?: string
  }): Promise<AIRecommendations> => {
    const queryParams = new URLSearchParams()
    if (params?.companyId || DEFAULT_COMPANY_ID) {
      queryParams.append('companyId', params?.companyId || DEFAULT_COMPANY_ID)
    }
    if (params?.period) queryParams.append('period', params.period)
    if (params?.category) queryParams.append('category', params.category)
    if (params?.location) queryParams.append('location', params.location)

    return await apiService.get<AIRecommendations>(`/api/ai-recommendations?${queryParams.toString()}`, {
      headers: getHeaders()
    })
  }
}

export default inventoryApi
