import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
;
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useToast } from '../hooks/use-toast';
import { apiService } from '../lib/api';
import { MessageSquare, FileText, CheckCircle, AlertTriangle, Lightbulb, Upload, BarChart3, Play, Save, RefreshCw } from 'lucide-react';
export function ConversationalParser({ companyId }) {
    const [inputText, setInputText] = useState('');
    const [parsedResult, setParsedResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [examples, setExamples] = useState([]);
    const [batchTexts, setBatchTexts] = useState(['']);
    const [batchResults, setBatchResults] = useState([]);
    const [activeTab, setActiveTab] = useState('single');
    const [autoCreate, setAutoCreate] = useState(false);
    const [validationResult, setValidationResult] = useState(null);
    const [journalEntryCreated, setJournalEntryCreated] = useState(false);
    const { toast } = useToast();
    useEffect(() => {
        loadExamples();
    }, []);
    const loadExamples = async () => {
        try {
            const response = await apiService.request('/parser/examples');
            setExamples(response.data);
        }
        catch (error) {
            console.error('Failed to load examples:', error);
        }
    };
    const parseTransaction = async () => {
        if (!inputText.trim()) {
            toast({
                title: 'Error',
                description: 'Please enter a transaction description',
                variant: 'destructive',
            });
            return;
        }
        setLoading(true);
        try {
            const response = await apiService.request('/parser/parse', { method: 'POST', body: JSON.stringify({
                    text: inputText,
                    companyId: companyId || undefined // Allow undefined companyId
                }) });
            setParsedResult(response.data);
            // Show info about which company was used
            if (response.usedCompanyId && response.usedCompanyId !== companyId) {
                toast({
                    title: 'Info',
                    description: `Parsed using ${response.companyName || 'default company'}`,
                });
            }
        }
        catch (error) {
            console.error('Failed to parse transaction:', error);
            // Provide more specific error messages
            let errorMessage = 'Failed to parse transaction';
            if (error.message?.includes('company_not_found')) {
                errorMessage = 'Company not found. Using default company instead.';
            }
            else if (error.message?.includes('no_company_available')) {
                errorMessage = 'No company available. Please create a company first.';
            }
            toast({
                title: 'Error',
                description: errorMessage,
                variant: 'destructive',
            });
        }
        finally {
            setLoading(false);
        }
    };
    const createJournalEntry = async () => {
        if (!parsedResult)
            return;
        setLoading(true);
        try {
            const response = await apiService.request('/parser/create-entry', { method: 'POST', body: JSON.stringify({
                    text: inputText,
                    companyId: companyId || undefined, // Allow undefined companyId
                    autoCreate: true
                }) });
            if (response.data.autoCreated) {
                // Success - Journal entry created automatically
                const journalEntry = response.data.journalEntry;
                const transaction = response.data.transaction;
                toast({
                    title: '✅ Journal Entry Created Successfully!',
                    description: `Journal entry #${journalEntry?.id?.slice(-8) || 'N/A'} created for ${transaction?.amount || parsedResult.parsedTransaction.amount} ${transaction?.currency || parsedResult.parsedTransaction.currency} transaction in ${response.data.companyName || 'default company'}`,
                    duration: 5000,
                });
                // Mark as created and clear after delay
                setJournalEntryCreated(true);
                setTimeout(() => {
                    setInputText('');
                    setParsedResult(null);
                    setJournalEntryCreated(false);
                }, 2000);
            }
            else {
                // Partial success - Requires manual review
                toast({
                    title: '⚠️ Manual Review Required',
                    description: `Journal entry created but requires manual review due to low confidence (${parsedResult.confidence}%). Please check the entries before posting.`,
                    duration: 4000,
                });
            }
        }
        catch (error) {
            console.error('Failed to create journal entry:', error);
            // Provide more specific error messages
            let errorMessage = 'Failed to create journal entry';
            let errorTitle = '❌ Journal Entry Creation Failed';
            if (error.message?.includes('company_not_found')) {
                errorMessage = 'Company not found. Using default company instead.';
                errorTitle = '⚠️ Company Issue';
            }
            else if (error.message?.includes('no_company_available')) {
                errorMessage = 'No company available. Please create a company first.';
                errorTitle = '⚠️ No Company Found';
            }
            else if (error.message?.includes('validation')) {
                errorMessage = 'Transaction validation failed. Please check your input and try again.';
                errorTitle = '❌ Validation Error';
            }
            else if (error.message?.includes('network') || error.message?.includes('fetch')) {
                errorMessage = 'Network error. Please check your connection and try again.';
                errorTitle = '🌐 Network Error';
            }
            else if (error.message?.includes('timeout')) {
                errorMessage = 'Request timed out. Please try again.';
                errorTitle = '⏰ Timeout Error';
            }
            toast({
                title: errorTitle,
                description: errorMessage,
                variant: 'destructive',
                duration: 6000,
            });
        }
        finally {
            setLoading(false);
        }
    };
    const validateText = async () => {
        if (!inputText.trim())
            return;
        try {
            const response = await apiService.request('/parser/validate', { method: 'POST', body: JSON.stringify({
                    text: inputText
                }) });
            setValidationResult(response.data);
        }
        catch (error) {
            console.error('Failed to validate text:', error);
        }
    };
    const batchParse = async () => {
        const validTexts = batchTexts.filter(text => text.trim());
        if (validTexts.length === 0) {
            toast({
                title: 'Error',
                description: 'Please enter at least one transaction',
                variant: 'destructive',
            });
            return;
        }
        setLoading(true);
        try {
            const response = await apiService.request('/parser/batch-parse', { method: 'POST', body: JSON.stringify({
                    texts: validTexts,
                    companyId
                }) });
            setBatchResults(response.data);
            toast({
                title: 'Success',
                description: `Parsed ${validTexts.length} transactions`,
            });
        }
        catch (error) {
            console.error('Failed to batch parse:', error);
            toast({
                title: 'Error',
                description: 'Failed to parse transactions',
                variant: 'destructive',
            });
        }
        finally {
            setLoading(false);
        }
    };
    const addBatchText = () => {
        setBatchTexts([...batchTexts, '']);
    };
    const updateBatchText = (index, value) => {
        const newTexts = [...batchTexts];
        newTexts[index] = value;
        setBatchTexts(newTexts);
    };
    const removeBatchText = (index) => {
        const newTexts = batchTexts.filter((_, i) => i !== index);
        setBatchTexts(newTexts);
    };
    const getConfidenceColor = (confidence) => {
        if (confidence >= 90)
            return 'bg-green-100 text-green-800';
        if (confidence >= 70)
            return 'bg-yellow-100 text-yellow-800';
        return 'bg-red-100 text-red-800';
    };
    const getTransactionTypeColor = (type) => {
        switch (type) {
            case 'expense': return 'bg-red-100 text-red-800';
            case 'income': return 'bg-green-100 text-green-800';
            case 'transfer': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold", children: "Conversational Transaction Parser" }), _jsx("p", { className: "text-gray-600", children: "Convert natural language into structured accounting entries" })] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { variant: "outline", onClick: () => setInputText(''), disabled: loading, children: [_jsx(RefreshCw, { className: "w-4 h-4 mr-2" }), "Clear"] }), _jsxs(Button, { onClick: loadExamples, disabled: loading, children: [_jsx(Lightbulb, { className: "w-4 h-4 mr-2" }), "Examples"] })] })] }), _jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, children: [_jsxs(TabsList, { className: "grid w-full grid-cols-4", children: [_jsx(TabsTrigger, { value: "single", children: "Single Transaction" }), _jsx(TabsTrigger, { value: "batch", children: "Batch Processing" }), _jsx(TabsTrigger, { value: "examples", children: "Examples" }), _jsx(TabsTrigger, { value: "validation", children: "Validation" })] }), _jsxs(TabsContent, { value: "single", className: "space-y-4", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(MessageSquare, { className: "w-5 h-5 text-cyan-600" }), "Natural Language Transaction"] }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "transaction-text", children: "Describe your transaction" }), _jsx(Textarea, { id: "transaction-text", value: inputText, onChange: (e) => setInputText(e.target.value), placeholder: "e.g., I paid electricity bill 30,000 RWF", rows: 3, className: "mt-1" })] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { onClick: parseTransaction, disabled: loading || !inputText.trim(), children: [_jsx(Play, { className: "w-4 h-4 mr-2" }), loading ? 'Parsing...' : 'Parse Transaction'] }), _jsxs(Button, { variant: "outline", onClick: validateText, disabled: loading || !inputText.trim(), children: [_jsx(CheckCircle, { className: "w-4 h-4 mr-2" }), "Validate"] })] }), validationResult && (_jsx(Alert, { children: _jsx(AlertDescription, { children: _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("span", { children: ["Word count: ", validationResult.wordCount] }), _jsxs("span", { children: ["Has amount: ", validationResult.hasAmount ? '✓' : '✗'] }), _jsxs("span", { children: ["Has currency: ", validationResult.hasCurrency ? '✓' : '✗'] }), _jsxs("span", { children: ["Has action: ", validationResult.hasAction ? '✓' : '✗'] })] }), validationResult.suggestions.length > 0 && (_jsxs("div", { children: [_jsx("strong", { children: "Suggestions:" }), _jsx("ul", { className: "list-disc list-inside mt-1", children: validationResult.suggestions.map((suggestion, index) => (_jsx("li", { className: "text-sm", children: suggestion }, index))) })] }))] }) }) }))] })] }), parsedResult && (_jsxs(Card, { className: journalEntryCreated ? "border-green-500 bg-green-50/30" : "", children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(FileText, { className: "w-5 h-5 text-cyan-600" }), "Parsed Result", journalEntryCreated && (_jsxs("div", { className: "flex items-center gap-1 ml-auto", children: [_jsx(CheckCircle, { className: "w-4 h-4 text-green-600" }), _jsx("span", { className: "text-sm text-green-600 font-medium", children: "Journal Entry Created!" })] }))] }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { children: "Original Text" }), _jsx("p", { className: "text-sm text-gray-600 mt-1", children: parsedResult.originalText })] }), _jsxs("div", { children: [_jsx(Label, { children: "Confidence" }), _jsxs(Badge, { className: `mt-1 ${getConfidenceColor(parsedResult.confidence)}`, children: [parsedResult.confidence, "%"] })] }), _jsxs("div", { children: [_jsx(Label, { children: "Transaction Type" }), _jsx(Badge, { className: `mt-1 ${getTransactionTypeColor(parsedResult.parsedTransaction.transactionType)}`, children: parsedResult.parsedTransaction.transactionType })] }), _jsxs("div", { children: [_jsx(Label, { children: "Category" }), _jsx("p", { className: "text-sm text-gray-600 mt-1", children: parsedResult.parsedTransaction.category })] }), _jsxs("div", { children: [_jsx(Label, { children: "Amount" }), _jsxs("p", { className: "text-lg font-semibold mt-1", children: [parsedResult.parsedTransaction.amount.toLocaleString(), " ", parsedResult.parsedTransaction.currency] })] }), _jsxs("div", { children: [_jsx(Label, { children: "Date" }), _jsx("p", { className: "text-sm text-gray-600 mt-1", children: new Date(parsedResult.parsedTransaction.date).toLocaleDateString() })] })] }), _jsx(Separator, {}), _jsxs("div", { children: [_jsx(Label, { children: "Journal Entries" }), _jsx("div", { className: "mt-2 space-y-2", children: parsedResult.parsedTransaction.journalEntries.map((entry, index) => (_jsxs("div", { className: "border rounded-lg p-3 bg-gray-50", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "font-medium", children: entry.accountName }), _jsxs("div", { className: "flex gap-4", children: [_jsxs("span", { className: "text-red-600", children: ["Debit: ", entry.debit.toLocaleString()] }), _jsxs("span", { className: "text-green-600", children: ["Credit: ", entry.credit.toLocaleString()] })] })] }), _jsx("p", { className: "text-sm text-gray-600 mt-1", children: entry.description })] }, index))) })] }), parsedResult.validationErrors.length > 0 && (_jsxs(Alert, { variant: "destructive", children: [_jsx(AlertTriangle, { className: "w-4 h-4" }), _jsxs(AlertDescription, { children: [_jsx("strong", { children: "Validation Errors:" }), _jsx("ul", { className: "list-disc list-inside mt-1", children: parsedResult.validationErrors.map((error, index) => (_jsx("li", { children: error }, index))) })] })] })), parsedResult.suggestions.length > 0 && (_jsxs(Alert, { children: [_jsx(Lightbulb, { className: "w-4 h-4" }), _jsxs(AlertDescription, { children: [_jsx("strong", { children: "Suggestions:" }), _jsx("ul", { className: "list-disc list-inside mt-1", children: parsedResult.suggestions.map((suggestion, index) => (_jsx("li", { children: suggestion }, index))) })] })] })), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { onClick: createJournalEntry, disabled: loading || parsedResult.validationErrors.length > 0 || journalEntryCreated, className: loading || journalEntryCreated ? "opacity-75 cursor-not-allowed" : "", variant: journalEntryCreated ? "secondary" : "default", children: loading ? (_jsxs(_Fragment, { children: [_jsx(RefreshCw, { className: "w-4 h-4 mr-2 animate-spin" }), "Creating Journal Entry..."] })) : journalEntryCreated ? (_jsxs(_Fragment, { children: [_jsx(CheckCircle, { className: "w-4 h-4 mr-2 text-green-600" }), "Journal Entry Created!"] })) : (_jsxs(_Fragment, { children: [_jsx(Save, { className: "w-4 h-4 mr-2" }), "Create Journal Entry"] })) }), parsedResult.validationErrors.length > 0 && !journalEntryCreated && (_jsxs("div", { className: "flex items-center text-red-600 text-sm", children: [_jsx(AlertTriangle, { className: "w-4 h-4 mr-1" }), "Fix validation errors before creating entry"] })), journalEntryCreated && (_jsxs("div", { className: "flex items-center text-green-600 text-sm", children: [_jsx(CheckCircle, { className: "w-4 h-4 mr-1" }), "Successfully saved to database"] }))] })] })] }))] }), _jsxs(TabsContent, { value: "batch", className: "space-y-4", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Upload, { className: "w-5 h-5 text-cyan-600" }), "Batch Transaction Processing"] }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsx("div", { className: "space-y-3", children: batchTexts.map((text, index) => (_jsxs("div", { className: "flex gap-2", children: [_jsx(Textarea, { value: text, onChange: (e) => updateBatchText(index, e.target.value), placeholder: `Transaction ${index + 1} (e.g., Paid rent 200,000 RWF)`, rows: 2, className: "flex-1" }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => removeBatchText(index), disabled: batchTexts.length === 1, children: "Remove" })] }, index))) }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { onClick: addBatchText, variant: "outline", children: "Add Transaction" }), _jsxs(Button, { onClick: batchParse, disabled: loading || batchTexts.every(text => !text.trim()), children: [_jsx(Play, { className: "w-4 h-4 mr-2" }), loading ? 'Processing...' : 'Process Batch'] })] })] })] }), batchResults.length > 0 && (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(BarChart3, { className: "w-5 h-5 text-cyan-600" }), "Batch Results (", batchResults.length, " transactions)"] }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-3", children: batchResults.map((result, index) => (_jsx("div", { className: "border rounded-lg p-3", children: _jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "font-medium", children: result.originalText }), _jsxs("div", { className: "flex gap-2 mt-1", children: [_jsx(Badge, { className: getTransactionTypeColor(result.parsedTransaction.transactionType), children: result.parsedTransaction.transactionType }), _jsxs(Badge, { className: getConfidenceColor(result.confidence), children: [result.confidence, "%"] }), _jsxs("span", { className: "text-sm text-gray-600", children: [result.parsedTransaction.amount.toLocaleString(), " ", result.parsedTransaction.currency] })] })] }), result.validationErrors.length > 0 && (_jsx(AlertTriangle, { className: "w-4 h-4 text-red-500" }))] }) }, index))) }) })] }))] }), _jsx(TabsContent, { value: "examples", className: "space-y-4", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Lightbulb, { className: "w-5 h-5 text-cyan-600" }), "Transaction Examples"] }) }), _jsx(CardContent, { children: _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: examples.map((category) => (_jsxs("div", { className: "space-y-3", children: [_jsx("h3", { className: "font-semibold text-lg", children: category.category }), _jsx("div", { className: "space-y-2", children: category.examples.map((example, index) => (_jsx("div", { className: "p-3 border rounded-lg hover:border-cyan-300 cursor-pointer transition-colors", onClick: () => setInputText(example), children: _jsx("p", { className: "text-sm", children: example }) }, index))) })] }, category.category))) }) })] }) }), _jsx(TabsContent, { value: "validation", className: "space-y-4", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(CheckCircle, { className: "w-5 h-5 text-cyan-600" }), "Text Validation"] }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { children: "Test your transaction description" }), _jsx(Textarea, { value: inputText, onChange: (e) => setInputText(e.target.value), placeholder: "Enter a transaction description to validate...", rows: 3, className: "mt-1" })] }), _jsxs(Button, { onClick: validateText, disabled: !inputText.trim(), children: [_jsx(CheckCircle, { className: "w-4 h-4 mr-2" }), "Validate Text"] }), validationResult && (_jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [_jsxs("div", { className: "text-center p-3 border rounded-lg", children: [_jsx("div", { className: "text-2xl font-bold", children: validationResult.wordCount }), _jsx("div", { className: "text-sm text-gray-600", children: "Words" })] }), _jsxs("div", { className: "text-center p-3 border rounded-lg", children: [_jsx("div", { className: "text-2xl font-bold", children: validationResult.hasAmount ? '✓' : '✗' }), _jsx("div", { className: "text-sm text-gray-600", children: "Has Amount" })] }), _jsxs("div", { className: "text-center p-3 border rounded-lg", children: [_jsx("div", { className: "text-2xl font-bold", children: validationResult.hasCurrency ? '✓' : '✗' }), _jsx("div", { className: "text-sm text-gray-600", children: "Has Currency" })] }), _jsxs("div", { className: "text-center p-3 border rounded-lg", children: [_jsx("div", { className: "text-2xl font-bold", children: validationResult.hasAction ? '✓' : '✗' }), _jsx("div", { className: "text-sm text-gray-600", children: "Has Action" })] })] }), validationResult.suggestions.length > 0 && (_jsxs(Alert, { children: [_jsx(Lightbulb, { className: "w-4 h-4" }), _jsxs(AlertDescription, { children: [_jsx("strong", { children: "Improvement Suggestions:" }), _jsx("ul", { className: "list-disc list-inside mt-1", children: validationResult.suggestions.map((suggestion, index) => (_jsx("li", { children: suggestion }, index))) })] })] }))] }))] })] }) })] })] }));
}
