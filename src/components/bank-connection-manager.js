import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Building2, Plus, RefreshCw, AlertCircle, CheckCircle, Clock, Search, Link, Unlink, BarChart3, TrendingUp } from "lucide-react";
import { bankingApiV2 as bankingApi } from '@/lib/api/banking-v2';
import { toast } from 'sonner';
export function BankConnectionManager({ companyId }) {
    const [institutions, setInstitutions] = useState([]);
    const [connections, setConnections] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProvider, setSelectedProvider] = useState('plaid');
    const [selectedInstitution, setSelectedInstitution] = useState('');
    const [isCreatingConnection, setIsCreatingConnection] = useState(false);
    const [isConnectionDialogOpen, setIsConnectionDialogOpen] = useState(false);
    // Connection form state
    const [connectionForm, setConnectionForm] = useState({
        accountName: '',
        accountType: 'checking',
        accountNumber: '',
        routingNumber: '',
        username: '',
        password: ''
    });
    useEffect(() => {
        loadData();
    }, []);
    const resetConnectionForm = () => {
        setConnectionForm({
            accountName: '',
            accountType: 'checking',
            accountNumber: '',
            routingNumber: '',
            username: '',
            password: ''
        });
        setSelectedInstitution('');
        setSearchTerm('');
    };
    const handleDialogClose = (open) => {
        setIsConnectionDialogOpen(open);
        if (!open) {
            resetConnectionForm();
        }
    };
    const loadData = async () => {
        setLoading(true);
        try {
            // Load institutions
            const institutionsResponse = await bankingApi.get('/api/institutions');
            setInstitutions(institutionsResponse.institutions || []);
            // Load connections
            const connectionsUrl = companyId ? `/api/connections?companyId=${companyId}` : '/api/connections';
            const connectionsResponse = await bankingApi.get(connectionsUrl);
            setConnections(connectionsResponse.connections || []);
            // Load stats
            const statsUrl = companyId ? `/api/connections/stats?companyId=${companyId}` : '/api/connections/stats';
            const statsResponse = await bankingApi.get(statsUrl);
            setStats(statsResponse);
        }
        catch (error) {
            console.error('Error loading bank connection data:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const createConnection = async () => {
        if (!selectedInstitution) {
            toast.error('Please select a bank', {
                description: 'You need to choose a financial institution before creating a connection.'
            });
            return;
        }
        setIsCreatingConnection(true);
        try {
            const response = await bankingApi.post('/api/connections', {
                provider: selectedProvider,
                institutionId: selectedInstitution,
                companyId: companyId || 'cmg0qxjh9003nao3ftbaz1oc1', // Use prop or fallback
                credentials: {
                    accountName: connectionForm.accountName,
                    accountType: connectionForm.accountType,
                    accountNumber: connectionForm.accountNumber,
                    routingNumber: connectionForm.routingNumber,
                    username: connectionForm.username,
                    password: connectionForm.password
                }
            });
            toast.success('Bank connection created successfully!', {
                description: 'Your bank account connection has been established and is being synced.'
            });
            resetConnectionForm();
            setIsConnectionDialogOpen(false); // Close the dialog
            loadData();
        }
        catch (error) {
            console.error('Error creating connection:', error);
            toast.error('Failed to create bank connection', {
                description: 'There was an error establishing the connection. Please try again.'
            });
        }
        finally {
            setIsCreatingConnection(false);
        }
    };
    const syncConnection = async (connectionId) => {
        try {
            await bankingApi.post(`/api/connections/${connectionId}/sync`);
            toast.success('Connection synced successfully!', {
                description: 'Your bank account data has been updated with the latest information.'
            });
            loadData();
        }
        catch (error) {
            console.error('Error syncing connection:', error);
            toast.error('Failed to sync connection', {
                description: 'There was an error syncing your bank account. Please try again.'
            });
        }
    };
    const disconnectConnection = async (connectionId) => {
        if (!confirm('Are you sure you want to disconnect this bank connection?')) {
            return;
        }
        try {
            await bankingApi.post(`/api/connections/${connectionId}/disconnect`);
            toast.success('Connection disconnected successfully!', {
                description: 'Your bank account connection has been removed.'
            });
            loadData();
        }
        catch (error) {
            console.error('Error disconnecting connection:', error);
            toast.error('Failed to disconnect connection', {
                description: 'There was an error disconnecting your bank account. Please try again.'
            });
        }
    };
    const reconnectConnection = async (connectionId) => {
        try {
            await bankingApi.post(`/api/connections/${connectionId}/reconnect`);
            toast.success('Connection reconnected successfully!', {
                description: 'Your bank account connection has been restored.'
            });
            loadData();
        }
        catch (error) {
            console.error('Error reconnecting connection:', error);
            toast.error('Failed to reconnect connection', {
                description: 'There was an error reconnecting your bank account. Please try again.'
            });
        }
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'text-green-600 bg-green-100';
            case 'pending': return 'text-yellow-600 bg-yellow-100';
            case 'error': return 'text-red-600 bg-red-100';
            case 'inactive': return 'text-gray-600 bg-gray-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };
    const getStatusIcon = (status) => {
        switch (status) {
            case 'active': return _jsx(CheckCircle, { className: "w-4 h-4 text-green-600" });
            case 'pending': return _jsx(Clock, { className: "w-4 h-4 text-yellow-600" });
            case 'error': return _jsx(AlertCircle, { className: "w-4 h-4 text-red-600" });
            case 'inactive': return _jsx(Unlink, { className: "w-4 h-4 text-gray-600" });
            default: return _jsx(Clock, { className: "w-4 h-4 text-gray-600" });
        }
    };
    const filteredInstitutions = institutions.filter(inst => inst.name.toLowerCase().includes(searchTerm.toLowerCase()));
    if (loading) {
        return (_jsx("div", { className: "space-y-6", children: _jsx("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [...Array(4)].map((_, i) => (_jsx(Card, { children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "animate-pulse", children: [_jsx("div", { className: "h-4 bg-gray-200 rounded w-3/4 mb-2" }), _jsx("div", { className: "h-8 bg-gray-200 rounded w-1/2" })] }) }) }, i))) }) }));
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h2", { className: "text-2xl font-bold", children: "Bank Connections" }), _jsxs(Button, { onClick: () => setIsConnectionDialogOpen(true), children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), "Connect Bank"] })] }), _jsx(Dialog, { open: isConnectionDialogOpen, onOpenChange: handleDialogClose, children: _jsxs(DialogContent, { className: "max-w-2xl", children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { children: "Connect Your Bank Account" }) }), _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Connection Provider" }), _jsxs(Select, { value: selectedProvider, onValueChange: (value) => setSelectedProvider(value), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "plaid", children: "Plaid (Recommended)" }), _jsx(SelectItem, { value: "yodlee", children: "Yodlee" })] })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Select Your Bank" }), _jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-3 top-3 h-4 w-4 text-muted-foreground" }), _jsx(Input, { placeholder: "Search for your bank...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "pl-10" })] }), _jsx("div", { className: "max-h-60 overflow-y-auto border rounded-lg", children: filteredInstitutions.length > 0 ? (filteredInstitutions.map((institution) => (_jsx("div", { className: `p-3 cursor-pointer hover:bg-gray-50 border-b last:border-b-0 ${selectedInstitution === institution.id ? 'bg-blue-50 border-blue-200' : ''}`, onClick: () => setSelectedInstitution(institution.id), children: _jsxs("div", { className: "flex items-center gap-3", children: [institution.logo && (_jsx("img", { src: institution.logo, alt: institution.name, className: "w-8 h-8" })), _jsxs("div", { children: [_jsx("div", { className: "font-medium", children: institution.name }), _jsxs("div", { className: "text-sm text-muted-foreground", children: [institution.country, " \u2022 ", institution.products.join(', ')] })] })] }) }, institution.id)))) : (_jsxs("div", { className: "p-6 text-center", children: [_jsx(Building2, { className: "w-12 h-12 text-gray-400 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "No Banks Available" }), _jsx("p", { className: "text-gray-500 mb-4", children: "Bank integration requires actual Plaid or Yodlee API keys to be configured." }), _jsx("p", { className: "text-sm text-gray-400", children: "Contact your administrator to set up bank connections." })] })) })] }), selectedInstitution && (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Account Name" }), _jsx(Input, { value: connectionForm.accountName, onChange: (e) => setConnectionForm(prev => ({ ...prev, accountName: e.target.value })), placeholder: "Business Checking" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Account Type" }), _jsxs(Select, { value: connectionForm.accountType, onValueChange: (value) => setConnectionForm(prev => ({ ...prev, accountType: value })), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "checking", children: "Checking" }), _jsx(SelectItem, { value: "savings", children: "Savings" }), _jsx(SelectItem, { value: "business_checking", children: "Business Checking" }), _jsx(SelectItem, { value: "business_savings", children: "Business Savings" })] })] })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Account Number" }), _jsx(Input, { value: connectionForm.accountNumber, onChange: (e) => setConnectionForm(prev => ({ ...prev, accountNumber: e.target.value })), placeholder: "1234567890" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Routing Number" }), _jsx(Input, { value: connectionForm.routingNumber, onChange: (e) => setConnectionForm(prev => ({ ...prev, routingNumber: e.target.value })), placeholder: "021000021" })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Username" }), _jsx(Input, { value: connectionForm.username, onChange: (e) => setConnectionForm(prev => ({ ...prev, username: e.target.value })), placeholder: "Your bank username" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Password" }), _jsx(Input, { type: "password", value: connectionForm.password, onChange: (e) => setConnectionForm(prev => ({ ...prev, password: e.target.value })), placeholder: "Your bank password" })] })] })] })), _jsx(Button, { onClick: createConnection, disabled: isCreatingConnection || !selectedInstitution, className: "w-full", children: isCreatingConnection ? 'Connecting...' : 'Connect Bank Account' })] })] }) }), stats && (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsx(Card, { children: _jsxs(CardContent, { className: "p-6", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Building2, { className: "w-5 h-5 text-blue-600" }), _jsx("span", { className: "text-sm font-medium", children: "Total Connections" })] }), _jsx("div", { className: "text-2xl font-bold text-blue-600", children: stats.totalConnections }), _jsxs("div", { className: "text-xs text-muted-foreground mt-1", children: [stats.activeConnections, " active"] })] }) }), _jsx(Card, { children: _jsxs(CardContent, { className: "p-6", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(CheckCircle, { className: "w-5 h-5 text-green-600" }), _jsx("span", { className: "text-sm font-medium", children: "Active Connections" })] }), _jsx("div", { className: "text-2xl font-bold text-green-600", children: stats.activeConnections }), _jsxs("div", { className: "text-xs text-muted-foreground mt-1", children: [stats.errorConnections, " errors"] })] }) }), _jsx(Card, { children: _jsxs(CardContent, { className: "p-6", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(BarChart3, { className: "w-5 h-5 text-purple-600" }), _jsx("span", { className: "text-sm font-medium", children: "Total Accounts" })] }), _jsx("div", { className: "text-2xl font-bold text-purple-600", children: stats.totalAccounts }), _jsx("div", { className: "text-xs text-muted-foreground mt-1", children: "Connected accounts" })] }) }), _jsx(Card, { children: _jsxs(CardContent, { className: "p-6", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(TrendingUp, { className: "w-5 h-5 text-orange-600" }), _jsx("span", { className: "text-sm font-medium", children: "Transactions" })] }), _jsx("div", { className: "text-2xl font-bold text-orange-600", children: stats.totalTransactions }), _jsx("div", { className: "text-xs text-muted-foreground mt-1", children: "Synced transactions" })] }) })] })), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Link, { className: "w-5 h-5 text-blue-600" }), "Bank Connections"] }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: connections.length === 0 ? (_jsxs("div", { className: "text-center py-8", children: [_jsx(Building2, { className: "w-12 h-12 text-gray-400 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "No Bank Connections" }), _jsx("p", { className: "text-gray-500 mb-4", children: "Connect your bank accounts to start syncing transactions automatically." }), _jsxs(Button, { onClick: () => setIsConnectionDialogOpen(true), children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), "Connect Your First Bank"] })] })) : (connections.map((connection) => (_jsxs("div", { className: "flex items-center justify-between p-4 border rounded-lg", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center", children: _jsx(Building2, { className: "w-5 h-5 text-blue-600" }) }), _jsxs("div", { children: [_jsx("div", { className: "font-medium", children: connection.bankName }), _jsxs("div", { className: "text-sm text-muted-foreground", children: [connection.accountName, " \u2022 ", connection.accountType, " \u2022 ****", connection.accountNumber.slice(-4)] })] })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsxs("div", { className: "text-right", children: [_jsxs("div", { className: "flex items-center gap-2", children: [getStatusIcon(connection.status), _jsx(Badge, { className: getStatusColor(connection.status), children: connection.status })] }), _jsx("div", { className: "text-xs text-muted-foreground mt-1", children: connection.lastSyncAt ?
                                                            `Last sync: ${new Date(connection.lastSyncAt).toLocaleDateString()}` :
                                                            'Never synced' })] }), _jsxs("div", { className: "flex gap-2", children: [connection.status === 'active' && (_jsx(Button, { size: "sm", variant: "outline", onClick: () => syncConnection(connection.id), children: _jsx(RefreshCw, { className: "w-4 h-4" }) })), connection.status === 'error' && (_jsx(Button, { size: "sm", variant: "outline", onClick: () => reconnectConnection(connection.id), children: _jsx(Link, { className: "w-4 h-4" }) })), _jsx(Button, { size: "sm", variant: "outline", onClick: () => disconnectConnection(connection.id), children: _jsx(Unlink, { className: "w-4 h-4" }) })] })] })] }, connection.id)))) }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Building2, { className: "w-5 h-5 text-green-600" }), "Supported Banks"] }) }), _jsx(CardContent, { children: institutions.length > 0 ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4", children: institutions.slice(0, 8).map((institution) => (_jsxs("div", { className: "flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50", children: [institution.logo && (_jsx("img", { src: institution.logo, alt: institution.name, className: "w-8 h-8" })), _jsxs("div", { children: [_jsx("div", { className: "font-medium text-sm", children: institution.name }), _jsx("div", { className: "text-xs text-muted-foreground", children: institution.country })] })] }, institution.id))) }), _jsx("div", { className: "mt-4 text-center", children: _jsx("p", { className: "text-sm text-muted-foreground", children: "And 10,000+ more banks worldwide through Plaid and Yodlee" }) })] })) : (_jsxs("div", { className: "text-center py-8", children: [_jsx(Building2, { className: "w-16 h-16 text-gray-400 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "Bank Integration Not Configured" }), _jsx("p", { className: "text-gray-500 mb-4", children: "To connect bank accounts, your administrator needs to configure Plaid or Yodlee API keys." }), _jsxs("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-4 text-left", children: [_jsx("h4", { className: "font-medium text-blue-900 mb-2", children: "Required Setup:" }), _jsxs("ul", { className: "text-sm text-blue-800 space-y-1", children: [_jsx("li", { children: "\u2022 Obtain Plaid or Yodlee API credentials" }), _jsx("li", { children: "\u2022 Configure environment variables (PLAID_CLIENT_ID, PLAID_SECRET, etc.)" }), _jsx("li", { children: "\u2022 Set up webhook endpoints for real-time updates" }), _jsx("li", { children: "\u2022 Test connections in sandbox environment" })] })] })] })) })] })] }));
}
