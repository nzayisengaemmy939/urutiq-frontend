"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, LineChart, PieChart, TrendingUp, Download, Maximize2 } from "lucide-react"

const chartData = {
  revenue: [
    { month: "Jan", value: 45000, target: 40000 },
    { month: "Feb", value: 52000, target: 45000 },
    { month: "Mar", value: 48000, target: 50000 },
    { month: "Apr", value: 61000, target: 55000 },
    { month: "May", value: 58000, target: 60000 },
    { month: "Jun", value: 67000, target: 65000 },
  ],
  expenses: [
    { category: "Office Supplies", value: 12000, percentage: 15 },
    { category: "Software", value: 18000, percentage: 22 },
    { category: "Marketing", value: 25000, percentage: 31 },
    { category: "Utilities", value: 8000, percentage: 10 },
    { category: "Other", value: 18000, percentage: 22 },
  ],
  cashflow: [
    { week: "W1", inflow: 15000, outflow: 12000, net: 3000 },
    { week: "W2", inflow: 18000, outflow: 14000, net: 4000 },
    { week: "W3", inflow: 22000, outflow: 16000, net: 6000 },
    { week: "W4", inflow: 19000, outflow: 15000, net: 4000 },
  ],
}

export function InteractiveCharts() {
  const [activeChart, setActiveChart] = useState("revenue")
  type RevenuePoint = { month: string; value: number; target: number }
  const [selectedDataPoint, setSelectedDataPoint] = useState<RevenuePoint | null>(null)

  const handleDataPointClick = (dataPoint: RevenuePoint) => {
    setSelectedDataPoint(dataPoint)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-cyan-600" />
            <CardTitle>Interactive Analytics</CardTitle>
            <Badge variant="secondary" className="bg-cyan-100 text-cyan-700">
              Live Data
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button size="sm" variant="outline">
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeChart} onValueChange={setActiveChart}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="revenue" className="flex items-center gap-2">
              <LineChart className="h-4 w-4" />
              Revenue
            </TabsTrigger>
            <TabsTrigger value="expenses" className="flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              Expenses
            </TabsTrigger>
            <TabsTrigger value="cashflow" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Cash Flow
            </TabsTrigger>
          </TabsList>

          <TabsContent value="revenue" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <div className="h-64 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg border border-cyan-200 p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-gray-900">Revenue vs Target</h3>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-cyan-500 rounded"></div>
                      <span className="text-sm text-gray-600">Actual</span>
                      <div className="w-3 h-3 bg-gray-300 rounded"></div>
                      <span className="text-sm text-gray-600">Target</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {chartData.revenue.map((item, index) => (
                      <div
                        key={item.month}
                        className="flex items-center gap-3 cursor-pointer hover:bg-white hover:bg-opacity-50 p-2 rounded"
                        onClick={() => handleDataPointClick(item)}
                      >
                        <div className="w-8 text-sm text-gray-600">{item.month}</div>
                        <div className="flex-1 flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-cyan-500 h-2 rounded-full transition-all"
                              style={{ width: `${(item.value / 70000) * 100}%` }}
                            ></div>
                          </div>
                          <div className="text-sm font-medium text-gray-900">${item.value.toLocaleString()}</div>
                        </div>
                        {item.value > item.target && <TrendingUp className="h-4 w-4 text-green-500" />}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-white border border-cyan-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Key Metrics</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Revenue</span>
                      <span className="text-sm font-medium">$351,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Growth Rate</span>
                      <span className="text-sm font-medium text-green-600">+12.5%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Target Achievement</span>
                      <span className="text-sm font-medium text-cyan-600">108%</span>
                    </div>
                  </div>
                </div>
                {selectedDataPoint && (
                  <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
                    <h4 className="font-medium text-cyan-900 mb-2">{selectedDataPoint.month} Details</h4>
                    <div className="space-y-1">
                      <div className="text-sm">
                        <span className="text-gray-600">Revenue: </span>
                        <span className="font-medium">${selectedDataPoint.value.toLocaleString()}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-600">Target: </span>
                        <span className="font-medium">${selectedDataPoint.target.toLocaleString()}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-600">Variance: </span>
                        <span
                          className={`font-medium ${
                            selectedDataPoint.value > selectedDataPoint.target ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {selectedDataPoint.value > selectedDataPoint.target ? "+" : ""}$
                          {(selectedDataPoint.value - selectedDataPoint.target).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="expenses" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="h-64 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg border border-cyan-200 p-4">
                <h3 className="font-medium text-gray-900 mb-4">Expense Breakdown</h3>
                <div className="space-y-3">
                  {chartData.expenses.map((item, index) => (
                    <div key={item.category} className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: `hsl(${index * 60 + 180}, 60%, 50%)` }}
                      ></div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-900">{item.category}</span>
                          <span className="text-sm font-medium">{item.percentage}%</span>
                        </div>
                        <div className="text-xs text-gray-600">${item.value.toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-white border border-cyan-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Expense Insights</h4>
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="text-gray-600">Largest Category: </span>
                      <span className="font-medium">Marketing (31%)</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-600">Total Expenses: </span>
                      <span className="font-medium">$81,000</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-600">vs Last Month: </span>
                      <span className="font-medium text-red-600">+8.2%</span>
                    </div>
                  </div>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-900 mb-2">Optimization Tip</h4>
                  <p className="text-sm text-yellow-800">
                    Software expenses can be reduced by 15% by consolidating unused licenses.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="cashflow" className="space-y-4">
            <div className="h-64 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg border border-cyan-200 p-4">
              <h3 className="font-medium text-gray-900 mb-4">Weekly Cash Flow</h3>
              <div className="space-y-3">
                {chartData.cashflow.map((item, index) => (
                  <div key={item.week} className="flex items-center gap-4">
                    <div className="w-8 text-sm text-gray-600">{item.week}</div>
                    <div className="flex-1 grid grid-cols-3 gap-2">
                      <div className="text-center">
                        <div className="text-sm font-medium text-green-600">+${item.inflow.toLocaleString()}</div>
                        <div className="text-xs text-gray-600">Inflow</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-medium text-red-600">-${item.outflow.toLocaleString()}</div>
                        <div className="text-xs text-gray-600">Outflow</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-sm font-medium ${item.net > 0 ? "text-green-600" : "text-red-600"}`}>
                          {item.net > 0 ? "+" : ""}${item.net.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-600">Net</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
