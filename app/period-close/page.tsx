'use client'

import { useEffect, useState } from 'react'
import { PageLayout } from '@/components/page-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { periodCloseApi } from '@/lib/api/accounting'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function PeriodClosePage() {
  const [companyId, setCompanyId] = useState<string>(() => typeof window !== 'undefined' ? (localStorage.getItem('company_id') || 'seed-company-1') : '')
  const [periods, setPeriods] = useState<Array<{ period: string; status: 'open'|'locked'|'closing'|'closed' }>>([])
  const [selectedPeriod, setSelectedPeriod] = useState<string>('')
  const [checklist, setChecklist] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fxPreview, setFxPreview] = useState<any|null>(null)
  const [fxHistory, setFxHistory] = useState<any|null>(null)
  const [fxGainAccountId, setFxGainAccountId] = useState('')
  const [fxLossAccountId, setFxLossAccountId] = useState('')
  const [fxRevaluedAccountId, setFxRevaluedAccountId] = useState('')
  const [accounts, setAccounts] = useState<any[]>([])
  const [runs, setRuns] = useState<any[]>([])

  useEffect(() => {
    if (!companyId) return
    loadPeriods()
  }, [companyId])

  async function loadPeriods() {
    setLoading(true)
    setError(null)
    try {
      const res = await periodCloseApi.listPeriods(companyId)
      const data = res?.data || []
      setPeriods(data)
      if (data[0]?.period) {
        setSelectedPeriod(prev => prev || data[0].period)
        loadChecklist(data[0].period)
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to load periods')
    } finally {
      setLoading(false)
    }
  }

  async function loadChecklist(period: string) {
    try {
      const res = await periodCloseApi.getChecklist(companyId, period)
      setChecklist(res?.data || [])
    } catch (e) {
      setChecklist([])
    }
  }

  useEffect(() => {
    async function loadAccounts() {
      if (!companyId) return
      const res = await fetch(`/api/accounts?companyId=${companyId}`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')||''}` } })
      const data = await res.json()
      setAccounts(data?.flat || [])
    }
    loadAccounts()
  }, [companyId])

  async function previewFx() {
    if (!selectedPeriod) return
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/period-close/${companyId}/${selectedPeriod}/fx-reval/preview`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
        'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo',
      },
      body: JSON.stringify({ baseCurrency: 'USD' })
    })
    const data = await res.json()
    setFxPreview(data?.data || null)
  }

  async function postFx() {
    if (!selectedPeriod) return
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/period-close/${companyId}/${selectedPeriod}/fx-reval/post`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
        'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo',
      },
      body: JSON.stringify({ baseCurrency: 'USD', entries: fxPreview?.entries })
    })
    await res.json()
    await loadFxHistory()
  }

  async function postFxJournal() {
    if (!selectedPeriod || !fxPreview?.entries?.length) return
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/period-close/${companyId}/${selectedPeriod}/fx-reval/post-journal`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
        'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo',
      },
      body: JSON.stringify({ baseCurrency: 'USD', entries: fxPreview.entries, accounts: { fxGainAccountId, fxLossAccountId, revaluedAccountId: fxRevaluedAccountId } })
    })
    const data = await res.json()
    alert(`FX Reval journal created: ${data?.data?.created?.id || 'n/a'}`)
  }

  async function loadFxHistory() {
    if (!selectedPeriod) return
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/period-close/${companyId}/${selectedPeriod}/fx-reval/history`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
        'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo',
      }
    })
    const data = await res.json()
    setFxHistory(data?.data || null)
  }

  async function loadRuns() {
    if (!selectedPeriod) return
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/period-close/${companyId}/${selectedPeriod}/runs`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
        'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo',
      }
    })
    const data = await res.json()
    setRuns(data?.data || [])
  }

  async function toggleLock(lock: boolean) {
    setLoading(true)
    try {
      if (lock) await periodCloseApi.lock(companyId, selectedPeriod)
      else await periodCloseApi.unlock(companyId, selectedPeriod)
      await loadPeriods()
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageLayout
      title="Period Close"
      description="Lock periods, manage close checklists, and run end-of-period processes"
      showBreadcrumbs
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Context</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Company</span>
              <Input className="h-9 w-56" value={companyId} onChange={(e) => { setCompanyId(e.target.value); if (typeof window !== 'undefined') localStorage.setItem('company_id', e.target.value) }} />
            </div>
            <Button variant="outline" onClick={loadPeriods} disabled={loading}>Refresh</Button>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Periods</CardTitle>
            </CardHeader>
            <CardContent>
              {error && <div className="text-sm text-destructive mb-2">{error}</div>}
              <div className="space-y-2">
                {periods.map(p => (
                  <button key={p.period} className={`w-full flex items-center justify-between p-3 border rounded-md ${selectedPeriod === p.period ? 'bg-muted' : ''}`} onClick={() => { setSelectedPeriod(p.period); loadChecklist(p.period) }}>
                    <span className="font-medium">{p.period}</span>
                    <Badge variant={p.status === 'locked' ? 'secondary' : 'outline'} className="capitalize">{p.status}</Badge>
                  </button>
                ))}
                {periods.length === 0 && (
                  <div className="text-sm text-muted-foreground">No periods found</div>
                )}
              </div>
              <div className="flex gap-2 mt-3">
                <Button onClick={() => toggleLock(true)} disabled={!selectedPeriod || loading}>Lock</Button>
                <Button variant="outline" onClick={() => toggleLock(false)} disabled={!selectedPeriod || loading}>Unlock</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Close Checklist {selectedPeriod && <span className="text-muted-foreground">({selectedPeriod})</span>}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {checklist.map((i: any) => (
                  <div key={i.id} className="flex items-center justify-between p-3 border rounded-md">
                    <div>
                      <div className="font-medium">{i.title}</div>
                      {i.description && <div className="text-sm text-muted-foreground">{i.description}</div>}
                    </div>
                    <Button size="sm" variant={i.completed ? 'secondary' : 'outline'} onClick={async () => {
                      await periodCloseApi.updateChecklist(companyId, selectedPeriod, i.id, { completed: !i.completed })
                      loadChecklist(selectedPeriod)
                    }}>{i.completed ? 'Completed' : 'Mark Done'}</Button>
                  </div>
                ))}
                {checklist.length === 0 && (
                  <div className="text-sm text-muted-foreground">No checklist items</div>
                )}
              </div>
              <div className="flex gap-2 mt-3">
                <Button onClick={async () => { await periodCloseApi.runRecurring(companyId, selectedPeriod); }}>Run Recurring</Button>
                <Button variant="outline" onClick={async () => { await periodCloseApi.runAllocations(companyId, selectedPeriod); }}>Run Allocations</Button>
                <Button variant="outline" onClick={previewFx}>Preview FX</Button>
                <Button variant="outline" onClick={postFx} disabled={!fxPreview?.entries?.length}>Post FX</Button>
                <Button variant="outline" onClick={loadFxHistory}>History</Button>
                <Button variant="outline" onClick={loadRuns}>Run Log</Button>
              </div>
              {fxPreview && (
                <div className="mt-4 border rounded-md p-3">
                  <div className="font-medium mb-2">FX Revaluation Preview</div>
                  <pre className="text-xs whitespace-pre-wrap break-words">{JSON.stringify(fxPreview, null, 2)}</pre>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    <Select value={fxGainAccountId} onValueChange={setFxGainAccountId}>
                      <SelectTrigger><SelectValue placeholder="FX Gain Account" /></SelectTrigger>
                      <SelectContent>
                        {accounts.map((a:any)=> (
                          <SelectItem key={a.id} value={a.id}>{a.code} — {a.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={fxLossAccountId} onValueChange={setFxLossAccountId}>
                      <SelectTrigger><SelectValue placeholder="FX Loss Account" /></SelectTrigger>
                      <SelectContent>
                        {accounts.map((a:any)=> (
                          <SelectItem key={a.id} value={a.id}>{a.code} — {a.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={fxRevaluedAccountId} onValueChange={setFxRevaluedAccountId}>
                      <SelectTrigger><SelectValue placeholder="Revalued Account" /></SelectTrigger>
                      <SelectContent>
                        {accounts.map((a:any)=> (
                          <SelectItem key={a.id} value={a.id}>{a.code} — {a.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end mt-2">
                    <Button size="sm" onClick={postFxJournal} disabled={!fxGainAccountId || !fxLossAccountId || !fxRevaluedAccountId}>Post FX Journal</Button>
                  </div>
                </div>
              )}
              {fxHistory && (
                <div className="mt-4 border rounded-md p-3">
                  <div className="font-medium mb-2">Last FX Revaluation Posted</div>
                  <pre className="text-xs whitespace-pre-wrap break-words">{JSON.stringify(fxHistory, null, 2)}</pre>
                </div>
              )}
              {runs?.length > 0 && (
                <div className="mt-4 border rounded-md p-3">
                  <div className="font-medium mb-2">Run History</div>
                  <div className="space-y-2 text-xs">
                    {runs.map((r:any)=> (
                      <div key={r.id} className="flex items-center justify-between border rounded p-2">
                        <div>
                          <div className="font-medium">{r.type}</div>
                          <div className="text-muted-foreground">{r.at}</div>
                        </div>
                        <Button size="sm" variant="outline" onClick={async ()=>{
                          const API = process.env.NEXT_PUBLIC_API_URL || ''
                          await fetch(`${API}/api/period-close/${companyId}/${selectedPeriod}/rollback`, { method: 'POST', headers: { 'Content-Type':'application/json','Authorization': `Bearer ${localStorage.getItem('auth_token')||''}`, 'x-tenant-id': localStorage.getItem('tenant_id')||'tenant_demo' }, body: JSON.stringify({ runId: r.id }) })
                          await loadRuns()
                        }}>Rollback</Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  )
}


