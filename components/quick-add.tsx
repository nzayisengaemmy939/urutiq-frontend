"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Plus,
  Receipt,
  CreditCard,
  FileText,
  DollarSign,
  Calendar,
  Building2,
  Tag,
  Zap,
  Clock,
  Copy,
  Wand2,
  History,
  Star,
} from "lucide-react"
import { cn } from "@/lib/utils"

const transactionTypes = [
  { id: "income", label: "Income", icon: DollarSign, color: "text-green-600 bg-green-50 border-green-200" },
  { id: "expense", label: "Expense", icon: Receipt, color: "text-red-600 bg-red-50 border-red-200" },
  { id: "invoice", label: "Invoice", icon: FileText, color: "text-blue-600 bg-blue-50 border-blue-200" },
  { id: "payment", label: "Payment", icon: CreditCard, color: "text-purple-600 bg-purple-50 border-purple-200" },
]

const recentTransactions = [
  { description: "Office supplies", amount: "245.50", client: "Acme Corp", category: "Office Expenses" },
  { description: "Software subscription", amount: "99.00", client: "TechStart Inc", category: "Software" },
  { description: "Consulting payment", amount: "2500.00", client: "Local Bakery", category: "Revenue" },
]

const frequentClients = ["Acme Corp", "TechStart Inc", "Local Bakery", "Global Solutions"]
const commonCategories = ["Office Expenses", "Software", "Travel", "Marketing", "Revenue", "Utilities"]

const workflowTemplates = [
  {
    id: "monthly-expenses",
    name: "Monthly Recurring Expenses",
    description: "Rent, utilities, subscriptions",
    icon: Clock,
    transactions: [
      { description: "Office rent", amount: "2500.00", category: "Rent" },
      { description: "Internet service", amount: "89.99", category: "Utilities" },
      { description: "Software subscriptions", amount: "299.00", category: "Software" },
    ],
  },
  {
    id: "client-invoice",
    name: "Standard Client Invoice",
    description: "Consulting services template",
    icon: FileText,
    transactions: [{ description: "Consulting services", amount: "1500.00", category: "Revenue" }],
  },
]

export function QuickAdd() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [selectedType, setSelectedType] = useState("")
  const [showTemplates, setShowTemplates] = useState(false)
  const [showRecent, setShowRecent] = useState(false)
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([])
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    client: "",
    category: "",
    date: new Date().toISOString().split("T")[0],
  })

  useEffect(() => {
    if (formData.description.length > 2) {
      const suggestions = []
      if (formData.description.toLowerCase().includes("office")) {
        suggestions.push("Office Expenses")
      }
      if (formData.description.toLowerCase().includes("software")) {
        suggestions.push("Software")
      }
      if (formData.description.toLowerCase().includes("travel")) {
        suggestions.push("Travel")
      }
      setAiSuggestions(suggestions)
    } else {
      setAiSuggestions([])
    }
  }, [formData.description])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[v0] Transaction submitted:", { type: selectedType, ...formData })

    // Reset form
    setFormData({
      description: "",
      amount: "",
      client: "",
      category: "",
      date: new Date().toISOString().split("T")[0],
    })
    setSelectedType("")
    setIsExpanded(false)
  }

  const handleApplyTemplate = (template: (typeof workflowTemplates)[0]) => {
    console.log("[v0] Applying template:", template.name)
    // In a real app, this would create multiple transactions
    setIsExpanded(false)
    setShowTemplates(false)
  }

  const handleDuplicateTransaction = (transaction: (typeof recentTransactions)[0]) => {
    setFormData({
      description: transaction.description,
      amount: transaction.amount,
      client: transaction.client,
      category: transaction.category,
      date: new Date().toISOString().split("T")[0],
    })
    setSelectedType("expense") // Default to expense for duplicated transactions
    setShowRecent(false)
  }

  if (!isExpanded) {
    return (
      <Card className="bg-gradient-to-r from-primary/5 to-cyan-500/5 border-primary/20">
        <CardContent className="p-4">
          <div className="flex gap-2">
            <Button
              onClick={() => setIsExpanded(true)}
              className="flex-1 h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
              data-quick-add
            >
              <Plus className="w-5 h-5 mr-2" />
              Quick Add Transaction
              <Zap className="w-4 h-4 ml-2 opacity-70" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTemplates(true)}
              className="px-3 bg-transparent"
              title="Workflow Templates"
            >
              <Wand2 className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRecent(true)}
              className="px-3 bg-transparent"
              title="Recent Transactions"
            >
              <History className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gradient-to-r from-primary/5 to-cyan-500/5 border-primary/20">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Quick Add Transaction
          </h3>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTemplates(!showTemplates)}
              className={cn("text-muted-foreground hover:text-foreground", showTemplates && "text-primary")}
            >
              <Wand2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowRecent(!showRecent)}
              className={cn("text-muted-foreground hover:text-foreground", showRecent && "text-primary")}
            >
              <History className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              ×
            </Button>
          </div>
        </div>

        {showTemplates && (
          <div className="mb-6 p-4 bg-muted/30 rounded-lg border border-border">
            <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
              <Wand2 className="w-4 h-4 text-cyan-600" />
              Workflow Templates
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {workflowTemplates.map((template) => (
                <div
                  key={template.id}
                  className="p-3 bg-background rounded-lg border border-border hover:border-primary/30 cursor-pointer transition-colors"
                  onClick={() => handleApplyTemplate(template)}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <template.icon className="w-4 h-4 text-cyan-600" />
                    <span className="text-sm font-medium">{template.name}</span>
                    <Badge variant="secondary" className="text-xs ml-auto">
                      {template.transactions.length} items
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{template.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {showRecent && (
          <div className="mb-6 p-4 bg-muted/30 rounded-lg border border-border">
            <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
              <History className="w-4 h-4 text-cyan-600" />
              Recent Transactions
            </h4>
            <div className="space-y-2">
              {recentTransactions.map((transaction, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-background rounded border border-border hover:border-primary/30 cursor-pointer transition-colors"
                  onClick={() => handleDuplicateTransaction(transaction)}
                >
                  <div className="flex items-center gap-3">
                    <Copy className="w-3 h-3 text-muted-foreground" />
                    <div>
                      <span className="text-sm font-medium">{transaction.description}</span>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{transaction.client}</span>
                        <span>•</span>
                        <span>{transaction.category}</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-sm font-medium">${transaction.amount}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Transaction Type Selection */}
          <div>
            <label className="text-sm font-medium text-foreground mb-3 block">Transaction Type</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {transactionTypes.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setSelectedType(type.id)}
                  className={cn(
                    "p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-2 hover:scale-105",
                    selectedType === type.id ? type.color : "bg-background border-border hover:border-primary/30",
                  )}
                >
                  <type.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          {selectedType && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Description */}
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-foreground mb-2 block">Description</label>
                <Input
                  placeholder="Enter transaction description..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-background"
                  required
                />
                {aiSuggestions.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    <span className="text-xs text-muted-foreground mr-2">AI suggests:</span>
                    {aiSuggestions.map((suggestion, index) => (
                      <Button
                        key={index}
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setFormData({ ...formData, category: suggestion })}
                        className="h-6 text-xs px-2 bg-cyan-50 text-cyan-700 hover:bg-cyan-100"
                      >
                        <Star className="w-3 h-3 mr-1" />
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                )}
              </div>

              {/* Amount */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Amount</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="pl-10 bg-background"
                    required
                  />
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="pl-10 bg-background"
                    required
                  />
                </div>
              </div>

              {/* Client */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Client</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Select or enter client..."
                    value={formData.client}
                    onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                    className="pl-10 bg-background"
                    list="clients"
                    required
                  />
                  <datalist id="clients">
                    {frequentClients.map((client) => (
                      <option key={client} value={client} />
                    ))}
                  </datalist>
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Category</label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Enter category..."
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="pl-10 bg-background"
                    list="categories"
                  />
                  <datalist id="categories">
                    {commonCategories.map((category) => (
                      <option key={category} value={category} />
                    ))}
                  </datalist>
                </div>
              </div>
            </div>
          )}

          {selectedType && (
            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
                <Plus className="w-4 h-4 mr-2" />
                Add Transaction
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSelectedType("")
                  setFormData({
                    description: "",
                    amount: "",
                    client: "",
                    category: "",
                    date: new Date().toISOString().split("T")[0],
                  })
                }}
              >
                Clear
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
