import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Lightbulb,
  Target,
  BarChart3,
  PieChart,
  LineChart,
  DollarSign,
  Users,
  Calendar,
  Zap
} from "lucide-react"
import { bankingApiV2 as bankingApi } from '@/lib/api/banking-v2'

interface FinancialInsight {
  id: string
  type: 'trend' | 'anomaly' | 'recommendation' | 'forecast'
  category: 'revenue' | 'expenses' | 'cash_flow' | 'profitability' | 'efficiency'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  confidence: number
  data: any
  actionable: boolean
  createdAt: string
}

interface IndustryBenchmark {
  industry: string
  metric: string
  value: number
  percentile: number
  comparison: 'above' | 'below' | 'average'
}

interface CashFlowForecast {
  period: string
  projectedInflow: number
  projectedOutflow: number
  netCashFlow: number
  confidence: number
  factors: string[]
}

export function AdvancedAnalytics() {
  const [insights, setInsights] = useState<FinancialInsight[]>([])
  const [benchmarks, setBenchmarks] = useState<IndustryBenchmark[]>([])
  const [forecast, setForecast] = useState<CashFlowForecast[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedIndustry, setSelectedIndustry] = useState('retail')
  const [activeTab, setActiveTab] = useState('insights')

  const industries = [
    { value: 'retail', label: 'Retail' },
    { value: 'saas', label: 'SaaS/Software' },
    { value: 'consulting', label: 'Consulting' },
    { value: 'manufacturing', label: 'Manufacturing' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'general', label: 'General Business' }
  ]

  useEffect(() => {
    loadAnalyticsData()
  }, [selectedIndustry])

  const loadAnalyticsData = useCallback(async () => {
    setLoading(true)
    try {
      // Load insights
      const insightsResponse = await bankingApi.get(`/api/analytics/insights?industry=${selectedIndustry}`)
      setInsights(insightsResponse.insights || [])

      // Load benchmarks
      const benchmarksResponse = await bankingApi.get(`/api/analytics/benchmarks/${selectedIndustry}`)
      setBenchmarks(benchmarksResponse.benchmarks || [])

      // Load forecast
      const forecastResponse = await bankingApi.get('/api/analytics/cash-flow-forecast?months=6')
      setForecast(forecastResponse.forecast || [])
    } catch (error) {
      console.error('Error loading analytics data:', error)
    } finally {
      setLoading(false)
    }
  }, [selectedIndustry])

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'trend': return <TrendingUp className="w-5 h-5 text-blue-600" />
      case 'anomaly': return <AlertTriangle className="w-5 h-5 text-orange-600" />
      case 'recommendation': return <Lightbulb className="w-5 h-5 text-green-600" />
      case 'forecast': return <Target className="w-5 h-5 text-purple-600" />
      default: return <BarChart3 className="w-5 h-5 text-gray-600" />
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'revenue': return 'text-green-600'
      case 'expenses': return 'text-red-600'
      case 'cash_flow': return 'text-blue-600'
      case 'profitability': return 'text-purple-600'
      case 'efficiency': return 'text-orange-600'
      default: return 'text-gray-600'
    }
  }

  const getComparisonIcon = (comparison: string) => {
    switch (comparison) {
      case 'above': return <TrendingUp className="w-4 h-4 text-green-600" />
      case 'below': return <TrendingDown className="w-4 h-4 text-red-600" />
      case 'average': return <BarChart3 className="w-4 h-4 text-blue-600" />
      default: return <BarChart3 className="w-4 h-4 text-gray-600" />
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Advanced Analytics</h2>
        <div className="flex items-center gap-4">
          <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {industries.map((industry) => (
                <SelectItem key={industry.value} value={industry.value}>
                  {industry.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={loadAnalyticsData} variant="outline">
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium">Insights</span>
            </div>
            <div className="text-2xl font-bold text-green-600">
              {insights.length}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {insights.filter(i => i.actionable).length} actionable
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium">High Impact</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {insights.filter(i => i.impact === 'high').length}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Critical insights
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium">Benchmarks</span>
            </div>
            <div className="text-2xl font-bold text-purple-600">
              {benchmarks.length}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Industry metrics
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-orange-600" />
              <span className="text-sm font-medium">Forecast</span>
            </div>
            <div className="text-2xl font-bold text-orange-600">
              {forecast.length}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Months projected
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="insights">Financial Insights</TabsTrigger>
          <TabsTrigger value="benchmarks">Industry Benchmarks</TabsTrigger>
          <TabsTrigger value="forecast">Cash Flow Forecast</TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-4">
          <div className="space-y-4">
            {insights.map((insight) => (
              <Card key={insight.id} className="border-l-4 border-l-blue-500">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {getInsightIcon(insight.type)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{insight.title}</h3>
                          <Badge className={getImpactColor(insight.impact)}>
                            {insight.impact} impact
                          </Badge>
                          <Badge variant="outline" className={getCategoryColor(insight.category)}>
                            {insight.category.replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground mb-3">{insight.description}</p>
                        {insight.actionable && (
                          <div className="flex items-center gap-2 text-sm text-green-600">
                            <Zap className="w-4 h-4" />
                            Actionable insight
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {Math.round((insight.confidence || 0) * 100)}% confidence
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {insight.createdAt ? new Date(insight.createdAt).toLocaleDateString() : 'N/A'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="benchmarks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                Industry Benchmarks - {selectedIndustry.charAt(0).toUpperCase() + selectedIndustry.slice(1)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {benchmarks.map((benchmark, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getComparisonIcon(benchmark.comparison)}
                      <div>
                        <div className="font-medium">{benchmark.metric}</div>
                        <div className="text-sm text-muted-foreground">
                          Industry benchmark: {benchmark.value}%
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{benchmark.percentile}th percentile</div>
                      <Badge 
                        variant={benchmark.comparison === 'above' ? 'default' : 
                                benchmark.comparison === 'below' ? 'destructive' : 'secondary'}
                      >
                        {benchmark.comparison}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forecast" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="w-5 h-5 text-orange-600" />
                6-Month Cash Flow Forecast
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {forecast && forecast.length > 0 ? forecast.map((month, index) => {
                  // Safety check for month object
                  if (!month) return null;
                  
                  return (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-blue-600" />
                        <div>
                          <div className="font-medium">{month.period || 'N/A'}</div>
                          <div className="text-sm text-muted-foreground">
                            Confidence: {Math.round((month.confidence || 0) * 100)}%
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <div className="text-sm text-muted-foreground">Inflow</div>
                          <div className="font-medium text-green-600">
                            ${(month.projectedInflow || 0).toFixed(2)}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-muted-foreground">Outflow</div>
                          <div className="font-medium text-red-600">
                            ${(month.projectedOutflow || 0).toFixed(2)}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-muted-foreground">Net</div>
                          <div className={`font-medium ${
                            (month.netCashFlow || 0) > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            ${(month.netCashFlow || 0).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No forecast data available
                  </div>
                )}
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium mb-2">Forecast Factors</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {forecast && forecast[0]?.factors ? forecast[0].factors.map((factor, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="w-1 h-1 bg-blue-600 rounded-full"></div>
                      {factor}
                    </li>
                  )) : (
                    <li className="text-muted-foreground">No factors available</li>
                  )}
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
