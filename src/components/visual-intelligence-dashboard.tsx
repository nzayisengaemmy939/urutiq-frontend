import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { TrendingUp, TrendingDown, AlertTriangle, Zap, Eye } from "lucide-react"

const financialStories = [
  {
    id: 1,
    title: "Cash Flow Recovery",
    description: "Your cash flow improved by 23% this month due to faster invoice collections",
    trend: "positive",
    impact: "high",
    visualization: "waterfall",
    data: { current: 45000, previous: 36500, change: 23 },
  },
  {
    id: 2,
    title: "Expense Pattern Alert",
    description: "Office supplies spending increased 45% - potential bulk purchase opportunity",
    trend: "neutral",
    impact: "medium",
    visualization: "heatmap",
    data: { current: 2800, previous: 1930, change: 45 },
  },
  {
    id: 3,
    title: "Revenue Growth Trajectory",
    description: "Q4 revenue on track to exceed projections by 12% based on current trends",
    trend: "positive",
    impact: "high",
    visualization: "forecast",
    data: { projected: 125000, current: 140000, confidence: 87 },
  },
]

const smartInsights = [
  {
    category: "Cash Flow",
    insight: "Peak collection period: Days 15-20 of each month",
    action: "Schedule follow-ups accordingly",
    confidence: 92,
  },
  {
    category: "Expenses",
    insight: "Software subscriptions can be optimized",
    action: "Review unused licenses",
    confidence: 78,
  },
  {
    category: "Revenue",
    insight: "Client retention rate: 94%",
    action: "Focus on expansion revenue",
    confidence: 96,
  },
]

export function VisualIntelligenceDashboard() {
  const [selectedStory, setSelectedStory] = useState(financialStories[0])
  const [activeView, setActiveView] = useState("stories")

  return (
    <Card className="border-cyan-200 bg-gradient-to-br from-cyan-50 to-blue-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-cyan-600" />
            <CardTitle className="text-cyan-900">Visual Intelligence</CardTitle>
            <Badge variant="secondary" className="bg-cyan-100 text-cyan-700">
              AI-Powered
            </Badge>
          </div>
          <Tabs value={activeView} onValueChange={setActiveView} className="w-auto">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="stories">Stories</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeView} onValueChange={setActiveView} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="stories">Stories</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="stories" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                {financialStories.map((story) => (
                  <div
                    key={story.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedStory.id === story.id
                        ? "border-cyan-300 bg-cyan-50"
                        : "border-gray-200 hover:border-cyan-200 hover:bg-cyan-25"
                    }`}
                    onClick={() => setSelectedStory(story)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm text-gray-900">{story.title}</h4>
                        <p className="text-xs text-gray-600 mt-1">{story.description}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {story.trend === "positive" ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : story.trend === "negative" ? (
                          <TrendingDown className="h-4 w-4 text-red-500" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        )}
                        <Badge variant={story.impact === "high" ? "default" : "secondary"} className="text-xs">
                          {story.impact}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg border border-cyan-200 p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">{selectedStory.title}</h3>
                    <Badge variant="outline" className="text-cyan-700 border-cyan-300">
                      {selectedStory.visualization}
                    </Badge>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">
                          ${selectedStory.data.current.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">Current</div>
                      </div>
                      <div className="text-center">
                          <div className="text-2xl font-bold text-gray-600">
                            ${selectedStory.data?.previous?.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">Previous</div>
                      </div>
                      <div className="text-center">
                        <div
                          className={`text-2xl font-bold ${
                              (selectedStory.data?.change ?? 0) > 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                            {(selectedStory.data?.change ?? 0) > 0 ? "+" : ""}
                            {(selectedStory.data?.change ?? 0)}%
                        </div>
                        <div className="text-sm text-gray-600">Change</div>
                      </div>
                    </div>

                    <div className="h-32 bg-gradient-to-r from-cyan-100 to-blue-100 rounded-lg flex items-center justify-center">
                      <div className="text-center text-gray-600">
                        <Zap className="h-8 w-8 mx-auto mb-2 text-cyan-600" />
                        <div className="text-sm">Interactive {selectedStory.visualization} chart</div>
                        <div className="text-xs">Visualization renders here</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {smartInsights.map((insight, index) => (
                <div key={index} className="bg-white rounded-lg border border-cyan-200 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="text-cyan-700 border-cyan-300">
                      {insight.category}
                    </Badge>
                    <div className="text-sm text-gray-600">{insight.confidence}% confident</div>
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">{insight.insight}</h4>
                  <p className="text-sm text-gray-600 mb-3">{insight.action}</p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full border-cyan-300 text-cyan-700 hover:bg-cyan-50 bg-transparent"
                  >
                    Take Action
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
