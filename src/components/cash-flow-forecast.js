import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { TrendingUp, TrendingDown, DollarSign, Calendar } from "lucide-react";
import { bankingApi } from '@/lib/api/banking';
export function CashFlowForecast({ companyId }) {
    const [bankAccounts, setBankAccounts] = useState([]);
    const [selectedAccountId, setSelectedAccountId] = useState('');
    const [forecastDays, setForecastDays] = useState(30);
    const [forecastData, setForecastData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    useEffect(() => {
        loadBankAccounts();
    }, []);
    useEffect(() => {
        if (selectedAccountId) {
            generateForecast();
        }
    }, [selectedAccountId, forecastDays]);
    const loadBankAccounts = async () => {
        try {
            const currentCompanyId = companyId || localStorage.getItem('company_id') || localStorage.getItem('companyId') || 'seed-company-1';
            const accounts = await bankingApi.getBankAccounts(currentCompanyId);
            setBankAccounts(accounts);
            if (accounts.length > 0) {
                setSelectedAccountId(accounts[0].id);
            }
        }
        catch (error) {
            console.error('Error loading bank accounts:', error);
            setError('Failed to load bank accounts');
        }
    };
    const generateForecast = async () => {
        if (!selectedAccountId)
            return;
        setLoading(true);
        setError(null);
        try {
            const currentCompanyId = companyId || localStorage.getItem('company_id') || localStorage.getItem('companyId') || 'seed-company-1';
            const response = await fetch(`/api/cash-flow-forecast?bankAccountId=${selectedAccountId}&companyId=${currentCompanyId}&days=${forecastDays}`, {
                headers: {
                    'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo',
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
            });
            if (!response.ok) {
                throw new Error('Failed to generate forecast');
            }
            const data = await response.json();
            setForecastData(data);
        }
        catch (error) {
            console.error('Error generating forecast:', error);
            setError(error.message || 'Failed to generate forecast');
        }
        finally {
            setLoading(false);
        }
    };
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    };
    const getConfidenceColor = (confidence) => {
        if (confidence >= 0.8)
            return 'bg-green-100 text-green-800';
        if (confidence >= 0.6)
            return 'bg-yellow-100 text-yellow-800';
        return 'bg-red-100 text-red-800';
    };
    const selectedAccount = bankAccounts.find(acc => acc.id === selectedAccountId);
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(TrendingUp, { className: "w-5 h-5" }), "Cash Flow Forecast"] }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "flex gap-4 items-end", children: [_jsxs("div", { className: "flex-1", children: [_jsx("label", { className: "text-sm font-medium mb-2 block", children: "Bank Account" }), _jsxs(Select, { value: selectedAccountId, onValueChange: setSelectedAccountId, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select bank account" }) }), _jsx(SelectContent, { children: bankAccounts.map((account) => (_jsxs(SelectItem, { value: account.id, children: [account.bankName, " - ", account.accountNumber] }, account.id))) })] })] }), _jsxs("div", { className: "w-32", children: [_jsx("label", { className: "text-sm font-medium mb-2 block", children: "Forecast Period" }), _jsxs(Select, { value: forecastDays.toString(), onValueChange: (value) => setForecastDays(parseInt(value)), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "7", children: "7 days" }), _jsx(SelectItem, { value: "14", children: "14 days" }), _jsx(SelectItem, { value: "30", children: "30 days" }), _jsx(SelectItem, { value: "60", children: "60 days" }), _jsx(SelectItem, { value: "90", children: "90 days" })] })] })] }), _jsx(Button, { onClick: generateForecast, disabled: loading || !selectedAccountId, children: loading ? 'Generating...' : 'Generate Forecast' })] }), error && (_jsx("div", { className: "text-red-500 text-sm bg-red-50 p-3 rounded", children: error }))] })] }), forecastData && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsx(Card, { children: _jsxs(CardContent, { className: "p-4", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(DollarSign, { className: "w-4 h-4 text-green-600" }), _jsx("span", { className: "text-sm font-medium", children: "Current Balance" })] }), _jsx("p", { className: "text-2xl font-bold text-green-600", children: formatCurrency(forecastData.currentBalance) })] }) }), _jsx(Card, { children: _jsxs(CardContent, { className: "p-4", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(TrendingUp, { className: "w-4 h-4 text-blue-600" }), _jsx("span", { className: "text-sm font-medium", children: "Avg Daily Change" })] }), _jsx("p", { className: "text-2xl font-bold", children: formatCurrency(forecastData.analysis.averageDailyChange) })] }) }), _jsx(Card, { children: _jsxs(CardContent, { className: "p-4", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Calendar, { className: "w-4 h-4 text-purple-600" }), _jsx("span", { className: "text-sm font-medium", children: "Transactions Analyzed" })] }), _jsx("p", { className: "text-2xl font-bold", children: forecastData.analysis.transactionCount })] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Projected Balance Over Time" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-3", children: [forecastData.forecast.slice(0, 14).map((day, index) => (_jsxs("div", { className: "flex items-center justify-between p-3 bg-gray-50 rounded-lg", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("span", { className: "text-sm font-medium w-20", children: formatDate(day.date) }), _jsxs("div", { className: "flex items-center gap-2", children: [day.expectedChange > 0 ? (_jsx(TrendingUp, { className: "w-4 h-4 text-green-600" })) : day.expectedChange < 0 ? (_jsx(TrendingDown, { className: "w-4 h-4 text-red-600" })) : null, _jsxs("span", { className: `text-sm ${day.expectedChange > 0 ? 'text-green-600' : day.expectedChange < 0 ? 'text-red-600' : 'text-gray-600'}`, children: [day.expectedChange > 0 ? '+' : '', formatCurrency(day.expectedChange)] })] })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("span", { className: "font-medium", children: formatCurrency(day.projectedBalance) }), _jsxs(Badge, { className: getConfidenceColor(day.confidence), children: [Math.round(day.confidence * 100), "%"] })] })] }, index))), forecastData.forecast.length > 14 && (_jsxs("div", { className: "text-center text-sm text-gray-500 pt-2", children: ["... and ", forecastData.forecast.length - 14, " more days"] }))] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Analysis Summary" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("h4", { className: "font-medium mb-2", children: "Daily Patterns" }), _jsx("div", { className: "space-y-1 text-sm", children: Object.entries(forecastData.analysis.dailyAverages).map(([day, avg]) => (_jsxs("div", { className: "flex justify-between", children: [_jsxs("span", { children: [['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][parseInt(day)], ":"] }), _jsx("span", { className: avg > 0 ? 'text-green-600' : avg < 0 ? 'text-red-600' : 'text-gray-600', children: formatCurrency(avg) })] }, day))) })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-medium mb-2", children: "Patterns Identified" }), _jsxs("div", { className: "space-y-2 text-sm", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Recurring Patterns:" }), _jsx("span", { children: forecastData.analysis.recurringPatterns })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Total Transactions:" }), _jsx("span", { children: forecastData.analysis.transactionCount })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Forecast Period:" }), _jsxs("span", { children: [forecastDays, " days"] })] })] })] })] }) })] })] }))] }));
}
