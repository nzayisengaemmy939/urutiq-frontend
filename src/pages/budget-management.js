import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useCallback } from 'react';
import { PageLayout } from '@/components/page-layout';
import { apiService } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart3, TrendingUp, TrendingDown, RefreshCw, Plus, Eye, Edit, AlertTriangle, DollarSign, Target, PieChart, LineChart, Users, Building, MapPin, Package } from 'lucide-react';
import { toast } from 'sonner';
import { useDemoAuth } from '@/hooks/useDemoAuth';
import { budgetManagementApi, simpleBudgetApi } from '@/lib/api/budget-management';
export default function BudgetManagement() {
    const { ready: authReady } = useDemoAuth('budget-management-page');
    const [companies, setCompanies] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState('');
    const [dimensions, setDimensions] = useState([]);
    const [scenarios, setScenarios] = useState([]);
    const [periods, setPeriods] = useState([]);
    const [budgets, setBudgets] = useState([]);
    const [forecasts, setForecasts] = useState([]);
    const [performanceMetrics, setPerformanceMetrics] = useState(null);
    const [expenseCategories, setExpenseCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [viewingBudget, setViewingBudget] = useState(null);
    const [budgetVariances, setBudgetVariances] = useState([]);
    // Dialog states
    const [budgetDialogOpen, setBudgetDialogOpen] = useState(false);
    const [forecastDialogOpen, setForecastDialogOpen] = useState(false);
    const [dimensionDialogOpen, setDimensionDialogOpen] = useState(false);
    // Budget form states
    const [budgetForm, setBudgetForm] = useState({
        name: '',
        description: '',
        scenarioId: '',
        periodId: '',
        amount: '',
        status: 'DRAFT',
        categoryId: ''
    });
    const [editingBudget, setEditingBudget] = useState(null);
    const [viewingBudgetDetails, setViewingBudgetDetails] = useState(null);
    // Forecast form states
    const [forecastForm, setForecastForm] = useState({
        name: '',
        description: '',
        basePeriod: '',
        forecastPeriods: 12,
        frequency: 'MONTHLY'
    });
    const [editingForecast, setEditingForecast] = useState(null);
    // Dimension form states
    const [dimensionForm, setDimensionForm] = useState({
        name: '',
        type: 'DEPARTMENT'
    });
    const [editingDimension, setEditingDimension] = useState(null);
    // Load companies
    useEffect(() => {
        const loadCompanies = async () => {
            try {
                const companies = await budgetManagementApi.getCompanies();
                setCompanies(companies);
                if (companies && companies.length > 0) {
                    setSelectedCompany(companies[0].id);
                }
            }
            catch (error) {
                setCompanies([]);
                toast.error('Failed to load companies');
            }
        };
        loadCompanies();
    }, []);
    // Load expense categories
    useEffect(() => {
        const loadExpenseCategories = async () => {
            try {
                const response = await apiService.get(`/api/expense-categories?companyId=${selectedCompany}`);
                setExpenseCategories(response || []);
            }
            catch (error) {
                setExpenseCategories([]);
            }
        };
        if (selectedCompany) {
            loadExpenseCategories();
        }
    }, [selectedCompany]);
    // Seed default categories
    const seedDefaultCategories = async () => {
        try {
            const response = await apiService.post(`/api/expense-categories/seed/${selectedCompany}`);
            toast.success('Default categories created successfully');
            // Reload categories
            const categoriesResponse = await apiService.get(`/api/expense-categories?companyId=${selectedCompany}`);
            setExpenseCategories(categoriesResponse || []);
        }
        catch (error) {
            toast.error('Failed to create default categories');
        }
    };
    const loadAllData = useCallback(async () => {
        if (!selectedCompany) {
            return;
        }
        setLoading(true);
        try {
            // Get demo token first
            const tokenResponse = await apiService.getDemoToken('user_demo', ['admin']);
            // Store token in localStorage for API calls
            localStorage.setItem('auth_token', tokenResponse.token);
            localStorage.setItem('tenant_id', 'tenant_demo');
            await Promise.all([
                loadDimensions(),
                loadScenarios(),
                loadPeriods(),
                loadBudgets(),
                loadForecasts(),
                loadPerformanceMetrics()
            ]);
        }
        catch (error) {
            toast.error('Failed to load budget data');
        }
        finally {
            setLoading(false);
        }
    }, [selectedCompany]);
    // Load data when company changes
    useEffect(() => {
        if (selectedCompany) {
            loadAllData();
        }
    }, [selectedCompany, loadAllData]);
    const loadDimensions = async () => {
        try {
            const dimensions = await budgetManagementApi.getDimensions(selectedCompany);
            setDimensions(dimensions);
        }
        catch (error) {
            setDimensions([]);
            toast.error('Failed to load dimensions');
        }
    };
    const loadScenarios = async () => {
        try {
            const scenarios = await budgetManagementApi.getScenarios(selectedCompany);
            setScenarios(scenarios);
        }
        catch (error) {
            setScenarios([]);
            toast.error('Failed to load scenarios');
        }
    };
    const loadPeriods = async () => {
        try {
            const periods = await budgetManagementApi.getPeriods(selectedCompany);
            setPeriods(periods);
        }
        catch (error) {
            setPeriods([]);
            toast.error('Failed to load periods');
        }
    };
    const loadBudgets = async () => {
        try {
            const simpleBudgets = await simpleBudgetApi.getBudgets(selectedCompany);
            if (simpleBudgets && simpleBudgets.length > 0) {
                // Transform simple budgets to match our interface
                const transformedBudgets = simpleBudgets.map((budget) => ({
                    id: budget.id,
                    companyId: budget.companyId,
                    name: budget.name,
                    description: budget.description || '',
                    scenarioId: 'default',
                    periodId: 'default',
                    status: budget.isActive ? 'ACTIVE' : 'DRAFT',
                    totalPlanned: Number(budget.amount),
                    totalActual: Number(budget.spentAmount || 0),
                    totalVariance: Number(budget.amount) - Number(budget.spentAmount || 0),
                    totalVariancePercent: Number(budget.amount) > 0 ? ((Number(budget.amount) - Number(budget.spentAmount || 0)) / Number(budget.amount)) * 100 : 0,
                    createdBy: 'system',
                    createdAt: budget.createdAt,
                    updatedAt: budget.updatedAt
                }));
                setBudgets(transformedBudgets);
                toast.success(`✅ Loaded ${transformedBudgets.length} real budgets from database!`);
            }
            else {
                setBudgets([]);
                toast.info('No budgets found for this company');
            }
        }
        catch (error) {
            setBudgets([]);
            toast.error('Failed to load budgets from database');
        }
    };
    const loadForecasts = async () => {
        try {
            const forecasts = await budgetManagementApi.getRollingForecasts(selectedCompany);
            setForecasts(forecasts);
        }
        catch (error) {
            setForecasts([]);
            toast.error('Failed to load forecasts');
        }
    };
    const loadPerformanceMetrics = async () => {
        try {
            const metrics = await budgetManagementApi.getPerformanceMetrics(selectedCompany);
            setPerformanceMetrics(metrics);
        }
        catch (error) {
            setPerformanceMetrics({
                budgetAccuracy: 0,
                varianceTrend: 'STABLE',
                topPerformingDimensions: [],
                underperformingDimensions: [],
                recommendations: []
            });
            toast.error('Failed to load performance metrics');
        }
    };
    const viewBudgetVariances = async (budget) => {
        try {
            setViewingBudget(budget);
            const variances = await budgetManagementApi.getVariances(selectedCompany, budget.id);
            setBudgetVariances(variances);
            setActiveTab('budgets'); // Stay on budgets tab
        }
        catch (error) {
            setBudgetVariances([]);
            toast.error('Failed to load budget variances');
        }
    };
    const resetBudgetForm = () => {
        setBudgetForm({
            name: '',
            description: '',
            scenarioId: '',
            periodId: '',
            amount: '',
            status: 'DRAFT',
            categoryId: ''
        });
        setEditingBudget(null);
    };
    const resetForecastForm = () => {
        setForecastForm({
            name: '',
            description: '',
            basePeriod: '',
            forecastPeriods: 12,
            frequency: 'MONTHLY'
        });
        setEditingForecast(null);
    };
    const resetDimensionForm = () => {
        setDimensionForm({
            name: '',
            type: 'DEPARTMENT'
        });
        setEditingDimension(null);
    };
    const openCreateBudget = () => {
        resetBudgetForm();
        setBudgetDialogOpen(true);
    };
    const openEditBudget = (budget) => {
        setEditingBudget(budget);
        setBudgetForm({
            name: budget.name,
            description: budget.description || '',
            scenarioId: budget.scenarioId || '',
            periodId: budget.periodId || '',
            amount: budget.totalPlanned.toString(),
            status: budget.status,
            categoryId: '' // Will be set from budget data if available
        });
        setBudgetDialogOpen(true);
    };
    const openViewBudget = (budget) => {
        setViewingBudgetDetails(budget);
    };
    const openCreateForecast = () => {
        resetForecastForm();
        setForecastDialogOpen(true);
    };
    const openEditForecast = (forecast) => {
        setEditingForecast(forecast);
        setForecastForm({
            name: forecast.name,
            description: forecast.description || '',
            basePeriod: forecast.basePeriod,
            forecastPeriods: forecast.forecastPeriods,
            frequency: forecast.frequency
        });
        setForecastDialogOpen(true);
    };
    const openCreateDimension = () => {
        resetDimensionForm();
        setDimensionDialogOpen(true);
    };
    const openEditDimension = (dimension) => {
        setEditingDimension(dimension);
        setDimensionForm({
            name: dimension.name,
            type: dimension.type
        });
        setDimensionDialogOpen(true);
    };
    const handleBudgetSubmit = async () => {
        try {
            if (!budgetForm.name || !budgetForm.amount || !budgetForm.categoryId) {
                toast.error('Please fill in required fields: name, amount, and category');
                return;
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
            };
            if (editingBudget) {
                // Update existing budget
                await simpleBudgetApi.updateBudget(editingBudget.id, budgetData);
                toast.success('Budget updated successfully');
            }
            else {
                // Create new budget
                await simpleBudgetApi.createBudget(budgetData);
                toast.success('Budget created successfully');
            }
            setBudgetDialogOpen(false);
            resetBudgetForm();
            await loadBudgets(); // Refresh the budgets list
        }
        catch (error) {
            toast.error('Failed to save budget');
        }
    };
    const handleDeleteBudget = async (budget) => {
        if (window.confirm(`Are you sure you want to delete "${budget.name}"?`)) {
            try {
                await simpleBudgetApi.deleteBudget(budget.id);
                toast.success('Budget deleted successfully');
                await loadBudgets(); // Refresh the budgets list
            }
            catch (error) {
                toast.error('Failed to delete budget');
            }
        }
    };
    const handleForecastSubmit = async () => {
        try {
            if (!forecastForm.name || !forecastForm.basePeriod) {
                toast.error('Please fill in required fields: name and base period');
                return;
            }
            const forecastData = {
                name: forecastForm.name,
                description: forecastForm.description,
                basePeriod: forecastForm.basePeriod,
                forecastPeriods: forecastForm.forecastPeriods,
                frequency: forecastForm.frequency,
                companyId: selectedCompany
            };
            if (editingForecast) {
                // Update existing forecast
                await budgetManagementApi.updateRollingForecast(editingForecast.id, forecastData);
                toast.success('Forecast updated successfully');
            }
            else {
                // Create new forecast
                await budgetManagementApi.createRollingForecast(forecastData);
                toast.success('Forecast created successfully');
            }
            setForecastDialogOpen(false);
            resetForecastForm();
            await loadForecasts(); // Refresh the forecasts list
        }
        catch (error) {
            toast.error('Failed to save forecast');
        }
    };
    const handleDimensionSubmit = async () => {
        try {
            if (!dimensionForm.name) {
                toast.error('Please fill in required fields: name');
                return;
            }
            const dimensionData = {
                name: dimensionForm.name,
                type: dimensionForm.type,
                companyId: selectedCompany
            };
            if (editingDimension) {
                // Update existing dimension
                await budgetManagementApi.updateDimension(editingDimension.id, dimensionData);
                toast.success('Dimension updated successfully');
            }
            else {
                // Create new dimension
                await budgetManagementApi.createDimension(dimensionData);
                toast.success('Dimension created successfully');
            }
            setDimensionDialogOpen(false);
            resetDimensionForm();
            await loadDimensions(); // Refresh the dimensions list
        }
        catch (error) {
            toast.error('Failed to save dimension');
        }
    };
    const handleDeleteForecast = async (forecast) => {
        if (window.confirm(`Are you sure you want to delete "${forecast.name}"?`)) {
            try {
                await budgetManagementApi.deleteRollingForecast(forecast.id, selectedCompany);
                toast.success('Forecast deleted successfully');
                await loadForecasts(); // Refresh the forecasts list
            }
            catch (error) {
                toast.error('Failed to delete forecast');
            }
        }
    };
    const handleDeleteDimension = async (dimension) => {
        if (window.confirm(`Are you sure you want to delete "${dimension.name}"?`)) {
            try {
                await budgetManagementApi.deleteDimension(dimension.id, selectedCompany);
                toast.success('Dimension deleted successfully');
                await loadDimensions(); // Refresh the dimensions list
            }
            catch (error) {
                toast.error('Failed to delete dimension');
            }
        }
    };
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };
    const formatPercent = (value) => {
        return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'DRAFT': return 'bg-yellow-100 text-yellow-800';
            case 'APPROVED': return 'bg-blue-100 text-blue-800';
            case 'ACTIVE': return 'bg-green-100 text-green-800';
            case 'CLOSED': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    const getTrendIcon = (trend) => {
        switch (trend) {
            case 'IMPROVING': return _jsx(TrendingUp, { className: "h-4 w-4 text-green-500" });
            case 'DETERIORATING': return _jsx(TrendingDown, { className: "h-4 w-4 text-red-500" });
            case 'STABLE': return _jsx(BarChart3, { className: "h-4 w-4 text-gray-500" });
            default: return _jsx(BarChart3, { className: "h-4 w-4 text-gray-500" });
        }
    };
    const getRiskColor = (risk) => {
        switch (risk) {
            case 'LOW': return 'bg-green-100 text-green-800';
            case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
            case 'HIGH': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    const getDimensionIcon = (type) => {
        switch (type) {
            case 'DEPARTMENT': return _jsx(Users, { className: "h-4 w-4" });
            case 'PROJECT': return _jsx(Target, { className: "h-4 w-4" });
            case 'COST_CENTER': return _jsx(Building, { className: "h-4 w-4" });
            case 'PRODUCT_LINE': return _jsx(Package, { className: "h-4 w-4" });
            case 'GEOGRAPHY': return _jsx(MapPin, { className: "h-4 w-4" });
            case 'CUSTOM': return _jsx(BarChart3, { className: "h-4 w-4" });
            default: return _jsx(BarChart3, { className: "h-4 w-4" });
        }
    };
    if (!authReady) {
        return (_jsx(PageLayout, { title: "Budget Management", description: "Create budgets, manage forecasts, and track performance", children: _jsx("div", { className: "flex items-center justify-center h-64", children: _jsxs("div", { className: "text-center", children: [_jsx(RefreshCw, { className: "h-8 w-8 animate-spin mx-auto mb-4" }), _jsx("p", { className: "text-muted-foreground", children: "Loading budget management..." })] }) }) }));
    }
    return (_jsx(PageLayout, { title: "Budget Management", description: "Create budgets, manage forecasts, and track performance", breadcrumbs: [
            { label: 'Finance', href: '/finance' },
            { label: 'Budget Management', href: '/budget-management' }
        ], children: _jsxs("div", { className: "space-y-6", children: [_jsx("div", { className: "flex items-center justify-end", children: _jsx("div", { className: "flex gap-2", children: _jsxs(Button, { variant: "outline", onClick: loadAllData, disabled: loading, children: [_jsx(RefreshCw, { className: `h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}` }), "Refresh"] }) }) }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Company Selection" }) }), _jsx(CardContent, { children: _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: _jsxs("div", { children: [_jsx(Label, { htmlFor: "company", children: "Company" }), _jsxs(Select, { value: selectedCompany, onValueChange: setSelectedCompany, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select company" }) }), _jsx(SelectContent, { children: companies.map((company) => (_jsx(SelectItem, { value: company.id, children: company.name }, company.id))) })] })] }) }) })] }), _jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, children: [_jsxs(TabsList, { className: "grid w-full grid-cols-5", children: [_jsx(TabsTrigger, { value: "overview", children: "Overview" }), _jsx(TabsTrigger, { value: "budgets", children: "Budgets" }), _jsx(TabsTrigger, { value: "forecasts", children: "Forecasts" }), _jsx(TabsTrigger, { value: "dimensions", children: "Dimensions" }), _jsx(TabsTrigger, { value: "reports", children: "Reports" })] }), _jsxs(TabsContent, { value: "overview", className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Total Budgets" }), _jsx(BarChart3, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: budgets.length }), _jsxs("p", { className: "text-xs text-muted-foreground", children: [budgets.filter(b => b.status === 'ACTIVE').length, " active"] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Total Planned" }), _jsx(DollarSign, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: formatCurrency(budgets.reduce((sum, b) => sum + b.totalPlanned, 0)) }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Across all budgets" })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Total Actual" }), _jsx(Target, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: formatCurrency(budgets.reduce((sum, b) => sum + b.totalActual, 0)) }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Actual spending" })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Budget Accuracy" }), _jsx(PieChart, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: performanceMetrics ? `${performanceMetrics.budgetAccuracy.toFixed(1)}%` : 'N/A' }), _jsxs("p", { className: "text-xs text-muted-foreground", children: [performanceMetrics?.varianceTrend || 'N/A', " trend"] })] })] })] }), performanceMetrics && (_jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(TrendingUp, { className: "h-5 w-5 text-green-500" }), "Top Performing Dimensions"] }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-2", children: performanceMetrics.topPerformingDimensions.map((dim, index) => (_jsxs("div", { className: "flex justify-between items-center p-2 border rounded", children: [_jsx("span", { className: "font-medium", children: dim.dimensionName }), _jsxs(Badge, { variant: "default", children: [dim.performance.toFixed(1), "%"] })] }, index))) }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(TrendingDown, { className: "h-5 w-5 text-red-500" }), "Underperforming Dimensions"] }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-2", children: performanceMetrics.underperformingDimensions.map((dim, index) => (_jsxs("div", { className: "flex justify-between items-center p-2 border rounded", children: [_jsx("span", { className: "font-medium", children: dim.dimensionName }), _jsxs(Badge, { variant: "destructive", children: [dim.performance.toFixed(1), "%"] })] }, index))) }) })] })] })), performanceMetrics && performanceMetrics.recommendations.length > 0 && (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(AlertTriangle, { className: "h-5 w-5 text-yellow-500" }), "Recommendations"] }) }), _jsx(CardContent, { children: _jsx("ul", { className: "space-y-2", children: performanceMetrics.recommendations.map((rec, index) => (_jsxs("li", { className: "flex items-start gap-2", children: [_jsx("div", { className: "w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" }), _jsx("span", { className: "text-sm", children: rec })] }, index))) }) })] }))] }), _jsxs(TabsContent, { value: "budgets", className: "space-y-4", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h3", { className: "text-lg font-semibold", children: "Budgets" }), _jsxs(Dialog, { open: budgetDialogOpen, onOpenChange: (open) => {
                                                setBudgetDialogOpen(open);
                                                if (!open)
                                                    resetBudgetForm();
                                            }, children: [_jsx(DialogTrigger, { asChild: true, children: _jsxs(Button, { onClick: openCreateBudget, children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "Create Budget"] }) }), _jsxs(DialogContent, { className: "max-w-2xl", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: editingBudget ? 'Edit Budget' : 'Create New Budget' }), _jsx(DialogDescription, { children: editingBudget ? 'Update budget details' : 'Create a new budget for planning and tracking' })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "budget-name", children: "Budget Name *" }), _jsx(Input, { id: "budget-name", placeholder: "Enter budget name", value: budgetForm.name, onChange: (e) => setBudgetForm(prev => ({ ...prev, name: e.target.value })) })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "budget-description", children: "Description" }), _jsx(Textarea, { id: "budget-description", placeholder: "Enter budget description", value: budgetForm.description, onChange: (e) => setBudgetForm(prev => ({ ...prev, description: e.target.value })) })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx(Label, { htmlFor: "budget-category", children: "Category *" }), expenseCategories.length === 0 && (_jsx(Button, { type: "button", variant: "outline", size: "sm", onClick: seedDefaultCategories, children: "Create Default Categories" }))] }), _jsxs(Select, { value: budgetForm.categoryId, onValueChange: (value) => setBudgetForm(prev => ({ ...prev, categoryId: value })), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: expenseCategories.length === 0 ? "No categories available" : "Select expense category" }) }), _jsx(SelectContent, { children: expenseCategories.map((category) => (_jsx(SelectItem, { value: category.id, children: category.name }, category.id))) })] }), expenseCategories.length === 0 && (_jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "No expense categories found. Click \"Create Default Categories\" to add some." }))] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "budget-scenario", children: "Scenario" }), _jsxs(Select, { value: budgetForm.scenarioId, onValueChange: (value) => setBudgetForm(prev => ({ ...prev, scenarioId: value })), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select scenario" }) }), _jsx(SelectContent, { children: scenarios.map((scenario) => (_jsx(SelectItem, { value: scenario.id, children: scenario.name }, scenario.id))) })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "budget-period", children: "Period" }), _jsxs(Select, { value: budgetForm.periodId, onValueChange: (value) => setBudgetForm(prev => ({ ...prev, periodId: value })), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select period" }) }), _jsx(SelectContent, { children: periods.map((period) => (_jsx(SelectItem, { value: period.id, children: period.name }, period.id))) })] })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "budget-amount", children: "Amount *" }), _jsx(Input, { id: "budget-amount", type: "number", placeholder: "Enter budget amount", value: budgetForm.amount, onChange: (e) => setBudgetForm(prev => ({ ...prev, amount: e.target.value })) })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "budget-status", children: "Status" }), _jsxs(Select, { value: budgetForm.status, onValueChange: (value) => setBudgetForm(prev => ({ ...prev, status: value })), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select status" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "DRAFT", children: "Draft" }), _jsx(SelectItem, { value: "ACTIVE", children: "Active" }), _jsx(SelectItem, { value: "APPROVED", children: "Approved" }), _jsx(SelectItem, { value: "CLOSED", children: "Closed" })] })] })] })] }), _jsxs("div", { className: "flex justify-end gap-2", children: [_jsx(Button, { variant: "outline", onClick: () => setBudgetDialogOpen(false), children: "Cancel" }), _jsx(Button, { onClick: handleBudgetSubmit, disabled: !budgetForm.name || !budgetForm.amount || !budgetForm.categoryId, children: editingBudget ? 'Update Budget' : 'Create Budget' })] })] })] })] }), _jsx(Dialog, { open: !!viewingBudgetDetails, onOpenChange: (open) => {
                                                if (!open)
                                                    setViewingBudgetDetails(null);
                                            }, children: _jsxs(DialogContent, { className: "max-w-2xl", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Budget Details" }), _jsx(DialogDescription, { children: "View detailed information about this budget" })] }), viewingBudgetDetails && (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { className: "text-sm font-medium text-muted-foreground", children: "Name" }), _jsx("p", { className: "text-lg font-semibold", children: viewingBudgetDetails.name })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-sm font-medium text-muted-foreground", children: "Status" }), _jsx("div", { className: "mt-1", children: _jsx(Badge, { className: getStatusColor(viewingBudgetDetails.status), children: viewingBudgetDetails.status }) })] })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-sm font-medium text-muted-foreground", children: "Description" }), _jsx("p", { className: "mt-1 text-sm", children: viewingBudgetDetails.description || 'No description provided' })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { className: "text-sm font-medium text-muted-foreground", children: "Scenario" }), _jsx("p", { className: "text-sm", children: scenarios.find(s => s.id === viewingBudgetDetails.scenarioId)?.name || 'Unknown' })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-sm font-medium text-muted-foreground", children: "Period" }), _jsx("p", { className: "text-sm", children: periods.find(p => p.id === viewingBudgetDetails.periodId)?.name || 'Unknown' })] })] }), _jsxs("div", { className: "grid grid-cols-3 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { className: "text-sm font-medium text-muted-foreground", children: "Planned Amount" }), _jsx("p", { className: "text-lg font-semibold text-blue-600", children: formatCurrency(viewingBudgetDetails.totalPlanned) })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-sm font-medium text-muted-foreground", children: "Actual Amount" }), _jsx("p", { className: "text-lg font-semibold text-green-600", children: formatCurrency(viewingBudgetDetails.totalActual) })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-sm font-medium text-muted-foreground", children: "Variance" }), _jsxs("p", { className: `text-lg font-semibold ${viewingBudgetDetails.totalVariance < 0 ? 'text-red-600' : 'text-green-600'}`, children: [formatCurrency(viewingBudgetDetails.totalVariance), " (", formatPercent(viewingBudgetDetails.totalVariancePercent), ")"] })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { className: "text-sm font-medium text-muted-foreground", children: "Created" }), _jsx("p", { className: "text-sm", children: new Date(viewingBudgetDetails.createdAt).toLocaleDateString() })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-sm font-medium text-muted-foreground", children: "Last Updated" }), _jsx("p", { className: "text-sm", children: new Date(viewingBudgetDetails.updatedAt).toLocaleDateString() })] })] }), _jsxs("div", { className: "flex justify-end gap-2 pt-4", children: [_jsx(Button, { variant: "outline", onClick: () => setViewingBudgetDetails(null), children: "Close" }), _jsx(Button, { onClick: () => {
                                                                            setViewingBudgetDetails(null);
                                                                            openEditBudget(viewingBudgetDetails);
                                                                        }, children: "Edit Budget" })] })] }))] }) })] }), _jsx(Card, { children: _jsx(CardContent, { className: "p-0", children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { children: "Name" }), _jsx(TableHead, { children: "Scenario" }), _jsx(TableHead, { children: "Period" }), _jsx(TableHead, { children: "Status" }), _jsx(TableHead, { children: "Planned" }), _jsx(TableHead, { children: "Actual" }), _jsx(TableHead, { children: "Variance" }), _jsx(TableHead, { children: "Actions" })] }) }), _jsx(TableBody, { children: budgets.map((budget) => {
                                                        const scenario = scenarios.find(s => s.id === budget.scenarioId);
                                                        const period = periods.find(p => p.id === budget.periodId);
                                                        return (_jsxs(TableRow, { children: [_jsx(TableCell, { className: "font-medium", children: budget.name }), _jsx(TableCell, { children: scenario?.name || 'Unknown' }), _jsx(TableCell, { children: period?.name || 'Unknown' }), _jsx(TableCell, { children: _jsx(Badge, { className: getStatusColor(budget.status), children: budget.status }) }), _jsx(TableCell, { children: formatCurrency(budget.totalPlanned) }), _jsx(TableCell, { children: formatCurrency(budget.totalActual) }), _jsxs(TableCell, { className: budget.totalVariance < 0 ? 'text-red-600' : 'text-green-600', children: [formatCurrency(budget.totalVariance), " (", formatPercent(budget.totalVariancePercent), ")"] }), _jsx(TableCell, { children: _jsxs("div", { className: "flex gap-1", children: [_jsx(Button, { variant: "outline", size: "sm", onClick: () => viewBudgetVariances(budget), title: "View Variances", children: _jsx(BarChart3, { className: "h-4 w-4" }) }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => openViewBudget(budget), title: "View Details", children: _jsx(Eye, { className: "h-4 w-4" }) }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => openEditBudget(budget), title: "Edit Budget", children: _jsx(Edit, { className: "h-4 w-4" }) }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => handleDeleteBudget(budget), title: "Delete Budget", className: "text-red-600 hover:text-red-700", children: _jsx(AlertTriangle, { className: "h-4 w-4" }) })] }) })] }, budget.id));
                                                    }) })] }) }) }), viewingBudget && (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { children: [_jsxs(CardTitle, { children: ["Variances for ", viewingBudget.name] }), _jsx(CardDescription, { children: "Detailed variance analysis for this budget" })] }), _jsx(Button, { variant: "outline", onClick: () => setViewingBudget(null), children: "Close" })] }) }), _jsx(CardContent, { className: "p-0", children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { children: "Account" }), _jsx(TableHead, { children: "Dimension" }), _jsx(TableHead, { children: "Planned" }), _jsx(TableHead, { children: "Actual" }), _jsx(TableHead, { children: "Variance" }), _jsx(TableHead, { children: "Trend" }), _jsx(TableHead, { children: "Risk" })] }) }), _jsx(TableBody, { children: budgetVariances.length > 0 ? (budgetVariances.map((variance, index) => (_jsxs(TableRow, { children: [_jsx(TableCell, { className: "font-medium", children: variance.accountName }), _jsx(TableCell, { children: variance.dimensionName }), _jsx(TableCell, { children: formatCurrency(variance.plannedAmount) }), _jsx(TableCell, { children: formatCurrency(variance.actualAmount) }), _jsxs(TableCell, { className: variance.variance < 0 ? 'text-red-600' : 'text-green-600', children: [formatCurrency(variance.variance), " (", formatPercent(variance.variancePercent), ")"] }), _jsx(TableCell, { children: _jsxs("div", { className: "flex items-center gap-1", children: [getTrendIcon(variance.trend), _jsx("span", { className: "text-sm", children: variance.trend })] }) }), _jsx(TableCell, { children: _jsx(Badge, { className: getRiskColor(variance.riskLevel), children: variance.riskLevel }) })] }, index)))) : (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 7, className: "text-center text-muted-foreground py-8", children: "No variance data available for this budget" }) })) })] }) })] }))] }), _jsxs(TabsContent, { value: "forecasts", className: "space-y-4", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h3", { className: "text-lg font-semibold", children: "Rolling Forecasts" }), _jsxs(Dialog, { open: forecastDialogOpen, onOpenChange: (open) => {
                                                setForecastDialogOpen(open);
                                                if (!open)
                                                    resetForecastForm();
                                            }, children: [_jsx(DialogTrigger, { asChild: true, children: _jsxs(Button, { onClick: openCreateForecast, children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "Create Forecast"] }) }), _jsxs(DialogContent, { className: "max-w-2xl", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: editingForecast ? 'Edit Rolling Forecast' : 'Create Rolling Forecast' }), _jsx(DialogDescription, { children: editingForecast ? 'Update forecast details' : 'Create a rolling forecast for future planning' })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "forecast-name", children: "Forecast Name *" }), _jsx(Input, { id: "forecast-name", placeholder: "Enter forecast name", value: forecastForm.name, onChange: (e) => setForecastForm(prev => ({ ...prev, name: e.target.value })) })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "forecast-description", children: "Description" }), _jsx(Textarea, { id: "forecast-description", placeholder: "Enter forecast description", value: forecastForm.description, onChange: (e) => setForecastForm(prev => ({ ...prev, description: e.target.value })) })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "base-period", children: "Base Period *" }), _jsx(Input, { id: "base-period", type: "month", value: forecastForm.basePeriod, onChange: (e) => setForecastForm(prev => ({ ...prev, basePeriod: e.target.value })) })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "forecast-periods", children: "Forecast Periods" }), _jsx(Input, { id: "forecast-periods", type: "number", placeholder: "12", value: forecastForm.forecastPeriods, onChange: (e) => setForecastForm(prev => ({ ...prev, forecastPeriods: parseInt(e.target.value) || 12 })) })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "frequency", children: "Frequency" }), _jsxs(Select, { value: forecastForm.frequency, onValueChange: (value) => setForecastForm(prev => ({ ...prev, frequency: value })), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select frequency" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "MONTHLY", children: "Monthly" }), _jsx(SelectItem, { value: "QUARTERLY", children: "Quarterly" })] })] })] }), _jsxs("div", { className: "flex justify-end gap-2", children: [_jsx(Button, { variant: "outline", onClick: () => setForecastDialogOpen(false), children: "Cancel" }), _jsx(Button, { onClick: handleForecastSubmit, disabled: !forecastForm.name || !forecastForm.basePeriod, children: editingForecast ? 'Update Forecast' : 'Create Forecast' })] })] })] })] })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: forecasts.map((forecast) => (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center justify-between", children: [_jsx("span", { children: forecast.name }), _jsx(Badge, { variant: forecast.isActive ? 'default' : 'secondary', children: forecast.isActive ? 'Active' : 'Inactive' })] }), _jsx(CardDescription, { children: forecast.description })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-sm text-muted-foreground", children: "Base Period:" }), _jsx("span", { className: "text-sm font-medium", children: forecast.basePeriod })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-sm text-muted-foreground", children: "Periods:" }), _jsx("span", { className: "text-sm font-medium", children: forecast.forecastPeriods })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-sm text-muted-foreground", children: "Frequency:" }), _jsx("span", { className: "text-sm font-medium", children: forecast.frequency })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-sm text-muted-foreground", children: "Last Updated:" }), _jsx("span", { className: "text-sm font-medium", children: new Date(forecast.lastUpdated).toLocaleDateString() })] })] }), _jsxs("div", { className: "mt-4 flex gap-2", children: [_jsxs(Button, { variant: "outline", size: "sm", className: "flex-1", onClick: () => openEditForecast(forecast), children: [_jsx(Edit, { className: "h-4 w-4 mr-2" }), "Edit"] }), _jsxs(Button, { variant: "outline", size: "sm", className: "flex-1", onClick: () => handleDeleteForecast(forecast), children: [_jsx(AlertTriangle, { className: "h-4 w-4 mr-2" }), "Delete"] })] })] })] }, forecast.id))) })] }), _jsxs(TabsContent, { value: "dimensions", className: "space-y-4", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h3", { className: "text-lg font-semibold", children: "Budget Dimensions" }), _jsxs(Dialog, { open: dimensionDialogOpen, onOpenChange: (open) => {
                                                setDimensionDialogOpen(open);
                                                if (!open)
                                                    resetDimensionForm();
                                            }, children: [_jsx(DialogTrigger, { asChild: true, children: _jsxs(Button, { onClick: openCreateDimension, children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "Add Dimension"] }) }), _jsxs(DialogContent, { className: "max-w-lg", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: editingDimension ? 'Edit Budget Dimension' : 'Add Budget Dimension' }), _jsx(DialogDescription, { children: editingDimension ? 'Update dimension details' : 'Create a new dimension for budget categorization' })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "dimension-name", children: "Dimension Name *" }), _jsx(Input, { id: "dimension-name", placeholder: "Enter dimension name", value: dimensionForm.name, onChange: (e) => setDimensionForm(prev => ({ ...prev, name: e.target.value })) })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "dimension-type", children: "Type *" }), _jsxs(Select, { value: dimensionForm.type, onValueChange: (value) => setDimensionForm(prev => ({ ...prev, type: value })), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select type" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "DEPARTMENT", children: "Department" }), _jsx(SelectItem, { value: "PROJECT", children: "Project" }), _jsx(SelectItem, { value: "COST_CENTER", children: "Cost Center" }), _jsx(SelectItem, { value: "PRODUCT_LINE", children: "Product Line" }), _jsx(SelectItem, { value: "GEOGRAPHY", children: "Geography" })] })] })] }), _jsxs("div", { className: "flex justify-end gap-2", children: [_jsx(Button, { variant: "outline", onClick: () => setDimensionDialogOpen(false), children: "Cancel" }), _jsx(Button, { onClick: handleDimensionSubmit, disabled: !dimensionForm.name, children: editingDimension ? 'Update Dimension' : 'Add Dimension' })] })] })] })] })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: dimensions.map((dimension) => (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [getDimensionIcon(dimension.type), dimension.name] }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-sm text-muted-foreground", children: "Type:" }), _jsx("span", { className: "text-sm font-medium", children: dimension.type })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-sm text-muted-foreground", children: "Status:" }), _jsx(Badge, { variant: dimension.isActive ? 'default' : 'secondary', children: dimension.isActive ? 'Active' : 'Inactive' })] })] }), _jsxs("div", { className: "mt-4 flex gap-2", children: [_jsxs(Button, { variant: "outline", size: "sm", className: "flex-1", onClick: () => openEditDimension(dimension), children: [_jsx(Edit, { className: "h-4 w-4 mr-2" }), "Edit"] }), _jsxs(Button, { variant: "outline", size: "sm", className: "flex-1", onClick: () => handleDeleteDimension(dimension), children: [_jsx(AlertTriangle, { className: "h-4 w-4 mr-2" }), "Delete"] })] })] })] }, dimension.id))) })] }), _jsx(TabsContent, { value: "reports", className: "space-y-4", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Budget Reports" }), _jsx(CardDescription, { children: "Generate comprehensive budget reports" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsxs(Button, { variant: "outline", className: "h-20 flex flex-col gap-2", children: [_jsx(BarChart3, { className: "h-6 w-6" }), _jsx("span", { children: "Summary Report" })] }), _jsxs(Button, { variant: "outline", className: "h-20 flex flex-col gap-2", children: [_jsx(PieChart, { className: "h-6 w-6" }), _jsx("span", { children: "Detailed Report" })] }), _jsxs(Button, { variant: "outline", className: "h-20 flex flex-col gap-2", children: [_jsx(TrendingUp, { className: "h-6 w-6" }), _jsx("span", { children: "Variance Report" })] }), _jsxs(Button, { variant: "outline", className: "h-20 flex flex-col gap-2", children: [_jsx(LineChart, { className: "h-6 w-6" }), _jsx("span", { children: "Forecast Report" })] })] }) })] }) })] })] }) }));
}
