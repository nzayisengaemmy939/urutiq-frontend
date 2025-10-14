import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
;
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Download, RefreshCw, Users, AlertTriangle, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
export function ARAgingReport({ asOfDate, loading, setLoading }) {
    const [data, setData] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const fetchData = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                asOfDate: asOfDate
            });
            const response = await fetch(`/api/accounting-reports/ar-aging?${params}`, {
                headers: {
                    'x-tenant-id': 'tenant_demo',
                    'x-company-id': 'seed-company-1'
                }
            });
            if (!response.ok) {
                throw new Error('Failed to fetch AR aging data');
            }
            const result = await response.json();
            setData(result);
        }
        catch (error) {
            console.error('Error fetching AR aging:', error);
            toast.error('Failed to load AR aging data');
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchData();
    }, [asOfDate]);
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };
    const filteredCustomers = data?.customers.filter(customer => customer.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())) || [];
    const getAgingColor = (amount, category) => {
        if (amount === 0)
            return 'text-muted-foreground';
        switch (category) {
            case 'current': return 'text-green-600';
            case 'days30': return 'text-yellow-600';
            case 'days60': return 'text-orange-600';
            case 'days90': return 'text-red-600';
            case 'over90': return 'text-red-800';
            default: return 'text-muted-foreground';
        }
    };
    const getAgingBadgeColor = (amount, category) => {
        if (amount === 0)
            return 'bg-gray-100 text-gray-800';
        switch (category) {
            case 'current': return 'bg-green-100 text-green-800';
            case 'days30': return 'bg-yellow-100 text-yellow-800';
            case 'days60': return 'bg-orange-100 text-orange-800';
            case 'days90': return 'bg-red-100 text-red-800';
            case 'over90': return 'bg-red-200 text-red-900';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    if (loading) {
        return (_jsx("div", { className: "flex items-center justify-center h-64", children: _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(RefreshCw, { className: "h-4 w-4 animate-spin" }), _jsx("span", { children: "Loading AR aging report..." })] }) }));
    }
    if (!data) {
        return (_jsxs("div", { className: "text-center py-8", children: [_jsx(Users, { className: "h-8 w-8 mx-auto text-muted-foreground mb-2" }), _jsx("p", { className: "text-muted-foreground", children: "No AR aging data available" }), _jsxs(Button, { onClick: fetchData, className: "mt-4", children: [_jsx(RefreshCw, { className: "w-4 h-4 mr-2" }), "Retry"] })] }));
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium", children: "Total Outstanding" }) }), _jsx(CardContent, { children: _jsx("div", { className: "text-2xl font-bold text-blue-600", children: formatCurrency(data.totals.total) }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium", children: "Current" }) }), _jsx(CardContent, { children: _jsx("div", { className: "text-2xl font-bold text-green-600", children: formatCurrency(data.totals.current) }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium", children: "1-30 Days" }) }), _jsx(CardContent, { children: _jsx("div", { className: "text-2xl font-bold text-yellow-600", children: formatCurrency(data.totals.days30) }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium", children: "31-60 Days" }) }), _jsx(CardContent, { children: _jsx("div", { className: "text-2xl font-bold text-orange-600", children: formatCurrency(data.totals.days60) }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium", children: "61-90 Days" }) }), _jsx(CardContent, { children: _jsx("div", { className: "text-2xl font-bold text-red-600", children: formatCurrency(data.totals.days90) }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium", children: "Over 90 Days" }) }), _jsx(CardContent, { children: _jsx("div", { className: "text-2xl font-bold text-red-800", children: formatCurrency(data.totals.over90) }) })] })] }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-4", children: [_jsx("div", { className: "flex-1", children: _jsx(Input, { placeholder: "Search customers...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "max-w-sm" }) }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { variant: "outline", onClick: fetchData, children: [_jsx(RefreshCw, { className: "w-4 h-4 mr-2" }), "Refresh"] }), _jsxs(Button, { children: [_jsx(Download, { className: "w-4 h-4 mr-2" }), "Export PDF"] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center", children: [_jsx(Users, { className: "h-5 w-5 mr-2" }), "ACCOUNTS RECEIVABLE AGING"] }), _jsxs(CardDescription, { children: ["As of ", formatDate(data.asOfDate)] })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "overflow-x-auto", children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { children: "Customer" }), _jsx(TableHead, { className: "text-right", children: "Current" }), _jsx(TableHead, { className: "text-right", children: "1-30 Days" }), _jsx(TableHead, { className: "text-right", children: "31-60 Days" }), _jsx(TableHead, { className: "text-right", children: "61-90 Days" }), _jsx(TableHead, { className: "text-right", children: "Over 90 Days" }), _jsx(TableHead, { className: "text-right", children: "Total" }), _jsx(TableHead, { className: "text-right", children: "Invoices" })] }) }), _jsx(TableBody, { children: filteredCustomers.map((customer) => (_jsxs(TableRow, { children: [_jsx(TableCell, { children: _jsxs("div", { className: "space-y-1", children: [_jsx("div", { className: "font-medium", children: customer.customerName }), _jsx("div", { className: "text-sm text-muted-foreground", children: customer.customerEmail })] }) }), _jsx(TableCell, { className: "text-right font-mono", children: _jsx("span", { className: getAgingColor(customer.aging.current, 'current'), children: formatCurrency(customer.aging.current) }) }), _jsx(TableCell, { className: "text-right font-mono", children: _jsx("span", { className: getAgingColor(customer.aging.days30, 'days30'), children: formatCurrency(customer.aging.days30) }) }), _jsx(TableCell, { className: "text-right font-mono", children: _jsx("span", { className: getAgingColor(customer.aging.days60, 'days60'), children: formatCurrency(customer.aging.days60) }) }), _jsx(TableCell, { className: "text-right font-mono", children: _jsx("span", { className: getAgingColor(customer.aging.days90, 'days90'), children: formatCurrency(customer.aging.days90) }) }), _jsx(TableCell, { className: "text-right font-mono", children: _jsx("span", { className: getAgingColor(customer.aging.over90, 'over90'), children: formatCurrency(customer.aging.over90) }) }), _jsx(TableCell, { className: "text-right font-mono font-bold", children: formatCurrency(customer.totalOutstanding) }), _jsx(TableCell, { className: "text-right", children: _jsx(Badge, { variant: "outline", children: customer.invoiceCount }) })] }, customer.customerId))) })] }) }), _jsx("div", { className: "mt-4 pt-4 border-t", children: _jsxs("div", { className: "grid grid-cols-8 gap-4 text-sm font-bold", children: [_jsx("div", { className: "col-span-1", children: "TOTALS" }), _jsx("div", { className: "text-right font-mono text-green-600", children: formatCurrency(data.totals.current) }), _jsx("div", { className: "text-right font-mono text-yellow-600", children: formatCurrency(data.totals.days30) }), _jsx("div", { className: "text-right font-mono text-orange-600", children: formatCurrency(data.totals.days60) }), _jsx("div", { className: "text-right font-mono text-red-600", children: formatCurrency(data.totals.days90) }), _jsx("div", { className: "text-right font-mono text-red-800", children: formatCurrency(data.totals.over90) }), _jsx("div", { className: "text-right font-mono text-blue-600", children: formatCurrency(data.totals.total) }), _jsx("div", { className: "text-right", children: _jsx(Badge, { variant: "outline", children: data.customers.reduce((sum, c) => sum + c.invoiceCount, 0) }) })] }) })] })] }), _jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center", children: [_jsx(TrendingUp, { className: "h-5 w-5 mr-2" }), "Aging Distribution"] }), _jsx(CardDescription, { children: "Percentage breakdown by aging category" })] }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: [
                                        { label: 'Current', amount: data.totals.current, color: 'bg-green-500' },
                                        { label: '1-30 Days', amount: data.totals.days30, color: 'bg-yellow-500' },
                                        { label: '31-60 Days', amount: data.totals.days60, color: 'bg-orange-500' },
                                        { label: '61-90 Days', amount: data.totals.days90, color: 'bg-red-500' },
                                        { label: 'Over 90 Days', amount: data.totals.over90, color: 'bg-red-700' }
                                    ].map((item) => {
                                        const percentage = data.totals.total > 0 ? (item.amount / data.totals.total) * 100 : 0;
                                        return (_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { children: item.label }), _jsx("span", { className: "font-mono", children: formatCurrency(item.amount) })] }), _jsx("div", { className: "w-full bg-gray-200 rounded-full h-2", children: _jsx("div", { className: `h-2 rounded-full ${item.color}`, style: { width: `${percentage}%` } }) }), _jsxs("div", { className: "text-xs text-muted-foreground text-right", children: [percentage.toFixed(1), "%"] })] }, item.label));
                                    }) }) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center", children: [_jsx(AlertTriangle, { className: "h-5 w-5 mr-2" }), "Risk Assessment"] }), _jsx(CardDescription, { children: "Collection risk by aging category" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between p-3 bg-green-50 rounded-lg", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: "w-3 h-3 bg-green-500 rounded-full" }), _jsx("span", { className: "text-sm font-medium", children: "Low Risk" })] }), _jsx("span", { className: "text-sm font-mono text-green-600", children: formatCurrency(data.totals.current + data.totals.days30) })] }), _jsxs("div", { className: "flex items-center justify-between p-3 bg-yellow-50 rounded-lg", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: "w-3 h-3 bg-yellow-500 rounded-full" }), _jsx("span", { className: "text-sm font-medium", children: "Medium Risk" })] }), _jsx("span", { className: "text-sm font-mono text-yellow-600", children: formatCurrency(data.totals.days60 + data.totals.days90) })] }), _jsxs("div", { className: "flex items-center justify-between p-3 bg-red-50 rounded-lg", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: "w-3 h-3 bg-red-500 rounded-full" }), _jsx("span", { className: "text-sm font-medium", children: "High Risk" })] }), _jsx("span", { className: "text-sm font-mono text-red-600", children: formatCurrency(data.totals.over90) })] })] }) })] })] }), _jsxs("div", { className: "text-xs text-muted-foreground", children: ["Generated on ", new Date(data.generatedAt).toLocaleString()] })] }));
}
