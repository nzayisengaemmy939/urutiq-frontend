import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Search, Eye, Edit, Trash2, CheckCircle, AlertCircle, Building2, Receipt, Package, DollarSign, TrendingUp, RefreshCw, BarChart3, Activity } from 'lucide-react';
import { purchaseApi } from '@/lib/api/accounting';
export function PurchaseExpenseDashboard() {
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // Data states
    const [bills, setBills] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [products, setProducts] = useState([]);
    const [expenses, setExpenses] = useState([]);
    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [vendorFilter, setVendorFilter] = useState('all');
    const [dateRange, setDateRange] = useState('30');
    // Dialog states
    const [showBillDialog, setShowBillDialog] = useState(false);
    const [showVendorDialog, setShowVendorDialog] = useState(false);
    const [showProductDialog, setShowProductDialog] = useState(false);
    const [selectedBill, setSelectedBill] = useState(null);
    const [selectedVendor, setSelectedVendor] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    // Load data on component mount
    useEffect(() => {
        loadData();
    }, []);
    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const [billsData, vendorsData, productsData] = await Promise.all([
                purchaseApi.getBills(),
                purchaseApi.getVendors(),
                purchaseApi.getProducts()
            ]);
            setBills(billsData.bills || []);
            setVendors(vendorsData);
            setProducts(productsData);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load data');
        }
        finally {
            setLoading(false);
        }
    }, []);
    // Calculate summary statistics
    const summary = useMemo(() => {
        const totalBills = bills.length;
        const totalVendors = vendors.length;
        const totalProducts = products.length;
        const pendingBills = bills.filter(bill => bill.status === 'draft').length;
        const overdueBills = bills.filter(bill => bill.dueDate && new Date(bill.dueDate) < new Date() && bill.status !== 'paid').length;
        const monthlySpending = bills
            .filter(bill => {
            const billDate = new Date(bill.billDate);
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            return billDate >= thirtyDaysAgo;
        })
            .reduce((sum, bill) => sum + bill.totalAmount, 0);
        // Calculate top vendors
        const vendorTotals = bills.reduce((acc, bill) => {
            const vendorName = bill.vendor?.name || 'Unknown';
            acc[vendorName] = (acc[vendorName] || 0) + bill.totalAmount;
            return acc;
        }, {});
        const topVendors = Object.entries(vendorTotals)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([vendor, amount]) => ({
            vendor,
            amount,
            percentage: (amount / Object.values(vendorTotals).reduce((sum, val) => sum + val, 0)) * 100
        }));
        return {
            totalBills,
            totalVendors,
            totalProducts,
            pendingBills,
            overdueBills,
            monthlySpending,
            topVendors,
            topCategories: [] // Would need expense categories data
        };
    }, [bills, vendors, products]);
    // Filter bills based on search and filters
    const filteredBills = useMemo(() => {
        return bills.filter(bill => {
            const matchesSearch = searchTerm === '' ||
                bill.billNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                bill.vendor?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                bill.lines.some(line => line.description.toLowerCase().includes(searchTerm.toLowerCase()));
            const matchesStatus = statusFilter === 'all' || bill.status === statusFilter;
            const matchesVendor = vendorFilter === 'all' || bill.vendorId === vendorFilter;
            return matchesSearch && matchesStatus && matchesVendor;
        });
    }, [bills, searchTerm, statusFilter, vendorFilter]);
    const handlePostBill = async (billId) => {
        try {
            await purchaseApi.postBill(billId);
            await loadData(); // Reload data to get updated status
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to post bill');
        }
    };
    const handleDeleteBill = async (billId) => {
        if (confirm('Are you sure you want to delete this bill?')) {
            try {
                await purchaseApi.deleteBill(billId);
                await loadData();
            }
            catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to delete bill');
            }
        }
    };
    if (loading) {
        return (_jsx("div", { className: "flex items-center justify-center h-64", children: _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(RefreshCw, { className: "h-6 w-6 animate-spin" }), _jsx("span", { children: "Loading purchase and expense data..." })] }) }));
    }
    if (error) {
        return (_jsxs(Alert, { variant: "destructive", children: [_jsx(AlertCircle, { className: "h-4 w-4" }), _jsx(AlertDescription, { children: error }), _jsxs(Button, { variant: "outline", size: "sm", onClick: loadData, className: "ml-2", children: [_jsx(RefreshCw, { className: "h-4 w-4 mr-2" }), "Retry"] })] }));
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold tracking-tight", children: "Purchase & Expense Management" }), _jsx("p", { className: "text-muted-foreground", children: "Manage vendors, bills, products, and track expenses" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsxs(Button, { variant: "outline", onClick: loadData, children: [_jsx(RefreshCw, { className: "h-4 w-4 mr-2" }), "Refresh"] }), _jsxs(Button, { onClick: () => setShowBillDialog(true), children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "New Bill"] })] })] }), _jsxs("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-4", children: [_jsxs(Card, { className: "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200", children: [_jsx(CardHeader, { className: "pb-3", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx(CardTitle, { className: "text-sm font-medium text-blue-800", children: "Total Bills" }), _jsx(Receipt, { className: "h-5 w-5 text-blue-600" })] }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-3xl font-bold text-blue-900", children: summary.totalBills }), _jsxs("div", { className: "flex items-center gap-2 mt-2", children: [_jsx("div", { className: "w-2 h-2 bg-blue-500 rounded-full" }), _jsxs("p", { className: "text-sm text-blue-700", children: [summary.pendingBills, " pending"] })] })] })] }), _jsxs(Card, { className: "bg-gradient-to-br from-green-50 to-green-100 border-green-200", children: [_jsx(CardHeader, { className: "pb-3", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx(CardTitle, { className: "text-sm font-medium text-green-800", children: "Vendors" }), _jsx(Building2, { className: "h-5 w-5 text-green-600" })] }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-3xl font-bold text-green-900", children: summary.totalVendors }), _jsxs("div", { className: "flex items-center gap-2 mt-2", children: [_jsx("div", { className: "w-2 h-2 bg-green-500 rounded-full" }), _jsx("p", { className: "text-sm text-green-700", children: "Active suppliers" })] })] })] }), _jsxs(Card, { className: "bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200", children: [_jsx(CardHeader, { className: "pb-3", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx(CardTitle, { className: "text-sm font-medium text-purple-800", children: "Products" }), _jsx(Package, { className: "h-5 w-5 text-purple-600" })] }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-3xl font-bold text-purple-900", children: summary.totalProducts }), _jsxs("div", { className: "flex items-center gap-2 mt-2", children: [_jsx("div", { className: "w-2 h-2 bg-purple-500 rounded-full" }), _jsx("p", { className: "text-sm text-purple-700", children: "Inventory items" })] })] })] }), _jsxs(Card, { className: "bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200", children: [_jsx(CardHeader, { className: "pb-3", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx(CardTitle, { className: "text-sm font-medium text-amber-800", children: "Monthly Spending" }), _jsx(DollarSign, { className: "h-5 w-5 text-amber-600" })] }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "text-3xl font-bold text-amber-900", children: ["$", summary.monthlySpending.toLocaleString()] }), _jsxs("div", { className: "flex items-center gap-2 mt-2", children: [_jsx(TrendingUp, { className: "h-4 w-4 text-amber-600" }), _jsx("p", { className: "text-sm text-amber-700", children: "Last 30 days" })] })] })] })] }), _jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, className: "space-y-4", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-4", children: [_jsxs(TabsTrigger, { value: "overview", className: "flex items-center gap-2", children: [_jsx(BarChart3, { className: "h-4 w-4" }), "Overview"] }), _jsxs(TabsTrigger, { value: "bills", className: "flex items-center gap-2", children: [_jsx(Receipt, { className: "h-4 w-4" }), "Bills"] }), _jsxs(TabsTrigger, { value: "vendors", className: "flex items-center gap-2", children: [_jsx(Building2, { className: "h-4 w-4" }), "Vendors"] }), _jsxs(TabsTrigger, { value: "products", className: "flex items-center gap-2", children: [_jsx(Package, { className: "h-4 w-4" }), "Products"] })] }), _jsx(TabsContent, { value: "overview", className: "space-y-4", children: _jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(TrendingUp, { className: "h-5 w-5" }), "Top Vendors by Spending"] }), _jsx(CardDescription, { children: "Vendors with highest bill amounts" })] }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-3", children: summary.topVendors.map((vendor, index) => (_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium", children: index + 1 }), _jsx("span", { className: "font-medium", children: vendor.vendor })] }), _jsxs("div", { className: "text-right", children: [_jsxs("div", { className: "font-semibold", children: ["$", vendor.amount.toLocaleString()] }), _jsxs("div", { className: "text-sm text-muted-foreground", children: [vendor.percentage.toFixed(1), "%"] })] })] }, vendor.vendor))) }) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Activity, { className: "h-5 w-5" }), "Recent Activity"] }), _jsx(CardDescription, { children: "Latest bills and updates" })] }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-3", children: bills.slice(0, 5).map((bill) => (_jsxs("div", { className: "flex items-center justify-between p-3 bg-muted/50 rounded-lg", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-2 h-2 rounded-full bg-primary" }), _jsxs("div", { children: [_jsx("div", { className: "font-medium", children: bill.billNumber }), _jsx("div", { className: "text-sm text-muted-foreground", children: bill.vendor?.name })] })] }), _jsxs("div", { className: "text-right", children: [_jsxs("div", { className: "font-semibold", children: ["$", bill.totalAmount.toLocaleString()] }), _jsx(Badge, { variant: bill.status === 'posted' ? 'default' : 'secondary', children: bill.status })] })] }, bill.id))) }) })] })] }) }), _jsxs(TabsContent, { value: "bills", className: "space-y-4", children: [_jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex flex-wrap items-center gap-4", children: [_jsx("div", { className: "flex-1 min-w-[300px]", children: _jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" }), _jsx(Input, { placeholder: "Search bills by number, vendor, or description...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "pl-10" })] }) }), _jsxs(Select, { value: statusFilter, onValueChange: setStatusFilter, children: [_jsx(SelectTrigger, { className: "w-[150px]", children: _jsx(SelectValue, { placeholder: "Status" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All Status" }), _jsx(SelectItem, { value: "draft", children: "Draft" }), _jsx(SelectItem, { value: "posted", children: "Posted" }), _jsx(SelectItem, { value: "paid", children: "Paid" }), _jsx(SelectItem, { value: "cancelled", children: "Cancelled" })] })] }), _jsxs(Select, { value: vendorFilter, onValueChange: setVendorFilter, children: [_jsx(SelectTrigger, { className: "w-[200px]", children: _jsx(SelectValue, { placeholder: "Vendor" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All Vendors" }), vendors.map((vendor) => (_jsx(SelectItem, { value: vendor.id, children: vendor.name }, vendor.id)))] })] })] }) }) }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Bills" }), _jsxs(CardDescription, { children: [filteredBills.length, " bills found"] })] }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [filteredBills.map((bill) => (_jsxs("div", { className: "flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center", children: _jsx(Receipt, { className: "h-6 w-6 text-primary" }) }), _jsxs("div", { children: [_jsx("div", { className: "font-medium", children: bill.billNumber }), _jsxs("div", { className: "text-sm text-muted-foreground", children: [bill.vendor?.name, " \u2022 ", new Date(bill.billDate).toLocaleDateString()] }), _jsxs("div", { className: "text-sm text-muted-foreground", children: [bill.lines.length, " line items"] })] })] }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("div", { className: "text-right", children: [_jsxs("div", { className: "font-semibold", children: ["$", bill.totalAmount.toLocaleString()] }), _jsxs("div", { className: "text-sm text-muted-foreground", children: ["Due: ", bill.dueDate ? new Date(bill.dueDate).toLocaleDateString() : 'No due date'] })] }), _jsx(Badge, { variant: bill.status === 'posted' ? 'default' :
                                                                        bill.status === 'draft' ? 'secondary' :
                                                                            bill.status === 'paid' ? 'default' :
                                                                                'destructive', children: bill.status }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Button, { variant: "ghost", size: "sm", onClick: () => setSelectedBill(bill), children: _jsx(Eye, { className: "h-4 w-4" }) }), bill.status === 'draft' && (_jsxs(_Fragment, { children: [_jsx(Button, { variant: "ghost", size: "sm", onClick: () => handlePostBill(bill.id), children: _jsx(CheckCircle, { className: "h-4 w-4" }) }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => handleDeleteBill(bill.id), children: _jsx(Trash2, { className: "h-4 w-4" }) })] }))] })] })] }, bill.id))), filteredBills.length === 0 && (_jsx("div", { className: "text-center py-8 text-muted-foreground", children: "No bills found matching your criteria" }))] }) })] })] }), _jsx(TabsContent, { value: "vendors", className: "space-y-4", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx(CardTitle, { children: "Vendors" }), _jsxs(CardDescription, { children: [vendors.length, " vendors in your system"] })] }), _jsxs(Button, { onClick: () => setShowVendorDialog(true), children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "Add Vendor"] })] }) }), _jsx(CardContent, { children: _jsx("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-3", children: vendors.map((vendor) => (_jsxs("div", { className: "p-4 border rounded-lg hover:bg-muted/50 transition-colors", children: [_jsxs("div", { className: "flex items-center gap-3 mb-3", children: [_jsx("div", { className: "w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center", children: _jsx(Building2, { className: "h-5 w-5 text-primary" }) }), _jsxs("div", { children: [_jsx("div", { className: "font-medium", children: vendor.name }), _jsx("div", { className: "text-sm text-muted-foreground", children: vendor.email || 'No email' })] })] }), vendor.phone && (_jsxs("div", { className: "text-sm text-muted-foreground mb-2", children: ["\uD83D\uDCDE ", vendor.phone] })), vendor.address && (_jsxs("div", { className: "text-sm text-muted-foreground mb-3", children: ["\uD83D\uDCCD ", vendor.address] })), _jsx("div", { className: "flex items-center gap-2", children: _jsxs(Button, { variant: "ghost", size: "sm", onClick: () => setSelectedVendor(vendor), children: [_jsx(Edit, { className: "h-4 w-4 mr-2" }), "Edit"] }) })] }, vendor.id))) }) })] }) }), _jsx(TabsContent, { value: "products", className: "space-y-4", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx(CardTitle, { children: "Products" }), _jsxs(CardDescription, { children: [products.length, " products in your inventory"] })] }), _jsxs(Button, { onClick: () => setShowProductDialog(true), children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "Add Product"] })] }) }), _jsx(CardContent, { children: _jsx("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-3", children: products.map((product) => (_jsxs("div", { className: "p-4 border rounded-lg hover:bg-muted/50 transition-colors", children: [_jsxs("div", { className: "flex items-center gap-3 mb-3", children: [_jsx("div", { className: "w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center", children: _jsx(Package, { className: "h-5 w-5 text-primary" }) }), _jsxs("div", { children: [_jsx("div", { className: "font-medium", children: product.name }), _jsxs("div", { className: "text-sm text-muted-foreground", children: ["SKU: ", product.sku] })] })] }), _jsxs("div", { className: "space-y-2 mb-3", children: [_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { children: "Type:" }), _jsx(Badge, { variant: "outline", children: product.type })] }), _jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { children: "Price:" }), _jsxs("span", { className: "font-medium", children: ["$", product.unitPrice.toLocaleString()] })] }), _jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { children: "Cost:" }), _jsxs("span", { className: "font-medium", children: ["$", product.costPrice.toLocaleString()] })] }), product.type === 'inventory' && (_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { children: "Stock:" }), _jsx("span", { className: "font-medium", children: product.stockQuantity })] }))] }), _jsx("div", { className: "flex items-center gap-2", children: _jsxs(Button, { variant: "ghost", size: "sm", onClick: () => setSelectedProduct(product), children: [_jsx(Edit, { className: "h-4 w-4 mr-2" }), "Edit"] }) })] }, product.id))) }) })] }) })] }), showBillDialog && (_jsxs(Alert, { children: [_jsx(AlertCircle, { className: "h-4 w-4" }), _jsx(AlertDescription, { children: "Bill creation dialog would be implemented here with a form for bill details, line items, etc." })] }))] }));
}
