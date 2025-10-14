import React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { useMutation, useQuery } from "@tanstack/react-query"
import { expenseApi, cardApi } from "../lib/api/accounting"
import { toast } from "sonner"

type ExpenseMatchingModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  amount?: number
  date?: string
  description?: string
  exceptionId?: string
  onMatched?: () => void
  onSelectExpense?: (expenseId: string) => void
}

export function ExpenseMatchingModal({ open, onOpenChange, amount, date, description, exceptionId, onMatched, onSelectExpense }: ExpenseMatchingModalProps) {
  const [search, setSearch] = React.useState<string>(description || "")
  const start = React.useMemo(() => (date ? new Date(new Date(date).setDate(new Date(date).getDate() - 7)).toISOString().slice(0,10) : new Date(new Date().setDate(1)).toISOString().slice(0,10)), [date])
  const end = React.useMemo(() => (date ? new Date(new Date(date).setDate(new Date(date).getDate() + 7)).toISOString().slice(0,10) : new Date().toISOString().slice(0,10)), [date])

  const { data: expenses } = useQuery({
    queryKey: ['expenses-for-matching', start, end, amount],
    enabled: open,
    queryFn: async () => expenseApi.getExpenses(undefined, undefined, undefined)
  })

  const resolveMatch = useMutation({
    mutationFn: async ({ exceptionId, expenseId }: { exceptionId: string; expenseId: string }) => cardApi.resolveMatch(exceptionId, expenseId),
    onSuccess: () => {
      toast.success('Exception matched to expense')
      if (onMatched) onMatched()
      onOpenChange(false)
    },
    onError: (err: any) => toast.error(err?.message || 'Failed to match exception')
  })

  const candidates = React.useMemo(() => {
    const list = (Array.isArray(expenses) ? expenses : (expenses as any)?.items || (expenses as any)?.data || []) as any[]
    return list.filter((e) => {
      const matchesText = !search || (e.description || '').toLowerCase().includes(search.toLowerCase())
      const amt = Number(e.totalAmount ?? e.amount ?? 0)
      const matchesAmount = amount ? Math.abs(amt - (amount || 0)) < 0.01 : true
      const d = String(e.expenseDate || '').slice(0,10)
      const inRange = (!start || d >= start) && (!end || d <= end)
      return matchesText && matchesAmount && inRange
    }).slice(0, 50)
  }, [expenses, search, amount, start, end])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Match Expense to Bank Transaction</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Amount</Label>
              <Input value={amount != null ? amount : ''} readOnly />
            </div>
            <div>
              <Label>Date</Label>
              <Input value={date || ''} readOnly />
            </div>
            <div>
              <Label>Search</Label>
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Description filter" />
            </div>
          </div>
          <div className="border rounded-md max-h-72 overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted">
                  <th className="text-left p-2">Date</th>
                  <th className="text-left p-2">Description</th>
                  <th className="text-right p-2">Amount</th>
                  <th className="p-2" />
                </tr>
              </thead>
              <tbody>
                {candidates.map((e: any) => {
                  const amt = Number(e.totalAmount ?? e.amount ?? 0)
                  return (
                    <tr key={e.id} className="border-b">
                      <td className="p-2">{String(e.expenseDate || '').slice(0,10)}</td>
                      <td className="p-2">{e.description}</td>
                      <td className="p-2 text-right">${Number(amt).toLocaleString()}</td>
                      <td className="p-2 text-right">
                        {exceptionId ? (
                          <Button size="sm" variant="outline" onClick={() => resolveMatch.mutate({ exceptionId, expenseId: e.id })} disabled={resolveMatch.isPending}>Match</Button>
                        ) : (
                          <Button size="sm" variant="outline" onClick={() => { if (onSelectExpense) onSelectExpense(e.id); onOpenChange(false) }}>Select</Button>
                        )}
                      </td>
                    </tr>
                  )
                })}
                {candidates.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-muted-foreground">No candidates found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end"><Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button></div>
        </div>
      </DialogContent>
    </Dialog>
  )
}


