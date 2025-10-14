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
import { Building2, Plus, Edit, Trash2, Eye, Globe, MapPin, Phone, Mail, Calendar, Users, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from 'sonner';
import { apiService } from '@/lib/api';
export function CompanyManagement() {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingCompany, setEditingCompany] = useState(null);
    const [viewingCompany, setViewingCompany] = useState(null);
    const queryClient = useQueryClient();
    // Fetch companies
    const { data: companies, isLoading } = useQuery({
        queryKey: ['companies'],
        queryFn: async () => {
            const response = await apiService.getCompanies();
            return Array.isArray(response) ? response : (response?.data || []);
        }
    });
    // Create company mutation
    const createCompany = useMutation({
        mutationFn: async (companyData) => {
            return await apiService.createCompany(companyData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['companies'] });
            setIsCreateOpen(false);
            toast.success('Company created successfully');
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to create company');
        }
    });
    // Update company mutation
    const updateCompany = useMutation({
        mutationFn: async ({ id, data }) => {
            return await apiService.updateCompany(id, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['companies'] });
            setEditingCompany(null);
            toast.success('Company updated successfully');
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to update company');
        }
    });
    // Delete company mutation
    const deleteCompany = useMutation({
        mutationFn: async (id) => {
            return await apiService.deleteCompany(id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['companies'] });
            toast.success('Company deleted successfully');
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to delete company');
        }
    });
    const handleCreate = (data) => {
        createCompany.mutate(data);
    };
    const handleUpdate = (id, data) => {
        updateCompany.mutate({ id, data });
    };
    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this company? This action cannot be undone.')) {
            deleteCompany.mutate(id);
        }
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-slate-900", children: "Company Management" }), _jsx("p", { className: "text-slate-600 mt-1", children: "Manage your companies and organization settings" })] }), _jsxs(Dialog, { open: isCreateOpen, onOpenChange: setIsCreateOpen, children: [_jsx(DialogTrigger, { asChild: true, children: _jsxs(Button, { className: "bg-blue-600 hover:bg-blue-700", children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), "Add Company"] }) }), _jsxs(DialogContent, { className: "max-w-2xl max-h-[90vh] overflow-y-auto", children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { children: "Create New Company" }) }), _jsx(CompanyForm, { onSubmit: handleCreate, onCancel: () => setIsCreateOpen(false), isLoading: createCompany.isPending })] })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center", children: _jsx(Building2, { className: "w-5 h-5 text-blue-600" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-muted-foreground", children: "Total Companies" }), _jsx("p", { className: "text-xl font-bold", children: companies?.length || 0 })] })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center", children: _jsx(CheckCircle, { className: "w-5 h-5 text-green-600" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-muted-foreground", children: "Active Companies" }), _jsx("p", { className: "text-xl font-bold", children: companies?.filter((c) => c.isActive).length || 0 })] })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center", children: _jsx(Users, { className: "w-5 h-5 text-purple-600" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-muted-foreground", children: "Total Users" }), _jsx("p", { className: "text-xl font-bold", children: companies?.reduce((sum, c) => sum + (c.userCount || 0), 0) || 0 })] })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center", children: _jsx(AlertCircle, { className: "w-5 h-5 text-amber-600" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-muted-foreground", children: "Inactive Companies" }), _jsx("p", { className: "text-xl font-bold", children: companies?.filter((c) => !c.isActive).length || 0 })] })] }) }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Companies" }) }), _jsx(CardContent, { children: isLoading ? (_jsx("div", { className: "flex items-center justify-center py-8", children: _jsx("div", { className: "text-muted-foreground", children: "Loading companies..." }) })) : companies?.length === 0 ? (_jsxs("div", { className: "text-center py-8", children: [_jsx(Building2, { className: "w-12 h-12 text-muted-foreground mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-medium text-slate-900 mb-2", children: "No companies found" }), _jsx("p", { className: "text-muted-foreground mb-4", children: "Get started by creating your first company." }), _jsxs(Button, { onClick: () => setIsCreateOpen(true), children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), "Create Company"] })] })) : (_jsx("div", { className: "space-y-4", children: companies?.map((company) => (_jsx(CompanyCard, { company: company, onEdit: () => setEditingCompany(company), onView: () => setViewingCompany(company), onDelete: () => handleDelete(company.id) }, company.id))) })) })] }), editingCompany && (_jsx(Dialog, { open: !!editingCompany, onOpenChange: () => setEditingCompany(null), children: _jsxs(DialogContent, { className: "max-w-2xl max-h-[90vh] overflow-y-auto", children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { children: "Edit Company" }) }), _jsx(CompanyForm, { company: editingCompany, onSubmit: (data) => handleUpdate(editingCompany.id, data), onCancel: () => setEditingCompany(null), isLoading: updateCompany.isPending })] }) })), viewingCompany && (_jsx(Dialog, { open: !!viewingCompany, onOpenChange: () => setViewingCompany(null), children: _jsxs(DialogContent, { className: "max-w-2xl", children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { children: "Company Details" }) }), _jsx(CompanyDetails, { company: viewingCompany })] }) }))] }));
}
function CompanyCard({ company, onEdit, onView, onDelete }) {
    return (_jsxs("div", { className: "flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center", children: company.logoUrl ? (_jsx("img", { src: company.logoUrl, alt: company.name, className: "w-8 h-8 object-contain" })) : (_jsx(Building2, { className: "w-6 h-6 text-slate-600" })) }), _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("h3", { className: "font-medium text-slate-900", children: company.name }), _jsx(Badge, { variant: company.isActive ? "default" : "secondary", children: company.isActive ? "Active" : "Inactive" })] }), _jsx("p", { className: "text-sm text-muted-foreground", children: company.type }), _jsxs("div", { className: "flex items-center gap-4 mt-1", children: [company.email && (_jsxs("div", { className: "flex items-center gap-1 text-xs text-muted-foreground", children: [_jsx(Mail, { className: "w-3 h-3" }), company.email] })), company.website && (_jsxs("div", { className: "flex items-center gap-1 text-xs text-muted-foreground", children: [_jsx(Globe, { className: "w-3 h-3" }), company.website] })), company.city && company.state && (_jsxs("div", { className: "flex items-center gap-1 text-xs text-muted-foreground", children: [_jsx(MapPin, { className: "w-3 h-3" }), company.city, ", ", company.state] }))] })] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Button, { variant: "ghost", size: "sm", onClick: onView, children: _jsx(Eye, { className: "w-4 h-4" }) }), _jsx(Button, { variant: "ghost", size: "sm", onClick: onEdit, children: _jsx(Edit, { className: "w-4 h-4" }) }), _jsx(Button, { variant: "ghost", size: "sm", onClick: onDelete, className: "text-red-600 hover:text-red-700", children: _jsx(Trash2, { className: "w-4 h-4" }) })] })] }));
}
function CompanyForm({ company, onSubmit, onCancel, isLoading }) {
    const [formData, setFormData] = useState({
        name: company?.name || '',
        type: company?.type || 'Corporation',
        email: company?.email || '',
        phone: company?.phone || '',
        website: company?.website || '',
        address: company?.address || '',
        city: company?.city || '',
        state: company?.state || '',
        postalCode: company?.postalCode || '',
        country: company?.country || 'US',
        currency: company?.currency || 'USD',
        timezone: company?.timezone || 'UTC',
        description: company?.description || '',
        isActive: company?.isActive ?? true
    });
    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };
    return (_jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "name", children: "Company Name *" }), _jsx(Input, { id: "name", value: formData.name, onChange: (e) => setFormData({ ...formData, name: e.target.value }), placeholder: "Enter company name", required: true })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "type", children: "Company Type *" }), _jsxs(Select, { value: formData.type, onValueChange: (value) => setFormData({ ...formData, type: value }), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select type" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "Corporation", children: "Corporation" }), _jsx(SelectItem, { value: "LLC", children: "LLC" }), _jsx(SelectItem, { value: "Partnership", children: "Partnership" }), _jsx(SelectItem, { value: "Sole Proprietorship", children: "Sole Proprietorship" }), _jsx(SelectItem, { value: "Non-Profit", children: "Non-Profit" })] })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "email", children: "Email" }), _jsx(Input, { id: "email", type: "email", value: formData.email, onChange: (e) => setFormData({ ...formData, email: e.target.value }), placeholder: "company@example.com" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "phone", children: "Phone" }), _jsx(Input, { id: "phone", value: formData.phone, onChange: (e) => setFormData({ ...formData, phone: e.target.value }), placeholder: "+1 (555) 123-4567" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "website", children: "Website" }), _jsx(Input, { id: "website", value: formData.website, onChange: (e) => setFormData({ ...formData, website: e.target.value }), placeholder: "https://example.com" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "currency", children: "Currency" }), _jsxs(Select, { value: formData.currency, onValueChange: (value) => setFormData({ ...formData, currency: value }), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "USD", children: "USD - US Dollar" }), _jsx(SelectItem, { value: "EUR", children: "EUR - Euro" }), _jsx(SelectItem, { value: "GBP", children: "GBP - British Pound" }), _jsx(SelectItem, { value: "CAD", children: "CAD - Canadian Dollar" }), _jsx(SelectItem, { value: "AUD", children: "AUD - Australian Dollar" })] })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "address", children: "Address" }), _jsx(Input, { id: "address", value: formData.address, onChange: (e) => setFormData({ ...formData, address: e.target.value }), placeholder: "123 Main Street" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "city", children: "City" }), _jsx(Input, { id: "city", value: formData.city, onChange: (e) => setFormData({ ...formData, city: e.target.value }), placeholder: "New York" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "state", children: "State/Province" }), _jsx(Input, { id: "state", value: formData.state, onChange: (e) => setFormData({ ...formData, state: e.target.value }), placeholder: "NY" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "postalCode", children: "Postal Code" }), _jsx(Input, { id: "postalCode", value: formData.postalCode, onChange: (e) => setFormData({ ...formData, postalCode: e.target.value }), placeholder: "10001" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "country", children: "Country" }), _jsxs(Select, { value: formData.country, onValueChange: (value) => setFormData({ ...formData, country: value }), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "US", children: "United States" }), _jsx(SelectItem, { value: "CA", children: "Canada" }), _jsx(SelectItem, { value: "GB", children: "United Kingdom" }), _jsx(SelectItem, { value: "AU", children: "Australia" }), _jsx(SelectItem, { value: "DE", children: "Germany" }), _jsx(SelectItem, { value: "FR", children: "France" })] })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "timezone", children: "Timezone" }), _jsxs(Select, { value: formData.timezone, onValueChange: (value) => setFormData({ ...formData, timezone: value }), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "UTC", children: "UTC" }), _jsx(SelectItem, { value: "America/New_York", children: "Eastern Time" }), _jsx(SelectItem, { value: "America/Chicago", children: "Central Time" }), _jsx(SelectItem, { value: "America/Denver", children: "Mountain Time" }), _jsx(SelectItem, { value: "America/Los_Angeles", children: "Pacific Time" }), _jsx(SelectItem, { value: "Europe/London", children: "London" }), _jsx(SelectItem, { value: "Europe/Paris", children: "Paris" })] })] })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "description", children: "Description" }), _jsx(Textarea, { id: "description", value: formData.description, onChange: (e) => setFormData({ ...formData, description: e.target.value }), placeholder: "Brief description of the company...", rows: 3 })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Switch, { id: "isActive", checked: formData.isActive, onCheckedChange: (checked) => setFormData({ ...formData, isActive: checked }) }), _jsx(Label, { htmlFor: "isActive", children: "Active Company" })] }), _jsx(Separator, {}), _jsxs("div", { className: "flex justify-end gap-2", children: [_jsx(Button, { type: "button", variant: "outline", onClick: onCancel, children: "Cancel" }), _jsx(Button, { type: "submit", disabled: isLoading, children: isLoading ? 'Saving...' : company ? 'Update Company' : 'Create Company' })] })] }));
}
function CompanyDetails({ company }) {
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center", children: company.logoUrl ? (_jsx("img", { src: company.logoUrl, alt: company.name, className: "w-12 h-12 object-contain" })) : (_jsx(Building2, { className: "w-8 h-8 text-slate-600" })) }), _jsxs("div", { children: [_jsx("h3", { className: "text-xl font-bold text-slate-900", children: company.name }), _jsx("p", { className: "text-slate-600", children: company.type }), _jsx(Badge, { variant: company.isActive ? "default" : "secondary", children: company.isActive ? "Active" : "Inactive" })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { className: "space-y-4", children: [_jsx("h4", { className: "font-medium text-slate-900", children: "Contact Information" }), _jsxs("div", { className: "space-y-2", children: [company.email && (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Mail, { className: "w-4 h-4 text-slate-500" }), _jsx("span", { className: "text-sm", children: company.email })] })), company.phone && (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Phone, { className: "w-4 h-4 text-slate-500" }), _jsx("span", { className: "text-sm", children: company.phone })] })), company.website && (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Globe, { className: "w-4 h-4 text-slate-500" }), _jsx("a", { href: company.website, target: "_blank", rel: "noopener noreferrer", className: "text-sm text-blue-600 hover:underline", children: company.website })] }))] })] }), _jsxs("div", { className: "space-y-4", children: [_jsx("h4", { className: "font-medium text-slate-900", children: "Address" }), _jsxs("div", { className: "flex items-start gap-2", children: [_jsx(MapPin, { className: "w-4 h-4 text-slate-500 mt-0.5" }), _jsxs("div", { className: "text-sm", children: [company.address && _jsx("div", { children: company.address }), (company.city || company.state || company.postalCode) && (_jsxs("div", { children: [company.city && company.state ? `${company.city}, ${company.state}` : company.city || company.state, company.postalCode && ` ${company.postalCode}`] })), company.country && _jsx("div", { children: company.country })] })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsx("h4", { className: "font-medium text-slate-900", children: "Settings" }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-sm text-slate-500", children: "Currency:" }), _jsx("span", { className: "text-sm font-medium", children: company.currency })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-sm text-slate-500", children: "Timezone:" }), _jsx("span", { className: "text-sm font-medium", children: company.timezone })] })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsx("h4", { className: "font-medium text-slate-900", children: "Timeline" }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Calendar, { className: "w-4 h-4 text-slate-500" }), _jsx("span", { className: "text-sm text-slate-500", children: "Created:" }), _jsx("span", { className: "text-sm", children: new Date(company.createdAt).toLocaleDateString() })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Calendar, { className: "w-4 h-4 text-slate-500" }), _jsx("span", { className: "text-sm text-slate-500", children: "Updated:" }), _jsx("span", { className: "text-sm", children: new Date(company.updatedAt).toLocaleDateString() })] })] })] })] }), company.description && (_jsxs("div", { className: "space-y-2", children: [_jsx("h4", { className: "font-medium text-slate-900", children: "Description" }), _jsx("p", { className: "text-sm text-slate-600", children: company.description })] }))] }));
}
