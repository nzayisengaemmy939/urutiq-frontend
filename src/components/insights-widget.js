import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useInsights, useGenerateInsights } from "../hooks/useParser";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
export function InsightsWidget({ companyId }) {
    const [category, setCategory] = useState(undefined);
    const [priority, setPriority] = useState(undefined);
    const { data, refetch, isLoading } = useInsights(companyId, { category, priority });
    const generate = useGenerateInsights();
    const rows = Array.isArray(data) ? data : data?.data || [];
    return (_jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between", children: [_jsx(CardTitle, { children: "AI Insights" }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { variant: "outline", size: "sm", onClick: () => refetch(), disabled: isLoading, children: "Refresh" }), _jsx(Button, { size: "sm", onClick: () => generate.mutate(companyId, { onSuccess: () => refetch() }), disabled: generate.isPending, children: "Generate" })] })] }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-3", children: rows?.length ? rows.map((ins) => (_jsxs("div", { className: "p-3 border rounded-lg", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("p", { className: "font-medium", children: ins.category || 'Insight' }), _jsx(Badge, { variant: ins.priority === 'high' ? 'destructive' : ins.priority === 'medium' ? 'secondary' : 'outline', children: ins.priority || 'medium' })] }), _jsx("p", { className: "text-sm text-gray-600 mt-1", children: ins.insightText })] }, ins.id))) : (_jsx("p", { className: "text-sm text-gray-500", children: "No insights available." })) }) })] }));
}
