import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Brain, TrendingUp, TrendingDown, AlertTriangle, Sparkles, Loader2, RefreshCw, Target, Lightbulb, CheckCircle, BarChart3, LineChart, } from "lucide-react";
import { useToast } from "../hooks/use-toast";
export function AICashFlowForecasting() {
    const [selectedCompany, setSelectedCompany] = useState("");
    const [forecastPeriods, setForecastPeriods] = useState(3);
    const [isGenerating, setIsGenerating] = useState(false);
    const [forecastResult, setForecastResult] = useState(null);
    const [historicalData, setHistoricalData] = useState([]);
    const { toast } = useToast();
    // Sample historical cash flow data
    const sampleHistoricalData = [
        { date: '2024-01', cashFlow: 150000 },
        { date: '2024-02', cashFlow: 180000 },
        { date: '2024-03', cashFlow: 120000 },
        { date: '2024-04', cashFlow: 200000 },
        { date: '2024-05', cashFlow: 160000 },
        { date: '2024-06', cashFlow: 140000 },
        { date: '2024-07', cashFlow: 190000 },
        { date: '2024-08', cashFlow: 170000 },
        { date: '2024-09', cashFlow: 130000 },
        { date: '2024-10', cashFlow: 210000 },
        { date: '2024-11', cashFlow: 180000 },
        { date: '2024-12', cashFlow: 250000 },
    ];
    useEffect(() => {
        setHistoricalData(sampleHistoricalData);
    }, []);
    const generateForecast = async () => {
        if (!selectedCompany) {
            toast({
                title: "Company Required",
                description: "Please select a company first",
                variant: "destructive"
            });
            return;
        }
        setIsGenerating(true);
        try {
            const response = await fetch('/api/ai/forecast/cash-flow', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-tenant-id': 'tenant_demo',
                    'x-company-id': selectedCompany
                },
                body: JSON.stringify({
                    companyId: selectedCompany,
                    historicalData: historicalData,
                    periods: forecastPeriods
                })
            });
            if (!response.ok) {
                throw new Error('Failed to generate forecast');
            }
            const result = await response.json();
            setForecastResult(result.forecast);
            toast({
                title: "Forecast Generated",
                description: `Cash flow forecast generated for ${forecastPeriods} periods`,
            });
        }
        catch (error) {
            console.error('Forecast generation error:', error);
            toast({
                title: "Forecast Generation Failed",
                description: "Failed to generate forecast. Please try again.",
                variant: "destructive"
            });
        }
        finally {
            setIsGenerating(false);
        }
    };
    const getRiskColor = (riskLevel) => {
        switch (riskLevel) {
            case 'low': return 'text-green-600';
            case 'medium': return 'text-yellow-600';
            case 'high': return 'text-red-600';
            default: return 'text-gray-600';
        }
    };
    const getRiskBadge = (riskLevel) => {
        switch (riskLevel) {
            case 'low': return _jsx(Badge, { className: "bg-green-100 text-green-700", children: "Low Risk" });
            case 'medium': return _jsx(Badge, { className: "bg-yellow-100 text-yellow-700", children: "Medium Risk" });
            case 'high': return _jsx(Badge, { className: "bg-red-100 text-red-700", children: "High Risk" });
            default: return _jsx(Badge, { variant: "outline", children: "Unknown" });
        }
    };
    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'critical': return 'text-red-600';
            case 'high': return 'text-orange-600';
            case 'medium': return 'text-yellow-600';
            case 'low': return 'text-green-600';
            default: return 'text-gray-600';
        }
    };
    const getPriorityBadge = (priority) => {
        switch (priority) {
            case 'critical': return _jsx(Badge, { className: "bg-red-100 text-red-700", children: "Critical" });
            case 'high': return _jsx(Badge, { className: "bg-orange-100 text-orange-700", children: "High" });
            case 'medium': return _jsx(Badge, { className: "bg-yellow-100 text-yellow-700", children: "Medium" });
            case 'low': return _jsx(Badge, { className: "bg-green-100 text-green-700", children: "Low" });
            default: return _jsx(Badge, { variant: "outline", children: "Unknown" });
        }
    };
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };
    const getCashFlowIcon = (amount) => {
        return amount >= 0 ? _jsx(TrendingUp, { className: "w-4 h-4 text-green-600" }) : _jsx(TrendingDown, { className: "w-4 h-4 text-red-600" });
    };
    return (_jsxs(Card, { className: "bg-card border-border", children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center justify-between text-foreground", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(LineChart, { className: "w-5 h-5 text-cyan-600" }), "AI Cash Flow Forecasting", _jsxs(Badge, { variant: "secondary", className: "bg-cyan-100 text-cyan-700", children: [_jsx(Sparkles, { className: "w-3 h-3 mr-1" }), "Predictive"] })] }), _jsx("div", { className: "flex items-center gap-2", children: _jsxs(Button, { variant: "outline", size: "sm", onClick: () => setHistoricalData(sampleHistoricalData), className: "text-xs", children: [_jsx(RefreshCw, { className: "w-3 h-3 mr-1" }), "Reset Data"] }) })] }) }), _jsxs(CardContent, { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-muted-foreground", children: "Company" }), _jsxs(Select, { value: selectedCompany, onValueChange: setSelectedCompany, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select company" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "company_1", children: "Demo Company 1" }), _jsx(SelectItem, { value: "company_2", children: "Demo Company 2" })] })] })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-muted-foreground", children: "Forecast Periods" }), _jsxs(Select, { value: forecastPeriods.toString(), onValueChange: (value) => setForecastPeriods(parseInt(value)), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "1", children: "1 Month" }), _jsx(SelectItem, { value: "3", children: "3 Months" }), _jsx(SelectItem, { value: "6", children: "6 Months" }), _jsx(SelectItem, { value: "12", children: "12 Months" })] })] })] }), _jsx("div", { className: "flex items-end", children: _jsxs(Button, { onClick: generateForecast, disabled: isGenerating || !selectedCompany, className: "w-full", children: [isGenerating ? (_jsx(Loader2, { className: "w-4 h-4 mr-2 animate-spin" })) : (_jsx(Brain, { className: "w-4 h-4 mr-2" })), "Generate Forecast"] }) })] }), _jsxs("div", { className: "p-4 bg-muted/30 rounded-lg border border-border", children: [_jsxs("h3", { className: "text-sm font-medium mb-3 flex items-center gap-2", children: [_jsx(BarChart3, { className: "w-4 h-4" }), "Historical Cash Flow Data"] }), _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("div", { className: "text-muted-foreground", children: "Total Periods" }), _jsx("div", { className: "font-medium", children: historicalData.length })] }), _jsxs("div", { children: [_jsx("div", { className: "text-muted-foreground", children: "Average Cash Flow" }), _jsx("div", { className: "font-medium", children: formatCurrency(historicalData.reduce((sum, d) => sum + d.cashFlow, 0) / historicalData.length) })] }), _jsxs("div", { children: [_jsx("div", { className: "text-muted-foreground", children: "Positive Months" }), _jsx("div", { className: "font-medium text-green-600", children: historicalData.filter(d => d.cashFlow >= 0).length })] }), _jsxs("div", { children: [_jsx("div", { className: "text-muted-foreground", children: "Negative Months" }), _jsx("div", { className: "font-medium text-red-600", children: historicalData.filter(d => d.cashFlow < 0).length })] })] })] }), forecastResult && (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "p-4 bg-muted/30 rounded-lg border border-border", children: [_jsxs("h3", { className: "text-sm font-medium mb-4 flex items-center gap-2", children: [_jsx(Target, { className: "w-4 h-4" }), "Cash Flow Predictions"] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: forecastResult.predictions.map((prediction, index) => (_jsxs("div", { className: "p-3 bg-background/50 rounded-lg border border-border", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("span", { className: "text-sm font-medium", children: prediction.period }), getRiskBadge(prediction.riskLevel)] }), _jsxs("div", { className: "flex items-center gap-2 mb-2", children: [getCashFlowIcon(prediction.predictedAmount), _jsx("span", { className: `text-lg font-bold ${prediction.predictedAmount >= 0 ? 'text-green-600' : 'text-red-600'}`, children: formatCurrency(prediction.predictedAmount) })] }), _jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx("span", { className: "text-xs text-muted-foreground", children: "Confidence:" }), _jsx(Progress, { value: prediction.confidence, className: "w-16 h-1" }), _jsxs("span", { className: "text-xs font-medium", children: [prediction.confidence, "%"] })] }), _jsxs("div", { className: "text-xs text-muted-foreground", children: [_jsx("strong", { children: "Key Factors:" }), _jsx("ul", { className: "mt-1 space-y-1", children: prediction.factors.slice(0, 2).map((factor, factorIndex) => (_jsxs("li", { children: ["\u2022 ", factor] }, factorIndex))) })] })] }, index))) })] }), forecastResult.insights.length > 0 && (_jsxs("div", { className: "p-4 bg-muted/30 rounded-lg border border-border", children: [_jsxs("h3", { className: "text-sm font-medium mb-4 flex items-center gap-2", children: [_jsx(Lightbulb, { className: "w-4 h-4" }), "AI Insights & Recommendations"] }), _jsx("div", { className: "space-y-3", children: forecastResult.insights.map((insight, index) => (_jsxs("div", { className: "p-3 bg-background/50 rounded-lg border border-border", children: [_jsxs("div", { className: "flex items-start justify-between mb-2", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("h4", { className: "text-sm font-medium", children: insight.title }), getPriorityBadge(insight.priority)] }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Progress, { value: insight.confidence, className: "w-12 h-1" }), _jsxs("span", { className: "text-xs text-muted-foreground", children: [insight.confidence, "%"] })] })] }), _jsx("p", { className: "text-sm text-muted-foreground mb-2", children: insight.description }), insight.impact && (_jsxs("div", { className: "mb-2", children: [_jsx("span", { className: "text-xs font-medium text-muted-foreground", children: "Impact: " }), _jsx("span", { className: "text-xs", children: insight.impact })] })), insight.actionable && insight.suggestedActions.length > 0 && (_jsxs("div", { children: [_jsx("span", { className: "text-xs font-medium text-muted-foreground", children: "Suggested Actions:" }), _jsx("ul", { className: "mt-1 space-y-1", children: insight.suggestedActions.slice(0, 3).map((action, actionIndex) => (_jsxs("li", { className: "text-xs flex items-center gap-1", children: [_jsx(CheckCircle, { className: "w-3 h-3 text-green-600" }), action] }, actionIndex))) })] }))] }, index))) })] })), forecastResult.predictions.some(p => p.predictedAmount < 0 && p.confidence > 70) && (_jsxs("div", { className: "p-4 bg-red-50 border border-red-200 rounded-lg", children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx(AlertTriangle, { className: "w-5 h-5 text-red-600" }), _jsx("h3", { className: "text-sm font-medium text-red-800", children: "Cash Shortage Alerts" })] }), _jsx("p", { className: "text-sm text-red-700 mb-3", children: "AI has detected potential cash shortages in the forecast period. Immediate action may be required." }), _jsx("div", { className: "space-y-2", children: forecastResult.predictions
                                            .filter(p => p.predictedAmount < 0 && p.confidence > 70)
                                            .map((prediction, index) => (_jsxs("div", { className: "flex items-center justify-between text-sm", children: [_jsx("span", { className: "text-red-700", children: prediction.period }), _jsxs("span", { className: "font-medium text-red-800", children: [formatCurrency(Math.abs(prediction.predictedAmount)), " shortage"] })] }, index))) })] })), _jsxs("div", { className: "p-4 bg-muted/30 rounded-lg border border-border", children: [_jsx("h3", { className: "text-sm font-medium mb-3", children: "Forecast Summary" }), _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("div", { className: "text-muted-foreground", children: "Total Predicted" }), _jsx("div", { className: "font-medium", children: formatCurrency(forecastResult.predictions.reduce((sum, p) => sum + p.predictedAmount, 0)) })] }), _jsxs("div", { children: [_jsx("div", { className: "text-muted-foreground", children: "Average Confidence" }), _jsxs("div", { className: "font-medium", children: [Math.round(forecastResult.predictions.reduce((sum, p) => sum + p.confidence, 0) / forecastResult.predictions.length), "%"] })] }), _jsxs("div", { children: [_jsx("div", { className: "text-muted-foreground", children: "High Risk Periods" }), _jsx("div", { className: "font-medium text-red-600", children: forecastResult.predictions.filter(p => p.riskLevel === 'high').length })] }), _jsxs("div", { children: [_jsx("div", { className: "text-muted-foreground", children: "Generated" }), _jsx("div", { className: "font-medium text-xs", children: new Date(forecastResult.generatedAt).toLocaleString() })] })] })] })] })), !forecastResult && (_jsxs("div", { className: "text-center py-8 text-muted-foreground", children: [_jsx(LineChart, { className: "w-8 h-8 mx-auto mb-2 opacity-50" }), _jsx("p", { className: "text-sm", children: "No forecast generated yet" }), _jsx("p", { className: "text-xs mt-1", children: "Generate a cash flow forecast to see AI predictions and insights" })] }))] })] }));
}
