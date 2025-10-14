import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { useMutation, useQuery } from "@tanstack/react-query";
import { expenseApi } from "../lib/api/accounting";
export function EditExpenseModal({ open, onOpenChange, expense }) {
    const [description, setDescription] = React.useState("");
    const [amount, setAmount] = React.useState("");
    const [date, setDate] = React.useState("");
    const [department, setDepartment] = React.useState("");
    const [project, setProject] = React.useState("");
    const [categoryId, setCategoryId] = React.useState("");
    const { data: categories } = useQuery({
        queryKey: ['expense-categories'],
        queryFn: async () => expenseApi.getExpenseCategories()
    });
    React.useEffect(() => {
        if (expense) {
            setDescription(expense.description || '');
            setAmount(String(expense.totalAmount ?? expense.amount ?? ''));
            setDate(String(expense.expenseDate || '').slice(0, 10));
            setDepartment(String(expense.department || ''));
            setProject(String(expense.project || ''));
            setCategoryId(String(expense.categoryId || expense.category?.id || ''));
        }
    }, [expense]);
    const updateMutation = useMutation({
        mutationFn: async () => {
            if (!expense)
                return;
            const amt = parseFloat(amount || '0');
            await expenseApi.updateExpense(expense.id, {
                description,
                expenseDate: date,
                department: department || undefined,
                project: project || undefined,
                categoryId: categoryId || undefined,
                totalAmount: isFinite(amt) ? amt : undefined,
            });
        },
        onSuccess: () => onOpenChange(false)
    });
    return (_jsx(Dialog, { open: open, onOpenChange: (v) => { if (!updateMutation.isPending)
            onOpenChange(v); }, children: _jsxs(DialogContent, { className: "max-w-lg", children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { children: "Edit Expense" }) }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { children: "Description" }), _jsx(Textarea, { value: description, onChange: (e) => setDescription(e.target.value) })] }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("div", { children: [_jsx(Label, { children: "Amount" }), _jsx(Input, { type: "number", step: "0.01", value: amount, onChange: (e) => setAmount(e.target.value) })] }), _jsxs("div", { children: [_jsx(Label, { children: "Date" }), _jsx(Input, { type: "date", value: date, onChange: (e) => setDate(e.target.value) })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("div", { children: [_jsx(Label, { children: "Department" }), _jsx(Input, { value: department, onChange: (e) => setDepartment(e.target.value) })] }), _jsxs("div", { children: [_jsx(Label, { children: "Project" }), _jsx(Input, { value: project, onChange: (e) => setProject(e.target.value) })] })] }), _jsxs("div", { children: [_jsx(Label, { children: "Category" }), _jsxs(Select, { value: categoryId, onValueChange: setCategoryId, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select category" }) }), _jsx(SelectContent, { children: (categories || []).map((c) => (_jsx(SelectItem, { value: c.id, children: c.name }, c.id))) })] })] }), _jsxs("div", { className: "flex justify-end gap-2", children: [_jsx(Button, { variant: "outline", onClick: () => onOpenChange(false), disabled: updateMutation.isPending, children: "Cancel" }), _jsx(Button, { onClick: () => updateMutation.mutate(), disabled: updateMutation.isPending, children: updateMutation.isPending ? 'Saving...' : 'Save' })] })] })] }) }));
}
