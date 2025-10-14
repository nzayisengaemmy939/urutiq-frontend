import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Brain, TrendingUp, AlertTriangle, Target, Lightbulb, ThumbsUp, ThumbsDown, X, ChevronRight, Sparkles, Clock, CheckCircle, ChevronLeft, ChevronRight as ChevronRightIcon, ChevronsLeft, ChevronsRight, } from "lucide-react";
const initialInsights = [
    {
        id: "cf-001",
        type: "prediction",
        title: "Cash Flow Forecast",
        description: "Expected $45K shortfall in Q2 based on current trends",
        priority: "high",
        icon: TrendingUp,
        confidence: 87,
        timestamp: "2 hours ago",
        status: "new",
        actionable: true,
        impact: "High financial risk",
        suggestedAction: "Review upcoming expenses and consider credit line",
        learningFeedback: null,
    },
    {
        id: "an-002",
        type: "anomaly",
        title: "Unusual Expense Pattern",
        description: "Office supplies increased 340% for TechStart Inc",
        priority: "medium",
        icon: AlertTriangle,
        confidence: 94,
        timestamp: "4 hours ago",
        status: "new",
        actionable: true,
        impact: "Potential duplicate or fraud",
        suggestedAction: "Review and categorize recent office supply transactions",
        learningFeedback: null,
    },
    {
        id: "rec-003",
        type: "recommendation",
        title: "Tax Optimization",
        description: "Consider accelerating Q4 equipment purchases",
        priority: "low",
        icon: Target,
        confidence: 76,
        timestamp: "1 day ago",
        status: "viewed",
        actionable: true,
        impact: "Potential $8K tax savings",
        suggestedAction: "Schedule equipment purchases before year-end",
        learningFeedback: null,
    },
    {
        id: "ins-004",
        type: "insight",
        title: "Revenue Opportunity",
        description: "3 clients showing growth patterns for upselling",
        priority: "medium",
        icon: Lightbulb,
        confidence: 82,
        timestamp: "6 hours ago",
        status: "new",
        actionable: true,
        impact: "Potential 15% revenue increase",
        suggestedAction: "Prepare upselling proposals for identified clients",
        learningFeedback: null,
    },
];
const priorityColors = {
    high: "bg-red-50 text-red-700 border-red-200",
    medium: "bg-amber-50 text-amber-700 border-amber-200",
    low: "bg-cyan-50 text-cyan-700 border-cyan-200",
};
const statusColors = {
    new: "bg-cyan-500",
    viewed: "bg-blue-500",
    dismissed: "bg-gray-400",
    acted: "bg-green-500",
};
export function AIInsights() {
    const [insights, setInsights] = useState(initialInsights);
    const [expandedInsight, setExpandedInsight] = useState(null);
    const [isLearning, setIsLearning] = useState(false);
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const uidRef = useRef(null);
    useEffect(() => {
        uidRef.current = `uid-${Date.now()}`;
        const interval = setInterval(() => {
            // Simulate new AI insights being generated on the client only
            const shouldAddInsight = Math.random() > 0.95; // 5% chance every interval
            if (shouldAddInsight) {
                const newInsight = {
                    id: `ai-${Date.now()}`,
                    type: "insight",
                    title: "New AI Discovery",
                    description: "Pattern detected in recent transaction data",
                    priority: "medium",
                    icon: Sparkles,
                    confidence: Math.floor(Math.random() * 20) + 75,
                    timestamp: new Date().toISOString(),
                    status: "new",
                    actionable: true,
                    impact: "Efficiency improvement",
                    suggestedAction: "Review suggested optimizations",
                    learningFeedback: null,
                };
                setInsights((prev) => [newInsight, ...prev]);
            }
        }, 10000); // Check every 10 seconds
        return () => clearInterval(interval);
    }, []);
    const handleFeedback = (insightId, feedback) => {
        setIsLearning(true);
        setInsights((prev) => prev.map((insight) => (insight.id === insightId ? { ...insight, learningFeedback: feedback } : insight)));
        // Simulate AI learning process
        setTimeout(() => {
            setIsLearning(false);
            console.log(`[v0] AI learning from ${feedback} feedback for insight ${insightId}`);
        }, 1500);
    };
    const handleDismiss = (insightId) => {
        setInsights((prev) => prev.map((insight) => (insight.id === insightId ? { ...insight, status: "dismissed" } : insight)));
    };
    const handleMarkActed = (insightId) => {
        setInsights((prev) => prev.map((insight) => (insight.id === insightId ? { ...insight, status: "acted" } : insight)));
    };
    const handleViewInsight = (insightId) => {
        setInsights((prev) => prev.map((insight) => insight.id === insightId && insight.status === "new" ? { ...insight, status: "viewed" } : insight));
        setExpandedInsight(expandedInsight === insightId ? null : insightId);
    };
    const activeInsights = insights.filter((insight) => insight.status !== "dismissed");
    const newInsightsCount = insights.filter((insight) => insight.status === "new").length;
    // Pagination logic
    const totalInsights = activeInsights.length;
    const totalPages = Math.ceil(totalInsights / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedInsights = activeInsights.slice(startIndex, endIndex);
    return (_jsxs(Card, { className: "bg-card border-border", children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center justify-between text-foreground", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Brain, { className: "w-5 h-5 text-cyan-600" }), "AI Insights", newInsightsCount > 0 && (_jsxs(Badge, { variant: "secondary", className: "bg-cyan-100 text-cyan-700", children: [newInsightsCount, " new"] }))] }), isLearning && (_jsxs("div", { className: "flex items-center gap-2 text-xs text-muted-foreground", children: [_jsx(Sparkles, { className: "w-3 h-3 animate-pulse text-cyan-500" }), "Learning..."] }))] }) }), _jsxs(CardContent, { className: "space-y-3", children: [paginatedInsights.map((insight) => (_jsx("div", { className: "relative", children: _jsxs("div", { className: "p-4 bg-muted/30 rounded-lg border border-border hover:bg-muted/50 transition-colors", children: [_jsxs("div", { className: "flex items-start justify-between mb-2", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("div", { className: "relative", children: [_jsx(insight.icon, { className: "w-4 h-4 text-muted-foreground" }), _jsx("div", { className: `absolute -top-1 -right-1 w-2 h-2 rounded-full ${statusColors[insight.status]}`, title: `Status: ${insight.status}` })] }), _jsx("h4", { className: "text-sm font-medium text-foreground", children: insight.title }), _jsxs("div", { className: "flex items-center gap-1 text-xs text-muted-foreground", children: [_jsx(Clock, { className: "w-3 h-3" }), insight.timestamp] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Badge, { variant: "outline", className: priorityColors[insight.priority], children: insight.priority }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => handleViewInsight(insight.id), className: "h-6 w-6 p-0", children: _jsx(ChevronRight, { className: `w-3 h-3 transition-transform ${expandedInsight === insight.id ? "rotate-90" : ""}` }) })] })] }), _jsx("p", { className: "text-sm text-muted-foreground mb-3", children: insight.description }), _jsx("div", { className: "flex items-center justify-between mb-3", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-xs text-muted-foreground", children: "Confidence:" }), _jsx(Progress, { value: insight.confidence, className: "w-16 h-1" }), _jsxs("span", { className: "text-xs font-medium", children: [insight.confidence, "%"] })] }) }), expandedInsight === insight.id && (_jsxs("div", { className: "mt-4 pt-4 border-t border-border space-y-3", children: [insight.impact && (_jsxs("div", { children: [_jsx("span", { className: "text-xs font-medium text-muted-foreground", children: "Impact: " }), _jsx("span", { className: "text-xs text-foreground", children: insight.impact })] })), insight.suggestedAction && (_jsxs("div", { children: [_jsx("span", { className: "text-xs font-medium text-muted-foreground", children: "Suggested Action: " }), _jsx("span", { className: "text-xs text-foreground", children: insight.suggestedAction })] })), _jsxs("div", { className: "flex items-center justify-between pt-2", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-xs text-muted-foreground", children: "Was this helpful?" }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => handleFeedback(insight.id, "positive"), className: `h-6 w-6 p-0 ${insight.learningFeedback === "positive" ? "text-green-600" : ""}`, disabled: insight.learningFeedback !== null, children: _jsx(ThumbsUp, { className: "w-3 h-3" }) }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => handleFeedback(insight.id, "negative"), className: `h-6 w-6 p-0 ${insight.learningFeedback === "negative" ? "text-red-600" : ""}`, disabled: insight.learningFeedback !== null, children: _jsx(ThumbsDown, { className: "w-3 h-3" }) })] }), _jsxs("div", { className: "flex items-center gap-1", children: [insight.actionable && insight.status !== "acted" && (_jsxs(Button, { variant: "outline", size: "sm", onClick: () => handleMarkActed(insight.id), className: "h-6 text-xs px-2 bg-transparent", children: [_jsx(CheckCircle, { className: "w-3 h-3 mr-1" }), "Mark as Acted"] })), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => handleDismiss(insight.id), className: "h-6 w-6 p-0 text-muted-foreground hover:text-foreground", children: _jsx(X, { className: "w-3 h-3" }) })] })] })] }))] }) }, insight.id))), totalPages > 1 && (_jsxs("div", { className: "flex items-center justify-between mt-6 pt-6 border-t border-border", children: [_jsxs("div", { className: "text-sm text-muted-foreground", children: ["Showing ", startIndex + 1, " to ", Math.min(endIndex, totalInsights), " of ", totalInsights, " insights"] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Button, { variant: "outline", size: "sm", onClick: () => setCurrentPage(1), disabled: currentPage === 1, children: _jsx(ChevronsLeft, { className: "h-4 w-4" }) }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => setCurrentPage(currentPage - 1), disabled: currentPage === 1, children: _jsx(ChevronLeft, { className: "h-4 w-4" }) }), _jsxs("span", { className: "text-sm text-muted-foreground", children: ["Page ", currentPage, " of ", totalPages] }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => setCurrentPage(currentPage + 1), disabled: currentPage === totalPages, children: _jsx(ChevronRightIcon, { className: "h-4 w-4" }) }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => setCurrentPage(totalPages), disabled: currentPage === totalPages, children: _jsx(ChevronsRight, { className: "h-4 w-4" }) })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-sm text-muted-foreground", children: "Page size:" }), _jsxs(Select, { value: pageSize.toString(), onValueChange: (value) => {
                                            setPageSize(parseInt(value));
                                            setCurrentPage(1);
                                        }, children: [_jsx(SelectTrigger, { className: "w-20", children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "5", children: "5" }), _jsx(SelectItem, { value: "10", children: "10" }), _jsx(SelectItem, { value: "20", children: "20" }), _jsx(SelectItem, { value: "50", children: "50" })] })] })] })] })), activeInsights.length === 0 && (_jsxs("div", { className: "text-center py-8 text-muted-foreground", children: [_jsx(Brain, { className: "w-8 h-8 mx-auto mb-2 opacity-50" }), _jsx("p", { className: "text-sm", children: "No active AI insights at the moment" }), _jsx("p", { className: "text-xs mt-1", children: "AI is continuously analyzing your data for new patterns" })] }))] })] }));
}
