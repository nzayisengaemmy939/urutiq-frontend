'use client'

import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { PageLayout } from '@/components/page-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { format } from 'date-fns'
import apiService from '@/lib/api'
import { useDemoAuth } from '@/hooks/useDemoAuth'

export default function VendorBillsPage() {
  const { ready: authReady } = useDemoAuth('vendor-bills-page')
  const [companyFilter, setCompanyFilter] = useState<string>('all')
  const [vendorFilter, setVendorFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const { data: companies } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => (await apiService.getCompanies()).data,
    enabled: authReady,
  })

  const { data: vendors } = useQuery({
    queryKey: ['vendors', companyFilter],
    queryFn: async () => {
      const API = process.env.NEXT_PUBLIC_API_URL || ''
      const url = new URL(`${API}/api/vendors`)
      if (companyFilter && companyFilter !== 'all') url.searchParams.set('companyId', companyFilter)
      const res = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
          'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo',
        },
      })
      if (!res.ok) throw new Error('Failed to fetch vendors')
      return res.json()
    },
    enabled: authReady,
  })

  const { data: bills, isLoading } = useQuery({
    queryKey: ['vendor-bills', companyFilter, vendorFilter, statusFilter, searchTerm],
    queryFn: async () => {
      const API = process.env.NEXT_PUBLIC_API_URL || ''
      const url = new URL(`${API}/api/vendor-bills`)
      if (companyFilter && companyFilter !== 'all') url.searchParams.set('companyId', companyFilter)
      if (vendorFilter && vendorFilter !== 'all') url.searchParams.set('vendorId', vendorFilter)
      if (statusFilter && statusFilter !== 'all') url.searchParams.set('status', statusFilter)
      if (searchTerm) url.searchParams.set('q', searchTerm)
      url.searchParams.set('limit', '50')
      const res = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
          'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo',
        },
      })
      if (!res.ok) throw new Error('Failed to fetch vendor bills')
      return res.json()
    },
    enabled: authReady,
  })

  const items = useMemo(() => bills?.items || bills?.data || [], [bills])

  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Vendor Bills</h1>
            <p className="text-gray-600 mt-1">Review and manage vendor bills</p>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-center gap-3">
              <Input
                placeholder="Search bills..."
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

              <Select value={vendorFilter} onValueChange={setVendorFilter}>
                <SelectTrigger className="w-52">
                  <SelectValue placeholder="All Vendors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Vendors</SelectItem>
                  {(vendors?.items || []).map((v: any) => (
                    <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="matched">Matched</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bills</CardTitle>
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
                    <TableHead>Bill #</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Due</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((b: any) => (
                    <TableRow key={b.id}>
                      <TableCell className="font-medium">{b.billNumber || b.reference || b.id}</TableCell>
                      <TableCell>{b.vendor?.name || ''}</TableCell>
                      <TableCell>{b.billDate ? format(new Date(b.billDate), 'MMM dd, yyyy') : ''}</TableCell>
                      <TableCell>{b.dueDate ? format(new Date(b.dueDate), 'MMM dd, yyyy') : ''}</TableCell>
                      <TableCell className="capitalize">{b.status || 'pending'}</TableCell>
                      <TableCell>
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: b.currency || 'USD' }).format(b.totalAmount || b.amount || 0)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <a href={`/purchase-orders?prefillBillId=${b.id}`}>Match to PO</a>
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
      </div>
    </PageLayout>
  )
}


