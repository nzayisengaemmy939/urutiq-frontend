import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
;
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import { Banknote, RefreshCw, Shield, TrendingUp, CheckCircle, Clock, Activity, Zap, Settings, Eye, Search } from 'lucide-react';
// Enhanced Bank Integration Component
export default function EnhancedBankIntegration() {
    const [selectedCompany, setSelectedCompany] = useState('seed-company-1');
    const [activeTab, setActiveTab] = useState('dashboard');
    const [connections, setConnections] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [stats, setStats] = useState(null);
    const [rules, setRules] = useState([]);
    const [selectedConnection, setSelectedConnection] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [syncResult, setSyncResult] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [showSettings, setShowSettings] = useState(false);
    const [config, setConfig] = useState({
        autoReconciliation: true,
        confidenceThreshold: 0.8,
        fraudDetectionEnabled: true,
        autoCategorization: true,
        realTimeSync: true,
        syncFrequency: 'daily',
        notificationSettings: {
            email: false,
            slack: false,
            webhook: ''
        }
    });
    const { toast } = useToast();
    // Load initial data
    useEffect(() => {
        loadConnections();
        loadStats();
        loadRules();
    }, [selectedCompany]);
    // Load bank connections
    const loadConnections = async () => {
        try {
            const response = await fetch(`/api/enhanced-bank-integration/connections/${selectedCompany}`);
            const data = await response.json();
            if (data.success) {
                setConnections(data.connections);
                if (data.connections.length > 0 && !selectedConnection) {
                    setSelectedConnection(data.connections[0].id);
                }
            }
        }
        catch (error) {
            toast({
                title: "Error",
                description: "Failed to load bank connections",
                variant: "destructive",
            });
        }
    };
    // Load bank integration statistics
    const loadStats = async () => {
        try {
            const response = await fetch(`/api/enhanced-bank-integration/stats/${selectedCompany}`);
            const data = await response.json();
            if (data.success) {
                setStats(data.stats);
            }
        }
        catch (error) {
            toast({
                title: "Error",
                description: "Failed to load bank integration statistics",
                variant: "destructive",
            });
        }
    };
    // Load reconciliation rules
    const loadRules = async () => {
        try {
            const response = await fetch(`/api/enhanced-bank-integration/rules/${selectedCompany}`);
            const data = await response.json();
            if (data.success) {
                setRules(data.rules);
            }
        }
        catch (error) {
            toast({
                title: "Error",
                description: "Failed to load reconciliation rules",
                variant: "destructive",
            });
        }
    };
    // Load transactions for selected connection
    const loadTransactions = async () => {
        if (!selectedConnection)
            return;
        try {
            const params = new URLSearchParams({
                page: '1',
                limit: '50',
                ...(filterStatus !== 'all' && { isReconciled: filterStatus === 'reconciled' ? 'true' : 'false' }),
                ...(searchTerm && { search: searchTerm })
            });
            const response = await fetch(`/api/enhanced-bank-integration/transactions/${selectedConnection}?${params}`);
            const data = await response.json();
            if (data.success) {
                setTransactions(data.transactions);
            }
        }
        catch (error) {
            toast({
                title: "Error",
                description: "Failed to load transactions",
                variant: "destructive",
            });
        }
    };
    // Trigger bank sync
    const triggerSync = async (connectionId) => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/enhanced-bank-integration/sync/${connectionId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ syncType: 'incremental' })
            });
            const data = await response.json();
            if (data.success) {
                setSyncResult(data.result);
                toast({
                    title: "Success",
                    description: `Sync completed: ${data.result.processedTransactions} transactions processed`,
                });
                loadConnections();
                loadStats();
            }
        }
        catch (error) {
            toast({
                title: "Error",
                description: "Failed to trigger sync",
                variant: "destructive",
            });
        }
        finally {
            setIsLoading(false);
        }
    };
    // Run reconciliation
    const runReconciliation = async () => {
        if (!selectedConnection)
            return;
        setIsLoading(true);
        try {
            const response = await fetch('/api/enhanced-bank-integration/reconcile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    connectionId: selectedConnection,
                    config
                })
            });
            const data = await response.json();
            if (data.success) {
                setSyncResult(data.result);
                toast({
                    title: "Success",
                    description: `Reconciliation completed: ${data.result.matchedTransactions} matched, ${data.result.unmatchedTransactions} unmatched`,
                });
                loadTransactions();
                loadStats();
            }
        }
        catch (error) {
            toast({
                title: "Error",
                description: "Failed to run reconciliation",
                variant: "destructive",
            });
        }
        finally {
            setIsLoading(false);
        }
    };
    // Auto-categorize transaction
    const autoCategorizeTransaction = async (transactionId) => {
        try {
            const response = await fetch(`/api/enhanced-bank-integration/auto-categorize/${transactionId}`, {
                method: 'POST'
            });
            const data = await response.json();
            if (data.success) {
                toast({
                    title: "Success",
                    description: `Transaction categorized as: ${data.category}`,
                });
                loadTransactions();
            }
        }
        catch (error) {
            toast({
                title: "Error",
                description: "Failed to auto-categorize transaction",
                variant: "destructive",
            });
        }
    };
    // Analyze fraud for transaction
    const analyzeFraud = async (transactionId) => {
        try {
            const response = await fetch(`/api/enhanced-bank-integration/fraud-analysis/${transactionId}`, {
                method: 'POST'
            });
            const data = await response.json();
            if (data.success) {
                toast({
                    title: "Fraud Analysis",
                    description: `Risk Level: ${data.analysis.riskLevel}, Fraud Score: ${(data.analysis.fraudScore * 100).toFixed(1)}%`,
                });
            }
        }
        catch (error) {
            toast({
                title: "Error",
                description: "Failed to analyze fraud",
                variant: "destructive",
            });
        }
    };
    // Get health status color
    const getHealthStatusColor = (status) => {
        switch (status) {
            case 'excellent': return 'text-green-600 bg-green-100';
            case 'good': return 'text-blue-600 bg-blue-100';
            case 'warning': return 'text-yellow-600 bg-yellow-100';
            case 'critical': return 'text-red-600 bg-red-100';
            case 'error': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };
    // Get risk level color
    const getRiskLevelColor = (level) => {
        switch (level) {
            case 'low': return 'text-green-600 bg-green-100';
            case 'medium': return 'text-yellow-600 bg-yellow-100';
            case 'high': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };
    return (_jsxs("div", { className: "container mx-auto p-6 space-y-6", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Enhanced Bank Integration" }), _jsx("p", { className: "text-gray-600 mt-2", children: "AI-powered real-time bank feed processing and reconciliation" })] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { variant: "outline", onClick: () => setShowSettings(!showSettings), children: [_jsx(Settings, { className: "w-4 h-4 mr-2" }), "Settings"] }), _jsxs(Button, { onClick: () => loadConnections(), children: [_jsx(RefreshCw, { className: "w-4 h-4 mr-2" }), "Refresh"] })] })] }), showSettings && (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Integration Settings" }), _jsx(CardDescription, { children: "Configure AI-powered bank integration features" })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Auto Reconciliation" }), _jsx(Switch, { checked: config.autoReconciliation, onCheckedChange: (checked) => setConfig({ ...config, autoReconciliation: checked }) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Fraud Detection" }), _jsx(Switch, { checked: config.fraudDetectionEnabled, onCheckedChange: (checked) => setConfig({ ...config, fraudDetectionEnabled: checked }) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Auto Categorization" }), _jsx(Switch, { checked: config.autoCategorization, onCheckedChange: (checked) => setConfig({ ...config, autoCategorization: checked }) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Real-time Sync" }), _jsx(Switch, { checked: config.realTimeSync, onCheckedChange: (checked) => setConfig({ ...config, realTimeSync: checked }) })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Confidence Threshold" }), _jsx(Input, { type: "number", min: "0", max: "1", step: "0.1", value: config.confidenceThreshold, onChange: (e) => setConfig({ ...config, confidenceThreshold: parseFloat(e.target.value) }) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Sync Frequency" }), _jsxs(Select, { value: config.syncFrequency, onValueChange: (value) => setConfig({ ...config, syncFrequency: value }), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "hourly", children: "Hourly" }), _jsx(SelectItem, { value: "daily", children: "Daily" }), _jsx(SelectItem, { value: "weekly", children: "Weekly" })] })] })] })] })] })), stats && (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Total Connections" }), _jsx(Banknote, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: stats.totalConnections }), _jsxs("p", { className: "text-xs text-muted-foreground", children: [stats.activeConnections, " active"] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Total Transactions" }), _jsx(Activity, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: stats.totalTransactions }), _jsxs("p", { className: "text-xs text-muted-foreground", children: [stats.reconciledTransactions, " reconciled"] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Pending Reconciliation" }), _jsx(Clock, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: stats.pendingReconciliation }), _jsxs("p", { className: "text-xs text-muted-foreground", children: [stats.fraudAlerts, " fraud alerts"] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Sync Success Rate" }), _jsx(TrendingUp, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: "text-2xl font-bold", children: [(stats.syncSuccessRate * 100).toFixed(1), "%"] }), _jsxs("p", { className: "text-xs text-muted-foreground", children: ["Last sync: ", stats.lastSyncTime ? new Date(stats.lastSyncTime).toLocaleDateString() : 'Never'] })] })] })] })), _jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, className: "space-y-4", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-4", children: [_jsx(TabsTrigger, { value: "dashboard", children: "Dashboard" }), _jsx(TabsTrigger, { value: "connections", children: "Connections" }), _jsx(TabsTrigger, { value: "transactions", children: "Transactions" }), _jsx(TabsTrigger, { value: "rules", children: "Rules" })] }), _jsx(TabsContent, { value: "dashboard", className: "space-y-4", children: _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Banknote, { className: "w-5 h-5" }), "Bank Connections"] }), _jsx(CardDescription, { children: "Active bank connections and their health status" })] }), _jsx(CardContent, { children: _jsx(ScrollArea, { className: "h-64", children: _jsx("div", { className: "space-y-3", children: connections.map((connection) => (_jsxs("div", { className: "flex items-center justify-between p-3 border rounded-lg", children: [_jsxs("div", { className: "flex-1", children: [_jsx("div", { className: "font-medium", children: connection.bankName }), _jsxs("div", { className: "text-sm text-gray-600", children: [connection.accountNumber, " \u2022 ", connection.accountType] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Badge, { className: getHealthStatusColor(connection.healthStatus), children: connection.healthStatus }), _jsx(Button, { size: "sm", variant: "outline", onClick: () => triggerSync(connection.id), disabled: isLoading, children: _jsx(RefreshCw, { className: "w-3 h-3" }) })] })] }, connection.id))) }) }) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Activity, { className: "w-5 h-5" }), "Recent Activity"] }), _jsx(CardDescription, { children: "Latest bank integration activities" })] }), _jsx(CardContent, { children: _jsx(ScrollArea, { className: "h-64", children: _jsx("div", { className: "space-y-3", children: syncResult && (_jsxs("div", { className: "p-3 border rounded-lg", children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx(CheckCircle, { className: "w-4 h-4 text-green-600" }), _jsx("span", { className: "font-medium", children: "Sync Completed" })] }), _jsxs("div", { className: "text-sm text-gray-600", children: ["Processed ", syncResult.processedTransactions, " transactions \u2022 ", syncResult.matchedTransactions, " matched \u2022 ", syncResult.unmatchedTransactions, " unmatched \u2022 ", syncResult.fraudAlerts, " fraud alerts"] }), _jsx("div", { className: "mt-2", children: _jsxs(Badge, { className: getRiskLevelColor(syncResult.summary.riskLevel), children: ["Risk: ", syncResult.summary.riskLevel] }) })] })) }) }) })] })] }) }), _jsx(TabsContent, { value: "connections", className: "space-y-4", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Bank Connections" }), _jsx(CardDescription, { children: "Manage your bank account connections" })] }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: connections.map((connection) => (_jsxs("div", { className: "border rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-semibold", children: connection.bankName }), _jsxs("p", { className: "text-sm text-gray-600", children: ["Account: ", connection.accountNumber, " \u2022 Type: ", connection.accountType] })] }), _jsx(Badge, { className: getHealthStatusColor(connection.healthStatus), children: connection.healthStatus })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "Status:" }), " ", connection.status] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "Type:" }), " ", connection.connectionType] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "Transactions:" }), " ", connection._count.bankTransactions] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "Last Sync:" }), " ", connection.lastSyncAt ? new Date(connection.lastSyncAt).toLocaleDateString() : 'Never'] })] }), _jsxs("div", { className: "flex gap-2 mt-3", children: [_jsxs(Button, { size: "sm", onClick: () => {
                                                                setSelectedConnection(connection.id);
                                                                setActiveTab('transactions');
                                                            }, children: [_jsx(Eye, { className: "w-4 h-4 mr-2" }), "View Transactions"] }), _jsxs(Button, { size: "sm", variant: "outline", onClick: () => triggerSync(connection.id), disabled: isLoading, children: [_jsx(RefreshCw, { className: "w-4 h-4 mr-2" }), "Sync Now"] })] })] }, connection.id))) }) })] }) }), _jsx(TabsContent, { value: "transactions", className: "space-y-4", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx(CardTitle, { children: "Bank Transactions" }), _jsx(CardDescription, { children: "AI-powered transaction processing and reconciliation" })] }), _jsxs(Button, { onClick: runReconciliation, disabled: !selectedConnection || isLoading, children: [_jsx(Zap, { className: "w-4 h-4 mr-2" }), "Run Reconciliation"] })] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex gap-4", children: [_jsx("div", { className: "flex-1", children: _jsx(Input, { placeholder: "Search transactions...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value) }) }), _jsxs(Select, { value: filterStatus, onValueChange: setFilterStatus, children: [_jsx(SelectTrigger, { className: "w-32", children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All" }), _jsx(SelectItem, { value: "reconciled", children: "Reconciled" }), _jsx(SelectItem, { value: "unreconciled", children: "Unreconciled" })] })] }), _jsx(Button, { variant: "outline", onClick: loadTransactions, children: _jsx(Search, { className: "w-4 h-4" }) })] }), _jsx(ScrollArea, { className: "h-96", children: _jsx("div", { className: "space-y-3", children: transactions.map((transaction) => (_jsxs("div", { className: "border rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "font-medium", children: transaction.merchantName || transaction.description }), _jsx(Badge, { variant: transaction.isReconciled ? "default" : "secondary", children: transaction.isReconciled ? "Reconciled" : "Unreconciled" })] }), _jsxs("div", { className: "text-right", children: [_jsxs("div", { className: "font-semibold", children: [transaction.transactionType === 'debit' ? '-' : '+', "$", Math.abs(transaction.amount).toFixed(2)] }), _jsx("div", { className: "text-sm text-gray-600", children: new Date(transaction.transactionDate).toLocaleDateString() })] })] }), transaction.aiInsights && (_jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm mb-3", children: [_jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "Risk Score:" }), " ", (transaction.aiInsights.riskScore * 100).toFixed(1), "%"] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "Fraud Score:" }), " ", (transaction.aiInsights.fraudScore * 100).toFixed(1), "%"] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "Confidence:" }), " ", (transaction.aiInsights.confidence * 100).toFixed(1), "%"] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "Category:" }), " ", transaction.aiInsights.suggestedCategory || 'Unknown'] })] })), _jsxs("div", { className: "flex gap-2", children: [!transaction.isReconciled && (_jsx(Button, { size: "sm", variant: "outline", onClick: () => autoCategorizeTransaction(transaction.id), children: "Auto-Categorize" })), _jsxs(Button, { size: "sm", variant: "outline", onClick: () => analyzeFraud(transaction.id), children: [_jsx(Shield, { className: "w-4 h-4 mr-2" }), "Fraud Analysis"] })] })] }, transaction.id))) }) })] }) })] }) }), _jsx(TabsContent, { value: "rules", className: "space-y-4", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Reconciliation Rules" }), _jsx(CardDescription, { children: "AI-powered rules for automatic transaction matching" })] }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: rules.map((rule) => (_jsxs("div", { className: "border rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-semibold", children: rule.name }), _jsx("p", { className: "text-sm text-gray-600", children: rule.description })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Badge, { variant: rule.isActive ? "default" : "secondary", children: rule.isActive ? "Active" : "Inactive" }), _jsxs(Badge, { variant: "outline", children: ["Priority: ", rule.priority] })] })] }), _jsxs("div", { className: "text-sm text-gray-600", children: [_jsxs("div", { children: ["Created by: ", rule.createdByUser.name] }), _jsxs("div", { children: ["Conditions: ", rule.conditions] }), _jsxs("div", { children: ["Actions: ", rule.actions] })] })] }, rule.id))) }) })] }) })] })] }));
}
