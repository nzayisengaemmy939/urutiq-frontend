import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef } from "react";
import { Filter, X, Save } from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
export function AdvancedFilters({ onFiltersChange, activeFilters }) {
    const [savedFilters, setSavedFilters] = useState([
        {
            id: "recent-expenses",
            name: "Recent Expenses",
            filters: { dateRange: "last-30-days", categories: ["Expenses"] },
        },
        {
            id: "high-value",
            name: "High Value Transactions",
            filters: { amountMin: 1000, categories: ["Transactions"] },
        },
    ]);
    const [showSaveDialog, setShowSaveDialog] = useState(false);
    const [newFilterName, setNewFilterName] = useState("");
    const categories = ["Transactions", "Clients", "Reports", "Invoices", "Expenses", "Banking"];
    const clients = ["Acme Corp", "TechStart Inc", "Local Bakery", "Global Solutions"];
    const statuses = ["Active", "Pending", "Completed", "Overdue"];
    const toggleFilter = (type, value) => {
        const currentValues = activeFilters[type] || [];
        const newValues = currentValues.includes(value)
            ? currentValues.filter((v) => v !== value)
            : [...currentValues, value];
        onFiltersChange({ ...activeFilters, [type]: newValues });
    };
    const setAmountRange = (min, max) => {
        onFiltersChange({ ...activeFilters, amountMin: min, amountMax: max });
    };
    const idCounterRef = useRef(0);
    const saveCurrentFilter = () => {
        if (!newFilterName.trim())
            return;
        const newFilter = {
            id: `filter-${idCounterRef.current++}`,
            name: newFilterName,
            filters: activeFilters,
        };
        setSavedFilters((prev) => [...prev, newFilter]);
        setNewFilterName("");
        setShowSaveDialog(false);
    };
    const loadFilter = (filterSet) => {
        onFiltersChange(filterSet.filters);
    };
    const clearAllFilters = () => {
        onFiltersChange({});
    };
    const hasActiveFilters = Object.keys(activeFilters).some((key) => {
        const value = activeFilters[key];
        return Array.isArray(value) ? value.length > 0 : value !== undefined && value !== "";
    });
    return (_jsxs(Popover, { children: [_jsx(PopoverTrigger, { asChild: true, children: _jsxs(Button, { variant: "outline", size: "sm", className: "gap-2 bg-transparent", children: [_jsx(Filter, { className: "w-4 h-4" }), "Advanced Filters", hasActiveFilters && (_jsx(Badge, { variant: "secondary", className: "ml-1 h-4 px-1 text-xs", children: Object.values(activeFilters).flat().filter(Boolean).length }))] }) }), _jsx(PopoverContent, { className: "w-96 p-0", align: "start", children: _jsxs("div", { className: "p-4 space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h3", { className: "font-semibold text-sm", children: "Advanced Filters" }), hasActiveFilters && (_jsx(Button, { variant: "ghost", size: "sm", onClick: clearAllFilters, children: "Clear All" }))] }), _jsxs("div", { children: [_jsx(Label, { className: "text-xs font-medium text-muted-foreground", children: "Saved Filters" }), _jsx("div", { className: "flex flex-wrap gap-1 mt-1", children: savedFilters.map((filter) => (_jsx(Button, { variant: "outline", size: "sm", className: "h-6 text-xs bg-transparent", onClick: () => loadFilter(filter), children: filter.name }, filter.id))) })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-xs font-medium text-muted-foreground", children: "Categories" }), _jsx("div", { className: "flex flex-wrap gap-1 mt-1", children: categories.map((category) => (_jsx(Button, { variant: activeFilters.categories?.includes(category) ? "default" : "outline", size: "sm", className: "h-6 text-xs", onClick: () => toggleFilter("categories", category), children: category }, category))) })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-xs font-medium text-muted-foreground", children: "Clients" }), _jsx("div", { className: "flex flex-wrap gap-1 mt-1", children: clients.map((client) => (_jsx(Button, { variant: activeFilters.clients?.includes(client) ? "default" : "outline", size: "sm", className: "h-6 text-xs", onClick: () => toggleFilter("clients", client), children: client }, client))) })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-xs font-medium text-muted-foreground", children: "Amount Range" }), _jsxs("div", { className: "flex gap-2 mt-1", children: [_jsx(Input, { type: "number", placeholder: "Min", className: "h-8 text-xs", value: activeFilters.amountMin || "", onChange: (e) => setAmountRange(Number(e.target.value) || undefined, activeFilters.amountMax) }), _jsx(Input, { type: "number", placeholder: "Max", className: "h-8 text-xs", value: activeFilters.amountMax || "", onChange: (e) => setAmountRange(activeFilters.amountMin, Number(e.target.value) || undefined) })] }), _jsx("div", { className: "flex gap-1 mt-1", children: [
                                        { label: "$0-100", min: 0, max: 100 },
                                        { label: "$100-500", min: 100, max: 500 },
                                        { label: "$500-1K", min: 500, max: 1000 },
                                        { label: "$1K+", min: 1000, max: undefined },
                                    ].map((range) => (_jsx(Button, { variant: "outline", size: "sm", className: "h-6 text-xs bg-transparent", onClick: () => setAmountRange(range.min, range.max), children: range.label }, range.label))) })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-xs font-medium text-muted-foreground", children: "Date Range" }), _jsx("div", { className: "flex flex-wrap gap-1 mt-1", children: [
                                        { label: "Today", value: "today" },
                                        { label: "Last 7 days", value: "last-7-days" },
                                        { label: "Last 30 days", value: "last-30-days" },
                                        { label: "This month", value: "this-month" },
                                        { label: "Last month", value: "last-month" },
                                    ].map((range) => (_jsx(Button, { variant: activeFilters.dateRange === range.value ? "default" : "outline", size: "sm", className: "h-6 text-xs", onClick: () => onFiltersChange({ ...activeFilters, dateRange: range.value }), children: range.label }, range.value))) })] }), hasActiveFilters && (_jsx("div", { className: "pt-2 border-t border-border", children: showSaveDialog ? (_jsxs("div", { className: "flex gap-2", children: [_jsx(Input, { placeholder: "Filter name", value: newFilterName, onChange: (e) => setNewFilterName(e.target.value), className: "h-8 text-xs" }), _jsx(Button, { size: "sm", onClick: saveCurrentFilter, className: "h-8", children: _jsx(Save, { className: "w-3 h-3" }) }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => setShowSaveDialog(false), className: "h-8", children: _jsx(X, { className: "w-3 h-3" }) })] })) : (_jsx(Button, { variant: "outline", size: "sm", onClick: () => setShowSaveDialog(true), className: "w-full", children: "Save Current Filter" })) }))] }) })] }));
}
