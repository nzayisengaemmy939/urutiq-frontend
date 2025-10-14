import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Smartphone, CreditCard, TrendingUp, TrendingDown, DollarSign, BarChart3, PieChart, Calendar, RefreshCw, Plus, Search, Filter, Eye, EyeOff, QrCode, Wifi } from "lucide-react";
import { bankingApiV2 as bankingApi } from '@/lib/api/banking-v2';
export function MobileBankingInterface() {
    const [stats, setStats] = useState(null);
    const [recentTransactions, setRecentTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [balanceVisible, setBalanceVisible] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        // Detect mobile device
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        loadMobileData();
        return () => window.removeEventListener('resize', checkMobile);
    }, []);
    const loadMobileData = async () => {
        setLoading(true);
        try {
            // Load dashboard stats
            const dashboardResponse = await bankingApi.get('/api/bank-transactions?limit=50');
            const transactions = dashboardResponse.items || [];
            // Calculate mobile stats
            const totalBalance = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
            const monthlyInflow = transactions
                .filter((t) => Number(t.amount) > 0)
                .reduce((sum, t) => sum + Number(t.amount), 0);
            const monthlyOutflow = Math.abs(transactions
                .filter((t) => Number(t.amount) < 0)
                .reduce((sum, t) => sum + Number(t.amount), 0));
            setStats({
                totalBalance,
                monthlyInflow,
                monthlyOutflow,
                netCashFlow: monthlyInflow - monthlyOutflow,
                activeAccounts: 3, // Mock data
                pendingTransactions: transactions.filter((t) => t.status === 'pending').length,
                lastSyncAt: new Date().toISOString()
            });
            // Load recent transactions
            setRecentTransactions(transactions.slice(0, 10).map((t) => ({
                id: t.id,
                amount: Number(t.amount),
                description: t.description || 'Transaction',
                date: t.transactionDate,
                type: Number(t.amount) > 0 ? 'credit' : 'debit',
                category: t.category,
                status: t.status === 'reconciled' ? 'completed' : 'pending'
            })));
        }
        catch (error) {
            console.error('Error loading mobile banking data:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const quickActions = [
        {
            id: 'transfer',
            title: 'Transfer',
            icon: _jsx(TrendingUp, { className: "w-6 h-6" }),
            color: 'bg-blue-500',
            action: () => console.log('Transfer money')
        },
        {
            id: 'pay',
            title: 'Pay Bills',
            icon: _jsx(CreditCard, { className: "w-6 h-6" }),
            color: 'bg-green-500',
            action: () => console.log('Pay bills')
        },
        {
            id: 'deposit',
            title: 'Deposit',
            icon: _jsx(Plus, { className: "w-6 h-6" }),
            color: 'bg-purple-500',
            action: () => console.log('Make deposit')
        },
        {
            id: 'scan',
            title: 'Scan QR',
            icon: _jsx(QrCode, { className: "w-6 h-6" }),
            color: 'bg-orange-500',
            action: () => console.log('Scan QR code')
        }
    ];
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };
    const getTransactionIcon = (type, category) => {
        if (type === 'credit') {
            return _jsx(TrendingUp, { className: "w-5 h-5 text-green-600" });
        }
        else {
            switch (category?.toLowerCase()) {
                case 'food': return _jsx(DollarSign, { className: "w-5 h-5 text-red-600" });
                case 'transport': return _jsx(TrendingDown, { className: "w-5 h-5 text-blue-600" });
                case 'shopping': return _jsx(CreditCard, { className: "w-5 h-5 text-purple-600" });
                default: return _jsx(TrendingDown, { className: "w-5 h-5 text-red-600" });
            }
        }
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'text-green-600 bg-green-100';
            case 'pending': return 'text-yellow-600 bg-yellow-100';
            case 'failed': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };
    if (loading) {
        return (_jsx("div", { className: "space-y-4 p-4", children: _jsxs("div", { className: "animate-pulse", children: [_jsx("div", { className: "h-32 bg-gray-200 rounded-lg mb-4" }), _jsxs("div", { className: "grid grid-cols-2 gap-4 mb-4", children: [_jsx("div", { className: "h-20 bg-gray-200 rounded-lg" }), _jsx("div", { className: "h-20 bg-gray-200 rounded-lg" })] }), _jsx("div", { className: "space-y-3", children: [...Array(5)].map((_, i) => (_jsx("div", { className: "h-16 bg-gray-200 rounded-lg" }, i))) })] }) }));
    }
    return (_jsxs("div", { className: "space-y-4 p-4 max-w-md mx-auto", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Smartphone, { className: "w-6 h-6 text-blue-600" }), _jsx("h1", { className: "text-xl font-bold", children: "Banking" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Button, { size: "sm", variant: "outline", onClick: () => setBalanceVisible(!balanceVisible), children: balanceVisible ? _jsx(Eye, { className: "w-4 h-4" }) : _jsx(EyeOff, { className: "w-4 h-4" }) }), _jsx(Button, { size: "sm", variant: "outline", onClick: loadMobileData, children: _jsx(RefreshCw, { className: "w-4 h-4" }) })] })] }), _jsx(Card, { className: "bg-gradient-to-r from-blue-600 to-purple-600 text-white", children: _jsxs(CardContent, { className: "p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-blue-100 text-sm", children: "Total Balance" }), _jsx("p", { className: "text-3xl font-bold", children: balanceVisible ? formatCurrency(stats?.totalBalance || 0) : '••••••' })] }), _jsxs("div", { className: "text-right", children: [_jsxs("div", { className: "flex items-center gap-1 text-blue-100 text-sm", children: [_jsx(Wifi, { className: "w-4 h-4" }), _jsx("span", { children: "Live" })] }), _jsxs("p", { className: "text-xs text-blue-200", children: ["Last sync: ", new Date(stats?.lastSyncAt || '').toLocaleTimeString()] })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4 mt-4", children: [_jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-blue-100 text-xs", children: "Money In" }), _jsx("p", { className: "text-lg font-semibold", children: balanceVisible ? formatCurrency(stats?.monthlyInflow || 0) : '••••' })] }), _jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-blue-100 text-xs", children: "Money Out" }), _jsx("p", { className: "text-lg font-semibold", children: balanceVisible ? formatCurrency(stats?.monthlyOutflow || 0) : '••••' })] })] })] }) }), _jsx("div", { className: "grid grid-cols-4 gap-3", children: quickActions.map((action) => (_jsxs(Button, { variant: "outline", className: "flex flex-col items-center gap-2 h-20 p-2", onClick: action.action, children: [_jsx("div", { className: `w-8 h-8 rounded-full ${action.color} flex items-center justify-center text-white`, children: action.icon }), _jsx("span", { className: "text-xs font-medium", children: action.title })] }, action.id))) }), _jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, children: [_jsxs(TabsList, { className: "grid w-full grid-cols-3", children: [_jsx(TabsTrigger, { value: "overview", children: "Overview" }), _jsx(TabsTrigger, { value: "transactions", children: "Transactions" }), _jsx(TabsTrigger, { value: "insights", children: "Insights" })] }), _jsxs(TabsContent, { value: "overview", className: "space-y-4", children: [_jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-3", children: _jsx(CardTitle, { className: "text-lg", children: "Account Summary" }) }), _jsxs(CardContent, { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center", children: _jsx(CreditCard, { className: "w-5 h-5 text-blue-600" }) }), _jsxs("div", { children: [_jsx("p", { className: "font-medium", children: "Business Checking" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "****1234" })] })] }), _jsxs("div", { className: "text-right", children: [_jsx("p", { className: "font-semibold", children: balanceVisible ? formatCurrency(15420.50) : '••••••' }), _jsx(Badge, { variant: "secondary", className: "text-xs", children: "Active" })] })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center", children: _jsx(TrendingUp, { className: "w-5 h-5 text-green-600" }) }), _jsxs("div", { children: [_jsx("p", { className: "font-medium", children: "Business Savings" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "****5678" })] })] }), _jsxs("div", { className: "text-right", children: [_jsx("p", { className: "font-semibold", children: balanceVisible ? formatCurrency(8750.25) : '••••••' }), _jsx(Badge, { variant: "secondary", className: "text-xs", children: "Active" })] })] })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-3", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx(CardTitle, { className: "text-lg", children: "Recent Activity" }), _jsxs(Button, { size: "sm", variant: "outline", children: [_jsx(Calendar, { className: "w-4 h-4 mr-1" }), "Filter"] })] }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-3", children: recentTransactions.slice(0, 5).map((transaction) => (_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [getTransactionIcon(transaction.type, transaction.category), _jsxs("div", { children: [_jsx("p", { className: "font-medium text-sm", children: transaction.description }), _jsx("p", { className: "text-xs text-muted-foreground", children: new Date(transaction.date).toLocaleDateString() })] })] }), _jsxs("div", { className: "text-right", children: [_jsxs("p", { className: `font-semibold text-sm ${transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}`, children: [transaction.type === 'credit' ? '+' : '', formatCurrency(transaction.amount)] }), _jsx(Badge, { className: `text-xs ${getStatusColor(transaction.status)}`, children: transaction.status })] })] }, transaction.id))) }) })] })] }), _jsxs(TabsContent, { value: "transactions", className: "space-y-4", children: [_jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Search, { className: "w-4 h-4 text-muted-foreground" }), _jsx("input", { type: "text", placeholder: "Search transactions...", className: "flex-1 bg-transparent outline-none text-sm" }), _jsx(Button, { size: "sm", variant: "outline", children: _jsx(Filter, { className: "w-4 h-4" }) })] }) }) }), _jsx("div", { className: "space-y-3", children: recentTransactions.map((transaction) => (_jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [getTransactionIcon(transaction.type, transaction.category), _jsxs("div", { children: [_jsx("p", { className: "font-medium", children: transaction.description }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("p", { className: "text-sm text-muted-foreground", children: new Date(transaction.date).toLocaleDateString() }), transaction.category && (_jsx(Badge, { variant: "outline", className: "text-xs", children: transaction.category }))] })] })] }), _jsxs("div", { className: "text-right", children: [_jsxs("p", { className: `font-semibold ${transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}`, children: [transaction.type === 'credit' ? '+' : '', formatCurrency(transaction.amount)] }), _jsx(Badge, { className: `text-xs ${getStatusColor(transaction.status)}`, children: transaction.status })] })] }) }) }, transaction.id))) })] }), _jsxs(TabsContent, { value: "insights", className: "space-y-4", children: [_jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-3", children: _jsx(CardTitle, { className: "text-lg", children: "Spending Insights" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-8 h-8 bg-red-100 rounded-full flex items-center justify-center", children: _jsx(TrendingDown, { className: "w-4 h-4 text-red-600" }) }), _jsxs("div", { children: [_jsx("p", { className: "font-medium", children: "Food & Dining" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "This month" })] })] }), _jsxs("div", { className: "text-right", children: [_jsx("p", { className: "font-semibold text-red-600", children: "$450.00" }), _jsx("p", { className: "text-xs text-muted-foreground", children: "+12% vs last month" })] })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center", children: _jsx(CreditCard, { className: "w-4 h-4 text-blue-600" }) }), _jsxs("div", { children: [_jsx("p", { className: "font-medium", children: "Shopping" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "This month" })] })] }), _jsxs("div", { className: "text-right", children: [_jsx("p", { className: "font-semibold text-blue-600", children: "$320.00" }), _jsx("p", { className: "text-xs text-muted-foreground", children: "-5% vs last month" })] })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-8 h-8 bg-green-100 rounded-full flex items-center justify-center", children: _jsx(TrendingUp, { className: "w-4 h-4 text-green-600" }) }), _jsxs("div", { children: [_jsx("p", { className: "font-medium", children: "Income" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "This month" })] })] }), _jsxs("div", { className: "text-right", children: [_jsx("p", { className: "font-semibold text-green-600", children: "$5,200.00" }), _jsx("p", { className: "text-xs text-muted-foreground", children: "+8% vs last month" })] })] })] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-3", children: _jsx(CardTitle, { className: "text-lg", children: "Budget Progress" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex justify-between text-sm mb-1", children: [_jsx("span", { children: "Food & Dining" }), _jsx("span", { children: "$450 / $600" })] }), _jsx("div", { className: "w-full bg-gray-200 rounded-full h-2", children: _jsx("div", { className: "bg-red-500 h-2 rounded-full", style: { width: '75%' } }) })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex justify-between text-sm mb-1", children: [_jsx("span", { children: "Shopping" }), _jsx("span", { children: "$320 / $500" })] }), _jsx("div", { className: "w-full bg-gray-200 rounded-full h-2", children: _jsx("div", { className: "bg-blue-500 h-2 rounded-full", style: { width: '64%' } }) })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex justify-between text-sm mb-1", children: [_jsx("span", { children: "Transportation" }), _jsx("span", { children: "$180 / $300" })] }), _jsx("div", { className: "w-full bg-gray-200 rounded-full h-2", children: _jsx("div", { className: "bg-green-500 h-2 rounded-full", style: { width: '60%' } }) })] })] }) })] })] })] }), _jsx("div", { className: "fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 max-w-md mx-auto", children: _jsxs("div", { className: "flex items-center justify-around", children: [_jsxs(Button, { variant: "ghost", size: "sm", className: "flex flex-col items-center gap-1", children: [_jsx(BarChart3, { className: "w-5 h-5" }), _jsx("span", { className: "text-xs", children: "Overview" })] }), _jsxs(Button, { variant: "ghost", size: "sm", className: "flex flex-col items-center gap-1", children: [_jsx(CreditCard, { className: "w-5 h-5" }), _jsx("span", { className: "text-xs", children: "Cards" })] }), _jsxs(Button, { variant: "ghost", size: "sm", className: "flex flex-col items-center gap-1", children: [_jsx(TrendingUp, { className: "w-5 h-5" }), _jsx("span", { className: "text-xs", children: "Transfer" })] }), _jsxs(Button, { variant: "ghost", size: "sm", className: "flex flex-col items-center gap-1", children: [_jsx(PieChart, { className: "w-5 h-5" }), _jsx("span", { className: "text-xs", children: "Insights" })] })] }) })] }));
}
