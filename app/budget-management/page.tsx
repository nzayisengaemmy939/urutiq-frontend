'use client'

import { useState, useEffect, useCallback } from 'react'
import { PageLayout } from '@/components/page-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  RefreshCw, 
  Plus, 
  Eye, 
  Edit, 
  Copy, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  DollarSign,
  Calendar,
  Target,
  PieChart,
  LineChart,
  Users,
  Building,
  MapPin,
  Package
} from 'lucide-react'
import { toast } from 'sonner'
import { useDemoAuth } from '@/hooks/useDemoAuth'

interface Company {
  id: string
  name: string
  currency: string
}

interface Dimension {
  id: string
  name: string
  type: 'DEPARTMENT' | 'PROJECT' | 'COST_CENTER' | 'PRODUCT_LINE' | 'GEOGRAPHY' | 'CUSTOM'
  isActive: boolean
}

interface Scenario {
  id: string
  name: string
  description?: string
  type: 'BASE' | 'OPTIMISTIC' | 'PESSIMISTIC' | 'SCENARIO'
  isActive: boolean
  isDefault: boolean
}

interface Period {
  id: string
  name: string
  startDate: string
  endDate: string
  periodType: 'MONTHLY' | 'QUARTERLY' | 'YEARLY'
  isClosed: boolean
  isCurrent: boolean
}

interface BudgetAccount {
  id: string
  accountId: string
  accountName: string
  accountType: 'REVENUE' | 'EXPENSE' | 'ASSET' | 'LIABILITY' | 'EQUITY'
  isActive: boolean
}

interface Budget {
  id: string
  companyId: string
  name: string
  description?: string
  scenarioId: string
  periodId: string
  status: 'DRAFT' | 'APPROVED' | 'ACTIVE' | 'CLOSED'
  totalPlanned: number
  totalActual: number
  totalVariance: number
  totalVariancePercent: number
  createdBy: string
  approvedBy?: string
  approvedAt?: string
  createdAt: string
  updatedAt: string
}

interface BudgetLineItem {
  id: string
  budgetId: string
  accountId: string
  dimensionId: string
  periodId: string
  plannedAmount: number
  actualAmount: number
  variance: number
  variancePercent: number
  notes?: string
}

interface BudgetVariance {
  accountId: string
  accountName: string
  dimensionId: string
  dimensionName: string
  plannedAmount: number
  actualAmount: number
  variance: number
  variancePercent: number
  trend: 'IMPROVING' | 'DETERIORATING' | 'STABLE'
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
}

interface RollingForecast {
  id: string
  companyId: string
  name: string
  description?: string
  basePeriod: string
  forecastPeriods: number
  frequency: 'MONTHLY' | 'QUARTERLY'
  isActive: boolean
  lastUpdated: string
}

interface PerformanceMetrics {
  budgetAccuracy: number
  varianceTrend: 'IMPROVING' | 'DETERIORATING' | 'STABLE'
  topPerformingDimensions: Array<{ dimensionId: string; dimensionName: string; performance: number }>
  underperformingDimensions: Array<{ dimensionId: string; dimensionName: string; performance: number }>
  recommendations: string[]
}

export default function BudgetManagementPage() {
  const { ready: authReady } = useDemoAuth('budget-management-page')
  const [companies, setCompanies] = useState<Company[]>([])
  const [selectedCompany, setSelectedCompany] = useState<string>('')
  const [dimensions, setDimensions] = useState<Dimension[]>([])
  const [scenarios, setScenarios] = useState<Scenario[]>([])
  const [periods, setPeriods] = useState<Period[]>([])
  const [accounts, setAccounts] = useState<BudgetAccount[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [budgetLineItems, setBudgetLineItems] = useState<BudgetLineItem[]>([])
  const [variances, setVariances] = useState<BudgetVariance[]>([])
  const [forecasts, setForecasts] = useState<RollingForecast[]>([])
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  
  // Dialog states
  const [budgetDialogOpen, setBudgetDialogOpen] = useState(false)
  const [forecastDialogOpen, setForecastDialogOpen] = useState(false)
  const [dimensionDialogOpen, setDimensionDialogOpen] = useState(false)
  const [scenarioDialogOpen, setScenarioDialogOpen] = useState(false)

  // Load companies
  useEffect(() => {
    const loadCompanies = async () => {
      try {
        const API = process.env.NEXT_PUBLIC_API_URL || ''
        const response = await fetch(`${API}/companies`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
            'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo'
          }
        })
        const data = await response.json()
        setCompanies(data.data || [])
        if (data.data?.length > 0) {
          setSelectedCompany(data.data[0].id)
        }
      } catch (error) {
        console.error('Error loading companies:', error)
        toast.error('Failed to load companies')
      }
    }
    loadCompanies()
  }, [])

  const loadAllData = useCallback(async () => {
    if (!selectedCompany) return
    
    setLoading(true)
    try {
      await Promise.all([
        loadDimensions(),
        loadScenarios(),
        loadPeriods(),
        loadAccounts(),
        loadBudgets(),
        loadForecasts(),
        loadPerformanceMetrics()
      ])
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Failed to load budget data')
    } finally {
      setLoading(false)
    }
  }, [selectedCompany])

  // Load data when company changes
  useEffect(() => {
    if (selectedCompany) {
      loadAllData()
    }
  }, [selectedCompany, loadAllData])

  const loadDimensions = async () => {
    const API = process.env.NEXT_PUBLIC_API_URL || ''
    const response = await fetch(`${API}/api/budget-management/${selectedCompany}/dimensions`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
        'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo'
      }
    })
    const data = await response.json()
    setDimensions(data.data || [])
  }

  const loadScenarios = async () => {
    const API = process.env.NEXT_PUBLIC_API_URL || ''
    const response = await fetch(`${API}/api/budget-management/${selectedCompany}/scenarios`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
        'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo'
      }
    })
    const data = await response.json()
    setScenarios(data.data || [])
  }

  const loadPeriods = async () => {
    const API = process.env.NEXT_PUBLIC_API_URL || ''
    const response = await fetch(`${API}/api/budget-management/${selectedCompany}/periods`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
        'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo'
      }
    })
    const data = await response.json()
    setPeriods(data.data || [])
  }

  const loadAccounts = async () => {
    const API = process.env.NEXT_PUBLIC_API_URL || ''
    const response = await fetch(`${API}/api/budget-management/${selectedCompany}/accounts`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
        'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo'
      }
    })
    const data = await response.json()
    setAccounts(data.data || [])
  }

  const loadBudgets = async () => {
    const API = process.env.NEXT_PUBLIC_API_URL || ''
    const response = await fetch(`${API}/api/budget-management/${selectedCompany}/budgets`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
        'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo'
      }
    })
    const data = await response.json()
    setBudgets(data.data || [])
  }

  const loadForecasts = async () => {
    const API = process.env.NEXT_PUBLIC_API_URL || ''
    const response = await fetch(`${API}/api/budget-management/${selectedCompany}/rolling-forecasts`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
        'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo'
      }
    })
    const data = await response.json()
    setForecasts(data.data || [])
  }

  const loadPerformanceMetrics = async () => {
    const API = process.env.NEXT_PUBLIC_API_URL || ''
    const response = await fetch(`${API}/api/budget-management/${selectedCompany}/performance-metrics?period=2024-01`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
        'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo'
      }
    })
    const data = await response.json()
    setPerformanceMetrics(data.data || null)
  }

  const loadBudgetLineItems = async (budgetId: string) => {
    const API = process.env.NEXT_PUBLIC_API_URL || ''
    const response = await fetch(`${API}/api/budget-management/${selectedCompany}/budgets/${budgetId}/line-items`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
        'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo'
      }
    })
    const data = await response.json()
    setBudgetLineItems(data.data || [])
  }

  const loadVariances = async (budgetId: string) => {
    const API = process.env.NEXT_PUBLIC_API_URL || ''
    const response = await fetch(`${API}/api/budget-management/${selectedCompany}/budgets/${budgetId}/variances`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
        'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo'
      }
    })
    const data = await response.json()
    setVariances(data.data || [])
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'bg-yellow-100 text-yellow-800'
      case 'APPROVED': return 'bg-blue-100 text-blue-800'
      case 'ACTIVE': return 'bg-green-100 text-green-800'
      case 'CLOSED': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'IMPROVING': return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'DETERIORATING': return <TrendingDown className="h-4 w-4 text-red-500" />
      case 'STABLE': return <BarChart3 className="h-4 w-4 text-gray-500" />
      default: return <BarChart3 className="h-4 w-4 text-gray-500" />
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'LOW': return 'bg-green-100 text-green-800'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800'
      case 'HIGH': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getDimensionIcon = (type: string) => {
    switch (type) {
      case 'DEPARTMENT': return <Users className="h-4 w-4" />
      case 'PROJECT': return <Target className="h-4 w-4" />
      case 'COST_CENTER': return <Building className="h-4 w-4" />
      case 'PRODUCT_LINE': return <Package className="h-4 w-4" />
      case 'GEOGRAPHY': return <MapPin className="h-4 w-4" />
      case 'CUSTOM': return <BarChart3 className="h-4 w-4" />
      default: return <BarChart3 className="h-4 w-4" />
    }
  }

  if (!authReady) {
    return (
      <PageLayout title="Budget Management" description="Create budgets, manage forecasts, and track performance">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading budget management...</p>
          </div>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout 
      title="Budget Management" 
      description="Create budgets, manage forecasts, and track performance"
      breadcrumbs={[
        { label: 'Finance', href: '/finance' },
        { label: 'Budget Management', href: '/budget-management' }
      ]}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-end">
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadAllData} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

      {/* Company Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Company Selection</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="company">Company</Label>
              <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                <SelectTrigger>
                  <SelectValue placeholder="Select company" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="budgets">Budgets</TabsTrigger>
          <TabsTrigger value="forecasts">Forecasts</TabsTrigger>
          <TabsTrigger value="variances">Variances</TabsTrigger>
          <TabsTrigger value="dimensions">Dimensions</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Budgets</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{budgets.length}</div>
                <p className="text-xs text-muted-foreground">
                  {budgets.filter(b => b.status === 'ACTIVE').length} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Planned</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(budgets.reduce((sum, b) => sum + b.totalPlanned, 0))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Across all budgets
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Actual</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(budgets.reduce((sum, b) => sum + b.totalActual, 0))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Actual spending
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Budget Accuracy</CardTitle>
                <PieChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {performanceMetrics ? `${performanceMetrics.budgetAccuracy.toFixed(1)}%` : 'N/A'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {performanceMetrics?.varianceTrend || 'N/A'} trend
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Performance Metrics */}
          {performanceMetrics && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    Top Performing Dimensions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {performanceMetrics.topPerformingDimensions.map((dim, index) => (
                      <div key={index} className="flex justify-between items-center p-2 border rounded">
                        <span className="font-medium">{dim.dimensionName}</span>
                        <Badge variant="default">{dim.performance.toFixed(1)}%</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingDown className="h-5 w-5 text-red-500" />
                    Underperforming Dimensions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {performanceMetrics.underperformingDimensions.map((dim, index) => (
                      <div key={index} className="flex justify-between items-center p-2 border rounded">
                        <span className="font-medium">{dim.dimensionName}</span>
                        <Badge variant="destructive">{dim.performance.toFixed(1)}%</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Recommendations */}
          {performanceMetrics && performanceMetrics.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {performanceMetrics.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-sm">{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Budgets Tab */}
        <TabsContent value="budgets" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Budgets</h3>
            <Dialog open={budgetDialogOpen} onOpenChange={setBudgetDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Budget
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Budget</DialogTitle>
                  <DialogDescription>
                    Create a new budget for planning and tracking
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="budget-name">Budget Name</Label>
                    <Input id="budget-name" placeholder="Enter budget name" />
                  </div>
                  <div>
                    <Label htmlFor="budget-description">Description</Label>
                    <Textarea id="budget-description" placeholder="Enter budget description" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="budget-scenario">Scenario</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select scenario" />
                        </SelectTrigger>
                        <SelectContent>
                          {scenarios.map((scenario) => (
                            <SelectItem key={scenario.id} value={scenario.id}>
                              {scenario.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="budget-period">Period</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select period" />
                        </SelectTrigger>
                        <SelectContent>
                          {periods.map((period) => (
                            <SelectItem key={period.id} value={period.id}>
                              {period.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setBudgetDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={() => setBudgetDialogOpen(false)}>
                      Create Budget
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Scenario</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Planned</TableHead>
                    <TableHead>Actual</TableHead>
                    <TableHead>Variance</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {budgets.map((budget) => {
                    const scenario = scenarios.find(s => s.id === budget.scenarioId)
                    const period = periods.find(p => p.id === budget.periodId)
                    return (
                      <TableRow key={budget.id}>
                        <TableCell className="font-medium">{budget.name}</TableCell>
                        <TableCell>{scenario?.name || 'Unknown'}</TableCell>
                        <TableCell>{period?.name || 'Unknown'}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(budget.status)}>
                            {budget.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatCurrency(budget.totalPlanned)}</TableCell>
                        <TableCell>{formatCurrency(budget.totalActual)}</TableCell>
                        <TableCell className={budget.totalVariance < 0 ? 'text-red-600' : 'text-green-600'}>
                          {formatCurrency(budget.totalVariance)} ({formatPercent(budget.totalVariancePercent)})
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="outline" size="sm" onClick={() => loadBudgetLineItems(budget.id)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Forecasts Tab */}
        <TabsContent value="forecasts" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Rolling Forecasts</h3>
            <Dialog open={forecastDialogOpen} onOpenChange={setForecastDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Forecast
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Rolling Forecast</DialogTitle>
                  <DialogDescription>
                    Create a rolling forecast for future planning
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="forecast-name">Forecast Name</Label>
                    <Input id="forecast-name" placeholder="Enter forecast name" />
                  </div>
                  <div>
                    <Label htmlFor="forecast-description">Description</Label>
                    <Textarea id="forecast-description" placeholder="Enter forecast description" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="base-period">Base Period</Label>
                      <Input id="base-period" type="month" />
                    </div>
                    <div>
                      <Label htmlFor="forecast-periods">Forecast Periods</Label>
                      <Input id="forecast-periods" type="number" placeholder="12" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="frequency">Frequency</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MONTHLY">Monthly</SelectItem>
                        <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setForecastDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={() => setForecastDialogOpen(false)}>
                      Create Forecast
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {forecasts.map((forecast) => (
              <Card key={forecast.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{forecast.name}</span>
                    <Badge variant={forecast.isActive ? 'default' : 'secondary'}>
                      {forecast.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </CardTitle>
                  <CardDescription>{forecast.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Base Period:</span>
                      <span className="text-sm font-medium">{forecast.basePeriod}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Periods:</span>
                      <span className="text-sm font-medium">{forecast.forecastPeriods}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Frequency:</span>
                      <span className="text-sm font-medium">{forecast.frequency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Last Updated:</span>
                      <span className="text-sm font-medium">
                        {new Date(forecast.lastUpdated).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <LineChart className="h-4 w-4 mr-2" />
                      Generate
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Variances Tab */}
        <TabsContent value="variances" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Budget Variances</h3>
            <Button variant="outline" onClick={() => budgets.length > 0 && loadVariances(budgets[0].id)}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Load Variances
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Account</TableHead>
                    <TableHead>Dimension</TableHead>
                    <TableHead>Planned</TableHead>
                    <TableHead>Actual</TableHead>
                    <TableHead>Variance</TableHead>
                    <TableHead>Trend</TableHead>
                    <TableHead>Risk</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {variances.map((variance, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{variance.accountName}</TableCell>
                      <TableCell>{variance.dimensionName}</TableCell>
                      <TableCell>{formatCurrency(variance.plannedAmount)}</TableCell>
                      <TableCell>{formatCurrency(variance.actualAmount)}</TableCell>
                      <TableCell className={variance.variance < 0 ? 'text-red-600' : 'text-green-600'}>
                        {formatCurrency(variance.variance)} ({formatPercent(variance.variancePercent)})
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {getTrendIcon(variance.trend)}
                          <span className="text-sm">{variance.trend}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRiskColor(variance.riskLevel)}>
                          {variance.riskLevel}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dimensions Tab */}
        <TabsContent value="dimensions" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Budget Dimensions</h3>
            <Dialog open={dimensionDialogOpen} onOpenChange={setDimensionDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Dimension
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Budget Dimension</DialogTitle>
                  <DialogDescription>
                    Create a new dimension for budget categorization
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="dimension-name">Dimension Name</Label>
                    <Input id="dimension-name" placeholder="Enter dimension name" />
                  </div>
                  <div>
                    <Label htmlFor="dimension-type">Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DEPARTMENT">Department</SelectItem>
                        <SelectItem value="PROJECT">Project</SelectItem>
                        <SelectItem value="COST_CENTER">Cost Center</SelectItem>
                        <SelectItem value="PRODUCT_LINE">Product Line</SelectItem>
                        <SelectItem value="GEOGRAPHY">Geography</SelectItem>
                        <SelectItem value="CUSTOM">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setDimensionDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={() => setDimensionDialogOpen(false)}>
                      Add Dimension
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dimensions.map((dimension) => (
              <Card key={dimension.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {getDimensionIcon(dimension.type)}
                    {dimension.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Type:</span>
                      <span className="text-sm font-medium">{dimension.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Status:</span>
                      <Badge variant={dimension.isActive ? 'default' : 'secondary'}>
                        {dimension.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Budget Reports</CardTitle>
              <CardDescription>Generate comprehensive budget reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button variant="outline" className="h-20 flex flex-col gap-2">
                  <BarChart3 className="h-6 w-6" />
                  <span>Summary Report</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2">
                  <PieChart className="h-6 w-6" />
                  <span>Detailed Report</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2">
                  <TrendingUp className="h-6 w-6" />
                  <span>Variance Report</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2">
                  <LineChart className="h-6 w-6" />
                  <span>Forecast Report</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </PageLayout>
  )
}
