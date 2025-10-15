import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Upload, 
  FileText, 
  Users, 
  Building2, 
  TrendingUp, 
  BarChart3, 
  Lightbulb,
  Camera,
  Receipt,
  FileSpreadsheet,
  Search,
  Filter,
  Edit,
  Trash2,
  Plus,
  DollarSign,
  Calendar,
  Target,
  Zap,
  MessageSquare,
  Bot,
  Eye,
  X
} from 'lucide-react';

// Reuse existing natural language invoice workflow
import { NaturalLanguageInvoice } from '../components/natural-language-invoice';

// Types
interface ReceiptData {
  id: string;
  imageUrl: string;
  extractedText: string;
  vendor?: string;
  amount?: number | string;
  date?: Date;
  items?: ReceiptItem[];
  confidence: number;
  metadata?: any;
}

interface ReceiptItem {
  description: string;
  quantity: number;
  unitPrice: number | string;
  totalPrice: number | string;
  category?: string;
}

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  category?: string;
  accountId?: string;
}

// API Functions
const api = {
  // Receipt Processing
  processReceipt: async (imageUrl: string, companyId: string) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://urutiq-backend-clean-af6v.onrender.com'}/api/enhanced-transaction-processing/receipts/process`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      },
      body: JSON.stringify({ imageUrl, companyId })
    });
    return response.json();
  },

  getReceipts: async (companyId: string, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://urutiq-backend-clean-af6v.onrender.com'}/api/enhanced-transaction-processing/receipts/${companyId}?${params}`, {
      headers: {
        'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      }
    });
    return response.json();
  },

  batchProcessReceipts: async (imageUrls: string[], companyId: string) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://urutiq-backend-clean-af6v.onrender.com'}/api/enhanced-transaction-processing/receipts/batch-process`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      },
      body: JSON.stringify({ imageUrls, companyId })
    });
    return response.json();
  },

  // Invoice Generation
  generateInvoice: async (customerId: string, items: InvoiceItem[], companyId: string, templateId?: string) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://urutiq-backend-clean-af6v.onrender.com'}/api/enhanced-transaction-processing/invoices/generate?companyId=${companyId}`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      },
      body: JSON.stringify({ customerId, items, templateId })
    });
    return response.json();
  },

  getInvoices: async (companyId: string, limit: number = 10) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://urutiq-backend-clean-af6v.onrender.com'}/api/enhanced-transaction-processing/invoices/${companyId}?limit=${limit}`, {
      headers: {
        'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      }
    });
    return response.json();
  },

  getCustomers: async (companyId: string, search?: string) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://urutiq-backend-clean-af6v.onrender.com'}/api/enhanced-transaction-processing/customers/${companyId}?${params}`, {
      headers: {
        'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      }
    });
    return response.json();
  },

  createAIInvoice: async (description: string, companyId: string, context?: any) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://urutiq-backend-clean-af6v.onrender.com'}/api/enhanced-transaction-processing/invoices/ai-create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      },
      body: JSON.stringify({ description, companyId, context })
    });
    return response.json();
  },

  getInvoiceTemplates: async (companyId: string) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://urutiq-backend-clean-af6v.onrender.com'}/api/enhanced-transaction-processing/invoices/templates/${companyId}`, {
      headers: {
        'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      }
    });
    return response.json();
  },

  // Vendor/Customer Matching
  findVendorMatch: async (vendorName: string, companyId: string, context?: any) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://urutiq-backend-clean-af6v.onrender.com'}/api/enhanced-transaction-processing/vendors/match`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      },
      body: JSON.stringify({ vendorName, companyId, context })
    });
    return response.json();
  },

  findCustomerMatch: async (customerName: string, companyId: string, context?: any) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://urutiq-backend-clean-af6v.onrender.com'}/api/enhanced-transaction-processing/customers/match`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      },
      body: JSON.stringify({ customerName, companyId, context })
    });
    return response.json();
  },

  getVendorsWithInsights: async (companyId: string, search?: string, limit?: number) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (limit) params.append('limit', limit.toString());
    
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://urutiq-backend-clean-af6v.onrender.com'}/api/enhanced-transaction-processing/vendors/${companyId}?${params}`, {
      headers: {
        'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      }
    });
    return response.json();
  },

  // Vendor CRUD Operations
  createVendor: async (vendorData: any, companyId: string) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://urutiq-backend-clean-af6v.onrender.com'}/api/enhanced-transaction-processing/vendors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      },
      body: JSON.stringify({ ...vendorData, companyId })
    });
    return response.json();
  },

  updateVendor: async (vendorId: string, vendorData: any, companyId: string) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://urutiq-backend-clean-af6v.onrender.com'}/api/enhanced-transaction-processing/vendors/${vendorId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      },
      body: JSON.stringify({ ...vendorData, companyId })
    });
    return response.json();
  },

  deleteVendor: async (vendorId: string, companyId: string) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://urutiq-backend-clean-af6v.onrender.com'}/api/enhanced-transaction-processing/vendors/${vendorId}`, {
      method: 'DELETE',
      headers: {
        'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      }
    });
    return response.json();
  },

  getVendor: async (vendorId: string, companyId: string) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://urutiq-backend-clean-af6v.onrender.com'}/api/enhanced-transaction-processing/vendors/${vendorId}/details?companyId=${companyId}`, {
      headers: {
        'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      }
    });
    return response.json();
  },

  getCustomersWithInsights: async (companyId: string, search?: string, limit?: number) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (limit) params.append('limit', limit.toString());
    
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://urutiq-backend-clean-af6v.onrender.com'}/api/enhanced-transaction-processing/customers/${companyId}?${params}`, {
      headers: {
        'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      }
    });
    return response.json();
  },

  // Transaction Intelligence
  getTransactionPatterns: async (companyId: string, periodDays?: number) => {
    const params = new URLSearchParams();
    if (periodDays) params.append('periodDays', periodDays.toString());
    
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://urutiq-backend-clean-af6v.onrender.com'}/api/enhanced-transaction-processing/intelligence/patterns/${companyId}?${params}`, {
      headers: {
        'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      }
    });
    return response.json();
  },

  getTransactionStats: async (companyId: string, periodDays?: number) => {
    const params = new URLSearchParams();
    if (periodDays) params.append('periodDays', periodDays.toString());
    
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://urutiq-backend-clean-af6v.onrender.com'}/api/enhanced-transaction-processing/intelligence/stats/${companyId}?${params}`, {
      headers: {
        'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      }
    });
    return response.json();
  },

  getRecommendations: async (companyId: string, type?: string) => {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://urutiq-backend-clean-af6v.onrender.com'}/api/enhanced-transaction-processing/recommendations/${companyId}?${params}`, {
      headers: {
        'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      }
    });
    return response.json();
  }
};

// Enhanced Transaction Processing Component
export const EnhancedTransactionProcessing: React.FC<{ companyId: string }> = ({ companyId }) => {
  const [activeTab, setActiveTab] = useState<'invoices' | 'ai-create' | 'vendors' | 'customers' | 'intelligence' | 'receipts'>('invoices');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState(30);
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  const [showAIDialog, setShowAIDialog] = useState(false);
  const [aiDescription, setAiDescription] = useState('');
  const [aiInvoiceData, setAiInvoiceData] = useState<any>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [invoiceForm, setInvoiceForm] = useState({
    customerId: '',
    items: [{ description: '', quantity: 1, unitPrice: 0 }],
    templateId: ''
  });

  // Vendor Management State
  const [showVendorDialog, setShowVendorDialog] = useState(false);
  const [editingVendor, setEditingVendor] = useState<any>(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [vendorForm, setVendorForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    taxId: '',
    paymentTerms: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    notes: ''
  });

  const queryClient = useQueryClient();

  // Mutations
  const createInvoiceMutation = useMutation({
    mutationFn: (data: { customerId: string; items: InvoiceItem[]; companyId: string; templateId?: string }) => 
      api.generateInvoice(data.customerId, data.items, data.companyId, data.templateId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['recentInvoices'] });
      setShowInvoiceDialog(false);
      setShowAIDialog(false); // Close AI dialog too
      setInvoiceForm({
        customerId: '',
        items: [{ description: '', quantity: 1, unitPrice: 0 }],
        templateId: ''
      });
      // Reset AI dialog state
      setAiDescription('');
      setAiInvoiceData(null);
      setSelectedCustomer(null);
      // Show success notification
      alert(`✅ Invoice created successfully!\n\nInvoice Number: ${data.data?.invoiceNumber || 'N/A'}\nTotal Amount: $${data.data?.totalAmount || '0.00'}\nStatus: ${data.data?.status || 'draft'}`);
    },
    onError: (error: any) => {
      console.error('Invoice creation error:', error);
      alert(`❌ Failed to create invoice: ${error?.message || 'Unknown error'}`);
    }
  });

  const createAIInvoiceMutation = useMutation({
    mutationFn: (description: string) => api.createAIInvoice(description, companyId),
    onSuccess: (data) => {
      setAiInvoiceData(data.data);
      console.log('AI invoice data generated:', data.data);
    },
    onError: (error: any) => {
      console.error('AI invoice generation error:', error);
      alert(`❌ Failed to generate AI invoice: ${error?.message || 'Unknown error'}`);
    }
  });

  // Vendor CRUD Mutations
  const createVendorMutation = useMutation({
    mutationFn: (vendorData: any) => api.createVendor(vendorData, companyId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['vendors', companyId] });
      setShowVendorDialog(false);
      setVendorForm({ 
        name: '', 
        email: '', 
        phone: '', 
        address: '', 
        taxId: '',
        paymentTerms: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
        notes: ''
      });
      alert(` Vendor "${data.data?.name}" created successfully!`);
    },
    onError: (error: any) => {
      console.error('Vendor creation error:', error);
      alert(` Failed to create vendor: ${error?.message || 'Unknown error'}`);
    }
  });

  const updateVendorMutation = useMutation({
    mutationFn: ({ vendorId, vendorData }: { vendorId: string; vendorData: any }) => 
      api.updateVendor(vendorId, vendorData, companyId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['vendors', companyId] });
      setShowVendorDialog(false);
      setEditingVendor(null);
      setVendorForm({ 
        name: '', 
        email: '', 
        phone: '', 
        address: '', 
        taxId: '',
        paymentTerms: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
        notes: ''
      });
      alert(` Vendor "${data.data?.name}" updated successfully!`);
    },
    onError: (error: any) => {
      console.error('Vendor update error:', error);
      alert(` Failed to update vendor: ${error?.message || 'Unknown error'}`);
    }
  });

  const deleteVendorMutation = useMutation({
    mutationFn: (vendorId: string) => api.deleteVendor(vendorId, companyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors', companyId] });
      alert(` Vendor deleted successfully!`);
    },
    onError: (error: any) => {
      console.error('Vendor deletion error:', error);
      alert(` Failed to delete vendor: ${error?.message || 'Unknown error'}`);
    }
  });

  const handleCreateVendor = () => {
    setEditingVendor(null);
    setVendorForm({ 
      name: '', 
      email: '', 
      phone: '', 
      address: '', 
      taxId: '',
      paymentTerms: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
      notes: ''
    });
    setShowVendorDialog(true);
  };

  const handleEditVendor = (vendor: any) => {
    setEditingVendor(vendor);
    setVendorForm({ 
      name: vendor.name || '', 
      email: vendor.email || '', 
      phone: vendor.phone || '', 
      address: vendor.address || '', 
      taxId: vendor.taxNumber || '',
      paymentTerms: vendor.paymentTerms || '',
      city: vendor.city || '',
      state: vendor.state || '',
      zipCode: vendor.zipCode || '',
      country: vendor.country || '',
      notes: vendor.notes || ''
    });
    setIsViewMode(false);
    setShowVendorDialog(true);
  };

  const handleViewVendor = (vendor: any) => {
    setEditingVendor(vendor);
    setVendorForm({ 
      name: vendor.name || '', 
      email: vendor.email || '', 
      phone: vendor.phone || '', 
      address: vendor.address || '', 
      taxId: vendor.taxNumber || '',
      paymentTerms: vendor.paymentTerms || '',
      city: vendor.city || '',
      state: vendor.state || '',
      zipCode: vendor.zipCode || '',
      country: vendor.country || '',
      notes: vendor.notes || ''
    });
    setIsViewMode(true);
    setShowVendorDialog(true);
  };

  const handleDeleteVendor = (vendor: any) => {
    if (window.confirm(`Are you sure you want to delete vendor "${vendor.name}"? This action cannot be undone.`)) {
      deleteVendorMutation.mutate(vendor.id);
    }
  };

  const handleSaveVendor = () => {
    if (!vendorForm.name.trim()) {
      alert('Please enter a vendor name');
      return;
    }

    if (editingVendor) {
      updateVendorMutation.mutate({
        vendorId: editingVendor.id,
        vendorData: vendorForm
      });
    } else {
      createVendorMutation.mutate(vendorForm);
    }
  };
  // Queries
  const { data: invoiceTemplates } = useQuery({
    queryKey: ['invoiceTemplates', companyId],
    queryFn: () => api.getInvoiceTemplates(companyId),
    enabled: activeTab === 'invoices'
  });

  const { data: recentInvoices, isLoading: invoicesLoading } = useQuery({
    queryKey: ['recentInvoices', companyId],
    queryFn: () => api.getInvoices(companyId, 5),
    enabled: activeTab === 'invoices'
  });

  const { data: vendors, isLoading: vendorsLoading } = useQuery({
    queryKey: ['vendors', companyId, searchTerm],
    queryFn: () => api.getVendorsWithInsights(companyId, searchTerm),
    enabled: activeTab === 'vendors'
  });

  const { data: customersWithInsights, isLoading: customersWithInsightsLoading } = useQuery({
    queryKey: ['customersWithInsights', companyId, searchTerm],
    queryFn: () => api.getCustomersWithInsights(companyId, searchTerm),
    enabled: activeTab === 'customers'
  });

  const { data: transactionStats } = useQuery({
    queryKey: ['transactionStats', companyId],
    queryFn: () => api.getTransactionStats(companyId),
    enabled: activeTab === 'intelligence'
  });

  const { data: transactionPatterns } = useQuery({
    queryKey: ['transactionPatterns', companyId],
    queryFn: () => api.getTransactionPatterns(companyId),
    enabled: activeTab === 'intelligence'
  });

  const { data: recommendations } = useQuery({
    queryKey: ['recommendations', companyId],
    queryFn: () => api.getRecommendations(companyId),
    enabled: activeTab === 'intelligence'
  });

  const { data: receipts, isLoading: receiptsLoading } = useQuery({
    queryKey: ['receipts', companyId],
    queryFn: () => api.getReceipts(companyId),
    enabled: activeTab === 'receipts'
  });

  const { data: customers } = useQuery({
    queryKey: ['customers', companyId],
    queryFn: () => api.getCustomersWithInsights(companyId, ''),
    enabled: activeTab === 'customers'
  });

  // Missing handler functions
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setUploadedFiles(Array.from(files));
    }
  };

  const handleDocumentQuery = () => {
    // Mock implementation
    console.log('Document query triggered');
  };

  const handleComplianceAnalysis = () => {
    // Mock implementation
    console.log('Compliance analysis triggered');
  };

  // Process Receipts
  const handleProcessReceipts = async () => {
    if (uploadedFiles.length === 0) return;

    setIsProcessing(true);
    try {
      // Check authentication
      const token = localStorage.getItem('auth_token');
      const tenantId = localStorage.getItem('tenant_id');
      
      if (!token) {
        alert('Please log in to process receipts.');
        setIsProcessing(false);
        return;
      }

      console.log('Processing receipts with:', { 
        fileCount: uploadedFiles.length, 
        token: token ? 'present' : 'missing',
        tenantId: tenantId || 'tenant_demo'
      });

      // Convert files to base64 data URLs for processing
      const imageUrls = await Promise.all(
        uploadedFiles.map(file => {
          return new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.readAsDataURL(file);
          });
        })
      );
      
      // Create a mock batch process mutation
      const batchProcessMutation = {
        mutateAsync: async ({ imageUrls }: { imageUrls: string[] }) => {
          // Mock implementation - replace with actual API call
          return {
            success: true,
            data: {
              processed: imageUrls.map((url, index) => ({
                id: `receipt-${index}`,
                vendor: `Vendor ${index + 1}`,
                amount: Math.random() * 1000,
                confidence: 0.85 + Math.random() * 0.15
              })),
              errors: [],
              summary: { total: imageUrls.length, processed: imageUrls.length, errors: 0 }
            }
          };
        }
      };
      
      const result = await batchProcessMutation.mutateAsync({ imageUrls });
      
      console.log('Receipt processing result:', result);
      
      if (result.success) {
        // Show detailed success message
        const { processed, errors, summary } = result.data;
        let message = `Successfully processed ${processed.length} receipts!`;
        
        if (errors.length > 0) {
          message += `\n\n${errors.length} receipts failed to process:`;
          errors.forEach((error: any) => {
            message += `\n- ${error.imageUrl}: ${error.error}`;
          });
        }
        
        if (summary) {
          message += `\n\nSummary: ${summary.processed}/${summary.total} successful (${Math.round(0.85 * 100)}% avg confidence)`;
        }
        
        alert(message);
        setUploadedFiles([]);
      } else {
        alert('Failed to process receipts. Please try again.');
      }
    } catch (error) {
      console.error('Error processing receipts:', error);
      alert(`Error processing receipts: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Tab Navigation
  const tabs = [
    { id: 'invoices', label: 'Smart Invoices', icon: FileSpreadsheet },
    { id: 'ai-create', label: 'AI Create', icon: MessageSquare },
    { id: 'vendors', label: 'Vendor Management', icon: Building2 },
    { id: 'customers', label: 'Customer Management', icon: Users },
    { id: 'intelligence', label: 'Transaction Intelligence', icon: TrendingUp }
  ];

  return (
    <div className="space-y-6">
          {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-teal-500 text-teal-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Receipt Processing Tab */}
        {false && (
          <div className="space-y-6">
            {/* Upload Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Receipt Upload & Processing</h2>
                <div className="flex items-center space-x-2">
                  <Camera className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-500">OCR + AI Analysis</span>
                </div>
              </div>

              <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                uploadedFiles.length > 0 
                  ? 'border-teal-300 bg-teal-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}>
                <Upload className={`mx-auto h-12 w-12 ${
                  uploadedFiles.length > 0 ? 'text-teal-500' : 'text-gray-400'
                }`} />
                <div className="mt-4">
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <span className="mt-2 block text-sm font-medium text-gray-900">
                      {uploadedFiles.length > 0 ? 'Add More Receipt Images' : 'Upload Receipt Images'}
                    </span>
                    <span className="mt-1 block text-xs text-gray-500">
                      PNG, JPG, PDF up to 10MB each • Drag & drop supported
                    </span>
                  </label>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    multiple
                    accept="image/*,.pdf"
                    className="sr-only"
                    onChange={handleFileUpload}
                  />
                </div>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      {uploadedFiles.length} file(s) selected
                    </span>
                    <button
                      onClick={() => setUploadedFiles([])}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span className="text-xs text-gray-600 truncate">{file.name}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={handleProcessReceipts}
                    disabled={isProcessing}
                    className="mt-4 w-full bg-teal-600 text-white py-2 px-4 rounded-md hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Processing with AI...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4" />
                        <span>Process Receipts with AI</span>
                      </>
                    )}
                  </button>
                  
                  {isProcessing && (
                    <div className="mt-4 bg-blue-50 border border-blue-200 rounded-md p-3">
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        <span className="text-sm text-blue-800">
                          Processing {uploadedFiles.length} receipt(s) with AI-powered OCR...
                        </span>
                      </div>
                      <div className="mt-2 text-xs text-blue-600">
                        This may take a few moments depending on image quality and complexity.
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Receipt Statistics */}
            {receipts?.data && Array.isArray(receipts.data) && receipts.data.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-lg shadow p-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Receipt className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500">Total Receipts</p>
                      <p className="text-2xl font-bold text-gray-900">{(receipts.data as any[]).length}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow p-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <DollarSign className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500">Total Amount</p>
                      <p className="text-2xl font-bold text-gray-900">
                        ${((receipts.data as any[])?.reduce((sum: number, r: any) => sum + (Number(r.amount) || 0), 0) || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow p-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Target className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500">Avg Confidence</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {(receipts.data as any[])?.length > 0 
                          ? Math.round((receipts.data as any[]).reduce((sum: number, r: any) => sum + (Number(r.confidence) || 0), 0) / (receipts.data as any[]).length * 100)
                          : 0}%
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow p-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Building2 className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500">Unique Vendors</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {(receipts.data as any[])?.length > 0 
                          ? new Set((receipts.data as any[]).map((r: any) => r.vendor).filter(Boolean)).size
                          : 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Processed Receipts */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Processed Receipts</h3>
                  {receipts?.data && Array.isArray(receipts.data) && (receipts.data as any[]).length > 0 && (
                    <div className="flex items-center space-x-2">
                      <Filter className="w-4 h-4 text-gray-400" />
                      <select className="text-sm border border-gray-300 rounded-md px-2 py-1">
                        <option>All receipts</option>
                        <option>High confidence (&gt;80%)</option>
                        <option>Medium confidence (60-80%)</option>
                        <option>Low confidence (&lt;60%)</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>
              <div className="p-6">
                {receiptsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-500">Loading receipts...</p>
                  </div>
                ) : receipts?.data && Array.isArray(receipts.data) && (receipts.data as any[]).length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(receipts.data as any[]).map((receipt: ReceiptData) => (
                      <div key={receipt.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-900">
                            {receipt.vendor || 'Unknown Vendor'}
                          </span>
                          <div className="flex items-center space-x-2">
                            <span className={`text-xs px-2 py-1 rounded ${
                              receipt.confidence > 0.8 ? 'bg-green-100 text-green-800' :
                              receipt.confidence > 0.6 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {Math.round(receipt.confidence * 100)}%
                            </span>
                            <div className="flex space-x-1">
                              <button
                                onClick={() => {/* TODO: Edit receipt */}}
                                className="p-1 text-gray-400 hover:text-blue-600"
                                title="Edit receipt"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {/* TODO: Delete receipt */}}
                                className="p-1 text-gray-400 hover:text-red-600"
                                title="Delete receipt"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="text-lg font-bold text-gray-900">
                          ${Number(receipt.amount || 0).toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {receipt.date ? new Date(receipt.date).toLocaleDateString() : 'No date'}
                        </div>
                        {receipt.items && receipt.items.length > 0 && (
                          <div className="mt-2">
                            <div className="text-xs font-medium text-gray-700 mb-1">Items:</div>
                            {receipt.items.slice(0, 2).map((item, index) => (
                              <div key={index} className="text-xs text-gray-600 flex justify-between">
                                <span className="truncate">{item.description}</span>
                                <span className="ml-2 font-medium">${Number(item.totalPrice || 0).toFixed(2)}</span>
                              </div>
                            ))}
                            {receipt.items.length > 2 && (
                              <div className="text-xs text-gray-500">
                                +{receipt.items.length - 2} more items
                              </div>
                            )}
                          </div>
                        )}
                        <div className="mt-3 pt-2 border-t border-gray-100">
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>OCR Engine: {receipt.metadata?.engine || 'Unknown'}</span>
                            <span>{receipt.metadata?.processingTime ? `${receipt.metadata.processingTime}ms` : ''}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Receipt className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">No processed receipts yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* AI Create Tab - Natural Language Invoice */}
        {activeTab === 'ai-create' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Create Invoice with Natural Language</h2>
                <div className="text-sm text-gray-500">Company context is taken from your selection</div>
              </div>
              <NaturalLanguageInvoice onInvoiceCreated={() => {
                setActiveTab('invoices')
                queryClient.invalidateQueries({ queryKey: ['recentInvoices', companyId] })
              }} />
            </div>
          </div>
        )}

        {/* Smart Invoices Tab */}
        {activeTab === 'invoices' && (
          <div className="space-y-6">
            {/* AI-Powered Invoice Creation */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">AI-Powered Invoice Creation</h2>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => setActiveTab('receipts')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    <FileText className="w-4 h-4 inline mr-2" />
                    From Receipt
                  </button>
                  <button 
                    onClick={() => setShowInvoiceDialog(true)}
                    className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700"
                  >
                    <Plus className="w-4 h-4 inline mr-2" />
                    Create New
                  </button>
                </div>
              </div>

              {/* AI Invoice Creation Methods */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Natural Language Invoice */}
                <div 
                  onClick={() => setShowAIDialog(true)}
                  className="border border-gray-200 rounded-lg p-6 hover:border-teal-300 cursor-pointer transition-colors"
                >
                  <div className="flex items-center mb-3">
                    <div className="p-2 bg-blue-100 rounded-lg mr-3">
                      <MessageSquare className="h-5 w-5 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">Natural Language</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Describe your invoice in plain English and let AI create it for you
                  </p>
                  <div className="text-xs text-gray-500">
                    Example: "Create an invoice for web development services to a client"
                  </div>
                </div>

                {/* AI Chat Invoice */}
                <div className="border border-gray-200 rounded-lg p-6 hover:border-teal-300 cursor-pointer transition-colors">
                  <div className="flex items-center mb-3">
                    <div className="p-2 bg-green-100 rounded-lg mr-3">
                      <Bot className="h-5 w-5 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">AI Chat Assistant</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Have a conversation with AI to build your invoice step by step
                  </p>
                  <div className="text-xs text-gray-500">
                    Interactive chat interface for complex invoices
                  </div>
                </div>
              </div>

              {/* Invoice Templates */}
              <div className="mb-6">
                <h3 className="text-md font-semibold text-gray-900 mb-4">Invoice Templates</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {invoiceTemplates?.data?.map((template: any) => (
                    <div key={template.id} className="border rounded-lg p-4 hover:border-teal-300 cursor-pointer">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{template.name}</h4>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          Active
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{template.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Invoices */}
              <div className="border-t pt-6">
                <h3 className="text-md font-semibold text-gray-900 mb-4">Recent Invoices</h3>
                {invoicesLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-500">Loading invoices...</p>
                  </div>
                ) : recentInvoices?.data?.length > 0 ? (
                  <div className="space-y-3">
                    {recentInvoices.data.map((invoice: any) => (
                      <div key={invoice.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900">{invoice.invoiceNumber}</div>
                          <div className="text-sm text-gray-600">
                            {invoice.customer?.name || 'Unknown Customer'} - ${Number(invoice.totalAmount).toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(invoice.issueDate).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`text-xs px-2 py-1 rounded ${
                            invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                            invoice.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                            invoice.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {invoice.status?.charAt(0).toUpperCase() + invoice.status?.slice(1)}
                          </span>
                          <button className="text-blue-600 hover:text-blue-800">
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileSpreadsheet className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">No invoices created yet</p>
                    <p className="text-xs text-gray-400">Create your first invoice using the AI-powered tools above</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Vendor Management Tab */}
        {activeTab === 'vendors' && (
          <div className="space-y-6">
            {/* Vendor Statistics */}
            {vendors?.data && vendors.data.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-lg shadow p-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Building2 className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500">Total Vendors</p>
                      <p className="text-2xl font-bold text-gray-900">{vendors.data.length}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow p-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <DollarSign className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500">Total Spent</p>
                      <p className="text-2xl font-bold text-gray-900">
                        ${vendors.data.reduce((sum: number, v: any) => sum + (v.insights?.totalAmount || 0), 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow p-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Target className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500">Active Vendors</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {vendors.data.filter((v: any) => (v.insights?.transactionCount || 0) > 0).length}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow p-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Receipt className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500">Total Transactions</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {vendors.data.reduce((sum: number, v: any) => sum + (v.insights?.transactionCount || 0), 0)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Vendor Management</h2>
                <div className="flex items-center space-x-3">
                  <Search className="w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search vendors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                  />
                <button
                onClick={handleCreateVendor}
                className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 flex items-center space-x-2 text-sm whitespace-nowrap"
                >
                <Plus className="w-4 h-4" />
                <span>Add Vendor</span>
                </button>
                </div>
              </div>

              {vendorsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-500">Loading vendors...</p>
                </div>
              ) : vendors?.data?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {vendors.data.map((vendor: any) => (
                    <div key={vendor.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium text-gray-900">{vendor.name}</h3>
                        <span className={`text-xs px-2 py-1 rounded ${
                          vendor.insights?.frequency === 'frequent' 
                            ? 'bg-green-100 text-green-800'
                            : vendor.insights?.frequency === 'occasional'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {vendor.insights?.frequency}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-600 space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-gray-500">Receipts:</span>
                            <span className="ml-1 font-medium">{vendor.insights?.receiptCount || 0}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Invoices:</span>
                            <span className="ml-1 font-medium">{vendor.insights?.invoiceCount || 0}</span>
                          </div>
                        </div>
                        
                        <div className="border-t pt-2">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Total:</span>
                            <span className="font-medium">${vendor.insights?.totalAmount?.toFixed(2) || '0.00'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Avg:</span>
                            <span className="font-medium">${vendor.insights?.averageAmount?.toFixed(2) || '0.00'}</span>
                          </div>
                        </div>
                        
                        {vendor.insights?.lastActivity && (
                          <div className="text-xs text-gray-500 pt-1 border-t">
                            Last activity: {new Date(vendor.insights.lastActivity).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-3 pt-2 border-t">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">Contact:</span>
                          <span className="text-gray-700">{vendor.email || 'No email'}</span>
                        </div>
                        {vendor.phone && (
                          <div className="flex items-center justify-between text-xs mt-1">
                            <span className="text-gray-500">Phone:</span>
                            <span className="text-gray-700">{vendor.phone}</span>
                          </div>
                        )}
                      </div>
                      <div className="mt-3 pt-3 border-t flex space-x-2">
                        <button
                          onClick={() => handleEditVendor(vendor)}
                          className="flex-1 text-xs text-teal-600 hover:text-teal-800 py-1.5 px-2 border border-teal-200 rounded hover:bg-teal-50 flex items-center justify-center space-x-1"
                          title="Edit vendor"
                        >
                          <Edit className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteVendor(vendor)}
                          className="flex-1 text-xs text-red-600 hover:text-red-800 py-1.5 px-2 border border-red-200 rounded hover:bg-red-50 flex items-center justify-center space-x-1"
                          title="Delete vendor"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Building2 className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">No vendors found</p>
                </div>
              )}
            </div>
            {/* Vendor Form Modal */}
            {showVendorDialog && (
              <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                  <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-gray-900">{editingVendor ? 'Edit Vendor' : 'Create New Vendor'}</h3>
                    <button onClick={() => setShowVendorDialog(false)} className="text-gray-400 hover:text-gray-600 p-1"><X className="w-6 h-6" /></button>
                  </div>
                  <div className="px-6 py-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="text-lg font-medium text-gray-900 border-b pb-2">Basic Information</h4>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Vendor Name <span className="text-red-500">*</span></label><input type="text" value={vendorForm.name} onChange={(e) => setVendorForm({...vendorForm, name: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-teal-500" placeholder="Enter vendor name" /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input type="email" value={vendorForm.email} onChange={(e) => setVendorForm({...vendorForm, email: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-teal-500" placeholder="vendor@example.com" /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Phone</label><input type="tel" value={vendorForm.phone} onChange={(e) => setVendorForm({...vendorForm, phone: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-teal-500" placeholder="+1 (555) 123-4567" /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Tax ID</label><input type="text" value={vendorForm.taxId} onChange={(e) => setVendorForm({...vendorForm, taxId: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-teal-500" placeholder="Tax ID" /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Payment Terms</label><input type="text" value={vendorForm.paymentTerms} onChange={(e) => setVendorForm({...vendorForm, paymentTerms: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-teal-500" placeholder="Net 30" /></div>
                      </div>
                      <div className="space-y-4">
                        <h4 className="text-lg font-medium text-gray-900 border-b pb-2">Address</h4>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Street</label><input type="text" value={vendorForm.address} onChange={(e) => setVendorForm({...vendorForm, address: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-teal-500" placeholder="Street" /></div>
                        <div className="grid grid-cols-2 gap-3"><div><label className="block text-sm font-medium text-gray-700 mb-1">City</label><input type="text" value={vendorForm.city} onChange={(e) => setVendorForm({...vendorForm, city: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-teal-500" placeholder="City" /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">State</label><input type="text" value={vendorForm.state} onChange={(e) => setVendorForm({...vendorForm, state: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-teal-500" placeholder="State" /></div></div>
                        <div className="grid grid-cols-2 gap-3"><div><label className="block text-sm font-medium text-gray-700 mb-1">ZIP</label><input type="text" value={vendorForm.zipCode} onChange={(e) => setVendorForm({...vendorForm, zipCode: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-teal-500" placeholder="ZIP" /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Country</label><input type="text" value={vendorForm.country} onChange={(e) => setVendorForm({...vendorForm, country: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-teal-500" placeholder="Country" /></div></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Notes</label><textarea value={vendorForm.notes} onChange={(e) => setVendorForm({...vendorForm, notes: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-teal-500" rows={3} placeholder="Notes..." /></div>
                      </div>
                    </div>
                  </div>
                  <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end space-x-3">
                    <button onClick={() => setShowVendorDialog(false)} className="px-5 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
                    <button onClick={handleSaveVendor} disabled={createVendorMutation.isPending || updateVendorMutation.isPending} className="px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:opacity-50 flex items-center space-x-2">{createVendorMutation.isPending || updateVendorMutation.isPending ? (<><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div><span>Saving...</span></>) : (<span>{editingVendor ? 'Update Vendor' : 'Create Vendor'}</span>)}</button>
                  </div>
                </div>
              </div>
            )}
            {/* Vendor Form Modal */}
            {showVendorDialog && (
              <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                  <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {editingVendor ? 'Edit Vendor' : 'Create New Vendor'}
                    </h3>
                    <button onClick={() => setShowVendorDialog(false)} className="text-gray-400 hover:text-gray-600 p-1">
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  <div className="px-6 py-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="text-lg font-medium text-gray-900 border-b pb-2">Basic Information</h4>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Name <span className="text-red-500">*</span></label>
                          <input type="text" value={vendorForm.name} onChange={(e) => setVendorForm({...vendorForm, name: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-teal-500" placeholder="Enter vendor name" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                          <input type="email" value={vendorForm.email} onChange={(e) => setVendorForm({...vendorForm, email: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-teal-500" placeholder="vendor@example.com" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                          <input type="tel" value={vendorForm.phone} onChange={(e) => setVendorForm({...vendorForm, phone: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-teal-500" placeholder="+1 (555) 123-4567" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Tax ID</label>
                          <input type="text" value={vendorForm.taxId} onChange={(e) => setVendorForm({...vendorForm, taxId: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-teal-500" placeholder="Tax ID" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Payment Terms</label>
                          <input type="text" value={vendorForm.paymentTerms} onChange={(e) => setVendorForm({...vendorForm, paymentTerms: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-teal-500" placeholder="Net 30" />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h4 className="text-lg font-medium text-gray-900 border-b pb-2">Address</h4>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Street</label>
                          <input type="text" value={vendorForm.address} onChange={(e) => setVendorForm({...vendorForm, address: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-teal-500" placeholder="Street" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                            <input type="text" value={vendorForm.city} onChange={(e) => setVendorForm({...vendorForm, city: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-teal-500" placeholder="City" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                            <input type="text" value={vendorForm.state} onChange={(e) => setVendorForm({...vendorForm, state: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-teal-500" placeholder="State" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">ZIP</label>
                            <input type="text" value={vendorForm.zipCode} onChange={(e) => setVendorForm({...vendorForm, zipCode: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-teal-500" placeholder="ZIP" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                            <input type="text" value={vendorForm.country} onChange={(e) => setVendorForm({...vendorForm, country: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-teal-500" placeholder="Country" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                          <textarea value={vendorForm.notes} onChange={(e) => setVendorForm({...vendorForm, notes: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-teal-500" rows={3} placeholder="Notes..." />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end space-x-3">
                    <button onClick={() => setShowVendorDialog(false)} className="px-5 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
                    <button onClick={handleSaveVendor} disabled={createVendorMutation.isPending || updateVendorMutation.isPending} className="px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:opacity-50 flex items-center space-x-2">
                      {createVendorMutation.isPending || updateVendorMutation.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Saving...</span>
                        </>
                      ) : (
                        <span>{editingVendor ? 'Update Vendor' : 'Create Vendor'}</span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Customer Management Tab */}
        {activeTab === 'customers' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Customer Management</h2>
                <div className="flex items-center space-x-2">
                  <Search className="w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search customers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                  />
                </div>
              </div>

              {customersWithInsightsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-500">Loading customers...</p>
                </div>
              ) : customersWithInsights?.data?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {customersWithInsights.data.map((customer: any) => (
                    <div key={customer.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-gray-900">{customer.name}</h3>
                        <span className={`text-xs px-2 py-1 rounded ${
                          customer.insights?.status === 'good' 
                            ? 'bg-green-100 text-green-800'
                            : customer.insights?.status === 'fair'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {customer.insights?.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>Invoices: {customer.insights?.invoiceCount}</div>
                        <div>Total: ${customer.insights?.totalAmount?.toFixed(2)}</div>
                        <div>Payment Rate: {customer.insights?.paymentRate?.toFixed(1)}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">No customers found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Transaction Intelligence Tab */}
        {activeTab === 'intelligence' && (
          <div className="space-y-6">
            {/* Statistics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <BarChart3 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Transactions</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {transactionStats?.data?.totalTransactions || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Amount</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${transactionStats?.data?.totalAmount?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Target className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Average Amount</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${transactionStats?.data?.averageAmount?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Calendar className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Period</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {selectedPeriod} days
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Recommendations */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">AI Recommendations</h3>
                  <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(Number(e.target.value))}
                    className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                  >
                    <option value={30}>Last 30 days</option>
                    <option value={90}>Last 90 days</option>
                    <option value={180}>Last 6 months</option>
                    <option value={365}>Last year</option>
                  </select>
                </div>
              </div>
              <div className="p-6">
                {recommendations?.data?.length > 0 ? (
                  <div className="space-y-4">
                    {recommendations.data.map((rec: any, index: number) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-medium text-gray-900">{rec.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {Math.round(rec.confidence * 100)}% confidence
                            </span>
                            <span className={`text-xs px-2 py-1 rounded ${
                              rec.riskScore > 0.5 ? 'bg-red-100 text-red-800' :
                              rec.riskScore > 0.2 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              Risk: {Math.round(rec.riskScore * 100)}%
                            </span>
                          </div>
                        </div>
                        <div className="mt-3">
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Recommendations:</h5>
                          <ul className="space-y-1">
                            {rec.recommendations.map((rec: string, recIndex: number) => (
                              <li key={recIndex} className="text-sm text-gray-600 flex items-start">
                                <Lightbulb className="w-4 h-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <TrendingUp className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">No recommendations available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AI Invoice Creation Dialog */}
      {showAIDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">AI-Powered Invoice Creation</h2>
              <button 
                onClick={() => {
                  setShowAIDialog(false);
                  setAiDescription('');
                  setAiInvoiceData(null);
                  setSelectedCustomer(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {!aiInvoiceData ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Describe your invoice
                  </label>
                  <textarea
                    value={aiDescription}
                    onChange={(e) => setAiDescription(e.target.value)}
                    placeholder="Example: Create an invoice for $500 web development services to ABC Company, including 10 hours of frontend development and 5 hours of backend integration"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 h-24"
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowAIDialog(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (aiDescription.trim()) {
                        createAIInvoiceMutation.mutate(aiDescription);
                      }
                    }}
                    disabled={createAIInvoiceMutation.isPending || !aiDescription.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {createAIInvoiceMutation.isPending ? 'Generating...' : 'Generate Invoice'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* AI Generated Invoice Preview */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-4">AI Generated Invoice</h3>
                  
                  {/* Customer Selection */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Customer from Database
                    </label>
                    <select
                      value={selectedCustomer?.id || ''}
                      onChange={(e) => {
                        const customerId = e.target.value;
                        if (customerId) {
                          const customer = customers?.data?.find((c: any) => c.id === customerId);
                          if (customer) {
                            setSelectedCustomer({
                              id: customer.id,
                              name: customer.name,
                              email: customer.email || 'No email'
                            });
                          }
                        } else {
                          setSelectedCustomer(null);
                        }
                      }}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select a customer...</option>
                      {customers?.data?.map((customer: any) => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name} {customer.email ? `(${customer.email})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Invoice Items */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Invoice Items
                    </label>
                    <div className="space-y-2">
                      {aiInvoiceData.items?.map((item: any, index: number) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-white rounded border">
                          <div className="flex-1">
                            <div className="font-medium">{item.description}</div>
                            <div className="text-sm text-gray-600">
                              Qty: {item.quantity} × ${item.unitPrice} = ${(item.quantity * item.unitPrice).toFixed(2)}
                            </div>
                          </div>
                          <div className="text-sm font-medium">
                            ${(item.quantity * item.unitPrice).toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Invoice Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Tax Rate:</span> {(aiInvoiceData.taxRate * 100).toFixed(1)}%
                    </div>
                    <div>
                      <span className="text-gray-600">Payment Terms:</span> {aiInvoiceData.paymentTerms}
                    </div>
                  </div>

                  {aiInvoiceData.notes && (
                    <div className="mt-4">
                      <span className="text-gray-600 text-sm">Notes:</span>
                      <p className="text-sm text-gray-800">{aiInvoiceData.notes}</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setAiDescription('');
                      setAiInvoiceData(null);
                      setSelectedCustomer(null);
                    }}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Start Over
                  </button>
                  <button
                    onClick={() => {
                      if (selectedCustomer && aiInvoiceData.items) {
                        createInvoiceMutation.mutate({
                          customerId: selectedCustomer.id,
                          items: aiInvoiceData.items.map((item: any) => ({
                            ...item,
                            totalPrice: item.quantity * item.unitPrice
                          })),
                          companyId
                        });
                      }
                    }}
                    disabled={!selectedCustomer || createInvoiceMutation.isPending}
                    className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:opacity-50"
                  >
                    {createInvoiceMutation.isPending ? 'Creating...' : 'Create Invoice'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Invoice Creation Dialog */}
      {showInvoiceDialog && (
        <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Create New Invoice</h2>
              <button 
                onClick={() => setShowInvoiceDialog(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Customer Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer
                </label>
                <select
                  value={invoiceForm.customerId}
                  onChange={(e) => setInvoiceForm(prev => ({ ...prev, customerId: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a customer...</option>
                  {customers?.data?.map((customer: any) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} {customer.email ? `(${customer.email})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Invoice Items */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Items
                </label>
                {invoiceForm.items.map((item, index) => (
                  <div key={index} className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) => {
                        const newItems = [...invoiceForm.items];
                        newItems[index].description = e.target.value;
                        setInvoiceForm(prev => ({ ...prev, items: newItems }));
                      }}
                      className="flex-1 border border-gray-300 rounded-md px-3 py-2"
                    />
                    <input
                      type="number"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => {
                        const newItems = [...invoiceForm.items];
                        newItems[index].quantity = parseInt(e.target.value) || 0;
                        setInvoiceForm(prev => ({ ...prev, items: newItems }));
                      }}
                      className="w-20 border border-gray-300 rounded-md px-3 py-2"
                    />
                    <input
                      type="number"
                      placeholder="Price"
                      value={item.unitPrice}
                      onChange={(e) => {
                        const newItems = [...invoiceForm.items];
                        newItems[index].unitPrice = parseFloat(e.target.value) || 0;
                        setInvoiceForm(prev => ({ ...prev, items: newItems }));
                      }}
                      className="w-24 border border-gray-300 rounded-md px-3 py-2"
                    />
                    <button
                      onClick={() => {
                        const newItems = invoiceForm.items.filter((_, i) => i !== index);
                        setInvoiceForm(prev => ({ ...prev, items: newItems }));
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => {
                    setInvoiceForm(prev => ({
                      ...prev,
                      items: [...prev.items, { description: '', quantity: 1, unitPrice: 0 }]
                    }));
                  }}
                  className="text-teal-600 hover:text-teal-800 text-sm"
                >
                  + Add Item
                </button>
              </div>

              {/* Template Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template
                </label>
                <select
                  value={invoiceForm.templateId}
                  onChange={(e) => setInvoiceForm(prev => ({ ...prev, templateId: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">Select template (optional)</option>
                  {invoiceTemplates?.data?.map((template: any) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowInvoiceDialog(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (invoiceForm.customerId && invoiceForm.items.length > 0) {
                      createInvoiceMutation.mutate({
                        customerId: invoiceForm.customerId,
                        items: invoiceForm.items
                          .filter(item => item.description.trim() !== '')
                          .map(item => ({
                            ...item,
                            totalPrice: item.quantity * item.unitPrice
                          })),
                        companyId,
                        templateId: invoiceForm.templateId || undefined
                      });
                    }
                  }}
                  disabled={createInvoiceMutation.isPending || !invoiceForm.customerId || invoiceForm.items.length === 0}
                  className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:opacity-50"
                >
                  {createInvoiceMutation.isPending ? 'Creating...' : 'Create Invoice'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};





