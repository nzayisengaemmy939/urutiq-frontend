"use client"

import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Brain, Building, Users, DollarSign, TrendingUp, AlertTriangle, Plus, FileText, BarChart3, Activity, Shield, CheckCircle, Clock, Calculator } from "lucide-react"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { FinancialOverview } from "@/components/financial-overview"
import { PageLayout } from "@/components/page-layout"

export default function DashboardPage() {
  const { user } = useAuth()
  const router = useRouter()

  return (
    <ProtectedRoute>
      <PageLayout>
        <div className="flex-1 space-y-6 p-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground">Financial Overview & Analytics</p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline">
                <Activity className="mr-2 h-4 w-4" />
                Export Report
              </Button>
              <Button>
                <BarChart3 className="mr-2 h-4 w-4" />
                View Analytics
              </Button>
            </div>
          </div>


          {/* Financial Overview - Main Default View */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <FinancialOverview />
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
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Button variant="outline" className="h-24 flex-col gap-3 hover:bg-blue-50 hover:border-blue-200 transition-colors">
                      <Building className="h-8 w-8 text-blue-600" />
                      <span className="font-medium">New Company</span>
                      <span className="text-xs text-gray-500">Set up a new business entity</span>
                    </Button>
                    <Button variant="outline" className="h-24 flex-col gap-3 hover:bg-green-50 hover:border-green-200 transition-colors">
                      <DollarSign className="h-8 w-8 text-green-600" />
                      <span className="font-medium">Create Invoice</span>
                      <span className="text-xs text-gray-500">Generate new customer invoice</span>
                    </Button>
                    <Button variant="outline" className="h-24 flex-col gap-3 hover:bg-purple-50 hover:border-purple-200 transition-colors">
                      <TrendingUp className="h-8 w-8 text-purple-600" />
                      <span className="font-medium">View Reports</span>
                      <span className="text-xs text-gray-500">Access financial reports</span>
                    </Button>
                    <Button variant="outline" className="h-24 flex-col gap-3 hover:bg-orange-50 hover:border-orange-200 transition-colors">
                      <Brain className="h-8 w-8 text-orange-600" />
                      <span className="font-medium">AI Insights</span>
                      <span className="text-xs text-gray-500">Get AI-powered recommendations</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-24 flex-col gap-3 hover:bg-indigo-50 hover:border-indigo-200 transition-colors"
                      onClick={() => router.push('/accounting')}
                    >
                      <Calculator className="h-8 w-8 text-indigo-600" />
                      <span className="font-medium">Chart of Accounts</span>
                      <span className="text-xs text-gray-500">Manage financial accounts</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-24 flex-col gap-3 hover:bg-teal-50 hover:border-teal-200 transition-colors"
                      onClick={() => router.push('/accounting?tab=journal-entries')}
                    >
                      <FileText className="h-8 w-8 text-teal-600" />
                      <span className="font-medium">Journal Entries</span>
                      <span className="text-xs text-gray-500">Record financial transactions</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-24 flex-col gap-3 hover:bg-amber-50 hover:border-amber-200 transition-colors"
                      onClick={() => router.push('/accounting?tab=trial-balance')}
                    >
                      <Calculator className="h-8 w-8 text-amber-600" />
                      <span className="font-medium">Trial Balance</span>
                      <span className="text-xs text-gray-500">View account balances</span>
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
                    <span className="font-semibold text-green-600">+12.5%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Expenses</span>
                    <span className="font-semibold text-orange-600">+8.2%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Profit</span>
                    <span className="font-semibold text-blue-600">+18.7%</span>
                  </div>
                  <div className="pt-3 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Net Growth</span>
                      <span className="text-lg font-bold text-green-600">+$45.2K</span>
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
                  <div className="flex items-center gap-3 p-2 bg-amber-50 rounded-lg">
                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                    <span className="text-sm text-amber-700">3 invoices overdue</span>
                  </div>
                  <div className="flex items-center gap-3 p-2 bg-blue-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-blue-700">2 AI insights ready</span>
                  </div>
                  <div className="flex items-center gap-3 p-2 bg-green-50 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-700">System backup complete</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

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
                <div className="flex items-center gap-4 p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">New invoice created</p>
                    <p className="text-xs text-gray-600">Invoice #INV-001 for $1,200.00</p>
                  </div>
                  <span className="text-xs text-gray-500">2 hours ago</span>
                </div>
                
                <div className="flex items-center gap-4 p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">AI anomaly detected</p>
                    <p className="text-xs text-gray-600">Unusual transaction pattern in Company XYZ</p>
                  </div>
                  <span className="text-xs text-gray-500">4 hours ago</span>
                </div>
                
                <div className="flex items-center gap-4 p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Payment received</p>
                    <p className="text-xs text-gray-600">Payment of $800.00 for Invoice #INV-002</p>
                  </div>
                  <span className="text-xs text-gray-500">1 day ago</span>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Report generated</p>
                    <p className="text-xs text-gray-600">Monthly financial summary for December</p>
                  </div>
                  <span className="text-xs text-gray-500">2 days ago</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    </ProtectedRoute>
  )
}
