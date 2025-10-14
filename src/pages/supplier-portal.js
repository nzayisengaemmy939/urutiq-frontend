import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, CreditCard, Download, Eye, AlertCircle, CheckCircle, Clock, Edit, Save, X } from 'lucide-react';
import { apiService } from '@/lib/api';
import { useAuth } from '@/contexts/auth-context';
import { PageLayout } from '@/components/page-layout';
import { SupplierDashboard } from '@/components/supplier-dashboard';
export default function SupplierPortal() {
    const { user, isAuthenticated } = useAuth();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [profileForm, setProfileForm] = useState({});
    // Fetch supplier profile
    const { data: profile, isLoading: profileLoading, refetch: refetchProfile } = useQuery({
        queryKey: ['supplier-profile', user?.id],
        queryFn: () => apiService.getSupplierProfile(user?.id || ''),
        enabled: !!user?.id && isAuthenticated
    });
    // Fetch supplier statistics
    const { data: stats, isLoading: statsLoading } = useQuery({
        queryKey: ['supplier-stats', user?.id],
        queryFn: () => apiService.getSupplierStats(user?.id || ''),
        enabled: !!user?.id && isAuthenticated
    });
    // Fetch supplier invoices
    const { data: invoices, isLoading: invoicesLoading } = useQuery({
        queryKey: ['supplier-invoices', user?.id],
        queryFn: () => apiService.getSupplierInvoices(user?.id || ''),
        enabled: !!user?.id && isAuthenticated
    });
    // Fetch supplier payments
    const { data: payments, isLoading: paymentsLoading } = useQuery({
        queryKey: ['supplier-payments', user?.id],
        queryFn: () => apiService.getSupplierPayments(user?.id || ''),
        enabled: !!user?.id && isAuthenticated
    });
    // Initialize profile form when profile data loads
    useEffect(() => {
        if (profile) {
            setProfileForm(profile);
        }
    }, [profile]);
    const handleProfileUpdate = async () => {
        try {
            await apiService.updateSupplierProfile(user?.id || '', profileForm);
            setIsEditingProfile(false);
            refetchProfile();
        }
        catch (error) {
            console.error('Failed to update profile:', error);
        }
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'paid': return 'bg-green-100 text-green-800';
            case 'sent': return 'bg-blue-100 text-blue-800';
            case 'overdue': return 'bg-red-100 text-red-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'completed': return 'bg-green-100 text-green-800';
            case 'failed': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
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
    if (!isAuthenticated) {
        return (_jsx(PageLayout, { title: "Supplier Portal", children: _jsx("div", { className: "flex items-center justify-center min-h-[400px]", children: _jsx(Card, { className: "w-full max-w-md", children: _jsxs(CardHeader, { children: [_jsx(CardTitle, { className: "text-center", children: "Access Denied" }), _jsx(CardDescription, { className: "text-center", children: "Please log in to access the supplier portal." })] }) }) }) }));
    }
    return (_jsx(PageLayout, { title: "Supplier Portal", children: _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsxs("h1", { className: "text-3xl font-bold", children: ["Welcome back, ", profile?.name || 'Supplier'] }), _jsx("p", { className: "text-muted-foreground", children: "Manage your invoices, payments, and account information" })] }), _jsx("div", { className: "flex items-center space-x-2", children: _jsx(Badge, { variant: profile?.isActive ? 'default' : 'secondary', children: profile?.isActive ? 'Active' : 'Inactive' }) })] }), stats && (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Total Invoices" }), _jsx(FileText, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: stats.totalInvoices }), _jsxs("p", { className: "text-xs text-muted-foreground", children: ["$", stats.totalAmount.toLocaleString()] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Paid Invoices" }), _jsx(CheckCircle, { className: "h-4 w-4 text-green-600" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold text-green-600", children: stats.paidInvoices }), _jsxs("p", { className: "text-xs text-muted-foreground", children: ["$", stats.paidAmount.toLocaleString()] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Pending Invoices" }), _jsx(Clock, { className: "h-4 w-4 text-yellow-600" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold text-yellow-600", children: stats.pendingInvoices }), _jsxs("p", { className: "text-xs text-muted-foreground", children: ["$", stats.pendingAmount.toLocaleString()] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Overdue Invoices" }), _jsx(AlertCircle, { className: "h-4 w-4 text-red-600" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold text-red-600", children: stats.overdueInvoices }), _jsxs("p", { className: "text-xs text-muted-foreground", children: ["$", stats.overdueAmount.toLocaleString()] })] })] })] })), _jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, className: "space-y-6", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-4", children: [_jsx(TabsTrigger, { value: "dashboard", children: "Dashboard" }), _jsx(TabsTrigger, { value: "invoices", children: "Invoices" }), _jsx(TabsTrigger, { value: "payments", children: "Payments" }), _jsx(TabsTrigger, { value: "profile", children: "Profile" })] }), _jsx(TabsContent, { value: "dashboard", className: "space-y-6", children: _jsx(SupplierDashboard, {}) }), _jsx(TabsContent, { value: "invoices", className: "space-y-6", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Invoice Management" }), _jsx(CardDescription, { children: "View and manage all your invoices" })] }), _jsx(CardContent, { children: invoicesLoading ? (_jsx("div", { className: "space-y-4", children: [...Array(5)].map((_, i) => (_jsx("div", { className: "animate-pulse", children: _jsx("div", { className: "h-20 bg-gray-200 rounded" }) }, i))) })) : invoices && invoices.length > 0 ? (_jsx("div", { className: "space-y-4", children: invoices.map((invoice) => (_jsx("div", { className: "border rounded-lg p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center space-x-4", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-semibold", children: invoice.invoiceNumber }), _jsxs("p", { className: "text-sm text-muted-foreground", children: [invoice.companyName, " \u2022 ", new Date(invoice.invoiceDate).toLocaleDateString()] })] }), _jsxs(Badge, { className: getStatusColor(invoice.status), children: [getStatusIcon(invoice.status), _jsx("span", { className: "ml-1 capitalize", children: invoice.status })] })] }), _jsx("p", { className: "text-sm text-muted-foreground mt-2", children: invoice.description }), _jsxs("div", { className: "flex items-center space-x-4 mt-2 text-sm text-muted-foreground", children: [_jsxs("span", { children: ["Due: ", new Date(invoice.dueDate).toLocaleDateString()] }), _jsxs("span", { children: ["Terms: ", invoice.paymentTerms] })] })] }), _jsxs("div", { className: "text-right", children: [_jsxs("div", { className: "text-2xl font-bold", children: ["$", invoice.amount.toLocaleString()] }), _jsxs("div", { className: "flex space-x-2 mt-2", children: [_jsxs(Button, { variant: "outline", size: "sm", children: [_jsx(Eye, { className: "h-4 w-4 mr-1" }), "View"] }), _jsxs(Button, { variant: "outline", size: "sm", children: [_jsx(Download, { className: "h-4 w-4 mr-1" }), "Download"] })] })] })] }) }, invoice.id))) })) : (_jsxs("div", { className: "text-center py-8", children: [_jsx(FileText, { className: "h-12 w-12 text-muted-foreground mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-semibold mb-2", children: "No Invoices Found" }), _jsx("p", { className: "text-muted-foreground", children: "You don't have any invoices yet. Invoices will appear here once they're created." })] })) })] }) }), _jsx(TabsContent, { value: "payments", className: "space-y-6", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Payment History" }), _jsx(CardDescription, { children: "Track all your payments and their status" })] }), _jsx(CardContent, { children: paymentsLoading ? (_jsx("div", { className: "space-y-4", children: [...Array(5)].map((_, i) => (_jsx("div", { className: "animate-pulse", children: _jsx("div", { className: "h-20 bg-gray-200 rounded" }) }, i))) })) : payments && payments.length > 0 ? (_jsx("div", { className: "space-y-4", children: payments.map((payment) => (_jsx("div", { className: "border rounded-lg p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center space-x-4", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-semibold", children: payment.paymentNumber }), _jsxs("p", { className: "text-sm text-muted-foreground", children: ["Invoice: ", payment.invoiceNumber, " \u2022 ", new Date(payment.paymentDate).toLocaleDateString()] })] }), _jsxs(Badge, { className: getStatusColor(payment.status), children: [getStatusIcon(payment.status), _jsx("span", { className: "ml-1 capitalize", children: payment.status })] })] }), _jsxs("p", { className: "text-sm text-muted-foreground mt-2", children: ["Method: ", payment.method.replace('_', ' ').toUpperCase()] }), payment.notes && (_jsxs("p", { className: "text-sm text-muted-foreground mt-1", children: ["Notes: ", payment.notes] })), payment.reference && (_jsxs("p", { className: "text-sm text-muted-foreground mt-1", children: ["Reference: ", payment.reference] }))] }), _jsxs("div", { className: "text-right", children: [_jsxs("div", { className: "text-2xl font-bold", children: ["$", payment.amount.toLocaleString()] }), _jsx("div", { className: "flex space-x-2 mt-2", children: _jsxs(Button, { variant: "outline", size: "sm", children: [_jsx(Eye, { className: "h-4 w-4 mr-1" }), "View Details"] }) })] })] }) }, payment.id))) })) : (_jsxs("div", { className: "text-center py-8", children: [_jsx(CreditCard, { className: "h-12 w-12 text-muted-foreground mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-semibold mb-2", children: "No Payments Found" }), _jsx("p", { className: "text-muted-foreground", children: "You don't have any payments yet. Payments will appear here once they're processed." })] })) })] }) }), _jsx(TabsContent, { value: "profile", className: "space-y-6", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx(CardTitle, { children: "Company Profile" }), _jsx(CardDescription, { children: "Manage your company information and settings" })] }), _jsx(Button, { variant: isEditingProfile ? "outline" : "default", onClick: () => {
                                                        if (isEditingProfile) {
                                                            setProfileForm(profile || {});
                                                            setIsEditingProfile(false);
                                                        }
                                                        else {
                                                            setIsEditingProfile(true);
                                                        }
                                                    }, children: isEditingProfile ? (_jsxs(_Fragment, { children: [_jsx(X, { className: "h-4 w-4 mr-2" }), "Cancel"] })) : (_jsxs(_Fragment, { children: [_jsx(Edit, { className: "h-4 w-4 mr-2" }), "Edit Profile"] })) })] }) }), _jsxs(CardContent, { children: [profileLoading ? (_jsx("div", { className: "space-y-4", children: [...Array(8)].map((_, i) => (_jsxs("div", { className: "animate-pulse", children: [_jsx("div", { className: "h-4 bg-gray-200 rounded w-1/4 mb-2" }), _jsx("div", { className: "h-10 bg-gray-200 rounded" })] }, i))) })) : (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "name", children: "Company Name" }), _jsx(Input, { id: "name", value: profileForm.name || '', onChange: (e) => setProfileForm({ ...profileForm, name: e.target.value }), disabled: !isEditingProfile })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "email", children: "Email" }), _jsx(Input, { id: "email", type: "email", value: profileForm.email || '', onChange: (e) => setProfileForm({ ...profileForm, email: e.target.value }), disabled: !isEditingProfile })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "phone", children: "Phone" }), _jsx(Input, { id: "phone", value: profileForm.phone || '', onChange: (e) => setProfileForm({ ...profileForm, phone: e.target.value }), disabled: !isEditingProfile })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "website", children: "Website" }), _jsx(Input, { id: "website", value: profileForm.website || '', onChange: (e) => setProfileForm({ ...profileForm, website: e.target.value }), disabled: !isEditingProfile })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "taxId", children: "Tax ID" }), _jsx(Input, { id: "taxId", value: profileForm.taxId || '', onChange: (e) => setProfileForm({ ...profileForm, taxId: e.target.value }), disabled: !isEditingProfile })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "address", children: "Address" }), _jsx(Textarea, { id: "address", value: profileForm.address || '', onChange: (e) => setProfileForm({ ...profileForm, address: e.target.value }), disabled: !isEditingProfile })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "city", children: "City" }), _jsx(Input, { id: "city", value: profileForm.city || '', onChange: (e) => setProfileForm({ ...profileForm, city: e.target.value }), disabled: !isEditingProfile })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "state", children: "State" }), _jsx(Input, { id: "state", value: profileForm.state || '', onChange: (e) => setProfileForm({ ...profileForm, state: e.target.value }), disabled: !isEditingProfile })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "postalCode", children: "Postal Code" }), _jsx(Input, { id: "postalCode", value: profileForm.postalCode || '', onChange: (e) => setProfileForm({ ...profileForm, postalCode: e.target.value }), disabled: !isEditingProfile })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "country", children: "Country" }), _jsx(Input, { id: "country", value: profileForm.country || '', onChange: (e) => setProfileForm({ ...profileForm, country: e.target.value }), disabled: !isEditingProfile })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "contactPerson", children: "Contact Person" }), _jsx(Input, { id: "contactPerson", value: profileForm.contactPerson || '', onChange: (e) => setProfileForm({ ...profileForm, contactPerson: e.target.value }), disabled: !isEditingProfile })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "paymentTerms", children: "Payment Terms" }), _jsxs(Select, { value: profileForm.paymentTerms || '', onValueChange: (value) => setProfileForm({ ...profileForm, paymentTerms: value }), disabled: !isEditingProfile, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select payment terms" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "net_15", children: "Net 15" }), _jsx(SelectItem, { value: "net_30", children: "Net 30" }), _jsx(SelectItem, { value: "net_45", children: "Net 45" }), _jsx(SelectItem, { value: "net_60", children: "Net 60" }), _jsx(SelectItem, { value: "due_on_receipt", children: "Due on Receipt" })] })] })] })] })] })), isEditingProfile && (_jsxs("div", { className: "flex justify-end space-x-2 mt-6", children: [_jsx(Button, { variant: "outline", onClick: () => setIsEditingProfile(false), children: "Cancel" }), _jsxs(Button, { onClick: handleProfileUpdate, children: [_jsx(Save, { className: "h-4 w-4 mr-2" }), "Save Changes"] })] }))] })] }) })] })] }) }));
}
