import React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { useMutation } from "@tanstack/react-query"
import { expenseApi } from "../lib/api/accounting"

type ReimburseExpenseModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  expenseId: string | null
  defaultAmount?: number
}

export function ReimburseExpenseModal({ open, onOpenChange, expenseId, defaultAmount }: ReimburseExpenseModalProps) {
  const [method, setMethod] = React.useState<string>("bank_transfer")
  const [paidAmount, setPaidAmount] = React.useState<string>(defaultAmount != null ? String(defaultAmount) : "")
  const [paidDate, setPaidDate] = React.useState<string>(new Date().toISOString().slice(0,10))
  const [reference, setReference] = React.useState<string>("")

  React.useEffect(() => {
    if (defaultAmount != null) setPaidAmount(String(defaultAmount))
  }, [defaultAmount])

  const reimburseMutation = useMutation({
    mutationFn: async () => {
      if (!expenseId) return
      const amt = parseFloat(paidAmount || "0")
      await expenseApi.updateExpense(expenseId, { status: 'paid', totalAmount: amt, description: reference ? `Reimbursed: ${reference}` : undefined } as any)
    },
    onSuccess: () => onOpenChange(false)
  })

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!reimburseMutation.isPending) onOpenChange(v) }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Reimburse Expense</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Payment Method</Label>
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="mobile_money">Mobile Money</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Amount</Label>
              <Input type="number" step="0.01" value={paidAmount} onChange={(e) => setPaidAmount(e.target.value)} />
            </div>
            <div>
              <Label>Date</Label>
              <Input type="date" value={paidDate} onChange={(e) => setPaidDate(e.target.value)} />
            </div>
          </div>
          <div>
            <Label>Reference (optional)</Label>
            <Input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="e.g., TXN-12345" />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={reimburseMutation.isPending}>Cancel</Button>
            <Button onClick={() => reimburseMutation.mutate()} disabled={!expenseId || !paidAmount || reimburseMutation.isPending}>
              {reimburseMutation.isPending ? 'Processing...' : 'Mark as Paid'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}


