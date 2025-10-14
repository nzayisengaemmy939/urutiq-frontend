'use client'

import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { PageLayout } from '@/components/page-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import apiService from '@/lib/api'
import { format } from 'date-fns'
import { useDemoAuth } from '@/hooks/useDemoAuth'

export default function RevenueRecognitionPage() {
  const { ready: authReady } = useDemoAuth('revenue-recognition-page')
  const [companyId, setCompanyId] = useState<string>('all')
  const [name, setName] = useState('SaaS Annual Subscription')
  const [contractId, setContractId] = useState('')
  const [customer, setCustomer] = useState('')
  const [amount, setAmount] = useState<number>(1200)
  const [currency, setCurrency] = useState('USD')
  const [method, setMethod] = useState<'straight_line'|'daily_prorata'|'custom'>('straight_line')
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().slice(0,10))
  const [endDate, setEndDate] = useState<string>(new Date(new Date().setMonth(new Date().getMonth()+12)).toISOString().slice(0,10))
  const [periodStart, setPeriodStart] = useState<string>(new Date().toISOString().slice(0,10))
  const [periodEnd, setPeriodEnd] = useState<string>(new Date().toISOString().slice(0,10))
  const [accounts, setAccounts] = useState<any[]>([])
  const [revenueAccountId, setRevenueAccountId] = useState('')
  const [deferredRevenueAccountId, setDeferredRevenueAccountId] = useState('')

  const { data: companies } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => (await apiService.getCompanies()).data,
    enabled: authReady,
  })

  const { data: schedules, refetch, isFetching } = useQuery({
    queryKey: ['revrec-schedules', companyId],
    queryFn: async () => {
      const API = process.env.NEXT_PUBLIC_API_URL || ''
      const cid = companyId !== 'all' ? companyId : (companies?.items?.[0]?.id || companies?.data?.items?.[0]?.id || '')
      if (!cid) return { items: [] }
      const res = await fetch(`${API}/api/revenue-recognition/${cid}/schedules`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
          'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo',
        },
      })
      if (!res.ok) throw new Error('Failed to load revrec schedules')
      return res.json()
    },
    enabled: authReady && !!(companies?.items?.length || companies?.data?.items?.length),
  })

  async function createSchedule() {
    const API = process.env.NEXT_PUBLIC_API_URL || ''
    const cid = companyId !== 'all' ? companyId : (companies?.items?.[0]?.id || companies?.data?.items?.[0]?.id || '')
    if (!cid) return
    await fetch(`${API}/api/revenue-recognition/${cid}/schedules`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
        'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo',
      },
      body: JSON.stringify({ name, contractId, amount, currency, method, startDate, endDate })
    })
    refetch()
  }

  const items = useMemo(() => schedules?.items || schedules?.data || [], [schedules])

  async function deleteSchedule(id: string) {
    const API = process.env.NEXT_PUBLIC_API_URL || ''
    const cid = companyId !== 'all' ? companyId : (companies?.items?.[0]?.id || companies?.data?.items?.[0]?.id || '')
    if (!cid) return
    await fetch(`${API}/api/revenue-recognition/${cid}/schedules/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`, 'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo' } })
    refetch()
  }

  async function runRecognition() {
    const API = process.env.NEXT_PUBLIC_API_URL || ''
    const cid = companyId !== 'all' ? companyId : (companies?.items?.[0]?.id || companies?.data?.items?.[0]?.id || '')
    if (!cid) return
    const res = await fetch(`${API}/api/revenue-recognition/${cid}/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
        'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo',
      },
      body: JSON.stringify({ periodStart, periodEnd })
    })
    const data = await res.json()
    alert(`Recognized ${data.postings?.reduce((s:number,p:any)=>s+(p.amount||0),0).toFixed(2)} ${currency} for period`)
  }

  useEffect(() => { (async ()=>{
    const cid = companyId !== 'all' ? companyId : (companies?.items?.[0]?.id || companies?.data?.items?.[0]?.id || '')
    if (!cid) return
    const res = await fetch(`/api/accounts?companyId=${cid}`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')||''}` } })
    const data = await res.json()
    const list = data?.flat || []
    setAccounts(list)
    if (!revenueAccountId) {
      const rev = list.find((a:any)=>/revenue|sales/i.test(`${a.code} ${a.name}`) )
      if (rev) setRevenueAccountId(rev.id)
    }
    if (!deferredRevenueAccountId) {
      const def = list.find((a:any)=>/deferred|contract liab|unearned/i.test(`${a.code} ${a.name}`))
      if (def) setDeferredRevenueAccountId(def.id)
    }
  })() }, [companyId, companies])

  async function postRecognition() {
    const API = process.env.NEXT_PUBLIC_API_URL || ''
    const cid = companyId !== 'all' ? companyId : (companies?.items?.[0]?.id || companies?.data?.items?.[0]?.id || '')
    if (!cid) return
    // For demo, compute postings client-side via run endpoint
    const runRes = await fetch(`${API}/api/revenue-recognition/${cid}/run`, { method: 'POST', headers: { 'Content-Type':'application/json','Authorization': `Bearer ${localStorage.getItem('auth_token')||''}`,'x-tenant-id': localStorage.getItem('tenant_id')||'tenant_demo' }, body: JSON.stringify({ periodStart, periodEnd }) })
    const run = await runRes.json()
    const postings = run?.postings || []
    const res = await fetch(`${API}/api/revenue-recognition/${cid}/post`, { method: 'POST', headers: { 'Content-Type':'application/json','Authorization': `Bearer ${localStorage.getItem('auth_token')||''}`,'x-tenant-id': localStorage.getItem('tenant_id')||'tenant_demo' }, body: JSON.stringify({ periodStart, periodEnd, postings, accounts: { revenueAccountId, deferredRevenueAccountId } }) })
    const data = await res.json()
    alert(`Posted ${new Intl.NumberFormat('en-US',{style:'currency',currency}).format(data?.total||0)}`)
  }

  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Revenue Recognition</h1>
            <p className="text-gray-600 mt-1">Create recognition schedules and run postings by period</p>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <Select value={companyId} onValueChange={setCompanyId}>
                <SelectTrigger className="w-56"><SelectValue placeholder="All Companies" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Companies</SelectItem>
                  {(companies?.data || companies?.items || []).map((c:any)=> (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-6 gap-3">
              <Input placeholder="Name" value={name} onChange={(e)=>setName(e.target.value)} />
              <Input placeholder="Contract ID" value={contractId} onChange={(e)=>setContractId(e.target.value)} />
              <Input placeholder="Customer (optional)" value={customer} onChange={(e)=>setCustomer(e.target.value)} />
              <Input type="number" step="0.01" placeholder="Amount" value={amount} onChange={(e)=>setAmount(Number(e.target.value||0))} />
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                </SelectContent>
              </Select>
              <Select value={method} onValueChange={(v:any)=>setMethod(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="straight_line">Straight-line</SelectItem>
                  <SelectItem value="daily_prorata">Daily prorata</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
              <Input type="date" value={startDate} onChange={(e)=>setStartDate(e.target.value)} />
              <Input type="date" value={endDate} onChange={(e)=>setEndDate(e.target.value)} />
            </div>
            <div className="flex justify-end">
              <Button onClick={createSchedule} disabled={isFetching}>Create Schedule</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Schedules</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Start</TableHead>
                  <TableHead>End</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(items||[]).map((s:any)=> (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell>{new Intl.NumberFormat('en-US',{style:'currency',currency:s.currency||'USD'}).format(s.amount||0)}</TableCell>
                    <TableCell className="capitalize">{String(s.method).replace('_',' ')}</TableCell>
                    <TableCell>{s.startDate?format(new Date(s.startDate),'MMM dd, yyyy'):''}</TableCell>
                    <TableCell>{s.endDate?format(new Date(s.endDate),'MMM dd, yyyy'):''}</TableCell>
                    <TableCell>{s.createdAt?format(new Date(s.createdAt),'MMM dd, yyyy'):''}</TableCell>
                    <TableCell><Button variant="outline" size="sm" onClick={() => deleteSchedule(s.id)}>Delete</Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Run Recognition</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <Input type="date" value={periodStart} onChange={(e)=>setPeriodStart(e.target.value)} />
              <Input type="date" value={periodEnd} onChange={(e)=>setPeriodEnd(e.target.value)} />
              <div className="flex gap-2">
                <Button onClick={runRecognition}>Run</Button>
                <Button variant="outline" onClick={postRecognition} disabled={!revenueAccountId || !deferredRevenueAccountId}>Post</Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Select value={revenueAccountId} onValueChange={setRevenueAccountId}>
                <SelectTrigger><SelectValue placeholder="Revenue account" /></SelectTrigger>
                <SelectContent>
                  {accounts.map((a:any)=> (<SelectItem key={a.id} value={a.id}>{a.code} — {a.name}</SelectItem>))}
                </SelectContent>
              </Select>
              <Select value={deferredRevenueAccountId} onValueChange={setDeferredRevenueAccountId}>
                <SelectTrigger><SelectValue placeholder="Deferred revenue account" /></SelectTrigger>
                <SelectContent>
                  {accounts.map((a:any)=> (<SelectItem key={a.id} value={a.id}>{a.code} — {a.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  )
}


