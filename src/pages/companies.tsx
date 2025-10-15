import React, { useState, useEffect } from 'react';
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
import { 
  Building2, 
  Plus, 
  Users, 
  Calendar,
  Edit,
  Trash2,
  Upload,
  Mail,
  Phone,
  MapPin,
  Globe,
  FileText,
  CreditCard,
  Settings,
  Eye,
  Save,
  X,
  Camera,
  Building,
  Briefcase,
  DollarSign,
  Clock,
  CheckCircle,
  AlertTriangle,
  Info,
  RefreshCw
} from 'lucide-react';
import { apiService } from '../lib/api';
import { useAuth } from '../contexts/auth-context';
import { useToast } from '../hooks/use-toast';

interface Company {
  id: string;
  name: string;
  tenantId?: string;
  logoUrl?: string;
  email?: string;
  phone?: string;
  website?: string;
  // Support both flat and nested address structures
  address?: string | {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
  // Flat address fields from API
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  businessType?: string;
  industry?: string;
  taxId?: string;
  registrationNumber?: string;
  fiscalYearStart?: string;
  currency?: string;
  timezone?: string;
  description?: string;
  employees?: number;
  foundedYear?: number;
  status?: 'active' | 'inactive' | 'suspended';
  settings?: {
    allowMultipleCurrencies?: boolean;
    enableTaxCalculation?: boolean;
    enableInventoryTracking?: boolean;
    autoBackup?: boolean;
  };
  createdAt?: string;
  updatedAt?: string;
  companySettings?: Array<{
    id: string;
    key: string;
    value: string;
  }>;
}

export default function CompaniesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Use React Query for companies data
  const { data: companiesData, isLoading: loading, error } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const response = await apiService.getCompanies({ page: 1, pageSize: 50 });
      const companiesData = (response as any)?.companies || (response as any)?.data || response || [];
      
      // Process companies to extract fields from companySettings
      const processedCompanies = companiesData.map((company: any) => {
        console.log('🔄 Processing company:', company.name, 'logoUrl:', company.logoUrl);
        
        if (company.companySettings && Array.isArray(company.companySettings)) {
          const settings = company.companySettings;
          
          // Extract fields from settings and add them to the company object
          const processed = {
            ...company,
            status: settings.find((s: any) => s.key === 'status')?.value || 'active',
            description: settings.find((s: any) => s.key === 'description')?.value || '',
            employees: parseInt(settings.find((s: any) => s.key === 'employees')?.value || '0'),
            foundedYear: parseInt(settings.find((s: any) => s.key === 'foundedYear')?.value || new Date().getFullYear().toString()),
            businessType: settings.find((s: any) => s.key === 'businessType')?.value || '',
            registrationNumber: settings.find((s: any) => s.key === 'registrationNumber')?.value || '',
            timezone: settings.find((s: any) => s.key === 'timezone')?.value || 'America/New_York',
            settings: {
              allowMultipleCurrencies: settings.find((s: any) => s.key === 'allowMultipleCurrencies')?.value === 'true',
              enableTaxCalculation: settings.find((s: any) => s.key === 'enableTaxCalculation')?.value === 'true',
              enableInventoryTracking: settings.find((s: any) => s.key === 'enableInventoryTracking')?.value === 'true',
              autoBackup: settings.find((s: any) => s.key === 'autoBackup')?.value === 'true',
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
      console.log('📊 Companies with logos:', processedCompanies.filter((c: any) => c.logoUrl).map((c: any) => ({ name: c.name, logoUrl: c.logoUrl })));
      
      return processedCompanies;
    },
    enabled: !!user
  });

  const companies = companiesData || [];

  // State for modals and forms
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedLogoFile, setSelectedLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [formData, setFormData] = useState<Partial<Company>>({
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
    mutationFn: async (data: Partial<Company>) => {
      const filteredFormData = { ...data };
      
      // Remove empty address fields to avoid validation errors
      if (filteredFormData.address && typeof filteredFormData.address === 'object') {
        const address = filteredFormData.address as any;
        if (!address.street?.trim()) delete address.street;
        if (!address.city?.trim()) delete address.city;
        if (!address.state?.trim()) delete address.state;
        if (!address.country?.trim()) delete address.country;
        if (!address.zipCode?.trim()) delete address.zipCode;
        
        // If all address fields are empty, remove the entire address object
        if (!address.street && !address.city && !address.state && !address.country && !address.zipCode) {
          delete filteredFormData.address;
        }
      }
      
      // Remove other empty fields
      Object.keys(filteredFormData).forEach(key => {
        if (filteredFormData[key as keyof Company] === '' || filteredFormData[key as keyof Company] === null) {
          delete filteredFormData[key as keyof Company];
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
        } catch (logoError) {
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
    onError: (err: any) => {
      console.error('Error creating company:', err);
      toast({ 
        title: "Error", 
        description: err.message || "Failed to create company",
        variant: "destructive"
      });
    }
  });

  const updateCompanyMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Company> }) => {
      const filteredFormData = { ...data };
      
      // Remove empty address fields to avoid validation errors
      if (filteredFormData.address && typeof filteredFormData.address === 'object') {
        const address = filteredFormData.address as any;
        if (!address.street?.trim()) delete address.street;
        if (!address.city?.trim()) delete address.city;
        if (!address.state?.trim()) delete address.state;
        if (!address.country?.trim()) delete address.country;
        if (!address.zipCode?.trim()) delete address.zipCode;
        
        // If all address fields are empty, remove the entire address object
        if (!address.street && !address.city && !address.state && !address.country && !address.zipCode) {
          delete filteredFormData.address;
        }
      }
      
      // Remove other empty fields
      Object.keys(filteredFormData).forEach(key => {
        if (filteredFormData[key as keyof Company] === '' || filteredFormData[key as keyof Company] === null) {
          delete filteredFormData[key as keyof Company];
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
        } catch (logoError) {
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
    onError: (err: any) => {
      console.error('Error updating company:', err);
      toast({ 
        title: "Error", 
        description: err.message || "Failed to update company",
        variant: "destructive"
      });
    }
  });

  const deleteCompanyMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiService.deleteCompany(id);
    },
    onSuccess: async () => {
      // Invalidate and refetch companies
      await queryClient.invalidateQueries({ queryKey: ['companies'] });
      toast({ title: "Company Deleted", description: "Company has been deleted successfully." });
    },
    onError: (err: any) => {
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
        if (!address.street) delete address.street;
        if (!address.city) delete address.city;
        if (!address.state) delete address.state;
        if (!address.country) delete address.country;
        if (!address.zipCode) delete address.zipCode;
        
        // If all address fields are empty, remove the address object entirely
        if (Object.keys(address).length === 0) {
          delete filteredFormData.address;
        }
      }
      
      // Remove other empty fields
      Object.keys(filteredFormData).forEach(key => {
        const value = filteredFormData[key as keyof typeof filteredFormData];
        if (value === '' || value === null || value === undefined) {
          delete filteredFormData[key as keyof typeof filteredFormData];
        }
      });
      
      const response = await apiService.createCompany(filteredFormData);
      console.log('Create company response:', response);
      
      // Upload logo if one was selected
      if (selectedLogoFile && response.id) {
        try {
          await apiService.uploadCompanyLogo(response.id, selectedLogoFile);
          console.log('Logo uploaded for new company:', response.id);
        } catch (logoError) {
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
    } catch (err: any) {
      console.error('Error creating company:', err);
      toast({
        title: "Error",
        description: err.message || "Failed to create company",
        variant: "destructive",
      });
    } finally {
      // Loading handled by mutation
    }
  };

  const handleUpdateCompany = async () => {
    if (!selectedCompany) return;
    
    try {
      // Loading handled by mutation
      
      // Filter out empty fields to avoid validation errors
      const filteredFormData = { ...formData };
      
      // Remove empty address fields
      if (filteredFormData.address && typeof filteredFormData.address === 'object') {
        const address = filteredFormData.address;
        if (!address.street) delete address.street;
        if (!address.city) delete address.city;
        if (!address.state) delete address.state;
        if (!address.country) delete address.country;
        if (!address.zipCode) delete address.zipCode;
        
        // If all address fields are empty, remove the address object entirely
        if (Object.keys(address).length === 0) {
          delete filteredFormData.address;
        }
      }
      
      // Remove other empty fields
      Object.keys(filteredFormData).forEach(key => {
        const value = filteredFormData[key as keyof typeof filteredFormData];
        if (value === '' || value === null || value === undefined) {
          delete filteredFormData[key as keyof typeof filteredFormData];
        }
      });
      
      const response = await apiService.updateCompany(selectedCompany.id, filteredFormData);
      console.log('Update company response:', response);
      
      // Upload logo if one was selected
      if (selectedLogoFile) {
        try {
          await apiService.uploadCompanyLogo(selectedCompany.id, selectedLogoFile);
          console.log('Logo uploaded for updated company:', selectedCompany.id);
        } catch (logoError) {
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
    } catch (err: any) {
      console.error('Error updating company:', err);
      toast({
        title: "Error",
        description: err.message || "Failed to update company",
        variant: "destructive",
      });
    } finally {
      // Loading handled by mutation
    }
  };

  const handleDeleteCompany = async (companyId: string) => {
    try {
      await apiService.deleteCompany(companyId);
      // Companies state managed by React Query
      toast({
        title: "Company Deleted",
        description: "Company has been deleted successfully.",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to delete company",
        variant: "destructive",
      });
    }
  };

  const handleLogoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleLogoUpload = async (file?: File) => {
    const logoFile = file || selectedLogoFile;
    if (!logoFile || !selectedCompany) return;
    
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
    } catch (err: any) {
      toast({
        title: "Upload Failed",
        description: err.message || "Failed to upload logo",
        variant: "destructive",
      });
    } finally {
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

  const openEditModal = (company: Company) => {
    setSelectedCompany(company);
    
    // Extract settings from companySettings array if it exists
    let settings = {
      allowMultipleCurrencies: false,
      enableTaxCalculation: true,
      enableInventoryTracking: false,
      autoBackup: true,
    };
    
    if ((company as any).companySettings && Array.isArray((company as any).companySettings)) {
      const companySettings = (company as any).companySettings;
      settings = {
        allowMultipleCurrencies: companySettings.find((s: any) => s.key === 'allowMultipleCurrencies')?.value === 'true',
        enableTaxCalculation: companySettings.find((s: any) => s.key === 'enableTaxCalculation')?.value === 'true',
        enableInventoryTracking: companySettings.find((s: any) => s.key === 'enableInventoryTracking')?.value === 'true',
        autoBackup: companySettings.find((s: any) => s.key === 'autoBackup')?.value === 'true',
      };
    }
    
    // Extract additional fields from companySettings
    const description = (company as any).companySettings?.find((s: any) => s.key === 'description')?.value || '';
    const employees = parseInt((company as any).companySettings?.find((s: any) => s.key === 'employees')?.value || '0');
    const foundedYear = parseInt((company as any).companySettings?.find((s: any) => s.key === 'foundedYear')?.value || new Date().getFullYear().toString());
    const status = (company as any).companySettings?.find((s: any) => s.key === 'status')?.value || 'active';
    const businessType = (company as any).companySettings?.find((s: any) => s.key === 'businessType')?.value || '';
    const registrationNumber = (company as any).companySettings?.find((s: any) => s.key === 'registrationNumber')?.value || '';
    const timezone = (company as any).companySettings?.find((s: any) => s.key === 'timezone')?.value || 'America/New_York';
    
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

  const openViewModal = (company: Company) => {
    setSelectedCompany(company);
    setIsViewModalOpen(true);
  };

  const renderCompanyForm = () => (
    <div className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="business">Business</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Company Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Enter company name"
                required
              />
            </div>
            
            {/* Logo Upload Section */}
            <div className="col-span-2 space-y-4">
              <Label>Company Logo</Label>
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                  {logoPreview ? (
                    <img 
                      src={logoPreview} 
                      alt="Logo preview" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error('Failed to load logo preview:', logoPreview);
                        console.error('Preview error:', e);
                      }}
                    />
                  ) : selectedCompany?.logoUrl ? (
                    <img 
                      src={selectedCompany.logoUrl} 
                      alt="Current logo" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error('Failed to load current logo:', selectedCompany.logoUrl);
                        console.error('Current logo error:', e);
                      }}
                      onLoad={() => {
                        console.log('Current logo loaded successfully:', selectedCompany.logoUrl);
                      }}
                    />
                  ) : (
                    <Building2 className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="file"
                      id="logo-upload"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      onChange={handleLogoSelect}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('logo-upload')?.click()}
                      disabled={uploadingLogo}
                    >
                      {uploadingLogo ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Camera className="w-4 h-4 mr-2" />
                          {selectedLogoFile ? 'Change Logo' : 'Upload Logo'}
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Select a company logo (JPEG, PNG, GIF, or WebP, max 5MB). Logo will be saved when you submit the form.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Select value={formData.industry} onValueChange={(value) => setFormData({...formData, industry: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="retail">Retail</SelectItem>
                  <SelectItem value="manufacturing">Manufacturing</SelectItem>
                  <SelectItem value="consulting">Consulting</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Brief description of the company"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="employees">Employees</Label>
              <Input
                id="employees"
                type="number"
                value={formData.employees}
                onChange={(e) => setFormData({...formData, employees: parseInt(e.target.value) || 0})}
                placeholder="Number of employees"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="foundedYear">Founded Year</Label>
              <Input
                id="foundedYear"
                type="number"
                value={formData.foundedYear}
                onChange={(e) => setFormData({...formData, foundedYear: parseInt(e.target.value) || new Date().getFullYear()})}
                placeholder="Year founded"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value: 'active' | 'inactive' | 'suspended') => setFormData({...formData, status: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="contact" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="company@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              value={formData.website}
              onChange={(e) => setFormData({...formData, website: e.target.value})}
              placeholder="https://www.company.com"
            />
          </div>

          <div className="space-y-4">
            <Label>Address</Label>
            <div className="space-y-2">
              <Input
                value={typeof formData.address === 'object' ? formData.address?.street || '' : ''}
                onChange={(e) => setFormData({...formData, address: {...(typeof formData.address === 'object' ? formData.address : {}), street: e.target.value}})}
                placeholder="Street address"
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  value={typeof formData.address === 'object' ? formData.address?.city || '' : ''}
                  onChange={(e) => setFormData({...formData, address: {...(typeof formData.address === 'object' ? formData.address : {}), city: e.target.value}})}
                  placeholder="City"
                />
                <Input
                  value={typeof formData.address === 'object' ? formData.address?.state || '' : ''}
                  onChange={(e) => setFormData({...formData, address: {...(typeof formData.address === 'object' ? formData.address : {}), state: e.target.value}})}
                  placeholder="State/Province"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  value={typeof formData.address === 'object' ? formData.address?.country || '' : ''}
                  onChange={(e) => setFormData({...formData, address: {...(typeof formData.address === 'object' ? formData.address : {}), country: e.target.value}})}
                  placeholder="Country"
                />
                <Input
                  value={typeof formData.address === 'object' ? formData.address?.zipCode || '' : ''}
                  onChange={(e) => setFormData({...formData, address: {...(typeof formData.address === 'object' ? formData.address : {}), zipCode: e.target.value}})}
                  placeholder="ZIP/Postal Code"
                />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="business" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="businessType">Business Type</Label>
              <Select value={formData.businessType} onValueChange={(value) => setFormData({...formData, businessType: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select business type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="corporation">Corporation</SelectItem>
                  <SelectItem value="llc">LLC</SelectItem>
                  <SelectItem value="partnership">Partnership</SelectItem>
                  <SelectItem value="sole-proprietorship">Sole Proprietorship</SelectItem>
                  <SelectItem value="nonprofit">Non-Profit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select value={formData.currency} onValueChange={(value) => setFormData({...formData, currency: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD - US Dollar</SelectItem>
                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                  <SelectItem value="GBP">GBP - British Pound</SelectItem>
                  <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                  <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="taxId">Tax ID</Label>
              <Input
                id="taxId"
                value={formData.taxId}
                onChange={(e) => setFormData({...formData, taxId: e.target.value})}
                placeholder="Enter tax identification number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="registrationNumber">Registration Number</Label>
              <Input
                id="registrationNumber"
                value={formData.registrationNumber}
                onChange={(e) => setFormData({...formData, registrationNumber: e.target.value})}
                placeholder="Enter registration number"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fiscalYearStart">Fiscal Year Start</Label>
              <Select value={formData.fiscalYearStart} onValueChange={(value) => setFormData({...formData, fiscalYearStart: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="January">January</SelectItem>
                  <SelectItem value="February">February</SelectItem>
                  <SelectItem value="March">March</SelectItem>
                  <SelectItem value="April">April</SelectItem>
                  <SelectItem value="May">May</SelectItem>
                  <SelectItem value="June">June</SelectItem>
                  <SelectItem value="July">July</SelectItem>
                  <SelectItem value="August">August</SelectItem>
                  <SelectItem value="September">September</SelectItem>
                  <SelectItem value="October">October</SelectItem>
                  <SelectItem value="November">November</SelectItem>
                  <SelectItem value="December">December</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select value={formData.timezone} onValueChange={(value) => setFormData({...formData, timezone: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/New_York">Eastern Time</SelectItem>
                  <SelectItem value="America/Chicago">Central Time</SelectItem>
                  <SelectItem value="America/Denver">Mountain Time</SelectItem>
                  <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                  <SelectItem value="Europe/London">GMT</SelectItem>
                  <SelectItem value="Europe/Paris">CET</SelectItem>
                  <SelectItem value="Asia/Tokyo">JST</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Multiple Currencies</Label>
                <p className="text-sm text-muted-foreground">Allow transactions in multiple currencies</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFormData({
                  ...formData, 
                  settings: {...formData.settings, allowMultipleCurrencies: !formData.settings?.allowMultipleCurrencies}
                })}
              >
                {formData.settings?.allowMultipleCurrencies ? 'Enabled' : 'Disabled'}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Tax Calculation</Label>
                <p className="text-sm text-muted-foreground">Automatically calculate taxes on transactions</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFormData({
                  ...formData, 
                  settings: {...formData.settings, enableTaxCalculation: !formData.settings?.enableTaxCalculation}
                })}
              >
                {formData.settings?.enableTaxCalculation ? 'Enabled' : 'Disabled'}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Inventory Tracking</Label>
                <p className="text-sm text-muted-foreground">Track inventory levels and movements</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFormData({
                  ...formData, 
                  settings: {...formData.settings, enableInventoryTracking: !formData.settings?.enableInventoryTracking}
                })}
              >
                {formData.settings?.enableInventoryTracking ? 'Enabled' : 'Disabled'}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto Backup</Label>
                <p className="text-sm text-muted-foreground">Automatically backup company data</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFormData({
                  ...formData, 
                  settings: {...formData.settings, autoBackup: !formData.settings?.autoBackup}
                })}
              >
                {formData.settings?.autoBackup ? 'Enabled' : 'Disabled'}
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600 mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading companies...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {typeof error === 'object' && error !== null && 'message' in error 
              ? (error as any).message 
              : typeof error === 'string' 
                ? error 
                : 'Unknown error'}
            <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['companies'] })} className="ml-2" size="sm">
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="space-y-6">
        {/* Enhanced Header */}
        <div className="bg-gradient-to-r from-cyan-50 via-blue-50 to-indigo-50 p-8 border-b border-cyan-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Company Management</h1>
                <p className="text-gray-600 mt-1">Manage your companies and organizational settings</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="px-3 py-1">
                <CheckCircle className="w-3 h-3 mr-1" />
                {companies.length} {companies.length === 1 ? 'Company' : 'Companies'}
              </Badge>
              <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-lg">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Company
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Plus className="h-5 w-5" />
                      Create New Company
                    </DialogTitle>
                    <DialogDescription>
                      Add a new company to your organization. Fill in the required information below.
                    </DialogDescription>
                  </DialogHeader>
                  {renderCompanyForm()}
                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => {setIsCreateModalOpen(false); resetForm();}}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateCompany} disabled={!formData.name}>
                      <Save className="h-4 w-4 mr-2" />
                      Create Company
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {companies.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
              <h3 className="text-xl font-semibold mb-2">No companies found</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Get started by creating your first company. You can manage all your organizational settings and preferences from here.
              </p>
              <Button 
                className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white"
                onClick={() => setIsCreateModalOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Company
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {companies.map((company: any) => {
              console.log('🎨 Rendering company:', company.name, 'logoUrl:', company.logoUrl);
              return (
              <Card key={company.id} className="hover:shadow-lg transition-all duration-200 border-0 shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                        {company.logoUrl ? (
                          <img 
                            src={company.logoUrl} 
                            alt={company.name} 
                            className="w-12 h-12 rounded-xl object-cover"
                            onError={(e) => {
                              console.error('❌ Failed to load company logo:', company.name, company.logoUrl);
                              console.error('❌ Image error details:', e);
                              console.error('❌ Image src:', (e.target as HTMLImageElement)?.src);
                            }}
                            onLoad={() => {
                              console.log('✅ Company logo loaded successfully:', company.name, company.logoUrl);
                            }}
                          />
                        ) : (
                          <Building2 className="w-6 h-6 text-white" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-lg truncate">{company.name}</CardTitle>
                        <CardDescription className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Created {company.createdAt ? new Date(company.createdAt).toLocaleDateString() : 'N/A'}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge 
                      variant={company.status === 'active' ? 'default' : company.status === 'inactive' ? 'secondary' : 'destructive'}
                      className="capitalize"
                    >
                      {company.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {company.industry && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Briefcase className="w-4 h-4 mr-2" />
                      {company.industry}
                    </div>
                  )}
                  {company.email && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Mail className="w-4 h-4 mr-2" />
                      {company.email}
                    </div>
                  )}
                  {company.address && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 mr-2" />
                      {company.city || ''}, {company.country || ''}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline" onClick={() => openViewModal(company)}>
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => openEditModal(company)}>
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                    </div>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDeleteCompany(company.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          </div>
        )}

        {/* Edit Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit className="h-5 w-5" />
                Edit Company
              </DialogTitle>
              <DialogDescription>
                Update company information and settings.
              </DialogDescription>
            </DialogHeader>
            {renderCompanyForm()}
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => {setIsEditModalOpen(false); setSelectedCompany(null); resetForm();}}>
                Cancel
              </Button>
              <Button onClick={handleUpdateCompany}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* View Modal */}
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Company Details
              </DialogTitle>
              <DialogDescription>
                View detailed information about {selectedCompany?.name}
              </DialogDescription>
            </DialogHeader>
            {selectedCompany && (
              <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg">
                  <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    {selectedCompany.logoUrl ? (
                      <img 
                        src={selectedCompany.logoUrl} 
                        alt={selectedCompany.name} 
                        className="w-16 h-16 rounded-xl object-cover"
                        onError={(e) => {
                          console.error('Failed to load logo in view modal:', selectedCompany.logoUrl);
                          console.error('View modal error:', e);
                        }}
                        onLoad={() => {
                          console.log('View modal logo loaded successfully:', selectedCompany.logoUrl);
                        }}
                      />
                    ) : (
                      <Building2 className="w-8 h-8 text-white" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">{selectedCompany.name}</h3>
                    <p className="text-muted-foreground">{selectedCompany.industry}</p>
                    <Badge variant={selectedCompany.status === 'active' ? 'default' : 'secondary'} className="mt-1">
                      {selectedCompany.status}
                    </Badge>
                  </div>
                </div>

                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="contact">Contact</TabsTrigger>
                    <TabsTrigger value="business">Business</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                        <p>{selectedCompany.description || 'No description provided'}</p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground">Employees</Label>
                        <p>{selectedCompany.employees || 'Not specified'}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground">Founded Year</Label>
                        <p>{selectedCompany.foundedYear || 'Not specified'}</p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground">Created</Label>
                        <p>{selectedCompany.createdAt ? new Date(selectedCompany.createdAt).toLocaleDateString() : 'N/A'}</p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="contact" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                        <p>{selectedCompany.email || 'Not provided'}</p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground">Phone</Label>
                        <p>{selectedCompany.phone || 'Not provided'}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">Website</Label>
                      <p>{selectedCompany.website || 'Not provided'}</p>
                    </div>
                    {selectedCompany.address && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground">Address</Label>
                        <p>
                          {typeof selectedCompany.address === 'string' ? selectedCompany.address : selectedCompany.address?.street}<br/>
                          {selectedCompany.city}, {selectedCompany.state} {selectedCompany.postalCode}<br/>
                          {selectedCompany.country}
                        </p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="business" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground">Business Type</Label>
                        <p>{selectedCompany.businessType || 'Not specified'}</p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground">Currency</Label>
                        <p>{selectedCompany.currency || 'USD'}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground">Tax ID</Label>
                        <p>{selectedCompany.taxId || 'Not provided'}</p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground">Registration Number</Label>
                        <p>{selectedCompany.registrationNumber || 'Not provided'}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground">Fiscal Year Start</Label>
                        <p>{selectedCompany.fiscalYearStart || 'January'}</p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground">Timezone</Label>
                        <p>{selectedCompany.timezone || 'Not specified'}</p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="settings" className="space-y-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <Label className="font-medium">Multiple Currencies</Label>
                          <p className="text-sm text-muted-foreground">Allow transactions in multiple currencies</p>
                        </div>
                        <Badge variant={selectedCompany.settings?.allowMultipleCurrencies ? 'default' : 'secondary'}>
                          {selectedCompany.settings?.allowMultipleCurrencies ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <Label className="font-medium">Tax Calculation</Label>
                          <p className="text-sm text-muted-foreground">Automatically calculate taxes</p>
                        </div>
                        <Badge variant={selectedCompany.settings?.enableTaxCalculation ? 'default' : 'secondary'}>
                          {selectedCompany.settings?.enableTaxCalculation ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <Label className="font-medium">Inventory Tracking</Label>
                          <p className="text-sm text-muted-foreground">Track inventory levels</p>
                        </div>
                        <Badge variant={selectedCompany.settings?.enableInventoryTracking ? 'default' : 'secondary'}>
                          {selectedCompany.settings?.enableInventoryTracking ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <Label className="font-medium">Auto Backup</Label>
                          <p className="text-sm text-muted-foreground">Automatically backup data</p>
                        </div>
                        <Badge variant={selectedCompany.settings?.autoBackup ? 'default' : 'secondary'}>
                          {selectedCompany.settings?.autoBackup ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}
            <div className="flex justify-end pt-4">
              <Button variant="outline" onClick={() => {setIsViewModalOpen(false); setSelectedCompany(null);}}>
                <X className="h-4 w-4 mr-2" />
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </PageLayout>
  );
}
