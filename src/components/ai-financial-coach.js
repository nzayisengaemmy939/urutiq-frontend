import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Target, Lightbulb, BookOpen, BarChart3, Plus, CheckCircle, Clock, TrendingUp, DollarSign, PiggyBank, CreditCard, Calculator, RefreshCw, Users } from 'lucide-react';
// API Functions
const api = {
    getGoals: async (companyId, userId) => {
        const response = await fetch(`/api/coach/goals/${companyId}/${userId}`);
        return response.json();
    },
    createGoal: async (companyId, userId, goalData) => {
        const response = await fetch(`/api/coach/goals/${companyId}/${userId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(goalData)
        });
        return response.json();
    },
    updateGoal: async (goalId, updates) => {
        const response = await fetch(`/api/coach/goals/${goalId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
        });
        return response.json();
    },
    deleteGoal: async (goalId) => {
        const response = await fetch(`/api/coach/goals/${goalId}`, {
            method: 'DELETE'
        });
        return response.json();
    },
    getAdvice: async (companyId, userId) => {
        const response = await fetch(`/api/coach/advice/${companyId}/${userId}`);
        return response.json();
    },
    generateAdvice: async (companyId, userId, context) => {
        const response = await fetch(`/api/coach/advice/${companyId}/${userId}/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ context })
        });
        return response.json();
    },
    getEducationalContent: async (companyId, userId) => {
        const response = await fetch(`/api/coach/content/${companyId}/${userId}`);
        return response.json();
    },
    updateLearningProgress: async (contentId, progress) => {
        const response = await fetch(`/api/coach/content/${contentId}/progress`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(progress)
        });
        return response.json();
    },
    getAnalytics: async (companyId, userId) => {
        const response = await fetch(`/api/coach/analytics/${companyId}/${userId}`);
        return response.json();
    },
    startSession: async (companyId, userId) => {
        const response = await fetch(`/api/coach/sessions/${companyId}/${userId}/start`, {
            method: 'POST'
        });
        return response.json();
    },
    endSession: async (sessionId) => {
        const response = await fetch(`/api/coach/sessions/${sessionId}/end`, {
            method: 'POST'
        });
        return response.json();
    }
};
// AI Financial Coach Component
export const AIFinancialCoach = ({ companyId, userId }) => {
    const [activeTab, setActiveTab] = useState('goals');
    const [showCreateGoal, setShowCreateGoal] = useState(false);
    const [showAdviceModal, setShowAdviceModal] = useState(false);
    const [selectedContent, setSelectedContent] = useState(null);
    const [adviceContext, setAdviceContext] = useState('');
    const queryClient = useQueryClient();
    // Queries
    const { data: goals, isLoading: goalsLoading } = useQuery({
        queryKey: ['financialGoals', companyId, userId],
        queryFn: () => api.getGoals(companyId, userId)
    });
    const { data: advice, isLoading: adviceLoading } = useQuery({
        queryKey: ['financialAdvice', companyId, userId],
        queryFn: () => api.getAdvice(companyId, userId)
    });
    const { data: content, isLoading: contentLoading } = useQuery({
        queryKey: ['educationalContent', companyId, userId],
        queryFn: () => api.getEducationalContent(companyId, userId)
    });
    const { data: analytics, isLoading: analyticsLoading } = useQuery({
        queryKey: ['coachAnalytics', companyId, userId],
        queryFn: () => api.getAnalytics(companyId, userId)
    });
    // Mutations
    const createGoalMutation = useMutation({
        mutationFn: ({ goalData }) => api.createGoal(companyId, userId, goalData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['financialGoals', companyId, userId] });
            setShowCreateGoal(false);
        }
    });
    const updateGoalMutation = useMutation({
        mutationFn: ({ goalId, updates }) => api.updateGoal(goalId, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['financialGoals', companyId, userId] });
        }
    });
    const deleteGoalMutation = useMutation({
        mutationFn: ({ goalId }) => api.deleteGoal(goalId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['financialGoals', companyId, userId] });
        }
    });
    const generateAdviceMutation = useMutation({
        mutationFn: ({ context }) => api.generateAdvice(companyId, userId, context),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['financialAdvice', companyId, userId] });
            setShowAdviceModal(false);
            setAdviceContext('');
        }
    });
    const updateProgressMutation = useMutation({
        mutationFn: ({ contentId, progress }) => api.updateLearningProgress(contentId, progress),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['educationalContent', companyId, userId] });
        }
    });
    // Tab Navigation
    const tabs = [
        { id: 'goals', label: 'Financial Goals', icon: Target },
        { id: 'advice', label: 'AI Advice', icon: Lightbulb },
        { id: 'learning', label: 'Learning Center', icon: BookOpen },
        { id: 'analytics', label: 'Progress Analytics', icon: BarChart3 }
    ];
    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'text-red-600 bg-red-100';
            case 'medium': return 'text-yellow-600 bg-yellow-100';
            case 'low': return 'text-green-600 bg-green-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'text-green-600 bg-green-100';
            case 'in_progress': return 'text-blue-600 bg-blue-100';
            case 'not_started': return 'text-gray-600 bg-gray-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };
    const getCategoryIcon = (category) => {
        switch (category) {
            case 'savings': return PiggyBank;
            case 'investment': return TrendingUp;
            case 'debt': return CreditCard;
            case 'budget': return Calculator;
            case 'income': return DollarSign;
            default: return Target;
        }
    };
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    };
    const formatDate = (date) => {
        return new Date(date).toLocaleDateString();
    };
    return (_jsxs("div", { className: "min-h-screen bg-gray-50", children: [_jsx("div", { className: "bg-white shadow-sm border-b", children: _jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: [_jsxs("div", { className: "flex justify-between items-center py-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "AI Financial Coach" }), _jsx("p", { className: "text-gray-600 mt-1", children: "Personalized financial guidance, goal tracking, and educational content" })] }), _jsxs("div", { className: "flex items-center space-x-3", children: [_jsxs("button", { onClick: () => setShowAdviceModal(true), className: "bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 flex items-center space-x-2", children: [_jsx(Lightbulb, { className: "w-4 h-4" }), _jsx("span", { children: "Get Advice" })] }), _jsx("button", { onClick: () => queryClient.invalidateQueries(), className: "bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700", children: _jsx(RefreshCw, { className: "w-4 h-4" }) })] })] }), _jsx("div", { className: "flex space-x-8", children: tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (_jsxs("button", { onClick: () => setActiveTab(tab.id), className: `flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                                        ? 'border-teal-500 text-teal-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`, children: [_jsx(Icon, { className: "w-4 h-4" }), _jsx("span", { children: tab.label })] }, tab.id));
                            }) })] }) }), _jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: [activeTab === 'goals' && (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900", children: "Financial Goals" }), _jsx("button", { onClick: () => setShowCreateGoal(true), className: "bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700", children: _jsx(Plus, { className: "w-4 h-4" }) })] }), goalsLoading ? (_jsxs("div", { className: "text-center py-8", children: [_jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto" }), _jsx("p", { className: "mt-2 text-sm text-gray-500", children: "Loading goals..." })] })) : goals?.data?.length > 0 ? (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: goals.data.map((goal) => {
                                    const Icon = getCategoryIcon(goal.category);
                                    return (_jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Icon, { className: "w-5 h-5 text-teal-600" }), _jsx("h3", { className: "font-medium text-gray-900", children: goal.name })] }), _jsx("span", { className: `text-xs px-2 py-1 rounded ${getStatusColor(goal.status)}`, children: goal.status.replace('_', ' ') })] }), _jsx("p", { className: "text-sm text-gray-600 mb-4", children: goal.description }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-gray-500", children: "Progress" }), _jsxs("span", { className: "font-medium", children: [formatCurrency(goal.currentAmount), " / ", formatCurrency(goal.targetAmount)] })] }), _jsx("div", { className: "w-full bg-gray-200 rounded-full h-2", children: _jsx("div", { className: "bg-teal-600 h-2 rounded-full transition-all duration-300", style: { width: `${goal.progress}%` } }) }), _jsxs("div", { className: "flex items-center justify-between text-xs text-gray-500", children: [_jsxs("span", { children: [goal.progress, "% complete"] }), _jsxs("span", { children: ["Target: ", formatDate(goal.targetDate)] })] }), _jsxs("div", { className: "flex items-center justify-between text-sm", children: [_jsx("span", { className: "text-gray-500", children: "Priority" }), _jsx("span", { className: `text-xs px-2 py-1 rounded ${getPriorityColor(goal.priority)}`, children: goal.priority })] })] }), _jsxs("div", { className: "mt-4 flex space-x-2", children: [_jsx("button", { onClick: () => updateGoalMutation.mutate({
                                                            goalId: goal.id,
                                                            updates: { currentAmount: goal.currentAmount + 100 }
                                                        }), className: "bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 text-sm", children: "Update Progress" }), _jsx("button", { className: "bg-gray-600 text-white px-3 py-1 rounded-md hover:bg-gray-700 text-sm", children: "Edit" }), _jsx("button", { onClick: () => deleteGoalMutation.mutate({ goalId: goal.id }), className: "bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 text-sm", children: "Delete" })] })] }, goal.id));
                                }) })) : (_jsxs("div", { className: "text-center py-8", children: [_jsx(Target, { className: "mx-auto h-12 w-12 text-gray-400" }), _jsx("p", { className: "mt-2 text-sm text-gray-500", children: "No financial goals set" }), _jsx("button", { onClick: () => setShowCreateGoal(true), className: "mt-4 bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700", children: "Create Your First Goal" })] }))] })), activeTab === 'advice' && (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900", children: "AI Financial Advice" }), _jsx("button", { onClick: () => setShowAdviceModal(true), className: "bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700", children: "Get New Advice" })] }), adviceLoading ? (_jsxs("div", { className: "text-center py-8", children: [_jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto" }), _jsx("p", { className: "mt-2 text-sm text-gray-500", children: "Loading advice..." })] })) : advice?.data?.length > 0 ? (_jsx("div", { className: "space-y-4", children: advice.data.map((adviceItem) => (_jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h3", { className: "font-medium text-gray-900", children: adviceItem.title }), _jsxs("span", { className: `text-xs px-2 py-1 rounded ${getPriorityColor(adviceItem.priority)}`, children: [adviceItem.priority, " priority"] })] }), _jsx("p", { className: "text-sm text-gray-600 mb-4", children: adviceItem.description }), adviceItem.recommendations.length > 0 && (_jsxs("div", { className: "mb-4", children: [_jsx("h4", { className: "font-medium text-gray-900 mb-2", children: "Recommendations:" }), _jsx("ul", { className: "list-disc list-inside text-sm text-gray-600 space-y-1", children: adviceItem.recommendations.map((rec, index) => (_jsx("li", { children: rec }, index))) })] })), _jsxs("div", { className: "flex items-center justify-between text-sm text-gray-500", children: [_jsxs("span", { children: ["Type: ", adviceItem.type] }), _jsxs("span", { children: ["Confidence: ", adviceItem.confidence, "%"] }), _jsxs("span", { children: ["Impact: ", adviceItem.estimatedImpact] })] })] }, adviceItem.id))) })) : (_jsxs("div", { className: "text-center py-8", children: [_jsx(Lightbulb, { className: "mx-auto h-12 w-12 text-gray-400" }), _jsx("p", { className: "mt-2 text-sm text-gray-500", children: "No advice available" }), _jsx("button", { onClick: () => setShowAdviceModal(true), className: "mt-4 bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700", children: "Get Personalized Advice" })] }))] })), activeTab === 'learning' && (_jsxs("div", { className: "space-y-6", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900", children: "Learning Center" }), contentLoading ? (_jsxs("div", { className: "text-center py-8", children: [_jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto" }), _jsx("p", { className: "mt-2 text-sm text-gray-500", children: "Loading content..." })] })) : content?.data?.length > 0 ? (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: content.data.map((contentItem) => (_jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h3", { className: "font-medium text-gray-900", children: contentItem.title }), _jsx("span", { className: "text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded", children: contentItem.difficulty })] }), _jsx("p", { className: "text-sm text-gray-600 mb-4", children: contentItem.description }), _jsxs("div", { className: "space-y-2 mb-4", children: [_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-gray-500", children: "Category" }), _jsx("span", { className: "font-medium", children: contentItem.category })] }), _jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-gray-500", children: "Topic" }), _jsx("span", { className: "font-medium", children: contentItem.topic })] }), _jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-gray-500", children: "Time" }), _jsxs("span", { className: "font-medium", children: [contentItem.estimatedTime, " min"] })] })] }), _jsx("div", { className: "flex flex-wrap gap-1 mb-4", children: contentItem.tags.map((tag, index) => (_jsx("span", { className: "text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded", children: tag }, index))) }), _jsx("button", { onClick: () => setSelectedContent(contentItem), className: "w-full bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700", children: "Start Learning" })] }, contentItem.id))) })) : (_jsxs("div", { className: "text-center py-8", children: [_jsx(BookOpen, { className: "mx-auto h-12 w-12 text-gray-400" }), _jsx("p", { className: "mt-2 text-sm text-gray-500", children: "No educational content available" })] }))] })), activeTab === 'analytics' && (_jsxs("div", { className: "space-y-6", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900", children: "Progress Analytics" }), analyticsLoading ? (_jsxs("div", { className: "text-center py-8", children: [_jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto" }), _jsx("p", { className: "mt-2 text-sm text-gray-500", children: "Loading analytics..." })] })) : analytics?.data ? (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsx("div", { className: "bg-white rounded-lg shadow p-6", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "p-2 bg-teal-100 rounded-lg", children: _jsx(Users, { className: "w-6 h-6 text-teal-600" }) }), _jsxs("div", { className: "ml-4", children: [_jsx("p", { className: "text-sm font-medium text-gray-500", children: "Total Sessions" }), _jsx("p", { className: "text-lg font-bold text-gray-900", children: analytics.data.totalSessions })] })] }) }), _jsx("div", { className: "bg-white rounded-lg shadow p-6", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "p-2 bg-blue-100 rounded-lg", children: _jsx(Clock, { className: "w-6 h-6 text-blue-600" }) }), _jsxs("div", { className: "ml-4", children: [_jsx("p", { className: "text-sm font-medium text-gray-500", children: "Avg Session" }), _jsxs("p", { className: "text-lg font-bold text-gray-900", children: [analytics.data.averageSessionDuration, " min"] })] })] }) }), _jsx("div", { className: "bg-white rounded-lg shadow p-6", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "p-2 bg-green-100 rounded-lg", children: _jsx(CheckCircle, { className: "w-6 h-6 text-green-600" }) }), _jsxs("div", { className: "ml-4", children: [_jsx("p", { className: "text-sm font-medium text-gray-500", children: "Goals Completed" }), _jsx("p", { className: "text-lg font-bold text-gray-900", children: analytics.data.goalsCompleted })] })] }) }), _jsx("div", { className: "bg-white rounded-lg shadow p-6", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "p-2 bg-purple-100 rounded-lg", children: _jsx(Lightbulb, { className: "w-6 h-6 text-purple-600" }) }), _jsxs("div", { className: "ml-4", children: [_jsx("p", { className: "text-sm font-medium text-gray-500", children: "Advice Followed" }), _jsx("p", { className: "text-lg font-bold text-gray-900", children: analytics.data.adviceFollowed })] })] }) })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 mb-4", children: "Learning Progress" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-gray-500", children: "Content Completed" }), _jsx("span", { className: "font-medium", children: analytics.data.contentCompleted })] }), _jsx("div", { className: "w-full bg-gray-200 rounded-full h-3", children: _jsx("div", { className: "bg-teal-600 h-3 rounded-full transition-all duration-300", style: { width: `${analytics.data.learningProgress}%` } }) }), _jsxs("p", { className: "text-xs text-gray-500", children: [analytics.data.learningProgress, "% of learning goals achieved"] })] })] }), _jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 mb-4", children: "Financial Improvement" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-gray-500", children: "Improvement Score" }), _jsxs("span", { className: "font-medium", children: [analytics.data.financialImprovement, "%"] })] }), _jsx("div", { className: "w-full bg-gray-200 rounded-full h-3", children: _jsx("div", { className: "bg-green-600 h-3 rounded-full transition-all duration-300", style: { width: `${analytics.data.financialImprovement}%` } }) }), _jsx("p", { className: "text-xs text-gray-500", children: "Overall financial health improvement" })] })] })] }), _jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 mb-4", children: "User Engagement" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { className: "text-center", children: [_jsxs("p", { className: "text-2xl font-bold text-teal-600", children: [analytics.data.userEngagement, "%"] }), _jsx("p", { className: "text-sm text-gray-500", children: "Engagement Rate" })] }), _jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-2xl font-bold text-blue-600", children: analytics.data.totalSessions }), _jsx("p", { className: "text-sm text-gray-500", children: "Total Sessions" })] }), _jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-2xl font-bold text-green-600", children: analytics.data.goalsCompleted }), _jsx("p", { className: "text-sm text-gray-500", children: "Goals Achieved" })] })] })] })] })) : (_jsxs("div", { className: "text-center py-8", children: [_jsx(BarChart3, { className: "mx-auto h-12 w-12 text-gray-400" }), _jsx("p", { className: "mt-2 text-sm text-gray-500", children: "No analytics data available" })] }))] }))] }), showCreateGoal && (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50", children: _jsxs("div", { className: "bg-white rounded-lg p-6 max-w-md w-full mx-4", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 mb-4", children: "Create Financial Goal" }), _jsxs("form", { onSubmit: (e) => {
                                e.preventDefault();
                                const formData = new FormData(e.currentTarget);
                                createGoalMutation.mutate({
                                    goalData: {
                                        name: formData.get('name'),
                                        description: formData.get('description'),
                                        targetAmount: parseFloat(formData.get('targetAmount')),
                                        targetDate: new Date(formData.get('targetDate')),
                                        category: formData.get('category'),
                                        priority: formData.get('priority')
                                    }
                                });
                            }, children: [_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Goal Name" }), _jsx("input", { type: "text", name: "name", required: true, className: "mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-teal-500 focus:border-teal-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Description" }), _jsx("textarea", { name: "description", rows: 3, className: "mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-teal-500 focus:border-teal-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Target Amount" }), _jsx("input", { type: "number", name: "targetAmount", required: true, min: "0", step: "0.01", className: "mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-teal-500 focus:border-teal-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Target Date" }), _jsx("input", { type: "date", name: "targetDate", required: true, className: "mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-teal-500 focus:border-teal-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Category" }), _jsxs("select", { name: "category", required: true, className: "mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-teal-500 focus:border-teal-500", children: [_jsx("option", { value: "savings", children: "Savings" }), _jsx("option", { value: "investment", children: "Investment" }), _jsx("option", { value: "debt", children: "Debt Reduction" }), _jsx("option", { value: "budget", children: "Budget" }), _jsx("option", { value: "income", children: "Income" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Priority" }), _jsxs("select", { name: "priority", required: true, className: "mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-teal-500 focus:border-teal-500", children: [_jsx("option", { value: "low", children: "Low" }), _jsx("option", { value: "medium", children: "Medium" }), _jsx("option", { value: "high", children: "High" })] })] })] }), _jsxs("div", { className: "mt-6 flex space-x-3", children: [_jsx("button", { type: "submit", className: "flex-1 bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700", children: "Create Goal" }), _jsx("button", { type: "button", onClick: () => setShowCreateGoal(false), className: "flex-1 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700", children: "Cancel" })] })] })] }) })), showAdviceModal && (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50", children: _jsxs("div", { className: "bg-white rounded-lg p-6 max-w-md w-full mx-4", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 mb-4", children: "Get Personalized Advice" }), _jsxs("form", { onSubmit: (e) => {
                                e.preventDefault();
                                const formData = new FormData(e.currentTarget);
                                generateAdviceMutation.mutate({
                                    context: formData.get('context')
                                });
                            }, children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "What would you like advice about?" }), _jsx("textarea", { name: "context", rows: 4, placeholder: "Describe your financial situation, goals, or concerns...", required: true, className: "block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-teal-500 focus:border-teal-500" })] }), _jsxs("div", { className: "mt-6 flex space-x-3", children: [_jsx("button", { type: "submit", className: "flex-1 bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700", children: "Get Advice" }), _jsx("button", { type: "button", onClick: () => setShowAdviceModal(false), className: "flex-1 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700", children: "Cancel" })] })] })] }) }))] }));
};
