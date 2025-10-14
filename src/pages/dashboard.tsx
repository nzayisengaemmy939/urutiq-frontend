import { useAuth } from "../contexts/auth-context"
import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Brain, Building, DollarSign, TrendingUp, AlertTriangle, Plus, FileText, BarChart3, Activity, Calculator, Loader2, Receipt } from "lucide-react"
import { ProtectedRoute } from "../components/auth/protected-route"
import { FinancialOverview } from "../components/financial-overview"
import { AIInsightsDashboard } from "../components/ai-insights-dashboard"
import { JournalNavigationBridge } from "../components/journal-navigation-bridge"
import { PageLayout } from "../components/page-layout"
import { useDashboardData } from "../hooks/useDashboardData"
import { getCompanyId } from "../lib/config"

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [companyId, setCompanyId] = useState<string>(getCompanyId())
  const { data: dashboardData, loading, error } = useDashboardData(companyId)

  // Listen for company changes from header
  useEffect(() => {
    const handleStorageChange = () => {
      const newCompanyId = getCompanyId();
      if (newCompanyId && newCompanyId !== companyId) {
        console.log('🔄 Dashboard page - Company changed from', companyId, 'to', newCompanyId);
        setCompanyId(newCompanyId);
      }
    };

    // Listen for localStorage changes
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events (in case localStorage doesn't trigger)
    const handleCompanyChange = (e: CustomEvent) => {
      const newCompanyId = e.detail.companyId;
      if (newCompanyId && newCompanyId !== companyId) {
        console.log('🔄 Dashboard page - Company changed via custom event from', companyId, 'to', newCompanyId);
        setCompanyId(newCompanyId);
      }
    };
    
    window.addEventListener('companyChanged', handleCompanyChange as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('companyChanged', handleCompanyChange as EventListener);
    };
  }, [companyId]);

  return (
    <ProtectedRoute>
      <PageLayout>
        <div className="space-y-6">
          
          {/* Page Header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-6 border border-cyan-100">
            <div>
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">Dashboard</h1>
              <p className="text-muted-foreground mt-1 text-lg">Financial Overview & Analytics</p>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  System Healthy
                </div>
                <div className="text-sm text-muted-foreground">
                  Last updated: {new Date().toLocaleTimeString()}
                </div>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" className="hover:bg-cyan-50 hover:border-cyan-200" onClick={() => navigate('/dashboard/reports')}>
                <Activity className="mr-2 h-4 w-4" />
                Export Report
              </Button>
              <Button className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 shadow-lg" onClick={() => navigate('/dashboard/reports?tab=analytics')}>
                <BarChart3 className="mr-2 h-4 w-4" />
                View Analytics
              </Button>
            </div>
          </div>


          {/* Financial Overview - Main Default View */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <FinancialOverview companyId={companyId} />
          </div>

          {/* Journal Entries Hub Integration */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <JournalNavigationBridge 
              companyId={companyId}
              onNavigate={(path) => navigate(path)}
              showQuickStats={true}
              showRecentActivity={true}
              compact={false}
            />
          </div>

          {/* Quick Actions & Stats Row */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Quick Actions */}
            <div className="lg:col-span-2">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5 text-blue-600" />
                    Quick Actions
                  </CardTitle>
                  <CardDescription>
                    Common tasks and shortcuts to get you started
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    <Button 
                      variant="outline" 
                      className="h-32 flex-col gap-3 hover:bg-gradient-to-br hover:from-blue-50 hover:to-cyan-50 hover:border-blue-300 hover:shadow-md transition-all duration-300 p-4 group"
                      onClick={() => navigate('/dashboard/settings')}
                    >
                      <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                        <Building className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="text-center">
                        <span className="font-semibold text-sm text-gray-900 block">New Company</span>
                        <span className="text-xs text-gray-600 leading-tight">Set up new business</span>
                      </div>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="h-32 flex-col gap-3 hover:bg-gradient-to-br hover:from-green-50 hover:to-emerald-50 hover:border-green-300 hover:shadow-md transition-all duration-300 p-4 group"
                      onClick={() => navigate('/dashboard/sales')}
                    >
                      <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                        <DollarSign className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="text-center">
                        <span className="font-semibold text-sm text-gray-900 block">Create Invoice</span>
                        <span className="text-xs text-gray-600 leading-tight">Generate invoice</span>
                      </div>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="h-32 flex-col gap-3 hover:bg-gradient-to-br hover:from-purple-50 hover:to-indigo-50 hover:border-purple-300 hover:shadow-md transition-all duration-300 p-4 group"
                      onClick={() => navigate('/dashboard/reports')}
                    >
                      <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                        <TrendingUp className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="text-center">
                        <span className="font-semibold text-sm text-gray-900 block">View Reports</span>
                        <span className="text-xs text-gray-600 leading-tight">Financial reports</span>
                      </div>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="h-32 flex-col gap-3 hover:bg-gradient-to-br hover:from-orange-50 hover:to-amber-50 hover:border-orange-300 hover:shadow-md transition-all duration-300 p-4 group"
                      onClick={() => navigate('/dashboard/ai-insights')}
                    >
                      <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                        <Brain className="h-6 w-6 text-orange-600" />
                      </div>
                      <div className="text-center">
                        <span className="font-semibold text-sm text-gray-900 block">AI Insights</span>
                        <span className="text-xs text-gray-600 leading-tight">AI recommendations</span>
                      </div>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="h-32 flex-col gap-3 hover:bg-gradient-to-br hover:from-indigo-50 hover:to-purple-50 hover:border-indigo-300 hover:shadow-md transition-all duration-300 p-4 group"
                      onClick={() => navigate('/dashboard/accounting')}
                    >
                      <div className="p-2 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
                        <Calculator className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div className="text-center">
                        <span className="font-semibold text-sm text-gray-900 block">Chart of Accounts</span>
                        <span className="text-xs text-gray-600 leading-tight">Manage accounts</span>
                      </div>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="h-32 flex-col gap-3 hover:bg-gradient-to-br hover:from-teal-50 hover:to-cyan-50 hover:border-teal-300 hover:shadow-md transition-all duration-300 p-4 group"
                      onClick={() => navigate('/dashboard/journal/new')}
                    >
                      <div className="p-2 bg-teal-100 rounded-lg group-hover:bg-teal-200 transition-colors">
                        <FileText className="h-6 w-6 text-teal-600" />
                      </div>
                      <div className="text-center">
                        <span className="font-semibold text-sm text-gray-900 block">New Journal Entry</span>
                        <span className="text-xs text-gray-600 leading-tight">Record transactions</span>
                      </div>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="h-32 flex-col gap-3 hover:bg-gradient-to-br hover:from-amber-50 hover:to-yellow-50 hover:border-amber-300 hover:shadow-md transition-all duration-300 p-4 group"
                      onClick={() => navigate('/dashboard/accounting?tab=trial-balance')}
                    >
                      <div className="p-2 bg-amber-100 rounded-lg group-hover:bg-amber-200 transition-colors">
                        <Calculator className="h-6 w-6 text-amber-600" />
                      </div>
                      <div className="text-center">
                        <span className="font-semibold text-sm text-gray-900 block">Trial Balance</span>
                        <span className="text-xs text-gray-600 leading-tight">View balances</span>
                      </div>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Key Stats */}
            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    This Month
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Revenue</span>
                    <span className={`font-semibold ${(dashboardData?.metrics?.totalRevenue || 0) > 0 ? 'text-green-600' : 'text-gray-600'}`}>
                      ${(dashboardData?.metrics?.totalRevenue || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Expenses</span>
                    <span className={`font-semibold ${(dashboardData?.metrics?.totalExpenses || 0) > 0 ? 'text-orange-600' : 'text-gray-600'}`}>
                      ${(dashboardData?.metrics?.totalExpenses || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Profit</span>
                    <span className={`font-semibold ${(dashboardData?.metrics?.netProfit || 0) > 0 ? 'text-blue-600' : (dashboardData?.metrics?.netProfit || 0) < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                      ${(dashboardData?.metrics?.netProfit || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="pt-3 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Net Growth</span>
                      <span className={`text-lg font-bold ${(dashboardData?.metrics?.netProfit || 0) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {(dashboardData?.metrics?.netProfit || 0) > 0 ? '+' : ''}${(dashboardData?.metrics?.netProfit || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                    Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {(dashboardData?.metrics?.overdueInvoices || 0) > 0 && (
                    <div className="flex items-center gap-3 p-2 bg-amber-50 rounded-lg">
                      <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                      <span className="text-sm text-amber-700">
                        ${(dashboardData?.metrics?.overdueInvoices || 0).toLocaleString()} in overdue invoices
                      </span>
                    </div>
                  )}
                  {(dashboardData?.metrics?.pendingInvoices || 0) > 0 && (
                    <div className="flex items-center gap-3 p-2 bg-blue-50 rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-blue-700">
                        ${(dashboardData?.metrics?.pendingInvoices || 0).toLocaleString()} in pending invoices
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 p-2 bg-green-50 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-700">
                      {dashboardData?.metrics?.activeCustomers || 0} active customers
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* AI Insights */}
          <AIInsightsDashboard maxItems={3} compact={true} showViewAll={true} />

          {/* Recent Activity */}
          <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-gray-600" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Latest updates and changes across your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span className="text-sm text-gray-500">Loading recent activity...</span>
                  </div>
                ) : error ? (
                  <div className="flex items-center justify-center py-8 text-red-600">
                    <AlertTriangle className="h-6 w-6 mr-2" />
                    <span className="text-sm">Error loading activity</span>
                  </div>
                ) : (dashboardData?.recentActivity?.length || 0) > 0 ? (
                  dashboardData?.recentActivity?.slice(0, 4).map((activity) => (
                    <div key={activity.id} className="flex items-center gap-4 p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${
                          activity.type === 'journal_entry' ? 'bg-purple-100' : 'bg-blue-100'
                        }`}>
                          {activity.type === 'journal_entry' ? (
                            <Receipt className="w-4 h-4 text-purple-600" />
                          ) : (
                            <FileText className="w-4 h-4 text-blue-600" />
                          )}
                        </div>
                        <div className={`w-3 h-3 rounded-full ${
                          activity.status === 'posted' ? 'bg-green-500' : 
                          activity.status === 'draft' ? 'bg-yellow-500' : 
                          'bg-blue-500'
                        }`}></div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                        <p className="text-xs text-gray-600">{activity.description}</p>
                        <p className="text-xs text-gray-500 capitalize">
                          {activity.type.replace('_', ' ')} • {activity.status}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(activity.date).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center py-8 text-gray-500">
                    <Activity className="h-6 w-6 mr-2" />
                    <span className="text-sm">No recent activity</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    </ProtectedRoute>
  )
}
