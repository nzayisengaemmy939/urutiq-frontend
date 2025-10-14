import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Trophy,
  TrendingUp,
  Target,
  BarChart3,
  Plus,
  Star,
  Award,
  Fire,
  Users,
  Calendar,
  Clock,
  CheckCircle,
  Play,
  Pause,
  RefreshCw,
  Crown,
  Medal,
  Zap,
  Gift,
  ArrowUp,
  ArrowDown,
  Minus,
  Crown as CrownIcon,
  Star as StarIcon,
  Zap as ZapIcon,
  Gift as GiftIcon,
  TrendingUp as TrendingUpIcon,
  Target as TargetIcon,
  BarChart3 as BarChart3Icon,
  Trophy as TrophyIcon
} from 'lucide-react';

// Types
interface Achievement {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  points: number;
  unlocked: boolean;
  unlockedAt?: Date;
  progress: number;
  maxProgress: number;
}

interface UserProgress {
  id: string;
  totalPoints: number;
  level: number;
  experience: number;
  experienceToNextLevel: number;
  achievementsUnlocked: number;
  totalAchievements: number;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: Date;
}

interface Challenge {
  id: string;
  name: string;
  description: string;
  category: string;
  type: string;
  startDate: Date;
  endDate: Date;
  targetValue: number;
  targetType: string;
  rewardPoints: number;
  rewardBadge?: string;
  participants: ChallengeParticipant[];
  status: string;
}

interface ChallengeParticipant {
  id: string;
  userId: string;
  currentValue: number;
  targetValue: number;
  progress: number;
  rank?: number;
  completed: boolean;
  completedAt?: Date;
  joinedAt: Date;
}

interface Leaderboard {
  id: string;
  name: string;
  description: string;
  type: string;
  timeframe: string;
  participants: LeaderboardEntry[];
  lastUpdated: Date;
}

interface LeaderboardEntry {
  id: string;
  userId: string;
  rank: number;
  value: number;
  displayName: string;
  avatar?: string;
  lastUpdated: Date;
}

interface GamificationStats {
  totalPoints: number;
  level: number;
  achievementsUnlocked: number;
  currentStreak: number;
  longestStreak: number;
  challengesCompleted: number;
  leaderboardRankings: Array<{ type: string; rank: number; value: number }>;
  recentAchievements: Achievement[];
  upcomingChallenges: Challenge[];
  nextMilestone: any;
}

// API Functions
const api = {
  getStats: async (companyId: string, userId: string) => {
    const response = await fetch(`/api/gamification/stats/${companyId}/${userId}`);
    return response.json();
  },

  getAchievements: async (companyId: string, userId: string) => {
    const response = await fetch(`/api/gamification/achievements/${companyId}/${userId}`);
    return response.json();
  },

  checkAchievements: async (companyId: string, userId: string) => {
    const response = await fetch(`/api/gamification/achievements/${companyId}/${userId}/check`, {
      method: 'POST'
    });
    return response.json();
  },

  getProgress: async (companyId: string, userId: string) => {
    const response = await fetch(`/api/gamification/progress/${companyId}/${userId}`);
    return response.json();
  },

  updateProgress: async (companyId: string, userId: string, points: number) => {
    const response = await fetch(`/api/gamification/progress/${companyId}/${userId}/update`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ points })
    });
    return response.json();
  },

  getActiveChallenges: async (companyId: string) => {
    const response = await fetch(`/api/gamification/challenges/${companyId}/active`);
    return response.json();
  },

  joinChallenge: async (challengeId: string, companyId: string, userId: string) => {
    const response = await fetch(`/api/gamification/challenges/${challengeId}/join/${companyId}/${userId}`, {
      method: 'POST'
    });
    return response.json();
  },

  getLeaderboards: async (companyId: string) => {
    const response = await fetch(`/api/gamification/leaderboards/${companyId}`);
    return response.json();
  },

  updateLeaderboard: async (leaderboardId: string, companyId: string) => {
    const response = await fetch(`/api/gamification/leaderboards/${leaderboardId}/update/${companyId}`, {
      method: 'PUT'
    });
    return response.json();
  },

  trackActivity: async (companyId: string, userId: string, activityType: string, points?: number) => {
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
export const GamificationDashboard: React.FC<{ companyId: string; userId: string }> = ({ 
  companyId, 
  userId 
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'challenges' | 'leaderboards'>('overview');
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [selectedLeaderboard, setSelectedLeaderboard] = useState<Leaderboard | null>(null);

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
    mutationFn: ({ challengeId }: { challengeId: string }) => api.joinChallenge(challengeId, companyId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeChallenges', companyId] });
    }
  });

  const updateLeaderboardMutation = useMutation({
    mutationFn: ({ leaderboardId }: { leaderboardId: string }) => api.updateLeaderboard(leaderboardId, companyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaderboards', companyId] });
    }
  });

  const trackActivityMutation = useMutation({
    mutationFn: ({ activityType, points }: { activityType: string; points?: number }) => 
      api.trackActivity(companyId, userId, activityType, points),
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

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-600 bg-gray-100';
      case 'rare': return 'text-blue-600 bg-blue-100';
      case 'epic': return 'text-purple-600 bg-purple-100';
      case 'legendary': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'financial': return TrendingUpIcon;
      case 'learning': return TargetIcon;
      case 'engagement': return BarChart3Icon;
      case 'milestone': return TrophyIcon;
      case 'special': return StarIcon;
      default: return TrophyIcon;
    }
  };

  const getChallengeTypeIcon = (type: string) => {
    switch (type) {
      case 'individual': return Users;
      case 'team': return Users;
      case 'company': return Users;
      case 'global': return Users;
      default: return Users;
    }
  };

  const getLeaderboardTypeIcon = (type: string) => {
    switch (type) {
      case 'points': return TrophyIcon;
      case 'achievements': return Award;
      case 'streaks': return Fire;
      case 'savings': return TrendingUpIcon;
      case 'debt_reduction': return TrendingUpIcon;
      case 'learning': return TargetIcon;
      default: return BarChart3Icon;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Gamification Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Track your progress, earn achievements, and compete with others
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Trophy className="w-4 h-4" />
                <span>Level {stats?.data?.level || 1}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-green-600">
                <Fire className="w-4 h-4" />
                <span>{stats?.data?.currentStreak || 0} day streak</span>
              </div>
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
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-teal-100 rounded-lg">
                    <Trophy className="w-6 h-6 text-teal-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Points</p>
                    <p className="text-lg font-bold text-gray-900">{stats?.data?.totalPoints || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Award className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Achievements</p>
                    <p className="text-lg font-bold text-gray-900">{stats?.data?.achievementsUnlocked || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Fire className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Current Streak</p>
                    <p className="text-lg font-bold text-gray-900">{stats?.data?.currentStreak || 0} days</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Target className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Challenges</p>
                    <p className="text-lg font-bold text-gray-900">{stats?.data?.challengesCompleted || 0}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Level Progress */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Level Progress</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Level {stats?.data?.level || 1}</span>
                  <span className="font-medium">{stats?.data?.experience || 0} / {stats?.data?.experienceToNextLevel || 100} XP</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-teal-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${((stats?.data?.experience || 0) / (stats?.data?.experienceToNextLevel || 100)) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500">
                  {stats?.data?.experienceToNextLevel - (stats?.data?.experience || 0)} XP needed for next level
                </p>
              </div>
            </div>

            {/* Recent Achievements */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Recent Achievements</h3>
                <button
                  onClick={() => checkAchievementsMutation.mutate()}
                  className="bg-teal-600 text-white px-3 py-1 rounded-md hover:bg-teal-700 text-sm"
                >
                  Check Achievements
                </button>
              </div>
              {stats?.data?.recentAchievements?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {stats.data.recentAchievements.map((achievement: Achievement) => (
                    <div key={achievement.id} className="border rounded-lg p-4 bg-green-50">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-2xl">{achievement.icon}</span>
                        <h4 className="font-medium text-gray-900">{achievement.name}</h4>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>+{achievement.points} points</span>
                        <span>{achievement.unlockedAt ? new Date(achievement.unlockedAt).toLocaleDateString() : ''}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No recent achievements</p>
              )}
            </div>

            {/* Upcoming Challenges */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Upcoming Challenges</h3>
              {stats?.data?.upcomingChallenges?.length > 0 ? (
                <div className="space-y-4">
                  {stats.data.upcomingChallenges.slice(0, 3).map((challenge: Challenge) => (
                    <div key={challenge.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{challenge.name}</h4>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {challenge.type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{challenge.description}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Reward: {challenge.rewardPoints} points</span>
                        <span>Starts: {new Date(challenge.startDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No upcoming challenges</p>
              )}
            </div>
          </div>
        )}

        {/* Achievements Tab */}
        {activeTab === 'achievements' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Achievements</h2>
              <button
                onClick={() => checkAchievementsMutation.mutate()}
                className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Check Achievements</span>
              </button>
            </div>

            {achievementsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-500">Loading achievements...</p>
              </div>
            ) : achievements?.data?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {achievements.data.map((achievement: Achievement) => (
                  <div key={achievement.id} className={`bg-white rounded-lg shadow p-6 ${
                    achievement.unlocked ? 'border-2 border-green-200' : 'border border-gray-200'
                  }`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-3xl">{achievement.icon}</span>
                        <h3 className="font-medium text-gray-900">{achievement.name}</h3>
                      </div>
                      {achievement.unlocked && (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-4">{achievement.description}</p>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Progress</span>
                        <span className="font-medium">{achievement.progress} / {achievement.maxProgress}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            achievement.unlocked ? 'bg-green-600' : 'bg-teal-600'
                          }`}
                          style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">+{achievement.points} points</span>
                        {achievement.unlocked && achievement.unlockedAt && (
                          <span className="text-green-600">Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Award className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">No achievements available</p>
              </div>
            )}
          </div>
        )}

        {/* Challenges Tab */}
        {activeTab === 'challenges' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Active Challenges</h2>
              <button
                onClick={() => queryClient.invalidateQueries({ queryKey: ['activeChallenges', companyId] })}
                className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {challengesLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-500">Loading challenges...</p>
              </div>
            ) : challenges?.data?.length > 0 ? (
              <div className="space-y-4">
                {challenges.data.map((challenge: Challenge) => {
                  const userParticipant = challenge.participants.find(p => p.userId === userId);
                  const Icon = getChallengeTypeIcon(challenge.type);
                  
                  return (
                    <div key={challenge.id} className="bg-white rounded-lg shadow p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <Icon className="w-5 h-5 text-teal-600" />
                          <h3 className="font-medium text-gray-900">{challenge.name}</h3>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`text-xs px-2 py-1 rounded ${
                            challenge.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {challenge.status}
                          </span>
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {challenge.type}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-4">{challenge.description}</p>
                      
                      {userParticipant ? (
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Your Progress</span>
                            <span className="font-medium">{userParticipant.currentValue} / {userParticipant.targetValue}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${
                                userParticipant.completed ? 'bg-green-600' : 'bg-teal-600'
                              }`}
                              style={{ width: `${userParticipant.progress}%` }}
                            ></div>
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>{userParticipant.progress}% complete</span>
                            {userParticipant.completed && (
                              <span className="text-green-600">Completed!</span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-500">
                            <p>Reward: {challenge.rewardPoints} points</p>
                            <p>Ends: {new Date(challenge.endDate).toLocaleDateString()}</p>
                          </div>
                          <button
                            onClick={() => joinChallengeMutation.mutate({ challengeId: challenge.id })}
                            className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700"
                          >
                            Join Challenge
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Target className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">No active challenges</p>
              </div>
            )}
          </div>
        )}

        {/* Leaderboards Tab */}
        {activeTab === 'leaderboards' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Leaderboards</h2>
              <button
                onClick={() => queryClient.invalidateQueries({ queryKey: ['leaderboards', companyId] })}
                className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {leaderboardsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-500">Loading leaderboards...</p>
              </div>
            ) : leaderboards?.data?.length > 0 ? (
              <div className="space-y-6">
                {leaderboards.data.map((leaderboard: Leaderboard) => {
                  const Icon = getLeaderboardTypeIcon(leaderboard.type);
                  const userEntry = leaderboard.participants.find(p => p.userId === userId);
                  
                  return (
                    <div key={leaderboard.id} className="bg-white rounded-lg shadow p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <Icon className="w-5 h-5 text-teal-600" />
                          <h3 className="font-medium text-gray-900">{leaderboard.name}</h3>
                        </div>
                        <button
                          onClick={() => updateLeaderboardMutation.mutate({ leaderboardId: leaderboard.id })}
                          className="text-xs text-teal-600 hover:text-teal-700"
                        >
                          Update
                        </button>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-4">{leaderboard.description}</p>
                      
                      <div className="space-y-2">
                        {leaderboard.participants.slice(0, 10).map((entry, index) => (
                          <div key={entry.id} className={`flex items-center justify-between p-3 rounded-lg ${
                            entry.userId === userId ? 'bg-teal-50 border border-teal-200' : 'bg-gray-50'
                          }`}>
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 text-sm font-medium">
                                {index === 0 && <Crown className="w-4 h-4 text-yellow-600" />}
                                {index === 1 && <Medal className="w-4 h-4 text-gray-600" />}
                                {index === 2 && <Award className="w-4 h-4 text-orange-600" />}
                                {index > 2 && entry.rank}
                              </div>
                              <span className="font-medium text-gray-900">{entry.displayName}</span>
                              {entry.userId === userId && (
                                <span className="text-xs bg-teal-100 text-teal-800 px-2 py-1 rounded">You</span>
                              )}
                            </div>
                            <span className="font-medium text-gray-900">{entry.value}</span>
                          </div>
                        ))}
                      </div>
                      
                      {userEntry && userEntry.rank > 10 && (
                        <div className="mt-4 pt-4 border-t">
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <span>Your rank: #{userEntry.rank}</span>
                            <span>Your score: {userEntry.value}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">No leaderboards available</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Achievement Unlocked Modal */}
      {showAchievementModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Achievement Unlocked!</h3>
              <p className="text-sm text-gray-600 mb-4">
                Congratulations! You've earned new achievements. Check your achievements tab to see them all.
              </p>
              <button
                onClick={() => setShowAchievementModal(false)}
                className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
