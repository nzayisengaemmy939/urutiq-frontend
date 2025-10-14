"use client"

import React from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Label } from "./ui/label"
import { expenseApi, cardApi } from "@/lib/api/accounting"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { ExpenseMatchingModal } from "./expense-matching-modal"
import { AttachReceiptModal } from "./attach-receipt-modal"

export function CardExceptionsDashboard() {
  const qc = useQueryClient()
  const [reasonFilter, setReasonFilter] = React.useState<string>("all")
  const { data: exceptionsData, refetch } = useQuery({
    queryKey: ['card-exceptions', reasonFilter],
    queryFn: async () => await cardApi.getExceptions({ reason: reasonFilter === 'all' ? undefined : reasonFilter })
  })
  const exceptions = exceptionsData || []
  const [search, setSearch] = React.useState('')
  const [matchingOpen, setMatchingOpen] = React.useState(false)
  const [context, setContext] = React.useState<{ amount?: number; date?: string; description?: string } | null>(null)
  const [selectedExceptionId, setSelectedExceptionId] = React.useState<string | null>(null)
  const [bulkMatchOpen, setBulkMatchOpen] = React.useState(false)
  const [attachOpen, setAttachOpen] = React.useState(false)
  const [lastCreatedExpenseId, setLastCreatedExpenseId] = React.useState<string | null>(null)
  const [selected, setSelected] = React.useState<Record<string, boolean>>({})

  const dismiss = useMutation({
    mutationFn: async (id: string) => cardApi.dismiss(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['card-exceptions'] }); toast.success('Exception dismissed') },
    onError: (err: any) => toast.error(err?.message || 'Failed to dismiss exception')
  })

  const resolveCreate = useMutation({
    mutationFn: async (vars: { id: string; receiptDataUrl?: string }) => cardApi.resolveCreate(vars.id, { receiptDataUrl: vars.receiptDataUrl }),
    onSuccess: (res) => {
      try { setLastCreatedExpenseId(res.expenseId || null) } catch {}
      setAttachOpen(true)
      qc.invalidateQueries({ queryKey: ['card-exceptions'] })
      toast.success('Expense created from exception')
    },
    onError: (err: any) => toast.error(err?.message || 'Failed to create expense from exception')
  })

  const filtered = exceptions.filter((e: any) => !search || String(e.description || '').toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Card Exceptions</h2>
          <p className="text-sm text-muted-foreground">Unmatched card transactions awaiting resolution</p>
        </div>
        <div className="flex items-center gap-2">
          <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-64" />
          <Select value={reasonFilter} onValueChange={(v) => setReasonFilter(v)}>
            <SelectTrigger className="w-48"><SelectValue placeholder="Reason" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All reasons</SelectItem>
              <SelectItem value="unmatched">Unmatched</SelectItem>
              <SelectItem value="policy_violation">Policy violation</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => refetch()}>Reload</Button>
        </div>
      </div>

      <div className="border rounded-md overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted">
              <th className="p-2 w-8"><input type="checkbox" aria-label="select all" checked={filtered.length > 0 && filtered.every((e: any) => selected[e.id])} onChange={(e) => {
                const all: Record<string, boolean> = {}
                if (e.target.checked) filtered.forEach((x: any) => { all[x.id] = true })
                setSelected(all)
              }} /></th>
              <th className="text-left p-2">Date</th>
              <th className="text-left p-2">Description</th>
              <th className="text-left p-2">Reason</th>
              <th className="text-right p-2">Amount</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={4} className="p-4 text-center text-muted-foreground">No exceptions found</td></tr>
            )}
            {filtered.map((ex: any, idx: number) => (
              <tr key={idx} className="border-b">
                <td className="p-2 w-8"><input type="checkbox" checked={!!selected[ex.id]} onChange={(e) => setSelected(prev => ({ ...prev, [ex.id]: e.target.checked }))} /></td>
                <td className="p-2">{String(ex.date || '').slice(0,10)}</td>
                <td className="p-2">{ex.description}</td>
                <td className="p-2">
                  <span className={`px-2 py-0.5 rounded text-xs ${ex.reason === 'policy_violation' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>{ex.reason?.replace('_',' ')}</span>
                </td>
                <td className="p-2 text-right">${Number(ex.amount || 0).toLocaleString()}</td>
                <td className="p-2">
                  <div className="flex items-center gap-2 justify-end">
                    <InlineReceiptUpload onSubmit={(dataUrl) => resolveCreate.mutate({ id: ex.id, receiptDataUrl: dataUrl })} disabled={resolveCreate.isPending} />
                    <Button size="sm" variant="outline" onClick={() => { setContext({ amount: ex.amount, date: String(ex.date || '').slice(0,10), description: ex.description }); setSelectedExceptionId(ex.id); setMatchingOpen(true) }} disabled={resolveCreate.isPending || dismiss.isPending}>Match</Button>
                    <Button size="sm" variant="outline" onClick={() => dismiss.mutate(ex.id)} disabled={dismiss.isPending}>Dismiss</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">{Object.keys(selected).filter(id => selected[id]).length} selected</div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={dismiss.isPending || resolveCreate.isPending || Object.keys(selected).filter(id => selected[id]).length === 0}
            onClick={async () => {
              // optimistic update
              const ids = Object.keys(selected).filter(id => selected[id])
              const prev = exceptions
              // Filter client cache immediately
              qc.setQueryData(['card-exceptions', reasonFilter], (old: any) => (old || []).filter((e: any) => !ids.includes(e.id)))
              try {
                await Promise.all(ids.map(id => cardApi.dismiss(id)))
                toast.success('Selected exceptions dismissed')
              } catch (e: any) {
                toast.error(e?.message || 'Failed to dismiss some exceptions')
                // revert
                qc.setQueryData(['card-exceptions', reasonFilter], prev)
              } finally {
                setSelected({})
                refetch()
              }
            }}>Bulk Dismiss</Button>
          <Button variant="outline" size="sm" disabled={Object.keys(selected).filter(id => selected[id]).length === 0}
            onClick={() => setBulkMatchOpen(true)}>
            Bulk Match
          </Button>
        </div>
      </div>

      <ExpenseMatchingModal open={matchingOpen} onOpenChange={(v) => { setMatchingOpen(v); if (!v) { setSelectedExceptionId(null); refetch() } }} amount={context?.amount} date={context?.date} description={context?.description} exceptionId={selectedExceptionId || undefined} onMatched={() => qc.invalidateQueries({ queryKey: ['card-exceptions'] })} />
      <ExpenseMatchingModal open={bulkMatchOpen} onOpenChange={(v) => { setBulkMatchOpen(v); if (!v) refetch() }} amount={undefined} date={undefined} description={''} onSelectExpense={async (expenseId) => {
        const ids = Object.keys(selected).filter(id => selected[id])
        const prev = exceptions
        // Optimistic remove
        qc.setQueryData(['card-exceptions', reasonFilter], (old: any) => (old || []).filter((e: any) => !ids.includes(e.id)))
        try {
          await Promise.all(ids.map(id => cardApi.resolveMatch(id, expenseId)))
          toast.success('Selected exceptions matched')
        } catch (e: any) {
          toast.error(e?.message || 'Failed to match some exceptions')
          qc.setQueryData(['card-exceptions', reasonFilter], prev)
        } finally {
          setSelected({})
          setBulkMatchOpen(false)
          refetch()
        }
      }} />
      <AttachReceiptModal open={attachOpen} onOpenChange={(v) => { setAttachOpen(v); if (!v) load() }} expenseId={lastCreatedExpenseId} />
    </div>
  )
}

function InlineReceiptUpload({ onSubmit, disabled }: { onSubmit: (dataUrl: string) => void; disabled?: boolean }) {
  const [busy, setBusy] = React.useState(false)
  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setBusy(true)
    try {
      const reader = new FileReader()
      reader.onload = () => {
        const dataUrl = String(reader.result || '')
        onSubmit(dataUrl)
        setBusy(false)
      }
      reader.readAsDataURL(f)
    } catch {
      setBusy(false)
    }
  }
  return (
    <div className="inline-flex items-center gap-2">
      <label className="inline-flex items-center gap-2">
        <input type="file" accept="image/*,application/pdf" onChange={onFile} disabled={disabled || busy} style={{ display: 'none' }} />
        <Button size="sm" variant="outline" onClick={(e) => {
          const input = document.createElement('input')
          input.type = 'file'
          input.accept = 'image/*,application/pdf'
          input.onchange = onFile as any
          input.click()
        }} disabled={disabled || busy}>{busy ? 'Uploading…' : 'Attach & Create'}</Button>
      </label>
    </div>
  )
}


