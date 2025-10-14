import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useMutation } from "@tanstack/react-query";
import { expenseApi } from "../lib/api/accounting";
export function AttachReceiptModal({ open, onOpenChange, expenseId }) {
    const [file, setFile] = React.useState(null);
    const [previewUrl, setPreviewUrl] = React.useState(null);
    const onFile = (e) => {
        const f = e.target.files?.[0] || null;
        setFile(f);
        if (previewUrl)
            URL.revokeObjectURL(previewUrl);
        if (f)
            setPreviewUrl(URL.createObjectURL(f));
    };
    const toDataUrl = (f) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = reject;
        reader.readAsDataURL(f);
    });
    const attachMutation = useMutation({
        mutationFn: async () => {
            if (!expenseId || !file)
                return;
            const dataUrl = await toDataUrl(file);
            await expenseApi.updateExpense(expenseId, { receiptUrl: dataUrl });
        },
        onSuccess: () => {
            if (previewUrl)
                URL.revokeObjectURL(previewUrl);
            setFile(null);
            setPreviewUrl(null);
            onOpenChange(false);
        }
    });
    return (_jsx(Dialog, { open: open, onOpenChange: (v) => { if (!attachMutation.isPending)
            onOpenChange(v); }, children: _jsxs(DialogContent, { className: "max-w-md", children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { children: "Attach Receipt" }) }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { children: "Receipt File" }), _jsx(Input, { type: "file", accept: "image/*,application/pdf", onChange: onFile })] }), previewUrl && (_jsx("div", { className: "border rounded p-2", children: _jsx("img", { src: previewUrl, alt: "Receipt preview", className: "max-h-64 object-contain" }) })), _jsxs("div", { className: "flex justify-end gap-2", children: [_jsx(Button, { variant: "outline", onClick: () => onOpenChange(false), disabled: attachMutation.isPending, children: "Cancel" }), _jsx(Button, { onClick: () => attachMutation.mutate(), disabled: !file || !expenseId || attachMutation.isPending, children: attachMutation.isPending ? 'Attaching...' : 'Attach' })] })] })] }) }));
}
