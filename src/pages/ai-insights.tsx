import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Progress } from "../components/ui/progress"
import { PageLayout } from "../components/page-layout"
import { ProtectedRoute } from "../components/auth/protected-route"
import { Brain, TrendingUp, AlertTriangle, Lightbulb, Target, Zap, Eye, Settings, Calculator, RefreshCw } from "lucide-react"
import { useAIInsights } from "../hooks/useAIInsights"
import { useAIInsightsList } from "../hooks/useAIInsightsList"
import { inventoryApi } from "../lib/api/inventory"
import { useQuery } from "@tanstack/react-query"
import { getCompanyId } from "../lib/config"
import { useState } from "react"

export default function AIInsightsPage() {
  const { data, loading, error, refetch, generateInsights } = useAIInsights();
  const { insights: realInsights, loading: insightsLoading, error: insightsError, refetch: refetchInsights } = useAIInsightsList();
  const [isGenerating, setIsGenerating] = useState(false);
  
  const companyId = getCompanyId();
  
  // Fetch real inventory alerts
  const alertsQuery = useQuery({
    queryKey: ['alerts', companyId],
    queryFn: async () => {
      return await inventoryApi.getAlerts({ companyId })
    },
    enabled: !!companyId
  });
  
  const alerts = alertsQuery.data || [];

  const handleGenerateInsights = async () => {
    try {
      setIsGenerating(true);
      await generateInsights('financial_anomaly');
      await refetch();
    } catch (err) {
      console.error('Error generating insights:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <PageLayout>
          <div className="flex-1 space-y-6 p-6">
            <div className="flex items-center justify-center h-64">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Loading AI Insights...</span>
              </div>
            </div>
          </div>
        </PageLayout>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <PageLayout>
          <div className="flex-1 space-y-6 p-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Error Loading AI Insights</h3>
                <p className="text-muted-foreground mb-4">{error?.message || error?.toString() || 'Unknown error'}</p>
                <Button onClick={refetch}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        </PageLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <PageLayout>
      <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">AI Insights & Predictions</h1>
          <p className="text-muted-foreground">Leverage AI to optimize your financial performance and predict trends</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            AI Settings
          </Button>
          <Button onClick={handleGenerateInsights} disabled={isGenerating}>
            {isGenerating ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Brain className="w-4 h-4 mr-2" />
            )}
            {isGenerating ? 'Generating...' : 'Generate Insights'}
          </Button>
        </div>
      </div>

      {/* AI Health Score */}
      <Card className="bg-gradient-to-r from-cyan-50 to-blue-50 border-cyan-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center">
                <Brain className="w-8 h-8 text-cyan-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Financial Health Score</h2>
                <p className="text-muted-foreground">AI-powered assessment of your business performance</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-cyan-600">{data?.healthScore?.score || 0}</div>
              <div className="text-sm text-muted-foreground">
                {(data?.healthScore?.score || 0) >= 80 ? 'Excellent' : 
                 (data?.healthScore?.score || 0) >= 60 ? 'Good' : 
                 (data?.healthScore?.score || 0) >= 40 ? 'Fair' : 'Needs Improvement'}
              </div>
              <Badge variant="default" className="mt-1">
                {(data?.healthScore?.revenueGrowth || 0) > 0 ? '+' : ''}{(data?.healthScore?.revenueGrowth || 0).toFixed(1)}% growth
              </Badge>
            </div>
          </div>
          <div className="mt-4">
            <Progress value={data?.healthScore.score || 0} className="h-3" />
          </div>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Payment Rate:</span>
              <span className="ml-2 font-medium">{data?.healthScore?.paymentRate || 0}%</span>
            </div>
            <div>
              <span className="text-muted-foreground">Profit Margin:</span>
              <span className="ml-2 font-medium">{data?.healthScore?.profitMargin || 0}%</span>
            </div>
            <div>
              <span className="text-muted-foreground">Revenue Growth:</span>
              <span className="ml-2 font-medium">{data?.healthScore?.revenueGrowth || 0}%</span>
            </div>
            <div>
              <span className="text-muted-foreground">Overdue:</span>
              <span className="ml-2 font-medium">{data?.healthScore?.overduePercentage || 0}%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key AI Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Prediction Accuracy</p>
                <p className="text-xl font-bold">{data?.aiMetrics.predictionAccuracy}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Anomalies Detected</p>
                <p className="text-xl font-bold">{data?.aiMetrics.anomaliesDetected}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Recommendations</p>
                <p className="text-xl font-bold">{data?.aiMetrics.activeRecommendations}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Goals on Track</p>
                <p className="text-xl font-bold">{data?.aiMetrics.goalsOnTrack}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="predictions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="anomalies">Anomaly Detection</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="tax-optimization">Tax Optimization</TabsTrigger>
          <TabsTrigger value="insights">Smart Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="predictions" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Revenue Predictions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Revenue Forecast
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                      <span className="text-sm text-muted-foreground">Loading predictions...</span>
                    </div>
                  ) : error ? (
                    <div className="flex items-center justify-center py-8 text-red-600">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      <span className="text-sm">Error loading predictions</span>
                    </div>
                  ) : data?.revenuePredictions ? (
                    <>
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <h3 className="font-medium text-green-800">AI Revenue Predictions</h3>
                        <p className="text-sm text-green-700">
                          Based on your financial data and AI analysis
                        </p>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">Next Month</p>
                            <p className="text-sm text-muted-foreground">
                              Confidence: {data.revenuePredictions.nextMonth.confidence}%
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-green-600">
                              ${data.revenuePredictions.nextMonth.amount.toLocaleString()}
                            </p>
                            {data.revenuePredictions.nextMonth.change && (
                              <p className="text-sm text-green-600">
                                +{data.revenuePredictions.nextMonth.change}%
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">Next Quarter</p>
                            <p className="text-sm text-muted-foreground">
                              Confidence: {data.revenuePredictions.nextQuarter.confidence}%
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-blue-600">
                              ${data.revenuePredictions.nextQuarter.amount.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">Next Year</p>
                            <p className="text-sm text-muted-foreground">
                              Confidence: {data.revenuePredictions.nextYear.confidence}%
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-purple-600">
                              ${data.revenuePredictions.nextYear.amount.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No revenue predictions available</p>
                      <p className="text-xs">AI is analyzing your revenue patterns</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Cash Flow Predictions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-blue-600" />
                  Cash Flow Forecast
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                      <span className="text-sm text-muted-foreground">Loading cash flow insights...</span>
                    </div>
                  ) : error ? (
                    <div className="flex items-center justify-center py-8 text-red-600">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      <span className="text-sm">Error loading cash flow insights</span>
                    </div>
                  ) : data?.cashFlowPredictions ? (
                    <>
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h3 className="font-medium text-blue-800">AI Cash Flow Analysis</h3>
                        <p className="text-sm text-blue-700">
                          Based on your transaction patterns and AI analysis
                        </p>
                      </div>
                      <div className="space-y-3">
                        <div className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-medium">Current Position</p>
                            <p className={`text-lg font-bold ${data.cashFlowPredictions.currentPosition >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              ${data.cashFlowPredictions.currentPosition.toLocaleString()}
                            </p>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Expected Inflows:</span>
                              <span className="ml-2 font-medium text-green-600">
                                ${data.cashFlowPredictions.expectedInflows.toLocaleString()}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Expected Outflows:</span>
                              <span className="ml-2 font-medium text-red-600">
                                ${data.cashFlowPredictions.expectedOutflows.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Net Cash Flow</p>
                              <p className="text-sm text-muted-foreground">
                                Status: {data.cashFlowPredictions.status}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className={`text-lg font-bold ${data.cashFlowPredictions.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                ${data.cashFlowPredictions.netCashFlow.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      <Zap className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No cash flow predictions available</p>
                      <p className="text-xs">AI is analyzing your cash flow patterns</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Insights Summary */}
          <Card>
            <CardHeader>
              <CardTitle>AI Insights Summary</CardTitle>
              <CardDescription>Overview of all AI-generated insights and patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">High Priority Insights</h3>
                  <p className="text-lg font-bold text-red-600">
                    {realInsights.filter(insight => insight.priority === 'high').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Urgent recommendations requiring attention</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Revenue Insights</h3>
                  <p className="text-lg font-bold text-green-600">
                    {data?.revenuePredictions ? 3 : 0}
                  </p>
                  <p className="text-sm text-muted-foreground">AI revenue predictions available</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Risk Alerts</h3>
                  <p className="text-lg font-bold text-amber-600">
                    {alerts.length}
                  </p>
                  <p className="text-sm text-muted-foreground">Active inventory alerts</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="anomalies" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  AI-Detected Anomalies
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{realInsights.filter(insight => insight.priority === 'high' || insight.impact === 'high').length} Critical</Badge>
                  <Button variant="ghost" size="sm" onClick={refetchInsights}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {insightsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    <span className="text-sm text-muted-foreground">Loading anomalies...</span>
                  </div>
                ) : insightsError ? (
                  <div className="flex items-center justify-center py-8 text-red-600">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    <span className="text-sm">Error loading anomalies</span>
                  </div>
                ) : realInsights.length > 0 ? (
                  realInsights
                    .filter(insight => insight.priority === 'high' || insight.impact === 'high')
                    .map((insight) => (
                      <div
                        key={insight.id}
                        className={`p-4 border rounded-lg ${
                          insight.priority === "high"
                            ? "border-red-200 bg-red-50"
                            : insight.priority === "medium"
                              ? "border-amber-200 bg-amber-50"
                              : "border-blue-200 bg-blue-50"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-medium">{insight.type.replace('_', ' ').toUpperCase()}</h3>
                              <Badge
                                variant={
                                  insight.priority === "high"
                                    ? "destructive"
                                    : insight.priority === "medium"
                                      ? "secondary"
                                      : "outline"
                                }
                              >
                                {insight.priority.toUpperCase()}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {Math.round(insight.confidence * 100)}% confidence
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{insight.description}</p>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="font-medium text-cyan-600">
                                Impact: {insight.impact?.toUpperCase() || 'MEDIUM'}
                              </span>
                              <span className="text-muted-foreground">
                                {new Date(insight.generatedAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No critical anomalies detected</p>
                    <p className="text-xs">Your financial data looks healthy!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-blue-600" />
                  AI Recommendations
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{realInsights.length} Active</Badge>
                  <Button variant="ghost" size="sm" onClick={refetchInsights}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {insightsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    <span className="text-sm text-muted-foreground">Loading recommendations...</span>
                  </div>
                ) : insightsError ? (
                  <div className="flex items-center justify-center py-8 text-red-600">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    <span className="text-sm">Error loading recommendations</span>
                  </div>
                ) : realInsights.length > 0 ? (
                  realInsights.map((insight) => (
                    <div key={insight.id} className="p-4 border rounded-lg hover:bg-muted/50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">{insight.category.replace('_', ' ').toUpperCase()}</Badge>
                            <Badge
                              variant={
                                insight.priority === "high"
                                  ? "default"
                                  : insight.priority === "medium"
                                    ? "secondary"
                                    : "outline"
                              }
                            >
                              {insight.priority.toUpperCase()} PRIORITY
                            </Badge>
                            {insight.confidence && (
                              <Badge variant="outline" className="text-xs">
                                {Math.round(insight.confidence * 100)}% confidence
                              </Badge>
                            )}
                          </div>
                          <h3 className="font-medium mb-1">{insight.type.replace('_', ' ').toUpperCase()}</h3>
                          <p className="text-sm text-muted-foreground mb-2">{insight.description}</p>
                          <div className="flex items-center gap-4 text-sm">
                            <span>Impact: {insight.impact?.toUpperCase() || 'MEDIUM'}</span>
                            <span className="text-muted-foreground">
                              {new Date(insight.generatedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            Dismiss
                          </Button>
                          <Button size="sm">Apply</Button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Lightbulb className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No recommendations available</p>
                    <p className="text-xs">AI is analyzing your data to provide personalized recommendations</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tax-optimization" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tax Optimization Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-green-600" />
                  AI Tax Optimization Insights
                </CardTitle>
                <CardDescription>AI-powered tax optimization recommendations based on your data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {insightsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    <span className="text-sm text-muted-foreground">Loading tax insights...</span>
                  </div>
                ) : insightsError ? (
                  <div className="flex items-center justify-center py-8 text-red-600">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    <span className="text-sm">Error loading tax insights</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                      <div>
                        <p className="font-medium text-green-800">AI Tax Insights</p>
                        <p className="text-2xl font-bold text-green-600">
                          {realInsights.filter(insight => insight.category === 'financial' || insight.description.toLowerCase().includes('tax')).length}
                        </p>
                      </div>
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        Active
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div>
                        <p className="font-medium text-blue-800">High Priority</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {realInsights.filter(insight => insight.priority === 'high' && (insight.category === 'financial' || insight.description.toLowerCase().includes('tax'))).length}
                        </p>
                      </div>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        Critical
                      </Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tax Optimization Strategies */}
            <Card>
              <CardHeader>
                <CardTitle>AI Tax Strategies</CardTitle>
                <CardDescription>AI-generated tax optimization recommendations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {realInsights
                    .filter(insight => insight.category === 'financial' || insight.type === 'tax' || insight.description.toLowerCase().includes('tax'))
                    .slice(0, 5)
                    .map((insight) => (
                      <div key={insight.id} className="p-4 border rounded-lg hover:bg-muted/50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline">{insight.category.replace('_', ' ').toUpperCase()}</Badge>
                              <Badge
                                variant={
                                  insight.priority === "high"
                                    ? "default"
                                    : insight.priority === "medium"
                                      ? "secondary"
                                      : "outline"
                                }
                              >
                                {insight.priority.toUpperCase()} PRIORITY
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {Math.round(insight.confidence * 100)}% confidence
                              </Badge>
                            </div>
                            <h3 className="font-medium mb-1">{insight.type.replace('_', ' ').toUpperCase()}</h3>
                            <p className="text-sm text-muted-foreground mb-2">{insight.description}</p>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="font-medium text-green-600">
                                Impact: {insight.impact?.toUpperCase() || 'MEDIUM'}
                              </span>
                              <span className="text-muted-foreground">
                                {new Date(insight.generatedAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              Learn More
                            </Button>
                            <Button size="sm">Apply</Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  {realInsights.filter(insight => insight.category === 'financial' || insight.type === 'tax' || insight.description.toLowerCase().includes('tax')).length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Calculator className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No tax optimization insights available</p>
                      <p className="text-xs">AI is analyzing your financial data to provide tax strategies</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tax Calendar */}
          <Card>
            <CardHeader>
              <CardTitle>Tax Calendar & Deadlines</CardTitle>
              <CardDescription>Important tax-related dates and deadlines</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    date: "Dec 31, 2024",
                    event: "Year-End Equipment Purchases",
                    type: "deadline",
                    description: "Last day to purchase equipment for current year depreciation"
                  },
                  {
                    date: "Jan 15, 2025",
                    event: "Q4 Estimated Tax Payment",
                    type: "payment",
                    description: "Final estimated tax payment for 2024"
                  },
                  {
                    date: "Mar 15, 2025",
                    event: "S-Corp Tax Return",
                    type: "filing",
                    description: "S-Corporation tax return deadline"
                  }
                ].map((item, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge
                        variant={
                          item.type === "deadline"
                            ? "destructive"
                            : item.type === "payment"
                              ? "default"
                              : "secondary"
                        }
                      >
                        {item.type}
                      </Badge>
                      <span className="font-medium">{item.date}</span>
                    </div>
                    <h3 className="font-medium mb-1">{item.event}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Performance Insights */}
            <Card>
              <CardHeader>
                <CardTitle>AI Performance Insights</CardTitle>
                <CardDescription>AI-generated performance analysis based on your data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {insightsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                      <span className="text-sm text-muted-foreground">Loading performance insights...</span>
                    </div>
                  ) : insightsError ? (
                    <div className="flex items-center justify-center py-8 text-red-600">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      <span className="text-sm">Error loading performance insights</span>
                    </div>
                  ) : (
                    <>
                      <div className="p-4 bg-cyan-50 border border-cyan-200 rounded-lg">
                        <h3 className="font-medium text-cyan-800 mb-2">AI Analysis Summary</h3>
                        <p className="text-sm text-cyan-700">
                          AI has analyzed {realInsights.length} insights across your financial data, identifying key patterns and opportunities.
                        </p>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <span className="text-sm">High Priority Insights</span>
                          <span className="font-medium text-red-600">
                            {realInsights.filter(insight => insight.priority === 'high').length}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <span className="text-sm">Revenue Insights</span>
                          <span className="font-medium text-green-600">
                            {data?.revenuePredictions ? 3 : 0}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <span className="text-sm">Risk Alerts</span>
                          <span className="font-medium text-amber-600">
                            {alerts.length}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <span className="text-sm">Cash Flow Insights</span>
                          <span className="font-medium text-blue-600">
                            {data?.cashFlowPredictions ? 1 : 0}
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Real Inventory Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  Real Inventory Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                {alertsQuery.isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    <span className="text-sm text-muted-foreground">Loading alerts...</span>
                  </div>
                ) : alerts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">No active alerts</p>
                    <p className="text-sm">All inventory levels are within normal parameters</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {alerts.slice(0, 5).map((alert: any) => (
                      <div key={alert.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                            <AlertTriangle className="w-4 h-4 text-amber-600" />
                          </div>
                          <div>
                            <p className="font-medium">{alert.product?.name || 'Unknown Product'}</p>
                            <p className="text-sm text-muted-foreground">
                              {alert.alertType?.replace('_', ' ').toLowerCase()} • 
                              Current: {alert.product?.stockQuantity || 0} • 
                              Threshold: {alert.threshold}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-amber-600 border-amber-200">
                          {alert.status}
                        </Badge>
                      </div>
                    ))}
                    {alerts.length > 5 && (
                      <div className="text-center py-2">
                        <Button variant="ghost" size="sm">
                          View {alerts.length - 5} more alerts
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Market Intelligence */}
            <Card>
              <CardHeader>
                <CardTitle>AI Market Intelligence</CardTitle>
                <CardDescription>AI-powered market analysis and competitive insights</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {insightsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                      <span className="text-sm text-muted-foreground">Loading market insights...</span>
                    </div>
                  ) : insightsError ? (
                    <div className="flex items-center justify-center py-8 text-red-600">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      <span className="text-sm">Error loading market insights</span>
                    </div>
                  ) : (
                    <>
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h3 className="font-medium text-blue-800 mb-2">AI Market Analysis</h3>
                        <p className="text-sm text-blue-700">
                          AI has identified {realInsights.filter(insight => insight.category === 'financial' || insight.type === 'financial').length} market-related insights from your financial patterns.
                        </p>
                      </div>
                      <div className="space-y-3">
                        <div className="p-3 border rounded-lg">
                          <p className="font-medium text-sm">Total AI Insights</p>
                          <p className="text-lg font-bold text-blue-600">{realInsights.length}</p>
                          <p className="text-xs text-muted-foreground">Generated from your data</p>
                        </div>
                        <div className="p-3 border rounded-lg">
                          <p className="font-medium text-sm">Confidence Level</p>
                          <p className="text-lg font-bold text-green-600">
                            {realInsights.length > 0 ? Math.round(realInsights.reduce((sum, insight) => sum + insight.confidence, 0) / realInsights.length * 100) : 0}%
                          </p>
                          <p className="text-xs text-muted-foreground">Average AI confidence</p>
                        </div>
                        <div className="p-3 border rounded-lg">
                          <p className="font-medium text-sm">Recent Insights</p>
                          <p className="text-lg font-bold text-purple-600">
                            {realInsights.filter(insight => {
                              const insightDate = new Date(insight.generatedAt);
                              const weekAgo = new Date();
                              weekAgo.setDate(weekAgo.getDate() - 7);
                              return insightDate > weekAgo;
                            }).length}
                          </p>
                          <p className="text-xs text-muted-foreground">Generated this week</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Learning Progress */}
          <Card>
            <CardHeader>
              <CardTitle>AI Learning Progress</CardTitle>
              <CardDescription>AI model performance and learning status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {insightsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    <span className="text-sm text-muted-foreground">Loading AI metrics...</span>
                  </div>
                ) : insightsError ? (
                  <div className="flex items-center justify-center py-8 text-red-600">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    <span className="text-sm">Error loading AI metrics</span>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 border rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">{realInsights.length}</p>
                        <p className="text-sm text-muted-foreground">Insights Generated</p>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <p className="text-2xl font-bold text-green-600">
                          {realInsights.length > 0 ? Math.round(realInsights.reduce((sum, insight) => sum + insight.confidence, 0) / realInsights.length * 100) : 0}%
                        </p>
                        <p className="text-sm text-muted-foreground">Average Confidence</p>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <p className="text-2xl font-bold text-purple-600">
                          {realInsights.filter(insight => insight.priority === 'high').length}
                        </p>
                        <p className="text-sm text-muted-foreground">High Priority Alerts</p>
                      </div>
                    </div>
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-green-800 font-medium">
                        AI Model Status: {realInsights.length > 10 ? 'Fully Trained' : 'Learning'}
                      </p>
                      <p className="text-sm text-green-700">
                        {realInsights.length > 10 
                          ? `Your AI model has generated ${realInsights.length} insights and is providing highly accurate recommendations.`
                          : `Your AI model is learning from your data. Generated ${realInsights.length} insights so far. More data will improve accuracy.`}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </PageLayout>
    </ProtectedRoute>
  )
}
