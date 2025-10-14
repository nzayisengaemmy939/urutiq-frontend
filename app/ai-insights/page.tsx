"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SegmentedTabs } from "@/components/ui/segmented-tabs"
import { Progress } from "@/components/ui/progress"
import { PageLayout } from "@/components/page-layout"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Brain, TrendingUp, AlertTriangle, Lightbulb, Target, Zap, Eye, Settings, Calculator } from "lucide-react"

export default function AIInsightsPage() {
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
          <Button>
            <Brain className="w-4 h-4 mr-2" />
            Generate Insights
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
              <div className="text-4xl font-bold text-cyan-600">87</div>
              <div className="text-sm text-muted-foreground">Excellent</div>
              <Badge variant="default" className="mt-1">
                +5 this month
              </Badge>
            </div>
          </div>
          <div className="mt-4">
            <Progress value={87} className="h-3" />
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
                <p className="text-xl font-bold">94.2%</p>
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
                <p className="text-xl font-bold">3</p>
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
                <p className="text-xl font-bold">12</p>
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
                <p className="text-xl font-bold">8/10</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <SegmentedTabs
        tabs={[
          { id: 'predictions', label: 'Predictions' },
          { id: 'anomalies', label: 'Anomaly Detection' },
          { id: 'recommendations', label: 'Recommendations' },
          { id: 'tax-optimization', label: 'Tax Optimization' },
          { id: 'insights', label: 'Smart Insights' },
        ]}
        value={'predictions'}
        onChange={() => {}}
        className="mb-4"
      />
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
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h3 className="font-medium text-green-800">Next Month Prediction</h3>
                    <p className="text-2xl font-bold text-green-900">$267,890</p>
                    <p className="text-sm text-green-700">+14.2% increase expected</p>
                  </div>
                  <div className="space-y-3">
                    {[
                      { period: "Next Quarter", amount: "$789,450", confidence: 92 },
                      { period: "Next 6 Months", amount: "$1,567,890", confidence: 87 },
                      { period: "Next Year", amount: "$3,234,567", confidence: 78 },
                    ].map((prediction, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{prediction.period}</p>
                          <p className="text-sm text-muted-foreground">Confidence: {prediction.confidence}%</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{prediction.amount}</p>
                        </div>
                      </div>
                    ))}
                  </div>
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
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="font-medium text-blue-800">Cash Position in 30 Days</h3>
                    <p className="text-2xl font-bold text-blue-900">$156,780</p>
                    <p className="text-sm text-blue-700">Healthy cash flow expected</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Expected Inflows</span>
                      <span className="font-medium text-green-600">+$234,560</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Expected Outflows</span>
                      <span className="font-medium text-red-600">-$189,340</span>
                    </div>
                    <div className="flex justify-between text-sm font-medium pt-2 border-t">
                      <span>Net Cash Flow</span>
                      <span className="text-green-600">+$45,220</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Seasonal Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Seasonal Trends & Patterns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Peak Season</h3>
                  <p className="text-lg font-bold">Q4 (Oct-Dec)</p>
                  <p className="text-sm text-muted-foreground">+35% revenue increase expected</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Low Season</h3>
                  <p className="text-lg font-bold">Q1 (Jan-Mar)</p>
                  <p className="text-sm text-muted-foreground">-18% revenue decrease typical</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Growth Opportunity</h3>
                  <p className="text-lg font-bold">Summer Months</p>
                  <p className="text-sm text-muted-foreground">Untapped potential identified</p>
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
                  Detected Anomalies
                </CardTitle>
                <Badge variant="secondary">3 Active</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    type: "Expense Spike",
                    description: "Office supplies expense 340% higher than usual",
                    severity: "high",
                    date: "2024-01-15",
                    amount: "$3,450",
                    suggestion: "Review recent purchases and vendor contracts",
                  },
                  {
                    type: "Revenue Drop",
                    description: "Customer payments 25% below expected",
                    severity: "medium",
                    date: "2024-01-14",
                    amount: "-$12,340",
                    suggestion: "Follow up on outstanding invoices",
                  },
                  {
                    type: "Duplicate Transaction",
                    description: "Potential duplicate payment detected",
                    severity: "low",
                    date: "2024-01-13",
                    amount: "$890",
                    suggestion: "Verify transaction with vendor",
                  },
                ].map((anomaly, index) => (
                  <div
                    key={index}
                    className={`p-4 border rounded-lg ${
                      anomaly.severity === "high"
                        ? "border-red-200 bg-red-50"
                        : anomaly.severity === "medium"
                          ? "border-amber-200 bg-amber-50"
                          : "border-blue-200 bg-blue-50"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium">{anomaly.type}</h3>
                          <Badge
                            variant={
                              anomaly.severity === "high"
                                ? "destructive"
                                : anomaly.severity === "medium"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {anomaly.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{anomaly.description}</p>
                        <p className="text-sm font-medium mb-2">Amount: {anomaly.amount}</p>
                        <p className="text-sm text-cyan-600">{anomaly.suggestion}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{anomaly.date}</span>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
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
                <Badge variant="secondary">12 Active</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    category: "Cost Optimization",
                    title: "Negotiate Better Vendor Terms",
                    description: "You could save $2,340/month by renegotiating with your top 3 vendors",
                    impact: "High",
                    effort: "Medium",
                    savings: "$28,080/year",
                  },
                  {
                    category: "Cash Flow",
                    title: "Adjust Payment Terms",
                    description: "Offering 2/10 net 30 terms could improve cash flow by 15%",
                    impact: "Medium",
                    effort: "Low",
                    savings: "$15,600/year",
                  },
                  {
                    category: "Revenue Growth",
                    title: "Target High-Value Customers",
                    description: "Focus on customers with 80%+ payment reliability and $5K+ orders",
                    impact: "High",
                    effort: "High",
                    savings: "$45,000/year",
                  },
                  {
                    category: "Tax Optimization",
                    title: "Accelerate Equipment Purchases",
                    description: "Purchase planned equipment before year-end for tax benefits",
                    impact: "Medium",
                    effort: "Low",
                    savings: "$8,900/year",
                  },
                ].map((recommendation, index) => (
                  <div key={index} className="p-4 border rounded-lg hover:bg-muted/50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">{recommendation.category}</Badge>
                          <Badge
                            variant={
                              recommendation.impact === "High"
                                ? "default"
                                : recommendation.impact === "Medium"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {recommendation.impact} Impact
                          </Badge>
                        </div>
                        <h3 className="font-medium mb-1">{recommendation.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{recommendation.description}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <span>Effort: {recommendation.effort}</span>
                          <span className="font-medium text-green-600">
                            Potential Savings: {recommendation.savings}
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
                ))}
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
                  Tax Optimization Overview
                </CardTitle>
                <CardDescription>AI-powered tax optimization recommendations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                    <div>
                      <p className="font-medium text-green-800">Current Tax Rate</p>
                      <p className="text-2xl font-bold text-green-600">22.5%</p>
                    </div>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      Optimized
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div>
                      <p className="font-medium text-blue-800">Potential Savings</p>
                      <p className="text-2xl font-bold text-blue-600">$12,450</p>
                    </div>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      Available
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tax Optimization Strategies */}
            <Card>
              <CardHeader>
                <CardTitle>Optimization Strategies</CardTitle>
                <CardDescription>Recommended tax optimization approaches</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {[
                    {
                      strategy: "Accelerate Depreciation",
                      description: "Take advantage of bonus depreciation for equipment purchases",
                      impact: "High",
                      savings: "$8,900",
                      deadline: "Dec 31, 2024"
                    },
                    {
                      strategy: "Defer Income",
                      description: "Delay invoicing until next tax year to reduce current liability",
                      impact: "Medium",
                      savings: "$3,200",
                      deadline: "Dec 15, 2024"
                    },
                    {
                      strategy: "Maximize Deductions",
                      description: "Ensure all eligible business expenses are properly categorized",
                      impact: "Medium",
                      savings: "$2,100",
                      deadline: "Ongoing"
                    },
                    {
                      strategy: "Retirement Contributions",
                      description: "Maximize SEP-IRA contributions for additional deductions",
                      impact: "High",
                      savings: "$5,200",
                      deadline: "Dec 31, 2024"
                    }
                  ].map((strategy, index) => (
                    <div key={index} className="p-4 border rounded-lg hover:bg-muted/50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">{strategy.strategy}</Badge>
                            <Badge
                              variant={
                                strategy.impact === "High"
                                  ? "default"
                                  : strategy.impact === "Medium"
                                    ? "secondary"
                                    : "outline"
                              }
                            >
                              {strategy.impact} Impact
                            </Badge>
                          </div>
                          <h3 className="font-medium mb-1">{strategy.strategy}</h3>
                          <p className="text-sm text-muted-foreground mb-2">{strategy.description}</p>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="font-medium text-green-600">
                              Savings: {strategy.savings}
                            </span>
                            <span className="text-muted-foreground">
                              Deadline: {strategy.deadline}
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
                <CardTitle>Performance Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-cyan-50 border border-cyan-200 rounded-lg">
                    <h3 className="font-medium text-cyan-800 mb-2">Key Finding</h3>
                    <p className="text-sm text-cyan-700">
                      Your profit margins are 23% higher than industry average, indicating strong pricing strategy.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="text-sm">Customer Acquisition Cost</span>
                      <span className="font-medium text-green-600">15% below target</span>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="text-sm">Average Collection Period</span>
                      <span className="font-medium text-amber-600">3 days longer than optimal</span>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="text-sm">Inventory Turnover</span>
                      <span className="font-medium text-green-600">Above industry benchmark</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Market Intelligence */}
            <Card>
              <CardHeader>
                <CardTitle>Market Intelligence</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="font-medium text-blue-800 mb-2">Market Opportunity</h3>
                    <p className="text-sm text-blue-700">
                      Similar businesses in your sector are growing 18% faster in Q4. Consider seasonal promotions.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <div className="p-3 border rounded-lg">
                      <p className="font-medium text-sm">Industry Growth Rate</p>
                      <p className="text-lg font-bold">12.5%</p>
                      <p className="text-xs text-muted-foreground">Your growth: 14.2%</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <p className="font-medium text-sm">Competitive Position</p>
                      <p className="text-lg font-bold">Top 25%</p>
                      <p className="text-xs text-muted-foreground">Based on financial metrics</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Learning Progress */}
          <Card>
            <CardHeader>
              <CardTitle>AI Learning Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-2xl font-bold">2,847</p>
                    <p className="text-sm text-muted-foreground">Transactions Analyzed</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-2xl font-bold">156</p>
                    <p className="text-sm text-muted-foreground">Patterns Identified</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-2xl font-bold">94.2%</p>
                    <p className="text-sm text-muted-foreground">Accuracy Rate</p>
                  </div>
                </div>
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 font-medium">AI Model Status: Fully Trained</p>
                  <p className="text-sm text-green-700">
                    Your AI model has processed enough data to provide highly accurate insights and predictions.
                  </p>
                </div>
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
