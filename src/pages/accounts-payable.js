import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { PageLayout } from '../components/page-layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { CreditCard, DollarSign, FileText, CheckCircle, AlertCircle, Eye, RefreshCw, Loader2, Clock } from 'lucide-react';
import { toast } from 'sonner';
import apiService from '../lib/api';
import { purchaseApi } from '../lib/api/accounting';
import { getCompanyId } from '../lib/config';
export default function AccountsPayablePage() {
    const [companyId, setCompanyId] = useState(getCompanyId());
    const [bills, setBills] = useState([]);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    // Payment form state
    const [showPaymentDialog, setShowPaymentDialog] = useState(false);
    const [selectedBill, setSelectedBill] = useState(null);
    const [paymentForm, setPaymentForm] = useState({
        billId: '',
        amount: 0,
        paymentMethod: 'bank_transfer',
        notes: ''
    });
    // Listen for company changes from header
    useEffect(() => {
        const handleStorageChange = () => {
            const newCompanyId = getCompanyId();
            if (newCompanyId && newCompanyId !== companyId) {
                console.log('🔄 Accounts Payable page - Company changed from', companyId, 'to', newCompanyId);
                setCompanyId(newCompanyId);
                loadBills();
                loadPayments();
            }
        };
        const handleCompanyChange = (e) => {
            const newCompanyId = e.detail.companyId;
            if (newCompanyId && newCompanyId !== companyId) {
                console.log('🔄 Accounts Payable page - Company changed via custom event from', companyId, 'to', newCompanyId);
                setCompanyId(newCompanyId);
                loadBills();
                loadPayments();
            }
        };
        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('companyChanged', handleCompanyChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('companyChanged', handleCompanyChange);
        };
    }, [companyId]);
    // Load bills on component mount
    useEffect(() => {
        loadBills();
        loadPayments();
    }, [companyId]);
    const loadBills = async () => {
        try {
            setLoading(true);
            const { bills } = await purchaseApi.getBills(companyId, undefined, 1, 50);
            setBills(bills || []);
        }
        catch (error) {
            console.error('Error loading bills:', error);
            setError('Failed to load bills');
        }
        finally {
            setLoading(false);
        }
    };
    const loadPayments = async () => {
        try {
            // This would need to be implemented in the API
            // For now, we'll use a placeholder
            setPayments([]);
        }
        catch (error) {
            console.error('Error loading payments:', error);
        }
    };
    const handlePaymentClick = (bill) => {
        setSelectedBill(bill);
        setPaymentForm({
            billId: bill.id,
            amount: bill.balanceDue,
            paymentMethod: 'bank_transfer',
            notes: ''
        });
        setShowPaymentDialog(true);
    };
    const handlePaymentSubmit = async () => {
        try {
            setLoading(true);
            const result = await apiService.processPayment({
                billId: paymentForm.billId,
                amount: paymentForm.amount,
                paymentMethod: paymentForm.paymentMethod,
                notes: paymentForm.notes
            });
            toast.success('Payment processed successfully!', {
                description: `Payment of $${paymentForm.amount} recorded with journal entry ${result.journalEntry?.id || result.accountingEntries?.journalEntryId || 'N/A'}`
            });
            // Reload bills and payments
            await loadBills();
            await loadPayments();
            // Close dialog
            setShowPaymentDialog(false);
            setSelectedBill(null);
            setPaymentForm({
                billId: '',
                amount: 0,
                paymentMethod: 'bank_transfer',
                notes: ''
            });
        }
        catch (error) {
            console.error('Error processing payment:', error);
            toast.error('Failed to process payment', {
                description: 'Please try again later'
            });
        }
        finally {
            setLoading(false);
        }
    };
    const getStatusBadge = (status) => {
        switch (status) {
            case 'paid':
                return _jsxs(Badge, { variant: "default", className: "bg-green-100 text-green-800", children: [_jsx(CheckCircle, { className: "w-3 h-3 mr-1" }), "Paid"] });
            case 'partially_paid':
                return _jsxs(Badge, { variant: "secondary", children: [_jsx(AlertCircle, { className: "w-3 h-3 mr-1" }), "Partially Paid"] });
            case 'pending':
                return _jsxs(Badge, { variant: "outline", children: [_jsx(Clock, { className: "w-3 h-3 mr-1" }), "Pending"] });
            default:
                return _jsx(Badge, { variant: "outline", children: status });
        }
    };
    const getPaymentMethodIcon = (method) => {
        switch (method) {
            case 'bank_transfer':
                return _jsx(CreditCard, { className: "w-4 h-4" });
            case 'check':
                return _jsx(FileText, { className: "w-4 h-4" });
            case 'credit_card':
                return _jsx(CreditCard, { className: "w-4 h-4" });
            case 'cash':
                return _jsx(DollarSign, { className: "w-4 h-4" });
            default:
                return _jsx(CreditCard, { className: "w-4 h-4" });
        }
    };
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };
    const pendingBills = bills.filter(bill => bill.status !== 'paid');
    const paidBills = bills.filter(bill => bill.status === 'paid');
    const totalPending = pendingBills.reduce((sum, bill) => sum + bill.balanceDue, 0);
    const totalPaid = paidBills.reduce((sum, bill) => sum + bill.totalAmount, 0);
    return (_jsx(PageLayout, { title: "Accounts Payable", description: "Manage vendor payments and bills", children: _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Pending Bills" }), _jsx(AlertCircle, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: pendingBills.length }), _jsxs("p", { className: "text-xs text-muted-foreground", children: [formatCurrency(totalPending), " total due"] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Paid Bills" }), _jsx(CheckCircle, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: paidBills.length }), _jsxs("p", { className: "text-xs text-muted-foreground", children: [formatCurrency(totalPaid), " total paid"] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Total Bills" }), _jsx(FileText, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: bills.length }), _jsx("p", { className: "text-xs text-muted-foreground", children: "All bills this period" })] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Bills" }), _jsx("div", { className: "flex items-center space-x-2", children: _jsxs(Button, { onClick: loadBills, variant: "outline", size: "sm", children: [_jsx(RefreshCw, { className: "w-4 h-4 mr-2" }), "Refresh"] }) })] }), _jsx(CardContent, { children: loading ? (_jsxs("div", { className: "flex items-center justify-center py-8", children: [_jsx(Loader2, { className: "w-6 h-6 animate-spin" }), _jsx("span", { className: "ml-2", children: "Loading bills..." })] })) : (_jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { children: "Bill Number" }), _jsx(TableHead, { children: "Vendor" }), _jsx(TableHead, { children: "Amount" }), _jsx(TableHead, { children: "Balance Due" }), _jsx(TableHead, { children: "Status" }), _jsx(TableHead, { children: "Due Date" }), _jsx(TableHead, { children: "Actions" })] }) }), _jsx(TableBody, { children: bills.map((bill) => (_jsxs(TableRow, { children: [_jsx(TableCell, { className: "font-medium", children: bill.billNumber }), _jsx(TableCell, { children: bill.vendor.name }), _jsx(TableCell, { children: formatCurrency(bill.totalAmount) }), _jsx(TableCell, { children: formatCurrency(bill.balanceDue) }), _jsx(TableCell, { children: getStatusBadge(bill.status) }), _jsx(TableCell, { children: formatDate(bill.dueDate) }), _jsx(TableCell, { children: _jsxs("div", { className: "flex items-center space-x-2", children: [_jsxs(Button, { variant: "outline", size: "sm", onClick: () => handlePaymentClick(bill), disabled: bill.status === 'paid', children: [_jsx(CreditCard, { className: "w-4 h-4 mr-1" }), "Pay"] }), _jsx(Button, { variant: "outline", size: "sm", children: _jsx(Eye, { className: "w-4 h-4" }) })] }) })] }, bill.id))) })] })) })] }), _jsx(Dialog, { open: showPaymentDialog, onOpenChange: setShowPaymentDialog, children: _jsxs(DialogContent, { className: "sm:max-w-md", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Process Payment" }), _jsxs(DialogDescription, { children: ["Record payment for ", selectedBill?.vendor.name, " - ", selectedBill?.billNumber] })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "totalAmount", children: "Total Amount" }), _jsx(Input, { id: "totalAmount", value: formatCurrency(selectedBill?.totalAmount || 0), disabled: true })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "balanceDue", children: "Balance Due" }), _jsx(Input, { id: "balanceDue", value: formatCurrency(selectedBill?.balanceDue || 0), disabled: true })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "paymentAmount", children: "Payment Amount" }), _jsx(Input, { id: "paymentAmount", type: "number", step: "0.01", value: paymentForm.amount, onChange: (e) => setPaymentForm({
                                                    ...paymentForm,
                                                    amount: parseFloat(e.target.value) || 0
                                                }) })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "paymentMethod", children: "Payment Method" }), _jsxs(Select, { value: paymentForm.paymentMethod, onValueChange: (value) => setPaymentForm({
                                                    ...paymentForm,
                                                    paymentMethod: value
                                                }), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select payment method" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "bank_transfer", children: _jsxs("div", { className: "flex items-center", children: [_jsx(CreditCard, { className: "w-4 h-4 mr-2" }), "Bank Transfer"] }) }), _jsx(SelectItem, { value: "check", children: _jsxs("div", { className: "flex items-center", children: [_jsx(FileText, { className: "w-4 h-4 mr-2" }), "Check"] }) }), _jsx(SelectItem, { value: "credit_card", children: _jsxs("div", { className: "flex items-center", children: [_jsx(CreditCard, { className: "w-4 h-4 mr-2" }), "Credit Card"] }) }), _jsx(SelectItem, { value: "cash", children: _jsxs("div", { className: "flex items-center", children: [_jsx(DollarSign, { className: "w-4 h-4 mr-2" }), "Cash"] }) })] })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "notes", children: "Notes (Optional)" }), _jsx(Textarea, { id: "notes", placeholder: "Add payment notes...", value: paymentForm.notes, onChange: (e) => setPaymentForm({
                                                    ...paymentForm,
                                                    notes: e.target.value
                                                }) })] })] }), _jsxs(DialogFooter, { children: [_jsx(Button, { variant: "outline", onClick: () => setShowPaymentDialog(false), disabled: loading, children: "Cancel" }), _jsx(Button, { onClick: handlePaymentSubmit, disabled: loading || paymentForm.amount <= 0, children: loading ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "w-4 h-4 mr-2 animate-spin" }), "Processing..."] })) : (_jsxs(_Fragment, { children: [_jsx(CreditCard, { className: "w-4 h-4 mr-2" }), "Process Payment"] })) })] })] }) })] }) }));
}
