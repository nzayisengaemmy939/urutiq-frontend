import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Textarea } from "../components/ui/textarea";
import { Switch } from "../components/ui/switch";
import { Checkbox } from "../components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../components/ui/dropdown-menu";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Separator } from "../components/ui/separator";
import { Plus, Edit, Trash2, ChevronDown, ChevronRight, AlertCircle, CheckCircle, XCircle, ChevronLeft, ChevronsLeft, ChevronsRight, Search, Download, Upload, MoreHorizontal, Eye, Copy, RefreshCw, Building2, Layers, FolderOpen, Clock, Zap, BarChart3, Settings, FileText, Filter, Calculator } from "lucide-react";
import { accountingApi } from "../lib/api/accounting";
import { useDemoAuth } from "../hooks/useDemoAuth";
import { formatApiError } from "../lib/error-utils";
import { useToast } from "../hooks/use-toast";
export function ChartOfAccounts() {
    const { ready: authReady } = useDemoAuth('chart-of-accounts');
    const { toast } = useToast();
    const [accountTypes, setAccountTypes] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [accountsWithPagination, setAccountsWithPagination] = useState(null);
    const [accountTree, setAccountTree] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // Search and filtering
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState("all");
    const [filterStatus, setFilterStatus] = useState("all");
    const [showInactive, setShowInactive] = useState(false);
    // Selection and bulk operations
    const [selectedAccounts, setSelectedAccounts] = useState(new Set());
    const [showBulkActions, setShowBulkActions] = useState(false);
    const [bulkOperationError, setBulkOperationError] = useState(null);
    // Form states
    const [showAccountDialog, setShowAccountDialog] = useState(false);
    const [showTypeDialog, setShowTypeDialog] = useState(false);
    const [showImportDialog, setShowImportDialog] = useState(false);
    const [editingAccount, setEditingAccount] = useState(null);
    const [editingType, setEditingType] = useState(null);
    // View options
    const [viewMode, setViewMode] = useState("list");
    const [expandedNodes, setExpandedNodes] = useState(new Set());
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    // Form data
    const [accountForm, setAccountForm] = useState({
        name: "",
        code: "",
        description: "",
        accountTypeId: undefined,
        parentId: undefined,
        isActive: true
    });
    const [accountFormError, setAccountFormError] = useState(null);
    const [typeForm, setTypeForm] = useState({
        code: "",
        name: "",
        description: "",
        normalBalance: "debit",
        category: ""
    });
    // Ensure accountTypeId is set when dialog opens for new account
    useEffect(() => {
        if (showAccountDialog && !editingAccount && accountTypes.length > 0 && !accountForm.accountTypeId) {
            setAccountForm((prev) => ({ ...prev, accountTypeId: accountTypes[0].id }));
        }
    }, [showAccountDialog, editingAccount, accountTypes, accountForm.accountTypeId]);
    // Helper: build account tree from flat list
    const buildAccountTree = (accounts) => {
        const accountMap = new Map();
        const rootAccounts = [];
        // Create nodes
        accounts.forEach(account => {
            accountMap.set(account.id, {
                ...account,
                children: [],
                level: 0,
                isExpanded: expandedNodes.has(account.id)
            });
        });
        // Build hierarchy
        accounts.forEach(account => {
            const node = accountMap.get(account.id);
            if (!node)
                return;
            if (account.parentId && accountMap.has(account.parentId)) {
                const parent = accountMap.get(account.parentId);
                parent.children.push(node);
                node.level = parent.level + 1;
            }
            else {
                rootAccounts.push(node);
            }
        });
        return rootAccounts;
    };
    // Load data (wrapped with useCallback to keep identity stable)
    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            // Get company ID from localStorage
            const companyId = localStorage.getItem('company_id') || localStorage.getItem('companyId') || localStorage.getItem('company') || undefined;
            // Load live data using the shared accounting API
            const [typesData, accountsResp] = await Promise.all([
                accountingApi.accountTypesApi.getAll(companyId),
                accountingApi.chartOfAccountsApi.getAll(companyId, showInactive)
            ]);
            setAccountTypes(Array.isArray(typesData) ? typesData : []);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const accountsList = Array.isArray(accountsResp)
                ? accountsResp
                : accountsResp?.accounts ?? [];
            setAccountsWithPagination(null);
            setAccounts(accountsList);
            setSummary({
                totalAccounts: accountsList.length,
                activeAccounts: accountsList.filter(a => a.isActive !== false).length,
                totalAccountTypes: Array.isArray(typesData) ? typesData.length : 0,
                maxDepth: 3,
                lastUpdated: new Date().toLocaleDateString()
            });
            const tree = buildAccountTree(accountsList);
            setAccountTree(tree);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load data");
        }
        finally {
            setLoading(false);
        }
    }, [showInactive, currentPage, pageSize, expandedNodes]);
    // Bulk actions configuration
    const bulkActions = [
        {
            id: "activate",
            label: "Activate",
            icon: _jsx(CheckCircle, { className: "h-4 w-4" }),
            action: handleBulkActivate
        },
        {
            id: "deactivate",
            label: "Deactivate",
            icon: _jsx(XCircle, { className: "h-4 w-4" }),
            action: handleBulkDeactivate
        },
        {
            id: "export",
            label: "Export Selected",
            icon: _jsx(Download, { className: "h-4 w-4" }),
            action: handleBulkExport
        },
        {
            id: "delete",
            label: "Delete",
            icon: _jsx(Trash2, { className: "h-4 w-4" }),
            action: handleBulkDelete,
            destructive: true
        }
    ];
    // Load data
    useEffect(() => {
        loadData();
    }, [loadData]);
    // Filter accounts based on search and filters
    const filteredAccounts = useMemo(() => {
        if (!accounts)
            return [];
        return accounts.filter(account => {
            // Search filter
            if (searchTerm) {
                const searchLower = searchTerm.toLowerCase();
                const matchesSearch = account.name.toLowerCase().includes(searchLower) ||
                    account.code.toLowerCase().includes(searchLower) ||
                    account.description?.toLowerCase().includes(searchLower) ||
                    (account.accountType && account.accountType.toLowerCase().includes(searchLower));
                if (!matchesSearch)
                    return false;
            }
            // Type filter
            if (filterType !== "all" && account.accountTypeId !== filterType) {
                return false;
            }
            // Status filter
            if (filterStatus === "active" && !account.isActive)
                return false;
            if (filterStatus === "inactive" && account.isActive)
                return false;
            return true;
        });
    }, [accounts, searchTerm, filterType, filterStatus]);
    // Bulk action handlers
    async function handleBulkActivate(selectedIds) {
        try {
            setBulkOperationError(null);
            await Promise.all(selectedIds.map(id => accountingApi.chartOfAccountsApi.update(id, { isActive: true })));
            await loadData();
            setSelectedAccounts(new Set());
            setShowBulkActions(false);
        }
        catch (error) {
            const msg = error instanceof Error ? error.message : "Failed to activate accounts";
            setBulkOperationError(msg);
            console.error("Failed to activate accounts:", error);
        }
    }
    async function handleBulkDeactivate(selectedIds) {
        try {
            setBulkOperationError(null);
            await Promise.all(selectedIds.map(id => accountingApi.chartOfAccountsApi.update(id, { isActive: false })));
            await loadData();
            setSelectedAccounts(new Set());
            setShowBulkActions(false);
        }
        catch (error) {
            const msg = error instanceof Error ? error.message : "Failed to deactivate accounts";
            setBulkOperationError(msg);
            console.error("Failed to deactivate accounts:", error);
        }
    }
    async function handleBulkExport(selectedIds) {
        try {
            setBulkOperationError(null);
            const selectedAccountsData = accounts.filter(account => selectedIds.includes(account.id));
            const csvContent = generateCSV(selectedAccountsData);
            downloadCSV(csvContent, "chart-of-accounts.csv");
            setSelectedAccounts(new Set());
            setShowBulkActions(false);
        }
        catch (error) {
            const msg = error instanceof Error ? error.message : "Failed to export accounts";
            setBulkOperationError(msg);
            console.error("Failed to export accounts:", error);
        }
    }
    async function handleBulkDelete(selectedIds) {
        if (!confirm(`Are you sure you want to delete ${selectedIds.length} accounts? This action cannot be undone.`)) {
            return;
        }
        try {
            setBulkOperationError(null);
            await Promise.all(selectedIds.map(id => accountingApi.chartOfAccountsApi.delete(id)));
            await loadData();
            setSelectedAccounts(new Set());
            setShowBulkActions(false);
        }
        catch (error) {
            const msg = error instanceof Error ? error.message : "Failed to delete accounts";
            setBulkOperationError(msg);
            console.error("Failed to delete accounts:", error);
        }
    }
    // Helper functions
    const generateCSV = (accounts) => {
        const headers = ["Code", "Name", "Type", "Parent", "Description", "Status"];
        const rows = accounts.map(account => [
            account.code,
            account.name,
            account.accountType || "",
            account.parent?.name || "",
            account.description || "",
            account.isActive ? "Active" : "Inactive"
        ]);
        return [headers, ...rows]
            .map(row => row.map(field => `"${field}"`).join(","))
            .join("\n");
    };
    const downloadCSV = (content, filename) => {
        const blob = new Blob([content], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    };
    // Extracted function for creating a new account
    const createAccount = async (form) => {
        // Validate required fields
        if (!form.accountTypeId) {
            throw new Error("Account type is required.");
        }
        if (!form.code || !form.name) {
            throw new Error("Account code and name are required.");
        }
        // Map frontend field names to backend field names
        // Only send fields that the backend accountCreate schema expects
        const companyId = localStorage.getItem('company_id') || localStorage.getItem('companyId') || localStorage.getItem('company');
        const payload = {
            code: form.code.trim(),
            name: form.name.trim(),
            typeId: form.accountTypeId,
            parentId: form.parentId || undefined,
            companyId: companyId // Use real company ID from localStorage
        };
        return await accountingApi.chartOfAccountsApi.create(payload);
    };
    const handleAccountSubmit = async (e) => {
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
                };
                await accountingApi.chartOfAccountsApi.update(editingAccount.id, updatePayload);
            }
            else {
                await createAccount(accountForm);
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
        }
        catch (error) {
            console.error("Failed to save account:", error);
            console.error("Error details:", {
                message: error.message,
                status: error.status,
                details: error.details,
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
            }
            else if (message.includes('validation_error') ||
                message.includes('Invalid input') ||
                message.includes('expected string, received undefined')) {
                errorTitle = "Validation Error";
                // Keep the detailed validation message
            }
            else if (details) {
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
    const [typeFormError, setTypeFormError] = useState(null);
    const handleTypeSubmit = async (e) => {
        e.preventDefault();
        setTypeFormError(null);
        try {
            if (!typeForm.code || !typeForm.name) {
                throw new Error("Type code and name are required.");
            }
            const payload = {
                code: typeForm.code,
                name: typeForm.name
            };
            if (editingType) {
                await accountingApi.accountTypesApi.update(editingType.id, payload);
            }
            else {
                await accountingApi.accountTypesApi.create(payload);
            }
            await loadData();
            setShowTypeDialog(false);
            setEditingType(null);
            setTypeForm({
                code: "",
                name: "",
                description: "",
                normalBalance: "debit",
                category: ""
            });
        }
        catch (error) {
            let msg = "Failed to save account type.";
            // Handle specific API errors
            if (error?.response?.data?.error?.code === 'ACCOUNT_TYPE_EXISTS') {
                msg = "Account type code already exists. Please use a different code.";
            }
            else if (error?.response?.data?.error?.code === 'invalid_body') {
                // Handle validation errors with specific field details
                const validationErrors = error?.response?.data?.error?.details;
                if (validationErrors) {
                    const fieldErrors = Object.entries(validationErrors.fieldErrors || {})
                        .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
                        .join('; ');
                    msg = `Validation error: ${fieldErrors}`;
                }
                else {
                    msg = "Invalid data provided. Please check all required fields.";
                }
            }
            else if (error?.response?.data?.error?.message) {
                msg = error.response.data.error.message;
            }
            else if (error instanceof Error) {
                msg = error.message;
            }
            setTypeFormError(msg);
            console.error("Failed to save account type:", error);
        }
    };
    const editAccount = (account) => {
        setEditingAccount(account);
        setAccountForm({
            name: account.name,
            code: account.code,
            description: account.description || "",
            accountTypeId: account.accountTypeId,
            parentId: account.parentId || undefined,
            isActive: account.isActive
        });
        setShowAccountDialog(true);
    };
    const editType = (type) => {
        setEditingType(type);
        setTypeForm({
            code: type.code || "",
            name: type.name,
            description: type.description || "",
            normalBalance: type.normalBalance,
            category: type.category || ""
        });
        setShowTypeDialog(true);
    };
    const handleDeleteAccount = async (accountId) => {
        if (!confirm("Are you sure you want to delete this account?"))
            return;
        try {
            await accountingApi.chartOfAccountsApi.delete(accountId);
            await loadData();
        }
        catch (error) {
            const msg = error instanceof Error ? error.message : "Failed to delete account";
            setError(msg);
            console.error("Failed to delete account:", error);
        }
    };
    const handleDeleteType = async (typeId) => {
        if (!confirm("Are you sure you want to delete this account type?"))
            return;
        try {
            await accountingApi.accountTypesApi.delete(typeId);
            await loadData();
        }
        catch (error) {
            const msg = error instanceof Error ? error.message : "Failed to delete account type";
            setError(msg);
            console.error("Failed to delete account type:", error);
        }
    };
    const toggleAccountSelection = (accountId) => {
        const newSelection = new Set(selectedAccounts);
        if (newSelection.has(accountId)) {
            newSelection.delete(accountId);
        }
        else {
            newSelection.add(accountId);
        }
        setSelectedAccounts(newSelection);
        setShowBulkActions(newSelection.size > 0);
    };
    const selectAllAccounts = () => {
        if (selectedAccounts.size === filteredAccounts.length) {
            setSelectedAccounts(new Set());
            setShowBulkActions(false);
        }
        else {
            setSelectedAccounts(new Set(filteredAccounts.map(account => account.id)));
            setShowBulkActions(true);
        }
    };
    const toggleNodeExpansion = (nodeId) => {
        const newExpanded = new Set(expandedNodes);
        if (newExpanded.has(nodeId)) {
            newExpanded.delete(nodeId);
        }
        else {
            newExpanded.add(nodeId);
        }
        setExpandedNodes(newExpanded);
    };
    const renderAccountNode = (node) => {
        const hasChildren = node.children.length > 0;
        const isExpanded = expandedNodes.has(node.id);
        const isSelected = selectedAccounts.has(node.id);
        return (_jsxs("div", { className: "space-y-1", children: [_jsxs("div", { className: `flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 ${isSelected ? "bg-blue-50 border-blue-200" : ""}`, style: { paddingLeft: `${node.level * 20 + 8}px` }, children: [hasChildren && (_jsx(Button, { variant: "ghost", size: "sm", className: "h-6 w-6 p-0", onClick: () => toggleNodeExpansion(node.id), children: isExpanded ? (_jsx(ChevronDown, { className: "h-4 w-4" })) : (_jsx(ChevronRight, { className: "h-4 w-4" })) })), !hasChildren && _jsx("div", { className: "w-6" }), _jsx(Checkbox, { checked: isSelected, onCheckedChange: () => toggleAccountSelection(node.id) }), _jsxs("div", { className: "flex-1 flex items-center justify-between", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("span", { className: "font-medium", children: node.code }), _jsx("span", { children: node.name }), !node.isActive && (_jsx(Badge, { variant: "secondary", children: "Inactive" }))] }), node.description && node.description !== "" && (_jsx("p", { className: "text-sm text-gray-600", children: node.description }))] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Badge, { variant: "outline", children: accountTypes.find(t => t.id === node.accountTypeId)?.name || "Unknown Type" }), _jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsx(Button, { variant: "ghost", size: "sm", className: "h-8 w-8 p-0", children: _jsx(MoreHorizontal, { className: "h-4 w-4" }) }) }), _jsxs(DropdownMenuContent, { align: "end", children: [_jsxs(DropdownMenuItem, { onClick: () => editAccount(node), children: [_jsx(Edit, { className: "mr-2 h-4 w-4" }), "Edit"] }), _jsxs(DropdownMenuItem, { onClick: () => { }, children: [_jsx(Copy, { className: "mr-2 h-4 w-4" }), "Duplicate"] }), _jsxs(DropdownMenuItem, { onClick: () => { }, children: [_jsx(Eye, { className: "mr-2 h-4 w-4" }), "View Transactions"] }), _jsx(DropdownMenuSeparator, {}), _jsxs(DropdownMenuItem, { onClick: () => handleDeleteAccount(node.id), className: "text-red-600", children: [_jsx(Trash2, { className: "mr-2 h-4 w-4" }), "Delete"] })] })] })] })] })] }), hasChildren && isExpanded && (_jsx("div", { className: "space-y-1", children: node.children.map(child => renderAccountNode(child)) }))] }, node.id));
    };
    if (loading) {
        return (_jsx("div", { className: "min-h-[400px] flex items-center justify-center p-8", children: _jsxs("div", { className: "text-center space-y-4", children: [_jsxs("div", { className: "relative", children: [_jsx(RefreshCw, { className: "h-12 w-12 animate-spin mx-auto text-blue-600" }), _jsx("div", { className: "absolute inset-0 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900", children: "Loading Chart of Accounts" }), _jsx("p", { className: "text-gray-500", children: "Please wait while we fetch your account data..." })] })] }) }));
    }
    if (error) {
        return (_jsx("div", { className: "min-h-[400px] flex items-center justify-center p-8", children: _jsxs("div", { className: "text-center space-y-4 max-w-md", children: [_jsx("div", { className: "mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center", children: _jsx(AlertCircle, { className: "h-8 w-8 text-red-600" }) }), _jsxs("div", { className: "space-y-2", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900", children: "Something went wrong" }), _jsx("p", { className: "text-gray-500", children: error })] }), _jsxs(Button, { onClick: loadData, variant: "outline", className: "mt-4", children: [_jsx(RefreshCw, { className: "h-4 w-4 mr-2" }), "Try Again"] })] }) }));
    }
    return (_jsxs("div", { className: "space-y-6", children: [summary && (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-4", children: [_jsxs(Card, { className: "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-md transition-all duration-200", children: [_jsx(CardHeader, { className: "pb-3", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx(CardTitle, { className: "text-sm font-medium text-blue-800", children: "Total Accounts" }), _jsx(Building2, { className: "h-5 w-5 text-blue-600" })] }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-3xl font-bold text-blue-900", children: summary.totalAccounts }), _jsxs("div", { className: "flex items-center gap-2 mt-2", children: [_jsx("div", { className: "w-2 h-2 bg-green-500 rounded-full" }), _jsxs("p", { className: "text-sm text-blue-700", children: [summary.activeAccounts, " active accounts"] })] })] })] }), _jsxs(Card, { className: "bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-md transition-all duration-200", children: [_jsx(CardHeader, { className: "pb-3", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx(CardTitle, { className: "text-sm font-medium text-green-800", children: "Account Types" }), _jsx(Layers, { className: "h-5 w-5 text-green-600" })] }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-3xl font-bold text-green-900", children: summary.totalAccountTypes }), _jsx("p", { className: "text-sm text-green-700 mt-2", children: "Categories defined" })] })] }), _jsxs(Card, { className: "bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-md transition-all duration-200", children: [_jsx(CardHeader, { className: "pb-3", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx(CardTitle, { className: "text-sm font-medium text-purple-800", children: "Hierarchy Levels" }), _jsx(FolderOpen, { className: "h-5 w-5 text-purple-600" })] }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-3xl font-bold text-purple-900", children: summary.maxDepth }), _jsx("p", { className: "text-sm text-purple-700 mt-2", children: "Maximum depth" })] })] }), _jsxs(Card, { className: "bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-md transition-all duration-200", children: [_jsx(CardHeader, { className: "pb-3", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx(CardTitle, { className: "text-sm font-medium text-orange-800", children: "Last Updated" }), _jsx(Clock, { className: "h-5 w-5 text-orange-600" })] }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold text-orange-900", children: summary.lastUpdated }), _jsx("p", { className: "text-sm text-orange-700 mt-2", children: "Recent activity" })] })] })] }), _jsx(Card, { className: "bg-gradient-to-r from-slate-50 to-gray-50 border-slate-200", children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex flex-wrap items-center justify-between gap-4", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Zap, { className: "h-4 w-4 text-amber-500" }), _jsx("span", { className: "text-sm font-medium text-slate-700", children: "Quick Actions" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs(Button, { size: "sm", variant: "outline", onClick: () => setShowAccountDialog(true), children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "New Account"] }), _jsxs(Button, { size: "sm", variant: "outline", onClick: () => setShowTypeDialog(true), children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "New Type"] }), _jsxs(Button, { size: "sm", variant: "outline", onClick: () => setShowImportDialog(true), children: [_jsx(Upload, { className: "h-4 w-4 mr-2" }), "Import"] })] })] }) }) })] })), _jsxs(Tabs, { defaultValue: "accounts", className: "space-y-6", children: [_jsx("div", { className: "bg-white rounded-lg border border-slate-200 p-1 shadow-sm", children: _jsxs(TabsList, { className: "grid w-full grid-cols-3 bg-transparent", children: [_jsxs(TabsTrigger, { value: "accounts", className: "data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-sm", children: [_jsx(BarChart3, { className: "h-4 w-4 mr-2" }), "Accounts"] }), _jsxs(TabsTrigger, { value: "types", className: "data-[state=active]:bg-green-50 data-[state=active]:text-green-700 data-[state=active]:shadow-sm", children: [_jsx(Layers, { className: "h-4 w-4 mr-2" }), "Account Types"] }), _jsxs(TabsTrigger, { value: "settings", className: "data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700 data-[state=active]:shadow-sm", children: [_jsx(Settings, { className: "h-4 w-4 mr-2" }), "Settings"] })] }) }), _jsx(TabsContent, { value: "accounts", className: "space-y-6", children: _jsxs(Card, { className: "shadow-sm border-slate-200", children: [_jsx(CardHeader, { className: "bg-gradient-to-r from-slate-50 to-gray-50 border-b border-slate-200", children: _jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4", children: [_jsxs("div", { children: [_jsxs(CardTitle, { className: "text-xl font-semibold text-gray-900 flex items-center gap-2", children: [_jsx(BarChart3, { className: "h-5 w-5 text-blue-600" }), "Chart of Accounts"] }), _jsx(CardDescription, { className: "text-gray-600 mt-1", children: "Manage your organization's account structure and hierarchy" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs(Badge, { variant: "outline", className: "bg-blue-50 text-blue-700 border-blue-200", children: [filteredAccounts.length, " accounts"] }), _jsxs(Badge, { variant: "outline", className: "bg-green-50 text-green-700 border-green-200", children: [accounts.filter(a => a.isActive).length, " active"] })] })] }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" }), _jsx(Input, { placeholder: "Search accounts by name, code, description, or type...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "pl-10 h-12 text-base" }), searchTerm && (_jsx(Button, { variant: "ghost", size: "sm", className: "absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0", onClick: () => setSearchTerm(""), children: _jsx(XCircle, { className: "h-4 w-4" }) }))] }), _jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Filter, { className: "h-4 w-4 text-gray-500" }), _jsx("span", { className: "text-sm font-medium text-gray-700", children: "Filters:" })] }), _jsxs(Select, { value: filterType, onValueChange: setFilterType, children: [_jsx(SelectTrigger, { className: "w-[160px]", children: _jsx(SelectValue, { placeholder: "Account Type" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All Types" }), accountTypes.filter(type => type.id && type.id !== "").map(type => (_jsx(SelectItem, { value: type.id, children: type.name || type.code }, type.id)))] })] }), _jsxs(Select, { value: filterStatus, onValueChange: setFilterStatus, children: [_jsx(SelectTrigger, { className: "w-[140px]", children: _jsx(SelectValue, { placeholder: "Status" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All Status" }), _jsx(SelectItem, { value: "active", children: "Active" }), _jsx(SelectItem, { value: "inactive", children: "Inactive" })] })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Switch, { id: "show-inactive", checked: showInactive, onCheckedChange: setShowInactive }), _jsx(Label, { htmlFor: "show-inactive", className: "text-sm", children: "Show Inactive" })] })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-sm font-medium text-gray-700", children: "View:" }), _jsx("div", { className: "flex bg-gray-100 rounded-lg p-1", children: ["list", "tree", "grid"].map((mode) => (_jsxs(Button, { variant: viewMode === mode ? "default" : "ghost", size: "sm", onClick: () => setViewMode(mode), className: "h-8 px-3 text-xs", children: [mode === "list" && _jsx(FileText, { className: "h-3 w-3 mr-1" }), mode === "tree" && _jsx(FolderOpen, { className: "h-3 w-3 mr-1" }), mode === "grid" && _jsx(Layers, { className: "h-3 w-3 mr-1" }), mode.charAt(0).toUpperCase() + mode.slice(1)] }, mode))) })] }), _jsx("div", { className: "flex items-center gap-2", children: _jsxs(Button, { variant: "outline", size: "sm", onClick: loadData, disabled: loading, children: [_jsx(RefreshCw, { className: `h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}` }), "Refresh"] }) })] })] }), _jsxs("div", { className: "flex flex-wrap items-center justify-between gap-4 p-4 bg-gradient-to-r from-slate-50 to-gray-50 rounded-lg border border-slate-200", children: [_jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [_jsxs(Button, { onClick: () => setShowAccountDialog(true), className: "bg-blue-600 hover:bg-blue-700 text-white shadow-sm", children: [_jsx(Plus, { className: "mr-2 h-4 w-4" }), "Add Account"] }), _jsxs(Button, { variant: "outline", onClick: () => setShowTypeDialog(true), className: "border-green-200 text-green-700 hover:bg-green-50", children: [_jsx(Plus, { className: "mr-2 h-4 w-4" }), "Add Type"] }), _jsxs(Button, { variant: "outline", onClick: () => setShowImportDialog(true), className: "border-purple-200 text-purple-700 hover:bg-purple-50", children: [_jsx(Upload, { className: "mr-2 h-4 w-4" }), "Import"] }), _jsxs(Button, { variant: "outline", onClick: () => handleBulkExport(accounts.map(a => a.id)), className: "border-orange-200 text-orange-700 hover:bg-orange-50", children: [_jsx(Download, { className: "mr-2 h-4 w-4" }), "Export All"] })] }), _jsxs("div", { className: "flex items-center gap-3", children: [selectedAccounts.size > 0 && (_jsxs("div", { className: "flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full", children: [_jsx(CheckCircle, { className: "h-4 w-4" }), _jsxs("span", { className: "text-sm font-medium", children: [selectedAccounts.size, " selected"] })] })), _jsxs("div", { className: "text-sm text-gray-500", children: [filteredAccounts.length, " of ", accounts.length, " accounts"] })] })] }), showBulkActions && (_jsxs("div", { className: "space-y-3", children: [bulkOperationError && (_jsxs(Alert, { variant: "destructive", children: [_jsx(AlertCircle, { className: "h-4 w-4" }), _jsx(AlertDescription, { children: bulkOperationError })] })), _jsx("div", { className: "bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-4 shadow-sm", children: _jsxs("div", { className: "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsxs("div", { className: "flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-800 rounded-full", children: [_jsx(CheckCircle, { className: "h-4 w-4" }), _jsxs("span", { className: "font-medium", children: [selectedAccounts.size, " accounts selected"] })] }), _jsx("span", { className: "text-sm text-blue-700", children: "Choose an action to perform on selected accounts" })] }), _jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [bulkActions.map(action => (_jsxs(Button, { variant: action.destructive ? "destructive" : "outline", size: "sm", onClick: () => action.action(Array.from(selectedAccounts)), className: action.destructive ? "bg-red-600 hover:bg-red-700" : "hover:shadow-sm", children: [action.icon, _jsx("span", { className: "ml-2", children: action.label })] }, action.id))), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => {
                                                                            setSelectedAccounts(new Set());
                                                                            setShowBulkActions(false);
                                                                            setBulkOperationError(null);
                                                                        }, className: "text-gray-600 hover:text-gray-800", children: "Clear Selection" })] })] }) })] })), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between p-3 bg-gradient-to-r from-slate-50 to-gray-50 rounded-lg border border-slate-200", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Checkbox, { checked: selectedAccounts.size === filteredAccounts.length && filteredAccounts.length > 0, onCheckedChange: selectAllAccounts, className: "h-5 w-5" }), _jsxs("div", { children: [_jsxs("span", { className: "text-sm font-medium text-gray-700", children: ["Select All (", filteredAccounts.length, " accounts)"] }), selectedAccounts.size > 0 && (_jsxs("p", { className: "text-xs text-gray-500 mt-1", children: [selectedAccounts.size, " of ", filteredAccounts.length, " selected"] }))] })] }), _jsxs("div", { className: "flex items-center gap-2 text-sm text-gray-500", children: [_jsx("span", { children: "View:" }), _jsx("span", { className: "font-medium", children: viewMode.charAt(0).toUpperCase() + viewMode.slice(1) })] })] }), viewMode === "tree" ? (_jsx("div", { className: "space-y-1", children: accountTree.map(node => renderAccountNode(node)) })) : viewMode === "grid" ? (_jsx("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-3", children: filteredAccounts.map(account => (_jsxs(Card, { className: `cursor-pointer transition-colors ${selectedAccounts.has(account.id) ? "border-blue-500 bg-blue-50" : ""}`, children: [_jsxs(CardHeader, { className: "pb-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { checked: selectedAccounts.has(account.id), onCheckedChange: () => toggleAccountSelection(account.id) }), _jsx(Badge, { variant: "outline", children: account.code })] }), _jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsx(Button, { variant: "ghost", size: "sm", className: "h-8 w-8 p-0", children: _jsx(MoreHorizontal, { className: "h-4 w-4" }) }) }), _jsxs(DropdownMenuContent, { children: [_jsxs(DropdownMenuItem, { onClick: () => editAccount(account), children: [_jsx(Edit, { className: "mr-2 h-4 w-4" }), "Edit"] }), _jsxs(DropdownMenuItem, { onClick: () => handleDeleteAccount(account.id), children: [_jsx(Trash2, { className: "mr-2 h-4 w-4" }), "Delete"] })] })] })] }), _jsx(CardTitle, { className: "text-lg", children: account.name })] }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm text-muted-foreground", children: "Type" }), _jsx(Badge, { variant: "secondary", children: accountTypes.find(t => t.id === account.accountTypeId)?.name || "Unknown Type" })] }), account.description && account.description !== "" && (_jsx("p", { className: "text-sm text-muted-foreground", children: account.description })), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm text-muted-foreground", children: "Status" }), _jsx(Badge, { variant: account.isActive ? "default" : "secondary", children: account.isActive ? "Active" : "Inactive" })] })] }) })] }, account.id))) })) : (
                                                // List view
                                                _jsx("div", { className: "space-y-2", children: filteredAccounts.map(account => (_jsxs("div", { className: `flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 ${selectedAccounts.has(account.id) ? "border-blue-500 bg-blue-50" : ""}`, children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx(Checkbox, { checked: selectedAccounts.has(account.id), onCheckedChange: () => toggleAccountSelection(account.id) }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("span", { className: "font-medium", children: account.code }), _jsx("span", { children: account.name }), !account.isActive && (_jsx(Badge, { variant: "secondary", children: "Inactive" }))] }), account.description && account.description !== "" && (_jsx("p", { className: "text-sm text-muted-foreground", children: account.description }))] })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Badge, { variant: "outline", children: accountTypes.find(t => t.id === account.accountTypeId)?.name || "Unknown Type" }), _jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsx(Button, { variant: "ghost", size: "sm", className: "h-8 w-8 p-0", children: _jsx(MoreHorizontal, { className: "h-4 w-4" }) }) }), _jsxs(DropdownMenuContent, { align: "end", children: [_jsxs(DropdownMenuItem, { onClick: () => editAccount(account), children: [_jsx(Edit, { className: "mr-2 h-4 w-4" }), "Edit"] }), _jsxs(DropdownMenuItem, { onClick: () => { }, children: [_jsx(Copy, { className: "mr-2 h-4 w-4" }), "Duplicate"] }), _jsxs(DropdownMenuItem, { onClick: () => { }, children: [_jsx(Eye, { className: "mr-2 h-4 w-4" }), "View Transactions"] }), _jsx(DropdownMenuSeparator, {}), _jsxs(DropdownMenuItem, { onClick: () => handleDeleteAccount(account.id), className: "text-red-600", children: [_jsx(Trash2, { className: "mr-2 h-4 w-4" }), "Delete"] })] })] })] })] }, account.id))) }))] }), accountsWithPagination && accountsWithPagination.pagination && (_jsx("div", { className: "bg-gradient-to-r from-slate-50 to-gray-50 rounded-lg border border-slate-200 p-4", children: _jsxs("div", { className: "flex flex-col sm:flex-row items-center justify-between gap-4", children: [_jsxs("div", { className: "flex items-center gap-2 text-sm text-gray-600", children: [_jsx(FileText, { className: "h-4 w-4" }), _jsxs("span", { children: ["Showing ", _jsx("span", { className: "font-medium text-gray-900", children: ((accountsWithPagination.pagination.page - 1) * accountsWithPagination.pagination.pageSize) + 1 }), " to ", _jsx("span", { className: "font-medium text-gray-900", children: Math.min(accountsWithPagination.pagination.page * accountsWithPagination.pagination.pageSize, accountsWithPagination.pagination.totalCount) }), " of ", _jsx("span", { className: "font-medium text-gray-900", children: accountsWithPagination.pagination.totalCount }), " accounts"] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Button, { variant: "outline", size: "sm", onClick: () => setCurrentPage(1), disabled: !accountsWithPagination.pagination.hasPrev, className: "h-8 w-8 p-0 hover:bg-blue-50 hover:border-blue-200", children: _jsx(ChevronsLeft, { className: "h-4 w-4" }) }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => setCurrentPage(currentPage - 1), disabled: !accountsWithPagination.pagination.hasPrev, className: "h-8 w-8 p-0 hover:bg-blue-50 hover:border-blue-200", children: _jsx(ChevronLeft, { className: "h-4 w-4" }) }), _jsxs("div", { className: "flex items-center gap-1 px-3 py-1 bg-white border border-slate-200 rounded-md", children: [_jsxs("span", { className: "text-sm font-medium text-gray-900", children: ["Page ", accountsWithPagination.pagination.page] }), _jsxs("span", { className: "text-sm text-gray-500", children: ["of ", accountsWithPagination.pagination.totalPages] })] }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => setCurrentPage(currentPage + 1), disabled: !accountsWithPagination.pagination.hasNext, className: "h-8 w-8 p-0 hover:bg-blue-50 hover:border-blue-200", children: _jsx(ChevronRight, { className: "h-4 w-4" }) }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => setCurrentPage(accountsWithPagination.pagination.totalPages), disabled: !accountsWithPagination.pagination.hasNext, className: "h-8 w-8 p-0 hover:bg-blue-50 hover:border-blue-200", children: _jsx(ChevronsRight, { className: "h-4 w-4" }) })] })] }) }))] })] }) }), _jsx(TabsContent, { value: "types", className: "space-y-6", children: _jsxs(Card, { className: "shadow-sm border-slate-200", children: [_jsx(CardHeader, { className: "bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200", children: _jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4", children: [_jsxs("div", { children: [_jsxs(CardTitle, { className: "text-xl font-semibold text-gray-900 flex items-center gap-2", children: [_jsx(Layers, { className: "h-5 w-5 text-green-600" }), "Account Types"] }), _jsx(CardDescription, { className: "text-gray-600 mt-1", children: "Manage account categories and their normal balance behavior" })] }), _jsxs(Button, { onClick: () => setShowTypeDialog(true), className: "bg-green-600 hover:bg-green-700 text-white", children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "Add Type"] })] }) }), _jsx(CardContent, { className: "p-6", children: accountTypes.length === 0 ? (_jsxs("div", { className: "text-center py-12", children: [_jsx(Layers, { className: "h-12 w-12 text-gray-400 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "No account types yet" }), _jsx("p", { className: "text-gray-500 mb-4", children: "Create your first account type to get started" }), _jsxs(Button, { onClick: () => setShowTypeDialog(true), children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "Create Account Type"] })] })) : (_jsx("div", { className: "grid gap-6 md:grid-cols-2 lg:grid-cols-3", children: accountTypes.map(type => (_jsxs(Card, { className: "hover:shadow-md transition-all duration-200 border-slate-200", children: [_jsx(CardHeader, { className: "pb-3", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx(CardTitle, { className: "text-lg text-gray-900", children: type.name }), _jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsx(Button, { variant: "ghost", size: "sm", className: "h-8 w-8 p-0 hover:bg-slate-100", children: _jsx(MoreHorizontal, { className: "h-4 w-4" }) }) }), _jsxs(DropdownMenuContent, { children: [_jsxs(DropdownMenuItem, { onClick: () => editType(type), children: [_jsx(Edit, { className: "mr-2 h-4 w-4" }), "Edit"] }), _jsxs(DropdownMenuItem, { onClick: () => handleDeleteType(type.id), className: "text-red-600", children: [_jsx(Trash2, { className: "mr-2 h-4 w-4" }), "Delete"] })] })] })] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between p-2 bg-slate-50 rounded-lg", children: [_jsx("span", { className: "text-sm font-medium text-gray-700", children: "Normal Balance" }), _jsx(Badge, { variant: type.normalBalance === "debit" ? "default" : "secondary", className: type.normalBalance === "debit" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800", children: type.normalBalance === "debit" ? "Debit" : "Credit" })] }), type.description && type.description !== "" && (_jsx("div", { className: "p-2 bg-slate-50 rounded-lg", children: _jsx("p", { className: "text-sm text-gray-600", children: type.description }) })), type.category && type.category !== "" && (_jsxs("div", { className: "flex items-center justify-between p-2 bg-slate-50 rounded-lg", children: [_jsx("span", { className: "text-sm font-medium text-gray-700", children: "Category" }), _jsx(Badge, { variant: "outline", className: "bg-green-50 text-green-700 border-green-200", children: type.category })] }))] }) })] }, type.id))) })) })] }) }), _jsx(TabsContent, { value: "settings", className: "space-y-6", children: _jsxs(Card, { className: "shadow-sm border-slate-200", children: [_jsx(CardHeader, { className: "bg-gradient-to-r from-purple-50 to-violet-50 border-b border-purple-200", children: _jsx("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4", children: _jsxs("div", { children: [_jsxs(CardTitle, { className: "text-xl font-semibold text-gray-900 flex items-center gap-2", children: [_jsx(Settings, { className: "h-5 w-5 text-purple-600" }), "Chart of Accounts Settings"] }), _jsx(CardDescription, { className: "text-gray-600 mt-1", children: "Configure general settings and preferences for your chart of accounts" })] }) }) }), _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "space-y-8", children: [_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-2 h-2 bg-purple-500 rounded-full" }), _jsx("h3", { className: "text-lg font-semibold text-gray-900", children: "Display Options" })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between p-4 bg-slate-50 rounded-lg", children: [_jsxs("div", { children: [_jsx(Label, { className: "text-base font-medium", children: "Show Account Codes" }), _jsx("p", { className: "text-sm text-gray-600 mt-1", children: "Display account codes alongside names for better identification" })] }), _jsx(Switch, { defaultChecked: true })] }), _jsxs("div", { className: "flex items-center justify-between p-4 bg-slate-50 rounded-lg", children: [_jsxs("div", { children: [_jsx(Label, { className: "text-base font-medium", children: "Show Inactive Accounts" }), _jsx("p", { className: "text-sm text-gray-600 mt-1", children: "Include inactive accounts in lists and searches" })] }), _jsx(Switch, { checked: showInactive, onCheckedChange: setShowInactive })] }), _jsxs("div", { className: "flex items-center justify-between p-4 bg-slate-50 rounded-lg", children: [_jsxs("div", { children: [_jsx(Label, { className: "text-base font-medium", children: "Auto-expand Tree" }), _jsx("p", { className: "text-sm text-gray-600 mt-1", children: "Automatically expand account hierarchy when switching to tree view" })] }), _jsx(Switch, {})] })] })] }), _jsx(Separator, { className: "bg-slate-200" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-2 h-2 bg-blue-500 rounded-full" }), _jsx("h3", { className: "text-lg font-semibold text-gray-900", children: "Import/Export" })] }), _jsxs("div", { className: "grid gap-6 md:grid-cols-2", children: [_jsxs(Card, { className: "border-slate-200 hover:shadow-md transition-all duration-200", children: [_jsxs(CardHeader, { className: "pb-3", children: [_jsxs(CardTitle, { className: "text-base flex items-center gap-2", children: [_jsx(Upload, { className: "h-4 w-4 text-blue-600" }), "Import Accounts"] }), _jsx(CardDescription, { children: "Upload a CSV file to import accounts in bulk" })] }), _jsx(CardContent, { children: _jsxs(Button, { className: "w-full bg-blue-600 hover:bg-blue-700", onClick: () => setShowImportDialog(true), children: [_jsx(Upload, { className: "mr-2 h-4 w-4" }), "Import CSV"] }) })] }), _jsxs(Card, { className: "border-slate-200 hover:shadow-md transition-all duration-200", children: [_jsxs(CardHeader, { className: "pb-3", children: [_jsxs(CardTitle, { className: "text-base flex items-center gap-2", children: [_jsx(Download, { className: "h-4 w-4 text-green-600" }), "Export Accounts"] }), _jsx(CardDescription, { children: "Download your complete chart of accounts" })] }), _jsx(CardContent, { children: _jsxs(Button, { className: "w-full bg-green-600 hover:bg-green-700", onClick: () => handleBulkExport(accounts.map(a => a.id)), children: [_jsx(Download, { className: "mr-2 h-4 w-4" }), "Export CSV"] }) })] })] })] }), _jsx(Separator, { className: "bg-slate-200" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-2 h-2 bg-green-500 rounded-full" }), _jsx("h3", { className: "text-lg font-semibold text-gray-900", children: "System Information" })] }), _jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [_jsxs("div", { className: "p-4 bg-slate-50 rounded-lg", children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx(Calculator, { className: "h-4 w-4 text-green-600" }), _jsx("span", { className: "text-sm font-medium text-gray-700", children: "Total Accounts" })] }), _jsx("p", { className: "text-2xl font-bold text-gray-900", children: accounts.length })] }), _jsxs("div", { className: "p-4 bg-slate-50 rounded-lg", children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx(Layers, { className: "h-4 w-4 text-blue-600" }), _jsx("span", { className: "text-sm font-medium text-gray-700", children: "Account Types" })] }), _jsx("p", { className: "text-2xl font-bold text-gray-900", children: accountTypes.length })] })] })] })] }) })] }) })] }), _jsx(Dialog, { open: showAccountDialog, onOpenChange: setShowAccountDialog, children: _jsxs(DialogContent, { className: "sm:max-w-[600px]", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: editingAccount ? "Edit Account" : "Add New Account" }), _jsx(DialogDescription, { children: editingAccount ? "Update account information" : "Create a new account in your chart of accounts" })] }), (() => {
                            try {
                                return (_jsxs("form", { onSubmit: handleAccountSubmit, className: "space-y-4", children: [accountFormError && (_jsxs(Alert, { variant: "destructive", children: [_jsx(AlertCircle, { className: "h-4 w-4" }), _jsx(AlertDescription, { children: accountFormError })] })), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "account-code", children: "Account Code" }), _jsx(Input, { id: "account-code", value: accountForm.code || "", onChange: (e) => setAccountForm({ ...accountForm, code: e.target.value }), placeholder: "e.g., 1000", required: true })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "account-name", children: "Account Name" }), _jsx(Input, { id: "account-name", value: accountForm.name || "", onChange: (e) => setAccountForm({ ...accountForm, name: e.target.value }), placeholder: "e.g., Cash", required: true })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "account-type", children: "Account Type" }), accountTypes.filter(type => type.id).length > 0 ? (_jsxs("select", { id: "account-type", className: "w-full border rounded px-2 py-2", value: accountForm.accountTypeId || (accountTypes.filter(type => type.id)[0]?.id || "placeholder"), onChange: e => setAccountForm({ ...accountForm, accountTypeId: e.target.value === "placeholder" ? undefined : e.target.value }), required: true, children: [_jsx("option", { value: "placeholder", disabled: true, children: "Select an account type" }), accountTypes.filter(type => type.id).map(type => (_jsx("option", { value: type.id, children: type.name || type.code }, type.id)))] })) : (_jsx("div", { className: "text-sm text-red-500", children: "No account types available. Please add an account type first." }))] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "parent-account", children: "Parent Account (Optional)" }), _jsxs("select", { id: "parent-account", className: "w-full border rounded px-2 py-2", value: accountForm.parentId || "none", onChange: e => setAccountForm({ ...accountForm, parentId: e.target.value === "none" ? undefined : e.target.value }), children: [_jsx("option", { value: "none", children: "No Parent" }), accounts
                                                            .filter(account => account.id && account.id !== editingAccount?.id)
                                                            .map(account => (_jsxs("option", { value: account.id, children: [account.code || "", " - ", account.name || ""] }, account.id)))] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "account-description", children: "Description (Optional)" }), _jsx(Textarea, { id: "account-description", value: accountForm.description || "", onChange: (e) => setAccountForm({ ...accountForm, description: e.target.value }), placeholder: "Account description..." })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Switch, { id: "account-active", checked: !!accountForm.isActive, onCheckedChange: (checked) => setAccountForm({ ...accountForm, isActive: checked }) }), _jsx(Label, { htmlFor: "account-active", children: "Account is active" })] }), _jsxs(DialogFooter, { children: [_jsx(Button, { type: "button", variant: "outline", onClick: () => setShowAccountDialog(false), children: "Cancel" }), _jsx(Button, { type: "submit", children: editingAccount ? "Update Account" : "Create Account" })] })] }));
                            }
                            catch (err) {
                                return (_jsxs(Alert, { variant: "destructive", children: [_jsx(AlertCircle, { className: "h-4 w-4" }), _jsx(AlertDescription, { children: "Something went wrong rendering the account form. Please check your form state and try again." })] }));
                            }
                        })()] }) }), _jsx(Dialog, { open: showTypeDialog, onOpenChange: setShowTypeDialog, children: _jsxs(DialogContent, { children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: editingType ? "Edit Account Type" : "Add New Account Type" }), _jsx(DialogDescription, { children: editingType ? "Update account type information" : "Create a new account type" })] }), _jsxs("form", { onSubmit: handleTypeSubmit, className: "space-y-4", children: [typeFormError && (_jsxs(Alert, { variant: "destructive", children: [_jsx(AlertCircle, { className: "h-4 w-4" }), _jsx(AlertDescription, { children: typeFormError })] })), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "type-code", children: "Type Code" }), _jsx(Input, { id: "type-code", value: typeForm.code, onChange: (e) => setTypeForm({ ...typeForm, code: e.target.value }), placeholder: "e.g., ASSET", required: true })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "type-name", children: "Type Name" }), _jsx(Input, { id: "type-name", value: typeForm.name, onChange: (e) => setTypeForm({ ...typeForm, name: e.target.value }), placeholder: "e.g., Assets", required: true })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "normal-balance", children: "Normal Balance" }), _jsxs(Select, { value: typeForm.normalBalance || "debit", onValueChange: (value) => setTypeForm({ ...typeForm, normalBalance: value }), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "debit", children: "Debit" }), _jsx(SelectItem, { value: "credit", children: "Credit" })] })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "type-category", children: "Category (Optional)" }), _jsx(Input, { id: "type-category", value: typeForm.category, onChange: (e) => setTypeForm({ ...typeForm, category: e.target.value }), placeholder: "e.g., Current Assets" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "type-description", children: "Description (Optional)" }), _jsx(Textarea, { id: "type-description", value: typeForm.description, onChange: (e) => setTypeForm({ ...typeForm, description: e.target.value }), placeholder: "Type description..." })] }), _jsxs(DialogFooter, { children: [_jsx(Button, { type: "button", variant: "outline", onClick: () => setShowTypeDialog(false), children: "Cancel" }), _jsx(Button, { type: "submit", children: editingType ? "Update Type" : "Create Type" })] })] })] }) }), _jsx(Dialog, { open: showImportDialog, onOpenChange: setShowImportDialog, children: _jsxs(DialogContent, { children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Import Accounts" }), _jsx(DialogDescription, { children: "Upload a CSV file to import accounts. The file should include columns for Code, Name, Type, Parent, Description, and Status." })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "border-2 border-dashed border-gray-300 rounded-lg p-6 text-center", children: [_jsx(Upload, { className: "mx-auto h-12 w-12 text-gray-400 mb-4" }), _jsxs("div", { children: [_jsx(Button, { variant: "outline", children: "Choose File" }), _jsx("p", { className: "text-sm text-muted-foreground mt-2", children: "or drag and drop your CSV file here" })] })] }), _jsxs(Alert, { children: [_jsx(AlertCircle, { className: "h-4 w-4" }), _jsx(AlertDescription, { children: "Make sure your CSV file follows the correct format. Download our template for reference." })] })] }), _jsxs(DialogFooter, { children: [_jsx(Button, { variant: "outline", onClick: () => setShowImportDialog(false), children: "Cancel" }), _jsxs(Button, { variant: "outline", children: [_jsx(Download, { className: "mr-2 h-4 w-4" }), "Download Template"] }), _jsx(Button, { children: "Import Accounts" })] })] }) })] }));
}
