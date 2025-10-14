import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Plus, Trash2 } from "lucide-react"

interface LineItem {
  id?: string
  description: string
  quantity: number
  unitPrice: number
  taxRate: number
  total: number
}

interface TransactionFormProps {
  type: 'invoice' | 'bill'
  initialData?: any
  onSubmit: (data: any) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

export const TransactionForm: React.FC<TransactionFormProps> = ({
  type,
  initialData,
  onSubmit,
  onCancel,
  loading = false
}) => {
  const [formData, setFormData] = useState({
    entityId: initialData?.entityId || '', // customerId or vendorId
    number: initialData?.number || '',
    date: initialData?.date || new Date().toISOString().split('T')[0],
    dueDate: initialData?.dueDate || '',
    notes: initialData?.notes || '',
    ...initialData
  })

  const [lineItems, setLineItems] = useState<LineItem[]>(
    initialData?.lines || [{ description: '', quantity: 1, unitPrice: 0, taxRate: 0, total: 0 }]
  )

  const updateLineItem = (index: number, field: keyof LineItem, value: any) => {
    const newItems = [...lineItems]
    newItems[index] = { ...newItems[index], [field]: value }
    
    // Recalculate total
    if (field === 'quantity' || field === 'unitPrice' || field === 'taxRate') {
      const item = newItems[index]
      const subtotal = item.quantity * item.unitPrice
      const tax = subtotal * (item.taxRate / 100)
      newItems[index].total = subtotal + tax
    }
    
    setLineItems(newItems)
  }

  const addLineItem = () => {
    setLineItems([...lineItems, { description: '', quantity: 1, unitPrice: 0, taxRate: 0, total: 0 }])
  }

  const removeLineItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index))
    }
  }

  const calculateTotals = () => {
    const subtotal = lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
    const taxTotal = lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice * (item.taxRate / 100)), 0)
    const total = subtotal + taxTotal
    
    return { subtotal, taxTotal, total }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const { subtotal, taxTotal, total } = calculateTotals()
    
    await onSubmit({
      ...formData,
      lines: lineItems,
      subtotal,
      taxTotal,
      totalAmount: total
    })
  }

  const { subtotal, taxTotal, total } = calculateTotals()
  const entityLabel = type === 'invoice' ? 'Customer' : 'Vendor'
  const numberLabel = type === 'invoice' ? 'Invoice Number' : 'Bill Number'

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {type === 'invoice' ? 'Invoice Details' : 'Bill Details'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="entityId">{entityLabel} ID</Label>
              <Input
                id="entityId"
                value={formData.entityId}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, entityId: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="number">{numberLabel}</Label>
              <Input
                id="number"
                value={formData.number}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, number: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, dueDate: e.target.value })}
                required
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Line Items</CardTitle>
            <Button type="button" onClick={addLineItem} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Line
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {lineItems.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 items-center p-3 border rounded">
                <div className="col-span-4">
                  <Input
                    placeholder="Description"
                    value={item.description}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateLineItem(index, 'description', e.target.value)}
                    required
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    type="number"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateLineItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    type="number"
                    placeholder="Price"
                    value={item.unitPrice}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateLineItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    type="number"
                    placeholder="Tax %"
                    value={item.taxRate}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateLineItem(index, 'taxRate', parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="col-span-1 text-right font-medium">
                  ${item.total.toFixed(2)}
                </div>
                <div className="col-span-1">
                  {lineItems.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLineItem(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end mt-6">
            <div className="w-64 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax:</span>
                <span>${taxTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : `Create ${type === 'invoice' ? 'Invoice' : 'Bill'}`}
        </Button>
      </div>
    </form>
  )
}
