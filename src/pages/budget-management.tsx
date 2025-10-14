import { useState, useEffect, useCallback } from 'react'
import { PageLayout } from '@/components/page-layout'
import { apiService } from '@/lib/api'
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
  AlertTriangle,
  DollarSign,
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
import { budgetManagementApi, simpleBudgetApi, type Company, type Dimension, type Scenario, type Period, type Budget, type BudgetVariance, type RollingForecast, type PerformanceMetrics } from '@/lib/api/budget-management'

export default function BudgetManagement() {
  const { ready: authReady } = useDemoAuth('budget-management-page')
  const [companies, setCompanies] = useState<Company[]>([])
  const [selectedCompany, setSelectedCompany] = useState<string>('')
  const [dimensions, setDimensions] = useState<Dimension[]>([])
  const [scenarios, setScenarios] = useState<Scenario[]>([])
  const [periods, setPeriods] = useState<Period[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [forecasts, setForecasts] = useState<RollingForecast[]>([])
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null)
  const [expenseCategories, setExpenseCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [viewingBudget, setViewingBudget] = useState<Budget | null>(null)
  const [budgetVariances, setBudgetVariances] = useState<BudgetVariance[]>([])
  
  // Dialog states
  const [budgetDialogOpen, setBudgetDialogOpen] = useState(false)
  const [forecastDialogOpen, setForecastDialogOpen] = useState(false)
  const [dimensionDialogOpen, setDimensionDialogOpen] = useState(false)
  
  // Budget form states
  const [budgetForm, setBudgetForm] = useState({
    name: '',
    description: '',
    scenarioId: '',
    periodId: '',
    amount: '',
    status: 'DRAFT' as 'DRAFT' | 'ACTIVE' | 'APPROVED' | 'CLOSED',
    categoryId: ''
  })
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null)
  const [viewingBudgetDetails, setViewingBudgetDetails] = useState<Budget | null>(null)

  // Forecast form states
  const [forecastForm, setForecastForm] = useState({
    name: '',
    description: '',
    basePeriod: '',
    forecastPeriods: 12,
    frequency: 'MONTHLY' as 'MONTHLY' | 'QUARTERLY'
  })
  const [editingForecast, setEditingForecast] = useState<RollingForecast | null>(null)

  // Dimension form states
  const [dimensionForm, setDimensionForm] = useState({
    name: '',
    type: 'DEPARTMENT' as 'DEPARTMENT' | 'PRODUCT_LINE' | 'GEOGRAPHY' | 'COST_CENTER' | 'PROJECT'
  })
  const [editingDimension, setEditingDimension] = useState<Dimension | null>(null)

  // Load companies
  useEffect(() => {
    const loadCompanies = async () => {
      try {
        const companies = await budgetManagementApi.getCompanies()
        setCompanies(companies)
        if (companies && companies.length > 0) {
          setSelectedCompany(companies[0].id)
        }
      } catch (error) {
        setCompanies([])
        toast.error('Failed to load companies')
      }
    }
    loadCompanies()
  }, [])

  // Load expense categories
  useEffect(() => {
    const loadExpenseCategories = async () => {
      try {
        const response = await apiService.get(`/api/expense-categories?companyId=${selectedCompany}`)
        setExpenseCategories(response || [])
      } catch (error) {
        setExpenseCategories([])
      }
    }
    if (selectedCompany) {
      loadExpenseCategories()
    }
  }, [selectedCompany])

  // Seed default categories
  const seedDefaultCategories = async () => {
    try {
      const response = await apiService.post(`/api/expense-categories/seed/${selectedCompany}`)
      toast.success('Default categories created successfully')
      // Reload categories
      const categoriesResponse = await apiService.get(`/api/expense-categories?companyId=${selectedCompany}`)
      setExpenseCategories(categoriesResponse || [])
    } catch (error) {
      toast.error('Failed to create default categories')
    }
  }

  const loadAllData = useCallback(async () => {
    if (!selectedCompany) {
      return
    }
    
    setLoading(true)
    try {
      // Get demo token first
      const tokenResponse = await apiService.getDemoToken('user_demo', ['admin'])
      
      // Store token in localStorage for API calls
      localStorage.setItem('auth_token', tokenResponse.token)
      localStorage.setItem('tenant_id', 'tenant_demo')
      
      await Promise.all([
        loadDimensions(),
        loadScenarios(),
        loadPeriods(),
        loadBudgets(),
        loadForecasts(),
        loadPerformanceMetrics()
      ])
      
    } catch (error) {
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
    try {
      const dimensions = await budgetManagementApi.getDimensions(selectedCompany)
      setDimensions(dimensions)
    } catch (error) {
      setDimensions([])
      toast.error('Failed to load dimensions')
    }
  }

  const loadScenarios = async () => {
    try {
      const scenarios = await budgetManagementApi.getScenarios(selectedCompany)
      setScenarios(scenarios)
    } catch (error) {
      setScenarios([])
      toast.error('Failed to load scenarios')
    }
  }

  const loadPeriods = async () => {
    try {
      const periods = await budgetManagementApi.getPeriods(selectedCompany)
      setPeriods(periods)
    } catch (error) {
      setPeriods([])
      toast.error('Failed to load periods')
    }
  }

  const loadBudgets = async () => {
    try {
      const simpleBudgets = await simpleBudgetApi.getBudgets(selectedCompany)
      
      if (simpleBudgets && simpleBudgets.length > 0) {
        // Transform simple budgets to match our interface
        const transformedBudgets: Budget[] = simpleBudgets.map((budget: any) => ({
          id: budget.id,
          companyId: budget.companyId,
          name: budget.name,
          description: budget.description || '',
          scenarioId: 'default',
          periodId: 'default',
          status: budget.isActive ? 'ACTIVE' as const : 'DRAFT' as const,
          totalPlanned: Number(budget.amount),
          totalActual: Number(budget.spentAmount || 0),
          totalVariance: Number(budget.amount) - Number(budget.spentAmount || 0),
          totalVariancePercent: Number(budget.amount) > 0 ? ((Number(budget.amount) - Number(budget.spentAmount || 0)) / Number(budget.amount)) * 100 : 0,
          createdBy: 'system',
          createdAt: budget.createdAt,
          updatedAt: budget.updatedAt
        }))
        
        setBudgets(transformedBudgets)
        toast.success(`✅ Loaded ${transformedBudgets.length} real budgets from database!`)
      } else {
        setBudgets([])
        toast.info('No budgets found for this company')
      }
    } catch (error) {
      setBudgets([])
      toast.error('Failed to load budgets from database')
    }
  }

  const loadForecasts = async () => {
    try {
      const forecasts = await budgetManagementApi.getRollingForecasts(selectedCompany)
      setForecasts(forecasts)
    } catch (error) {
      setForecasts([])
      toast.error('Failed to load forecasts')
    }
  }

  const loadPerformanceMetrics = async () => {
    try {
      const metrics = await budgetManagementApi.getPerformanceMetrics(selectedCompany)
      setPerformanceMetrics(metrics)
    } catch (error) {
      setPerformanceMetrics({
        budgetAccuracy: 0,
        varianceTrend: 'STABLE',
        topPerformingDimensions: [],
        underperformingDimensions: [],
        recommendations: []
      })
      toast.error('Failed to load performance metrics')
    }
  }

  const viewBudgetVariances = async (budget: Budget) => {
    try {
      setViewingBudget(budget)
      const variances = await budgetManagementApi.getVariances(selectedCompany, budget.id)
      setBudgetVariances(variances)
      setActiveTab('budgets') // Stay on budgets tab
      } catch (error) {
        setBudgetVariances([])
        toast.error('Failed to load budget variances')
      }
  }

  const resetBudgetForm = () => {
    setBudgetForm({
      name: '',
      description: '',
      scenarioId: '',
      periodId: '',
      amount: '',
      status: 'DRAFT' as 'DRAFT' | 'ACTIVE' | 'APPROVED' | 'CLOSED',
      categoryId: ''
    })
    setEditingBudget(null)
  }

  const resetForecastForm = () => {
    setForecastForm({
      name: '',
      description: '',
      basePeriod: '',
      forecastPeriods: 12,
      frequency: 'MONTHLY' as 'MONTHLY' | 'QUARTERLY'
    })
    setEditingForecast(null)
  }

  const resetDimensionForm = () => {
    setDimensionForm({
      name: '',
      type: 'DEPARTMENT' as 'DEPARTMENT' | 'PRODUCT_LINE' | 'GEOGRAPHY' | 'COST_CENTER' | 'PROJECT'
    })
    setEditingDimension(null)
  }

  const openCreateBudget = () => {
    resetBudgetForm()
    setBudgetDialogOpen(true)
  }

  const openEditBudget = (budget: Budget) => {
    setEditingBudget(budget)
    setBudgetForm({
      name: budget.name,
      description: budget.description || '',
      scenarioId: budget.scenarioId || '',
      periodId: budget.periodId || '',
      amount: budget.totalPlanned.toString(),
      status: budget.status as 'DRAFT' | 'ACTIVE' | 'APPROVED' | 'CLOSED',
      categoryId: '' // Will be set from budget data if available
    })
    setBudgetDialogOpen(true)
  }

  const openViewBudget = (budget: Budget) => {
    setViewingBudgetDetails(budget)
  }

  const openCreateForecast = () => {
    resetForecastForm()
    setForecastDialogOpen(true)
  }

  const openEditForecast = (forecast: RollingForecast) => {
    setEditingForecast(forecast)
    setForecastForm({
      name: forecast.name,
      description: forecast.description || '',
      basePeriod: forecast.basePeriod,
      forecastPeriods: forecast.forecastPeriods,
      frequency: forecast.frequency
    })
    setForecastDialogOpen(true)
  }

  const openCreateDimension = () => {
    resetDimensionForm()
    setDimensionDialogOpen(true)
  }

  const openEditDimension = (dimension: Dimension) => {
    setEditingDimension(dimension)
    setDimensionForm({
      name: dimension.name,
      type: dimension.type as 'DEPARTMENT' | 'PRODUCT_LINE' | 'GEOGRAPHY' | 'COST_CENTER' | 'PROJECT'
    })
    setDimensionDialogOpen(true)
  }

  const handleBudgetSubmit = async () => {
    try {
      if (!budgetForm.name || !budgetForm.amount || !budgetForm.categoryId) {
        toast.error('Please fill in required fields: name, amount, and category')
        return
      }

      const budgetData = {
        name: budgetForm.name,
        description: budgetForm.description,
        amount: parseFloat(budgetForm.amount),
        companyId: selectedCompany,
        categoryId: budgetForm.categoryId,
        period: 'monthly', // Default period
        startDate: new Date().toISOString().split('T')[0], // Today
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
        alertThreshold: 80, // Default alert threshold
        isActive: budgetForm.status === 'ACTIVE' || budgetForm.status === 'APPROVED'
      }

      if (editingBudget) {
        // Update existing budget
        await simpleBudgetApi.updateBudget(editingBudget.id, budgetData)
        toast.success('Budget updated successfully')
      } else {
        // Create new budget
        await simpleBudgetApi.createBudget(budgetData)
        toast.success('Budget created successfully')
      }

      setBudgetDialogOpen(false)
      resetBudgetForm()
      await loadBudgets() // Refresh the budgets list
    } catch (error) {
      toast.error('Failed to save budget')
    }
  }

  const handleDeleteBudget = async (budget: Budget) => {
    if (window.confirm(`Are you sure you want to delete "${budget.name}"?`)) {
      try {
        await simpleBudgetApi.deleteBudget(budget.id)
        toast.success('Budget deleted successfully')
        await loadBudgets() // Refresh the budgets list
      } catch (error) {
        toast.error('Failed to delete budget')
      }
    }
  }

  const handleForecastSubmit = async () => {
    try {
      if (!forecastForm.name || !forecastForm.basePeriod) {
        toast.error('Please fill in required fields: name and base period')
        return
      }

      const forecastData = {
        name: forecastForm.name,
        description: forecastForm.description,
        basePeriod: forecastForm.basePeriod,
        forecastPeriods: forecastForm.forecastPeriods,
        frequency: forecastForm.frequency,
        companyId: selectedCompany
      }

      if (editingForecast) {
        // Update existing forecast
        await budgetManagementApi.updateRollingForecast(editingForecast.id, forecastData)
        toast.success('Forecast updated successfully')
      } else {
        // Create new forecast
        await budgetManagementApi.createRollingForecast(forecastData)
        toast.success('Forecast created successfully')
      }

      setForecastDialogOpen(false)
      resetForecastForm()
      await loadForecasts() // Refresh the forecasts list
    } catch (error) {
      toast.error('Failed to save forecast')
    }
  }

  const handleDimensionSubmit = async () => {
    try {
      if (!dimensionForm.name) {
        toast.error('Please fill in required fields: name')
        return
      }

      const dimensionData = {
        name: dimensionForm.name,
        type: dimensionForm.type,
        companyId: selectedCompany
      }

      if (editingDimension) {
        // Update existing dimension
        await budgetManagementApi.updateDimension(editingDimension.id, dimensionData)
        toast.success('Dimension updated successfully')
      } else {
        // Create new dimension
        await budgetManagementApi.createDimension(dimensionData)
        toast.success('Dimension created successfully')
      }

      setDimensionDialogOpen(false)
      resetDimensionForm()
      await loadDimensions() // Refresh the dimensions list
    } catch (error) {
      toast.error('Failed to save dimension')
    }
  }

  const handleDeleteForecast = async (forecast: RollingForecast) => {
    if (window.confirm(`Are you sure you want to delete "${forecast.name}"?`)) {
      try {
        await budgetManagementApi.deleteRollingForecast(forecast.id, selectedCompany)
        toast.success('Forecast deleted successfully')
        await loadForecasts() // Refresh the forecasts list
      } catch (error) {
        toast.error('Failed to delete forecast')
      }
    }
  }

  const handleDeleteDimension = async (dimension: Dimension) => {
    if (window.confirm(`Are you sure you want to delete "${dimension.name}"?`)) {
      try {
        await budgetManagementApi.deleteDimension(dimension.id, selectedCompany)
        toast.success('Dimension deleted successfully')
        await loadDimensions() // Refresh the dimensions list
      } catch (error) {
        toast.error('Failed to delete dimension')
      }
    }
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
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="budgets">Budgets</TabsTrigger>
          <TabsTrigger value="forecasts">Forecasts</TabsTrigger>
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
            <Dialog open={budgetDialogOpen} onOpenChange={(open) => {
              setBudgetDialogOpen(open)
              if (!open) resetBudgetForm()
            }}>
              <DialogTrigger asChild>
                <Button onClick={openCreateBudget}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Budget
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingBudget ? 'Edit Budget' : 'Create New Budget'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingBudget ? 'Update budget details' : 'Create a new budget for planning and tracking'}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="budget-name">Budget Name *</Label>
                    <Input 
                      id="budget-name" 
                      placeholder="Enter budget name"
                      value={budgetForm.name}
                      onChange={(e) => setBudgetForm(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="budget-description">Description</Label>
                    <Textarea 
                      id="budget-description" 
                      placeholder="Enter budget description"
                      value={budgetForm.description}
                      onChange={(e) => setBudgetForm(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="budget-category">Category *</Label>
                      {expenseCategories.length === 0 && (
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm" 
                          onClick={seedDefaultCategories}
                        >
                          Create Default Categories
                        </Button>
                      )}
                    </div>
                    <Select 
                      value={budgetForm.categoryId}
                      onValueChange={(value) => setBudgetForm(prev => ({ ...prev, categoryId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={expenseCategories.length === 0 ? "No categories available" : "Select expense category"} />
                      </SelectTrigger>
                      <SelectContent>
                        {expenseCategories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {expenseCategories.length === 0 && (
                      <p className="text-sm text-muted-foreground mt-1">
                        No expense categories found. Click "Create Default Categories" to add some.
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="budget-scenario">Scenario</Label>
                      <Select 
                        value={budgetForm.scenarioId}
                        onValueChange={(value) => setBudgetForm(prev => ({ ...prev, scenarioId: value }))}
                      >
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
                      <Select 
                        value={budgetForm.periodId}
                        onValueChange={(value) => setBudgetForm(prev => ({ ...prev, periodId: value }))}
                      >
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
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="budget-amount">Amount *</Label>
                      <Input 
                        id="budget-amount" 
                        type="number"
                        placeholder="Enter budget amount"
                        value={budgetForm.amount}
                        onChange={(e) => setBudgetForm(prev => ({ ...prev, amount: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="budget-status">Status</Label>
                      <Select 
                        value={budgetForm.status}
                        onValueChange={(value) => setBudgetForm(prev => ({ ...prev, status: value as 'DRAFT' | 'ACTIVE' | 'APPROVED' | 'CLOSED' }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DRAFT">Draft</SelectItem>
                          <SelectItem value="ACTIVE">Active</SelectItem>
                          <SelectItem value="APPROVED">Approved</SelectItem>
                          <SelectItem value="CLOSED">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setBudgetDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleBudgetSubmit} disabled={!budgetForm.name || !budgetForm.amount || !budgetForm.categoryId}>
                      {editingBudget ? 'Update Budget' : 'Create Budget'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* View Budget Details Dialog */}
            <Dialog open={!!viewingBudgetDetails} onOpenChange={(open) => {
              if (!open) setViewingBudgetDetails(null)
            }}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Budget Details</DialogTitle>
                  <DialogDescription>
                    View detailed information about this budget
                  </DialogDescription>
                </DialogHeader>
                {viewingBudgetDetails && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Name</Label>
                        <p className="text-lg font-semibold">{viewingBudgetDetails.name}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                        <div className="mt-1">
                          <Badge className={getStatusColor(viewingBudgetDetails.status)}>
                            {viewingBudgetDetails.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                      <p className="mt-1 text-sm">{viewingBudgetDetails.description || 'No description provided'}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Scenario</Label>
                        <p className="text-sm">{scenarios.find(s => s.id === viewingBudgetDetails.scenarioId)?.name || 'Unknown'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Period</Label>
                        <p className="text-sm">{periods.find(p => p.id === viewingBudgetDetails.periodId)?.name || 'Unknown'}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Planned Amount</Label>
                        <p className="text-lg font-semibold text-blue-600">{formatCurrency(viewingBudgetDetails.totalPlanned)}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Actual Amount</Label>
                        <p className="text-lg font-semibold text-green-600">{formatCurrency(viewingBudgetDetails.totalActual)}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Variance</Label>
                        <p className={`text-lg font-semibold ${viewingBudgetDetails.totalVariance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {formatCurrency(viewingBudgetDetails.totalVariance)} ({formatPercent(viewingBudgetDetails.totalVariancePercent)})
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Created</Label>
                        <p className="text-sm">{new Date(viewingBudgetDetails.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Last Updated</Label>
                        <p className="text-sm">{new Date(viewingBudgetDetails.updatedAt).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                      <Button variant="outline" onClick={() => setViewingBudgetDetails(null)}>
                        Close
                      </Button>
                      <Button onClick={() => {
                        setViewingBudgetDetails(null)
                        openEditBudget(viewingBudgetDetails)
                      }}>
                        Edit Budget
                      </Button>
                    </div>
                  </div>
                )}
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
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => viewBudgetVariances(budget)}
                              title="View Variances"
                            >
                              <BarChart3 className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => openViewBudget(budget)}
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => openEditBudget(budget)}
                              title="Edit Budget"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleDeleteBudget(budget)}
                              title="Delete Budget"
                              className="text-red-600 hover:text-red-700"
                            >
                              <AlertTriangle className="h-4 w-4" />
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

          {/* Budget Variances Section */}
          {viewingBudget && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Variances for {viewingBudget.name}</CardTitle>
                    <CardDescription>
                      Detailed variance analysis for this budget
                    </CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => setViewingBudget(null)}
                  >
                    Close
                  </Button>
                </div>
              </CardHeader>
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
                    {budgetVariances.length > 0 ? (
                      budgetVariances.map((variance, index) => (
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
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                          No variance data available for this budget
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Forecasts Tab */}
        <TabsContent value="forecasts" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Rolling Forecasts</h3>
            <Dialog open={forecastDialogOpen} onOpenChange={(open) => {
              setForecastDialogOpen(open)
              if (!open) resetForecastForm()
            }}>
              <DialogTrigger asChild>
                <Button onClick={openCreateForecast}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Forecast
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingForecast ? 'Edit Rolling Forecast' : 'Create Rolling Forecast'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingForecast ? 'Update forecast details' : 'Create a rolling forecast for future planning'}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="forecast-name">Forecast Name *</Label>
                    <Input 
                      id="forecast-name" 
                      placeholder="Enter forecast name"
                      value={forecastForm.name}
                      onChange={(e) => setForecastForm(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="forecast-description">Description</Label>
                    <Textarea 
                      id="forecast-description" 
                      placeholder="Enter forecast description"
                      value={forecastForm.description}
                      onChange={(e) => setForecastForm(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="base-period">Base Period *</Label>
                      <Input 
                        id="base-period" 
                        type="month"
                        value={forecastForm.basePeriod}
                        onChange={(e) => setForecastForm(prev => ({ ...prev, basePeriod: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="forecast-periods">Forecast Periods</Label>
                      <Input 
                        id="forecast-periods" 
                        type="number" 
                        placeholder="12"
                        value={forecastForm.forecastPeriods}
                        onChange={(e) => setForecastForm(prev => ({ ...prev, forecastPeriods: parseInt(e.target.value) || 12 }))}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="frequency">Frequency</Label>
                    <Select 
                      value={forecastForm.frequency}
                      onValueChange={(value) => setForecastForm(prev => ({ ...prev, frequency: value as 'MONTHLY' | 'QUARTERLY' }))}
                    >
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
                    <Button 
                      onClick={handleForecastSubmit} 
                      disabled={!forecastForm.name || !forecastForm.basePeriod}
                    >
                      {editingForecast ? 'Update Forecast' : 'Create Forecast'}
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
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => openEditForecast(forecast)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleDeleteForecast(forecast)}
                    >
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Dimensions Tab */}
        <TabsContent value="dimensions" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Budget Dimensions</h3>
            <Dialog open={dimensionDialogOpen} onOpenChange={(open) => {
              setDimensionDialogOpen(open)
              if (!open) resetDimensionForm()
            }}>
              <DialogTrigger asChild>
                <Button onClick={openCreateDimension}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Dimension
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>
                    {editingDimension ? 'Edit Budget Dimension' : 'Add Budget Dimension'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingDimension ? 'Update dimension details' : 'Create a new dimension for budget categorization'}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="dimension-name">Dimension Name *</Label>
                    <Input 
                      id="dimension-name" 
                      placeholder="Enter dimension name"
                      value={dimensionForm.name}
                      onChange={(e) => setDimensionForm(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="dimension-type">Type *</Label>
                    <Select 
                      value={dimensionForm.type}
                      onValueChange={(value) => setDimensionForm(prev => ({ ...prev, type: value as any }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DEPARTMENT">Department</SelectItem>
                        <SelectItem value="PROJECT">Project</SelectItem>
                        <SelectItem value="COST_CENTER">Cost Center</SelectItem>
                        <SelectItem value="PRODUCT_LINE">Product Line</SelectItem>
                        <SelectItem value="GEOGRAPHY">Geography</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setDimensionDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleDimensionSubmit}
                      disabled={!dimensionForm.name}
                    >
                      {editingDimension ? 'Update Dimension' : 'Add Dimension'}
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
                  <div className="mt-4 flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => openEditDimension(dimension)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleDeleteDimension(dimension)}
                    >
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
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
