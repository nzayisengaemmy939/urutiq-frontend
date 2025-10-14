import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Building2, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
const clients = [
    {
        name: "Acme Corporation",
        industry: "Technology",
        revenue: "$1,247,392",
        status: "healthy",
        trend: "up",
        change: "+15.2%",
        alerts: 0,
    },
    {
        name: "TechStart Inc",
        industry: "Software",
        revenue: "$892,847",
        status: "attention",
        trend: "up",
        change: "+8.7%",
        alerts: 2,
    },
    {
        name: "Local Bakery Co",
        industry: "Food Service",
        revenue: "$156,293",
        status: "healthy",
        trend: "down",
        change: "-3.1%",
        alerts: 0,
    },
    {
        name: "Green Energy LLC",
        industry: "Energy",
        revenue: "$550,860",
        status: "critical",
        trend: "down",
        change: "-12.4%",
        alerts: 5,
    },
];
const statusColors = {
    healthy: "bg-green-100 text-green-800 border-green-200",
    attention: "bg-yellow-100 text-yellow-800 border-yellow-200",
    critical: "bg-red-100 text-red-800 border-red-200",
};
export function ClientOverview() {
    const totalRevenue = clients.reduce((sum, client) => {
        const revenue = parseFloat(client.revenue.replace(/[$,]/g, ''));
        return sum + revenue;
    }, 0);
    const totalAlerts = clients.reduce((sum, client) => sum + client.alerts, 0);
    return (_jsxs(Card, { className: "bg-card border-border", children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2 text-foreground", children: [_jsx(Building2, { className: "w-5 h-5 text-primary" }), "Client Overview"] }), _jsxs("div", { className: "flex items-center gap-4 text-sm text-muted-foreground", children: [_jsxs("span", { children: [clients.length, " clients"] }), _jsx("span", { children: "\u2022" }), _jsxs("span", { children: ["$", totalRevenue.toLocaleString(), " total revenue"] }), totalAlerts > 0 && (_jsxs(_Fragment, { children: [_jsx("span", { children: "\u2022" }), _jsxs("span", { className: "text-destructive", children: [totalAlerts, " alerts"] })] }))] })] }), _jsx(CardContent, { className: "space-y-4", children: clients.map((client, index) => (_jsxs("div", { className: "p-4 bg-muted/50 rounded-lg border border-border hover:bg-muted/70 transition-colors", children: [_jsxs("div", { className: "flex items-start justify-between mb-2", children: [_jsxs("div", { children: [_jsx("h4", { className: "text-sm font-medium text-foreground", children: client.name }), _jsx("p", { className: "text-xs text-muted-foreground", children: client.industry })] }), _jsxs("div", { className: "flex items-center gap-2", children: [client.alerts > 0 && (_jsxs("div", { className: "flex items-center gap-1 px-2 py-1 bg-destructive/10 rounded-full", children: [_jsx(AlertCircle, { className: "w-3 h-3 text-destructive" }), _jsx("span", { className: "text-xs text-destructive font-medium", children: client.alerts })] })), _jsx(Badge, { variant: "outline", className: statusColors[client.status], children: client.status })] })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium text-foreground", children: client.revenue }), _jsxs("div", { className: "flex items-center gap-1", children: [client.trend === "up" ? (_jsx(TrendingUp, { className: "w-3 h-3 text-green-500" })) : (_jsx(TrendingDown, { className: "w-3 h-3 text-red-500" })), _jsx("span", { className: `text-xs font-medium ${client.trend === "up" ? "text-green-500" : "text-red-500"}`, children: client.change })] })] })] }, `${client.name}-${index}`))) })] }));
}
