import { useState, useEffect } from 'react'
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog"
import { useToast } from "../hooks/use-toast"
import { apiService } from '@/lib/api'
import { bankingApi, BankAccount } from '@/lib/api/banking'

interface PaymentFormProps {
  transactionId: string
  transactionType: 'invoice' | 'bill'
  amount: number
  onSuccess?: () => void
  trigger?: React.ReactNode
}

export function PaymentForm({ transactionId, transactionType, amount, onSuccess, trigger }: PaymentFormProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])
  const [formData, setFormData] = useState({
    method: 'cash',
    bankAccountId: '',
    reference: '',
    amount: amount.toString(),
    paymentDate: new Date().toISOString().split('T')[0]
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      loadBankAccounts()
    }
  }, [open])

  const loadBankAccounts = async () => {
    try {
      const companyId = localStorage.getItem('company_id') || localStorage.getItem('companyId') || 'seed-company-1'
      const accounts = await bankingApi.getBankAccounts(companyId)
      setBankAccounts(accounts)
    } catch (error) {
      console.error('Error loading bank accounts:', error)
      toast({
        title: "Error",
        description: "Failed to load bank accounts",
        variant: "destructive"
      })
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.method) {
      newErrors.method = 'Payment method is required'
    }

    if (formData.method === 'check' || formData.method === 'bank_transfer') {
      if (!formData.bankAccountId) {
        newErrors.bankAccountId = 'Bank account is required for this payment method'
      }
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0'
    }

    if (!formData.paymentDate) {
      newErrors.paymentDate = 'Payment date is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      const companyId = localStorage.getItem('company_id') || localStorage.getItem('companyId') || 'seed-company-1'
      
      const paymentData = {
        companyId,
        transactionId,
        method: formData.method,
        reference: formData.reference,
        amount: parseFloat(formData.amount),
        paymentDate: formData.paymentDate,
        bankAccountId: formData.method === 'check' || formData.method === 'bank_transfer' ? formData.bankAccountId : undefined
      }

      await apiService.post('/payments', paymentData)
      
      toast({
        title: "Payment Recorded",
        description: `Payment of $${formData.amount} has been recorded successfully.`,
      })

      setOpen(false)
      setFormData({
        method: 'cash',
        bankAccountId: '',
        reference: '',
        amount: amount.toString(),
        paymentDate: new Date().toISOString().split('T')[0]
      })
      setErrors({})
      
      if (onSuccess) {
        onSuccess()
      }
    } catch (error: any) {
      console.error('Error creating payment:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to record payment",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleMethodChange = (method: string) => {
    setFormData(prev => ({ ...prev, method, bankAccountId: '' }))
    setErrors(prev => ({ ...prev, bankAccountId: '' }))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            Record Payment
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="method">Payment Method</Label>
            <Select value={formData.method} onValueChange={handleMethodChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="check">Check</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="credit_card">Credit Card</SelectItem>
                <SelectItem value="debit_card">Debit Card</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            {errors.method && <p className="text-sm text-red-500">{errors.method}</p>}
          </div>

          {(formData.method === 'check' || formData.method === 'bank_transfer') && (
            <div className="space-y-2">
              <Label htmlFor="bankAccountId">Bank Account</Label>
              <Select value={formData.bankAccountId} onValueChange={(value) => setFormData(prev => ({ ...prev, bankAccountId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select bank account" />
                </SelectTrigger>
                <SelectContent>
                  {bankAccounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.bankName} - {account.accountNumber} ({account.accountType})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.bankAccountId && <p className="text-sm text-red-500">{errors.bankAccountId}</p>}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              placeholder="0.00"
            />
            {errors.amount && <p className="text-sm text-red-500">{errors.amount}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reference">Reference/Check Number</Label>
            <Input
              id="reference"
              value={formData.reference}
              onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))}
              placeholder="Optional reference or check number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentDate">Payment Date</Label>
            <Input
              id="paymentDate"
              type="date"
              value={formData.paymentDate}
              onChange={(e) => setFormData(prev => ({ ...prev, paymentDate: e.target.value }))}
            />
            {errors.paymentDate && <p className="text-sm text-red-500">{errors.paymentDate}</p>}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Recording...' : 'Record Payment'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
