import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Badge } from "../components/ui/badge"
import { Progress } from "../components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import {
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  DollarSign,
  Calendar,
  Sparkles,
  Loader2,
  RefreshCw,
  Target,
  Lightbulb,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3,
  LineChart,
} from "lucide-react"
import { useToast } from "../hooks/use-toast"

interface CashFlowData {
  date: string
  cashFlow: number
}

interface CashFlowPrediction {
  period: string
  predictedAmount: number
  confidence: number
  factors: string[]
  riskLevel: 'low' | 'medium' | 'high'
}

interface AIInsight {
  type: 'cash_flow' | 'revenue' | 'expense' | 'compliance' | 'opportunity'
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  confidence: number
  actionable: boolean
  suggestedActions: string[]
  impact: string
}

interface ForecastResult {
  historicalData: CashFlowData[]
  predictions: CashFlowPrediction[]
  insights: AIInsight[]
  periods: number
  generatedAt: string
}

export function AICashFlowForecasting() {
  const [selectedCompany, setSelectedCompany] = useState("")
  const [forecastPeriods, setForecastPeriods] = useState(3)
  const [isGenerating, setIsGenerating] = useState(false)
  const [forecastResult, setForecastResult] = useState<ForecastResult | null>(null)
  const [historicalData, setHistoricalData] = useState<CashFlowData[]>([])
  const { toast } = useToast()

  // Sample historical cash flow data
  const sampleHistoricalData: CashFlowData[] = [
    { date: '2024-01', cashFlow: 150000 },
    { date: '2024-02', cashFlow: 180000 },
    { date: '2024-03', cashFlow: 120000 },
    { date: '2024-04', cashFlow: 200000 },
    { date: '2024-05', cashFlow: 160000 },
    { date: '2024-06', cashFlow: 140000 },
    { date: '2024-07', cashFlow: 190000 },
    { date: '2024-08', cashFlow: 170000 },
    { date: '2024-09', cashFlow: 130000 },
    { date: '2024-10', cashFlow: 210000 },
    { date: '2024-11', cashFlow: 180000 },
    { date: '2024-12', cashFlow: 250000 },
  ]

  useEffect(() => {
    setHistoricalData(sampleHistoricalData)
  }, [])

  const generateForecast = async () => {
    if (!selectedCompany) {
      toast({
        title: "Company Required",
        description: "Please select a company first",
        variant: "destructive"
      })
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch('/api/ai/forecast/cash-flow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': 'tenant_demo',
          'x-company-id': selectedCompany
        },
        body: JSON.stringify({
          companyId: selectedCompany,
          historicalData: historicalData,
          periods: forecastPeriods
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate forecast')
      }

      const result = await response.json()
      setForecastResult(result.forecast)
      
      toast({
        title: "Forecast Generated",
        description: `Cash flow forecast generated for ${forecastPeriods} periods`,
      })
    } catch (error) {
      console.error('Forecast generation error:', error)
      toast({
        title: "Forecast Generation Failed",
        description: "Failed to generate forecast. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'text-green-600'
      case 'medium': return 'text-yellow-600'
      case 'high': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getRiskBadge = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return <Badge className="bg-green-100 text-green-700">Low Risk</Badge>
      case 'medium': return <Badge className="bg-yellow-100 text-yellow-700">Medium Risk</Badge>
      case 'high': return <Badge className="bg-red-100 text-red-700">High Risk</Badge>
      default: return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600'
      case 'high': return 'text-orange-600'
      case 'medium': return 'text-yellow-600'
      case 'low': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical': return <Badge className="bg-red-100 text-red-700">Critical</Badge>
      case 'high': return <Badge className="bg-orange-100 text-orange-700">High</Badge>
      case 'medium': return <Badge className="bg-yellow-100 text-yellow-700">Medium</Badge>
      case 'low': return <Badge className="bg-green-100 text-green-700">Low</Badge>
      default: return <Badge variant="outline">Unknown</Badge>
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getCashFlowIcon = (amount: number) => {
    return amount >= 0 ? <TrendingUp className="w-4 h-4 text-green-600" /> : <TrendingDown className="w-4 h-4 text-red-600" />
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-foreground">
          <div className="flex items-center gap-2">
            <LineChart className="w-5 h-5 text-cyan-600" />
            AI Cash Flow Forecasting
            <Badge variant="secondary" className="bg-cyan-100 text-cyan-700">
              <Sparkles className="w-3 h-3 mr-1" />
              Predictive
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setHistoricalData(sampleHistoricalData)}
              className="text-xs"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Reset Data
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Company</label>
            <Select value={selectedCompany} onValueChange={setSelectedCompany}>
              <SelectTrigger>
                <SelectValue placeholder="Select company" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="company_1">Demo Company 1</SelectItem>
                <SelectItem value="company_2">Demo Company 2</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium text-muted-foreground">Forecast Periods</label>
            <Select value={forecastPeriods.toString()} onValueChange={(value) => setForecastPeriods(parseInt(value))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 Month</SelectItem>
                <SelectItem value="3">3 Months</SelectItem>
                <SelectItem value="6">6 Months</SelectItem>
                <SelectItem value="12">12 Months</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-end">
            <Button
              onClick={generateForecast}
              disabled={isGenerating || !selectedCompany}
              className="w-full"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Brain className="w-4 h-4 mr-2" />
              )}
              Generate Forecast
            </Button>
          </div>
        </div>

        {/* Historical Data Summary */}
        <div className="p-4 bg-muted/30 rounded-lg border border-border">
          <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Historical Cash Flow Data
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Total Periods</div>
              <div className="font-medium">{historicalData.length}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Average Cash Flow</div>
              <div className="font-medium">
                {formatCurrency(historicalData.reduce((sum, d) => sum + d.cashFlow, 0) / historicalData.length)}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Positive Months</div>
              <div className="font-medium text-green-600">
                {historicalData.filter(d => d.cashFlow >= 0).length}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Negative Months</div>
              <div className="font-medium text-red-600">
                {historicalData.filter(d => d.cashFlow < 0).length}
              </div>
            </div>
          </div>
        </div>

        {/* Forecast Results */}
        {forecastResult && (
          <div className="space-y-6">
            {/* Predictions */}
            <div className="p-4 bg-muted/30 rounded-lg border border-border">
              <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Cash Flow Predictions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {forecastResult.predictions.map((prediction, index) => (
                  <div key={index} className="p-3 bg-background/50 rounded-lg border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{prediction.period}</span>
                      {getRiskBadge(prediction.riskLevel)}
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      {getCashFlowIcon(prediction.predictedAmount)}
                      <span className={`text-lg font-bold ${prediction.predictedAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(prediction.predictedAmount)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-muted-foreground">Confidence:</span>
                      <Progress value={prediction.confidence} className="w-16 h-1" />
                      <span className="text-xs font-medium">{prediction.confidence}%</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <strong>Key Factors:</strong>
                      <ul className="mt-1 space-y-1">
                        {prediction.factors.slice(0, 2).map((factor, factorIndex) => (
                          <li key={factorIndex}>• {factor}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Insights */}
            {forecastResult.insights.length > 0 && (
              <div className="p-4 bg-muted/30 rounded-lg border border-border">
                <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" />
                  AI Insights & Recommendations
                </h3>
                <div className="space-y-3">
                  {forecastResult.insights.map((insight, index) => (
                    <div key={index} className="p-3 bg-background/50 rounded-lg border border-border">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-medium">{insight.title}</h4>
                          {getPriorityBadge(insight.priority)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Progress value={insight.confidence} className="w-12 h-1" />
                          <span className="text-xs text-muted-foreground">{insight.confidence}%</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{insight.description}</p>
                      
                      {insight.impact && (
                        <div className="mb-2">
                          <span className="text-xs font-medium text-muted-foreground">Impact: </span>
                          <span className="text-xs">{insight.impact}</span>
                        </div>
                      )}
                      
                      {insight.actionable && insight.suggestedActions.length > 0 && (
                        <div>
                          <span className="text-xs font-medium text-muted-foreground">Suggested Actions:</span>
                          <ul className="mt-1 space-y-1">
                            {insight.suggestedActions.slice(0, 3).map((action, actionIndex) => (
                              <li key={actionIndex} className="text-xs flex items-center gap-1">
                                <CheckCircle className="w-3 h-3 text-green-600" />
                                {action}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cash Shortage Alerts */}
            {forecastResult.predictions.some(p => p.predictedAmount < 0 && p.confidence > 70) && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <h3 className="text-sm font-medium text-red-800">Cash Shortage Alerts</h3>
                </div>
                <p className="text-sm text-red-700 mb-3">
                  AI has detected potential cash shortages in the forecast period. Immediate action may be required.
                </p>
                <div className="space-y-2">
                  {forecastResult.predictions
                    .filter(p => p.predictedAmount < 0 && p.confidence > 70)
                    .map((prediction, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="text-red-700">{prediction.period}</span>
                        <span className="font-medium text-red-800">
                          {formatCurrency(Math.abs(prediction.predictedAmount))} shortage
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Forecast Summary */}
            <div className="p-4 bg-muted/30 rounded-lg border border-border">
              <h3 className="text-sm font-medium mb-3">Forecast Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Total Predicted</div>
                  <div className="font-medium">
                    {formatCurrency(forecastResult.predictions.reduce((sum, p) => sum + p.predictedAmount, 0))}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Average Confidence</div>
                  <div className="font-medium">
                    {Math.round(forecastResult.predictions.reduce((sum, p) => sum + p.confidence, 0) / forecastResult.predictions.length)}%
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">High Risk Periods</div>
                  <div className="font-medium text-red-600">
                    {forecastResult.predictions.filter(p => p.riskLevel === 'high').length}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Generated</div>
                  <div className="font-medium text-xs">
                    {new Date(forecastResult.generatedAt).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!forecastResult && (
          <div className="text-center py-8 text-muted-foreground">
            <LineChart className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No forecast generated yet</p>
            <p className="text-xs mt-1">Generate a cash flow forecast to see AI predictions and insights</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
