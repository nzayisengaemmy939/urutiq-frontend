"use client"

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ScatterChart,
  Scatter
} from 'recharts'
import { 
  TrendingUp, 
  TrendingDown, 
  Package, 
  DollarSign, 
  AlertTriangle,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Target,
  Zap,
  Download,
  RefreshCw
} from 'lucide-react'

interface InventoryAnalyticsProps {
  products: any[]
  movements: any[]
  locations: any[]
  alerts: any[]
  analytics?: any
  kpis?: any
  onRefresh?: () => void
}

interface ChartData {
  name: string
  value: number
  [key: string]: any
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

export function InventoryAnalytics({ 
  products, 
  movements, 
  locations, 
  alerts, 
  analytics, 
  kpis,
  onRefresh 
}: InventoryAnalyticsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('30d')
  const [selectedLocation, setSelectedLocation] = useState('all')
  const [selectedMetric, setSelectedMetric] = useState('value')

  // Process data for charts
  const chartData = useMemo(() => {
    // Category breakdown
    const categoryData = products.reduce((acc, product) => {
      const category = product.category || 'Uncategorized'
      const existing = acc.find(item => item.name === category)
      if (existing) {
        existing.value += parseFloat(product.stockQuantity || 0)
        existing.revenue += parseFloat(product.unitPrice || 0) * parseFloat(product.stockQuantity || 0)
      } else {
        acc.push({
          name: category,
          value: parseFloat(product.stockQuantity || 0),
          revenue: parseFloat(product.unitPrice || 0) * parseFloat(product.stockQuantity || 0)
        })
      }
      return acc
    }, [] as ChartData[])

    // Top products by value
    const topProducts = products
      .map(product => ({
        name: product.name,
        value: parseFloat(product.stockQuantity || 0),
        revenue: parseFloat(product.unitPrice || 0) * parseFloat(product.stockQuantity || 0),
        sku: product.sku
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)

    // Stock levels by location
    const locationData = locations.map(location => {
      const locationProducts = products.filter(product => 
        product.locations?.some((loc: any) => loc.locationId === location.id)
      )
      const totalStock = locationProducts.reduce((sum, product) => 
        sum + parseFloat(product.stockQuantity || 0), 0
      )
      const totalValue = locationProducts.reduce((sum, product) => 
        sum + (parseFloat(product.unitPrice || 0) * parseFloat(product.stockQuantity || 0)), 0
      )
      
      return {
        name: location.name,
        stock: totalStock,
        value: totalValue,
        products: locationProducts.length
      }
    })

    // Movement trends (mock data for demonstration)
    const movementTrends = Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      incoming: Math.floor(Math.random() * 50) + 10,
      outgoing: Math.floor(Math.random() * 40) + 5,
      adjustments: Math.floor(Math.random() * 10)
    }))

    // Stock turnover analysis
    const turnoverData = products
      .filter(product => parseFloat(product.stockQuantity || 0) > 0)
      .map(product => ({
        name: product.name,
        stock: parseFloat(product.stockQuantity || 0),
        turnover: Math.random() * 12, // Mock turnover rate
        category: product.category || 'Uncategorized'
      }))
      .sort((a, b) => b.turnover - a.turnover)
      .slice(0, 15)

    return {
      categoryData,
      topProducts,
      locationData,
      movementTrends,
      turnoverData
    }
  }, [products, locations])

  // Calculate key metrics
  const metrics = useMemo(() => {
    const totalProducts = products.length
    const totalValue = products.reduce((sum, product) => 
      sum + (parseFloat(product.unitPrice || 0) * parseFloat(product.stockQuantity || 0)), 0
    )
    const lowStockItems = products.filter(product => 
      parseFloat(product.stockQuantity || 0) <= (product.reorderPoint || 10)
    ).length
    const outOfStockItems = products.filter(product => 
      parseFloat(product.stockQuantity || 0) === 0
    ).length
    const avgTurnover = chartData.turnoverData.reduce((sum, item) => sum + item.turnover, 0) / chartData.turnoverData.length

    return {
      totalProducts,
      totalValue,
      lowStockItems,
      outOfStockItems,
      avgTurnover: avgTurnover || 0
    }
  }, [products, chartData])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Advanced Analytics</h2>
          <p className="text-muted-foreground">Comprehensive inventory insights and trends</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
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

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Products</p>
                <p className="text-xl font-bold">{metrics.totalProducts}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-xl font-bold">${metrics.totalValue.toLocaleString()}</p>
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
                <p className="text-sm text-muted-foreground">Low Stock</p>
                <p className="text-xl font-bold">{metrics.lowStockItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Out of Stock</p>
                <p className="text-xl font-bold">{metrics.outOfStockItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Turnover</p>
                <p className="text-xl font-bold">{metrics.avgTurnover.toFixed(1)}x</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5" />
                  Category Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={chartData.categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Top Products by Value */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Top Products by Value
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData.topProducts.slice(0, 8)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45}
                      textAnchor="end"
                      height={100}
                      fontSize={12}
                    />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="revenue" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Stock by Location */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Stock Distribution by Location
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.locationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="stock" fill="#82CA9D" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          {/* Movement Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Inventory Movement Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={chartData.movementTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="incoming" stackId="1" stroke="#8884d8" fill="#8884d8" />
                  <Area type="monotone" dataKey="outgoing" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                  <Area type="monotone" dataKey="adjustments" stackId="1" stroke="#ffc658" fill="#ffc658" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          {/* Stock Turnover Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Stock Turnover Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ScatterChart data={chartData.turnoverData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="stock" name="Stock Level" />
                  <YAxis dataKey="turnover" name="Turnover Rate" />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                  <Scatter dataKey="turnover" fill="#8884d8" />
                </ScatterChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Optimization Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Optimization Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-900">Increase Stock for Fast Movers</p>
                      <p className="text-sm text-blue-700">
                        Products with high turnover rates should have increased stock levels
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-amber-900">Review Low Stock Items</p>
                      <p className="text-sm text-amber-700">
                        {metrics.lowStockItems} items need immediate attention
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                    <Package className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-900">Optimize Location Distribution</p>
                      <p className="text-sm text-green-700">
                        Balance stock across {locations.length} locations for better efficiency
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Inventory Turnover</span>
                    <Badge variant="outline">{metrics.avgTurnover.toFixed(1)}x</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Stock Accuracy</span>
                    <Badge variant="outline">98.5%</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Fill Rate</span>
                    <Badge variant="outline">94.2%</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Carrying Cost</span>
                    <Badge variant="outline">12.3%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default InventoryAnalytics