import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Switch } from "../components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Label } from "../components/ui/label";
import { Progress } from "../components/ui/progress";
import { User, Settings, Layout, Palette, Zap, Star, Clock, Target, TrendingUp, BookOpen, Lightbulb, CheckCircle, ArrowRight, BarChart3, FileText, DollarSign, Users, } from "lucide-react";
const mockUserProfile = {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah@urutiiq.com",
    role: "cfo",
    businessType: "startup",
    experience: "intermediate",
    preferences: {
        theme: "light",
        compactMode: false,
        showTips: true,
        autoSave: true,
        notifications: {
            email: true,
            push: true,
            sms: false,
        },
        dashboard: {
            layout: "grid",
            widgets: ["cash-flow", "expenses", "revenue", "ai-insights"],
            quickActions: ["add-expense", "create-invoice", "reconcile"],
        },
    },
    usage: {
        loginStreak: 12,
        featuresUsed: ["invoicing", "expenses", "reports", "ai-insights"],
        timeSpent: 45,
        completedTasks: 28,
    },
};
const smartRecommendations = [
    {
        id: "1",
        type: "feature",
        title: "Set up Automated Invoicing",
        description: "Based on your usage patterns, automated invoicing could save you 3+ hours per week",
        benefit: "Save 3 hours/week",
        difficulty: "easy",
        estimatedTime: "5 minutes",
        category: "Automation",
    },
    {
        id: "2",
        type: "workflow",
        title: "Optimize Expense Categorization",
        description: "Your expense patterns suggest custom categories would improve accuracy",
        benefit: "95% auto-categorization",
        difficulty: "medium",
        estimatedTime: "10 minutes",
        category: "Efficiency",
    },
    {
        id: "3",
        type: "integration",
        title: "Connect Bank Feeds",
        description: "Automatic transaction import would eliminate manual data entry",
        benefit: "Eliminate manual entry",
        difficulty: "easy",
        estimatedTime: "3 minutes",
        category: "Integration",
    },
    {
        id: "4",
        type: "shortcut",
        title: "Learn Keyboard Shortcuts",
        description: "Master 5 key shortcuts to navigate 40% faster",
        benefit: "40% faster navigation",
        difficulty: "easy",
        estimatedTime: "2 minutes",
        category: "Productivity",
    },
];
const roleBasedDashboards = {
    cfo: {
        name: "CFO Dashboard",
        description: "Strategic financial overview with KPIs and forecasting",
        widgets: ["cash-flow-forecast", "kpi-metrics", "budget-variance", "board-reports"],
        quickActions: ["generate-report", "review-budgets", "approve-expenses"],
    },
    accountant: {
        name: "Accountant Dashboard",
        description: "Transaction processing and reconciliation focused",
        widgets: ["recent-transactions", "reconciliation", "journal-entries", "client-overview"],
        quickActions: ["reconcile-accounts", "process-invoices", "review-entries"],
    },
    bookkeeper: {
        name: "Bookkeeper Dashboard",
        description: "Daily transaction management and data entry",
        widgets: ["daily-transactions", "expense-tracking", "invoice-status", "bank-feeds"],
        quickActions: ["add-transaction", "categorize-expenses", "update-invoices"],
    },
    business_owner: {
        name: "Business Owner Dashboard",
        description: "High-level business insights and performance metrics",
        widgets: ["revenue-trends", "profit-margins", "cash-position", "growth-metrics"],
        quickActions: ["view-reports", "check-cash-flow", "review-performance"],
    },
};
export function PersonalizedUserExperience() {
    const [userProfile, setUserProfile] = useState(mockUserProfile);
    const [recommendations, setRecommendations] = useState(smartRecommendations);
    const [onboardingStep, setOnboardingStep] = useState(0);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const updatePreference = (key, value) => {
        setUserProfile((prev) => ({
            ...prev,
            preferences: {
                ...prev.preferences,
                [key]: value,
            },
        }));
    };
    const updateNotificationPreference = (type, value) => {
        setUserProfile((prev) => ({
            ...prev,
            preferences: {
                ...prev.preferences,
                notifications: {
                    ...prev.preferences.notifications,
                    [type]: value,
                },
            },
        }));
    };
    const getRoleIcon = (role) => {
        switch (role) {
            case "cfo":
                return _jsx(BarChart3, { className: "h-4 w-4" });
            case "accountant":
                return _jsx(FileText, { className: "h-4 w-4" });
            case "bookkeeper":
                return _jsx(DollarSign, { className: "h-4 w-4" });
            case "business_owner":
                return _jsx(Users, { className: "h-4 w-4" });
            default:
                return _jsx(User, { className: "h-4 w-4" });
        }
    };
    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case "easy":
                return "bg-green-100 text-green-700";
            case "medium":
                return "bg-yellow-100 text-yellow-700";
            case "hard":
                return "bg-red-100 text-red-700";
            default:
                return "bg-gray-100 text-gray-700";
        }
    };
    const getRecommendationIcon = (type) => {
        switch (type) {
            case "feature":
                return _jsx(Star, { className: "h-4 w-4 text-blue-500" });
            case "workflow":
                return _jsx(Zap, { className: "h-4 w-4 text-purple-500" });
            case "integration":
                return _jsx(Target, { className: "h-4 w-4 text-green-500" });
            case "shortcut":
                return _jsx(Lightbulb, { className: "h-4 w-4 text-yellow-500" });
            default:
                return _jsx(Settings, { className: "h-4 w-4 text-gray-500" });
        }
    };
    const currentDashboard = roleBasedDashboards[userProfile.role];
    return (_jsxs(Card, { className: "border-indigo-200 bg-gradient-to-br from-indigo-50 to-blue-50", children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(User, { className: "h-5 w-5 text-indigo-600" }), _jsx(CardTitle, { className: "text-indigo-900", children: "Personalized Experience" }), _jsx(Badge, { variant: "secondary", className: "bg-indigo-100 text-indigo-700", children: "Adaptive" })] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { size: "sm", variant: "outline", onClick: () => setShowOnboarding(true), className: "border-indigo-300 text-indigo-700 bg-transparent", children: [_jsx(BookOpen, { className: "h-4 w-4 mr-1" }), "Quick Tour"] }), _jsxs(Button, { size: "sm", className: "bg-indigo-600 hover:bg-indigo-700", children: [_jsx(Settings, { className: "h-4 w-4 mr-1" }), "Customize"] })] })] }) }), _jsx(CardContent, { children: _jsxs(Tabs, { defaultValue: "dashboard", className: "w-full", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-4", children: [_jsx(TabsTrigger, { value: "dashboard", children: "My Dashboard" }), _jsx(TabsTrigger, { value: "recommendations", children: "Smart Tips" }), _jsx(TabsTrigger, { value: "preferences", children: "Preferences" }), _jsx(TabsTrigger, { value: "profile", children: "Profile" })] }), _jsxs(TabsContent, { value: "dashboard", className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "p-2 bg-indigo-100 rounded-lg", children: getRoleIcon(userProfile.role) }), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-gray-900", children: currentDashboard.name }), _jsx("p", { className: "text-sm text-gray-600", children: currentDashboard.description })] })] }), _jsxs(Button, { size: "sm", variant: "outline", className: "border-indigo-300 text-indigo-700 bg-transparent", children: [_jsx(Layout, { className: "h-4 w-4 mr-1" }), "Customize Layout"] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-lg", children: "Active Widgets" }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-2", children: currentDashboard.widgets.map((widget, index) => (_jsxs("div", { className: "flex items-center justify-between p-2 bg-gray-50 rounded", children: [_jsx("span", { className: "text-sm font-medium text-gray-900", children: widget.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase()) }), _jsx(Switch, { defaultChecked: true })] }, index))) }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-lg", children: "Quick Actions" }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-2", children: currentDashboard.quickActions.map((action, index) => (_jsxs("div", { className: "flex items-center justify-between p-2 bg-gray-50 rounded", children: [_jsx("span", { className: "text-sm font-medium text-gray-900", children: action.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase()) }), _jsx(Button, { size: "sm", variant: "ghost", children: _jsx(ArrowRight, { className: "h-3 w-3" }) })] }, index))) }) })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-lg", children: "Usage Insights" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [_jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-2xl font-bold text-indigo-600", children: userProfile.usage.loginStreak }), _jsx("div", { className: "text-sm text-gray-600", children: "Day Streak" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-2xl font-bold text-green-600", children: userProfile.usage.featuresUsed.length }), _jsx("div", { className: "text-sm text-gray-600", children: "Features Used" })] }), _jsxs("div", { className: "text-center", children: [_jsxs("div", { className: "text-2xl font-bold text-blue-600", children: [userProfile.usage.timeSpent, "h"] }), _jsx("div", { className: "text-sm text-gray-600", children: "This Month" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-2xl font-bold text-purple-600", children: userProfile.usage.completedTasks }), _jsx("div", { className: "text-sm text-gray-600", children: "Tasks Done" })] })] }) })] })] }), _jsx(TabsContent, { value: "recommendations", className: "space-y-4", children: _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: recommendations.map((recommendation) => (_jsx(Card, { children: _jsxs(CardContent, { className: "p-4", children: [_jsxs("div", { className: "flex items-start gap-3 mb-3", children: [getRecommendationIcon(recommendation.type), _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [_jsx("h4", { className: "font-medium text-gray-900", children: recommendation.title }), _jsx(Badge, { variant: "outline", className: getDifficultyColor(recommendation.difficulty), children: recommendation.difficulty })] }), _jsx("p", { className: "text-sm text-gray-600 mb-2", children: recommendation.description }), _jsxs("div", { className: "flex items-center gap-4 text-xs text-gray-500 mb-3", children: [_jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Clock, { className: "h-3 w-3" }), recommendation.estimatedTime] }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx(TrendingUp, { className: "h-3 w-3" }), recommendation.benefit] })] })] })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx(Badge, { variant: "outline", className: "text-xs", children: recommendation.category }), _jsx(Button, { size: "sm", className: "bg-indigo-600 hover:bg-indigo-700", children: "Try Now" })] })] }) }, recommendation.id))) }) }), _jsx(TabsContent, { value: "preferences", className: "space-y-4", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "text-lg flex items-center gap-2", children: [_jsx(Palette, { className: "h-5 w-5 text-indigo-600" }), "Appearance"] }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "theme", children: "Theme" }), _jsxs(Select, { value: userProfile.preferences.theme, onValueChange: (value) => updatePreference("theme", value), children: [_jsx(SelectTrigger, { className: "mt-1", children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "light", children: "Light" }), _jsx(SelectItem, { value: "dark", children: "Dark" }), _jsx(SelectItem, { value: "auto", children: "Auto" })] })] })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "compact", children: "Compact Mode" }), _jsx("p", { className: "text-sm text-gray-600", children: "Reduce spacing and padding" })] }), _jsx(Switch, { id: "compact", checked: userProfile.preferences.compactMode, onCheckedChange: (value) => updatePreference("compactMode", value) })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "tips", children: "Show Tips" }), _jsx("p", { className: "text-sm text-gray-600", children: "Display helpful tips and hints" })] }), _jsx(Switch, { id: "tips", checked: userProfile.preferences.showTips, onCheckedChange: (value) => updatePreference("showTips", value) })] })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "text-lg flex items-center gap-2", children: [_jsx(Settings, { className: "h-5 w-5 text-indigo-600" }), "Behavior"] }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "autosave", children: "Auto Save" }), _jsx("p", { className: "text-sm text-gray-600", children: "Automatically save changes" })] }), _jsx(Switch, { id: "autosave", checked: userProfile.preferences.autoSave, onCheckedChange: (value) => updatePreference("autoSave", value) })] }), _jsxs("div", { children: [_jsx(Label, { children: "Dashboard Layout" }), _jsxs(Select, { value: userProfile.preferences.dashboard.layout, onValueChange: (value) => updatePreference("dashboard", { ...userProfile.preferences.dashboard, layout: value }), children: [_jsx(SelectTrigger, { className: "mt-1", children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "grid", children: "Grid" }), _jsx(SelectItem, { value: "list", children: "List" }), _jsx(SelectItem, { value: "cards", children: "Cards" })] })] })] })] })] }), _jsxs(Card, { className: "md:col-span-2", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-lg", children: "Notifications" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "email-notif", children: "Email" }), _jsx("p", { className: "text-sm text-gray-600", children: "Receive email notifications" })] }), _jsx(Switch, { id: "email-notif", checked: userProfile.preferences.notifications.email, onCheckedChange: (value) => updateNotificationPreference("email", value) })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "push-notif", children: "Push" }), _jsx("p", { className: "text-sm text-gray-600", children: "Browser push notifications" })] }), _jsx(Switch, { id: "push-notif", checked: userProfile.preferences.notifications.push, onCheckedChange: (value) => updateNotificationPreference("push", value) })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "sms-notif", children: "SMS" }), _jsx("p", { className: "text-sm text-gray-600", children: "Text message alerts" })] }), _jsx(Switch, { id: "sms-notif", checked: userProfile.preferences.notifications.sms, onCheckedChange: (value) => updateNotificationPreference("sms", value) })] })] }) })] })] }) }), _jsx(TabsContent, { value: "profile", className: "space-y-4", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-lg", children: "Profile Information" }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "role", children: "Role" }), _jsxs(Select, { value: userProfile.role, onValueChange: (value) => setUserProfile({ ...userProfile, role: value }), children: [_jsx(SelectTrigger, { className: "mt-1", children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "cfo", children: "CFO" }), _jsx(SelectItem, { value: "accountant", children: "Accountant" }), _jsx(SelectItem, { value: "bookkeeper", children: "Bookkeeper" }), _jsx(SelectItem, { value: "business_owner", children: "Business Owner" })] })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "business-type", children: "Business Type" }), _jsxs(Select, { value: userProfile.businessType, onValueChange: (value) => setUserProfile({ ...userProfile, businessType: value }), children: [_jsx(SelectTrigger, { className: "mt-1", children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "startup", children: "Startup" }), _jsx(SelectItem, { value: "small_business", children: "Small Business" }), _jsx(SelectItem, { value: "enterprise", children: "Enterprise" }), _jsx(SelectItem, { value: "nonprofit", children: "Nonprofit" })] })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "experience", children: "Experience Level" }), _jsxs(Select, { value: userProfile.experience, onValueChange: (value) => setUserProfile({ ...userProfile, experience: value }), children: [_jsx(SelectTrigger, { className: "mt-1", children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "beginner", children: "Beginner" }), _jsx(SelectItem, { value: "intermediate", children: "Intermediate" }), _jsx(SelectItem, { value: "expert", children: "Expert" })] })] })] })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-lg", children: "Learning Progress" }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex justify-between text-sm mb-1", children: [_jsx("span", { className: "text-gray-600", children: "Platform Mastery" }), _jsx("span", { className: "font-medium", children: "75%" })] }), _jsx(Progress, { value: 75, className: "h-2" })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex justify-between text-sm mb-1", children: [_jsx("span", { className: "text-gray-600", children: "Feature Adoption" }), _jsx("span", { className: "font-medium", children: "60%" })] }), _jsx(Progress, { value: 60, className: "h-2" })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex justify-between text-sm mb-1", children: [_jsx("span", { className: "text-gray-600", children: "Automation Setup" }), _jsx("span", { className: "font-medium", children: "40%" })] }), _jsx(Progress, { value: 40, className: "h-2" })] }), _jsxs("div", { className: "pt-2 border-t border-gray-100", children: [_jsxs("div", { className: "flex items-center gap-2 text-sm text-green-700", children: [_jsx(CheckCircle, { className: "h-4 w-4" }), _jsx("span", { children: "Completed onboarding" })] }), _jsxs("div", { className: "flex items-center gap-2 text-sm text-blue-700 mt-1", children: [_jsx(Target, { className: "h-4 w-4" }), _jsx("span", { children: "Next: Set up automation rules" })] })] })] })] })] }) })] }) })] }));
}
