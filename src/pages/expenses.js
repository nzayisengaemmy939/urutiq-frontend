'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import * as React from 'react';
import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../contexts/auth-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDemoAuth } from '../hooks/useDemoAuth';
import { expenseApi, companiesApi, chartOfAccountsApi, expenseJournalApi } from '../lib/api/accounting';
import { PageLayout } from '../components/page-layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { SegmentedTabs } from '../components/ui/segmented-tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../components/ui/form';
import { Textarea } from '../components/ui/textarea';
import { Progress } from '../components/ui/progress';
import { Separator } from '../components/ui/separator';
import { ReceiptCaptureModal } from '../components/receipt-capture';
import { ExpenseReportModal } from '../components/expense-report-modal';
import { ReimburseExpenseModal } from '../components/reimburse-expense-modal';
import { ExpenseMatchingModal } from '../components/expense-matching-modal';
import { EditExpenseModal } from '../components/edit-expense-modal';
import { CardCsvImportModal } from '../components/card-csv-import';
import { Plus, Search, Filter, Eye, Edit, Trash2, FolderTree, DollarSign, TrendingUp, AlertTriangle, CheckCircle, Calendar, Target, Settings, ChevronRight, ChevronDown, FileText, Building, Upload, Calculator, ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, Download, RefreshCw, Check, X, FileSpreadsheet, Printer, BookOpen, Receipt } from 'lucide-react';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
// Validation schemas
const categorySchema = z.object({
    companyId: z.string().min(1, 'Company is required'),
    name: z.string().min(1, 'Category name is required'),
    description: z.string().optional(),
    parentId: z.string().optional(),
    color: z.string().optional(),
    icon: z.string().optional(),
    taxTreatment: z.enum(['deductible', 'non-deductible', 'partially_deductible']).optional(),
    approvalThreshold: z.coerce.number().positive().optional()
});
const budgetSchema = z.object({
    companyId: z.string().min(1, 'Company is required'),
    categoryId: z.string().min(1, 'Category is required'),
    name: z.string().min(1, 'Budget name is required'),
    description: z.string().optional(),
    period: z.enum(['monthly', 'quarterly', 'yearly']),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
    amount: z.coerce.number().positive('Amount must be positive'),
    alertThreshold: z.coerce.number().optional()
});
const ruleSchema = z.object({
    companyId: z.string().min(1, 'Company is required'),
    categoryId: z.string().min(1, 'Category is required'),
    name: z.string().min(1, 'Rule name is required'),
    description: z.string().optional(),
    ruleType: z.enum(['amount_limit', 'vendor_restriction', 'approval_required']),
    // User-friendly condition fields
    amountLimit: z.coerce.number().positive().optional(),
    blockedVendors: z.string().optional(),
    requireApproval: z.boolean().optional(),
    notifyManager: z.boolean().optional(),
    autoReject: z.boolean().optional(),
    // Legacy JSON fields (hidden, auto-generated)
    conditions: z.string().optional(),
    actions: z.string().optional(),
    priority: z.coerce.number().int().min(1, 'Priority must be at least 1')
});
// Journal Entry Indicator Component
const ExpenseJournalIndicator = ({ expenseId }) => {
    const { data: journalEntries, isLoading } = useQuery({
        queryKey: ['expense-journal-entries', expenseId],
        queryFn: () => expenseJournalApi.getJournalEntries(expenseId),
        enabled: !!expenseId
    });
    if (isLoading) {
        return (_jsx("div", { className: "w-4 h-4 animate-pulse bg-gray-200 rounded" }));
    }
    const hasEntries = journalEntries && journalEntries.length > 0;
    return (_jsx("div", { className: `w-2 h-2 rounded-full ${hasEntries ? 'bg-green-500' : 'bg-gray-300'}`, title: hasEntries ? 'Journal entries exist' : 'No journal entries' }));
};
// Journal Entries Component
const ExpenseJournalEntries = ({ expenseId }) => {
    const { data: journalEntries, isLoading, error } = useQuery({
        queryKey: ['expense-journal-entries', expenseId],
        queryFn: () => expenseJournalApi.getJournalEntries(expenseId),
        enabled: !!expenseId
    });
    if (isLoading) {
        return (_jsx("div", { className: "flex items-center justify-center py-4", children: _jsx("div", { className: "animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900" }) }));
    }
    if (error) {
        return (_jsx("div", { className: "text-center py-4 text-red-600", children: _jsx("p", { children: "Error loading journal entries" }) }));
    }
    if (!journalEntries || journalEntries.length === 0) {
        return (_jsxs("div", { className: "text-center py-4 text-gray-500", children: [_jsx(BookOpen, { className: "h-8 w-8 mx-auto mb-2 opacity-50" }), _jsx("p", { children: "No journal entries found for this expense" }), _jsx("p", { className: "text-sm", children: "Journal entries are created automatically when expenses are approved" })] }));
    }
    return (_jsx("div", { className: "space-y-4", children: journalEntries.map((entry, index) => (_jsxs(Card, { className: "border-l-4 border-l-blue-500", children: [_jsxs(CardHeader, { className: "pb-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Receipt, { className: "h-4 w-4 text-blue-600" }), _jsxs(CardTitle, { className: "text-sm font-medium", children: ["Journal Entry #", index + 1] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Badge, { variant: entry.status === 'POSTED' ? 'default' : 'secondary', children: entry.status }), _jsx("span", { className: "text-xs text-gray-500", children: format(new Date(entry.date), 'MMM dd, yyyy') })] })] }), _jsx("p", { className: "text-sm text-gray-600", children: entry.memo })] }), _jsxs(CardContent, { className: "pt-0", children: [_jsx("div", { className: "space-y-2", children: entry.lines?.map((line, lineIndex) => (_jsxs("div", { className: "flex items-center justify-between py-2 px-3 bg-gray-50 rounded", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "flex items-center gap-2", children: line.debit > 0 ? (_jsxs("div", { className: "flex items-center gap-1 text-red-600", children: [_jsx(ArrowUp, { className: "h-3 w-3" }), _jsx("span", { className: "text-xs font-medium", children: "DR" })] })) : (_jsxs("div", { className: "flex items-center gap-1 text-green-600", children: [_jsx(ArrowDown, { className: "h-3 w-3" }), _jsx("span", { className: "text-xs font-medium", children: "CR" })] })) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium", children: line.account?.name }), _jsx("p", { className: "text-xs text-gray-500", children: line.account?.code })] })] }), _jsxs("div", { className: "text-right", children: [_jsxs("p", { className: "text-sm font-medium", children: ["$", (line.debit || line.credit || 0).toLocaleString()] }), line.memo && (_jsx("p", { className: "text-xs text-gray-500", children: line.memo }))] })] }, lineIndex))) }), entry.createdBy && (_jsxs("div", { className: "mt-3 pt-2 border-t text-xs text-gray-500", children: ["Created by ", entry.createdBy.name || entry.createdBy.email, " on", ' ', format(new Date(entry.createdAt), 'MMM dd, yyyy HH:mm')] }))] })] }, entry.id))) }));
};
export default function ExpensesPage() {
    const { ready: authReady } = useDemoAuth('expenses-page');
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('categories');
    const [expenseStatus, setExpenseStatus] = useState('all');
    const [expenseCategoryId, setExpenseCategoryId] = useState('');
    const [expenseStartDate, setExpenseStartDate] = useState('');
    const [expenseEndDate, setExpenseEndDate] = useState('');
    const [expenseDepartment, setExpenseDepartment] = useState('');
    const [expenseProject, setExpenseProject] = useState('');
    const [isCreateCategoryOpen, setIsCreateCategoryOpen] = useState(false);
    const [isCreateBudgetOpen, setIsCreateBudgetOpen] = useState(false);
    const [isViewBudgetOpen, setIsViewBudgetOpen] = useState(false);
    const [isCreateRuleOpen, setIsCreateRuleOpen] = useState(false);
    const [editingRule, setEditingRule] = useState(null);
    const [editingBudget, setEditingBudget] = useState(null);
    const [editingCategory, setEditingCategory] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedBudget, setSelectedBudget] = useState(null);
    const [expandedCategories, setExpandedCategories] = useState(new Set());
    const [receiptOpen, setReceiptOpen] = useState(false);
    const [reportOpen, setReportOpen] = useState(false);
    const [reimburseOpen, setReimburseOpen] = useState(false);
    const [selectedExpenseId, setSelectedExpenseId] = useState(null);
    const [selectedExpense, setSelectedExpense] = useState(null);
    const [isViewExpenseOpen, setIsViewExpenseOpen] = useState(false);
    const [isCreateExpenseOpen, setIsCreateExpenseOpen] = useState(false);
    const [matchingOpen, setMatchingOpen] = useState(false);
    const [matchingContext, setMatchingContext] = useState(null);
    const [editOpen, setEditOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);
    const [cardImportOpen, setCardImportOpen] = useState(false);
    // Sorting and pagination state
    const [sortField, setSortField] = useState('expenseDate');
    const [sortDirection, setSortDirection] = useState('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [selectedExpenses, setSelectedExpenses] = useState(new Set());
    const [expenseJournalEntries, setExpenseJournalEntries] = useState(new Map());
    const queryClient = useQueryClient();
    // Fetch companies first
    const { data: companies } = useQuery({
        queryKey: ['companies'],
        queryFn: async () => {
            const result = await companiesApi.getCompanies();
            // Handle different response formats
            if (Array.isArray(result))
                return result;
            if (result?.data && Array.isArray(result.data))
                return result.data;
            if (result?.items && Array.isArray(result.items))
                return result.items;
            return [];
        },
        enabled: authReady
    });
    // Get first company ID for dependent queries
    const firstCompanyId = useMemo(() => {
        const companiesArray = Array.isArray(companies) ? companies : companies?.items || companies?.data || [];
        return companiesArray[0]?.id || 'demo-company';
    }, [companies]);
    // Fetch expense categories (depends on companies)
    const { data: categories, isLoading: categoriesLoading } = useQuery({
        queryKey: ['expense-categories', searchTerm, firstCompanyId],
        queryFn: async () => {
            const result = await expenseApi.getExpenseCategories({ companyId: firstCompanyId, q: searchTerm || undefined });
            console.log('📦 Categories API response:', result);
            // Handle different response formats
            if (Array.isArray(result))
                return result;
            if (result?.data && Array.isArray(result.data))
                return result.data;
            if (result?.items && Array.isArray(result.items))
                return result.items;
            return [];
        },
        enabled: authReady && !!firstCompanyId
    });
    const { data: budgets, isLoading: budgetsLoading } = useQuery({
        queryKey: ['budgets', firstCompanyId],
        queryFn: async () => {
            const result = await expenseApi.getBudgets();
            console.log('💰 Budgets API response:', result);
            // Handle different response formats
            if (Array.isArray(result))
                return result;
            if (result?.data && Array.isArray(result.data))
                return result.data;
            if (result?.items && Array.isArray(result.items))
                return result.items;
            return [];
        },
        enabled: authReady && !!firstCompanyId
    });
    const { data: rules, isLoading: rulesLoading } = useQuery({
        queryKey: ['expense-rules', firstCompanyId],
        queryFn: async () => await expenseApi.getExpenseRules(),
        enabled: authReady && !!firstCompanyId
    });
    const { data: analytics } = useQuery({
        queryKey: ['budget-analytics'],
        queryFn: async () => await expenseApi.getBudgetAnalytics()
    });
    // Fetch GL accounts for expense form
    const { data: accountsData } = useQuery({
        queryKey: ['gl-accounts'],
        queryFn: async () => {
            const result = await chartOfAccountsApi.getAll();
            return result;
        },
        enabled: authReady
    });
    // Fetch vendors for expense form
    const { data: vendors } = useQuery({
        queryKey: ['vendors'],
        queryFn: async () => {
            const result = await expenseApi.getVendors();
            // Handle different response formats
            if (Array.isArray(result))
                return result;
            if (result?.data && Array.isArray(result.data))
                return result.data;
            if (result?.items && Array.isArray(result.items))
                return result.items;
            return [];
        },
        enabled: authReady
    });
    // Expenses list (loaded when expenses tab is active)
    const { data: expenses, isLoading: expensesLoading } = useQuery({
        queryKey: ['expenses', expenseStatus, expenseCategoryId, expenseDepartment, expenseProject],
        enabled: activeTab === 'expenses',
        queryFn: async () => await expenseApi.getExpenses(undefined, expenseStatus === 'all' ? undefined : expenseStatus, expenseCategoryId || undefined)
    });
    // Fetch individual expense details
    const { data: expenseDetails, isLoading: expenseDetailsLoading } = useQuery({
        queryKey: ['expense', selectedExpense?.id],
        enabled: !!selectedExpense?.id,
        queryFn: async () => await expenseApi.getExpenseById(selectedExpense.id)
    });
    const submitExpense = useMutation({
        mutationFn: async (id) => expenseApi.submitExpense(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['expenses'] });
            toast.success('Expense submitted');
        }
    });
    const approveExpense = useMutation({
        mutationFn: async (id) => {
            try {
                return await expenseApi.approveExpense(id);
            }
            catch (error) {
                console.error('Error approving expense:', error);
                // Extract error message from the error response
                const errorMessage = error?.response?.data?.details ||
                    error?.response?.data?.error?.message ||
                    error?.message ||
                    'Failed to approve expense';
                throw new Error(errorMessage);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['expenses'] });
            toast.success('Expense approved');
        },
        onError: (error) => {
            console.error('Approval error:', error);
            toast.error(error.message || 'Failed to approve expense');
        }
    });
    const markPaid = useMutation({
        mutationFn: async (id) => expenseApi.updateExpense(id, { status: 'paid' }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['expenses'] });
            toast.success('Expense marked as paid');
        }
    });
    // Simple client-side policy enforcement using expense rules
    const checkPolicies = async (expense) => {
        try {
            const rules = await expenseApi.getExpenseRules();
            for (const r of (rules || [])) {
                const type = r.ruleType || r.type || '';
                let conditions = {};
                try {
                    conditions = r.conditions ? JSON.parse(r.conditions) : {};
                }
                catch { }
                if (type === 'amount_limit') {
                    const limit = Number(conditions.amount || conditions.limit || 0);
                    if (limit && Number(expense.totalAmount ?? expense.amount ?? 0) > limit) {
                        return { ok: false, message: `Amount exceeds policy limit of ${limit}` };
                    }
                }
                if (type === 'vendor_restriction') {
                    const blocked = (conditions.vendors || conditions.blocked || []);
                    const name = expense.vendor?.name || expense.vendorName || '';
                    if (Array.isArray(blocked) && blocked.some(v => v && name && name.toLowerCase().includes(String(v).toLowerCase()))) {
                        return { ok: false, message: `Vendor restricted by policy` };
                    }
                }
                if (type === 'approval_required') {
                    // If a rule explicitly requires approval, block direct submit to paid/approved paths
                    // Here we allow submit (moves to submitted) but prevent direct approve if not yet reviewed
                    // Enforcement handled in handlers
                }
            }
        }
        catch { }
        return { ok: true };
    };
    const handleSubmitExpense = async (e) => {
        const res = await checkPolicies(e);
        if (!res.ok) {
            toast.error(res.message || 'Policy violation');
            return;
        }
        submitExpense.mutate(e.id);
    };
    const handleApproveExpense = async (e) => {
        try {
            const rules = await expenseApi.getExpenseRules();
            const requiresApproval = (rules || []).some((r) => (r.ruleType || r.type) === 'approval_required');
            const role = user?.role || 'employee';
            const isApprover = role === 'admin' || role === 'accountant';
            if (requiresApproval && !isApprover) {
                toast.error('Approval requires an approver role');
                return;
            }
        }
        catch { }
        approveExpense.mutate(e.id);
    };
    // Export and bulk operations functions
    const exportToCSV = (expensesToExport) => {
        if (expensesToExport.length === 0) {
            toast.error('No expenses to export');
            return;
        }
        const headers = ['Date', 'Description', 'Category', 'Vendor', 'Amount', 'Currency', 'Tax', 'Total', 'Status', 'Payment Method', 'Reference', 'Department', 'Project'];
        const rows = expensesToExport.map(e => [
            e.expenseDate ? format(new Date(e.expenseDate), 'yyyy-MM-dd') : '',
            e.description || '',
            e.category?.name || '',
            e.vendorName || '',
            Number(e.amount || 0).toFixed(2),
            e.currency || 'USD',
            Number(e.taxAmount || 0).toFixed(2),
            Number(e.totalAmount || e.amount || 0).toFixed(2),
            e.status || 'draft',
            e.paymentMethod || '',
            e.referenceNumber || '',
            e.department || '',
            e.project || ''
        ]);
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        ].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `expenses_${format(new Date(), 'yyyy-MM-dd_HHmmss')}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success(`Exported ${expensesToExport.length} expense(s) to CSV`);
    };
    const exportToExcel = (expensesToExport) => {
        if (expensesToExport.length === 0) {
            toast.error('No expenses to export');
            return;
        }
        // Create HTML table for Excel
        const headers = ['Date', 'Description', 'Category', 'Vendor', 'Amount', 'Currency', 'Tax', 'Total', 'Status', 'Payment Method', 'Reference', 'Department', 'Project'];
        const rows = expensesToExport.map(e => [
            e.expenseDate ? format(new Date(e.expenseDate), 'yyyy-MM-dd') : '',
            e.description || '',
            e.category?.name || '',
            e.vendorName || '',
            Number(e.amount || 0).toFixed(2),
            e.currency || 'USD',
            Number(e.taxAmount || 0).toFixed(2),
            Number(e.totalAmount || e.amount || 0).toFixed(2),
            e.status || 'draft',
            e.paymentMethod || '',
            e.referenceNumber || '',
            e.department || '',
            e.project || ''
        ]);
        const htmlTable = `
      <html xmlns:x="urn:schemas-microsoft-com:office:excel">
        <head>
          <meta charset="UTF-8">
          <xml>
            <x:ExcelWorkbook>
              <x:ExcelWorksheets>
                <x:ExcelWorksheet>
                  <x:Name>Expenses</x:Name>
                  <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
                </x:ExcelWorksheet>
              </x:ExcelWorksheets>
            </x:ExcelWorkbook>
          </xml>
        </head>
        <body>
          <table border="1">
            <thead>
              <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
            </thead>
            <tbody>
              ${rows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
        const blob = new Blob([htmlTable], { type: 'application/vnd.ms-excel' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `expenses_${format(new Date(), 'yyyy-MM-dd_HHmmss')}.xls`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success(`Exported ${expensesToExport.length} expense(s) to Excel`);
    };
    const printExpenses = (expensesToPrint) => {
        if (expensesToPrint.length === 0) {
            toast.error('No expenses to print');
            return;
        }
        const printWindow = window.open('', '', 'height=800,width=1000');
        if (!printWindow) {
            toast.error('Please allow popups to print');
            return;
        }
        const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Expenses Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #333; border-bottom: 2px solid #10b981; padding-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #10b981; color: white; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .total { font-weight: bold; background-color: #e0f2f1; }
            .header-info { margin-bottom: 20px; }
            @media print {
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header-info">
            <h1>Expenses Report</h1>
            <p><strong>Generated:</strong> ${format(new Date(), 'MMMM dd, yyyy - hh:mm a')}</p>
            <p><strong>Total Expenses:</strong> ${expensesToPrint.length}</p>
            <p><strong>Total Amount:</strong> $${expensesToPrint.reduce((sum, e) => sum + Number(e.totalAmount || e.amount || 0), 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>Vendor</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${expensesToPrint.map(e => `
                <tr>
                  <td>${e.expenseDate ? format(new Date(e.expenseDate), 'MMM dd, yyyy') : '-'}</td>
                  <td>${e.description || ''}</td>
                  <td>${e.category?.name || 'Uncategorized'}</td>
                  <td>${e.vendorName || '-'}</td>
                  <td>${e.currency || 'USD'} $${Number(e.totalAmount || e.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td>${e.status || 'draft'}</td>
                </tr>
              `).join('')}
              <tr class="total">
                <td colspan="4" style="text-align: right;"><strong>TOTAL:</strong></td>
                <td colspan="2"><strong>$${expensesToPrint.reduce((sum, e) => sum + Number(e.totalAmount || e.amount || 0), 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></td>
              </tr>
            </tbody>
          </table>
        </body>
      </html>
    `;
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
        }, 250);
        toast.success(`Printing ${expensesToPrint.length} expense(s)`);
    };
    const handleBulkApprove = async () => {
        if (selectedExpenses.size === 0) {
            toast.error('No expenses selected');
            return;
        }
        try {
            const rules = await expenseApi.getExpenseRules();
            const requiresApproval = (rules || []).some((r) => (r.ruleType || r.type) === 'approval_required');
            const role = user?.role || 'employee';
            const isApprover = role === 'admin' || role === 'accountant';
            if (requiresApproval && !isApprover) {
                toast.error('Bulk approval requires an approver role');
                return;
            }
            const expenseIds = Array.from(selectedExpenses);
            let successCount = 0;
            let errorCount = 0;
            for (const id of expenseIds) {
                try {
                    await approveExpense.mutateAsync(id);
                    successCount++;
                }
                catch (error) {
                    errorCount++;
                }
            }
            setSelectedExpenses(new Set());
            queryClient.invalidateQueries({ queryKey: ['expenses'] });
            if (errorCount === 0) {
                toast.success(`Approved ${successCount} expense(s)`);
            }
            else {
                toast.warning(`Approved ${successCount} expense(s), ${errorCount} failed`);
            }
        }
        catch (error) {
            toast.error('Failed to bulk approve expenses');
        }
    };
    const handleBulkReject = async () => {
        if (selectedExpenses.size === 0) {
            toast.error('No expenses selected');
            return;
        }
        const expenseIds = Array.from(selectedExpenses);
        let successCount = 0;
        let errorCount = 0;
        for (const id of expenseIds) {
            try {
                await updateExpense.mutateAsync({ id, data: { status: 'rejected' } });
                successCount++;
            }
            catch (error) {
                errorCount++;
            }
        }
        setSelectedExpenses(new Set());
        queryClient.invalidateQueries({ queryKey: ['expenses'] });
        if (errorCount === 0) {
            toast.success(`Rejected ${successCount} expense(s)`);
        }
        else {
            toast.warning(`Rejected ${successCount} expense(s), ${errorCount} failed`);
        }
    };
    const handleBulkDelete = async () => {
        if (selectedExpenses.size === 0) {
            toast.error('No expenses selected');
            return;
        }
        if (!confirm(`Are you sure you want to delete ${selectedExpenses.size} expense(s)? This action cannot be undone.`)) {
            return;
        }
        const expenseIds = Array.from(selectedExpenses);
        let successCount = 0;
        let errorCount = 0;
        for (const id of expenseIds) {
            try {
                await deleteExpense.mutateAsync(id);
                successCount++;
            }
            catch (error) {
                errorCount++;
            }
        }
        setSelectedExpenses(new Set());
        queryClient.invalidateQueries({ queryKey: ['expenses'] });
        if (errorCount === 0) {
            toast.success(`Deleted ${successCount} expense(s)`);
        }
        else {
            toast.warning(`Deleted ${successCount} expense(s), ${errorCount} failed`);
        }
    };
    // Mutations
    const createCategory = useMutation({
        mutationFn: async (data) => expenseApi.createExpenseCategory(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['expense-categories'] });
            queryClient.invalidateQueries({ queryKey: ['budget-analytics'] }); // Invalidate analytics to update count
            setIsCreateCategoryOpen(false);
            toast.success('Expense category created successfully');
        },
        onError: (error) => {
            const errorMessage = error?.response?.data?.error || 'Failed to create expense category';
            toast.error(errorMessage);
        }
    });
    const updateCategory = useMutation({
        mutationFn: async ({ id, data }) => expenseApi.updateExpenseCategory(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['expense-categories'] });
            queryClient.invalidateQueries({ queryKey: ['budget-analytics'] }); // Invalidate analytics to update count
            setIsCreateCategoryOpen(false);
            setEditingCategory(null);
            toast.success('Expense category updated successfully');
        },
        onError: (error) => {
            const errorMessage = error?.response?.data?.error || 'Failed to update expense category';
            toast.error(errorMessage);
        }
    });
    const createBudget = useMutation({
        mutationFn: async (data) => expenseApi.createBudget(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['budgets'] });
            queryClient.invalidateQueries({ queryKey: ['budget-analytics'] });
            setIsCreateBudgetOpen(false);
            setEditingBudget(null);
            toast.success('Budget created successfully');
        },
        onError: (error) => {
            toast.error('Failed to create budget');
        }
    });
    const updateBudget = useMutation({
        mutationFn: async ({ id, data }) => expenseApi.updateBudget(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['budgets'] });
            queryClient.invalidateQueries({ queryKey: ['budget-analytics'] });
            setIsCreateBudgetOpen(false);
            setEditingBudget(null);
            toast.success('Budget updated successfully');
        },
        onError: (error) => {
            toast.error('Failed to update budget');
        }
    });
    const createRule = useMutation({
        mutationFn: async (data) => expenseApi.createExpenseRule(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['expense-rules'] });
            setIsCreateRuleOpen(false);
            toast.success('Expense rule created successfully');
        },
        onError: (error) => {
            toast.error('Failed to create expense rule');
        }
    });
    const updateRule = useMutation({
        mutationFn: async ({ id, data }) => expenseApi.updateExpenseRule(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['expense-rules'] });
            setIsCreateRuleOpen(false);
            setEditingRule(null);
            toast.success('Expense rule updated successfully');
        },
        onError: (error) => {
            toast.error('Failed to update expense rule');
        }
    });
    const createExpense = useMutation({
        mutationFn: async (data) => {
            return await expenseApi.createExpense({
                ...data,
                companyId: data.companyId || (companies?.[0]?.id || '')
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['expenses'] });
            queryClient.invalidateQueries({ queryKey: ['budget-analytics'] });
            setIsCreateExpenseOpen(false);
            toast.success('Expense created successfully');
        },
        onError: (error) => {
            const errorMessage = error?.response?.data?.error || 'Failed to create expense';
            toast.error(errorMessage);
        }
    });
    const deleteRule = useMutation({
        mutationFn: async (id) => expenseApi.deleteExpenseRule(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['expense-rules'] });
            toast.success('Expense rule deleted');
        },
        onError: () => toast.error('Failed to delete expense rule')
    });
    const updateExpense = useMutation({
        mutationFn: async (data) => expenseApi.updateExpense(data.id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['expenses'] });
            setEditOpen(false);
            setSelectedExpense(null);
            toast.success('Expense updated successfully');
        },
        onError: (error) => {
            // Handle budget exceeded error
            if (error.message?.startsWith('Budget exceeded:')) {
                toast.error(error.message, { duration: 10000 });
            }
            else if (error?.response?.data?.error?.startsWith('Budget exceeded:')) {
                toast.error(error.response.data.error, { duration: 10000 });
            }
            else {
                const errorMessage = error?.response?.data?.error || 'Failed to update expense';
                toast.error(errorMessage);
            }
        }
    });
    // Helper function to check if expense has journal entries
    const hasJournalEntries = async (expenseId) => {
        try {
            const entries = await expenseJournalApi.getJournalEntries(expenseId);
            return entries && entries.length > 0;
        }
        catch (error) {
            console.error('Error checking journal entries:', error);
            return false;
        }
    };
    const generateJournalEntry = useMutation({
        mutationFn: async (expenseId) => {
            // First check if journal entries already exist
            const existingEntries = await expenseJournalApi.getJournalEntries(expenseId);
            if (existingEntries && existingEntries.length > 0) {
                throw new Error('Journal entries already exist for this expense');
            }
            // Get the expense details
            const expense = await expenseApi.getExpenseById(expenseId);
            if (!expense) {
                throw new Error('Expense not found');
            }
            // Create journal entry by updating the expense (this will trigger journal creation)
            return await expenseApi.updateExpense(expenseId, {
                ...expense,
                status: expense.status === 'draft' ? 'submitted' : expense.status
            });
        },
        onSuccess: (data, expenseId) => {
            queryClient.invalidateQueries({ queryKey: ['expenses'] });
            queryClient.invalidateQueries({ queryKey: ['expense-journal-entries', expenseId] });
            toast.success('Journal entry generated successfully');
        },
        onError: (error) => {
            const errorMessage = error?.message || 'Failed to generate journal entry';
            toast.error(errorMessage);
        }
    });
    // Form setup
    const categoryForm = useForm({
        resolver: zodResolver(categorySchema),
        defaultValues: {}
    });
    const expenseForm = useForm({
        resolver: zodResolver(z.object({
            companyId: z.string().min(1, 'Company is required'),
            categoryId: z.string().min(1, 'Category is required'),
            budgetId: z.string().optional(), // Optional budget selection
            description: z.string().min(1, 'Description is required'),
            amount: z.coerce.number().positive('Amount must be positive'),
            expenseDate: z.string().min(1, 'Expense date is required'),
            vendorId: z.string().optional(),
            vendorName: z.string().optional(),
            notes: z.string().optional(),
            department: z.string().optional(),
            project: z.string().optional(),
            // Enhanced accounting fields
            accountId: z.string().optional(), // GL Account
            referenceNumber: z.string().optional(), // Invoice/Receipt #
            paymentMethod: z.string().optional(), // Payment method
            currency: z.string().optional(),
            taxRate: z.coerce.number().min(0).max(100).optional(), // Tax percentage
            taxAmount: z.coerce.number().min(0).optional(),
            isBillable: z.boolean().optional(),
            isRecurring: z.boolean().optional(),
            recurringPeriod: z.string().optional(),
            mileage: z.coerce.number().min(0).optional(),
            mileageRate: z.coerce.number().min(0).optional()
        })),
        defaultValues: {
            companyId: '',
            categoryId: '',
            budgetId: 'auto', // Default to auto-select
            description: '',
            amount: 0,
            expenseDate: new Date().toISOString().split('T')[0],
            vendorId: '',
            vendorName: '',
            currency: 'USD',
            paymentMethod: '',
            isBillable: false,
            isRecurring: false,
            notes: '',
            department: '',
            project: ''
        }
    });
    const budgetForm = useForm({
        resolver: zodResolver(budgetSchema),
        defaultValues: {
            period: 'monthly'
        }
    });
    // Initialize form when editing budget changes
    useEffect(() => {
        if (editingBudget) {
            budgetForm.reset({
                companyId: editingBudget.companyId || '',
                categoryId: editingBudget.category?.id || '',
                name: editingBudget.name || '',
                description: editingBudget.description || '',
                period: editingBudget.period || 'monthly',
                startDate: editingBudget.startDate || '',
                endDate: editingBudget.endDate || '',
                amount: editingBudget.amount || 0,
                alertThreshold: editingBudget.alertThreshold || 80
            });
        }
        else {
            budgetForm.reset({
                period: 'monthly'
            });
        }
    }, [editingBudget, budgetForm]);
    const ruleForm = useForm({
        resolver: zodResolver(ruleSchema),
        defaultValues: {
            companyId: '',
            categoryId: '',
            name: '',
            description: '',
            ruleType: 'approval_required',
            amountLimit: undefined,
            blockedVendors: '',
            requireApproval: true,
            notifyManager: false,
            autoReject: false,
            conditions: '',
            actions: '',
            priority: 1
        }
    });
    // Computed values
    const filteredCategories = React.useMemo(() => {
        try {
            if (!categories)
                return [];
            // API may return an array or a paginated object { items: [] } or { data: [] }
            if (Array.isArray(categories))
                return categories;
            if (categories.items)
                return categories.items;
            if (categories.data)
                return categories.data;
            return [];
        }
        catch (error) {
            console.error('Error in filteredCategories useMemo:', error);
            return [];
        }
    }, [categories]);
    const filteredBudgets = React.useMemo(() => {
        try {
            if (!budgets)
                return [];
            if (Array.isArray(budgets))
                return budgets;
            if (budgets.items)
                return budgets.items;
            if (budgets.data)
                return budgets.data;
            return [];
        }
        catch (error) {
            console.error('Error in filteredBudgets useMemo:', error);
            return [];
        }
    }, [budgets]);
    const filteredRules = React.useMemo(() => {
        try {
            if (!rules)
                return [];
            if (Array.isArray(rules))
                return rules;
            if (rules.items)
                return rules.items;
            if (rules.data)
                return rules.data;
            return [];
        }
        catch (error) {
            console.error('Error in filteredRules useMemo:', error);
            return [];
        }
    }, [rules]);
    const glAccounts = React.useMemo(() => {
        try {
            if (!accountsData)
                return [];
            if (Array.isArray(accountsData))
                return accountsData;
            if (accountsData.accounts)
                return accountsData.accounts;
            if (accountsData.items)
                return accountsData.items;
            if (accountsData.data)
                return accountsData.data;
            return [];
        }
        catch (error) {
            console.error('Error in glAccounts useMemo:', error);
            return [];
        }
    }, [accountsData]);
    // Filter expense accounts (typically type EXPENSE)
    const expenseAccounts = React.useMemo(() => {
        return glAccounts.filter((acc) => acc.type?.code === 'EXPENSE' ||
            acc.accountType?.code === 'EXPENSE' ||
            acc.isActive !== false);
    }, [glAccounts]);
    const getTaxTreatmentColor = (treatment) => {
        switch (treatment) {
            case 'deductible': return 'bg-green-100 text-green-800';
            case 'non-deductible': return 'bg-red-100 text-red-800';
            case 'partially_deductible': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    const getBudgetUtilization = (budget) => {
        return (budget.spentAmount / budget.amount) * 100;
    };
    const getBudgetStatus = (budget) => {
        const utilization = getBudgetUtilization(budget);
        if (utilization >= 100)
            return 'over-budget';
        if (utilization >= 80)
            return 'near-limit';
        return 'within-budget';
    };
    const getBudgetStatusColor = (status) => {
        switch (status) {
            case 'over-budget': return 'bg-red-100 text-red-800';
            case 'near-limit': return 'bg-yellow-100 text-yellow-800';
            case 'within-budget': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    const toggleCategoryExpansion = (categoryId) => {
        const newExpanded = new Set(expandedCategories);
        if (newExpanded.has(categoryId)) {
            newExpanded.delete(categoryId);
        }
        else {
            newExpanded.add(categoryId);
        }
        setExpandedCategories(newExpanded);
    };
    const onSubmitCategory = (data) => {
        // Convert "none" to undefined for parentId
        if (data.parentId === 'none') {
            data.parentId = undefined;
        }
        if (editingCategory) {
            // Update existing category
            updateCategory.mutate({ id: editingCategory.id, data });
        }
        else {
            // Create new category
            createCategory.mutate(data);
        }
    };
    const onSubmitBudget = (data) => {
        if (editingBudget) {
            // Update existing budget
            updateBudget.mutate({ id: editingBudget.id, data });
        }
        else {
            // Create new budget
            createBudget.mutate(data);
        }
    };
    const onSubmitRule = (data) => {
        // Convert user-friendly fields to JSON
        const processedData = { ...data };
        // Generate conditions JSON based on rule type
        switch (data.ruleType) {
            case 'amount_limit':
                processedData.conditions = JSON.stringify({
                    amount: data.amountLimit || 0
                });
                break;
            case 'vendor_restriction':
                processedData.conditions = JSON.stringify({
                    vendors: data.blockedVendors ? data.blockedVendors.split(',').map((v) => v.trim()) : []
                });
                break;
            case 'approval_required':
                processedData.conditions = JSON.stringify({});
                break;
        }
        // Generate actions JSON based on user selections
        const actions = {};
        if (data.requireApproval)
            actions.require_approval = true;
        if (data.notifyManager)
            actions.notify_manager = true;
        if (data.autoReject)
            actions.auto_reject = true;
        processedData.actions = JSON.stringify(actions);
        // Remove user-friendly fields before sending to API
        delete processedData.amountLimit;
        delete processedData.blockedVendors;
        delete processedData.requireApproval;
        delete processedData.notifyManager;
        delete processedData.autoReject;
        if (editingRule) {
            updateRule.mutate({ id: editingRule.id, data: processedData });
        }
        else {
            createRule.mutate(processedData);
        }
    };
    const onSubmitExpense = (data) => {
        // Calculate total amount including tax if provided
        const baseAmount = Number(data.amount) || 0;
        const taxAmount = data.taxAmount || (data.taxRate ? (baseAmount * Number(data.taxRate) / 100) : 0);
        const totalAmount = baseAmount + taxAmount;
        // Clean up empty strings for optional foreign key fields
        const cleanedData = {
            ...data,
            taxAmount,
            totalAmount,
            // Convert empty strings to undefined for optional foreign key fields
            vendorId: data.vendorId && data.vendorId.trim() !== '' ? data.vendorId : undefined,
            accountId: data.accountId && data.accountId.trim() !== '' ? data.accountId : undefined,
            splitAccountId: data.splitAccountId && data.splitAccountId.trim() !== '' ? data.splitAccountId : undefined
        };
        console.log('🧾 Expense form data being sent:', cleanedData);
        // Create expense as draft - user can approve it later
        createExpense.mutate(cleanedData);
    };
    const renderCategoryTree = (categories = [], level = 0) => {
        return (categories || []).map((category) => (_jsxs("div", { children: [_jsxs("div", { className: `flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 ${level > 0 ? 'ml-6' : ''}`, children: [_jsxs("div", { className: "flex items-center space-x-3", children: [(category.children && category.children.length > 0) && (_jsx(Button, { variant: "ghost", size: "sm", onClick: () => toggleCategoryExpansion(category.id), children: expandedCategories.has(category.id) ? (_jsx(ChevronDown, { className: "w-4 h-4" })) : (_jsx(ChevronRight, { className: "w-4 h-4" })) })), _jsx("div", { className: "w-4 h-4 rounded-full", style: { backgroundColor: category.color || '#6b7280' } }), _jsxs("div", { children: [_jsx("h4", { className: "font-medium", children: category.name }), category.description && (_jsx("p", { className: "text-sm text-gray-600", children: category.description }))] })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [category.taxTreatment && (_jsx(Badge, { className: getTaxTreatmentColor(category.taxTreatment), children: category.taxTreatment })), _jsx(Badge, { variant: category.isActive ? 'default' : 'secondary', children: category.isActive ? 'Active' : 'Inactive' }), _jsx(Button, { variant: "outline", size: "sm", "aria-label": `Edit category ${category.name}`, onClick: () => {
                                        setEditingCategory(category);
                                        categoryForm.reset({
                                            companyId: category.companyId || companies?.[0]?.id || '',
                                            name: category.name,
                                            description: category.description || '',
                                            parentId: category.parentId || '',
                                            color: category.color || '',
                                            icon: category.icon || '',
                                            taxTreatment: category.taxTreatment || 'deductible',
                                            approvalThreshold: category.approvalThreshold || undefined
                                        });
                                        setIsCreateCategoryOpen(true);
                                    }, children: _jsx(Edit, { className: "w-4 h-4" }) })] })] }), expandedCategories.has(category.id) && (category.children && category.children.length > 0) && (_jsx("div", { className: "mt-2", children: renderCategoryTree(category.children, level + 1) }))] }, category.id)));
    };
    return (_jsxs(PageLayout, { children: [_jsxs("div", { className: "space-y-8", children: [_jsx("div", { className: "bg-gradient-to-r from-cyan-50 via-blue-50 to-indigo-50 rounded-2xl p-8 border border-cyan-100 shadow-sm", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-6", children: [_jsx("div", { className: "w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg", children: _jsx(DollarSign, { className: "w-8 h-8 text-white" }) }), _jsxs("div", { children: [_jsx("h1", { className: "text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent", children: "Expense Management" }), _jsx("p", { className: "text-slate-600 mt-2 text-lg font-medium", children: "Track, categorize, and manage your business expenses efficiently" }), _jsxs("div", { className: "flex items-center gap-4 mt-3", children: [_jsxs("div", { className: "flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full", children: [_jsx(CheckCircle, { className: "w-4 h-4" }), _jsx("span", { children: "System Active" })] }), _jsxs("div", { className: "text-sm text-slate-500", children: ["Last sync: ", new Date().toLocaleTimeString()] })] })] })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsxs(Button, { variant: "outline", onClick: () => setReceiptOpen(true), className: "h-12 px-6 bg-white hover:bg-cyan-50 border-cyan-200 hover:border-cyan-300 transition-all duration-200", children: [_jsx(FileText, { className: "w-4 h-4 mr-2" }), "Scan Receipt"] }), _jsxs(Button, { variant: "outline", onClick: () => setReportOpen(true), className: "h-12 px-6 bg-white hover:bg-blue-50 border-blue-200 hover:border-blue-300 transition-all duration-200", children: [_jsx(TrendingUp, { className: "w-4 h-4 mr-2" }), "Export Report"] }), _jsxs(Button, { onClick: () => setIsCreateExpenseOpen(true), className: "h-12 px-8 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105", children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), "New Expense"] })] })] }) }), analytics && (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", children: [_jsx(Card, { className: "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-200", children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-blue-600 mb-1", children: "Total Categories" }), _jsx("p", { className: "text-3xl font-bold text-blue-900", children: analytics.totalCategories }), _jsx("p", { className: "text-xs text-blue-600 mt-1", children: "Expense categories" })] }), _jsx("div", { className: "w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center", children: _jsx(FolderTree, { className: "w-6 h-6 text-white" }) })] }) }) }), _jsx(Card, { className: "bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-all duration-200", children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-green-600 mb-1", children: "Active Budgets" }), _jsx("p", { className: "text-3xl font-bold text-green-900", children: analytics.activeBudgets }), _jsx("p", { className: "text-xs text-green-600 mt-1", children: "Currently active" })] }), _jsx("div", { className: "w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center", children: _jsx(Target, { className: "w-6 h-6 text-white" }) })] }) }) }), _jsx(Card, { className: "bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200 hover:shadow-lg transition-all duration-200", children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-teal-600 mb-1", children: "Total Budgeted" }), _jsxs("p", { className: "text-3xl font-bold text-teal-900", children: ["$", analytics.totalBudgetedAmount?.toLocaleString() || '0'] }), _jsx("p", { className: "text-xs text-teal-600 mt-1", children: "Budget allocation" })] }), _jsx("div", { className: "w-12 h-12 bg-teal-500 rounded-xl flex items-center justify-center", children: _jsx(DollarSign, { className: "w-6 h-6 text-white" }) })] }) }) }), _jsx(Card, { className: "bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-lg transition-all duration-200", children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-orange-600 mb-1", children: "Total Spent" }), _jsxs("p", { className: "text-3xl font-bold text-orange-900", children: ["$", analytics.totalSpentAmount?.toLocaleString() || '0'] }), _jsx("p", { className: "text-xs text-orange-600 mt-1", children: "Expenses incurred" })] }), _jsx("div", { className: "w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center", children: _jsx(TrendingUp, { className: "w-6 h-6 text-white" }) })] }) }) })] })), _jsxs(Card, { className: "shadow-lg border-slate-200", children: [_jsx(CardHeader, { className: "pb-6 border-b border-slate-200", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx(CardTitle, { className: "text-2xl font-bold text-slate-900", children: "Expense Management" }), _jsx("p", { className: "text-slate-600 mt-1", children: "Organize and track your business expenses" })] }), _jsxs("div", { className: "flex items-center space-x-3", children: [activeTab === 'categories' && (_jsxs(Dialog, { open: isCreateCategoryOpen, onOpenChange: setIsCreateCategoryOpen, children: [_jsx(DialogTrigger, { asChild: true, children: _jsxs(Button, { onClick: () => {
                                                                    setEditingCategory(null);
                                                                    categoryForm.reset({
                                                                        companyId: companies?.[0]?.id || '',
                                                                        name: '',
                                                                        description: '',
                                                                        parentId: '',
                                                                        color: '#3B82F6',
                                                                        icon: '',
                                                                        taxTreatment: 'deductible',
                                                                        approvalThreshold: undefined
                                                                    });
                                                                }, children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), "New Category"] }) }), _jsxs(DialogContent, { children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: editingCategory ? 'Edit Expense Category' : 'Create Expense Category' }), _jsx(DialogDescription, { children: editingCategory ? 'Update category information and settings' : 'Create a new category to organize your expenses' })] }), _jsx(Form, { ...categoryForm, children: _jsxs("form", { onSubmit: categoryForm.handleSubmit(onSubmitCategory), className: "space-y-4", children: [_jsx(FormField, { control: categoryForm.control, name: "companyId", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Company" }), _jsxs(Select, { value: field.value, onValueChange: field.onChange, children: [_jsx(FormControl, { children: _jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select company" }) }) }), _jsx(SelectContent, { children: (Array.isArray(companies) ? companies : []).map((company) => (_jsx(SelectItem, { value: company.id, children: company.name }, company.id))) })] }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: categoryForm.control, name: "name", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Category Name" }), _jsx(FormControl, { children: _jsx(Input, { placeholder: "Office Supplies", ...field }) }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: categoryForm.control, name: "description", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Description" }), _jsx(FormControl, { children: _jsx(Textarea, { placeholder: "Category description...", ...field }) }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: categoryForm.control, name: "parentId", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Parent Category (Optional)" }), _jsxs(Select, { value: field.value, onValueChange: field.onChange, children: [_jsx(FormControl, { children: _jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select parent category" }) }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "none", children: "None (Top Level)" }), filteredCategories.map((category) => (_jsx(SelectItem, { value: category.id, children: category.name }, category.id)))] })] }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: categoryForm.control, name: "color", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Color" }), _jsx(FormControl, { children: _jsx(Input, { type: "color", ...field }) }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: categoryForm.control, name: "taxTreatment", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Tax Treatment" }), _jsxs(Select, { value: field.value, onValueChange: field.onChange, children: [_jsx(FormControl, { children: _jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select tax treatment" }) }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "deductible", children: "Fully Deductible" }), _jsx(SelectItem, { value: "partially_deductible", children: "Partially Deductible" }), _jsx(SelectItem, { value: "non-deductible", children: "Non-Deductible" })] })] }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: categoryForm.control, name: "approvalThreshold", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Approval Threshold ($)" }), _jsx(FormControl, { children: _jsx(Input, { type: "number", step: "0.01", placeholder: "0.00", ...field }) }), _jsx(FormMessage, {})] })) }), _jsxs("div", { className: "flex justify-end space-x-2", children: [_jsx(Button, { type: "button", variant: "outline", onClick: () => {
                                                                                            setIsCreateCategoryOpen(false);
                                                                                            setEditingCategory(null);
                                                                                            categoryForm.reset();
                                                                                        }, children: "Cancel" }), _jsx(Button, { type: "submit", disabled: createCategory.status === 'pending' || updateCategory.status === 'pending', children: createCategory.status === 'pending' || updateCategory.status === 'pending'
                                                                                            ? (editingCategory ? 'Updating...' : 'Creating...')
                                                                                            : (editingCategory ? 'Update Category' : 'Create Category') })] })] }) })] })] })), activeTab === 'expenses' && (_jsxs(Button, { onClick: () => {
                                                        expenseForm.reset({
                                                            companyId: companies?.[0]?.id || '',
                                                            categoryId: '',
                                                            description: '',
                                                            amount: 0,
                                                            expenseDate: new Date().toISOString().split('T')[0],
                                                            vendorName: '',
                                                            notes: '',
                                                            department: '',
                                                            project: ''
                                                        });
                                                        setIsCreateExpenseOpen(true);
                                                    }, children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), "New Expense"] })), activeTab === 'budgets' && (_jsxs(Dialog, { open: isCreateBudgetOpen, onOpenChange: (open) => {
                                                        setIsCreateBudgetOpen(open);
                                                        if (!open) {
                                                            budgetForm.reset();
                                                            setEditingBudget(null);
                                                        }
                                                    }, children: [_jsx(DialogTrigger, { asChild: true, children: _jsxs(Button, { children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), "New Budget"] }) }), _jsxs(DialogContent, { className: "!max-w-7xl max-h-[95vh] overflow-hidden w-[95vw] flex flex-col", children: [_jsx(DialogHeader, { className: "pb-6 border-b border-slate-200", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 bg-gradient-to-br from-teal-600 to-teal-700 rounded-xl flex items-center justify-center", children: _jsx(Target, { className: "w-5 h-5 text-white" }) }), _jsxs("div", { children: [_jsx(DialogTitle, { className: "text-2xl font-bold text-slate-900", children: editingBudget ? 'Edit Budget' : 'Create New Budget' }), _jsx(DialogDescription, { className: "text-slate-600 mt-1", children: editingBudget ? 'Update your budget settings and allocations' : 'Set up a new budget to track and control expenses' })] })] }) }), _jsx(Form, { ...budgetForm, children: _jsxs("form", { onSubmit: budgetForm.handleSubmit(onSubmitBudget), className: "flex flex-col h-full", children: [_jsx("div", { className: "flex-1 overflow-y-auto max-h-[calc(95vh-200px)] scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 hover:scrollbar-thumb-slate-400 relative", children: _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6 py-6 pr-2 pb-8", children: [_jsxs("div", { className: "lg:col-span-1 space-y-6", children: [_jsxs("div", { className: "bg-slate-50 rounded-xl p-6", children: [_jsxs("h3", { className: "text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2", children: [_jsx(Building, { className: "w-5 h-5 text-teal-600" }), "Company & Category"] }), _jsxs("div", { className: "space-y-4", children: [_jsx(FormField, { control: budgetForm.control, name: "companyId", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { className: "text-sm font-medium text-slate-700", children: "Company *" }), _jsxs(Select, { value: field.value, onValueChange: field.onChange, children: [_jsx(FormControl, { children: _jsx(SelectTrigger, { className: "h-12 bg-white border-slate-300", children: _jsx(SelectValue, { placeholder: "Select company" }) }) }), _jsx(SelectContent, { children: (Array.isArray(companies) ? companies : []).map((company) => (_jsx(SelectItem, { value: company.id, children: company.name }, company.id))) })] }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: budgetForm.control, name: "categoryId", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { className: "text-sm font-medium text-slate-700", children: "Category *" }), _jsxs(Select, { onValueChange: field.onChange, defaultValue: field.value, children: [_jsx(FormControl, { children: _jsx(SelectTrigger, { className: "h-12 bg-white border-slate-300", children: _jsx(SelectValue, { placeholder: "Select category" }) }) }), _jsx(SelectContent, { children: filteredCategories.map((category) => (_jsx(SelectItem, { value: category.id, children: category.name }, category.id))) })] }), _jsx(FormMessage, {})] })) })] })] }), _jsxs("div", { className: "bg-slate-50 rounded-xl p-6", children: [_jsxs("h3", { className: "text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2", children: [_jsx(DollarSign, { className: "w-5 h-5 text-teal-600" }), "Budget Details"] }), _jsxs("div", { className: "space-y-4", children: [_jsx(FormField, { control: budgetForm.control, name: "name", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { className: "text-sm font-medium text-slate-700", children: "Budget Name *" }), _jsx(FormControl, { children: _jsx(Input, { placeholder: "Q1 Office Supplies Budget", className: "h-12 bg-white border-slate-300", ...field }) }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: budgetForm.control, name: "amount", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { className: "text-sm font-medium text-slate-700", children: "Amount *" }), _jsx(FormControl, { children: _jsx(Input, { type: "number", step: "0.01", placeholder: "0.00", className: "h-12 bg-white border-slate-300", ...field }) }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: budgetForm.control, name: "period", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { className: "text-sm font-medium text-slate-700", children: "Period *" }), _jsxs(Select, { onValueChange: field.onChange, defaultValue: field.value, children: [_jsx(FormControl, { children: _jsx(SelectTrigger, { className: "h-12 bg-white border-slate-300", children: _jsx(SelectValue, {}) }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "monthly", children: "Monthly" }), _jsx(SelectItem, { value: "quarterly", children: "Quarterly" }), _jsx(SelectItem, { value: "yearly", children: "Yearly" })] })] }), _jsx(FormMessage, {})] })) })] })] })] }), _jsxs("div", { className: "lg:col-span-1 space-y-6", children: [_jsxs("div", { className: "bg-slate-50 rounded-xl p-6", children: [_jsxs("h3", { className: "text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2", children: [_jsx(FileText, { className: "w-5 h-5 text-teal-600" }), "Budget Description"] }), _jsx(FormField, { control: budgetForm.control, name: "description", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { className: "text-sm font-medium text-slate-700", children: "Description" }), _jsx(FormControl, { children: _jsx(Textarea, { placeholder: "Describe the purpose and scope of this budget...", className: "min-h-[120px] bg-white border-slate-300 resize-none", ...field }) }), _jsx(FormMessage, {})] })) })] }), _jsxs("div", { className: "bg-slate-50 rounded-xl p-6", children: [_jsxs("h3", { className: "text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2", children: [_jsx(Calendar, { className: "w-5 h-5 text-teal-600" }), "Dates & Alerts"] }), _jsxs("div", { className: "space-y-4", children: [_jsx(FormField, { control: budgetForm.control, name: "startDate", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { className: "text-sm font-medium text-slate-700", children: "Start Date *" }), _jsx(FormControl, { children: _jsx(Input, { type: "date", className: "h-12 bg-white border-slate-300", ...field }) }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: budgetForm.control, name: "endDate", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { className: "text-sm font-medium text-slate-700", children: "End Date" }), _jsx(FormControl, { children: _jsx(Input, { type: "date", className: "h-12 bg-white border-slate-300", ...field }) }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: budgetForm.control, name: "alertThreshold", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { className: "text-sm font-medium text-slate-700", children: "Alert Threshold (%)" }), _jsx(FormControl, { children: _jsx(Input, { type: "number", step: "1", placeholder: "80", className: "h-12 bg-white border-slate-300", ...field }) }), _jsx(FormMessage, {})] })) })] })] })] })] }) }), _jsx("div", { className: "sticky bottom-0 bg-white border-t border-slate-200 p-6", children: _jsxs("div", { className: "flex items-center justify-between w-full", children: [_jsx(Button, { type: "button", variant: "outline", onClick: () => {
                                                                                                setIsCreateBudgetOpen(false);
                                                                                                setEditingBudget(null);
                                                                                            }, className: "h-12 px-6", children: "Cancel" }), _jsx(Button, { type: "submit", disabled: createBudget.status === 'pending' || updateBudget.status === 'pending', className: "h-12 px-8 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 shadow-lg hover:shadow-xl transition-all duration-200", children: createBudget.status === 'pending' || updateBudget.status === 'pending' ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" }), editingBudget ? 'Updating...' : 'Creating...'] })) : (_jsxs(_Fragment, { children: [_jsx(Target, { className: "w-4 h-4 mr-2" }), editingBudget ? 'Update Budget' : 'Create Budget'] })) })] }) })] }) })] })] })), _jsx(Dialog, { open: isViewBudgetOpen, onOpenChange: setIsViewBudgetOpen, children: _jsxs(DialogContent, { children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Budget Details" }), _jsx(DialogDescription, { children: "View complete information about this budget" })] }), selectedBudget && (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-500", children: "Budget Name" }), _jsx("p", { className: "text-lg font-semibold", children: selectedBudget.name })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-500", children: "Category" }), _jsx("p", { className: "text-lg", children: selectedBudget.category?.name || 'N/A' })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-500", children: "Period" }), _jsx("p", { className: "text-lg capitalize", children: selectedBudget.period })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-500", children: "Status" }), _jsx("p", { className: "text-lg", children: _jsx(Badge, { variant: getBudgetStatus(selectedBudget) === 'within-budget' ? 'default' : getBudgetStatus(selectedBudget) === 'near-limit' ? 'secondary' : 'destructive', children: getBudgetStatus(selectedBudget) }) })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-500", children: "Budget Amount" }), _jsxs("p", { className: "text-lg font-semibold text-green-600", children: ["$", selectedBudget.amount.toLocaleString()] })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-500", children: "Amount Spent" }), _jsxs("p", { className: "text-lg font-semibold text-red-600", children: ["$", selectedBudget.spentAmount.toLocaleString()] })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-500", children: "Start Date" }), _jsx("p", { className: "text-lg", children: format(new Date(selectedBudget.startDate), 'MMM dd, yyyy') })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-500", children: "End Date" }), _jsx("p", { className: "text-lg", children: format(new Date(selectedBudget.endDate), 'MMM dd, yyyy') })] })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-500", children: "Description" }), _jsx("p", { className: "text-lg", children: selectedBudget.description || 'No description provided' })] }), _jsxs("div", { className: "pt-4", children: [_jsx("label", { className: "text-sm font-medium text-gray-500", children: "Utilization" }), _jsxs("div", { className: "mt-2", children: [_jsx(Progress, { value: getBudgetUtilization(selectedBudget), className: "w-full" }), _jsxs("p", { className: "text-sm text-gray-600 mt-1", children: [getBudgetUtilization(selectedBudget).toFixed(1), "% utilized"] })] })] }), _jsx("div", { className: "flex justify-end pt-4", children: _jsx(Button, { variant: "outline", onClick: () => setIsViewBudgetOpen(false), children: "Close" }) })] }))] }) }), activeTab === 'rules' && (_jsxs(Dialog, { open: isCreateRuleOpen, onOpenChange: (open) => {
                                                        setIsCreateRuleOpen(open);
                                                        if (!open) {
                                                            setEditingRule(null);
                                                        }
                                                    }, children: [_jsx(DialogTrigger, { asChild: true, children: _jsxs(Button, { onClick: () => {
                                                                    setEditingRule(null);
                                                                    ruleForm.reset({
                                                                        companyId: '',
                                                                        categoryId: '',
                                                                        name: '',
                                                                        description: '',
                                                                        ruleType: 'approval_required',
                                                                        amountLimit: undefined,
                                                                        blockedVendors: '',
                                                                        requireApproval: true,
                                                                        notifyManager: false,
                                                                        autoReject: false,
                                                                        conditions: '',
                                                                        actions: '',
                                                                        priority: 1
                                                                    });
                                                                }, children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), "New Rule"] }) }), _jsxs(DialogContent, { children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: editingRule ? 'Edit Expense Rule' : 'Create Expense Rule' }), _jsx(DialogDescription, { children: editingRule ? 'Modify expense rule settings and conditions' : 'Create automated rules for expense approval and validation' })] }), _jsx(Form, { ...ruleForm, children: _jsxs("form", { onSubmit: ruleForm.handleSubmit(onSubmitRule), className: "space-y-4", children: [_jsx(FormField, { control: ruleForm.control, name: "companyId", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Company" }), _jsxs(Select, { value: field.value, onValueChange: field.onChange, children: [_jsx(FormControl, { children: _jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select company" }) }) }), _jsx(SelectContent, { children: (Array.isArray(companies) ? companies : []).map((company) => (_jsx(SelectItem, { value: company.id, children: company.name }, company.id))) })] }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: ruleForm.control, name: "categoryId", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Category" }), _jsxs(Select, { onValueChange: field.onChange, defaultValue: field.value, children: [_jsx(FormControl, { children: _jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select category" }) }) }), _jsx(SelectContent, { children: filteredCategories.map((category) => (_jsx(SelectItem, { value: category.id, children: category.name }, category.id))) })] }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: ruleForm.control, name: "name", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Rule Name" }), _jsx(FormControl, { children: _jsx(Input, { placeholder: "High Amount Approval Rule", ...field }) }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: ruleForm.control, name: "description", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Description" }), _jsx(FormControl, { children: _jsx(Textarea, { placeholder: "Rule description...", ...field }) }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: ruleForm.control, name: "ruleType", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Rule Type" }), _jsxs(Select, { onValueChange: field.onChange, defaultValue: field.value, children: [_jsx(FormControl, { children: _jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select rule type" }) }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "amount_limit", children: "Amount Limit" }), _jsx(SelectItem, { value: "vendor_restriction", children: "Vendor Restriction" }), _jsx(SelectItem, { value: "approval_required", children: "Approval Required" })] })] }), _jsx(FormMessage, {})] })) }), ruleForm.watch('ruleType') === 'amount_limit' && (_jsx(FormField, { control: ruleForm.control, name: "amountLimit", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Maximum Amount" }), _jsx(FormControl, { children: _jsx(Input, { type: "number", step: "0.01", placeholder: "1000.00", ...field }) }), _jsx(FormMessage, {})] })) })), ruleForm.watch('ruleType') === 'vendor_restriction' && (_jsx(FormField, { control: ruleForm.control, name: "blockedVendors", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Blocked Vendors" }), _jsx(FormControl, { children: _jsx(Input, { placeholder: "Vendor1, Vendor2, Vendor3", ...field }) }), _jsx("p", { className: "text-sm text-gray-500", children: "Separate multiple vendors with commas" }), _jsx(FormMessage, {})] })) })), _jsxs("div", { className: "space-y-3", children: [_jsx("h4", { className: "text-sm font-medium", children: "Actions" }), _jsx(FormField, { control: ruleForm.control, name: "requireApproval", render: ({ field }) => (_jsxs(FormItem, { className: "flex flex-row items-center space-x-3 space-y-0", children: [_jsx(FormControl, { children: _jsx("input", { type: "checkbox", checked: field.value, onChange: field.onChange, className: "rounded border-gray-300" }) }), _jsx(FormLabel, { className: "text-sm font-normal", children: "Require approval before payment" })] })) }), _jsx(FormField, { control: ruleForm.control, name: "notifyManager", render: ({ field }) => (_jsxs(FormItem, { className: "flex flex-row items-center space-x-3 space-y-0", children: [_jsx(FormControl, { children: _jsx("input", { type: "checkbox", checked: field.value, onChange: field.onChange, className: "rounded border-gray-300" }) }), _jsx(FormLabel, { className: "text-sm font-normal", children: "Notify manager when rule is triggered" })] })) }), _jsx(FormField, { control: ruleForm.control, name: "autoReject", render: ({ field }) => (_jsxs(FormItem, { className: "flex flex-row items-center space-x-3 space-y-0", children: [_jsx(FormControl, { children: _jsx("input", { type: "checkbox", checked: field.value, onChange: field.onChange, className: "rounded border-gray-300" }) }), _jsx(FormLabel, { className: "text-sm font-normal", children: "Automatically reject expenses that violate this rule" })] })) })] }), _jsx(FormField, { control: ruleForm.control, name: "priority", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Priority" }), _jsx(FormControl, { children: _jsx(Input, { type: "number", min: "1", placeholder: "1", ...field }) }), _jsx(FormMessage, {})] })) }), _jsxs("div", { className: "flex justify-end space-x-2", children: [_jsx(Button, { type: "button", variant: "outline", onClick: () => setIsCreateRuleOpen(false), children: "Cancel" }), _jsx(Button, { type: "submit", disabled: createRule.status === 'pending' || updateRule.status === 'pending', children: createRule.status === 'pending' || updateRule.status === 'pending'
                                                                                            ? (editingRule ? 'Updating...' : 'Creating...')
                                                                                            : (editingRule ? 'Update Rule' : 'Create Rule') })] })] }) })] })] })), activeTab === 'rules' && (_jsx(Button, { variant: "outline", onClick: () => {
                                                        setIsCreateRuleOpen(true);
                                                        ruleForm.reset({
                                                            companyId: '',
                                                            categoryId: '',
                                                            name: 'Require Approval',
                                                            description: 'All expenses require approval before payment',
                                                            ruleType: 'approval_required',
                                                            amountLimit: undefined,
                                                            blockedVendors: '',
                                                            requireApproval: true,
                                                            notifyManager: false,
                                                            autoReject: false,
                                                            conditions: JSON.stringify({}, null, 2),
                                                            actions: JSON.stringify({ require_approval: true }, null, 2),
                                                            priority: 1,
                                                        });
                                                    }, children: "Require Approval Policy" }))] })] }) }), _jsxs(CardContent, { className: "p-0", children: [_jsx("div", { className: "px-6 py-4 bg-slate-50 border-b border-slate-200", children: _jsxs("div", { className: "flex items-center gap-4 flex-wrap", children: [_jsx("div", { className: "flex-1 min-w-[300px]", children: _jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" }), _jsx(Input, { placeholder: "Search expenses, categories, budgets...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "pl-10 h-11 bg-white border-slate-300 focus:border-blue-500 focus:ring-blue-500" })] }) }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsxs(Select, { value: expenseStatus, onValueChange: setExpenseStatus, children: [_jsx(SelectTrigger, { className: "w-40 h-11 bg-white border-slate-300", children: _jsx(SelectValue, { placeholder: "Status" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All Status" }), _jsx(SelectItem, { value: "draft", children: "Draft" }), _jsx(SelectItem, { value: "pending", children: "Pending" }), _jsx(SelectItem, { value: "approved", children: "Approved" }), _jsx(SelectItem, { value: "rejected", children: "Rejected" })] })] }), _jsxs(Select, { value: expenseCategoryId || 'all-categories', onValueChange: (v) => setExpenseCategoryId(v === 'all-categories' ? '' : v), children: [_jsx(SelectTrigger, { className: "w-48 h-11 bg-white border-slate-300", children: _jsx(SelectValue, { placeholder: "Category" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all-categories", children: "All Categories" }), filteredCategories.map((category) => (_jsx(SelectItem, { value: category.id, children: category.name }, category.id)))] })] }), _jsxs(Button, { variant: "outline", className: "h-11 px-4 bg-white border-slate-300", children: [_jsx(Filter, { className: "w-4 h-4 mr-2" }), "Filters"] })] })] }) }), _jsx("div", { className: "px-6 py-4", children: _jsx(SegmentedTabs, { tabs: [
                                                { id: 'categories', label: 'Categories', icon: FolderTree },
                                                { id: 'budgets', label: 'Budgets', icon: Target },
                                                { id: 'rules', label: 'Rules', icon: Settings },
                                                { id: 'expenses', label: 'Expenses', icon: DollarSign },
                                            ], value: activeTab, onChange: (id) => setActiveTab(id) }) }), activeTab === 'categories' && (_jsx("div", { className: "px-6 py-6", children: _jsx("div", { className: "space-y-6", children: categoriesLoading ? (_jsx("div", { className: "flex items-center justify-center py-8", children: _jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" }) })) : filteredCategories.length === 0 ? (_jsxs("div", { className: "flex flex-col items-center justify-center py-16 text-center", children: [_jsx("div", { className: "w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4", children: _jsx(FolderTree, { className: "w-8 h-8 text-slate-400" }) }), _jsx("h3", { className: "text-xl font-semibold text-slate-900 mb-2", children: "No expense categories found" }), _jsx("p", { className: "text-slate-600 mb-6 max-w-md", children: "Create your first expense category to start organizing your business expenses efficiently." }), _jsxs(Button, { onClick: () => {
                                                            categoryForm.reset({
                                                                companyId: companies?.[0]?.id || '',
                                                                name: '',
                                                                description: '',
                                                                parentId: '',
                                                                color: '#6b7280',
                                                                icon: '',
                                                                taxTreatment: 'deductible',
                                                                approvalThreshold: undefined
                                                            });
                                                            setIsCreateCategoryOpen(true);
                                                        }, className: "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800", children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), "Create First Category"] })] })) : (_jsx("div", { className: "space-y-2", children: renderCategoryTree(filteredCategories) })) }) })), activeTab === 'budgets' && (_jsx("div", { className: "px-6 py-6", children: _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center gap-4 flex-wrap", children: [_jsx(Input, { placeholder: "Search budgets...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "max-w-xs" }), _jsxs(Select, { value: expenseStatus, onValueChange: setExpenseStatus, children: [_jsx(SelectTrigger, { className: "w-40", children: _jsx(SelectValue, { placeholder: "Filter period" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All Periods" }), _jsx(SelectItem, { value: "monthly", children: "Monthly" }), _jsx(SelectItem, { value: "quarterly", children: "Quarterly" }), _jsx(SelectItem, { value: "yearly", children: "Yearly" })] })] }), _jsxs(Select, { value: expenseCategoryId || 'all-categories', onValueChange: (v) => setExpenseCategoryId(v === 'all-categories' ? '' : v), children: [_jsx(SelectTrigger, { className: "w-48", children: _jsx(SelectValue, { placeholder: "Filter category" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all-categories", children: "All Categories" }), filteredCategories.map((c) => (_jsx(SelectItem, { value: c.id, children: c.name }, c.id)))] })] })] }), budgetsLoading ? (_jsx("div", { className: "flex items-center justify-center py-8", children: _jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" }) })) : filteredBudgets.length === 0 ? (_jsxs("div", { className: "flex flex-col items-center justify-center py-16 text-center", children: [_jsx("div", { className: "w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4", children: _jsx(Target, { className: "w-8 h-8 text-slate-400" }) }), _jsx("h3", { className: "text-xl font-semibold text-slate-900 mb-2", children: "No budgets created yet" }), _jsx("p", { className: "text-slate-600 mb-6 max-w-md", children: "Set up your first budget to track and control your expense spending across different categories." }), _jsxs(Button, { onClick: () => {
                                                                budgetForm.reset({
                                                                    companyId: companies?.[0]?.id || '',
                                                                    categoryId: '',
                                                                    name: '',
                                                                    description: '',
                                                                    period: 'monthly',
                                                                    startDate: '',
                                                                    endDate: '',
                                                                    amount: 0,
                                                                    alertThreshold: 80
                                                                });
                                                                setIsCreateBudgetOpen(true);
                                                            }, className: "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800", children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), "Create First Budget"] })] })) : (_jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { className: "px-4", children: "Budget Name" }), _jsx(TableHead, { className: "px-4", children: "Amount" }), _jsx(TableHead, { className: "px-4", children: "Spent" }), _jsx(TableHead, { className: "px-4", children: "Status" }), _jsx(TableHead, { className: "px-4", children: "Actions" })] }) }), _jsx(TableBody, { children: filteredBudgets.map((budget) => {
                                                                const status = getBudgetStatus(budget);
                                                                const utilization = getBudgetUtilization(budget);
                                                                return (_jsxs(TableRow, { className: "hover:bg-slate-50", children: [_jsx(TableCell, { className: "font-medium", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-2 h-2 bg-blue-500 rounded-full" }), budget.name] }) }), _jsxs(TableCell, { children: [_jsxs("div", { className: "text-lg font-semibold text-slate-900", children: ["$", budget.amount.toLocaleString()] }), _jsx("div", { className: "text-sm text-slate-500", children: "Total Budget" })] }), _jsxs(TableCell, { children: [_jsxs("div", { className: "text-lg font-semibold text-slate-900", children: ["$", budget.spentAmount.toLocaleString()] }), _jsx("div", { className: "text-sm text-slate-500", children: "Spent" })] }), _jsx(TableCell, { children: _jsxs("div", { className: "space-y-2", children: [_jsxs(Badge, { className: `${getBudgetStatusColor(status)} px-3 py-1`, children: [status === 'over-budget' && _jsx(AlertTriangle, { className: "w-3 h-3 mr-1" }), status === 'near-limit' && _jsx(AlertTriangle, { className: "w-3 h-3 mr-1" }), status === 'within-budget' && _jsx(CheckCircle, { className: "w-3 h-3 mr-1" }), status.replace('-', ' ')] }), _jsx("div", { className: "w-full bg-slate-200 rounded-full h-2", children: _jsx("div", { className: `h-2 rounded-full transition-all duration-300 ${status === 'over-budget' ? 'bg-red-500' :
                                                                                                status === 'near-limit' ? 'bg-yellow-500' :
                                                                                                    'bg-green-500'}`, style: { width: `${Math.min(utilization * 100, 100)}%` } }) }), _jsxs("div", { className: "text-xs text-slate-500", children: [utilization.toFixed(1), "% utilized"] })] }) }), _jsx(TableCell, { children: _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Button, { variant: "outline", size: "sm", "aria-label": `View budget ${budget.name}`, onClick: () => {
                                                                                            setSelectedBudget(budget);
                                                                                            setIsViewBudgetOpen(true);
                                                                                        }, children: _jsx(Eye, { className: "w-4 h-4" }) }), _jsx(Button, { variant: "outline", size: "sm", "aria-label": `Edit budget ${budget.name}`, onClick: () => {
                                                                                            setEditingBudget(budget);
                                                                                            budgetForm.reset({
                                                                                                companyId: budget.companyId || companies?.[0]?.id || '',
                                                                                                categoryId: budget.category?.id || '',
                                                                                                name: budget.name,
                                                                                                description: budget.description || '',
                                                                                                period: budget.period,
                                                                                                startDate: budget.startDate ? new Date(budget.startDate).toISOString().split('T')[0] : '',
                                                                                                endDate: budget.endDate ? new Date(budget.endDate).toISOString().split('T')[0] : '',
                                                                                                amount: budget.amount,
                                                                                                alertThreshold: budget.alertThreshold || 80
                                                                                            });
                                                                                            setIsCreateBudgetOpen(true);
                                                                                        }, children: _jsx(Edit, { className: "w-4 h-4" }) })] }) })] }, budget.id));
                                                            }) })] }))] }) })), activeTab === 'rules' && (_jsx("div", { className: "px-6 py-6", children: _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center gap-4 flex-wrap", children: [_jsx(Input, { placeholder: "Search rules...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "max-w-xs" }), _jsxs(Select, { value: expenseStatus, onValueChange: setExpenseStatus, children: [_jsx(SelectTrigger, { className: "w-40", children: _jsx(SelectValue, { placeholder: "Filter type" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All Types" }), _jsx(SelectItem, { value: "amount_limit", children: "Amount Limit" }), _jsx(SelectItem, { value: "vendor_restriction", children: "Vendor Restriction" }), _jsx(SelectItem, { value: "approval_required", children: "Approval Required" })] })] }), _jsxs(Select, { value: expenseCategoryId || 'all-categories', onValueChange: (v) => setExpenseCategoryId(v === 'all-categories' ? '' : v), children: [_jsx(SelectTrigger, { className: "w-48", children: _jsx(SelectValue, { placeholder: "Filter category" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all-categories", children: "All Categories" }), filteredCategories.map((c) => (_jsx(SelectItem, { value: c.id, children: c.name }, c.id)))] })] })] }), rulesLoading ? (_jsx("div", { className: "flex items-center justify-center py-8", children: _jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" }) })) : filteredRules.length === 0 ? (_jsxs("div", { className: "flex flex-col items-center justify-center py-16 text-center", children: [_jsx("div", { className: "w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4", children: _jsx(Settings, { className: "w-8 h-8 text-slate-400" }) }), _jsx("h3", { className: "text-xl font-semibold text-slate-900 mb-2", children: "No expense rules configured" }), _jsx("p", { className: "text-slate-600 mb-6 max-w-md", children: "Create expense rules to automate approval workflows and enforce spending policies across your organization." }), _jsxs("div", { className: "flex gap-3", children: [_jsxs(Button, { onClick: () => {
                                                                        ruleForm.reset({
                                                                            companyId: companies?.[0]?.id || '',
                                                                            categoryId: '',
                                                                            name: 'Require Approval',
                                                                            description: 'All expenses require approval before payment',
                                                                            ruleType: 'approval_required',
                                                                            amountLimit: undefined,
                                                                            blockedVendors: '',
                                                                            requireApproval: true,
                                                                            notifyManager: false,
                                                                            autoReject: false,
                                                                            conditions: JSON.stringify({}, null, 2),
                                                                            actions: JSON.stringify({ require_approval: true }, null, 2),
                                                                            priority: 1,
                                                                        });
                                                                        setIsCreateRuleOpen(true);
                                                                    }, className: "bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800", children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), "Create Approval Rule"] }), _jsxs(Button, { variant: "outline", onClick: () => {
                                                                        ruleForm.reset({
                                                                            companyId: companies?.[0]?.id || '',
                                                                            categoryId: '',
                                                                            name: 'Amount Limit Rule',
                                                                            description: 'Set spending limits for expense categories',
                                                                            ruleType: 'amount_limit',
                                                                            amountLimit: 1000,
                                                                            blockedVendors: '',
                                                                            requireApproval: false,
                                                                            notifyManager: true,
                                                                            autoReject: false,
                                                                            conditions: '',
                                                                            actions: '',
                                                                            priority: 1,
                                                                        });
                                                                        setIsCreateRuleOpen(true);
                                                                    }, children: [_jsx(DollarSign, { className: "w-4 h-4 mr-2" }), "Create Limit Rule"] })] })] })) : (_jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { className: "px-4", children: "Rule Name" }), _jsx(TableHead, { className: "px-4", children: "Type" }), _jsx(TableHead, { className: "px-4", children: "Status" }), _jsx(TableHead, { className: "px-4", children: "Actions" })] }) }), _jsx(TableBody, { children: filteredRules.map((rule) => (_jsxs(TableRow, { children: [_jsx(TableCell, { className: "font-medium", children: rule.name }), _jsx(TableCell, { children: _jsx(Badge, { variant: "outline", children: rule.ruleType.replace('_', ' ') }) }), _jsx(TableCell, { children: _jsx(Badge, { variant: rule.isActive ? 'default' : 'secondary', children: rule.isActive ? 'Active' : 'Inactive' }) }), _jsx(TableCell, { children: _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Button, { variant: "outline", size: "sm", "aria-label": `Toggle rule ${rule.name}`, onClick: () => updateRule.mutate({ id: rule.id, data: { isActive: !rule.isActive } }), children: rule.isActive ? 'Disable' : 'Enable' }), _jsx(Button, { variant: "outline", size: "sm", "aria-label": `Edit rule ${rule.name}`, onClick: () => {
                                                                                        setEditingRule(rule);
                                                                                        setIsCreateRuleOpen(true);
                                                                                        try {
                                                                                            // Parse existing JSON data
                                                                                            let conditions = {};
                                                                                            let actions = {};
                                                                                            try {
                                                                                                conditions = typeof rule.conditions === 'string'
                                                                                                    ? JSON.parse(rule.conditions)
                                                                                                    : rule.conditions || {};
                                                                                            }
                                                                                            catch { }
                                                                                            try {
                                                                                                actions = typeof rule.actions === 'string'
                                                                                                    ? JSON.parse(rule.actions)
                                                                                                    : rule.actions || {};
                                                                                            }
                                                                                            catch { }
                                                                                            // Extract user-friendly values
                                                                                            const amountLimit = conditions.amount || conditions.limit;
                                                                                            const blockedVendors = Array.isArray(conditions.vendors)
                                                                                                ? conditions.vendors.join(', ')
                                                                                                : '';
                                                                                            ruleForm.reset({
                                                                                                companyId: companies?.[0]?.id || '',
                                                                                                categoryId: rule.category?.id || '',
                                                                                                name: rule.name,
                                                                                                description: rule.description || '',
                                                                                                ruleType: rule.ruleType,
                                                                                                amountLimit: amountLimit,
                                                                                                blockedVendors: blockedVendors,
                                                                                                requireApproval: actions.require_approval || false,
                                                                                                notifyManager: actions.notify_manager || false,
                                                                                                autoReject: actions.auto_reject || false,
                                                                                                conditions: typeof rule.conditions === 'string' ? rule.conditions : JSON.stringify(rule.conditions || {}, null, 2),
                                                                                                actions: typeof rule.actions === 'string' ? rule.actions : JSON.stringify(rule.actions || {}, null, 2),
                                                                                                priority: rule.priority,
                                                                                            });
                                                                                        }
                                                                                        catch { }
                                                                                    }, children: _jsx(Edit, { className: "w-4 h-4" }) }), _jsx(Button, { variant: "outline", size: "sm", "aria-label": `Delete rule ${rule.name}`, onClick: () => deleteRule.mutate(rule.id), children: _jsx(Trash2, { className: "w-4 h-4" }) })] }) })] }, rule.id))) })] }))] }) })), activeTab === 'expenses' && (_jsx("div", { className: "px-6 py-6", children: _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center gap-4 flex-wrap", children: [_jsx(Input, { placeholder: "Search expenses...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "max-w-xs" }), _jsxs(Select, { value: expenseStatus, onValueChange: setExpenseStatus, children: [_jsx(SelectTrigger, { className: "w-40", children: _jsx(SelectValue, { placeholder: "Filter status" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All" }), _jsx(SelectItem, { value: "draft", children: "Draft" }), _jsx(SelectItem, { value: "submitted", children: "Submitted" }), _jsx(SelectItem, { value: "approved", children: "Approved" }), _jsx(SelectItem, { value: "paid", children: "Paid" })] })] }), _jsxs(Select, { value: expenseCategoryId || 'all-categories', onValueChange: (v) => setExpenseCategoryId(v === 'all-categories' ? '' : v), children: [_jsx(SelectTrigger, { className: "w-48", children: _jsx(SelectValue, { placeholder: "Filter category" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all-categories", children: "All Categories" }), filteredCategories.map((c) => (_jsx(SelectItem, { value: c.id, children: c.name }, c.id)))] })] }), _jsx(Input, { type: "date", value: expenseStartDate, onChange: (e) => setExpenseStartDate(e.target.value), className: "w-40" }), _jsx(Input, { type: "date", value: expenseEndDate, onChange: (e) => setExpenseEndDate(e.target.value), className: "w-40" }), _jsx(Input, { placeholder: "Dept filter", value: expenseDepartment, onChange: (e) => setExpenseDepartment(e.target.value), className: "w-40" }), _jsx(Input, { placeholder: "Project filter", value: expenseProject, onChange: (e) => setExpenseProject(e.target.value), className: "w-40" }), _jsx(Button, { variant: "outline", onClick: () => setReceiptOpen(true), children: "New from Receipt" }), _jsx(Button, { variant: "outline", onClick: () => setCardImportOpen(true), children: "Import Card CSV" }), _jsx(Button, { variant: "outline", onClick: () => { window.location.href = '/expenses/exceptions'; }, children: "Exceptions" }), _jsx(Button, { variant: "outline", onClick: () => {
                                                                const rows = (Array.isArray(expenses) ? expenses : expenses?.items || expenses?.data || [])
                                                                    .filter((e) => !searchTerm || (e.description || '').toLowerCase().includes(searchTerm.toLowerCase()))
                                                                    .filter((e) => !expenseStartDate || String(e.expenseDate || '').slice(0, 10) >= expenseStartDate)
                                                                    .filter((e) => !expenseEndDate || String(e.expenseDate || '').slice(0, 10) <= expenseEndDate)
                                                                    .filter((e) => !expenseDepartment || String(e.department || '').toLowerCase().includes(expenseDepartment.toLowerCase()))
                                                                    .filter((e) => !expenseProject || String(e.project || '').toLowerCase().includes(expenseProject.toLowerCase()))
                                                                    .map((e) => ({
                                                                    date: e.expenseDate,
                                                                    description: e.description,
                                                                    category: e.category?.name,
                                                                    department: e.department || '',
                                                                    project: e.project || '',
                                                                    status: e.status,
                                                                    amount: e.totalAmount
                                                                }));
                                                                const header = ['Date', 'Description', 'Category', 'Department', 'Project', 'Status', 'Amount'];
                                                                const lines = [header.join(','), ...rows.map(r => [r.date, JSON.stringify(r.description || '').replace(/"/g, '""'), JSON.stringify(r.category || '').replace(/"/g, '""'), JSON.stringify(r.department || '').replace(/"/g, '""'), JSON.stringify(r.project || '').replace(/"/g, '""'), r.status, r.amount].join(','))];
                                                                const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
                                                                const url = URL.createObjectURL(blob);
                                                                const a = document.createElement('a');
                                                                a.href = url;
                                                                a.download = `expenses_${new Date().toISOString().slice(0, 10)}.csv`;
                                                                a.click();
                                                                setTimeout(() => URL.revokeObjectURL(url), 30000);
                                                            }, children: "Export CSV" })] }), expensesLoading ? (_jsx("div", { className: "flex items-center justify-center py-8", children: _jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" }) })) : (!expenses || expenses.length === 0) ? (_jsxs("div", { className: "flex flex-col items-center justify-center py-16 text-center", children: [_jsx("div", { className: "w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4", children: _jsx(DollarSign, { className: "w-8 h-8 text-slate-400" }) }), _jsx("h3", { className: "text-xl font-semibold text-slate-900 mb-2", children: "No expenses recorded" }), _jsx("p", { className: "text-slate-600 mb-6 max-w-md", children: "Start tracking your business expenses by creating your first expense entry or importing from receipts." }), _jsxs("div", { className: "flex gap-3", children: [_jsxs(Button, { onClick: () => {
                                                                        expenseForm.reset({
                                                                            companyId: companies?.[0]?.id || '',
                                                                            categoryId: '',
                                                                            budgetId: 'auto',
                                                                            description: '',
                                                                            amount: 0,
                                                                            expenseDate: new Date().toISOString().split('T')[0],
                                                                            vendorName: '',
                                                                            notes: '',
                                                                            department: '',
                                                                            project: ''
                                                                        });
                                                                        setIsCreateExpenseOpen(true);
                                                                    }, className: "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800", children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), "Create First Expense"] }), _jsxs(Button, { variant: "outline", onClick: () => setReceiptOpen(true), children: [_jsx(FileText, { className: "w-4 h-4 mr-2" }), "Scan Receipt"] }), _jsxs(Button, { variant: "outline", onClick: () => setCardImportOpen(true), children: [_jsx(Upload, { className: "w-4 h-4 mr-2" }), "Import CSV"] })] })] })) : (_jsx(_Fragment, { children: (() => {
                                                        // Filter expenses
                                                        let filteredExpenses = (Array.isArray(expenses) ? expenses : expenses?.items || expenses?.data || [])
                                                            .filter((e) => !searchTerm || (e.description || '').toLowerCase().includes(searchTerm.toLowerCase()) || (e.vendorName || '').toLowerCase().includes(searchTerm.toLowerCase()) || (e.referenceNumber || '').toLowerCase().includes(searchTerm.toLowerCase()))
                                                            .filter((e) => !expenseStartDate || String(e.expenseDate || '').slice(0, 10) >= expenseStartDate)
                                                            .filter((e) => !expenseEndDate || String(e.expenseDate || '').slice(0, 10) <= expenseEndDate)
                                                            .filter((e) => !expenseDepartment || ((e.description || '').toLowerCase().includes(`[dept: ${expenseDepartment.toLowerCase()}`)))
                                                            .filter((e) => !expenseProject || ((e.description || '').toLowerCase().includes(`[proj: ${expenseProject.toLowerCase()}`)));
                                                        // Sort expenses
                                                        const sortedExpenses = [...filteredExpenses].sort((a, b) => {
                                                            let aVal = sortField === 'expenseDate' ? a.expenseDate :
                                                                sortField === 'amount' ? Number(a.totalAmount ?? a.amount ?? 0) :
                                                                    sortField === 'description' ? (a.description || '') :
                                                                        sortField === 'category' ? (a.category?.name || '') :
                                                                            sortField === 'vendor' ? (a.vendorName || '') :
                                                                                sortField === 'status' ? (a.status || '') :
                                                                                    a[sortField];
                                                            let bVal = sortField === 'expenseDate' ? b.expenseDate :
                                                                sortField === 'amount' ? Number(b.totalAmount ?? b.amount ?? 0) :
                                                                    sortField === 'description' ? (b.description || '') :
                                                                        sortField === 'category' ? (b.category?.name || '') :
                                                                            sortField === 'vendor' ? (b.vendorName || '') :
                                                                                sortField === 'status' ? (b.status || '') :
                                                                                    b[sortField];
                                                            if (aVal < bVal)
                                                                return sortDirection === 'asc' ? -1 : 1;
                                                            if (aVal > bVal)
                                                                return sortDirection === 'asc' ? 1 : -1;
                                                            return 0;
                                                        });
                                                        // Paginate
                                                        const totalItems = sortedExpenses.length;
                                                        const totalPages = Math.ceil(totalItems / itemsPerPage);
                                                        const startIndex = (currentPage - 1) * itemsPerPage;
                                                        const paginatedExpenses = sortedExpenses.slice(startIndex, startIndex + itemsPerPage);
                                                        const SortHeader = ({ field, label }) => (_jsx(TableHead, { className: "px-4 cursor-pointer select-none hover:bg-slate-50", onClick: () => {
                                                                if (sortField === field) {
                                                                    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                                                                }
                                                                else {
                                                                    setSortField(field);
                                                                    setSortDirection('asc');
                                                                }
                                                            }, children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "font-semibold", children: label }), sortField === field ? (sortDirection === 'asc' ? _jsx(ArrowUp, { className: "w-4 h-4 text-green-600" }) : _jsx(ArrowDown, { className: "w-4 h-4 text-green-600" })) : (_jsx(ArrowUpDown, { className: "w-4 h-4 text-slate-400" }))] }) }));
                                                        return (_jsxs("div", { className: "space-y-4", children: [selectedExpenses.size > 0 && (_jsx("div", { className: "bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-4 shadow-md", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsxs(Badge, { className: "bg-green-600 text-white px-3 py-1 text-base font-semibold", children: [selectedExpenses.size, " ", selectedExpenses.size === 1 ? 'Expense' : 'Expenses', " Selected"] }), _jsx(Separator, { orientation: "vertical", className: "h-6 bg-green-300" }), _jsxs("span", { className: "text-sm text-slate-600 font-medium", children: ["Total: $", sortedExpenses.filter(e => selectedExpenses.has(e.id)).reduce((sum, e) => sum + Number(e.totalAmount || e.amount || 0), 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs(Button, { variant: "outline", size: "sm", className: "bg-green-600 hover:bg-green-700 text-white border-green-700", onClick: handleBulkApprove, children: [_jsx(Check, { className: "w-4 h-4 mr-2" }), "Approve Selected"] }), _jsxs(Button, { variant: "outline", size: "sm", className: "bg-orange-600 hover:bg-orange-700 text-white border-orange-700", onClick: handleBulkReject, children: [_jsx(X, { className: "w-4 h-4 mr-2" }), "Reject Selected"] }), _jsxs(Button, { variant: "outline", size: "sm", className: "bg-red-600 hover:bg-red-700 text-white border-red-700", onClick: handleBulkDelete, children: [_jsx(Trash2, { className: "w-4 h-4 mr-2" }), "Delete Selected"] }), _jsx(Separator, { orientation: "vertical", className: "h-6 bg-green-300" }), _jsxs(Button, { variant: "outline", size: "sm", onClick: () => setSelectedExpenses(new Set()), children: [_jsx(X, { className: "w-4 h-4 mr-2" }), "Clear Selection"] })] })] }) })), _jsxs("div", { className: "flex items-center justify-between bg-slate-50 p-4 rounded-lg border border-slate-200", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-sm font-medium text-slate-700", children: "Show" }), _jsxs(Select, { value: String(itemsPerPage), onValueChange: (val) => {
                                                                                                setItemsPerPage(Number(val));
                                                                                                setCurrentPage(1);
                                                                                            }, children: [_jsx(SelectTrigger, { className: "w-20 h-9", children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "5", children: "5" }), _jsx(SelectItem, { value: "10", children: "10" }), _jsx(SelectItem, { value: "25", children: "25" }), _jsx(SelectItem, { value: "50", children: "50" }), _jsx(SelectItem, { value: "100", children: "100" })] })] }), _jsx("span", { className: "text-sm text-slate-600", children: totalItems === 0 ? 'No expenses' : `Showing ${startIndex + 1}-${Math.min(startIndex + itemsPerPage, totalItems)} of ${totalItems} expenses` })] }), selectedExpenses.size > 0 && (_jsxs(Badge, { className: "bg-blue-100 text-blue-800 border-blue-200", children: [selectedExpenses.size, " selected"] }))] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs(Button, { variant: "outline", size: "sm", onClick: () => {
                                                                                        queryClient.invalidateQueries({ queryKey: ['expenses'] });
                                                                                        toast.success('Expenses refreshed');
                                                                                    }, children: [_jsx(RefreshCw, { className: "w-4 h-4 mr-2" }), "Refresh"] }), _jsxs(Select, { value: "", onValueChange: (value) => {
                                                                                        const expensesToExport = selectedExpenses.size > 0
                                                                                            ? sortedExpenses.filter(e => selectedExpenses.has(e.id))
                                                                                            : sortedExpenses;
                                                                                        if (value === 'csv')
                                                                                            exportToCSV(expensesToExport);
                                                                                        else if (value === 'excel')
                                                                                            exportToExcel(expensesToExport);
                                                                                        else if (value === 'print')
                                                                                            printExpenses(expensesToExport);
                                                                                    }, children: [_jsx(SelectTrigger, { className: "w-[140px] h-9", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Download, { className: "w-4 h-4" }), _jsx("span", { children: "Export" })] }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "csv", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(FileText, { className: "w-4 h-4" }), _jsx("span", { children: "Export as CSV" })] }) }), _jsx(SelectItem, { value: "excel", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(FileSpreadsheet, { className: "w-4 h-4" }), _jsx("span", { children: "Export as Excel" })] }) }), _jsx(SelectItem, { value: "print", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Printer, { className: "w-4 h-4" }), _jsx("span", { children: "Print Report" })] }) })] })] })] })] }), _jsx("div", { className: "border border-slate-200 rounded-lg overflow-hidden", children: _jsxs(Table, { children: [_jsx(TableHeader, { className: "bg-gradient-to-r from-slate-50 to-slate-100", children: _jsxs(TableRow, { children: [_jsx(TableHead, { className: "px-4 w-12", children: _jsx("input", { type: "checkbox", className: "w-4 h-4 rounded border-slate-300 text-green-600 focus:ring-green-500", checked: paginatedExpenses.length > 0 && paginatedExpenses.every(e => selectedExpenses.has(e.id)), onChange: (event) => {
                                                                                                    if (event.target.checked) {
                                                                                                        setSelectedExpenses(new Set([...selectedExpenses, ...paginatedExpenses.map(e => e.id)]));
                                                                                                    }
                                                                                                    else {
                                                                                                        const newSet = new Set(selectedExpenses);
                                                                                                        paginatedExpenses.forEach(e => newSet.delete(e.id));
                                                                                                        setSelectedExpenses(newSet);
                                                                                                    }
                                                                                                } }) }), _jsx(SortHeader, { field: "expenseDate", label: "Date" }), _jsx(SortHeader, { field: "description", label: "Description & Vendor" }), _jsx(SortHeader, { field: "category", label: "Category" }), _jsx(SortHeader, { field: "amount", label: "Amount" }), _jsx(SortHeader, { field: "status", label: "Status" }), _jsx(TableHead, { className: "px-4", children: _jsx("span", { className: "font-semibold", children: "Actions" }) })] }) }), _jsx(TableBody, { children: paginatedExpenses.length === 0 ? (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 7, className: "text-center py-12", children: _jsxs("div", { className: "flex flex-col items-center gap-2 text-slate-500", children: [_jsx(FileText, { className: "w-12 h-12 text-slate-300" }), _jsx("p", { className: "text-lg font-medium", children: "No expenses found" }), _jsx("p", { className: "text-sm", children: "Try adjusting your filters or create a new expense" })] }) }) })) : (paginatedExpenses.map((e) => (_jsxs(TableRow, { className: `hover:bg-slate-50 transition-colors ${selectedExpenses.has(e.id) ? 'bg-green-50' : ''}`, children: [_jsx(TableCell, { className: "px-4", children: _jsx("input", { type: "checkbox", className: "w-4 h-4 rounded border-slate-300 text-green-600 focus:ring-green-500", checked: selectedExpenses.has(e.id), onChange: (event) => {
                                                                                                    const newSet = new Set(selectedExpenses);
                                                                                                    if (event.target.checked) {
                                                                                                        newSet.add(e.id);
                                                                                                    }
                                                                                                    else {
                                                                                                        newSet.delete(e.id);
                                                                                                    }
                                                                                                    setSelectedExpenses(newSet);
                                                                                                } }) }), _jsx(TableCell, { children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-2 h-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full shadow-sm" }), _jsxs("div", { children: [_jsx("div", { className: "font-semibold text-slate-900", children: e.expenseDate ? format(new Date(e.expenseDate), 'MMM dd, yyyy') : '-' }), _jsx("div", { className: "text-xs text-slate-500", children: e.expenseDate ? format(new Date(e.expenseDate), 'hh:mm a') : '' })] })] }) }), _jsx(TableCell, { className: "max-w-xs", children: _jsxs("div", { className: "space-y-1", children: [_jsx("div", { className: "font-semibold text-slate-900 truncate", children: e.description || 'No description' }), _jsxs("div", { className: "flex items-center gap-2", children: [e.vendorName && (_jsx(Badge, { variant: "outline", className: "text-xs bg-purple-50 text-purple-700 border-purple-200", children: e.vendorName })), e.referenceNumber && (_jsxs("span", { className: "text-xs text-slate-500", children: ["Ref: ", e.referenceNumber] }))] })] }) }), _jsx(TableCell, { children: _jsx(Badge, { variant: "outline", className: "px-3 py-1 font-medium", children: e.category?.name || 'Uncategorized' }) }), _jsx(TableCell, { children: _jsxs("div", { className: "space-y-1", children: [_jsxs("div", { className: "text-lg font-bold text-slate-900", children: [e.currency || 'USD', " $", Number(e.totalAmount ?? e.amount ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })] }), e.taxAmount && Number(e.taxAmount) > 0 && (_jsxs("div", { className: "text-xs text-slate-500", children: ["Tax: $", Number(e.taxAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })] }))] }) }), _jsxs(TableCell, { children: [_jsxs(Badge, { className: `px-3 py-1 flex items-center gap-1 w-fit ${e.status === 'approved' ? 'bg-green-100 text-green-800 border-green-200' :
                                                                                                        e.status === 'pending' || e.status === 'submitted' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                                                                                            e.status === 'rejected' ? 'bg-red-100 text-red-800 border-red-200' :
                                                                                                                'bg-gray-100 text-gray-800 border-gray-200'}`, children: [e.status === 'approved' && _jsx(CheckCircle, { className: "w-3 h-3" }), (e.status === 'pending' || e.status === 'submitted') && _jsx(AlertTriangle, { className: "w-3 h-3" }), e.status === 'rejected' && _jsx(AlertTriangle, { className: "w-3 h-3" }), _jsx("span", { className: "capitalize font-medium", children: e.status || 'draft' })] }), e.status !== 'draft' && (_jsx(ExpenseJournalIndicator, { expenseId: e.id }))] }), _jsx(TableCell, { children: _jsxs("div", { className: "flex items-center gap-2", children: [e.status === 'draft' && (_jsx(Button, { size: "sm", variant: "outline", className: "bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200", disabled: submitExpense.isPending, onClick: () => handleSubmitExpense(e), children: "Submit" })), e.status === 'submitted' && (_jsxs(_Fragment, { children: [_jsx(Button, { size: "sm", variant: "outline", className: "bg-green-50 hover:bg-green-100 text-green-700 border-green-200", disabled: approveExpense.isPending, onClick: () => handleApproveExpense(e), children: "Approve" }), _jsx(Button, { size: "sm", variant: "outline", onClick: () => { setMatchingContext({ amount: Number(e.totalAmount ?? e.amount ?? 0), date: e.expenseDate?.slice(0, 10), description: e.description }); setMatchingOpen(true); }, children: "Match" })] })), e.status === 'approved' && (_jsx(Button, { size: "sm", variant: "outline", className: "bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200", onClick: () => { setSelectedExpenseId(e.id); setReimburseOpen(true); }, children: "Reimburse" })), _jsx(Button, { size: "sm", variant: "ghost", onClick: () => { setSelectedExpense(e); setIsViewExpenseOpen(true); }, children: _jsx(Eye, { className: "w-4 h-4" }) }), _jsx(Button, { size: "sm", variant: "ghost", onClick: () => { setEditingExpense(e); setEditOpen(true); }, children: _jsx(Edit, { className: "w-4 h-4" }) }), e.status !== 'draft' && (_jsx(Button, { size: "sm", variant: "outline", className: "bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200", disabled: generateJournalEntry.isPending, onClick: async () => {
                                                                                                            const hasEntries = await hasJournalEntries(e.id);
                                                                                                            if (hasEntries) {
                                                                                                                toast.error('Journal entries already exist for this expense');
                                                                                                                return;
                                                                                                            }
                                                                                                            generateJournalEntry.mutate(e.id);
                                                                                                        }, title: "Generate Journal Entry", children: generateJournalEntry.isPending ? (_jsx("div", { className: "animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700" })) : (_jsx(BookOpen, { className: "w-4 h-4" })) }))] }) })] }, e.id)))) })] }) }), totalPages > 1 && (_jsxs("div", { className: "flex items-center justify-between bg-slate-50 p-4 rounded-lg border border-slate-200", children: [_jsxs("div", { className: "text-sm text-slate-600", children: ["Page ", currentPage, " of ", totalPages] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Button, { variant: "outline", size: "sm", disabled: currentPage === 1, onClick: () => setCurrentPage(1), children: "First" }), _jsxs(Button, { variant: "outline", size: "sm", disabled: currentPage === 1, onClick: () => setCurrentPage(currentPage - 1), children: [_jsx(ChevronLeft, { className: "w-4 h-4 mr-1" }), "Previous"] }), _jsx("div", { className: "flex items-center gap-1", children: Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                                                                        let pageNum;
                                                                                        if (totalPages <= 5) {
                                                                                            pageNum = i + 1;
                                                                                        }
                                                                                        else if (currentPage <= 3) {
                                                                                            pageNum = i + 1;
                                                                                        }
                                                                                        else if (currentPage >= totalPages - 2) {
                                                                                            pageNum = totalPages - 4 + i;
                                                                                        }
                                                                                        else {
                                                                                            pageNum = currentPage - 2 + i;
                                                                                        }
                                                                                        return (_jsx(Button, { variant: currentPage === pageNum ? 'default' : 'outline', size: "sm", className: currentPage === pageNum ? 'bg-green-600 hover:bg-green-700' : '', onClick: () => setCurrentPage(pageNum), children: pageNum }, pageNum));
                                                                                    }) }), _jsxs(Button, { variant: "outline", size: "sm", disabled: currentPage === totalPages, onClick: () => setCurrentPage(currentPage + 1), children: ["Next", _jsx(ChevronRight, { className: "w-4 h-4 ml-1" })] }), _jsx(Button, { variant: "outline", size: "sm", disabled: currentPage === totalPages, onClick: () => setCurrentPage(totalPages), children: "Last" })] })] }))] }));
                                                    })() }))] }) }))] })] })] }), _jsxs(_Fragment, { children: [_jsx(ReceiptCaptureModal, { open: receiptOpen, onOpenChange: setReceiptOpen, onCreated: () => queryClient.invalidateQueries({ queryKey: ['expenses'] }) }), _jsx(ExpenseReportModal, { open: reportOpen, onOpenChange: setReportOpen }), _jsx(ReimburseExpenseModal, { open: reimburseOpen, onOpenChange: (v) => { setReimburseOpen(v); if (!v) {
                            setSelectedExpenseId(null);
                            queryClient.invalidateQueries({ queryKey: ['expenses'] });
                        } }, expenseId: selectedExpenseId }), _jsx(ExpenseMatchingModal, { open: matchingOpen, onOpenChange: setMatchingOpen, amount: matchingContext?.amount, date: matchingContext?.date, description: matchingContext?.description }), _jsx(EditExpenseModal, { open: editOpen, onOpenChange: (v) => { setEditOpen(v); if (!v) {
                            setEditingExpense(null);
                            queryClient.invalidateQueries({ queryKey: ['expenses'] });
                        } }, expense: editingExpense }), _jsx(CardCsvImportModal, { open: cardImportOpen, onOpenChange: (v) => { setCardImportOpen(v); if (!v) {
                            queryClient.invalidateQueries({ queryKey: ['expenses'] });
                        } } }), _jsx(Dialog, { open: isCreateExpenseOpen, onOpenChange: (open) => {
                            setIsCreateExpenseOpen(open);
                            if (!open) {
                                expenseForm.reset();
                            }
                        }, children: _jsxs(DialogContent, { className: "!max-w-7xl max-h-[95vh] overflow-hidden w-[95vw] flex flex-col bg-gradient-to-br from-slate-50 to-white", children: [_jsx(DialogHeader, { className: "pb-6 border-b border-slate-200 bg-white/80 backdrop-blur-sm", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("div", { className: "relative", children: [_jsx("div", { className: "w-14 h-14 bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/30", children: _jsx(DollarSign, { className: "w-7 h-7 text-white" }) }), _jsx("div", { className: "absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full border-2 border-white flex items-center justify-center", children: _jsx(Plus, { className: "w-3 h-3 text-white" }) })] }), _jsxs("div", { children: [_jsx(DialogTitle, { className: "text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent", children: "Create New Expense" }), _jsx(DialogDescription, { className: "text-slate-600 mt-1 text-sm", children: "Professional expense tracking \u2022 Full audit trail \u2022 Real-time calculations" })] })] }), _jsx(Badge, { className: "bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-green-200 px-4 py-2 text-sm font-semibold", children: "Draft Mode" })] }) }), _jsx(Form, { ...expenseForm, children: _jsxs("form", { onSubmit: expenseForm.handleSubmit(onSubmitExpense), className: "flex flex-col h-full", children: [_jsxs("div", { className: "flex-1 overflow-y-auto max-h-[calc(95vh-200px)] scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 hover:scrollbar-thumb-slate-400 relative", children: [_jsxs("div", { className: "flex flex-col lg:flex-row gap-6 py-6 pr-2 pb-8 h-full", children: [_jsx("div", { className: "lg:w-1/2 space-y-6 flex flex-col", children: _jsxs("div", { className: "bg-slate-50 rounded-xl p-6 flex-1", children: [_jsxs("h3", { className: "text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2", children: [_jsx(Building, { className: "w-5 h-5 text-green-600" }), "Company & Category"] }), _jsxs("div", { className: "space-y-4", children: [_jsx(FormField, { control: expenseForm.control, name: "companyId", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { className: "text-sm font-medium text-slate-700", children: "Company *" }), _jsxs(Select, { value: field.value, onValueChange: field.onChange, children: [_jsx(FormControl, { children: _jsx(SelectTrigger, { className: "h-12 bg-white border-slate-300", children: _jsx(SelectValue, { placeholder: "Select company" }) }) }), _jsx(SelectContent, { children: (Array.isArray(companies) ? companies : companies?.items || companies?.data || []).map((company) => (_jsx(SelectItem, { value: company.id, children: company.name }, company.id))) })] }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: expenseForm.control, name: "categoryId", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { className: "text-sm font-medium text-slate-700", children: "Category *" }), _jsxs(Select, { value: field.value, onValueChange: field.onChange, children: [_jsx(FormControl, { children: _jsx(SelectTrigger, { className: "h-12 bg-white border-slate-300", children: _jsx(SelectValue, { placeholder: "Select category" }) }) }), _jsx(SelectContent, { children: filteredCategories.map((category) => (_jsx(SelectItem, { value: category.id, children: category.name }, category.id))) })] }), _jsx(FormMessage, {})] })) }), expenseForm.watch('categoryId') && (_jsx(FormField, { control: expenseForm.control, name: "budgetId", render: ({ field }) => {
                                                                                        const categoryBudgets = filteredBudgets.filter((b) => b.categoryId === expenseForm.watch('categoryId'));
                                                                                        const hasBudgets = categoryBudgets.length > 0;
                                                                                        return (_jsxs(FormItem, { children: [_jsxs(FormLabel, { className: "text-sm font-medium text-slate-700", children: ["Budget to Use ", hasBudgets ? `(${categoryBudgets.length} available)` : '(No budgets)'] }), _jsxs(Select, { value: field.value, onValueChange: field.onChange, children: [_jsx(FormControl, { children: _jsx(SelectTrigger, { className: "h-12 bg-white border-slate-300", children: _jsx(SelectValue, { placeholder: hasBudgets ? "Auto-select best budget" : "No budgets available", children: field.value && field.value !== 'auto' ? ((() => {
                                                                                                                        const selectedBudget = categoryBudgets.find((b) => b.id === field.value);
                                                                                                                        if (!selectedBudget)
                                                                                                                            return null;
                                                                                                                        const available = selectedBudget.amount - selectedBudget.spentAmount;
                                                                                                                        const utilization = selectedBudget.amount > 0 ? Math.round((selectedBudget.spentAmount / selectedBudget.amount) * 100) : 0;
                                                                                                                        return (_jsxs("div", { className: "flex flex-col text-left", children: [_jsx("span", { children: selectedBudget.name }), _jsxs("span", { className: "text-xs text-muted-foreground", children: ["$", available.toLocaleString(), " available (", utilization, "% used)"] })] }));
                                                                                                                    })()) : null }) }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "auto", children: hasBudgets ? "Auto-select best budget" : "No budget (expense will be unbudgeted)" }), categoryBudgets.map((budget) => {
                                                                                                                    const available = budget.amount - budget.spentAmount;
                                                                                                                    const utilization = budget.amount > 0 ? Math.round((budget.spentAmount / budget.amount) * 100) : 0;
                                                                                                                    return (_jsx(SelectItem, { value: budget.id, children: _jsxs("div", { className: "flex flex-col", children: [_jsx("span", { children: budget.name }), _jsxs("span", { className: "text-xs text-muted-foreground", children: ["$", available.toLocaleString(), " available (", utilization, "% used)"] })] }) }, budget.id));
                                                                                                                })] })] }), _jsx(FormMessage, {}), _jsx("p", { className: "text-xs text-muted-foreground", children: hasBudgets
                                                                                                        ? "Choose which budget to deduct from. Leave blank for automatic selection."
                                                                                                        : "No budgets exist for this category. Create a budget in the Budgets tab first." })] }));
                                                                                    } }))] })] }) }), _jsx("div", { className: "lg:w-1/2 space-y-6 flex flex-col", children: _jsxs("div", { className: "bg-slate-50 rounded-xl p-6 flex-1", children: [_jsxs("h3", { className: "text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2", children: [_jsx(DollarSign, { className: "w-5 h-5 text-green-600" }), "Expense Details"] }), _jsxs("div", { className: "space-y-4", children: [_jsx(FormField, { control: expenseForm.control, name: "description", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { className: "text-sm font-medium text-slate-700", children: "Description *" }), _jsx(FormControl, { children: _jsx(Input, { placeholder: "Expense description", className: "h-12 bg-white border-slate-300", ...field }) }), _jsx(FormMessage, {})] })) }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsx(FormField, { control: expenseForm.control, name: "amount", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { className: "text-sm font-medium text-slate-700", children: "Amount *" }), _jsx(FormControl, { children: _jsx(Input, { type: "number", step: "0.01", placeholder: "0.00", className: "h-12 bg-white border-slate-300", ...field, onChange: (e) => {
                                                                                                                field.onChange(e);
                                                                                                                // Auto-calculate tax if rate is set
                                                                                                                const taxRate = expenseForm.watch('taxRate');
                                                                                                                if (taxRate) {
                                                                                                                    const taxAmount = (Number(e.target.value) || 0) * (Number(taxRate) / 100);
                                                                                                                    expenseForm.setValue('taxAmount', taxAmount);
                                                                                                                }
                                                                                                            } }) }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: expenseForm.control, name: "currency", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { className: "text-sm font-medium text-slate-700", children: "Currency" }), _jsxs(Select, { value: field.value, onValueChange: field.onChange, children: [_jsx(FormControl, { children: _jsx(SelectTrigger, { className: "h-12 bg-white border-slate-300", children: _jsx(SelectValue, { placeholder: "USD" }) }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "USD", children: "USD" }), _jsx(SelectItem, { value: "EUR", children: "EUR" }), _jsx(SelectItem, { value: "GBP", children: "GBP" }), _jsx(SelectItem, { value: "CAD", children: "CAD" })] })] }), _jsx(FormMessage, {})] })) })] }), _jsx(FormField, { control: expenseForm.control, name: "expenseDate", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { className: "text-sm font-medium text-slate-700", children: "Expense Date *" }), _jsx(FormControl, { children: _jsx(Input, { type: "date", className: "h-12 bg-white border-slate-300", ...field }) }), _jsx(FormMessage, {})] })) })] })] }) }), _jsxs("div", { className: "lg:w-1/2 space-y-6 flex flex-col", children: [_jsxs("div", { className: "bg-slate-50 rounded-xl p-6 flex-1", children: [_jsxs("h3", { className: "text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2", children: [_jsx(Building, { className: "w-5 h-5 text-green-600" }), "Vendor & Organization"] }), _jsxs("div", { className: "space-y-4", children: [_jsx(FormField, { control: expenseForm.control, name: "vendorId", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { className: "text-sm font-medium text-slate-700", children: "Vendor" }), _jsxs(Select, { value: field.value, onValueChange: (value) => {
                                                                                                        field.onChange(value);
                                                                                                        // Auto-fill vendor name when vendor is selected
                                                                                                        const selectedVendor = (vendors || []).find((v) => v.id === value);
                                                                                                        if (selectedVendor) {
                                                                                                            expenseForm.setValue('vendorName', selectedVendor.name);
                                                                                                        }
                                                                                                    }, children: [_jsx(FormControl, { children: _jsx(SelectTrigger, { className: "h-12 bg-white border-slate-300", children: _jsx(SelectValue, { placeholder: "Select vendor", children: field.value && (() => {
                                                                                                                        const vendor = (vendors || []).find((v) => v.id === field.value);
                                                                                                                        return vendor ? (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-semibold", children: vendor.name?.charAt(0).toUpperCase() }), _jsx("span", { children: vendor.name })] })) : null;
                                                                                                                    })() }) }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "none", children: _jsxs("div", { className: "flex items-center gap-2 text-muted-foreground", children: [_jsx(Plus, { className: "w-4 h-4" }), _jsx("span", { children: "No vendor (cash/misc)" })] }) }), (vendors || []).map((vendor) => (_jsx(SelectItem, { value: vendor.id, children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-semibold", children: vendor.name?.charAt(0).toUpperCase() }), _jsxs("div", { children: [_jsx("div", { className: "font-medium", children: vendor.name }), vendor.email && (_jsx("div", { className: "text-xs text-muted-foreground", children: vendor.email }))] })] }) }, vendor.id)))] })] }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: expenseForm.control, name: "department", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { className: "text-sm font-medium text-slate-700", children: "Department" }), _jsx(FormControl, { children: _jsx(Input, { placeholder: "Department", className: "h-12 bg-white border-slate-300", ...field }) }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: expenseForm.control, name: "project", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { className: "text-sm font-medium text-slate-700", children: "Project" }), _jsx(FormControl, { children: _jsx(Input, { placeholder: "Project", className: "h-12 bg-white border-slate-300", ...field }) }), _jsx(FormMessage, {})] })) })] })] }), _jsxs("div", { className: "bg-slate-50 rounded-xl p-6 flex-1", children: [_jsxs("h3", { className: "text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2", children: [_jsx(FileText, { className: "w-5 h-5 text-green-600" }), "Additional Notes"] }), _jsx(FormField, { control: expenseForm.control, name: "notes", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { className: "text-sm font-medium text-slate-700", children: "Notes" }), _jsx(FormControl, { children: _jsx(Textarea, { placeholder: "Additional notes about this expense...", className: "min-h-[120px] bg-white border-slate-300 resize-none", ...field }) }), _jsx(FormMessage, {})] })) })] })] }), _jsx("div", { className: "lg:w-1/2 space-y-6 flex flex-col", children: _jsxs("div", { className: "bg-slate-50 rounded-xl p-6 flex-1", children: [_jsxs("h3", { className: "text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2", children: [_jsx(Calculator, { className: "w-5 h-5 text-green-600" }), "Accounting Details"] }), _jsxs("div", { className: "space-y-4", children: [_jsx(FormField, { control: expenseForm.control, name: "accountId", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { className: "text-sm font-medium text-slate-700", children: "GL Account" }), _jsxs(Select, { value: field.value, onValueChange: field.onChange, children: [_jsx(FormControl, { children: _jsx(SelectTrigger, { className: "h-12 bg-white border-slate-300", children: _jsx(SelectValue, { placeholder: "Select GL account" }) }) }), _jsx(SelectContent, { children: expenseAccounts.map((account) => (_jsxs(SelectItem, { value: account.id, children: [account.code, " - ", account.name] }, account.id))) })] }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: expenseForm.control, name: "referenceNumber", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { className: "text-sm font-medium text-slate-700", children: "Reference/Invoice #" }), _jsx(FormControl, { children: _jsx(Input, { placeholder: "INV-12345", className: "h-12 bg-white border-slate-300", ...field }) }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: expenseForm.control, name: "paymentMethod", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { className: "text-sm font-medium text-slate-700", children: "Payment Method" }), _jsxs(Select, { value: field.value, onValueChange: field.onChange, children: [_jsx(FormControl, { children: _jsx(SelectTrigger, { className: "h-12 bg-white border-slate-300", children: _jsx(SelectValue, { placeholder: "Select payment method" }) }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "cash", children: "Cash" }), _jsx(SelectItem, { value: "check", children: "Check" }), _jsx(SelectItem, { value: "credit_card", children: "Credit Card" }), _jsx(SelectItem, { value: "debit_card", children: "Debit Card" }), _jsx(SelectItem, { value: "bank_transfer", children: "Bank Transfer" }), _jsx(SelectItem, { value: "ach", children: "ACH" }), _jsx(SelectItem, { value: "wire", children: "Wire Transfer" })] })] }), _jsx(FormMessage, {})] })) })] })] }) }), _jsx("div", { className: "lg:w-1/2 space-y-6 flex flex-col", children: _jsxs("div", { className: "bg-slate-50 rounded-xl p-6 flex-1", children: [_jsxs("h3", { className: "text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2", children: [_jsx(Calculator, { className: "w-5 h-5 text-green-600" }), "Tax & Options"] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsx(FormField, { control: expenseForm.control, name: "taxRate", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { className: "text-sm font-medium text-slate-700", children: "Tax Rate (%)" }), _jsx(FormControl, { children: _jsx(Input, { type: "number", step: "0.01", placeholder: "7.5", className: "h-12 bg-white border-slate-300", ...field, onChange: (e) => {
                                                                                                                field.onChange(e);
                                                                                                                // Auto-calculate tax amount
                                                                                                                const amount = expenseForm.watch('amount');
                                                                                                                if (amount) {
                                                                                                                    const taxAmount = (Number(amount) || 0) * (Number(e.target.value) / 100);
                                                                                                                    expenseForm.setValue('taxAmount', taxAmount);
                                                                                                                }
                                                                                                            } }) }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: expenseForm.control, name: "taxAmount", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { className: "text-sm font-medium text-slate-700", children: "Tax Amount" }), _jsx(FormControl, { children: _jsx(Input, { type: "number", step: "0.01", placeholder: "0.00", className: "h-12 bg-white border-slate-300", ...field }) }), _jsx(FormMessage, {})] })) })] }), _jsxs("div", { className: "space-y-3", children: [_jsx(FormField, { control: expenseForm.control, name: "isBillable", render: ({ field }) => (_jsxs(FormItem, { className: "flex flex-row items-center justify-between rounded-lg border border-slate-300 bg-white p-4", children: [_jsxs("div", { className: "space-y-0.5", children: [_jsx(FormLabel, { className: "text-base font-medium", children: "Billable to Client" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Mark if this expense can be billed to a customer/project" })] }), _jsx(FormControl, { children: _jsx("input", { type: "checkbox", checked: field.value, onChange: (e) => field.onChange(e.target.checked), className: "h-5 w-5" }) })] })) }), _jsx(FormField, { control: expenseForm.control, name: "isRecurring", render: ({ field }) => (_jsxs(FormItem, { className: "flex flex-row items-center justify-between rounded-lg border border-slate-300 bg-white p-4", children: [_jsxs("div", { className: "space-y-0.5", children: [_jsx(FormLabel, { className: "text-base font-medium", children: "Recurring Expense" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "This expense repeats regularly" })] }), _jsx(FormControl, { children: _jsx("input", { type: "checkbox", checked: field.value, onChange: (e) => field.onChange(e.target.checked), className: "h-5 w-5" }) })] })) }), expenseForm.watch('isRecurring') && (_jsx(FormField, { control: expenseForm.control, name: "recurringPeriod", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { className: "text-sm font-medium text-slate-700", children: "Recurring Period" }), _jsxs(Select, { value: field.value, onValueChange: field.onChange, children: [_jsx(FormControl, { children: _jsx(SelectTrigger, { className: "h-12 bg-white border-slate-300", children: _jsx(SelectValue, { placeholder: "Select period" }) }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "weekly", children: "Weekly" }), _jsx(SelectItem, { value: "monthly", children: "Monthly" }), _jsx(SelectItem, { value: "quarterly", children: "Quarterly" }), _jsx(SelectItem, { value: "yearly", children: "Yearly" })] })] }), _jsx(FormMessage, {})] })) }))] }), _jsxs("div", { className: "pt-4 border-t border-slate-300", children: [_jsx("h4", { className: "text-sm font-semibold text-slate-900 mb-3", children: "Mileage (Optional)" }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsx(FormField, { control: expenseForm.control, name: "mileage", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { className: "text-sm font-medium text-slate-700", children: "Miles/KM" }), _jsx(FormControl, { children: _jsx(Input, { type: "number", step: "0.1", placeholder: "0", className: "h-12 bg-white border-slate-300", ...field }) }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: expenseForm.control, name: "mileageRate", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { className: "text-sm font-medium text-slate-700", children: "Rate per Mile/KM" }), _jsx(FormControl, { children: _jsx(Input, { type: "number", step: "0.01", placeholder: "0.67", className: "h-12 bg-white border-slate-300", ...field }) }), _jsx(FormMessage, {})] })) })] })] })] })] }) })] }), _jsx("div", { className: "px-6 pb-4", children: _jsxs("div", { className: "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-700", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("h3", { className: "text-lg font-bold text-white flex items-center gap-2", children: [_jsx(Calculator, { className: "w-5 h-5 text-emerald-400" }), "Expense Summary"] }), _jsx(Badge, { className: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30", children: "Live Preview" })] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between py-2 border-b border-slate-700/50", children: [_jsx("span", { className: "text-slate-300 text-sm font-medium", children: "Base Amount" }), _jsxs("span", { className: "text-white text-lg font-semibold", children: [expenseForm.watch('currency') || 'USD', " ", (Number(expenseForm.watch('amount')) || 0).toFixed(2)] })] }), (expenseForm.watch('taxRate') || expenseForm.watch('taxAmount')) && (_jsxs("div", { className: "flex items-center justify-between py-2 border-b border-slate-700/50", children: [_jsxs("span", { className: "text-slate-300 text-sm font-medium flex items-center gap-2", children: ["Tax", expenseForm.watch('taxRate') && (_jsxs(Badge, { className: "bg-slate-700 text-slate-300 text-xs", children: [Number(expenseForm.watch('taxRate')).toFixed(2), "%"] }))] }), _jsxs("span", { className: "text-emerald-400 text-lg font-semibold", children: ["+", (Number(expenseForm.watch('taxAmount')) || 0).toFixed(2)] })] })), (expenseForm.watch('mileage') && expenseForm.watch('mileageRate')) && (_jsxs("div", { className: "flex items-center justify-between py-2 border-b border-slate-700/50", children: [_jsxs("span", { className: "text-slate-300 text-sm font-medium flex items-center gap-2", children: ["Mileage", _jsxs(Badge, { className: "bg-slate-700 text-slate-300 text-xs", children: [Number(expenseForm.watch('mileage')).toFixed(1), " \u00D7 $", Number(expenseForm.watch('mileageRate')).toFixed(2)] })] }), _jsxs("span", { className: "text-blue-400 text-lg font-semibold", children: ["$", ((Number(expenseForm.watch('mileage')) || 0) * (Number(expenseForm.watch('mileageRate')) || 0)).toFixed(2)] })] })), _jsxs("div", { className: "flex items-center justify-between pt-3 mt-2 border-t-2 border-emerald-500/30", children: [_jsx("span", { className: "text-white text-lg font-bold", children: "Total Expense" }), _jsxs("div", { className: "text-right", children: [_jsxs("div", { className: "text-3xl font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent", children: [expenseForm.watch('currency') || 'USD', " ", ((Number(expenseForm.watch('amount')) || 0) +
                                                                                                    (Number(expenseForm.watch('taxAmount')) || 0)).toFixed(2)] }), expenseForm.watch('isBillable') && (_jsxs(Badge, { className: "mt-1 bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs", children: [_jsx(CheckCircle, { className: "w-3 h-3 mr-1" }), "Billable to Client"] }))] })] })] })] }) })] }), _jsx("div", { className: "sticky bottom-0 bg-gradient-to-r from-white via-slate-50 to-white border-t-2 border-slate-200 p-6 shadow-2xl", children: _jsxs("div", { className: "flex items-center justify-between w-full", children: [_jsx(Button, { type: "button", variant: "outline", onClick: () => setIsCreateExpenseOpen(false), className: "h-14 px-8 text-base font-semibold border-2 border-slate-300 hover:bg-slate-100 transition-all duration-200", children: "Cancel" }), _jsx(Button, { type: "submit", disabled: createExpense.isPending, className: "h-14 px-10 text-base font-bold bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 hover:from-emerald-700 hover:via-green-700 hover:to-teal-700 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105", children: createExpense.isPending ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "w-5 h-5 mr-2 animate-spin rounded-full border-3 border-white border-t-transparent" }), "Creating Expense..."] })) : (_jsxs(_Fragment, { children: [_jsx(CheckCircle, { className: "w-5 h-5 mr-2" }), "Create Expense"] })) })] }) })] }) })] }) }), _jsx(Dialog, { open: isViewExpenseOpen, onOpenChange: (open) => {
                            setIsViewExpenseOpen(open);
                            if (!open) {
                                setSelectedExpense(null);
                            }
                        }, children: _jsxs(DialogContent, { className: "max-w-2xl", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Expense Details" }), _jsx(DialogDescription, { children: "View complete information about this expense" })] }), expenseDetailsLoading ? (_jsx("div", { className: "flex items-center justify-center py-8", children: _jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" }) })) : expenseDetails ? (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-500", children: "Description" }), _jsx("p", { className: "text-lg font-medium", children: expenseDetails.description })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-500", children: "Amount" }), _jsxs("p", { className: "text-lg font-bold text-green-600", children: ["$", Number(expenseDetails.totalAmount ?? expenseDetails.amount ?? 0).toLocaleString()] })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-500", children: "Date" }), _jsx("p", { className: "text-lg", children: expenseDetails.expenseDate ? new Date(expenseDetails.expenseDate).toLocaleDateString() : '-' })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-500", children: "Status" }), _jsx("div", { className: "mt-1", children: _jsx(Badge, { variant: expenseDetails.status === 'paid' ? 'default' : 'secondary', children: expenseDetails.status }) })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-500", children: "Category" }), _jsx("p", { className: "text-lg", children: expenseDetails.category?.name || '-' })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-500", children: "Vendor" }), _jsx("p", { className: "text-lg", children: expenseDetails.vendorName || '-' })] })] }), (expenseDetails.notes || expenseDetails.department || expenseDetails.project) && (_jsxs("div", { className: "space-y-4", children: [_jsx(Separator, {}), _jsx("h3", { className: "text-lg font-medium", children: "Additional Information" }), _jsxs("div", { className: "grid grid-cols-1 gap-4", children: [expenseDetails.notes && (_jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-500", children: "Notes" }), _jsx("p", { className: "text-lg", children: expenseDetails.notes })] })), expenseDetails.department && (_jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-500", children: "Department" }), _jsx("p", { className: "text-lg", children: expenseDetails.department })] })), expenseDetails.project && (_jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-500", children: "Project" }), _jsx("p", { className: "text-lg", children: expenseDetails.project })] }))] })] })), expenseDetails.receiptUrl && (_jsxs("div", { className: "space-y-4", children: [_jsx(Separator, {}), _jsx("h3", { className: "text-lg font-medium", children: "Receipt" }), _jsx("div", { className: "flex items-center space-x-4", children: _jsx(Button, { variant: "outline", onClick: () => window.open(expenseDetails.receiptUrl, '_blank'), children: "View Receipt" }) })] })), _jsxs("div", { className: "space-y-4", children: [_jsx(Separator, {}), _jsxs("h3", { className: "text-lg font-medium flex items-center gap-2", children: [_jsx(BookOpen, { className: "h-5 w-5" }), "Journal Entries"] }), _jsx(ExpenseJournalEntries, { expenseId: expenseDetails.id })] }), _jsxs("div", { className: "space-y-4", children: [_jsx(Separator, {}), _jsx("h3", { className: "text-lg font-medium", children: "Timestamps" }), _jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-500", children: "Created" }), _jsx("p", { className: "text-lg", children: expenseDetails.createdAt ? new Date(expenseDetails.createdAt).toLocaleString() : '-' })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-500", children: "Last Updated" }), _jsx("p", { className: "text-lg", children: expenseDetails.updatedAt ? new Date(expenseDetails.updatedAt).toLocaleString() : '-' })] })] })] })] })) : (_jsx("div", { className: "text-center py-8", children: _jsx("p", { className: "text-gray-500", children: "No expense details found" }) }))] }) })] })] }));
}
