import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useMemo } from "react";
import { Search, Calculator, FileText, Users, CreditCard, TrendingUp, Lightbulb, Filter, DollarSign, Building2, X, ChevronDown, } from "lucide-react";
import { Button } from "../components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";
import { Badge } from "../components/ui/badge";
import { useKeyboardNavigation } from "./keyboard-navigation-provider";
const searchDatabase = [
    // Quick Actions
    {
        id: "expense",
        icon: Calculator,
        label: "Record expense",
        category: "Quick Actions",
        shortcut: "Ctrl+E",
        action: "expense",
        type: "action",
    },
    {
        id: "invoice",
        icon: FileText,
        label: "Create invoice",
        category: "Quick Actions",
        shortcut: "Ctrl+I",
        action: "invoice",
        type: "action",
    },
    {
        id: "client",
        icon: Users,
        label: "Add new client",
        category: "Quick Actions",
        shortcut: "Ctrl+N",
        action: "client",
        type: "action",
    },
    // Transactions
    {
        id: "tx1",
        icon: CreditCard,
        label: "Office supplies - $245.50",
        category: "Transactions",
        date: "2024-01-15",
        amount: 245.5,
        client: "Acme Corp",
        type: "transaction",
    },
    {
        id: "tx2",
        icon: DollarSign,
        label: "Consulting payment - $2,500.00",
        category: "Transactions",
        date: "2024-01-14",
        amount: 2500.0,
        client: "TechStart Inc",
        type: "transaction",
    },
    {
        id: "tx3",
        icon: CreditCard,
        label: "Software subscription - $99.00",
        category: "Transactions",
        date: "2024-01-13",
        amount: 99.0,
        client: "Local Bakery",
        type: "transaction",
    },
    // Clients
    { id: "client1", icon: Building2, label: "Acme Corp", category: "Clients", type: "client", status: "active" },
    { id: "client2", icon: Building2, label: "TechStart Inc", category: "Clients", type: "client", status: "active" },
    { id: "client3", icon: Building2, label: "Local Bakery", category: "Clients", type: "client", status: "pending" },
    // Reports
    { id: "report1", icon: TrendingUp, label: "Profit & Loss Report", category: "Reports", type: "report" },
    { id: "report2", icon: FileText, label: "Balance Sheet", category: "Reports", type: "report" },
    { id: "report3", icon: Calculator, label: "Tax Summary", category: "Reports", type: "report" },
    // AI Suggestions
    {
        id: "ai1",
        icon: Lightbulb,
        label: "AI insights for Acme Corp",
        category: "AI Suggestions",
        action: "insights",
        type: "ai",
    },
    {
        id: "ai2",
        icon: Lightbulb,
        label: "Duplicate expense detected",
        category: "AI Suggestions",
        action: "duplicate",
        type: "ai",
    },
];
export function GlobalSearch() {
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState("");
    const [query, setQuery] = useState("");
    const [recentSearches, setRecentSearches] = useState([]);
    const [savedFilters, setSavedFilters] = useState([]);
    const [activeFilters, setActiveFilters] = useState({
        category: [],
        dateRange: "",
        amountRange: "",
        client: [],
    });
    const [showFilters, setShowFilters] = useState(false);
    const { setFocusedElement } = useKeyboardNavigation();
    const searchResults = useMemo(() => {
        if (!query.trim())
            return searchDatabase.slice(0, 10);
        const searchTerms = query.toLowerCase().split(" ");
        return searchDatabase
            .map((item) => {
            let score = 0;
            const itemText = `${item.label} ${item.category}`.toLowerCase();
            // Exact match bonus
            if (itemText.includes(query.toLowerCase()))
                score += 10;
            // Term matching
            searchTerms.forEach((term) => {
                if (itemText.includes(term))
                    score += 5;
                // Fuzzy matching for typos
                if (itemText.includes(term.slice(0, -1)) && term.length > 3)
                    score += 2;
            });
            // Category filtering
            if (activeFilters.category.length > 0 && !activeFilters.category.includes(item.category)) {
                score = 0;
            }
            // Client filtering
            if (activeFilters.client.length > 0 && item.client && !activeFilters.client.includes(item.client)) {
                score = 0;
            }
            // Amount filtering
            if (activeFilters.amountRange && item.amount) {
                const [min, max] = activeFilters.amountRange.split("-").map(Number);
                if (item.amount < min || item.amount > max)
                    score = 0;
            }
            return { ...item, score };
        })
            .filter((item) => item.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 20);
    }, [query, activeFilters]);
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "k") {
                e.preventDefault();
                setOpen(true);
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, []);
    const handleSelect = (selectedValue, action) => {
        setValue(selectedValue);
        setOpen(false);
        // Add to recent searches
        setRecentSearches((prev) => {
            const updated = [selectedValue, ...prev.filter((item) => item !== selectedValue)];
            return updated.slice(0, 5);
        });
        if (action) {
            console.log(`[v0] Executing action: ${action}`);
        }
    };
    const addFilter = (type, value) => {
        setActiveFilters((prev) => ({
            ...prev,
            [type]: Array.isArray(prev[type]) ? [...prev[type], value] : value,
        }));
    };
    const removeFilter = (type, value) => {
        setActiveFilters((prev) => ({
            ...prev,
            [type]: Array.isArray(prev[type]) ? prev[type].filter((v) => v !== value) : "",
        }));
    };
    const clearAllFilters = () => {
        setActiveFilters({
            category: [],
            dateRange: "",
            amountRange: "",
            client: [],
        });
    };
    const saveCurrentFilters = () => {
        const name = `Filter ${savedFilters.length + 1}`;
        setSavedFilters((prev) => [...prev, { name, filters: activeFilters }]);
    };
    const hasActiveFilters = Object.values(activeFilters).some((filter) => Array.isArray(filter) ? filter.length > 0 : filter !== "");
    return (_jsxs(Popover, { open: open, onOpenChange: setOpen, children: [_jsx(PopoverTrigger, { asChild: true, children: _jsxs(Button, { variant: "outline", role: "combobox", "aria-expanded": open, "aria-label": "Global search - Press Ctrl+K to open", "data-search-input": true, className: "w-80 justify-start text-muted-foreground hover:text-foreground hover:bg-muted hover:border-border relative", onFocus: () => setFocusedElement("global-search"), onBlur: () => setFocusedElement(null), children: [_jsx(Search, { className: "mr-2 h-4 w-4" }), "Search anything... (Ctrl+K)", hasActiveFilters && (_jsx(Badge, { variant: "secondary", className: "ml-auto text-xs", children: Object.values(activeFilters).flat().filter(Boolean).length }))] }) }), _jsx(PopoverContent, { className: "w-96 p-0", align: "start", children: _jsxs(Command, { shouldFilter: false, children: [_jsxs("div", { className: "flex items-center border-b border-border", children: [_jsx(CommandInput, { placeholder: "Search transactions, clients, reports...", "aria-label": "Search input", className: "flex-1 focus:ring-0 focus:border-transparent border-0", value: query, onValueChange: setQuery }), _jsxs(Button, { variant: "ghost", size: "sm", onClick: () => setShowFilters(!showFilters), className: "mr-2 gap-1", children: [_jsx(Filter, { className: "w-4 h-4" }), _jsx(ChevronDown, { className: `w-3 h-3 transition-transform ${showFilters ? "rotate-180" : ""}` })] })] }), showFilters && (_jsx("div", { className: "p-4 border-b border-border bg-muted/20", children: _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { children: [_jsx("label", { className: "text-xs font-medium text-muted-foreground", children: "Categories" }), _jsx("div", { className: "flex flex-wrap gap-1 mt-1", children: ["Transactions", "Clients", "Reports", "Quick Actions"].map((cat) => (_jsx(Button, { variant: activeFilters.category.includes(cat) ? "default" : "outline", size: "sm", className: "h-6 text-xs", onClick: () => activeFilters.category.includes(cat)
                                                        ? removeFilter("category", cat)
                                                        : addFilter("category", cat), children: cat }, cat))) })] }), _jsxs("div", { children: [_jsx("label", { className: "text-xs font-medium text-muted-foreground", children: "Amount Range" }), _jsx("div", { className: "flex gap-1 mt-1", children: ["0-100", "100-500", "500-1000", "1000+"].map((range) => (_jsxs(Button, { variant: activeFilters.amountRange === range ? "default" : "outline", size: "sm", className: "h-6 text-xs", onClick: () => activeFilters.amountRange === range
                                                        ? removeFilter("amountRange")
                                                        : setActiveFilters((prev) => ({ ...prev, amountRange: range })), children: ["$", range] }, range))) })] }), _jsxs("div", { className: "flex gap-2", children: [hasActiveFilters && (_jsx(Button, { variant: "outline", size: "sm", onClick: clearAllFilters, className: "h-6 text-xs bg-transparent", children: "Clear All" })), hasActiveFilters && (_jsx(Button, { variant: "outline", size: "sm", onClick: saveCurrentFilters, className: "h-6 text-xs bg-transparent", children: "Save Filter" }))] })] }) })), hasActiveFilters && (_jsx("div", { className: "p-2 border-b border-border", children: _jsxs("div", { className: "flex flex-wrap gap-1", children: [activeFilters.category.map((cat) => (_jsxs(Badge, { variant: "secondary", className: "text-xs gap-1", children: [cat, _jsx(X, { className: "w-3 h-3 cursor-pointer", onClick: () => removeFilter("category", cat) })] }, cat))), activeFilters.amountRange && (_jsxs(Badge, { variant: "secondary", className: "text-xs gap-1", children: ["$", activeFilters.amountRange, _jsx(X, { className: "w-3 h-3 cursor-pointer", onClick: () => removeFilter("amountRange") })] }))] }) })), _jsxs(CommandList, { children: [_jsx(CommandEmpty, { children: _jsxs("div", { className: "py-6 text-center text-sm text-muted-foreground", children: ["No results found for \"", query, "\"", _jsx("div", { className: "mt-2 text-xs", children: "Try adjusting your search terms or filters" })] }) }), savedFilters.length > 0 && query === "" && (_jsx(CommandGroup, { heading: "Saved Filters", children: savedFilters.map((filter, index) => (_jsx(CommandItem, { onSelect: () => setActiveFilters(filter.filters), className: "flex items-center justify-between focus:bg-muted focus:text-foreground", children: _jsxs("div", { className: "flex items-center", children: [_jsx(Filter, { className: "mr-2 h-4 w-4 text-muted-foreground" }), filter.name] }) }, `filter-${index}`))) })), recentSearches.length > 0 && query === "" && (_jsx(CommandGroup, { heading: "Recent Searches", children: recentSearches.map((search, index) => (_jsx(CommandItem, { value: search, onSelect: () => {
                                            setQuery(search);
                                            handleSelect(search);
                                        }, className: "flex items-center justify-between focus:bg-muted focus:text-foreground", children: _jsxs("div", { className: "flex items-center", children: [_jsx(Search, { className: "mr-2 h-4 w-4 text-muted-foreground" }), search] }) }, `recent-${index}`))) })), Object.entries(searchResults.reduce((acc, item) => {
                                    if (!acc[item.category])
                                        acc[item.category] = [];
                                    acc[item.category].push(item);
                                    return acc;
                                }, {})).map(([category, items]) => (_jsx(CommandGroup, { heading: category, children: items.map((item) => (_jsxs(CommandItem, { value: item.label, onSelect: () => handleSelect(item.label, item.action), className: "flex items-center justify-between focus:bg-muted focus:text-foreground cursor-pointer", role: "option", children: [_jsxs("div", { className: "flex items-center flex-1 min-w-0", children: [_jsx(item.icon, { className: "mr-2 h-4 w-4 text-muted-foreground flex-shrink-0" }), _jsx("span", { className: "truncate", children: item.label })] }), _jsxs("div", { className: "flex items-center gap-2 ml-2", children: [item.client && (_jsx(Badge, { variant: "outline", className: "text-xs", children: item.client })), item.shortcut && (_jsx("kbd", { className: "text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded font-mono", children: item.shortcut }))] })] }, item.id))) }, category)))] })] }) })] }));
}
