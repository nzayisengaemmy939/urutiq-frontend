import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/auth-context';
import { Buffer } from 'buffer';
import { 
  Wallet, 
  FileText, 
  Calendar, 
  DollarSign, 
  AlertCircle,
  CheckCircle,
  Clock,
  Search,
  Filter,
  Download,
  Eye,
  CreditCard,
  Edit,
  Trash2,
  Plus,
  CheckCircle2,
  XCircle,
  Users,
  TrendingUp,
  AlertTriangle,
  FileCheck,
  Receipt,
  Zap,
  Settings,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../components/ui/tabs';
import { format } from 'date-fns';
import { PageLayout } from '../components/page-layout';
import { companiesApi, purchaseApi } from '../lib/api/accounting';
import { getCompanyId } from '../lib/config';
import { toast } from 'sonner';

// Get API base URL dynamically
const getApiBaseUrl = () => {
  // In production, use the current origin
  if (typeof window !== 'undefined') {
    return window.location.origin.replace(/:\d+$/, ':4000');
  }
  // Fallback for SSR or when window is not available
  return process.env.VITE_API_URL || 'https://urutiq-backend-clean-11.onrender.com';
};

// Mock API functions - Replace with actual API calls
const fetchInvoices = async (companyId: string) => {
  // Use the token and extract tenant ID from token
  const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
  
  if (!token) {
    console.error('No token found');
    return { data: { invoices: [] } };
  }
  
  let tenantId;
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    tenantId = payload.tenantId;
  } catch (error) {
    console.error('Error parsing token:', error);
    return { data: { invoices: [] } };
  }
  
  console.log('Fetching invoices with:', { companyId, token: token ? 'present' : 'missing', tenantId });
  console.log('Full URL:', `${getApiBaseUrl()}/api/accounts-payable/invoices?companyId=${companyId}`);
  console.log('Headers being sent:', {
    'Authorization': `Bearer ${token}`,
    'x-tenant-id': tenantId,
    'x-company-id': companyId
  });
  
  const response = await fetch(`${getApiBaseUrl()}/api/accounts-payable/invoices?companyId=${companyId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'x-tenant-id': tenantId,
      'x-company-id': companyId
    }
  });
  
  console.log('Invoices response status:', response.status);
  const data = await response.json();
  console.log('Invoices response data:', data);
  console.log('Invoices data structure:', JSON.stringify(data, null, 2));
  return data;
};

const fetchBills = async (companyId: string) => {
  // Use the token and extract tenant ID from token
  const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
  
  if (!token) {
    console.error('No token found');
    return { data: { bills: [] } };
  }
  
  let tenantId;
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    tenantId = payload.tenantId;
  } catch (error) {
    console.error('Error parsing token:', error);
    return { data: { bills: [] } };
  }
  
  console.log('Fetching bills with:', { companyId, token: token ? 'present' : 'missing', tenantId });
  console.log('Bills URL:', `https://urutiq-backend-clean-11.onrender.com/api/bills?companyId=${companyId}`);
  console.log('Bills headers:', {
    'Authorization': `Bearer ${token}`,
    'x-tenant-id': tenantId,
    'x-company-id': companyId
  });
  
  const response = await fetch(`${getApiBaseUrl()}/api/bills?companyId=${companyId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'x-tenant-id': tenantId,
      'x-company-id': companyId
    }
  });
  
  console.log('Bills response status:', response.status);
  const data = await response.json();
  console.log('Bills response data:', data);
  return data;
};

// Use existing purchaseApi.getVendors instead of custom fetch

const fetchDashboard = async (companyId: string) => {
  // Use the token and extract tenant ID from token
  const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
  
  if (!token) {
    console.error('No token found');
    return { data: { summary: {} } };
  }
  
  let tenantId;
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    tenantId = payload.tenantId;
  } catch (error) {
    console.error('Error parsing token:', error);
    return { data: { summary: {} } };
  }
  
  console.log('Fetching dashboard with:', { companyId, token: token ? 'present' : 'missing', tenantId });
  
  const response = await fetch(`${getApiBaseUrl()}/api/accounts-payable/dashboard?companyId=${companyId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'x-tenant-id': tenantId,
      'x-company-id': companyId
    }
  });
  
  console.log('Dashboard response status:', response.status);
  const data = await response.json();
  console.log('Dashboard response data:', data);
  return data;
};

const fetchAgingReport = async (companyId: string) => {
  // Use the token and extract tenant ID from token
  const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
  
  if (!token) {
    console.error('No token found');
    return { data: {} };
  }
  
  let tenantId;
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    tenantId = payload.tenantId;
  } catch (error) {
    console.error('Error parsing token:', error);
    return { data: {} };
  }
  
  console.log('Fetching aging report with:', { companyId, token: token ? 'present' : 'missing', tenantId });
  
  const response = await fetch(`${getApiBaseUrl()}/api/accounts-payable/aging-report?companyId=${companyId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'x-tenant-id': tenantId,
      'x-company-id': companyId
    }
  });
  
  console.log('Aging report response status:', response.status);
  const data = await response.json();
  console.log('Aging report response data:', data);
  return data;
};

const fetchPaymentData = async (companyId: string) => {
  // Use the token and extract tenant ID from token
  const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
  
  if (!token) {
    console.error('No token found');
    return { data: { payments: [], schedules: [], bankAccounts: [], stats: {} } };
  }
  
  let tenantId;
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    tenantId = payload.tenantId;
  } catch (error) {
    console.error('Error parsing token:', error);
    return { data: { payments: [], schedules: [], bankAccounts: [], stats: {} } };
  }
  
  console.log('Fetching payment data with:', { companyId, token: token ? 'present' : 'missing', tenantId });
  
  const response = await fetch(`${getApiBaseUrl()}/api/payments/payments?companyId=${companyId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'x-tenant-id': tenantId,
      'x-company-id': companyId
    }
  });
  
  console.log('Payment data response status:', response.status);
  const data = await response.json();
  console.log('Payment data response data:', data);
  return data;
};

export default function EnhancedAccountsPayable() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const [isMatchingDialogOpen, setIsMatchingDialogOpen] = useState(false);
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});

  const queryClient = useQueryClient();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const authReady = !authLoading;

  // Fetch companies first
  const { data: companiesData, isLoading: companiesLoading, error: companiesError } = useQuery({
    queryKey: ['companies'],
    queryFn: companiesApi.getCompanies,
    enabled: authReady
  });

  // Get company ID from localStorage or use the first available company
  const firstCompanyId = localStorage.getItem('company_id') || localStorage.getItem('companyId') || (companiesData?.[0]?.id) || 'demo-company';

  // Debug company ID
  console.log('=== COMPANY ID DEBUG ===');
  console.log('Companies data:', companiesData);
  console.log('Auth ready:', authReady);
  console.log('First company ID (used for queries):', firstCompanyId);
  
  // Debug API calls
  console.log('=== API CALLS DEBUG ===');
  console.log('Invoices query enabled:', authReady && !!firstCompanyId);
  console.log('Bills query enabled:', authReady && !!firstCompanyId);
  console.log('Vendors query enabled:', authReady && !!firstCompanyId);
  console.log('Dashboard query enabled:', authReady && !!firstCompanyId);
  console.log('Aging query enabled:', authReady && !!firstCompanyId);

  // Fetch data
  const { data: invoicesData, isLoading: invoicesLoading } = useQuery({
    queryKey: ['invoices', firstCompanyId],
    queryFn: () => fetchInvoices(firstCompanyId),
    enabled: authReady && !!firstCompanyId
  });

  const { data: billsData, isLoading: billsLoading } = useQuery({
    queryKey: ['bills', firstCompanyId],
    queryFn: () => fetchBills(firstCompanyId),
    enabled: authReady && !!firstCompanyId
  });

  const { data: vendorsData, isLoading: vendorsLoading, error: vendorsError } = useQuery({
    queryKey: ['vendors', firstCompanyId],
    queryFn: async () => {
      try {
        const result = await purchaseApi.getVendors(firstCompanyId);
        console.log('Raw vendors result:', result);
        // Ensure we always return an array
        if (Array.isArray(result)) {
          return result;
        }
        // Handle different response formats
        const resultAny = result as any;
        if (resultAny?.items && Array.isArray(resultAny.items)) {
          return resultAny.items;
        }
        if (resultAny?.data && Array.isArray(resultAny.data)) {
          return resultAny.data;
        }
        return [];
      } catch (error) {
        console.error('Error fetching vendors:', error);
        // Return mock vendors for demo purposes
        return [
          { id: 'demo-vendor-1', name: 'Demo Vendor 1', email: 'vendor1@demo.com' },
          { id: 'demo-vendor-2', name: 'Demo Vendor 2', email: 'vendor2@demo.com' },
          { id: 'demo-vendor-3', name: 'Demo Vendor 3', email: 'vendor3@demo.com' }
        ];
      }
    },
    enabled: authReady && !!firstCompanyId
  });

  // Ensure vendors is always an array
  const vendors = Array.isArray(vendorsData) ? vendorsData : [];

  const { data: dashboardData } = useQuery({
    queryKey: ['ap-dashboard', firstCompanyId],
    queryFn: () => fetchDashboard(firstCompanyId),
    enabled: authReady && !!firstCompanyId
  });

  const { data: agingData } = useQuery({
    queryKey: ['ap-aging', firstCompanyId],
    queryFn: () => fetchAgingReport(firstCompanyId),
    enabled: authReady && !!firstCompanyId
  });

  const { data: paymentData } = useQuery({
    queryKey: ['payment-data', firstCompanyId],
    queryFn: () => fetchPaymentData(firstCompanyId),
    enabled: authReady && !!firstCompanyId
  });

  // Helper function to extract tenant ID from token and company ID from localStorage
  const getTokenData = () => {
    const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
    const companyId = localStorage.getItem('company_id') || localStorage.getItem('companyId');
    
    if (!token) return { tenantId: null, companyId };
    
    try {
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      return {
        tenantId: payload.tenantId,
        companyId: companyId
      };
    } catch (error) {
      console.error('Error parsing token:', error);
      return { tenantId: null, companyId };
    }
  };


  // Fetch purchase orders for invoice creation
  const { data: purchaseOrdersData, isLoading: purchaseOrdersLoading } = useQuery({
    queryKey: ['purchase-orders', firstCompanyId],
    queryFn: async () => {
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
        const { tenantId } = getTokenData();
        
        if (!tenantId || !firstCompanyId) {
          console.error('Missing tenant or company ID');
          return { items: [] };
        }
        
        console.log('Fetching purchase orders with:', { tenantId, companyId: firstCompanyId, token: token ? 'present' : 'missing' });
        
        const response = await fetch(`${getApiBaseUrl()}/api/purchase-orders?companyId=${firstCompanyId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'x-tenant-id': tenantId,
            'x-company-id': firstCompanyId
          }
        });
        
        console.log('Purchase orders response status:', response.status);
        const data = await response.json();
        console.log('Purchase orders data:', data);
        return data;
      } catch (error) {
        console.error('Error fetching purchase orders:', error);
        return { items: [] };
      }
    },
    enabled: authReady && !!firstCompanyId
  });

  const invoices = (invoicesData as any)?.data?.invoices || [];
  const bills = (billsData as any)?.data?.bills || (billsData as any)?.data?.items || (billsData as any)?.items || [];
  const dashboard = (dashboardData as any)?.data?.summary || {};
  const agingReport = (agingData as any)?.data || {};
  const payments = (paymentData as any)?.data?.payments || [];
  const paymentSchedules = (paymentData as any)?.data?.schedules || [];
  const bankAccounts = (paymentData as any)?.data?.bankAccounts || [];
  const paymentStats = (paymentData as any)?.data?.stats || {};
  const purchaseOrders = (purchaseOrdersData as any)?.items || (purchaseOrdersData as any)?.data?.items || [];

  // Form states
  const [invoiceForm, setInvoiceForm] = useState({
    vendorId: '',
    purchaseOrderId: '',
    invoiceNumber: '',
    invoiceDate: format(new Date(), 'yyyy-MM-dd'),
    dueDate: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    totalAmount: '',
    subtotal: '',
    taxAmount: '',
    currency: 'USD',
    source: 'manual',
    notes: ''
  });

  const [matchingForm, setMatchingForm] = useState({
    purchaseOrderId: '',
    goodsReceivedNoteId: '',
    matchingType: 'two_way'
  });

  const [approvalForm, setApprovalForm] = useState({
    approverId: 'current-user', // Default approver ID
    approvalLevel: 1,
    comments: '',
    status: 'approved'
  });

  const [paymentForm, setPaymentForm] = useState({
    billId: '',
    scheduledDate: format(new Date(), 'yyyy-MM-dd'),
    amount: '',
    paymentMethod: 'bank_transfer',
    bankAccountId: '',
    priority: 'normal',
    notes: ''
  });

  // Filter data
  const filteredInvoices = invoices.filter((invoice: any) => {
    const matchesSearch = !searchTerm || 
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.vendor?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredBills = bills.filter((bill: any) => {
    const matchesSearch = !searchTerm || 
      bill.billNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.vendor?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || bill.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Debug logging
  console.log('Vendors loading:', vendorsLoading);
  console.log('Vendors error:', vendorsError);
  console.log('Vendors data (raw):', vendorsData);
  console.log('Vendors (processed):', vendors);
  console.log('Is vendors array?', Array.isArray(vendors));
  
  // Debug invoices data
  console.log('Invoices loading:', invoicesLoading);
  console.log('Invoices data (raw):', invoicesData);
  console.log('Invoices data.data:', invoicesData?.data);
  console.log('Invoices data.data.invoices:', invoicesData?.data?.invoices);
  console.log('Invoices (processed):', invoices);
  console.log('Is invoices array?', Array.isArray(invoices));
  console.log('Invoices length:', invoices.length);
  
  // Debug individual invoice structure
  if (invoices.length > 0) {
    console.log('First invoice structure:', invoices[0]);
    console.log('First invoice keys:', Object.keys(invoices[0]));
  }
  
  // Debug all data
  console.log('=== ALL DATA DEBUG ===');
  console.log('Bills data:', billsData);
  console.log('Bills (processed):', bills);
  console.log('Bills length:', bills.length);
  console.log('Filtered bills length:', filteredBills.length);
  console.log('Dashboard data:', dashboardData);
  console.log('Dashboard (processed):', dashboard);
  console.log('Aging data:', agingData);
  console.log('Aging (processed):', agingReport);

  // Mutations
  const captureInvoiceMutation = useMutation({
    mutationFn: async (data: any) => {
      const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
      
      if (!token) {
        throw new Error('No token found');
      }
      
      let tenantId;
      try {
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        tenantId = payload.tenantId;
      } catch (error) {
        console.error('Error parsing token:', error);
        throw new Error('Invalid token');
      }
      
      console.log('Creating invoice with:', { tenantId, companyId: firstCompanyId, data });
      
      const response = await fetch(`${getApiBaseUrl()}/api/accounts-payable/invoices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-tenant-id': tenantId,
          'x-company-id': firstCompanyId
        },
        body: JSON.stringify(data)
      });
      
      console.log('Invoice creation response status:', response.status);
      const result = await response.json();
      console.log('Invoice creation response:', result);
      
      if (!response.ok) {
        throw new Error(result.message || `HTTP ${response.status}`);
      }
      
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Invoice captured successfully');
      setIsInvoiceDialogOpen(false);
      resetInvoiceForm(); // Clear form after successful creation
    }
  });

  const matchInvoiceMutation = useMutation({
    mutationFn: async ({ invoiceId, data }: { invoiceId: string, data: any }) => {
      const response = await fetch(`${getApiBaseUrl()}/api/accounts-payable/invoices/${invoiceId}/match`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || localStorage.getItem('auth_token')}`,
          'x-tenant-id': localStorage.getItem('tenant_id') || 'demo-tenant',
          'x-company-id': firstCompanyId
        },
        body: JSON.stringify(data)
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Invoice matched successfully');
      setIsMatchingDialogOpen(false);
    }
  });

  const updateInvoiceMutation = useMutation({
    mutationFn: async ({ invoiceId, data }: { invoiceId: string, data: any }) => {
      const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
      
      if (!token) {
        throw new Error('No token found');
      }
      
      let tenantId;
      try {
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        tenantId = payload.tenantId;
      } catch (error) {
        console.error('Error parsing token:', error);
        throw new Error('Invalid token');
      }
      
      console.log('Updating invoice with:', { tenantId, companyId: firstCompanyId, invoiceId, data });
      
      const response = await fetch(`${getApiBaseUrl()}/api/accounts-payable/invoices/${invoiceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-tenant-id': tenantId,
          'x-company-id': firstCompanyId
        },
        body: JSON.stringify(data)
      });
      
      console.log('Update response status:', response.status);
      const result = await response.json();
      console.log('Update response:', result);
      
      if (!response.ok) {
        throw new Error(result.message || `HTTP ${response.status}`);
      }
      
      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Invoice updated successfully!');
      setIsInvoiceDialogOpen(false);
      resetInvoiceForm(); // Clear form after successful update
      console.log('Update successful, data:', data);
    },
    onError: (error: any) => {
      console.error('Update failed:', error);
      toast.error('Failed to update invoice: ' + (error?.message || 'Unknown error'));
    }
  });

  const deleteInvoiceMutation = useMutation({
    mutationFn: async (invoiceId: string) => {
      const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
      
      if (!token) {
        throw new Error('No token found');
      }
      
      let tenantId;
      try {
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        tenantId = payload.tenantId;
      } catch (error) {
        console.error('Error parsing token:', error);
        throw new Error('Invalid token');
      }
      
      console.log('Deleting invoice:', { tenantId, companyId: firstCompanyId, invoiceId });
      
      const response = await fetch(`${getApiBaseUrl()}/api/accounts-payable/invoices/${invoiceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-tenant-id': tenantId,
          'x-company-id': firstCompanyId
        }
      });
      
      console.log('Delete response status:', response.status);
      const result = await response.json();
      console.log('Delete response:', result);
      
      if (!response.ok) {
        throw new Error(result.message || `HTTP ${response.status}`);
      }
      
      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Invoice deleted successfully!');
      console.log('Delete successful, data:', data);
    },
    onError: (error: any) => {
      console.error('Delete failed:', error);
      toast.error('Failed to delete invoice: ' + (error?.message || 'Unknown error'));
    }
  });

  const approveInvoiceMutation = useMutation({
    mutationFn: async ({ invoiceId, data }: { invoiceId: string, data: any }) => {
      const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
      
      if (!token) {
        throw new Error('No token found');
      }
      
      let tenantId;
      try {
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        tenantId = payload.tenantId;
      } catch (error) {
        console.error('Error parsing token:', error);
        throw new Error('Invalid token');
      }
      
      console.log('Approving invoice with:', { tenantId, companyId: firstCompanyId, invoiceId, data });
      
      const response = await fetch(`${getApiBaseUrl()}/api/accounts-payable/invoices/${invoiceId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-tenant-id': tenantId,
          'x-company-id': firstCompanyId
        },
        body: JSON.stringify(data)
      });
      
      console.log('Approval response status:', response.status);
      const result = await response.json();
      console.log('Approval response:', result);
      
      if (!response.ok) {
        throw new Error(result.message || `HTTP ${response.status}`);
      }
      
      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Invoice approved successfully! Bill created.');
      setIsApprovalDialogOpen(false);
      console.log('Approval successful, data:', data);
    },
    onError: (error: any) => {
      console.error('Approval failed:', error);
      toast.error('Failed to approve invoice: ' + (error?.message || 'Unknown error'));
    }
  });

  const processPaymentMutation = useMutation({
    mutationFn: async (paymentData: any) => {
      const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
      
      if (!token) {
        throw new Error('No token found');
      }
      
      let tenantId;
      try {
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        tenantId = payload.tenantId;
      } catch (error) {
        console.error('Error parsing token:', error);
        throw new Error('Invalid token');
      }
      
      console.log('Processing payment with:', { tenantId, companyId: firstCompanyId, paymentData });
      
      const response = await fetch(`${getApiBaseUrl()}/api/accounts-payable/payments/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-tenant-id': tenantId,
          'x-company-id': firstCompanyId
        },
        body: JSON.stringify(paymentData)
      });
      
      console.log('Payment processing response status:', response.status);
      const result = await response.json();
      console.log('Payment processing response:', result);
      
      if (!response.ok) {
        throw new Error(result.message || `HTTP ${response.status}`);
      }
      
      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Payment processed successfully! Purchase orders marked as paid.');
      setIsPaymentDialogOpen(false);
      console.log('Payment processed successfully, data:', data);
    },
    onError: (error: any) => {
      console.error('Payment processing failed:', error);
      toast.error('Failed to process payment: ' + (error?.message || 'Unknown error'));
    }
  });

  const schedulePaymentMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`${getApiBaseUrl()}/api/accounts-payable/payment-schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || localStorage.getItem('auth_token')}`,
          'x-tenant-id': localStorage.getItem('tenant_id') || 'demo-tenant',
          'x-company-id': firstCompanyId
        },
        body: JSON.stringify(data)
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      toast.success('Payment scheduled successfully');
      setIsPaymentDialogOpen(false);
    }
  });

  const populateInvoiceForm = (invoice: any) => {
    setInvoiceForm({
      vendorId: invoice.vendorId || '',
      invoiceNumber: invoice.invoiceNumber || '',
      invoiceDate: invoice.invoiceDate || '',
      dueDate: invoice.dueDate || '',
      totalAmount: invoice.totalAmount ? parseFloat(invoice.totalAmount).toFixed(2) : '',
      subtotal: invoice.subtotal ? parseFloat(invoice.subtotal).toFixed(2) : '',
      taxAmount: invoice.taxAmount ? parseFloat(invoice.taxAmount).toFixed(2) : '',
      currency: invoice.currency || 'USD',
      source: invoice.source || 'manual',
      notes: invoice.notes || '',
      purchaseOrderId: '' // Will be extracted from rawData if available
    });
  };

  const resetInvoiceForm = () => {
    setInvoiceForm({
      vendorId: '',
      invoiceNumber: '',
      invoiceDate: '',
      dueDate: '',
      totalAmount: '',
      subtotal: '',
      taxAmount: '',
      currency: 'USD',
      source: 'manual',
      notes: '',
      purchaseOrderId: ''
    });
    setSelectedInvoice(null);
    setFormErrors({}); // Clear form errors
  };

  const handleCaptureInvoice = () => {
    const errors: {[key: string]: string} = {};
    
    // Validate required fields
    if (!invoiceForm.vendorId || invoiceForm.vendorId === 'loading-vendors' || invoiceForm.vendorId === 'no-vendors') {
      errors.vendorId = 'Please select a vendor';
    }
    
    if (!invoiceForm.invoiceNumber || invoiceForm.invoiceNumber.trim() === '') {
      errors.invoiceNumber = 'Please enter an invoice number';
    }
    
    if (!invoiceForm.totalAmount || invoiceForm.totalAmount.trim() === '' || parseFloat(invoiceForm.totalAmount) <= 0) {
      errors.totalAmount = 'Please enter a valid total amount';
    }
    
    if (!invoiceForm.invoiceDate) {
      errors.invoiceDate = 'Please select an invoice date';
    }
    
    // Validate purchase order if selected
    if (invoiceForm.purchaseOrderId && (invoiceForm.purchaseOrderId === 'loading' || invoiceForm.purchaseOrderId === 'no-pos')) {
      errors.purchaseOrderId = 'Please select a valid purchase order';
    }
    
    // Set errors and return if any validation fails
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }
    
    // Transform the form data to match the backend schema
    const invoiceData = {
      vendorId: invoiceForm.vendorId,
      invoiceNumber: invoiceForm.invoiceNumber.trim(),
      invoiceDate: invoiceForm.invoiceDate,
      dueDate: invoiceForm.dueDate || null,
      totalAmount: parseFloat(invoiceForm.totalAmount) || 0,
      subtotal: parseFloat(invoiceForm.subtotal) || parseFloat(invoiceForm.totalAmount) || 0,
      taxAmount: parseFloat(invoiceForm.taxAmount) || 0,
      currency: invoiceForm.currency,
      source: invoiceForm.source,
      notes: invoiceForm.notes?.trim() || null,
      // Include purchase order reference if available
      ...(invoiceForm.purchaseOrderId && invoiceForm.purchaseOrderId !== 'loading' && invoiceForm.purchaseOrderId !== 'no-pos' && { purchaseOrderId: invoiceForm.purchaseOrderId })
    };
    
    // Check if we're editing an existing invoice
    if (selectedInvoice && selectedInvoice.id) {
      // Update existing invoice
      updateInvoiceMutation.mutate({ invoiceId: selectedInvoice.id, data: invoiceData });
    } else {
      // Create new invoice
      captureInvoiceMutation.mutate(invoiceData);
    }
  };

  const handleMatchInvoice = () => {
    if (selectedInvoice) {
      matchInvoiceMutation.mutate({ invoiceId: selectedInvoice.id, data: matchingForm });
    }
  };

  const handleApproveInvoice = () => {
    if (selectedInvoice) {
      approveInvoiceMutation.mutate({ invoiceId: selectedInvoice.id, data: approvalForm });
    }
  };

  const handleSchedulePayment = () => {
    schedulePaymentMutation.mutate(paymentForm);
  };

  const handleProcessPayment = () => {
    console.log('Payment form state:', paymentForm);
    
    // Validate payment form
    if (!paymentForm.billId) {
      toast.error('No bill selected for payment');
      return;
    }
    
    if (!paymentForm.amount || parseFloat(paymentForm.amount) <= 0) {
      toast.error('Please enter a valid payment amount');
      return;
    }
    
    if (!paymentForm.paymentMethod) {
      toast.error('Please select a payment method');
      return;
    }
    
    // Process payment immediately
    const paymentData = {
      billId: paymentForm.billId,
      amount: parseFloat(paymentForm.amount).toString(),
      paymentMethod: paymentForm.paymentMethod,
      notes: paymentForm.notes || null
    };
    
    console.log('Sending payment data:', paymentData);
    processPaymentMutation.mutate(paymentData);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'captured': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'matched': return 'bg-green-100 text-green-800';
      case 'approved': return 'bg-emerald-100 text-emerald-800';
      case 'paid': return 'bg-gray-100 text-gray-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'normal': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!authReady) {
    return <div>Loading...</div>;
  }

  return (
    <PageLayout
      title="UrutiIQ Accounts Payable"
      description="Comprehensive invoice processing, matching, approval, and payment management"
    >
      <style>{`
        .sonner-toaster {
          z-index: 9999 !important;
        }
        .sonner-toast {
          z-index: 9999 !important;
        }
      `}</style>
      <div className="space-y-6">
        {/* Dashboard Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboard.totalInvoices || 0}</div>
              <p className="text-xs text-muted-foreground">
                {dashboard.pendingInvoices || 0} pending capture
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Outstanding Bills</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${dashboard.totalOutstanding?.toLocaleString() || '0'}</div>
              <p className="text-xs text-muted-foreground">
                {dashboard.overdueBills || 0} overdue
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vendors</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboard.totalVendors || 0}</div>
              <p className="text-xs text-muted-foreground">
                Active suppliers
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Processing Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboard.totalInvoices > 0 
                  ? Math.round((dashboard.approvedInvoices / dashboard.totalInvoices) * 100)
                  : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                Invoices approved
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="invoices">Invoice Capture</TabsTrigger>
            <TabsTrigger value="payments">Payment Management</TabsTrigger>
            <TabsTrigger value="reports">Reports & Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Bills */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Bills</CardTitle>
                  <CardDescription>Latest bills ({bills.length} total)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {bills.slice(0, 5).map((bill: any) => (
                      <div key={bill.id} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <p className="font-medium">{bill.billNumber}</p>
                          <p className="text-sm text-muted-foreground">{bill.vendor?.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${Number(bill.totalAmount).toLocaleString()}</p>
                          <Badge className={getStatusColor(bill.status)}>
                            {bill.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Aging Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>AP Aging Summary</CardTitle>
                  <CardDescription>Outstanding amounts by age</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {agingReport.agingSummary && Object.entries(agingReport.agingSummary).map(([bucket, data]: [string, any]) => (
                      <div key={bucket} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <p className="font-medium capitalize">{bucket.replace('_', ' ')}</p>
                          <p className="text-sm text-muted-foreground">{data.count} bills</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${data.totalAmount?.toLocaleString() || '0'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Invoice Capture Tab */}
          <TabsContent value="invoices" className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex space-x-2">
                <Input
                  placeholder="Search invoices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="captured">Captured</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="matched">Matched</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={() => {
                resetInvoiceForm(); // Clear form when creating new invoice
                setIsInvoiceDialogOpen(true);
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Capture Invoice
              </Button>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>PO Reference</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoicesLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        Loading invoices...
                      </TableCell>
                    </TableRow>
                  ) : filteredInvoices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        {invoices.length === 0 ? 'No invoices found. Click "Capture Invoice" to add one.' : 'No invoices match your filters.'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredInvoices.map((invoice: any) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                        <TableCell>{invoice.vendor?.name}</TableCell>
                        <TableCell>{format(new Date(invoice.invoiceDate), 'MMM dd, yyyy')}</TableCell>
                        <TableCell>${Number(invoice.totalAmount).toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(invoice.status)}>
                            {invoice.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {invoice.rawData && JSON.parse(invoice.rawData || '{}').purchaseOrderId ? (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              PO-{JSON.parse(invoice.rawData).purchaseOrderId}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">No PO</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{invoice.source}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            {/* Show different actions based on invoice status */}
                            {invoice.status === 'captured' && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedInvoice(invoice);
                                    populateInvoiceForm(invoice);
                                    setIsInvoiceDialogOpen(true);
                                  }}
                                  title="Edit Invoice"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    if (confirm(`Are you sure you want to delete invoice ${invoice.invoiceNumber}? This action cannot be undone.`)) {
                                      deleteInvoiceMutation.mutate(invoice.id);
                                    }
                                  }}
                                  disabled={deleteInvoiceMutation.isPending}
                                  title="Delete Invoice"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            {/* Only show Match button if no purchase order is already selected */}
                            {!invoice.rawData || !JSON.parse(invoice.rawData || '{}').purchaseOrderId ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedInvoice(invoice);
                                  setIsMatchingDialogOpen(true);
                                }}
                                title="Match Invoice"
                              >
                                <FileCheck className="h-4 w-4" />
                              </Button>
                            ) : (
                              <div className="flex items-center space-x-1 text-green-600" title="Already matched with Purchase Order">
                                <FileCheck className="h-4 w-4" />
                                <span className="text-xs">Matched</span>
                              </div>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedInvoice(invoice);
                                setIsApprovalDialogOpen(true);
                              }}
                              title="Approve Invoice"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Payment Management Tab */}
          <TabsContent value="payments" className="space-y-4">
            {/* Payment Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${paymentStats.totalPaid?.toLocaleString() || '0'}</div>
                  <p className="text-xs text-muted-foreground">
                    {paymentStats.totalPayments || 0} payments made
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${paymentStats.totalScheduled?.toLocaleString() || '0'}</div>
                  <p className="text-xs text-muted-foreground">
                    Upcoming payments
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Bank Balance</CardTitle>
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${paymentStats.totalBankBalance?.toLocaleString() || '0'}</div>
                  <p className="text-xs text-muted-foreground">
                    {paymentStats.bankAccounts || 0} accounts
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Recent Payments</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{payments.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Payment records
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex space-x-2">
                <Input
                  placeholder="Search bills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="posted">Posted</SelectItem>
                    <SelectItem value="partially_paid">Partially Paid</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={() => setIsPaymentDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Schedule Payment
              </Button>
            </div>

            {/* Bills Table */}
            <Card>
              <CardHeader>
                <CardTitle>All Bills ({bills.length} total)</CardTitle>
                <CardDescription>Showing {filteredBills.length} bills after filtering</CardDescription>
              </CardHeader>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bill #</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Balance Due</TableHead>
                    <TableHead>PO Reference</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {billsLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        Loading bills...
                      </TableCell>
                    </TableRow>
                  ) : filteredBills.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        {bills.length === 0 ? 'No bills found.' : 'No bills match your filters.'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredBills.map((bill: any) => (
                      <TableRow key={bill.id}>
                        <TableCell className="font-medium">{bill.billNumber}</TableCell>
                        <TableCell>{bill.vendor?.name}</TableCell>
                        <TableCell>
                          {bill.dueDate ? format(new Date(bill.dueDate), 'MMM dd, yyyy') : 'N/A'}
                        </TableCell>
                        <TableCell>${Number(bill.totalAmount).toLocaleString()}</TableCell>
                        <TableCell>${Number(bill.balanceDue).toLocaleString()}</TableCell>
                        <TableCell>
                          {bill.invoiceCapture?.rawData && JSON.parse(bill.invoiceCapture.rawData || '{}').purchaseOrderId ? (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                              PO-{JSON.parse(bill.invoiceCapture.rawData).purchaseOrderId}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">No PO</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(bill.status)}>
                            {bill.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => {
                                setPaymentForm({
                                  ...paymentForm,
                                  billId: bill.id,
                                  amount: Number(bill.balanceDue).toString(),
                                  paymentMethod: 'bank_transfer',
                                  scheduledDate: new Date().toISOString().split('T')[0]
                                });
                                setIsPaymentDialogOpen(true);
                              }}
                              disabled={bill.status === 'paid' || bill.balanceDue <= 0}
                              title={bill.status === 'paid' ? 'Already paid' : 'Pay now'}
                            >
                              <CreditCard className="h-4 w-4 mr-1" />
                              Pay Now
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setPaymentForm({
                                  ...paymentForm,
                                  billId: bill.id,
                                  amount: bill.balanceDue.toString()
                                });
                                setIsPaymentDialogOpen(true);
                              }}
                              title="Schedule payment"
                            >
                              <Calendar className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>

            {/* Recent Payments */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Payments</CardTitle>
                <CardDescription>Latest payment transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {payments.slice(0, 5).map((payment: any) => (
                    <div key={payment.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="font-medium">{payment.bill?.billNumber}</p>
                        <p className="text-sm text-muted-foreground">{payment.bill?.vendor?.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${Number(payment.amount).toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(payment.paymentDate), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </div>
                  ))}
                  {payments.length === 0 && (
                    <div className="text-center py-4 text-muted-foreground">
                      No payments found
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Payments */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Payments</CardTitle>
                <CardDescription>Scheduled payment transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {paymentSchedules.slice(0, 5).map((schedule: any) => (
                    <div key={schedule.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="font-medium">{schedule.bill?.billNumber}</p>
                        <p className="text-sm text-muted-foreground">{schedule.bill?.vendor?.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${Number(schedule.amount).toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(schedule.scheduledDate), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </div>
                  ))}
                  {paymentSchedules.length === 0 && (
                    <div className="text-center py-4 text-muted-foreground">
                      No scheduled payments
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>AP Aging Report</CardTitle>
                  <CardDescription>Outstanding amounts by aging buckets</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {agingReport.agingSummary && Object.entries(agingReport.agingSummary).map(([bucket, data]: [string, any]) => (
                      <div key={bucket} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium capitalize">{bucket.replace('_', ' ')}</p>
                          <p className="text-sm text-muted-foreground">{data.count} bills</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold">${data.totalAmount?.toLocaleString() || '0'}</p>
                        </div>
                      </div>
                    ))}
                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between">
                        <p className="font-bold">Total Outstanding</p>
                        <p className="text-xl font-bold">${agingReport.totalOutstanding?.toLocaleString() || '0'}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Processing Statistics</CardTitle>
                  <CardDescription>Invoice processing metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Total Invoices</span>
                      <span className="font-bold">{dashboard.totalInvoices || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Pending Processing</span>
                      <span className="font-bold">{dashboard.pendingInvoices || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Matched</span>
                      <span className="font-bold">{dashboard.matchedInvoices || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Approved</span>
                      <span className="font-bold">{dashboard.approvedInvoices || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Processing Rate</span>
                      <span className="font-bold">
                        {dashboard.totalInvoices > 0 
                          ? Math.round((dashboard.approvedInvoices / dashboard.totalInvoices) * 100)
                          : 0}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Dialogs */}
        {/* Invoice Capture Dialog */}
        <Dialog open={isInvoiceDialogOpen} onOpenChange={(open) => {
          setIsInvoiceDialogOpen(open);
          if (!open) {
            resetInvoiceForm(); // Clear form when dialog is closed
          }
        }}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedInvoice ? 'Edit Invoice' : 'Capture New Invoice'}</DialogTitle>
              <DialogDescription>
                {selectedInvoice ? 'Update invoice details' : 'Create an invoice for a purchase order to process payment'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Purchase Order</label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // TODO: Open create purchase order dialog
                      toast.info('Create purchase order functionality coming soon!');
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Create PO
                  </Button>
                </div>
                <Select value={invoiceForm.purchaseOrderId} onValueChange={(value) => {
                  const selectedPO = purchaseOrders.find((po: any) => po.id === value);
                  // Format the total amount to avoid floating-point precision issues
                  const formattedAmount = selectedPO?.totalAmount 
                    ? parseFloat(selectedPO.totalAmount).toFixed(2)
                    : invoiceForm.totalAmount;
                  
                  setInvoiceForm({
                    ...invoiceForm, 
                    purchaseOrderId: value,
                    vendorId: selectedPO?.vendorId || invoiceForm.vendorId,
                    totalAmount: formattedAmount
                  });
                  
                  if (formErrors.purchaseOrderId) {
                    setFormErrors({...formErrors, purchaseOrderId: ''});
                  }
                }}>
                  <SelectTrigger className={formErrors.purchaseOrderId ? 'border-red-500' : ''}>
                    <SelectValue placeholder={purchaseOrdersLoading ? "Loading purchase orders..." : "Select purchase order"}>
                      {invoiceForm.purchaseOrderId ? 
                        purchaseOrders.find((po: any) => po.id === invoiceForm.purchaseOrderId)?.poNumber || "Select purchase order"
                        : "Select purchase order"
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {purchaseOrdersLoading ? (
                      <SelectItem value="loading" disabled>Loading purchase orders...</SelectItem>
                    ) : !Array.isArray(purchaseOrders) || purchaseOrders.length === 0 ? (
                      <SelectItem value="no-pos" disabled>No purchase orders found - Create one first</SelectItem>
                    ) : (
                      purchaseOrders
                        .filter((po: any) => ['approved', 'delivered'].includes(po.status))
                        .map((po: any) => (
                          <SelectItem key={po.id} value={po.id}>
                            {po.poNumber} - {po.vendor?.name} (${parseFloat(po.totalAmount).toFixed(2)}) - {po.status}
                          </SelectItem>
                        ))
                    )}
                  </SelectContent>
                </Select>
                {formErrors.purchaseOrderId && (
                  <p className="text-xs text-red-500 mt-1">{formErrors.purchaseOrderId}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Select a purchase order to automatically populate vendor and amount
                </p>
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Vendor</label>
                  {(!Array.isArray(vendors) || vendors.length === 0) && !vendorsLoading && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // TODO: Open create vendor dialog
                        toast.info('Create vendor functionality coming soon!');
                      }}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Create Vendor
                    </Button>
                  )}
                </div>
                <Select value={invoiceForm.vendorId} onValueChange={(value) => {
                  setInvoiceForm({...invoiceForm, vendorId: value});
                  if (formErrors.vendorId) {
                    setFormErrors({...formErrors, vendorId: ''});
                  }
                }}>
                  <SelectTrigger className={formErrors.vendorId ? 'border-red-500' : ''}>
                    <SelectValue placeholder={vendorsLoading ? "Loading vendors..." : "Select vendor"} />
                  </SelectTrigger>
                  <SelectContent>
                    {vendorsLoading ? (
                      <SelectItem value="loading-vendors" disabled>Loading vendors...</SelectItem>
                    ) : !Array.isArray(vendors) || vendors.length === 0 ? (
                      <SelectItem value="no-vendors" disabled>No vendors found - Create one first</SelectItem>
                    ) : (
                      vendors.map((vendor: any) => (
                        <SelectItem key={vendor.id} value={vendor.id}>
                          {vendor.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {formErrors.vendorId && (
                  <p className="text-xs text-red-500 mt-1">{formErrors.vendorId}</p>
                )}
                {vendorsError && (
                  <p className="text-sm text-red-500 mt-1">Error loading vendors: {vendorsError.message}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">Invoice Number</label>
                <Input
                  value={invoiceForm.invoiceNumber}
                  onChange={(e) => {
                    setInvoiceForm({...invoiceForm, invoiceNumber: e.target.value});
                    if (formErrors.invoiceNumber) {
                      setFormErrors({...formErrors, invoiceNumber: ''});
                    }
                  }}
                  placeholder="Enter invoice number"
                  className={formErrors.invoiceNumber ? 'border-red-500' : ''}
                />
                {formErrors.invoiceNumber && (
                  <p className="text-xs text-red-500 mt-1">{formErrors.invoiceNumber}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">Invoice Date</label>
                <Input
                  type="date"
                  value={invoiceForm.invoiceDate}
                  onChange={(e) => {
                    setInvoiceForm({...invoiceForm, invoiceDate: e.target.value});
                    if (formErrors.invoiceDate) {
                      setFormErrors({...formErrors, invoiceDate: ''});
                    }
                  }}
                  className={formErrors.invoiceDate ? 'border-red-500' : ''}
                />
                {formErrors.invoiceDate && (
                  <p className="text-xs text-red-500 mt-1">{formErrors.invoiceDate}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">Due Date</label>
                <Input
                  type="date"
                  value={invoiceForm.dueDate}
                  onChange={(e) => setInvoiceForm({...invoiceForm, dueDate: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Total Amount</label>
                <Input
                  type="number"
                  value={invoiceForm.totalAmount}
                  onChange={(e) => {
                    // Format the input value to avoid floating-point issues
                    const value = e.target.value;
                    const formattedValue = value ? parseFloat(value).toFixed(2) : '';
                    setInvoiceForm({...invoiceForm, totalAmount: formattedValue});
                    if (formErrors.totalAmount) {
                      setFormErrors({...formErrors, totalAmount: ''});
                    }
                  }}
                  placeholder="0.00"
                  className={`text-right font-mono ${formErrors.totalAmount ? 'border-red-500' : ''}`}
                  step="0.01"
                  min="0"
                />
                {formErrors.totalAmount && (
                  <p className="text-xs text-red-500 mt-1">{formErrors.totalAmount}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">Currency</label>
                <Select value={invoiceForm.currency} onValueChange={(value) => setInvoiceForm({...invoiceForm, currency: value})}>
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
                <label className="text-sm font-medium">Source</label>
                <Select value={invoiceForm.source} onValueChange={(value) => setInvoiceForm({...invoiceForm, source: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual Entry</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="api">API</SelectItem>
                    <SelectItem value="ocr">OCR Scan</SelectItem>
                    <SelectItem value="upload">File Upload</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium">Notes</label>
                <Input
                  value={invoiceForm.notes}
                  onChange={(e) => setInvoiceForm({...invoiceForm, notes: e.target.value})}
                  placeholder="Additional notes"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsInvoiceDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCaptureInvoice} 
                disabled={captureInvoiceMutation.isPending || updateInvoiceMutation.isPending}
              >
                {captureInvoiceMutation.isPending || updateInvoiceMutation.isPending 
                  ? (selectedInvoice ? 'Updating...' : 'Capturing...') 
                  : (selectedInvoice ? 'Update Invoice' : 'Capture Invoice')
                }
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Invoice Matching Dialog */}
        <Dialog open={isMatchingDialogOpen} onOpenChange={setIsMatchingDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Match Invoice</DialogTitle>
              <DialogDescription>
                Match invoice with purchase order and goods received note
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Matching Type</label>
                <Select value={matchingForm.matchingType} onValueChange={(value) => setMatchingForm({...matchingForm, matchingType: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="two_way">Two-way (Invoice + PO)</SelectItem>
                    <SelectItem value="three_way">Three-way (Invoice + PO + GRN)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Purchase Order</label>
                <Select value={matchingForm.purchaseOrderId} onValueChange={(value) => setMatchingForm({...matchingForm, purchaseOrderId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select PO" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Add PO options here */}
                  </SelectContent>
                </Select>
              </div>
              {matchingForm.matchingType === 'three_way' && (
                <div>
                  <label className="text-sm font-medium">Goods Received Note</label>
                  <Select value={matchingForm.goodsReceivedNoteId} onValueChange={(value) => setMatchingForm({...matchingForm, goodsReceivedNoteId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select GRN" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* Add GRN options here */}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsMatchingDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleMatchInvoice} disabled={matchInvoiceMutation.isPending}>
                {matchInvoiceMutation.isPending ? 'Matching...' : 'Match Invoice'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Invoice Approval Dialog */}
        <Dialog open={isApprovalDialogOpen} onOpenChange={setIsApprovalDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Approve Invoice</DialogTitle>
              <DialogDescription>
                Review and approve or reject the invoice
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Approver ID</label>
                <Input
                  value={approvalForm.approverId}
                  onChange={(e) => setApprovalForm({...approvalForm, approverId: e.target.value})}
                  placeholder="Enter approver ID"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Approval Level</label>
                <Select value={approvalForm.approvalLevel.toString()} onValueChange={(value) => setApprovalForm({...approvalForm, approvalLevel: parseInt(value)})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Level 1</SelectItem>
                    <SelectItem value="2">Level 2</SelectItem>
                    <SelectItem value="3">Level 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Decision</label>
                <Select value={approvalForm.status} onValueChange={(value) => setApprovalForm({...approvalForm, status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="approved">Approve</SelectItem>
                    <SelectItem value="rejected">Reject</SelectItem>
                    <SelectItem value="delegated">Delegate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Comments</label>
                <Input
                  value={approvalForm.comments}
                  onChange={(e) => setApprovalForm({...approvalForm, comments: e.target.value})}
                  placeholder="Approval comments"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsApprovalDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleApproveInvoice} disabled={approveInvoiceMutation.isPending}>
                {approveInvoiceMutation.isPending ? 'Processing...' : 'Submit Decision'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Payment Schedule Dialog */}
        <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule Payment</DialogTitle>
              <DialogDescription>
                Schedule a payment for the selected bill
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Scheduled Date</label>
                <Input
                  type="date"
                  value={paymentForm.scheduledDate}
                  onChange={(e) => setPaymentForm({...paymentForm, scheduledDate: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Amount</label>
                <Input
                  type="number"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Payment Method</label>
                <Select value={paymentForm.paymentMethod} onValueChange={(value) => setPaymentForm({...paymentForm, paymentMethod: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="check">Check</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="credit_card">Credit Card</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Priority</label>
                <Select value={paymentForm.priority} onValueChange={(value) => setPaymentForm({...paymentForm, priority: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Notes</label>
                <Input
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({...paymentForm, notes: e.target.value})}
                  placeholder="Payment notes"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                variant="default" 
                onClick={handleProcessPayment} 
                disabled={processPaymentMutation.isPending || schedulePaymentMutation.isPending}
              >
                {processPaymentMutation.isPending ? 'Processing...' : 'Pay Now'}
              </Button>
              <Button 
                variant="outline" 
                onClick={handleSchedulePayment} 
                disabled={schedulePaymentMutation.isPending || processPaymentMutation.isPending}
              >
                {schedulePaymentMutation.isPending ? 'Scheduling...' : 'Schedule Payment'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageLayout>
  );
}
