// Enhanced Inventory API service for comprehensive inventory management
import { apiService } from '../api'

// Enhanced Product interface with competitive features
export interface Product {
  id: string
  name: string
  sku: string
  description?: string
  type: 'PRODUCT' | 'SERVICE' | 'BUNDLE'
  unitPrice: number
  costPrice: number
  stockQuantity: number
  reservedQuantity: number
  availableQuantity: number
  category?: string
  brand?: string
  model?: string
  weight?: number
  dimensions?: string
  barcode?: string
  qrCode?: string
  trackSerialNumbers: boolean
  trackBatches: boolean
  costingMethod: 'FIFO' | 'LIFO' | 'WEIGHTED_AVERAGE' | 'SPECIFIC_IDENTIFICATION'
  reorderPoint?: number
  reorderQuantity?: number
  maxStockLevel?: number
  status: 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED'
  taxCode?: string
  taxExempt: boolean
  companyId: string
  tenantId?: string
  createdAt: string
  updatedAt: string
  locations: ProductLocation[]
  movements: InventoryMovement[]
  _count: {
    movements: number
    serialNumbers: number
    batches: number
  }
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

export interface InventoryTransfer {
  id: string
  companyId: string
  transferNumber: string
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'IN_TRANSIT' | 'COMPLETED' | 'CANCELLED'
  fromLocationId: string
  toLocationId: string
  transferDate: string
  reason?: string
  notes?: string
  requestedBy?: string
  approvedBy?: string
  completedBy?: string
  requestedAt: string
  approvedAt?: string
  completedAt?: string
  company: {
    id: string
    name: string
  }
  fromLocation: {
    id: string
    name: string
    code: string
  }
  toLocation: {
    id: string
    name: string
    code: string
  }
  lines: InventoryTransferLine[]
  requestedByUser?: {
    id: string
    name: string
  }
  approvedByUser?: {
    id: string
    name: string
  }
  completedByUser?: {
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
  averageCost: number
  lowStockCount: number
  outOfStockCount: number
  recentMovements: number
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
  turnoverAnalysis: Array<{
    productId: string
    productName: string
    sku: string
    turnoverRate: number
    daysInStock: number
  }>
  locationAnalysis: Array<{
    locationId: string
    locationName: string
    productCount: number
    totalValue: number
    utilizationRate: number
  }>
  monthlyTrends: Array<{
    month: string
    inbound: number
    outbound: number
    netChange: number
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
  topPerformingProducts: Array<{
    productId: string
    productName: string
    accuracy: number
  }>
  seasonalTrends: Array<{
    month: string
    averageDemand: number
    seasonalityFactor: number
  }>
  riskAlerts: Array<{
    productId: string
    productName: string
    riskType: 'stockout' | 'overstock' | 'seasonal_spike'
    severity: 'low' | 'medium' | 'high'
    description: string
  }>
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
const DEFAULT_TENANT_ID = config.demo.tenantId

// Helper function to get API headers
const getHeaders = () => {
  return {
    'Content-Type': 'application/json',
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

    return await apiService.get<{ items: Product[], pagination: PaginationInfo }>(`/products?${queryParams.toString()}`, {
      headers: getHeaders()
    })
  },

  getProduct: async (id: string): Promise<Product> => {
    return await apiService.get<Product>(`/products/${id}`, {
      headers: getHeaders()
    })
  },

  createProduct: async (data: Partial<Product>): Promise<Product> => {
    return await apiService.post<Product>('/products', {
      ...data,
      companyId: data.companyId || DEFAULT_COMPANY_ID
    }, {
      headers: getHeaders()
    })
  },

  updateProduct: async (id: string, data: Partial<Product>): Promise<Product> => {
    return await apiService.put<Product>(`/products/${id}`, data, {
      headers: getHeaders()
    })
  },

  deleteProduct: async (id: string): Promise<void> => {
    await apiService.delete<void>(`/products/${id}`, {
      headers: getHeaders()
    })
  },

  // Product Status Management
  activateProduct: async (id: string): Promise<Product> => {
    return await apiService.post<Product>(`/products/${id}/activate`, {}, {
      headers: getHeaders()
    })
  },

  deactivateProduct: async (id: string): Promise<Product> => {
    return await apiService.post<Product>(`/products/${id}/deactivate`, {}, {
      headers: getHeaders()
    })
  },

  updateProductStatus: async (id: string, status: 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED'): Promise<Product> => {
    return await apiService.put<Product>(`/products/${id}/status`, { status }, {
      headers: getHeaders()
    })
  },

  // Locations
  getLocations: async (companyId?: string): Promise<Location[]> => {
    const params = new URLSearchParams()
    if (companyId || DEFAULT_COMPANY_ID) {
      params.append('companyId', companyId || DEFAULT_COMPANY_ID)
    }

    return await apiService.get<Location[]>(`/locations?${params.toString()}`, {
      headers: getHeaders()
    })
  },

  createLocation: async (data: Partial<Location>): Promise<Location> => {
    return await apiService.post<Location>('/locations', {
      ...data,
      companyId: data.companyId || DEFAULT_COMPANY_ID
    }, {
      headers: getHeaders()
    })
  },

  updateLocation: async (id: string, data: Partial<Location>): Promise<Location> => {
    return await apiService.put<Location>(`/locations/${id}`, data, {
      headers: getHeaders()
    })
  },

  deleteLocation: async (id: string): Promise<void> => {
    await apiService.delete<void>(`/locations/${id}`, {
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

    return await apiService.get<{ items: InventoryMovement[], pagination: PaginationInfo }>(`/movements?${queryParams.toString()}`, {
      headers: getHeaders()
    })
  },

  createMovement: async (data: Partial<InventoryMovement>): Promise<{ movement: InventoryMovement, newStockQuantity: number }> => {
    return await apiService.post<{ movement: InventoryMovement, newStockQuantity: number }>('/movements', data, {
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
    return await apiService.post<{ transfer: InventoryTransfer, lines: InventoryTransferLine[] }>('/transfers', {
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

    return await apiService.get<ReorderAlert[]>(`/alerts?${queryParams.toString()}`, {
      headers: getHeaders()
    })
  },

  acknowledgeAlert: async (id: string): Promise<ReorderAlert> => {
    return await apiService.post<ReorderAlert>(`/alerts/${id}/acknowledge`, {}, {
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
    if (params?.companyId || DEFAULT_COMPANY_ID) {
      queryParams.append('companyId', params?.companyId || DEFAULT_COMPANY_ID)
    }
    if (params?.period) queryParams.append('period', params.period)
    if (params?.location) queryParams.append('location', params.location)

    return await apiService.get<InventoryAnalytics>(`/analytics?${queryParams.toString()}`, {
      headers: getHeaders()
    })
  },

  getKPIs: async (params?: {
    companyId?: string
    period?: string
    location?: string
  }): Promise<InventoryKPIs> => {
    const queryParams = new URLSearchParams()
    if (params?.companyId || DEFAULT_COMPANY_ID) {
      queryParams.append('companyId', params?.companyId || DEFAULT_COMPANY_ID)
    }
    if (params?.period) queryParams.append('period', params.period)
    if (params?.location) queryParams.append('location', params.location)

    return await apiService.get<InventoryKPIs>(`/kpis?${queryParams.toString()}`, {
      headers: getHeaders()
    })
  },

  // Serial Numbers
  getSerialNumbers: async (productId: string, params?: {
    status?: string
  }): Promise<SerialNumber[]> => {
    const queryParams = new URLSearchParams()
    if (params?.status) queryParams.append('status', params.status)

    return await apiService.get<SerialNumber[]>(`/products/${productId}/serial-numbers?${queryParams.toString()}`, {
      headers: getHeaders()
    })
  },

  // Batches
  getBatches: async (productId: string, params?: {
    status?: string
  }): Promise<ProductBatch[]> => {
    const queryParams = new URLSearchParams()
    if (params?.status) queryParams.append('status', params.status)

    return await apiService.get<ProductBatch[]>(`/products/${productId}/batches?${queryParams.toString()}`, {
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

    return await apiService.get<DemandForecast[]>(`/ai/forecast?${queryParams.toString()}`, {
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

    return await apiService.get<ForecastInsights>(`/ai/insights?${queryParams.toString()}`, {
      headers: getHeaders()
    })
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

    return await apiService.get<AIRecommendations>(`/ai/recommendations?${queryParams.toString()}`, {
      headers: getHeaders()
    })
  }
}

export default inventoryApi
