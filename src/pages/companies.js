import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Alert, AlertDescription } from '../components/ui/alert';
import { PageLayout } from '../components/page-layout';
import { Building2, Plus, Calendar, Edit, Trash2, Mail, MapPin, Eye, Save, X, Camera, Briefcase, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { apiService } from '../lib/api';
import { useAuth } from '../contexts/auth-context';
import { useToast } from '../hooks/use-toast';
export default function CompaniesPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    // Use React Query for companies data
    const { data: companiesData, isLoading: loading, error } = useQuery({
        queryKey: ['companies'],
        queryFn: async () => {
            const response = await apiService.getCompanies({ page: 1, pageSize: 50 });
            const companiesData = response?.data || response || [];
            // Process companies to extract fields from companySettings
            const processedCompanies = companiesData.map((company) => {
                console.log('🔄 Processing company:', company.name, 'logoUrl:', company.logoUrl);
                if (company.companySettings && Array.isArray(company.companySettings)) {
                    const settings = company.companySettings;
                    // Extract fields from settings and add them to the company object
                    const processed = {
                        ...company,
                        status: settings.find((s) => s.key === 'status')?.value || 'active',
                        description: settings.find((s) => s.key === 'description')?.value || '',
                        employees: parseInt(settings.find((s) => s.key === 'employees')?.value || '0'),
                        foundedYear: parseInt(settings.find((s) => s.key === 'foundedYear')?.value || new Date().getFullYear().toString()),
                        businessType: settings.find((s) => s.key === 'businessType')?.value || '',
                        registrationNumber: settings.find((s) => s.key === 'registrationNumber')?.value || '',
                        timezone: settings.find((s) => s.key === 'timezone')?.value || 'America/New_York',
                        settings: {
                            allowMultipleCurrencies: settings.find((s) => s.key === 'allowMultipleCurrencies')?.value === 'true',
                            enableTaxCalculation: settings.find((s) => s.key === 'enableTaxCalculation')?.value === 'true',
                            enableInventoryTracking: settings.find((s) => s.key === 'enableInventoryTracking')?.value === 'true',
                            autoBackup: settings.find((s) => s.key === 'autoBackup')?.value === 'true',
                        }
                    };
                    console.log('✅ Processed company:', processed.name, 'logoUrl:', processed.logoUrl);
                    return processed;
                }
                console.log('Company without settings:', company.name, 'logoUrl:', company.logoUrl);
                return company;
            });
            console.log('📊 Companies loaded:', processedCompanies.length);
            console.log('📊 First company sample:', processedCompanies[0]);
            console.log('📊 Companies with logos:', processedCompanies.filter((c) => c.logoUrl).map((c) => ({ name: c.name, logoUrl: c.logoUrl })));
            return processedCompanies;
        },
        enabled: !!user
    });
    const companies = companiesData || [];
    // State for modals and forms
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedLogoFile, setSelectedLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        website: '',
        address: {
            street: '',
            city: '',
            state: '',
            country: '',
            zipCode: '',
        },
        businessType: '',
        industry: '',
        taxId: '',
        registrationNumber: '',
        fiscalYearStart: 'January',
        currency: 'USD',
        timezone: 'America/New_York',
        description: '',
        employees: 0,
        foundedYear: new Date().getFullYear(),
        status: 'active',
        tenantId: user?.tenantId,
        settings: {
            allowMultipleCurrencies: false,
            enableTaxCalculation: true,
            enableInventoryTracking: false,
            autoBackup: true,
        }
    });
    // React Query mutations for create/update/delete
    const createCompanyMutation = useMutation({
        mutationFn: async (data) => {
            const filteredFormData = { ...data };
            // Remove empty address fields to avoid validation errors
            if (filteredFormData.address && typeof filteredFormData.address === 'object') {
                const address = filteredFormData.address;
                if (!address.street?.trim())
                    delete address.street;
                if (!address.city?.trim())
                    delete address.city;
                if (!address.state?.trim())
                    delete address.state;
                if (!address.country?.trim())
                    delete address.country;
                if (!address.zipCode?.trim())
                    delete address.zipCode;
                // If all address fields are empty, remove the entire address object
                if (!address.street && !address.city && !address.state && !address.country && !address.zipCode) {
                    delete filteredFormData.address;
                }
            }
            // Remove other empty fields
            Object.keys(filteredFormData).forEach(key => {
                if (filteredFormData[key] === '' || filteredFormData[key] === null) {
                    delete filteredFormData[key];
                }
            });
            return await apiService.createCompany(filteredFormData);
        },
        onSuccess: async (response, variables) => {
            // Upload logo if one was selected
            if (selectedLogoFile && response.id) {
                try {
                    await apiService.uploadCompanyLogo(response.id, selectedLogoFile);
                    console.log('Logo uploaded for new company:', response.id);
                }
                catch (logoError) {
                    console.error('Error uploading logo for new company:', logoError);
                    // Don't fail the entire operation if logo upload fails
                }
            }
            // Invalidate and refetch companies
            await queryClient.invalidateQueries({ queryKey: ['companies'] });
            setIsCreateModalOpen(false);
            resetForm();
            toast({ title: "Company Created", description: "Company has been created successfully." });
        },
        onError: (err) => {
            console.error('Error creating company:', err);
            toast({
                title: "Error",
                description: err.message || "Failed to create company",
                variant: "destructive"
            });
        }
    });
    const updateCompanyMutation = useMutation({
        mutationFn: async ({ id, data }) => {
            const filteredFormData = { ...data };
            // Remove empty address fields to avoid validation errors
            if (filteredFormData.address && typeof filteredFormData.address === 'object') {
                const address = filteredFormData.address;
                if (!address.street?.trim())
                    delete address.street;
                if (!address.city?.trim())
                    delete address.city;
                if (!address.state?.trim())
                    delete address.state;
                if (!address.country?.trim())
                    delete address.country;
                if (!address.zipCode?.trim())
                    delete address.zipCode;
                // If all address fields are empty, remove the entire address object
                if (!address.street && !address.city && !address.state && !address.country && !address.zipCode) {
                    delete filteredFormData.address;
                }
            }
            // Remove other empty fields
            Object.keys(filteredFormData).forEach(key => {
                if (filteredFormData[key] === '' || filteredFormData[key] === null) {
                    delete filteredFormData[key];
                }
            });
            return await apiService.updateCompany(id, filteredFormData);
        },
        onSuccess: async (response, variables) => {
            // Upload logo if one was selected
            if (selectedLogoFile) {
                try {
                    await apiService.uploadCompanyLogo(variables.id, selectedLogoFile);
                    console.log('Logo uploaded for updated company:', variables.id);
                }
                catch (logoError) {
                    console.error('Error uploading logo for updated company:', logoError);
                    // Don't fail the entire operation if logo upload fails
                }
            }
            // Invalidate and refetch companies
            await queryClient.invalidateQueries({ queryKey: ['companies'] });
            setIsEditModalOpen(false);
            setSelectedCompany(null);
            resetForm();
            toast({ title: "Company Updated", description: "Company has been updated successfully." });
        },
        onError: (err) => {
            console.error('Error updating company:', err);
            toast({
                title: "Error",
                description: err.message || "Failed to update company",
                variant: "destructive"
            });
        }
    });
    const deleteCompanyMutation = useMutation({
        mutationFn: async (id) => {
            return await apiService.deleteCompany(id);
        },
        onSuccess: async () => {
            // Invalidate and refetch companies
            await queryClient.invalidateQueries({ queryKey: ['companies'] });
            toast({ title: "Company Deleted", description: "Company has been deleted successfully." });
        },
        onError: (err) => {
            console.error('Error deleting company:', err);
            toast({
                title: "Error",
                description: err.message || "Failed to delete company",
                variant: "destructive"
            });
        }
    });
    const handleCreateCompany = async () => {
        try {
            // Loading handled by mutation
            // Filter out empty fields to avoid validation errors
            const filteredFormData = { ...formData };
            // Remove empty address fields
            if (filteredFormData.address && typeof filteredFormData.address === 'object') {
                const address = filteredFormData.address;
                if (!address.street)
                    delete address.street;
                if (!address.city)
                    delete address.city;
                if (!address.state)
                    delete address.state;
                if (!address.country)
                    delete address.country;
                if (!address.zipCode)
                    delete address.zipCode;
                // If all address fields are empty, remove the address object entirely
                if (Object.keys(address).length === 0) {
                    delete filteredFormData.address;
                }
            }
            // Remove other empty fields
            Object.keys(filteredFormData).forEach(key => {
                const value = filteredFormData[key];
                if (value === '' || value === null || value === undefined) {
                    delete filteredFormData[key];
                }
            });
            const response = await apiService.createCompany(filteredFormData);
            console.log('Create company response:', response);
            // Upload logo if one was selected
            if (selectedLogoFile && response.id) {
                try {
                    await apiService.uploadCompanyLogo(response.id, selectedLogoFile);
                    console.log('Logo uploaded for new company:', response.id);
                }
                catch (logoError) {
                    console.error('Error uploading logo for new company:', logoError);
                    // Don't fail the entire operation if logo upload fails
                }
            }
            // Refresh the companies list to get the complete data with all fields
            // Companies will be automatically refetched via React Query
            setIsCreateModalOpen(false);
            resetForm();
            toast({
                title: "Company Created",
                description: "Company has been created successfully.",
            });
        }
        catch (err) {
            console.error('Error creating company:', err);
            toast({
                title: "Error",
                description: err.message || "Failed to create company",
                variant: "destructive",
            });
        }
        finally {
            // Loading handled by mutation
        }
    };
    const handleUpdateCompany = async () => {
        if (!selectedCompany)
            return;
        try {
            // Loading handled by mutation
            // Filter out empty fields to avoid validation errors
            const filteredFormData = { ...formData };
            // Remove empty address fields
            if (filteredFormData.address && typeof filteredFormData.address === 'object') {
                const address = filteredFormData.address;
                if (!address.street)
                    delete address.street;
                if (!address.city)
                    delete address.city;
                if (!address.state)
                    delete address.state;
                if (!address.country)
                    delete address.country;
                if (!address.zipCode)
                    delete address.zipCode;
                // If all address fields are empty, remove the address object entirely
                if (Object.keys(address).length === 0) {
                    delete filteredFormData.address;
                }
            }
            // Remove other empty fields
            Object.keys(filteredFormData).forEach(key => {
                const value = filteredFormData[key];
                if (value === '' || value === null || value === undefined) {
                    delete filteredFormData[key];
                }
            });
            const response = await apiService.updateCompany(selectedCompany.id, filteredFormData);
            console.log('Update company response:', response);
            // Upload logo if one was selected
            if (selectedLogoFile) {
                try {
                    await apiService.uploadCompanyLogo(selectedCompany.id, selectedLogoFile);
                    console.log('Logo uploaded for updated company:', selectedCompany.id);
                }
                catch (logoError) {
                    console.error('Error uploading logo for updated company:', logoError);
                    // Don't fail the entire operation if logo upload fails
                }
            }
            // Refresh the companies list to get the complete data with all fields
            // Companies will be automatically refetched via React Query
            setIsEditModalOpen(false);
            setSelectedCompany(null);
            resetForm();
            toast({
                title: "Company Updated",
                description: "Company has been updated successfully.",
            });
        }
        catch (err) {
            console.error('Error updating company:', err);
            toast({
                title: "Error",
                description: err.message || "Failed to update company",
                variant: "destructive",
            });
        }
        finally {
            // Loading handled by mutation
        }
    };
    const handleDeleteCompany = async (companyId) => {
        try {
            await apiService.deleteCompany(companyId);
            // Companies state managed by React Query
            toast({
                title: "Company Deleted",
                description: "Company has been deleted successfully.",
            });
        }
        catch (err) {
            toast({
                title: "Error",
                description: err.message || "Failed to delete company",
                variant: "destructive",
            });
        }
    };
    const handleLogoSelect = (event) => {
        const file = event.target.files?.[0];
        if (file) {
            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                toast({
                    title: "Invalid File Type",
                    description: "Please select a valid image file (JPEG, PNG, GIF, or WebP).",
                    variant: "destructive",
                });
                return;
            }
            // Validate file size (max 5MB)
            const maxSize = 5 * 1024 * 1024; // 5MB
            if (file.size > maxSize) {
                toast({
                    title: "File Too Large",
                    description: "Please select an image smaller than 5MB.",
                    variant: "destructive",
                });
                return;
            }
            setSelectedLogoFile(file);
            // Create preview URL
            const previewUrl = URL.createObjectURL(file);
            setLogoPreview(previewUrl);
        }
    };
    const handleLogoUpload = async (file) => {
        const logoFile = file || selectedLogoFile;
        if (!logoFile || !selectedCompany)
            return;
        try {
            setUploadingLogo(true);
            const response = await apiService.uploadCompanyLogo(selectedCompany.id, logoFile);
            console.log('Logo upload response:', response);
            console.log('Logo URL:', response.logoUrl);
            // Update the company in the list
            // Companies state managed by React Query
            // Refresh companies to ensure we have the latest data
            // Companies will be automatically refetched via React Query
            // Clear the logo selection
            setSelectedLogoFile(null);
            setLogoPreview(null);
            toast({
                title: "Logo Uploaded",
                description: "Company logo has been uploaded successfully.",
            });
        }
        catch (err) {
            toast({
                title: "Upload Failed",
                description: err.message || "Failed to upload logo",
                variant: "destructive",
            });
        }
        finally {
            setUploadingLogo(false);
        }
    };
    const resetForm = () => {
        setFormData({
            name: '',
            email: '',
            phone: '',
            website: '',
            address: {
                street: '',
                city: '',
                state: '',
                country: '',
                zipCode: '',
            },
            businessType: '',
            industry: '',
            taxId: '',
            registrationNumber: '',
            fiscalYearStart: 'January',
            currency: 'USD',
            timezone: 'America/New_York',
            description: '',
            employees: 0,
            foundedYear: new Date().getFullYear(),
            status: 'active',
            settings: {
                allowMultipleCurrencies: false,
                enableTaxCalculation: true,
                enableInventoryTracking: true,
                autoBackup: true,
            }
        });
        setSelectedLogoFile(null);
        setLogoPreview(null);
    };
    const openEditModal = (company) => {
        setSelectedCompany(company);
        // Extract settings from companySettings array if it exists
        let settings = {
            allowMultipleCurrencies: false,
            enableTaxCalculation: true,
            enableInventoryTracking: false,
            autoBackup: true,
        };
        if (company.companySettings && Array.isArray(company.companySettings)) {
            const companySettings = company.companySettings;
            settings = {
                allowMultipleCurrencies: companySettings.find((s) => s.key === 'allowMultipleCurrencies')?.value === 'true',
                enableTaxCalculation: companySettings.find((s) => s.key === 'enableTaxCalculation')?.value === 'true',
                enableInventoryTracking: companySettings.find((s) => s.key === 'enableInventoryTracking')?.value === 'true',
                autoBackup: companySettings.find((s) => s.key === 'autoBackup')?.value === 'true',
            };
        }
        // Extract additional fields from companySettings
        const description = company.companySettings?.find((s) => s.key === 'description')?.value || '';
        const employees = parseInt(company.companySettings?.find((s) => s.key === 'employees')?.value || '0');
        const foundedYear = parseInt(company.companySettings?.find((s) => s.key === 'foundedYear')?.value || new Date().getFullYear().toString());
        const status = company.companySettings?.find((s) => s.key === 'status')?.value || 'active';
        const businessType = company.companySettings?.find((s) => s.key === 'businessType')?.value || '';
        const registrationNumber = company.companySettings?.find((s) => s.key === 'registrationNumber')?.value || '';
        const timezone = company.companySettings?.find((s) => s.key === 'timezone')?.value || 'America/New_York';
        // Only set the fields that should be editable, not the entire company object
        setFormData({
            name: company.name || '',
            email: company.email || '',
            phone: company.phone || '',
            website: company.website || '',
            address: {
                street: typeof company.address === 'string' ? company.address : company.address?.street || '',
                city: company.city || '',
                state: company.state || '',
                country: company.country || '',
                zipCode: company.postalCode || '',
            },
            businessType,
            industry: company.industry || '',
            taxId: company.taxId || '',
            registrationNumber,
            fiscalYearStart: company.fiscalYearStart || 'January',
            currency: company.currency || 'USD',
            timezone,
            description,
            employees,
            foundedYear,
            status,
            settings
        });
        setIsEditModalOpen(true);
    };
    const openViewModal = (company) => {
        setSelectedCompany(company);
        setIsViewModalOpen(true);
    };
    const renderCompanyForm = () => (_jsx("div", { className: "space-y-6", children: _jsxs(Tabs, { defaultValue: "basic", className: "w-full", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-4", children: [_jsx(TabsTrigger, { value: "basic", children: "Basic Info" }), _jsx(TabsTrigger, { value: "contact", children: "Contact" }), _jsx(TabsTrigger, { value: "business", children: "Business" }), _jsx(TabsTrigger, { value: "settings", children: "Settings" })] }), _jsxs(TabsContent, { value: "basic", className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "name", children: "Company Name *" }), _jsx(Input, { id: "name", value: formData.name, onChange: (e) => setFormData({ ...formData, name: e.target.value }), placeholder: "Enter company name", required: true })] }), _jsxs("div", { className: "col-span-2 space-y-4", children: [_jsx(Label, { children: "Company Logo" }), _jsxs("div", { className: "flex items-center space-x-4", children: [_jsx("div", { className: "w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden", children: logoPreview ? (_jsx("img", { src: logoPreview, alt: "Logo preview", className: "w-full h-full object-cover", onError: (e) => {
                                                            console.error('Failed to load logo preview:', logoPreview);
                                                            console.error('Preview error:', e);
                                                        } })) : selectedCompany?.logoUrl ? (_jsx("img", { src: selectedCompany.logoUrl, alt: "Current logo", className: "w-full h-full object-cover", onError: (e) => {
                                                            console.error('Failed to load current logo:', selectedCompany.logoUrl);
                                                            console.error('Current logo error:', e);
                                                        }, onLoad: () => {
                                                            console.log('Current logo loaded successfully:', selectedCompany.logoUrl);
                                                        } })) : (_jsx(Building2, { className: "w-8 h-8 text-gray-400" })) }), _jsxs("div", { className: "flex-1 space-y-2", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("input", { type: "file", id: "logo-upload", accept: "image/jpeg,image/png,image/gif,image/webp", onChange: handleLogoSelect, className: "hidden" }), _jsx(Button, { type: "button", variant: "outline", size: "sm", onClick: () => document.getElementById('logo-upload')?.click(), disabled: uploadingLogo, children: uploadingLogo ? (_jsxs(_Fragment, { children: [_jsx(RefreshCw, { className: "w-4 h-4 mr-2 animate-spin" }), "Uploading..."] })) : (_jsxs(_Fragment, { children: [_jsx(Camera, { className: "w-4 h-4 mr-2" }), selectedLogoFile ? 'Change Logo' : 'Upload Logo'] })) })] }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Select a company logo (JPEG, PNG, GIF, or WebP, max 5MB). Logo will be saved when you submit the form." })] })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "industry", children: "Industry" }), _jsxs(Select, { value: formData.industry, onValueChange: (value) => setFormData({ ...formData, industry: value }), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select industry" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "technology", children: "Technology" }), _jsx(SelectItem, { value: "finance", children: "Finance" }), _jsx(SelectItem, { value: "healthcare", children: "Healthcare" }), _jsx(SelectItem, { value: "retail", children: "Retail" }), _jsx(SelectItem, { value: "manufacturing", children: "Manufacturing" }), _jsx(SelectItem, { value: "consulting", children: "Consulting" }), _jsx(SelectItem, { value: "other", children: "Other" })] })] })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "description", children: "Description" }), _jsx(Textarea, { id: "description", value: formData.description, onChange: (e) => setFormData({ ...formData, description: e.target.value }), placeholder: "Brief description of the company", rows: 3 })] }), _jsxs("div", { className: "grid grid-cols-3 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "employees", children: "Employees" }), _jsx(Input, { id: "employees", type: "number", value: formData.employees, onChange: (e) => setFormData({ ...formData, employees: parseInt(e.target.value) || 0 }), placeholder: "Number of employees" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "foundedYear", children: "Founded Year" }), _jsx(Input, { id: "foundedYear", type: "number", value: formData.foundedYear, onChange: (e) => setFormData({ ...formData, foundedYear: parseInt(e.target.value) || new Date().getFullYear() }), placeholder: "Year founded" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "status", children: "Status" }), _jsxs(Select, { value: formData.status, onValueChange: (value) => setFormData({ ...formData, status: value }), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "active", children: "Active" }), _jsx(SelectItem, { value: "inactive", children: "Inactive" }), _jsx(SelectItem, { value: "suspended", children: "Suspended" })] })] })] })] })] }), _jsxs(TabsContent, { value: "contact", className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "email", children: "Email" }), _jsx(Input, { id: "email", type: "email", value: formData.email, onChange: (e) => setFormData({ ...formData, email: e.target.value }), placeholder: "company@example.com" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "phone", children: "Phone" }), _jsx(Input, { id: "phone", value: formData.phone, onChange: (e) => setFormData({ ...formData, phone: e.target.value }), placeholder: "+1 (555) 123-4567" })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "website", children: "Website" }), _jsx(Input, { id: "website", value: formData.website, onChange: (e) => setFormData({ ...formData, website: e.target.value }), placeholder: "https://www.company.com" })] }), _jsxs("div", { className: "space-y-4", children: [_jsx(Label, { children: "Address" }), _jsxs("div", { className: "space-y-2", children: [_jsx(Input, { value: typeof formData.address === 'object' ? formData.address?.street || '' : '', onChange: (e) => setFormData({ ...formData, address: { ...(typeof formData.address === 'object' ? formData.address : {}), street: e.target.value } }), placeholder: "Street address" }), _jsxs("div", { className: "grid grid-cols-2 gap-2", children: [_jsx(Input, { value: typeof formData.address === 'object' ? formData.address?.city || '' : '', onChange: (e) => setFormData({ ...formData, address: { ...(typeof formData.address === 'object' ? formData.address : {}), city: e.target.value } }), placeholder: "City" }), _jsx(Input, { value: typeof formData.address === 'object' ? formData.address?.state || '' : '', onChange: (e) => setFormData({ ...formData, address: { ...(typeof formData.address === 'object' ? formData.address : {}), state: e.target.value } }), placeholder: "State/Province" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-2", children: [_jsx(Input, { value: typeof formData.address === 'object' ? formData.address?.country || '' : '', onChange: (e) => setFormData({ ...formData, address: { ...(typeof formData.address === 'object' ? formData.address : {}), country: e.target.value } }), placeholder: "Country" }), _jsx(Input, { value: typeof formData.address === 'object' ? formData.address?.zipCode || '' : '', onChange: (e) => setFormData({ ...formData, address: { ...(typeof formData.address === 'object' ? formData.address : {}), zipCode: e.target.value } }), placeholder: "ZIP/Postal Code" })] })] })] })] }), _jsxs(TabsContent, { value: "business", className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "businessType", children: "Business Type" }), _jsxs(Select, { value: formData.businessType, onValueChange: (value) => setFormData({ ...formData, businessType: value }), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select business type" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "corporation", children: "Corporation" }), _jsx(SelectItem, { value: "llc", children: "LLC" }), _jsx(SelectItem, { value: "partnership", children: "Partnership" }), _jsx(SelectItem, { value: "sole-proprietorship", children: "Sole Proprietorship" }), _jsx(SelectItem, { value: "nonprofit", children: "Non-Profit" })] })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "currency", children: "Currency" }), _jsxs(Select, { value: formData.currency, onValueChange: (value) => setFormData({ ...formData, currency: value }), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "USD", children: "USD - US Dollar" }), _jsx(SelectItem, { value: "EUR", children: "EUR - Euro" }), _jsx(SelectItem, { value: "GBP", children: "GBP - British Pound" }), _jsx(SelectItem, { value: "JPY", children: "JPY - Japanese Yen" }), _jsx(SelectItem, { value: "CAD", children: "CAD - Canadian Dollar" })] })] })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "taxId", children: "Tax ID" }), _jsx(Input, { id: "taxId", value: formData.taxId, onChange: (e) => setFormData({ ...formData, taxId: e.target.value }), placeholder: "Enter tax identification number" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "registrationNumber", children: "Registration Number" }), _jsx(Input, { id: "registrationNumber", value: formData.registrationNumber, onChange: (e) => setFormData({ ...formData, registrationNumber: e.target.value }), placeholder: "Enter registration number" })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "fiscalYearStart", children: "Fiscal Year Start" }), _jsxs(Select, { value: formData.fiscalYearStart, onValueChange: (value) => setFormData({ ...formData, fiscalYearStart: value }), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "January", children: "January" }), _jsx(SelectItem, { value: "February", children: "February" }), _jsx(SelectItem, { value: "March", children: "March" }), _jsx(SelectItem, { value: "April", children: "April" }), _jsx(SelectItem, { value: "May", children: "May" }), _jsx(SelectItem, { value: "June", children: "June" }), _jsx(SelectItem, { value: "July", children: "July" }), _jsx(SelectItem, { value: "August", children: "August" }), _jsx(SelectItem, { value: "September", children: "September" }), _jsx(SelectItem, { value: "October", children: "October" }), _jsx(SelectItem, { value: "November", children: "November" }), _jsx(SelectItem, { value: "December", children: "December" })] })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "timezone", children: "Timezone" }), _jsxs(Select, { value: formData.timezone, onValueChange: (value) => setFormData({ ...formData, timezone: value }), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "America/New_York", children: "Eastern Time" }), _jsx(SelectItem, { value: "America/Chicago", children: "Central Time" }), _jsx(SelectItem, { value: "America/Denver", children: "Mountain Time" }), _jsx(SelectItem, { value: "America/Los_Angeles", children: "Pacific Time" }), _jsx(SelectItem, { value: "Europe/London", children: "GMT" }), _jsx(SelectItem, { value: "Europe/Paris", children: "CET" }), _jsx(SelectItem, { value: "Asia/Tokyo", children: "JST" })] })] })] })] })] }), _jsx(TabsContent, { value: "settings", className: "space-y-4", children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "space-y-0.5", children: [_jsx(Label, { children: "Multiple Currencies" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Allow transactions in multiple currencies" })] }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => setFormData({
                                            ...formData,
                                            settings: { ...formData.settings, allowMultipleCurrencies: !formData.settings?.allowMultipleCurrencies }
                                        }), children: formData.settings?.allowMultipleCurrencies ? 'Enabled' : 'Disabled' })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "space-y-0.5", children: [_jsx(Label, { children: "Tax Calculation" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Automatically calculate taxes on transactions" })] }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => setFormData({
                                            ...formData,
                                            settings: { ...formData.settings, enableTaxCalculation: !formData.settings?.enableTaxCalculation }
                                        }), children: formData.settings?.enableTaxCalculation ? 'Enabled' : 'Disabled' })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "space-y-0.5", children: [_jsx(Label, { children: "Inventory Tracking" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Track inventory levels and movements" })] }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => setFormData({
                                            ...formData,
                                            settings: { ...formData.settings, enableInventoryTracking: !formData.settings?.enableInventoryTracking }
                                        }), children: formData.settings?.enableInventoryTracking ? 'Enabled' : 'Disabled' })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "space-y-0.5", children: [_jsx(Label, { children: "Auto Backup" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Automatically backup company data" })] }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => setFormData({
                                            ...formData,
                                            settings: { ...formData.settings, autoBackup: !formData.settings?.autoBackup }
                                        }), children: formData.settings?.autoBackup ? 'Enabled' : 'Disabled' })] })] }) })] }) }));
    if (loading) {
        return (_jsx(PageLayout, { children: _jsx("div", { className: "flex items-center justify-center h-64", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600 mx-auto" }), _jsx("p", { className: "mt-2 text-muted-foreground", children: "Loading companies..." })] }) }) }));
    }
    if (error) {
        return (_jsx(PageLayout, { children: _jsxs(Alert, { variant: "destructive", children: [_jsx(AlertTriangle, { className: "h-4 w-4" }), _jsxs(AlertDescription, { children: [typeof error === 'object' && error !== null && 'message' in error
                                ? error.message
                                : typeof error === 'string'
                                    ? error
                                    : 'Unknown error', _jsx(Button, { onClick: () => queryClient.invalidateQueries({ queryKey: ['companies'] }), className: "ml-2", size: "sm", children: "Try Again" })] })] }) }));
    }
    return (_jsx(PageLayout, { children: _jsxs("div", { className: "space-y-6", children: [_jsx("div", { className: "bg-gradient-to-r from-cyan-50 via-blue-50 to-indigo-50 p-8 border-b border-cyan-100", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg", children: _jsx(Building2, { className: "w-6 h-6 text-white" }) }), _jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Company Management" }), _jsx("p", { className: "text-gray-600 mt-1", children: "Manage your companies and organizational settings" })] })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsxs(Badge, { variant: "secondary", className: "px-3 py-1", children: [_jsx(CheckCircle, { className: "w-3 h-3 mr-1" }), companies.length, " ", companies.length === 1 ? 'Company' : 'Companies'] }), _jsxs(Dialog, { open: isCreateModalOpen, onOpenChange: setIsCreateModalOpen, children: [_jsx(DialogTrigger, { asChild: true, children: _jsxs(Button, { className: "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-lg", children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "Add Company"] }) }), _jsxs(DialogContent, { className: "max-w-4xl max-h-[90vh] overflow-y-auto", children: [_jsxs(DialogHeader, { children: [_jsxs(DialogTitle, { className: "flex items-center gap-2", children: [_jsx(Plus, { className: "h-5 w-5" }), "Create New Company"] }), _jsx(DialogDescription, { children: "Add a new company to your organization. Fill in the required information below." })] }), renderCompanyForm(), _jsxs("div", { className: "flex justify-end gap-2 pt-4", children: [_jsx(Button, { variant: "outline", onClick: () => { setIsCreateModalOpen(false); resetForm(); }, children: "Cancel" }), _jsxs(Button, { onClick: handleCreateCompany, disabled: !formData.name, children: [_jsx(Save, { className: "h-4 w-4 mr-2" }), "Create Company"] })] })] })] })] })] }) }), companies.length === 0 ? (_jsx(Card, { className: "text-center py-16", children: _jsxs(CardContent, { children: [_jsx(Building2, { className: "h-16 w-16 text-muted-foreground mx-auto mb-6" }), _jsx("h3", { className: "text-xl font-semibold mb-2", children: "No companies found" }), _jsx("p", { className: "text-muted-foreground mb-6 max-w-md mx-auto", children: "Get started by creating your first company. You can manage all your organizational settings and preferences from here." }), _jsxs(Button, { className: "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white", onClick: () => setIsCreateModalOpen(true), children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "Create Your First Company"] })] }) })) : (_jsx("div", { className: "grid gap-6 md:grid-cols-2 lg:grid-cols-3", children: companies.map((company) => {
                        console.log('🎨 Rendering company:', company.name, 'logoUrl:', company.logoUrl);
                        return (_jsxs(Card, { className: "hover:shadow-lg transition-all duration-200 border-0 shadow-md", children: [_jsx(CardHeader, { className: "pb-3", children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg", children: company.logoUrl ? (_jsx("img", { src: company.logoUrl, alt: company.name, className: "w-12 h-12 rounded-xl object-cover", onError: (e) => {
                                                                console.error('❌ Failed to load company logo:', company.name, company.logoUrl);
                                                                console.error('❌ Image error details:', e);
                                                                console.error('❌ Image src:', e.target?.src);
                                                            }, onLoad: () => {
                                                                console.log('✅ Company logo loaded successfully:', company.name, company.logoUrl);
                                                            } })) : (_jsx(Building2, { className: "w-6 h-6 text-white" })) }), _jsxs("div", { className: "min-w-0 flex-1", children: [_jsx(CardTitle, { className: "text-lg truncate", children: company.name }), _jsxs(CardDescription, { className: "flex items-center gap-1", children: [_jsx(Calendar, { className: "w-3 h-3" }), "Created ", company.createdAt ? new Date(company.createdAt).toLocaleDateString() : 'N/A'] })] })] }), _jsx(Badge, { variant: company.status === 'active' ? 'default' : company.status === 'inactive' ? 'secondary' : 'destructive', className: "capitalize", children: company.status })] }) }), _jsxs(CardContent, { className: "space-y-3", children: [company.industry && (_jsxs("div", { className: "flex items-center text-sm text-muted-foreground", children: [_jsx(Briefcase, { className: "w-4 h-4 mr-2" }), company.industry] })), company.email && (_jsxs("div", { className: "flex items-center text-sm text-muted-foreground", children: [_jsx(Mail, { className: "w-4 h-4 mr-2" }), company.email] })), company.address && (_jsxs("div", { className: "flex items-center text-sm text-muted-foreground", children: [_jsx(MapPin, { className: "w-4 h-4 mr-2" }), company.city || '', ", ", company.country || ''] })), _jsxs("div", { className: "flex items-center justify-between pt-2", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsxs(Button, { size: "sm", variant: "outline", onClick: () => openViewModal(company), children: [_jsx(Eye, { className: "w-3 h-3 mr-1" }), "View"] }), _jsxs(Button, { size: "sm", variant: "outline", onClick: () => openEditModal(company), children: [_jsx(Edit, { className: "w-3 h-3 mr-1" }), "Edit"] })] }), _jsx(Button, { size: "sm", variant: "ghost", className: "text-red-600 hover:text-red-700 hover:bg-red-50", onClick: () => handleDeleteCompany(company.id), children: _jsx(Trash2, { className: "w-3 h-3" }) })] })] })] }, company.id));
                    }) })), _jsx(Dialog, { open: isEditModalOpen, onOpenChange: setIsEditModalOpen, children: _jsxs(DialogContent, { className: "max-w-4xl max-h-[90vh] overflow-y-auto", children: [_jsxs(DialogHeader, { children: [_jsxs(DialogTitle, { className: "flex items-center gap-2", children: [_jsx(Edit, { className: "h-5 w-5" }), "Edit Company"] }), _jsx(DialogDescription, { children: "Update company information and settings." })] }), renderCompanyForm(), _jsxs("div", { className: "flex justify-end gap-2 pt-4", children: [_jsx(Button, { variant: "outline", onClick: () => { setIsEditModalOpen(false); setSelectedCompany(null); resetForm(); }, children: "Cancel" }), _jsxs(Button, { onClick: handleUpdateCompany, children: [_jsx(Save, { className: "h-4 w-4 mr-2" }), "Save Changes"] })] })] }) }), _jsx(Dialog, { open: isViewModalOpen, onOpenChange: setIsViewModalOpen, children: _jsxs(DialogContent, { className: "max-w-4xl max-h-[90vh] overflow-y-auto", children: [_jsxs(DialogHeader, { children: [_jsxs(DialogTitle, { className: "flex items-center gap-2", children: [_jsx(Eye, { className: "h-5 w-5" }), "Company Details"] }), _jsxs(DialogDescription, { children: ["View detailed information about ", selectedCompany?.name] })] }), selectedCompany && (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center gap-4 p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg", children: [_jsx("div", { className: "w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg", children: selectedCompany.logoUrl ? (_jsx("img", { src: selectedCompany.logoUrl, alt: selectedCompany.name, className: "w-16 h-16 rounded-xl object-cover", onError: (e) => {
                                                        console.error('Failed to load logo in view modal:', selectedCompany.logoUrl);
                                                        console.error('View modal error:', e);
                                                    }, onLoad: () => {
                                                        console.log('View modal logo loaded successfully:', selectedCompany.logoUrl);
                                                    } })) : (_jsx(Building2, { className: "w-8 h-8 text-white" })) }), _jsxs("div", { children: [_jsx("h3", { className: "text-2xl font-bold", children: selectedCompany.name }), _jsx("p", { className: "text-muted-foreground", children: selectedCompany.industry }), _jsx(Badge, { variant: selectedCompany.status === 'active' ? 'default' : 'secondary', className: "mt-1", children: selectedCompany.status })] })] }), _jsxs(Tabs, { defaultValue: "overview", className: "w-full", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-4", children: [_jsx(TabsTrigger, { value: "overview", children: "Overview" }), _jsx(TabsTrigger, { value: "contact", children: "Contact" }), _jsx(TabsTrigger, { value: "business", children: "Business" }), _jsx(TabsTrigger, { value: "settings", children: "Settings" })] }), _jsxs(TabsContent, { value: "overview", className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { className: "text-sm font-medium text-muted-foreground", children: "Description" }), _jsx("p", { children: selectedCompany.description || 'No description provided' })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { className: "text-sm font-medium text-muted-foreground", children: "Employees" }), _jsx("p", { children: selectedCompany.employees || 'Not specified' })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { className: "text-sm font-medium text-muted-foreground", children: "Founded Year" }), _jsx("p", { children: selectedCompany.foundedYear || 'Not specified' })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { className: "text-sm font-medium text-muted-foreground", children: "Created" }), _jsx("p", { children: selectedCompany.createdAt ? new Date(selectedCompany.createdAt).toLocaleDateString() : 'N/A' })] })] })] }), _jsxs(TabsContent, { value: "contact", className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { className: "text-sm font-medium text-muted-foreground", children: "Email" }), _jsx("p", { children: selectedCompany.email || 'Not provided' })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { className: "text-sm font-medium text-muted-foreground", children: "Phone" }), _jsx("p", { children: selectedCompany.phone || 'Not provided' })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { className: "text-sm font-medium text-muted-foreground", children: "Website" }), _jsx("p", { children: selectedCompany.website || 'Not provided' })] }), selectedCompany.address && (_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { className: "text-sm font-medium text-muted-foreground", children: "Address" }), _jsxs("p", { children: [typeof selectedCompany.address === 'string' ? selectedCompany.address : selectedCompany.address?.street, _jsx("br", {}), selectedCompany.city, ", ", selectedCompany.state, " ", selectedCompany.postalCode, _jsx("br", {}), selectedCompany.country] })] }))] }), _jsxs(TabsContent, { value: "business", className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { className: "text-sm font-medium text-muted-foreground", children: "Business Type" }), _jsx("p", { children: selectedCompany.businessType || 'Not specified' })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { className: "text-sm font-medium text-muted-foreground", children: "Currency" }), _jsx("p", { children: selectedCompany.currency || 'USD' })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { className: "text-sm font-medium text-muted-foreground", children: "Tax ID" }), _jsx("p", { children: selectedCompany.taxId || 'Not provided' })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { className: "text-sm font-medium text-muted-foreground", children: "Registration Number" }), _jsx("p", { children: selectedCompany.registrationNumber || 'Not provided' })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { className: "text-sm font-medium text-muted-foreground", children: "Fiscal Year Start" }), _jsx("p", { children: selectedCompany.fiscalYearStart || 'January' })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { className: "text-sm font-medium text-muted-foreground", children: "Timezone" }), _jsx("p", { children: selectedCompany.timezone || 'Not specified' })] })] })] }), _jsx(TabsContent, { value: "settings", className: "space-y-4", children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between p-3 bg-gray-50 rounded-lg", children: [_jsxs("div", { children: [_jsx(Label, { className: "font-medium", children: "Multiple Currencies" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Allow transactions in multiple currencies" })] }), _jsx(Badge, { variant: selectedCompany.settings?.allowMultipleCurrencies ? 'default' : 'secondary', children: selectedCompany.settings?.allowMultipleCurrencies ? 'Enabled' : 'Disabled' })] }), _jsxs("div", { className: "flex items-center justify-between p-3 bg-gray-50 rounded-lg", children: [_jsxs("div", { children: [_jsx(Label, { className: "font-medium", children: "Tax Calculation" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Automatically calculate taxes" })] }), _jsx(Badge, { variant: selectedCompany.settings?.enableTaxCalculation ? 'default' : 'secondary', children: selectedCompany.settings?.enableTaxCalculation ? 'Enabled' : 'Disabled' })] }), _jsxs("div", { className: "flex items-center justify-between p-3 bg-gray-50 rounded-lg", children: [_jsxs("div", { children: [_jsx(Label, { className: "font-medium", children: "Inventory Tracking" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Track inventory levels" })] }), _jsx(Badge, { variant: selectedCompany.settings?.enableInventoryTracking ? 'default' : 'secondary', children: selectedCompany.settings?.enableInventoryTracking ? 'Enabled' : 'Disabled' })] }), _jsxs("div", { className: "flex items-center justify-between p-3 bg-gray-50 rounded-lg", children: [_jsxs("div", { children: [_jsx(Label, { className: "font-medium", children: "Auto Backup" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Automatically backup data" })] }), _jsx(Badge, { variant: selectedCompany.settings?.autoBackup ? 'default' : 'secondary', children: selectedCompany.settings?.autoBackup ? 'Enabled' : 'Disabled' })] })] }) })] })] })), _jsx("div", { className: "flex justify-end pt-4", children: _jsxs(Button, { variant: "outline", onClick: () => { setIsViewModalOpen(false); setSelectedCompany(null); }, children: [_jsx(X, { className: "h-4 w-4 mr-2" }), "Close"] }) })] }) })] }) }));
}
