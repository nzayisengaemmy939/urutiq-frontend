"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { PageLayout } from "@/components/page-layout"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { 
  Target, 
  Trophy, 
  Star, 
  Zap, 
  TrendingUp, 
  Award,
  Medal,
  Crown,
  Flame,
  CheckCircle,
  Clock,
  BarChart3,
  Activity,
  Settings,
  Gift,
  Users,
  Calendar
} from "lucide-react"

export default function GamificationPage() {
  const [activeTab, setActiveTab] = useState('achievements')

  const achievements = [
    { id: 1, name: "First Invoice", description: "Create your first invoice", icon: Star, earned: true, points: 100, date: "2024-01-15" },
    { id: 2, name: "Expense Master", description: "Record 50 expenses", icon: Zap, earned: true, points: 250, date: "2024-01-20" },
    { id: 3, name: "Reconciliation Pro", description: "Complete 10 bank reconciliations", icon: CheckCircle, earned: true, points: 300, date: "2024-01-25" },
    { id: 4, name: "Report Generator", description: "Generate 25 reports", icon: BarChart3, earned: false, points: 500, progress: 15 },
    { id: 5, name: "AI Assistant", description: "Use AI features 100 times", icon: Target, earned: false, points: 400, progress: 67 },
    { id: 6, name: "Streak Master", description: "Use the system for 30 consecutive days", icon: Flame, earned: false, points: 750, progress: 23 },
  ]

  const leaderboard = [
    { rank: 1, name: "John Doe", score: 2450, badge: Crown, streak: 15 },
    { rank: 2, name: "Jane Smith", score: 2180, badge: Trophy, streak: 12 },
    { rank: 3, name: "Mike Johnson", score: 1950, badge: Medal, streak: 8 },
    { rank: 4, name: "Sarah Wilson", score: 1820, badge: Star, streak: 6 },
    { rank: 5, name: "David Brown", score: 1650, badge: Star, streak: 4 },
  ]

  const challenges = [
    { id: 1, title: "Weekly Expense Tracking", description: "Record all expenses for 7 consecutive days", reward: 200, progress: 5, target: 7, icon: Calendar },
    { id: 2, title: "Invoice Accuracy", description: "Create 10 invoices with 100% accuracy", reward: 300, progress: 7, target: 10, icon: CheckCircle },
    { id: 3, title: "AI Power User", description: "Use AI categorization 50 times this month", reward: 400, progress: 32, target: 50, icon: Target },
    { id: 4, title: "Report Master", description: "Generate 5 different types of reports", reward: 250, progress: 3, target: 5, icon: BarChart3 },
  ]

  const userStats = {
    totalPoints: 1850,
    level: 8,
    levelProgress: 65,
    streak: 12,
    achievementsEarned: 3,
    totalAchievements: 6,
    rank: 2,
    weeklyScore: 420,
    monthlyScore: 1850,
  }

  return (
    <ProtectedRoute>
      <PageLayout>
        <div className="flex-1 space-y-6 p-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-balance">Gamification Dashboard</h1>
              <p className="text-muted-foreground">Make accounting fun with achievements, challenges, and friendly competition</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button>
                <Gift className="w-4 h-4 mr-2" />
                Claim Rewards
              </Button>
            </div>
          </div>

          {/* User Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Points</p>
                    <p className="text-xl font-bold">{userStats.totalPoints.toLocaleString()}</p>
                    <p className="text-xs text-yellow-600">Level {userStats.level}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <Flame className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Current Streak</p>
                    <p className="text-xl font-bold">{userStats.streak} days</p>
                    <p className="text-xs text-red-600">Keep it up!</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Award className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Achievements</p>
                    <p className="text-xl font-bold">{userStats.achievementsEarned}/{userStats.totalAchievements}</p>
                    <p className="text-xs text-blue-600">{Math.round((userStats.achievementsEarned / userStats.totalAchievements) * 100)}% complete</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Weekly Score</p>
                    <p className="text-xl font-bold">{userStats.weeklyScore}</p>
                    <p className="text-xs text-green-600">+85 from last week</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Level Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5" />
                Level Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-medium">Level {userStats.level}</span>
                  <span className="text-sm text-muted-foreground">{userStats.levelProgress}% to Level {userStats.level + 1}</span>
                </div>
                <Progress value={userStats.levelProgress} className="h-3" />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>1,850 points</span>
                  <span>2,000 points</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
              <TabsTrigger value="challenges">Challenges</TabsTrigger>
              <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
              <TabsTrigger value="rewards">Rewards</TabsTrigger>
            </TabsList>

            <TabsContent value="achievements" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.map((achievement) => (
                  <Card key={achievement.id} className={achievement.earned ? 'border-green-200 bg-green-50' : ''}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          achievement.earned ? 'bg-green-100' : 'bg-gray-100'
                        }`}>
                          <achievement.icon className={`w-6 h-6 ${
                            achievement.earned ? 'text-green-600' : 'text-gray-400'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{achievement.name}</h4>
                            {achievement.earned && (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                Earned
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{achievement.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-yellow-600">+{achievement.points} points</span>
                            {achievement.earned ? (
                              <span className="text-xs text-muted-foreground">{achievement.date}</span>
                            ) : (
                              <div className="flex items-center gap-2">
                                <Progress value={achievement.progress} className="w-16 h-2" />
                                <span className="text-xs text-muted-foreground">{achievement.progress}%</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="challenges" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Active Challenges
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {challenges.map((challenge) => (
                      <div key={challenge.id} className="p-4 border rounded-lg">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <challenge.icon className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{challenge.title}</h4>
                            <p className="text-sm text-muted-foreground">{challenge.description}</p>
                          </div>
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                            +{challenge.reward} points
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{challenge.progress}/{challenge.target}</span>
                          </div>
                          <Progress value={(challenge.progress / challenge.target) * 100} className="h-2" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="leaderboard" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5" />
                    Team Leaderboard
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {leaderboard.map((user) => (
                      <div key={user.rank} className={`flex items-center gap-3 p-3 rounded-lg ${
                        user.rank === 1 ? 'bg-yellow-50 border border-yellow-200' :
                        user.rank === 2 ? 'bg-gray-50 border border-gray-200' :
                        user.rank === 3 ? 'bg-amber-50 border border-amber-200' :
                        'bg-white border border-gray-100'
                      }`}>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-gray-600">#{user.rank}</span>
                          <user.badge className={`w-5 h-5 ${
                            user.rank === 1 ? 'text-yellow-600' :
                            user.rank === 2 ? 'text-gray-600' :
                            user.rank === 3 ? 'text-amber-600' :
                            'text-gray-400'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.score.toLocaleString()} points</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{user.streak} day streak</p>
                          <p className="text-xs text-muted-foreground">Current</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="rewards" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Gift className="w-8 h-8 text-yellow-600" />
                    </div>
                    <h4 className="font-medium mb-2">Free Month</h4>
                    <p className="text-sm text-muted-foreground mb-3">Earn 2,500 points</p>
                    <div className="space-y-2">
                      <Progress value={74} className="h-2" />
                      <p className="text-xs text-muted-foreground">1,850 / 2,500 points</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Users className="w-8 h-8 text-blue-600" />
                    </div>
                    <h4 className="font-medium mb-2">Team Training</h4>
                    <p className="text-sm text-muted-foreground mb-3">Earn 3,000 points</p>
                    <div className="space-y-2">
                      <Progress value={62} className="h-2" />
                      <p className="text-xs text-muted-foreground">1,850 / 3,000 points</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Crown className="w-8 h-8 text-green-600" />
                    </div>
                    <h4 className="font-medium mb-2">Premium Features</h4>
                    <p className="text-sm text-muted-foreground mb-3">Earn 5,000 points</p>
                    <div className="space-y-2">
                      <Progress value={37} className="h-2" />
                      <p className="text-xs text-muted-foreground">1,850 / 5,000 points</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </PageLayout>
    </ProtectedRoute>
  )
}
