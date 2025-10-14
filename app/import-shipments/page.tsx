'use client'

import { useState, useMemo } from 'react'
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
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Ship, 
  Package, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  MapPin,
  Calendar,
  DollarSign,
  TrendingUp,
  BarChart3,
  FileText,
  Truck,
  Plane,
  Anchor
} from 'lucide-react'
import { format } from 'date-fns'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'

// Types
interface ImportShipment {
  id: string
  shipmentNumber: string
  shipmentDate: string
  expectedArrival?: string
  actualArrival?: string
  status: 'pending' | 'in_transit' | 'arrived' | 'cleared' | 'delivered'
  carrier?: string
  trackingNumber?: string
  containerNumber?: string
  vesselFlight?: string
  customsBroker?: string
  customsEntryDate?: string
  customsReleaseDate?: string
  dutiesPaid: number
  taxesPaid: number
  billOfLading?: string
  commercialInvoice?: string
  packingList?: string
  certificateOfOrigin?: string
  insuranceCertificate?: string
  freightCost: number
  insuranceCost: number
  customsFees: number
  storageCost: number
  otherCosts: number
  totalLandedCost: number
  notes?: string
  issues?: string
  purchaseOrder: {
    id: string
    poNumber: string
    vendor: { name: string }
  }
  customsEvents: CustomsEvent[]
  createdAt: string
  updatedAt: string
}

interface CustomsEvent {
  id: string
  eventType: 'shipment_created' | 'customs_entry' | 'customs_hold' | 'customs_release' | 'delivery'
  eventDate: string
  description: string
  location?: string
  status: 'pending' | 'completed' | 'failed'
  notes?: string
}

interface PurchaseOrder {
  id: string
  poNumber: string
  vendor: { name: string }
}

// Validation schemas
const importShipmentSchema = z.object({
  companyId: z.string().min(1, 'Company is required'),
  purchaseOrderId: z.string().min(1, 'Purchase Order is required'),
  shipmentNumber: z.string().min(1, 'Shipment Number is required'),
  shipmentDate: z.string().min(1, 'Shipment Date is required'),
  expectedArrival: z.string().optional(),
  carrier: z.string().optional(),
  trackingNumber: z.string().optional(),
  containerNumber: z.string().optional(),
  vesselFlight: z.string().optional(),
  customsBroker: z.string().optional(),
  billOfLading: z.string().optional(),
  commercialInvoice: z.string().optional(),
  packingList: z.string().optional(),
  certificateOfOrigin: z.string().optional(),
  insuranceCertificate: z.string().optional(),
  freightCost: z.number().nonnegative().default(0),
  insuranceCost: z.number().nonnegative().default(0),
  customsFees: z.number().nonnegative().default(0),
  storageCost: z.number().nonnegative().default(0),
  otherCosts: z.number().nonnegative().default(0),
  notes: z.string().optional()
})

const customsEventSchema = z.object({
  eventType: z.enum(['shipment_created', 'customs_entry', 'customs_hold', 'customs_release', 'delivery']),
  eventDate: z.string().min(1, 'Event Date is required'),
  description: z.string().min(1, 'Description is required'),
  location: z.string().optional(),
  status: z.enum(['pending', 'completed', 'failed']).default('completed'),
  notes: z.string().optional()
})

export default function ImportShipmentsPage() {
  const { ready: authReady } = useDemoAuth('import-shipments-page')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [carrierFilter, setCarrierFilter] = useState<string>('all')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedShipment, setSelectedShipment] = useState<ImportShipment | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isAddEventDialogOpen, setIsAddEventDialogOpen] = useState(false)
  const [selectedShipmentForEvent, setSelectedShipmentForEvent] = useState<string>('')
  const [isAllocateDialogOpen, setIsAllocateDialogOpen] = useState(false)
  const [selectedShipmentForAllocation, setSelectedShipmentForAllocation] = useState<string>('')
  const [allocationMethod, setAllocationMethod] = useState<'value'|'quantity'|'custom'>('value')
  const [customShares, setCustomShares] = useState<Record<string, number>>({})
  
  const queryClient = useQueryClient()

  // Fetch data
  const { data: importShipments, isLoading } = useQuery({
    queryKey: ['import-shipments', searchTerm, statusFilter, carrierFilter],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (searchTerm) params.append('q', searchTerm)
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (carrierFilter !== 'all') params.append('carrier', carrierFilter)
      
      const response = await fetch(`/api/import-shipments?${params}`)
      if (!response.ok) throw new Error('Failed to fetch import shipments')
      return response.json()
    }
  })

  const { data: purchaseOrders } = useQuery({
    queryKey: ['purchase-orders', 'import'],
    queryFn: async () => {
      const response = await fetch('/api/purchase-orders?purchaseType=import')
      if (!response.ok) throw new Error('Failed to fetch purchase orders')
      return response.json()
    }
  })

  const { data: companies } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const res = await apiService.getCompanies()
      return res.data
    },
    enabled: authReady
  })

  const { data: stats } = useQuery({
    queryKey: ['import-shipments-stats'],
    queryFn: async () => {
      const response = await fetch('/api/import-shipments/stats')
      if (!response.ok) throw new Error('Failed to fetch statistics')
      return response.json()
    }
  })

  // Mutations
  const createImportShipment = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/import-shipments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!response.ok) throw new Error('Failed to create import shipment')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['import-shipments'] })
      queryClient.invalidateQueries({ queryKey: ['import-shipments-stats'] })
      setIsCreateDialogOpen(false)
      toast.success('Import shipment created successfully')
    },
    onError: (error) => {
      toast.error('Failed to create import shipment')
    }
  })

  const addCustomsEvent = useMutation({
    mutationFn: async ({ shipmentId, data }: { shipmentId: string; data: any }) => {
      const response = await fetch(`/api/import-shipments/${shipmentId}/customs-events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!response.ok) throw new Error('Failed to add customs event')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['import-shipments'] })
      setIsAddEventDialogOpen(false)
      toast.success('Customs event added successfully')
    },
    onError: (error) => {
      toast.error('Failed to add customs event')
    }
  })

  const allocateCosts = useMutation({
    mutationFn: async ({ shipmentId, method, custom }: { shipmentId: string; method: 'value'|'quantity'|'custom'; custom?: Array<{ lineId: string; share: number }> }) => {
      const response = await fetch(`/api/import-shipments/${shipmentId}/allocate-costs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ allocationMethod: method, customAllocations: custom })
      })
      if (!response.ok) throw new Error('Failed to allocate costs')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['import-shipments'] })
      toast.success('Landed costs allocated')
    },
    onError: () => toast.error('Failed to allocate costs')
  })

  const { data: allocationShipment } = useQuery({
    queryKey: ['import-shipment', selectedShipmentForAllocation],
    queryFn: async () => {
      if (!selectedShipmentForAllocation) return null
      const res = await fetch(`/api/import-shipments/${selectedShipmentForAllocation}`)
      if (!res.ok) throw new Error('Failed to fetch shipment')
      return res.json()
    },
    enabled: !!selectedShipmentForAllocation
  })

  // Form setup
  const shipmentForm = useForm({
    resolver: zodResolver(importShipmentSchema),
    defaultValues: {
      freightCost: 0,
      insuranceCost: 0,
      customsFees: 0,
      storageCost: 0,
      otherCosts: 0
    }
  })

  const eventForm = useForm({
    resolver: zodResolver(customsEventSchema),
    defaultValues: {
      status: 'completed' as const
    }
  })

  // Computed values
  const filteredShipments = useMemo(() => {
    if (!importShipments?.items) return []
    return importShipments.items
  }, [importShipments])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-800'
      case 'in_transit': return 'bg-blue-100 text-blue-800'
      case 'arrived': return 'bg-yellow-100 text-yellow-800'
      case 'cleared': return 'bg-green-100 text-green-800'
      case 'delivered': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />
      case 'in_transit': return <Ship className="w-4 h-4" />
      case 'arrived': return <Package className="w-4 h-4" />
      case 'cleared': return <CheckCircle className="w-4 h-4" />
      case 'delivered': return <CheckCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'shipment_created': return <Package className="w-4 h-4" />
      case 'customs_entry': return <FileText className="w-4 h-4" />
      case 'customs_hold': return <AlertTriangle className="w-4 h-4" />
      case 'customs_release': return <CheckCircle className="w-4 h-4" />
      case 'delivery': return <Truck className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  const getShippingIcon = (method?: string) => {
    switch (method) {
      case 'air': return <Plane className="w-4 h-4" />
      case 'sea': return <Anchor className="w-4 h-4" />
      case 'land': return <Truck className="w-4 h-4" />
      default: return <Ship className="w-4 h-4" />
    }
  }

  const onSubmitShipment = (data: any) => {
    createImportShipment.mutate(data)
  }

  const onSubmitEvent = (data: any) => {
    addCustomsEvent.mutate({ shipmentId: selectedShipmentForEvent, data })
  }

  const handleViewShipment = (shipment: ImportShipment) => {
    setSelectedShipment(shipment)
    setIsViewDialogOpen(true)
  }

  const handleAddEvent = (shipmentId: string) => {
    setSelectedShipmentForEvent(shipmentId)
    setIsAddEventDialogOpen(true)
  }

  const calculateProgress = (shipment: ImportShipment) => {
    const events = shipment.customsEvents
    const totalSteps = 5 // shipment_created, customs_entry, customs_hold, customs_release, delivery
    const completedSteps = events.filter(e => e.status === 'completed').length
    return (completedSteps / totalSteps) * 100
  }

  return (
    <PageLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Import Shipments</h1>
            <p className="text-gray-600 mt-1">Track international shipments and customs events</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Import Shipment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Import Shipment</DialogTitle>
              </DialogHeader>
              <Form {...shipmentForm}>
                <form onSubmit={shipmentForm.handleSubmit(onSubmitShipment)} className="space-y-6">
                  <Tabs defaultValue="basic" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="basic">Basic Info</TabsTrigger>
                      <TabsTrigger value="shipping">Shipping Details</TabsTrigger>
                      <TabsTrigger value="costs">Costs</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="basic" className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={shipmentForm.control}
                          name="companyId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Company</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select company" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {companies?.items?.map((company: any) => (
                                    <SelectItem key={company.id} value={company.id}>
                                      {company.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={shipmentForm.control}
                          name="purchaseOrderId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Purchase Order</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select purchase order" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {purchaseOrders?.items?.map((po: any) => (
                                    <SelectItem key={po.id} value={po.id}>
                                      {po.poNumber} - {po.vendor.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={shipmentForm.control}
                          name="shipmentNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Shipment Number</FormLabel>
                              <FormControl>
                                <Input placeholder="SH-2024-001" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={shipmentForm.control}
                          name="shipmentDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Shipment Date</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={shipmentForm.control}
                          name="expectedArrival"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Expected Arrival</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={shipmentForm.control}
                          name="carrier"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Carrier</FormLabel>
                              <FormControl>
                                <Input placeholder="Maersk, MSC, etc." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="shipping" className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={shipmentForm.control}
                          name="trackingNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tracking Number</FormLabel>
                              <FormControl>
                                <Input placeholder="Tracking number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={shipmentForm.control}
                          name="containerNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Container Number</FormLabel>
                              <FormControl>
                                <Input placeholder="Container number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={shipmentForm.control}
                          name="vesselFlight"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Vessel/Flight</FormLabel>
                              <FormControl>
                                <Input placeholder="Vessel or flight number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={shipmentForm.control}
                          name="customsBroker"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Customs Broker</FormLabel>
                              <FormControl>
                                <Input placeholder="Customs broker name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={shipmentForm.control}
                          name="billOfLading"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Bill of Lading</FormLabel>
                              <FormControl>
                                <Input placeholder="BOL number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={shipmentForm.control}
                          name="commercialInvoice"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Commercial Invoice</FormLabel>
                              <FormControl>
                                <Input placeholder="Invoice number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={shipmentForm.control}
                          name="packingList"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Packing List</FormLabel>
                              <FormControl>
                                <Input placeholder="Packing list number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={shipmentForm.control}
                          name="certificateOfOrigin"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Certificate of Origin</FormLabel>
                              <FormControl>
                                <Input placeholder="Certificate number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={shipmentForm.control}
                          name="insuranceCertificate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Insurance Certificate</FormLabel>
                              <FormControl>
                                <Input placeholder="Insurance certificate number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="costs" className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={shipmentForm.control}
                          name="freightCost"
                          render={({ field }) => (
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
                          control={shipmentForm.control}
                          name="insuranceCost"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Insurance Cost</FormLabel>
                              <FormControl>
                                <Input type="number" step="0.01" placeholder="0.00" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={shipmentForm.control}
                          name="customsFees"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Customs Fees</FormLabel>
                              <FormControl>
                                <Input type="number" step="0.01" placeholder="0.00" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={shipmentForm.control}
                          name="storageCost"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Storage Cost</FormLabel>
                              <FormControl>
                                <Input type="number" step="0.01" placeholder="0.00" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={shipmentForm.control}
                          name="otherCosts"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Other Costs</FormLabel>
                              <FormControl>
                                <Input type="number" step="0.01" placeholder="0.00" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={shipmentForm.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Notes</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Additional notes..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TabsContent>
                  </Tabs>
                  
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createImportShipment.isPending}>
                      {createImportShipment.isPending ? 'Creating...' : 'Create Shipment'}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <Ship className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Shipments</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalShipments}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Landed Cost</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${stats.totalLandedCost?.toLocaleString() || '0'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Transit Time</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {Math.round(stats.averageTransitTime || 0)} days
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">In Transit</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.statusBreakdown?.in_transit || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search shipments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_transit">In Transit</SelectItem>
                  <SelectItem value="arrived">Arrived</SelectItem>
                  <SelectItem value="cleared">Cleared</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={carrierFilter} onValueChange={setCarrierFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by carrier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Carriers</SelectItem>
                  <SelectItem value="Maersk">Maersk</SelectItem>
                  <SelectItem value="MSC">MSC</SelectItem>
                  <SelectItem value="CMA CGM">CMA CGM</SelectItem>
                  <SelectItem value="COSCO">COSCO</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Shipments Table */}
        <Card>
          <CardHeader>
            <CardTitle>Import Shipments</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Shipment #</TableHead>
                    <TableHead>PO Number</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Carrier</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Landed Cost</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredShipments.map((shipment: ImportShipment) => (
                    <TableRow key={shipment.id}>
                      <TableCell className="font-medium">{shipment.shipmentNumber}</TableCell>
                      <TableCell>{shipment.purchaseOrder.poNumber}</TableCell>
                      <TableCell>{shipment.purchaseOrder.vendor.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getShippingIcon(shipment.carrier)}
                          <span>{shipment.carrier || 'N/A'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(shipment.status)}>
                          {getStatusIcon(shipment.status)}
                          <span className="ml-1">{shipment.status}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Progress value={calculateProgress(shipment)} className="w-20" />
                          <span className="text-sm text-gray-600">
                            {Math.round(calculateProgress(shipment))}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        ${shipment.totalLandedCost.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewShipment(shipment)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddEvent(shipment.id)}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                          {shipment.status !== 'pending' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => { setSelectedShipmentForAllocation(shipment.id); setAllocationMethod('value'); setCustomShares({}); setIsAllocateDialogOpen(true) }}
                            >
                              Allocate
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* View Shipment Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Shipment Details</DialogTitle>
          </DialogHeader>
          {selectedShipment && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900">Shipment Number</h4>
                  <p className="text-gray-600">{selectedShipment.shipmentNumber}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">PO Number</h4>
                  <p className="text-gray-600">{selectedShipment.purchaseOrder.poNumber}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Vendor</h4>
                  <p className="text-gray-600">{selectedShipment.purchaseOrder.vendor.name}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Status</h4>
                  <Badge className={getStatusColor(selectedShipment.status)}>
                    {selectedShipment.status}
                  </Badge>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Carrier</h4>
                  <p className="text-gray-600">{selectedShipment.carrier || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Tracking Number</h4>
                  <p className="text-gray-600">{selectedShipment.trackingNumber || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Shipment Date</h4>
                  <p className="text-gray-600">{format(new Date(selectedShipment.shipmentDate), 'MMM dd, yyyy')}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Expected Arrival</h4>
                  <p className="text-gray-600">
                    {selectedShipment.expectedArrival 
                      ? format(new Date(selectedShipment.expectedArrival), 'MMM dd, yyyy')
                      : 'N/A'
                    }
                  </p>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium text-gray-900 mb-4">Cost Breakdown</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Freight Cost:</span>
                      <span className="font-medium">${selectedShipment.freightCost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Insurance Cost:</span>
                      <span className="font-medium">${selectedShipment.insuranceCost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Customs Fees:</span>
                      <span className="font-medium">${selectedShipment.customsFees.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Storage Cost:</span>
                      <span className="font-medium">${selectedShipment.storageCost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Other Costs:</span>
                      <span className="font-medium">${selectedShipment.otherCosts.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-medium">Total Landed Cost:</span>
                      <span className="text-2xl font-bold text-green-600">
                        ${selectedShipment.totalLandedCost.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium text-gray-900 mb-4">Customs Events Timeline</h4>
                <div className="space-y-4">
                  {selectedShipment.customsEvents.map((event) => (
                    <div key={event.id} className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          {getEventIcon(event.eventType)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">{event.description}</p>
                          <Badge variant={event.status === 'completed' ? 'default' : 'secondary'}>
                            {event.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          {format(new Date(event.eventDate), 'MMM dd, yyyy HH:mm')}
                          {event.location && ` • ${event.location}`}
                        </p>
                        {event.notes && (
                          <p className="text-sm text-gray-500 mt-1">{event.notes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Customs Event Dialog */}
      <Dialog open={isAddEventDialogOpen} onOpenChange={setIsAddEventDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Customs Event</DialogTitle>
          </DialogHeader>
          <Form {...eventForm}>
            <form onSubmit={eventForm.handleSubmit(onSubmitEvent)} className="space-y-4">
              <FormField
                control={eventForm.control}
                name="eventType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select event type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="shipment_created">Shipment Created</SelectItem>
                        <SelectItem value="customs_entry">Customs Entry</SelectItem>
                        <SelectItem value="customs_hold">Customs Hold</SelectItem>
                        <SelectItem value="customs_release">Customs Release</SelectItem>
                        <SelectItem value="delivery">Delivery</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={eventForm.control}
                name="eventDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Date</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={eventForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input placeholder="Event description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={eventForm.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Event location" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={eventForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={eventForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Additional notes..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsAddEventDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={addCustomsEvent.isPending}>
                  {addCustomsEvent.isPending ? 'Adding...' : 'Add Event'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Allocate Landed Costs Dialog */}
      <Dialog open={isAllocateDialogOpen} onOpenChange={setIsAllocateDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Allocate Landed Costs</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Method</label>
                <Select value={allocationMethod} onValueChange={(v: any) => setAllocationMethod(v)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="value">By Value</SelectItem>
                    <SelectItem value="quantity">By Quantity</SelectItem>
                    <SelectItem value="custom">Custom Shares</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="self-end text-sm text-gray-600">
                {allocationShipment && (
                  <div>
                    Total Landed Cost: ${allocationShipment.totalLandedCost?.toLocaleString?.() || '0'}
                  </div>
                )}
              </div>
            </div>

            {allocationMethod === 'custom' && allocationShipment?.purchaseOrder?.lines && (
              <div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead className="w-40">Share</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allocationShipment.purchaseOrder.lines.map((line: any) => (
                      <TableRow key={line.id}>
                        <TableCell>{line.description}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            value={customShares[line.id] ?? 0}
                            onChange={(e) => setCustomShares({ ...customShares, [line.id]: Number(e.target.value) })}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="text-right text-xs text-gray-500 mt-1">
                  Sum of shares will be normalized to 100%.
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsAllocateDialogOpen(false)}>Cancel</Button>
              <Button
                onClick={() => {
                  const customAllocations = allocationMethod === 'custom' && allocationShipment?.purchaseOrder?.lines
                    ? allocationShipment.purchaseOrder.lines.map((line: any) => ({ lineId: line.id, share: Number(customShares[line.id] || 0) }))
                    : undefined
                  allocateCosts.mutate({ shipmentId: selectedShipmentForAllocation, method: allocationMethod, custom: customAllocations })
                  setIsAllocateDialogOpen(false)
                }}
                disabled={allocateCosts.isPending || !selectedShipmentForAllocation}
              >
                {allocateCosts.isPending ? 'Allocating...' : 'Allocate'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </PageLayout>
  )
}
