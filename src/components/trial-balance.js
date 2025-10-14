import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Calculator, Download, AlertCircle, TrendingUp, CheckCircle, XCircle, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { accountingApi } from "../lib/api/accounting";
export function TrialBalance() {
    const [trialBalance, setTrialBalance] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0]);
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    // Load data on component mount
    useEffect(() => {
        loadTrialBalance();
    }, [asOfDate, currentPage, pageSize]);
    const loadTrialBalance = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await accountingApi.trialBalanceApi.getTrialBalance(asOfDate, undefined, currentPage, pageSize);
            setTrialBalance(data);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load trial balance");
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
    const getBalanceStatus = (debit, credit) => {
        return Math.abs(debit - credit) < 0.01 ? 'balanced' : 'unbalanced';
    };
    const getAccountTypeSummary = () => {
        if (!trialBalance)
            return [];
        const typeMap = new Map();
        trialBalance.accounts.forEach(account => {
            const type = account.accountType || 'Unknown';
            const existing = typeMap.get(type) || { name: type, totalDebits: 0, totalCredits: 0, count: 0 };
            existing.totalDebits += account.debitBalance || 0;
            existing.totalCredits += account.creditBalance || 0;
            existing.count += 1;
            typeMap.set(type, existing);
        });
        return Array.from(typeMap.values()).sort((a, b) => b.count - a.count);
    };
    const resetPagination = () => {
        setCurrentPage(1);
    };
    const exportToCSV = () => {
        if (!trialBalance)
            return;
        const headers = ['Account Code', 'Account Name', 'Account Type', 'Debit Balance', 'Credit Balance', 'Net Balance'];
        const rows = trialBalance.accounts.map(account => [
            account.code,
            account.name,
            account.accountType || 'Unknown',
            formatCurrency(account.debitBalance || 0),
            formatCurrency(account.creditBalance || 0),
            formatCurrency((account.debitBalance || 0) - (account.creditBalance || 0))
        ]);
        const csvContent = [headers, ...rows]
            .map(row => row.map(field => `"${field}"`).join(','))
            .join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `trial-balance-${asOfDate}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };
    if (loading) {
        return (_jsx("div", { className: "flex items-center justify-center h-64", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4" }), _jsx("p", { className: "text-gray-600", children: "Loading Trial Balance..." })] }) }));
    }
    if (error) {
        return (_jsx("div", { className: "flex items-center justify-center h-64", children: _jsxs("div", { className: "text-center", children: [_jsx(AlertCircle, { className: "h-12 w-12 text-red-500 mx-auto mb-4" }), _jsx("p", { className: "text-red-600 mb-4", children: error?.message || error?.toString() || 'Unknown error' }), _jsx(Button, { onClick: loadTrialBalance, children: "Retry" })] }) }));
    }
    if (!trialBalance) {
        return (_jsxs("div", { className: "text-center py-8 text-gray-500", children: [_jsx(Calculator, { className: "h-12 w-12 mx-auto mb-4 text-gray-300" }), _jsx("p", { children: "No trial balance data available" })] }));
    }
    const totalDebits = trialBalance.accounts.reduce((sum, acc) => sum + (acc.debitBalance || 0), 0);
    const totalCredits = trialBalance.accounts.reduce((sum, acc) => sum + (acc.creditBalance || 0), 0);
    const totalDifference = Math.abs(totalDebits - totalCredits);
    const isBalanced = totalDifference < 0.01;
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold", children: "Trial Balance" }), _jsx("p", { className: "text-gray-600", children: "Account balances as of a specific date" })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Label, { htmlFor: "asOfDate", children: "As of:" }), _jsx(Input, { id: "asOfDate", type: "date", value: asOfDate, onChange: (e) => {
                                            setAsOfDate(e.target.value);
                                            resetPagination();
                                        }, className: "w-40" })] }), _jsxs(Button, { variant: "outline", onClick: exportToCSV, children: [_jsx(Download, { className: "h-4 w-4 mr-2" }), "Export CSV"] })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium", children: "Total Debits" }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold text-green-600", children: formatCurrency(totalDebits) }), _jsx("p", { className: "text-xs text-gray-600", children: "All debit balances" })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium", children: "Total Credits" }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold text-blue-600", children: formatCurrency(totalCredits) }), _jsx("p", { className: "text-xs text-gray-600", children: "All credit balances" })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium", children: "Difference" }) }), _jsxs(CardContent, { children: [_jsx("div", { className: `text-2xl font-bold ${isBalanced ? 'text-green-600' : 'text-red-600'}`, children: formatCurrency(totalDifference) }), _jsx("p", { className: "text-xs text-gray-600", children: isBalanced ? 'Balanced' : 'Unbalanced' })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium", children: "Status" }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "flex items-center gap-2", children: isBalanced ? (_jsxs(_Fragment, { children: [_jsx(CheckCircle, { className: "h-6 w-6 text-green-600" }), _jsx("span", { className: "text-lg font-bold text-green-600", children: "Balanced" })] })) : (_jsxs(_Fragment, { children: [_jsx(XCircle, { className: "h-6 w-6 text-red-600" }), _jsx("span", { className: "text-lg font-bold text-red-600", children: "Unbalanced" })] })) }), _jsx("p", { className: "text-xs text-gray-600", children: isBalanced ? 'All accounts balanced' : 'Review required' })] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(TrendingUp, { className: "h-5 w-5" }), "Account Type Summary"] }), _jsx(CardDescription, { children: "Balances grouped by account type" })] }), _jsx(CardContent, { children: _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: getAccountTypeSummary().map((type, index) => (_jsxs("div", { className: "border rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("h4", { className: "font-medium", children: type.name }), _jsxs(Badge, { variant: "outline", children: [type.count, " accounts"] })] }), _jsxs("div", { className: "space-y-1 text-sm", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600", children: "Total Debits:" }), _jsx("span", { className: "font-medium text-green-600", children: formatCurrency(type.totalDebits) })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600", children: "Total Credits:" }), _jsx("span", { className: "font-medium text-blue-600", children: formatCurrency(type.totalCredits) })] }), _jsxs("div", { className: "flex justify-between border-t pt-1", children: [_jsx("span", { className: "text-gray-600", children: "Net:" }), _jsx("span", { className: `font-medium ${type.totalDebits > type.totalCredits ? 'text-green-600' : 'text-blue-600'}`, children: formatCurrency(type.totalDebits - type.totalCredits) })] })] })] }, index))) }) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Calculator, { className: "h-5 w-5" }), "Detailed Trial Balance"] }), _jsxs(CardDescription, { children: ["Complete list of all accounts with their balances as of ", new Date(asOfDate).toLocaleDateString()] })] }), _jsx(CardContent, { children: _jsxs("div", { className: "overflow-x-auto", children: [_jsxs("table", { className: "w-full", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b", children: [_jsx("th", { className: "text-left py-3 px-4 font-medium", children: "Account Code" }), _jsx("th", { className: "text-left py-3 px-4 font-medium", children: "Account Name" }), _jsx("th", { className: "text-left py-3 px-4 font-medium", children: "Account Type" }), _jsx("th", { className: "text-right py-3 px-4 font-medium", children: "Debit Balance" }), _jsx("th", { className: "text-right py-3 px-4 font-medium", children: "Credit Balance" }), _jsx("th", { className: "text-right py-3 px-4 font-medium", children: "Net Balance" }), _jsx("th", { className: "text-center py-3 px-4 font-medium", children: "Status" })] }) }), _jsx("tbody", { children: trialBalance.accounts.map((account, index) => {
                                                const netBalance = (account.debitBalance || 0) - (account.creditBalance || 0);
                                                const balanceStatus = getBalanceStatus(account.debitBalance || 0, account.creditBalance || 0);
                                                return (_jsxs("tr", { className: "border-b hover:bg-gray-50", children: [_jsx("td", { className: "py-3 px-4 font-mono text-sm", children: account.code }), _jsx("td", { className: "py-3 px-4 font-medium", children: account.name }), _jsx("td", { className: "py-3 px-4", children: _jsx(Badge, { variant: "outline", className: "text-xs", children: account.accountType || 'Unknown' }) }), _jsx("td", { className: "py-3 px-4 text-right", children: _jsx("span", { className: account.debitBalance && account.debitBalance > 0 ? 'text-green-600 font-medium' : 'text-gray-400', children: account.debitBalance && account.debitBalance > 0 ? formatCurrency(account.debitBalance) : '-' }) }), _jsx("td", { className: "py-3 px-4 text-right", children: _jsx("span", { className: account.creditBalance && account.creditBalance > 0 ? 'text-blue-600 font-medium' : 'text-gray-400', children: account.creditBalance && account.creditBalance > 0 ? formatCurrency(account.creditBalance) : '-' }) }), _jsx("td", { className: "py-3 px-4 text-right", children: _jsx("span", { className: `font-medium ${netBalance > 0 ? 'text-green-600' : netBalance < 0 ? 'text-blue-600' : 'text-gray-600'}`, children: formatCurrency(Math.abs(netBalance)) }) }), _jsx("td", { className: "py-3 px-4 text-center", children: _jsx(Badge, { variant: balanceStatus === 'balanced' ? 'default' : 'secondary', children: balanceStatus === 'balanced' ? 'Balanced' : 'Unbalanced' }) })] }, account.id || index));
                                            }) }), _jsx("tfoot", { children: _jsxs("tr", { className: "border-t-2 bg-gray-50 font-bold", children: [_jsx("td", { colSpan: 3, className: "py-3 px-4", children: "TOTALS" }), _jsx("td", { className: "py-3 px-4 text-right text-green-600", children: formatCurrency(totalDebits) }), _jsx("td", { className: "py-3 px-4 text-right text-blue-600", children: formatCurrency(totalCredits) }), _jsx("td", { className: "py-3 px-4 text-right", children: _jsx("span", { className: isBalanced ? 'text-green-600' : 'text-red-600', children: formatCurrency(totalDifference) }) }), _jsx("td", { className: "py-3 px-4 text-center", children: _jsx(Badge, { variant: isBalanced ? 'default' : 'destructive', children: isBalanced ? 'BALANCED' : 'UNBALANCED' }) })] }) })] }), trialBalance?.pagination && (_jsxs("div", { className: "flex items-center justify-between mt-6", children: [_jsxs("div", { className: "text-sm text-gray-600", children: ["Showing ", ((trialBalance.pagination.page - 1) * trialBalance.pagination.pageSize) + 1, " to ", Math.min(trialBalance.pagination.page * trialBalance.pagination.pageSize, trialBalance.pagination.totalCount), " of ", trialBalance.pagination.totalCount, " accounts"] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Button, { variant: "outline", size: "sm", onClick: () => setCurrentPage(1), disabled: !trialBalance.pagination.hasPrev, children: _jsx(ChevronsLeft, { className: "h-4 w-4" }) }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => setCurrentPage(currentPage - 1), disabled: !trialBalance.pagination.hasPrev, children: _jsx(ChevronLeft, { className: "h-4 w-4" }) }), _jsxs("span", { className: "text-sm text-gray-600", children: ["Page ", trialBalance.pagination.page, " of ", trialBalance.pagination.totalPages] }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => setCurrentPage(currentPage + 1), disabled: !trialBalance.pagination.hasNext, children: _jsx(ChevronRight, { className: "h-4 w-4" }) }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => setCurrentPage(trialBalance.pagination.totalPages), disabled: !trialBalance.pagination.hasNext, children: _jsx(ChevronsRight, { className: "h-4 w-4" }) })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-sm text-gray-600", children: "Page size:" }), _jsxs(Select, { value: pageSize.toString(), onValueChange: (value) => {
                                                        setPageSize(parseInt(value));
                                                        setCurrentPage(1);
                                                    }, children: [_jsx(SelectTrigger, { className: "w-20", children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "10", children: "10" }), _jsx(SelectItem, { value: "20", children: "20" }), _jsx(SelectItem, { value: "50", children: "50" }), _jsx(SelectItem, { value: "100", children: "100" })] })] })] })] }))] }) })] })] }));
}
