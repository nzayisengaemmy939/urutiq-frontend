import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Badge } from "../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog"
import { Label } from "../components/ui/label"
import { Textarea } from "../components/ui/textarea"
import { useToast } from "../hooks/use-toast"
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
  Building2
} from "lucide-react"

interface Product {
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
  barcode?: string
  trackSerialNumbers: boolean
  trackBatches: boolean
  costingMethod: 'FIFO' | 'LIFO' | 'WEIGHTED_AVERAGE' | 'SPECIFIC_IDENTIFICATION'
  reorderPoint?: number
  reorderQuantity?: number
  maxStockLevel?: number
  status: 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED' | 'DRAFT'
  locations: ProductLocation[]
  movements: InventoryMovement[]
  _count: {
    movements: number
    serialNumbers: number
    batches: number
  }
}

interface ProductLocation {
  id: string
  locationId: string
  stockQuantity: number
  reservedQuantity: number
  availableQuantity: number
  reorderPoint?: number
  maxStockLevel?: number
  binLocation?: string
  location: {
    id: string
    name: string
    code: string
  }
}

interface InventoryMovement {
  id: string
  movementType: string
  quantity: number
  unitCost?: number
  totalCost?: number
  reference?: string
  movementDate: string
  reason?: string
  notes?: string
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
  }
}

interface Location {
  id: string
  name: string
  code: string
  type: 'WAREHOUSE' | 'STORE' | 'OFFICE' | 'VEHICLE' | 'CUSTOMER_LOCATION'
  address?: string
  isDefault: boolean
  _count: {
    products: number
    movements: number
  }
}

interface ReorderAlert {
  id: string
  alertType: 'LOW_STOCK' | 'OUT_OF_STOCK' | 'OVERSTOCK' | 'EXPIRING_SOON' | 'EXPIRED'
  threshold: number
  status: 'PENDING' | 'ACKNOWLEDGED' | 'RESOLVED' | 'DISMISSED'
  triggeredAt?: string
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
}

interface InventoryAnalytics {
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
}

export function EnhancedInventory() {
  const [products, setProducts] = useState<Product[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [movements, setMovements] = useState<InventoryMovement[]>([])
  const [alerts, setAlerts] = useState<ReorderAlert[]>([])
  const [analytics, setAnalytics] = useState<InventoryAnalytics | null>(null)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [productsRes, locationsRes, movementsRes, alertsRes, analyticsRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/locations'),
        fetch('/api/movements'),
        fetch('/api/alerts'),
        fetch('/api/analytics'),
      ])

      if (productsRes.ok) {
        const productsData = await productsRes.json()
        setProducts(productsData.items || productsData)
      }

      if (locationsRes.ok) {
        const locationsData = await locationsRes.json()
        setLocations(locationsData)
      }

      if (movementsRes.ok) {
        const movementsData = await movementsRes.json()
        setMovements(movementsData.items || movementsData)
      }

      if (alertsRes.ok) {
        const alertsData = await alertsRes.json()
        setAlerts(alertsData)
      }

      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json()
        setAnalytics(analyticsData)
      }
    } catch (error) {
      console.error('Error loading data:', error)
      toast({
        title: "Error",
        description: "Failed to load inventory data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = !searchTerm || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || product.category === selectedCategory
    const matchesStatus = !selectedStatus || product.status === selectedStatus
    const matchesLocation = !selectedLocation || 
      product.locations.some(loc => loc.locationId === selectedLocation)
    
    return matchesSearch && matchesCategory && matchesStatus && matchesLocation
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Enhanced Inventory Management</h1>
          <p className="text-muted-foreground">Advanced inventory tracking with multi-location support, serial numbers, and AI insights</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Scan className="w-4 h-4 mr-2" />
            Scan Barcode
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Analytics Overview */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Products</p>
                  <p className="text-xl font-bold">{analytics.totalProducts}</p>
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
                  <p className="text-xl font-bold">${analytics.totalValue.toLocaleString()}</p>
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
                  <p className="text-xl font-bold">{analytics.lowStockCount}</p>
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
                  <p className="text-xl font-bold">{analytics.outOfStockCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="products" className="space-y-4">
        <TabsList>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="locations">Locations</TabsTrigger>
          <TabsTrigger value="movements">Movements</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="transfers">Transfers</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Products Tab */}
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
                      {Array.from(new Set(products.map(p => p.category).filter(Boolean))).map(category => (
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
                {filteredProducts.map((product) => (
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
                        <p className="font-medium">${(Number(product.stockQuantity) * Number(product.costPrice)).toFixed(2)}</p>
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
                <CardTitle>Top Products by Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics?.topProducts.slice(0, 5).map((product, index) => (
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
                <CardTitle>Category Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics?.categoryBreakdown.map((category) => (
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
      </Tabs>
    </div>
  )
}
