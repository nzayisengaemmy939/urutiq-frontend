import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Smartphone, Plus, Send, ArrowUpDown, TrendingUp, TrendingDown, DollarSign, Globe, CreditCard, CheckCircle, AlertCircle, Clock, RefreshCw, Eye, EyeOff } from "lucide-react";
import { bankingApiV2 as bankingApi } from '@/lib/api/banking-v2';
export function MobileMoneyManager({ companyId }) {
    const [providers, setProviders] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedCountry, setSelectedCountry] = useState('all');
    const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
    const [isSendMoneyOpen, setIsSendMoneyOpen] = useState(false);
    const [balanceVisible, setBalanceVisible] = useState(true);
    // Form states
    const [accountForm, setAccountForm] = useState({
        provider: '',
        accountNumber: '',
        accountName: '',
        phoneNumber: '',
        currency: ''
    });
    const [paymentForm, setPaymentForm] = useState({
        provider: '',
        amount: '',
        currency: '',
        phoneNumber: '',
        recipientPhoneNumber: '',
        recipientName: '',
        description: ''
    });
    const countries = [
        'Kenya', 'Tanzania', 'Rwanda', 'Ghana', 'Nigeria', 'Uganda', 'Senegal',
        'Côte d\'Ivoire', 'Togo', 'Benin', 'Cameroon', 'Zimbabwe', 'Zambia', 'Global'
    ];
    useEffect(() => {
        loadData();
    }, [selectedCountry]);
    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            // Load providers
            const providersResponse = await bankingApi.get(`/api/mobile-money/providers${selectedCountry && selectedCountry !== 'all' ? `?country=${selectedCountry}` : ''}`);
            setProviders(providersResponse.providers || []);
            // Load accounts
            const accountsUrl = companyId ? `/api/mobile-money/accounts?companyId=${companyId}` : '/api/mobile-money/accounts';
            const accountsResponse = await bankingApi.get(accountsUrl);
            setAccounts(accountsResponse.accounts || []);
            // Load transactions
            const transactionsUrl = companyId ? `/api/mobile-money/transactions?companyId=${companyId}` : '/api/mobile-money/transactions';
            const transactionsResponse = await bankingApi.get(transactionsUrl);
            setTransactions(transactionsResponse.transactions || []);
            // Load stats
            const statsUrl = companyId ? `/api/mobile-money/stats?companyId=${companyId}` : '/api/mobile-money/stats';
            const statsResponse = await bankingApi.get(statsUrl);
            setStats(statsResponse);
        }
        catch (error) {
            console.error('Error loading mobile money data:', error);
        }
        finally {
            setLoading(false);
        }
    }, [selectedCountry, companyId]);
    const createAccount = async () => {
        if (!accountForm.provider || !accountForm.accountNumber || !accountForm.accountName || !accountForm.phoneNumber) {
            alert('Please fill in all required fields');
            return;
        }
        try {
            const accountsUrl = companyId ? `/api/mobile-money/accounts?companyId=${companyId}` : '/api/mobile-money/accounts';
            const response = await bankingApi.post(accountsUrl, accountForm);
            alert('Mobile money account created successfully!');
            setAccountForm({
                provider: '',
                accountNumber: '',
                accountName: '',
                phoneNumber: '',
                currency: ''
            });
            setIsAddAccountOpen(false);
            loadData();
        }
        catch (error) {
            console.error('Error creating account:', error);
            alert('Failed to create mobile money account');
        }
    };
    const sendMoney = async () => {
        if (!paymentForm.provider || !paymentForm.amount || !paymentForm.phoneNumber || !paymentForm.recipientPhoneNumber) {
            alert('Please fill in all required fields');
            return;
        }
        try {
            // Get the currency from the selected provider
            const selectedProvider = providers.find(p => p.id === paymentForm.provider);
            if (!selectedProvider) {
                alert('Please select a valid provider');
                return;
            }
            if (!selectedProvider.currency) {
                alert('Selected provider does not have a valid currency');
                return;
            }
            const paymentData = {
                ...paymentForm,
                currency: selectedProvider.currency // Use provider's currency instead of empty string
            };
            console.log('Sending payment data:', paymentData);
            const paymentsUrl = companyId ? `/api/mobile-money/payments?companyId=${companyId}` : '/api/mobile-money/payments';
            const response = await bankingApi.post(paymentsUrl, paymentData);
            if (response.success) {
                alert('Payment initiated successfully!');
                setPaymentForm({
                    provider: '',
                    amount: '',
                    currency: '',
                    phoneNumber: '',
                    recipientPhoneNumber: '',
                    recipientName: '',
                    description: ''
                });
                setIsSendMoneyOpen(false);
                loadData();
            }
            else {
                alert(response.message || 'Failed to initiate payment');
            }
        }
        catch (error) {
            console.error('Error sending money:', error);
            alert('Failed to send money');
        }
    };
    const formatCurrency = (amount, currency) => {
        // Handle null, undefined, or invalid amounts
        if (amount === null || amount === undefined || isNaN(amount)) {
            return '$0.00';
        }
        // Handle empty or invalid currency codes
        if (!currency || currency.trim() === '' || currency === 'undefined' || currency === 'null') {
            return `$${amount.toFixed(2)}`; // Default to USD format
        }
        try {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: currency
            }).format(amount);
        }
        catch (error) {
            console.warn('Invalid currency code:', currency, 'Defaulting to USD format');
            return `$${amount.toFixed(2)}`; // Fallback to USD format
        }
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'text-green-600 bg-green-100';
            case 'completed': return 'text-green-600 bg-green-100';
            case 'pending': return 'text-yellow-600 bg-yellow-100';
            case 'failed': return 'text-red-600 bg-red-100';
            case 'cancelled': return 'text-gray-600 bg-gray-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };
    const getStatusIcon = (status) => {
        switch (status) {
            case 'active': return _jsx(CheckCircle, { className: "w-4 h-4 text-green-600" });
            case 'completed': return _jsx(CheckCircle, { className: "w-4 h-4 text-green-600" });
            case 'pending': return _jsx(Clock, { className: "w-4 h-4 text-yellow-600" });
            case 'failed': return _jsx(AlertCircle, { className: "w-4 h-4 text-red-600" });
            case 'cancelled': return _jsx(AlertCircle, { className: "w-4 h-4 text-gray-600" });
            default: return _jsx(Clock, { className: "w-4 h-4 text-gray-600" });
        }
    };
    const getTransactionIcon = (type) => {
        switch (type) {
            case 'deposit': return _jsx(TrendingUp, { className: "w-5 h-5 text-green-600" });
            case 'withdrawal': return _jsx(TrendingDown, { className: "w-5 h-5 text-red-600" });
            case 'transfer': return _jsx(ArrowUpDown, { className: "w-5 h-5 text-blue-600" });
            case 'payment': return _jsx(Send, { className: "w-5 h-5 text-purple-600" });
            case 'reversal': return _jsx(RefreshCw, { className: "w-5 h-5 text-orange-600" });
            default: return _jsx(CreditCard, { className: "w-5 h-5 text-gray-600" });
        }
    };
    if (loading) {
        return (_jsx("div", { className: "space-y-6", children: _jsx("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [...Array(4)].map((_, i) => (_jsx(Card, { children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "animate-pulse", children: [_jsx("div", { className: "h-4 bg-gray-200 rounded w-3/4 mb-2" }), _jsx("div", { className: "h-8 bg-gray-200 rounded w-1/2" })] }) }) }, i))) }) }));
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Smartphone, { className: "w-8 h-8 text-green-600" }), _jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold", children: "Mobile Money" }), _jsx("p", { className: "text-muted-foreground", children: "Manage mobile money accounts and payments" })] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { variant: "outline", onClick: () => setBalanceVisible(!balanceVisible), children: balanceVisible ? _jsx(Eye, { className: "w-4 h-4" }) : _jsx(EyeOff, { className: "w-4 h-4" }) }), _jsxs(Button, { variant: "outline", onClick: loadData, children: [_jsx(RefreshCw, { className: "w-4 h-4 mr-2" }), "Refresh"] }), _jsxs(Dialog, { open: isSendMoneyOpen, onOpenChange: setIsSendMoneyOpen, children: [_jsx(DialogTrigger, { asChild: true, children: _jsxs(Button, { children: [_jsx(Send, { className: "w-4 h-4 mr-2" }), "Send Money"] }) }), _jsxs(DialogContent, { className: "max-w-2xl", children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { children: "Send Mobile Money" }) }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Provider" }), _jsxs(Select, { value: paymentForm.provider, onValueChange: (value) => {
                                                                            const selectedProvider = providers.find(p => p.id === value);
                                                                            setPaymentForm(prev => ({
                                                                                ...prev,
                                                                                provider: value,
                                                                                currency: selectedProvider?.currency || ''
                                                                            }));
                                                                        }, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select provider" }) }), _jsx(SelectContent, { children: providers.map((provider) => (_jsxs(SelectItem, { value: provider.id || `provider-${Math.random()}`, children: [provider.name, " (", provider.country, ")"] }, provider.id))) })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Amount" }), _jsxs("div", { className: "relative", children: [_jsx(Input, { type: "number", value: paymentForm.amount, onChange: (e) => setPaymentForm(prev => ({ ...prev, amount: e.target.value })), placeholder: "0.00", className: "pr-16" }), _jsx("div", { className: "absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground", children: paymentForm.provider ? providers.find(p => p.id === paymentForm.provider)?.currency || 'USD' : 'USD' })] })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Your Phone Number" }), _jsx(Input, { value: paymentForm.phoneNumber, onChange: (e) => setPaymentForm(prev => ({ ...prev, phoneNumber: e.target.value })), placeholder: "+254700000000" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Recipient Phone Number" }), _jsx(Input, { value: paymentForm.recipientPhoneNumber, onChange: (e) => setPaymentForm(prev => ({ ...prev, recipientPhoneNumber: e.target.value })), placeholder: "+254700000000" })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Recipient Name (Optional)" }), _jsx(Input, { value: paymentForm.recipientName, onChange: (e) => setPaymentForm(prev => ({ ...prev, recipientName: e.target.value })), placeholder: "John Doe" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Description" }), _jsx(Input, { value: paymentForm.description, onChange: (e) => setPaymentForm(prev => ({ ...prev, description: e.target.value })), placeholder: "Payment description" })] }), _jsxs(Button, { onClick: sendMoney, className: "w-full", children: [_jsx(Send, { className: "w-4 h-4 mr-2" }), "Send Money"] })] })] })] }), _jsxs(Dialog, { open: isAddAccountOpen, onOpenChange: setIsAddAccountOpen, children: [_jsx(DialogTrigger, { asChild: true, children: _jsxs(Button, { variant: "outline", children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), "Add Account"] }) }), _jsxs(DialogContent, { className: "max-w-2xl", children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { children: "Add Mobile Money Account" }) }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Provider" }), _jsxs(Select, { value: accountForm.provider, onValueChange: (value) => {
                                                                    const provider = providers.find(p => p.id === value);
                                                                    setAccountForm(prev => ({
                                                                        ...prev,
                                                                        provider: value,
                                                                        currency: provider?.currency || ''
                                                                    }));
                                                                }, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select provider" }) }), _jsx(SelectContent, { children: providers.map((provider) => (_jsxs(SelectItem, { value: provider.id || `provider-${Math.random()}`, children: [provider.name, " (", provider.country, ")"] }, provider.id))) })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Account Number" }), _jsx(Input, { value: accountForm.accountNumber, onChange: (e) => setAccountForm(prev => ({ ...prev, accountNumber: e.target.value })), placeholder: "Account number" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Account Name" }), _jsx(Input, { value: accountForm.accountName, onChange: (e) => setAccountForm(prev => ({ ...prev, accountName: e.target.value })), placeholder: "Account name" })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Phone Number" }), _jsx(Input, { value: accountForm.phoneNumber, onChange: (e) => setAccountForm(prev => ({ ...prev, phoneNumber: e.target.value })), placeholder: "+254700000000" })] }), _jsxs(Button, { onClick: createAccount, className: "w-full", children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), "Add Account"] })] })] })] })] })] }), stats && (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsx(Card, { children: _jsxs(CardContent, { className: "p-6", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Smartphone, { className: "w-5 h-5 text-green-600" }), _jsx("span", { className: "text-sm font-medium", children: "Total Accounts" })] }), _jsx("div", { className: "text-2xl font-bold text-green-600", children: stats.totalAccounts }), _jsxs("div", { className: "text-xs text-muted-foreground mt-1", children: [stats.activeAccounts, " active"] })] }) }), _jsx(Card, { children: _jsxs(CardContent, { className: "p-6", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(ArrowUpDown, { className: "w-5 h-5 text-blue-600" }), _jsx("span", { className: "text-sm font-medium", children: "Transactions" })] }), _jsx("div", { className: "text-2xl font-bold text-blue-600", children: stats.totalTransactions }), _jsx("div", { className: "text-xs text-muted-foreground mt-1", children: "All time" })] }) }), _jsx(Card, { children: _jsxs(CardContent, { className: "p-6", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(DollarSign, { className: "w-5 h-5 text-purple-600" }), _jsx("span", { className: "text-sm font-medium", children: "Total Volume" })] }), _jsx("div", { className: "text-2xl font-bold text-purple-600", children: formatCurrency(stats?.totalVolume || 0, 'USD') }), _jsx("div", { className: "text-xs text-muted-foreground mt-1", children: "Processed" })] }) }), _jsx(Card, { children: _jsxs(CardContent, { className: "p-6", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(TrendingDown, { className: "w-5 h-5 text-orange-600" }), _jsx("span", { className: "text-sm font-medium", children: "Total Fees" })] }), _jsx("div", { className: "text-2xl font-bold text-orange-600", children: formatCurrency(stats?.totalFees || 0, 'USD') }), _jsx("div", { className: "text-xs text-muted-foreground mt-1", children: "Paid" })] }) })] })), _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center gap-4", children: [_jsx(Label, { htmlFor: "country-filter", children: "Filter by Country:" }), _jsxs(Select, { value: selectedCountry, onValueChange: setSelectedCountry, children: [_jsx(SelectTrigger, { id: "country-filter", className: "w-48", children: _jsx(SelectValue, { placeholder: "All countries" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All Countries" }), countries.filter(country => country && country.trim()).map((country) => (_jsx(SelectItem, { value: country, children: country }, country)))] })] })] }) }) }), _jsxs(Tabs, { defaultValue: "accounts", className: "space-y-4", children: [_jsxs(TabsList, { children: [_jsx(TabsTrigger, { value: "accounts", children: "Accounts" }), _jsx(TabsTrigger, { value: "transactions", children: "Transactions" }), _jsx(TabsTrigger, { value: "providers", children: "Providers" })] }), _jsx(TabsContent, { value: "accounts", className: "space-y-4", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Smartphone, { className: "w-5 h-5 text-green-600" }), "Mobile Money Accounts"] }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: accounts.length === 0 ? (_jsxs("div", { className: "text-center py-8", children: [_jsx(Smartphone, { className: "w-12 h-12 text-gray-400 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "No Mobile Money Accounts" }), _jsx("p", { className: "text-gray-500 mb-4", children: "Add your first mobile money account to get started." }), _jsxs(Button, { onClick: () => setIsAddAccountOpen(true), children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), "Add Account"] })] })) : (accounts.map((account) => (_jsxs("div", { className: "flex items-center justify-between p-4 border rounded-lg", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center", children: _jsx(Smartphone, { className: "w-5 h-5 text-green-600" }) }), _jsxs("div", { children: [_jsx("div", { className: "font-medium", children: account.accountName }), _jsxs("div", { className: "text-sm text-muted-foreground", children: [account.provider, " \u2022 ", account.phoneNumber] })] })] }), _jsxs("div", { className: "text-right", children: [_jsx("div", { className: "font-semibold", children: balanceVisible ? formatCurrency(account?.balance || 0, account?.currency || 'USD') : '••••••' }), _jsxs("div", { className: "flex items-center gap-2", children: [getStatusIcon(account.status), _jsx(Badge, { className: getStatusColor(account.status), children: account.status })] })] })] }, account.id)))) }) })] }) }), _jsx(TabsContent, { value: "transactions", className: "space-y-4", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(ArrowUpDown, { className: "w-5 h-5 text-blue-600" }), "Recent Transactions"] }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-3", children: transactions.length === 0 ? (_jsxs("div", { className: "text-center py-8", children: [_jsx(ArrowUpDown, { className: "w-12 h-12 text-gray-400 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "No Transactions" }), _jsx("p", { className: "text-gray-500 mb-4", children: "Transactions will appear here once you start using your accounts." })] })) : (transactions.map((transaction) => (_jsxs("div", { className: "flex items-center justify-between p-4 border rounded-lg", children: [_jsxs("div", { className: "flex items-center gap-3", children: [getTransactionIcon(transaction.transactionType), _jsxs("div", { children: [_jsx("div", { className: "font-medium", children: transaction.description }), _jsxs("div", { className: "text-sm text-muted-foreground", children: [transaction.provider, " \u2022 ", new Date(transaction.createdAt).toLocaleDateString()] })] })] }), _jsxs("div", { className: "text-right", children: [_jsxs("div", { className: `font-semibold ${transaction.transactionType === 'deposit' ? 'text-green-600' : 'text-red-600'}`, children: [transaction.transactionType === 'deposit' ? '+' : '', formatCurrency(transaction?.amount || 0, transaction?.currency || 'USD')] }), _jsxs("div", { className: "flex items-center gap-2", children: [getStatusIcon(transaction.status), _jsx(Badge, { className: getStatusColor(transaction.status), children: transaction.status })] })] })] }, transaction.id)))) }) })] }) }), _jsx(TabsContent, { value: "providers", className: "space-y-4", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Globe, { className: "w-5 h-5 text-purple-600" }), "Supported Providers"] }) }), _jsx(CardContent, { children: _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: providers.map((provider) => (_jsxs("div", { className: "p-4 border rounded-lg hover:bg-gray-50", children: [_jsxs("div", { className: "flex items-center gap-3 mb-3", children: [provider.logo && (_jsx("img", { src: provider.logo, alt: provider.name, className: "w-8 h-8" })), _jsxs("div", { children: [_jsx("div", { className: "font-medium", children: provider.name }), _jsx("div", { className: "text-sm text-muted-foreground", children: provider.country })] })] }), _jsxs("div", { className: "space-y-2 text-sm", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Currency:" }), _jsx("span", { className: "font-medium", children: provider.currency })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Daily Limit:" }), _jsx("span", { className: "font-medium", children: formatCurrency(provider?.limits?.daily || 0, provider?.currency || 'USD') })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Transfer Fee:" }), _jsxs("span", { className: "font-medium", children: [provider.fees.transfer, "%"] })] })] }), _jsx("div", { className: "mt-3", children: _jsx(Badge, { variant: provider.isActive ? 'default' : 'secondary', children: provider.isActive ? 'Active' : 'Inactive' }) })] }, provider.id))) }) })] }) })] })] }));
}
