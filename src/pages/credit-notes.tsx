import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PageLayout } from '../components/page-layout'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog'
import { Textarea } from '../components/ui/textarea'
import { Badge } from '../components/ui/badge'
import { format } from 'date-fns'
import { Plus, Search, Eye, Trash2, FileText, CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react'
import apiService from '../lib/api'
import { creditNotesApi, type CreditNote, type CreateCreditNoteInput } from '../lib/api/credit-notes'
import { useDemoAuth } from '../hooks/useDemoAuth'

export default function CreditNotesPage() {
  const { ready: authReady } = useDemoAuth('credit-notes-page')
  const queryClient = useQueryClient()
  const [companyFilter, setCompanyFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [createOpen, setCreateOpen] = useState(false)
  const [viewOpen, setViewOpen] = useState(false)
  const [selectedCreditNote, setSelectedCreditNote] = useState<CreditNote | null>(null)
  const [createForm, setCreateForm] = useState<CreateCreditNoteInput>({
    reason: '',
    notes: '',
    terms: '',
    customerId: undefined,
    lines: [{ description: '', quantity: 1, unitPrice: 0 }]
  })
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>('')

  const { data: companies } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const response = await apiService.getCompanies()
      return Array.isArray(response) ? response : (response?.data || [])
    },
    enabled: authReady,
  })

  const companyId = companyFilter !== 'all' ? companyFilter : (Array.isArray(companies) && companies.length > 0 ? companies[0]?.id : '')

  // Fetch invoices for the selected company
  const { data: invoices, isLoading: invoicesLoading, error: invoicesError } = useQuery({
    queryKey: ['invoices', companyId],
    queryFn: async () => {
      if (!companyId) return []
      const response = await apiService.getInvoices({
        companyId,
        pageSize: 100 // Get all invoices
      })
      // The API returns { items: [...] } structure, but TypeScript expects { data: [...] }
      return (response as any).items || response.data || []
    },
    enabled: authReady && !!companyId,
  })

  // Fetch customers for the selected company
  const { data: customers } = useQuery({
    queryKey: ['customers', companyId],
    queryFn: async () => {
      if (!companyId) return []
      const response = await apiService.getCustomers({
        companyId,
        pageSize: 100 // Get all customers
      })
      return (response as any).items || []
    },
    enabled: authReady && !!companyId,
  })

  const { data: creditNotes, isLoading } = useQuery({
    queryKey: ['credit-notes', companyId, searchTerm, statusFilter],
    queryFn: async () => {
      if (!companyId) return { data: [] }
      return await creditNotesApi.getCreditNotes({
        companyId,
        search: searchTerm || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined
      })
    },
    enabled: authReady && !!companyId,
  })

  const items = useMemo(() => creditNotes?.data || [], [creditNotes])

  const createMutation = useMutation({
    mutationFn: async (data: CreateCreditNoteInput) => {
      if (!companyId) throw new Error('No company selected')
      return await creditNotesApi.createCreditNote(companyId, {
        ...data,
        invoiceId: selectedInvoiceId && selectedInvoiceId !== 'none' ? selectedInvoiceId : undefined
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credit-notes'] })
      setCreateOpen(false)
      setCreateForm({
        reason: '',
        notes: '',
        terms: '',
        customerId: undefined,
        lines: [{ description: '', quantity: 1, unitPrice: 0 }]
      })
      setSelectedInvoiceId('none')
    },
    onError: (error) => {
      console.error('Error creating credit note:', error)
    }
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!companyId) throw new Error('No company selected')
      return await creditNotesApi.deleteCreditNote(companyId, id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credit-notes'] })
    }
  })

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { color: 'bg-gray-100 text-gray-800', icon: FileText },
      sent: { color: 'bg-blue-100 text-blue-800', icon: Clock },
      viewed: { color: 'bg-yellow-100 text-yellow-800', icon: Eye },
      approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle },
      applied: { color: 'bg-purple-100 text-purple-800', icon: CheckCircle },
      cancelled: { color: 'bg-gray-100 text-gray-800', icon: XCircle }
    }
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft
    const Icon = config.icon
    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const handleCreateCreditNote = () => {
    if (createForm.reason && createForm.lines.length > 0) {
      createMutation.mutate(createForm)
    }
  }

  const handleViewCreditNote = (creditNote: CreditNote) => {
    setSelectedCreditNote(creditNote)
    setViewOpen(true)
  }

  const handleDeleteCreditNote = (id: string) => {
    if (confirm('Are you sure you want to delete this credit note?')) {
      deleteMutation.mutate(id)
    }
  }

  const addCreditNoteLine = () => {
    setCreateForm(prev => ({
      ...prev,
      lines: [...prev.lines, { description: '', quantity: 1, unitPrice: 0 }]
    }))
  }

  const removeCreditNoteLine = (index: number) => {
    setCreateForm(prev => ({
      ...prev,
      lines: prev.lines.filter((_, i) => i !== index)
    }))
  }

  const updateCreditNoteLine = (index: number, field: string, value: any) => {
    setCreateForm(prev => ({
      ...prev,
      lines: prev.lines.map((line, i) => 
        i === index ? { ...line, [field]: value } : line
      )
    }))
  }

  const handleInvoiceSelection = (invoiceId: string) => {
    if (invoiceId === 'none') {
      setSelectedInvoiceId('')
      setCreateForm(prev => ({
        ...prev,
        lines: [{ description: '', quantity: 1, unitPrice: 0 }]
      }))
      return
    }
    
    setSelectedInvoiceId(invoiceId)
    
    if (invoiceId && invoices) {
      const selectedInvoice = invoices.find((inv: any) => inv.id === invoiceId)
      if (selectedInvoice) {
        // Set customer ID from the selected invoice (this will override manual customer selection)
        setCreateForm(prev => ({
          ...prev,
          customerId: selectedInvoice.customerId
        }))
        
        // Auto-populate credit note lines from invoice
        if (selectedInvoice.lines) {
          const creditLines = selectedInvoice.lines.map((line: any) => ({
            description: line.description || 'Credit for: ' + (line.product?.name || 'Item'),
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            taxRate: line.taxRate || 0,
            discountRate: line.discountRate || 0,
            productId: line.productId
          }))
          
          setCreateForm(prev => ({
            ...prev,
            lines: creditLines.length > 0 ? creditLines : [{ description: '', quantity: 1, unitPrice: 0 }]
          }))
        }
      }
    }
  }

  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Credit Notes</h1>
            <p className="text-gray-600 mt-1">Manage customer credit notes and returns</p>
          </div>
          <Button onClick={() => setCreateOpen(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Credit Note
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search credit notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={companyFilter} onValueChange={setCompanyFilter}>
                <SelectTrigger className="w-52">
                  <SelectValue placeholder="All Companies" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Companies</SelectItem>
                  {Array.isArray(companies) ? companies.map((c: any) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  )) : null}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="viewed">Viewed</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="applied">Applied</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Credit Notes</span>
              <span className="text-sm font-normal text-gray-500">
                {items.length} credit note{items.length !== 1 ? 's' : ''}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No credit notes found</h3>
                <p className="text-gray-500 mb-4">Get started by creating your first credit note.</p>
                <Button onClick={() => setCreateOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Credit Note
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Credit Note #</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((cn: CreditNote) => (
                    <TableRow key={cn.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{cn.creditNoteNumber}</TableCell>
                      <TableCell>{getStatusBadge(cn.status)}</TableCell>
                      <TableCell>
                        {cn.invoice ? (
                          <span className="text-blue-600 hover:underline cursor-pointer">
                            {cn.invoice.invoiceNumber}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {cn.customer ? (
                          <div>
                            <div className="font-medium">{cn.customer.name}</div>
                            {cn.customer.email && (
                              <div className="text-sm text-gray-500">{cn.customer.email}</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>{format(new Date(cn.issueDate), 'MMM dd, yyyy')}</TableCell>
                      <TableCell className="truncate max-w-xs" title={cn.reason}>
                        {cn.reason || '-'}
                      </TableCell>
                      <TableCell className="font-medium">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: cn.currency || 'USD'
                        }).format(cn.totalAmount || 0)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewCreditNote(cn)}
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteCreditNote(cn.id)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Create Credit Note Dialog */}
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Credit Note</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Reason *</label>
                  <Input
                    value={createForm.reason}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, reason: e.target.value }))}
                    placeholder="Reason for credit note"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Customer</label>
                  <Select 
                    value={createForm.customerId || 'none'} 
                    onValueChange={(value) => setCreateForm(prev => ({ ...prev, customerId: value === 'none' ? undefined : value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No customer selected</SelectItem>
                      {customers && customers.length > 0 ? (
                        customers.map((customer: any) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            <div className="flex flex-col">
                              <span className="font-medium">{customer.name}</span>
                              {customer.email && (
                                <span className="text-sm text-gray-500">{customer.email}</span>
                              )}
                            </div>
                          </SelectItem>
                        ))
                      ) : (
                        <div className="px-2 py-1 text-sm text-gray-500">No customers available</div>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Select Invoice (Optional)</label>
                  <Select value={selectedInvoiceId} onValueChange={handleInvoiceSelection}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an invoice..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No invoice selected</SelectItem>
                      {invoices && invoices.length > 0 ? (
                        invoices.map((invoice: any) => (
                          <SelectItem key={invoice.id} value={invoice.id}>
                            <div className="flex flex-col">
                              <span className="font-medium">{invoice.invoiceNumber}</span>
                              <span className="text-sm text-gray-500">
                                {invoice.customer?.name || 'Unknown Customer'} • 
                                {new Intl.NumberFormat('en-US', {
                                  style: 'currency',
                                  currency: invoice.currency || 'USD'
                                }).format(invoice.totalAmount || 0)} • 
                                {format(new Date(invoice.issueDate), 'MMM dd, yyyy')}
                              </span>
                            </div>
                          </SelectItem>
                        ))
                      ) : (
                        <div className="px-2 py-1 text-sm text-gray-500">
                          {invoicesLoading ? 'Loading invoices...' : 
                           invoicesError ? `Error loading invoices: ${invoicesError.message}` :
                           'No invoices available for this company'}
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                  {selectedInvoiceId && selectedInvoiceId !== 'none' && (
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-green-600">
                        ✓ Invoice selected - Credit note lines will be auto-populated
                      </p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedInvoiceId('none')
                          setCreateForm(prev => ({
                            ...prev,
                            lines: [{ description: '', quantity: 1, unitPrice: 0 }]
                          }))
                        }}
                        className="h-6 px-2 text-xs text-gray-500 hover:text-gray-700"
                      >
                        Clear
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Notes</label>
                  <Textarea
                    value={createForm.notes || ''}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional notes"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Terms</label>
                  <Textarea
                    value={createForm.terms || ''}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, terms: e.target.value }))}
                    placeholder="Payment terms"
                    rows={3}
                  />
                </div>
              </div>

              {/* Selected Invoice Details */}
              {selectedInvoiceId && selectedInvoiceId !== 'none' && invoices && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Selected Invoice Details</h4>
                  {(() => {
                    const selectedInvoice = invoices.find((inv: any) => inv.id === selectedInvoiceId)
                    return selectedInvoice ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-blue-700 font-medium">Invoice #:</span>
                          <span className="ml-2">{selectedInvoice.invoiceNumber}</span>
                        </div>
                        <div>
                          <span className="text-blue-700 font-medium">Customer:</span>
                          <span className="ml-2">{selectedInvoice.customer?.name || 'Unknown'}</span>
                        </div>
                        <div>
                          <span className="text-blue-700 font-medium">Total Amount:</span>
                          <span className="ml-2">
                            {new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: selectedInvoice.currency || 'USD'
                            }).format(selectedInvoice.totalAmount || 0)}
                          </span>
                        </div>
                        <div>
                          <span className="text-blue-700 font-medium">Issue Date:</span>
                          <span className="ml-2">{format(new Date(selectedInvoice.issueDate), 'MMM dd, yyyy')}</span>
                        </div>
                        <div>
                          <span className="text-blue-700 font-medium">Status:</span>
                          <span className="ml-2 capitalize">{selectedInvoice.status}</span>
                        </div>
                        <div>
                          <span className="text-blue-700 font-medium">Lines:</span>
                          <span className="ml-2">{selectedInvoice.lines?.length || 0} items</span>
                        </div>
                      </div>
                    ) : null
                  })()}
                </div>
              )}

              {/* Credit Note Lines */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="text-sm font-medium text-gray-700">Credit Note Lines *</label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addCreditNoteLine}
                    className="flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Line
                  </Button>
                </div>
                <div className="space-y-3">
                  {createForm.lines.map((line, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-end p-3 border rounded-lg">
                      <div className="col-span-5">
                        <label className="text-xs text-gray-600 mb-1 block">Description</label>
                        <Input
                          value={line.description}
                          onChange={(e) => updateCreditNoteLine(index, 'description', e.target.value)}
                          placeholder="Item description"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-xs text-gray-600 mb-1 block">Quantity</label>
                        <Input
                          type="number"
                          value={line.quantity}
                          onChange={(e) => updateCreditNoteLine(index, 'quantity', parseFloat(e.target.value) || 0)}
                          placeholder="1"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-xs text-gray-600 mb-1 block">Unit Price</label>
                        <Input
                          type="number"
                          step="0.01"
                          value={line.unitPrice}
                          onChange={(e) => updateCreditNoteLine(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-xs text-gray-600 mb-1 block">Total</label>
                        <Input
                          value={(line.quantity * line.unitPrice).toFixed(2)}
                          disabled
                          className="bg-gray-50"
                        />
                      </div>
                      <div className="col-span-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCreditNoteLine(index)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          disabled={createForm.lines.length === 1}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Calculation */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium">Total Amount:</span>
                  <span className="text-lg font-bold">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD'
                    }).format(
                      createForm.lines.reduce((sum, line) => sum + (line.quantity * line.unitPrice), 0)
                    )}
                  </span>
                </div>
              </div>

              {/* Form Validation Messages */}
              {(!createForm.reason || createForm.lines.length === 0) && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    {!createForm.reason && 'Please provide a reason for the credit note. '}
                    {createForm.lines.length === 0 && 'Please add at least one line item.'}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setCreateOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateCreditNote}
                  disabled={!createForm.reason || createForm.lines.length === 0 || createMutation.isPending}
                  className="min-w-[140px]"
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Credit Note
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* View Credit Note Dialog */}
        <Dialog open={viewOpen} onOpenChange={setViewOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Credit Note Details</DialogTitle>
            </DialogHeader>
            {selectedCreditNote && (
              <div className="space-y-6">
                {/* Header Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Credit Note Information</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Credit Note #:</span>
                        <span className="font-medium">{selectedCreditNote.creditNoteNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        {getStatusBadge(selectedCreditNote.status)}
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Issue Date:</span>
                        <span>{format(new Date(selectedCreditNote.issueDate), 'MMM dd, yyyy')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Amount:</span>
                        <span className="font-bold">
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: selectedCreditNote.currency || 'USD'
                          }).format(selectedCreditNote.totalAmount)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Related Information</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Customer:</span>
                        <span>{selectedCreditNote.customer?.name || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Invoice:</span>
                        <span>{selectedCreditNote.invoice?.invoiceNumber || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Reason:</span>
                        <span className="text-right max-w-48">{selectedCreditNote.reason || '-'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Credit Note Lines */}
                {selectedCreditNote.lines && selectedCreditNote.lines.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Credit Note Lines</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Description</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Unit Price</TableHead>
                          <TableHead>Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedCreditNote.lines.map((line, index) => (
                          <TableRow key={index}>
                            <TableCell>{line.description}</TableCell>
                            <TableCell>{line.quantity}</TableCell>
                            <TableCell>
                              {new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: selectedCreditNote.currency || 'USD'
                              }).format(line.unitPrice)}
                            </TableCell>
                            <TableCell className="font-medium">
                              {new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: selectedCreditNote.currency || 'USD'
                              }).format(line.totalAmount)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {/* Notes and Terms */}
                {(selectedCreditNote.notes || selectedCreditNote.terms) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {selectedCreditNote.notes && (
                      <div>
                        <h4 className="font-medium mb-2">Notes</h4>
                        <p className="text-gray-600 text-sm">{selectedCreditNote.notes}</p>
                      </div>
                    )}
                    {selectedCreditNote.terms && (
                      <div>
                        <h4 className="font-medium mb-2">Terms</h4>
                        <p className="text-gray-600 text-sm">{selectedCreditNote.terms}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button variant="outline" onClick={() => setViewOpen(false)}>
                    Close
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </PageLayout>
  )
}
