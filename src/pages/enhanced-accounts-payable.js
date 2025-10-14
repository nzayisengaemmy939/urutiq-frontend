import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/auth-context';
import { Buffer } from 'buffer';
import { Wallet, FileText, Calendar, DollarSign, CheckCircle, CreditCard, Edit, Trash2, Plus, Users, TrendingUp, FileCheck } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from '../components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, } from '../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger, } from '../components/ui/tabs';
import { format } from 'date-fns';
import { PageLayout } from '../components/page-layout';
import { companiesApi, purchaseApi } from '../lib/api/accounting';
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
const fetchInvoices = async (companyId) => {
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
    }
    catch (error) {
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
const fetchBills = async (companyId) => {
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
    }
    catch (error) {
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
const fetchDashboard = async (companyId) => {
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
    }
    catch (error) {
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
const fetchAgingReport = async (companyId) => {
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
    }
    catch (error) {
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
const fetchPaymentData = async (companyId) => {
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
    }
    catch (error) {
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
    const [statusFilter, setStatusFilter] = useState('all');
    const [activeTab, setActiveTab] = useState('overview');
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
    const [isMatchingDialogOpen, setIsMatchingDialogOpen] = useState(false);
    const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);
    const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
    const [formErrors, setFormErrors] = useState({});
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
                const resultAny = result;
                if (resultAny?.items && Array.isArray(resultAny.items)) {
                    return resultAny.items;
                }
                if (resultAny?.data && Array.isArray(resultAny.data)) {
                    return resultAny.data;
                }
                return [];
            }
            catch (error) {
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
        if (!token)
            return { tenantId: null, companyId };
        try {
            const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
            return {
                tenantId: payload.tenantId,
                companyId: companyId
            };
        }
        catch (error) {
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
            }
            catch (error) {
                console.error('Error fetching purchase orders:', error);
                return { items: [] };
            }
        },
        enabled: authReady && !!firstCompanyId
    });
    const invoices = invoicesData?.data?.invoices || [];
    const bills = billsData?.data?.bills || billsData?.data?.items || billsData?.items || [];
    const dashboard = dashboardData?.data?.summary || {};
    const agingReport = agingData?.data || {};
    const payments = paymentData?.data?.payments || [];
    const paymentSchedules = paymentData?.data?.schedules || [];
    const bankAccounts = paymentData?.data?.bankAccounts || [];
    const paymentStats = paymentData?.data?.stats || {};
    const purchaseOrders = purchaseOrdersData?.items || purchaseOrdersData?.data?.items || [];
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
    const filteredInvoices = invoices.filter((invoice) => {
        const matchesSearch = !searchTerm ||
            invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            invoice.vendor?.name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
        return matchesSearch && matchesStatus;
    });
    const filteredBills = bills.filter((bill) => {
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
        mutationFn: async (data) => {
            const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
            if (!token) {
                throw new Error('No token found');
            }
            let tenantId;
            try {
                const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
                tenantId = payload.tenantId;
            }
            catch (error) {
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
        mutationFn: async ({ invoiceId, data }) => {
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
        mutationFn: async ({ invoiceId, data }) => {
            const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
            if (!token) {
                throw new Error('No token found');
            }
            let tenantId;
            try {
                const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
                tenantId = payload.tenantId;
            }
            catch (error) {
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
        onError: (error) => {
            console.error('Update failed:', error);
            toast.error('Failed to update invoice: ' + (error?.message || 'Unknown error'));
        }
    });
    const deleteInvoiceMutation = useMutation({
        mutationFn: async (invoiceId) => {
            const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
            if (!token) {
                throw new Error('No token found');
            }
            let tenantId;
            try {
                const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
                tenantId = payload.tenantId;
            }
            catch (error) {
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
        onError: (error) => {
            console.error('Delete failed:', error);
            toast.error('Failed to delete invoice: ' + (error?.message || 'Unknown error'));
        }
    });
    const approveInvoiceMutation = useMutation({
        mutationFn: async ({ invoiceId, data }) => {
            const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
            if (!token) {
                throw new Error('No token found');
            }
            let tenantId;
            try {
                const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
                tenantId = payload.tenantId;
            }
            catch (error) {
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
        onError: (error) => {
            console.error('Approval failed:', error);
            toast.error('Failed to approve invoice: ' + (error?.message || 'Unknown error'));
        }
    });
    const processPaymentMutation = useMutation({
        mutationFn: async (paymentData) => {
            const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
            if (!token) {
                throw new Error('No token found');
            }
            let tenantId;
            try {
                const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
                tenantId = payload.tenantId;
            }
            catch (error) {
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
        onError: (error) => {
            console.error('Payment processing failed:', error);
            toast.error('Failed to process payment: ' + (error?.message || 'Unknown error'));
        }
    });
    const schedulePaymentMutation = useMutation({
        mutationFn: async (data) => {
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
    const populateInvoiceForm = (invoice) => {
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
        const errors = {};
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
        }
        else {
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
    const getStatusColor = (status) => {
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
    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'urgent': return 'bg-red-100 text-red-800';
            case 'high': return 'bg-orange-100 text-orange-800';
            case 'normal': return 'bg-blue-100 text-blue-800';
            case 'low': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    if (!authReady) {
        return _jsx("div", { children: "Loading..." });
    }
    return (_jsxs(PageLayout, { title: "UrutiIQ Accounts Payable", description: "Comprehensive invoice processing, matching, approval, and payment management", children: [_jsx("style", { children: `
        .sonner-toaster {
          z-index: 9999 !important;
        }
        .sonner-toast {
          z-index: 9999 !important;
        }
      ` }), _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Total Invoices" }), _jsx(FileText, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: dashboard.totalInvoices || 0 }), _jsxs("p", { className: "text-xs text-muted-foreground", children: [dashboard.pendingInvoices || 0, " pending capture"] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Outstanding Bills" }), _jsx(DollarSign, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: "text-2xl font-bold", children: ["$", dashboard.totalOutstanding?.toLocaleString() || '0'] }), _jsxs("p", { className: "text-xs text-muted-foreground", children: [dashboard.overdueBills || 0, " overdue"] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Vendors" }), _jsx(Users, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: dashboard.totalVendors || 0 }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Active suppliers" })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Processing Rate" }), _jsx(TrendingUp, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: "text-2xl font-bold", children: [dashboard.totalInvoices > 0
                                                        ? Math.round((dashboard.approvedInvoices / dashboard.totalInvoices) * 100)
                                                        : 0, "%"] }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Invoices approved" })] })] })] }), _jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, className: "space-y-4", children: [_jsxs(TabsList, { children: [_jsx(TabsTrigger, { value: "overview", children: "Overview" }), _jsx(TabsTrigger, { value: "invoices", children: "Invoice Capture" }), _jsx(TabsTrigger, { value: "payments", children: "Payment Management" }), _jsx(TabsTrigger, { value: "reports", children: "Reports & Analytics" })] }), _jsx(TabsContent, { value: "overview", className: "space-y-4", children: _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Recent Bills" }), _jsxs(CardDescription, { children: ["Latest bills (", bills.length, " total)"] })] }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-2", children: bills.slice(0, 5).map((bill) => (_jsxs("div", { className: "flex items-center justify-between p-2 border rounded", children: [_jsxs("div", { children: [_jsx("p", { className: "font-medium", children: bill.billNumber }), _jsx("p", { className: "text-sm text-muted-foreground", children: bill.vendor?.name })] }), _jsxs("div", { className: "text-right", children: [_jsxs("p", { className: "font-medium", children: ["$", Number(bill.totalAmount).toLocaleString()] }), _jsx(Badge, { className: getStatusColor(bill.status), children: bill.status })] })] }, bill.id))) }) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "AP Aging Summary" }), _jsx(CardDescription, { children: "Outstanding amounts by age" })] }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-2", children: agingReport.agingSummary && Object.entries(agingReport.agingSummary).map(([bucket, data]) => (_jsxs("div", { className: "flex items-center justify-between p-2 border rounded", children: [_jsxs("div", { children: [_jsx("p", { className: "font-medium capitalize", children: bucket.replace('_', ' ') }), _jsxs("p", { className: "text-sm text-muted-foreground", children: [data.count, " bills"] })] }), _jsx("div", { className: "text-right", children: _jsxs("p", { className: "font-medium", children: ["$", data.totalAmount?.toLocaleString() || '0'] }) })] }, bucket))) }) })] })] }) }), _jsxs(TabsContent, { value: "invoices", className: "space-y-4", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { className: "flex space-x-2", children: [_jsx(Input, { placeholder: "Search invoices...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "w-64" }), _jsxs(Select, { value: statusFilter, onValueChange: setStatusFilter, children: [_jsx(SelectTrigger, { className: "w-32", children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All Status" }), _jsx(SelectItem, { value: "captured", children: "Captured" }), _jsx(SelectItem, { value: "processing", children: "Processing" }), _jsx(SelectItem, { value: "matched", children: "Matched" }), _jsx(SelectItem, { value: "approved", children: "Approved" }), _jsx(SelectItem, { value: "paid", children: "Paid" })] })] })] }), _jsxs(Button, { onClick: () => {
                                                    resetInvoiceForm(); // Clear form when creating new invoice
                                                    setIsInvoiceDialogOpen(true);
                                                }, children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "Capture Invoice"] })] }), _jsx(Card, { children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { children: "Invoice #" }), _jsx(TableHead, { children: "Vendor" }), _jsx(TableHead, { children: "Date" }), _jsx(TableHead, { children: "Amount" }), _jsx(TableHead, { children: "Status" }), _jsx(TableHead, { children: "PO Reference" }), _jsx(TableHead, { children: "Source" }), _jsx(TableHead, { children: "Actions" })] }) }), _jsx(TableBody, { children: invoicesLoading ? (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 7, className: "text-center py-8", children: "Loading invoices..." }) })) : filteredInvoices.length === 0 ? (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 7, className: "text-center py-8", children: invoices.length === 0 ? 'No invoices found. Click "Capture Invoice" to add one.' : 'No invoices match your filters.' }) })) : (filteredInvoices.map((invoice) => (_jsxs(TableRow, { children: [_jsx(TableCell, { className: "font-medium", children: invoice.invoiceNumber }), _jsx(TableCell, { children: invoice.vendor?.name }), _jsx(TableCell, { children: format(new Date(invoice.invoiceDate), 'MMM dd, yyyy') }), _jsxs(TableCell, { children: ["$", Number(invoice.totalAmount).toLocaleString()] }), _jsx(TableCell, { children: _jsx(Badge, { className: getStatusColor(invoice.status), children: invoice.status }) }), _jsx(TableCell, { children: invoice.rawData && JSON.parse(invoice.rawData || '{}').purchaseOrderId ? (_jsxs(Badge, { variant: "secondary", className: "bg-green-100 text-green-800", children: ["PO-", JSON.parse(invoice.rawData).purchaseOrderId] })) : (_jsx("span", { className: "text-muted-foreground text-sm", children: "No PO" })) }), _jsx(TableCell, { children: _jsx(Badge, { variant: "outline", children: invoice.source }) }), _jsx(TableCell, { children: _jsxs("div", { className: "flex space-x-2", children: [invoice.status === 'captured' && (_jsxs(_Fragment, { children: [_jsx(Button, { variant: "outline", size: "sm", onClick: () => {
                                                                                        setSelectedInvoice(invoice);
                                                                                        populateInvoiceForm(invoice);
                                                                                        setIsInvoiceDialogOpen(true);
                                                                                    }, title: "Edit Invoice", children: _jsx(Edit, { className: "h-4 w-4" }) }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => {
                                                                                        if (confirm(`Are you sure you want to delete invoice ${invoice.invoiceNumber}? This action cannot be undone.`)) {
                                                                                            deleteInvoiceMutation.mutate(invoice.id);
                                                                                        }
                                                                                    }, disabled: deleteInvoiceMutation.isPending, title: "Delete Invoice", children: _jsx(Trash2, { className: "h-4 w-4" }) })] })), !invoice.rawData || !JSON.parse(invoice.rawData || '{}').purchaseOrderId ? (_jsx(Button, { variant: "outline", size: "sm", onClick: () => {
                                                                                setSelectedInvoice(invoice);
                                                                                setIsMatchingDialogOpen(true);
                                                                            }, title: "Match Invoice", children: _jsx(FileCheck, { className: "h-4 w-4" }) })) : (_jsxs("div", { className: "flex items-center space-x-1 text-green-600", title: "Already matched with Purchase Order", children: [_jsx(FileCheck, { className: "h-4 w-4" }), _jsx("span", { className: "text-xs", children: "Matched" })] })), _jsx(Button, { variant: "outline", size: "sm", onClick: () => {
                                                                                setSelectedInvoice(invoice);
                                                                                setIsApprovalDialogOpen(true);
                                                                            }, title: "Approve Invoice", children: _jsx(CheckCircle, { className: "h-4 w-4" }) })] }) })] }, invoice.id)))) })] }) })] }), _jsxs(TabsContent, { value: "payments", className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Total Paid" }), _jsx(DollarSign, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: "text-2xl font-bold", children: ["$", paymentStats.totalPaid?.toLocaleString() || '0'] }), _jsxs("p", { className: "text-xs text-muted-foreground", children: [paymentStats.totalPayments || 0, " payments made"] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Scheduled" }), _jsx(Calendar, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: "text-2xl font-bold", children: ["$", paymentStats.totalScheduled?.toLocaleString() || '0'] }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Upcoming payments" })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Bank Balance" }), _jsx(Wallet, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: "text-2xl font-bold", children: ["$", paymentStats.totalBankBalance?.toLocaleString() || '0'] }), _jsxs("p", { className: "text-xs text-muted-foreground", children: [paymentStats.bankAccounts || 0, " accounts"] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Recent Payments" }), _jsx(CheckCircle, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: payments.length }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Payment records" })] })] })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { className: "flex space-x-2", children: [_jsx(Input, { placeholder: "Search bills...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "w-64" }), _jsxs(Select, { value: statusFilter, onValueChange: setStatusFilter, children: [_jsx(SelectTrigger, { className: "w-32", children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All Status" }), _jsx(SelectItem, { value: "posted", children: "Posted" }), _jsx(SelectItem, { value: "partially_paid", children: "Partially Paid" }), _jsx(SelectItem, { value: "paid", children: "Paid" }), _jsx(SelectItem, { value: "overdue", children: "Overdue" })] })] })] }), _jsxs(Button, { onClick: () => setIsPaymentDialogOpen(true), children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "Schedule Payment"] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { children: ["All Bills (", bills.length, " total)"] }), _jsxs(CardDescription, { children: ["Showing ", filteredBills.length, " bills after filtering"] })] }), _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { children: "Bill #" }), _jsx(TableHead, { children: "Vendor" }), _jsx(TableHead, { children: "Due Date" }), _jsx(TableHead, { children: "Amount" }), _jsx(TableHead, { children: "Balance Due" }), _jsx(TableHead, { children: "PO Reference" }), _jsx(TableHead, { children: "Status" }), _jsx(TableHead, { children: "Actions" })] }) }), _jsx(TableBody, { children: billsLoading ? (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 8, className: "text-center py-8", children: "Loading bills..." }) })) : filteredBills.length === 0 ? (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 8, className: "text-center py-8", children: bills.length === 0 ? 'No bills found.' : 'No bills match your filters.' }) })) : (filteredBills.map((bill) => (_jsxs(TableRow, { children: [_jsx(TableCell, { className: "font-medium", children: bill.billNumber }), _jsx(TableCell, { children: bill.vendor?.name }), _jsx(TableCell, { children: bill.dueDate ? format(new Date(bill.dueDate), 'MMM dd, yyyy') : 'N/A' }), _jsxs(TableCell, { children: ["$", Number(bill.totalAmount).toLocaleString()] }), _jsxs(TableCell, { children: ["$", Number(bill.balanceDue).toLocaleString()] }), _jsx(TableCell, { children: bill.invoiceCapture?.rawData && JSON.parse(bill.invoiceCapture.rawData || '{}').purchaseOrderId ? (_jsxs(Badge, { variant: "secondary", className: "bg-blue-100 text-blue-800", children: ["PO-", JSON.parse(bill.invoiceCapture.rawData).purchaseOrderId] })) : (_jsx("span", { className: "text-muted-foreground text-sm", children: "No PO" })) }), _jsx(TableCell, { children: _jsx(Badge, { className: getStatusColor(bill.status), children: bill.status }) }), _jsx(TableCell, { children: _jsxs("div", { className: "flex space-x-2", children: [_jsxs(Button, { variant: "default", size: "sm", onClick: () => {
                                                                                    setPaymentForm({
                                                                                        ...paymentForm,
                                                                                        billId: bill.id,
                                                                                        amount: Number(bill.balanceDue).toString(),
                                                                                        paymentMethod: 'bank_transfer',
                                                                                        scheduledDate: new Date().toISOString().split('T')[0]
                                                                                    });
                                                                                    setIsPaymentDialogOpen(true);
                                                                                }, disabled: bill.status === 'paid' || bill.balanceDue <= 0, title: bill.status === 'paid' ? 'Already paid' : 'Pay now', children: [_jsx(CreditCard, { className: "h-4 w-4 mr-1" }), "Pay Now"] }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => {
                                                                                    setPaymentForm({
                                                                                        ...paymentForm,
                                                                                        billId: bill.id,
                                                                                        amount: bill.balanceDue.toString()
                                                                                    });
                                                                                    setIsPaymentDialogOpen(true);
                                                                                }, title: "Schedule payment", children: _jsx(Calendar, { className: "h-4 w-4" }) })] }) })] }, bill.id)))) })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Recent Payments" }), _jsx(CardDescription, { children: "Latest payment transactions" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-2", children: [payments.slice(0, 5).map((payment) => (_jsxs("div", { className: "flex items-center justify-between p-2 border rounded", children: [_jsxs("div", { children: [_jsx("p", { className: "font-medium", children: payment.bill?.billNumber }), _jsx("p", { className: "text-sm text-muted-foreground", children: payment.bill?.vendor?.name })] }), _jsxs("div", { className: "text-right", children: [_jsxs("p", { className: "font-medium", children: ["$", Number(payment.amount).toLocaleString()] }), _jsx("p", { className: "text-sm text-muted-foreground", children: format(new Date(payment.paymentDate), 'MMM dd, yyyy') })] })] }, payment.id))), payments.length === 0 && (_jsx("div", { className: "text-center py-4 text-muted-foreground", children: "No payments found" }))] }) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Upcoming Payments" }), _jsx(CardDescription, { children: "Scheduled payment transactions" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-2", children: [paymentSchedules.slice(0, 5).map((schedule) => (_jsxs("div", { className: "flex items-center justify-between p-2 border rounded", children: [_jsxs("div", { children: [_jsx("p", { className: "font-medium", children: schedule.bill?.billNumber }), _jsx("p", { className: "text-sm text-muted-foreground", children: schedule.bill?.vendor?.name })] }), _jsxs("div", { className: "text-right", children: [_jsxs("p", { className: "font-medium", children: ["$", Number(schedule.amount).toLocaleString()] }), _jsx("p", { className: "text-sm text-muted-foreground", children: format(new Date(schedule.scheduledDate), 'MMM dd, yyyy') })] })] }, schedule.id))), paymentSchedules.length === 0 && (_jsx("div", { className: "text-center py-4 text-muted-foreground", children: "No scheduled payments" }))] }) })] })] }), _jsx(TabsContent, { value: "reports", className: "space-y-4", children: _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "AP Aging Report" }), _jsx(CardDescription, { children: "Outstanding amounts by aging buckets" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [agingReport.agingSummary && Object.entries(agingReport.agingSummary).map(([bucket, data]) => (_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "font-medium capitalize", children: bucket.replace('_', ' ') }), _jsxs("p", { className: "text-sm text-muted-foreground", children: [data.count, " bills"] })] }), _jsx("div", { className: "text-right", children: _jsxs("p", { className: "text-lg font-bold", children: ["$", data.totalAmount?.toLocaleString() || '0'] }) })] }, bucket))), _jsx("div", { className: "border-t pt-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("p", { className: "font-bold", children: "Total Outstanding" }), _jsxs("p", { className: "text-xl font-bold", children: ["$", agingReport.totalOutstanding?.toLocaleString() || '0'] })] }) })] }) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Processing Statistics" }), _jsx(CardDescription, { children: "Invoice processing metrics" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { children: "Total Invoices" }), _jsx("span", { className: "font-bold", children: dashboard.totalInvoices || 0 })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { children: "Pending Processing" }), _jsx("span", { className: "font-bold", children: dashboard.pendingInvoices || 0 })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { children: "Matched" }), _jsx("span", { className: "font-bold", children: dashboard.matchedInvoices || 0 })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { children: "Approved" }), _jsx("span", { className: "font-bold", children: dashboard.approvedInvoices || 0 })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { children: "Processing Rate" }), _jsxs("span", { className: "font-bold", children: [dashboard.totalInvoices > 0
                                                                                ? Math.round((dashboard.approvedInvoices / dashboard.totalInvoices) * 100)
                                                                                : 0, "%"] })] })] }) })] })] }) })] }), _jsx(Dialog, { open: isInvoiceDialogOpen, onOpenChange: (open) => {
                            setIsInvoiceDialogOpen(open);
                            if (!open) {
                                resetInvoiceForm(); // Clear form when dialog is closed
                            }
                        }, children: _jsxs(DialogContent, { className: "max-w-2xl", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: selectedInvoice ? 'Edit Invoice' : 'Capture New Invoice' }), _jsx(DialogDescription, { children: selectedInvoice ? 'Update invoice details' : 'Create an invoice for a purchase order to process payment' })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("label", { className: "text-sm font-medium", children: "Purchase Order" }), _jsxs(Button, { type: "button", variant: "outline", size: "sm", onClick: () => {
                                                                // TODO: Open create purchase order dialog
                                                                toast.info('Create purchase order functionality coming soon!');
                                                            }, children: [_jsx(Plus, { className: "h-4 w-4 mr-1" }), "Create PO"] })] }), _jsxs(Select, { value: invoiceForm.purchaseOrderId, onValueChange: (value) => {
                                                        const selectedPO = purchaseOrders.find((po) => po.id === value);
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
                                                            setFormErrors({ ...formErrors, purchaseOrderId: '' });
                                                        }
                                                    }, children: [_jsx(SelectTrigger, { className: formErrors.purchaseOrderId ? 'border-red-500' : '', children: _jsx(SelectValue, { placeholder: purchaseOrdersLoading ? "Loading purchase orders..." : "Select purchase order", children: invoiceForm.purchaseOrderId ?
                                                                    purchaseOrders.find((po) => po.id === invoiceForm.purchaseOrderId)?.poNumber || "Select purchase order"
                                                                    : "Select purchase order" }) }), _jsx(SelectContent, { children: purchaseOrdersLoading ? (_jsx(SelectItem, { value: "loading", disabled: true, children: "Loading purchase orders..." })) : !Array.isArray(purchaseOrders) || purchaseOrders.length === 0 ? (_jsx(SelectItem, { value: "no-pos", disabled: true, children: "No purchase orders found - Create one first" })) : (purchaseOrders
                                                                .filter((po) => ['approved', 'delivered'].includes(po.status))
                                                                .map((po) => (_jsxs(SelectItem, { value: po.id, children: [po.poNumber, " - ", po.vendor?.name, " ($", parseFloat(po.totalAmount).toFixed(2), ") - ", po.status] }, po.id)))) })] }), formErrors.purchaseOrderId && (_jsx("p", { className: "text-xs text-red-500 mt-1", children: formErrors.purchaseOrderId })), _jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Select a purchase order to automatically populate vendor and amount" })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("label", { className: "text-sm font-medium", children: "Vendor" }), (!Array.isArray(vendors) || vendors.length === 0) && !vendorsLoading && (_jsxs(Button, { type: "button", variant: "outline", size: "sm", onClick: () => {
                                                                // TODO: Open create vendor dialog
                                                                toast.info('Create vendor functionality coming soon!');
                                                            }, children: [_jsx(Plus, { className: "h-4 w-4 mr-1" }), "Create Vendor"] }))] }), _jsxs(Select, { value: invoiceForm.vendorId, onValueChange: (value) => {
                                                        setInvoiceForm({ ...invoiceForm, vendorId: value });
                                                        if (formErrors.vendorId) {
                                                            setFormErrors({ ...formErrors, vendorId: '' });
                                                        }
                                                    }, children: [_jsx(SelectTrigger, { className: formErrors.vendorId ? 'border-red-500' : '', children: _jsx(SelectValue, { placeholder: vendorsLoading ? "Loading vendors..." : "Select vendor" }) }), _jsx(SelectContent, { children: vendorsLoading ? (_jsx(SelectItem, { value: "loading-vendors", disabled: true, children: "Loading vendors..." })) : !Array.isArray(vendors) || vendors.length === 0 ? (_jsx(SelectItem, { value: "no-vendors", disabled: true, children: "No vendors found - Create one first" })) : (vendors.map((vendor) => (_jsx(SelectItem, { value: vendor.id, children: vendor.name }, vendor.id)))) })] }), formErrors.vendorId && (_jsx("p", { className: "text-xs text-red-500 mt-1", children: formErrors.vendorId })), vendorsError && (_jsxs("p", { className: "text-sm text-red-500 mt-1", children: ["Error loading vendors: ", vendorsError.message] }))] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium", children: "Invoice Number" }), _jsx(Input, { value: invoiceForm.invoiceNumber, onChange: (e) => {
                                                        setInvoiceForm({ ...invoiceForm, invoiceNumber: e.target.value });
                                                        if (formErrors.invoiceNumber) {
                                                            setFormErrors({ ...formErrors, invoiceNumber: '' });
                                                        }
                                                    }, placeholder: "Enter invoice number", className: formErrors.invoiceNumber ? 'border-red-500' : '' }), formErrors.invoiceNumber && (_jsx("p", { className: "text-xs text-red-500 mt-1", children: formErrors.invoiceNumber }))] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium", children: "Invoice Date" }), _jsx(Input, { type: "date", value: invoiceForm.invoiceDate, onChange: (e) => {
                                                        setInvoiceForm({ ...invoiceForm, invoiceDate: e.target.value });
                                                        if (formErrors.invoiceDate) {
                                                            setFormErrors({ ...formErrors, invoiceDate: '' });
                                                        }
                                                    }, className: formErrors.invoiceDate ? 'border-red-500' : '' }), formErrors.invoiceDate && (_jsx("p", { className: "text-xs text-red-500 mt-1", children: formErrors.invoiceDate }))] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium", children: "Due Date" }), _jsx(Input, { type: "date", value: invoiceForm.dueDate, onChange: (e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value }) })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium", children: "Total Amount" }), _jsx(Input, { type: "number", value: invoiceForm.totalAmount, onChange: (e) => {
                                                        // Format the input value to avoid floating-point issues
                                                        const value = e.target.value;
                                                        const formattedValue = value ? parseFloat(value).toFixed(2) : '';
                                                        setInvoiceForm({ ...invoiceForm, totalAmount: formattedValue });
                                                        if (formErrors.totalAmount) {
                                                            setFormErrors({ ...formErrors, totalAmount: '' });
                                                        }
                                                    }, placeholder: "0.00", className: `text-right font-mono ${formErrors.totalAmount ? 'border-red-500' : ''}`, step: "0.01", min: "0" }), formErrors.totalAmount && (_jsx("p", { className: "text-xs text-red-500 mt-1", children: formErrors.totalAmount }))] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium", children: "Currency" }), _jsxs(Select, { value: invoiceForm.currency, onValueChange: (value) => setInvoiceForm({ ...invoiceForm, currency: value }), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "USD", children: "USD" }), _jsx(SelectItem, { value: "EUR", children: "EUR" }), _jsx(SelectItem, { value: "GBP", children: "GBP" })] })] })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium", children: "Source" }), _jsxs(Select, { value: invoiceForm.source, onValueChange: (value) => setInvoiceForm({ ...invoiceForm, source: value }), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "manual", children: "Manual Entry" }), _jsx(SelectItem, { value: "email", children: "Email" }), _jsx(SelectItem, { value: "api", children: "API" }), _jsx(SelectItem, { value: "ocr", children: "OCR Scan" }), _jsx(SelectItem, { value: "upload", children: "File Upload" })] })] })] }), _jsxs("div", { className: "col-span-2", children: [_jsx("label", { className: "text-sm font-medium", children: "Notes" }), _jsx(Input, { value: invoiceForm.notes, onChange: (e) => setInvoiceForm({ ...invoiceForm, notes: e.target.value }), placeholder: "Additional notes" })] })] }), _jsxs(DialogFooter, { children: [_jsx(Button, { variant: "outline", onClick: () => setIsInvoiceDialogOpen(false), children: "Cancel" }), _jsx(Button, { onClick: handleCaptureInvoice, disabled: captureInvoiceMutation.isPending || updateInvoiceMutation.isPending, children: captureInvoiceMutation.isPending || updateInvoiceMutation.isPending
                                                ? (selectedInvoice ? 'Updating...' : 'Capturing...')
                                                : (selectedInvoice ? 'Update Invoice' : 'Capture Invoice') })] })] }) }), _jsx(Dialog, { open: isMatchingDialogOpen, onOpenChange: setIsMatchingDialogOpen, children: _jsxs(DialogContent, { children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Match Invoice" }), _jsx(DialogDescription, { children: "Match invoice with purchase order and goods received note" })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium", children: "Matching Type" }), _jsxs(Select, { value: matchingForm.matchingType, onValueChange: (value) => setMatchingForm({ ...matchingForm, matchingType: value }), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "two_way", children: "Two-way (Invoice + PO)" }), _jsx(SelectItem, { value: "three_way", children: "Three-way (Invoice + PO + GRN)" })] })] })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium", children: "Purchase Order" }), _jsxs(Select, { value: matchingForm.purchaseOrderId, onValueChange: (value) => setMatchingForm({ ...matchingForm, purchaseOrderId: value }), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select PO" }) }), _jsx(SelectContent, {})] })] }), matchingForm.matchingType === 'three_way' && (_jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium", children: "Goods Received Note" }), _jsxs(Select, { value: matchingForm.goodsReceivedNoteId, onValueChange: (value) => setMatchingForm({ ...matchingForm, goodsReceivedNoteId: value }), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select GRN" }) }), _jsx(SelectContent, {})] })] }))] }), _jsxs(DialogFooter, { children: [_jsx(Button, { variant: "outline", onClick: () => setIsMatchingDialogOpen(false), children: "Cancel" }), _jsx(Button, { onClick: handleMatchInvoice, disabled: matchInvoiceMutation.isPending, children: matchInvoiceMutation.isPending ? 'Matching...' : 'Match Invoice' })] })] }) }), _jsx(Dialog, { open: isApprovalDialogOpen, onOpenChange: setIsApprovalDialogOpen, children: _jsxs(DialogContent, { children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Approve Invoice" }), _jsx(DialogDescription, { children: "Review and approve or reject the invoice" })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium", children: "Approver ID" }), _jsx(Input, { value: approvalForm.approverId, onChange: (e) => setApprovalForm({ ...approvalForm, approverId: e.target.value }), placeholder: "Enter approver ID" })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium", children: "Approval Level" }), _jsxs(Select, { value: approvalForm.approvalLevel.toString(), onValueChange: (value) => setApprovalForm({ ...approvalForm, approvalLevel: parseInt(value) }), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "1", children: "Level 1" }), _jsx(SelectItem, { value: "2", children: "Level 2" }), _jsx(SelectItem, { value: "3", children: "Level 3" })] })] })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium", children: "Decision" }), _jsxs(Select, { value: approvalForm.status, onValueChange: (value) => setApprovalForm({ ...approvalForm, status: value }), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "approved", children: "Approve" }), _jsx(SelectItem, { value: "rejected", children: "Reject" }), _jsx(SelectItem, { value: "delegated", children: "Delegate" })] })] })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium", children: "Comments" }), _jsx(Input, { value: approvalForm.comments, onChange: (e) => setApprovalForm({ ...approvalForm, comments: e.target.value }), placeholder: "Approval comments" })] })] }), _jsxs(DialogFooter, { children: [_jsx(Button, { variant: "outline", onClick: () => setIsApprovalDialogOpen(false), children: "Cancel" }), _jsx(Button, { onClick: handleApproveInvoice, disabled: approveInvoiceMutation.isPending, children: approveInvoiceMutation.isPending ? 'Processing...' : 'Submit Decision' })] })] }) }), _jsx(Dialog, { open: isPaymentDialogOpen, onOpenChange: setIsPaymentDialogOpen, children: _jsxs(DialogContent, { children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Schedule Payment" }), _jsx(DialogDescription, { children: "Schedule a payment for the selected bill" })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium", children: "Scheduled Date" }), _jsx(Input, { type: "date", value: paymentForm.scheduledDate, onChange: (e) => setPaymentForm({ ...paymentForm, scheduledDate: e.target.value }) })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium", children: "Amount" }), _jsx(Input, { type: "number", value: paymentForm.amount, onChange: (e) => setPaymentForm({ ...paymentForm, amount: e.target.value }), placeholder: "0.00" })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium", children: "Payment Method" }), _jsxs(Select, { value: paymentForm.paymentMethod, onValueChange: (value) => setPaymentForm({ ...paymentForm, paymentMethod: value }), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "check", children: "Check" }), _jsx(SelectItem, { value: "bank_transfer", children: "Bank Transfer" }), _jsx(SelectItem, { value: "credit_card", children: "Credit Card" }), _jsx(SelectItem, { value: "cash", children: "Cash" })] })] })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium", children: "Priority" }), _jsxs(Select, { value: paymentForm.priority, onValueChange: (value) => setPaymentForm({ ...paymentForm, priority: value }), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "low", children: "Low" }), _jsx(SelectItem, { value: "normal", children: "Normal" }), _jsx(SelectItem, { value: "high", children: "High" }), _jsx(SelectItem, { value: "urgent", children: "Urgent" })] })] })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium", children: "Notes" }), _jsx(Input, { value: paymentForm.notes, onChange: (e) => setPaymentForm({ ...paymentForm, notes: e.target.value }), placeholder: "Payment notes" })] })] }), _jsxs(DialogFooter, { children: [_jsx(Button, { variant: "outline", onClick: () => setIsPaymentDialogOpen(false), children: "Cancel" }), _jsx(Button, { variant: "default", onClick: handleProcessPayment, disabled: processPaymentMutation.isPending || schedulePaymentMutation.isPending, children: processPaymentMutation.isPending ? 'Processing...' : 'Pay Now' }), _jsx(Button, { variant: "outline", onClick: handleSchedulePayment, disabled: schedulePaymentMutation.isPending || processPaymentMutation.isPending, children: schedulePaymentMutation.isPending ? 'Scheduling...' : 'Schedule Payment' })] })] }) })] })] }));
}
