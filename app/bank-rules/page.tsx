'use client'

import { useEffect, useState } from 'react'
import { PageLayout } from '@/components/page-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { bankRulesApi } from '@/lib/api/accounting'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type Rule = {
  id: string
  companyId: string
  name: string
  conditions: Array<{ field: string; operator: string; value: string }>
  actions: Array<{ type: string; value?: string }>
  order: number
  isActive: boolean
}

export default function BankRulesPage() {
  const [companyId, setCompanyId] = useState<string>(() => typeof window !== 'undefined' ? (localStorage.getItem('company_id') || 'seed-company-1') : '')
  const [rules, setRules] = useState<Rule[]>([])
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('New Rule')
  const [conditions, setConditions] = useState('[{"field":"description","operator":"contains","value":"uber"}]')
  const [actions, setActions] = useState('[{"type":"setCategory","value":"Travel"}]')
  const [error, setError] = useState<string | null>(null)
  const [csvText, setCsvText] = useState('')
  const [delimiter, setDelimiter] = useState(',')
  const [hasHeader, setHasHeader] = useState(true)
  const [parsedRows, setParsedRows] = useState<any[]>([])
  const [fieldMap, setFieldMap] = useState<Record<string,string>>({ date: 'date', amount: 'amount', description: 'description' })
  const [previewResult, setPreviewResult] = useState<any|null>(null)
  const [inserting, setInserting] = useState(false)
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [editedCategory, setEditedCategory] = useState<Record<number, string>>({})
  const [applyTransfers, setApplyTransfers] = useState(true)
  const [confirmPairs, setConfirmPairs] = useState<any[]>([])
  const [fromAccountId, setFromAccountId] = useState('')
  const [toAccountId, setToAccountId] = useState('')
  const [accounts, setAccounts] = useState<any[]>([])

  useEffect(() => { if (companyId) load() }, [companyId])
  useEffect(() => { (async ()=>{
    const res = await fetch(`/api/accounts?companyId=${companyId}`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')||''}` } })
    const data = await res.json()
    const list = data?.flat || []
    setAccounts(list)
    // Auto-suggest defaults for From/To accounts using first two bank/cash accounts
    if (!fromAccountId || !toAccountId) {
      const bankish = list.filter((a:any)=>{
        const n = `${a.code} ${a.name}`.toLowerCase()
        const t = (a.type?.name || '').toLowerCase()
        return /bank|cash|checking|savings/.test(n) || /bank|cash/.test(t)
      })
      if (!fromAccountId && bankish[0]) setFromAccountId(bankish[0].id)
      if (!toAccountId && bankish[1]) setToAccountId(bankish[1].id)
    }
  })() }, [companyId])

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const res = await bankRulesApi.list(companyId)
      setRules(res?.data || [])
    } catch (e: any) {
      setError(e?.message || 'Failed to load rules')
    } finally {
      setLoading(false)
    }
  }

  async function addRule() {
    try {
      const rule: Rule = {
        id: `rule_${Date.now()}`,
        companyId,
        name,
        conditions: JSON.parse(conditions),
        actions: JSON.parse(actions),
        order: (rules[rules.length - 1]?.order || 0) + 1,
        isActive: true,
      }
      await bankRulesApi.upsert(companyId, rule as any)
      setName('New Rule')
      load()
    } catch (e: any) {
      setError(e?.message || 'Failed to add rule')
    }
  }

  async function seed() {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/bank-rules/${companyId}/seed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
          'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo',
        }
      })
      load()
    } catch (e: any) {
      setError(e?.message || 'Failed to seed rules')
    }
  }

  function parseCsv(text: string) {
    const rows = text.split(/\r?\n/).filter(Boolean).map(line => line.split(delimiter))
    if (rows.length === 0) return []
    let headers: string[] = []
    let dataRows = rows
    if (hasHeader) {
      headers = rows[0].map((h) => h.trim())
      dataRows = rows.slice(1)
    } else {
      headers = rows[0].map((_, i) => `col${i+1}`)
    }
    return dataRows.map(cols => Object.fromEntries(cols.map((v, i) => [headers[i], v.trim()])))
  }

  function onParseClick() {
    const parsed = parseCsv(csvText)
    setParsedRows(parsed)
    setPreviewResult(null)
    setSelected(new Set(parsed.map((_, i) => i)))
    setEditedCategory({})
  }

  async function evaluateRules() {
    if (parsedRows.length === 0) return
    const API = process.env.NEXT_PUBLIC_API_URL || ''
    // Map rows to expected transaction shape
    const tx = parsedRows.map((r) => ({
      date: r[fieldMap.date] || r.date || r.Date,
      amount: Number(r[fieldMap.amount] || r.amount || r.Amount || 0),
      description: r[fieldMap.description] || r.description || r.Details || '',
    }))
    const res = await fetch(`${API}/api/bank-rules/${companyId}/evaluate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
        'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo',
      },
      body: JSON.stringify({ transactions: tx })
    })
    const data = await res.json()
    const result = data?.data || null
    setPreviewResult(result)
    // Pre-fill editable categories from preview if present
    const map: Record<number,string> = {}
    const arr = (result?.results || result?.items || result || []) as any[]
    arr.forEach((it, idx) => {
      const cat = it?.category || ''
      if (cat) map[idx] = cat
    })
    setEditedCategory(map)
    // Build default confirm pairs from transfers
    const pairs = (result?.transfers || []).map((p:any, idx:number) => ({
      i: p.i, j: p.j, amount: Math.abs(Number((parsedRows[p.i]?.[fieldMap.amount] || parsedRows[p.j]?.[fieldMap.amount] || 0))),
      date: parsedRows[p.i]?.[fieldMap.date] || parsedRows[p.j]?.[fieldMap.date] || new Date().toISOString().slice(0,10),
      fromAccountId: fromAccountId, toAccountId: toAccountId, memo: 'Matched transfer'
    }))
    setConfirmPairs(pairs)
  }

  async function insertTransactions() {
    if (!parsedRows.length) return
    setInserting(true)
    try {
      const API = process.env.NEXT_PUBLIC_API_URL || ''
      const rowsToInsert = parsedRows.map((r, i) => ({ row: r, idx: i })).filter(({ idx }) => selected.has(idx))
      const transferPairs = new Set<number>()
      if (applyTransfers && previewResult?.transfers?.length) {
        for (const p of previewResult.transfers) {
          transferPairs.add(p.i); transferPairs.add(p.j)
        }
      }
      for (const { row: r, idx } of rowsToInsert) {
        const date = r[fieldMap.date] || r.date || r.Date
        const amount = Number(r[fieldMap.amount] || r.amount || r.Amount || 0)
        const currency = 'USD'
        const isXfer = transferPairs.has(idx)
        const category = isXfer ? 'Transfer' : editedCategory[idx]
        const transactionType = isXfer ? 'transfer' : (amount >= 0 ? 'deposit' : 'withdrawal')
        await fetch(`${API}/api/transactions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
            'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo',
          },
          body: JSON.stringify({ transactionType, amount: Math.abs(amount), currency, transactionDate: date, status: 'posted', companyId, memo: (r[fieldMap.description] || r.description || r.Details || ''), category })
        })
      }
      setCsvText('')
      setParsedRows([])
      setPreviewResult(null)
      setSelected(new Set())
      alert('Transactions inserted')
    } finally {
      setInserting(false)
    }
  }

  async function toggleActive(r: Rule) {
    await bankRulesApi.upsert(companyId, { ...r, isActive: !r.isActive })
    load()
  }

  async function removeRule(id: string) {
    await bankRulesApi.remove(companyId, id)
    load()
  }

  return (
    <PageLayout title="Bank Rules" description="Auto-categorize bank transactions and detect transfers" showBreadcrumbs>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>New Rule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Company</span>
              <Input className="h-9 w-56" value={companyId} onChange={(e) => { setCompanyId(e.target.value); if (typeof window !== 'undefined') localStorage.setItem('company_id', e.target.value) }} />
            </div>
            <Input placeholder="Rule name" value={name} onChange={(e) => setName(e.target.value)} />
            <div>
              <div className="text-xs text-muted-foreground mb-1">Conditions (JSON array)</div>
              <Textarea rows={3} value={conditions} onChange={(e) => setConditions(e.target.value)} />
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Actions (JSON array)</div>
              <Textarea rows={3} value={actions} onChange={(e) => setActions(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <Button onClick={addRule} disabled={loading}>Add Rule</Button>
              <Button variant="outline" onClick={load} disabled={loading}>Refresh</Button>
              <Button variant="outline" onClick={seed} disabled={loading}>Seed Defaults</Button>
            </div>
            {error && <div className="text-sm text-destructive">{error}</div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Statement Import (CSV)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Delimiter</span>
              <Input className="w-16" value={delimiter} onChange={(e)=>setDelimiter(e.target.value)} />
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <input type="checkbox" checked={hasHeader} onChange={(e)=>setHasHeader(e.target.checked)} /> Has header
              </label>
            </div>
            <Textarea rows={6} placeholder="Paste CSV here" value={csvText} onChange={(e)=>setCsvText(e.target.value)} />
            <div className="grid grid-cols-3 gap-2">
              <div>
                <div className="text-xs mb-1">Date column</div>
                <Input value={fieldMap.date} onChange={(e)=>setFieldMap({...fieldMap, date: e.target.value})} />
              </div>
              <div>
                <div className="text-xs mb-1">Amount column</div>
                <Input value={fieldMap.amount} onChange={(e)=>setFieldMap({...fieldMap, amount: e.target.value})} />
              </div>
              <div>
                <div className="text-xs mb-1">Description column</div>
                <Input value={fieldMap.description} onChange={(e)=>setFieldMap({...fieldMap, description: e.target.value})} />
              </div>
            </div>
            <div className="flex gap-2 items-center">
              <Button onClick={onParseClick}>Parse</Button>
              <Button variant="outline" onClick={evaluateRules} disabled={parsedRows.length === 0}>Preview Rules</Button>
              <Button variant="outline" onClick={insertTransactions} disabled={parsedRows.length === 0 || inserting}>{inserting ? 'Inserting…' : 'Insert'}</Button>
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                <input type="checkbox" checked={applyTransfers} onChange={(e)=>setApplyTransfers(e.target.checked)} /> Apply transfer pairing
              </label>
            </div>
            {parsedRows.length > 0 && (
              <div className="text-xs text-muted-foreground">Parsed {parsedRows.length} rows • Selected {selected.size}</div>
            )}
            {previewResult && (
              <div className="mt-3 border rounded-md p-3">
                <div className="font-medium mb-2">Preview Categorization</div>
                <div className="text-xs text-muted-foreground mb-2">Transfers detected: {previewResult.transfers?.length || 0}</div>
                <pre className="text-xs whitespace-pre-wrap break-words">{JSON.stringify(previewResult.updated || previewResult, null, 2)}</pre>
              </div>
            )}
            {parsedRows.length > 0 && (
              <div className="mt-3 border rounded-md p-3 overflow-auto">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium">Review Rows</div>
                  <div className="flex items-center gap-2 text-xs">
                    <Button variant="outline" size="sm" onClick={() => setSelected(new Set(parsedRows.map((_, i) => i)))}>Select All</Button>
                    <Button variant="outline" size="sm" onClick={() => setSelected(new Set())}>Clear</Button>
                  </div>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="p-2">Sel</th>
                      <th className="p-2">Date</th>
                      <th className="p-2">Amount</th>
                      <th className="p-2">Description</th>
                      <th className="p-2">Category</th>
                      <th className="p-2">Transfer?</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedRows.slice(0, 200).map((r, i) => {
                      const date = r[fieldMap.date] || r.date || r.Date || ''
                      const amount = r[fieldMap.amount] || r.amount || r.Amount || ''
                      const desc = r[fieldMap.description] || r.description || r.Details || ''
                      const suggested = editedCategory[i] ?? (previewResult?.results?.[i]?.category || previewResult?.items?.[i]?.category || '')
                      const checked = selected.has(i)
                      const isXfer = !!(previewResult?.transfers || []).find((p:any)=>p.i===i||p.j===i)
                      return (
                        <tr key={i} className="border-b">
                          <td className="p-2"><input type="checkbox" checked={checked} onChange={(e) => {
                            setSelected(prev => {
                              const next = new Set(prev)
                              if (e.target.checked) next.add(i); else next.delete(i)
                              return next
                            })
                          }} /></td>
                          <td className="p-2 whitespace-nowrap">{date}</td>
                          <td className="p-2 whitespace-nowrap">{amount}</td>
                          <td className="p-2">{desc}</td>
                          <td className="p-2">
                            <Input value={suggested}
                              onChange={(e)=> setEditedCategory(prev => ({ ...prev, [i]: e.target.value }))}
                              placeholder="Category" />
                          </td>
                          <td className="p-2 text-xs">{isXfer ? 'Yes' : ''}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
                {parsedRows.length > 200 && (
                  <div className="text-xs text-muted-foreground mt-2">Showing first 200 rows…</div>
                )}
              </div>
            )}

            {confirmPairs.length > 0 && (
              <div className="mt-3 border rounded-md p-3">
                <div className="font-medium mb-2">Confirm Transfers</div>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-2 mb-2 text-sm">
                  <div className="text-muted-foreground">Default From</div>
                  <Select value={fromAccountId} onValueChange={setFromAccountId}>
                    <SelectTrigger><SelectValue placeholder="From account" /></SelectTrigger>
                    <SelectContent>
                      {accounts.map((a:any)=> (<SelectItem key={a.id} value={a.id}>{a.code} — {a.name}</SelectItem>))}
                    </SelectContent>
                  </Select>
                  <div className="text-muted-foreground">Default To</div>
                  <Select value={toAccountId} onValueChange={setToAccountId}>
                    <SelectTrigger><SelectValue placeholder="To account" /></SelectTrigger>
                    <SelectContent>
                      {accounts.map((a:any)=> (<SelectItem key={a.id} value={a.id}>{a.code} — {a.name}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="p-2">Amount</th>
                      <th className="p-2">Date</th>
                      <th className="p-2">From</th>
                      <th className="p-2">To</th>
                      <th className="p-2">Memo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {confirmPairs.map((p:any, idx:number)=> (
                      <tr key={idx} className="border-b">
                        <td className="p-2">{new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(p.amount||0)}</td>
                        <td className="p-2"><Input value={p.date} onChange={(e)=>setConfirmPairs(prev => prev.map((x,i)=> i===idx?{...x, date:e.target.value}:x))} /></td>
                        <td className="p-2">
                          <Select value={p.fromAccountId || fromAccountId} onValueChange={(v)=>setConfirmPairs(prev => prev.map((x,i)=> i===idx?{...x, fromAccountId:v}:x))}>
                            <SelectTrigger><SelectValue placeholder="From" /></SelectTrigger>
                            <SelectContent>
                              {accounts.map((a:any)=> (<SelectItem key={a.id} value={a.id}>{a.code} — {a.name}</SelectItem>))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="p-2">
                          <Select value={p.toAccountId || toAccountId} onValueChange={(v)=>setConfirmPairs(prev => prev.map((x,i)=> i===idx?{...x, toAccountId:v}:x))}>
                            <SelectTrigger><SelectValue placeholder="To" /></SelectTrigger>
                            <SelectContent>
                              {accounts.map((a:any)=> (<SelectItem key={a.id} value={a.id}>{a.code} — {a.name}</SelectItem>))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="p-2"><Input value={p.memo} onChange={(e)=>setConfirmPairs(prev => prev.map((x,i)=> i===idx?{...x, memo:e.target.value}:x))} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="flex justify-end mt-2">
                  <Button variant="outline" onClick={async ()=>{
                    const API = process.env.NEXT_PUBLIC_API_URL || ''
                    // Fill defaults
                    const pairs = confirmPairs.map(p => ({ ...p, fromAccountId: p.fromAccountId || fromAccountId, toAccountId: p.toAccountId || toAccountId }))
                    const res = await fetch(`${API}/api/bank-rules/${companyId}/transfers/confirm`, { method:'POST', headers:{ 'Content-Type':'application/json','Authorization': `Bearer ${localStorage.getItem('auth_token')||''}`, 'x-tenant-id': localStorage.getItem('tenant_id')||'tenant_demo' }, body: JSON.stringify({ pairs }) })
                    const data = await res.json()
                    alert(`Created ${data?.createdCount||0} transfer postings`)
                  }}>Create matched transfer</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Existing Rules</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {rules.map(r => (
              <div key={r.id} className="flex items-center justify-between p-3 border rounded-md">
                <div>
                  <div className="font-medium">{r.name}</div>
                  <div className="text-xs text-muted-foreground">order #{r.order}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={r.isActive ? 'default' : 'secondary'}>{r.isActive ? 'Active' : 'Inactive'}</Badge>
                  <Button size="sm" variant="outline" onClick={() => toggleActive(r)}>{r.isActive ? 'Disable' : 'Enable'}</Button>
                  <Button size="sm" variant="outline" onClick={() => removeRule(r.id)}>Delete</Button>
                </div>
              </div>
            ))}
            {rules.length === 0 && (
              <div className="text-sm text-muted-foreground">No rules</div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  )
}


