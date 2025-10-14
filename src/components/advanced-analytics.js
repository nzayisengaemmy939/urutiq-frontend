import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { TrendingUp, TrendingDown, AlertTriangle, Lightbulb, Target, BarChart3, LineChart, Calendar, Zap } from "lucide-react";
import { bankingApiV2 as bankingApi } from '@/lib/api/banking-v2';
export function AdvancedAnalytics() {
    const [insights, setInsights] = useState([]);
    const [benchmarks, setBenchmarks] = useState([]);
    const [forecast, setForecast] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedIndustry, setSelectedIndustry] = useState('retail');
    const [activeTab, setActiveTab] = useState('insights');
    const industries = [
        { value: 'retail', label: 'Retail' },
        { value: 'saas', label: 'SaaS/Software' },
        { value: 'consulting', label: 'Consulting' },
        { value: 'manufacturing', label: 'Manufacturing' },
        { value: 'healthcare', label: 'Healthcare' },
        { value: 'general', label: 'General Business' }
    ];
    useEffect(() => {
        loadAnalyticsData();
    }, [selectedIndustry]);
    const loadAnalyticsData = useCallback(async () => {
        setLoading(true);
        try {
            // Load insights
            const insightsResponse = await bankingApi.get(`/api/analytics/insights?industry=${selectedIndustry}`);
            setInsights(insightsResponse.insights || []);
            // Load benchmarks
            const benchmarksResponse = await bankingApi.get(`/api/analytics/benchmarks/${selectedIndustry}`);
            setBenchmarks(benchmarksResponse.benchmarks || []);
            // Load forecast
            const forecastResponse = await bankingApi.get('/api/analytics/cash-flow-forecast?months=6');
            setForecast(forecastResponse.forecast || []);
        }
        catch (error) {
            console.error('Error loading analytics data:', error);
        }
        finally {
            setLoading(false);
        }
    }, [selectedIndustry]);
    const getInsightIcon = (type) => {
        switch (type) {
            case 'trend': return _jsx(TrendingUp, { className: "w-5 h-5 text-blue-600" });
            case 'anomaly': return _jsx(AlertTriangle, { className: "w-5 h-5 text-orange-600" });
            case 'recommendation': return _jsx(Lightbulb, { className: "w-5 h-5 text-green-600" });
            case 'forecast': return _jsx(Target, { className: "w-5 h-5 text-purple-600" });
            default: return _jsx(BarChart3, { className: "w-5 h-5 text-gray-600" });
        }
    };
    const getImpactColor = (impact) => {
        switch (impact) {
            case 'high': return 'text-red-600 bg-red-100';
            case 'medium': return 'text-yellow-600 bg-yellow-100';
            case 'low': return 'text-green-600 bg-green-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };
    const getCategoryColor = (category) => {
        switch (category) {
            case 'revenue': return 'text-green-600';
            case 'expenses': return 'text-red-600';
            case 'cash_flow': return 'text-blue-600';
            case 'profitability': return 'text-purple-600';
            case 'efficiency': return 'text-orange-600';
            default: return 'text-gray-600';
        }
    };
    const getComparisonIcon = (comparison) => {
        switch (comparison) {
            case 'above': return _jsx(TrendingUp, { className: "w-4 h-4 text-green-600" });
            case 'below': return _jsx(TrendingDown, { className: "w-4 h-4 text-red-600" });
            case 'average': return _jsx(BarChart3, { className: "w-4 h-4 text-blue-600" });
            default: return _jsx(BarChart3, { className: "w-4 h-4 text-gray-600" });
        }
    };
    if (loading) {
        return (_jsx("div", { className: "space-y-6", children: _jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [...Array(3)].map((_, i) => (_jsx(Card, { children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "animate-pulse", children: [_jsx("div", { className: "h-4 bg-gray-200 rounded w-3/4 mb-2" }), _jsx("div", { className: "h-8 bg-gray-200 rounded w-1/2" })] }) }) }, i))) }) }));
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h2", { className: "text-2xl font-bold", children: "Advanced Analytics" }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsxs(Select, { value: selectedIndustry, onValueChange: setSelectedIndustry, children: [_jsx(SelectTrigger, { className: "w-48", children: _jsx(SelectValue, {}) }), _jsx(SelectContent, { children: industries.map((industry) => (_jsx(SelectItem, { value: industry.value, children: industry.label }, industry.value))) })] }), _jsx(Button, { onClick: loadAnalyticsData, variant: "outline", children: "Refresh Data" })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsx(Card, { children: _jsxs(CardContent, { className: "p-6", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Lightbulb, { className: "w-5 h-5 text-green-600" }), _jsx("span", { className: "text-sm font-medium", children: "Insights" })] }), _jsx("div", { className: "text-2xl font-bold text-green-600", children: insights.length }), _jsxs("div", { className: "text-xs text-muted-foreground mt-1", children: [insights.filter(i => i.actionable).length, " actionable"] })] }) }), _jsx(Card, { children: _jsxs(CardContent, { className: "p-6", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Target, { className: "w-5 h-5 text-blue-600" }), _jsx("span", { className: "text-sm font-medium", children: "High Impact" })] }), _jsx("div", { className: "text-2xl font-bold text-blue-600", children: insights.filter(i => i.impact === 'high').length }), _jsx("div", { className: "text-xs text-muted-foreground mt-1", children: "Critical insights" })] }) }), _jsx(Card, { children: _jsxs(CardContent, { className: "p-6", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(BarChart3, { className: "w-5 h-5 text-purple-600" }), _jsx("span", { className: "text-sm font-medium", children: "Benchmarks" })] }), _jsx("div", { className: "text-2xl font-bold text-purple-600", children: benchmarks.length }), _jsx("div", { className: "text-xs text-muted-foreground mt-1", children: "Industry metrics" })] }) }), _jsx(Card, { children: _jsxs(CardContent, { className: "p-6", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Calendar, { className: "w-5 h-5 text-orange-600" }), _jsx("span", { className: "text-sm font-medium", children: "Forecast" })] }), _jsx("div", { className: "text-2xl font-bold text-orange-600", children: forecast.length }), _jsx("div", { className: "text-xs text-muted-foreground mt-1", children: "Months projected" })] }) })] }), _jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, children: [_jsxs(TabsList, { children: [_jsx(TabsTrigger, { value: "insights", children: "Financial Insights" }), _jsx(TabsTrigger, { value: "benchmarks", children: "Industry Benchmarks" }), _jsx(TabsTrigger, { value: "forecast", children: "Cash Flow Forecast" })] }), _jsx(TabsContent, { value: "insights", className: "space-y-4", children: _jsx("div", { className: "space-y-4", children: insights.map((insight) => (_jsx(Card, { className: "border-l-4 border-l-blue-500", children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex items-start gap-3", children: [getInsightIcon(insight.type), _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx("h3", { className: "font-semibold", children: insight.title }), _jsxs(Badge, { className: getImpactColor(insight.impact), children: [insight.impact, " impact"] }), _jsx(Badge, { variant: "outline", className: getCategoryColor(insight.category), children: insight.category.replace('_', ' ') })] }), _jsx("p", { className: "text-muted-foreground mb-3", children: insight.description }), insight.actionable && (_jsxs("div", { className: "flex items-center gap-2 text-sm text-green-600", children: [_jsx(Zap, { className: "w-4 h-4" }), "Actionable insight"] }))] })] }), _jsxs("div", { className: "text-right", children: [_jsxs("div", { className: "text-sm font-medium", children: [Math.round((insight.confidence || 0) * 100), "% confidence"] }), _jsx("div", { className: "text-xs text-muted-foreground", children: insight.createdAt ? new Date(insight.createdAt).toLocaleDateString() : 'N/A' })] })] }) }) }, insight.id))) }) }), _jsx(TabsContent, { value: "benchmarks", className: "space-y-4", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(BarChart3, { className: "w-5 h-5 text-purple-600" }), "Industry Benchmarks - ", selectedIndustry.charAt(0).toUpperCase() + selectedIndustry.slice(1)] }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: benchmarks.map((benchmark, index) => (_jsxs("div", { className: "flex items-center justify-between p-4 border rounded-lg", children: [_jsxs("div", { className: "flex items-center gap-3", children: [getComparisonIcon(benchmark.comparison), _jsxs("div", { children: [_jsx("div", { className: "font-medium", children: benchmark.metric }), _jsxs("div", { className: "text-sm text-muted-foreground", children: ["Industry benchmark: ", benchmark.value, "%"] })] })] }), _jsxs("div", { className: "text-right", children: [_jsxs("div", { className: "font-medium", children: [benchmark.percentile, "th percentile"] }), _jsx(Badge, { variant: benchmark.comparison === 'above' ? 'default' :
                                                                benchmark.comparison === 'below' ? 'destructive' : 'secondary', children: benchmark.comparison })] })] }, index))) }) })] }) }), _jsx(TabsContent, { value: "forecast", className: "space-y-4", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(LineChart, { className: "w-5 h-5 text-orange-600" }), "6-Month Cash Flow Forecast"] }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "space-y-4", children: forecast && forecast.length > 0 ? forecast.map((month, index) => {
                                                // Safety check for month object
                                                if (!month)
                                                    return null;
                                                return (_jsxs("div", { className: "flex items-center justify-between p-4 border rounded-lg", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Calendar, { className: "w-5 h-5 text-blue-600" }), _jsxs("div", { children: [_jsx("div", { className: "font-medium", children: month.period || 'N/A' }), _jsxs("div", { className: "text-sm text-muted-foreground", children: ["Confidence: ", Math.round((month.confidence || 0) * 100), "%"] })] })] }), _jsxs("div", { className: "flex items-center gap-6", children: [_jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-sm text-muted-foreground", children: "Inflow" }), _jsxs("div", { className: "font-medium text-green-600", children: ["$", (month.projectedInflow || 0).toFixed(2)] })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-sm text-muted-foreground", children: "Outflow" }), _jsxs("div", { className: "font-medium text-red-600", children: ["$", (month.projectedOutflow || 0).toFixed(2)] })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-sm text-muted-foreground", children: "Net" }), _jsxs("div", { className: `font-medium ${(month.netCashFlow || 0) > 0 ? 'text-green-600' : 'text-red-600'}`, children: ["$", (month.netCashFlow || 0).toFixed(2)] })] })] })] }, index));
                                            }) : (_jsx("div", { className: "text-center py-8 text-muted-foreground", children: "No forecast data available" })) }), _jsxs("div", { className: "mt-6 p-4 bg-blue-50 rounded-lg", children: [_jsx("h4", { className: "font-medium mb-2", children: "Forecast Factors" }), _jsx("ul", { className: "text-sm text-muted-foreground space-y-1", children: forecast && forecast[0]?.factors ? forecast[0].factors.map((factor, index) => (_jsxs("li", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-1 h-1 bg-blue-600 rounded-full" }), factor] }, index))) : (_jsx("li", { className: "text-muted-foreground", children: "No factors available" })) })] })] })] }) })] })] }));
}
