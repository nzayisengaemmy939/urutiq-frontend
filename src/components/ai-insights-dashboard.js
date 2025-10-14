import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { AlertTriangle, Brain, TrendingUp, DollarSign, Zap, Eye, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { useAIInsightsList } from "../hooks/useAIInsightsList";
import { useState } from "react";
export function AIInsightsDashboard({ maxItems = 3, showHeader = true, compact = false, showViewAll = true }) {
    const { insights, loading, error, refetch } = useAIInsightsList();
    const [expandedInsight, setExpandedInsight] = useState(null);
    const [showAll, setShowAll] = useState(false);
    const getCategoryIcon = (category) => {
        switch (category.toLowerCase()) {
            case 'revenue':
                return _jsx(TrendingUp, { className: "h-4 w-4" });
            case 'cash_flow':
                return _jsx(DollarSign, { className: "h-4 w-4" });
            case 'expenses':
                return _jsx(Zap, { className: "h-4 w-4" });
            case 'risk':
                return _jsx(AlertTriangle, { className: "h-4 w-4" });
            default:
                return _jsx(Brain, { className: "h-4 w-4" });
        }
    };
    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'medium':
                return 'bg-amber-100 text-amber-800 border-amber-200';
            case 'low':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };
    const getImpactColor = (impact) => {
        switch (impact?.toLowerCase()) {
            case 'high':
                return 'text-red-600';
            case 'medium':
                return 'text-amber-600';
            case 'low':
                return 'text-blue-600';
            default:
                return 'text-gray-600';
        }
    };
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
        if (diffInHours < 1)
            return 'Just now';
        if (diffInHours < 24)
            return `${diffInHours}h ago`;
        if (diffInHours < 48)
            return 'Yesterday';
        return date.toLocaleDateString();
    };
    const displayInsights = showAll ? insights : insights.slice(0, maxItems);
    const hasMoreInsights = insights.length > maxItems;
    if (loading) {
        return (_jsxs(Card, { children: [showHeader && (_jsx(CardHeader, { className: "pb-3", children: _jsxs(CardTitle, { className: "text-lg flex items-center gap-2", children: [_jsx(Brain, { className: "h-5 w-5 text-blue-600" }), "AI Insights"] }) })), _jsx(CardContent, { children: _jsxs("div", { className: "flex items-center justify-center py-8", children: [_jsx(RefreshCw, { className: "h-4 w-4 animate-spin mr-2" }), _jsx("span", { className: "text-sm text-muted-foreground", children: "Loading AI insights..." })] }) })] }));
    }
    if (error) {
        return (_jsxs(Card, { children: [showHeader && (_jsx(CardHeader, { className: "pb-3", children: _jsxs(CardTitle, { className: "text-lg flex items-center gap-2", children: [_jsx(Brain, { className: "h-5 w-5 text-blue-600" }), "AI Insights"] }) })), _jsx(CardContent, { children: _jsxs("div", { className: "flex items-center justify-center py-8 text-red-600", children: [_jsx(AlertTriangle, { className: "h-4 w-4 mr-2" }), _jsx("span", { className: "text-sm", children: "Error loading insights" }), _jsx(Button, { variant: "ghost", size: "sm", onClick: refetch, className: "ml-2", children: _jsx(RefreshCw, { className: "h-3 w-3" }) })] }) })] }));
    }
    return (_jsxs(Card, { children: [showHeader && (_jsx(CardHeader, { className: "pb-3", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsxs(CardTitle, { className: "text-lg flex items-center gap-2", children: [_jsx(Brain, { className: "h-5 w-5 text-blue-600" }), "AI Insights", _jsx(Badge, { variant: "secondary", className: "ml-2", children: insights.length })] }), _jsx(CardDescription, { children: "AI-powered financial insights and recommendations" })] }), _jsx(Button, { variant: "ghost", size: "sm", onClick: refetch, children: _jsx(RefreshCw, { className: "h-4 w-4" }) })] }) })), _jsx(CardContent, { className: "space-y-3", children: displayInsights.length === 0 ? (_jsxs("div", { className: "text-center py-8 text-muted-foreground", children: [_jsx(Brain, { className: "h-8 w-8 mx-auto mb-2 opacity-50" }), _jsx("p", { className: "text-sm", children: "No AI insights available" }), _jsx("p", { className: "text-xs", children: "AI is analyzing your financial data" })] })) : (_jsxs(_Fragment, { children: [displayInsights.map((insight) => (_jsx("div", { className: `p-3 rounded-lg border transition-all hover:shadow-sm ${insight.priority === 'high'
                                ? 'border-red-200 bg-red-50'
                                : insight.priority === 'medium'
                                    ? 'border-amber-200 bg-amber-50'
                                    : 'border-blue-200 bg-blue-50'}`, children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx("div", { className: `p-1 rounded-full ${getPriorityColor(insight.priority)}`, children: getCategoryIcon(insight.category) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [_jsx(Badge, { variant: "outline", className: "text-xs", children: insight.category.replace('_', ' ').toUpperCase() }), _jsx(Badge, { variant: "secondary", className: `text-xs ${getPriorityColor(insight.priority)}`, children: insight.priority.toUpperCase() }), insight.confidence && (_jsxs("span", { className: "text-xs text-muted-foreground", children: [Math.round(insight.confidence * 100), "% confidence"] }))] }), _jsx("p", { className: `text-sm font-medium mb-1 ${compact ? 'line-clamp-2' : 'line-clamp-3'}`, children: insight.description }), _jsxs("div", { className: "flex items-center justify-between text-xs text-muted-foreground", children: [_jsx("span", { children: formatDate(insight.generatedAt) }), insight.impact && (_jsxs("span", { className: `font-medium ${getImpactColor(insight.impact)}`, children: [insight.impact.toUpperCase(), " IMPACT"] }))] }), !compact && insight.description.length > 100 && (_jsx(Button, { variant: "ghost", size: "sm", className: "mt-2 h-6 px-2 text-xs", onClick: () => setExpandedInsight(expandedInsight === insight.id ? null : insight.id), children: expandedInsight === insight.id ? 'Show less' : 'Show more' })), expandedInsight === insight.id && (_jsx("div", { className: "mt-2 p-2 bg-white/50 rounded border text-xs", children: _jsxs("p", { className: "text-muted-foreground", children: [_jsx("strong", { children: "Type:" }), " ", insight.type, _jsx("br", {}), _jsx("strong", { children: "Confidence:" }), " ", Math.round(insight.confidence * 100), "%", _jsx("br", {}), _jsx("strong", { children: "Impact:" }), " ", insight.impact] }) }))] }), _jsx(Button, { variant: "ghost", size: "sm", className: "opacity-0 group-hover:opacity-100", children: _jsx(Eye, { className: "h-3 w-3" }) })] }) }, insight.id))), showViewAll && hasMoreInsights && (_jsx("div", { className: "pt-2 border-t", children: _jsx(Button, { variant: "ghost", size: "sm", className: "w-full text-xs", onClick: () => setShowAll(!showAll), children: showAll ? (_jsxs(_Fragment, { children: [_jsx(ChevronUp, { className: "h-3 w-3 mr-1" }), "View Less (", maxItems, " of ", insights.length, ")"] })) : (_jsxs(_Fragment, { children: [_jsx(ChevronDown, { className: "h-3 w-3 mr-1" }), "View All ", insights.length, " Insights"] })) }) }))] })) })] }));
}
