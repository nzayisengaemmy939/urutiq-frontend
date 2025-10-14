
import { useState, useEffect, useMemo, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Badge } from "../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../components/ui/dialog"
import { Textarea } from "../components/ui/textarea"
import { Switch } from "../components/ui/switch"
import { Checkbox } from "../components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../components/ui/dropdown-menu"
import { Alert, AlertDescription } from "../components/ui/alert"
import { Separator } from "../components/ui/separator"
import { 
  Plus, 
  Edit, 
  Trash2, 
  ChevronDown, 
  ChevronRight,
  AlertCircle,
  CheckCircle,
  XCircle,
  ChevronLeft,
  
  ChevronsLeft,
  ChevronsRight,
  Search,
  Download,
  Upload,
  MoreHorizontal,
  Eye,
  Copy,
  RefreshCw,
  Building2,
  Layers,
  FolderOpen,
  Clock,
  Zap,
  BarChart3,
  Settings,
  FileText,
  Filter,
  
  Calculator
} from "lucide-react"
import { accountingApi, type AccountType, type Account, type AccountSummary } from "../lib/api/accounting"
import { useDemoAuth } from "../hooks/useDemoAuth"
import { formatApiError } from "../lib/error-utils"
import { useToast } from "../hooks/use-toast"

interface AccountTreeNode extends Account {
  children: AccountTreeNode[]
  level: number
  isExpanded?: boolean
}

interface PaginationInfo {
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

interface AccountsWithPagination {
  accounts: Account[]
  pagination: PaginationInfo
}

interface BulkAction {
  id: string
  label: string
  icon: React.ReactNode
  action: (selectedIds: string[]) => Promise<void>
  destructive?: boolean
}

export function ChartOfAccounts() {
  const { ready: authReady } = useDemoAuth('chart-of-accounts')
  const { toast } = useToast()
  const [accountTypes, setAccountTypes] = useState<AccountType[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [accountsWithPagination, setAccountsWithPagination] = useState<AccountsWithPagination | null>(null)
  const [accountTree, setAccountTree] = useState<AccountTreeNode[]>([])
  const [summary, setSummary] = useState<AccountSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Search and filtering
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [showInactive, setShowInactive] = useState(false)
  
  // Selection and bulk operations
  const [selectedAccounts, setSelectedAccounts] = useState<Set<string>>(new Set())
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [bulkOperationError, setBulkOperationError] = useState<string | null>(null)
  
  // Form states
  const [showAccountDialog, setShowAccountDialog] = useState(false)
  const [showTypeDialog, setShowTypeDialog] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [editingType, setEditingType] = useState<AccountType | null>(null)
  
  // View options
  const [viewMode, setViewMode] = useState<"list" | "tree" | "grid">("list")
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  
  // Form data
  const [accountForm, setAccountForm] = useState({
    name: "",
    code: "",
    description: "",
    accountTypeId: undefined as string | undefined,
    parentId: undefined as string | undefined,
    isActive: true
  })
  const [accountFormError, setAccountFormError] = useState<string | null>(null)
  
  const [typeForm, setTypeForm] = useState({
    code: "",
    name: "",
    description: "",
    normalBalance: "debit" as "debit" | "credit",
    category: ""
  })

  // Ensure accountTypeId is set when dialog opens for new account
  useEffect(() => {
    if (showAccountDialog && !editingAccount && accountTypes.length > 0 && !accountForm.accountTypeId) {
      setAccountForm((prev) => ({ ...prev, accountTypeId: accountTypes[0].id }));
    }
  }, [showAccountDialog, editingAccount, accountTypes, accountForm.accountTypeId]);

  // Helper: build account tree from flat list
  const buildAccountTree = (accounts: Account[]): AccountTreeNode[] => {
    const accountMap = new Map<string, AccountTreeNode>()
    const rootAccounts: AccountTreeNode[] = []
    
    // Create nodes
    accounts.forEach(account => {
      accountMap.set(account.id, {
        ...account,
        children: [],
        level: 0,
        isExpanded: expandedNodes.has(account.id)
      })
    })
    
    // Build hierarchy
    accounts.forEach(account => {
      const node = accountMap.get(account.id)
      if (!node) return
      
      if (account.parentId && accountMap.has(account.parentId)) {
        const parent = accountMap.get(account.parentId)!
        parent.children.push(node)
        node.level = parent.level + 1
      } else {
        rootAccounts.push(node)
      }
    })
    
    return rootAccounts
  }

  // Load data (wrapped with useCallback to keep identity stable)
  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Get company ID from localStorage
      const companyId = localStorage.getItem('company_id') || localStorage.getItem('companyId') || localStorage.getItem('company') || undefined
      
      // Load live data using the shared accounting API
      const [typesData, accountsResp] = await Promise.all([
        accountingApi.accountTypesApi.getAll(companyId),
        accountingApi.chartOfAccountsApi.getAll(companyId, showInactive)
      ])

      setAccountTypes(Array.isArray(typesData) ? typesData : [])

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const accountsList: Account[] = Array.isArray((accountsResp as any))
        ? (accountsResp as Account[])
        : (accountsResp as unknown as { accounts: Account[]; pagination?: any })?.accounts ?? []

      setAccountsWithPagination(null)
      setAccounts(accountsList)

      setSummary({
        totalAccounts: accountsList.length,
        activeAccounts: accountsList.filter(a => (a as any).isActive !== false).length,
        totalAccountTypes: Array.isArray(typesData) ? typesData.length : 0,
        maxDepth: 3,
        lastUpdated: new Date().toLocaleDateString()
      })

      const tree = buildAccountTree(accountsList)
      setAccountTree(tree)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data")
    } finally {
      setLoading(false)
    }
  }, [showInactive, currentPage, pageSize, expandedNodes])

  // Bulk actions configuration
  const bulkActions: BulkAction[] = [
    {
      id: "activate",
      label: "Activate",
      icon: <CheckCircle className="h-4 w-4" />,
      action: handleBulkActivate
    },
    {
      id: "deactivate",
      label: "Deactivate",
      icon: <XCircle className="h-4 w-4" />,
      action: handleBulkDeactivate
    },
    {
      id: "export",
      label: "Export Selected",
      icon: <Download className="h-4 w-4" />,
      action: handleBulkExport
    },
    {
      id: "delete",
      label: "Delete",
      icon: <Trash2 className="h-4 w-4" />,
      action: handleBulkDelete,
      destructive: true
    }
  ]

  // Load data
  useEffect(() => {
    loadData()
  }, [loadData])

  // Filter accounts based on search and filters
  const filteredAccounts = useMemo(() => {
    if (!accounts) return []
    
    return accounts.filter(account => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        const matchesSearch = 
          account.name.toLowerCase().includes(searchLower) ||
          account.code.toLowerCase().includes(searchLower) ||
          account.description?.toLowerCase().includes(searchLower) ||
          (account.accountType && account.accountType.toLowerCase().includes(searchLower))
        
        if (!matchesSearch) return false
      }
      
      // Type filter
      if (filterType !== "all" && account.accountTypeId !== filterType) {
        return false
      }
      
      // Status filter
      if (filterStatus === "active" && !account.isActive) return false
      if (filterStatus === "inactive" && account.isActive) return false
      
      return true
    })
  }, [accounts, searchTerm, filterType, filterStatus])
  

  // Bulk action handlers
  async function handleBulkActivate(selectedIds: string[]) {
    try {
      setBulkOperationError(null)
      await Promise.all(
        selectedIds.map(id => accountingApi.chartOfAccountsApi.update(id, { isActive: true }))
      )
      await loadData()
      setSelectedAccounts(new Set())
      setShowBulkActions(false)
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to activate accounts"
      setBulkOperationError(msg)
      console.error("Failed to activate accounts:", error)
    }
  }

  async function handleBulkDeactivate(selectedIds: string[]) {
    try {
      setBulkOperationError(null)
      await Promise.all(
        selectedIds.map(id => accountingApi.chartOfAccountsApi.update(id, { isActive: false }))
      )
      await loadData()
      setSelectedAccounts(new Set())
      setShowBulkActions(false)
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to deactivate accounts"
      setBulkOperationError(msg)
      console.error("Failed to deactivate accounts:", error)
    }
  }

  async function handleBulkExport(selectedIds: string[]) {
    try {
      setBulkOperationError(null)
      const selectedAccountsData = accounts.filter(account => selectedIds.includes(account.id))
      const csvContent = generateCSV(selectedAccountsData)
      downloadCSV(csvContent, "chart-of-accounts.csv")
      setSelectedAccounts(new Set())
      setShowBulkActions(false)
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to export accounts"
      setBulkOperationError(msg)
      console.error("Failed to export accounts:", error)
    }
  }

  async function handleBulkDelete(selectedIds: string[]) {
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} accounts? This action cannot be undone.`)) {
      return
    }
    
    try {
      setBulkOperationError(null)
  await Promise.all(selectedIds.map(id => accountingApi.chartOfAccountsApi.delete(id)))
      await loadData()
      setSelectedAccounts(new Set())
      setShowBulkActions(false)
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to delete accounts"
      setBulkOperationError(msg)
      console.error("Failed to delete accounts:", error)
    }
  }

  // Helper functions
  const generateCSV = (accounts: Account[]) => {
    const headers = ["Code", "Name", "Type", "Parent", "Description", "Status"]
    const rows = accounts.map(account => [
      account.code,
      account.name,
      account.accountType || "",
      account.parent?.name || "",
      account.description || "",
      account.isActive ? "Active" : "Inactive"
    ])
    
    return [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(","))
      .join("\n")
  }

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  // Extracted function for creating a new account

  const createAccount = async (form: typeof accountForm) => {
    // Validate required fields
    if (!form.accountTypeId) {
      throw new Error("Account type is required.");
    }
    if (!form.code || !form.name) {
      throw new Error("Account code and name are required.");
    }
    
    // Map frontend field names to backend field names
    // Only send fields that the backend accountCreate schema expects
    const companyId = localStorage.getItem('company_id') || localStorage.getItem('companyId') || localStorage.getItem('company')
    
    const payload = {
      code: form.code.trim(),
      name: form.name.trim(),
      typeId: form.accountTypeId,
      parentId: form.parentId || undefined,
      companyId: companyId // Use real company ID from localStorage
    }
    
    return await accountingApi.chartOfAccountsApi.create(payload)
  }


  

  
  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAccountFormError(null);
    try {
      if (editingAccount) {
        // For updates, only validate if fields are being changed
        // No required field validation for updates - only update what's provided
        
        // Map frontend field names to backend field names for update
        // Only send fields that the backend accountUpdate schema expects
        const updatePayload = {
          code: accountForm.code.trim(),
          name: accountForm.name.trim(),
          typeId: accountForm.accountTypeId, // Map accountTypeId to typeId for backend
          parentId: accountForm.parentId || undefined,
          isActive: accountForm.isActive
          // Note: description is not in the accountUpdate schema
        }
        
        await accountingApi.chartOfAccountsApi.update(editingAccount.id, updatePayload)
      } else {
        await createAccount(accountForm)
      }
      await loadData();
      setShowAccountDialog(false);
      setEditingAccount(null);
      setAccountForm({
        name: "",
        code: "",
        description: "",
        accountTypeId: undefined,
        parentId: undefined,
        isActive: true
      });
    } catch (error: any) {
      console.error("Failed to save account:", error);
      console.error("Error details:", {
        message: error.message,
        status: (error as any).status,
        details: (error as any).details,
        stack: error.stack
      });
      
      // Use the new error formatting utility
      const { title, message, details } = formatApiError(error);
      
      // Handle specific error cases
      let errorMsg = message;
      let errorTitle = title;
      
      if (message.includes('ACCOUNT_CODE_EXISTS') || 
          message.includes('duplicate') ||
          message.includes('already exists') ||
          message.includes('code already exists')) {
        errorTitle = "Duplicate Account Code";
        errorMsg = "An account with this code already exists. Please use a different code.";
      } else if (message.includes('validation_error') || 
                 message.includes('Invalid input') ||
                 message.includes('expected string, received undefined')) {
        errorTitle = "Validation Error";
        // Keep the detailed validation message
      } else if (details) {
        errorMsg += `\n\nDetails:\n${details}`;
      }
      
      setAccountFormError(errorMsg);
      
      // Also show toast notification
      toast({
        title: errorTitle,
        description: errorMsg,
        variant: "destructive",
        duration: 6000,
      });
    }
  };

  const [typeFormError, setTypeFormError] = useState<string | null>(null);

  const handleTypeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setTypeFormError(null)
    try {
      if (!typeForm.code || !typeForm.name) {
        throw new Error("Type code and name are required.");
      }
      const payload: any = {
        code: typeForm.code,
        name: typeForm.name
      };
      if (editingType) {
        await accountingApi.accountTypesApi.update(editingType.id, payload)
      } else {
        await accountingApi.accountTypesApi.create(payload)
      }
      await loadData()
      setShowTypeDialog(false)
      setEditingType(null)
      setTypeForm({
        code: "",
        name: "",
        description: "",
        normalBalance: "debit",
        category: ""
      })
    } catch (error: any) {
      let msg = "Failed to save account type.";
      
      // Handle specific API errors
      if (error?.response?.data?.error?.code === 'ACCOUNT_TYPE_EXISTS') {
        msg = "Account type code already exists. Please use a different code.";
      } else if (error?.response?.data?.error?.code === 'invalid_body') {
        // Handle validation errors with specific field details
        const validationErrors = error?.response?.data?.error?.details;
        if (validationErrors) {
          const fieldErrors = Object.entries(validationErrors.fieldErrors || {})
            .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
            .join('; ');
          msg = `Validation error: ${fieldErrors}`;
        } else {
          msg = "Invalid data provided. Please check all required fields.";
        }
      } else if (error?.response?.data?.error?.message) {
        msg = error.response.data.error.message;
      } else if (error instanceof Error) {
        msg = error.message;
      }
      
      setTypeFormError(msg);
      console.error("Failed to save account type:", error)
    }
  }

  const editAccount = (account: Account) => {
    setEditingAccount(account)
    setAccountForm({
      name: account.name,
      code: account.code,
      description: account.description || "",
      accountTypeId: account.accountTypeId,
      parentId: account.parentId || undefined,
      isActive: account.isActive
    })
    setShowAccountDialog(true)
  }

  const editType = (type: AccountType) => {
    setEditingType(type)
    setTypeForm({
      code: type.code || "",
      name: type.name,
      description: type.description || "",
      normalBalance: type.normalBalance,
      category: type.category || ""
    })
    setShowTypeDialog(true)
  }

  const handleDeleteAccount = async (accountId: string) => {
    if (!confirm("Are you sure you want to delete this account?")) return
    
    try {
      await accountingApi.chartOfAccountsApi.delete(accountId)
      await loadData()
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to delete account"
      setError(msg)
      console.error("Failed to delete account:", error)
    }
  }

  const handleDeleteType = async (typeId: string) => {
    if (!confirm("Are you sure you want to delete this account type?")) return
    
    try {
      await accountingApi.accountTypesApi.delete(typeId)
      await loadData()
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to delete account type"
      setError(msg)
      console.error("Failed to delete account type:", error)
    }
  }

  const toggleAccountSelection = (accountId: string) => {
    const newSelection = new Set(selectedAccounts)
    if (newSelection.has(accountId)) {
      newSelection.delete(accountId)
    } else {
      newSelection.add(accountId)
    }
    setSelectedAccounts(newSelection)
    setShowBulkActions(newSelection.size > 0)
  }

  const selectAllAccounts = () => {
    if (selectedAccounts.size === filteredAccounts.length) {
      setSelectedAccounts(new Set())
      setShowBulkActions(false)
    } else {
      setSelectedAccounts(new Set(filteredAccounts.map(account => account.id)))
      setShowBulkActions(true)
    }
  }

  const toggleNodeExpansion = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes)
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId)
    } else {
      newExpanded.add(nodeId)
    }
    setExpandedNodes(newExpanded)
  }

  const renderAccountNode = (node: AccountTreeNode): React.ReactNode => {
    const hasChildren = node.children.length > 0
    const isExpanded = expandedNodes.has(node.id)
    const isSelected = selectedAccounts.has(node.id)
    
    return (
      <div key={node.id} className="space-y-1">
        <div 
          className={`flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 ${
            isSelected ? "bg-blue-50 border-blue-200" : ""
          }`}
          style={{ paddingLeft: `${node.level * 20 + 8}px` }}
        >
          {hasChildren && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => toggleNodeExpansion(node.id)}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          )}
          
          {!hasChildren && <div className="w-6" />}
          
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => toggleAccountSelection(node.id)}
          />
          
          <div className="flex-1 flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-medium">{node.code}</span>
                <span>{node.name}</span>
                {!node.isActive && (
                  <Badge variant="secondary">Inactive</Badge>
                )}
              </div>
              {node.description && node.description !== "" && (
                <p className="text-sm text-gray-600">{node.description}</p>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge variant="outline">
                {accountTypes.find(t => t.id === node.accountTypeId)?.name || "Unknown Type"}
              </Badge>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => editAccount(node)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {}}>
                    <Copy className="mr-2 h-4 w-4" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {}}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Transactions
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => handleDeleteAccount(node.id)}
                    className="text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
        
        {hasChildren && isExpanded && (
          <div className="space-y-1">
            {node.children.map(child => renderAccountNode(child))}
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <div className="relative">
            <RefreshCw className="h-12 w-12 animate-spin mx-auto text-blue-600" />
            <div className="absolute inset-0 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin"></div>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">Loading Chart of Accounts</h3>
            <p className="text-gray-500">Please wait while we fetch your account data...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-[400px] flex items-center justify-center p-8">
        <div className="text-center space-y-4 max-w-md">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">Something went wrong</h3>
            <p className="text-gray-500">{error}</p>
          </div>
          <Button 
            onClick={loadData} 
            variant="outline"
            className="mt-4"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header with Stats */}
      {summary && (
        <div className="space-y-6">
          {/* Main Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-md transition-all duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-blue-800">Total Accounts</CardTitle>
                  <Building2 className="h-5 w-5 text-blue-600" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold text-blue-900">{summary.totalAccounts}</div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <p className="text-sm text-blue-700">
                    {summary.activeAccounts} active accounts
                  </p>
                </div>
            </CardContent>
          </Card>
          
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-md transition-all duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-green-800">Account Types</CardTitle>
                  <Layers className="h-5 w-5 text-green-600" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold text-green-900">{summary.totalAccountTypes}</div>
                <p className="text-sm text-green-700 mt-2">Categories defined</p>
            </CardContent>
          </Card>
          
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-md transition-all duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-purple-800">Hierarchy Levels</CardTitle>
                  <FolderOpen className="h-5 w-5 text-purple-600" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold text-purple-900">{summary.maxDepth}</div>
                <p className="text-sm text-purple-700 mt-2">Maximum depth</p>
            </CardContent>
          </Card>
          
            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-md transition-all duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-orange-800">Last Updated</CardTitle>
                  <Clock className="h-5 w-5 text-orange-600" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-orange-900">{summary.lastUpdated}</div>
                <p className="text-sm text-orange-700 mt-2">Recent activity</p>
              </CardContent>
            </Card>
          </div>
          
          {/* Quick Actions Bar */}
          <Card className="bg-gradient-to-r from-slate-50 to-gray-50 border-slate-200">
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-500" />
                  <span className="text-sm font-medium text-slate-700">Quick Actions</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => setShowAccountDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Account
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setShowTypeDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Type
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setShowImportDialog(true)}>
                    <Upload className="h-4 w-4 mr-2" />
                    Import
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Enhanced Main Content with Tabs */}
      <Tabs defaultValue="accounts" className="space-y-6">
        <div className="bg-white rounded-lg border border-slate-200 p-1 shadow-sm">
          <TabsList className="grid w-full grid-cols-3 bg-transparent">
            <TabsTrigger 
              value="accounts" 
              className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-sm"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Accounts
            </TabsTrigger>
            <TabsTrigger 
              value="types"
              className="data-[state=active]:bg-green-50 data-[state=active]:text-green-700 data-[state=active]:shadow-sm"
            >
              <Layers className="h-4 w-4 mr-2" />
              Account Types
            </TabsTrigger>
            <TabsTrigger 
              value="settings"
              className="data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700 data-[state=active]:shadow-sm"
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
        </TabsList>
        </div>

        <TabsContent value="accounts" className="space-y-6">
          {/* Search and filters */}
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    Chart of Accounts
                  </CardTitle>
                  <CardDescription className="text-gray-600 mt-1">
                Manage your organization's account structure and hierarchy
              </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {filteredAccounts.length} accounts
                  </Badge>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    {accounts.filter(a => a.isActive).length} active
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Enhanced Search and Filter Controls */}
              <div className="space-y-4">
                {/* Primary Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                    placeholder="Search accounts by name, code, description, or type..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-12 text-base"
                  />
                  {searchTerm && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                      onClick={() => setSearchTerm("")}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  )}
                  </div>
                
                {/* Filter Controls */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Filters:</span>
                </div>
                
                <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Account Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {accountTypes.filter(type => type.id && type.id !== "").map(type => (
                      <SelectItem key={type.id} value={type.id}>
                          {type.name || type.code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="show-inactive"
                      checked={showInactive}
                      onCheckedChange={setShowInactive}
                    />
                    <Label htmlFor="show-inactive" className="text-sm">
                      Show Inactive
                    </Label>
                  </div>
                  </div>
                  
                {/* View Mode Selector */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">View:</span>
                    <div className="flex bg-gray-100 rounded-lg p-1">
                      {["list", "tree", "grid"].map((mode) => (
                        <Button
                          key={mode}
                          variant={viewMode === mode ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setViewMode(mode as "list" | "tree" | "grid")}
                          className="h-8 px-3 text-xs"
                        >
                          {mode === "list" && <FileText className="h-3 w-3 mr-1" />}
                          {mode === "tree" && <FolderOpen className="h-3 w-3 mr-1" />}
                          {mode === "grid" && <Layers className="h-3 w-3 mr-1" />}
                          {mode.charAt(0).toUpperCase() + mode.slice(1)}
                        </Button>
                      ))}
                </div>
              </div>

                <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={loadData}
                      disabled={loading}
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                      Refresh
                    </Button>
                  </div>
                </div>
              </div>

              {/* Enhanced Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-gradient-to-r from-slate-50 to-gray-50 rounded-lg border border-slate-200">
                <div className="flex flex-wrap items-center gap-2">
                  <Button 
                    onClick={() => setShowAccountDialog(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Account
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => setShowTypeDialog(true)}
                    className="border-green-200 text-green-700 hover:bg-green-50"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Type
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => setShowImportDialog(true)}
                    className="border-purple-200 text-purple-700 hover:bg-purple-50"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Import
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => handleBulkExport(accounts.map(a => a.id))}
                    className="border-orange-200 text-orange-700 hover:bg-orange-50"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export All
                  </Button>
                </div>
                
                <div className="flex items-center gap-3">
                  {selectedAccounts.size > 0 && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">
                      {selectedAccounts.size} selected
                      </span>
                    </div>
                  )}
                  
                  <div className="text-sm text-gray-500">
                    {filteredAccounts.length} of {accounts.length} accounts
                  </div>
                </div>
              </div>

              {/* Enhanced Bulk Actions Bar */}
              {showBulkActions && (
                <div className="space-y-3">
                  {bulkOperationError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{bulkOperationError}</AlertDescription>
                    </Alert>
                  )}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-4 shadow-sm">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-800 rounded-full">
                          <CheckCircle className="h-4 w-4" />
                          <span className="font-medium">
                    {selectedAccounts.size} accounts selected
                  </span>
                        </div>
                        <span className="text-sm text-blue-700">
                          Choose an action to perform on selected accounts
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-2">
                    {bulkActions.map(action => (
                      <Button
                        key={action.id}
                        variant={action.destructive ? "destructive" : "outline"}
                        size="sm"
                        onClick={() => action.action(Array.from(selectedAccounts))}
                            className={action.destructive ? "bg-red-600 hover:bg-red-700" : "hover:shadow-sm"}
                      >
                        {action.icon}
                        <span className="ml-2">{action.label}</span>
                      </Button>
                    ))}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedAccounts(new Set())
                        setShowBulkActions(false)
                            setBulkOperationError(null)
                      }}
                          className="text-gray-600 hover:text-gray-800"
                    >
                          Clear Selection
                    </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Account list/tree */}
              <div className="space-y-4">
                {/* Enhanced Select All Section */}
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-50 to-gray-50 rounded-lg border border-slate-200">
                  <div className="flex items-center gap-3">
                  <Checkbox
                    checked={selectedAccounts.size === filteredAccounts.length && filteredAccounts.length > 0}
                    onCheckedChange={selectAllAccounts}
                      className="h-5 w-5"
                  />
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                    Select All ({filteredAccounts.length} accounts)
                  </span>
                      {selectedAccounts.size > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          {selectedAccounts.size} of {filteredAccounts.length} selected
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>View:</span>
                    <span className="font-medium">{viewMode.charAt(0).toUpperCase() + viewMode.slice(1)}</span>
                  </div>
                </div>

                {/* Accounts display */}
                {viewMode === "tree" ? (
                  <div className="space-y-1">
                    {accountTree.map(node => renderAccountNode(node))}
                  </div>
                ) : viewMode === "grid" ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredAccounts.map(account => (
                      <Card key={account.id} className={`cursor-pointer transition-colors ${
                        selectedAccounts.has(account.id) ? "border-blue-500 bg-blue-50" : ""
                      }`}>
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                checked={selectedAccounts.has(account.id)}
                                onCheckedChange={() => toggleAccountSelection(account.id)}
                              />
                              <Badge variant="outline">
                                {account.code}
                              </Badge>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => editAccount(account)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDeleteAccount(account.id)}>
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          <CardTitle className="text-lg">{account.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Type</span>
                              <Badge variant="secondary">
                                {accountTypes.find(t => t.id === account.accountTypeId)?.name || "Unknown Type"}
                              </Badge>
                            </div>
                            {account.description && account.description !== "" && (
                              <p className="text-sm text-muted-foreground">
                                {account.description}
                              </p>
                            )}
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Status</span>
                              <Badge variant={account.isActive ? "default" : "secondary"}>
                                {account.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  // List view
                  <div className="space-y-2">
                    {filteredAccounts.map(account => (
                      <div
                        key={account.id}
                        className={`flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 ${
                          selectedAccounts.has(account.id) ? "border-blue-500 bg-blue-50" : ""
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            checked={selectedAccounts.has(account.id)}
                            onCheckedChange={() => toggleAccountSelection(account.id)}
                          />
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">{account.code}</span>
                              <span>{account.name}</span>
                              {!account.isActive && (
                                <Badge variant="secondary">Inactive</Badge>
                              )}
                            </div>
                            {account.description && account.description !== "" && (
                              <p className="text-sm text-muted-foreground">
                                {account.description}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">
                            {accountTypes.find(t => t.id === account.accountTypeId)?.name || "Unknown Type"}
                          </Badge>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => editAccount(account)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {}}>
                                <Copy className="mr-2 h-4 w-4" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {}}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Transactions
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDeleteAccount(account.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Enhanced Pagination */}
              {accountsWithPagination && accountsWithPagination.pagination && (
                <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-lg border border-slate-200 p-4">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FileText className="h-4 w-4" />
                      <span>
                        Showing <span className="font-medium text-gray-900">
                          {((accountsWithPagination.pagination.page - 1) * accountsWithPagination.pagination.pageSize) + 1}
                        </span> to <span className="font-medium text-gray-900">
                          {Math.min(accountsWithPagination.pagination.page * accountsWithPagination.pagination.pageSize, accountsWithPagination.pagination.totalCount)}
                        </span> of <span className="font-medium text-gray-900">
                          {accountsWithPagination.pagination.totalCount}
                        </span> accounts
                      </span>
                  </div>
                    
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(1)}
                      disabled={!accountsWithPagination.pagination.hasPrev}
                        className="h-8 w-8 p-0 hover:bg-blue-50 hover:border-blue-200"
                    >
                      <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={!accountsWithPagination.pagination.hasPrev}
                        className="h-8 w-8 p-0 hover:bg-blue-50 hover:border-blue-200"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                      
                      <div className="flex items-center gap-1 px-3 py-1 bg-white border border-slate-200 rounded-md">
                        <span className="text-sm font-medium text-gray-900">
                          Page {accountsWithPagination.pagination.page}
                    </span>
                        <span className="text-sm text-gray-500">of {accountsWithPagination.pagination.totalPages}</span>
                      </div>
                      
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={!accountsWithPagination.pagination.hasNext}
                        className="h-8 w-8 p-0 hover:bg-blue-50 hover:border-blue-200"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(accountsWithPagination.pagination.totalPages)}
                      disabled={!accountsWithPagination.pagination.hasNext}
                        className="h-8 w-8 p-0 hover:bg-blue-50 hover:border-blue-200"
                    >
                      <ChevronsRight className="h-4 w-4" />
                    </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="types" className="space-y-6">
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <Layers className="h-5 w-5 text-green-600" />
                    Account Types
                  </CardTitle>
                  <CardDescription className="text-gray-600 mt-1">
                Manage account categories and their normal balance behavior
              </CardDescription>
                </div>
                <Button 
                  onClick={() => setShowTypeDialog(true)}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Type
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {accountTypes.length === 0 ? (
                <div className="text-center py-12">
                  <Layers className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No account types yet</h3>
                  <p className="text-gray-500 mb-4">Create your first account type to get started</p>
                  <Button onClick={() => setShowTypeDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Account Type
                  </Button>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {accountTypes.map(type => (
                    <Card key={type.id} className="hover:shadow-md transition-all duration-200 border-slate-200">
                      <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                          <CardTitle className="text-lg text-gray-900">{type.name}</CardTitle>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-slate-100">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => editType(type)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteType(type.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                            <span className="text-sm font-medium text-gray-700">Normal Balance</span>
                            <Badge 
                              variant={type.normalBalance === "debit" ? "default" : "secondary"}
                              className={type.normalBalance === "debit" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"}
                            >
                            {type.normalBalance === "debit" ? "Debit" : "Credit"}
                          </Badge>
                        </div>
                          {type.description && type.description !== "" && (
                            <div className="p-2 bg-slate-50 rounded-lg">
                              <p className="text-sm text-gray-600">{type.description}</p>
                            </div>
                          )}
                          {type.category && type.category !== "" && (
                            <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                              <span className="text-sm font-medium text-gray-700">Category</span>
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                {type.category}
                              </Badge>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 border-b border-purple-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <Settings className="h-5 w-5 text-purple-600" />
                    Chart of Accounts Settings
                  </CardTitle>
                  <CardDescription className="text-gray-600 mt-1">
                    Configure general settings and preferences for your chart of accounts
              </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-8">
                {/* Display Options */}
              <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <h3 className="text-lg font-semibold text-gray-900">Display Options</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div>
                        <Label className="text-base font-medium">Show Account Codes</Label>
                        <p className="text-sm text-gray-600 mt-1">Display account codes alongside names for better identification</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div>
                        <Label className="text-base font-medium">Show Inactive Accounts</Label>
                        <p className="text-sm text-gray-600 mt-1">Include inactive accounts in lists and searches</p>
                      </div>
                      <Switch checked={showInactive} onCheckedChange={setShowInactive} />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div>
                        <Label className="text-base font-medium">Auto-expand Tree</Label>
                        <p className="text-sm text-gray-600 mt-1">Automatically expand account hierarchy when switching to tree view</p>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </div>
                
                <Separator className="bg-slate-200" />
                
                {/* Import/Export */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <h3 className="text-lg font-semibold text-gray-900">Import/Export</h3>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2">
                    <Card className="border-slate-200 hover:shadow-md transition-all duration-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Upload className="h-4 w-4 text-blue-600" />
                          Import Accounts
                        </CardTitle>
                        <CardDescription>Upload a CSV file to import accounts in bulk</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => setShowImportDialog(true)}>
                          <Upload className="mr-2 h-4 w-4" />
                          Import CSV
                        </Button>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-slate-200 hover:shadow-md transition-all duration-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Download className="h-4 w-4 text-green-600" />
                          Export Accounts
                        </CardTitle>
                        <CardDescription>Download your complete chart of accounts</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => handleBulkExport(accounts.map(a => a.id))}>
                          <Download className="mr-2 h-4 w-4" />
                          Export CSV
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
                
                <Separator className="bg-slate-200" />
                
                {/* System Info */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <h3 className="text-lg font-semibold text-gray-900">System Information</h3>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Calculator className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-gray-700">Total Accounts</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{accounts.length}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Layers className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-gray-700">Account Types</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{accountTypes.length}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Account Dialog */}
      <Dialog open={showAccountDialog} onOpenChange={setShowAccountDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingAccount ? "Edit Account" : "Add New Account"}
            </DialogTitle>
            <DialogDescription>
              {editingAccount ? "Update account information" : "Create a new account in your chart of accounts"}
            </DialogDescription>
          </DialogHeader>
          {(() => {
            try {
              return (
                <form onSubmit={handleAccountSubmit} className="space-y-4">
                  {accountFormError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{accountFormError}</AlertDescription>
                    </Alert>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="account-code">Account Code</Label>
                      <Input
                        id="account-code"
                        value={accountForm.code || ""}
                        onChange={(e) => setAccountForm({...accountForm, code: e.target.value})}
                        placeholder="e.g., 1000"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="account-name">Account Name</Label>
                      <Input
                        id="account-name"
                        value={accountForm.name || ""}
                        onChange={(e) => setAccountForm({...accountForm, name: e.target.value})}
                        placeholder="e.g., Cash"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="account-type">Account Type</Label>
                    {accountTypes.filter(type => type.id).length > 0 ? (
                      <select
                        id="account-type"
                        className="w-full border rounded px-2 py-2"
                        value={accountForm.accountTypeId || (accountTypes.filter(type => type.id)[0]?.id || "placeholder")}
                        onChange={e => setAccountForm({ ...accountForm, accountTypeId: e.target.value === "placeholder" ? undefined : e.target.value })}
                        required
                      >
                        <option value="placeholder" disabled>Select an account type</option>
                        {accountTypes.filter(type => type.id).map(type => (
                          <option key={type.id} value={type.id}>{type.name || type.code}</option>
                        ))}
                      </select>
                    ) : (
                      <div className="text-sm text-red-500">No account types available. Please add an account type first.</div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="parent-account">Parent Account (Optional)</Label>
                    <select
                      id="parent-account"
                      className="w-full border rounded px-2 py-2"
                      value={accountForm.parentId || "none"}
                                              onChange={e => setAccountForm({ ...accountForm, parentId: e.target.value === "none" ? undefined : e.target.value })}
                    >
                      <option value="none">No Parent</option>
                      {accounts
                        .filter(account => account.id && account.id !== editingAccount?.id)
                        .map(account => (
                          <option key={account.id} value={account.id}>
                            {account.code || ""} - {account.name || ""}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="account-description">Description (Optional)</Label>
                    <Textarea
                      id="account-description"
                      value={accountForm.description || ""}
                      onChange={(e) => setAccountForm({...accountForm, description: e.target.value})}
                      placeholder="Account description..."
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="account-active"
                      checked={!!accountForm.isActive}
                      onCheckedChange={(checked) => setAccountForm({...accountForm, isActive: checked})}
                    />
                    <Label htmlFor="account-active">Account is active</Label>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setShowAccountDialog(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingAccount ? "Update Account" : "Create Account"}
                    </Button>
                  </DialogFooter>
                </form>
              );
            } catch (err) {
              return (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Something went wrong rendering the account form. Please check your form state and try again.
                  </AlertDescription>
                </Alert>
              );
            }
          })()}
        </DialogContent>
      </Dialog>

      {/* Account Type Dialog */}
      <Dialog open={showTypeDialog} onOpenChange={setShowTypeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingType ? "Edit Account Type" : "Add New Account Type"}
            </DialogTitle>
            <DialogDescription>
              {editingType ? "Update account type information" : "Create a new account type"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleTypeSubmit} className="space-y-4">
            {typeFormError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{typeFormError}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="type-code">Type Code</Label>
              <Input
                id="type-code"
                value={typeForm.code}
                onChange={(e) => setTypeForm({...typeForm, code: e.target.value})}
                placeholder="e.g., ASSET"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type-name">Type Name</Label>
              <Input
                id="type-name"
                value={typeForm.name}
                onChange={(e) => setTypeForm({...typeForm, name: e.target.value})}
                placeholder="e.g., Assets"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="normal-balance">Normal Balance</Label>
              <Select 
                value={typeForm.normalBalance || "debit"}
                onValueChange={(value: "debit" | "credit") => setTypeForm({...typeForm, normalBalance: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="debit">Debit</SelectItem>
                  <SelectItem value="credit">Credit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="type-category">Category (Optional)</Label>
              <Input
                id="type-category"
                value={typeForm.category}
                onChange={(e) => setTypeForm({...typeForm, category: e.target.value})}
                placeholder="e.g., Current Assets"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type-description">Description (Optional)</Label>
              <Textarea
                id="type-description"
                value={typeForm.description}
                onChange={(e) => setTypeForm({...typeForm, description: e.target.value})}
                placeholder="Type description..."
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowTypeDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingType ? "Update Type" : "Create Type"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Accounts</DialogTitle>
            <DialogDescription>
              Upload a CSV file to import accounts. The file should include columns for Code, Name, Type, Parent, Description, and Status.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <div>
                <Button variant="outline">
                  Choose File
                </Button>
                <p className="text-sm text-muted-foreground mt-2">
                  or drag and drop your CSV file here
                </p>
              </div>
            </div>
            
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Make sure your CSV file follows the correct format. Download our template for reference.
              </AlertDescription>
            </Alert>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImportDialog(false)}>
              Cancel
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Download Template
            </Button>
            <Button>
              Import Accounts
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
