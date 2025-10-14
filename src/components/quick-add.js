import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Plus, Receipt, CreditCard, FileText, DollarSign, Calendar, Building2, Tag, Zap, Clock, Copy, Wand2, History, Star, } from "lucide-react";
import { cn } from "../lib/utils";
const transactionTypes = [
    { id: "income", label: "Income", icon: DollarSign, color: "text-green-600 bg-green-50 border-green-200" },
    { id: "expense", label: "Expense", icon: Receipt, color: "text-red-600 bg-red-50 border-red-200" },
    { id: "invoice", label: "Invoice", icon: FileText, color: "text-blue-600 bg-blue-50 border-blue-200" },
    { id: "payment", label: "Payment", icon: CreditCard, color: "text-purple-600 bg-purple-50 border-purple-200" },
];
const recentTransactions = [
    { description: "Office supplies", amount: "245.50", client: "Acme Corp", category: "Office Expenses" },
    { description: "Software subscription", amount: "99.00", client: "TechStart Inc", category: "Software" },
    { description: "Consulting payment", amount: "2500.00", client: "Local Bakery", category: "Revenue" },
];
const frequentClients = ["Acme Corp", "TechStart Inc", "Local Bakery", "Global Solutions"];
const commonCategories = ["Office Expenses", "Software", "Travel", "Marketing", "Revenue", "Utilities"];
const workflowTemplates = [
    {
        id: "monthly-expenses",
        name: "Monthly Recurring Expenses",
        description: "Rent, utilities, subscriptions",
        icon: Clock,
        transactions: [
            { description: "Office rent", amount: "2500.00", category: "Rent" },
            { description: "Internet service", amount: "89.99", category: "Utilities" },
            { description: "Software subscriptions", amount: "299.00", category: "Software" },
        ],
    },
    {
        id: "client-invoice",
        name: "Standard Client Invoice",
        description: "Consulting services template",
        icon: FileText,
        transactions: [{ description: "Consulting services", amount: "1500.00", category: "Revenue" }],
    },
];
export function QuickAdd() {
    const [isExpanded, setIsExpanded] = useState(false);
    const [selectedType, setSelectedType] = useState("");
    const [showTemplates, setShowTemplates] = useState(false);
    const [showRecent, setShowRecent] = useState(false);
    const [aiSuggestions, setAiSuggestions] = useState([]);
    const [formData, setFormData] = useState({
        description: "",
        amount: "",
        client: "",
        category: "",
        date: new Date().toISOString().split("T")[0],
    });
    useEffect(() => {
        if (formData.description.length > 2) {
            const suggestions = [];
            if (formData.description.toLowerCase().includes("office")) {
                suggestions.push("Office Expenses");
            }
            if (formData.description.toLowerCase().includes("software")) {
                suggestions.push("Software");
            }
            if (formData.description.toLowerCase().includes("travel")) {
                suggestions.push("Travel");
            }
            setAiSuggestions(suggestions);
        }
        else {
            setAiSuggestions([]);
        }
    }, [formData.description]);
    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("[v0] Transaction submitted:", { type: selectedType, ...formData });
        // Reset form
        setFormData({
            description: "",
            amount: "",
            client: "",
            category: "",
            date: new Date().toISOString().split("T")[0],
        });
        setSelectedType("");
        setIsExpanded(false);
    };
    const handleApplyTemplate = (template) => {
        console.log("[v0] Applying template:", template.name);
        // In a real app, this would create multiple transactions
        setIsExpanded(false);
        setShowTemplates(false);
    };
    const handleDuplicateTransaction = (transaction) => {
        setFormData({
            description: transaction.description,
            amount: transaction.amount,
            client: transaction.client,
            category: transaction.category,
            date: new Date().toISOString().split("T")[0],
        });
        setSelectedType("expense"); // Default to expense for duplicated transactions
        setShowRecent(false);
    };
    if (!isExpanded) {
        return (_jsx(Card, { className: "bg-gradient-to-r from-primary/5 to-cyan-500/5 border-primary/20", children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { onClick: () => setIsExpanded(true), className: "flex-1 h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium", "data-quick-add": true, children: [_jsx(Plus, { className: "w-5 h-5 mr-2" }), "Quick Add Transaction", _jsx(Zap, { className: "w-4 h-4 ml-2 opacity-70" })] }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => setShowTemplates(true), className: "px-3 bg-transparent", title: "Workflow Templates", children: _jsx(Wand2, { className: "w-4 h-4" }) }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => setShowRecent(true), className: "px-3 bg-transparent", title: "Recent Transactions", children: _jsx(History, { className: "w-4 h-4" }) })] }) }) }));
    }
    return (_jsx(Card, { className: "bg-gradient-to-r from-primary/5 to-cyan-500/5 border-primary/20", children: _jsxs(CardContent, { className: "p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsxs("h3", { className: "text-lg font-semibold text-foreground flex items-center gap-2", children: [_jsx(Zap, { className: "w-5 h-5 text-primary" }), "Quick Add Transaction"] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Button, { variant: "ghost", size: "sm", onClick: () => setShowTemplates(!showTemplates), className: cn("text-muted-foreground hover:text-foreground", showTemplates && "text-primary"), children: _jsx(Wand2, { className: "w-4 h-4" }) }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => setShowRecent(!showRecent), className: cn("text-muted-foreground hover:text-foreground", showRecent && "text-primary"), children: _jsx(History, { className: "w-4 h-4" }) }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => setIsExpanded(false), className: "text-muted-foreground hover:text-foreground", children: "\u00D7" })] })] }), showTemplates && (_jsxs("div", { className: "mb-6 p-4 bg-muted/30 rounded-lg border border-border", children: [_jsxs("h4", { className: "text-sm font-medium text-foreground mb-3 flex items-center gap-2", children: [_jsx(Wand2, { className: "w-4 h-4 text-cyan-600" }), "Workflow Templates"] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3", children: workflowTemplates.map((template) => (_jsxs("div", { className: "p-3 bg-background rounded-lg border border-border hover:border-primary/30 cursor-pointer transition-colors", onClick: () => handleApplyTemplate(template), children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx(template.icon, { className: "w-4 h-4 text-cyan-600" }), _jsx("span", { className: "text-sm font-medium", children: template.name }), _jsxs(Badge, { variant: "secondary", className: "text-xs ml-auto", children: [template.transactions.length, " items"] })] }), _jsx("p", { className: "text-xs text-muted-foreground", children: template.description })] }, template.id))) })] })), showRecent && (_jsxs("div", { className: "mb-6 p-4 bg-muted/30 rounded-lg border border-border", children: [_jsxs("h4", { className: "text-sm font-medium text-foreground mb-3 flex items-center gap-2", children: [_jsx(History, { className: "w-4 h-4 text-cyan-600" }), "Recent Transactions"] }), _jsx("div", { className: "space-y-2", children: recentTransactions.map((transaction, index) => (_jsxs("div", { className: "flex items-center justify-between p-2 bg-background rounded border border-border hover:border-primary/30 cursor-pointer transition-colors", onClick: () => handleDuplicateTransaction(transaction), children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Copy, { className: "w-3 h-3 text-muted-foreground" }), _jsxs("div", { children: [_jsx("span", { className: "text-sm font-medium", children: transaction.description }), _jsxs("div", { className: "flex items-center gap-2 text-xs text-muted-foreground", children: [_jsx("span", { children: transaction.client }), _jsx("span", { children: "\u2022" }), _jsx("span", { children: transaction.category })] })] })] }), _jsxs("span", { className: "text-sm font-medium", children: ["$", transaction.amount] })] }, index))) })] })), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [_jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-foreground mb-3 block", children: "Transaction Type" }), _jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3", children: transactionTypes.map((type) => (_jsxs("button", { type: "button", onClick: () => setSelectedType(type.id), className: cn("p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-2 hover:scale-105", selectedType === type.id ? type.color : "bg-background border-border hover:border-primary/30"), children: [_jsx(type.icon, { className: "w-5 h-5" }), _jsx("span", { className: "text-xs font-medium", children: type.label })] }, type.id))) })] }), selectedType && (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "md:col-span-2", children: [_jsx("label", { className: "text-sm font-medium text-foreground mb-2 block", children: "Description" }), _jsx(Input, { placeholder: "Enter transaction description...", value: formData.description, onChange: (e) => setFormData({ ...formData, description: e.target.value }), className: "bg-background", required: true }), aiSuggestions.length > 0 && (_jsxs("div", { className: "flex flex-wrap gap-1 mt-2", children: [_jsx("span", { className: "text-xs text-muted-foreground mr-2", children: "AI suggests:" }), aiSuggestions.map((suggestion, index) => (_jsxs(Button, { type: "button", variant: "ghost", size: "sm", onClick: () => setFormData({ ...formData, category: suggestion }), className: "h-6 text-xs px-2 bg-cyan-50 text-cyan-700 hover:bg-cyan-100", children: [_jsx(Star, { className: "w-3 h-3 mr-1" }), suggestion] }, index)))] }))] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-foreground mb-2 block", children: "Amount" }), _jsxs("div", { className: "relative", children: [_jsx(DollarSign, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" }), _jsx(Input, { type: "number", step: "0.01", placeholder: "0.00", value: formData.amount, onChange: (e) => setFormData({ ...formData, amount: e.target.value }), className: "pl-10 bg-background", required: true })] })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-foreground mb-2 block", children: "Date" }), _jsxs("div", { className: "relative", children: [_jsx(Calendar, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" }), _jsx(Input, { type: "date", value: formData.date, onChange: (e) => setFormData({ ...formData, date: e.target.value }), className: "pl-10 bg-background", required: true })] })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-foreground mb-2 block", children: "Client" }), _jsxs("div", { className: "relative", children: [_jsx(Building2, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" }), _jsx(Input, { placeholder: "Select or enter client...", value: formData.client, onChange: (e) => setFormData({ ...formData, client: e.target.value }), className: "pl-10 bg-background", list: "clients", required: true }), _jsx("datalist", { id: "clients", children: frequentClients.map((client) => (_jsx("option", { value: client }, client))) })] })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-foreground mb-2 block", children: "Category" }), _jsxs("div", { className: "relative", children: [_jsx(Tag, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" }), _jsx(Input, { placeholder: "Enter category...", value: formData.category, onChange: (e) => setFormData({ ...formData, category: e.target.value }), className: "pl-10 bg-background", list: "categories" }), _jsx("datalist", { id: "categories", children: commonCategories.map((category) => (_jsx("option", { value: category }, category))) })] })] })] })), selectedType && (_jsxs("div", { className: "flex gap-3 pt-4", children: [_jsxs(Button, { type: "submit", className: "flex-1 bg-primary hover:bg-primary/90 text-primary-foreground", children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), "Add Transaction"] }), _jsx(Button, { type: "button", variant: "outline", onClick: () => {
                                        setSelectedType("");
                                        setFormData({
                                            description: "",
                                            amount: "",
                                            client: "",
                                            category: "",
                                            date: new Date().toISOString().split("T")[0],
                                        });
                                    }, children: "Clear" })] }))] })] }) }));
}
