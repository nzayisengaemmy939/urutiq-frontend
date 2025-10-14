'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  Package, 
  MapPin, 
  Tag, 
  BarChart3, 
  RefreshCw, 
  Plus, 
  Search, 
  Filter,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Hash,
  QrCode,
  TrendingUp,
  TrendingDown,
  Eye,
  Edit,
  Trash2
} from 'lucide-react'
import { toast } from 'sonner'
import { useDemoAuth } from '@/hooks/useDemoAuth'

interface Company {
  id: string
  name: string
  currency: string
}

interface Location {
  id: string
  name: string
  address: string
  city: string
  state: string
  country: string
  postalCode: string
  isActive: boolean
}

interface Category {
  id: string
  name: string
  description?: string
  parentId?: string
  isActive: boolean
}

interface Product {
  id: string
  sku: string
  name: string
  description?: string
  categoryId: string
  unit: string
  costMethod: 'FIFO' | 'LIFO' | 'AVERAGE' | 'SPECIFIC_IDENTIFICATION'
  reorderPoint: number
  reorderQuantity: number
  isActive: boolean
}

interface InventoryItem {
  id: string
  productId: string
  locationId: string
  quantityOnHand: number
  quantityReserved: number
  quantityAvailable: number
  averageCost: number
  lastCost: number
  totalValue: number
  lastUpdated: string
}

interface SerialNumber {
  id: string
  productId: string
  locationId: string
  serialNumber: string
  status: 'AVAILABLE' | 'SOLD' | 'RESERVED' | 'DEFECTIVE' | 'RETURNED'
  purchaseDate?: string
  saleDate?: string
  warrantyExpiry?: string
  notes?: string
}

interface InventoryTransaction {
  id: string
  productId: string
  locationId: string
  transactionType: 'PURCHASE' | 'SALE' | 'ADJUSTMENT' | 'TRANSFER' | 'RETURN' | 'CYCLE_COUNT'
  quantity: number
  unitCost: number
  totalCost: number
  reference: string
  referenceId?: string
  notes?: string
  serialNumbers?: string[]
  createdAt: string
  createdBy: string
}

interface InventoryValuation {
  productId: string
  productName: string
  sku: string
  totalQuantity: number
  averageCost: number
  totalValue: number
  locations: Array<{
    locationId: string
    locationName: string
    quantity: number
    value: number
  }>
}

interface ReorderAlert {
  productId: string
  productName: string
  sku: string
  locationId: string
  locationName: string
  currentQuantity: number
  reorderPoint: number
  reorderQuantity: number
  daysUntilStockout: number
}

export default function InventoryManagementPage() {
  const { ready: authReady } = useDemoAuth('inventory-management-page')
  const [companies, setCompanies] = useState<Company[]>([])
  const [selectedCompany, setSelectedCompany] = useState<string>('')
  const [locations, setLocations] = useState<Location[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  const [serialNumbers, setSerialNumbers] = useState<SerialNumber[]>([])
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([])
  const [valuation, setValuation] = useState<InventoryValuation[]>([])
  const [reorderAlerts, setReorderAlerts] = useState<ReorderAlert[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  
  // Dialog states
  const [locationDialogOpen, setLocationDialogOpen] = useState(false)
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
  const [productDialogOpen, setProductDialogOpen] = useState(false)
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false)
  const [serialDialogOpen, setSerialDialogOpen] = useState(false)

  // Load companies
  useEffect(() => {
    const loadCompanies = async () => {
      try {
        const API = process.env.NEXT_PUBLIC_API_URL || ''
        const response = await fetch(`${API}/companies`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
            'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo'
          }
        })
        const data = await response.json()
        setCompanies(data.data || [])
        if (data.data?.length > 0) {
          setSelectedCompany(data.data[0].id)
        }
      } catch (error) {
        console.error('Error loading companies:', error)
        toast.error('Failed to load companies')
      }
    }
    loadCompanies()
  }, [])

  // Load data when company changes
  useEffect(() => {
    if (selectedCompany) {
      loadAllData()
    }
  }, [selectedCompany])

  const loadAllData = async () => {
    if (!selectedCompany) return
    
    setLoading(true)
    try {
      await Promise.all([
        loadLocations(),
        loadCategories(),
        loadProducts(),
        loadInventoryItems(),
        loadSerialNumbers(),
        loadTransactions(),
        loadValuation(),
        loadReorderAlerts()
      ])
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Failed to load inventory data')
    } finally {
      setLoading(false)
    }
  }

  const loadLocations = async () => {
    const API = process.env.NEXT_PUBLIC_API_URL || ''
    const response = await fetch(`${API}/api/inventory-management/${selectedCompany}/locations`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
        'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo'
      }
    })
    const data = await response.json()
    setLocations(data.data || [])
  }

  const loadCategories = async () => {
    const API = process.env.NEXT_PUBLIC_API_URL || ''
    const response = await fetch(`${API}/api/inventory-management/${selectedCompany}/categories`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
        'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo'
      }
    })
    const data = await response.json()
    setCategories(data.data || [])
  }

  const loadProducts = async () => {
    const API = process.env.NEXT_PUBLIC_API_URL || ''
    const response = await fetch(`${API}/api/inventory-management/${selectedCompany}/products`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
        'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo'
      }
    })
    const data = await response.json()
    setProducts(data.data || [])
  }

  const loadInventoryItems = async () => {
    const API = process.env.NEXT_PUBLIC_API_URL || ''
    const response = await fetch(`${API}/api/inventory-management/${selectedCompany}/inventory`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
        'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo'
      }
    })
    const data = await response.json()
    setInventoryItems(data.data || [])
  }

  const loadSerialNumbers = async () => {
    const API = process.env.NEXT_PUBLIC_API_URL || ''
    const response = await fetch(`${API}/api/inventory-management/${selectedCompany}/serial-numbers`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
        'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo'
      }
    })
    const data = await response.json()
    setSerialNumbers(data.data || [])
  }

  const loadTransactions = async () => {
    const API = process.env.NEXT_PUBLIC_API_URL || ''
    const response = await fetch(`${API}/api/inventory-management/${selectedCompany}/transactions`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
        'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo'
      }
    })
    const data = await response.json()
    setTransactions(data.data || [])
  }

  const loadValuation = async () => {
    const API = process.env.NEXT_PUBLIC_API_URL || ''
    const response = await fetch(`${API}/api/inventory-management/${selectedCompany}/valuation`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
        'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo'
      }
    })
    const data = await response.json()
    setValuation(data.data || [])
  }

  const loadReorderAlerts = async () => {
    const API = process.env.NEXT_PUBLIC_API_URL || ''
    const response = await fetch(`${API}/api/inventory-management/${selectedCompany}/reorder-alerts`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
        'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo'
      }
    })
    const data = await response.json()
    setReorderAlerts(data.data || [])
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'bg-green-100 text-green-800'
      case 'SOLD': return 'bg-blue-100 text-blue-800'
      case 'RESERVED': return 'bg-yellow-100 text-yellow-800'
      case 'DEFECTIVE': return 'bg-red-100 text-red-800'
      case 'RETURNED': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'PURCHASE': return 'bg-green-100 text-green-800'
      case 'SALE': return 'bg-blue-100 text-blue-800'
      case 'ADJUSTMENT': return 'bg-yellow-100 text-yellow-800'
      case 'TRANSFER': return 'bg-purple-100 text-purple-800'
      case 'RETURN': return 'bg-orange-100 text-orange-800'
      case 'CYCLE_COUNT': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCostMethodIcon = (method: string) => {
    switch (method) {
      case 'FIFO': return <TrendingUp className="h-4 w-4" />
      case 'LIFO': return <TrendingDown className="h-4 w-4" />
      case 'AVERAGE': return <BarChart3 className="h-4 w-4" />
      case 'SPECIFIC_IDENTIFICATION': return <Hash className="h-4 w-4" />
      default: return <Package className="h-4 w-4" />
    }
  }

  if (!authReady) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading inventory management...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Inventory Management</h1>
          <p className="text-muted-foreground">Manage inventory, track serial numbers, and monitor stock levels</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadAllData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Company Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Company Selection</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="company">Company</Label>
              <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                <SelectTrigger>
                  <SelectValue placeholder="Select company" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="serial-numbers">Serial Numbers</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{products.length}</div>
                <p className="text-xs text-muted-foreground">
                  {products.filter(p => p.isActive).length} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(valuation.reduce((sum, v) => sum + v.totalValue, 0))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {valuation.length} products valued
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Locations</CardTitle>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{locations.length}</div>
                <p className="text-xs text-muted-foreground">
                  {locations.filter(l => l.isActive).length} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Reorder Alerts</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{reorderAlerts.length}</div>
                <p className="text-xs text-muted-foreground">
                  Items need reordering
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Reorder Alerts */}
          {reorderAlerts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Reorder Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {reorderAlerts.slice(0, 5).map((alert, index) => (
                    <div key={index} className="flex justify-between items-center p-3 border rounded-lg bg-red-50">
                      <div>
                        <p className="font-medium">{alert.productName}</p>
                        <p className="text-sm text-muted-foreground">
                          {alert.locationName} • {alert.sku}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-red-600">
                          {alert.currentQuantity} / {alert.reorderPoint}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {alert.daysUntilStockout.toFixed(0)} days left
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Inventory Tab */}
        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Levels</CardTitle>
              <CardDescription>Current inventory levels across all locations</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>On Hand</TableHead>
                    <TableHead>Reserved</TableHead>
                    <TableHead>Available</TableHead>
                    <TableHead>Avg Cost</TableHead>
                    <TableHead>Total Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventoryItems.map((item) => {
                    const product = products.find(p => p.id === item.productId)
                    const location = locations.find(l => l.id === item.locationId)
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {product?.name || 'Unknown Product'}
                        </TableCell>
                        <TableCell>{product?.sku || 'N/A'}</TableCell>
                        <TableCell>{location?.name || 'Unknown Location'}</TableCell>
                        <TableCell>{item.quantityOnHand}</TableCell>
                        <TableCell>{item.quantityReserved}</TableCell>
                        <TableCell className={item.quantityAvailable < 10 ? 'text-red-600 font-medium' : ''}>
                          {item.quantityAvailable}
                        </TableCell>
                        <TableCell>{formatCurrency(item.averageCost)}</TableCell>
                        <TableCell>{formatCurrency(item.totalValue)}</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Products</h3>
            <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Product</DialogTitle>
                  <DialogDescription>
                    Create a new product in your inventory system
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="sku">SKU</Label>
                      <Input id="sku" placeholder="Enter SKU" />
                    </div>
                    <div>
                      <Label htmlFor="name">Product Name</Label>
                      <Input id="name" placeholder="Enter product name" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" placeholder="Enter product description" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="unit">Unit</Label>
                      <Input id="unit" placeholder="each, kg, etc." />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="cost-method">Cost Method</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select cost method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="FIFO">FIFO</SelectItem>
                          <SelectItem value="LIFO">LIFO</SelectItem>
                          <SelectItem value="AVERAGE">Average</SelectItem>
                          <SelectItem value="SPECIFIC_IDENTIFICATION">Specific ID</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="reorder-point">Reorder Point</Label>
                      <Input id="reorder-point" type="number" placeholder="0" />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setProductDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={() => setProductDialogOpen(false)}>
                      Create Product
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Cost Method</TableHead>
                    <TableHead>Reorder Point</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => {
                    const category = categories.find(c => c.id === product.categoryId)
                    return (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.sku}</TableCell>
                        <TableCell>{product.name}</TableCell>
                        <TableCell>{category?.name || 'Unknown'}</TableCell>
                        <TableCell>{product.unit}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getCostMethodIcon(product.costMethod)}
                            {product.costMethod}
                          </div>
                        </TableCell>
                        <TableCell>{product.reorderPoint}</TableCell>
                        <TableCell>
                          <Badge variant={product.isActive ? 'default' : 'secondary'}>
                            {product.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Inventory Transactions</h3>
            <Dialog open={transactionDialogOpen} onOpenChange={setTransactionDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Transaction
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Inventory Transaction</DialogTitle>
                  <DialogDescription>
                    Record a new inventory transaction
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="product">Product</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select product" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name} ({product.sku})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                        <SelectContent>
                          {locations.map((location) => (
                            <SelectItem key={location.id} value={location.id}>
                              {location.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="transaction-type">Transaction Type</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PURCHASE">Purchase</SelectItem>
                          <SelectItem value="SALE">Sale</SelectItem>
                          <SelectItem value="ADJUSTMENT">Adjustment</SelectItem>
                          <SelectItem value="TRANSFER">Transfer</SelectItem>
                          <SelectItem value="RETURN">Return</SelectItem>
                          <SelectItem value="CYCLE_COUNT">Cycle Count</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input id="quantity" type="number" placeholder="Enter quantity" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="unit-cost">Unit Cost</Label>
                      <Input id="unit-cost" type="number" placeholder="0.00" />
                    </div>
                    <div>
                      <Label htmlFor="reference">Reference</Label>
                      <Input id="reference" placeholder="PO-2024-001" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea id="notes" placeholder="Enter transaction notes" />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setTransactionDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={() => setTransactionDialogOpen(false)}>
                      Create Transaction
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Unit Cost</TableHead>
                    <TableHead>Total Cost</TableHead>
                    <TableHead>Reference</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => {
                    const product = products.find(p => p.id === transaction.productId)
                    const location = locations.find(l => l.id === transaction.locationId)
                    return (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge className={getTransactionTypeColor(transaction.transactionType)}>
                            {transaction.transactionType}
                          </Badge>
                        </TableCell>
                        <TableCell>{product?.name || 'Unknown'}</TableCell>
                        <TableCell>{location?.name || 'Unknown'}</TableCell>
                        <TableCell className={transaction.quantity < 0 ? 'text-red-600' : 'text-green-600'}>
                          {transaction.quantity > 0 ? '+' : ''}{transaction.quantity}
                        </TableCell>
                        <TableCell>{formatCurrency(transaction.unitCost)}</TableCell>
                        <TableCell>{formatCurrency(transaction.totalCost)}</TableCell>
                        <TableCell>{transaction.reference}</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Serial Numbers Tab */}
        <TabsContent value="serial-numbers" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Serial Numbers</h3>
            <Dialog open={serialDialogOpen} onOpenChange={setSerialDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Serial Number
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Serial Number</DialogTitle>
                  <DialogDescription>
                    Register a new serial number for tracking
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="serial-product">Product</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select product" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name} ({product.sku})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="serial-location">Location</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                        <SelectContent>
                          {locations.map((location) => (
                            <SelectItem key={location.id} value={location.id}>
                              {location.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="serial-number">Serial Number</Label>
                    <Input id="serial-number" placeholder="Enter serial number" />
                  </div>
                  <div>
                    <Label htmlFor="serial-status">Status</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AVAILABLE">Available</SelectItem>
                        <SelectItem value="SOLD">Sold</SelectItem>
                        <SelectItem value="RESERVED">Reserved</SelectItem>
                        <SelectItem value="DEFECTIVE">Defective</SelectItem>
                        <SelectItem value="RETURNED">Returned</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setSerialDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={() => setSerialDialogOpen(false)}>
                      Add Serial Number
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Serial Number</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Purchase Date</TableHead>
                    <TableHead>Sale Date</TableHead>
                    <TableHead>Warranty Expiry</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {serialNumbers.map((serial) => {
                    const product = products.find(p => p.id === serial.productId)
                    const location = locations.find(l => l.id === serial.locationId)
                    return (
                      <TableRow key={serial.id}>
                        <TableCell className="font-medium">{serial.serialNumber}</TableCell>
                        <TableCell>{product?.name || 'Unknown'}</TableCell>
                        <TableCell>{location?.name || 'Unknown'}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(serial.status)}>
                            {serial.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {serial.purchaseDate ? new Date(serial.purchaseDate).toLocaleDateString() : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {serial.saleDate ? new Date(serial.saleDate).toLocaleDateString() : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {serial.warrantyExpiry ? new Date(serial.warrantyExpiry).toLocaleDateString() : 'N/A'}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Valuation Report</CardTitle>
              <CardDescription>Current inventory valuation by product</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Total Quantity</TableHead>
                    <TableHead>Average Cost</TableHead>
                    <TableHead>Total Value</TableHead>
                    <TableHead>Locations</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {valuation.map((item) => (
                    <TableRow key={item.productId}>
                      <TableCell className="font-medium">{item.productName}</TableCell>
                      <TableCell>{item.sku}</TableCell>
                      <TableCell>{item.totalQuantity}</TableCell>
                      <TableCell>{formatCurrency(item.averageCost)}</TableCell>
                      <TableCell className="font-semibold">{formatCurrency(item.totalValue)}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {item.locations.map((loc, index) => (
                            <div key={index} className="text-sm">
                              {loc.locationName}: {loc.quantity} ({formatCurrency(loc.value)})
                            </div>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
