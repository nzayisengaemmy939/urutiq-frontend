import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useMutation } from "@tanstack/react-query";
import { expenseApi } from "../lib/api/accounting";
export function ReimburseExpenseModal({ open, onOpenChange, expenseId, defaultAmount }) {
    const [method, setMethod] = React.useState("bank_transfer");
    const [paidAmount, setPaidAmount] = React.useState(defaultAmount != null ? String(defaultAmount) : "");
    const [paidDate, setPaidDate] = React.useState(new Date().toISOString().slice(0, 10));
    const [reference, setReference] = React.useState("");
    React.useEffect(() => {
        if (defaultAmount != null)
            setPaidAmount(String(defaultAmount));
    }, [defaultAmount]);
    const reimburseMutation = useMutation({
        mutationFn: async () => {
            if (!expenseId)
                return;
            const amt = parseFloat(paidAmount || "0");
            await expenseApi.updateExpense(expenseId, { status: 'paid', totalAmount: amt, description: reference ? `Reimbursed: ${reference}` : undefined });
        },
        onSuccess: () => onOpenChange(false)
    });
    return (_jsx(Dialog, { open: open, onOpenChange: (v) => { if (!reimburseMutation.isPending)
            onOpenChange(v); }, children: _jsxs(DialogContent, { className: "max-w-md", children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { children: "Reimburse Expense" }) }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { children: "Payment Method" }), _jsxs(Select, { value: method, onValueChange: setMethod, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "bank_transfer", children: "Bank Transfer" }), _jsx(SelectItem, { value: "mobile_money", children: "Mobile Money" }), _jsx(SelectItem, { value: "cash", children: "Cash" }), _jsx(SelectItem, { value: "other", children: "Other" })] })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("div", { children: [_jsx(Label, { children: "Amount" }), _jsx(Input, { type: "number", step: "0.01", value: paidAmount, onChange: (e) => setPaidAmount(e.target.value) })] }), _jsxs("div", { children: [_jsx(Label, { children: "Date" }), _jsx(Input, { type: "date", value: paidDate, onChange: (e) => setPaidDate(e.target.value) })] })] }), _jsxs("div", { children: [_jsx(Label, { children: "Reference (optional)" }), _jsx(Input, { value: reference, onChange: (e) => setReference(e.target.value), placeholder: "e.g., TXN-12345" })] }), _jsxs("div", { className: "flex justify-end gap-2", children: [_jsx(Button, { variant: "outline", onClick: () => onOpenChange(false), disabled: reimburseMutation.isPending, children: "Cancel" }), _jsx(Button, { onClick: () => reimburseMutation.mutate(), disabled: !expenseId || !paidAmount || reimburseMutation.isPending, children: reimburseMutation.isPending ? 'Processing...' : 'Mark as Paid' })] })] })] }) }));
}
