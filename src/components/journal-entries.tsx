import { useState, useEffect, useMemo } from "react"

// Utility function to ensure SelectItem values are never empty
const safeSelectValue = (value: string | undefined | null): string => {
  if (!value || value.trim() === '') {
    return 'placeholder-value-' + Math.random().toString(36).substr(2, 9)
  }
  return value.trim()
}
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Badge } from "../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog"
import { Textarea } from "../components/ui/textarea"
import { useToast } from "../hooks/use-toast"
import { 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  DollarSign,
  Hash,
  Clock,
  User,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  ChevronsLeft,
  Calculator,
  Search,
  Filter,
  Download,
  Upload,
  Eye,
  EyeOff,
  MoreHorizontal,
  Copy,
  RefreshCw
} from "lucide-react"
import { accountingApi, type JournalEntry, type JournalLine, type Account } from "../lib/api/accounting"

interface JournalLineForm {
  accountId: string
  description: string
  debit: number
  credit: number
}

interface JournalEntryForm {
  reference: string
  description: string
  date: string
  lines: JournalLineForm[]
}

export function JournalEntries() {
  const { toast } = useToast()
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Form states
  const [showEntryDialog, setShowEntryDialog] = useState(false)
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null)
  const [entryForm, setEntryForm] = useState<JournalEntryForm>({
    reference: "",
    description: "",
    date: new Date().toISOString().split('T')[0],
    lines: [{ accountId: "", description: "", debit: 0, credit: 0 }]
  })

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [totalEntries, setTotalEntries] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  // Search and filtering
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "draft" | "posted">("all")
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "week" | "month">("all")
  const [showFilters, setShowFilters] = useState(false)
  
  // Load data on component mount
  useEffect(() => {
    loadData()
  }, [currentPage, pageSize])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [entriesData, accountsData] = await Promise.all([
        accountingApi.journalEntriesApi.getAll(undefined, currentPage, pageSize),
        accountingApi.chartOfAccountsApi.getAll()
      ])
      
      setJournalEntries(entriesData.entries || entriesData)
      // entriesData may be paginated or an array
      setTotalEntries((entriesData as any).pagination?.totalCount || (entriesData as any).length || 0)
      setTotalPages(entriesData.pagination?.totalPages || 1)

      // Handle both paginated and non-paginated account responses
      if (Array.isArray(accountsData)) {
        setAccounts(accountsData)
      } else {
        setAccounts(accountsData.accounts || [])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  const handleEntrySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate balance
    if (!isEntryBalanced()) {
      toast({
        title: "Validation Error",
        description: "Journal entry must be balanced (total debits = total credits)",
        variant: "destructive"
      })
      return
    }
    
    try {
      if (editingEntry) {
        await accountingApi.journalEntriesApi.update(editingEntry.id, entryForm as Partial<any>)
        toast({
          title: "Success",
          description: "Journal entry updated successfully",
          variant: "default"
        })
      } else {
        await accountingApi.journalEntriesApi.create(entryForm as Partial<any>)
        toast({
          title: "Success",
          description: "Journal entry created successfully",
          variant: "default"
        })
      }
      
      setShowEntryDialog(false)
      resetEntryForm()
      loadData()
      setError(null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to save journal entry"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
    }
  }

  const handleDeleteEntry = async (entryId: string) => {
    if (confirm("Are you sure you want to delete this journal entry? This action cannot be undone.")) {
      try {
        await accountingApi.journalEntriesApi.delete(entryId)
        toast({
          title: "Success",
          description: "Journal entry deleted successfully",
          variant: "default"
        })
        loadData()
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to delete journal entry"
        setError(errorMessage)
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive"
        })
      }
    }
  }

  const handlePostEntry = async (entryId: string) => {
    try {
      await accountingApi.journalEntriesApi.post(entryId)
      toast({
        title: "Success",
        description: "Journal entry posted successfully",
        variant: "default"
      })
      loadData()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to post journal entry"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
    }
  }

  const handleCopyEntry = (entry: JournalEntry) => {
    setEntryForm({
      reference: `${entry.reference}-COPY`,
      description: entry.description,
      date: new Date().toISOString().split('T')[0],
      lines: entry.lines.map(line => ({
        accountId: line.accountId,
        description: line.description,
        debit: line.debit,
        credit: line.credit
      }))
    })
    setEditingEntry(null)
    setShowEntryDialog(true)
    toast({
      title: "Entry Copied",
      description: "Journal entry copied to form for editing",
      variant: "default"
    })
  }

  const resetEntryForm = () => {
    setEntryForm({
      reference: "",
      description: "",
      date: new Date().toISOString().split('T')[0],
      lines: [{ accountId: "", description: "", debit: 0, credit: 0 }]
    })
    setEditingEntry(null)
  }

  const editEntry = (entry: JournalEntry) => {
    setEditingEntry(entry)
    setEntryForm({
      reference: entry.reference,
      description: entry.description,
      date: entry.date.split('T')[0],
      lines: entry.lines.map(line => ({
        accountId: line.accountId,
        description: line.description,
        debit: line.debit,
        credit: line.credit
      }))
    })
    setShowEntryDialog(true)
  }

  const addLine = () => {
    setEntryForm(prev => ({
      ...prev,
      lines: [...prev.lines, { accountId: "", description: "", debit: 0, credit: 0 }]
    }))
  }

  const removeLine = (index: number) => {
    if (entryForm.lines.length > 1) {
      setEntryForm(prev => ({
        ...prev,
        lines: prev.lines.filter((_, i) => i !== index)
      }))
    }
  }

  const updateLine = (index: number, field: keyof JournalLineForm, value: string | number) => {
    setEntryForm(prev => ({
      ...prev,
      lines: prev.lines.map((line, i) => 
        i === index ? { ...line, [field]: value } : line
      )
    }))
  }

  const isEntryBalanced = (): boolean => {
    const totalDebits = entryForm.lines.reduce((sum, line) => sum + (line.debit || 0), 0)
    const totalCredits = entryForm.lines.reduce((sum, line) => sum + (line.credit || 0), 0)
    return Math.abs(totalDebits - totalCredits) < 0.01
  }

  const getTotalDebits = (): number => {
    return entryForm.lines.reduce((sum, line) => sum + (line.debit || 0), 0)
  }

  const getTotalCredits = (): number => {
    return entryForm.lines.reduce((sum, line) => sum + (line.credit || 0), 0)
  }

  const getBalanceDifference = (): number => {
    return Math.abs(getTotalDebits() - getTotalCredits())
  }

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const getAccountName = (accountId: string): string => {
    const account = accounts.find(acc => acc.id === accountId)
    return account ? `${account.code} - ${account.name}` : "Unknown Account"
  }

  // Filtered entries based on search and filters
  const filteredEntries = useMemo(() => {
    let filtered = journalEntries

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(entry => 
        entry.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.lines.some(line => 
          line.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          getAccountName(line.accountId).toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(entry => 
        statusFilter === "posted" ? entry.isPosted : !entry.isPosted
      )
    }

    // Date filter
    if (dateFilter !== "all") {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

      filtered = filtered.filter(entry => {
        const entryDate = new Date(entry.date)
        switch (dateFilter) {
          case "today":
            return entryDate >= today
          case "week":
            return entryDate >= weekAgo
          case "month":
            return entryDate >= monthAgo
          default:
            return true
        }
      })
    }

    return filtered
  }, [journalEntries, searchTerm, statusFilter, dateFilter, accounts])

  const clearFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
    setDateFilter("all")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Journal Entries...</p>
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
          <Button onClick={loadData}>Retry</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Journal Entries</h2>
          <p className="text-gray-600">Record and manage financial transactions</p>
        </div>
        <Dialog open={showEntryDialog} onOpenChange={setShowEntryDialog}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => setShowEntryDialog(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Entry
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="border-b pb-4">
              <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                {editingEntry ? "Edit Journal Entry" : "New Journal Entry"}
              </DialogTitle>
              <DialogDescription className="text-base text-muted-foreground mt-2">
                {editingEntry ? "Update journal entry details and line items" : "Create a new journal entry with balanced debit and credit lines"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEntrySubmit}>
              <div className="space-y-6 pt-4">
                {/* Header Fields */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                  <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                    <Hash className="w-5 h-5" />
                    Entry Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="reference" className="text-sm font-medium text-blue-800">
                        Reference Number
                      </Label>
                      <Input
                        id="reference"
                        value={entryForm.reference}
                        onChange={(e) => setEntryForm(prev => ({ ...prev, reference: e.target.value }))}
                        placeholder="JE-001"
                        className="border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="date" className="text-sm font-medium text-blue-800">
                        Transaction Date
                      </Label>
                      <Input
                        id="date"
                        type="date"
                        value={entryForm.date}
                        onChange={(e) => setEntryForm(prev => ({ ...prev, date: e.target.value }))}
                        className="border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-sm font-medium text-blue-800">
                        Description
                      </Label>
                      <Input
                        id="description"
                        value={entryForm.description}
                        onChange={(e) => setEntryForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Transaction description"
                        className="border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Journal Lines */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-green-900 flex items-center gap-2">
                      <DollarSign className="w-5 h-5" />
                      Journal Lines
                    </h3>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={addLine}
                      className="border-green-300 text-green-700 hover:bg-green-100 hover:border-green-400"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Line
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {entryForm.lines.map((line, index) => (
                      <div key={index} className="bg-white p-4 rounded-lg border border-green-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
                          <div className="lg:col-span-4">
                            <Label className="text-sm font-medium text-green-800 mb-2 block">
                              Account
                            </Label>
                            <Select
                              value={line.accountId}
                              onValueChange={(value) => updateLine(index, 'accountId', value)}
                            >
                              <SelectTrigger className="border-green-200 focus:border-green-400 focus:ring-green-400">
                                <SelectValue placeholder="Select account" />
                              </SelectTrigger>
                              <SelectContent>
                                {loading ? (
                                  <SelectItem value="loading" disabled>
                                    Loading accounts...
                                  </SelectItem>
                                ) : (accounts || []).length === 0 ? (
                                  <SelectItem value="no-accounts" disabled>
                                    No accounts available
                                  </SelectItem>
                                ) : (
                                  (accounts || []).map(account => (
                                    <SelectItem key={account.id} value={safeSelectValue(account.id)}>
                                      <div className="flex items-center gap-2">
                                        <span className="font-mono text-sm">{account.code}</span>
                                        <span className="text-muted-foreground">-</span>
                                        <span>{account.name}</span>
                                      </div>
                                    </SelectItem>
                                  ))
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="lg:col-span-4">
                            <Label className="text-sm font-medium text-green-800 mb-2 block">
                              Description
                            </Label>
                            <Input
                              value={line.description}
                              onChange={(e) => updateLine(index, 'description', e.target.value)}
                              placeholder="Line description"
                              className="border-green-200 focus:border-green-400 focus:ring-green-400"
                            />
                          </div>
                          <div className="lg:col-span-2">
                            <Label className="text-sm font-medium text-green-800 mb-2 block">
                              Debit Amount
                            </Label>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={line.debit}
                              onChange={(e) => updateLine(index, 'debit', parseFloat(e.target.value) || 0)}
                              placeholder="0.00"
                              className="border-green-200 focus:border-green-400 focus:ring-green-400 text-right"
                            />
                          </div>
                          <div className="lg:col-span-1">
                            <Label className="text-sm font-medium text-green-800 mb-2 block">
                              Credit Amount
                            </Label>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={line.credit}
                              onChange={(e) => updateLine(index, 'credit', parseFloat(e.target.value) || 0)}
                              placeholder="0.00"
                              className="border-green-200 focus:border-green-400 focus:ring-green-400 text-right"
                            />
                          </div>
                          <div className="lg:col-span-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeLine(index)}
                              disabled={entryForm.lines.length === 1}
                              className="h-10 w-10 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Balance Summary */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
                  <h3 className="text-lg font-semibold text-purple-900 mb-6 flex items-center gap-2">
                    <Calculator className="w-5 h-5" />
                    Balance Summary
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-white p-4 rounded-lg border border-purple-200 shadow-sm">
                      <Label className="text-sm font-medium text-purple-800 mb-2 block text-center">
                        Total Debits
                      </Label>
                      <div className="text-2xl font-bold text-green-600 text-center">
                        {formatCurrency(getTotalDebits())}
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-purple-200 shadow-sm">
                      <Label className="text-sm font-medium text-purple-800 mb-2 block text-center">
                        Total Credits
                      </Label>
                      <div className="text-2xl font-bold text-blue-600 text-center">
                        {formatCurrency(getTotalCredits())}
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-purple-200 shadow-sm">
                      <Label className="text-sm font-medium text-purple-800 mb-2 block text-center">
                        Difference
                      </Label>
                      <div className={`text-2xl font-bold text-center ${
                        getBalanceDifference() < 0.01 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(getBalanceDifference())}
                      </div>
                    </div>
                  </div>
                  
                  {getBalanceDifference() < 0.01 ? (
                    <div className="bg-green-100 border border-green-300 rounded-lg p-4 flex items-center justify-center gap-3 text-green-800">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                      <span className="text-lg font-semibold">Entry is Balanced ✓</span>
                    </div>
                  ) : (
                    <div className="bg-red-100 border border-red-300 rounded-lg p-4 flex items-center justify-center gap-3 text-red-800">
                      <XCircle className="h-6 w-6 text-red-600" />
                      <span className="text-lg font-semibold">Entry is Not Balanced ✗</span>
                      <span className="text-sm text-red-600">
                        (Difference: {formatCurrency(getBalanceDifference())})
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              <DialogFooter className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-3 w-full">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowEntryDialog(false)}
                    className="flex-1 md:flex-none"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={!isEntryBalanced()}
                    className={`flex-1 md:flex-none ${
                      isEntryBalanced() 
                        ? 'bg-green-600 hover:bg-green-700 text-white' 
                        : 'bg-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {editingEntry ? (
                      <>
                        <Edit className="h-4 w-4 mr-2" />
                        Update Entry
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Create Entry
                      </>
                    )}
                  </Button>
                </div>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter Controls */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search journal entries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-80"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filters
                {(statusFilter !== "all" || dateFilter !== "all") && (
                  <Badge variant="secondary" className="ml-1">
                    {(statusFilter !== "all" ? 1 : 0) + (dateFilter !== "all" ? 1 : 0)}
                  </Badge>
                )}
              </Button>
              {(searchTerm || statusFilter !== "all" || dateFilter !== "all") && (
                <Button
                  variant="ghost"
                  onClick={clearFilters}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Clear Filters
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={loadData}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
          
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Status</Label>
                  <Select value={statusFilter} onValueChange={(value: "all" | "draft" | "posted") => setStatusFilter(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="posted">Posted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block">Date Range</Label>
                  <Select value={dateFilter} onValueChange={(value: "all" | "today" | "week" | "month") => setDateFilter(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">Last 7 Days</SelectItem>
                      <SelectItem value="month">Last 30 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="w-full"
                  >
                    Clear All Filters
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredEntries.length}</div>
            <p className="text-xs text-gray-600">
              {filteredEntries.length !== journalEntries.length 
                ? `Filtered from ${journalEntries.length} total` 
                : 'All entries'
              }
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Posted Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {filteredEntries.filter(entry => entry.isPosted).length}
            </div>
            <p className="text-xs text-gray-600">Ready for posting</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Draft Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {filteredEntries.filter(entry => !entry.isPosted).length}
            </div>
            <p className="text-xs text-gray-600">Pending review</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredEntries.filter(entry => {
                const entryDate = new Date(entry.date)
                const now = new Date()
                return entryDate.getMonth() === now.getMonth() && 
                       entryDate.getFullYear() === now.getFullYear()
              }).length}
            </div>
            <p className="text-xs text-gray-600">Current period</p>
          </CardContent>
        </Card>
      </div>

      {/* Journal Entries List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            All Journal Entries
          </CardTitle>
          <CardDescription>
            View and manage all journal entries in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredEntries.map(entry => (
              <div key={entry.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant={entry.isPosted ? "default" : "secondary"}>
                        {entry.isPosted ? "Posted" : "Draft"}
                      </Badge>
                      <span className="font-mono text-sm text-gray-600">{entry.reference}</span>
                      <span className="text-sm text-gray-500">
                        <Calendar className="h-3 w-3 inline mr-1" />
                        {new Date(entry.date).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <h4 className="font-medium mb-2">{entry.description}</h4>
                    
                    <div className="space-y-2">
                      {entry.lines.map((line, index) => (
                        <div key={index} className="flex items-center gap-4 text-sm">
                          <span className="w-32 text-gray-600">
                            {getAccountName(line.accountId)}
                          </span>
                          <span className="w-48 text-gray-700">{line.description}</span>
                          <div className="flex gap-4">
                            <span className={`w-20 text-right ${
                              line.debit > 0 ? 'text-green-600 font-medium' : 'text-gray-400'
                            }`}>
                              {line.debit > 0 ? formatCurrency(line.debit) : '-'}
                            </span>
                            <span className={`w-20 text-right ${
                              line.credit > 0 ? 'text-blue-600 font-medium' : 'text-gray-400'
                            }`}>
                              {line.credit > 0 ? formatCurrency(line.credit) : '-'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    {!entry.isPosted && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePostEntry(entry.id)}
                        className="text-green-600 hover:text-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Post
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyEntry(entry)}
                      className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700"
                      title="Copy Entry"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => editEntry(entry)}
                      className="h-8 w-8 p-0"
                      title="Edit Entry"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteEntry(entry.id)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      title="Delete Entry"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredEntries.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                {journalEntries.length === 0 ? (
                  <>
                    <p>No journal entries found</p>
                    <p className="text-sm">Create your first journal entry to get started</p>
                  </>
                ) : (
                  <>
                    <p>No entries match your filters</p>
                    <p className="text-sm">Try adjusting your search or filter criteria</p>
                    <Button
                      variant="outline"
                      onClick={clearFilters}
                      className="mt-4"
                    >
                      Clear Filters
                    </Button>
                  </>
                )}
              </div>
            )}
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t">
                <div className="text-sm text-gray-600">
                  Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalEntries)} of {totalEntries} entries
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
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
