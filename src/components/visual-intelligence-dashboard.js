import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { TrendingUp, TrendingDown, AlertTriangle, Zap, Eye } from "lucide-react";
const financialStories = [
    {
        id: 1,
        title: "Cash Flow Recovery",
        description: "Your cash flow improved by 23% this month due to faster invoice collections",
        trend: "positive",
        impact: "high",
        visualization: "waterfall",
        data: { current: 45000, previous: 36500, change: 23 },
    },
    {
        id: 2,
        title: "Expense Pattern Alert",
        description: "Office supplies spending increased 45% - potential bulk purchase opportunity",
        trend: "neutral",
        impact: "medium",
        visualization: "heatmap",
        data: { current: 2800, previous: 1930, change: 45 },
    },
    {
        id: 3,
        title: "Revenue Growth Trajectory",
        description: "Q4 revenue on track to exceed projections by 12% based on current trends",
        trend: "positive",
        impact: "high",
        visualization: "forecast",
        data: { projected: 125000, current: 140000, confidence: 87 },
    },
];
const smartInsights = [
    {
        category: "Cash Flow",
        insight: "Peak collection period: Days 15-20 of each month",
        action: "Schedule follow-ups accordingly",
        confidence: 92,
    },
    {
        category: "Expenses",
        insight: "Software subscriptions can be optimized",
        action: "Review unused licenses",
        confidence: 78,
    },
    {
        category: "Revenue",
        insight: "Client retention rate: 94%",
        action: "Focus on expansion revenue",
        confidence: 96,
    },
];
export function VisualIntelligenceDashboard() {
    const [selectedStory, setSelectedStory] = useState(financialStories[0]);
    const [activeView, setActiveView] = useState("stories");
    return (_jsxs(Card, { className: "border-cyan-200 bg-gradient-to-br from-cyan-50 to-blue-50", children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Eye, { className: "h-5 w-5 text-cyan-600" }), _jsx(CardTitle, { className: "text-cyan-900", children: "Visual Intelligence" }), _jsx(Badge, { variant: "secondary", className: "bg-cyan-100 text-cyan-700", children: "AI-Powered" })] }), _jsx(Tabs, { value: activeView, onValueChange: setActiveView, className: "w-auto", children: _jsxs(TabsList, { className: "grid w-full grid-cols-2", children: [_jsx(TabsTrigger, { value: "stories", children: "Stories" }), _jsx(TabsTrigger, { value: "insights", children: "Insights" })] }) })] }) }), _jsx(CardContent, { children: _jsxs(Tabs, { value: activeView, onValueChange: setActiveView, className: "w-full", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-2 mb-4", children: [_jsx(TabsTrigger, { value: "stories", children: "Stories" }), _jsx(TabsTrigger, { value: "insights", children: "Insights" })] }), _jsx(TabsContent, { value: "stories", className: "space-y-4", children: _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-4", children: [_jsx("div", { className: "space-y-2", children: financialStories.map((story) => (_jsx("div", { className: `p-3 rounded-lg border cursor-pointer transition-all ${selectedStory.id === story.id
                                                ? "border-cyan-300 bg-cyan-50"
                                                : "border-gray-200 hover:border-cyan-200 hover:bg-cyan-25"}`, onClick: () => setSelectedStory(story), children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex-1", children: [_jsx("h4", { className: "font-medium text-sm text-gray-900", children: story.title }), _jsx("p", { className: "text-xs text-gray-600 mt-1", children: story.description })] }), _jsxs("div", { className: "flex items-center gap-1", children: [story.trend === "positive" ? (_jsx(TrendingUp, { className: "h-4 w-4 text-green-500" })) : story.trend === "negative" ? (_jsx(TrendingDown, { className: "h-4 w-4 text-red-500" })) : (_jsx(AlertTriangle, { className: "h-4 w-4 text-yellow-500" })), _jsx(Badge, { variant: story.impact === "high" ? "default" : "secondary", className: "text-xs", children: story.impact })] })] }) }, story.id))) }), _jsx("div", { className: "lg:col-span-2", children: _jsxs("div", { className: "bg-white rounded-lg border border-cyan-200 p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h3", { className: "font-semibold text-gray-900", children: selectedStory.title }), _jsx(Badge, { variant: "outline", className: "text-cyan-700 border-cyan-300", children: selectedStory.visualization })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-3 gap-4", children: [_jsxs("div", { className: "text-center", children: [_jsxs("div", { className: "text-2xl font-bold text-gray-900", children: ["$", selectedStory.data.current.toLocaleString()] }), _jsx("div", { className: "text-sm text-gray-600", children: "Current" })] }), _jsxs("div", { className: "text-center", children: [_jsxs("div", { className: "text-2xl font-bold text-gray-600", children: ["$", selectedStory.data?.previous?.toLocaleString()] }), _jsx("div", { className: "text-sm text-gray-600", children: "Previous" })] }), _jsxs("div", { className: "text-center", children: [_jsxs("div", { className: `text-2xl font-bold ${(selectedStory.data?.change ?? 0) > 0 ? "text-green-600" : "text-red-600"}`, children: [(selectedStory.data?.change ?? 0) > 0 ? "+" : "", (selectedStory.data?.change ?? 0), "%"] }), _jsx("div", { className: "text-sm text-gray-600", children: "Change" })] })] }), _jsx("div", { className: "h-32 bg-gradient-to-r from-cyan-100 to-blue-100 rounded-lg flex items-center justify-center", children: _jsxs("div", { className: "text-center text-gray-600", children: [_jsx(Zap, { className: "h-8 w-8 mx-auto mb-2 text-cyan-600" }), _jsxs("div", { className: "text-sm", children: ["Interactive ", selectedStory.visualization, " chart"] }), _jsx("div", { className: "text-xs", children: "Visualization renders here" })] }) })] })] }) })] }) }), _jsx(TabsContent, { value: "insights", className: "space-y-4", children: _jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: smartInsights.map((insight, index) => (_jsxs("div", { className: "bg-white rounded-lg border border-cyan-200 p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx(Badge, { variant: "outline", className: "text-cyan-700 border-cyan-300", children: insight.category }), _jsxs("div", { className: "text-sm text-gray-600", children: [insight.confidence, "% confident"] })] }), _jsx("h4", { className: "font-medium text-gray-900 mb-2", children: insight.insight }), _jsx("p", { className: "text-sm text-gray-600 mb-3", children: insight.action }), _jsx(Button, { size: "sm", variant: "outline", className: "w-full border-cyan-300 text-cyan-700 hover:bg-cyan-50 bg-transparent", children: "Take Action" })] }, index))) }) })] }) })] }));
}
