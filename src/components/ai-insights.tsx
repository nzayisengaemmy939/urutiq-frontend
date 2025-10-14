import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Button } from "../components/ui/button"
import { Progress } from "../components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import {
  Brain,
  TrendingUp,
  AlertTriangle,
  Target,
  Lightbulb,
  ThumbsUp,
  ThumbsDown,
  X,
  ChevronRight,
  Sparkles,
  Clock,
  CheckCircle,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"

interface AIInsight {
  id: string
  type: "prediction" | "anomaly" | "recommendation" | "insight"
  title: string
  description: string
  priority: "high" | "medium" | "low"
  icon: any
  confidence: number
  timestamp: string
  status: "new" | "viewed" | "dismissed" | "acted"
  actionable: boolean
  impact?: string
  suggestedAction?: string
  learningFeedback?: "positive" | "negative" | null
}

const initialInsights: AIInsight[] = [
  {
    id: "cf-001",
    type: "prediction",
    title: "Cash Flow Forecast",
    description: "Expected $45K shortfall in Q2 based on current trends",
    priority: "high",
    icon: TrendingUp,
    confidence: 87,
    timestamp: "2 hours ago",
    status: "new",
    actionable: true,
    impact: "High financial risk",
    suggestedAction: "Review upcoming expenses and consider credit line",
    learningFeedback: null,
  },
  {
    id: "an-002",
    type: "anomaly",
    title: "Unusual Expense Pattern",
    description: "Office supplies increased 340% for TechStart Inc",
    priority: "medium",
    icon: AlertTriangle,
    confidence: 94,
    timestamp: "4 hours ago",
    status: "new",
    actionable: true,
    impact: "Potential duplicate or fraud",
    suggestedAction: "Review and categorize recent office supply transactions",
    learningFeedback: null,
  },
  {
    id: "rec-003",
    type: "recommendation",
    title: "Tax Optimization",
    description: "Consider accelerating Q4 equipment purchases",
    priority: "low",
    icon: Target,
    confidence: 76,
    timestamp: "1 day ago",
    status: "viewed",
    actionable: true,
    impact: "Potential $8K tax savings",
    suggestedAction: "Schedule equipment purchases before year-end",
    learningFeedback: null,
  },
  {
    id: "ins-004",
    type: "insight",
    title: "Revenue Opportunity",
    description: "3 clients showing growth patterns for upselling",
    priority: "medium",
    icon: Lightbulb,
    confidence: 82,
    timestamp: "6 hours ago",
    status: "new",
    actionable: true,
    impact: "Potential 15% revenue increase",
    suggestedAction: "Prepare upselling proposals for identified clients",
    learningFeedback: null,
  },
]

const priorityColors = {
  high: "bg-red-50 text-red-700 border-red-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  low: "bg-cyan-50 text-cyan-700 border-cyan-200",
}

const statusColors = {
  new: "bg-cyan-500",
  viewed: "bg-blue-500",
  dismissed: "bg-gray-400",
  acted: "bg-green-500",
}

export function AIInsights() {
  const [insights, setInsights] = useState<AIInsight[]>(initialInsights)
  const [expandedInsight, setExpandedInsight] = useState<string | null>(null)
  const [isLearning, setIsLearning] = useState(false)
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const uidRef = useRef<string | null>(null)

  useEffect(() => {
    uidRef.current = `uid-${Date.now()}`

    const interval = setInterval(() => {
      // Simulate new AI insights being generated on the client only
      const shouldAddInsight = Math.random() > 0.95 // 5% chance every interval
      if (shouldAddInsight) {
        const newInsight: AIInsight = {
          id: `ai-${Date.now()}`,
          type: "insight",
          title: "New AI Discovery",
          description: "Pattern detected in recent transaction data",
          priority: "medium",
          icon: Sparkles,
          confidence: Math.floor(Math.random() * 20) + 75,
          timestamp: new Date().toISOString(),
          status: "new",
          actionable: true,
          impact: "Efficiency improvement",
          suggestedAction: "Review suggested optimizations",
          learningFeedback: null,
        }
        setInsights((prev: AIInsight[]) => [newInsight, ...prev])
      }
    }, 10000) // Check every 10 seconds

    return () => clearInterval(interval)
  }, [])

  const handleFeedback = (insightId: string, feedback: "positive" | "negative") => {
    setIsLearning(true)
    setInsights((prev) =>
      prev.map((insight) => (insight.id === insightId ? { ...insight, learningFeedback: feedback } : insight)),
    )

    // Simulate AI learning process
    setTimeout(() => {
      setIsLearning(false)
      console.log(`[v0] AI learning from ${feedback} feedback for insight ${insightId}`)
    }, 1500)
  }

  const handleDismiss = (insightId: string) => {
    setInsights((prev) =>
      prev.map((insight) => (insight.id === insightId ? { ...insight, status: "dismissed" } : insight)),
    )
  }

  const handleMarkActed = (insightId: string) => {
    setInsights((prev) => prev.map((insight) => (insight.id === insightId ? { ...insight, status: "acted" } : insight)))
  }

  const handleViewInsight = (insightId: string) => {
    setInsights((prev) =>
      prev.map((insight) =>
        insight.id === insightId && insight.status === "new" ? { ...insight, status: "viewed" } : insight,
      ),
    )
    setExpandedInsight(expandedInsight === insightId ? null : insightId)
  }

  const activeInsights = insights.filter((insight) => insight.status !== "dismissed")
  const newInsightsCount = insights.filter((insight) => insight.status === "new").length
  
  // Pagination logic
  const totalInsights = activeInsights.length
  const totalPages = Math.ceil(totalInsights / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedInsights = activeInsights.slice(startIndex, endIndex)

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-foreground">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-cyan-600" />
            AI Insights
            {newInsightsCount > 0 && (
              <Badge variant="secondary" className="bg-cyan-100 text-cyan-700">
                {newInsightsCount} new
              </Badge>
            )}
          </div>
          {isLearning && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Sparkles className="w-3 h-3 animate-pulse text-cyan-500" />
              Learning...
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {paginatedInsights.map((insight) => (
          <div key={insight.id} className="relative">
            <div className="p-4 bg-muted/30 rounded-lg border border-border hover:bg-muted/50 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <insight.icon className="w-4 h-4 text-muted-foreground" />
                    <div
                      className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${statusColors[insight.status]}`}
                      title={`Status: ${insight.status}`}
                    />
                  </div>
                  <h4 className="text-sm font-medium text-foreground">{insight.title}</h4>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {insight.timestamp}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={priorityColors[insight.priority]}>
                    {insight.priority}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewInsight(insight.id)}
                    className="h-6 w-6 p-0"
                  >
                    <ChevronRight
                      className={`w-3 h-3 transition-transform ${expandedInsight === insight.id ? "rotate-90" : ""}`}
                    />
                  </Button>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-3">{insight.description}</p>

              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Confidence:</span>
                  <Progress value={insight.confidence} className="w-16 h-1" />
                  <span className="text-xs font-medium">{insight.confidence}%</span>
                </div>
              </div>

              {expandedInsight === insight.id && (
                <div className="mt-4 pt-4 border-t border-border space-y-3">
                  {insight.impact && (
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">Impact: </span>
                      <span className="text-xs text-foreground">{insight.impact}</span>
                    </div>
                  )}

                  {insight.suggestedAction && (
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">Suggested Action: </span>
                      <span className="text-xs text-foreground">{insight.suggestedAction}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Was this helpful?</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleFeedback(insight.id, "positive")}
                        className={`h-6 w-6 p-0 ${insight.learningFeedback === "positive" ? "text-green-600" : ""}`}
                        disabled={insight.learningFeedback !== null}
                      >
                        <ThumbsUp className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleFeedback(insight.id, "negative")}
                        className={`h-6 w-6 p-0 ${insight.learningFeedback === "negative" ? "text-red-600" : ""}`}
                        disabled={insight.learningFeedback !== null}
                      >
                        <ThumbsDown className="w-3 h-3" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-1">
                      {insight.actionable && insight.status !== "acted" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMarkActed(insight.id)}
                          className="h-6 text-xs px-2 bg-transparent"
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Mark as Acted
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDismiss(insight.id)}
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-border">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {Math.min(endIndex, totalInsights)} of {totalInsights} insights
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRightIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Page size:</span>
              <Select value={pageSize.toString()} onValueChange={(value) => {
                setPageSize(parseInt(value))
                setCurrentPage(1)
              }}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {activeInsights.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Brain className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No active AI insights at the moment</p>
            <p className="text-xs mt-1">AI is continuously analyzing your data for new patterns</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
