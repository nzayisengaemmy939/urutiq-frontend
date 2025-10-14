import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { ArrowUpDown, TrendingUp, TrendingDown, RefreshCw, Calculator, Globe, AlertCircle, Clock, DollarSign, Euro, PoundSterling, Circle, Play, Square, Settings } from "lucide-react";
import { bankingApi } from '@/lib/api/banking';
import { getApiUrl, getAuthHeaders } from '@/lib/config';
import { currencyService } from '@/services/currency-service';
import { useToast } from '@/hooks/use-toast';
import { CurrencyAnalytics } from './currency-analytics';
import { CurrencyChart } from './currency-chart';
export function CurrencyDashboard() {
    const [currencies, setCurrencies] = useState({});
    const [fromCurrency, setFromCurrency] = useState('USD');
    const [toCurrency, setToCurrency] = useState('EUR');
    const [amount, setAmount] = useState('100');
    const [conversion, setConversion] = useState(null);
    const [exchangeRate, setExchangeRate] = useState(null);
    const [loading, setLoading] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [popularRates, setPopularRates] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [isLiveMode, setIsLiveMode] = useState(false);
    const [refreshInterval, setRefreshInterval] = useState(null);
    const [newAlert, setNewAlert] = useState({
        fromCurrency: 'USD',
        toCurrency: 'EUR',
        targetRate: 0.85,
        condition: 'below'
    });
    const { toast } = useToast();
    // Load currencies on component mount
    useEffect(() => {
        loadCurrencies();
        loadPopularRates();
        loadAlerts();
    }, []);
    const loadCurrencies = async () => {
        try {
            const response = await bankingApi.getCurrencies();
            setCurrencies(response.currencies);
        }
        catch (error) {
            toast({
                title: "Error",
                description: "Failed to load currencies",
                variant: "destructive"
            });
        }
    };
    const loadPopularRates = async () => {
        try {
            const popularPairs = [
                { from: 'USD', to: 'EUR' },
                { from: 'USD', to: 'GBP' },
                { from: 'USD', to: 'JPY' },
                { from: 'EUR', to: 'GBP' },
                { from: 'USD', to: 'CAD' },
                { from: 'USD', to: 'AUD' },
                { from: 'USD', to: 'FRW' },
                { from: 'EUR', to: 'FRW' }
            ];
            const rates = await Promise.all(popularPairs.map(async (pair) => {
                try {
                    const response = await bankingApi.getExchangeRate(pair.from, pair.to);
                    // Handle the response structure - the API returns { success: true, rate: {...} }
                    return response.rate;
                }
                catch (error) {
                    return null;
                }
            }));
            setPopularRates(rates.filter(rate => rate !== null));
        }
        catch (error) {
        }
    };
    const loadAlerts = async () => {
        try {
            const companyId = localStorage.getItem('company_id') || localStorage.getItem('companyId') || 'seed-company-1';
            const response = await fetch(getApiUrl(`api/currency-alerts?companyId=${companyId}`), {
                headers: {
                    ...getAuthHeaders(),
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setAlerts(data.alerts || []);
            }
            else {
                // Provide mock data when API is not available
                setAlerts([
                    {
                        id: '1',
                        fromCurrency: 'USD',
                        toCurrency: 'EUR',
                        targetRate: 0.85,
                        currentRate: 0.87,
                        condition: 'above',
                        isActive: true,
                        createdAt: new Date().toISOString()
                    },
                    {
                        id: '2',
                        fromCurrency: 'USD',
                        toCurrency: 'GBP',
                        targetRate: 0.75,
                        currentRate: 0.73,
                        condition: 'below',
                        isActive: true,
                        createdAt: new Date().toISOString()
                    }
                ]);
            }
        }
        catch (error) {
            console.error('Error loading currency alerts:', error);
            // Provide mock data when API is not available
            setAlerts([
                {
                    id: '1',
                    fromCurrency: 'USD',
                    toCurrency: 'EUR',
                    targetRate: 0.85,
                    currentRate: 0.87,
                    condition: 'above',
                    isActive: true,
                    createdAt: new Date().toISOString()
                },
                {
                    id: '2',
                    fromCurrency: 'USD',
                    toCurrency: 'GBP',
                    targetRate: 0.75,
                    currentRate: 0.73,
                    condition: 'below',
                    isActive: true,
                    createdAt: new Date().toISOString()
                }
            ]);
        }
    };
    const convertCurrency = async () => {
        if (!amount || !fromCurrency || !toCurrency)
            return;
        setLoading(true);
        try {
            // Check if user is authenticated, if not get a demo token
            const token = localStorage.getItem('auth_token');
            if (!token) {
                try {
                    const demoResponse = await fetch(getApiUrl('auth/demo-token'), {
                        method: 'POST',
                        headers: getAuthHeaders(),
                        body: JSON.stringify({ sub: 'demo-user-1', tenantId: 'tenant_demo', roles: ['admin', 'accountant'] })
                    });
                    const demoData = await demoResponse.json();
                    if (demoData.token) {
                        localStorage.setItem('auth_token', demoData.token);
                        localStorage.setItem('tenant_id', 'tenant_demo');
                    }
                }
                catch (error) {
                }
            }
            const response = await bankingApi.convertCurrency(Number(amount), fromCurrency, toCurrency);
            // Handle the response structure - the API returns { success: true, conversion: {...} }
            const conversionData = response.conversion;
            if (!conversionData) {
                // If response is empty, it might be an authentication or API error
                if (Object.keys(response || {}).length === 0) {
                    throw new Error('Empty response from currency conversion API - check authentication and API status');
                }
                throw new Error('Invalid response structure from currency conversion API');
            }
            setConversion(conversionData);
            setLastUpdated(new Date());
            toast({
                title: "Conversion Complete",
                description: `${amount} ${fromCurrency} = ${conversionData.convertedAmount?.toFixed(2) || '0.00'} ${toCurrency}`,
            });
        }
        catch (error) {
            toast({
                title: "Conversion Failed",
                description: "Failed to convert currency",
                variant: "destructive"
            });
        }
        finally {
            setLoading(false);
        }
    };
    const getExchangeRate = async () => {
        if (!fromCurrency || !toCurrency)
            return;
        setLoading(true);
        try {
            const response = await bankingApi.getExchangeRate(fromCurrency, toCurrency);
            // Handle the response structure - the API returns { success: true, rate: {...} }
            const rateData = response.rate;
            setExchangeRate(rateData);
            setLastUpdated(new Date());
        }
        catch (error) {
            toast({
                title: "Error",
                description: "Failed to get exchange rate",
                variant: "destructive"
            });
        }
        finally {
            setLoading(false);
        }
    };
    const refreshRates = async () => {
        setLoading(true);
        try {
            await loadPopularRates();
            if (fromCurrency && toCurrency) {
                await getExchangeRate();
            }
            if (!isLiveMode) {
                toast({
                    title: "Rates Updated",
                    description: "Exchange rates have been refreshed",
                });
            }
        }
        catch (error) {
            toast({
                title: "Error",
                description: "Failed to refresh rates",
                variant: "destructive"
            });
        }
        finally {
            setLoading(false);
        }
    };
    const startLiveRates = () => {
        if (refreshInterval)
            return; // Already running
        setIsLiveMode(true);
        const interval = setInterval(() => {
            refreshRates();
        }, 30000); // Refresh every 30 seconds
        setRefreshInterval(interval);
        toast({
            title: "Live Rates Started",
            description: "Exchange rates will refresh every 30 seconds",
        });
    };
    const stopLiveRates = () => {
        if (refreshInterval) {
            clearInterval(refreshInterval);
            setRefreshInterval(null);
        }
        setIsLiveMode(false);
        toast({
            title: "Live Rates Stopped",
            description: "Exchange rates will no longer auto-refresh",
        });
    };
    // Cleanup interval on unmount
    useEffect(() => {
        return () => {
            if (refreshInterval) {
                clearInterval(refreshInterval);
            }
        };
    }, [refreshInterval]);
    const getCurrencyIcon = (currency) => {
        switch (currency) {
            case 'USD': return _jsx(DollarSign, { className: "w-4 h-4" });
            case 'EUR': return _jsx(Euro, { className: "w-4 h-4" });
            case 'GBP': return _jsx(PoundSterling, { className: "w-4 h-4" });
            case 'JPY': return _jsx(Circle, { className: "w-4 h-4" });
            case 'FRW': return _jsx(Globe, { className: "w-4 h-4" });
            default: return _jsx(Globe, { className: "w-4 h-4" });
        }
    };
    const formatCurrency = (amount, currency) => {
        const currencyInfo = currencies[currency];
        if (!currencyInfo)
            return `${amount.toFixed(2)} ${currency}`;
        const formattedAmount = amount.toFixed(currencyInfo.decimals);
        return `${currencyInfo.symbol}${formattedAmount}`;
    };
    const getRateChange = (_rate) => {
        // TODO: Implement real rate change calculation using historical data
        // For now, return null to indicate no change data available
        return null;
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold", children: "Multi-Currency Dashboard" }), _jsx("p", { className: "text-muted-foreground", children: "Real-time exchange rates and currency conversion" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [isLiveMode ? (_jsxs(Button, { onClick: stopLiveRates, variant: "destructive", children: [_jsx(Square, { className: "w-4 h-4 mr-2" }), "Stop Live"] })) : (_jsxs(Button, { onClick: startLiveRates, variant: "default", children: [_jsx(Play, { className: "w-4 h-4 mr-2" }), "Start Live"] })), _jsxs(Button, { onClick: refreshRates, disabled: loading, variant: "outline", children: [_jsx(RefreshCw, { className: `w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}` }), "Refresh Rates"] }), lastUpdated && (_jsxs(Badge, { variant: isLiveMode ? "default" : "secondary", className: "text-xs", children: [_jsx(Clock, { className: "w-3 h-3 mr-1" }), isLiveMode ? "Live" : "Updated", " ", lastUpdated.toLocaleTimeString()] }))] })] }), _jsxs(Tabs, { defaultValue: "converter", className: "space-y-6", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-6", children: [_jsx(TabsTrigger, { value: "converter", children: "Converter" }), _jsx(TabsTrigger, { value: "rates", children: "Live Rates" }), _jsx(TabsTrigger, { value: "chart", children: "Chart" }), _jsx(TabsTrigger, { value: "analytics", children: "Analytics" }), _jsx(TabsTrigger, { value: "alerts", children: "Alerts" }), _jsx(TabsTrigger, { value: "settings", children: "Settings" })] }), _jsx(TabsContent, { value: "converter", className: "space-y-6", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Calculator, { className: "w-5 h-5" }), "Currency Converter"] }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "amount", children: "Amount" }), _jsx(Input, { id: "amount", type: "number", value: amount, onChange: (e) => setAmount(e.target.value), placeholder: "Enter amount" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "from-currency", children: "From" }), _jsxs(Select, { value: fromCurrency, onValueChange: setFromCurrency, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsx(SelectContent, { children: Object.entries(currencies).map(([code, info]) => (_jsx(SelectItem, { value: code, children: _jsxs("div", { className: "flex items-center gap-2", children: [getCurrencyIcon(code), code, " - ", info.name] }) }, code))) })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "to-currency", children: "To" }), _jsxs(Select, { value: toCurrency, onValueChange: setToCurrency, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsx(SelectContent, { children: Object.entries(currencies).map(([code, info]) => (_jsx(SelectItem, { value: code, children: _jsxs("div", { className: "flex items-center gap-2", children: [getCurrencyIcon(code), code, " - ", info.name] }) }, code))) })] })] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { onClick: convertCurrency, disabled: loading, className: "flex-1", children: [_jsx(ArrowUpDown, { className: "w-4 h-4 mr-2" }), "Convert"] }), _jsx(Button, { onClick: getExchangeRate, disabled: loading, variant: "outline", children: "Get Rate" })] }), conversion && (_jsx("div", { className: "p-4 bg-muted rounded-lg", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-2xl font-bold", children: formatCurrency(conversion.convertedAmount || 0, conversion.toCurrency) }), _jsxs("div", { className: "text-sm text-muted-foreground", children: [formatCurrency(conversion.amount || 0, conversion.fromCurrency), " at ", conversion.rate?.toFixed(4) || '0.0000', " rate"] }), _jsxs("div", { className: "text-xs text-muted-foreground mt-1", children: ["Updated ", new Date(conversion.timestamp).toLocaleString()] })] }) })), exchangeRate && (_jsx("div", { className: "p-4 bg-muted rounded-lg", children: _jsxs("div", { className: "text-center", children: [_jsxs("div", { className: "text-lg font-semibold", children: ["1 ", exchangeRate.fromCurrency, " = ", exchangeRate.rate?.toFixed(4) || '0.0000', " ", exchangeRate.toCurrency] }), _jsxs("div", { className: "text-xs text-muted-foreground mt-1", children: ["Source: ", exchangeRate.source, " \u2022 ", new Date(exchangeRate.timestamp).toLocaleString()] })] }) }))] })] }) }), _jsx(TabsContent, { value: "rates", className: "space-y-6", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(TrendingUp, { className: "w-5 h-5" }), "Live Exchange Rates"] }) }), _jsx(CardContent, { children: _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: popularRates.map((rate, index) => {
                                            const change = getRateChange(rate);
                                            return (_jsxs("div", { className: "p-4 border rounded-lg", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsxs("div", { className: "flex items-center gap-2", children: [getCurrencyIcon(rate.fromCurrency), _jsx("span", { className: "font-semibold", children: rate.fromCurrency }), _jsx(ArrowUpDown, { className: "w-3 h-3 text-muted-foreground" }), getCurrencyIcon(rate.toCurrency), _jsx("span", { className: "font-semibold", children: rate.toCurrency })] }), change && (_jsxs(Badge, { variant: change.isPositive ? "default" : "destructive", children: [change.isPositive ? _jsx(TrendingUp, { className: "w-3 h-3 mr-1" }) : _jsx(TrendingDown, { className: "w-3 h-3 mr-1" }), change.percentage, "%"] }))] }), _jsx("div", { className: "text-2xl font-bold", children: rate.rate?.toFixed(4) || '0.0000' }), _jsx("div", { className: "text-xs text-muted-foreground", children: new Date(rate.timestamp).toLocaleString() })] }, index));
                                        }) }) })] }) }), _jsx(TabsContent, { value: "alerts", className: "space-y-6", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(AlertCircle, { className: "w-5 h-5" }), "Currency Alerts"] }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "p-4 border rounded-lg", children: [_jsx("h4", { className: "font-semibold mb-3", children: "Create New Alert" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-3", children: [_jsxs(Select, { value: newAlert.fromCurrency, onValueChange: (value) => setNewAlert({ ...newAlert, fromCurrency: value }), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "From" }) }), _jsx(SelectContent, { children: Object.entries(currencies).map(([code, _info]) => (_jsx(SelectItem, { value: code, children: code }, code))) })] }), _jsxs(Select, { value: newAlert.toCurrency, onValueChange: (value) => setNewAlert({ ...newAlert, toCurrency: value }), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "To" }) }), _jsx(SelectContent, { children: Object.entries(currencies).map(([code, _info]) => (_jsx(SelectItem, { value: code, children: code }, code))) })] }), _jsx(Input, { type: "number", step: "0.0001", value: newAlert.targetRate, onChange: (e) => setNewAlert({ ...newAlert, targetRate: Number(e.target.value) }), placeholder: "Target Rate" }), _jsxs(Select, { value: newAlert.condition, onValueChange: (value) => setNewAlert({ ...newAlert, condition: value }), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "above", children: "Above" }), _jsx(SelectItem, { value: "below", children: "Below" })] })] })] }), _jsx(Button, { className: "mt-3", size: "sm", children: "Create Alert" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("h4", { className: "font-semibold", children: "Active Alerts" }), alerts.map((alert) => (_jsxs("div", { className: "p-3 border rounded-lg flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsxs("div", { className: "flex items-center gap-1", children: [getCurrencyIcon(alert.fromCurrency), _jsx("span", { className: "font-medium", children: alert.fromCurrency }), _jsx(ArrowUpDown, { className: "w-3 h-3 text-muted-foreground" }), getCurrencyIcon(alert.toCurrency), _jsx("span", { className: "font-medium", children: alert.toCurrency })] }), _jsxs(Badge, { variant: alert.condition === 'above' ? 'default' : 'destructive', children: [alert.condition === 'above' ? 'Above' : 'Below', " ", alert.targetRate] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("span", { className: "text-sm text-muted-foreground", children: ["Current: ", alert.currentRate?.toFixed(4) || '0.0000'] }), _jsx(Button, { size: "sm", variant: "outline", children: "Edit" }), _jsx(Button, { size: "sm", variant: "destructive", children: "Delete" })] })] }, alert.id)))] })] })] }) }), _jsx(TabsContent, { value: "chart", className: "space-y-6", children: _jsx(CurrencyChart, { fromCurrency: fromCurrency, toCurrency: toCurrency }) }), _jsx(TabsContent, { value: "analytics", className: "space-y-6", children: _jsx(CurrencyAnalytics, { fromCurrency: fromCurrency, toCurrency: toCurrency }) }), _jsx(TabsContent, { value: "settings", className: "space-y-6", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Settings, { className: "w-5 h-5" }), "Currency Settings"] }) }), _jsxs(CardContent, { className: "space-y-6", children: [_jsxs("div", { className: "space-y-4", children: [_jsx("h4", { className: "font-semibold", children: "Display Preferences" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Default From Currency" }), _jsxs(Select, { value: fromCurrency, onValueChange: setFromCurrency, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsx(SelectContent, { children: Object.entries(currencies).map(([code, info]) => (_jsx(SelectItem, { value: code, children: _jsxs("div", { className: "flex items-center gap-2", children: [getCurrencyIcon(code), code, " - ", info.name] }) }, code))) })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Default To Currency" }), _jsxs(Select, { value: toCurrency, onValueChange: setToCurrency, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsx(SelectContent, { children: Object.entries(currencies).map(([code, info]) => (_jsx(SelectItem, { value: code, children: _jsxs("div", { className: "flex items-center gap-2", children: [getCurrencyIcon(code), code, " - ", info.name] }) }, code))) })] })] })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsx("h4", { className: "font-semibold", children: "Live Rates Settings" }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx(Label, { children: "Auto-refresh interval" }), _jsxs(Select, { defaultValue: "30", children: [_jsx(SelectTrigger, { className: "w-32", children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "10", children: "10 seconds" }), _jsx(SelectItem, { value: "30", children: "30 seconds" }), _jsx(SelectItem, { value: "60", children: "1 minute" }), _jsx(SelectItem, { value: "300", children: "5 minutes" })] })] })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx(Label, { children: "Enable notifications" }), _jsx("input", { type: "checkbox", defaultChecked: true, className: "rounded" })] })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsx("h4", { className: "font-semibold", children: "Cache Management" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Button, { variant: "outline", onClick: () => currencyService.clearCache(), children: "Clear Cache" }), _jsx(Button, { variant: "outline", onClick: () => {
                                                                const stats = currencyService.getCacheStats();
                                                                toast({
                                                                    title: "Cache Stats",
                                                                    description: `Cache size: ${stats.size} items`,
                                                                });
                                                            }, children: "View Cache Stats" })] })] })] })] }) })] })] }));
}
