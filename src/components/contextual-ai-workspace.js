import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Brain, AlertTriangle, TrendingUp, Clock, Target, Zap, CheckCircle, XCircle, Calendar, DollarSign, } from "lucide-react";
const mockWorkspaceContext = {
    userRole: "cfo",
    currentFocus: ["Q4 Planning", "Cash Flow Management", "Tax Preparation"],
    urgentTasks: 3,
    cashFlowStatus: "warning",
    complianceDeadlines: 2,
};
const mockRecommendations = [
    {
        id: "1",
        type: "warning",
        title: "Cash Flow Alert",
        description: "Projected cash shortfall in 3 weeks. Consider accelerating collections or securing bridge financing.",
        priority: "high",
        confidence: 94,
        estimatedTime: "15 min",
        impact: "Prevent $25K shortfall",
        category: "Cash Management",
    },
    {
        id: "2",
        type: "opportunity",
        title: "Tax Optimization",
        description: "Equipment purchase before year-end could save $8,500 in taxes.",
        priority: "medium",
        confidence: 87,
        estimatedTime: "30 min",
        impact: "Save $8,500",
        category: "Tax Planning",
    },
    {
        id: "3",
        type: "action",
        title: "Invoice Follow-up",
        description: "5 invoices over 30 days past due. Automated reminders recommended.",
        priority: "high",
        confidence: 98,
        estimatedTime: "5 min",
        impact: "Collect $12,300",
        category: "Collections",
    },
    {
        id: "4",
        type: "insight",
        title: "Expense Pattern",
        description: "Marketing spend ROI improved 23% this quarter. Consider budget reallocation.",
        priority: "low",
        confidence: 76,
        estimatedTime: "20 min",
        impact: "Optimize $15K budget",
        category: "Budget Planning",
    },
];
export function ContextualAIWorkspace() {
    const [context, setContext] = useState(mockWorkspaceContext);
    const [recommendations, setRecommendations] = useState(mockRecommendations);
    const [dismissedItems, setDismissedItems] = useState([]);
    const [activeCategory, setActiveCategory] = useState("all");
    const getRoleDisplayName = (role) => {
        const roleMap = {
            cfo: "Chief Financial Officer",
            accountant: "Accountant",
            bookkeeper: "Bookkeeper",
            business_owner: "Business Owner",
        };
        return roleMap[role] || role;
    };
    const getStatusColor = (status) => {
        switch (status) {
            case "healthy":
                return "text-green-600 bg-green-50 border-green-200";
            case "warning":
                return "text-yellow-600 bg-yellow-50 border-yellow-200";
            case "critical":
                return "text-red-600 bg-red-50 border-red-200";
            default:
                return "text-gray-600 bg-gray-50 border-gray-200";
        }
    };
    const getTypeIcon = (type) => {
        switch (type) {
            case "warning":
                return _jsx(AlertTriangle, { className: "h-4 w-4 text-yellow-500" });
            case "opportunity":
                return _jsx(TrendingUp, { className: "h-4 w-4 text-green-500" });
            case "action":
                return _jsx(Target, { className: "h-4 w-4 text-blue-500" });
            case "insight":
                return _jsx(Brain, { className: "h-4 w-4 text-purple-500" });
            default:
                return _jsx(Zap, { className: "h-4 w-4 text-gray-500" });
        }
    };
    const handleDismiss = (id) => {
        setDismissedItems([...dismissedItems, id]);
    };
    const handleTakeAction = (recommendation) => {
        // Simulate taking action
        console.log("[v0] Taking action on recommendation:", recommendation.title);
        handleDismiss(recommendation.id);
    };
    const filteredRecommendations = recommendations.filter((rec) => !dismissedItems.includes(rec.id) && (activeCategory === "all" || rec.category === activeCategory));
    const categories = ["all", ...Array.from(new Set(recommendations.map((r) => r.category)))];
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs(Card, { className: "border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50", children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Brain, { className: "h-6 w-6 text-blue-600" }), _jsxs("div", { children: [_jsx(CardTitle, { className: "text-blue-900", children: "AI Workspace" }), _jsxs("p", { className: "text-sm text-blue-700 mt-1", children: ["Personalized for ", getRoleDisplayName(context.userRole)] })] })] }), _jsx(Badge, { variant: "secondary", className: "bg-blue-100 text-blue-700", children: "Context-Aware" })] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Target, { className: "h-4 w-4 text-blue-600" }), _jsxs("div", { children: [_jsx("div", { className: "text-sm font-medium text-gray-900", children: "Current Focus" }), _jsx("div", { className: "text-xs text-gray-600", children: context.currentFocus.join(", ") })] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Clock, { className: "h-4 w-4 text-orange-600" }), _jsxs("div", { children: [_jsx("div", { className: "text-sm font-medium text-gray-900", children: "Urgent Tasks" }), _jsxs("div", { className: "text-xs text-gray-600", children: [context.urgentTasks, " items"] })] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(DollarSign, { className: "h-4 w-4 text-green-600" }), _jsxs("div", { children: [_jsx("div", { className: "text-sm font-medium text-gray-900", children: "Cash Flow" }), _jsx(Badge, { variant: "outline", className: getStatusColor(context.cashFlowStatus), children: context.cashFlowStatus })] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Calendar, { className: "h-4 w-4 text-purple-600" }), _jsxs("div", { children: [_jsx("div", { className: "text-sm font-medium text-gray-900", children: "Deadlines" }), _jsxs("div", { className: "text-xs text-gray-600", children: [context.complianceDeadlines, " upcoming"] })] })] })] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Zap, { className: "h-5 w-5 text-cyan-600" }), "Smart Recommendations"] }), _jsx("div", { className: "flex gap-2", children: categories.map((category) => (_jsx(Button, { variant: activeCategory === category ? "default" : "outline", size: "sm", onClick: () => setActiveCategory(category), className: "text-xs", children: category === "all" ? "All" : category }, category))) })] }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: filteredRecommendations.map((recommendation) => (_jsx(Alert, { className: "border-l-4 border-l-cyan-400", children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex items-start gap-3 flex-1", children: [getTypeIcon(recommendation.type), _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [_jsx("h4", { className: "font-medium text-gray-900", children: recommendation.title }), _jsx(Badge, { variant: recommendation.priority === "high"
                                                                        ? "destructive"
                                                                        : recommendation.priority === "medium"
                                                                            ? "default"
                                                                            : "secondary", className: "text-xs", children: recommendation.priority }), _jsx(Badge, { variant: "outline", className: "text-xs", children: recommendation.category })] }), _jsx(AlertDescription, { className: "text-sm text-gray-600 mb-3", children: recommendation.description }), _jsxs("div", { className: "flex items-center gap-4 text-xs text-gray-500", children: [_jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Clock, { className: "h-3 w-3" }), recommendation.estimatedTime] }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Target, { className: "h-3 w-3" }), recommendation.impact] }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Brain, { className: "h-3 w-3" }), recommendation.confidence, "% confident"] })] }), _jsx("div", { className: "mt-2", children: _jsx(Progress, { value: recommendation.confidence, className: "h-1" }) })] })] }), _jsxs("div", { className: "flex gap-2 ml-4", children: [_jsxs(Button, { size: "sm", onClick: () => handleTakeAction(recommendation), className: "bg-cyan-600 hover:bg-cyan-700", children: [_jsx(CheckCircle, { className: "h-3 w-3 mr-1" }), "Take Action"] }), _jsxs(Button, { size: "sm", variant: "outline", onClick: () => handleDismiss(recommendation.id), children: [_jsx(XCircle, { className: "h-3 w-3 mr-1" }), "Dismiss"] })] })] }) }, recommendation.id))) }) })] })] }));
}
