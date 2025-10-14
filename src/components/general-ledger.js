import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { BarChart3, Calendar, Download, Filter, AlertCircle, TrendingUp, Hash, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { accountingApi } from "../lib/api/accounting";
export function GeneralLedger() {
    const [ledgerData, setLedgerData] = useState(null);
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // Filters
    const [startDate, setStartDate] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedAccountId, setSelectedAccountId] = useState('all');
    const [selectedAccountType, setSelectedAccountType] = useState('all');
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    // Load data on component mount
    useEffect(() => {
        loadAccounts();
    }, []);
    useEffect(() => {
        if (accounts.length > 0) {
            loadLedgerData();
        }
    }, [startDate, endDate, selectedAccountId, selectedAccountType, accounts, currentPage, pageSize]);
    const loadAccounts = async () => {
        try {
            const accountsData = await accountingApi.chartOfAccountsApi.getAll();
            // accountsData may be a wrapper { accounts, pagination } or an array
            setAccounts(Array.isArray(accountsData) ? accountsData : accountsData.accounts);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load accounts");
        }
    };
    const loadLedgerData = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await accountingApi.generalLedgerApi.getGeneralLedger({
                startDate,
                endDate,
                accountId: selectedAccountId === 'all' ? undefined : selectedAccountId,
                accountType: selectedAccountType === 'all' ? undefined : selectedAccountType,
                page: currentPage,
                pageSize
            });
            setLedgerData(data);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load general ledger");
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
        return new Date(dateString).toLocaleDateString();
    };
    const getAccountName = (accountId) => {
        const account = accounts.find(acc => acc.id === accountId);
        return account ? `${account.code} - ${account.name}` : "Unknown Account";
    };
    const getAccountTypeName = (accountId) => {
        const account = accounts.find(acc => acc.id === accountId);
        return account?.accountType || "Unknown";
    };
    const getFilteredEntries = () => {
        if (!ledgerData)
            return [];
        let entries = ledgerData.entries;
        if (selectedAccountId && selectedAccountId !== 'all') {
            entries = entries.filter(entry => entry.accountId === selectedAccountId);
        }
        if (selectedAccountType && selectedAccountType !== 'all') {
            entries = entries.filter(entry => {
                const account = accounts.find(acc => acc.id === entry.accountId);
                return account?.accountType === selectedAccountType;
            });
        }
        return entries;
    };
    const getAccountTypeOptions = () => {
        const types = new Set(accounts.map(acc => acc.accountType).filter(Boolean));
        return Array.from(types).sort();
    };
    const calculateRunningBalance = (entries, accountId) => {
        let balance = 0;
        entries.forEach(entry => {
            if (entry.accountId === accountId) {
                if (entry.debit > 0) {
                    balance += entry.debit;
                }
                else if (entry.credit > 0) {
                    balance -= entry.credit;
                }
            }
        });
        return balance;
    };
    const exportToCSV = () => {
        if (!ledgerData)
            return;
        const filteredEntries = getFilteredEntries();
        const headers = ['Date', 'Account', 'Account Type', 'Reference', 'Description', 'Debit', 'Credit', 'Running Balance'];
        const rows = filteredEntries.map(entry => [
            formatDate(entry.date),
            getAccountName(entry.accountId),
            getAccountTypeName(entry.accountId),
            entry.reference,
            entry.description,
            entry.debit > 0 ? formatCurrency(entry.debit) : '',
            entry.credit > 0 ? formatCurrency(entry.credit) : '',
            formatCurrency(calculateRunningBalance(filteredEntries.slice(0, filteredEntries.indexOf(entry) + 1), entry.accountId))
        ]);
        const csvContent = [headers, ...rows]
            .map(row => row.map(field => `"${field}"`).join(','))
            .join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `general-ledger-${startDate}-to-${endDate}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };
    const clearFilters = () => {
        setSelectedAccountId('all');
        setSelectedAccountType('all');
        setCurrentPage(1);
    };
    if (loading && !ledgerData) {
        return (_jsx("div", { className: "flex items-center justify-center h-64", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4" }), _jsx("p", { className: "text-gray-600", children: "Loading General Ledger..." })] }) }));
    }
    if (error) {
        return (_jsx("div", { className: "flex items-center justify-center h-64", children: _jsxs("div", { className: "text-center", children: [_jsx(AlertCircle, { className: "h-12 w-12 text-red-500 mx-auto mb-4" }), _jsx("p", { className: "text-red-600 mb-4", children: error }), _jsx(Button, { onClick: loadLedgerData, children: "Retry" })] }) }));
    }
    if (!ledgerData) {
        return (_jsxs("div", { className: "text-center py-8 text-gray-500", children: [_jsx(BarChart3, { className: "h-12 w-12 mx-auto mb-4 text-gray-300" }), _jsx("p", { children: "No general ledger data available" })] }));
    }
    const filteredEntries = getFilteredEntries();
    const totalEntries = filteredEntries.length;
    const totalDebits = filteredEntries.reduce((sum, entry) => sum + (entry.debit || 0), 0);
    const totalCredits = filteredEntries.reduce((sum, entry) => sum + (entry.credit || 0), 0);
    const periodDays = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24));
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold", children: "General Ledger" }), _jsx("p", { className: "text-gray-600", children: "Detailed transaction history and account activity" })] }), _jsx("div", { className: "flex items-center gap-3", children: _jsxs(Button, { variant: "outline", onClick: exportToCSV, children: [_jsx(Download, { className: "h-4 w-4 mr-2" }), "Export CSV"] }) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Filter, { className: "h-5 w-5" }), "Filters"] }), _jsx(CardDescription, { children: "Filter ledger entries by date range, account, and account type" })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "startDate", children: "Start Date" }), _jsx(Input, { id: "startDate", type: "date", value: startDate, onChange: (e) => setStartDate(e.target.value) })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "endDate", children: "End Date" }), _jsx(Input, { id: "endDate", type: "date", value: endDate, onChange: (e) => setEndDate(e.target.value) })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "account", children: "Account" }), _jsxs(Select, { value: selectedAccountId, onValueChange: setSelectedAccountId, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "All accounts" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All accounts" }), accounts.map(account => (_jsxs(SelectItem, { value: account.id, children: [account.code, " - ", account.name] }, account.id)))] })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "accountType", children: "Account Type" }), _jsxs(Select, { value: selectedAccountType, onValueChange: setSelectedAccountType, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "All types" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All types" }), getAccountTypeOptions().map(type => (_jsx(SelectItem, { value: String(type), children: type }, type)))] })] })] })] }), _jsx("div", { className: "flex justify-end mt-4", children: _jsx(Button, { variant: "outline", onClick: clearFilters, children: "Clear Filters" }) })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium", children: "Total Entries" }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: totalEntries }), _jsx("p", { className: "text-xs text-gray-600", children: "Filtered results" })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium", children: "Period" }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: periodDays }), _jsx("p", { className: "text-xs text-gray-600", children: "Days" })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium", children: "Total Debits" }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold text-green-600", children: formatCurrency(totalDebits) }), _jsx("p", { className: "text-xs text-gray-600", children: "Period total" })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium", children: "Total Credits" }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold text-blue-600", children: formatCurrency(totalCredits) }), _jsx("p", { className: "text-xs text-gray-600", children: "Period total" })] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(BarChart3, { className: "h-5 w-5" }), "Ledger Entries"] }), _jsxs(CardDescription, { children: [selectedAccountId && selectedAccountId !== 'all' ? `Entries for ${getAccountName(selectedAccountId)}` : 'All ledger entries', "from ", formatDate(startDate), " to ", formatDate(endDate)] })] }), _jsx(CardContent, { children: filteredEntries.length === 0 ? (_jsxs("div", { className: "text-center py-8 text-gray-500", children: [_jsx(BarChart3, { className: "h-12 w-12 mx-auto mb-4 text-gray-300" }), _jsx("p", { children: "No ledger entries found for the selected filters" }), _jsx("p", { className: "text-sm", children: "Try adjusting your date range or account filters" })] })) : (_jsxs("div", { className: "overflow-x-auto", children: [_jsxs("table", { className: "w-full", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b", children: [_jsx("th", { className: "text-left py-3 px-4 font-medium", children: "Date" }), _jsx("th", { className: "text-left py-3 px-4 font-medium", children: "Account" }), _jsx("th", { className: "text-left py-3 px-4 font-medium", children: "Type" }), _jsx("th", { className: "text-left py-3 px-4 font-medium", children: "Reference" }), _jsx("th", { className: "text-left py-3 px-4 font-medium", children: "Description" }), _jsx("th", { className: "text-right py-3 px-4 font-medium", children: "Debit" }), _jsx("th", { className: "text-right py-3 px-4 font-medium", children: "Credit" }), _jsx("th", { className: "text-right py-3 px-4 font-medium", children: "Running Balance" })] }) }), _jsx("tbody", { children: filteredEntries.map((entry, index) => {
                                                const runningBalance = calculateRunningBalance(filteredEntries.slice(0, index + 1), entry.accountId);
                                                return (_jsxs("tr", { className: "border-b hover:bg-gray-50", children: [_jsx("td", { className: "py-3 px-4 text-sm", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Calendar, { className: "h-3 w-3 text-gray-400" }), formatDate(entry.date)] }) }), _jsx("td", { className: "py-3 px-4", children: _jsx("div", { className: "font-medium", children: getAccountName(entry.accountId) }) }), _jsx("td", { className: "py-3 px-4", children: _jsx(Badge, { variant: "outline", className: "text-xs", children: getAccountTypeName(entry.accountId) }) }), _jsx("td", { className: "py-3 px-4", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Hash, { className: "h-3 w-3 text-gray-400" }), _jsx("span", { className: "font-mono text-sm", children: entry.reference })] }) }), _jsx("td", { className: "py-3 px-4 max-w-xs", children: _jsx("div", { className: "truncate", title: entry.description, children: entry.description }) }), _jsx("td", { className: "py-3 px-4 text-right", children: _jsx("span", { className: entry.debit > 0 ? 'text-green-600 font-medium' : 'text-gray-400', children: entry.debit > 0 ? formatCurrency(entry.debit) : '-' }) }), _jsx("td", { className: "py-3 px-4 text-right", children: _jsx("span", { className: entry.credit > 0 ? 'text-blue-600 font-medium' : 'text-gray-400', children: entry.credit > 0 ? formatCurrency(entry.credit) : '-' }) }), _jsx("td", { className: "py-3 px-4 text-right", children: _jsx("span", { className: `font-medium ${runningBalance > 0 ? 'text-green-600' : runningBalance < 0 ? 'text-blue-600' : 'text-gray-600'}`, children: formatCurrency(Math.abs(runningBalance)) }) })] }, entry.id));
                                            }) }), _jsx("tfoot", { children: _jsxs("tr", { className: "border-t-2 bg-gray-50 font-bold", children: [_jsx("td", { colSpan: 5, className: "py-3 px-4", children: "TOTALS" }), _jsx("td", { className: "py-3 px-4 text-right text-green-600", children: formatCurrency(totalDebits) }), _jsx("td", { className: "py-3 px-4 text-right text-blue-600", children: formatCurrency(totalCredits) }), _jsx("td", { className: "py-3 px-4 text-right", children: _jsx("span", { className: Math.abs(totalDebits - totalCredits) < 0.01 ? 'text-green-600' : 'text-red-600', children: formatCurrency(Math.abs(totalDebits - totalCredits)) }) })] }) })] }), ledgerData?.pagination && (_jsxs("div", { className: "flex items-center justify-between mt-6", children: [_jsxs("div", { className: "text-sm text-gray-600", children: ["Showing ", ((ledgerData.pagination.page - 1) * ledgerData.pagination.pageSize) + 1, " to ", Math.min(ledgerData.pagination.page * ledgerData.pagination.pageSize, ledgerData.pagination.totalCount), " of ", ledgerData.pagination.totalCount, " entries"] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Button, { variant: "outline", size: "sm", onClick: () => setCurrentPage(1), disabled: !ledgerData.pagination.hasPrev, children: _jsx(ChevronsLeft, { className: "h-4 w-4" }) }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => setCurrentPage(currentPage - 1), disabled: !ledgerData.pagination.hasPrev, children: _jsx(ChevronLeft, { className: "h-4 w-4" }) }), _jsxs("span", { className: "text-sm text-gray-600", children: ["Page ", ledgerData.pagination.page, " of ", ledgerData.pagination.totalPages] }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => setCurrentPage(currentPage + 1), disabled: !ledgerData.pagination.hasNext, children: _jsx(ChevronRight, { className: "h-4 w-4" }) }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => setCurrentPage(ledgerData.pagination.totalPages), disabled: !ledgerData.pagination.hasNext, children: _jsx(ChevronsRight, { className: "h-4 w-4" }) })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-sm text-gray-600", children: "Page size:" }), _jsxs(Select, { value: pageSize.toString(), onValueChange: (value) => {
                                                        setPageSize(parseInt(value));
                                                        setCurrentPage(1);
                                                    }, children: [_jsx(SelectTrigger, { className: "w-20", children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "10", children: "10" }), _jsx(SelectItem, { value: "20", children: "20" }), _jsx(SelectItem, { value: "50", children: "50" }), _jsx(SelectItem, { value: "100", children: "100" })] })] })] })] }))] })) })] }), selectedAccountId && selectedAccountId !== 'all' && (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(TrendingUp, { className: "h-5 w-5" }), "Account Summary"] }), _jsxs(CardDescription, { children: ["Summary for ", getAccountName(selectedAccountId)] })] }), _jsx(CardContent, { children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { className: "text-center p-4 border rounded-lg", children: [_jsx("div", { className: "text-2xl font-bold text-green-600", children: formatCurrency(totalDebits) }), _jsx("p", { className: "text-sm text-gray-600", children: "Total Debits" })] }), _jsxs("div", { className: "text-center p-4 border rounded-lg", children: [_jsx("div", { className: "text-2xl font-bold text-blue-600", children: formatCurrency(totalCredits) }), _jsx("p", { className: "text-sm text-gray-600", children: "Total Credits" })] }), _jsxs("div", { className: "text-center p-4 border rounded-lg", children: [_jsx("div", { className: `text-2xl font-bold ${totalDebits > totalCredits ? 'text-green-600' : 'text-blue-600'}`, children: formatCurrency(Math.abs(totalDebits - totalCredits)) }), _jsx("p", { className: "text-sm text-gray-600", children: "Net Change" })] })] }) })] }))] }));
}
