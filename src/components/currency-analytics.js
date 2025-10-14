import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { TrendingUp, TrendingDown, BarChart3, Activity, Target, Shield, RefreshCw, DollarSign, Euro, PoundSterling, Circle } from "lucide-react";
import { currencyService } from '@/services/currency-service';
import { useToast } from '@/hooks/use-toast';
export function CurrencyAnalytics({ fromCurrency, toCurrency }) {
    const [analytics, setAnalytics] = useState(null);
    const [pairs, setPairs] = useState([]);
    const [marketStatus, setMarketStatus] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState('7d');
    const { toast } = useToast();
    const loadAnalytics = async () => {
        setLoading(true);
        try {
            const [analyticsData, pairsData, marketData] = await Promise.all([
                currencyService.getCurrencyAnalytics(fromCurrency, toCurrency),
                currencyService.getPopularPairs(),
                currencyService.getMarketStatus()
            ]);
            setAnalytics(analyticsData);
            setPairs(pairsData);
            setMarketStatus(marketData);
        }
        catch (error) {
            console.error('Error loading analytics:', error);
            toast({
                title: "Error",
                description: "Failed to load currency analytics",
                variant: "destructive"
            });
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        if (fromCurrency && toCurrency) {
            loadAnalytics();
        }
    }, [fromCurrency, toCurrency]);
    const getCurrencyIcon = (currency) => {
        switch (currency) {
            case 'USD': return _jsx(DollarSign, { className: "w-4 h-4" });
            case 'EUR': return _jsx(Euro, { className: "w-4 h-4" });
            case 'GBP': return _jsx(PoundSterling, { className: "w-4 h-4" });
            default: return _jsx(Circle, { className: "w-4 h-4" });
        }
    };
    const getTrendIcon = (trend) => {
        switch (trend) {
            case 'bullish': return _jsx(TrendingUp, { className: "w-4 h-4 text-green-600" });
            case 'bearish': return _jsx(TrendingDown, { className: "w-4 h-4 text-red-600" });
            default: return _jsx(Activity, { className: "w-4 h-4 text-gray-600" });
        }
    };
    const getTrendColor = (trend) => {
        switch (trend) {
            case 'bullish': return 'text-green-600 bg-green-50';
            case 'bearish': return 'text-red-600 bg-red-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };
    const formatNumber = (num, decimals = 2) => {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(num);
    };
    const formatPercentage = (num) => {
        return `${num >= 0 ? '+' : ''}${num.toFixed(2)}%`;
    };
    if (loading) {
        return (_jsx("div", { className: "space-y-6", children: _jsx("div", { className: "flex items-center justify-center h-32", children: _jsx(RefreshCw, { className: "w-6 h-6 animate-spin" }) }) }));
    }
    return (_jsxs("div", { className: "space-y-6", children: [marketStatus && (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Activity, { className: "w-5 h-5" }), "Market Status"] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Badge, { variant: marketStatus.isOpen ? "default" : "secondary", children: marketStatus.isOpen ? "Open" : "Closed" }), _jsx("span", { className: "text-sm text-muted-foreground", children: marketStatus.timezone })] }), !marketStatus.isOpen && marketStatus.nextOpen && (_jsxs("div", { className: "text-sm text-muted-foreground", children: ["Opens: ", new Date(marketStatus.nextOpen).toLocaleString()] }))] }) })] })), analytics && (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-muted-foreground", children: "Volatility" }), _jsxs("p", { className: "text-2xl font-bold", children: [formatNumber(analytics.volatility), "%"] })] }), _jsx(BarChart3, { className: "w-8 h-8 text-blue-600" })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-muted-foreground", children: "Trend" }), _jsxs("div", { className: "flex items-center gap-2", children: [getTrendIcon(analytics.trend), _jsx("span", { className: "text-lg font-semibold capitalize", children: analytics.trend })] })] }), _jsx(Target, { className: "w-8 h-8 text-purple-600" })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-muted-foreground", children: "Support" }), _jsx("p", { className: "text-2xl font-bold", children: formatNumber(analytics.support, 4) })] }), _jsx(Shield, { className: "w-8 h-8 text-green-600" })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-muted-foreground", children: "Resistance" }), _jsx("p", { className: "text-2xl font-bold", children: formatNumber(analytics.resistance, 4) })] }), _jsx(Target, { className: "w-8 h-8 text-orange-600" })] }) }) })] })), analytics && (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(BarChart3, { className: "w-5 h-5" }), "Technical Indicators"] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [_jsxs("div", { className: "space-y-2", children: [_jsx("h4", { className: "font-semibold", children: "RSI (14)" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "text-2xl font-bold", children: formatNumber(analytics.rsi) }), _jsx(Badge, { variant: analytics.rsi > 70 ? "destructive" : analytics.rsi < 30 ? "default" : "secondary", children: analytics.rsi > 70 ? "Overbought" : analytics.rsi < 30 ? "Oversold" : "Neutral" })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("h4", { className: "font-semibold", children: "MA (7)" }), _jsx("div", { className: "text-2xl font-bold", children: formatNumber(analytics.movingAverage7, 4) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("h4", { className: "font-semibold", children: "MA (30)" }), _jsx("div", { className: "text-2xl font-bold", children: formatNumber(analytics.movingAverage30, 4) })] })] }) })] })), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Activity, { className: "w-5 h-5" }), "Popular Currency Pairs"] }), _jsxs(Select, { value: selectedPeriod, onValueChange: setSelectedPeriod, children: [_jsx(SelectTrigger, { className: "w-32", children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "1d", children: "1 Day" }), _jsx(SelectItem, { value: "7d", children: "7 Days" }), _jsx(SelectItem, { value: "30d", children: "30 Days" })] })] })] }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: pairs.map((pair, index) => (_jsxs("div", { className: "flex items-center justify-between p-4 border rounded-lg", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsxs("div", { className: "flex items-center gap-1", children: [getCurrencyIcon(pair.pair.split('/')[0]), _jsx("span", { className: "font-semibold", children: pair.pair.split('/')[0] }), _jsx("span", { className: "text-muted-foreground", children: "/" }), getCurrencyIcon(pair.pair.split('/')[1]), _jsx("span", { className: "font-semibold", children: pair.pair.split('/')[1] })] }), _jsx("div", { className: "text-2xl font-bold", children: formatNumber(pair.rate, 4) })] }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("div", { className: "text-right", children: [_jsx("div", { className: `text-sm ${pair.changePercent24h >= 0 ? 'text-green-600' : 'text-red-600'}`, children: formatPercentage(pair.changePercent24h) }), _jsx("div", { className: "text-xs text-muted-foreground", children: formatNumber(pair.change24h, 6) })] }), _jsxs("div", { className: "text-right", children: [_jsx("div", { className: "text-sm text-muted-foreground", children: "High" }), _jsx("div", { className: "text-sm font-semibold", children: formatNumber(pair.high24h, 4) })] }), _jsxs("div", { className: "text-right", children: [_jsx("div", { className: "text-sm text-muted-foreground", children: "Low" }), _jsx("div", { className: "text-sm font-semibold", children: formatNumber(pair.low24h, 4) })] }), _jsxs("div", { className: "text-right", children: [_jsx("div", { className: "text-sm text-muted-foreground", children: "Volume" }), _jsx("div", { className: "text-sm font-semibold", children: formatNumber(pair.volume24h) })] })] })] }, index))) }) })] }), _jsx("div", { className: "flex justify-center", children: _jsxs(Button, { onClick: loadAnalytics, disabled: loading, variant: "outline", children: [_jsx(RefreshCw, { className: `w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}` }), "Refresh Analytics"] }) })] }));
}
