import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './dialog';
import { Button } from './button';
import { AlertTriangle, Trash2, Play, X } from 'lucide-react';
export function ConfirmationModal({ isOpen, onClose, onConfirm, title, description, confirmText = 'Confirm', cancelText = 'Cancel', variant = 'default', icon = 'warning', isLoading = false }) {
    const getIcon = () => {
        switch (icon) {
            case 'delete':
                return _jsx(Trash2, { className: "h-6 w-6 text-red-600" });
            case 'execute':
                return _jsx(Play, { className: "h-6 w-6 text-blue-600" });
            case 'warning':
            default:
                return _jsx(AlertTriangle, { className: "h-6 w-6 text-yellow-600" });
        }
    };
    const getButtonVariant = () => {
        switch (variant) {
            case 'danger':
                return 'destructive';
            case 'warning':
                return 'default';
            default:
                return 'default';
        }
    };
    return (_jsx(Dialog, { open: isOpen, onOpenChange: onClose, children: _jsxs(DialogContent, { className: "sm:max-w-[425px]", children: [_jsxs(DialogHeader, { children: [_jsxs(DialogTitle, { className: "flex items-center gap-3", children: [getIcon(), title] }), _jsx(DialogDescription, { className: "text-base", children: description })] }), _jsxs(DialogFooter, { className: "gap-2", children: [_jsxs(Button, { type: "button", variant: "outline", onClick: onClose, disabled: isLoading, children: [_jsx(X, { className: "h-4 w-4 mr-2" }), cancelText] }), _jsx(Button, { type: "button", variant: getButtonVariant(), onClick: onConfirm, disabled: isLoading, children: isLoading ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" }), "Processing..."] })) : (_jsxs(_Fragment, { children: [icon === 'delete' && _jsx(Trash2, { className: "h-4 w-4 mr-2" }), icon === 'execute' && _jsx(Play, { className: "h-4 w-4 mr-2" }), confirmText] })) })] })] }) }));
}
