import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { CreditCard, DollarSign, Users, Settings, Plus, CheckCircle, TrendingUp, BarChart3, Zap } from "lucide-react";
import bankingApi from '@/lib/api/banking';
export function PaymentProcessorManager({ companyId }) {
    const [stats, setStats] = useState(null);
    const [paymentIntents, setPaymentIntents] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    // Form states
    const [isInitializingProcessor, setIsInitializingProcessor] = useState(false);
    const [processorType, setProcessorType] = useState('stripe');
    const [processorConfig, setProcessorConfig] = useState({
        publishableKey: '',
        secretKey: '',
        clientId: '',
        clientSecret: '',
        applicationId: '',
        accessToken: '',
        environment: 'sandbox'
    });
    const [isCreatingPayment, setIsCreatingPayment] = useState(false);
    const [paymentForm, setPaymentForm] = useState({
        amount: '',
        currency: 'USD',
        description: '',
        customerId: ''
    });
    const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);
    const [customerForm, setCustomerForm] = useState({
        name: '',
        email: '',
        phone: '',
        taxNumber: '',
        address: '',
        currency: 'USD'
    });
    // Payment Method Form State
    const [isAddingPaymentMethod, setIsAddingPaymentMethod] = useState(false);
    const [paymentMethodForm, setPaymentMethodForm] = useState({
        customerId: '',
        type: 'card',
        cardNumber: '',
        expiryMonth: '',
        expiryYear: '',
        cvc: '',
        bankAccountNumber: '',
        routingNumber: '',
        accountType: 'checking',
        isDefault: false
    });
    // Dialog states for quick actions
    const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
    const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);
    const [isPaymentMethodDialogOpen, setIsPaymentMethodDialogOpen] = useState(false);
    const [isProcessorDialogOpen, setIsProcessorDialogOpen] = useState(false);
    // Helper functions for form management
    const resetPaymentForm = () => {
        setPaymentForm({
            amount: '',
            currency: 'USD',
            description: '',
            customerId: ''
        });
    };
    const resetCustomerForm = () => {
        setCustomerForm({
            name: '',
            email: '',
            phone: '',
            taxNumber: '',
            address: '',
            currency: 'USD'
        });
    };
    const resetPaymentMethodForm = () => {
        setPaymentMethodForm({
            customerId: '',
            type: 'card',
            cardNumber: '',
            expiryMonth: '',
            expiryYear: '',
            cvc: '',
            bankAccountNumber: '',
            routingNumber: '',
            accountType: 'checking',
            isDefault: false
        });
    };
    const resetProcessorConfig = () => {
        setProcessorConfig({
            publishableKey: '',
            secretKey: '',
            clientId: '',
            clientSecret: '',
            applicationId: '',
            accessToken: '',
            environment: 'sandbox'
        });
    };
    useEffect(() => {
        // Debug: Log the companyId being used
        console.log('PaymentProcessorManager companyId:', companyId);
        console.log('localStorage company_id:', localStorage.getItem('company_id'));
        console.log('localStorage companyId:', localStorage.getItem('companyId'));
        console.log('localStorage company:', localStorage.getItem('company'));
        if (!companyId) {
            console.warn("Company Not Selected - Please select a company to use the payment processor.");
            return;
        }
        loadData();
    }, [companyId]);
    const loadData = async () => {
        setLoading(true);
        try {
            // Load stats
            const statsResponse = await bankingApi.getProcessorStats();
            setStats(statsResponse);
            // Load recent payment intents
            const intentsResponse = await bankingApi.getPaymentIntents({ limit: 10 });
            setPaymentIntents(intentsResponse.paymentIntents || []);
            // Load customers
            const customersResponse = await bankingApi.getPaymentCustomers({ limit: 10, companyId });
            setCustomers(customersResponse.customers || []);
            // Load payment methods
            console.log('Loading payment methods with companyId:', companyId);
            const methodsResponse = await bankingApi.getPaymentMethods({ limit: 10, companyId });
            console.log('Payment methods response:', methodsResponse);
            setPaymentMethods(methodsResponse.paymentMethods || []);
        }
        catch (err) {
            console.error('Error loading payment processor data:', err);
            // Set empty arrays on error instead of mock data
            setPaymentIntents([]);
            setCustomers([]);
            setPaymentMethods([]);
            // Log warning for data loading issues
            console.warn("Data Loading Issue - Some payment processor data could not be loaded. Please check your connection and try refreshing.");
        }
        finally {
            setLoading(false);
        }
    };
    const initializeProcessor = async () => {
        setIsInitializingProcessor(true);
        try {
            const config = {
                ...processorConfig,
                environment: processorConfig.environment
            };
            await bankingApi.post('/api/payment-processors/initialize', {
                processorType,
                config
            });
            // Reset form
            setProcessorConfig({
                publishableKey: '',
                secretKey: '',
                clientId: '',
                clientSecret: '',
                applicationId: '',
                accessToken: '',
                environment: 'sandbox'
            });
            console.log(`${processorType.charAt(0).toUpperCase() + processorType.slice(1)} processor has been successfully configured and is ready to process payments.`);
            resetProcessorConfig();
            setIsProcessorDialogOpen(false);
            loadData();
        }
        catch (err) {
            console.error('Error initializing processor:', err);
            const errorMessage = err.message || 'Failed to initialize payment processor';
            console.error(`Initialization Failed - ${errorMessage}`);
        }
        finally {
            setIsInitializingProcessor(false);
        }
    };
    const createPaymentIntent = async () => {
        setIsCreatingPayment(true);
        try {
            await bankingApi.post('/api/payment-intents', {
                amount: Number(paymentForm.amount),
                currency: paymentForm.currency,
                description: paymentForm.description,
                customerId: paymentForm.customerId || undefined
            });
            console.log(`Payment intent for $${paymentForm.amount} ${paymentForm.currency} has been created successfully.`);
            resetPaymentForm();
            setIsPaymentDialogOpen(false);
            loadData();
        }
        catch (err) {
            console.error('Error creating payment intent:', err);
            const errorMessage = err.message || 'Failed to create payment intent';
            if (errorMessage.includes('No active payment processor configured')) {
                console.error("Payment Processor Not Configured - Please initialize a payment processor (Stripe, PayPal, or Square) before creating payment intents.");
            }
            else {
                console.error(`Payment Creation Failed - ${errorMessage}`);
            }
        }
        finally {
            setIsCreatingPayment(false);
        }
    };
    const addPaymentMethod = async () => {
        setIsAddingPaymentMethod(true);
        try {
            const paymentMethodData = {
                customerId: paymentMethodForm.customerId,
                type: paymentMethodForm.type,
                isDefault: paymentMethodForm.isDefault,
                companyId: companyId
            };
            if (paymentMethodForm.type === 'card') {
                paymentMethodData.card = {
                    number: paymentMethodForm.cardNumber,
                    expMonth: parseInt(paymentMethodForm.expiryMonth),
                    expYear: parseInt(paymentMethodForm.expiryYear),
                    cvc: paymentMethodForm.cvc
                };
            }
            else if (paymentMethodForm.type === 'bank_account') {
                paymentMethodData.bankAccount = {
                    accountNumber: paymentMethodForm.bankAccountNumber,
                    routingNumber: paymentMethodForm.routingNumber,
                    accountType: paymentMethodForm.accountType
                };
            }
            console.log('Adding payment method with data:', paymentMethodData);
            const result = await bankingApi.addPaymentMethod(paymentMethodData);
            console.log('Payment method creation result:', result);
            console.log(`Payment method added successfully for customer`);
            resetPaymentMethodForm();
            setIsPaymentMethodDialogOpen(false);
            loadData();
        }
        catch (err) {
            console.error('Error adding payment method:', err);
            let errorMessage = 'Failed to add payment method';
            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            }
            else if (err.message) {
                errorMessage = err.message;
            }
            console.error(`Payment Method Creation Failed - ${errorMessage}`);
        }
        finally {
            setIsAddingPaymentMethod(false);
        }
    };
    const createCustomer = async () => {
        setIsCreatingCustomer(true);
        console.log('Creating customer with data:', {
            companyId,
            name: customerForm.name,
            email: customerForm.email,
            phone: customerForm.phone,
            taxNumber: customerForm.taxNumber,
            address: customerForm.address,
            currency: customerForm.currency
        });
        try {
            console.log('=== CUSTOMER CREATION DEBUG ===');
            console.log('bankingApi object:', bankingApi);
            console.log('bankingApi.createCustomer:', bankingApi.createCustomer);
            console.log('companyId being used:', companyId);
            console.log('customerForm data:', customerForm);
            const requestData = {
                companyId,
                name: customerForm.name,
                email: customerForm.email,
                phone: customerForm.phone,
                taxNumber: customerForm.taxNumber,
                address: customerForm.address,
                currency: customerForm.currency
            };
            console.log('Request data being sent:', requestData);
            console.log('Request data JSON:', JSON.stringify(requestData, null, 2));
            const result = await bankingApi.createCustomer(requestData);
            console.log('Customer creation result:', result);
            console.log(`Customer ${customerForm.name || customerForm.email} has been created and is now available for both payments and invoicing.`);
            resetCustomerForm();
            setIsCustomerDialogOpen(false);
            loadData();
        }
        catch (err) {
            console.error('Error creating customer:', err);
            let errorMessage = 'Failed to create customer';
            // Handle API error responses
            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            }
            else if (err.message) {
                errorMessage = err.message;
            }
            console.log('Showing error toast:', errorMessage);
            console.error(`Customer Creation Failed - ${errorMessage}`);
        }
        finally {
            setIsCreatingCustomer(false);
        }
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'succeeded': return 'text-green-600 bg-green-100';
            case 'pending': return 'text-yellow-600 bg-yellow-100';
            case 'failed': return 'text-red-600 bg-red-100';
            case 'canceled': return 'text-gray-600 bg-gray-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };
    const getProcessorIcon = (processor) => {
        switch (processor) {
            case 'stripe': return _jsx(CreditCard, { className: "w-4 h-4 text-purple-600" });
            case 'paypal': return _jsx(DollarSign, { className: "w-4 h-4 text-blue-600" });
            case 'square': return _jsx(Zap, { className: "w-4 h-4 text-green-600" });
            default: return _jsx(CreditCard, { className: "w-4 h-4 text-gray-600" });
        }
    };
    if (loading) {
        return (_jsx("div", { className: "space-y-6", children: _jsx("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [...Array(4)].map((_, i) => (_jsx(Card, { children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "animate-pulse", children: [_jsx("div", { className: "h-4 bg-gray-200 rounded w-3/4 mb-2" }), _jsx("div", { className: "h-8 bg-gray-200 rounded w-1/2" })] }) }) }, i))) }) }));
    }
    // Calculate overview metrics
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h2", { className: "text-2xl font-bold", children: "Payment Processors" }), _jsxs(Dialog, { open: isProcessorDialogOpen, onOpenChange: setIsProcessorDialogOpen, children: [_jsx(DialogTrigger, { asChild: true, children: _jsxs(Button, { children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), "Initialize Processor"] }) }), _jsxs(DialogContent, { className: "max-w-2xl", children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { children: "Initialize Payment Processor" }) }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Processor Type" }), _jsxs(Select, { value: processorType, onValueChange: (value) => setProcessorType(value), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "stripe", children: "Stripe" }), _jsx(SelectItem, { value: "paypal", children: "PayPal" }), _jsx(SelectItem, { value: "square", children: "Square" })] })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Environment" }), _jsxs(Select, { value: processorConfig.environment, onValueChange: (value) => setProcessorConfig(prev => ({ ...prev, environment: value })), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "sandbox", children: "Sandbox" }), _jsx(SelectItem, { value: "production", children: "Production" })] })] })] }), processorType === 'stripe' && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Publishable Key" }), _jsx(Input, { value: processorConfig.publishableKey, onChange: (e) => setProcessorConfig(prev => ({ ...prev, publishableKey: e.target.value })), placeholder: "pk_test_..." })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Secret Key" }), _jsx(Input, { type: "password", value: processorConfig.secretKey, onChange: (e) => setProcessorConfig(prev => ({ ...prev, secretKey: e.target.value })), placeholder: "sk_test_..." })] })] })), processorType === 'paypal' && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Client ID" }), _jsx(Input, { value: processorConfig.clientId, onChange: (e) => setProcessorConfig(prev => ({ ...prev, clientId: e.target.value })), placeholder: "Client ID" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Client Secret" }), _jsx(Input, { type: "password", value: processorConfig.clientSecret, onChange: (e) => setProcessorConfig(prev => ({ ...prev, clientSecret: e.target.value })), placeholder: "Client Secret" })] })] })), processorType === 'square' && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Application ID" }), _jsx(Input, { value: processorConfig.applicationId, onChange: (e) => setProcessorConfig(prev => ({ ...prev, applicationId: e.target.value })), placeholder: "Application ID" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Access Token" }), _jsx(Input, { type: "password", value: processorConfig.accessToken, onChange: (e) => setProcessorConfig(prev => ({ ...prev, accessToken: e.target.value })), placeholder: "Access Token" })] })] })), _jsx(Button, { onClick: initializeProcessor, disabled: isInitializingProcessor, className: "w-full", children: isInitializingProcessor ? 'Initializing...' : 'Initialize Processor' })] })] })] })] }), stats && (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsx(Card, { children: _jsxs(CardContent, { className: "p-6", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(DollarSign, { className: "w-5 h-5 text-green-600" }), _jsx("span", { className: "text-sm font-medium", children: "Total Payments" })] }), _jsx("div", { className: "text-2xl font-bold text-green-600", children: stats.totalPayments }), _jsxs("div", { className: "text-xs text-muted-foreground mt-1", children: ["$", stats.totalAmount.toFixed(2), " total volume"] })] }) }), _jsx(Card, { children: _jsxs(CardContent, { className: "p-6", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(CheckCircle, { className: "w-5 h-5 text-blue-600" }), _jsx("span", { className: "text-sm font-medium", children: "Success Rate" })] }), _jsxs("div", { className: "text-2xl font-bold text-blue-600", children: [stats.totalPayments > 0 ? Math.round((stats.successfulPayments / stats.totalPayments) * 100) : 0, "%"] }), _jsxs("div", { className: "text-xs text-muted-foreground mt-1", children: [stats.successfulPayments, " successful"] })] }) }), _jsx(Card, { children: _jsxs(CardContent, { className: "p-6", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(TrendingUp, { className: "w-5 h-5 text-purple-600" }), _jsx("span", { className: "text-sm font-medium", children: "Average Amount" })] }), _jsxs("div", { className: "text-2xl font-bold text-purple-600", children: ["$", stats.averageAmount.toFixed(2)] }), _jsx("div", { className: "text-xs text-muted-foreground mt-1", children: "Per transaction" })] }) }), _jsx(Card, { children: _jsxs(CardContent, { className: "p-6", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(BarChart3, { className: "w-5 h-5 text-orange-600" }), _jsx("span", { className: "text-sm font-medium", children: "Processors" })] }), _jsx("div", { className: "text-2xl font-bold text-orange-600", children: Object.keys(stats.processorBreakdown).length }), _jsx("div", { className: "text-xs text-muted-foreground mt-1", children: "Active integrations" })] }) })] })), _jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, children: [_jsxs(TabsList, { children: [_jsx(TabsTrigger, { value: "overview", children: "Overview" }), _jsx(TabsTrigger, { value: "payments", children: "Payments" }), _jsx(TabsTrigger, { value: "customers", children: "Customers" }), _jsx(TabsTrigger, { value: "methods", children: "Payment Methods" })] }), _jsxs(TabsContent, { value: "overview", className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Recent Activity" }) }), _jsx(CardContent, { children: paymentIntents.length > 0 ? (_jsx("div", { className: "space-y-3", children: paymentIntents.slice(0, 5).map((intent) => (_jsxs("div", { className: "flex items-center justify-between p-3 bg-gray-50 rounded-lg", children: [_jsxs("div", { className: "flex items-center gap-3", children: [getProcessorIcon(intent.processor), _jsxs("div", { children: [_jsx("div", { className: "font-medium text-sm", children: intent.description || 'Payment' }), _jsx("div", { className: "text-xs text-gray-500", children: new Date(intent.createdAt).toLocaleDateString() })] })] }), _jsxs("div", { className: "text-right", children: [_jsxs("div", { className: "font-medium", children: ["$", intent.amount.toFixed(2)] }), _jsx(Badge, { className: getStatusColor(intent.status), children: intent.status })] })] }, intent.id))) })) : (_jsxs("div", { className: "text-center py-8 text-gray-500", children: [_jsx(CreditCard, { className: "w-12 h-12 mx-auto mb-4 opacity-50" }), _jsx("p", { children: "No recent payments" }), _jsx("p", { className: "text-sm", children: "Create your first payment to see activity here" })] })) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Quick Actions" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-3", children: [_jsxs(Button, { className: "w-full justify-start", variant: "outline", onClick: () => setIsPaymentDialogOpen(true), children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), "Create Payment Intent"] }), _jsxs(Button, { className: "w-full justify-start", variant: "outline", onClick: () => setIsCustomerDialogOpen(true), children: [_jsx(Users, { className: "w-4 h-4 mr-2" }), "Add Customer"] }), _jsxs(Button, { className: "w-full justify-start", variant: "outline", onClick: () => setIsPaymentMethodDialogOpen(true), children: [_jsx(CreditCard, { className: "w-4 h-4 mr-2" }), "Add Payment Method"] }), _jsxs(Button, { className: "w-full justify-start", variant: "outline", onClick: () => setIsProcessorDialogOpen(true), children: [_jsx(Settings, { className: "w-4 h-4 mr-2" }), "Configure Processor"] })] }) })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Processor Status" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { className: "flex items-center justify-between p-4 border rounded-lg", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "p-2 bg-purple-100 rounded-lg", children: _jsx(CreditCard, { className: "w-5 h-5 text-purple-600" }) }), _jsxs("div", { children: [_jsx("div", { className: "font-medium", children: "Stripe" }), _jsx("div", { className: "text-sm text-gray-500", children: "Credit Cards" })] })] }), _jsx(Badge, { variant: "outline", children: "Available" })] }), _jsxs("div", { className: "flex items-center justify-between p-4 border rounded-lg", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "p-2 bg-blue-100 rounded-lg", children: _jsx(DollarSign, { className: "w-5 h-5 text-blue-600" }) }), _jsxs("div", { children: [_jsx("div", { className: "font-medium", children: "PayPal" }), _jsx("div", { className: "text-sm text-gray-500", children: "Digital Wallet" })] })] }), _jsx(Badge, { variant: "outline", children: "Available" })] }), _jsxs("div", { className: "flex items-center justify-between p-4 border rounded-lg", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "p-2 bg-green-100 rounded-lg", children: _jsx(Zap, { className: "w-5 h-5 text-green-600" }) }), _jsxs("div", { children: [_jsx("div", { className: "font-medium", children: "Square" }), _jsx("div", { className: "text-sm text-gray-500", children: "Point of Sale" })] })] }), _jsx(Badge, { variant: "outline", children: "Available" })] })] }) })] })] }), _jsxs(TabsContent, { value: "payments", className: "space-y-4", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h3", { className: "text-lg font-semibold", children: "Recent Payments" }), _jsxs(Button, { size: "sm", onClick: () => setIsPaymentDialogOpen(true), children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), "Create Payment"] })] }), _jsx(Card, { children: _jsx(CardContent, { className: "p-0", children: paymentIntents.length > 0 ? (_jsx("div", { className: "space-y-3", children: paymentIntents.map((payment) => (_jsxs("div", { className: "flex items-center justify-between p-4 border-b last:border-b-0", children: [_jsxs("div", { className: "flex items-center gap-3", children: [getProcessorIcon(payment.processor), _jsxs("div", { children: [_jsxs("div", { className: "font-medium", children: ["$", payment.amount.toFixed(2), " ", payment.currency] }), _jsx("div", { className: "text-sm text-muted-foreground", children: payment.description || 'Payment' })] })] }), _jsxs("div", { className: "text-right", children: [_jsx(Badge, { className: getStatusColor(payment.status), children: payment.status }), _jsx("div", { className: "text-xs text-muted-foreground mt-1", children: new Date(payment.createdAt).toLocaleDateString() })] })] }, payment.id))) })) : (_jsxs("div", { className: "text-center py-8 text-gray-500", children: [_jsx(CreditCard, { className: "w-12 h-12 mx-auto mb-4 opacity-50" }), _jsx("p", { children: "No payments yet" }), _jsx("p", { className: "text-sm", children: "Create your first payment to see it here" })] })) }) })] }), _jsxs(TabsContent, { value: "customers", className: "space-y-4", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold", children: "Customers" }), _jsx("p", { className: "text-sm text-gray-500", children: "These are your real customers from the invoice system" })] }), _jsxs(Button, { size: "sm", onClick: () => setIsCustomerDialogOpen(true), children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), "Add Customer"] })] }), _jsx(Card, { children: _jsx(CardContent, { className: "p-0", children: customers.length > 0 ? (_jsx("div", { className: "space-y-3", children: customers.map((customer) => (_jsxs("div", { className: "flex items-center justify-between p-4 border-b last:border-b-0", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Users, { className: "w-5 h-5 text-blue-600" }), _jsxs("div", { children: [_jsx("div", { className: "font-medium", children: customer.name || 'Unnamed Customer' }), _jsx("div", { className: "text-sm text-muted-foreground", children: customer.email }), customer.phone && (_jsx("div", { className: "text-xs text-gray-500", children: customer.phone }))] })] }), _jsxs("div", { className: "text-right", children: [_jsx(Badge, { variant: "secondary", className: "capitalize", children: customer.processor }), _jsx("div", { className: "text-xs text-muted-foreground mt-1", children: new Date(customer.createdAt).toLocaleDateString() }), _jsx("div", { className: "text-xs text-blue-600 mt-1", children: "Real Customer" })] })] }, customer.id))) })) : (_jsxs("div", { className: "text-center py-8 text-gray-500", children: [_jsx(Users, { className: "w-12 h-12 mx-auto mb-4 opacity-50" }), _jsx("p", { children: "No customers found" }), _jsx("p", { className: "text-sm", children: "Add customers here or create them in the Sales/Invoices section" }), _jsx("p", { className: "text-xs mt-2", children: "Customers created here will be available for invoicing and payments" }), _jsxs("div", { className: "mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg", children: [_jsxs("p", { className: "text-xs text-blue-700", children: ["\uD83D\uDCA1 ", _jsx("strong", { children: "Tip:" }), " You can create customers even without setting up a payment processor first. They'll be available for invoicing immediately."] }), companyId === 'cmg0lf1m1001289wp87nq08d8' && (_jsxs("p", { className: "text-xs text-red-700 mt-2", children: ["\u26A0\uFE0F ", _jsx("strong", { children: "Note:" }), " Your company ID points to \"personal\" company. Using correct company ID for \"mmcmc\" instead."] }))] })] })) }) })] }), _jsxs(TabsContent, { value: "methods", className: "space-y-4", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h3", { className: "text-lg font-semibold", children: "Payment Methods" }), _jsxs(Button, { size: "sm", onClick: () => setIsPaymentMethodDialogOpen(true), children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), "Add Payment Method"] })] }), _jsx(Card, { children: _jsx(CardContent, { className: "p-0", children: paymentMethods.length > 0 ? (_jsx("div", { className: "space-y-3", children: paymentMethods.map((method) => (_jsxs("div", { className: "flex items-center justify-between p-4 border-b last:border-b-0", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(CreditCard, { className: "w-5 h-5 text-purple-600" }), _jsxs("div", { children: [_jsxs("div", { className: "font-medium capitalize", children: [method.type, " ", method.last4 && `****${method.last4}`] }), _jsxs("div", { className: "text-sm text-muted-foreground", children: [method.brand && method.brand.toUpperCase(), method.expMonth && method.expYear && ` • ${method.expMonth}/${method.expYear}`] })] })] }), _jsxs("div", { className: "text-right", children: [method.isDefault && (_jsx(Badge, { variant: "default", children: "Default" })), _jsx("div", { className: "text-xs text-muted-foreground mt-1 capitalize", children: method.processor })] })] }, method.id))) })) : (_jsxs("div", { className: "text-center py-8 text-gray-500", children: [_jsx(CreditCard, { className: "w-12 h-12 mx-auto mb-4 opacity-50" }), _jsx("p", { children: "No payment methods" }), _jsx("p", { className: "text-sm", children: "Add a payment method to get started" })] })) }) })] })] }), _jsx(Dialog, { open: isPaymentDialogOpen, onOpenChange: setIsPaymentDialogOpen, children: _jsxs(DialogContent, { children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { children: "Create Payment Intent" }) }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Amount" }), _jsx(Input, { type: "number", value: paymentForm.amount, onChange: (e) => setPaymentForm(prev => ({ ...prev, amount: e.target.value })), placeholder: "0.00" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Currency" }), _jsxs(Select, { value: paymentForm.currency, onValueChange: (value) => setPaymentForm(prev => ({ ...prev, currency: value })), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "USD", children: "USD" }), _jsx(SelectItem, { value: "EUR", children: "EUR" }), _jsx(SelectItem, { value: "GBP", children: "GBP" })] })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Description" }), _jsx(Input, { value: paymentForm.description, onChange: (e) => setPaymentForm(prev => ({ ...prev, description: e.target.value })), placeholder: "Payment description" })] }), _jsx(Button, { onClick: createPaymentIntent, disabled: isCreatingPayment || !paymentForm.amount, className: "w-full", children: isCreatingPayment ? 'Creating...' : 'Create Payment Intent' })] })] }) }), _jsx(Dialog, { open: isCustomerDialogOpen, onOpenChange: setIsCustomerDialogOpen, children: _jsxs(DialogContent, { children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Create Customer" }), _jsx("p", { className: "text-sm text-gray-600 mt-2", children: "Customers created here will be available for both payments and invoicing." }), _jsxs("div", { className: "text-xs text-blue-600 mt-1 flex items-center gap-2", children: [_jsxs("span", { children: ["Company: ", companyId] }), companyId === 'cmg0lf1m1001289wp87nq08d8' && (_jsx("span", { className: "text-red-600 font-medium", children: "(Points to \"personal\" company)" }))] })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Name *" }), _jsx(Input, { value: customerForm.name, onChange: (e) => setCustomerForm(prev => ({ ...prev, name: e.target.value })), placeholder: "Customer Name", required: true })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Email" }), _jsx(Input, { type: "email", value: customerForm.email, onChange: (e) => setCustomerForm(prev => ({ ...prev, email: e.target.value })), placeholder: "customer@example.com" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Phone" }), _jsx(Input, { value: customerForm.phone, onChange: (e) => setCustomerForm(prev => ({ ...prev, phone: e.target.value })), placeholder: "+1-555-0123" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Tax Number" }), _jsx(Input, { value: customerForm.taxNumber, onChange: (e) => setCustomerForm(prev => ({ ...prev, taxNumber: e.target.value })), placeholder: "Tax ID or VAT Number" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Address" }), _jsx(Input, { value: customerForm.address, onChange: (e) => setCustomerForm(prev => ({ ...prev, address: e.target.value })), placeholder: "Customer Address" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Currency" }), _jsxs(Select, { value: customerForm.currency, onValueChange: (value) => setCustomerForm(prev => ({ ...prev, currency: value })), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select currency" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "USD", children: "USD" }), _jsx(SelectItem, { value: "EUR", children: "EUR" }), _jsx(SelectItem, { value: "GBP", children: "GBP" }), _jsx(SelectItem, { value: "KES", children: "KES" }), _jsx(SelectItem, { value: "NGN", children: "NGN" })] })] })] }), _jsx(Button, { onClick: createCustomer, disabled: isCreatingCustomer || !customerForm.name, className: "w-full", children: isCreatingCustomer ? 'Creating...' : 'Create Customer' })] })] }) }), _jsx(Dialog, { open: isPaymentMethodDialogOpen, onOpenChange: setIsPaymentMethodDialogOpen, children: _jsxs(DialogContent, { children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Add Payment Method" }), _jsx("p", { className: "text-sm text-gray-600 mt-2", children: "Add a payment method for a customer to enable payments." })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Customer *" }), _jsxs(Select, { value: paymentMethodForm.customerId, onValueChange: (value) => setPaymentMethodForm(prev => ({ ...prev, customerId: value })), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select customer" }) }), _jsx(SelectContent, { children: customers.map((customer) => (_jsx(SelectItem, { value: customer.id, children: customer.name || customer.email }, customer.id))) })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Payment Method Type *" }), _jsxs(Select, { value: paymentMethodForm.type, onValueChange: (value) => setPaymentMethodForm(prev => ({ ...prev, type: value })), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select type" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "card", children: "Credit/Debit Card" }), _jsx(SelectItem, { value: "bank_account", children: "Bank Account" })] })] })] }), paymentMethodForm.type === 'card' && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Card Number *" }), _jsx(Input, { placeholder: "1234 5678 9012 3456", value: paymentMethodForm.cardNumber, onChange: (e) => setPaymentMethodForm(prev => ({ ...prev, cardNumber: e.target.value })) })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Expiry Month *" }), _jsx(Input, { placeholder: "12", value: paymentMethodForm.expiryMonth, onChange: (e) => setPaymentMethodForm(prev => ({ ...prev, expiryMonth: e.target.value })) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Expiry Year *" }), _jsx(Input, { placeholder: "2025", value: paymentMethodForm.expiryYear, onChange: (e) => setPaymentMethodForm(prev => ({ ...prev, expiryYear: e.target.value })) })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "CVC *" }), _jsx(Input, { placeholder: "123", value: paymentMethodForm.cvc, onChange: (e) => setPaymentMethodForm(prev => ({ ...prev, cvc: e.target.value })) })] })] })), paymentMethodForm.type === 'bank_account' && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Account Number *" }), _jsx(Input, { placeholder: "1234567890", value: paymentMethodForm.bankAccountNumber, onChange: (e) => setPaymentMethodForm(prev => ({ ...prev, bankAccountNumber: e.target.value })) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Routing Number *" }), _jsx(Input, { placeholder: "123456789", value: paymentMethodForm.routingNumber, onChange: (e) => setPaymentMethodForm(prev => ({ ...prev, routingNumber: e.target.value })) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Account Type *" }), _jsxs(Select, { value: paymentMethodForm.accountType, onValueChange: (value) => setPaymentMethodForm(prev => ({ ...prev, accountType: value })), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select account type" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "checking", children: "Checking" }), _jsx(SelectItem, { value: "savings", children: "Savings" })] })] })] })] })), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("input", { type: "checkbox", id: "isDefault", checked: paymentMethodForm.isDefault, onChange: (e) => setPaymentMethodForm(prev => ({ ...prev, isDefault: e.target.checked })), className: "rounded" }), _jsx(Label, { htmlFor: "isDefault", children: "Set as default payment method" })] }), _jsx(Button, { onClick: addPaymentMethod, disabled: isAddingPaymentMethod || !paymentMethodForm.customerId, className: "w-full", children: isAddingPaymentMethod ? 'Adding...' : 'Add Payment Method' })] })] }) })] }));
}
