import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { Alert, AlertDescription } from "../components/ui/alert";
import { useToast } from "../hooks/use-toast";
import { Brain, TrendingUp, TrendingDown, Package, Calendar, AlertTriangle, CheckCircle, RefreshCw, Settings, BarChart3, Target, Zap, Lightbulb } from "lucide-react";
export function InventoryAIForecasting() {
    const [forecasts, setForecasts] = useState([]);
    const [insights, setInsights] = useState(null);
    const [recommendations, setRecommendations] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState('30d');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedLocation, setSelectedLocation] = useState('all');
    const [forecastHorizon, setForecastHorizon] = useState('3m');
    const { toast } = useToast();
    useEffect(() => {
        loadForecasts();
    }, [selectedPeriod, selectedCategory, selectedLocation, forecastHorizon]);
    const loadForecasts = async () => {
        setLoading(true);
        try {
            const [forecastsRes, insightsRes, recommendationsRes] = await Promise.all([
                fetch(`/api/inventory/ai/forecast?period=${selectedPeriod}&category=${selectedCategory}&location=${selectedLocation}&horizon=${forecastHorizon}`),
                fetch(`/api/inventory/ai/insights?period=${selectedPeriod}&category=${selectedCategory}&location=${selectedLocation}`),
                fetch(`/api/inventory/ai/recommendations?period=${selectedPeriod}&category=${selectedCategory}&location=${selectedLocation}`)
            ]);
            if (forecastsRes.ok) {
                const forecastsData = await forecastsRes.json();
                setForecasts(forecastsData);
            }
            if (insightsRes.ok) {
                const insightsData = await insightsRes.json();
                console.log('AI Insights received:', insightsData);
                setInsights(insightsData);
            }
            if (recommendationsRes.ok) {
                const recommendationsData = await recommendationsRes.json();
                setRecommendations(recommendationsData);
            }
        }
        catch (error) {
            console.error('Error loading forecasts:', error);
            toast({
                title: "Error",
                description: "Failed to load AI forecasts",
                variant: "destructive"
            });
        }
        finally {
            setLoading(false);
        }
    };
    const getRiskColor = (risk) => {
        switch (risk) {
            case 'low': return 'text-green-600';
            case 'medium': return 'text-yellow-600';
            case 'high': return 'text-red-600';
            default: return 'text-gray-600';
        }
    };
    const getRiskBadge = (risk) => {
        switch (risk) {
            case 'low': return 'bg-green-100 text-green-800';
            case 'medium': return 'bg-yellow-100 text-yellow-800';
            case 'high': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    const getUrgencyIcon = (urgency) => {
        switch (urgency) {
            case 'high': return _jsx(AlertTriangle, { className: "w-4 h-4 text-red-600" });
            case 'medium': return _jsx(AlertTriangle, { className: "w-4 h-4 text-yellow-600" });
            case 'low': return _jsx(CheckCircle, { className: "w-4 h-4 text-green-600" });
            default: return _jsx(Package, { className: "w-4 h-4 text-gray-600" });
        }
    };
    const getTrendIcon = (trend) => {
        switch (trend) {
            case 'increasing': return _jsx(TrendingUp, { className: "w-4 h-4 text-green-600" });
            case 'decreasing': return _jsx(TrendingDown, { className: "w-4 h-4 text-red-600" });
            case 'stable': return _jsx(BarChart3, { className: "w-4 h-4 text-blue-600" });
            default: return _jsx(BarChart3, { className: "w-4 h-4 text-gray-600" });
        }
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-balance", children: "AI Demand Forecasting" }), _jsx("p", { className: "text-muted-foreground", children: "Predictive analytics powered by machine learning for optimal inventory management" })] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Select, { value: selectedPeriod, onValueChange: setSelectedPeriod, children: [_jsx(SelectTrigger, { className: "w-40", children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "7d", children: "Last 7 days" }), _jsx(SelectItem, { value: "30d", children: "Last 30 days" }), _jsx(SelectItem, { value: "90d", children: "Last 90 days" }), _jsx(SelectItem, { value: "1y", children: "Last year" })] })] }), _jsxs(Select, { value: forecastHorizon, onValueChange: setForecastHorizon, children: [_jsx(SelectTrigger, { className: "w-40", children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "1m", children: "1 Month" }), _jsx(SelectItem, { value: "3m", children: "3 Months" }), _jsx(SelectItem, { value: "6m", children: "6 Months" }), _jsx(SelectItem, { value: "1y", children: "1 Year" })] })] }), _jsxs(Button, { variant: "outline", onClick: loadForecasts, disabled: loading, children: [_jsx(RefreshCw, { className: `w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}` }), "Refresh"] }), _jsxs(Button, { variant: "outline", children: [_jsx(Settings, { className: "w-4 h-4 mr-2" }), "Settings"] })] })] }), insights && (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center", children: _jsx(Brain, { className: "w-5 h-5 text-purple-600" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-muted-foreground", children: "Forecast Accuracy" }), _jsxs("p", { className: "text-xl font-bold", children: [(insights.overallAccuracy * 100).toFixed(1), "%"] })] })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center", children: _jsx(Target, { className: "w-5 h-5 text-green-600" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-muted-foreground", children: "Top Performers" }), _jsx("p", { className: "text-xl font-bold", children: insights.topPerformingProducts.length })] })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center", children: _jsx(Calendar, { className: "w-5 h-5 text-blue-600" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-muted-foreground", children: "Seasonal Trends" }), _jsx("p", { className: "text-xl font-bold", children: insights.seasonalTrends.length })] })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center", children: _jsx(AlertTriangle, { className: "w-5 h-5 text-red-600" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-muted-foreground", children: "Risk Alerts" }), _jsx("p", { className: "text-xl font-bold", children: insights.riskAlerts.length })] })] }) }) })] })), insights?.riskAlerts && insights.riskAlerts.length > 0 && (_jsxs(Alert, { children: [_jsx(AlertTriangle, { className: "h-4 w-4" }), _jsx(AlertDescription, { children: _jsxs("div", { className: "space-y-2", children: [_jsx("p", { className: "font-medium", children: "AI Risk Alerts Detected" }), _jsx("div", { className: "space-y-1", children: insights.riskAlerts.slice(0, 3).map((alert, index) => (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Badge, { className: getRiskBadge(alert.severity), children: alert.severity.toUpperCase() }), _jsxs("span", { className: "text-sm", children: [alert.productName, ": ", alert.description] })] }, index))) })] }) })] })), recommendations && (_jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Zap, { className: "w-5 h-5" }), "Reorder Suggestions"] }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: recommendations.reorderSuggestions.slice(0, 5).map((suggestion) => (_jsxs("div", { className: "p-3 border rounded-lg", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsxs("div", { children: [_jsx("p", { className: "font-medium", children: suggestion.productName }), _jsxs("p", { className: "text-sm text-muted-foreground", children: ["Current: ", suggestion.currentStock, " \u2022 Suggested: ", suggestion.suggestedQuantity] })] }), getUrgencyIcon(suggestion.urgency)] }), _jsx("p", { className: "text-sm text-muted-foreground", children: suggestion.reasoning }), _jsx("div", { className: "mt-2", children: _jsxs(Badge, { className: getRiskBadge(suggestion.urgency), children: [suggestion.urgency.toUpperCase(), " PRIORITY"] }) })] }, suggestion.productId))) }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(TrendingUp, { className: "w-5 h-5" }), "Pricing Optimizations"] }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: recommendations.pricingOptimizations.slice(0, 5).map((optimization) => (_jsxs("div", { className: "p-3 border rounded-lg", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsxs("div", { children: [_jsx("p", { className: "font-medium", children: optimization.productName }), _jsxs("p", { className: "text-sm text-muted-foreground", children: ["$", optimization.currentPrice, " \u2192 $", optimization.suggestedPrice] })] }), _jsx(TrendingUp, { className: "w-4 h-4 text-green-600" })] }), _jsx("p", { className: "text-sm text-muted-foreground", children: optimization.expectedImpact })] }, optimization.productId))) }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Lightbulb, { className: "w-5 h-5" }), "Inventory Optimizations"] }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: recommendations.inventoryOptimizations.map((optimization) => (_jsxs("div", { className: "p-3 border rounded-lg", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsxs("div", { children: [_jsx("p", { className: "font-medium", children: optimization.category }), _jsxs("p", { className: "text-sm text-muted-foreground", children: ["$", optimization.currentValue, " \u2192 $", optimization.suggestedValue] })] }), _jsx(Target, { className: "w-4 h-4 text-blue-600" })] }), _jsx("p", { className: "text-sm text-muted-foreground", children: optimization.optimization })] }, optimization.category))) }) })] })] })), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Brain, { className: "w-5 h-5" }), "Product Demand Forecasts"] }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-6", children: forecasts.map((forecast) => (_jsxs("div", { className: "p-4 border rounded-lg", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-medium", children: forecast.productName }), _jsx("p", { className: "text-sm text-muted-foreground", children: forecast.sku })] }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("div", { className: "text-center", children: [_jsx("p", { className: "font-medium", children: forecast.currentStock }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Current Stock" })] }), _jsxs(Badge, { className: getRiskBadge(forecast.recommendations.riskLevel), children: [forecast.recommendations.riskLevel.toUpperCase(), " RISK"] })] })] }), _jsxs("div", { className: "space-y-3 mb-4", children: [_jsx("h4", { className: "font-medium", children: "Forecasted Demand" }), _jsx("div", { className: "space-y-2", children: forecast.forecastedDemand.map((period) => (_jsxs("div", { className: "flex items-center justify-between p-2 bg-muted/50 rounded", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("span", { className: "text-sm font-medium", children: period.period }), getTrendIcon(period.trend)] }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("div", { className: "text-center", children: [_jsx("p", { className: "font-medium", children: period.predictedDemand }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Predicted" })] }), _jsxs("div", { className: "text-center", children: [_jsxs("p", { className: "font-medium", children: [(period.confidence * 100).toFixed(0), "%"] }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Confidence" })] }), _jsxs("div", { className: "text-center", children: [_jsx("p", { className: "font-medium", children: period.seasonality.toFixed(2) }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Seasonality" })] })] })] }, period.period))) })] }), _jsxs("div", { className: "p-3 bg-blue-50 border border-blue-200 rounded-lg", children: [_jsx("h4", { className: "font-medium text-blue-800 mb-2", children: "AI Recommendations" }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm text-blue-700", children: "Suggested Reorder Quantity:" }), _jsx("span", { className: "font-medium text-blue-800", children: forecast.recommendations.suggestedReorderQuantity })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm text-blue-700", children: "Suggested Reorder Date:" }), _jsx("span", { className: "font-medium text-blue-800", children: forecast.recommendations.suggestedReorderDate })] }), _jsx("p", { className: "text-sm text-blue-700 mt-2", children: forecast.recommendations.reasoning })] })] })] }, forecast.productId))) }) })] }), insights?.seasonalTrends && (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Calendar, { className: "w-5 h-5" }), "Seasonal Demand Patterns"] }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: insights.seasonalTrends.map((trend) => (_jsxs("div", { className: "flex items-center justify-between p-3 border rounded-lg", children: [_jsxs("div", { children: [_jsx("p", { className: "font-medium", children: trend.month }), _jsxs("p", { className: "text-sm text-muted-foreground", children: ["Average Demand: ", trend.averageDemand] })] }), _jsxs("div", { className: "text-right", children: [_jsx("p", { className: "font-medium", children: trend.seasonalityFactor.toFixed(2) }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Seasonality Factor" })] })] }, trend.month))) }) })] }))] }));
}
