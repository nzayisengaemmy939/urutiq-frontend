import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import apiService from '../lib/api';
import { PageLayout } from '../components/page-layout';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Calendar } from '../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { CalendarDays, Plus, Save, Trash2, Copy, CheckCircle, AlertTriangle, FileText, Receipt, History, Sparkles, Scale, ArrowLeftRight, Download, CheckCircle2, Clock, Bot, Zap, Clipboard } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';
const TEMPLATES = [
    {
        id: 'office_expense',
        title: 'Office Expense',
        description: 'Standard office expense with accounts payable',
        lines: [
            { accountId: '5000', accountName: 'Office Expenses', debit: 500, credit: 0, memo: 'Office supplies purchase' },
            { accountId: '2100', accountName: 'Accounts Payable', debit: 0, credit: 500, memo: 'Amount owed to supplier' }
        ]
    },
    {
        id: 'revenue_recognition',
        title: 'Revenue Recognition',
        description: 'Record revenue with accounts receivable',
        lines: [
            { accountId: '1120', accountName: 'Accounts Receivable', debit: 1000, credit: 0, memo: 'Customer invoice' },
            { accountId: '3000', accountName: 'Revenue', debit: 0, credit: 1000, memo: 'Service revenue earned' }
        ]
    },
    {
        id: 'depreciation',
        title: 'Depreciation',
        description: 'Monthly depreciation adjustment',
        lines: [
            { accountId: '5300', accountName: 'Depreciation Expense', debit: 250, credit: 0, memo: 'Depreciation expense' },
            { accountId: '1400', accountName: 'Accumulated Depreciation', debit: 0, credit: 250, memo: 'Accumulated depreciation' }
        ]
    },
    {
        id: 'accrual',
        title: 'Accrual',
        description: 'Expense accrual entry',
        lines: [
            { accountId: '5200', accountName: 'Utilities Expense', debit: 300, credit: 0, memo: 'Accrued utility expense' },
            { accountId: '2200', accountName: 'Accrued Expenses', debit: 0, credit: 300, memo: 'Accrued expenses payable' }
        ]
    },
    {
        id: 'inventory',
        title: 'Inventory Adjustment',
        description: 'Adjust inventory levels and COGS',
        lines: [
            { accountId: '6000', accountName: 'Cost of Goods Sold', debit: 750, credit: 0, memo: 'Cost of goods sold' },
            { accountId: '1200', accountName: 'Inventory', debit: 0, credit: 750, memo: 'Inventory reduction' }
        ]
    },
    {
        id: 'payment',
        title: 'Payment Entry',
        description: 'Record payment to supplier',
        lines: [
            { accountId: '2100', accountName: 'Accounts Payable', debit: 1200, credit: 0, memo: 'Accounts payable payment' },
            { accountId: '1110', accountName: 'Cash', debit: 0, credit: 1200, memo: 'Cash payment' }
        ]
    },
    {
        id: 'bank_loan',
        title: 'Bank Loan Received',
        description: 'Receive bank loan (increases liabilities)',
        lines: [
            { accountId: '1110', accountName: 'Cash', debit: 10000, credit: 0, memo: 'Loan proceeds received' },
            { accountId: '2101', accountName: 'Bank Loan', debit: 0, credit: 10000, memo: 'Bank loan liability' }
        ]
    },
    {
        id: 'equipment_credit',
        title: 'Equipment Purchase on Credit',
        description: 'Buy equipment on account (increases liabilities)',
        lines: [
            { accountId: '1300', accountName: 'Equipment', debit: 5000, credit: 0, memo: 'Equipment purchase' },
            { accountId: '2100', accountName: 'Accounts Payable', debit: 0, credit: 5000, memo: 'Amount owed to supplier' }
        ]
    },
    {
        id: 'customer_prepayment',
        title: 'Customer Prepayment',
        description: 'Customer pays in advance (unearned revenue)',
        lines: [
            { accountId: '1110', accountName: 'Cash', debit: 2000, credit: 0, memo: 'Customer advance payment' },
            { accountId: '2104', accountName: 'Unearned Revenue', debit: 0, credit: 2000, memo: 'Unearned revenue liability' }
        ]
    },
    {
        id: 'rent_accrual',
        title: 'Accrue Monthly Rent',
        description: 'Accrue rent expense (increases liabilities)',
        lines: [
            { accountId: '5001', accountName: 'Rent Expense', debit: 1500, credit: 0, memo: 'Monthly rent expense' },
            { accountId: '2103', accountName: 'Accrued Expenses', debit: 0, credit: 1500, memo: 'Accrued rent payable' }
        ]
    },
    {
        id: 'credit_card_purchase',
        title: 'Credit Card Purchase',
        description: 'Make purchase with credit card',
        lines: [
            { accountId: '5000', accountName: 'Office Expenses', debit: 300, credit: 0, memo: 'Office supplies on credit card' },
            { accountId: '2102', accountName: 'Credit Card Payable', debit: 0, credit: 300, memo: 'Credit card liability' }
        ]
    }
];
// Recent entries will be fetched from the API
export default function NewJournalEntryPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [companyId] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('company_id') || localStorage.getItem('companyId') || localStorage.getItem('company') || '';
        }
        return '';
    });
    const [date, setDate] = useState(new Date());
    const [postingDate, setPostingDate] = useState(new Date());
    const [memo, setMemo] = useState('');
    const [reference, setReference] = useState('');
    const [entryType, setEntryType] = useState('GENERAL');
    const [entryNumber, setEntryNumber] = useState('JE-2025-001');
    const [lines, setLines] = useState([
        { id: '1', accountId: '', accountName: '', debit: 0, credit: 0, memo: '' },
        { id: '2', accountId: '', accountName: '', debit: 0, credit: 0, memo: '' },
    ]);
    const [posting, setPosting] = useState(false);
    const [accounts, setAccounts] = useState([]);
    const [accountsLoading, setAccountsLoading] = useState(true);
    const [recentEntries, setRecentEntries] = useState([]);
    const [recentEntriesLoading, setRecentEntriesLoading] = useState(false);
    const [showTemplates, setShowTemplates] = useState(false);
    const [errors, setErrors] = useState([]);
    const [aiSuggestions, setAiSuggestions] = useState([]);
    const [successMessage, setSuccessMessage] = useState('');
    const nextLineId = useRef(3);
    // Load accounts and recent entries on component mount
    useEffect(() => {
        loadAccounts();
        loadRecentEntries();
        generateAiSuggestions();
        // Check for success message from URL
        if (searchParams.get('success') === 'entry-created') {
            setSuccessMessage('Journal entry created successfully!');
            // Clear success message after 5 seconds
            setTimeout(() => setSuccessMessage(''), 5000);
        }
    }, [lines, searchParams]);
    const loadAccounts = async () => {
        setAccountsLoading(true);
        try {
            // First, try to create some basic accounts if they don't exist
            await createBasicAccounts();
            // Then load accounts from API
            const accountsData = await apiService.get(`/api/accounts?companyId=${companyId}`);
            console.log('Loaded accounts:', accountsData);
            // Handle different response formats
            let accountsList = [];
            if (accountsData?.flat) {
                accountsList = accountsData.flat;
            }
            else if (accountsData?.data) {
                accountsList = accountsData.data;
            }
            else if (Array.isArray(accountsData)) {
                accountsList = accountsData;
            }
            if (accountsList && accountsList.length > 0) {
                setAccounts(accountsList);
            }
            else {
                console.log('No accounts found, using fallback');
                setAccounts([]);
            }
        }
        catch (error) {
            console.error('Failed to load accounts:', error);
            setAccounts([]);
            setErrors(['Failed to load accounts. Please check your connection.']);
        }
        finally {
            setAccountsLoading(false);
        }
    };
    const createBasicAccounts = async () => {
        try {
            // Create account types first
            const accountTypes = [
                { code: 'ASSET', name: 'Asset' },
                { code: 'LIABILITY', name: 'Liability' },
                { code: 'REVENUE', name: 'Revenue' },
                { code: 'EXPENSE', name: 'Expense' }
            ];
            const typeMap = {};
            for (const type of accountTypes) {
                try {
                    const existingTypes = await apiService.get(`/api/account-types?companyId=${companyId}`);
                    const existingType = existingTypes.find((t) => t.code === type.code);
                    if (existingType) {
                        typeMap[type.code] = existingType.id;
                    }
                    else {
                        const createdType = await apiService.post('/api/account-types', {
                            ...type,
                            companyId
                        });
                        typeMap[type.code] = createdType.id;
                    }
                }
                catch (error) {
                    console.log(`Account type ${type.name} creation failed:`, error);
                }
            }
            // Create basic accounts
            const basicAccounts = [
                // Assets
                { name: 'Cash', code: '1110', typeCode: 'ASSET' },
                { name: 'Accounts Receivable', code: '1120', typeCode: 'ASSET' },
                { name: 'Equipment', code: '1300', typeCode: 'ASSET' },
                // Liabilities
                { name: 'Accounts Payable', code: '2100', typeCode: 'LIABILITY' },
                { name: 'Bank Loan', code: '2101', typeCode: 'LIABILITY' },
                { name: 'Credit Card Payable', code: '2102', typeCode: 'LIABILITY' },
                { name: 'Accrued Expenses', code: '2103', typeCode: 'LIABILITY' },
                { name: 'Unearned Revenue', code: '2104', typeCode: 'LIABILITY' },
                // Equity
                { name: 'Owner Equity', code: '3000', typeCode: 'EQUITY' },
                // Revenue
                { name: 'Sales Revenue', code: '4000', typeCode: 'REVENUE' },
                // Expenses
                { name: 'Office Expenses', code: '5000', typeCode: 'EXPENSE' },
                { name: 'Rent Expense', code: '5001', typeCode: 'EXPENSE' }
            ];
            for (const account of basicAccounts) {
                try {
                    const existingAccounts = await apiService.get(`/api/accounts?companyId=${companyId}`);
                    const existingAccount = existingAccounts?.flat?.find((a) => a.code === account.code) ||
                        existingAccounts?.data?.find((a) => a.code === account.code);
                    if (!existingAccount && typeMap[account.typeCode]) {
                        await apiService.post('/api/accounts', {
                            name: account.name,
                            code: account.code,
                            typeId: typeMap[account.typeCode],
                            companyId
                        });
                        console.log(`Created account: ${account.name}`);
                    }
                }
                catch (error) {
                    console.log(`Account ${account.name} creation failed:`, error);
                }
            }
        }
        catch (error) {
            console.error('Failed to create basic accounts:', error);
        }
    };
    const loadRecentEntries = async () => {
        setRecentEntriesLoading(true);
        try {
            // Fetch recent journal entries from API
            const entriesData = await apiService.get(`/api/journal?companyId=${companyId}&page=1&pageSize=5`);
            console.log('Loaded recent entries:', entriesData);
            // Handle different response formats
            let entriesList = [];
            if (entriesData?.entries) {
                entriesList = entriesData.entries;
            }
            else if (entriesData?.data) {
                entriesList = entriesData.data;
            }
            else if (Array.isArray(entriesData)) {
                entriesList = entriesData;
            }
            if (entriesList && entriesList.length > 0) {
                // Transform the data to match the expected format
                const transformedEntries = entriesList.map((entry) => {
                    // Calculate total amount from journal lines
                    const totalAmount = entry.lines?.reduce((sum, line) => {
                        return sum + (Number(line.debit) || 0) + (Number(line.credit) || 0);
                    }, 0) || 0;
                    // Create a shorter, more user-friendly entry number
                    const shortId = entry.id ? entry.id.substring(0, 8).toUpperCase() : 'N/A';
                    const friendlyEntryNumber = entry.reference || `JE-${shortId}` || `JE-${entry.id?.substring(0, 8)}`;
                    return {
                        id: entry.id,
                        description: entry.memo || entry.description || 'Journal Entry',
                        amount: Number(totalAmount) || 0,
                        date: entry.date ? new Date(entry.date).toISOString().split('T')[0] :
                            entry.createdAt ? new Date(entry.createdAt).toISOString().split('T')[0] :
                                new Date().toISOString().split('T')[0],
                        status: entry.status || 'Posted',
                        entryNumber: friendlyEntryNumber,
                        lines: entry.lines || []
                    };
                });
                setRecentEntries(transformedEntries);
            }
            else {
                setRecentEntries([]);
            }
        }
        catch (error) {
            console.error('Failed to load recent entries:', error);
            setRecentEntries([]);
        }
        finally {
            setRecentEntriesLoading(false);
        }
    };
    const generateAiSuggestions = () => {
        const totalDebits = lines.reduce((sum, line) => sum + (line.debit || 0), 0);
        const totalCredits = lines.reduce((sum, line) => sum + (line.credit || 0), 0);
        const difference = totalDebits - totalCredits;
        const suggestions = [];
        if (Math.abs(difference) > 0.01) {
            if (difference > 0) {
                suggestions.push(`The debit entry suggests an expense transaction. Consider adding a credit to Accounts Payable (2100) to balance the entry.`);
                suggestions.push(`Based on similar transactions, credit amount should be $${difference.toFixed(2)} to Accounts Payable.`);
            }
            else {
                suggestions.push(`The credit entry needs a corresponding debit. Consider adding a debit to complete the transaction.`);
            }
        }
        setAiSuggestions(suggestions);
    };
    const copyFromRecentEntry = (entry) => {
        // This function would copy the entry details to the current form
        // For now, we'll just show a message
        setMemo(entry.description || '');
        setSuccessMessage(`Copied details from ${entry.entryNumber}`);
        setTimeout(() => setSuccessMessage(''), 3000);
    };
    const validateEntry = () => {
        const validationErrors = [];
        if (!memo.trim()) {
            validationErrors.push('Please add a description for this transaction');
        }
        const totalDebits = lines.reduce((sum, line) => sum + (line.debit || 0), 0);
        const totalCredits = lines.reduce((sum, line) => sum + (line.credit || 0), 0);
        if (Math.abs(totalDebits - totalCredits) > 0.01) {
            validationErrors.push(`Debits ($${totalDebits.toFixed(2)}) must equal Credits ($${totalCredits.toFixed(2)})`);
        }
        if (totalDebits === 0 && totalCredits === 0) {
            validationErrors.push('Please enter some amounts for the transaction');
        }
        const linesWithoutAccount = lines.filter(line => !line.accountId);
        if (linesWithoutAccount.length > 0) {
            validationErrors.push('Please select accounts for all transaction lines');
        }
        return validationErrors;
    };
    const updateLine = (lineId, patch) => {
        setLines(prev => prev.map(line => line.id === lineId ? { ...line, ...patch } : line));
        // Clear errors when user makes changes
        if (errors.length > 0) {
            setErrors([]);
        }
    };
    const addLine = () => {
        const newLine = {
            id: nextLineId.current.toString(),
            accountId: '',
            debit: 0,
            credit: 0,
            memo: ''
        };
        setLines(prev => [...prev, newLine]);
        nextLineId.current++;
    };
    const removeLine = (lineId) => {
        if (lines.length > 2) {
            setLines(prev => prev.filter(line => line.id !== lineId));
        }
    };
    const duplicateLine = (lineId) => {
        const lineToDuplicate = lines.find(line => line.id === lineId);
        if (lineToDuplicate) {
            const newLine = {
                ...lineToDuplicate,
                id: nextLineId.current.toString(),
                debit: 0,
                credit: 0,
                memo: ''
            };
            setLines(prev => {
                const index = prev.findIndex(line => line.id === lineId);
                return [...prev.slice(0, index + 1), newLine, ...prev.slice(index + 1)];
            });
            nextLineId.current++;
        }
    };
    const applyTemplate = (template) => {
        const newLines = template.lines.map((line, index) => {
            // Find the account by code or name
            const account = accounts.find(acc => acc.code === line.accountId || acc.name === line.accountName);
            return {
                id: (index + 1).toString(),
                accountId: account?.id || line.accountId,
                accountName: account?.name || line.accountName,
                debit: line.debit,
                credit: line.credit,
                memo: line.memo
            };
        });
        setLines(newLines);
        setMemo(template.title);
        setShowTemplates(false);
        nextLineId.current = newLines.length + 1;
    };
    const autoBalance = () => {
        const totalDebits = lines.reduce((sum, line) => sum + (line.debit || 0), 0);
        const totalCredits = lines.reduce((sum, line) => sum + (line.credit || 0), 0);
        const difference = totalDebits - totalCredits;
        if (Math.abs(difference) > 0.01) {
            // Find the first empty credit or debit field
            const emptyLine = lines.find(line => !line.debit && !line.credit);
            if (emptyLine) {
                if (difference > 0) {
                    updateLine(emptyLine.id, { credit: difference });
                }
                else {
                    updateLine(emptyLine.id, { debit: Math.abs(difference) });
                }
            }
        }
    };
    const applyAiSuggestions = () => {
        const totalDebits = lines.reduce((sum, line) => sum + (line.debit || 0), 0);
        const totalCredits = lines.reduce((sum, line) => sum + (line.credit || 0), 0);
        const difference = totalDebits - totalCredits;
        if (Math.abs(difference) > 0.01) {
            const emptyLine = lines.find(line => !line.debit && !line.credit);
            if (emptyLine) {
                updateLine(emptyLine.id, {
                    accountId: '2100',
                    accountName: 'Accounts Payable',
                    credit: difference,
                    memo: 'Auto-balanced by AI suggestion'
                });
            }
        }
    };
    const postEntry = async () => {
        const validationErrors = validateEntry();
        if (validationErrors.length > 0) {
            setErrors(validationErrors);
            return;
        }
        // Clear previous errors
        setErrors([]);
        setPosting(true);
        try {
            // Filter and validate lines
            const validLines = lines.filter(line => {
                return line.accountId &&
                    line.accountId.trim() !== '' &&
                    ((line.debit && line.debit > 0) || (line.credit && line.credit > 0));
            });
            if (validLines.length < 2) {
                setErrors(['Please add at least 2 journal entry lines with valid accounts and amounts']);
                setPosting(false);
                return;
            }
            const payload = {
                date: format(date, 'yyyy-MM-dd'),
                memo,
                reference,
                companyId,
                lines: validLines.map(line => ({
                    accountId: line.accountId,
                    debit: line.debit || undefined,
                    credit: line.credit || undefined,
                    memo: line.memo || undefined
                }))
            };
            console.log('Posting journal entry:', payload);
            const result = await apiService.postJournalEntry(payload);
            console.log('Journal entry created successfully:', result);
            // Reload recent entries to show the new entry
            loadRecentEntries();
            // Trigger financial reports refresh if user is on accounting page
            window.dispatchEvent(new CustomEvent('journalEntryCreated', {
                detail: { entryId: result.id, companyId }
            }));
            // Success - redirect to journal list with success message
            navigate('/dashboard/journal/new?success=entry-created');
        }
        catch (e) {
            console.error('Error creating journal entry:', e);
            const errorMessage = e.message || e.error?.message || 'Failed to create journal entry. Please try again.';
            setErrors([errorMessage]);
        }
        finally {
            setPosting(false);
        }
    };
    const saveDraft = async () => {
        setPosting(true);
        try {
            // Save as draft logic here
            console.log('Saving draft...');
        }
        catch (e) {
            setErrors([e.message || 'Failed to save draft. Please try again.']);
        }
        finally {
            setPosting(false);
        }
    };
    const getTotalDebits = () => lines.reduce((sum, line) => sum + (line.debit || 0), 0);
    const getTotalCredits = () => lines.reduce((sum, line) => sum + (line.credit || 0), 0);
    const isBalanced = () => Math.abs(getTotalDebits() - getTotalCredits()) < 0.01;
    const getDifference = () => Math.abs(getTotalDebits() - getTotalCredits());
    return (_jsx(PageLayout, { children: _jsxs("div", { className: "space-y-6", children: [successMessage && (_jsx("div", { className: "bg-green-50 border border-green-200 rounded-lg p-4", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(CheckCircle, { className: "w-5 h-5 text-green-600" }), _jsx("span", { className: "font-semibold text-green-800", children: successMessage })] }) })), errors.length > 0 && (_jsxs("div", { className: "bg-red-50 border border-red-200 rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx(AlertTriangle, { className: "w-5 h-5 text-red-600" }), _jsx("h3", { className: "font-semibold text-red-800", children: "Please fix the following errors:" })] }), _jsx("ul", { className: "list-disc list-inside space-y-1", children: errors.map((error, index) => (_jsx("li", { className: "text-red-700 text-sm", children: error }, index))) })] })), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("div", { className: "flex items-center gap-4", children: _jsxs("div", { children: [_jsxs("h1", { className: "text-2xl font-semibold text-gray-900 flex items-center gap-2", children: [_jsx(Receipt, { className: "w-6 h-6" }), "Journal Entries"] }), _jsx("nav", { className: "text-sm text-gray-500 mt-1", children: "Accounting / Journal Entries / New Entry" })] }) }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsxs(Dialog, { open: showTemplates, onOpenChange: setShowTemplates, children: [_jsx(DialogTrigger, { asChild: true, children: _jsxs(Button, { variant: "outline", size: "sm", children: [_jsx(Clipboard, { className: "w-4 h-4 mr-2" }), "Templates"] }) }), _jsxs(DialogContent, { className: "max-w-4xl", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Journal Entry Templates" }), _jsx(DialogDescription, { children: "Choose a template to quickly create common journal entries" })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4", children: TEMPLATES.map((template) => (_jsx(Card, { className: "cursor-pointer hover:shadow-md transition-shadow", onClick: () => applyTemplate(template), children: _jsxs(CardHeader, { className: "pb-3", children: [_jsx(CardTitle, { className: "text-base", children: template.title }), _jsx(CardDescription, { className: "text-sm", children: template.description })] }) }, template.id))) })] })] }), _jsxs(Dialog, { children: [_jsx(DialogTrigger, { asChild: true, children: _jsxs(Button, { variant: "outline", size: "sm", children: [_jsx(History, { className: "w-4 h-4 mr-2" }), "Recent"] }) }), _jsxs(DialogContent, { className: "max-w-4xl", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Recent Journal Entries" }), _jsx(DialogDescription, { children: "View and copy from your recent journal entries" })] }), _jsx("div", { className: "mt-4 max-h-96 overflow-y-auto", children: recentEntriesLoading ? (_jsx("div", { className: "flex items-center justify-center py-8", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-4 h-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" }), "Loading recent entries..."] }) })) : recentEntries.length === 0 ? (_jsx("div", { className: "text-center py-8 text-gray-500", children: "No recent entries found" })) : (_jsx("div", { className: "space-y-3", children: recentEntries.map((entry) => (_jsx(Card, { className: "cursor-pointer hover:shadow-md transition-shadow", onClick: () => copyFromRecentEntry(entry), children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center justify-between gap-2", children: [_jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "font-medium truncate", title: entry.entryNumber, children: entry.entryNumber.length > 15 ? `${entry.entryNumber.substring(0, 15)}...` : entry.entryNumber }), _jsx(Badge, { variant: "outline", className: "text-xs flex-shrink-0", children: entry.status })] }), _jsx("p", { className: "text-sm text-gray-600 mt-1 truncate", children: entry.description }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: new Date(entry.date).toLocaleDateString() })] }), _jsxs("div", { className: "text-right flex-shrink-0", children: [_jsxs("span", { className: "font-semibold", children: ["$", (Number(entry.amount) || 0).toFixed(2)] }), _jsx("p", { className: "text-xs text-gray-500", children: "Click to copy" })] })] }) }) }, entry.id))) })) })] })] }), _jsxs(Button, { variant: "outline", size: "lg", onClick: saveDraft, disabled: posting, children: [_jsx(Save, { className: "w-4 h-4 mr-2" }), posting ? 'Saving...' : 'Save Draft'] }), _jsx(Button, { size: "lg", onClick: postEntry, disabled: posting || !isBalanced(), children: posting ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" }), "Posting..."] })) : (_jsxs(_Fragment, { children: [_jsx(CheckCircle2, { className: "w-4 h-4 mr-2" }), "Post Entry"] })) })] })] }), _jsx("div", { className: "space-y-6", children: _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-4 gap-6", children: [_jsxs("div", { className: "lg:col-span-3 space-y-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(FileText, { className: "w-5 h-5" }), "Entry Information"] }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "entryNumber", children: "Journal Entry Number" }), _jsx(Input, { id: "entryNumber", value: entryNumber, onChange: (e) => setEntryNumber(e.target.value), readOnly: true, className: "bg-gray-50" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "entryType", children: "Entry Type" }), _jsxs(Select, { value: entryType, onValueChange: setEntryType, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "GENERAL", children: "General Journal" }), _jsx(SelectItem, { value: "ADJUSTING", children: "Adjusting Entry" }), _jsx(SelectItem, { value: "CLOSING", children: "Closing Entry" }), _jsx(SelectItem, { value: "REVERSING", children: "Reversing Entry" })] })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "transactionDate", children: "Transaction Date" }), _jsxs(Popover, { children: [_jsx(PopoverTrigger, { asChild: true, children: _jsxs(Button, { variant: "outline", className: cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground"), children: [_jsx(CalendarDays, { className: "mr-2 h-4 w-4" }), date ? format(date, "MMM dd, yyyy") : "Pick a date"] }) }), _jsx(PopoverContent, { className: "w-auto p-0", align: "start", children: _jsx(Calendar, { mode: "single", selected: date, onSelect: (newDate) => newDate && setDate(newDate), initialFocus: true }) })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "postingDate", children: "Posting Date" }), _jsxs(Popover, { children: [_jsx(PopoverTrigger, { asChild: true, children: _jsxs(Button, { variant: "outline", className: cn("w-full justify-start text-left font-normal", !postingDate && "text-muted-foreground"), children: [_jsx(CalendarDays, { className: "mr-2 h-4 w-4" }), postingDate ? format(postingDate, "MMM dd, yyyy") : "Pick a date"] }) }), _jsx(PopoverContent, { className: "w-auto p-0", align: "start", children: _jsx(Calendar, { mode: "single", selected: postingDate, onSelect: (newDate) => newDate && setPostingDate(newDate), initialFocus: true }) })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "reference", children: "Reference Number" }), _jsx(Input, { id: "reference", placeholder: "External reference", value: reference, onChange: (e) => setReference(e.target.value) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Status" }), _jsxs(Badge, { variant: "outline", className: "bg-yellow-50 text-yellow-700 border-yellow-200", children: [_jsx(FileText, { className: "w-3 h-3 mr-1" }), "Draft"] })] })] }), _jsxs("div", { className: "mt-6 space-y-2", children: [_jsx(Label, { htmlFor: "description", children: "Description" }), _jsx(Input, { id: "description", placeholder: "Enter journal entry description", value: memo, onChange: (e) => setMemo(e.target.value) })] })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex justify-between items-center", children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(FileText, { className: "w-5 h-5" }), "Journal Entry Lines"] }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("div", { className: cn("flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium", isBalanced()
                                                                        ? "bg-green-50 text-green-700 border border-green-200"
                                                                        : "bg-red-50 text-red-700 border border-red-200"), children: [isBalanced() ? (_jsx(CheckCircle, { className: "w-4 h-4" })) : (_jsx(AlertTriangle, { className: "w-4 h-4" })), isBalanced() ? 'Balanced' : `Out of Balance: $${getDifference().toFixed(2)}`] }), _jsxs(Button, { size: "sm", onClick: autoBalance, children: [_jsx(Sparkles, { className: "w-4 h-4 mr-2" }), "Auto Balance"] })] })] }) }), _jsxs(CardContent, { className: "p-0", children: [_jsx("div", { className: "overflow-x-auto max-w-full", children: _jsxs("table", { className: "w-full min-w-[800px]", children: [_jsx("thead", { className: "bg-gray-50 border-b border-gray-200", children: _jsxs("tr", { children: [_jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12", children: "#" }), _jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[280px]", children: "Account" }), _jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]", children: "Description" }), _jsx("th", { className: "px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]", children: "Debit" }), _jsx("th", { className: "px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]", children: "Credit" }), _jsx("th", { className: "px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-32", children: "Actions" })] }) }), _jsx("tbody", { className: "bg-white divide-y divide-gray-200", children: lines.map((line, index) => (_jsxs("tr", { className: "hover:bg-gray-50", children: [_jsx("td", { className: "px-4 py-3 text-sm font-medium text-gray-500 text-center", children: index + 1 }), _jsx("td", { className: "px-4 py-3", children: _jsxs(Select, { value: line.accountId, onValueChange: (value) => {
                                                                                        const account = accounts.find(acc => acc.id === value);
                                                                                        updateLine(line.id, {
                                                                                            accountId: value,
                                                                                            accountName: account?.name,
                                                                                            accountType: typeof account?.type === 'string' ? account.type : account?.type?.name
                                                                                        });
                                                                                    }, children: [_jsx(SelectTrigger, { className: "w-full", children: _jsx(SelectValue, { placeholder: "Select Account" }) }), _jsx(SelectContent, { children: accountsLoading ? (_jsx(SelectItem, { value: "loading", disabled: true, children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-4 h-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" }), "Loading accounts..."] }) })) : accounts.length === 0 ? (_jsx(SelectItem, { value: "no-accounts", disabled: true, children: "No accounts available" })) : (accounts.map((account) => (_jsx(SelectItem, { value: account.id, children: _jsx("div", { className: "flex items-center justify-between w-full", children: _jsxs("div", { className: "flex flex-col", children: [_jsx("span", { children: account.name }), _jsxs("span", { className: "text-xs text-gray-500", children: [typeof account.type === 'string' ? account.type : account.type?.name, " - ", account.code] })] }) }) }, account.id)))) })] }) }), _jsx("td", { className: "px-4 py-3", children: _jsx(Input, { placeholder: "Line description", value: line.memo || '', onChange: (e) => updateLine(line.id, { memo: e.target.value }), className: "w-full" }) }), _jsx("td", { className: "px-4 py-3", children: _jsx(Input, { type: "number", step: "0.01", min: "0", placeholder: "0.00", value: line.debit || '', onChange: (e) => updateLine(line.id, {
                                                                                        debit: e.target.value ? Number(e.target.value) : 0,
                                                                                        credit: 0
                                                                                    }), className: "text-right font-mono" }) }), _jsx("td", { className: "px-4 py-3", children: _jsx(Input, { type: "number", step: "0.01", min: "0", placeholder: "0.00", value: line.credit || '', onChange: (e) => updateLine(line.id, {
                                                                                        credit: e.target.value ? Number(e.target.value) : 0,
                                                                                        debit: 0
                                                                                    }), className: "text-right font-mono" }) }), _jsx("td", { className: "px-4 py-3", children: _jsxs("div", { className: "flex items-center justify-center gap-1", children: [_jsx(Button, { variant: "ghost", size: "sm", onClick: () => duplicateLine(line.id), className: "h-8 w-8 p-0", children: _jsx(Copy, { className: "h-4 w-4" }) }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => removeLine(line.id), className: "h-8 w-8 p-0 text-red-600 hover:text-red-700", disabled: lines.length <= 2, children: _jsx(Trash2, { className: "h-4 w-4" }) })] }) })] }, line.id))) })] }) }), _jsx("div", { className: "p-4 border-t border-gray-200", children: _jsxs(Button, { variant: "outline", onClick: addLine, className: "w-full border-dashed border-2 border-gray-300 hover:border-primary-400 hover:bg-primary-50", children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), "Add New Line"] }) })] })] }), _jsx(Card, { children: _jsx(CardContent, { className: "pt-6", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex justify-between items-center py-3 border-b border-gray-200", children: [_jsx("span", { className: "text-sm text-gray-600", children: "Total Debits:" }), _jsxs("span", { className: "font-mono font-medium text-green-600", children: ["$", getTotalDebits().toFixed(2)] })] }), _jsxs("div", { className: "flex justify-between items-center py-3 border-b border-gray-200", children: [_jsx("span", { className: "text-sm text-gray-600", children: "Total Credits:" }), _jsxs("span", { className: "font-mono font-medium text-red-600", children: ["$", getTotalCredits().toFixed(2)] })] })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex justify-between items-center py-3 border-b border-gray-200", children: [_jsx("span", { className: "text-sm text-gray-600", children: "Difference:" }), _jsxs("span", { className: cn("font-mono font-medium", isBalanced() ? "text-green-600" : "text-red-600"), children: ["$", getDifference().toFixed(2)] })] }), _jsxs("div", { className: "flex justify-between items-center py-3", children: [_jsx("span", { className: "text-sm text-gray-600", children: "Status:" }), _jsx("span", { className: cn("font-medium", isBalanced() ? "text-green-600" : "text-red-600"), children: isBalanced() ? 'Balanced' : 'Unbalanced' })] })] })] }) }) })] }), _jsxs("div", { className: "space-y-6", children: [_jsxs(Card, { className: "bg-gradient-to-br from-purple-600 to-blue-600 text-white", children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2 text-white", children: [_jsx(Bot, { className: "w-5 h-5" }), "AI Assistant"] }) }), _jsxs(CardContent, { className: "space-y-3", children: [aiSuggestions.map((suggestion, index) => (_jsxs("div", { className: "bg-white/10 backdrop-blur-sm rounded-lg p-3", children: [_jsxs("div", { className: "text-sm font-medium mb-1", children: [_jsx("strong", { children: "Suggestion:" }), " ", suggestion] }), _jsxs("div", { className: "text-xs opacity-80", children: ["Confidence: ", 92 - index * 5, "%"] })] }, index))), _jsxs(Button, { size: "sm", className: "w-full bg-white/20 hover:bg-white/30 text-white border-white/30", onClick: applyAiSuggestions, children: [_jsx(Sparkles, { className: "w-4 h-4 mr-2" }), "Apply AI Suggestions"] })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Zap, { className: "w-5 h-5" }), "Quick Actions"] }) }), _jsxs(CardContent, { className: "space-y-2", children: [_jsxs(Button, { variant: "outline", size: "sm", className: "w-full justify-start", onClick: autoBalance, children: [_jsx(Scale, { className: "w-4 h-4 mr-2" }), "Auto-Balance Entry"] }), _jsxs(Button, { variant: "outline", size: "sm", className: "w-full justify-start", children: [_jsx(Copy, { className: "w-4 h-4 mr-2" }), "Duplicate Entry"] }), _jsxs(Button, { variant: "outline", size: "sm", className: "w-full justify-start", children: [_jsx(ArrowLeftRight, { className: "w-4 h-4 mr-2" }), "Reverse Entry"] }), _jsxs(Button, { variant: "outline", size: "sm", className: "w-full justify-start", children: [_jsx(Download, { className: "w-4 h-4 mr-2" }), "Export to PDF"] }), _jsxs(Button, { variant: "outline", size: "sm", className: "w-full justify-start", children: [_jsx(CheckCircle2, { className: "w-4 h-4 mr-2" }), "Validate Entry"] })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Clock, { className: "w-5 h-5" }), "Recent Entries"] }) }), _jsx(CardContent, { className: "space-y-3", children: recentEntriesLoading ? (_jsx("div", { className: "flex items-center justify-center py-4", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-4 h-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" }), "Loading..."] }) })) : recentEntries.length === 0 ? (_jsx("div", { className: "text-center py-4 text-gray-500", children: "No recent entries found" })) : (recentEntries.map((entry) => (_jsxs("div", { className: "p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-primary-300 hover:shadow-sm transition-all", onClick: () => copyFromRecentEntry(entry), children: [_jsxs("div", { className: "flex justify-between items-center mb-1 gap-2", children: [_jsx("span", { className: "font-medium text-gray-900 truncate flex-1 min-w-0", title: entry.entryNumber, children: entry.entryNumber.length > 12 ? `${entry.entryNumber.substring(0, 12)}...` : entry.entryNumber }), _jsxs("span", { className: "font-mono font-medium text-green-600 flex-shrink-0", children: ["$", (Number(entry.amount) || 0).toFixed(2)] })] }), _jsx("div", { className: "text-sm text-gray-600 mb-1", children: entry.description }), _jsx("div", { className: "text-xs text-gray-400", children: entry.date }), _jsx("div", { className: "text-xs text-blue-600 mt-1", children: "Click to copy" })] }, entry.id)))) })] })] })] }) })] }) }));
}
