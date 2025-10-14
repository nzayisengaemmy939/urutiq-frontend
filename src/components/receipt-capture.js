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
export function ReceiptCaptureModal({ open, onOpenChange, defaultCompanyId, onCreated }) {
    const [file, setFile] = React.useState(null);
    const [previewUrl, setPreviewUrl] = React.useState(null);
    const [companyId, setCompanyId] = React.useState(defaultCompanyId || "");
    const [vendorName, setVendorName] = React.useState("");
    const [amount, setAmount] = React.useState("");
    const [date, setDate] = React.useState(new Date().toISOString().slice(0, 10));
    const [categoryId, setCategoryId] = React.useState("");
    const [description, setDescription] = React.useState("");
    const [extracting, setExtracting] = React.useState(false);
    const [department, setDepartment] = React.useState("");
    const [project, setProject] = React.useState("");
    React.useEffect(() => {
        try {
            if (!companyId) {
                const stored = localStorage.getItem("company_id") || localStorage.getItem("companyId") || localStorage.getItem("company");
                if (stored)
                    setCompanyId(stored);
            }
        }
        catch { }
    }, [companyId]);
    const { data: categories } = useQuery({
        queryKey: ["expense-categories", companyId],
        enabled: !!companyId,
        queryFn: async () => expenseApi.getExpenseCategories({ companyId })
    });
    const uploadObjectUrl = (fileObj) => {
        if (previewUrl)
            URL.revokeObjectURL(previewUrl);
        const url = URL.createObjectURL(fileObj);
        setPreviewUrl(url);
    };
    const onFileChange = (e) => {
        const f = e.target.files?.[0] || null;
        setFile(f);
        if (f)
            uploadObjectUrl(f);
    };
    const runOcr = async () => {
        if (!file)
            return;
        setExtracting(true);
        try {
            // Lazy load Tesseract.js from CDN to keep bundle light
            const loadTesseract = () => new Promise((resolve, reject) => {
                if (typeof window !== 'undefined' && window.Tesseract)
                    return resolve(window.Tesseract);
                const s = document.createElement('script');
                s.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@4.0.2/dist/tesseract.min.js';
                s.async = true;
                s.onload = () => resolve(window.Tesseract);
                s.onerror = reject;
                document.head.appendChild(s);
            });
            const Tesseract = await loadTesseract();
            const result = await Tesseract.recognize(file, 'eng', { logger: () => { } });
            const text = result?.data?.text || '';
            if (text) {
                // Simple heuristics for amount, date, vendor
                const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
                const maybeVendor = lines[0] || '';
                const amountMatch = text.match(/\$?\s*([0-9]{1,3}(?:[,][0-9]{3})*(?:\.[0-9]{2})|[0-9]+\.[0-9]{2})\b/g);
                const dateMatch = text.match(/\b(20[0-9]{2}[-\/.][0-1]?[0-9][-\/.][0-3]?[0-9]|[0-3]?[0-9][-\/.][0-1]?[0-9][-\/.](20[0-9]{2}))\b/);
                if (maybeVendor && !vendorName)
                    setVendorName(maybeVendor.slice(0, 80));
                if (amountMatch && !amount) {
                    const last = amountMatch[amountMatch.length - 1].replace(/\$/g, '').replace(/,/g, '').trim();
                    setAmount(last);
                }
                if (dateMatch && !date) {
                    const raw = dateMatch[0].replace(/[.]/g, '-').replace(/[\/]/g, '-');
                    const parts = raw.split('-');
                    const normalized = parts[0].length === 4 ? raw : `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
                    setDate(normalized);
                }
                if (!description)
                    setDescription(lines.slice(0, 3).join(' '));
            }
        }
        catch {
            // ignore
        }
        finally {
            setExtracting(false);
        }
    };
    const createExpenseMutation = useMutation({
        mutationFn: async () => {
            const amt = parseFloat(amount || "0");
            const payload = {
                companyId: companyId,
                amount: isFinite(amt) ? amt : 0,
                taxAmount: 0,
                totalAmount: isFinite(amt) ? amt : 0,
                expenseDate: date,
                categoryId: categoryId || (categories?.[0]?.id || ""),
                description: description || `Receipt from ${vendorName || "Unknown Vendor"}`,
                department: department || undefined,
                project: project || undefined,
                vendorId: undefined,
            };
            const created = await expenseApi.createExpense(payload);
            return created;
        },
        onSuccess: (exp) => {
            onCreated?.(exp?.id);
            // persist selected company
            try {
                localStorage.setItem("company_id", companyId);
            }
            catch { }
            onOpenChange(false);
            // reset
            setFile(null);
            if (previewUrl)
                URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
            setVendorName("");
            setAmount("");
            setDescription("");
        }
    });
    return (_jsx(Dialog, { open: open, onOpenChange: (v) => { if (!createExpenseMutation.isPending)
            onOpenChange(v); }, children: _jsxs(DialogContent, { className: "max-w-xl", children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { children: "Scan Receipt (Quick Add)" }) }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("div", { children: [_jsx(Label, { children: "Company" }), _jsxs(Select, { value: companyId, onValueChange: setCompanyId, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select company" }) }), _jsx(SelectContent, { children: companyId && (_jsx(SelectItem, { value: companyId, children: companyId })) })] })] }), _jsxs("div", { children: [_jsx(Label, { children: "Date" }), _jsx(Input, { type: "date", value: date, onChange: (e) => setDate(e.target.value) })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("div", { children: [_jsx(Label, { children: "Vendor" }), _jsx(Input, { value: vendorName, onChange: (e) => setVendorName(e.target.value), placeholder: "e.g., Starbucks" })] }), _jsxs("div", { children: [_jsx(Label, { children: "Amount" }), _jsx(Input, { type: "number", step: "0.01", inputMode: "decimal", value: amount, onChange: (e) => setAmount(e.target.value), placeholder: "0.00" })] })] }), _jsxs("div", { children: [_jsx(Label, { children: "Category" }), _jsxs(Select, { value: categoryId, onValueChange: setCategoryId, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select category" }) }), _jsx(SelectContent, { children: (categories || []).map((cat) => (_jsx(SelectItem, { value: cat.id, children: cat.name }, cat.id))) })] })] }), _jsxs("div", { children: [_jsx(Label, { children: "Description" }), _jsx(Textarea, { value: description, onChange: (e) => setDescription(e.target.value), placeholder: "Optional notes" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("div", { children: [_jsx(Label, { children: "Department (optional)" }), _jsx(Input, { value: department, onChange: (e) => setDepartment(e.target.value), placeholder: "e.g., Marketing" })] }), _jsxs("div", { children: [_jsx(Label, { children: "Project (optional)" }), _jsx(Input, { value: project, onChange: (e) => setProject(e.target.value), placeholder: "e.g., Q3 Launch" })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Receipt (image or PDF)" }), _jsx(Input, { type: "file", accept: "image/*,application/pdf", onChange: onFileChange }), previewUrl && (_jsx("div", { className: "border rounded-md p-2", children: _jsx("img", { src: previewUrl, alt: "Receipt preview", className: "max-h-64 object-contain" }) })), _jsx("div", { className: "flex justify-end", children: _jsx(Button, { variant: "outline", onClick: runOcr, disabled: !file || extracting, children: extracting ? 'Extracting...' : 'Extract with OCR' }) })] }), _jsxs("div", { className: "flex justify-end gap-2 pt-2", children: [_jsx(Button, { variant: "outline", onClick: () => onOpenChange(false), disabled: createExpenseMutation.isPending, children: "Cancel" }), _jsx(Button, { onClick: () => createExpenseMutation.mutate(), disabled: !companyId || !amount || !date || createExpenseMutation.isPending, children: createExpenseMutation.isPending ? "Creating..." : "Create Expense" })] })] })] }) }));
}
