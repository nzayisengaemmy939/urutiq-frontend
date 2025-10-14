import { useState, useEffect } from 'react'
import QRCode from 'qrcode'
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Badge } from "../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../components/ui/dialog"
import { Label } from "../components/ui/label"
import { Textarea } from "../components/ui/textarea"
import { PageLayout } from "../components/page-layout"
import { useToast } from "../hooks/use-toast"
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useDemoAuth } from "../hooks/useDemoAuth"
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
  RefreshCw,
  Settings,
  Bell,
  ArrowRightLeft,
  Calendar,
  DollarSign,
  Activity,
  PieChart,
  Check,
  X,
  ArrowRight,
  Calculator,
  Shield,
  AlertCircle,
  Info,
  User,
  Star,
  Phone,
  Mail,
  UserCheck,
  Clock,
  Thermometer,
} from "lucide-react"
import { inventoryApi } from '@/lib/api/inventory'
import { categoriesApi } from '@/lib/api/categories'
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
  const [selectedPeriod] = useState('30d')
  const [selectedForecastHorizon] = useState('3m')
  const [showAddProductDialog, setShowAddProductDialog] = useState(false)
  const [showEditProductDialog, setShowEditProductDialog] = useState(false)
  const [showViewProductDialog, setShowViewProductDialog] = useState(false)
  const [showAddLocationDialog, setShowAddLocationDialog] = useState(false)
  const [showEditLocationDialog, setShowEditLocationDialog] = useState(false)
  const [showViewLocationDialog, setShowViewLocationDialog] = useState(false)
  const [showNewMovementDialog, setShowNewMovementDialog] = useState(false)
  const [showViewMovementDialog, setShowViewMovementDialog] = useState(false)
  const [showQRCodeDialog, setShowQRCodeDialog] = useState(false)
  const [qrCodeImage, setQrCodeImage] = useState<string>('')
  const [showAddCategoryDialog, setShowAddCategoryDialog] = useState(false)
  const [showEditCategoryDialog, setShowEditCategoryDialog] = useState(false)
  const [showViewCategoriesDialog, setShowViewCategoriesDialog] = useState(false)
  const [selectedCategory_, setSelectedCategory_] = useState<any>(null)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [selectedLocationForDialog, setSelectedLocationForDialog] = useState<any>(null)
  const [selectedMovement, setSelectedMovement] = useState<any>(null)
  const [newLocation, setNewLocation] = useState({
    name: '',
    code: '',
    description: '',
    locationType: 'WAREHOUSE',
    address: '',
    address2: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
    latitude: '',
    longitude: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    managerName: '',
    managerEmail: '',
    managerPhone: '',
    isActive: true,
    isDefault: false,
    capacity: '',
    timezone: '',
    operatingHours: '',
    specialInstructions: '',
    warehouseZone: '',
    temperatureControlled: false,
    securityLevel: 'STANDARD',
    notes: ''
  })
  const [newMovement, setNewMovement] = useState({
    productId: '',
    movementType: 'INBOUND' as 'INBOUND' | 'OUTBOUND' | 'TRANSFER_IN' | 'TRANSFER_OUT' | 'ADJUSTMENT_IN' | 'ADJUSTMENT_OUT' | 'RETURN_IN' | 'RETURN_OUT' | 'DAMAGE' | 'THEFT' | 'CYCLE_COUNT',
    quantity: 0,
    movementDate: new Date().toISOString().split('T')[0],
    movementTime: new Date().toTimeString().slice(0, 5),
    reference: '',
    reason: '',
    unitCost: 0,
    totalCost: 0,
    locationId: '',
    fromLocationId: '',
    toLocationId: '',
    batchNumber: '',
    expiryDate: '',
    serialNumber: '',
    supplierId: '',
    customerId: '',
    orderId: '',
    invoiceNumber: '',
    priority: 'NORMAL',
    status: 'PENDING',
    approvedBy: '',
    processedBy: '',
    department: '',
    project: '',
    costCenter: '',
    notes: '',
    attachments: [],
    isUrgent: false,
    requiresApproval: false,
    autoCalculateTotal: true
  })
  const [newProduct, setNewProduct] = useState({
    name: '',
    sku: '',
    description: '',
    shortDescription: '',
    unitPrice: 0,
    costPrice: 0,
    stockQuantity: 0,
    minStockLevel: 0,
    maxStockLevel: 0,
    reorderPoint: 0,
    category: '',
    categoryId: '',
    status: 'ACTIVE',
    type: 'PRODUCT', // PRODUCT, SERVICE, DIGITAL
    weight: 0,
    dimensions: {
      length: 0,
      width: 0,
      height: 0
    },
    taxRate: 0,
    taxInclusive: false,
    taxCode: '',
    taxExempt: false,
    barcode: '',
    tags: '',
    seoTitle: '',
    seoDescription: '',
    metaKeywords: '',
    isDigital: false,
    isService: false,
    isPhysical: true,
    trackInventory: true,
    allowBackorder: false,
    allowPreorder: false,
    preorderDate: '',
    warrantyPeriod: 0,
    warrantyUnit: 'MONTHS', // DAYS, WEEKS, MONTHS, YEARS
    returnPolicy: '',
    shippingClass: '',
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false,
    customFields: {},
    images: [],
    variants: [],
    relatedProducts: [],
    upsellProducts: [],
    crossSellProducts: [],
    // Additional fields to fix TypeScript errors
    brand: '',
    model: '',
    visibility: 'public',
    customField1: '',
    customField2: '',
    customField3: '',
    customField4: '',
    requiresLicense: false,
    hasExpiryDate: false,
    isBundle: false,
    notes: ''
  })
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    color: '#2563eb',
    icon: 'Package'
  })

  // Alert Settings
  const [showAlertSettingsDialog, setShowAlertSettingsDialog] = useState(false)
  const [alertSettings, setAlertSettings] = useState({
    lowStockThreshold: 5,
    overstockThreshold: 100,
    criticalStockThreshold: 1,
    emailNotifications: true,
    smsNotifications: false,
    dashboardAlerts: true,
    autoAcknowledgeDays: 7,
    dailyDigestTime: '09:00',
    weeklySummaryDay: 'MONDAY',
    weeklySummaryTime: '08:00',
    immediateAlerts: true,
    immediateAlertsCriticalOnly: true
  })

  // Transfer Management
  const [showNewTransferDialog, setShowNewTransferDialog] = useState(false)
  const [showViewTransferDialog, setShowViewTransferDialog] = useState(false)
  const [selectedTransfer, setSelectedTransfer] = useState<any>(null)
  const [newTransfer, setNewTransfer] = useState({
    productId: '',
    fromLocationId: '',
    toLocationId: '',
    quantity: 0,
    transferDate: new Date().toISOString().split('T')[0],
    transferTime: new Date().toTimeString().slice(0, 5),
    expectedDeliveryDate: '',
    reference: '',
    transferType: 'INTER_LOCATION',
    priority: 'NORMAL',
    status: 'PENDING',
    notes: '',
    requestedBy: '',
    approvedBy: '',
    processedBy: '',
    carrierName: '',
    trackingNumber: '',
    shippingCost: 0,
    packingMethod: '',
    specialInstructions: '',
    requiresApproval: false,
    isUrgent: false,
    insuranceValue: 0,
    fragile: false,
    temperatureControlled: false,
    batchNumber: '',
    serialNumbers: '',
    reasonCode: '',
    departmentFrom: '',
    departmentTo: '',
    projectCode: '',
    costCenter: '',
    internalNotes: ''
  })

  const { toast } = useToast()
  const queryClient = useQueryClient()

  // Setup demo authentication
  const { ready: authReady } = useDemoAuth('inventory')

  // Get company ID from localStorage or use default
  const getCompanyId = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('company_id') || localStorage.getItem('companyId') || ''
    }
    return ''
  }

  // Get tenant ID from localStorage or use default
  const getTenantId = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('tenant_id') || 'tenant_demo'
    }
    return 'tenant_demo'
  }

  const [companyId, setCompanyId] = useState<string>(getCompanyId())

  // Listen for company changes from header
  useEffect(() => {
    const handleStorageChange = () => {
      const newCompanyId = getCompanyId();
      if (newCompanyId && newCompanyId !== companyId) {
        console.log('🔄 Inventory page - Company changed from', companyId, 'to', newCompanyId);
        setCompanyId(newCompanyId);
      }
    };

    // Listen for localStorage changes
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events (in case localStorage doesn't trigger)
    const handleCompanyChange = (e: CustomEvent) => {
      const newCompanyId = e.detail.companyId;
      if (newCompanyId && newCompanyId !== companyId) {
        console.log('🔄 Inventory page - Company changed via custom event from', companyId, 'to', newCompanyId);
        setCompanyId(newCompanyId);
      }
    };
    
    window.addEventListener('companyChanged', handleCompanyChange as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('companyChanged', handleCompanyChange as EventListener);
    };
  }, [companyId]);

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
    enabled: true
  })

  // Fetch locations
  const locationsQuery = useQuery({
    queryKey: ['locations', companyId],
    queryFn: async () => {
      const locations = await inventoryApi.getLocations(companyId)
      console.log('Fetched locations:', locations)
      return locations
    },
    enabled: true
  })

  // Fetch categories
  const categoriesQuery = useQuery({
    queryKey: ['categories', companyId],
    queryFn: async () => {
      return await categoriesApi.getCategories(companyId)
    },
    enabled: true
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
    enabled: true
  })

  // Fetch alerts
  const alertsQuery = useQuery({
    queryKey: ['alerts', companyId],
    queryFn: async () => {
      return await inventoryApi.getAlerts({ companyId })
    },
    enabled: true
  })

  // Fetch alert settings
  useQuery({
    queryKey: ['alertSettings'],
    queryFn: async () => {
      const settings = await inventoryApi.getAlertSettings()
      setAlertSettings(settings)
      return settings
    },
    enabled: true
  })

  // Fetch transfers
  const transfersQuery = useQuery({
    queryKey: ['transfers', companyId],
    queryFn: async () => {
      return await inventoryApi.getTransfers({ companyId })
    },
    enabled: true
  })
  const transfers = Array.isArray(transfersQuery.data) ? transfersQuery.data : (transfersQuery.data?.items || [])

  // Fetch analytics
  const analyticsQuery = useQuery({
    queryKey: ['analytics', companyId, selectedPeriod],
    queryFn: async () => {
      return await inventoryApi.getAnalytics({
        companyId,
        period: selectedPeriod
      })
    },
    enabled: true
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
    enabled: true
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
    enabled: true
  })

  // Fetch AI insights
  const insightsQuery = useQuery({
    queryKey: ['insights', companyId, selectedPeriod],
    queryFn: async () => {

      const result = await inventoryApi.getForecastInsights({
        companyId,
        period: selectedPeriod
      });

      return result;
    },
    enabled: true
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
    enabled: true
  })

  // Show loading state if auth is not ready
  if (!authReady) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading inventory...</p>
          </div>
        </div>
      </PageLayout>
    )
  }

  const allProducts = productsQuery.data?.items || []
  const locations = locationsQuery.data || []
  const categories = categoriesQuery.data || []
  const movements = movementsQuery.data?.items || []
  const alerts = alertsQuery.data || []
  const analytics = analyticsQuery.data
  const kpis = kpisQuery.data
  const forecasts = forecastsQuery.data || []

  const insights = insightsQuery.data
  const recommendations = recommendationsQuery.data

  // Debug: Log what analytics API returns
  console.log('Analytics API Response:', analytics)
  console.log('Analytics Query Status:', {
    isLoading: analyticsQuery.isLoading,
    error: analyticsQuery.error,
    data: analyticsQuery.data
  })
  // Analytics data processed successfully
  // Filter products based on search and filters
  const products = allProducts.filter(product => {
    const matchesSearch = !searchTerm ||
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = selectedCategory === 'all' || product.categoryId === selectedCategory
    const matchesLocation = selectedLocation === 'all' ||
      product.locations?.some(loc => loc.locationId === selectedLocation)
    const matchesStatus = selectedStatus === 'all' || product.status === selectedStatus

    return matchesSearch && matchesCategory && matchesLocation && matchesStatus
  })

  const getStatusBadge = (product: any) => {
    const stock = Number(product.stockQuantity)
    if (stock <= 0) {
      return <Badge variant="destructive">Out of Stock</Badge>
    }
    if (stock <= 10) { // Simplified: low stock if <= 10 units
      return <Badge variant="secondary">Low Stock</Badge>
    }
    if (stock >= 100) { // Simplified: overstock if >= 100 units
      return <Badge variant="outline">Overstock</Badge>
    }
    return <Badge variant="default">In Stock</Badge>
  }

  // Product action handlers
  const handleViewProduct = (product: any) => {
    setSelectedProduct(product)
    setShowViewProductDialog(true)
  }

  const handleEditProduct = (product: any) => {
    setSelectedProduct(product)
    setNewProduct({
      // Core Information
      name: product.name || '',
      sku: product.sku || '',
      description: product.description || '',
      shortDescription: product.shortDescription || '',
      type: product.type || 'PRODUCT',
      
      // Pricing
      unitPrice: Number(product.unitPrice) || 0,
      costPrice: Number(product.costPrice) || 0,
      
      // Stock Management
      stockQuantity: Number(product.stockQuantity) || 0,
      minStockLevel: Number(product.minStockLevel) || 0,
      maxStockLevel: Number(product.maxStockLevel) || 0,
      reorderPoint: Number(product.reorderPoint) || 0,
      
      // Classification
      category: product.category || '',
      categoryId: product.categoryId || '',
      tags: product.tags || '',
      
      // Physical Properties
      weight: Number(product.weight) || 0,
      dimensions: product.dimensions || {
        length: 0,
        width: 0,
        height: 0
      },
      
      // Tax Information
      taxRate: Number(product.taxRate) || 0,
      taxInclusive: product.taxInclusive || false,
      taxCode: product.taxCode || '',
      taxExempt: product.taxExempt || false,
      
      // Identification
      barcode: product.barcode || '',
      
      // Product Type Flags
      isDigital: product.isDigital || false,
      isService: product.isService || false,
      isPhysical: product.isPhysical !== false,
      trackInventory: product.trackInventory !== false,
      
      // Business Rules
      allowBackorder: product.allowBackorder || false,
      allowPreorder: product.allowPreorder || false,
      preorderDate: product.preorderDate || '',
      
      // Marketing Features
      isFeatured: product.isFeatured || false,
      isBestSeller: product.isBestSeller || false,
      isNewArrival: product.isNewArrival || false,
      
      // Warranty & Returns
      warrantyPeriod: Number(product.warrantyPeriod) || 0,
      warrantyUnit: product.warrantyUnit || 'MONTHS',
      returnPolicy: product.returnPolicy || '',
      
      // Shipping
      shippingClass: product.shippingClass || '',
      
      // SEO
      seoTitle: product.seoTitle || '',
      seoDescription: product.seoDescription || '',
      metaKeywords: product.metaKeywords || '',
      
      // System Fields
      status: (product.status || 'ACTIVE').toUpperCase(),
      
      // Media & Extensions
      customFields: typeof product.customFields === 'string' ? JSON.parse(product.customFields || '{}') : (product.customFields || {}),
      images: typeof product.images === 'string' ? JSON.parse(product.images || '[]') : (product.images || []),
      variants: typeof product.variants === 'string' ? JSON.parse(product.variants || '[]') : (product.variants || []),
      relatedProducts: typeof product.relatedProducts === 'string' ? JSON.parse(product.relatedProducts || '[]') : (product.relatedProducts || []),
      upsellProducts: typeof product.upsellProducts === 'string' ? JSON.parse(product.upsellProducts || '[]') : (product.upsellProducts || []),
      crossSellProducts: typeof product.crossSellProducts === 'string' ? JSON.parse(product.crossSellProducts || '[]') : (product.crossSellProducts || []),
      
      // Additional fields
      brand: product.brand || '',
      model: product.model || '',
      visibility: product.visibility || 'public',
      customField1: product.customField1 || '',
      customField2: product.customField2 || '',
      customField3: product.customField3 || '',
      customField4: product.customField4 || '',
      requiresLicense: product.requiresLicense || false,
      hasExpiryDate: product.hasExpiryDate || false,
      isBundle: product.isBundle || false,
      notes: product.notes || ''
    })
    setShowEditProductDialog(true)
  }

  const generateQRCode = async (product: any) => {
    try {
      const qrData = {
        type: 'product',
        id: product.id,
        sku: product.sku,
        name: product.name,
        url: `${window.location.origin}/products/${product.id}`
      }

      const qrString = JSON.stringify(qrData)
      const qrCodeDataURL = await QRCode.toDataURL(qrString, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })

      setQrCodeImage(qrCodeDataURL)
    } catch (error) {

      toast({
        title: "Error",
        description: "Failed to generate QR code",
        variant: "destructive"
      })
    }
  }

  const handleQRCode = async (product: any) => {
    setSelectedProduct(product)
    setShowQRCodeDialog(true)
    await generateQRCode(product)
  }

  // Location action handlers
  const handleViewLocation = (location: any) => {
    console.log('Viewing location data:', location)
    setSelectedLocationForDialog(location)
    setShowViewLocationDialog(true)
  }

  const handleEditLocation = (location: any) => {
    setSelectedLocationForDialog(location)
    setNewLocation({
      name: location.name || '',
      code: location.code || '',
      description: location.description || '',
      locationType: location.locationType || 'WAREHOUSE',
      address: location.address || '',
      address2: location.address2 || '',
      city: location.city || '',
      state: location.state || '',
      country: location.country || '',
      postalCode: location.postalCode || '',
      latitude: location.latitude || '',
      longitude: location.longitude || '',
      contactName: location.contactName || '',
      contactPhone: location.contactPhone || '',
      contactEmail: location.contactEmail || '',
      managerName: location.managerName || '',
      managerEmail: location.managerEmail || '',
      managerPhone: location.managerPhone || '',
      isActive: location.isActive !== undefined ? location.isActive : true,
      isDefault: location.isDefault !== undefined ? location.isDefault : false,
      capacity: location.capacity || '',
      timezone: location.timezone || '',
      operatingHours: location.operatingHours || '',
      specialInstructions: location.specialInstructions || '',
      warehouseZone: location.warehouseZone || '',
      temperatureControlled: location.temperatureControlled !== undefined ? location.temperatureControlled : false,
      securityLevel: location.securityLevel || 'STANDARD',
      notes: location.notes || ''
    })
    setShowEditLocationDialog(true)
  }

  // Movement action handlers
  const handleViewMovement = (movement: any) => {
    setSelectedMovement(movement)
    setShowViewMovementDialog(true)
  }

  const handleCreateMovement = async () => {
    try {
      if (!newMovement.productId || !newMovement.quantity) {
        toast({
          title: "Validation Error",
          description: "Product and quantity are required",
          variant: "destructive"
        })
        return
      }

      // Frontend validation for OUTBOUND movements
      const selectedProduct = allProducts.find(p => p.id === newMovement.productId)
      if (['OUTBOUND', 'TRANSFER_OUT', 'ADJUSTMENT_OUT', 'RETURN_OUT', 'DAMAGE', 'THEFT'].includes(newMovement.movementType)) {
        const availableStock = Number(selectedProduct?.stockQuantity || 0)
        const requestedQty = Math.abs(newMovement.quantity)
        
        if (requestedQty > availableStock) {
          toast({
            title: "Insufficient Stock",
            description: `Available: ${availableStock}, Requested: ${requestedQty}`,
            variant: "destructive"
          })
          return
        }}

      // Validate unit cost for INBOUND/OUTBOUND
      if (['INBOUND', 'OUTBOUND'].includes(newMovement.movementType) && (!newMovement.unitCost || newMovement.unitCost <= 0)) {
        toast({
          title: "Unit Cost Required",
          description: "Unit cost must be greater than 0 for INBOUND and OUTBOUND movements",
          variant: "destructive"
        })
        return
      }

      await inventoryApi.createMovement({
        ...newMovement,
        movementDate: new Date(newMovement.movementDate).toISOString()
      })

      // If a location was selected, create/update product-location association
      if (newMovement.locationId) {
        try {
          await inventoryApi.createProductLocation({
            productId: newMovement.productId,
            locationId: newMovement.locationId,
            quantity: newMovement.quantity
          })
        } catch (locationError) {
         
        }
      }

      toast({
        title: "Success",
        description: "Movement created successfully",
      })

      // Reset form
      setNewMovement({
        productId: '',
        movementType: 'INBOUND' as 'INBOUND' | 'OUTBOUND' | 'TRANSFER_IN' | 'TRANSFER_OUT' | 'ADJUSTMENT_IN' | 'ADJUSTMENT_OUT' | 'RETURN_IN' | 'RETURN_OUT' | 'DAMAGE' | 'THEFT' | 'CYCLE_COUNT',
        quantity: 0,
        movementDate: new Date().toISOString().split('T')[0],
        reference: '',
        reason: '',
        unitCost: 0,
        locationId: ''
      } as any)

      setShowNewMovementDialog(false)

      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['movements'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['locations'] })
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
      queryClient.invalidateQueries({ queryKey: ['kpis'] })
    } catch (error: any) {
      console.error('Movement creation error:', error)
      
      let errorMessage = "Failed to create movement. Please try again."
      let errorTitle = "Error"
      
      // Handle API error responses
      if (error.response?.data) {
        const errorData = error.response.data
        
        if (errorData.error === 'insufficient_stock') {
          errorTitle = "Insufficient Stock"
          errorMessage = errorData.message || "Not enough stock available for this movement."
        } else if (errorData.error === 'unit_cost_required') {
          errorTitle = "Unit Cost Required"
          errorMessage = "Please enter a valid unit cost for this movement."
        } else if (errorData.error === 'invalid_quantity') {
          errorTitle = "Invalid Quantity"
          errorMessage = "Movement quantity must be greater than 0."
        } else if (errorData.error === 'product_not_found') {
          errorTitle = "Product Not Found"
          errorMessage = "The selected product was not found."
        } else if (errorData.message) {
          errorMessage = errorData.message
        }
      } else if (error.message && !error.message.includes('HTTP')) {
        errorMessage = error.message
      }

      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive"
      })
    }
  }

  // Refresh all data
  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['products'] })
    queryClient.invalidateQueries({ queryKey: ['locations'] })
    queryClient.invalidateQueries({ queryKey: ['movements'] })
    queryClient.invalidateQueries({ queryKey: ['alerts'] })
    queryClient.invalidateQueries({ queryKey: ['analytics'] })
    queryClient.invalidateQueries({ queryKey: ['kpis'] })
    queryClient.invalidateQueries({ queryKey: ['forecasts'] })
    queryClient.invalidateQueries({ queryKey: ['insights'] })
    queryClient.invalidateQueries({ queryKey: ['recommendations'] })

    toast({
      title: "Refreshed",
      description: "All data has been refreshed",
    })
  }

  const handleGenerateAlerts = async () => {
    try {
      const result = await inventoryApi.generateAlerts(companyId)
      toast({
        title: "Success",
        description: result.message,
      })
      // Refresh alerts
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
    } catch (error: any) {
     
      toast({
        title: "Error",
        description: error.message || "Failed to generate alerts",
        variant: "destructive"
      })
    }
  }

  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      await inventoryApi.acknowledgeAlert(alertId)
      toast({
        title: "Success",
        description: "Alert acknowledged",
      })
      // Refresh alerts
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
    } catch (error: any) {
     
      toast({
        title: "Error",
        description: error.message || "Failed to acknowledge alert",
        variant: "destructive"
      })
    }
  }

  const handleDismissAlert = async (alertId: string) => {
    try {
      await inventoryApi.dismissAlert(alertId)
      toast({
        title: "Success",
        description: "Alert dismissed",
      })
      // Refresh alerts
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
    } catch (error: any) {
     
      toast({
        title: "Error",
        description: error.message || "Failed to dismiss alert",
        variant: "destructive"
      })
    }
  }

  const handleSaveAlertSettings = async () => {
    try {
      await inventoryApi.updateAlertSettings(alertSettings)
      toast({
        title: "Success",
        description: "Alert settings saved successfully",
      })
      setShowAlertSettingsDialog(false)
      // Refresh settings
      queryClient.invalidateQueries({ queryKey: ['alertSettings'] })
    } catch (error: any) {
    
      toast({
        title: "Error",
        description: error.message || "Failed to save alert settings",
        variant: "destructive"
      })
    }
  }

  const handleCreateTransfer = async () => {
    try {
      if (!newTransfer.productId || !newTransfer.toLocationId || !newTransfer.quantity) {
        toast({
          title: "Validation Error",
          description: "Product, destination location, and quantity are required",
          variant: "destructive"
        })
        return
      }

      await inventoryApi.createTransfer({
        ...newTransfer,
        transferDate: new Date(newTransfer.transferDate).toISOString(),
        status: newTransfer.status as 'PENDING' | 'IN_TRANSIT' | 'COMPLETED' | 'CANCELLED'
      }).catch(err => {
        console.log('=== RAW API ERROR CAUGHT =====')
        console.log('Error object:', err)
        console.log('Error message:', err.message)
        console.log('Error response:', err.response)
        console.log('Error response data:', err.response?.data)
        console.log('Error details:', err.details)
        console.log('Error status:', err.status)
        console.log('================================')
        throw err // Re-throw to trigger the main catch block
      })

      toast({
        title: "Success",
        description: "Transfer created successfully",
      })

      // Reset form
      setNewTransfer({
        productId: '',
        fromLocationId: '',
        toLocationId: '',
        quantity: 0,
        transferDate: new Date().toISOString().split('T')[0],
        reference: '',
        notes: '',
        requestedBy: ''
      } as any)

      setShowNewTransferDialog(false)

      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['transfers'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['locations'] })
    } catch (error: any) {
      console.error('Transfer creation error:', error)
      
      let errorMessage = "Failed to create transfer"
      let errorTitle = "Error"
      
      // Handle API error responses with detailed messages
      if (error.response?.data) {
        const errorData = error.response.data
        
        if (errorData.error === 'insufficient_stock') {
          errorTitle = "Insufficient Stock"
          errorMessage = errorData.message || `Not enough stock available for this transfer.`
        } else if (errorData.error === 'same_location_transfer') {
          errorTitle = "Invalid Transfer"
          errorMessage = "Cannot transfer to the same location. Please select different locations."
        } else if (errorData.error === 'invalid_quantity') {
          errorTitle = "Invalid Quantity"
          errorMessage = "Transfer quantity must be greater than 0."
        } else if (errorData.error === 'missing_required_fields') {
          errorTitle = "Missing Information"
          errorMessage = "Please fill in all required fields."
        } else if (errorData.message) {
          errorMessage = errorData.message
        }
      } else if (error.message && !error.message.includes('HTTP')) {
        errorMessage = error.message
      }

      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive"
      })
    }
  }

  const handleUpdateTransferStatus = async (transferId: string, status: string) => {
    try {
      await inventoryApi.updateTransferStatus(transferId, status)
      toast({
        title: "Success",
        description: `Transfer ${status.toLowerCase()} successfully`,
      })
      // Refresh transfers
      queryClient.invalidateQueries({ queryKey: ['transfers'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['locations'] })
    } catch (error: any) {
      console.error('Transfer status update error:', error)
      
      let errorMessage = "Failed to update transfer status"
      let errorTitle = "Error"
      
      // Handle API error responses
      if (error.response?.data) {
        const errorData = error.response.data
        errorMessage = errorData.message || errorData.error || errorMessage
        
        if (errorData.error === 'insufficient_stock') {
          errorTitle = "Insufficient Stock"
        } else if (errorData.error === 'transfer_not_found') {
          errorTitle = "Transfer Not Found"
        }
      } else if (error.message && !error.message.includes('HTTP')) {
        errorMessage = error.message
      }

      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive"
      })
    }
  }

  const handleViewTransfer = (transfer: any) => {
    setSelectedTransfer(transfer)
    setShowViewTransferDialog(true)
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

  const getTransferStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="secondary">Pending</Badge>
      case 'IN_TRANSIT':
        return <Badge variant="default">In Transit</Badge>
      case 'COMPLETED':
        return <Badge variant="default" className="bg-green-100 text-green-800">Completed</Badge>
      case 'CANCELLED':
        return <Badge variant="destructive">Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
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
    <PageLayout>
      <div className="space-y-6">
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
            <Button variant="outline" onClick={handleRefresh}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={() => setShowAddProductDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </div>
        </div>


        {/* Analytics Overview */}
        {analyticsQuery.isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <RefreshCw className="w-5 h-5 text-gray-400 animate-spin" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Loading...</p>
                      <p className="text-xl font-bold">-</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : analyticsQuery.error ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Error loading analytics</p>
                    <p className="text-xl font-bold">-</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : analytics ? (
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
                    <p className="text-xl font-bold">{analytics?.lowStockItems || 0}</p>
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
                    <p className="text-xl font-bold">{analytics?.outOfStockItems || 0}</p>
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
                    <p className="text-xl font-bold">{allProducts?.length || 0}</p>
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
                    <p className="text-xl font-bold">{locations?.length || 0}</p>
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
                    <p className="text-xl font-bold">{movements?.length || 0}</p>
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
                    <p className="text-xl font-bold">{alerts?.length || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* KPI Cards */}
        {kpisQuery.isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <RefreshCw className="w-5 h-5 text-gray-400 animate-spin" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Loading...</p>
                      <p className="text-xl font-bold">-</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : kpisQuery.error ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Error loading KPIs</p>
                    <p className="text-xl font-bold">-</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : kpis ? (
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
              <CardContent className="p-4 ">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-cyan-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Carrying Cost</p>
                    <p className="text-md font-bold">${kpis?.carryingCost?.toFixed(0) || '0'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}

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
                        {categories.map(category => (
                          <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
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
                  {productsQuery.isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                      <span className="text-sm text-gray-500">Loading products...</span>
                    </div>
                  ) : productsQuery.error ? (
                    <div className="flex items-center justify-center py-8 text-red-600">
                      <AlertTriangle className="h-6 w-6 mr-2" />
                      <span className="text-sm">Error loading products: {productsQuery.error?.message || productsQuery.error?.toString() || 'Unknown error'}</span>
                    </div>
                  ) : products?.length === 0 ? (
                    <div className="flex items-center justify-center py-8 text-gray-500">
                      <Package className="h-8 w-8 mr-2" />
                      <span className="text-sm">No products found</span>
                    </div>
                  ) : (
                    products.map((product) => (
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
                              {product.sku} • {categories.find(c => c.id === product.categoryId)?.name || 'Uncategorized'}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {(product.type || 'PRODUCT') === 'PRODUCT' ? 'Inventory' : 'Non-Inventory'}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {product.status}
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
                            <p className="font-medium">{Number(product.stockQuantity)}</p>
                            <p className="text-xs text-muted-foreground">Available</p>
                          </div>
                          <div className="text-center">
                            <p className="font-medium">${Number(product.unitPrice).toFixed(2)}</p>
                            <p className="text-xs text-muted-foreground">Unit Price</p>
                          </div>
                          <div className="text-center">
                            <p className="font-medium">${(Number(product.stockQuantity) * Number(product.costPrice)).toFixed(2)}</p>
                            <p className="text-xs text-muted-foreground">Total Value</p>
                          </div>
                          {getStatusBadge(product)}
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" onClick={() => handleViewProduct(product)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleEditProduct(product)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleQRCode(product)}>
                              <QrCode className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
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
                  <Button onClick={() => setShowAddLocationDialog(true)}>
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
                          <p className="font-medium">{location._count?.products || 0}</p>
                          <p className="text-xs text-muted-foreground">Products</p>
                        </div>
                        <div className="text-center">
                          <p className="font-medium">
                            {allProducts
                              .filter(p => p.locations?.some(loc => loc.locationId === location.id))
                              .reduce((total, p) => {
                                const locationData = p.locations?.find(loc => loc.locationId === location.id)
                                return total + Number(locationData?.stockQuantity || 0)
                              }, 0)
                            }
                          </p>
                          <p className="text-xs text-muted-foreground">Total Stock</p>
                        </div>
                        <div className="text-center">
                          <p className="font-medium">
                            $
                            {allProducts
                              .filter(p => p.locations?.some(loc => loc.locationId === location.id))
                              .reduce((total, p) => {
                                const locationData = p.locations?.find(loc => loc.locationId === location.id)
                                const quantity = Number(locationData?.stockQuantity || 0)
                                return total + (quantity * Number(p.costPrice || 0))
                              }, 0)
                              .toFixed(2)
                            }
                          </p>
                          <p className="text-xs text-muted-foreground">Stock Value</p>
                        </div>
                        <div className="text-center">
                          <p className="font-medium">{location._count.movements}</p>
                          <p className="text-sm text-muted-foreground">Movements</p>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleViewLocation(location)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleEditLocation(location)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
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
                  <Button onClick={() => setShowNewMovementDialog(true)}>
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
                            <p className="font-medium">${Number(movement.unitCost || 0).toFixed(2)}</p>
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
                        <Button variant="ghost" size="sm" onClick={() => handleViewMovement(movement)}>
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
                  <CardTitle>Inventory Alerts</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={handleGenerateAlerts}
                      disabled={alertsQuery.isLoading}
                    >
                      <RefreshCw className={`w-4 h-4 mr-2 ${alertsQuery.isLoading ? 'animate-spin' : ''}`} />
                      Generate Alerts
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowAlertSettingsDialog(true)}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Alert Settings
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {alertsQuery.isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    <span className="text-sm text-muted-foreground">Loading alerts...</span>
                  </div>
                ) : alerts?.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">No alerts found</p>
                    <p className="text-sm">Generate alerts to see inventory warnings and recommendations</p>
                    <Button
                      className="mt-4"
                      onClick={handleGenerateAlerts}
                      disabled={alertsQuery.isLoading}
                    >
                      <RefreshCw className={`w-4 h-4 mr-2 ${alertsQuery.isLoading ? 'animate-spin' : ''}`} />
                      Generate Alerts
                    </Button>
                  </div>
                ) : (
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
                            {alert.message && (
                              <p className="text-xs text-muted-foreground mt-1 italic">
                                {alert.message}
                              </p>
                            )}
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
                          <div className="flex gap-1">
                            {alert.status === 'PENDING' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleAcknowledgeAlert(alert.id)}
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDismissAlert(alert.id)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transfers Tab */}
          <TabsContent value="transfers" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Inventory Transfers</CardTitle>
                  <Button onClick={() => setShowNewTransferDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    New Transfer
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {transfersQuery.isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    <span className="text-sm text-muted-foreground">Loading transfers...</span>
                  </div>
                ) : transfers?.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <ArrowRightLeft className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">No transfers found</p>
                    <p className="text-sm">Create your first inventory transfer between locations</p>
                    <Button
                      className="mt-4"
                      onClick={() => setShowNewTransferDialog(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      New Transfer
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {transfers.map((transfer: any) => (
                      <div
                        key={transfer.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <ArrowRightLeft className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">{transfer.product.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {transfer.product.sku} • {transfer.quantity} units
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {transfer.fromLocation ?
                                `${transfer.fromLocation.name} → ${transfer.toLocation.name}` :
                                `→ ${transfer.toLocation.name}`
                              }
                            </p>
                            {transfer.reference && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Ref: {transfer.reference}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {getTransferStatusBadge(transfer.status)}
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              {new Date(transfer.transferDate).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {transfer.requestedBy && `by ${transfer.requestedBy}`}
                            </p>
                          </div>
                          <div className="flex gap-1">
                            {transfer.status === 'PENDING' && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleUpdateTransferStatus(transfer.id, 'IN_TRANSIT')}
                                >
                                  <ArrowRight className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleUpdateTransferStatus(transfer.id, 'CANCELLED')}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                            {transfer.status === 'IN_TRANSIT' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleUpdateTransferStatus(transfer.id, 'COMPLETED')}
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewTransfer(transfer)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
                          <p className="font-medium">${(Number(product.stockQuantity) * Number(product.costPrice)).toFixed(2)}</p>
                          <p className="text-sm text-muted-foreground">{Number(product.stockQuantity)} units</p>
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
                    {(analytics?.categoryBreakdown || []).length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">No category data available</p>
                    ) : (
                      (analytics?.categoryBreakdown || []).map((category: any, index: number) => (
                        <div key={category.categoryId || `uncategorized-${index}`} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{category.category || 'Uncategorized'}</p>
                            <p className="text-sm text-muted-foreground">{category._count?.categoryId || 0} products</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{category._sum?.stockQuantity || 0}</p>
                            <p className="text-sm text-muted-foreground">units</p>
                          </div>
                        </div>
                      ))
                    )}
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
              categories={categories}
              alerts={alerts}
              analytics={analytics}
              kpis={kpis}
              onRefresh={() => {
                queryClient.invalidateQueries({ queryKey: ['products'] })
                queryClient.invalidateQueries({ queryKey: ['movements'] })
                queryClient.invalidateQueries({ queryKey: ['analytics'] })
                queryClient.invalidateQueries({ queryKey: ['categories'] })
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
              forecasts={forecasts || []}
              insights={insights || {}}
              recommendations={Array.isArray(recommendations) ? recommendations : []}
              products={allProducts}
              movements={movements}
              alerts={alerts}
              onRefresh={() => {
                queryClient.invalidateQueries({ queryKey: ['forecasts'] })
                queryClient.invalidateQueries({ queryKey: ['insights'] })
                queryClient.invalidateQueries({ queryKey: ['recommendations'] })
                queryClient.invalidateQueries({ queryKey: ['alerts'] })
              }}
            />
          </TabsContent>
        </Tabs>

        {/* Add Product Dialog */}
        <Dialog open={showAddProductDialog} onOpenChange={setShowAddProductDialog}>
          <DialogContent className="!max-w-7xl max-h-[95vh] overflow-y-auto w-[95vw] md:max-h-[90vh] md:w-[90vw] bg-gradient-to-br from-slate-50 to-slate-100/50">
            <DialogHeader className="pb-6 border-b border-slate-200">
              <DialogTitle className="flex items-center gap-3 text-2xl font-bold text-slate-800">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl text-white shadow-lg">
                  <Package className="w-6 h-6" />
                </div>
                Add New Product
              </DialogTitle>
              <DialogDescription className="text-slate-600 text-base mt-2">
                Create a comprehensive product profile with all essential details for your inventory and sales
              </DialogDescription>
              
              {/* Progress Indicator */}
              <div className="flex items-center justify-between mt-4 px-4 py-3 bg-white/50 rounded-lg border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="text-sm font-medium text-slate-700">Step 1 of 6</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Required fields marked with</span>
                  <span className="text-red-500 font-bold">*</span>
                </div>
              </div>
            </DialogHeader>
            
            <Tabs defaultValue="basic" className="w-full mt-6">
              <TabsList className="grid w-full grid-cols-6 bg-white shadow-sm border border-slate-200 rounded-xl p-1">
                <TabsTrigger value="basic" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    <span className="hidden sm:block">Basic Info</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger value="pricing" className="data-[state=active]:bg-green-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    <span className="hidden sm:block">Pricing</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger value="inventory" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    <span className="hidden sm:block">Inventory</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger value="shipping" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span className="hidden sm:block">Shipping</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger value="seo" className="data-[state=active]:bg-pink-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    <span className="hidden sm:block">Marketing</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger value="advanced" className="data-[state=active]:bg-slate-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    <span className="hidden sm:block">Advanced</span>
                  </div>
                </TabsTrigger>
              </TabsList>

              {/* Basic Information Tab */}
              <TabsContent value="basic" className="space-y-8 mt-6">
                {/* Essential Information Card */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Package className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800">Essential Information</h3>
                      <p className="text-sm text-slate-600">Core product details required for identification</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="name" className="flex items-center gap-2 text-sm font-medium text-slate-700">
                        Product Name <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="name"
                          value={newProduct.name}
                          onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                          placeholder="e.g., MacBook Pro 14-inch"
                          className={`pl-4 pr-4 py-3 text-base transition-all duration-200 ${
                            newProduct.name?.trim() 
                              ? 'border-green-300 bg-green-50/30' 
                              : 'border-slate-300 focus:border-blue-400'
                          }`}
                        />
                        {newProduct.name?.trim() && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <Check className="w-4 h-4 text-green-500" />
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">This will be displayed to customers</p>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="sku" className="flex items-center gap-2 text-sm font-medium text-slate-700">
                        SKU (Stock Keeping Unit) <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="sku"
                          value={newProduct.sku}
                          onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value.toUpperCase() })}
                          placeholder="e.g., MBP-14-256-SLV"
                          className={`pl-4 pr-12 py-3 text-base font-mono transition-all duration-200 ${
                            newProduct.sku?.trim() 
                              ? 'border-green-300 bg-green-50/30' 
                              : 'border-slate-300 focus:border-blue-400'
                          }`}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                          onClick={() => {
                            const randomSku = `PRD-${Date.now().toString().slice(-6)}`
                            setNewProduct({ ...newProduct, sku: randomSku })
                          }}
                        >
                          <RefreshCw className="w-3 h-3" />
                        </Button>
                      </div>
                      <p className="text-xs text-slate-500">Unique identifier for inventory tracking</p>
                    </div>
                  </div>
                </div>

                {/* Product Classification Card */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Filter className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800">Product Classification</h3>
                      <p className="text-sm text-slate-600">Categorize and define your product type</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="category" className="text-sm font-medium text-slate-700">Category</Label>
                      <Select
                        value={newProduct.categoryId || ''}
                        onValueChange={(value) => {
                          if (value === 'create-new') {
                            setShowAddCategoryDialog(true)
                          } else {
                            setNewProduct({ ...newProduct, categoryId: value })
                          }
                        }}
                      >
                        <SelectTrigger className="py-3 text-base border-slate-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all duration-200">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id} className="py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                {category.name}
                              </div>
                            </SelectItem>
                          ))}
                          <SelectItem value="create-new" className="py-3 border-t border-slate-200 mt-2">
                            <div className="flex items-center gap-2 text-blue-600">
                              <Plus className="w-4 h-4" />
                              <span className="font-medium">Create New Category</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Enhanced Product Type Field - Full Width */}
                  <div className="space-y-3">
                    <Label htmlFor="type" className="text-sm font-medium text-slate-700">Product Type</Label>
                    <Select 
                      value={newProduct.type} 
                      onValueChange={(value) => setNewProduct({ ...newProduct, type: value })}
                    >
                      <SelectTrigger className="py-4 text-base border-slate-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all duration-200 h-auto min-h-[60px]">
                        <SelectValue placeholder="Select product type" />
                      </SelectTrigger>
                      <SelectContent className="w-full">
                        <SelectItem value="PRODUCT" className="py-4 cursor-pointer hover:bg-blue-50">
                          <div className="flex items-center gap-4 w-full">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <Package className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-base text-slate-900">Physical Product</div>
                              <div className="text-sm text-slate-600 mt-1">Tangible items that require shipping and inventory tracking</div>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="SERVICE" className="py-4 cursor-pointer hover:bg-purple-50">
                          <div className="flex items-center gap-4 w-full">
                            <div className="p-2 bg-purple-100 rounded-lg">
                              <Settings className="w-5 h-5 text-purple-600" />
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-base text-slate-900">Service</div>
                              <div className="text-sm text-slate-600 mt-1">Time-based services, consultations, or labor</div>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="DIGITAL" className="py-4 cursor-pointer hover:bg-green-50">
                          <div className="flex items-center gap-4 w-full">
                            <div className="p-2 bg-green-100 rounded-lg">
                              <Activity className="w-5 h-5 text-green-600" />
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-base text-slate-900">Digital Product</div>
                              <div className="text-sm text-slate-600 mt-1">Downloads, software, licenses, or digital content</div>
                            </div>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-slate-500 mt-2">Choose the type that best describes your product for proper handling and display</p>
                  </div>
                </div>

                {/* Product Description Card */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Edit className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800">Product Descriptions</h3>
                      <p className="text-sm text-slate-600">Help customers understand your product</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Label htmlFor="shortDescription" className="text-sm font-medium text-slate-700">
                        Short Description
                        <span className="ml-2 text-xs text-slate-500">(appears in product listings)</span>
                      </Label>
                      <Input
                        id="shortDescription"
                        value={newProduct.shortDescription}
                        onChange={(e) => setNewProduct({ ...newProduct, shortDescription: e.target.value })}
                        placeholder="Brief, compelling product summary..."
                        className="py-3 text-base border-slate-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all duration-200"
                        maxLength={160}
                      />
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500">Keep it concise and engaging</span>
                        <span className={`${newProduct.shortDescription?.length > 140 ? 'text-orange-500' : 'text-slate-400'}`}>
                          {newProduct.shortDescription?.length || 0}/160
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="description" className="text-sm font-medium text-slate-700">
                        Full Description
                        <span className="ml-2 text-xs text-slate-500">(detailed product information)</span>
                      </Label>
                      <Textarea
                        id="description"
                        value={newProduct.description}
                        onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                        placeholder="Detailed product description, features, benefits, specifications..."
                        rows={4}
                        className="text-base resize-none border-slate-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all duration-200"
                      />
                      <p className="text-xs text-slate-500">Include features, benefits, and specifications customers need to know</p>
                    </div>
                  </div>
                </div>

                {/* Additional Details Card */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <QrCode className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800">Additional Details</h3>
                      <p className="text-sm text-slate-600">Tags, barcodes, and other identifiers</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="tags" className="text-sm font-medium text-slate-700">
                        Tags
                        <span className="ml-2 text-xs text-slate-500">(for search and filtering)</span>
                      </Label>
                      <Input
                        id="tags"
                        value={newProduct.tags}
                        onChange={(e) => setNewProduct({ ...newProduct, tags: e.target.value })}
                        placeholder="laptop, electronics, apple, premium"
                        className="py-3 text-base border-slate-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all duration-200"
                      />
                      <p className="text-xs text-slate-500">Separate tags with commas - helps customers find your product</p>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="barcode" className="text-sm font-medium text-slate-700">
                        Barcode/UPC
                        <span className="ml-2 text-xs text-slate-500">(optional)</span>
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id="barcode"
                          value={newProduct.barcode}
                          onChange={(e) => setNewProduct({ ...newProduct, barcode: e.target.value })}
                          placeholder="Enter or scan barcode"
                          className="py-3 text-base font-mono border-slate-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all duration-200"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="px-4 py-3"
                        >
                          <QrCode className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-slate-500">For inventory scanning and POS systems</p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Pricing & Tax Tab */}
              <TabsContent value="pricing" className="space-y-8 mt-6">
                {/* Pricing Information Card */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <DollarSign className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800">Pricing Information</h3>
                      <p className="text-sm text-slate-600">Set your selling price and cost structure</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="unitPrice" className="flex items-center gap-2 text-sm font-medium text-slate-700">
                        Selling Price <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">$</div>
                        <Input
                          id="unitPrice"
                          type="number"
                          step="0.01"
                          min="0"
                          value={newProduct.unitPrice || ''}
                          onChange={(e) => setNewProduct({ ...newProduct, unitPrice: parseFloat(e.target.value) || 0 })}
                          placeholder="0.00"
                          className={`pl-8 pr-4 py-3 text-base font-semibold transition-all duration-200 ${
                            newProduct.unitPrice > 0 
                              ? 'border-green-300 bg-green-50/30' 
                              : 'border-slate-300 focus:border-green-400'
                          }`}
                        />
                      </div>
                      <p className="text-xs text-slate-500">The price customers will pay</p>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="costPrice" className="text-sm font-medium text-slate-700">
                        Cost Price
                        <span className="ml-2 text-xs text-slate-500">(your cost)</span>
                      </Label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">$</div>
                        <Input
                          id="costPrice"
                          type="number"
                          step="0.01"
                          min="0"
                          value={newProduct.costPrice || ''}
                          onChange={(e) => setNewProduct({ ...newProduct, costPrice: parseFloat(e.target.value) || 0 })}
                          placeholder="0.00"
                          className="pl-8 pr-4 py-3 text-base border-slate-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all duration-200"
                        />
                      </div>
                      <p className="text-xs text-slate-500">What you pay for this product</p>
                    </div>
                  </div>

                  {/* Profit Margin Calculator */}
                  {newProduct.unitPrice > 0 && newProduct.costPrice > 0 && (
                    <div className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-semibold text-slate-800">Profit Analysis</h4>
                          <div className="flex items-center gap-4 mt-2">
                            <div className="text-xs">
                              <span className="text-slate-600">Profit: </span>
                              <span className="font-semibold text-green-600">
                                ${(newProduct.unitPrice - newProduct.costPrice).toFixed(2)}
                              </span>
                            </div>
                            <div className="text-xs">
                              <span className="text-slate-600">Margin: </span>
                              <span className="font-semibold text-blue-600">
                                {(((newProduct.unitPrice - newProduct.costPrice) / newProduct.unitPrice) * 100).toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        </div>
                        <PieChart className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Tax Configuration Card */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Calculator className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800">Tax Configuration</h3>
                      <p className="text-sm text-slate-600">Set up tax rates and preferences</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="taxRate" className="text-sm font-medium text-slate-700">Tax Rate</Label>
                      <div className="relative">
                        <Input
                          id="taxRate"
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          value={newProduct.taxRate || ''}
                          onChange={(e) => setNewProduct({ ...newProduct, taxRate: parseFloat(e.target.value) || 0 })}
                          placeholder="0.00"
                          className="pr-8 py-3 text-base border-slate-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all duration-200"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">%</div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="taxCode" className="text-sm font-medium text-slate-700">Tax Code</Label>
                      <Select 
                        value={newProduct.taxCode || ''} 
                        onValueChange={(value) => setNewProduct({ ...newProduct, taxCode: value })}
                      >
                        <SelectTrigger className="py-3 text-base border-slate-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all duration-200">
                          <SelectValue placeholder="Select tax code" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="STANDARD">Standard Tax</SelectItem>
                          <SelectItem value="GST">GST (Goods & Services Tax)</SelectItem>
                          <SelectItem value="VAT">VAT (Value Added Tax)</SelectItem>
                          <SelectItem value="SALES_TAX">Sales Tax</SelectItem>
                          <SelectItem value="EXCISE">Excise Tax</SelectItem>
                          <SelectItem value="IMPORT_DUTY">Import Duty</SelectItem>
                          <SelectItem value="LUXURY_TAX">Luxury Tax</SelectItem>
                          <SelectItem value="ZERO_RATED">Zero-Rated</SelectItem>
                          <SelectItem value="EXEMPT">Tax Exempt</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-slate-500 mt-1">Classification for tax reporting and compliance</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-slate-700">Tax Configuration</Label>
                      <div className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg">
                        <input
                          type="checkbox"
                          id="taxInclusive"
                          checked={newProduct.taxInclusive}
                          onChange={(e) => setNewProduct({ ...newProduct, taxInclusive: e.target.checked })}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <div>
                          <Label htmlFor="taxInclusive" className="text-sm font-medium cursor-pointer">Price includes tax</Label>
                          <p className="text-xs text-slate-500">Tax is already included in the selling price</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-slate-700">Tax Exemption</Label>
                      <div className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                        <input
                          type="checkbox"
                          id="taxExempt"
                          checked={newProduct.taxExempt}
                          onChange={(e) => setNewProduct({ ...newProduct, taxExempt: e.target.checked })}
                          className="w-5 h-5 text-blue-600 bg-white border-2 border-slate-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
                        />
                        <div className="flex-1">
                          <Label htmlFor="taxExempt" className="text-sm font-medium cursor-pointer text-slate-800">Tax exempt product</Label>
                          <p className="text-xs text-slate-500 mt-1">This product is exempt from all taxes</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tax Preview */}
                  {newProduct.unitPrice > 0 && (
                    <div className="mt-6 p-4 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg border border-yellow-200">
                      <div className="flex items-center gap-2 mb-3">
                        <Calculator className="w-4 h-4 text-yellow-600" />
                        <h4 className="text-sm font-semibold text-slate-800">Tax Calculation Preview</h4>
                        {newProduct.taxCode && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                            {newProduct.taxCode}
                          </span>
                        )}
                      </div>
                      
                      {newProduct.taxExempt ? (
                        <div className="text-center py-3">
                          <div className="inline-flex items-center gap-2 px-3 py-2 bg-green-100 text-green-800 rounded-lg">
                            <Shield className="w-4 h-4" />
                            <span className="font-medium">Tax Exempt Product</span>
                          </div>
                          <p className="text-sm text-slate-600 mt-2">No tax will be applied to this product</p>
                        </div>
                      ) : newProduct.taxRate > 0 ? (
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          {newProduct.taxInclusive ? (
                            <>
                              <div>
                                <span className="text-slate-600">Price (tax inclusive): </span>
                                <span className="font-semibold">${Number(newProduct.unitPrice).toFixed(2)}</span>
                              </div>
                              <div>
                                <span className="text-slate-600">Tax amount ({newProduct.taxRate}%): </span>
                                <span className="font-semibold text-yellow-600">
                                  ${((Number(newProduct.unitPrice) * Number(newProduct.taxRate)) / (100 + Number(newProduct.taxRate))).toFixed(2)}
                                </span>
                              </div>
                              <div className="col-span-2 pt-2 border-t border-yellow-200">
                                <span className="text-slate-600">Net price (excluding tax): </span>
                                <span className="font-bold text-slate-800">
                                  ${(Number(newProduct.unitPrice) - ((Number(newProduct.unitPrice) * Number(newProduct.taxRate)) / (100 + Number(newProduct.taxRate)))).toFixed(2)}
                                </span>
                              </div>
                            </>
                          ) : (
                            <>
                              <div>
                                <span className="text-slate-600">Base price: </span>
                                <span className="font-semibold">${Number(newProduct.unitPrice).toFixed(2)}</span>
                              </div>
                              <div>
                                <span className="text-slate-600">Tax amount ({newProduct.taxRate}%): </span>
                                <span className="font-semibold text-yellow-600">
                                  ${(Number(newProduct.unitPrice) * (Number(newProduct.taxRate) / 100)).toFixed(2)}
                                </span>
                              </div>
                              <div className="col-span-2 pt-2 border-t border-yellow-200">
                                <span className="text-slate-600">Total price (including tax): </span>
                                <span className="font-bold text-slate-800">
                                  ${(Number(newProduct.unitPrice) * (1 + Number(newProduct.taxRate) / 100)).toFixed(2)}
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-3">
                          <div className="inline-flex items-center gap-2 px-3 py-2 bg-slate-100 text-slate-600 rounded-lg">
                            <AlertCircle className="w-4 h-4" />
                            <span>No tax rate specified</span>
                          </div>
                          <p className="text-sm text-slate-500 mt-2">Enter a tax rate to see calculations</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Product Promotion Flags Card */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-pink-100 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-pink-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800">Marketing & Promotion</h3>
                      <p className="text-sm text-slate-600">Set special product badges and promotion flags</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                      <input
                        type="checkbox"
                        id="isFeatured"
                        checked={newProduct.isFeatured}
                        onChange={(e) => setNewProduct({ ...newProduct, isFeatured: e.target.checked })}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div>
                        <Label htmlFor="isFeatured" className="text-sm font-medium cursor-pointer flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          Featured Product
                        </Label>
                        <p className="text-xs text-slate-500 mt-1">Highlight in featured sections</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                      <input
                        type="checkbox"
                        id="isBestSeller"
                        checked={newProduct.isBestSeller}
                        onChange={(e) => setNewProduct({ ...newProduct, isBestSeller: e.target.checked })}
                        className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
                      />
                      <div>
                        <Label htmlFor="isBestSeller" className="text-sm font-medium cursor-pointer flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          Best Seller
                        </Label>
                        <p className="text-xs text-slate-500 mt-1">Popular choice badge</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                      <input
                        type="checkbox"
                        id="isNewArrival"
                        checked={newProduct.isNewArrival}
                        onChange={(e) => setNewProduct({ ...newProduct, isNewArrival: e.target.checked })}
                        className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
                      />
                      <div>
                        <Label htmlFor="isNewArrival" className="text-sm font-medium cursor-pointer flex items-center gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          New Arrival
                        </Label>
                        <p className="text-xs text-slate-500 mt-1">Recently added product</p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Inventory Tab */}
              <TabsContent value="inventory" className="space-y-8 mt-6">
                {/* Stock Management Card */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <BarChart3 className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800">Stock Management</h3>
                      <p className="text-sm text-slate-600">Set initial stock and inventory thresholds</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="stockQuantity" className="text-sm font-medium text-slate-700">
                        Initial Stock Quantity
                      </Label>
                      <div className="relative">
                        <Input
                          id="stockQuantity"
                          type="number"
                          min="0"
                          step="1"
                          value={newProduct.stockQuantity || ''}
                          onChange={(e) => setNewProduct({ ...newProduct, stockQuantity: parseFloat(e.target.value) || 0 })}
                          placeholder="0"
                          className="pr-12 py-3 text-base border-slate-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all duration-200"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">units</div>
                      </div>
                      <p className="text-xs text-slate-500">How many units you currently have in stock</p>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="reorderPoint" className="text-sm font-medium text-slate-700">
                        Reorder Point
                        <span className="ml-2 text-xs text-slate-500">(alert threshold)</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="reorderPoint"
                          type="number"
                          min="0"
                          step="1"
                          value={newProduct.reorderPoint || ''}
                          onChange={(e) => setNewProduct({ ...newProduct, reorderPoint: parseFloat(e.target.value) || 0 })}
                          placeholder="0"
                          className="pr-12 py-3 text-base border-slate-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all duration-200"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">units</div>
                      </div>
                      <p className="text-xs text-slate-500">Get notified when stock reaches this level</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                    <div className="space-y-3">
                      <Label htmlFor="minStockLevel" className="text-sm font-medium text-slate-700">
                        Minimum Stock Level
                      </Label>
                      <div className="relative">
                        <Input
                          id="minStockLevel"
                          type="number"
                          min="0"
                          step="1"
                          value={newProduct.minStockLevel || ''}
                          onChange={(e) => setNewProduct({ ...newProduct, minStockLevel: parseFloat(e.target.value) || 0 })}
                          placeholder="0"
                          className="pr-12 py-3 text-base border-slate-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all duration-200"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">units</div>
                      </div>
                      <p className="text-xs text-slate-500">Never let stock go below this amount</p>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="maxStockLevel" className="text-sm font-medium text-slate-700">
                        Maximum Stock Level
                        <span className="ml-2 text-xs text-slate-500">(storage capacity)</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="maxStockLevel"
                          type="number"
                          min="0"
                          step="1"
                          value={newProduct.maxStockLevel || ''}
                          onChange={(e) => setNewProduct({ ...newProduct, maxStockLevel: parseFloat(e.target.value) || 0 })}
                          placeholder="0"
                          className="pr-12 py-3 text-base border-slate-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all duration-200"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">units</div>
                      </div>
                      <p className="text-xs text-slate-500">Maximum units you can store</p>
                    </div>
                  </div>

                  {/* Stock Level Indicator */}
                  {newProduct.stockQuantity > 0 && newProduct.reorderPoint > 0 && (
                    <div className="mt-6 p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold text-slate-800">Stock Status</h4>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          newProduct.stockQuantity <= newProduct.reorderPoint 
                            ? 'bg-red-100 text-red-700' 
                            : newProduct.stockQuantity <= (newProduct.reorderPoint * 2) 
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-green-100 text-green-700'
                        }`}>
                          {newProduct.stockQuantity <= newProduct.reorderPoint 
                            ? 'Low Stock' 
                            : newProduct.stockQuantity <= (newProduct.reorderPoint * 2) 
                              ? 'Normal'
                              : 'Well Stocked'
                          }
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-slate-600">Current:</span>
                        <span className="font-semibold">{newProduct.stockQuantity} units</span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-600">Reorder at:</span>
                        <span className="font-semibold">{newProduct.reorderPoint} units</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Inventory Settings Card */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Settings className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800">Inventory Settings</h3>
                      <p className="text-sm text-slate-600">Configure how this product behaves in inventory</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                      <input
                        type="checkbox"
                        id="trackInventory"
                        checked={newProduct.trackInventory}
                        onChange={(e) => setNewProduct({ ...newProduct, trackInventory: e.target.checked })}
                        className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <Label htmlFor="trackInventory" className="text-sm font-medium cursor-pointer flex items-center gap-2">
                          <Activity className="w-4 h-4 text-blue-600" />
                          Track Inventory
                        </Label>
                        <p className="text-xs text-slate-500 mt-1">Monitor stock levels and movements for this product</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                      <input
                        type="checkbox"
                        id="allowBackorder"
                        checked={newProduct.allowBackorder}
                        onChange={(e) => setNewProduct({ ...newProduct, allowBackorder: e.target.checked })}
                        className="w-5 h-5 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500"
                      />
                      <div className="flex-1">
                        <Label htmlFor="allowBackorder" className="text-sm font-medium cursor-pointer flex items-center gap-2">
                          <ArrowRightLeft className="w-4 h-4 text-orange-600" />
                          Allow Backorder
                        </Label>
                        <p className="text-xs text-slate-500 mt-1">Customers can order even when out of stock</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                      <input
                        type="checkbox"
                        id="allowPreorder"
                        checked={newProduct.allowPreorder}
                        onChange={(e) => setNewProduct({ ...newProduct, allowPreorder: e.target.checked })}
                        className="w-5 h-5 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
                      />
                      <div className="flex-1">
                        <Label htmlFor="allowPreorder" className="text-sm font-medium cursor-pointer flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-purple-600" />
                          Allow Preorder
                        </Label>
                        <p className="text-xs text-slate-500 mt-1">Accept orders before product becomes available</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Preorder Configuration */}
                {newProduct.allowPreorder && (
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Calendar className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-800">Preorder Configuration</h3>
                        <p className="text-sm text-slate-600">Set when this product will become available</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="preorderDate" className="text-sm font-medium text-slate-700">
                        Available From Date
                      </Label>
                      <Input
                        id="preorderDate"
                        type="date"
                        value={newProduct.preorderDate}
                        onChange={(e) => setNewProduct({ ...newProduct, preorderDate: e.target.value })}
                        min={new Date().toISOString().split('T')[0]}
                        className="py-3 text-base border-slate-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all duration-200"
                      />
                      <p className="text-xs text-slate-500">Customers will be notified when the product becomes available</p>
                    </div>

                    {newProduct.preorderDate && (
                      <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
                        <div className="flex items-center gap-2 text-sm">
                          <Bell className="w-4 h-4 text-purple-600" />
                          <span className="text-purple-800 font-medium">
                            Product will be available on {new Date(newProduct.preorderDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>

              {/* Shipping Tab */}
              <TabsContent value="shipping" className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.01"
                    value={newProduct.weight}
                    onChange={(e) => setNewProduct({ ...newProduct, weight: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                    className="border-slate-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all duration-200"
                  />
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Dimensions (cm)</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="length">Length</Label>
                      <Input
                        id="length"
                        type="number"
                        step="0.01"
                        value={newProduct.dimensions?.length || 0}
                        onChange={(e) => setNewProduct({ 
                          ...newProduct, 
                          dimensions: { 
                            ...newProduct.dimensions, 
                            length: parseFloat(e.target.value) || 0,
                            width: newProduct.dimensions?.width || 0,
                            height: newProduct.dimensions?.height || 0
                          }
                        })}
                        placeholder="0.00"
                        className="border-slate-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all duration-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="width">Width</Label>
                      <Input
                        id="width"
                        type="number"
                        step="0.01"
                        value={newProduct.dimensions?.width || 0}
                        onChange={(e) => setNewProduct({ 
                          ...newProduct, 
                          dimensions: { 
                            ...newProduct.dimensions, 
                            width: parseFloat(e.target.value) || 0,
                            length: newProduct.dimensions?.length || 0,
                            height: newProduct.dimensions?.height || 0
                          }
                        })}
                        placeholder="0.00"
                        className="border-slate-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all duration-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="height">Height</Label>
                      <Input
                        id="height"
                        type="number"
                        step="0.01"
                        value={newProduct.dimensions?.height || 0}
                        onChange={(e) => setNewProduct({ 
                          ...newProduct, 
                          dimensions: { 
                            ...newProduct.dimensions, 
                            width: newProduct.dimensions?.width || 0,
                            length: newProduct.dimensions?.length || 0,
                            height: parseFloat(e.target.value) || 0
                          }
                        })}
                        placeholder="0.00"
                        className="border-slate-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all duration-200"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shippingClass">Shipping Class</Label>
                  <Select value={newProduct.shippingClass} onValueChange={(value) => setNewProduct({ ...newProduct, shippingClass: value })}>
                    <SelectTrigger className="border-slate-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all duration-200">
                      <SelectValue placeholder="Select shipping class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="express">Express</SelectItem>
                      <SelectItem value="overnight">Overnight</SelectItem>
                      <SelectItem value="fragile">Fragile</SelectItem>
                      <SelectItem value="hazardous">Hazardous</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Product Type Flags</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="isPhysical"
                        checked={newProduct.isPhysical}
                        onChange={(e) => setNewProduct({ ...newProduct, isPhysical: e.target.checked })}
                        className="rounded"
                      />
                      <Label htmlFor="isPhysical" className="text-sm">Physical Product</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="isDigital"
                        checked={newProduct.isDigital}
                        onChange={(e) => setNewProduct({ ...newProduct, isDigital: e.target.checked })}
                        className="rounded"
                      />
                      <Label htmlFor="isDigital" className="text-sm">Digital Product</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="isService"
                        checked={newProduct.isService}
                        onChange={(e) => setNewProduct({ ...newProduct, isService: e.target.checked })}
                        className="rounded"
                      />
                      <Label htmlFor="isService" className="text-sm">Service</Label>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* SEO & Marketing Tab */}
              <TabsContent value="seo" className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="seoTitle">SEO Title</Label>
                  <Input
                    id="seoTitle"
                    value={newProduct.seoTitle}
                    onChange={(e) => setNewProduct({ ...newProduct, seoTitle: e.target.value })}
                    placeholder="SEO optimized title"
                    className="border-slate-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all duration-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seoDescription">SEO Description</Label>
                  <Textarea
                    id="seoDescription"
                    value={newProduct.seoDescription}
                    onChange={(e) => setNewProduct({ ...newProduct, seoDescription: e.target.value })}
                    placeholder="SEO meta description"
                    rows={3}
                    className="border-slate-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all duration-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="metaKeywords">Meta Keywords</Label>
                  <Input
                    id="metaKeywords"
                    value={newProduct.metaKeywords}
                    onChange={(e) => setNewProduct({ ...newProduct, metaKeywords: e.target.value })}
                    placeholder="Keywords separated by commas"
                    className="border-slate-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all duration-200"
                  />
                </div>
              </TabsContent>

              {/* Advanced Tab */}
              <TabsContent value="advanced" className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="warrantyPeriod">Warranty Period</Label>
                    <Input
                      id="warrantyPeriod"
                      type="number"
                      value={newProduct.warrantyPeriod}
                      onChange={(e) => setNewProduct({ ...newProduct, warrantyPeriod: parseFloat(e.target.value) || 0 })}
                      placeholder="0"
                      className="border-slate-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all duration-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="warrantyUnit">Warranty Unit</Label>
                    <Select value={newProduct.warrantyUnit} onValueChange={(value) => setNewProduct({ ...newProduct, warrantyUnit: value })}>
                      <SelectTrigger className="border-slate-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all duration-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DAYS">Days</SelectItem>
                        <SelectItem value="WEEKS">Weeks</SelectItem>
                        <SelectItem value="MONTHS">Months</SelectItem>
                        <SelectItem value="YEARS">Years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="returnPolicy">Return Policy</Label>
                  <Textarea
                    id="returnPolicy"
                    value={newProduct.returnPolicy}
                    onChange={(e) => setNewProduct({ ...newProduct, returnPolicy: e.target.value })}
                    placeholder="Return policy details"
                    rows={3}
                    className="border-slate-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all duration-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={newProduct.status} onValueChange={(value) => setNewProduct({ ...newProduct, status: value })}>
                    <SelectTrigger className="border-slate-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all duration-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="INACTIVE">Inactive</SelectItem>
                      <SelectItem value="DISCONTINUED">Discontinued</SelectItem>
                      <SelectItem value="DRAFT">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>
            </Tabs>
            
            {/* Enhanced Dialog Footer */}
            <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 mt-8">
              {/* Validation Summary */}
              <div className="mb-4">
                {(!newProduct.name?.trim() || !newProduct.sku?.trim() || newProduct.unitPrice <= 0) && (
                  <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
                    <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <div className="font-medium text-red-800 mb-1">Please complete required fields:</div>
                      <ul className="text-red-700 space-y-1">
                        {!newProduct.name?.trim() && <li>• Product name is required</li>}
                        {!newProduct.sku?.trim() && <li>• SKU is required</li>}
                        {newProduct.unitPrice <= 0 && <li>• Selling price must be greater than 0</li>}
                      </ul>
                    </div>
                  </div>
                )}
                
                {newProduct.name?.trim() && newProduct.sku?.trim() && newProduct.unitPrice > 0 && (
                  <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg mb-4">
                    <Check className="w-4 h-4 text-green-500" />
                    <div className="text-sm">
                      <div className="font-medium text-green-800">Ready to create product</div>
                      <div className="text-green-700">All required information has been provided</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <DialogFooter className="gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowAddProductDialog(false)}
                  className="px-6 py-2.5 text-base font-medium"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  disabled={
                    !newProduct.name?.trim() ||
                    !newProduct.sku?.trim() ||
                    newProduct.unitPrice <= 0 ||
                    newProduct.costPrice < 0 ||
                    newProduct.stockQuantity < 0 ||
                    !newProduct.status?.trim()
                  }
                  className="px-6 py-2.5 text-base font-medium bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={async () => {
                  try {
                    // Comprehensive validation with specific error messages
                    if (!newProduct.name?.trim()) {
                      toast({
                        title: "Validation Error",
                        description: "Product name is required",
                        variant: "destructive"
                      })
                      return
                    }

                    if (!newProduct.sku?.trim()) {
                      toast({
                        title: "Validation Error",
                        description: "SKU is required",
                        variant: "destructive"
                      })
                      return
                    }

                    if (newProduct.unitPrice <= 0) {
                      toast({
                        title: "Validation Error",
                        description: "Unit price must be greater than 0",
                        variant: "destructive"
                      })
                      return
                    }

                    if (newProduct.costPrice < 0) {
                      toast({
                        title: "Validation Error",
                        description: "Cost price cannot be negative",
                        variant: "destructive"
                      })
                      return
                    }

                    if (newProduct.stockQuantity < 0) {
                      toast({
                        title: "Validation Error",
                        description: "Stock quantity cannot be negative",
                        variant: "destructive"
                      })
                      return
                    }

                    if (!newProduct.status?.trim()) {
                      toast({
                        title: "Validation Error",
                        description: "Product status is required",
                        variant: "destructive"
                      })
                      return
                    }

                    if (!newProduct.categoryId || newProduct.categoryId === '') {
                      toast({
                        title: "Validation Warning",
                        description: "No category selected. Product will be marked as uncategorized.",
                        variant: "default"
                      })
                    }

                    await inventoryApi.createProduct({
                      ...newProduct,
                      companyId: companyId,
                      type: 'PRODUCT' as 'PRODUCT' | 'SERVICE' | 'DIGITAL' | 'BUNDLE',
                      unitPrice: newProduct.unitPrice,
                      costPrice: newProduct.costPrice,
                      stockQuantity: newProduct.stockQuantity,
                      availableQuantity: newProduct.stockQuantity,
                      reservedQuantity: 0,
                      trackSerialNumbers: false,
                      trackBatches: false,
                      costingMethod: 'WEIGHTED_AVERAGE',
                      taxInclusive: newProduct.taxInclusive,
                      taxExempt: newProduct.taxExempt,
                      warrantyUnit: newProduct.warrantyUnit as 'DAYS' | 'WEEKS' | 'MONTHS' | 'YEARS',
                      status: (newProduct.status as 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED' | 'DRAFT').toUpperCase(),
                      // Convert JSON fields to strings
                      images: JSON.stringify(newProduct.images || []),
                      variants: JSON.stringify(newProduct.variants || []),
                      relatedProducts: JSON.stringify(newProduct.relatedProducts || []),
                      upsellProducts: JSON.stringify(newProduct.upsellProducts || []),
                      crossSellProducts: JSON.stringify(newProduct.crossSellProducts || []),
                      customFields: JSON.stringify(newProduct.customFields || {}),
                      // Convert dimensions object to individual fields
                      dimensionsLength: newProduct.dimensions?.length || 0,
                      dimensionsWidth: newProduct.dimensions?.width || 0,
                      dimensionsHeight: newProduct.dimensions?.height || 0,
                      // Remove the dimensions object to avoid conflicts
                      dimensions: undefined
                    } as any)

                    toast({
                      title: "Success",
                      description: "Product created successfully",
                    })

                    // Reset form
                    setNewProduct({
                      name: '',
                      sku: '',
                      description: '',
                      shortDescription: '',
                      unitPrice: 0,
                      costPrice: 0,
                      stockQuantity: 0,
                      minStockLevel: 0,
                      maxStockLevel: 0,
                      reorderPoint: 0,
                      category: '',
                      categoryId: '',
                      status: 'ACTIVE',
                      type: 'PRODUCT',
                      weight: 0,
                      dimensions: {
                        length: 0,
                        width: 0,
                        height: 0
                      },
                      taxRate: 0,
                      taxInclusive: false,
                      taxCode: '',
                      taxExempt: false,
                      barcode: '',
                      tags: '',
                      seoTitle: '',
                      seoDescription: '',
                      metaKeywords: '',
                      isDigital: false,
                      isService: false,
                      isPhysical: true,
                      trackInventory: true,
                      allowBackorder: false,
                      allowPreorder: false,
                      preorderDate: '',
                      warrantyPeriod: 0,
                      warrantyUnit: 'MONTHS',
                      returnPolicy: '',
                      shippingClass: '',
                      isFeatured: false,
                      isBestSeller: false,
                      isNewArrival: false,
                      customFields: {},
                      images: [],
                      variants: [],
                      relatedProducts: [],
                      upsellProducts: [],
                      crossSellProducts: [],
                      // Additional fields to fix TypeScript errors
                      brand: '',
                      model: '',
                      visibility: 'public',
                      customField1: '',
                      customField2: '',
                      customField3: '',
                      customField4: '',
                      requiresLicense: false,
                      hasExpiryDate: false,
                      isBundle: false,
                      notes: ''
                    })

                    setShowAddProductDialog(false)

                    // Refresh products list
                    queryClient.invalidateQueries({ queryKey: ['products'] })
                    queryClient.invalidateQueries({ queryKey: ['categories'] })
                    queryClient.invalidateQueries({ queryKey: ['analytics'] })
                    queryClient.invalidateQueries({ queryKey: ['kpis'] })
                  } catch (error: any) {
                    console.error('Error creating product:', error);
                    
                    // Default error message
                    let errorMessage = "Failed to create product. Please try again.";
                    
                    // Log the full error for debugging
                    console.log('Full error object:', {
                      status: error?.response?.status,
                      data: error?.response?.data,
                      message: error?.message,
                      stack: error?.stack
                    });
                    
                    // Handle 409 Conflict (duplicate SKU)
                    if (error?.response?.status === 409 || error?.message?.includes('409')) {
                      errorMessage = `A product with SKU "${newProduct.sku}" already exists. Please use a different SKU.`;
                    } 
                    // Handle 400 Bad Request
                    else if (error?.response?.status === 400 || error?.message?.includes('400')) {
                      errorMessage = "Invalid product data. Please check your inputs and try again.";
                    }
                    // Handle other errors
                    else if (error?.message) {
                      errorMessage = error.message;
                    }
                    
                    toast({
                      title: "Error Creating Product",
                      description: errorMessage,
                      variant: "destructive"
                    })
                  }
                }}>
                  <Package className="w-4 h-4 mr-2" />
                  Create Product
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>

        {/* Enhanced View Product Dialog */}
        <Dialog open={showViewProductDialog} onOpenChange={setShowViewProductDialog}>
          <DialogContent className="!max-w-7xl max-h-[95vh] overflow-y-auto w-[95vw] md:max-h-[90vh] md:w-[90vw] bg-gradient-to-br from-slate-50 to-slate-100/50">
            <DialogHeader className="pb-6 border-b border-slate-200">
              <DialogTitle className="flex items-center gap-3 text-2xl font-bold text-slate-800">
                <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-xl text-white shadow-lg">
                  <Eye className="w-6 h-6" />
                </div>
                Product Details
              </DialogTitle>
              <DialogDescription className="text-slate-600 text-base mt-2">
                Comprehensive view of product information and analytics
              </DialogDescription>
            </DialogHeader>

            {selectedProduct && (
              <div className="space-y-8 mt-6">
                {/* Essential Information Card */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Package className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800">Essential Information</h3>
                      <p className="text-sm text-slate-600">Core product details and identification</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-slate-700">Product Name</Label>
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                        <p className="text-base font-semibold text-slate-900">{selectedProduct.name}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-slate-700">SKU (Stock Keeping Unit)</Label>
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                        <p className="text-base font-mono text-slate-900">{selectedProduct.sku}</p>
                      </div>
                    </div>
                  </div>

                  {selectedProduct.description && (
                    <div className="mt-6 space-y-3">
                      <Label className="text-sm font-medium text-slate-700">Description</Label>
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                        <p className="text-base text-slate-900 leading-relaxed">{selectedProduct.description}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Pricing & Financial Information Card */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <DollarSign className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800">Pricing & Financial Information</h3>
                      <p className="text-sm text-slate-600">Costs, pricing, and profit analysis</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-slate-700">Selling Price</Label>
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-xl font-bold text-green-700">${Number(selectedProduct.unitPrice).toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-slate-700">Cost Price</Label>
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                        <p className="text-xl font-semibold text-slate-700">${Number(selectedProduct.costPrice).toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-slate-700">Profit per Unit</Label>
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-xl font-bold text-blue-700">
                          ${(Number(selectedProduct.unitPrice) - Number(selectedProduct.costPrice)).toFixed(2)}
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                          {(((Number(selectedProduct.unitPrice) - Number(selectedProduct.costPrice)) / Number(selectedProduct.unitPrice)) * 100).toFixed(1)}% margin
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Inventory & Stock Information Card */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <BarChart3 className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800">Inventory & Stock Information</h3>
                      <p className="text-sm text-slate-600">Current stock levels and inventory value</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-slate-700">Current Stock Quantity</Label>
                      <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <p className="text-2xl font-bold text-purple-700">{Number(selectedProduct.stockQuantity)}</p>
                          <span className="text-sm text-purple-600 font-medium">units</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-slate-700">Total Inventory Value</Label>
                      <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <p className="text-2xl font-bold text-indigo-700">
                            ${(Number(selectedProduct.stockQuantity) * Number(selectedProduct.costPrice)).toFixed(2)}
                          </p>
                          <span className="text-sm text-indigo-600 font-medium">total value</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Classification & Status Card */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Filter className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800">Classification & Status</h3>
                      <p className="text-sm text-slate-600">Category, type, and current status</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-slate-700">Category</Label>
                      <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                          <p className="text-base font-medium text-orange-800">
                            {categories.find(c => c.id === selectedProduct.categoryId)?.name || 'Uncategorized'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-slate-700">Product Type</Label>
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          {selectedProduct.type === 'PRODUCT' && <Package className="w-4 h-4 text-blue-600" />}
                          {selectedProduct.type === 'SERVICE' && <Settings className="w-4 h-4 text-purple-600" />}
                          {selectedProduct.type === 'DIGITAL' && <Activity className="w-4 h-4 text-green-600" />}
                          <p className="text-base font-medium text-slate-800">
                            {selectedProduct.type === 'PRODUCT' ? 'Physical Product' : 
                             selectedProduct.type === 'SERVICE' ? 'Service' : 'Digital Product'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-slate-700">Status</Label>
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                        <div className={`inline-flex px-2 py-1 rounded-full text-sm font-medium ${
                          selectedProduct.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                          selectedProduct.status === 'INACTIVE' ? 'bg-red-100 text-red-800' :
                          selectedProduct.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {selectedProduct.status}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Additional Classification Fields */}
                  {(selectedProduct.brand || selectedProduct.model || selectedProduct.tags) && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                      {selectedProduct.brand && (
                        <div className="space-y-3">
                          <Label className="text-sm font-medium text-slate-700">Brand</Label>
                          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                            <p className="text-base font-medium text-slate-800">{selectedProduct.brand}</p>
                          </div>
                        </div>
                      )}
                      
                      {selectedProduct.model && (
                        <div className="space-y-3">
                          <Label className="text-sm font-medium text-slate-700">Model</Label>
                          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                            <p className="text-base font-medium text-slate-800">{selectedProduct.model}</p>
                          </div>
                        </div>
                      )}

                      {selectedProduct.tags && (
                        <div className="space-y-3">
                          <Label className="text-sm font-medium text-slate-700">Tags</Label>
                          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                            <div className="flex flex-wrap gap-1">
                              {selectedProduct.tags.split(',').map((tag: string, index: number) => (
                                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                  {tag.trim()}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Tax Management Information Card */}
                {(selectedProduct.taxRate || selectedProduct.taxCode || selectedProduct.taxExempt) && (
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-yellow-100 rounded-lg">
                        <Calculator className="w-5 h-5 text-yellow-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-800">Tax Management</h3>
                        <p className="text-sm text-slate-600">Tax rates, codes, and exemption status</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {selectedProduct.taxExempt ? (
                        <div className="col-span-full">
                          <div className="flex items-center justify-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <Shield className="w-5 h-5 text-green-600" />
                            <span className="text-lg font-semibold text-green-800">Tax Exempt Product</span>
                          </div>
                        </div>
                      ) : (
                        <>
                          {selectedProduct.taxRate && (
                            <div className="space-y-3">
                              <Label className="text-sm font-medium text-slate-700">Tax Rate</Label>
                              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <p className="text-xl font-bold text-yellow-700">{selectedProduct.taxRate}%</p>
                              </div>
                            </div>
                          )}

                          {selectedProduct.taxCode && (
                            <div className="space-y-3">
                              <Label className="text-sm font-medium text-slate-700">Tax Code</Label>
                              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-base font-medium text-blue-800">{selectedProduct.taxCode}</p>
                              </div>
                            </div>
                          )}

                          <div className="space-y-3">
                            <Label className="text-sm font-medium text-slate-700">Tax Configuration</Label>
                            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-600">Tax Type:</span>
                                <span className={`text-sm font-medium ${selectedProduct.taxInclusive ? 'text-green-600' : 'text-blue-600'}`}>
                                  {selectedProduct.taxInclusive ? 'Tax Inclusive' : 'Tax Exclusive'}
                                </span>
                              </div>
                              
                              {selectedProduct.taxRate > 0 ? (
                                <>
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-600">Tax Rate:</span>
                                    <span className="text-sm font-semibold text-slate-800">
                                      {selectedProduct.taxRate}%
                                    </span>
                                  </div>
                                  
                                  <div className="pt-2 border-t border-slate-300">
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                      <div>
                                        <span className="text-slate-600">Unit Price:</span>
                                        <p className="font-semibold text-slate-800">
                                          ${Number(selectedProduct.unitPrice).toFixed(2)}
                                        </p>
                                      </div>
                                      
                                      {selectedProduct.taxInclusive ? (
                                        <>
                                          <div>
                                            <span className="text-slate-600">Tax Amount:</span>
                                            <p className="font-semibold text-yellow-600">
                                              ${((Number(selectedProduct.unitPrice) * Number(selectedProduct.taxRate)) / (100 + Number(selectedProduct.taxRate))).toFixed(2)}
                                            </p>
                                          </div>
                                          <div className="col-span-2 pt-1 border-t border-slate-200">
                                            <span className="text-slate-600">Net Price (excl. tax):</span>
                                            <p className="font-bold text-slate-800">
                                              ${(Number(selectedProduct.unitPrice) - ((Number(selectedProduct.unitPrice) * Number(selectedProduct.taxRate)) / (100 + Number(selectedProduct.taxRate)))).toFixed(2)}
                                            </p>
                                          </div>
                                        </>
                                      ) : (
                                        <>
                                          <div>
                                            <span className="text-slate-600">Tax Amount:</span>
                                            <p className="font-semibold text-yellow-600">
                                              ${(Number(selectedProduct.unitPrice) * Number(selectedProduct.taxRate) / 100).toFixed(2)}
                                            </p>
                                          </div>
                                          <div className="col-span-2 pt-1 border-t border-slate-200">
                                            <span className="text-slate-600">Total Price (incl. tax):</span>
                                            <p className="font-bold text-slate-800">
                                              ${(Number(selectedProduct.unitPrice) + (Number(selectedProduct.unitPrice) * Number(selectedProduct.taxRate) / 100)).toFixed(2)}
                                            </p>
                                          </div>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </>
                              ) : (
                                <div className="text-center py-2">
                                  <span className="text-sm text-slate-500">No tax applied</span>
                                </div>
                              )}
                              
                              {selectedProduct.taxCode && (
                                <div className="flex items-center justify-between pt-2 border-t border-slate-300">
                                  <span className="text-sm text-slate-600">Tax Code:</span>
                                  <span className="text-sm font-medium text-slate-800">
                                    {selectedProduct.taxCode}
                                  </span>
                                </div>
                              )}
                              
                              {selectedProduct.taxExempt && (
                                <div className="flex items-center justify-center pt-2 border-t border-slate-300">
                                  <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                                    Tax Exempt Product
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Physical Properties & Shipping Card */}
                {(selectedProduct.weight || selectedProduct.dimensions || selectedProduct.barcode || selectedProduct.shippingClass) && (
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-teal-100 rounded-lg">
                        <Package className="w-5 h-5 text-teal-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-800">Physical Properties & Shipping</h3>
                        <p className="text-sm text-slate-600">Dimensions, weight, and shipping information</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {selectedProduct.weight && (
                        <div className="space-y-3">
                          <Label className="text-sm font-medium text-slate-700">Weight</Label>
                          <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg">
                            <p className="text-base font-medium text-teal-800">{selectedProduct.weight} kg</p>
                          </div>
                        </div>
                      )}

                      {selectedProduct.dimensions && (
                        <div className="space-y-3">
                          <Label className="text-sm font-medium text-slate-700">Dimensions (L×W×H)</Label>
                          <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg">
                            <p className="text-base font-medium text-teal-800">
                              {typeof selectedProduct.dimensions === 'string' 
                                ? selectedProduct.dimensions 
                                : `${selectedProduct.dimensions?.length || 0} × ${selectedProduct.dimensions?.width || 0} × ${selectedProduct.dimensions?.height || 0} cm`}
                            </p>
                          </div>
                        </div>
                      )}

                      {selectedProduct.barcode && (
                        <div className="space-y-3">
                          <Label className="text-sm font-medium text-slate-700">Barcode</Label>
                          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                            <p className="text-base font-mono text-slate-800">{selectedProduct.barcode}</p>
                          </div>
                        </div>
                      )}

                      {selectedProduct.shippingClass && (
                        <div className="space-y-3">
                          <Label className="text-sm font-medium text-slate-700">Shipping Class</Label>
                          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                            <p className="text-base font-medium text-slate-800">{selectedProduct.shippingClass}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Marketing & Features Card */}
                {(selectedProduct.isFeatured || selectedProduct.isBestSeller || selectedProduct.isNewArrival || 
                  selectedProduct.seoTitle || selectedProduct.seoDescription) && (
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-pink-100 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-pink-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-800">Marketing & SEO</h3>
                        <p className="text-sm text-slate-600">Promotional flags and SEO optimization</p>
                      </div>
                    </div>

                    {(selectedProduct.isFeatured || selectedProduct.isBestSeller || selectedProduct.isNewArrival) && (
                      <div className="mb-6">
                        <Label className="text-sm font-medium text-slate-700 mb-3 block">Promotional Badges</Label>
                        <div className="flex flex-wrap gap-3">
                          {selectedProduct.isFeatured && (
                            <div className="px-3 py-2 bg-purple-100 text-purple-800 rounded-lg flex items-center gap-2">
                              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                              <span className="font-medium">Featured Product</span>
                            </div>
                          )}
                          {selectedProduct.isBestSeller && (
                            <div className="px-3 py-2 bg-orange-100 text-orange-800 rounded-lg flex items-center gap-2">
                              <TrendingUp className="w-4 h-4" />
                              <span className="font-medium">Best Seller</span>
                            </div>
                          )}
                          {selectedProduct.isNewArrival && (
                            <div className="px-3 py-2 bg-green-100 text-green-800 rounded-lg flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="font-medium">New Arrival</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {(selectedProduct.seoTitle || selectedProduct.seoDescription || selectedProduct.metaKeywords) && (
                      <div className="space-y-4">
                        {selectedProduct.seoTitle && (
                          <div className="space-y-3">
                            <Label className="text-sm font-medium text-slate-700">SEO Title</Label>
                            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                              <p className="text-base text-slate-800">{selectedProduct.seoTitle}</p>
                            </div>
                          </div>
                        )}

                        {selectedProduct.seoDescription && (
                          <div className="space-y-3">
                            <Label className="text-sm font-medium text-slate-700">SEO Description</Label>
                            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                              <p className="text-base text-slate-800">{selectedProduct.seoDescription}</p>
                            </div>
                          </div>
                        )}

                        {selectedProduct.metaKeywords && (
                          <div className="space-y-3">
                            <Label className="text-sm font-medium text-slate-700">Meta Keywords</Label>
                            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                              <div className="flex flex-wrap gap-1">
                                {selectedProduct.metaKeywords.split(',').map((keyword: string, index: number) => (
                                  <span key={index} className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full">
                                    {keyword.trim()}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Advanced Stock Management Card */}
                {(selectedProduct.minStockLevel || selectedProduct.maxStockLevel || selectedProduct.reorderPoint || 
                  selectedProduct.allowBackorder || selectedProduct.allowPreorder) && (
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-indigo-100 rounded-lg">
                        <BarChart3 className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-800">Advanced Stock Management</h3>
                        <p className="text-sm text-slate-600">Stock levels, reorder points, and ordering policies</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {selectedProduct.minStockLevel && (
                        <div className="space-y-3">
                          <Label className="text-sm font-medium text-slate-700">Minimum Stock Level</Label>
                          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-xl font-bold text-red-700">{selectedProduct.minStockLevel}</p>
                          </div>
                        </div>
                      )}

                      {selectedProduct.maxStockLevel && (
                        <div className="space-y-3">
                          <Label className="text-sm font-medium text-slate-700">Maximum Stock Level</Label>
                          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-xl font-bold text-blue-700">{selectedProduct.maxStockLevel}</p>
                          </div>
                        </div>
                      )}

                      {selectedProduct.reorderPoint && (
                        <div className="space-y-3">
                          <Label className="text-sm font-medium text-slate-700">Reorder Point</Label>
                          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-xl font-bold text-yellow-700">{selectedProduct.reorderPoint}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {(selectedProduct.allowBackorder || selectedProduct.allowPreorder) && (
                      <div className="mt-6">
                        <Label className="text-sm font-medium text-slate-700 mb-3 block">Ordering Policies</Label>
                        <div className="flex flex-wrap gap-3">
                          {selectedProduct.allowBackorder && (
                            <div className="px-3 py-2 bg-amber-100 text-amber-800 rounded-lg flex items-center gap-2">
                              <Check className="w-4 h-4" />
                              <span className="font-medium">Backorders Allowed</span>
                            </div>
                          )}
                          {selectedProduct.allowPreorder && (
                            <div className="px-3 py-2 bg-cyan-100 text-cyan-800 rounded-lg flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span className="font-medium">Pre-orders Allowed</span>
                              {selectedProduct.preorderDate && (
                                <span className="text-xs">({new Date(selectedProduct.preorderDate).toLocaleDateString()})</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Warranty & Service Information Card */}
                {(selectedProduct.warrantyPeriod || selectedProduct.returnPolicy) && (
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-emerald-100 rounded-lg">
                        <Shield className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-800">Warranty & Service</h3>
                        <p className="text-sm text-slate-600">Warranty coverage and return policies</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {selectedProduct.warrantyPeriod && (
                        <div className="space-y-3">
                          <Label className="text-sm font-medium text-slate-700">Warranty Period</Label>
                          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                            <p className="text-xl font-bold text-emerald-700">
                              {selectedProduct.warrantyPeriod} {selectedProduct.warrantyUnit?.toLowerCase() || 'months'}
                            </p>
                          </div>
                        </div>
                      )}

                      {selectedProduct.returnPolicy && (
                        <div className="space-y-3">
                          <Label className="text-sm font-medium text-slate-700">Return Policy</Label>
                          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                            <p className="text-base text-slate-800">{selectedProduct.returnPolicy}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Enhanced Dialog Footer */}
            <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 mt-8">
              <DialogFooter className="gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowViewProductDialog(false)}
                  className="px-6 py-2.5 text-base font-medium"
                >
                  <X className="w-4 h-4 mr-2" />
                  Close
                </Button>
                <Button 
                  onClick={() => {
                    setShowViewProductDialog(false)
                    handleEditProduct(selectedProduct)
                  }}
                  className="px-6 py-2.5 text-base font-medium bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Product
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>

        {/* Enhanced Edit Product Dialog */}
        <Dialog open={showEditProductDialog} onOpenChange={setShowEditProductDialog}>
          <DialogContent className="!max-w-7xl max-h-[95vh] overflow-y-auto w-[95vw] md:max-h-[90vh] md:w-[90vw] bg-gradient-to-br from-slate-50 to-slate-100/50">
            <DialogHeader className="pb-6 border-b border-slate-200">
              <DialogTitle className="flex items-center gap-3 text-2xl font-bold text-slate-800">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl text-white shadow-lg">
                  <Edit className="w-6 h-6" />
                </div>
                Edit Product
              </DialogTitle>
              <DialogDescription className="text-slate-600 text-base mt-2">
                Update product information with comprehensive details and settings
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-8 mt-6">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-6 bg-white p-1 rounded-xl shadow-sm border border-slate-200">
                  <TabsTrigger value="basic" className="flex items-center gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                    <Package className="w-4 h-4" />
                    Basic
                  </TabsTrigger>
                  <TabsTrigger value="pricing" className="flex items-center gap-2 data-[state=active]:bg-green-500 data-[state=active]:text-white">
                    <DollarSign className="w-4 h-4" />
                    Pricing
                  </TabsTrigger>
                  <TabsTrigger value="inventory" className="flex items-center gap-2 data-[state=active]:bg-purple-500 data-[state=active]:text-white">
                    <BarChart3 className="w-4 h-4" />
                    Inventory
                  </TabsTrigger>
                  <TabsTrigger value="shipping" className="flex items-center gap-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white">
                    <Package className="w-4 h-4" />
                    Shipping
                  </TabsTrigger>
                  <TabsTrigger value="marketing" className="flex items-center gap-2 data-[state=active]:bg-pink-500 data-[state=active]:text-white">
                    <TrendingUp className="w-4 h-4" />
                    Marketing
                  </TabsTrigger>
                  <TabsTrigger value="advanced" className="flex items-center gap-2 data-[state=active]:bg-slate-500 data-[state=active]:text-white">
                    <Settings className="w-4 h-4" />
                    Advanced
                  </TabsTrigger>
                </TabsList>

                {/* Basic Information Tab */}
                <TabsContent value="basic" className="mt-8">
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Package className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-800">Basic Product Information</h3>
                        <p className="text-sm text-slate-600">Essential product details and identification</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label htmlFor="edit-name" className="text-sm font-medium text-slate-700">Product Name *</Label>
                        <Input
                          id="edit-name"
                          value={newProduct.name}
                          onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                          placeholder="Enter product name"
                          className="py-3 text-base border-slate-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all duration-200"
                        />
                      </div>
                      
                      <div className="space-y-3">
                        <Label htmlFor="edit-sku" className="text-sm font-medium text-slate-700">SKU *</Label>
                        <Input
                          id="edit-sku"
                          value={newProduct.sku}
                          onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                          placeholder="Enter SKU"
                          className="py-3 text-base border-slate-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all duration-200"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                      <div className="space-y-3">
                        <Label htmlFor="edit-category" className="text-sm font-medium text-slate-700">Category</Label>
                        <Select
                          value={newProduct.categoryId || ''}
                          onValueChange={(value) => {
                            if (value === 'create-new') {
                              setShowAddCategoryDialog(true)
                            } else {
                              setNewProduct({ ...newProduct, categoryId: value })
                            }
                          }}
                        >
                          <SelectTrigger className="py-3 text-base border-slate-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all duration-200">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                            <SelectItem value="create-new" className="border-t border-slate-200 mt-2">
                              <div className="flex items-center gap-2 text-blue-600">
                                <Plus className="w-4 h-4" />
                                <span className="font-medium">Create New Category</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="edit-type" className="text-sm font-medium text-slate-700">Product Type</Label>
                        <Select 
                          value={newProduct.type} 
                          onValueChange={(value) => setNewProduct({ ...newProduct, type: value })}
                        >
                          <SelectTrigger className="py-3 text-base border-slate-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all duration-200">
                            <SelectValue placeholder="Select product type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PRODUCT">
                              <div className="flex items-center gap-3">
                                <Package className="w-4 h-4 text-blue-600" />
                                <div>
                                  <p className="font-medium">Physical Product</p>
                                  <p className="text-xs text-slate-500">Tangible items with inventory tracking</p>
                                </div>
                              </div>
                            </SelectItem>
                            <SelectItem value="SERVICE">
                              <div className="flex items-center gap-3">
                                <Settings className="w-4 h-4 text-purple-600" />
                                <div>
                                  <p className="font-medium">Service</p>
                                  <p className="text-xs text-slate-500">Intangible services without stock</p>
                                </div>
                              </div>
                            </SelectItem>
                            <SelectItem value="DIGITAL">
                              <div className="flex items-center gap-3">
                                <Activity className="w-4 h-4 text-green-600" />
                                <div>
                                  <p className="font-medium">Digital Product</p>
                                  <p className="text-xs text-slate-500">Digital downloads and subscriptions</p>
                                </div>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-3 mt-6">
                      <Label htmlFor="edit-shortDescription" className="text-sm font-medium text-slate-700">Short Description</Label>
                      <Textarea
                        id="edit-shortDescription"
                        value={newProduct.shortDescription}
                        onChange={(e) => setNewProduct({ ...newProduct, shortDescription: e.target.value })}
                        placeholder="Brief product summary for listings..."
                        rows={2}
                        className="resize-none border-slate-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all duration-200"
                      />
                    </div>

                    <div className="space-y-3 mt-6">
                      <Label htmlFor="edit-description" className="text-sm font-medium text-slate-700">Full Description</Label>
                      <Textarea
                        id="edit-description"
                        value={newProduct.description}
                        onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                        placeholder="Detailed product description..."
                        rows={4}
                        className="resize-none border-slate-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all duration-200"
                      />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                      <div className="space-y-3">
                        <Label htmlFor="edit-brand" className="text-sm font-medium text-slate-700">Brand</Label>
                        <Input
                          id="edit-brand"
                          value={newProduct.brand}
                          onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                          placeholder="Product brand"
                          className="py-3 text-base border-slate-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all duration-200"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="edit-model" className="text-sm font-medium text-slate-700">Model</Label>
                        <Input
                          id="edit-model"
                          value={newProduct.model}
                          onChange={(e) => setNewProduct({ ...newProduct, model: e.target.value })}
                          placeholder="Product model"
                          className="py-3 text-base border-slate-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all duration-200"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="edit-status" className="text-sm font-medium text-slate-700">Status</Label>
                        <Select value={newProduct.status} onValueChange={(value) => setNewProduct({ ...newProduct, status: value })}>
                          <SelectTrigger className="py-3 text-base border-slate-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all duration-200">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ACTIVE">Active</SelectItem>
                            <SelectItem value="INACTIVE">Inactive</SelectItem>
                            <SelectItem value="DRAFT">Draft</SelectItem>
                            <SelectItem value="DISCONTINUED">Discontinued</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Pricing & Tax Management Tab */}
                <TabsContent value="pricing">
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <DollarSign className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-800">Pricing & Tax Management</h3>
                        <p className="text-sm text-slate-600">Set prices, costs, and tax configuration</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label htmlFor="edit-unitPrice" className="text-sm font-medium text-slate-700">Selling Price *</Label>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">$</div>
                          <Input
                            id="edit-unitPrice"
                            type="number"
                            step="0.01"
                            min="0"
                            value={newProduct.unitPrice || ''}
                            onChange={(e) => setNewProduct({ ...newProduct, unitPrice: parseFloat(e.target.value) || 0 })}
                            placeholder="0.00"
                            className="pl-8 py-3 text-base border-slate-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all duration-200"
                          />
                        </div>
                        {newProduct.unitPrice > 0 && (
                          <div className="flex items-center gap-2 text-xs text-green-600">
                            <Check className="w-3 h-3" />
                            Valid selling price
                          </div>
                        )}
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="edit-costPrice" className="text-sm font-medium text-slate-700">Cost Price *</Label>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">$</div>
                          <Input
                            id="edit-costPrice"
                            type="number"
                            step="0.01"
                            min="0"
                            value={newProduct.costPrice || ''}
                            onChange={(e) => setNewProduct({ ...newProduct, costPrice: parseFloat(e.target.value) || 0 })}
                            placeholder="0.00"
                            className="pl-8 py-3 text-base border-slate-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all duration-200"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Profit Calculation Preview */}
                    {newProduct.unitPrice > 0 && newProduct.costPrice > 0 && (
                      <div className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                        <h4 className="text-sm font-semibold text-slate-800 mb-3">Profit Analysis</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-slate-600">Profit per unit: </span>
                            <span className={`font-bold ${(newProduct.unitPrice - newProduct.costPrice) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              ${(newProduct.unitPrice - newProduct.costPrice).toFixed(2)}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-600">Profit margin: </span>
                            <span className={`font-bold ${(((newProduct.unitPrice - newProduct.costPrice) / newProduct.unitPrice) * 100) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {(((newProduct.unitPrice - newProduct.costPrice) / newProduct.unitPrice) * 100).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Tax Management Section */}
                    <div className="mt-8 pt-6 border-t border-slate-200">
                      <h4 className="text-base font-semibold text-slate-800 mb-4">Tax Configuration</h4>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <Label htmlFor="edit-taxRate" className="text-sm font-medium text-slate-700">Tax Rate</Label>
                          <div className="relative">
                            <Input
                              id="edit-taxRate"
                              type="number"
                              step="0.01"
                              min="0"
                              max="100"
                              value={newProduct.taxRate || ''}
                              onChange={(e) => setNewProduct({ ...newProduct, taxRate: parseFloat(e.target.value) || 0 })}
                              placeholder="0.00"
                              className="pr-8 py-3 text-base border-slate-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all duration-200"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">%</div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Label htmlFor="edit-taxCode" className="text-sm font-medium text-slate-700">Tax Code</Label>
                          <Select 
                            value={newProduct.taxCode || ''} 
                            onValueChange={(value) => setNewProduct({ ...newProduct, taxCode: value })}
                          >
                            <SelectTrigger className="py-3 text-base border-slate-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all duration-200">
                              <SelectValue placeholder="Select tax code" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="STANDARD">Standard Tax</SelectItem>
                              <SelectItem value="GST">GST (Goods & Services Tax)</SelectItem>
                              <SelectItem value="VAT">VAT (Value Added Tax)</SelectItem>
                              <SelectItem value="SALES_TAX">Sales Tax</SelectItem>
                              <SelectItem value="EXCISE">Excise Tax</SelectItem>
                              <SelectItem value="IMPORT_DUTY">Import Duty</SelectItem>
                              <SelectItem value="LUXURY_TAX">Luxury Tax</SelectItem>
                              <SelectItem value="ZERO_RATED">Zero-Rated</SelectItem>
                              <SelectItem value="EXEMPT">Tax Exempt</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                        <div className="space-y-3">
                          <Label className="text-sm font-medium text-slate-700">Tax Configuration</Label>
                          <div className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg">
                            <input
                              type="checkbox"
                              id="edit-taxInclusive"
                              checked={newProduct.taxInclusive}
                              onChange={(e) => setNewProduct({ ...newProduct, taxInclusive: e.target.checked })}
                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <div>
                              <Label htmlFor="edit-taxInclusive" className="text-sm font-medium cursor-pointer">Price includes tax</Label>
                              <p className="text-xs text-slate-500">Tax is already included in the selling price</p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Label className="text-sm font-medium text-slate-700">Tax Exemption</Label>
                          <div className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg">
                            <input
                              type="checkbox"
                              id="edit-taxExempt"
                              checked={newProduct.taxExempt}
                              onChange={(e) => setNewProduct({ ...newProduct, taxExempt: e.target.checked })}
                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <div>
                              <Label htmlFor="edit-taxExempt" className="text-sm font-medium cursor-pointer">Tax exempt product</Label>
                              <p className="text-xs text-slate-500">This product is exempt from all taxes</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Enhanced Tax Preview */}
                      {newProduct.unitPrice > 0 && (
                        <div className="mt-6 p-4 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg border border-yellow-200">
                          <div className="flex items-center gap-2 mb-3">
                            <Calculator className="w-4 h-4 text-yellow-600" />
                            <h4 className="text-sm font-semibold text-slate-800">Tax Calculation Preview</h4>
                            {newProduct.taxCode && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                                {newProduct.taxCode}
                              </span>
                            )}
                          </div>
                          
                          {newProduct.taxExempt ? (
                            <div className="text-center py-3">
                              <div className="inline-flex items-center gap-2 px-3 py-2 bg-green-100 text-green-800 rounded-lg">
                                <Shield className="w-4 h-4" />
                                <span className="font-medium">Tax Exempt Product</span>
                              </div>
                              <p className="text-sm text-slate-600 mt-2">No tax will be applied to this product</p>
                            </div>
                          ) : newProduct.taxRate > 0 ? (
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              {newProduct.taxInclusive ? (
                                <>
                                  <div>
                                    <span className="text-slate-600">Price (tax inclusive): </span>
                                    <span className="font-semibold">${Number(newProduct.unitPrice).toFixed(2)}</span>
                                  </div>
                                  <div>
                                    <span className="text-slate-600">Tax amount ({newProduct.taxRate}%): </span>
                                    <span className="font-semibold text-yellow-600">
                                      ${((Number(newProduct.unitPrice) * Number(newProduct.taxRate)) / (100 + Number(newProduct.taxRate))).toFixed(2)}
                                    </span>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div>
                                    <span className="text-slate-600">Base price: </span>
                                    <span className="font-semibold">${Number(newProduct.unitPrice).toFixed(2)}</span>
                                  </div>
                                  <div>
                                    <span className="text-slate-600">Total price (including tax): </span>
                                    <span className="font-semibold text-yellow-600">
                                      ${(Number(newProduct.unitPrice) * (1 + Number(newProduct.taxRate) / 100)).toFixed(2)}
                                    </span>
                                  </div>
                                </>
                              )}
                            </div>
                          ) : (
                            <div className="text-center py-3">
                              <div className="inline-flex items-center gap-2 px-3 py-2 bg-slate-100 text-slate-600 rounded-lg">
                                <AlertCircle className="w-4 h-4" />
                                <span>No tax rate specified</span>
                              </div>
                              <p className="text-sm text-slate-500 mt-2">Enter a tax rate to see calculations</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="inventory">
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <BarChart3 className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-800">Inventory Management</h3>
                        <p className="text-sm text-slate-600">Stock levels, reorder points, and inventory tracking</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label htmlFor="edit-stockQuantity" className="text-sm font-medium text-slate-700">Current Stock Quantity</Label>
                        <Input
                          id="edit-stockQuantity"
                          type="number"
                          min="0"
                          step="1"
                          value={newProduct.stockQuantity || ''}
                          onChange={(e) => setNewProduct({ ...newProduct, stockQuantity: parseFloat(e.target.value) || 0 })}
                          placeholder="0"
                          className="py-3 text-base border-slate-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all duration-200"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="edit-reorderPoint" className="text-sm font-medium text-slate-700">Reorder Point</Label>
                        <Input
                          id="edit-reorderPoint"
                          type="number"
                          min="0"
                          step="1"
                          value={newProduct.reorderPoint || ''}
                          onChange={(e) => setNewProduct({ ...newProduct, reorderPoint: parseFloat(e.target.value) || 0 })}
                          placeholder="0"
                          className="py-3 text-base border-slate-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all duration-200"
                        />
                        <p className="text-xs text-slate-500">Trigger reorder when stock falls below this level</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                      <div className="space-y-3">
                        <Label htmlFor="edit-minStockLevel" className="text-sm font-medium text-slate-700">Minimum Stock Level</Label>
                        <Input
                          id="edit-minStockLevel"
                          type="number"
                          min="0"
                          step="1"
                          value={newProduct.minStockLevel || ''}
                          onChange={(e) => setNewProduct({ ...newProduct, minStockLevel: parseFloat(e.target.value) || 0 })}
                          placeholder="0"
                          className="py-3 text-base border-slate-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all duration-200"
                        />
                        <p className="text-xs text-slate-500">Absolute minimum stock to maintain</p>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="edit-maxStockLevel" className="text-sm font-medium text-slate-700">Maximum Stock Level</Label>
                        <Input
                          id="edit-maxStockLevel"
                          type="number"
                          min="0"
                          step="1"
                          value={newProduct.maxStockLevel || ''}
                          onChange={(e) => setNewProduct({ ...newProduct, maxStockLevel: parseFloat(e.target.value) || 0 })}
                          placeholder="0"
                          className="py-3 text-base border-slate-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all duration-200"
                        />
                        <p className="text-xs text-slate-500">Maximum stock capacity or target level</p>
                      </div>
                    </div>

                    {/* Stock Level Analysis */}
                    {newProduct.stockQuantity > 0 && newProduct.reorderPoint > 0 && (
                      <div className="mt-6 p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
                        <h4 className="text-sm font-semibold text-slate-800 mb-3">Stock Level Analysis</h4>
                        <div className="space-y-2">
                          <div className={`flex items-center gap-2 text-sm ${
                            newProduct.stockQuantity <= newProduct.reorderPoint 
                              ? 'text-red-600' 
                              : newProduct.stockQuantity <= (newProduct.reorderPoint * 2) 
                                ? 'text-yellow-600' 
                                : 'text-green-600'
                          }`}>
                            {newProduct.stockQuantity <= newProduct.reorderPoint 
                              ? <AlertTriangle className="w-4 h-4" /> 
                              : newProduct.stockQuantity <= (newProduct.reorderPoint * 2) 
                                ? <AlertTriangle className="w-4 h-4" />
                                : <Check className="w-4 h-4" />}
                            <span className="font-medium">
                              {newProduct.stockQuantity <= newProduct.reorderPoint 
                                ? 'Critical Stock Level - Immediate Reorder Required' 
                                : newProduct.stockQuantity <= (newProduct.reorderPoint * 2) 
                                  ? 'Low Stock Level - Consider Reordering Soon'
                                  : 'Stock Level is Healthy'}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Product Type Flags */}
                    <div className="mt-8 pt-6 border-t border-slate-200">
                      <h4 className="text-sm font-medium text-slate-800 mb-4">Product Type Flags</h4>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg">
                          <input
                            type="checkbox"
                            id="edit-trackInventory"
                            checked={newProduct.trackInventory}
                            onChange={(e) => setNewProduct({ ...newProduct, trackInventory: e.target.checked })}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <div>
                            <Label htmlFor="edit-trackInventory" className="text-sm font-medium cursor-pointer">Track inventory</Label>
                            <p className="text-xs text-slate-500">Monitor stock levels for this product</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg">
                          <input
                            type="checkbox"
                            id="edit-allowBackorder"
                            checked={newProduct.allowBackorder}
                            onChange={(e) => setNewProduct({ ...newProduct, allowBackorder: e.target.checked })}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <div>
                            <Label htmlFor="edit-allowBackorder" className="text-sm font-medium cursor-pointer">Allow backorders</Label>
                            <p className="text-xs text-slate-500">Accept orders when out of stock</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg">
                          <input
                            type="checkbox"
                            id="edit-allowPreorder"
                            checked={newProduct.allowPreorder}
                            onChange={(e) => setNewProduct({ ...newProduct, allowPreorder: e.target.checked })}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <div>
                            <Label htmlFor="edit-allowPreorder" className="text-sm font-medium cursor-pointer">Allow pre-orders</Label>
                            <p className="text-xs text-slate-500">Accept orders before product availability</p>
                          </div>
                        </div>

                        {newProduct.allowPreorder && (
                          <div className="space-y-3">
                            <Label htmlFor="edit-preorderDate" className="text-sm font-medium text-slate-700">Pre-order Available Date</Label>
                            <Input
                              id="edit-preorderDate"
                              type="date"
                              value={newProduct.preorderDate}
                              onChange={(e) => setNewProduct({ ...newProduct, preorderDate: e.target.value })}
                              className="py-3 text-base border-slate-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all duration-200"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="shipping">
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <Package className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-800">Physical Properties & Shipping</h3>
                        <p className="text-sm text-slate-600">Dimensions, weight, and shipping configuration</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label htmlFor="edit-weight" className="text-sm font-medium text-slate-700">Weight (kg)</Label>
                        <Input
                          id="edit-weight"
                          type="number"
                          step="0.01"
                          min="0"
                          value={newProduct.weight || ''}
                          onChange={(e) => setNewProduct({ ...newProduct, weight: parseFloat(e.target.value) || 0 })}
                          placeholder="0.00"
                          className="py-3 text-base border-slate-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all duration-200"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="edit-barcode" className="text-sm font-medium text-slate-700">Barcode</Label>
                        <Input
                          id="edit-barcode"
                          value={newProduct.barcode}
                          onChange={(e) => setNewProduct({ ...newProduct, barcode: e.target.value })}
                          placeholder="Enter or scan barcode"
                          className="py-3 text-base border-slate-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all duration-200"
                        />
                      </div>
                    </div>

                    <div className="space-y-4 mt-6">
                      <h4 className="text-sm font-medium text-slate-800">Dimensions (cm)</h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-length">Length</Label>
                          <Input
                            id="edit-length"
                            type="number"
                            step="0.01"
                            value={newProduct.dimensions?.length || 0}
                            onChange={(e) => setNewProduct({ 
                              ...newProduct, 
                              dimensions: { 
                                ...newProduct.dimensions, 
                                length: parseFloat(e.target.value) || 0,
                                width: newProduct.dimensions?.width || 0,
                                height: newProduct.dimensions?.height || 0
                              }
                            })}
                            placeholder="0.00"
                            className="border-slate-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all duration-200"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-width">Width</Label>
                          <Input
                            id="edit-width"
                            type="number"
                            step="0.01"
                            value={newProduct.dimensions?.width || 0}
                            onChange={(e) => setNewProduct({ 
                              ...newProduct, 
                              dimensions: { 
                                ...newProduct.dimensions, 
                                width: parseFloat(e.target.value) || 0,
                                length: newProduct.dimensions?.length || 0,
                                height: newProduct.dimensions?.height || 0
                              }
                            })}
                            placeholder="0.00"
                            className="border-slate-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all duration-200"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-height">Height</Label>
                          <Input
                            id="edit-height"
                            type="number"
                            step="0.01"
                            value={newProduct.dimensions?.height || 0}
                            onChange={(e) => setNewProduct({ 
                              ...newProduct, 
                              dimensions: { 
                                ...newProduct.dimensions, 
                                width: newProduct.dimensions?.width || 0,
                                length: newProduct.dimensions?.length || 0,
                                height: parseFloat(e.target.value) || 0
                              }
                            })}
                            placeholder="0.00"
                            className="border-slate-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all duration-200"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 mt-6">
                      <Label htmlFor="edit-shippingClass">Shipping Class</Label>
                      <Select value={newProduct.shippingClass} onValueChange={(value) => setNewProduct({ ...newProduct, shippingClass: value })}>
                        <SelectTrigger className="border-slate-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all duration-200">
                          <SelectValue placeholder="Select shipping class" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="STANDARD">Standard Shipping</SelectItem>
                          <SelectItem value="EXPEDITED">Expedited Shipping</SelectItem>
                          <SelectItem value="OVERNIGHT">Overnight Shipping</SelectItem>
                          <SelectItem value="FREIGHT">Freight Shipping</SelectItem>
                          <SelectItem value="DIGITAL">Digital Delivery</SelectItem>
                          <SelectItem value="PICKUP">Pickup Only</SelectItem>
                          <SelectItem value="FREE">Free Shipping</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-slate-500 mt-1">Choose appropriate shipping method for this product</p>
                    </div>

                    {/* Warranty Information */}
                    <div className="mt-8 pt-6 border-t border-slate-200">
                      <h4 className="text-sm font-medium text-slate-800 mb-4">Warranty & Returns</h4>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <Label htmlFor="edit-warrantyPeriod" className="text-sm font-medium text-slate-700">Warranty Period</Label>
                          <Input
                            id="edit-warrantyPeriod"
                            type="number"
                            min="0"
                            step="1"
                            value={newProduct.warrantyPeriod}
                            onChange={(e) => setNewProduct({ ...newProduct, warrantyPeriod: parseFloat(e.target.value) || 0 })}
                            placeholder="0"
                            className="py-3 text-base border-slate-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all duration-200"
                          />
                        </div>

                        <div className="space-y-3">
                          <Label htmlFor="edit-warrantyUnit" className="text-sm font-medium text-slate-700">Warranty Unit</Label>
                          <Select 
                            value={newProduct.warrantyUnit} 
                            onValueChange={(value) => setNewProduct({ ...newProduct, warrantyUnit: value })}
                          >
                            <SelectTrigger className="py-3 text-base border-slate-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all duration-200">
                              <SelectValue placeholder="Select unit" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="DAYS">Days</SelectItem>
                              <SelectItem value="WEEKS">Weeks</SelectItem>
                              <SelectItem value="MONTHS">Months</SelectItem>
                              <SelectItem value="YEARS">Years</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-3 mt-6">
                        <Label htmlFor="edit-returnPolicy" className="text-sm font-medium text-slate-700">Return Policy</Label>
                        <Textarea
                          id="edit-returnPolicy"
                          value={newProduct.returnPolicy}
                          onChange={(e) => setNewProduct({ ...newProduct, returnPolicy: e.target.value })}
                          placeholder="Describe the return policy for this product..."
                          rows={3}
                          className="resize-none border-slate-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all duration-200"
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="marketing">
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-pink-100 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-pink-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-800">Marketing & SEO</h3>
                        <p className="text-sm text-slate-600">Promotional features, SEO optimization, and marketing flags</p>
                      </div>
                    </div>

                    {/* Promotional Flags */}
                    <div className="mb-8">
                      <h4 className="text-sm font-medium text-slate-800 mb-4">Product Promotion Flags</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                          <input
                            type="checkbox"
                            id="edit-isFeatured"
                            checked={newProduct.isFeatured}
                            onChange={(e) => setNewProduct({ ...newProduct, isFeatured: e.target.checked })}
                            className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
                          />
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                            <div>
                              <Label htmlFor="edit-isFeatured" className="text-sm font-medium cursor-pointer">Featured Product</Label>
                              <p className="text-xs text-slate-500">Highlight in featured sections</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                          <input
                            type="checkbox"
                            id="edit-isBestSeller"
                            checked={newProduct.isBestSeller}
                            onChange={(e) => setNewProduct({ ...newProduct, isBestSeller: e.target.checked })}
                            className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500"
                          />
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-orange-600" />
                            <div>
                              <Label htmlFor="edit-isBestSeller" className="text-sm font-medium cursor-pointer">Best Seller</Label>
                              <p className="text-xs text-slate-500">Mark as top-selling product</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                          <input
                            type="checkbox"
                            id="edit-isNewArrival"
                            checked={newProduct.isNewArrival}
                            onChange={(e) => setNewProduct({ ...newProduct, isNewArrival: e.target.checked })}
                            className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
                          />
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <div>
                              <Label htmlFor="edit-isNewArrival" className="text-sm font-medium cursor-pointer">New Arrival</Label>
                              <p className="text-xs text-slate-500">Show as recently added</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="space-y-3 mb-8">
                      <Label htmlFor="edit-tags" className="text-sm font-medium text-slate-700">Product Tags</Label>
                      <Textarea
                        id="edit-tags"
                        value={newProduct.tags}
                        onChange={(e) => setNewProduct({ ...newProduct, tags: e.target.value })}
                        placeholder="e.g., organic, premium, limited-edition (comma separated)"
                        rows={2}
                        className="resize-none border-slate-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all duration-200"
                      />
                      <p className="text-xs text-slate-500">Separate multiple tags with commas for better searchability</p>
                    </div>

                    {/* SEO Section */}
                    <div className="pt-6 border-t border-slate-200">
                      <h4 className="text-sm font-medium text-slate-800 mb-4">SEO Optimization</h4>
                      
                      <div className="space-y-6">
                        <div className="space-y-3">
                          <Label htmlFor="edit-seoTitle" className="text-sm font-medium text-slate-700">SEO Title</Label>
                          <Input
                            id="edit-seoTitle"
                            value={newProduct.seoTitle}
                            onChange={(e) => setNewProduct({ ...newProduct, seoTitle: e.target.value })}
                            placeholder="Optimized title for search engines (50-60 characters)"
                            className="py-3 text-base border-slate-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all duration-200"
                          />
                          <div className="flex justify-between items-center">
                            <p className="text-xs text-slate-500">Recommended: 50-60 characters for optimal display</p>
                            <span className={`text-xs ${newProduct.seoTitle?.length > 60 ? 'text-orange-500' : 'text-slate-400'}`}>
                              {newProduct.seoTitle?.length || 0}/60
                            </span>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Label htmlFor="edit-seoDescription" className="text-sm font-medium text-slate-700">SEO Description</Label>
                          <Textarea
                            id="edit-seoDescription"
                            value={newProduct.seoDescription}
                            onChange={(e) => setNewProduct({ ...newProduct, seoDescription: e.target.value })}
                            placeholder="Compelling description for search results (150-160 characters)"
                            rows={3}
                            className="resize-none border-slate-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all duration-200"
                          />
                          <div className="flex justify-between items-center">
                            <p className="text-xs text-slate-500">Recommended: 150-160 characters for search snippets</p>
                            <span className={`text-xs ${newProduct.seoDescription?.length > 160 ? 'text-orange-500' : 'text-slate-400'}`}>
                              {newProduct.seoDescription?.length || 0}/160
                            </span>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Label htmlFor="edit-metaKeywords" className="text-sm font-medium text-slate-700">Meta Keywords</Label>
                          <Textarea
                            id="edit-metaKeywords"
                            value={newProduct.metaKeywords}
                            onChange={(e) => setNewProduct({ ...newProduct, metaKeywords: e.target.value })}
                            placeholder="relevant, keywords, for, search, engines (comma separated)"
                            rows={2}
                            className="resize-none border-slate-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all duration-200"
                          />
                          <p className="text-xs text-slate-500">Comma-separated keywords relevant to your product</p>
                        </div>
                      </div>
                    </div>

                    {/* SEO Preview */}
                    {(newProduct.seoTitle || newProduct.seoDescription) && (
                      <div className="mt-8 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                        <h4 className="text-sm font-semibold text-slate-800 mb-3">Search Result Preview</h4>
                        <div className="bg-white p-4 rounded border">
                          <div className="text-blue-600 text-lg hover:underline cursor-pointer">
                            {newProduct.seoTitle || newProduct.name || 'Product Title'}
                          </div>
                          <div className="text-green-600 text-sm">
                            yourstore.com/products/{newProduct.sku?.toLowerCase() || 'product-sku'}
                          </div>
                          <div className="text-gray-600 text-sm mt-1">
                            {newProduct.seoDescription || newProduct.shortDescription || newProduct.description || 'Product description will appear here...'}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="advanced">
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Settings className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-800">Advanced Configuration</h3>
                        <p className="text-sm text-slate-600">Product variants, custom fields, and advanced settings</p>
                      </div>
                    </div>

                    {/* Product Status */}
                    <div className="mb-8">
                      <h4 className="text-sm font-medium text-slate-800 mb-4">Product Status & Visibility</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <Label htmlFor="edit-status" className="text-sm font-medium text-slate-700">Product Status</Label>
                          <select
                            id="edit-status"
                            value={newProduct.status || 'active'}
                            onChange={(e) => setNewProduct({ ...newProduct, status: e.target.value })}
                            className="w-full px-3 py-3 bg-white border border-slate-300 rounded-lg text-base focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all duration-200"
                          >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="draft">Draft</option>
                            <option value="discontinued">Discontinued</option>
                          </select>
                        </div>

                        <div className="space-y-3">
                          <Label htmlFor="edit-visibility" className="text-sm font-medium text-slate-700">Visibility</Label>
                          <select
                            id="edit-visibility"
                            value={newProduct.visibility || 'public'}
                            onChange={(e) => setNewProduct({ ...newProduct, visibility: e.target.value })}
                            className="w-full px-3 py-3 bg-white border border-slate-300 rounded-lg text-base focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all duration-200"
                          >
                            <option value="public">Public</option>
                            <option value="private">Private</option>
                            <option value="members-only">Members Only</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Custom Fields */}
                    <div className="mb-8">
                      <h4 className="text-sm font-medium text-slate-800 mb-4">Custom Information Fields</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <Label htmlFor="edit-customField1" className="text-sm font-medium text-slate-700">Custom Field 1</Label>
                          <Input
                            id="edit-customField1"
                            value={newProduct.customField1}
                            onChange={(e) => setNewProduct({ ...newProduct, customField1: e.target.value })}
                            placeholder="e.g., Material composition"
                            className="py-3 text-base border-slate-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all duration-200"
                          />
                        </div>

                        <div className="space-y-3">
                          <Label htmlFor="edit-customField2" className="text-sm font-medium text-slate-700">Custom Field 2</Label>
                          <Input
                            id="edit-customField2"
                            value={newProduct.customField2}
                            onChange={(e) => setNewProduct({ ...newProduct, customField2: e.target.value })}
                            placeholder="e.g., Care instructions"
                            className="py-3 text-base border-slate-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all duration-200"
                          />
                        </div>

                        <div className="space-y-3">
                          <Label htmlFor="edit-customField3" className="text-sm font-medium text-slate-700">Custom Field 3</Label>
                          <Input
                            id="edit-customField3"
                            value={newProduct.customField3}
                            onChange={(e) => setNewProduct({ ...newProduct, customField3: e.target.value })}
                            placeholder="e.g., Certifications"
                            className="py-3 text-base border-slate-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all duration-200"
                          />
                        </div>

                        <div className="space-y-3">
                          <Label htmlFor="edit-customField4" className="text-sm font-medium text-slate-700">Custom Field 4</Label>
                          <Input
                            id="edit-customField4"
                            value={newProduct.customField4}
                            onChange={(e) => setNewProduct({ ...newProduct, customField4: e.target.value })}
                            placeholder="e.g., Origin country"
                            className="py-3 text-base border-slate-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all duration-200"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Product Variants */}
                    <div className="mb-8">
                      <h4 className="text-sm font-medium text-slate-800 mb-4">Product Variants & Options</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <Label htmlFor="edit-variants" className="text-sm font-medium text-slate-700">Available Variants</Label>
                          <Textarea
                            id="edit-variants"
                            value={Array.isArray(newProduct.variants) ? newProduct.variants.join(', ') : ''}
                            onChange={(e) => setNewProduct({ ...newProduct, variants: e.target.value.split(',').map(v => v.trim()).filter(Boolean) } as typeof newProduct)}
                            placeholder="e.g., Size: S,M,L,XL | Color: Red,Blue,Green"
                            rows={3}
                            className="resize-none border-slate-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all duration-200"
                          />
                          <p className="text-xs text-slate-500">Define variants using format: Attribute: Option1,Option2</p>
                        </div>

                        <div className="space-y-3">
                          <Label htmlFor="edit-relatedProducts" className="text-sm font-medium text-slate-700">Related Products</Label>
                          <Textarea
                            id="edit-relatedProducts"
                            value={Array.isArray(newProduct.relatedProducts) ? newProduct.relatedProducts.join(', ') : ''}
                            onChange={(e) => setNewProduct({ ...newProduct, relatedProducts: e.target.value.split(',').map(v => v.trim()).filter(Boolean) } as typeof newProduct)}
                            placeholder="e.g., SKU001, SKU002, SKU003"
                            rows={3}
                            className="resize-none border-slate-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all duration-200"
                          />
                          <p className="text-xs text-slate-500">Comma-separated list of related product SKUs</p>
                        </div>
                      </div>
                    </div>

                    {/* Product Flags */}
                    <div className="mb-8">
                      <h4 className="text-sm font-medium text-slate-800 mb-4">Additional Product Flags</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                          <input
                            type="checkbox"
                            id="edit-isDigital"
                            checked={newProduct.isDigital}
                            onChange={(e) => setNewProduct({ ...newProduct, isDigital: e.target.checked })}
                            className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500"
                          />
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                            <div>
                              <Label htmlFor="edit-isDigital" className="text-sm font-medium cursor-pointer">Digital Product</Label>
                              <p className="text-xs text-slate-500">No physical shipping required</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                          <input
                            type="checkbox"
                            id="edit-requiresLicense"
                            checked={newProduct.requiresLicense}
                            onChange={(e) => setNewProduct({ ...newProduct, requiresLicense: e.target.checked })}
                            className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500"
                          />
                          <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-red-600" />
                            <div>
                              <Label htmlFor="edit-requiresLicense" className="text-sm font-medium cursor-pointer">License Required</Label>
                              <p className="text-xs text-slate-500">Regulatory compliance needed</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                          <input
                            type="checkbox"
                            id="edit-hasExpiryDate"
                            checked={newProduct.hasExpiryDate}
                            onChange={(e) => setNewProduct({ ...newProduct, hasExpiryDate: e.target.checked })}
                            className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500"
                          />
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-orange-600" />
                            <div>
                              <Label htmlFor="edit-hasExpiryDate" className="text-sm font-medium cursor-pointer">Has Expiry Date</Label>
                              <p className="text-xs text-slate-500">Track product expiration</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                          <input
                            type="checkbox"
                            id="edit-isBundle"
                            checked={newProduct.isBundle}
                            onChange={(e) => setNewProduct({ ...newProduct, isBundle: e.target.checked })}
                            className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
                          />
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4 text-green-600" />
                            <div>
                              <Label htmlFor="edit-isBundle" className="text-sm font-medium cursor-pointer">Bundle Product</Label>
                              <p className="text-xs text-slate-500">Contains multiple items</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Additional Notes */}
                    <div className="pt-6 border-t border-slate-200">
                      <div className="space-y-3">
                        <Label htmlFor="edit-notes" className="text-sm font-medium text-slate-700">Internal Notes</Label>
                        <Textarea
                          id="edit-notes"
                          value={newProduct.notes}
                          onChange={(e) => setNewProduct({ ...newProduct, notes: e.target.value })}
                          placeholder="Internal notes for staff use only (not visible to customers)"
                          rows={4}
                          className="resize-none border-slate-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all duration-200"
                        />
                        <p className="text-xs text-slate-500">These notes are for internal use and won't be displayed to customers</p>
                      </div>
                    </div>

                    {/* Product Configuration Summary */}
                    <div className="mt-8 p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
                      <h4 className="text-sm font-semibold text-slate-800 mb-3">Configuration Summary</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${newProduct.status === 'active' ? 'bg-green-500' : 'bg-orange-500'}`}></div>
                          <span className="text-slate-600">Status: {newProduct.status || 'Active'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${newProduct.isDigital ? 'bg-blue-500' : 'bg-gray-400'}`}></div>
                          <span className="text-slate-600">{newProduct.isDigital ? 'Digital' : 'Physical'} Product</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${newProduct.isBundle ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                          <span className="text-slate-600">{newProduct.isBundle ? 'Bundle' : 'Single'} Item</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${newProduct.hasExpiryDate ? 'bg-orange-500' : 'bg-gray-400'}`}></div>
                          <span className="text-slate-600">{newProduct.hasExpiryDate ? 'Expires' : 'No Expiry'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditProductDialog(false)}>
                Cancel
              </Button>
              <Button
                disabled={
                  !newProduct.name?.trim() ||
                  !newProduct.sku?.trim() ||
                  newProduct.unitPrice <= 0 ||
                  newProduct.costPrice < 0 ||
                  newProduct.stockQuantity < 0 ||
                  !newProduct.status?.trim()
                }
                onClick={async () => {
                  try {
                    // Comprehensive validation with specific error messages
                    if (!newProduct.name?.trim()) {
                      toast({
                        title: "Validation Error",
                        description: "Product name is required",
                        variant: "destructive"
                      })
                      return
                    }

                    if (!newProduct.sku?.trim()) {
                      toast({
                        title: "Validation Error",
                        description: "SKU is required",
                        variant: "destructive"
                      })
                      return
                    }

                    if (newProduct.unitPrice <= 0) {
                      toast({
                        title: "Validation Error",
                        description: "Unit price must be greater than 0",
                        variant: "destructive"
                      })
                      return
                    }

                    if (newProduct.costPrice < 0) {
                      toast({
                        title: "Validation Error",
                        description: "Cost price cannot be negative",
                        variant: "destructive"
                      })
                      return
                    }

                    if (newProduct.stockQuantity < 0) {
                      toast({
                        title: "Validation Error",
                        description: "Stock quantity cannot be negative",
                        variant: "destructive"
                      })
                      return
                    }

                    if (!newProduct.status?.trim()) {
                      toast({
                        title: "Validation Error",
                        description: "Product status is required",
                        variant: "destructive"
                      })
                      return
                    }

                    // Validate status value
                    const validStatuses = ['ACTIVE', 'INACTIVE', 'DISCONTINUED', 'DRAFT']
                    if (!validStatuses.includes(newProduct.status)) {
                      toast({
                        title: "Validation Error",
                        description: `Invalid status: ${newProduct.status}. Must be one of: ${validStatuses.join(', ')}`,
                        variant: "destructive"
                      })
                      return
                    }

                    console.log('🔍 Product Update Debug:', {
                      originalStatus: newProduct.status,
                      statusType: typeof newProduct.status,
                      statusTrimmed: newProduct.status?.trim(),
                      isValidStatus: ['ACTIVE', 'INACTIVE', 'DISCONTINUED', 'DRAFT'].includes(newProduct.status)
                    })

                    const updateData = {
                      ...newProduct,
                      unitPrice: newProduct.unitPrice,
                      costPrice: newProduct.costPrice,
                      stockQuantity: newProduct.stockQuantity,
                      status: (newProduct.status as 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED' | 'DRAFT').toUpperCase(),
                      type: newProduct.type as 'PRODUCT' | 'SERVICE' | 'DIGITAL' | 'BUNDLE',
                      warrantyUnit: newProduct.warrantyUnit as 'DAYS' | 'WEEKS' | 'MONTHS' | 'YEARS',
                      // Convert JSON fields to strings
                      images: JSON.stringify(newProduct.images || []),
                      variants: JSON.stringify(newProduct.variants || []),
                      relatedProducts: JSON.stringify(newProduct.relatedProducts || []),
                      upsellProducts: JSON.stringify(newProduct.upsellProducts || []),
                      crossSellProducts: JSON.stringify(newProduct.crossSellProducts || []),
                      customFields: JSON.stringify(newProduct.customFields || {}),
                      // Convert dimensions object to individual fields
                      dimensionsLength: newProduct.dimensions?.length || 0,
                      dimensionsWidth: newProduct.dimensions?.width || 0,
                      dimensionsHeight: newProduct.dimensions?.height || 0,
                      // Remove the dimensions object to avoid conflicts
                      dimensions: undefined
                    } as any
                    
                    console.log('Updating product with data:', updateData)
                    console.log('Product ID:', selectedProduct.id)
                    console.log('🔍 Status Debug:', {
                      status: updateData.status,
                      statusType: typeof updateData.status,
                      statusLength: updateData.status?.length,
                      isValidStatus: ['ACTIVE', 'INACTIVE', 'DISCONTINUED', 'DRAFT'].includes(updateData.status),
                      fullUpdateDataKeys: Object.keys(updateData),
                      statusFieldInData: updateData.status
                    })
                    
                    await inventoryApi.updateProduct(selectedProduct.id, updateData)

                    toast({
                      title: "Success",
                      description: "Product updated successfully",
                    })

                    setShowEditProductDialog(false)

                    queryClient.invalidateQueries({ queryKey: ['products'] })
                    queryClient.invalidateQueries({ queryKey: ['categories'] })
                    queryClient.invalidateQueries({ queryKey: ['analytics'] })
                    queryClient.invalidateQueries({ queryKey: ['kpis'] })
                  } catch (error: any) {
                    console.error('Product update error:', error)
                    console.error('Error response:', error?.response)
                    console.error('Error data:', error?.response?.data)

                    let errorMessage = "Failed to update product. Please try again."

                    if (error?.response?.status === 409) {
                      errorMessage = `SKU "${newProduct.sku}" already exists for this company. Please use a different SKU.`
                    } else if (error?.response?.status === 400) {
                      const validationErrors = error?.response?.data?.errors || []
                      if (validationErrors.length > 0) {
                        errorMessage = `Validation errors: ${validationErrors.join(', ')}`
                      } else {
                        errorMessage = error?.response?.data?.message || "Invalid product data. Please check your inputs."
                      }
                    } else if (error?.response?.status === 401) {
                      errorMessage = "Authentication error. Please refresh the page and try again."
                    } else if (error?.response?.status === 403) {
                      errorMessage = "Permission denied. You don't have access to update this product."
                    } else if (error?.response?.status === 404) {
                      errorMessage = "Product not found. It may have been deleted."
                    } else if (error?.response?.status === 500) {
                      errorMessage = "Server error. Please try again later."
                    } else {
                      const backendError = error?.response?.data?.error ||
                        error?.response?.data?.message ||
                        error?.response?.statusText ||
                        error?.message

                      if (backendError && backendError !== "Conflict" && backendError !== "Bad Request" && backendError.length > 10) {
                        errorMessage = backendError
                      }
                    }

                    toast({
                      title: "Error Updating Product",
                      description: errorMessage,
                      variant: "destructive"
                    })
                  }
                }}>
                Update Product
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Location Dialog */}
        <Dialog open={showAddLocationDialog} onOpenChange={setShowAddLocationDialog}>
          <DialogContent className="!max-w-7xl max-h-[95vh] overflow-y-auto w-[95vw] md:max-h-[90vh] md:w-[90vw] bg-gradient-to-br from-slate-50 to-blue-50">
            <DialogHeader className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold text-slate-800">Add New Location</DialogTitle>
                  <p className="text-slate-600 mt-1">Create a new warehouse, store, or distribution center</p>
                </div>
              </div>
            </DialogHeader>

            <div className="flex-1">
              <Tabs defaultValue="basic" className="h-full flex flex-col">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-2 mb-4">
                  <TabsList className="grid w-full grid-cols-4 gap-1">
                    <TabsTrigger 
                      value="basic" 
                      className="flex items-center gap-2 py-3 px-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white transition-all duration-300"
                    >
                      <Info className="w-4 h-4" />
                      <span className="hidden sm:inline">Basic Info</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="address" 
                      className="flex items-center gap-2 py-3 px-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white transition-all duration-300"
                    >
                      <MapPin className="w-4 h-4" />
                      <span className="hidden sm:inline">Address</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="contact" 
                      className="flex items-center gap-2 py-3 px-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white transition-all duration-300"
                    >
                      <User className="w-4 h-4" />
                      <span className="hidden sm:inline">Contact</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="settings" 
                      className="flex items-center gap-2 py-3 px-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-600 data-[state=active]:text-white transition-all duration-300"
                    >
                      <Settings className="w-4 h-4" />
                      <span className="hidden sm:inline">Settings</span>
                    </TabsTrigger>
                  </TabsList>
                </div>

                <div className="flex-1">
                  {/* Basic Information Tab */}
                  <TabsContent value="basic">
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Info className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-slate-800">Basic Information</h3>
                          <p className="text-sm text-slate-600">Essential location details and identification</p>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <Label htmlFor="location-name" className="text-sm font-medium text-slate-700">Location Name *</Label>
                            <Input
                              id="location-name"
                              value={newLocation.name}
                              onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
                              placeholder="e.g., Main Warehouse, Downtown Store"
                              className="py-3 text-base border-slate-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all duration-200"
                            />
                          </div>

                          <div className="space-y-3">
                            <Label htmlFor="location-code" className="text-sm font-medium text-slate-700">Location Code</Label>
                            <Input
                              id="location-code"
                              value={newLocation.code}
                              onChange={(e) => setNewLocation({ ...newLocation, code: e.target.value })}
                              placeholder="e.g., WH-001, STORE-NYC"
                              className="py-3 text-base border-slate-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all duration-200"
                            />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Label htmlFor="location-description" className="text-sm font-medium text-slate-700">Description</Label>
                          <Textarea
                            id="location-description"
                            value={newLocation.description}
                            onChange={(e) => setNewLocation({ ...newLocation, description: e.target.value })}
                            placeholder="Brief description of the location, its purpose, and key features"
                            rows={3}
                            className="resize-none border-slate-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all duration-200"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <Label htmlFor="location-type" className="text-sm font-medium text-slate-700">Location Type</Label>
                            <select
                              id="location-type"
                              value={newLocation.locationType}
                              onChange={(e) => setNewLocation({ ...newLocation, locationType: e.target.value })}
                              className="w-full px-3 py-3 bg-white border border-slate-300 rounded-lg text-base focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all duration-200"
                            >
                              <option value="WAREHOUSE">Warehouse</option>
                              <option value="STORE">Retail Store</option>
                              <option value="DISTRIBUTION_CENTER">Distribution Center</option>
                              <option value="MANUFACTURING">Manufacturing Plant</option>
                              <option value="OFFICE">Office</option>
                              <option value="COLD_STORAGE">Cold Storage</option>
                              <option value="FULFILLMENT">Fulfillment Center</option>
                              <option value="OTHER">Other</option>
                            </select>
                          </div>

                          <div className="space-y-3">
                            <Label htmlFor="location-capacity" className="text-sm font-medium text-slate-700">Storage Capacity</Label>
                            <Input
                              id="location-capacity"
                              value={newLocation.capacity}
                              onChange={(e) => setNewLocation({ ...newLocation, capacity: e.target.value })}
                              placeholder="e.g., 10,000 sq ft, 500 pallets"
                              className="py-3 text-base border-slate-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all duration-200"
                            />
                          </div>
                        </div>

                        <div className="pt-6 border-t border-slate-200">
                          <h4 className="text-sm font-medium text-slate-800 mb-4">Location Status</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                              <input
                                type="checkbox"
                                id="location-active"
                                checked={newLocation.isActive}
                                onChange={(e) => setNewLocation({ ...newLocation, isActive: e.target.checked })}
                                className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
                              />
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                <div>
                                  <Label htmlFor="location-active" className="text-sm font-medium cursor-pointer">Active Location</Label>
                                  <p className="text-xs text-slate-500">Location is operational and accepting inventory</p>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                              <input
                                type="checkbox"
                                id="location-default"
                                checked={newLocation.isDefault}
                                onChange={(e) => setNewLocation({ ...newLocation, isDefault: e.target.checked })}
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                              />
                              <div className="flex items-center gap-2">
                                <Star className="w-4 h-4 text-blue-600" />
                                <div>
                                  <Label htmlFor="location-default" className="text-sm font-medium cursor-pointer">Default Location</Label>
                                  <p className="text-xs text-slate-500">Set as default for new inventory</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Address Tab */}
                  <TabsContent value="address">
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <MapPin className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-slate-800">Address Information</h3>
                          <p className="text-sm text-slate-600">Physical location and geographic coordinates</p>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="space-y-3">
                          <Label htmlFor="location-address" className="text-sm font-medium text-slate-700">Street Address</Label>
                          <Input
                            id="location-address"
                            value={newLocation.address}
                            onChange={(e) => setNewLocation({ ...newLocation, address: e.target.value })}
                            placeholder="e.g., 123 Business Park Drive"
                            className="py-3 text-base border-slate-300 focus:border-green-400 focus:ring-1 focus:ring-green-100 transition-all duration-200"
                          />
                        </div>

                        <div className="space-y-3">
                          <Label htmlFor="location-address2" className="text-sm font-medium text-slate-700">Address Line 2 (Optional)</Label>
                          <Input
                            id="location-address2"
                            value={newLocation.address2}
                            onChange={(e) => setNewLocation({ ...newLocation, address2: e.target.value })}
                            placeholder="e.g., Suite 100, Building A"
                            className="py-3 text-base border-slate-300 focus:border-green-400 focus:ring-1 focus:ring-green-100 transition-all duration-200"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="space-y-3">
                            <Label htmlFor="location-city" className="text-sm font-medium text-slate-700">City</Label>
                            <Input
                              id="location-city"
                              value={newLocation.city}
                              onChange={(e) => setNewLocation({ ...newLocation, city: e.target.value })}
                              placeholder="e.g., New York"
                              className="py-3 text-base border-slate-300 focus:border-green-400 focus:ring-1 focus:ring-green-100 transition-all duration-200"
                            />
                          </div>
                          
                          <div className="space-y-3">
                            <Label htmlFor="location-state" className="text-sm font-medium text-slate-700">State/Province</Label>
                            <Input
                              id="location-state"
                              value={newLocation.state}
                              onChange={(e) => setNewLocation({ ...newLocation, state: e.target.value })}
                              placeholder="e.g., NY"
                              className="py-3 text-base border-slate-300 focus:border-green-400 focus:ring-1 focus:ring-green-100 transition-all duration-200"
                            />
                          </div>

                          <div className="space-y-3">
                            <Label htmlFor="location-postal" className="text-sm font-medium text-slate-700">Postal Code</Label>
                            <Input
                              id="location-postal"
                              value={newLocation.postalCode}
                              onChange={(e) => setNewLocation({ ...newLocation, postalCode: e.target.value })}
                              placeholder="e.g., 10001"
                              className="py-3 text-base border-slate-300 focus:border-green-400 focus:ring-1 focus:ring-green-100 transition-all duration-200"
                            />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Label htmlFor="location-country" className="text-sm font-medium text-slate-700">Country</Label>
                          <Input
                            id="location-country"
                            value={newLocation.country}
                            onChange={(e) => setNewLocation({ ...newLocation, country: e.target.value })}
                            placeholder="e.g., United States"
                            className="py-3 text-base border-slate-300 focus:border-green-400 focus:ring-1 focus:ring-green-100 transition-all duration-200"
                          />
                        </div>

                        <div className="pt-6 border-t border-slate-200">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-sm font-medium text-slate-800">Geographic Coordinates (Optional)</h4>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={async () => {
                                if (!navigator.geolocation) {
                                  toast({
                                    title: "Geolocation Not Supported",
                                    description: "Your browser doesn't support geolocation. Please enter coordinates manually.",
                                    variant: "destructive"
                                  })
                                  return
                                }

                                toast({
                                  title: "Getting Location...",
                                  description: "Please allow location access to automatically fill coordinates.",
                                })

                                navigator.geolocation.getCurrentPosition(
                                  (position) => {
                                    const { latitude, longitude } = position.coords
                                    setNewLocation({
                                      ...newLocation,
                                      latitude: latitude.toString(),
                                      longitude: longitude.toString()
                                    })
                                    toast({
                                      title: "Location Retrieved",
                                      description: `Coordinates set: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
                                    })
                                  },
                                  (error) => {
                                    let errorMessage = "Unable to retrieve location."
                                    switch (error.code) {
                                      case error.PERMISSION_DENIED:
                                        errorMessage = "Location access denied. Please enable location permissions."
                                        break
                                      case error.POSITION_UNAVAILABLE:
                                        errorMessage = "Location information unavailable."
                                        break
                                      case error.TIMEOUT:
                                        errorMessage = "Location request timed out."
                                        break
                                    }
                                    toast({
                                      title: "Location Error",
                                      description: errorMessage,
                                      variant: "destructive"
                                    })
                                  },
                                  {
                                    enableHighAccuracy: true,
                                    timeout: 10000,
                                    maximumAge: 300000 // 5 minutes
                                  }
                                )
                              }}
                              className="flex items-center gap-2"
                            >
                              <MapPin className="w-4 h-4" />
                              Get Current Location
                            </Button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                              <Label htmlFor="location-latitude" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                Latitude
                                {newLocation.latitude && (
                                  <div className="flex items-center gap-1 text-green-600">
                                    <Check className="w-3 h-3" />
                                    <span className="text-xs">Auto-filled</span>
                                  </div>
                                )}
                              </Label>
                              <Input
                                id="location-latitude"
                                value={newLocation.latitude}
                                onChange={(e) => setNewLocation({ ...newLocation, latitude: e.target.value })}
                                placeholder="e.g., 40.7128"
                                className={`py-3 text-base transition-all duration-200 ${
                                  newLocation.latitude 
                                    ? 'border-green-300 bg-green-50/30 focus:border-green-400 focus:ring-1 focus:ring-green-100' 
                                    : 'border-slate-300 focus:border-green-400 focus:ring-1 focus:ring-green-100'
                                }`}
                              />
                            </div>

                            <div className="space-y-3">
                              <Label htmlFor="location-longitude" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                Longitude
                                {newLocation.longitude && (
                                  <div className="flex items-center gap-1 text-green-600">
                                    <Check className="w-3 h-3" />
                                    <span className="text-xs">Auto-filled</span>
                                  </div>
                                )}
                              </Label>
                              <Input
                                id="location-longitude"
                                value={newLocation.longitude}
                                onChange={(e) => setNewLocation({ ...newLocation, longitude: e.target.value })}
                                placeholder="e.g., -74.0060"
                                className={`py-3 text-base transition-all duration-200 ${
                                  newLocation.longitude 
                                    ? 'border-green-300 bg-green-50/30 focus:border-green-400 focus:ring-1 focus:ring-green-100' 
                                    : 'border-slate-300 focus:border-green-400 focus:ring-1 focus:ring-green-100'
                                }`}
                              />
                            </div>
                          </div>
                          <p className="text-xs text-slate-500 mt-2">Coordinates help with routing and mapping integrations</p>
                        </div>

                        <div className="space-y-3">
                          <Label htmlFor="location-timezone" className="text-sm font-medium text-slate-700">Timezone</Label>
                          <select
                            id="location-timezone"
                            value={newLocation.timezone}
                            onChange={(e) => setNewLocation({ ...newLocation, timezone: e.target.value })}
                            className="w-full px-3 py-3 bg-white border border-slate-300 rounded-lg text-base focus:border-green-400 focus:ring-1 focus:ring-green-100 transition-all duration-200"
                          >
                            <option value="">Select timezone</option>
                            <option value="America/New_York">Eastern Time (EST/EDT)</option>
                            <option value="America/Chicago">Central Time (CST/CDT)</option>
                            <option value="America/Denver">Mountain Time (MST/MDT)</option>
                            <option value="America/Los_Angeles">Pacific Time (PST/PDT)</option>
                            <option value="Europe/London">Greenwich Mean Time (GMT)</option>
                            <option value="Europe/Paris">Central European Time (CET)</option>
                            <option value="Asia/Tokyo">Japan Standard Time (JST)</option>
                            <option value="Asia/Shanghai">China Standard Time (CST)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Contact Tab */}
                  <TabsContent value="contact">
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <User className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-slate-800">Contact Information</h3>
                          <p className="text-sm text-slate-600">Primary contacts and management details</p>
                        </div>
                      </div>

                      <div className="space-y-8">
                        {/* Primary Contact */}
                        <div>
                          <h4 className="text-sm font-medium text-slate-800 mb-4">Primary Contact</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-3">
                              <Label htmlFor="location-contact-name" className="text-sm font-medium text-slate-700">Contact Name</Label>
                              <Input
                                id="location-contact-name"
                                value={newLocation.contactName}
                                onChange={(e) => setNewLocation({ ...newLocation, contactName: e.target.value })}
                                placeholder="e.g., John Smith"
                                className="py-3 text-base border-slate-300 focus:border-purple-400 focus:ring-1 focus:ring-purple-100 transition-all duration-200"
                              />
                            </div>

                            <div className="space-y-3">
                              <Label htmlFor="location-contact-phone" className="text-sm font-medium text-slate-700">Phone Number</Label>
                              <Input
                                id="location-contact-phone"
                                value={newLocation.contactPhone}
                                onChange={(e) => setNewLocation({ ...newLocation, contactPhone: e.target.value })}
                                placeholder="e.g., +1 (555) 123-4567"
                                className="py-3 text-base border-slate-300 focus:border-purple-400 focus:ring-1 focus:ring-purple-100 transition-all duration-200"
                              />
                            </div>

                            <div className="space-y-3">
                              <Label htmlFor="location-contact-email" className="text-sm font-medium text-slate-700">Email Address</Label>
                              <Input
                                id="location-contact-email"
                                type="email"
                                value={newLocation.contactEmail}
                                onChange={(e) => setNewLocation({ ...newLocation, contactEmail: e.target.value })}
                                placeholder="e.g., contact@location.com"
                                className="py-3 text-base border-slate-300 focus:border-purple-400 focus:ring-1 focus:ring-purple-100 transition-all duration-200"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Manager Information */}
                        <div className="pt-6 border-t border-slate-200">
                          <h4 className="text-sm font-medium text-slate-800 mb-4">Location Manager</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-3">
                              <Label htmlFor="location-manager-name" className="text-sm font-medium text-slate-700">Manager Name</Label>
                              <Input
                                id="location-manager-name"
                                value={newLocation.managerName}
                                onChange={(e) => setNewLocation({ ...newLocation, managerName: e.target.value })}
                                placeholder="e.g., Sarah Johnson"
                                className="py-3 text-base border-slate-300 focus:border-purple-400 focus:ring-1 focus:ring-purple-100 transition-all duration-200"
                              />
                            </div>

                            <div className="space-y-3">
                              <Label htmlFor="location-manager-phone" className="text-sm font-medium text-slate-700">Manager Phone</Label>
                              <Input
                                id="location-manager-phone"
                                value={newLocation.managerPhone}
                                onChange={(e) => setNewLocation({ ...newLocation, managerPhone: e.target.value })}
                                placeholder="e.g., +1 (555) 987-6543"
                                className="py-3 text-base border-slate-300 focus:border-purple-400 focus:ring-1 focus:ring-purple-100 transition-all duration-200"
                              />
                            </div>

                            <div className="space-y-3">
                              <Label htmlFor="location-manager-email" className="text-sm font-medium text-slate-700">Manager Email</Label>
                              <Input
                                id="location-manager-email"
                                type="email"
                                value={newLocation.managerEmail}
                                onChange={(e) => setNewLocation({ ...newLocation, managerEmail: e.target.value })}
                                placeholder="e.g., manager@location.com"
                                className="py-3 text-base border-slate-300 focus:border-purple-400 focus:ring-1 focus:ring-purple-100 transition-all duration-200"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Operating Hours */}
                        <div className="pt-6 border-t border-slate-200">
                          <div className="space-y-3">
                            <Label htmlFor="location-hours" className="text-sm font-medium text-slate-700">Operating Hours</Label>
                            <Textarea
                              id="location-hours"
                              value={newLocation.operatingHours}
                              onChange={(e) => setNewLocation({ ...newLocation, operatingHours: e.target.value })}
                              placeholder="e.g., Mon-Fri: 8:00 AM - 6:00 PM, Sat: 9:00 AM - 4:00 PM, Sun: Closed"
                              rows={3}
                              className="resize-none border-slate-300 focus:border-purple-400 focus:ring-1 focus:ring-purple-100 transition-all duration-200"
                            />
                            <p className="text-xs text-slate-500">Specify the operational hours for this location</p>
                          </div>
                        </div>

                        {/* Contact Summary */}
                        <div className="mt-8 p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                          <h4 className="text-sm font-semibold text-slate-800 mb-3">Contact Summary</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-purple-600" />
                              <span className="text-slate-600">Primary: {newLocation.contactPhone || 'Not provided'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-purple-600" />
                              <span className="text-slate-600">Email: {newLocation.contactEmail || 'Not provided'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <UserCheck className="w-4 h-4 text-purple-600" />
                              <span className="text-slate-600">Manager: {newLocation.managerName || 'Not assigned'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-purple-600" />
                              <span className="text-slate-600">Hours: {newLocation.operatingHours ? 'Configured' : 'Not set'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Settings Tab */}
                  <TabsContent value="settings">
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-orange-100 rounded-lg">
                          <Settings className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-slate-800">Advanced Settings</h3>
                          <p className="text-sm text-slate-600">Specialized configurations and operational parameters</p>
                        </div>
                      </div>

                      <div className="space-y-8">
                        {/* Warehouse Configuration */}
                        <div>
                          <h4 className="text-sm font-medium text-slate-800 mb-4">Warehouse Configuration</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                              <Label htmlFor="location-zone" className="text-sm font-medium text-slate-700">Warehouse Zone</Label>
                              <Input
                                id="location-zone"
                                value={newLocation.warehouseZone}
                                onChange={(e) => setNewLocation({ ...newLocation, warehouseZone: e.target.value })}
                                placeholder="e.g., Zone A, Sector 1, North Wing"
                                className="py-3 text-base border-slate-300 focus:border-orange-400 focus:ring-1 focus:ring-orange-100 transition-all duration-200"
                              />
                            </div>

                            <div className="space-y-3">
                              <Label htmlFor="location-security" className="text-sm font-medium text-slate-700">Security Level</Label>
                              <select
                                id="location-security"
                                value={newLocation.securityLevel}
                                onChange={(e) => setNewLocation({ ...newLocation, securityLevel: e.target.value })}
                                className="w-full px-3 py-3 bg-white border border-slate-300 rounded-lg text-base focus:border-orange-400 focus:ring-1 focus:ring-orange-100 transition-all duration-200"
                              >
                                <option value="STANDARD">Standard Security</option>
                                <option value="HIGH">High Security</option>
                                <option value="MAXIMUM">Maximum Security</option>
                                <option value="RESTRICTED">Restricted Access</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* Special Features */}
                        <div className="pt-6 border-t border-slate-200">
                          <h4 className="text-sm font-medium text-slate-800 mb-4">Special Features</h4>
                          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                            <div className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                              <input
                                type="checkbox"
                                id="location-temperature"
                                checked={newLocation.temperatureControlled}
                                onChange={(e) => setNewLocation({ ...newLocation, temperatureControlled: e.target.checked })}
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                              />
                              <div className="flex items-center gap-2">
                                <Thermometer className="w-4 h-4 text-blue-600" />
                                <div>
                                  <Label htmlFor="location-temperature" className="text-sm font-medium cursor-pointer">Temperature Controlled</Label>
                                  <p className="text-xs text-slate-500">Climate-controlled environment for sensitive products</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Special Instructions */}
                        <div className="pt-6 border-t border-slate-200">
                          <div className="space-y-3">
                            <Label htmlFor="location-instructions" className="text-sm font-medium text-slate-700">Special Instructions</Label>
                            <Textarea
                              id="location-instructions"
                              value={newLocation.specialInstructions}
                              onChange={(e) => setNewLocation({ ...newLocation, specialInstructions: e.target.value })}
                              placeholder="Any special handling requirements, access procedures, or operational notes"
                              rows={4}
                              className="resize-none border-slate-300 focus:border-orange-400 focus:ring-1 focus:ring-orange-100 transition-all duration-200"
                            />
                          </div>
                        </div>

                        {/* Internal Notes */}
                        <div className="pt-6 border-t border-slate-200">
                          <div className="space-y-3">
                            <Label htmlFor="location-notes" className="text-sm font-medium text-slate-700">Internal Notes</Label>
                            <Textarea
                              id="location-notes"
                              value={newLocation.notes}
                              onChange={(e) => setNewLocation({ ...newLocation, notes: e.target.value })}
                              placeholder="Internal notes for staff use only (not visible to customers)"
                              rows={4}
                              className="resize-none border-slate-300 focus:border-orange-400 focus:ring-1 focus:ring-orange-100 transition-all duration-200"
                            />
                            <p className="text-xs text-slate-500">These notes are for internal use and won't be displayed to external users</p>
                          </div>
                        </div>

                        {/* Location Configuration Summary */}
                        <div className="mt-8 p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg border border-orange-200">
                          <h4 className="text-sm font-semibold text-slate-800 mb-3">Configuration Summary</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${newLocation.isActive ? 'bg-green-500' : 'bg-orange-500'}`}></div>
                              <span className="text-slate-600">{newLocation.isActive ? 'Active' : 'Inactive'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${newLocation.isDefault ? 'bg-blue-500' : 'bg-gray-400'}`}></div>
                              <span className="text-slate-600">{newLocation.isDefault ? 'Default' : 'Standard'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${newLocation.temperatureControlled ? 'bg-blue-500' : 'bg-gray-400'}`}></div>
                              <span className="text-slate-600">{newLocation.temperatureControlled ? 'Climate Controlled' : 'Standard Storage'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Shield className="w-3 h-3 text-orange-600" />
                              <span className="text-slate-600">{newLocation.securityLevel || 'Standard'} Security</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </div>

            <DialogFooter className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between w-full">
                <div className="text-sm text-slate-600">
                  <span className="font-medium">{newLocation.name || 'New Location'}</span>
                  {newLocation.locationType && (
                    <span className="ml-2 px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs">
                      {newLocation.locationType.replace('_', ' ')}
                    </span>
                  )}
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setShowAddLocationDialog(false)} className="px-6">
                    Cancel
                  </Button>
                  <Button onClick={async () => {
                    try {
                      if (!newLocation.name) {
                        toast({
                          title: "Validation Error",
                          description: "Location name is required",
                          variant: "destructive"
                        })
                        return
                      }

                      // Generate a unique code if none provided
                      const locationData = {
                        ...newLocation,
                        companyId: companyId,
                        tenantId: getTenantId()
                      }

                      // If no code provided, generate one
                      if (!locationData.code || locationData.code.trim() === '') {
                        locationData.code = `LOC-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`
                      }

                      console.log('Creating location with data:', locationData)
                      const createdLocation = await inventoryApi.createLocation(locationData)
                      console.log('Created location response:', createdLocation)

                      toast({
                        title: "Success",
                        description: "Location created successfully",
                      })

                      // Reset form
                      setNewLocation({
                        name: '',
                        code: '',
                        description: '',
                        locationType: 'WAREHOUSE',
                        address: '',
                        address2: '',
                        city: '',
                        state: '',
                        country: '',
                        postalCode: '',
                        latitude: '',
                        longitude: '',
                        contactName: '',
                        contactPhone: '',
                        contactEmail: '',
                        managerName: '',
                        managerEmail: '',
                        managerPhone: '',
                        isActive: true,
                        isDefault: false,
                        capacity: '',
                        timezone: '',
                        operatingHours: '',
                        specialInstructions: '',
                        warehouseZone: '',
                        temperatureControlled: false,
                        securityLevel: 'STANDARD',
                        notes: ''
                      })

                      setShowAddLocationDialog(false)

                      // Refresh locations list
                      queryClient.invalidateQueries({ queryKey: ['locations'] })
                    } catch (error: any) {
                      console.error('Location creation error:', error)
                      
                      let errorMessage = "Failed to create location. Please try again."
                      
                      if (error?.response?.data?.error === 'Location code already exists') {
                        errorMessage = error.response.data.message || "A location with this code already exists. Please choose a different code."
                      } else if (error?.response?.data?.message) {
                        errorMessage = error.response.data.message
                      } else if (error?.message) {
                        errorMessage = error.message
                      }
                      
                      toast({
                        title: "Error",
                        description: errorMessage,
                        variant: "destructive"
                      })
                    }
                  }} className="px-8 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700">
                    Create Location
                  </Button>
                </div>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Location Dialog */}
        <Dialog open={showViewLocationDialog} onOpenChange={setShowViewLocationDialog}>
          <DialogContent className="!max-w-6xl max-h-[95vh] overflow-y-auto w-[95vw] md:max-h-[90vh] md:w-[90vw] bg-gradient-to-br from-slate-50 to-blue-50">
            <DialogHeader className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold text-slate-800">Location Details</DialogTitle>
                  <p className="text-slate-600 mt-1">Complete location information and statistics</p>
                </div>
              </div>
            </DialogHeader>

            {selectedLocationForDialog && (
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Info className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800">Basic Information</h3>
                      <p className="text-sm text-slate-600">Essential location details and identification</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Location Name</Label>
                        <p className="text-lg font-semibold text-slate-800">{selectedLocationForDialog.name}</p>
                    </div>
                    <div>
                        <Label className="text-sm font-medium text-gray-500">Location Code</Label>
                        <p className="text-sm text-slate-700">{selectedLocationForDialog.code || 'Not specified'}</p>
                    </div>
                    <div>
                        <Label className="text-sm font-medium text-gray-500">Location Type</Label>
                      <Badge variant="outline" className="mt-1">
                          {selectedLocationForDialog.locationType || selectedLocationForDialog.type || 'WAREHOUSE'}
                      </Badge>
                    </div>
                    </div>

                    <div className="space-y-4">
                    <div>
                        <Label className="text-sm font-medium text-gray-500">Status</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={selectedLocationForDialog.isActive ? "default" : "secondary"}>
                            {selectedLocationForDialog.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          {selectedLocationForDialog.isDefault && (
                            <Badge variant="outline">Default Location</Badge>
                          )}
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Description</Label>
                        <p className="text-sm text-slate-700 mt-1">{selectedLocationForDialog.description || 'No description provided'}</p>
                      </div>
                    </div>
                    </div>
                  </div>

                {/* Address Information */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <MapPin className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800">Address Information</h3>
                      <p className="text-sm text-slate-600">Physical location and geographic coordinates</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Street Address</Label>
                        <p className="text-sm text-slate-700">{selectedLocationForDialog.address || 'No address provided'}</p>
                      </div>
                      {selectedLocationForDialog.address2 && (
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Address Line 2</Label>
                          <p className="text-sm text-slate-700">{selectedLocationForDialog.address2}</p>
                        </div>
                      )}
                      <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">City</Label>
                          <p className="text-sm text-slate-700">{selectedLocationForDialog.city || 'Not specified'}</p>
                    </div>
                    <div>
                          <Label className="text-sm font-medium text-gray-500">State</Label>
                          <p className="text-sm text-slate-700">{selectedLocationForDialog.state || 'Not specified'}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Postal Code</Label>
                          <p className="text-sm text-slate-700">{selectedLocationForDialog.postalCode || 'Not specified'}</p>
                        </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Country</Label>
                        <p className="text-sm text-slate-700">{selectedLocationForDialog.country || 'Not specified'}</p>
                    </div>
                    </div>

                    <div className="space-y-4">
                      {(selectedLocationForDialog.latitude || selectedLocationForDialog.longitude) && (
                    <div>
                          <Label className="text-sm font-medium text-gray-500">Geographic Coordinates</Label>
                          <div className="flex gap-4 mt-1">
                            <div>
                              <span className="text-xs text-gray-500">Latitude:</span>
                              <p className="text-sm font-mono text-slate-700">{selectedLocationForDialog.latitude || 'Not set'}</p>
                            </div>
                            <div>
                              <span className="text-xs text-gray-500">Longitude:</span>
                              <p className="text-sm font-mono text-slate-700">{selectedLocationForDialog.longitude || 'Not set'}</p>
                            </div>
                          </div>
                        </div>
                      )}
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Timezone</Label>
                        <p className="text-sm text-slate-700">{selectedLocationForDialog.timezone || 'Not specified'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                {(selectedLocationForDialog.contactName || selectedLocationForDialog.managerName) && (
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <User className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-800">Contact Information</h3>
                        <p className="text-sm text-slate-600">Primary contacts and management details</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {selectedLocationForDialog.contactName && (
                        <div>
                          <h4 className="text-sm font-medium text-slate-800 mb-3">Primary Contact</h4>
                          <div className="space-y-3">
                      <div>
                        <Label className="text-xs text-gray-500">Contact Name</Label>
                              <p className="text-sm text-slate-700">{selectedLocationForDialog.contactName}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Phone</Label>
                              <p className="text-sm text-slate-700">{selectedLocationForDialog.contactPhone || 'Not provided'}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Email</Label>
                              <p className="text-sm text-slate-700 break-words">{selectedLocationForDialog.contactEmail || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>
                )}

                      {selectedLocationForDialog.managerName && (
                        <div>
                          <h4 className="text-sm font-medium text-slate-800 mb-3">Manager Information</h4>
                          <div className="space-y-3">
                            <div>
                              <Label className="text-xs text-gray-500">Manager Name</Label>
                              <p className="text-sm text-slate-700">{selectedLocationForDialog.managerName}</p>
                            </div>
                            <div>
                              <Label className="text-xs text-gray-500">Manager Phone</Label>
                              <p className="text-sm text-slate-700">{selectedLocationForDialog.managerPhone || 'Not provided'}</p>
                            </div>
                            <div>
                              <Label className="text-xs text-gray-500">Manager Email</Label>
                              <p className="text-sm text-slate-700 break-words">{selectedLocationForDialog.managerEmail || 'Not provided'}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Settings & Operations */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Settings className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800">Settings & Operations</h3>
                      <p className="text-sm text-slate-600">Operational settings and special configurations</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Storage Capacity</Label>
                        <p className="text-sm text-slate-700">{selectedLocationForDialog.capacity || 'Not specified'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Operating Hours</Label>
                        <p className="text-sm text-slate-700">{selectedLocationForDialog.operatingHours || 'Not specified'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Security Level</Label>
                        <Badge variant="outline" className="mt-1">
                          {selectedLocationForDialog.securityLevel || 'STANDARD'}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Special Features</Label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {selectedLocationForDialog.temperatureControlled && (
                            <Badge variant="secondary">Temperature Controlled</Badge>
                          )}
                          {selectedLocationForDialog.isDefault && (
                            <Badge variant="outline">Default Location</Badge>
                          )}
                        </div>
                      </div>
                      {selectedLocationForDialog.notes && (
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Notes</Label>
                          <p className="text-sm text-slate-700 mt-1">{selectedLocationForDialog.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Statistics */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <BarChart3 className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800">Location Statistics</h3>
                      <p className="text-sm text-slate-600">Inventory and activity metrics</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{selectedLocationForDialog._count?.products || 0}</p>
                      <p className="text-sm text-gray-500">Products</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">{selectedLocationForDialog._count?.movements || 0}</p>
                      <p className="text-sm text-gray-500">Movements</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <p className="text-2xl font-bold text-purple-600">{selectedLocationForDialog._count?.transfers || 0}</p>
                      <p className="text-sm text-gray-500">Transfers</p>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <p className="text-2xl font-bold text-orange-600">{selectedLocationForDialog._count?.alerts || 0}</p>
                      <p className="text-sm text-gray-500">Alerts</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
              <Button variant="outline" onClick={() => setShowViewLocationDialog(false)}>
                Close
              </Button>
              <Button onClick={() => {
                setShowViewLocationDialog(false)
                handleEditLocation(selectedLocationForDialog)
              }} className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700">
                Edit Location
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Location Dialog */}
        <Dialog open={showEditLocationDialog} onOpenChange={setShowEditLocationDialog}>
          <DialogContent className="!max-w-7xl max-h-[95vh] overflow-y-auto w-[95vw] md:max-h-[90vh] md:w-[90vw] bg-gradient-to-br from-slate-50 to-blue-50">
            <DialogHeader className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold text-slate-800">Edit Location</DialogTitle>
                  <p className="text-slate-600 mt-1">Update location information and settings</p>
                </div>
              </div>
            </DialogHeader>

            <div className="flex-1">
              <Tabs defaultValue="basic" className="h-full flex flex-col">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-2 mb-4">
                  <TabsList className="grid w-full grid-cols-4 gap-1">
                    <TabsTrigger 
                      value="basic" 
                      className="flex items-center gap-2 py-3 px-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white transition-all duration-300"
                    >
                      <Info className="w-4 h-4" />
                      <span className="hidden sm:inline">Basic Info</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="address" 
                      className="flex items-center gap-2 py-3 px-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white transition-all duration-300"
                    >
                      <MapPin className="w-4 h-4" />
                      <span className="hidden sm:inline">Address</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="contact" 
                      className="flex items-center gap-2 py-3 px-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white transition-all duration-300"
                    >
                      <User className="w-4 h-4" />
                      <span className="hidden sm:inline">Contact</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="settings" 
                      className="flex items-center gap-2 py-3 px-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-600 data-[state=active]:text-white transition-all duration-300"
                    >
                      <Settings className="w-4 h-4" />
                      <span className="hidden sm:inline">Settings</span>
                    </TabsTrigger>
                  </TabsList>
                </div>

                <div className="flex-1">
                  {/* Basic Information Tab */}
                  <TabsContent value="basic">
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Info className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-slate-800">Basic Information</h3>
                          <p className="text-sm text-slate-600">Essential location details and identification</p>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <Label htmlFor="edit-location-name" className="text-sm font-medium text-slate-700">Location Name *</Label>
                  <Input
                    id="edit-location-name"
                    value={newLocation.name}
                    onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
                              placeholder="e.g., Main Warehouse, Downtown Store"
                              className="py-3 text-base border-slate-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all duration-200"
                  />
                </div>

                          <div className="space-y-3">
                            <Label htmlFor="edit-location-code" className="text-sm font-medium text-slate-700">Location Code</Label>
                  <Input
                    id="edit-location-code"
                    value={newLocation.code}
                    onChange={(e) => setNewLocation({ ...newLocation, code: e.target.value })}
                              placeholder="e.g., WH-001, STORE-NYC"
                              className="py-3 text-base border-slate-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all duration-200"
                  />
                </div>
              </div>

                        <div className="space-y-3">
                          <Label htmlFor="edit-location-description" className="text-sm font-medium text-slate-700">Description</Label>
                          <Textarea
                            id="edit-location-description"
                            value={newLocation.description}
                            onChange={(e) => setNewLocation({ ...newLocation, description: e.target.value })}
                            placeholder="Brief description of the location, its purpose, and key features"
                            rows={3}
                            className="resize-none border-slate-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all duration-200"
                          />
                        </div>

                        <div className="space-y-3">
                          <Label htmlFor="edit-location-type" className="text-sm font-medium text-slate-700">Location Type</Label>
                          <Select 
                            value={newLocation.locationType} 
                            onValueChange={(value) => setNewLocation({ ...newLocation, locationType: value })}
                          >
                            <SelectTrigger className="py-3 text-base border-slate-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all duration-200">
                              <SelectValue placeholder="Select location type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="WAREHOUSE">Warehouse</SelectItem>
                              <SelectItem value="STORE">Store</SelectItem>
                              <SelectItem value="OFFICE">Office</SelectItem>
                              <SelectItem value="DISTRIBUTION_CENTER">Distribution Center</SelectItem>
                              <SelectItem value="FACTORY">Factory</SelectItem>
                              <SelectItem value="SHOWROOM">Showroom</SelectItem>
                              <SelectItem value="OTHER">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                            <input
                              type="checkbox"
                              id="edit-location-active"
                              checked={newLocation.isActive}
                              onChange={(e) => setNewLocation({ ...newLocation, isActive: e.target.checked })}
                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <div>
                                <Label htmlFor="edit-location-active" className="text-sm font-medium cursor-pointer">Active Location</Label>
                                <p className="text-xs text-slate-500 mt-1">Location is operational and available</p>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                            <input
                              type="checkbox"
                              id="edit-location-default"
                              checked={newLocation.isDefault}
                              onChange={(e) => setNewLocation({ ...newLocation, isDefault: e.target.checked })}
                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <div className="flex items-center gap-2">
                              <Star className="w-4 h-4 text-blue-600" />
                              <div>
                                <Label htmlFor="edit-location-default" className="text-sm font-medium cursor-pointer">Default Location</Label>
                                <p className="text-xs text-slate-500 mt-1">Set as default for new inventory</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Address Tab */}
                  <TabsContent value="address">
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <MapPin className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-slate-800">Address Information</h3>
                          <p className="text-sm text-slate-600">Physical location and geographic coordinates</p>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="space-y-3">
                          <Label htmlFor="edit-location-address" className="text-sm font-medium text-slate-700">Street Address</Label>
                <Input
                  id="edit-location-address"
                  value={newLocation.address}
                  onChange={(e) => setNewLocation({ ...newLocation, address: e.target.value })}
                            placeholder="e.g., 123 Business Park Drive"
                            className="py-3 text-base border-slate-300 focus:border-green-400 focus:ring-1 focus:ring-green-100 transition-all duration-200"
                />
              </div>

                        <div className="space-y-3">
                          <Label htmlFor="edit-location-address2" className="text-sm font-medium text-slate-700">Address Line 2 (Optional)</Label>
                          <Input
                            id="edit-location-address2"
                            value={newLocation.address2}
                            onChange={(e) => setNewLocation({ ...newLocation, address2: e.target.value })}
                            placeholder="e.g., Suite 100, Building A"
                            className="py-3 text-base border-slate-300 focus:border-green-400 focus:ring-1 focus:ring-green-100 transition-all duration-200"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="space-y-3">
                            <Label htmlFor="edit-location-city" className="text-sm font-medium text-slate-700">City</Label>
                  <Input
                    id="edit-location-city"
                    value={newLocation.city}
                    onChange={(e) => setNewLocation({ ...newLocation, city: e.target.value })}
                              placeholder="e.g., New York"
                              className="py-3 text-base border-slate-300 focus:border-green-400 focus:ring-1 focus:ring-green-100 transition-all duration-200"
                  />
                </div>
                          
                          <div className="space-y-3">
                            <Label htmlFor="edit-location-state" className="text-sm font-medium text-slate-700">State/Province</Label>
                  <Input
                    id="edit-location-state"
                    value={newLocation.state}
                    onChange={(e) => setNewLocation({ ...newLocation, state: e.target.value })}
                              placeholder="e.g., NY"
                              className="py-3 text-base border-slate-300 focus:border-green-400 focus:ring-1 focus:ring-green-100 transition-all duration-200"
                  />
                </div>

                          <div className="space-y-3">
                            <Label htmlFor="edit-location-postal" className="text-sm font-medium text-slate-700">Postal Code</Label>
                            <Input
                              id="edit-location-postal"
                              value={newLocation.postalCode}
                              onChange={(e) => setNewLocation({ ...newLocation, postalCode: e.target.value })}
                              placeholder="e.g., 10001"
                              className="py-3 text-base border-slate-300 focus:border-green-400 focus:ring-1 focus:ring-green-100 transition-all duration-200"
                            />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Label htmlFor="edit-location-country" className="text-sm font-medium text-slate-700">Country</Label>
                  <Input
                    id="edit-location-country"
                    value={newLocation.country}
                    onChange={(e) => setNewLocation({ ...newLocation, country: e.target.value })}
                            placeholder="e.g., United States"
                            className="py-3 text-base border-slate-300 focus:border-green-400 focus:ring-1 focus:ring-green-100 transition-all duration-200"
                  />
                </div>

                        <div className="pt-6 border-t border-slate-200">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-sm font-medium text-slate-800">Geographic Coordinates (Optional)</h4>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={async () => {
                                if (!navigator.geolocation) {
                                  toast({
                                    title: "Geolocation Not Supported",
                                    description: "Your browser doesn't support geolocation. Please enter coordinates manually.",
                                    variant: "destructive"
                                  })
                                  return
                                }

                                toast({
                                  title: "Getting Location...",
                                  description: "Please allow location access to automatically fill coordinates.",
                                })

                                navigator.geolocation.getCurrentPosition(
                                  (position) => {
                                    const { latitude, longitude } = position.coords
                                    setNewLocation({
                                      ...newLocation,
                                      latitude: latitude.toString(),
                                      longitude: longitude.toString()
                                    })
                                    toast({
                                      title: "Location Retrieved",
                                      description: `Coordinates set: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
                                    })
                                  },
                                  (error) => {
                                    let errorMessage = "Unable to retrieve location."
                                    switch (error.code) {
                                      case error.PERMISSION_DENIED:
                                        errorMessage = "Location access denied. Please enable location permissions."
                                        break
                                      case error.POSITION_UNAVAILABLE:
                                        errorMessage = "Location information unavailable."
                                        break
                                      case error.TIMEOUT:
                                        errorMessage = "Location request timed out."
                                        break
                                    }
                                    toast({
                                      title: "Location Error",
                                      description: errorMessage,
                                      variant: "destructive"
                                    })
                                  },
                                  {
                                    enableHighAccuracy: true,
                                    timeout: 10000,
                                    maximumAge: 300000 // 5 minutes
                                  }
                                )
                              }}
                              className="flex items-center gap-2"
                            >
                              <MapPin className="w-4 h-4" />
                              Get Current Location
                            </Button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                              <Label htmlFor="edit-location-latitude" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                Latitude
                                {newLocation.latitude && (
                                  <div className="flex items-center gap-1 text-green-600">
                                    <Check className="w-3 h-3" />
                                    <span className="text-xs">Auto-filled</span>
                                  </div>
                                )}
                              </Label>
                              <Input
                                id="edit-location-latitude"
                                value={newLocation.latitude}
                                onChange={(e) => setNewLocation({ ...newLocation, latitude: e.target.value })}
                                placeholder="e.g., 40.7128"
                                className={`py-3 text-base transition-all duration-200 ${
                                  newLocation.latitude 
                                    ? 'border-green-300 bg-green-50/30 focus:border-green-400 focus:ring-1 focus:ring-green-100' 
                                    : 'border-slate-300 focus:border-green-400 focus:ring-1 focus:ring-green-100'
                                }`}
                              />
              </div>

                            <div className="space-y-3">
                              <Label htmlFor="edit-location-longitude" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                Longitude
                                {newLocation.longitude && (
                                  <div className="flex items-center gap-1 text-green-600">
                                    <Check className="w-3 h-3" />
                                    <span className="text-xs">Auto-filled</span>
                                  </div>
                                )}
                              </Label>
                              <Input
                                id="edit-location-longitude"
                                value={newLocation.longitude}
                                onChange={(e) => setNewLocation({ ...newLocation, longitude: e.target.value })}
                                placeholder="e.g., -74.0060"
                                className={`py-3 text-base transition-all duration-200 ${
                                  newLocation.longitude 
                                    ? 'border-green-300 bg-green-50/30 focus:border-green-400 focus:ring-1 focus:ring-green-100' 
                                    : 'border-slate-300 focus:border-green-400 focus:ring-1 focus:ring-green-100'
                                }`}
                              />
                            </div>
                          </div>
                          <p className="text-xs text-slate-500 mt-2">Coordinates help with routing and mapping integrations</p>
                        </div>

                        <div className="space-y-3">
                          <Label htmlFor="edit-location-timezone" className="text-sm font-medium text-slate-700">Timezone</Label>
                          <select
                            id="edit-location-timezone"
                            value={newLocation.timezone}
                            onChange={(e) => setNewLocation({ ...newLocation, timezone: e.target.value })}
                            className="w-full px-3 py-3 bg-white border border-slate-300 rounded-lg text-base focus:border-green-400 focus:ring-1 focus:ring-green-100 transition-all duration-200"
                          >
                            <option value="">Select timezone</option>
                            <option value="America/New_York">Eastern Time (EST/EDT)</option>
                            <option value="America/Chicago">Central Time (CST/CDT)</option>
                            <option value="America/Denver">Mountain Time (MST/MDT)</option>
                            <option value="America/Los_Angeles">Pacific Time (PST/PDT)</option>
                            <option value="Europe/London">Greenwich Mean Time (GMT)</option>
                            <option value="Europe/Paris">Central European Time (CET)</option>
                            <option value="Asia/Tokyo">Japan Standard Time (JST)</option>
                            <option value="Asia/Shanghai">China Standard Time (CST)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Contact Tab */}
                  <TabsContent value="contact">
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <User className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-slate-800">Contact Information</h3>
                          <p className="text-sm text-slate-600">Primary contacts and management details</p>
                        </div>
                      </div>

                      <div className="space-y-8">
                        {/* Primary Contact */}
                        <div>
                          <h4 className="text-sm font-medium text-slate-800 mb-4">Primary Contact</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-3">
                              <Label htmlFor="edit-location-contact-name" className="text-sm font-medium text-slate-700">Contact Name</Label>
                    <Input
                      id="edit-location-contact-name"
                      value={newLocation.contactName}
                      onChange={(e) => setNewLocation({ ...newLocation, contactName: e.target.value })}
                                placeholder="e.g., John Smith"
                                className="py-3 text-base border-slate-300 focus:border-purple-400 focus:ring-1 focus:ring-purple-100 transition-all duration-200"
                    />
                  </div>

                            <div className="space-y-3">
                              <Label htmlFor="edit-location-contact-phone" className="text-sm font-medium text-slate-700">Phone Number</Label>
                    <Input
                      id="edit-location-contact-phone"
                      value={newLocation.contactPhone}
                      onChange={(e) => setNewLocation({ ...newLocation, contactPhone: e.target.value })}
                                placeholder="e.g., +1 (555) 123-4567"
                                className="py-3 text-base border-slate-300 focus:border-purple-400 focus:ring-1 focus:ring-purple-100 transition-all duration-200"
                    />
                  </div>

                            <div className="space-y-3">
                              <Label htmlFor="edit-location-contact-email" className="text-sm font-medium text-slate-700">Email Address</Label>
                    <Input
                      id="edit-location-contact-email"
                      type="email"
                      value={newLocation.contactEmail}
                      onChange={(e) => setNewLocation({ ...newLocation, contactEmail: e.target.value })}
                                placeholder="e.g., contact@location.com"
                                className="py-3 text-base border-slate-300 focus:border-purple-400 focus:ring-1 focus:ring-purple-100 transition-all duration-200"
                    />
                  </div>
                </div>
              </div>

                        {/* Manager Information */}
                        <div>
                          <h4 className="text-sm font-medium text-slate-800 mb-4">Manager Information</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-3">
                              <Label htmlFor="edit-location-manager-name" className="text-sm font-medium text-slate-700">Manager Name</Label>
                              <Input
                                id="edit-location-manager-name"
                                value={newLocation.managerName}
                                onChange={(e) => setNewLocation({ ...newLocation, managerName: e.target.value })}
                                placeholder="e.g., Jane Doe"
                                className="py-3 text-base border-slate-300 focus:border-purple-400 focus:ring-1 focus:ring-purple-100 transition-all duration-200"
                              />
            </div>

                            <div className="space-y-3">
                              <Label htmlFor="edit-location-manager-phone" className="text-sm font-medium text-slate-700">Manager Phone</Label>
                              <Input
                                id="edit-location-manager-phone"
                                value={newLocation.managerPhone}
                                onChange={(e) => setNewLocation({ ...newLocation, managerPhone: e.target.value })}
                                placeholder="e.g., +1 (555) 987-6543"
                                className="py-3 text-base border-slate-300 focus:border-purple-400 focus:ring-1 focus:ring-purple-100 transition-all duration-200"
                              />
                            </div>

                            <div className="space-y-3">
                              <Label htmlFor="edit-location-manager-email" className="text-sm font-medium text-slate-700">Manager Email</Label>
                              <Input
                                id="edit-location-manager-email"
                                type="email"
                                value={newLocation.managerEmail}
                                onChange={(e) => setNewLocation({ ...newLocation, managerEmail: e.target.value })}
                                placeholder="e.g., manager@location.com"
                                className="py-3 text-base border-slate-300 focus:border-purple-400 focus:ring-1 focus:ring-purple-100 transition-all duration-200"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Settings Tab */}
                  <TabsContent value="settings">
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-orange-100 rounded-lg">
                          <Settings className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-slate-800">Location Settings</h3>
                          <p className="text-sm text-slate-600">Operational settings and special configurations</p>
                        </div>
                      </div>

                      <div className="space-y-8">
                        {/* Capacity & Operations */}
                        <div>
                          <h4 className="text-sm font-medium text-slate-800 mb-4">Capacity & Operations</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                              <Label htmlFor="edit-location-capacity" className="text-sm font-medium text-slate-700">Storage Capacity</Label>
                              <Input
                                id="edit-location-capacity"
                                value={newLocation.capacity}
                                onChange={(e) => setNewLocation({ ...newLocation, capacity: e.target.value })}
                                placeholder="e.g., 1000 sq ft, 500 pallets"
                                className="py-3 text-base border-slate-300 focus:border-orange-400 focus:ring-1 focus:ring-orange-100 transition-all duration-200"
                              />
                            </div>

                            <div className="space-y-3">
                              <Label htmlFor="edit-location-operating-hours" className="text-sm font-medium text-slate-700">Operating Hours</Label>
                              <Input
                                id="edit-location-operating-hours"
                                value={newLocation.operatingHours}
                                onChange={(e) => setNewLocation({ ...newLocation, operatingHours: e.target.value })}
                                placeholder="e.g., Mon-Fri 8AM-6PM"
                                className="py-3 text-base border-slate-300 focus:border-orange-400 focus:ring-1 focus:ring-orange-100 transition-all duration-200"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Special Features */}
                        <div>
                          <h4 className="text-sm font-medium text-slate-800 mb-4">Special Features</h4>
                          <div className="space-y-4">
                            <div className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                              <input
                                type="checkbox"
                                id="edit-location-temperature"
                                checked={newLocation.temperatureControlled}
                                onChange={(e) => setNewLocation({ ...newLocation, temperatureControlled: e.target.checked })}
                                className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500"
                              />
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <div>
                                  <Label htmlFor="edit-location-temperature" className="text-sm font-medium cursor-pointer">Temperature Controlled</Label>
                                  <p className="text-xs text-slate-500 mt-1">Location has climate control systems</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Security & Notes */}
                        <div>
                          <h4 className="text-sm font-medium text-slate-800 mb-4">Security & Notes</h4>
                          <div className="space-y-6">
                            <div className="space-y-3">
                              <Label htmlFor="edit-location-security" className="text-sm font-medium text-slate-700">Security Level</Label>
                              <Select 
                                value={newLocation.securityLevel} 
                                onValueChange={(value) => setNewLocation({ ...newLocation, securityLevel: value })}
                              >
                                <SelectTrigger className="py-3 text-base border-slate-300 focus:border-orange-400 focus:ring-1 focus:ring-orange-100 transition-all duration-200">
                                  <SelectValue placeholder="Select security level" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="STANDARD">Standard</SelectItem>
                                  <SelectItem value="HIGH">High Security</SelectItem>
                                  <SelectItem value="MAXIMUM">Maximum Security</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-3">
                              <Label htmlFor="edit-location-notes" className="text-sm font-medium text-slate-700">Special Instructions & Notes</Label>
                              <Textarea
                                id="edit-location-notes"
                                value={newLocation.notes}
                                onChange={(e) => setNewLocation({ ...newLocation, notes: e.target.value })}
                                placeholder="Any special instructions, access requirements, or important notes about this location"
                                rows={4}
                                className="resize-none border-slate-300 focus:border-orange-400 focus:ring-1 focus:ring-orange-100 transition-all duration-200"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </div>

            <DialogFooter className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
              <Button variant="outline" onClick={() => setShowEditLocationDialog(false)}>
                Cancel
              </Button>
              <Button onClick={async () => {
                try {
                  if (!newLocation.name) {
                    toast({
                      title: "Validation Error",
                      description: "Location name is required",
                      variant: "destructive"
                    })
                    return
                  }

                  await inventoryApi.updateLocation(selectedLocationForDialog.id, {
                    ...newLocation,
                    companyId: companyId,
                    tenantId: getTenantId()
                  })

                  toast({
                    title: "Success",
                    description: "Location updated successfully",
                  })

                  setShowEditLocationDialog(false)

                  // Refresh locations list
                  queryClient.invalidateQueries({ queryKey: ['locations'] })
                } catch (error) {
                  toast({
                    title: "Error",
                    description: "Failed to update location. Please try again.",
                    variant: "destructive"
                  })
                }
              }}>
                Update Location
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* New Movement Dialog */}
        <Dialog open={showNewMovementDialog} onOpenChange={setShowNewMovementDialog}>
          <DialogContent className="!max-w-7xl max-h-[95vh] overflow-y-auto w-[95vw] md:max-h-[90vh] md:w-[90vw] bg-gradient-to-br from-slate-50 to-indigo-50">
            <DialogHeader className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                  <ArrowRightLeft className="w-6 h-6 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold text-slate-800">Create New Movement</DialogTitle>
                  <p className="text-slate-600 mt-1">Record inventory transactions and stock adjustments</p>
                </div>
              </div>
            </DialogHeader>

            <div className="flex-1">
              <Tabs defaultValue="basic" className="h-full flex flex-col">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-2 mb-4">
                  <TabsList className="grid w-full grid-cols-4 gap-1">
                    <TabsTrigger 
                      value="basic" 
                      className="flex items-center gap-2 py-3 px-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-300"
                    >
                      <Package className="w-4 h-4" />
                      <span className="hidden sm:inline">Basic Info</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="details" 
                      className="flex items-center gap-2 py-3 px-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-600 data-[state=active]:text-white transition-all duration-300"
                    >
                      <Calculator className="w-4 h-4" />
                      <span className="hidden sm:inline">Details</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="tracking" 
                      className="flex items-center gap-2 py-3 px-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-teal-600 data-[state=active]:text-white transition-all duration-300"
                    >
                      <QrCode className="w-4 h-4" />
                      <span className="hidden sm:inline">Tracking</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="workflow" 
                      className="flex items-center gap-2 py-3 px-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-600 data-[state=active]:text-white transition-all duration-300"
                    >
                      <Settings className="w-4 h-4" />
                      <span className="hidden sm:inline">Workflow</span>
                    </TabsTrigger>
                  </TabsList>
                </div>

                <div className="flex-1">
                  {/* Basic Information Tab */}
                  <TabsContent value="basic">
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                          <Package className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-slate-800">Movement Information</h3>
                          <p className="text-sm text-slate-600">Essential movement details and product selection</p>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <Label htmlFor="movement-product" className="text-sm font-medium text-slate-700">Product *</Label>
                            <Select value={newMovement.productId} onValueChange={(value) => {
                              const product = allProducts.find(p => p.id === value)
                              const unitCost = product ? Number(product.costPrice) : 0
                              const totalCost = newMovement.autoCalculateTotal ? unitCost * newMovement.quantity : newMovement.totalCost
                              setNewMovement({ 
                                ...newMovement, 
                                productId: value,
                                unitCost: unitCost,
                                totalCost: totalCost
                              })
                            }}>
                              <SelectTrigger className="py-3 text-base border-slate-300 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100">
                                <SelectValue placeholder="Select a product to move" />
                              </SelectTrigger>
                              <SelectContent>
                                {allProducts.map((product) => (
                                  <SelectItem key={product.id} value={product.id}>
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
                                        <Package className="w-4 h-4 text-indigo-600" />
                                      </div>
                                      <div>
                                        <div className="font-medium">{product.name}</div>
                                        <div className="text-sm text-slate-500">SKU: {product.sku}</div>
                                      </div>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-3">
                            <Label htmlFor="movement-type" className="text-sm font-medium text-slate-700">Movement Type *</Label>
                            <Select value={newMovement.movementType} onValueChange={(value) => setNewMovement({ ...newMovement, movementType: value as any })}>
                              <SelectTrigger className="py-3 text-base border-slate-300 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="INBOUND">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span>Inbound (Stock In)</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="OUTBOUND">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                    <span>Outbound (Stock Out)</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="TRANSFER_IN">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <span>Transfer In</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="TRANSFER_OUT">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                    <span>Transfer Out</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="ADJUSTMENT_IN">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                    <span>Adjustment In</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="ADJUSTMENT_OUT">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                    <span>Adjustment Out</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="RETURN_IN">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                                    <span>Return In</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="RETURN_OUT">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                                    <span>Return Out</span>
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="space-y-3">
                            <Label htmlFor="movement-quantity" className="text-sm font-medium text-slate-700">Quantity *</Label>
                            <Input
                              id="movement-quantity"
                              type="number"
                              min="0"
                              step="1"
                              value={newMovement.quantity}
                              onChange={(e) => {
                                const quantity = parseFloat(e.target.value) || 0
                                const totalCost = newMovement.autoCalculateTotal ? newMovement.unitCost * quantity : newMovement.totalCost
                                setNewMovement({ 
                                  ...newMovement, 
                                  quantity: quantity,
                                  totalCost: totalCost
                                })
                              }}
                              placeholder="Enter quantity"
                              className="py-3 text-base border-slate-300 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 transition-all duration-200"
                            />
                          </div>

                          <div className="space-y-3">
                            <Label htmlFor="movement-date" className="text-sm font-medium text-slate-700">Movement Date *</Label>
                            <Input
                              id="movement-date"
                              type="date"
                              value={newMovement.movementDate}
                              onChange={(e) => setNewMovement({ ...newMovement, movementDate: e.target.value })}
                              className="py-3 text-base border-slate-300 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 transition-all duration-200"
                            />
                          </div>

                          <div className="space-y-3">
                            <Label htmlFor="movement-time" className="text-sm font-medium text-slate-700">Movement Time</Label>
                            <Input
                              id="movement-time"
                              type="time"
                              value={newMovement.movementTime}
                              onChange={(e) => setNewMovement({ ...newMovement, movementTime: e.target.value })}
                              className="py-3 text-base border-slate-300 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 transition-all duration-200"
                            />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Label htmlFor="movement-location" className="text-sm font-medium text-slate-700">Primary Location</Label>
                          <Select value={newMovement.locationId} onValueChange={(value) => setNewMovement({ ...newMovement, locationId: value })}>
                            <SelectTrigger className="py-3 text-base border-slate-300 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100">
                              <SelectValue placeholder="Select a location" />
                            </SelectTrigger>
                            <SelectContent>
                              {locations.map((location) => (
                                <SelectItem key={location.id} value={location.id}>
                                  <div className="flex items-center gap-3">
                                    <MapPin className="w-4 h-4 text-indigo-600" />
                                    <div>
                                      <div className="font-medium">{location.name}</div>
                                      <div className="text-sm text-slate-500">{location.code}</div>
                                    </div>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-3">
                          <Label htmlFor="movement-reason" className="text-sm font-medium text-slate-700">Reason/Notes</Label>
                          <Textarea
                            id="movement-reason"
                            value={newMovement.reason}
                            onChange={(e) => setNewMovement({ ...newMovement, reason: e.target.value })}
                            placeholder="Enter reason or notes for this movement"
                            rows={3}
                            className="resize-none border-slate-300 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 transition-all duration-200"
                          />
                        </div>

                        {/* Movement Summary */}
                        {newMovement.productId && (
                          <div className="mt-8 p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
                            <h4 className="text-sm font-semibold text-slate-800 mb-3">Movement Summary</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div className="flex items-center gap-2">
                                <Package className="w-4 h-4 text-indigo-600" />
                                <span className="text-slate-600">Product: {allProducts.find(p => p.id === newMovement.productId)?.name || 'Selected'}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <ArrowRightLeft className="w-4 h-4 text-indigo-600" />
                                <span className="text-slate-600">Type: {newMovement.movementType.replace('_', ' ')}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                                <span className="text-slate-600">Qty: {newMovement.quantity}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-indigo-600" />
                                <span className="text-slate-600">Date: {new Date(newMovement.movementDate).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  {/* Details Tab */}
                  <TabsContent value="details">
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Calculator className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-slate-800">Financial Details</h3>
                          <p className="text-sm text-slate-600">Cost tracking and financial information</p>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="space-y-3">
                            <Label htmlFor="movement-unit-cost" className="text-sm font-medium text-slate-700">Unit Cost</Label>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                              <Input
                                id="movement-unit-cost"
                                type="number"
                                min="0"
                                step="0.01"
                                value={newMovement.unitCost}
                                onChange={(e) => {
                                  const unitCost = parseFloat(e.target.value) || 0
                                  const totalCost = newMovement.autoCalculateTotal ? unitCost * newMovement.quantity : newMovement.totalCost
                                  setNewMovement({ 
                                    ...newMovement, 
                                    unitCost: unitCost,
                                    totalCost: totalCost
                                  })
                                }}
                                placeholder="0.00"
                                className="pl-10 py-3 text-base border-slate-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all duration-200"
                              />
                            </div>
                          </div>

                          <div className="space-y-3">
                            <Label htmlFor="movement-total-cost" className="text-sm font-medium text-slate-700">Total Cost</Label>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                              <Input
                                id="movement-total-cost"
                                type="number"
                                min="0"
                                step="0.01"
                                value={newMovement.totalCost}
                                onChange={(e) => setNewMovement({ ...newMovement, totalCost: parseFloat(e.target.value) || 0 })}
                                placeholder="0.00"
                                disabled={newMovement.autoCalculateTotal}
                                className={`pl-10 py-3 text-base border-slate-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all duration-200 ${newMovement.autoCalculateTotal ? 'bg-slate-50 cursor-not-allowed' : ''}`}
                              />
                            </div>
                          </div>

                          <div className="flex items-end">
                            <div className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors w-full">
                              <input
                                type="checkbox"
                                id="auto-calculate-total"
                                checked={newMovement.autoCalculateTotal}
                                onChange={(e) => {
                                  const autoCalculate = e.target.checked
                                  const totalCost = autoCalculate ? newMovement.unitCost * newMovement.quantity : newMovement.totalCost
                                  setNewMovement({ 
                                    ...newMovement, 
                                    autoCalculateTotal: autoCalculate,
                                    totalCost: totalCost
                                  })
                                }}
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                              />
                              <div>
                                <Label htmlFor="auto-calculate-total" className="text-sm font-medium cursor-pointer">Auto Calculate</Label>
                                <p className="text-xs text-slate-500">Calculate total automatically</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <Label htmlFor="movement-reference" className="text-sm font-medium text-slate-700">Reference Number</Label>
                            <Input
                              id="movement-reference"
                              value={newMovement.reference}
                              onChange={(e) => setNewMovement({ ...newMovement, reference: e.target.value })}
                              placeholder="e.g., PO-001, INV-123, REF-456"
                              className="py-3 text-base border-slate-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all duration-200"
                            />
                          </div>

                          <div className="space-y-3">
                            <Label htmlFor="movement-invoice" className="text-sm font-medium text-slate-700">Invoice Number</Label>
                            <Input
                              id="movement-invoice"
                              value={newMovement.invoiceNumber}
                              onChange={(e) => setNewMovement({ ...newMovement, invoiceNumber: e.target.value })}
                              placeholder="e.g., INV-2024-001"
                              className="py-3 text-base border-slate-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all duration-200"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="space-y-3">
                            <Label htmlFor="movement-department" className="text-sm font-medium text-slate-700">Department</Label>
                            <Input
                              id="movement-department"
                              value={newMovement.department}
                              onChange={(e) => setNewMovement({ ...newMovement, department: e.target.value })}
                              placeholder="e.g., Warehouse, Sales"
                              className="py-3 text-base border-slate-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all duration-200"
                            />
                          </div>

                          <div className="space-y-3">
                            <Label htmlFor="movement-project" className="text-sm font-medium text-slate-700">Project</Label>
                            <Input
                              id="movement-project"
                              value={newMovement.project}
                              onChange={(e) => setNewMovement({ ...newMovement, project: e.target.value })}
                              placeholder="e.g., Project Alpha"
                              className="py-3 text-base border-slate-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all duration-200"
                            />
                          </div>

                          <div className="space-y-3">
                            <Label htmlFor="movement-cost-center" className="text-sm font-medium text-slate-700">Cost Center</Label>
                            <Input
                              id="movement-cost-center"
                              value={newMovement.costCenter}
                              onChange={(e) => setNewMovement({ ...newMovement, costCenter: e.target.value })}
                              placeholder="e.g., CC-001"
                              className="py-3 text-base border-slate-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all duration-200"
                            />
                          </div>
                        </div>

                        {/* Cost Calculation Display */}
                        {newMovement.quantity > 0 && newMovement.unitCost > 0 && (
                          <div className="mt-8 p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                            <h4 className="text-sm font-semibold text-slate-800 mb-3">Cost Breakdown</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="text-center p-3 bg-white rounded-lg border">
                                <div className="text-2xl font-bold text-blue-600">${newMovement.unitCost.toFixed(2)}</div>
                                <div className="text-sm text-slate-600">Unit Cost</div>
                              </div>
                              <div className="text-center p-3 bg-white rounded-lg border">
                                <div className="text-2xl font-bold text-green-600">{newMovement.quantity}</div>
                                <div className="text-sm text-slate-600">Quantity</div>
                              </div>
                              <div className="text-center p-3 bg-white rounded-lg border">
                                <div className="text-2xl font-bold text-indigo-600">${newMovement.totalCost.toFixed(2)}</div>
                                <div className="text-sm text-slate-600">Total Cost</div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  {/* Tracking Tab */}
                  <TabsContent value="tracking">
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <QrCode className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-slate-800">Tracking Information</h3>
                          <p className="text-sm text-slate-600">Batch numbers, serial codes, and location transfers</p>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <Label htmlFor="movement-batch" className="text-sm font-medium text-slate-700">Batch Number</Label>
                            <Input
                              id="movement-batch"
                              value={newMovement.batchNumber}
                              onChange={(e) => setNewMovement({ ...newMovement, batchNumber: e.target.value })}
                              placeholder="e.g., BATCH-2024-001"
                              className="py-3 text-base border-slate-300 focus:border-green-400 focus:ring-1 focus:ring-green-100 transition-all duration-200"
                            />
                          </div>

                          <div className="space-y-3">
                            <Label htmlFor="movement-serial" className="text-sm font-medium text-slate-700">Serial Number</Label>
                            <Input
                              id="movement-serial"
                              value={newMovement.serialNumber}
                              onChange={(e) => setNewMovement({ ...newMovement, serialNumber: e.target.value })}
                              placeholder="e.g., SN123456789"
                              className="py-3 text-base border-slate-300 focus:border-green-400 focus:ring-1 focus:ring-green-100 transition-all duration-200"
                            />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Label htmlFor="movement-expiry" className="text-sm font-medium text-slate-700">Expiry Date</Label>
                          <Input
                            id="movement-expiry"
                            type="date"
                            value={newMovement.expiryDate}
                            onChange={(e) => setNewMovement({ ...newMovement, expiryDate: e.target.value })}
                            className="py-3 text-base border-slate-300 focus:border-green-400 focus:ring-1 focus:ring-green-100 transition-all duration-200"
                          />
                        </div>

                        {/* Transfer Locations */}
                        {(newMovement.movementType === 'TRANSFER_IN' || newMovement.movementType === 'TRANSFER_OUT') && (
                          <div className="pt-6 border-t border-slate-200">
                            <h4 className="text-sm font-medium text-slate-800 mb-4">Transfer Locations</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-3">
                                <Label htmlFor="movement-from-location" className="text-sm font-medium text-slate-700">From Location</Label>
                                <Select value={newMovement.fromLocationId} onValueChange={(value) => setNewMovement({ ...newMovement, fromLocationId: value })}>
                                  <SelectTrigger className="py-3 text-base border-slate-300 focus:border-green-400 focus:ring-1 focus:ring-green-100">
                                    <SelectValue placeholder="Select source location" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {locations.map((location) => (
                                      <SelectItem key={location.id} value={location.id}>
                                        <div className="flex items-center gap-3">
                                          <MapPin className="w-4 h-4 text-green-600" />
                                          <div>
                                            <div className="font-medium">{location.name}</div>
                                            <div className="text-sm text-slate-500">{location.code}</div>
                                          </div>
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="space-y-3">
                                <Label htmlFor="movement-to-location" className="text-sm font-medium text-slate-700">To Location</Label>
                                <Select value={newMovement.toLocationId} onValueChange={(value) => setNewMovement({ ...newMovement, toLocationId: value })}>
                                  <SelectTrigger className="py-3 text-base border-slate-300 focus:border-green-400 focus:ring-1 focus:ring-green-100">
                                    <SelectValue placeholder="Select destination location" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {locations.map((location) => (
                                      <SelectItem key={location.id} value={location.id}>
                                        <div className="flex items-center gap-3">
                                          <MapPin className="w-4 h-4 text-green-600" />
                                          <div>
                                            <div className="font-medium">{location.name}</div>
                                            <div className="text-sm text-slate-500">{location.code}</div>
                                          </div>
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Tracking Summary */}
                        <div className="mt-8 p-4 bg-gradient-to-br from-green-50 to-teal-50 rounded-lg border border-green-200">
                          <h4 className="text-sm font-semibold text-slate-800 mb-3">Tracking Summary</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <QrCode className="w-4 h-4 text-green-600" />
                              <span className="text-slate-600">Batch: {newMovement.batchNumber || 'Not set'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-slate-600">Serial: {newMovement.serialNumber || 'Not set'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-green-600" />
                              <span className="text-slate-600">Expiry: {newMovement.expiryDate ? new Date(newMovement.expiryDate).toLocaleDateString() : 'No expiry'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-green-600" />
                              <span className="text-slate-600">Transfer: {newMovement.fromLocationId || newMovement.toLocationId ? 'Yes' : 'No'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Workflow Tab */}
                  <TabsContent value="workflow">
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-orange-100 rounded-lg">
                          <Settings className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-slate-800">Workflow Settings</h3>
                          <p className="text-sm text-slate-600">Approval process, priority, and status management</p>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="space-y-3">
                            <Label htmlFor="movement-priority" className="text-sm font-medium text-slate-700">Priority Level</Label>
                            <Select value={newMovement.priority} onValueChange={(value) => setNewMovement({ ...newMovement, priority: value })}>
                              <SelectTrigger className="py-3 text-base border-slate-300 focus:border-orange-400 focus:ring-1 focus:ring-orange-100">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="LOW">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span>Low Priority</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="NORMAL">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <span>Normal Priority</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="HIGH">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                    <span>High Priority</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="URGENT">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                    <span>Urgent</span>
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-3">
                            <Label htmlFor="movement-status" className="text-sm font-medium text-slate-700">Status</Label>
                            <Select value={newMovement.status} onValueChange={(value) => setNewMovement({ ...newMovement, status: value })}>
                              <SelectTrigger className="py-3 text-base border-slate-300 focus:border-orange-400 focus:ring-1 focus:ring-orange-100">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="PENDING">Pending</SelectItem>
                                <SelectItem value="APPROVED">Approved</SelectItem>
                                <SelectItem value="PROCESSING">Processing</SelectItem>
                                <SelectItem value="COMPLETED">Completed</SelectItem>
                                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-3">
                            <Label htmlFor="movement-processed-by" className="text-sm font-medium text-slate-700">Processed By</Label>
                            <Input
                              id="movement-processed-by"
                              value={newMovement.processedBy}
                              onChange={(e) => setNewMovement({ ...newMovement, processedBy: e.target.value })}
                              placeholder="Staff member name"
                              className="py-3 text-base border-slate-300 focus:border-orange-400 focus:ring-1 focus:ring-orange-100 transition-all duration-200"
                            />
                          </div>
                        </div>

                        {/* Workflow Flags */}
                        <div className="pt-6 border-t border-slate-200">
                          <h4 className="text-sm font-medium text-slate-800 mb-4">Workflow Options</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                              <input
                                type="checkbox"
                                id="movement-urgent"
                                checked={newMovement.isUrgent}
                                onChange={(e) => setNewMovement({ ...newMovement, isUrgent: e.target.checked })}
                                className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500"
                              />
                              <div className="flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-red-600" />
                                <div>
                                  <Label htmlFor="movement-urgent" className="text-sm font-medium cursor-pointer">Urgent Movement</Label>
                                  <p className="text-xs text-slate-500">Mark as urgent for priority processing</p>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                              <input
                                type="checkbox"
                                id="movement-approval"
                                checked={newMovement.requiresApproval}
                                onChange={(e) => setNewMovement({ ...newMovement, requiresApproval: e.target.checked })}
                                className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500"
                              />
                              <div className="flex items-center gap-2">
                                <Shield className="w-4 h-4 text-orange-600" />
                                <div>
                                  <Label htmlFor="movement-approval" className="text-sm font-medium cursor-pointer">Requires Approval</Label>
                                  <p className="text-xs text-slate-500">Movement needs manager approval</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Label htmlFor="movement-notes" className="text-sm font-medium text-slate-700">Internal Notes</Label>
                          <Textarea
                            id="movement-notes"
                            value={newMovement.notes}
                            onChange={(e) => setNewMovement({ ...newMovement, notes: e.target.value })}
                            placeholder="Internal notes for staff use only (not visible to external users)"
                            rows={4}
                            className="resize-none border-slate-300 focus:border-orange-400 focus:ring-1 focus:ring-orange-100 transition-all duration-200"
                          />
                          <p className="text-xs text-slate-500">These notes are for internal use and won't be displayed to external users</p>
                        </div>

                        {/* Workflow Summary */}
                        <div className="mt-8 p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg border border-orange-200">
                          <h4 className="text-sm font-semibold text-slate-800 mb-3">Workflow Summary</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${newMovement.priority === 'URGENT' ? 'bg-red-500' : newMovement.priority === 'HIGH' ? 'bg-orange-500' : 'bg-blue-500'}`}></div>
                              <span className="text-slate-600">Priority: {newMovement.priority}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                              <span className="text-slate-600">Status: {newMovement.status}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="w-3 h-3 text-orange-600" />
                              <span className="text-slate-600">{newMovement.isUrgent ? 'Urgent' : 'Standard'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Shield className="w-3 h-3 text-orange-600" />
                              <span className="text-slate-600">{newMovement.requiresApproval ? 'Needs Approval' : 'Auto Process'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </div>

            <DialogFooter className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between w-full">
                <div className="text-sm text-slate-600">
                  <span className="font-medium">{allProducts.find(p => p.id === newMovement.productId)?.name || 'No Product Selected'}</span>
                  {newMovement.movementType && (
                    <span className="ml-2 px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs">
                      {newMovement.movementType.replace('_', ' ')}
                    </span>
                  )}
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setShowNewMovementDialog(false)} className="px-6">
                    Cancel
                  </Button>
                  <Button onClick={handleCreateMovement} className="px-8 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700">
                    Create Movement
                  </Button>
                </div>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Movement Dialog */}
        <Dialog open={showViewMovementDialog} onOpenChange={setShowViewMovementDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Movement Details</DialogTitle>
            </DialogHeader>
            {selectedMovement && (
              <div className="space-y-6 py-4">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Product</Label>
                      <div className="flex items-center gap-3 mt-1">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                          {getMovementIcon(selectedMovement.movementType)}
                        </div>
                        <div>
                          <p className="font-semibold">{selectedMovement.product?.name || 'Unknown Product'}</p>
                          <p className="text-sm text-gray-500">{selectedMovement.product?.sku || 'No SKU'}</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Movement Type</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="capitalize">
                          {selectedMovement.movementType?.replace('_', ' ').toLowerCase()}
                        </Badge>
                        <div className={`w-3 h-3 rounded-full ${selectedMovement.quantity > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Quantity</Label>
                      <p className={`text-2xl font-bold mt-1 ${selectedMovement.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {selectedMovement.quantity > 0 ? '+' : ''}{selectedMovement.quantity}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Movement Date</Label>
                      <p className="text-sm mt-1">{new Date(selectedMovement.movementDate).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {selectedMovement.unitCost && (
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Unit Cost</Label>
                        <p className="text-lg font-semibold mt-1">${Number(selectedMovement.unitCost || 0).toFixed(2)}</p>
                      </div>
                    )}
                    {selectedMovement.totalCost && (
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Total Cost</Label>
                        <p className="text-lg font-semibold mt-1">${Number(selectedMovement.totalCost || 0).toFixed(2)}</p>
                      </div>
                    )}
                    {selectedMovement.reference && (
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Reference</Label>
                        <p className="text-sm mt-1 font-mono bg-gray-100 px-2 py-1 rounded">{selectedMovement.reference}</p>
                      </div>
                    )}
                    {selectedMovement.location && (
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Location</Label>
                        <p className="text-sm mt-1">{selectedMovement.location.name} ({selectedMovement.location.code})</p>
                      </div>
                    )}
                  </div>
                </div>

                {(selectedMovement.reason || selectedMovement.notes) && (
                  <div className="border-t pt-4">
                    <Label className="text-sm font-medium text-gray-500 mb-3 block">Additional Information</Label>
                    <div className="space-y-3">
                      {selectedMovement.reason && (
                        <div>
                          <Label className="text-xs text-gray-500">Reason</Label>
                          <p className="text-sm mt-1">{selectedMovement.reason}</p>
                        </div>
                      )}
                      {selectedMovement.notes && (
                        <div>
                          <Label className="text-xs text-gray-500">Notes</Label>
                          <p className="text-sm mt-1">{selectedMovement.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {(selectedMovement.serialNumbers || selectedMovement.batchNumber) && (
                  <div className="border-t pt-4">
                    <Label className="text-sm font-medium text-gray-500 mb-3 block">Tracking Information</Label>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedMovement.serialNumbers && (
                        <div>
                          <Label className="text-xs text-gray-500">Serial Numbers</Label>
                          <p className="text-sm mt-1 font-mono bg-gray-100 px-2 py-1 rounded">{selectedMovement.serialNumbers}</p>
                        </div>
                      )}
                      {selectedMovement.batchNumber && (
                        <div>
                          <Label className="text-xs text-gray-500">Batch Number</Label>
                          <p className="text-sm mt-1 font-mono bg-gray-100 px-2 py-1 rounded">{selectedMovement.batchNumber}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="border-t pt-4">
                  <Label className="text-sm font-medium text-gray-500 mb-3 block">System Information</Label>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-xs text-gray-500">Created At</Label>
                      <p className="mt-1">{new Date(selectedMovement.createdAt).toLocaleString()}</p>
                    </div>
                    {selectedMovement.performedBy && (
                      <div>
                        <Label className="text-xs text-gray-500">Performed By</Label>
                        <p className="mt-1">{selectedMovement.performedBy}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowViewMovementDialog(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* QR Code Dialog */}
        <Dialog open={showQRCodeDialog} onOpenChange={setShowQRCodeDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Product QR Code</DialogTitle>
            </DialogHeader>
            {selectedProduct && (
              <div className="space-y-4 py-4">
                <div className="text-center">
                  <div className="w-64 h-64 mx-auto bg-white rounded-lg flex items-center justify-center border-2 border-gray-200 shadow-sm">
                    {qrCodeImage ? (
                      <img
                        src={qrCodeImage}
                        alt="Product QR Code"
                        className="w-60 h-60 rounded"
                      />
                    ) : (
                      <div className="text-center">
                        <RefreshCw className="w-8 h-8 mx-auto text-gray-400 mb-2 animate-spin" />
                        <p className="text-sm text-gray-500">Generating QR Code...</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Product Information</Label>
                  <div className="bg-gray-50 p-3 rounded-lg space-y-1">
                    <p className="text-sm"><span className="font-medium">Name:</span> {selectedProduct.name}</p>
                    <p className="text-sm"><span className="font-medium">SKU:</span> {selectedProduct.sku}</p>
                    <p className="text-sm"><span className="font-medium">ID:</span> {selectedProduct.id}</p>
                  </div>
                </div>


                <div className="space-y-2">
                  <Label className="text-sm font-medium">Actions</Label>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => generateQRCode(selectedProduct)}
                    >
                      <RefreshCw className="w-4 h-4 mr-1" />
                      Regenerate
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const qrData = {
                          type: 'product',
                          id: selectedProduct.id,
                          sku: selectedProduct.sku,
                          name: selectedProduct.name,
                          url: `${window.location.origin}/products/${selectedProduct.id}`
                        }
                        navigator.clipboard.writeText(JSON.stringify(qrData))
                        toast({
                          title: "Copied to Clipboard",
                          description: "QR code data has been copied to your clipboard",
                        })
                      }}
                    >
                      Copy Data
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const qrData = {
                          type: 'product',
                          id: selectedProduct.id,
                          sku: selectedProduct.sku,
                          name: selectedProduct.name,
                          url: `${window.location.origin}/products/${selectedProduct.id}`
                        }
                        const blob = new Blob([JSON.stringify(qrData, null, 2)], { type: 'application/json' })
                        const url = URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.href = url
                        a.download = `${selectedProduct.sku}-qr-data.json`
                        document.body.appendChild(a)
                        a.click()
                        document.body.removeChild(a)
                        URL.revokeObjectURL(url)
                        toast({
                          title: "Downloaded",
                          description: "QR code data has been downloaded as JSON file",
                        })
                      }}
                    >
                      Download JSON
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (qrCodeImage) {
                          const a = document.createElement('a')
                          a.href = qrCodeImage
                          a.download = `${selectedProduct.sku}-qr-code.png`
                          document.body.appendChild(a)
                          a.click()
                          document.body.removeChild(a)
                          toast({
                            title: "Downloaded",
                            description: "QR code image has been downloaded as PNG file",
                          })
                        }
                      }}
                    >
                      Download QR
                    </Button>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowQRCodeDialog(false)}>
                Close
              </Button>
              <Button onClick={() => {
                setShowQRCodeDialog(false)
                handleViewProduct(selectedProduct)
              }}>
                View Product
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Alert Settings Dialog */}
        <Dialog open={showAlertSettingsDialog} onOpenChange={setShowAlertSettingsDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Alert Settings</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Stock Thresholds */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Stock Thresholds</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
                    <Input
                      id="lowStockThreshold"
                      type="number"
                      value={alertSettings.lowStockThreshold}
                      onChange={(e) => setAlertSettings({
                        ...alertSettings,
                        lowStockThreshold: Number(e.target.value)
                      })}
                    />
                    <p className="text-xs text-muted-foreground">Alert when stock ≤ this amount</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="overstockThreshold">Overstock Threshold</Label>
                    <Input
                      id="overstockThreshold"
                      type="number"
                      value={alertSettings.overstockThreshold}
                      onChange={(e) => setAlertSettings({
                        ...alertSettings,
                        overstockThreshold: Number(e.target.value)
                      })}
                    />
                    <p className="text-xs text-muted-foreground">Alert when stock ≥ this amount</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="criticalStockThreshold">Critical Stock Threshold</Label>
                    <Input
                      id="criticalStockThreshold"
                      type="number"
                      value={alertSettings.criticalStockThreshold}
                      onChange={(e) => setAlertSettings({
                        ...alertSettings,
                        criticalStockThreshold: Number(e.target.value)
                      })}
                    />
                    <p className="text-xs text-muted-foreground">Critical alert when stock ≤ this amount</p>
                  </div>
                </div>
              </div>

              {/* Notification Preferences */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Notification Preferences</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="emailNotifications">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive alerts via email</p>
                    </div>
                    <input
                      id="emailNotifications"
                      type="checkbox"
                      checked={alertSettings.emailNotifications}
                      onChange={(e) => setAlertSettings({
                        ...alertSettings,
                        emailNotifications: e.target.checked
                      })}
                      className="h-4 w-4"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="smsNotifications">SMS Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive alerts via SMS</p>
                    </div>
                    <input
                      id="smsNotifications"
                      type="checkbox"
                      checked={alertSettings.smsNotifications}
                      onChange={(e) => setAlertSettings({
                        ...alertSettings,
                        smsNotifications: e.target.checked
                      })}
                      className="h-4 w-4"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="dashboardAlerts">Dashboard Alerts</Label>
                      <p className="text-sm text-muted-foreground">Show alerts on dashboard</p>
                    </div>
                    <input
                      id="dashboardAlerts"
                      type="checkbox"
                      checked={alertSettings.dashboardAlerts}
                      onChange={(e) => setAlertSettings({
                        ...alertSettings,
                        dashboardAlerts: e.target.checked
                      })}
                      className="h-4 w-4"
                    />
                  </div>
                </div>
              </div>

              {/* Alert Management */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Alert Management</h3>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="autoAcknowledgeDays">Auto-acknowledge after (days)</Label>
                    <Input
                      id="autoAcknowledgeDays"
                      type="number"
                      value={alertSettings.autoAcknowledgeDays}
                      onChange={(e) => setAlertSettings({
                        ...alertSettings,
                        autoAcknowledgeDays: Number(e.target.value)
                      })}
                    />
                    <p className="text-xs text-muted-foreground">Automatically acknowledge alerts after this many days</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="immediateAlerts">Immediate Alerts</Label>
                      <p className="text-sm text-muted-foreground">Send alerts immediately when generated</p>
                    </div>
                    <input
                      id="immediateAlerts"
                      type="checkbox"
                      checked={alertSettings.immediateAlerts}
                      onChange={(e) => setAlertSettings({
                        ...alertSettings,
                        immediateAlerts: e.target.checked
                      })}
                      className="h-4 w-4"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="immediateAlertsCriticalOnly">Critical Alerts Only</Label>
                      <p className="text-sm text-muted-foreground">Send immediate alerts only for critical issues</p>
                    </div>
                    <input
                      id="immediateAlertsCriticalOnly"
                      type="checkbox"
                      checked={alertSettings.immediateAlertsCriticalOnly}
                      onChange={(e) => setAlertSettings({
                        ...alertSettings,
                        immediateAlertsCriticalOnly: e.target.checked
                      })}
                      className="h-4 w-4"
                    />
                  </div>
                </div>
              </div>

              {/* Schedule Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Schedule Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dailyDigestTime">Daily Digest Time</Label>
                    <Input
                      id="dailyDigestTime"
                      type="time"
                      value={alertSettings.dailyDigestTime}
                      onChange={(e) => setAlertSettings({
                        ...alertSettings,
                        dailyDigestTime: e.target.value
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weeklySummaryDay">Weekly Summary Day</Label>
                    <Select
                      value={alertSettings.weeklySummaryDay}
                      onValueChange={(value) => setAlertSettings({
                        ...alertSettings,
                        weeklySummaryDay: value
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MONDAY">Monday</SelectItem>
                        <SelectItem value="TUESDAY">Tuesday</SelectItem>
                        <SelectItem value="WEDNESDAY">Wednesday</SelectItem>
                        <SelectItem value="THURSDAY">Thursday</SelectItem>
                        <SelectItem value="FRIDAY">Friday</SelectItem>
                        <SelectItem value="SATURDAY">Saturday</SelectItem>
                        <SelectItem value="SUNDAY">Sunday</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAlertSettingsDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveAlertSettings}>
                Save Settings
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* New Transfer Dialog */}
        <Dialog open={showNewTransferDialog} onOpenChange={setShowNewTransferDialog}>
          <DialogContent className="!max-w-7xl max-h-[95vh] overflow-y-auto w-[95vw] md:max-h-[90vh] md:w-[90vw] bg-gradient-to-br from-slate-50 to-emerald-50">
            <DialogHeader className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg">
                  <ArrowRightLeft className="w-6 h-6 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold text-slate-800">Create New Transfer</DialogTitle>
                  <p className="text-slate-600 mt-1">Move inventory between locations with complete tracking</p>
                </div>
              </div>
            </DialogHeader>

            <div className="flex-1">
              <Tabs defaultValue="basic" className="h-full flex flex-col">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-2 mb-4">
                  <TabsList className="grid w-full grid-cols-4 gap-1">
                    <TabsTrigger 
                      value="basic" 
                      className="flex items-center gap-2 py-3 px-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-600 data-[state=active]:text-white transition-all duration-300"
                    >
                      <Package className="w-4 h-4" />
                      <span className="hidden sm:inline">Transfer</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="logistics" 
                      className="flex items-center gap-2 py-3 px-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-600 data-[state=active]:text-white transition-all duration-300"
                    >
                      <MapPin className="w-4 h-4" />
                      <span className="hidden sm:inline">Logistics</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="tracking" 
                      className="flex items-center gap-2 py-3 px-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white transition-all duration-300"
                    >
                      <QrCode className="w-4 h-4" />
                      <span className="hidden sm:inline">Tracking</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="workflow" 
                      className="flex items-center gap-2 py-3 px-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-600 data-[state=active]:text-white transition-all duration-300"
                    >
                      <Settings className="w-4 h-4" />
                      <span className="hidden sm:inline">Workflow</span>
                    </TabsTrigger>
                  </TabsList>
                </div>

                <div className="flex-1">
                  {/* Basic Transfer Tab */}
                  <TabsContent value="basic">
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-emerald-100 rounded-lg">
                          <Package className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-slate-800">Transfer Information</h3>
                          <p className="text-sm text-slate-600">Essential transfer details and location selection</p>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <Label htmlFor="transfer-product" className="text-sm font-medium text-slate-700">Product *</Label>
                            <Select value={newTransfer.productId} onValueChange={(value) => setNewTransfer({ ...newTransfer, productId: value })}>
                              <SelectTrigger className="py-3 text-base border-slate-300 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-100">
                                <SelectValue placeholder="Select product to transfer" />
                              </SelectTrigger>
                              <SelectContent>
                                {allProducts.map((product) => (
                                  <SelectItem key={product.id} value={product.id}>
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-lg flex items-center justify-center">
                                        <Package className="w-4 h-4 text-emerald-600" />
                                      </div>
                                      <div>
                                        <div className="font-medium">{product.name}</div>
                                        <div className="text-sm text-slate-500">SKU: {product.sku}</div>
                                      </div>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-3">
                            <Label htmlFor="transfer-quantity" className="text-sm font-medium text-slate-700">Quantity *</Label>
                            <Input
                              id="transfer-quantity"
                              type="number"
                              min="0"
                              step="1"
                              value={newTransfer.quantity}
                              onChange={(e) => setNewTransfer({ ...newTransfer, quantity: Number(e.target.value) })}
                              placeholder="Enter quantity to transfer"
                              className="py-3 text-base border-slate-300 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-100 transition-all duration-200"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <Label htmlFor="transfer-from" className="text-sm font-medium text-slate-700">From Location</Label>
                            <Select value={newTransfer.fromLocationId || "none"} onValueChange={(value) => setNewTransfer({ ...newTransfer, fromLocationId: value === "none" ? "" : value })}>
                              <SelectTrigger className="py-3 text-base border-slate-300 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-100">
                                <SelectValue placeholder="Select source location" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                    <span>External Source</span>
                                  </div>
                                </SelectItem>
                                {locations.map((location) => (
                                  <SelectItem key={location.id} value={location.id} disabled={newTransfer.toLocationId === location.id}>
                                    <div className="flex items-center gap-3">
                                      <MapPin className="w-4 h-4 text-emerald-600" />
                                      <div>
                                        <div className="font-medium">{location.name}</div>
                                        <div className="text-sm text-slate-500">{location.code}</div>
                                      </div>
                                      {newTransfer.toLocationId === location.id && (
                                        <span className="text-xs text-orange-500 ml-2">(Same as destination)</span>
                                      )}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-3">
                            <Label htmlFor="transfer-to" className="text-sm font-medium text-slate-700">To Location *</Label>
                            <Select value={newTransfer.toLocationId} onValueChange={(value) => setNewTransfer({ ...newTransfer, toLocationId: value })}>
                              <SelectTrigger className="py-3 text-base border-slate-300 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-100">
                                <SelectValue placeholder="Select destination location" />
                              </SelectTrigger>
                              <SelectContent>
                                {locations.map((location) => (
                                  <SelectItem 
                                    key={location.id} 
                                    value={location.id}
                                    disabled={newTransfer.fromLocationId === location.id}
                                  >
                                    <div className="flex items-center gap-3">
                                      <MapPin className="w-4 h-4 text-emerald-600" />
                                      <div>
                                        <div className="font-medium">{location.name}</div>
                                        <div className="text-sm text-slate-500">{location.code}</div>
                                      </div>
                                      {newTransfer.fromLocationId === location.id && (
                                        <span className="text-xs text-orange-500 ml-2">(Same as source)</span>
                                      )}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="space-y-3">
                            <Label htmlFor="transfer-date" className="text-sm font-medium text-slate-700">Transfer Date *</Label>
                            <Input
                              id="transfer-date"
                              type="date"
                              value={newTransfer.transferDate}
                              onChange={(e) => setNewTransfer({ ...newTransfer, transferDate: e.target.value })}
                              className="py-3 text-base border-slate-300 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-100 transition-all duration-200"
                            />
                          </div>

                          <div className="space-y-3">
                            <Label htmlFor="transfer-time" className="text-sm font-medium text-slate-700">Transfer Time</Label>
                            <Input
                              id="transfer-time"
                              type="time"
                              value={newTransfer.transferTime}
                              onChange={(e) => setNewTransfer({ ...newTransfer, transferTime: e.target.value })}
                              className="py-3 text-base border-slate-300 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-100 transition-all duration-200"
                            />
                          </div>

                          <div className="space-y-3">
                            <Label htmlFor="transfer-delivery-date" className="text-sm font-medium text-slate-700">Expected Delivery</Label>
                            <Input
                              id="transfer-delivery-date"
                              type="date"
                              value={newTransfer.expectedDeliveryDate}
                              onChange={(e) => setNewTransfer({ ...newTransfer, expectedDeliveryDate: e.target.value })}
                              className="py-3 text-base border-slate-300 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-100 transition-all duration-200"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <Label htmlFor="transfer-type" className="text-sm font-medium text-slate-700">Transfer Type</Label>
                            <Select value={newTransfer.transferType} onValueChange={(value) => setNewTransfer({ ...newTransfer, transferType: value })}>
                              <SelectTrigger className="py-3 text-base border-slate-300 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-100">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="INTER_LOCATION">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                    <span>Inter-Location</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="INTER_WAREHOUSE">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <span>Inter-Warehouse</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="CUSTOMER_SHIPMENT">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                    <span>Customer Shipment</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="SUPPLIER_RETURN">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                    <span>Supplier Return</span>
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-3">
                            <Label htmlFor="transfer-reference" className="text-sm font-medium text-slate-700">Reference Number</Label>
                            <Input
                              id="transfer-reference"
                              value={newTransfer.reference}
                              onChange={(e) => setNewTransfer({ ...newTransfer, reference: e.target.value })}
                              placeholder="e.g., TRN-2024-001"
                              className="py-3 text-base border-slate-300 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-100 transition-all duration-200"
                            />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Label htmlFor="transfer-notes" className="text-sm font-medium text-slate-700">Transfer Notes</Label>
                          <Textarea
                            id="transfer-notes"
                            value={newTransfer.notes}
                            onChange={(e) => setNewTransfer({ ...newTransfer, notes: e.target.value })}
                            placeholder="Enter transfer notes and instructions"
                            rows={3}
                            className="resize-none border-slate-300 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-100 transition-all duration-200"
                          />
                        </div>

                        {/* Transfer Summary */}
                        {newTransfer.productId && newTransfer.toLocationId && (
                          <div className="mt-8 p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg border border-emerald-200">
                            <h4 className="text-sm font-semibold text-slate-800 mb-3">Transfer Summary</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div className="flex items-center gap-2">
                                <Package className="w-4 h-4 text-emerald-600" />
                                <span className="text-slate-600">Product: {allProducts.find(p => p.id === newTransfer.productId)?.name || 'Selected'}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <ArrowRightLeft className="w-4 h-4 text-emerald-600" />
                                <span className="text-slate-600">Qty: {newTransfer.quantity}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-emerald-600" />
                                <span className="text-slate-600">From: {newTransfer.fromLocationId ? locations.find(l => l.id === newTransfer.fromLocationId)?.name || 'Unknown' : 'External'}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-emerald-600" />
                                <span className="text-slate-600">To: {locations.find(l => l.id === newTransfer.toLocationId)?.name || 'Select destination'}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  {/* Logistics Tab */}
                  <TabsContent value="logistics">
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <MapPin className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-slate-800">Logistics & Shipping</h3>
                          <p className="text-sm text-slate-600">Carrier information, shipping details, and costs</p>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <Label htmlFor="transfer-carrier" className="text-sm font-medium text-slate-700">Carrier Name</Label>
                            <Input
                              id="transfer-carrier"
                              value={newTransfer.carrierName}
                              onChange={(e) => setNewTransfer({ ...newTransfer, carrierName: e.target.value })}
                              placeholder="e.g., FedEx, UPS, Internal Transport"
                              className="py-3 text-base border-slate-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all duration-200"
                            />
                          </div>

                          <div className="space-y-3">
                            <Label htmlFor="transfer-tracking" className="text-sm font-medium text-slate-700">Tracking Number</Label>
                            <Input
                              id="transfer-tracking"
                              value={newTransfer.trackingNumber}
                              onChange={(e) => setNewTransfer({ ...newTransfer, trackingNumber: e.target.value })}
                              placeholder="e.g., 1Z999AA123456789"
                              className="py-3 text-base border-slate-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all duration-200"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="space-y-3">
                            <Label htmlFor="transfer-shipping-cost" className="text-sm font-medium text-slate-700">Shipping Cost</Label>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                              <Input
                                id="transfer-shipping-cost"
                                type="number"
                                min="0"
                                step="0.01"
                                value={newTransfer.shippingCost}
                                onChange={(e) => setNewTransfer({ ...newTransfer, shippingCost: parseFloat(e.target.value) || 0 })}
                                placeholder="0.00"
                                className="pl-10 py-3 text-base border-slate-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all duration-200"
                              />
                            </div>
                          </div>

                          <div className="space-y-3">
                            <Label htmlFor="transfer-insurance" className="text-sm font-medium text-slate-700">Insurance Value</Label>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                              <Input
                                id="transfer-insurance"
                                type="number"
                                min="0"
                                step="0.01"
                                value={newTransfer.insuranceValue}
                                onChange={(e) => setNewTransfer({ ...newTransfer, insuranceValue: parseFloat(e.target.value) || 0 })}
                                placeholder="0.00"
                                className="pl-10 py-3 text-base border-slate-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all duration-200"
                              />
                            </div>
                          </div>

                          <div className="space-y-3">
                            <Label htmlFor="transfer-packing" className="text-sm font-medium text-slate-700">Packing Method</Label>
                            <Select value={newTransfer.packingMethod} onValueChange={(value) => setNewTransfer({ ...newTransfer, packingMethod: value })}>
                              <SelectTrigger className="py-3 text-base border-slate-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-100">
                                <SelectValue placeholder="Select packing method" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="STANDARD_BOX">Standard Box</SelectItem>
                                <SelectItem value="PADDED_ENVELOPE">Padded Envelope</SelectItem>
                                <SelectItem value="PALLET">Pallet</SelectItem>
                                <SelectItem value="CUSTOM_CRATE">Custom Crate</SelectItem>
                                <SelectItem value="BULK">Bulk</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="space-y-3">
                            <Label htmlFor="transfer-dept-from" className="text-sm font-medium text-slate-700">Department From</Label>
                            <Input
                              id="transfer-dept-from"
                              value={newTransfer.departmentFrom}
                              onChange={(e) => setNewTransfer({ ...newTransfer, departmentFrom: e.target.value })}
                              placeholder="e.g., Warehouse Operations"
                              className="py-3 text-base border-slate-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all duration-200"
                            />
                          </div>

                          <div className="space-y-3">
                            <Label htmlFor="transfer-dept-to" className="text-sm font-medium text-slate-700">Department To</Label>
                            <Input
                              id="transfer-dept-to"
                              value={newTransfer.departmentTo}
                              onChange={(e) => setNewTransfer({ ...newTransfer, departmentTo: e.target.value })}
                              placeholder="e.g., Retail Operations"
                              className="py-3 text-base border-slate-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all duration-200"
                            />
                          </div>

                          <div className="space-y-3">
                            <Label htmlFor="transfer-project" className="text-sm font-medium text-slate-700">Project Code</Label>
                            <Input
                              id="transfer-project"
                              value={newTransfer.projectCode}
                              onChange={(e) => setNewTransfer({ ...newTransfer, projectCode: e.target.value })}
                              placeholder="e.g., PROJ-2024-01"
                              className="py-3 text-base border-slate-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all duration-200"
                            />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Label htmlFor="transfer-special-instructions" className="text-sm font-medium text-slate-700">Special Instructions</Label>
                          <Textarea
                            id="transfer-special-instructions"
                            value={newTransfer.specialInstructions}
                            onChange={(e) => setNewTransfer({ ...newTransfer, specialInstructions: e.target.value })}
                            placeholder="Special handling requirements, delivery instructions, etc."
                            rows={3}
                            className="resize-none border-slate-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all duration-200"
                          />
                        </div>

                        {/* Shipping Options */}
                        <div className="pt-6 border-t border-slate-200">
                          <h4 className="text-sm font-medium text-slate-800 mb-4">Shipping Options</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                              <input
                                type="checkbox"
                                id="transfer-fragile"
                                checked={newTransfer.fragile}
                                onChange={(e) => setNewTransfer({ ...newTransfer, fragile: e.target.checked })}
                                className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500"
                              />
                              <div className="flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-orange-600" />
                                <div>
                                  <Label htmlFor="transfer-fragile" className="text-sm font-medium cursor-pointer">Fragile Items</Label>
                                  <p className="text-xs text-slate-500">Requires special handling</p>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                              <input
                                type="checkbox"
                                id="transfer-temperature"
                                checked={newTransfer.temperatureControlled}
                                onChange={(e) => setNewTransfer({ ...newTransfer, temperatureControlled: e.target.checked })}
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                              />
                              <div className="flex items-center gap-2">
                                <Thermometer className="w-4 h-4 text-blue-600" />
                                <div>
                                  <Label htmlFor="transfer-temperature" className="text-sm font-medium cursor-pointer">Temperature Controlled</Label>
                                  <p className="text-xs text-slate-500">Maintain cold chain</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Cost Summary */}
                        {(newTransfer.shippingCost > 0 || newTransfer.insuranceValue > 0) && (
                          <div className="mt-8 p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                            <h4 className="text-sm font-semibold text-slate-800 mb-3">Cost Summary</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="text-center p-3 bg-white rounded-lg border">
                                <div className="text-2xl font-bold text-blue-600">${newTransfer.shippingCost.toFixed(2)}</div>
                                <div className="text-sm text-slate-600">Shipping Cost</div>
                              </div>
                              <div className="text-center p-3 bg-white rounded-lg border">
                                <div className="text-2xl font-bold text-green-600">${newTransfer.insuranceValue.toFixed(2)}</div>
                                <div className="text-sm text-slate-600">Insurance Value</div>
                              </div>
                              <div className="text-center p-3 bg-white rounded-lg border">
                                <div className="text-2xl font-bold text-indigo-600">${(newTransfer.shippingCost + newTransfer.insuranceValue).toFixed(2)}</div>
                                <div className="text-sm text-slate-600">Total Cost</div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  {/* Tracking Tab */}
                  <TabsContent value="tracking">
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <QrCode className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-slate-800">Tracking & Identification</h3>
                          <p className="text-sm text-slate-600">Batch numbers, serial codes, and tracking information</p>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <Label htmlFor="transfer-batch" className="text-sm font-medium text-slate-700">Batch Number</Label>
                            <Input
                              id="transfer-batch"
                              value={newTransfer.batchNumber}
                              onChange={(e) => setNewTransfer({ ...newTransfer, batchNumber: e.target.value })}
                              placeholder="e.g., BATCH-2024-001"
                              className="py-3 text-base border-slate-300 focus:border-purple-400 focus:ring-1 focus:ring-purple-100 transition-all duration-200"
                            />
                          </div>

                          <div className="space-y-3">
                            <Label htmlFor="transfer-serials" className="text-sm font-medium text-slate-700">Serial Numbers</Label>
                            <Textarea
                              id="transfer-serials"
                              value={newTransfer.serialNumbers}
                              onChange={(e) => setNewTransfer({ ...newTransfer, serialNumbers: e.target.value })}
                              placeholder="e.g., SN001, SN002, SN003 (comma separated)"
                              rows={2}
                              className="resize-none border-slate-300 focus:border-purple-400 focus:ring-1 focus:ring-purple-100 transition-all duration-200"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <Label htmlFor="transfer-reason" className="text-sm font-medium text-slate-700">Reason Code</Label>
                            <Select value={newTransfer.reasonCode} onValueChange={(value) => setNewTransfer({ ...newTransfer, reasonCode: value })}>
                              <SelectTrigger className="py-3 text-base border-slate-300 focus:border-purple-400 focus:ring-1 focus:ring-purple-100">
                                <SelectValue placeholder="Select reason for transfer" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="RESTOCK">Restock</SelectItem>
                                <SelectItem value="CUSTOMER_ORDER">Customer Order</SelectItem>
                                <SelectItem value="QUALITY_CONTROL">Quality Control</SelectItem>
                                <SelectItem value="DAMAGE_REPLACEMENT">Damage Replacement</SelectItem>
                                <SelectItem value="SEASONAL_ADJUSTMENT">Seasonal Adjustment</SelectItem>
                                <SelectItem value="EXCESS_INVENTORY">Excess Inventory</SelectItem>
                                <SelectItem value="OTHER">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-3">
                            <Label htmlFor="transfer-cost-center" className="text-sm font-medium text-slate-700">Cost Center</Label>
                            <Input
                              id="transfer-cost-center"
                              value={newTransfer.costCenter}
                              onChange={(e) => setNewTransfer({ ...newTransfer, costCenter: e.target.value })}
                              placeholder="e.g., CC-001"
                              className="py-3 text-base border-slate-300 focus:border-purple-400 focus:ring-1 focus:ring-purple-100 transition-all duration-200"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="space-y-3">
                            <Label htmlFor="transfer-requested-by" className="text-sm font-medium text-slate-700">Requested By</Label>
                            <Input
                              id="transfer-requested-by"
                              value={newTransfer.requestedBy}
                              onChange={(e) => setNewTransfer({ ...newTransfer, requestedBy: e.target.value })}
                              placeholder="Staff member name"
                              className="py-3 text-base border-slate-300 focus:border-purple-400 focus:ring-1 focus:ring-purple-100 transition-all duration-200"
                            />
                          </div>

                          <div className="space-y-3">
                            <Label htmlFor="transfer-approved-by" className="text-sm font-medium text-slate-700">Approved By</Label>
                            <Input
                              id="transfer-approved-by"
                              value={newTransfer.approvedBy}
                              onChange={(e) => setNewTransfer({ ...newTransfer, approvedBy: e.target.value })}
                              placeholder="Manager name"
                              className="py-3 text-base border-slate-300 focus:border-purple-400 focus:ring-1 focus:ring-purple-100 transition-all duration-200"
                            />
                          </div>

                          <div className="space-y-3">
                            <Label htmlFor="transfer-processed-by" className="text-sm font-medium text-slate-700">Processed By</Label>
                            <Input
                              id="transfer-processed-by"
                              value={newTransfer.processedBy}
                              onChange={(e) => setNewTransfer({ ...newTransfer, processedBy: e.target.value })}
                              placeholder="Handler name"
                              className="py-3 text-base border-slate-300 focus:border-purple-400 focus:ring-1 focus:ring-purple-100 transition-all duration-200"
                            />
                          </div>
                        </div>

                        {/* Tracking Summary */}
                        <div className="mt-8 p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                          <h4 className="text-sm font-semibold text-slate-800 mb-3">Tracking Summary</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <QrCode className="w-4 h-4 text-purple-600" />
                              <span className="text-slate-600">Batch: {newTransfer.batchNumber || 'Not set'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                              <span className="text-slate-600">Serials: {newTransfer.serialNumbers ? 'Set' : 'Not set'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-purple-600" />
                              <span className="text-slate-600">Requested: {newTransfer.requestedBy || 'Not set'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Settings className="w-4 h-4 text-purple-600" />
                              <span className="text-slate-600">Reason: {newTransfer.reasonCode || 'Not specified'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Workflow Tab */}
                  <TabsContent value="workflow">
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-orange-100 rounded-lg">
                          <Settings className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-slate-800">Workflow & Approval</h3>
                          <p className="text-sm text-slate-600">Priority settings, approval process, and status management</p>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <Label htmlFor="transfer-priority" className="text-sm font-medium text-slate-700">Priority Level</Label>
                            <Select value={newTransfer.priority} onValueChange={(value) => setNewTransfer({ ...newTransfer, priority: value })}>
                              <SelectTrigger className="py-3 text-base border-slate-300 focus:border-orange-400 focus:ring-1 focus:ring-orange-100">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="LOW">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span>Low Priority</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="NORMAL">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <span>Normal Priority</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="HIGH">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                    <span>High Priority</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="URGENT">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                    <span>Urgent</span>
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-3">
                            <Label htmlFor="transfer-status" className="text-sm font-medium text-slate-700">Transfer Status</Label>
                            <Select value={newTransfer.status} onValueChange={(value) => setNewTransfer({ ...newTransfer, status: value })}>
                              <SelectTrigger className="py-3 text-base border-slate-300 focus:border-orange-400 focus:ring-1 focus:ring-orange-100">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="PENDING">Pending</SelectItem>
                                <SelectItem value="APPROVED">Approved</SelectItem>
                                <SelectItem value="IN_TRANSIT">In Transit</SelectItem>
                                <SelectItem value="DELIVERED">Delivered</SelectItem>
                                <SelectItem value="COMPLETED">Completed</SelectItem>
                                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Workflow Flags */}
                        <div className="pt-6 border-t border-slate-200">
                          <h4 className="text-sm font-medium text-slate-800 mb-4">Workflow Options</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                              <input
                                type="checkbox"
                                id="transfer-urgent"
                                checked={newTransfer.isUrgent}
                                onChange={(e) => setNewTransfer({ ...newTransfer, isUrgent: e.target.checked })}
                                className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500"
                              />
                              <div className="flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-red-600" />
                                <div>
                                  <Label htmlFor="transfer-urgent" className="text-sm font-medium cursor-pointer">Urgent Transfer</Label>
                                  <p className="text-xs text-slate-500">Mark as urgent for priority processing</p>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                              <input
                                type="checkbox"
                                id="transfer-approval"
                                checked={newTransfer.requiresApproval}
                                onChange={(e) => setNewTransfer({ ...newTransfer, requiresApproval: e.target.checked })}
                                className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500"
                              />
                              <div className="flex items-center gap-2">
                                <Shield className="w-4 h-4 text-orange-600" />
                                <div>
                                  <Label htmlFor="transfer-approval" className="text-sm font-medium cursor-pointer">Requires Approval</Label>
                                  <p className="text-xs text-slate-500">Transfer needs manager approval</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Label htmlFor="transfer-internal-notes" className="text-sm font-medium text-slate-700">Internal Notes</Label>
                          <Textarea
                            id="transfer-internal-notes"
                            value={newTransfer.internalNotes}
                            onChange={(e) => setNewTransfer({ ...newTransfer, internalNotes: e.target.value })}
                            placeholder="Internal notes for staff use only (not visible to external users)"
                            rows={4}
                            className="resize-none border-slate-300 focus:border-orange-400 focus:ring-1 focus:ring-orange-100 transition-all duration-200"
                          />
                          <p className="text-xs text-slate-500">These notes are for internal use and won't be displayed to external users</p>
                        </div>

                        {/* Workflow Summary */}
                        <div className="mt-8 p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg border border-orange-200">
                          <h4 className="text-sm font-semibold text-slate-800 mb-3">Workflow Summary</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${newTransfer.priority === 'URGENT' ? 'bg-red-500' : newTransfer.priority === 'HIGH' ? 'bg-orange-500' : 'bg-blue-500'}`}></div>
                              <span className="text-slate-600">Priority: {newTransfer.priority}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                              <span className="text-slate-600">Status: {newTransfer.status}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="w-3 h-3 text-orange-600" />
                              <span className="text-slate-600">{newTransfer.isUrgent ? 'Urgent' : 'Standard'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Shield className="w-3 h-3 text-orange-600" />
                              <span className="text-slate-600">{newTransfer.requiresApproval ? 'Needs Approval' : 'Auto Process'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </div>

            <DialogFooter className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between w-full">
                <div className="text-sm text-slate-600">
                  <span className="font-medium">{allProducts.find(p => p.id === newTransfer.productId)?.name || 'No Product Selected'}</span>
                  {newTransfer.transferType && (
                    <span className="ml-2 px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs">
                      {newTransfer.transferType.replace('_', ' ')}
                    </span>
                  )}
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setShowNewTransferDialog(false)} className="px-6">
                    Cancel
                  </Button>
                  <Button onClick={handleCreateTransfer} className="px-8 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700">
                    Create Transfer
                  </Button>
                </div>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Transfer Dialog */}
        <Dialog open={showViewTransferDialog} onOpenChange={setShowViewTransferDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Transfer Details</DialogTitle>
            </DialogHeader>
            {selectedTransfer && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Product</Label>
                    <p className="text-lg font-semibold">{selectedTransfer.product.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedTransfer.product.sku}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Quantity</Label>
                    <p className="text-lg font-semibold">{selectedTransfer.quantity} units</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">From Location</Label>
                    <p className="text-lg font-semibold">
                      {selectedTransfer.fromLocation ? selectedTransfer.fromLocation.name : 'External'}
                    </p>
                    {selectedTransfer.fromLocation && (
                      <p className="text-sm text-muted-foreground">{selectedTransfer.fromLocation.code}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-sm font-medium">To Location</Label>
                    <p className="text-lg font-semibold">{selectedTransfer.toLocation.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedTransfer.toLocation.code}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Transfer Date</Label>
                    <p className="text-lg font-semibold">
                      {new Date(selectedTransfer.transferDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <div className="mt-1">
                      {getTransferStatusBadge(selectedTransfer.status)}
                    </div>
                  </div>
                </div>
                {selectedTransfer.reference && (
                  <div>
                    <Label className="text-sm font-medium">Reference</Label>
                    <p className="text-lg font-semibold">{selectedTransfer.reference}</p>
                  </div>
                )}
                {selectedTransfer.notes && (
                  <div>
                    <Label className="text-sm font-medium">Notes</Label>
                    <p className="text-sm">{selectedTransfer.notes}</p>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Requested By</Label>
                    <p className="text-sm">{selectedTransfer.requestedBy || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Completed By</Label>
                    <p className="text-sm">{selectedTransfer.completedBy || 'N/A'}</p>
                  </div>
                </div>
                {selectedTransfer.completedAt && (
                  <div>
                    <Label className="text-sm font-medium">Completed At</Label>
                    <p className="text-sm">
                      {new Date(selectedTransfer.completedAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowViewTransferDialog(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Category Dialog */}
        <Dialog open={showAddCategoryDialog} onOpenChange={setShowAddCategoryDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Category</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="category-name">Category Name *</Label>
                <Input
                  id="category-name"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  placeholder="Enter category name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category-description">Description</Label>
                <Textarea
                  id="category-description"
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                  placeholder="Enter category description (optional)"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category-color">Color</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="category-color"
                      type="color"
                      value={newCategory.color}
                      onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      value={newCategory.color}
                      onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                      placeholder="#2563eb"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category-icon">Icon</Label>
                  <Select value={newCategory.icon} onValueChange={(value) => setNewCategory({ ...newCategory, icon: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an icon" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Package">📦 Package</SelectItem>
                      <SelectItem value="Zap">⚡ Electronics</SelectItem>
                      <SelectItem value="Building">🏢 Office</SelectItem>
                      <SelectItem value="Wrench">🔧 Tools</SelectItem>
                      <SelectItem value="Heart">❤️ Health</SelectItem>
                      <SelectItem value="Car">🚗 Automotive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddCategoryDialog(false)}>
                Cancel
              </Button>
              <Button onClick={async () => {
                try {
                  if (!newCategory.name) {
                    toast({
                      title: "Validation Error",
                      description: "Category name is required",
                      variant: "destructive"
                    })
                    return
                  }

                  const createdCategory = await categoriesApi.createCategory({
                    ...newCategory,
                    companyId: companyId
                  })

                  toast({
                    title: "Success",
                    description: "Category created successfully",
                  })

                  // Auto-select the newly created category in the product form
                  setNewProduct({ ...newProduct, categoryId: createdCategory.id })

                  // Reset form and refresh
                  setNewCategory({
                    name: '',
                    description: '',
                    color: '#2563eb',
                    icon: 'Package'
                  })
                  setShowAddCategoryDialog(false)
                  queryClient.invalidateQueries({ queryKey: ['categories'] })
                } catch (error) {

                  toast({
                    title: "Error",
                    description: "Failed to create category. Please try again.",
                    variant: "destructive"
                  })
                }
              }}>
                Create Category
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Manage Categories Dialog */}
        <Dialog open={showViewCategoriesDialog} onOpenChange={setShowViewCategoriesDialog}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Manage Categories</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-muted-foreground">
                  {categories?.length || 0} categories found
                </p>
                <Button onClick={() => setShowAddCategoryDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Category
                </Button>
              </div>

              <div className="grid gap-3 max-h-96 overflow-y-auto">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <div>
                        <p className="font-medium">{category.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {category._count?.products || 0} products
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedCategory_(category)
                          setNewCategory({
                            name: category.name,
                            description: category.description || '',
                            color: category.color || '#2563eb',
                            icon: category.icon || 'Package'
                          })
                          setShowEditCategoryDialog(true)
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowViewCategoriesDialog(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageLayout>
  )
}
