import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Slider } from "../components/ui/slider";
import { Label } from "../components/ui/label";
import { TrendingUp, TrendingDown, BarChart3, PieChart, Target, Calculator, AlertTriangle, CheckCircle, ArrowUpRight, DollarSign, Calendar, Building, Clock, } from "lucide-react";
const mockForecastData = [
    {
        month: "Jan 2024",
        predicted: 125000,
        confidence: 87,
        scenario: { optimistic: 145000, realistic: 125000, pessimistic: 105000 },
    },
    {
        month: "Feb 2024",
        predicted: 132000,
        confidence: 84,
        scenario: { optimistic: 155000, realistic: 132000, pessimistic: 110000 },
    },
    {
        month: "Mar 2024",
        predicted: 128000,
        confidence: 89,
        scenario: { optimistic: 148000, realistic: 128000, pessimistic: 108000 },
    },
    {
        month: "Apr 2024",
        predicted: 135000,
        confidence: 82,
        scenario: { optimistic: 158000, realistic: 135000, pessimistic: 112000 },
    },
    {
        month: "May 2024",
        predicted: 142000,
        confidence: 85,
        scenario: { optimistic: 165000, realistic: 142000, pessimistic: 119000 },
    },
    {
        month: "Jun 2024",
        predicted: 138000,
        confidence: 88,
        scenario: { optimistic: 160000, realistic: 138000, pessimistic: 116000 },
    },
];
const mockBenchmarkData = [
    {
        metric: "Gross Profit Margin",
        yourValue: 68,
        industryAverage: 62,
        topQuartile: 75,
        unit: "%",
        trend: "up",
        recommendation: "Above average - consider premium pricing strategy",
    },
    {
        metric: "Days Sales Outstanding",
        yourValue: 32,
        industryAverage: 45,
        topQuartile: 28,
        unit: "days",
        trend: "down",
        recommendation: "Good performance - optimize further to reach top quartile",
    },
    {
        metric: "Current Ratio",
        yourValue: 2.1,
        industryAverage: 1.8,
        topQuartile: 2.5,
        unit: "x",
        trend: "stable",
        recommendation: "Healthy liquidity - maintain current levels",
    },
    {
        metric: "Revenue per Employee",
        yourValue: 185000,
        industryAverage: 165000,
        topQuartile: 220000,
        unit: "$",
        trend: "up",
        recommendation: "Strong productivity - invest in scaling operations",
    },
];
export function AdvancedAnalyticsForecasting() {
    const [selectedTimeframe, setSelectedTimeframe] = useState("12months");
    const [selectedScenario, setSelectedScenario] = useState("realistic");
    const [roiInputs, setRoiInputs] = useState({
        investment: 50000,
        expectedReturn: 15,
        timeframe: 24,
        riskLevel: "medium",
    });
    const calculateROI = () => {
        const monthlyReturn = roiInputs.expectedReturn / 100 / 12;
        const totalReturn = roiInputs.investment * (1 + monthlyReturn) ** roiInputs.timeframe;
        const roi = ((totalReturn - roiInputs.investment) / roiInputs.investment) * 100;
        const paybackPeriod = Math.log(2) / Math.log(1 + monthlyReturn);
        const npv = totalReturn - roiInputs.investment;
        return {
            ...roiInputs,
            roi: Math.round(roi * 100) / 100,
            paybackPeriod: Math.round(paybackPeriod * 100) / 100,
            npv: Math.round(npv),
        };
    };
    const roiCalculation = calculateROI();
    const getBenchmarkStatus = (yourValue, industryAverage, topQuartile) => {
        if (yourValue >= topQuartile)
            return { status: "excellent", color: "text-green-600 bg-green-50" };
        if (yourValue >= industryAverage)
            return { status: "good", color: "text-blue-600 bg-blue-50" };
        return { status: "needs improvement", color: "text-red-600 bg-red-50" };
    };
    const getTrendIcon = (trend) => {
        switch (trend) {
            case "up":
                return _jsx(TrendingUp, { className: "h-4 w-4 text-green-500" });
            case "down":
                return _jsx(TrendingDown, { className: "h-4 w-4 text-red-500" });
            default:
                return _jsx(Target, { className: "h-4 w-4 text-gray-500" });
        }
    };
    const getRiskColor = (risk) => {
        switch (risk) {
            case "low":
                return "text-green-600 bg-green-50";
            case "medium":
                return "text-yellow-600 bg-yellow-50";
            case "high":
                return "text-red-600 bg-red-50";
            default:
                return "text-gray-600 bg-gray-50";
        }
    };
    return (_jsxs(Card, { className: "border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50", children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(BarChart3, { className: "h-5 w-5 text-emerald-600" }), _jsx(CardTitle, { className: "text-emerald-900", children: "Advanced Analytics & Forecasting" }), _jsx(Badge, { variant: "secondary", className: "bg-emerald-100 text-emerald-700", children: "AI-Powered" })] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Select, { value: selectedTimeframe, onValueChange: setSelectedTimeframe, children: [_jsx(SelectTrigger, { className: "w-32", children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "6months", children: "6 Months" }), _jsx(SelectItem, { value: "12months", children: "12 Months" }), _jsx(SelectItem, { value: "24months", children: "24 Months" })] })] }), _jsx(Button, { size: "sm", variant: "outline", className: "border-emerald-300 text-emerald-700 bg-transparent", children: "Export Report" })] })] }) }), _jsx(CardContent, { children: _jsxs(Tabs, { defaultValue: "forecasting", className: "w-full", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-4", children: [_jsx(TabsTrigger, { value: "forecasting", children: "Cash Flow Forecast" }), _jsx(TabsTrigger, { value: "benchmarking", children: "Industry Benchmarks" }), _jsx(TabsTrigger, { value: "roi", children: "ROI Calculator" }), _jsx(TabsTrigger, { value: "scenarios", children: "Scenario Planning" })] }), _jsxs(TabsContent, { value: "forecasting", className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-4", children: [_jsx("div", { className: "lg:col-span-2", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx(CardTitle, { className: "text-lg", children: "12-Month Cash Flow Prediction" }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { size: "sm", variant: selectedScenario === "optimistic" ? "default" : "outline", onClick: () => setSelectedScenario("optimistic"), className: "text-xs", children: "Optimistic" }), _jsx(Button, { size: "sm", variant: selectedScenario === "realistic" ? "default" : "outline", onClick: () => setSelectedScenario("realistic"), className: "text-xs", children: "Realistic" }), _jsx(Button, { size: "sm", variant: selectedScenario === "pessimistic" ? "default" : "outline", onClick: () => setSelectedScenario("pessimistic"), className: "text-xs", children: "Pessimistic" })] })] }) }), _jsx(CardContent, { children: _jsx("div", { className: "h-64 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-lg flex items-center justify-center", children: _jsxs("div", { className: "text-center text-gray-600", children: [_jsx(BarChart3, { className: "h-12 w-12 mx-auto mb-4 text-emerald-600" }), _jsx("div", { className: "text-lg font-medium", children: "Interactive Forecast Chart" }), _jsxs("div", { className: "text-sm", children: [selectedScenario.charAt(0).toUpperCase() + selectedScenario.slice(1), " scenario visualization"] })] }) }) })] }) }), _jsxs("div", { className: "space-y-4", children: [_jsx(Card, { children: _jsxs(CardContent, { className: "p-4", children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx(TrendingUp, { className: "h-4 w-4 text-emerald-600" }), _jsx("span", { className: "text-sm font-medium text-gray-900", children: "Avg. Monthly Growth" })] }), _jsx("div", { className: "text-2xl font-bold text-gray-900", children: "+8.2%" }), _jsx("div", { className: "text-xs text-gray-600", children: "Based on historical trends" })] }) }), _jsx(Card, { children: _jsxs(CardContent, { className: "p-4", children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx(Target, { className: "h-4 w-4 text-blue-600" }), _jsx("span", { className: "text-sm font-medium text-gray-900", children: "Confidence Level" })] }), _jsx("div", { className: "text-2xl font-bold text-gray-900", children: "86%" }), _jsx(Progress, { value: 86, className: "mt-2" })] }) }), _jsx(Card, { children: _jsxs(CardContent, { className: "p-4", children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx(AlertTriangle, { className: "h-4 w-4 text-yellow-600" }), _jsx("span", { className: "text-sm font-medium text-gray-900", children: "Risk Factors" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("div", { className: "text-xs text-gray-600", children: "\u2022 Seasonal variations" }), _jsx("div", { className: "text-xs text-gray-600", children: "\u2022 Market volatility" }), _jsx("div", { className: "text-xs text-gray-600", children: "\u2022 Customer concentration" })] })] }) })] })] }), _jsx("div", { className: "grid grid-cols-2 md:grid-cols-6 gap-4", children: mockForecastData.map((data, index) => (_jsx(Card, { children: _jsxs(CardContent, { className: "p-3", children: [_jsx("div", { className: "text-xs text-gray-600 mb-1", children: data.month }), _jsxs("div", { className: "text-lg font-bold text-gray-900", children: ["$", (data.scenario[selectedScenario] / 1000).toFixed(0), "K"] }), _jsxs("div", { className: "flex items-center gap-1 mt-1", children: [_jsxs("div", { className: "text-xs text-gray-600", children: [data.confidence, "%"] }), _jsx(Progress, { value: data.confidence, className: "h-1 flex-1" })] })] }) }, index))) })] }), _jsx(TabsContent, { value: "benchmarking", className: "space-y-4", children: _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: mockBenchmarkData.map((benchmark, index) => (_jsx(Card, { children: _jsxs(CardContent, { className: "p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Building, { className: "h-4 w-4 text-emerald-600" }), _jsx("h4", { className: "font-medium text-gray-900", children: benchmark.metric })] }), getTrendIcon(benchmark.trend)] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm text-gray-600", children: "Your Performance" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "font-semibold text-gray-900", children: benchmark.unit === "$"
                                                                            ? `$${benchmark.yourValue.toLocaleString()}`
                                                                            : `${benchmark.yourValue}${benchmark.unit}` }), _jsx(Badge, { variant: "outline", className: getBenchmarkStatus(benchmark.yourValue, benchmark.industryAverage, benchmark.topQuartile)
                                                                            .color, children: getBenchmarkStatus(benchmark.yourValue, benchmark.industryAverage, benchmark.topQuartile)
                                                                            .status })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between text-xs", children: [_jsx("span", { className: "text-gray-600", children: "Industry Avg" }), _jsx("span", { className: "text-gray-900", children: benchmark.unit === "$"
                                                                            ? `$${benchmark.industryAverage.toLocaleString()}`
                                                                            : `${benchmark.industryAverage}${benchmark.unit}` })] }), _jsxs("div", { className: "flex justify-between text-xs", children: [_jsx("span", { className: "text-gray-600", children: "Top Quartile" }), _jsx("span", { className: "text-gray-900", children: benchmark.unit === "$"
                                                                            ? `$${benchmark.topQuartile.toLocaleString()}`
                                                                            : `${benchmark.topQuartile}${benchmark.unit}` })] })] }), _jsx("div", { className: "pt-2 border-t border-gray-100", children: _jsx("p", { className: "text-xs text-gray-600", children: benchmark.recommendation }) })] })] }) }, index))) }) }), _jsx(TabsContent, { value: "roi", className: "space-y-4", children: _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "text-lg flex items-center gap-2", children: [_jsx(Calculator, { className: "h-5 w-5 text-emerald-600" }), "ROI Calculator"] }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "investment", children: "Initial Investment" }), _jsxs("div", { className: "flex items-center gap-2 mt-1", children: [_jsx(DollarSign, { className: "h-4 w-4 text-gray-500" }), _jsx(Slider, { value: [roiInputs.investment], onValueChange: (value) => setRoiInputs({ ...roiInputs, investment: value[0] }), max: 500000, min: 1000, step: 1000, className: "flex-1" }), _jsxs("span", { className: "text-sm font-medium w-20 text-right", children: ["$", roiInputs.investment.toLocaleString()] })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "return", children: "Expected Annual Return (%)" }), _jsxs("div", { className: "flex items-center gap-2 mt-1", children: [_jsx(Target, { className: "h-4 w-4 text-gray-500" }), _jsx(Slider, { value: [roiInputs.expectedReturn], onValueChange: (value) => setRoiInputs({ ...roiInputs, expectedReturn: value[0] }), max: 50, min: 1, step: 0.5, className: "flex-1" }), _jsxs("span", { className: "text-sm font-medium w-12 text-right", children: [roiInputs.expectedReturn, "%"] })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "timeframe", children: "Investment Timeframe (months)" }), _jsxs("div", { className: "flex items-center gap-2 mt-1", children: [_jsx(Calendar, { className: "h-4 w-4 text-gray-500" }), _jsx(Slider, { value: [roiInputs.timeframe], onValueChange: (value) => setRoiInputs({ ...roiInputs, timeframe: value[0] }), max: 60, min: 6, step: 6, className: "flex-1" }), _jsxs("span", { className: "text-sm font-medium w-16 text-right", children: [roiInputs.timeframe, " months"] })] })] }), _jsxs("div", { children: [_jsx(Label, { children: "Risk Level" }), _jsx("div", { className: "flex gap-2 mt-1", children: ["low", "medium", "high"].map((risk) => (_jsx(Button, { size: "sm", variant: roiInputs.riskLevel === risk ? "default" : "outline", onClick: () => setRoiInputs({ ...roiInputs, riskLevel: risk }), className: "flex-1", children: risk.charAt(0).toUpperCase() + risk.slice(1) }, risk))) })] })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-lg", children: "Investment Analysis" }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "p-3 bg-emerald-50 rounded-lg", children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [_jsx(ArrowUpRight, { className: "h-4 w-4 text-emerald-600" }), _jsx("span", { className: "text-sm font-medium text-gray-900", children: "Total ROI" })] }), _jsxs("div", { className: "text-2xl font-bold text-emerald-600", children: [roiCalculation.roi, "%"] })] }), _jsxs("div", { className: "p-3 bg-blue-50 rounded-lg", children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [_jsx(Clock, { className: "h-4 w-4 text-blue-600" }), _jsx("span", { className: "text-sm font-medium text-gray-900", children: "Payback Period" })] }), _jsxs("div", { className: "text-2xl font-bold text-blue-600", children: [roiCalculation.paybackPeriod, "m"] })] }), _jsxs("div", { className: "p-3 bg-purple-50 rounded-lg", children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [_jsx(DollarSign, { className: "h-4 w-4 text-purple-600" }), _jsx("span", { className: "text-sm font-medium text-gray-900", children: "Net Present Value" })] }), _jsxs("div", { className: "text-2xl font-bold text-purple-600", children: ["$", roiCalculation.npv.toLocaleString()] })] }), _jsxs("div", { className: "p-3 bg-gray-50 rounded-lg", children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [_jsx(AlertTriangle, { className: "h-4 w-4 text-gray-600" }), _jsx("span", { className: "text-sm font-medium text-gray-900", children: "Risk Level" })] }), _jsx(Badge, { variant: "outline", className: getRiskColor(roiCalculation.riskLevel), children: roiCalculation.riskLevel.toUpperCase() })] })] }), _jsxs("div", { className: "pt-4 border-t border-gray-100", children: [_jsx("h4", { className: "font-medium text-gray-900 mb-2", children: "Investment Recommendation" }), _jsxs("div", { className: "space-y-2", children: [roiCalculation.roi > 20 && (_jsxs("div", { className: "flex items-center gap-2 text-sm text-green-700", children: [_jsx(CheckCircle, { className: "h-4 w-4" }), "Excellent ROI potential - Highly recommended"] })), roiCalculation.roi >= 10 && roiCalculation.roi <= 20 && (_jsxs("div", { className: "flex items-center gap-2 text-sm text-blue-700", children: [_jsx(Target, { className: "h-4 w-4" }), "Good ROI potential - Consider investment"] })), roiCalculation.roi < 10 && (_jsxs("div", { className: "flex items-center gap-2 text-sm text-yellow-700", children: [_jsx(AlertTriangle, { className: "h-4 w-4" }), "Moderate ROI - Evaluate alternatives"] })), _jsxs("div", { className: "text-xs text-gray-600", children: ["Based on ", roiCalculation.timeframe, " month timeframe with ", roiCalculation.riskLevel, " risk profile"] })] })] })] })] })] }) }), _jsxs(TabsContent, { value: "scenarios", className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { className: "text-lg text-green-700", children: "Optimistic Scenario" }), _jsx("p", { className: "text-sm text-gray-600", children: "Best case projections" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-sm text-gray-600", children: "Revenue Growth" }), _jsx("span", { className: "font-medium text-green-600", children: "+25%" })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-sm text-gray-600", children: "Cost Reduction" }), _jsx("span", { className: "font-medium text-green-600", children: "-15%" })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-sm text-gray-600", children: "Market Expansion" }), _jsx("span", { className: "font-medium text-green-600", children: "+40%" })] }), _jsx("div", { className: "pt-2 border-t border-gray-100", children: _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-sm font-medium text-gray-900", children: "Net Impact" }), _jsx("span", { className: "font-bold text-green-600", children: "+$180K" })] }) })] }) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { className: "text-lg text-blue-700", children: "Realistic Scenario" }), _jsx("p", { className: "text-sm text-gray-600", children: "Most likely projections" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-sm text-gray-600", children: "Revenue Growth" }), _jsx("span", { className: "font-medium text-blue-600", children: "+12%" })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-sm text-gray-600", children: "Cost Reduction" }), _jsx("span", { className: "font-medium text-blue-600", children: "-8%" })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-sm text-gray-600", children: "Market Expansion" }), _jsx("span", { className: "font-medium text-blue-600", children: "+15%" })] }), _jsx("div", { className: "pt-2 border-t border-gray-100", children: _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-sm font-medium text-gray-900", children: "Net Impact" }), _jsx("span", { className: "font-bold text-blue-600", children: "+$95K" })] }) })] }) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { className: "text-lg text-red-700", children: "Pessimistic Scenario" }), _jsx("p", { className: "text-sm text-gray-600", children: "Conservative projections" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-sm text-gray-600", children: "Revenue Growth" }), _jsx("span", { className: "font-medium text-red-600", children: "+3%" })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-sm text-gray-600", children: "Cost Reduction" }), _jsx("span", { className: "font-medium text-red-600", children: "-2%" })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-sm text-gray-600", children: "Market Expansion" }), _jsx("span", { className: "font-medium text-red-600", children: "+5%" })] }), _jsx("div", { className: "pt-2 border-t border-gray-100", children: _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-sm font-medium text-gray-900", children: "Net Impact" }), _jsx("span", { className: "font-bold text-red-600", children: "+$25K" })] }) })] }) })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-lg", children: "Scenario Impact Analysis" }) }), _jsx(CardContent, { children: _jsx("div", { className: "h-48 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-lg flex items-center justify-center", children: _jsxs("div", { className: "text-center text-gray-600", children: [_jsx(PieChart, { className: "h-12 w-12 mx-auto mb-4 text-emerald-600" }), _jsx("div", { className: "text-lg font-medium", children: "Interactive Scenario Comparison" }), _jsx("div", { className: "text-sm", children: "Visual comparison of all three scenarios" })] }) }) })] })] })] }) })] }));
}
