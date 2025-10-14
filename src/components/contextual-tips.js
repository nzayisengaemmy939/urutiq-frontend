import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { X, Lightbulb, AlertTriangle, TrendingUp } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
const contextualTips = [
    {
        id: 1,
        type: "duplicate",
        icon: AlertTriangle,
        title: "Potential Duplicate Detected",
        message: "Office supplies expense for $45.99 looks similar to yesterday's entry. Review?",
        action: "Review",
        color: "text-cyan-700 bg-cyan-50 border-cyan-200",
    },
    {
        id: 2,
        type: "insight",
        icon: TrendingUp,
        title: "Revenue Opportunity",
        message: "Acme Corp's payment is 5 days overdue. Send automated reminder?",
        action: "Send Reminder",
        color: "text-cyan-700 bg-cyan-50 border-cyan-200",
    },
    {
        id: 3,
        type: "suggestion",
        icon: Lightbulb,
        title: "Smart Categorization",
        message: "AI suggests categorizing 'Zoom Pro' as 'Software Subscriptions' instead of 'Office Expenses'",
        action: "Apply",
        color: "text-cyan-700 bg-cyan-50 border-cyan-200",
    },
];
export function ContextualTips() {
    const [tips, setTips] = useState(contextualTips);
    const dismissTip = (id) => {
        setTips(tips.filter((tip) => tip.id !== id));
    };
    if (tips.length === 0)
        return null;
    return (_jsx("div", { className: "space-y-2", children: tips.map((tip) => (_jsx(Card, { className: `border ${tip.color}`, children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex items-start space-x-3", children: [_jsx(tip.icon, { className: `h-5 w-5 mt-0.5 ${tip.color.split(" ")[0]}` }), _jsxs("div", { className: "flex-1", children: [_jsx("h4", { className: "font-medium text-sm", children: tip.title }), _jsx("p", { className: "text-sm text-muted-foreground mt-1", children: tip.message })] })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Button, { size: "sm", variant: "outline", className: "h-8 text-xs bg-transparent", children: tip.action }), _jsx(Button, { size: "sm", variant: "ghost", className: "h-8 w-8 p-0", onClick: () => dismissTip(tip.id), children: _jsx(X, { className: "h-4 w-4" }) })] })] }) }) }, tip.id))) }));
}
