import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Target,
  Lightbulb,
  BookOpen,
  BarChart3,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  TrendingUp,
  DollarSign,
  PiggyBank,
  CreditCard,
  Calculator,
  FileText,
  RefreshCw,
  Play,
  Pause,
  Award,
  Users,
  Calendar,
  ArrowRight,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

// Types
interface FinancialGoal {
  id: string;
  name: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: Date;
  category: string;
  priority: string;
  status: string;
  progress: number;
  milestones: any[];
}

interface FinancialAdvice {
  id: string;
  type: string;
  title: string;
  description: string;
  recommendations: string[];
  priority: string;
  actionable: boolean;
  estimatedImpact: string;
  confidence: number;
}

interface EducationalContent {
  id: string;
  title: string;
  description: string;
  category: string;
  topic: string;
  difficulty: string;
  estimatedTime: number;
  tags: string[];
}

interface LearningProgress {
  id: string;
  contentId: string;
  status: string;
  progress: number;
  timeSpent: number;
  completedAt?: Date;
  quizScore?: number;
}

interface CoachAnalytics {
  totalSessions: number;
  averageSessionDuration: number;
  goalsCompleted: number;
  adviceFollowed: number;
  contentCompleted: number;
  learningProgress: number;
  financialImprovement: number;
  userEngagement: number;
}

// API Functions
const api = {
  getGoals: async (companyId: string, userId: string) => {
    const response = await fetch(`/api/coach/goals/${companyId}/${userId}`);
    return response.json();
  },

  createGoal: async (companyId: string, userId: string, goalData: any) => {
    const response = await fetch(`/api/coach/goals/${companyId}/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(goalData)
    });
    return response.json();
  },

  updateGoal: async (goalId: string, updates: any) => {
    const response = await fetch(`/api/coach/goals/${goalId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return response.json();
  },

  deleteGoal: async (goalId: string) => {
    const response = await fetch(`/api/coach/goals/${goalId}`, {
      method: 'DELETE'
    });
    return response.json();
  },

  getAdvice: async (companyId: string, userId: string) => {
    const response = await fetch(`/api/coach/advice/${companyId}/${userId}`);
    return response.json();
  },

  generateAdvice: async (companyId: string, userId: string, context: string) => {
    const response = await fetch(`/api/coach/advice/${companyId}/${userId}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ context })
    });
    return response.json();
  },

  getEducationalContent: async (companyId: string, userId: string) => {
    const response = await fetch(`/api/coach/content/${companyId}/${userId}`);
    return response.json();
  },

  updateLearningProgress: async (contentId: string, progress: any) => {
    const response = await fetch(`/api/coach/content/${contentId}/progress`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(progress)
    });
    return response.json();
  },

  getAnalytics: async (companyId: string, userId: string) => {
    const response = await fetch(`/api/coach/analytics/${companyId}/${userId}`);
    return response.json();
  },

  startSession: async (companyId: string, userId: string) => {
    const response = await fetch(`/api/coach/sessions/${companyId}/${userId}/start`, {
      method: 'POST'
    });
    return response.json();
  },

  endSession: async (sessionId: string) => {
    const response = await fetch(`/api/coach/sessions/${sessionId}/end`, {
      method: 'POST'
    });
    return response.json();
  }
};

// AI Financial Coach Component
export const AIFinancialCoach: React.FC<{ companyId: string; userId: string }> = ({ 
  companyId, 
  userId 
}) => {
  const [activeTab, setActiveTab] = useState<'goals' | 'advice' | 'learning' | 'analytics'>('goals');
  const [showCreateGoal, setShowCreateGoal] = useState(false);
  const [showAdviceModal, setShowAdviceModal] = useState(false);
  const [selectedContent, setSelectedContent] = useState<EducationalContent | null>(null);
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
    mutationFn: ({ goalData }: { goalData: any }) => api.createGoal(companyId, userId, goalData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financialGoals', companyId, userId] });
      setShowCreateGoal(false);
    }
  });

  const updateGoalMutation = useMutation({
    mutationFn: ({ goalId, updates }: { goalId: string; updates: any }) => api.updateGoal(goalId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financialGoals', companyId, userId] });
    }
  });

  const deleteGoalMutation = useMutation({
    mutationFn: ({ goalId }: { goalId: string }) => api.deleteGoal(goalId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financialGoals', companyId, userId] });
    }
  });

  const generateAdviceMutation = useMutation({
    mutationFn: ({ context }: { context: string }) => api.generateAdvice(companyId, userId, context),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financialAdvice', companyId, userId] });
      setShowAdviceModal(false);
      setAdviceContext('');
    }
  });

  const updateProgressMutation = useMutation({
    mutationFn: ({ contentId, progress }: { contentId: string; progress: any }) => 
      api.updateLearningProgress(contentId, progress),
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'in_progress': return 'text-blue-600 bg-blue-100';
      case 'not_started': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'savings': return PiggyBank;
      case 'investment': return TrendingUp;
      case 'debt': return CreditCard;
      case 'budget': return Calculator;
      case 'income': return DollarSign;
      default: return Target;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                AI Financial Coach
              </h1>
              <p className="text-gray-600 mt-1">
                Personalized financial guidance, goal tracking, and educational content
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowAdviceModal(true)}
                className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 flex items-center space-x-2"
              >
                <Lightbulb className="w-4 h-4" />
                <span>Get Advice</span>
              </button>
              <button
                onClick={() => queryClient.invalidateQueries()}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-teal-500 text-teal-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Financial Goals Tab */}
        {activeTab === 'goals' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Financial Goals</h2>
              <button
                onClick={() => setShowCreateGoal(true)}
                className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {goalsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-500">Loading goals...</p>
              </div>
            ) : goals?.data?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {goals.data.map((goal: FinancialGoal) => {
                  const Icon = getCategoryIcon(goal.category);
                  
                  return (
                    <div key={goal.id} className="bg-white rounded-lg shadow p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <Icon className="w-5 h-5 text-teal-600" />
                          <h3 className="font-medium text-gray-900">{goal.name}</h3>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${getStatusColor(goal.status)}`}>
                          {goal.status.replace('_', ' ')}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-4">{goal.description}</p>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Progress</span>
                          <span className="font-medium">{formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-teal-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${goal.progress}%` }}
                          ></div>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{goal.progress}% complete</span>
                          <span>Target: {formatDate(goal.targetDate)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Priority</span>
                          <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(goal.priority)}`}>
                            {goal.priority}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex space-x-2">
                        <button
                          onClick={() => updateGoalMutation.mutate({ 
                            goalId: goal.id, 
                            updates: { currentAmount: goal.currentAmount + 100 } 
                          })}
                          className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 text-sm"
                        >
                          Update Progress
                        </button>
                        <button className="bg-gray-600 text-white px-3 py-1 rounded-md hover:bg-gray-700 text-sm">
                          Edit
                        </button>
                        <button
                          onClick={() => deleteGoalMutation.mutate({ goalId: goal.id })}
                          className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Target className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">No financial goals set</p>
                <button
                  onClick={() => setShowCreateGoal(true)}
                  className="mt-4 bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700"
                >
                  Create Your First Goal
                </button>
              </div>
            )}
          </div>
        )}

        {/* AI Advice Tab */}
        {activeTab === 'advice' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">AI Financial Advice</h2>
              <button
                onClick={() => setShowAdviceModal(true)}
                className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700"
              >
                Get New Advice
              </button>
            </div>

            {adviceLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-500">Loading advice...</p>
              </div>
            ) : advice?.data?.length > 0 ? (
              <div className="space-y-4">
                {advice.data.map((adviceItem: FinancialAdvice) => (
                  <div key={adviceItem.id} className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium text-gray-900">{adviceItem.title}</h3>
                      <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(adviceItem.priority)}`}>
                        {adviceItem.priority} priority
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-4">{adviceItem.description}</p>
                    
                    {adviceItem.recommendations.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Recommendations:</h4>
                        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                          {adviceItem.recommendations.map((rec, index) => (
                            <li key={index}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>Type: {adviceItem.type}</span>
                      <span>Confidence: {adviceItem.confidence}%</span>
                      <span>Impact: {adviceItem.estimatedImpact}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Lightbulb className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">No advice available</p>
                <button
                  onClick={() => setShowAdviceModal(true)}
                  className="mt-4 bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700"
                >
                  Get Personalized Advice
                </button>
              </div>
            )}
          </div>
        )}

        {/* Learning Center Tab */}
        {activeTab === 'learning' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Learning Center</h2>

            {contentLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-500">Loading content...</p>
              </div>
            ) : content?.data?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {content.data.map((contentItem: EducationalContent) => (
                  <div key={contentItem.id} className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium text-gray-900">{contentItem.title}</h3>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {contentItem.difficulty}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-4">{contentItem.description}</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Category</span>
                        <span className="font-medium">{contentItem.category}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Topic</span>
                        <span className="font-medium">{contentItem.topic}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Time</span>
                        <span className="font-medium">{contentItem.estimatedTime} min</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mb-4">
                      {contentItem.tags.map((tag, index) => (
                        <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    <button
                      onClick={() => setSelectedContent(contentItem)}
                      className="w-full bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700"
                    >
                      Start Learning
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">No educational content available</p>
              </div>
            )}
          </div>
        )}

        {/* Progress Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Progress Analytics</h2>

            {analyticsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-500">Loading analytics...</p>
              </div>
            ) : analytics?.data ? (
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-teal-100 rounded-lg">
                        <Users className="w-6 h-6 text-teal-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Total Sessions</p>
                        <p className="text-lg font-bold text-gray-900">{analytics.data.totalSessions}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Clock className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Avg Session</p>
                        <p className="text-lg font-bold text-gray-900">{analytics.data.averageSessionDuration} min</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Goals Completed</p>
                        <p className="text-lg font-bold text-gray-900">{analytics.data.goalsCompleted}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Lightbulb className="w-6 h-6 text-purple-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Advice Followed</p>
                        <p className="text-lg font-bold text-gray-900">{analytics.data.adviceFollowed}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress Charts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Learning Progress</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Content Completed</span>
                        <span className="font-medium">{analytics.data.contentCompleted}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-teal-600 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${analytics.data.learningProgress}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500">{analytics.data.learningProgress}% of learning goals achieved</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Financial Improvement</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Improvement Score</span>
                        <span className="font-medium">{analytics.data.financialImprovement}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-green-600 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${analytics.data.financialImprovement}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500">Overall financial health improvement</p>
                    </div>
                  </div>
                </div>

                {/* Engagement Metrics */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">User Engagement</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-teal-600">{analytics.data.userEngagement}%</p>
                      <p className="text-sm text-gray-500">Engagement Rate</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{analytics.data.totalSessions}</p>
                      <p className="text-sm text-gray-500">Total Sessions</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{analytics.data.goalsCompleted}</p>
                      <p className="text-sm text-gray-500">Goals Achieved</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">No analytics data available</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Goal Modal */}
      {showCreateGoal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Create Financial Goal</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              createGoalMutation.mutate({
                goalData: {
                  name: formData.get('name'),
                  description: formData.get('description'),
                  targetAmount: parseFloat(formData.get('targetAmount') as string),
                  targetDate: new Date(formData.get('targetDate') as string),
                  category: formData.get('category'),
                  priority: formData.get('priority')
                }
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Goal Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    name="description"
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Target Amount</label>
                  <input
                    type="number"
                    name="targetAmount"
                    required
                    min="0"
                    step="0.01"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Target Date</label>
                  <input
                    type="date"
                    name="targetDate"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <select
                    name="category"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                  >
                    <option value="savings">Savings</option>
                    <option value="investment">Investment</option>
                    <option value="debt">Debt Reduction</option>
                    <option value="budget">Budget</option>
                    <option value="income">Income</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Priority</label>
                  <select
                    name="priority"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700"
                >
                  Create Goal
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateGoal(false)}
                  className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Advice Modal */}
      {showAdviceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Get Personalized Advice</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              generateAdviceMutation.mutate({
                context: formData.get('context') as string
              });
            }}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What would you like advice about?
                </label>
                <textarea
                  name="context"
                  rows={4}
                  placeholder="Describe your financial situation, goals, or concerns..."
                  required
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
              <div className="mt-6 flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700"
                >
                  Get Advice
                </button>
                <button
                  type="button"
                  onClick={() => setShowAdviceModal(false)}
                  className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
