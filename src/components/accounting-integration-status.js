import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { CheckCircle, AlertCircle, Clock, RefreshCw } from 'lucide-react';
import { apiService } from '../lib/api';
export function AccountingIntegrationStatus({ invoiceId, invoiceNumber }) {
    const [accountingData, setAccountingData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const fetchAccountingData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [journalEntries, inventoryMovements] = await Promise.all([
                apiService.getInvoiceAccountingEntries(invoiceId),
                apiService.getInvoiceInventoryMovements(invoiceId)
            ]);
            setAccountingData({
                journalEntries,
                inventoryMovements
            });
        }
        catch (err) {
            setError(err.message || 'Failed to fetch accounting data');
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchAccountingData();
    }, [invoiceId]);
    const hasAccountingData = accountingData && (accountingData.journalEntries.length > 0 ||
        accountingData.inventoryMovements.length > 0);
    const getStatusIcon = () => {
        if (loading)
            return _jsx(RefreshCw, { className: "w-4 h-4 animate-spin" });
        if (error)
            return _jsx(AlertCircle, { className: "w-4 h-4 text-red-500" });
        if (hasAccountingData)
            return _jsx(CheckCircle, { className: "w-4 h-4 text-green-500" });
        return _jsx(Clock, { className: "w-4 h-4 text-yellow-500" });
    };
    const getStatusText = () => {
        if (loading)
            return 'Loading...';
        if (error)
            return 'Error loading data';
        if (hasAccountingData)
            return 'Accounting integrated';
        return 'No accounting data';
    };
    const getStatusVariant = () => {
        if (loading)
            return 'secondary';
        if (error)
            return 'destructive';
        if (hasAccountingData)
            return 'default';
        return 'secondary';
    };
    return (_jsxs(Card, { className: "w-full", children: [_jsx(CardHeader, { className: "pb-3", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Accounting Integration" }), _jsx(Button, { variant: "ghost", size: "sm", onClick: fetchAccountingData, disabled: loading, className: "h-6 w-6 p-0", children: _jsx(RefreshCw, { className: `w-3 h-3 ${loading ? 'animate-spin' : ''}` }) })] }) }), _jsx(CardContent, { className: "pt-0", children: _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center gap-2", children: [getStatusIcon(), _jsx(Badge, { variant: getStatusVariant(), children: getStatusText() })] }), accountingData && (_jsxs("div", { className: "space-y-2 text-xs text-muted-foreground", children: [accountingData.journalEntries.length > 0 && (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(CheckCircle, { className: "w-3 h-3 text-green-500" }), _jsxs("span", { children: [accountingData.journalEntries.length, " journal entries created"] })] })), accountingData.inventoryMovements.length > 0 && (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(CheckCircle, { className: "w-3 h-3 text-green-500" }), _jsxs("span", { children: [accountingData.inventoryMovements.length, " inventory movements recorded"] })] }))] })), error && (_jsx("div", { className: "text-xs text-red-500", children: error?.message || error?.toString() || 'Unknown error' })), !hasAccountingData && !loading && !error && (_jsx("div", { className: "text-xs text-muted-foreground", children: "Mark invoice as paid to create accounting entries" }))] }) })] }));
}
