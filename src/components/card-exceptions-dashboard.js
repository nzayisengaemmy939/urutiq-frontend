import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { cardApi } from "../lib/api/accounting";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ExpenseMatchingModal } from "./expense-matching-modal";
import { AttachReceiptModal } from "./attach-receipt-modal";
export function CardExceptionsDashboard() {
    const qc = useQueryClient();
    const [reasonFilter, setReasonFilter] = React.useState("all");
    const { data: exceptionsData, refetch } = useQuery({
        queryKey: ['card-exceptions', reasonFilter],
        queryFn: async () => await cardApi.getExceptions({ reason: reasonFilter === 'all' ? undefined : reasonFilter })
    });
    const exceptions = exceptionsData || [];
    const [search, setSearch] = React.useState('');
    const [matchingOpen, setMatchingOpen] = React.useState(false);
    const [context, setContext] = React.useState(null);
    const [selectedExceptionId, setSelectedExceptionId] = React.useState(null);
    const [bulkMatchOpen, setBulkMatchOpen] = React.useState(false);
    const [attachOpen, setAttachOpen] = React.useState(false);
    const [lastCreatedExpenseId, setLastCreatedExpenseId] = React.useState(null);
    const [selected, setSelected] = React.useState({});
    const dismiss = useMutation({
        mutationFn: async (id) => cardApi.dismiss(id),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['card-exceptions'] }); toast.success('Exception dismissed'); },
        onError: (err) => toast.error(err?.message || 'Failed to dismiss exception')
    });
    const resolveCreate = useMutation({
        mutationFn: async (vars) => cardApi.resolveCreate(vars.id, { receiptDataUrl: vars.receiptDataUrl }),
        onSuccess: (res) => {
            try {
                setLastCreatedExpenseId(res.expenseId || null);
            }
            catch { }
            setAttachOpen(true);
            qc.invalidateQueries({ queryKey: ['card-exceptions'] });
            toast.success('Expense created from exception');
        },
        onError: (err) => toast.error(err?.message || 'Failed to create expense from exception')
    });
    const filtered = exceptions.filter((e) => !search || String(e.description || '').toLowerCase().includes(search.toLowerCase()));
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-xl font-semibold", children: "Card Exceptions" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Unmatched card transactions awaiting resolution" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Input, { placeholder: "Search...", value: search, onChange: (e) => setSearch(e.target.value), className: "w-64" }), _jsxs(Select, { value: reasonFilter, onValueChange: (v) => setReasonFilter(v), children: [_jsx(SelectTrigger, { className: "w-48", children: _jsx(SelectValue, { placeholder: "Reason" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All reasons" }), _jsx(SelectItem, { value: "unmatched", children: "Unmatched" }), _jsx(SelectItem, { value: "policy_violation", children: "Policy violation" })] })] }), _jsx(Button, { variant: "outline", onClick: () => refetch(), children: "Reload" })] })] }), _jsx("div", { className: "border rounded-md overflow-hidden", children: _jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { children: _jsxs("tr", { className: "bg-muted", children: [_jsx("th", { className: "p-2 w-8", children: _jsx("input", { type: "checkbox", "aria-label": "select all", checked: filtered.length > 0 && filtered.every((e) => selected[e.id]), onChange: (e) => {
                                                const all = {};
                                                if (e.target.checked)
                                                    filtered.forEach((x) => { all[x.id] = true; });
                                                setSelected(all);
                                            } }) }), _jsx("th", { className: "text-left p-2", children: "Date" }), _jsx("th", { className: "text-left p-2", children: "Description" }), _jsx("th", { className: "text-left p-2", children: "Reason" }), _jsx("th", { className: "text-right p-2", children: "Amount" }), _jsx("th", { className: "p-2", children: "Actions" })] }) }), _jsxs("tbody", { children: [filtered.length === 0 && (_jsx("tr", { children: _jsx("td", { colSpan: 4, className: "p-4 text-center text-muted-foreground", children: "No exceptions found" }) })), filtered.map((ex, idx) => (_jsxs("tr", { className: "border-b", children: [_jsx("td", { className: "p-2 w-8", children: _jsx("input", { type: "checkbox", checked: !!selected[ex.id], onChange: (e) => setSelected(prev => ({ ...prev, [ex.id]: e.target.checked })) }) }), _jsx("td", { className: "p-2", children: String(ex.date || '').slice(0, 10) }), _jsx("td", { className: "p-2", children: ex.description }), _jsx("td", { className: "p-2", children: _jsx("span", { className: `px-2 py-0.5 rounded text-xs ${ex.reason === 'policy_violation' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`, children: ex.reason?.replace('_', ' ') }) }), _jsxs("td", { className: "p-2 text-right", children: ["$", Number(ex.amount || 0).toLocaleString()] }), _jsx("td", { className: "p-2", children: _jsxs("div", { className: "flex items-center gap-2 justify-end", children: [_jsx(InlineReceiptUpload, { onSubmit: (dataUrl) => resolveCreate.mutate({ id: ex.id, receiptDataUrl: dataUrl }), disabled: resolveCreate.isPending }), _jsx(Button, { size: "sm", variant: "outline", onClick: () => { setContext({ amount: ex.amount, date: String(ex.date || '').slice(0, 10), description: ex.description }); setSelectedExceptionId(ex.id); setMatchingOpen(true); }, disabled: resolveCreate.isPending || dismiss.isPending, children: "Match" }), _jsx(Button, { size: "sm", variant: "outline", onClick: () => dismiss.mutate(ex.id), disabled: dismiss.isPending, children: "Dismiss" })] }) })] }, idx)))] })] }) }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "text-sm text-muted-foreground", children: [Object.keys(selected).filter(id => selected[id]).length, " selected"] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Button, { variant: "outline", size: "sm", disabled: dismiss.isPending || resolveCreate.isPending || Object.keys(selected).filter(id => selected[id]).length === 0, onClick: async () => {
                                    // optimistic update
                                    const ids = Object.keys(selected).filter(id => selected[id]);
                                    const prev = exceptions;
                                    // Filter client cache immediately
                                    qc.setQueryData(['card-exceptions', reasonFilter], (old) => (old || []).filter((e) => !ids.includes(e.id)));
                                    try {
                                        await Promise.all(ids.map(id => cardApi.dismiss(id)));
                                        toast.success('Selected exceptions dismissed');
                                    }
                                    catch (e) {
                                        toast.error(e?.message || 'Failed to dismiss some exceptions');
                                        // revert
                                        qc.setQueryData(['card-exceptions', reasonFilter], prev);
                                    }
                                    finally {
                                        setSelected({});
                                        refetch();
                                    }
                                }, children: "Bulk Dismiss" }), _jsx(Button, { variant: "outline", size: "sm", disabled: Object.keys(selected).filter(id => selected[id]).length === 0, onClick: () => setBulkMatchOpen(true), children: "Bulk Match" })] })] }), _jsx(ExpenseMatchingModal, { open: matchingOpen, onOpenChange: (v) => { setMatchingOpen(v); if (!v) {
                    setSelectedExceptionId(null);
                    refetch();
                } }, amount: context?.amount, date: context?.date, description: context?.description, exceptionId: selectedExceptionId || undefined, onMatched: () => qc.invalidateQueries({ queryKey: ['card-exceptions'] }) }), _jsx(ExpenseMatchingModal, { open: bulkMatchOpen, onOpenChange: (v) => { setBulkMatchOpen(v); if (!v)
                    refetch(); }, amount: undefined, date: undefined, description: '', onSelectExpense: async (expenseId) => {
                    const ids = Object.keys(selected).filter(id => selected[id]);
                    const prev = exceptions;
                    // Optimistic remove
                    qc.setQueryData(['card-exceptions', reasonFilter], (old) => (old || []).filter((e) => !ids.includes(e.id)));
                    try {
                        await Promise.all(ids.map(id => cardApi.resolveMatch(id, expenseId)));
                        toast.success('Selected exceptions matched');
                    }
                    catch (e) {
                        toast.error(e?.message || 'Failed to match some exceptions');
                        qc.setQueryData(['card-exceptions', reasonFilter], prev);
                    }
                    finally {
                        setSelected({});
                        setBulkMatchOpen(false);
                        refetch();
                    }
                } }), _jsx(AttachReceiptModal, { open: attachOpen, onOpenChange: (v) => { setAttachOpen(v); if (!v)
                    load(); }, expenseId: lastCreatedExpenseId })] }));
}
function InlineReceiptUpload({ onSubmit, disabled }) {
    const [busy, setBusy] = React.useState(false);
    const onFile = async (e) => {
        const f = e.target.files?.[0];
        if (!f)
            return;
        setBusy(true);
        try {
            const reader = new FileReader();
            reader.onload = () => {
                const dataUrl = String(reader.result || '');
                onSubmit(dataUrl);
                setBusy(false);
            };
            reader.readAsDataURL(f);
        }
        catch {
            setBusy(false);
        }
    };
    return (_jsx("div", { className: "inline-flex items-center gap-2", children: _jsxs("label", { className: "inline-flex items-center gap-2", children: [_jsx("input", { type: "file", accept: "image/*,application/pdf", onChange: onFile, disabled: disabled || busy, style: { display: 'none' } }), _jsx(Button, { size: "sm", variant: "outline", onClick: (e) => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'image/*,application/pdf';
                        input.onchange = onFile;
                        input.click();
                    }, disabled: disabled || busy, children: busy ? 'Uploading…' : 'Attach & Create' })] }) }));
}
