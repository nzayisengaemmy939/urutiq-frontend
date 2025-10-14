'use client'

import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { PageLayout } from '@/components/page-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { format } from 'date-fns'
import apiService from '@/lib/api'
import { useDemoAuth } from '@/hooks/useDemoAuth'

export default function CreditNotesPage() {
  const { ready: authReady } = useDemoAuth('credit-notes-page')
  const [companyFilter, setCompanyFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [createInvoiceId, setCreateInvoiceId] = useState('')
  const [createReason, setCreateReason] = useState('Customer return')

  const { data: companies } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => (await apiService.getCompanies()).data,
    enabled: authReady,
  })

  const { data: creditNotes, isLoading, refetch } = useQuery({
    queryKey: ['credit-notes', companyFilter, searchTerm],
    queryFn: async () => {
      const API = process.env.NEXT_PUBLIC_API_URL || ''
      const companyId = companyFilter !== 'all' ? companyFilter : (companies?.items?.[0]?.id || companies?.data?.items?.[0]?.id || '')
      if (!companyId) return { items: [] }
      const url = new URL(`${API}/api/credit-notes/${companyId}`)
      if (searchTerm) url.searchParams.set('q', searchTerm)
      const res = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
          'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo',
        },
      })
      if (!res.ok) throw new Error('Failed to fetch credit notes')
      return res.json()
    },
    enabled: authReady && !!(companies?.items?.length || companies?.data?.items?.length),
  })

  const items = useMemo(() => creditNotes?.items || creditNotes?.data || [], [creditNotes])

  async function createCreditNote() {
    try {
      const API = process.env.NEXT_PUBLIC_API_URL || ''
      const companyId = companyFilter !== 'all' ? companyFilter : (companies?.items?.[0]?.id || companies?.data?.items?.[0]?.id || '')
      if (!companyId || !createInvoiceId) return
      const res = await fetch(`${API}/api/credit-notes/${companyId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
          'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo',
        },
        body: JSON.stringify({ invoiceId: createInvoiceId, reason: createReason, lines: [{ description: 'Credit', quantity: 1, unitPrice: 0 }] })
      })
      await res.json()
      setCreateOpen(false)
      setCreateInvoiceId('')
      refetch()
    } catch {}
  }

  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Credit Notes</h1>
            <p className="text-gray-600 mt-1">Manage customer credit notes and returns</p>
          </div>
          <Button onClick={() => setCreateOpen(true)}>New Credit Note</Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-center gap-3">
              <Input
                placeholder="Search credit notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
              <Select value={companyFilter} onValueChange={setCompanyFilter}>
                <SelectTrigger className="w-52">
                  <SelectValue placeholder="All Companies" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Companies</SelectItem>
                  {(companies?.data || companies?.items || []).map((c: any) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Credit Notes</CardTitle>
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
                    <TableHead>Credit Note #</TableHead>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((cn: any) => (
                    <TableRow key={cn.id}>
                      <TableCell className="font-medium">{cn.creditNoteNumber || cn.reference || cn.id}</TableCell>
                      <TableCell>{cn.invoiceId || ''}</TableCell>
                      <TableCell>{cn.customer?.name || ''}</TableCell>
                      <TableCell>{cn.createdAt ? format(new Date(cn.createdAt), 'MMM dd, yyyy') : ''}</TableCell>
                      <TableCell className="truncate max-w-xs" title={cn.reason}>{cn.reason}</TableCell>
                      <TableCell>{new Intl.NumberFormat('en-US',{style:'currency',currency:cn.currency || 'USD'}).format(cn.totalAmount || 0)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>New Credit Note</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-600 mb-1">Invoice ID</div>
                <Input value={createInvoiceId} onChange={(e) => setCreateInvoiceId(e.target.value)} placeholder="Invoice ID" />
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Reason</div>
                <Textarea value={createReason} onChange={(e) => setCreateReason(e.target.value)} rows={3} />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
                <Button disabled={!createInvoiceId} onClick={createCreditNote}>Create</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </PageLayout>
  )
}


