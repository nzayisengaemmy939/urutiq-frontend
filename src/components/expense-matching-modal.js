import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useMutation, useQuery } from "@tanstack/react-query";
import { expenseApi, cardApi } from "../lib/api/accounting";
import { toast } from "sonner";
export function ExpenseMatchingModal({ open, onOpenChange, amount, date, description, exceptionId, onMatched, onSelectExpense }) {
    const [search, setSearch] = React.useState(description || "");
    const start = React.useMemo(() => (date ? new Date(new Date(date).setDate(new Date(date).getDate() - 7)).toISOString().slice(0, 10) : new Date(new Date().setDate(1)).toISOString().slice(0, 10)), [date]);
    const end = React.useMemo(() => (date ? new Date(new Date(date).setDate(new Date(date).getDate() + 7)).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)), [date]);
    const { data: expenses } = useQuery({
        queryKey: ['expenses-for-matching', start, end, amount],
        enabled: open,
        queryFn: async () => expenseApi.getExpenses(undefined, undefined, undefined)
    });
    const resolveMatch = useMutation({
        mutationFn: async ({ exceptionId, expenseId }) => cardApi.resolveMatch(exceptionId, expenseId),
        onSuccess: () => {
            toast.success('Exception matched to expense');
            if (onMatched)
                onMatched();
            onOpenChange(false);
        },
        onError: (err) => toast.error(err?.message || 'Failed to match exception')
    });
    const candidates = React.useMemo(() => {
        const list = (Array.isArray(expenses) ? expenses : expenses?.items || expenses?.data || []);
        return list.filter((e) => {
            const matchesText = !search || (e.description || '').toLowerCase().includes(search.toLowerCase());
            const amt = Number(e.totalAmount ?? e.amount ?? 0);
            const matchesAmount = amount ? Math.abs(amt - (amount || 0)) < 0.01 : true;
            const d = String(e.expenseDate || '').slice(0, 10);
            const inRange = (!start || d >= start) && (!end || d <= end);
            return matchesText && matchesAmount && inRange;
        }).slice(0, 50);
    }, [expenses, search, amount, start, end]);
    return (_jsx(Dialog, { open: open, onOpenChange: onOpenChange, children: _jsxs(DialogContent, { className: "max-w-2xl", children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { children: "Match Expense to Bank Transaction" }) }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-3 gap-3", children: [_jsxs("div", { children: [_jsx(Label, { children: "Amount" }), _jsx(Input, { value: amount != null ? amount : '', readOnly: true })] }), _jsxs("div", { children: [_jsx(Label, { children: "Date" }), _jsx(Input, { value: date || '', readOnly: true })] }), _jsxs("div", { children: [_jsx(Label, { children: "Search" }), _jsx(Input, { value: search, onChange: (e) => setSearch(e.target.value), placeholder: "Description filter" })] })] }), _jsx("div", { className: "border rounded-md max-h-72 overflow-auto", children: _jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { children: _jsxs("tr", { className: "bg-muted", children: [_jsx("th", { className: "text-left p-2", children: "Date" }), _jsx("th", { className: "text-left p-2", children: "Description" }), _jsx("th", { className: "text-right p-2", children: "Amount" }), _jsx("th", { className: "p-2" })] }) }), _jsxs("tbody", { children: [candidates.map((e) => {
                                                const amt = Number(e.totalAmount ?? e.amount ?? 0);
                                                return (_jsxs("tr", { className: "border-b", children: [_jsx("td", { className: "p-2", children: String(e.expenseDate || '').slice(0, 10) }), _jsx("td", { className: "p-2", children: e.description }), _jsxs("td", { className: "p-2 text-right", children: ["$", Number(amt).toLocaleString()] }), _jsx("td", { className: "p-2 text-right", children: exceptionId ? (_jsx(Button, { size: "sm", variant: "outline", onClick: () => resolveMatch.mutate({ exceptionId, expenseId: e.id }), disabled: resolveMatch.isPending, children: "Match" })) : (_jsx(Button, { size: "sm", variant: "outline", onClick: () => { if (onSelectExpense)
                                                                    onSelectExpense(e.id); onOpenChange(false); }, children: "Select" })) })] }, e.id));
                                            }), candidates.length === 0 && (_jsx("tr", { children: _jsx("td", { colSpan: 4, className: "p-4 text-center text-muted-foreground", children: "No candidates found" }) }))] })] }) }), _jsx("div", { className: "flex justify-end", children: _jsx(Button, { variant: "outline", onClick: () => onOpenChange(false), children: "Close" }) })] })] }) }));
}
