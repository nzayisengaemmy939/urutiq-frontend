import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { ShoppingCart, Search, User, CreditCard, Plus, Minus, X, Check, Receipt, Users, Package, Percent, Clock, Trash2, Banknote, Smartphone, Printer, Mail, Scan, Info, Star, Filter, Camera, Video, VideoOff, Keyboard, AlertCircle, History, ChevronDown, ChevronUp, Eye, Send, Download, CheckCircle, ExternalLink, Copy } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import apiService from "../lib/api";
import { inventoryApi } from "../lib/api/inventory";
import { useAuth } from "../contexts/auth-context";
import { useDemoAuth } from "../hooks/useDemoAuth";
import { getCompanyId } from "../lib/config";
import { Receipt as ReceiptComponent } from "../components/Receipt";
import { ReceiptManager } from "../lib/receipt-manager";
import { PaymentButtonCompact } from "../components/payment-button";
import { InvoicePDFGenerator } from "../lib/invoice-pdf-generator";
export default function POSPage() {
    const { toast } = useToast();
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const { ready: demoAuthReady } = useDemoAuth('pos-page');
    const queryClient = useQueryClient();
    // POS State
    const [selectedCompany, setSelectedCompany] = useState(getCompanyId());
    const [cart, setCart] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [productSearch, setProductSearch] = useState("");
    const [customerSearch, setCustomerSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [showProductInfo, setShowProductInfo] = useState(null);
    const [favoriteProducts, setFavoriteProducts] = useState([]);
    const [isScanning, setIsScanning] = useState(false);
    const [cameraStream, setCameraStream] = useState(null);
    const [manualBarcode, setManualBarcode] = useState('');
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
        const handleCompanyChange = (e) => {
            const newCompanyId = e.detail.companyId;
            if (newCompanyId && newCompanyId !== selectedCompany) {
                console.log('🔄 POS page - Company changed via custom event from', selectedCompany, 'to', newCompanyId);
                setSelectedCompany(newCompanyId);
                // Clear cart when switching companies
                setCart([]);
                setSelectedCustomer(null);
            }
        };
        window.addEventListener('companyChanged', handleCompanyChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('companyChanged', handleCompanyChange);
        };
    }, [selectedCompany]);
    const [scannerError, setScannerError] = useState(null);
    // UI State
    const [showCustomerDialog, setShowCustomerDialog] = useState(false);
    const [showPaymentDialog, setShowPaymentDialog] = useState(false);
    const [showDiscountDialog, setShowDiscountDialog] = useState(false);
    const [showReceiptDialog, setShowReceiptDialog] = useState(false);
    const [showBarcodeDialog, setShowBarcodeDialog] = useState(false);
    const [showInvoiceViewDialog, setShowInvoiceViewDialog] = useState(false);
    const [selectedInvoiceForView, setSelectedInvoiceForView] = useState(null);
    const [showReceiptEmailDialog, setShowReceiptEmailDialog] = useState(false);
    const [receiptEmailTo, setReceiptEmailTo] = useState('');
    const [isSendingReceiptEmail, setIsSendingReceiptEmail] = useState(false);
    const [lastTransaction, setLastTransaction] = useState(null);
    const [receiptData, setReceiptData] = useState(null);
    // Customer selection state
    const [recentCustomerIds, setRecentCustomerIds] = useState([]);
    const [customerSearchFocused, setCustomerSearchFocused] = useState(false);
    // Payment State
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [cashReceived, setCashReceived] = useState(0);
    const [processing, setProcessing] = useState(false);
    // Discount State
    const [globalDiscount, setGlobalDiscount] = useState(0);
    const [discountType, setDiscountType] = useState('percent');
    // Recent Invoices State
    const [showRecentInvoices, setShowRecentInvoices] = useState(false);
    const [selectedInvoiceActions, setSelectedInvoiceActions] = useState(null);
    const [sendEmailOpen, setSendEmailOpen] = useState(false);
    const [sendEmailTo, setSendEmailTo] = useState('');
    const [sendEmailInvoiceId, setSendEmailInvoiceId] = useState(null);
    const [sendEmailLoading, setSendEmailLoading] = useState(false);
    // Cleanup camera stream when component unmounts
    useEffect(() => {
        return () => {
            if (cameraStream) {
                cameraStream.getTracks().forEach(track => track.stop());
            }
        };
    }, [cameraStream]);
    // Keyboard shortcuts for barcode scanner
    useEffect(() => {
        const handleKeydown = (e) => {
            // Ctrl+B to open barcode scanner
            if (e.ctrlKey && e.key === 'b' && !showBarcodeDialog) {
                e.preventDefault();
                startBarcodeScanning();
            }
            // Escape to close scanner
            if (e.key === 'Escape' && showBarcodeDialog) {
                closeBarcodeDialog();
            }
        };
        window.addEventListener('keydown', handleKeydown);
        return () => window.removeEventListener('keydown', handleKeydown);
    }, [showBarcodeDialog]);
    // Fetch products from inventory (same as inventory page)
    const { data: productsResponse, isLoading: productsLoading } = useQuery({
        queryKey: ['pos-products', selectedCompany],
        queryFn: () => inventoryApi.getProducts({
            companyId: selectedCompany,
            page: 1,
            pageSize: 1000
        }),
        enabled: !!selectedCompany && isAuthenticated && !authLoading && demoAuthReady
    });
    // Debug: Log API response and company info
    useEffect(() => {
        // Debug logging removed
        if (productsResponse) {
            // Debug logging removed
        }
    }, [productsResponse, selectedCompany, isAuthenticated, authLoading, demoAuthReady]);
    const products = productsResponse?.items || [];
    // Debug: Log product stock quantities and statuses
    useEffect(() => {
        if (products.length > 0) {
            const statusCounts = products.reduce((acc, p) => {
                acc[p.status] = (acc[p.status] || 0) + 1;
                return acc;
            }, {});
            // Debug logging removed
        }
        else {
            // Debug logging removed
        }
    }, [products]);
    // Fetch customers
    const { data: customersResponse, isLoading: customersLoading } = useQuery({
        queryKey: ['pos-customers', selectedCompany],
        queryFn: () => apiService.getCustomers({ companyId: selectedCompany, pageSize: 1000 }),
        enabled: !!selectedCompany && isAuthenticated && !authLoading && demoAuthReady
    });
    const customers = customersResponse?.items || [];
    // Fetch recent invoices for quick access
    const { data: recentInvoicesResponse, isLoading: invoicesLoading } = useQuery({
        queryKey: ['pos-recent-invoices', selectedCompany],
        queryFn: async () => {
            const response = await apiService.getInvoices({
                page: 1,
                pageSize: 5,
                companyId: selectedCompany
            });
            const raw = response;
            const invoiceData = raw?.items ?? raw?.invoices ?? raw?.data ?? raw;
            return Array.isArray(invoiceData) ? invoiceData : [];
        },
        enabled: !!selectedCompany && isAuthenticated && !authLoading && demoAuthReady
    });
    const recentInvoices = recentInvoicesResponse || [];
    // Filter products for POS - show active and inactive products (exclude discontinued)
    const safeProducts = Array.isArray(products) ? products : [];
    const filteredProducts = safeProducts.filter((product) => {
        const matchesSearch = product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
            (product.sku && product.sku.toLowerCase().includes(productSearch.toLowerCase())) ||
            (product.barcode && product.barcode.toLowerCase().includes(productSearch.toLowerCase())) ||
            (product.categoryObject?.name && product.categoryObject.name.toLowerCase().includes(productSearch.toLowerCase()));
        // Show active and inactive products, exclude discontinued (handle both cases)
        const normalizedStatus = product.status?.toUpperCase();
        const isAvailableProduct = normalizedStatus === 'ACTIVE' || normalizedStatus === 'INACTIVE';
        // Filter by category
        const matchesCategory = !selectedCategory || product.categoryId === selectedCategory;
        // Filter by stock availability - only show products with stock
        const availableQty = Number(product.availableQuantity) || 0;
        const stockQty = Number(product.stockQuantity) || 0;
        const hasStock = availableQty > 0 || stockQty > 0;
        // Show available products with stock - inactive products can be reactivated in POS
        return matchesSearch && isAvailableProduct && matchesCategory && hasStock;
    });
    // Debug: Log filtering results
    useEffect(() => {
        // Debug logging removed
    }, [safeProducts, filteredProducts, productSearch, selectedCategory]);
    // Extract unique categories from all available products (active and inactive)
    const categories = Array.from(new Set(safeProducts
        .filter(p => {
        const normalizedStatus = p.status?.toUpperCase();
        const isAvailableProduct = normalizedStatus === 'ACTIVE' || normalizedStatus === 'INACTIVE';
        return p.categoryObject?.name && p.categoryId && isAvailableProduct;
    })
        .map(p => ({ id: p.categoryId, name: p.categoryObject.name })))).sort((a, b) => a.name.localeCompare(b.name));
    // Get favorite products (most frequently added to cart) - available ones
    const favoriteProductsList = safeProducts
        .filter(p => {
        const normalizedStatus = p.status?.toUpperCase();
        const isAvailableProduct = normalizedStatus === 'ACTIVE' || normalizedStatus === 'INACTIVE';
        return favoriteProducts.includes(p.id) && isAvailableProduct;
    })
        .slice(0, 6);
    // Filter customers based on search (enhanced with phone number and better matching)
    const filteredCustomers = customers.filter((customer) => {
        const searchTerm = customerSearch.toLowerCase();
        return (customer.name.toLowerCase().includes(searchTerm) ||
            (customer.email && customer.email.toLowerCase().includes(searchTerm)) ||
            (customer.phone && customer.phone.toLowerCase().includes(searchTerm)));
    });
    // Get recent customers (last 5 selected customers)
    const recentCustomers = customers.filter((customer) => recentCustomerIds.includes(customer.id)).slice(0, 5);
    // Calculate totals
    const subtotal = cart.reduce((sum, item) => {
        const lineSubtotal = (item.quantity * item.unitPrice) - item.discount;
        // If product is tax inclusive, we need to extract the tax from the price
        if (item.product.taxInclusive && item.product.taxRate && item.product.taxRate > 0) {
            // For tax inclusive: net price = gross price / (1 + tax rate/100)
            const netPrice = lineSubtotal / (1 + ((item.product.taxRate || 0) / 100));
            return sum + netPrice;
        }
        else {
            // For tax exclusive: use the line subtotal as is
            return sum + lineSubtotal;
        }
    }, 0);
    const discountAmount = discountType === 'percent' ? (subtotal * globalDiscount / 100) : globalDiscount;
    const taxAmount = cart.reduce((sum, item) => {
        const lineSubtotal = (item.quantity * item.unitPrice) - item.discount;
        if (item.product.taxInclusive && item.product.taxRate && item.product.taxRate > 0) {
            // For tax inclusive: tax amount = gross price - net price
            const netPrice = lineSubtotal / (1 + ((item.product.taxRate || 0) / 100));
            return sum + (lineSubtotal - netPrice);
        }
        else {
            // For tax exclusive: add tax on top
            return sum + (lineSubtotal * ((item.product.taxRate || 0) / 100));
        }
    }, 0);
    const total = subtotal - discountAmount + taxAmount;
    // Add product to cart
    const addToCart = (product) => {
        // Use the same stock calculation logic as getStockDisplay
        const availableQty = Number(product.availableQuantity) || 0;
        const stockQty = Number(product.stockQuantity) || 0;
        const availableStock = availableQty > 0 ? availableQty : stockQty;
        const existingItemIndex = cart.findIndex(item => item.product.id === product.id);
        // Check stock availability (different logic for services vs products)
        const currentQuantityInCart = existingItemIndex >= 0 ? cart[existingItemIndex].quantity : 0;
        if (currentQuantityInCart >= availableStock) {
            const isServiceProduct = isService(product);
            toast({
                title: isServiceProduct ? "Service Unavailable" : "Insufficient Stock",
                description: isServiceProduct
                    ? `No more slots available for ${product.name}${availableStock === 0 ? ' (Fully Booked)' : ''}`
                    : `Only ${availableStock} units available for ${product.name}`,
                variant: "destructive"
            });
            return;
        }
        if (existingItemIndex >= 0) {
            const newCart = [...cart];
            newCart[existingItemIndex].quantity += 1;
            newCart[existingItemIndex].lineTotal =
                (newCart[existingItemIndex].quantity * newCart[existingItemIndex].unitPrice) - newCart[existingItemIndex].discount;
            setCart(newCart);
        }
        else {
            const newItem = {
                product,
                quantity: 1,
                unitPrice: product.unitPrice,
                discount: 0,
                taxRate: product.taxRate || 0, // Use product's actual tax rate
                lineTotal: product.unitPrice
            };
            setCart([...cart, newItem]);
        }
    };
    // Update cart item quantity
    const updateQuantity = (productId, newQuantity) => {
        if (newQuantity <= 0) {
            removeFromCart(productId);
            return;
        }
        // Find the cart item and check stock
        const cartItem = cart.find(item => item.product.id === productId);
        if (cartItem) {
            const availableStock = cartItem.product.availableQuantity || cartItem.product.stockQuantity || 0;
            if (newQuantity > availableStock) {
                toast({
                    title: "Insufficient Stock",
                    description: `Only ${availableStock} units available for ${cartItem.product.name}`,
                    variant: "destructive"
                });
                return;
            }
        }
        const newCart = cart.map(item => {
            if (item.product.id === productId) {
                return {
                    ...item,
                    quantity: newQuantity,
                    lineTotal: (newQuantity * item.unitPrice) - item.discount
                };
            }
            return item;
        });
        setCart(newCart);
    };
    // Remove from cart
    const removeFromCart = (productId) => {
        setCart(cart.filter(item => item.product.id !== productId));
    };
    // Clear cart
    const clearCart = () => {
        setCart([]);
        setSelectedCustomer(null);
        setGlobalDiscount(0);
    };
    // Create invoice mutation
    const createInvoiceMutation = useMutation({
        mutationFn: async () => {
            if (!selectedCustomer) {
                throw new Error('Please select a customer');
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
            };
            return apiService.createInvoice(invoiceData);
        },
        onSuccess: async (invoice) => {
            try {
                // Invoice is already created as 'paid', so inventory should be updated automatically
                // Generate receipt data
                const receipt = {
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
                };
                setReceiptData(receipt);
                setLastTransaction(invoice);
                setShowReceiptDialog(true);
                toast({
                    title: "Sale Completed",
                    description: `Invoice ${invoice.invoiceNumber} processed successfully. Stock updated.`,
                });
                // Invalidate queries to refresh data
                await Promise.all([
                    queryClient.invalidateQueries({ queryKey: ['invoices'] }),
                    queryClient.invalidateQueries({ queryKey: ['pos-recent-invoices'] }),
                    queryClient.invalidateQueries({ queryKey: ['pos-products', selectedCompany] }),
                    queryClient.invalidateQueries({ queryKey: ['products'] }),
                    queryClient.invalidateQueries({ queryKey: ['inventory-movements'] }),
                    queryClient.invalidateQueries({ queryKey: ['journal-entries'] })
                ]);
                // Force refetch of POS products to ensure fresh data
                await queryClient.refetchQueries({ queryKey: ['pos-products', selectedCompany] });
                clearCart();
                setShowPaymentDialog(false);
            }
            catch (error) {
                console.error('Error in POS success handler:', error);
                // Still show receipt even if there's an error
                const receipt = {
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
                };
                setReceiptData(receipt);
                setLastTransaction(invoice);
                setShowReceiptDialog(true);
                toast({
                    title: "Sale Completed",
                    description: `Invoice ${invoice.invoiceNumber} created successfully.`,
                });
                // Invalidate queries to refresh data even on error
                await Promise.all([
                    queryClient.invalidateQueries({ queryKey: ['invoices'] }),
                    queryClient.invalidateQueries({ queryKey: ['pos-products', selectedCompany] }),
                    queryClient.invalidateQueries({ queryKey: ['products'] })
                ]);
                // Force refetch of POS products to ensure fresh data
                await queryClient.refetchQueries({ queryKey: ['pos-products', selectedCompany] });
                clearCart();
                setShowPaymentDialog(false);
            }
        },
        onError: (error) => {
            toast({
                title: "Sale Failed",
                description: error.message || "Failed to create invoice",
                variant: "destructive"
            });
        }
    });
    // Process payment
    const processPayment = () => {
        if (paymentMethod === 'cash' && cashReceived < total) {
            toast({
                title: "Insufficient Cash",
                description: `Need ${formatCurrency(total - cashReceived)} more`,
                variant: "destructive"
            });
            return;
        }
        createInvoiceMutation.mutate();
    };
    // Barcode scanning functionality
    const startBarcodeScanning = () => {
        setShowBarcodeDialog(true);
        setScannerError(null);
        setManualBarcode('');
    };
    const startCamera = async () => {
        setIsScanning(true);
        setScannerError(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment',
                    width: { ideal: 640 },
                    height: { ideal: 480 }
                }
            });
            setCameraStream(stream);
            // In a real implementation, you would integrate with a barcode scanning library
            // like QuaggaJS or ZXing to scan from the video stream
            toast({
                title: "Camera Ready",
                description: "Point camera at barcode or enter manually below",
            });
        }
        catch (error) {
            setScannerError("Unable to access camera. Please use manual input.");
            setIsScanning(false);
        }
    };
    const stopCamera = () => {
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
            setCameraStream(null);
        }
        setIsScanning(false);
    };
    const processBarcode = (barcode) => {
        if (!barcode.trim())
            return;
        const product = safeProducts.find(p => p.barcode === barcode.trim() ||
            p.sku === barcode.trim());
        if (product) {
            addToCart(product);
            toast({
                title: "Product Added",
                description: `${product.name} added to cart`,
            });
            closeBarcodeDialog();
        }
        else {
            toast({
                title: "Product Not Found",
                description: "No product found with this barcode",
                variant: "destructive"
            });
        }
    };
    const closeBarcodeDialog = () => {
        stopCamera();
        setShowBarcodeDialog(false);
        setManualBarcode('');
        setScannerError(null);
    };
    // Handle invoice view
    const handleViewInvoice = (invoice) => {
        setSelectedInvoiceForView(invoice);
        setShowInvoiceViewDialog(true);
    };
    // Toggle favorite product
    const toggleFavorite = (productId) => {
        setFavoriteProducts(prev => prev.includes(productId)
            ? prev.filter(id => id !== productId)
            : [...prev, productId]);
    };
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };
    // Helper function to determine if a product is a service
    const isService = (product) => {
        return product.type === 'SERVICE';
    };
    // Helper function to select customer from invoice for quick checkout
    const selectCustomerFromInvoice = (invoice) => {
        const customer = customers.find(c => c.id === invoice.customerId);
        if (customer) {
            setSelectedCustomer(customer);
            toast({
                title: "Customer Selected",
                description: `${customer.name} selected for checkout. Add items to continue transaction.`,
            });
        }
    };
    // Invoice action handlers
    const handleMarkInvoiceAsSent = async (invoiceId) => {
        try {
            await apiService.updateInvoice(invoiceId, { status: 'sent' });
            queryClient.invalidateQueries({ queryKey: ['pos-recent-invoices'] });
            toast({
                title: "Invoice Updated",
                description: "Invoice marked as sent successfully",
            });
        }
        catch (error) {
            toast({
                title: "Error",
                description: "Failed to update invoice status",
                variant: "destructive"
            });
        }
    };
    const handleMarkInvoiceAsPaid = async (invoiceId) => {
        try {
            // First, try to process accounting entries and inventory updates
            const accountingResult = await apiService.processInvoicePayment(invoiceId);
            // Update invoice status after successful accounting processing
            await apiService.updateInvoice(invoiceId, { status: 'paid', balanceDue: 0 });
            queryClient.invalidateQueries({ queryKey: ['pos-recent-invoices'] });
            queryClient.invalidateQueries({ queryKey: ["journal-entries"] });
            queryClient.invalidateQueries({ queryKey: ["inventory-movements"] });
            toast({
                title: "Invoice Paid",
                description: `Payment processed successfully. Journal Entry: ${accountingResult.journalEntryId}`,
            });
        }
        catch (error) {
            console.error('Error marking invoice as paid:', error);
            if (error.message && error.message.includes('Insufficient inventory')) {
                toast({
                    title: "Insufficient Inventory",
                    description: error.message,
                    variant: "destructive"
                });
            }
            else {
                toast({
                    title: "Error",
                    description: "Failed to mark invoice as paid. Please check inventory and try again.",
                    variant: "destructive"
                });
            }
        }
    };
    const handleDownloadInvoicePdf = async (invoiceId, invoiceNumber) => {
        try {
            // Find the invoice data
            const invoice = recentInvoices.find(inv => inv.id === invoiceId);
            if (!invoice) {
                toast({
                    title: "Invoice Not Found",
                    description: "Could not find invoice data for PDF generation.",
                    variant: "destructive"
                });
                return;
            }
            // Find customer data
            const customer = customers.find(c => c.id === invoice.customerId);
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
                    subtotal: invoice.subtotal || invoice.totalAmount,
                    taxAmount: invoice.taxAmount || 0,
                    discountAmount: invoice.discountAmount || 0,
                    customer: customer ? {
                        name: customer.name,
                        email: customer.email,
                        address: customer.address,
                        phone: customer.phone,
                        taxId: customer.taxId
                    } : undefined,
                    lines: invoice.lines || [],
                    notes: invoice.notes,
                    paymentUrl: invoice.paymentUrl
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
                }
            });
            await generator.download();
            toast({
                title: "PDF Downloaded",
                description: `Invoice ${invoiceNumber} has been downloaded successfully.`,
            });
        }
        catch (error) {
            console.error('Error downloading invoice PDF:', error);
            // Fallback to backend API if frontend generator fails
            try {
                const blob = await apiService.getInvoicePdf(invoiceId);
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `invoice-${invoiceNumber}.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
                toast({
                    title: "PDF Downloaded",
                    description: `Invoice ${invoiceNumber} has been downloaded successfully.`,
                });
            }
            catch (backendError) {
                console.error('Backend PDF generation also failed:', backendError);
                toast({
                    title: "Download Failed",
                    description: "There was an error downloading the PDF. Please try again.",
                    variant: "destructive"
                });
            }
        }
    };
    const handleSendInvoiceEmail = async () => {
        if (!sendEmailInvoiceId || !sendEmailTo)
            return;
        setSendEmailLoading(true);
        try {
            // Find the invoice data
            const invoice = recentInvoices.find(inv => inv.id === sendEmailInvoiceId);
            if (!invoice) {
                toast({
                    title: "Invoice Not Found",
                    description: "Could not find invoice data for email generation.",
                    variant: "destructive"
                });
                return;
            }
            // Find customer data
            const customer = customers.find(c => c.id === invoice.customerId);
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
                    subtotal: invoice.subtotal || invoice.totalAmount,
                    taxAmount: invoice.taxAmount || 0,
                    discountAmount: invoice.discountAmount || 0,
                    customer: customer ? {
                        name: customer.name,
                        email: customer.email,
                        address: customer.address,
                        phone: customer.phone,
                        taxId: customer.taxId
                    } : undefined,
                    lines: invoice.lines || [],
                    notes: invoice.notes,
                    paymentUrl: invoice.paymentUrl
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
                }
            });
            // Generate PDF blob
            const pdfBlob = await generator.generate();
            // Debug logging removed
            // Debug logging removed;
            // Send email with frontend-generated PDF
            await apiService.sendInvoiceEmail(invoice.id, {
                to: sendEmailTo,
                subject: `Invoice ${invoice.invoiceNumber}`,
                message: `Please find your invoice ${invoice.invoiceNumber} attached. Thank you for your business!`,
                attachPdf: true,
                pdfBlob: pdfBlob
            });
            toast({
                title: "Email Sent",
                description: `Invoice ${invoice.invoiceNumber} has been sent to ${sendEmailTo}`,
            });
            setSendEmailOpen(false);
            setSendEmailTo('');
            setSendEmailInvoiceId(null);
        }
        catch (error) {
            console.error('Error sending invoice email:', error);
            // Fallback to backend API if frontend generation fails
            try {
                await apiService.sendInvoiceEmail(sendEmailInvoiceId, {
                    to: sendEmailTo,
                    attachPdf: true
                });
                toast({
                    title: "Email Sent",
                    description: `Invoice sent to ${sendEmailTo}`,
                });
                setSendEmailOpen(false);
                setSendEmailTo('');
                setSendEmailInvoiceId(null);
            }
            catch (backendError) {
                console.error('Backend email sending also failed:', backendError);
                toast({
                    title: "Email Failed",
                    description: "Unable to send invoice email",
                    variant: "destructive"
                });
            }
        }
        finally {
            setSendEmailLoading(false);
        }
    };
    const handleCreatePaymentLink = async (invoiceId, invoiceNumber) => {
        try {
            const response = await apiService.createPaymentLink(invoiceId);
            // Copy link to clipboard
            await navigator.clipboard.writeText(response.url);
            toast({
                title: "Payment Link Created",
                description: `Link for ${invoiceNumber} copied to clipboard`,
            });
        }
        catch (error) {
            toast({
                title: "Link Creation Failed",
                description: "Unable to create payment link",
                variant: "destructive"
            });
        }
    };
    // Helper function to get stock display for services vs products
    const getStockDisplay = (product) => {
        // Convert string values to numbers and handle the case where availableQuantity is 0 but stockQuantity has value
        const availableQty = Number(product.availableQuantity) || 0;
        const stockQty = Number(product.stockQuantity) || 0;
        // Use availableQuantity if it's > 0, otherwise fall back to stockQuantity
        const availableStock = availableQty > 0 ? availableQty : stockQty;
        if (isService(product)) {
            // Services handle "stock" differently
            if (availableStock >= 999999) {
                const result = { text: "Available", status: "available" };
                return result;
            }
            else if (availableStock > 50) {
                const result = { text: `${availableStock} slots available`, status: "available" };
                return result;
            }
            else if (availableStock > 10) {
                const result = { text: `${availableStock} slots available`, status: "limited" };
                return result;
            }
            else if (availableStock > 0) {
                const result = { text: `Only ${availableStock} slots left`, status: "low" };
                return result;
            }
            else {
                const result = { text: "Fully Booked", status: "unavailable" };
                return result;
            }
        }
        else {
            // Physical products
            if (availableStock <= 0) {
                const result = { text: "Out of Stock", status: "unavailable" };
                return result;
            }
            else if (availableStock <= 10) {
                const result = { text: `Stock: ${availableStock}`, status: "low" };
                return result;
            }
            else {
                const result = { text: `Stock: ${availableStock}`, status: "available" };
                return result;
            }
        }
    };
    // Helper function to get appropriate icon for product type
    const getProductIcon = (product) => {
        if (isService(product)) {
            // Return service-specific icons based on category or service type
            const categoryName = product.categoryObject?.name?.toLowerCase() || '';
            if (categoryName.includes('consulting'))
                return '💼';
            if (categoryName.includes('technical'))
                return '💻';
            if (categoryName.includes('creative'))
                return '🎨';
            if (categoryName.includes('maintenance'))
                return '🔧';
            if (categoryName.includes('training'))
                return '🎓';
            return '⚡'; // Default service icon
        }
        return _jsx(Package, { className: "w-8 h-8 text-blue-600" });
    };
    // Handle customer selection with recent customers tracking
    const handleCustomerSelection = (customer) => {
        setSelectedCustomer(customer);
        setShowCustomerDialog(false);
        setCustomerSearch("");
        // Add to recent customers
        setRecentCustomerIds(prev => {
            const filtered = prev.filter(id => id !== customer.id);
            return [customer.id, ...filtered].slice(0, 5);
        });
    };
    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Only handle shortcuts when not in input fields
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }
            // Customer selection shortcut (Ctrl/Cmd + C)
            if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
                e.preventDefault();
                setShowCustomerDialog(true);
            }
            // Clear cart shortcut (Ctrl/Cmd + Delete)
            if ((e.ctrlKey || e.metaKey) && e.key === 'Delete') {
                e.preventDefault();
                clearCart();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);
    // Show loading state while authentication is being initialized
    if (authLoading || !demoAuthReady) {
        return (_jsx("div", { className: "bg-slate-50 flex items-center justify-center h-screen", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-4", children: _jsx(ShoppingCart, { className: "w-8 h-8 text-white" }) }), _jsx("h2", { className: "text-xl font-semibold text-slate-900 mb-2", children: "Loading POS System" }), _jsx("p", { className: "text-slate-600", children: "Initializing point of sale..." })] }) }));
    }
    return (_jsxs("div", { className: "bg-slate-50 flex flex-col overflow-hidden h-screen min-h-screen max-h-screen -mt-20 pt-20", style: {
            height: '100vh',
            maxHeight: '100vh',
            minHeight: '100vh',
        }, children: [_jsxs("div", { className: "bg-white border-b border-slate-200 p-2 flex items-center justify-between flex-shrink-0 h-16", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-7 h-7 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center", children: _jsx(ShoppingCart, { className: "w-3 h-3 text-white" }) }), _jsxs("div", { children: [_jsx("h1", { className: "text-lg font-bold text-slate-900", children: "Point of Sale" }), _jsx("p", { className: "text-xs text-slate-600", children: "Quick checkout system" })] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs(Badge, { variant: "secondary", className: "h-6 text-xs", children: [_jsx(Clock, { className: "w-3 h-3 mr-1" }), new Date().toLocaleTimeString()] }), _jsxs(Button, { variant: "outline", size: "sm", onClick: () => setShowCustomerDialog(true), className: "h-6 text-xs", title: "Select Customer (Ctrl+C)", children: [_jsx(User, { className: "w-3 h-3 mr-1" }), "Customer"] }), _jsxs(Button, { variant: "outline", size: "sm", onClick: clearCart, disabled: cart.length === 0, className: "h-6 text-xs", title: "Clear Cart (Ctrl+Delete)", children: [_jsx(Trash2, { className: "w-3 h-3 mr-1" }), "Clear"] })] })] }), _jsxs("div", { className: "flex-1 flex min-h-0 max-h-full", children: [_jsxs("div", { className: "flex-1 flex flex-col min-h-0 max-h-full", children: [_jsxs("div", { className: "bg-white p-3 border-b border-slate-200 flex-shrink-0", children: [_jsx("div", { className: "mb-3", children: _jsxs("div", { className: "flex gap-2", children: [_jsxs("div", { className: "relative flex-1", children: [_jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" }), _jsx(Input, { placeholder: "Search products, SKU, barcode...", value: productSearch, onChange: (e) => setProductSearch(e.target.value), className: "pl-9 h-8 text-sm" })] }), _jsx(Button, { variant: "outline", size: "sm", onClick: startBarcodeScanning, disabled: isScanning, className: "h-8 px-3", title: "Barcode Scanner (Ctrl+B)", children: _jsx(Scan, { className: "w-4 h-4" }) })] }) }), favoriteProductsList.length > 0 && (_jsxs("div", { className: "mb-3", children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx(Star, { className: "w-4 h-4 text-amber-500" }), _jsx("span", { className: "text-xs font-medium text-slate-700", children: "Quick Add" })] }), _jsx("div", { className: "flex gap-1 overflow-x-auto pb-1", children: favoriteProductsList.map(product => (_jsx(Button, { size: "sm", variant: "outline", onClick: () => addToCart(product), className: "h-6 text-xs whitespace-nowrap flex-shrink-0", children: product.name }, product.id))) })] })), categories.length > 0 && (_jsxs("div", { className: "mb-3", children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx(Filter, { className: "w-4 h-4 text-blue-500" }), _jsx("span", { className: "text-xs font-medium text-slate-700", children: "Categories" })] }), _jsxs("div", { className: "flex gap-1 overflow-x-auto pb-1", children: [_jsx(Button, { size: "sm", variant: !selectedCategory ? "default" : "outline", onClick: () => setSelectedCategory(""), className: "h-6 text-xs whitespace-nowrap flex-shrink-0", children: "All" }), categories.map(category => (_jsx(Button, { size: "sm", variant: selectedCategory === category.id ? "default" : "outline", onClick: () => setSelectedCategory(category.id), className: "h-6 text-xs whitespace-nowrap flex-shrink-0", children: category.name }, category.id)))] })] })), _jsx("div", { className: "flex items-center justify-between", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsxs(Badge, { variant: "secondary", className: "text-xs h-5", children: [filteredProducts.length, " available for sale"] }), _jsx("div", { className: "text-xs text-slate-500", children: "Only showing active products with stock" })] }) })] }), _jsxs("div", { className: "flex-1 p-3 overflow-y-auto bg-slate-50 min-h-0", children: [productsLoading ? (_jsx("div", { className: "grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-2", children: [...Array(14)].map((_, i) => (_jsx("div", { className: "aspect-square bg-slate-200 rounded-md animate-pulse" }, i))) })) : (_jsx("div", { className: "grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-2 pb-2", children: filteredProducts.map((product) => {
                                            const stockDisplay = getStockDisplay(product);
                                            const isLowOrLimited = stockDisplay.status === 'low' || stockDisplay.status === 'limited';
                                            const isOutOfStock = stockDisplay.status === 'unavailable';
                                            const productIcon = getProductIcon(product);
                                            return (_jsx(Card, { className: `cursor-pointer hover:shadow-md transition-all duration-150 hover:scale-[1.02] group relative ${isOutOfStock ? 'opacity-60 border-red-200 cursor-not-allowed' : ''}`, onClick: () => !isOutOfStock && addToCart(product), children: _jsxs(CardContent, { className: "p-2 aspect-square flex flex-col", children: [_jsx("div", { className: "flex-1 flex items-center justify-center mb-1", children: _jsx("div", { className: `w-8 h-8 rounded-md flex items-center justify-center group-hover:scale-105 transition-all duration-150 ${isService(product)
                                                                    ? 'bg-gradient-to-br from-purple-100 to-purple-200'
                                                                    : 'bg-gradient-to-br from-blue-100 to-blue-200'}`, children: typeof productIcon === 'string' ? (_jsx("span", { className: "text-sm", children: productIcon })) : (_jsx("div", { className: "w-4 h-4 text-blue-600", children: _jsx(Package, { className: "w-full h-full" }) })) }) }), _jsxs("div", { className: "text-center", children: [_jsx("h3", { className: "font-medium text-slate-900 text-xs leading-tight mb-1 line-clamp-1", children: product.name }), isService(product) && (_jsx("div", { className: "text-xs bg-purple-50 text-purple-700 rounded px-1 mb-1", children: "Service" })), _jsx("div", { className: `text-xs font-bold ${isService(product) ? 'text-purple-600' : 'text-green-600'}`, children: formatCurrency(product.unitPrice) }), _jsx("div", { className: `text-xs ${stockDisplay.status === 'unavailable' ? 'text-red-600' :
                                                                        stockDisplay.status === 'low' || stockDisplay.status === 'limited' ? 'text-orange-600' :
                                                                            'text-slate-500'}`, children: stockDisplay.text })] }), _jsxs("div", { className: "absolute top-1 left-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity", children: [_jsx(Button, { size: "sm", variant: "ghost", onClick: (e) => {
                                                                        e.stopPropagation();
                                                                        setShowProductInfo(product);
                                                                    }, className: "h-5 w-5 p-0 bg-white/80 hover:bg-white", children: _jsx(Info, { className: "w-3 h-3" }) }), _jsx(Button, { size: "sm", variant: "ghost", onClick: (e) => {
                                                                        e.stopPropagation();
                                                                        toggleFavorite(product.id);
                                                                    }, className: `h-5 w-5 p-0 ${favoriteProducts.includes(product.id)
                                                                        ? 'bg-amber-100 text-amber-600 hover:bg-amber-200'
                                                                        : 'bg-white/80 hover:bg-white'}`, children: _jsx(Star, { className: "w-3 h-3", fill: favoriteProducts.includes(product.id) ? "currentColor" : "none" }) })] }), stockDisplay.status === 'unavailable' && (_jsx("div", { className: "absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" })), stockDisplay.status === 'low' && (_jsx("div", { className: "absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full" })), stockDisplay.status === 'limited' && isService(product) && (_jsx("div", { className: "absolute top-1 right-1 w-2 h-2 bg-yellow-500 rounded-full" }))] }) }, product.id));
                                        }) })), !productsLoading && filteredProducts.length === 0 && (_jsxs("div", { className: "flex flex-col items-center justify-center py-16 text-slate-500", children: [_jsx(Package, { className: "w-12 h-12 mb-3 text-slate-300" }), _jsx("h3", { className: "font-medium mb-1", children: "No products found" }), _jsx("p", { className: "text-sm", children: "Try adjusting your search" })] }))] }), _jsx("div", { className: "bg-white border-t border-slate-200 p-3 flex-shrink-0", children: _jsxs("div", { className: "grid grid-cols-4 gap-3 text-center", children: [_jsxs("div", { className: "bg-slate-50 rounded-lg p-2", children: [_jsx("div", { className: "text-lg font-bold text-slate-900", children: filteredProducts.length }), _jsx("div", { className: "text-xs text-slate-600", children: "Products" })] }), _jsxs("div", { className: "bg-blue-50 rounded-lg p-2", children: [_jsx("div", { className: "text-lg font-bold text-blue-700", children: cart.length }), _jsx("div", { className: "text-xs text-blue-600", children: "In Cart" })] }), _jsxs("div", { className: "bg-green-50 rounded-lg p-2", children: [_jsx("div", { className: "text-lg font-bold text-green-700", children: formatCurrency(total) }), _jsx("div", { className: "text-xs text-green-600", children: "Total" })] }), _jsxs("div", { className: "flex flex-col gap-1", children: [_jsx(Button, { size: "sm", variant: "outline", onClick: startBarcodeScanning, disabled: isScanning, className: "h-6 text-xs", title: "Barcode Scanner (Ctrl+B)", children: _jsx(Scan, { className: "w-3 h-3" }) }), _jsx(Button, { size: "sm", variant: "outline", onClick: () => setShowCustomerDialog(true), className: "h-6 text-xs", title: "Select Customer", children: _jsx(User, { className: "w-3 h-3" }) })] })] }) })] }), _jsxs("div", { className: "w-72 bg-white border-l border-slate-200 flex flex-col min-h-0 max-h-full", children: [_jsx("div", { className: "p-2 border-b border-slate-200 flex-shrink-0", children: _jsx(Button, { variant: selectedCustomer ? "default" : "outline", onClick: () => setShowCustomerDialog(true), className: "w-full h-auto justify-start text-xs p-2", children: _jsx("div", { className: "flex items-center gap-2 w-full", children: selectedCustomer ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "w-6 h-6 bg-white rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0", children: selectedCustomer.name.charAt(0).toUpperCase() }), _jsxs("div", { className: "flex-1 text-left min-w-0", children: [_jsx("div", { className: "font-medium truncate", children: selectedCustomer.name }), (selectedCustomer.email || selectedCustomer.phone) && (_jsx("div", { className: "text-xs opacity-75 truncate", children: selectedCustomer.email || selectedCustomer.phone }))] }), _jsx(Button, { variant: "ghost", size: "sm", onClick: (e) => {
                                                        e.stopPropagation();
                                                        setSelectedCustomer(null);
                                                    }, className: "h-4 w-4 p-0 hover:bg-white/20", children: _jsx(X, { className: "w-2 h-2" }) })] })) : (_jsxs(_Fragment, { children: [_jsx(User, { className: "w-3 h-3" }), _jsx("span", { className: "truncate", children: "Select Customer" })] })) }) }) }), _jsx("div", { className: "border-b border-slate-200 flex-shrink-0", children: _jsxs("div", { className: "p-2", children: [_jsxs(Button, { variant: "ghost", size: "sm", onClick: () => setShowRecentInvoices(!showRecentInvoices), className: "w-full justify-between h-8 text-xs", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(History, { className: "w-3 h-3" }), _jsx("span", { children: "Recent Invoices" }), !invoicesLoading && recentInvoices.length > 0 && (_jsx(Badge, { variant: "secondary", className: "h-4 text-xs", children: recentInvoices.length }))] }), showRecentInvoices ? (_jsx(ChevronUp, { className: "w-3 h-3" })) : (_jsx(ChevronDown, { className: "w-3 h-3" }))] }), showRecentInvoices && (_jsx("div", { className: "mt-2 space-y-1", children: invoicesLoading ? (_jsx("div", { className: "space-y-1", children: [1, 2, 3].map((i) => (_jsx("div", { className: "h-12 bg-slate-100 rounded animate-pulse" }, i))) })) : recentInvoices.length === 0 ? (_jsxs("div", { className: "text-center py-3 text-slate-500", children: [_jsx(Receipt, { className: "w-4 h-4 mx-auto mb-1 text-slate-300" }), _jsx("p", { className: "text-xs", children: "No recent invoices" })] })) : (recentInvoices.map((invoice) => {
                                                const customer = customers.find(c => c.id === invoice.customerId);
                                                const isOverdue = invoice.dueDate && new Date(invoice.dueDate) < new Date() && invoice.balanceDue > 0;
                                                const showActions = selectedInvoiceActions === invoice.id;
                                                return (_jsxs("div", { className: "bg-slate-50 rounded-lg p-2 border border-slate-200 hover:bg-slate-100 transition-colors", children: [_jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "min-w-0 flex-1", children: [_jsxs("div", { className: "flex items-center gap-1 mb-1", children: [_jsx("span", { className: "text-xs font-medium text-slate-900", children: invoice.invoiceNumber }), _jsx(Badge, { variant: invoice.status === "paid" ? "default" :
                                                                                        isOverdue ? "destructive" :
                                                                                            "secondary", className: "text-xs h-4", children: invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1) }), isOverdue && (_jsx(Badge, { variant: "destructive", className: "text-xs h-4", children: "Overdue" }))] }), _jsx("p", { className: "text-xs text-slate-600 truncate", children: customer ? customer.name : 'Unknown Customer' }), _jsxs("p", { className: "text-xs text-slate-500", children: [new Date(invoice.issueDate).toLocaleDateString(), invoice.dueDate && (_jsxs("span", { className: "ml-2", children: ["Due: ", new Date(invoice.dueDate).toLocaleDateString()] }))] })] }), _jsxs("div", { className: "text-right ml-2", children: [_jsx("p", { className: "text-xs font-semibold text-slate-900", children: formatCurrency(invoice.totalAmount) }), invoice.balanceDue > 0 && (_jsxs("p", { className: "text-xs text-amber-600", children: ["Due: ", formatCurrency(invoice.balanceDue)] }))] })] }), _jsxs("div", { className: "flex gap-1 mt-2", children: [_jsx(Button, { variant: "outline", size: "sm", className: "h-6 text-xs flex-1", onClick: () => {
                                                                        setSelectedInvoiceActions(showActions ? null : invoice.id);
                                                                    }, children: showActions ? (_jsxs(_Fragment, { children: [_jsx(ChevronUp, { className: "w-3 h-3 mr-1" }), "Hide"] })) : (_jsxs(_Fragment, { children: [_jsx(Eye, { className: "w-3 h-3 mr-1" }), "Actions"] })) }), invoice.status !== 'paid' && (_jsxs(Button, { variant: "outline", size: "sm", className: "h-6 text-xs flex-1", onClick: (e) => {
                                                                        e.stopPropagation();
                                                                        selectCustomerFromInvoice(invoice);
                                                                    }, children: [_jsx(ShoppingCart, { className: "w-3 h-3 mr-1" }), "Select"] }))] }), showActions && (_jsxs("div", { className: "mt-2 p-2 bg-white rounded border border-slate-200 space-y-2", children: [_jsxs("div", { className: "grid grid-cols-2 gap-1", children: [_jsxs(Button, { variant: "outline", size: "sm", className: "h-7 text-xs", onClick: () => handleViewInvoice(invoice), children: [_jsx(Eye, { className: "w-3 h-3 mr-1" }), "View"] }), _jsxs(Button, { variant: "outline", size: "sm", className: "h-7 text-xs", onClick: () => handleDownloadInvoicePdf(invoice.id, invoice.invoiceNumber), children: [_jsx(Download, { className: "w-3 h-3 mr-1" }), "PDF"] }), _jsxs(Button, { variant: "outline", size: "sm", className: "h-7 text-xs", onClick: () => {
                                                                                setSendEmailInvoiceId(invoice.id);
                                                                                setSendEmailTo(customer?.email || '');
                                                                                setSendEmailOpen(true);
                                                                            }, children: [_jsx(Send, { className: "w-3 h-3 mr-1" }), "Email"] }), invoice.balanceDue > 0 && (_jsxs(Button, { variant: "outline", size: "sm", className: "h-7 text-xs", onClick: () => handleCreatePaymentLink(invoice.id, invoice.invoiceNumber), children: [_jsx(Copy, { className: "w-3 h-3 mr-1" }), "Link"] }))] }), invoice.status === 'draft' && (_jsxs(Button, { variant: "outline", size: "sm", className: "w-full h-7 text-xs", onClick: () => handleMarkInvoiceAsSent(invoice.id), children: [_jsx(Send, { className: "w-3 h-3 mr-1" }), "Mark as Sent"] })), (invoice.status === 'sent' || invoice.status === 'pending') && (_jsxs("div", { className: "space-y-1", children: [_jsxs(Button, { variant: "default", size: "sm", className: "w-full h-7 text-xs bg-green-600 hover:bg-green-700", onClick: () => handleMarkInvoiceAsPaid(invoice.id), children: [_jsx(CheckCircle, { className: "w-3 h-3 mr-1" }), "Mark as Paid"] }), invoice.balanceDue > 0 && (_jsx(PaymentButtonCompact, { invoiceId: invoice.id, amount: invoice.balanceDue, currency: customer?.currency || 'USD', customerEmail: customer?.email, customerName: customer?.name, description: `Payment for Invoice ${invoice.invoiceNumber}`, onPaymentSuccess: async () => {
                                                                                try {
                                                                                    const accountingResult = await apiService.processInvoicePayment(invoice.id);
                                                                                    queryClient.invalidateQueries({ queryKey: ['pos-recent-invoices'] });
                                                                                    toast({
                                                                                        title: "Payment Successful",
                                                                                        description: `Payment processed. Journal Entry: ${accountingResult.journalEntryId}`,
                                                                                    });
                                                                                }
                                                                                catch (error) {
                                                                                    console.error('Accounting integration error:', error);
                                                                                    toast({
                                                                                        title: "Payment Successful",
                                                                                        description: "Payment processed but accounting integration failed",
                                                                                        variant: "destructive"
                                                                                    });
                                                                                }
                                                                            }, onPaymentError: (error) => {
                                                                                console.error('Payment error:', error);
                                                                                toast({
                                                                                    title: "Payment Failed",
                                                                                    description: "Payment processing failed",
                                                                                    variant: "destructive"
                                                                                });
                                                                            } }))] }))] }))] }, invoice.id));
                                            })) }))] }) }), _jsx("div", { className: "px-2 py-1 border-b border-slate-200 flex-shrink-0", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h3", { className: "font-medium text-sm text-slate-900", children: "Cart" }), _jsx(Badge, { variant: "secondary", className: "text-xs h-4", children: cart.length })] }) }), _jsxs("div", { className: "flex-1 overflow-y-auto min-h-0", children: [_jsx("div", { className: "p-2 pb-0", children: _jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h3", { className: "font-semibold text-slate-900", children: "Cart Items" }), _jsxs(Badge, { variant: "secondary", children: [cart.length, " items"] })] }) }), _jsx("div", { className: "px-2 pb-2", children: cart.length === 0 ? (_jsxs("div", { className: "text-center py-6 text-slate-500", children: [_jsx(ShoppingCart, { className: "w-6 h-6 mx-auto mb-2 text-slate-300" }), _jsx("p", { className: "text-xs font-medium", children: "Cart is empty" }), _jsx("p", { className: "text-xs", children: "Add items to start" })] })) : (_jsx("div", { className: "space-y-1", children: cart.map((item) => (_jsxs("div", { className: "bg-slate-50 rounded-md p-1.5 border border-slate-200", children: [_jsxs("div", { className: "flex items-center justify-between mb-1", children: [_jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("h4", { className: "font-medium text-xs text-slate-900 truncate", children: item.product.name }), _jsxs("p", { className: "text-xs text-slate-500", children: [formatCurrency(item.unitPrice), " each", item.product.taxInclusive && item.product.taxRate && item.product.taxRate > 0 && (_jsx("span", { className: "ml-1 text-xs text-green-600 font-medium", children: "(tax incl.)" }))] })] }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => removeFromCart(item.product.id), className: "h-5 w-5 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 ml-1", children: _jsx(X, { className: "w-2 h-2" }) })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Button, { variant: "outline", size: "sm", onClick: () => updateQuantity(item.product.id, item.quantity - 1), className: "h-5 w-5 p-0", children: _jsx(Minus, { className: "w-2 h-2" }) }), _jsx("span", { className: "w-5 text-center text-xs font-medium", children: item.quantity }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => updateQuantity(item.product.id, item.quantity + 1), className: "h-5 w-5 p-0", children: _jsx(Plus, { className: "w-2 h-2" }) })] }), _jsx("div", { className: "text-right", children: _jsx("div", { className: "font-semibold text-slate-900 text-xs", children: formatCurrency(item.lineTotal) }) })] })] }, item.product.id))) })) })] }), _jsx("div", { className: "border-t border-slate-200 p-2 space-y-2 flex-shrink-0 bg-white", children: cart.length > 0 ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "flex gap-1", children: _jsxs(Button, { variant: "outline", size: "sm", onClick: () => setShowDiscountDialog(true), className: "flex-1 h-6 text-xs", children: [_jsx(Percent, { className: "w-3 h-3 mr-1" }), "Discount"] }) }), _jsxs("div", { className: "space-y-1", children: [_jsxs("div", { className: "flex justify-between text-xs", children: [_jsx("span", { className: "text-slate-600", children: "Subtotal" }), _jsx("span", { className: "font-medium", children: formatCurrency(subtotal) })] }), discountAmount > 0 && (_jsxs("div", { className: "flex justify-between text-xs", children: [_jsx("span", { className: "text-slate-600", children: "Discount" }), _jsxs("span", { className: "font-medium text-red-600", children: ["-", formatCurrency(discountAmount)] })] })), _jsxs("div", { className: "flex justify-between text-xs", children: [_jsx("span", { className: "text-slate-600", children: "Tax" }), _jsx("span", { className: "font-medium", children: formatCurrency(taxAmount) })] }), _jsxs("div", { className: "flex justify-between text-xs font-bold border-t border-slate-200 pt-1", children: [_jsx("span", { children: "Total" }), _jsx("span", { children: formatCurrency(total) })] })] }), _jsxs(Button, { onClick: () => setShowPaymentDialog(true), disabled: !selectedCustomer || cart.length === 0, className: "w-full h-8 text-xs font-medium bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800", children: [_jsx(CreditCard, { className: "w-3 h-3 mr-1" }), "Checkout ", formatCurrency(total)] })] })) : (
                                /* Empty Cart State in Summary */
                                _jsxs("div", { className: "text-center py-2 text-slate-400", children: [_jsx("div", { className: "text-xs", children: "Cart Summary" }), _jsx("div", { className: "text-xs mt-1", children: "Add items to see totals" })] })) })] })] }), _jsx(Dialog, { open: showCustomerDialog, onOpenChange: setShowCustomerDialog, children: _jsxs(DialogContent, { className: "max-w-lg max-h-[85vh] flex flex-col", children: [_jsx(DialogHeader, { className: "flex-shrink-0", children: _jsxs(DialogTitle, { className: "flex items-center justify-between", children: [_jsx("span", { children: "Select Customer" }), _jsxs(Button, { variant: "outline", size: "sm", onClick: () => {
                                            // TODO: Implement customer creation
                                            toast({
                                                title: "Customer Creation",
                                                description: "Customer creation feature coming soon!",
                                            });
                                        }, className: "h-7 text-xs", children: [_jsx(Plus, { className: "w-3 h-3 mr-1" }), "New Customer"] })] }) }), _jsxs("div", { className: "flex flex-col space-y-3 flex-1 overflow-hidden", children: [_jsxs("div", { className: "relative flex-shrink-0", children: [_jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" }), _jsx(Input, { placeholder: "Search by name, email, or phone...", value: customerSearch, onChange: (e) => setCustomerSearch(e.target.value), className: "pl-9 h-10", autoFocus: true }), customerSearch && (_jsx(Button, { variant: "ghost", size: "sm", onClick: () => setCustomerSearch(""), className: "absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0", children: _jsx(X, { className: "w-3 h-3" }) }))] }), _jsxs("div", { className: "flex gap-2 flex-shrink-0", children: [_jsxs(Button, { variant: "outline", size: "sm", onClick: () => setCustomerSearch(""), className: "h-7 text-xs", children: [_jsx(Users, { className: "w-3 h-3 mr-1" }), "All Customers"] }), recentCustomers.length > 0 && (_jsxs(Button, { variant: "outline", size: "sm", onClick: () => {
                                                // Show only recent customers
                                                const recentNames = recentCustomers.map(c => c.name).join(' ');
                                                setCustomerSearch(recentNames);
                                            }, className: "h-7 text-xs", children: [_jsx(Clock, { className: "w-3 h-3 mr-1" }), "Recent (", recentCustomers.length, ")"] }))] }), _jsx("div", { className: "flex-1 overflow-y-auto space-y-1", children: customersLoading ? (_jsx("div", { className: "space-y-2", children: [...Array(3)].map((_, i) => (_jsx("div", { className: "h-12 bg-slate-100 rounded-md animate-pulse" }, i))) })) : filteredCustomers.length === 0 ? (_jsxs("div", { className: "text-center py-8 text-slate-500", children: [_jsx(Users, { className: "w-8 h-8 mx-auto mb-2 text-slate-300" }), _jsx("p", { className: "text-sm font-medium", children: "No customers found" }), _jsx("p", { className: "text-xs", children: "Try a different search term" })] })) : (filteredCustomers.map((customer) => (_jsx(Button, { variant: "ghost", onClick: () => handleCustomerSelection(customer), className: "w-full justify-start h-auto p-3 hover:bg-slate-50", children: _jsxs("div", { className: "flex items-center gap-3 w-full", children: [_jsx("div", { className: "w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0", children: customer.name.charAt(0).toUpperCase() }), _jsxs("div", { className: "flex-1 text-left min-w-0", children: [_jsx("div", { className: "font-medium text-sm text-slate-900 truncate", children: customer.name }), _jsxs("div", { className: "flex items-center gap-2 text-xs text-slate-500", children: [customer.email && (_jsx("span", { className: "truncate", children: customer.email })), customer.phone && (_jsx("span", { className: "truncate", children: customer.phone }))] })] }), selectedCustomer?.id === customer.id && (_jsx(Check, { className: "w-4 h-4 text-green-600 flex-shrink-0" }))] }) }, customer.id)))) }), _jsxs("div", { className: "flex gap-2 pt-2 border-t border-slate-200 flex-shrink-0", children: [_jsx(Button, { variant: "outline", onClick: () => setShowCustomerDialog(false), className: "flex-1 h-8 text-xs", children: "Cancel" }), selectedCustomer && (_jsx(Button, { onClick: () => {
                                                setSelectedCustomer(null);
                                                setShowCustomerDialog(false);
                                            }, className: "flex-1 h-8 text-xs", children: "Clear Selection" }))] })] })] }) }), _jsx(Dialog, { open: showPaymentDialog, onOpenChange: setShowPaymentDialog, children: _jsxs(DialogContent, { className: "max-w-md", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { className: "text-lg", children: "Process Payment" }), _jsx("p", { className: "text-2xl font-bold text-green-600", children: formatCurrency(total) })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-3 gap-2", children: [_jsxs(Button, { variant: paymentMethod === 'card' ? 'default' : 'outline', onClick: () => setPaymentMethod('card'), className: "h-12 flex-col", children: [_jsx(CreditCard, { className: "w-5 h-5 mb-1" }), _jsx("span", { className: "text-xs", children: "Card" })] }), _jsxs(Button, { variant: paymentMethod === 'cash' ? 'default' : 'outline', onClick: () => setPaymentMethod('cash'), className: "h-12 flex-col", children: [_jsx(Banknote, { className: "w-5 h-5 mb-1" }), _jsx("span", { className: "text-xs", children: "Cash" })] }), _jsxs(Button, { variant: paymentMethod === 'mobile' ? 'default' : 'outline', onClick: () => setPaymentMethod('mobile'), className: "h-12 flex-col", children: [_jsx(Smartphone, { className: "w-5 h-5 mb-1" }), _jsx("span", { className: "text-xs", children: "Mobile" })] })] }), paymentMethod === 'cash' && (_jsxs("div", { className: "space-y-2", children: [_jsx(Input, { type: "number", placeholder: "Cash received", value: cashReceived || '', onChange: (e) => setCashReceived(parseFloat(e.target.value) || 0), className: "h-10 text-center" }), cashReceived > total && (_jsx("div", { className: "text-center p-2 bg-green-50 rounded-lg", children: _jsxs("div", { className: "text-green-700 font-medium text-sm", children: ["Change: ", formatCurrency(cashReceived - total)] }) }))] })), _jsx(Button, { onClick: processPayment, disabled: processing || createInvoiceMutation.isPending, className: "w-full h-10 font-medium", children: processing || createInvoiceMutation.isPending ? (_jsx(_Fragment, { children: "Processing..." })) : (_jsxs(_Fragment, { children: [_jsx(Check, { className: "w-4 h-4 mr-2" }), "Complete Sale"] })) })] })] }) }), _jsx(Dialog, { open: showDiscountDialog, onOpenChange: setShowDiscountDialog, children: _jsxs(DialogContent, { className: "max-w-xs", children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { className: "text-base", children: "Apply Discount" }) }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "grid grid-cols-2 gap-2", children: [_jsx(Button, { variant: discountType === 'percent' ? 'default' : 'outline', onClick: () => setDiscountType('percent'), size: "sm", children: "Percentage" }), _jsx(Button, { variant: discountType === 'amount' ? 'default' : 'outline', onClick: () => setDiscountType('amount'), size: "sm", children: "Amount" })] }), _jsx(Input, { type: "number", placeholder: discountType === 'percent' ? 'Discount %' : 'Discount amount', value: globalDiscount || '', onChange: (e) => setGlobalDiscount(parseFloat(e.target.value) || 0), className: "h-10 text-center" }), _jsx(Button, { onClick: () => setShowDiscountDialog(false), className: "w-full h-9", size: "sm", children: "Apply Discount" })] })] }) }), _jsx(Dialog, { open: showReceiptDialog, onOpenChange: setShowReceiptDialog, children: _jsxs(DialogContent, { className: "max-w-md", children: [_jsx(DialogHeader, { children: _jsxs(DialogTitle, { className: "text-lg flex items-center", children: [_jsx(Receipt, { className: "w-5 h-5 mr-2" }), "Transaction Complete"] }) }), receiptData && (_jsxs("div", { className: "space-y-4", children: [_jsx("div", { className: "max-h-96 overflow-y-auto border rounded-lg", children: _jsx(ReceiptComponent, { data: receiptData, className: "receipt-component" }) }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs(Button, { onClick: async () => {
                                                try {
                                                    const receiptElement = document.querySelector('.receipt-component');
                                                    if (receiptElement) {
                                                        const success = await ReceiptManager.printReceipt(receiptElement, {
                                                            paperSize: 'thermal_80mm'
                                                        });
                                                        if (success) {
                                                            toast({
                                                                title: "Receipt Printed",
                                                                description: "Receipt has been sent to printer",
                                                            });
                                                        }
                                                        else {
                                                            toast({
                                                                title: "Print Failed",
                                                                description: "Unable to print receipt",
                                                                variant: "destructive"
                                                            });
                                                        }
                                                    }
                                                }
                                                catch (error) {
                                                    console.error('Print error:', error);
                                                    toast({
                                                        title: "Print Error",
                                                        description: "Failed to print receipt",
                                                        variant: "destructive"
                                                    });
                                                }
                                            }, className: "flex items-center justify-center", children: [_jsx(Printer, { className: "w-4 h-4 mr-2" }), "Print"] }), _jsxs(Button, { variant: "outline", onClick: () => {
                                                setReceiptEmailTo(receiptData.customer?.email || '');
                                                setShowReceiptEmailDialog(true);
                                            }, className: "flex items-center justify-center", children: [_jsx(Mail, { className: "w-4 h-4 mr-2" }), "Email"] })] }), _jsx(Button, { onClick: () => setShowReceiptDialog(false), className: "w-full", variant: "outline", children: "Close" })] }))] }) }), _jsx(Dialog, { open: !!showProductInfo, onOpenChange: () => setShowProductInfo(null), children: _jsxs(DialogContent, { className: "max-w-md", children: [_jsx(DialogHeader, { children: _jsxs(DialogTitle, { className: "text-lg flex items-center", children: [_jsx(Info, { className: "w-5 h-5 mr-2" }), "Product Details"] }) }), showProductInfo && (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-start gap-3", children: [_jsx("div", { className: `w-12 h-12 rounded-lg flex items-center justify-center ${isService(showProductInfo)
                                                ? 'bg-gradient-to-br from-purple-100 to-purple-200'
                                                : 'bg-gradient-to-br from-blue-100 to-blue-200'}`, children: typeof getProductIcon(showProductInfo) === 'string' ? (_jsx("span", { className: "text-xl", children: getProductIcon(showProductInfo) })) : (_jsx(Package, { className: "w-6 h-6 text-blue-600" })) }), _jsxs("div", { className: "flex-1", children: [_jsx("h3", { className: "font-semibold text-slate-900", children: showProductInfo.name }), _jsx("p", { className: "text-sm text-slate-600", children: showProductInfo.categoryObject?.name || 'Uncategorized' }), _jsx("div", { className: `text-lg font-bold ${isService(showProductInfo) ? 'text-purple-600' : 'text-green-600'}`, children: formatCurrency(showProductInfo.unitPrice) })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("span", { className: "text-slate-600", children: "SKU:" }), _jsx("div", { className: "font-medium", children: showProductInfo.sku || 'N/A' })] }), _jsxs("div", { children: [_jsx("span", { className: "text-slate-600", children: "Barcode:" }), _jsx("div", { className: "font-medium", children: showProductInfo.barcode || 'N/A' })] }), _jsxs("div", { children: [_jsx("span", { className: "text-slate-600", children: "Type:" }), _jsx("div", { className: "font-medium", children: isService(showProductInfo) ? 'Service' : 'Product' })] }), _jsxs("div", { children: [_jsx("span", { className: "text-slate-600", children: "Status:" }), _jsx("div", { className: "font-medium", children: showProductInfo.status })] })] }), _jsxs("div", { className: "bg-slate-50 rounded-lg p-3", children: [_jsx("h4", { className: "font-medium text-slate-900 mb-2", children: isService(showProductInfo) ? 'Availability' : 'Stock Information' }), _jsxs("div", { className: "text-sm", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-slate-600", children: isService(showProductInfo) ? 'Available Slots:' : 'Current Stock:' }), _jsx("span", { className: "font-medium", children: showProductInfo.availableQuantity || showProductInfo.stockQuantity || 0 })] }), !isService(showProductInfo) && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-slate-600", children: "Minimum Stock:" }), _jsx("span", { className: "font-medium", children: showProductInfo.minStockLevel || 'Not set' })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-slate-600", children: "Unit of Measure:" }), _jsx("span", { className: "font-medium", children: "Each" })] })] }))] })] }), showProductInfo.description && (_jsxs("div", { children: [_jsx("h4", { className: "font-medium text-slate-900 mb-2", children: "Description" }), _jsx("p", { className: "text-sm text-slate-600", children: showProductInfo.description })] })), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { onClick: () => {
                                                addToCart(showProductInfo);
                                                setShowProductInfo(null);
                                            }, disabled: showProductInfo.status !== 'ACTIVE' || (showProductInfo.availableQuantity || showProductInfo.stockQuantity || 0) <= 0, className: "flex-1", children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), "Add to Cart"] }), _jsx(Button, { variant: "outline", onClick: () => toggleFavorite(showProductInfo.id), className: favoriteProducts.includes(showProductInfo.id) ? 'bg-amber-50 text-amber-600' : '', children: _jsx(Star, { className: "w-4 h-4", fill: favoriteProducts.includes(showProductInfo.id) ? "currentColor" : "none" }) })] })] }))] }) }), _jsx(Dialog, { open: showBarcodeDialog, onOpenChange: closeBarcodeDialog, children: _jsxs(DialogContent, { className: "sm:max-w-md", children: [_jsx(DialogHeader, { children: _jsxs(DialogTitle, { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Scan, { className: "w-5 h-5" }), "Barcode Scanner"] }), _jsx("div", { className: "text-xs text-slate-500 font-normal", children: "Press Ctrl+B to open \u2022 ESC to close" })] }) }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "bg-slate-100 rounded-lg aspect-video flex items-center justify-center relative overflow-hidden", children: [cameraStream ? (_jsx("video", { ref: (video) => {
                                                        if (video && cameraStream) {
                                                            video.srcObject = cameraStream;
                                                            video.play();
                                                        }
                                                    }, className: "w-full h-full object-cover", autoPlay: true, playsInline: true, muted: true })) : (_jsx("div", { className: "text-center p-4", children: scannerError ? (_jsxs("div", { className: "text-red-600 space-y-2", children: [_jsx(AlertCircle, { className: "w-12 h-12 mx-auto" }), _jsx("p", { className: "text-sm", children: scannerError })] })) : (_jsxs("div", { className: "text-slate-500 space-y-2", children: [_jsx(Camera, { className: "w-12 h-12 mx-auto" }), _jsx("p", { className: "text-sm", children: "Camera not active" })] })) })), _jsx("div", { className: "absolute bottom-2 left-2 right-2 flex gap-2", children: !cameraStream ? (_jsxs(Button, { onClick: startCamera, disabled: isScanning, className: "flex-1", size: "sm", children: [_jsx(Video, { className: "w-4 h-4 mr-2" }), "Start Camera"] })) : (_jsxs(Button, { onClick: stopCamera, variant: "destructive", className: "flex-1", size: "sm", children: [_jsx(VideoOff, { className: "w-4 h-4 mr-2" }), "Stop Camera"] })) })] }), cameraStream && (_jsx("div", { className: "text-center p-2 bg-blue-50 rounded-lg", children: _jsxs("div", { className: "flex items-center justify-center gap-2 text-blue-700 text-sm", children: [_jsx(Info, { className: "w-4 h-4" }), "Point camera at barcode to scan automatically"] }) }))] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center gap-2 text-sm font-medium text-slate-700", children: [_jsx(Keyboard, { className: "w-4 h-4" }), "Manual Entry"] }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Input, { placeholder: "Enter barcode or SKU...", value: manualBarcode, onChange: (e) => setManualBarcode(e.target.value), onKeyDown: (e) => {
                                                        if (e.key === 'Enter') {
                                                            processBarcode(manualBarcode);
                                                        }
                                                    }, className: "flex-1", autoFocus: !cameraStream }), _jsx(Button, { onClick: () => processBarcode(manualBarcode), disabled: !manualBarcode.trim(), children: _jsx(Check, { className: "w-4 h-4" }) })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("div", { className: "text-sm font-medium text-slate-700", children: "Test Barcodes" }), _jsx("div", { className: "grid grid-cols-2 gap-2 text-xs", children: [
                                                { code: "1234567890123", name: "Headphones" },
                                                { code: "1234567890124", name: "Office Chair" },
                                                { code: "1234567890125", name: "USB-C Hub" },
                                                { code: "1234567890126", name: "Standing Desk" }
                                            ].map((item) => (_jsx(Button, { variant: "outline", size: "sm", onClick: () => {
                                                    setManualBarcode(item.code);
                                                    processBarcode(item.code);
                                                }, className: "h-8 text-xs justify-start", children: _jsxs("div", { className: "truncate", children: [_jsx("div", { className: "font-mono", children: item.code }), _jsx("div", { className: "text-slate-500", children: item.name })] }) }, item.code))) })] }), _jsxs("div", { className: "flex gap-2 pt-2", children: [_jsx(Button, { variant: "outline", onClick: closeBarcodeDialog, className: "flex-1", children: "Cancel" }), _jsx(Button, { onClick: () => {
                                                // Clear and focus manual input
                                                setManualBarcode('');
                                                const input = document.querySelector('input[placeholder*="barcode"]');
                                                if (input)
                                                    input.focus();
                                            }, variant: "outline", className: "flex-1", children: "Clear" })] })] })] }) }), _jsx(Dialog, { open: sendEmailOpen, onOpenChange: (open) => {
                    setSendEmailOpen(open);
                    if (!open) {
                        setSendEmailInvoiceId(null);
                        setSendEmailTo('');
                        setSendEmailLoading(false);
                    }
                }, children: _jsxs(DialogContent, { className: "sm:max-w-md", children: [_jsx(DialogHeader, { children: _jsxs(DialogTitle, { className: "flex items-center gap-2", children: [_jsx(Mail, { className: "w-5 h-5" }), "Send Invoice Email"] }) }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "email", className: "block text-sm font-medium text-slate-700 mb-1", children: "Email Address" }), _jsx(Input, { id: "email", type: "email", placeholder: "customer@example.com", value: sendEmailTo, onChange: (e) => setSendEmailTo(e.target.value), className: "w-full" })] }), _jsx("div", { className: "text-xs text-slate-600 bg-slate-50 p-2 rounded", children: "Invoice PDF will be attached to the email automatically." })] }), _jsxs("div", { className: "flex gap-2 pt-4", children: [_jsx(Button, { variant: "outline", className: "flex-1", onClick: () => setSendEmailOpen(false), disabled: sendEmailLoading, children: "Cancel" }), _jsx(Button, { className: "flex-1", onClick: handleSendInvoiceEmail, disabled: sendEmailLoading || !sendEmailTo.trim(), children: sendEmailLoading ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" }), "Sending..."] })) : (_jsxs(_Fragment, { children: [_jsx(Send, { className: "w-4 h-4 mr-2" }), "Send Email"] })) })] })] }) }), _jsx(Dialog, { open: showInvoiceViewDialog, onOpenChange: (open) => {
                    setShowInvoiceViewDialog(open);
                    if (!open) {
                        setSelectedInvoiceForView(null);
                    }
                }, children: _jsxs(DialogContent, { className: "max-w-4xl max-h-[90vh] overflow-y-auto", children: [_jsx(DialogHeader, { className: "pb-6 border-b border-slate-200", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center", children: _jsx(Eye, { className: "w-5 h-5 text-white" }) }), _jsxs("div", { children: [_jsx(DialogTitle, { className: "text-2xl font-bold text-slate-900", children: "Invoice Details" }), _jsx(DialogDescription, { className: "text-slate-600 mt-1", children: selectedInvoiceForView ? `Invoice ${selectedInvoiceForView.invoiceNumber}` : 'Loading invoice details...' })] })] }) }), selectedInvoiceForView && (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-slate-900 mb-3", children: "Invoice Information" }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-slate-600", children: "Invoice Number:" }), _jsx("span", { className: "font-medium", children: selectedInvoiceForView.invoiceNumber })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-slate-600", children: "Issue Date:" }), _jsx("span", { className: "font-medium", children: new Date(selectedInvoiceForView.issueDate).toLocaleDateString() })] }), selectedInvoiceForView.dueDate && (_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-slate-600", children: "Due Date:" }), _jsx("span", { className: "font-medium", children: new Date(selectedInvoiceForView.dueDate).toLocaleDateString() })] })), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-slate-600", children: "Status:" }), _jsx(Badge, { variant: selectedInvoiceForView.status === "paid" ? "default" :
                                                                        selectedInvoiceForView.dueDate && new Date(selectedInvoiceForView.dueDate) < new Date() && selectedInvoiceForView.balanceDue > 0 ? "destructive" :
                                                                            "secondary", children: selectedInvoiceForView.status.charAt(0).toUpperCase() + selectedInvoiceForView.status.slice(1) })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-slate-600", children: "Currency:" }), _jsx("span", { className: "font-medium", children: selectedInvoiceForView.currency || 'USD' })] })] })] }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-slate-900 mb-3", children: "Customer Information" }), (() => {
                                                    const customer = customers.find(c => c.id === selectedInvoiceForView.customerId);
                                                    return customer ? (_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-slate-600", children: "Name:" }), _jsx("span", { className: "font-medium", children: customer.name })] }), customer.email && (_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-slate-600", children: "Email:" }), _jsx("span", { className: "font-medium", children: customer.email })] })), customer.phone && (_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-slate-600", children: "Phone:" }), _jsx("span", { className: "font-medium", children: customer.phone })] })), customer.address && (_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-slate-600", children: "Address:" }), _jsx("span", { className: "font-medium", children: customer.address })] }))] })) : (_jsx("p", { className: "text-slate-500", children: "Customer information not available" }));
                                                })()] })] }), _jsxs("div", { className: "bg-slate-50 rounded-lg p-4", children: [_jsx("h3", { className: "text-lg font-semibold text-slate-900 mb-3", children: "Financial Summary" }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-slate-600", children: "Total Amount:" }), _jsx("span", { className: "font-semibold text-lg", children: formatCurrency(selectedInvoiceForView.totalAmount) })] }), selectedInvoiceForView.balanceDue > 0 && (_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-slate-600", children: "Balance Due:" }), _jsx("span", { className: "font-semibold text-amber-600", children: formatCurrency(selectedInvoiceForView.balanceDue) })] })), selectedInvoiceForView.balanceDue === 0 && (_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-slate-600", children: "Payment Status:" }), _jsx("span", { className: "font-semibold text-green-600", children: "Fully Paid" })] }))] }), _jsx("div", { className: "space-y-2", children: selectedInvoiceForView.dueDate && (_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-slate-600", children: "Days Until Due:" }), _jsxs("span", { className: `font-medium ${new Date(selectedInvoiceForView.dueDate) < new Date() ? 'text-red-600' : 'text-slate-900'}`, children: [Math.ceil((new Date(selectedInvoiceForView.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)), " days"] })] })) })] })] }), _jsxs("div", { className: "flex gap-3 pt-4 border-t border-slate-200", children: [_jsxs(Button, { variant: "outline", onClick: () => handleDownloadInvoicePdf(selectedInvoiceForView.id, selectedInvoiceForView.invoiceNumber), className: "flex-1", children: [_jsx(Download, { className: "w-4 h-4 mr-2" }), "Download PDF"] }), _jsxs(Button, { variant: "outline", onClick: () => {
                                                const customer = customers.find(c => c.id === selectedInvoiceForView.customerId);
                                                setSendEmailInvoiceId(selectedInvoiceForView.id);
                                                setSendEmailTo(customer?.email || '');
                                                setSendEmailOpen(true);
                                                setShowInvoiceViewDialog(false);
                                            }, className: "flex-1", children: [_jsx(Send, { className: "w-4 h-4 mr-2" }), "Send Email"] }), _jsxs(Button, { variant: "outline", onClick: () => {
                                                window.open(`/sales?invoice=${selectedInvoiceForView.id}`, '_blank');
                                            }, className: "flex-1", children: [_jsx(ExternalLink, { className: "w-4 h-4 mr-2" }), "Open in Sales"] })] })] }))] }) }), _jsx(Dialog, { open: showReceiptEmailDialog, onOpenChange: (open) => {
                    setShowReceiptEmailDialog(open);
                    if (!open) {
                        setReceiptEmailTo('');
                        setIsSendingReceiptEmail(false);
                    }
                }, children: _jsxs(DialogContent, { className: "max-w-md", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Email Receipt" }), _jsx(DialogDescription, { children: "Enter the recipient email address to send the receipt." })] }), _jsxs("div", { className: "space-y-3 py-2", children: [_jsx(Label, { htmlFor: "receipt-email-to", children: "Email Address" }), _jsx(Input, { id: "receipt-email-to", type: "email", placeholder: "customer@example.com", value: receiptEmailTo, onChange: (e) => setReceiptEmailTo(e.target.value) })] }), _jsxs(DialogFooter, { children: [_jsx(Button, { variant: "outline", onClick: () => {
                                        setShowReceiptEmailDialog(false);
                                        setReceiptEmailTo('');
                                        setIsSendingReceiptEmail(false);
                                    }, children: "Cancel" }), _jsx(Button, { disabled: !receiptEmailTo || !receiptData || isSendingReceiptEmail, onClick: async () => {
                                        if (!receiptEmailTo || !receiptData || isSendingReceiptEmail)
                                            return;
                                        setIsSendingReceiptEmail(true);
                                        try {
                                            const success = await ReceiptManager.emailReceipt(receiptData, {
                                                to: receiptEmailTo,
                                                subject: `Receipt ${receiptData.invoiceNumber}`,
                                                message: 'Thank you for your purchase! Your receipt is attached.'
                                            });
                                            if (success) {
                                                toast({
                                                    title: "Receipt Emailed",
                                                    description: `Receipt sent to ${receiptEmailTo}`,
                                                });
                                                setShowReceiptEmailDialog(false);
                                                setReceiptEmailTo('');
                                            }
                                            else {
                                                toast({
                                                    title: "Email Failed",
                                                    description: "Unable to send receipt via email",
                                                    variant: "destructive"
                                                });
                                            }
                                        }
                                        catch (error) {
                                            console.error('Email error:', error);
                                            toast({
                                                title: "Email Error",
                                                description: "Failed to send receipt",
                                                variant: "destructive"
                                            });
                                        }
                                        finally {
                                            setIsSendingReceiptEmail(false);
                                        }
                                    }, children: isSendingReceiptEmail ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" }), "Sending..."] })) : (_jsxs(_Fragment, { children: [_jsx(Send, { className: "w-4 h-4 mr-2" }), "Send Receipt"] })) })] })] }) })] }));
}
