import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Switch } from "../components/ui/switch";
import { Badge } from "../components/ui/badge";
import { Upload, Palette, Type, Globe, Save, RefreshCw, CheckCircle, AlertCircle } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import apiService from '@/lib/api';
const TEMPLATE_OPTIONS = [
    { value: 'modern', label: 'Modern', description: 'Clean, contemporary design with bold typography' },
    { value: 'classic', label: 'Classic', description: 'Traditional business layout with formal styling' },
    { value: 'minimal', label: 'Minimal', description: 'Simple, uncluttered design focusing on content' },
    { value: 'professional', label: 'Professional', description: 'Corporate-style layout with structured sections' }
];
const FONT_OPTIONS = [
    { value: 'Inter', label: 'Inter', description: 'Modern, clean sans-serif' },
    { value: 'Roboto', label: 'Roboto', description: 'Google font, highly readable' },
    { value: 'Open Sans', label: 'Open Sans', description: 'Friendly, approachable sans-serif' },
    { value: 'Lato', label: 'Lato', description: 'Humanist sans-serif with warmth' },
    { value: 'Montserrat', label: 'Montserrat', description: 'Geometric sans-serif, modern' },
    { value: 'Source Sans Pro', label: 'Source Sans Pro', description: 'Adobe font, professional' }
];
export function CompanyBranding({ companyId, onSave }) {
    const [formData, setFormData] = useState({});
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const queryClient = useQueryClient();
    // Load company data
    const { data: company, isLoading } = useQuery({
        queryKey: ['company', companyId],
        queryFn: () => apiService.getCompany(companyId),
        enabled: !!companyId
    });
    // Update form data when company data loads
    useEffect(() => {
        if (company) {
            setFormData({
                name: company.name,
                logoUrl: company.logoUrl,
                primaryColor: company.primaryColor || '#009688',
                secondaryColor: company.secondaryColor || '#1565c0',
                fontFamily: company.fontFamily || 'Inter',
                website: company.website,
                email: company.email,
                phone: company.phone,
                address: company.address,
                city: company.city,
                state: company.state,
                postalCode: company.postalCode,
                invoiceTemplate: company.invoiceTemplate || 'modern',
                invoiceFooter: company.invoiceFooter,
                invoiceTerms: company.invoiceTerms,
                showLogo: company.showLogo !== false,
                showWebsite: company.showWebsite !== false,
                showAddress: company.showAddress !== false
            });
        }
    }, [company]);
    const handleSave = async () => {
        try {
            setSaving(true);
            setError(null);
            setSuccess(false);
            await apiService.updateCompany(companyId, formData);
            // Invalidate queries to refresh data
            await queryClient.invalidateQueries({ queryKey: ['company', companyId] });
            await queryClient.invalidateQueries({ queryKey: ['companies'] });
            setSuccess(true);
            onSave?.();
            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(false), 3000);
        }
        catch (err) {
            setError(err.message || 'Failed to save branding settings');
        }
        finally {
            setSaving(false);
        }
    };
    const handleLogoUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file)
            return;
        // In a real implementation, you would upload to a file storage service
        // For now, we'll simulate with a data URL
        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result;
            setFormData(prev => ({ ...prev, logoUrl: result }));
        };
        reader.readAsDataURL(file);
    };
    if (isLoading) {
        return (_jsx("div", { className: "space-y-6", children: _jsxs("div", { className: "animate-pulse", children: [_jsx("div", { className: "h-8 bg-gray-200 rounded w-1/3 mb-4" }), _jsx("div", { className: "h-64 bg-gray-200 rounded" })] }) }));
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold", children: "Company Branding" }), _jsx("p", { className: "text-gray-600", children: "Customize your company's visual identity and invoice templates" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [success && (_jsxs(Badge, { variant: "outline", className: "text-green-600 border-green-600", children: [_jsx(CheckCircle, { className: "w-3 h-3 mr-1" }), "Saved"] })), _jsx(Button, { onClick: handleSave, disabled: saving, children: saving ? (_jsxs(_Fragment, { children: [_jsx(RefreshCw, { className: "w-4 h-4 mr-2 animate-spin" }), "Saving..."] })) : (_jsxs(_Fragment, { children: [_jsx(Save, { className: "w-4 h-4 mr-2" }), "Save Changes"] })) })] })] }), error && (_jsx(Card, { className: "border-red-200 bg-red-50", children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center gap-2 text-red-800", children: [_jsx(AlertCircle, { className: "w-5 h-5" }), _jsx("span", { children: error })] }) }) })), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Palette, { className: "w-5 h-5" }), "Visual Identity"] }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { children: "Company Logo" }), _jsxs("div", { className: "mt-2 space-y-3", children: [formData.logoUrl && (_jsxs("div", { className: "flex items-center gap-3 p-3 border rounded-lg", children: [_jsx("img", { src: formData.logoUrl, alt: "Company logo", className: "w-12 h-12 object-contain" }), _jsxs("div", { className: "flex-1", children: [_jsx("div", { className: "text-sm font-medium", children: "Current Logo" }), _jsx("div", { className: "text-xs text-gray-500", children: "Click to change" })] })] })), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("input", { type: "file", accept: "image/*", onChange: handleLogoUpload, className: "hidden", id: "logo-upload" }), _jsx(Button, { variant: "outline", asChild: true, children: _jsxs("label", { htmlFor: "logo-upload", className: "cursor-pointer", children: [_jsx(Upload, { className: "w-4 h-4 mr-2" }), formData.logoUrl ? 'Change Logo' : 'Upload Logo'] }) }), _jsx(Switch, { checked: formData.showLogo, onCheckedChange: (checked) => setFormData(prev => ({ ...prev, showLogo: checked })) }), _jsx(Label, { className: "text-sm", children: "Show on invoices" })] })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { children: "Primary Color" }), _jsxs("div", { className: "flex items-center gap-2 mt-1", children: [_jsx("input", { type: "color", value: formData.primaryColor, onChange: (e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value })), className: "w-10 h-10 rounded border" }), _jsx(Input, { value: formData.primaryColor, onChange: (e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value })), placeholder: "#009688", className: "flex-1" })] })] }), _jsxs("div", { children: [_jsx(Label, { children: "Secondary Color" }), _jsxs("div", { className: "flex items-center gap-2 mt-1", children: [_jsx("input", { type: "color", value: formData.secondaryColor, onChange: (e) => setFormData(prev => ({ ...prev, secondaryColor: e.target.value })), className: "w-10 h-10 rounded border" }), _jsx(Input, { value: formData.secondaryColor, onChange: (e) => setFormData(prev => ({ ...prev, secondaryColor: e.target.value })), placeholder: "#1565c0", className: "flex-1" })] })] })] }), _jsxs("div", { children: [_jsx(Label, { children: "Font Family" }), _jsxs(Select, { value: formData.fontFamily, onValueChange: (value) => setFormData(prev => ({ ...prev, fontFamily: value })), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsx(SelectContent, { children: FONT_OPTIONS.map((font) => (_jsx(SelectItem, { value: font.value, children: _jsxs("div", { children: [_jsx("div", { className: "font-medium", children: font.label }), _jsx("div", { className: "text-xs text-gray-500", children: font.description })] }) }, font.value))) })] })] })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Globe, { className: "w-5 h-5" }), "Company Information"] }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { children: "Company Name" }), _jsx(Input, { value: formData.name || '', onChange: (e) => setFormData(prev => ({ ...prev, name: e.target.value })), placeholder: "Your Company Name" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { children: "Website" }), _jsx(Input, { value: formData.website || '', onChange: (e) => setFormData(prev => ({ ...prev, website: e.target.value })), placeholder: "https://yourcompany.com" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Switch, { checked: formData.showWebsite, onCheckedChange: (checked) => setFormData(prev => ({ ...prev, showWebsite: checked })) }), _jsx(Label, { className: "text-sm", children: "Show on invoices" })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { children: "Email" }), _jsx(Input, { value: formData.email || '', onChange: (e) => setFormData(prev => ({ ...prev, email: e.target.value })), placeholder: "contact@yourcompany.com" })] }), _jsxs("div", { children: [_jsx(Label, { children: "Phone" }), _jsx(Input, { value: formData.phone || '', onChange: (e) => setFormData(prev => ({ ...prev, phone: e.target.value })), placeholder: "+1 (555) 123-4567" })] })] }), _jsxs("div", { children: [_jsx(Label, { children: "Address" }), _jsxs("div", { className: "space-y-2", children: [_jsx(Input, { value: formData.address || '', onChange: (e) => setFormData(prev => ({ ...prev, address: e.target.value })), placeholder: "Street Address" }), _jsxs("div", { className: "grid grid-cols-3 gap-2", children: [_jsx(Input, { value: formData.city || '', onChange: (e) => setFormData(prev => ({ ...prev, city: e.target.value })), placeholder: "City" }), _jsx(Input, { value: formData.state || '', onChange: (e) => setFormData(prev => ({ ...prev, state: e.target.value })), placeholder: "State" }), _jsx(Input, { value: formData.postalCode || '', onChange: (e) => setFormData(prev => ({ ...prev, postalCode: e.target.value })), placeholder: "ZIP Code" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Switch, { checked: formData.showAddress, onCheckedChange: (checked) => setFormData(prev => ({ ...prev, showAddress: checked })) }), _jsx(Label, { className: "text-sm", children: "Show address on invoices" })] })] })] })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Type, { className: "w-5 h-5" }), "Invoice Templates"] }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { children: "Template Style" }), _jsxs(Select, { value: formData.invoiceTemplate, onValueChange: (value) => setFormData(prev => ({ ...prev, invoiceTemplate: value })), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsx(SelectContent, { children: TEMPLATE_OPTIONS.map((template) => (_jsx(SelectItem, { value: template.value, children: _jsxs("div", { children: [_jsx("div", { className: "font-medium", children: template.label }), _jsx("div", { className: "text-xs text-gray-500", children: template.description })] }) }, template.value))) })] })] }), _jsxs("div", { children: [_jsx(Label, { children: "Invoice Footer" }), _jsx(Textarea, { value: formData.invoiceFooter || '', onChange: (e) => setFormData(prev => ({ ...prev, invoiceFooter: e.target.value })), placeholder: "Thank you for your business!", rows: 3 })] }), _jsxs("div", { children: [_jsx(Label, { children: "Payment Terms" }), _jsx(Textarea, { value: formData.invoiceTerms || '', onChange: (e) => setFormData(prev => ({ ...prev, invoiceTerms: e.target.value })), placeholder: "Payment is due within 30 days of invoice date.", rows: 3 })] })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Preview" }) }), _jsx(CardContent, { children: _jsx("div", { className: "border rounded-lg p-4 bg-white", children: _jsxs("div", { className: "space-y-3", children: [formData.logoUrl && formData.showLogo && (_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("img", { src: formData.logoUrl, alt: "Logo preview", className: "w-8 h-8 object-contain" }), _jsx("div", { className: "font-semibold", style: { color: formData.primaryColor }, children: formData.name || 'Your Company' })] })), _jsxs("div", { className: "text-sm text-gray-600 space-y-1", children: [formData.showWebsite && formData.website && (_jsx("div", { children: formData.website })), formData.showAddress && formData.address && (_jsxs("div", { children: [formData.address, formData.city && `, ${formData.city}`, formData.state && `, ${formData.state}`, formData.postalCode && ` ${formData.postalCode}`] })), formData.email && _jsx("div", { children: formData.email }), formData.phone && _jsx("div", { children: formData.phone })] }), _jsxs("div", { className: "pt-3 border-t", children: [_jsxs("div", { className: "text-xs text-gray-500 mb-2", children: ["Template: ", formData.invoiceTemplate] }), _jsxs("div", { className: "text-sm", style: { fontFamily: formData.fontFamily }, children: ["Sample invoice content with ", formData.fontFamily, " font"] })] })] }) }) })] })] })] }));
}
