import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { ScrollArea } from './ui/scroll-area';
import { toast } from 'sonner';
import { CalendarIcon, PlusIcon, EditIcon, TrashIcon, AlertTriangleIcon, CheckCircleIcon, XCircleIcon, RefreshCw, Brain, FileText, BarChart3, CheckIcon, BookOpen, Zap, Building2, Sparkles, Tag, ArrowLeftRight, Edit3, CheckCircle, AlertCircle, AlertTriangle, Calendar, Hash } from 'lucide-react';
import { apiService } from '../lib/api';
import { JournalHubIntegration } from './journal-hub-integration';
// Helper function to format currency
const formatCurrency = (amount) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(num || 0);
};
// Helper function to extract amount from description
const extractAmountFromDescription = (description) => {
    // Regex patterns to match various amount formats
    const patterns = [
        /\$\s*([0-9,]+\.?[0-9]*)/g, // $500, $1,200.50
        /([0-9,]+\.?[0-9]*)\s*dollars?/gi, // 500 dollars, 1200.50 dollar
        /([0-9,]+\.?[0-9]*)\s*usd/gi, // 500 USD, 1200.50 usd
        /amount[:\s]+\$?([0-9,]+\.?[0-9]*)/gi, // amount: $500, amount 500
        /paid\s+\$?([0-9,]+\.?[0-9]*)/gi, // paid $500, paid 500
        /received\s+\$?([0-9,]+\.?[0-9]*)/gi, // received $500
    ];
    for (const pattern of patterns) {
        const matches = Array.from(description.matchAll(pattern));
        if (matches.length > 0) {
            const amountStr = matches[0][1].replace(/,/g, ''); // Remove commas
            const amount = parseFloat(amountStr);
            if (!isNaN(amount) && amount > 0) {
                return amount;
            }
        }
    }
    return null;
};
// Helper function to auto-detect transaction type from description
const detectTransactionType = (description) => {
    const lowerDesc = description.toLowerCase();
    // Payment/Expense patterns
    if (/\b(paid|payment|pay|expense|spent|cost|bill|invoice)\b/.test(lowerDesc)) {
        if (/\b(rent|utilities|salary|wage|office|supplies|equipment|maintenance|insurance|legal|consulting|advertising|travel|fuel|repair)\b/.test(lowerDesc)) {
            return 'expense';
        }
        return 'payment';
    }
    // Receipt/Income patterns
    if (/\b(received|receipt|income|revenue|earned|collect|deposit|refund)\b/.test(lowerDesc)) {
        if (/\b(customer|client|service|consulting|sales|commission|interest|dividend)\b/.test(lowerDesc)) {
            return 'receipt';
        }
        return 'receipt';
    }
    // Purchase patterns
    if (/\b(purchase|bought|buy|acquired|order|procurement)\b/.test(lowerDesc)) {
        return 'purchase';
    }
    // Sale patterns
    if (/\b(sale|sold|sell|revenue|invoice|billing)\b/.test(lowerDesc)) {
        return 'sale';
    }
    // Default based on amount direction context
    if (/\b(from|received|income|revenue)\b/.test(lowerDesc)) {
        return 'receipt';
    }
    if (/\b(to|paid|expense|cost)\b/.test(lowerDesc)) {
        return 'expense';
    }
    return 'expense'; // Default fallback
};
// Helper function to validate transaction description
const isValidTransactionDescription = (description) => {
    if (!description || description.trim().length < 3)
        return false;
    // Check for meaningless patterns
    const meaninglessPatterns = [
        /^[a-z]+$/i, // Just letters like "nnn", "abc", "test"
        /^[0-9]+$/, // Just numbers like "123", "999"
        /^(.)\1{2,}$/, // Repeated characters like "aaa", "xxx"
        /^(test|abc|nnn|zzz|xxx)$/i, // Common meaningless test strings
    ];
    for (const pattern of meaninglessPatterns) {
        if (pattern.test(description.trim())) {
            return false;
        }
    }
    // Should contain at least one meaningful word
    const meaningfulWords = [
        'paid', 'received', 'purchase', 'sale', 'rent', 'salary', 'expense', 'income',
        'revenue', 'cost', 'fee', 'service', 'product', 'invoice', 'bill', 'payment',
        'cash', 'check', 'transfer', 'deposit', 'withdrawal', 'refund', 'discount'
    ];
    const lowerDesc = description.toLowerCase();
    return meaningfulWords.some(word => lowerDesc.includes(word));
};
export function EnhancedJournalManagement() {
    const [selectedCompany, setSelectedCompany] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('company_id') || localStorage.getItem('companyId') || localStorage.getItem('company') || '';
        }
        return '';
    });
    const [activeTab, setActiveTab] = useState('integration');
    const [journalEntries, setJournalEntries] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [ledgerBalances, setLedgerBalances] = useState([]);
    const [anomalies, setAnomalies] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [stats, setStats] = useState(null);
    // AI Creation Form
    const [aiForm, setAiForm] = useState({
        description: '',
        amount: '',
        category: '',
        vendor: '',
        customer: '',
        transactionType: ''
    });
    // Manual Entry Form
    const [manualForm, setManualForm] = useState({
        date: new Date().toISOString().split('T')[0],
        reference: '',
        description: '',
        entries: [{ accountId: '', debit: 0, credit: 0, description: '' }]
    });
    // Account Suggestions
    const [accountSuggestions, setAccountSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    useEffect(() => {
        loadData();
    }, [selectedCompany]);
    const createBasicAccountsIfNeeded = async () => {
        try {
            // Create account types first
            const accountTypes = [
                { code: 'ASSET', name: 'Asset' },
                { code: 'LIABILITY', name: 'Liability' },
                { code: 'REVENUE', name: 'Revenue' },
                { code: 'EXPENSE', name: 'Expense' },
                { code: 'EQUITY', name: 'Equity' }
            ];
            const typeMap = {};
            for (const type of accountTypes) {
                try {
                    const existingTypes = await apiService.get(`/api/account-types?companyId=${selectedCompany}`);
                    const existingType = existingTypes.find((t) => t.code === type.code);
                    if (existingType) {
                        typeMap[type.code] = existingType.id;
                    }
                    else {
                        const createdType = await apiService.post('/api/account-types', {
                            ...type,
                            companyId: selectedCompany
                        });
                        typeMap[type.code] = createdType.id;
                    }
                }
                catch (error) {
                    console.log(`Account type ${type.name} creation handled:`, error);
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
                    const existingAccounts = await apiService.get(`/api/accounts?companyId=${selectedCompany}`);
                    let accountsList = [];
                    if (existingAccounts?.flat) {
                        accountsList = existingAccounts.flat;
                    }
                    else if (existingAccounts?.data) {
                        accountsList = existingAccounts.data;
                    }
                    else if (Array.isArray(existingAccounts)) {
                        accountsList = existingAccounts;
                    }
                    const existingAccount = accountsList.find((a) => a.code === account.code);
                    if (!existingAccount && typeMap[account.typeCode]) {
                        await apiService.post('/api/accounts', {
                            name: account.name,
                            code: account.code,
                            typeId: typeMap[account.typeCode],
                            companyId: selectedCompany
                        });
                        console.log(`Created account: ${account.name}`);
                    }
                }
                catch (error) {
                    console.log(`Account ${account.name} creation handled:`, error);
                }
            }
        }
        catch (error) {
            console.log('Basic accounts creation handled:', error);
        }
    };
    const loadData = async () => {
        setIsLoading(true);
        console.log('🔄 Loading data for company:', selectedCompany);
        try {
            // First ensure basic accounts exist
            await createBasicAccountsIfNeeded();
            const [entriesData, accountsData, balancesData, anomaliesData, statsData] = await Promise.all([
                apiService.get(`/api/enhanced-journal-management/entries/${selectedCompany}`),
                apiService.get(`/api/accounts?companyId=${selectedCompany}`),
                apiService.get(`/api/enhanced-journal-management/ledger-balances/${selectedCompany}`),
                apiService.get(`/api/enhanced-journal-management/anomalies/${selectedCompany}`),
                apiService.get(`/api/enhanced-journal-management/stats/${selectedCompany}`)
            ]);
            // Process journal entries to match UI expectations
            // Handle both entriesData.data (wrapped) and entriesData directly (array)
            const rawEntries = Array.isArray(entriesData) ? entriesData : (entriesData?.data || []);
            const processedEntries = rawEntries.map((entry) => {
                const description = entry.memo || entry.description || '';
                const entries = entry.lines || entry.entries || [];
                const totalDebit = entry.lines?.reduce((sum, line) => sum + (parseFloat(String(line.debit)) || 0), 0) || 0;
                const totalCredit = entry.lines?.reduce((sum, line) => sum + (parseFloat(String(line.credit)) || 0), 0) || 0;
                const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;
                return {
                    ...entry,
                    description,
                    entries,
                    totalDebit,
                    totalCredit,
                    isBalanced
                };
            });
            setJournalEntries(processedEntries);
            // Handle different account response formats (similar to journal-new.tsx)
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
            setAccounts(accountsList || []);
            // Handle different balance response formats (similar to accounts)
            let balancesList = [];
            if (balancesData?.data) {
                balancesList = balancesData.data;
            }
            else if (Array.isArray(balancesData)) {
                balancesList = balancesData;
            }
            setLedgerBalances(balancesList || []);
            setAnomalies(anomaliesData.data || []);
            setStats(statsData.data);
            // Remove toast for data loading - only show for data creation
        }
        catch (error) {
            console.error('Error loading data:', error);
            // Only show toast for critical loading errors that prevent the user from working
        }
        finally {
            setIsLoading(false);
        }
    };
    const createAIJournalEntry = async () => {
        // Validate required fields
        if (!aiForm.description) {
            toast.error('Please enter a transaction description');
            return;
        }
        // Try to auto-extract amount if not provided
        let finalAmount = aiForm.amount;
        if (!finalAmount || finalAmount === '' || finalAmount === '0') {
            const extractedAmount = extractAmountFromDescription(aiForm.description);
            if (extractedAmount) {
                finalAmount = extractedAmount.toString();
                setAiForm(prev => ({ ...prev, amount: finalAmount }));
                toast.success(`Amount detected: $${extractedAmount.toLocaleString()}`, { duration: 2000 });
            }
            else {
                toast.error('Please specify the transaction amount (e.g., "Paid $500" or enter amount manually)');
                return;
            }
        }
        // Validate transaction description quality
        if (!isValidTransactionDescription(aiForm.description)) {
            toast.error('Please provide a meaningful transaction description (e.g., "Paid rent", "Received payment")');
            return;
        }
        // Validate amount
        const amount = parseFloat(finalAmount.toString());
        if (isNaN(amount) || amount <= 0) {
            toast.error('Please enter a valid positive amount');
            return;
        }
        if (amount > 1000000) {
            toast.error('Amount seems unusually high. Please verify.');
            return;
        }
        setIsLoading(true);
        toast.loading('Creating journal entry...', { id: 'ai-processing' });
        try {
            const result = await apiService.post('/api/enhanced-journal-management/create', {
                description: aiForm.description,
                amount: amount,
                companyId: selectedCompany,
                context: {
                    category: aiForm.category,
                    vendor: aiForm.vendor,
                    customer: aiForm.customer,
                    transactionType: aiForm.transactionType,
                    // 🧠 Senior AI metadata
                    autoExtractedAmount: extractAmountFromDescription(aiForm.description) !== null,
                    descriptionLength: aiForm.description.length,
                    processingLevel: 'senior',
                    validationPassed: true
                }
            });
            toast.dismiss('ai-processing');
            const entryData = result?.data;
            const entryReference = entryData?.reference || entryData?.id || `Entry-${Date.now()}`;
            const linesCount = entryData?.lines?.length || entryData?.entries?.length || 2;
            toast.success(`Journal Entry Created Successfully!`, { duration: 3000 });
            // Show account information in a user-friendly way
            if (entryData?.lines?.length > 0) {
                const totalDebit = entryData.lines.reduce((sum, line) => sum + (parseFloat(String(line.debit)) || 0), 0);
                const accountDetails = entryData.lines.map((line) => {
                    const accountName = line.account?.name || line.accountName || 'Account';
                    const debitAmount = parseFloat(String(line.debit)) || 0;
                    const creditAmount = parseFloat(String(line.credit)) || 0;
                    if (debitAmount > 0) {
                        return `${accountName} (Debit: $${debitAmount.toLocaleString()})`;
                    }
                    else if (creditAmount > 0) {
                        return `${accountName} (Credit: $${creditAmount.toLocaleString()})`;
                    }
                    return accountName;
                }).join(' • ');
                toast.success(`Entry #${entryReference.split('-').pop()} • ${accountDetails}`, { duration: 5000 });
            }
            setAiForm({
                description: '',
                amount: '',
                category: '',
                vendor: '',
                customer: '',
                transactionType: ''
            });
            setIsAutoDetected(false);
            setIsTransactionTypeAutoDetected(false);
            // Clear all suggestions after entry is created
            setAccountSuggestions([]);
            setShowSuggestions(false);
            setSelectedSuggestions([]);
            await loadData();
        }
        catch (error) {
            toast.dismiss('ai-processing');
            const errorMessage = error?.response?.data?.error || error?.response?.data?.message || error?.message || 'Unknown error occurred';
            if (errorMessage.includes('Account') && errorMessage.includes('does not exist')) {
                toast.error('Could not find suitable accounts. Please check your chart of accounts.');
            }
            else if (errorMessage.includes('validation failed')) {
                toast.error('Transaction validation failed. Please review your entry.');
            }
            else if (errorMessage.includes('timeout') || errorMessage.includes('unavailable')) {
                toast.error('Service temporarily unavailable. Please try again.');
            }
            else if (errorMessage.includes('meaningless') || errorMessage.includes('invalid')) {
                toast.error('Please provide a more detailed transaction description.');
            }
            else if (errorMessage.includes('Network Error') || errorMessage.includes('fetch')) {
                toast.error('Connection error. Please check your internet and try again.');
            }
            else {
                toast.error(`Failed to create entry: ${errorMessage}`);
            }
        }
        finally {
            setIsLoading(false);
        }
    };
    const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);
    const [isAutoDetected, setIsAutoDetected] = useState(false);
    const [isTransactionTypeAutoDetected, setIsTransactionTypeAutoDetected] = useState(false);
    const [selectedSuggestions, setSelectedSuggestions] = useState([]);
    // Toggle suggestion selection
    const toggleSuggestionSelection = (suggestionId) => {
        setSelectedSuggestions(prev => prev.includes(suggestionId)
            ? prev.filter(id => id !== suggestionId)
            : [...prev, suggestionId]);
    };
    // Create journal entry with selected suggestions
    const createJournalEntryWithSelectedSuggestions = async () => {
        if (selectedSuggestions.length === 0) {
            toast.error('Please select at least one account suggestion');
            return;
        }
        const selectedAccountSuggestions = accountSuggestions.filter(suggestion => selectedSuggestions.includes(suggestion.accountCode));
        setIsLoading(true);
        toast.loading('Creating entry with your selected accounts...', { id: 'selected-processing' });
        try {
            const result = await apiService.post('/api/enhanced-journal-management/create', {
                description: aiForm.description,
                amount: parseFloat(aiForm.amount.toString()),
                companyId: selectedCompany,
                context: {
                    category: aiForm.category,
                    vendor: aiForm.vendor,
                    customer: aiForm.customer,
                    transactionType: aiForm.transactionType,
                    processingLevel: 'user-guided',
                    selectedAccountSuggestions: selectedAccountSuggestions,
                    useSelectedSuggestions: true
                }
            });
            toast.dismiss('selected-processing');
            const entryData = result?.data;
            const entryReference = entryData?.reference || entryData?.id || `Entry-${Date.now()}`;
            toast.success(`✅ Entry Created with Your Selected Accounts!`, { duration: 3000 });
            // Show which accounts were actually saved to the database
            if (entryData?.lines?.length > 0) {
                const accountDetails = entryData.lines.map((line) => {
                    const accountName = line.account?.name || line.accountName || 'Account';
                    const debitAmount = parseFloat(String(line.debit)) || 0;
                    const creditAmount = parseFloat(String(line.credit)) || 0;
                    if (debitAmount > 0) {
                        return `${accountName} (Debit: $${debitAmount.toLocaleString()})`;
                    }
                    else if (creditAmount > 0) {
                        return `${accountName} (Credit: $${creditAmount.toLocaleString()})`;
                    }
                    return accountName;
                }).join(' • ');
                toast.success(`🎯 Saved: ${accountDetails}`, { duration: 6000 });
                // Also show user's original selections for comparison
                const selectedNames = selectedAccountSuggestions.map(s => s.accountName).join(', ');
                toast.info(`👤 You selected: ${selectedNames}`, { duration: 4000 });
            }
            // Reset form and selections
            setAiForm({
                description: '',
                amount: '',
                category: '',
                vendor: '',
                customer: '',
                transactionType: ''
            });
            setIsAutoDetected(false);
            setIsTransactionTypeAutoDetected(false);
            setSelectedSuggestions([]);
            setShowSuggestions(false);
            setAccountSuggestions([]);
            await loadData();
        }
        catch (error) {
            toast.dismiss('selected-processing');
            const errorMessage = error?.response?.data?.error || error?.message || 'Failed to create journal entry';
            toast.error(`Failed to create entry: ${errorMessage}`);
        }
        finally {
            setIsLoading(false);
        }
    };
    const getAccountSuggestions = async () => {
        if (!aiForm.description || !aiForm.amount) {
            toast.error('Please enter description and amount first');
            return;
        }
        setIsSuggestionsLoading(true);
        try {
            const result = await apiService.post('/api/enhanced-journal-management/account-suggestions', {
                description: aiForm.description,
                amount: parseFloat(aiForm.amount),
                companyId: selectedCompany, // Add companyId to the request
                context: {
                    category: aiForm.category,
                    vendor: aiForm.vendor,
                    customer: aiForm.customer,
                    transactionType: aiForm.transactionType
                }
            });
            // The apiService already extracts the data array, so result IS the suggestions array
            const suggestions = Array.isArray(result) ? result : (result?.data || []);
            setAccountSuggestions(suggestions);
            setShowSuggestions(true);
            if (suggestions.length > 0) {
                toast.success(`Found ${suggestions.length} account suggestions!`);
            }
            else {
                toast.error('No account suggestions found for this transaction');
            }
        }
        catch (error) {
            toast.error('Failed to get account suggestions. Please try again.');
        }
        finally {
            setIsSuggestionsLoading(false);
        }
    };
    const createManualJournalEntry = async () => {
        if (!manualForm.date || !manualForm.reference || !manualForm.description) {
            toast.error('Validation Error: Date, reference, and description are required');
            return;
        }
        // Validate that entries are balanced
        const totalDebit = manualForm.entries.reduce((sum, entry) => sum + (entry.debit || 0), 0);
        const totalCredit = manualForm.entries.reduce((sum, entry) => sum + (entry.credit || 0), 0);
        if (Math.abs(totalDebit - totalCredit) > 0.01) {
            toast.error(`Validation Error: Journal entries must be balanced. Debit: $${totalDebit.toFixed(2)}, Credit: $${totalCredit.toFixed(2)}`);
            return;
        }
        setIsLoading(true);
        try {
            const result = await apiService.post('/api/enhanced-journal-management/manual', {
                date: manualForm.date,
                reference: manualForm.reference,
                description: manualForm.description,
                companyId: selectedCompany, // Add companyId
                entries: manualForm.entries
            });
            toast.success(`✅ Manual journal entry created: ${manualForm.reference}`);
            setManualForm({
                date: new Date().toISOString().split('T')[0],
                reference: '',
                description: '',
                entries: [{ accountId: '', debit: 0, credit: 0, description: '' }]
            });
            loadData();
        }
        catch (error) {
            console.error('Error creating manual journal entry:', error);
            toast.error(`❌ Manual Entry Failed: ${error?.response?.data?.error || error?.message || 'Failed to create manual journal entry'}`);
        }
        finally {
            setIsLoading(false);
        }
    };
    const addJournalLine = () => {
        setManualForm(prev => ({
            ...prev,
            entries: [...prev.entries, { accountId: '', debit: 0, credit: 0, description: '' }]
        }));
    };
    const removeJournalLine = (index) => {
        if (manualForm.entries.length > 1) {
            setManualForm(prev => ({
                ...prev,
                entries: prev.entries.filter((_, i) => i !== index)
            }));
        }
    };
    // Function to get account balance from ledger balances
    const getAccountBalance = (accountId) => {
        const ledgerBalance = ledgerBalances.find(balance => balance.accountId === accountId);
        return ledgerBalance?.currentBalance || 0;
    };
    // Validation function for manual entry form
    const isManualFormValid = () => {
        // Check basic required fields
        if (!manualForm.date || !manualForm.reference || !manualForm.description) {
            return false;
        }
        // Check if we have at least 2 valid entries
        const validEntries = manualForm.entries.filter(entry => entry.accountId &&
            entry.accountId.trim() !== '' &&
            ((entry.debit && entry.debit > 0) || (entry.credit && entry.credit > 0)));
        if (validEntries.length < 2) {
            return false;
        }
        // Check if entries are balanced
        const totalDebit = manualForm.entries.reduce((sum, entry) => sum + (entry.debit || 0), 0);
        const totalCredit = manualForm.entries.reduce((sum, entry) => sum + (entry.credit || 0), 0);
        return Math.abs(totalDebit - totalCredit) < 0.01;
    };
    const updateJournalLine = (index, field, value) => {
        setManualForm(prev => ({
            ...prev,
            entries: prev.entries.map((entry, i) => i === index ? { ...entry, [field]: value } : entry)
        }));
    };
    const postJournalEntry = async (entryId) => {
        try {
            await apiService.post(`/api/enhanced-journal-management/post/${entryId}`, {
                postedBy: 'demo-user-id'
            });
            // Remove toast for posting - this is status change, not creation
            loadData();
        }
        catch (error) {
            console.error('Error posting journal entry:', error);
            // Remove toast for posting errors - this is status change, not creation
        }
    };
    const voidJournalEntry = async (entryId) => {
        const reason = prompt('Please provide a reason for voiding this entry:');
        if (!reason)
            return;
        try {
            await apiService.post(`/api/enhanced-journal-management/void/${entryId}`, {
                voidedBy: 'demo-user-id',
                reason
            });
            // Remove toast for voiding - this is status change, not creation
            loadData();
        }
        catch (error) {
            console.error('Error voiding journal entry:', error);
            // Remove toast for voiding errors - this is status change, not creation
        }
    };
    const getStatusBadge = (status) => {
        switch (status) {
            case 'draft':
                return _jsx(Badge, { variant: "secondary", children: "Draft" });
            case 'POSTED':
                return _jsx(Badge, { variant: "default", children: "Posted" });
            case 'VOIDED':
                return _jsx(Badge, { variant: "destructive", children: "Voided" });
            default:
                return _jsx(Badge, { variant: "outline", children: status });
        }
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4", children: [_jsxs("div", { className: "space-y-1", children: [_jsx("h1", { className: "text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent", children: "Enhanced Journal Management" }), _jsx("p", { className: "text-muted-foreground text-lg", children: "AI-powered journal entry creation and advanced ledger management" }), _jsxs("div", { className: "flex items-center gap-4 mt-2", children: [_jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground", children: [_jsx("div", { className: "w-2 h-2 bg-green-500 rounded-full animate-pulse" }), _jsx("span", { children: "AI Assistant Active" })] }), _jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground", children: [_jsx("div", { className: "w-2 h-2 bg-blue-500 rounded-full" }), _jsx("span", { children: "Real-time Sync" })] })] })] }), _jsxs("div", { className: "flex items-center space-x-3", children: [_jsxs(Select, { value: selectedCompany, onValueChange: setSelectedCompany, children: [_jsx(SelectTrigger, { className: "w-48 bg-white shadow-sm", children: _jsx(SelectValue, { placeholder: "Select Company" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "seed-company-1", children: "Uruti Hub Limited" }), _jsx(SelectItem, { value: "seed-company-2", children: "Acme Trading Co" })] })] }), _jsxs(Button, { variant: "outline", size: "sm", onClick: loadData, disabled: isLoading, children: [_jsx(RefreshCw, { className: `w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}` }), "Refresh"] })] })] }), stats && (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", children: [_jsxs(Card, { className: "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-200", children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium text-blue-700", children: "Total Entries" }), _jsx(CalendarIcon, { className: "h-5 w-5 text-blue-600" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-3xl font-bold text-blue-900", children: stats.entries.total }), _jsxs("p", { className: "text-xs text-blue-600 mt-1", children: [stats.entries.draft, " draft, ", stats.entries.posted, " posted"] })] })] }), _jsxs(Card, { className: "bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-all duration-200", children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium text-green-700", children: "Total Debits" }), _jsx(CheckCircleIcon, { className: "h-5 w-5 text-green-600" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-3xl font-bold text-green-900", children: formatCurrency(stats.amounts.totalDebit) }), _jsx("p", { className: "text-xs text-green-600 mt-1", children: "All debit transactions" })] })] }), _jsxs(Card, { className: "bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-all duration-200", children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium text-purple-700", children: "Total Credits" }), _jsx(XCircleIcon, { className: "h-5 w-5 text-purple-600" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-3xl font-bold text-purple-900", children: formatCurrency(stats.amounts.totalCredit) }), _jsx("p", { className: "text-xs text-purple-600 mt-1", children: "All credit transactions" })] })] }), _jsxs(Card, { className: "bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 hover:shadow-lg transition-all duration-200", children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium text-amber-700", children: "Anomalies" }), _jsx(AlertTriangleIcon, { className: "h-5 w-5 text-amber-600" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-3xl font-bold text-amber-900", children: anomalies.length }), _jsxs("p", { className: "text-xs text-amber-600 mt-1", children: [anomalies.filter(a => a.severity === 'critical').length, " critical"] })] })] })] })), _jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, className: "space-y-6", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-2 lg:grid-cols-5 bg-gray-100 p-1 rounded-lg", children: [_jsxs(TabsTrigger, { value: "integration", className: "data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center justify-center gap-2", children: [_jsx(BookOpen, { className: "w-4 h-4" }), _jsx("span", { children: "Journal Hub" })] }), _jsxs(TabsTrigger, { value: "ai-create", className: "data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center justify-center gap-2", children: [_jsx(Brain, { className: "w-4 h-4" }), _jsx("span", { children: "AI Creation" })] }), _jsxs(TabsTrigger, { value: "manual", className: "data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center justify-center gap-2", children: [_jsx(EditIcon, { className: "w-4 h-4" }), _jsx("span", { children: "Manual Entry" })] }), _jsxs(TabsTrigger, { value: "entries", className: "data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center justify-center gap-2", children: [_jsx(FileText, { className: "w-4 h-4" }), _jsx("span", { children: "Journal Entries" })] }), _jsxs(TabsTrigger, { value: "ledger", className: "data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center justify-center gap-2", children: [_jsx(BarChart3, { className: "w-4 h-4" }), _jsx("span", { children: "Ledger" })] })] }), _jsx(TabsContent, { value: "integration", className: "space-y-6", children: _jsx(JournalHubIntegration, { companyId: selectedCompany, showQuickActions: true, showRecentEntries: true, showSummary: true }) }), _jsx(TabsContent, { value: "ai-create", className: "space-y-8", children: _jsxs(Card, { className: "relative overflow-hidden border-2 border-blue-200 bg-gradient-to-br from-blue-50 via-white to-purple-50", children: [_jsx("div", { className: "absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-100 to-transparent rounded-full -translate-y-16 translate-x-16" }), _jsxs(CardHeader, { className: "pb-6 relative", children: [_jsxs("div", { className: "flex items-start justify-between", children: [_jsx("div", { className: "space-y-2", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-md", children: _jsx(Brain, { className: "w-6 h-6 text-white" }) }), _jsxs("div", { children: [_jsx(CardTitle, { className: "text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent", children: "AI-Powered Journal Creation" }), _jsx("p", { className: "text-muted-foreground text-base", children: "Describe your transaction in plain English and let AI handle the accounting" })] })] }) }), _jsxs(Badge, { variant: "outline", className: "bg-blue-50 text-blue-700 border-blue-200 px-3 py-1", children: [_jsx(Zap, { className: "w-3 h-3 mr-1" }), "Smart Mode"] })] }), _jsxs("div", { className: "flex flex-wrap gap-2 mt-4", children: [_jsx("div", { className: "px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium", children: "\u2728 Auto-detect amounts" }), _jsx("div", { className: "px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium", children: "\uD83E\uDDE0 Smart account suggestions" }), _jsx("div", { className: "px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium", children: "\u2696\uFE0F Auto-balance entries" })] })] }), _jsx(CardContent, { className: "space-y-8 relative", children: _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-8", children: [_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "p-1.5 bg-blue-100 rounded-md", children: _jsx(FileText, { className: "w-4 h-4 text-blue-600" }) }), _jsx(Label, { htmlFor: "description", className: "text-sm font-semibold text-gray-800", children: "Transaction Description" })] }), _jsx("div", { className: "relative", children: _jsx(Textarea, { id: "description", placeholder: "\uD83D\uDCA1 Try: 'Paid $500 rent to ABC Properties', 'Received $2000 from customer XYZ', 'Bought office supplies for $150'", value: aiForm.description, onChange: (e) => {
                                                                const newDescription = e.target.value;
                                                                setAiForm(prev => ({ ...prev, description: newDescription }));
                                                                // Clear suggestions when description changes significantly
                                                                if (showSuggestions && Math.abs(newDescription.length - aiForm.description.length) > 5) {
                                                                    setAccountSuggestions([]);
                                                                    setShowSuggestions(false);
                                                                    setSelectedSuggestions([]);
                                                                    toast.info('Suggestions cleared - transaction changed', { duration: 2000 });
                                                                }
                                                                // Auto-extract amount from description
                                                                const extractedAmount = extractAmountFromDescription(newDescription);
                                                                const currentExtractedFromOld = extractAmountFromDescription(aiForm.description);
                                                                if (extractedAmount) {
                                                                    // Auto-fill if: 1) amount field is empty, 2) current amount matches old extraction, or 3) user hasn't manually edited
                                                                    const currentAmount = parseFloat(aiForm.amount || '0');
                                                                    const shouldUpdate = !aiForm.amount || aiForm.amount === '0' || aiForm.amount === '' ||
                                                                        (currentExtractedFromOld && currentExtractedFromOld === currentAmount) ||
                                                                        isAutoDetected;
                                                                    if (shouldUpdate && extractedAmount.toString() !== aiForm.amount) {
                                                                        setAiForm(prev => ({ ...prev, amount: extractedAmount.toString() }));
                                                                        setIsAutoDetected(true);
                                                                    }
                                                                }
                                                                else if (currentExtractedFromOld && !extractedAmount) {
                                                                    // If we had an extracted amount before but not anymore, clear if it was auto-detected
                                                                    if (isAutoDetected) {
                                                                        setAiForm(prev => ({ ...prev, amount: '' }));
                                                                        setIsAutoDetected(false);
                                                                    }
                                                                }
                                                                // 🧠 Senior AI: Auto-detect transaction type from description
                                                                const detectedType = detectTransactionType(newDescription);
                                                                if (detectedType && (isTransactionTypeAutoDetected || !aiForm.transactionType)) {
                                                                    if (detectedType !== aiForm.transactionType) {
                                                                        setAiForm(prev => ({ ...prev, transactionType: detectedType }));
                                                                        setIsTransactionTypeAutoDetected(true);
                                                                    }
                                                                }
                                                            }, className: "min-h-[100px] resize-none border-gray-300 focus:border-blue-500 focus:ring-blue-500" }) }), _jsxs("div", { className: "space-y-3", children: [_jsxs(Label, { htmlFor: "amount", className: "text-sm font-medium text-gray-700", children: ["Amount ", _jsx("span", { className: "text-xs text-gray-400", children: "(optional if included in description)" })] }), _jsxs("div", { className: "relative", children: [_jsx("span", { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500", children: "$" }), _jsx(Input, { id: "amount", type: "number", step: "0.01", placeholder: "0.00", value: aiForm.amount, onChange: (e) => {
                                                                            const newAmount = e.target.value;
                                                                            setAiForm(prev => ({ ...prev, amount: newAmount }));
                                                                            // If user manually edits amount, disable auto-detection
                                                                            const extractedAmount = extractAmountFromDescription(aiForm.description);
                                                                            if (extractedAmount && parseFloat(newAmount) !== extractedAmount) {
                                                                                setIsAutoDetected(false);
                                                                            }
                                                                            // Clear suggestions if amount changes significantly (suggestions are amount-specific)
                                                                            const oldAmount = parseFloat(aiForm.amount || '0');
                                                                            const currentAmount = parseFloat(newAmount || '0');
                                                                            if (showSuggestions && oldAmount > 0 && Math.abs(currentAmount - oldAmount) > (oldAmount * 0.1)) {
                                                                                setAccountSuggestions([]);
                                                                                setShowSuggestions(false);
                                                                                setSelectedSuggestions([]);
                                                                                toast.info('Suggestions cleared - amount changed', { duration: 2000 });
                                                                            }
                                                                        }, className: `pl-10 pr-20 py-3 border-gray-200 focus:border-emerald-400 focus:ring-emerald-400/20 rounded-xl bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200 text-gray-800 font-medium ${isAutoDetected && aiForm.amount && extractAmountFromDescription(aiForm.description) &&
                                                                            extractAmountFromDescription(aiForm.description)?.toString() === aiForm.amount
                                                                            ? 'bg-green-50/80 border-green-300 ring-green-200/50'
                                                                            : ''}` }), _jsx("div", { className: "absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2", children: isAutoDetected && aiForm.amount && extractAmountFromDescription(aiForm.description) &&
                                                                            extractAmountFromDescription(aiForm.description)?.toString() === aiForm.amount ? (_jsx("div", { className: "flex items-center gap-2", children: _jsxs("div", { className: "px-2 py-1 bg-green-100 rounded-md flex items-center gap-1", children: [_jsx(Sparkles, { className: "w-3 h-3 text-green-600" }), _jsx("span", { className: "text-xs font-medium text-green-700", children: "Auto" })] }) })) : (_jsx("div", { className: "px-2 py-1 bg-emerald-50 rounded-md", children: _jsx("span", { className: "text-xs font-medium text-emerald-700", children: "USD" }) })) })] }), _jsxs("div", { className: "flex items-center gap-2 mt-2", children: [_jsx("div", { className: "w-2 h-2 bg-blue-400 rounded-full" }), _jsx("span", { className: "text-xs text-gray-600", children: "Leave empty for AI auto-detection from description" })] })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [_jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "p-1 bg-orange-100 rounded-md", children: _jsx(Tag, { className: "w-3 h-3 text-orange-600" }) }), _jsx(Label, { htmlFor: "category", className: "text-sm font-medium text-gray-700", children: "Category" })] }), _jsx(Input, { id: "category", placeholder: "e.g., Office Supplies", value: aiForm.category, onChange: (e) => setAiForm(prev => ({ ...prev, category: e.target.value })), className: "border-gray-200 focus:border-orange-400 focus:ring-orange-400/20 rounded-lg" })] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "p-1 bg-purple-100 rounded-md", children: _jsx(Building2, { className: "w-3 h-3 text-purple-600" }) }), _jsx(Label, { htmlFor: "vendor", className: "text-sm font-medium text-gray-700", children: "Vendor/Payee" })] }), _jsx(Input, { id: "vendor", placeholder: "e.g., ABC Company", value: aiForm.vendor, onChange: (e) => setAiForm(prev => ({ ...prev, vendor: e.target.value })), className: "border-gray-200 focus:border-purple-400 focus:ring-purple-400/20 rounded-lg" })] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "p-1 bg-indigo-100 rounded-md", children: _jsx(ArrowLeftRight, { className: "w-3 h-3 text-indigo-600" }) }), _jsx(Label, { htmlFor: "transactionType", className: "text-sm font-medium text-gray-700", children: "Transaction Type" }), isTransactionTypeAutoDetected && (_jsxs("div", { className: "px-2 py-1 bg-green-100 rounded-md flex items-center gap-1", children: [_jsx(Sparkles, { className: "w-3 h-3 text-green-600" }), _jsx("span", { className: "text-xs font-medium text-green-700", children: "Auto" })] }))] }), _jsxs(Select, { value: aiForm.transactionType, onValueChange: (value) => {
                                                                    setAiForm(prev => ({ ...prev, transactionType: value }));
                                                                    // If user manually selects, disable auto-detection
                                                                    if (value !== detectTransactionType(aiForm.description)) {
                                                                        setIsTransactionTypeAutoDetected(false);
                                                                    }
                                                                }, children: [_jsx(SelectTrigger, { className: `border-gray-200 focus:border-indigo-400 focus:ring-indigo-400/20 rounded-lg ${isTransactionTypeAutoDetected ? 'bg-green-50/50 border-green-300 ring-green-200/50' : ''}`, children: _jsx(SelectValue, { placeholder: "Select type" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "expense", children: "\uD83D\uDCB0 Expense (Company spends money)" }), _jsx(SelectItem, { value: "receipt", children: "\uD83D\uDCB5 Receipt (Company receives money)" }), _jsx(SelectItem, { value: "purchase", children: "\uD83D\uDED2 Purchase (Buy assets/inventory)" }), _jsx(SelectItem, { value: "payment", children: "\uD83D\uDCB3 Payment (Pay bills/vendors)" }), _jsx(SelectItem, { value: "sale", children: "\uD83C\uDFF7\uFE0F Sale (Revenue from customers)" })] })] })] })] }), showSuggestions && accountSuggestions.length > 0 && (_jsxs(Card, { className: "border-green-200 bg-gradient-to-br from-green-50 to-white mt-4", children: [_jsxs(CardHeader, { className: "pb-4", children: [_jsxs(CardTitle, { className: "flex items-center gap-2 text-lg", children: [_jsx(Brain, { className: "w-5 h-5 text-green-600" }), "\uD83D\uDCA1 Smart Account Suggestions - Choose Your Accounts"] }), _jsxs("div", { className: "flex items-center space-x-4 mt-2", children: [_jsxs("div", { className: "text-sm text-green-600", children: ["Selected: ", selectedSuggestions.length, " of ", accountSuggestions.length, " suggestions"] }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => setSelectedSuggestions(accountSuggestions.map(s => s.accountCode)), className: "text-xs", children: "Select All" }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => setSelectedSuggestions([]), className: "text-xs", children: "Clear All" })] })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "space-y-4", children: accountSuggestions.map((suggestion, index) => {
                                                                    const isSelected = selectedSuggestions.includes(suggestion.accountCode);
                                                                    return (_jsxs("div", { className: `flex items-start justify-between p-4 border rounded-lg cursor-pointer transition-all ${isSelected
                                                                            ? 'border-blue-300 bg-blue-50 shadow-md'
                                                                            : 'border-green-200 bg-white hover:shadow-md'}`, onClick: () => toggleSuggestionSelection(suggestion.accountCode), children: [_jsxs("div", { className: "flex items-start space-x-3 flex-1", children: [_jsx("input", { type: "checkbox", checked: isSelected, onChange: () => toggleSuggestionSelection(suggestion.accountCode), className: "mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" }), _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "font-medium text-gray-900 mb-1 flex items-center", children: [suggestion.accountName, isSelected && _jsx("span", { className: "ml-2 text-blue-600", children: "\u2713 Selected" })] }), _jsxs("div", { className: "text-sm text-gray-600 mb-2", children: ["Code: ", _jsx("span", { className: "font-mono bg-gray-100 px-2 py-1 rounded", children: suggestion.accountCode }), " | Confidence: ", _jsxs("span", { className: "font-semibold text-green-600", children: [(suggestion.confidence * 100).toFixed(1), "%"] })] }), _jsx("div", { className: "text-sm text-gray-700 bg-gray-50 p-2 rounded border-l-4 border-green-400", children: suggestion.reasoning })] })] }), _jsx(Badge, { variant: "outline", className: "ml-4 bg-green-50 text-green-700 border-green-200", children: suggestion.suggestedCategory })] }, index));
                                                                }) }), _jsx("div", { className: "mt-6 pt-4 border-t border-green-200", children: _jsxs("div", { className: "flex gap-3 flex-wrap", children: [_jsx(Button, { onClick: createJournalEntryWithSelectedSuggestions, disabled: selectedSuggestions.length === 0 || isLoading, className: "bg-green-600 hover:bg-green-700 text-white", children: isLoading ? (_jsxs(_Fragment, { children: [_jsx(RefreshCw, { className: "w-4 h-4 mr-2 animate-spin" }), "Creating with Selected Accounts..."] })) : (_jsxs(_Fragment, { children: [_jsx(CheckIcon, { className: "w-4 h-4 mr-2" }), "Create Entry with Selected Accounts (", selectedSuggestions.length, ")"] })) }), _jsxs(Button, { onClick: createAIJournalEntry, disabled: isLoading, variant: "outline", className: "border-blue-300 text-blue-700 hover:bg-blue-50", children: [_jsx(Brain, { className: "w-4 h-4 mr-2" }), "Let System Choose All Accounts"] }), _jsxs(Button, { onClick: () => {
                                                                                setAccountSuggestions([]);
                                                                                setShowSuggestions(false);
                                                                                setSelectedSuggestions([]);
                                                                                toast.success('Suggestions cleared', { duration: 2000 });
                                                                            }, variant: "outline", size: "sm", className: "border-gray-300 text-gray-600 hover:bg-gray-50", children: [_jsx(XCircleIcon, { className: "w-4 h-4 mr-2" }), "Clear Suggestions"] })] }) })] })] })), _jsx("div", { className: "mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md", children: _jsx("p", { className: "text-xs text-blue-700 mt-1", children: showSuggestions && accountSuggestions.length > 0
                                                        ? "Choose specific accounts from suggestions OR let the system select automatically"
                                                        : "Get smart account suggestions first to review options, or create entry directly for automatic selection" }) }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200", children: [_jsx(Button, { onClick: getAccountSuggestions, disabled: isSuggestionsLoading, variant: "outline", className: "flex-1 sm:flex-none bg-white hover:bg-gray-50 border-gray-300 text-gray-700 hover:text-gray-900", children: isSuggestionsLoading ? (_jsxs(_Fragment, { children: [_jsx(RefreshCw, { className: "w-4 h-4 mr-2 animate-spin" }), "Getting Suggestions..."] })) : (_jsxs(_Fragment, { children: [_jsx(Brain, { className: "w-4 h-4 mr-2" }), "Get Smart Suggestions"] })) }), _jsx(Button, { onClick: createAIJournalEntry, disabled: isLoading, className: "flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700", children: isLoading ? (_jsxs(_Fragment, { children: [_jsx(RefreshCw, { className: "w-4 h-4 mr-2 animate-spin" }), "Creating..."] })) : (_jsxs(_Fragment, { children: [_jsx(PlusIcon, { className: "w-4 h-4 mr-2" }), "Create Journal Entry"] })) })] })] }) })] }) }), _jsx(TabsContent, { value: "manual", className: "space-y-8", children: _jsxs(Card, { className: "relative overflow-hidden border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-blue-50", children: [_jsx("div", { className: "absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-indigo-100 to-transparent rounded-full -translate-y-16 translate-x-16" }), _jsxs(CardHeader, { className: "pb-6 relative", children: [_jsxs("div", { className: "flex items-start justify-between", children: [_jsx("div", { className: "space-y-2", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "p-2 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-xl shadow-md", children: _jsx(Edit3, { className: "w-6 h-6 text-white" }) }), _jsxs("div", { children: [_jsx(CardTitle, { className: "text-2xl bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent", children: "Manual Journal Entry" }), _jsx("p", { className: "text-muted-foreground text-base", children: "Create precise double-entry bookkeeping transactions with full control" })] })] }) }), _jsx("div", { className: "flex items-center gap-2", children: isLoading ? (_jsxs(Badge, { variant: "outline", className: "bg-blue-50 text-blue-700 border-blue-200 px-3 py-1", children: [_jsx(RefreshCw, { className: "w-3 h-3 mr-1 animate-spin" }), "Loading accounts"] })) : accounts.length > 0 ? (_jsxs(Badge, { variant: "outline", className: "bg-green-50 text-green-700 border-green-200 px-3 py-1", children: [_jsx(CheckCircle, { className: "w-3 h-3 mr-1" }), accounts.length, " accounts ready"] })) : (_jsxs(Badge, { variant: "outline", className: "bg-red-50 text-red-700 border-red-200 px-3 py-1", children: [_jsx(AlertCircle, { className: "w-3 h-3 mr-1" }), "No accounts found"] })) })] }), !isLoading && accounts.length === 0 && (_jsx("div", { className: "mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(AlertTriangle, { className: "w-4 h-4 text-yellow-600" }), _jsx("span", { className: "text-sm text-yellow-700", children: "No chart of accounts found. Please reload or contact support." })] }), _jsxs(Button, { onClick: loadData, size: "sm", variant: "outline", className: "text-yellow-700 border-yellow-300 hover:bg-yellow-100", children: [_jsx(RefreshCw, { className: "w-4 h-4 mr-2" }), "Reload Accounts"] })] }) }))] }), _jsxs(CardContent, { className: "space-y-8 relative", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [_jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "p-1 bg-blue-100 rounded-md", children: _jsx(Calendar, { className: "w-3 h-3 text-blue-600" }) }), _jsx(Label, { htmlFor: "manual-date", className: "text-sm font-medium text-gray-700", children: "Transaction Date" })] }), _jsx(Input, { id: "manual-date", type: "date", value: manualForm.date, onChange: (e) => setManualForm(prev => ({ ...prev, date: e.target.value })), className: "border-gray-200 focus:border-blue-400 focus:ring-blue-400/20 rounded-lg" })] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "p-1 bg-purple-100 rounded-md", children: _jsx(Hash, { className: "w-3 h-3 text-purple-600" }) }), _jsx(Label, { htmlFor: "manual-reference", className: "text-sm font-medium text-gray-700", children: "Reference Number" })] }), _jsx(Input, { id: "manual-reference", placeholder: "e.g., JE-001, INV-2024-001", value: manualForm.reference, onChange: (e) => setManualForm(prev => ({ ...prev, reference: e.target.value })), className: "border-gray-200 focus:border-purple-400 focus:ring-purple-400/20 rounded-lg" })] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "p-1 bg-green-100 rounded-md", children: _jsx(FileText, { className: "w-3 h-3 text-green-600" }) }), _jsx(Label, { htmlFor: "manual-description", className: "text-sm font-medium text-gray-700", children: "Entry Description" })] }), _jsx(Input, { id: "manual-description", placeholder: "e.g., Office equipment purchase, Monthly rent payment", value: manualForm.description, onChange: (e) => setManualForm(prev => ({ ...prev, description: e.target.value })), className: "border-gray-200 focus:border-green-400 focus:ring-green-400/20 rounded-lg" })] })] }), _jsx("div", { className: "w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-8" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx(Label, { children: "Journal Lines" }), _jsxs(Button, { onClick: addJournalLine, size: "sm", children: [_jsx(PlusIcon, { className: "h-4 w-4 mr-2" }), "Add Line"] })] }), manualForm.entries.map((entry, index) => (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-5 gap-4 items-end", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Account" }), _jsxs(Select, { value: entry.accountId, onValueChange: (value) => updateJournalLine(index, 'accountId', value), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select account" }) }), _jsx(SelectContent, { children: isLoading ? (_jsx(SelectItem, { value: "loading", disabled: true, children: "Loading accounts..." })) : accounts.length === 0 ? (_jsx(SelectItem, { value: "no-accounts", disabled: true, children: "No accounts available" })) : (accounts.map((account) => (_jsxs(SelectItem, { value: account.id, children: [account.code, " - ", account.name] }, account.id)))) })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Debit" }), _jsx(Input, { type: "number", step: "0.01", value: entry.debit, onChange: (e) => updateJournalLine(index, 'debit', parseFloat(e.target.value) || 0) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Credit" }), _jsx(Input, { type: "number", step: "0.01", value: entry.credit, onChange: (e) => updateJournalLine(index, 'credit', parseFloat(e.target.value) || 0) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Description" }), _jsx(Input, { value: entry.description, onChange: (e) => updateJournalLine(index, 'description', e.target.value) })] }), _jsx(Button, { onClick: () => removeJournalLine(index), variant: "outline", size: "sm", disabled: manualForm.entries.length === 1, children: _jsx(TrashIcon, { className: "h-4 w-4" }) })] }, index))), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "text-sm text-gray-600", children: [!isManualFormValid() && (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(AlertTriangleIcon, { className: "w-4 h-4 text-amber-500" }), _jsx("span", { children: !manualForm.date || !manualForm.reference || !manualForm.description
                                                                                ? 'Fill in required fields'
                                                                                : manualForm.entries.filter(e => e.accountId && ((e.debit && e.debit > 0) || (e.credit && e.credit > 0))).length < 2
                                                                                    ? 'Add at least 2 valid entries'
                                                                                    : 'Balance your entries' })] })), isManualFormValid() && (_jsxs("div", { className: "flex items-center gap-2 text-green-600", children: [_jsx(CheckCircleIcon, { className: "w-4 h-4" }), _jsx("span", { children: "Ready to create entry" })] }))] }), _jsx(Button, { onClick: createManualJournalEntry, disabled: isLoading || !isManualFormValid(), className: !isManualFormValid() && !isLoading ? 'opacity-50 cursor-not-allowed' : '', children: isLoading ? 'Creating...' : 'Create Manual Entry' })] })] })] })] }) }), _jsx(TabsContent, { value: "entries", className: "space-y-4", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Journal Entries" }) }), _jsx(CardContent, { children: _jsx(ScrollArea, { className: "h-96", children: _jsx("div", { className: "space-y-4", children: isLoading ? (_jsxs("div", { className: "flex items-center justify-center p-8", children: [_jsx(RefreshCw, { className: "w-6 h-6 animate-spin mr-2" }), _jsx("span", { children: "Loading journal entries..." })] })) : journalEntries.length === 0 ? (_jsxs("div", { className: "text-center p-8 text-muted-foreground", children: [_jsx(FileText, { className: "w-12 h-12 mx-auto mb-4 opacity-50" }), _jsx("p", { children: "No journal entries found" }), _jsx("p", { className: "text-sm", children: "Create your first entry using the AI Creation or Manual Entry tabs" })] })) : (journalEntries.map((entry) => (_jsx(Card, { children: _jsxs(CardContent, { className: "p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [getStatusBadge(entry.status), _jsx("span", { className: "font-medium", children: entry.reference })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsxs("span", { className: "text-xs text-gray-500", children: ["Status: ", entry.status] }), entry.status?.toLowerCase() === 'draft' && (_jsx(Button, { onClick: () => postJournalEntry(entry.id), size: "sm", className: "bg-blue-600 hover:bg-blue-700 text-white", children: "Post" })), entry.status?.toLowerCase() === 'posted' && (_jsx(Button, { onClick: () => voidJournalEntry(entry.id), size: "sm", variant: "outline", children: "Void" }))] })] }), _jsx("p", { className: "text-sm text-muted-foreground mb-2", children: entry.description }), _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-2 text-sm", children: [_jsxs("div", { children: ["Debit: ", formatCurrency(entry.totalDebit)] }), _jsxs("div", { children: ["Credit: ", formatCurrency(entry.totalCredit)] }), _jsxs("div", { children: ["Balance: ", entry.isBalanced ? '✓' : '✗'] })] }), entry.entries && entry.entries.length > 0 && (_jsxs("div", { className: "mt-3 bg-gray-50 p-3 rounded-md", children: [_jsx("div", { className: "text-sm font-medium mb-2 text-gray-700", children: "\uD83D\uDCCA Accounts Used:" }), _jsx("div", { className: "space-y-2", children: entry.entries.map((line, index) => {
                                                                        const accountName = line.account?.name || line.accountName || `Account ${line.accountId}`;
                                                                        const debitAmount = parseFloat(String(line.debit)) || 0;
                                                                        const creditAmount = parseFloat(String(line.credit)) || 0;
                                                                        return (_jsxs("div", { className: "text-sm flex justify-between items-center", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [debitAmount > 0 && _jsx("span", { className: "text-red-600 font-medium", children: "Dr." }), creditAmount > 0 && _jsx("span", { className: "text-green-600 font-medium", children: "Cr." }), _jsx("span", { className: "font-medium", children: accountName })] }), _jsxs("div", { className: "text-right", children: [debitAmount > 0 && (_jsx("span", { className: "text-red-600 font-medium", children: formatCurrency(debitAmount) })), creditAmount > 0 && (_jsx("span", { className: "text-green-600 font-medium", children: formatCurrency(creditAmount) }))] })] }, index));
                                                                    }) }), _jsx("div", { className: "mt-2 pt-2 border-t border-gray-200 text-xs text-gray-500", children: "\uD83D\uDCA1 Dr. = Debit (money going out/assets increasing) | Cr. = Credit (money coming in/liabilities increasing)" })] }))] }) }, entry.id)))) }) }) })] }) }), _jsxs(TabsContent, { value: "ledger", className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center justify-between", children: ["Chart of Accounts", _jsxs(Badge, { variant: "outline", className: "text-xs", children: [accounts.length, " accounts"] })] }) }), _jsx(CardContent, { children: _jsx(ScrollArea, { className: "h-96", children: _jsx("div", { className: "space-y-2", children: accounts.length === 0 ? (_jsxs("div", { className: "text-center py-8 text-gray-500", children: [_jsx("div", { className: "text-sm", children: "No accounts found" }), _jsx("div", { className: "text-xs mt-1", children: "Accounts will be created automatically when needed" })] })) : (accounts.map((account) => (_jsxs("div", { className: "flex items-center justify-between p-2 border rounded", children: [_jsxs("div", { children: [_jsx("div", { className: "font-medium", children: account.name }), _jsxs("div", { className: "text-sm text-muted-foreground", children: ["Code: ", account.code, " | Type: ", typeof account.type === 'string' ? account.type : (account.type?.name || 'Unknown')] })] }), _jsxs("div", { className: "text-right", children: [_jsx("div", { className: "font-medium", children: formatCurrency(getAccountBalance(account.id)) }), _jsx(Badge, { variant: account.isActive ? 'default' : 'secondary', children: account.isActive ? 'Active' : 'Inactive' })] })] }, account.id)))) }) }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center justify-between", children: ["Ledger Balances", _jsxs(Badge, { variant: "outline", className: "text-xs", children: [ledgerBalances.length, " balances"] })] }) }), _jsx(CardContent, { children: _jsx(ScrollArea, { className: "h-96", children: _jsx("div", { className: "space-y-2", children: ledgerBalances.length === 0 ? (_jsxs("div", { className: "text-center py-8 text-gray-500", children: [_jsx("div", { className: "text-sm", children: "No ledger balances found" }), _jsx("div", { className: "text-xs mt-1", children: "Balances will be calculated from journal entries" })] })) : (ledgerBalances.map((balance) => (_jsxs("div", { className: "flex items-center justify-between p-2 border rounded", children: [_jsxs("div", { children: [_jsx("div", { className: "font-medium", children: balance.accountName || 'Unknown Account' }), _jsxs("div", { className: "text-sm text-muted-foreground", children: ["Code: ", balance.accountCode || 'N/A'] })] }), _jsxs("div", { className: "text-right", children: [_jsx("div", { className: "font-medium", children: formatCurrency(balance.currentBalance || 0) }), _jsxs("div", { className: "text-xs text-muted-foreground", children: ["D: ", formatCurrency(balance.periodDebit || 0), " C: ", formatCurrency(balance.periodCredit || 0)] })] })] }, balance.accountId)))) }) }) })] })] }), anomalies.length > 0 && (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Detected Anomalies" }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-2", children: anomalies.map((anomaly, index) => (_jsxs("div", { className: "flex items-center justify-between p-2 border rounded", children: [_jsxs("div", { children: [_jsx("div", { className: "font-medium", children: anomaly.description }), _jsxs("div", { className: "text-sm text-muted-foreground", children: ["Type: ", anomaly.type] })] }), _jsx(Badge, { variant: anomaly.severity === 'critical' ? 'destructive' : 'secondary', children: anomaly.severity })] }, index))) }) })] }))] })] })] }));
}
