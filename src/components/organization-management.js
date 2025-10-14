import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Plus, Edit, Trash2, Eye, Globe, MapPin, Phone, Mail, Calendar, Users, CreditCard, Crown, Shield, CheckCircle, Clock, UserPlus } from "lucide-react";
import { toast } from 'sonner';
import { apiService } from '@/lib/api';
export function OrganizationManagement() {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingOrg, setEditingOrg] = useState(null);
    const [viewingOrg, setViewingOrg] = useState(null);
    const queryClient = useQueryClient();
    // Fetch organizations (using companies API for now)
    const { data: organizations, isLoading } = useQuery({
        queryKey: ['organizations'],
        queryFn: async () => {
            const response = await apiService.getCompanies();
            const companies = Array.isArray(response) ? response : (response?.data || []);
            // Transform companies to organizations with additional fields
            return companies.map((company) => ({
                ...company,
                status: company.isActive ? 'active' : 'inactive',
                subscription: 'Professional', // Default subscription
                userCount: Math.floor(Math.random() * 20) + 1, // Mock user count
                maxUsers: 50, // Default max users
                billingEmail: company.email || '',
                billingCycle: 'monthly',
                nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                ownerId: 'owner-1',
                ownerName: 'John Doe'
            }));
        }
    });
    // Create organization mutation
    const createOrganization = useMutation({
        mutationFn: async (orgData) => {
            return await apiService.createCompany(orgData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['organizations'] });
            setIsCreateOpen(false);
            toast.success('Organization created successfully');
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to create organization');
        }
    });
    // Update organization mutation
    const updateOrganization = useMutation({
        mutationFn: async ({ id, data }) => {
            return await apiService.updateCompany(id, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['organizations'] });
            setEditingOrg(null);
            toast.success('Organization updated successfully');
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to update organization');
        }
    });
    // Delete organization mutation
    const deleteOrganization = useMutation({
        mutationFn: async (id) => {
            return await apiService.deleteCompany(id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['organizations'] });
            toast.success('Organization deleted successfully');
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to delete organization');
        }
    });
    const handleCreate = (data) => {
        createOrganization.mutate(data);
    };
    const handleUpdate = (id, data) => {
        updateOrganization.mutate({ id, data });
    };
    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this organization? This action cannot be undone.')) {
            deleteOrganization.mutate(id);
        }
    };
    const getSubscriptionColor = (subscription) => {
        switch (subscription) {
            case 'Enterprise': return 'bg-purple-100 text-purple-800';
            case 'Professional': return 'bg-blue-100 text-blue-800';
            case 'Standard': return 'bg-green-100 text-green-800';
            case 'Trial': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'trial': return 'bg-yellow-100 text-yellow-800';
            case 'inactive': return 'bg-gray-100 text-gray-800';
            case 'suspended': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-slate-900", children: "Organization Management" }), _jsx("p", { className: "text-slate-600 mt-1", children: "Manage organizations, subscriptions, and user access" })] }), _jsxs(Dialog, { open: isCreateOpen, onOpenChange: setIsCreateOpen, children: [_jsx(DialogTrigger, { asChild: true, children: _jsxs(Button, { className: "bg-blue-600 hover:bg-blue-700", children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), "Add Organization"] }) }), _jsxs(DialogContent, { className: "max-w-3xl max-h-[90vh] overflow-y-auto", children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { children: "Create New Organization" }) }), _jsx(OrganizationForm, { onSubmit: handleCreate, onCancel: () => setIsCreateOpen(false), isLoading: createOrganization.isPending })] })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center", children: _jsx(Building2, { className: "w-5 h-5 text-blue-600" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-muted-foreground", children: "Total Organizations" }), _jsx("p", { className: "text-xl font-bold", children: organizations?.length || 0 })] })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center", children: _jsx(CheckCircle, { className: "w-5 h-5 text-green-600" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-muted-foreground", children: "Active Organizations" }), _jsx("p", { className: "text-xl font-bold", children: organizations?.filter((org) => org.status === 'active').length || 0 })] })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center", children: _jsx(Users, { className: "w-5 h-5 text-purple-600" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-muted-foreground", children: "Total Users" }), _jsx("p", { className: "text-xl font-bold", children: organizations?.reduce((sum, org) => sum + org.userCount, 0) || 0 })] })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center", children: _jsx(Clock, { className: "w-5 h-5 text-yellow-600" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-muted-foreground", children: "Trial Organizations" }), _jsx("p", { className: "text-xl font-bold", children: organizations?.filter((org) => org.status === 'trial').length || 0 })] })] }) }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Organizations" }) }), _jsx(CardContent, { children: isLoading ? (_jsx("div", { className: "flex items-center justify-center py-8", children: _jsx("div", { className: "text-muted-foreground", children: "Loading organizations..." }) })) : organizations?.length === 0 ? (_jsxs("div", { className: "text-center py-8", children: [_jsx(Building2, { className: "w-12 h-12 text-muted-foreground mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-medium text-slate-900 mb-2", children: "No organizations found" }), _jsx("p", { className: "text-muted-foreground mb-4", children: "Get started by creating your first organization." }), _jsxs(Button, { onClick: () => setIsCreateOpen(true), children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), "Create Organization"] })] })) : (_jsx("div", { className: "space-y-4", children: organizations?.map((org) => (_jsx(OrganizationCard, { organization: org, onEdit: () => setEditingOrg(org), onView: () => setViewingOrg(org), onDelete: () => handleDelete(org.id), getSubscriptionColor: getSubscriptionColor, getStatusColor: getStatusColor }, org.id))) })) })] }), editingOrg && (_jsx(Dialog, { open: !!editingOrg, onOpenChange: () => setEditingOrg(null), children: _jsxs(DialogContent, { className: "max-w-3xl max-h-[90vh] overflow-y-auto", children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { children: "Edit Organization" }) }), _jsx(OrganizationForm, { organization: editingOrg, onSubmit: (data) => handleUpdate(editingOrg.id, data), onCancel: () => setEditingOrg(null), isLoading: updateOrganization.isPending })] }) })), viewingOrg && (_jsx(Dialog, { open: !!viewingOrg, onOpenChange: () => setViewingOrg(null), children: _jsxs(DialogContent, { className: "max-w-4xl max-h-[90vh] overflow-y-auto", children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { children: "Organization Details" }) }), _jsx(OrganizationDetails, { organization: viewingOrg })] }) }))] }));
}
function OrganizationCard({ organization, onEdit, onView, onDelete, getSubscriptionColor, getStatusColor }) {
    return (_jsxs("div", { className: "flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center", children: _jsx(Building2, { className: "w-6 h-6 text-slate-600" }) }), _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("h3", { className: "font-medium text-slate-900", children: organization.name }), _jsx(Badge, { className: getStatusColor(organization.status), children: organization.status.charAt(0).toUpperCase() + organization.status.slice(1) }), _jsx(Badge, { className: getSubscriptionColor(organization.subscription), children: organization.subscription })] }), _jsx("p", { className: "text-sm text-muted-foreground", children: organization.type }), _jsxs("div", { className: "flex items-center gap-4 mt-1", children: [_jsxs("div", { className: "flex items-center gap-1 text-xs text-muted-foreground", children: [_jsx(Users, { className: "w-3 h-3" }), organization.userCount, "/", organization.maxUsers, " users"] }), organization.email && (_jsxs("div", { className: "flex items-center gap-1 text-xs text-muted-foreground", children: [_jsx(Mail, { className: "w-3 h-3" }), organization.email] })), organization.website && (_jsxs("div", { className: "flex items-center gap-1 text-xs text-muted-foreground", children: [_jsx(Globe, { className: "w-3 h-3" }), organization.website] }))] })] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Button, { variant: "ghost", size: "sm", onClick: onView, children: _jsx(Eye, { className: "w-4 h-4" }) }), _jsx(Button, { variant: "ghost", size: "sm", onClick: onEdit, children: _jsx(Edit, { className: "w-4 h-4" }) }), _jsx(Button, { variant: "ghost", size: "sm", onClick: onDelete, className: "text-red-600 hover:text-red-700", children: _jsx(Trash2, { className: "w-4 h-4" }) })] })] }));
}
function OrganizationForm({ organization, onSubmit, onCancel, isLoading }) {
    const [formData, setFormData] = useState({
        name: organization?.name || '',
        type: organization?.type || 'Corporation',
        email: organization?.email || '',
        phone: organization?.phone || '',
        website: organization?.website || '',
        address: organization?.address || '',
        city: organization?.city || '',
        state: organization?.state || '',
        postalCode: organization?.postalCode || '',
        country: organization?.country || 'US',
        description: organization?.description || '',
        status: organization?.status || 'active',
        subscription: organization?.subscription || 'Standard',
        maxUsers: organization?.maxUsers || 50,
        billingEmail: organization?.billingEmail || '',
        billingCycle: organization?.billingCycle || 'monthly'
    });
    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };
    return (_jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [_jsxs(Tabs, { defaultValue: "basic", className: "w-full", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-3", children: [_jsx(TabsTrigger, { value: "basic", children: "Basic Info" }), _jsx(TabsTrigger, { value: "subscription", children: "Subscription" }), _jsx(TabsTrigger, { value: "billing", children: "Billing" })] }), _jsxs(TabsContent, { value: "basic", className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "name", children: "Organization Name *" }), _jsx(Input, { id: "name", value: formData.name, onChange: (e) => setFormData({ ...formData, name: e.target.value }), placeholder: "Enter organization name", required: true })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "type", children: "Organization Type *" }), _jsxs(Select, { value: formData.type, onValueChange: (value) => setFormData({ ...formData, type: value }), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select type" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "Corporation", children: "Corporation" }), _jsx(SelectItem, { value: "LLC", children: "LLC" }), _jsx(SelectItem, { value: "Partnership", children: "Partnership" }), _jsx(SelectItem, { value: "Non-Profit", children: "Non-Profit" }), _jsx(SelectItem, { value: "Government", children: "Government" })] })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "email", children: "Email" }), _jsx(Input, { id: "email", type: "email", value: formData.email, onChange: (e) => setFormData({ ...formData, email: e.target.value }), placeholder: "organization@example.com" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "phone", children: "Phone" }), _jsx(Input, { id: "phone", value: formData.phone, onChange: (e) => setFormData({ ...formData, phone: e.target.value }), placeholder: "+1 (555) 123-4567" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "website", children: "Website" }), _jsx(Input, { id: "website", value: formData.website, onChange: (e) => setFormData({ ...formData, website: e.target.value }), placeholder: "https://example.com" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "address", children: "Address" }), _jsx(Input, { id: "address", value: formData.address, onChange: (e) => setFormData({ ...formData, address: e.target.value }), placeholder: "123 Main Street" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "city", children: "City" }), _jsx(Input, { id: "city", value: formData.city, onChange: (e) => setFormData({ ...formData, city: e.target.value }), placeholder: "New York" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "state", children: "State/Province" }), _jsx(Input, { id: "state", value: formData.state, onChange: (e) => setFormData({ ...formData, state: e.target.value }), placeholder: "NY" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "postalCode", children: "Postal Code" }), _jsx(Input, { id: "postalCode", value: formData.postalCode, onChange: (e) => setFormData({ ...formData, postalCode: e.target.value }), placeholder: "10001" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "country", children: "Country" }), _jsxs(Select, { value: formData.country, onValueChange: (value) => setFormData({ ...formData, country: value }), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "US", children: "United States" }), _jsx(SelectItem, { value: "CA", children: "Canada" }), _jsx(SelectItem, { value: "GB", children: "United Kingdom" }), _jsx(SelectItem, { value: "AU", children: "Australia" }), _jsx(SelectItem, { value: "DE", children: "Germany" }), _jsx(SelectItem, { value: "FR", children: "France" })] })] })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "description", children: "Description" }), _jsx(Textarea, { id: "description", value: formData.description, onChange: (e) => setFormData({ ...formData, description: e.target.value }), placeholder: "Brief description of the organization...", rows: 3 })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Switch, { id: "status", checked: formData.status === 'active', onCheckedChange: (checked) => setFormData({ ...formData, status: checked ? 'active' : 'inactive' }) }), _jsx(Label, { htmlFor: "status", children: "Active Organization" })] })] }), _jsxs(TabsContent, { value: "subscription", className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "subscription", children: "Subscription Plan *" }), _jsxs(Select, { value: formData.subscription, onValueChange: (value) => setFormData({ ...formData, subscription: value }), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select plan" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "Trial", children: "Trial (Free)" }), _jsx(SelectItem, { value: "Standard", children: "Standard ($29/month)" }), _jsx(SelectItem, { value: "Professional", children: "Professional ($79/month)" }), _jsx(SelectItem, { value: "Enterprise", children: "Enterprise ($199/month)" })] })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "maxUsers", children: "Maximum Users" }), _jsx(Input, { id: "maxUsers", type: "number", value: formData.maxUsers, onChange: (e) => setFormData({ ...formData, maxUsers: parseInt(e.target.value) || 0 }), placeholder: "50" })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsx("h4", { className: "font-medium text-slate-900", children: "Plan Features" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx("h5", { className: "text-sm font-medium", children: "Standard Plan" }), _jsxs("ul", { className: "text-xs text-muted-foreground space-y-1", children: [_jsx("li", { children: "\u2022 Up to 10 users" }), _jsx("li", { children: "\u2022 Basic reporting" }), _jsx("li", { children: "\u2022 Email support" }), _jsx("li", { children: "\u2022 5GB storage" })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("h5", { className: "text-sm font-medium", children: "Professional Plan" }), _jsxs("ul", { className: "text-xs text-muted-foreground space-y-1", children: [_jsx("li", { children: "\u2022 Up to 50 users" }), _jsx("li", { children: "\u2022 Advanced reporting" }), _jsx("li", { children: "\u2022 Priority support" }), _jsx("li", { children: "\u2022 50GB storage" })] })] })] })] })] }), _jsxs(TabsContent, { value: "billing", className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "billingEmail", children: "Billing Email *" }), _jsx(Input, { id: "billingEmail", type: "email", value: formData.billingEmail, onChange: (e) => setFormData({ ...formData, billingEmail: e.target.value }), placeholder: "billing@example.com", required: true })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "billingCycle", children: "Billing Cycle" }), _jsxs(Select, { value: formData.billingCycle, onValueChange: (value) => setFormData({ ...formData, billingCycle: value }), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "monthly", children: "Monthly" }), _jsx(SelectItem, { value: "yearly", children: "Yearly (20% discount)" })] })] })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsx("h4", { className: "font-medium text-slate-900", children: "Billing Information" }), _jsxs("div", { className: "p-4 bg-slate-50 rounded-lg", children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx(CreditCard, { className: "w-4 h-4 text-slate-600" }), _jsx("span", { className: "text-sm font-medium", children: "Payment Method" })] }), _jsx("p", { className: "text-sm text-muted-foreground", children: "No payment method on file" }), _jsx(Button, { variant: "outline", size: "sm", className: "mt-2", children: "Add Payment Method" })] })] })] })] }), _jsx(Separator, {}), _jsxs("div", { className: "flex justify-end gap-2", children: [_jsx(Button, { type: "button", variant: "outline", onClick: onCancel, children: "Cancel" }), _jsx(Button, { type: "submit", disabled: isLoading, children: isLoading ? 'Saving...' : organization ? 'Update Organization' : 'Create Organization' })] })] }));
}
function OrganizationDetails({ organization }) {
    const getSubscriptionIcon = (subscription) => {
        switch (subscription) {
            case 'Enterprise': return _jsx(Crown, { className: "w-4 h-4" });
            case 'Professional': return _jsx(Shield, { className: "w-4 h-4" });
            case 'Standard': return _jsx(CheckCircle, { className: "w-4 h-4" });
            case 'Trial': return _jsx(Clock, { className: "w-4 h-4" });
            default: return _jsx(Building2, { className: "w-4 h-4" });
        }
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center", children: _jsx(Building2, { className: "w-8 h-8 text-slate-600" }) }), _jsxs("div", { children: [_jsx("h3", { className: "text-xl font-bold text-slate-900", children: organization.name }), _jsx("p", { className: "text-slate-600", children: organization.type }), _jsxs("div", { className: "flex items-center gap-2 mt-1", children: [_jsx(Badge, { variant: "outline", children: organization.status }), _jsxs(Badge, { variant: "secondary", className: "flex items-center gap-1", children: [getSubscriptionIcon(organization.subscription), organization.subscription] })] })] })] }), _jsxs(Tabs, { defaultValue: "overview", className: "w-full", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-4", children: [_jsx(TabsTrigger, { value: "overview", children: "Overview" }), _jsx(TabsTrigger, { value: "users", children: "Users" }), _jsx(TabsTrigger, { value: "billing", children: "Billing" }), _jsx(TabsTrigger, { value: "settings", children: "Settings" })] }), _jsxs(TabsContent, { value: "overview", className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { className: "space-y-4", children: [_jsx("h4", { className: "font-medium text-slate-900", children: "Contact Information" }), _jsxs("div", { className: "space-y-2", children: [organization.email && (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Mail, { className: "w-4 h-4 text-slate-500" }), _jsx("span", { className: "text-sm", children: organization.email })] })), organization.phone && (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Phone, { className: "w-4 h-4 text-slate-500" }), _jsx("span", { className: "text-sm", children: organization.phone })] })), organization.website && (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Globe, { className: "w-4 h-4 text-slate-500" }), _jsx("a", { href: organization.website, target: "_blank", rel: "noopener noreferrer", className: "text-sm text-blue-600 hover:underline", children: organization.website })] }))] })] }), _jsxs("div", { className: "space-y-4", children: [_jsx("h4", { className: "font-medium text-slate-900", children: "Address" }), _jsxs("div", { className: "flex items-start gap-2", children: [_jsx(MapPin, { className: "w-4 h-4 text-slate-500 mt-0.5" }), _jsxs("div", { className: "text-sm", children: [organization.address && _jsx("div", { children: organization.address }), (organization.city || organization.state || organization.postalCode) && (_jsxs("div", { children: [organization.city && organization.state ? `${organization.city}, ${organization.state}` : organization.city || organization.state, organization.postalCode && ` ${organization.postalCode}`] })), organization.country && _jsx("div", { children: organization.country })] })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsx("h4", { className: "font-medium text-slate-900", children: "Subscription Details" }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-sm text-slate-500", children: "Plan:" }), _jsx("span", { className: "text-sm font-medium", children: organization.subscription })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-sm text-slate-500", children: "Users:" }), _jsxs("span", { className: "text-sm font-medium", children: [organization.userCount, "/", organization.maxUsers] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-sm text-slate-500", children: "Billing:" }), _jsx("span", { className: "text-sm font-medium capitalize", children: organization.billingCycle })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-sm text-slate-500", children: "Next Billing:" }), _jsx("span", { className: "text-sm", children: new Date(organization.nextBillingDate).toLocaleDateString() })] })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsx("h4", { className: "font-medium text-slate-900", children: "Timeline" }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Calendar, { className: "w-4 h-4 text-slate-500" }), _jsx("span", { className: "text-sm text-slate-500", children: "Created:" }), _jsx("span", { className: "text-sm", children: new Date(organization.createdAt).toLocaleDateString() })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Calendar, { className: "w-4 h-4 text-slate-500" }), _jsx("span", { className: "text-sm text-slate-500", children: "Updated:" }), _jsx("span", { className: "text-sm", children: new Date(organization.updatedAt).toLocaleDateString() })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Users, { className: "w-4 h-4 text-slate-500" }), _jsx("span", { className: "text-sm text-slate-500", children: "Owner:" }), _jsx("span", { className: "text-sm", children: organization.ownerName })] })] })] })] }), organization.description && (_jsxs("div", { className: "space-y-2", children: [_jsx("h4", { className: "font-medium text-slate-900", children: "Description" }), _jsx("p", { className: "text-sm text-slate-600", children: organization.description })] }))] }), _jsxs(TabsContent, { value: "users", className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h4", { className: "font-medium text-slate-900", children: "Organization Users" }), _jsxs(Button, { size: "sm", children: [_jsx(UserPlus, { className: "w-4 h-4 mr-2" }), "Invite User"] })] }), _jsx("div", { className: "text-center py-8 text-muted-foreground", children: "User management features coming soon..." })] }), _jsxs(TabsContent, { value: "billing", className: "space-y-4", children: [_jsx("h4", { className: "font-medium text-slate-900", children: "Billing Information" }), _jsx("div", { className: "text-center py-8 text-muted-foreground", children: "Billing management features coming soon..." })] }), _jsxs(TabsContent, { value: "settings", className: "space-y-4", children: [_jsx("h4", { className: "font-medium text-slate-900", children: "Organization Settings" }), _jsx("div", { className: "text-center py-8 text-muted-foreground", children: "Advanced settings coming soon..." })] })] })] }));
}
