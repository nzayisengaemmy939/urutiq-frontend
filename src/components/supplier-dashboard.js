import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, FileText, CreditCard, TrendingUp, AlertCircle, CheckCircle, Clock, Download, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { apiService } from '@/lib/api';
import { useAuth } from '@/contexts/auth-context';
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
            const activities = [
                ...invoices.map(invoice => ({
                    id: invoice.id,
                    type: 'invoice',
                    title: `Invoice ${invoice.invoiceNumber}`,
                    amount: invoice.amount,
                    status: invoice.status,
                    date: invoice.invoiceDate,
                    description: invoice.description
                })),
                ...payments.map(payment => ({
                    id: payment.id,
                    type: 'payment',
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
    const getStatusColor = (status) => {
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
    const getStatusIcon = (status) => {
        switch (status) {
            case 'paid':
            case 'completed':
                return _jsx(CheckCircle, { className: "h-4 w-4" });
            case 'overdue':
            case 'failed':
                return _jsx(AlertCircle, { className: "h-4 w-4" });
            case 'pending':
                return _jsx(Clock, { className: "h-4 w-4" });
            default:
                return _jsx(Clock, { className: "h-4 w-4" });
        }
    };
    const getTrendIcon = (trend) => {
        switch (trend) {
            case 'up':
                return _jsx(ArrowUpRight, { className: "h-4 w-4 text-green-600" });
            case 'down':
                return _jsx(ArrowDownRight, { className: "h-4 w-4 text-red-600" });
            default:
                return _jsx(TrendingUp, { className: "h-4 w-4 text-gray-600" });
        }
    };
    if (statsLoading) {
        return (_jsx("div", { className: "space-y-6", children: _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", children: [...Array(4)].map((_, i) => (_jsx(Card, { children: _jsxs(CardHeader, { className: "animate-pulse", children: [_jsx("div", { className: "h-4 bg-gray-200 rounded w-3/4" }), _jsx("div", { className: "h-8 bg-gray-200 rounded w-1/2" })] }) }, i))) }) }));
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Dashboard" }), _jsx("p", { className: "text-gray-600", children: "Welcome back! Here's what's happening with your account." })] }), _jsx("div", { className: "flex items-center space-x-2", children: _jsxs("select", { value: timeRange, onChange: (e) => setTimeRange(e.target.value), className: "px-3 py-2 border border-gray-300 rounded-md text-sm", children: [_jsx("option", { value: "7d", children: "Last 7 days" }), _jsx("option", { value: "30d", children: "Last 30 days" }), _jsx("option", { value: "90d", children: "Last 90 days" }), _jsx("option", { value: "1y", children: "Last year" })] }) })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Total Invoices" }), _jsx(FileText, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: stats?.totalInvoices || 0 }), _jsxs("p", { className: "text-xs text-muted-foreground", children: ["$", stats?.totalAmount?.toLocaleString() || '0'] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Paid Invoices" }), _jsx(CheckCircle, { className: "h-4 w-4 text-green-600" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold text-green-600", children: stats?.paidInvoices || 0 }), _jsxs("p", { className: "text-xs text-muted-foreground", children: ["$", stats?.paidAmount?.toLocaleString() || '0'] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Pending Invoices" }), _jsx(Clock, { className: "h-4 w-4 text-yellow-600" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold text-yellow-600", children: stats?.pendingInvoices || 0 }), _jsxs("p", { className: "text-xs text-muted-foreground", children: ["$", stats?.pendingAmount?.toLocaleString() || '0'] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Overdue Invoices" }), _jsx(AlertCircle, { className: "h-4 w-4 text-red-600" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold text-red-600", children: stats?.overdueInvoices || 0 }), _jsxs("p", { className: "text-xs text-muted-foreground", children: ["$", stats?.overdueAmount?.toLocaleString() || '0'] })] })] })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [_jsx("div", { className: "lg:col-span-2", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Recent Activity" }), _jsx(CardDescription, { children: "Your latest invoices and payments" })] }), _jsx(CardContent, { children: activityLoading ? (_jsx("div", { className: "space-y-4", children: [...Array(5)].map((_, i) => (_jsx("div", { className: "animate-pulse", children: _jsx("div", { className: "h-16 bg-gray-200 rounded" }) }, i))) })) : recentActivity && recentActivity.length > 0 ? (_jsx("div", { className: "space-y-4", children: recentActivity.map((activity) => (_jsxs("div", { className: "flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: `p-2 rounded-full ${activity.type === 'invoice' ? 'bg-blue-100' : 'bg-green-100'}`, children: activity.type === 'invoice' ? (_jsx(FileText, { className: "h-4 w-4 text-blue-600" })) : (_jsx(CreditCard, { className: "h-4 w-4 text-green-600" })) }), _jsxs("div", { children: [_jsx("p", { className: "font-medium", children: activity.title }), _jsx("p", { className: "text-sm text-gray-500", children: activity.description }), _jsx("p", { className: "text-xs text-gray-400", children: new Date(activity.date).toLocaleDateString() })] })] }), _jsxs("div", { className: "text-right", children: [_jsxs("p", { className: "font-semibold", children: ["$", activity.amount.toLocaleString()] }), _jsxs(Badge, { className: getStatusColor(activity.status), children: [getStatusIcon(activity.status), _jsx("span", { className: "ml-1 capitalize", children: activity.status })] })] })] }, activity.id))) })) : (_jsxs("div", { className: "text-center py-8", children: [_jsx(FileText, { className: "h-12 w-12 text-gray-400 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-2", children: "No Recent Activity" }), _jsx("p", { className: "text-gray-500", children: "Your recent invoices and payments will appear here." })] })) })] }) }), _jsxs("div", { className: "space-y-6", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Payment Performance" }), _jsx(CardDescription, { children: "Your payment statistics" })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm text-gray-600", children: "Average Payment Days" }), _jsxs("span", { className: "font-semibold", children: [stats?.averagePaymentDays || 0, " days"] })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm text-gray-600", children: "Last Payment" }), _jsx("span", { className: "font-semibold", children: stats?.lastPaymentDate
                                                            ? new Date(stats.lastPaymentDate).toLocaleDateString()
                                                            : 'N/A' })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm text-gray-600", children: "Next Expected" }), _jsx("span", { className: "font-semibold", children: stats?.nextPaymentDate
                                                            ? new Date(stats.nextPaymentDate).toLocaleDateString()
                                                            : 'N/A' })] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Quick Actions" }), _jsx(CardDescription, { children: "Common tasks and shortcuts" })] }), _jsxs(CardContent, { className: "space-y-2", children: [_jsxs(Button, { variant: "outline", className: "w-full justify-start", children: [_jsx(FileText, { className: "mr-2 h-4 w-4" }), "View All Invoices"] }), _jsxs(Button, { variant: "outline", className: "w-full justify-start", children: [_jsx(CreditCard, { className: "mr-2 h-4 w-4" }), "View Payment History"] }), _jsxs(Button, { variant: "outline", className: "w-full justify-start", children: [_jsx(Download, { className: "mr-2 h-4 w-4" }), "Download Reports"] }), _jsxs(Button, { variant: "outline", className: "w-full justify-start", children: [_jsx(Building2, { className: "mr-2 h-4 w-4" }), "Update Profile"] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Payment Trend" }), _jsx(CardDescription, { children: "This month vs last month" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [getTrendIcon(stats?.paymentTrend || 'stable'), _jsx("span", { className: "text-2xl font-bold", children: stats?.monthlyGrowth ? `+${stats.monthlyGrowth}%` : '0%' })] }), _jsxs("div", { className: "text-right", children: [_jsx("p", { className: "text-sm text-gray-600", children: "vs last month" }), _jsx("p", { className: "text-xs text-gray-500", children: stats?.paymentTrend === 'up' ? 'Improving' :
                                                                stats?.paymentTrend === 'down' ? 'Declining' : 'Stable' })] })] }) })] })] })] })] }));
}
