"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { TrendingUp, Target, AlertCircle, Lightbulb } from "lucide-react"

const forecastScenarios = [
  {
    name: "Conservative",
    growth: 5,
    confidence: 85,
    revenue: 420000,
    color: "text-blue-600",
  },
  {
    name: "Realistic",
    growth: 12,
    confidence: 78,
    revenue: 470000,
    color: "text-cyan-600",
  },
  {
    name: "Optimistic",
    growth: 20,
    confidence: 62,
    revenue: 540000,
    color: "text-green-600",
  },
]

export function PredictiveForecasting() {
  const [selectedScenario, setSelectedScenario] = useState(forecastScenarios[1])
  const [customGrowth, setCustomGrowth] = useState([12])

  const calculateCustomForecast = (growth: number) => {
    const baseRevenue = 420000
    return Math.round(baseRevenue * (1 + growth / 100))
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-cyan-600" />
            <CardTitle>Predictive Forecasting</CardTitle>
            <Badge variant="secondary" className="bg-cyan-100 text-cyan-700">
              12-Month Outlook
            </Badge>
          </div>
          <Button size="sm" variant="outline">
            <TrendingUp className="h-4 w-4 mr-2" />
            View Details
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {forecastScenarios.map((scenario) => (
            <div
              key={scenario.name}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                selectedScenario.name === scenario.name
                  ? "border-cyan-300 bg-cyan-50"
                  : "border-gray-200 hover:border-cyan-200"
              }`}
              onClick={() => setSelectedScenario(scenario)}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900">{scenario.name}</h3>
                <Badge variant="outline" className={scenario.color}>
                  {scenario.confidence}%
                </Badge>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-gray-900">${scenario.revenue.toLocaleString()}</div>
                <div className="text-sm text-gray-600">{scenario.growth}% growth</div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg border border-cyan-200 p-4">
          <h3 className="font-medium text-gray-900 mb-4">Scenario Analysis: {selectedScenario.name}</h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Projected Revenue</span>
                  <span className="text-lg font-bold text-gray-900">${selectedScenario.revenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Growth Rate</span>
                  <span className="text-sm font-medium text-cyan-600">{selectedScenario.growth}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Confidence Level</span>
                  <span className="text-sm font-medium text-green-600">{selectedScenario.confidence}%</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Custom Growth Rate: {customGrowth[0]}%</label>
                <Slider
                  value={customGrowth}
                  onValueChange={setCustomGrowth}
                  max={30}
                  min={0}
                  step={1}
                  className="w-full"
                />
                <div className="text-sm text-gray-600">
                  Custom Forecast: ${calculateCustomForecast(customGrowth[0]).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-lg border border-cyan-200 p-3">
                <div className="flex items-start gap-2">
                  <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Key Drivers</h4>
                    <ul className="text-xs text-gray-600 mt-1 space-y-1">
                      <li>• Client retention: 94%</li>
                      <li>• Average deal size: +8%</li>
                      <li>• Market expansion: Q2</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-yellow-200 p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Risk Factors</h4>
                    <ul className="text-xs text-gray-600 mt-1 space-y-1">
                      <li>• Economic uncertainty</li>
                      <li>• Seasonal variations</li>
                      <li>• Competition increase</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-900 mb-2">Opportunities</h4>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• Expand to new market segments</li>
              <li>• Increase average contract value</li>
              <li>• Launch premium service tier</li>
            </ul>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Recommendations</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Focus on client retention programs</li>
              <li>• Invest in sales team expansion</li>
              <li>• Optimize pricing strategy</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
