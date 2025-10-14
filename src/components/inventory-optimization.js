import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Target, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Lightbulb, Zap, DollarSign, Package, BarChart3, Activity, RefreshCw, Download, Settings, ArrowUpRight, ArrowDownRight, Minus, } from 'lucide-react';
export function InventoryOptimization({ products, movements, locations, alerts, kpis, onApplyRecommendation, onRefresh }) {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedPriority, setSelectedPriority] = useState('all');
    const [appliedRecommendations, setAppliedRecommendations] = useState(new Set());
    const { toast } = useToast();
    // Calculate real stock accuracy based on movements vs actual stock
    const stockAccuracy = useMemo(() => {
        if (movements.length === 0)
            return 100;
        // Calculate expected stock based on movements
        const productStockCalculations = products.map(product => {
            const productMovements = movements.filter(m => m.productId === product.id);
            const expectedStock = productMovements.reduce((sum, movement) => {
                const quantity = Number(movement.quantity || 0);
                if (['INBOUND', 'PURCHASE', 'TRANSFER_IN', 'ADJUSTMENT_IN', 'RETURN_IN'].includes(movement.movementType)) {
                    return sum + quantity;
                }
                else if (['OUTBOUND', 'SALE', 'TRANSFER_OUT', 'ADJUSTMENT_OUT', 'RETURN_OUT', 'DAMAGE', 'THEFT'].includes(movement.movementType)) {
                    return sum - quantity;
                }
                return sum;
            }, 0);
            const actualStock = Number(product.stockQuantity || 0);
            const variance = Math.abs(expectedStock - actualStock);
            return { variance, actualStock };
        });
        const totalVariance = productStockCalculations.reduce((sum, calc) => sum + calc.variance, 0);
        const totalStock = productStockCalculations.reduce((sum, calc) => sum + calc.actualStock, 0);
        return totalStock > 0 ? Math.max(0, 100 - (totalVariance / totalStock) * 100) : 100;
    }, [products, movements]);
    // Calculate real fill rate based on out-of-stock vs total products
    const fillRate = useMemo(() => {
        const outOfStockCount = products.filter(product => Number(product.stockQuantity || 0) === 0).length;
        const totalProducts = products.length;
        return totalProducts > 0 ? Math.max(0, 100 - (outOfStockCount / totalProducts) * 100) : 100;
    }, [products]);
    // Calculate optimization metrics
    const metrics = useMemo(() => {
        const totalProducts = products.length;
        const lowStockItems = products.filter(product => {
            const stock = typeof product.stockQuantity === 'string' ? parseFloat(product.stockQuantity) : product.stockQuantity;
            const reorderPoint = typeof product.reorderPoint === 'string' ? parseFloat(product.reorderPoint) : product.reorderPoint || 10;
            return stock <= reorderPoint;
        }).length;
        const outOfStockItems = products.filter(product => {
            const stock = typeof product.stockQuantity === 'string' ? parseFloat(product.stockQuantity) : product.stockQuantity;
            return stock === 0;
        }).length;
        const avgTurnover = kpis?.inventoryTurnover || 6;
        // Calculate optimization scores
        const costOptimization = Math.max(0, 100 - (lowStockItems / totalProducts) * 100);
        const spaceUtilization = Math.max(0, 100 - (outOfStockItems / totalProducts) * 100);
        const turnoverRate = Math.min(100, (avgTurnover / 12) * 100);
        const overallScore = (costOptimization + spaceUtilization + turnoverRate + stockAccuracy + fillRate) / 5;
        return {
            overallScore: Math.round(overallScore),
            costOptimization: Math.round(costOptimization),
            spaceUtilization: Math.round(spaceUtilization),
            turnoverRate: Math.round(turnoverRate),
            stockAccuracy: Math.round(stockAccuracy),
            fillRate: Math.round(fillRate)
        };
    }, [products, kpis, stockAccuracy, fillRate]);
    // Generate optimization recommendations
    const recommendations = useMemo(() => {
        const recs = [];
        // Analyze products for recommendations
        products.forEach(product => {
            const stock = typeof product.stockQuantity === 'string' ? parseFloat(product.stockQuantity) : product.stockQuantity;
            const reorderPoint = typeof product.reorderPoint === 'string' ? parseFloat(product.reorderPoint) : product.reorderPoint || 10;
            const price = typeof product.unitPrice === 'string' ? parseFloat(product.unitPrice) : product.unitPrice || 0;
            const cost = typeof product.costPrice === 'string' ? parseFloat(product.costPrice) : product.costPrice || 0;
            // Low stock recommendation
            if (stock <= reorderPoint && stock > 0) {
                recs.push({
                    id: `low-stock-${product.id}`,
                    type: 'reorder_point',
                    priority: stock <= reorderPoint * 0.5 ? 'high' : 'medium',
                    title: `Reorder ${product.name}`,
                    description: `Stock level (${stock}) is below reorder point (${reorderPoint}). Consider placing a purchase order.`,
                    impact: 'risk_reduction',
                    potentialSavings: stock * cost * 0.1, // 10% of stock value
                    confidence: 95,
                    products: [product.id],
                    action: `Increase stock to ${reorderPoint * 2} units`,
                    estimatedEffort: 'low'
                });
            }
            // Overstock recommendation
            if (stock > reorderPoint * 3) {
                recs.push({
                    id: `overstock-${product.id}`,
                    type: 'stock_adjustment',
                    priority: 'medium',
                    title: `Reduce Overstock for ${product.name}`,
                    description: `High stock level (${stock}) may indicate overstocking. Consider reducing inventory.`,
                    impact: 'cost_savings',
                    potentialSavings: (stock - reorderPoint * 2) * cost * 0.2,
                    confidence: 80,
                    products: [product.id],
                    action: `Reduce stock to ${reorderPoint * 2} units`,
                    estimatedEffort: 'medium'
                });
            }
            // Pricing optimization
            if (price > cost * 2.5 && cost > 0) {
                const markupPercentage = ((price - cost) / cost * 100).toFixed(1);
                recs.push({
                    id: `pricing-${product.id}`,
                    type: 'pricing',
                    priority: 'low',
                    title: `Optimize Pricing for ${product.name}`,
                    description: `High markup (${markupPercentage}%) may impact sales volume.`,
                    impact: 'revenue_increase',
                    potentialRevenue: stock * price * 0.05, // 5% increase
                    confidence: 70,
                    products: [product.id],
                    action: `Consider reducing price by 5-10%`,
                    estimatedEffort: 'low'
                });
            }
            else if (cost === 0 && price > 0) {
                // Handle products with zero cost price
                recs.push({
                    id: `pricing-${product.id}`,
                    type: 'pricing',
                    priority: 'medium',
                    title: `Review Pricing for ${product.name}`,
                    description: `Product has zero cost price but positive selling price. Review cost structure.`,
                    impact: 'efficiency',
                    potentialSavings: 0,
                    confidence: 85,
                    products: [product.id],
                    action: `Update cost price or review pricing strategy`,
                    estimatedEffort: 'low'
                });
            }
            // Discontinuation recommendation for slow movers (based on real data)
            const productMovements = movements.filter(m => m.productId === product.id);
            const last90Days = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
            const recentMovements = productMovements.filter(m => new Date(m.movementDate) >= last90Days);
            // Calculate movement rate (outgoing movements per month)
            const outgoingMovements = recentMovements.filter(m => ['OUTBOUND', 'SALE', 'TRANSFER_OUT', 'ADJUSTMENT_OUT', 'RETURN_OUT', 'DAMAGE', 'THEFT'].includes(m.movementType)).length;
            const movementRate = outgoingMovements / 3; // 3 months
            // Recommend discontinuation if movement rate is very low (less than 1 movement per month)
            if (stock > 0 && movementRate < 1 && recentMovements.length > 0) {
                recs.push({
                    id: `discontinue-${product.id}`,
                    type: 'discontinuation',
                    priority: 'low',
                    title: `Consider Discontinuing ${product.name}`,
                    description: `Low movement rate (${movementRate.toFixed(1)} movements/month) suggests this product may not be profitable.`,
                    impact: 'cost_savings',
                    potentialSavings: stock * cost,
                    confidence: 60,
                    products: [product.id],
                    action: `Phase out product or run clearance sale`,
                    estimatedEffort: 'high'
                });
            }
        });
        // Location optimization recommendations
        if (locations.length > 1) {
            recs.push({
                id: 'location-balance',
                type: 'location_transfer',
                priority: 'medium',
                title: 'Balance Stock Across Locations',
                description: `Optimize inventory distribution across ${locations.length} locations for better efficiency.`,
                impact: 'efficiency',
                potentialSavings: 5000,
                confidence: 85,
                products: products.slice(0, 5).map(p => p.id),
                locations: locations.map(l => l.id),
                action: 'Transfer stock between locations based on demand patterns',
                estimatedEffort: 'medium'
            });
        }
        return recs.sort((a, b) => {
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        });
    }, [products, locations]);
    const filteredRecommendations = recommendations.filter(rec => {
        const categoryMatch = selectedCategory === 'all' ||
            products.find(p => p.id === rec.products[0])?.category === selectedCategory;
        const priorityMatch = selectedPriority === 'all' || rec.priority === selectedPriority;
        return categoryMatch && priorityMatch;
    });
    const handleApplyRecommendation = (recommendation) => {
        setAppliedRecommendations(prev => new Set([...prev, recommendation.id]));
        toast({
            title: "Recommendation Applied",
            description: recommendation.title,
        });
        if (onApplyRecommendation) {
            onApplyRecommendation(recommendation);
        }
    };
    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'bg-red-100 text-red-800 border-red-200';
            case 'medium': return 'bg-amber-100 text-amber-800 border-amber-200';
            case 'low': return 'bg-green-100 text-green-800 border-green-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };
    const getImpactIcon = (impact) => {
        switch (impact) {
            case 'cost_savings': return _jsx(TrendingDown, { className: "w-4 h-4 text-green-600" });
            case 'revenue_increase': return _jsx(TrendingUp, { className: "w-4 h-4 text-blue-600" });
            case 'efficiency': return _jsx(Zap, { className: "w-4 h-4 text-purple-600" });
            case 'risk_reduction': return _jsx(AlertTriangle, { className: "w-4 h-4 text-amber-600" });
            default: return _jsx(Target, { className: "w-4 h-4 text-gray-600" });
        }
    };
    const getEffortColor = (effort) => {
        switch (effort) {
            case 'low': return 'text-green-600';
            case 'medium': return 'text-amber-600';
            case 'high': return 'text-red-600';
            default: return 'text-gray-600';
        }
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold", children: "Inventory Optimization" }), _jsx("p", { className: "text-muted-foreground", children: "AI-powered recommendations to optimize your inventory performance" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs(Select, { value: selectedCategory, onValueChange: setSelectedCategory, children: [_jsx(SelectTrigger, { className: "w-40", children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All Categories" }), _jsx(SelectItem, { value: "electronics", children: "Electronics" }), _jsx(SelectItem, { value: "clothing", children: "Clothing" }), _jsx(SelectItem, { value: "books", children: "Books" })] })] }), _jsxs(Select, { value: selectedPriority, onValueChange: setSelectedPriority, children: [_jsx(SelectTrigger, { className: "w-32", children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All Priority" }), _jsx(SelectItem, { value: "high", children: "High" }), _jsx(SelectItem, { value: "medium", children: "Medium" }), _jsx(SelectItem, { value: "low", children: "Low" })] })] }), onRefresh && (_jsxs(Button, { variant: "outline", size: "sm", onClick: onRefresh, children: [_jsx(RefreshCw, { className: "w-4 h-4 mr-2" }), "Refresh"] }))] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4", children: [_jsx(Card, { children: _jsxs(CardContent, { className: "p-4", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center", children: _jsx(Target, { className: "w-5 h-5 text-blue-600" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-muted-foreground", children: "Overall Score" }), _jsxs("p", { className: "text-xl font-bold", children: [metrics.overallScore, "%"] })] })] }), _jsx(Progress, { value: metrics.overallScore, className: "mt-2" })] }) }), _jsx(Card, { children: _jsxs(CardContent, { className: "p-4", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center", children: _jsx(DollarSign, { className: "w-5 h-5 text-green-600" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-muted-foreground", children: "Cost Optimization" }), _jsxs("p", { className: "text-xl font-bold", children: [metrics.costOptimization, "%"] })] })] }), _jsx(Progress, { value: metrics.costOptimization, className: "mt-2" })] }) }), _jsx(Card, { children: _jsxs(CardContent, { className: "p-4", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center", children: _jsx(Package, { className: "w-5 h-5 text-purple-600" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-muted-foreground", children: "Space Utilization" }), _jsxs("p", { className: "text-xl font-bold", children: [metrics.spaceUtilization, "%"] })] })] }), _jsx(Progress, { value: metrics.spaceUtilization, className: "mt-2" })] }) }), _jsx(Card, { children: _jsxs(CardContent, { className: "p-4", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center", children: _jsx(Activity, { className: "w-5 h-5 text-amber-600" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-muted-foreground", children: "Turnover Rate" }), _jsxs("p", { className: "text-xl font-bold", children: [metrics.turnoverRate, "%"] })] })] }), _jsx(Progress, { value: metrics.turnoverRate, className: "mt-2" })] }) }), _jsx(Card, { children: _jsxs(CardContent, { className: "p-4", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center", children: _jsx(CheckCircle, { className: "w-5 h-5 text-blue-600" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-muted-foreground", children: "Stock Accuracy" }), _jsxs("p", { className: "text-xl font-bold", children: [metrics.stockAccuracy, "%"] })] })] }), _jsx(Progress, { value: metrics.stockAccuracy, className: "mt-2" })] }) }), _jsx(Card, { children: _jsxs(CardContent, { className: "p-4", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center", children: _jsx(BarChart3, { className: "w-5 h-5 text-green-600" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-muted-foreground", children: "Fill Rate" }), _jsxs("p", { className: "text-xl font-bold", children: [metrics.fillRate, "%"] })] })] }), _jsx(Progress, { value: metrics.fillRate, className: "mt-2" })] }) })] }), _jsxs(Tabs, { defaultValue: "recommendations", className: "space-y-4", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-3", children: [_jsx(TabsTrigger, { value: "recommendations", children: "Recommendations" }), _jsx(TabsTrigger, { value: "insights", children: "Insights" }), _jsx(TabsTrigger, { value: "actions", children: "Action Plan" })] }), _jsx(TabsContent, { value: "recommendations", className: "space-y-4", children: _jsxs("div", { className: "space-y-4", children: [filteredRecommendations.map((recommendation) => (_jsx(Card, { className: appliedRecommendations.has(recommendation.id) ? 'opacity-50' : '', children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-3 mb-2", children: [_jsx("h3", { className: "font-semibold", children: recommendation.title }), _jsx(Badge, { className: getPriorityColor(recommendation.priority), children: recommendation.priority }), getImpactIcon(recommendation.impact)] }), _jsx("p", { className: "text-sm text-muted-foreground mb-3", children: recommendation.description }), _jsxs("div", { className: "flex items-center gap-4 text-sm", children: [_jsxs("div", { className: "flex items-center gap-1", children: [_jsx("span", { className: "text-muted-foreground", children: "Confidence:" }), _jsxs("span", { className: "font-medium", children: [recommendation.confidence, "%"] })] }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx("span", { className: "text-muted-foreground", children: "Effort:" }), _jsx("span", { className: `font-medium ${getEffortColor(recommendation.estimatedEffort)}`, children: recommendation.estimatedEffort })] }), recommendation.potentialSavings && (_jsxs("div", { className: "flex items-center gap-1", children: [_jsx("span", { className: "text-muted-foreground", children: "Savings:" }), _jsxs("span", { className: "font-medium text-green-600", children: ["$", recommendation.potentialSavings.toLocaleString()] })] })), recommendation.potentialRevenue && (_jsxs("div", { className: "flex items-center gap-1", children: [_jsx("span", { className: "text-muted-foreground", children: "Revenue:" }), _jsxs("span", { className: "font-medium text-blue-600", children: ["$", recommendation.potentialRevenue.toLocaleString()] })] }))] }), _jsxs("div", { className: "mt-3 p-2 bg-muted rounded-lg", children: [_jsx("p", { className: "text-sm font-medium", children: "Action:" }), _jsx("p", { className: "text-sm text-muted-foreground", children: recommendation.action })] })] }), _jsx("div", { className: "ml-4", children: appliedRecommendations.has(recommendation.id) ? (_jsxs(Button, { variant: "outline", disabled: true, children: [_jsx(CheckCircle, { className: "w-4 h-4 mr-2" }), "Applied"] })) : (_jsx(Button, { onClick: () => handleApplyRecommendation(recommendation), size: "sm", children: "Apply" })) })] }) }) }, recommendation.id))), filteredRecommendations.length === 0 && (_jsx(Card, { children: _jsxs(CardContent, { className: "p-8 text-center", children: [_jsx(CheckCircle, { className: "w-12 h-12 text-green-500 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-semibold mb-2", children: "No Recommendations" }), _jsx("p", { className: "text-muted-foreground", children: "Your inventory is well optimized! No immediate recommendations at this time." })] }) }))] }) }), _jsx(TabsContent, { value: "insights", className: "space-y-4", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Lightbulb, { className: "w-5 h-5" }), "Key Insights"] }) }), _jsxs(CardContent, { className: "space-y-3", children: [_jsxs("div", { className: "flex items-start gap-3 p-3 bg-blue-50 rounded-lg", children: [_jsx(TrendingUp, { className: "w-5 h-5 text-blue-600 mt-0.5" }), _jsxs("div", { children: [_jsx("p", { className: "font-medium text-blue-900", children: "High Turnover Products" }), _jsxs("p", { className: "text-sm text-blue-700", children: [products.filter(p => {
                                                                            const productMovements = movements.filter(m => m.productId === p.id);
                                                                            const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
                                                                            const recentMovements = productMovements.filter(m => new Date(m.movementDate) >= last30Days);
                                                                            const outgoingMovements = recentMovements.filter(m => ['OUTBOUND', 'SALE', 'TRANSFER_OUT', 'ADJUSTMENT_OUT', 'RETURN_OUT', 'DAMAGE', 'THEFT'].includes(m.movementType)).length;
                                                                            return outgoingMovements >= 3; // 3+ movements in last 30 days
                                                                        }).length, " products showing excellent movement"] })] })] }), _jsxs("div", { className: "flex items-start gap-3 p-3 bg-amber-50 rounded-lg", children: [_jsx(AlertTriangle, { className: "w-5 h-5 text-amber-600 mt-0.5" }), _jsxs("div", { children: [_jsx("p", { className: "font-medium text-amber-900", children: "Attention Needed" }), _jsxs("p", { className: "text-sm text-amber-700", children: [alerts.length, " items require immediate attention"] })] })] }), _jsxs("div", { className: "flex items-start gap-3 p-3 bg-green-50 rounded-lg", children: [_jsx(Package, { className: "w-5 h-5 text-green-600 mt-0.5" }), _jsxs("div", { children: [_jsx("p", { className: "font-medium text-green-900", children: "Space Optimization" }), _jsxs("p", { className: "text-sm text-green-700", children: ["Potential to free up ", Math.floor(products.length * 0.1), " storage locations"] })] })] })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(BarChart3, { className: "w-5 h-5" }), "Performance Trends"] }) }), _jsxs(CardContent, { className: "space-y-3", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm font-medium", children: "Inventory Turnover" }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx(ArrowUpRight, { className: "w-4 h-4 text-green-600" }), _jsx("span", { className: "text-sm text-green-600", children: "+12%" })] })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm font-medium", children: "Stock Accuracy" }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx(ArrowUpRight, { className: "w-4 h-4 text-green-600" }), _jsx("span", { className: "text-sm text-green-600", children: "+2.1%" })] })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm font-medium", children: "Carrying Costs" }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx(ArrowDownRight, { className: "w-4 h-4 text-red-600" }), _jsx("span", { className: "text-sm text-red-600", children: "-5.3%" })] })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm font-medium", children: "Fill Rate" }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Minus, { className: "w-4 h-4 text-gray-600" }), _jsx("span", { className: "text-sm text-gray-600", children: "0.0%" })] })] })] })] })] }) }), _jsx(TabsContent, { value: "actions", className: "space-y-4", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Settings, { className: "w-5 h-5" }), "Recommended Action Plan"] }) }), _jsx(CardContent, { className: "space-y-4", children: _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center gap-3 p-3 border rounded-lg", children: [_jsx("div", { className: "w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center", children: _jsx("span", { className: "text-sm font-bold text-red-600", children: "1" }) }), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "font-medium", children: "Address High Priority Items" }), _jsxs("p", { className: "text-sm text-muted-foreground", children: [filteredRecommendations.filter(r => r.priority === 'high').length, " high priority recommendations"] })] }), _jsxs(Button, { size: "sm", variant: "outline", children: [_jsx(Download, { className: "w-4 h-4 mr-2" }), "Export List"] })] }), _jsxs("div", { className: "flex items-center gap-3 p-3 border rounded-lg", children: [_jsx("div", { className: "w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center", children: _jsx("span", { className: "text-sm font-bold text-amber-600", children: "2" }) }), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "font-medium", children: "Review Medium Priority Items" }), _jsxs("p", { className: "text-sm text-muted-foreground", children: [filteredRecommendations.filter(r => r.priority === 'medium').length, " medium priority recommendations"] })] }), _jsx(Button, { size: "sm", variant: "outline", children: "Schedule Review" })] }), _jsxs("div", { className: "flex items-center gap-3 p-3 border rounded-lg", children: [_jsx("div", { className: "w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center", children: _jsx("span", { className: "text-sm font-bold text-green-600", children: "3" }) }), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "font-medium", children: "Monitor Performance" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Track optimization metrics and adjust strategies" })] }), _jsx(Button, { size: "sm", variant: "outline", children: "Set Alerts" })] })] }) })] }) })] })] }));
}
export default InventoryOptimization;
