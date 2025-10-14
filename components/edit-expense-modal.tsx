"use client"

import React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Textarea } from "./ui/textarea"
import { useMutation, useQuery } from "@tanstack/react-query"
import { expenseApi } from "@/lib/api/accounting"

type EditExpenseModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  expense: any | null
}

export function EditExpenseModal({ open, onOpenChange, expense }: EditExpenseModalProps) {
  const [description, setDescription] = React.useState<string>("")
  const [amount, setAmount] = React.useState<string>("")
  const [date, setDate] = React.useState<string>("")
  const [department, setDepartment] = React.useState<string>("")
  const [project, setProject] = React.useState<string>("")
  const [categoryId, setCategoryId] = React.useState<string>("")

  const { data: categories } = useQuery({
    queryKey: ['expense-categories'],
    queryFn: async () => expenseApi.getExpenseCategories()
  })

  React.useEffect(() => {
    if (expense) {
      setDescription(expense.description || '')
      setAmount(String(expense.totalAmount ?? expense.amount ?? ''))
      setDate(String(expense.expenseDate || '').slice(0,10))
      setDepartment(String(expense.department || ''))
      setProject(String(expense.project || ''))
      setCategoryId(String(expense.categoryId || expense.category?.id || ''))
    }
  }, [expense])

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!expense) return
      const amt = parseFloat(amount || '0')
      await expenseApi.updateExpense(expense.id, {
        description,
        expenseDate: date,
        department: department || undefined,
        project: project || undefined,
        categoryId: categoryId || undefined,
        totalAmount: isFinite(amt) ? amt : undefined,
      } as any)
    },
    onSuccess: () => onOpenChange(false)
  })

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!updateMutation.isPending) onOpenChange(v) }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Expense</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Amount</Label>
              <Input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
            <div>
              <Label>Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Department</Label>
              <Input value={department} onChange={(e) => setDepartment(e.target.value)} />
            </div>
            <div>
              <Label>Project</Label>
              <Input value={project} onChange={(e) => setProject(e.target.value)} />
            </div>
          </div>
          <div>
            <Label>Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {(categories || []).map((c: any) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={updateMutation.isPending}>Cancel</Button>
            <Button onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending}>{updateMutation.isPending ? 'Saving...' : 'Save'}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}


