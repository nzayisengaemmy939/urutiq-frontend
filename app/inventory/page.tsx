"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { PageLayout } from "@/components/page-layout"
import { useToast } from "@/hooks/use-toast"
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useDemoAuth } from "@/hooks/useDemoAuth"
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  BarChart3,
  MapPin,
  QrCode,
  Scan,
  RefreshCw,
  Download,
  Upload,
  Settings,
  Bell,
  ArrowRightLeft,
  Hash,
  Calendar,
  DollarSign,
  Users,
  Building2,
  Brain,
  Target,
  Zap,
  Lightbulb,
  Activity,
  PieChart,
  CheckCircle
} from "lucide-react"
import { inventoryApi, Product, Location, InventoryMovement, ReorderAlert, InventoryAnalytics, InventoryKPIs, DemandForecast, ForecastInsights, AIRecommendations } from '@/lib/api/inventory'
import BarcodeScanner from '@/components/barcode-scanner'
import InventoryAnalyticsComponent from '@/components/inventory-analytics'
import BulkOperations from '@/components/bulk-operations'
import InventoryOptimization from '@/components/inventory-optimization'
import DemandForecasting from '@/components/demand-forecasting'

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedLocation, setSelectedLocation] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedPeriod, setSelectedPeriod] = useState('30d')
  const [selectedForecastHorizon, setSelectedForecastHorizon] = useState('3m')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const queryClient = useQueryClient()
  
  // Setup demo authentication
  const { ready: authReady } = useDemoAuth('inventory')

  // Get company ID from localStorage or use default
  const getCompanyId = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('company_id') || localStorage.getItem('companyId') || 'seed-company-1'
    }
    return 'seed-company-1'
  }

  const companyId = getCompanyId()

  // Fetch products with enhanced filtering
  const productsQuery = useQuery({
    queryKey: ['products', searchTerm, selectedCategory, selectedLocation, selectedStatus, companyId],
    queryFn: async () => {
      const result = await inventoryApi.getProducts({
        companyId,
        q: searchTerm || undefined,
        category: selectedCategory || undefined,
        status: selectedStatus || undefined,
        locationId: selectedLocation || undefined,
        page: 1,
        pageSize: 50
      })
      return result
    },
    enabled: authReady
  })

  // Fetch locations
  const locationsQuery = useQuery({
    queryKey: ['locations', companyId],
    queryFn: async () => {
      return await inventoryApi.getLocations(companyId)
    },
    enabled: authReady
  })

  // Fetch movements
  const movementsQuery = useQuery({
    queryKey: ['movements', companyId],
    queryFn: async () => {
      const result = await inventoryApi.getMovements({
        companyId,
        page: 1,
        pageSize: 20
      })
      return result
    },
    enabled: authReady
  })

  // Fetch alerts
  const alertsQuery = useQuery({
    queryKey: ['alerts', companyId],
    queryFn: async () => {
      return await inventoryApi.getAlerts({ companyId })
    },
    enabled: authReady
  })

  // Fetch analytics
  const analyticsQuery = useQuery({
    queryKey: ['analytics', companyId, selectedPeriod],
    queryFn: async () => {
      return await inventoryApi.getAnalytics({
        companyId,
        period: selectedPeriod
      })
    },
    enabled: authReady
  })

  // Fetch KPIs
  const kpisQuery = useQuery({
    queryKey: ['kpis', companyId, selectedPeriod],
    queryFn: async () => {
      return await inventoryApi.getKPIs({
        companyId,
        period: selectedPeriod
      })
    },
    enabled: authReady
  })

  // Fetch AI forecasts
  const forecastsQuery = useQuery({
    queryKey: ['forecasts', companyId, selectedPeriod, selectedForecastHorizon],
    queryFn: async () => {
      return await inventoryApi.getForecasts({
        companyId,
        period: selectedPeriod,
        horizon: selectedForecastHorizon
      })
    },
    enabled: authReady
  })

  // Fetch AI insights
  const insightsQuery = useQuery({
    queryKey: ['insights', companyId, selectedPeriod],
    queryFn: async () => {
      return await inventoryApi.getForecastInsights({
        companyId,
        period: selectedPeriod
      })
    },
    enabled: authReady
  })

  // Fetch AI recommendations
  const recommendationsQuery = useQuery({
    queryKey: ['recommendations', companyId, selectedPeriod],
    queryFn: async () => {
      return await inventoryApi.getAIRecommendations({
        companyId,
        period: selectedPeriod
      })
    },
    enabled: authReady
  })

  const allProducts = productsQuery.data?.items || []
  const locations = locationsQuery.data || []
  const movements = movementsQuery.data?.items || []
  const alerts = alertsQuery.data || []
  const analytics = analyticsQuery.data
  const kpis = kpisQuery.data
  const forecasts = forecastsQuery.data || []
  const insights = insightsQuery.data
  const recommendations = recommendationsQuery.data
  
  // Calculate out of stock count
  const outOfStockCount = allProducts.filter(p => {
    const stock = typeof p.stockQuantity === 'string' ? parseFloat(p.stockQuantity) : p.stockQuantity
    return stock === 0
  }).length


  // Filter products based on search and filters
  const products = allProducts.filter(product => {
    const matchesSearch = !searchTerm || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
    const matchesLocation = selectedLocation === 'all' || 
      product.locations?.some(loc => loc.locationId === selectedLocation)
    const matchesStatus = selectedStatus === 'all' || product.status === selectedStatus
    
    return matchesSearch && matchesCategory && matchesLocation && matchesStatus
  })

  const getStatusBadge = (product: Product) => {
    if (product.stockQuantity <= 0) {
      return <Badge variant="destructive">Out of Stock</Badge>
    }
    if (product.reorderPoint && product.stockQuantity <= product.reorderPoint) {
      return <Badge variant="secondary">Low Stock</Badge>
    }
    if (product.maxStockLevel && product.stockQuantity >= product.maxStockLevel) {
      return <Badge variant="outline">Overstock</Badge>
    }
    return <Badge variant="default">In Stock</Badge>
  }

  const getAlertIcon = (alertType: string) => {
    switch (alertType) {
      case 'LOW_STOCK':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />
      case 'OUT_OF_STOCK':
        return <AlertTriangle className="w-4 h-4 text-red-600" />
      case 'OVERSTOCK':
        return <TrendingUp className="w-4 h-4 text-blue-600" />
      case 'EXPIRING_SOON':
        return <Calendar className="w-4 h-4 text-orange-600" />
      case 'EXPIRED':
        return <Calendar className="w-4 h-4 text-red-600" />
      default:
        return <Bell className="w-4 h-4 text-gray-600" />
    }
  }

  const getMovementIcon = (movementType: string) => {
    switch (movementType) {
      case 'INBOUND':
        return <TrendingUp className="w-4 h-4 text-green-600" />
      case 'OUTBOUND':
        return <TrendingUp className="w-4 h-4 text-red-600 rotate-180" />
      case 'TRANSFER_IN':
        return <ArrowRightLeft className="w-4 h-4 text-blue-600" />
      case 'TRANSFER_OUT':
        return <ArrowRightLeft className="w-4 h-4 text-blue-600 rotate-180" />
      case 'ADJUSTMENT_IN':
        return <Plus className="w-4 h-4 text-green-600" />
      case 'ADJUSTMENT_OUT':
        return <Plus className="w-4 h-4 text-red-600 rotate-45" />
      default:
        return <Package className="w-4 h-4 text-gray-600" />
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600'
      case 'medium': return 'text-yellow-600'
      case 'high': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'high': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'high': return <AlertTriangle className="w-4 h-4 text-red-600" />
      case 'medium': return <AlertTriangle className="w-4 h-4 text-yellow-600" />
      case 'low': return <CheckCircle className="w-4 h-4 text-green-600" />
      default: return <Package className="w-4 h-4 text-gray-600" />
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="w-4 h-4 text-green-600" />
      case 'decreasing': return <TrendingUp className="w-4 h-4 text-red-600 rotate-180" />
      case 'stable': return <BarChart3 className="w-4 h-4 text-blue-600" />
      default: return <BarChart3 className="w-4 h-4 text-gray-600" />
    }
  }

  return (
    <PageLayout>
      <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance"> Inventory Management</h1>
          <p className="text-muted-foreground">Advanced inventory tracking with multi-location support, serial numbers, and AI insights</p>
        </div>
        <div className="flex gap-2">
          <BarcodeScanner 
            onScan={(barcode) => {
              setSearchTerm(barcode)
              toast({
                title: "Barcode Scanned",
                description: `Searching for: ${barcode}`,
              })
            }}
            onProductFound={(product) => {
              toast({
                title: "Product Found",
                description: `${product.name} (${product.sku})`,
              })
            }}
          />
          <BulkOperations 
            onImport={(data) => {
              toast({
                title: "Import Successful",
                description: `Imported ${data.length} items`,
              })
              // Refresh queries
              queryClient.invalidateQueries({ queryKey: ['products'] })
            }}
            onExport={(format) => {
              toast({
                title: "Export Started",
                description: `Exporting data in ${format.toUpperCase()} format`,
              })
            }}
          />
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>


      {/* Analytics Overview */}
      {analytics ? (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Products</p>
                  <p className="text-xl font-bold">{analytics?.totalProducts || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Inventory Value</p>
                  <p className="text-xl font-bold">${(analytics?.totalValue || 0).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Low Stock Items</p>
                  <p className="text-xl font-bold">{alerts?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-red-600 font-semibold">0</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Out of Stock</p>
                  <p className="text-xl font-bold">{outOfStockCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Products</p>
                  <p className="text-xl font-bold">{allProducts.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Locations</p>
                  <p className="text-xl font-bold">{locations.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <ArrowRightLeft className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Movements</p>
                  <p className="text-xl font-bold">{movements.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Bell className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Alerts</p>
                  <p className="text-xl font-bold">{alerts.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* KPI Cards */}
      {kpis && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Turnover Rate</p>
                  <p className="text-xl font-bold">{kpis?.inventoryTurnover?.toFixed(1) || '0.0'}x</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg Days in Stock</p>
                  <p className="text-xl font-bold">{kpis?.averageDaysInStock?.toFixed(0) || '0'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Stockout Rate</p>
                  <p className="text-xl font-bold">{((kpis?.stockoutRate || 0) * 100).toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Overstock Rate</p>
                  <p className="text-xl font-bold">{((kpis?.overstockRate || 0) * 100).toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Accuracy Rate</p>
                  <p className="text-xl font-bold">{((kpis?.accuracyRate || 0) * 100).toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-cyan-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Carrying Cost</p>
                  <p className="text-xl font-bold">${kpis?.carryingCost?.toFixed(0) || '0'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="products" className="space-y-4">
        <TabsList className="grid w-full grid-cols-9">
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="locations">Locations</TabsTrigger>
          <TabsTrigger value="movements">Movements</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="transfers">Transfers</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="advanced-analytics">Advanced Analytics</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
          <TabsTrigger value="ai-forecasting">AI Forecasting</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Product Inventory</CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input 
                      placeholder="Search products..." 
                      className="pl-10 w-64" 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {Array.from(new Set(allProducts.map(p => p.category).filter(Boolean))).map(category => (
                        <SelectItem key={category} value={category!}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Locations</SelectItem>
                      {locations.map(location => (
                        <SelectItem key={location.id} value={location.id}>{location.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="INACTIVE">Inactive</SelectItem>
                      <SelectItem value="DISCONTINUED">Discontinued</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Package className="w-6 h-6 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {product.sku} • {product.category || 'Uncategorized'}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {product.trackSerialNumbers && (
                            <Badge variant="outline" className="text-xs">
                              <Hash className="w-3 h-3 mr-1" />
                              Serial
                            </Badge>
                          )}
                          {product.trackBatches && (
                            <Badge variant="outline" className="text-xs">
                              <Calendar className="w-3 h-3 mr-1" />
                              Batch
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {product.costingMethod}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="font-medium">{product.stockQuantity}</p>
                        <p className="text-xs text-muted-foreground">Total Stock</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium">{product.availableQuantity}</p>
                        <p className="text-xs text-muted-foreground">Available</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium">${product.unitPrice.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">Unit Price</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium">${(product.stockQuantity * product.costPrice).toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">Total Value</p>
                      </div>
                      {getStatusBadge(product)}
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <QrCode className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Locations Tab */}
        <TabsContent value="locations" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Warehouse Locations</CardTitle>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Location
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {locations.map((location) => (
                  <div
                    key={location.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-cyan-600" />
                      </div>
                      <div>
                        <p className="font-medium">{location.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {location.code} • {location.type} • {location.address}
                        </p>
                        {location.isDefault && (
                          <Badge variant="default" className="text-xs mt-1">Default</Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="font-medium">{location._count.products}</p>
                        <p className="text-sm text-muted-foreground">Products</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium">{location._count.movements}</p>
                        <p className="text-sm text-muted-foreground">Movements</p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Movements Tab */}
        <TabsContent value="movements" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Inventory Movements</CardTitle>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Movement
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {movements.map((movement) => (
                  <div
                    key={movement.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        {getMovementIcon(movement.movementType)}
                      </div>
                      <div>
                        <p className="font-medium">{movement.product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {movement.product.sku} • {movement.movementType.replace('_', ' ')}
                        </p>
                        {movement.reason && (
                          <p className="text-xs text-muted-foreground mt-1">{movement.reason}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className={`font-medium ${movement.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                        </p>
                        <p className="text-xs text-muted-foreground">Quantity</p>
                      </div>
                      {movement.unitCost && (
                        <div className="text-center">
                          <p className="font-medium">${movement.unitCost.toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">Unit Cost</p>
                        </div>
                      )}
                      <div className="text-center">
                        <p className="font-medium">{new Date(movement.movementDate).toLocaleDateString()}</p>
                        <p className="text-xs text-muted-foreground">Date</p>
                      </div>
                      {movement.location && (
                        <div className="text-center">
                          <p className="font-medium">{movement.location.name}</p>
                          <p className="text-xs text-muted-foreground">Location</p>
                        </div>
                      )}
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Reorder Alerts</CardTitle>
                <Button variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  Alert Settings
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        {getAlertIcon(alert.alertType)}
                      </div>
                      <div>
                        <p className="font-medium">{alert.product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {alert.product.sku} • {alert.alertType.replace('_', ' ')}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Current: {alert.product.stockQuantity} • Threshold: {alert.threshold}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge 
                        variant={
                          alert.status === 'PENDING' ? 'destructive' :
                          alert.status === 'ACKNOWLEDGED' ? 'secondary' :
                          'default'
                        }
                      >
                        {alert.status}
                      </Badge>
                      {alert.location && (
                        <div className="text-center">
                          <p className="font-medium">{alert.location.name}</p>
                          <p className="text-xs text-muted-foreground">Location</p>
                        </div>
                      )}
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transfers Tab */}
        <TabsContent value="transfers" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Inventory Transfers</CardTitle>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Transfer
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <ArrowRightLeft className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No transfers found</p>
                <p className="text-sm">Create your first inventory transfer between locations</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Top Products by Value
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(analytics?.topProducts || []).slice(0, 5).map((product, index) => (
                    <div key={product.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">{product.sku}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${(product.stockQuantity * product.costPrice).toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">{product.stockQuantity} units</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Category Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(analytics?.categoryBreakdown || []).map((category) => (
                    <div key={category.category} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{category.category || 'Uncategorized'}</p>
                        <p className="text-sm text-muted-foreground">{category._count.category} products</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{category._sum.stockQuantity || 0}</p>
                        <p className="text-sm text-muted-foreground">units</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Advanced Analytics Tab */}
        <TabsContent value="advanced-analytics" className="space-y-4">
          <InventoryAnalyticsComponent
            products={allProducts}
            movements={movements}
            locations={locations}
            alerts={alerts}
            analytics={analytics}
            kpis={kpis}
            onRefresh={() => {
              queryClient.invalidateQueries({ queryKey: ['products'] })
              queryClient.invalidateQueries({ queryKey: ['movements'] })
              queryClient.invalidateQueries({ queryKey: ['analytics'] })
            }}
          />
        </TabsContent>

        {/* Optimization Tab */}
        <TabsContent value="optimization" className="space-y-4">
          <InventoryOptimization
            products={allProducts}
            movements={movements}
            locations={locations}
            alerts={alerts}
            analytics={analytics}
            kpis={kpis}
            onApplyRecommendation={(recommendation) => {
              toast({
                title: "Recommendation Applied",
                description: recommendation.title,
              })
            }}
            onRefresh={() => {
              queryClient.invalidateQueries({ queryKey: ['products'] })
              queryClient.invalidateQueries({ queryKey: ['analytics'] })
              queryClient.invalidateQueries({ queryKey: ['kpis'] })
            }}
          />
        </TabsContent>

        {/* AI Forecasting Tab */}
        <TabsContent value="ai-forecasting" className="space-y-4">
          <DemandForecasting
            forecasts={forecasts}
            insights={insights}
            recommendations={recommendations}
            products={allProducts}
            onRefresh={() => {
              queryClient.invalidateQueries({ queryKey: ['forecasts'] })
              queryClient.invalidateQueries({ queryKey: ['insights'] })
              queryClient.invalidateQueries({ queryKey: ['recommendations'] })
            }}
          />
        </TabsContent>
      </Tabs>
      </div>
    </PageLayout>
  )
}