import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
;
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Building2, TrendingUp, TrendingDown, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';
const EnhancedBankIntegration = () => {
    const [bankConnections, setBankConnections] = useState([]);
    const [forecasts, setForecasts] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedConnection, setSelectedConnection] = useState('');
    const [forecastPeriod, setForecastPeriod] = useState('30d');
    useEffect(() => {
        loadBankConnections();
        loadForecasts();
    }, []);
    const loadBankConnections = async () => {
        try {
            const response = await fetch('/api/banking/connections', {
                headers: {
                    'x-tenant-id': 'default',
                    'x-company-id': 'default'
                }
            });
            const data = await response.json();
            if (data.success) {
                setBankConnections(data.data);
            }
        }
        catch (error) {
            console.error('Error loading bank connections:', error);
        }
    };
    const loadForecasts = async () => {
        try {
            const response = await fetch('/api/banking/forecasts?limit=5', {
                headers: {
                    'x-tenant-id': 'default',
                    'x-company-id': 'default'
                }
            });
            const data = await response.json();
            if (data.success) {
                setForecasts(data.data);
            }
        }
        catch (error) {
            console.error('Error loading forecasts:', error);
        }
    };
    const loadTransactions = async (connectionId) => {
        setLoading(true);
        try {
            const response = await fetch(`/api/banking/transactions?bankConnectionId=${connectionId}&limit=50`, {
                headers: {
                    'x-tenant-id': 'default',
                    'x-company-id': 'default'
                }
            });
            const data = await response.json();
            if (data.success) {
                setTransactions(data.data);
            }
        }
        catch (error) {
            console.error('Error loading transactions:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const syncBankAccount = async (connectionId) => {
        setLoading(true);
        try {
            const response = await fetch('/api/banking/sync', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-tenant-id': 'default',
                    'x-company-id': 'default'
                },
                body: JSON.stringify({
                    bankConnectionId: connectionId,
                    forceSync: true
                })
            });
            const data = await response.json();
            if (data.success) {
                loadBankConnections();
                if (selectedConnection === connectionId) {
                    loadTransactions(connectionId);
                }
            }
        }
        catch (error) {
            console.error('Error syncing bank account:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const generateForecast = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/banking/forecast', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-tenant-id': 'default',
                    'x-company-id': 'default'
                },
                body: JSON.stringify({
                    companyId: 'default',
                    forecastPeriod
                })
            });
            const data = await response.json();
            if (data.success) {
                loadForecasts();
            }
        }
        catch (error) {
            console.error('Error generating forecast:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'connected': return 'bg-green-100 text-green-800';
            case 'disconnected': return 'bg-gray-100 text-gray-800';
            case 'error': return 'bg-red-100 text-red-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'critical': return 'bg-red-100 text-red-800';
            case 'high': return 'bg-orange-100 text-orange-800';
            case 'medium': return 'bg-yellow-100 text-yellow-800';
            case 'low': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold", children: "Enhanced Bank Integration" }), _jsx("p", { className: "text-gray-600", children: "Real-time bank feeds and advanced cash flow forecasting" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs(Button, { onClick: generateForecast, disabled: loading, children: [_jsx(TrendingUp, { className: "h-4 w-4 mr-2" }), "Generate Forecast"] }), _jsxs(Button, { variant: "outline", children: [_jsx(Building2, { className: "h-4 w-4 mr-2" }), "Connect Bank"] })] })] }), _jsxs(Tabs, { defaultValue: "connections", className: "space-y-4", children: [_jsxs(TabsList, { children: [_jsx(TabsTrigger, { value: "connections", children: "Bank Connections" }), _jsx(TabsTrigger, { value: "forecasts", children: "Cash Flow Forecasts" }), _jsx(TabsTrigger, { value: "transactions", children: "Transactions" }), _jsx(TabsTrigger, { value: "analytics", children: "Analytics" })] }), _jsx(TabsContent, { value: "connections", className: "space-y-4", children: _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: bankConnections.map((connection) => (_jsxs(Card, { className: "relative", children: [_jsxs(CardHeader, { className: "pb-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx(CardTitle, { className: "text-lg", children: connection.bankName }), _jsx(Badge, { className: getStatusColor(connection.status), children: connection.status })] }), _jsx("p", { className: "text-sm text-gray-600", children: connection.accountName }), _jsx("p", { className: "text-xs text-gray-500 capitalize", children: connection.accountType })] }), _jsxs(CardContent, { className: "pt-0", children: [_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between text-sm", children: [_jsx("span", { children: "Last Sync:" }), _jsx("span", { className: "text-gray-600", children: connection.lastSyncAt
                                                                    ? new Date(connection.lastSyncAt).toLocaleDateString()
                                                                    : 'Never' })] }), connection.nextSyncAt && (_jsxs("div", { className: "flex items-center justify-between text-sm", children: [_jsx("span", { children: "Next Sync:" }), _jsx("span", { className: "text-gray-600", children: new Date(connection.nextSyncAt).toLocaleDateString() })] })), connection.errorMessage && (_jsxs(Alert, { className: "mt-2", children: [_jsx(AlertTriangle, { className: "h-4 w-4" }), _jsx(AlertDescription, { className: "text-xs", children: connection.errorMessage })] }))] }), _jsxs("div", { className: "flex gap-2 mt-4", children: [_jsxs(Button, { size: "sm", variant: "outline", onClick: () => syncBankAccount(connection.id), disabled: loading, children: [_jsx(RefreshCw, { className: "h-3 w-3 mr-1" }), "Sync"] }), _jsx(Button, { size: "sm", variant: "outline", onClick: () => {
                                                            setSelectedConnection(connection.id);
                                                            loadTransactions(connection.id);
                                                        }, children: "View Transactions" })] })] })] }, connection.id))) }) }), _jsxs(TabsContent, { value: "forecasts", className: "space-y-4", children: [_jsxs("div", { className: "flex items-center gap-4 mb-4", children: [_jsxs(Select, { value: forecastPeriod, onValueChange: (value) => setForecastPeriod(value), children: [_jsx(SelectTrigger, { className: "w-32", children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "7d", children: "7 Days" }), _jsx(SelectItem, { value: "14d", children: "14 Days" }), _jsx(SelectItem, { value: "30d", children: "30 Days" }), _jsx(SelectItem, { value: "60d", children: "60 Days" }), _jsx(SelectItem, { value: "90d", children: "90 Days" })] })] }), _jsx(Button, { onClick: generateForecast, disabled: loading, children: "Generate New Forecast" })] }), forecasts.map((forecast) => (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs(CardTitle, { className: "text-lg", children: ["Cash Flow Forecast - ", forecast.forecastPeriod] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs(Badge, { variant: "outline", children: [forecast.confidence, "% Confidence"] }), _jsx(Badge, { className: getStatusColor('connected'), children: new Date(forecast.createdAt).toLocaleDateString() })] })] }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4 mb-6", children: [_jsxs("div", { className: "text-center", children: [_jsxs("div", { className: "text-2xl font-bold text-green-600", children: ["$", forecast.totalInflows.toLocaleString()] }), _jsx("div", { className: "text-sm text-gray-600", children: "Total Inflows" })] }), _jsxs("div", { className: "text-center", children: [_jsxs("div", { className: "text-2xl font-bold text-red-600", children: ["$", forecast.totalOutflows.toLocaleString()] }), _jsx("div", { className: "text-sm text-gray-600", children: "Total Outflows" })] }), _jsxs("div", { className: "text-center", children: [_jsxs("div", { className: `text-2xl font-bold ${forecast.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`, children: ["$", forecast.netCashFlow.toLocaleString()] }), _jsx("div", { className: "text-sm text-gray-600", children: "Net Cash Flow" })] }), _jsxs("div", { className: "text-center", children: [_jsxs("div", { className: "text-2xl font-bold text-blue-600", children: ["$", forecast.endingBalance.toLocaleString()] }), _jsx("div", { className: "text-sm text-gray-600", children: "Ending Balance" })] })] }), forecast.riskFactors.length > 0 && (_jsxs("div", { className: "mb-6", children: [_jsx("h3", { className: "text-lg font-semibold mb-3", children: "Risk Factors" }), _jsx("div", { className: "space-y-2", children: forecast.riskFactors.map((risk, index) => (_jsxs(Alert, { children: [_jsx(AlertTriangle, { className: "h-4 w-4" }), _jsxs(AlertDescription, { children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { children: risk.description }), _jsx(Badge, { className: getSeverityColor(risk.severity), children: risk.severity })] }), _jsx("div", { className: "text-sm text-gray-600 mt-1", children: risk.mitigation })] })] }, index))) })] })), forecast.recommendations.length > 0 && (_jsxs("div", { className: "mb-6", children: [_jsx("h3", { className: "text-lg font-semibold mb-3", children: "Recommendations" }), _jsx("ul", { className: "space-y-1", children: forecast.recommendations.map((recommendation, index) => (_jsxs("li", { className: "flex items-start gap-2 text-sm", children: [_jsx(CheckCircle, { className: "h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" }), _jsx("span", { children: recommendation })] }, index))) })] })), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold mb-3", children: "Daily Projections" }), _jsx("div", { className: "space-y-2", children: forecast.dailyProjections.slice(0, 7).map((projection, index) => (_jsxs("div", { className: "flex items-center justify-between p-3 bg-gray-50 rounded", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "text-sm font-medium", children: new Date(projection.date).toLocaleDateString() }), _jsx("div", { className: "flex items-center gap-2", children: _jsxs(Badge, { variant: "outline", className: "text-xs", children: [projection.confidence, "% confidence"] }) })] }), _jsxs("div", { className: "flex items-center gap-4 text-sm", children: [_jsxs("div", { className: "text-green-600", children: ["+$", projection.expectedInflows.toLocaleString()] }), _jsxs("div", { className: "text-red-600", children: ["-$", projection.expectedOutflows.toLocaleString()] }), _jsxs("div", { className: `font-medium ${projection.netFlow >= 0 ? 'text-green-600' : 'text-red-600'}`, children: ["$", projection.netFlow.toLocaleString()] }), _jsxs("div", { className: "text-blue-600 font-medium", children: ["$", projection.projectedBalance.toLocaleString()] })] })] }, index))) })] })] })] }, forecast.id)))] }), _jsxs(TabsContent, { value: "transactions", className: "space-y-4", children: [_jsxs("div", { className: "flex items-center gap-4 mb-4", children: [_jsxs(Select, { value: selectedConnection, onValueChange: setSelectedConnection, children: [_jsx(SelectTrigger, { className: "w-64", children: _jsx(SelectValue, { placeholder: "Select bank connection" }) }), _jsx(SelectContent, { children: bankConnections.map((connection) => (_jsxs(SelectItem, { value: connection.id, children: [connection.bankName, " - ", connection.accountName] }, connection.id))) })] }), selectedConnection && (_jsxs(Button, { onClick: () => loadTransactions(selectedConnection), disabled: loading, children: [_jsx(RefreshCw, { className: "h-4 w-4 mr-2" }), "Load Transactions"] }))] }), loading && (_jsxs("div", { className: "flex items-center justify-center py-8", children: [_jsx(RefreshCw, { className: "h-6 w-6 animate-spin mr-2" }), "Loading transactions..."] })), transactions.length > 0 && (_jsx("div", { className: "space-y-2", children: transactions.map((transaction) => (_jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: `p-2 rounded-full ${transaction.transactionType === 'credit' ? 'bg-green-100' : 'bg-red-100'}`, children: transaction.transactionType === 'credit' ? (_jsx(TrendingUp, { className: "h-4 w-4 text-green-600" })) : (_jsx(TrendingDown, { className: "h-4 w-4 text-red-600" })) }), _jsxs("div", { children: [_jsx("div", { className: "font-medium", children: transaction.description }), _jsxs("div", { className: "text-sm text-gray-600", children: [transaction.merchantName && `${transaction.merchantName} • `, new Date(transaction.date).toLocaleDateString()] })] })] }), _jsxs("div", { className: "flex items-center gap-4", children: [transaction.category && (_jsx(Badge, { variant: "outline", children: transaction.category })), _jsxs("div", { className: `font-medium ${transaction.transactionType === 'credit' ? 'text-green-600' : 'text-red-600'}`, children: [transaction.transactionType === 'credit' ? '+' : '-', "$", Math.abs(transaction.amount).toLocaleString()] }), _jsx(Badge, { className: transaction.isReconciled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800', children: transaction.isReconciled ? 'Reconciled' : 'Pending' })] })] }) }) }, transaction.id))) }))] }), _jsx(TabsContent, { value: "analytics", className: "space-y-4", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium", children: "Total Accounts" }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: bankConnections.length }), _jsx("p", { className: "text-xs text-gray-600", children: "Connected bank accounts" })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium", children: "Active Connections" }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: bankConnections.filter(c => c.isActive).length }), _jsx("p", { className: "text-xs text-gray-600", children: "Currently syncing" })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium", children: "Recent Forecasts" }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: forecasts.length }), _jsx("p", { className: "text-xs text-gray-600", children: "Generated this month" })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium", children: "Avg Confidence" }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "text-2xl font-bold", children: [forecasts.length > 0
                                                            ? Math.round(forecasts.reduce((sum, f) => sum + f.confidence, 0) / forecasts.length)
                                                            : 0, "%"] }), _jsx("p", { className: "text-xs text-gray-600", children: "Forecast accuracy" })] })] })] }) })] })] }));
};
export default EnhancedBankIntegration;
