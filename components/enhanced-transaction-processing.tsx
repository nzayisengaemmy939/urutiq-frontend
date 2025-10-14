import React, { useState, useEffect } from 'react';
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
  UserCheck,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Plus,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  Calendar,
  Target,
  Zap
} from 'lucide-react';

// Types
interface ReceiptData {
  id: string;
  imageUrl: string;
  extractedText: string;
  vendor?: string;
  amount?: number;
  date?: Date;
  items?: ReceiptItem[];
  confidence: number;
  metadata?: any;
}

interface ReceiptItem {
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  category?: string;
}

interface SmartInvoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customer: any;
  items: InvoiceItem[];
  subtotal: number;
  taxAmount: number;
  total: number;
  dueDate: Date;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  metadata?: any;
}

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  category?: string;
  accountId?: string;
}

interface VendorMatch {
  vendorId: string;
  vendorName: string;
  confidence: number;
  reasoning: string;
  suggestedCategory?: string;
  paymentTerms?: string;
}

interface CustomerMatch {
  customerId: string;
  customerName: string;
  confidence: number;
  reasoning: string;
  suggestedCategory?: string;
  creditLimit?: number;
}

interface TransactionIntelligence {
  patternType: 'vendor' | 'amount' | 'category' | 'timing' | 'location';
  confidence: number;
  description: string;
  recommendations: string[];
  riskScore: number;
  metadata?: any;
}

interface TransactionStats {
  period: { start: Date; end: Date };
  totalTransactions: number;
  totalAmount: number;
  averageAmount: number;
  byType: Record<string, { count: number; total: number }>;
  patterns: TransactionIntelligence[];
}

// API Functions
const api = {
  // Receipt Processing
  processReceipt: async (imageUrl: string, companyId: string) => {
    const response = await fetch('/api/enhanced-transaction-processing/receipts/process', {
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
    
    const response = await fetch(`/api/enhanced-transaction-processing/receipts/${companyId}?${params}`, {
      headers: {
        'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      }
    });
    return response.json();
  },

  batchProcessReceipts: async (imageUrls: string[], companyId: string) => {
    const response = await fetch('/api/enhanced-transaction-processing/receipts/batch-process', {
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
    const response = await fetch('/api/enhanced-transaction-processing/invoices/generate', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      },
      body: JSON.stringify({ customerId, items, companyId, templateId })
    });
    return response.json();
  },

  getInvoiceTemplates: async (companyId: string) => {
    const response = await fetch(`/api/enhanced-transaction-processing/invoices/templates/${companyId}`, {
      headers: {
        'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      }
    });
    return response.json();
  },

  // Vendor/Customer Matching
  findVendorMatch: async (vendorName: string, companyId: string, context?: any) => {
    const response = await fetch('/api/enhanced-transaction-processing/vendors/match', {
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
    const response = await fetch('/api/enhanced-transaction-processing/customers/match', {
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
    
    const response = await fetch(`/api/enhanced-transaction-processing/vendors/${companyId}?${params}`, {
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
    
    const response = await fetch(`/api/enhanced-transaction-processing/customers/${companyId}?${params}`, {
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
    
    const response = await fetch(`/api/enhanced-transaction-processing/intelligence/patterns/${companyId}?${params}`, {
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
    
    const response = await fetch(`/api/enhanced-transaction-processing/intelligence/stats/${companyId}?${params}`, {
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
    
    const response = await fetch(`/api/enhanced-transaction-processing/recommendations/${companyId}?${params}`, {
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
  const [activeTab, setActiveTab] = useState<'receipts' | 'invoices' | 'vendors' | 'customers' | 'intelligence'>('receipts');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState(30);

  const queryClient = useQueryClient();

  // Queries
  const { data: receipts, isLoading: receiptsLoading } = useQuery({
    queryKey: ['receipts', companyId],
    queryFn: () => api.getReceipts(companyId),
    enabled: activeTab === 'receipts'
  });

  const { data: invoiceTemplates } = useQuery({
    queryKey: ['invoiceTemplates', companyId],
    queryFn: () => api.getInvoiceTemplates(companyId),
    enabled: activeTab === 'invoices'
  });

  const { data: vendors, isLoading: vendorsLoading } = useQuery({
    queryKey: ['vendors', companyId, searchTerm],
    queryFn: () => api.getVendorsWithInsights(companyId, searchTerm),
    enabled: activeTab === 'vendors'
  });

  const { data: customers, isLoading: customersLoading } = useQuery({
    queryKey: ['customers', companyId, searchTerm],
    queryFn: () => api.getCustomersWithInsights(companyId, searchTerm),
    enabled: activeTab === 'customers'
  });

  const { data: transactionStats } = useQuery({
    queryKey: ['transactionStats', companyId, selectedPeriod],
    queryFn: () => api.getTransactionStats(companyId, selectedPeriod),
    enabled: activeTab === 'intelligence'
  });

  const { data: recommendations } = useQuery({
    queryKey: ['recommendations', companyId],
    queryFn: () => api.getRecommendations(companyId),
    enabled: activeTab === 'intelligence'
  });

  // Mutations
  const processReceiptMutation = useMutation({
    mutationFn: ({ imageUrl }: { imageUrl: string }) => api.processReceipt(imageUrl, companyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['receipts', companyId] });
    }
  });

  const batchProcessMutation = useMutation({
    mutationFn: ({ imageUrls }: { imageUrls: string[] }) => api.batchProcessReceipts(imageUrls, companyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['receipts', companyId] });
    }
  });

  // File Upload Handler
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedFiles(prev => [...prev, ...files]);
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

      // Simulate file upload and get URLs
      const imageUrls = uploadedFiles.map(file => URL.createObjectURL(file));
      
      const result = await batchProcessMutation.mutateAsync({ imageUrls });
      
      console.log('Receipt processing result:', result);
      
      if (result.success) {
        // Show success message
        alert(`Successfully processed ${result.data.processed.length} receipts!`);
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
    { id: 'receipts', label: 'Receipt Processing', icon: Receipt },
    { id: 'invoices', label: 'Smart Invoices', icon: FileSpreadsheet },
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
        {activeTab === 'receipts' && (
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

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <span className="mt-2 block text-sm font-medium text-gray-900">
                      Upload Receipt Images
                    </span>
                    <span className="mt-1 block text-xs text-gray-500">
                      PNG, JPG, PDF up to 10MB each
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
                    className="mt-4 w-full bg-teal-600 text-white py-2 px-4 rounded-md hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? 'Processing...' : 'Process Receipts with AI'}
                  </button>
                </div>
              )}
            </div>

            {/* Processed Receipts */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Processed Receipts</h3>
              </div>
              <div className="p-6">
                {receiptsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-500">Loading receipts...</p>
                  </div>
                ) : receipts?.data?.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {receipts.data.map((receipt: ReceiptData) => (
                      <div key={receipt.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-900">
                            {receipt.vendor || 'Unknown Vendor'}
                          </span>
                          <span className="text-sm text-gray-500">
                            {receipt.confidence * 100}% confidence
                          </span>
                        </div>
                        <div className="text-lg font-bold text-gray-900">
                          ${receipt.amount?.toFixed(2) || '0.00'}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {receipt.date ? new Date(receipt.date).toLocaleDateString() : 'No date'}
                        </div>
                        {receipt.items && receipt.items.length > 0 && (
                          <div className="mt-2">
                            <div className="text-xs font-medium text-gray-700 mb-1">Items:</div>
                            {receipt.items.slice(0, 2).map((item, index) => (
                              <div key={index} className="text-xs text-gray-600">
                                {item.description} - ${item.totalPrice.toFixed(2)}
                              </div>
                            ))}
                            {receipt.items.length > 2 && (
                              <div className="text-xs text-gray-500">
                                +{receipt.items.length - 2} more items
                              </div>
                            )}
                          </div>
                        )}
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

        {/* Smart Invoices Tab */}
        {activeTab === 'invoices' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Smart Invoice Generation</h2>
                <button className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700">
                  <Plus className="w-4 h-4 inline mr-2" />
                  Create Invoice
                </button>
              </div>

              {/* Invoice Templates */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {invoiceTemplates?.data?.map((template: any) => (
                  <div key={template.id} className="border rounded-lg p-4 hover:border-teal-300 cursor-pointer">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{template.name}</h3>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        Active
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{template.description}</p>
                  </div>
                ))}
              </div>

              <div className="text-center py-8">
                <FileSpreadsheet className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">Invoice generation interface coming soon</p>
              </div>
            </div>
          </div>
        )}

        {/* Vendor Management Tab */}
        {activeTab === 'vendors' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Vendor Management</h2>
                <div className="flex items-center space-x-2">
                  <Search className="w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search vendors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                  />
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
                    <div key={vendor.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
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
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>Transactions: {vendor.insights?.transactionCount}</div>
                        <div>Total: ${vendor.insights?.totalAmount?.toFixed(2)}</div>
                        <div>Avg: ${vendor.insights?.averageAmount?.toFixed(2)}</div>
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

              {customersLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-500">Loading customers...</p>
                </div>
              ) : customers?.data?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {customers.data.map((customer: any) => (
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
    </div>
  );
};
