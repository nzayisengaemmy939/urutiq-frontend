import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { CreditCard, ArrowUpRight, ArrowDownLeft, Clock, MoreHorizontal } from "lucide-react";
const transactions = [
    {
        id: "TXN-001",
        type: "invoice",
        description: "Web Development Services - Acme Corp",
        amount: "$12,500.00",
        status: "paid",
        date: "2024-01-15",
        client: "Acme Corporation",
        direction: "in",
    },
    {
        id: "TXN-002",
        type: "expense",
        description: "Office Supplies - Staples",
        amount: "$847.32",
        status: "pending",
        date: "2024-01-14",
        client: "TechStart Inc",
        direction: "out",
    },
    {
        id: "TXN-003",
        type: "payment",
        description: "Vendor Payment - Cloud Services",
        amount: "$2,340.00",
        status: "processed",
        date: "2024-01-13",
        client: "Local Bakery Co",
        direction: "out",
    },
    {
        id: "TXN-004",
        type: "invoice",
        description: "Monthly Retainer - Green Energy",
        amount: "$5,000.00",
        status: "overdue",
        date: "2024-01-10",
        client: "Green Energy LLC",
        direction: "in",
    },
    {
        id: "TXN-005",
        type: "refund",
        description: "Service Refund - Client Request",
        amount: "$1,250.00",
        status: "processed",
        date: "2024-01-09",
        client: "TechStart Inc",
        direction: "out",
    },
];
const statusColors = {
    paid: "bg-green-100 text-green-800 border-green-200",
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    processed: "bg-blue-100 text-blue-800 border-blue-200",
    overdue: "bg-red-100 text-red-800 border-red-200",
};
export function RecentTransactions() {
    return (_jsxs(Card, { className: "bg-card border-border", children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs(CardTitle, { className: "flex items-center gap-2 text-foreground", children: [_jsx(CreditCard, { className: "w-5 h-5 text-primary" }), "Recent Transactions"] }), _jsx(Button, { variant: "outline", size: "sm", children: "View All" })] }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: transactions.map((transaction) => (_jsxs("div", { className: "flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border hover:bg-muted/70 transition-colors group", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "w-10 h-10 bg-background rounded-lg flex items-center justify-center border border-border", children: transaction.direction === "in" ? (_jsx(ArrowDownLeft, { className: "w-4 h-4 text-green-600" })) : (_jsx(ArrowUpRight, { className: "w-4 h-4 text-red-600" })) }), _jsxs("div", { children: [_jsx("h4", { className: "text-sm font-medium text-foreground", children: transaction.description }), _jsxs("div", { className: "flex items-center gap-2 text-xs text-muted-foreground", children: [_jsx("span", { children: transaction.client }), _jsx("span", { children: "\u2022" }), _jsx("span", { children: transaction.id }), _jsx("span", { children: "\u2022" }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Clock, { className: "w-3 h-3" }), transaction.date] })] })] })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Badge, { variant: "outline", className: statusColors[transaction.status], children: transaction.status }), _jsxs("span", { className: `text-sm font-medium ${transaction.direction === "in" ? "text-green-600" : "text-red-600"}`, children: [transaction.direction === "in" ? "+" : "-", transaction.amount] }), _jsx(Button, { variant: "ghost", size: "sm", className: "opacity-0 group-hover:opacity-100 transition-opacity", children: _jsx(MoreHorizontal, { className: "w-4 h-4" }) })] })] }, transaction.id))) }) })] }));
}
