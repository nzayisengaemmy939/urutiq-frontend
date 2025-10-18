import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/auth-context';
import { getApiUrl, getCompanyId, getTenantId } from '../lib/config';
import { apiService } from '../lib/api';
import { 
  Building2, 
  Calculator, 
  Calendar, 
  DollarSign, 
  FileText, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  TrendingDown, 
  TrendingUp, 
  Settings, 
  BarChart3, 
  Wrench, 
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  RefreshCw,
  MapPin,
  User,
  Tag,
  Archive,
  AlertTriangle,
  Layers,
  Shield,
  FileSpreadsheet,
  Mail
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { MoonLoader } from '../components/ui/moon-loader';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../components/ui/dialog';
import { Textarea } from '../components/ui/textarea';
import { Checkbox } from '../components/ui/checkbox';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../components/ui/tabs';
import { format } from 'date-fns';
import { PageLayout } from '../components/page-layout';
import { companiesApi } from '../lib/api/accounting';
import { toast } from 'sonner';

// API functions
const getApiBaseUrl = () => {
  return getApiUrl('');
};

const fetchFixedAssetCategories = async (companyId: string) => {
  const response = await fetch(`${getApiBaseUrl()}/api/fixed-assets/categories?companyId=${companyId}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo',
      'x-company-id': companyId,
    },
  });
  const data = await response.json();
  return data.categories || [];
};

const fetchFixedAssets = async (companyId: string, filters: any = {}) => {
  const params = new URLSearchParams({ companyId, ...filters });
  const url = `${getApiBaseUrl()}/api/fixed-assets?${params}`;
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo',
      'x-company-id': companyId,
    },
  });
  
  const data = await response.json();
  return data.assets || [];
};

const fetchFixedAssetSummary = async (companyId: string) => {
  const response = await fetch(`${getApiBaseUrl()}/api/fixed-assets/reports/summary?companyId=${companyId}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo',
      'x-company-id': companyId,
    },
  });
  const data = await response.json();
  return data;
};

const createFixedAsset = async (assetData: any) => {
  const response = await fetch(`${getApiBaseUrl()}/api/fixed-assets`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo',
      'x-company-id': assetData.companyId,
    },
    body: JSON.stringify(assetData),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to create asset');
  }
  return data.asset;
};

const updateFixedAsset = async (id: string, assetData: any) => {
  const response = await fetch(`${getApiBaseUrl()}/api/fixed-assets/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo',
      'x-company-id': assetData.companyId,
    },
    body: JSON.stringify(assetData),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to update asset');
  }
  return data.asset;
};

const deleteFixedAsset = async (id: string, companyId: string) => {
  const response = await fetch(`${getApiBaseUrl()}/api/fixed-assets/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo',
      'x-company-id': companyId,
    },
  });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to delete asset');
  }
};

const calculateDepreciation = async (companyId: string, year: number, month: number) => {
  const response = await fetch(`${getApiBaseUrl()}/api/fixed-assets/calculate-depreciation`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo',
      'x-company-id': companyId,
    },
    body: JSON.stringify({ companyId, year, month }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to calculate depreciation');
  }
  return data;
};

const fetchDepreciationSchedule = async (companyId: string, year?: number) => {
  const url = year 
    ? `${getApiBaseUrl()}/api/fixed-assets/reports/depreciation-schedule?companyId=${companyId}&year=${year}`
    : `${getApiBaseUrl()}/api/fixed-assets/reports/depreciation-schedule?companyId=${companyId}`;
    
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo',
      'x-company-id': companyId,
    },
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch depreciation schedule');
  }
  return data.depreciationSchedule || [];
};

// Category management API functions
const createFixedAssetCategory = async (companyId: string, data: any) => {
  const response = await fetch(`${getApiBaseUrl()}/api/fixed-assets/categories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo',
      'x-company-id': companyId,
    },
    body: JSON.stringify({ ...data, companyId })
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to create category');
  }
  return response.json();
};

const updateFixedAssetCategory = async (companyId: string, id: string, data: any) => {
  const response = await fetch(`${getApiBaseUrl()}/api/fixed-assets/categories/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo',
      'x-company-id': companyId,
    },
    body: JSON.stringify({ ...data, companyId })
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to update category');
  }
  return response.json();
};

const deleteFixedAssetCategory = async (companyId: string, id: string) => {
  const response = await fetch(`${getApiBaseUrl()}/api/fixed-assets/categories/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo',
      'x-company-id': companyId,
    },
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to delete category');
  }
};

// Category Form Component
function CategoryForm({ category, onSave, onCancel, isLoading }: { 
  category?: any, 
  onSave: (data: any) => void, 
  onCancel: () => void,
  isLoading?: boolean
}) {
  const [formData, setFormData] = useState({
    name: category?.name || '',
    usefulLifeMonths: category?.usefulLifeMonths || 60,
    method: category?.method || 'straight_line',
    salvageRate: category?.salvageRate || 0,
    assetAccountId: category?.assetAccountId || undefined,
    depreciationExpenseId: category?.depreciationExpenseId || undefined,
    accumulatedDepreciationId: category?.accumulatedDepreciationId || undefined,
    disposalGainId: category?.disposalGainId || undefined,
    disposalLossId: category?.disposalLossId || undefined
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Fetch accounts for dropdown selection
  const { data: accountsData, isLoading: accountsLoading } = useQuery({
    queryKey: ['chart-of-accounts'],
    queryFn: async () => {
      const companyId = localStorage.getItem('company_id') || localStorage.getItem('companyId') || 'seed-company-1';
      const response = await fetch(`${getApiBaseUrl()}/api/accounts?companyId=${companyId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo',
          'x-company-id': companyId,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch accounts');
      }
      const data = await response.json();
      return Array.isArray(data) ? data : data.accounts || [];
    },
    enabled: true
  });

  const accounts = accountsData || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    const newErrors: {[key: string]: string} = {};
    if (!formData.name.trim()) newErrors.name = 'Category name is required';
    if (formData.usefulLifeMonths <= 0) newErrors.usefulLifeMonths = 'Useful life must be greater than 0';
    if (formData.salvageRate < 0 || formData.salvageRate > 100) newErrors.salvageRate = 'Salvage rate must be between 0 and 100';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Filter out undefined account IDs to avoid sending empty strings
    const submitData = {
      ...formData,
      assetAccountId: formData.assetAccountId || undefined,
      depreciationExpenseId: formData.depreciationExpenseId || undefined,
      accumulatedDepreciationId: formData.accumulatedDepreciationId || undefined,
      disposalGainId: formData.disposalGainId || undefined,
      disposalLossId: formData.disposalLossId || undefined
    };

    onSave(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Category Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Office Equipment"
            className={errors.name ? 'border-red-500' : ''}
          />
          {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="usefulLifeMonths">Useful Life (Months) *</Label>
          <Input
            id="usefulLifeMonths"
            type="number"
            value={formData.usefulLifeMonths}
            onChange={(e) => setFormData({ ...formData, usefulLifeMonths: parseInt(e.target.value) || 0 })}
            min="1"
            className={errors.usefulLifeMonths ? 'border-red-500' : ''}
          />
          {errors.usefulLifeMonths && <p className="text-sm text-red-500">{errors.usefulLifeMonths}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="method">Depreciation Method *</Label>
          <Select value={formData.method} onValueChange={(value) => setFormData({ ...formData, method: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="straight_line">Straight Line</SelectItem>
              <SelectItem value="declining_balance">Declining Balance</SelectItem>
              <SelectItem value="sum_of_years_digits">Sum of Years Digits</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="salvageRate">Salvage Rate (%)</Label>
          <Input
            id="salvageRate"
            type="number"
            value={formData.salvageRate}
            onChange={(e) => setFormData({ ...formData, salvageRate: parseFloat(e.target.value) || 0 })}
            min="0"
            max="100"
            step="0.1"
            className={errors.salvageRate ? 'border-red-500' : ''}
          />
          {errors.salvageRate && <p className="text-sm text-red-500">{errors.salvageRate}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Accounting Accounts (Optional)</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="assetAccountId">Asset Account</Label>
            <Select value={formData.assetAccountId || undefined} onValueChange={(value) => setFormData({ ...formData, assetAccountId: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select asset account (optional)" />
              </SelectTrigger>
              <SelectContent>
                {accounts.filter((account: any) => account.accountType?.toLowerCase().includes('asset')).map((account: any) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.code} - {account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="depreciationExpenseId">Depreciation Expense Account</Label>
            <Select value={formData.depreciationExpenseId || undefined} onValueChange={(value) => setFormData({ ...formData, depreciationExpenseId: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select expense account (optional)" />
              </SelectTrigger>
              <SelectContent>
                {accounts.filter((account: any) => account.accountType?.toLowerCase().includes('expense')).map((account: any) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.code} - {account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="accumulatedDepreciationId">Accumulated Depreciation Account</Label>
            <Select value={formData.accumulatedDepreciationId || undefined} onValueChange={(value) => setFormData({ ...formData, accumulatedDepreciationId: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select accumulated depreciation account (optional)" />
              </SelectTrigger>
              <SelectContent>
                {accounts.filter((account: any) => 
                  account.name.toLowerCase().includes('accumulated') || 
                  account.name.toLowerCase().includes('depreciation')
                ).map((account: any) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.code} - {account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="disposalGainId">Disposal Gain Account</Label>
            <Select value={formData.disposalGainId || undefined} onValueChange={(value) => setFormData({ ...formData, disposalGainId: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select disposal gain account (optional)" />
              </SelectTrigger>
              <SelectContent>
                {accounts.filter((account: any) => 
                  account.accountType?.toLowerCase().includes('income') ||
                  account.name.toLowerCase().includes('gain') ||
                  account.name.toLowerCase().includes('income')
                ).map((account: any) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.code} - {account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <MoonLoader size="sm" color="gray" className="mr-2" />
              {category ? 'Updating Category...' : 'Creating Category...'}
            </>
          ) : (
            category ? 'Update Category' : 'Create Category'
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}

export default function FixedAssetsManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [isAssetDialogOpen, setIsAssetDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isDepreciationDialogOpen, setIsDepreciationDialogOpen] = useState(false);
  const [isMaintenanceDialogOpen, setIsMaintenanceDialogOpen] = useState(false);
  const [maintenanceFormData, setMaintenanceFormData] = useState({
    assetId: '',
    maintenanceDate: new Date().toISOString().split('T')[0],
    maintenanceType: 'PREVENTIVE',
    description: '',
    performedBy: '',
    cost: 0,
    extendsUsefulLife: false,
    lifeExtensionMonths: 0,
    invoiceNumber: '',
    warrantyInfo: '',
    status: 'SCHEDULED'
  });
  const [maintenanceFormErrors, setMaintenanceFormErrors] = useState<{[key: string]: string}>({});
  const [editingMaintenanceId, setEditingMaintenanceId] = useState<string | null>(null);
  const [isDisposalDialogOpen, setIsDisposalDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState<any>(null);
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);
  const [assetToPost, setAssetToPost] = useState<any>(null);
  const [accountConfig, setAccountConfig] = useState<any>(null);
  const [isCheckingAccounts, setIsCheckingAccounts] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [isDeleteCategoryDialogOpen, setIsDeleteCategoryDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<any>(null);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [depreciationYear, setDepreciationYear] = useState(new Date().getFullYear());
  const [depreciationMonth, setDepreciationMonth] = useState(new Date().getMonth() + 1);
  const [depreciationFilter, setDepreciationFilter] = useState('all');

  const queryClient = useQueryClient();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const authReady = !authLoading;

  // Fetch companies first - use same approach as Header component
  const { data: companiesData, isLoading: companiesLoading, error: companiesError } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const result = await apiService.getCompanies() as any;
      
      // Handle different response formats (same as Header component)
      if (Array.isArray(result)) {
        return result;
      }
      if (result?.data && Array.isArray(result.data)) {
        return result.data;
      }
      if (result?.items && Array.isArray(result.items)) {
        return result.items;
      }
      return [];
    },
    enabled: authReady
  });

  // Get company ID using the proper config function
  const firstCompanyId = React.useMemo(() => {
    try {
      // Use the proper getCompanyId function from config
      return getCompanyId();
    } catch (error) {
      // Fallback to companies data if localStorage doesn't have company ID
      if (companiesData && companiesData.length > 0) {
        return companiesData[0]?.id;
      }
      return null;
    }
  }, [companiesData]);

  // Fetch fixed asset categories - wait for companies to load first
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['fixed-asset-categories', firstCompanyId],
    queryFn: () => fetchFixedAssetCategories(firstCompanyId),
    enabled: authReady && !!firstCompanyId && !companiesLoading
  });

  // Fetch fixed assets - wait for companies to load first
  const { data: assets = [], isLoading: assetsLoading, refetch: refetchAssets } = useQuery({
    queryKey: ['fixed-assets', firstCompanyId, statusFilter, categoryFilter, searchTerm],
    queryFn: () => fetchFixedAssets(firstCompanyId, {
      status: statusFilter !== 'all' ? statusFilter : undefined,
      categoryId: categoryFilter !== 'all' ? categoryFilter : undefined,
      search: searchTerm || undefined
    }),
    enabled: authReady && !!firstCompanyId && !companiesLoading
  });

  // Fetch summary data - wait for companies to load first
  const { data: summaryData, isLoading: summaryLoading } = useQuery({
    queryKey: ['fixed-assets-summary', firstCompanyId],
    queryFn: () => fetchFixedAssetSummary(firstCompanyId),
    enabled: authReady && !!firstCompanyId && !companiesLoading
  });

  // Fetch depreciation schedule
  const queryEnabled = authReady && !!firstCompanyId && !companiesLoading;

  const { data: depreciationSchedule = [], isLoading: depreciationScheduleLoading, refetch: refetchDepreciationSchedule } = useQuery({
    queryKey: ['depreciation-schedule', firstCompanyId, depreciationYear],
    queryFn: () => fetchDepreciationSchedule(firstCompanyId, depreciationYear),
    enabled: queryEnabled
  });

  // Maintenance API functions
  const fetchMaintenanceRecords = async (companyId: string, filters?: any) => {
    const params = new URLSearchParams({ companyId });
    if (filters?.assetId && filters.assetId !== 'all') params.append('assetId', filters.assetId);
    if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters?.type && filters.type !== 'all') params.append('type', filters.type);
    
    const url = `${getApiBaseUrl()}/api/fixed-assets/maintenance?${params}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo',
        'x-company-id': companyId,
      },
    });
    
    const data = await response.json();
    return data.maintenanceRecords || [];
  };

  const fetchMaintenanceSummary = async (companyId: string) => {
    const response = await fetch(`${getApiBaseUrl()}/api/fixed-assets/maintenance/summary?companyId=${companyId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo',
        'x-company-id': companyId,
      },
    });
    const data = await response.json();
    return data;
  };

  // Report generation functions
  const generateAssetSummaryReport = async (companyId: string) => {
    const response = await fetch(`${getApiBaseUrl()}/api/fixed-assets/reports/asset-summary?companyId=${companyId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo',
        'x-company-id': companyId,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to generate asset summary report');
    }
    return response.blob();
  };

  const generateDepreciationScheduleReport = async (companyId: string, year?: number) => {
    const url = year 
      ? `${getApiBaseUrl()}/api/fixed-assets/reports/depreciation-schedule?companyId=${companyId}&year=${year}`
      : `${getApiBaseUrl()}/api/fixed-assets/reports/depreciation-schedule?companyId=${companyId}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo',
        'x-company-id': companyId,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to generate depreciation schedule report');
    }
    return response.blob();
  };

  const generateAssetRegisterReport = async (companyId: string) => {
    const response = await fetch(`${getApiBaseUrl()}/api/fixed-assets/reports/asset-register?companyId=${companyId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo',
        'x-company-id': companyId,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to generate asset register report');
    }
    return response.blob();
  };

  const generateCategorySummaryReport = async (companyId: string) => {
    const response = await fetch(`${getApiBaseUrl()}/api/fixed-assets/reports/category-summary?companyId=${companyId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo',
        'x-company-id': companyId,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to generate category summary report');
    }
    return response.blob();
  };

  const generateAgingReport = async (companyId: string) => {
    const response = await fetch(`${getApiBaseUrl()}/api/fixed-assets/reports/aging?companyId=${companyId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo',
        'x-company-id': companyId,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to generate aging report');
    }
    return response.blob();
  };

const checkAccountExistence = async (companyId: string, accountName: string, accountType: string) => {
  const response = await fetch(`${getApiBaseUrl()}/api/accounts?companyId=${companyId}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo',
      'x-company-id': companyId,
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch accounts');
  }
  
  const data = await response.json();
  const accounts = Array.isArray(data) ? data : data.accounts || [];
  
  return accounts.some((account: any) => 
    account.name === accountName && 
    (account.accountType === accountType || account.type?.code === accountType)
  );
};

  // Fetch maintenance records
  const { data: maintenanceRecords = [], isLoading: maintenanceLoading, refetch: refetchMaintenance } = useQuery({
    queryKey: ['maintenance-records', firstCompanyId],
    queryFn: () => fetchMaintenanceRecords(firstCompanyId),
    enabled: authReady && !!firstCompanyId && !companiesLoading
  });

  // Fetch maintenance summary
  const { data: maintenanceSummary, isLoading: maintenanceSummaryLoading } = useQuery({
    queryKey: ['maintenance-summary', firstCompanyId],
    queryFn: () => fetchMaintenanceSummary(firstCompanyId),
    enabled: authReady && !!firstCompanyId && !companiesLoading
  });


  // Computed values for depreciation schedule
  const filteredDepreciationSchedule = React.useMemo(() => {
    if (depreciationFilter === 'all') return depreciationSchedule as any[];
    return (depreciationSchedule as any[]).filter((record: any) => record.assetId === depreciationFilter);
  }, [depreciationSchedule, depreciationFilter]);

  const groupedDepreciationSchedule = React.useMemo(() => {
    const grouped: { [key: string]: any[] } = {};
    filteredDepreciationSchedule.forEach((record: any) => {
      if (!grouped[record.assetId]) {
        grouped[record.assetId] = [];
      }
      grouped[record.assetId].push(record);
    });
    
    return grouped;
  }, [filteredDepreciationSchedule]);

  // Mutations
  const createAssetMutation = useMutation({
    mutationFn: createFixedAsset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fixed-assets'] });
      queryClient.invalidateQueries({ queryKey: ['fixed-assets-summary'] });
      setIsAssetDialogOpen(false);
      toast.success('Asset created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create asset');
    }
  });

  const updateAssetMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => updateFixedAsset(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fixed-assets'] });
      queryClient.invalidateQueries({ queryKey: ['fixed-assets-summary'] });
      setIsAssetDialogOpen(false);
      toast.success('Asset updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update asset');
    }
  });

  const deleteAssetMutation = useMutation({
    mutationFn: (id: string) => deleteFixedAsset(id, firstCompanyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fixed-assets'] });
      queryClient.invalidateQueries({ queryKey: ['fixed-assets-summary'] });
      toast.success('Asset deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete asset');
    }
  });

  const calculateDepreciationMutation = useMutation({
    mutationFn: ({ year, month }: { year: number, month: number }) => 
      calculateDepreciation(firstCompanyId, year, month),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['fixed-assets'] });
      queryClient.invalidateQueries({ queryKey: ['fixed-assets-summary'] });
      toast.success(`Calculated depreciation for ${data.depreciationRecords.length} assets`);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to calculate depreciation');
    }
  });

  // Category mutations
  const createCategoryMutation = useMutation({
    mutationFn: (data: any) => createFixedAssetCategory(firstCompanyId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fixed-asset-categories'] });
      queryClient.invalidateQueries({ queryKey: ['fixed-assets'] });
      setIsCategoryDialogOpen(false);
      setSelectedCategory(null);
      toast.success('Category created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create category');
    }
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => 
      updateFixedAssetCategory(firstCompanyId, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fixed-asset-categories'] });
      queryClient.invalidateQueries({ queryKey: ['fixed-assets'] });
      setIsCategoryDialogOpen(false);
      setSelectedCategory(null);
      toast.success('Category updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update category');
    }
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: string) => deleteFixedAssetCategory(firstCompanyId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fixed-asset-categories'] });
      queryClient.invalidateQueries({ queryKey: ['fixed-assets'] });
      setIsDeleteCategoryDialogOpen(false);
      setCategoryToDelete(null);
      toast.success('Category deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete category');
    }
  });

  const createMaintenanceMutation = useMutation({
    mutationFn: (data: any) => {
      try {
        const companyId = getCompanyId();
        const requestBody = {
          ...data,
          companyId: companyId
        };
        
        return fetch(`${getApiUrl()}/api/fixed-assets/maintenance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'x-tenant-id': getTenantId(),
          'x-company-id': getCompanyId()
        },
        body: JSON.stringify(requestBody)
      }).then(async res => {
        const result = await res.json();
        
        if (!res.ok) {
          throw new Error(result.error?.message || `HTTP ${res.status}: ${res.statusText}`);
        }
        
        return result;
      });
      } catch (error) {
        throw new Error('Company ID is required');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-records', firstCompanyId] });
      queryClient.invalidateQueries({ queryKey: ['maintenance-summary', firstCompanyId] });
      setIsMaintenanceDialogOpen(false);
      setEditingMaintenanceId(null);
      setMaintenanceFormData({
        assetId: '',
        maintenanceDate: new Date().toISOString().split('T')[0],
        maintenanceType: 'PREVENTIVE',
        description: '',
        performedBy: '',
        cost: 0,
        extendsUsefulLife: false,
        lifeExtensionMonths: 0,
        invoiceNumber: '',
        warrantyInfo: '',
        status: 'SCHEDULED'
      });
      toast.success('Maintenance record created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create maintenance record');
    }
  });

  const updateMaintenanceMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => {
      return fetch(`${getApiUrl()}/api/fixed-assets/maintenance/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'x-tenant-id': getTenantId(),
          'x-company-id': getCompanyId()
        },
        body: JSON.stringify(data)
      }).then(res => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-records', firstCompanyId] });
      queryClient.invalidateQueries({ queryKey: ['maintenance-summary', firstCompanyId] });
      setIsMaintenanceDialogOpen(false);
      setEditingMaintenanceId(null);
      setMaintenanceFormData({
        assetId: '',
        maintenanceDate: new Date().toISOString().split('T')[0],
        maintenanceType: 'PREVENTIVE',
        description: '',
        performedBy: '',
        cost: 0,
        extendsUsefulLife: false,
        lifeExtensionMonths: 0,
        invoiceNumber: '',
        warrantyInfo: '',
        status: 'SCHEDULED'
      });
      toast.success('Maintenance record updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update maintenance record');
    }
  });

  const deleteMaintenanceMutation = useMutation({
    mutationFn: (id: string) => {
      return fetch(`${getApiUrl()}/api/fixed-assets/maintenance/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'x-tenant-id': getTenantId(),
          'x-company-id': getCompanyId()
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-records', firstCompanyId] });
      queryClient.invalidateQueries({ queryKey: ['maintenance-summary', firstCompanyId] });
      toast.success('Maintenance record deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete maintenance record');
    }
  });

  // Report generation mutations
  const generateReportMutation = useMutation({
    mutationFn: ({ reportType, year }: { reportType: string, year?: number }) => {
      switch (reportType) {
        case 'asset-summary':
          return generateAssetSummaryReport(firstCompanyId);
        case 'depreciation-schedule':
          return generateDepreciationScheduleReport(firstCompanyId, year);
        case 'asset-register':
          return generateAssetRegisterReport(firstCompanyId);
        case 'category-summary':
          return generateCategorySummaryReport(firstCompanyId);
        case 'aging':
          return generateAgingReport(firstCompanyId);
        case 'compliance':
          return generateComplianceReport(firstCompanyId);
        default:
          throw new Error('Unknown report type');
      }
    },
    onSuccess: (blob, variables) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `fixed-assets-${variables.reportType}-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success(`${variables.reportType.replace('-', ' ')} report generated successfully`);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to generate report');
    }
  });

  // Report generation handlers
  const handleGenerateReport = (reportType: string, year?: number) => {
    generateReportMutation.mutate({ reportType, year });
  };

  // Post asset mutation
  const postAssetMutation = useMutation({
    mutationFn: (assetId: string) => {
      return fetch(`${getApiUrl()}/api/fixed-assets/${assetId}/post`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'x-tenant-id': getTenantId(),
          'x-company-id': getCompanyId()
        }
      }).then(async res => {
        const result = await res.json();
        
        if (!res.ok) {
          throw new Error(result.error || `HTTP ${res.status}: ${res.statusText}`);
        }
        
        return result;
      });
    },
    onSuccess: (data, assetId) => {
      // Only invalidate specific asset queries instead of all assets
      queryClient.invalidateQueries({ queryKey: ['fixed-assets', firstCompanyId] });
      queryClient.invalidateQueries({ queryKey: ['fixed-assets-summary', firstCompanyId] });
      
      // Close the modal
      setIsPostDialogOpen(false);
      setAssetToPost(null);
      
      toast.success(data.message || 'Asset posted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to post asset');
    }
  });

  const handlePostAssetClick = async (asset: any) => {
    setAssetToPost(asset);
    setIsCheckingAccounts(true);
    setIsPostDialogOpen(true);
    
    try {
      const config = await checkAccountConfiguration(asset);
      setAccountConfig(config);
    } catch (error) {
      console.error('Error checking accounts:', error);
      // Fallback to basic config
      setAccountConfig({
        hasAssetAccount: !!asset.category?.assetAccountId,
        hasCashAccount: true,
        canCreateEntries: true,
        needsAutoCreation: !asset.category?.assetAccountId,
        assetAccountExists: false,
        cashAccountExists: false,
        expectedAssetAccountName: `${asset.category?.name} Assets`,
        expectedCashAccountName: 'Cash and Cash Equivalents'
      });
    } finally {
      setIsCheckingAccounts(false);
    }
  };

  const handlePostConfirm = () => {
    if (assetToPost) {
      postAssetMutation.mutate(assetToPost.id);
    }
  };

  const handlePostCancel = () => {
    setIsPostDialogOpen(false);
    setAssetToPost(null);
    setAccountConfig(null);
    setIsCheckingAccounts(false);
  };

  // Check if accounts are configured for posting
  const checkAccountConfiguration = async (asset: any) => {
    const hasAssetAccount = asset.category?.assetAccountId;
    
    // Generate expected account names
    const expectedAssetAccountName = `${asset.category?.name} Assets`;
    const expectedCashAccountName = 'Cash and Cash Equivalents';
    
    // Check if accounts exist
    const [assetAccountExists, cashAccountExists] = await Promise.all([
      hasAssetAccount ? Promise.resolve(true) : checkAccountExistence(firstCompanyId, expectedAssetAccountName, 'ASSET'),
      checkAccountExistence(firstCompanyId, expectedCashAccountName, 'ASSET')
    ]);
    
    return {
      hasAssetAccount: !!hasAssetAccount,
      hasCashAccount: cashAccountExists,
      canCreateEntries: true, // Always true now since we auto-create accounts
      needsAutoCreation: !hasAssetAccount || !cashAccountExists,
      assetAccountExists,
      cashAccountExists,
      expectedAssetAccountName,
      expectedCashAccountName
    };
  };

  // Handle delete confirmation
  const handleDeleteClick = (asset: any) => {
    setAssetToDelete(asset);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (assetToDelete) {
      deleteAssetMutation.mutate(assetToDelete.id);
      setIsDeleteDialogOpen(false);
      setAssetToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false);
    setAssetToDelete(null);
  };

  // Handle category delete confirmation
  const handleDeleteCategoryClick = (category: any) => {
    setCategoryToDelete(category);
    setIsDeleteCategoryDialogOpen(true);
  };

  const handleDeleteCategoryConfirm = () => {
    if (categoryToDelete) {
      deleteCategoryMutation.mutate(categoryToDelete.id);
    }
  };

  const handleDeleteCategoryCancel = () => {
    setIsDeleteCategoryDialogOpen(false);
    setCategoryToDelete(null);
  };

  const handleMaintenanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMaintenanceFormErrors({});

    // Validation
    const errors: {[key: string]: string} = {};
    if (!maintenanceFormData.assetId) errors.assetId = 'Asset is required';
    if (!maintenanceFormData.maintenanceDate) errors.maintenanceDate = 'Maintenance date is required';
    if (!maintenanceFormData.maintenanceType) errors.maintenanceType = 'Maintenance type is required';
    if (!maintenanceFormData.description) errors.description = 'Description is required';
    if (maintenanceFormData.cost < 0) errors.cost = 'Cost cannot be negative';
    if (maintenanceFormData.extendsUsefulLife && maintenanceFormData.lifeExtensionMonths <= 0) {
      errors.lifeExtensionMonths = 'Life extension months must be greater than 0';
    }

    if (Object.keys(errors).length > 0) {
      setMaintenanceFormErrors(errors);
      return;
    }

    // Prepare data for submission - only include lifeExtensionMonths if extendsUsefulLife is true
    const submitData = {
      ...maintenanceFormData,
      lifeExtensionMonths: maintenanceFormData.extendsUsefulLife ? maintenanceFormData.lifeExtensionMonths : undefined
    };

    if (editingMaintenanceId) {
      updateMaintenanceMutation.mutate({ id: editingMaintenanceId, data: submitData });
    } else {
      createMaintenanceMutation.mutate(submitData);
    }
  };

  const handleMaintenanceFormChange = (field: string, value: any) => {
    setMaintenanceFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (maintenanceFormErrors[field]) {
      setMaintenanceFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Filtered assets
  const filteredAssets = useMemo(() => {
    return assets.filter((asset: any) => {
      const matchesSearch = !searchTerm || 
        asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.notes?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = categoryFilter === 'all' || asset.categoryId === categoryFilter;
      
      return matchesSearch && matchesCategory;
    });
  }, [assets, searchTerm, categoryFilter]);

  // Status color mapping
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'bg-yellow-100 text-yellow-800';
      case 'POSTED': return 'bg-green-100 text-green-800';
      case 'DISPOSED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Depreciation method labels
  const getDepreciationMethodLabel = (method: string) => {
    switch (method) {
      case 'STRAIGHT_LINE': return 'Straight Line';
      case 'DECLINING_BALANCE': return 'Declining Balance';
      case 'SUM_OF_YEARS': return 'Sum of Years';
      case 'UNITS_OF_PRODUCTION': return 'Units of Production';
      default: return method;
    }
  };

  // Asset form component
  const AssetForm = ({ asset, onSave, onCancel }: any) => {
    const [formData, setFormData] = useState({
      companyId: firstCompanyId,
      name: asset?.name || '',
      categoryId: asset?.categoryId || '',
      cost: asset?.cost || '',
      currency: asset?.currency || 'USD',
      acquisitionDate: asset?.acquisitionDate || '',
      startDepreciation: asset?.startDepreciation || '',
      salvageValue: asset?.salvageValue || '',
      notes: asset?.notes || ''
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setFormErrors({});

      // Validation
      const errors: {[key: string]: string} = {};
      if (!formData.name) errors.name = 'Asset name is required';
      if (!formData.categoryId) errors.categoryId = 'Category is required';
      if (!formData.cost) errors.cost = 'Cost is required';
      if (!formData.acquisitionDate) errors.acquisitionDate = 'Acquisition date is required';
      if (!formData.startDepreciation) errors.startDepreciation = 'Start depreciation date is required';

      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      }

      onSave(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Asset Name *</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="e.g., Office Computer"
              className={formErrors.name ? 'border-red-500' : ''}
            />
            {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Category *</label>
            <Select value={formData.categoryId} onValueChange={(value) => setFormData({...formData, categoryId: value})}>
              <SelectTrigger className={formErrors.categoryId ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category: any) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formErrors.categoryId && <p className="text-red-500 text-xs mt-1">{formErrors.categoryId}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Cost *</label>
            <Input
              type="number"
              step="0.01"
              value={formData.cost}
              onChange={(e) => setFormData({...formData, cost: e.target.value})}
              placeholder="0.00"
              className={formErrors.cost ? 'border-red-500' : ''}
            />
            {formErrors.cost && <p className="text-red-500 text-xs mt-1">{formErrors.cost}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Currency</label>
            <Select value={formData.currency} onValueChange={(value) => setFormData({...formData, currency: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="GBP">GBP</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Acquisition Date *</label>
            <Input
              type="date"
              value={formData.acquisitionDate}
              onChange={(e) => setFormData({...formData, acquisitionDate: e.target.value})}
              className={formErrors.acquisitionDate ? 'border-red-500' : ''}
            />
            {formErrors.acquisitionDate && <p className="text-red-500 text-xs mt-1">{formErrors.acquisitionDate}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Start Depreciation Date *</label>
            <Input
              type="date"
              value={formData.startDepreciation}
              onChange={(e) => setFormData({...formData, startDepreciation: e.target.value})}
              className={formErrors.startDepreciation ? 'border-red-500' : ''}
            />
            {formErrors.startDepreciation && <p className="text-red-500 text-xs mt-1">{formErrors.startDepreciation}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Salvage Value</label>
            <Input
              type="number"
              step="0.01"
              value={formData.salvageValue}
              onChange={(e) => setFormData({...formData, salvageValue: e.target.value})}
              placeholder="0.00"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Notes</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
            placeholder="Additional notes"
            className="w-full p-2 border rounded-md"
            rows={3}
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={createAssetMutation.isPending || updateAssetMutation.isPending}>
            {createAssetMutation.isPending || updateAssetMutation.isPending ? (
              <>
                <MoonLoader size="sm" color="gray" className="mr-2" />
                {createAssetMutation.isPending ? 'Creating Asset...' : 'Updating Asset...'}
              </>
            ) : (
              asset ? 'Update Asset' : 'Create Asset'
            )}
          </Button>
        </DialogFooter>
      </form>
    );
  };

  if (!isAuthenticated) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <MoonLoader size="xl" color="teal" />
            <h3 className="text-lg font-semibold mt-4 mb-2">Loading Fixed Assets</h3>
            <p className="text-muted-foreground">Please wait while we initialize your asset management system...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Fixed Assets Management</h1>
            <p className="text-muted-foreground">
              Manage your company's fixed assets, depreciation, and maintenance
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setIsAssetDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Asset
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        {summaryData ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summaryData.summary.totalAssets}</div>
                <p className="text-xs text-muted-foreground">
                  Fixed assets registered
                </p>
            </CardContent>
          </Card>

          <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Draft Assets</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {assets.filter((asset: any) => asset.status === 'DRAFT').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Pending posting
                </p>
            </CardContent>
          </Card>

          <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Posted Assets</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {assets.filter((asset: any) => asset.status === 'POSTED').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  In accounting system
                </p>
            </CardContent>
          </Card>

          <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${Number(summaryData.summary.totalCost).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total asset value
                </p>
              </CardContent>
            </Card>
        </div>
        ) : summaryLoading ? (
          <div className="text-center py-8">
            <MoonLoader size="md" color="teal" />
            <p className="text-sm text-muted-foreground mt-3">Loading summary data...</p>
          </div>
        ) : (
          <div className="text-center py-8">
            <Building2 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">No summary data available</p>
          </div>
        )}

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search assets..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="POSTED">Posted</SelectItem>
                  <SelectItem value="DISPOSED">Disposed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category: any) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Assets Overview</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="depreciation">Depreciation</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          {/* Assets Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Fixed Assets ({filteredAssets.length})</CardTitle>
                <CardDescription>
                  Manage your company's fixed assets
                </CardDescription>
              </CardHeader>
              <CardContent>
                {assetsLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="text-center">
                      <MoonLoader size="lg" color="teal" />
                      <p className="text-sm text-muted-foreground mt-3">Loading fixed assets...</p>
                    </div>
                  </div>
                ) : filteredAssets.length === 0 ? (
                  <div className="text-center py-12">
                    <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Fixed Assets Found</h3>
                    <p className="text-muted-foreground mb-4">
                      {searchTerm || categoryFilter !== 'all' 
                        ? 'No assets match your current filters. Try adjusting your search criteria.'
                        : 'Get started by adding your first fixed asset to track your company\'s investments.'
                      }
                    </p>
                    <Button onClick={() => setIsAssetDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Asset
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Cost</TableHead>
                        <TableHead>Accumulated Depreciation</TableHead>
                        <TableHead>Net Book Value</TableHead>
                        <TableHead>Currency</TableHead>
                        <TableHead>Acquisition Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAssets.map((asset: any) => {
                        // Calculate accumulated depreciation from depreciation records
                        const accumulatedDepreciation = asset.depreciations?.reduce((sum: number, dep: any) => sum + (dep.amount || 0), 0) || 0;
                        const netBookValue = Number(asset.cost) - accumulatedDepreciation;
                        
                        return (
                        <TableRow key={asset.id}>
                          <TableCell className="font-medium">{asset.name}</TableCell>
                          <TableCell>{asset.category?.name}</TableCell>
                          <TableCell>
                            <Badge 
                              variant={asset.status === 'DRAFT' ? 'secondary' : asset.status === 'POSTED' ? 'default' : 'destructive'}
                              className={asset.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-800' : asset.status === 'POSTED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                            >
                              {asset.status}
                            </Badge>
                          </TableCell>
                          <TableCell>${Number(asset.cost).toLocaleString()}</TableCell>
                          <TableCell>${accumulatedDepreciation.toLocaleString()}</TableCell>
                          <TableCell className={netBookValue < 0 ? 'text-red-600 font-semibold' : ''}>
                            ${netBookValue.toLocaleString()}
                          </TableCell>
                          <TableCell>{asset.currency}</TableCell>
                          <TableCell>{asset.acquisitionDate}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {asset.status === 'DRAFT' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handlePostAssetClick(asset)}
                                  disabled={postAssetMutation.isPending}
                                  className="bg-green-600 hover:bg-green-700 text-white border-green-600"
                                >
                                  {postAssetMutation.isPending ? (
                                    <MoonLoader size="sm" color="gray" />
                                  ) : (
                                    'Post'
                                  )}
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedAsset(asset);
                                  setIsAssetDialogOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteClick(asset)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Asset Categories ({categories.length})</CardTitle>
                    <CardDescription>
                      Manage fixed asset categories and their depreciation settings
                    </CardDescription>
                  </div>
                  <Button onClick={() => setIsCategoryDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Category
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
              {categoriesLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-center">
                    <MoonLoader size="lg" color="teal" />
                    <p className="text-sm text-muted-foreground mt-3">Loading asset categories...</p>
                  </div>
                </div>
              ) : categories.length === 0 ? (
                  <div className="text-center py-12">
                    <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Categories Found</h3>
                    <p className="text-muted-foreground mb-4">
                      Create your first asset category to organize your fixed assets.
                    </p>
                    <Button onClick={() => setIsCategoryDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Category
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories.map((category: any) => (
                      <Card key={category.id} className="relative">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-lg">{category.name}</CardTitle>
                              <CardDescription>
                                {category.usefulLifeMonths} months useful life
                              </CardDescription>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedCategory(category);
                                  setIsCategoryDialogOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteCategoryClick(category)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Depreciation Method:</span>
                              <Badge variant="secondary">
                                {category.method?.replace('_', ' ').toUpperCase()}
                              </Badge>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Salvage Rate:</span>
                              <span>{category.salvageRate || 0}%</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Assets:</span>
                              <span>
                                {assets.filter((asset: any) => asset.categoryId === category.id).length}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Depreciation Tab */}
          <TabsContent value="depreciation" className="space-y-4">
            {/* Depreciation Controls */}
            <Card>
              <CardHeader>
                <CardTitle>Depreciation Controls</CardTitle>
                <CardDescription>
                  Calculate and manage asset depreciation for specific periods
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <Label htmlFor="depreciation-year">Year</Label>
                    <Select 
                      value={depreciationYear.toString()} 
                      onValueChange={(value) => setDepreciationYear(parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 10 }, (_, i) => {
                          const year = new Date().getFullYear() - 5 + i;
                          return (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="depreciation-month">Month</Label>
                    <Select 
                      value={depreciationMonth.toString()} 
                      onValueChange={(value) => setDepreciationMonth(parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => (
                          <SelectItem key={i + 1} value={(i + 1).toString()}>
                            {new Date(0, i).toLocaleString('default', { month: 'long' })}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button
                      onClick={() => {
                        calculateDepreciationMutation.mutate({
                          year: depreciationYear,
                          month: depreciationMonth
                        });
                      }}
                      disabled={calculateDepreciationMutation.isPending}
                      className="w-full"
                    >
                      {calculateDepreciationMutation.isPending ? (
                        <>
                          <MoonLoader size="sm" color="gray" className="mr-2" />
                          Calculating...
                        </>
                      ) : (
                        <>
                          <Calculator className="h-4 w-4 mr-2" />
                          Calculate Depreciation
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      const currentDate = new Date();
                      setDepreciationYear(currentDate.getFullYear());
                      setDepreciationMonth(currentDate.getMonth() + 1);
                    }}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Set to Current Month
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      // Calculate for entire year
                      for (let month = 1; month <= 12; month++) {
                        setTimeout(() => {
                          calculateDepreciationMutation.mutate({
                            year: depreciationYear,
                            month: month
                          });
                        }, month * 1000); // Stagger requests
                      }
                    }}
                    disabled={calculateDepreciationMutation.isPending}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Calculate Entire Year
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Depreciation Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Depreciation Summary</CardTitle>
                <CardDescription>
                  Overview of depreciation calculations and totals
                </CardDescription>
              </CardHeader>
              <CardContent>
                {summaryLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="text-center">
                      <MoonLoader size="lg" color="teal" />
                      <p className="text-sm text-muted-foreground mt-3">Loading depreciation summary...</p>
                    </div>
                  </div>
                ) : summaryData ? (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-blue-600">Total Assets</p>
                          <p className="text-2xl font-bold text-blue-900">{summaryData.totalAssets || 0}</p>
                        </div>
                        <Building2 className="h-8 w-8 text-blue-500" />
                      </div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-green-600">Total Cost</p>
                          <p className="text-2xl font-bold text-green-900">
                            ${(summaryData.totalCost || 0).toLocaleString()}
                          </p>
                        </div>
                        <DollarSign className="h-8 w-8 text-green-500" />
                      </div>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-orange-600">Accumulated Depreciation</p>
                          <p className="text-2xl font-bold text-orange-900">
                            ${(summaryData.accumulatedDepreciation || 0).toLocaleString()}
                          </p>
                        </div>
                        <TrendingDown className="h-8 w-8 text-orange-500" />
                      </div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-purple-600">Net Book Value</p>
                          <p className="text-2xl font-bold text-purple-900">
                            ${(summaryData.netBookValue || 0).toLocaleString()}
                          </p>
                        </div>
                        <Calculator className="h-8 w-8 text-purple-500" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calculator className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">No depreciation summary available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Depreciation Schedule */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Depreciation Schedule</CardTitle>
                    <CardDescription>
                      Detailed view of all depreciation records by asset
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Select value={depreciationFilter} onValueChange={setDepreciationFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Filter by asset" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Assets</SelectItem>
                        {assets.map((asset: any) => (
                          <SelectItem key={asset.id} value={asset.id}>
                            {asset.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => refetchDepreciationSchedule()}
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {depreciationScheduleLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="text-center">
                      <MoonLoader size="lg" color="teal" />
                      <p className="text-sm text-muted-foreground mt-3">Loading depreciation schedule...</p>
                    </div>
                  </div>
                ) : filteredDepreciationSchedule.length === 0 ? (
                  <div className="text-center py-12">
                    <Calculator className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Depreciation Records Found</h3>
                    <p className="text-muted-foreground mb-4">
                      Calculate depreciation for your assets to see the schedule here.
                    </p>
                    <Button
                      onClick={() => {
                        const currentDate = new Date();
                        calculateDepreciationMutation.mutate({
                          year: currentDate.getFullYear(),
                          month: currentDate.getMonth() + 1
                        });
                      }}
                    >
                      <Calculator className="h-4 w-4 mr-2" />
                      Calculate Depreciation
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(groupedDepreciationSchedule).map(([assetId, records]: [string, any[]]) => {
                      const asset = assets.find((a: any) => a.id === assetId);
                      if (!asset) return null;
                      
                      const totalDepreciation = records.reduce((sum, record) => sum + (record.amount || 0), 0);
                      const netBookValue = Number(asset.cost) - totalDepreciation;
                      
                      return (
                        <div key={assetId} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h4 className="font-semibold">{asset.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                Cost: ${Number(asset.cost).toLocaleString()} | 
                                Accumulated: ${totalDepreciation.toLocaleString()} | 
                                Net Book Value: ${netBookValue.toLocaleString()}
                              </p>
                            </div>
                            <Badge variant="secondary">
                              {asset.category?.name}
                            </Badge>
                          </div>
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Period</TableHead>
                                  <TableHead>Depreciation Amount</TableHead>
                                  <TableHead>Accumulated</TableHead>
                                  <TableHead>Method</TableHead>
                                  <TableHead>Date</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {records.map((record: any, index: number) => (
                                  <TableRow key={record.id || index}>
                                    <TableCell className="font-medium">{record.period}</TableCell>
                                    <TableCell>${(record.amount || 0).toLocaleString()}</TableCell>
                                    <TableCell>${(record.accumulated || 0).toLocaleString()}</TableCell>
                                    <TableCell>
                                      <Badge variant="outline">
                                        {record.method?.replace('_', ' ').toUpperCase() || 'STRAIGHT LINE'}
                                      </Badge>
                                    </TableCell>
                                    <TableCell>
                                      {record.createdAt ? new Date(record.createdAt).toLocaleDateString() : '-'}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Maintenance Tab */}
          <TabsContent value="maintenance" className="space-y-6">
            {/* Maintenance Overview */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Asset Maintenance</h3>
                  <p className="text-gray-600 mt-1">Track and manage asset maintenance schedules</p>
                </div>
                <Button 
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => setIsMaintenanceDialogOpen(true)}
                >
                  <Wrench className="h-4 w-4 mr-2" />
                  Schedule Maintenance
                </Button>
              </div>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Upcoming Maintenance</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {maintenanceSummaryLoading ? '...' : (maintenanceSummary?.upcomingMaintenance || 0)}
                      </p>
                    </div>
                    <Calendar className="h-8 w-8 text-green-500" />
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Overdue</p>
                      <p className="text-2xl font-bold text-red-600">
                        {maintenanceSummaryLoading ? '...' : (maintenanceSummary?.overdueMaintenance || 0)}
                      </p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-red-500" />
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Cost This Year</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {maintenanceSummaryLoading ? '...' : `$${(maintenanceSummary?.yearlyCost || 0).toLocaleString()}`}
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-green-500" />
                  </div>
                </div>
              </div>
            </div>

            {/* Maintenance Records */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Maintenance Records</h3>
                    <p className="text-sm text-gray-600 mt-1">Recent maintenance activities and schedules</p>
                  </div>
                  <div className="flex gap-3">
                    <Select defaultValue="all">
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Filter by asset" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Assets</SelectItem>
                        {assets.map((asset: any) => (
                          <SelectItem key={asset.id} value={asset.id}>
                            {asset.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-gray-300 text-gray-700 hover:bg-gray-50"
                      onClick={() => refetchMaintenance()}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                {maintenanceLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="text-center">
                      <MoonLoader size="lg" color="green" />
                      <p className="text-sm text-gray-600 mt-3">Loading maintenance records...</p>
                    </div>
                  </div>
                ) : maintenanceRecords.length === 0 ? (
                  <div className="text-center py-12">
                    <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Maintenance Records Found</h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      Start tracking maintenance activities for your assets to keep them in optimal condition.
                    </p>
                    <Button className="bg-green-600 hover:bg-green-700 text-white">
                      <Wrench className="h-4 w-4 mr-2" />
                      Add Maintenance Record
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {maintenanceRecords.map((record: any) => {
                      const getStatusColor = (status: string) => {
                        switch (status) {
                          case 'COMPLETED': return 'border-green-300 text-green-700';
                          case 'IN_PROGRESS': return 'border-orange-300 text-orange-700';
                          case 'SCHEDULED': return 'border-blue-300 text-blue-700';
                          case 'CANCELLED': return 'border-red-300 text-red-700';
                          default: return 'border-gray-300 text-gray-700';
                        }
                      };

                      const getTypeIcon = (type: string) => {
                        switch (type) {
                          case 'PREVENTIVE': return <Wrench className="h-5 w-5 text-blue-600" />;
                          case 'EMERGENCY': return <AlertTriangle className="h-5 w-5 text-orange-600" />;
                          case 'INSPECTION': return <Calendar className="h-5 w-5 text-green-600" />;
                          case 'CORRECTIVE': return <Wrench className="h-5 w-5 text-red-600" />;
                          default: return <Wrench className="h-5 w-5 text-gray-600" />;
                        }
                      };

                      const getTypeBgColor = (type: string) => {
                        switch (type) {
                          case 'PREVENTIVE': return 'bg-blue-100';
                          case 'EMERGENCY': return 'bg-orange-100';
                          case 'INSPECTION': return 'bg-green-100';
                          case 'CORRECTIVE': return 'bg-red-100';
                          default: return 'bg-gray-100';
                        }
                      };

                      return (
                        <div key={record.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 ${getTypeBgColor(record.maintenanceType)} rounded-lg`}>
                                {getTypeIcon(record.maintenanceType)}
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900">
                                  {record.asset?.name} - {record.maintenanceType.replace('_', ' ')}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  {record.asset?.category?.name || 'Unknown Category'}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge variant="outline" className={getStatusColor(record.status)}>
                                {record.status.replace('_', ' ')}
                              </Badge>
                              <p className="text-sm text-gray-600 mt-1">
                                {new Date(record.maintenanceDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Type:</span>
                              <span className="ml-2 font-medium">{record.maintenanceType.replace('_', ' ')}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Cost:</span>
                              <span className="ml-2 font-medium">${record.cost.toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Technician:</span>
                              <span className="ml-2 font-medium">{record.performedBy || 'Not specified'}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Invoice:</span>
                              <span className="ml-2 font-medium">{record.invoiceNumber || 'N/A'}</span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mt-3">
                            {record.description}
                          </p>
                          {record.extendsUsefulLife && record.lifeExtensionMonths && (
                            <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                              <p className="text-sm text-green-700">
                                <strong>Life Extension:</strong> This maintenance extends the asset's useful life by {record.lifeExtensionMonths} months.
                              </p>
                            </div>
                          )}
                          
                          {/* Action Buttons */}
                          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                            {/* Quick Status Update */}
                            <div className="flex items-center gap-2">
                              <Label className="text-sm text-gray-600">Status:</Label>
                              <Select
                                value={record.status}
                                onValueChange={(newStatus) => {
                                  updateMaintenanceMutation.mutate({
                                    id: record.id,
                                    data: { status: newStatus }
                                  });
                                }}
                              >
                                <SelectTrigger className="w-32 h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                  <SelectItem value="COMPLETED">Completed</SelectItem>
                                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            {/* Edit and Delete Buttons */}
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingMaintenanceId(record.id);
                                  setMaintenanceFormData({
                                    assetId: record.assetId,
                                    maintenanceDate: record.maintenanceDate.split('T')[0],
                                    maintenanceType: record.maintenanceType,
                                    description: record.description,
                                    performedBy: record.performedBy || '',
                                    cost: record.cost,
                                    extendsUsefulLife: record.extendsUsefulLife,
                                    lifeExtensionMonths: record.lifeExtensionMonths || 0,
                                    invoiceNumber: record.invoiceNumber || '',
                                    warrantyInfo: record.warrantyInfo || '',
                                    status: record.status
                                  });
                                  setIsMaintenanceDialogOpen(true);
                                }}
                                className="text-blue-600 hover:text-blue-700"
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  if (confirm('Are you sure you want to delete this maintenance record?')) {
                                    deleteMaintenanceMutation.mutate(record.id);
                                  }
                                }}
                                disabled={deleteMaintenanceMutation.isPending}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            {/* Reports Overview */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-6 border border-purple-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Fixed Asset Reports</h3>
                  <p className="text-gray-600 mt-1">Generate comprehensive reports and analytics</p>
                </div>
                <Button 
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                  onClick={() => handleGenerateReport('asset-summary')}
                  disabled={generateReportMutation.isPending}
                >
                  {generateReportMutation.isPending ? (
                    <>
                      <MoonLoader size="sm" color="gray" className="mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      Generate Report
                    </>
                  )}
                </Button>
              </div>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg p-4 border border-purple-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Assets</p>
                      <p className="text-2xl font-bold text-gray-900">{summaryData?.totalAssets || 0}</p>
                    </div>
                    <Building2 className="h-8 w-8 text-purple-500" />
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-purple-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Value</p>
                      <p className="text-2xl font-bold text-gray-900">
                        ${(summaryData?.totalCost || 0).toLocaleString()}
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-purple-500" />
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-purple-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Depreciation</p>
                      <p className="text-2xl font-bold text-gray-900">
                        ${(summaryData?.accumulatedDepreciation || 0).toLocaleString()}
                      </p>
                    </div>
                    <TrendingDown className="h-8 w-8 text-purple-500" />
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-purple-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Net Book Value</p>
                      <p className="text-2xl font-bold text-gray-900">
                        ${(summaryData?.netBookValue || 0).toLocaleString()}
                      </p>
                    </div>
                    <Calculator className="h-8 w-8 text-purple-500" />
                  </div>
                </div>
              </div>
            </div>

            {/* Report Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Asset Summary Report */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <BarChart3 className="h-6 w-6 text-blue-600" />
                    </div>
                    <Badge variant="outline" className="border-blue-300 text-blue-700">
                      Summary
                    </Badge>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Asset Summary Report</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Comprehensive overview of all fixed assets including cost, depreciation, and current values.
                  </p>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Total Assets:</span>
                      <span className="font-medium">{summaryData?.totalAssets || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Cost:</span>
                      <span className="font-medium">${(summaryData?.totalCost || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Net Book Value:</span>
                      <span className="font-medium">${(summaryData?.netBookValue || 0).toLocaleString()}</span>
                    </div>
                  </div>
                  <Button 
                    className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => handleGenerateReport('asset-summary')}
                    disabled={generateReportMutation.isPending}
                  >
                    {generateReportMutation.isPending ? (
                      <>
                        <MoonLoader size="sm" color="gray" className="mr-2" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <FileText className="h-4 w-4 mr-2" />
                        Generate Report
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Depreciation Schedule Report */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <TrendingDown className="h-6 w-6 text-green-600" />
                    </div>
                    <Badge variant="outline" className="border-green-300 text-green-700">
                      Depreciation
                    </Badge>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Depreciation Schedule</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Detailed monthly depreciation calculations and accumulated depreciation by asset.
                  </p>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Current Year:</span>
                      <span className="font-medium">{new Date().getFullYear()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Depreciation:</span>
                      <span className="font-medium">${(summaryData?.accumulatedDepreciation || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Records:</span>
                      <span className="font-medium">{depreciationSchedule.length}</span>
                    </div>
                  </div>
                  <Button 
                    className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => handleGenerateReport('depreciation-schedule', new Date().getFullYear())}
                    disabled={generateReportMutation.isPending}
                  >
                    {generateReportMutation.isPending ? (
                      <>
                        <MoonLoader size="sm" color="gray" className="mr-2" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <TrendingDown className="h-4 w-4 mr-2" />
                        Generate Report
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Asset Register Report */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-orange-100 rounded-lg">
                      <Building2 className="h-6 w-6 text-orange-600" />
                    </div>
                    <Badge variant="outline" className="border-orange-300 text-orange-700">
                      Register
                    </Badge>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Asset Register</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Complete listing of all fixed assets with acquisition details and current status.
                  </p>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Active Assets:</span>
                      <span className="font-medium">{assets.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Categories:</span>
                      <span className="font-medium">{categories.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg. Value:</span>
                      <span className="font-medium">
                        ${summaryData?.totalCost && summaryData?.totalAssets 
                          ? (summaryData.totalCost / summaryData.totalAssets).toLocaleString() 
                          : '0'}
                      </span>
                    </div>
                  </div>
                  <Button 
                    className="w-full mt-4 bg-orange-600 hover:bg-orange-700 text-white"
                    onClick={() => handleGenerateReport('asset-register')}
                    disabled={generateReportMutation.isPending}
                  >
                    {generateReportMutation.isPending ? (
                      <>
                        <MoonLoader size="sm" color="gray" className="mr-2" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Building2 className="h-4 w-4 mr-2" />
                        Generate Report
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Category Summary Report */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <Layers className="h-6 w-6 text-purple-600" />
                    </div>
                    <Badge variant="outline" className="border-purple-300 text-purple-700">
                      Categories
                    </Badge>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Category Summary</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Asset distribution and values by category with depreciation method analysis.
                  </p>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Total Categories:</span>
                      <span className="font-medium">{categories.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Most Used Method:</span>
                      <span className="font-medium">Straight Line</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg. Useful Life:</span>
                      <span className="font-medium">
                        {categories.length > 0 
                          ? Math.round(categories.reduce((sum: number, cat: any) => sum + (cat.usefulLifeMonths || 0), 0) / categories.length / 12)
                          : 0} years
                      </span>
                    </div>
                  </div>
                  <Button 
                    className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white"
                    onClick={() => handleGenerateReport('category-summary')}
                    disabled={generateReportMutation.isPending}
                  >
                    {generateReportMutation.isPending ? (
                      <>
                        <MoonLoader size="sm" color="gray" className="mr-2" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Layers className="h-4 w-4 mr-2" />
                        Generate Report
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Aging Report */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-red-100 rounded-lg">
                      <Clock className="h-6 w-6 text-red-600" />
                    </div>
                    <Badge variant="outline" className="border-red-300 text-red-700">
                      Aging
                    </Badge>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Asset Aging Report</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Analysis of asset age distribution and remaining useful life by category.
                  </p>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>New Assets (0-1yr):</span>
                      <span className="font-medium">2</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Mid-life (1-5yr):</span>
                      <span className="font-medium">3</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Mature (5+yr):</span>
                      <span className="font-medium">1</span>
                    </div>
                  </div>
                  <Button 
                    className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white"
                    onClick={() => handleGenerateReport('aging')}
                    disabled={generateReportMutation.isPending}
                  >
                    {generateReportMutation.isPending ? (
                      <>
                        <MoonLoader size="sm" color="gray" className="mr-2" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Clock className="h-4 w-4 mr-2" />
                        Generate Report
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Compliance Report */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-indigo-100 rounded-lg">
                      <Shield className="h-6 w-6 text-indigo-600" />
                    </div>
                    <Badge variant="outline" className="border-indigo-300 text-indigo-700">
                      Compliance
                    </Badge>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Compliance Report</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Audit trail and compliance status for regulatory requirements and internal policies.
                  </p>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Compliant Assets:</span>
                      <span className="font-medium text-green-600">{assets.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Audit Trail:</span>
                      <span className="font-medium">Complete</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Audit:</span>
                      <span className="font-medium">Dec 2024</span>
                    </div>
                  </div>
                  <Button 
                    className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white"
                    onClick={() => handleGenerateReport('compliance')}
                    disabled={generateReportMutation.isPending}
                  >
                    {generateReportMutation.isPending ? (
                      <>
                        <MoonLoader size="sm" color="gray" className="mr-2" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Shield className="h-4 w-4 mr-2" />
                        Generate Report
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Export Options */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Options</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="h-12 border-gray-300 text-gray-700 hover:bg-gray-50">
                    <FileText className="h-5 w-5 mr-2" />
                    Export to PDF
                  </Button>
                  <Button variant="outline" className="h-12 border-gray-300 text-gray-700 hover:bg-gray-50">
                    <FileSpreadsheet className="h-5 w-5 mr-2" />
                    Export to Excel
                  </Button>
                  <Button variant="outline" className="h-12 border-gray-300 text-gray-700 hover:bg-gray-50">
                    <Mail className="h-5 w-5 mr-2" />
                    Email Report
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Asset Dialog */}
        <Dialog open={isAssetDialogOpen} onOpenChange={setIsAssetDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedAsset ? 'Edit Asset' : 'Add New Asset'}
              </DialogTitle>
              <DialogDescription>
                {selectedAsset ? 'Update asset information' : 'Create a new fixed asset'}
              </DialogDescription>
            </DialogHeader>
            <AssetForm
              asset={selectedAsset}
              onSave={(data: any) => {
                if (selectedAsset) {
                  updateAssetMutation.mutate({ id: selectedAsset.id, data });
                } else {
                  createAssetMutation.mutate(data);
                }
              }}
              onCancel={() => {
                setIsAssetDialogOpen(false);
                setSelectedAsset(null);
                setFormErrors({});
              }}
            />
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Fixed Asset</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{assetToDelete?.name}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Warning
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      If this asset has depreciation records, deletion will be prevented. 
                      Consider disposing the asset instead.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleDeleteCancel}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDeleteConfirm}
                disabled={deleteAssetMutation.isPending}
              >
                {deleteAssetMutation.isPending ? (
                  <>
                    <MoonLoader size="sm" color="gray" className="mr-2" />
                    Deleting Asset...
                  </>
                ) : (
                  'Delete Asset'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Category Dialog */}
        <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {selectedCategory ? 'Edit Category' : 'Add New Category'}
              </DialogTitle>
              <DialogDescription>
                {selectedCategory ? 'Update category information' : 'Create a new fixed asset category'}
              </DialogDescription>
            </DialogHeader>
            <CategoryForm
              category={selectedCategory}
              isLoading={createCategoryMutation.isPending || updateCategoryMutation.isPending}
              onSave={(data: any) => {
                if (selectedCategory) {
                  updateCategoryMutation.mutate({ id: selectedCategory.id, data });
                } else {
                  createCategoryMutation.mutate(data);
                }
              }}
              onCancel={() => {
                setIsCategoryDialogOpen(false);
                setSelectedCategory(null);
                setFormErrors({});
              }}
            />
          </DialogContent>
        </Dialog>

        {/* Delete Category Confirmation Dialog */}
        <Dialog open={isDeleteCategoryDialogOpen} onOpenChange={setIsDeleteCategoryDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Category</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{categoryToDelete?.name}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Warning
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>
                      Deleting this category will affect all assets assigned to it. 
                      Make sure to reassign or delete those assets first.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleDeleteCategoryCancel}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDeleteCategoryConfirm}
                disabled={deleteCategoryMutation.isPending}
              >
                {deleteCategoryMutation.isPending ? (
                  <>
                    <MoonLoader size="sm" color="gray" className="mr-2" />
                    Deleting Category...
                  </>
                ) : (
                  'Delete Category'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Maintenance Form Dialog */}
        <Dialog open={isMaintenanceDialogOpen} onOpenChange={setIsMaintenanceDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingMaintenanceId ? 'Edit Maintenance Record' : 'Schedule Maintenance Record'}
              </DialogTitle>
              <DialogDescription>
                {editingMaintenanceId 
                  ? 'Update the maintenance record details below.'
                  : 'Create a new maintenance record for an asset. You can schedule future maintenance or record completed work.'
                }
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleMaintenanceSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Asset Selection */}
                <div className="space-y-2">
                  <Label htmlFor="assetId">Asset *</Label>
                  <Select
                    value={maintenanceFormData.assetId}
                    onValueChange={(value) => handleMaintenanceFormChange('assetId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an asset" />
                    </SelectTrigger>
                    <SelectContent>
                      {assets.map((asset: any) => (
                        <SelectItem key={asset.id} value={asset.id}>
                          {asset.name} - {asset.category?.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {maintenanceFormErrors.assetId && (
                    <p className="text-sm text-red-600">{maintenanceFormErrors.assetId}</p>
                  )}
                </div>

                {/* Maintenance Date */}
                <div className="space-y-2">
                  <Label htmlFor="maintenanceDate">Maintenance Date *</Label>
                  <Input
                    id="maintenanceDate"
                    type="date"
                    value={maintenanceFormData.maintenanceDate}
                    onChange={(e) => handleMaintenanceFormChange('maintenanceDate', e.target.value)}
                  />
                  {maintenanceFormErrors.maintenanceDate && (
                    <p className="text-sm text-red-600">{maintenanceFormErrors.maintenanceDate}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Maintenance Type */}
                <div className="space-y-2">
                  <Label htmlFor="maintenanceType">Maintenance Type *</Label>
                  <Select
                    value={maintenanceFormData.maintenanceType}
                    onValueChange={(value) => handleMaintenanceFormChange('maintenanceType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PREVENTIVE">Preventive</SelectItem>
                      <SelectItem value="CORRECTIVE">Corrective</SelectItem>
                      <SelectItem value="EMERGENCY">Emergency</SelectItem>
                      <SelectItem value="INSPECTION">Inspection</SelectItem>
                    </SelectContent>
                  </Select>
                  {maintenanceFormErrors.maintenanceType && (
                    <p className="text-sm text-red-600">{maintenanceFormErrors.maintenanceType}</p>
                  )}
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={maintenanceFormData.status}
                    onValueChange={(value) => handleMaintenanceFormChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the maintenance work to be performed..."
                  value={maintenanceFormData.description}
                  onChange={(e) => handleMaintenanceFormChange('description', e.target.value)}
                  rows={3}
                />
                {maintenanceFormErrors.description && (
                  <p className="text-sm text-red-600">{maintenanceFormErrors.description}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Performed By */}
                <div className="space-y-2">
                  <Label htmlFor="performedBy">Performed By</Label>
                  <Input
                    id="performedBy"
                    placeholder="Technician or service provider"
                    value={maintenanceFormData.performedBy}
                    onChange={(e) => handleMaintenanceFormChange('performedBy', e.target.value)}
                  />
                </div>

                {/* Cost */}
                <div className="space-y-2">
                  <Label htmlFor="cost">Cost ($)</Label>
                  <Input
                    id="cost"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={maintenanceFormData.cost}
                    onChange={(e) => handleMaintenanceFormChange('cost', parseFloat(e.target.value) || 0)}
                  />
                  {maintenanceFormErrors.cost && (
                    <p className="text-sm text-red-600">{maintenanceFormErrors.cost}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Invoice Number */}
                <div className="space-y-2">
                  <Label htmlFor="invoiceNumber">Invoice Number</Label>
                  <Input
                    id="invoiceNumber"
                    placeholder="Invoice or reference number"
                    value={maintenanceFormData.invoiceNumber}
                    onChange={(e) => handleMaintenanceFormChange('invoiceNumber', e.target.value)}
                  />
                </div>

                {/* Warranty Info */}
                <div className="space-y-2">
                  <Label htmlFor="warrantyInfo">Warranty Information</Label>
                  <Input
                    id="warrantyInfo"
                    placeholder="Warranty details or coverage"
                    value={maintenanceFormData.warrantyInfo}
                    onChange={(e) => handleMaintenanceFormChange('warrantyInfo', e.target.value)}
                  />
                </div>
              </div>

              {/* Life Extension */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="extendsUsefulLife"
                    checked={maintenanceFormData.extendsUsefulLife}
                    onCheckedChange={(checked) => handleMaintenanceFormChange('extendsUsefulLife', checked)}
                  />
                  <Label htmlFor="extendsUsefulLife" className="text-sm font-medium">
                    This maintenance extends the asset's useful life
                  </Label>
                </div>

                {maintenanceFormData.extendsUsefulLife && (
                  <div className="space-y-2">
                    <Label htmlFor="lifeExtensionMonths">Life Extension (Months)</Label>
                    <Input
                      id="lifeExtensionMonths"
                      type="number"
                      min="1"
                      placeholder="Number of months"
                      value={maintenanceFormData.lifeExtensionMonths}
                      onChange={(e) => handleMaintenanceFormChange('lifeExtensionMonths', parseInt(e.target.value) || 0)}
                    />
                    {maintenanceFormErrors.lifeExtensionMonths && (
                      <p className="text-sm text-red-600">{maintenanceFormErrors.lifeExtensionMonths}</p>
                    )}
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsMaintenanceDialogOpen(false);
                    setEditingMaintenanceId(null);
                    setMaintenanceFormData({
                      assetId: '',
                      maintenanceDate: new Date().toISOString().split('T')[0],
                      maintenanceType: 'PREVENTIVE',
                      description: '',
                      performedBy: '',
                      cost: 0,
                      extendsUsefulLife: false,
                      lifeExtensionMonths: 0,
                      invoiceNumber: '',
                      warrantyInfo: '',
                      status: 'SCHEDULED'
                    });
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createMaintenanceMutation.isPending || updateMaintenanceMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {(createMaintenanceMutation.isPending || updateMaintenanceMutation.isPending) ? (
                    <>
                      <MoonLoader size="sm" color="gray" className="mr-2" />
                      {editingMaintenanceId ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <Wrench className="h-4 w-4 mr-2" />
                      {editingMaintenanceId ? 'Update Maintenance' : 'Schedule Maintenance'}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Post Asset Confirmation Dialog */}
        <Dialog open={isPostDialogOpen} onOpenChange={setIsPostDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Post Fixed Asset</DialogTitle>
              <DialogDescription>
                Are you sure you want to post "{assetToPost?.name}"? 
                {accountConfig?.needsAutoCreation 
                  ? " This will automatically create the necessary accounting accounts and journal entries."
                  : " This will create accounting entries and cannot be undone."
                }
              </DialogDescription>
            </DialogHeader>
            
            {assetToPost && (
              <div className="space-y-4">
                {isCheckingAccounts ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <MoonLoader size="lg" color="teal" />
                      <p className="text-sm text-muted-foreground mt-3">Checking existing accounts...</p>
                    </div>
                  </div>
                ) : accountConfig ? (
                  <>
                    {/* Asset Details */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Asset Details</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Name:</span>
                          <span className="ml-2 font-medium">{assetToPost.name}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Category:</span>
                          <span className="ml-2 font-medium">{assetToPost.category?.name}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Cost:</span>
                          <span className="ml-2 font-medium">${Number(assetToPost.cost).toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Acquisition Date:</span>
                          <span className="ml-2 font-medium">{assetToPost.acquisitionDate}</span>
                        </div>
                      </div>
                    </div>

                    {/* Accounting Impact - Different content based on configuration */}
                    {accountConfig.needsAutoCreation ? (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex">
                          <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5" />
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-blue-800">
                              Automatic Account Creation
                            </h3>
                            <div className="mt-2 text-sm text-blue-700">
                              <p className="mb-2">The following accounts will be automatically created:</p>
                              <ul className="list-disc list-inside space-y-1">
                                {!accountConfig.assetAccountExists && (
                                  <li><strong>Fixed Asset Account:</strong> "{accountConfig.expectedAssetAccountName}" (FA-{assetToPost.category?.name?.toUpperCase().replace(/[^A-Z0-9]/g, '')})</li>
                                )}
                                {!accountConfig.cashAccountExists && (
                                  <li><strong>Cash Account:</strong> "{accountConfig.expectedCashAccountName}" (CASH-001)</li>
                                )}
                                {accountConfig.assetAccountExists && accountConfig.cashAccountExists && (
                                  <li>All required accounts already exist - no new accounts will be created</li>
                                )}
                              </ul>
                              <p className="mt-2 font-medium">Reference: FA-{assetToPost.id}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex">
                          <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5" />
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-blue-800">
                              Accounting Impact
                            </h3>
                            <div className="mt-2 text-sm text-blue-700">
                              <p className="mb-2">This will create the following journal entries:</p>
                              <ul className="list-disc list-inside space-y-1">
                                <li><strong>Debit:</strong> Fixed Asset Account - ${Number(assetToPost.cost).toLocaleString()}</li>
                                <li><strong>Credit:</strong> Cash Account - ${Number(assetToPost.cost).toLocaleString()}</li>
                              </ul>
                              <p className="mt-2 font-medium">Reference: FA-{assetToPost.id}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Warning */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex">
                        <AlertTriangle className="h-5 w-5 text-yellow-400" />
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-yellow-800">
                            Important Notice
                          </h3>
                          <div className="mt-2 text-sm text-yellow-700">
                            <p>
                              Once posted, this asset will be included in your depreciation calculations. 
                              The status cannot be changed back to DRAFT.
                              {accountConfig.needsAutoCreation && (
                                <span className="block mt-1 font-medium">
                                  The necessary accounting accounts will be automatically created and 
                                  linked to this asset category for future use.
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground">Unable to check account configuration</p>
                  </div>
                )}
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={handlePostCancel}>
                Cancel
              </Button>
              <Button 
                onClick={handlePostConfirm}
                disabled={postAssetMutation.isPending}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {postAssetMutation.isPending ? (
                  <>
                    <MoonLoader size="sm" color="gray" className="mr-2" />
                    Posting Asset...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {accountConfig?.needsAutoCreation 
                      ? "Post Asset & Create Accounts" 
                      : "Post Asset"
                    }
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageLayout>
  );
}