import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Smartphone, Monitor, Tablet, Wifi, Settings, Menu, X, Search, Bell, User, Building2 } from "lucide-react";
import { BankingDashboard } from './banking-dashboard';
import { AICategorization } from './ai-categorization';
import { MultiCurrencyConverter } from './multi-currency-converter';
import { CurrencyDashboard } from './currency-dashboard';
import { PaymentProcessorManager } from './payment-processor-manager';
import { AdvancedAnalytics } from './advanced-analytics';
import { BankConnectionManager } from './bank-connection-manager';
import { MobileMoneyManager } from './mobile-money-manager';
import { bankingApi } from '@/lib/api/banking';
import { useAuth } from '@/contexts/auth-context';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from './ui/dialog';
import { Plus } from 'lucide-react';
export function ResponsiveBankingLayout({ companyId, accountsRefreshKey, setAccountsRefreshKey, isAddTransactionOpen, setIsAddTransactionOpen, transactionForm, setTransactionForm, transactionFormErrors, setTransactionFormErrors, handleTransactionFormChange, handleCreateTransaction }) {
    console.log('ResponsiveBankingLayout received companyId:', companyId);
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const [deviceType, setDeviceType] = useState('desktop');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [batteryLevel, setBatteryLevel] = useState(85);
    const [signalStrength, setSignalStrength] = useState(4);
    const [manualViewOverride, setManualViewOverride] = useState(null);
    // Debug authentication state changes
    useEffect(() => {
        console.log('🔐 Auth state changed:', {
            isAuthenticated,
            authLoading,
            companyId,
            timestamp: new Date().toISOString()
        });
    }, [isAuthenticated, authLoading, companyId]);
    useEffect(() => {
        const checkDeviceType = () => {
            if (manualViewOverride) {
                setDeviceType(manualViewOverride);
                return;
            }
            const width = window.innerWidth;
            if (width < 768) {
                setDeviceType('mobile');
            }
            else if (width < 1024) {
                setDeviceType('tablet');
            }
            else {
                setDeviceType('desktop');
            }
        };
        checkDeviceType();
        window.addEventListener('resize', checkDeviceType);
        return () => {
            window.removeEventListener('resize', checkDeviceType);
        };
    }, [manualViewOverride]);
    const getSignalIcon = () => {
        const bars = Math.floor(signalStrength);
        return (_jsx("div", { className: "flex items-center gap-1", children: [...Array(4)].map((_, i) => (_jsx("div", { className: `w-1 h-${i < bars ? '3' : '1'} bg-green-500 rounded-sm` }, i))) }));
    };
    const getBatteryIcon = () => {
        return (_jsxs("div", { className: "flex items-center gap-1", children: [_jsx("div", { className: "w-6 h-3 border border-gray-400 rounded-sm relative", children: _jsx("div", { className: "bg-green-500 h-full rounded-sm", style: { width: `${batteryLevel}%` } }) }), _jsx("div", { className: "w-1 h-2 bg-gray-400 rounded-r-sm" })] }));
    };
    const mobileTabs = [
        { id: 'dashboard', label: 'Dashboard', icon: '📊' },
        { id: 'transactions', label: 'Transactions', icon: '💳' },
        { id: 'ai', label: 'AI', icon: '🤖' },
        { id: 'currency', label: 'Currency', icon: '💱' },
        { id: 'payments', label: 'Payments', icon: '💸' },
        { id: 'analytics', label: 'Analytics', icon: '📈' },
        { id: 'connections', label: 'Banks', icon: '🏦' },
        { id: 'mobile-money', label: 'Mobile Money', icon: '📱' }
    ];
    const renderMobileInterface = () => (_jsxs("div", { className: "min-h-screen bg-gray-50", children: [_jsxs("div", { className: "bg-black text-white text-xs px-4 py-1 flex justify-between items-center", children: [_jsx("div", { className: "flex items-center gap-2", children: _jsx("span", { className: "font-medium", children: "9:41" }) }), _jsxs("div", { className: "flex items-center gap-2", children: [getSignalIcon(), _jsx(Wifi, { className: "w-3 h-3" }), getBatteryIcon()] })] }), _jsxs("div", { className: "bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Button, { variant: "ghost", size: "sm", onClick: () => setIsMobileMenuOpen(!isMobileMenuOpen), children: isMobileMenuOpen ? _jsx(X, { className: "w-5 h-5" }) : _jsx(Menu, { className: "w-5 h-5" }) }), _jsx("h1", { className: "text-lg font-semibold", children: "Banking" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Button, { variant: "ghost", size: "sm", onClick: () => setManualViewOverride(manualViewOverride === 'desktop' ? null : 'desktop'), title: "Switch to Desktop View", children: _jsx(Monitor, { className: "w-4 h-4" }) }), _jsx(Button, { variant: "ghost", size: "sm", children: _jsx(Search, { className: "w-4 h-4" }) }), _jsx(Button, { variant: "ghost", size: "sm", children: _jsx(Bell, { className: "w-4 h-4" }) }), _jsx(Button, { variant: "ghost", size: "sm", children: _jsx(User, { className: "w-4 h-4" }) })] })] }), isMobileMenuOpen && (_jsx("div", { className: "bg-white border-b border-gray-200 p-4", children: _jsx("div", { className: "grid grid-cols-2 gap-3", children: mobileTabs.map((tab) => (_jsxs(Button, { variant: activeTab === tab.id ? 'default' : 'outline', className: "flex items-center gap-2 justify-start", onClick: () => {
                            setActiveTab(tab.id);
                            setIsMobileMenuOpen(false);
                        }, children: [_jsx("span", { className: "text-lg", children: tab.icon }), _jsx("span", { className: "text-sm", children: tab.label })] }, tab.id))) }) })), _jsxs("div", { className: "pb-20", children: [activeTab === 'dashboard' && (_jsxs("div", { className: "p-4 space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h2", { className: "text-lg font-semibold", children: "Bank Accounts" }), _jsx(Button, { onClick: () => setAccountsRefreshKey && setAccountsRefreshKey((k) => k + 1), variant: "outline", size: "sm", children: "Refresh" })] }), _jsx("div", { className: "grid grid-cols-1 gap-4", children: _jsx(AccountCards, {}) })] })), activeTab === 'transactions' && (_jsxs("div", { className: "p-4 space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h2", { className: "text-lg font-semibold", children: "Recent Transactions" }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { onClick: () => setIsAddTransactionOpen && setIsAddTransactionOpen(true), size: "sm", children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), "Add Transaction"] }), _jsx(Button, { onClick: () => setAccountsRefreshKey && setAccountsRefreshKey((k) => k + 1), variant: "outline", size: "sm", children: "Refresh" })] })] }), _jsx(TransactionsList, {})] })), activeTab === 'ai' && (_jsx("div", { className: "p-4", children: _jsx(AICategorization, { companyId: companyId }) })), activeTab === 'currency' && (_jsx("div", { className: "p-4", children: _jsx(MultiCurrencyConverter, {}) })), activeTab === 'payments' && (_jsx("div", { className: "p-4", children: _jsx(PaymentProcessorManager, { companyId: companyId }) })), activeTab === 'analytics' && (_jsx("div", { className: "p-4", children: _jsx(AdvancedAnalytics, {}) })), activeTab === 'connections' && (_jsx("div", { className: "p-4", children: _jsx(BankConnectionManager, { companyId: companyId }) })), activeTab === 'mobile-money' && (_jsx("div", { className: "p-4", children: _jsx(MobileMoneyManager, { companyId: companyId }) }))] }), _jsx("div", { className: "fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200", children: _jsx("div", { className: "flex items-center justify-around py-2", children: mobileTabs.slice(0, 5).map((tab) => (_jsxs(Button, { variant: "ghost", size: "sm", className: `flex flex-col items-center gap-1 ${activeTab === tab.id ? 'text-blue-600' : 'text-gray-600'}`, onClick: () => setActiveTab(tab.id), children: [_jsx("span", { className: "text-lg", children: tab.icon }), _jsx("span", { className: "text-xs", children: tab.label })] }, tab.id))) }) })] }));
    // Banking Components - Memoized to prevent recreation
    const AccountCards = useMemo(() => {
        const Component = () => {
            const [accounts, setAccounts] = useState(null);
            const [loading, setLoading] = useState(true);
            const [error, setError] = useState(null);
            const fetchAccounts = async () => {
                console.log('🔄 fetchAccounts called', {
                    isAuthenticated,
                    authLoading,
                    companyId,
                    timestamp: new Date().toISOString()
                });
                if (!isAuthenticated || authLoading || !companyId) {
                    console.log('❌ fetchAccounts blocked:', {
                        hasCompanyId: !!companyId,
                        isAuthenticated,
                        authLoading
                    });
                    return;
                }
                let isMounted = true;
                setLoading(true);
                try {
                    console.log('📡 Fetching accounts...');
                    const rows = await bankingApi.getBankAccounts(companyId);
                    if (!isMounted)
                        return;
                    console.log('✅ Accounts fetched:', rows.length);
                    setAccounts(rows);
                    setError(null);
                }
                catch (err) {
                    if (!isMounted)
                        return;
                    const errorMessage = err.message || String(err);
                    console.error('❌ Error fetching accounts:', errorMessage);
                    setError(errorMessage);
                }
                finally {
                    if (isMounted)
                        setLoading(false);
                }
            };
            useEffect(() => {
                fetchAccounts();
            }, [accountsRefreshKey, companyId, isAuthenticated, authLoading]);
            if (loading)
                return (_jsxs(_Fragment, { children: [_jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: "Loading accounts..." }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: "\u00A0" }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: "\u00A0" }) })] }));
            if (error)
                return _jsx(Card, { children: _jsxs(CardContent, { className: "p-4", children: ["Error: ", error?.message || error?.toString() || 'Unknown error'] }) });
            if (!accounts || accounts.length === 0)
                return (_jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: "No connected accounts" }) }));
            return (_jsx(_Fragment, { children: accounts.map((account) => (_jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center", children: _jsx(Building2, { className: "w-5 h-5 text-green-600" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-muted-foreground", children: account.bankName }), _jsx("p", { className: "text-xl font-bold", children: typeof account.balance === 'number' ? `$${account.balance.toFixed(2)}` : account.balance ?? '—' }), _jsx("p", { className: "text-xs text-muted-foreground", children: account.accountNumber })] })] }) }) }, account.id))) }));
        };
        return Component;
    }, [companyId, isAuthenticated, authLoading, accountsRefreshKey]);
    const TransactionsList = useMemo(() => {
        const Component = () => {
            const [txns, setTxns] = useState(null);
            const [loading, setLoading] = useState(true);
            const [error, setError] = useState(null);
            // Pagination state - using constants since they don't change
            const currentPage = 1;
            const pageSize = 10;
            const fetchTransactions = async () => {
                console.log('🔄 fetchTransactions called', {
                    isAuthenticated,
                    authLoading,
                    companyId,
                    timestamp: new Date().toISOString()
                });
                if (!companyId || !isAuthenticated || authLoading) {
                    console.log('❌ fetchTransactions blocked:', {
                        hasCompanyId: !!companyId,
                        isAuthenticated,
                        authLoading
                    });
                    return;
                }
                let isMounted = true;
                setLoading(true);
                try {
                    console.log('📡 Fetching transactions...');
                    const response = await bankingApi.getBankTransactions(undefined, companyId, undefined, currentPage, pageSize);
                    if (!isMounted)
                        return;
                    if (response && response.items) {
                        console.log('✅ Transactions fetched:', response.items.length);
                        setTxns(response.items);
                    }
                    else {
                        console.log('✅ No transactions found');
                        setTxns([]);
                    }
                    setError(null);
                }
                catch (err) {
                    if (!isMounted)
                        return;
                    const errorMessage = err.message || String(err);
                    console.error('❌ Error fetching transactions:', errorMessage);
                    setError(errorMessage);
                }
                finally {
                    if (isMounted)
                        setLoading(false);
                }
            };
            useEffect(() => {
                fetchTransactions();
            }, [companyId, isAuthenticated, authLoading]);
            if (loading)
                return _jsx("div", { className: "space-y-4", children: "Loading transactions..." });
            if (error)
                return _jsxs("div", { className: "space-y-4", children: ["Error loading transactions: ", error?.message || error?.toString() || 'Unknown error'] });
            if (!txns || txns.length === 0) {
                return (_jsxs("div", { className: "space-y-4", children: [_jsx("p", { children: "No transactions found" }), _jsx("div", { className: "flex gap-2 mt-2", children: _jsx(Button, { onClick: () => fetchTransactions(), children: "Retry" }) })] }));
            }
            return (_jsx("div", { className: "space-y-4", children: txns.map((transaction) => (_jsxs("div", { className: "flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: `w-10 h-10 rounded-lg flex items-center justify-center ${transaction.transactionType === 'credit' ? 'bg-green-100' : 'bg-red-100'}`, children: transaction.transactionType === 'credit' ? _jsx("span", { className: "text-green-600 font-semibold", children: "\u2191" }) : _jsx("span", { className: "text-red-600 font-semibold", children: "\u2193" }) }), _jsxs("div", { children: [_jsx("p", { className: "font-medium", children: transaction.description || 'Bank transaction' }), _jsx("p", { className: "text-sm text-muted-foreground", children: new Date(transaction.transactionDate).toLocaleDateString() })] })] }), _jsx("div", { className: "flex items-center gap-4", children: _jsxs("div", { className: "text-right", children: [_jsxs("p", { className: `font-medium ${Number(transaction.amount) >= 0 ? 'text-green-600' : 'text-red-600'}`, children: ["$", Number(transaction.amount).toFixed(2)] }), _jsx("p", { className: "text-sm text-muted-foreground", children: transaction.status || 'unreconciled' })] }) })] }, transaction.id))) }));
        };
        return Component;
    }, [companyId, isAuthenticated, authLoading]);
    const renderTabletInterface = () => (_jsxs("div", { className: "min-h-screen bg-gray-50", children: [_jsx("div", { className: "bg-white border-b border-gray-200 px-6 py-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Tablet, { className: "w-6 h-6 text-blue-600" }), _jsx("h1", { className: "text-xl font-semibold", children: "Banking Dashboard" }), _jsx(Badge, { variant: "secondary", children: "Tablet View" })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Button, { variant: deviceType === 'mobile' ? 'default' : 'outline', size: "sm", onClick: () => setManualViewOverride(manualViewOverride === 'mobile' ? null : 'mobile'), children: _jsx(Smartphone, { className: "w-3 h-3" }) }), _jsx(Button, { variant: deviceType === 'tablet' ? 'default' : 'outline', size: "sm", onClick: () => setManualViewOverride(manualViewOverride === 'tablet' ? null : 'tablet'), children: _jsx(Tablet, { className: "w-3 h-3" }) }), _jsx(Button, { variant: deviceType === 'desktop' ? 'default' : 'outline', size: "sm", onClick: () => setManualViewOverride(manualViewOverride === 'desktop' ? null : 'desktop'), children: _jsx(Monitor, { className: "w-3 h-3" }) })] }), _jsxs(Button, { variant: "outline", size: "sm", children: [_jsx(Settings, { className: "w-4 h-4 mr-2" }), "Settings"] }), _jsxs(Button, { variant: "outline", size: "sm", children: [_jsx(User, { className: "w-4 h-4 mr-2" }), "Profile"] })] })] }) }), _jsx("div", { className: "p-6", children: _jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, children: [_jsxs(TabsList, { className: "grid w-full grid-cols-5 mb-6", children: [_jsx(TabsTrigger, { value: "dashboard", children: "Dashboard" }), _jsx(TabsTrigger, { value: "ai", children: "AI Features" }), _jsx(TabsTrigger, { value: "analytics", children: "Analytics" }), _jsx(TabsTrigger, { value: "connections", children: "Connections" }), _jsx(TabsTrigger, { value: "mobile-money", children: "Mobile Money" })] }), _jsx(TabsContent, { value: "dashboard", className: "space-y-6", children: _jsx(BankingDashboard, { companyId: companyId }) }), _jsx(TabsContent, { value: "ai", className: "space-y-6", children: _jsx(AICategorization, { companyId: companyId }) }), _jsx(TabsContent, { value: "analytics", className: "space-y-6", children: _jsx(AdvancedAnalytics, {}) }), _jsx(TabsContent, { value: "connections", className: "space-y-6", children: _jsx(BankConnectionManager, { companyId: companyId }) }), _jsx(TabsContent, { value: "mobile-money", className: "space-y-6", children: _jsx(MobileMoneyManager, { companyId: companyId }) })] }) })] }));
    const renderDesktopInterface = () => (_jsxs("div", { className: "min-h-screen bg-gray-50", children: [_jsx("div", { className: "bg-white border-b border-gray-200 px-8 py-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx(Monitor, { className: "w-6 h-6 text-blue-600" }), _jsx("h1", { className: "text-2xl font-semibold", children: "Banking Management" }), _jsx(Badge, { variant: "secondary", children: "Desktop View" })] }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsxs(Button, { variant: deviceType === 'mobile' ? 'default' : 'outline', size: "sm", onClick: () => setManualViewOverride(manualViewOverride === 'mobile' ? null : 'mobile'), children: [_jsx(Smartphone, { className: "w-4 h-4 mr-1" }), "Mobile"] }), _jsxs(Button, { variant: deviceType === 'tablet' ? 'default' : 'outline', size: "sm", onClick: () => setManualViewOverride(manualViewOverride === 'tablet' ? null : 'tablet'), children: [_jsx(Tablet, { className: "w-4 h-4 mr-1" }), "Tablet"] }), _jsxs(Button, { variant: deviceType === 'desktop' ? 'default' : 'outline', size: "sm", onClick: () => setManualViewOverride(manualViewOverride === 'desktop' ? null : 'desktop'), children: [_jsx(Monitor, { className: "w-4 h-4 mr-1" }), "Desktop"] })] }), _jsxs(Button, { variant: "outline", children: [_jsx(Settings, { className: "w-4 h-4 mr-2" }), "Settings"] }), _jsxs(Button, { variant: "outline", children: [_jsx(User, { className: "w-4 h-4 mr-2" }), "Profile"] })] })] }) }), _jsx("div", { className: "p-8", children: _jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, children: [_jsxs(TabsList, { className: "flex w-full mb-8 overflow-x-auto gap-1", children: [_jsx(TabsTrigger, { value: "dashboard", className: "whitespace-nowrap", children: "Dashboard" }), _jsx(TabsTrigger, { value: "transactions", className: "whitespace-nowrap", children: "Transactions" }), _jsx(TabsTrigger, { value: "ai", className: "whitespace-nowrap", children: "AI Categorization" }), _jsx(TabsTrigger, { value: "currency", className: "whitespace-nowrap", children: "Multi-Currency" }), _jsx(TabsTrigger, { value: "payments", className: "whitespace-nowrap", children: "Payment Processors" }), _jsx(TabsTrigger, { value: "analytics", className: "whitespace-nowrap", children: "Advanced Analytics" }), _jsx(TabsTrigger, { value: "connections", className: "whitespace-nowrap", children: "Bank Connections" }), _jsx(TabsTrigger, { value: "mobile-money", className: "whitespace-nowrap", children: "Mobile Money" })] }), _jsx(TabsContent, { value: "dashboard", className: "space-y-6", children: _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h2", { className: "text-xl font-semibold", children: "Bank Accounts" }), _jsx(Button, { onClick: () => setAccountsRefreshKey && setAccountsRefreshKey((k) => k + 1), variant: "outline", children: "Refresh" })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: _jsx(AccountCards, {}) }), _jsx(BankingDashboard, { companyId: companyId })] }) }), _jsxs(TabsContent, { value: "transactions", className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h2", { className: "text-xl font-semibold", children: "Recent Transactions" }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { onClick: () => setIsAddTransactionOpen && setIsAddTransactionOpen(true), children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), "Add Transaction"] }), _jsx(Button, { onClick: () => setAccountsRefreshKey && setAccountsRefreshKey((k) => k + 1), variant: "outline", children: "Refresh" })] })] }), _jsx(TransactionsList, {})] }), _jsx(TabsContent, { value: "ai", className: "space-y-6", children: _jsx(AICategorization, { companyId: companyId }) }), _jsx(TabsContent, { value: "currency", className: "space-y-6", children: _jsx(CurrencyDashboard, {}) }), _jsx(TabsContent, { value: "payments", className: "space-y-6", children: _jsx(PaymentProcessorManager, { companyId: companyId }) }), _jsx(TabsContent, { value: "analytics", className: "space-y-6", children: _jsx(AdvancedAnalytics, {}) }), _jsx(TabsContent, { value: "connections", className: "space-y-6", children: _jsx(BankConnectionManager, { companyId: companyId }) }), _jsx(TabsContent, { value: "mobile-money", className: "space-y-6", children: _jsx(MobileMoneyManager, { companyId: companyId }) })] }) })] }));
    // BankAccountSelect component for transaction dialog
    // BankAccountSelect component - moved outside useMemo to avoid hook issues
    const BankAccountSelect = () => {
        const [accounts, setAccounts] = useState([]);
        const [loading, setLoading] = useState(true);
        const fetchAccounts = async () => {
            if (!isAuthenticated || authLoading || !companyId)
                return;
            try {
                const response = await bankingApi.getBankAccounts(companyId);
                setAccounts(response);
            }
            catch (error) {
                console.error('Error fetching bank accounts:', error);
            }
            finally {
                setLoading(false);
            }
        };
        useEffect(() => {
            fetchAccounts();
        }, [companyId, isAuthenticated, authLoading]);
        if (loading) {
            return _jsx(SelectItem, { value: "loading", disabled: true, children: "Loading accounts..." });
        }
        if (accounts.length === 0) {
            return _jsx(SelectItem, { value: "no-accounts", disabled: true, children: "No bank accounts found" });
        }
        return (_jsx(_Fragment, { children: accounts.map((account) => (_jsxs(SelectItem, { value: account.id, children: [account.bankName, " - ", account.accountNumber, " (", account.accountType, ")"] }, account.id))) }));
    };
    // Transaction Dialog Component
    const TransactionDialog = () => (_jsx(Dialog, { open: isAddTransactionOpen || false, onOpenChange: setIsAddTransactionOpen, children: _jsxs(DialogContent, { className: "max-w-md", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Add Bank Transaction" }), _jsx(DialogDescription, { children: "Create a new bank transaction manually." })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "bankAccount", children: "Bank Account" }), _jsxs(Select, { value: transactionForm?.bankAccountId || '', onValueChange: (value) => handleTransactionFormChange?.('bankAccountId', value), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select bank account..." }) }), _jsx(SelectContent, { children: _jsx(BankAccountSelect, {}) })] }), transactionFormErrors?.bankAccountId && (_jsx("p", { className: "text-sm text-destructive mt-1", children: transactionFormErrors.bankAccountId }))] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "description", children: "Description" }), _jsx(Input, { id: "description", value: transactionForm?.description || '', onChange: (e) => handleTransactionFormChange?.('description', e.target.value), placeholder: "Transaction description" }), transactionFormErrors?.description && (_jsx("p", { className: "text-sm text-destructive mt-1", children: transactionFormErrors.description }))] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "amount", children: "Amount" }), _jsx(Input, { id: "amount", type: "number", step: "0.01", value: transactionForm?.amount || '', onChange: (e) => handleTransactionFormChange?.('amount', e.target.value), placeholder: "0.00" }), transactionFormErrors?.amount && (_jsx("p", { className: "text-sm text-destructive mt-1", children: transactionFormErrors.amount }))] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "transactionType", children: "Type" }), _jsxs(Select, { value: transactionForm?.transactionType || 'debit', onValueChange: (value) => handleTransactionFormChange?.('transactionType', value), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "credit", children: "Credit (Money In)" }), _jsx(SelectItem, { value: "debit", children: "Debit (Money Out)" })] })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "transactionDate", children: "Date" }), _jsx(Input, { id: "transactionDate", type: "date", value: transactionForm?.transactionDate || '', onChange: (e) => handleTransactionFormChange?.('transactionDate', e.target.value) }), transactionFormErrors?.transactionDate && (_jsx("p", { className: "text-sm text-destructive mt-1", children: transactionFormErrors.transactionDate }))] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "merchantName", children: "Merchant (Optional)" }), _jsx(Input, { id: "merchantName", value: transactionForm?.merchantName || '', onChange: (e) => handleTransactionFormChange?.('merchantName', e.target.value), placeholder: "Merchant name" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "category", children: "Category (Optional)" }), _jsx(Input, { id: "category", value: transactionForm?.category || '', onChange: (e) => handleTransactionFormChange?.('category', e.target.value), placeholder: "Transaction category" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "reference", children: "Reference (Optional)" }), _jsx(Input, { id: "reference", value: transactionForm?.reference || '', onChange: (e) => handleTransactionFormChange?.('reference', e.target.value), placeholder: "Reference number" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "memo", children: "Memo (Optional)" }), _jsx(Input, { id: "memo", value: transactionForm?.memo || '', onChange: (e) => handleTransactionFormChange?.('memo', e.target.value), placeholder: "Additional notes" })] }), transactionFormErrors?.submit && (_jsx("p", { className: "text-sm text-destructive", children: transactionFormErrors.submit }))] }), _jsxs(DialogFooter, { children: [_jsx(Button, { variant: "outline", onClick: () => setIsAddTransactionOpen?.(false), children: "Cancel" }), _jsx(Button, { onClick: handleCreateTransaction, children: "Create Transaction" })] })] }) }));
    // Device-specific rendering
    switch (deviceType) {
        case 'mobile':
            return (_jsxs(_Fragment, { children: [renderMobileInterface(), _jsx(TransactionDialog, {})] }));
        case 'tablet':
            return (_jsxs(_Fragment, { children: [renderTabletInterface(), _jsx(TransactionDialog, {})] }));
        case 'desktop':
            return (_jsxs(_Fragment, { children: [renderDesktopInterface(), _jsx(TransactionDialog, {})] }));
        default:
            return (_jsxs(_Fragment, { children: [renderDesktopInterface(), _jsx(TransactionDialog, {})] }));
    }
}
