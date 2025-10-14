import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import { Badge } from './ui/badge'
import { 
  DollarSign, 
  Receipt, 
  CreditCard, 
  Building, 
  Coffee,
  Car,
  Smartphone,
  Lightbulb,
  Plus,
  ArrowRight
} from 'lucide-react'

interface QuickTransactionProps {
  onTransactionSelect?: (transaction: any) => void
}

const QUICK_TRANSACTIONS = [
  {
    id: 'expense_payment',
    title: 'Pay Business Expense',
    description: 'Record money spent on business needs',
    icon: <Receipt className="w-5 h-5" />,
    color: 'bg-red-50 text-red-600 border-red-200',
    examples: ['Office supplies', 'Gas for company car', 'Business lunch'],
    accounts: {
      debit: 'Expense Account',
      credit: 'Cash/Bank Account'
    }
  },
  {
    id: 'income_received',
    title: 'Receive Money',
    description: 'Record money coming into your business',
    icon: <DollarSign className="w-5 h-5" />,
    color: 'bg-green-50 text-green-600 border-green-200',
    examples: ['Customer payment', 'Service income', 'Product sales'],
    accounts: {
      debit: 'Cash/Bank Account',
      credit: 'Revenue Account'
    }
  },
  {
    id: 'bill_payment',
    title: 'Pay Bills',
    description: 'Record payments for utilities, rent, etc.',
    icon: <Building className="w-5 h-5" />,
    color: 'bg-blue-50 text-blue-600 border-blue-200',
    examples: ['Monthly rent', 'Electricity bill', 'Internet service'],
    accounts: {
      debit: 'Expense Account',
      credit: 'Cash/Bank Account'
    }
  },
  {
    id: 'loan_payment',
    title: 'Loan Payment',
    description: 'Record loan or credit payments',
    icon: <CreditCard className="w-5 h-5" />,
    color: 'bg-purple-50 text-purple-600 border-purple-200',
    examples: ['Business loan payment', 'Equipment financing', 'Credit card payment'],
    accounts: {
      debit: 'Loan Account',
      credit: 'Cash/Bank Account'
    }
  }
]

const EXPENSE_CATEGORIES = [
  { icon: <Coffee className="w-4 h-4" />, label: 'Meals & Entertainment', account: 'Meals Expense' },
  { icon: <Car className="w-4 h-4" />, label: 'Vehicle & Transport', account: 'Vehicle Expense' },
  { icon: <Building className="w-4 h-4" />, label: 'Rent & Utilities', account: 'Rent Expense' },
  { icon: <Smartphone className="w-4 h-4" />, label: 'Technology', account: 'Technology Expense' },
  { icon: <Receipt className="w-4 h-4" />, label: 'Office Supplies', account: 'Office Supplies' },
  { icon: <Lightbulb className="w-4 h-4" />, label: 'Marketing', account: 'Marketing Expense' }
]

export function QuickJournalEntry({ onTransactionSelect }: QuickTransactionProps) {
  const navigate = useNavigate()
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null)
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleQuickCreate = (transaction: any) => {
    setSelectedTransaction(transaction)
    setIsDialogOpen(true)
  }

  const handleCreateEntry = () => {
    // Navigate to the full journal entry page with pre-filled data
    const queryParams = new URLSearchParams({
      type: selectedTransaction.id,
      amount: amount,
      description: description,
      category: selectedCategory
    })
    
    navigate(`/dashboard/journal/new?${queryParams.toString()}`)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Quick Journal Entry
          </CardTitle>
          <CardDescription>
            Create common business transactions with just a few clicks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {QUICK_TRANSACTIONS.map((transaction) => (
              <Card 
                key={transaction.id}
                className="cursor-pointer hover:shadow-md transition-all hover:scale-105"
                onClick={() => handleQuickCreate(transaction)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${transaction.color}`}>
                      {transaction.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-sm mb-1">{transaction.title}</h3>
                      <p className="text-xs text-muted-foreground mb-2">
                        {transaction.description}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {transaction.examples.slice(0, 2).map((example, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {example}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-6 text-center">
            <Button 
              variant="outline" 
              onClick={() => navigate('/dashboard/journal/new')}
              className="w-full md:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Custom Entry
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Entry Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedTransaction?.icon}
              {selectedTransaction?.title}
            </DialogTitle>
            <DialogDescription>
              {selectedTransaction?.description}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder={`What was this ${selectedTransaction?.title.toLowerCase()} for?`}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            {selectedTransaction?.id === 'expense_payment' && (
              <div className="space-y-2">
                <Label>Expense Category</Label>
                <div className="grid grid-cols-2 gap-2">
                  {EXPENSE_CATEGORIES.map((category, idx) => (
                    <Card 
                      key={idx}
                      className={`cursor-pointer transition-colors ${
                        selectedCategory === category.account 
                          ? 'border-primary bg-primary/5' 
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedCategory(category.account)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center gap-2">
                          {category.icon}
                          <span className="text-xs font-medium">{category.label}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-muted/50 p-3 rounded-lg">
              <div className="text-xs text-muted-foreground mb-2">This will create:</div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Debit: {selectedTransaction?.accounts.debit}</span>
                  <span className="text-green-600">+${amount || '0.00'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Credit: {selectedTransaction?.accounts.credit}</span>
                  <span className="text-red-600">-${amount || '0.00'}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateEntry}
                disabled={!amount || !description}
                className="flex-1"
              >
                Continue
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
