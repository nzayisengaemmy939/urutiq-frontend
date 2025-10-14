import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, Users, FileText, AlertCircle } from "lucide-react";
const metrics = [
    {
        title: "Total Revenue",
        value: "$2,847,392",
        change: "+12.5%",
        trend: "up",
        icon: DollarSign,
        color: "text-chart-1",
    },
    {
        title: "Active Clients",
        value: "47",
        change: "+3",
        trend: "up",
        icon: Users,
        color: "text-chart-2",
    },
    {
        title: "Pending Invoices",
        value: "$184,293",
        change: "-8.2%",
        trend: "down",
        icon: FileText,
        color: "text-chart-4",
    },
    {
        title: "AI Anomalies",
        value: "12",
        change: "+4",
        trend: "up",
        icon: AlertCircle,
        color: "text-chart-3",
    },
];
export function FinancialMetrics() {
    return (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: metrics.map((metric) => (_jsxs(Card, { className: "bg-card border-border", children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium text-muted-foreground", children: metric.title }), _jsx(metric.icon, { className: `w-4 h-4 ${metric.color}` })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold text-foreground", children: metric.value }), _jsxs("div", { className: "flex items-center gap-1 text-xs", children: [metric.trend === "up" ? (_jsx(TrendingUp, { className: "w-3 h-3 text-green-500" })) : (_jsx(TrendingDown, { className: "w-3 h-3 text-red-500" })), _jsx("span", { className: metric.trend === "up" ? "text-green-500" : "text-red-500", children: metric.change }), _jsx("span", { className: "text-muted-foreground", children: "from last month" })] })] })] }, metric.title))) }));
}
