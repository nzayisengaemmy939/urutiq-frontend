import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { useToast } from "../hooks/use-toast";
import { Brain, Zap, TrendingUp, AlertCircle } from "lucide-react";
import { bankingApi } from '@/lib/api/banking';
import apiService from '@/lib/api';
export function AICategorization({ companyId, transactions, onCategorizationComplete }) {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [categorizing, setCategorizing] = useState(false);
    const [selectedTransactions, setSelectedTransactions] = useState([]);
    const [uncategorizedTransactions, setUncategorizedTransactions] = useState([]);
    const { toast } = useToast();
    useEffect(() => {
        loadStats();
        loadUncategorizedTransactions();
    }, []);
    const loadStats = async () => {
        try {
            const currentCompanyId = companyId || localStorage.getItem('company_id') || localStorage.getItem('companyId') || 'seed-company-1';
            const data = await apiService.get(`/categorization-stats?companyId=${currentCompanyId}`);
            setStats(data);
        }
        catch (error) {
            console.error('Error loading categorization stats:', error);
        }
    };
    const loadUncategorizedTransactions = async () => {
        try {
            const currentCompanyId = companyId || localStorage.getItem('company_id') || localStorage.getItem('companyId') || 'seed-company-1';
            const response = await bankingApi.getBankTransactions(undefined, currentCompanyId);
            const uncategorized = response.items.filter(t => !t.category || t.category === 'Uncategorized');
            setUncategorizedTransactions(uncategorized);
        }
        catch (error) {
            console.error('Error loading uncategorized transactions:', error);
        }
    };
    const categorizeSelectedTransactions = async () => {
        if (selectedTransactions.length === 0)
            return;
        setCategorizing(true);
        try {
            const currentCompanyId = companyId || localStorage.getItem('company_id') || localStorage.getItem('companyId') || 'seed-company-1';
            const result = await apiService.post(`/bank-transactions/categorize?companyId=${currentCompanyId}`, {
                transactionIds: selectedTransactions
            });
            toast({
                title: "Categorization Complete",
                description: `Successfully categorized ${result.categorized} transactions. ${result.failed} failed.`,
            });
            setSelectedTransactions([]);
            loadStats();
            loadUncategorizedTransactions();
            if (onCategorizationComplete) {
                onCategorizationComplete();
            }
        }
        catch (error) {
            console.error('Error categorizing transactions:', error);
            toast({
                title: "Categorization Failed",
                description: error.message || "Failed to categorize transactions",
                variant: "destructive"
            });
        }
        finally {
            setCategorizing(false);
        }
    };
    const categorizeAllUncategorized = async () => {
        const allUncategorizedIds = uncategorizedTransactions.map(t => t.id);
        setSelectedTransactions(allUncategorizedIds);
        await categorizeSelectedTransactions();
    };
    const categorizeSingleTransaction = async (transactionId) => {
        setLoading(true);
        try {
            const currentCompanyId = companyId || localStorage.getItem('company_id') || localStorage.getItem('companyId') || 'seed-company-1';
            const result = await apiService.post(`/bank-transactions/${transactionId}/categorize?companyId=${currentCompanyId}`);
            toast({
                title: "Transaction Categorized",
                description: `Categorized as: ${result.categorization.category}`,
            });
            loadStats();
            loadUncategorizedTransactions();
        }
        catch (error) {
            console.error('Error categorizing transaction:', error);
            toast({
                title: "Categorization Failed",
                description: error.message || "Failed to categorize transaction",
                variant: "destructive"
            });
        }
        finally {
            setLoading(false);
        }
    };
    const correctCategory = async (transactionId, newCategory) => {
        try {
            const currentCompanyId = companyId || localStorage.getItem('company_id') || localStorage.getItem('companyId') || 'seed-company-1';
            await apiService.post(`/bank-transactions/${transactionId}/correct-category?companyId=${currentCompanyId}`, {
                category: newCategory
            });
            toast({
                title: "Category Corrected",
                description: "AI will learn from this correction for future transactions.",
            });
            loadStats();
            loadUncategorizedTransactions();
        }
        catch (error) {
            console.error('Error correcting category:', error);
            toast({
                title: "Correction Failed",
                description: error.message || "Failed to correct category",
                variant: "destructive"
            });
        }
    };
    const getConfidenceColor = (confidence) => {
        if (confidence >= 0.8)
            return 'text-green-600';
        if (confidence >= 0.6)
            return 'text-yellow-600';
        return 'text-red-600';
    };
    const getConfidenceBadge = (confidence) => {
        if (confidence >= 0.8)
            return 'bg-green-100 text-green-800';
        if (confidence >= 0.6)
            return 'bg-yellow-100 text-yellow-800';
        return 'bg-red-100 text-red-800';
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Brain, { className: "w-5 h-5 text-purple-600" }), "AI Transaction Categorization"] }) }), _jsxs(CardContent, { className: "space-y-4", children: [stats && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-2xl font-bold text-blue-600", children: stats.totalTransactions }), _jsx("div", { className: "text-sm text-muted-foreground", children: "Total Transactions" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-2xl font-bold text-green-600", children: stats.categorizedTransactions }), _jsx("div", { className: "text-sm text-muted-foreground", children: "Categorized" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-2xl font-bold text-orange-600", children: stats.uncategorizedTransactions }), _jsx("div", { className: "text-sm text-muted-foreground", children: "Uncategorized" })] }), _jsxs("div", { className: "text-center", children: [_jsxs("div", { className: "text-2xl font-bold text-purple-600", children: [Math.round(stats.averageConfidence * 100), "%"] }), _jsx("div", { className: "text-sm text-muted-foreground", children: "Avg Confidence" })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { children: "Categorization Progress" }), _jsxs("span", { children: [Math.round((stats.categorizedTransactions / stats.totalTransactions) * 100), "%"] })] }), _jsx(Progress, { value: (stats.categorizedTransactions / stats.totalTransactions) * 100, className: "h-2" })] })] })), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { onClick: categorizeAllUncategorized, disabled: categorizing || uncategorizedTransactions.length === 0, className: "flex items-center gap-2", children: [_jsx(Zap, { className: "w-4 h-4" }), categorizing ? 'Categorizing...' : `Categorize All (${uncategorizedTransactions.length})`] }), _jsxs(Button, { onClick: categorizeSelectedTransactions, disabled: categorizing || selectedTransactions.length === 0, variant: "outline", children: ["Categorize Selected (", selectedTransactions.length, ")"] })] })] })] }), stats && (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(TrendingUp, { className: "w-5 h-5 text-blue-600" }), "Category Breakdown"] }) }), _jsx(CardContent, { children: _jsx("div", { className: "grid grid-cols-2 md:grid-cols-3 gap-3", children: Object.entries(stats.categoryBreakdown).map(([category, count]) => (_jsxs("div", { className: "flex items-center justify-between p-3 bg-gray-50 rounded-lg", children: [_jsx("span", { className: "font-medium", children: category }), _jsx(Badge, { variant: "secondary", children: count })] }, category))) }) })] })), uncategorizedTransactions.length > 0 && (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(AlertCircle, { className: "w-5 h-5 text-orange-600" }), "Uncategorized Transactions (", uncategorizedTransactions.length, ")"] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-3", children: [uncategorizedTransactions.slice(0, 10).map((transaction) => (_jsxs("div", { className: "flex items-center justify-between p-3 border rounded-lg", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("input", { type: "checkbox", checked: selectedTransactions.includes(transaction.id), onChange: (e) => {
                                                                if (e.target.checked) {
                                                                    setSelectedTransactions(prev => [...prev, transaction.id]);
                                                                }
                                                                else {
                                                                    setSelectedTransactions(prev => prev.filter(id => id !== transaction.id));
                                                                }
                                                            }, className: "rounded" }), _jsx("span", { className: "font-medium", children: transaction.description || 'No description' }), transaction.merchantName && (_jsxs("span", { className: "text-sm text-muted-foreground", children: ["- ", transaction.merchantName] }))] }), _jsxs("div", { className: "text-sm text-muted-foreground mt-1", children: [new Date(transaction.transactionDate).toLocaleDateString(), " \u2022 $", Math.abs(Number(transaction.amount)).toFixed(2)] })] }), _jsx("div", { className: "flex items-center gap-2", children: _jsxs(Button, { size: "sm", variant: "outline", onClick: () => categorizeSingleTransaction(transaction.id), disabled: loading, children: [_jsx(Brain, { className: "w-4 h-4 mr-1" }), "Categorize"] }) })] }, transaction.id))), uncategorizedTransactions.length > 10 && (_jsxs("div", { className: "text-center text-sm text-muted-foreground pt-2", children: ["... and ", uncategorizedTransactions.length - 10, " more transactions"] }))] }) })] }))] }));
}
