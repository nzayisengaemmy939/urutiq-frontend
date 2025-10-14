import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useQuery } from "@tanstack/react-query";
import { expenseApi, companiesApi } from "../lib/api/accounting";
export function ExpenseReportModal({ open, onOpenChange }) {
    const [companyId, setCompanyId] = React.useState("");
    const [start, setStart] = React.useState(new Date(new Date().setDate(1)).toISOString().slice(0, 10));
    const [end, setEnd] = React.useState(new Date().toISOString().slice(0, 10));
    const [status, setStatus] = React.useState("all");
    const [downloading, setDownloading] = React.useState(false);
    React.useEffect(() => {
        try {
            const c = localStorage.getItem('company_id') || localStorage.getItem('companyId') || localStorage.getItem('company');
            if (c)
                setCompanyId(c);
        }
        catch { }
    }, []);
    const { data: companies } = useQuery({
        queryKey: ['companies'],
        queryFn: async () => companiesApi.getCompanies()
    });
    const downloadCsv = async () => {
        setDownloading(true);
        try {
            const all = await expenseApi.getExpenses(companyId, status === 'all' ? undefined : status);
            const filtered = (all || []).filter((e) => {
                const d = (e.expenseDate || '').slice(0, 10);
                return (!start || d >= start) && (!end || d <= end);
            });
            const header = ['Date', 'Description', 'Category', 'Status', 'Amount'];
            const rows = filtered.map((e) => [
                e.expenseDate?.slice(0, 10),
                (e.description || '').replaceAll('"', '""'),
                e.category?.name || '',
                e.status || '',
                String(e.totalAmount ?? e.amount ?? 0)
            ]);
            const lines = [header.join(','), ...rows.map(r => r.map(v => /,|"/.test(v) ? `"${v}"` : v).join(','))];
            const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `expense_report_${start}_to_${end}.csv`;
            a.click();
            setTimeout(() => URL.revokeObjectURL(url), 30000);
        }
        finally {
            setDownloading(false);
        }
    };
    return (_jsx(Dialog, { open: open, onOpenChange: onOpenChange, children: _jsxs(DialogContent, { className: "max-w-lg", children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { children: "Expense Report" }) }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { children: "Company" }), _jsxs(Select, { value: companyId, onValueChange: setCompanyId, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select company" }) }), _jsx(SelectContent, { children: (companies || []).map((c) => (_jsx(SelectItem, { value: c.id, children: c.name }, c.id))) })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("div", { children: [_jsx(Label, { children: "Start date" }), _jsx(Input, { type: "date", value: start, onChange: (e) => setStart(e.target.value) })] }), _jsxs("div", { children: [_jsx(Label, { children: "End date" }), _jsx(Input, { type: "date", value: end, onChange: (e) => setEnd(e.target.value) })] })] }), _jsxs("div", { children: [_jsx(Label, { children: "Status" }), _jsxs(Select, { value: status, onValueChange: setStatus, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All" }), _jsx(SelectItem, { value: "draft", children: "Draft" }), _jsx(SelectItem, { value: "submitted", children: "Submitted" }), _jsx(SelectItem, { value: "approved", children: "Approved" }), _jsx(SelectItem, { value: "paid", children: "Paid" })] })] })] }), _jsxs("div", { className: "flex justify-end gap-2 pt-2", children: [_jsx(Button, { variant: "outline", onClick: () => onOpenChange(false), disabled: downloading, children: "Close" }), _jsx(Button, { onClick: downloadCsv, disabled: !companyId || downloading, children: downloading ? 'Preparing...' : 'Export CSV' })] })] })] }) }));
}
