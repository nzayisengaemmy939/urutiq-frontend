import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { useToast } from "../hooks/use-toast";
import { apiService } from '@/lib/api';
import { bankingApi } from '@/lib/api/banking';
export function PaymentForm({ transactionId, transactionType, amount, onSuccess, trigger }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [bankAccounts, setBankAccounts] = useState([]);
    const [formData, setFormData] = useState({
        method: 'cash',
        bankAccountId: '',
        reference: '',
        amount: amount.toString(),
        paymentDate: new Date().toISOString().split('T')[0]
    });
    const [errors, setErrors] = useState({});
    const { toast } = useToast();
    useEffect(() => {
        if (open) {
            loadBankAccounts();
        }
    }, [open]);
    const loadBankAccounts = async () => {
        try {
            const companyId = localStorage.getItem('company_id') || localStorage.getItem('companyId') || 'seed-company-1';
            const accounts = await bankingApi.getBankAccounts(companyId);
            setBankAccounts(accounts);
        }
        catch (error) {
            console.error('Error loading bank accounts:', error);
            toast({
                title: "Error",
                description: "Failed to load bank accounts",
                variant: "destructive"
            });
        }
    };
    const validateForm = () => {
        const newErrors = {};
        if (!formData.method) {
            newErrors.method = 'Payment method is required';
        }
        if (formData.method === 'check' || formData.method === 'bank_transfer') {
            if (!formData.bankAccountId) {
                newErrors.bankAccountId = 'Bank account is required for this payment method';
            }
        }
        if (!formData.amount || parseFloat(formData.amount) <= 0) {
            newErrors.amount = 'Amount must be greater than 0';
        }
        if (!formData.paymentDate) {
            newErrors.paymentDate = 'Payment date is required';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }
        setLoading(true);
        try {
            const companyId = localStorage.getItem('company_id') || localStorage.getItem('companyId') || 'seed-company-1';
            const paymentData = {
                companyId,
                transactionId,
                method: formData.method,
                reference: formData.reference,
                amount: parseFloat(formData.amount),
                paymentDate: formData.paymentDate,
                bankAccountId: formData.method === 'check' || formData.method === 'bank_transfer' ? formData.bankAccountId : undefined
            };
            await apiService.post('/payments', paymentData);
            toast({
                title: "Payment Recorded",
                description: `Payment of $${formData.amount} has been recorded successfully.`,
            });
            setOpen(false);
            setFormData({
                method: 'cash',
                bankAccountId: '',
                reference: '',
                amount: amount.toString(),
                paymentDate: new Date().toISOString().split('T')[0]
            });
            setErrors({});
            if (onSuccess) {
                onSuccess();
            }
        }
        catch (error) {
            console.error('Error creating payment:', error);
            toast({
                title: "Error",
                description: error.message || "Failed to record payment",
                variant: "destructive"
            });
        }
        finally {
            setLoading(false);
        }
    };
    const handleMethodChange = (method) => {
        setFormData(prev => ({ ...prev, method, bankAccountId: '' }));
        setErrors(prev => ({ ...prev, bankAccountId: '' }));
    };
    return (_jsxs(Dialog, { open: open, onOpenChange: setOpen, children: [_jsx(DialogTrigger, { asChild: true, children: trigger || (_jsx(Button, { variant: "outline", size: "sm", children: "Record Payment" })) }), _jsxs(DialogContent, { className: "sm:max-w-md", children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { children: "Record Payment" }) }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "method", children: "Payment Method" }), _jsxs(Select, { value: formData.method, onValueChange: handleMethodChange, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select payment method" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "cash", children: "Cash" }), _jsx(SelectItem, { value: "check", children: "Check" }), _jsx(SelectItem, { value: "bank_transfer", children: "Bank Transfer" }), _jsx(SelectItem, { value: "credit_card", children: "Credit Card" }), _jsx(SelectItem, { value: "debit_card", children: "Debit Card" }), _jsx(SelectItem, { value: "other", children: "Other" })] })] }), errors.method && _jsx("p", { className: "text-sm text-red-500", children: errors.method })] }), (formData.method === 'check' || formData.method === 'bank_transfer') && (_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "bankAccountId", children: "Bank Account" }), _jsxs(Select, { value: formData.bankAccountId, onValueChange: (value) => setFormData(prev => ({ ...prev, bankAccountId: value })), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select bank account" }) }), _jsx(SelectContent, { children: bankAccounts.map((account) => (_jsxs(SelectItem, { value: account.id, children: [account.bankName, " - ", account.accountNumber, " (", account.accountType, ")"] }, account.id))) })] }), errors.bankAccountId && _jsx("p", { className: "text-sm text-red-500", children: errors.bankAccountId })] })), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "amount", children: "Amount" }), _jsx(Input, { id: "amount", type: "number", step: "0.01", value: formData.amount, onChange: (e) => setFormData(prev => ({ ...prev, amount: e.target.value })), placeholder: "0.00" }), errors.amount && _jsx("p", { className: "text-sm text-red-500", children: errors.amount })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "reference", children: "Reference/Check Number" }), _jsx(Input, { id: "reference", value: formData.reference, onChange: (e) => setFormData(prev => ({ ...prev, reference: e.target.value })), placeholder: "Optional reference or check number" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "paymentDate", children: "Payment Date" }), _jsx(Input, { id: "paymentDate", type: "date", value: formData.paymentDate, onChange: (e) => setFormData(prev => ({ ...prev, paymentDate: e.target.value })) }), errors.paymentDate && _jsx("p", { className: "text-sm text-red-500", children: errors.paymentDate })] }), _jsxs("div", { className: "flex justify-end space-x-2 pt-4", children: [_jsx(Button, { type: "button", variant: "outline", onClick: () => setOpen(false), children: "Cancel" }), _jsx(Button, { type: "submit", disabled: loading, children: loading ? 'Recording...' : 'Record Payment' })] })] })] })] }));
}
