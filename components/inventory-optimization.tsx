"use client"

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { 
  Target, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Lightbulb, 
  Zap, 
  DollarSign,
  Package,
  BarChart3,
  Activity,
  RefreshCw,
  Download,
  Settings,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Plus
} from 'lucide-react'

interface InventoryOptimizationProps {
  products: any[]
  movements: any[]
  locations: any[]
  alerts: any[]
  analytics?: any
  kpis?: any
  onApplyRecommendation?: (recommendation: any) => void
  onRefresh?: () => void
}

interface OptimizationRecommendation {
  id: string
  type: 'stock_adjustment' | 'reorder_point' | 'location_transfer' | 'pricing' | 'discontinuation'
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  impact: 'cost_savings' | 'revenue_increase' | 'efficiency' | 'risk_reduction'
  potentialSavings?: number
  potentialRevenue?: number
  confidence: number
  products: string[]
  locations?: string[]
  action: string
  estimatedEffort: 'low' | 'medium' | 'high'
}

interface OptimizationMetrics {
  overallScore: number
  costOptimization: number
  spaceUtilization: number
  turnoverRate: number
  stockAccuracy: number
  fillRate: number
}

export function InventoryOptimization({ 
  products, 
  movements, 
  locations, 
  alerts, 
  analytics, 
  kpis,
  onApplyRecommendation,
  onRefresh 
}: InventoryOptimizationProps) {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedPriority, setSelectedPriority] = useState('all')
  const [appliedRecommendations, setAppliedRecommendations] = useState<Set<string>>(new Set())
  const { toast } = useToast()

  // Calculate optimization metrics
  const metrics = useMemo((): OptimizationMetrics => {
    const totalProducts = products.length
    const totalValue = products.reduce((sum, product) => 
      sum + (parseFloat(String(product.unitPrice || 0)) * parseFloat(String(product.stockQuantity || 0))), 0
    )
    
    const lowStockItems = products.filter(product => {
      const stock = typeof product.stockQuantity === 'string' ? parseFloat(product.stockQuantity) : product.stockQuantity
      const reorderPoint = typeof product.reorderPoint === 'string' ? parseFloat(product.reorderPoint) : product.reorderPoint || 10
      return stock <= reorderPoint
    }).length

    const outOfStockItems = products.filter(product => {
      const stock = typeof product.stockQuantity === 'string' ? parseFloat(product.stockQuantity) : product.stockQuantity
      return stock === 0
    }).length

    const avgTurnover = kpis?.inventoryTurnover || 6
    const stockAccuracy = 98.5 // Mock data
    const fillRate = 94.2 // Mock data

    // Calculate optimization scores
    const costOptimization = Math.max(0, 100 - (lowStockItems / totalProducts) * 100)
    const spaceUtilization = Math.max(0, 100 - (outOfStockItems / totalProducts) * 100)
    const turnoverRate = Math.min(100, (avgTurnover / 12) * 100)
    
    const overallScore = (costOptimization + spaceUtilization + turnoverRate + stockAccuracy + fillRate) / 5

    return {
      overallScore: Math.round(overallScore),
      costOptimization: Math.round(costOptimization),
      spaceUtilization: Math.round(spaceUtilization),
      turnoverRate: Math.round(turnoverRate),
      stockAccuracy: Math.round(stockAccuracy),
      fillRate: Math.round(fillRate)
    }
  }, [products, kpis])

  // Generate optimization recommendations
  const recommendations = useMemo((): OptimizationRecommendation[] => {
    const recs: OptimizationRecommendation[] = []

    // Analyze products for recommendations
    products.forEach(product => {
      const stock = typeof product.stockQuantity === 'string' ? parseFloat(product.stockQuantity) : product.stockQuantity
      const reorderPoint = typeof product.reorderPoint === 'string' ? parseFloat(product.reorderPoint) : product.reorderPoint || 10
      const price = typeof product.unitPrice === 'string' ? parseFloat(product.unitPrice) : product.unitPrice || 0
      const cost = typeof product.costPrice === 'string' ? parseFloat(product.costPrice) : product.costPrice || 0

      // Low stock recommendation
      if (stock <= reorderPoint && stock > 0) {
        recs.push({
          id: `low-stock-${product.id}`,
          type: 'reorder_point',
          priority: stock <= reorderPoint * 0.5 ? 'high' : 'medium',
          title: `Reorder ${product.name}`,
          description: `Stock level (${stock}) is below reorder point (${reorderPoint}). Consider placing a purchase order.`,
          impact: 'risk_reduction',
          potentialSavings: stock * cost * 0.1, // 10% of stock value
          confidence: 95,
          products: [product.id],
          action: `Increase stock to ${reorderPoint * 2} units`,
          estimatedEffort: 'low'
        })
      }

      // Overstock recommendation
      if (stock > reorderPoint * 3) {
        recs.push({
          id: `overstock-${product.id}`,
          type: 'stock_adjustment',
          priority: 'medium',
          title: `Reduce Overstock for ${product.name}`,
          description: `High stock level (${stock}) may indicate overstocking. Consider reducing inventory.`,
          impact: 'cost_savings',
          potentialSavings: (stock - reorderPoint * 2) * cost * 0.2,
          confidence: 80,
          products: [product.id],
          action: `Reduce stock to ${reorderPoint * 2} units`,
          estimatedEffort: 'medium'
        })
      }

      // Pricing optimization
      if (price > cost * 2.5) {
        recs.push({
          id: `pricing-${product.id}`,
          type: 'pricing',
          priority: 'low',
          title: `Optimize Pricing for ${product.name}`,
          description: `High markup (${((price - cost) / cost * 100).toFixed(1)}%) may impact sales volume.`,
          impact: 'revenue_increase',
          potentialRevenue: stock * price * 0.05, // 5% increase
          confidence: 70,
          products: [product.id],
          action: `Consider reducing price by 5-10%`,
          estimatedEffort: 'low'
        })
      }

      // Discontinuation recommendation for slow movers
      if (stock > 0 && Math.random() < 0.1) { // 10% chance for demo
        recs.push({
          id: `discontinue-${product.id}`,
          type: 'discontinuation',
          priority: 'low',
          title: `Consider Discontinuing ${product.name}`,
          description: `Low movement rate suggests this product may not be profitable.`,
          impact: 'cost_savings',
          potentialSavings: stock * cost,
          confidence: 60,
          products: [product.id],
          action: `Phase out product or run clearance sale`,
          estimatedEffort: 'high'
        })
      }
    })

    // Location optimization recommendations
    if (locations.length > 1) {
      recs.push({
        id: 'location-balance',
        type: 'location_transfer',
        priority: 'medium',
        title: 'Balance Stock Across Locations',
        description: `Optimize inventory distribution across ${locations.length} locations for better efficiency.`,
        impact: 'efficiency',
        potentialSavings: 5000,
        confidence: 85,
        products: products.slice(0, 5).map(p => p.id),
        locations: locations.map(l => l.id),
        action: 'Transfer stock between locations based on demand patterns',
        estimatedEffort: 'medium'
      })
    }

    return recs.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
  }, [products, locations])

  const filteredRecommendations = recommendations.filter(rec => {
    const categoryMatch = selectedCategory === 'all' || 
      products.find(p => p.id === rec.products[0])?.category === selectedCategory
    const priorityMatch = selectedPriority === 'all' || rec.priority === selectedPriority
    return categoryMatch && priorityMatch
  })

  const handleApplyRecommendation = (recommendation: OptimizationRecommendation) => {
    setAppliedRecommendations(prev => new Set([...prev, recommendation.id]))
    
    toast({
      title: "Recommendation Applied",
      description: recommendation.title,
    })

    if (onApplyRecommendation) {
      onApplyRecommendation(recommendation)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-amber-100 text-amber-800 border-amber-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'cost_savings': return <TrendingDown className="w-4 h-4 text-green-600" />
      case 'revenue_increase': return <TrendingUp className="w-4 h-4 text-blue-600" />
      case 'efficiency': return <Zap className="w-4 h-4 text-purple-600" />
      case 'risk_reduction': return <AlertTriangle className="w-4 h-4 text-amber-600" />
      default: return <Target className="w-4 h-4 text-gray-600" />
    }
  }

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'low': return 'text-green-600'
      case 'medium': return 'text-amber-600'
      case 'high': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Inventory Optimization</h2>
          <p className="text-muted-foreground">AI-powered recommendations to optimize your inventory performance</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="electronics">Electronics</SelectItem>
              <SelectItem value="clothing">Clothing</SelectItem>
              <SelectItem value="books">Books</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedPriority} onValueChange={setSelectedPriority}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
          {onRefresh && (
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          )}
        </div>
      </div>

      {/* Optimization Score */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Overall Score</p>
                <p className="text-xl font-bold">{metrics.overallScore}%</p>
              </div>
            </div>
            <Progress value={metrics.overallScore} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cost Optimization</p>
                <p className="text-xl font-bold">{metrics.costOptimization}%</p>
              </div>
            </div>
            <Progress value={metrics.costOptimization} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Space Utilization</p>
                <p className="text-xl font-bold">{metrics.spaceUtilization}%</p>
              </div>
            </div>
            <Progress value={metrics.spaceUtilization} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Turnover Rate</p>
                <p className="text-xl font-bold">{metrics.turnoverRate}%</p>
              </div>
            </div>
            <Progress value={metrics.turnoverRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Stock Accuracy</p>
                <p className="text-xl font-bold">{metrics.stockAccuracy}%</p>
              </div>
            </div>
            <Progress value={metrics.stockAccuracy} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Fill Rate</p>
                <p className="text-xl font-bold">{metrics.fillRate}%</p>
              </div>
            </div>
            <Progress value={metrics.fillRate} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Tabs defaultValue="recommendations" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="actions">Action Plan</TabsTrigger>
        </TabsList>

        <TabsContent value="recommendations" className="space-y-4">
          <div className="space-y-4">
            {filteredRecommendations.map((recommendation) => (
              <Card key={recommendation.id} className={appliedRecommendations.has(recommendation.id) ? 'opacity-50' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{recommendation.title}</h3>
                        <Badge className={getPriorityColor(recommendation.priority)}>
                          {recommendation.priority}
                        </Badge>
                        {getImpactIcon(recommendation.impact)}
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3">
                        {recommendation.description}
                      </p>
                      
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">Confidence:</span>
                          <span className="font-medium">{recommendation.confidence}%</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">Effort:</span>
                          <span className={`font-medium ${getEffortColor(recommendation.estimatedEffort)}`}>
                            {recommendation.estimatedEffort}
                          </span>
                        </div>
                        {recommendation.potentialSavings && (
                          <div className="flex items-center gap-1">
                            <span className="text-muted-foreground">Savings:</span>
                            <span className="font-medium text-green-600">
                              ${recommendation.potentialSavings.toLocaleString()}
                            </span>
                          </div>
                        )}
                        {recommendation.potentialRevenue && (
                          <div className="flex items-center gap-1">
                            <span className="text-muted-foreground">Revenue:</span>
                            <span className="font-medium text-blue-600">
                              ${recommendation.potentialRevenue.toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-3 p-2 bg-muted rounded-lg">
                        <p className="text-sm font-medium">Action:</p>
                        <p className="text-sm text-muted-foreground">{recommendation.action}</p>
                      </div>
                    </div>
                    
                    <div className="ml-4">
                      {appliedRecommendations.has(recommendation.id) ? (
                        <Button variant="outline" disabled>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Applied
                        </Button>
                      ) : (
                        <Button 
                          onClick={() => handleApplyRecommendation(recommendation)}
                          size="sm"
                        >
                          Apply
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {filteredRecommendations.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Recommendations</h3>
                  <p className="text-muted-foreground">
                    Your inventory is well optimized! No immediate recommendations at this time.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5" />
                  Key Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-900">High Turnover Products</p>
                    <p className="text-sm text-blue-700">
                      {products.filter(p => Math.random() > 0.7).length} products showing excellent movement
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-900">Attention Needed</p>
                    <p className="text-sm text-amber-700">
                      {alerts.length} items require immediate attention
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <Package className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-900">Space Optimization</p>
                    <p className="text-sm text-green-700">
                      Potential to free up {Math.floor(products.length * 0.1)} storage locations
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Performance Trends
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Inventory Turnover</span>
                  <div className="flex items-center gap-1">
                    <ArrowUpRight className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-600">+12%</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Stock Accuracy</span>
                  <div className="flex items-center gap-1">
                    <ArrowUpRight className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-600">+2.1%</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Carrying Costs</span>
                  <div className="flex items-center gap-1">
                    <ArrowDownRight className="w-4 h-4 text-red-600" />
                    <span className="text-sm text-red-600">-5.3%</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Fill Rate</span>
                  <div className="flex items-center gap-1">
                    <Minus className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-600">0.0%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="actions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Recommended Action Plan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <span className="text-sm font-bold text-red-600">1</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Address High Priority Items</p>
                    <p className="text-sm text-muted-foreground">
                      {filteredRecommendations.filter(r => r.priority === 'high').length} high priority recommendations
                    </p>
                  </div>
                  <Button size="sm" variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export List
                  </Button>
                </div>
                
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                    <span className="text-sm font-bold text-amber-600">2</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Review Medium Priority Items</p>
                    <p className="text-sm text-muted-foreground">
                      {filteredRecommendations.filter(r => r.priority === 'medium').length} medium priority recommendations
                    </p>
                  </div>
                  <Button size="sm" variant="outline">
                    Schedule Review
                  </Button>
                </div>
                
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-sm font-bold text-green-600">3</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Monitor Performance</p>
                    <p className="text-sm text-muted-foreground">
                      Track optimization metrics and adjust strategies
                    </p>
                  </div>
                  <Button size="sm" variant="outline">
                    Set Alerts
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default InventoryOptimization
