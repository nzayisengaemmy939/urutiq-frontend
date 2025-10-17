import React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { useQuery } from "@tanstack/react-query"
import { expenseApi, companiesApi } from "../lib/api/accounting"

type ExpenseReportModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ExpenseReportModal({ open, onOpenChange }: ExpenseReportModalProps) {
  const [companyId, setCompanyId] = React.useState<string>("")
  const [start, setStart] = React.useState<string>(new Date(new Date().setDate(1)).toISOString().slice(0,10))
  const [end, setEnd] = React.useState<string>(new Date().toISOString().slice(0,10))
  const [status, setStatus] = React.useState<string>("all")
  const [downloading, setDownloading] = React.useState(false)

  React.useEffect(() => {
    try {
      const c = localStorage.getItem('company_id') || localStorage.getItem('companyId') || localStorage.getItem('company')
      if (c) setCompanyId(c)
    } catch {}
  }, [])

  const { data: companies } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => companiesApi.getCompanies()
  })

  const downloadCsv = async () => {
    setDownloading(true)
    try {
      const all = await expenseApi.getExpenses(companyId, status === 'all' ? undefined : status)
      const filtered = (all || []).filter((e: any) => {
        const d = (e.expenseDate || '').slice(0,10)
        return (!start || d >= start) && (!end || d <= end)
      })
      const header = ['Date','Description','Category','Status','Amount']
      const rows = filtered.map((e: any) => [
        e.expenseDate?.slice(0,10),
        (e.description || '').replaceAll('"','""'),
        e.category?.name || '',
        e.status || '',
        String(e.totalAmount ?? e.amount ?? 0)
      ])
      const lines = [header.join(','), ...rows.map(r => r.map(v => /,|"/.test(v) ? `"${v}"` : v).join(','))]
      const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `expense_report_${start}_to_${end}.csv`
      a.click()
      setTimeout(() => URL.revokeObjectURL(url), 30000)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Expense Report</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Company</Label>
            <Select value={companyId} onValueChange={setCompanyId}>
              <SelectTrigger>
                <SelectValue placeholder="Select company" />
              </SelectTrigger>
              <SelectContent>
                {(Array.isArray(companies) ? companies : []).map((c: any) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Start date</Label>
              <Input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
            </div>
            <div>
              <Label>End date</Label>
              <Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
            </div>
          </div>
          <div>
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={downloading}>Close</Button>
            <Button onClick={downloadCsv} disabled={!companyId || downloading}>{downloading ? 'Preparing...' : 'Export CSV'}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}


