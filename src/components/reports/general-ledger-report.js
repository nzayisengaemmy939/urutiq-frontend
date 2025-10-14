import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
;
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
export function GeneralLedgerReport({ dateRange, asOfDate, loading, setLoading }) {
    const [data, setData] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterAccount, setFilterAccount] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortBy, setSortBy] = useState('date');
    const [sortOrder, setSortOrder] = useState('desc');
    const fetchData = async (page = 1) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                startDate: dateRange.startDate,
                endDate: dateRange.endDate,
                page: page.toString(),
                limit: '50'
            });
            if (filterAccount !== 'all') {
                params.append('accountId', filterAccount);
            }
            const response = await fetch(`/api/accounting-reports/general-ledger?${params}`, {
                headers: {
                    'x-tenant-id': 'tenant_demo',
                    'x-company-id': 'seed-company-1'
                }
            });
            if (!response.ok) {
                throw new Error('Failed to fetch general ledger data');
            }
            const result = await response.json();
            setData(result);
            setCurrentPage(page);
        }
        catch (error) {
            console.error('Error fetching general ledger:', error);
            toast.error('Failed to load general ledger data');
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchData(1);
    }, [dateRange, filterAccount]);
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'POSTED': return 'bg-green-100 text-green-800';
            case 'DRAFT': return 'bg-yellow-100 text-yellow-800';
            case 'PENDING': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
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
    const filteredEntries = data?.entries.filter(entry => {
        const matchesSearch = entry.account.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            entry.account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            entry.entry.memo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            entry.entry.reference.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    }) || [];
    const sortedEntries = [...filteredEntries].sort((a, b) => {
        let comparison = 0;
        switch (sortBy) {
            case 'date':
                comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
                break;
            case 'account':
                comparison = a.account.code.localeCompare(b.account.code);
                break;
            case 'amount':
                comparison = Math.abs(a.debit - a.credit) - Math.abs(b.debit - b.credit);
                break;
            default:
                comparison = 0;
        }
        return sortOrder === 'asc' ? comparison : -comparison;
    });
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= (data?.pagination.pages || 1)) {
            fetchData(newPage);
        }
    };
    if (loading) {
        return (_jsx("div", { className: "flex items-center justify-center h-64", children: _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(RefreshCw, { className: "h-4 w-4 animate-spin" }), _jsx("span", { children: "Loading general ledger..." })] }) }));
    }
    if (!data) {
        return (_jsxs("div", { className: "text-center py-8", children: [_jsx(BookOpen, { className: "h-8 w-8 mx-auto text-muted-foreground mb-2" }), _jsx("p", { className: "text-muted-foreground", children: "No general ledger data available" }), _jsxs(Button, { onClick: () => fetchData(1), className: "mt-4", children: [_jsx(RefreshCw, { className: "w-4 h-4 mr-2" }), "Retry"] })] }));
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid gap-4 md:grid-cols-4", children: [_jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium", children: "Total Entries" }) }), _jsx(CardContent, { children: _jsx("div", { className: "text-2xl font-bold", children: data.pagination.total.toLocaleString() }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium", children: "Current Page" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "text-2xl font-bold", children: [data.pagination.page, " of ", data.pagination.pages] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium", children: "Entries per Page" }) }), _jsx(CardContent, { children: _jsx("div", { className: "text-2xl font-bold", children: data.pagination.limit }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium", children: "Filtered Results" }) }), _jsx(CardContent, { children: _jsx("div", { className: "text-2xl font-bold", children: filteredEntries.length }) })] })] }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-4", children: [_jsx("div", { className: "flex-1", children: _jsx(Input, { placeholder: "Search entries...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "max-w-sm" }) }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Select, { value: filterAccount, onValueChange: setFilterAccount, children: [_jsx(SelectTrigger, { className: "w-48", children: _jsx(SelectValue, { placeholder: "Filter by account" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All Accounts" }), _jsx(SelectItem, { value: "1000", children: "1000 - Cash" }), _jsx(SelectItem, { value: "1100", children: "1100 - Accounts Receivable" }), _jsx(SelectItem, { value: "2000", children: "2000 - Accounts Payable" })] })] }), _jsxs(Select, { value: sortBy, onValueChange: setSortBy, children: [_jsx(SelectTrigger, { className: "w-32", children: _jsx(SelectValue, { placeholder: "Sort by" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "date", children: "Date" }), _jsx(SelectItem, { value: "account", children: "Account" }), _jsx(SelectItem, { value: "amount", children: "Amount" })] })] }), _jsx(Button, { variant: "outline", onClick: () => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'), children: sortOrder === 'asc' ? '↑' : '↓' }), _jsxs(Button, { variant: "outline", onClick: () => fetchData(currentPage), children: [_jsx(RefreshCw, { className: "w-4 h-4 mr-2" }), "Refresh"] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "General Ledger" }), _jsxs(CardDescription, { children: ["Period: ", formatDate(data.period.startDate), " - ", formatDate(data.period.endDate)] })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "overflow-x-auto", children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { children: "Date" }), _jsx(TableHead, { children: "Account" }), _jsx(TableHead, { children: "Description" }), _jsx(TableHead, { children: "Reference" }), _jsx(TableHead, { children: "Status" }), _jsx(TableHead, { className: "text-right", children: "Debit" }), _jsx(TableHead, { className: "text-right", children: "Credit" }), _jsx(TableHead, { className: "text-right", children: "Balance" })] }) }), _jsx(TableBody, { children: sortedEntries.map((entry) => (_jsxs(TableRow, { children: [_jsx(TableCell, { className: "font-mono text-sm", children: formatDate(entry.date) }), _jsx(TableCell, { children: _jsxs("div", { className: "space-y-1", children: [_jsx("div", { className: "font-mono text-sm font-medium", children: entry.account.code }), _jsx("div", { className: "text-sm text-muted-foreground", children: entry.account.name }), _jsx(Badge, { variant: "secondary", className: `text-xs ${getAccountTypeColor(typeof entry.account.type === 'string' ? entry.account.type : entry.account.type?.name)}`, children: typeof entry.account.type === 'string' ? entry.account.type : (entry.account.type?.name || 'Unknown') })] }) }), _jsx(TableCell, { className: "max-w-xs", children: _jsx("div", { className: "truncate", title: entry.entry.memo, children: entry.entry.memo || '-' }) }), _jsx(TableCell, { className: "font-mono text-sm", children: entry.entry.reference || '-' }), _jsx(TableCell, { children: _jsx(Badge, { variant: "secondary", className: getStatusColor(entry.entry.status), children: entry.entry.status }) }), _jsx(TableCell, { className: "text-right font-mono", children: entry.debit > 0 ? formatCurrency(entry.debit) : '-' }), _jsx(TableCell, { className: "text-right font-mono", children: entry.credit > 0 ? formatCurrency(entry.credit) : '-' }), _jsxs(TableCell, { className: `text-right font-mono font-medium ${entry.balance > 0 ? 'text-red-600' : entry.balance < 0 ? 'text-green-600' : 'text-muted-foreground'}`, children: [entry.balance !== 0 ? formatCurrency(Math.abs(entry.balance)) : '-', entry.balance !== 0 && (_jsx("span", { className: "ml-1 text-xs", children: entry.balance > 0 ? 'DR' : 'CR' }))] })] }, entry.id))) })] }) }), data.pagination.pages > 1 && (_jsxs("div", { className: "flex items-center justify-between mt-4", children: [_jsxs("div", { className: "text-sm text-muted-foreground", children: ["Showing ", ((data.pagination.page - 1) * data.pagination.limit) + 1, " to", ' ', Math.min(data.pagination.page * data.pagination.limit, data.pagination.total), " of", ' ', data.pagination.total, " entries"] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsxs(Button, { variant: "outline", size: "sm", onClick: () => handlePageChange(currentPage - 1), disabled: currentPage <= 1, children: [_jsx(ChevronLeft, { className: "h-4 w-4" }), "Previous"] }), _jsx("div", { className: "flex items-center space-x-1", children: Array.from({ length: Math.min(5, data.pagination.pages) }, (_, i) => {
                                                    const page = i + 1;
                                                    return (_jsx(Button, { variant: currentPage === page ? "default" : "outline", size: "sm", onClick: () => handlePageChange(page), className: "w-8 h-8 p-0", children: page }, page));
                                                }) }), _jsxs(Button, { variant: "outline", size: "sm", onClick: () => handlePageChange(currentPage + 1), disabled: currentPage >= data.pagination.pages, children: ["Next", _jsx(ChevronRight, { className: "h-4 w-4" })] })] })] }))] })] }), _jsxs("div", { className: "text-xs text-muted-foreground", children: ["Generated on ", new Date(data.generatedAt).toLocaleString()] })] }));
}
