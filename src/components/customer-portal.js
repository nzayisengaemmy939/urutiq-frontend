import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Label } from "../components/ui/label";
import { FileText, CreditCard, Download, CheckCircle, Clock, AlertCircle, ExternalLink, RefreshCw } from "lucide-react";
import apiService from '@/lib/api';
export function CustomerPortal({ invoiceId, customerEmail, onPaymentSuccess }) {
    const [invoice, setInvoice] = useState(null);
    const [paymentStatus, setPaymentStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [error, setError] = useState(null);
    const [paymentLink, setPaymentLink] = useState(null);
    useEffect(() => {
        loadInvoiceData();
    }, [invoiceId]);
    const loadInvoiceData = async () => {
        try {
            setLoading(true);
            setError(null);
            // Load invoice details
            const invoiceData = await apiService.get(`/invoices/${invoiceId}`);
            setInvoice(invoiceData);
            // Load payment status
            const statusData = await apiService.getPaymentStatus(invoiceId);
            setPaymentStatus(statusData);
        }
        catch (err) {
            console.error('Error loading invoice:', err);
            setError('Failed to load invoice details');
        }
        finally {
            setLoading(false);
        }
    };
    const handleCreatePaymentLink = async () => {
        try {
            setPaymentLoading(true);
            setError(null);
            const paymentData = await apiService.createPaymentLink(invoiceId, {
                customerEmail: customerEmail || invoice?.customer?.email,
                customerName: invoice?.customer?.name,
                description: `Payment for Invoice ${invoice?.invoiceNumber}`,
                expiresInMinutes: 1440 // 24 hours
            });
            setPaymentLink(paymentData.url);
        }
        catch (err) {
            console.error('Error creating payment link:', err);
            setError('Failed to create payment link');
        }
        finally {
            setPaymentLoading(false);
        }
    };
    const handleDownloadPDF = async () => {
        try {
            const blob = await apiService.getInvoicePdf(invoiceId);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `invoice-${invoice?.invoiceNumber || invoiceId}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        }
        catch (err) {
            console.error('Error downloading PDF:', err);
            setError('Failed to download PDF');
        }
    };
    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'paid': return 'text-green-600 bg-green-100';
            case 'sent': return 'text-blue-600 bg-blue-100';
            case 'draft': return 'text-gray-600 bg-gray-100';
            case 'overdue': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };
    const getStatusIcon = (status) => {
        switch (status.toLowerCase()) {
            case 'paid': return _jsx(CheckCircle, { className: "w-4 h-4 text-green-600" });
            case 'sent': return _jsx(Clock, { className: "w-4 h-4 text-blue-600" });
            case 'draft': return _jsx(FileText, { className: "w-4 h-4 text-gray-600" });
            case 'overdue': return _jsx(AlertCircle, { className: "w-4 h-4 text-red-600" });
            default: return _jsx(FileText, { className: "w-4 h-4 text-gray-600" });
        }
    };
    const formatCurrency = (amount, currency) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(amount);
    };
    if (loading) {
        return (_jsx("div", { className: "max-w-4xl mx-auto p-6", children: _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "animate-pulse", children: [_jsx("div", { className: "h-8 bg-gray-200 rounded w-1/3 mb-4" }), _jsx("div", { className: "h-4 bg-gray-200 rounded w-1/2 mb-2" }), _jsx("div", { className: "h-4 bg-gray-200 rounded w-1/4" })] }), _jsx("div", { className: "animate-pulse", children: _jsx("div", { className: "h-64 bg-gray-200 rounded" }) })] }) }));
    }
    if (error || !invoice) {
        return (_jsx("div", { className: "max-w-4xl mx-auto p-6", children: _jsx(Card, { children: _jsxs(CardContent, { className: "p-6 text-center", children: [_jsx(AlertCircle, { className: "w-12 h-12 text-red-500 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-2", children: "Error Loading Invoice" }), _jsx("p", { className: "text-gray-600 mb-4", children: error || 'Invoice not found' }), _jsxs(Button, { onClick: loadInvoiceData, variant: "outline", children: [_jsx(RefreshCw, { className: "w-4 h-4 mr-2" }), "Try Again"] })] }) }) }));
    }
    return (_jsxs("div", { className: "max-w-4xl mx-auto p-6 space-y-6", children: [_jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { children: [_jsxs("h1", { className: "text-3xl font-bold text-gray-900", children: ["Invoice ", invoice.invoiceNumber] }), _jsxs("p", { className: "text-gray-600 mt-1", children: ["Issued on ", new Date(invoice.issueDate).toLocaleDateString(), invoice.dueDate && (_jsxs("span", { className: "ml-2", children: ["\u2022 Due ", new Date(invoice.dueDate).toLocaleDateString()] }))] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [getStatusIcon(invoice.status), _jsx(Badge, { className: getStatusColor(invoice.status), children: invoice.status })] })] }), paymentStatus && (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(CreditCard, { className: "w-5 h-5" }), "Payment Information"] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { className: "text-sm font-medium text-gray-500", children: "Total Amount" }), _jsx("div", { className: "text-2xl font-bold text-gray-900", children: formatCurrency(paymentStatus.totalAmount, invoice.currency) })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-sm font-medium text-gray-500", children: "Balance Due" }), _jsx("div", { className: `text-2xl font-bold ${paymentStatus.balanceDue > 0 ? 'text-red-600' : 'text-green-600'}`, children: formatCurrency(paymentStatus.balanceDue, invoice.currency) })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-sm font-medium text-gray-500", children: "Payment Status" }), _jsx("div", { className: "text-lg font-semibold capitalize", children: paymentStatus.paymentStatus }), paymentStatus.lastPaymentDate && (_jsxs("div", { className: "text-sm text-gray-500", children: ["Last payment: ", new Date(paymentStatus.lastPaymentDate).toLocaleDateString()] }))] })] }) })] })), paymentStatus && paymentStatus.balanceDue > 0 && (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Pay Invoice" }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: paymentLink ? (_jsxs("div", { className: "p-4 bg-green-50 border border-green-200 rounded-lg", children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx(CheckCircle, { className: "w-5 h-5 text-green-600" }), _jsx("span", { className: "font-medium text-green-800", children: "Payment Link Created" })] }), _jsx("p", { className: "text-green-700 mb-3", children: "Click the button below to complete your payment securely." }), _jsxs(Button, { onClick: () => window.open(paymentLink, '_blank'), className: "w-full", children: [_jsx(ExternalLink, { className: "w-4 h-4 mr-2" }), "Pay Now - ", formatCurrency(paymentStatus.balanceDue, invoice.currency)] })] })) : (_jsxs("div", { className: "space-y-3", children: [_jsx("p", { className: "text-gray-600", children: "Pay your invoice securely using your credit card, debit card, or bank account." }), _jsx(Button, { onClick: handleCreatePaymentLink, disabled: paymentLoading, className: "w-full", children: paymentLoading ? (_jsxs(_Fragment, { children: [_jsx(RefreshCw, { className: "w-4 h-4 mr-2 animate-spin" }), "Creating Payment Link..."] })) : (_jsxs(_Fragment, { children: [_jsx(CreditCard, { className: "w-4 h-4 mr-2" }), "Pay ", formatCurrency(paymentStatus.balanceDue, invoice.currency)] })) })] })) }) })] })), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(FileText, { className: "w-5 h-5" }), "Invoice Details"] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [invoice.customer && (_jsxs("div", { children: [_jsx(Label, { className: "text-sm font-medium text-gray-500", children: "Bill To" }), _jsxs("div", { className: "mt-1", children: [_jsx("div", { className: "font-medium", children: invoice.customer.name }), invoice.customer.email && (_jsx("div", { className: "text-gray-600", children: invoice.customer.email }))] })] })), invoice.lines && invoice.lines.length > 0 && (_jsxs("div", { children: [_jsx(Label, { className: "text-sm font-medium text-gray-500 mb-3 block", children: "Items" }), _jsx("div", { className: "space-y-2", children: invoice.lines.map((line, index) => (_jsxs("div", { className: "flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0", children: [_jsxs("div", { className: "flex-1", children: [_jsx("div", { className: "font-medium", children: line.description }), _jsxs("div", { className: "text-sm text-gray-500", children: [line.quantity, " \u00D7 ", formatCurrency(line.unitPrice, invoice.currency)] })] }), _jsx("div", { className: "font-medium", children: formatCurrency(line.lineTotal, invoice.currency) })] }, index))) })] })), _jsx("div", { className: "pt-4 border-t border-gray-200", children: _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-lg font-medium", children: "Total" }), _jsx("span", { className: "text-2xl font-bold", children: formatCurrency(invoice.totalAmount, invoice.currency) })] }) })] }) })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsxs(Button, { variant: "outline", onClick: handleDownloadPDF, children: [_jsx(Download, { className: "w-4 h-4 mr-2" }), "Download PDF"] }), paymentStatus && paymentStatus.balanceDue === 0 && (_jsxs("div", { className: "flex items-center gap-2 text-green-600", children: [_jsx(CheckCircle, { className: "w-5 h-5" }), _jsx("span", { className: "font-medium", children: "Invoice Paid" })] }))] }), error && (_jsx(Card, { className: "border-red-200 bg-red-50", children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center gap-2 text-red-800", children: [_jsx(AlertCircle, { className: "w-5 h-5" }), _jsx("span", { children: error })] }) }) }))] }));
}
