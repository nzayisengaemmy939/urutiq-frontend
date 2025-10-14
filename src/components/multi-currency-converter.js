import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { ArrowUpDown, RefreshCw, Calculator, Globe, Clock, Play, Square } from "lucide-react";
import { bankingApiV2 as bankingApi } from '@/lib/api/banking-v2';
import { getApiUrl, getAuthHeaders } from '@/lib/config';
import { useToast } from '@/hooks/use-toast';
export function MultiCurrencyConverter() {
    const [currencies, setCurrencies] = useState({});
    const [fromCurrency, setFromCurrency] = useState('USD');
    const [toCurrency, setToCurrency] = useState('EUR');
    const [amount, setAmount] = useState('100');
    const [conversion, setConversion] = useState(null);
    const [exchangeRate, setExchangeRate] = useState(null);
    const [loading, setLoading] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [isLiveMode, setIsLiveMode] = useState(false);
    const [refreshInterval, setRefreshInterval] = useState(null);
    const { toast } = useToast();
    useEffect(() => {
        loadCurrencies();
    }, []);
    useEffect(() => {
        if (Object.keys(currencies).length > 0) {
            loadExchangeRate();
        }
    }, [fromCurrency, toCurrency]);
    const loadCurrencies = async () => {
        try {
            const response = await bankingApi.getCurrencies();
            setCurrencies(response.currencies || {});
        }
        catch (error) {
        }
    };
    const loadExchangeRate = async () => {
        if (fromCurrency === toCurrency) {
            setExchangeRate({
                fromCurrency,
                toCurrency,
                rate: 1,
                timestamp: new Date().toISOString(),
                source: 'internal'
            });
            return;
        }
        try {
            const response = await bankingApi.getExchangeRate(fromCurrency, toCurrency);
            // Handle the response structure - the API returns { success: true, rate: {...} }
            const rateData = response.rate;
            setExchangeRate(rateData);
            setLastUpdated(new Date());
        }
        catch (error) {
        }
    };
    const forceRefreshRate = async () => {
        if (fromCurrency === toCurrency)
            return;
        setLoading(true);
        try {
            const response = await bankingApi.forceRefreshRate(fromCurrency, toCurrency);
            const rateData = response.rate;
            setExchangeRate(rateData);
            setLastUpdated(new Date());
            toast({
                title: "Rate Refreshed",
                description: `Fresh market rate: ${fromCurrency}/${toCurrency} = ${rateData.rate}`,
            });
        }
        catch (error) {
            toast({
                title: "Error",
                description: "Failed to refresh exchange rate from market data",
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
            loadExchangeRate();
        }, 30000); // Refresh every 30 seconds
        setRefreshInterval(interval);
    };
    const stopLiveRates = () => {
        if (refreshInterval) {
            clearInterval(refreshInterval);
            setRefreshInterval(null);
        }
        setIsLiveMode(false);
    };
    // Cleanup interval on unmount
    useEffect(() => {
        return () => {
            if (refreshInterval) {
                clearInterval(refreshInterval);
            }
        };
    }, [refreshInterval]);
    const convertCurrency = async () => {
        if (!amount || fromCurrency === toCurrency) {
            setConversion({
                amount: Number(amount),
                fromCurrency,
                toCurrency,
                convertedAmount: Number(amount),
                rate: 1,
                timestamp: new Date().toISOString()
            });
            return;
        }
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
            const response = await bankingApi.convertCurrency(fromCurrency, toCurrency, Number(amount));
            // Handle the response structure - the API returns { success: true, conversion: {...} }
            const conversionData = response.conversion;
            if (!conversionData) {
                throw new Error('Invalid response structure from currency conversion API');
            }
            setConversion(conversionData);
        }
        catch (error) {
        }
        finally {
            setLoading(false);
        }
    };
    const swapCurrencies = () => {
        const temp = fromCurrency;
        setFromCurrency(toCurrency);
        setToCurrency(temp);
    };
    const formatCurrency = (amount, currency) => {
        const currencyInfo = currencies[currency];
        if (!currencyInfo)
            return `${amount.toFixed(2)} ${currency}`;
        const formattedAmount = amount.toFixed(currencyInfo.decimals);
        switch (currency) {
            case 'USD':
            case 'CAD':
            case 'AUD':
            case 'NZD':
            case 'SGD':
            case 'HKD':
                return `${currencyInfo.symbol}${formattedAmount}`;
            case 'EUR':
                return `${formattedAmount} ${currencyInfo.symbol}`;
            case 'GBP':
                return `${currencyInfo.symbol}${formattedAmount}`;
            case 'JPY':
                return `${currencyInfo.symbol}${formattedAmount}`;
            default:
                return `${formattedAmount} ${currencyInfo.symbol}`;
        }
    };
    const formatExchangeRate = (rate) => {
        // Show more precision for exchange rates (6 decimal places)
        return rate.toFixed(6);
    };
    const getRateChangeIcon = () => {
        if (!exchangeRate || exchangeRate.rate === 1)
            return null;
        // TODO: Implement real trend calculation using historical data
        // For now, return null to indicate no trend data available
        return null;
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Calculator, { className: "w-5 h-5 text-blue-600" }), "Currency Converter"] }), _jsxs("div", { className: "flex items-center gap-2", children: [isLiveMode ? (_jsxs(Button, { onClick: stopLiveRates, size: "sm", variant: "destructive", children: [_jsx(Square, { className: "w-3 h-3 mr-1" }), "Stop Live"] })) : (_jsxs(Button, { onClick: startLiveRates, size: "sm", variant: "default", children: [_jsx(Play, { className: "w-3 h-3 mr-1" }), "Start Live"] })), lastUpdated && (_jsxs(Badge, { variant: isLiveMode ? "default" : "secondary", className: "text-xs", children: [_jsx(Clock, { className: "w-3 h-3 mr-1" }), isLiveMode ? "Live" : "Updated", " ", lastUpdated.toLocaleTimeString()] }))] })] }) }), _jsxs(CardContent, { className: "space-y-6", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "amount", children: "Amount" }), _jsx(Input, { id: "amount", type: "number", value: amount, onChange: (e) => setAmount(e.target.value), placeholder: "Enter amount", className: "text-lg" })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 items-end", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "From" }), _jsxs(Select, { value: fromCurrency, onValueChange: setFromCurrency, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsx(SelectContent, { children: Object.entries(currencies).map(([code, info]) => (_jsx(SelectItem, { value: code, children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "font-medium", children: code }), _jsx("span", { className: "text-muted-foreground", children: info.name })] }) }, code))) })] })] }), _jsx("div", { className: "flex justify-center", children: _jsx(Button, { variant: "outline", size: "icon", onClick: swapCurrencies, className: "rounded-full", children: _jsx(ArrowUpDown, { className: "w-4 h-4" }) }) }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "To" }), _jsxs(Select, { value: toCurrency, onValueChange: setToCurrency, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsx(SelectContent, { children: Object.entries(currencies).map(([code, info]) => (_jsx(SelectItem, { value: code, children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "font-medium", children: code }), _jsx("span", { className: "text-muted-foreground", children: info.name })] }) }, code))) })] })] })] }), _jsx(Button, { onClick: convertCurrency, disabled: loading || !amount, className: "w-full", children: loading ? (_jsxs(_Fragment, { children: [_jsx(RefreshCw, { className: "w-4 h-4 mr-2 animate-spin" }), "Converting..."] })) : ('Convert Currency') }), _jsxs(Button, { onClick: forceRefreshRate, disabled: loading || fromCurrency === toCurrency, variant: "outline", className: "w-full", children: [_jsx(RefreshCw, { className: "w-4 h-4 mr-2" }), "Force Refresh Market Rate"] }), conversion && (_jsx(Card, { className: "bg-green-50 border-green-200", children: _jsx(CardContent, { className: "pt-6", children: _jsxs("div", { className: "text-center space-y-2", children: [_jsx("div", { className: "text-2xl font-bold text-green-600", children: formatCurrency(conversion.convertedAmount || 0, toCurrency) }), _jsxs("div", { className: "text-sm text-muted-foreground", children: [formatCurrency(conversion.amount || 0, fromCurrency), " = ", formatCurrency(conversion.convertedAmount || 0, toCurrency)] }), _jsxs("div", { className: "text-xs text-muted-foreground", children: ["Exchange rate: 1 ", fromCurrency, " = ", formatExchangeRate(conversion.rate || 0), " ", toCurrency] })] }) }) }))] })] }), exchangeRate && (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Globe, { className: "w-5 h-5 text-purple-600" }), "Exchange Rate Information"] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsxs("div", { className: "text-lg font-medium", children: ["1 ", fromCurrency, " = ", formatExchangeRate(exchangeRate.rate || 0), " ", toCurrency] }), _jsx("div", { className: "text-sm text-muted-foreground", children: exchangeRate.source === 'external_api' ? 'Live rate' : 'Internal rate' })] }), _jsxs("div", { className: "flex items-center gap-2", children: [getRateChangeIcon(), _jsx(Badge, { variant: "secondary", children: exchangeRate.source })] })] }), lastUpdated && (_jsxs("div", { className: "text-xs text-muted-foreground", children: ["Last updated: ", lastUpdated.toLocaleString()] })), _jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("div", { className: "font-medium", children: "From Currency" }), _jsxs("div", { className: "text-muted-foreground", children: [currencies[fromCurrency]?.name, " (", fromCurrency, ")"] })] }), _jsxs("div", { children: [_jsx("div", { className: "font-medium", children: "To Currency" }), _jsxs("div", { className: "text-muted-foreground", children: [currencies[toCurrency]?.name, " (", toCurrency, ")"] })] })] })] }) })] })), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Supported Currencies" }) }), _jsx(CardContent, { children: _jsx("div", { className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3", children: Object.entries(currencies).map(([code, info]) => (_jsxs("div", { className: "flex items-center gap-2 p-2 border rounded-lg", children: [_jsx("span", { className: "font-medium", children: code }), _jsx("span", { className: "text-sm text-muted-foreground", children: info.symbol }), _jsx("span", { className: "text-xs text-muted-foreground", children: info.name })] }, code))) }) })] })] }));
}
