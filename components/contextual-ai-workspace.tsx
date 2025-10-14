"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Brain,
  AlertTriangle,
  TrendingUp,
  Clock,
  Target,
  Zap,
  CheckCircle,
  XCircle,
  Calendar,
  DollarSign,
} from "lucide-react"

interface WorkspaceContext {
  userRole: "cfo" | "accountant" | "bookkeeper" | "business_owner"
  currentFocus: string[]
  urgentTasks: number
  cashFlowStatus: "healthy" | "warning" | "critical"
  complianceDeadlines: number
}

interface AIRecommendation {
  id: string
  type: "action" | "insight" | "warning" | "opportunity"
  title: string
  description: string
  priority: "high" | "medium" | "low"
  confidence: number
  estimatedTime: string
  impact: string
  category: string
}

const mockWorkspaceContext: WorkspaceContext = {
  userRole: "cfo",
  currentFocus: ["Q4 Planning", "Cash Flow Management", "Tax Preparation"],
  urgentTasks: 3,
  cashFlowStatus: "warning",
  complianceDeadlines: 2,
}

const mockRecommendations: AIRecommendation[] = [
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
]

export function ContextualAIWorkspace() {
  const [context, setContext] = useState<WorkspaceContext>(mockWorkspaceContext)
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>(mockRecommendations)
  const [dismissedItems, setDismissedItems] = useState<string[]>([])
  const [activeCategory, setActiveCategory] = useState<string>("all")

  const getRoleDisplayName = (role: string) => {
    const roleMap = {
      cfo: "Chief Financial Officer",
      accountant: "Accountant",
      bookkeeper: "Bookkeeper",
      business_owner: "Business Owner",
    }
    return roleMap[role as keyof typeof roleMap] || role
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "text-green-600 bg-green-50 border-green-200"
      case "warning":
        return "text-yellow-600 bg-yellow-50 border-yellow-200"
      case "critical":
        return "text-red-600 bg-red-50 border-red-200"
      default:
        return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "opportunity":
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case "action":
        return <Target className="h-4 w-4 text-blue-500" />
      case "insight":
        return <Brain className="h-4 w-4 text-purple-500" />
      default:
        return <Zap className="h-4 w-4 text-gray-500" />
    }
  }

  const handleDismiss = (id: string) => {
    setDismissedItems([...dismissedItems, id])
  }

  const handleTakeAction = (recommendation: AIRecommendation) => {
    // Simulate taking action
    console.log("[v0] Taking action on recommendation:", recommendation.title)
    handleDismiss(recommendation.id)
  }

  const filteredRecommendations = recommendations.filter(
    (rec) => !dismissedItems.includes(rec.id) && (activeCategory === "all" || rec.category === activeCategory),
  )

  const categories = ["all", ...Array.from(new Set(recommendations.map((r) => r.category)))]

  return (
    <div className="space-y-6">
      {/* Workspace Context Header */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="h-6 w-6 text-blue-600" />
              <div>
                <CardTitle className="text-blue-900">AI Workspace</CardTitle>
                <p className="text-sm text-blue-700 mt-1">Personalized for {getRoleDisplayName(context.userRole)}</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              Context-Aware
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-600" />
              <div>
                <div className="text-sm font-medium text-gray-900">Current Focus</div>
                <div className="text-xs text-gray-600">{context.currentFocus.join(", ")}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-600" />
              <div>
                <div className="text-sm font-medium text-gray-900">Urgent Tasks</div>
                <div className="text-xs text-gray-600">{context.urgentTasks} items</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <div>
                <div className="text-sm font-medium text-gray-900">Cash Flow</div>
                <Badge variant="outline" className={getStatusColor(context.cashFlowStatus)}>
                  {context.cashFlowStatus}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-purple-600" />
              <div>
                <div className="text-sm font-medium text-gray-900">Deadlines</div>
                <div className="text-xs text-gray-600">{context.complianceDeadlines} upcoming</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Recommendations */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-cyan-600" />
              Smart Recommendations
            </CardTitle>
            <div className="flex gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={activeCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveCategory(category)}
                  className="text-xs"
                >
                  {category === "all" ? "All" : category}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredRecommendations.map((recommendation) => (
              <Alert key={recommendation.id} className="border-l-4 border-l-cyan-400">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {getTypeIcon(recommendation.type)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900">{recommendation.title}</h4>
                        <Badge
                          variant={
                            recommendation.priority === "high"
                              ? "destructive"
                              : recommendation.priority === "medium"
                                ? "default"
                                : "secondary"
                          }
                          className="text-xs"
                        >
                          {recommendation.priority}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {recommendation.category}
                        </Badge>
                      </div>
                      <AlertDescription className="text-sm text-gray-600 mb-3">
                        {recommendation.description}
                      </AlertDescription>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {recommendation.estimatedTime}
                        </div>
                        <div className="flex items-center gap-1">
                          <Target className="h-3 w-3" />
                          {recommendation.impact}
                        </div>
                        <div className="flex items-center gap-1">
                          <Brain className="h-3 w-3" />
                          {recommendation.confidence}% confident
                        </div>
                      </div>
                      <div className="mt-2">
                        <Progress value={recommendation.confidence} className="h-1" />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      size="sm"
                      onClick={() => handleTakeAction(recommendation)}
                      className="bg-cyan-600 hover:bg-cyan-700"
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Take Action
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDismiss(recommendation.id)}>
                      <XCircle className="h-3 w-3 mr-1" />
                      Dismiss
                    </Button>
                  </div>
                </div>
              </Alert>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
