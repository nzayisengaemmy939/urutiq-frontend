import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trophy, Target, BarChart3, Award, Flame, Users, CheckCircle, RefreshCw, Crown, Medal, Star as StarIcon, TrendingUp as TrendingUpIcon, Target as TargetIcon, BarChart3 as BarChart3Icon, Trophy as TrophyIcon } from 'lucide-react';
// API Functions
const api = {
    getStats: async (companyId, userId) => {
        const response = await fetch(`/api/gamification/stats/${companyId}/${userId}`);
        return response.json();
    },
    getAchievements: async (companyId, userId) => {
        const response = await fetch(`/api/gamification/achievements/${companyId}/${userId}`);
        return response.json();
    },
    checkAchievements: async (companyId, userId) => {
        const response = await fetch(`/api/gamification/achievements/${companyId}/${userId}/check`, {
            method: 'POST'
        });
        return response.json();
    },
    getProgress: async (companyId, userId) => {
        const response = await fetch(`/api/gamification/progress/${companyId}/${userId}`);
        return response.json();
    },
    updateProgress: async (companyId, userId, points) => {
        const response = await fetch(`/api/gamification/progress/${companyId}/${userId}/update`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ points })
        });
        return response.json();
    },
    getActiveChallenges: async (companyId) => {
        const response = await fetch(`/api/gamification/challenges/${companyId}/active`);
        return response.json();
    },
    joinChallenge: async (challengeId, companyId, userId) => {
        const response = await fetch(`/api/gamification/challenges/${challengeId}/join/${companyId}/${userId}`, {
            method: 'POST'
        });
        return response.json();
    },
    getLeaderboards: async (companyId) => {
        const response = await fetch(`/api/gamification/leaderboards/${companyId}`);
        return response.json();
    },
    updateLeaderboard: async (leaderboardId, companyId) => {
        const response = await fetch(`/api/gamification/leaderboards/${leaderboardId}/update/${companyId}`, {
            method: 'PUT'
        });
        return response.json();
    },
    trackActivity: async (companyId, userId, activityType, points) => {
        const response = await fetch(`/api/gamification/activity/${companyId}/${userId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ activityType, points })
        });
        return response.json();
    },
    getAchievementTemplates: async () => {
        const response = await fetch('/api/gamification/achievement-templates');
        return response.json();
    },
    getChallengeTemplates: async () => {
        const response = await fetch('/api/gamification/challenge-templates');
        return response.json();
    },
    getLeaderboardTemplates: async () => {
        const response = await fetch('/api/gamification/leaderboard-templates');
        return response.json();
    }
};
// Gamification Dashboard Component
export const GamificationDashboard = ({ companyId, userId }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [showAchievementModal, setShowAchievementModal] = useState(false);
    const [selectedChallenge, setSelectedChallenge] = useState(null);
    const [selectedLeaderboard, setSelectedLeaderboard] = useState(null);
    const queryClient = useQueryClient();
    // Queries
    const { data: stats, isLoading: statsLoading } = useQuery({
        queryKey: ['gamificationStats', companyId, userId],
        queryFn: () => api.getStats(companyId, userId)
    });
    const { data: achievements, isLoading: achievementsLoading } = useQuery({
        queryKey: ['achievements', companyId, userId],
        queryFn: () => api.getAchievements(companyId, userId)
    });
    const { data: progress, isLoading: progressLoading } = useQuery({
        queryKey: ['userProgress', companyId, userId],
        queryFn: () => api.getProgress(companyId, userId)
    });
    const { data: challenges, isLoading: challengesLoading } = useQuery({
        queryKey: ['activeChallenges', companyId],
        queryFn: () => api.getActiveChallenges(companyId)
    });
    const { data: leaderboards, isLoading: leaderboardsLoading } = useQuery({
        queryKey: ['leaderboards', companyId],
        queryFn: () => api.getLeaderboards(companyId)
    });
    const { data: achievementTemplates } = useQuery({
        queryKey: ['achievementTemplates'],
        queryFn: () => api.getAchievementTemplates()
    });
    const { data: challengeTemplates } = useQuery({
        queryKey: ['challengeTemplates'],
        queryFn: () => api.getChallengeTemplates()
    });
    // Mutations
    const checkAchievementsMutation = useMutation({
        mutationFn: () => api.checkAchievements(companyId, userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['achievements', companyId, userId] });
            queryClient.invalidateQueries({ queryKey: ['gamificationStats', companyId, userId] });
            setShowAchievementModal(true);
        }
    });
    const joinChallengeMutation = useMutation({
        mutationFn: ({ challengeId }) => api.joinChallenge(challengeId, companyId, userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['activeChallenges', companyId] });
        }
    });
    const updateLeaderboardMutation = useMutation({
        mutationFn: ({ leaderboardId }) => api.updateLeaderboard(leaderboardId, companyId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leaderboards', companyId] });
        }
    });
    const trackActivityMutation = useMutation({
        mutationFn: ({ activityType, points }) => api.trackActivity(companyId, userId, activityType, points),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['gamificationStats', companyId, userId] });
            queryClient.invalidateQueries({ queryKey: ['userProgress', companyId, userId] });
            queryClient.invalidateQueries({ queryKey: ['achievements', companyId, userId] });
        }
    });
    // Tab Navigation
    const tabs = [
        { id: 'overview', label: 'Overview', icon: Trophy },
        { id: 'achievements', label: 'Achievements', icon: Award },
        { id: 'challenges', label: 'Challenges', icon: Target },
        { id: 'leaderboards', label: 'Leaderboards', icon: BarChart3 }
    ];
    const getRarityColor = (rarity) => {
        switch (rarity) {
            case 'common': return 'text-gray-600 bg-gray-100';
            case 'rare': return 'text-blue-600 bg-blue-100';
            case 'epic': return 'text-purple-600 bg-purple-100';
            case 'legendary': return 'text-yellow-600 bg-yellow-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };
    const getCategoryIcon = (category) => {
        switch (category) {
            case 'financial': return TrendingUpIcon;
            case 'learning': return TargetIcon;
            case 'engagement': return BarChart3Icon;
            case 'milestone': return TrophyIcon;
            case 'special': return StarIcon;
            default: return TrophyIcon;
        }
    };
    const getChallengeTypeIcon = (type) => {
        switch (type) {
            case 'individual': return Users;
            case 'team': return Users;
            case 'company': return Users;
            case 'global': return Users;
            default: return Users;
        }
    };
    const getLeaderboardTypeIcon = (type) => {
        switch (type) {
            case 'points': return TrophyIcon;
            case 'achievements': return Award;
            case 'streaks': return Flame;
            case 'savings': return TrendingUpIcon;
            case 'debt_reduction': return TrendingUpIcon;
            case 'learning': return TargetIcon;
            default: return BarChart3Icon;
        }
    };
    return (_jsxs("div", { className: "min-h-screen bg-gray-50", children: [_jsx("div", { className: "bg-white shadow-sm border-b", children: _jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: [_jsxs("div", { className: "flex justify-between items-center py-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Gamification Dashboard" }), _jsx("p", { className: "text-gray-600 mt-1", children: "Track your progress, earn achievements, and compete with others" })] }), _jsxs("div", { className: "flex items-center space-x-3", children: [_jsxs("div", { className: "flex items-center space-x-2 text-sm text-gray-500", children: [_jsx(Trophy, { className: "w-4 h-4" }), _jsxs("span", { children: ["Level ", stats?.data?.level || 1] })] }), _jsxs("div", { className: "flex items-center space-x-2 text-sm text-green-600", children: [_jsx(Flame, { className: "w-4 h-4" }), _jsxs("span", { children: [stats?.data?.currentStreak || 0, " day streak"] })] })] })] }), _jsx("div", { className: "flex space-x-8", children: tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (_jsxs("button", { onClick: () => setActiveTab(tab.id), className: `flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                                        ? 'border-teal-500 text-teal-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`, children: [_jsx(Icon, { className: "w-4 h-4" }), _jsx("span", { children: tab.label })] }, tab.id));
                            }) })] }) }), _jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: [activeTab === 'overview' && (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsx("div", { className: "bg-white rounded-lg shadow p-6", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "p-2 bg-teal-100 rounded-lg", children: _jsx(Trophy, { className: "w-6 h-6 text-teal-600" }) }), _jsxs("div", { className: "ml-4", children: [_jsx("p", { className: "text-sm font-medium text-gray-500", children: "Total Points" }), _jsx("p", { className: "text-lg font-bold text-gray-900", children: stats?.data?.totalPoints || 0 })] })] }) }), _jsx("div", { className: "bg-white rounded-lg shadow p-6", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "p-2 bg-blue-100 rounded-lg", children: _jsx(Award, { className: "w-6 h-6 text-blue-600" }) }), _jsxs("div", { className: "ml-4", children: [_jsx("p", { className: "text-sm font-medium text-gray-500", children: "Achievements" }), _jsx("p", { className: "text-lg font-bold text-gray-900", children: stats?.data?.achievementsUnlocked || 0 })] })] }) }), _jsx("div", { className: "bg-white rounded-lg shadow p-6", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "p-2 bg-orange-100 rounded-lg", children: _jsx(Flame, { className: "w-6 h-6 text-orange-600" }) }), _jsxs("div", { className: "ml-4", children: [_jsx("p", { className: "text-sm font-medium text-gray-500", children: "Current Streak" }), _jsxs("p", { className: "text-lg font-bold text-gray-900", children: [stats?.data?.currentStreak || 0, " days"] })] })] }) }), _jsx("div", { className: "bg-white rounded-lg shadow p-6", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "p-2 bg-purple-100 rounded-lg", children: _jsx(Target, { className: "w-6 h-6 text-purple-600" }) }), _jsxs("div", { className: "ml-4", children: [_jsx("p", { className: "text-sm font-medium text-gray-500", children: "Challenges" }), _jsx("p", { className: "text-lg font-bold text-gray-900", children: stats?.data?.challengesCompleted || 0 })] })] }) })] }), _jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 mb-4", children: "Level Progress" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex justify-between text-sm", children: [_jsxs("span", { className: "text-gray-500", children: ["Level ", stats?.data?.level || 1] }), _jsxs("span", { className: "font-medium", children: [stats?.data?.experience || 0, " / ", stats?.data?.experienceToNextLevel || 100, " XP"] })] }), _jsx("div", { className: "w-full bg-gray-200 rounded-full h-3", children: _jsx("div", { className: "bg-teal-600 h-3 rounded-full transition-all duration-300", style: { width: `${((stats?.data?.experience || 0) / (stats?.data?.experienceToNextLevel || 100)) * 100}%` } }) }), _jsxs("p", { className: "text-xs text-gray-500", children: [stats?.data?.experienceToNextLevel - (stats?.data?.experience || 0), " XP needed for next level"] })] })] }), _jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900", children: "Recent Achievements" }), _jsx("button", { onClick: () => checkAchievementsMutation.mutate(), className: "bg-teal-600 text-white px-3 py-1 rounded-md hover:bg-teal-700 text-sm", children: "Check Achievements" })] }), stats?.data?.recentAchievements?.length > 0 ? (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: stats.data.recentAchievements.map((achievement) => (_jsxs("div", { className: "border rounded-lg p-4 bg-green-50", children: [_jsxs("div", { className: "flex items-center space-x-2 mb-2", children: [_jsx("span", { className: "text-2xl", children: achievement.icon }), _jsx("h4", { className: "font-medium text-gray-900", children: achievement.name })] }), _jsx("p", { className: "text-sm text-gray-600 mb-2", children: achievement.description }), _jsxs("div", { className: "flex items-center justify-between text-xs text-gray-500", children: [_jsxs("span", { children: ["+", achievement.points, " points"] }), _jsx("span", { children: achievement.unlockedAt ? new Date(achievement.unlockedAt).toLocaleDateString() : '' })] })] }, achievement.id))) })) : (_jsx("p", { className: "text-sm text-gray-500", children: "No recent achievements" }))] }), _jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 mb-4", children: "Upcoming Challenges" }), stats?.data?.upcomingChallenges?.length > 0 ? (_jsx("div", { className: "space-y-4", children: stats.data.upcomingChallenges.slice(0, 3).map((challenge) => (_jsxs("div", { className: "border rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("h4", { className: "font-medium text-gray-900", children: challenge.name }), _jsx("span", { className: "text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded", children: challenge.type })] }), _jsx("p", { className: "text-sm text-gray-600 mb-2", children: challenge.description }), _jsxs("div", { className: "flex items-center justify-between text-xs text-gray-500", children: [_jsxs("span", { children: ["Reward: ", challenge.rewardPoints, " points"] }), _jsxs("span", { children: ["Starts: ", new Date(challenge.startDate).toLocaleDateString()] })] })] }, challenge.id))) })) : (_jsx("p", { className: "text-sm text-gray-500", children: "No upcoming challenges" }))] })] })), activeTab === 'achievements' && (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900", children: "Achievements" }), _jsxs("button", { onClick: () => checkAchievementsMutation.mutate(), className: "bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 flex items-center space-x-2", children: [_jsx(RefreshCw, { className: "w-4 h-4" }), _jsx("span", { children: "Check Achievements" })] })] }), achievementsLoading ? (_jsxs("div", { className: "text-center py-8", children: [_jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto" }), _jsx("p", { className: "mt-2 text-sm text-gray-500", children: "Loading achievements..." })] })) : achievements?.data?.length > 0 ? (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: achievements.data.map((achievement) => (_jsxs("div", { className: `bg-white rounded-lg shadow p-6 ${achievement.unlocked ? 'border-2 border-green-200' : 'border border-gray-200'}`, children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("span", { className: "text-3xl", children: achievement.icon }), _jsx("h3", { className: "font-medium text-gray-900", children: achievement.name })] }), achievement.unlocked && (_jsx(CheckCircle, { className: "w-5 h-5 text-green-600" }))] }), _jsx("p", { className: "text-sm text-gray-600 mb-4", children: achievement.description }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-gray-500", children: "Progress" }), _jsxs("span", { className: "font-medium", children: [achievement.progress, " / ", achievement.maxProgress] })] }), _jsx("div", { className: "w-full bg-gray-200 rounded-full h-2", children: _jsx("div", { className: `h-2 rounded-full transition-all duration-300 ${achievement.unlocked ? 'bg-green-600' : 'bg-teal-600'}`, style: { width: `${(achievement.progress / achievement.maxProgress) * 100}%` } }) }), _jsxs("div", { className: "flex items-center justify-between text-xs", children: [_jsxs("span", { className: "text-gray-500", children: ["+", achievement.points, " points"] }), achievement.unlocked && achievement.unlockedAt && (_jsxs("span", { className: "text-green-600", children: ["Unlocked ", new Date(achievement.unlockedAt).toLocaleDateString()] }))] })] })] }, achievement.id))) })) : (_jsxs("div", { className: "text-center py-8", children: [_jsx(Award, { className: "mx-auto h-12 w-12 text-gray-400" }), _jsx("p", { className: "mt-2 text-sm text-gray-500", children: "No achievements available" })] }))] })), activeTab === 'challenges' && (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900", children: "Active Challenges" }), _jsx("button", { onClick: () => queryClient.invalidateQueries({ queryKey: ['activeChallenges', companyId] }), className: "bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700", children: _jsx(RefreshCw, { className: "w-4 h-4" }) })] }), challengesLoading ? (_jsxs("div", { className: "text-center py-8", children: [_jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto" }), _jsx("p", { className: "mt-2 text-sm text-gray-500", children: "Loading challenges..." })] })) : challenges?.data?.length > 0 ? (_jsx("div", { className: "space-y-4", children: challenges.data.map((challenge) => {
                                    const userParticipant = challenge.participants.find(p => p.userId === userId);
                                    const Icon = getChallengeTypeIcon(challenge.type);
                                    return (_jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Icon, { className: "w-5 h-5 text-teal-600" }), _jsx("h3", { className: "font-medium text-gray-900", children: challenge.name })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("span", { className: `text-xs px-2 py-1 rounded ${challenge.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`, children: challenge.status }), _jsx("span", { className: "text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded", children: challenge.type })] })] }), _jsx("p", { className: "text-sm text-gray-600 mb-4", children: challenge.description }), userParticipant ? (_jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-gray-500", children: "Your Progress" }), _jsxs("span", { className: "font-medium", children: [userParticipant.currentValue, " / ", userParticipant.targetValue] })] }), _jsx("div", { className: "w-full bg-gray-200 rounded-full h-2", children: _jsx("div", { className: `h-2 rounded-full transition-all duration-300 ${userParticipant.completed ? 'bg-green-600' : 'bg-teal-600'}`, style: { width: `${userParticipant.progress}%` } }) }), _jsxs("div", { className: "flex items-center justify-between text-xs text-gray-500", children: [_jsxs("span", { children: [userParticipant.progress, "% complete"] }), userParticipant.completed && (_jsx("span", { className: "text-green-600", children: "Completed!" }))] })] })) : (_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "text-sm text-gray-500", children: [_jsxs("p", { children: ["Reward: ", challenge.rewardPoints, " points"] }), _jsxs("p", { children: ["Ends: ", new Date(challenge.endDate).toLocaleDateString()] })] }), _jsx("button", { onClick: () => joinChallengeMutation.mutate({ challengeId: challenge.id }), className: "bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700", children: "Join Challenge" })] }))] }, challenge.id));
                                }) })) : (_jsxs("div", { className: "text-center py-8", children: [_jsx(Target, { className: "mx-auto h-12 w-12 text-gray-400" }), _jsx("p", { className: "mt-2 text-sm text-gray-500", children: "No active challenges" })] }))] })), activeTab === 'leaderboards' && (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900", children: "Leaderboards" }), _jsx("button", { onClick: () => queryClient.invalidateQueries({ queryKey: ['leaderboards', companyId] }), className: "bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700", children: _jsx(RefreshCw, { className: "w-4 h-4" }) })] }), leaderboardsLoading ? (_jsxs("div", { className: "text-center py-8", children: [_jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto" }), _jsx("p", { className: "mt-2 text-sm text-gray-500", children: "Loading leaderboards..." })] })) : leaderboards?.data?.length > 0 ? (_jsx("div", { className: "space-y-6", children: leaderboards.data.map((leaderboard) => {
                                    const Icon = getLeaderboardTypeIcon(leaderboard.type);
                                    const userEntry = leaderboard.participants.find(p => p.userId === userId);
                                    return (_jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Icon, { className: "w-5 h-5 text-teal-600" }), _jsx("h3", { className: "font-medium text-gray-900", children: leaderboard.name })] }), _jsx("button", { onClick: () => updateLeaderboardMutation.mutate({ leaderboardId: leaderboard.id }), className: "text-xs text-teal-600 hover:text-teal-700", children: "Update" })] }), _jsx("p", { className: "text-sm text-gray-600 mb-4", children: leaderboard.description }), _jsx("div", { className: "space-y-2", children: leaderboard.participants.slice(0, 10).map((entry, index) => (_jsxs("div", { className: `flex items-center justify-between p-3 rounded-lg ${entry.userId === userId ? 'bg-teal-50 border border-teal-200' : 'bg-gray-50'}`, children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsxs("div", { className: "flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 text-sm font-medium", children: [index === 0 && _jsx(Crown, { className: "w-4 h-4 text-yellow-600" }), index === 1 && _jsx(Medal, { className: "w-4 h-4 text-gray-600" }), index === 2 && _jsx(Award, { className: "w-4 h-4 text-orange-600" }), index > 2 && entry.rank] }), _jsx("span", { className: "font-medium text-gray-900", children: entry.displayName }), entry.userId === userId && (_jsx("span", { className: "text-xs bg-teal-100 text-teal-800 px-2 py-1 rounded", children: "You" }))] }), _jsx("span", { className: "font-medium text-gray-900", children: entry.value })] }, entry.id))) }), userEntry && userEntry.rank > 10 && (_jsx("div", { className: "mt-4 pt-4 border-t", children: _jsxs("div", { className: "flex items-center justify-between text-sm text-gray-500", children: [_jsxs("span", { children: ["Your rank: #", userEntry.rank] }), _jsxs("span", { children: ["Your score: ", userEntry.value] })] }) }))] }, leaderboard.id));
                                }) })) : (_jsxs("div", { className: "text-center py-8", children: [_jsx(BarChart3, { className: "mx-auto h-12 w-12 text-gray-400" }), _jsx("p", { className: "mt-2 text-sm text-gray-500", children: "No leaderboards available" })] }))] }))] }), showAchievementModal && (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50", children: _jsx("div", { className: "bg-white rounded-lg p-6 max-w-md w-full mx-4", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-6xl mb-4", children: "\uD83C\uDF89" }), _jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "Achievement Unlocked!" }), _jsx("p", { className: "text-sm text-gray-600 mb-4", children: "Congratulations! You've earned new achievements. Check your achievements tab to see them all." }), _jsx("button", { onClick: () => setShowAchievementModal(false), className: "bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700", children: "Continue" })] }) }) }))] }));
};
