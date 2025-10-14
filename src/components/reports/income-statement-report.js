import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
;
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Download, RefreshCw, TrendingUp, TrendingDown, DollarSign, Calculator } from 'lucide-react';
import { toast } from 'sonner';
export function IncomeStatementReport({ dateRange, asOfDate, loading, setLoading }) {
    const [data, setData] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const fetchData = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                startDate: dateRange.startDate,
                endDate: dateRange.endDate
            });
            const response = await fetch(`/api/accounting-reports/income-statement?${params}`, {
                headers: {
                    'x-tenant-id': 'tenant_demo',
                    'x-company-id': 'seed-company-1'
                }
            });
            if (!response.ok) {
                throw new Error('Failed to fetch income statement data');
            }
            const result = await response.json();
            setData(result);
        }
        catch (error) {
            console.error('Error fetching income statement:', error);
            toast.error('Failed to load income statement data');
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
    const formatPercentage = (value) => {
        return `${value.toFixed(1)}%`;
    };
    const filteredAccounts = (accounts) => {
        return accounts.filter(account => account.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            account.name.toLowerCase().includes(searchTerm.toLowerCase()));
    };
    const getMarginColor = (margin) => {
        if (margin > 20)
            return 'text-green-600';
        if (margin > 10)
            return 'text-yellow-600';
        if (margin > 0)
            return 'text-orange-600';
        return 'text-red-600';
    };
    if (loading) {
        return (_jsx("div", { className: "flex items-center justify-center h-64", children: _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(RefreshCw, { className: "h-4 w-4 animate-spin" }), _jsx("span", { children: "Loading income statement..." })] }) }));
    }
    if (!data) {
        return (_jsxs("div", { className: "text-center py-8", children: [_jsx(TrendingUp, { className: "h-8 w-8 mx-auto text-muted-foreground mb-2" }), _jsx("p", { className: "text-muted-foreground", children: "No income statement data available" }), _jsxs(Button, { onClick: fetchData, className: "mt-4", children: [_jsx(RefreshCw, { className: "w-4 h-4 mr-2" }), "Retry"] })] }));
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-4", children: [_jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium", children: "Total Revenue" }) }), _jsx(CardContent, { children: _jsx("div", { className: "text-2xl font-bold text-green-600", children: formatCurrency(data.summary.totalRevenue) }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium", children: "Total Expenses" }) }), _jsx(CardContent, { children: _jsx("div", { className: "text-2xl font-bold text-red-600", children: formatCurrency(data.summary.totalExpenses) }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium", children: "Net Income" }) }), _jsx(CardContent, { children: _jsx("div", { className: `text-2xl font-bold ${data.summary.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`, children: formatCurrency(data.summary.netIncome) }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium", children: "Profit Margin" }) }), _jsx(CardContent, { children: _jsx("div", { className: `text-2xl font-bold ${getMarginColor(data.summary.margin)}`, children: formatPercentage(data.summary.margin) }) })] })] }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-4", children: [_jsx("div", { className: "flex-1", children: _jsx(Input, { placeholder: "Search accounts...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "max-w-sm" }) }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { variant: "outline", onClick: fetchData, children: [_jsx(RefreshCw, { className: "w-4 h-4 mr-2" }), "Refresh"] }), _jsxs(Button, { children: [_jsx(Download, { className: "w-4 h-4 mr-2" }), "Export PDF"] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center", children: [_jsx(TrendingUp, { className: "h-5 w-5 mr-2" }), "INCOME STATEMENT"] }), _jsxs(CardDescription, { children: ["Period: ", formatDate(data.period.startDate), " - ", formatDate(data.period.endDate)] })] }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsxs("h3", { className: "text-lg font-semibold text-green-600 mb-4 flex items-center", children: [_jsx(DollarSign, { className: "h-5 w-5 mr-2" }), "REVENUE"] }), _jsx("div", { className: "overflow-x-auto", children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { children: "Account" }), _jsx(TableHead, { className: "text-right", children: "Amount" })] }) }), _jsx(TableBody, { children: filteredAccounts(data.revenue.accounts).map((account) => (_jsxs(TableRow, { children: [_jsx(TableCell, { children: _jsxs("div", { className: "space-y-1", children: [_jsx("div", { className: "font-mono text-sm font-medium", children: account.code }), _jsx("div", { className: "text-sm", children: account.name })] }) }), _jsx(TableCell, { className: "text-right font-mono font-medium text-green-600", children: formatCurrency(account.amount) })] }, account.id))) })] }) }), _jsx("div", { className: "mt-4 pt-4 border-t", children: _jsxs("div", { className: "flex justify-between items-center font-bold text-lg", children: [_jsx("span", { children: "Total Revenue" }), _jsx("span", { className: "font-mono text-green-600", children: formatCurrency(data.revenue.total) })] }) })] }), _jsxs("div", { children: [_jsxs("h3", { className: "text-lg font-semibold text-red-600 mb-4 flex items-center", children: [_jsx(TrendingDown, { className: "h-5 w-5 mr-2" }), "EXPENSES"] }), _jsx("div", { className: "overflow-x-auto", children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { children: "Account" }), _jsx(TableHead, { className: "text-right", children: "Amount" })] }) }), _jsx(TableBody, { children: filteredAccounts(data.expenses.accounts).map((account) => (_jsxs(TableRow, { children: [_jsx(TableCell, { children: _jsxs("div", { className: "space-y-1", children: [_jsx("div", { className: "font-mono text-sm font-medium", children: account.code }), _jsx("div", { className: "text-sm", children: account.name })] }) }), _jsx(TableCell, { className: "text-right font-mono font-medium text-red-600", children: formatCurrency(account.amount) })] }, account.id))) })] }) }), _jsx("div", { className: "mt-4 pt-4 border-t", children: _jsxs("div", { className: "flex justify-between items-center font-bold text-lg", children: [_jsx("span", { children: "Total Expenses" }), _jsx("span", { className: "font-mono text-red-600", children: formatCurrency(data.expenses.total) })] }) })] }), _jsxs("div", { className: "pt-6 border-t-2", children: [_jsxs("div", { className: "flex justify-between items-center font-bold text-xl", children: [_jsxs("span", { className: "flex items-center", children: [_jsx(Calculator, { className: "h-5 w-5 mr-2" }), "Net Income"] }), _jsx("span", { className: `font-mono ${data.summary.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`, children: formatCurrency(data.summary.netIncome) })] }), _jsx("div", { className: "mt-2 text-sm text-muted-foreground", children: "Revenue - Expenses = Net Income" })] })] }) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Profitability Analysis" }), _jsx(CardDescription, { children: "Key financial ratios and metrics" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "grid gap-4 md:grid-cols-3", children: [_jsxs("div", { className: "text-center p-4 bg-green-50 rounded-lg", children: [_jsx("div", { className: "text-2xl font-bold text-green-600", children: formatPercentage(data.summary.margin) }), _jsx("div", { className: "text-sm text-muted-foreground", children: "Profit Margin" }), _jsx("div", { className: "text-xs text-muted-foreground mt-1", children: "(Net Income / Revenue) \u00D7 100" })] }), _jsxs("div", { className: "text-center p-4 bg-blue-50 rounded-lg", children: [_jsx("div", { className: "text-2xl font-bold text-blue-600", children: formatCurrency(data.summary.totalRevenue) }), _jsx("div", { className: "text-sm text-muted-foreground", children: "Total Revenue" }), _jsx("div", { className: "text-xs text-muted-foreground mt-1", children: "Gross income before expenses" })] }), _jsxs("div", { className: "text-center p-4 bg-red-50 rounded-lg", children: [_jsx("div", { className: "text-2xl font-bold text-red-600", children: formatCurrency(data.summary.totalExpenses) }), _jsx("div", { className: "text-sm text-muted-foreground", children: "Total Expenses" }), _jsx("div", { className: "text-xs text-muted-foreground mt-1", children: "All operating costs" })] })] }) })] }), _jsxs("div", { className: "text-xs text-muted-foreground", children: ["Generated on ", new Date(data.generatedAt).toLocaleString()] })] }));
}
