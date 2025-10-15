import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useDemoAuth } from '../hooks/useDemoAuth'
import { getCompanyId } from '../lib/config'
import { purchaseApi, companiesApi, type Vendor, type PurchaseOrderLine } from '../lib/api/accounting'
import { inventoryApi } from '../lib/api/inventory'
import { formatCurrency } from '../lib/utils'

type OrderStatus = 'draft' | 'approved' | 'delivered' | 'closed' | 'cancelled';

interface PurchaseOrder {
  id: string;
  companyId: string;
  company?: Company;
  vendorId: string;
  vendor?: Vendor;
  poNumber: string;
  orderDate: string;
  expectedDelivery?: string;
  orderSource: 'internal' | 'external';
  currency: string;
  notes?: string;
  status: OrderStatus;
  totalAmount: number;
  lines: PurchaseOrderLine[];
  createdAt?: string;
  updatedAt?: string;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  description?: string;
  unitPrice: number;
  costPrice: number;
  stockQuantity: number;
  status: 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED' | 'DRAFT';
  reorderPoint: number;
}
import { PageLayout } from '../components/page-layout'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Input } from '../components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../components/ui/form'
import { Textarea } from '../components/ui/textarea'
import { Separator } from '../components/ui/separator'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Trash2, 
  FileText, 
  Download,
  Send,
  DollarSign,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react'
import { format } from 'date-fns'

// Types imported from API

interface Company {
  id: string
  name: string
}

// Validation schemas
const purchaseOrderSchema = z.object({
  companyId: z.string().min(1, 'Company is required'),
  vendorId: z.string().min(1, 'Vendor is required'),
  poNumber: z.string().min(1, 'PO Number is required'),
  orderDate: z.string().min(1, 'Order date is required'),
  expectedDelivery: z.string().optional(),
  orderSource: z.enum(['internal', 'external'], {
    required_error: 'Order source is required',
  }),
  currency: z.string().default('USD'),
  notes: z.string().optional(),
  lines: z.array(z.object({
    productId: z.string().optional(),
    description: z.string().min(1, 'Description is required'),
    quantity: z.coerce.number().positive('Quantity must be positive'),
    unitPrice: z.coerce.number().nonnegative('Unit price must be non-negative'),
    taxRate: z.coerce.number().nonnegative().default(0)
  })).min(1, 'At least one line item is required')
})

export default function PurchaseOrdersPage() {
  const { ready: authReady } = useDemoAuth('purchase-orders-page')
  const [companyId, setCompanyId] = useState<string>(getCompanyId())
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isViewOpen, setIsViewOpen] = useState(false)

  // Listen for company changes from header
  useEffect(() => {
    const handleStorageChange = () => {
      const newCompanyId = getCompanyId();
      if (newCompanyId && newCompanyId !== companyId) {
        console.log('🔄 Purchase Orders page - Company changed from', companyId, 'to', newCompanyId);
        setCompanyId(newCompanyId);
      }
    };

    // Listen for localStorage changes
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events (in case localStorage doesn't trigger)
    const handleCompanyChange = (e: CustomEvent) => {
      const newCompanyId = e.detail.companyId;
      if (newCompanyId && newCompanyId !== companyId) {
        console.log('🔄 Purchase Orders page - Company changed via custom event from', companyId, 'to', newCompanyId);
        setCompanyId(newCompanyId);
      }
    };
    
    window.addEventListener('companyChanged', handleCompanyChange as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('companyChanged', handleCompanyChange as EventListener);
    };
  }, [companyId]);

  
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null)
  const [editingOrder, setEditingOrder] = useState<PurchaseOrder | null>(null)
  
  const queryClient = useQueryClient()

  // Fetch products
  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await inventoryApi.getProducts({
        companyId: getCompanyId()
      })
      return response.items
    },
    enabled: authReady
  })

  // Fetch data
  const { data: companies } = useQuery<Company[]>({
    queryKey: ['companies'],
    queryFn: async () => await companiesApi.getCompanies(),
    enabled: authReady
  })

  const { data: vendors } = useQuery<Vendor[]>({
    queryKey: ['vendors'],
    queryFn: async () => await purchaseApi.getVendors(),
    enabled: authReady
  })

  const { data: purchaseOrders, isLoading: ordersLoading } = useQuery<PurchaseOrder[]>({
    queryKey: ['purchase-orders', statusFilter],
    queryFn: async () => {
      console.log('Fetching purchase orders...', { statusFilter });
      try {
        const response = await purchaseApi.getPurchaseOrders(
          companyId,
          statusFilter === 'all' ? undefined : statusFilter as any
        );
        console.log('Purchase orders fetched successfully:', response);
        return response as any as PurchaseOrder[];
      } catch (error) {
        console.error('Error fetching purchase orders:', error);
        throw error;
      }
    },
    enabled: authReady
  })

  // Fetch individual purchase order details
  const { data: orderDetails, isLoading: orderDetailsLoading } = useQuery<PurchaseOrder>({
    queryKey: ['purchase-order', selectedOrder?.id],
    enabled: !!selectedOrder?.id,
    queryFn: async () => {
      const response = await purchaseApi.getPurchaseOrderById(selectedOrder!.id)
      return response as any as PurchaseOrder
    }
  })

  // Mutations
  const createOrder = useMutation({
    mutationFn: async (data: any) => purchaseApi.createPurchaseOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] })
      setIsCreateOpen(false)
      toast.success('Purchase order created successfully')
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.error || error?.response?.data?.message || error?.message || 'Failed to create purchase order'
      toast.error(errorMessage)
    }
  })

  const updateOrder = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      console.log('Starting purchase order update:', { id, data });
      try {
        // Wait for purchase order update
        const response = await purchaseApi.updatePurchaseOrder(id, data);
        console.log('Purchase order updated successfully:', response);
        
        // Wait for related queries to re-fetch
        console.log('Invalidating purchase orders queries...');
        await queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
        console.log('Queries invalidated successfully');
        
        return response;
      } catch (error) {
        console.error('Error in updateOrder mutation:', error);
        throw error; // Re-throw to trigger onError handler
      }
    },
    onSuccess: (response, variables) => {
      console.log('Update mutation completed successfully', { response, variables });
      setIsCreateOpen(false)
      setEditingOrder(null)
      
      // Show appropriate success message based on status change
      const newStatus = variables.data.status;
      let successMessage = 'Purchase order updated successfully';
      
      switch (newStatus) {
        case 'approved':
          successMessage = 'Purchase order approved';
          break;
        default:
          successMessage = 'Purchase order updated successfully';
      }
      
      toast.success(successMessage);
    },
    onError: (error: any) => {
      console.error('Purchase order update failed:', error);
      const errorMessage = error?.response?.data?.error || error?.response?.data?.message || error?.message || 'Failed to update purchase order'
      toast.error(errorMessage)
    }
  })

  const deleteOrder = useMutation({
    mutationFn: async (id: string) => purchaseApi.deletePurchaseOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] })
      toast.success('Purchase order deleted successfully')
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.error || error?.response?.data?.message || error?.message || 'Failed to delete purchase order'
      toast.error(errorMessage)
    }
  })

  // Form setup
  const form = useForm({
    resolver: zodResolver(purchaseOrderSchema),
    defaultValues: {
      companyId: '',
      vendorId: '',
      poNumber: '',
      orderDate: '',
      expectedDelivery: '',
      currency: 'USD',
      notes: '',
      lines: [{ description: '', quantity: 1, unitPrice: 0, taxRate: 0 }]
    }
  })

  // Live totals
  const watchedLines = form.watch('lines') as Array<{ quantity?: number; unitPrice?: number; taxRate?: number }>
  const totals = (Array.isArray(watchedLines) ? watchedLines : []).reduce((acc, l) => {
    const qty = Number(l?.quantity || 0)
    const price = Number(l?.unitPrice || 0)
    const line = qty * price
    const tax = line * (Number(l?.taxRate || 0) / 100)
    acc.subtotal += line
    acc.tax += tax
    acc.total += line + tax
    return acc
  }, { subtotal: 0, tax: 0, total: 0 })

  const onSubmit = (data: any) => {
    // Convert date strings to datetime format for backend
    const transformedData = {
      ...data,
      orderDate: data.orderDate ? new Date(data.orderDate).toISOString() : undefined,
      expectedDelivery: data.expectedDelivery ? new Date(data.expectedDelivery).toISOString() : undefined
    }
    
    if (editingOrder) {
      updateOrder.mutate({ id: editingOrder.id, data: transformedData })
    } else {
      createOrder.mutate(transformedData)
    }
  }

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'draft': return 'secondary'
      case 'approved': return 'default'
      case 'delivered': return 'default'
      case 'closed': return 'secondary'
      case 'cancelled': return 'destructive'
      default: return 'secondary'
    }
  }

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'draft': return <FileText className="w-4 h-4" />
      case 'approved': return <CheckCircle className="w-4 h-4" />
      case 'delivered': return <Package className="w-4 h-4" />
      case 'closed': return <CheckCircle className="w-4 h-4" />
      case 'cancelled': return <XCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const filteredOrders = (Array.isArray(purchaseOrders) ? purchaseOrders : []).filter(order => 
    !searchTerm || 
    order.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.vendor?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.notes?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  /**
   * Download purchase order as PDF
   * 
   * @param purchaseOrderId - ID of the purchase order to download
   * @param poNumber - PO number for the filename
   */
  const handleDownloadPDF = async (purchaseOrderId: string, poNumber: string) => {
    try {
      const tenantId = localStorage.getItem('tenant_id') || 'tenant_demo'
      const token = localStorage.getItem('token') || localStorage.getItem('auth_token')

      if (!token) {
        toast.error('Authentication required. Please log in.')
        return
      }

      toast.loading('Generating PDF...')

      const response = await fetch(
        `https://urutiq-backend-clean-af6v.onrender.com/api/purchase-orders/${purchaseOrderId}/pdf`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'x-tenant-id': tenantId,
            'x-company-id': companyId,
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) {
        const errorText = await response.text()
        console.error('PDF generation error:', response.status, errorText)
        throw new Error(`Failed to generate PDF: ${response.status} ${response.statusText}`)
      }

      // Get the PDF blob
      const blob = await response.blob()
      
      // Create a download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `PO-${poNumber}.pdf`
      document.body.appendChild(link)
      link.click()
      
      // Cleanup
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      toast.dismiss()
      toast.success('PDF downloaded successfully')
    } catch (error: any) {
      console.error('Error downloading PDF:', error)
      toast.dismiss()
      toast.error(error?.message || 'Failed to download PDF')
    }
  }

  /**
   * Send purchase order to vendor via email
   * 
   * @param purchaseOrderId - ID of the purchase order to send
   * @param vendorName - Vendor name
   */
  const handleSendToVendor = async (purchaseOrderId: string, vendorName: string) => {
    try {
      const tenantId = localStorage.getItem('tenant_id') || 'tenant_demo'
      const token = localStorage.getItem('token') || localStorage.getItem('auth_token')

      if (!token) {
        toast.error('Authentication required. Please log in.')
        return
      }

      // Optional: Ask for additional notes
      const notes = typeof window !== 'undefined' ? 
        window.prompt(`Send to ${vendorName}?\n\nOptional notes (leave blank if none):`) : 
        null

      if (notes === null) {
        // User cancelled
        return
      }

      toast.loading(`Sending to ${vendorName}...`)

      const response = await fetch(
        `https://urutiq-backend-clean-af6v.onrender.com/api/purchase-orders/${purchaseOrderId}/send-to-vendor`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'x-tenant-id': tenantId,
            'x-company-id': companyId,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ notes: notes || undefined })
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Send to vendor error:', response.status, errorData)
        throw new Error(errorData.message || `Failed to send: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()
      
      toast.dismiss()
      toast.success(result.message || `Purchase order sent to ${vendorName}`)
      
      // Refresh the purchase orders list to show updated status
      await queryClient.invalidateQueries({ queryKey: ['purchase-orders'] })
    } catch (error: any) {
      console.error('Error sending to vendor:', error)
      toast.dismiss()
      toast.error(error?.message || 'Failed to send to vendor')
    }
  }

  /**
   * Handle marking purchase order as delivered
   */
  const handleMarkAsDelivered = async (order: PurchaseOrder) => {
    try {
      const tenantId = localStorage.getItem('tenant_id') || 'tenant_demo'
      const token = localStorage.getItem('token') || localStorage.getItem('auth_token')

      if (!token) {
        toast.error('Authentication required. Please log in.')
        return
      }

      // Confirm the action
      const confirmed = typeof window !== 'undefined' ? 
        window.confirm(`Mark Purchase Order ${order.poNumber} as delivered?\n\nThis will:\n- Update stock levels\n- Create journal entries\n- Mark the order as delivered`) : 
        false

      if (!confirmed) {
        return
      }

      toast.loading(`Marking ${order.poNumber} as delivered...`)

      // Prepare delivery data
      const deliveryData = {
        deliveredDate: new Date().toISOString(),
        deliveredBy: 'System', // TODO: Get actual user name
        notes: `Marked as delivered on ${new Date().toLocaleDateString()}`,
        journalEntryData: {
          memo: `Inventory delivered from PO ${order.poNumber}`,
          reference: `PO-${order.poNumber}-DELIVERED`
        }
      }

      // Call the delivery API
      const response = await fetch(
        `https://urutiq-backend-clean-af6v.onrender.com/api/purchase-orders/${order.id}/deliver`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'x-tenant-id': tenantId,
            'x-company-id': companyId,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(deliveryData)
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Mark as delivered error:', response.status, errorData)
        throw new Error(errorData.message || `Failed to mark as delivered: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()
      
      toast.dismiss()
      toast.success(result.message || `Purchase order ${order.poNumber} marked as delivered successfully`)
      
      // Refresh the purchase orders list to show updated status
      await queryClient.invalidateQueries({ queryKey: ['purchase-orders'] })
    } catch (error: any) {
      console.error('Error marking as delivered:', error)
      toast.dismiss()
      toast.error(error?.message || 'Failed to mark as delivered')
    }
  }

  /**
   * Handle downloading good receipt PDF
   */
  const handleDownloadGoodReceipt = async (purchaseOrderId: string, poNumber: string) => {
    try {
      toast.loading(`Generating good receipt for ${poNumber}...`)

      const blob = await purchaseApi.downloadGoodReceiptPDF(purchaseOrderId)
      
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `GoodReceipt-${poNumber}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.dismiss()
      toast.success(`Good receipt for ${poNumber} downloaded successfully`)

    } catch (error: any) {
      console.error('Error downloading good receipt:', error)
      toast.dismiss()
      toast.error(error?.message || 'Failed to download good receipt')
    }
  }

  if (!authReady) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Purchase Orders</h1>
            <p className="text-gray-600">Manage your purchase orders and procurement process</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              onClick={() => {
                setEditingOrder(null)
                const defaultCompanyId = typeof window !== 'undefined' ? 
                  localStorage.getItem('company_id') || getCompanyId() : 
                  getCompanyId();
                // Generate a unique PO number with timestamp
                const timestamp = new Date().getTime();
                const poNumber = `PO-${timestamp}`;
                
                form.reset({
                  companyId: defaultCompanyId,
                  vendorId: '',
                  poNumber: poNumber,
                  orderDate: new Date().toISOString().split('T')[0],
                  expectedDelivery: '',
                  orderSource: 'external',
                  currency: 'USD',
                  notes: '',
                  lines: [{ description: '', quantity: 1, unitPrice: 0, taxRate: 0 }]
                })
                setIsCreateOpen(true)
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Purchase Order
            </Button>
          </div>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{Array.isArray(purchaseOrders) ? purchaseOrders.length : 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-green-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-600">Total Value</p>
                  <p className="text-lg font-bold text-gray-900 truncate">
                    ${Array.isArray(purchaseOrders) ? purchaseOrders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : '0'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Truck className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Array.isArray(purchaseOrders) ? purchaseOrders.filter(order => ['draft', 'sent'].includes(order.status)).length : 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed Orders</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Array.isArray(purchaseOrders) ? purchaseOrders.filter(order => ['approved', 'delivered'].includes(order.status)).length : 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Purchase Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>Purchase Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex items-center space-x-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search purchase orders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Table */}
            {ordersLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : (
              <div className="overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[120px]">PO Number</TableHead>
                      <TableHead className="w-[200px]">Vendor</TableHead>
                      <TableHead className="w-[100px]">Date</TableHead>
                      <TableHead className="w-[120px]">Amount</TableHead>
                      <TableHead className="w-[100px]">Status</TableHead>
                      <TableHead className="w-[80px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <div className="text-gray-500">
                            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No purchase orders found</p>
                            <p className="text-sm">Create your first purchase order to get started</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.poNumber}</TableCell>
                          <TableCell className="truncate" title={order.vendor?.name || '-'}>
                            {order.vendor?.name || '-'}
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {order.orderDate ? format(new Date(order.orderDate), 'MMM dd') : '-'}
                          </TableCell>
                          <TableCell className="font-medium">${order.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusColor(order.status)} className="flex items-center gap-1 w-fit">
                              {getStatusIcon(order.status)}
                              {order.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedOrder(order)
                                  setIsViewOpen(true)
                                }}
                                title="View Details"
                                className="h-8 w-8 p-0"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              {order.status === 'approved' && (
                                <Button
                                  size="sm"
                                  variant="default"
                                  onClick={async () => {
                                    if (confirm('Mark this purchase order as delivered? This will update inventory and create accounting entries.')) {
                                      try {
                                        await purchaseApi.markAsDelivered(order.id, {
                                          deliveredDate: new Date().toISOString(),
                                          deliveredBy: 'System',
                                          notes: 'Delivered via purchase order system'
                                        });
                                        toast.success('Purchase order delivered successfully! Inventory and accounting updated.');
                                        // Refresh the data
                                        window.location.reload();
                                      } catch (error: any) {
                                        console.error('Delivery failed:', error);
                                        toast.error('Failed to deliver purchase order: ' + (error?.response?.data?.message || error.message || 'Unknown error'));
                                      }
                                    }
                                  }}
                                  title="Mark as Delivered"
                                  className="h-8 w-8 p-0 bg-green-600 hover:bg-green-700"
                                >
                                  <Package className="w-4 h-4" />
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={order.status === 'closed' || order.status === 'cancelled'}
                                onClick={() => {
                                  setEditingOrder(order)
                                  form.reset({
                                    companyId: order.company?.id || companies?.[0]?.id || '',
                                    vendorId: order.vendorId,
                                    poNumber: order.poNumber,
                                    orderDate: order.orderDate ? new Date(order.orderDate).toISOString().split('T')[0] : '',
                                    expectedDelivery: order.expectedDelivery ? new Date(order.expectedDelivery).toISOString().split('T')[0] : '',
                                    orderSource: order.orderSource || 'external',
                                    currency: order.currency || 'USD',
                                    notes: order.notes || '',
                                    lines: order.lines.map(line => ({
                                      id: line.id,
                                      productId: line.productId || '',
                                      description: line.description,
                                      quantity: line.quantity,
                                      unitPrice: line.unitPrice,
                                      taxRate: line.taxRate
                                    }))
                                  })
                                  setIsCreateOpen(true)
                                }}
                                title={order.status === 'closed' || order.status === 'cancelled' ? 'Cannot edit closed or cancelled orders' : 'Edit Purchase Order'}
                                className="h-8 w-8 p-0"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Select 
                                value={order.status}
                                disabled={order.status === 'closed' || order.status === 'cancelled'}
                                onValueChange={async (newStatus) => {
                                  if (newStatus !== order.status) {
                                    // Prevent changing from delivered back to draft or approved
                                    if (order.status === 'delivered' && (newStatus === 'draft' || newStatus === 'approved')) {
                                      toast.error('Cannot change status from delivered back to draft or approved');
                                      return;
                                    }
                                    
                                    // Prevent changing from approved back to draft
                                    if (order.status === 'approved' && newStatus === 'draft') {
                                      toast.error('Cannot change status from approved back to draft');
                                      return;
                                    }
                                    // Ensure we have required data
                                    const companyId = order.companyId || order.company?.id;
                                    const vendorId = order.vendorId;
                                    
                                    if (!companyId || !vendorId) {
                                      toast.error('Missing required company or vendor information');
                                      return;
                                    }

                                    // If changing to delivered, trigger the delivery process
                                    if (newStatus === 'delivered') {
                                      try {
                                        // Call the delivery API to update inventory and create journal entries
                                        const deliveryData = {
                                          deliveredDate: new Date().toISOString(),
                                          deliveredBy: 'System',
                                          notes: `Status changed to delivered on ${new Date().toLocaleDateString()}`,
                                          journalEntryData: {
                                            memo: `Inventory delivered from PO ${order.poNumber}`,
                                            reference: `PO-${order.poNumber}-DELIVERED`
                                          }
                                        };

                                        const apiCompanyId = getCompanyId()
                                        const tenantId = localStorage.getItem('tenant_id') || 'tenant_demo'
                                        const token = localStorage.getItem('token') || localStorage.getItem('auth_token')

                                        const response = await fetch(
                                          `https://urutiq-backend-clean-af6v.onrender.com/api/purchase-orders/${order.id}/deliver`,
                                          {
                                            method: 'POST',
                                            headers: {
                                              'Authorization': `Bearer ${token}`,
                                              'x-tenant-id': tenantId,
                                              'x-company-id': apiCompanyId,
                                              'Content-Type': 'application/json',
                                            },
                                            body: JSON.stringify(deliveryData)
                                          }
                                        );

                                        if (!response.ok) {
                                          const errorData = await response.json()
                                          throw new Error(errorData.message || `Failed to deliver: ${response.status} ${response.statusText}`)
                                        }

                                        toast.success('Purchase order delivered successfully! Inventory and accounting updated.');
                                        // Refresh the data
                                        await queryClient.invalidateQueries({ queryKey: ['purchase-orders'] })
                                        return; // Exit early since delivery API already updated the status
                                      } catch (error: any) {
                                        console.error('Delivery failed:', error);
                                        toast.error('Failed to deliver purchase order: ' + (error?.message || 'Unknown error'));
                                        return; // Don't proceed with regular status update
                                      }
                                    }

                                    // Ensure dates are in ISO format and required
                                    const orderDate = order.orderDate 
                                      ? new Date(order.orderDate).toISOString() 
                                      : new Date().toISOString();

                                    // Simple status update for draft -> approved
                                    updateOrder.mutate({
                                      id: order.id,
                                      data: {
                                        status: newStatus,
                                        companyId: companyId,
                                        vendorId: vendorId,
                                        poNumber: order.poNumber,
                                        orderDate: orderDate,
                                        expectedDelivery: order.expectedDelivery 
                                          ? new Date(order.expectedDelivery).toISOString() 
                                          : undefined,
                                        orderSource: order.orderSource || 'external',
                                        currency: order.currency || 'USD',
                                        notes: order.notes || '',
                                        lines: order.lines.map(line => ({
                                          id: line.id,
                                          productId: line.productId || '',
                                          description: line.description || '',
                                          quantity: Number(line.quantity) || 1,
                                          unitPrice: Number(line.unitPrice) || 0,
                                          taxRate: Number(line.taxRate) || 0
                                        }))
                                      }
                                    })
                                  }
                                }}
                              >
                                <SelectTrigger className="w-[130px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="draft" disabled={order.status === 'delivered' || order.status === 'approved'}>Draft</SelectItem>
                                  <SelectItem value="approved" disabled={order.status === 'delivered'}>Approved</SelectItem>
                                  <SelectItem value="delivered">Delivered</SelectItem>
                                  <SelectItem value="closed">Closed</SelectItem>
                                  <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={order.status === 'closed' || order.status === 'cancelled'}
                                onClick={() => {
                                  if (confirm('Are you sure you want to delete this purchase order?')) {
                                    deleteOrder.mutate(order.id)
                                  }
                                }}
                                title={order.status === 'closed' || order.status === 'cancelled' ? 'Only draft orders can be deleted' : 'Delete Purchase Order'}
                                className={order.status === 'closed' || order.status === 'cancelled' ? 'opacity-50 cursor-not-allowed' : ''}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create/Edit Dialog */}
        <Dialog open={isCreateOpen} onOpenChange={(open) => {
          setIsCreateOpen(open)
          if (!open) {
            setEditingOrder(null)
            form.reset()
          }
        }}>
          <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto ">
            <DialogHeader>
              <div className="flex items-start justify-between gap-4">
                <DialogTitle>
                  {editingOrder ? (
                    <span>
                      Edit Purchase Order
                      {editingOrder.poNumber ? (
                        <span className="ml-2 text-sm font-normal text-muted-foreground">#{editingOrder.poNumber}</span>
                      ) : null}
                    </span>
                  ) : (
                    'Create Purchase Order'
                  )}
                </DialogTitle>
                {editingOrder ? (
                  <Badge variant={getStatusColor(editingOrder.status)} className="mt-1 flex items-center gap-1 w-fit">
                    {getStatusIcon(editingOrder.status)}
                    {editingOrder.status}
                  </Badge>
                ) : null}
              </div>
            </DialogHeader>

            {editingOrder ? (
              <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                <div className="p-3 border rounded-md bg-white/50">
                  <div className="text-muted-foreground">Vendor</div>
                  <div className="font-medium">{editingOrder.vendor?.name || '-'}</div>
                </div>
                <div className="p-3 border rounded-md bg-white/50">
                  <div className="text-muted-foreground">Order Date</div>
                  <div className="font-medium">{editingOrder.orderDate ? format(new Date(editingOrder.orderDate), 'MMM dd, yyyy') : '-'}</div>
                </div>
                <div className="p-3 border rounded-md bg-white/50">
                  <div className="text-muted-foreground">Expected Delivery</div>
                  <div className="font-medium">{editingOrder.expectedDelivery ? format(new Date(editingOrder.expectedDelivery), 'MMM dd, yyyy') : '-'}</div>
                </div>
                <div className="p-3 border rounded-md bg-white/50">
                  <div className="text-muted-foreground">Current Total</div>
                  <div className="font-semibold">${(editingOrder.totalAmount || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
                </div>
              </div>
            ) : null}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Basic Information */}
					<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="companyId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
									<SelectTrigger className="w-full">
                              <SelectValue placeholder="Select company" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {companies?.map((company) => (
                              <SelectItem key={company.id} value={company.id}>
                                {company.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="vendorId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vendor</FormLabel>
                        <div className="flex gap-2 items-start">
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a vendor" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {vendors?.map((vendor) => (
                                <SelectItem key={vendor.id} value={vendor.id}>
                                  {vendor.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              const name = typeof window !== 'undefined' ? window.prompt('New vendor name') : ''
                              if (!name) return
                              try {
                                await purchaseApi.createVendor({ name, companyId })
                                toast.success('Vendor created')
                                await queryClient.invalidateQueries({ queryKey: ['vendors'] })
                              } catch (e: any) {
                                toast.error(e?.message || 'Failed to create vendor')
                              }
                            }}
                          >Add</Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="poNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>PO Number</FormLabel>
                        <FormControl>
                          <Input placeholder="PO-2024-001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="orderDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Order Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="expectedDelivery"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expected Delivery</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="orderSource"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Order Source</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
									<SelectTrigger className="w-full">
                              <SelectValue placeholder="Select order source" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="internal">Internal</SelectItem>
                            <SelectItem value="external">External</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Currency</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
									<SelectTrigger className="w-full">
                              <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="USD">USD</SelectItem>
                            <SelectItem value="EUR">EUR</SelectItem>
                            <SelectItem value="GBP">GBP</SelectItem>
                            <SelectItem value="RWF">RWF</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Additional notes..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Line Items */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Line Items</h3>
                  </div>
                  
                  <div className="overflow-x-auto">
                  {form.watch('lines').map((_, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 p-5 border rounded-lg min-w-[1100px]">
                      <FormField
                        control={form.control}
                        name={`lines.${index}.productId`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Product</FormLabel>
                            <div className="flex gap-2 items-start">
                              <Select 
                                value={field.value} 
                                onValueChange={(value) => {
                                  field.onChange(value);
                                  const product = products?.find(p => p.id === value);
                                  if (product) {
                                    form.setValue(`lines.${index}.description`, product.name);
                                    form.setValue(`lines.${index}.unitPrice`, product.unitPrice);
                                  }
                                }}
                              >
                                <FormControl>
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select product">
                                      {(() => {
                                        const selectedId = form.getValues(`lines.${index}.productId`);
                                        const selectedProduct = products?.find(p => p.id === selectedId);
                                        return selectedProduct ? selectedProduct.name : "Select product";
                                      })()}
                                    </SelectValue>
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {products?.map((product) => (
                                    <SelectItem 
                                      key={product.id} 
                                      value={product.id}
                                      disabled={product.status === 'DISCONTINUED'}
                                    >
                                      <div>
                                        <div className="font-semibold">{product.name}</div>
                                        <div className="text-xs text-muted-foreground">
                                          {product.stockQuantity} in stock
                                          {product.status === 'INACTIVE' && ' (Inactive)'}
                                        </div>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={async () => {
                                  const name = typeof window !== 'undefined' ? window.prompt('New product name') : ''
                                  if (!name) return
                                  try {
                                    const created = await inventoryApi.createProduct({ name, companyId, unitPrice: 0, costPrice: 0, sku: `SKU-${Date.now()}` })
                                    toast.success('Product created')
                                    await queryClient.invalidateQueries({ queryKey: ['products'] })
                                    form.setValue(`lines.${index}.productId`, (created as any).id)
                                    form.setValue(`lines.${index}.description`, (created as any).name)
                                  } catch (e: any) {
                                    toast.error(e?.message || 'Failed to create product')
                                  }
                                }}
                              >Add</Button>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`lines.${index}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Input placeholder="Item description" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name={`lines.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quantity</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="1" {...field} />
                            </FormControl>
                            <p className="text-xs text-muted-foreground">Enter the number of units</p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name={`lines.${index}.unitPrice`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Unit Price</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="0.00" {...field} />
                            </FormControl>
                            <p className="text-xs text-muted-foreground">Price per unit before tax</p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name={`lines.${index}.taxRate`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tax Rate (%)</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="0" {...field} />
                            </FormControl>
                            <p className="text-xs text-muted-foreground">e.g., 18 for 18%</p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Per-line total and remove */}
                      <div className="flex items-end justify-between">
                        <div className="text-right ml-auto">
                          <div className="text-xs text-muted-foreground">Line Total</div>
                          <div className="font-semibold">
                            {(() => {
                              const l = (form.getValues('lines') as any[])[index] || {}
                              const qty = Number(l?.quantity || 0)
                              const price = Number(l?.unitPrice || 0)
                              const base = qty * price
                              const tax = base * (Number(l?.taxRate || 0) / 100)
                              return `$${(base + tax).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
                            })()}
                          </div>
                        </div>
                        <div className="flex items-end">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const lines = form.getValues('lines')
                              if (lines.length > 1) {
                                form.setValue('lines', lines.filter((_, i) => i !== index))
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  </div>
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const lines = form.getValues('lines')
                      form.setValue('lines', [...lines, { description: '', quantity: 1, unitPrice: 0, taxRate: 0 }])
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Line Item
                  </Button>
                </div>

                {/* Totals */}
                <div className="border rounded-lg p-4 grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white/50">
                  <div>
                    <div className="text-sm text-muted-foreground">Subtotal</div>
                    <div className="text-xl font-semibold">${totals.subtotal.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Tax</div>
                    <div className="text-xl font-semibold">${totals.tax.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Total</div>
                    <div className="text-2xl font-bold">${totals.total.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 sticky bottom-0 bg-white/70 py-3">
                  <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createOrder.isPending || updateOrder.isPending}>
                    {createOrder.isPending || updateOrder.isPending 
                      ? (editingOrder ? 'Updating...' : 'Creating...') 
                      : (editingOrder ? 'Update Order' : 'Create Order')}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* View Dialog */}
        <Dialog open={isViewOpen} onOpenChange={(open) => {
          setIsViewOpen(open)
          if (!open) {
            setSelectedOrder(null)
          }
        }}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Purchase Order Details</DialogTitle>
            </DialogHeader>
            {orderDetailsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : orderDetails ? (
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">PO Number</label>
                    <p className="text-lg font-medium">{orderDetails.poNumber}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Vendor</label>
                    <p className="text-lg">{orderDetails.vendor?.name || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Order Date</label>
                    <p className="text-lg">{orderDetails.orderDate ? format(new Date(orderDetails.orderDate), 'MMM dd, yyyy') : '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Expected Delivery</label>
                    <p className="text-lg">
                      {orderDetails.expectedDelivery ? format(new Date(orderDetails.expectedDelivery), 'MMM dd, yyyy') : '-'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Total Amount</label>
                    <p className="text-lg font-bold text-green-600">${orderDetails.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <div className="mt-1">
                      <Badge variant={getStatusColor(orderDetails.status)} className="flex items-center gap-1 w-fit">
                        {getStatusIcon(orderDetails.status)}
                        {orderDetails.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {orderDetails.notes && (
                  <div className="space-y-4">
                    <Separator />
                    <h3 className="text-lg font-medium">Notes</h3>
                    <p className="text-lg">{orderDetails.notes}</p>
                  </div>
                )}

                {/* Line Items */}
                <div className="space-y-4">
                  <Separator />
                  <h3 className="text-lg font-medium">Line Items</h3>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Description</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Unit Price</TableHead>
                          <TableHead>Tax Rate</TableHead>
                          <TableHead>Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orderDetails.lines.map((line) => (
                          <TableRow key={line.id}>
                            <TableCell>{line.description}</TableCell>
                            <TableCell>{line.quantity}</TableCell>
                            <TableCell>${line.unitPrice.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</TableCell>
                            <TableCell>{line.taxRate}%</TableCell>
                            <TableCell>${(line.lineTotal || (line.quantity * line.unitPrice)).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Timestamps */}
                <div className="space-y-4">
                  <Separator />
                  <h3 className="text-lg font-medium">Timestamps</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Created</label>
                      <p className="text-lg">{orderDetails.createdAt ? format(new Date(orderDetails.createdAt), 'MMM dd, yyyy HH:mm') : '-'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Last Updated</label>
                      <p className="text-lg">{orderDetails.updatedAt ? format(new Date(orderDetails.updatedAt), 'MMM dd, yyyy HH:mm') : '-'}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No purchase order details found</p>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </PageLayout>
  )
}
