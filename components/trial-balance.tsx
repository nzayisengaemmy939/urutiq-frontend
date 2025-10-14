"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Calculator, 
  Calendar,
  Download,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from "lucide-react"
import { accountingApi, type TrialBalanceData, type AccountBalance } from "@/lib/api/accounting"

export function TrialBalance() {
  const [trialBalance, setTrialBalance] = useState<TrialBalanceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0])
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  // Load data on component mount
  useEffect(() => {
    loadTrialBalance()
  }, [asOfDate, currentPage, pageSize])

  const loadTrialBalance = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const data = await accountingApi.trialBalanceApi.getTrialBalance(asOfDate, undefined, currentPage, pageSize)
      setTrialBalance(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load trial balance")
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const getBalanceStatus = (debit: number, credit: number): 'balanced' | 'unbalanced' => {
    return Math.abs(debit - credit) < 0.01 ? 'balanced' : 'unbalanced'
  }

  const getAccountTypeSummary = () => {
    if (!trialBalance) return []
    
    const typeMap = new Map<string, { name: string; totalDebits: number; totalCredits: number; count: number }>()
    
    trialBalance.accounts.forEach(account => {
  const type = (account as any).accountType || 'Unknown'
      const existing = typeMap.get(type) || { name: type, totalDebits: 0, totalCredits: 0, count: 0 }
      
      existing.totalDebits += account.debitBalance || 0
      existing.totalCredits += account.creditBalance || 0
      existing.count += 1
      
      typeMap.set(type, existing)
    })
    
    return Array.from(typeMap.values()).sort((a, b) => b.count - a.count)
  }

  const resetPagination = () => {
    setCurrentPage(1)
  }

  const exportToCSV = () => {
    if (!trialBalance) return
    
    const headers = ['Account Code', 'Account Name', 'Account Type', 'Debit Balance', 'Credit Balance', 'Net Balance']
    const rows = trialBalance.accounts.map(account => [
  (account as any).code,
  (account as any).name,
  (account as any).accountType || 'Unknown',
      formatCurrency(account.debitBalance || 0),
      formatCurrency(account.creditBalance || 0),
      formatCurrency((account.debitBalance || 0) - (account.creditBalance || 0))
    ])
    
    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `trial-balance-${asOfDate}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Trial Balance...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadTrialBalance}>Retry</Button>
        </div>
      </div>
    )
  }

  if (!trialBalance) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Calculator className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p>No trial balance data available</p>
      </div>
    )
  }

  const totalDebits = trialBalance.accounts.reduce((sum, acc) => sum + (acc.debitBalance || 0), 0)
  const totalCredits = trialBalance.accounts.reduce((sum, acc) => sum + (acc.creditBalance || 0), 0)
  const totalDifference = Math.abs(totalDebits - totalCredits)
  const isBalanced = totalDifference < 0.01

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Trial Balance</h2>
          <p className="text-gray-600">Account balances as of a specific date</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Label htmlFor="asOfDate">As of:</Label>
            <Input
              id="asOfDate"
              type="date"
              value={asOfDate}
              onChange={(e) => {
                setAsOfDate(e.target.value)
                resetPagination()
              }}
              className="w-40"
            />
          </div>
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Debits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalDebits)}
            </div>
            <p className="text-xs text-gray-600">All debit balances</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(totalCredits)}
            </div>
            <p className="text-xs text-gray-600">All credit balances</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Difference</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              isBalanced ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatCurrency(totalDifference)}
            </div>
            <p className="text-xs text-gray-600">
              {isBalanced ? 'Balanced' : 'Unbalanced'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {isBalanced ? (
                <>
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <span className="text-lg font-bold text-green-600">Balanced</span>
                </>
              ) : (
                <>
                  <XCircle className="h-6 w-6 text-red-600" />
                  <span className="text-lg font-bold text-red-600">Unbalanced</span>
                </>
              )}
            </div>
            <p className="text-xs text-gray-600">
              {isBalanced ? 'All accounts balanced' : 'Review required'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Account Type Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Account Type Summary
          </CardTitle>
          <CardDescription>
            Balances grouped by account type
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getAccountTypeSummary().map((type, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{type.name}</h4>
                  <Badge variant="outline">{type.count} accounts</Badge>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Debits:</span>
                    <span className="font-medium text-green-600">
                      {formatCurrency(type.totalDebits)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Credits:</span>
                    <span className="font-medium text-blue-600">
                      {formatCurrency(type.totalCredits)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-1">
                    <span className="text-gray-600">Net:</span>
                    <span className={`font-medium ${
                      type.totalDebits > type.totalCredits ? 'text-green-600' : 'text-blue-600'
                    }`}>
                      {formatCurrency(type.totalDebits - type.totalCredits)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Trial Balance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Detailed Trial Balance
          </CardTitle>
          <CardDescription>
            Complete list of all accounts with their balances as of {new Date(asOfDate).toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Account Code</th>
                  <th className="text-left py-3 px-4 font-medium">Account Name</th>
                  <th className="text-left py-3 px-4 font-medium">Account Type</th>
                  <th className="text-right py-3 px-4 font-medium">Debit Balance</th>
                  <th className="text-right py-3 px-4 font-medium">Credit Balance</th>
                  <th className="text-right py-3 px-4 font-medium">Net Balance</th>
                  <th className="text-center py-3 px-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {trialBalance.accounts.map((account, index) => {
                  const netBalance = (account.debitBalance || 0) - (account.creditBalance || 0)
                  const balanceStatus = getBalanceStatus(account.debitBalance || 0, account.creditBalance || 0)
                  
                  return (
                    <tr key={(account as any).id || index} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-mono text-sm">{(account as any).code}</td>       
                      <td className="py-3 px-4 font-medium">{(account as any).name}</td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="text-xs">
                          {(account as any).accountType || 'Unknown'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className={account.debitBalance && account.debitBalance > 0 ? 'text-green-600 font-medium' : 'text-gray-400'}>
                          {account.debitBalance && account.debitBalance > 0 ? formatCurrency(account.debitBalance) : '-'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className={account.creditBalance && account.creditBalance > 0 ? 'text-blue-600 font-medium' : 'text-gray-400'}>
                          {account.creditBalance && account.creditBalance > 0 ? formatCurrency(account.creditBalance) : '-'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className={`font-medium ${
                          netBalance > 0 ? 'text-green-600' : netBalance < 0 ? 'text-blue-600' : 'text-gray-600'
                        }`}>
                          {formatCurrency(Math.abs(netBalance))}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant={balanceStatus === 'balanced' ? 'default' : 'secondary'}>
                          {balanceStatus === 'balanced' ? 'Balanced' : 'Unbalanced'}
                        </Badge>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 bg-gray-50 font-bold">
                  <td colSpan={3} className="py-3 px-4">TOTALS</td>
                  <td className="py-3 px-4 text-right text-green-600">
                    {formatCurrency(totalDebits)}
                  </td>
                  <td className="py-3 px-4 text-right text-blue-600">
                    {formatCurrency(totalCredits)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className={isBalanced ? 'text-green-600' : 'text-red-600'}>
                      {formatCurrency(totalDifference)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Badge variant={isBalanced ? 'default' : 'destructive'}>
                      {isBalanced ? 'BALANCED' : 'UNBALANCED'}
                    </Badge>
                  </td>
                </tr>
              </tfoot>
            </table>
            
            {/* Pagination Controls */}
            {trialBalance?.pagination && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-600">
                  Showing {((trialBalance.pagination.page - 1) * trialBalance.pagination.pageSize) + 1} to {Math.min(trialBalance.pagination.page * trialBalance.pagination.pageSize, trialBalance.pagination.totalCount)} of {trialBalance.pagination.totalCount} accounts
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(1)}
                    disabled={!trialBalance.pagination.hasPrev}
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={!trialBalance.pagination.hasPrev}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {trialBalance.pagination.page} of {trialBalance.pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={!trialBalance.pagination.hasNext}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(trialBalance.pagination.totalPages)}
                    disabled={!trialBalance.pagination.hasNext}
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Page size:</span>
                  <Select value={pageSize.toString()} onValueChange={(value) => {
                    setPageSize(parseInt(value))
                    setCurrentPage(1)
                  }}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
