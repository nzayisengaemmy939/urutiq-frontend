import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Badge } from "../components/ui/badge"
import { 
  BarChart3, 
  Calendar,
  Download,
  Filter,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Hash,
  Clock,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from "lucide-react"
import { accountingApi, type GeneralLedgerData, type LedgerEntry, type Account } from "../lib/api/accounting"

export function GeneralLedger() {
  const [ledgerData, setLedgerData] = useState<GeneralLedgerData | null>(null)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filters
  const [startDate, setStartDate] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedAccountId, setSelectedAccountId] = useState<string>('all')
  const [selectedAccountType, setSelectedAccountType] = useState<string>('all')
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  // Load data on component mount
  useEffect(() => {
    loadAccounts()
  }, [])

  useEffect(() => {
    if (accounts.length > 0) {
      loadLedgerData()
    }
  }, [startDate, endDate, selectedAccountId, selectedAccountType, accounts, currentPage, pageSize])

  const loadAccounts = async () => {
    try {
      const accountsData = await accountingApi.chartOfAccountsApi.getAll()
  // accountsData may be a wrapper { accounts, pagination } or an array
  setAccounts(Array.isArray(accountsData) ? accountsData : accountsData.accounts)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load accounts")
    }
  }

  const loadLedgerData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const data = await accountingApi.generalLedgerApi.getGeneralLedger({
        startDate,
        endDate,
        accountId: selectedAccountId === 'all' ? undefined : selectedAccountId,
        accountType: selectedAccountType === 'all' ? undefined : selectedAccountType,
        page: currentPage,
        pageSize
      })
      
      setLedgerData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load general ledger")
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

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString()
  }

  const getAccountName = (accountId: string): string => {
    const account = accounts.find(acc => acc.id === accountId)
    return account ? `${account.code} - ${account.name}` : "Unknown Account"
  }

  const getAccountTypeName = (accountId: string): string => {
    const account = accounts.find(acc => acc.id === accountId)
    return account?.accountType || "Unknown"
  }

  const getFilteredEntries = (): LedgerEntry[] => {
    if (!ledgerData) return []
    
    let entries = ledgerData.entries
    
    if (selectedAccountId && selectedAccountId !== 'all') {
      entries = entries.filter(entry => entry.accountId === selectedAccountId)
    }
    
    if (selectedAccountType && selectedAccountType !== 'all') {
      entries = entries.filter(entry => {
        const account = accounts.find(acc => acc.id === entry.accountId)
        return account?.accountType === selectedAccountType
      })
    }
    
    return entries
  }

  const getAccountTypeOptions = () => {
    const types = new Set(accounts.map(acc => acc.accountType).filter(Boolean))
    return Array.from(types).sort()
  }

  const calculateRunningBalance = (entries: LedgerEntry[], accountId: string): number => {
    let balance = 0
    entries.forEach(entry => {
      if (entry.accountId === accountId) {
        if (entry.debit > 0) {
          balance += entry.debit
        } else if (entry.credit > 0) {
          balance -= entry.credit
        }
      }
    })
    return balance
  }

  const exportToCSV = () => {
    if (!ledgerData) return
    
    const filteredEntries = getFilteredEntries()
    const headers = ['Date', 'Account', 'Account Type', 'Reference', 'Description', 'Debit', 'Credit', 'Running Balance']
    const rows = filteredEntries.map(entry => [
      formatDate(entry.date),
      getAccountName(entry.accountId),
      getAccountTypeName(entry.accountId),
      entry.reference,
      entry.description,
      entry.debit > 0 ? formatCurrency(entry.debit) : '',
      entry.credit > 0 ? formatCurrency(entry.credit) : '',
      formatCurrency(calculateRunningBalance(filteredEntries.slice(0, filteredEntries.indexOf(entry) + 1), entry.accountId))
    ])
    
    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `general-ledger-${startDate}-to-${endDate}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const clearFilters = () => {
    setSelectedAccountId('all')
    setSelectedAccountType('all')
    setCurrentPage(1)
  }

  if (loading && !ledgerData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading General Ledger...</p>
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
          <Button onClick={loadLedgerData}>Retry</Button>
        </div>
      </div>
    )
  }

  if (!ledgerData) {
    return (
      <div className="text-center py-8 text-gray-500">
        <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p>No general ledger data available</p>
      </div>
    )
  }

  const filteredEntries = getFilteredEntries()
  const totalEntries = filteredEntries.length
  const totalDebits = filteredEntries.reduce((sum, entry) => sum + (entry.debit || 0), 0)
  const totalCredits = filteredEntries.reduce((sum, entry) => sum + (entry.credit || 0), 0)
  const periodDays = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">General Ledger</h2>
          <p className="text-gray-600">Detailed transaction history and account activity</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
          <CardDescription>
            Filter ledger entries by date range, account, and account type
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="account">Account</Label>
              <Select
                value={selectedAccountId}
                onValueChange={setSelectedAccountId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All accounts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All accounts</SelectItem>
                  {accounts.map(account => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.code} - {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="accountType">Account Type</Label>
              <Select
                value={selectedAccountType}
                onValueChange={setSelectedAccountType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  {getAccountTypeOptions().map(type => (
                    <SelectItem key={type} value={String(type)}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEntries}</div>
            <p className="text-xs text-gray-600">Filtered results</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Period</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{periodDays}</div>
            <p className="text-xs text-gray-600">Days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Debits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalDebits)}
            </div>
            <p className="text-xs text-gray-600">Period total</p>
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
            <p className="text-xs text-gray-600">Period total</p>
          </CardContent>
        </Card>
      </div>

      {/* General Ledger Entries */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Ledger Entries
          </CardTitle>
          <CardDescription>
            {selectedAccountId && selectedAccountId !== 'all' ? `Entries for ${getAccountName(selectedAccountId)}` : 'All ledger entries'} 
            from {formatDate(startDate)} to {formatDate(endDate)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredEntries.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No ledger entries found for the selected filters</p>
              <p className="text-sm">Try adjusting your date range or account filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Date</th>
                    <th className="text-left py-3 px-4 font-medium">Account</th>
                    <th className="text-left py-3 px-4 font-medium">Type</th>
                    <th className="text-left py-3 px-4 font-medium">Reference</th>
                    <th className="text-left py-3 px-4 font-medium">Description</th>
                    <th className="text-right py-3 px-4 font-medium">Debit</th>
                    <th className="text-right py-3 px-4 font-medium">Credit</th>
                    <th className="text-right py-3 px-4 font-medium">Running Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEntries.map((entry, index) => {
                    const runningBalance = calculateRunningBalance(
                      filteredEntries.slice(0, index + 1), 
                      entry.accountId
                    )
                    
                    return (
                      <tr key={entry.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3 text-gray-400" />
                            {formatDate(entry.date)}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium">{getAccountName(entry.accountId)}</div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="text-xs">
                            {getAccountTypeName(entry.accountId)}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Hash className="h-3 w-3 text-gray-400" />
                            <span className="font-mono text-sm">{entry.reference}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 max-w-xs">
                          <div className="truncate" title={entry.description}>
                            {entry.description}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className={entry.debit > 0 ? 'text-green-600 font-medium' : 'text-gray-400'}>
                            {entry.debit > 0 ? formatCurrency(entry.debit) : '-'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className={entry.credit > 0 ? 'text-blue-600 font-medium' : 'text-gray-400'}>
                            {entry.credit > 0 ? formatCurrency(entry.credit) : '-'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className={`font-medium ${
                            runningBalance > 0 ? 'text-green-600' : runningBalance < 0 ? 'text-blue-600' : 'text-gray-600'
                          }`}>
                            {formatCurrency(Math.abs(runningBalance))}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 bg-gray-50 font-bold">
                    <td colSpan={5} className="py-3 px-4">TOTALS</td>
                    <td className="py-3 px-4 text-right text-green-600">
                      {formatCurrency(totalDebits)}
                    </td>
                    <td className="py-3 px-4 text-right text-blue-600">
                      {formatCurrency(totalCredits)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className={Math.abs(totalDebits - totalCredits) < 0.01 ? 'text-green-600' : 'text-red-600'}>
                        {formatCurrency(Math.abs(totalDebits - totalCredits))}
                      </span>
                    </td>
                  </tr>
                </tfoot>
              </table>
              
              {/* Pagination Controls */}
              {ledgerData?.pagination && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-600">
                    Showing {((ledgerData.pagination.page - 1) * ledgerData.pagination.pageSize) + 1} to {Math.min(ledgerData.pagination.page * ledgerData.pagination.pageSize, ledgerData.pagination.totalCount)} of {ledgerData.pagination.totalCount} entries
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(1)}
                      disabled={!ledgerData.pagination.hasPrev}
                    >
                      <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={!ledgerData.pagination.hasPrev}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-gray-600">
                      Page {ledgerData.pagination.page} of {ledgerData.pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={!ledgerData.pagination.hasNext}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(ledgerData.pagination.totalPages)}
                      disabled={!ledgerData.pagination.hasNext}
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
          )}
        </CardContent>
      </Card>

      {/* Account Summary */}
      {selectedAccountId && selectedAccountId !== 'all' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Account Summary
            </CardTitle>
            <CardDescription>
              Summary for {getAccountName(selectedAccountId)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(totalDebits)}
                </div>
                <p className="text-sm text-gray-600">Total Debits</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(totalCredits)}
                </div>
                <p className="text-sm text-gray-600">Total Credits</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className={`text-2xl font-bold ${
                  totalDebits > totalCredits ? 'text-green-600' : 'text-blue-600'
                }`}>
                  {formatCurrency(Math.abs(totalDebits - totalCredits))}
                </div>
                <p className="text-sm text-gray-600">Net Change</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
