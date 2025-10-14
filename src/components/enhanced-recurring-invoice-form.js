import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Calendar, Clock, Settings, Mail, Shield, Info } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
const timezoneOptions = [
    { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
    { value: 'EST', label: 'EST (Eastern Standard Time)' },
    { value: 'PST', label: 'PST (Pacific Standard Time)' },
    { value: 'CET', label: 'CET (Central European Time)' },
    { value: 'JST', label: 'JST (Japan Standard Time)' },
    { value: 'GMT', label: 'GMT (Greenwich Mean Time)' },
    { value: 'IST', label: 'IST (India Standard Time)' },
    { value: 'AEST', label: 'AEST (Australian Eastern Standard Time)' },
];
const dayOfWeekOptions = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' },
];
const dayOfMonthOptions = Array.from({ length: 31 }, (_, i) => ({
    value: i + 1,
    label: `${i + 1}${getOrdinalSuffix(i + 1)}`
}));
function getOrdinalSuffix(day) {
    if (day >= 11 && day <= 13)
        return 'th';
    switch (day % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
    }
}
export function EnhancedRecurringInvoiceForm({ formData, onChange, customers, isEditing = false, readOnly = false, }) {
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState('basic');
    const [ccEmailInput, setCcEmailInput] = useState('');
    const [bccEmailInput, setBccEmailInput] = useState('');
    const [reminderDayInput, setReminderDayInput] = useState('');
    const updateFormData = (updates) => {
        onChange({ ...formData, ...updates });
    };
    // Helpers
    const formatCurrency = (amount, currency) => {
        const amt = Number(amount) || 0;
        try {
            return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(amt);
        }
        catch {
            return `$${amt.toFixed(2)}`;
        }
    };
    const computeTotals = (lines = []) => {
        const subtotal = lines.reduce((sum, l) => sum + ((Number(l.quantity) || 0) * (Number(l.unitPrice) || 0)), 0);
        const taxTotal = lines.reduce((sum, l) => sum + ((Number(l.quantity) || 0) * (Number(l.unitPrice) || 0) * (Number(l.taxRate) || 0) / 100), 0);
        const totalAmount = subtotal + taxTotal;
        return { subtotal, taxTotal, totalAmount };
    };
    const isValidEmail = (email) => /.+@.+\..+/.test(email.trim());
    // Simple next run date preview for sticky header
    const getNextRunDate = () => {
        const { startDate, endDate, frequency, interval, dayOfWeek, dayOfMonth, businessDaysOnly } = formData;
        if (!startDate)
            return null;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let next = new Date(startDate);
        if (isNaN(next.getTime()))
            return null;
        next.setHours(0, 0, 0, 0);
        const cap = 500;
        const addBusinessDays = (date, days) => {
            let d = new Date(date);
            while (days > 0) {
                d.setDate(d.getDate() + 1);
                const dow = d.getDay();
                if (dow !== 0 && dow !== 6)
                    days--;
            }
            return d;
        };
        const advance = () => {
            switch (frequency) {
                case 'daily':
                    if (businessDaysOnly)
                        next = addBusinessDays(next, Math.max(1, interval || 1));
                    else
                        next.setDate(next.getDate() + Math.max(1, interval || 1));
                    break;
                case 'weekly': {
                    const stepWeeks = Math.max(1, interval || 1);
                    if (typeof dayOfWeek === 'number') {
                        const cur = next.getDay();
                        const diff = (dayOfWeek + 7 - cur) % 7 || 7;
                        next.setDate(next.getDate() + diff + (stepWeeks - 1) * 7);
                    }
                    else {
                        next.setDate(next.getDate() + stepWeeks * 7);
                    }
                    break;
                }
                case 'monthly': {
                    const stepMonths = Math.max(1, interval || 1);
                    const dom = dayOfMonth || next.getDate();
                    next.setMonth(next.getMonth() + stepMonths, Math.min(dom, 28));
                    const tryDate = new Date(next.getFullYear(), next.getMonth(), dom);
                    if (!isNaN(tryDate.getTime()))
                        next = tryDate;
                    break;
                }
                case 'quarterly': {
                    const stepQ = Math.max(1, interval || 1) * 3;
                    const dom = dayOfMonth || next.getDate();
                    next.setMonth(next.getMonth() + stepQ, Math.min(dom, 28));
                    const tryDate = new Date(next.getFullYear(), next.getMonth(), dom);
                    if (!isNaN(tryDate.getTime()))
                        next = tryDate;
                    break;
                }
                case 'yearly': {
                    const stepYears = Math.max(1, interval || 1);
                    const dom = dayOfMonth || next.getDate();
                    next.setFullYear(next.getFullYear() + stepYears);
                    next.setDate(Math.min(dom, 28));
                    const tryDate = new Date(next.getFullYear(), next.getMonth(), dom);
                    if (!isNaN(tryDate.getTime()))
                        next = tryDate;
                    break;
                }
                default:
                    next.setDate(next.getDate() + 1);
            }
        };
        if (next > today) {
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(0, 0, 0, 0);
                if (next > end)
                    return null;
            }
            return next;
        }
        let steps = 0;
        while (next <= today && steps++ < cap) {
            advance();
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(0, 0, 0, 0);
                if (next > end)
                    return null;
            }
        }
        return steps >= cap ? null : next;
    };
    const nextRun = getNextRunDate();
    // Keep totals in sync when lines change
    useEffect(() => {
        const totals = computeTotals(formData.lines || []);
        if (Math.abs((formData.subtotal || 0) - totals.subtotal) > 1e-6 ||
            Math.abs((formData.taxTotal || 0) - totals.taxTotal) > 1e-6 ||
            Math.abs((formData.totalAmount || 0) - totals.totalAmount) > 1e-6) {
            updateFormData({ ...totals });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData.lines]);
    const addEmail = (type, email) => {
        if (!email.trim())
            return;
        if (!isValidEmail(email)) {
            toast({ title: 'Invalid email', description: 'Please enter a valid email address.', variant: 'destructive' });
            return;
        }
        const emailList = type === 'cc' ? (formData.ccEmails || []) : (formData.bccEmails || []);
        if (!emailList.includes(email.trim())) {
            const newEmails = [...emailList, email.trim()];
            updateFormData({ [type === 'cc' ? 'ccEmails' : 'bccEmails']: newEmails });
        }
        if (type === 'cc')
            setCcEmailInput('');
        else
            setBccEmailInput('');
    };
    const removeEmail = (type, email) => {
        const emailList = type === 'cc' ? (formData.ccEmails || []) : (formData.bccEmails || []);
        const newEmails = emailList.filter(e => e !== email);
        updateFormData({ [type === 'cc' ? 'ccEmails' : 'bccEmails']: newEmails });
    };
    const addReminderDay = (day) => {
        const dayNum = parseInt(day);
        if (isNaN(dayNum) || dayNum < 0)
            return;
        const reminderDays = formData.reminderDays || [];
        if (!reminderDays.includes(dayNum)) {
            updateFormData({ reminderDays: [...reminderDays, dayNum].sort((a, b) => a - b) });
        }
        setReminderDayInput('');
    };
    const removeReminderDay = (day) => {
        const reminderDays = formData.reminderDays || [];
        updateFormData({ reminderDays: reminderDays.filter(d => d !== day) });
    };
    const selectedCustomer = customers.find(c => c.id === formData.customerId);
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "sticky top-0 z-20 bg-white border-b p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsxs("div", { children: [_jsx("div", { className: "text-sm text-muted-foreground", children: "Template" }), _jsx("div", { className: "font-medium", children: formData.name || 'Untitled recurring invoice' })] }), _jsx(Separator, { orientation: "vertical", className: "h-6 hidden md:block" }), _jsxs("div", { children: [_jsx("div", { className: "text-sm text-muted-foreground", children: "Customer" }), _jsx("div", { className: "font-medium", children: selectedCustomer?.name || 'Select customer' })] })] }), _jsxs("div", { className: "flex items-center gap-6", children: [_jsxs("div", { className: "text-right", children: [_jsx("div", { className: "text-sm text-muted-foreground", children: "Total" }), _jsx("div", { className: "font-semibold", children: formatCurrency(computeTotals(formData.lines || []).totalAmount, formData.currency || 'USD') })] }), _jsxs("div", { className: "text-right", children: [_jsx("div", { className: "text-sm text-muted-foreground", children: "Next run" }), _jsx("div", { className: "font-semibold", children: nextRun ? nextRun.toLocaleDateString() : '—' })] })] })] }), _jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, className: "w-full", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-5", children: [_jsxs(TabsTrigger, { value: "basic", className: "flex items-center gap-2", children: [_jsx(Calendar, { className: "w-4 h-4" }), "Basic Info"] }), _jsxs(TabsTrigger, { value: "schedule", className: "flex items-center gap-2", children: [_jsx(Clock, { className: "w-4 h-4" }), "Schedule"] }), _jsxs(TabsTrigger, { value: "conditions", className: "flex items-center gap-2", children: [_jsx(Shield, { className: "w-4 h-4" }), "Conditions"] }), _jsxs(TabsTrigger, { value: "email", className: "flex items-center gap-2", children: [_jsx(Mail, { className: "w-4 h-4" }), "Email"] }), _jsxs(TabsTrigger, { value: "lines", className: "flex items-center gap-2", children: [_jsx(Settings, { className: "w-4 h-4" }), "Line Items"] })] }), _jsx(TabsContent, { value: "basic", className: "space-y-4", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Basic Information" }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { children: "Template Name *" }), _jsx(Input, { disabled: readOnly, className: "border", value: formData.name, onChange: (e) => updateFormData({ name: e.target.value }), placeholder: "Monthly Subscription" })] }), _jsxs("div", { children: [_jsx(Label, { children: "Customer *" }), _jsxs(Select, { value: formData.customerId, onValueChange: (value) => updateFormData({ customerId: value }), children: [_jsx(SelectTrigger, { className: "border", disabled: readOnly, children: _jsx(SelectValue, { placeholder: "Select customer" }) }), _jsx(SelectContent, { children: customers.map((customer) => (_jsx(SelectItem, { value: customer.id, children: _jsxs("div", { className: "flex items-center justify-between w-full", children: [_jsx("span", { children: customer.name }), customer.outstandingBalance && customer.outstandingBalance > 0 && (_jsxs(Badge, { variant: "outline", className: "ml-2", children: ["$", customer.outstandingBalance.toFixed(2), " outstanding"] }))] }) }, customer.id))) })] })] })] }), _jsxs("div", { children: [_jsx(Label, { children: "Description" }), _jsx(Textarea, { disabled: readOnly, className: "border", value: formData.description || '', onChange: (e) => updateFormData({ description: e.target.value }), placeholder: "Recurring invoice description", rows: 3 })] }), _jsxs("div", { className: "grid grid-cols-3 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { children: "Currency" }), _jsxs(Select, { value: formData.currency, onValueChange: (value) => updateFormData({ currency: value }), children: [_jsx(SelectTrigger, { className: "border", disabled: readOnly, children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "USD", children: "USD" }), _jsx(SelectItem, { value: "EUR", children: "EUR" }), _jsx(SelectItem, { value: "GBP", children: "GBP" }), _jsx(SelectItem, { value: "CAD", children: "CAD" }), _jsx(SelectItem, { value: "AUD", children: "AUD" })] })] })] }), _jsxs("div", { children: [_jsx(Label, { children: "Due Date Offset (Days)" }), _jsx(Input, { disabled: readOnly, className: "border font-mono text-right", type: "number", min: "0", value: formData.dueDateOffset, onChange: (e) => updateFormData({ dueDateOffset: parseInt(e.target.value) || 0 }) })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "autoSend", disabled: readOnly, checked: formData.autoSend, onCheckedChange: (checked) => updateFormData({ autoSend: !!checked }) }), _jsx(Label, { htmlFor: "autoSend", children: "Auto-send invoices" })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { children: "Notes" }), _jsx(Textarea, { disabled: readOnly, className: "border", value: formData.notes || '', onChange: (e) => updateFormData({ notes: e.target.value }), placeholder: "Optional notes", rows: 3 })] }), _jsxs("div", { children: [_jsx(Label, { children: "Terms" }), _jsx(Textarea, { disabled: readOnly, className: "border", value: formData.terms || '', onChange: (e) => updateFormData({ terms: e.target.value }), placeholder: "Payment terms", rows: 3 })] })] })] })] }) }), _jsx(TabsContent, { value: "schedule", className: "space-y-4", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Advanced Scheduling" }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-3 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { children: "Frequency *" }), _jsxs(Select, { value: formData.frequency, onValueChange: (value) => updateFormData({ frequency: value }), children: [_jsx(SelectTrigger, { className: "border", disabled: readOnly, children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "daily", children: "Daily" }), _jsx(SelectItem, { value: "weekly", children: "Weekly" }), _jsx(SelectItem, { value: "monthly", children: "Monthly" }), _jsx(SelectItem, { value: "quarterly", children: "Quarterly" }), _jsx(SelectItem, { value: "yearly", children: "Yearly" })] })] })] }), _jsxs("div", { children: [_jsx(Label, { children: "Interval" }), _jsx(Input, { disabled: readOnly, className: "border font-mono text-right", type: "number", min: "1", value: formData.interval, onChange: (e) => updateFormData({ interval: parseInt(e.target.value) || 1 }) })] }), _jsxs("div", { children: [_jsx(Label, { children: "Timezone" }), _jsxs(Select, { value: formData.timezone, onValueChange: (value) => updateFormData({ timezone: value }), children: [_jsx(SelectTrigger, { className: "border", disabled: readOnly, children: _jsx(SelectValue, {}) }), _jsx(SelectContent, { children: timezoneOptions.map((tz) => (_jsx(SelectItem, { value: tz.value, children: tz.label }, tz.value))) })] })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { children: "Start Date *" }), _jsx(Input, { disabled: readOnly, className: "border", type: "date", value: formData.startDate, onChange: (e) => updateFormData({ startDate: e.target.value }) })] }), _jsxs("div", { children: [_jsx(Label, { children: "End Date (Optional)" }), _jsx(Input, { disabled: readOnly, className: "border", type: "date", value: formData.endDate || '', onChange: (e) => updateFormData({ endDate: e.target.value || undefined }) })] })] }), formData.frequency === 'weekly' && (_jsxs("div", { children: [_jsx(Label, { children: "Day of Week" }), _jsxs(Select, { value: formData.dayOfWeek?.toString(), onValueChange: (value) => updateFormData({ dayOfWeek: parseInt(value) }), children: [_jsx(SelectTrigger, { className: "border", disabled: readOnly, children: _jsx(SelectValue, { placeholder: "Select day of week" }) }), _jsx(SelectContent, { children: dayOfWeekOptions.map((day) => (_jsx(SelectItem, { value: day.value.toString(), children: day.label }, day.value))) })] })] })), (formData.frequency === 'monthly' || formData.frequency === 'quarterly' || formData.frequency === 'yearly') && (_jsxs("div", { children: [_jsx(Label, { children: "Day of Month" }), _jsxs(Select, { value: formData.dayOfMonth?.toString(), onValueChange: (value) => updateFormData({ dayOfMonth: parseInt(value) }), children: [_jsx(SelectTrigger, { className: "border", disabled: readOnly, children: _jsx(SelectValue, { placeholder: "Select day of month" }) }), _jsx(SelectContent, { children: dayOfMonthOptions.map((day) => (_jsx(SelectItem, { value: day.value.toString(), children: day.label }, day.value))) })] })] })), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "businessDaysOnly", disabled: readOnly, checked: formData.businessDaysOnly, onCheckedChange: (checked) => updateFormData({ businessDaysOnly: !!checked }) }), _jsx(Label, { htmlFor: "businessDaysOnly", children: "Business days only (Monday-Friday)" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "skipHolidays", disabled: readOnly, checked: formData.skipHolidays, onCheckedChange: (checked) => updateFormData({ skipHolidays: !!checked }) }), _jsx(Label, { htmlFor: "skipHolidays", children: "Skip holidays" })] })] })] })] }) }), _jsx(TabsContent, { value: "conditions", className: "space-y-4", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Conditional Logic" }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "skipIfOutstandingBalance", disabled: readOnly, checked: formData.skipIfOutstandingBalance, onCheckedChange: (checked) => updateFormData({ skipIfOutstandingBalance: !!checked }) }), _jsx(Label, { htmlFor: "skipIfOutstandingBalance", children: "Skip if customer has outstanding balance" })] }), formData.skipIfOutstandingBalance && (_jsxs("div", { className: "ml-6", children: [_jsx(Label, { children: "Maximum Outstanding Amount" }), _jsx(Input, { disabled: readOnly, className: "border font-mono text-right", type: "number", min: "0", step: "0.01", value: formData.maxOutstandingAmount || '', onChange: (e) => updateFormData({ maxOutstandingAmount: parseFloat(e.target.value) || undefined }), placeholder: "0.00" }), _jsx("p", { className: "text-sm text-gray-500 mt-1", children: "Skip generation if outstanding balance exceeds this amount" })] })), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "skipIfCustomerInactive", disabled: readOnly, checked: formData.skipIfCustomerInactive, onCheckedChange: (checked) => updateFormData({ skipIfCustomerInactive: !!checked }) }), _jsx(Label, { htmlFor: "skipIfCustomerInactive", children: "Skip if customer is inactive" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "requireApproval", disabled: readOnly, checked: formData.requireApproval, onCheckedChange: (checked) => updateFormData({ requireApproval: !!checked }) }), _jsx(Label, { htmlFor: "requireApproval", children: "Require approval before generation" })] }), formData.requireApproval && (_jsxs("div", { className: "ml-6", children: [_jsx(Label, { children: "Approval Workflow ID" }), _jsx(Input, { disabled: readOnly, className: "border", value: formData.approvalWorkflowId || '', onChange: (e) => updateFormData({ approvalWorkflowId: e.target.value }), placeholder: "workflow-id" })] }))] }), selectedCustomer && (_jsxs("div", { className: "mt-4 p-4 bg-blue-50 rounded-lg", children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx(Info, { className: "w-4 h-4 text-blue-600" }), _jsx("span", { className: "font-medium text-blue-900", children: "Customer Information" })] }), _jsxs("div", { className: "text-sm text-blue-800", children: [_jsxs("p", { children: [_jsx("strong", { children: "Status:" }), " ", selectedCustomer.status || 'Unknown'] }), _jsxs("p", { children: [_jsx("strong", { children: "Outstanding Balance:" }), " $", (selectedCustomer.outstandingBalance || 0).toFixed(2)] })] })] }))] })] }) }), _jsx(TabsContent, { value: "email", className: "space-y-4", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Email Settings" }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { children: "Email Template" }), _jsx(Textarea, { disabled: readOnly, className: "border", value: formData.emailTemplate || '', onChange: (e) => updateFormData({ emailTemplate: e.target.value }), placeholder: "Custom email template (HTML supported)", rows: 4 }), _jsxs("p", { className: "text-xs text-muted-foreground mt-1", children: ["Tip: Use variables like ", '{', '{', "customer.name", '}', '}', ", ", '{', '{', "invoice.total", '}', '}', ", ", '{', '{', "due_date", '}', '}', "."] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { children: "CC Emails" }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex gap-2", children: [_jsx(Input, { disabled: readOnly, className: "border", value: ccEmailInput, onChange: (e) => setCcEmailInput(e.target.value), placeholder: "email@example.com", onKeyPress: (e) => {
                                                                                if (e.key === 'Enter') {
                                                                                    e.preventDefault();
                                                                                    addEmail('cc', ccEmailInput);
                                                                                }
                                                                            } }), _jsx(Button, { type: "button", disabled: readOnly, onClick: () => addEmail('cc', ccEmailInput), children: "Add" })] }), _jsx("div", { className: "flex flex-wrap gap-1", children: (formData.ccEmails || []).map((email) => (_jsxs(Badge, { variant: "secondary", className: "flex items-center gap-1", children: [email, _jsx("button", { disabled: readOnly, type: "button", onClick: () => removeEmail('cc', email), className: "ml-1 hover:text-red-600", children: "\u00D7" })] }, email))) })] })] }), _jsxs("div", { children: [_jsx(Label, { children: "BCC Emails" }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex gap-2", children: [_jsx(Input, { disabled: readOnly, className: "border", value: bccEmailInput, onChange: (e) => setBccEmailInput(e.target.value), placeholder: "email@example.com", onKeyPress: (e) => {
                                                                                if (e.key === 'Enter') {
                                                                                    e.preventDefault();
                                                                                    addEmail('bcc', bccEmailInput);
                                                                                }
                                                                            } }), _jsx(Button, { type: "button", disabled: readOnly, onClick: () => addEmail('bcc', bccEmailInput), children: "Add" })] }), _jsx("div", { className: "flex flex-wrap gap-1", children: (formData.bccEmails || []).map((email) => (_jsxs(Badge, { variant: "secondary", className: "flex items-center gap-1", children: [email, _jsx("button", { disabled: readOnly, type: "button", onClick: () => removeEmail('bcc', email), className: "ml-1 hover:text-red-600", children: "\u00D7" })] }, email))) })] })] })] }), _jsxs("div", { children: [_jsx(Label, { children: "Reminder Days" }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex gap-2", children: [_jsx(Input, { disabled: readOnly, className: "border font-mono text-right", type: "number", min: "0", value: reminderDayInput, onChange: (e) => setReminderDayInput(e.target.value), placeholder: "Days before due date", onKeyPress: (e) => {
                                                                        if (e.key === 'Enter') {
                                                                            e.preventDefault();
                                                                            addReminderDay(reminderDayInput);
                                                                        }
                                                                    } }), _jsx(Button, { type: "button", disabled: readOnly, onClick: () => addReminderDay(reminderDayInput), children: "Add" })] }), _jsx("div", { className: "flex flex-wrap gap-1", children: (formData.reminderDays || []).map((day) => (_jsxs(Badge, { variant: "secondary", className: "flex items-center gap-1", children: [day, " days", _jsx("button", { disabled: readOnly, type: "button", onClick: () => removeReminderDay(day), className: "ml-1 hover:text-red-600", children: "\u00D7" })] }, day))) }), _jsx("p", { className: "text-sm text-gray-500", children: "Send reminder emails this many days before the due date" })] })] })] })] }) }), _jsx(TabsContent, { value: "lines", className: "space-y-4", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Line Items" }) }), _jsxs(CardContent, { className: "space-y-4", children: [(formData.lines || []).length > 0 && (_jsxs("div", { className: "grid grid-cols-12 gap-2 px-3 text-xs text-muted-foreground", children: [_jsx("div", { className: "col-span-5", children: "Description" }), _jsx("div", { className: "col-span-2 text-right", children: "Quantity" }), _jsx("div", { className: "col-span-2 text-right", children: "Unit Price" }), _jsx("div", { className: "col-span-2 text-right", children: "Tax %" }), _jsx("div", { className: "col-span-1" })] })), (formData.lines || []).map((line, idx) => (_jsxs("div", { className: "grid grid-cols-12 gap-2 items-end p-3 border rounded-lg", children: [_jsxs("div", { className: "col-span-5", children: [_jsx(Label, { children: "Description" }), _jsx(Input, { disabled: readOnly, className: "border", value: line.description, onChange: (e) => {
                                                                const lines = [...(formData.lines || [])];
                                                                lines[idx].description = e.target.value;
                                                                const totals = computeTotals(lines);
                                                                updateFormData({ lines, ...totals });
                                                            }, placeholder: "Item description" })] }), _jsxs("div", { className: "col-span-2", children: [_jsx(Label, { children: "Quantity" }), _jsx(Input, { disabled: readOnly, className: "border font-mono text-right", type: "number", min: "0", step: "0.01", value: line.quantity, onChange: (e) => {
                                                                const lines = [...(formData.lines || [])];
                                                                lines[idx].quantity = parseFloat(e.target.value) || 0;
                                                                const totals = computeTotals(lines);
                                                                updateFormData({ lines, ...totals });
                                                            } })] }), _jsxs("div", { className: "col-span-2", children: [_jsx(Label, { children: "Unit Price" }), _jsx(Input, { disabled: readOnly, className: "border font-mono text-right", type: "number", min: "0", step: "0.01", value: line.unitPrice, onChange: (e) => {
                                                                const lines = [...(formData.lines || [])];
                                                                lines[idx].unitPrice = parseFloat(e.target.value) || 0;
                                                                const totals = computeTotals(lines);
                                                                updateFormData({ lines, ...totals });
                                                            } })] }), _jsxs("div", { className: "col-span-2", children: [_jsx(Label, { children: "Tax Rate (%)" }), _jsx(Input, { disabled: readOnly, className: "border font-mono text-right", type: "number", min: "0", max: "100", step: "0.01", value: line.taxRate, onChange: (e) => {
                                                                const lines = [...(formData.lines || [])];
                                                                lines[idx].taxRate = parseFloat(e.target.value) || 0;
                                                                const totals = computeTotals(lines);
                                                                updateFormData({ lines, ...totals });
                                                            } })] }), _jsx("div", { className: "col-span-1", children: _jsx(Button, { type: "button", variant: "outline", size: "sm", disabled: readOnly, onClick: () => {
                                                            const lines = (formData.lines || []).filter((_, i) => i !== idx);
                                                            const totals = computeTotals(lines);
                                                            updateFormData({ lines, ...totals });
                                                        }, children: "\u00D7" }) })] }, idx))), _jsx(Button, { type: "button", variant: "outline", disabled: readOnly, onClick: () => {
                                                const lines = [...(formData.lines || []), { description: '', quantity: 1, unitPrice: 0, taxRate: 0 }];
                                                const totals = computeTotals(lines);
                                                updateFormData({ lines, ...totals });
                                            }, children: "Add Line Item" }), _jsxs("div", { className: "space-y-2 p-4 bg-gray-50 rounded-lg", children: [_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { children: "Subtotal:" }), _jsx("span", { children: formatCurrency(formData.subtotal || 0, formData.currency || 'USD') })] }), _jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { children: "Tax:" }), _jsx("span", { children: formatCurrency(formData.taxTotal || 0, formData.currency || 'USD') })] }), _jsxs("div", { className: "flex justify-between font-semibold border-t pt-2", children: [_jsx("span", { children: "Total:" }), _jsx("span", { children: formatCurrency(formData.totalAmount || 0, formData.currency || 'USD') })] })] })] })] }) })] })] }));
}
