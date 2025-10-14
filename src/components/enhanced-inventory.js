import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { useToast } from "../hooks/use-toast";
import { Plus, Search, Filter, Eye, Edit, Package, AlertTriangle, TrendingUp, MapPin, QrCode, Scan, Download, Upload, Settings, Bell, ArrowRightLeft, Hash, Calendar, DollarSign } from "lucide-react";
export function EnhancedInventory() {
    const [products, setProducts] = useState([]);
    const [locations, setLocations] = useState([]);
    const [movements, setMovements] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedLocation, setSelectedLocation] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const { toast } = useToast();
    useEffect(() => {
        loadData();
    }, []);
    const loadData = async () => {
        setLoading(true);
        try {
            const [productsRes, locationsRes, movementsRes, alertsRes, analyticsRes] = await Promise.all([
                fetch('/api/products'),
                fetch('/api/locations'),
                fetch('/api/movements'),
                fetch('/api/alerts'),
                fetch('/api/analytics'),
            ]);
            if (productsRes.ok) {
                const productsData = await productsRes.json();
                setProducts(productsData.items || productsData);
            }
            if (locationsRes.ok) {
                const locationsData = await locationsRes.json();
                setLocations(locationsData);
            }
            if (movementsRes.ok) {
                const movementsData = await movementsRes.json();
                setMovements(movementsData.items || movementsData);
            }
            if (alertsRes.ok) {
                const alertsData = await alertsRes.json();
                setAlerts(alertsData);
            }
            if (analyticsRes.ok) {
                const analyticsData = await analyticsRes.json();
                setAnalytics(analyticsData);
            }
        }
        catch (error) {
            console.error('Error loading data:', error);
            toast({
                title: "Error",
                description: "Failed to load inventory data",
                variant: "destructive"
            });
        }
        finally {
            setLoading(false);
        }
    };
    const filteredProducts = products.filter(product => {
        const matchesSearch = !searchTerm ||
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.sku.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = !selectedCategory || product.category === selectedCategory;
        const matchesStatus = !selectedStatus || product.status === selectedStatus;
        const matchesLocation = !selectedLocation ||
            product.locations.some(loc => loc.locationId === selectedLocation);
        return matchesSearch && matchesCategory && matchesStatus && matchesLocation;
    });
    const getStatusBadge = (product) => {
        if (product.stockQuantity <= 0) {
            return _jsx(Badge, { variant: "destructive", children: "Out of Stock" });
        }
        if (product.reorderPoint && product.stockQuantity <= product.reorderPoint) {
            return _jsx(Badge, { variant: "secondary", children: "Low Stock" });
        }
        if (product.maxStockLevel && product.stockQuantity >= product.maxStockLevel) {
            return _jsx(Badge, { variant: "outline", children: "Overstock" });
        }
        return _jsx(Badge, { variant: "default", children: "In Stock" });
    };
    const getAlertIcon = (alertType) => {
        switch (alertType) {
            case 'LOW_STOCK':
                return _jsx(AlertTriangle, { className: "w-4 h-4 text-amber-600" });
            case 'OUT_OF_STOCK':
                return _jsx(AlertTriangle, { className: "w-4 h-4 text-red-600" });
            case 'OVERSTOCK':
                return _jsx(TrendingUp, { className: "w-4 h-4 text-blue-600" });
            case 'EXPIRING_SOON':
                return _jsx(Calendar, { className: "w-4 h-4 text-orange-600" });
            case 'EXPIRED':
                return _jsx(Calendar, { className: "w-4 h-4 text-red-600" });
            default:
                return _jsx(Bell, { className: "w-4 h-4 text-gray-600" });
        }
    };
    const getMovementIcon = (movementType) => {
        switch (movementType) {
            case 'INBOUND':
                return _jsx(TrendingUp, { className: "w-4 h-4 text-green-600" });
            case 'OUTBOUND':
                return _jsx(TrendingUp, { className: "w-4 h-4 text-red-600 rotate-180" });
            case 'TRANSFER_IN':
                return _jsx(ArrowRightLeft, { className: "w-4 h-4 text-blue-600" });
            case 'TRANSFER_OUT':
                return _jsx(ArrowRightLeft, { className: "w-4 h-4 text-blue-600 rotate-180" });
            case 'ADJUSTMENT_IN':
                return _jsx(Plus, { className: "w-4 h-4 text-green-600" });
            case 'ADJUSTMENT_OUT':
                return _jsx(Plus, { className: "w-4 h-4 text-red-600 rotate-45" });
            default:
                return _jsx(Package, { className: "w-4 h-4 text-gray-600" });
        }
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-balance", children: "Enhanced Inventory Management" }), _jsx("p", { className: "text-muted-foreground", children: "Advanced inventory tracking with multi-location support, serial numbers, and AI insights" })] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { variant: "outline", children: [_jsx(Scan, { className: "w-4 h-4 mr-2" }), "Scan Barcode"] }), _jsxs(Button, { variant: "outline", children: [_jsx(Download, { className: "w-4 h-4 mr-2" }), "Export"] }), _jsxs(Button, { variant: "outline", children: [_jsx(Upload, { className: "w-4 h-4 mr-2" }), "Import"] }), _jsxs(Button, { children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), "Add Product"] })] })] }), analytics && (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center", children: _jsx(Package, { className: "w-5 h-5 text-blue-600" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-muted-foreground", children: "Total Products" }), _jsx("p", { className: "text-xl font-bold", children: analytics.totalProducts })] })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center", children: _jsx(DollarSign, { className: "w-5 h-5 text-green-600" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-muted-foreground", children: "Inventory Value" }), _jsxs("p", { className: "text-xl font-bold", children: ["$", analytics.totalValue.toLocaleString()] })] })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center", children: _jsx(AlertTriangle, { className: "w-5 h-5 text-amber-600" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-muted-foreground", children: "Low Stock Items" }), _jsx("p", { className: "text-xl font-bold", children: analytics.lowStockCount })] })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center", children: _jsx("span", { className: "text-red-600 font-semibold", children: "0" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-muted-foreground", children: "Out of Stock" }), _jsx("p", { className: "text-xl font-bold", children: analytics.outOfStockCount })] })] }) }) })] })), _jsxs(Tabs, { defaultValue: "products", className: "space-y-4", children: [_jsxs(TabsList, { children: [_jsx(TabsTrigger, { value: "products", children: "Products" }), _jsx(TabsTrigger, { value: "locations", children: "Locations" }), _jsx(TabsTrigger, { value: "movements", children: "Movements" }), _jsx(TabsTrigger, { value: "alerts", children: "Alerts" }), _jsx(TabsTrigger, { value: "transfers", children: "Transfers" }), _jsx(TabsTrigger, { value: "analytics", children: "Analytics" })] }), _jsx(TabsContent, { value: "products", className: "space-y-4", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx(CardTitle, { children: "Product Inventory" }), _jsxs("div", { className: "flex gap-2", children: [_jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" }), _jsx(Input, { placeholder: "Search products...", className: "pl-10 w-64", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value) })] }), _jsxs(Select, { value: selectedCategory, onValueChange: setSelectedCategory, children: [_jsx(SelectTrigger, { className: "w-40", children: _jsx(SelectValue, { placeholder: "Category" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All Categories" }), Array.from(new Set(products.map(p => p.category).filter(Boolean))).map(category => (_jsx(SelectItem, { value: category, children: category }, category)))] })] }), _jsxs(Select, { value: selectedLocation, onValueChange: setSelectedLocation, children: [_jsx(SelectTrigger, { className: "w-40", children: _jsx(SelectValue, { placeholder: "Location" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All Locations" }), locations.map(location => (_jsx(SelectItem, { value: location.id, children: location.name }, location.id)))] })] }), _jsxs(Select, { value: selectedStatus, onValueChange: setSelectedStatus, children: [_jsx(SelectTrigger, { className: "w-40", children: _jsx(SelectValue, { placeholder: "Status" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All Status" }), _jsx(SelectItem, { value: "ACTIVE", children: "Active" }), _jsx(SelectItem, { value: "INACTIVE", children: "Inactive" }), _jsx(SelectItem, { value: "DISCONTINUED", children: "Discontinued" })] })] }), _jsxs(Button, { variant: "outline", size: "sm", children: [_jsx(Filter, { className: "w-4 h-4 mr-2" }), "Filter"] })] })] }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: filteredProducts.map((product) => (_jsxs("div", { className: "flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center", children: _jsx(Package, { className: "w-6 h-6 text-gray-600" }) }), _jsxs("div", { children: [_jsx("p", { className: "font-medium", children: product.name }), _jsxs("p", { className: "text-sm text-muted-foreground", children: [product.sku, " \u2022 ", product.category || 'Uncategorized'] }), _jsxs("div", { className: "flex items-center gap-2 mt-1", children: [product.trackSerialNumbers && (_jsxs(Badge, { variant: "outline", className: "text-xs", children: [_jsx(Hash, { className: "w-3 h-3 mr-1" }), "Serial"] })), product.trackBatches && (_jsxs(Badge, { variant: "outline", className: "text-xs", children: [_jsx(Calendar, { className: "w-3 h-3 mr-1" }), "Batch"] })), _jsx(Badge, { variant: "outline", className: "text-xs", children: product.costingMethod })] })] })] }), _jsxs("div", { className: "flex items-center gap-6", children: [_jsxs("div", { className: "text-center", children: [_jsx("p", { className: "font-medium", children: product.stockQuantity }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Total Stock" })] }), _jsxs("div", { className: "text-center", children: [_jsx("p", { className: "font-medium", children: product.availableQuantity }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Available" })] }), _jsxs("div", { className: "text-center", children: [_jsxs("p", { className: "font-medium", children: ["$", product.unitPrice.toFixed(2)] }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Unit Price" })] }), _jsxs("div", { className: "text-center", children: [_jsxs("p", { className: "font-medium", children: ["$", (Number(product.stockQuantity) * Number(product.costPrice)).toFixed(2)] }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Total Value" })] }), getStatusBadge(product), _jsxs("div", { className: "flex gap-1", children: [_jsx(Button, { variant: "ghost", size: "sm", children: _jsx(Eye, { className: "w-4 h-4" }) }), _jsx(Button, { variant: "ghost", size: "sm", children: _jsx(Edit, { className: "w-4 h-4" }) }), _jsx(Button, { variant: "ghost", size: "sm", children: _jsx(QrCode, { className: "w-4 h-4" }) })] })] })] }, product.id))) }) })] }) }), _jsx(TabsContent, { value: "locations", className: "space-y-4", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx(CardTitle, { children: "Warehouse Locations" }), _jsxs(Button, { children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), "Add Location"] })] }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: locations.map((location) => (_jsxs("div", { className: "flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center", children: _jsx(MapPin, { className: "w-5 h-5 text-cyan-600" }) }), _jsxs("div", { children: [_jsx("p", { className: "font-medium", children: location.name }), _jsxs("p", { className: "text-sm text-muted-foreground", children: [location.code, " \u2022 ", location.type, " \u2022 ", location.address] }), location.isDefault && (_jsx(Badge, { variant: "default", className: "text-xs mt-1", children: "Default" }))] })] }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("div", { className: "text-center", children: [_jsx("p", { className: "font-medium", children: location._count.products }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Products" })] }), _jsxs("div", { className: "text-center", children: [_jsx("p", { className: "font-medium", children: location._count.movements }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Movements" })] }), _jsx(Button, { variant: "ghost", size: "sm", children: _jsx(Eye, { className: "w-4 h-4" }) })] })] }, location.id))) }) })] }) }), _jsx(TabsContent, { value: "movements", className: "space-y-4", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx(CardTitle, { children: "Inventory Movements" }), _jsxs(Button, { children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), "New Movement"] })] }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: movements.map((movement) => (_jsxs("div", { className: "flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center", children: getMovementIcon(movement.movementType) }), _jsxs("div", { children: [_jsx("p", { className: "font-medium", children: movement.product.name }), _jsxs("p", { className: "text-sm text-muted-foreground", children: [movement.product.sku, " \u2022 ", movement.movementType.replace('_', ' ')] }), movement.reason && (_jsx("p", { className: "text-xs text-muted-foreground mt-1", children: movement.reason }))] })] }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("div", { className: "text-center", children: [_jsxs("p", { className: `font-medium ${movement.quantity > 0 ? 'text-green-600' : 'text-red-600'}`, children: [movement.quantity > 0 ? '+' : '', movement.quantity] }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Quantity" })] }), movement.unitCost && (_jsxs("div", { className: "text-center", children: [_jsxs("p", { className: "font-medium", children: ["$", movement.unitCost.toFixed(2)] }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Unit Cost" })] })), _jsxs("div", { className: "text-center", children: [_jsx("p", { className: "font-medium", children: new Date(movement.movementDate).toLocaleDateString() }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Date" })] }), movement.location && (_jsxs("div", { className: "text-center", children: [_jsx("p", { className: "font-medium", children: movement.location.name }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Location" })] })), _jsx(Button, { variant: "ghost", size: "sm", children: _jsx(Eye, { className: "w-4 h-4" }) })] })] }, movement.id))) }) })] }) }), _jsx(TabsContent, { value: "alerts", className: "space-y-4", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx(CardTitle, { children: "Reorder Alerts" }), _jsxs(Button, { variant: "outline", children: [_jsx(Settings, { className: "w-4 h-4 mr-2" }), "Alert Settings"] })] }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: alerts.map((alert) => (_jsxs("div", { className: "flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center", children: getAlertIcon(alert.alertType) }), _jsxs("div", { children: [_jsx("p", { className: "font-medium", children: alert.product.name }), _jsxs("p", { className: "text-sm text-muted-foreground", children: [alert.product.sku, " \u2022 ", alert.alertType.replace('_', ' ')] }), _jsxs("p", { className: "text-xs text-muted-foreground mt-1", children: ["Current: ", alert.product.stockQuantity, " \u2022 Threshold: ", alert.threshold] })] })] }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsx(Badge, { variant: alert.status === 'PENDING' ? 'destructive' :
                                                                alert.status === 'ACKNOWLEDGED' ? 'secondary' :
                                                                    'default', children: alert.status }), alert.location && (_jsxs("div", { className: "text-center", children: [_jsx("p", { className: "font-medium", children: alert.location.name }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Location" })] })), _jsx(Button, { variant: "ghost", size: "sm", children: _jsx(Eye, { className: "w-4 h-4" }) })] })] }, alert.id))) }) })] }) }), _jsx(TabsContent, { value: "transfers", className: "space-y-4", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx(CardTitle, { children: "Inventory Transfers" }), _jsxs(Button, { children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), "New Transfer"] })] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "text-center py-8 text-muted-foreground", children: [_jsx(ArrowRightLeft, { className: "w-12 h-12 mx-auto mb-4 opacity-50" }), _jsx("p", { children: "No transfers found" }), _jsx("p", { className: "text-sm", children: "Create your first inventory transfer between locations" })] }) })] }) }), _jsx(TabsContent, { value: "analytics", className: "space-y-4", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Top Products by Value" }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-3", children: analytics?.topProducts.slice(0, 5).map((product, index) => (_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center", children: _jsx("span", { className: "text-sm font-medium text-blue-600", children: index + 1 }) }), _jsxs("div", { children: [_jsx("p", { className: "font-medium", children: product.name }), _jsx("p", { className: "text-sm text-muted-foreground", children: product.sku })] })] }), _jsxs("div", { className: "text-right", children: [_jsxs("p", { className: "font-medium", children: ["$", (product.stockQuantity * product.costPrice).toFixed(2)] }), _jsxs("p", { className: "text-sm text-muted-foreground", children: [product.stockQuantity, " units"] })] })] }, product.id))) }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Category Breakdown" }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-3", children: analytics?.categoryBreakdown.map((category) => (_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "font-medium", children: category.category || 'Uncategorized' }), _jsxs("p", { className: "text-sm text-muted-foreground", children: [category._count.category, " products"] })] }), _jsxs("div", { className: "text-right", children: [_jsx("p", { className: "font-medium", children: category._sum.stockQuantity || 0 }), _jsx("p", { className: "text-sm text-muted-foreground", children: "units" })] })] }, category.category))) }) })] })] }) })] })] }));
}
