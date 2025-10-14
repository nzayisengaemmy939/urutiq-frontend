import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
import { Search, TrendingUp, Sparkles, Loader2, Copy, Download, MessageSquare, Lightbulb, BarChart3, PieChart, Activity, } from "lucide-react";
import { useToast } from "../hooks/use-toast";
export function AINaturalLanguageReports() {
    const [query, setQuery] = useState("");
    const [selectedCompany, setSelectedCompany] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [reportHistory, setReportHistory] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState("");
    const [dateRange, setDateRange] = useState({ start: "", end: "" });
    const { toast } = useToast();
    const reportTemplates = [
        {
            id: 'cash-flow',
            name: 'Cash Flow Report',
            description: 'Show me a cash flow report for [period]',
            examples: [
                'Show me a cash flow report for August 2025',
                'What is my cash flow for Q2 2025?',
                'Generate cash flow analysis for this month'
            ]
        },
        {
            id: 'revenue-analysis',
            name: 'Revenue Analysis',
            description: 'Show me revenue trends for [period]',
            examples: [
                'Show me revenue trends for the last 6 months',
                'What is my revenue breakdown by customer?',
                'Compare revenue between Q1 and Q2 2025'
            ]
        },
        {
            id: 'expense-breakdown',
            name: 'Expense Breakdown',
            description: 'Show me expense breakdown for [period]',
            examples: [
                'Show me expense breakdown for this quarter',
                'What are my top 10 expenses this month?',
                'Compare expenses between departments'
            ]
        },
        {
            id: 'anomaly-report',
            name: 'Anomaly Report',
            description: 'Show me unusual transactions for [period]',
            examples: [
                'Show me unusual transactions for this month',
                'Find transactions over $1000',
                'Identify potential duplicate payments'
            ]
        }
    ];
    const generateReport = async () => {
        if (!selectedCompany || !query.trim()) {
            toast({
                title: "Missing Information",
                description: "Please select a company and enter a query",
                variant: "destructive"
            });
            return;
        }
        setIsGenerating(true);
        try {
            const response = await fetch('/api/ai/reports/natural-language', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-tenant-id': 'tenant_demo',
                    'x-company-id': selectedCompany
                },
                body: JSON.stringify({
                    companyId: selectedCompany,
                    query: query.trim(),
                    dateRange: dateRange.start && dateRange.end ? {
                        start: dateRange.start,
                        end: dateRange.end
                    } : undefined
                })
            });
            if (!response.ok) {
                throw new Error('Failed to generate report');
            }
            const result = await response.json();
            const newReport = {
                query: query.trim(),
                sqlQuery: result.report.sqlQuery || '',
                results: result.report.results || [],
                summary: result.report.summary || result.report.fallback || 'Report generated successfully',
                generatedAt: new Date().toISOString()
            };
            setReportHistory(prev => [newReport, ...prev]);
            setQuery("");
            toast({
                title: "Report Generated",
                description: "Your natural language report has been created",
            });
        }
        catch (error) {
            console.error('Report generation error:', error);
            toast({
                title: "Report Generation Failed",
                description: "Failed to generate report. Please try again.",
                variant: "destructive"
            });
        }
        finally {
            setIsGenerating(false);
        }
    };
    const handleTemplateSelect = (templateId) => {
        const template = reportTemplates.find(t => t.id === templateId);
        if (template) {
            setSelectedTemplate(templateId);
            setQuery(template.examples[0]);
        }
    };
    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast({
            title: "Copied",
            description: "Text copied to clipboard",
        });
    };
    const exportReport = (report) => {
        const data = {
            query: report.query,
            summary: report.summary,
            results: report.results,
            generatedAt: report.generatedAt
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `report-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast({
            title: "Report Exported",
            description: "Report has been downloaded",
        });
    };
    const getChartIcon = (query) => {
        const lowerQuery = query.toLowerCase();
        if (lowerQuery.includes('trend') || lowerQuery.includes('over time'))
            return _jsx(TrendingUp, { className: "w-4 h-4" });
        if (lowerQuery.includes('breakdown') || lowerQuery.includes('by'))
            return _jsx(PieChart, { className: "w-4 h-4" });
        if (lowerQuery.includes('cash flow') || lowerQuery.includes('flow'))
            return _jsx(Activity, { className: "w-4 h-4" });
        return _jsx(BarChart3, { className: "w-4 h-4" });
    };
    return (_jsxs(Card, { className: "bg-card border-border", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "flex items-center justify-between text-foreground", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(MessageSquare, { className: "w-5 h-5 text-cyan-600" }), "Natural Language Reports", _jsxs(Badge, { variant: "secondary", className: "bg-cyan-100 text-cyan-700", children: [_jsx(Sparkles, { className: "w-3 h-3 mr-1" }), "AI-Powered"] })] }) }) }), _jsxs(CardContent, { className: "space-y-6", children: [_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-muted-foreground", children: "Company" }), _jsxs(Select, { value: selectedCompany, onValueChange: setSelectedCompany, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select company" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "company_1", children: "Demo Company 1" }), _jsx(SelectItem, { value: "company_2", children: "Demo Company 2" })] })] })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-muted-foreground", children: "Date Range (Optional)" }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Input, { type: "date", value: dateRange.start, onChange: (e) => setDateRange(prev => ({ ...prev, start: e.target.value })), placeholder: "Start date", className: "text-xs" }), _jsx(Input, { type: "date", value: dateRange.end, onChange: (e) => setDateRange(prev => ({ ...prev, end: e.target.value })), placeholder: "End date", className: "text-xs" })] })] }), _jsx("div", { className: "flex items-end", children: _jsxs(Button, { onClick: generateReport, disabled: isGenerating || !query.trim() || !selectedCompany, className: "w-full", children: [isGenerating ? (_jsx(Loader2, { className: "w-4 h-4 mr-2 animate-spin" })) : (_jsx(Search, { className: "w-4 h-4 mr-2" })), "Generate Report"] }) })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-muted-foreground", children: "Ask your question" }), _jsx(Textarea, { value: query, onChange: (e) => setQuery(e.target.value), placeholder: "e.g., Show me a cash flow report for August 2025", className: "min-h-[80px]" })] })] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("h3", { className: "text-sm font-medium flex items-center gap-2", children: [_jsx(Lightbulb, { className: "w-4 h-4" }), "Report Templates"] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3", children: reportTemplates.map((template) => (_jsxs("div", { className: `p-3 rounded-lg border cursor-pointer transition-colors ${selectedTemplate === template.id
                                        ? 'border-cyan-500 bg-cyan-50'
                                        : 'border-border hover:border-cyan-300'}`, onClick: () => handleTemplateSelect(template.id), children: [_jsxs("div", { className: "flex items-start justify-between mb-2", children: [_jsx("h4", { className: "text-sm font-medium", children: template.name }), _jsx(Badge, { variant: "outline", className: "text-xs", children: "Template" })] }), _jsx("p", { className: "text-xs text-muted-foreground mb-2", children: template.description }), _jsx("div", { className: "space-y-1", children: template.examples.slice(0, 2).map((example, index) => (_jsxs("div", { className: "text-xs text-cyan-600 cursor-pointer hover:text-cyan-700", onClick: (e) => {
                                                    e.stopPropagation();
                                                    setQuery(example);
                                                }, children: ["\u2022 ", example] }, index))) })] }, template.id))) })] }), reportHistory.length > 0 && (_jsxs("div", { className: "space-y-4", children: [_jsx("h3", { className: "text-sm font-medium", children: "Recent Reports" }), reportHistory.map((report, index) => (_jsxs("div", { className: "p-4 bg-muted/30 rounded-lg border border-border", children: [_jsxs("div", { className: "flex items-start justify-between mb-3", children: [_jsxs("div", { className: "flex items-center gap-2", children: [getChartIcon(report.query), _jsxs("h4", { className: "text-sm font-medium", children: ["Report #", index + 1] }), _jsx(Badge, { variant: "outline", className: "text-xs", children: new Date(report.generatedAt).toLocaleDateString() })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Button, { variant: "ghost", size: "sm", onClick: () => copyToClipboard(report.summary), className: "h-6 w-6 p-0", children: _jsx(Copy, { className: "w-3 h-3" }) }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => exportReport(report), className: "h-6 w-6 p-0", children: _jsx(Download, { className: "w-3 h-3" }) })] })] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { children: [_jsx("span", { className: "text-xs font-medium text-muted-foreground", children: "Query:" }), _jsx("p", { className: "text-sm mt-1", children: report.query })] }), _jsxs("div", { children: [_jsx("span", { className: "text-xs font-medium text-muted-foreground", children: "Summary:" }), _jsx("p", { className: "text-sm mt-1 bg-background/50 p-2 rounded", children: report.summary })] }), report.results && report.results.length > 0 && (_jsxs("div", { children: [_jsx("span", { className: "text-xs font-medium text-muted-foreground", children: "Results:" }), _jsx("div", { className: "mt-2 max-h-40 overflow-y-auto", children: _jsx("pre", { className: "text-xs bg-background/50 p-2 rounded overflow-x-auto", children: JSON.stringify(report.results, null, 2) }) })] })), report.sqlQuery && (_jsxs("div", { children: [_jsx("span", { className: "text-xs font-medium text-muted-foreground", children: "Generated SQL:" }), _jsx("div", { className: "mt-2", children: _jsx("pre", { className: "text-xs bg-background/50 p-2 rounded overflow-x-auto", children: report.sqlQuery }) })] }))] })] }, index)))] })), reportHistory.length === 0 && (_jsxs("div", { className: "text-center py-8 text-muted-foreground", children: [_jsx(MessageSquare, { className: "w-8 h-8 mx-auto mb-2 opacity-50" }), _jsx("p", { className: "text-sm", children: "No reports generated yet" }), _jsx("p", { className: "text-xs mt-1", children: "Ask a question in natural language to generate your first report" })] }))] })] }));
}
