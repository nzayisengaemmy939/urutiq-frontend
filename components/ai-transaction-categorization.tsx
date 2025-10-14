"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Brain,
  CheckCircle,
  AlertCircle,
  Upload,
  FileText,
  DollarSign,
  TrendingUp,
  Sparkles,
  Loader2,
  RefreshCw,
  Save,
  X,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Transaction {
  id: string
  description: string
  amount: number
  transactionType: string
  date: string
  category?: string
  confidence?: number
  reasoning?: string
}

interface CategorizationResult {
  transactionId: string
  description: string
  amount: number
  suggestedCategory: string
  confidence: number
  reasoning: string
}

export function AITransactionCategorization() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categorizations, setCategorizations] = useState<CategorizationResult[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState("")
  const [confidenceThreshold, setConfidenceThreshold] = useState(70)
  const [showLowConfidence, setShowLowConfidence] = useState(true)
  const { toast } = useToast()

  // Sample transaction data
  const sampleTransactions: Transaction[] = [
    {
      id: "1",
      description: "Payment to Airtel 45,000 RWF",
      amount: 45000,
      transactionType: "expense",
      date: "2025-01-15"
    },
    {
      id: "2",
      description: "Office supplies from Stationery Plus",
      amount: 25000,
      transactionType: "expense",
      date: "2025-01-16"
    },
    {
      id: "3",
      description: "Fuel payment at Total station",
      amount: 35000,
      transactionType: "expense",
      date: "2025-01-17"
    },
    {
      id: "4",
      description: "Consulting fee from ABC Corp",
      amount: 150000,
      transactionType: "income",
      date: "2025-01-18"
    },
    {
      id: "5",
      description: "Software subscription - Microsoft 365",
      amount: 12000,
      transactionType: "expense",
      date: "2025-01-19"
    }
  ]

  useEffect(() => {
    // Load sample data
    setTransactions(sampleTransactions)
  }, [])

  const categorizeTransactions = async () => {
    if (!selectedCompany) {
      toast({
        title: "Company Required",
        description: "Please select a company first",
        variant: "destructive"
      })
      return
    }

    setIsProcessing(true)
    try {
      const response = await fetch('/api/ai/categorize/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': 'tenant_demo',
          'x-company-id': selectedCompany
        },
        body: JSON.stringify({
          companyId: selectedCompany,
          transactions: transactions.map(t => ({
            id: t.id,
            description: t.description,
            amount: t.amount,
            transactionType: t.transactionType
          }))
        })
      })

      if (!response.ok) {
        throw new Error('Failed to categorize transactions')
      }

      const result = await response.json()
      setCategorizations(result.categorizations)
      
      // Update transactions with categories
      setTransactions(prev => prev.map(t => {
        const cat = result.categorizations.find((c: CategorizationResult) => c.transactionId === t.id)
        return cat ? { ...t, category: cat.suggestedCategory, confidence: cat.confidence, reasoning: cat.reasoning } : t
      }))

      toast({
        title: "Categorization Complete",
        description: `Successfully categorized ${result.processed} transactions`,
      })
    } catch (error) {
      console.error('Categorization error:', error)
      toast({
        title: "Categorization Failed",
        description: "Failed to categorize transactions. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const categorizeSingleTransaction = async (transaction: Transaction) => {
    if (!selectedCompany) {
      toast({
        title: "Company Required",
        description: "Please select a company first",
        variant: "destructive"
      })
      return
    }

    try {
      const response = await fetch('/api/ai/categorize/transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': 'tenant_demo',
          'x-company-id': selectedCompany
        },
        body: JSON.stringify({
          companyId: selectedCompany,
          description: transaction.description,
          amount: transaction.amount,
          transactionType: transaction.transactionType
        })
      })

      if (!response.ok) {
        throw new Error('Failed to categorize transaction')
      }

      const result = await response.json()
      
      // Update the specific transaction
      setTransactions(prev => prev.map(t => 
        t.id === transaction.id 
          ? { ...t, category: result.categorization.suggestedCategory, confidence: result.categorization.confidence, reasoning: result.categorization.reasoning }
          : t
      ))

      toast({
        title: "Transaction Categorized",
        description: `Categorized as: ${result.categorization.suggestedCategory}`,
      })
    } catch (error) {
      console.error('Single categorization error:', error)
      toast({
        title: "Categorization Failed",
        description: "Failed to categorize transaction. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const csvData = e.target?.result as string
        const lines = csvData.split('\n')
        const headers = lines[0].split(',')
        
        const newTransactions: Transaction[] = lines.slice(1).map((line, index) => {
          const values = line.split(',')
          return {
            id: `uploaded-${index}`,
            description: values[0] || '',
            amount: parseFloat(values[1]) || 0,
            transactionType: values[2] || 'expense',
            date: values[3] || new Date().toISOString().split('T')[0]
          }
        }).filter(t => t.description && t.amount > 0)

        setTransactions(prev => [...prev, ...newTransactions])
        toast({
          title: "File Uploaded",
          description: `Imported ${newTransactions.length} transactions`,
        })
      } catch (error) {
        toast({
          title: "Upload Failed",
          description: "Failed to parse CSV file. Please check the format.",
          variant: "destructive"
        })
      }
    }
    reader.readAsText(file)
  }

  const filteredTransactions = transactions.filter(t => {
    if (!showLowConfidence && t.confidence && t.confidence < confidenceThreshold) {
      return false
    }
    return true
  })

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return "text-green-600"
    if (confidence >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 90) return <Badge className="bg-green-100 text-green-700">High</Badge>
    if (confidence >= 70) return <Badge className="bg-yellow-100 text-yellow-700">Medium</Badge>
    return <Badge className="bg-red-100 text-red-700">Low</Badge>
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-foreground">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-cyan-600" />
            AI Transaction Categorization
            <Badge variant="secondary" className="bg-cyan-100 text-cyan-700">
              <Sparkles className="w-3 h-3 mr-1" />
              Smart
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTransactions(sampleTransactions)}
              className="text-xs"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Reset
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Company</label>
            <Select value={selectedCompany} onValueChange={setSelectedCompany}>
              <SelectTrigger>
                <SelectValue placeholder="Select company" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="company_1">Demo Company 1</SelectItem>
                <SelectItem value="company_2">Demo Company 2</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium text-muted-foreground">Confidence Threshold</label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={confidenceThreshold}
                onChange={(e) => setConfidenceThreshold(parseInt(e.target.value))}
                min="0"
                max="100"
                className="w-20"
              />
              <span className="text-xs text-muted-foreground">%</span>
            </div>
          </div>
          
          <div className="flex items-end">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showLowConfidence}
                onChange={(e) => setShowLowConfidence(e.target.checked)}
                className="rounded"
              />
              Show low confidence
            </label>
          </div>
          
          <div className="flex items-end gap-2">
            <Button
              onClick={categorizeTransactions}
              disabled={isProcessing || transactions.length === 0}
              className="flex-1"
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Brain className="w-4 h-4 mr-2" />
              )}
              Categorize All
            </Button>
          </div>
        </div>

        {/* File Upload */}
        <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
          <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-2">
            Upload CSV file with transactions (description, amount, type, date)
          </p>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
            id="transaction-upload"
          />
          <label htmlFor="transaction-upload" className="cursor-pointer">
            <Button variant="outline" size="sm">
              <FileText className="w-4 h-4 mr-2" />
              Upload CSV
            </Button>
          </label>
        </div>

        {/* Transactions List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Transactions ({filteredTransactions.length})</h3>
            <div className="text-xs text-muted-foreground">
              {transactions.filter(t => t.category).length} categorized
            </div>
          </div>
          
          {filteredTransactions.map((transaction) => (
            <div key={transaction.id} className="p-4 bg-muted/30 rounded-lg border border-border">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">{transaction.description}</span>
                    <Badge variant="outline" className="text-xs">
                      {transaction.transactionType}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{transaction.date}</span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      {transaction.amount.toLocaleString()}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {transaction.category ? (
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <Badge className="bg-green-100 text-green-700 text-xs">
                          {transaction.category}
                        </Badge>
                        {transaction.confidence && getConfidenceBadge(transaction.confidence)}
                      </div>
                      {transaction.confidence && (
                        <div className="flex items-center gap-1 mt-1">
                          <Progress value={transaction.confidence} className="w-16 h-1" />
                          <span className={`text-xs ${getConfidenceColor(transaction.confidence)}`}>
                            {transaction.confidence}%
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => categorizeSingleTransaction(transaction)}
                      disabled={isProcessing}
                    >
                      <Brain className="w-3 h-3 mr-1" />
                      Categorize
                    </Button>
                  )}
                </div>
              </div>
              
              {transaction.reasoning && (
                <div className="mt-2 p-2 bg-background/50 rounded text-xs text-muted-foreground">
                  <strong>AI Reasoning:</strong> {transaction.reasoning}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Summary */}
        {categorizations.length > 0 && (
          <div className="mt-6 p-4 bg-muted/30 rounded-lg border border-border">
            <h3 className="text-sm font-medium mb-3">Categorization Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Total Processed</div>
                <div className="font-medium">{categorizations.length}</div>
              </div>
              <div>
                <div className="text-muted-foreground">High Confidence</div>
                <div className="font-medium text-green-600">
                  {categorizations.filter(c => c.confidence >= 90).length}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Medium Confidence</div>
                <div className="font-medium text-yellow-600">
                  {categorizations.filter(c => c.confidence >= 70 && c.confidence < 90).length}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Low Confidence</div>
                <div className="font-medium text-red-600">
                  {categorizations.filter(c => c.confidence < 70).length}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
