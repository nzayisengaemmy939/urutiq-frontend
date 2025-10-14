import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
;
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { exportToPDF, exportToCSV, formatCurrency as formatCurrencyUtil } from '@/lib/report-export';
import { apiClient } from '@/lib/api-client';
export function TrialBalanceReport({ dateRange, asOfDate, loading, setLoading }) {
    const [data, setData] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [sortBy, setSortBy] = useState('code');
    const fetchData = async () => {
        setLoading(true);
        try {
            console.log('Fetching trial balance data...');
            const result = await apiClient.get('/api/accounting-reports/trial-balance', {
                startDate: dateRange.startDate,
                endDate: dateRange.endDate
            });
            setData(result);
        }
        catch (error) {
            console.error('Error fetching trial balance:', error);
            toast.error('Failed to load trial balance data');
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchData();
    }, [dateRange]);
    const formatCurrency = formatCurrencyUtil;
    const filteredAccounts = data?.accounts.filter(account => {
        const matchesSearch = account.accountCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
            account.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            account.accountType.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterType === 'all' || account.accountType === filterType;
        return matchesSearch && matchesFilter;
    }) || [];
    const sortedAccounts = [...filteredAccounts].sort((a, b) => {
        switch (sortBy) {
            case 'code':
                return a.accountCode.localeCompare(b.accountCode);
            case 'name':
                return a.accountName.localeCompare(b.accountName);
            case 'type':
                return a.accountType.localeCompare(b.accountType);
            case 'balance':
                return Math.abs(b.balance) - Math.abs(a.balance);
            default:
                return 0;
        }
    });
    const getAccountTypeColor = (type) => {
        switch (type) {
            case 'Asset': return 'bg-blue-100 text-blue-800';
            case 'Liability': return 'bg-red-100 text-red-800';
            case 'Equity': return 'bg-green-100 text-green-800';
            case 'Revenue': return 'bg-purple-100 text-purple-800';
            case 'Expense': return 'bg-orange-100 text-orange-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    const handleExportPDF = () => {
        if (!data)
            return;
        const exportData = sortedAccounts.map(account => ({
            accountCode: account.accountCode,
            accountName: account.accountName,
            accountType: account.accountType,
            debitTotal: account.debitTotal,
            creditTotal: account.creditTotal,
            balance: account.balance,
            balanceType: account.isDebit ? 'DR' : 'CR'
        }));
        exportToPDF({
            title: 'Trial Balance',
            subtitle: `Period: ${new Date(data.period.startDate).toLocaleDateString()} - ${new Date(data.period.endDate).toLocaleDateString()}`,
            data: exportData,
            columns: [
                { key: 'accountCode', label: 'Account Code', width: 20 },
                { key: 'accountName', label: 'Account Name', width: 40 },
                { key: 'accountType', label: 'Type', width: 15 },
                { key: 'debitTotal', label: 'Debit Total', width: 20, align: 'right' },
                { key: 'creditTotal', label: 'Credit Total', width: 20, align: 'right' },
                { key: 'balance', label: 'Balance', width: 20, align: 'right' },
                { key: 'balanceType', label: 'DR/CR', width: 10, align: 'center' }
            ],
            summary: [
                { label: 'Total Debits:', value: formatCurrency(data.summary.totalDebits) },
                { label: 'Total Credits:', value: formatCurrency(data.summary.totalCredits) },
                { label: 'Difference:', value: formatCurrency(data.summary.difference) },
                { label: 'Status:', value: data.summary.isBalanced ? 'Balanced' : 'Out of Balance' }
            ],
            filename: `Trial_Balance_${new Date().toISOString().split('T')[0]}.pdf`
        });
    };
    const handleExportCSV = () => {
        if (!data)
            return;
        const exportData = sortedAccounts.map(account => ({
            accountCode: account.accountCode,
            accountName: account.accountName,
            accountType: account.accountType,
            debitTotal: account.debitTotal,
            creditTotal: account.creditTotal,
            balance: account.balance,
            balanceType: account.isDebit ? 'DR' : 'CR'
        }));
        exportToCSV({
            title: 'Trial Balance',
            subtitle: `Period: ${new Date(data.period.startDate).toLocaleDateString()} - ${new Date(data.period.endDate).toLocaleDateString()}`,
            data: exportData,
            columns: [
                { key: 'accountCode', label: 'Account Code' },
                { key: 'accountName', label: 'Account Name' },
                { key: 'accountType', label: 'Type' },
                { key: 'debitTotal', label: 'Debit Total' },
                { key: 'creditTotal', label: 'Credit Total' },
                { key: 'balance', label: 'Balance' },
                { key: 'balanceType', label: 'DR/CR' }
            ],
            filename: `Trial_Balance_${new Date().toISOString().split('T')[0]}.csv`
        });
    };
    if (loading) {
        return (_jsx("div", { className: "flex items-center justify-center h-64", children: _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(RefreshCw, { className: "h-4 w-4 animate-spin" }), _jsx("span", { children: "Loading trial balance..." })] }) }));
    }
    if (!data) {
        return (_jsxs("div", { className: "text-center py-8", children: [_jsx(AlertTriangle, { className: "h-8 w-8 mx-auto text-muted-foreground mb-2" }), _jsx("p", { className: "text-muted-foreground", children: "No trial balance data available" }), _jsxs(Button, { onClick: fetchData, className: "mt-4", children: [_jsx(RefreshCw, { className: "w-4 h-4 mr-2" }), "Retry"] })] }));
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid gap-4 md:grid-cols-3", children: [_jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium", children: "Total Debits" }) }), _jsx(CardContent, { children: _jsx("div", { className: "text-2xl font-bold text-red-600", children: formatCurrency(data.summary.totalDebits) }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium", children: "Total Credits" }) }), _jsx(CardContent, { children: _jsx("div", { className: "text-2xl font-bold text-green-600", children: formatCurrency(data.summary.totalCredits) }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium", children: "Balance Status" }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "flex items-center space-x-2", children: [data.summary.isBalanced ? (_jsx(CheckCircle, { className: "h-5 w-5 text-green-600" })) : (_jsx(AlertTriangle, { className: "h-5 w-5 text-red-600" })), _jsx("span", { className: `text-sm font-medium ${data.summary.isBalanced ? 'text-green-600' : 'text-red-600'}`, children: data.summary.isBalanced ? 'Balanced' : 'Out of Balance' })] }), !data.summary.isBalanced && (_jsxs("p", { className: "text-xs text-muted-foreground mt-1", children: ["Difference: ", formatCurrency(data.summary.difference)] }))] })] })] }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-4", children: [_jsx("div", { className: "flex-1", children: _jsx(Input, { placeholder: "Search accounts...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "max-w-sm" }) }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Select, { value: filterType, onValueChange: setFilterType, children: [_jsx(SelectTrigger, { className: "w-40", children: _jsx(SelectValue, { placeholder: "Filter by type" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All Types" }), _jsx(SelectItem, { value: "Asset", children: "Assets" }), _jsx(SelectItem, { value: "Liability", children: "Liabilities" }), _jsx(SelectItem, { value: "Equity", children: "Equity" }), _jsx(SelectItem, { value: "Revenue", children: "Revenue" }), _jsx(SelectItem, { value: "Expense", children: "Expenses" })] })] }), _jsxs(Select, { value: sortBy, onValueChange: setSortBy, children: [_jsx(SelectTrigger, { className: "w-40", children: _jsx(SelectValue, { placeholder: "Sort by" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "code", children: "Account Code" }), _jsx(SelectItem, { value: "name", children: "Account Name" }), _jsx(SelectItem, { value: "type", children: "Account Type" }), _jsx(SelectItem, { value: "balance", children: "Balance" })] })] }), _jsxs(Button, { variant: "outline", onClick: fetchData, children: [_jsx(RefreshCw, { className: "w-4 h-4 mr-2" }), "Refresh"] }), _jsxs(Button, { variant: "outline", onClick: handleExportCSV, children: [_jsx(Download, { className: "w-4 h-4 mr-2" }), "Export CSV"] }), _jsxs(Button, { onClick: handleExportPDF, children: [_jsx(Download, { className: "w-4 h-4 mr-2" }), "Export PDF"] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Trial Balance" }), _jsxs(CardDescription, { children: ["Period: ", new Date(data.period.startDate).toLocaleDateString(), " - ", new Date(data.period.endDate).toLocaleDateString()] })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "overflow-x-auto", children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { children: "Account Code" }), _jsx(TableHead, { children: "Account Name" }), _jsx(TableHead, { children: "Type" }), _jsx(TableHead, { className: "text-right", children: "Debit Total" }), _jsx(TableHead, { className: "text-right", children: "Credit Total" }), _jsx(TableHead, { className: "text-right", children: "Balance" })] }) }), _jsx(TableBody, { children: sortedAccounts.map((account) => (_jsxs(TableRow, { children: [_jsx(TableCell, { className: "font-mono text-sm", children: account.accountCode }), _jsx(TableCell, { className: "font-medium", children: account.accountName }), _jsx(TableCell, { children: _jsx(Badge, { variant: "secondary", className: getAccountTypeColor(account.accountType), children: account.accountType }) }), _jsx(TableCell, { className: "text-right font-mono", children: account.debitTotal > 0 ? formatCurrency(account.debitTotal) : '-' }), _jsx(TableCell, { className: "text-right font-mono", children: account.creditTotal > 0 ? formatCurrency(account.creditTotal) : '-' }), _jsxs(TableCell, { className: `text-right font-mono font-medium ${account.balance > 0 ? 'text-red-600' : account.balance < 0 ? 'text-green-600' : 'text-muted-foreground'}`, children: [account.balance !== 0 ? formatCurrency(Math.abs(account.balance)) : '-', account.balance !== 0 && (_jsx("span", { className: "ml-1 text-xs", children: account.isDebit ? 'DR' : 'CR' }))] })] }, account.accountId))) })] }) }), _jsx("div", { className: "mt-4 pt-4 border-t", children: _jsxs("div", { className: "grid grid-cols-6 gap-4 text-sm font-medium", children: [_jsx("div", { className: "col-span-3" }), _jsx("div", { className: "text-right font-mono", children: formatCurrency(data.summary.totalDebits) }), _jsx("div", { className: "text-right font-mono", children: formatCurrency(data.summary.totalCredits) }), _jsx("div", { className: "text-right font-mono", children: formatCurrency(data.summary.difference) })] }) })] })] }), _jsxs("div", { className: "text-xs text-muted-foreground", children: ["Generated on ", new Date(data.generatedAt).toLocaleString()] })] }));
}
