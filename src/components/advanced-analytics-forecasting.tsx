import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { Progress } from "../components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Slider } from "../components/ui/slider"
import { Label } from "../components/ui/label"
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Target,
  Calculator,
  AlertTriangle,
  CheckCircle,
  ArrowUpRight,
  DollarSign,
  Calendar,
  Building,
  Clock,
} from "lucide-react"

interface ForecastData {
  month: string
  predicted: number
  confidence: number
  scenario: {
    optimistic: number
    realistic: number
    pessimistic: number
  }
}

interface BenchmarkData {
  metric: string
  yourValue: number
  industryAverage: number
  topQuartile: number
  unit: string
  trend: "up" | "down" | "stable"
  recommendation: string
}

interface ROICalculation {
  investment: number
  expectedReturn: number
  timeframe: number
  riskLevel: "low" | "medium" | "high"
  roi: number
  paybackPeriod: number
  npv: number
}

const mockForecastData: ForecastData[] = [
  {
    month: "Jan 2024",
    predicted: 125000,
    confidence: 87,
    scenario: { optimistic: 145000, realistic: 125000, pessimistic: 105000 },
  },
  {
    month: "Feb 2024",
    predicted: 132000,
    confidence: 84,
    scenario: { optimistic: 155000, realistic: 132000, pessimistic: 110000 },
  },
  {
    month: "Mar 2024",
    predicted: 128000,
    confidence: 89,
    scenario: { optimistic: 148000, realistic: 128000, pessimistic: 108000 },
  },
  {
    month: "Apr 2024",
    predicted: 135000,
    confidence: 82,
    scenario: { optimistic: 158000, realistic: 135000, pessimistic: 112000 },
  },
  {
    month: "May 2024",
    predicted: 142000,
    confidence: 85,
    scenario: { optimistic: 165000, realistic: 142000, pessimistic: 119000 },
  },
  {
    month: "Jun 2024",
    predicted: 138000,
    confidence: 88,
    scenario: { optimistic: 160000, realistic: 138000, pessimistic: 116000 },
  },
]

const mockBenchmarkData: BenchmarkData[] = [
  {
    metric: "Gross Profit Margin",
    yourValue: 68,
    industryAverage: 62,
    topQuartile: 75,
    unit: "%",
    trend: "up",
    recommendation: "Above average - consider premium pricing strategy",
  },
  {
    metric: "Days Sales Outstanding",
    yourValue: 32,
    industryAverage: 45,
    topQuartile: 28,
    unit: "days",
    trend: "down",
    recommendation: "Good performance - optimize further to reach top quartile",
  },
  {
    metric: "Current Ratio",
    yourValue: 2.1,
    industryAverage: 1.8,
    topQuartile: 2.5,
    unit: "x",
    trend: "stable",
    recommendation: "Healthy liquidity - maintain current levels",
  },
  {
    metric: "Revenue per Employee",
    yourValue: 185000,
    industryAverage: 165000,
    topQuartile: 220000,
    unit: "$",
    trend: "up",
    recommendation: "Strong productivity - invest in scaling operations",
  },
]

export function AdvancedAnalyticsForecasting() {
  const [selectedTimeframe, setSelectedTimeframe] = useState("12months")
  const [selectedScenario, setSelectedScenario] = useState("realistic")
  const [roiInputs, setRoiInputs] = useState({
    investment: 50000,
    expectedReturn: 15,
    timeframe: 24,
    riskLevel: "medium" as const,
  })

  const calculateROI = (): ROICalculation => {
    const monthlyReturn = roiInputs.expectedReturn / 100 / 12
    const totalReturn = roiInputs.investment * (1 + monthlyReturn) ** roiInputs.timeframe
    const roi = ((totalReturn - roiInputs.investment) / roiInputs.investment) * 100
    const paybackPeriod = Math.log(2) / Math.log(1 + monthlyReturn)
    const npv = totalReturn - roiInputs.investment

    return {
      ...roiInputs,
      roi: Math.round(roi * 100) / 100,
      paybackPeriod: Math.round(paybackPeriod * 100) / 100,
      npv: Math.round(npv),
    }
  }

  const roiCalculation = calculateROI()

  const getBenchmarkStatus = (yourValue: number, industryAverage: number, topQuartile: number) => {
    if (yourValue >= topQuartile) return { status: "excellent", color: "text-green-600 bg-green-50" }
    if (yourValue >= industryAverage) return { status: "good", color: "text-blue-600 bg-blue-50" }
    return { status: "needs improvement", color: "text-red-600 bg-red-50" }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <Target className="h-4 w-4 text-gray-500" />
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low":
        return "text-green-600 bg-green-50"
      case "medium":
        return "text-yellow-600 bg-yellow-50"
      case "high":
        return "text-red-600 bg-red-50"
      default:
        return "text-gray-600 bg-gray-50"
    }
  }

  return (
    <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-emerald-600" />
            <CardTitle className="text-emerald-900">Advanced Analytics & Forecasting</CardTitle>
            <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
              AI-Powered
            </Badge>
          </div>
          <div className="flex gap-2">
            <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6months">6 Months</SelectItem>
                <SelectItem value="12months">12 Months</SelectItem>
                <SelectItem value="24months">24 Months</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" variant="outline" className="border-emerald-300 text-emerald-700 bg-transparent">
              Export Report
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="forecasting" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="forecasting">Cash Flow Forecast</TabsTrigger>
            <TabsTrigger value="benchmarking">Industry Benchmarks</TabsTrigger>
            <TabsTrigger value="roi">ROI Calculator</TabsTrigger>
            <TabsTrigger value="scenarios">Scenario Planning</TabsTrigger>
          </TabsList>

          <TabsContent value="forecasting" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">12-Month Cash Flow Prediction</CardTitle>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant={selectedScenario === "optimistic" ? "default" : "outline"}
                          onClick={() => setSelectedScenario("optimistic")}
                          className="text-xs"
                        >
                          Optimistic
                        </Button>
                        <Button
                          size="sm"
                          variant={selectedScenario === "realistic" ? "default" : "outline"}
                          onClick={() => setSelectedScenario("realistic")}
                          className="text-xs"
                        >
                          Realistic
                        </Button>
                        <Button
                          size="sm"
                          variant={selectedScenario === "pessimistic" ? "default" : "outline"}
                          onClick={() => setSelectedScenario("pessimistic")}
                          className="text-xs"
                        >
                          Pessimistic
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-lg flex items-center justify-center">
                      <div className="text-center text-gray-600">
                        <BarChart3 className="h-12 w-12 mx-auto mb-4 text-emerald-600" />
                        <div className="text-lg font-medium">Interactive Forecast Chart</div>
                        <div className="text-sm">
                          {selectedScenario.charAt(0).toUpperCase() + selectedScenario.slice(1)} scenario visualization
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-emerald-600" />
                      <span className="text-sm font-medium text-gray-900">Avg. Monthly Growth</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">+8.2%</div>
                    <div className="text-xs text-gray-600">Based on historical trends</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-gray-900">Confidence Level</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">86%</div>
                    <Progress value={86} className="mt-2" />
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm font-medium text-gray-900">Risk Factors</span>
                    </div>
                    <div className="space-y-2">
                      <div className="text-xs text-gray-600">• Seasonal variations</div>
                      <div className="text-xs text-gray-600">• Market volatility</div>
                      <div className="text-xs text-gray-600">• Customer concentration</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              {mockForecastData.map((data, index) => (
                <Card key={index}>
                  <CardContent className="p-3">
                    <div className="text-xs text-gray-600 mb-1">{data.month}</div>
                    <div className="text-lg font-bold text-gray-900">
                      ${(data.scenario[selectedScenario as keyof typeof data.scenario] / 1000).toFixed(0)}K
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <div className="text-xs text-gray-600">{data.confidence}%</div>
                      <Progress value={data.confidence} className="h-1 flex-1" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="benchmarking" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockBenchmarkData.map((benchmark, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-emerald-600" />
                        <h4 className="font-medium text-gray-900">{benchmark.metric}</h4>
                      </div>
                      {getTrendIcon(benchmark.trend)}
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Your Performance</span>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">
                            {benchmark.unit === "$"
                              ? `$${benchmark.yourValue.toLocaleString()}`
                              : `${benchmark.yourValue}${benchmark.unit}`}
                          </span>
                          <Badge
                            variant="outline"
                            className={
                              getBenchmarkStatus(benchmark.yourValue, benchmark.industryAverage, benchmark.topQuartile)
                                .color
                            }
                          >
                            {
                              getBenchmarkStatus(benchmark.yourValue, benchmark.industryAverage, benchmark.topQuartile)
                                .status
                            }
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">Industry Avg</span>
                          <span className="text-gray-900">
                            {benchmark.unit === "$"
                              ? `$${benchmark.industryAverage.toLocaleString()}`
                              : `${benchmark.industryAverage}${benchmark.unit}`}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">Top Quartile</span>
                          <span className="text-gray-900">
                            {benchmark.unit === "$"
                              ? `$${benchmark.topQuartile.toLocaleString()}`
                              : `${benchmark.topQuartile}${benchmark.unit}`}
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-gray-100">
                        <p className="text-xs text-gray-600">{benchmark.recommendation}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="roi" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-emerald-600" />
                    ROI Calculator
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="investment">Initial Investment</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      <Slider
                        value={[roiInputs.investment]}
                        onValueChange={(value) => setRoiInputs({ ...roiInputs, investment: value[0] })}
                        max={500000}
                        min={1000}
                        step={1000}
                        className="flex-1"
                      />
                      <span className="text-sm font-medium w-20 text-right">
                        ${roiInputs.investment.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="return">Expected Annual Return (%)</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Target className="h-4 w-4 text-gray-500" />
                      <Slider
                        value={[roiInputs.expectedReturn]}
                        onValueChange={(value) => setRoiInputs({ ...roiInputs, expectedReturn: value[0] })}
                        max={50}
                        min={1}
                        step={0.5}
                        className="flex-1"
                      />
                      <span className="text-sm font-medium w-12 text-right">{roiInputs.expectedReturn}%</span>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="timeframe">Investment Timeframe (months)</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <Slider
                        value={[roiInputs.timeframe]}
                        onValueChange={(value) => setRoiInputs({ ...roiInputs, timeframe: value[0] })}
                        max={60}
                        min={6}
                        step={6}
                        className="flex-1"
                      />
                      <span className="text-sm font-medium w-16 text-right">{roiInputs.timeframe} months</span>
                    </div>
                  </div>

                  <div>
                    <Label>Risk Level</Label>
                    <div className="flex gap-2 mt-1">
                      {["low", "medium", "high"].map((risk) => (
                        <Button
                          key={risk}
                          size="sm"
                          variant={roiInputs.riskLevel === risk ? "default" : "outline"}
                          onClick={() => setRoiInputs({ ...roiInputs, riskLevel: risk as any })}
                          className="flex-1"
                        >
                          {risk.charAt(0).toUpperCase() + risk.slice(1)}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Investment Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-emerald-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <ArrowUpRight className="h-4 w-4 text-emerald-600" />
                        <span className="text-sm font-medium text-gray-900">Total ROI</span>
                      </div>
                      <div className="text-2xl font-bold text-emerald-600">{roiCalculation.roi}%</div>
                    </div>

                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-gray-900">Payback Period</span>
                      </div>
                      <div className="text-2xl font-bold text-blue-600">{roiCalculation.paybackPeriod}m</div>
                    </div>

                    <div className="p-3 bg-purple-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <DollarSign className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-medium text-gray-900">Net Present Value</span>
                      </div>
                      <div className="text-2xl font-bold text-purple-600">${roiCalculation.npv.toLocaleString()}</div>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className="h-4 w-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-900">Risk Level</span>
                      </div>
                      <Badge variant="outline" className={getRiskColor(roiCalculation.riskLevel)}>
                        {roiCalculation.riskLevel.toUpperCase()}
                      </Badge>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <h4 className="font-medium text-gray-900 mb-2">Investment Recommendation</h4>
                    <div className="space-y-2">
                      {roiCalculation.roi > 20 && (
                        <div className="flex items-center gap-2 text-sm text-green-700">
                          <CheckCircle className="h-4 w-4" />
                          Excellent ROI potential - Highly recommended
                        </div>
                      )}
                      {roiCalculation.roi >= 10 && roiCalculation.roi <= 20 && (
                        <div className="flex items-center gap-2 text-sm text-blue-700">
                          <Target className="h-4 w-4" />
                          Good ROI potential - Consider investment
                        </div>
                      )}
                      {roiCalculation.roi < 10 && (
                        <div className="flex items-center gap-2 text-sm text-yellow-700">
                          <AlertTriangle className="h-4 w-4" />
                          Moderate ROI - Evaluate alternatives
                        </div>
                      )}
                      <div className="text-xs text-gray-600">
                        Based on {roiCalculation.timeframe} month timeframe with {roiCalculation.riskLevel} risk profile
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="scenarios" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-green-700">Optimistic Scenario</CardTitle>
                  <p className="text-sm text-gray-600">Best case projections</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Revenue Growth</span>
                      <span className="font-medium text-green-600">+25%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Cost Reduction</span>
                      <span className="font-medium text-green-600">-15%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Market Expansion</span>
                      <span className="font-medium text-green-600">+40%</span>
                    </div>
                    <div className="pt-2 border-t border-gray-100">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-900">Net Impact</span>
                        <span className="font-bold text-green-600">+$180K</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-blue-700">Realistic Scenario</CardTitle>
                  <p className="text-sm text-gray-600">Most likely projections</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Revenue Growth</span>
                      <span className="font-medium text-blue-600">+12%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Cost Reduction</span>
                      <span className="font-medium text-blue-600">-8%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Market Expansion</span>
                      <span className="font-medium text-blue-600">+15%</span>
                    </div>
                    <div className="pt-2 border-t border-gray-100">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-900">Net Impact</span>
                        <span className="font-bold text-blue-600">+$95K</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-red-700">Pessimistic Scenario</CardTitle>
                  <p className="text-sm text-gray-600">Conservative projections</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Revenue Growth</span>
                      <span className="font-medium text-red-600">+3%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Cost Reduction</span>
                      <span className="font-medium text-red-600">-2%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Market Expansion</span>
                      <span className="font-medium text-red-600">+5%</span>
                    </div>
                    <div className="pt-2 border-t border-gray-100">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-900">Net Impact</span>
                        <span className="font-bold text-red-600">+$25K</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Scenario Impact Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-600">
                    <PieChart className="h-12 w-12 mx-auto mb-4 text-emerald-600" />
                    <div className="text-lg font-medium">Interactive Scenario Comparison</div>
                    <div className="text-sm">Visual comparison of all three scenarios</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
