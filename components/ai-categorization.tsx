"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Brain, Zap, TrendingUp, CheckCircle, AlertCircle } from "lucide-react"
import { bankingApi, BankTransaction } from '@/lib/api/banking'

interface AICategorizationProps {
  companyId?: string
  transactions?: BankTransaction[]
  onCategorizationComplete?: () => void
}

interface CategorizationStats {
  totalTransactions: number
  categorizedTransactions: number
  uncategorizedTransactions: number
  categoryBreakdown: Record<string, number>
  averageConfidence: number
}

export function AICategorization({ companyId, transactions, onCategorizationComplete }: AICategorizationProps) {
  const [stats, setStats] = useState<CategorizationStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [categorizing, setCategorizing] = useState(false)
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([])
  const [uncategorizedTransactions, setUncategorizedTransactions] = useState<BankTransaction[]>([])
  const { toast } = useToast()

  useEffect(() => {
    loadStats()
    loadUncategorizedTransactions()
  }, [])

  const loadStats = async () => {
    try {
      const currentCompanyId = companyId || localStorage.getItem('company_id') || localStorage.getItem('companyId') || 'seed-company-1'
      
      const response = await fetch(`/api/categorization-stats?companyId=${currentCompanyId}`, {
        headers: {
          'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error loading categorization stats:', error)
    }
  }

  const loadUncategorizedTransactions = async () => {
    try {
      const currentCompanyId = companyId || localStorage.getItem('company_id') || localStorage.getItem('companyId') || 'seed-company-1'
      
      const response = await bankingApi.getBankTransactions(undefined, currentCompanyId)
      const uncategorized = response.items.filter(t => !t.category || t.category === 'Uncategorized')
      setUncategorizedTransactions(uncategorized)
    } catch (error) {
      console.error('Error loading uncategorized transactions:', error)
    }
  }

  const categorizeSelectedTransactions = async () => {
    if (selectedTransactions.length === 0) return

    setCategorizing(true)
    try {
      const currentCompanyId = companyId || localStorage.getItem('company_id') || localStorage.getItem('companyId') || 'seed-company-1'
      
      const response = await fetch(`/api/bank-transactions/categorize?companyId=${currentCompanyId}`, {
        method: 'POST',
        headers: {
          'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ transactionIds: selectedTransactions })
      })

      if (response.ok) {
        const result = await response.json()
        
        toast({
          title: "Categorization Complete",
          description: `Successfully categorized ${result.categorized} transactions. ${result.failed} failed.`,
        })

        setSelectedTransactions([])
        loadStats()
        loadUncategorizedTransactions()
        
        if (onCategorizationComplete) {
          onCategorizationComplete()
        }
      } else {
        throw new Error('Failed to categorize transactions')
      }
    } catch (error: any) {
      console.error('Error categorizing transactions:', error)
      toast({
        title: "Categorization Failed",
        description: error.message || "Failed to categorize transactions",
        variant: "destructive"
      })
    } finally {
      setCategorizing(false)
    }
  }

  const categorizeAllUncategorized = async () => {
    const allUncategorizedIds = uncategorizedTransactions.map(t => t.id)
    setSelectedTransactions(allUncategorizedIds)
    await categorizeSelectedTransactions()
  }

  const categorizeSingleTransaction = async (transactionId: string) => {
    setLoading(true)
    try {
      const currentCompanyId = companyId || localStorage.getItem('company_id') || localStorage.getItem('companyId') || 'seed-company-1'
      
      const response = await fetch(`/api/bank-transactions/${transactionId}/categorize?companyId=${currentCompanyId}`, {
        method: 'POST',
        headers: {
          'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })

      if (response.ok) {
        const result = await response.json()
        
        toast({
          title: "Transaction Categorized",
          description: `Categorized as: ${result.categorization.category}`,
        })

        loadStats()
        loadUncategorizedTransactions()
      } else {
        throw new Error('Failed to categorize transaction')
      }
    } catch (error: any) {
      console.error('Error categorizing transaction:', error)
      toast({
        title: "Categorization Failed",
        description: error.message || "Failed to categorize transaction",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const correctCategory = async (transactionId: string, newCategory: string) => {
    try {
      const currentCompanyId = companyId || localStorage.getItem('company_id') || localStorage.getItem('companyId') || 'seed-company-1'
      
      const response = await fetch(`/api/bank-transactions/${transactionId}/correct-category?companyId=${currentCompanyId}`, {
        method: 'POST',
        headers: {
          'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ category: newCategory })
      })

      if (response.ok) {
        toast({
          title: "Category Corrected",
          description: "AI will learn from this correction for future transactions.",
        })

        loadStats()
        loadUncategorizedTransactions()
      } else {
        throw new Error('Failed to correct category')
      }
    } catch (error: any) {
      console.error('Error correcting category:', error)
      toast({
        title: "Correction Failed",
        description: error.message || "Failed to correct category",
        variant: "destructive"
      })
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600'
    if (confidence >= 0.6) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-100 text-green-800'
    if (confidence >= 0.6) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  return (
    <div className="space-y-6">
      {/* AI Categorization Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            AI Transaction Categorization
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {stats && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.totalTransactions}</div>
                  <div className="text-sm text-muted-foreground">Total Transactions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.categorizedTransactions}</div>
                  <div className="text-sm text-muted-foreground">Categorized</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{stats.uncategorizedTransactions}</div>
                  <div className="text-sm text-muted-foreground">Uncategorized</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{Math.round(stats.averageConfidence * 100)}%</div>
                  <div className="text-sm text-muted-foreground">Avg Confidence</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Categorization Progress</span>
                  <span>{Math.round((stats.categorizedTransactions / stats.totalTransactions) * 100)}%</span>
                </div>
                <Progress 
                  value={(stats.categorizedTransactions / stats.totalTransactions) * 100} 
                  className="h-2"
                />
              </div>
            </>
          )}

          <div className="flex gap-2">
            <Button 
              onClick={categorizeAllUncategorized}
              disabled={categorizing || uncategorizedTransactions.length === 0}
              className="flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              {categorizing ? 'Categorizing...' : `Categorize All (${uncategorizedTransactions.length})`}
            </Button>
            
            <Button 
              onClick={categorizeSelectedTransactions}
              disabled={categorizing || selectedTransactions.length === 0}
              variant="outline"
            >
              Categorize Selected ({selectedTransactions.length})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Category Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(stats.categoryBreakdown).map(([category, count]) => (
                <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">{category}</span>
                  <Badge variant="secondary">{count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Uncategorized Transactions */}
      {uncategorizedTransactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              Uncategorized Transactions ({uncategorizedTransactions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {uncategorizedTransactions.slice(0, 10).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedTransactions.includes(transaction.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTransactions(prev => [...prev, transaction.id])
                          } else {
                            setSelectedTransactions(prev => prev.filter(id => id !== transaction.id))
                          }
                        }}
                        className="rounded"
                      />
                      <span className="font-medium">{transaction.description || 'No description'}</span>
                      {transaction.merchantName && (
                        <span className="text-sm text-muted-foreground">- {transaction.merchantName}</span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {new Date(transaction.transactionDate).toLocaleDateString()} • 
                      ${Math.abs(Number(transaction.amount)).toFixed(2)}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => categorizeSingleTransaction(transaction.id)}
                      disabled={loading}
                    >
                      <Brain className="w-4 h-4 mr-1" />
                      Categorize
                    </Button>
                  </div>
                </div>
              ))}
              
              {uncategorizedTransactions.length > 10 && (
                <div className="text-center text-sm text-muted-foreground pt-2">
                  ... and {uncategorizedTransactions.length - 10} more transactions
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
