import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
;
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Download, RefreshCw, Activity, TrendingUp, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { toast } from 'sonner';
export function CashFlowReport({ dateRange, asOfDate, loading, setLoading }) {
    const [data, setData] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const fetchData = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                startDate: dateRange.startDate,
                endDate: dateRange.endDate
            });
            const response = await fetch(`/api/accounting-reports/cash-flow?${params}`, {
                headers: {
                    'x-tenant-id': 'tenant_demo',
                    'x-company-id': 'seed-company-1'
                }
            });
            if (!response.ok) {
                throw new Error('Failed to fetch cash flow data');
            }
            const result = await response.json();
            setData(result);
        }
        catch (error) {
            console.error('Error fetching cash flow:', error);
            toast.error('Failed to load cash flow data');
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchData();
    }, [dateRange]);
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };
    const filteredItems = (items) => {
        return items.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    };
    const getTypeColor = (type) => {
        switch (type) {
            case 'operating': return 'bg-blue-100 text-blue-800';
            case 'investing': return 'bg-green-100 text-green-800';
            case 'financing': return 'bg-purple-100 text-purple-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    const getTypeIcon = (type) => {
        switch (type) {
            case 'operating': return _jsx(Activity, { className: "h-4 w-4" });
            case 'investing': return _jsx(TrendingUp, { className: "h-4 w-4" });
            case 'financing': return _jsx(DollarSign, { className: "h-4 w-4" });
            default: return null;
        }
    };
    if (loading) {
        return (_jsx("div", { className: "flex items-center justify-center h-64", children: _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(RefreshCw, { className: "h-4 w-4 animate-spin" }), _jsx("span", { children: "Loading cash flow statement..." })] }) }));
    }
    if (!data) {
        return (_jsxs("div", { className: "text-center py-8", children: [_jsx(Activity, { className: "h-8 w-8 mx-auto text-muted-foreground mb-2" }), _jsx("p", { className: "text-muted-foreground", children: "No cash flow data available" }), _jsxs(Button, { onClick: fetchData, className: "mt-4", children: [_jsx(RefreshCw, { className: "w-4 h-4 mr-2" }), "Retry"] })] }));
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-4", children: [_jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium", children: "Operating Cash Flow" }) }), _jsx(CardContent, { children: _jsx("div", { className: `text-2xl font-bold ${data.operating.total >= 0 ? 'text-green-600' : 'text-red-600'}`, children: formatCurrency(data.operating.total) }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium", children: "Investing Cash Flow" }) }), _jsx(CardContent, { children: _jsx("div", { className: `text-2xl font-bold ${data.investing.total >= 0 ? 'text-green-600' : 'text-red-600'}`, children: formatCurrency(data.investing.total) }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium", children: "Financing Cash Flow" }) }), _jsx(CardContent, { children: _jsx("div", { className: `text-2xl font-bold ${data.financing.total >= 0 ? 'text-green-600' : 'text-red-600'}`, children: formatCurrency(data.financing.total) }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium", children: "Net Cash Flow" }) }), _jsx(CardContent, { children: _jsx("div", { className: `text-2xl font-bold ${data.summary.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`, children: formatCurrency(data.summary.netCashFlow) }) })] })] }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-4", children: [_jsx("div", { className: "flex-1", children: _jsx(Input, { placeholder: "Search cash flow items...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "max-w-sm" }) }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { variant: "outline", onClick: fetchData, children: [_jsx(RefreshCw, { className: "w-4 h-4 mr-2" }), "Refresh"] }), _jsxs(Button, { children: [_jsx(Download, { className: "w-4 h-4 mr-2" }), "Export PDF"] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center", children: [_jsx(Activity, { className: "h-5 w-5 mr-2" }), "CASH FLOW STATEMENT"] }), _jsxs(CardDescription, { children: ["Period: ", formatDate(data.period.startDate), " - ", formatDate(data.period.endDate)] })] }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsxs("h3", { className: "text-lg font-semibold text-blue-600 mb-4 flex items-center", children: [_jsx(Activity, { className: "h-5 w-5 mr-2" }), "OPERATING ACTIVITIES"] }), _jsx("div", { className: "overflow-x-auto", children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { children: "Item" }), _jsx(TableHead, { className: "text-right", children: "Amount" })] }) }), _jsx(TableBody, { children: filteredItems(data.operating.items).map((item) => (_jsxs(TableRow, { children: [_jsx(TableCell, { children: _jsxs("div", { className: "flex items-center space-x-2", children: [getTypeIcon(item.type), _jsx("span", { children: item.name })] }) }), _jsx(TableCell, { className: "text-right font-mono font-medium", children: _jsxs("div", { className: "flex items-center justify-end space-x-1", children: [item.amount >= 0 ? (_jsx(ArrowUpRight, { className: "h-4 w-4 text-green-600" })) : (_jsx(ArrowDownRight, { className: "h-4 w-4 text-red-600" })), _jsx("span", { className: item.amount >= 0 ? 'text-green-600' : 'text-red-600', children: formatCurrency(Math.abs(item.amount)) })] }) })] }, item.id))) })] }) }), _jsx("div", { className: "mt-4 pt-4 border-t", children: _jsxs("div", { className: "flex justify-between items-center font-bold text-lg", children: [_jsx("span", { children: "Net Cash from Operating Activities" }), _jsx("span", { className: `font-mono ${data.operating.total >= 0 ? 'text-green-600' : 'text-red-600'}`, children: formatCurrency(data.operating.total) })] }) })] }), _jsxs("div", { children: [_jsxs("h3", { className: "text-lg font-semibold text-green-600 mb-4 flex items-center", children: [_jsx(TrendingUp, { className: "h-5 w-5 mr-2" }), "INVESTING ACTIVITIES"] }), _jsx("div", { className: "overflow-x-auto", children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { children: "Item" }), _jsx(TableHead, { className: "text-right", children: "Amount" })] }) }), _jsx(TableBody, { children: filteredItems(data.investing.items).map((item) => (_jsxs(TableRow, { children: [_jsx(TableCell, { children: _jsxs("div", { className: "flex items-center space-x-2", children: [getTypeIcon(item.type), _jsx("span", { children: item.name })] }) }), _jsx(TableCell, { className: "text-right font-mono font-medium", children: _jsxs("div", { className: "flex items-center justify-end space-x-1", children: [item.amount >= 0 ? (_jsx(ArrowUpRight, { className: "h-4 w-4 text-green-600" })) : (_jsx(ArrowDownRight, { className: "h-4 w-4 text-red-600" })), _jsx("span", { className: item.amount >= 0 ? 'text-green-600' : 'text-red-600', children: formatCurrency(Math.abs(item.amount)) })] }) })] }, item.id))) })] }) }), _jsx("div", { className: "mt-4 pt-4 border-t", children: _jsxs("div", { className: "flex justify-between items-center font-bold text-lg", children: [_jsx("span", { children: "Net Cash from Investing Activities" }), _jsx("span", { className: `font-mono ${data.investing.total >= 0 ? 'text-green-600' : 'text-red-600'}`, children: formatCurrency(data.investing.total) })] }) })] }), _jsxs("div", { children: [_jsxs("h3", { className: "text-lg font-semibold text-purple-600 mb-4 flex items-center", children: [_jsx(DollarSign, { className: "h-5 w-5 mr-2" }), "FINANCING ACTIVITIES"] }), _jsx("div", { className: "overflow-x-auto", children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { children: "Item" }), _jsx(TableHead, { className: "text-right", children: "Amount" })] }) }), _jsx(TableBody, { children: filteredItems(data.financing.items).map((item) => (_jsxs(TableRow, { children: [_jsx(TableCell, { children: _jsxs("div", { className: "flex items-center space-x-2", children: [getTypeIcon(item.type), _jsx("span", { children: item.name })] }) }), _jsx(TableCell, { className: "text-right font-mono font-medium", children: _jsxs("div", { className: "flex items-center justify-end space-x-1", children: [item.amount >= 0 ? (_jsx(ArrowUpRight, { className: "h-4 w-4 text-green-600" })) : (_jsx(ArrowDownRight, { className: "h-4 w-4 text-red-600" })), _jsx("span", { className: item.amount >= 0 ? 'text-green-600' : 'text-red-600', children: formatCurrency(Math.abs(item.amount)) })] }) })] }, item.id))) })] }) }), _jsx("div", { className: "mt-4 pt-4 border-t", children: _jsxs("div", { className: "flex justify-between items-center font-bold text-lg", children: [_jsx("span", { children: "Net Cash from Financing Activities" }), _jsx("span", { className: `font-mono ${data.financing.total >= 0 ? 'text-green-600' : 'text-red-600'}`, children: formatCurrency(data.financing.total) })] }) })] }), _jsx("div", { className: "pt-6 border-t-2", children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-lg font-semibold", children: "Net Increase (Decrease) in Cash" }), _jsx("span", { className: `text-lg font-mono font-bold ${data.summary.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`, children: formatCurrency(data.summary.netCashFlow) })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-lg font-semibold", children: "Cash at Beginning of Period" }), _jsx("span", { className: "text-lg font-mono font-bold", children: formatCurrency(data.summary.beginningCash) })] }), _jsxs("div", { className: "flex justify-between items-center text-xl font-bold border-t pt-4", children: [_jsx("span", { children: "Cash at End of Period" }), _jsx("span", { className: "font-mono text-blue-600", children: formatCurrency(data.summary.endingCash) })] })] }) })] }) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Cash Flow Analysis" }), _jsx(CardDescription, { children: "Key cash flow metrics and trends" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "grid gap-4 md:grid-cols-3", children: [_jsxs("div", { className: "text-center p-4 bg-blue-50 rounded-lg", children: [_jsx("div", { className: "text-2xl font-bold text-blue-600", children: formatCurrency(data.operating.total) }), _jsx("div", { className: "text-sm text-muted-foreground", children: "Operating Cash Flow" }), _jsx("div", { className: "text-xs text-muted-foreground mt-1", children: "Cash from core business operations" })] }), _jsxs("div", { className: "text-center p-4 bg-green-50 rounded-lg", children: [_jsx("div", { className: "text-2xl font-bold text-green-600", children: formatCurrency(data.investing.total) }), _jsx("div", { className: "text-sm text-muted-foreground", children: "Investing Cash Flow" }), _jsx("div", { className: "text-xs text-muted-foreground mt-1", children: "Cash from investments and assets" })] }), _jsxs("div", { className: "text-center p-4 bg-purple-50 rounded-lg", children: [_jsx("div", { className: "text-2xl font-bold text-purple-600", children: formatCurrency(data.financing.total) }), _jsx("div", { className: "text-sm text-muted-foreground", children: "Financing Cash Flow" }), _jsx("div", { className: "text-xs text-muted-foreground mt-1", children: "Cash from debt and equity" })] })] }) })] }), _jsxs("div", { className: "text-xs text-muted-foreground", children: ["Generated on ", new Date(data.generatedAt).toLocaleString()] })] }));
}
