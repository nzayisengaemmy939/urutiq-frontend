import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { Button } from "../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Badge } from "../components/ui/badge";
import { CreditCard, ExternalLink, RefreshCw, CheckCircle, AlertCircle, Copy } from "lucide-react";
import apiService from '@/lib/api';
export function PaymentButton({ invoiceId, amount, currency, customerEmail, customerName, description, variant = 'default', size = 'default', showAmount = true, onPaymentSuccess, onPaymentError }) {
    const [loading, setLoading] = useState(false);
    const [paymentLink, setPaymentLink] = useState(null);
    const [showDialog, setShowDialog] = useState(false);
    const [error, setError] = useState(null);
    const formatCurrency = (amount, currency) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(amount);
    };
    const handleCreatePaymentLink = async () => {
        try {
            setLoading(true);
            setError(null);
            const paymentData = await apiService.createPaymentLink(invoiceId, {
                customerEmail,
                customerName,
                description: description || `Payment for Invoice ${invoiceId}`,
                expiresInMinutes: 1440 // 24 hours
            });
            setPaymentLink(paymentData.url);
            setShowDialog(true);
        }
        catch (err) {
            console.error('Error creating payment link:', err);
            const errorMessage = 'Failed to create payment link';
            setError(errorMessage);
            onPaymentError?.(errorMessage);
        }
        finally {
            setLoading(false);
        }
    };
    const handleDirectPayment = () => {
        if (paymentLink) {
            window.open(paymentLink, '_blank');
        }
    };
    const copyPaymentLink = async () => {
        if (paymentLink) {
            try {
                await navigator.clipboard.writeText(paymentLink);
                // Could add a toast notification here
            }
            catch (err) {
                console.error('Failed to copy link:', err);
            }
        }
    };
    const getButtonText = () => {
        if (loading) {
            return 'Creating Payment...';
        }
        if (showAmount) {
            return `Pay ${formatCurrency(amount, currency)}`;
        }
        return 'Pay Now';
    };
    const getButtonIcon = () => {
        if (loading) {
            return _jsx(RefreshCw, { className: "w-4 h-4 animate-spin" });
        }
        return _jsx(CreditCard, { className: "w-4 h-4" });
    };
    return (_jsxs(_Fragment, { children: [_jsxs(Button, { onClick: handleCreatePaymentLink, disabled: loading, variant: variant, size: size, className: "min-w-[120px]", children: [getButtonIcon(), _jsx("span", { className: "ml-2", children: getButtonText() })] }), _jsx(Dialog, { open: showDialog, onOpenChange: setShowDialog, children: _jsxs(DialogContent, { className: "max-w-md", children: [_jsx(DialogHeader, { children: _jsxs(DialogTitle, { className: "flex items-center gap-2", children: [_jsx(CreditCard, { className: "w-5 h-5" }), "Secure Payment"] }) }), _jsx("div", { className: "space-y-4", children: error ? (_jsxs("div", { className: "p-4 bg-red-50 border border-red-200 rounded-lg", children: [_jsxs("div", { className: "flex items-center gap-2 text-red-800", children: [_jsx(AlertCircle, { className: "w-5 h-5" }), _jsx("span", { className: "font-medium", children: "Payment Error" })] }), _jsx("p", { className: "text-red-700 mt-1", children: error })] })) : paymentLink ? (_jsxs(_Fragment, { children: [_jsxs("div", { className: "p-4 bg-green-50 border border-green-200 rounded-lg", children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx(CheckCircle, { className: "w-5 h-5 text-green-600" }), _jsx("span", { className: "font-medium text-green-800", children: "Payment Link Ready" })] }), _jsx("p", { className: "text-green-700 text-sm", children: "Click below to complete your payment securely." })] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between p-3 bg-gray-50 rounded-lg", children: [_jsxs("div", { children: [_jsx("div", { className: "font-medium", children: "Amount Due" }), _jsx("div", { className: "text-2xl font-bold text-gray-900", children: formatCurrency(amount, currency) })] }), _jsx(Badge, { variant: "outline", className: "text-green-600 border-green-600", children: "Secure Payment" })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs(Button, { onClick: handleDirectPayment, className: "w-full", size: "lg", children: [_jsx(ExternalLink, { className: "w-4 h-4 mr-2" }), "Pay Now - ", formatCurrency(amount, currency)] }), _jsxs(Button, { onClick: copyPaymentLink, variant: "outline", className: "w-full", children: [_jsx(Copy, { className: "w-4 h-4 mr-2" }), "Copy Payment Link"] })] }), _jsx("div", { className: "text-xs text-gray-500 text-center", children: "Payment link expires in 24 hours" })] })] })) : (_jsxs("div", { className: "text-center py-8", children: [_jsx(RefreshCw, { className: "w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" }), _jsx("p", { className: "text-gray-600", children: "Creating secure payment link..." })] })) })] }) })] }));
}
// Compact version for inline use
export function PaymentButtonCompact({ invoiceId, amount, currency, customerEmail, customerName, description, onPaymentSuccess, onPaymentError }) {
    return (_jsx(PaymentButton, { invoiceId: invoiceId, amount: amount, currency: currency, customerEmail: customerEmail, customerName: customerName, description: description, variant: "outline", size: "sm", showAmount: false, onPaymentSuccess: onPaymentSuccess, onPaymentError: onPaymentError }));
}
// Large prominent version
export function PaymentButtonProminent({ invoiceId, amount, currency, customerEmail, customerName, description, onPaymentSuccess, onPaymentError }) {
    return (_jsx(PaymentButton, { invoiceId: invoiceId, amount: amount, currency: currency, customerEmail: customerEmail, customerName: customerName, description: description, variant: "default", size: "lg", showAmount: true, onPaymentSuccess: onPaymentSuccess, onPaymentError: onPaymentError }));
}
