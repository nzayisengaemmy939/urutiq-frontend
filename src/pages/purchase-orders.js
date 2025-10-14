import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDemoAuth } from '../hooks/useDemoAuth';
import { getCompanyId } from '../lib/config';
import { purchaseApi, companiesApi } from '../lib/api/accounting';
import { inventoryApi } from '../lib/api/inventory';
import { PageLayout } from '../components/page-layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../components/ui/form';
import { Textarea } from '../components/ui/textarea';
import { Separator } from '../components/ui/separator';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Plus, Search, Eye, Edit, Trash2, FileText, DollarSign, Package, Truck, CheckCircle, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
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
});
export default function PurchaseOrdersPage() {
    const { ready: authReady } = useDemoAuth('purchase-orders-page');
    const [companyId, setCompanyId] = useState(getCompanyId());
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isViewOpen, setIsViewOpen] = useState(false);
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
        const handleCompanyChange = (e) => {
            const newCompanyId = e.detail.companyId;
            if (newCompanyId && newCompanyId !== companyId) {
                console.log('🔄 Purchase Orders page - Company changed via custom event from', companyId, 'to', newCompanyId);
                setCompanyId(newCompanyId);
            }
        };
        window.addEventListener('companyChanged', handleCompanyChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('companyChanged', handleCompanyChange);
        };
    }, [companyId]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [editingOrder, setEditingOrder] = useState(null);
    const queryClient = useQueryClient();
    // Fetch products
    const { data: products } = useQuery({
        queryKey: ['products'],
        queryFn: async () => {
            const response = await inventoryApi.getProducts({
                companyId: getCompanyId()
            });
            return response.items;
        },
        enabled: authReady
    });
    // Fetch data
    const { data: companies } = useQuery({
        queryKey: ['companies'],
        queryFn: async () => await companiesApi.getCompanies(),
        enabled: authReady
    });
    const { data: vendors } = useQuery({
        queryKey: ['vendors'],
        queryFn: async () => await purchaseApi.getVendors(),
        enabled: authReady
    });
    const { data: purchaseOrders, isLoading: ordersLoading } = useQuery({
        queryKey: ['purchase-orders', statusFilter],
        queryFn: async () => {
            console.log('Fetching purchase orders...', { statusFilter });
            try {
                const response = await purchaseApi.getPurchaseOrders(companyId, statusFilter === 'all' ? undefined : statusFilter);
                console.log('Purchase orders fetched successfully:', response);
                return response;
            }
            catch (error) {
                console.error('Error fetching purchase orders:', error);
                throw error;
            }
        },
        enabled: authReady
    });
    // Fetch individual purchase order details
    const { data: orderDetails, isLoading: orderDetailsLoading } = useQuery({
        queryKey: ['purchase-order', selectedOrder?.id],
        enabled: !!selectedOrder?.id,
        queryFn: async () => {
            const response = await purchaseApi.getPurchaseOrderById(selectedOrder.id);
            return response;
        }
    });
    // Mutations
    const createOrder = useMutation({
        mutationFn: async (data) => purchaseApi.createPurchaseOrder(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
            setIsCreateOpen(false);
            toast.success('Purchase order created successfully');
        },
        onError: (error) => {
            const errorMessage = error?.response?.data?.error || error?.response?.data?.message || error?.message || 'Failed to create purchase order';
            toast.error(errorMessage);
        }
    });
    const updateOrder = useMutation({
        mutationFn: async ({ id, data }) => {
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
            }
            catch (error) {
                console.error('Error in updateOrder mutation:', error);
                throw error; // Re-throw to trigger onError handler
            }
        },
        onSuccess: (response, variables) => {
            console.log('Update mutation completed successfully', { response, variables });
            setIsCreateOpen(false);
            setEditingOrder(null);
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
        onError: (error) => {
            console.error('Purchase order update failed:', error);
            const errorMessage = error?.response?.data?.error || error?.response?.data?.message || error?.message || 'Failed to update purchase order';
            toast.error(errorMessage);
        }
    });
    const deleteOrder = useMutation({
        mutationFn: async (id) => purchaseApi.deletePurchaseOrder(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
            toast.success('Purchase order deleted successfully');
        },
        onError: (error) => {
            const errorMessage = error?.response?.data?.error || error?.response?.data?.message || error?.message || 'Failed to delete purchase order';
            toast.error(errorMessage);
        }
    });
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
    });
    // Live totals
    const watchedLines = form.watch('lines');
    const totals = (Array.isArray(watchedLines) ? watchedLines : []).reduce((acc, l) => {
        const qty = Number(l?.quantity || 0);
        const price = Number(l?.unitPrice || 0);
        const line = qty * price;
        const tax = line * (Number(l?.taxRate || 0) / 100);
        acc.subtotal += line;
        acc.tax += tax;
        acc.total += line + tax;
        return acc;
    }, { subtotal: 0, tax: 0, total: 0 });
    const onSubmit = (data) => {
        // Convert date strings to datetime format for backend
        const transformedData = {
            ...data,
            orderDate: data.orderDate ? new Date(data.orderDate).toISOString() : undefined,
            expectedDelivery: data.expectedDelivery ? new Date(data.expectedDelivery).toISOString() : undefined
        };
        if (editingOrder) {
            updateOrder.mutate({ id: editingOrder.id, data: transformedData });
        }
        else {
            createOrder.mutate(transformedData);
        }
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'draft': return 'secondary';
            case 'approved': return 'default';
            case 'delivered': return 'default';
            case 'closed': return 'secondary';
            case 'cancelled': return 'destructive';
            default: return 'secondary';
        }
    };
    const getStatusIcon = (status) => {
        switch (status) {
            case 'draft': return _jsx(FileText, { className: "w-4 h-4" });
            case 'approved': return _jsx(CheckCircle, { className: "w-4 h-4" });
            case 'delivered': return _jsx(Package, { className: "w-4 h-4" });
            case 'closed': return _jsx(CheckCircle, { className: "w-4 h-4" });
            case 'cancelled': return _jsx(XCircle, { className: "w-4 h-4" });
            default: return _jsx(Clock, { className: "w-4 h-4" });
        }
    };
    const filteredOrders = (Array.isArray(purchaseOrders) ? purchaseOrders : []).filter(order => !searchTerm ||
        order.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.vendor?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.notes?.toLowerCase().includes(searchTerm.toLowerCase()));
    /**
     * Download purchase order as PDF
     *
     * @param purchaseOrderId - ID of the purchase order to download
     * @param poNumber - PO number for the filename
     */
    const handleDownloadPDF = async (purchaseOrderId, poNumber) => {
        try {
            const tenantId = localStorage.getItem('tenant_id') || 'tenant_demo';
            const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
            if (!token) {
                toast.error('Authentication required. Please log in.');
                return;
            }
            toast.loading('Generating PDF...');
            const response = await fetch(`https://urutiq-backend-clean-11.onrender.com/api/purchase-orders/${purchaseOrderId}/pdf`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'x-tenant-id': tenantId,
                    'x-company-id': companyId,
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                const errorText = await response.text();
                console.error('PDF generation error:', response.status, errorText);
                throw new Error(`Failed to generate PDF: ${response.status} ${response.statusText}`);
            }
            // Get the PDF blob
            const blob = await response.blob();
            // Create a download link
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `PO-${poNumber}.pdf`;
            document.body.appendChild(link);
            link.click();
            // Cleanup
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            toast.dismiss();
            toast.success('PDF downloaded successfully');
        }
        catch (error) {
            console.error('Error downloading PDF:', error);
            toast.dismiss();
            toast.error(error?.message || 'Failed to download PDF');
        }
    };
    /**
     * Send purchase order to vendor via email
     *
     * @param purchaseOrderId - ID of the purchase order to send
     * @param vendorName - Vendor name
     */
    const handleSendToVendor = async (purchaseOrderId, vendorName) => {
        try {
            const tenantId = localStorage.getItem('tenant_id') || 'tenant_demo';
            const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
            if (!token) {
                toast.error('Authentication required. Please log in.');
                return;
            }
            // Optional: Ask for additional notes
            const notes = typeof window !== 'undefined' ?
                window.prompt(`Send to ${vendorName}?\n\nOptional notes (leave blank if none):`) :
                null;
            if (notes === null) {
                // User cancelled
                return;
            }
            toast.loading(`Sending to ${vendorName}...`);
            const response = await fetch(`https://urutiq-backend-clean-11.onrender.com/api/purchase-orders/${purchaseOrderId}/send-to-vendor`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'x-tenant-id': tenantId,
                    'x-company-id': companyId,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ notes: notes || undefined })
            });
            if (!response.ok) {
                const errorData = await response.json();
                console.error('Send to vendor error:', response.status, errorData);
                throw new Error(errorData.message || `Failed to send: ${response.status} ${response.statusText}`);
            }
            const result = await response.json();
            toast.dismiss();
            toast.success(result.message || `Purchase order sent to ${vendorName}`);
            // Refresh the purchase orders list to show updated status
            await queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
        }
        catch (error) {
            console.error('Error sending to vendor:', error);
            toast.dismiss();
            toast.error(error?.message || 'Failed to send to vendor');
        }
    };
    /**
     * Handle marking purchase order as delivered
     */
    const handleMarkAsDelivered = async (order) => {
        try {
            const tenantId = localStorage.getItem('tenant_id') || 'tenant_demo';
            const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
            if (!token) {
                toast.error('Authentication required. Please log in.');
                return;
            }
            // Confirm the action
            const confirmed = typeof window !== 'undefined' ?
                window.confirm(`Mark Purchase Order ${order.poNumber} as delivered?\n\nThis will:\n- Update stock levels\n- Create journal entries\n- Mark the order as delivered`) :
                false;
            if (!confirmed) {
                return;
            }
            toast.loading(`Marking ${order.poNumber} as delivered...`);
            // Prepare delivery data
            const deliveryData = {
                deliveredDate: new Date().toISOString(),
                deliveredBy: 'System', // TODO: Get actual user name
                notes: `Marked as delivered on ${new Date().toLocaleDateString()}`,
                journalEntryData: {
                    memo: `Inventory delivered from PO ${order.poNumber}`,
                    reference: `PO-${order.poNumber}-DELIVERED`
                }
            };
            // Call the delivery API
            const response = await fetch(`https://urutiq-backend-clean-11.onrender.com/api/purchase-orders/${order.id}/deliver`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'x-tenant-id': tenantId,
                    'x-company-id': companyId,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(deliveryData)
            });
            if (!response.ok) {
                const errorData = await response.json();
                console.error('Mark as delivered error:', response.status, errorData);
                throw new Error(errorData.message || `Failed to mark as delivered: ${response.status} ${response.statusText}`);
            }
            const result = await response.json();
            toast.dismiss();
            toast.success(result.message || `Purchase order ${order.poNumber} marked as delivered successfully`);
            // Refresh the purchase orders list to show updated status
            await queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
        }
        catch (error) {
            console.error('Error marking as delivered:', error);
            toast.dismiss();
            toast.error(error?.message || 'Failed to mark as delivered');
        }
    };
    /**
     * Handle downloading good receipt PDF
     */
    const handleDownloadGoodReceipt = async (purchaseOrderId, poNumber) => {
        try {
            toast.loading(`Generating good receipt for ${poNumber}...`);
            const blob = await purchaseApi.downloadGoodReceiptPDF(purchaseOrderId);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `GoodReceipt-${poNumber}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            toast.dismiss();
            toast.success(`Good receipt for ${poNumber} downloaded successfully`);
        }
        catch (error) {
            console.error('Error downloading good receipt:', error);
            toast.dismiss();
            toast.error(error?.message || 'Failed to download good receipt');
        }
    };
    if (!authReady) {
        return (_jsx(PageLayout, { children: _jsx("div", { className: "flex items-center justify-center h-64", children: _jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" }) }) }));
    }
    return (_jsx(PageLayout, { children: _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold", children: "Purchase Orders" }), _jsx("p", { className: "text-gray-600", children: "Manage your purchase orders and procurement process" })] }), _jsx("div", { className: "flex items-center space-x-2", children: _jsxs(Button, { onClick: () => {
                                    setEditingOrder(null);
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
                                    });
                                    setIsCreateOpen(true);
                                }, children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), "New Purchase Order"] }) })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsx(Card, { children: _jsx(CardContent, { className: "pt-6", children: _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(FileText, { className: "w-5 h-5 text-blue-600" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Total Orders" }), _jsx("p", { className: "text-2xl font-bold text-gray-900", children: Array.isArray(purchaseOrders) ? purchaseOrders.length : 0 })] })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "pt-6", children: _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(DollarSign, { className: "w-5 h-5 text-green-600 flex-shrink-0" }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Total Value" }), _jsxs("p", { className: "text-lg font-bold text-gray-900 truncate", children: ["$", Array.isArray(purchaseOrders) ? purchaseOrders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : '0'] })] })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "pt-6", children: _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Truck, { className: "w-5 h-5 text-orange-600" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Pending Orders" }), _jsx("p", { className: "text-2xl font-bold text-gray-900", children: Array.isArray(purchaseOrders) ? purchaseOrders.filter(order => ['draft', 'sent'].includes(order.status)).length : 0 })] })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "pt-6", children: _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(CheckCircle, { className: "w-5 h-5 text-purple-600" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Completed Orders" }), _jsx("p", { className: "text-2xl font-bold text-gray-900", children: Array.isArray(purchaseOrders) ? purchaseOrders.filter(order => ['approved', 'delivered'].includes(order.status)).length : 0 })] })] }) }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Purchase Orders" }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "flex items-center space-x-4 mb-6", children: [_jsx("div", { className: "flex-1", children: _jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" }), _jsx(Input, { placeholder: "Search purchase orders...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "pl-10" })] }) }), _jsxs(Select, { value: statusFilter, onValueChange: setStatusFilter, children: [_jsx(SelectTrigger, { className: "w-48", children: _jsx(SelectValue, { placeholder: "Filter by status" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All Status" }), _jsx(SelectItem, { value: "draft", children: "Draft" }), _jsx(SelectItem, { value: "approved", children: "Approved" }), _jsx(SelectItem, { value: "delivered", children: "Delivered" }), _jsx(SelectItem, { value: "closed", children: "Closed" }), _jsx(SelectItem, { value: "cancelled", children: "Cancelled" })] })] })] }), ordersLoading ? (_jsx("div", { className: "flex items-center justify-center py-8", children: _jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" }) })) : (_jsx("div", { className: "overflow-hidden", children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { className: "w-[120px]", children: "PO Number" }), _jsx(TableHead, { className: "w-[200px]", children: "Vendor" }), _jsx(TableHead, { className: "w-[100px]", children: "Date" }), _jsx(TableHead, { className: "w-[120px]", children: "Amount" }), _jsx(TableHead, { className: "w-[100px]", children: "Status" }), _jsx(TableHead, { className: "w-[80px]", children: "Actions" })] }) }), _jsx(TableBody, { children: filteredOrders.length === 0 ? (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 6, className: "text-center py-8", children: _jsxs("div", { className: "text-gray-500", children: [_jsx(FileText, { className: "w-12 h-12 mx-auto mb-4 opacity-50" }), _jsx("p", { children: "No purchase orders found" }), _jsx("p", { className: "text-sm", children: "Create your first purchase order to get started" })] }) }) })) : (filteredOrders.map((order) => (_jsxs(TableRow, { children: [_jsx(TableCell, { className: "font-medium", children: order.poNumber }), _jsx(TableCell, { className: "truncate", title: order.vendor?.name || '-', children: order.vendor?.name || '-' }), _jsx(TableCell, { className: "text-sm text-gray-600", children: order.orderDate ? format(new Date(order.orderDate), 'MMM dd') : '-' }), _jsxs(TableCell, { className: "font-medium", children: ["$", order.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })] }), _jsx(TableCell, { children: _jsxs(Badge, { variant: getStatusColor(order.status), className: "flex items-center gap-1 w-fit", children: [getStatusIcon(order.status), order.status] }) }), _jsx(TableCell, { children: _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Button, { size: "sm", variant: "outline", onClick: () => {
                                                                            setSelectedOrder(order);
                                                                            setIsViewOpen(true);
                                                                        }, title: "View Details", className: "h-8 w-8 p-0", children: _jsx(Eye, { className: "w-4 h-4" }) }), order.status === 'approved' && (_jsx(Button, { size: "sm", variant: "default", onClick: async () => {
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
                                                                                }
                                                                                catch (error) {
                                                                                    console.error('Delivery failed:', error);
                                                                                    toast.error('Failed to deliver purchase order: ' + (error?.response?.data?.message || error.message || 'Unknown error'));
                                                                                }
                                                                            }
                                                                        }, title: "Mark as Delivered", className: "h-8 w-8 p-0 bg-green-600 hover:bg-green-700", children: _jsx(Package, { className: "w-4 h-4" }) })), _jsx(Button, { size: "sm", variant: "outline", disabled: order.status === 'closed' || order.status === 'cancelled', onClick: () => {
                                                                            setEditingOrder(order);
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
                                                                            });
                                                                            setIsCreateOpen(true);
                                                                        }, title: order.status === 'closed' || order.status === 'cancelled' ? 'Cannot edit closed or cancelled orders' : 'Edit Purchase Order', className: "h-8 w-8 p-0", children: _jsx(Edit, { className: "w-4 h-4" }) }), _jsxs(Select, { value: order.status, disabled: order.status === 'closed' || order.status === 'cancelled', onValueChange: async (newStatus) => {
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
                                                                                        const apiCompanyId = getCompanyId();
                                                                                        const tenantId = localStorage.getItem('tenant_id') || 'tenant_demo';
                                                                                        const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
                                                                                        const response = await fetch(`https://urutiq-backend-clean-11.onrender.com/api/purchase-orders/${order.id}/deliver`, {
                                                                                            method: 'POST',
                                                                                            headers: {
                                                                                                'Authorization': `Bearer ${token}`,
                                                                                                'x-tenant-id': tenantId,
                                                                                                'x-company-id': apiCompanyId,
                                                                                                'Content-Type': 'application/json',
                                                                                            },
                                                                                            body: JSON.stringify(deliveryData)
                                                                                        });
                                                                                        if (!response.ok) {
                                                                                            const errorData = await response.json();
                                                                                            throw new Error(errorData.message || `Failed to deliver: ${response.status} ${response.statusText}`);
                                                                                        }
                                                                                        toast.success('Purchase order delivered successfully! Inventory and accounting updated.');
                                                                                        // Refresh the data
                                                                                        await queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
                                                                                        return; // Exit early since delivery API already updated the status
                                                                                    }
                                                                                    catch (error) {
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
                                                                                });
                                                                            }
                                                                        }, children: [_jsx(SelectTrigger, { className: "w-[130px]", children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "draft", disabled: order.status === 'delivered' || order.status === 'approved', children: "Draft" }), _jsx(SelectItem, { value: "approved", disabled: order.status === 'delivered', children: "Approved" }), _jsx(SelectItem, { value: "delivered", children: "Delivered" }), _jsx(SelectItem, { value: "closed", children: "Closed" }), _jsx(SelectItem, { value: "cancelled", children: "Cancelled" })] })] }), _jsx(Button, { size: "sm", variant: "outline", disabled: order.status === 'closed' || order.status === 'cancelled', onClick: () => {
                                                                            if (confirm('Are you sure you want to delete this purchase order?')) {
                                                                                deleteOrder.mutate(order.id);
                                                                            }
                                                                        }, title: order.status === 'closed' || order.status === 'cancelled' ? 'Only draft orders can be deleted' : 'Delete Purchase Order', className: order.status === 'closed' || order.status === 'cancelled' ? 'opacity-50 cursor-not-allowed' : '', children: _jsx(Trash2, { className: "w-4 h-4" }) })] }) })] }, order.id)))) })] }) }))] })] }), _jsx(Dialog, { open: isCreateOpen, onOpenChange: (open) => {
                        setIsCreateOpen(open);
                        if (!open) {
                            setEditingOrder(null);
                            form.reset();
                        }
                    }, children: _jsxs(DialogContent, { className: "max-w-7xl max-h-[90vh] overflow-y-auto ", children: [_jsx(DialogHeader, { children: _jsxs("div", { className: "flex items-start justify-between gap-4", children: [_jsx(DialogTitle, { children: editingOrder ? (_jsxs("span", { children: ["Edit Purchase Order", editingOrder.poNumber ? (_jsxs("span", { className: "ml-2 text-sm font-normal text-muted-foreground", children: ["#", editingOrder.poNumber] })) : null] })) : ('Create Purchase Order') }), editingOrder ? (_jsxs(Badge, { variant: getStatusColor(editingOrder.status), className: "mt-1 flex items-center gap-1 w-fit", children: [getStatusIcon(editingOrder.status), editingOrder.status] })) : null] }) }), editingOrder ? (_jsxs("div", { className: "mb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm", children: [_jsxs("div", { className: "p-3 border rounded-md bg-white/50", children: [_jsx("div", { className: "text-muted-foreground", children: "Vendor" }), _jsx("div", { className: "font-medium", children: editingOrder.vendor?.name || '-' })] }), _jsxs("div", { className: "p-3 border rounded-md bg-white/50", children: [_jsx("div", { className: "text-muted-foreground", children: "Order Date" }), _jsx("div", { className: "font-medium", children: editingOrder.orderDate ? format(new Date(editingOrder.orderDate), 'MMM dd, yyyy') : '-' })] }), _jsxs("div", { className: "p-3 border rounded-md bg-white/50", children: [_jsx("div", { className: "text-muted-foreground", children: "Expected Delivery" }), _jsx("div", { className: "font-medium", children: editingOrder.expectedDelivery ? format(new Date(editingOrder.expectedDelivery), 'MMM dd, yyyy') : '-' })] }), _jsxs("div", { className: "p-3 border rounded-md bg-white/50", children: [_jsx("div", { className: "text-muted-foreground", children: "Current Total" }), _jsxs("div", { className: "font-semibold", children: ["$", (editingOrder.totalAmount || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })] })] })] })) : null, _jsx(Form, { ...form, children: _jsxs("form", { onSubmit: form.handleSubmit(onSubmit), className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4", children: [_jsx(FormField, { control: form.control, name: "companyId", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Company" }), _jsxs(Select, { value: field.value, onValueChange: field.onChange, children: [_jsx(FormControl, { children: _jsx(SelectTrigger, { className: "w-full", children: _jsx(SelectValue, { placeholder: "Select company" }) }) }), _jsx(SelectContent, { children: companies?.map((company) => (_jsx(SelectItem, { value: company.id, children: company.name }, company.id))) })] }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: form.control, name: "vendorId", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Vendor" }), _jsxs("div", { className: "flex gap-2 items-start", children: [_jsxs(Select, { onValueChange: field.onChange, value: field.value, children: [_jsx(FormControl, { children: _jsx(SelectTrigger, { className: "w-full", children: _jsx(SelectValue, { placeholder: "Select a vendor" }) }) }), _jsx(SelectContent, { children: vendors?.map((vendor) => (_jsx(SelectItem, { value: vendor.id, children: vendor.name }, vendor.id))) })] }), _jsx(Button, { type: "button", variant: "outline", size: "sm", onClick: async () => {
                                                                            const name = typeof window !== 'undefined' ? window.prompt('New vendor name') : '';
                                                                            if (!name)
                                                                                return;
                                                                            try {
                                                                                await purchaseApi.createVendor({ name, companyId });
                                                                                toast.success('Vendor created');
                                                                                await queryClient.invalidateQueries({ queryKey: ['vendors'] });
                                                                            }
                                                                            catch (e) {
                                                                                toast.error(e?.message || 'Failed to create vendor');
                                                                            }
                                                                        }, children: "Add" })] }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: form.control, name: "poNumber", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "PO Number" }), _jsx(FormControl, { children: _jsx(Input, { placeholder: "PO-2024-001", ...field }) }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: form.control, name: "orderDate", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Order Date" }), _jsx(FormControl, { children: _jsx(Input, { type: "date", ...field }) }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: form.control, name: "expectedDelivery", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Expected Delivery" }), _jsx(FormControl, { children: _jsx(Input, { type: "date", ...field }) }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: form.control, name: "orderSource", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Order Source" }), _jsxs(Select, { value: field.value, onValueChange: field.onChange, children: [_jsx(FormControl, { children: _jsx(SelectTrigger, { className: "w-full", children: _jsx(SelectValue, { placeholder: "Select order source" }) }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "internal", children: "Internal" }), _jsx(SelectItem, { value: "external", children: "External" })] })] }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: form.control, name: "currency", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Currency" }), _jsxs(Select, { value: field.value, onValueChange: field.onChange, children: [_jsx(FormControl, { children: _jsx(SelectTrigger, { className: "w-full", children: _jsx(SelectValue, { placeholder: "Select currency" }) }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "USD", children: "USD" }), _jsx(SelectItem, { value: "EUR", children: "EUR" }), _jsx(SelectItem, { value: "GBP", children: "GBP" }), _jsx(SelectItem, { value: "RWF", children: "RWF" })] })] }), _jsx(FormMessage, {})] })) })] }), _jsx(FormField, { control: form.control, name: "notes", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Notes" }), _jsx(FormControl, { children: _jsx(Textarea, { placeholder: "Additional notes...", ...field }) }), _jsx(FormMessage, {})] })) }), _jsxs("div", { className: "space-y-4", children: [_jsx("div", { className: "flex items-center justify-between", children: _jsx("h3", { className: "text-lg font-medium", children: "Line Items" }) }), _jsx("div", { className: "overflow-x-auto", children: form.watch('lines').map((_, index) => (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 p-5 border rounded-lg min-w-[1100px]", children: [_jsx(FormField, { control: form.control, name: `lines.${index}.productId`, render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Product" }), _jsxs("div", { className: "flex gap-2 items-start", children: [_jsxs(Select, { value: field.value, onValueChange: (value) => {
                                                                                        field.onChange(value);
                                                                                        const product = products?.find(p => p.id === value);
                                                                                        if (product) {
                                                                                            form.setValue(`lines.${index}.description`, product.name);
                                                                                            form.setValue(`lines.${index}.unitPrice`, product.unitPrice);
                                                                                        }
                                                                                    }, children: [_jsx(FormControl, { children: _jsx(SelectTrigger, { className: "w-full", children: _jsx(SelectValue, { placeholder: "Select product", children: (() => {
                                                                                                        const selectedId = form.getValues(`lines.${index}.productId`);
                                                                                                        const selectedProduct = products?.find(p => p.id === selectedId);
                                                                                                        return selectedProduct ? selectedProduct.name : "Select product";
                                                                                                    })() }) }) }), _jsx(SelectContent, { children: products?.map((product) => (_jsx(SelectItem, { value: product.id, disabled: product.status === 'DISCONTINUED', children: _jsxs("div", { children: [_jsx("div", { className: "font-semibold", children: product.name }), _jsxs("div", { className: "text-xs text-muted-foreground", children: [product.stockQuantity, " in stock", product.status === 'INACTIVE' && ' (Inactive)'] })] }) }, product.id))) })] }), _jsx(Button, { type: "button", variant: "outline", size: "sm", onClick: async () => {
                                                                                        const name = typeof window !== 'undefined' ? window.prompt('New product name') : '';
                                                                                        if (!name)
                                                                                            return;
                                                                                        try {
                                                                                            const created = await inventoryApi.createProduct({ name, companyId, unitPrice: 0, costPrice: 0, sku: `SKU-${Date.now()}` });
                                                                                            toast.success('Product created');
                                                                                            await queryClient.invalidateQueries({ queryKey: ['products'] });
                                                                                            form.setValue(`lines.${index}.productId`, created.id);
                                                                                            form.setValue(`lines.${index}.description`, created.name);
                                                                                        }
                                                                                        catch (e) {
                                                                                            toast.error(e?.message || 'Failed to create product');
                                                                                        }
                                                                                    }, children: "Add" })] }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: form.control, name: `lines.${index}.description`, render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Description" }), _jsx(FormControl, { children: _jsx(Input, { placeholder: "Item description", ...field }) }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: form.control, name: `lines.${index}.quantity`, render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Quantity" }), _jsx(FormControl, { children: _jsx(Input, { type: "number", placeholder: "1", ...field }) }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Enter the number of units" }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: form.control, name: `lines.${index}.unitPrice`, render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Unit Price" }), _jsx(FormControl, { children: _jsx(Input, { type: "number", placeholder: "0.00", ...field }) }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Price per unit before tax" }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: form.control, name: `lines.${index}.taxRate`, render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Tax Rate (%)" }), _jsx(FormControl, { children: _jsx(Input, { type: "number", placeholder: "0", ...field }) }), _jsx("p", { className: "text-xs text-muted-foreground", children: "e.g., 18 for 18%" }), _jsx(FormMessage, {})] })) }), _jsxs("div", { className: "flex items-end justify-between", children: [_jsxs("div", { className: "text-right ml-auto", children: [_jsx("div", { className: "text-xs text-muted-foreground", children: "Line Total" }), _jsx("div", { className: "font-semibold", children: (() => {
                                                                                    const l = form.getValues('lines')[index] || {};
                                                                                    const qty = Number(l?.quantity || 0);
                                                                                    const price = Number(l?.unitPrice || 0);
                                                                                    const base = qty * price;
                                                                                    const tax = base * (Number(l?.taxRate || 0) / 100);
                                                                                    return `$${(base + tax).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
                                                                                })() })] }), _jsx("div", { className: "flex items-end", children: _jsx(Button, { type: "button", variant: "outline", size: "sm", onClick: () => {
                                                                                const lines = form.getValues('lines');
                                                                                if (lines.length > 1) {
                                                                                    form.setValue('lines', lines.filter((_, i) => i !== index));
                                                                                }
                                                                            }, children: _jsx(Trash2, { className: "w-4 h-4" }) }) })] })] }, index))) }), _jsxs(Button, { type: "button", variant: "outline", onClick: () => {
                                                        const lines = form.getValues('lines');
                                                        form.setValue('lines', [...lines, { description: '', quantity: 1, unitPrice: 0, taxRate: 0 }]);
                                                    }, children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), "Add Line Item"] })] }), _jsxs("div", { className: "border rounded-lg p-4 grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white/50", children: [_jsxs("div", { children: [_jsx("div", { className: "text-sm text-muted-foreground", children: "Subtotal" }), _jsxs("div", { className: "text-xl font-semibold", children: ["$", totals.subtotal.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })] })] }), _jsxs("div", { children: [_jsx("div", { className: "text-sm text-muted-foreground", children: "Tax" }), _jsxs("div", { className: "text-xl font-semibold", children: ["$", totals.tax.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })] })] }), _jsxs("div", { children: [_jsx("div", { className: "text-sm text-muted-foreground", children: "Total" }), _jsxs("div", { className: "text-2xl font-bold", children: ["$", totals.total.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })] })] })] }), _jsxs("div", { className: "flex justify-end space-x-2 sticky bottom-0 bg-white/70 py-3", children: [_jsx(Button, { type: "button", variant: "outline", onClick: () => setIsCreateOpen(false), children: "Cancel" }), _jsx(Button, { type: "submit", disabled: createOrder.isPending || updateOrder.isPending, children: createOrder.isPending || updateOrder.isPending
                                                        ? (editingOrder ? 'Updating...' : 'Creating...')
                                                        : (editingOrder ? 'Update Order' : 'Create Order') })] })] }) })] }) }), _jsx(Dialog, { open: isViewOpen, onOpenChange: (open) => {
                        setIsViewOpen(open);
                        if (!open) {
                            setSelectedOrder(null);
                        }
                    }, children: _jsxs(DialogContent, { className: "max-w-4xl max-h-[90vh] overflow-y-auto", children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { children: "Purchase Order Details" }) }), orderDetailsLoading ? (_jsx("div", { className: "flex items-center justify-center py-8", children: _jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" }) })) : orderDetails ? (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-500", children: "PO Number" }), _jsx("p", { className: "text-lg font-medium", children: orderDetails.poNumber })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-500", children: "Vendor" }), _jsx("p", { className: "text-lg", children: orderDetails.vendor?.name || '-' })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-500", children: "Order Date" }), _jsx("p", { className: "text-lg", children: orderDetails.orderDate ? format(new Date(orderDetails.orderDate), 'MMM dd, yyyy') : '-' })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-500", children: "Expected Delivery" }), _jsx("p", { className: "text-lg", children: orderDetails.expectedDelivery ? format(new Date(orderDetails.expectedDelivery), 'MMM dd, yyyy') : '-' })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-500", children: "Total Amount" }), _jsxs("p", { className: "text-lg font-bold text-green-600", children: ["$", orderDetails.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })] })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-500", children: "Status" }), _jsx("div", { className: "mt-1", children: _jsxs(Badge, { variant: getStatusColor(orderDetails.status), className: "flex items-center gap-1 w-fit", children: [getStatusIcon(orderDetails.status), orderDetails.status] }) })] })] }), orderDetails.notes && (_jsxs("div", { className: "space-y-4", children: [_jsx(Separator, {}), _jsx("h3", { className: "text-lg font-medium", children: "Notes" }), _jsx("p", { className: "text-lg", children: orderDetails.notes })] })), _jsxs("div", { className: "space-y-4", children: [_jsx(Separator, {}), _jsx("h3", { className: "text-lg font-medium", children: "Line Items" }), _jsx("div", { className: "overflow-x-auto", children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { children: "Description" }), _jsx(TableHead, { children: "Quantity" }), _jsx(TableHead, { children: "Unit Price" }), _jsx(TableHead, { children: "Tax Rate" }), _jsx(TableHead, { children: "Total" })] }) }), _jsx(TableBody, { children: orderDetails.lines.map((line) => (_jsxs(TableRow, { children: [_jsx(TableCell, { children: line.description }), _jsx(TableCell, { children: line.quantity }), _jsxs(TableCell, { children: ["$", line.unitPrice.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })] }), _jsxs(TableCell, { children: [line.taxRate, "%"] }), _jsxs(TableCell, { children: ["$", (line.lineTotal || (line.quantity * line.unitPrice)).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })] })] }, line.id))) })] }) })] }), _jsxs("div", { className: "space-y-4", children: [_jsx(Separator, {}), _jsx("h3", { className: "text-lg font-medium", children: "Timestamps" }), _jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-500", children: "Created" }), _jsx("p", { className: "text-lg", children: orderDetails.createdAt ? format(new Date(orderDetails.createdAt), 'MMM dd, yyyy HH:mm') : '-' })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-500", children: "Last Updated" }), _jsx("p", { className: "text-lg", children: orderDetails.updatedAt ? format(new Date(orderDetails.updatedAt), 'MMM dd, yyyy HH:mm') : '-' })] })] })] })] })) : (_jsx("div", { className: "text-center py-8", children: _jsx("p", { className: "text-gray-500", children: "No purchase order details found" }) }))] }) })] }) }));
}
