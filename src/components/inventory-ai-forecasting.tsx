import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Badge } from "../components/ui/badge"
import { Progress } from "../components/ui/progress"
import { Alert, AlertDescription } from "../components/ui/alert"
import { useToast } from "../hooks/use-toast"
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  Package, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Download,
  Settings,
  BarChart3,
  Target,
  Zap,
  Lightbulb
} from "lucide-react"

interface DemandForecast {
  productId: string
  productName: string
  sku: string
  currentStock: number
  forecastedDemand: Array<{
    period: string
    predictedDemand: number
    confidence: number
    seasonality: number
    trend: 'increasing' | 'decreasing' | 'stable'
  }>
  recommendations: {
    suggestedReorderQuantity: number
    suggestedReorderDate: string
    riskLevel: 'low' | 'medium' | 'high'
    reasoning: string
  }
  historicalData: Array<{
    period: string
    actualDemand: number
    forecastedDemand: number
    accuracy: number
  }>
}

interface ForecastInsights {
  overallAccuracy: number
  topPerformingProducts: Array<{
    productId: string
    productName: string
    accuracy: number
  }>
  seasonalTrends: Array<{
    month: string
    averageDemand: number
    seasonalityFactor: number
  }>
  riskAlerts: Array<{
    productId: string
    productName: string
    riskType: 'stockout' | 'overstock' | 'seasonal_spike'
    severity: 'low' | 'medium' | 'high'
    description: string
  }>
}

interface AIRecommendations {
  reorderSuggestions: Array<{
    productId: string
    productName: string
    currentStock: number
    suggestedQuantity: number
    urgency: 'low' | 'medium' | 'high'
    reasoning: string
  }>
  pricingOptimizations: Array<{
    productId: string
    productName: string
    currentPrice: number
    suggestedPrice: number
    expectedImpact: string
  }>
  inventoryOptimizations: Array<{
    category: string
    currentValue: number
    suggestedValue: number
    optimization: string
  }>
}

export function InventoryAIForecasting() {
  const [forecasts, setForecasts] = useState<DemandForecast[]>([])
  const [insights, setInsights] = useState<ForecastInsights | null>(null)
  const [recommendations, setRecommendations] = useState<AIRecommendations | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState('30d')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedLocation, setSelectedLocation] = useState('all')
  const [forecastHorizon, setForecastHorizon] = useState('3m')
  const { toast } = useToast()

  useEffect(() => {
    loadForecasts()
  }, [selectedPeriod, selectedCategory, selectedLocation, forecastHorizon])

  const loadForecasts = async () => {
    setLoading(true)
    try {
      const [forecastsRes, insightsRes, recommendationsRes] = await Promise.all([
        fetch(`/api/inventory/ai/forecast?period=${selectedPeriod}&category=${selectedCategory}&location=${selectedLocation}&horizon=${forecastHorizon}`),
        fetch(`/api/inventory/ai/insights?period=${selectedPeriod}&category=${selectedCategory}&location=${selectedLocation}`),
        fetch(`/api/inventory/ai/recommendations?period=${selectedPeriod}&category=${selectedCategory}&location=${selectedLocation}`)
      ])

      if (forecastsRes.ok) {
        const forecastsData = await forecastsRes.json()
        setForecasts(forecastsData)
      }

      if (insightsRes.ok) {
        const insightsData = await insightsRes.json()
        console.log('AI Insights received:', insightsData)
        setInsights(insightsData)
      }

      if (recommendationsRes.ok) {
        const recommendationsData = await recommendationsRes.json()
        setRecommendations(recommendationsData)
      }
    } catch (error) {
      console.error('Error loading forecasts:', error)
      toast({
        title: "Error",
        description: "Failed to load AI forecasts",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600'
      case 'medium': return 'text-yellow-600'
      case 'high': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'high': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'high': return <AlertTriangle className="w-4 h-4 text-red-600" />
      case 'medium': return <AlertTriangle className="w-4 h-4 text-yellow-600" />
      case 'low': return <CheckCircle className="w-4 h-4 text-green-600" />
      default: return <Package className="w-4 h-4 text-gray-600" />
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="w-4 h-4 text-green-600" />
      case 'decreasing': return <TrendingDown className="w-4 h-4 text-red-600" />
      case 'stable': return <BarChart3 className="w-4 h-4 text-blue-600" />
      default: return <BarChart3 className="w-4 h-4 text-gray-600" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">AI Demand Forecasting</h1>
          <p className="text-muted-foreground">Predictive analytics powered by machine learning for optimal inventory management</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Select value={forecastHorizon} onValueChange={setForecastHorizon}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">1 Month</SelectItem>
              <SelectItem value="3m">3 Months</SelectItem>
              <SelectItem value="6m">6 Months</SelectItem>
              <SelectItem value="1y">1 Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={loadForecasts} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* AI Insights Overview */}
      {insights && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Brain className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Forecast Accuracy</p>
                  <p className="text-xl font-bold">{(insights.overallAccuracy * 100).toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Top Performers</p>
                  <p className="text-xl font-bold">{insights.topPerformingProducts.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Seasonal Trends</p>
                  <p className="text-xl font-bold">{insights.seasonalTrends.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Risk Alerts</p>
                  <p className="text-xl font-bold">{insights.riskAlerts.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Risk Alerts */}
      {insights?.riskAlerts && insights.riskAlerts.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">AI Risk Alerts Detected</p>
              <div className="space-y-1">
                {insights.riskAlerts.slice(0, 3).map((alert, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Badge className={getRiskBadge(alert.severity)}>
                      {alert.severity.toUpperCase()}
                    </Badge>
                    <span className="text-sm">{alert.productName}: {alert.description}</span>
                  </div>
                ))}
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* AI Recommendations */}
      {recommendations && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Reorder Suggestions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Reorder Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recommendations.reorderSuggestions.slice(0, 5).map((suggestion) => (
                  <div key={suggestion.productId} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium">{suggestion.productName}</p>
                        <p className="text-sm text-muted-foreground">
                          Current: {suggestion.currentStock} • Suggested: {suggestion.suggestedQuantity}
                        </p>
                      </div>
                      {getUrgencyIcon(suggestion.urgency)}
                    </div>
                    <p className="text-sm text-muted-foreground">{suggestion.reasoning}</p>
                    <div className="mt-2">
                      <Badge className={getRiskBadge(suggestion.urgency)}>
                        {suggestion.urgency.toUpperCase()} PRIORITY
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pricing Optimizations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Pricing Optimizations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recommendations.pricingOptimizations.slice(0, 5).map((optimization) => (
                  <div key={optimization.productId} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium">{optimization.productName}</p>
                        <p className="text-sm text-muted-foreground">
                          ${optimization.currentPrice} → ${optimization.suggestedPrice}
                        </p>
                      </div>
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    </div>
                    <p className="text-sm text-muted-foreground">{optimization.expectedImpact}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Inventory Optimizations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                Inventory Optimizations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recommendations.inventoryOptimizations.map((optimization) => (
                  <div key={optimization.category} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium">{optimization.category}</p>
                        <p className="text-sm text-muted-foreground">
                          ${optimization.currentValue} → ${optimization.suggestedValue}
                        </p>
                      </div>
                      <Target className="w-4 h-4 text-blue-600" />
                    </div>
                    <p className="text-sm text-muted-foreground">{optimization.optimization}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Demand Forecasts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Product Demand Forecasts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {forecasts.map((forecast) => (
              <div key={forecast.productId} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-medium">{forecast.productName}</h3>
                    <p className="text-sm text-muted-foreground">{forecast.sku}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="font-medium">{forecast.currentStock}</p>
                      <p className="text-xs text-muted-foreground">Current Stock</p>
                    </div>
                    <Badge className={getRiskBadge(forecast.recommendations.riskLevel)}>
                      {forecast.recommendations.riskLevel.toUpperCase()} RISK
                    </Badge>
                  </div>
                </div>

                {/* Forecast Chart */}
                <div className="space-y-3 mb-4">
                  <h4 className="font-medium">Forecasted Demand</h4>
                  <div className="space-y-2">
                    {forecast.forecastedDemand.map((period) => (
                      <div key={period.period} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium">{period.period}</span>
                          {getTrendIcon(period.trend)}
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <p className="font-medium">{period.predictedDemand}</p>
                            <p className="text-xs text-muted-foreground">Predicted</p>
                          </div>
                          <div className="text-center">
                            <p className="font-medium">{(period.confidence * 100).toFixed(0)}%</p>
                            <p className="text-xs text-muted-foreground">Confidence</p>
                          </div>
                          <div className="text-center">
                            <p className="font-medium">{period.seasonality.toFixed(2)}</p>
                            <p className="text-xs text-muted-foreground">Seasonality</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Recommendations */}
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">AI Recommendations</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-blue-700">Suggested Reorder Quantity:</span>
                      <span className="font-medium text-blue-800">{forecast.recommendations.suggestedReorderQuantity}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-blue-700">Suggested Reorder Date:</span>
                      <span className="font-medium text-blue-800">{forecast.recommendations.suggestedReorderDate}</span>
                    </div>
                    <p className="text-sm text-blue-700 mt-2">{forecast.recommendations.reasoning}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Seasonal Trends */}
      {insights?.seasonalTrends && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Seasonal Demand Patterns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {insights.seasonalTrends.map((trend) => (
                <div key={trend.month} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{trend.month}</p>
                    <p className="text-sm text-muted-foreground">Average Demand: {trend.averageDemand}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{trend.seasonalityFactor.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">Seasonality Factor</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
