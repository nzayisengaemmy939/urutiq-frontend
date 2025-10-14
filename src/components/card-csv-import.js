import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { cardApi } from "../lib/api/accounting";
import { useMutation, useQueryClient } from "@tanstack/react-query";
export function CardCsvImportModal({ open, onOpenChange }) {
    const [file, setFile] = React.useState(null);
    const [rows, setRows] = React.useState([]);
    const [headers, setHeaders] = React.useState([]);
    const [mapping, setMapping] = React.useState(() => ({}));
    const [companyId, setCompanyId] = React.useState("");
    const [categoryId, setCategoryId] = React.useState("");
    const [log, setLog] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const qc = useQueryClient();
    const parseCsv = async (fileObj) => {
        const text = await fileObj.text();
        const lines = text.split(/\r?\n/).filter(Boolean);
        if (lines.length === 0)
            return;
        // naive CSV splitting with quotes handling (simple)
        const parseLine = (l) => {
            const out = [];
            let cur = '';
            let inQuotes = false;
            for (let i = 0; i < l.length; i++) {
                const ch = l[i];
                if (ch === '"') {
                    if (inQuotes && l[i + 1] === '"') {
                        cur += '"';
                        i++;
                    }
                    else {
                        inQuotes = !inQuotes;
                    }
                }
                else if (ch === ',' && !inQuotes) {
                    out.push(cur);
                    cur = '';
                }
                else {
                    cur += ch;
                }
            }
            out.push(cur);
            return out;
        };
        const header = parseLine(lines[0]).map(h => h.trim());
        const data = lines.slice(1).map(parseLine);
        setHeaders(header);
        const rs = data.map(cols => Object.fromEntries(header.map((h, idx) => [h, cols[idx] ?? ''])));
        setRows(rs);
        setMapping({ date: header.find(h => /date/i.test(h)) || header[0], description: header.find(h => /desc|memo|merchant/i.test(h)) || header[1], amount: header.find(h => /amount|debit|credit/i.test(h)) || header[2] });
    };
    const onFile = (e) => {
        const f = e.target.files?.[0];
        if (f) {
            setFile(f);
            parseCsv(f);
        }
    };
    React.useEffect(() => {
        try {
            const c = localStorage.getItem('company_id') || localStorage.getItem('companyId') || localStorage.getItem('company');
            if (c)
                setCompanyId(c);
        }
        catch { }
    }, []);
    const importMutation = useMutation({
        mutationFn: async (payload) => cardApi.importTransactions(payload.map((r) => ({
            date: String(r.date || ''),
            description: String(r.description || ''),
            amount: Number(r.amount || 0),
            merchant: r.merchant,
            source: r.source,
        })), companyId),
        onSuccess: (res) => {
            setLog(`Imported ${res.created} rows. Unmatched are available in Exceptions.`);
            qc.invalidateQueries({ queryKey: ['card-exceptions'] });
        },
        onError: (err) => {
            setLog(`Import failed: ${err?.message || 'Unknown error'}`);
        },
        onSettled: () => setLoading(false)
    });
    const importRows = async () => {
        if (!companyId || !mapping.date || !mapping.description || !mapping.amount)
            return;
        setLoading(true);
        const mapped = rows.map((r) => ({
            date: String(r[mapping.date]),
            description: String(r[mapping.description]),
            amount: parseFloat(String(r[mapping.amount]).replace(/[^0-9.-]/g, '')),
            merchant: undefined,
            source: 'csv'
        }));
        importMutation.mutate(mapped);
    };
    return (_jsx(Dialog, { open: open, onOpenChange: onOpenChange, children: _jsxs(DialogContent, { className: "max-w-3xl max-h-[90vh] overflow-y-auto", children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { children: "Import Card Transactions (CSV)" }) }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("div", { children: [_jsx(Label, { children: "Company" }), _jsx(Input, { value: companyId, onChange: (e) => setCompanyId(e.target.value), placeholder: "company id" })] }), _jsxs("div", { children: [_jsx(Label, { children: "Default Category (optional)" }), _jsx(Input, { value: categoryId, onChange: (e) => setCategoryId(e.target.value), placeholder: "category id or mapping" })] })] }), _jsxs("div", { children: [_jsx(Label, { children: "CSV File" }), _jsx(Input, { type: "file", accept: "text/csv", onChange: onFile })] }), headers.length > 0 && (_jsxs("div", { className: "grid grid-cols-3 gap-3", children: [_jsxs("div", { children: [_jsx(Label, { children: "Date Column" }), _jsxs(Select, { value: mapping.date, onValueChange: (v) => setMapping(prev => ({ ...prev, date: v })), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsx(SelectContent, { children: headers.map(h => (_jsx(SelectItem, { value: h, children: h }, h))) })] })] }), _jsxs("div", { children: [_jsx(Label, { children: "Description Column" }), _jsxs(Select, { value: mapping.description, onValueChange: (v) => setMapping(prev => ({ ...prev, description: v })), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsx(SelectContent, { children: headers.map(h => (_jsx(SelectItem, { value: h, children: h }, h))) })] })] }), _jsxs("div", { children: [_jsx(Label, { children: "Amount Column" }), _jsxs(Select, { value: mapping.amount, onValueChange: (v) => setMapping(prev => ({ ...prev, amount: v })), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsx(SelectContent, { children: headers.map(h => (_jsx(SelectItem, { value: h, children: h }, h))) })] })] })] })), rows.length > 0 && (_jsxs("div", { className: "border rounded", children: [_jsxs("div", { className: "p-2 text-sm text-muted-foreground", children: ["Preview (", rows.length, " rows)"] }), _jsx("div", { className: "max-h-64 overflow-auto", children: _jsxs("table", { className: "w-full text-xs", children: [_jsx("thead", { children: _jsx("tr", { children: (headers || []).map(h => (_jsx("th", { className: "p-2 text-left bg-muted", children: h }, h))) }) }), _jsx("tbody", { children: rows.slice(0, 20).map((r, idx) => (_jsx("tr", { className: "border-b", children: headers.map(h => (_jsx("td", { className: "p-2", children: r[h] }, h))) }, idx))) })] }) })] })), _jsxs("div", { className: "flex justify-end gap-2", children: [_jsx(Button, { variant: "outline", onClick: () => onOpenChange(false), disabled: loading, children: "Cancel" }), _jsx(Button, { onClick: importRows, disabled: !rows.length || !companyId || loading, children: loading ? 'Importing…' : 'Import' })] }), log && (_jsx(Textarea, { readOnly: true, value: log, className: "text-xs h-24" }))] })] }) }));
}
