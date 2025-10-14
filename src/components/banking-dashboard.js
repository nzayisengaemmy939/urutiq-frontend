import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { TrendingUp, TrendingDown, DollarSign, CreditCard, Building2, AlertTriangle, Clock, BarChart3, PieChart, Activity } from "lucide-react";
import { bankingApi } from '@/lib/api/banking';
export function BankingDashboard({ companyId }) {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedPeriod, setSelectedPeriod] = useState('30');
    const [selectedAccount, setSelectedAccount] = useState('all');
    useEffect(() => {
        loadDashboardData();
    }, [selectedPeriod, selectedAccount]);
    const loadDashboardData = async () => {
        setLoading(true);
        try {
            const currentCompanyId = companyId || localStorage.getItem('company_id') || localStorage.getItem('companyId') || 'seed-company-1';
            // Load bank accounts
            const accountsResponse = await bankingApi.getBankAccounts(currentCompanyId);
            // Load transactions
            const transactionsResponse = await bankingApi.getBankTransactions(undefined, currentCompanyId, undefined, 1, 100);
            // Calculate dashboard metrics
            const totalBalance = accountsResponse.reduce((sum, account) => sum + Number(account.balance || 0), 0);
            const totalTransactions = transactionsResponse.items.length;
            const reconciledTransactions = transactionsResponse.items.filter(t => t.status === 'reconciled').length;
            const pendingTransactions = transactionsResponse.items.filter(t => t.status === 'pending').length;
            const uncategorizedTransactions = transactionsResponse.items.filter(t => !t.category || t.category === 'Uncategorized').length;
            // Calculate monthly cash flow
            const now = new Date();
            const thirtyDaysAgo = new Date(now.getTime() - (parseInt(selectedPeriod) * 24 * 60 * 60 * 1000));
            const recentTransactions = transactionsResponse.items.filter(t => new Date(t.transactionDate) >= thirtyDaysAgo);
            const monthlyInflow = recentTransactions
                .filter(t => Number(t.amount) > 0)
                .reduce((sum, t) => sum + Number(t.amount), 0);
            const monthlyOutflow = Math.abs(recentTransactions
                .filter(t => Number(t.amount) < 0)
                .reduce((sum, t) => sum + Number(t.amount), 0));
            const netCashFlow = monthlyInflow - monthlyOutflow;
            // Account breakdown
            const accountBreakdown = accountsResponse.map(account => {
                const accountTransactions = transactionsResponse.items.filter(t => t.bankAccountId === account.id);
                const lastTransaction = accountTransactions.sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime())[0];
                return {
                    account,
                    balance: Number(account.balance || 0),
                    transactionCount: accountTransactions.length,
                    lastActivity: lastTransaction ? lastTransaction.transactionDate : account.createdAt || ''
                };
            });
            // Category breakdown
            const categoryBreakdown = recentTransactions.reduce((acc, t) => {
                const category = t.category || 'Uncategorized';
                acc[category] = (acc[category] || 0) + Math.abs(Number(t.amount));
                return acc;
            }, {});
            // Cash flow trend (last 7 days)
            const cashFlowTrend = [];
            for (let i = 6; i >= 0; i--) {
                const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
                const dayStart = new Date(date.setHours(0, 0, 0, 0));
                const dayEnd = new Date(date.setHours(23, 59, 59, 999));
                const dayTransactions = recentTransactions.filter(t => {
                    const transactionDate = new Date(t.transactionDate);
                    return transactionDate >= dayStart && transactionDate <= dayEnd;
                });
                const inflow = dayTransactions
                    .filter(t => Number(t.amount) > 0)
                    .reduce((sum, t) => sum + Number(t.amount), 0);
                const outflow = Math.abs(dayTransactions
                    .filter(t => Number(t.amount) < 0)
                    .reduce((sum, t) => sum + Number(t.amount), 0));
                cashFlowTrend.push({
                    date: dayStart.toISOString().split('T')[0],
                    inflow,
                    outflow,
                    net: inflow - outflow
                });
            }
            setDashboardData({
                totalBalance,
                totalTransactions,
                reconciledTransactions,
                pendingTransactions,
                uncategorizedTransactions,
                monthlyInflow,
                monthlyOutflow,
                netCashFlow,
                accountBreakdown,
                recentTransactions: recentTransactions.slice(0, 10),
                categoryBreakdown,
                cashFlowTrend
            });
        }
        catch (error) {
            console.error('Error loading dashboard data:', error);
        }
        finally {
            setLoading(false);
        }
    };
    if (loading) {
        return (_jsxs("div", { className: "space-y-6", children: [_jsx("div", { className: "bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-6 border border-cyan-100", children: _jsxs("div", { className: "animate-pulse", children: [_jsx("div", { className: "h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-1/3 mb-2" }), _jsx("div", { className: "h-4 bg-gray-200 rounded w-1/2" })] }) }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", children: [...Array(4)].map((_, i) => (_jsx(Card, { className: "border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300", children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "animate-pulse", children: [_jsxs("div", { className: "flex items-center gap-3 mb-4", children: [_jsx("div", { className: "w-10 h-10 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg" }), _jsx("div", { className: "h-4 bg-gray-200 rounded w-3/4" })] }), _jsx("div", { className: "h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-1/2 mb-2" }), _jsx("div", { className: "h-3 bg-gray-200 rounded w-2/3" })] }) }) }, i))) })] }));
    }
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };
    const getCashFlowColor = (amount) => {
        if (amount > 0)
            return 'text-green-600';
        if (amount < 0)
            return 'text-red-600';
        return 'text-gray-600';
    };
    const getCashFlowIcon = (amount) => {
        if (amount > 0)
            return _jsx(TrendingUp, { className: "w-4 h-4 text-green-600" });
        if (amount < 0)
            return _jsx(TrendingDown, { className: "w-4 h-4 text-red-600" });
        return _jsx(Activity, { className: "w-4 h-4 text-gray-600" });
    };
    if (loading) {
        return (_jsx("div", { className: "space-y-6", children: _jsx("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [...Array(4)].map((_, i) => (_jsx(Card, { children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "animate-pulse", children: [_jsx("div", { className: "h-4 bg-gray-200 rounded w-3/4 mb-2" }), _jsx("div", { className: "h-8 bg-gray-200 rounded w-1/2" })] }) }) }, i))) }) }));
    }
    if (!dashboardData) {
        return _jsx("div", { children: "Error loading dashboard data" });
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h2", { className: "text-2xl font-bold", children: "Banking Dashboard" }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Select, { value: selectedPeriod, onValueChange: setSelectedPeriod, children: [_jsx(SelectTrigger, { className: "w-32", children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "7", children: "Last 7 days" }), _jsx(SelectItem, { value: "30", children: "Last 30 days" }), _jsx(SelectItem, { value: "90", children: "Last 90 days" })] })] }), _jsxs(Select, { value: selectedAccount, onValueChange: setSelectedAccount, children: [_jsx(SelectTrigger, { className: "w-48", children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All Accounts" }), dashboardData.accountBreakdown.map((item) => (_jsxs(SelectItem, { value: item.account.id, children: [item.account.bankName, " - ", item.account.accountNumber] }, item.account.id)))] })] })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsx(Card, { children: _jsxs(CardContent, { className: "p-6", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(DollarSign, { className: "w-5 h-5 text-green-600" }), _jsx("span", { className: "text-sm font-medium", children: "Total Balance" })] }), _jsx("div", { className: "text-2xl font-bold text-green-600", children: formatCurrency(dashboardData.totalBalance) })] }) }), _jsx(Card, { children: _jsxs(CardContent, { className: "p-6", children: [_jsxs("div", { className: "flex items-center gap-2", children: [getCashFlowIcon(dashboardData.netCashFlow), _jsx("span", { className: "text-sm font-medium", children: "Net Cash Flow" })] }), _jsx("div", { className: `text-2xl font-bold ${getCashFlowColor(dashboardData.netCashFlow)}`, children: formatCurrency(dashboardData.netCashFlow) }), _jsxs("div", { className: "text-xs text-muted-foreground mt-1", children: ["Last ", selectedPeriod, " days"] })] }) }), _jsx(Card, { children: _jsxs(CardContent, { className: "p-6", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(BarChart3, { className: "w-5 h-5 text-blue-600" }), _jsx("span", { className: "text-sm font-medium", children: "Total Transactions" })] }), _jsx("div", { className: "text-2xl font-bold text-blue-600", children: dashboardData.totalTransactions }), _jsxs("div", { className: "text-xs text-muted-foreground mt-1", children: [dashboardData.reconciledTransactions, " reconciled"] })] }) }), _jsx(Card, { children: _jsxs(CardContent, { className: "p-6", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(AlertTriangle, { className: "w-5 h-5 text-orange-600" }), _jsx("span", { className: "text-sm font-medium", children: "Pending Items" })] }), _jsx("div", { className: "text-2xl font-bold text-orange-600", children: dashboardData.pendingTransactions + dashboardData.uncategorizedTransactions }), _jsxs("div", { className: "text-xs text-muted-foreground mt-1", children: [dashboardData.pendingTransactions, " pending, ", dashboardData.uncategorizedTransactions, " uncategorized"] })] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Building2, { className: "w-5 h-5 text-purple-600" }), "Account Overview"] }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: dashboardData.accountBreakdown.map((item) => (_jsxs("div", { className: "flex items-center justify-between p-4 bg-gray-50 rounded-lg", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center", children: _jsx(CreditCard, { className: "w-5 h-5 text-purple-600" }) }), _jsxs("div", { children: [_jsx("div", { className: "font-medium", children: item.account.bankName }), _jsxs("div", { className: "text-sm text-muted-foreground", children: [item.account.accountNumber, " \u2022 ", item.account.accountType] })] })] }), _jsxs("div", { className: "text-right", children: [_jsx("div", { className: "font-medium", children: formatCurrency(item.balance) }), _jsxs("div", { className: "text-sm text-muted-foreground", children: [item.transactionCount, " transactions"] })] }), _jsxs("div", { className: "text-right", children: [_jsx(Badge, { variant: "secondary", children: item.account.status }), _jsxs("div", { className: "text-xs text-muted-foreground mt-1", children: ["Last activity: ", new Date(item.lastActivity).toLocaleDateString()] })] })] }, item.account.id))) }) })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(TrendingUp, { className: "w-5 h-5 text-green-600" }), "Cash Flow Breakdown"] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm font-medium", children: "Money In" }), _jsx("span", { className: "text-green-600 font-bold", children: formatCurrency(dashboardData.monthlyInflow) })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm font-medium", children: "Money Out" }), _jsx("span", { className: "text-red-600 font-bold", children: formatCurrency(dashboardData.monthlyOutflow) })] }), _jsx("div", { className: "border-t pt-4", children: _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "font-medium", children: "Net Cash Flow" }), _jsx("span", { className: `font-bold ${getCashFlowColor(dashboardData.netCashFlow)}`, children: formatCurrency(dashboardData.netCashFlow) })] }) })] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(PieChart, { className: "w-5 h-5 text-blue-600" }), "Category Breakdown"] }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-2", children: Object.entries(dashboardData.categoryBreakdown)
                                        .sort(([, a], [, b]) => b - a)
                                        .slice(0, 5)
                                        .map(([category, amount]) => (_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm", children: category }), _jsx("span", { className: "font-medium", children: formatCurrency(amount) })] }, category))) }) })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Clock, { className: "w-5 h-5 text-gray-600" }), "Recent Transactions"] }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-3", children: dashboardData.recentTransactions.map((transaction) => (_jsxs("div", { className: "flex items-center justify-between p-3 border rounded-lg", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: `w-8 h-8 rounded-full flex items-center justify-center ${Number(transaction.amount) > 0 ? 'bg-green-100' : 'bg-red-100'}`, children: Number(transaction.amount) > 0 ? (_jsx(TrendingUp, { className: "w-4 h-4 text-green-600" })) : (_jsx(TrendingDown, { className: "w-4 h-4 text-red-600" })) }), _jsxs("div", { children: [_jsx("div", { className: "font-medium", children: transaction.description || 'Transaction' }), _jsxs("div", { className: "text-sm text-muted-foreground", children: [transaction.merchantName && `${transaction.merchantName} • `, new Date(transaction.transactionDate).toLocaleDateString()] })] })] }), _jsxs("div", { className: "text-right", children: [_jsxs("div", { className: `font-medium ${Number(transaction.amount) > 0 ? 'text-green-600' : 'text-red-600'}`, children: [Number(transaction.amount) > 0 ? '+' : '', formatCurrency(Number(transaction.amount))] }), _jsxs("div", { className: "flex items-center gap-2", children: [transaction.category && (_jsx(Badge, { variant: "outline", className: "text-xs", children: transaction.category })), _jsx(Badge, { variant: transaction.status === 'reconciled' ? 'default' : 'secondary', className: "text-xs", children: transaction.status })] })] })] }, transaction.id))) }) })] })] }));
}
