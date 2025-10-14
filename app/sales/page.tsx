"use client"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useMemo, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "../../src/components/ui/card"
import { Button } from "../../src/components/ui/button"
import { Input } from "../../src/components/ui/input"
import { Badge } from "../../src/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../src/components/ui/tabs"
import { SegmentedTabs } from "../../src/components/ui/segmented-tabs"
import { PageLayout } from "../../src/components/page-layout"
import { Plus, Search, Filter, Eye, Edit, Send, Download, FileText, Users, Calculator, RefreshCw, CreditCard, CheckCircle, MessageSquare, Bot } from "lucide-react"
import { useToast } from "../../src/hooks/use-toast"
import apiService, { Estimate, RecurringInvoice } from "../../src/lib/api"
import { useAuth } from "../../src/contexts/auth-context"
import { useDemoAuth } from "../../src/hooks/useDemoAuth"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../src/components/ui/dialog"
import { Label } from "../../src/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../src/components/ui/select"
import { PaymentButtonCompact } from "../../src/components/payment-button"
import { InvoiceTemplate } from "../../src/components/invoice-template"
import { InvoiceApproval } from "../../src/components/invoice-approval"
import { Textarea } from "../../src/components/ui/textarea"
import { NaturalLanguageInvoice } from "../../src/components/natural-language-invoice"
import { AIAccountingChat } from "../../src/components/ai-accounting-chat"

// Type aliases for event handlers
type InputChangeEvent = React.ChangeEvent<HTMLInputElement>
type SelectChangeEvent = React.ChangeEvent<HTMLSelectElement>
type TextAreaChangeEvent = React.ChangeEvent<HTMLTextAreaElement>

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
}

type CustomerListItem = {
  id: string
  name: string
  email?: string
  currency?: string
}

export default function SalesPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const { ready: demoAuthReady } = useDemoAuth('sales-page')
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState<string>('seed-company-1')

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

  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false)
  const [invoiceSaving, setInvoiceSaving] = useState(false)
  const [invoiceError, setInvoiceError] = useState<string | null>(null)
  type InvoiceLine = { description: string; quantity: number; unitPrice: number; taxRate: number; lineDiscount?: number }
  const [invoiceForm, setInvoiceForm] = useState<{ customerId: string; invoiceNumber: string; currency: string; issueDate: string; dueDate?: string; discountMode: 'amount'|'percent'; discount: number; shipping: number; taxMode: 'per_line'|'global'; globalTaxRate: number; lines: InvoiceLine[]; subtotal: number; taxTotal: number; totalAmount: number }>(
    { customerId: "", invoiceNumber: "", currency: 'USD', issueDate: new Date().toISOString().slice(0,10), dueDate: "", discountMode: 'amount', discount: 0, shipping: 0, taxMode: 'per_line', globalTaxRate: 0, lines: [{ description: "", quantity: 1, unitPrice: 0, taxRate: 0 }], subtotal: 0, taxTotal: 0, totalAmount: 0 }
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

  // Fetch companies for the company selector
  const companiesQuery = useQuery({
    queryKey: ['companies'],
    queryFn: () => apiService.getCompanies(),
    enabled: (isAuthenticated || demoAuthReady) && !authLoading,
    staleTime: 5 * 60 * 1000
  })

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
      setRecurringForm({
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
        lines: [{ description: "", quantity: 1, unitPrice: 0, taxRate: 0 }], 
        subtotal: 0, 
        taxTotal: 0, 
        totalAmount: 0 
      })
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
      setRecurringForm({
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
        lines: [{ description: "", quantity: 1, unitPrice: 0, taxRate: 0 }], 
        subtotal: 0, 
        taxTotal: 0, 
        totalAmount: 0 
      })
      setEditingRecurring(null)
    }
  })

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
    const safeInvoices = Array.isArray(invoices) ? invoices : []
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    
    // Total invoices amount
    const totalAmount = safeInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0)
    
    // Outstanding invoices (unpaid invoices)
    const outstanding = safeInvoices
      .filter(inv => inv.status !== 'paid' && inv.status !== 'cancelled')
      .reduce((sum, inv) => sum + (inv.balanceDue || 0), 0)
    
    // Paid this month
    const paidThisMonth = safeInvoices
      .filter(inv => {
        if (inv.status !== 'paid') return false
        const paidDate = new Date(inv.issueDate)
        return paidDate.getMonth() === currentMonth && paidDate.getFullYear() === currentYear
      })
      .reduce((sum, inv) => sum + (inv.totalAmount || 0), 0)
    
    // Overdue invoices (past due date and not paid)
    const overdue = safeInvoices
      .filter(inv => {
        if (inv.status === 'paid' || inv.status === 'cancelled') return false
        if (!inv.dueDate) return false
        const dueDate = new Date(inv.dueDate)
        return dueDate < now
      })
      .reduce((sum, inv) => sum + (inv.balanceDue || 0), 0)
    
    // Calculate percentages
    const outstandingPercentage = totalAmount > 0 ? (outstanding / totalAmount) * 100 : 0
    const paidThisMonthPercentage = totalAmount > 0 ? (paidThisMonth / totalAmount) * 100 : 0
    const overduePercentage = totalAmount > 0 ? (overdue / totalAmount) * 100 : 0
    
    return { 
      outstanding, 
      paidThisMonth, 
      overdue, 
      outstandingPercentage, 
      paidThisMonthPercentage, 
      overduePercentage 
    }
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Sales & Invoicing</h1>
          <p className="text-muted-foreground">Manage customers, invoices, and sales transactions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button 
            onClick={async () => { 
              let number = ""
              try { const next = await apiService.getNextInvoiceNumber(selectedCompany); number = (next as any)?.invoiceNumber || "" } catch {}
              const startLines = [{ description: "", quantity: 1, unitPrice: 0, taxRate: 0 }]
              const safeCustomers = allCustomers
              const initCurrency = safeCustomers[0]?.currency || 'USD'
              setLastPriceCurrency(initCurrency)
              setInvoiceForm({ customerId: safeCustomers[0]?.id || "", invoiceNumber: number, currency: initCurrency, issueDate: new Date().toISOString().slice(0,10), dueDate: "", discountMode: 'amount', discount: 0, shipping: 0, taxMode: 'per_line', globalTaxRate: 0, lines: startLines, ...recalcTotals(startLines, 0, 0, 'per_line', 0, 'amount') });
              setInvoiceDialogOpen(true) 
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Invoice
          </Button>
        </div>
      </div>

      {/* Company Selector */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Label htmlFor="company-select" className="text-sm font-medium">Company:</Label>
            <Select value={selectedCompany} onValueChange={setSelectedCompany}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select company" />
              </SelectTrigger>
              <SelectContent>
                {(companiesQuery.data?.data || []).map((company: any) => (
                  <SelectItem key={company.id} value={safeSelectValue(company.id)}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {companiesQuery.isLoading && (
              <div className="text-sm text-muted-foreground">Loading companies...</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                <span className="text-cyan-600 font-semibold">$</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Outstanding</p>
                <p className="text-xl font-bold">
                  {loading ? "—" : `${salesStats.outstandingPercentage.toFixed(0)}%`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 font-semibold">✓</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Paid This Month</p>
                <p className="text-xl font-bold">
                  {loading ? "—" : `${salesStats.paidThisMonthPercentage.toFixed(0)}%`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <span className="text-amber-600 font-semibold">!</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className="text-xl font-bold">
                  {loading ? "—" : `${salesStats.overduePercentage.toFixed(0)}%`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 font-semibold">👥</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Customers</p>
                <p className="text-xl font-bold">
                  {loading ? "—" : (Array.isArray(customers) ? customers : []).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <SegmentedTabs
        tabs={[
          { id: 'invoices', label: 'Invoices' },
          { id: 'customers', label: 'Customers' },
          { id: 'estimates', label: 'Estimates' },
          { id: 'recurring', label: 'Recurring' },
          { id: 'approvals', label: 'Approvals' },
          { id: 'ai-create', label: 'AI Create' },
          { id: 'ai-chat', label: 'AI Chat' },
        ]}
        value={'invoices'}
        onChange={() => {}}
        className="mb-4"
      />
      <Tabs defaultValue="invoices" className="space-y-4" variant="bordered">
        <TabsList variant="bordered">
          <TabsTrigger value="invoices" variant="bordered" icon={<FileText className="w-4 h-4" />} badge={invoices.length}>
            Invoices
          </TabsTrigger>
          <TabsTrigger value="customers" variant="bordered" icon={<Users className="w-4 h-4" />} badge={customers.length}>
            Customers
          </TabsTrigger>
          <TabsTrigger value="estimates" variant="bordered" icon={<Calculator className="w-4 h-4" />} badge={estimates.length}>
            Estimates
          </TabsTrigger>
          <TabsTrigger value="recurring" variant="bordered" icon={<RefreshCw className="w-4 h-4" />} badge={recurringInvoices.length}>
            Recurring
          </TabsTrigger>
          <TabsTrigger value="approvals" variant="bordered" icon={<CheckCircle className="w-4 h-4" />}>
            Approvals
          </TabsTrigger>
          <TabsTrigger value="ai-create" variant="bordered" icon={<MessageSquare className="w-4 h-4" />}>
            AI Create
          </TabsTrigger>
          <TabsTrigger value="ai-chat" variant="bordered" icon={<Bot className="w-4 h-4" />}>
            AI Chat
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
                    <Input placeholder="Search invoices..." className="pl-10 w-64" value={invoiceSearch} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInvoiceSearch(e.target.value)} />
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
                <div className="text-red-600 text-sm mb-2">{error}</div>
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
                    className="group flex items-center justify-between p-6 bg-white border border-gray-100 rounded-xl hover:shadow-lg hover:border-blue-200 transition-all duration-200"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center group-hover:from-blue-200 group-hover:to-blue-300 transition-all duration-200">
                        <span className="text-blue-600 font-bold text-lg">#</span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-lg">{inv.invoiceNumber}</p>
                        <p className="text-sm text-gray-600">{(() => {
                          if ((customersQuery as any)?.isLoading) return '—'
                          const c = (Array.isArray(customers) ? customers : []).find(cu => cu.id === inv.customerId)
                          return c ? c.name : inv.customerId
                        })()}</p>
                        <div className="flex items-center gap-2 mt-1">
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
                            className="text-xs"
                          >
                              {inv.status}
                          </Badge>
                          {inv.dueDate && (
                            <span className="text-xs text-gray-500">
                              Due: {new Date(inv.dueDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold text-lg text-gray-900">
                          {formatCurrency(inv.totalAmount, ((customersQuery as any)?.isLoading ? 'USD' : ((Array.isArray(customers) ? customers : []).find(c => c.id === inv.customerId)?.currency) || 'USD'))}
                        </p>
                        <p className="text-sm text-gray-500">
                          Balance: {formatCurrency(inv.balanceDue, ((customersQuery as any)?.isLoading ? 'USD' : ((Array.isArray(customers) ? customers : []).find(c => c.id === inv.customerId)?.currency) || 'USD'))}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {(inv.status === 'draft' || (inv.dueDate && inv.balanceDue > 0 && new Date(inv.dueDate) < new Date())) && (
                          <Badge variant="destructive" className="text-xs">Overdue</Badge>
                        )}
                        {inv.status === 'draft' && (
                          <Button variant="outline" size="sm" className="hover:bg-blue-50 hover:border-blue-200" onClick={async () => {
                            try { await apiService.updateInvoice(inv.id, { status: 'sent' }); await qc.invalidateQueries({ queryKey: ["invoices"] }) } catch {}
                          }}>Mark Sent</Button>
                        )}
                        <Button variant="outline" size="sm" onClick={() => { setCreditInvoiceId(inv.id); setCreditDialogOpen(true) }}>Credit Note</Button>
                        {(inv.status === 'sent' || inv.status === 'pending') && (
                          <>
                            <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={async () => {
                              try { await apiService.updateInvoice(inv.id, { status: 'paid', balanceDue: 0 }); await qc.invalidateQueries({ queryKey: ["invoices"] }) } catch {}
                            }}>Mark Paid</Button>
                            {inv.balanceDue > 0 && (
                              <PaymentButtonCompact
                                invoiceId={inv.id}
                                amount={inv.balanceDue}
                                currency={((customersQuery as any)?.isLoading ? 'USD' : ((Array.isArray(customers) ? customers : []).find(c => c.id === inv.customerId)?.currency) || 'USD')}
                                customerEmail={((Array.isArray(customers) ? customers : []).find(c => c.id === inv.customerId)?.email)}
                                customerName={((Array.isArray(customers) ? customers : []).find(c => c.id === inv.customerId)?.name)}
                                description={`Payment for Invoice ${inv.invoiceNumber}`}
                                onPaymentSuccess={() => {
                                  qc.invalidateQueries({ queryKey: ["invoices"] })
                                }}
                                onPaymentError={(error: any) => {
                                  console.error('Payment error:', error)
                                }}
                              />
                            )}
                          </>
                        )}
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Button variant="ghost" size="sm" onClick={async () => {
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
                        }}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => {
                          setSendEmailInvoiceId(inv.id)
                          const c = (Array.isArray(customers) ? customers : []).find(x => x.id === inv.customerId)
                          setSendEmailTo(c?.email || '')
                          setSendEmailOpen(true)
                        }}>
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
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
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Invoice</DialogTitle>
                <DialogDescription>Fill in invoice details.</DialogDescription>
              </DialogHeader>
              {invoiceError && (
                <div className="text-red-600 text-sm">{invoiceError}</div>
              )}
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="inv-customer">Customer</Label>
                  <select id="inv-customer" className="w-full border rounded px-2 py-2" value={invoiceForm.customerId} onChange={async (e) => {
                    const newCustomerId = e.target.value
                    const cust = allCustomers.find(c => c.id === newCustomerId)
                    let nextCurrency = invoiceForm.currency
                    if (cust?.currency && autoConvertPrices && !lockRate) {
                      // convert from lastPriceCurrency -> cust.currency first, then to current invoice currency if needed
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
                    {allCustomers.map(c => (
                      <option key={c.id} value={c.id}>{c.name}{c.currency ? ` (${c.currency})` : ''}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-5 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="inv-number">Invoice #</Label>
                    <Input id="inv-number" value={invoiceForm.invoiceNumber} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInvoiceForm({ ...invoiceForm, invoiceNumber: e.target.value })} placeholder="INV-001" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="inv-currency">Currency</Label>
                    <select id="inv-currency" className="w-full border rounded px-2 py-2" value={invoiceForm.currency} onChange={async (e: React.ChangeEvent<HTMLSelectElement>) => {
                      const newCurrency = e.target.value
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
                      {['USD','EUR','GBP','KES','NGN'].map(c => (<option key={c} value={c}>{c}</option>))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="inv-shipping">Shipping</Label>
                    <Input id="inv-shipping" type="number" step="0.01" value={invoiceForm.shipping} onChange={(e: React.ChangeEvent<HTMLInputElement>) => { const shipping = parseFloat(e.target.value) || 0; setInvoiceForm(prev => ({ ...prev, shipping, ...recalcTotals(prev.lines, prev.discount, shipping) })) }} />
                  </div>
                  <div className="space-y-2">
                    <Label>Discount Mode</Label>
                    <select className="w-full border rounded px-2 py-2" value={invoiceForm.discountMode} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => { const dm = (e.target.value as 'amount'|'percent'); setInvoiceForm(prev => ({ ...prev, discountMode: dm, ...recalcTotals(prev.lines, prev.discount, prev.shipping, prev.taxMode, prev.globalTaxRate, dm) })) }}>
                      <option value="amount">Amount</option>
                      <option value="percent">Percent</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Auto convert</Label>
                    <select className="w-full border rounded px-2 py-2" value={autoConvertPrices ? 'on' : 'off'} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setAutoConvertPrices(e.target.value === 'on') }>
                      <option value="on">On</option>
                      <option value="off">Off</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Lock rate</Label>
                    <select className="w-full border rounded px-2 py-2" value={lockRate ? 'on' : 'off'} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setLockRate(e.target.value === 'on') }>
                      <option value="off">Off</option>
                      <option value="on">On</option>
                    </select>
                    <div className="text-xs text-muted-foreground">Rate: {exchangeRate.toFixed(4)} {lastPriceCurrency} → {invoiceForm.currency}</div>
                  </div>
                  <div className="col-span-5 text-xs text-muted-foreground">Rate: {exchangeRate.toFixed(4)} {lastPriceCurrency} → {invoiceForm.currency} {lockRate ? '(locked)' : ''}</div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="inv-issue">Issue Date</Label>
                    <Input id="inv-issue" type="date" value={invoiceForm.issueDate} onChange={(e: InputChangeEvent) => setInvoiceForm({ ...invoiceForm, issueDate: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="inv-due">Due Date</Label>
                    <Input id="inv-due" type="date" value={invoiceForm.dueDate || ''} onChange={(e: InputChangeEvent) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="inv-discount">Discount {invoiceForm.discountMode === 'percent' ? '(%)' : ''}</Label>
                    <Input id="inv-discount" type="number" step="0.01" value={invoiceForm.discount} onChange={(e: InputChangeEvent) => { const discount = parseFloat(e.target.value) || 0; setInvoiceForm(prev => ({ ...prev, discount, ...recalcTotals(prev.lines, discount) })) }} />
                  </div>
                  <div className="space-y-2">
                    <Label>Tax Mode</Label>
                    <select className="w-full border rounded px-2 py-2" value={invoiceForm.taxMode} onChange={(e: SelectChangeEvent) => { const taxMode = (e.target.value as 'per_line'|'global'); setInvoiceForm(prev => ({ ...prev, taxMode, ...recalcTotals(prev.lines, prev.discount, prev.shipping, taxMode, prev.globalTaxRate) })) }}>
                      <option value="per_line">Per Line</option>
                      <option value="global">Global</option>
                    </select>
                  </div>
                  {invoiceForm.taxMode === 'global' && (
                    <div className="space-y-2">
                      <Label htmlFor="inv-tax">Global Tax %</Label>
                      <Input id="inv-tax" type="number" step="0.01" value={invoiceForm.globalTaxRate} onChange={(e: InputChangeEvent) => { const r = parseFloat(e.target.value) || 0; setInvoiceForm(prev => ({ ...prev, globalTaxRate: r, ...recalcTotals(prev.lines, prev.discount, prev.shipping, prev.taxMode, r) })) }} />
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  <Label>Line Items</Label>
                  <div className="space-y-2">
                    {invoiceForm.lines.map((line, idx) => (
                      <div key={idx} className="grid grid-cols-12 gap-2 items-end">
                        <div className="col-span-5">
                          <div className="grid grid-cols-12 gap-2">
                            <div className="col-span-6">
                              <Input placeholder="Description" value={line.description} onChange={(e) => {
                                const lines = [...invoiceForm.lines]
                                lines[idx].description = e.target.value
                                setInvoiceForm({ ...invoiceForm, lines, ...recalcTotals(lines) })
                              }} />
                            </div>
                            <div className="col-span-6">
                              <select className="w-full border rounded px-2 py-2" value={-1} onChange={(e) => {
                                const productId = e.target.value
                                const p = products.find((pr: any) => pr.id === productId)
                                if (!p) return
                                const lines = [...invoiceForm.lines]
                                lines[idx].description = p.name
                                lines[idx].unitPrice = p.unitPrice || p.price || 0
                                setInvoiceForm({ ...invoiceForm, lines, ...recalcTotals(lines) })
                              }}>
                                <option value={-1}>Select product…</option>
                                {products.map((p: any) => (
                                  <option key={p.id} value={p.id}>{p.sku ? `${p.sku} - ` : ''}{p.name}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                        <div className="col-span-2">
                          <Input type="number" min="0" step="1" placeholder="Qty" value={line.quantity} onChange={(e) => {
                            const lines = [...invoiceForm.lines]
                            lines[idx].quantity = parseFloat(e.target.value) || 0
                            setInvoiceForm({ ...invoiceForm, lines, ...recalcTotals(lines) })
                          }} />
                        </div>
                        <div className="col-span-2">
                          <Input type="number" min="0" step="0.01" placeholder="Unit Price" value={line.unitPrice} onChange={(e) => {
                            const lines = [...invoiceForm.lines]
                            lines[idx].unitPrice = parseFloat(e.target.value) || 0
                            setInvoiceForm({ ...invoiceForm, lines, ...recalcTotals(lines) })
                          }} />
                        </div>
                        <div className="col-span-2">
                          <Input type="number" min="0" step="0.01" placeholder="Line Discount" value={line.lineDiscount || 0} onChange={(e) => {
                            const lines = [...invoiceForm.lines]
                            lines[idx].lineDiscount = parseFloat(e.target.value) || 0
                            setInvoiceForm({ ...invoiceForm, lines, ...recalcTotals(lines) })
                          }} />
                        </div>
                        <div className="col-span-2">
                          <Input type="number" min="0" step="0.01" placeholder="Tax %" disabled={invoiceForm.taxMode === 'global'} value={line.taxRate} onChange={(e) => {
                            const lines = [...invoiceForm.lines]
                            lines[idx].taxRate = parseFloat(e.target.value) || 0
                            setInvoiceForm({ ...invoiceForm, lines, ...recalcTotals(lines) })
                          }} />
                        </div>
                        <div className="col-span-1">
                          <Button variant="ghost" size="sm" onClick={() => {
                            const lines = invoiceForm.lines.filter((_, i) => i !== idx)
                            setInvoiceForm({ ...invoiceForm, lines: lines.length ? lines : [{ description: "", quantity: 1, unitPrice: 0, taxRate: 0 }], ...recalcTotals(lines.length ? lines : [{ description: "", quantity: 1, unitPrice: 0, taxRate: 0 }]) })
                          }}>×</Button>
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={() => {
                      const lines = [...invoiceForm.lines, { description: "", quantity: 1, unitPrice: 0, taxRate: 0 }]
                      setInvoiceForm({ ...invoiceForm, lines, ...recalcTotals(lines) })
                    }}>Add Line</Button>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={async () => {
                        try {
                          if (!invoices[0]) {
                            toast({ title: 'Preview unavailable', description: 'Save invoice first, then preview.', variant: 'destructive' })
                            return
                          }
                          const blob = await apiService.getInvoicePdf(invoices[0].id)
                          const url = URL.createObjectURL(blob)
                          window.open(url, '_blank')
                          setTimeout(() => URL.revokeObjectURL(url), 30000)
                        } catch (e: any) {
                          toast({ title: 'Preview failed', description: e?.message || 'Failed to preview PDF', variant: 'destructive' })
                        }
                      }}>Preview PDF</Button>
                      <Button variant="outline" size="sm" onClick={async () => {
                        try {
                          if (!invoices[0]) {
                            toast({ title: 'No invoice yet', description: 'Save invoice first, then create payment link.', variant: 'destructive' })
                            return
                          }
                          const resp = await apiService.createPaymentLink(invoices[0].id)
                          await navigator.clipboard.writeText(resp.url)
                          toast({ title: 'Payment link copied', description: resp.url })
                        } catch (e: any) {
                          toast({ title: 'Create link failed', description: e?.message || 'Failed to create payment link', variant: 'destructive' })
                        }
                      }}>Copy Payment Link</Button>
                    </div>
                  </div>
                  <div className="text-sm grid grid-cols-3 gap-2">
                    <div className="font-medium">Subtotal</div>
                    <div className="col-span-2 text-right">{formatCurrency(invoiceForm.subtotal, invoiceForm.currency)}</div>
                    <div className="font-medium">Tax</div>
                    <div className="col-span-2 text-right">{formatCurrency(invoiceForm.taxTotal, invoiceForm.currency)}</div>
                    <div className="font-medium">Total</div>
                    <div className="col-span-2 text-right font-semibold">{formatCurrency(invoiceForm.totalAmount, invoiceForm.currency)}</div>
                  </div>
                </div>
              </div>
              <DialogFooter className="sticky bottom-0 bg-white pt-2">
                <Button variant="outline" onClick={() => setInvoiceDialogOpen(false)} disabled={invoiceSaving}>Cancel</Button>
                <Button onClick={async () => {
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
                      totalAmount: invoiceForm.totalAmount,
                      balanceDue: invoiceForm.totalAmount,
                      currency: invoiceForm.currency,
                      lines: invoiceForm.lines.map(l => ({ description: l.description, quantity: l.quantity, unitPrice: l.unitPrice, taxRate: l.taxRate, lineDiscount: l.lineDiscount || 0 })),
                      fxRateSnapshot: exchangeRate,
                      totalsSnapshot: {
                        subtotal: invoiceForm.subtotal,
                        taxTotal: invoiceForm.taxTotal,
                        shipping: invoiceForm.shipping,
                        discountMode: invoiceForm.discountMode,
                        discount: invoiceForm.discount,
                        total: invoiceForm.totalAmount
                      },
                      status: 'draft'
                    }
                    const created = await apiService.createInvoice(payload as any)
                    await qc.invalidateQueries({ queryKey: ["invoices"] })
                    // immediately enable PDF/Payment actions via created.id
                    if (created?.id) {
                      try {
                        const blob = await apiService.getInvoicePdf(created.id)
                        const url = URL.createObjectURL(blob)
                        window.open(url, '_blank')
                        setTimeout(() => URL.revokeObjectURL(url), 30000)
                      } catch {}
                      try {
                        const link = await apiService.createPaymentLink(created.id, { expiresInMinutes: 60 })
                        await navigator.clipboard.writeText(link.url)
                        toast({ title: 'Payment link copied', description: link.url })
                      } catch {}
                    }
                    setInvoiceDialogOpen(false)
                  } catch (e: any) {
                    setInvoiceError(e?.message || 'Failed to create invoice')
                  } finally {
                    setInvoiceSaving(false)
                  }
                }} disabled={invoiceSaving}>
                  {invoiceSaving ? 'Creating…' : 'Create Invoice'}
                </Button>
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
                    setCustomerError(e?.message || 'Failed to save customer')
                    toast({ title: 'Customer save failed', description: e?.message || 'Failed to save customer', variant: 'destructive' })
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
                <div className="text-red-600 text-sm mb-2">{error}</div>
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
                            console.log('Editing estimate:', est)
                            console.log('Issue date:', est.issueDate, 'Formatted:', formatDateForInput(est.issueDate))
                            console.log('Expiry date:', est.expiryDate, 'Formatted:', formatDateForInput(est.expiryDate))
                            
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
                  setEstimateError(e?.message || 'Failed to create estimate')
                  toast({ title: 'Estimate creation failed', description: e?.message || 'Failed to create estimate', variant: 'destructive' })
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
                  setEstimateError(error?.message || 'Failed to update estimate')
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
                      customerId: safeCustomers[0]?.id || "", 
                      name: "", 
                      description: "", 
                      frequency: 'monthly', 
                      interval: 1, 
                      startDate: new Date().toISOString().slice(0,10), 
                      endDate: "", 
                      currency: safeCustomers[0]?.currency || 'USD', 
                      notes: "", 
                      terms: "", 
                      dueDateOffset: 30, 
                      autoSend: false, 
                      lines: [{ description: "", quantity: 1, unitPrice: 0, taxRate: 0 }], 
                      subtotal: 0, 
                      taxTotal: 0, 
                      totalAmount: 0 
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
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {rec.status === 'active' && (
                        <Button variant="outline" size="sm" className="hover:bg-green-50 hover:border-green-200">
                          Generate
                        </Button>
                      )}
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Eye className="w-4 h-4" />
                    </div>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    {rec.status === 'active' && (
                      <Button variant="outline" size="sm">
                        Generate
                      </Button>
                    )}
                  </div>
                </div>
              ))}

              {!((recurringInvoicesQuery as any)?.isLoading) && displayRecurringInvoices.length === 0 && (
              <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No recurring invoices found</p>
                  <Button onClick={() => {
                    const safeCustomers = Array.isArray(customers) ? customers : []
                    setRecurringForm({
                      customerId: safeCustomers[0]?.id || "", 
                      name: "", 
                      description: "", 
                      frequency: 'monthly', 
                      interval: 1, 
                      startDate: new Date().toISOString().slice(0,10), 
                      endDate: "", 
                      currency: safeCustomers[0]?.currency || 'USD', 
                      notes: "", 
                      terms: "", 
                      dueDateOffset: 30, 
                      autoSend: false, 
                      lines: [{ description: "", quantity: 1, unitPrice: 0, taxRate: 0 }], 
                      subtotal: 0, 
                      taxTotal: 0, 
                      totalAmount: 0 
                    })
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
          <InvoiceApproval 
            invoiceId="" 
            onApprovalComplete={() => {
              // Refresh invoices list when approval is completed
              qc.invalidateQueries({ queryKey: ["invoices"] })
            }}
          />
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
                await apiService.sendInvoiceEmail(sendEmailInvoiceId, { to: sendEmailTo, attachPdf: true })
                toast({ title: 'Invoice sent', description: sendEmailTo })
                setSendEmailOpen(false)
              } catch (e: any) {
                toast({ title: 'Send failed', description: e?.message || 'Failed to send', variant: 'destructive' })
              } finally {
                setSendEmailLoading(false)
              }
            }}>{sendEmailLoading ? 'Sending…' : 'Send PDF'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invoice Details Drawer */}
      <Dialog open={detailsOpen} onOpenChange={(open) => {
        setDetailsOpen(open)
        if (!open && detailsPdfUrl) {
          URL.revokeObjectURL(detailsPdfUrl)
          setDetailsPdfUrl(null)
        }
      }}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Invoice Preview</DialogTitle>
            <DialogDescription>{detailsInvoice ? `${detailsInvoice.invoiceNumber}` : '—'}</DialogDescription>
          </DialogHeader>
          {detailsLoading && <div className="text-sm text-muted-foreground">Loading…</div>}
          {!detailsLoading && detailsInvoice && (
            <div className="space-y-4">
              {/* Quick Actions */}
              <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Status:</span>
                  <select className="border rounded px-2 py-1 text-sm" value={detailsStatus} onChange={(e) => setDetailsStatus(e.target.value)}>
                    <option value="draft">Draft</option>
                    <option value="sent">Sent</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Due Date:</span>
                  <Input type="date" value={detailsDueDate} onChange={(e) => setDetailsDueDate(e.target.value)} className="w-auto" />
                </div>
                <Button size="sm" disabled={detailsSaving} onClick={async () => {
                  try {
                    setDetailsSaving(true)
                    await apiService.updateInvoice(detailsInvoice.id, { status: detailsStatus as any, dueDate: detailsDueDate || undefined })
                    await qc.invalidateQueries({ queryKey: ["invoices"] })
                    setDetailsInvoice(prev => prev ? { ...prev, status: detailsStatus as any, dueDate: detailsDueDate } : prev)
                  } finally {
                    setDetailsSaving(false)
                  }
                }}>Save Changes</Button>
              </div>

              {/* Professional Invoice Template */}
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
                  subtotal: (detailsInvoice as any).subtotal || 0,
                  taxAmount: (detailsInvoice as any).taxAmount || 0,
                  discountAmount: (detailsInvoice as any).discountAmount || 0,
                  customer: (() => {
                    const c = (Array.isArray(customers) ? customers : []).find(cu => cu.id === detailsInvoice.customerId)
                    return c ? { 
                      name: c.name, 
                      email: c.email,
                      address: (c as any).address || '',
                      phone: (c as any).phone || '',
                      taxId: (c as any).taxId || ''
                    } : undefined
                  })(),
                  lines: (detailsInvoice as any).lines?.map((line: any) => ({
                    description: line.description,
                    quantity: line.quantity,
                    unitPrice: line.unitPrice,
                    lineTotal: line.lineTotal || (line.quantity * line.unitPrice),
                    taxRate: line.taxRate
                  })),
                  notes: (detailsInvoice as any).notes || '',
                  paymentUrl: detailsPayLink || undefined
                }}
                company={{
                  name: "UrutiIQ", // This should be loaded from selected company data
                  primaryColor: "#1f2937",
                  secondaryColor: "#3b82f6",
                  fontFamily: "Inter",
                  address: "123 Business Street",
                  city: "Business City",
                  state: "BC",
                  postalCode: "12345",
                  email: "billing@urutiiq.com",
                  phone: "+1 (555) 123-4567",
                  website: "www.urutiiq.com",
                  taxId: "123-456-789",
                  invoiceTemplate: "professional",
                  invoiceTerms: "Payment is due within 30 days of invoice date. Late payments may incur a 1.5% monthly service charge. Please reference the invoice number when making payment.",
                  invoiceFooter: "Thank you for your business! For questions about this invoice, contact us at billing@urutiiq.com",
                  showLogo: true,
                  showWebsite: true,
                  showAddress: true,
                  showQRCode: true,
                  showBarcode: true
                }}
                onDownloadPDF={async () => {
                  try {
                    const blob = await apiService.getInvoicePdf(detailsInvoice.id)
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `${detailsInvoice.invoiceNumber || 'invoice'}.pdf`
                    a.click()
                    setTimeout(() => URL.revokeObjectURL(url), 30000)
                  } catch (e: any) {
                    console.error('PDF download error:', e)
                    // The InvoiceTemplate will handle PDF generation as fallback
                  }
                }}
                onPrint={() => {
                  window.print()
                }}
                onPaymentSuccess={() => {
                  qc.invalidateQueries({ queryKey: ["invoices"] })
                  setDetailsInvoice(prev => prev ? { ...prev, status: 'paid', balanceDue: 0 } : prev)
                }}
                onPaymentError={(error: any) => {
                  console.error('Payment error:', error)
                }}
              />
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRecurring ? 'Edit Recurring Invoice' : 'Create Recurring Invoice'}</DialogTitle>
            <DialogDescription>
              Set up a recurring invoice template that will automatically generate invoices on schedule.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Recurring Invoice Form */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Name</Label>
                <Input
                  value={recurringForm.name}
                  onChange={(e) => setRecurringForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Monthly Subscription"
                />
              </div>
              <div>
                <Label>Customer</Label>
                <Select value={recurringForm.customerId} onValueChange={(value) => setRecurringForm(prev => ({ ...prev, customerId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Frequency</Label>
                <Select value={recurringForm.frequency} onValueChange={(value: any) => setRecurringForm(prev => ({ ...prev, frequency: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Interval</Label>
                <Input
                  type="number"
                  min="1"
                  value={recurringForm.interval}
                  onChange={(e) => setRecurringForm(prev => ({ ...prev, interval: parseInt(e.target.value) || 1 }))}
                />
              </div>
              <div>
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={recurringForm.startDate}
                  onChange={(e) => setRecurringForm(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label>Description</Label>
              <textarea 
                className="w-full border rounded px-3 py-2 h-20"
                value={recurringForm.description || ''}
                onChange={(e) => setRecurringForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Recurring invoice description"
              />
            </div>

            {/* Line Items */}
            <div className="space-y-3">
              <Label>Line Items</Label>
              {recurringForm.lines.map((line, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-5">
                    <Input 
                      placeholder="Description" 
                      value={line.description} 
                      onChange={(e) => {
                        const lines = [...recurringForm.lines]
                        lines[idx].description = e.target.value
                        setRecurringForm(prev => ({ ...prev, lines, ...recalcRecurringTotals(lines) }))
                      }} 
                    />
                  </div>
                  <div className="col-span-2">
                    <Input 
                      type="number" 
                      placeholder="Qty" 
                      value={line.quantity} 
                      onChange={(e) => {
                        const lines = [...recurringForm.lines]
                        lines[idx].quantity = parseFloat(e.target.value) || 0
                        setRecurringForm(prev => ({ ...prev, lines, ...recalcRecurringTotals(lines) }))
                      }} 
                    />
                  </div>
                  <div className="col-span-2">
                    <Input 
                      type="number" 
                      placeholder="Price" 
                      value={line.unitPrice} 
                      onChange={(e) => {
                        const lines = [...recurringForm.lines]
                        lines[idx].unitPrice = parseFloat(e.target.value) || 0
                        setRecurringForm(prev => ({ ...prev, lines, ...recalcRecurringTotals(lines) }))
                      }} 
                    />
                  </div>
                  <div className="col-span-2">
                    <Input 
                      type="number" 
                      placeholder="Tax %" 
                      value={line.taxRate} 
                      onChange={(e) => {
                        const lines = [...recurringForm.lines]
                        lines[idx].taxRate = parseFloat(e.target.value) || 0
                        setRecurringForm(prev => ({ ...prev, lines, ...recalcRecurringTotals(lines) }))
                      }} 
                    />
                  </div>
                  <div className="col-span-1">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        const lines = [...recurringForm.lines]
                        lines.splice(idx, 1)
                        setRecurringForm(prev => ({ ...prev, lines, ...recalcRecurringTotals(lines) }))
                      }}
                    >
                      ×
                    </Button>
                  </div>
                </div>
              ))}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  const lines = [...recurringForm.lines, { description: "", quantity: 1, unitPrice: 0, taxRate: 0 }]
                  setRecurringForm(prev => ({ ...prev, lines, ...recalcRecurringTotals(lines) }))
                }}
              >
                Add Line Item
              </Button>
            </div>

            {/* Totals */}
            <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>{formatCurrency(recurringForm.subtotal, recurringForm.currency)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax:</span>
                <span>{formatCurrency(recurringForm.taxTotal, recurringForm.currency)}</span>
              </div>
              <div className="flex justify-between font-semibold border-t pt-2">
                <span>Total:</span>
                <span>{formatCurrency(recurringForm.totalAmount, recurringForm.currency)}</span>
              </div>
            </div>

            {/* Notes & Terms */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Notes</Label>
                <textarea 
                  className="w-full border rounded px-3 py-2 h-20"
                  value={recurringForm.notes || ''}
                  onChange={(e) => setRecurringForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Optional notes"
                />
              </div>
              <div>
                <Label>Terms</Label>
                <textarea 
                  className="w-full border rounded px-3 py-2 h-20"
                  value={recurringForm.terms || ''}
                  onChange={(e) => setRecurringForm(prev => ({ ...prev, terms: e.target.value }))}
                  placeholder="Payment terms"
                />
              </div>
            </div>

            {recurringError && (
              <div className="text-red-600 text-sm">{recurringError}</div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRecurringDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              disabled={recurringSaving || !recurringForm.name || !recurringForm.customerId}
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
                  setRecurringError(error?.message || 'Failed to save recurring invoice')
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
    </PageLayout>
  )
}
