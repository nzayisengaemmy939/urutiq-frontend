import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { Zap, Settings, Play, Plus, ArrowRight, Target, Clock, CheckCircle, BarChart3, FileText, Mail, DollarSign, Workflow, Bot, TrendingUp, } from "lucide-react";
const mockAutomationRules = [
    {
        id: "1",
        name: "Overdue Invoice Reminders",
        description: "Automatically send reminders for invoices past due",
        trigger: {
            type: "condition",
            value: "Invoice overdue > 30 days",
            details: "Check daily at 9:00 AM",
        },
        actions: [
            {
                type: "notify",
                value: "Send email reminder",
                details: "Email template: Overdue Invoice Reminder",
            },
            {
                type: "generate",
                value: "Create follow-up task",
                details: "Assign to collections team",
            },
        ],
        status: "active",
        performance: {
            executions: 45,
            successRate: 94,
            timeSaved: "3.2 hours/week",
            accuracy: 98,
        },
        category: "collections",
    },
    {
        id: "2",
        name: "Expense Categorization",
        description: "Smart categorization of expenses based on vendor and description",
        trigger: {
            type: "event",
            value: "New expense added",
            details: "Triggered on expense creation",
        },
        actions: [
            {
                type: "categorize",
                value: "Auto-assign category",
                details: "Based on ML model with 96% accuracy",
            },
        ],
        status: "active",
        performance: {
            executions: 234,
            successRate: 96,
            timeSaved: "5.1 hours/week",
            accuracy: 96,
        },
        category: "expenses",
    },
    {
        id: "3",
        name: "Bank Reconciliation",
        description: "Automatically match bank transactions with accounting records",
        trigger: {
            type: "schedule",
            value: "Daily at 6:00 AM",
            details: "Process overnight bank feeds",
        },
        actions: [
            {
                type: "reconcile",
                value: "Match transactions",
                details: "AI-powered matching with confidence scoring",
            },
            {
                type: "notify",
                value: "Flag discrepancies",
                details: "Alert for manual review",
            },
        ],
        status: "active",
        performance: {
            executions: 28,
            successRate: 89,
            timeSaved: "8.5 hours/week",
            accuracy: 92,
        },
        category: "reconciliation",
    },
];
const workflowTemplates = [
    {
        id: "1",
        name: "Invoice-to-Cash Automation",
        description: "Complete automation from invoice creation to payment collection",
        category: "invoicing",
        complexity: "advanced",
        estimatedSetup: "15 minutes",
        benefits: ["Reduce DSO by 25%", "Save 10+ hours/week", "Improve cash flow"],
        rules: [],
    },
    {
        id: "2",
        name: "Expense Management Workflow",
        description: "Automated expense categorization, approval, and reporting",
        category: "expenses",
        complexity: "intermediate",
        estimatedSetup: "10 minutes",
        benefits: ["95% auto-categorization", "Faster approvals", "Real-time reporting"],
        rules: [],
    },
    {
        id: "3",
        name: "Monthly Closing Automation",
        description: "Streamline month-end processes with automated reconciliation",
        category: "reporting",
        complexity: "advanced",
        estimatedSetup: "20 minutes",
        benefits: ["Close books 3 days faster", "Reduce errors by 80%", "Automated reports"],
        rules: [],
    },
];
export function IntelligentAutomationStudio() {
    const [automationRules, setAutomationRules] = useState(mockAutomationRules);
    const [selectedRule, setSelectedRule] = useState(null);
    const [isCreatingRule, setIsCreatingRule] = useState(false);
    const [activeCategory, setActiveCategory] = useState("all");
    const toggleRuleStatus = (ruleId) => {
        setAutomationRules(automationRules.map((rule) => rule.id === ruleId ? { ...rule, status: rule.status === "active" ? "paused" : "active" } : rule));
    };
    const getStatusColor = (status) => {
        switch (status) {
            case "active":
                return "bg-green-100 text-green-700";
            case "paused":
                return "bg-yellow-100 text-yellow-700";
            case "draft":
                return "bg-gray-100 text-gray-700";
            default:
                return "bg-gray-100 text-gray-700";
        }
    };
    const getCategoryIcon = (category) => {
        switch (category) {
            case "invoicing":
                return _jsx(FileText, { className: "h-4 w-4" });
            case "expenses":
                return _jsx(DollarSign, { className: "h-4 w-4" });
            case "reconciliation":
                return _jsx(BarChart3, { className: "h-4 w-4" });
            case "reporting":
                return _jsx(FileText, { className: "h-4 w-4" });
            case "collections":
                return _jsx(Mail, { className: "h-4 w-4" });
            default:
                return _jsx(Workflow, { className: "h-4 w-4" });
        }
    };
    const getComplexityColor = (complexity) => {
        switch (complexity) {
            case "simple":
                return "bg-green-100 text-green-700";
            case "intermediate":
                return "bg-yellow-100 text-yellow-700";
            case "advanced":
                return "bg-red-100 text-red-700";
            default:
                return "bg-gray-100 text-gray-700";
        }
    };
    const filteredRules = automationRules.filter((rule) => activeCategory === "all" || rule.category === activeCategory);
    const categories = ["all", ...Array.from(new Set(automationRules.map((r) => r.category)))];
    const totalExecutions = automationRules.reduce((sum, rule) => sum + rule.performance.executions, 0);
    const avgSuccessRate = Math.round(automationRules.reduce((sum, rule) => sum + rule.performance.successRate, 0) / automationRules.length);
    return (_jsxs(Card, { className: "border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50", children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Bot, { className: "h-5 w-5 text-purple-600" }), _jsx(CardTitle, { className: "text-purple-900", children: "Automation Studio" }), _jsxs(Badge, { variant: "secondary", className: "bg-purple-100 text-purple-700", children: [automationRules.filter((r) => r.status === "active").length, " Active"] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { size: "sm", variant: "outline", onClick: () => setIsCreatingRule(true), className: "border-purple-300 text-purple-700 bg-transparent", children: [_jsx(Plus, { className: "h-4 w-4 mr-1" }), "New Rule"] }), _jsxs(Button, { size: "sm", className: "bg-purple-600 hover:bg-purple-700", children: [_jsx(Settings, { className: "h-4 w-4 mr-1" }), "Settings"] })] })] }) }), _jsx(CardContent, { children: _jsxs(Tabs, { defaultValue: "rules", className: "w-full", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-4", children: [_jsx(TabsTrigger, { value: "rules", children: "Active Rules" }), _jsx(TabsTrigger, { value: "templates", children: "Templates" }), _jsx(TabsTrigger, { value: "analytics", children: "Analytics" }), _jsx(TabsTrigger, { value: "builder", children: "Rule Builder" })] }), _jsxs(TabsContent, { value: "rules", className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("div", { className: "flex gap-2", children: categories.map((category) => (_jsx(Button, { variant: activeCategory === category ? "default" : "outline", size: "sm", onClick: () => setActiveCategory(category), className: "text-xs", children: category === "all" ? "All" : category }, category))) }), _jsxs("div", { className: "text-sm text-gray-600", children: [filteredRules.length, " rules \u2022 ", totalExecutions, " total executions"] })] }), _jsx("div", { className: "space-y-3", children: filteredRules.map((rule) => (_jsxs("div", { className: "p-4 bg-white rounded-lg border border-purple-100", children: [_jsxs("div", { className: "flex items-start justify-between mb-3", children: [_jsxs("div", { className: "flex items-start gap-3", children: [_jsx("div", { className: "p-2 bg-purple-100 rounded-lg", children: getCategoryIcon(rule.category) }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [_jsx("h4", { className: "font-medium text-gray-900", children: rule.name }), _jsx(Badge, { variant: "outline", className: getStatusColor(rule.status), children: rule.status })] }), _jsx("p", { className: "text-sm text-gray-600 mb-2", children: rule.description }), _jsxs("div", { className: "flex items-center gap-4 text-xs text-gray-500", children: [_jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Target, { className: "h-3 w-3" }), rule.trigger.value] }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Zap, { className: "h-3 w-3" }), rule.actions.length, " actions"] })] })] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Switch, { checked: rule.status === "active", onCheckedChange: () => toggleRuleStatus(rule.id) }), _jsx(Button, { size: "sm", variant: "ghost", onClick: () => setSelectedRule(rule), children: _jsx(Settings, { className: "h-3 w-3" }) })] })] }), _jsxs("div", { className: "grid grid-cols-4 gap-4 text-center", children: [_jsxs("div", { children: [_jsx("div", { className: "text-lg font-semibold text-gray-900", children: rule.performance.executions }), _jsx("div", { className: "text-xs text-gray-600", children: "Executions" })] }), _jsxs("div", { children: [_jsxs("div", { className: "text-lg font-semibold text-green-600", children: [rule.performance.successRate, "%"] }), _jsx("div", { className: "text-xs text-gray-600", children: "Success Rate" })] }), _jsxs("div", { children: [_jsx("div", { className: "text-lg font-semibold text-blue-600", children: rule.performance.timeSaved }), _jsx("div", { className: "text-xs text-gray-600", children: "Time Saved" })] }), _jsxs("div", { children: [_jsxs("div", { className: "text-lg font-semibold text-purple-600", children: [rule.performance.accuracy, "%"] }), _jsx("div", { className: "text-xs text-gray-600", children: "Accuracy" })] })] })] }, rule.id))) })] }), _jsx(TabsContent, { value: "templates", className: "space-y-4", children: _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: workflowTemplates.map((template) => (_jsxs("div", { className: "p-4 bg-white rounded-lg border border-purple-100", children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx(Workflow, { className: "h-4 w-4 text-purple-600" }), _jsx("h4", { className: "font-medium text-gray-900", children: template.name })] }), _jsx("p", { className: "text-sm text-gray-600 mb-3", children: template.description }), _jsxs("div", { className: "flex items-center gap-2 mb-3", children: [_jsx(Badge, { variant: "outline", className: getComplexityColor(template.complexity), children: template.complexity }), _jsxs("div", { className: "flex items-center gap-1 text-xs text-gray-500", children: [_jsx(Clock, { className: "h-3 w-3" }), template.estimatedSetup] })] }), _jsx("div", { className: "space-y-1 mb-4", children: template.benefits.slice(0, 2).map((benefit, index) => (_jsxs("div", { className: "flex items-center gap-1 text-xs text-gray-600", children: [_jsx(CheckCircle, { className: "h-3 w-3 text-green-500" }), benefit] }, index))) }), _jsx(Button, { size: "sm", className: "w-full bg-purple-600 hover:bg-purple-700", children: "Use Template" })] }, template.id))) }) }), _jsxs(TabsContent, { value: "analytics", className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsx(Card, { children: _jsxs(CardContent, { className: "p-4", children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx(TrendingUp, { className: "h-4 w-4 text-green-600" }), _jsx("span", { className: "text-sm font-medium text-gray-900", children: "Total Executions" })] }), _jsx("div", { className: "text-2xl font-bold text-gray-900", children: totalExecutions }), _jsx("div", { className: "text-xs text-gray-600", children: "This month" })] }) }), _jsx(Card, { children: _jsxs(CardContent, { className: "p-4", children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx(Target, { className: "h-4 w-4 text-blue-600" }), _jsx("span", { className: "text-sm font-medium text-gray-900", children: "Success Rate" })] }), _jsxs("div", { className: "text-2xl font-bold text-gray-900", children: [avgSuccessRate, "%"] }), _jsx("div", { className: "text-xs text-gray-600", children: "Average across all rules" })] }) }), _jsx(Card, { children: _jsxs(CardContent, { className: "p-4", children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx(Clock, { className: "h-4 w-4 text-purple-600" }), _jsx("span", { className: "text-sm font-medium text-gray-900", children: "Time Saved" })] }), _jsx("div", { className: "text-2xl font-bold text-gray-900", children: "16.8h" }), _jsx("div", { className: "text-xs text-gray-600", children: "Per week" })] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-lg", children: "Rule Performance" }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: automationRules.map((rule) => (_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "p-2 bg-purple-100 rounded", children: getCategoryIcon(rule.category) }), _jsxs("div", { children: [_jsx("div", { className: "font-medium text-sm text-gray-900", children: rule.name }), _jsxs("div", { className: "text-xs text-gray-600", children: [rule.performance.executions, " executions"] })] })] }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("div", { className: "text-right", children: [_jsxs("div", { className: "text-sm font-medium text-gray-900", children: [rule.performance.successRate, "%"] }), _jsx(Progress, { value: rule.performance.successRate, className: "w-20 h-2" })] }), _jsx(Badge, { variant: "outline", className: getStatusColor(rule.status), children: rule.status })] })] }, rule.id))) }) })] })] }), _jsx(TabsContent, { value: "builder", className: "space-y-4", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { className: "text-lg", children: "Visual Rule Builder" }), _jsx("p", { className: "text-sm text-gray-600", children: "Create custom automation rules with drag-and-drop interface" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "rule-name", children: "Rule Name" }), _jsx(Input, { id: "rule-name", placeholder: "Enter rule name...", className: "mt-1" })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsx("div", { className: "p-4 border-2 border-dashed border-gray-300 rounded-lg text-center", children: _jsxs("div", { className: "flex flex-col items-center gap-2", children: [_jsx("div", { className: "p-3 bg-blue-100 rounded-full", children: _jsx(Target, { className: "h-6 w-6 text-blue-600" }) }), _jsx("h4", { className: "font-medium text-gray-900", children: "Trigger" }), _jsx("p", { className: "text-sm text-gray-600", children: "When should this rule run?" }), _jsxs(Select, { children: [_jsx(SelectTrigger, { className: "w-full", children: _jsx(SelectValue, { placeholder: "Select trigger" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "schedule", children: "Schedule" }), _jsx(SelectItem, { value: "event", children: "Event" }), _jsx(SelectItem, { value: "condition", children: "Condition" })] })] })] }) }), _jsx("div", { className: "flex items-center justify-center", children: _jsx(ArrowRight, { className: "h-6 w-6 text-gray-400" }) }), _jsx("div", { className: "p-4 border-2 border-dashed border-gray-300 rounded-lg text-center", children: _jsxs("div", { className: "flex flex-col items-center gap-2", children: [_jsx("div", { className: "p-3 bg-green-100 rounded-full", children: _jsx(Zap, { className: "h-6 w-6 text-green-600" }) }), _jsx("h4", { className: "font-medium text-gray-900", children: "Action" }), _jsx("p", { className: "text-sm text-gray-600", children: "What should happen?" }), _jsxs(Select, { children: [_jsx(SelectTrigger, { className: "w-full", children: _jsx(SelectValue, { placeholder: "Select action" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "categorize", children: "Categorize" }), _jsx(SelectItem, { value: "notify", children: "Send Notification" }), _jsx(SelectItem, { value: "approve", children: "Auto Approve" }), _jsx(SelectItem, { value: "reconcile", children: "Reconcile" })] })] })] }) })] }), _jsxs("div", { className: "flex justify-center gap-2", children: [_jsxs(Button, { variant: "outline", children: [_jsx(Play, { className: "h-4 w-4 mr-1" }), "Test Rule"] }), _jsxs(Button, { className: "bg-purple-600 hover:bg-purple-700", children: [_jsx(CheckCircle, { className: "h-4 w-4 mr-1" }), "Save Rule"] })] })] }) })] }) })] }) })] }));
}
