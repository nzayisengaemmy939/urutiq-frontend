'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageLayout } from "@/components/page-layout"
import { Plus, Search, Filter, Eye, Edit, Upload, Receipt, CreditCard, Truck, RefreshCw, AlertCircle, Calendar, DollarSign, Users, Package, CheckCircle } from "lucide-react"
import { useState, useMemo, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiService } from "@/lib/api"
import { useDemoAuth } from "@/hooks/useDemoAuth"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

// Types
interface Bill {
  id: string
  billNumber: string
  billDate: string
  dueDate?: string
  vendorId: string
  vendor?: Vendor
  companyId: string
  company?: Company
  status: 'draft' | 'posted' | 'paid' | 'cancelled'
  totalAmount: number
  balanceDue: number
  currency: string
  purchaseType: 'local' | 'import'
  vendorCurrency?: string
  exchangeRate?: number
  freightCost?: number
  customsDuty?: number
  otherImportCosts?: number
  allocateLandedCost?: boolean
  landedCostAllocated?: boolean
  lines: BillLine[]
  tenantId?: string
  createdAt?: string
  updatedAt?: string
}

interface BillLine {
  id: string
  billId: string
  productId?: string
  product?: Product
  description: string
  quantity: number
  unitPrice: number
  taxRate: number
  lineTotal: number
  tenantId?: string
}

interface Vendor {
  id: string
  name: string
  email?: string
  phone?: string
  taxNumber?: string
  address?: string
  companyId: string
  tenantId?: string
  createdAt?: string
  updatedAt?: string
}

interface Product {
  id: string
  name: string
  sku: string
  description?: string
  type: 'inventory' | 'non-inventory' | 'service'
  unitPrice: number
  costPrice: number
  stockQuantity: number
  companyId: string
  tenantId?: string
  createdAt?: string
  updatedAt?: string
}

interface Company {
  id: string
  name: string
  description?: string
  tenantId?: string
  createdAt?: string
  updatedAt?: string
}

interface PurchaseOrder {
  id: string
  poNumber: string
  orderDate: string
  expectedDelivery?: string
  vendorId: string
  vendor?: Vendor
  companyId: string
  status: 'draft' | 'sent' | 'confirmed' | 'received' | 'cancelled'
  totalAmount: number
  currency: string
  notes?: string
  lines: PurchaseOrderLine[]
  tenantId?: string
  createdAt?: string
  updatedAt?: string
}

interface PurchaseOrderLine {
  id: string
  purchaseOrderId: string
  productId?: string
  product?: Product
  description: string
  quantity: number
  unitPrice: number
  receivedQuantity: number
  tenantId?: string
}

export default function PurchasesPage() {
  const { ready: authReady } = useDemoAuth('purchases')
  const queryClient = useQueryClient()
  
  // State
  const [activeTab, setActiveTab] = useState('overview')
  const [bills, setBills] = useState<Bill[]>([])
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [vendorDialogOpen, setVendorDialogOpen] = useState(false)
  const [billDialogOpen, setBillDialogOpen] = useState(false)
  const [poDialogOpen, setPoDialogOpen] = useState(false)
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null)
  const [editingBill, setEditingBill] = useState<Bill | null>(null)
  const [editingPO, setEditingPO] = useState<PurchaseOrder | null>(null)

  // Form states
  const [vendorForm, setVendorForm] = useState({
    name: '',
    email: '',
    phone: '',
    taxNumber: '',
    address: ''
  })

  const [billForm, setBillForm] = useState({
    vendorId: '',
    billNumber: '',
    billDate: new Date().toISOString().slice(0, 10),
    dueDate: '',
    currency: 'USD',
    purchaseType: 'local' as 'local' | 'import',
    vendorCurrency: 'USD',
    exchangeRate: 1,
    freightCost: 0,
    customsDuty: 0,
    otherImportCosts: 0,
    allocateLandedCost: false,
    lines: [{ description: '', quantity: 1, unitPrice: 0, taxRate: 0 }]
  })

  const [billErrors, setBillErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [poForm, setPoForm] = useState({
    vendorId: '',
    poNumber: '',
    orderDate: new Date().toISOString().slice(0, 10),
    expectedDelivery: '',
    currency: 'USD',
    notes: '',
    lines: [{ description: '', quantity: 1, unitPrice: 0 }]
  })

  // Pagination and search states
  const [billsPage, setBillsPage] = useState(1)
  const [billsPageSize, setBillsPageSize] = useState(10)
  const [billsSearch, setBillsSearch] = useState("")
  const [billsStatus, setBillsStatus] = useState("")
  
  const [vendorsPage, setVendorsPage] = useState(1)
  const [vendorsPageSize, setVendorsPageSize] = useState(20)
  const [vendorsSearch, setVendorsSearch] = useState("")
  

  const [productsSearch, setProductsSearch] = useState("")

  // Queries
  const billsQuery = useQuery({
    queryKey: ["bills", billsPage, billsPageSize, billsSearch, billsStatus, (typeof window !== 'undefined' ? (localStorage.getItem('company_id') || 'seed-company-1') : 'seed-company-1')],
    enabled: authReady,
    queryFn: async () => {
      const companyId = (typeof window !== 'undefined' ? (localStorage.getItem('company_id') || 'seed-company-1') : 'seed-company-1')
      console.log('🔍 Fetching bills for company:', companyId, 'page:', billsPage, 'pageSize:', billsPageSize, 'search:', billsSearch, 'status:', billsStatus)
      const billsResp = await apiService.getBills({ 
        page: billsPage, 
        pageSize: billsPageSize, 
        companyId,
        q: billsSearch || undefined,
        status: billsStatus || undefined
      })
      console.log('📦 Raw bills response:', billsResp)
      return billsResp
    }
  })

  const vendorsQuery = useQuery({
    queryKey: ["vendors", vendorsPage, vendorsPageSize, vendorsSearch, (typeof window !== 'undefined' ? (localStorage.getItem('company_id') || 'seed-company-1') : 'seed-company-1')],
    enabled: authReady,
    queryFn: async () => {
      const companyId = (typeof window !== 'undefined' ? (localStorage.getItem('company_id') || 'seed-company-1') : 'seed-company-1')
      console.log('🔍 Fetching vendors for company:', companyId, 'page:', vendorsPage, 'pageSize:', vendorsPageSize, 'search:', vendorsSearch)
      const vendorsResp = await apiService.getVendors({ 
        page: vendorsPage, 
        pageSize: vendorsPageSize, 
        companyId,
        q: vendorsSearch || undefined
      })
      console.log('📦 Raw vendors response:', vendorsResp)
      return vendorsResp
    }
  })

  const productsQuery = useQuery({
    queryKey: ["products", productsSearch, (typeof window !== 'undefined' ? (localStorage.getItem('company_id') || 'seed-company-1') : 'seed-company-1')],
    enabled: authReady,
    queryFn: async () => {
      const companyId = (typeof window !== 'undefined' ? (localStorage.getItem('company_id') || 'seed-company-1') : 'seed-company-1')
      console.log('🔍 Fetching products for company:', companyId, 'search:', productsSearch)
      const productsResp = await apiService.getProducts({ 
        companyId,
        type: productsSearch || undefined
      })
      console.log('📦 Raw products response:', productsResp)
      return productsResp
    }
  })

  useEffect(() => {
    console.log('🔄 Query data updated:')
    console.log('  📄 Bills data:', billsQuery.data)
    console.log('  👥 Vendors data:', vendorsQuery.data)
    console.log('  📦 Products data:', productsQuery.data)
    console.log('  ⏳ Loading states:', { bills: billsQuery.isLoading, vendors: vendorsQuery.isLoading, products: productsQuery.isLoading })
    console.log('  ❌ Errors:', { bills: billsQuery.error, vendors: vendorsQuery.error, products: productsQuery.error })
    
    if (billsQuery.data) {
      console.log('🎯 Setting bills state:', billsQuery.data)
      const billItems = billsQuery.data?.items || billsQuery.data
      setBills(Array.isArray(billItems) ? billItems as Bill[] : [])
    }
    if (vendorsQuery.data) {
      console.log('🎯 Setting vendors state:', vendorsQuery.data)
      const vendorItems = vendorsQuery.data?.items || vendorsQuery.data
      setVendors(Array.isArray(vendorItems) ? vendorItems as Vendor[] : [])
    }
    if (productsQuery.data) {
      console.log('🎯 Setting products state:', productsQuery.data)
      const productItems = productsQuery.data
      setProducts(Array.isArray(productItems) ? productItems as Product[] : [])
    }
  }, [billsQuery.data, vendorsQuery.data, productsQuery.data])

  // Mutations
  const createVendorMutation = useMutation({
    mutationFn: (data: any) => apiService.createVendor(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] })
      setVendorDialogOpen(false)
      setVendorForm({ name: '', email: '', phone: '', taxNumber: '', address: '' })
      toast.success('Vendor created successfully')
    },
    onError: (error) => {
      toast.error('Failed to create vendor')
      console.error('Create vendor error:', error)
    }
  })

  const createBillMutation = useMutation({
    mutationFn: (data: any) => apiService.createBill(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] })
      setBillDialogOpen(false)
      setBillForm({
        vendorId: '',
        billNumber: '',
        billDate: new Date().toISOString().slice(0, 10),
        dueDate: '',
        currency: 'USD',
        purchaseType: 'local',
        vendorCurrency: 'USD',
        exchangeRate: 1,
        freightCost: 0,
        customsDuty: 0,
        otherImportCosts: 0,
        allocateLandedCost: false,
        lines: [{ description: '', quantity: 1, unitPrice: 0, taxRate: 0 }]
      })
      setBillErrors({})
      setIsSubmitting(false)
      toast.success('Bill created successfully')
    },
    onError: (error) => {
      setIsSubmitting(false)
      toast.error('Failed to create bill')
      console.error('Create bill error:', error)
    }
  })

  const postBillMutation = useMutation({
    mutationFn: (id: string) => apiService.postBill(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] })
      toast.success('Bill posted successfully')
    },
    onError: (error) => {
      toast.error('Failed to post bill')
      console.error('Post bill error:', error)
    }
  })

  // Computed values

  const summary = useMemo(() => {
    const totalBills = bills.length
    const pendingBills = bills.filter(bill => bill.status === 'draft').length
    const overdueBills = bills.filter(bill => 
      bill.dueDate && new Date(bill.dueDate) < new Date() && bill.status !== 'paid'
    ).length
    
    const outstandingAmount = bills
      .filter(bill => bill.status !== 'paid')
      .reduce((sum, bill) => sum + (bill.totalAmount || 0), 0)
    
    const monthlyExpenses = bills
      .filter(bill => {
        const billDate = new Date(bill.billDate)
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        return billDate >= thirtyDaysAgo
      })
      .reduce((sum, bill) => sum + (bill.totalAmount || 0), 0)

    // Calculate percentages
    const pendingPercentage = totalBills > 0 ? Math.round((pendingBills / totalBills) * 100) : 0
    const overduePercentage = totalBills > 0 ? Math.round((overdueBills / totalBills) * 100) : 0
    const paidPercentage = totalBills > 0 ? Math.round(((totalBills - pendingBills - overdueBills) / totalBills) * 100) : 0

    return {
      totalBills,
      pendingBills,
      overdueBills,
      outstandingAmount: Math.round(outstandingAmount),
      monthlyExpenses: Math.round(monthlyExpenses),
      activeVendors: vendors.length,
      pendingPercentage,
      overduePercentage,
      paidPercentage
    }
  }, [bills, vendors])

  // Validation functions
  const validateBillForm = () => {
    const errors: Record<string, string> = {}
    
    if (!billForm.vendorId) {
      errors.vendorId = 'Vendor is required'
    }
    
    if (!billForm.billNumber.trim()) {
      errors.billNumber = 'Bill number is required'
    } else if (billForm.billNumber.length < 3) {
      errors.billNumber = 'Bill number must be at least 3 characters'
    }
    
    if (!billForm.billDate) {
      errors.billDate = 'Bill date is required'
    }
    
    if (billForm.dueDate && new Date(billForm.dueDate) < new Date(billForm.billDate)) {
      errors.dueDate = 'Due date cannot be before bill date'
    }
    
    if (billForm.purchaseType === 'import') {
      if (!billForm.vendorCurrency) {
        errors.vendorCurrency = 'Vendor currency is required for import bills'
      }
      if (billForm.exchangeRate <= 0) {
        errors.exchangeRate = 'Exchange rate must be greater than 0'
      }
    }
    
    // Validate line items
    billForm.lines.forEach((line, index) => {
      if (!line.description.trim()) {
        errors[`line${index}Description`] = 'Description is required'
      }
      if (line.quantity <= 0) {
        errors[`line${index}Quantity`] = 'Quantity must be greater than 0'
      }
      if (line.unitPrice < 0) {
        errors[`line${index}UnitPrice`] = 'Unit price cannot be negative'
      }
      if (line.taxRate < 0) {
        errors[`line${index}TaxRate`] = 'Tax rate cannot be negative'
      }
    })
    
    return errors
  }

  // Handlers
  const handleCreateVendor = () => {
    const errors: Record<string, string> = {}
    
    if (!vendorForm.name.trim()) {
      errors.name = 'Vendor name is required'
    }
    
    if (vendorForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(vendorForm.email)) {
      errors.email = 'Invalid email format'
    }
    
    if (vendorForm.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(vendorForm.phone.replace(/[\s\-\(\)]/g, ''))) {
      errors.phone = 'Invalid phone number format'
    }
    
    if (Object.keys(errors).length > 0) {
      setBillErrors(errors)
      toast.error('Please fix the validation errors')
      return
    }
    
    createVendorMutation.mutate({
      ...vendorForm,
      companyId: 'seed-company-1'
    })
  }

  const handleCreateBill = () => {
    const errors = validateBillForm()
    
    if (Object.keys(errors).length > 0) {
      setBillErrors(errors)
      toast.error('Please fix the validation errors')
      return
    }
    
    setIsSubmitting(true)
    setBillErrors({})
    
    const companyId = (typeof window !== 'undefined' ? (localStorage.getItem('company_id') || 'seed-company-1') : 'seed-company-1');
    createBillMutation.mutate({
      ...billForm,
      companyId,
      lines: billForm.lines && Array.isArray(billForm.lines) ? billForm.lines : [{ description: '', quantity: 1, unitPrice: 0, taxRate: 0 }]
    })
  }

  const handlePostBill = (billId: string) => {
    postBillMutation.mutate(billId)
  }

  const addBillLine = () => {
    setBillForm(prev => ({
      ...prev,
      lines: [...prev.lines, { description: '', quantity: 1, unitPrice: 0, taxRate: 0 }]
    }))
  }

  const removeBillLine = (index: number) => {
    setBillForm(prev => ({
      ...prev,
      lines: prev.lines.filter((_, i) => i !== index)
    }))
  }

  const updateBillLine = (index: number, field: string, value: any) => {
    setBillForm(prev => ({
      ...prev,
      lines: prev.lines.map((line, i) => 
        i === index ? { ...line, [field]: value } : line
      )
    }))
  }

  const calculateBillTotal = () => {
    const lineTotal = billForm.lines.reduce((sum, line) => 
      sum + (line.quantity * line.unitPrice * (1 + line.taxRate / 100)), 0
    )
    const landedCosts = billForm.freightCost + billForm.customsDuty + billForm.otherImportCosts
    return lineTotal + landedCosts
  }

  if (!authReady) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Truck className="w-8 h-8 text-primary" />
              Purchases
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage vendors, bills, and purchase orders with comprehensive tracking and validation
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-sm">
              {bills.length} Bills
            </Badge>
            <Badge variant="outline" className="text-sm">
              {vendors.length} Vendors
            </Badge>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bill Status</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalBills}</div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  {summary.paidPercentage}% Paid
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  {summary.pendingPercentage}% Pending
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  {summary.overduePercentage}% Overdue
                </span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Outstanding Amount</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${summary.outstandingAmount.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {summary.pendingBills + summary.overdueBills} unpaid bills
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${summary.monthlyExpenses.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Last 30 days
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Vendors</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.activeVendors}</div>
              <p className="text-xs text-muted-foreground">
                Total vendors
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="bills">Bills</TabsTrigger>
            <TabsTrigger value="vendors">Vendors</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Bills</CardTitle>
                  <Button onClick={() => setActiveTab('bills')}>
                    View All Bills
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bills.slice(0, 5).map((bill) => (
                    <div
                      key={bill.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                          <Receipt className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                          <p className="font-medium">{bill.billNumber}</p>
                          <p className="text-sm text-muted-foreground">{bill.vendor?.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-medium">${Math.round(bill.totalAmount || 0).toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">
                            {bill.billDate ? new Date(bill.billDate).toLocaleDateString() : 'No date'}
                          </p>
                        </div>
                        <Badge
                          variant={
                            bill.status === "posted"
                              ? "default"
                              : bill.status === "draft"
                                ? "secondary"
                              : bill.status === "paid"
                                ? "default"
                                : "outline"
                          }
                          className="capitalize"
                        >
                          {bill.status === 'draft' && <AlertCircle className="w-3 h-3 mr-1" />}
                          {bill.status === 'posted' && <Upload className="w-3 h-3 mr-1" />}
                          {bill.status === 'paid' && <CheckCircle className="w-3 h-3 mr-1" />}
                          {bill.status}
                        </Badge>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {bills.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No bills created yet
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bills" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Vendor Bills</CardTitle>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input 
                        placeholder="Search bills..." 
                        className="pl-10 w-64"
                        value={billsSearch}
                        onChange={(e) => setBillsSearch(e.target.value)}
                      />
                    </div>
                    <select
                      className="border rounded px-3 py-2"
                      value={billsStatus}
                      onChange={(e) => setBillsStatus(e.target.value)}
                    >
                      <option value="">All Status</option>
                      <option value="draft">Draft</option>
                      <option value="posted">Posted</option>
                      <option value="paid">Paid</option>
                    </select>
                    <Dialog open={billDialogOpen} onOpenChange={setBillDialogOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Bill
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <Receipt className="w-5 h-5" />
                            Create New Bill
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-6">
                                                      <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="flex items-center gap-1">
                                  Vendor
                                  <span className="text-red-500">*</span>
                                </Label>
                                <Select 
                                  value={billForm.vendorId} 
                                  onValueChange={(value) => {
                                    setBillForm(prev => ({ ...prev, vendorId: value }))
                                    setBillErrors(prev => ({ ...prev, vendorId: '' }))
                                  }}
                                >
                                  <SelectTrigger className={billErrors.vendorId ? 'border-red-500' : ''}>
                                    <SelectValue placeholder="Select vendor" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {vendors.map((vendor) => (
                                      <SelectItem key={vendor.id} value={vendor.id}>
                                        {vendor.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                {billErrors.vendorId && (
                                  <p className="text-sm text-red-500 mt-1">{billErrors.vendorId}</p>
                                )}
                              </div>
                              <div>
                                <Label className="flex items-center gap-1">
                                  Bill Number
                                  <span className="text-red-500">*</span>
                                </Label>
                                <Input 
                                  value={billForm.billNumber}
                                  onChange={(e) => {
                                    setBillForm(prev => ({ ...prev, billNumber: e.target.value }))
                                    setBillErrors(prev => ({ ...prev, billNumber: '' }))
                                  }}
                                  placeholder="BILL-001"
                                  className={billErrors.billNumber ? 'border-red-500' : ''}
                                />
                                {billErrors.billNumber && (
                                  <p className="text-sm text-red-500 mt-1">{billErrors.billNumber}</p>
                                )}
                              </div>
                                                          <div>
                                <Label className="flex items-center gap-1">
                                  Bill Date
                                  <span className="text-red-500">*</span>
                                </Label>
                                <Input 
                                  type="date"
                                  value={billForm.billDate}
                                  onChange={(e) => {
                                    setBillForm(prev => ({ ...prev, billDate: e.target.value }))
                                    setBillErrors(prev => ({ ...prev, billDate: '' }))
                                  }}
                                  className={billErrors.billDate ? 'border-red-500' : ''}
                                />
                                {billErrors.billDate && (
                                  <p className="text-sm text-red-500 mt-1">{billErrors.billDate}</p>
                                )}
                              </div>
                              <div>
                                <Label>Due Date</Label>
                                <Input 
                                  type="date"
                                  value={billForm.dueDate}
                                  onChange={(e) => {
                                    setBillForm(prev => ({ ...prev, dueDate: e.target.value }))
                                    setBillErrors(prev => ({ ...prev, dueDate: '' }))
                                  }}
                                  className={billErrors.dueDate ? 'border-red-500' : ''}
                                />
                                {billErrors.dueDate && (
                                  <p className="text-sm text-red-500 mt-1">{billErrors.dueDate}</p>
                                )}
                              </div>
                            <div>
                              <Label>Currency</Label>
                              <Select value={billForm.currency} onValueChange={(value) => setBillForm(prev => ({ ...prev, currency: value }))}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="USD">USD</SelectItem>
                                  <SelectItem value="EUR">EUR</SelectItem>
                                  <SelectItem value="GBP">GBP</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>Purchase Type</Label>
                              <Select value={billForm.purchaseType} onValueChange={(value: 'local' | 'import') => setBillForm(prev => ({ ...prev, purchaseType: value }))}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="local">Local</SelectItem>
                                  <SelectItem value="import">Import</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          {billForm.purchaseType === 'import' && (
                            <div className="grid grid-cols-3 gap-4 p-4 border rounded-lg">
                              <div>
                                <Label>Vendor Currency</Label>
                                <Select value={billForm.vendorCurrency} onValueChange={(value) => setBillForm(prev => ({ ...prev, vendorCurrency: value }))}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="USD">USD</SelectItem>
                                    <SelectItem value="EUR">EUR</SelectItem>
                                    <SelectItem value="GBP">GBP</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label>Exchange Rate</Label>
                                <Input 
                                  type="number"
                                  step="0.01"
                                  value={billForm.exchangeRate}
                                  onChange={(e) => setBillForm(prev => ({ ...prev, exchangeRate: parseFloat(e.target.value) || 1 }))}
                                />
                              </div>
                              <div>
                                <Label>Freight Cost</Label>
                                <Input 
                                  type="number"
                                  step="0.01"
                                  value={billForm.freightCost}
                                  onChange={(e) => setBillForm(prev => ({ ...prev, freightCost: parseFloat(e.target.value) || 0 }))}
                                />
                              </div>
                              <div>
                                <Label>Customs Duty</Label>
                                <Input 
                                  type="number"
                                  step="0.01"
                                  value={billForm.customsDuty}
                                  onChange={(e) => setBillForm(prev => ({ ...prev, customsDuty: parseFloat(e.target.value) || 0 }))}
                                />
                              </div>
                              <div>
                                <Label>Other Import Costs</Label>
                                <Input 
                                  type="number"
                                  step="0.01"
                                  value={billForm.otherImportCosts}
                                  onChange={(e) => setBillForm(prev => ({ ...prev, otherImportCosts: parseFloat(e.target.value) || 0 }))}
                                />
                              </div>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id="allocateLandedCost"
                                  checked={billForm.allocateLandedCost}
                                  onChange={(e) => setBillForm(prev => ({ ...prev, allocateLandedCost: e.target.checked }))}
                                />
                                <Label htmlFor="allocateLandedCost">Allocate Landed Costs</Label>
                              </div>
                            </div>
                          )}

                          <div>
                            <Label className="flex items-center gap-1">
                              Bill Lines
                              <span className="text-red-500">*</span>
                            </Label>
                            <div className="space-y-3">
                              <div className="grid grid-cols-5 gap-3 text-sm font-medium text-gray-600 pb-2 border-b">
                                <div>Description</div>
                                <div>Quantity</div>
                                <div>Unit Price</div>
                                <div>Tax %</div>
                                <div>Line Total</div>
                              </div>
                              {billForm.lines.map((line, index) => (
                                <div key={index} className="grid grid-cols-5 gap-3 p-3 border rounded-lg bg-gray-50/50">
                                  <div>
                                    <Input
                                      placeholder="Description"
                                      value={line.description}
                                      onChange={(e) => {
                                        updateBillLine(index, 'description', e.target.value)
                                        setBillErrors(prev => ({ ...prev, [`line${index}Description`]: '' }))
                                      }}
                                      className={billErrors[`line${index}Description`] ? 'border-red-500' : ''}
                                    />
                                    {billErrors[`line${index}Description`] && (
                                      <p className="text-xs text-red-500 mt-1">{billErrors[`line${index}Description`]}</p>
                                    )}
                                  </div>
                                  <div>
                                    <Input
                                      type="number"
                                      min="0.01"
                                      step="0.01"
                                      placeholder="Qty"
                                      value={line.quantity}
                                      onChange={(e) => {
                                        updateBillLine(index, 'quantity', parseFloat(e.target.value) || 0)
                                        setBillErrors(prev => ({ ...prev, [`line${index}Quantity`]: '' }))
                                      }}
                                      className={billErrors[`line${index}Quantity`] ? 'border-red-500' : ''}
                                    />
                                    {billErrors[`line${index}Quantity`] && (
                                      <p className="text-xs text-red-500 mt-1">{billErrors[`line${index}Quantity`]}</p>
                                    )}
                                  </div>
                                  <div>
                                    <Input
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      placeholder="Unit Price"
                                      value={line.unitPrice}
                                      onChange={(e) => {
                                        updateBillLine(index, 'unitPrice', parseFloat(e.target.value) || 0)
                                        setBillErrors(prev => ({ ...prev, [`line${index}UnitPrice`]: '' }))
                                      }}
                                      className={billErrors[`line${index}UnitPrice`] ? 'border-red-500' : ''}
                                    />
                                    {billErrors[`line${index}UnitPrice`] && (
                                      <p className="text-xs text-red-500 mt-1">{billErrors[`line${index}UnitPrice`]}</p>
                                    )}
                                  </div>
                                  <div>
                                    <Input
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      placeholder="Tax %"
                                      value={line.taxRate}
                                      onChange={(e) => {
                                        updateBillLine(index, 'taxRate', parseFloat(e.target.value) || 0)
                                        setBillErrors(prev => ({ ...prev, [`line${index}TaxRate`]: '' }))
                                      }}
                                      className={billErrors[`line${index}TaxRate`] ? 'border-red-500' : ''}
                                    />
                                    {billErrors[`line${index}TaxRate`] && (
                                      <p className="text-xs text-red-500 mt-1">{billErrors[`line${index}TaxRate`]}</p>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-green-600">
                                      ${(line.quantity * line.unitPrice * (1 + line.taxRate / 100)).toFixed(2)}
                                    </span>
                                    {billForm.lines.length > 1 && (
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeBillLine(index)}
                                        className="text-red-500 hover:text-red-700"
                                      >
                                        ×
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              ))}
                              <Button 
                                type="button" 
                                variant="outline" 
                                onClick={addBillLine}
                                className="w-full"
                              >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Line Item
                              </Button>
                            </div>
                          </div>

                          <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Subtotal:</span>
                                <span>${(billForm.lines.reduce((sum, line) => sum + (line.quantity * line.unitPrice), 0)).toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span>Tax:</span>
                                <span>${(billForm.lines.reduce((sum, line) => sum + (line.quantity * line.unitPrice * line.taxRate / 100), 0)).toFixed(2)}</span>
                              </div>
                              {billForm.purchaseType === 'import' && (
                                <>
                                  <div className="flex justify-between text-sm">
                                    <span>Freight Cost:</span>
                                    <span>${billForm.freightCost.toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span>Customs Duty:</span>
                                    <span>${billForm.customsDuty.toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span>Other Import Costs:</span>
                                    <span>${billForm.otherImportCosts.toFixed(2)}</span>
                                  </div>
                                </>
                              )}
                              <div className="border-t pt-2">
                                <div className="flex justify-between text-lg font-bold">
                                  <span>Total:</span>
                                  <span className="text-green-600">${calculateBillTotal().toFixed(2)}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-end gap-3">
                            <Button 
                              variant="outline" 
                              onClick={() => {
                                setBillDialogOpen(false)
                                setBillErrors({})
                                setIsSubmitting(false)
                              }}
                              disabled={isSubmitting}
                            >
                              Cancel
                            </Button>
                            <Button 
                              onClick={handleCreateBill} 
                              disabled={isSubmitting || createBillMutation.isPending}
                              className="min-w-[120px]"
                            >
                              {isSubmitting || createBillMutation.isPending ? (
                                <>
                                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                  Creating...
                                </>
                              ) : (
                                <>
                                  <Plus className="w-4 h-4 mr-2" />
                                  Create Bill
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {billsQuery.isLoading ? (
                    <>
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-muted rounded-lg animate-pulse" />
                            <div className="space-y-2">
                              <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                              <div className="h-3 w-24 bg-muted rounded animate-pulse" />
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right space-y-2">
                              <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                              <div className="h-3 w-16 bg-muted rounded animate-pulse" />
                            </div>
                            <div className="h-6 w-16 bg-muted rounded animate-pulse" />
                          </div>
                        </div>
                      ))}
                    </>
                  ) : bills.length > 0 ? (
                    bills.map((bill) => (
                      <div
                        key={bill.id}
                        className="group flex items-center justify-between p-6 bg-white border border-gray-100 rounded-xl hover:shadow-lg hover:border-blue-200 transition-all duration-200"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-red-200 rounded-xl flex items-center justify-center group-hover:from-red-200 group-hover:to-red-300 transition-all duration-200">
                            <CreditCard className="w-6 h-6 text-red-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-lg">{bill.billNumber}</p>
                            <p className="text-sm text-gray-600">{bill.vendor?.name || 'Unknown Vendor'}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge 
                                variant={
                                  bill.status === "paid"
                                    ? "default"
                                    : bill.status === "posted"
                                    ? "secondary"
                                    : bill.status === "draft"
                                    ? "outline"
                                    : "outline"
                                }
                                className="text-xs capitalize"
                              >
                                {bill.status === 'draft' && <AlertCircle className="w-3 h-3 mr-1" />}
                                {bill.status === 'posted' && <Upload className="w-3 h-3 mr-1" />}
                                {bill.status === 'paid' && <CheckCircle className="w-3 h-3 mr-1" />}
                                {bill.status}
                              </Badge>
                              {bill.dueDate && (
                                <span className="text-xs text-gray-500">
                                  Due: {new Date(bill.dueDate).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-bold text-lg text-gray-900">
                              ${Math.round(bill.totalAmount || 0).toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-500">
                              {bill.billDate ? new Date(bill.billDate).toLocaleDateString() : 'No date'}
                            </p>
                          </div>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            {bill.status === 'draft' && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handlePostBill(bill.id)}
                                disabled={postBillMutation.isPending}
                              >
                                <Upload className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No bills found
                    </div>
                  )}
                  {billsQuery.data && (
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="text-sm text-muted-foreground">
                        Showing {((billsPage - 1) * billsPageSize) + 1} to {Math.min(billsPage * billsPageSize, billsQuery.data.total)} of {billsQuery.data.total} bills
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          className="text-sm border rounded px-2 py-1"
                          value={billsPageSize}
                          onChange={(e) => {
                            setBillsPageSize(Number(e.target.value))
                            setBillsPage(1) // Reset to first page when changing page size
                          }}
                        >
                          <option value={10}>10 per page</option>
                          <option value={20}>20 per page</option>
                          <option value={50}>50 per page</option>
                          <option value={100}>100 per page</option>
                        </select>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setBillsPage(prev => Math.max(1, prev - 1))}
                          disabled={!billsQuery.data.hasPrev || billsQuery.isLoading}
                        >
                          Previous
                        </Button>
                        <div className="text-sm">
                          Page {billsPage} of {billsQuery.data.totalPages}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setBillsPage(prev => prev + 1)}
                          disabled={!billsQuery.data.hasNext || billsQuery.isLoading}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vendors" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Vendors</CardTitle>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input 
                        placeholder="Search vendors..." 
                        className="pl-10 w-64"
                        value={vendorsSearch}
                        onChange={(e) => setVendorsSearch(e.target.value)}
                      />
                    </div>
                    <Dialog open={vendorDialogOpen} onOpenChange={setVendorDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Vendor
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Users className="w-5 h-5" />
                          Create New Vendor
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label className="flex items-center gap-1">
                            Name
                            <span className="text-red-500">*</span>
                          </Label>
                          <Input 
                            value={vendorForm.name}
                            onChange={(e) => {
                              setVendorForm(prev => ({ ...prev, name: e.target.value }))
                              setBillErrors(prev => ({ ...prev, name: '' }))
                            }}
                            placeholder="Vendor name"
                            className={billErrors.name ? 'border-red-500' : ''}
                          />
                          {billErrors.name && (
                            <p className="text-sm text-red-500 mt-1">{billErrors.name}</p>
                          )}
                        </div>
                        <div>
                          <Label>Email</Label>
                          <Input 
                            type="email"
                            value={vendorForm.email}
                            onChange={(e) => {
                              setVendorForm(prev => ({ ...prev, email: e.target.value }))
                              setBillErrors(prev => ({ ...prev, email: '' }))
                            }}
                            placeholder="vendor@example.com"
                            className={billErrors.email ? 'border-red-500' : ''}
                          />
                          {billErrors.email && (
                            <p className="text-sm text-red-500 mt-1">{billErrors.email}</p>
                          )}
                        </div>
                        <div>
                          <Label>Phone</Label>
                          <Input 
                            value={vendorForm.phone}
                            onChange={(e) => {
                              setVendorForm(prev => ({ ...prev, phone: e.target.value }))
                              setBillErrors(prev => ({ ...prev, phone: '' }))
                            }}
                            placeholder="+1 (555) 123-4567"
                            className={billErrors.phone ? 'border-red-500' : ''}
                          />
                          {billErrors.phone && (
                            <p className="text-sm text-red-500 mt-1">{billErrors.phone}</p>
                          )}
                        </div>
                        <div>
                          <Label>Tax Number</Label>
                          <Input 
                            value={vendorForm.taxNumber}
                            onChange={(e) => setVendorForm(prev => ({ ...prev, taxNumber: e.target.value }))}
                            placeholder="Tax ID or VAT number"
                          />
                        </div>
                        <div>
                          <Label>Address</Label>
                          <Textarea 
                            value={vendorForm.address}
                            onChange={(e) => setVendorForm(prev => ({ ...prev, address: e.target.value }))}
                            placeholder="Full address"
                          />
                        </div>
                        <div className="flex justify-end gap-3">
                          <Button 
                            variant="outline" 
                            onClick={() => {
                              setVendorDialogOpen(false)
                              setBillErrors({})
                            }}
                            disabled={createVendorMutation.isPending}
                          >
                            Cancel
                          </Button>
                          <Button 
                            onClick={handleCreateVendor} 
                            disabled={createVendorMutation.isPending}
                            className="min-w-[120px]"
                          >
                            {createVendorMutation.isPending ? (
                              <>
                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                Creating...
                              </>
                            ) : (
                              <>
                                <Plus className="w-4 h-4 mr-2" />
                                Create Vendor
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {vendorsQuery.isLoading ? (
                    <>
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-muted rounded-lg animate-pulse" />
                            <div className="space-y-2">
                              <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                              <div className="h-3 w-24 bg-muted rounded animate-pulse" />
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <div className="h-8 w-8 bg-muted rounded animate-pulse" />
                            <div className="h-8 w-8 bg-muted rounded animate-pulse" />
                          </div>
                        </div>
                      ))}
                    </>
                  ) : vendors.length > 0 ? (
                    vendors.map((vendor) => (
                      <div
                        key={vendor.id}
                        className="group flex items-center justify-between p-6 bg-white border border-gray-100 rounded-xl hover:shadow-lg hover:border-blue-200 transition-all duration-200"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center group-hover:from-blue-200 group-hover:to-blue-300 transition-all duration-200">
                            <span className="text-blue-600 font-bold text-lg">{vendor.name.charAt(0)}</span>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-lg">{vendor.name}</p>
                            <p className="text-sm text-gray-600">{vendor.email || '—'}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {vendor.phone || 'No phone'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <Button variant="outline" size="sm" className="hover:bg-blue-50 hover:border-blue-200">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm" className="hover:bg-blue-50 hover:border-blue-200">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No vendors found
                    </div>
                  )}
                  {vendorsQuery.data && (
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="text-sm text-muted-foreground">
                        Showing {((vendorsPage - 1) * vendorsPageSize) + 1} to {Math.min(vendorsPage * vendorsPageSize, vendorsQuery.data.total)} of {vendorsQuery.data.total} vendors
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          className="text-sm border rounded px-2 py-1"
                          value={vendorsPageSize}
                          onChange={(e) => {
                            setVendorsPageSize(Number(e.target.value))
                            setVendorsPage(1) // Reset to first page when changing page size
                          }}
                        >
                          <option value={10}>10 per page</option>
                          <option value={20}>20 per page</option>
                          <option value={50}>50 per page</option>
                          <option value={100}>100 per page</option>
                        </select>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setVendorsPage(prev => Math.max(1, prev - 1))}
                          disabled={!vendorsQuery.data.hasPrev || vendorsQuery.isLoading}
                        >
                          Previous
                        </Button>
                        <div className="text-sm">
                          Page {vendorsPage} of {vendorsQuery.data.totalPages}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setVendorsPage(prev => prev + 1)}
                          disabled={!vendorsQuery.data.hasNext || vendorsQuery.isLoading}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Products & Inventory</CardTitle>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input 
                        placeholder="Search products..." 
                        className="pl-10 w-64"
                        value={productsSearch}
                        onChange={(e) => setProductsSearch(e.target.value)}
                      />
                    </div>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Product
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {productsQuery.isLoading ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="p-4 border rounded-lg">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-muted rounded-lg animate-pulse" />
                          <div className="space-y-2">
                            <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                            <div className="h-3 w-24 bg-muted rounded animate-pulse" />
                          </div>
                        </div>
                        <div className="space-y-2 mb-3">
                          <div className="flex justify-between">
                            <div className="h-3 w-8 bg-muted rounded animate-pulse" />
                            <div className="h-5 w-16 bg-muted rounded animate-pulse" />
                          </div>
                          <div className="flex justify-between">
                            <div className="h-3 w-12 bg-muted rounded animate-pulse" />
                            <div className="h-3 w-16 bg-muted rounded animate-pulse" />
                          </div>
                          <div className="flex justify-between">
                            <div className="h-3 w-10 bg-muted rounded animate-pulse" />
                            <div className="h-3 w-16 bg-muted rounded animate-pulse" />
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-16 bg-muted rounded animate-pulse" />
                          <div className="h-8 w-16 bg-muted rounded animate-pulse" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : products.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {products.map((product) => (
                      <div key={product.id} className="group p-6 bg-white border border-gray-100 rounded-xl hover:shadow-lg hover:border-blue-200 transition-all duration-200">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center group-hover:from-blue-200 group-hover:to-blue-300 transition-all duration-200">
                            <Package className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 text-lg">{product.name}</div>
                            <div className="text-sm text-gray-600">
                              SKU: {product.sku}
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-3 mb-4">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Type:</span>
                            <Badge variant="outline" className="text-xs">{product.type}</Badge>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Price:</span>
                            <span className="font-medium text-gray-900">${Math.round(product.unitPrice || 0).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Cost:</span>
                            <span className="font-medium text-gray-900">${Math.round(product.costPrice || 0).toLocaleString()}</span>
                          </div>
                          {product.type === 'inventory' && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Stock:</span>
                              <span className="font-medium text-gray-900">{product.stockQuantity || 0}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <Button variant="outline" size="sm" className="hover:bg-blue-50 hover:border-blue-200">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="hover:bg-blue-50 hover:border-blue-200">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">No products found</p>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Product
                    </Button>
                  </div>
                )}
                {productsQuery.data && (
                  <div className="flex items-center justify-between pt-4 border-t mt-6">
                    <div className="text-sm text-muted-foreground">
                      Showing {products.length} products
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  )
}
