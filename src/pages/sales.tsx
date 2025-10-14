import { useEffect, useMemo, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

// Helper function to compare dates without time component
const isDateBeforeToday = (date: Date): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const compareDate = new Date(date);
  compareDate.setHours(0, 0, 0, 0);
  return compareDate < today;
};
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Badge } from "../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { SegmentedTabs } from "../components/ui/segmented-tabs"
import { PageLayout } from "../components/page-layout"
import { Plus, Search, Filter, Eye, Edit, Send, Download, FileText, Users, Calculator, RefreshCw, CreditCard, CheckCircle, XCircle, MessageSquare, Bot, Calendar, ShoppingCart, X, Link, Loader2 } from "lucide-react"
import { useToast } from "../hooks/use-toast"
import apiService, { Estimate, RecurringInvoice } from "../lib/api"
import { useAuth } from "../contexts/auth-context"
import { useDemoAuth } from "../hooks/useDemoAuth"
import { getCompanyId } from "../lib/config"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../components/ui/dialog"
import { Label } from "../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { PaymentButtonCompact } from "../components/payment-button"
import { InvoiceTemplate } from "../components/invoice-template"
import { InvoiceApproval } from "../components/invoice-approval"
import { Textarea } from "../components/ui/textarea"
import { NaturalLanguageInvoice } from "../components/natural-language-invoice"
import { AIAccountingChat } from "../components/ai-accounting-chat"
import { AccountingIntegrationStatus } from "../components/accounting-integration-status"
import { InvoicePDFGenerator } from "../lib/invoice-pdf-generator"
import { EnhancedRecurringInvoiceForm } from "../components/enhanced-recurring-invoice-form"

// Utility function to ensure SelectItem values are never empty
const safeSelectValue = (value: string | undefined | null): string => {
  if (!value || value.trim() === '') {
    return 'placeholder-value-' + Math.random().toString(36).substr(2, 9)
  }
  return value.trim()
}

// Helper function to format date for HTML date input
const formatDateForInput = (dateString: string | undefined): string => {
  if (!dateString) return ""
  try {
    // Handle different date formats
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return ""
    return date.toISOString().slice(0, 10)
  } catch {
    return ""
  }
}

type InvoiceListItem = {
  id: string
  companyId: string
  customerId: string
  invoiceNumber: string
  issueDate: string
  dueDate?: string
  totalAmount: number
  balanceDue: number
  status: string
  currency?: string
  lines?: any[]
}

type CustomerListItem = {
  id: string
  name: string
  email?: string
  currency?: string
  address?: string
}

export default function SalesPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const { ready: demoAuthReady } = useDemoAuth('sales-page')
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState<string>(getCompanyId())

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
    const handleCompanyChange = (e: CustomEvent) => {
      const newCompanyId = e.detail.companyId;
      if (newCompanyId && newCompanyId !== selectedCompany) {
        console.log('🔄 Sales page - Company changed via custom event from', selectedCompany, 'to', newCompanyId);
        setSelectedCompany(newCompanyId);
      }
    };
    
    window.addEventListener('companyChanged', handleCompanyChange as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('companyChanged', handleCompanyChange as EventListener);
    };
  }, [selectedCompany]);

  const [invoices, setInvoices] = useState<InvoiceListItem[]>([])
  const [customers, setCustomers] = useState<CustomerListItem[]>([])
  const [estimates, setEstimates] = useState<Estimate[]>([])
  const [recurringInvoices, setRecurringInvoices] = useState<RecurringInvoice[]>([])
  
  // Defensive wrapper for setCustomers to ensure it's always an array
  const setCustomersSafe = (newCustomers: any) => {
    const safeCustomers = Array.isArray(newCustomers) ? newCustomers : []
    setCustomers(safeCustomers)
  }
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false)

  // Helper function to generate PDF using frontend generator
  const generateInvoicePDF = async (invoice: any, action: 'download' | 'preview' = 'download') => {
    try {
      const customer = customers.find(c => c.id === invoice.customerId)
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
            phone: (customer as any).phone,
            taxId: (customer as any).taxId
          } : undefined,
          lines: invoice.lines || [],
          notes: invoice.notes,
          paymentUrl: invoice.paymentUrl
        },
        company: {
          name: getCompanyData()?.name || 'Your Company',
          logoUrl: getCompanyData()?.logoUrl,
          primaryColor: getCompanyData()?.primaryColor || '#009688',
          secondaryColor: (getCompanyData() as any)?.secondaryColor || '#1565c0',
          address: getCompanyData()?.address,
          city: getCompanyData()?.city,
          state: getCompanyData()?.state,
          postalCode: getCompanyData()?.postalCode,
          email: getCompanyData()?.email,
          phone: getCompanyData()?.phone,
          website: getCompanyData()?.website,
          fontFamily: getCompanyData()?.fontFamily || 'Inter'
        } as any
      })

      if (action === 'download') {
        await generator.download()
        toast({
          title: "PDF Downloaded",
          description: `Invoice ${invoice.invoiceNumber} has been downloaded successfully.`
        })
      } else {
        const blob = await generator.generate()
        const url = URL.createObjectURL(blob)
        window.open(url, '_blank')
        setTimeout(() => URL.revokeObjectURL(url), 30000)
      }
    } catch (error) {
      console.error('Error generating PDF:', error)
      toast({
        title: "PDF Generation Failed",
        description: "There was an error generating the PDF. Please try again.",
        variant: "destructive"
      })
      
      // Fallback to backend API
      try {
        const blob = await apiService.getInvoicePdf(invoice.id)
        const url = URL.createObjectURL(blob)
        if (action === 'download') {
          const a = document.createElement('a')
          a.href = url
          a.download = `invoice-${invoice.invoiceNumber}.pdf`
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
        } else {
          window.open(url, '_blank')
        }
        setTimeout(() => URL.revokeObjectURL(url), 30000)
      } catch (backendError) {
        console.error('Backend PDF generation also failed:', backendError)
      }
    }
  }
  const [editingCustomer, setEditingCustomer] = useState<CustomerListItem | null>(null)
  const [customerForm, setCustomerForm] = useState<{ name: string; email?: string; currency?: string }>({ name: "", email: "", currency: 'USD' })
  const [customerSaving, setCustomerSaving] = useState(false)
  const [customerError, setCustomerError] = useState<string | null>(null)

  const [invoiceSearch, setInvoiceSearch] = useState("")
  const [customerSearch, setCustomerSearch] = useState("")
  const [invoicePage, setInvoicePage] = useState(1)
  const [invoicePageSize, setInvoicePageSize] = useState(10)
  const [customerPage, setCustomerPage] = useState(1)
  const [customerPageSize, setCustomerPageSize] = useState(1000)

  const [estimateSearch, setEstimateSearch] = useState("")
  const [estimatePage, setEstimatePage] = useState(1)
  const [estimatePageSize, setEstimatePageSize] = useState(10)
  const [recurringPage, setRecurringPage] = useState(1)
  const [recurringPageSize, setRecurringPageSize] = useState(10)
  const [recurringSearch, setRecurringSearch] = useState("")
  const [recurringStatus, setRecurringStatus] = useState<string>("")
  const [selectedRecurring, setSelectedRecurring] = useState<RecurringInvoice | null>(null)
  const [recurringDetailsOpen, setRecurringDetailsOpen] = useState(false)
  const [recurringHistory, setRecurringHistory] = useState<any[]>([])
  const [recurringHistoryLoading, setRecurringHistoryLoading] = useState(false)

  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false)
  const [invoiceSaving, setInvoiceSaving] = useState(false)
  const [invoiceError, setInvoiceError] = useState<string | null>(null)
  type InvoiceLine = { description: string; quantity: number; unitPrice: number; taxRate: number; lineDiscount?: number; productId?: string }
  const [invoiceForm, setInvoiceForm] = useState<{ customerId: string; invoiceNumber: string; currency: string; issueDate: string; dueDate?: string; discountMode: 'amount'|'percent'; discount: number; shipping: number; taxMode: 'per_line'|'global'; globalTaxRate: number; lines: InvoiceLine[]; subtotal: number; taxTotal: number; totalAmount: number; notes?: string; terms?: string; paymentTerms?: string }>(
    { customerId: "", invoiceNumber: "", currency: 'USD', issueDate: new Date().toISOString().slice(0,10), dueDate: "", discountMode: 'amount', discount: 0, shipping: 0, taxMode: 'per_line', globalTaxRate: 0, lines: [{ description: "", quantity: 1, unitPrice: 0, taxRate: 0, productId: "" }], subtotal: 0, taxTotal: 0, totalAmount: 0, notes: "", terms: "Payment due within 30 days", paymentTerms: "Net 30" }
  )

  // Estimate modal state
  type EstimateLineForm = { description: string; quantity: number; unitPrice: number; taxRate: number }
  const [estimateDialogOpen, setEstimateDialogOpen] = useState(false)
  const [estimateSaving, setEstimateSaving] = useState(false)
  const [estimateError, setEstimateError] = useState<string | null>(null)
  const [estimateForm, setEstimateForm] = useState<{ customerId: string; estimateNumber: string; issueDate: string; expiryDate?: string; currency: string; notes?: string; terms?: string; lines: EstimateLineForm[] }>(
    { customerId: "", estimateNumber: "", issueDate: new Date().toISOString().slice(0,10), expiryDate: "", currency: 'USD', notes: "", terms: "", lines: [{ description: "", quantity: 1, unitPrice: 0, taxRate: 0 }] }
  )

  // Estimate view/edit state
  const [estimateViewDialogOpen, setEstimateViewDialogOpen] = useState(false)
  const [estimateEditDialogOpen, setEstimateEditDialogOpen] = useState(false)
  const [selectedEstimate, setSelectedEstimate] = useState<Estimate | null>(null)
  const [estimateViewLoading, setEstimateViewLoading] = useState(false)
  const [estimateEditForm, setEstimateEditForm] = useState<{ customerId: string; estimateNumber: string; issueDate: string; expiryDate?: string; currency: string; notes?: string; terms?: string; lines: EstimateLineForm[] }>(
    { customerId: "", estimateNumber: "", issueDate: new Date().toISOString().slice(0,10), expiryDate: "", currency: 'USD', notes: "", terms: "", lines: [{ description: "", quantity: 1, unitPrice: 0, taxRate: 0 }] }
  )

  const recalcTotals = (lines: InvoiceLine[], discount = invoiceForm.discount, shipping = invoiceForm.shipping, taxMode = invoiceForm.taxMode, globalTaxRate = invoiceForm.globalTaxRate, discountMode = invoiceForm.discountMode) => {
    const lineSubtotal = lines.reduce((sum, l) => {
      const gross = l.quantity * l.unitPrice
      const ld = Math.max(0, Math.min(gross, l.lineDiscount || 0))
      return sum + (gross - ld)
    }, 0)
    const discountAmt = discountMode === 'percent' ? Math.max(0, Math.min(100, discount)) * lineSubtotal / 100 : Math.max(0, Math.min(discount, lineSubtotal))
    const taxableBase = Math.max(0, lineSubtotal - discountAmt)
    const lineTax = taxMode === 'per_line'
      ? lines.reduce((sum, l) => sum + (l.quantity * l.unitPrice * (l.taxRate || 0) / 100), 0)
      : taxableBase * (globalTaxRate || 0) / 100
    const subtotal = taxableBase
    const taxTotal = lineTax
    const totalAmount = subtotal + taxTotal + (shipping || 0)
    return { subtotal, taxTotal, totalAmount }
  }

  const recalcRecurringTotals = (lines: RecurringLine[]) => {
    const subtotal = lines.reduce((sum, l) => sum + (l.quantity * l.unitPrice), 0)
    const taxTotal = lines.reduce((sum, l) => sum + (l.quantity * l.unitPrice * (l.taxRate || 0) / 100), 0)
    const totalAmount = subtotal + taxTotal
    return { subtotal, taxTotal, totalAmount }
  }

  const [products, setProducts] = useState<any[]>([])
  const [autoConvertPrices, setAutoConvertPrices] = useState(true)
  const [lastPriceCurrency, setLastPriceCurrency] = useState<string>('USD')
  const [exchangeRate, setExchangeRate] = useState<number>(1)
  const [lockRate, setLockRate] = useState<boolean>(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [detailsInvoice, setDetailsInvoice] = useState<InvoiceListItem | null>(null)
  const [detailsPdfUrl, setDetailsPdfUrl] = useState<string | null>(null)
  
  // Recurring invoice dialog state
  const [recurringDialogOpen, setRecurringDialogOpen] = useState(false)
  const [editingRecurring, setEditingRecurring] = useState<RecurringInvoice | null>(null)
  const [recurringSaving, setRecurringSaving] = useState(false)
  const [recurringError, setRecurringError] = useState<string | null>(null)
  type RecurringLine = { description: string; quantity: number; unitPrice: number; taxRate: number }
  const [recurringForm, setRecurringForm] = useState<{ 
    customerId: string; 
    name: string; 
    description?: string; 
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom'; 
    interval: number; 
    startDate: string; 
    endDate?: string; 
    currency: string; 
    notes?: string; 
    terms?: string; 
    dueDateOffset: number; 
    autoSend: boolean; 
    emailTemplate?: string;
    
    // Advanced Scheduling
    dayOfWeek?: number;
    dayOfMonth?: number;
    businessDaysOnly: boolean;
    skipHolidays: boolean;
    timezone: string;
    
    // Conditional Logic
    skipIfOutstandingBalance: boolean;
    maxOutstandingAmount?: number;
    skipIfCustomerInactive: boolean;
    requireApproval: boolean;
    approvalWorkflowId?: string;
    
    // Email Settings
    ccEmails: string[];
    bccEmails: string[];
    reminderDays: number[];
    
    lines: RecurringLine[]; 
    subtotal: number; 
    taxTotal: number; 
    totalAmount: number 
  }>({
    customerId: "", 
    name: "", 
    description: "", 
    frequency: 'monthly', 
    interval: 1, 
    startDate: new Date().toISOString().slice(0,10), 
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
  })
  const [detailsPayLink, setDetailsPayLink] = useState<string | null>(null)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [detailsStatus, setDetailsStatus] = useState<string>('draft')
  const [detailsDueDate, setDetailsDueDate] = useState<string>('')
  const [detailsSaving, setDetailsSaving] = useState(false)
  const [detailsActivity, setDetailsActivity] = useState<Array<{ id: string; type: string; at: string; by?: string; message?: string }>>([])
  // Send Invoice PDF modal state
  const [sendEmailOpen, setSendEmailOpen] = useState(false)
  const [sendEmailInvoiceId, setSendEmailInvoiceId] = useState<string | null>(null)
  const [sendEmailTo, setSendEmailTo] = useState<string>("")
  const [sendEmailLoading, setSendEmailLoading] = useState(false)

  // Credit note dialog state
  const [creditDialogOpen, setCreditDialogOpen] = useState(false)
  const [creditReason, setCreditReason] = useState('Customer return')
  const [creditInvoiceId, setCreditInvoiceId] = useState<string | null>(null)

  // Default reset shape for recurring form (ensures all required fields are present)
  const defaultRecurringForm = {
    customerId: "",
    name: "",
    description: "",
    frequency: 'monthly' as const,
    interval: 1,
    startDate: new Date().toISOString().slice(0,10),
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
    ccEmails: [] as string[],
    bccEmails: [] as string[],
    reminderDays: [] as number[],
    // Lines and totals
    lines: [{ description: "", quantity: 1, unitPrice: 0, taxRate: 0 }],
    subtotal: 0,
    taxTotal: 0,
    totalAmount: 0
  }

  const prevLinesConvert = (lines: InvoiceLine[], rate: number) => {
    return lines.map(l => ({ ...l, unitPrice: (l.unitPrice || 0) * (rate || 1), lineDiscount: (l.lineDiscount || 0) * (rate || 1) }))
  }

  const formatCurrency = (amount: any, currency: string) => {
    const amt = Number(amount) || 0
    try {
      return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(amt)
    } catch {
      try {
        return `$${amt.toFixed(2)}`
      } catch {
        return `$${amt}`
      }
    }
  }

  const qc = useQueryClient()

  // Best-practice validity check for recurring invoice form
  const isRecurringFormValid = (f: typeof recurringForm) => {
    const hasBasics = Boolean(f.name && f.name.trim() && f.customerId && f.startDate && f.frequency)
    const hasLines = Array.isArray(f.lines) && f.lines.length > 0
    const linesOk = hasLines && f.lines.every(l => {
      const q = Number(l.quantity)
      const p = Number(l.unitPrice)
      const t = Number(l.taxRate)
      return !Number.isNaN(q) && q >= 0 && !Number.isNaN(p) && p >= 0 && !Number.isNaN(t) && t >= 0 && t <= 100
    })
    return hasBasics && hasLines && linesOk
  }

  // Fetch companies for the company selector
  const companiesQuery = useQuery({
    queryKey: ['companies'],
    queryFn: () => apiService.getCompanies(),
    enabled: (isAuthenticated || demoAuthReady) && !authLoading,
    staleTime: 5 * 60 * 1000
  })

  // Helper function to get company data
  const getCompanyData = () => {
    const companies = companiesQuery.data as any
    if (Array.isArray(companies)) {
      return companies.find((c: any) => c.id === selectedCompany)
    }
    return null
  }


  // Initialize company selection from localStorage or default
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedCompanyId = localStorage.getItem('company_id')
      if (storedCompanyId) {
        setSelectedCompany(storedCompanyId)
      }
    }
  }, [])

  // Update localStorage when company changes
  useEffect(() => {
    if (typeof window !== 'undefined' && selectedCompany) {
      localStorage.setItem('company_id', selectedCompany)
    }
  }, [selectedCompany])

  const createRecurringInvoiceMutation = useMutation({
    mutationFn: (data: any) => {
      return apiService.createRecurringInvoice({ ...data, companyId: selectedCompany })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['recurring-invoices'] })
      setRecurringDialogOpen(false)
      setRecurringForm({ ...defaultRecurringForm, startDate: new Date().toISOString().slice(0,10) })
      setEditingRecurring(null)
    }
  })

  const updateRecurringInvoiceMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => {
      return apiService.updateRecurringInvoice(id, data)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['recurring-invoices'] })
      setRecurringDialogOpen(false)
      setRecurringForm({ ...defaultRecurringForm, startDate: new Date().toISOString().slice(0,10) })
      setEditingRecurring(null)
    }
  })

  // Update recurring invoice status
  const updateRecurringStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'active' | 'paused' | 'completed' | 'cancelled' }) => {
      return apiService.updateRecurringInvoiceStatus(id, status)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['recurring-invoices'] })
      toast({ title: "Success", description: "Recurring invoice status updated" })
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error?.message || "Failed to update status", variant: "destructive" })
    }
  })

  // Generate invoice from recurring template
  const generateRecurringMutation = useMutation({
    mutationFn: (id: string) => {
      return apiService.generateInvoiceFromRecurring(id)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['recurring-invoices'] })
      qc.invalidateQueries({ queryKey: ['invoices'] })
      toast({ title: "Success", description: "Invoice generated successfully" })
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error?.message || "Failed to generate invoice", variant: "destructive" })
    }
  })

  // Load recurring invoice history
  const loadRecurringHistory = async (id: string) => {
    setRecurringHistoryLoading(true)
    try {
      const response = await apiService.getRecurringInvoiceHistory(id)
      setRecurringHistory(response.invoices)
    } catch (error) {
      toast({ title: "Error", description: "Failed to load invoice history", variant: "destructive" })
    } finally {
      setRecurringHistoryLoading(false)
    }
  }

  // Handler functions
  const handleEditRecurring = (recurring: RecurringInvoice) => {
    setEditingRecurring(recurring)
    setRecurringForm({
      customerId: recurring.customerId,
      name: recurring.name,
      description: recurring.description || '',
      frequency: recurring.frequency as any,
      interval: recurring.interval,
      startDate: (recurring.startDate || '').slice(0,10),
      endDate: recurring.endDate ? recurring.endDate.slice(0,10) : '',
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
    })
    setRecurringDialogOpen(true)
  }

  const handleViewRecurring = (recurring: RecurringInvoice) => {
    setSelectedRecurring(recurring)
    setRecurringDetailsOpen(true)
    loadRecurringHistory(recurring.id)
  }

  const handleGenerateRecurring = (recurring: RecurringInvoice) => {
    generateRecurringMutation.mutate(recurring.id)
  }

  const handleStatusChange = (recurring: RecurringInvoice, newStatus: 'active' | 'paused' | 'completed' | 'cancelled') => {
    updateRecurringStatusMutation.mutate({ id: recurring.id, status: newStatus })
  }

  const invoicesQuery = useQuery({
    queryKey: ["invoices", invoicePage, invoicePageSize, selectedCompany],
    enabled: isAuthenticated && !authLoading && !!selectedCompany,
    queryFn: async () => {
      const invResp = await apiService.getInvoices({ page: invoicePage, pageSize: invoicePageSize, companyId: selectedCompany })
      const raw = invResp as any
      const invData = raw?.items ?? raw?.invoices ?? raw?.data ?? raw
      return Array.isArray(invData) ? invData as InvoiceListItem[] : []
    }
  })
  const customersQuery = useQuery({
    queryKey: ["customers", customerPage, customerPageSize, customerSearch, selectedCompany],
    enabled: isAuthenticated && !authLoading && !!selectedCompany,
    queryFn: async () => {
      const custResp = await apiService.getCustomers({ 
        page: customerPage, 
        pageSize: customerPageSize, 
        companyId: selectedCompany,
        q: customerSearch || undefined
      })
      return custResp
    }
  })

  // Fetch all customers for selectors (unpaginated up to 1000)
  const customersAllQuery = useQuery({
    queryKey: ["customers-all", selectedCompany],
    enabled: isAuthenticated && !authLoading && !!selectedCompany,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      // Backend caps pageSize at 100; fetch all pages and merge
      const pageSize = 100
      const first = await apiService.getCustomers({ page: 1, pageSize, companyId: selectedCompany }) as any
      const total = first?.total ?? (first?.items?.length || 0)
      let items = Array.isArray(first?.items) ? first.items : []
      const totalPages = first?.totalPages || Math.ceil(total / pageSize) || 1
      if (totalPages > 1) {
        const rest = await Promise.all(
          Array.from({ length: totalPages - 1 }, (_, i) => apiService.getCustomers({ page: i + 2, pageSize, companyId: selectedCompany }) as any)
        )
        for (const r of rest) {
          if (Array.isArray(r?.items)) items = items.concat(r.items)
        }
      }
      return { items, total }
    }
  })

  const allCustomers = useMemo(() => {
    
    const list: any = (customersAllQuery.data?.items ?? customersAllQuery.data ?? customers)
    return Array.isArray(list) ? list : []
  }, [customersAllQuery.data, customers])

  const estimatesQuery = useQuery({
    queryKey: ["estimates", estimatePage, estimatePageSize, estimateSearch, selectedCompany],
    enabled: isAuthenticated && !authLoading && !!selectedCompany,
    queryFn: async () => {
      const estResp = await apiService.getEstimates({ 
        page: estimatePage,
        pageSize: estimatePageSize,
        companyId: selectedCompany,
        q: estimateSearch || undefined
      })
      const raw = estResp as any
      const estData = raw?.items ?? raw?.estimates ?? raw?.data ?? raw
      return Array.isArray(estData) ? estData : []
    }
  })

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
      })
      return recResp
    }
  })
  
  const productsQuery = useQuery({
    queryKey: ["products", selectedCompany],
    enabled: isAuthenticated && !authLoading && !!selectedCompany,
    queryFn: async () => {
      const prodResp = await apiService.getProducts({ companyId: selectedCompany }) as any
      const prodData = prodResp?.items ?? prodResp?.products ?? prodResp?.data ?? prodResp
      return Array.isArray(prodData) ? prodData : []
    }
  })

  useEffect(() => {
    
    if (invoicesQuery.data) setInvoices(invoicesQuery.data)
    if (customersQuery.data) {
      const customerItems = customersQuery.data?.items || customersQuery.data
      setCustomersSafe(Array.isArray(customerItems) ? customerItems : [])
    }
    if (estimatesQuery.data) setEstimates(estimatesQuery.data)
    if (recurringInvoicesQuery.data) {
      const resp: any = recurringInvoicesQuery.data as any
      const items = resp?.items ?? []
      setRecurringInvoices(items as any[])
    }
    if (productsQuery.data) setProducts(productsQuery.data as any)
    setLoading(invoicesQuery.isLoading || customersQuery.isLoading || estimatesQuery.isLoading || recurringInvoicesQuery.isLoading || productsQuery.isLoading)
    setError((invoicesQuery.error as any)?.message || (customersQuery.error as any)?.message || (estimatesQuery.error as any)?.message || (recurringInvoicesQuery.error as any)?.message || (productsQuery.error as any)?.message || null)
  }, [invoicesQuery.data, customersQuery.data, estimatesQuery.data, recurringInvoicesQuery.data, productsQuery.data, invoicesQuery.isLoading, customersQuery.isLoading, estimatesQuery.isLoading, recurringInvoicesQuery.isLoading, productsQuery.isLoading, invoicesQuery.error, customersQuery.error, estimatesQuery.error, recurringInvoicesQuery.error, productsQuery.error])

  useEffect(() => { setMounted(true) }, [])

  const filteredInvoices = useMemo(() => {
    if (!invoiceSearch) return invoices
    const q = invoiceSearch.toLowerCase()
    return invoices.filter(inv =>
      inv.invoiceNumber.toLowerCase().includes(q) ||
      inv.status.toLowerCase().includes(q)
    )
  }, [invoices, invoiceSearch])

  const filteredCustomers = useMemo(() => {
    const safeCustomers = Array.isArray(customers) ? customers : []
    return safeCustomers
  }, [customers])

  // Estimates to display (data is already processed in queryFn)
  const displayEstimates = useMemo(() => {
    return Array.isArray(estimates) ? estimates : []
  }, [estimates])

  // Recurring invoices to display (fallback to query response items if state not yet set)
  const displayRecurringInvoices = useMemo(() => {
    const resp: any = recurringInvoicesQuery?.data as any
    const fromQuery = resp?.items
    if (Array.isArray(fromQuery) && fromQuery.length > 0) return fromQuery
    return Array.isArray(recurringInvoices) ? recurringInvoices : []
  }, [recurringInvoicesQuery?.data, recurringInvoices])

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
        if (inv.status !== 'paid') return false;
        const paidDate = new Date(inv.issueDate);
        return paidDate.getMonth() === currentMonth && 
               paidDate.getFullYear() === currentYear;
      })
      .reduce((sum, inv) => sum + inv.totalAmount, 0);
    
    // Overdue invoices (past due date and not paid)
    const overdue = processedInvoices
      .filter(inv => {
        if (inv.status === 'paid' || inv.status === 'cancelled') return false;
        if (!inv.dueDate) return false;
        
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
  }, [invoices])

  if (!mounted) {
    return (
      <PageLayout>
        <div className="p-6 space-y-6">
          <div className="h-6 w-48 bg-muted rounded" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[0,1,2,3].map(i => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="h-10 bg-muted rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </PageLayout>
    )
  }

  if (authLoading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </PageLayout>
    )
  }

  if (!isAuthenticated && !demoAuthReady) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-muted-foreground">Please log in to access sales features.</p>
          </div>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <div className="p-6 space-y-6">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200 rounded-2xl p-8 mb-8">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Sales & Invoicing</h1>
                <p className="text-slate-600 text-lg font-medium">Manage customers, invoices, and sales transactions</p>
              </div>
            </div>
            <div className="flex items-center gap-6 mt-4">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Live Dashboard</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Real-time Updates</span>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="h-11 px-6 border-slate-300 hover:bg-slate-50 hover:border-slate-400 transition-all duration-200">
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
            <Button 
              className="h-11 px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-200"
              onClick={async () => { 
                let number = ""
                try { const next = await apiService.getNextInvoiceNumber(selectedCompany); number = (next as any)?.invoiceNumber || "" } catch {}
                const startLines = [{ description: "", quantity: 1, unitPrice: 0, taxRate: 0 }]
                const safeCustomers = allCustomers
                const initCurrency = safeCustomers[0]?.currency || 'USD'
                setLastPriceCurrency(initCurrency)
                setInvoiceForm({ customerId: safeCustomers[0]?.id || "", invoiceNumber: number, currency: initCurrency, issueDate: new Date().toISOString().slice(0,10), dueDate: "", discountMode: 'amount', discount: 0, shipping: 0, taxMode: 'per_line', globalTaxRate: 0, lines: startLines, notes: "", terms: "Payment due within 30 days", paymentTerms: "Net 30", ...recalcTotals(startLines, 0, 0, 'per_line', 0, 'amount') });
                setInvoiceDialogOpen(true) 
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Invoice
            </Button>
          </div>
        </div>
      </div>


      {/* Quick Stats - Dashboard Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Outstanding</CardTitle>
            <span className="text-chart-1 font-bold text-lg">$</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {loading ? "—" : `${salesStats.outstandingPercentage.toFixed(0)}%`}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Pending payments
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Paid This Month</CardTitle>
            <span className="text-chart-2 font-bold text-lg">✓</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {loading ? "—" : `${salesStats.paidThisMonthPercentage.toFixed(0)}%`}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Successful payments
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Overdue</CardTitle>
            <span className="text-chart-3 font-bold text-lg">!</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {loading ? "—" : formatCurrency(salesStats.overdue, 'RWF')}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              ({salesStats.overduePercentage.toFixed(0)}% of total)
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Customers</CardTitle>
            <Users className="w-4 h-4 text-chart-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {loading ? "—" : (Array.isArray(customers) ? customers : []).length}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Active customers
            </div>
          </CardContent>
        </Card>
      </div>
 the 
      {/* Enhanced Navigation */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-2 mb-8">
        <Tabs defaultValue="invoices" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7 bg-slate-50 p-1 rounded-xl h-14">
            <TabsTrigger 
              value="invoices" 
              className="flex items-center gap-2 px-4 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 font-medium transition-all duration-200 rounded-lg"
            >
              <FileText className="w-4 h-4" />
              <span>Invoices</span>
              <Badge variant="secondary" className="ml-1 bg-blue-100 text-blue-700 text-xs px-2 py-0.5">
                {invoices.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger 
              value="customers" 
              className="flex items-center gap-2 px-4 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 font-medium transition-all duration-200 rounded-lg"
            >
              <Users className="w-4 h-4" />
              <span>Customers</span>
              <Badge variant="secondary" className="ml-1 bg-green-100 text-green-700 text-xs px-2 py-0.5">
                {customers.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger 
              value="estimates" 
              className="flex items-center gap-2 px-4 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 font-medium transition-all duration-200 rounded-lg"
            >
              <Calculator className="w-4 h-4" />
              <span>Estimates</span>
              <Badge variant="secondary" className="ml-1 bg-purple-100 text-purple-700 text-xs px-2 py-0.5">
                {estimates.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger 
              value="recurring" 
              className="flex items-center gap-2 px-4 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 font-medium transition-all duration-200 rounded-lg"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Recurring</span>
              <Badge variant="secondary" className="ml-1 bg-amber-100 text-amber-700 text-xs px-2 py-0.5">
                {recurringInvoices.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger 
              value="approvals" 
              className="flex items-center gap-2 px-4 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 font-medium transition-all duration-200 rounded-lg"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Approvals</span>
            </TabsTrigger>
            <TabsTrigger 
              value="ai-create" 
              className="flex items-center gap-2 px-4 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 font-medium transition-all duration-200 rounded-lg"
            >
              <MessageSquare className="w-4 h-4" />
              <span>AI Create</span>
            </TabsTrigger>
            <TabsTrigger 
              value="ai-chat" 
              className="flex items-center gap-2 px-4 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 font-medium transition-all duration-200 rounded-lg"
            >
              <Bot className="w-4 h-4" />
              <span>AI Chat</span>
            </TabsTrigger>
          </TabsList>

        <TabsContent value="invoices" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Invoices</CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input placeholder="Search invoices..." className="pl-10 w-64" value={invoiceSearch} onChange={(e) => setInvoiceSearch(e.target.value)} />
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="text-red-600 text-sm mb-2">{(error as any)?.message || error?.toString() || 'Unknown error'}</div>
              )}
              <div className="space-y-4">
                {(invoicesQuery as any)?.isLoading && (
                  <>
                    {[0,1,2,3,4].map(i => (
                      <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="h-4 w-32 bg-muted rounded" />
                        <div className="flex items-center gap-4">
                          <div className="h-4 w-24 bg-muted rounded" />
                          <div className="h-6 w-20 bg-muted rounded" />
                        </div>
                      </div>
                    ))}
                  </>
                )}
                {!((invoicesQuery as any)?.isLoading) && filteredInvoices.map((inv) => (
                  <div
                    key={inv.id}
                    className="group bg-white border border-slate-200 rounded-2xl hover:shadow-xl hover:border-blue-300 transition-all duration-300 overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                            <span className="text-white font-bold text-xl">#</span>
                          </div>
                          <div className="space-y-1">
                            <p className="font-bold text-slate-900 text-xl">{inv.invoiceNumber}</p>
                            <p className="text-slate-600 font-medium">{(() => {
                              if ((customersQuery as any)?.isLoading) return '—'
                              const c = (Array.isArray(customers) ? customers : []).find(cu => cu.id === inv.customerId)
                              return c ? c.name : inv.customerId
                            })()}</p>
                            <p className="text-sm text-slate-500">
                              Issued: {new Date(inv.issueDate).toLocaleDateString()}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge 
                                variant={
                                    inv.status === "paid"
                                    ? "default"
                                      : inv.status === "pending" || inv.status === "sent"
                                      ? "secondary"
                                        : inv.status === "overdue"
                                        ? "destructive"
                                        : "outline"
                                }
                                className={`text-xs px-3 py-1 rounded-full font-medium ${
                                  inv.status === "paid" 
                                    ? "bg-green-100 text-green-700 border-green-200" 
                                    : inv.status === "overdue" 
                                    ? "bg-red-100 text-red-700 border-red-200"
                                    : inv.status === "pending" || inv.status === "sent"
                                    ? "bg-blue-100 text-blue-700 border-blue-200"
                                    : "bg-slate-100 text-slate-700 border-slate-200"
                                }`}
                              >
                                  {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                              </Badge>
                              {inv.dueDate && (
                                <span className="text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded-full">
                                  Due: {new Date(inv.dueDate).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right space-y-1">
                            <p className="font-bold text-slate-900 text-2xl">
                              {formatCurrency(inv.totalAmount, ((customersQuery as any)?.isLoading ? 'USD' : ((Array.isArray(customers) ? customers : []).find(c => c.id === inv.customerId)?.currency) || 'USD'))}
                            </p>
                            <p className="text-sm text-slate-600">
                              Balance: {formatCurrency(inv.balanceDue, ((customersQuery as any)?.isLoading ? 'USD' : ((Array.isArray(customers) ? customers : []).find(c => c.id === inv.customerId)?.currency) || 'USD'))}
                            </p>
                            {inv.balanceDue > 0 && (
                              <p className="text-xs text-amber-600 font-medium">
                                {((inv.balanceDue / inv.totalAmount) * 100).toFixed(0)}% remaining
                              </p>
                            )}
                          </div>
                      <div className="flex items-center gap-2">
                        {(() => {
                          // Only mark as overdue if:
                          // 1. Has a due date in the past AND has balance due
                          // 2. OR is a draft with a due date in the past
                          const hasPastDueDate = inv.dueDate && isDateBeforeToday(new Date(inv.dueDate));
                          const isOverdue = (hasPastDueDate && inv.balanceDue > 0) || 
                                          (inv.status === 'draft' && hasPastDueDate);
                          
                          // Mark as overdue in UI
                          
                          return isOverdue ? (
                            <Badge variant="destructive" className="text-xs">Overdue</Badge>
                          ) : null;
                        })()}
                        {inv.status === 'draft' && (
                          <Button variant="outline" size="sm" className="hover:bg-blue-50 hover:border-blue-200" onClick={async () => {
                            try { await apiService.updateInvoice(inv.id, { status: 'sent' }); await qc.invalidateQueries({ queryKey: ["invoices"] }) } catch {}
                          }}>Mark Sent</Button>
                        )}
                        <Button variant="outline" size="sm" onClick={() => { setCreditInvoiceId(inv.id); setCreditDialogOpen(true) }}>Credit Note</Button>
                        {(inv.status === 'sent' || inv.status === 'pending') && (
                          <>
                            <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={async () => {
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
                                } catch (accountingError) {
                                  console.error('Accounting integration error:', accountingError);
                                  
                                  // Check if it's an inventory validation error
                                  if ((accountingError as any).message && (accountingError as any).message.includes('Insufficient inventory')) {
                                    toast({
                                      title: 'Insufficient Inventory',
                                      description: (accountingError as any).message,
                                      variant: 'destructive'
                                    });
                                  } else {
                                    toast({
                                      title: 'Error',
                                      description: 'Failed to process invoice payment. Please check inventory and try again.',
                                      variant: 'destructive'
                                    });
                                  }
                                }
                              } catch (error) {
                                console.error('Error marking invoice as paid:', error);
                                toast({
                                  title: 'Error',
                                  description: 'Failed to mark invoice as paid',
                                  variant: 'destructive'
                                });
                              }
                            }}>Mark Paid</Button>
                            {inv.balanceDue > 0 && (
                              <PaymentButtonCompact
                                invoiceId={inv.id}
                                amount={inv.balanceDue}
                                currency={((customersQuery as any)?.isLoading ? 'USD' : ((Array.isArray(customers) ? customers : []).find(c => c.id === inv.customerId)?.currency) || 'USD')}
                                customerEmail={((Array.isArray(customers) ? customers : []).find(c => c.id === inv.customerId)?.email)}
                                customerName={((Array.isArray(customers) ? customers : []).find(c => c.id === inv.customerId)?.name)}
                                description={`Payment for Invoice ${inv.invoiceNumber}`}
                                onPaymentSuccess={async () => {
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
                                  } catch (accountingError) {
                                    console.error('Accounting integration error:', accountingError);
                                    
                                    // Check if it's an inventory validation error
                                    if ((accountingError as any).message && (accountingError as any).message.includes('Insufficient inventory')) {
                                      toast({
                                        title: 'Insufficient Inventory',
                                        description: (accountingError as any).message,
                                        variant: 'destructive'
                                      });
                                    } else {
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
                                }}
                                onPaymentError={(error) => {
                                  console.error('Payment error:', error)
                                }}
                              />
                            )}
                          </>
                        )}
                      </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-10 w-10 p-0 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                              onClick={async () => {
                                try {
                                  setDetailsInvoice(inv)
                                  setDetailsOpen(true)
                                  setDetailsLoading(true)
                                  setDetailsPdfUrl(null)
                                  setDetailsPayLink(null)
                                  setDetailsStatus(inv.status)
                                  setDetailsDueDate((inv.dueDate || '').slice(0,10))
                                  try {
                                    const blob = await apiService.getInvoicePdf(inv.id)
                                    const url = URL.createObjectURL(blob)
                                    setDetailsPdfUrl(url)
                                  } catch {}
                                  try {
                                    const link = await apiService.createPaymentLink(inv.id)
                                    setDetailsPayLink(link.url)
                                  } catch {}
                                  try {
                                    const activity = await apiService.getInvoiceActivity(inv.id)
                                    setDetailsActivity(activity.map((act: any) => ({
                                      id: act.id,
                                      type: act.activityType,
                                      at: act.createdAt,
                                      by: act.performedBy,
                                      message: act.description
                                    })))
                                  } catch { setDetailsActivity([]) }
                                } finally {
                                  setDetailsLoading(false)
                                }
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-10 w-10 p-0 hover:bg-green-50 hover:text-green-600 transition-colors duration-200"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-10 w-10 p-0 hover:bg-purple-50 hover:text-purple-600 transition-colors duration-200"
                              onClick={() => {
                                setSendEmailInvoiceId(inv.id)
                                const c = (Array.isArray(customers) ? customers : []).find(x => x.id === inv.customerId)
                                setSendEmailTo(c?.email || '')
                                setSendEmailOpen(true)
                              }}
                            >
                              <Send className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Progress bar for overdue invoices */}
                    {(() => {
                      const hasPastDueDate = inv.dueDate && isDateBeforeToday(new Date(inv.dueDate));
                      const isOverdue = (hasPastDueDate && inv.balanceDue > 0) || 
                                      (inv.status === 'draft' && hasPastDueDate);
                      return isOverdue ? (
                        <div className="h-1 bg-gradient-to-r from-red-500 to-red-600"></div>
                      ) : null;
                    })()}
                  </div>
                ))}
                {filteredInvoices.length === 0 && !loading && (
                  <div className="text-sm text-muted-foreground">No invoices found</div>
                )}
              </div>
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">Page {invoicePage}</div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled={invoicePage <= 1 || loading} onClick={() => setInvoicePage(p => Math.max(1, p - 1))}>Prev</Button>
                  <Button variant="outline" size="sm" disabled={loading || invoices.length < invoicePageSize} onClick={() => setInvoicePage(p => p + 1)}>Next</Button>
                </div>
              </div>
            </CardContent>
          </Card>
          <Dialog open={invoiceDialogOpen} onOpenChange={setInvoiceDialogOpen}>
            <DialogContent className="!max-w-7xl max-h-[95vh] overflow-y-auto w-[95vw] md:max-h-[90vh] md:w-[90vw]">
              <DialogHeader className="pb-6 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <DialogTitle className="text-2xl font-bold text-slate-900">Create New Invoice</DialogTitle>
                    <DialogDescription className="text-slate-600 mt-1">Fill in the details below to create a professional invoice</DialogDescription>
                  </div>
                </div>
                {invoiceError && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {invoiceError}
                  </div>
                )}
              </DialogHeader>
              
              <div className="flex-1 overflow-y-auto max-h-[calc(95vh-200px)] md:max-h-[calc(90vh-200px)] scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 hover:scrollbar-thumb-slate-400">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-6">
                  {/* Left Column - Basic Information */}
                  <div className="md:col-span-1 lg:col-span-1 space-y-6">
                    {/* Customer Selection */}
                    <div className="bg-slate-50 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5 text-blue-600" />
                        Customer Information
                      </h3>
                      <div className="space-y-2">
                        <Label htmlFor="inv-customer" className="text-sm font-medium text-slate-700">Select Customer *</Label>
                        <Select value={invoiceForm.customerId} onValueChange={async (newCustomerId) => {
                          const cust = allCustomers.find(c => c.id === newCustomerId)
                          let nextCurrency = invoiceForm.currency
                          if (cust?.currency && autoConvertPrices && !lockRate) {
                            nextCurrency = cust.currency
                          }
                          setInvoiceForm(prev => ({ ...prev, customerId: newCustomerId, currency: nextCurrency }))
                          if (cust?.currency && autoConvertPrices && !lockRate && lastPriceCurrency !== cust.currency) {
                            try {
                              const { rate } = await apiService.getExchangeRate(lastPriceCurrency, cust.currency)
                              const lines = prevLinesConvert(invoiceForm.lines, rate)
                              setInvoiceForm(prev => ({ ...prev, lines, ...recalcTotals(lines), currency: cust.currency || 'USD' }))
                              setLastPriceCurrency(cust.currency)
                              setExchangeRate(rate)
                            } catch {}
                          }
                        }}>
                          <SelectTrigger className="h-12 bg-white border-slate-300">
                            <SelectValue placeholder="Choose a customer..." />
                          </SelectTrigger>
                          <SelectContent>
                            {allCustomers.map(c => (
                              <SelectItem key={c.id} value={c.id}>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{c.name}</span>
                                  {c.currency && (
                                    <span className="text-xs text-slate-500">({c.currency})</span>
                                  )}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Invoice Details */}
                    <div className="bg-slate-50 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-600" />
                        Invoice Details
                      </h3>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="inv-number" className="text-sm font-medium text-slate-700">Invoice Number *</Label>
                          <Input 
                            id="inv-number" 
                            value={invoiceForm.invoiceNumber} 
                            onChange={(e) => setInvoiceForm({ ...invoiceForm, invoiceNumber: e.target.value })} 
                            placeholder="INV-001" 
                            className="h-12 bg-white border-slate-300"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="inv-currency" className="text-sm font-medium text-slate-700">Currency</Label>
                          <Select value={invoiceForm.currency} onValueChange={async (newCurrency) => {
                            if (autoConvertPrices && !lockRate && lastPriceCurrency !== newCurrency) {
                              try {
                                const { rate } = await apiService.getExchangeRate(lastPriceCurrency, newCurrency)
                                const lines = prevLinesConvert(invoiceForm.lines, rate)
                                setInvoiceForm(prev => ({ ...prev, currency: newCurrency, lines, ...recalcTotals(lines) }))
                                setLastPriceCurrency(newCurrency)
                                setExchangeRate(rate)
                              } catch {
                                setInvoiceForm(prev => ({ ...prev, currency: newCurrency }))
                              }
                            } else {
                              setInvoiceForm(prev => ({ ...prev, currency: newCurrency }))
                            }
                          }}>
                            <SelectTrigger className="h-12 bg-white border-slate-300">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {['USD','EUR','GBP','KES','NGN'].map(c => (
                                <SelectItem key={c} value={c}>{c}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="bg-slate-50 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-blue-600" />
                        Dates
                      </h3>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="inv-issue" className="text-sm font-medium text-slate-700">Issue Date *</Label>
                          <Input 
                            id="inv-issue" 
                            type="date" 
                            value={invoiceForm.issueDate} 
                            onChange={(e) => setInvoiceForm({ ...invoiceForm, issueDate: e.target.value })} 
                            className="h-12 bg-white border-slate-300"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="inv-due" className="text-sm font-medium text-slate-700">Due Date</Label>
                          <Input 
                            id="inv-due" 
                            type="date" 
                            value={invoiceForm.dueDate || ''} 
                            onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })} 
                            className="h-12 bg-white border-slate-300"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Pricing & Tax */}
                    <div className="bg-slate-50 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                        <Calculator className="w-5 h-5 text-blue-600" />
                        Pricing & Tax
                      </h3>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="inv-shipping" className="text-sm font-medium text-slate-700">Shipping Cost</Label>
                          <Input 
                            id="inv-shipping" 
                            type="number" 
                            step="0.01" 
                            value={invoiceForm.shipping} 
                            onChange={(e) => { 
                              const shipping = parseFloat(e.target.value) || 0; 
                              setInvoiceForm(prev => ({ ...prev, shipping, ...recalcTotals(prev.lines, prev.discount, shipping) })) 
                            }}
                            className="h-12 bg-white border-slate-300"
                            placeholder="0.00"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-slate-700">Discount Mode</Label>
                          <Select value={invoiceForm.discountMode} onValueChange={(dm) => { 
                            setInvoiceForm(prev => ({ ...prev, discountMode: dm as 'amount'|'percent', ...recalcTotals(prev.lines, prev.discount, prev.shipping, prev.taxMode, prev.globalTaxRate, dm as 'amount'|'percent') })) 
                          }}>
                            <SelectTrigger className="h-12 bg-white border-slate-300">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="amount">Amount</SelectItem>
                              <SelectItem value="percent">Percentage</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="inv-discount" className="text-sm font-medium text-slate-700">
                            Discount {invoiceForm.discountMode === 'percent' ? '(%)' : ''}
                          </Label>
                          <Input 
                            id="inv-discount" 
                            type="number" 
                            step="0.01" 
                            value={invoiceForm.discount} 
                            onChange={(e) => { 
                              const discount = parseFloat(e.target.value) || 0; 
                              setInvoiceForm(prev => ({ ...prev, discount, ...recalcTotals(prev.lines, discount) })) 
                            }}
                            className="h-12 bg-white border-slate-300"
                            placeholder="0.00"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-slate-700">Tax Mode</Label>
                          <Select value={invoiceForm.taxMode} onValueChange={(taxMode) => { 
                            setInvoiceForm(prev => ({ ...prev, taxMode: taxMode as 'per_line'|'global', ...recalcTotals(prev.lines, prev.discount, prev.shipping, taxMode as 'per_line'|'global', prev.globalTaxRate) })) 
                          }}>
                            <SelectTrigger className="h-12 bg-white border-slate-300">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="per_line">Per Line Item</SelectItem>
                              <SelectItem value="global">Global Rate</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        {invoiceForm.taxMode === 'global' && (
                          <div className="space-y-2">
                            <Label htmlFor="inv-tax" className="text-sm font-medium text-slate-700">Global Tax Rate (%)</Label>
                            <Input 
                              id="inv-tax" 
                              type="number" 
                              step="0.01" 
                              value={invoiceForm.globalTaxRate} 
                              onChange={(e) => { 
                                const r = parseFloat(e.target.value) || 0; 
                                setInvoiceForm(prev => ({ ...prev, globalTaxRate: r, ...recalcTotals(prev.lines, prev.discount, prev.shipping, prev.taxMode, r) })) 
                              }}
                              className="h-12 bg-white border-slate-300"
                              placeholder="0.00"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Notes & Terms */}
                    <div className="bg-slate-50 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-blue-600" />
                        Notes & Terms
                      </h3>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="inv-notes" className="text-sm font-medium text-slate-700">Notes</Label>
                          <Textarea 
                            id="inv-notes" 
                            value={invoiceForm.notes || ''} 
                            onChange={(e) => setInvoiceForm(prev => ({ ...prev, notes: e.target.value }))} 
                            placeholder="Internal notes or additional information..."
                            className="bg-white border-slate-300 min-h-[80px]"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="inv-terms" className="text-sm font-medium text-slate-700">Payment Terms</Label>
                          <Textarea 
                            id="inv-terms" 
                            value={invoiceForm.terms || ''} 
                            onChange={(e) => setInvoiceForm(prev => ({ ...prev, terms: e.target.value }))} 
                            placeholder="Terms and conditions for payment..."
                            className="bg-white border-slate-300 min-h-[80px]"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="inv-payment-terms" className="text-sm font-medium text-slate-700">Payment Terms Code</Label>
                          <Select value={invoiceForm.paymentTerms || 'Net 30'} onValueChange={(value) => setInvoiceForm(prev => ({ ...prev, paymentTerms: value }))}>
                            <SelectTrigger className="h-12 bg-white border-slate-300">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Due on Receipt">Due on Receipt</SelectItem>
                              <SelectItem value="Net 7">Net 7</SelectItem>
                              <SelectItem value="Net 15">Net 15</SelectItem>
                              <SelectItem value="Net 30">Net 30</SelectItem>
                              <SelectItem value="Net 60">Net 60</SelectItem>
                              <SelectItem value="Net 90">Net 90</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Line Items & Totals */}
                  <div className="md:col-span-1 lg:col-span-2 space-y-6">
                    {/* Line Items */}
                    <div className="bg-gradient-to-br from-white to-slate-50 rounded-xl border-2 border-blue-100 shadow-lg p-6">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                            <ShoppingCart className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-slate-900">Line Items</h3>
                            <p className="text-sm text-slate-600">Add products or services to your invoice</p>
                          </div>
                        </div>
                        <Button 
                          variant="default"
                          size="sm" 
                          onClick={() => {
                            const lines = [...invoiceForm.lines, { description: "", quantity: 1, unitPrice: 0, taxRate: 0, productId: "" }]
                            setInvoiceForm({ ...invoiceForm, lines, ...recalcTotals(lines) })
                          }}
                          className="h-11 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Item
                        </Button>
                      </div>
                      
                      <div className="space-y-4">
                        {/* Enhanced Table Header */}
                        <div className="bg-slate-100 rounded-lg p-3 border border-slate-200">
                          <div className="grid grid-cols-12 gap-4 text-sm font-bold text-slate-700">
                            <div className="col-span-5 flex items-center gap-2">
                              <FileText className="w-4 h-4 text-blue-600" />
                              Description
                            </div>
                            <div className="col-span-1 text-center flex items-center justify-center gap-1">
                              <Calculator className="w-3 h-3 text-blue-600" />
                              Qty
                            </div>
                            <div className="col-span-2 text-right flex items-center justify-end gap-1">
                              <CreditCard className="w-3 h-3 text-blue-600" />
                              Unit Price
                            </div>
                            <div className="col-span-2 text-right flex items-center justify-end gap-1">
                              <Calculator className="w-3 h-3 text-blue-600" />
                              Discount
                            </div>
                            <div className="col-span-1 text-center flex items-center justify-center gap-1">
                              <Calculator className="w-3 h-3 text-blue-600" />
                              Tax %
                            </div>
                            <div className="col-span-1 text-center">Actions</div>
                          </div>
                        </div>
                        
                        {/* Enhanced Line Items */}
                        {invoiceForm.lines.map((line, idx) => (
                          <div key={idx} className="group bg-white hover:bg-blue-50/50 transition-all duration-200 rounded-xl border-2 border-slate-200 hover:border-blue-300 shadow-sm hover:shadow-md p-5">
                            <div className="grid grid-cols-12 gap-4 items-start">
                              {/* Description Column - Enhanced */}
                              <div className="col-span-5 space-y-3">
                                <div className="relative">
                                  <Input 
                                    placeholder="Enter item description (e.g., Web Design Services)" 
                                    value={line.description} 
                                    onChange={(e) => {
                                      const lines = [...invoiceForm.lines]
                                      lines[idx].description = e.target.value
                                      setInvoiceForm({ ...invoiceForm, lines, ...recalcTotals(lines) })
                                    }}
                                    className="h-12 text-base font-medium bg-white border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                  />
                                  {line.description && (
                                    <div className="absolute right-3 top-3 text-green-500">
                                      <CheckCircle className="w-5 h-5" />
                                    </div>
                                  )}
                                </div>
                                <Select value={line.productId || ""} onValueChange={(productId) => {
                                  const p = products.find((pr: any) => pr.id === productId)
                                  if (!p) return
                                  const lines = [...invoiceForm.lines]
                                  lines[idx].productId = productId
                                  lines[idx].description = p.name
                                  lines[idx].unitPrice = p.unitPrice || p.price || 0
                                  setInvoiceForm({ ...invoiceForm, lines, ...recalcTotals(lines) })
                                }}>
                                  <SelectTrigger className="h-10 text-sm bg-slate-50 border-slate-300">
                                    <SelectValue placeholder="Or select from product catalog..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {products.map((p: any) => (
                                      <SelectItem key={p.id} value={p.id}>
                                        <div className="flex items-center gap-2">
                                          <span className="font-medium">{p.sku ? `${p.sku} - ` : ''}{p.name}</span>
                                          <Badge variant="secondary" className="text-xs">
                                            {formatCurrency(p.unitPrice || p.price || 0, invoiceForm.currency)}
                                          </Badge>
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              {/* Quantity Column */}
                              <div className="col-span-1">
                                <div className="relative">
                                  <Input 
                                    type="number" 
                                    min="0" 
                                    step="1" 
                                    placeholder="1" 
                                    value={line.quantity} 
                                    onChange={(e) => {
                                      const lines = [...invoiceForm.lines]
                                      lines[idx].quantity = parseFloat(e.target.value) || 0
                                      setInvoiceForm({ ...invoiceForm, lines, ...recalcTotals(lines) })
                                    }}
                                    className="h-12 text-center text-base font-semibold bg-white border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                  />
                                  <div className="absolute inset-x-0 -bottom-6 text-xs text-center text-slate-500">
                                    qty
                                  </div>
                                </div>
                              </div>
                              
                              {/* Unit Price Column */}
                              <div className="col-span-2">
                                <div className="relative">
                                  <Input 
                                    type="number" 
                                    min="0" 
                                    step="0.01" 
                                    placeholder="0.00" 
                                    value={line.unitPrice} 
                                    onChange={(e) => {
                                      const lines = [...invoiceForm.lines]
                                      lines[idx].unitPrice = parseFloat(e.target.value) || 0
                                      setInvoiceForm({ ...invoiceForm, lines, ...recalcTotals(lines) })
                                    }}
                                    className="h-12 text-right text-base font-semibold bg-white border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                  />
                                  <div className="absolute inset-x-0 -bottom-6 text-xs text-center text-slate-500">
                                    per unit
                                  </div>
                                </div>
                              </div>
                              
                              {/* Discount Column */}
                              <div className="col-span-2">
                                <div className="relative">
                                  <Input 
                                    type="number" 
                                    min="0" 
                                    step="0.01" 
                                    placeholder="0.00" 
                                    value={line.lineDiscount || 0} 
                                    onChange={(e) => {
                                      const lines = [...invoiceForm.lines]
                                      lines[idx].lineDiscount = parseFloat(e.target.value) || 0
                                      setInvoiceForm({ ...invoiceForm, lines, ...recalcTotals(lines) })
                                    }}
                                    className="h-12 text-right text-base font-semibold bg-white border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                  />
                                  <div className="absolute inset-x-0 -bottom-6 text-xs text-center text-slate-500">
                                    discount
                                  </div>
                                </div>
                              </div>
                              
                              {/* Tax Column */}
                              <div className="col-span-1">
                                <div className="relative">
                                  <Input 
                                    type="number" 
                                    min="0" 
                                    step="0.01" 
                                    placeholder="0" 
                                    disabled={invoiceForm.taxMode === 'global'} 
                                    value={line.taxRate} 
                                    onChange={(e) => {
                                      const lines = [...invoiceForm.lines]
                                      lines[idx].taxRate = parseFloat(e.target.value) || 0
                                      setInvoiceForm({ ...invoiceForm, lines, ...recalcTotals(lines) })
                                    }}
                                    className="h-12 text-center text-base font-semibold bg-white border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-slate-100 disabled:text-slate-500"
                                  />
                                  <div className="absolute inset-x-0 -bottom-6 text-xs text-center text-slate-500">
                                    {invoiceForm.taxMode === 'global' ? 'global' : 'tax %'}
                                  </div>
                                </div>
                              </div>
                              
                              {/* Actions Column */}
                              <div className="col-span-1 flex flex-col items-center gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => {
                                    const lines = invoiceForm.lines.filter((_, i) => i !== idx)
                                    setInvoiceForm({ ...invoiceForm, lines: lines.length ? lines : [{ description: "", quantity: 1, unitPrice: 0, taxRate: 0, productId: "" }], ...recalcTotals(lines.length ? lines : [{ description: "", quantity: 1, unitPrice: 0, taxRate: 0, productId: "" }]) })
                                  }}
                                  className="h-10 w-10 p-0 text-red-600 hover:text-red-700 hover:bg-red-100 group-hover:bg-red-50 border border-red-200"
                                  title="Remove this line item"
                                >
                                  <X className="w-5 h-5" />
                                </Button>
                                
                                {/* Line Total Display */}
                                <div className="text-center mt-2">
                                  <div className="text-xs text-slate-500 font-medium">Line Total</div>
                                  <div className="text-sm font-bold text-slate-900">
                                    {formatCurrency((line.quantity * line.unitPrice) - (line.lineDiscount || 0), invoiceForm.currency)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        {/* Empty State */}
                        {invoiceForm.lines.length === 0 && (
                          <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-slate-300">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <ShoppingCart className="w-8 h-8 text-slate-400" />
                            </div>
                            <h4 className="text-lg font-semibold text-slate-700 mb-2">No line items added yet</h4>
                            <p className="text-slate-500 mb-4">Add products or services to get started</p>
                            <Button 
                              variant="outline"
                              onClick={() => {
                                const lines = [{ description: "", quantity: 1, unitPrice: 0, taxRate: 0, productId: "" }]
                                setInvoiceForm({ ...invoiceForm, lines, ...recalcTotals(lines) })
                              }}
                              className="h-12 px-6"
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Add Your First Item
                            </Button>
                          </div>
                        )}
                        
                        {/* Quick Add Footer */}
                        {invoiceForm.lines.length > 0 && (
                          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                            <div className="text-sm text-slate-600">
                              <span className="font-medium">{invoiceForm.lines.length}</span> line item{invoiceForm.lines.length !== 1 ? 's' : ''} added
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => {
                                const lines = [...invoiceForm.lines, { description: "", quantity: 1, unitPrice: 0, taxRate: 0, productId: "" }]
                                setInvoiceForm({ ...invoiceForm, lines, ...recalcTotals(lines) })
                              }}
                              className="h-9"
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Add Another Item
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Invoice Totals */}
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 shadow-lg p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                          <Calculator className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-slate-900">Invoice Totals</h3>
                          <p className="text-sm text-slate-600">Calculated automatically from line items</p>
                        </div>
                      </div>
                      
                      <div className="bg-white rounded-xl border-2 border-green-200 shadow-lg p-6">
                        <div className="space-y-4">
                          <div className="flex justify-between items-center py-2">
                            <span className="text-slate-600 font-medium">Subtotal</span>
                            <span className="text-slate-900 font-semibold text-lg">{formatCurrency(invoiceForm.subtotal, invoiceForm.currency)}</span>
                          </div>
                          <div className="flex justify-between items-center py-2">
                            <span className="text-slate-600 font-medium">Tax</span>
                            <span className="text-slate-900 font-semibold text-lg">{formatCurrency(invoiceForm.taxTotal, invoiceForm.currency)}</span>
                          </div>
                          {invoiceForm.shipping > 0 && (
                            <div className="flex justify-between items-center py-2">
                              <span className="text-slate-600 font-medium">Shipping</span>
                              <span className="text-slate-900 font-semibold text-lg">{formatCurrency(invoiceForm.shipping, invoiceForm.currency)}</span>
                            </div>
                          )}
                          {invoiceForm.discount > 0 && (
                            <div className="flex justify-between items-center py-2">
                              <span className="text-slate-600 font-medium">Discount</span>
                              <span className="text-red-600 font-semibold text-lg">-{formatCurrency(invoiceForm.discount, invoiceForm.currency)}</span>
                            </div>
                          )}
                          <div className="border-t border-slate-200 pt-4">
                            <div className="flex justify-between items-center py-2">
                              <span className="text-slate-900 font-bold text-xl">Total</span>
                              <span className="text-slate-900 font-bold text-2xl">{formatCurrency(invoiceForm.totalAmount, invoiceForm.currency)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Exchange Rate Info */}
                      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center gap-2 text-sm text-blue-700">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span>Exchange Rate: {exchangeRate.toFixed(4)} {lastPriceCurrency} → {invoiceForm.currency} {lockRate ? '(locked)' : ''}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter className="sticky bottom-0 bg-white border-t border-slate-200 p-6">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <Button 
                      variant="outline" 
                      onClick={() => setInvoiceDialogOpen(false)} 
                      disabled={invoiceSaving}
                      className="h-12 px-6"
                    >
                      Cancel
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                        onClick={async () => {
                          try {
                            if (!invoices[0]) {
                              toast({ title: 'Preview unavailable', description: 'Save invoice first, then preview.', variant: 'destructive' })
                              return
                            }
                            await generateInvoicePDF(invoices[0], 'preview')
                          } catch (e: any) {
                            toast({ title: 'Preview failed', description: (e as any)?.message || 'Failed to preview PDF', variant: 'destructive' })
                          }
                        }}
                      className="h-10"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Preview PDF
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={async () => {
                        try {
                          if (!invoices[0]) {
                            toast({ title: 'No invoice yet', description: 'Save invoice first, then create payment link.', variant: 'destructive' })
                            return
                          }
                          const resp = await apiService.createPaymentLink(invoices[0].id)
                          await navigator.clipboard.writeText(resp.url)
                          toast({ title: 'Payment link copied', description: resp.url })
                        } catch (e: any) {
                          toast({ title: 'Create link failed', description: (e as any)?.message || 'Failed to create payment link', variant: 'destructive' })
                        }
                      }}
                      className="h-10"
                    >
                      <Link className="w-4 h-4 mr-2" />
                      Copy Payment Link
                    </Button>
                  </div>
                  
                  <Button 
                    onClick={async () => {
                      try {
                        setInvoiceSaving(true)
                        setInvoiceError(null)
                        if (!invoiceForm.customerId) throw new Error('Customer is required')
                        if (!invoiceForm.invoiceNumber) throw new Error('Invoice number is required')
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
                        }
                        const created = await apiService.createInvoice(payload as any)
                        await qc.invalidateQueries({ queryKey: ["invoices"] })
                        // immediately enable PDF/Payment actions via created.id
                        if (created?.id) {
                          try {
                            await generateInvoicePDF(created, 'preview')
                          } catch {}
                          try {
                            const link = await apiService.createPaymentLink(created.id, { expiresInMinutes: 60 })
                            await navigator.clipboard.writeText(link.url)
                            toast({ title: 'Payment link copied', description: link.url })
                          } catch {}
                        }
                        setInvoiceDialogOpen(false)
                      } catch (e: any) {
                        setInvoiceError((e as any)?.message || 'Failed to create invoice')
                      } finally {
                        setInvoiceSaving(false)
                      }
                    }} 
                    disabled={invoiceSaving}
                    className="h-12 px-8 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    {invoiceSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating Invoice...
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4 mr-2" />
                        Create Invoice
                      </>
                    )}
                  </Button>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Customer Directory</CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input 
                      placeholder="Search customers..." 
                      className="pl-10 w-64" 
                      value={customerSearch} 
                      onChange={(e) => {
                        setCustomerSearch(e.target.value)
                        setCustomerPage(1) // Reset to first page when searching
                      }} 
                    />
                  </div>
                  <Button onClick={() => { setEditingCustomer(null); setCustomerForm({ name: "", email: "", currency: 'USD' }); setCustomerDialogOpen(true) }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Customer
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(Array.isArray(filteredCustomers) ? filteredCustomers : []).map((customer) => (
                  <div
                    key={customer.id}
                    className="group flex items-center justify-between p-6 bg-white border border-gray-100 rounded-xl hover:shadow-lg hover:border-blue-200 transition-all duration-200"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center group-hover:from-green-200 group-hover:to-green-300 transition-all duration-200">
                        <span className="text-green-600 font-bold text-lg">{customer.name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-lg">{customer.name}</p>
                        <p className="text-sm text-gray-600">{customer.email || '—'}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {customer.currency || 'USD'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="hover:bg-green-50 hover:border-green-200" onClick={() => { setEditingCustomer(customer); setCustomerForm({ name: customer.name, email: customer.email, currency: customer.currency || 'USD' }); setCustomerDialogOpen(true) }}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="hover:bg-blue-50 hover:border-blue-200">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredCustomers.length === 0 && !loading && (
                  <div className="text-sm text-muted-foreground">No customers found</div>
                )}
                {customersQuery.data && (
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-sm text-muted-foreground">
                      Showing {((customerPage - 1) * customerPageSize) + 1} to {Math.min(customerPage * customerPageSize, customersQuery.data.total)} of {customersQuery.data.total} customers
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        className="text-sm border rounded px-2 py-1"
                        value={customerPageSize}
                        onChange={(e) => {
                          setCustomerPageSize(Number(e.target.value))
                          setCustomerPage(1) // Reset to first page when changing page size
                        }}
                      >
                        <option value={10}>10 per page</option>
                        <option value={20}>20 per page</option>
                        <option value={50}>50 per page</option>
                        <option value={100}>100 per page</option>
                      </select>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCustomerPage(prev => Math.max(1, prev - 1))}
                        disabled={!customersQuery.data.hasPrev || customersQuery.isLoading}
                      >
                        Previous
                      </Button>
                      <div className="text-sm">
                        Page {customerPage} of {customersQuery.data.totalPages}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCustomerPage(prev => prev + 1)}
                        disabled={!customersQuery.data.hasNext || customersQuery.isLoading}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          <Dialog open={customerDialogOpen} onOpenChange={setCustomerDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingCustomer ? 'Edit Customer' : 'Add Customer'}</DialogTitle>
                <DialogDescription>Enter customer details below.</DialogDescription>
              </DialogHeader>
              {customerError && (
                <div className="text-red-600 text-sm">{customerError}</div>
              )}
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="cust-name">Name</Label>
                  <Input id="cust-name" value={customerForm.name} onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cust-email">Email</Label>
                  <Input id="cust-email" type="email" value={customerForm.email || ''} onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cust-currency">Currency</Label>
                  <select id="cust-currency" className="w-full border rounded px-2 py-2" value={customerForm.currency || 'USD'} onChange={(e) => setCustomerForm({ ...customerForm, currency: e.target.value })}>
                    {['USD','EUR','GBP','KES','NGN'].map(c => (<option key={c} value={c}>{c}</option>))}
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCustomerDialogOpen(false)} disabled={customerSaving}>Cancel</Button>
                <Button onClick={async () => {
                  try {
                    setCustomerSaving(true)
                    setCustomerError(null)
                    if (!customerForm.name || customerForm.name.trim() === '') {
                      throw new Error('Name is required')
                    }
                    if (!selectedCompany) throw new Error('No company selected')
                    if (editingCustomer) {
                      await apiService.updateCustomer(editingCustomer.id, { companyId: selectedCompany, name: customerForm.name, email: customerForm.email, currency: customerForm.currency })
                      toast({ title: 'Customer updated', description: `${customerForm.name}` })
                    } else {
                      // Send selected currency now that backend accepts it
                      await apiService.createCustomer({ companyId: selectedCompany, name: customerForm.name, email: customerForm.email, currency: customerForm.currency })
                      toast({ title: 'Customer created', description: `${customerForm.name}` })
                    }
                    await qc.invalidateQueries({ queryKey: ["customers"] })
                    setCustomerDialogOpen(false)
                  } catch (e: any) {
                    setCustomerError((e as any)?.message || 'Failed to save customer')
                    toast({ title: 'Customer save failed', description: (e as any)?.message || 'Failed to save customer', variant: 'destructive' })
                  } finally {
                    setCustomerSaving(false)
                  }
                }} disabled={customerSaving}>
                  {customerSaving ? 'Saving…' : (editingCustomer ? 'Save Changes' : 'Create Customer')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="estimates" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
              <CardTitle>Estimates & Quotes</CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input 
                      placeholder="Search estimates..." 
                      className="pl-10 w-64" 
                      value={estimateSearch} 
                      onChange={(e) => {
                        setEstimateSearch(e.target.value)

                      }} 
                    />
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                  <Button onClick={() => {
                    const list = Array.isArray(allCustomers) ? allCustomers : []
                    const defaultCustomerId = list[0]?.id || ""
                    const defaultCurrency = list.find(c => c.id === defaultCustomerId)?.currency || 'USD'
                    setEstimateForm({
                      customerId: defaultCustomerId,
                      estimateNumber: '',
                      issueDate: new Date().toISOString().slice(0,10),
                      expiryDate: '',
                      currency: defaultCurrency,
                      notes: '',
                      terms: '',
                      lines: [{ description: "", quantity: 1, unitPrice: 0, taxRate: 0 }]
                    })
                    setEstimateError(null)
                    setEstimateDialogOpen(true)
                  }}>
                    <Plus className="w-4 h-4 mr-2" />
                    New Estimate
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="text-red-600 text-sm mb-2">{(error as any)?.message || error?.toString() || 'Unknown error'}</div>
              )}
              <div className="space-y-4">
                {(estimatesQuery as any)?.isLoading && (
                  <>
                    {[0,1,2,3,4].map(i => (
                      <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="h-4 w-32 bg-muted rounded" />
                        <div className="flex items-center gap-4">
                          <div className="h-4 w-24 bg-muted rounded" />
                          <div className="h-6 w-20 bg-muted rounded" />
                        </div>
                      </div>
                    ))}
                  </>
                )}
                {!((estimatesQuery as any)?.isLoading) && displayEstimates.map((est) => (
                  <div
                    key={est.id}
                    className="group flex items-center justify-between p-6 bg-white border border-gray-100 rounded-xl hover:shadow-lg hover:border-blue-200 transition-all duration-200"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center group-hover:from-purple-200 group-hover:to-purple-300 transition-all duration-200">
                        <span className="text-purple-600 font-bold text-lg">#</span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-lg">{est.estimateNumber}</p>
                        <p className="text-sm text-gray-600">{est.customer?.name || 'Customer'}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant={
                              est.status === "accepted"
                                ? "default"
                                : est.status === "sent"
                                  ? "secondary"
                                  : est.status === "rejected"
                                    ? "destructive"
                                    : "outline"
                            }
                            className="text-xs"
                          >
                            {est.status}
                          </Badge>
                          {est.issueDate && (
                            <span className="text-xs text-gray-500">
                              {new Date(est.issueDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold text-lg text-gray-900">
                          {formatCurrency(est.totalAmount, est.currency)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {est.currency}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {est.status === 'draft' && (
                          <Button variant="outline" size="sm" className="hover:bg-blue-50 hover:border-blue-200" onClick={async () => {
                            try { await apiService.updateEstimate(est.id, { status: 'sent' }); await qc.invalidateQueries({ queryKey: ["estimates"] }) } catch {}
                          }}>Mark Sent</Button>
                        )}
                        {est.status === 'sent' && (
                          <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={async () => {
                            try { await apiService.updateEstimate(est.id, { status: 'accepted' }); await qc.invalidateQueries({ queryKey: ["estimates"] }) } catch {}
                          }}>Mark Accepted</Button>
                        )}
                        {est.status === 'accepted' && (
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={async () => {
                            try { 
                              const invoice = await apiService.convertEstimateToInvoice(est.id)
                              await qc.invalidateQueries({ queryKey: ["estimates"] })
                              await qc.invalidateQueries({ queryKey: ["invoices"] })
                              // TODO: Show success message or redirect to invoice
                            } catch {}
                          }}>Convert to Invoice</Button>
                        )}
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Button variant="ghost" size="sm" onClick={async () => {
                          try {
                            const pdf = await apiService.getEstimatePdf(est.id)
                            const url = URL.createObjectURL(pdf)
                            window.open(url, '_blank')
                          } catch {}
                        }}>
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={async () => {
                          try {
                            setEstimateViewLoading(true)
                            setSelectedEstimate(est)
                            setEstimateViewDialogOpen(true)
                          } finally {
                            setEstimateViewLoading(false)
                          }
                        }}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={async () => {
                          try {
                            setSelectedEstimate(est)
                            
                            // Populate edit form with current estimate data
                            setEstimateEditForm({
                              customerId: est.customerId || "",
                              estimateNumber: est.estimateNumber || "",
                              issueDate: formatDateForInput(est.issueDate) || new Date().toISOString().slice(0,10),
                              expiryDate: formatDateForInput(est.expiryDate),
                              currency: est.currency || 'USD',
                              notes: est.notes || "",
                              terms: est.terms || "",
                              lines: est.lines?.map((line: any) => ({
                                description: line.description || "",
                                quantity: line.quantity || 1,
                                unitPrice: line.unitPrice || 0,
                                taxRate: line.taxRate || 0
                              })) || [{ description: "", quantity: 1, unitPrice: 0, taxRate: 0 }]
                            })
                            setEstimateEditDialogOpen(true)
                          } catch (error) {
                            console.error('Error preparing estimate for edit:', error)
                          }
                        }}>
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {displayEstimates.length === 0 && !loading && (
                  <div className="text-sm text-muted-foreground">No estimates found</div>
                )}
                {estimatesQuery.data && (
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-sm text-muted-foreground">
                      Showing {displayEstimates.length} estimates
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Create Estimate Modal */}
        <Dialog open={estimateDialogOpen} onOpenChange={setEstimateDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto z-50">
            <DialogHeader>
              <DialogTitle>Create Estimate</DialogTitle>
              <DialogDescription>Fill in estimate details.</DialogDescription>
            </DialogHeader>
            {estimateError && (
              <div className="text-red-600 text-sm mb-2">{estimateError}</div>
            )}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Customer</label>
                  <select
                    className="w-full border rounded px-3 py-2"
                    value={estimateForm.customerId}
                    onChange={(e) => {
                      const cid = e.target.value
                      const cust = (Array.isArray(allCustomers) ? allCustomers : []).find((c: any) => c.id === cid)
                      setEstimateForm(prev => ({ ...prev, customerId: cid, currency: cust?.currency || prev.currency }))
                    }}
                  >
                    <option value="">Select customer</option>
                    {(Array.isArray(allCustomers) ? allCustomers : []).map((c: any) => (
                      <option key={c.id} value={c.id}>{c.name} {c.email ? `(${c.email})` : ''}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Estimate Number</label>
                  <Input
                    placeholder="e.g. EST-2025-0001"
                    value={estimateForm.estimateNumber}
                    onChange={(e) => setEstimateForm(prev => ({ ...prev, estimateNumber: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Issue Date</label>
                  <Input type="date" value={estimateForm.issueDate} onChange={(e) => setEstimateForm(prev => ({ ...prev, issueDate: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Expiry Date</label>
                  <Input type="date" value={estimateForm.expiryDate || ''} onChange={(e) => setEstimateForm(prev => ({ ...prev, expiryDate: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Currency</label>
                  <Input value={estimateForm.currency} onChange={(e) => setEstimateForm(prev => ({ ...prev, currency: e.target.value.toUpperCase().slice(0,3) }))} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Line Items</label>
                <div className="space-y-3">
                  {estimateForm.lines.map((line, idx) => (
                    <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                      <div className="md:col-span-5">
                        <Input placeholder="Description" value={line.description} onChange={(e) => {
                          const lines = [...estimateForm.lines]
                          lines[idx] = { ...lines[idx], description: e.target.value }
                          setEstimateForm(prev => ({ ...prev, lines }))
                        }} />
                      </div>
                      <div className="md:col-span-2">
                        <Input type="number" min={0} step={1} placeholder="Qty" value={line.quantity}
                          onChange={(e) => {
                            const lines = [...estimateForm.lines]
                            lines[idx] = { ...lines[idx], quantity: Number(e.target.value) }
                            setEstimateForm(prev => ({ ...prev, lines }))
                          }} />
                      </div>
                      <div className="md:col-span-3">
                        <Input type="number" min={0} step={0.01} placeholder="Unit Price" value={line.unitPrice}
                          onChange={(e) => {
                            const lines = [...estimateForm.lines]
                            lines[idx] = { ...lines[idx], unitPrice: Number(e.target.value) }
                            setEstimateForm(prev => ({ ...prev, lines }))
                          }} />
                      </div>
                      <div className="md:col-span-2">
                        <Input type="number" min={0} max={100} step={0.01} placeholder="Tax %" value={line.taxRate}
                          onChange={(e) => {
                            const lines = [...estimateForm.lines]
                            lines[idx] = { ...lines[idx], taxRate: Number(e.target.value) }
                            setEstimateForm(prev => ({ ...prev, lines }))
                          }} />
                      </div>
                    </div>
                  ))}
                  <div>
                    <Button type="button" variant="outline" size="sm" onClick={() => setEstimateForm(prev => ({ ...prev, lines: [...prev.lines, { description: "", quantity: 1, unitPrice: 0, taxRate: 0 }] }))}>Add Line</Button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Notes</label>
                  <textarea className="w-full border rounded px-3 py-2 min-h-[80px]" value={estimateForm.notes}
                    onChange={(e) => setEstimateForm(prev => ({ ...prev, notes: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Terms</label>
                  <textarea className="w-full border rounded px-3 py-2 min-h-[80px]" value={estimateForm.terms}
                    onChange={(e) => setEstimateForm(prev => ({ ...prev, terms: e.target.value }))} />
                </div>
              </div>
            </div>
            <DialogFooter className="sticky bottom-0 bg-white">
              <Button variant="outline" onClick={() => setEstimateDialogOpen(false)} disabled={estimateSaving}>Cancel</Button>
              <Button onClick={async () => {
                try {
                  setEstimateSaving(true)
                  setEstimateError(null)
                  if (!selectedCompany) throw new Error('No company selected')
                  if (!estimateForm.customerId) throw new Error('Customer is required')
                  if (!estimateForm.estimateNumber) throw new Error('Estimate number is required')
                  if (!estimateForm.issueDate) throw new Error('Issue date is required')

                  const payload: any = {
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
                  }

                  await apiService.createEstimate(payload)
                  await qc.invalidateQueries({ queryKey: ["estimates"] })
                  toast({ title: 'Estimate created', description: payload.estimateNumber })
                  setEstimateDialogOpen(false)
                } catch (e: any) {
                  setEstimateError((e as any)?.message || 'Failed to create estimate')
                  toast({ title: 'Estimate creation failed', description: (e as any)?.message || 'Failed to create estimate', variant: 'destructive' })
                } finally {
                  setEstimateSaving(false)
                }
              }} disabled={estimateSaving}>
                {estimateSaving ? 'Creating…' : 'Create Estimate'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Estimate Modal */}
        <Dialog open={estimateViewDialogOpen} onOpenChange={setEstimateViewDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto z-50">
            <DialogHeader>
              <DialogTitle>Estimate Details</DialogTitle>
              <DialogDescription>View estimate information and details.</DialogDescription>
            </DialogHeader>
            {selectedEstimate && (
              <div className="space-y-6">
                {/* Header Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Estimate Information</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Estimate Number</label>
                        <p className="text-lg font-semibold">{selectedEstimate.estimateNumber}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Customer</label>
                        <p className="text-lg">{selectedEstimate.customer?.name || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Status</label>
                        <Badge
                          variant={
                            selectedEstimate.status === "accepted"
                              ? "default"
                              : selectedEstimate.status === "sent"
                                ? "secondary"
                                : selectedEstimate.status === "rejected"
                                  ? "destructive"
                                  : "outline"
                          }
                          className="text-sm"
                        >
                          {selectedEstimate.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Dates & Amounts</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Issue Date</label>
                        <p>{selectedEstimate.issueDate ? new Date(selectedEstimate.issueDate).toLocaleDateString() : 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Expiry Date</label>
                        <p>{selectedEstimate.expiryDate ? new Date(selectedEstimate.expiryDate).toLocaleDateString() : 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Total Amount</label>
                        <p className="text-xl font-bold text-green-600">
                          {formatCurrency(selectedEstimate.totalAmount, selectedEstimate.currency)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Line Items */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Line Items</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-200">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border border-gray-200 px-4 py-2 text-left">Description</th>
                          <th className="border border-gray-200 px-4 py-2 text-right">Qty</th>
                          <th className="border border-gray-200 px-4 py-2 text-right">Unit Price</th>
                          <th className="border border-gray-200 px-4 py-2 text-right">Tax Rate</th>
                          <th className="border border-gray-200 px-4 py-2 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedEstimate.lines?.map((line: any, index: number) => (
                          <tr key={index}>
                            <td className="border border-gray-200 px-4 py-2">{line.description || '-'}</td>
                            <td className="border border-gray-200 px-4 py-2 text-right">{line.quantity || 0}</td>
                            <td className="border border-gray-200 px-4 py-2 text-right">{formatCurrency(line.unitPrice || 0, selectedEstimate.currency)}</td>
                            <td className="border border-gray-200 px-4 py-2 text-right">{line.taxRate || 0}%</td>
                            <td className="border border-gray-200 px-4 py-2 text-right">{formatCurrency(line.lineTotal || 0, selectedEstimate.currency)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Notes and Terms */}
                {(selectedEstimate.notes || selectedEstimate.terms) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {selectedEstimate.notes && (
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Notes</h3>
                        <p className="text-gray-700 whitespace-pre-wrap">{selectedEstimate.notes}</p>
                      </div>
                    )}
                    {selectedEstimate.terms && (
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Terms</h3>
                        <p className="text-gray-700 whitespace-pre-wrap">{selectedEstimate.terms}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setEstimateViewDialogOpen(false)}>Close</Button>
              <Button onClick={() => {
                if (selectedEstimate) {
                  // Switch to edit mode
                  setEstimateEditForm({
                    customerId: selectedEstimate.customerId || "",
                    estimateNumber: selectedEstimate.estimateNumber || "",
                    issueDate: formatDateForInput(selectedEstimate.issueDate) || new Date().toISOString().slice(0,10),
                    expiryDate: formatDateForInput(selectedEstimate.expiryDate),
                    currency: selectedEstimate.currency || 'USD',
                    notes: selectedEstimate.notes || "",
                    terms: selectedEstimate.terms || "",
                    lines: selectedEstimate.lines?.map((line: any) => ({
                      description: line.description || "",
                      quantity: line.quantity || 1,
                      unitPrice: line.unitPrice || 0,
                      taxRate: line.taxRate || 0
                    })) || [{ description: "", quantity: 1, unitPrice: 0, taxRate: 0 }]
                  })
                  setEstimateViewDialogOpen(false)
                  setEstimateEditDialogOpen(true)
                }
              }}>Edit Estimate</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Estimate Modal */}
        <Dialog open={estimateEditDialogOpen} onOpenChange={setEstimateEditDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto z-50">
            <DialogHeader>
              <DialogTitle>Edit Estimate</DialogTitle>
              <DialogDescription>Update estimate details and information.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {estimateError && (
                <div className="text-red-600 text-sm mb-2">{estimateError}</div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Customer</label>
                  <select
                    className="w-full border rounded px-3 py-2"
                    value={estimateEditForm.customerId}
                    onChange={(e) => {
                      const cid = e.target.value
                      const cust = (Array.isArray(allCustomers) ? allCustomers : []).find((c: any) => c.id === cid)
                      setEstimateEditForm(prev => ({ ...prev, customerId: cid, currency: cust?.currency || prev.currency }))
                    }}
                  >
                    <option value="">Select customer</option>
                    {(Array.isArray(allCustomers) ? allCustomers : []).map((cust: any) => (
                      <option key={cust.id} value={cust.id}>{cust.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Estimate Number</label>
                  <Input
                    placeholder="e.g. EST-2025-0001"
                    value={estimateEditForm.estimateNumber}
                    onChange={(e) => setEstimateEditForm(prev => ({ ...prev, estimateNumber: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Issue Date</label>
                  <Input type="date" value={estimateEditForm.issueDate} onChange={(e) => setEstimateEditForm(prev => ({ ...prev, issueDate: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Expiry Date</label>
                  <Input type="date" value={estimateEditForm.expiryDate || ''} onChange={(e) => setEstimateEditForm(prev => ({ ...prev, expiryDate: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Currency</label>
                  <Input value={estimateEditForm.currency} onChange={(e) => setEstimateEditForm(prev => ({ ...prev, currency: e.target.value.toUpperCase().slice(0,3) }))} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Line Items</label>
                <div className="space-y-3">
                  {estimateEditForm.lines.map((line, idx) => (
                    <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                      <div className="md:col-span-5">
                        <Input placeholder="Description" value={line.description} onChange={(e) => {
                          const lines = [...estimateEditForm.lines]
                          lines[idx] = { ...lines[idx], description: e.target.value }
                          setEstimateEditForm(prev => ({ ...prev, lines }))
                        }} />
                      </div>
                      <div className="md:col-span-2">
                        <Input type="number" min={0} step={1} placeholder="Qty" value={line.quantity}
                          onChange={(e) => {
                            const lines = [...estimateEditForm.lines]
                            lines[idx] = { ...lines[idx], quantity: Number(e.target.value) }
                            setEstimateEditForm(prev => ({ ...prev, lines }))
                          }} />
                      </div>
                      <div className="md:col-span-3">
                        <Input type="number" min={0} step={0.01} placeholder="Unit Price" value={line.unitPrice}
                          onChange={(e) => {
                            const lines = [...estimateEditForm.lines]
                            lines[idx] = { ...lines[idx], unitPrice: Number(e.target.value) }
                            setEstimateEditForm(prev => ({ ...prev, lines }))
                          }} />
                      </div>
                      <div className="md:col-span-2">
                        <Input type="number" min={0} max={100} step={0.01} placeholder="Tax %" value={line.taxRate}
                          onChange={(e) => {
                            const lines = [...estimateEditForm.lines]
                            lines[idx] = { ...lines[idx], taxRate: Number(e.target.value) }
                            setEstimateEditForm(prev => ({ ...prev, lines }))
                          }} />
                      </div>
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={() => {
                    setEstimateEditForm(prev => ({ ...prev, lines: [...prev.lines, { description: "", quantity: 1, unitPrice: 0, taxRate: 0 }] }))
                  }}>Add Line Item</Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Notes</label>
                  <textarea className="w-full border rounded px-3 py-2 min-h-[80px]" value={estimateEditForm.notes}
                    onChange={(e) => setEstimateEditForm(prev => ({ ...prev, notes: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Terms</label>
                  <textarea className="w-full border rounded px-3 py-2 min-h-[80px]" value={estimateEditForm.terms}
                    onChange={(e) => setEstimateEditForm(prev => ({ ...prev, terms: e.target.value }))} />
                </div>
              </div>
            </div>
            <DialogFooter className="sticky bottom-0 bg-white">
              <Button variant="outline" onClick={() => setEstimateEditDialogOpen(false)} disabled={estimateSaving}>Cancel</Button>
              <Button onClick={async () => {
                try {
                  setEstimateSaving(true)
                  setEstimateError(null)
                  if (!selectedEstimate) throw new Error('No estimate selected')
                  if (!estimateEditForm.customerId) throw new Error('Customer is required')
                  if (!estimateEditForm.estimateNumber) throw new Error('Estimate number is required')
                  if (!estimateEditForm.issueDate) throw new Error('Issue date is required')

                  const payload: any = {
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
                  }

                  await apiService.updateEstimate(selectedEstimate.id, payload)
                  await qc.invalidateQueries({ queryKey: ["estimates"] })
                  toast({ title: 'Estimate updated', description: payload.estimateNumber })
                  setEstimateEditDialogOpen(false)
                  setEstimateError(null)
                } catch (error: any) {
                  setEstimateError((error as any)?.message || 'Failed to update estimate')
                } finally {
                  setEstimateSaving(false)
                }
              }} disabled={estimateSaving}>
                {estimateSaving ? 'Updating…' : 'Update Estimate'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <TabsContent value="recurring" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
              <CardTitle>Recurring Invoices</CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input 
                      placeholder="Search recurring invoices..." 
                      className="pl-10 w-64" 
                      value={recurringSearch} 
                      onChange={(e) => {
                        setRecurringSearch(e.target.value)
                        setRecurringPage(1) // Reset to first page when searching
                      }} 
                    />
                  </div>
                  <select
                    className="text-sm border rounded px-3 py-2"
                    value={recurringStatus}
                    onChange={(e) => {
                      setRecurringStatus(e.target.value)
                      setRecurringPage(1) // Reset to first page when filtering
                    }}
                  >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <Button onClick={() => {
                    const safeCustomers = Array.isArray(customers) ? customers : []
                    setRecurringForm({
                      ...defaultRecurringForm,
                      customerId: safeCustomers[0]?.id || "",
                      currency: safeCustomers[0]?.currency || 'USD',
                      startDate: new Date().toISOString().slice(0,10)
                    })
                    setEditingRecurring(null)
                    setRecurringDialogOpen(true)
                  }}>
                    <Plus className="w-4 h-4 mr-2" />
                    New Recurring Invoice
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {(recurringInvoicesQuery as any)?.isLoading && (
                <>
                  {[0,1,2,3,4].map(i => (
                    <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="h-4 w-32 bg-muted rounded" />
                      <div className="flex items-center gap-4">
                        <div className="h-4 w-20 bg-muted rounded" />
                        <div className="h-4 w-16 bg-muted rounded" />
                      </div>
                    </div>
                  ))}
                </>
              )}

              {!((recurringInvoicesQuery as any)?.isLoading) && displayRecurringInvoices.map((rec) => (
                <div
                  key={rec.id}
                  className="group flex items-center justify-between p-6 bg-white border border-gray-100 rounded-xl hover:shadow-lg hover:border-blue-200 transition-all duration-200"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center group-hover:from-orange-200 group-hover:to-orange-300 transition-all duration-200">
                      <span className="text-orange-600 font-bold text-lg">🔄</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-lg">{rec.name}</p>
                      <p className="text-sm text-gray-600">{rec.customer?.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={rec.status === 'active' ? 'default' : rec.status === 'paused' ? 'secondary' : 'outline'} className="text-xs">
                          {rec.status}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {rec.frequency}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          ${(Number(rec.totalAmount) || 0).toFixed(2)} {rec.currency}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Next: {new Date(rec.nextRunDate).toLocaleDateString()}
                        {rec.lastRunDate && ` • Last: ${new Date(rec.lastRunDate).toLocaleDateString()}`}
                        {rec._count?.generatedInvoices && ` • ${rec._count.generatedInvoices} invoices`}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Status Management */}
                    <Select value={rec.status} onValueChange={(value) => handleStatusChange(rec, value as any)}>
                      <SelectTrigger className="w-24 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="paused">Paused</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>

                    {/* Action Buttons */}
                    <div className="flex gap-1">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleViewRecurring(rec)}
                        className="hover:bg-blue-50 hover:border-blue-200"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleEditRecurring(rec)}
                        className="hover:bg-orange-50 hover:border-orange-200"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      
                      {rec.status === 'active' && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleGenerateRecurring(rec)}
                          disabled={generateRecurringMutation.isPending}
                          className="hover:bg-green-50 hover:border-green-200"
                        >
                          {generateRecurringMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <RefreshCw className="w-4 h-4" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {!((recurringInvoicesQuery as any)?.isLoading) && displayRecurringInvoices.length === 0 && (
              <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No recurring invoices found</p>
                  <Button onClick={() => {
                    const safeCustomers = Array.isArray(customers) ? customers : []
                    const newForm = { ...defaultRecurringForm }
                    newForm.customerId = safeCustomers[0]?.id || ""
                    newForm.currency = safeCustomers[0]?.currency || 'USD'
                    newForm.startDate = new Date().toISOString().slice(0,10)
                    setRecurringForm(newForm)
                    setEditingRecurring(null)
                    setRecurringDialogOpen(true)
                  }}>
                  <Plus className="w-4 h-4 mr-2" />
                    Create Recurring Invoice
                </Button>
              </div>
              )}

              {recurringInvoicesQuery.data && (
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    Showing {((recurringPage - 1) * recurringPageSize) + 1} to {Math.min(recurringPage * recurringPageSize, recurringInvoicesQuery.data.total)} of {recurringInvoicesQuery.data.total} recurring invoices
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      className="text-sm border rounded px-2 py-1"
                      value={recurringPageSize}
                      onChange={(e) => {
                        setRecurringPageSize(Number(e.target.value))
                        setRecurringPage(1)
                      }}
                    >
                      <option value={10}>10 per page</option>
                      <option value={20}>20 per page</option>
                      <option value={50}>50 per page</option>
                    </select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setRecurringPage(prev => prev - 1)}
                      disabled={!recurringInvoicesQuery.data.hasPrev || recurringInvoicesQuery.isLoading}
                    >
                      Previous
                    </Button>
                    <div className="text-sm">
                      Page {recurringPage} of {recurringInvoicesQuery.data.totalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setRecurringPage(prev => prev + 1)}
                      disabled={!recurringInvoicesQuery.data.hasNext || recurringInvoicesQuery.isLoading}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approvals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Invoices Pending Approval</CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const pendingInvoices = (invoicesQuery.data || invoices).filter(inv => inv.status === 'draft' || inv.status === 'sent');
                return pendingInvoices.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">
                      {invoicesQuery.isLoading ? 'Loading invoices...' : 'No invoices pending approval'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Total invoices: {(invoicesQuery.data || invoices).length}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-blue-600 mb-4">
                      Found {pendingInvoices.length} draft invoices for approval:
                    </p>
                    {pendingInvoices.map((invoice, index) => (
                      <div key={invoice.id} className="border rounded-lg p-4 bg-gray-50">
                        <h4 className="font-medium text-gray-900 mb-2">
                          Invoice #{invoice.invoiceNumber || invoice.id}
                        </h4>
                        <div className="text-sm text-gray-600 mb-3">
                          <p>Status: <span className="font-medium capitalize">{invoice.status}</span></p>
                          <p>Amount: <span className="font-medium">${invoice.totalAmount || 'N/A'}</span></p>
                          <p>Customer: <span className="font-medium">
                            {((Array.isArray(customers) ? customers : []).find(c => c.id === invoice.customerId)?.name) || 'N/A'}
                          </span></p>
                          <p>Due Date: <span className="font-medium">
                            {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}
                          </span></p>
                        </div>
                        <div className="flex gap-2">
                          {invoice.status === 'draft' && (
                            <Button size="sm" className="bg-teal-600 hover:bg-teal-700" onClick={async () => {
                              try { 
                                await apiService.updateInvoice(invoice.id, { status: 'sent' }); 
                                await qc.invalidateQueries({ queryKey: ["invoices"] }) 
                              } catch {}
                            }}>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Approve
                            </Button>
                          )}
                          {(invoice.status === 'sent' || invoice.status === 'pending') && (
                            <Button size="sm" className="bg-teal-600 hover:bg-teal-700" onClick={async () => {
                              try { 
                                await apiService.updateInvoice(invoice.id, { status: 'paid', balanceDue: 0 }); 
                                await qc.invalidateQueries({ queryKey: ["invoices"] }) 
                              } catch {}
                            }}>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Mark Paid
                            </Button>
                          )}
                          <Button variant="destructive" size="sm" onClick={async () => {
                            try { 
                              await apiService.updateInvoice(invoice.id, { status: 'cancelled' }); 
                              await qc.invalidateQueries({ queryKey: ["invoices"] }) 
                            } catch {}
                          }}>
                            <XCircle className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
                );
              })()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-create" className="space-y-4">
          <NaturalLanguageInvoice 
            onInvoiceCreated={(invoice) => {
              // Refresh invoices list when new invoice is created
              qc.invalidateQueries({ queryKey: ["invoices"] })
              toast({ title: 'Invoice created', description: `Invoice ${invoice.invoiceNumber} created successfully!` })
            }}
          />
        </TabsContent>

        <TabsContent value="ai-chat" className="space-y-4">
          <AIAccountingChat 
            onActionExecuted={(action, result) => {
              // Refresh relevant data when actions are executed
              qc.invalidateQueries({ queryKey: ["invoices"] })
              qc.invalidateQueries({ queryKey: ["expenses"] })
              qc.invalidateQueries({ queryKey: ["customers"] })
              qc.invalidateQueries({ queryKey: ["financial-insights"] })
              toast({ title: 'Success', description: `Action ${action} executed successfully!` })
            }}
          />
        </TabsContent>
      </Tabs>
      </div>
      {/* Send Invoice PDF Modal */}
      <Dialog open={sendEmailOpen} onOpenChange={(o) => { setSendEmailOpen(o); if (!o) { setSendEmailInvoiceId(null); setSendEmailTo('') } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Send Invoice PDF</DialogTitle>
            <DialogDescription>Enter the recipient email address.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Label htmlFor="send-email-to">Email</Label>
            <Input id="send-email-to" type="email" placeholder="name@example.com" value={sendEmailTo} onChange={(e) => setSendEmailTo(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSendEmailOpen(false)} disabled={sendEmailLoading}>Cancel</Button>
            <Button disabled={sendEmailLoading || !sendEmailInvoiceId || !sendEmailTo} onClick={async () => {
              if (!sendEmailInvoiceId || !sendEmailTo) return
              try {
                setSendEmailLoading(true)
                
                // Find the invoice data
                const invoice = invoices.find(inv => inv.id === sendEmailInvoiceId)
                if (!invoice) {
                  toast({ title: 'Invoice Not Found', description: 'Could not find invoice data for email generation.', variant: 'destructive' })
                  return
                }

                // Find customer data
                const customer = customers.find(c => c.id === invoice.customerId)
                
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
                    subtotal: (invoice as any).subtotal || invoice.totalAmount,
                    taxAmount: (invoice as any).taxAmount || 0,
                    discountAmount: (invoice as any).discountAmount || 0,
                    customer: customer ? {
                      name: customer.name,
                      email: customer.email,
                      address: customer.address,
                      phone: (customer as any).phone,
                      taxId: (customer as any).taxId
                    } : undefined,
                    lines: (invoice as any).lines || [],
                    notes: (invoice as any).notes,
                    paymentUrl: (invoice as any).paymentUrl
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
                  } as any
                })

                // Generate PDF blob
                const pdfBlob = await generator.generate()
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
                })
                
                toast({ title: 'Invoice sent', description: `Invoice ${invoice.invoiceNumber} sent to ${sendEmailTo}` })
                setSendEmailOpen(false)
              } catch (e: any) {
                console.error('Error sending invoice email:', e)
                
                // Fallback to backend API if frontend generation fails
                try {
                  await apiService.sendInvoiceEmail(sendEmailInvoiceId, { to: sendEmailTo, attachPdf: true })
                  toast({ title: 'Invoice sent', description: sendEmailTo })
                  setSendEmailOpen(false)
                } catch (backendError) {
                  console.error('Backend email sending also failed:', backendError)
                  toast({ title: 'Send failed', description: (e as any)?.message || 'Failed to send', variant: 'destructive' })
                }
              } finally {
                setSendEmailLoading(false)
              }
            }}>{sendEmailLoading ? 'Sending…' : 'Send PDF'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invoice Preview Modal */}
      <Dialog open={detailsOpen} onOpenChange={(open) => {
        setDetailsOpen(open)
        if (!open && detailsPdfUrl) {
          URL.revokeObjectURL(detailsPdfUrl)
          setDetailsPdfUrl(null)
        }
      }}>
        <DialogContent className="!max-w-7xl max-h-[95vh] overflow-y-auto w-[95vw] md:max-h-[90vh] md:w-[90vw] flex flex-col">
          <DialogHeader className="pb-6 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center">
                <Eye className="w-5 h-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-slate-900">Invoice Preview</DialogTitle>
                <DialogDescription className="text-slate-600 mt-1">
                  {detailsInvoice ? `Previewing Invoice ${detailsInvoice.invoiceNumber}` : 'Loading invoice details...'}
                </DialogDescription>
              </div>
            </div>
            {detailsLoading && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
                Loading invoice details...
              </div>
            )}
          </DialogHeader>
          
          {!detailsLoading && detailsInvoice && (
            <div className="flex-1 overflow-y-auto max-h-[calc(95vh-200px)] md:max-h-[calc(90vh-200px)] scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 hover:scrollbar-thumb-slate-400 relative">
              
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 py-6 pr-2">
                {/* Left Column - Quick Actions & Invoice Details */}
                <div className="lg:col-span-1 space-y-6">
                  {/* Quick Actions */}
                  <div className="bg-slate-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      <RefreshCw className="w-5 h-5 text-green-600" />
                      Quick Actions
                    </h3>
                    
                    {/* Accounting Integration Status */}
                    <div className="mb-6">
                      <AccountingIntegrationStatus 
                        invoiceId={detailsInvoice?.id || ''} 
                        invoiceNumber={detailsInvoice?.invoiceNumber || ''} 
                      />
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-slate-700">Status</Label>
                        <Select value={detailsStatus} onValueChange={setDetailsStatus}>
                          <SelectTrigger className="h-12 bg-white border-slate-300">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="sent">Sent</SelectItem>
                            <SelectItem value="paid">Paid</SelectItem>
                            <SelectItem value="overdue">Overdue</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-slate-700">Due Date</Label>
                        <Input 
                          type="date" 
                          value={detailsDueDate} 
                          onChange={(e) => setDetailsDueDate(e.target.value)} 
                          className="h-12 bg-white border-slate-300"
                        />
                      </div>
                      <Button 
                        disabled={detailsSaving} 
                        onClick={async () => {
                          try {
                            setDetailsSaving(true)
                            await apiService.updateInvoice(detailsInvoice.id, { status: detailsStatus as any, dueDate: detailsDueDate || undefined })
                            await qc.invalidateQueries({ queryKey: ["invoices"] })
                            setDetailsInvoice(prev => prev ? { ...prev, status: detailsStatus as any, dueDate: detailsDueDate } : prev)
                          } finally {
                            setDetailsSaving(false)
                          }
                        }}
                        className="w-full h-12 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        {detailsSaving ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Invoice Information */}
                  <div className="bg-slate-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-green-600" />
                      Invoice Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-slate-200">
                        <span className="text-sm font-medium text-slate-600">Invoice #:</span>
                        <span className="text-sm font-semibold text-slate-900">{detailsInvoice.invoiceNumber}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-200">
                        <span className="text-sm font-medium text-slate-600">Issue Date:</span>
                        <span className="text-sm font-semibold text-slate-900">
                          {new Date(detailsInvoice.issueDate).toLocaleDateString()}
                        </span>
                      </div>
                      {detailsDueDate && (
                        <div className="flex justify-between items-center py-2 border-b border-slate-200">
                          <span className="text-sm font-medium text-slate-600">Due Date:</span>
                          <span className="text-sm font-semibold text-slate-900">
                            {new Date(detailsDueDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between items-center py-2 border-b border-slate-200">
                        <span className="text-sm font-medium text-slate-600">Total Amount:</span>
                        <span className="text-sm font-bold text-slate-900">
                          {formatCurrency(detailsInvoice.totalAmount, detailsInvoice.currency || 'USD')}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm font-medium text-slate-600">Balance Due:</span>
                        <span className="text-sm font-bold text-slate-900">
                          {formatCurrency(detailsInvoice.balanceDue, detailsInvoice.currency || 'USD')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="bg-slate-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      <Download className="w-5 h-5 text-green-600" />
                      Actions
                    </h3>
                    <div className="space-y-3">
                      <Button 
                        variant="outline" 
                        className="w-full h-12 justify-start"
                        onClick={async () => {
                          try {
                            await generateInvoicePDF(detailsInvoice, 'preview')
                          } catch (e: any) {
                            toast({ title: 'Preview failed', description: (e as any)?.message || 'Failed to preview PDF', variant: 'destructive' })
                          }
                        }}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Preview PDF
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full h-12 justify-start"
                        onClick={async () => {
                          try {
                            await generateInvoicePDF(detailsInvoice, 'download')
                          } catch (e: any) {
                            toast({ title: 'Download failed', description: (e as any)?.message || 'Failed to download PDF', variant: 'destructive' })
                          }
                        }}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download 
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full h-12 justify-start"
                        onClick={async () => {
                          try {
                            const resp = await apiService.createPaymentLink(detailsInvoice.id)
                            await navigator.clipboard.writeText(resp.url)
                            toast({ title: 'Payment link copied', description: resp.url })
                          } catch (e: any) {
                            toast({ title: 'Create link failed', description: (e as any)?.message || 'Failed to create payment link', variant: 'destructive' })
                          }
                        }}
                      >
                        <Link className="w-4 h-4 mr-2" />
                        Copy Payment Link
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Right Column - Invoice Template */}
                <div className="lg:col-span-3 space-y-6">
                  <div className="bg-slate-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-green-600" />
                      Invoice Template
                    </h3>
                    <div className="bg-white rounded-lg border border-slate-200 p-4">
                      <InvoiceTemplate
                        invoice={{
                          id: detailsInvoice.id,
                          invoiceNumber: detailsInvoice.invoiceNumber,
                          issueDate: detailsInvoice.issueDate,
                          dueDate: detailsDueDate || detailsInvoice.dueDate,
                          status: detailsStatus || detailsInvoice.status,
                          totalAmount: detailsInvoice.totalAmount,
                          balanceDue: detailsInvoice.balanceDue,
                          currency: ((Array.isArray(customers) ? customers : []).find(c => c.id === detailsInvoice.customerId)?.currency) || 'USD',
                          customer: (() => {
                            const customer = (Array.isArray(customers) ? customers : []).find(c => c.id === detailsInvoice.customerId)
                            return customer ? {
                              id: customer.id,
                              name: customer.name,
                              email: customer.email,
                              address: customer.address
                            } : undefined
                          })(),
                          lines: detailsInvoice.lines || []
                        }}
                        company={{
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
                        }}
                        onDownloadPDF={async () => {
                          try {
                            await generateInvoicePDF(detailsInvoice, 'download')
                          } catch (e: any) {
                            toast({ title: 'Download failed', description: (e as any)?.message || 'Failed to download PDF', variant: 'destructive' })
                          }
                        }}
                        onPaymentSuccess={() => {
                          toast({ title: 'Payment successful', description: 'Invoice has been paid successfully' })
                          qc.invalidateQueries({ queryKey: ["invoices"] })
                        }}
                        onPaymentError={(error) => {
                          toast({ title: 'Payment failed', description: (error as any)?.message || error?.toString() || 'Payment could not be processed', variant: 'destructive' })
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Credit Note Dialog */}
      <Dialog open={creditDialogOpen} onOpenChange={setCreditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Credit Note</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">Reason</div>
            <Textarea value={creditReason} onChange={(e) => setCreditReason(e.target.value)} rows={3} />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCreditDialogOpen(false)}>Cancel</Button>
              <Button onClick={async () => {
                if (!creditInvoiceId) return;
                try {
                  const API = process.env.NEXT_PUBLIC_API_URL || ''
                  const res = await fetch(`${API}/api/credit-notes/${selectedCompany}`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
                      'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo',
                    },
                    body: JSON.stringify({ invoiceId: creditInvoiceId, reason: creditReason, lines: [{ description: 'Credit', quantity: 1, unitPrice: 0 }] })
                  })
                  await res.json()
                  setCreditDialogOpen(false)
                } catch {}
              }}>Create</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Recurring Invoice Dialog */}
      <Dialog open={recurringDialogOpen} onOpenChange={setRecurringDialogOpen}>
        <DialogContent className="!max-w-7xl max-h-[95vh] overflow-y-auto w-[95vw] md:max-h-[90vh] md:w-[90vw]">
          <DialogHeader>
            <DialogTitle>{editingRecurring ? 'Edit Recurring Invoice' : 'Create Recurring Invoice'}</DialogTitle>
            <DialogDescription>
              Set up a recurring invoice template that will automatically generate invoices on schedule.
            </DialogDescription>
          </DialogHeader>
          <EnhancedRecurringInvoiceForm
            formData={recurringForm}
            onChange={setRecurringForm}
            customers={customers}
            isEditing={!!editingRecurring}
          />

          {recurringError && (
            <div className="text-red-600 text-sm">{recurringError}</div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setRecurringDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              disabled={recurringSaving || !isRecurringFormValid(recurringForm)}
              onClick={async () => {
                try {
                  setRecurringSaving(true)
                  setRecurringError(null)
                  
                  if (editingRecurring) {
                    await updateRecurringInvoiceMutation.mutateAsync({
                      id: editingRecurring.id,
                      data: recurringForm
                    })
                  } else {
                    await createRecurringInvoiceMutation.mutateAsync(recurringForm)
                  }
                } catch (error: any) {
                  setRecurringError((error as any)?.message || 'Failed to save recurring invoice')
                } finally {
                  setRecurringSaving(false)
                }
              }}
            >
              {recurringSaving ? 'Saving...' : (editingRecurring ? 'Update' : 'Create')}
            </Button>
          </DialogFooter>
        </DialogContent>
        </Dialog>

        {/* Recurring Invoice Details Dialog */}
        <Dialog open={recurringDetailsOpen} onOpenChange={setRecurringDetailsOpen}>
          <DialogContent className="!max-w-7xl max-h-[95vh] overflow-y-auto w-[95vw] md:max-h-[90vh] md:w-[90vw]">
            <DialogHeader>
              <DialogTitle>Recurring Invoice Details</DialogTitle>
              <DialogDescription>
                View details and generated invoices for this recurring template.
              </DialogDescription>
            </DialogHeader>
            
            {selectedRecurring && (
              <div className="space-y-6">
                {/* Reuse the same form in read-only mode for a consistent view */}
                {(() => {
                  const lines = (selectedRecurring.lines || []).map(l => ({
                    description: l.description || '',
                    quantity: Number(l.quantity) || 0,
                    unitPrice: Number(l.unitPrice) || 0,
                    taxRate: Number(l.taxRate) || 0,
                  }))
                  const totals = recalcRecurringTotals(lines)
                  const viewData = {
                    customerId: selectedRecurring.customerId,
                    name: selectedRecurring.name,
                    description: selectedRecurring.description || '',
                    frequency: selectedRecurring.frequency as 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom',
                    interval: selectedRecurring.interval || 1,
                    startDate: (selectedRecurring.startDate || '').slice(0,10),
                    endDate: selectedRecurring.endDate ? selectedRecurring.endDate.slice(0,10) : '',
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
                  }
                  return (
                    <EnhancedRecurringInvoiceForm
                      formData={viewData}
                      onChange={() => {}}
                      customers={customers}
                      isEditing={false}
                      readOnly
                    />
                  )
                })()}

                {/* Generated Invoices History */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold">Generated Invoices</h4>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => loadRecurringHistory(selectedRecurring.id)}
                      disabled={recurringHistoryLoading}
                    >
                      {recurringHistoryLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <RefreshCw className="w-4 h-4 mr-2" />
                      )}
                      Refresh
                    </Button>
                  </div>
                  
                  {recurringHistoryLoading ? (
                    <div className="text-center py-4">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                      <p className="text-sm text-gray-500 mt-2">Loading invoice history...</p>
                    </div>
                  ) : recurringHistory.length > 0 ? (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {recurringHistory.map((invoice) => (
                        <div key={invoice.id} className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50">
                          <div>
                            <p className="font-medium">{invoice.invoiceNumber}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(invoice.createdAt).toLocaleDateString()} • 
                              Status: <Badge variant="outline" className="ml-1">{invoice.status}</Badge>
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{formatCurrency(invoice.totalAmount, invoice.currency)}</p>
                            {invoice.payments?.length > 0 && (
                              <p className="text-sm text-green-600">
                                {invoice.payments.length} payment(s)
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No invoices generated yet</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </PageLayout>
  )
}
