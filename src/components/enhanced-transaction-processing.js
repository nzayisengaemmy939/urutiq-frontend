import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, FileText, Users, Building2, TrendingUp, BarChart3, Lightbulb, Camera, Receipt, FileSpreadsheet, Search, Filter, Edit, Trash2, Plus, DollarSign, Calendar, Target, Zap, MessageSquare, Bot, Eye, X } from 'lucide-react';
// Reuse existing natural language invoice workflow
import { NaturalLanguageInvoice } from '../components/natural-language-invoice';
// API Functions
const api = {
    // Receipt Processing
    processReceipt: async (imageUrl, companyId) => {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://urutiq-backend-clean-11.onrender.com'}/api/enhanced-transaction-processing/receipts/process`, {
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
    getReceipts: async (companyId, startDate, endDate) => {
        const params = new URLSearchParams();
        if (startDate)
            params.append('startDate', startDate);
        if (endDate)
            params.append('endDate', endDate);
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://urutiq-backend-clean-11.onrender.com'}/api/enhanced-transaction-processing/receipts/${companyId}?${params}`, {
            headers: {
                'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo',
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            }
        });
        return response.json();
    },
    batchProcessReceipts: async (imageUrls, companyId) => {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://urutiq-backend-clean-11.onrender.com'}/api/enhanced-transaction-processing/receipts/batch-process`, {
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
    generateInvoice: async (customerId, items, companyId, templateId) => {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://urutiq-backend-clean-11.onrender.com'}/api/enhanced-transaction-processing/invoices/generate?companyId=${companyId}`, {
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
    getInvoices: async (companyId, limit = 10) => {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://urutiq-backend-clean-11.onrender.com'}/api/enhanced-transaction-processing/invoices/${companyId}?limit=${limit}`, {
            headers: {
                'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo',
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            }
        });
        return response.json();
    },
    getCustomers: async (companyId, search) => {
        const params = new URLSearchParams();
        if (search)
            params.append('search', search);
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://urutiq-backend-clean-11.onrender.com'}/api/enhanced-transaction-processing/customers/${companyId}?${params}`, {
            headers: {
                'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo',
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            }
        });
        return response.json();
    },
    createAIInvoice: async (description, companyId, context) => {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://urutiq-backend-clean-11.onrender.com'}/api/enhanced-transaction-processing/invoices/ai-create`, {
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
    getInvoiceTemplates: async (companyId) => {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://urutiq-backend-clean-11.onrender.com'}/api/enhanced-transaction-processing/invoices/templates/${companyId}`, {
            headers: {
                'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo',
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            }
        });
        return response.json();
    },
    // Vendor/Customer Matching
    findVendorMatch: async (vendorName, companyId, context) => {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://urutiq-backend-clean-11.onrender.com'}/api/enhanced-transaction-processing/vendors/match`, {
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
    findCustomerMatch: async (customerName, companyId, context) => {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://urutiq-backend-clean-11.onrender.com'}/api/enhanced-transaction-processing/customers/match`, {
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
    getVendorsWithInsights: async (companyId, search, limit) => {
        const params = new URLSearchParams();
        if (search)
            params.append('search', search);
        if (limit)
            params.append('limit', limit.toString());
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://urutiq-backend-clean-11.onrender.com'}/api/enhanced-transaction-processing/vendors/${companyId}?${params}`, {
            headers: {
                'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo',
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            }
        });
        return response.json();
    },
    // Vendor CRUD Operations
    createVendor: async (vendorData, companyId) => {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://urutiq-backend-clean-11.onrender.com'}/api/enhanced-transaction-processing/vendors`, {
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
    updateVendor: async (vendorId, vendorData, companyId) => {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://urutiq-backend-clean-11.onrender.com'}/api/enhanced-transaction-processing/vendors/${vendorId}`, {
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
    deleteVendor: async (vendorId, companyId) => {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://urutiq-backend-clean-11.onrender.com'}/api/enhanced-transaction-processing/vendors/${vendorId}`, {
            method: 'DELETE',
            headers: {
                'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo',
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            }
        });
        return response.json();
    },
    getVendor: async (vendorId, companyId) => {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://urutiq-backend-clean-11.onrender.com'}/api/enhanced-transaction-processing/vendors/${vendorId}/details?companyId=${companyId}`, {
            headers: {
                'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo',
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            }
        });
        return response.json();
    },
    getCustomersWithInsights: async (companyId, search, limit) => {
        const params = new URLSearchParams();
        if (search)
            params.append('search', search);
        if (limit)
            params.append('limit', limit.toString());
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://urutiq-backend-clean-11.onrender.com'}/api/enhanced-transaction-processing/customers/${companyId}?${params}`, {
            headers: {
                'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo',
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            }
        });
        return response.json();
    },
    // Transaction Intelligence
    getTransactionPatterns: async (companyId, periodDays) => {
        const params = new URLSearchParams();
        if (periodDays)
            params.append('periodDays', periodDays.toString());
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://urutiq-backend-clean-11.onrender.com'}/api/enhanced-transaction-processing/intelligence/patterns/${companyId}?${params}`, {
            headers: {
                'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo',
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            }
        });
        return response.json();
    },
    getTransactionStats: async (companyId, periodDays) => {
        const params = new URLSearchParams();
        if (periodDays)
            params.append('periodDays', periodDays.toString());
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://urutiq-backend-clean-11.onrender.com'}/api/enhanced-transaction-processing/intelligence/stats/${companyId}?${params}`, {
            headers: {
                'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo',
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            }
        });
        return response.json();
    },
    getRecommendations: async (companyId, type) => {
        const params = new URLSearchParams();
        if (type)
            params.append('type', type);
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://urutiq-backend-clean-11.onrender.com'}/api/enhanced-transaction-processing/recommendations/${companyId}?${params}`, {
            headers: {
                'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo',
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            }
        });
        return response.json();
    }
};
// Enhanced Transaction Processing Component
export const EnhancedTransactionProcessing = ({ companyId }) => {
    const [activeTab, setActiveTab] = useState('invoices');
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPeriod, setSelectedPeriod] = useState(30);
    const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
    const [showAIDialog, setShowAIDialog] = useState(false);
    const [aiDescription, setAiDescription] = useState('');
    const [aiInvoiceData, setAiInvoiceData] = useState(null);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [invoiceForm, setInvoiceForm] = useState({
        customerId: '',
        items: [{ description: '', quantity: 1, unitPrice: 0 }],
        templateId: ''
    });
    // Vendor Management State
    const [showVendorDialog, setShowVendorDialog] = useState(false);
    const [editingVendor, setEditingVendor] = useState(null);
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
        mutationFn: (data) => api.generateInvoice(data.customerId, data.items, data.companyId, data.templateId),
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
        onError: (error) => {
            console.error('Invoice creation error:', error);
            alert(`❌ Failed to create invoice: ${error?.message || 'Unknown error'}`);
        }
    });
    const createAIInvoiceMutation = useMutation({
        mutationFn: (description) => api.createAIInvoice(description, companyId),
        onSuccess: (data) => {
            setAiInvoiceData(data.data);
            console.log('AI invoice data generated:', data.data);
        },
        onError: (error) => {
            console.error('AI invoice generation error:', error);
            alert(`❌ Failed to generate AI invoice: ${error?.message || 'Unknown error'}`);
        }
    });
    // Vendor CRUD Mutations
    const createVendorMutation = useMutation({
        mutationFn: (vendorData) => api.createVendor(vendorData, companyId),
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
        onError: (error) => {
            console.error('Vendor creation error:', error);
            alert(` Failed to create vendor: ${error?.message || 'Unknown error'}`);
        }
    });
    const updateVendorMutation = useMutation({
        mutationFn: ({ vendorId, vendorData }) => api.updateVendor(vendorId, vendorData, companyId),
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
        onError: (error) => {
            console.error('Vendor update error:', error);
            alert(` Failed to update vendor: ${error?.message || 'Unknown error'}`);
        }
    });
    const deleteVendorMutation = useMutation({
        mutationFn: (vendorId) => api.deleteVendor(vendorId, companyId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vendors', companyId] });
            alert(` Vendor deleted successfully!`);
        },
        onError: (error) => {
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
    const handleEditVendor = (vendor) => {
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
    const handleViewVendor = (vendor) => {
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
    const handleDeleteVendor = (vendor) => {
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
        }
        else {
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
    const handleFileUpload = (event) => {
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
        if (uploadedFiles.length === 0)
            return;
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
            const imageUrls = await Promise.all(uploadedFiles.map(file => {
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = (e) => resolve(e.target?.result);
                    reader.readAsDataURL(file);
                });
            }));
            // Create a mock batch process mutation
            const batchProcessMutation = {
                mutateAsync: async ({ imageUrls }) => {
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
                    errors.forEach((error) => {
                        message += `\n- ${error.imageUrl}: ${error.error}`;
                    });
                }
                if (summary) {
                    message += `\n\nSummary: ${summary.processed}/${summary.total} successful (${Math.round(0.85 * 100)}% avg confidence)`;
                }
                alert(message);
                setUploadedFiles([]);
            }
            else {
                alert('Failed to process receipts. Please try again.');
            }
        }
        catch (error) {
            console.error('Error processing receipts:', error);
            alert(`Error processing receipts: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
        finally {
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
    return (_jsxs("div", { className: "space-y-6", children: [_jsx("div", { className: "bg-white rounded-lg shadow-sm border p-4", children: _jsx("div", { className: "flex space-x-8", children: tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (_jsxs("button", { onClick: () => setActiveTab(tab.id), className: `flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                                ? 'border-teal-500 text-teal-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`, children: [_jsx(Icon, { className: "w-4 h-4" }), _jsx("span", { children: tab.label })] }, tab.id));
                    }) }) }), _jsxs("div", { className: "space-y-6", children: [false && (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900", children: "Receipt Upload & Processing" }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Camera, { className: "w-5 h-5 text-gray-400" }), _jsx("span", { className: "text-sm text-gray-500", children: "OCR + AI Analysis" })] })] }), _jsxs("div", { className: `border-2 border-dashed rounded-lg p-6 text-center transition-colors ${uploadedFiles.length > 0
                                            ? 'border-teal-300 bg-teal-50'
                                            : 'border-gray-300 hover:border-gray-400'}`, children: [_jsx(Upload, { className: `mx-auto h-12 w-12 ${uploadedFiles.length > 0 ? 'text-teal-500' : 'text-gray-400'}` }), _jsxs("div", { className: "mt-4", children: [_jsxs("label", { htmlFor: "file-upload", className: "cursor-pointer", children: [_jsx("span", { className: "mt-2 block text-sm font-medium text-gray-900", children: uploadedFiles.length > 0 ? 'Add More Receipt Images' : 'Upload Receipt Images' }), _jsx("span", { className: "mt-1 block text-xs text-gray-500", children: "PNG, JPG, PDF up to 10MB each \u2022 Drag & drop supported" })] }), _jsx("input", { id: "file-upload", name: "file-upload", type: "file", multiple: true, accept: "image/*,.pdf", className: "sr-only", onChange: handleFileUpload })] })] }), uploadedFiles.length > 0 && (_jsxs("div", { className: "mt-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsxs("span", { className: "text-sm font-medium text-gray-700", children: [uploadedFiles.length, " file(s) selected"] }), _jsx("button", { onClick: () => setUploadedFiles([]), className: "text-sm text-red-600 hover:text-red-800", children: "Clear all" })] }), _jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-2", children: uploadedFiles.map((file, index) => (_jsxs("div", { className: "flex items-center space-x-2 p-2 bg-gray-50 rounded", children: [_jsx(FileText, { className: "w-4 h-4 text-gray-400" }), _jsx("span", { className: "text-xs text-gray-600 truncate", children: file.name })] }, index))) }), _jsx("button", { onClick: handleProcessReceipts, disabled: isProcessing, className: "mt-4 w-full bg-teal-600 text-white py-2 px-4 rounded-md hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2", children: isProcessing ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "animate-spin rounded-full h-4 w-4 border-b-2 border-white" }), _jsx("span", { children: "Processing with AI..." })] })) : (_jsxs(_Fragment, { children: [_jsx(Zap, { className: "w-4 h-4" }), _jsx("span", { children: "Process Receipts with AI" })] })) }), isProcessing && (_jsxs("div", { className: "mt-4 bg-blue-50 border border-blue-200 rounded-md p-3", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: "animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" }), _jsxs("span", { className: "text-sm text-blue-800", children: ["Processing ", uploadedFiles.length, " receipt(s) with AI-powered OCR..."] })] }), _jsx("div", { className: "mt-2 text-xs text-blue-600", children: "This may take a few moments depending on image quality and complexity." })] }))] }))] }), receipts?.data && Array.isArray(receipts.data) && receipts.data.length > 0 && (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4 mb-6", children: [_jsx("div", { className: "bg-white rounded-lg shadow p-4", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "p-2 bg-blue-100 rounded-lg", children: _jsx(Receipt, { className: "w-5 h-5 text-blue-600" }) }), _jsxs("div", { className: "ml-3", children: [_jsx("p", { className: "text-sm font-medium text-gray-500", children: "Total Receipts" }), _jsx("p", { className: "text-2xl font-bold text-gray-900", children: receipts.data.length })] })] }) }), _jsx("div", { className: "bg-white rounded-lg shadow p-4", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "p-2 bg-green-100 rounded-lg", children: _jsx(DollarSign, { className: "w-5 h-5 text-green-600" }) }), _jsxs("div", { className: "ml-3", children: [_jsx("p", { className: "text-sm font-medium text-gray-500", children: "Total Amount" }), _jsxs("p", { className: "text-2xl font-bold text-gray-900", children: ["$", (receipts.data?.reduce((sum, r) => sum + (Number(r.amount) || 0), 0) || 0).toFixed(2)] })] })] }) }), _jsx("div", { className: "bg-white rounded-lg shadow p-4", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "p-2 bg-purple-100 rounded-lg", children: _jsx(Target, { className: "w-5 h-5 text-purple-600" }) }), _jsxs("div", { className: "ml-3", children: [_jsx("p", { className: "text-sm font-medium text-gray-500", children: "Avg Confidence" }), _jsxs("p", { className: "text-2xl font-bold text-gray-900", children: [receipts.data?.length > 0
                                                                    ? Math.round(receipts.data.reduce((sum, r) => sum + (Number(r.confidence) || 0), 0) / receipts.data.length * 100)
                                                                    : 0, "%"] })] })] }) }), _jsx("div", { className: "bg-white rounded-lg shadow p-4", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "p-2 bg-orange-100 rounded-lg", children: _jsx(Building2, { className: "w-5 h-5 text-orange-600" }) }), _jsxs("div", { className: "ml-3", children: [_jsx("p", { className: "text-sm font-medium text-gray-500", children: "Unique Vendors" }), _jsx("p", { className: "text-2xl font-bold text-gray-900", children: receipts.data?.length > 0
                                                                ? new Set(receipts.data.map((r) => r.vendor).filter(Boolean)).size
                                                                : 0 })] })] }) })] })), _jsxs("div", { className: "bg-white rounded-lg shadow", children: [_jsx("div", { className: "px-6 py-4 border-b border-gray-200", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900", children: "Processed Receipts" }), receipts?.data && Array.isArray(receipts.data) && receipts.data.length > 0 && (_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Filter, { className: "w-4 h-4 text-gray-400" }), _jsxs("select", { className: "text-sm border border-gray-300 rounded-md px-2 py-1", children: [_jsx("option", { children: "All receipts" }), _jsx("option", { children: "High confidence (>80%)" }), _jsx("option", { children: "Medium confidence (60-80%)" }), _jsx("option", { children: "Low confidence (<60%)" })] })] }))] }) }), _jsx("div", { className: "p-6", children: receiptsLoading ? (_jsxs("div", { className: "text-center py-8", children: [_jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto" }), _jsx("p", { className: "mt-2 text-sm text-gray-500", children: "Loading receipts..." })] })) : receipts?.data && Array.isArray(receipts.data) && receipts.data.length > 0 ? (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: receipts.data.map((receipt) => (_jsxs("div", { className: "border rounded-lg p-4 hover:shadow-md transition-shadow", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("span", { className: "text-sm font-medium text-gray-900", children: receipt.vendor || 'Unknown Vendor' }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsxs("span", { className: `text-xs px-2 py-1 rounded ${receipt.confidence > 0.8 ? 'bg-green-100 text-green-800' :
                                                                            receipt.confidence > 0.6 ? 'bg-yellow-100 text-yellow-800' :
                                                                                'bg-red-100 text-red-800'}`, children: [Math.round(receipt.confidence * 100), "%"] }), _jsxs("div", { className: "flex space-x-1", children: [_jsx("button", { onClick: () => { }, className: "p-1 text-gray-400 hover:text-blue-600", title: "Edit receipt", children: _jsx(Edit, { className: "w-4 h-4" }) }), _jsx("button", { onClick: () => { }, className: "p-1 text-gray-400 hover:text-red-600", title: "Delete receipt", children: _jsx(Trash2, { className: "w-4 h-4" }) })] })] })] }), _jsxs("div", { className: "text-lg font-bold text-gray-900", children: ["$", Number(receipt.amount || 0).toFixed(2)] }), _jsx("div", { className: "text-sm text-gray-500 mt-1", children: receipt.date ? new Date(receipt.date).toLocaleDateString() : 'No date' }), receipt.items && receipt.items.length > 0 && (_jsxs("div", { className: "mt-2", children: [_jsx("div", { className: "text-xs font-medium text-gray-700 mb-1", children: "Items:" }), receipt.items.slice(0, 2).map((item, index) => (_jsxs("div", { className: "text-xs text-gray-600 flex justify-between", children: [_jsx("span", { className: "truncate", children: item.description }), _jsxs("span", { className: "ml-2 font-medium", children: ["$", Number(item.totalPrice || 0).toFixed(2)] })] }, index))), receipt.items.length > 2 && (_jsxs("div", { className: "text-xs text-gray-500", children: ["+", receipt.items.length - 2, " more items"] }))] })), _jsx("div", { className: "mt-3 pt-2 border-t border-gray-100", children: _jsxs("div", { className: "flex items-center justify-between text-xs text-gray-500", children: [_jsxs("span", { children: ["OCR Engine: ", receipt.metadata?.engine || 'Unknown'] }), _jsx("span", { children: receipt.metadata?.processingTime ? `${receipt.metadata.processingTime}ms` : '' })] }) })] }, receipt.id))) })) : (_jsxs("div", { className: "text-center py-8", children: [_jsx(Receipt, { className: "mx-auto h-12 w-12 text-gray-400" }), _jsx("p", { className: "mt-2 text-sm text-gray-500", children: "No processed receipts yet" })] })) })] })] })), activeTab === 'ai-create' && (_jsx("div", { className: "space-y-6", children: _jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900", children: "Create Invoice with Natural Language" }), _jsx("div", { className: "text-sm text-gray-500", children: "Company context is taken from your selection" })] }), _jsx(NaturalLanguageInvoice, { onInvoiceCreated: () => {
                                        setActiveTab('invoices');
                                        queryClient.invalidateQueries({ queryKey: ['recentInvoices', companyId] });
                                    } })] }) })), activeTab === 'invoices' && (_jsx("div", { className: "space-y-6", children: _jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900", children: "AI-Powered Invoice Creation" }), _jsxs("div", { className: "flex space-x-2", children: [_jsxs("button", { onClick: () => setActiveTab('receipts'), className: "bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700", children: [_jsx(FileText, { className: "w-4 h-4 inline mr-2" }), "From Receipt"] }), _jsxs("button", { onClick: () => setShowInvoiceDialog(true), className: "bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700", children: [_jsx(Plus, { className: "w-4 h-4 inline mr-2" }), "Create New"] })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6 mb-6", children: [_jsxs("div", { onClick: () => setShowAIDialog(true), className: "border border-gray-200 rounded-lg p-6 hover:border-teal-300 cursor-pointer transition-colors", children: [_jsxs("div", { className: "flex items-center mb-3", children: [_jsx("div", { className: "p-2 bg-blue-100 rounded-lg mr-3", children: _jsx(MessageSquare, { className: "h-5 w-5 text-blue-600" }) }), _jsx("h3", { className: "font-semibold text-gray-900", children: "Natural Language" })] }), _jsx("p", { className: "text-sm text-gray-600 mb-4", children: "Describe your invoice in plain English and let AI create it for you" }), _jsx("div", { className: "text-xs text-gray-500", children: "Example: \"Create an invoice for web development services to a client\"" })] }), _jsxs("div", { className: "border border-gray-200 rounded-lg p-6 hover:border-teal-300 cursor-pointer transition-colors", children: [_jsxs("div", { className: "flex items-center mb-3", children: [_jsx("div", { className: "p-2 bg-green-100 rounded-lg mr-3", children: _jsx(Bot, { className: "h-5 w-5 text-green-600" }) }), _jsx("h3", { className: "font-semibold text-gray-900", children: "AI Chat Assistant" })] }), _jsx("p", { className: "text-sm text-gray-600 mb-4", children: "Have a conversation with AI to build your invoice step by step" }), _jsx("div", { className: "text-xs text-gray-500", children: "Interactive chat interface for complex invoices" })] })] }), _jsxs("div", { className: "mb-6", children: [_jsx("h3", { className: "text-md font-semibold text-gray-900 mb-4", children: "Invoice Templates" }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: invoiceTemplates?.data?.map((template) => (_jsxs("div", { className: "border rounded-lg p-4 hover:border-teal-300 cursor-pointer", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("h4", { className: "font-medium text-gray-900", children: template.name }), _jsx("span", { className: "text-xs bg-green-100 text-green-800 px-2 py-1 rounded", children: "Active" })] }), _jsx("p", { className: "text-sm text-gray-600", children: template.description })] }, template.id))) })] }), _jsxs("div", { className: "border-t pt-6", children: [_jsx("h3", { className: "text-md font-semibold text-gray-900 mb-4", children: "Recent Invoices" }), invoicesLoading ? (_jsxs("div", { className: "text-center py-8", children: [_jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto" }), _jsx("p", { className: "mt-2 text-sm text-gray-500", children: "Loading invoices..." })] })) : recentInvoices?.data?.length > 0 ? (_jsx("div", { className: "space-y-3", children: recentInvoices.data.map((invoice) => (_jsxs("div", { className: "flex items-center justify-between p-3 bg-gray-50 rounded-lg", children: [_jsxs("div", { children: [_jsx("div", { className: "font-medium text-gray-900", children: invoice.invoiceNumber }), _jsxs("div", { className: "text-sm text-gray-600", children: [invoice.customer?.name || 'Unknown Customer', " - $", Number(invoice.totalAmount).toFixed(2)] }), _jsx("div", { className: "text-xs text-gray-500", children: new Date(invoice.issueDate).toLocaleDateString() })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("span", { className: `text-xs px-2 py-1 rounded ${invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                                                                    invoice.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                                                                        invoice.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                                                                            'bg-gray-100 text-gray-800'}`, children: invoice.status?.charAt(0).toUpperCase() + invoice.status?.slice(1) }), _jsx("button", { className: "text-blue-600 hover:text-blue-800", children: _jsx(Eye, { className: "h-4 w-4" }) })] })] }, invoice.id))) })) : (_jsxs("div", { className: "text-center py-8", children: [_jsx(FileSpreadsheet, { className: "mx-auto h-12 w-12 text-gray-400" }), _jsx("p", { className: "mt-2 text-sm text-gray-500", children: "No invoices created yet" }), _jsx("p", { className: "text-xs text-gray-400", children: "Create your first invoice using the AI-powered tools above" })] }))] })] }) })), activeTab === 'vendors' && (_jsxs("div", { className: "space-y-6", children: [vendors?.data && vendors.data.length > 0 && (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4 mb-6", children: [_jsx("div", { className: "bg-white rounded-lg shadow p-4", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "p-2 bg-blue-100 rounded-lg", children: _jsx(Building2, { className: "w-5 h-5 text-blue-600" }) }), _jsxs("div", { className: "ml-3", children: [_jsx("p", { className: "text-sm font-medium text-gray-500", children: "Total Vendors" }), _jsx("p", { className: "text-2xl font-bold text-gray-900", children: vendors.data.length })] })] }) }), _jsx("div", { className: "bg-white rounded-lg shadow p-4", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "p-2 bg-green-100 rounded-lg", children: _jsx(DollarSign, { className: "w-5 h-5 text-green-600" }) }), _jsxs("div", { className: "ml-3", children: [_jsx("p", { className: "text-sm font-medium text-gray-500", children: "Total Spent" }), _jsxs("p", { className: "text-2xl font-bold text-gray-900", children: ["$", vendors.data.reduce((sum, v) => sum + (v.insights?.totalAmount || 0), 0).toFixed(2)] })] })] }) }), _jsx("div", { className: "bg-white rounded-lg shadow p-4", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "p-2 bg-purple-100 rounded-lg", children: _jsx(Target, { className: "w-5 h-5 text-purple-600" }) }), _jsxs("div", { className: "ml-3", children: [_jsx("p", { className: "text-sm font-medium text-gray-500", children: "Active Vendors" }), _jsx("p", { className: "text-2xl font-bold text-gray-900", children: vendors.data.filter((v) => (v.insights?.transactionCount || 0) > 0).length })] })] }) }), _jsx("div", { className: "bg-white rounded-lg shadow p-4", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "p-2 bg-orange-100 rounded-lg", children: _jsx(Receipt, { className: "w-5 h-5 text-orange-600" }) }), _jsxs("div", { className: "ml-3", children: [_jsx("p", { className: "text-sm font-medium text-gray-500", children: "Total Transactions" }), _jsx("p", { className: "text-2xl font-bold text-gray-900", children: vendors.data.reduce((sum, v) => sum + (v.insights?.transactionCount || 0), 0) })] })] }) })] })), _jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900", children: "Vendor Management" }), _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx(Search, { className: "w-4 h-4 text-gray-400" }), _jsx("input", { type: "text", placeholder: "Search vendors...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "border border-gray-300 rounded-md px-3 py-1 text-sm" }), _jsxs("button", { onClick: handleCreateVendor, className: "bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 flex items-center space-x-2 text-sm whitespace-nowrap", children: [_jsx(Plus, { className: "w-4 h-4" }), _jsx("span", { children: "Add Vendor" })] })] })] }), vendorsLoading ? (_jsxs("div", { className: "text-center py-8", children: [_jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto" }), _jsx("p", { className: "mt-2 text-sm text-gray-500", children: "Loading vendors..." })] })) : vendors?.data?.length > 0 ? (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: vendors.data.map((vendor) => (_jsxs("div", { className: "border rounded-lg p-4 hover:shadow-md transition-shadow", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsx("h3", { className: "font-medium text-gray-900", children: vendor.name }), _jsx("span", { className: `text-xs px-2 py-1 rounded ${vendor.insights?.frequency === 'frequent'
                                                                ? 'bg-green-100 text-green-800'
                                                                : vendor.insights?.frequency === 'occasional'
                                                                    ? 'bg-yellow-100 text-yellow-800'
                                                                    : 'bg-gray-100 text-gray-800'}`, children: vendor.insights?.frequency })] }), _jsxs("div", { className: "text-sm text-gray-600 space-y-2", children: [_jsxs("div", { className: "grid grid-cols-2 gap-2", children: [_jsxs("div", { children: [_jsx("span", { className: "text-gray-500", children: "Receipts:" }), _jsx("span", { className: "ml-1 font-medium", children: vendor.insights?.receiptCount || 0 })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-500", children: "Invoices:" }), _jsx("span", { className: "ml-1 font-medium", children: vendor.insights?.invoiceCount || 0 })] })] }), _jsxs("div", { className: "border-t pt-2", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-500", children: "Total:" }), _jsxs("span", { className: "font-medium", children: ["$", vendor.insights?.totalAmount?.toFixed(2) || '0.00'] })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-500", children: "Avg:" }), _jsxs("span", { className: "font-medium", children: ["$", vendor.insights?.averageAmount?.toFixed(2) || '0.00'] })] })] }), vendor.insights?.lastActivity && (_jsxs("div", { className: "text-xs text-gray-500 pt-1 border-t", children: ["Last activity: ", new Date(vendor.insights.lastActivity).toLocaleDateString()] }))] }), _jsxs("div", { className: "mt-3 pt-2 border-t", children: [_jsxs("div", { className: "flex items-center justify-between text-xs", children: [_jsx("span", { className: "text-gray-500", children: "Contact:" }), _jsx("span", { className: "text-gray-700", children: vendor.email || 'No email' })] }), vendor.phone && (_jsxs("div", { className: "flex items-center justify-between text-xs mt-1", children: [_jsx("span", { className: "text-gray-500", children: "Phone:" }), _jsx("span", { className: "text-gray-700", children: vendor.phone })] }))] }), _jsxs("div", { className: "mt-3 pt-3 border-t flex space-x-2", children: [_jsxs("button", { onClick: () => handleEditVendor(vendor), className: "flex-1 text-xs text-teal-600 hover:text-teal-800 py-1.5 px-2 border border-teal-200 rounded hover:bg-teal-50 flex items-center justify-center space-x-1", title: "Edit vendor", children: [_jsx(Edit, { className: "w-3 h-3" }), _jsx("span", { children: "Edit" })] }), _jsxs("button", { onClick: () => handleDeleteVendor(vendor), className: "flex-1 text-xs text-red-600 hover:text-red-800 py-1.5 px-2 border border-red-200 rounded hover:bg-red-50 flex items-center justify-center space-x-1", title: "Delete vendor", children: [_jsx(Trash2, { className: "w-3 h-3" }), _jsx("span", { children: "Delete" })] })] })] }, vendor.id))) })) : (_jsxs("div", { className: "text-center py-8", children: [_jsx(Building2, { className: "mx-auto h-12 w-12 text-gray-400" }), _jsx("p", { className: "mt-2 text-sm text-gray-500", children: "No vendors found" })] }))] }), showVendorDialog && (_jsx("div", { className: "fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4", children: _jsxs("div", { className: "bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto", children: [_jsxs("div", { className: "sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between", children: [_jsx("h3", { className: "text-xl font-semibold text-gray-900", children: editingVendor ? 'Edit Vendor' : 'Create New Vendor' }), _jsx("button", { onClick: () => setShowVendorDialog(false), className: "text-gray-400 hover:text-gray-600 p-1", children: _jsx(X, { className: "w-6 h-6" }) })] }), _jsx("div", { className: "px-6 py-6", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { className: "space-y-4", children: [_jsx("h4", { className: "text-lg font-medium text-gray-900 border-b pb-2", children: "Basic Information" }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: ["Vendor Name ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx("input", { type: "text", value: vendorForm.name, onChange: (e) => setVendorForm({ ...vendorForm, name: e.target.value }), className: "w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-teal-500", placeholder: "Enter vendor name" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Email" }), _jsx("input", { type: "email", value: vendorForm.email, onChange: (e) => setVendorForm({ ...vendorForm, email: e.target.value }), className: "w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-teal-500", placeholder: "vendor@example.com" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Phone" }), _jsx("input", { type: "tel", value: vendorForm.phone, onChange: (e) => setVendorForm({ ...vendorForm, phone: e.target.value }), className: "w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-teal-500", placeholder: "+1 (555) 123-4567" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Tax ID" }), _jsx("input", { type: "text", value: vendorForm.taxId, onChange: (e) => setVendorForm({ ...vendorForm, taxId: e.target.value }), className: "w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-teal-500", placeholder: "Tax ID" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Payment Terms" }), _jsx("input", { type: "text", value: vendorForm.paymentTerms, onChange: (e) => setVendorForm({ ...vendorForm, paymentTerms: e.target.value }), className: "w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-teal-500", placeholder: "Net 30" })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsx("h4", { className: "text-lg font-medium text-gray-900 border-b pb-2", children: "Address" }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Street" }), _jsx("input", { type: "text", value: vendorForm.address, onChange: (e) => setVendorForm({ ...vendorForm, address: e.target.value }), className: "w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-teal-500", placeholder: "Street" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "City" }), _jsx("input", { type: "text", value: vendorForm.city, onChange: (e) => setVendorForm({ ...vendorForm, city: e.target.value }), className: "w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-teal-500", placeholder: "City" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "State" }), _jsx("input", { type: "text", value: vendorForm.state, onChange: (e) => setVendorForm({ ...vendorForm, state: e.target.value }), className: "w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-teal-500", placeholder: "State" })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "ZIP" }), _jsx("input", { type: "text", value: vendorForm.zipCode, onChange: (e) => setVendorForm({ ...vendorForm, zipCode: e.target.value }), className: "w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-teal-500", placeholder: "ZIP" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Country" }), _jsx("input", { type: "text", value: vendorForm.country, onChange: (e) => setVendorForm({ ...vendorForm, country: e.target.value }), className: "w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-teal-500", placeholder: "Country" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Notes" }), _jsx("textarea", { value: vendorForm.notes, onChange: (e) => setVendorForm({ ...vendorForm, notes: e.target.value }), className: "w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-teal-500", rows: 3, placeholder: "Notes..." })] })] })] }) }), _jsxs("div", { className: "sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end space-x-3", children: [_jsx("button", { onClick: () => setShowVendorDialog(false), className: "px-5 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50", children: "Cancel" }), _jsx("button", { onClick: handleSaveVendor, disabled: createVendorMutation.isPending || updateVendorMutation.isPending, className: "px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:opacity-50 flex items-center space-x-2", children: createVendorMutation.isPending || updateVendorMutation.isPending ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "animate-spin rounded-full h-4 w-4 border-b-2 border-white" }), _jsx("span", { children: "Saving..." })] })) : (_jsx("span", { children: editingVendor ? 'Update Vendor' : 'Create Vendor' })) })] })] }) })), showVendorDialog && (_jsx("div", { className: "fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4", children: _jsxs("div", { className: "bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto", children: [_jsxs("div", { className: "sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between", children: [_jsx("h3", { className: "text-xl font-semibold text-gray-900", children: editingVendor ? 'Edit Vendor' : 'Create New Vendor' }), _jsx("button", { onClick: () => setShowVendorDialog(false), className: "text-gray-400 hover:text-gray-600 p-1", children: _jsx(X, { className: "w-6 h-6" }) })] }), _jsx("div", { className: "px-6 py-6", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { className: "space-y-4", children: [_jsx("h4", { className: "text-lg font-medium text-gray-900 border-b pb-2", children: "Basic Information" }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: ["Vendor Name ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx("input", { type: "text", value: vendorForm.name, onChange: (e) => setVendorForm({ ...vendorForm, name: e.target.value }), className: "w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-teal-500", placeholder: "Enter vendor name" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Email" }), _jsx("input", { type: "email", value: vendorForm.email, onChange: (e) => setVendorForm({ ...vendorForm, email: e.target.value }), className: "w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-teal-500", placeholder: "vendor@example.com" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Phone" }), _jsx("input", { type: "tel", value: vendorForm.phone, onChange: (e) => setVendorForm({ ...vendorForm, phone: e.target.value }), className: "w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-teal-500", placeholder: "+1 (555) 123-4567" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Tax ID" }), _jsx("input", { type: "text", value: vendorForm.taxId, onChange: (e) => setVendorForm({ ...vendorForm, taxId: e.target.value }), className: "w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-teal-500", placeholder: "Tax ID" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Payment Terms" }), _jsx("input", { type: "text", value: vendorForm.paymentTerms, onChange: (e) => setVendorForm({ ...vendorForm, paymentTerms: e.target.value }), className: "w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-teal-500", placeholder: "Net 30" })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsx("h4", { className: "text-lg font-medium text-gray-900 border-b pb-2", children: "Address" }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Street" }), _jsx("input", { type: "text", value: vendorForm.address, onChange: (e) => setVendorForm({ ...vendorForm, address: e.target.value }), className: "w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-teal-500", placeholder: "Street" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "City" }), _jsx("input", { type: "text", value: vendorForm.city, onChange: (e) => setVendorForm({ ...vendorForm, city: e.target.value }), className: "w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-teal-500", placeholder: "City" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "State" }), _jsx("input", { type: "text", value: vendorForm.state, onChange: (e) => setVendorForm({ ...vendorForm, state: e.target.value }), className: "w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-teal-500", placeholder: "State" })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "ZIP" }), _jsx("input", { type: "text", value: vendorForm.zipCode, onChange: (e) => setVendorForm({ ...vendorForm, zipCode: e.target.value }), className: "w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-teal-500", placeholder: "ZIP" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Country" }), _jsx("input", { type: "text", value: vendorForm.country, onChange: (e) => setVendorForm({ ...vendorForm, country: e.target.value }), className: "w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-teal-500", placeholder: "Country" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Notes" }), _jsx("textarea", { value: vendorForm.notes, onChange: (e) => setVendorForm({ ...vendorForm, notes: e.target.value }), className: "w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-teal-500", rows: 3, placeholder: "Notes..." })] })] })] }) }), _jsxs("div", { className: "sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end space-x-3", children: [_jsx("button", { onClick: () => setShowVendorDialog(false), className: "px-5 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50", children: "Cancel" }), _jsx("button", { onClick: handleSaveVendor, disabled: createVendorMutation.isPending || updateVendorMutation.isPending, className: "px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:opacity-50 flex items-center space-x-2", children: createVendorMutation.isPending || updateVendorMutation.isPending ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "animate-spin rounded-full h-4 w-4 border-b-2 border-white" }), _jsx("span", { children: "Saving..." })] })) : (_jsx("span", { children: editingVendor ? 'Update Vendor' : 'Create Vendor' })) })] })] }) }))] })), activeTab === 'customers' && (_jsx("div", { className: "space-y-6", children: _jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900", children: "Customer Management" }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Search, { className: "w-4 h-4 text-gray-400" }), _jsx("input", { type: "text", placeholder: "Search customers...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "border border-gray-300 rounded-md px-3 py-1 text-sm" })] })] }), customersWithInsightsLoading ? (_jsxs("div", { className: "text-center py-8", children: [_jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto" }), _jsx("p", { className: "mt-2 text-sm text-gray-500", children: "Loading customers..." })] })) : customersWithInsights?.data?.length > 0 ? (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: customersWithInsights.data.map((customer) => (_jsxs("div", { className: "border rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("h3", { className: "font-medium text-gray-900", children: customer.name }), _jsx("span", { className: `text-xs px-2 py-1 rounded ${customer.insights?.status === 'good'
                                                            ? 'bg-green-100 text-green-800'
                                                            : customer.insights?.status === 'fair'
                                                                ? 'bg-yellow-100 text-yellow-800'
                                                                : 'bg-red-100 text-red-800'}`, children: customer.insights?.status })] }), _jsxs("div", { className: "text-sm text-gray-600 space-y-1", children: [_jsxs("div", { children: ["Invoices: ", customer.insights?.invoiceCount] }), _jsxs("div", { children: ["Total: $", customer.insights?.totalAmount?.toFixed(2)] }), _jsxs("div", { children: ["Payment Rate: ", customer.insights?.paymentRate?.toFixed(1), "%"] })] })] }, customer.id))) })) : (_jsxs("div", { className: "text-center py-8", children: [_jsx(Users, { className: "mx-auto h-12 w-12 text-gray-400" }), _jsx("p", { className: "mt-2 text-sm text-gray-500", children: "No customers found" })] }))] }) })), activeTab === 'intelligence' && (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsx("div", { className: "bg-white rounded-lg shadow p-6", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "p-2 bg-blue-100 rounded-lg", children: _jsx(BarChart3, { className: "w-6 h-6 text-blue-600" }) }), _jsxs("div", { className: "ml-4", children: [_jsx("p", { className: "text-sm font-medium text-gray-500", children: "Total Transactions" }), _jsx("p", { className: "text-2xl font-bold text-gray-900", children: transactionStats?.data?.totalTransactions || 0 })] })] }) }), _jsx("div", { className: "bg-white rounded-lg shadow p-6", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "p-2 bg-green-100 rounded-lg", children: _jsx(DollarSign, { className: "w-6 h-6 text-green-600" }) }), _jsxs("div", { className: "ml-4", children: [_jsx("p", { className: "text-sm font-medium text-gray-500", children: "Total Amount" }), _jsxs("p", { className: "text-2xl font-bold text-gray-900", children: ["$", transactionStats?.data?.totalAmount?.toFixed(2) || '0.00'] })] })] }) }), _jsx("div", { className: "bg-white rounded-lg shadow p-6", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "p-2 bg-purple-100 rounded-lg", children: _jsx(Target, { className: "w-6 h-6 text-purple-600" }) }), _jsxs("div", { className: "ml-4", children: [_jsx("p", { className: "text-sm font-medium text-gray-500", children: "Average Amount" }), _jsxs("p", { className: "text-2xl font-bold text-gray-900", children: ["$", transactionStats?.data?.averageAmount?.toFixed(2) || '0.00'] })] })] }) }), _jsx("div", { className: "bg-white rounded-lg shadow p-6", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "p-2 bg-orange-100 rounded-lg", children: _jsx(Calendar, { className: "w-6 h-6 text-orange-600" }) }), _jsxs("div", { className: "ml-4", children: [_jsx("p", { className: "text-sm font-medium text-gray-500", children: "Period" }), _jsxs("p", { className: "text-2xl font-bold text-gray-900", children: [selectedPeriod, " days"] })] })] }) })] }), _jsxs("div", { className: "bg-white rounded-lg shadow", children: [_jsx("div", { className: "px-6 py-4 border-b border-gray-200", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900", children: "AI Recommendations" }), _jsxs("select", { value: selectedPeriod, onChange: (e) => setSelectedPeriod(Number(e.target.value)), className: "border border-gray-300 rounded-md px-3 py-1 text-sm", children: [_jsx("option", { value: 30, children: "Last 30 days" }), _jsx("option", { value: 90, children: "Last 90 days" }), _jsx("option", { value: 180, children: "Last 6 months" }), _jsx("option", { value: 365, children: "Last year" })] })] }) }), _jsx("div", { className: "p-6", children: recommendations?.data?.length > 0 ? (_jsx("div", { className: "space-y-4", children: recommendations.data.map((rec, index) => (_jsxs("div", { className: "border rounded-lg p-4", children: [_jsxs("div", { className: "flex items-start justify-between mb-2", children: [_jsxs("div", { children: [_jsx("h4", { className: "font-medium text-gray-900", children: rec.title }), _jsx("p", { className: "text-sm text-gray-600 mt-1", children: rec.description })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsxs("span", { className: "text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded", children: [Math.round(rec.confidence * 100), "% confidence"] }), _jsxs("span", { className: `text-xs px-2 py-1 rounded ${rec.riskScore > 0.5 ? 'bg-red-100 text-red-800' :
                                                                            rec.riskScore > 0.2 ? 'bg-yellow-100 text-yellow-800' :
                                                                                'bg-green-100 text-green-800'}`, children: ["Risk: ", Math.round(rec.riskScore * 100), "%"] })] })] }), _jsxs("div", { className: "mt-3", children: [_jsx("h5", { className: "text-sm font-medium text-gray-700 mb-2", children: "Recommendations:" }), _jsx("ul", { className: "space-y-1", children: rec.recommendations.map((rec, recIndex) => (_jsxs("li", { className: "text-sm text-gray-600 flex items-start", children: [_jsx(Lightbulb, { className: "w-4 h-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" }), rec] }, recIndex))) })] })] }, index))) })) : (_jsxs("div", { className: "text-center py-8", children: [_jsx(TrendingUp, { className: "mx-auto h-12 w-12 text-gray-400" }), _jsx("p", { className: "mt-2 text-sm text-gray-500", children: "No recommendations available" })] })) })] })] }))] }), showAIDialog && (_jsx("div", { className: "fixed inset-0 bg-black/50 flex items-center justify-center z-50", children: _jsxs("div", { className: "bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900", children: "AI-Powered Invoice Creation" }), _jsx("button", { onClick: () => {
                                        setShowAIDialog(false);
                                        setAiDescription('');
                                        setAiInvoiceData(null);
                                        setSelectedCustomer(null);
                                    }, className: "text-gray-400 hover:text-gray-600", children: _jsx(X, { className: "h-5 w-5" }) })] }), !aiInvoiceData ? (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Describe your invoice" }), _jsx("textarea", { value: aiDescription, onChange: (e) => setAiDescription(e.target.value), placeholder: "Example: Create an invoice for $500 web development services to ABC Company, including 10 hours of frontend development and 5 hours of backend integration", className: "w-full border border-gray-300 rounded-md px-3 py-2 h-24" })] }), _jsxs("div", { className: "flex justify-end space-x-3", children: [_jsx("button", { onClick: () => setShowAIDialog(false), className: "px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50", children: "Cancel" }), _jsx("button", { onClick: () => {
                                                if (aiDescription.trim()) {
                                                    createAIInvoiceMutation.mutate(aiDescription);
                                                }
                                            }, disabled: createAIInvoiceMutation.isPending || !aiDescription.trim(), className: "px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50", children: createAIInvoiceMutation.isPending ? 'Generating...' : 'Generate Invoice' })] })] })) : (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "bg-gray-50 rounded-lg p-4", children: [_jsx("h3", { className: "font-semibold text-gray-900 mb-4", children: "AI Generated Invoice" }), _jsxs("div", { className: "mb-4", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Select Customer from Database" }), _jsxs("select", { value: selectedCustomer?.id || '', onChange: (e) => {
                                                        const customerId = e.target.value;
                                                        if (customerId) {
                                                            const customer = customers?.data?.find((c) => c.id === customerId);
                                                            if (customer) {
                                                                setSelectedCustomer({
                                                                    id: customer.id,
                                                                    name: customer.name,
                                                                    email: customer.email || 'No email'
                                                                });
                                                            }
                                                        }
                                                        else {
                                                            setSelectedCustomer(null);
                                                        }
                                                    }, className: "w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500", children: [_jsx("option", { value: "", children: "Select a customer..." }), customers?.data?.map((customer) => (_jsxs("option", { value: customer.id, children: [customer.name, " ", customer.email ? `(${customer.email})` : ''] }, customer.id)))] })] }), _jsxs("div", { className: "mb-4", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Invoice Items" }), _jsx("div", { className: "space-y-2", children: aiInvoiceData.items?.map((item, index) => (_jsxs("div", { className: "flex justify-between items-center p-2 bg-white rounded border", children: [_jsxs("div", { className: "flex-1", children: [_jsx("div", { className: "font-medium", children: item.description }), _jsxs("div", { className: "text-sm text-gray-600", children: ["Qty: ", item.quantity, " \u00D7 $", item.unitPrice, " = $", (item.quantity * item.unitPrice).toFixed(2)] })] }), _jsxs("div", { className: "text-sm font-medium", children: ["$", (item.quantity * item.unitPrice).toFixed(2)] })] }, index))) })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "Tax Rate:" }), " ", (aiInvoiceData.taxRate * 100).toFixed(1), "%"] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "Payment Terms:" }), " ", aiInvoiceData.paymentTerms] })] }), aiInvoiceData.notes && (_jsxs("div", { className: "mt-4", children: [_jsx("span", { className: "text-gray-600 text-sm", children: "Notes:" }), _jsx("p", { className: "text-sm text-gray-800", children: aiInvoiceData.notes })] }))] }), _jsxs("div", { className: "flex justify-end space-x-3", children: [_jsx("button", { onClick: () => {
                                                setAiDescription('');
                                                setAiInvoiceData(null);
                                                setSelectedCustomer(null);
                                            }, className: "px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50", children: "Start Over" }), _jsx("button", { onClick: () => {
                                                if (selectedCustomer && aiInvoiceData.items) {
                                                    createInvoiceMutation.mutate({
                                                        customerId: selectedCustomer.id,
                                                        items: aiInvoiceData.items.map((item) => ({
                                                            ...item,
                                                            totalPrice: item.quantity * item.unitPrice
                                                        })),
                                                        companyId
                                                    });
                                                }
                                            }, disabled: !selectedCustomer || createInvoiceMutation.isPending, className: "px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:opacity-50", children: createInvoiceMutation.isPending ? 'Creating...' : 'Create Invoice' })] })] }))] }) })), showInvoiceDialog && (_jsx("div", { className: "fixed inset-0 bg-transparent flex items-center justify-center z-50", children: _jsxs("div", { className: "bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900", children: "Create New Invoice" }), _jsx("button", { onClick: () => setShowInvoiceDialog(false), className: "text-gray-400 hover:text-gray-600", children: _jsx(X, { className: "h-5 w-5" }) })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Customer" }), _jsxs("select", { value: invoiceForm.customerId, onChange: (e) => setInvoiceForm(prev => ({ ...prev, customerId: e.target.value })), className: "w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500", children: [_jsx("option", { value: "", children: "Select a customer..." }), customers?.data?.map((customer) => (_jsxs("option", { value: customer.id, children: [customer.name, " ", customer.email ? `(${customer.email})` : ''] }, customer.id)))] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Items" }), invoiceForm.items.map((item, index) => (_jsxs("div", { className: "flex space-x-2 mb-2", children: [_jsx("input", { type: "text", placeholder: "Description", value: item.description, onChange: (e) => {
                                                        const newItems = [...invoiceForm.items];
                                                        newItems[index].description = e.target.value;
                                                        setInvoiceForm(prev => ({ ...prev, items: newItems }));
                                                    }, className: "flex-1 border border-gray-300 rounded-md px-3 py-2" }), _jsx("input", { type: "number", placeholder: "Qty", value: item.quantity, onChange: (e) => {
                                                        const newItems = [...invoiceForm.items];
                                                        newItems[index].quantity = parseInt(e.target.value) || 0;
                                                        setInvoiceForm(prev => ({ ...prev, items: newItems }));
                                                    }, className: "w-20 border border-gray-300 rounded-md px-3 py-2" }), _jsx("input", { type: "number", placeholder: "Price", value: item.unitPrice, onChange: (e) => {
                                                        const newItems = [...invoiceForm.items];
                                                        newItems[index].unitPrice = parseFloat(e.target.value) || 0;
                                                        setInvoiceForm(prev => ({ ...prev, items: newItems }));
                                                    }, className: "w-24 border border-gray-300 rounded-md px-3 py-2" }), _jsx("button", { onClick: () => {
                                                        const newItems = invoiceForm.items.filter((_, i) => i !== index);
                                                        setInvoiceForm(prev => ({ ...prev, items: newItems }));
                                                    }, className: "text-red-600 hover:text-red-800", children: _jsx(Trash2, { className: "h-4 w-4" }) })] }, index))), _jsx("button", { onClick: () => {
                                                setInvoiceForm(prev => ({
                                                    ...prev,
                                                    items: [...prev.items, { description: '', quantity: 1, unitPrice: 0 }]
                                                }));
                                            }, className: "text-teal-600 hover:text-teal-800 text-sm", children: "+ Add Item" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Template" }), _jsxs("select", { value: invoiceForm.templateId, onChange: (e) => setInvoiceForm(prev => ({ ...prev, templateId: e.target.value })), className: "w-full border border-gray-300 rounded-md px-3 py-2", children: [_jsx("option", { value: "", children: "Select template (optional)" }), invoiceTemplates?.data?.map((template) => (_jsx("option", { value: template.id, children: template.name }, template.id)))] })] }), _jsxs("div", { className: "flex justify-end space-x-3 pt-4", children: [_jsx("button", { onClick: () => setShowInvoiceDialog(false), className: "px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50", children: "Cancel" }), _jsx("button", { onClick: () => {
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
                                            }, disabled: createInvoiceMutation.isPending || !invoiceForm.customerId || invoiceForm.items.length === 0, className: "px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:opacity-50", children: createInvoiceMutation.isPending ? 'Creating...' : 'Create Invoice' })] })] })] }) }))] }));
};
