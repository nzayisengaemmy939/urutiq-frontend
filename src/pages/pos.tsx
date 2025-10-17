import { useEffect, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Badge } from "../components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { Label } from "../components/ui/label"
import { 
  ShoppingCart, Search, User, CreditCard, DollarSign, 
  Plus, Minus, X, Check, Calculator, Receipt, 
  Users, Package, Tag, Percent, FileText, Clock,
  Trash2, Edit3, Banknote, Smartphone, Printer, Mail,
  Scan, Info, Star, TrendingUp, Filter, Camera,
  Video, VideoOff, Keyboard, AlertCircle, History,
  ChevronDown, ChevronUp, Eye, Send, Download,
  CheckCircle, XCircle, ExternalLink, Copy
} from "lucide-react"
import { useToast } from "../hooks/use-toast"
import apiService from "../lib/api"
import { inventoryApi, type Product } from "../lib/api/inventory"
import { useAuth } from "../contexts/auth-context"
import { useDemoAuth } from "../hooks/useDemoAuth"
import { getCompanyId } from "../lib/config"
import { Receipt as ReceiptComponent, type ReceiptData } from "../components/Receipt"
import { ReceiptManager } from "../lib/receipt-manager"
import { PaymentButtonCompact } from "../components/payment-button"
import { InvoicePDFGenerator } from "../lib/invoice-pdf-generator"

// POS specific types - using inventory Product interface
type POSProduct = Product

interface POSCartItem {
  product: POSProduct
  quantity: number
  unitPrice: number
  discount: number
  taxRate: number
  lineTotal: number
}

interface POSCustomer {
  id: string
  name: string
  email?: string
  phone?: string
}

interface POSInvoice {
  id: string
  companyId: string
  customerId: string
  invoiceNumber: string
  issueDate: string
  dueDate?: string
  totalAmount: number
  balanceDue: number
  status: string
  currency?: string
  lines?: POSInvoiceLine[]
}

interface POSInvoiceLine {
  id: string
  productId: string
  description: string
  quantity: number
  unitPrice: number
  taxRate: number
  discountRate: number
  lineTotal: number
  product?: POSProduct
}

export default function POSPage() {
  const { toast } = useToast()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const { ready: demoAuthReady } = useDemoAuth('pos-page')
  const queryClient = useQueryClient()
  
  // POS State
  const [selectedCompany, setSelectedCompany] = useState<string>(getCompanyId())
  const [cart, setCart] = useState<POSCartItem[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<POSCustomer | null>(null)
  const [productSearch, setProductSearch] = useState("")
  const [customerSearch, setCustomerSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [showProductInfo, setShowProductInfo] = useState<POSProduct | null>(null)
  const [favoriteProducts, setFavoriteProducts] = useState<string[]>([])
  const [isScanning, setIsScanning] = useState(false)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const [manualBarcode, setManualBarcode] = useState('')
  
  // Loading states for invoice actions
  const [markingAsSent, setMarkingAsSent] = useState<string | null>(null)
  const [markingAsPaid, setMarkingAsPaid] = useState<string | null>(null)

  // Listen for company changes from header
  useEffect(() => {
    const handleStorageChange = () => {
      const newCompanyId = getCompanyId();
      if (newCompanyId && newCompanyId !== selectedCompany) {
        console.log('🔄 POS page - Company changed from', selectedCompany, 'to', newCompanyId);
        setSelectedCompany(newCompanyId);
        // Clear cart when switching companies
        setCart([]);
        setSelectedCustomer(null);
      }
    };

    // Listen for localStorage changes
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events (in case localStorage doesn't trigger)
    const handleCompanyChange = (e: CustomEvent) => {
      const newCompanyId = e.detail.companyId;
      if (newCompanyId && newCompanyId !== selectedCompany) {
        console.log('🔄 POS page - Company changed via custom event from', selectedCompany, 'to', newCompanyId);
        setSelectedCompany(newCompanyId);
        // Clear cart when switching companies
        setCart([]);
        setSelectedCustomer(null);
      }
    };
    
    window.addEventListener('companyChanged', handleCompanyChange as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('companyChanged', handleCompanyChange as EventListener);
    };
  }, [selectedCompany]);
  const [scannerError, setScannerError] = useState<string | null>(null)
  
  // UI State
  const [showCustomerDialog, setShowCustomerDialog] = useState(false)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [showDiscountDialog, setShowDiscountDialog] = useState(false)
  const [showReceiptDialog, setShowReceiptDialog] = useState(false)
  const [showBarcodeDialog, setShowBarcodeDialog] = useState(false)
  const [showInvoiceViewDialog, setShowInvoiceViewDialog] = useState(false)
  const [selectedInvoiceForView, setSelectedInvoiceForView] = useState<POSInvoice | null>(null)
  
  // Customer creation state
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<any>(null)
  const [customerForm, setCustomerForm] = useState<{ name: string; email?: string; currency?: string }>({ name: "", email: "", currency: 'USD' })
  const [customerSaving, setCustomerSaving] = useState(false)
  const [customerError, setCustomerError] = useState<string | null>(null)
  const [showReceiptEmailDialog, setShowReceiptEmailDialog] = useState(false)
  const [receiptEmailTo, setReceiptEmailTo] = useState('')
  const [isSendingReceiptEmail, setIsSendingReceiptEmail] = useState(false)
  const [lastTransaction, setLastTransaction] = useState<any>(null)
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null)
  
  // Customer selection state
  const [recentCustomerIds, setRecentCustomerIds] = useState<string[]>([])
  const [customerSearchFocused, setCustomerSearchFocused] = useState(false)
  
  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'mobile'>('card')
  const [cashReceived, setCashReceived] = useState<number>(0)
  const [processing, setProcessing] = useState(false)
  
  // Discount State
  const [globalDiscount, setGlobalDiscount] = useState(0)
  const [discountType, setDiscountType] = useState<'percent' | 'amount'>('percent')

  // Recent Invoices State
  const [showRecentInvoices, setShowRecentInvoices] = useState(false)
  const [selectedInvoiceActions, setSelectedInvoiceActions] = useState<string | null>(null)
  const [sendEmailOpen, setSendEmailOpen] = useState(false)
  const [sendEmailTo, setSendEmailTo] = useState('')
  const [sendEmailInvoiceId, setSendEmailInvoiceId] = useState<string | null>(null)
  const [sendEmailLoading, setSendEmailLoading] = useState(false)

  // Cleanup camera stream when component unmounts
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop())
      }
    }
  }, [cameraStream])

  // Keyboard shortcuts for barcode scanner
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      // Ctrl+B to open barcode scanner
      if (e.ctrlKey && e.key === 'b' && !showBarcodeDialog) {
        e.preventDefault()
        startBarcodeScanning()
      }
      // Escape to close scanner
      if (e.key === 'Escape' && showBarcodeDialog) {
        closeBarcodeDialog()
      }
    }

    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  }, [showBarcodeDialog])

  // Fetch products from inventory (same as inventory page)
  const { data: productsResponse, isLoading: productsLoading } = useQuery({
    queryKey: ['pos-products', selectedCompany],
    queryFn: () => inventoryApi.getProducts({ 
      companyId: selectedCompany,
      page: 1,
      pageSize: 1000
    }),
    enabled: !!selectedCompany && isAuthenticated && !authLoading && demoAuthReady
  })
  
  // Debug: Log API response and company info
  useEffect(() => {
    // Debug logging removed
    
    if (productsResponse) {
      // Debug logging removed
    }
  }, [productsResponse, selectedCompany, isAuthenticated, authLoading, demoAuthReady])
  
  const products = productsResponse?.items || []
  
  // Debug: Log product stock quantities and statuses
  useEffect(() => {
    if (products.length > 0) {
      const statusCounts = products.reduce((acc, p) => {
        acc[p.status] = (acc[p.status] || 0) + 1
        return acc
      }, {} as Record<string, number>)
      
      // Debug logging removed
    } else {
      // Debug logging removed
    }
  }, [products])

  // Fetch customers
  const { data: customersResponse, isLoading: customersLoading } = useQuery({
    queryKey: ['pos-customers', selectedCompany],
    queryFn: () => apiService.getCustomers({ companyId: selectedCompany, pageSize: 1000 }),
    enabled: !!selectedCompany && isAuthenticated && !authLoading && demoAuthReady
  })
  
  const customers = customersResponse?.items || []

  // Fetch recent invoices for quick access
  const { data: recentInvoicesResponse, isLoading: invoicesLoading } = useQuery({
    queryKey: ['pos-recent-invoices', selectedCompany],
    queryFn: async () => {
      const response = await apiService.getInvoices({ 
        page: 1, 
        pageSize: 5, 
        companyId: selectedCompany 
      })
      const raw = response as any
      const invoiceData = raw?.items ?? raw?.invoices ?? raw?.data ?? raw
      return Array.isArray(invoiceData) ? invoiceData as POSInvoice[] : []
    },
    enabled: !!selectedCompany && isAuthenticated && !authLoading && demoAuthReady
  })
  
  const recentInvoices = recentInvoicesResponse || []

  // Use the selected invoice for view
  const detailedInvoice = selectedInvoiceForView;

  // Filter products for POS - show active and inactive products (exclude discontinued)
  const safeProducts = Array.isArray(products) ? products : []
  const filteredProducts = safeProducts.filter((product: POSProduct) => {
    const matchesSearch = product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      (product.sku && product.sku.toLowerCase().includes(productSearch.toLowerCase())) ||
      (product.barcode && product.barcode.toLowerCase().includes(productSearch.toLowerCase())) ||
      (product.categoryObject?.name && product.categoryObject.name.toLowerCase().includes(productSearch.toLowerCase()))
    
    // Show active and inactive products, exclude discontinued (handle both cases)
    const normalizedStatus = product.status?.toUpperCase()
    const isAvailableProduct = normalizedStatus === 'ACTIVE' || normalizedStatus === 'INACTIVE'
    
    // Filter by category
    const matchesCategory = !selectedCategory || product.categoryId === selectedCategory
    
    // Filter by stock availability - only show products with stock
    const availableQty = Number(product.availableQuantity) || 0
    const stockQty = Number(product.stockQuantity) || 0
    const hasStock = availableQty > 0 || stockQty > 0
    
    // Show available products with stock - inactive products can be reactivated in POS
    return matchesSearch && isAvailableProduct && matchesCategory && hasStock
  })
  
  // Debug: Log filtering results
  useEffect(() => {
    // Debug logging removed
  }, [safeProducts, filteredProducts, productSearch, selectedCategory])

  // Extract unique categories from all available products (active and inactive)
  const categories = Array.from(new Set(
    safeProducts
      .filter(p => {
        const normalizedStatus = p.status?.toUpperCase()
        const isAvailableProduct = normalizedStatus === 'ACTIVE' || normalizedStatus === 'INACTIVE'
        return p.categoryObject?.name && p.categoryId && isAvailableProduct
      })
      .map(p => ({ id: p.categoryId!, name: p.categoryObject!.name }))
  )).sort((a, b) => a.name.localeCompare(b.name))

  // Get favorite products (most frequently added to cart) - available ones
  const favoriteProductsList = safeProducts
    .filter(p => {
      const normalizedStatus = p.status?.toUpperCase()
      const isAvailableProduct = normalizedStatus === 'ACTIVE' || normalizedStatus === 'INACTIVE'
      return favoriteProducts.includes(p.id) && isAvailableProduct
    })
    .slice(0, 6)

  // Filter customers based on search (enhanced with phone number and better matching)
  const filteredCustomers = customers.filter((customer: POSCustomer) => {
    const searchTerm = customerSearch.toLowerCase()
    return (
      customer.name.toLowerCase().includes(searchTerm) ||
      (customer.email && customer.email.toLowerCase().includes(searchTerm)) ||
      (customer.phone && customer.phone.toLowerCase().includes(searchTerm))
    )
  })

  // Get recent customers (last 5 selected customers)
  const recentCustomers = customers.filter((customer: POSCustomer) => 
    recentCustomerIds.includes(customer.id)
  ).slice(0, 5)

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => {
    const lineSubtotal = (item.quantity * item.unitPrice) - item.discount
    
    // If product is tax inclusive, we need to extract the tax from the price
        if (item.product.taxInclusive && item.product.taxRate && item.product.taxRate > 0) {
      // For tax inclusive: net price = gross price / (1 + tax rate/100)
        const netPrice = lineSubtotal / (1 + ((item.product.taxRate || 0) / 100))
      return sum + netPrice
    } else {
      // For tax exclusive: use the line subtotal as is
      return sum + lineSubtotal
    }
  }, 0)
  
  const discountAmount = discountType === 'percent' ? (subtotal * globalDiscount / 100) : globalDiscount
  
  const taxAmount = cart.reduce((sum, item) => {
    const lineSubtotal = (item.quantity * item.unitPrice) - item.discount
    
        if (item.product.taxInclusive && item.product.taxRate && item.product.taxRate > 0) {
      // For tax inclusive: tax amount = gross price - net price
        const netPrice = lineSubtotal / (1 + ((item.product.taxRate || 0) / 100))
      return sum + (lineSubtotal - netPrice)
    } else {
      // For tax exclusive: add tax on top
        return sum + (lineSubtotal * ((item.product.taxRate || 0) / 100))
    }
  }, 0)
  
  const total = subtotal - discountAmount + taxAmount

  // Add product to cart
  const addToCart = (product: POSProduct) => {
    // Use the same stock calculation logic as getStockDisplay
    const availableQty = Number(product.availableQuantity) || 0
    const stockQty = Number(product.stockQuantity) || 0
    const availableStock = availableQty > 0 ? availableQty : stockQty
    
    const existingItemIndex = cart.findIndex(item => item.product.id === product.id)
    
    // Check stock availability (different logic for services vs products)
    const currentQuantityInCart = existingItemIndex >= 0 ? cart[existingItemIndex].quantity : 0
    if (currentQuantityInCart >= availableStock) {
      const isServiceProduct = isService(product)
      toast({
        title: isServiceProduct ? "Service Unavailable" : "Insufficient Stock",
        description: isServiceProduct 
          ? `No more slots available for ${product.name}${availableStock === 0 ? ' (Fully Booked)' : ''}`
          : `Only ${availableStock} units available for ${product.name}`,
        variant: "destructive"
      })
      return
    }
    
    if (existingItemIndex >= 0) {
      const newCart = [...cart]
      newCart[existingItemIndex].quantity += 1
      newCart[existingItemIndex].lineTotal = 
        (newCart[existingItemIndex].quantity * newCart[existingItemIndex].unitPrice) - newCart[existingItemIndex].discount
      setCart(newCart)
    } else {
      const newItem: POSCartItem = {
        product,
        quantity: 1,
        unitPrice: product.unitPrice,
        discount: 0,
        taxRate: product.taxRate || 0, // Use product's actual tax rate
        lineTotal: product.unitPrice
      }
      setCart([...cart, newItem])
    }
  }

  // Update cart item quantity
  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId)
      return
    }

    // Find the cart item and check stock
    const cartItem = cart.find(item => item.product.id === productId)
    if (cartItem) {
      const availableStock = cartItem.product.availableQuantity || cartItem.product.stockQuantity || 0
      if (newQuantity > availableStock) {
        toast({
          title: "Insufficient Stock",
          description: `Only ${availableStock} units available for ${cartItem.product.name}`,
          variant: "destructive"
        })
        return
      }
    }
    
    const newCart = cart.map(item => {
      if (item.product.id === productId) {
        return {
          ...item,
          quantity: newQuantity,
          lineTotal: (newQuantity * item.unitPrice) - item.discount
        }
      }
      return item
    })
    setCart(newCart)
  }

  // Remove from cart
  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId))
  }

  // Clear cart
  const clearCart = () => {
    setCart([])
    setSelectedCustomer(null)
    setGlobalDiscount(0)
  }

  // Create invoice mutation
  const createInvoiceMutation = useMutation({
    mutationFn: async () => {
      if (!selectedCustomer) {
        throw new Error('Please select a customer')
      }
      
      const invoiceData = {
        companyId: selectedCompany,
        customerId: selectedCustomer.id,
        invoiceNumber: `POS-${Date.now()}`,
        issueDate: new Date().toISOString(),
        currency: 'USD',
        lines: cart.map(item => ({
          productId: item.product.id,
          description: item.product.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          taxRate: item.taxRate,
          discountRate: item.discount // Changed from lineDiscount to discountRate
        })),
        subtotal,
        taxAmount,
        discountAmount,
        shippingAmount: 0,
        totalAmount: total,
        balanceDue: total,
        notes: 'Created via POS system',
        terms: 'Payment due on receipt',
        paymentTerms: 'Due on Receipt',
        status: 'paid'
      }
      
      return apiService.createInvoice(invoiceData)
    },
    onSuccess: async (invoice) => {
      try {
        // Invoice is already created as 'paid', so inventory should be updated automatically
        // Generate receipt data
        const receipt: ReceiptData = {
          invoiceNumber: invoice.invoiceNumber || `POS-${Date.now()}`,
          date: new Date().toLocaleDateString(),
          customer: selectedCustomer ? {
            name: selectedCustomer.name,
            email: selectedCustomer.email,
            phone: selectedCustomer.phone
          } : undefined,
          items: cart.map(item => ({
            name: item.product.name,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.lineTotal
          })),
          subtotal,
          taxAmount,
          discountAmount,
          total,
          paymentMethod,
          cashReceived: paymentMethod === 'cash' ? cashReceived : undefined,
          change: paymentMethod === 'cash' && cashReceived > total ? cashReceived - total : undefined,
          companyInfo: {
            name: 'UrutiIQ Business', // TODO: Get from company settings
            address: '123 Business St, City, State 12345',
            phone: '+1 (555) 123-4567',
            email: 'contact@urutiiq.com',
            website: 'www.urutiiq.com'
          }
        }
        
        setReceiptData(receipt)
        setLastTransaction(invoice)
        setShowReceiptDialog(true)
        
        toast({
          title: "Sale Completed",
          description: `Invoice ${invoice.invoiceNumber} processed successfully. Stock updated.`,
        })
        
        // Invalidate queries to refresh data
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['invoices'] }),
          queryClient.invalidateQueries({ queryKey: ['pos-recent-invoices'] }),
          queryClient.invalidateQueries({ queryKey: ['pos-products', selectedCompany] }),
          queryClient.invalidateQueries({ queryKey: ['products'] }),
          queryClient.invalidateQueries({ queryKey: ['inventory-movements'] }),
          queryClient.invalidateQueries({ queryKey: ['journal-entries'] })
        ])
        
        // Force refetch of POS products to ensure fresh data
        await queryClient.refetchQueries({ queryKey: ['pos-products', selectedCompany] })
        
        clearCart()
        setShowPaymentDialog(false)
        
      } catch (error: any) {
        console.error('Error in POS success handler:', error)
        
        // Still show receipt even if there's an error
        const receipt: ReceiptData = {
          invoiceNumber: invoice.invoiceNumber || `POS-${Date.now()}`,
          date: new Date().toLocaleDateString(),
          customer: selectedCustomer ? {
            name: selectedCustomer.name,
            email: selectedCustomer.email,
            phone: selectedCustomer.phone
          } : undefined,
          items: cart.map(item => ({
            name: item.product.name,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.lineTotal
          })),
          subtotal,
          taxAmount,
          discountAmount,
          total,
          paymentMethod,
          cashReceived: paymentMethod === 'cash' ? cashReceived : undefined,
          change: paymentMethod === 'cash' && cashReceived > total ? cashReceived - total : undefined,
          companyInfo: {
            name: 'UrutiIQ Business',
            address: '123 Business St, City, State 12345',
            phone: '+1 (555) 123-4567',
            email: 'contact@urutiiq.com',
            website: 'www.urutiiq.com'
          }
        }
        
        setReceiptData(receipt)
        setLastTransaction(invoice)
        setShowReceiptDialog(true)
        
        toast({
          title: "Sale Completed",
          description: `Invoice ${invoice.invoiceNumber} created successfully.`,
        })
        
        // Invalidate queries to refresh data even on error
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['invoices'] }),
          queryClient.invalidateQueries({ queryKey: ['pos-products', selectedCompany] }),
          queryClient.invalidateQueries({ queryKey: ['products'] })
        ])
        
        // Force refetch of POS products to ensure fresh data
        await queryClient.refetchQueries({ queryKey: ['pos-products', selectedCompany] })
        
        clearCart()
        setShowPaymentDialog(false)
      }
    },
    onError: (error: any) => {
      toast({
        title: "Sale Failed",
        description: error.message || "Failed to create invoice",
        variant: "destructive"
      })
    }
  })

  // Process payment
  const processPayment = () => {
    if (paymentMethod === 'cash' && cashReceived < total) {
      toast({
        title: "Insufficient Cash",
        description: `Need ${formatCurrency(total - cashReceived)} more`,
        variant: "destructive"
      })
      return
    }
    
    createInvoiceMutation.mutate()
  }

  // Barcode scanning functionality
  const startBarcodeScanning = () => {
    setShowBarcodeDialog(true)
    setScannerError(null)
    setManualBarcode('')
  }

  const startCamera = async () => {
    setIsScanning(true)
    setScannerError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      })
      setCameraStream(stream)
      
      // In a real implementation, you would integrate with a barcode scanning library
      // like QuaggaJS or ZXing to scan from the video stream
      toast({
        title: "Camera Ready",
        description: "Point camera at barcode or enter manually below",
      })
    } catch (error) {
      setScannerError("Unable to access camera. Please use manual input.")
      setIsScanning(false)
    }
  }

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop())
      setCameraStream(null)
    }
    setIsScanning(false)
  }

  const processBarcode = (barcode: string) => {
    if (!barcode.trim()) return

    const product = safeProducts.find(p => 
      p.barcode === barcode.trim() || 
      p.sku === barcode.trim()
    )
    
    if (product) {
      addToCart(product)
      toast({
        title: "Product Added",
        description: `${product.name} added to cart`,
      })
      closeBarcodeDialog()
    } else {
      toast({
        title: "Product Not Found",
        description: "No product found with this barcode",
        variant: "destructive"
      })
    }
  }

  const closeBarcodeDialog = () => {
    stopCamera()
    setShowBarcodeDialog(false)
    setManualBarcode('')
    setScannerError(null)
  }

  // Handle invoice view
  const handleViewInvoice = (invoice: POSInvoice) => {
    setSelectedInvoiceForView(invoice)
    setShowInvoiceViewDialog(true)
  }

  // Toggle favorite product
  const toggleFavorite = (productId: string) => {
    setFavoriteProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  // Helper function to determine if a product is a service
  const isService = (product: POSProduct) => {
    return product.type === 'SERVICE'
  }

  // Helper function to select customer from invoice for quick checkout
  const selectCustomerFromInvoice = (invoice: POSInvoice) => {
    const customer = customers.find(c => c.id === invoice.customerId)
    if (customer) {
      setSelectedCustomer(customer)
      toast({
        title: "Customer Selected",
        description: `${customer.name} selected for checkout. Add items to continue transaction.`,
      })
    }
  }

  // Invoice action handlers
  const handleMarkInvoiceAsSent = async (invoiceId: string) => {
    setMarkingAsSent(invoiceId)
    try {
      await apiService.updateInvoice(invoiceId, { status: 'sent' })
      queryClient.invalidateQueries({ queryKey: ['pos-recent-invoices'] })
      toast({
        title: "Invoice Updated",
        description: "Invoice marked as sent successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update invoice status",
        variant: "destructive"
      })
    } finally {
      setMarkingAsSent(null)
    }
  }

  const handleMarkInvoiceAsPaid = async (invoiceId: string) => {
    setMarkingAsPaid(invoiceId)
    try {
      // First, try to process accounting entries and inventory updates
      const accountingResult = await apiService.processInvoicePayment(invoiceId)
      
      // Update invoice status after successful accounting processing
      await apiService.updateInvoice(invoiceId, { status: 'paid', balanceDue: 0 })
      
      queryClient.invalidateQueries({ queryKey: ['pos-recent-invoices'] })
      queryClient.invalidateQueries({ queryKey: ["journal-entries"] })
      queryClient.invalidateQueries({ queryKey: ["inventory-movements"] })
      
      toast({
        title: "Invoice Paid",
        description: `Payment processed successfully. Journal Entry: ${accountingResult.journalEntryId}`,
      })
    } catch (error: any) {
      console.error('Error marking invoice as paid:', error)
      
      let errorTitle = "Error"
      let errorDescription = "Failed to mark invoice as paid. Please try again."
      
      if (error.message) {
        if (error.message.includes('Insufficient inventory')) {
          errorTitle = "Insufficient Inventory"
          errorDescription = error.message
        } else if (error.message.includes('Company with ID') && error.message.includes('not found')) {
          errorTitle = "Company Not Found"
          errorDescription = "The company associated with this invoice could not be found. Please contact support."
        } else if (error.message.includes('Failed to create account')) {
          errorTitle = "Account Setup Required"
          errorDescription = "Required accounting accounts are missing. Please ensure the company has proper account setup."
        } else if (error.message.includes('Transaction already closed') || error.message.includes('timeout')) {
          errorTitle = "Processing Timeout"
          errorDescription = "The payment processing took too long. Please try again or contact support if the issue persists."
        } else if (error.message.includes('Failed to process invoice payment')) {
          errorTitle = "Payment Processing Failed"
          errorDescription = error.message.replace('Failed to process invoice payment: ', '')
        } else {
          errorDescription = error.message
        }
      }
      
      toast({
        title: errorTitle,
        description: errorDescription,
        variant: "destructive"
      })
    } finally {
      setMarkingAsPaid(null)
    }
  }

  const handleDownloadInvoicePdf = async (invoiceId: string, invoiceNumber: string) => {
    try {
      // Find the invoice data
      const invoice = recentInvoices.find(inv => inv.id === invoiceId)
      if (!invoice) {
        toast({
          title: "Invoice Not Found",
          description: "Could not find invoice data for PDF generation.",
          variant: "destructive"
        })
        return
      }

      // Find customer data
      const customer = customers.find(c => c.id === invoice.customerId)
      
      // Generate PDF using frontend generator
      const generator = new InvoicePDFGenerator({
        invoice: {
          id: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          issueDate: invoice.issueDate,
          dueDate: invoice.dueDate,
          status: invoice.status,
          totalAmount: invoice.totalAmount,
          balanceDue: invoice.balanceDue,
          currency: customer?.currency || 'USD',
          subtotal: (invoice as any).subtotal || invoice.totalAmount,
          taxAmount: (invoice as any).taxAmount || 0,
          discountAmount: (invoice as any).discountAmount || 0,
          customer: customer ? {
            name: customer.name,
            email: customer.email,
            address: customer.address,
            phone: (customer as any).phone,
            taxId: (customer as any).taxId
          } : undefined,
          lines: (invoice as any).lines || [],
          notes: (invoice as any).notes,
          paymentUrl: (invoice as any).paymentUrl
        },
        company: {
          name: 'Your Company',
          logoUrl: undefined,
          primaryColor: '#009688',
          secondaryColor: '#1565c0',
          address: undefined,
          city: undefined,
          state: undefined,
          postalCode: undefined,
          email: undefined,
          phone: undefined,
          website: undefined,
          fontFamily: 'Inter',
          invoiceTerms: 'Payment is due within 30 days of invoice date.',
          invoiceFooter: 'Thank you for your business!'
        } as any
      })

      await generator.download()
      
      toast({
        title: "PDF Downloaded",
        description: `Invoice ${invoiceNumber} has been downloaded successfully.`,
      })
    } catch (error) {
      console.error('Error downloading invoice PDF:', error)
      
      // Fallback to backend API if frontend generator fails
      try {
        const blob = await apiService.getInvoicePdf(invoiceId)
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `invoice-${invoiceNumber}.pdf`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        
        toast({
          title: "PDF Downloaded",
          description: `Invoice ${invoiceNumber} has been downloaded successfully.`,
        })
      } catch (backendError) {
        console.error('Backend PDF generation also failed:', backendError)
        toast({
          title: "Download Failed",
          description: "There was an error downloading the PDF. Please try again.",
          variant: "destructive"
        })
      }
    }
  }

  const handleSendInvoiceEmail = async () => {
    if (!sendEmailInvoiceId || !sendEmailTo) return
    
    setSendEmailLoading(true)
    try {
      // Find the invoice data
      const invoice = recentInvoices.find(inv => inv.id === sendEmailInvoiceId)
      if (!invoice) {
        toast({
          title: "Invoice Not Found",
          description: "Could not find invoice data for email generation.",
          variant: "destructive"
        })
        return
      }

      // Find customer data
      const customer = customers.find(c => c.id === invoice.customerId)
      
      // Generate PDF using frontend generator
      const generator = new InvoicePDFGenerator({
        invoice: {
          id: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          issueDate: invoice.issueDate,
          dueDate: invoice.dueDate,
          status: invoice.status,
          totalAmount: invoice.totalAmount,
          balanceDue: invoice.balanceDue,
          currency: customer?.currency || 'USD',
          subtotal: (invoice as any).subtotal || invoice.totalAmount,
          taxAmount: (invoice as any).taxAmount || 0,
          discountAmount: (invoice as any).discountAmount || 0,
          customer: customer ? {
            name: customer.name,
            email: customer.email,
            address: customer.address,
            phone: (customer as any).phone,
            taxId: (customer as any).taxId
          } : undefined,
          lines: (invoice as any).lines || [],
          notes: (invoice as any).notes,
          paymentUrl: (invoice as any).paymentUrl
        },
        company: {
          name: 'Your Company',
          logoUrl: undefined,
          primaryColor: '#009688',
          secondaryColor: '#1565c0',
          address: undefined,
          city: undefined,
          state: undefined,
          postalCode: undefined,
          email: undefined,
          phone: undefined,
          website: undefined,
          fontFamily: 'Inter',
          invoiceTerms: 'Payment is due within 30 days of invoice date.',
          invoiceFooter: 'Thank you for your business!'
        } as any
      })

      // Generate PDF blob
      const pdfBlob = await generator.generate()
      // Debug logging removed
      
      // Debug logging removed;
      
      // Send email with frontend-generated PDF
      await apiService.sendInvoiceEmail(invoice.id, {
        to: sendEmailTo,
        subject: `Invoice ${invoice.invoiceNumber}`,
        message: `Please find your invoice ${invoice.invoiceNumber} attached. Thank you for your business!`,
        attachPdf: true,
        pdfBlob: pdfBlob
      })
      
      toast({
        title: "Email Sent",
        description: `Invoice ${invoice.invoiceNumber} has been sent to ${sendEmailTo}`,
      })
      
      setSendEmailOpen(false)
      setSendEmailTo('')
      setSendEmailInvoiceId(null)
    } catch (error) {
      console.error('Error sending invoice email:', error)
      
      // Fallback to backend API if frontend generation fails
      try {
        const result = await apiService.sendInvoiceEmail(sendEmailInvoiceId, { 
          to: sendEmailTo, 
          attachPdf: true 
        })
        
        // Check if there's a warning about SMTP not being configured
        if (result?.warning) {
          toast({
            title: "Email Queued",
            description: result.warning,
            variant: "default"
          })
        } else {
          toast({
            title: "Email Sent",
            description: `Invoice sent to ${sendEmailTo}`,
          })
        }
        
        setSendEmailOpen(false)
        setSendEmailTo('')
        setSendEmailInvoiceId(null)
      } catch (backendError: any) {
        console.error('Backend email sending failed:', backendError)
        
        toast({
          title: "Email Service Unavailable",
          description: "Email service is not configured. Please contact your administrator to set up SMTP settings.",
          variant: "destructive"
        })
      }
    } finally {
      setSendEmailLoading(false)
    }
  }

  const handleCreatePaymentLink = async (invoiceId: string, invoiceNumber: string) => {
    try {
      const response = await apiService.createPaymentLink(invoiceId)
      
      // Copy link to clipboard
      await navigator.clipboard.writeText(response.url)
      
      toast({
        title: "Payment Link Created",
        description: `Link for ${invoiceNumber} copied to clipboard`,
      })
    } catch (error) {
      toast({
        title: "Link Creation Failed",
        description: "Unable to create payment link",
        variant: "destructive"
      })
    }
  }

  // Helper function to get stock display for services vs products
  const getStockDisplay = (product: POSProduct) => {
    // Convert string values to numbers and handle the case where availableQuantity is 0 but stockQuantity has value
    const availableQty = Number(product.availableQuantity) || 0
    const stockQty = Number(product.stockQuantity) || 0
    
    // Use availableQuantity if it's > 0, otherwise fall back to stockQuantity
    const availableStock = availableQty > 0 ? availableQty : stockQty
    
    if (isService(product)) {
      // Services handle "stock" differently
      if (availableStock >= 999999) {
        const result = { text: "Available", status: "available" }
        return result
      } else if (availableStock > 50) {
        const result = { text: `${availableStock} slots available`, status: "available" }
        return result
      } else if (availableStock > 10) {
        const result = { text: `${availableStock} slots available`, status: "limited" }
        return result
      } else if (availableStock > 0) {
        const result = { text: `Only ${availableStock} slots left`, status: "low" }
        return result
      } else {
        const result = { text: "Fully Booked", status: "unavailable" }
        return result
      }
    } else {
      // Physical products
      if (availableStock <= 0) {
        const result = { text: "Out of Stock", status: "unavailable" }
        return result
      } else if (availableStock <= 10) {
        const result = { text: `Stock: ${availableStock}`, status: "low" }
        return result
      } else {
        const result = { text: `Stock: ${availableStock}`, status: "available" }
        return result
      }
    }
  }

  // Helper function to get appropriate icon for product type
  const getProductIcon = (product: POSProduct) => {
    if (isService(product)) {
      // Return service-specific icons based on category or service type
      const categoryName = product.categoryObject?.name?.toLowerCase() || ''
      if (categoryName.includes('consulting')) return '💼'
      if (categoryName.includes('technical')) return '💻'
      if (categoryName.includes('creative')) return '🎨'
      if (categoryName.includes('maintenance')) return '🔧'
      if (categoryName.includes('training')) return '🎓'
      return '⚡' // Default service icon
    }
    return <Package className="w-8 h-8 text-blue-600" />
  }

  // Handle customer selection with recent customers tracking
  const handleCustomerSelection = (customer: POSCustomer) => {
    setSelectedCustomer(customer)
    setShowCustomerDialog(false)
    setCustomerSearch("")
    
    // Add to recent customers
    setRecentCustomerIds(prev => {
      const filtered = prev.filter(id => id !== customer.id)
      return [customer.id, ...filtered].slice(0, 5)
    })
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle shortcuts when not in input fields
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      // Customer selection shortcut (Ctrl/Cmd + C)
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        e.preventDefault()
        setShowCustomerDialog(true)
      }
      
      // Clear cart shortcut (Ctrl/Cmd + Delete)
      if ((e.ctrlKey || e.metaKey) && e.key === 'Delete') {
        e.preventDefault()
        clearCart()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Show loading state while authentication is being initialized
  if (authLoading || !demoAuthReady) {
    return (
      <div className="bg-slate-50 flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Loading POS System</h2>
          <p className="text-slate-600">Initializing point of sale...</p>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="bg-slate-50 flex flex-col overflow-hidden h-screen min-h-screen max-h-screen -mt-20 pt-20"
      style={{
        height: '100vh',
        maxHeight: '100vh',
        minHeight: '100vh',
      }}
    >
      {/* Header - Fixed Height */}
      <div className="bg-white border-b border-slate-200 p-2 flex items-center justify-between flex-shrink-0 h-16">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
            <ShoppingCart className="w-3 h-3 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">Point of Sale</h1>
            <p className="text-xs text-slate-600">Quick checkout system</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="h-6 text-xs">
            <Clock className="w-3 h-3 mr-1" />
            {new Date().toLocaleTimeString()}
          </Badge>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowCustomerDialog(true)}
            className="h-6 text-xs"
            title="Select Customer (Ctrl+C)"
          >
            <User className="w-3 h-3 mr-1" />
            Customer
          </Button>
          <Button variant="outline" size="sm" onClick={clearCart} disabled={cart.length === 0} className="h-6 text-xs" title="Clear Cart (Ctrl+Delete)">
            <Trash2 className="w-3 h-3 mr-1" />
            Clear
          </Button>
        </div>
      </div>

      <div className="flex-1 flex min-h-0 max-h-full">
        {/* Left Panel - Products */}
        <div className="flex-1 flex flex-col min-h-0 max-h-full">
          {/* Controls Bar - Fixed */}
          <div className="bg-white p-3 border-b border-slate-200 flex-shrink-0">
            {/* Search & Barcode Scanner */}
            <div className="mb-3">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Search products, SKU, barcode..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="pl-9 h-8 text-sm"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={startBarcodeScanning}
                  disabled={isScanning}
                  className="h-8 px-3"
                  title="Barcode Scanner (Ctrl+B)"
                >
                  <Scan className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Favorite Products Quick Add */}
            {favoriteProductsList.length > 0 && (
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-medium text-slate-700">Quick Add</span>
                </div>
                <div className="flex gap-1 overflow-x-auto pb-1">
                  {favoriteProductsList.map(product => (
                    <Button
                      key={product.id}
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation()
                        e.preventDefault()
                        addToCart(product)
                      }}
                      className="h-6 text-xs whitespace-nowrap flex-shrink-0"
                    >
                      {product.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Category Filters */}
            {categories.length > 0 && (
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <Filter className="w-4 h-4 text-blue-500" />
                  <span className="text-xs font-medium text-slate-700">Categories</span>
                </div>
                <div className="flex gap-1 overflow-x-auto pb-1">
                  <Button
                    size="sm"
                    variant={!selectedCategory ? "default" : "outline"}
                    onClick={() => setSelectedCategory("")}
                    className="h-6 text-xs whitespace-nowrap flex-shrink-0"
                  >
                    All
                  </Button>
                  {categories.map(category => (
                    <Button
                      key={category.id}
                      size="sm"
                      variant={selectedCategory === category.id ? "default" : "outline"}
                      onClick={() => setSelectedCategory(category.id)}
                      className="h-6 text-xs whitespace-nowrap flex-shrink-0"
                    >
                      {category.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Available Products Count */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="text-xs h-5">
                  {filteredProducts.length} available for sale
                </Badge>
                <div className="text-xs text-slate-500">
                  Only showing active products with stock
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid - Scrollable */}
          <div className="flex-1 p-3 overflow-y-auto bg-slate-50 min-h-0">
            {productsLoading ? (
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-2">
                {[...Array(14)].map((_, i) => (
                  <div key={i} className="aspect-square bg-slate-200 rounded-md animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-2 pb-2">
                {filteredProducts.map((product: POSProduct) => {
                  const stockDisplay = getStockDisplay(product)
                  const isLowOrLimited = stockDisplay.status === 'low' || stockDisplay.status === 'limited'
                  const isOutOfStock = stockDisplay.status === 'unavailable'
                  const productIcon = getProductIcon(product)
                  
                  return (
                    <Card
                      key={product.id}
                      className={`cursor-pointer hover:shadow-md transition-all duration-150 hover:scale-[1.02] group relative ${
                        isOutOfStock ? 'opacity-60 border-red-200 cursor-not-allowed' : ''
                      }`}
                      onClick={(e) => {
                        e.stopPropagation()
                        e.preventDefault()
                        !isOutOfStock && addToCart(product)
                      }}
                    >
                      <CardContent className="p-2 aspect-square flex flex-col">
                        <div className="flex-1 flex items-center justify-center mb-1">
                          <div className={`w-8 h-8 rounded-md flex items-center justify-center group-hover:scale-105 transition-all duration-150 ${
                            isService(product) 
                              ? 'bg-gradient-to-br from-purple-100 to-purple-200' 
                              : 'bg-gradient-to-br from-blue-100 to-blue-200'
                          }`}>
                            {typeof productIcon === 'string' ? (
                              <span className="text-sm">{productIcon}</span>
                            ) : (
                              <div className="w-4 h-4 text-blue-600">
                                <Package className="w-full h-full" />
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-center">
                          <h3 className="font-medium text-slate-900 text-xs leading-tight mb-1 line-clamp-1">
                            {product.name}
                          </h3>
                          {isService(product) && (
                            <div className="text-xs bg-purple-50 text-purple-700 rounded px-1 mb-1">
                              Service
                            </div>
                          )}
                          <div className={`text-xs font-bold ${isService(product) ? 'text-purple-600' : 'text-green-600'}`}>
                            {formatCurrency(product.unitPrice)}
                          </div>
                          <div className={`text-xs ${
                            stockDisplay.status === 'unavailable' ? 'text-red-600' : 
                            stockDisplay.status === 'low' || stockDisplay.status === 'limited' ? 'text-orange-600' : 
                            'text-slate-500'
                          }`}>
                            {stockDisplay.text}
                          </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="absolute top-1 left-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation()
                              setShowProductInfo(product)
                            }}
                            className="h-5 w-5 p-0 bg-white/80 hover:bg-white"
                          >
                            <Info className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleFavorite(product.id)
                            }}
                            className={`h-5 w-5 p-0 ${
                              favoriteProducts.includes(product.id) 
                                ? 'bg-amber-100 text-amber-600 hover:bg-amber-200' 
                                : 'bg-white/80 hover:bg-white'
                            }`}
                          >
                            <Star className="w-3 h-3" fill={favoriteProducts.includes(product.id) ? "currentColor" : "none"} />
                          </Button>
                        </div>

                        {/* Compact Status Badge */}
                        {stockDisplay.status === 'unavailable' && (
                          <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></div>
                        )}
                        {/* Stock Level Indicators */}
                        {stockDisplay.status === 'low' && (
                          <div className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full"></div>
                        )}
                        {stockDisplay.status === 'limited' && isService(product) && (
                          <div className="absolute top-1 right-1 w-2 h-2 bg-yellow-500 rounded-full"></div>
                        )}
                        
                       
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
            
            {!productsLoading && filteredProducts.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-slate-500">
                <Package className="w-12 h-12 mb-3 text-slate-300" />
                <h3 className="font-medium mb-1">No products found</h3>
                <p className="text-sm">Try adjusting your search</p>
              </div>
            )}
          </div>

          {/* Products Summary - Fixed at Bottom */}
          <div className="bg-white border-t border-slate-200 p-3 flex-shrink-0">
            <div className="grid grid-cols-4 gap-3 text-center">
              {/* Total Products */}
              <div className="bg-slate-50 rounded-lg p-2">
                <div className="text-lg font-bold text-slate-900">
                  {filteredProducts.length}
                </div>
                <div className="text-xs text-slate-600">Products</div>
              </div>
              
              {/* Cart Items */}
              <div className="bg-blue-50 rounded-lg p-2">
                <div className="text-lg font-bold text-blue-700">
                  {cart.length}
                </div>
                <div className="text-xs text-blue-600">In Cart</div>
              </div>
              
              {/* Cart Total */}
              <div className="bg-green-50 rounded-lg p-2">
                <div className="text-lg font-bold text-green-700">
                  {formatCurrency(total)}
                </div>
                <div className="text-xs text-green-600">Total</div>
              </div>
              
              {/* Quick Actions */}
              <div className="flex flex-col gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={startBarcodeScanning}
                  disabled={isScanning}
                  className="h-6 text-xs"
                  title="Barcode Scanner (Ctrl+B)"
                >
                  <Scan className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowCustomerDialog(true)}
                  className="h-6 text-xs"
                  title="Select Customer"
                >
                  <User className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Cart & Checkout */}
        <div className="w-72 bg-white border-l border-slate-200 flex flex-col min-h-0 max-h-full">
          {/* Enhanced Customer Selection - Fixed */}
          <div className="p-2 border-b border-slate-200 flex-shrink-0">
            <Button
              variant={selectedCustomer ? "default" : "outline"}
              onClick={() => setShowCustomerDialog(true)}
              className="w-full h-auto justify-start text-xs p-2"
            >
              <div className="flex items-center gap-2 w-full">
                {selectedCustomer ? (
                  <>
                    {/* Customer Avatar */}
                    <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0">
                      {selectedCustomer.name.charAt(0).toUpperCase()}
                    </div>
                    {/* Customer Info */}
                    <div className="flex-1 text-left min-w-0">
                      <div className="font-medium truncate">{selectedCustomer.name}</div>
                      {(selectedCustomer.email || selectedCustomer.phone) && (
                        <div className="text-xs opacity-75 truncate">
                          {selectedCustomer.email || selectedCustomer.phone}
                        </div>
                      )}
                    </div>
                    {/* Clear Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedCustomer(null)
                      }}
                      className="h-4 w-4 p-0 hover:bg-white/20"
                    >
                      <X className="w-2 h-2" />
                    </Button>
                  </>
                ) : (
                  <>
                    <User className="w-3 h-3" />
                    <span className="truncate">Select Customer</span>
                  </>
                )}
              </div>
            </Button>
          </div>

          {/* Recent Invoices Section - Collapsible */}
          <div className="border-b border-slate-200 flex-shrink-0">
            <div className="p-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowRecentInvoices(!showRecentInvoices)}
                className="w-full justify-between h-8 text-xs"
              >
                <div className="flex items-center gap-2">
                  <History className="w-3 h-3" />
                  <span>Recent Invoices</span>
                  {!invoicesLoading && recentInvoices.length > 0 && (
                    <Badge variant="secondary" className="h-4 text-xs">
                      {recentInvoices.length}
                    </Badge>
                  )}
                </div>
                {showRecentInvoices ? (
                  <ChevronUp className="w-3 h-3" />
                ) : (
                  <ChevronDown className="w-3 h-3" />
                )}
              </Button>
              
              {showRecentInvoices && (
                <div className="mt-2 space-y-1">
                  {invoicesLoading ? (
                    <div className="space-y-1">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-12 bg-slate-100 rounded animate-pulse" />
                      ))}
                    </div>
                  ) : recentInvoices.length === 0 ? (
                    <div className="text-center py-3 text-slate-500">
                      <Receipt className="w-4 h-4 mx-auto mb-1 text-slate-300" />
                      <p className="text-xs">No recent invoices</p>
                    </div>
                  ) : (
                    recentInvoices.map((invoice) => {
                      const customer = customers.find(c => c.id === invoice.customerId)
                      const isOverdue = invoice.dueDate && new Date(invoice.dueDate) < new Date() && invoice.balanceDue > 0
                      const showActions = selectedInvoiceActions === invoice.id
                      
                      return (
                        <div
                          key={invoice.id}
                          className="bg-slate-50 rounded-lg p-2 border border-slate-200 hover:bg-slate-100 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1 mb-1">
                                <span className="text-xs font-medium text-slate-900">
                                  {invoice.invoiceNumber}
                                </span>
                                <Badge 
                                  variant={
                                    invoice.status === "paid" ? "default" :
                                    isOverdue ? "destructive" : 
                                    "secondary"
                                  }
                                  className="text-xs h-4"
                                >
                                  {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                                </Badge>
                                {isOverdue && (
                                  <Badge variant="destructive" className="text-xs h-4">
                                    Overdue
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-slate-600 truncate">
                                {customer ? customer.name : 'Unknown Customer'}
                              </p>
                              <p className="text-xs text-slate-500">
                                {new Date(invoice.issueDate).toLocaleDateString()}
                                {invoice.dueDate && (
                                  <span className="ml-2">
                                    Due: {new Date(invoice.dueDate).toLocaleDateString()}
                                  </span>
                                )}
                              </p>
                            </div>
                            <div className="text-right ml-2">
                              <p className="text-xs font-semibold text-slate-900">
                                {formatCurrency(invoice.totalAmount)}
                              </p>
                              {invoice.balanceDue > 0 && (
                                <p className="text-xs text-amber-600">
                                  Due: {formatCurrency(invoice.balanceDue)}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          {/* Action Toggle Button */}
                          <div className="flex gap-1 mt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-6 text-xs flex-1"
                              onClick={() => {
                                setSelectedInvoiceActions(showActions ? null : invoice.id)
                              }}
                            >
                              {showActions ? (
                                <>
                                  <ChevronUp className="w-3 h-3 mr-1" />
                                  Hide
                                </>
                              ) : (
                                <>
                                  <Eye className="w-3 h-3 mr-1" />
                                  Actions
                                </>
                              )}
                            </Button>
                            
                            {/* Quick Customer Select */}
                            {invoice.status !== 'paid' && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-6 text-xs flex-1"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  selectCustomerFromInvoice(invoice)
                                }}
                              >
                                <ShoppingCart className="w-3 h-3 mr-1" />
                                Select
                              </Button>
                            )}
                          </div>

                          {/* Expanded Actions Panel */}
                          {showActions && (
                            <div className="mt-2 p-2 bg-white rounded border border-slate-200 space-y-2">
                              <div className="grid grid-cols-2 gap-1">
                                {/* View Invoice Details */}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 text-xs"
                                  onClick={() => handleViewInvoice(invoice)}
                                >
                                  <Eye className="w-3 h-3 mr-1" />
                                  View
                                </Button>

                                {/* Download PDF */}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 text-xs"
                                  onClick={() => handleDownloadInvoicePdf(invoice.id, invoice.invoiceNumber)}
                                >
                                  <Download className="w-3 h-3 mr-1" />
                                  PDF
                                </Button>

                                {/* Send Email */}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 text-xs"
                                  onClick={() => {
                                    setSendEmailInvoiceId(invoice.id)
                                    setSendEmailTo(customer?.email || '')
                                    setSendEmailOpen(true)
                                  }}
                                >
                                  <Send className="w-3 h-3 mr-1" />
                                  Email
                                </Button>

                                {/* Payment Link */}
                                {invoice.balanceDue > 0 && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 text-xs"
                                    onClick={() => handleCreatePaymentLink(invoice.id, invoice.invoiceNumber)}
                                  >
                                    <Copy className="w-3 h-3 mr-1" />
                                    Link
                                  </Button>
                                )}
                              </div>

                              {/* Status Actions */}
                              {invoice.status === 'draft' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full h-7 text-xs"
                                  onClick={() => handleMarkInvoiceAsSent(invoice.id)}
                                  disabled={markingAsSent === invoice.id}
                                >
                                  {markingAsSent === invoice.id ? (
                                    <>
                                      <div className="w-3 h-3 mr-1 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
                                      Sending...
                                    </>
                                  ) : (
                                    <>
                                      <Send className="w-3 h-3 mr-1" />
                                      Mark as Sent
                                    </>
                                  )}
                                </Button>
                              )}

                              {(invoice.status === 'sent' || invoice.status === 'pending') && (
                                <div className="space-y-1">
                                  <Button
                                    variant="default"
                                    size="sm"
                                    className="w-full h-7 text-xs bg-green-600 hover:bg-green-700"
                                    onClick={() => handleMarkInvoiceAsPaid(invoice.id)}
                                    disabled={markingAsPaid === invoice.id}
                                  >
                                    {markingAsPaid === invoice.id ? (
                                      <>
                                        <div className="w-3 h-3 mr-1 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                        Processing...
                                      </>
                                    ) : (
                                      <>
                                        <CheckCircle className="w-3 h-3 mr-1" />
                                        Mark as Paid
                                      </>
                                    )}
                                  </Button>
                                  
                                  {/* Payment Button for Online Payment */}
                                  {invoice.balanceDue > 0 && (
                                    <PaymentButtonCompact
                                      invoiceId={invoice.id}
                                      amount={invoice.balanceDue}
                                      currency={customer?.currency || 'USD'}
                                      customerEmail={customer?.email}
                                      customerName={customer?.name}
                                      description={`Payment for Invoice ${invoice.invoiceNumber}`}
                                      onPaymentSuccess={async () => {
                                        try {
                                          const accountingResult = await apiService.processInvoicePayment(invoice.id)
                                          queryClient.invalidateQueries({ queryKey: ['pos-recent-invoices'] })
                                          toast({
                                            title: "Payment Successful",
                                            description: `Payment processed. Journal Entry: ${accountingResult.journalEntryId}`,
                                          })
                                        } catch (error) {
                                          console.error('Accounting integration error:', error)
                                          toast({
                                            title: "Payment Successful",
                                            description: "Payment processed but accounting integration failed",
                                            variant: "destructive"
                                          })
                                        }
                                      }}
                                      onPaymentError={(error) => {
                                        console.error('Payment error:', error)
                                        toast({
                                          title: "Payment Failed",
                                          description: "Payment processing failed",
                                          variant: "destructive"
                                        })
                                      }}
                                    />
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Cart Header - Fixed */}
          <div className="px-2 py-1 border-b border-slate-200 flex-shrink-0">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-sm text-slate-900">Cart</h3>
              <Badge variant="secondary" className="text-xs h-4">{cart.length}</Badge>
            </div>
          </div>

          {/* Cart Items - Scrollable */}
          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="p-2 pb-0">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-900">Cart Items</h3>
                <Badge variant="secondary">{cart.length} items</Badge>
              </div>
            </div>

            <div className="px-2 pb-2">
              {cart.length === 0 ? (
                <div className="text-center py-6 text-slate-500">
                  <ShoppingCart className="w-6 h-6 mx-auto mb-2 text-slate-300" />
                  <p className="text-xs font-medium">Cart is empty</p>
                  <p className="text-xs">Add items to start</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="bg-slate-50 rounded-md p-1.5 border border-slate-200"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-xs text-slate-900 truncate">
                          {item.product.name}
                        </h4>
                        <p className="text-xs text-slate-500">
                          {formatCurrency(item.unitPrice)} each
                          {item.product.taxInclusive && item.product.taxRate && item.product.taxRate > 0 && (
                            <span className="ml-1 text-xs text-green-600 font-medium">
                              (tax incl.)
                            </span>
                          )}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromCart(item.product.id)}
                        className="h-5 w-5 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 ml-1"
                      >
                        <X className="w-2 h-2" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="h-5 w-5 p-0"
                        >
                          <Minus className="w-2 h-2" />
                        </Button>
                        <span className="w-5 text-center text-xs font-medium">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="h-5 w-5 p-0"
                        >
                          <Plus className="w-2 h-2" />
                        </Button>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-slate-900 text-xs">
                          {formatCurrency(item.lineTotal)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                </div>
              )}
            </div>
          </div>

          {/* Cart Summary - Always Fixed at Bottom */}
          <div className="border-t border-slate-200 p-2 space-y-2 flex-shrink-0 bg-white">
            {cart.length > 0 ? (
              <>
                {/* Quick Actions */}
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDiscountDialog(true)}
                    className="flex-1 h-6 text-xs"
                  >
                    <Percent className="w-3 h-3 mr-1" />
                    Discount
                  </Button>
                </div>

                {/* Totals */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600">Subtotal</span>
                    <span className="font-medium">{formatCurrency(subtotal)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-600">Discount</span>
                      <span className="font-medium text-red-600">-{formatCurrency(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600">Tax</span>
                    <span className="font-medium">{formatCurrency(taxAmount)}</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold border-t border-slate-200 pt-1">
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>

                {/* Checkout Button */}
                <Button
                  onClick={() => setShowPaymentDialog(true)}
                  disabled={!selectedCustomer || cart.length === 0}
                  className="w-full h-8 text-xs font-medium bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                >
                  <CreditCard className="w-3 h-3 mr-1" />
                  Checkout {formatCurrency(total)}
                </Button>
              </>
            ) : (
              /* Empty Cart State in Summary */
              <div className="text-center py-2 text-slate-400">
                <div className="text-xs">Cart Summary</div>
                <div className="text-xs mt-1">Add items to see totals</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Customer Selection Dialog */}
      <Dialog open={showCustomerDialog} onOpenChange={setShowCustomerDialog}>
        <DialogContent className="max-w-lg max-h-[85vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center justify-between">
              <span>Select Customer</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditingCustomer(null)
                  setCustomerForm({ name: "", email: "", currency: 'USD' })
                  setCustomerDialogOpen(true)
                }}
                className="h-7 text-xs"
              >
                <Plus className="w-3 h-3 mr-1" />
                New Customer
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-col space-y-3 flex-1 overflow-hidden">
            {/* Enhanced Search */}
            <div className="relative flex-shrink-0">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search by name, email, or phone..."
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                className="pl-9 h-10"
                autoFocus
              />
              {customerSearch && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCustomerSearch("")}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2 flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCustomerSearch("")}
                className="h-7 text-xs"
              >
                <Users className="w-3 h-3 mr-1" />
                All Customers
              </Button>
              {recentCustomers.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Show only recent customers
                    const recentNames = recentCustomers.map(c => c.name).join(' ')
                    setCustomerSearch(recentNames)
                  }}
                  className="h-7 text-xs"
                >
                  <Clock className="w-3 h-3 mr-1" />
                  Recent ({recentCustomers.length})
                </Button>
              )}
            </div>
            
            {/* Customer List */}
            <div className="flex-1 overflow-y-auto space-y-1">
              {customersLoading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-12 bg-slate-100 rounded-md animate-pulse" />
                  ))}
                </div>
              ) : filteredCustomers.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p className="text-sm font-medium">No customers found</p>
                  <p className="text-xs">Try a different search term</p>
                </div>
              ) : (
                filteredCustomers.map((customer: POSCustomer) => (
                  <Button
                    key={customer.id}
                    variant="ghost"
                    onClick={() => handleCustomerSelection(customer)}
                    className="w-full justify-start h-auto p-3 hover:bg-slate-50"
                  >
                    <div className="flex items-center gap-3 w-full">
                      {/* Customer Avatar */}
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                        {customer.name.charAt(0).toUpperCase()}
                      </div>
                      
                      {/* Customer Info */}
                      <div className="flex-1 text-left min-w-0">
                        <div className="font-medium text-sm text-slate-900 truncate">
                          {customer.name}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          {customer.email && (
                            <span className="truncate">{customer.email}</span>
                          )}
                          {customer.phone && (
                            <span className="truncate">{customer.phone}</span>
                          )}
                        </div>
                      </div>
                      
                      {/* Selection Indicator */}
                      {selectedCustomer?.id === customer.id && (
                        <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                      )}
                    </div>
                  </Button>
                ))
              )}
            </div>

            {/* Footer Actions */}
            <div className="flex gap-2 pt-2 border-t border-slate-200 flex-shrink-0">
              <Button
                variant="outline"
                onClick={() => setShowCustomerDialog(false)}
                className="flex-1 h-8 text-xs"
              >
                Cancel
              </Button>
              {selectedCustomer && (
                <Button
                  onClick={() => {
                    setSelectedCustomer(null)
                    setShowCustomerDialog(false)
                  }}
                  className="flex-1 h-8 text-xs"
                >
                  Clear Selection
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Customer Creation Dialog */}
      <Dialog open={customerDialogOpen} onOpenChange={setCustomerDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCustomer ? 'Edit Customer' : 'Add Customer'}</DialogTitle>
            <DialogDescription>Enter customer details below.</DialogDescription>
          </DialogHeader>
          {customerError && (
            <div className="text-red-600 text-sm">{customerError}</div>
          )}
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="cust-name">Name</Label>
              <Input 
                id="cust-name" 
                value={customerForm.name} 
                onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })} 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cust-email">Email</Label>
              <Input 
                id="cust-email" 
                type="email" 
                value={customerForm.email || ''} 
                onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cust-currency">Currency</Label>
              <select 
                id="cust-currency" 
                className="w-full border rounded px-2 py-2" 
                value={customerForm.currency || 'USD'} 
                onChange={(e) => setCustomerForm({ ...customerForm, currency: e.target.value })}
              >
                {['USD','EUR','GBP','KES','NGN'].map(c => (<option key={c} value={c}>{c}</option>))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCustomerDialogOpen(false)} disabled={customerSaving}>
              Cancel
            </Button>
            <Button onClick={async () => {
              try {
                setCustomerSaving(true)
                setCustomerError(null)
                if (!customerForm.name || customerForm.name.trim() === '') {
                  throw new Error('Name is required')
                }
                if (!selectedCompany) throw new Error('No company selected')
                if (editingCustomer) {
                  await apiService.updateCustomer(editingCustomer.id, { 
                    companyId: selectedCompany, 
                    name: customerForm.name, 
                    email: customerForm.email, 
                    currency: customerForm.currency 
                  })
                  toast({ title: 'Customer updated', description: `${customerForm.name}` })
                } else {
                  const newCustomer = await apiService.createCustomer({ 
                    companyId: selectedCompany, 
                    name: customerForm.name, 
                    email: customerForm.email, 
                    currency: customerForm.currency 
                  })
                  toast({ title: 'Customer created', description: `${customerForm.name}` })
                  
                  // Optimistically update the customer list
                  queryClient.setQueryData(['pos-customers', selectedCompany], (oldData: any) => {
                    if (!oldData) return oldData
                    return {
                      ...oldData,
                      items: [...(oldData.items || []), newCustomer]
                    }
                  })
                }
                await queryClient.invalidateQueries({ queryKey: ["pos-customers", selectedCompany] })
                // Also invalidate any other customer queries that might exist
                await queryClient.invalidateQueries({ queryKey: ["customers"] })
                setCustomerDialogOpen(false)
                // Close the customer selection dialog and refresh the list
                setShowCustomerDialog(false)
              } catch (e: any) {
                setCustomerError((e as any)?.message || 'Failed to save customer')
                toast({ 
                  title: 'Customer save failed', 
                  description: (e as any)?.message || 'Failed to save customer', 
                  variant: 'destructive' 
                })
              } finally {
                setCustomerSaving(false)
              }
            }} disabled={customerSaving}>
              {customerSaving ? 'Saving…' : (editingCustomer ? 'Save Changes' : 'Create Customer')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg">Process Payment</DialogTitle>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(total)}</p>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Payment Methods */}
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={paymentMethod === 'card' ? 'default' : 'outline'}
                onClick={() => setPaymentMethod('card')}
                className="h-12 flex-col"
              >
                <CreditCard className="w-5 h-5 mb-1" />
                <span className="text-xs">Card</span>
              </Button>
              <Button
                variant={paymentMethod === 'cash' ? 'default' : 'outline'}
                onClick={() => setPaymentMethod('cash')}
                className="h-12 flex-col"
              >
                <Banknote className="w-5 h-5 mb-1" />
                <span className="text-xs">Cash</span>
              </Button>
              <Button
                variant={paymentMethod === 'mobile' ? 'default' : 'outline'}
                onClick={() => setPaymentMethod('mobile')}
                className="h-12 flex-col"
              >
                <Smartphone className="w-5 h-5 mb-1" />
                <span className="text-xs">Mobile</span>
              </Button>
            </div>

            {/* Cash Payment Input */}
            {paymentMethod === 'cash' && (
              <div className="space-y-2">
                <Input
                  type="number"
                  placeholder="Cash received"
                  value={cashReceived || ''}
                  onChange={(e) => setCashReceived(parseFloat(e.target.value) || 0)}
                  className="h-10 text-center"
                />
                {cashReceived > total && (
                  <div className="text-center p-2 bg-green-50 rounded-lg">
                    <div className="text-green-700 font-medium text-sm">
                      Change: {formatCurrency(cashReceived - total)}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Process Button */}
            <Button
              onClick={processPayment}
              disabled={processing || createInvoiceMutation.isPending}
              className="w-full h-10 font-medium"
            >
              {processing || createInvoiceMutation.isPending ? (
                <>Processing...</>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Complete Sale
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Discount Dialog */}
      <Dialog open={showDiscountDialog} onOpenChange={setShowDiscountDialog}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle className="text-base">Apply Discount</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={discountType === 'percent' ? 'default' : 'outline'}
                onClick={() => setDiscountType('percent')}
                size="sm"
              >
                Percentage
              </Button>
              <Button
                variant={discountType === 'amount' ? 'default' : 'outline'}
                onClick={() => setDiscountType('amount')}
                size="sm"
              >
                Amount
              </Button>
            </div>
            
            <Input
              type="number"
              placeholder={discountType === 'percent' ? 'Discount %' : 'Discount amount'}
              value={globalDiscount || ''}
              onChange={(e) => setGlobalDiscount(parseFloat(e.target.value) || 0)}
              className="h-10 text-center"
            />
            
            <Button
              onClick={() => setShowDiscountDialog(false)}
              className="w-full h-9"
              size="sm"
            >
              Apply Discount
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Receipt Dialog */}
      <Dialog open={showReceiptDialog} onOpenChange={setShowReceiptDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg flex items-center">
              <Receipt className="w-5 h-5 mr-2" />
              Transaction Complete
            </DialogTitle>
          </DialogHeader>
          
          {receiptData && (
            <div className="space-y-4">
              {/* Receipt Preview */}
              <div className="max-h-96 overflow-y-auto border rounded-lg">
                <ReceiptComponent data={receiptData} className="receipt-component" />
              </div>
              
              {/* Receipt Actions */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={async () => {
                    try {
                      const receiptElement = document.querySelector('.receipt-component') as HTMLElement
                      if (receiptElement) {
                        const success = await ReceiptManager.printReceipt(receiptElement, {
                          paperSize: 'thermal_80mm'
                        })
                        if (success) {
                          toast({
                            title: "Receipt Printed",
                            description: "Receipt has been sent to printer",
                          })
                        } else {
                          toast({
                            title: "Print Failed",
                            description: "Unable to print receipt",
                            variant: "destructive"
                          })
                        }
                      }
                    } catch (error) {
                      console.error('Print error:', error)
                      toast({
                        title: "Print Error",
                        description: "Failed to print receipt",
                        variant: "destructive"
                      })
                    }
                  }}
                  className="flex items-center justify-center"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Print
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => {
                    setReceiptEmailTo(receiptData.customer?.email || '')
                    setShowReceiptEmailDialog(true)
                  }}
                  className="flex items-center justify-center"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </Button>
              </div>
              
              {/* Close Button */}
              <Button
                onClick={() => setShowReceiptDialog(false)}
                className="w-full"
                variant="outline"
              >
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Product Information Modal */}
      <Dialog open={!!showProductInfo} onOpenChange={() => setShowProductInfo(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg flex items-center">
              <Info className="w-5 h-5 mr-2" />
              Product Details
            </DialogTitle>
          </DialogHeader>
          
          {showProductInfo && (
            <div className="space-y-4">
              {/* Product Header */}
              <div className="flex items-start gap-3">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  isService(showProductInfo) 
                    ? 'bg-gradient-to-br from-purple-100 to-purple-200' 
                    : 'bg-gradient-to-br from-blue-100 to-blue-200'
                }`}>
                  {typeof getProductIcon(showProductInfo) === 'string' ? (
                    <span className="text-xl">{getProductIcon(showProductInfo)}</span>
                  ) : (
                    <Package className="w-6 h-6 text-blue-600" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900">{showProductInfo.name}</h3>
                  <p className="text-sm text-slate-600">{showProductInfo.categoryObject?.name || 'Uncategorized'}</p>
                  <div className={`text-lg font-bold ${isService(showProductInfo) ? 'text-purple-600' : 'text-green-600'}`}>
                    {formatCurrency(showProductInfo.unitPrice)}
                  </div>
                </div>
              </div>

              {/* Product Details */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-600">SKU:</span>
                  <div className="font-medium">{showProductInfo.sku || 'N/A'}</div>
                </div>
                <div>
                  <span className="text-slate-600">Barcode:</span>
                  <div className="font-medium">{showProductInfo.barcode || 'N/A'}</div>
                </div>
                <div>
                  <span className="text-slate-600">Type:</span>
                  <div className="font-medium">{isService(showProductInfo) ? 'Service' : 'Product'}</div>
                </div>
                <div>
                  <span className="text-slate-600">Status:</span>
                  <div className="font-medium">{showProductInfo.status}</div>
                </div>
              </div>

              {/* Stock Information */}
              <div className="bg-slate-50 rounded-lg p-3">
                <h4 className="font-medium text-slate-900 mb-2">
                  {isService(showProductInfo) ? 'Availability' : 'Stock Information'}
                </h4>
                <div className="text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">
                      {isService(showProductInfo) ? 'Available Slots:' : 'Current Stock:'}
                    </span>
                    <span className="font-medium">{showProductInfo.availableQuantity || showProductInfo.stockQuantity || 0}</span>
                  </div>
                  {!isService(showProductInfo) && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Minimum Stock:</span>
                        <span className="font-medium">{showProductInfo.minStockLevel || 'Not set'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Unit of Measure:</span>
                        <span className="font-medium">Each</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Description */}
              {showProductInfo.description && (
                <div>
                  <h4 className="font-medium text-slate-900 mb-2">Description</h4>
                  <p className="text-sm text-slate-600">{showProductInfo.description}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  onClick={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                    addToCart(showProductInfo)
                    setShowProductInfo(null)
                  }}
                  disabled={showProductInfo.status !== 'ACTIVE' || (showProductInfo.availableQuantity || showProductInfo.stockQuantity || 0) <= 0}
                  className="flex-1"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add to Cart
                </Button>
                <Button
                  variant="outline"
                  onClick={() => toggleFavorite(showProductInfo.id)}
                  className={favoriteProducts.includes(showProductInfo.id) ? 'bg-amber-50 text-amber-600' : ''}
                >
                  <Star className="w-4 h-4" fill={favoriteProducts.includes(showProductInfo.id) ? "currentColor" : "none"} />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Barcode Scanner Dialog */}
      <Dialog open={showBarcodeDialog} onOpenChange={closeBarcodeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scan className="w-5 h-5" />
                Barcode Scanner
              </div>
              <div className="text-xs text-slate-500 font-normal">
                Press Ctrl+B to open • ESC to close
              </div>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Camera Preview Section */}
            <div className="space-y-3">
              <div className="bg-slate-100 rounded-lg aspect-video flex items-center justify-center relative overflow-hidden">
                {cameraStream ? (
                  <video
                    ref={(video) => {
                      if (video && cameraStream) {
                        video.srcObject = cameraStream
                        video.play()
                      }
                    }}
                    className="w-full h-full object-cover"
                    autoPlay
                    playsInline
                    muted
                  />
                ) : (
                  <div className="text-center p-4">
                    {scannerError ? (
                      <div className="text-red-600 space-y-2">
                        <AlertCircle className="w-12 h-12 mx-auto" />
                        <p className="text-sm">{scannerError}</p>
                      </div>
                    ) : (
                      <div className="text-slate-500 space-y-2">
                        <Camera className="w-12 h-12 mx-auto" />
                        <p className="text-sm">Camera not active</p>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Camera Controls Overlay */}
                <div className="absolute bottom-2 left-2 right-2 flex gap-2">
                  {!cameraStream ? (
                    <Button
                      onClick={startCamera}
                      disabled={isScanning}
                      className="flex-1"
                      size="sm"
                    >
                      <Video className="w-4 h-4 mr-2" />
                      Start Camera
                    </Button>
                  ) : (
                    <Button
                      onClick={stopCamera}
                      variant="destructive"
                      className="flex-1"
                      size="sm"
                    >
                      <VideoOff className="w-4 h-4 mr-2" />
                      Stop Camera
                    </Button>
                  )}
                </div>
              </div>
              
              {cameraStream && (
                <div className="text-center p-2 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-center gap-2 text-blue-700 text-sm">
                    <Info className="w-4 h-4" />
                    Point camera at barcode to scan automatically
                  </div>
                </div>
              )}
            </div>

            {/* Manual Input Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <Keyboard className="w-4 h-4" />
                Manual Entry
              </div>
              
              <div className="flex gap-2">
                <Input
                  placeholder="Enter barcode or SKU..."
                  value={manualBarcode}
                  onChange={(e) => setManualBarcode(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      processBarcode(manualBarcode)
                    }
                  }}
                  className="flex-1"
                  autoFocus={!cameraStream}
                />
                <Button
                  onClick={() => processBarcode(manualBarcode)}
                  disabled={!manualBarcode.trim()}
                >
                  <Check className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Test Barcodes */}
            <div className="space-y-2">
              <div className="text-sm font-medium text-slate-700">Test Barcodes</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { code: "1234567890123", name: "Headphones" },
                  { code: "1234567890124", name: "Office Chair" },
                  { code: "1234567890125", name: "USB-C Hub" },
                  { code: "1234567890126", name: "Standing Desk" }
                ].map((item) => (
                  <Button
                    key={item.code}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setManualBarcode(item.code)
                      processBarcode(item.code)
                    }}
                    className="h-8 text-xs justify-start"
                  >
                    <div className="truncate">
                      <div className="font-mono">{item.code}</div>
                      <div className="text-slate-500">{item.name}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={closeBarcodeDialog}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  // Clear and focus manual input
                  setManualBarcode('')
                  const input = document.querySelector('input[placeholder*="barcode"]') as HTMLInputElement
                  if (input) input.focus()
                }}
                variant="outline"
                className="flex-1"
              >
                Clear
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Send Invoice Email Dialog */}
      <Dialog open={sendEmailOpen} onOpenChange={(open) => {
        setSendEmailOpen(open)
        if (!open) {
          setSendEmailInvoiceId(null)
          setSendEmailTo('')
          setSendEmailLoading(false)
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Send Invoice Email
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="customer@example.com"
                value={sendEmailTo}
                onChange={(e) => setSendEmailTo(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div className="text-xs text-slate-600 bg-slate-50 p-2 rounded">
              Invoice PDF will be attached to the email automatically.
            </div>
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setSendEmailOpen(false)}
              disabled={sendEmailLoading}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleSendInvoiceEmail}
              disabled={sendEmailLoading || !sendEmailTo.trim()}
            >
              {sendEmailLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Email
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Invoice View Modal */}
      <Dialog open={showInvoiceViewDialog} onOpenChange={(open) => {
        setShowInvoiceViewDialog(open)
        if (!open) {
          setSelectedInvoiceForView(null)
        }
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" style={{ maxWidth: 'calc(100vw - 300px)' }}>
          <DialogHeader className="pb-6 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                <Eye className="w-5 h-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-slate-900">Invoice Details</DialogTitle>
                <DialogDescription className="text-slate-600 mt-1">
                  {selectedInvoiceForView ? `Invoice ${selectedInvoiceForView.invoiceNumber}` : 'Loading invoice details...'}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          {detailedInvoice && (
            <div className="space-y-6">
              {/* Invoice Header */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">Invoice Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Invoice Number:</span>
                      <span className="font-medium">{detailedInvoice.invoiceNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Issue Date:</span>
                      <span className="font-medium">{new Date(detailedInvoice.issueDate).toLocaleDateString()}</span>
                    </div>
                    {detailedInvoice.dueDate && (
                      <div className="flex justify-between">
                        <span className="text-slate-600">Due Date:</span>
                        <span className="font-medium">{new Date(detailedInvoice.dueDate).toLocaleDateString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-slate-600">Status:</span>
                      <Badge 
                        variant={
                          detailedInvoice.status === "paid" ? "default" :
                          detailedInvoice.dueDate && new Date(detailedInvoice.dueDate) < new Date() && detailedInvoice.balanceDue > 0 ? "destructive" : 
                          "secondary"
                        }
                      >
                        {detailedInvoice.status.charAt(0).toUpperCase() + detailedInvoice.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Currency:</span>
                      <span className="font-medium">{detailedInvoice.currency || 'USD'}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">Customer Information</h3>
                  {(() => {
                    const customer = customers.find(c => c.id === detailedInvoice.customerId)
                    return customer ? (
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Name:</span>
                          <span className="font-medium">{customer.name}</span>
                        </div>
                        {customer.email && (
                          <div className="flex justify-between">
                            <span className="text-slate-600">Email:</span>
                            <span className="font-medium">{customer.email}</span>
                          </div>
                        )}
                        {customer.phone && (
                          <div className="flex justify-between">
                            <span className="text-slate-600">Phone:</span>
                            <span className="font-medium">{customer.phone}</span>
                          </div>
                        )}
                        {customer.address && (
                          <div className="flex justify-between">
                            <span className="text-slate-600">Address:</span>
                            <span className="font-medium">{customer.address}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-slate-500">Customer information not available</p>
                    )
                  })()}
                </div>
              </div>

              {/* Financial Summary */}
              <div className="bg-slate-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Financial Summary</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Total Amount:</span>
                      <span className="font-semibold text-lg">{formatCurrency(detailedInvoice.totalAmount)}</span>
                    </div>
                    {detailedInvoice.balanceDue > 0 && (
                      <div className="flex justify-between">
                        <span className="text-slate-600">Balance Due:</span>
                        <span className="font-semibold text-amber-600">{formatCurrency(detailedInvoice.balanceDue)}</span>
                      </div>
                    )}
                    {detailedInvoice.balanceDue === 0 && (
                      <div className="flex justify-between">
                        <span className="text-slate-600">Payment Status:</span>
                        <span className="font-semibold text-green-600">Fully Paid</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    {detailedInvoice.dueDate && (
                      <div className="flex justify-between">
                        <span className="text-slate-600">Days Until Due:</span>
                        <span className={`font-medium ${
                          new Date(detailedInvoice.dueDate) < new Date() ? 'text-red-600' : 'text-slate-900'
                        }`}>
                          {Math.ceil((new Date(detailedInvoice.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Product Line Items */}
              {detailedInvoice.lines && detailedInvoice.lines.length > 0 ? (
                <div className="bg-white border border-slate-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Products & Services</h3>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Unit Price</TableHead>
                          <TableHead>Discount</TableHead>
                          <TableHead>Tax Rate</TableHead>
                          <TableHead className="text-right">Line Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {detailedInvoice.lines.map((line, index) => (
                          <TableRow key={line.id || index}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                                  <Package className="w-4 h-4 text-blue-600" />
                                </div>
                                <div>
                                  <div className="font-medium text-slate-900">{line.description}</div>
                                  {line.product && (
                                    <div className="text-sm text-slate-500">
                                      SKU: {line.product.sku || 'N/A'} | 
                                      Category: {line.product.categoryObject?.name || 'Uncategorized'}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{Number(line.quantity) || 0}</div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{formatCurrency(Number(line.unitPrice) || 0)}</div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {Number(line.discountRate) > 0 ? (
                                  <span className="text-green-600 font-medium">
                                    {Number(line.discountRate)}%
                                  </span>
                                ) : (
                                  <span className="text-slate-400">No discount</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {Number(line.taxRate) > 0 ? (
                                  <span className="text-blue-600 font-medium">
                                    {Number(line.taxRate)}%
                                  </span>
                                ) : (
                                  <span className="text-slate-400">No tax</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="font-semibold text-slate-900">
                                {formatCurrency(line.lineTotal || (Number(line.quantity) * Number(line.unitPrice)))}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  
                  {/* Line Items Summary */}
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Subtotal:</span>
                          <span className="font-medium">
                            {formatCurrency(detailedInvoice.lines.reduce((sum, line) => 
                              sum + (Number(line.quantity) * Number(line.unitPrice)), 0
                            ))}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Total Discount:</span>
                          <span className="font-medium text-green-600">
                            -{formatCurrency(detailedInvoice.lines.reduce((sum, line) => {
                              const discountRate = Number(line.discountRate) || 0;
                              const lineTotal = Number(line.quantity) * Number(line.unitPrice);
                              return sum + (lineTotal * (discountRate / 100));
                            }, 0))}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Total Tax:</span>
                          <span className="font-medium text-blue-600">
                            {formatCurrency(detailedInvoice.lines.reduce((sum, line) => {
                              const taxRate = Number(line.taxRate) || 0;
                              const lineTotal = Number(line.quantity) * Number(line.unitPrice);
                              return sum + (lineTotal * (taxRate / 100));
                            }, 0))}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Items Count:</span>
                          <span className="font-medium">
                            {detailedInvoice.lines.length} items
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Total Quantity:</span>
                          <span className="font-medium">
                            {detailedInvoice.lines.reduce((sum, line) => sum + Number(line.quantity), 0)} units
                          </span>
                        </div>
                        <div className="flex justify-between font-semibold text-lg pt-2 border-t border-slate-200">
                          <span className="text-slate-900">Grand Total:</span>
                          <span className="text-slate-900">{formatCurrency(detailedInvoice.totalAmount)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Package className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-blue-900">Product Details</h3>
                      <p className="text-blue-700 text-sm">
                        This invoice was created via POS system. Product line items are stored in the invoice but may not be fully loaded in this view. 
                        For complete product details, please use the "Open in Sales" button below.
                      </p>
                      <div className="mt-2 text-xs text-blue-600">
                        Debug: Invoice has {detailedInvoice.lines?.length || 0} line items
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <Button
                  variant="outline"
                  onClick={() => handleDownloadInvoicePdf(detailedInvoice.id, detailedInvoice.invoiceNumber)}
                  className="flex-1"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => {
                    const customer = customers.find(c => c.id === detailedInvoice.customerId)
                    setSendEmailInvoiceId(detailedInvoice.id)
                    setSendEmailTo(customer?.email || '')
                    setSendEmailOpen(true)
                    setShowInvoiceViewDialog(false)
                  }}
                  className="flex-1"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send Email
                </Button>

                <Button
                  variant="outline"
                  onClick={() => {
                    window.open(`/sales?invoice=${detailedInvoice.id}`, '_blank')
                  }}
                  className="flex-1"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open in Sales
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Receipt Email Dialog */}
    <Dialog open={showReceiptEmailDialog} onOpenChange={(open) => {
      setShowReceiptEmailDialog(open)
      if (!open) {
        setReceiptEmailTo('')
        setIsSendingReceiptEmail(false)
      }
    }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Email Receipt</DialogTitle>
            <DialogDescription>Enter the recipient email address to send the receipt.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Label htmlFor="receipt-email-to">Email Address</Label>
            <Input 
              id="receipt-email-to" 
              type="email" 
              placeholder="customer@example.com" 
              value={receiptEmailTo} 
              onChange={(e) => setReceiptEmailTo(e.target.value)} 
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowReceiptEmailDialog(false)
              setReceiptEmailTo('')
              setIsSendingReceiptEmail(false)
            }}>
              Cancel
            </Button>
            <Button 
              disabled={!receiptEmailTo || !receiptData || isSendingReceiptEmail}
              onClick={async () => {
                if (!receiptEmailTo || !receiptData || isSendingReceiptEmail) return
                
                setIsSendingReceiptEmail(true)
                
                try {
                  const success = await ReceiptManager.emailReceipt(receiptData, {
                    to: receiptEmailTo,
                    subject: `Receipt ${receiptData.invoiceNumber}`,
                    message: 'Thank you for your purchase! Your receipt is attached.'
                  })
                  
                  if (success) {
                    toast({
                      title: "Receipt Emailed",
                      description: `Receipt sent to ${receiptEmailTo}`,
                    })
                    setShowReceiptEmailDialog(false)
                    setReceiptEmailTo('')
                  } else {
                    toast({
                      title: "Email Failed",
                      description: "Unable to send receipt via email",
                      variant: "destructive"
                    })
                  }
                } catch (error) {
                  console.error('Email error:', error)
                  toast({
                    title: "Email Error",
                    description: "Failed to send receipt",
                    variant: "destructive"
                  })
                } finally {
                  setIsSendingReceiptEmail(false)
                }
              }}
            >
              {isSendingReceiptEmail ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Receipt
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
