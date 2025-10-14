import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// Helper function to compare dates without time component
const isDateBeforeToday = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    return compareDate < today;
};
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { PageLayout } from "../components/page-layout";
import { Plus, Search, Filter, Eye, Edit, Send, Download, FileText, Users, Calculator, RefreshCw, CreditCard, CheckCircle, XCircle, MessageSquare, Bot, Calendar, ShoppingCart, X, Link, Loader2 } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import apiService from "../lib/api";
import { useAuth } from "../contexts/auth-context";
import { useDemoAuth } from "../hooks/useDemoAuth";
import { getCompanyId } from "../lib/config";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { PaymentButtonCompact } from "../components/payment-button";
import { InvoiceTemplate } from "../components/invoice-template";
import { Textarea } from "../components/ui/textarea";
import { NaturalLanguageInvoice } from "../components/natural-language-invoice";
import { AIAccountingChat } from "../components/ai-accounting-chat";
import { AccountingIntegrationStatus } from "../components/accounting-integration-status";
import { InvoicePDFGenerator } from "../lib/invoice-pdf-generator";
import { EnhancedRecurringInvoiceForm } from "../components/enhanced-recurring-invoice-form";
// Utility function to ensure SelectItem values are never empty
const safeSelectValue = (value) => {
    if (!value || value.trim() === '') {
        return 'placeholder-value-' + Math.random().toString(36).substr(2, 9);
    }
    return value.trim();
};
// Helper function to format date for HTML date input
const formatDateForInput = (dateString) => {
    if (!dateString)
        return "";
    try {
        // Handle different date formats
        const date = new Date(dateString);
        if (isNaN(date.getTime()))
            return "";
        return date.toISOString().slice(0, 10);
    }
    catch {
        return "";
    }
};
export default function SalesPage() {
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const { ready: demoAuthReady } = useDemoAuth('sales-page');
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [mounted, setMounted] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState(getCompanyId());
    // Listen for company changes from header
    useEffect(() => {
        const handleStorageChange = () => {
            const newCompanyId = getCompanyId();
            if (newCompanyId && newCompanyId !== selectedCompany) {
                console.log('🔄 Sales page - Company changed from', selectedCompany, 'to', newCompanyId);
                setSelectedCompany(newCompanyId);
            }
        };
        // Listen for localStorage changes
        window.addEventListener('storage', handleStorageChange);
        // Also listen for custom events (in case localStorage doesn't trigger)
        const handleCompanyChange = (e) => {
            const newCompanyId = e.detail.companyId;
            if (newCompanyId && newCompanyId !== selectedCompany) {
                console.log('🔄 Sales page - Company changed via custom event from', selectedCompany, 'to', newCompanyId);
                setSelectedCompany(newCompanyId);
            }
        };
        window.addEventListener('companyChanged', handleCompanyChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('companyChanged', handleCompanyChange);
        };
    }, [selectedCompany]);
    const [invoices, setInvoices] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [estimates, setEstimates] = useState([]);
    const [recurringInvoices, setRecurringInvoices] = useState([]);
    // Defensive wrapper for setCustomers to ensure it's always an array
    const setCustomersSafe = (newCustomers) => {
        const safeCustomers = Array.isArray(newCustomers) ? newCustomers : [];
        setCustomers(safeCustomers);
    };
    const [customerDialogOpen, setCustomerDialogOpen] = useState(false);
    // Helper function to generate PDF using frontend generator
    const generateInvoicePDF = async (invoice, action = 'download') => {
        try {
            const customer = customers.find(c => c.id === invoice.customerId);
            const generator = new InvoicePDFGenerator({
                invoice: {
                    id: invoice.id,
                    invoiceNumber: invoice.invoiceNumber,
                    issueDate: invoice.issueDate,
                    dueDate: invoice.dueDate,
                    status: invoice.status,
                    totalAmount: invoice.totalAmount,
                    balanceDue: invoice.balanceDue,
                    currency: customer?.currency || 'USD',
                    subtotal: invoice.subtotal || invoice.totalAmount,
                    taxAmount: invoice.taxAmount || 0,
                    discountAmount: invoice.discountAmount || 0,
                    customer: customer ? {
                        name: customer.name,
                        email: customer.email,
                        address: customer.address,
                        phone: customer.phone,
                        taxId: customer.taxId
                    } : undefined,
                    lines: invoice.lines || [],
                    notes: invoice.notes,
                    paymentUrl: invoice.paymentUrl
                },
                company: {
                    name: getCompanyData()?.name || 'Your Company',
                    logoUrl: getCompanyData()?.logoUrl,
                    primaryColor: getCompanyData()?.primaryColor || '#009688',
                    secondaryColor: getCompanyData()?.secondaryColor || '#1565c0',
                    address: getCompanyData()?.address,
                    city: getCompanyData()?.city,
                    state: getCompanyData()?.state,
                    postalCode: getCompanyData()?.postalCode,
                    email: getCompanyData()?.email,
                    phone: getCompanyData()?.phone,
                    website: getCompanyData()?.website,
                    fontFamily: getCompanyData()?.fontFamily || 'Inter'
                }
            });
            if (action === 'download') {
                await generator.download();
                toast({
                    title: "PDF Downloaded",
                    description: `Invoice ${invoice.invoiceNumber} has been downloaded successfully.`
                });
            }
            else {
                const blob = await generator.generate();
                const url = URL.createObjectURL(blob);
                window.open(url, '_blank');
                setTimeout(() => URL.revokeObjectURL(url), 30000);
            }
        }
        catch (error) {
            console.error('Error generating PDF:', error);
            toast({
                title: "PDF Generation Failed",
                description: "There was an error generating the PDF. Please try again.",
                variant: "destructive"
            });
            // Fallback to backend API
            try {
                const blob = await apiService.getInvoicePdf(invoice.id);
                const url = URL.createObjectURL(blob);
                if (action === 'download') {
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `invoice-${invoice.invoiceNumber}.pdf`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                }
                else {
                    window.open(url, '_blank');
                }
                setTimeout(() => URL.revokeObjectURL(url), 30000);
            }
            catch (backendError) {
                console.error('Backend PDF generation also failed:', backendError);
            }
        }
    };
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [customerForm, setCustomerForm] = useState({ name: "", email: "", currency: 'USD' });
    const [customerSaving, setCustomerSaving] = useState(false);
    const [customerError, setCustomerError] = useState(null);
    const [invoiceSearch, setInvoiceSearch] = useState("");
    const [customerSearch, setCustomerSearch] = useState("");
    const [invoicePage, setInvoicePage] = useState(1);
    const [invoicePageSize, setInvoicePageSize] = useState(10);
    const [customerPage, setCustomerPage] = useState(1);
    const [customerPageSize, setCustomerPageSize] = useState(1000);
    const [estimateSearch, setEstimateSearch] = useState("");
    const [estimatePage, setEstimatePage] = useState(1);
    const [estimatePageSize, setEstimatePageSize] = useState(10);
    const [recurringPage, setRecurringPage] = useState(1);
    const [recurringPageSize, setRecurringPageSize] = useState(10);
    const [recurringSearch, setRecurringSearch] = useState("");
    const [recurringStatus, setRecurringStatus] = useState("");
    const [selectedRecurring, setSelectedRecurring] = useState(null);
    const [recurringDetailsOpen, setRecurringDetailsOpen] = useState(false);
    const [recurringHistory, setRecurringHistory] = useState([]);
    const [recurringHistoryLoading, setRecurringHistoryLoading] = useState(false);
    const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
    const [invoiceSaving, setInvoiceSaving] = useState(false);
    const [invoiceError, setInvoiceError] = useState(null);
    const [invoiceForm, setInvoiceForm] = useState({ customerId: "", invoiceNumber: "", currency: 'USD', issueDate: new Date().toISOString().slice(0, 10), dueDate: "", discountMode: 'amount', discount: 0, shipping: 0, taxMode: 'per_line', globalTaxRate: 0, lines: [{ description: "", quantity: 1, unitPrice: 0, taxRate: 0, productId: "" }], subtotal: 0, taxTotal: 0, totalAmount: 0, notes: "", terms: "Payment due within 30 days", paymentTerms: "Net 30" });
    const [estimateDialogOpen, setEstimateDialogOpen] = useState(false);
    const [estimateSaving, setEstimateSaving] = useState(false);
    const [estimateError, setEstimateError] = useState(null);
    const [estimateForm, setEstimateForm] = useState({ customerId: "", estimateNumber: "", issueDate: new Date().toISOString().slice(0, 10), expiryDate: "", currency: 'USD', notes: "", terms: "", lines: [{ description: "", quantity: 1, unitPrice: 0, taxRate: 0 }] });
    // Estimate view/edit state
    const [estimateViewDialogOpen, setEstimateViewDialogOpen] = useState(false);
    const [estimateEditDialogOpen, setEstimateEditDialogOpen] = useState(false);
    const [selectedEstimate, setSelectedEstimate] = useState(null);
    const [estimateViewLoading, setEstimateViewLoading] = useState(false);
    const [estimateEditForm, setEstimateEditForm] = useState({ customerId: "", estimateNumber: "", issueDate: new Date().toISOString().slice(0, 10), expiryDate: "", currency: 'USD', notes: "", terms: "", lines: [{ description: "", quantity: 1, unitPrice: 0, taxRate: 0 }] });
    const recalcTotals = (lines, discount = invoiceForm.discount, shipping = invoiceForm.shipping, taxMode = invoiceForm.taxMode, globalTaxRate = invoiceForm.globalTaxRate, discountMode = invoiceForm.discountMode) => {
        const lineSubtotal = lines.reduce((sum, l) => {
            const gross = l.quantity * l.unitPrice;
            const ld = Math.max(0, Math.min(gross, l.lineDiscount || 0));
            return sum + (gross - ld);
        }, 0);
        const discountAmt = discountMode === 'percent' ? Math.max(0, Math.min(100, discount)) * lineSubtotal / 100 : Math.max(0, Math.min(discount, lineSubtotal));
        const taxableBase = Math.max(0, lineSubtotal - discountAmt);
        const lineTax = taxMode === 'per_line'
            ? lines.reduce((sum, l) => sum + (l.quantity * l.unitPrice * (l.taxRate || 0) / 100), 0)
            : taxableBase * (globalTaxRate || 0) / 100;
        const subtotal = taxableBase;
        const taxTotal = lineTax;
        const totalAmount = subtotal + taxTotal + (shipping || 0);
        return { subtotal, taxTotal, totalAmount };
    };
    const recalcRecurringTotals = (lines) => {
        const subtotal = lines.reduce((sum, l) => sum + (l.quantity * l.unitPrice), 0);
        const taxTotal = lines.reduce((sum, l) => sum + (l.quantity * l.unitPrice * (l.taxRate || 0) / 100), 0);
        const totalAmount = subtotal + taxTotal;
        return { subtotal, taxTotal, totalAmount };
    };
    const [products, setProducts] = useState([]);
    const [autoConvertPrices, setAutoConvertPrices] = useState(true);
    const [lastPriceCurrency, setLastPriceCurrency] = useState('USD');
    const [exchangeRate, setExchangeRate] = useState(1);
    const [lockRate, setLockRate] = useState(false);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [detailsInvoice, setDetailsInvoice] = useState(null);
    const [detailsPdfUrl, setDetailsPdfUrl] = useState(null);
    // Recurring invoice dialog state
    const [recurringDialogOpen, setRecurringDialogOpen] = useState(false);
    const [editingRecurring, setEditingRecurring] = useState(null);
    const [recurringSaving, setRecurringSaving] = useState(false);
    const [recurringError, setRecurringError] = useState(null);
    const [recurringForm, setRecurringForm] = useState({
        customerId: "",
        name: "",
        description: "",
        frequency: 'monthly',
        interval: 1,
        startDate: new Date().toISOString().slice(0, 10),
        endDate: "",
        currency: 'USD',
        notes: "",
        terms: "",
        dueDateOffset: 30,
        autoSend: false,
        emailTemplate: "",
        // Advanced Scheduling
        dayOfWeek: undefined,
        dayOfMonth: undefined,
        businessDaysOnly: false,
        skipHolidays: false,
        timezone: "UTC",
        // Conditional Logic
        skipIfOutstandingBalance: false,
        maxOutstandingAmount: undefined,
        skipIfCustomerInactive: false,
        requireApproval: false,
        approvalWorkflowId: undefined,
        // Email Settings
        ccEmails: [],
        bccEmails: [],
        reminderDays: [],
        lines: [{ description: "", quantity: 1, unitPrice: 0, taxRate: 0 }],
        subtotal: 0,
        taxTotal: 0,
        totalAmount: 0
    });
    const [detailsPayLink, setDetailsPayLink] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [detailsStatus, setDetailsStatus] = useState('draft');
    const [detailsDueDate, setDetailsDueDate] = useState('');
    const [detailsSaving, setDetailsSaving] = useState(false);
    const [detailsActivity, setDetailsActivity] = useState([]);
    // Send Invoice PDF modal state
    const [sendEmailOpen, setSendEmailOpen] = useState(false);
    const [sendEmailInvoiceId, setSendEmailInvoiceId] = useState(null);
    const [sendEmailTo, setSendEmailTo] = useState("");
    const [sendEmailLoading, setSendEmailLoading] = useState(false);
    // Credit note dialog state
    const [creditDialogOpen, setCreditDialogOpen] = useState(false);
    const [creditReason, setCreditReason] = useState('Customer return');
    const [creditInvoiceId, setCreditInvoiceId] = useState(null);
    // Default reset shape for recurring form (ensures all required fields are present)
    const defaultRecurringForm = {
        customerId: "",
        name: "",
        description: "",
        frequency: 'monthly',
        interval: 1,
        startDate: new Date().toISOString().slice(0, 10),
        endDate: "",
        currency: 'USD',
        notes: "",
        terms: "",
        dueDateOffset: 30,
        autoSend: false,
        emailTemplate: "",
        // Advanced Scheduling
        dayOfWeek: undefined,
        dayOfMonth: undefined,
        businessDaysOnly: false,
        skipHolidays: false,
        timezone: "UTC",
        // Conditional Logic
        skipIfOutstandingBalance: false,
        maxOutstandingAmount: undefined,
        skipIfCustomerInactive: false,
        requireApproval: false,
        approvalWorkflowId: undefined,
        // Email Settings
        ccEmails: [],
        bccEmails: [],
        reminderDays: [],
        // Lines and totals
        lines: [{ description: "", quantity: 1, unitPrice: 0, taxRate: 0 }],
        subtotal: 0,
        taxTotal: 0,
        totalAmount: 0
    };
    const prevLinesConvert = (lines, rate) => {
        return lines.map(l => ({ ...l, unitPrice: (l.unitPrice || 0) * (rate || 1), lineDiscount: (l.lineDiscount || 0) * (rate || 1) }));
    };
    const formatCurrency = (amount, currency) => {
        const amt = Number(amount) || 0;
        try {
            return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(amt);
        }
        catch {
            try {
                return `$${amt.toFixed(2)}`;
            }
            catch {
                return `$${amt}`;
            }
        }
    };
    const qc = useQueryClient();
    // Best-practice validity check for recurring invoice form
    const isRecurringFormValid = (f) => {
        const hasBasics = Boolean(f.name && f.name.trim() && f.customerId && f.startDate && f.frequency);
        const hasLines = Array.isArray(f.lines) && f.lines.length > 0;
        const linesOk = hasLines && f.lines.every(l => {
            const q = Number(l.quantity);
            const p = Number(l.unitPrice);
            const t = Number(l.taxRate);
            return !Number.isNaN(q) && q >= 0 && !Number.isNaN(p) && p >= 0 && !Number.isNaN(t) && t >= 0 && t <= 100;
        });
        return hasBasics && hasLines && linesOk;
    };
    // Fetch companies for the company selector
    const companiesQuery = useQuery({
        queryKey: ['companies'],
        queryFn: () => apiService.getCompanies(),
        enabled: (isAuthenticated || demoAuthReady) && !authLoading,
        staleTime: 5 * 60 * 1000
    });
    // Helper function to get company data
    const getCompanyData = () => {
        const companies = companiesQuery.data;
        if (Array.isArray(companies)) {
            return companies.find((c) => c.id === selectedCompany);
        }
        return null;
    };
    // Initialize company selection from localStorage or default
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedCompanyId = localStorage.getItem('company_id');
            if (storedCompanyId) {
                setSelectedCompany(storedCompanyId);
            }
        }
    }, []);
    // Update localStorage when company changes
    useEffect(() => {
        if (typeof window !== 'undefined' && selectedCompany) {
            localStorage.setItem('company_id', selectedCompany);
        }
    }, [selectedCompany]);
    const createRecurringInvoiceMutation = useMutation({
        mutationFn: (data) => {
            return apiService.createRecurringInvoice({ ...data, companyId: selectedCompany });
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['recurring-invoices'] });
            setRecurringDialogOpen(false);
            setRecurringForm({ ...defaultRecurringForm, startDate: new Date().toISOString().slice(0, 10) });
            setEditingRecurring(null);
        }
    });
    const updateRecurringInvoiceMutation = useMutation({
        mutationFn: ({ id, data }) => {
            return apiService.updateRecurringInvoice(id, data);
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['recurring-invoices'] });
            setRecurringDialogOpen(false);
            setRecurringForm({ ...defaultRecurringForm, startDate: new Date().toISOString().slice(0, 10) });
            setEditingRecurring(null);
        }
    });
    // Update recurring invoice status
    const updateRecurringStatusMutation = useMutation({
        mutationFn: ({ id, status }) => {
            return apiService.updateRecurringInvoiceStatus(id, status);
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['recurring-invoices'] });
            toast({ title: "Success", description: "Recurring invoice status updated" });
        },
        onError: (error) => {
            toast({ title: "Error", description: error?.message || "Failed to update status", variant: "destructive" });
        }
    });
    // Generate invoice from recurring template
    const generateRecurringMutation = useMutation({
        mutationFn: (id) => {
            return apiService.generateInvoiceFromRecurring(id);
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['recurring-invoices'] });
            qc.invalidateQueries({ queryKey: ['invoices'] });
            toast({ title: "Success", description: "Invoice generated successfully" });
        },
        onError: (error) => {
            toast({ title: "Error", description: error?.message || "Failed to generate invoice", variant: "destructive" });
        }
    });
    // Load recurring invoice history
    const loadRecurringHistory = async (id) => {
        setRecurringHistoryLoading(true);
        try {
            const response = await apiService.getRecurringInvoiceHistory(id);
            setRecurringHistory(response.invoices);
        }
        catch (error) {
            toast({ title: "Error", description: "Failed to load invoice history", variant: "destructive" });
        }
        finally {
            setRecurringHistoryLoading(false);
        }
    };
    // Handler functions
    const handleEditRecurring = (recurring) => {
        setEditingRecurring(recurring);
        setRecurringForm({
            customerId: recurring.customerId,
            name: recurring.name,
            description: recurring.description || '',
            frequency: recurring.frequency,
            interval: recurring.interval,
            startDate: (recurring.startDate || '').slice(0, 10),
            endDate: recurring.endDate ? recurring.endDate.slice(0, 10) : '',
            currency: recurring.currency,
            notes: recurring.notes || '',
            terms: recurring.terms || '',
            dueDateOffset: recurring.dueDateOffset,
            autoSend: recurring.autoSend,
            emailTemplate: recurring.emailTemplate || '',
            // Advanced Scheduling defaults (not stored yet)
            dayOfWeek: undefined,
            dayOfMonth: undefined,
            businessDaysOnly: false,
            skipHolidays: false,
            timezone: 'UTC',
            // Conditional Logic defaults
            skipIfOutstandingBalance: false,
            maxOutstandingAmount: undefined,
            skipIfCustomerInactive: false,
            requireApproval: false,
            approvalWorkflowId: undefined,
            // Email Settings defaults
            ccEmails: [],
            bccEmails: [],
            reminderDays: [],
            lines: recurring.lines?.map(line => ({
                description: line.description || '',
                quantity: Number(line.quantity),
                unitPrice: Number(line.unitPrice),
                taxRate: Number(line.taxRate)
            })) || [{ description: "", quantity: 1, unitPrice: 0, taxRate: 0 }],
            subtotal: Number(recurring.totalAmount),
            taxTotal: 0,
            totalAmount: Number(recurring.totalAmount)
        });
        setRecurringDialogOpen(true);
    };
    const handleViewRecurring = (recurring) => {
        setSelectedRecurring(recurring);
        setRecurringDetailsOpen(true);
        loadRecurringHistory(recurring.id);
    };
    const handleGenerateRecurring = (recurring) => {
        generateRecurringMutation.mutate(recurring.id);
    };
    const handleStatusChange = (recurring, newStatus) => {
        updateRecurringStatusMutation.mutate({ id: recurring.id, status: newStatus });
    };
    const invoicesQuery = useQuery({
        queryKey: ["invoices", invoicePage, invoicePageSize, selectedCompany],
        enabled: isAuthenticated && !authLoading && !!selectedCompany,
        queryFn: async () => {
            const invResp = await apiService.getInvoices({ page: invoicePage, pageSize: invoicePageSize, companyId: selectedCompany });
            const raw = invResp;
            const invData = raw?.items ?? raw?.invoices ?? raw?.data ?? raw;
            return Array.isArray(invData) ? invData : [];
        }
    });
    const customersQuery = useQuery({
        queryKey: ["customers", customerPage, customerPageSize, customerSearch, selectedCompany],
        enabled: isAuthenticated && !authLoading && !!selectedCompany,
        queryFn: async () => {
            const custResp = await apiService.getCustomers({
                page: customerPage,
                pageSize: customerPageSize,
                companyId: selectedCompany,
                q: customerSearch || undefined
            });
            return custResp;
        }
    });
    // Fetch all customers for selectors (unpaginated up to 1000)
    const customersAllQuery = useQuery({
        queryKey: ["customers-all", selectedCompany],
        enabled: isAuthenticated && !authLoading && !!selectedCompany,
        staleTime: 5 * 60 * 1000,
        queryFn: async () => {
            // Backend caps pageSize at 100; fetch all pages and merge
            const pageSize = 100;
            const first = await apiService.getCustomers({ page: 1, pageSize, companyId: selectedCompany });
            const total = first?.total ?? (first?.items?.length || 0);
            let items = Array.isArray(first?.items) ? first.items : [];
            const totalPages = first?.totalPages || Math.ceil(total / pageSize) || 1;
            if (totalPages > 1) {
                const rest = await Promise.all(Array.from({ length: totalPages - 1 }, (_, i) => apiService.getCustomers({ page: i + 2, pageSize, companyId: selectedCompany })));
                for (const r of rest) {
                    if (Array.isArray(r?.items))
                        items = items.concat(r.items);
                }
            }
            return { items, total };
        }
    });
    const allCustomers = useMemo(() => {
        const list = (customersAllQuery.data?.items ?? customersAllQuery.data ?? customers);
        return Array.isArray(list) ? list : [];
    }, [customersAllQuery.data, customers]);
    const estimatesQuery = useQuery({
        queryKey: ["estimates", estimatePage, estimatePageSize, estimateSearch, selectedCompany],
        enabled: isAuthenticated && !authLoading && !!selectedCompany,
        queryFn: async () => {
            const estResp = await apiService.getEstimates({
                page: estimatePage,
                pageSize: estimatePageSize,
                companyId: selectedCompany,
                q: estimateSearch || undefined
            });
            const raw = estResp;
            const estData = raw?.items ?? raw?.estimates ?? raw?.data ?? raw;
            return Array.isArray(estData) ? estData : [];
        }
    });
    const recurringInvoicesQuery = useQuery({
        queryKey: ["recurring-invoices", recurringPage, recurringPageSize, recurringSearch, recurringStatus, selectedCompany],
        enabled: isAuthenticated && !authLoading && !!selectedCompany,
        queryFn: async () => {
            const recResp = await apiService.getRecurringInvoices({
                page: recurringPage,
                pageSize: recurringPageSize,
                companyId: selectedCompany,
                q: recurringSearch || undefined,
                status: recurringStatus || undefined
            });
            return recResp;
        }
    });
    const productsQuery = useQuery({
        queryKey: ["products", selectedCompany],
        enabled: isAuthenticated && !authLoading && !!selectedCompany,
        queryFn: async () => {
            const prodResp = await apiService.getProducts({ companyId: selectedCompany });
            const prodData = prodResp?.items ?? prodResp?.products ?? prodResp?.data ?? prodResp;
            return Array.isArray(prodData) ? prodData : [];
        }
    });
    useEffect(() => {
        if (invoicesQuery.data)
            setInvoices(invoicesQuery.data);
        if (customersQuery.data) {
            const customerItems = customersQuery.data?.items || customersQuery.data;
            setCustomersSafe(Array.isArray(customerItems) ? customerItems : []);
        }
        if (estimatesQuery.data)
            setEstimates(estimatesQuery.data);
        if (recurringInvoicesQuery.data) {
            const resp = recurringInvoicesQuery.data;
            const items = resp?.items ?? [];
            setRecurringInvoices(items);
        }
        if (productsQuery.data)
            setProducts(productsQuery.data);
        setLoading(invoicesQuery.isLoading || customersQuery.isLoading || estimatesQuery.isLoading || recurringInvoicesQuery.isLoading || productsQuery.isLoading);
        setError(invoicesQuery.error?.message || customersQuery.error?.message || estimatesQuery.error?.message || recurringInvoicesQuery.error?.message || productsQuery.error?.message || null);
    }, [invoicesQuery.data, customersQuery.data, estimatesQuery.data, recurringInvoicesQuery.data, productsQuery.data, invoicesQuery.isLoading, customersQuery.isLoading, estimatesQuery.isLoading, recurringInvoicesQuery.isLoading, productsQuery.isLoading, invoicesQuery.error, customersQuery.error, estimatesQuery.error, recurringInvoicesQuery.error, productsQuery.error]);
    useEffect(() => { setMounted(true); }, []);
    const filteredInvoices = useMemo(() => {
        if (!invoiceSearch)
            return invoices;
        const q = invoiceSearch.toLowerCase();
        return invoices.filter(inv => inv.invoiceNumber.toLowerCase().includes(q) ||
            inv.status.toLowerCase().includes(q));
    }, [invoices, invoiceSearch]);
    const filteredCustomers = useMemo(() => {
        const safeCustomers = Array.isArray(customers) ? customers : [];
        return safeCustomers;
    }, [customers]);
    // Estimates to display (data is already processed in queryFn)
    const displayEstimates = useMemo(() => {
        return Array.isArray(estimates) ? estimates : [];
    }, [estimates]);
    // Recurring invoices to display (fallback to query response items if state not yet set)
    const displayRecurringInvoices = useMemo(() => {
        const resp = recurringInvoicesQuery?.data;
        const fromQuery = resp?.items;
        if (Array.isArray(fromQuery) && fromQuery.length > 0)
            return fromQuery;
        return Array.isArray(recurringInvoices) ? recurringInvoices : [];
    }, [recurringInvoicesQuery?.data, recurringInvoices]);
    // Calculate sales statistics
    const salesStats = useMemo(() => {
        const safeInvoices = Array.isArray(invoices) ? invoices : [];
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        // Pre-process invoices to ensure consistent data types and handle paid invoices
        const processedInvoices = safeInvoices.map(inv => ({
            ...inv,
            // Force balance due to 0 for paid invoices
            balanceDue: inv.status === 'paid' ? 0 : Number(inv.balanceDue) || 0,
            // Ensure total amount is a number
            totalAmount: Number(inv.totalAmount) || 0,
            // Ensure status is lowercase for consistent comparison
            status: String(inv.status || '').toLowerCase()
        }));
        // Processed invoices for calculations
        // Total invoices amount
        const totalAmount = processedInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
        // Outstanding invoices (unpaid invoices)
        const outstanding = processedInvoices
            .filter(inv => inv.status !== 'paid' && inv.status !== 'cancelled')
            .reduce((sum, inv) => sum + inv.balanceDue, 0);
        // Paid this month
        const paidThisMonth = processedInvoices
            .filter(inv => {
            if (inv.status !== 'paid')
                return false;
            const paidDate = new Date(inv.issueDate);
            return paidDate.getMonth() === currentMonth &&
                paidDate.getFullYear() === currentYear;
        })
            .reduce((sum, inv) => sum + inv.totalAmount, 0);
        // Overdue invoices (past due date and not paid)
        const overdue = processedInvoices
            .filter(inv => {
            if (inv.status === 'paid' || inv.status === 'cancelled')
                return false;
            if (!inv.dueDate)
                return false;
            const dueDate = new Date(inv.dueDate);
            const hasPastDueDate = isDateBeforeToday(dueDate);
            return (hasPastDueDate && inv.balanceDue > 0) ||
                (inv.status === 'draft' && hasPastDueDate);
        })
            .reduce((sum, inv) => sum + inv.balanceDue, 0);
        // Calculate percentages
        const outstandingPercentage = totalAmount > 0 ? (outstanding / totalAmount) * 100 : 0;
        const paidThisMonthPercentage = totalAmount > 0 ? (paidThisMonth / totalAmount) * 100 : 0;
        const overduePercentage = totalAmount > 0 ? (overdue / totalAmount) * 100 : 0;
        return {
            outstanding,
            paidThisMonth,
            overdue,
            outstandingPercentage,
            paidThisMonthPercentage,
            overduePercentage
        };
    }, [invoices]);
    if (!mounted) {
        return (_jsx(PageLayout, { children: _jsxs("div", { className: "p-6 space-y-6", children: [_jsx("div", { className: "h-6 w-48 bg-muted rounded" }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [0, 1, 2, 3].map(i => (_jsx(Card, { children: _jsx(CardContent, { className: "p-6", children: _jsx("div", { className: "h-10 bg-muted rounded" }) }) }, i))) })] }) }));
    }
    if (authLoading) {
        return (_jsx(PageLayout, { children: _jsx("div", { className: "flex items-center justify-center h-64", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" }), _jsx("p", { className: "text-muted-foreground", children: "Loading..." })] }) }) }));
    }
    if (!isAuthenticated && !demoAuthReady) {
        return (_jsx(PageLayout, { children: _jsx("div", { className: "flex items-center justify-center h-64", children: _jsx("div", { className: "text-center", children: _jsx("p", { className: "text-muted-foreground", children: "Please log in to access sales features." }) }) }) }));
    }
    return (_jsx(PageLayout, { children: _jsxs("div", { className: "p-6 space-y-6", children: [_jsx("div", { className: "bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200 rounded-2xl p-8 mb-8", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg", children: _jsx(FileText, { className: "w-6 h-6 text-white" }) }), _jsxs("div", { children: [_jsx("h1", { className: "text-4xl font-bold text-slate-900 tracking-tight", children: "Sales & Invoicing" }), _jsx("p", { className: "text-slate-600 text-lg font-medium", children: "Manage customers, invoices, and sales transactions" })] })] }), _jsxs("div", { className: "flex items-center gap-6 mt-4", children: [_jsxs("div", { className: "flex items-center gap-2 text-sm text-slate-600", children: [_jsx("div", { className: "w-2 h-2 bg-green-500 rounded-full" }), _jsx("span", { children: "Live Dashboard" })] }), _jsxs("div", { className: "flex items-center gap-2 text-sm text-slate-600", children: [_jsx("div", { className: "w-2 h-2 bg-blue-500 rounded-full" }), _jsx("span", { children: "Real-time Updates" })] })] })] }), _jsxs("div", { className: "flex gap-3", children: [_jsxs(Button, { variant: "outline", className: "h-11 px-6 border-slate-300 hover:bg-slate-50 hover:border-slate-400 transition-all duration-200", children: [_jsx(Download, { className: "w-4 h-4 mr-2" }), "Export Data"] }), _jsxs(Button, { className: "h-11 px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-200", onClick: async () => {
                                            let number = "";
                                            try {
                                                const next = await apiService.getNextInvoiceNumber(selectedCompany);
                                                number = next?.invoiceNumber || "";
                                            }
                                            catch { }
                                            const startLines = [{ description: "", quantity: 1, unitPrice: 0, taxRate: 0 }];
                                            const safeCustomers = allCustomers;
                                            const initCurrency = safeCustomers[0]?.currency || 'USD';
                                            setLastPriceCurrency(initCurrency);
                                            setInvoiceForm({ customerId: safeCustomers[0]?.id || "", invoiceNumber: number, currency: initCurrency, issueDate: new Date().toISOString().slice(0, 10), dueDate: "", discountMode: 'amount', discount: 0, shipping: 0, taxMode: 'per_line', globalTaxRate: 0, lines: startLines, notes: "", terms: "Payment due within 30 days", paymentTerms: "Net 30", ...recalcTotals(startLines, 0, 0, 'per_line', 0, 'amount') });
                                            setInvoiceDialogOpen(true);
                                        }, children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), "New Invoice"] })] })] }) }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8", children: [_jsxs(Card, { className: "bg-card border-border", children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium text-muted-foreground", children: "Outstanding" }), _jsx("span", { className: "text-chart-1 font-bold text-lg", children: "$" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold text-foreground", children: loading ? "—" : `${salesStats.outstandingPercentage.toFixed(0)}%` }), _jsx("div", { className: "text-xs text-muted-foreground mt-1", children: "Pending payments" })] })] }), _jsxs(Card, { className: "bg-card border-border", children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium text-muted-foreground", children: "Paid This Month" }), _jsx("span", { className: "text-chart-2 font-bold text-lg", children: "\u2713" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold text-foreground", children: loading ? "—" : `${salesStats.paidThisMonthPercentage.toFixed(0)}%` }), _jsx("div", { className: "text-xs text-muted-foreground mt-1", children: "Successful payments" })] })] }), _jsxs(Card, { className: "bg-card border-border", children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium text-muted-foreground", children: "Overdue" }), _jsx("span", { className: "text-chart-3 font-bold text-lg", children: "!" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold text-foreground", children: loading ? "—" : formatCurrency(salesStats.overdue, 'RWF') }), _jsxs("div", { className: "text-xs text-muted-foreground mt-1", children: ["(", salesStats.overduePercentage.toFixed(0), "% of total)"] })] })] }), _jsxs(Card, { className: "bg-card border-border", children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium text-muted-foreground", children: "Total Customers" }), _jsx(Users, { className: "w-4 h-4 text-chart-4" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold text-foreground", children: loading ? "—" : (Array.isArray(customers) ? customers : []).length }), _jsx("div", { className: "text-xs text-muted-foreground mt-1", children: "Active customers" })] })] })] }), "the", _jsx("div", { className: "bg-white rounded-2xl border border-slate-200 shadow-sm p-2 mb-8", children: _jsxs(Tabs, { defaultValue: "invoices", className: "space-y-6", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-7 bg-slate-50 p-1 rounded-xl h-14", children: [_jsxs(TabsTrigger, { value: "invoices", className: "flex items-center gap-2 px-4 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 font-medium transition-all duration-200 rounded-lg", children: [_jsx(FileText, { className: "w-4 h-4" }), _jsx("span", { children: "Invoices" }), _jsx(Badge, { variant: "secondary", className: "ml-1 bg-blue-100 text-blue-700 text-xs px-2 py-0.5", children: invoices.length })] }), _jsxs(TabsTrigger, { value: "customers", className: "flex items-center gap-2 px-4 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 font-medium transition-all duration-200 rounded-lg", children: [_jsx(Users, { className: "w-4 h-4" }), _jsx("span", { children: "Customers" }), _jsx(Badge, { variant: "secondary", className: "ml-1 bg-green-100 text-green-700 text-xs px-2 py-0.5", children: customers.length })] }), _jsxs(TabsTrigger, { value: "estimates", className: "flex items-center gap-2 px-4 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 font-medium transition-all duration-200 rounded-lg", children: [_jsx(Calculator, { className: "w-4 h-4" }), _jsx("span", { children: "Estimates" }), _jsx(Badge, { variant: "secondary", className: "ml-1 bg-purple-100 text-purple-700 text-xs px-2 py-0.5", children: estimates.length })] }), _jsxs(TabsTrigger, { value: "recurring", className: "flex items-center gap-2 px-4 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 font-medium transition-all duration-200 rounded-lg", children: [_jsx(RefreshCw, { className: "w-4 h-4" }), _jsx("span", { children: "Recurring" }), _jsx(Badge, { variant: "secondary", className: "ml-1 bg-amber-100 text-amber-700 text-xs px-2 py-0.5", children: recurringInvoices.length })] }), _jsxs(TabsTrigger, { value: "approvals", className: "flex items-center gap-2 px-4 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 font-medium transition-all duration-200 rounded-lg", children: [_jsx(CheckCircle, { className: "w-4 h-4" }), _jsx("span", { children: "Approvals" })] }), _jsxs(TabsTrigger, { value: "ai-create", className: "flex items-center gap-2 px-4 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 font-medium transition-all duration-200 rounded-lg", children: [_jsx(MessageSquare, { className: "w-4 h-4" }), _jsx("span", { children: "AI Create" })] }), _jsxs(TabsTrigger, { value: "ai-chat", className: "flex items-center gap-2 px-4 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 font-medium transition-all duration-200 rounded-lg", children: [_jsx(Bot, { className: "w-4 h-4" }), _jsx("span", { children: "AI Chat" })] })] }), _jsxs(TabsContent, { value: "invoices", className: "space-y-4", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx(CardTitle, { children: "Recent Invoices" }), _jsxs("div", { className: "flex gap-2", children: [_jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" }), _jsx(Input, { placeholder: "Search invoices...", className: "pl-10 w-64", value: invoiceSearch, onChange: (e) => setInvoiceSearch(e.target.value) })] }), _jsxs(Button, { variant: "outline", size: "sm", children: [_jsx(Filter, { className: "w-4 h-4 mr-2" }), "Filter"] })] })] }) }), _jsxs(CardContent, { children: [error && (_jsx("div", { className: "text-red-600 text-sm mb-2", children: error?.message || error?.toString() || 'Unknown error' })), _jsxs("div", { className: "space-y-4", children: [invoicesQuery?.isLoading && (_jsx(_Fragment, { children: [0, 1, 2, 3, 4].map(i => (_jsxs("div", { className: "flex items-center justify-between p-4 border rounded-lg", children: [_jsx("div", { className: "h-4 w-32 bg-muted rounded" }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "h-4 w-24 bg-muted rounded" }), _jsx("div", { className: "h-6 w-20 bg-muted rounded" })] })] }, i))) })), !(invoicesQuery?.isLoading) && filteredInvoices.map((inv) => (_jsxs("div", { className: "group bg-white border border-slate-200 rounded-2xl hover:shadow-xl hover:border-blue-300 transition-all duration-300 overflow-hidden", children: [_jsx("div", { className: "p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300", children: _jsx("span", { className: "text-white font-bold text-xl", children: "#" }) }), _jsxs("div", { className: "space-y-1", children: [_jsx("p", { className: "font-bold text-slate-900 text-xl", children: inv.invoiceNumber }), _jsx("p", { className: "text-slate-600 font-medium", children: (() => {
                                                                                                        if (customersQuery?.isLoading)
                                                                                                            return '—';
                                                                                                        const c = (Array.isArray(customers) ? customers : []).find(cu => cu.id === inv.customerId);
                                                                                                        return c ? c.name : inv.customerId;
                                                                                                    })() }), _jsxs("p", { className: "text-sm text-slate-500", children: ["Issued: ", new Date(inv.issueDate).toLocaleDateString()] }), _jsxs("div", { className: "flex items-center gap-2 mt-2", children: [_jsx(Badge, { variant: inv.status === "paid"
                                                                                                                ? "default"
                                                                                                                : inv.status === "pending" || inv.status === "sent"
                                                                                                                    ? "secondary"
                                                                                                                    : inv.status === "overdue"
                                                                                                                        ? "destructive"
                                                                                                                        : "outline", className: `text-xs px-3 py-1 rounded-full font-medium ${inv.status === "paid"
                                                                                                                ? "bg-green-100 text-green-700 border-green-200"
                                                                                                                : inv.status === "overdue"
                                                                                                                    ? "bg-red-100 text-red-700 border-red-200"
                                                                                                                    : inv.status === "pending" || inv.status === "sent"
                                                                                                                        ? "bg-blue-100 text-blue-700 border-blue-200"
                                                                                                                        : "bg-slate-100 text-slate-700 border-slate-200"}`, children: inv.status.charAt(0).toUpperCase() + inv.status.slice(1) }), inv.dueDate && (_jsxs("span", { className: "text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded-full", children: ["Due: ", new Date(inv.dueDate).toLocaleDateString()] }))] })] })] }), _jsxs("div", { className: "flex items-center gap-6", children: [_jsxs("div", { className: "text-right space-y-1", children: [_jsx("p", { className: "font-bold text-slate-900 text-2xl", children: formatCurrency(inv.totalAmount, (customersQuery?.isLoading ? 'USD' : ((Array.isArray(customers) ? customers : []).find(c => c.id === inv.customerId)?.currency) || 'USD')) }), _jsxs("p", { className: "text-sm text-slate-600", children: ["Balance: ", formatCurrency(inv.balanceDue, (customersQuery?.isLoading ? 'USD' : ((Array.isArray(customers) ? customers : []).find(c => c.id === inv.customerId)?.currency) || 'USD'))] }), inv.balanceDue > 0 && (_jsxs("p", { className: "text-xs text-amber-600 font-medium", children: [((inv.balanceDue / inv.totalAmount) * 100).toFixed(0), "% remaining"] }))] }), _jsxs("div", { className: "flex items-center gap-2", children: [(() => {
                                                                                                    // Only mark as overdue if:
                                                                                                    // 1. Has a due date in the past AND has balance due
                                                                                                    // 2. OR is a draft with a due date in the past
                                                                                                    const hasPastDueDate = inv.dueDate && isDateBeforeToday(new Date(inv.dueDate));
                                                                                                    const isOverdue = (hasPastDueDate && inv.balanceDue > 0) ||
                                                                                                        (inv.status === 'draft' && hasPastDueDate);
                                                                                                    // Mark as overdue in UI
                                                                                                    return isOverdue ? (_jsx(Badge, { variant: "destructive", className: "text-xs", children: "Overdue" })) : null;
                                                                                                })(), inv.status === 'draft' && (_jsx(Button, { variant: "outline", size: "sm", className: "hover:bg-blue-50 hover:border-blue-200", onClick: async () => {
                                                                                                        try {
                                                                                                            await apiService.updateInvoice(inv.id, { status: 'sent' });
                                                                                                            await qc.invalidateQueries({ queryKey: ["invoices"] });
                                                                                                        }
                                                                                                        catch { }
                                                                                                    }, children: "Mark Sent" })), _jsx(Button, { variant: "outline", size: "sm", onClick: () => { setCreditInvoiceId(inv.id); setCreditDialogOpen(true); }, children: "Credit Note" }), (inv.status === 'sent' || inv.status === 'pending') && (_jsxs(_Fragment, { children: [_jsx(Button, { size: "sm", className: "bg-green-600 hover:bg-green-700", onClick: async () => {
                                                                                                                try {
                                                                                                                    // First, try to process accounting entries and inventory updates
                                                                                                                    // This will validate inventory before processing
                                                                                                                    try {
                                                                                                                        const accountingResult = await apiService.processInvoicePayment(inv.id);
                                                                                                                        console.log('Accounting entries created:', accountingResult);
                                                                                                                        // Update invoice status after successful accounting processing
                                                                                                                        await apiService.updateInvoice(inv.id, { status: 'paid', balanceDue: 0 });
                                                                                                                        // Show success message with accounting details
                                                                                                                        toast({
                                                                                                                            title: 'Invoice marked as paid',
                                                                                                                            description: `Accounting entries created and inventory updated successfully. Journal Entry: ${accountingResult.journalEntryId}`,
                                                                                                                            variant: 'default'
                                                                                                                        });
                                                                                                                        await qc.invalidateQueries({ queryKey: ["invoices"] });
                                                                                                                        await qc.invalidateQueries({ queryKey: ["journal-entries"] });
                                                                                                                        await qc.invalidateQueries({ queryKey: ["inventory-movements"] });
                                                                                                                    }
                                                                                                                    catch (accountingError) {
                                                                                                                        console.error('Accounting integration error:', accountingError);
                                                                                                                        // Check if it's an inventory validation error
                                                                                                                        if (accountingError.message && accountingError.message.includes('Insufficient inventory')) {
                                                                                                                            toast({
                                                                                                                                title: 'Insufficient Inventory',
                                                                                                                                description: accountingError.message,
                                                                                                                                variant: 'destructive'
                                                                                                                            });
                                                                                                                        }
                                                                                                                        else {
                                                                                                                            toast({
                                                                                                                                title: 'Error',
                                                                                                                                description: 'Failed to process invoice payment. Please check inventory and try again.',
                                                                                                                                variant: 'destructive'
                                                                                                                            });
                                                                                                                        }
                                                                                                                    }
                                                                                                                }
                                                                                                                catch (error) {
                                                                                                                    console.error('Error marking invoice as paid:', error);
                                                                                                                    toast({
                                                                                                                        title: 'Error',
                                                                                                                        description: 'Failed to mark invoice as paid',
                                                                                                                        variant: 'destructive'
                                                                                                                    });
                                                                                                                }
                                                                                                            }, children: "Mark Paid" }), inv.balanceDue > 0 && (_jsx(PaymentButtonCompact, { invoiceId: inv.id, amount: inv.balanceDue, currency: (customersQuery?.isLoading ? 'USD' : ((Array.isArray(customers) ? customers : []).find(c => c.id === inv.customerId)?.currency) || 'USD'), customerEmail: ((Array.isArray(customers) ? customers : []).find(c => c.id === inv.customerId)?.email), customerName: ((Array.isArray(customers) ? customers : []).find(c => c.id === inv.customerId)?.name), description: `Payment for Invoice ${inv.invoiceNumber}`, onPaymentSuccess: async () => {
                                                                                                                try {
                                                                                                                    // Process accounting entries and inventory updates
                                                                                                                    const accountingResult = await apiService.processInvoicePayment(inv.id);
                                                                                                                    console.log('Accounting entries created:', accountingResult);
                                                                                                                    toast({
                                                                                                                        title: 'Payment successful',
                                                                                                                        description: `Payment processed and accounting entries created. Journal Entry: ${accountingResult.journalEntryId}`,
                                                                                                                        variant: 'default'
                                                                                                                    });
                                                                                                                    await qc.invalidateQueries({ queryKey: ["invoices"] });
                                                                                                                    await qc.invalidateQueries({ queryKey: ["journal-entries"] });
                                                                                                                    await qc.invalidateQueries({ queryKey: ["inventory-movements"] });
                                                                                                                }
                                                                                                                catch (accountingError) {
                                                                                                                    console.error('Accounting integration error:', accountingError);
                                                                                                                    // Check if it's an inventory validation error
                                                                                                                    if (accountingError.message && accountingError.message.includes('Insufficient inventory')) {
                                                                                                                        toast({
                                                                                                                            title: 'Insufficient Inventory',
                                                                                                                            description: accountingError.message,
                                                                                                                            variant: 'destructive'
                                                                                                                        });
                                                                                                                    }
                                                                                                                    else {
                                                                                                                        toast({
                                                                                                                            title: 'Payment successful',
                                                                                                                            description: 'Payment processed but accounting integration failed. Please check the accounting entries manually.',
                                                                                                                            variant: 'destructive'
                                                                                                                        });
                                                                                                                    }
                                                                                                                    await qc.invalidateQueries({ queryKey: ["invoices"] });
                                                                                                                    await qc.invalidateQueries({ queryKey: ["journal-entries"] });
                                                                                                                    await qc.invalidateQueries({ queryKey: ["inventory-movements"] });
                                                                                                                }
                                                                                                            }, onPaymentError: (error) => {
                                                                                                                console.error('Payment error:', error);
                                                                                                            } }))] }))] }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { variant: "ghost", size: "sm", className: "h-10 w-10 p-0 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200", onClick: async () => {
                                                                                                        try {
                                                                                                            setDetailsInvoice(inv);
                                                                                                            setDetailsOpen(true);
                                                                                                            setDetailsLoading(true);
                                                                                                            setDetailsPdfUrl(null);
                                                                                                            setDetailsPayLink(null);
                                                                                                            setDetailsStatus(inv.status);
                                                                                                            setDetailsDueDate((inv.dueDate || '').slice(0, 10));
                                                                                                            try {
                                                                                                                const blob = await apiService.getInvoicePdf(inv.id);
                                                                                                                const url = URL.createObjectURL(blob);
                                                                                                                setDetailsPdfUrl(url);
                                                                                                            }
                                                                                                            catch { }
                                                                                                            try {
                                                                                                                const link = await apiService.createPaymentLink(inv.id);
                                                                                                                setDetailsPayLink(link.url);
                                                                                                            }
                                                                                                            catch { }
                                                                                                            try {
                                                                                                                const activity = await apiService.getInvoiceActivity(inv.id);
                                                                                                                setDetailsActivity(activity.map((act) => ({
                                                                                                                    id: act.id,
                                                                                                                    type: act.activityType,
                                                                                                                    at: act.createdAt,
                                                                                                                    by: act.performedBy,
                                                                                                                    message: act.description
                                                                                                                })));
                                                                                                            }
                                                                                                            catch {
                                                                                                                setDetailsActivity([]);
                                                                                                            }
                                                                                                        }
                                                                                                        finally {
                                                                                                            setDetailsLoading(false);
                                                                                                        }
                                                                                                    }, children: _jsx(Eye, { className: "w-4 h-4" }) }), _jsx(Button, { variant: "ghost", size: "sm", className: "h-10 w-10 p-0 hover:bg-green-50 hover:text-green-600 transition-colors duration-200", children: _jsx(Edit, { className: "w-4 h-4" }) }), _jsx(Button, { variant: "ghost", size: "sm", className: "h-10 w-10 p-0 hover:bg-purple-50 hover:text-purple-600 transition-colors duration-200", onClick: () => {
                                                                                                        setSendEmailInvoiceId(inv.id);
                                                                                                        const c = (Array.isArray(customers) ? customers : []).find(x => x.id === inv.customerId);
                                                                                                        setSendEmailTo(c?.email || '');
                                                                                                        setSendEmailOpen(true);
                                                                                                    }, children: _jsx(Send, { className: "w-4 h-4" }) })] })] })] }) }), (() => {
                                                                        const hasPastDueDate = inv.dueDate && isDateBeforeToday(new Date(inv.dueDate));
                                                                        const isOverdue = (hasPastDueDate && inv.balanceDue > 0) ||
                                                                            (inv.status === 'draft' && hasPastDueDate);
                                                                        return isOverdue ? (_jsx("div", { className: "h-1 bg-gradient-to-r from-red-500 to-red-600" })) : null;
                                                                    })()] }, inv.id))), filteredInvoices.length === 0 && !loading && (_jsx("div", { className: "text-sm text-muted-foreground", children: "No invoices found" }))] }), _jsxs("div", { className: "flex items-center justify-between mt-4", children: [_jsxs("div", { className: "text-sm text-muted-foreground", children: ["Page ", invoicePage] }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { variant: "outline", size: "sm", disabled: invoicePage <= 1 || loading, onClick: () => setInvoicePage(p => Math.max(1, p - 1)), children: "Prev" }), _jsx(Button, { variant: "outline", size: "sm", disabled: loading || invoices.length < invoicePageSize, onClick: () => setInvoicePage(p => p + 1), children: "Next" })] })] })] })] }), _jsx(Dialog, { open: invoiceDialogOpen, onOpenChange: setInvoiceDialogOpen, children: _jsxs(DialogContent, { className: "!max-w-7xl max-h-[95vh] overflow-y-auto w-[95vw] md:max-h-[90vh] md:w-[90vw]", children: [_jsxs(DialogHeader, { className: "pb-6 border-b border-slate-200", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center", children: _jsx(FileText, { className: "w-5 h-5 text-white" }) }), _jsxs("div", { children: [_jsx(DialogTitle, { className: "text-2xl font-bold text-slate-900", children: "Create New Invoice" }), _jsx(DialogDescription, { className: "text-slate-600 mt-1", children: "Fill in the details below to create a professional invoice" })] })] }), invoiceError && (_jsx("div", { className: "mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm", children: invoiceError }))] }), _jsx("div", { className: "flex-1 overflow-y-auto max-h-[calc(95vh-200px)] md:max-h-[calc(90vh-200px)] scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 hover:scrollbar-thumb-slate-400", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-6", children: [_jsxs("div", { className: "md:col-span-1 lg:col-span-1 space-y-6", children: [_jsxs("div", { className: "bg-slate-50 rounded-xl p-6", children: [_jsxs("h3", { className: "text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2", children: [_jsx(Users, { className: "w-5 h-5 text-blue-600" }), "Customer Information"] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "inv-customer", className: "text-sm font-medium text-slate-700", children: "Select Customer *" }), _jsxs(Select, { value: invoiceForm.customerId, onValueChange: async (newCustomerId) => {
                                                                                            const cust = allCustomers.find(c => c.id === newCustomerId);
                                                                                            let nextCurrency = invoiceForm.currency;
                                                                                            if (cust?.currency && autoConvertPrices && !lockRate) {
                                                                                                nextCurrency = cust.currency;
                                                                                            }
                                                                                            setInvoiceForm(prev => ({ ...prev, customerId: newCustomerId, currency: nextCurrency }));
                                                                                            if (cust?.currency && autoConvertPrices && !lockRate && lastPriceCurrency !== cust.currency) {
                                                                                                try {
                                                                                                    const { rate } = await apiService.getExchangeRate(lastPriceCurrency, cust.currency);
                                                                                                    const lines = prevLinesConvert(invoiceForm.lines, rate);
                                                                                                    setInvoiceForm(prev => ({ ...prev, lines, ...recalcTotals(lines), currency: cust.currency || 'USD' }));
                                                                                                    setLastPriceCurrency(cust.currency);
                                                                                                    setExchangeRate(rate);
                                                                                                }
                                                                                                catch { }
                                                                                            }
                                                                                        }, children: [_jsx(SelectTrigger, { className: "h-12 bg-white border-slate-300", children: _jsx(SelectValue, { placeholder: "Choose a customer..." }) }), _jsx(SelectContent, { children: allCustomers.map(c => (_jsx(SelectItem, { value: c.id, children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "font-medium", children: c.name }), c.currency && (_jsxs("span", { className: "text-xs text-slate-500", children: ["(", c.currency, ")"] }))] }) }, c.id))) })] })] })] }), _jsxs("div", { className: "bg-slate-50 rounded-xl p-6", children: [_jsxs("h3", { className: "text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2", children: [_jsx(FileText, { className: "w-5 h-5 text-blue-600" }), "Invoice Details"] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "inv-number", className: "text-sm font-medium text-slate-700", children: "Invoice Number *" }), _jsx(Input, { id: "inv-number", value: invoiceForm.invoiceNumber, onChange: (e) => setInvoiceForm({ ...invoiceForm, invoiceNumber: e.target.value }), placeholder: "INV-001", className: "h-12 bg-white border-slate-300" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "inv-currency", className: "text-sm font-medium text-slate-700", children: "Currency" }), _jsxs(Select, { value: invoiceForm.currency, onValueChange: async (newCurrency) => {
                                                                                                    if (autoConvertPrices && !lockRate && lastPriceCurrency !== newCurrency) {
                                                                                                        try {
                                                                                                            const { rate } = await apiService.getExchangeRate(lastPriceCurrency, newCurrency);
                                                                                                            const lines = prevLinesConvert(invoiceForm.lines, rate);
                                                                                                            setInvoiceForm(prev => ({ ...prev, currency: newCurrency, lines, ...recalcTotals(lines) }));
                                                                                                            setLastPriceCurrency(newCurrency);
                                                                                                            setExchangeRate(rate);
                                                                                                        }
                                                                                                        catch {
                                                                                                            setInvoiceForm(prev => ({ ...prev, currency: newCurrency }));
                                                                                                        }
                                                                                                    }
                                                                                                    else {
                                                                                                        setInvoiceForm(prev => ({ ...prev, currency: newCurrency }));
                                                                                                    }
                                                                                                }, children: [_jsx(SelectTrigger, { className: "h-12 bg-white border-slate-300", children: _jsx(SelectValue, {}) }), _jsx(SelectContent, { children: ['USD', 'EUR', 'GBP', 'KES', 'NGN'].map(c => (_jsx(SelectItem, { value: c, children: c }, c))) })] })] })] })] }), _jsxs("div", { className: "bg-slate-50 rounded-xl p-6", children: [_jsxs("h3", { className: "text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2", children: [_jsx(Calendar, { className: "w-5 h-5 text-blue-600" }), "Dates"] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "inv-issue", className: "text-sm font-medium text-slate-700", children: "Issue Date *" }), _jsx(Input, { id: "inv-issue", type: "date", value: invoiceForm.issueDate, onChange: (e) => setInvoiceForm({ ...invoiceForm, issueDate: e.target.value }), className: "h-12 bg-white border-slate-300" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "inv-due", className: "text-sm font-medium text-slate-700", children: "Due Date" }), _jsx(Input, { id: "inv-due", type: "date", value: invoiceForm.dueDate || '', onChange: (e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value }), className: "h-12 bg-white border-slate-300" })] })] })] }), _jsxs("div", { className: "bg-slate-50 rounded-xl p-6", children: [_jsxs("h3", { className: "text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2", children: [_jsx(Calculator, { className: "w-5 h-5 text-blue-600" }), "Pricing & Tax"] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "inv-shipping", className: "text-sm font-medium text-slate-700", children: "Shipping Cost" }), _jsx(Input, { id: "inv-shipping", type: "number", step: "0.01", value: invoiceForm.shipping, onChange: (e) => {
                                                                                                    const shipping = parseFloat(e.target.value) || 0;
                                                                                                    setInvoiceForm(prev => ({ ...prev, shipping, ...recalcTotals(prev.lines, prev.discount, shipping) }));
                                                                                                }, className: "h-12 bg-white border-slate-300", placeholder: "0.00" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { className: "text-sm font-medium text-slate-700", children: "Discount Mode" }), _jsxs(Select, { value: invoiceForm.discountMode, onValueChange: (dm) => {
                                                                                                    setInvoiceForm(prev => ({ ...prev, discountMode: dm, ...recalcTotals(prev.lines, prev.discount, prev.shipping, prev.taxMode, prev.globalTaxRate, dm) }));
                                                                                                }, children: [_jsx(SelectTrigger, { className: "h-12 bg-white border-slate-300", children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "amount", children: "Amount" }), _jsx(SelectItem, { value: "percent", children: "Percentage" })] })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs(Label, { htmlFor: "inv-discount", className: "text-sm font-medium text-slate-700", children: ["Discount ", invoiceForm.discountMode === 'percent' ? '(%)' : ''] }), _jsx(Input, { id: "inv-discount", type: "number", step: "0.01", value: invoiceForm.discount, onChange: (e) => {
                                                                                                    const discount = parseFloat(e.target.value) || 0;
                                                                                                    setInvoiceForm(prev => ({ ...prev, discount, ...recalcTotals(prev.lines, discount) }));
                                                                                                }, className: "h-12 bg-white border-slate-300", placeholder: "0.00" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { className: "text-sm font-medium text-slate-700", children: "Tax Mode" }), _jsxs(Select, { value: invoiceForm.taxMode, onValueChange: (taxMode) => {
                                                                                                    setInvoiceForm(prev => ({ ...prev, taxMode: taxMode, ...recalcTotals(prev.lines, prev.discount, prev.shipping, taxMode, prev.globalTaxRate) }));
                                                                                                }, children: [_jsx(SelectTrigger, { className: "h-12 bg-white border-slate-300", children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "per_line", children: "Per Line Item" }), _jsx(SelectItem, { value: "global", children: "Global Rate" })] })] })] }), invoiceForm.taxMode === 'global' && (_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "inv-tax", className: "text-sm font-medium text-slate-700", children: "Global Tax Rate (%)" }), _jsx(Input, { id: "inv-tax", type: "number", step: "0.01", value: invoiceForm.globalTaxRate, onChange: (e) => {
                                                                                                    const r = parseFloat(e.target.value) || 0;
                                                                                                    setInvoiceForm(prev => ({ ...prev, globalTaxRate: r, ...recalcTotals(prev.lines, prev.discount, prev.shipping, prev.taxMode, r) }));
                                                                                                }, className: "h-12 bg-white border-slate-300", placeholder: "0.00" })] }))] })] }), _jsxs("div", { className: "bg-slate-50 rounded-xl p-6", children: [_jsxs("h3", { className: "text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2", children: [_jsx(MessageSquare, { className: "w-5 h-5 text-blue-600" }), "Notes & Terms"] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "inv-notes", className: "text-sm font-medium text-slate-700", children: "Notes" }), _jsx(Textarea, { id: "inv-notes", value: invoiceForm.notes || '', onChange: (e) => setInvoiceForm(prev => ({ ...prev, notes: e.target.value })), placeholder: "Internal notes or additional information...", className: "bg-white border-slate-300 min-h-[80px]" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "inv-terms", className: "text-sm font-medium text-slate-700", children: "Payment Terms" }), _jsx(Textarea, { id: "inv-terms", value: invoiceForm.terms || '', onChange: (e) => setInvoiceForm(prev => ({ ...prev, terms: e.target.value })), placeholder: "Terms and conditions for payment...", className: "bg-white border-slate-300 min-h-[80px]" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "inv-payment-terms", className: "text-sm font-medium text-slate-700", children: "Payment Terms Code" }), _jsxs(Select, { value: invoiceForm.paymentTerms || 'Net 30', onValueChange: (value) => setInvoiceForm(prev => ({ ...prev, paymentTerms: value })), children: [_jsx(SelectTrigger, { className: "h-12 bg-white border-slate-300", children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "Due on Receipt", children: "Due on Receipt" }), _jsx(SelectItem, { value: "Net 7", children: "Net 7" }), _jsx(SelectItem, { value: "Net 15", children: "Net 15" }), _jsx(SelectItem, { value: "Net 30", children: "Net 30" }), _jsx(SelectItem, { value: "Net 60", children: "Net 60" }), _jsx(SelectItem, { value: "Net 90", children: "Net 90" })] })] })] })] })] })] }), _jsxs("div", { className: "md:col-span-1 lg:col-span-2 space-y-6", children: [_jsxs("div", { className: "bg-gradient-to-br from-white to-slate-50 rounded-xl border-2 border-blue-100 shadow-lg p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg", children: _jsx(ShoppingCart, { className: "w-5 h-5 text-white" }) }), _jsxs("div", { children: [_jsx("h3", { className: "text-xl font-bold text-slate-900", children: "Line Items" }), _jsx("p", { className: "text-sm text-slate-600", children: "Add products or services to your invoice" })] })] }), _jsxs(Button, { variant: "default", size: "sm", onClick: () => {
                                                                                            const lines = [...invoiceForm.lines, { description: "", quantity: 1, unitPrice: 0, taxRate: 0, productId: "" }];
                                                                                            setInvoiceForm({ ...invoiceForm, lines, ...recalcTotals(lines) });
                                                                                        }, className: "h-11 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg", children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), "Add Item"] })] }), _jsxs("div", { className: "space-y-4", children: [_jsx("div", { className: "bg-slate-100 rounded-lg p-3 border border-slate-200", children: _jsxs("div", { className: "grid grid-cols-12 gap-4 text-sm font-bold text-slate-700", children: [_jsxs("div", { className: "col-span-5 flex items-center gap-2", children: [_jsx(FileText, { className: "w-4 h-4 text-blue-600" }), "Description"] }), _jsxs("div", { className: "col-span-1 text-center flex items-center justify-center gap-1", children: [_jsx(Calculator, { className: "w-3 h-3 text-blue-600" }), "Qty"] }), _jsxs("div", { className: "col-span-2 text-right flex items-center justify-end gap-1", children: [_jsx(CreditCard, { className: "w-3 h-3 text-blue-600" }), "Unit Price"] }), _jsxs("div", { className: "col-span-2 text-right flex items-center justify-end gap-1", children: [_jsx(Calculator, { className: "w-3 h-3 text-blue-600" }), "Discount"] }), _jsxs("div", { className: "col-span-1 text-center flex items-center justify-center gap-1", children: [_jsx(Calculator, { className: "w-3 h-3 text-blue-600" }), "Tax %"] }), _jsx("div", { className: "col-span-1 text-center", children: "Actions" })] }) }), invoiceForm.lines.map((line, idx) => (_jsx("div", { className: "group bg-white hover:bg-blue-50/50 transition-all duration-200 rounded-xl border-2 border-slate-200 hover:border-blue-300 shadow-sm hover:shadow-md p-5", children: _jsxs("div", { className: "grid grid-cols-12 gap-4 items-start", children: [_jsxs("div", { className: "col-span-5 space-y-3", children: [_jsxs("div", { className: "relative", children: [_jsx(Input, { placeholder: "Enter item description (e.g., Web Design Services)", value: line.description, onChange: (e) => {
                                                                                                                        const lines = [...invoiceForm.lines];
                                                                                                                        lines[idx].description = e.target.value;
                                                                                                                        setInvoiceForm({ ...invoiceForm, lines, ...recalcTotals(lines) });
                                                                                                                    }, className: "h-12 text-base font-medium bg-white border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200" }), line.description && (_jsx("div", { className: "absolute right-3 top-3 text-green-500", children: _jsx(CheckCircle, { className: "w-5 h-5" }) }))] }), _jsxs(Select, { value: line.productId || "", onValueChange: (productId) => {
                                                                                                                const p = products.find((pr) => pr.id === productId);
                                                                                                                if (!p)
                                                                                                                    return;
                                                                                                                const lines = [...invoiceForm.lines];
                                                                                                                lines[idx].productId = productId;
                                                                                                                lines[idx].description = p.name;
                                                                                                                lines[idx].unitPrice = p.unitPrice || p.price || 0;
                                                                                                                setInvoiceForm({ ...invoiceForm, lines, ...recalcTotals(lines) });
                                                                                                            }, children: [_jsx(SelectTrigger, { className: "h-10 text-sm bg-slate-50 border-slate-300", children: _jsx(SelectValue, { placeholder: "Or select from product catalog..." }) }), _jsx(SelectContent, { children: products.map((p) => (_jsx(SelectItem, { value: p.id, children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("span", { className: "font-medium", children: [p.sku ? `${p.sku} - ` : '', p.name] }), _jsx(Badge, { variant: "secondary", className: "text-xs", children: formatCurrency(p.unitPrice || p.price || 0, invoiceForm.currency) })] }) }, p.id))) })] })] }), _jsx("div", { className: "col-span-1", children: _jsxs("div", { className: "relative", children: [_jsx(Input, { type: "number", min: "0", step: "1", placeholder: "1", value: line.quantity, onChange: (e) => {
                                                                                                                    const lines = [...invoiceForm.lines];
                                                                                                                    lines[idx].quantity = parseFloat(e.target.value) || 0;
                                                                                                                    setInvoiceForm({ ...invoiceForm, lines, ...recalcTotals(lines) });
                                                                                                                }, className: "h-12 text-center text-base font-semibold bg-white border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200" }), _jsx("div", { className: "absolute inset-x-0 -bottom-6 text-xs text-center text-slate-500", children: "qty" })] }) }), _jsx("div", { className: "col-span-2", children: _jsxs("div", { className: "relative", children: [_jsx(Input, { type: "number", min: "0", step: "0.01", placeholder: "0.00", value: line.unitPrice, onChange: (e) => {
                                                                                                                    const lines = [...invoiceForm.lines];
                                                                                                                    lines[idx].unitPrice = parseFloat(e.target.value) || 0;
                                                                                                                    setInvoiceForm({ ...invoiceForm, lines, ...recalcTotals(lines) });
                                                                                                                }, className: "h-12 text-right text-base font-semibold bg-white border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200" }), _jsx("div", { className: "absolute inset-x-0 -bottom-6 text-xs text-center text-slate-500", children: "per unit" })] }) }), _jsx("div", { className: "col-span-2", children: _jsxs("div", { className: "relative", children: [_jsx(Input, { type: "number", min: "0", step: "0.01", placeholder: "0.00", value: line.lineDiscount || 0, onChange: (e) => {
                                                                                                                    const lines = [...invoiceForm.lines];
                                                                                                                    lines[idx].lineDiscount = parseFloat(e.target.value) || 0;
                                                                                                                    setInvoiceForm({ ...invoiceForm, lines, ...recalcTotals(lines) });
                                                                                                                }, className: "h-12 text-right text-base font-semibold bg-white border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200" }), _jsx("div", { className: "absolute inset-x-0 -bottom-6 text-xs text-center text-slate-500", children: "discount" })] }) }), _jsx("div", { className: "col-span-1", children: _jsxs("div", { className: "relative", children: [_jsx(Input, { type: "number", min: "0", step: "0.01", placeholder: "0", disabled: invoiceForm.taxMode === 'global', value: line.taxRate, onChange: (e) => {
                                                                                                                    const lines = [...invoiceForm.lines];
                                                                                                                    lines[idx].taxRate = parseFloat(e.target.value) || 0;
                                                                                                                    setInvoiceForm({ ...invoiceForm, lines, ...recalcTotals(lines) });
                                                                                                                }, className: "h-12 text-center text-base font-semibold bg-white border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-slate-100 disabled:text-slate-500" }), _jsx("div", { className: "absolute inset-x-0 -bottom-6 text-xs text-center text-slate-500", children: invoiceForm.taxMode === 'global' ? 'global' : 'tax %' })] }) }), _jsxs("div", { className: "col-span-1 flex flex-col items-center gap-2", children: [_jsx(Button, { variant: "ghost", size: "sm", onClick: () => {
                                                                                                                const lines = invoiceForm.lines.filter((_, i) => i !== idx);
                                                                                                                setInvoiceForm({ ...invoiceForm, lines: lines.length ? lines : [{ description: "", quantity: 1, unitPrice: 0, taxRate: 0, productId: "" }], ...recalcTotals(lines.length ? lines : [{ description: "", quantity: 1, unitPrice: 0, taxRate: 0, productId: "" }]) });
                                                                                                            }, className: "h-10 w-10 p-0 text-red-600 hover:text-red-700 hover:bg-red-100 group-hover:bg-red-50 border border-red-200", title: "Remove this line item", children: _jsx(X, { className: "w-5 h-5" }) }), _jsxs("div", { className: "text-center mt-2", children: [_jsx("div", { className: "text-xs text-slate-500 font-medium", children: "Line Total" }), _jsx("div", { className: "text-sm font-bold text-slate-900", children: formatCurrency((line.quantity * line.unitPrice) - (line.lineDiscount || 0), invoiceForm.currency) })] })] })] }) }, idx))), invoiceForm.lines.length === 0 && (_jsxs("div", { className: "text-center py-12 bg-white rounded-xl border-2 border-dashed border-slate-300", children: [_jsx("div", { className: "w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4", children: _jsx(ShoppingCart, { className: "w-8 h-8 text-slate-400" }) }), _jsx("h4", { className: "text-lg font-semibold text-slate-700 mb-2", children: "No line items added yet" }), _jsx("p", { className: "text-slate-500 mb-4", children: "Add products or services to get started" }), _jsxs(Button, { variant: "outline", onClick: () => {
                                                                                                    const lines = [{ description: "", quantity: 1, unitPrice: 0, taxRate: 0, productId: "" }];
                                                                                                    setInvoiceForm({ ...invoiceForm, lines, ...recalcTotals(lines) });
                                                                                                }, className: "h-12 px-6", children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), "Add Your First Item"] })] })), invoiceForm.lines.length > 0 && (_jsxs("div", { className: "flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200", children: [_jsxs("div", { className: "text-sm text-slate-600", children: [_jsx("span", { className: "font-medium", children: invoiceForm.lines.length }), " line item", invoiceForm.lines.length !== 1 ? 's' : '', " added"] }), _jsxs(Button, { variant: "outline", size: "sm", onClick: () => {
                                                                                                    const lines = [...invoiceForm.lines, { description: "", quantity: 1, unitPrice: 0, taxRate: 0, productId: "" }];
                                                                                                    setInvoiceForm({ ...invoiceForm, lines, ...recalcTotals(lines) });
                                                                                                }, className: "h-9", children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), "Add Another Item"] })] }))] })] }), _jsxs("div", { className: "bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 shadow-lg p-6", children: [_jsxs("div", { className: "flex items-center gap-3 mb-6", children: [_jsx("div", { className: "w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg", children: _jsx(Calculator, { className: "w-5 h-5 text-white" }) }), _jsxs("div", { children: [_jsx("h3", { className: "text-xl font-bold text-slate-900", children: "Invoice Totals" }), _jsx("p", { className: "text-sm text-slate-600", children: "Calculated automatically from line items" })] })] }), _jsx("div", { className: "bg-white rounded-xl border-2 border-green-200 shadow-lg p-6", children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex justify-between items-center py-2", children: [_jsx("span", { className: "text-slate-600 font-medium", children: "Subtotal" }), _jsx("span", { className: "text-slate-900 font-semibold text-lg", children: formatCurrency(invoiceForm.subtotal, invoiceForm.currency) })] }), _jsxs("div", { className: "flex justify-between items-center py-2", children: [_jsx("span", { className: "text-slate-600 font-medium", children: "Tax" }), _jsx("span", { className: "text-slate-900 font-semibold text-lg", children: formatCurrency(invoiceForm.taxTotal, invoiceForm.currency) })] }), invoiceForm.shipping > 0 && (_jsxs("div", { className: "flex justify-between items-center py-2", children: [_jsx("span", { className: "text-slate-600 font-medium", children: "Shipping" }), _jsx("span", { className: "text-slate-900 font-semibold text-lg", children: formatCurrency(invoiceForm.shipping, invoiceForm.currency) })] })), invoiceForm.discount > 0 && (_jsxs("div", { className: "flex justify-between items-center py-2", children: [_jsx("span", { className: "text-slate-600 font-medium", children: "Discount" }), _jsxs("span", { className: "text-red-600 font-semibold text-lg", children: ["-", formatCurrency(invoiceForm.discount, invoiceForm.currency)] })] })), _jsx("div", { className: "border-t border-slate-200 pt-4", children: _jsxs("div", { className: "flex justify-between items-center py-2", children: [_jsx("span", { className: "text-slate-900 font-bold text-xl", children: "Total" }), _jsx("span", { className: "text-slate-900 font-bold text-2xl", children: formatCurrency(invoiceForm.totalAmount, invoiceForm.currency) })] }) })] }) }), _jsx("div", { className: "mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg", children: _jsxs("div", { className: "flex items-center gap-2 text-sm text-blue-700", children: [_jsx("div", { className: "w-2 h-2 bg-blue-500 rounded-full" }), _jsxs("span", { children: ["Exchange Rate: ", exchangeRate.toFixed(4), " ", lastPriceCurrency, " \u2192 ", invoiceForm.currency, " ", lockRate ? '(locked)' : ''] })] }) })] })] })] }) }), _jsx(DialogFooter, { className: "sticky bottom-0 bg-white border-t border-slate-200 p-6", children: _jsxs("div", { className: "flex items-center justify-between w-full", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Button, { variant: "outline", onClick: () => setInvoiceDialogOpen(false), disabled: invoiceSaving, className: "h-12 px-6", children: "Cancel" }), _jsxs(Button, { variant: "outline", size: "sm", onClick: async () => {
                                                                            try {
                                                                                if (!invoices[0]) {
                                                                                    toast({ title: 'Preview unavailable', description: 'Save invoice first, then preview.', variant: 'destructive' });
                                                                                    return;
                                                                                }
                                                                                await generateInvoicePDF(invoices[0], 'preview');
                                                                            }
                                                                            catch (e) {
                                                                                toast({ title: 'Preview failed', description: e?.message || 'Failed to preview PDF', variant: 'destructive' });
                                                                            }
                                                                        }, className: "h-10", children: [_jsx(Eye, { className: "w-4 h-4 mr-2" }), "Preview PDF"] }), _jsxs(Button, { variant: "outline", size: "sm", onClick: async () => {
                                                                            try {
                                                                                if (!invoices[0]) {
                                                                                    toast({ title: 'No invoice yet', description: 'Save invoice first, then create payment link.', variant: 'destructive' });
                                                                                    return;
                                                                                }
                                                                                const resp = await apiService.createPaymentLink(invoices[0].id);
                                                                                await navigator.clipboard.writeText(resp.url);
                                                                                toast({ title: 'Payment link copied', description: resp.url });
                                                                            }
                                                                            catch (e) {
                                                                                toast({ title: 'Create link failed', description: e?.message || 'Failed to create payment link', variant: 'destructive' });
                                                                            }
                                                                        }, className: "h-10", children: [_jsx(Link, { className: "w-4 h-4 mr-2" }), "Copy Payment Link"] })] }), _jsx(Button, { onClick: async () => {
                                                                    try {
                                                                        setInvoiceSaving(true);
                                                                        setInvoiceError(null);
                                                                        if (!invoiceForm.customerId)
                                                                            throw new Error('Customer is required');
                                                                        if (!invoiceForm.invoiceNumber)
                                                                            throw new Error('Invoice number is required');
                                                                        const payload = {
                                                                            companyId: selectedCompany,
                                                                            customerId: invoiceForm.customerId,
                                                                            invoiceNumber: invoiceForm.invoiceNumber,
                                                                            issueDate: invoiceForm.issueDate,
                                                                            dueDate: invoiceForm.dueDate || undefined,
                                                                            currency: invoiceForm.currency,
                                                                            lines: invoiceForm.lines.map(l => ({
                                                                                description: l.description,
                                                                                quantity: l.quantity,
                                                                                unitPrice: l.unitPrice,
                                                                                taxRate: l.taxRate,
                                                                                lineDiscount: l.lineDiscount || 0,
                                                                                productId: l.productId || null
                                                                            })),
                                                                            // Backend model fields
                                                                            subtotal: invoiceForm.subtotal,
                                                                            taxAmount: invoiceForm.taxTotal,
                                                                            discountAmount: invoiceForm.discount,
                                                                            shippingAmount: invoiceForm.shipping,
                                                                            totalAmount: invoiceForm.totalAmount,
                                                                            balanceDue: invoiceForm.totalAmount,
                                                                            // Optional fields from form
                                                                            notes: invoiceForm.notes || '',
                                                                            terms: invoiceForm.terms || 'Payment due within 30 days',
                                                                            footer: '',
                                                                            paymentTerms: invoiceForm.paymentTerms || 'Net 30',
                                                                            lateFeeRate: null,
                                                                            deliveryMethod: 'email',
                                                                            taxInclusive: false,
                                                                            taxExemptionReason: null,
                                                                            createdBy: null,
                                                                            status: 'draft',
                                                                            // Keep custom fields for potential future use
                                                                            fxRateSnapshot: exchangeRate,
                                                                            totalsSnapshot: {
                                                                                subtotal: invoiceForm.subtotal,
                                                                                taxTotal: invoiceForm.taxTotal,
                                                                                shipping: invoiceForm.shipping,
                                                                                discountMode: invoiceForm.discountMode,
                                                                                discount: invoiceForm.discount,
                                                                                total: invoiceForm.totalAmount
                                                                            }
                                                                        };
                                                                        const created = await apiService.createInvoice(payload);
                                                                        await qc.invalidateQueries({ queryKey: ["invoices"] });
                                                                        // immediately enable PDF/Payment actions via created.id
                                                                        if (created?.id) {
                                                                            try {
                                                                                await generateInvoicePDF(created, 'preview');
                                                                            }
                                                                            catch { }
                                                                            try {
                                                                                const link = await apiService.createPaymentLink(created.id, { expiresInMinutes: 60 });
                                                                                await navigator.clipboard.writeText(link.url);
                                                                                toast({ title: 'Payment link copied', description: link.url });
                                                                            }
                                                                            catch { }
                                                                        }
                                                                        setInvoiceDialogOpen(false);
                                                                    }
                                                                    catch (e) {
                                                                        setInvoiceError(e?.message || 'Failed to create invoice');
                                                                    }
                                                                    finally {
                                                                        setInvoiceSaving(false);
                                                                    }
                                                                }, disabled: invoiceSaving, className: "h-12 px-8 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-200", children: invoiceSaving ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "w-4 h-4 mr-2 animate-spin" }), "Creating Invoice..."] })) : (_jsxs(_Fragment, { children: [_jsx(FileText, { className: "w-4 h-4 mr-2" }), "Create Invoice"] })) })] }) })] }) })] }), _jsxs(TabsContent, { value: "customers", className: "space-y-4", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx(CardTitle, { children: "Customer Directory" }), _jsxs("div", { className: "flex gap-2", children: [_jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" }), _jsx(Input, { placeholder: "Search customers...", className: "pl-10 w-64", value: customerSearch, onChange: (e) => {
                                                                                setCustomerSearch(e.target.value);
                                                                                setCustomerPage(1); // Reset to first page when searching
                                                                            } })] }), _jsxs(Button, { onClick: () => { setEditingCustomer(null); setCustomerForm({ name: "", email: "", currency: 'USD' }); setCustomerDialogOpen(true); }, children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), "Add Customer"] })] })] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [(Array.isArray(filteredCustomers) ? filteredCustomers : []).map((customer) => (_jsxs("div", { className: "group flex items-center justify-between p-6 bg-white border border-gray-100 rounded-xl hover:shadow-lg hover:border-blue-200 transition-all duration-200", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center group-hover:from-green-200 group-hover:to-green-300 transition-all duration-200", children: _jsx("span", { className: "text-green-600 font-bold text-lg", children: customer.name.charAt(0) }) }), _jsxs("div", { children: [_jsx("p", { className: "font-semibold text-gray-900 text-lg", children: customer.name }), _jsx("p", { className: "text-sm text-gray-600", children: customer.email || '—' }), _jsx("div", { className: "flex items-center gap-2 mt-1", children: _jsx(Badge, { variant: "outline", className: "text-xs", children: customer.currency || 'USD' }) })] })] }), _jsx("div", { className: "flex items-center gap-4", children: _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { variant: "outline", size: "sm", className: "hover:bg-green-50 hover:border-green-200", onClick: () => { setEditingCustomer(customer); setCustomerForm({ name: customer.name, email: customer.email, currency: customer.currency || 'USD' }); setCustomerDialogOpen(true); }, children: _jsx(Eye, { className: "w-4 h-4" }) }), _jsx(Button, { variant: "outline", size: "sm", className: "hover:bg-blue-50 hover:border-blue-200", children: _jsx(Edit, { className: "w-4 h-4" }) })] }) })] }, customer.id))), filteredCustomers.length === 0 && !loading && (_jsx("div", { className: "text-sm text-muted-foreground", children: "No customers found" })), customersQuery.data && (_jsxs("div", { className: "flex items-center justify-between pt-4 border-t", children: [_jsxs("div", { className: "text-sm text-muted-foreground", children: ["Showing ", ((customerPage - 1) * customerPageSize) + 1, " to ", Math.min(customerPage * customerPageSize, customersQuery.data.total), " of ", customersQuery.data.total, " customers"] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("select", { className: "text-sm border rounded px-2 py-1", value: customerPageSize, onChange: (e) => {
                                                                                setCustomerPageSize(Number(e.target.value));
                                                                                setCustomerPage(1); // Reset to first page when changing page size
                                                                            }, children: [_jsx("option", { value: 10, children: "10 per page" }), _jsx("option", { value: 20, children: "20 per page" }), _jsx("option", { value: 50, children: "50 per page" }), _jsx("option", { value: 100, children: "100 per page" })] }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => setCustomerPage(prev => Math.max(1, prev - 1)), disabled: !customersQuery.data.hasPrev || customersQuery.isLoading, children: "Previous" }), _jsxs("div", { className: "text-sm", children: ["Page ", customerPage, " of ", customersQuery.data.totalPages] }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => setCustomerPage(prev => prev + 1), disabled: !customersQuery.data.hasNext || customersQuery.isLoading, children: "Next" })] })] }))] }) })] }), _jsx(Dialog, { open: customerDialogOpen, onOpenChange: setCustomerDialogOpen, children: _jsxs(DialogContent, { children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: editingCustomer ? 'Edit Customer' : 'Add Customer' }), _jsx(DialogDescription, { children: "Enter customer details below." })] }), customerError && (_jsx("div", { className: "text-red-600 text-sm", children: customerError })), _jsxs("div", { className: "space-y-4 py-2", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "cust-name", children: "Name" }), _jsx(Input, { id: "cust-name", value: customerForm.name, onChange: (e) => setCustomerForm({ ...customerForm, name: e.target.value }), required: true })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "cust-email", children: "Email" }), _jsx(Input, { id: "cust-email", type: "email", value: customerForm.email || '', onChange: (e) => setCustomerForm({ ...customerForm, email: e.target.value }) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "cust-currency", children: "Currency" }), _jsx("select", { id: "cust-currency", className: "w-full border rounded px-2 py-2", value: customerForm.currency || 'USD', onChange: (e) => setCustomerForm({ ...customerForm, currency: e.target.value }), children: ['USD', 'EUR', 'GBP', 'KES', 'NGN'].map(c => (_jsx("option", { value: c, children: c }, c))) })] })] }), _jsxs(DialogFooter, { children: [_jsx(Button, { variant: "outline", onClick: () => setCustomerDialogOpen(false), disabled: customerSaving, children: "Cancel" }), _jsx(Button, { onClick: async () => {
                                                                try {
                                                                    setCustomerSaving(true);
                                                                    setCustomerError(null);
                                                                    if (!customerForm.name || customerForm.name.trim() === '') {
                                                                        throw new Error('Name is required');
                                                                    }
                                                                    if (!selectedCompany)
                                                                        throw new Error('No company selected');
                                                                    if (editingCustomer) {
                                                                        await apiService.updateCustomer(editingCustomer.id, { companyId: selectedCompany, name: customerForm.name, email: customerForm.email, currency: customerForm.currency });
                                                                        toast({ title: 'Customer updated', description: `${customerForm.name}` });
                                                                    }
                                                                    else {
                                                                        // Send selected currency now that backend accepts it
                                                                        await apiService.createCustomer({ companyId: selectedCompany, name: customerForm.name, email: customerForm.email, currency: customerForm.currency });
                                                                        toast({ title: 'Customer created', description: `${customerForm.name}` });
                                                                    }
                                                                    await qc.invalidateQueries({ queryKey: ["customers"] });
                                                                    setCustomerDialogOpen(false);
                                                                }
                                                                catch (e) {
                                                                    setCustomerError(e?.message || 'Failed to save customer');
                                                                    toast({ title: 'Customer save failed', description: e?.message || 'Failed to save customer', variant: 'destructive' });
                                                                }
                                                                finally {
                                                                    setCustomerSaving(false);
                                                                }
                                                            }, disabled: customerSaving, children: customerSaving ? 'Saving…' : (editingCustomer ? 'Save Changes' : 'Create Customer') })] })] }) })] }), _jsx(TabsContent, { value: "estimates", className: "space-y-4", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx(CardTitle, { children: "Estimates & Quotes" }), _jsxs("div", { className: "flex gap-2", children: [_jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" }), _jsx(Input, { placeholder: "Search estimates...", className: "pl-10 w-64", value: estimateSearch, onChange: (e) => {
                                                                            setEstimateSearch(e.target.value);
                                                                        } })] }), _jsxs(Button, { variant: "outline", size: "sm", children: [_jsx(Filter, { className: "w-4 h-4 mr-2" }), "Filter"] }), _jsxs(Button, { onClick: () => {
                                                                    const list = Array.isArray(allCustomers) ? allCustomers : [];
                                                                    const defaultCustomerId = list[0]?.id || "";
                                                                    const defaultCurrency = list.find(c => c.id === defaultCustomerId)?.currency || 'USD';
                                                                    setEstimateForm({
                                                                        customerId: defaultCustomerId,
                                                                        estimateNumber: '',
                                                                        issueDate: new Date().toISOString().slice(0, 10),
                                                                        expiryDate: '',
                                                                        currency: defaultCurrency,
                                                                        notes: '',
                                                                        terms: '',
                                                                        lines: [{ description: "", quantity: 1, unitPrice: 0, taxRate: 0 }]
                                                                    });
                                                                    setEstimateError(null);
                                                                    setEstimateDialogOpen(true);
                                                                }, children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), "New Estimate"] })] })] }) }), _jsxs(CardContent, { children: [error && (_jsx("div", { className: "text-red-600 text-sm mb-2", children: error?.message || error?.toString() || 'Unknown error' })), _jsxs("div", { className: "space-y-4", children: [estimatesQuery?.isLoading && (_jsx(_Fragment, { children: [0, 1, 2, 3, 4].map(i => (_jsxs("div", { className: "flex items-center justify-between p-4 border rounded-lg", children: [_jsx("div", { className: "h-4 w-32 bg-muted rounded" }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "h-4 w-24 bg-muted rounded" }), _jsx("div", { className: "h-6 w-20 bg-muted rounded" })] })] }, i))) })), !(estimatesQuery?.isLoading) && displayEstimates.map((est) => (_jsxs("div", { className: "group flex items-center justify-between p-6 bg-white border border-gray-100 rounded-xl hover:shadow-lg hover:border-blue-200 transition-all duration-200", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center group-hover:from-purple-200 group-hover:to-purple-300 transition-all duration-200", children: _jsx("span", { className: "text-purple-600 font-bold text-lg", children: "#" }) }), _jsxs("div", { children: [_jsx("p", { className: "font-semibold text-gray-900 text-lg", children: est.estimateNumber }), _jsx("p", { className: "text-sm text-gray-600", children: est.customer?.name || 'Customer' }), _jsxs("div", { className: "flex items-center gap-2 mt-1", children: [_jsx(Badge, { variant: est.status === "accepted"
                                                                                                ? "default"
                                                                                                : est.status === "sent"
                                                                                                    ? "secondary"
                                                                                                    : est.status === "rejected"
                                                                                                        ? "destructive"
                                                                                                        : "outline", className: "text-xs", children: est.status }), est.issueDate && (_jsx("span", { className: "text-xs text-gray-500", children: new Date(est.issueDate).toLocaleDateString() }))] })] })] }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("div", { className: "text-right", children: [_jsx("p", { className: "font-bold text-lg text-gray-900", children: formatCurrency(est.totalAmount, est.currency) }), _jsx("p", { className: "text-sm text-gray-500", children: est.currency })] }), _jsxs("div", { className: "flex items-center gap-2", children: [est.status === 'draft' && (_jsx(Button, { variant: "outline", size: "sm", className: "hover:bg-blue-50 hover:border-blue-200", onClick: async () => {
                                                                                        try {
                                                                                            await apiService.updateEstimate(est.id, { status: 'sent' });
                                                                                            await qc.invalidateQueries({ queryKey: ["estimates"] });
                                                                                        }
                                                                                        catch { }
                                                                                    }, children: "Mark Sent" })), est.status === 'sent' && (_jsx(Button, { size: "sm", className: "bg-green-600 hover:bg-green-700", onClick: async () => {
                                                                                        try {
                                                                                            await apiService.updateEstimate(est.id, { status: 'accepted' });
                                                                                            await qc.invalidateQueries({ queryKey: ["estimates"] });
                                                                                        }
                                                                                        catch { }
                                                                                    }, children: "Mark Accepted" })), est.status === 'accepted' && (_jsx(Button, { size: "sm", className: "bg-blue-600 hover:bg-blue-700", onClick: async () => {
                                                                                        try {
                                                                                            const invoice = await apiService.convertEstimateToInvoice(est.id);
                                                                                            await qc.invalidateQueries({ queryKey: ["estimates"] });
                                                                                            await qc.invalidateQueries({ queryKey: ["invoices"] });
                                                                                            // TODO: Show success message or redirect to invoice
                                                                                        }
                                                                                        catch { }
                                                                                    }, children: "Convert to Invoice" }))] }), _jsxs("div", { className: "flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200", children: [_jsx(Button, { variant: "ghost", size: "sm", onClick: async () => {
                                                                                        try {
                                                                                            const pdf = await apiService.getEstimatePdf(est.id);
                                                                                            const url = URL.createObjectURL(pdf);
                                                                                            window.open(url, '_blank');
                                                                                        }
                                                                                        catch { }
                                                                                    }, children: _jsx(Download, { className: "w-4 h-4" }) }), _jsx(Button, { variant: "ghost", size: "sm", onClick: async () => {
                                                                                        try {
                                                                                            setEstimateViewLoading(true);
                                                                                            setSelectedEstimate(est);
                                                                                            setEstimateViewDialogOpen(true);
                                                                                        }
                                                                                        finally {
                                                                                            setEstimateViewLoading(false);
                                                                                        }
                                                                                    }, children: _jsx(Eye, { className: "w-4 h-4" }) }), _jsx(Button, { variant: "ghost", size: "sm", onClick: async () => {
                                                                                        try {
                                                                                            setSelectedEstimate(est);
                                                                                            // Populate edit form with current estimate data
                                                                                            setEstimateEditForm({
                                                                                                customerId: est.customerId || "",
                                                                                                estimateNumber: est.estimateNumber || "",
                                                                                                issueDate: formatDateForInput(est.issueDate) || new Date().toISOString().slice(0, 10),
                                                                                                expiryDate: formatDateForInput(est.expiryDate),
                                                                                                currency: est.currency || 'USD',
                                                                                                notes: est.notes || "",
                                                                                                terms: est.terms || "",
                                                                                                lines: est.lines?.map((line) => ({
                                                                                                    description: line.description || "",
                                                                                                    quantity: line.quantity || 1,
                                                                                                    unitPrice: line.unitPrice || 0,
                                                                                                    taxRate: line.taxRate || 0
                                                                                                })) || [{ description: "", quantity: 1, unitPrice: 0, taxRate: 0 }]
                                                                                            });
                                                                                            setEstimateEditDialogOpen(true);
                                                                                        }
                                                                                        catch (error) {
                                                                                            console.error('Error preparing estimate for edit:', error);
                                                                                        }
                                                                                    }, children: _jsx(Edit, { className: "w-4 h-4" }) })] })] })] }, est.id))), displayEstimates.length === 0 && !loading && (_jsx("div", { className: "text-sm text-muted-foreground", children: "No estimates found" })), estimatesQuery.data && (_jsx("div", { className: "flex items-center justify-between pt-4 border-t", children: _jsxs("div", { className: "text-sm text-muted-foreground", children: ["Showing ", displayEstimates.length, " estimates"] }) }))] })] })] }) }), _jsx(Dialog, { open: estimateDialogOpen, onOpenChange: setEstimateDialogOpen, children: _jsxs(DialogContent, { className: "max-w-3xl max-h-[90vh] overflow-y-auto z-50", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Create Estimate" }), _jsx(DialogDescription, { children: "Fill in estimate details." })] }), estimateError && (_jsx("div", { className: "text-red-600 text-sm mb-2", children: estimateError })), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-1", children: "Customer" }), _jsxs("select", { className: "w-full border rounded px-3 py-2", value: estimateForm.customerId, onChange: (e) => {
                                                                        const cid = e.target.value;
                                                                        const cust = (Array.isArray(allCustomers) ? allCustomers : []).find((c) => c.id === cid);
                                                                        setEstimateForm(prev => ({ ...prev, customerId: cid, currency: cust?.currency || prev.currency }));
                                                                    }, children: [_jsx("option", { value: "", children: "Select customer" }), (Array.isArray(allCustomers) ? allCustomers : []).map((c) => (_jsxs("option", { value: c.id, children: [c.name, " ", c.email ? `(${c.email})` : ''] }, c.id)))] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-1", children: "Estimate Number" }), _jsx(Input, { placeholder: "e.g. EST-2025-0001", value: estimateForm.estimateNumber, onChange: (e) => setEstimateForm(prev => ({ ...prev, estimateNumber: e.target.value })) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-1", children: "Issue Date" }), _jsx(Input, { type: "date", value: estimateForm.issueDate, onChange: (e) => setEstimateForm(prev => ({ ...prev, issueDate: e.target.value })) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-1", children: "Expiry Date" }), _jsx(Input, { type: "date", value: estimateForm.expiryDate || '', onChange: (e) => setEstimateForm(prev => ({ ...prev, expiryDate: e.target.value })) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-1", children: "Currency" }), _jsx(Input, { value: estimateForm.currency, onChange: (e) => setEstimateForm(prev => ({ ...prev, currency: e.target.value.toUpperCase().slice(0, 3) })) })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-2", children: "Line Items" }), _jsxs("div", { className: "space-y-3", children: [estimateForm.lines.map((line, idx) => (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-12 gap-2 items-center", children: [_jsx("div", { className: "md:col-span-5", children: _jsx(Input, { placeholder: "Description", value: line.description, onChange: (e) => {
                                                                                    const lines = [...estimateForm.lines];
                                                                                    lines[idx] = { ...lines[idx], description: e.target.value };
                                                                                    setEstimateForm(prev => ({ ...prev, lines }));
                                                                                } }) }), _jsx("div", { className: "md:col-span-2", children: _jsx(Input, { type: "number", min: 0, step: 1, placeholder: "Qty", value: line.quantity, onChange: (e) => {
                                                                                    const lines = [...estimateForm.lines];
                                                                                    lines[idx] = { ...lines[idx], quantity: Number(e.target.value) };
                                                                                    setEstimateForm(prev => ({ ...prev, lines }));
                                                                                } }) }), _jsx("div", { className: "md:col-span-3", children: _jsx(Input, { type: "number", min: 0, step: 0.01, placeholder: "Unit Price", value: line.unitPrice, onChange: (e) => {
                                                                                    const lines = [...estimateForm.lines];
                                                                                    lines[idx] = { ...lines[idx], unitPrice: Number(e.target.value) };
                                                                                    setEstimateForm(prev => ({ ...prev, lines }));
                                                                                } }) }), _jsx("div", { className: "md:col-span-2", children: _jsx(Input, { type: "number", min: 0, max: 100, step: 0.01, placeholder: "Tax %", value: line.taxRate, onChange: (e) => {
                                                                                    const lines = [...estimateForm.lines];
                                                                                    lines[idx] = { ...lines[idx], taxRate: Number(e.target.value) };
                                                                                    setEstimateForm(prev => ({ ...prev, lines }));
                                                                                } }) })] }, idx))), _jsx("div", { children: _jsx(Button, { type: "button", variant: "outline", size: "sm", onClick: () => setEstimateForm(prev => ({ ...prev, lines: [...prev.lines, { description: "", quantity: 1, unitPrice: 0, taxRate: 0 }] })), children: "Add Line" }) })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-1", children: "Notes" }), _jsx("textarea", { className: "w-full border rounded px-3 py-2 min-h-[80px]", value: estimateForm.notes, onChange: (e) => setEstimateForm(prev => ({ ...prev, notes: e.target.value })) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-1", children: "Terms" }), _jsx("textarea", { className: "w-full border rounded px-3 py-2 min-h-[80px]", value: estimateForm.terms, onChange: (e) => setEstimateForm(prev => ({ ...prev, terms: e.target.value })) })] })] })] }), _jsxs(DialogFooter, { className: "sticky bottom-0 bg-white", children: [_jsx(Button, { variant: "outline", onClick: () => setEstimateDialogOpen(false), disabled: estimateSaving, children: "Cancel" }), _jsx(Button, { onClick: async () => {
                                                        try {
                                                            setEstimateSaving(true);
                                                            setEstimateError(null);
                                                            if (!selectedCompany)
                                                                throw new Error('No company selected');
                                                            if (!estimateForm.customerId)
                                                                throw new Error('Customer is required');
                                                            if (!estimateForm.estimateNumber)
                                                                throw new Error('Estimate number is required');
                                                            if (!estimateForm.issueDate)
                                                                throw new Error('Issue date is required');
                                                            const payload = {
                                                                companyId: selectedCompany,
                                                                customerId: estimateForm.customerId,
                                                                estimateNumber: estimateForm.estimateNumber,
                                                                issueDate: estimateForm.issueDate,
                                                                expiryDate: estimateForm.expiryDate || undefined,
                                                                currency: estimateForm.currency || 'USD',
                                                                notes: estimateForm.notes || undefined,
                                                                terms: estimateForm.terms || undefined,
                                                                lines: estimateForm.lines.map(l => ({
                                                                    description: l.description,
                                                                    quantity: Number(l.quantity) || 0,
                                                                    unitPrice: Number(l.unitPrice) || 0,
                                                                    taxRate: Number(l.taxRate) || 0,
                                                                }))
                                                            };
                                                            await apiService.createEstimate(payload);
                                                            await qc.invalidateQueries({ queryKey: ["estimates"] });
                                                            toast({ title: 'Estimate created', description: payload.estimateNumber });
                                                            setEstimateDialogOpen(false);
                                                        }
                                                        catch (e) {
                                                            setEstimateError(e?.message || 'Failed to create estimate');
                                                            toast({ title: 'Estimate creation failed', description: e?.message || 'Failed to create estimate', variant: 'destructive' });
                                                        }
                                                        finally {
                                                            setEstimateSaving(false);
                                                        }
                                                    }, disabled: estimateSaving, children: estimateSaving ? 'Creating…' : 'Create Estimate' })] })] }) }), _jsx(Dialog, { open: estimateViewDialogOpen, onOpenChange: setEstimateViewDialogOpen, children: _jsxs(DialogContent, { className: "max-w-4xl max-h-[90vh] overflow-y-auto z-50", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Estimate Details" }), _jsx(DialogDescription, { children: "View estimate information and details." })] }), selectedEstimate && (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold mb-4", children: "Estimate Information" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-600", children: "Estimate Number" }), _jsx("p", { className: "text-lg font-semibold", children: selectedEstimate.estimateNumber })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-600", children: "Customer" }), _jsx("p", { className: "text-lg", children: selectedEstimate.customer?.name || 'N/A' })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-600", children: "Status" }), _jsx(Badge, { variant: selectedEstimate.status === "accepted"
                                                                                        ? "default"
                                                                                        : selectedEstimate.status === "sent"
                                                                                            ? "secondary"
                                                                                            : selectedEstimate.status === "rejected"
                                                                                                ? "destructive"
                                                                                                : "outline", className: "text-sm", children: selectedEstimate.status })] })] })] }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold mb-4", children: "Dates & Amounts" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-600", children: "Issue Date" }), _jsx("p", { children: selectedEstimate.issueDate ? new Date(selectedEstimate.issueDate).toLocaleDateString() : 'N/A' })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-600", children: "Expiry Date" }), _jsx("p", { children: selectedEstimate.expiryDate ? new Date(selectedEstimate.expiryDate).toLocaleDateString() : 'N/A' })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-600", children: "Total Amount" }), _jsx("p", { className: "text-xl font-bold text-green-600", children: formatCurrency(selectedEstimate.totalAmount, selectedEstimate.currency) })] })] })] })] }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold mb-4", children: "Line Items" }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full border-collapse border border-gray-200", children: [_jsx("thead", { children: _jsxs("tr", { className: "bg-gray-50", children: [_jsx("th", { className: "border border-gray-200 px-4 py-2 text-left", children: "Description" }), _jsx("th", { className: "border border-gray-200 px-4 py-2 text-right", children: "Qty" }), _jsx("th", { className: "border border-gray-200 px-4 py-2 text-right", children: "Unit Price" }), _jsx("th", { className: "border border-gray-200 px-4 py-2 text-right", children: "Tax Rate" }), _jsx("th", { className: "border border-gray-200 px-4 py-2 text-right", children: "Total" })] }) }), _jsx("tbody", { children: selectedEstimate.lines?.map((line, index) => (_jsxs("tr", { children: [_jsx("td", { className: "border border-gray-200 px-4 py-2", children: line.description || '-' }), _jsx("td", { className: "border border-gray-200 px-4 py-2 text-right", children: line.quantity || 0 }), _jsx("td", { className: "border border-gray-200 px-4 py-2 text-right", children: formatCurrency(line.unitPrice || 0, selectedEstimate.currency) }), _jsxs("td", { className: "border border-gray-200 px-4 py-2 text-right", children: [line.taxRate || 0, "%"] }), _jsx("td", { className: "border border-gray-200 px-4 py-2 text-right", children: formatCurrency(line.lineTotal || 0, selectedEstimate.currency) })] }, index))) })] }) })] }), (selectedEstimate.notes || selectedEstimate.terms) && (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [selectedEstimate.notes && (_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold mb-2", children: "Notes" }), _jsx("p", { className: "text-gray-700 whitespace-pre-wrap", children: selectedEstimate.notes })] })), selectedEstimate.terms && (_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold mb-2", children: "Terms" }), _jsx("p", { className: "text-gray-700 whitespace-pre-wrap", children: selectedEstimate.terms })] }))] }))] })), _jsxs(DialogFooter, { children: [_jsx(Button, { variant: "outline", onClick: () => setEstimateViewDialogOpen(false), children: "Close" }), _jsx(Button, { onClick: () => {
                                                        if (selectedEstimate) {
                                                            // Switch to edit mode
                                                            setEstimateEditForm({
                                                                customerId: selectedEstimate.customerId || "",
                                                                estimateNumber: selectedEstimate.estimateNumber || "",
                                                                issueDate: formatDateForInput(selectedEstimate.issueDate) || new Date().toISOString().slice(0, 10),
                                                                expiryDate: formatDateForInput(selectedEstimate.expiryDate),
                                                                currency: selectedEstimate.currency || 'USD',
                                                                notes: selectedEstimate.notes || "",
                                                                terms: selectedEstimate.terms || "",
                                                                lines: selectedEstimate.lines?.map((line) => ({
                                                                    description: line.description || "",
                                                                    quantity: line.quantity || 1,
                                                                    unitPrice: line.unitPrice || 0,
                                                                    taxRate: line.taxRate || 0
                                                                })) || [{ description: "", quantity: 1, unitPrice: 0, taxRate: 0 }]
                                                            });
                                                            setEstimateViewDialogOpen(false);
                                                            setEstimateEditDialogOpen(true);
                                                        }
                                                    }, children: "Edit Estimate" })] })] }) }), _jsx(Dialog, { open: estimateEditDialogOpen, onOpenChange: setEstimateEditDialogOpen, children: _jsxs(DialogContent, { className: "max-w-3xl max-h-[90vh] overflow-y-auto z-50", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Edit Estimate" }), _jsx(DialogDescription, { children: "Update estimate details and information." })] }), _jsxs("div", { className: "space-y-4", children: [estimateError && (_jsx("div", { className: "text-red-600 text-sm mb-2", children: estimateError })), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-1", children: "Customer" }), _jsxs("select", { className: "w-full border rounded px-3 py-2", value: estimateEditForm.customerId, onChange: (e) => {
                                                                        const cid = e.target.value;
                                                                        const cust = (Array.isArray(allCustomers) ? allCustomers : []).find((c) => c.id === cid);
                                                                        setEstimateEditForm(prev => ({ ...prev, customerId: cid, currency: cust?.currency || prev.currency }));
                                                                    }, children: [_jsx("option", { value: "", children: "Select customer" }), (Array.isArray(allCustomers) ? allCustomers : []).map((cust) => (_jsx("option", { value: cust.id, children: cust.name }, cust.id)))] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-1", children: "Estimate Number" }), _jsx(Input, { placeholder: "e.g. EST-2025-0001", value: estimateEditForm.estimateNumber, onChange: (e) => setEstimateEditForm(prev => ({ ...prev, estimateNumber: e.target.value })) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-1", children: "Issue Date" }), _jsx(Input, { type: "date", value: estimateEditForm.issueDate, onChange: (e) => setEstimateEditForm(prev => ({ ...prev, issueDate: e.target.value })) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-1", children: "Expiry Date" }), _jsx(Input, { type: "date", value: estimateEditForm.expiryDate || '', onChange: (e) => setEstimateEditForm(prev => ({ ...prev, expiryDate: e.target.value })) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-1", children: "Currency" }), _jsx(Input, { value: estimateEditForm.currency, onChange: (e) => setEstimateEditForm(prev => ({ ...prev, currency: e.target.value.toUpperCase().slice(0, 3) })) })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-2", children: "Line Items" }), _jsxs("div", { className: "space-y-3", children: [estimateEditForm.lines.map((line, idx) => (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-12 gap-2 items-center", children: [_jsx("div", { className: "md:col-span-5", children: _jsx(Input, { placeholder: "Description", value: line.description, onChange: (e) => {
                                                                                    const lines = [...estimateEditForm.lines];
                                                                                    lines[idx] = { ...lines[idx], description: e.target.value };
                                                                                    setEstimateEditForm(prev => ({ ...prev, lines }));
                                                                                } }) }), _jsx("div", { className: "md:col-span-2", children: _jsx(Input, { type: "number", min: 0, step: 1, placeholder: "Qty", value: line.quantity, onChange: (e) => {
                                                                                    const lines = [...estimateEditForm.lines];
                                                                                    lines[idx] = { ...lines[idx], quantity: Number(e.target.value) };
                                                                                    setEstimateEditForm(prev => ({ ...prev, lines }));
                                                                                } }) }), _jsx("div", { className: "md:col-span-3", children: _jsx(Input, { type: "number", min: 0, step: 0.01, placeholder: "Unit Price", value: line.unitPrice, onChange: (e) => {
                                                                                    const lines = [...estimateEditForm.lines];
                                                                                    lines[idx] = { ...lines[idx], unitPrice: Number(e.target.value) };
                                                                                    setEstimateEditForm(prev => ({ ...prev, lines }));
                                                                                } }) }), _jsx("div", { className: "md:col-span-2", children: _jsx(Input, { type: "number", min: 0, max: 100, step: 0.01, placeholder: "Tax %", value: line.taxRate, onChange: (e) => {
                                                                                    const lines = [...estimateEditForm.lines];
                                                                                    lines[idx] = { ...lines[idx], taxRate: Number(e.target.value) };
                                                                                    setEstimateEditForm(prev => ({ ...prev, lines }));
                                                                                } }) })] }, idx))), _jsx(Button, { type: "button", variant: "outline", onClick: () => {
                                                                        setEstimateEditForm(prev => ({ ...prev, lines: [...prev.lines, { description: "", quantity: 1, unitPrice: 0, taxRate: 0 }] }));
                                                                    }, children: "Add Line Item" })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-1", children: "Notes" }), _jsx("textarea", { className: "w-full border rounded px-3 py-2 min-h-[80px]", value: estimateEditForm.notes, onChange: (e) => setEstimateEditForm(prev => ({ ...prev, notes: e.target.value })) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-1", children: "Terms" }), _jsx("textarea", { className: "w-full border rounded px-3 py-2 min-h-[80px]", value: estimateEditForm.terms, onChange: (e) => setEstimateEditForm(prev => ({ ...prev, terms: e.target.value })) })] })] })] }), _jsxs(DialogFooter, { className: "sticky bottom-0 bg-white", children: [_jsx(Button, { variant: "outline", onClick: () => setEstimateEditDialogOpen(false), disabled: estimateSaving, children: "Cancel" }), _jsx(Button, { onClick: async () => {
                                                        try {
                                                            setEstimateSaving(true);
                                                            setEstimateError(null);
                                                            if (!selectedEstimate)
                                                                throw new Error('No estimate selected');
                                                            if (!estimateEditForm.customerId)
                                                                throw new Error('Customer is required');
                                                            if (!estimateEditForm.estimateNumber)
                                                                throw new Error('Estimate number is required');
                                                            if (!estimateEditForm.issueDate)
                                                                throw new Error('Issue date is required');
                                                            const payload = {
                                                                customerId: estimateEditForm.customerId,
                                                                estimateNumber: estimateEditForm.estimateNumber,
                                                                issueDate: estimateEditForm.issueDate,
                                                                expiryDate: estimateEditForm.expiryDate || undefined,
                                                                currency: estimateEditForm.currency || 'USD',
                                                                notes: estimateEditForm.notes || undefined,
                                                                terms: estimateEditForm.terms || undefined,
                                                                lines: estimateEditForm.lines.map(l => ({
                                                                    description: l.description,
                                                                    quantity: Number(l.quantity) || 0,
                                                                    unitPrice: Number(l.unitPrice) || 0,
                                                                    taxRate: Number(l.taxRate) || 0,
                                                                }))
                                                            };
                                                            await apiService.updateEstimate(selectedEstimate.id, payload);
                                                            await qc.invalidateQueries({ queryKey: ["estimates"] });
                                                            toast({ title: 'Estimate updated', description: payload.estimateNumber });
                                                            setEstimateEditDialogOpen(false);
                                                            setEstimateError(null);
                                                        }
                                                        catch (error) {
                                                            setEstimateError(error?.message || 'Failed to update estimate');
                                                        }
                                                        finally {
                                                            setEstimateSaving(false);
                                                        }
                                                    }, disabled: estimateSaving, children: estimateSaving ? 'Updating…' : 'Update Estimate' })] })] }) }), _jsx(TabsContent, { value: "recurring", className: "space-y-4", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx(CardTitle, { children: "Recurring Invoices" }), _jsxs("div", { className: "flex gap-2", children: [_jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" }), _jsx(Input, { placeholder: "Search recurring invoices...", className: "pl-10 w-64", value: recurringSearch, onChange: (e) => {
                                                                            setRecurringSearch(e.target.value);
                                                                            setRecurringPage(1); // Reset to first page when searching
                                                                        } })] }), _jsxs("select", { className: "text-sm border rounded px-3 py-2", value: recurringStatus, onChange: (e) => {
                                                                    setRecurringStatus(e.target.value);
                                                                    setRecurringPage(1); // Reset to first page when filtering
                                                                }, children: [_jsx("option", { value: "", children: "All Status" }), _jsx("option", { value: "active", children: "Active" }), _jsx("option", { value: "paused", children: "Paused" }), _jsx("option", { value: "completed", children: "Completed" }), _jsx("option", { value: "cancelled", children: "Cancelled" })] }), _jsxs(Button, { onClick: () => {
                                                                    const safeCustomers = Array.isArray(customers) ? customers : [];
                                                                    setRecurringForm({
                                                                        ...defaultRecurringForm,
                                                                        customerId: safeCustomers[0]?.id || "",
                                                                        currency: safeCustomers[0]?.currency || 'USD',
                                                                        startDate: new Date().toISOString().slice(0, 10)
                                                                    });
                                                                    setEditingRecurring(null);
                                                                    setRecurringDialogOpen(true);
                                                                }, children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), "New Recurring Invoice"] })] })] }) }), _jsxs(CardContent, { children: [recurringInvoicesQuery?.isLoading && (_jsx(_Fragment, { children: [0, 1, 2, 3, 4].map(i => (_jsxs("div", { className: "flex items-center justify-between p-4 border rounded-lg", children: [_jsx("div", { className: "h-4 w-32 bg-muted rounded" }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "h-4 w-20 bg-muted rounded" }), _jsx("div", { className: "h-4 w-16 bg-muted rounded" })] })] }, i))) })), !(recurringInvoicesQuery?.isLoading) && displayRecurringInvoices.map((rec) => (_jsxs("div", { className: "group flex items-center justify-between p-6 bg-white border border-gray-100 rounded-xl hover:shadow-lg hover:border-blue-200 transition-all duration-200", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center group-hover:from-orange-200 group-hover:to-orange-300 transition-all duration-200", children: _jsx("span", { className: "text-orange-600 font-bold text-lg", children: "\uD83D\uDD04" }) }), _jsxs("div", { children: [_jsx("p", { className: "font-semibold text-gray-900 text-lg", children: rec.name }), _jsx("p", { className: "text-sm text-gray-600", children: rec.customer?.name }), _jsxs("div", { className: "flex items-center gap-2 mt-1", children: [_jsx(Badge, { variant: rec.status === 'active' ? 'default' : rec.status === 'paused' ? 'secondary' : 'outline', className: "text-xs", children: rec.status }), _jsx(Badge, { variant: "outline", className: "text-xs", children: rec.frequency }), _jsxs("span", { className: "text-xs text-gray-500", children: ["$", (Number(rec.totalAmount) || 0).toFixed(2), " ", rec.currency] })] }), _jsxs("div", { className: "text-xs text-gray-500 mt-1", children: ["Next: ", new Date(rec.nextRunDate).toLocaleDateString(), rec.lastRunDate && ` • Last: ${new Date(rec.lastRunDate).toLocaleDateString()}`, rec._count?.generatedInvoices && ` • ${rec._count.generatedInvoices} invoices`] })] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs(Select, { value: rec.status, onValueChange: (value) => handleStatusChange(rec, value), children: [_jsx(SelectTrigger, { className: "w-24 h-8", children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "active", children: "Active" }), _jsx(SelectItem, { value: "paused", children: "Paused" }), _jsx(SelectItem, { value: "completed", children: "Completed" }), _jsx(SelectItem, { value: "cancelled", children: "Cancelled" })] })] }), _jsxs("div", { className: "flex gap-1", children: [_jsx(Button, { variant: "outline", size: "sm", onClick: () => handleViewRecurring(rec), className: "hover:bg-blue-50 hover:border-blue-200", children: _jsx(Eye, { className: "w-4 h-4" }) }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => handleEditRecurring(rec), className: "hover:bg-orange-50 hover:border-orange-200", children: _jsx(Edit, { className: "w-4 h-4" }) }), rec.status === 'active' && (_jsx(Button, { variant: "outline", size: "sm", onClick: () => handleGenerateRecurring(rec), disabled: generateRecurringMutation.isPending, className: "hover:bg-green-50 hover:border-green-200", children: generateRecurringMutation.isPending ? (_jsx(Loader2, { className: "w-4 h-4 animate-spin" })) : (_jsx(RefreshCw, { className: "w-4 h-4" })) }))] })] })] }, rec.id))), !(recurringInvoicesQuery?.isLoading) && displayRecurringInvoices.length === 0 && (_jsxs("div", { className: "text-center py-8", children: [_jsx("p", { className: "text-muted-foreground mb-4", children: "No recurring invoices found" }), _jsxs(Button, { onClick: () => {
                                                                const safeCustomers = Array.isArray(customers) ? customers : [];
                                                                const newForm = { ...defaultRecurringForm };
                                                                newForm.customerId = safeCustomers[0]?.id || "";
                                                                newForm.currency = safeCustomers[0]?.currency || 'USD';
                                                                newForm.startDate = new Date().toISOString().slice(0, 10);
                                                                setRecurringForm(newForm);
                                                                setEditingRecurring(null);
                                                                setRecurringDialogOpen(true);
                                                            }, children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), "Create Recurring Invoice"] })] })), recurringInvoicesQuery.data && (_jsxs("div", { className: "flex items-center justify-between pt-4 border-t", children: [_jsxs("div", { className: "text-sm text-muted-foreground", children: ["Showing ", ((recurringPage - 1) * recurringPageSize) + 1, " to ", Math.min(recurringPage * recurringPageSize, recurringInvoicesQuery.data.total), " of ", recurringInvoicesQuery.data.total, " recurring invoices"] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("select", { className: "text-sm border rounded px-2 py-1", value: recurringPageSize, onChange: (e) => {
                                                                        setRecurringPageSize(Number(e.target.value));
                                                                        setRecurringPage(1);
                                                                    }, children: [_jsx("option", { value: 10, children: "10 per page" }), _jsx("option", { value: 20, children: "20 per page" }), _jsx("option", { value: 50, children: "50 per page" })] }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => setRecurringPage(prev => prev - 1), disabled: !recurringInvoicesQuery.data.hasPrev || recurringInvoicesQuery.isLoading, children: "Previous" }), _jsxs("div", { className: "text-sm", children: ["Page ", recurringPage, " of ", recurringInvoicesQuery.data.totalPages] }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => setRecurringPage(prev => prev + 1), disabled: !recurringInvoicesQuery.data.hasNext || recurringInvoicesQuery.isLoading, children: "Next" })] })] }))] })] }) }), _jsx(TabsContent, { value: "approvals", className: "space-y-4", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Invoices Pending Approval" }) }), _jsx(CardContent, { children: (() => {
                                                const pendingInvoices = (invoicesQuery.data || invoices).filter(inv => inv.status === 'draft' || inv.status === 'sent');
                                                return pendingInvoices.length === 0 ? (_jsxs("div", { className: "text-center py-8", children: [_jsx(CheckCircle, { className: "mx-auto h-12 w-12 text-gray-400" }), _jsx("p", { className: "mt-2 text-sm text-gray-500", children: invoicesQuery.isLoading ? 'Loading invoices...' : 'No invoices pending approval' }), _jsxs("p", { className: "text-xs text-gray-400 mt-1", children: ["Total invoices: ", (invoicesQuery.data || invoices).length] })] })) : (_jsxs("div", { className: "space-y-4", children: [_jsxs("p", { className: "text-sm text-blue-600 mb-4", children: ["Found ", pendingInvoices.length, " draft invoices for approval:"] }), pendingInvoices.map((invoice, index) => (_jsxs("div", { className: "border rounded-lg p-4 bg-gray-50", children: [_jsxs("h4", { className: "font-medium text-gray-900 mb-2", children: ["Invoice #", invoice.invoiceNumber || invoice.id] }), _jsxs("div", { className: "text-sm text-gray-600 mb-3", children: [_jsxs("p", { children: ["Status: ", _jsx("span", { className: "font-medium capitalize", children: invoice.status })] }), _jsxs("p", { children: ["Amount: ", _jsxs("span", { className: "font-medium", children: ["$", invoice.totalAmount || 'N/A'] })] }), _jsxs("p", { children: ["Customer: ", _jsx("span", { className: "font-medium", children: ((Array.isArray(customers) ? customers : []).find(c => c.id === invoice.customerId)?.name) || 'N/A' })] }), _jsxs("p", { children: ["Due Date: ", _jsx("span", { className: "font-medium", children: invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A' })] })] }), _jsxs("div", { className: "flex gap-2", children: [invoice.status === 'draft' && (_jsxs(Button, { size: "sm", className: "bg-teal-600 hover:bg-teal-700", onClick: async () => {
                                                                                try {
                                                                                    await apiService.updateInvoice(invoice.id, { status: 'sent' });
                                                                                    await qc.invalidateQueries({ queryKey: ["invoices"] });
                                                                                }
                                                                                catch { }
                                                                            }, children: [_jsx(CheckCircle, { className: "w-4 h-4 mr-2" }), "Approve"] })), (invoice.status === 'sent' || invoice.status === 'pending') && (_jsxs(Button, { size: "sm", className: "bg-teal-600 hover:bg-teal-700", onClick: async () => {
                                                                                try {
                                                                                    await apiService.updateInvoice(invoice.id, { status: 'paid', balanceDue: 0 });
                                                                                    await qc.invalidateQueries({ queryKey: ["invoices"] });
                                                                                }
                                                                                catch { }
                                                                            }, children: [_jsx(CheckCircle, { className: "w-4 h-4 mr-2" }), "Mark Paid"] })), _jsxs(Button, { variant: "destructive", size: "sm", onClick: async () => {
                                                                                try {
                                                                                    await apiService.updateInvoice(invoice.id, { status: 'cancelled' });
                                                                                    await qc.invalidateQueries({ queryKey: ["invoices"] });
                                                                                }
                                                                                catch { }
                                                                            }, children: [_jsx(XCircle, { className: "w-4 h-4 mr-2" }), "Reject"] })] })] }, invoice.id)))] }));
                                            })() })] }) }), _jsx(TabsContent, { value: "ai-create", className: "space-y-4", children: _jsx(NaturalLanguageInvoice, { onInvoiceCreated: (invoice) => {
                                        // Refresh invoices list when new invoice is created
                                        qc.invalidateQueries({ queryKey: ["invoices"] });
                                        toast({ title: 'Invoice created', description: `Invoice ${invoice.invoiceNumber} created successfully!` });
                                    } }) }), _jsx(TabsContent, { value: "ai-chat", className: "space-y-4", children: _jsx(AIAccountingChat, { onActionExecuted: (action, result) => {
                                        // Refresh relevant data when actions are executed
                                        qc.invalidateQueries({ queryKey: ["invoices"] });
                                        qc.invalidateQueries({ queryKey: ["expenses"] });
                                        qc.invalidateQueries({ queryKey: ["customers"] });
                                        qc.invalidateQueries({ queryKey: ["financial-insights"] });
                                        toast({ title: 'Success', description: `Action ${action} executed successfully!` });
                                    } }) })] }) }), _jsx(Dialog, { open: sendEmailOpen, onOpenChange: (o) => { setSendEmailOpen(o); if (!o) {
                        setSendEmailInvoiceId(null);
                        setSendEmailTo('');
                    } }, children: _jsxs(DialogContent, { className: "max-w-md", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Send Invoice PDF" }), _jsx(DialogDescription, { children: "Enter the recipient email address." })] }), _jsxs("div", { className: "space-y-3 py-2", children: [_jsx(Label, { htmlFor: "send-email-to", children: "Email" }), _jsx(Input, { id: "send-email-to", type: "email", placeholder: "name@example.com", value: sendEmailTo, onChange: (e) => setSendEmailTo(e.target.value) })] }), _jsxs(DialogFooter, { children: [_jsx(Button, { variant: "outline", onClick: () => setSendEmailOpen(false), disabled: sendEmailLoading, children: "Cancel" }), _jsx(Button, { disabled: sendEmailLoading || !sendEmailInvoiceId || !sendEmailTo, onClick: async () => {
                                            if (!sendEmailInvoiceId || !sendEmailTo)
                                                return;
                                            try {
                                                setSendEmailLoading(true);
                                                // Find the invoice data
                                                const invoice = invoices.find(inv => inv.id === sendEmailInvoiceId);
                                                if (!invoice) {
                                                    toast({ title: 'Invoice Not Found', description: 'Could not find invoice data for email generation.', variant: 'destructive' });
                                                    return;
                                                }
                                                // Find customer data
                                                const customer = customers.find(c => c.id === invoice.customerId);
                                                // Generate PDF using frontend generator
                                                const generator = new InvoicePDFGenerator({
                                                    invoice: {
                                                        id: invoice.id,
                                                        invoiceNumber: invoice.invoiceNumber,
                                                        issueDate: invoice.issueDate,
                                                        dueDate: invoice.dueDate,
                                                        status: invoice.status,
                                                        totalAmount: invoice.totalAmount,
                                                        balanceDue: invoice.balanceDue,
                                                        currency: customer?.currency || 'USD',
                                                        subtotal: invoice.subtotal || invoice.totalAmount,
                                                        taxAmount: invoice.taxAmount || 0,
                                                        discountAmount: invoice.discountAmount || 0,
                                                        customer: customer ? {
                                                            name: customer.name,
                                                            email: customer.email,
                                                            address: customer.address,
                                                            phone: customer.phone,
                                                            taxId: customer.taxId
                                                        } : undefined,
                                                        lines: invoice.lines || [],
                                                        notes: invoice.notes,
                                                        paymentUrl: invoice.paymentUrl
                                                    },
                                                    company: {
                                                        name: 'Your Company',
                                                        logoUrl: undefined,
                                                        primaryColor: '#009688',
                                                        secondaryColor: '#1565c0',
                                                        address: undefined,
                                                        city: undefined,
                                                        state: undefined,
                                                        postalCode: undefined,
                                                        email: undefined,
                                                        phone: undefined,
                                                        website: undefined,
                                                        fontFamily: 'Inter',
                                                        invoiceTerms: 'Payment is due within 30 days of invoice date.',
                                                        invoiceFooter: 'Thank you for your business!'
                                                    }
                                                });
                                                // Generate PDF blob
                                                const pdfBlob = await generator.generate();
                                                console.log('🔍 Frontend PDF Debug:', {
                                                    pdfBlobSize: pdfBlob.size,
                                                    pdfBlobType: pdfBlob.type,
                                                    pdfBlobConstructor: pdfBlob.constructor.name,
                                                    invoiceId: invoice.id,
                                                    invoiceNumber: invoice.invoiceNumber
                                                });
                                                console.log('🔍 About to call API service with:', {
                                                    invoiceId: invoice.id,
                                                    to: sendEmailTo,
                                                    attachPdf: true,
                                                    hasPdfBlob: !!pdfBlob
                                                });
                                                // Send email with frontend-generated PDF
                                                await apiService.sendInvoiceEmail(invoice.id, {
                                                    to: sendEmailTo,
                                                    subject: `Invoice ${invoice.invoiceNumber}`,
                                                    message: `Please find your invoice ${invoice.invoiceNumber} attached. Thank you for your business!`,
                                                    attachPdf: true,
                                                    pdfBlob: pdfBlob
                                                });
                                                toast({ title: 'Invoice sent', description: `Invoice ${invoice.invoiceNumber} sent to ${sendEmailTo}` });
                                                setSendEmailOpen(false);
                                            }
                                            catch (e) {
                                                console.error('Error sending invoice email:', e);
                                                // Fallback to backend API if frontend generation fails
                                                try {
                                                    await apiService.sendInvoiceEmail(sendEmailInvoiceId, { to: sendEmailTo, attachPdf: true });
                                                    toast({ title: 'Invoice sent', description: sendEmailTo });
                                                    setSendEmailOpen(false);
                                                }
                                                catch (backendError) {
                                                    console.error('Backend email sending also failed:', backendError);
                                                    toast({ title: 'Send failed', description: e?.message || 'Failed to send', variant: 'destructive' });
                                                }
                                            }
                                            finally {
                                                setSendEmailLoading(false);
                                            }
                                        }, children: sendEmailLoading ? 'Sending…' : 'Send PDF' })] })] }) }), _jsx(Dialog, { open: detailsOpen, onOpenChange: (open) => {
                        setDetailsOpen(open);
                        if (!open && detailsPdfUrl) {
                            URL.revokeObjectURL(detailsPdfUrl);
                            setDetailsPdfUrl(null);
                        }
                    }, children: _jsxs(DialogContent, { className: "!max-w-7xl max-h-[95vh] overflow-y-auto w-[95vw] md:max-h-[90vh] md:w-[90vw] flex flex-col", children: [_jsxs(DialogHeader, { className: "pb-6 border-b border-slate-200", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center", children: _jsx(Eye, { className: "w-5 h-5 text-white" }) }), _jsxs("div", { children: [_jsx(DialogTitle, { className: "text-2xl font-bold text-slate-900", children: "Invoice Preview" }), _jsx(DialogDescription, { className: "text-slate-600 mt-1", children: detailsInvoice ? `Previewing Invoice ${detailsInvoice.invoiceNumber}` : 'Loading invoice details...' })] })] }), detailsLoading && (_jsx("div", { className: "mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm", children: "Loading invoice details..." }))] }), !detailsLoading && detailsInvoice && (_jsx("div", { className: "flex-1 overflow-y-auto max-h-[calc(95vh-200px)] md:max-h-[calc(90vh-200px)] scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 hover:scrollbar-thumb-slate-400 relative", children: _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-4 gap-6 py-6 pr-2", children: [_jsxs("div", { className: "lg:col-span-1 space-y-6", children: [_jsxs("div", { className: "bg-slate-50 rounded-xl p-6", children: [_jsxs("h3", { className: "text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2", children: [_jsx(RefreshCw, { className: "w-5 h-5 text-green-600" }), "Quick Actions"] }), _jsx("div", { className: "mb-6", children: _jsx(AccountingIntegrationStatus, { invoiceId: detailsInvoice?.id || '', invoiceNumber: detailsInvoice?.invoiceNumber || '' }) }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { className: "text-sm font-medium text-slate-700", children: "Status" }), _jsxs(Select, { value: detailsStatus, onValueChange: setDetailsStatus, children: [_jsx(SelectTrigger, { className: "h-12 bg-white border-slate-300", children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "draft", children: "Draft" }), _jsx(SelectItem, { value: "sent", children: "Sent" }), _jsx(SelectItem, { value: "paid", children: "Paid" }), _jsx(SelectItem, { value: "overdue", children: "Overdue" })] })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { className: "text-sm font-medium text-slate-700", children: "Due Date" }), _jsx(Input, { type: "date", value: detailsDueDate, onChange: (e) => setDetailsDueDate(e.target.value), className: "h-12 bg-white border-slate-300" })] }), _jsx(Button, { disabled: detailsSaving, onClick: async () => {
                                                                        try {
                                                                            setDetailsSaving(true);
                                                                            await apiService.updateInvoice(detailsInvoice.id, { status: detailsStatus, dueDate: detailsDueDate || undefined });
                                                                            await qc.invalidateQueries({ queryKey: ["invoices"] });
                                                                            setDetailsInvoice(prev => prev ? { ...prev, status: detailsStatus, dueDate: detailsDueDate } : prev);
                                                                        }
                                                                        finally {
                                                                            setDetailsSaving(false);
                                                                        }
                                                                    }, className: "w-full h-12 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl transition-all duration-200", children: detailsSaving ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "w-4 h-4 mr-2 animate-spin" }), "Saving..."] })) : (_jsxs(_Fragment, { children: [_jsx(CheckCircle, { className: "w-4 h-4 mr-2" }), "Save Changes"] })) })] })] }), _jsxs("div", { className: "bg-slate-50 rounded-xl p-6", children: [_jsxs("h3", { className: "text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2", children: [_jsx(FileText, { className: "w-5 h-5 text-green-600" }), "Invoice Information"] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex justify-between items-center py-2 border-b border-slate-200", children: [_jsx("span", { className: "text-sm font-medium text-slate-600", children: "Invoice #:" }), _jsx("span", { className: "text-sm font-semibold text-slate-900", children: detailsInvoice.invoiceNumber })] }), _jsxs("div", { className: "flex justify-between items-center py-2 border-b border-slate-200", children: [_jsx("span", { className: "text-sm font-medium text-slate-600", children: "Issue Date:" }), _jsx("span", { className: "text-sm font-semibold text-slate-900", children: new Date(detailsInvoice.issueDate).toLocaleDateString() })] }), detailsDueDate && (_jsxs("div", { className: "flex justify-between items-center py-2 border-b border-slate-200", children: [_jsx("span", { className: "text-sm font-medium text-slate-600", children: "Due Date:" }), _jsx("span", { className: "text-sm font-semibold text-slate-900", children: new Date(detailsDueDate).toLocaleDateString() })] })), _jsxs("div", { className: "flex justify-between items-center py-2 border-b border-slate-200", children: [_jsx("span", { className: "text-sm font-medium text-slate-600", children: "Total Amount:" }), _jsx("span", { className: "text-sm font-bold text-slate-900", children: formatCurrency(detailsInvoice.totalAmount, detailsInvoice.currency || 'USD') })] }), _jsxs("div", { className: "flex justify-between items-center py-2", children: [_jsx("span", { className: "text-sm font-medium text-slate-600", children: "Balance Due:" }), _jsx("span", { className: "text-sm font-bold text-slate-900", children: formatCurrency(detailsInvoice.balanceDue, detailsInvoice.currency || 'USD') })] })] })] }), _jsxs("div", { className: "bg-slate-50 rounded-xl p-6", children: [_jsxs("h3", { className: "text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2", children: [_jsx(Download, { className: "w-5 h-5 text-green-600" }), "Actions"] }), _jsxs("div", { className: "space-y-3", children: [_jsxs(Button, { variant: "outline", className: "w-full h-12 justify-start", onClick: async () => {
                                                                        try {
                                                                            await generateInvoicePDF(detailsInvoice, 'preview');
                                                                        }
                                                                        catch (e) {
                                                                            toast({ title: 'Preview failed', description: e?.message || 'Failed to preview PDF', variant: 'destructive' });
                                                                        }
                                                                    }, children: [_jsx(Eye, { className: "w-4 h-4 mr-2" }), "Preview PDF"] }), _jsxs(Button, { variant: "outline", className: "w-full h-12 justify-start", onClick: async () => {
                                                                        try {
                                                                            await generateInvoicePDF(detailsInvoice, 'download');
                                                                        }
                                                                        catch (e) {
                                                                            toast({ title: 'Download failed', description: e?.message || 'Failed to download PDF', variant: 'destructive' });
                                                                        }
                                                                    }, children: [_jsx(Download, { className: "w-4 h-4 mr-2" }), "Download"] }), _jsxs(Button, { variant: "outline", className: "w-full h-12 justify-start", onClick: async () => {
                                                                        try {
                                                                            const resp = await apiService.createPaymentLink(detailsInvoice.id);
                                                                            await navigator.clipboard.writeText(resp.url);
                                                                            toast({ title: 'Payment link copied', description: resp.url });
                                                                        }
                                                                        catch (e) {
                                                                            toast({ title: 'Create link failed', description: e?.message || 'Failed to create payment link', variant: 'destructive' });
                                                                        }
                                                                    }, children: [_jsx(Link, { className: "w-4 h-4 mr-2" }), "Copy Payment Link"] })] })] })] }), _jsx("div", { className: "lg:col-span-3 space-y-6", children: _jsxs("div", { className: "bg-slate-50 rounded-xl p-6", children: [_jsxs("h3", { className: "text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2", children: [_jsx(FileText, { className: "w-5 h-5 text-green-600" }), "Invoice Template"] }), _jsx("div", { className: "bg-white rounded-lg border border-slate-200 p-4", children: _jsx(InvoiceTemplate, { invoice: {
                                                                id: detailsInvoice.id,
                                                                invoiceNumber: detailsInvoice.invoiceNumber,
                                                                issueDate: detailsInvoice.issueDate,
                                                                dueDate: detailsDueDate || detailsInvoice.dueDate,
                                                                status: detailsStatus || detailsInvoice.status,
                                                                totalAmount: detailsInvoice.totalAmount,
                                                                balanceDue: detailsInvoice.balanceDue,
                                                                currency: ((Array.isArray(customers) ? customers : []).find(c => c.id === detailsInvoice.customerId)?.currency) || 'USD',
                                                                customer: (() => {
                                                                    const customer = (Array.isArray(customers) ? customers : []).find(c => c.id === detailsInvoice.customerId);
                                                                    return customer ? {
                                                                        id: customer.id,
                                                                        name: customer.name,
                                                                        email: customer.email,
                                                                        address: customer.address
                                                                    } : undefined;
                                                                })(),
                                                                lines: detailsInvoice.lines || []
                                                            }, company: {
                                                                name: getCompanyData()?.name || 'Your Company',
                                                                email: getCompanyData()?.email || 'contact@yourcompany.com',
                                                                phone: getCompanyData()?.phone || '+1 (555) 123-4567',
                                                                address: getCompanyData()?.address || '123 Business St',
                                                                city: getCompanyData()?.city || 'City',
                                                                state: getCompanyData()?.state || 'State',
                                                                postalCode: getCompanyData()?.postalCode || '12345',
                                                                website: getCompanyData()?.website || 'www.yourcompany.com',
                                                                logoUrl: getCompanyData()?.logoUrl,
                                                                showLogo: getCompanyData()?.showLogo || false,
                                                                showWebsite: getCompanyData()?.showWebsite || false,
                                                                showAddress: getCompanyData()?.showAddress || false,
                                                                invoiceTerms: getCompanyData()?.invoiceTerms || 'Payment is due within 30 days of invoice date.',
                                                                invoiceFooter: getCompanyData()?.invoiceFooter || 'Thank you for your business!',
                                                                primaryColor: getCompanyData()?.primaryColor || '#009688',
                                                                secondaryColor: getCompanyData()?.secondaryColor || '#1565c0',
                                                                fontFamily: getCompanyData()?.fontFamily || 'Inter',
                                                                invoiceTemplate: getCompanyData()?.invoiceTemplate || 'modern'
                                                            }, onDownloadPDF: async () => {
                                                                try {
                                                                    await generateInvoicePDF(detailsInvoice, 'download');
                                                                }
                                                                catch (e) {
                                                                    toast({ title: 'Download failed', description: e?.message || 'Failed to download PDF', variant: 'destructive' });
                                                                }
                                                            }, onPaymentSuccess: () => {
                                                                toast({ title: 'Payment successful', description: 'Invoice has been paid successfully' });
                                                                qc.invalidateQueries({ queryKey: ["invoices"] });
                                                            }, onPaymentError: (error) => {
                                                                toast({ title: 'Payment failed', description: error?.message || error?.toString() || 'Payment could not be processed', variant: 'destructive' });
                                                            } }) })] }) })] }) }))] }) }), _jsx(Dialog, { open: creditDialogOpen, onOpenChange: setCreditDialogOpen, children: _jsxs(DialogContent, { children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { children: "Create Credit Note" }) }), _jsxs("div", { className: "space-y-3", children: [_jsx("div", { className: "text-sm text-muted-foreground", children: "Reason" }), _jsx(Textarea, { value: creditReason, onChange: (e) => setCreditReason(e.target.value), rows: 3 }), _jsxs("div", { className: "flex justify-end gap-2", children: [_jsx(Button, { variant: "outline", onClick: () => setCreditDialogOpen(false), children: "Cancel" }), _jsx(Button, { onClick: async () => {
                                                    if (!creditInvoiceId)
                                                        return;
                                                    try {
                                                        const API = process.env.NEXT_PUBLIC_API_URL || '';
                                                        const res = await fetch(`${API}/api/credit-notes/${selectedCompany}`, {
                                                            method: 'POST',
                                                            headers: {
                                                                'Content-Type': 'application/json',
                                                                'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
                                                                'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo',
                                                            },
                                                            body: JSON.stringify({ invoiceId: creditInvoiceId, reason: creditReason, lines: [{ description: 'Credit', quantity: 1, unitPrice: 0 }] })
                                                        });
                                                        await res.json();
                                                        setCreditDialogOpen(false);
                                                    }
                                                    catch { }
                                                }, children: "Create" })] })] })] }) }), _jsx(Dialog, { open: recurringDialogOpen, onOpenChange: setRecurringDialogOpen, children: _jsxs(DialogContent, { className: "!max-w-7xl max-h-[95vh] overflow-y-auto w-[95vw] md:max-h-[90vh] md:w-[90vw]", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: editingRecurring ? 'Edit Recurring Invoice' : 'Create Recurring Invoice' }), _jsx(DialogDescription, { children: "Set up a recurring invoice template that will automatically generate invoices on schedule." })] }), _jsx(EnhancedRecurringInvoiceForm, { formData: recurringForm, onChange: setRecurringForm, customers: customers, isEditing: !!editingRecurring }), recurringError && (_jsx("div", { className: "text-red-600 text-sm", children: recurringError })), _jsxs(DialogFooter, { children: [_jsx(Button, { variant: "outline", onClick: () => setRecurringDialogOpen(false), children: "Cancel" }), _jsx(Button, { disabled: recurringSaving || !isRecurringFormValid(recurringForm), onClick: async () => {
                                            try {
                                                setRecurringSaving(true);
                                                setRecurringError(null);
                                                if (editingRecurring) {
                                                    await updateRecurringInvoiceMutation.mutateAsync({
                                                        id: editingRecurring.id,
                                                        data: recurringForm
                                                    });
                                                }
                                                else {
                                                    await createRecurringInvoiceMutation.mutateAsync(recurringForm);
                                                }
                                            }
                                            catch (error) {
                                                setRecurringError(error?.message || 'Failed to save recurring invoice');
                                            }
                                            finally {
                                                setRecurringSaving(false);
                                            }
                                        }, children: recurringSaving ? 'Saving...' : (editingRecurring ? 'Update' : 'Create') })] })] }) }), _jsx(Dialog, { open: recurringDetailsOpen, onOpenChange: setRecurringDetailsOpen, children: _jsxs(DialogContent, { className: "!max-w-7xl max-h-[95vh] overflow-y-auto w-[95vw] md:max-h-[90vh] md:w-[90vw]", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Recurring Invoice Details" }), _jsx(DialogDescription, { children: "View details and generated invoices for this recurring template." })] }), selectedRecurring && (_jsxs("div", { className: "space-y-6", children: [(() => {
                                        const lines = (selectedRecurring.lines || []).map(l => ({
                                            description: l.description || '',
                                            quantity: Number(l.quantity) || 0,
                                            unitPrice: Number(l.unitPrice) || 0,
                                            taxRate: Number(l.taxRate) || 0,
                                        }));
                                        const totals = recalcRecurringTotals(lines);
                                        const viewData = {
                                            customerId: selectedRecurring.customerId,
                                            name: selectedRecurring.name,
                                            description: selectedRecurring.description || '',
                                            frequency: selectedRecurring.frequency,
                                            interval: selectedRecurring.interval || 1,
                                            startDate: (selectedRecurring.startDate || '').slice(0, 10),
                                            endDate: selectedRecurring.endDate ? selectedRecurring.endDate.slice(0, 10) : '',
                                            currency: selectedRecurring.currency || 'USD',
                                            notes: selectedRecurring.notes || '',
                                            terms: selectedRecurring.terms || '',
                                            dueDateOffset: selectedRecurring.dueDateOffset || 0,
                                            autoSend: !!selectedRecurring.autoSend,
                                            emailTemplate: selectedRecurring.emailTemplate || '',
                                            // Advanced Scheduling defaults (not persisted in API yet)
                                            dayOfWeek: undefined,
                                            dayOfMonth: undefined,
                                            businessDaysOnly: false,
                                            skipHolidays: false,
                                            timezone: 'UTC',
                                            // Conditional Logic defaults
                                            skipIfOutstandingBalance: false,
                                            maxOutstandingAmount: undefined,
                                            skipIfCustomerInactive: false,
                                            requireApproval: false,
                                            approvalWorkflowId: undefined,
                                            // Email settings defaults
                                            ccEmails: [],
                                            bccEmails: [],
                                            reminderDays: [],
                                            lines,
                                            subtotal: totals.subtotal,
                                            taxTotal: totals.taxTotal,
                                            totalAmount: totals.totalAmount,
                                        };
                                        return (_jsx(EnhancedRecurringInvoiceForm, { formData: viewData, onChange: () => { }, customers: customers, isEditing: false, readOnly: true }));
                                    })(), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsx("h4", { className: "font-semibold", children: "Generated Invoices" }), _jsxs(Button, { variant: "outline", size: "sm", onClick: () => loadRecurringHistory(selectedRecurring.id), disabled: recurringHistoryLoading, children: [recurringHistoryLoading ? (_jsx(Loader2, { className: "w-4 h-4 animate-spin mr-2" })) : (_jsx(RefreshCw, { className: "w-4 h-4 mr-2" })), "Refresh"] })] }), recurringHistoryLoading ? (_jsxs("div", { className: "text-center py-4", children: [_jsx(Loader2, { className: "w-6 h-6 animate-spin mx-auto" }), _jsx("p", { className: "text-sm text-gray-500 mt-2", children: "Loading invoice history..." })] })) : recurringHistory.length > 0 ? (_jsx("div", { className: "space-y-2 max-h-60 overflow-y-auto", children: recurringHistory.map((invoice) => (_jsxs("div", { className: "flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50", children: [_jsxs("div", { children: [_jsx("p", { className: "font-medium", children: invoice.invoiceNumber }), _jsxs("p", { className: "text-sm text-gray-500", children: [new Date(invoice.createdAt).toLocaleDateString(), " \u2022 Status: ", _jsx(Badge, { variant: "outline", className: "ml-1", children: invoice.status })] })] }), _jsxs("div", { className: "text-right", children: [_jsx("p", { className: "font-semibold", children: formatCurrency(invoice.totalAmount, invoice.currency) }), invoice.payments?.length > 0 && (_jsxs("p", { className: "text-sm text-green-600", children: [invoice.payments.length, " payment(s)"] }))] })] }, invoice.id))) })) : (_jsxs("div", { className: "text-center py-8 text-gray-500", children: [_jsx(FileText, { className: "w-12 h-12 mx-auto mb-2 opacity-50" }), _jsx("p", { children: "No invoices generated yet" })] }))] })] }))] }) })] }) }));
}
