"use client"

import React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Textarea } from "./ui/textarea"
import { expenseApi, cardApi } from "@/lib/api/accounting"
import { useMutation, useQueryClient } from "@tanstack/react-query"

type CardCsvImportProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CardCsvImportModal({ open, onOpenChange }: CardCsvImportProps) {
  const [file, setFile] = React.useState<File | null>(null)
  const [rows, setRows] = React.useState<any[]>([])
  const [headers, setHeaders] = React.useState<string[]>([])
  const [mapping, setMapping] = React.useState<{ date?: string; description?: string; amount?: string }>(() => ({ }))
  const [companyId, setCompanyId] = React.useState<string>("")
  const [categoryId, setCategoryId] = React.useState<string>("")
  const [log, setLog] = React.useState<string>("")
  const [loading, setLoading] = React.useState(false)
  const qc = useQueryClient()

  const parseCsv = async (fileObj: File) => {
    const text = await fileObj.text()
    const lines = text.split(/\r?\n/).filter(Boolean)
    if (lines.length === 0) return
    // naive CSV splitting with quotes handling (simple)
    const parseLine = (l: string) => {
      const out: string[] = []
      let cur = ''
      let inQuotes = false
      for (let i = 0; i < l.length; i++) {
        const ch = l[i]
        if (ch === '"') {
          if (inQuotes && l[i+1] === '"') { cur += '"'; i++ } else { inQuotes = !inQuotes }
        } else if (ch === ',' && !inQuotes) { out.push(cur); cur = '' } else { cur += ch }
      }
      out.push(cur)
      return out
    }
    const header = parseLine(lines[0]).map(h => h.trim())
    const data = lines.slice(1).map(parseLine)
    setHeaders(header)
    const rs = data.map(cols => Object.fromEntries(header.map((h, idx) => [h, cols[idx] ?? ''])))
    setRows(rs)
    setMapping({ date: header.find(h => /date/i.test(h)) || header[0], description: header.find(h => /desc|memo|merchant/i.test(h)) || header[1], amount: header.find(h => /amount|debit|credit/i.test(h)) || header[2] })
  }

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) { setFile(f); parseCsv(f) }
  }

  React.useEffect(() => {
    try {
      const c = localStorage.getItem('company_id') || localStorage.getItem('companyId') || localStorage.getItem('company')
      if (c) setCompanyId(c)
    } catch {}
  }, [])

  const importMutation = useMutation({
    mutationFn: async (payload: any[]) => cardApi.importTransactions(payload.map((r) => ({
      date: String(r.date || ''),
      description: String(r.description || ''),
      amount: Number(r.amount || 0),
      merchant: r.merchant,
      source: r.source,
    })), companyId),
    onSuccess: (res) => {
      setLog(`Imported ${res.created} rows. Unmatched are available in Exceptions.`)
      qc.invalidateQueries({ queryKey: ['card-exceptions'] })
    },
    onError: (err: any) => {
      setLog(`Import failed: ${err?.message || 'Unknown error'}`)
    },
    onSettled: () => setLoading(false)
  })

  const importRows = async () => {
    if (!companyId || !mapping.date || !mapping.description || !mapping.amount) return
    setLoading(true)
    const mapped = rows.map((r) => ({
      date: String(r[mapping.date!]),
      description: String(r[mapping.description!]),
      amount: parseFloat(String(r[mapping.amount!]).replace(/[^0-9.-]/g, '')),
      merchant: undefined,
      source: 'csv'
    }))
    importMutation.mutate(mapped as any)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Card Transactions (CSV)</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Company</Label>
              <Input value={companyId} onChange={(e) => setCompanyId(e.target.value)} placeholder="company id" />
            </div>
            <div>
              <Label>Default Category (optional)</Label>
              <Input value={categoryId} onChange={(e) => setCategoryId(e.target.value)} placeholder="category id or mapping" />
            </div>
          </div>
          <div>
            <Label>CSV File</Label>
            <Input type="file" accept="text/csv" onChange={onFile} />
          </div>
          {headers.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Date Column</Label>
                <Select value={mapping.date} onValueChange={(v) => setMapping(prev => ({ ...prev, date: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {headers.map(h => (<SelectItem key={h} value={h}>{h}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Description Column</Label>
                <Select value={mapping.description} onValueChange={(v) => setMapping(prev => ({ ...prev, description: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {headers.map(h => (<SelectItem key={h} value={h}>{h}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Amount Column</Label>
                <Select value={mapping.amount} onValueChange={(v) => setMapping(prev => ({ ...prev, amount: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {headers.map(h => (<SelectItem key={h} value={h}>{h}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          {rows.length > 0 && (
            <div className="border rounded">
              <div className="p-2 text-sm text-muted-foreground">Preview ({rows.length} rows)</div>
              <div className="max-h-64 overflow-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr>
                      {(headers || []).map(h => (<th key={h} className="p-2 text-left bg-muted">{h}</th>))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.slice(0,20).map((r, idx) => (
                      <tr key={idx} className="border-b">
                        {headers.map(h => (<td key={h} className="p-2">{r[h]}</td>))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
            <Button onClick={importRows} disabled={!rows.length || !companyId || loading}>{loading ? 'Importing…' : 'Import'}</Button>
          </div>
          {log && (
            <Textarea readOnly value={log} className="text-xs h-24" />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}


