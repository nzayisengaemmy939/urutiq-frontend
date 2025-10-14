import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, ScatterChart, Scatter } from 'recharts';
import { TrendingUp, Package, DollarSign, AlertTriangle, BarChart3, PieChart as PieChartIcon, Activity, Target, Zap, RefreshCw } from 'lucide-react';
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];
export function InventoryAnalytics({ products, movements, locations, categories, alerts, analytics, kpis, onRefresh }) {
    const [selectedPeriod, setSelectedPeriod] = useState('30d');
    const [selectedLocation, setSelectedLocation] = useState('all');
    const [selectedMetric, setSelectedMetric] = useState('value');
    // Process data for charts
    const chartData = useMemo(() => {
        // Category breakdown - use categories array to map categoryId to category name
        const categoryData = products.reduce((acc, product) => {
            let category = 'Uncategorized';
            // Find category name using categoryId
            if (product.categoryId) {
                const categoryObj = categories.find(c => c.id === product.categoryId);
                category = categoryObj?.name || 'Unknown Category';
            }
            else if (product.category) {
                category = product.category;
            }
            const existing = acc.find(item => item.name === category);
            const stockQuantity = parseFloat(product.stockQuantity || 0);
            const unitPrice = parseFloat(product.unitPrice || 0);
            const revenue = unitPrice * stockQuantity;
            if (existing) {
                existing.value += stockQuantity;
                existing.revenue += revenue;
            }
            else {
                acc.push({
                    name: category,
                    value: stockQuantity,
                    revenue: revenue
                });
            }
            return acc;
        }, []);
        // Filter out categories with zero values for better visualization
        const filteredCategoryData = categoryData.filter(cat => cat.value > 0);
        // Top products by value
        const topProducts = products
            .map(product => {
            const stockQuantity = parseFloat(product.stockQuantity || 0);
            const costPrice = parseFloat(product.costPrice || 0);
            const unitPrice = parseFloat(product.unitPrice || 0);
            const totalValue = stockQuantity * costPrice;
            const totalRetailValue = stockQuantity * unitPrice;
            return {
                name: product.name,
                sku: product.sku,
                stock: stockQuantity,
                costValue: totalValue,
                retailValue: totalRetailValue,
                value: totalValue // Use cost value for sorting
            };
        })
            .sort((a, b) => b.value - a.value)
            .slice(0, 10);
        // Stock levels by location - use proper location-specific stock data
        const locationData = locations.map(location => {
            // Use the stockMetrics from the enhanced API response if available
            if (location.stockMetrics) {
                return {
                    name: location.name,
                    stock: location.stockMetrics.totalStock,
                    value: location.stockMetrics.totalValue,
                    retailValue: location.stockMetrics.totalRetailValue,
                    products: location.stockMetrics.uniqueProducts
                };
            }
            // Fallback: calculate from product locations (but use location-specific quantities)
            let totalStock = 0;
            let totalValue = 0;
            let totalRetailValue = 0;
            let productCount = 0;
            products.forEach(product => {
                const locationStock = product.locations?.find((loc) => loc.locationId === location.id);
                if (locationStock) {
                    const quantity = parseFloat(locationStock.quantity || 0);
                    const costPrice = parseFloat(product.costPrice || 0);
                    const unitPrice = parseFloat(product.unitPrice || 0);
                    totalStock += quantity;
                    totalValue += quantity * costPrice;
                    totalRetailValue += quantity * unitPrice;
                    productCount++;
                }
            });
            return {
                name: location.name,
                stock: totalStock,
                value: Math.round(totalValue * 100) / 100,
                retailValue: Math.round(totalRetailValue * 100) / 100,
                products: productCount
            };
        });
        // Movement trends (real data from movements)
        const movementTrends = useMemo(() => {
            const last30Days = Array.from({ length: 30 }, (_, i) => {
                const date = new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000);
                const dateStr = date.toISOString().split('T')[0];
                const dayMovements = movements.filter(movement => {
                    const movementDate = new Date(movement.movementDate).toISOString().split('T')[0];
                    return movementDate === dateStr;
                });
                const incoming = dayMovements
                    .filter(m => ['INBOUND', 'PURCHASE', 'TRANSFER_IN', 'ADJUSTMENT_IN', 'RETURN_IN'].includes(m.movementType))
                    .reduce((sum, m) => sum + Math.abs(Number(m.quantity || 0)), 0);
                const outgoing = dayMovements
                    .filter(m => ['OUTBOUND', 'SALE', 'TRANSFER_OUT', 'ADJUSTMENT_OUT', 'RETURN_OUT', 'DAMAGE', 'THEFT'].includes(m.movementType))
                    .reduce((sum, m) => sum + Math.abs(Number(m.quantity || 0)), 0);
                const adjustments = dayMovements
                    .filter(m => ['ADJUSTMENT_IN', 'ADJUSTMENT_OUT', 'CYCLE_COUNT'].includes(m.movementType))
                    .reduce((sum, m) => sum + Math.abs(Number(m.quantity || 0)), 0);
                return {
                    date: dateStr,
                    incoming,
                    outgoing,
                    adjustments
                };
            });
            return last30Days;
        }, [movements]);
        // Stock turnover analysis (real calculation based on movements)
        const turnoverData = useMemo(() => {
            return products
                .filter(product => parseFloat(product.stockQuantity || 0) > 0)
                .map(product => {
                // Calculate turnover based on actual movements in last 90 days
                const productMovements = movements.filter(m => m.productId === product.id);
                const last90Days = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
                const recentMovements = productMovements.filter(m => new Date(m.movementDate) >= last90Days);
                // Calculate total outgoing quantity (sales, transfers out, etc.)
                const outgoingQuantity = recentMovements
                    .filter(m => ['OUTBOUND', 'SALE', 'TRANSFER_OUT', 'ADJUSTMENT_OUT', 'RETURN_OUT', 'DAMAGE', 'THEFT'].includes(m.movementType))
                    .reduce((sum, m) => sum + Math.abs(Number(m.quantity || 0)), 0);
                // Calculate average stock level
                const avgStock = parseFloat(product.stockQuantity || 0);
                // Calculate turnover rate (times per year)
                const turnover = avgStock > 0 ? (outgoingQuantity / avgStock) * 4 : 0; // 4 quarters per year
                return {
                    name: product.name,
                    stock: avgStock,
                    turnover: Math.round(turnover * 100) / 100, // Round to 2 decimal places
                    category: product.categoryId ? (categories.find(c => c.id === product.categoryId)?.name || 'Unknown Category') : 'Uncategorized'
                };
            })
                .sort((a, b) => b.turnover - a.turnover)
                .slice(0, 15);
        }, [products, movements]);
        return {
            categoryData: filteredCategoryData,
            topProducts,
            locationData,
            movementTrends,
            turnoverData
        };
    }, [products, locations, movements, categories]);
    // Calculate key metrics
    const metrics = useMemo(() => {
        const totalProducts = products.length;
        const totalValue = products.reduce((sum, product) => sum + (parseFloat(product.unitPrice || 0) * parseFloat(product.stockQuantity || 0)), 0);
        const lowStockItems = products.filter(product => parseFloat(product.stockQuantity || 0) <= (product.reorderPoint || 10)).length;
        const outOfStockItems = products.filter(product => parseFloat(product.stockQuantity || 0) === 0).length;
        const avgTurnover = chartData.turnoverData.reduce((sum, item) => sum + item.turnover, 0) / chartData.turnoverData.length;
        return {
            totalProducts,
            totalValue,
            lowStockItems,
            outOfStockItems,
            avgTurnover: avgTurnover || 0
        };
    }, [products, chartData]);
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (_jsxs("div", { className: "bg-white p-3 border rounded-lg shadow-lg", children: [_jsx("p", { className: "font-medium", children: label }), payload.map((entry, index) => (_jsxs("p", { style: { color: entry.color }, children: [entry.name, ": ", entry.value] }, index)))] }));
        }
        return null;
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold", children: "Advanced Analytics" }), _jsx("p", { className: "text-muted-foreground", children: "Comprehensive inventory insights and trends" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs(Select, { value: selectedPeriod, onValueChange: setSelectedPeriod, children: [_jsx(SelectTrigger, { className: "w-32", children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "7d", children: "Last 7 days" }), _jsx(SelectItem, { value: "30d", children: "Last 30 days" }), _jsx(SelectItem, { value: "90d", children: "Last 90 days" }), _jsx(SelectItem, { value: "1y", children: "Last year" })] })] }), onRefresh && (_jsxs(Button, { variant: "outline", size: "sm", onClick: onRefresh, children: [_jsx(RefreshCw, { className: "w-4 h-4 mr-2" }), "Refresh"] }))] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4", children: [_jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center", children: _jsx(Package, { className: "w-5 h-5 text-blue-600" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-muted-foreground", children: "Total Products" }), _jsx("p", { className: "text-xl font-bold", children: metrics.totalProducts })] })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center", children: _jsx(DollarSign, { className: "w-5 h-5 text-green-600" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-muted-foreground", children: "Total Value" }), _jsxs("p", { className: "text-xl font-bold", children: ["$", metrics.totalValue.toLocaleString()] })] })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center", children: _jsx(AlertTriangle, { className: "w-5 h-5 text-amber-600" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-muted-foreground", children: "Low Stock" }), _jsx("p", { className: "text-xl font-bold", children: metrics.lowStockItems })] })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center", children: _jsx(Package, { className: "w-5 h-5 text-red-600" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-muted-foreground", children: "Out of Stock" }), _jsx("p", { className: "text-xl font-bold", children: metrics.outOfStockItems })] })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center", children: _jsx(Activity, { className: "w-5 h-5 text-purple-600" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-muted-foreground", children: "Avg Turnover" }), _jsxs("p", { className: "text-xl font-bold", children: [metrics.avgTurnover.toFixed(1), "x"] })] })] }) }) })] }), _jsxs(Tabs, { defaultValue: "overview", className: "space-y-4", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-4", children: [_jsx(TabsTrigger, { value: "overview", children: "Overview" }), _jsx(TabsTrigger, { value: "trends", children: "Trends" }), _jsx(TabsTrigger, { value: "performance", children: "Performance" }), _jsx(TabsTrigger, { value: "optimization", children: "Optimization" })] }), _jsxs(TabsContent, { value: "overview", className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(PieChartIcon, { className: "w-5 h-5" }), "Category Distribution"] }) }), _jsx(CardContent, { children: _jsx(ResponsiveContainer, { width: "100%", height: 300, children: _jsxs(PieChart, { children: [_jsx(Pie, { data: chartData.categoryData, cx: "50%", cy: "50%", labelLine: false, label: ({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`, outerRadius: 80, fill: "#8884d8", dataKey: "value", children: chartData.categoryData.map((entry, index) => (_jsx(Cell, { fill: COLORS[index % COLORS.length] }, `cell-${index}`))) }), _jsx(Tooltip, { content: _jsx(CustomTooltip, {}) })] }) }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(BarChart3, { className: "w-5 h-5" }), "Top Products by Value"] }) }), _jsx(CardContent, { children: _jsx(ResponsiveContainer, { width: "100%", height: 300, children: _jsxs(BarChart, { data: chartData.topProducts.slice(0, 8), children: [_jsx(CartesianGrid, { strokeDasharray: "3 3" }), _jsx(XAxis, { dataKey: "name", angle: -45, textAnchor: "end", height: 100, fontSize: 12 }), _jsx(YAxis, {}), _jsx(Tooltip, { content: _jsx(CustomTooltip, {}) }), _jsx(Bar, { dataKey: "value", fill: "#8884d8" })] }) }) })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Target, { className: "w-5 h-5" }), "Stock Distribution by Location"] }) }), _jsx(CardContent, { children: _jsx(ResponsiveContainer, { width: "100%", height: 300, children: _jsxs(BarChart, { data: chartData.locationData, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3" }), _jsx(XAxis, { dataKey: "name" }), _jsx(YAxis, { yAxisId: "left" }), _jsx(YAxis, { yAxisId: "right", orientation: "right" }), _jsx(Tooltip, { content: _jsx(CustomTooltip, {}) }), _jsx(Bar, { yAxisId: "left", dataKey: "stock", fill: "#82CA9D", name: "Stock Quantity" }), _jsx(Bar, { yAxisId: "right", dataKey: "value", fill: "#8884D8", name: "Total Value ($)" })] }) }) })] })] }), _jsx(TabsContent, { value: "trends", className: "space-y-4", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(TrendingUp, { className: "w-5 h-5" }), "Inventory Movement Trends"] }) }), _jsx(CardContent, { children: _jsx(ResponsiveContainer, { width: "100%", height: 400, children: _jsxs(AreaChart, { data: chartData.movementTrends, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3" }), _jsx(XAxis, { dataKey: "date" }), _jsx(YAxis, {}), _jsx(Tooltip, { content: _jsx(CustomTooltip, {}) }), _jsx(Area, { type: "monotone", dataKey: "incoming", stackId: "1", stroke: "#8884d8", fill: "#8884d8" }), _jsx(Area, { type: "monotone", dataKey: "outgoing", stackId: "1", stroke: "#82ca9d", fill: "#82ca9d" }), _jsx(Area, { type: "monotone", dataKey: "adjustments", stackId: "1", stroke: "#ffc658", fill: "#ffc658" })] }) }) })] }) }), _jsx(TabsContent, { value: "performance", className: "space-y-4", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Zap, { className: "w-5 h-5" }), "Stock Turnover Analysis"] }) }), _jsx(CardContent, { children: _jsx(ResponsiveContainer, { width: "100%", height: 400, children: _jsxs(ScatterChart, { data: chartData.turnoverData, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3" }), _jsx(XAxis, { dataKey: "stock", name: "Stock Level" }), _jsx(YAxis, { dataKey: "turnover", name: "Turnover Rate" }), _jsx(Tooltip, { cursor: { strokeDasharray: '3 3' } }), _jsx(Scatter, { dataKey: "turnover", fill: "#8884d8" })] }) }) })] }) }), _jsx(TabsContent, { value: "optimization", className: "space-y-4", children: _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Target, { className: "w-5 h-5" }), "Optimization Recommendations"] }) }), _jsx(CardContent, { className: "space-y-4", children: _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-start gap-3 p-3 bg-blue-50 rounded-lg", children: [_jsx(TrendingUp, { className: "w-5 h-5 text-blue-600 mt-0.5" }), _jsxs("div", { children: [_jsx("p", { className: "font-medium text-blue-900", children: "Increase Stock for Fast Movers" }), _jsx("p", { className: "text-sm text-blue-700", children: "Products with high turnover rates should have increased stock levels" })] })] }), _jsxs("div", { className: "flex items-start gap-3 p-3 bg-amber-50 rounded-lg", children: [_jsx(AlertTriangle, { className: "w-5 h-5 text-amber-600 mt-0.5" }), _jsxs("div", { children: [_jsx("p", { className: "font-medium text-amber-900", children: "Review Low Stock Items" }), _jsxs("p", { className: "text-sm text-amber-700", children: [metrics.lowStockItems, " items need immediate attention"] })] })] }), _jsxs("div", { className: "flex items-start gap-3 p-3 bg-green-50 rounded-lg", children: [_jsx(Package, { className: "w-5 h-5 text-green-600 mt-0.5" }), _jsxs("div", { children: [_jsx("p", { className: "font-medium text-green-900", children: "Optimize Location Distribution" }), _jsxs("p", { className: "text-sm text-green-700", children: ["Balance stock across ", locations.length, " locations for better efficiency"] })] })] })] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Activity, { className: "w-5 h-5" }), "Performance Metrics"] }) }), _jsx(CardContent, { className: "space-y-4", children: _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm font-medium", children: "Inventory Turnover" }), _jsxs(Badge, { variant: "outline", children: [metrics.avgTurnover.toFixed(1), "x"] })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm font-medium", children: "Stock Accuracy" }), _jsx(Badge, { variant: "outline", children: "98.5%" })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm font-medium", children: "Fill Rate" }), _jsx(Badge, { variant: "outline", children: "94.2%" })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm font-medium", children: "Carrying Cost" }), _jsx(Badge, { variant: "outline", children: "12.3%" })] })] }) })] })] }) })] })] }));
}
export default InventoryAnalytics;
