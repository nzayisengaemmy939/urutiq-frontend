import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
;
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Download, RefreshCw, BarChart3, TrendingDown, CheckCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
export function BalanceSheetReport({ asOfDate, loading, setLoading }) {
    const [data, setData] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const fetchData = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                asOfDate: asOfDate
            });
            const response = await fetch(`/api/accounting-reports/balance-sheet?${params}`, {
                headers: {
                    'x-tenant-id': 'tenant_demo',
                    'x-company-id': 'seed-company-1'
                }
            });
            if (!response.ok) {
                throw new Error('Failed to fetch balance sheet data');
            }
            const result = await response.json();
            setData(result);
        }
        catch (error) {
            console.error('Error fetching balance sheet:', error);
            toast.error('Failed to load balance sheet data');
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
    const filteredAccounts = (accounts) => {
        return accounts.filter(account => account.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            account.name.toLowerCase().includes(searchTerm.toLowerCase()));
    };
    const getAccountTypeColor = (type) => {
        switch (type) {
            case 'Asset': return 'bg-blue-100 text-blue-800';
            case 'Liability': return 'bg-red-100 text-red-800';
            case 'Equity': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    if (loading) {
        return (_jsx("div", { className: "flex items-center justify-center h-64", children: _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(RefreshCw, { className: "h-4 w-4 animate-spin" }), _jsx("span", { children: "Loading balance sheet..." })] }) }));
    }
    if (!data) {
        return (_jsxs("div", { className: "text-center py-8", children: [_jsx(BarChart3, { className: "h-8 w-8 mx-auto text-muted-foreground mb-2" }), _jsx("p", { className: "text-muted-foreground", children: "No balance sheet data available" }), _jsxs(Button, { onClick: fetchData, className: "mt-4", children: [_jsx(RefreshCw, { className: "w-4 h-4 mr-2" }), "Retry"] })] }));
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-4", children: [_jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium", children: "Total Assets" }) }), _jsx(CardContent, { children: _jsx("div", { className: "text-2xl font-bold text-blue-600", children: formatCurrency(data.summary.totalAssets) }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium", children: "Total Liabilities" }) }), _jsx(CardContent, { children: _jsx("div", { className: "text-2xl font-bold text-red-600", children: formatCurrency(data.summary.totalLiabilities) }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium", children: "Total Equity" }) }), _jsx(CardContent, { children: _jsx("div", { className: "text-2xl font-bold text-green-600", children: formatCurrency(data.summary.totalEquity) }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium", children: "Balance Status" }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "flex items-center space-x-2", children: [data.summary.isBalanced ? (_jsx(CheckCircle, { className: "h-5 w-5 text-green-600" })) : (_jsx(AlertTriangle, { className: "h-5 w-5 text-red-600" })), _jsx("span", { className: `text-sm font-medium ${data.summary.isBalanced ? 'text-green-600' : 'text-red-600'}`, children: data.summary.isBalanced ? 'Balanced' : 'Out of Balance' })] }), _jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Assets = Liabilities + Equity" })] })] })] }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-4", children: [_jsx("div", { className: "flex-1", children: _jsx(Input, { placeholder: "Search accounts...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "max-w-sm" }) }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { variant: "outline", onClick: fetchData, children: [_jsx(RefreshCw, { className: "w-4 h-4 mr-2" }), "Refresh"] }), _jsxs(Button, { children: [_jsx(Download, { className: "w-4 h-4 mr-2" }), "Export PDF"] })] })] }), _jsxs("div", { className: "grid gap-6 lg:grid-cols-2", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center text-blue-600", children: [_jsx(BarChart3, { className: "h-5 w-5 mr-2" }), "ASSETS"] }), _jsx(CardDescription, { children: "Resources owned by the company" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "overflow-x-auto", children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { children: "Account" }), _jsx(TableHead, { className: "text-right", children: "Balance" })] }) }), _jsx(TableBody, { children: filteredAccounts(data.assets.accounts).map((account) => (_jsxs(TableRow, { children: [_jsx(TableCell, { children: _jsxs("div", { className: "space-y-1", children: [_jsx("div", { className: "font-mono text-sm font-medium", children: account.code }), _jsx("div", { className: "text-sm", children: account.name })] }) }), _jsx(TableCell, { className: "text-right font-mono font-medium", children: formatCurrency(account.balance) })] }, account.id))) })] }) }), _jsx("div", { className: "mt-4 pt-4 border-t", children: _jsxs("div", { className: "flex justify-between items-center font-bold text-lg", children: [_jsx("span", { children: "Total Assets" }), _jsx("span", { className: "font-mono text-blue-600", children: formatCurrency(data.assets.total) })] }) })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center text-red-600", children: [_jsx(TrendingDown, { className: "h-5 w-5 mr-2" }), "LIABILITIES & EQUITY"] }), _jsx(CardDescription, { children: "What the company owes and owns" })] }), _jsxs(CardContent, { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h4", { className: "font-semibold text-red-600 mb-3", children: "LIABILITIES" }), _jsx("div", { className: "overflow-x-auto", children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { children: "Account" }), _jsx(TableHead, { className: "text-right", children: "Balance" })] }) }), _jsx(TableBody, { children: filteredAccounts(data.liabilities.accounts).map((account) => (_jsxs(TableRow, { children: [_jsx(TableCell, { children: _jsxs("div", { className: "space-y-1", children: [_jsx("div", { className: "font-mono text-sm font-medium", children: account.code }), _jsx("div", { className: "text-sm", children: account.name })] }) }), _jsx(TableCell, { className: "text-right font-mono font-medium", children: formatCurrency(account.balance) })] }, account.id))) })] }) }), _jsx("div", { className: "mt-3 pt-3 border-t", children: _jsxs("div", { className: "flex justify-between items-center font-semibold", children: [_jsx("span", { children: "Total Liabilities" }), _jsx("span", { className: "font-mono text-red-600", children: formatCurrency(data.liabilities.total) })] }) })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-semibold text-green-600 mb-3", children: "EQUITY" }), _jsx("div", { className: "overflow-x-auto", children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { children: "Account" }), _jsx(TableHead, { className: "text-right", children: "Balance" })] }) }), _jsx(TableBody, { children: filteredAccounts(data.equity.accounts).map((account) => (_jsxs(TableRow, { children: [_jsx(TableCell, { children: _jsxs("div", { className: "space-y-1", children: [_jsx("div", { className: "font-mono text-sm font-medium", children: account.code }), _jsx("div", { className: "text-sm", children: account.name })] }) }), _jsx(TableCell, { className: "text-right font-mono font-medium", children: formatCurrency(account.balance) })] }, account.id))) })] }) }), _jsx("div", { className: "mt-3 pt-3 border-t", children: _jsxs("div", { className: "flex justify-between items-center font-semibold", children: [_jsx("span", { children: "Total Equity" }), _jsx("span", { className: "font-mono text-green-600", children: formatCurrency(data.equity.total) })] }) })] }), _jsx("div", { className: "pt-4 border-t-2", children: _jsxs("div", { className: "flex justify-between items-center font-bold text-lg", children: [_jsx("span", { children: "Total Liabilities & Equity" }), _jsx("span", { className: "font-mono text-red-600", children: formatCurrency(data.summary.totalLiabilitiesAndEquity) })] }) })] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Balance Verification" }), _jsx(CardDescription, { children: "The fundamental accounting equation: Assets = Liabilities + Equity" })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: "grid gap-4 md:grid-cols-3", children: [_jsxs("div", { className: "text-center p-4 bg-blue-50 rounded-lg", children: [_jsx("div", { className: "text-2xl font-bold text-blue-600", children: formatCurrency(data.summary.totalAssets) }), _jsx("div", { className: "text-sm text-muted-foreground", children: "Total Assets" })] }), _jsxs("div", { className: "text-center p-4 bg-gray-50 rounded-lg", children: [_jsx("div", { className: "text-2xl font-bold text-gray-600", children: "=" }), _jsx("div", { className: "text-sm text-muted-foreground", children: "Equals" })] }), _jsxs("div", { className: "text-center p-4 bg-red-50 rounded-lg", children: [_jsx("div", { className: "text-2xl font-bold text-red-600", children: formatCurrency(data.summary.totalLiabilitiesAndEquity) }), _jsx("div", { className: "text-sm text-muted-foreground", children: "Liabilities + Equity" })] })] }), _jsx("div", { className: "mt-4 text-center", children: _jsx("div", { className: `inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${data.summary.isBalanced
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'}`, children: data.summary.isBalanced ? (_jsxs(_Fragment, { children: [_jsx(CheckCircle, { className: "h-4 w-4 mr-1" }), "Balance Sheet is Balanced"] })) : (_jsxs(_Fragment, { children: [_jsx(AlertTriangle, { className: "h-4 w-4 mr-1" }), "Balance Sheet is Out of Balance"] })) }) })] })] }), _jsxs("div", { className: "text-xs text-muted-foreground", children: ["Generated on ", new Date(data.generatedAt).toLocaleString(), " \u2022 As of ", formatDate(data.asOfDate)] })] }));
}
