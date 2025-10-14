import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Plus, Trash2 } from "lucide-react";
export const TransactionForm = ({ type, initialData, onSubmit, onCancel, loading = false }) => {
    const [formData, setFormData] = useState({
        entityId: initialData?.entityId || '', // customerId or vendorId
        number: initialData?.number || '',
        date: initialData?.date || new Date().toISOString().split('T')[0],
        dueDate: initialData?.dueDate || '',
        notes: initialData?.notes || '',
        ...initialData
    });
    const [lineItems, setLineItems] = useState(initialData?.lines || [{ description: '', quantity: 1, unitPrice: 0, taxRate: 0, total: 0 }]);
    const updateLineItem = (index, field, value) => {
        const newItems = [...lineItems];
        newItems[index] = { ...newItems[index], [field]: value };
        // Recalculate total
        if (field === 'quantity' || field === 'unitPrice' || field === 'taxRate') {
            const item = newItems[index];
            const subtotal = item.quantity * item.unitPrice;
            const tax = subtotal * (item.taxRate / 100);
            newItems[index].total = subtotal + tax;
        }
        setLineItems(newItems);
    };
    const addLineItem = () => {
        setLineItems([...lineItems, { description: '', quantity: 1, unitPrice: 0, taxRate: 0, total: 0 }]);
    };
    const removeLineItem = (index) => {
        if (lineItems.length > 1) {
            setLineItems(lineItems.filter((_, i) => i !== index));
        }
    };
    const calculateTotals = () => {
        const subtotal = lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
        const taxTotal = lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice * (item.taxRate / 100)), 0);
        const total = subtotal + taxTotal;
        return { subtotal, taxTotal, total };
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        const { subtotal, taxTotal, total } = calculateTotals();
        await onSubmit({
            ...formData,
            lines: lineItems,
            subtotal,
            taxTotal,
            totalAmount: total
        });
    };
    const { subtotal, taxTotal, total } = calculateTotals();
    const entityLabel = type === 'invoice' ? 'Customer' : 'Vendor';
    const numberLabel = type === 'invoice' ? 'Invoice Number' : 'Bill Number';
    return (_jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: type === 'invoice' ? 'Invoice Details' : 'Bill Details' }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsxs(Label, { htmlFor: "entityId", children: [entityLabel, " ID"] }), _jsx(Input, { id: "entityId", value: formData.entityId, onChange: (e) => setFormData({ ...formData, entityId: e.target.value }), required: true })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "number", children: numberLabel }), _jsx(Input, { id: "number", value: formData.number, onChange: (e) => setFormData({ ...formData, number: e.target.value }), required: true })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "date", children: "Date" }), _jsx(Input, { id: "date", type: "date", value: formData.date, onChange: (e) => setFormData({ ...formData, date: e.target.value }), required: true })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "dueDate", children: "Due Date" }), _jsx(Input, { id: "dueDate", type: "date", value: formData.dueDate, onChange: (e) => setFormData({ ...formData, dueDate: e.target.value }), required: true })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "notes", children: "Notes" }), _jsx(Textarea, { id: "notes", value: formData.notes, onChange: (e) => setFormData({ ...formData, notes: e.target.value }), rows: 3 })] })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx(CardTitle, { children: "Line Items" }), _jsxs(Button, { type: "button", onClick: addLineItem, size: "sm", children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "Add Line"] })] }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "space-y-4", children: lineItems.map((item, index) => (_jsxs("div", { className: "grid grid-cols-12 gap-2 items-center p-3 border rounded", children: [_jsx("div", { className: "col-span-4", children: _jsx(Input, { placeholder: "Description", value: item.description, onChange: (e) => updateLineItem(index, 'description', e.target.value), required: true }) }), _jsx("div", { className: "col-span-2", children: _jsx(Input, { type: "number", placeholder: "Qty", value: item.quantity, onChange: (e) => updateLineItem(index, 'quantity', parseFloat(e.target.value) || 0), min: "0", step: "0.01", required: true }) }), _jsx("div", { className: "col-span-2", children: _jsx(Input, { type: "number", placeholder: "Price", value: item.unitPrice, onChange: (e) => updateLineItem(index, 'unitPrice', parseFloat(e.target.value) || 0), min: "0", step: "0.01", required: true }) }), _jsx("div", { className: "col-span-2", children: _jsx(Input, { type: "number", placeholder: "Tax %", value: item.taxRate, onChange: (e) => updateLineItem(index, 'taxRate', parseFloat(e.target.value) || 0), min: "0", step: "0.01" }) }), _jsxs("div", { className: "col-span-1 text-right font-medium", children: ["$", item.total.toFixed(2)] }), _jsx("div", { className: "col-span-1", children: lineItems.length > 1 && (_jsx(Button, { type: "button", variant: "ghost", size: "sm", onClick: () => removeLineItem(index), children: _jsx(Trash2, { className: "h-4 w-4" }) })) })] }, index))) }), _jsx("div", { className: "flex justify-end mt-6", children: _jsxs("div", { className: "w-64 space-y-2", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Subtotal:" }), _jsxs("span", { children: ["$", subtotal.toFixed(2)] })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Tax:" }), _jsxs("span", { children: ["$", taxTotal.toFixed(2)] })] }), _jsxs("div", { className: "flex justify-between font-bold text-lg border-t pt-2", children: [_jsx("span", { children: "Total:" }), _jsxs("span", { children: ["$", total.toFixed(2)] })] })] }) })] })] }), _jsxs("div", { className: "flex justify-end space-x-3", children: [_jsx(Button, { type: "button", variant: "outline", onClick: onCancel, children: "Cancel" }), _jsx(Button, { type: "submit", disabled: loading, children: loading ? 'Saving...' : `Create ${type === 'invoice' ? 'Invoice' : 'Bill'}` })] })] }));
};
