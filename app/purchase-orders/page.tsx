'use client'

// @ts-ignore - Suppressing import and type errors for UI components that are working
import { useState, useMemo, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useDemoAuth } from '@/hooks/useDemoAuth'
import apiService from '@/lib/api'
import { PageLayout } from '@/components/page-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, Plus, Search, Filter, Eye, Edit, Trash2, CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { useForm, ControllerRenderProps } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'

// Field type for form renders
type FormFieldRender = { field: any } // Simplified for now to avoid TS complexity

// Types
interface PurchaseOrder {
  id: string
  poNumber: string
  orderDate: string
  expectedDelivery?: string
  status: 'draft' | 'sent' | 'approved' | 'received' | 'closed' | 'cancelled'
  totalAmount: number
  currency: string
  purchaseType: 'local' | 'import'
  vendor: { id: string; name: string }
  company: { id: string; name: string }
  lines: PurchaseOrderLine[]
  receipts: Receipt[]
  importShipments: ImportShipment[]
  createdAt: string
  updatedAt: string
}

interface PurchaseOrderLine {
  id: string
  description: string
  quantity: number
  unitPrice: number
  taxRate: number
  lineTotal: number
  receivedQuantity: number
  product?: { id: string; name: string }
}

interface Receipt {
  id: string
  receiptNumber: string
  receivedDate: string
  partialReceipt: boolean
  items: ReceiptItem[]
}

interface ReceiptItem {
  id: string
  quantityReceived: number
  quantityAccepted: number
  quantityRejected: number
  rejectionReason?: string
}

interface ImportShipment {
  id: string
  shipmentNumber: string
  status: 'pending' | 'in_transit' | 'arrived' | 'cleared' | 'delivered'
  shipmentDate: string
  expectedArrival?: string
  carrier?: string
  trackingNumber?: string
}

interface Vendor {
  id: string
  name: string
  email: string
  phone?: string
}

interface Product {
  id: string
  name: string
  sku: string
  price: number
}

// Validation schemas
const purchaseOrderSchema = z.object({
  companyId: z.string().min(1, 'Company is required'),
  vendorId: z.string().min(1, 'Vendor is required'),
  poNumber: z.string().min(1, 'PO Number is required'),
  orderDate: z.string().min(1, 'Order Date is required'),
  expectedDelivery: z.string().optional(),
  currency: z.string().default('USD'),
  notes: z.string().optional(),
  terms: z.string().optional(),
  purchaseType: z.enum(['local', 'import']).default('local'),
  vendorCurrency: z.string().optional(),
  exchangeRate: z.number().positive().optional(),
  freightCost: z.number().nonnegative().default(0),
  customsDuty: z.number().nonnegative().default(0),
  otherImportCosts: z.number().nonnegative().default(0),
  incoterms: z.string().optional(),
  shippingMethod: z.string().optional(),
  originCountry: z.string().optional(),
  destinationCountry: z.string().optional(),
  portOfEntry: z.string().optional(),
  lines: z.array(z.object({
    productId: z.string().optional(),
    description: z.string().min(1, 'Description is required'),
    quantity: z.number().positive('Quantity must be positive'),
    unitPrice: z.number().positive('Unit price must be positive'),
    taxRate: z.number().nonnegative().default(0)
  })).min(1, 'At least one line item is required')
})

export default function PurchaseOrdersPage() {
  const { ready: authReady } = useDemoAuth('purchase-orders-page')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [companyFilter, setCompanyFilter] = useState<string>('all')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isReceiveDialogOpen, setIsReceiveDialogOpen] = useState(false)
  const [receiveNotes, setReceiveNotes] = useState('')
  const [receiveQuantities, setReceiveQuantities] = useState<Record<string, number>>({})
  const [isMatchBillDialogOpen, setIsMatchBillDialogOpen] = useState(false)
  const [matchBillId, setMatchBillId] = useState('')
  const [lastMatchResult, setLastMatchResult] = useState<any>(null)
  const [vendorBills, setVendorBills] = useState<any[]>([])
  const [loadingBills, setLoadingBills] = useState(false)
  const [didOpenPrefill, setDidOpenPrefill] = useState(false)
  
  const queryClient = useQueryClient()

  // Load company settings for the selected PO to show effective tolerance in the details dialog
  const { data: poCompanySettings } = useQuery({
    queryKey: ['company-settings', selectedPO?.company?.id],
    enabled: !!selectedPO?.company?.id,
    queryFn: async () => {
      const res = await fetch(`/api/internal/company-settings?companyId=${selectedPO!.company.id}`)
      if (!res.ok) throw new Error('Failed to load company settings')
      return res.json()
    }
  })

  // Fetch data
  const [poPage, setPoPage] = useState(1)
  const [poPageSize, setPoPageSize] = useState(10)
  const { data: purchaseOrders, isLoading } = useQuery({
    queryKey: ['purchase-orders', searchTerm, statusFilter, typeFilter, companyFilter, poPage, poPageSize],
    queryFn: async () => {
      const params = new URLSearchParams()
      
      // Always include company ID - use filter value or default to current company
      const companyId = companyFilter && companyFilter !== 'all' 
        ? companyFilter 
        : (typeof window !== 'undefined' ? localStorage.getItem('company_id') || 'cmgfgiqos0001szdhlotx8vhg' : 'cmgfgiqos0001szdhlotx8vhg')
      params.append('companyId', companyId)
      
      if (searchTerm) params.append('q', searchTerm)
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (typeFilter !== 'all') params.append('purchaseType', typeFilter)
      params.append('page', String(poPage))
      params.append('pageSize', String(poPageSize))
      
      const response = await fetch(`/api/purchase-orders?${params}`)
      if (!response.ok) throw new Error('Failed to fetch purchase orders')
      return response.json()
    }
  })

  const { data: vendors, isLoading: vendorsLoading } = useQuery({
    queryKey: ['vendors'],
    queryFn: async () => {
      const response = await fetch('/api/vendors')
      if (!response.ok) throw new Error('Failed to fetch vendors')
      return response.json()
    }
  })

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await fetch('/api/products')
      if (!response.ok) throw new Error('Failed to fetch products')
      return response.json()
    }
  })

  const { data: companies, isLoading: companiesLoading } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const res = await apiService.getCompanies()
      return res.data
    },
    enabled: authReady
  })

  // UI state for Tabs and line items view
  const [currentTab, setCurrentTab] = useState<'basic'|'import'|'lines'>('basic')
  const [linesView, setLinesView] = useState<'cards'|'table'>('cards')
  
  // Generate PO number helper
  const generatePONumber = () => {
    const now = new Date()
    const timestamp = now.getFullYear().toString() + 
      (now.getMonth() + 1).toString().padStart(2, '0') + 
      now.getDate().toString().padStart(2, '0') + '-' +
      now.getHours().toString().padStart(2, '0') + 
      now.getMinutes().toString().padStart(2, '0')
    return `PO-${timestamp}`
  }
  
  // Get today's date
  const getTodayDate = () => {
    const now = new Date()
    return now.getFullYear() + '-' + 
      (now.getMonth() + 1).toString().padStart(2, '0') + '-' + 
      now.getDate().toString().padStart(2, '0')
  }

  const [tolerancePct, setTolerancePct] = useState<number>(2)
  const [toleranceAbs, setToleranceAbs] = useState<number>(5)
  useEffect(() => {
    try {
      const key = `poTolerance:${companyFilter || 'all'}`
      const saved = JSON.parse(localStorage.getItem(key) || 'null')
      if (saved && typeof saved.pct === 'number' && typeof saved.abs === 'number') {
        setTolerancePct(saved.pct)
        setToleranceAbs(saved.abs)
      }
    } catch {}
  }, [companyFilter])
  function saveToleranceDefaults() {
    try { localStorage.setItem(`poTolerance:${companyFilter || 'all'}`, JSON.stringify({ pct: tolerancePct, abs: toleranceAbs })) } catch {}
    toast.success('Tolerance saved for this browser')
  }

  // Load/save company settings via API when a company is selected
  const { data: companySettings } = useQuery({
    queryKey: ['company-settings', companyFilter],
    queryFn: async () => {
      if (!companyFilter || companyFilter === 'all') return null
      const res = await fetch(`/api/internal/company-settings?companyId=${companyFilter}`)
      if (!res.ok) throw new Error('Failed to load company settings')
      return res.json()
    },
    enabled: !!companyFilter && companyFilter !== 'all'
  })

  useEffect(() => {
    if (companySettings?.items) {
      const pct = companySettings.items.find((s: any) => s.key === 'three_way_tolerance_pct')?.value
      const abs = companySettings.items.find((s: any) => s.key === 'three_way_tolerance_abs')?.value
      if (pct !== undefined) setTolerancePct(Number(pct))
      if (abs !== undefined) setToleranceAbs(Number(abs))
    }
  }, [companySettings])

  const saveCompanyTolerance = useMutation({
    mutationFn: async () => {
      if (!companyFilter || companyFilter === 'all') return
      const headers = { 'Content-Type': 'application/json' }
      await fetch('/api/internal/company-settings', { method: 'POST', headers, body: JSON.stringify({ companyId: companyFilter, key: 'three_way_tolerance_pct', value: String(tolerancePct) }) })
      await fetch('/api/internal/company-settings', { method: 'POST', headers, body: JSON.stringify({ companyId: companyFilter, key: 'three_way_tolerance_abs', value: String(toleranceAbs) }) })
    },
    onSuccess: () => toast.success('Company tolerance saved'),
    onError: () => toast.error('Failed to save company tolerance')
  })
  const { data: exceptions } = useQuery({
    queryKey: ['po-match-exceptions', tolerancePct, toleranceAbs, companyFilter],
    queryFn: async () => {
      const params = new URLSearchParams()
      params.append('tolerancePct', String(tolerancePct))
      params.append('toleranceAbs', String(toleranceAbs))
      if (companyFilter && companyFilter !== 'all') params.append('companyId', companyFilter)
      const res = await fetch('/api/purchase-orders/match-exceptions?' + params.toString())
      if (!res.ok) throw new Error('Failed to fetch exceptions')
      return res.json()
    }
  })

  const resolveException = useMutation({
    mutationFn: async (poId: string) => {
      const res = await fetch(`/api/purchase-orders/${poId}/resolve-exception`, { method: 'POST' })
      if (!res.ok) throw new Error('Failed to resolve exception')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['po-match-exceptions'] })
      toast.success('Exception resolved')
    },
    onError: () => toast.error('Failed to resolve exception')
  })

  const [selectedExceptionIds, setSelectedExceptionIds] = useState<string[]>([])
  const toggleException = (id: string) => {
    setSelectedExceptionIds((prev) => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }
  const bulkResolve = async () => {
    for (const id of selectedExceptionIds) {
      try { await resolveException.mutateAsync(id) } catch {}
    }
    setSelectedExceptionIds([])
  }

  const [exceptionVendorFilter, setExceptionVendorFilter] = useState('')
  const [exceptionDateFrom, setExceptionDateFrom] = useState('')
  const [exceptionDateTo, setExceptionDateTo] = useState('')

  const filteredExceptions = useMemo(() => {
    const items = exceptions?.items || []
    return items.filter((ex: any) => {
      const byVendor = exceptionVendorFilter ? (ex.vendor || '').toLowerCase().includes(exceptionVendorFilter.toLowerCase()) : true
      const updated = ex.updatedAt ? new Date(ex.updatedAt) : null
      const fromOk = exceptionDateFrom && updated ? updated >= new Date(exceptionDateFrom) : true
      const toOk = exceptionDateTo && updated ? updated <= new Date(exceptionDateTo) : true
      return byVendor && fromOk && toOk
    })
  }, [exceptions, exceptionVendorFilter, exceptionDateFrom, exceptionDateTo])

  const [exceptionsPage, setExceptionsPage] = useState(1)
  const [exceptionsPageSize, setExceptionsPageSize] = useState(10)
  const pagedExceptions = useMemo(() => {
    const start = (exceptionsPage - 1) * exceptionsPageSize
    return filteredExceptions.slice(start, start + exceptionsPageSize)
  }, [filteredExceptions, exceptionsPage, exceptionsPageSize])
  const exceptionsTotalPages = Math.max(1, Math.ceil((filteredExceptions.length || 1) / exceptionsPageSize))
  const resetExceptionsPaging = () => setExceptionsPage(1)
  useEffect(() => { resetExceptionsPaging() }, [exceptionVendorFilter, exceptionDateFrom, exceptionDateTo])

  const [viewException, setViewException] = useState<any>(null)
  const [editApprovalsOpen, setEditApprovalsOpen] = useState(false)
  const [approvalReasons, setApprovalReasons] = useState<string[]>([])
  const [selectedReasons, setSelectedReasons] = useState<Record<string,string>>({})
  const [newReason, setNewReason] = useState('')
  const [tiers, setTiers] = useState<Array<{ amountGt: number; roles: string }>>([{ amountGt: 10000, roles: 'admin' }])
  const { data: exceptionPo } = useQuery({
    queryKey: ['po-by-id', viewException?.id],
    queryFn: async () => {
      if (!viewException?.id) return null
      const res = await fetch(`/api/purchase-orders/${viewException.id}`)
      if (!res.ok) throw new Error('Failed to fetch PO')
      return res.json()
    },
    enabled: !!viewException?.id
  })

  useEffect(() => {
    (async () => {
      try {
        const API = process.env.NEXT_PUBLIC_API_URL || ''
        const companyId = companyFilter && companyFilter !== 'all' ? companyFilter : (companies?.data?.[0]?.id || companies?.items?.[0]?.id)
        if (!companyId) return
        const res = await fetch(`${API}/api/three-way-match/${companyId}/approvals`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')||''}`, 'x-tenant-id': localStorage.getItem('tenant_id')||'tenant_demo' } })
        const data = await res.json()
        setApprovalReasons(data?.reasons || [])
      } catch {}
    })()
  }, [companyFilter, companies])

  function exportExceptionsCsv() {
    const rows = [
      ['PO','Vendor','PO Total','Bill Total','Diff','Pct Diff','Updated'],
      ...filteredExceptions.map((ex: any) => [
        ex.poNumber,
        ex.vendor || '',
        ex.poTotal,
        ex.billTotal,
        ex.diff,
        ex.pctDiff,
        ex.updatedAt || ''
      ])
    ]
    const csv = rows.map(r => r.map((v: any) => (`${v}`).replaceAll('"','""')).map((v: any) => /[,\n\r]/.test(v) ? `"${v}"` : v).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'po-match-exceptions.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  // Mutations
  const createPurchaseOrder = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/purchase-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!response.ok) throw new Error('Failed to create purchase order')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] })
      setIsCreateDialogOpen(false)
      toast.success('Purchase order created successfully')
    },
    onError: (error) => {
      toast.error('Failed to create purchase order')
    }
  })

  const updatePurchaseOrderStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await fetch(`/api/purchase-orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      if (!response.ok) throw new Error('Failed to update purchase order')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] })
      toast.success('Purchase order status updated')
    },
    onError: (error) => {
      toast.error('Failed to update purchase order status')
    }
  })

  // Form setup
  const form = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
    resolver: zodResolver(purchaseOrderSchema),
    defaultValues: {
      companyId: typeof window !== 'undefined' ? (localStorage.getItem('company_id') || '') : '',
      poNumber: generatePONumber(),
      orderDate: getTodayDate(),
      currency: 'USD',
      purchaseType: 'local' as const,
      freightCost: 0,
      customsDuty: 0,
      otherImportCosts: 0,
      lines: [{ description: '', quantity: 1, unitPrice: 0, taxRate: 0 }]
    }
  })

  const purchaseType = form.watch('purchaseType')

  // Computed values
  const filteredPOs = useMemo(() => {
    if (!purchaseOrders?.items) return []
    return purchaseOrders.items
  }, [purchaseOrders])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'sent': return 'bg-blue-100 text-blue-800'
      case 'approved': return 'bg-green-100 text-green-800'
      case 'received': return 'bg-purple-100 text-purple-800'
      case 'closed': return 'bg-gray-100 text-gray-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4" />
      case 'cancelled': return <XCircle className="w-4 h-4" />
      default: return <AlertCircle className="w-4 h-4" />
    }
  }

  const onSubmit = (data: any) => {
    createPurchaseOrder.mutate(data)
  }

  const handleStatusUpdate = (poId: string, newStatus: string) => {
    updatePurchaseOrderStatus.mutate({ id: poId, status: newStatus })
  }

  const handleViewPO = (po: PurchaseOrder) => {
    setSelectedPO(po)
    setIsViewDialogOpen(true)
  }

  const openReceiveDialog = (po: PurchaseOrder) => {
    setSelectedPO(po)
    const initial: Record<string, number> = {}
    po.lines.forEach((l) => {
      const remaining = Math.max(0, (l.quantity || 0) - (l.receivedQuantity || 0))
      initial[l.id] = remaining
    })
    setReceiveQuantities(initial)
    setReceiveNotes('')
    setIsReceiveDialogOpen(true)
  }

  const submitReceiveGoods = async () => {
    if (!selectedPO) return
    const API = process.env.NEXT_PUBLIC_API_URL || ''
    const lines = Object.entries(receiveQuantities)
      .filter(([, qty]) => (qty || 0) > 0)
      .map(([lineId, qty]) => ({ lineId, quantityReceived: Number(qty) }))
    try {
      const res = await fetch(`${API}/api/three-way-match/${selectedPO.id}/receive`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
          'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo'
        },
        body: JSON.stringify({ lines, notes: receiveNotes })
      })
      await res.json()
      setIsReceiveDialogOpen(false)
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] })
      toast.success('Goods received')
    } catch {
      toast.error('Failed to receive goods')
    }
  }

  async function loadVendorBills(po: PurchaseOrder) {
    try {
      setLoadingBills(true)
      const API = process.env.NEXT_PUBLIC_API_URL || ''
      const url = `${API}/api/vendor-bills?companyId=${encodeURIComponent(po.company.id)}&vendorId=${encodeURIComponent(po.vendor.id)}&status=pending&limit=25`
      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
          'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo'
        }
      })
      if (res.ok) {
        const data = await res.json()
        const items = (data?.items || data?.data || []).slice(0, 25)
        setVendorBills(items)
      }
    } catch {}
    finally { setLoadingBills(false) }
  }

  const openMatchBillDialog = (po: PurchaseOrder) => {
    setSelectedPO(po)
    setMatchBillId('')
    setVendorBills([])
    loadVendorBills(po)
    setIsMatchBillDialogOpen(true)
  }

  // URL search params for prefilling (Vite approach)
  const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
  const prefillBillId = urlParams?.get('prefillBillId') || ''
  const prefillCompanyId = urlParams?.get('companyId') || ''
  const prefillVendorId = urlParams?.get('vendorId') || ''

  useEffect(() => {
    if (!didOpenPrefill && prefillBillId && purchaseOrders?.items?.length) {
      // If company/vendor provided, prefer a PO matching them; else fall back to first
      let po = purchaseOrders.items[0]
      if (prefillCompanyId || prefillVendorId) {
        const match = purchaseOrders.items.find((p: any) => (
          (!prefillCompanyId || p.company?.id === prefillCompanyId) &&
          (!prefillVendorId || p.vendor?.id === prefillVendorId)
        ))
        if (match) po = match
        // Optionally align filters to improve UX
        if (prefillCompanyId) setCompanyFilter(prefillCompanyId)
      }
      setSelectedPO(po)
      setMatchBillId(prefillBillId)
      setVendorBills([])
      loadVendorBills(po)
      setIsMatchBillDialogOpen(true)
      setDidOpenPrefill(true)
    }
  }, [didOpenPrefill, prefillBillId, prefillCompanyId, prefillVendorId, purchaseOrders])

  const submitMatchBill = async () => {
    if (!selectedPO || !matchBillId) return
    const API = process.env.NEXT_PUBLIC_API_URL || ''
    try {
      const res = await fetch(`${API}/api/three-way-match/${selectedPO.id}/match/${matchBillId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
          'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo'
        }
      })
      const data = await res.json()
      setLastMatchResult(data)
      setIsMatchBillDialogOpen(false)
      setIsViewDialogOpen(true)
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] })
      toast.success('Bill matched')
    } catch {
      toast.error('Failed to match bill')
    }
  }

  return (
    <PageLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Purchase Orders</h1>
            <p className="text-gray-600 mt-1">Manage local and import purchase orders</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Purchase Order
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Purchase Order</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Progress indicator + controlled tabs */}
                  <div className="mb-4">
                    <div className="flex items-center space-x-2 text-sm">
                      <div className={`px-3 py-1 rounded-full ${currentTab === 'basic' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>1. Basic</div>
                      <div className={`px-3 py-1 rounded-full ${currentTab === 'import' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>2. Import</div>
                      <div className={`px-3 py-1 rounded-full ${currentTab === 'lines' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>3. Lines</div>
                      <div className="ml-auto text-xs text-gray-500">Step {currentTab === 'basic' ? 1 : currentTab === 'import' ? 2 : 3} of 3</div>
                    </div>
                  </div>

                  <Tabs value={currentTab} onValueChange={(v: any) => setCurrentTab(v as 'basic'|'import'|'lines')} className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="basic">Basic Info</TabsTrigger>
                      <TabsTrigger value="import">Import Details</TabsTrigger>
                      <TabsTrigger value="lines">Line Items</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="basic" className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="companyId"
                          render={({ field }: FormFieldRender) => (
                            <FormItem>
                              <FormLabel>Company</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={companiesLoading}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select company" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {companiesLoading ? (
                                    <div className="p-2 flex items-center justify-center"><Loader2 className="animate-spin w-5 h-5" /></div>
                                  ) : (
                                    companies?.items?.map((company: any) => (
                                    <SelectItem key={company.id} value={company.id}>
                                      {company.name}
                                    </SelectItem>
                                    ))
                                  )}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="vendorId"
                          render={({ field }: FormFieldRender) => (
                            <FormItem>
                              <FormLabel>Vendor</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={vendorsLoading}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select vendor" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {vendorsLoading ? (
                                    <div className="p-2 flex items-center justify-center"><Loader2 className="animate-spin w-5 h-5" /></div>
                                  ) : (
                                    vendors?.items?.map((vendor: any) => (
                                    <SelectItem key={vendor.id} value={vendor.id}>
                                      {vendor.name}
                                    </SelectItem>
                                    ))
                                  )}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="poNumber"
                          render={({ field }: any) => (
                            <FormItem>
                              <FormLabel>PO Number</FormLabel>
                              <FormControl>
                                <Input placeholder="PO-2024-001" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="orderDate"
                          render={({ field }: any) => (
                            <FormItem>
                              <FormLabel>Order Date</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="expectedDelivery"
                          render={({ field }: any) => (
                            <FormItem>
                              <FormLabel>Expected Delivery</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="currency"
                          render={({ field }: any) => (
                            <FormItem>
                              <FormLabel>Currency</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="USD">USD</SelectItem>
                                  <SelectItem value="EUR">EUR</SelectItem>
                                  <SelectItem value="GBP">GBP</SelectItem>
                                  <SelectItem value="CAD">CAD</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="purchaseType"
                          render={({ field }: any) => (
                            <FormItem>
                              <FormLabel>Purchase Type</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="local">Local Purchase</SelectItem>
                                  <SelectItem value="import">Import Purchase</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="notes"
                          render={({ field }: any) => (
                            <FormItem>
                              <FormLabel>Notes</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Additional notes..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="terms"
                          render={({ field }: any) => (
                            <FormItem>
                              <FormLabel>Terms & Conditions</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Payment terms, delivery terms..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="import" className="space-y-4">
                      {purchaseType === 'import' && (
                        <>
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="vendorCurrency"
                              render={({ field }: any) => (
                                <FormItem>
                                  <FormLabel>Vendor Currency</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select currency" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="USD">USD</SelectItem>
                                      <SelectItem value="EUR">EUR</SelectItem>
                                      <SelectItem value="GBP">GBP</SelectItem>
                                      <SelectItem value="CNY">CNY</SelectItem>
                                      <SelectItem value="JPY">JPY</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="exchangeRate"
                              render={({ field }: any) => (
                                <FormItem>
                                  <FormLabel>Exchange Rate</FormLabel>
                                  <FormControl>
                                    <Input type="number" step="0.01" placeholder="1.00" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="freightCost"
                              render={({ field }: any) => (
                                <FormItem>
                                  <FormLabel>Freight Cost</FormLabel>
                                  <FormControl>
                                    <Input type="number" step="0.01" placeholder="0.00" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="customsDuty"
                              render={({ field }: any) => (
                                <FormItem>
                                  <FormLabel>Customs Duty</FormLabel>
                                  <FormControl>
                                    <Input type="number" step="0.01" placeholder="0.00" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="otherImportCosts"
                              render={({ field }: any) => (
                                <FormItem>
                                  <FormLabel>Other Import Costs</FormLabel>
                                  <FormControl>
                                    <Input type="number" step="0.01" placeholder="0.00" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="incoterms"
                              render={({ field }: any) => (
                                <FormItem>
                                  <FormLabel>Incoterms</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select incoterms" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="FOB">FOB</SelectItem>
                                      <SelectItem value="CIF">CIF</SelectItem>
                                      <SelectItem value="EXW">EXW</SelectItem>
                                      <SelectItem value="DDP">DDP</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="shippingMethod"
                              render={({ field }: any) => (
                                <FormItem>
                                  <FormLabel>Shipping Method</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select method" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="sea">Sea Freight</SelectItem>
                                      <SelectItem value="air">Air Freight</SelectItem>
                                      <SelectItem value="land">Land Transport</SelectItem>
                                      <SelectItem value="courier">Courier</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="originCountry"
                              render={({ field }: any) => (
                                <FormItem>
                                  <FormLabel>Origin Country</FormLabel>
                                  <FormControl>
                                    <Input placeholder="US" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="destinationCountry"
                              render={({ field }: any) => (
                                <FormItem>
                                  <FormLabel>Destination Country</FormLabel>
                                  <FormControl>
                                    <Input placeholder="CA" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="portOfEntry"
                              render={({ field }: any) => (
                                <FormItem>
                                  <FormLabel>Port of Entry</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Vancouver" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="lines" className="space-y-4">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-700">Line items provide the products or services being ordered.</div>
                            <div className="flex items-center space-x-2">
                              <Button size="sm" variant="ghost" onClick={() => setLinesView(linesView === 'cards' ? 'table' : 'cards')}>
                                {linesView === 'cards' ? 'Table view' : 'Card view'}
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                  const lines = form.getValues('lines')
                                  lines.push({ description: '', quantity: 1, unitPrice: 0, taxRate: 0 })
                                  form.setValue('lines', lines)
                                }}
                              >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Line Item
                              </Button>
                            </div>
                          </div>

                          {linesView === 'table' ? (
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Description</TableHead>
                                  <TableHead className="w-24">Qty</TableHead>
                                  <TableHead className="w-32">Unit Price</TableHead>
                                  <TableHead className="w-24">Tax %</TableHead>
                                  <TableHead className="w-32">Line Total</TableHead>
                                  <TableHead className="w-24">Actions</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {form.watch('lines').map((line: any, index: number) => {
                                  const qty = Number(line.quantity || 0)
                                  const price = Number(line.unitPrice || 0)
                                  const tax = Number(line.taxRate || 0)
                                  const total = qty * price * (1 + tax / 100)
                                  return (
                                    <TableRow key={index}>
                                      <TableCell>
                                        <FormField control={form.control} name={`lines.${index}.description`} render={({ field }: any) => (
                                          <FormItem>
                                            <FormControl>
                                              <Input placeholder="Description" {...field} />
                                            </FormControl>
                                          </FormItem>
                                        )} />
                                      </TableCell>
                                      <TableCell>
                                        <FormField control={form.control} name={`lines.${index}.quantity`} render={({ field }: any) => (
                                          <FormItem>
                                            <FormControl>
                                              <Input type="number" min="1" {...field} />
                                            </FormControl>
                                          </FormItem>
                                        )} />
                                      </TableCell>
                                      <TableCell>
                                        <FormField control={form.control} name={`lines.${index}.unitPrice`} render={({ field }: any) => (
                                          <FormItem>
                                            <FormControl>
                                              <Input type="number" step="0.01" min="0" {...field} />
                                            </FormControl>
                                          </FormItem>
                                        )} />
                                      </TableCell>
                                      <TableCell>
                                        <FormField control={form.control} name={`lines.${index}.taxRate`} render={({ field }: any) => (
                                          <FormItem>
                                            <FormControl>
                                              <Input type="number" step="0.1" min="0" {...field} />
                                            </FormControl>
                                          </FormItem>
                                        )} />
                                      </TableCell>
                                      <TableCell>${total.toFixed(2)}</TableCell>
                                      <TableCell>
                                        <div className="flex space-x-2">
                                          <Button size="sm" variant="ghost" onClick={() => {
                                            const lines = form.getValues('lines')
                                            lines.splice(index, 1)
                                            form.setValue('lines', lines)
                                          }}>Remove</Button>
                                        </div>
                                      </TableCell>
                                    </TableRow>
                                  )
                                })}
                              </TableBody>
                            </Table>
                          ) : (
                            <div className="space-y-4">
                              {form.watch('lines').map((line, index) => (
                                <div key={index} className="border rounded-lg p-4 space-y-4">
                                  <div className="flex items-center justify-between">
                                    <h4 className="font-medium">Line Item {index + 1}</h4>
                                    {index > 0 && (
                                      <Button type="button" variant="outline" size="sm" onClick={() => {
                                        const lines = form.getValues('lines')
                                        lines.splice(index, 1)
                                        form.setValue('lines', lines)
                                      }}>Remove</Button>
                                    )}
                                  </div>

                                  <div className="grid grid-cols-2 gap-4">
                                    <FormField control={form.control} name={`lines.${index}.productId`} render={({ field }: any) => (
                                      <FormItem>
                                        <FormLabel>Product (Optional)</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={productsLoading}>
                                          <FormControl>
                                            <SelectTrigger>
                                              <SelectValue placeholder="Select product" />
                                            </SelectTrigger>
                                          </FormControl>
                                          <SelectContent>
                                            {productsLoading ? (
                                              <div className="p-2 flex items-center justify-center"><Loader2 className="animate-spin w-5 h-5" /></div>
                                            ) : (
                                              products?.items?.map((product: any) => (
                                                <SelectItem key={product.id} value={product.id}>{product.name}</SelectItem>
                                              ))
                                            )}
                                          </SelectContent>
                                        </Select>
                                      </FormItem>
                                    )} />

                                    <FormField control={form.control} name={`lines.${index}.description`} render={({ field }: any) => (
                                      <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                          <Input placeholder="Item description" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )} />

                                    <FormField control={form.control} name={`lines.${index}.quantity`} render={({ field }: any) => (
                                      <FormItem>
                                        <FormLabel>Quantity</FormLabel>
                                        <FormControl>
                                          <Input type="number" min="1" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )} />

                                    <FormField control={form.control} name={`lines.${index}.unitPrice`} render={({ field }: any) => (
                                      <FormItem>
                                        <FormLabel>Unit Price</FormLabel>
                                        <FormControl>
                                          <Input type="number" step="0.01" min="0" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )} />

                                    <FormField control={form.control} name={`lines.${index}.taxRate`} render={({ field }: any) => (
                                      <FormItem>
                                        <FormLabel>Tax Rate (%)</FormLabel>
                                        <FormControl>
                                          <Input type="number" step="0.1" min="0" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )} />
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                    </TabsContent>
                  </Tabs>
                  
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createPurchaseOrder.isPending}>
                      {createPurchaseOrder.isPending ? 'Creating...' : 'Create Purchase Order'}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search purchase orders..."
                    value={searchTerm}
                    onChange={(e: any) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={companyFilter} onValueChange={setCompanyFilter}>
                <SelectTrigger className="w-56">
                  <SelectValue placeholder="All Companies" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Companies</SelectItem>
                  {(companies?.data || companies?.items || []).map((c: any) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="received">Received</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="local">Local Purchase</SelectItem>
                  <SelectItem value="import">Import Purchase</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tabs: List and Exceptions */}
        <Card>
          <CardHeader>
            <CardTitle>Purchase Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="list">
              <TabsList>
                <TabsTrigger value="list">List</TabsTrigger>
                <TabsTrigger value="exceptions">Match Exceptions{exceptions?.items?.length ? ` (${exceptions.items.length})` : ''}</TabsTrigger>
              </TabsList>
              <TabsContent value="list">
              {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>PO Number</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Order Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPOs.map((po: PurchaseOrder) => (
                    <TableRow key={po.id}>
                      <TableCell className="font-medium">{po.poNumber}</TableCell>
                      <TableCell>{po.vendor.name}</TableCell>
                      <TableCell>{format(new Date(po.orderDate), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>
                        <Badge variant={po.purchaseType === 'import' ? 'default' : 'secondary'}>
                          {po.purchaseType === 'import' ? 'Import' : 'Local'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(po.status)}>
                          {getStatusIcon(po.status)}
                          <span className="ml-1">{po.status}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: po.currency
                        }).format(po.totalAmount)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewPO(po)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => openReceiveDialog(po)}>Receive Goods</Button>
                          <Button variant="outline" size="sm" onClick={() => openMatchBillDialog(po)}>Match Bill</Button>
                          <Button variant="outline" size="sm" onClick={async ()=>{
                            const API = process.env.NEXT_PUBLIC_API_URL || ''
                            const res = await fetch(`${API}/api/three-way-match/${po.id}/audit`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')||''}`, 'x-tenant-id': localStorage.getItem('tenant_id')||'tenant_demo' } })
                            const data = await res.json()
                            alert(JSON.stringify(data, null, 2))
                          }}>Audit</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
              {!isLoading && (
                <div className="flex items-center justify-between mt-3">
                  <div className="text-xs text-gray-600">
                    Page {purchaseOrders?.page || poPage} of {purchaseOrders?.totalPages || 1} • {purchaseOrders?.total || filteredPOs.length} items
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setPoPage((p) => Math.max(1, p-1))} disabled={(purchaseOrders?.page || poPage) === 1}>Prev</Button>
                    <Button variant="outline" size="sm" onClick={() => setPoPage((p) => Math.min((purchaseOrders?.totalPages || 1), p+1))} disabled={(purchaseOrders?.page || poPage) >= (purchaseOrders?.totalPages || 1)}>Next</Button>
                    <Select value={String(poPageSize)} onValueChange={(v: any) => { setPoPageSize(Number(v)); setPoPage(1) }}>
                      <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10 / page</SelectItem>
                        <SelectItem value="25">25 / page</SelectItem>
                        <SelectItem value="50">50 / page</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
              </TabsContent>
              <TabsContent value="exceptions">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Input type="number" step="0.1" value={tolerancePct} onChange={(e: any) => setTolerancePct(Number(e.target.value || 0))} className="w-28" />
                    <span className="text-sm text-gray-500">% tolerance</span>
                    <Input type="number" step="0.01" value={toleranceAbs} onChange={(e: any) => setToleranceAbs(Number(e.target.value || 0))} className="w-28" />
                    <span className="text-sm text-gray-500">$ tolerance</span>
                    <Button variant="outline" size="sm" onClick={saveToleranceDefaults}>Save default</Button>
                    <Button variant="outline" size="sm" disabled={!companyFilter || companyFilter === 'all' || saveCompanyTolerance.isPending} onClick={() => saveCompanyTolerance.mutate()}>
                      {saveCompanyTolerance.isPending ? 'Saving…' : 'Save company'}
                    </Button>
                    <Input placeholder="Filter vendor" value={exceptionVendorFilter} onChange={(e: any) => setExceptionVendorFilter(e.target.value)} className="w-56" />
                    <Input type="date" value={exceptionDateFrom} onChange={(e: any) => setExceptionDateFrom(e.target.value)} />
                    <span className="text-sm text-gray-500">to</span>
                    <Input type="date" value={exceptionDateTo} onChange={(e: any) => setExceptionDateTo(e.target.value)} />
                  </div>
                  <div className="flex items-center gap-2">
                    {companyFilter && companyFilter !== 'all' && (
                      <div className="text-xs text-gray-500 mr-2">
                        Effective tolerance: Local {tolerancePct}%/${toleranceAbs} • Import {companySettings?.items ? (companySettings.items.find((s: any)=>s.key==='three_way_tolerance_pct_import')?.value ?? tolerancePct) : tolerancePct}%/{companySettings?.items ? (companySettings.items.find((s: any)=>s.key==='three_way_tolerance_abs_import')?.value ?? toleranceAbs) : toleranceAbs}
                      </div>
                    )}
                    <Button variant="outline" onClick={() => { setExceptionVendorFilter(''); setExceptionDateFrom(''); setExceptionDateTo(''); }}>Clear</Button>
                    <Button variant="outline" onClick={exportExceptionsCsv}>Export CSV</Button>
                    <Button variant="outline" onClick={() => setEditApprovalsOpen(true)}>Edit Approvals</Button>
                    <Button variant="outline" disabled={selectedExceptionIds.length === 0 || resolveException.isPending} onClick={bulkResolve}>
                      {resolveException.isPending ? 'Resolving...' : `Resolve Selected (${selectedExceptionIds.length})`}
                    </Button>
                  </div>
                </div>
                {filteredExceptions.length === 0 ? (
                  <div className="text-sm text-gray-500 border rounded-md p-6 text-center">No exceptions found. Adjust filters or check back later.</div>
                ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead></TableHead>
                      <TableHead>PO</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead>PO Total</TableHead>
                      <TableHead>Bill Total</TableHead>
                      <TableHead>Diff</TableHead>
                      <TableHead>% Diff</TableHead>
                      <TableHead>Updated</TableHead>
                      <TableHead>Actions</TableHead>
                      <TableHead>Approval</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pagedExceptions?.map((ex: any) => (
                      <TableRow key={ex.id}>
                        <TableCell>
                          <input type="checkbox" checked={selectedExceptionIds.includes(ex.id)} onChange={() => toggleException(ex.id)} />
                        </TableCell>
                        <TableCell className="font-medium">{ex.poNumber}</TableCell>
                        <TableCell>{ex.vendor}</TableCell>
                        <TableCell>{new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(ex.poTotal)}</TableCell>
                        <TableCell>{new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(ex.billTotal)}</TableCell>
                        <TableCell>{new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(ex.diff)}</TableCell>
                        <TableCell>{ex.pctDiff}%</TableCell>
                        <TableCell>{ex.updatedAt ? new Date(ex.updatedAt).toLocaleString() : ''}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => setViewException(ex)}>View</Button>
                            <Button variant="outline" size="sm" onClick={() => resolveException.mutate(ex.id)} disabled={resolveException.isPending}>
                              {resolveException.isPending ? 'Resolving...' : 'Resolve'}
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Select value={selectedReasons[ex.id] || ''} onValueChange={(v: any)=> setSelectedReasons(prev => ({ ...prev, [ex.id]: v }))}>
                              <SelectTrigger className="w-40"><SelectValue placeholder="Reason" /></SelectTrigger>
                              <SelectContent>
                                {approvalReasons.map((r)=> (<SelectItem key={r} value={r}>{r}</SelectItem>))}
                              </SelectContent>
                            </Select>
                            <Button variant="outline" size="sm" onClick={async ()=>{
                              const reason = selectedReasons[ex.id] || ''
                              const API = process.env.NEXT_PUBLIC_API_URL || ''
                              await fetch(`${API}/api/three-way-match/${ex.id}/approve`, { method:'POST', headers: { 'Content-Type':'application/json','Authorization': `Bearer ${localStorage.getItem('auth_token')||''}`, 'x-tenant-id': localStorage.getItem('tenant_id')||'tenant_demo' }, body: JSON.stringify({ reason }) })
                            }}>Approve</Button>
                            <Button variant="outline" size="sm" onClick={async ()=>{
                              const reason = selectedReasons[ex.id] || ''
                              const API = process.env.NEXT_PUBLIC_API_URL || ''
                              await fetch(`${API}/api/three-way-match/${ex.id}/reject`, { method:'POST', headers: { 'Content-Type':'application/json','Authorization': `Bearer ${localStorage.getItem('auth_token')||''}`, 'x-tenant-id': localStorage.getItem('tenant_id')||'tenant_demo' }, body: JSON.stringify({ reason }) })
                            }}>Reject</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                )}
                {filteredExceptions.length > 0 && (
                  <div className="flex items-center justify-between mt-3">
                    <div className="text-xs text-gray-600">Page {exceptionsPage} of {exceptionsTotalPages} • {filteredExceptions.length} items</div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => setExceptionsPage((p) => Math.max(1, p-1))} disabled={exceptionsPage === 1}>Prev</Button>
                      <Button variant="outline" size="sm" onClick={() => setExceptionsPage((p) => Math.min(exceptionsTotalPages, p+1))} disabled={exceptionsPage === exceptionsTotalPages}>Next</Button>
                      <Select value={String(exceptionsPageSize)} onValueChange={(v: any) => { setExceptionsPageSize(Number(v)); setExceptionsPage(1) }}>
                        <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10">10 / page</SelectItem>
                          <SelectItem value="25">25 / page</SelectItem>
                          <SelectItem value="50">50 / page</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* View Purchase Order Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Purchase Order Details</DialogTitle>
          </DialogHeader>
          {selectedPO && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900">PO Number</h4>
                  <p className="text-gray-600">{selectedPO.poNumber}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Vendor</h4>
                  <p className="text-gray-600">{selectedPO.vendor.name}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Order Date</h4>
                  <p className="text-gray-600">{format(new Date(selectedPO.orderDate), 'MMM dd, yyyy')}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Status</h4>
                  <Badge className={getStatusColor(selectedPO.status)}>
                    {selectedPO.status}
                  </Badge>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Type</h4>
                  <Badge variant={selectedPO.purchaseType === 'import' ? 'default' : 'secondary'}>
                    {selectedPO.purchaseType === 'import' ? 'Import' : 'Local'}
                  </Badge>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Effective Tolerance</h4>
                  <p className="text-gray-600">
                    {(() => {
                      const items = poCompanySettings?.items as any[] | undefined
                      if (!items) return '—'
                      const isImport = selectedPO.purchaseType === 'import'
                      const pctKey = isImport ? 'three_way_tolerance_pct_import' : 'three_way_tolerance_pct_local'
                      const absKey = isImport ? 'three_way_tolerance_abs_import' : 'three_way_tolerance_abs_local'
                      const pctVal = items.find((s: any) => s.key === pctKey)?.value
                      const absVal = items.find((s: any) => s.key === absKey)?.value
                      if (pctVal === undefined || absVal === undefined) return '—'
                      return `${pctVal}% / $${absVal}`
                    })()}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Total Amount</h4>
                  <p className="text-gray-600">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: selectedPO.currency
                    }).format(selectedPO.totalAmount)}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Line Items</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Tax Rate</TableHead>
                      <TableHead>Line Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedPO.lines.map((line) => (
                      <TableRow key={line.id}>
                        <TableCell>{line.description}</TableCell>
                        <TableCell>{line.quantity}</TableCell>
                        <TableCell>
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: selectedPO.currency
                          }).format(line.unitPrice)}
                        </TableCell>
                        <TableCell>{line.taxRate}%</TableCell>
                        <TableCell>
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: selectedPO.currency
                          }).format(line.lineTotal)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {selectedPO.purchaseType === 'import' && selectedPO.importShipments.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Import Shipments</h4>
                  <div className="space-y-2">
                    {selectedPO.importShipments.map((shipment) => (
                      <div key={shipment.id} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{shipment.shipmentNumber}</p>
                            <p className="text-sm text-gray-600">
                              {format(new Date(shipment.shipmentDate), 'MMM dd, yyyy')}
                            </p>
                          </div>
                          <Badge className={getStatusColor(shipment.status)}>
                            {shipment.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedPO.receipts.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Receipts</h4>
                  <div className="space-y-2">
                    {selectedPO.receipts.map((receipt) => (
                      <div key={receipt.id} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{receipt.receiptNumber}</p>
                            <p className="text-sm text-gray-600">
                              {format(new Date(receipt.receivedDate), 'MMM dd, yyyy')}
                            </p>
                          </div>
                          <Badge variant={receipt.partialReceipt ? 'secondary' : 'default'}>
                            {receipt.partialReceipt ? 'Partial' : 'Complete'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {lastMatchResult && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Last 3-Way Match Result</h4>
                  <div className="text-sm text-gray-700 border rounded-lg p-3 bg-gray-50">
                    <pre className="whitespace-pre-wrap break-words text-xs">{JSON.stringify(lastMatchResult, null, 2)}</pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Receive Goods Dialog */}
      <Dialog open={isReceiveDialogOpen} onOpenChange={setIsReceiveDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Receive Goods</DialogTitle>
          </DialogHeader>
          {selectedPO && (
            <div className="space-y-4">
              <div className="text-sm text-gray-600">PO {selectedPO.poNumber} • {selectedPO.vendor.name}</div>
              <div className="space-y-3">
                {selectedPO.lines.map((l) => {
                  const remaining = Math.max(0, (l.quantity || 0) - (l.receivedQuantity || 0))
                  return (
                    <div key={l.id} className="grid grid-cols-3 gap-3 items-center">
                      <div className="col-span-2">
                        <div className="text-sm font-medium text-gray-900">{l.description}</div>
                        <div className="text-xs text-gray-500">Ordered {l.quantity} • Received {l.receivedQuantity} • Remaining {remaining}</div>
                      </div>
                      <Input type="number" min={0} max={remaining} value={receiveQuantities[l.id] ?? 0} onChange={(e: any) => setReceiveQuantities((prev) => ({ ...prev, [l.id]: Number(e.target.value || 0) }))} />
                    </div>
                  )
                })}
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Notes</div>
                <Textarea rows={3} value={receiveNotes} onChange={(e: any) => setReceiveNotes(e.target.value)} />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsReceiveDialogOpen(false)}>Cancel</Button>
                <Button onClick={submitReceiveGoods}>Receive</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Match Bill Dialog */}
      <Dialog open={isMatchBillDialogOpen} onOpenChange={setIsMatchBillDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Match Vendor Bill</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {selectedPO && (
              <div className="text-sm text-gray-600">PO {selectedPO.poNumber} • {selectedPO.vendor.name}</div>
            )}
            {loadingBills ? (
              <div className="text-sm text-gray-500">Loading vendor bills…</div>
            ) : vendorBills.length > 0 ? (
              <div className="space-y-1">
                <div className="text-sm text-gray-700">Select a Vendor Bill</div>
                <Select value={matchBillId} onValueChange={setMatchBillId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a vendor bill" />
                  </SelectTrigger>
                  <SelectContent>
                    {vendorBills.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.billNumber || b.reference || b.id} • {new Intl.NumberFormat('en-US',{style:'currency',currency:b.currency || 'USD'}).format(b.totalAmount || b.amount || 0)} • {b.billDate ? new Date(b.billDate).toLocaleDateString() : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="text-xs text-gray-500">Can't find it? Enter ID manually below.</div>
              </div>
            ) : (
              <div className="text-sm text-gray-500">No vendor bills found. Enter an ID manually.</div>
            )}
            <Input placeholder="Vendor Bill ID" value={matchBillId} onChange={(e: any) => setMatchBillId(e.target.value)} />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsMatchBillDialogOpen(false)}>Cancel</Button>
              <Button disabled={!matchBillId} onClick={submitMatchBill}>Match</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Exception Details Drawer */}
      <Dialog open={!!viewException} onOpenChange={(o: any) => { if (!o) setViewException(null) }}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Match Exception Details</DialogTitle>
          </DialogHeader>
          {viewException && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600">PO Number</div>
                  <div className="font-medium">{viewException.poNumber}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Vendor</div>
                  <div className="font-medium">{viewException.vendor || '—'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">PO Total</div>
                  <div className="font-medium">{new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(viewException.poTotal)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Bill Total</div>
                  <div className="font-medium">{new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(viewException.billTotal)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Difference</div>
                  <div className="font-medium text-red-600">{new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(viewException.diff)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">% Difference</div>
                  <div className="font-medium text-red-600">{viewException.pctDiff}%</div>
                </div>
              </div>

              {exceptionPo && (
                <div className="text-sm text-gray-600">
                  Linked PO details loaded. Status: <span className="font-medium text-gray-900">{exceptionPo.status}</span>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setViewException(null)}>Close</Button>
                <Button variant="outline" onClick={() => { resolveException.mutate(viewException.id); setViewException(null) }} disabled={resolveException.isPending}>
                  {resolveException.isPending ? 'Resolving...' : 'Resolve'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Approvals Dialog */}
      <Dialog open={editApprovalsOpen} onOpenChange={setEditApprovalsOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>3‑Way Match Approvals</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <div className="font-medium mb-2">Reason Codes</div>
              <div className="flex gap-2 mb-2">
                <Input placeholder="Add reason" value={newReason} onChange={(e: any)=>setNewReason(e.target.value)} />
                <Button variant="outline" onClick={()=>{ if(newReason.trim()){ setApprovalReasons(prev=>[...prev, newReason.trim()]); setNewReason('') } }}>Add</Button>
              </div>
              <div className="space-y-1 text-sm">
                {approvalReasons.map((r, idx)=> (
                  <div key={idx} className="flex items-center justify-between border rounded p-2">
                    <div>{r}</div>
                    <Button variant="outline" size="sm" onClick={()=> setApprovalReasons(prev=> prev.filter((x,i)=> i!==idx))}>Remove</Button>
                  </div>
                ))}
                {approvalReasons.length===0 && (<div className="text-muted-foreground text-xs">No reasons yet.</div>)}
              </div>
            </div>
            <div>
              <div className="font-medium mb-2">Approval Tiers</div>
              <div className="space-y-2">
                {tiers.map((t, idx)=> (
                  <div key={idx} className="grid grid-cols-3 gap-2 items-center">
                    <Input type="number" step="0.01" value={t.amountGt} onChange={(e: any)=> setTiers(prev => prev.map((x,i)=> i===idx?{...x, amountGt: Number(e.target.value||0)}:x))} />
                    <Input placeholder="Roles (comma-separated)" value={t.roles} onChange={(e: any)=> setTiers(prev => prev.map((x,i)=> i===idx?{...x, roles: e.target.value}:x))} />
                    <Button variant="outline" size="sm" onClick={()=> setTiers(prev => prev.filter((_,i)=> i!==idx))}>Remove</Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={()=> setTiers(prev => [...prev, { amountGt: 0, roles: '' }])}>Add Tier</Button>
              </div>
            </div>
            <div className="flex justify-end">
              <Button variant="outline" onClick={async ()=>{
                const API = process.env.NEXT_PUBLIC_API_URL || ''
                const companyId = companyFilter && companyFilter !== 'all' ? companyFilter : (companies?.data?.[0]?.id || companies?.items?.[0]?.id)
                if (companyId) {
                  await fetch(`${API}/api/three-way-match/${companyId}/approvals`, { method:'POST', headers:{ 'Content-Type':'application/json','Authorization': `Bearer ${localStorage.getItem('auth_token')||''}`, 'x-tenant-id': localStorage.getItem('tenant_id')||'tenant_demo' }, body: JSON.stringify({ reasons: approvalReasons, tiers }) })
                }
                setEditApprovalsOpen(false)
              }}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </PageLayout>
  )
}

// Exception Details Dialog (appended at end of component tree)
// Note: kept simple; uses existing Dialog primitives from Radix UI wrapper

