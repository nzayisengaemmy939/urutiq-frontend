import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit, 
  Trash2, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Building2,
  FileText,
  Receipt,
  Package,
  Truck,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  User,
  CreditCard,
  Banknote,
  RefreshCw,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react'
import { purchaseApi, expenseApi, type Bill, type Vendor, type Product, type Expense } from '@/lib/api/accounting'

interface PurchaseSummary {
  totalBills: number
  totalVendors: number
  totalProducts: number
  pendingBills: number
  overdueBills: number
  monthlySpending: number
  topVendors: Array<{
    vendor: string
    amount: number
    percentage: number
  }>
  topCategories: Array<{
    category: string
    amount: number
    percentage: number
  }>
}

export function PurchaseExpenseDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Data states
  const [bills, setBills] = useState<Bill[]>([])
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [vendorFilter, setVendorFilter] = useState<string>('all')
  const [dateRange, setDateRange] = useState<string>('30')
  
  // Dialog states
  const [showBillDialog, setShowBillDialog] = useState(false)
  const [showVendorDialog, setShowVendorDialog] = useState(false)
  const [showProductDialog, setShowProductDialog] = useState(false)
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null)
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  // Load data on component mount
  useEffect(() => {
    loadData()
  }, [])

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [billsData, vendorsData, productsData] = await Promise.all([
        purchaseApi.getBills(),
        purchaseApi.getVendors(),
        purchaseApi.getProducts()
      ])
      
      setBills(billsData.bills || [])
      setVendors(vendorsData)
      setProducts(productsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [])

  // Calculate summary statistics
  const summary = useMemo((): PurchaseSummary => {
    const totalBills = bills.length
    const totalVendors = vendors.length
    const totalProducts = products.length
    const pendingBills = bills.filter(bill => bill.status === 'draft').length
    const overdueBills = bills.filter(bill => 
      bill.dueDate && new Date(bill.dueDate) < new Date() && bill.status !== 'paid'
    ).length
    
    const monthlySpending = bills
      .filter(bill => {
        const billDate = new Date(bill.billDate)
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        return billDate >= thirtyDaysAgo
      })
      .reduce((sum, bill) => sum + bill.totalAmount, 0)

    // Calculate top vendors
    const vendorTotals = bills.reduce((acc, bill) => {
      const vendorName = bill.vendor?.name || 'Unknown'
      acc[vendorName] = (acc[vendorName] || 0) + bill.totalAmount
      return acc
    }, {} as Record<string, number>)

    const topVendors = Object.entries(vendorTotals)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([vendor, amount]) => ({
        vendor,
        amount,
        percentage: (amount / Object.values(vendorTotals).reduce((sum, val) => sum + val, 0)) * 100
      }))

    return {
      totalBills,
      totalVendors,
      totalProducts,
      pendingBills,
      overdueBills,
      monthlySpending,
      topVendors,
      topCategories: [] // Would need expense categories data
    }
  }, [bills, vendors, products])

  // Filter bills based on search and filters
  const filteredBills = useMemo(() => {
    return bills.filter(bill => {
      const matchesSearch = searchTerm === '' || 
        bill.billNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bill.vendor?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bill.lines.some(line => line.description.toLowerCase().includes(searchTerm.toLowerCase()))
      
      const matchesStatus = statusFilter === 'all' || bill.status === statusFilter
      const matchesVendor = vendorFilter === 'all' || bill.vendorId === vendorFilter
      
      return matchesSearch && matchesStatus && matchesVendor
    })
  }, [bills, searchTerm, statusFilter, vendorFilter])

  const handlePostBill = async (billId: string) => {
    try {
      await purchaseApi.postBill(billId)
      await loadData() // Reload data to get updated status
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post bill')
    }
  }

  const handleDeleteBill = async (billId: string) => {
    if (confirm('Are you sure you want to delete this bill?')) {
      try {
        await purchaseApi.deleteBill(billId)
        await loadData()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete bill')
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>Loading purchase and expense data...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
        <Button variant="outline" size="sm" onClick={loadData} className="ml-2">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Purchase & Expense Management</h1>
          <p className="text-muted-foreground">
            Manage vendors, bills, products, and track expenses
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setShowBillDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Bill
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-blue-800">Total Bills</CardTitle>
              <Receipt className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900">{summary.totalBills}</div>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <p className="text-sm text-blue-700">
                {summary.pendingBills} pending
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-green-800">Vendors</CardTitle>
              <Building2 className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900">{summary.totalVendors}</div>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <p className="text-sm text-green-700">
                Active suppliers
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-purple-800">Products</CardTitle>
              <Package className="h-5 w-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-900">{summary.totalProducts}</div>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <p className="text-sm text-purple-700">
                Inventory items
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-amber-800">Monthly Spending</CardTitle>
              <DollarSign className="h-5 w-5 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-900">
              ${summary.monthlySpending.toLocaleString()}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <TrendingUp className="h-4 w-4 text-amber-600" />
              <p className="text-sm text-amber-700">
                Last 30 days
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="bills" className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            Bills
          </TabsTrigger>
          <TabsTrigger value="vendors" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Vendors
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Products
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Top Vendors Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Top Vendors by Spending
                </CardTitle>
                <CardDescription>
                  Vendors with highest bill amounts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {summary.topVendors.map((vendor, index) => (
                    <div key={vendor.vendor} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </div>
                        <span className="font-medium">{vendor.vendor}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">${vendor.amount.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">
                          {vendor.percentage.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
                <CardDescription>
                  Latest bills and updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {bills.slice(0, 5).map((bill) => (
                    <div key={bill.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                        <div>
                          <div className="font-medium">{bill.billNumber}</div>
                          <div className="text-sm text-muted-foreground">
                            {bill.vendor?.name}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">${bill.totalAmount.toLocaleString()}</div>
                        <Badge variant={bill.status === 'posted' ? 'default' : 'secondary'}>
                          {bill.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Bills Tab */}
        <TabsContent value="bills" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-[300px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search bills by number, vendor, or description..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="posted">Posted</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={vendorFilter} onValueChange={setVendorFilter}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Vendor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Vendors</SelectItem>
                    {vendors.map((vendor) => (
                      <SelectItem key={vendor.id} value={vendor.id}>
                        {vendor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Bills Table */}
          <Card>
            <CardHeader>
              <CardTitle>Bills</CardTitle>
              <CardDescription>
                {filteredBills.length} bills found
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredBills.map((bill) => (
                  <div key={bill.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Receipt className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">{bill.billNumber}</div>
                        <div className="text-sm text-muted-foreground">
                          {bill.vendor?.name} • {new Date(bill.billDate).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {bill.lines.length} line items
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-semibold">${bill.totalAmount.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">
                          Due: {bill.dueDate ? new Date(bill.dueDate).toLocaleDateString() : 'No due date'}
                        </div>
                      </div>
                      
                      <Badge variant={
                        bill.status === 'posted' ? 'default' :
                        bill.status === 'draft' ? 'secondary' :
                        bill.status === 'paid' ? 'default' :
                        'destructive'
                      }>
                        {bill.status}
                      </Badge>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedBill(bill)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        {bill.status === 'draft' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handlePostBill(bill.id)}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteBill(bill.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {filteredBills.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No bills found matching your criteria
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vendors Tab */}
        <TabsContent value="vendors" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Vendors</CardTitle>
                  <CardDescription>
                    {vendors.length} vendors in your system
                  </CardDescription>
                </div>
                <Button onClick={() => setShowVendorDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Vendor
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {vendors.map((vendor) => (
                  <div key={vendor.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">{vendor.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {vendor.email || 'No email'}
                        </div>
                      </div>
                    </div>
                    
                    {vendor.phone && (
                      <div className="text-sm text-muted-foreground mb-2">
                        📞 {vendor.phone}
                      </div>
                    )}
                    
                    {vendor.address && (
                      <div className="text-sm text-muted-foreground mb-3">
                        📍 {vendor.address}
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedVendor(vendor)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Products</CardTitle>
                  <CardDescription>
                    {products.length} products in your inventory
                  </CardDescription>
                </div>
                <Button onClick={() => setShowProductDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {products.map((product) => (
                  <div key={product.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Package className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-muted-foreground">
                          SKU: {product.sku}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-3">
                      <div className="flex justify-between text-sm">
                        <span>Type:</span>
                        <Badge variant="outline">{product.type}</Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Price:</span>
                        <span className="font-medium">${product.unitPrice.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Cost:</span>
                        <span className="font-medium">${product.costPrice.toLocaleString()}</span>
                      </div>
                      {product.type === 'inventory' && (
                        <div className="flex justify-between text-sm">
                          <span>Stock:</span>
                          <span className="font-medium">{product.stockQuantity}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedProduct(product)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs would go here - simplified for now */}
      {showBillDialog && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Bill creation dialog would be implemented here with a form for bill details, line items, etc.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
