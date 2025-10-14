import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Brain, Upload, FileText, DollarSign, Sparkles, Loader2, RefreshCw, } from "lucide-react";
import { useToast } from "../hooks/use-toast";
export function AITransactionCategorization() {
    const [transactions, setTransactions] = useState([]);
    const [categorizations, setCategorizations] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState("");
    const [confidenceThreshold, setConfidenceThreshold] = useState(70);
    const [showLowConfidence, setShowLowConfidence] = useState(true);
    const { toast } = useToast();
    // Sample transaction data
    const sampleTransactions = [
        {
            id: "1",
            description: "Payment to Airtel 45,000 RWF",
            amount: 45000,
            transactionType: "expense",
            date: "2025-01-15"
        },
        {
            id: "2",
            description: "Office supplies from Stationery Plus",
            amount: 25000,
            transactionType: "expense",
            date: "2025-01-16"
        },
        {
            id: "3",
            description: "Fuel payment at Total station",
            amount: 35000,
            transactionType: "expense",
            date: "2025-01-17"
        },
        {
            id: "4",
            description: "Consulting fee from ABC Corp",
            amount: 150000,
            transactionType: "income",
            date: "2025-01-18"
        },
        {
            id: "5",
            description: "Software subscription - Microsoft 365",
            amount: 12000,
            transactionType: "expense",
            date: "2025-01-19"
        }
    ];
    useEffect(() => {
        // Load sample data
        setTransactions(sampleTransactions);
    }, []);
    const categorizeTransactions = async () => {
        if (!selectedCompany) {
            toast({
                title: "Company Required",
                description: "Please select a company first",
                variant: "destructive"
            });
            return;
        }
        setIsProcessing(true);
        try {
            const response = await fetch('/api/ai/categorize/batch', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-tenant-id': 'tenant_demo',
                    'x-company-id': selectedCompany
                },
                body: JSON.stringify({
                    companyId: selectedCompany,
                    transactions: transactions.map(t => ({
                        id: t.id,
                        description: t.description,
                        amount: t.amount,
                        transactionType: t.transactionType
                    }))
                })
            });
            if (!response.ok) {
                throw new Error('Failed to categorize transactions');
            }
            const result = await response.json();
            setCategorizations(result.categorizations);
            // Update transactions with categories
            setTransactions(prev => prev.map(t => {
                const cat = result.categorizations.find((c) => c.transactionId === t.id);
                return cat ? { ...t, category: cat.suggestedCategory, confidence: cat.confidence, reasoning: cat.reasoning } : t;
            }));
            toast({
                title: "Categorization Complete",
                description: `Successfully categorized ${result.processed} transactions`,
            });
        }
        catch (error) {
            console.error('Categorization error:', error);
            toast({
                title: "Categorization Failed",
                description: "Failed to categorize transactions. Please try again.",
                variant: "destructive"
            });
        }
        finally {
            setIsProcessing(false);
        }
    };
    const categorizeSingleTransaction = async (transaction) => {
        if (!selectedCompany) {
            toast({
                title: "Company Required",
                description: "Please select a company first",
                variant: "destructive"
            });
            return;
        }
        try {
            const response = await fetch('/api/ai/categorize/transaction', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-tenant-id': 'tenant_demo',
                    'x-company-id': selectedCompany
                },
                body: JSON.stringify({
                    companyId: selectedCompany,
                    description: transaction.description,
                    amount: transaction.amount,
                    transactionType: transaction.transactionType
                })
            });
            if (!response.ok) {
                throw new Error('Failed to categorize transaction');
            }
            const result = await response.json();
            // Update the specific transaction
            setTransactions(prev => prev.map(t => t.id === transaction.id
                ? { ...t, category: result.categorization.suggestedCategory, confidence: result.categorization.confidence, reasoning: result.categorization.reasoning }
                : t));
            toast({
                title: "Transaction Categorized",
                description: `Categorized as: ${result.categorization.suggestedCategory}`,
            });
        }
        catch (error) {
            console.error('Single categorization error:', error);
            toast({
                title: "Categorization Failed",
                description: "Failed to categorize transaction. Please try again.",
                variant: "destructive"
            });
        }
    };
    const handleFileUpload = (event) => {
        const file = event.target.files?.[0];
        if (!file)
            return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const csvData = e.target?.result;
                const lines = csvData.split('\n');
                const headers = lines[0].split(',');
                const newTransactions = lines.slice(1).map((line, index) => {
                    const values = line.split(',');
                    return {
                        id: `uploaded-${index}`,
                        description: values[0] || '',
                        amount: parseFloat(values[1]) || 0,
                        transactionType: values[2] || 'expense',
                        date: values[3] || new Date().toISOString().split('T')[0]
                    };
                }).filter(t => t.description && t.amount > 0);
                setTransactions(prev => [...prev, ...newTransactions]);
                toast({
                    title: "File Uploaded",
                    description: `Imported ${newTransactions.length} transactions`,
                });
            }
            catch (error) {
                toast({
                    title: "Upload Failed",
                    description: "Failed to parse CSV file. Please check the format.",
                    variant: "destructive"
                });
            }
        };
        reader.readAsText(file);
    };
    const filteredTransactions = transactions.filter(t => {
        if (!showLowConfidence && t.confidence && t.confidence < confidenceThreshold) {
            return false;
        }
        return true;
    });
    const getConfidenceColor = (confidence) => {
        if (confidence >= 90)
            return "text-green-600";
        if (confidence >= 70)
            return "text-yellow-600";
        return "text-red-600";
    };
    const getConfidenceBadge = (confidence) => {
        if (confidence >= 90)
            return _jsx(Badge, { className: "bg-green-100 text-green-700", children: "High" });
        if (confidence >= 70)
            return _jsx(Badge, { className: "bg-yellow-100 text-yellow-700", children: "Medium" });
        return _jsx(Badge, { className: "bg-red-100 text-red-700", children: "Low" });
    };
    return (_jsxs(Card, { className: "bg-card border-border", children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center justify-between text-foreground", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Brain, { className: "w-5 h-5 text-cyan-600" }), "AI Transaction Categorization", _jsxs(Badge, { variant: "secondary", className: "bg-cyan-100 text-cyan-700", children: [_jsx(Sparkles, { className: "w-3 h-3 mr-1" }), "Smart"] })] }), _jsx("div", { className: "flex items-center gap-2", children: _jsxs(Button, { variant: "outline", size: "sm", onClick: () => setTransactions(sampleTransactions), className: "text-xs", children: [_jsx(RefreshCw, { className: "w-3 h-3 mr-1" }), "Reset"] }) })] }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-muted-foreground", children: "Company" }), _jsxs(Select, { value: selectedCompany, onValueChange: setSelectedCompany, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select company" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "company_1", children: "Demo Company 1" }), _jsx(SelectItem, { value: "company_2", children: "Demo Company 2" })] })] })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-muted-foreground", children: "Confidence Threshold" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Input, { type: "number", value: confidenceThreshold, onChange: (e) => setConfidenceThreshold(parseInt(e.target.value)), min: "0", max: "100", className: "w-20" }), _jsx("span", { className: "text-xs text-muted-foreground", children: "%" })] })] }), _jsx("div", { className: "flex items-end", children: _jsxs("label", { className: "flex items-center gap-2 text-sm", children: [_jsx("input", { type: "checkbox", checked: showLowConfidence, onChange: (e) => setShowLowConfidence(e.target.checked), className: "rounded" }), "Show low confidence"] }) }), _jsx("div", { className: "flex items-end gap-2", children: _jsxs(Button, { onClick: categorizeTransactions, disabled: isProcessing || transactions.length === 0, className: "flex-1", children: [isProcessing ? (_jsx(Loader2, { className: "w-4 h-4 mr-2 animate-spin" })) : (_jsx(Brain, { className: "w-4 h-4 mr-2" })), "Categorize All"] }) })] }), _jsxs("div", { className: "border-2 border-dashed border-border rounded-lg p-4 text-center", children: [_jsx(Upload, { className: "w-8 h-8 mx-auto mb-2 text-muted-foreground" }), _jsx("p", { className: "text-sm text-muted-foreground mb-2", children: "Upload CSV file with transactions (description, amount, type, date)" }), _jsx("input", { type: "file", accept: ".csv", onChange: handleFileUpload, className: "hidden", id: "transaction-upload" }), _jsx("label", { htmlFor: "transaction-upload", className: "cursor-pointer", children: _jsxs(Button, { variant: "outline", size: "sm", children: [_jsx(FileText, { className: "w-4 h-4 mr-2" }), "Upload CSV"] }) })] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("h3", { className: "text-sm font-medium", children: ["Transactions (", filteredTransactions.length, ")"] }), _jsxs("div", { className: "text-xs text-muted-foreground", children: [transactions.filter(t => t.category).length, " categorized"] })] }), filteredTransactions.map((transaction) => (_jsxs("div", { className: "p-4 bg-muted/30 rounded-lg border border-border", children: [_jsxs("div", { className: "flex items-start justify-between mb-3", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [_jsx("span", { className: "text-sm font-medium", children: transaction.description }), _jsx(Badge, { variant: "outline", className: "text-xs", children: transaction.transactionType })] }), _jsxs("div", { className: "flex items-center gap-4 text-xs text-muted-foreground", children: [_jsx("span", { children: transaction.date }), _jsxs("span", { className: "flex items-center gap-1", children: [_jsx(DollarSign, { className: "w-3 h-3" }), transaction.amount.toLocaleString()] })] })] }), _jsx("div", { className: "flex items-center gap-2", children: transaction.category ? (_jsxs("div", { className: "text-right", children: [_jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Badge, { className: "bg-green-100 text-green-700 text-xs", children: transaction.category }), transaction.confidence && getConfidenceBadge(transaction.confidence)] }), transaction.confidence && (_jsxs("div", { className: "flex items-center gap-1 mt-1", children: [_jsx(Progress, { value: transaction.confidence, className: "w-16 h-1" }), _jsxs("span", { className: `text-xs ${getConfidenceColor(transaction.confidence)}`, children: [transaction.confidence, "%"] })] }))] })) : (_jsxs(Button, { variant: "outline", size: "sm", onClick: () => categorizeSingleTransaction(transaction), disabled: isProcessing, children: [_jsx(Brain, { className: "w-3 h-3 mr-1" }), "Categorize"] })) })] }), transaction.reasoning && (_jsxs("div", { className: "mt-2 p-2 bg-background/50 rounded text-xs text-muted-foreground", children: [_jsx("strong", { children: "AI Reasoning:" }), " ", transaction.reasoning] }))] }, transaction.id)))] }), categorizations.length > 0 && (_jsxs("div", { className: "mt-6 p-4 bg-muted/30 rounded-lg border border-border", children: [_jsx("h3", { className: "text-sm font-medium mb-3", children: "Categorization Summary" }), _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("div", { className: "text-muted-foreground", children: "Total Processed" }), _jsx("div", { className: "font-medium", children: categorizations.length })] }), _jsxs("div", { children: [_jsx("div", { className: "text-muted-foreground", children: "High Confidence" }), _jsx("div", { className: "font-medium text-green-600", children: categorizations.filter(c => c.confidence >= 90).length })] }), _jsxs("div", { children: [_jsx("div", { className: "text-muted-foreground", children: "Medium Confidence" }), _jsx("div", { className: "font-medium text-yellow-600", children: categorizations.filter(c => c.confidence >= 70 && c.confidence < 90).length })] }), _jsxs("div", { children: [_jsx("div", { className: "text-muted-foreground", children: "Low Confidence" }), _jsx("div", { className: "font-medium text-red-600", children: categorizations.filter(c => c.confidence < 70).length })] })] })] }))] })] }));
}
