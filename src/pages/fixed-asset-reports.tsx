import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/auth-context';
import { getApiUrl } from '../lib/config';
import { 
  BarChart3, 
  TrendingDown, 
  TrendingUp, 
  FileText, 
  Download, 
  Calendar, 
  Building2, 
  Calculator,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  PieChart,
  LineChart,
  Filter,
  Search
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { MoonLoader } from '../components/ui/moon-loader';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { format } from 'date-fns';
import { PageLayout } from '../components/page-layout';
import { companiesApi } from '../lib/api/accounting';
import { getCompanyId } from '../lib/config';

// API functions
const getApiBaseUrl = () => {
  return getApiUrl('');
};

const fetchAssetRegister = async (companyId: string, filters: any = {}) => {
  const params = new URLSearchParams({ companyId, ...filters });
  const response = await fetch(`${getApiBaseUrl()}/api/fixed-assets/reports/asset-register?${params}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo',
      'x-company-id': companyId,
    },
  });
  const data = await response.json();
  return data.assetRegister || [];
};

const fetchDepreciationSchedule = async (companyId: string, year: number, filters: any = {}) => {
  const params = new URLSearchParams({ companyId, year: year.toString(), ...filters });
  const response = await fetch(`${getApiBaseUrl()}/api/fixed-assets/reports/depreciation-schedule?${params}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo',
      'x-company-id': companyId,
    },
  });
  const data = await response.json();
  return data.depreciationSchedule || [];
};

const fetchCategorySummary = async (companyId: string) => {
  const response = await fetch(`${getApiBaseUrl()}/api/fixed-assets/reports/category-summary?companyId=${companyId}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo',
      'x-company-id': companyId,
    },
  });
  const data = await response.json();
  return data.categorySummary || [];
};

const fetchAssetAging = async (companyId: string) => {
  const response = await fetch(`${getApiBaseUrl()}/api/fixed-assets/reports/aging?companyId=${companyId}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo',
      'x-company-id': companyId,
    },
  });
  const data = await response.json();
  return data.agingReport || [];
};

const fetchDepreciationForecast = async (companyId: string, years: number = 5) => {
  const response = await fetch(`${getApiBaseUrl()}/api/fixed-assets/reports/forecast?companyId=${companyId}&years=${years}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo',
      'x-company-id': companyId,
    },
  });
  const data = await response.json();
  return data.forecast || [];
};

const fetchComplianceReport = async (companyId: string) => {
  const response = await fetch(`${getApiBaseUrl()}/api/fixed-assets/reports/compliance?companyId=${companyId}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo',
      'x-company-id': companyId,
    },
  });
  const data = await response.json();
  return data.complianceReport || {};
};

export default function FixedAssetReports() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [forecastYears, setForecastYears] = useState(5);

  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const authReady = !authLoading;

  // Get company ID
  const firstCompanyId = localStorage.getItem('company_id') || localStorage.getItem('companyId') || 'seed-company-1';

  // Fetch companies first
  const { data: companiesData, isLoading: companiesLoading } = useQuery({
    queryKey: ['companies'],
    queryFn: companiesApi.getCompanies,
    enabled: authReady
  });

  // Fetch asset register
  const { data: assetRegister = [], isLoading: registerLoading } = useQuery({
    queryKey: ['asset-register', firstCompanyId, statusFilter, categoryFilter],
    queryFn: () => fetchAssetRegister(firstCompanyId, {
      status: statusFilter !== 'all' ? statusFilter : undefined,
      categoryId: categoryFilter !== 'all' ? categoryFilter : undefined
    }),
    enabled: authReady && !!firstCompanyId
  });

  // Fetch depreciation schedule
  const { data: depreciationSchedule = [], isLoading: scheduleLoading } = useQuery({
    queryKey: ['depreciation-schedule', firstCompanyId, selectedYear],
    queryFn: () => fetchDepreciationSchedule(firstCompanyId, selectedYear),
    enabled: authReady && !!firstCompanyId
  });

  // Fetch category summary
  const { data: categorySummary = [], isLoading: categoryLoading } = useQuery({
    queryKey: ['category-summary', firstCompanyId],
    queryFn: () => fetchCategorySummary(firstCompanyId),
    enabled: authReady && !!firstCompanyId
  });

  // Fetch asset aging
  const { data: assetAging = [], isLoading: agingLoading } = useQuery({
    queryKey: ['asset-aging', firstCompanyId],
    queryFn: () => fetchAssetAging(firstCompanyId),
    enabled: authReady && !!firstCompanyId
  });

  // Fetch depreciation forecast
  const { data: depreciationForecast = [], isLoading: forecastLoading } = useQuery({
    queryKey: ['depreciation-forecast', firstCompanyId, forecastYears],
    queryFn: () => fetchDepreciationForecast(firstCompanyId, forecastYears),
    enabled: authReady && !!firstCompanyId
  });

  // Fetch compliance report
  const { data: complianceReport = {}, isLoading: complianceLoading } = useQuery({
    queryKey: ['compliance-report', firstCompanyId],
    queryFn: () => fetchComplianceReport(firstCompanyId),
    enabled: authReady && !!firstCompanyId
  });

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalCost = assetRegister.reduce((sum, asset) => sum + asset.purchaseCost, 0);
    const totalDepreciation = assetRegister.reduce((sum, asset) => sum + asset.accumulatedDepreciation, 0);
    const netBookValue = assetRegister.reduce((sum, asset) => sum + asset.netBookValue, 0);
    const activeAssets = assetRegister.filter(asset => asset.status === 'ACTIVE').length;
    const disposedAssets = assetRegister.filter(asset => asset.status === 'DISPOSED').length;

    return {
      totalAssets: assetRegister.length,
      activeAssets,
      disposedAssets,
      totalCost,
      totalDepreciation,
      netBookValue,
      depreciationPercentage: totalCost > 0 ? (totalDepreciation / totalCost) * 100 : 0
    };
  }, [assetRegister]);

  // Calculate monthly depreciation totals
  const monthlyDepreciation = useMemo(() => {
    const monthly = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      amount: 0,
      assetCount: 0
    }));

    depreciationSchedule.forEach(record => {
      const monthIndex = record.month - 1;
      monthly[monthIndex].amount += record.depreciationAmount;
      monthly[monthIndex].assetCount += 1;
    });

    return monthly;
  }, [depreciationSchedule]);

  // Calculate category breakdown
  const categoryBreakdown = useMemo(() => {
    return categorySummary.map(category => ({
      name: category.categoryName,
      assetCount: category.assetCount,
      totalCost: category.totalCost,
      netBookValue: category.netBookValue,
      depreciation: category.totalDepreciation,
      percentage: summaryStats.totalCost > 0 ? (category.totalCost / summaryStats.totalCost) * 100 : 0
    }));
  }, [categorySummary, summaryStats.totalCost]);

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'DISPOSED': return 'bg-gray-100 text-gray-800';
      case 'TRANSFERRED': return 'bg-blue-100 text-blue-800';
      case 'UNDER_MAINTENANCE': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'HIGH': return 'bg-red-100 text-red-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'LOW': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isAuthenticated) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <MoonLoader />
            <p className="mt-4 text-muted-foreground">Loading authentication...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Fixed Asset Reports</h1>
            <p className="text-muted-foreground">
              Comprehensive reports and analytics for your fixed assets
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summaryStats.totalAssets}</div>
              <p className="text-xs text-muted-foreground">
                {summaryStats.activeAssets} active, {summaryStats.disposedAssets} disposed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${summaryStats.totalCost.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Original purchase cost
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Book Value</CardTitle>
              <Calculator className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${summaryStats.netBookValue.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Current value
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Depreciation</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${summaryStats.totalDepreciation.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {summaryStats.depreciationPercentage.toFixed(1)}% of cost
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="DISPOSED">Disposed</SelectItem>
                  <SelectItem value="TRANSFERRED">Transferred</SelectItem>
                  <SelectItem value="UNDER_MAINTENANCE">Under Maintenance</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categorySummary.map((category: any) => (
                    <SelectItem key={category.categoryId} value={category.categoryId}>
                      {category.categoryName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 5 }, (_, i) => {
                    const year = new Date().getFullYear() - i;
                    return (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="register">Asset Register</TabsTrigger>
            <TabsTrigger value="depreciation">Depreciation</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="aging">Asset Aging</TabsTrigger>
            <TabsTrigger value="forecast">Forecast</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Category Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Assets by Category</CardTitle>
                  <CardDescription>Distribution of assets by category</CardDescription>
                </CardHeader>
                <CardContent>
                  {categoryLoading ? (
                    <div className="flex items-center justify-center h-32">
                      <MoonLoader />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {categoryBreakdown.map((category, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium">{category.name}</span>
                              <span className="text-sm text-muted-foreground">
                                {category.assetCount} assets
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${category.percentage}%` }}
                              ></div>
                            </div>
                            <div className="flex justify-between text-xs text-muted-foreground mt-1">
                              <span>${category.totalCost.toLocaleString()}</span>
                              <span>{category.percentage.toFixed(1)}%</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Monthly Depreciation */}
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Depreciation ({selectedYear})</CardTitle>
                  <CardDescription>Depreciation by month</CardDescription>
                </CardHeader>
                <CardContent>
                  {scheduleLoading ? (
                    <div className="flex items-center justify-center h-32">
                      <MoonLoader />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {monthlyDepreciation.map((month) => (
                        <div key={month.month} className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium">
                                {format(new Date(selectedYear, month.month - 1, 1), 'MMM')}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {month.assetCount} assets
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-600 h-2 rounded-full"
                                style={{ 
                                  width: `${Math.min(100, (month.amount / Math.max(...monthlyDepreciation.map(m => m.amount))) * 100)}%` 
                                }}
                              ></div>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              ${month.amount.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Asset Register Tab */}
          <TabsContent value="register" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Fixed Asset Register</CardTitle>
                <CardDescription>
                  Complete listing of all fixed assets ({assetRegister.length} assets)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {registerLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <MoonLoader />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Asset Number</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Purchase Date</TableHead>
                        <TableHead>Purchase Cost</TableHead>
                        <TableHead>Net Book Value</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assetRegister.map((asset: any) => (
                        <TableRow key={asset.assetId}>
                          <TableCell className="font-medium">{asset.assetNumber}</TableCell>
                          <TableCell>{asset.assetName}</TableCell>
                          <TableCell>{asset.category}</TableCell>
                          <TableCell>{format(new Date(asset.purchaseDate), 'MMM dd, yyyy')}</TableCell>
                          <TableCell>${asset.purchaseCost.toLocaleString()}</TableCell>
                          <TableCell>${asset.netBookValue.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(asset.status)}>
                              {asset.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Depreciation Tab */}
          <TabsContent value="depreciation" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Depreciation Schedule ({selectedYear})</CardTitle>
                <CardDescription>
                  Monthly depreciation calculations for {selectedYear}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {scheduleLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <MoonLoader />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Asset Number</TableHead>
                        <TableHead>Asset Name</TableHead>
                        <TableHead>Month</TableHead>
                        <TableHead>Depreciation Amount</TableHead>
                        <TableHead>Accumulated Depreciation</TableHead>
                        <TableHead>Net Book Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {depreciationSchedule.map((record: any) => (
                        <TableRow key={`${record.assetId}-${record.month}`}>
                          <TableCell className="font-medium">{record.assetNumber}</TableCell>
                          <TableCell>{record.assetName}</TableCell>
                          <TableCell>
                            {format(new Date(record.year, record.month - 1, 1), 'MMM')}
                          </TableCell>
                          <TableCell>${record.depreciationAmount.toLocaleString()}</TableCell>
                          <TableCell>${record.accumulatedDepreciation.toLocaleString()}</TableCell>
                          <TableCell>${record.netBookValue.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Category Summary</CardTitle>
                <CardDescription>
                  Summary of assets by category
                </CardDescription>
              </CardHeader>
              <CardContent>
                {categoryLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <MoonLoader />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Category</TableHead>
                        <TableHead>Asset Count</TableHead>
                        <TableHead>Total Cost</TableHead>
                        <TableHead>Total Depreciation</TableHead>
                        <TableHead>Net Book Value</TableHead>
                        <TableHead>% of Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categoryBreakdown.map((category, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{category.name}</TableCell>
                          <TableCell>{category.assetCount}</TableCell>
                          <TableCell>${category.totalCost.toLocaleString()}</TableCell>
                          <TableCell>${category.depreciation.toLocaleString()}</TableCell>
                          <TableCell>${category.netBookValue.toLocaleString()}</TableCell>
                          <TableCell>{category.percentage.toFixed(1)}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Asset Aging Tab */}
          <TabsContent value="aging" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Asset Aging Report</CardTitle>
                <CardDescription>
                  Age analysis of your fixed assets
                </CardDescription>
              </CardHeader>
              <CardContent>
                {agingLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <MoonLoader />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Asset Number</TableHead>
                        <TableHead>Asset Name</TableHead>
                        <TableHead>Purchase Date</TableHead>
                        <TableHead>Age (Years)</TableHead>
                        <TableHead>Remaining Life</TableHead>
                        <TableHead>Depreciation %</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assetAging.map((asset: any) => (
                        <TableRow key={asset.assetId}>
                          <TableCell className="font-medium">{asset.assetNumber}</TableCell>
                          <TableCell>{asset.assetName}</TableCell>
                          <TableCell>{format(new Date(asset.purchaseDate), 'MMM dd, yyyy')}</TableCell>
                          <TableCell>{asset.ageInYears}</TableCell>
                          <TableCell>{asset.remainingLifeYears}</TableCell>
                          <TableCell>{asset.depreciationPercentage.toFixed(1)}%</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(asset.status)}>
                              {asset.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Forecast Tab */}
          <TabsContent value="forecast" className="space-y-4">
            <div className="flex items-center gap-4 mb-4">
              <Select value={forecastYears.toString()} onValueChange={(value) => setForecastYears(parseInt(value))}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Years" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 Years</SelectItem>
                  <SelectItem value="5">5 Years</SelectItem>
                  <SelectItem value="10">10 Years</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Depreciation Forecast</CardTitle>
                <CardDescription>
                  Projected depreciation for the next {forecastYears} years
                </CardDescription>
              </CardHeader>
              <CardContent>
                {forecastLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <MoonLoader />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Year</TableHead>
                        <TableHead>Total Depreciation</TableHead>
                        <TableHead>Asset Count</TableHead>
                        <TableHead>Category Breakdown</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {depreciationForecast.map((year: any) => (
                        <TableRow key={year.year}>
                          <TableCell className="font-medium">{year.year}</TableCell>
                          <TableCell>${year.totalDepreciation.toLocaleString()}</TableCell>
                          <TableCell>{year.assetCount}</TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {year.categoryBreakdown.map((category: any, index: number) => (
                                <div key={index} className="text-sm">
                                  <span className="font-medium">{category.categoryName}:</span>
                                  <span className="ml-2">${category.depreciation.toLocaleString()}</span>
                                </div>
                              ))}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Compliance Tab */}
          <TabsContent value="compliance" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Missing Info</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{complianceReport.assetsWithMissingInfo || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Assets with missing information
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Maintenance Due</CardTitle>
                  <Clock className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{complianceReport.assetsRequiringMaintenance || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Assets requiring maintenance
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Near End of Life</CardTitle>
                  <TrendingDown className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{complianceReport.assetsNearEndOfLife || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Assets near end of useful life
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Compliance Issues</CardTitle>
                <CardDescription>
                  Issues requiring attention
                </CardDescription>
              </CardHeader>
              <CardContent>
                {complianceLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <MoonLoader />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Asset Number</TableHead>
                        <TableHead>Asset Name</TableHead>
                        <TableHead>Issue</TableHead>
                        <TableHead>Severity</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(complianceReport.complianceIssues || []).map((issue: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{issue.assetNumber}</TableCell>
                          <TableCell>{issue.assetName}</TableCell>
                          <TableCell>{issue.issue}</TableCell>
                          <TableCell>
                            <Badge className={getSeverityColor(issue.severity)}>
                              {issue.severity}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}
