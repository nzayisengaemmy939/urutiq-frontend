import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2, 
  FileText, 
  CreditCard, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  Calendar,
  Download,
  Eye,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { apiService } from '@/lib/api';
import { useAuth } from '@/contexts/auth-context';

interface SupplierStats {
  totalInvoices: number;
  paidInvoices: number;
  pendingInvoices: number;
  overdueInvoices: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  overdueAmount: number;
  averagePaymentDays: number;
  lastPaymentDate: string;
  nextPaymentDate: string;
  monthlyGrowth: number;
  paymentTrend: 'up' | 'down' | 'stable';
}

interface RecentActivity {
  id: string;
  type: 'invoice' | 'payment';
  title: string;
  amount: number;
  status: string;
  date: string;
  description: string;
}

export function SupplierDashboard() {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState('30d');

  // Fetch supplier statistics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['supplier-stats', user?.id, timeRange],
    queryFn: () => apiService.getSupplierStats(user?.id || ''),
    enabled: !!user?.id
  });

  // Fetch recent activity
  const { data: recentActivity, isLoading: activityLoading } = useQuery({
    queryKey: ['supplier-activity', user?.id],
    queryFn: async () => {
      const [invoices, payments] = await Promise.all([
        apiService.getSupplierInvoices(user?.id || '', { pageSize: 5 }),
        apiService.getSupplierPayments(user?.id || '', { pageSize: 5 })
      ]);

      const activities: RecentActivity[] = [
        ...invoices.map(invoice => ({
          id: invoice.id,
          type: 'invoice' as const,
          title: `Invoice ${invoice.invoiceNumber}`,
          amount: invoice.amount,
          status: invoice.status,
          date: invoice.invoiceDate,
          description: invoice.description
        })),
        ...payments.map(payment => ({
          id: payment.id,
          type: 'payment' as const,
          title: `Payment ${payment.paymentNumber}`,
          amount: payment.amount,
          status: payment.status,
          date: payment.paymentDate,
          description: `Payment for invoice ${payment.invoiceNumber}`
        }))
      ];

      return activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);
    },
    enabled: !!user?.id
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'sent':
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      case 'overdue':
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'overdue':
      case 'failed':
        return <AlertCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <ArrowUpRight className="h-4 w-4 text-green-600" />;
      case 'down':
        return <ArrowDownRight className="h-4 w-4 text-red-600" />;
      default:
        return <TrendingUp className="h-4 w-4 text-gray-600" />;
    }
  };

  if (statsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening with your account.</p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalInvoices || 0}</div>
            <p className="text-xs text-muted-foreground">
              ${stats?.totalAmount?.toLocaleString() || '0'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Invoices</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats?.paidInvoices || 0}</div>
            <p className="text-xs text-muted-foreground">
              ${stats?.paidAmount?.toLocaleString() || '0'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Invoices</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats?.pendingInvoices || 0}</div>
            <p className="text-xs text-muted-foreground">
              ${stats?.pendingAmount?.toLocaleString() || '0'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Invoices</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats?.overdueInvoices || 0}</div>
            <p className="text-xs text-muted-foreground">
              ${stats?.overdueAmount?.toLocaleString() || '0'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest invoices and payments</CardDescription>
            </CardHeader>
            <CardContent>
              {activityLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-16 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : recentActivity && recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${
                          activity.type === 'invoice' ? 'bg-blue-100' : 'bg-green-100'
                        }`}>
                          {activity.type === 'invoice' ? (
                            <FileText className="h-4 w-4 text-blue-600" />
                          ) : (
                            <CreditCard className="h-4 w-4 text-green-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{activity.title}</p>
                          <p className="text-sm text-gray-500">{activity.description}</p>
                          <p className="text-xs text-gray-400">
                            {new Date(activity.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${activity.amount.toLocaleString()}</p>
                        <Badge className={getStatusColor(activity.status)}>
                          {getStatusIcon(activity.status)}
                          <span className="ml-1 capitalize">{activity.status}</span>
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Recent Activity</h3>
                  <p className="text-gray-500">Your recent invoices and payments will appear here.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats & Actions */}
        <div className="space-y-6">
          {/* Payment Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Performance</CardTitle>
              <CardDescription>Your payment statistics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Average Payment Days</span>
                <span className="font-semibold">{stats?.averagePaymentDays || 0} days</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last Payment</span>
                <span className="font-semibold">
                  {stats?.lastPaymentDate 
                    ? new Date(stats.lastPaymentDate).toLocaleDateString()
                    : 'N/A'
                  }
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Next Expected</span>
                <span className="font-semibold">
                  {stats?.nextPaymentDate 
                    ? new Date(stats.nextPaymentDate).toLocaleDateString()
                    : 'N/A'
                  }
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="mr-2 h-4 w-4" />
                View All Invoices
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <CreditCard className="mr-2 h-4 w-4" />
                View Payment History
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Download className="mr-2 h-4 w-4" />
                Download Reports
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Building2 className="mr-2 h-4 w-4" />
                Update Profile
              </Button>
            </CardContent>
          </Card>

          {/* Payment Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Trend</CardTitle>
              <CardDescription>This month vs last month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getTrendIcon(stats?.paymentTrend || 'stable')}
                  <span className="text-2xl font-bold">
                    {stats?.monthlyGrowth ? `+${stats.monthlyGrowth}%` : '0%'}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">vs last month</p>
                  <p className="text-xs text-gray-500">
                    {stats?.paymentTrend === 'up' ? 'Improving' : 
                     stats?.paymentTrend === 'down' ? 'Declining' : 'Stable'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
