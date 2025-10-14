import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Slider } from "../components/ui/slider";
import { TrendingUp, Target, AlertCircle, Lightbulb } from "lucide-react";
const forecastScenarios = [
    {
        name: "Conservative",
        growth: 5,
        confidence: 85,
        revenue: 420000,
        color: "text-blue-600",
    },
    {
        name: "Realistic",
        growth: 12,
        confidence: 78,
        revenue: 470000,
        color: "text-cyan-600",
    },
    {
        name: "Optimistic",
        growth: 20,
        confidence: 62,
        revenue: 540000,
        color: "text-green-600",
    },
];
export function PredictiveForecasting() {
    const [selectedScenario, setSelectedScenario] = useState(forecastScenarios[1]);
    const [customGrowth, setCustomGrowth] = useState([12]);
    const calculateCustomForecast = (growth) => {
        const baseRevenue = 420000;
        return Math.round(baseRevenue * (1 + growth / 100));
    };
    return (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Target, { className: "h-5 w-5 text-cyan-600" }), _jsx(CardTitle, { children: "Predictive Forecasting" }), _jsx(Badge, { variant: "secondary", className: "bg-cyan-100 text-cyan-700", children: "12-Month Outlook" })] }), _jsxs(Button, { size: "sm", variant: "outline", children: [_jsx(TrendingUp, { className: "h-4 w-4 mr-2" }), "View Details"] })] }) }), _jsxs(CardContent, { className: "space-y-6", children: [_jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: forecastScenarios.map((scenario) => (_jsxs("div", { className: `p-4 rounded-lg border cursor-pointer transition-all ${selectedScenario.name === scenario.name
                                ? "border-cyan-300 bg-cyan-50"
                                : "border-gray-200 hover:border-cyan-200"}`, onClick: () => setSelectedScenario(scenario), children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("h3", { className: "font-medium text-gray-900", children: scenario.name }), _jsxs(Badge, { variant: "outline", className: scenario.color, children: [scenario.confidence, "%"] })] }), _jsxs("div", { className: "space-y-1", children: [_jsxs("div", { className: "text-2xl font-bold text-gray-900", children: ["$", scenario.revenue.toLocaleString()] }), _jsxs("div", { className: "text-sm text-gray-600", children: [scenario.growth, "% growth"] })] })] }, scenario.name))) }), _jsxs("div", { className: "bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg border border-cyan-200 p-4", children: [_jsxs("h3", { className: "font-medium text-gray-900 mb-4", children: ["Scenario Analysis: ", selectedScenario.name] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm text-gray-600", children: "Projected Revenue" }), _jsxs("span", { className: "text-lg font-bold text-gray-900", children: ["$", selectedScenario.revenue.toLocaleString()] })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm text-gray-600", children: "Growth Rate" }), _jsxs("span", { className: "text-sm font-medium text-cyan-600", children: [selectedScenario.growth, "%"] })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm text-gray-600", children: "Confidence Level" }), _jsxs("span", { className: "text-sm font-medium text-green-600", children: [selectedScenario.confidence, "%"] })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("label", { className: "text-sm font-medium text-gray-700", children: ["Custom Growth Rate: ", customGrowth[0], "%"] }), _jsx(Slider, { value: customGrowth, onValueChange: setCustomGrowth, max: 30, min: 0, step: 1, className: "w-full" }), _jsxs("div", { className: "text-sm text-gray-600", children: ["Custom Forecast: $", calculateCustomForecast(customGrowth[0]).toLocaleString()] })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsx("div", { className: "bg-white rounded-lg border border-cyan-200 p-3", children: _jsxs("div", { className: "flex items-start gap-2", children: [_jsx(Lightbulb, { className: "h-4 w-4 text-yellow-500 mt-0.5" }), _jsxs("div", { children: [_jsx("h4", { className: "text-sm font-medium text-gray-900", children: "Key Drivers" }), _jsxs("ul", { className: "text-xs text-gray-600 mt-1 space-y-1", children: [_jsx("li", { children: "\u2022 Client retention: 94%" }), _jsx("li", { children: "\u2022 Average deal size: +8%" }), _jsx("li", { children: "\u2022 Market expansion: Q2" })] })] })] }) }), _jsx("div", { className: "bg-white rounded-lg border border-yellow-200 p-3", children: _jsxs("div", { className: "flex items-start gap-2", children: [_jsx(AlertCircle, { className: "h-4 w-4 text-yellow-500 mt-0.5" }), _jsxs("div", { children: [_jsx("h4", { className: "text-sm font-medium text-gray-900", children: "Risk Factors" }), _jsxs("ul", { className: "text-xs text-gray-600 mt-1 space-y-1", children: [_jsx("li", { children: "\u2022 Economic uncertainty" }), _jsx("li", { children: "\u2022 Seasonal variations" }), _jsx("li", { children: "\u2022 Competition increase" })] })] })] }) })] })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "bg-green-50 border border-green-200 rounded-lg p-4", children: [_jsx("h4", { className: "font-medium text-green-900 mb-2", children: "Opportunities" }), _jsxs("ul", { className: "text-sm text-green-800 space-y-1", children: [_jsx("li", { children: "\u2022 Expand to new market segments" }), _jsx("li", { children: "\u2022 Increase average contract value" }), _jsx("li", { children: "\u2022 Launch premium service tier" })] })] }), _jsxs("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-4", children: [_jsx("h4", { className: "font-medium text-blue-900 mb-2", children: "Recommendations" }), _jsxs("ul", { className: "text-sm text-blue-800 space-y-1", children: [_jsx("li", { children: "\u2022 Focus on client retention programs" }), _jsx("li", { children: "\u2022 Invest in sales team expansion" }), _jsx("li", { children: "\u2022 Optimize pricing strategy" })] })] })] })] })] }));
}
