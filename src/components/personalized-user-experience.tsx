import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { Switch } from "../components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Label } from "../components/ui/label"
import { Progress } from "../components/ui/progress"
import {
  User,
  Settings,
  Layout,
  Palette,
  Zap,
  Star,
  Clock,
  Target,
  TrendingUp,
  BookOpen,
  Lightbulb,
  CheckCircle,
  ArrowRight,
  BarChart3,
  FileText,
  DollarSign,
  Users,
} from "lucide-react"

interface UserPreferences {
  theme: "light" | "dark" | "auto"
  compactMode: boolean
  showTips: boolean
  autoSave: boolean
  notifications: {
    email: boolean
    push: boolean
    sms: boolean
  }
  dashboard: {
    layout: "grid" | "list" | "cards"
    widgets: string[]
    quickActions: string[]
  }
}

interface UserProfile {
  id: string
  name: string
  email: string
  role: "cfo" | "accountant" | "bookkeeper" | "business_owner"
  businessType: "startup" | "small_business" | "enterprise" | "nonprofit"
  experience: "beginner" | "intermediate" | "expert"
  preferences: UserPreferences
  usage: {
    loginStreak: number
    featuresUsed: string[]
    timeSpent: number
    completedTasks: number
  }
}

interface SmartRecommendation {
  id: string
  type: "feature" | "workflow" | "shortcut" | "integration"
  title: string
  description: string
  benefit: string
  difficulty: "easy" | "medium" | "hard"
  estimatedTime: string
  category: string
}

const mockUserProfile: UserProfile = {
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
}

const smartRecommendations: SmartRecommendation[] = [
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
]

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
}

export function PersonalizedUserExperience() {
  const [userProfile, setUserProfile] = useState<UserProfile>(mockUserProfile)
  const [recommendations, setRecommendations] = useState<SmartRecommendation[]>(smartRecommendations)
  const [onboardingStep, setOnboardingStep] = useState(0)
  const [showOnboarding, setShowOnboarding] = useState(false)

  const updatePreference = (key: string, value: any) => {
    setUserProfile((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: value,
      },
    }))
  }

  const updateNotificationPreference = (type: string, value: boolean) => {
    setUserProfile((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        notifications: {
          ...prev.preferences.notifications,
          [type]: value,
        },
      },
    }))
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "cfo":
        return <BarChart3 className="h-4 w-4" />
      case "accountant":
        return <FileText className="h-4 w-4" />
      case "bookkeeper":
        return <DollarSign className="h-4 w-4" />
      case "business_owner":
        return <Users className="h-4 w-4" />
      default:
        return <User className="h-4 w-4" />
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-700"
      case "medium":
        return "bg-yellow-100 text-yellow-700"
      case "hard":
        return "bg-red-100 text-red-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case "feature":
        return <Star className="h-4 w-4 text-blue-500" />
      case "workflow":
        return <Zap className="h-4 w-4 text-purple-500" />
      case "integration":
        return <Target className="h-4 w-4 text-green-500" />
      case "shortcut":
        return <Lightbulb className="h-4 w-4 text-yellow-500" />
      default:
        return <Settings className="h-4 w-4 text-gray-500" />
    }
  }

  const currentDashboard = roleBasedDashboards[userProfile.role]

  return (
    <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-blue-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-indigo-600" />
            <CardTitle className="text-indigo-900">Personalized Experience</CardTitle>
            <Badge variant="secondary" className="bg-indigo-100 text-indigo-700">
              Adaptive
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowOnboarding(true)}
              className="border-indigo-300 text-indigo-700 bg-transparent"
            >
              <BookOpen className="h-4 w-4 mr-1" />
              Quick Tour
            </Button>
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
              <Settings className="h-4 w-4 mr-1" />
              Customize
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">My Dashboard</TabsTrigger>
            <TabsTrigger value="recommendations">Smart Tips</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">{getRoleIcon(userProfile.role)}</div>
                <div>
                  <h3 className="font-semibold text-gray-900">{currentDashboard.name}</h3>
                  <p className="text-sm text-gray-600">{currentDashboard.description}</p>
                </div>
              </div>
              <Button size="sm" variant="outline" className="border-indigo-300 text-indigo-700 bg-transparent">
                <Layout className="h-4 w-4 mr-1" />
                Customize Layout
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Active Widgets</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {currentDashboard.widgets.map((widget, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm font-medium text-gray-900">
                          {widget.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                        </span>
                        <Switch defaultChecked />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {currentDashboard.quickActions.map((action, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm font-medium text-gray-900">
                          {action.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                        </span>
                        <Button size="sm" variant="ghost">
                          <ArrowRight className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Usage Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-indigo-600">{userProfile.usage.loginStreak}</div>
                    <div className="text-sm text-gray-600">Day Streak</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{userProfile.usage.featuresUsed.length}</div>
                    <div className="text-sm text-gray-600">Features Used</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{userProfile.usage.timeSpent}h</div>
                    <div className="text-sm text-gray-600">This Month</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{userProfile.usage.completedTasks}</div>
                    <div className="text-sm text-gray-600">Tasks Done</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendations.map((recommendation) => (
                <Card key={recommendation.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3 mb-3">
                      {getRecommendationIcon(recommendation.type)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gray-900">{recommendation.title}</h4>
                          <Badge variant="outline" className={getDifficultyColor(recommendation.difficulty)}>
                            {recommendation.difficulty}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{recommendation.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {recommendation.estimatedTime}
                          </div>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            {recommendation.benefit}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {recommendation.category}
                      </Badge>
                      <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                        Try Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Palette className="h-5 w-5 text-indigo-600" />
                    Appearance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="theme">Theme</Label>
                    <Select
                      value={userProfile.preferences.theme}
                      onValueChange={(value) => updatePreference("theme", value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="auto">Auto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="compact">Compact Mode</Label>
                      <p className="text-sm text-gray-600">Reduce spacing and padding</p>
                    </div>
                    <Switch
                      id="compact"
                      checked={userProfile.preferences.compactMode}
                      onCheckedChange={(value) => updatePreference("compactMode", value)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="tips">Show Tips</Label>
                      <p className="text-sm text-gray-600">Display helpful tips and hints</p>
                    </div>
                    <Switch
                      id="tips"
                      checked={userProfile.preferences.showTips}
                      onCheckedChange={(value) => updatePreference("showTips", value)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Settings className="h-5 w-5 text-indigo-600" />
                    Behavior
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="autosave">Auto Save</Label>
                      <p className="text-sm text-gray-600">Automatically save changes</p>
                    </div>
                    <Switch
                      id="autosave"
                      checked={userProfile.preferences.autoSave}
                      onCheckedChange={(value) => updatePreference("autoSave", value)}
                    />
                  </div>

                  <div>
                    <Label>Dashboard Layout</Label>
                    <Select
                      value={userProfile.preferences.dashboard.layout}
                      onValueChange={(value) =>
                        updatePreference("dashboard", { ...userProfile.preferences.dashboard, layout: value })
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="grid">Grid</SelectItem>
                        <SelectItem value="list">List</SelectItem>
                        <SelectItem value="cards">Cards</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg">Notifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="email-notif">Email</Label>
                        <p className="text-sm text-gray-600">Receive email notifications</p>
                      </div>
                      <Switch
                        id="email-notif"
                        checked={userProfile.preferences.notifications.email}
                        onCheckedChange={(value) => updateNotificationPreference("email", value)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="push-notif">Push</Label>
                        <p className="text-sm text-gray-600">Browser push notifications</p>
                      </div>
                      <Switch
                        id="push-notif"
                        checked={userProfile.preferences.notifications.push}
                        onCheckedChange={(value) => updateNotificationPreference("push", value)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="sms-notif">SMS</Label>
                        <p className="text-sm text-gray-600">Text message alerts</p>
                      </div>
                      <Switch
                        id="sms-notif"
                        checked={userProfile.preferences.notifications.sms}
                        onCheckedChange={(value) => updateNotificationPreference("sms", value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="profile" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Profile Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="role">Role</Label>
                    <Select
                      value={userProfile.role}
                      onValueChange={(value) => setUserProfile({ ...userProfile, role: value as any })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cfo">CFO</SelectItem>
                        <SelectItem value="accountant">Accountant</SelectItem>
                        <SelectItem value="bookkeeper">Bookkeeper</SelectItem>
                        <SelectItem value="business_owner">Business Owner</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="business-type">Business Type</Label>
                    <Select
                      value={userProfile.businessType}
                      onValueChange={(value) => setUserProfile({ ...userProfile, businessType: value as any })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="startup">Startup</SelectItem>
                        <SelectItem value="small_business">Small Business</SelectItem>
                        <SelectItem value="enterprise">Enterprise</SelectItem>
                        <SelectItem value="nonprofit">Nonprofit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="experience">Experience Level</Label>
                    <Select
                      value={userProfile.experience}
                      onValueChange={(value) => setUserProfile({ ...userProfile, experience: value as any })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="expert">Expert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Learning Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Platform Mastery</span>
                      <span className="font-medium">75%</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Feature Adoption</span>
                      <span className="font-medium">60%</span>
                    </div>
                    <Progress value={60} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Automation Setup</span>
                      <span className="font-medium">40%</span>
                    </div>
                    <Progress value={40} className="h-2" />
                  </div>

                  <div className="pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-sm text-green-700">
                      <CheckCircle className="h-4 w-4" />
                      <span>Completed onboarding</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-blue-700 mt-1">
                      <Target className="h-4 w-4" />
                      <span>Next: Set up automation rules</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
