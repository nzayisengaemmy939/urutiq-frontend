import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Save, Bookmark, X, ChevronDown, ChevronUp, DollarSign, Target, Loader2, Trash2, Eye } from 'lucide-react';
export function AdvancedJournalSearch({ companyId, onSearchResults, onClose }) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    // State
    const [filters, setFilters] = useState({
        sortBy: 'date',
        sortOrder: 'desc'
    });
    const [showSaveDialog, setShowSaveDialog] = useState(false);
    const [saveData, setSaveData] = useState({
        name: '',
        description: '',
        isPublic: false
    });
    const [expandedSections, setExpandedSections] = useState({
        basic: true,
        advanced: false,
        amounts: false,
        metadata: false
    });
    const [suggestions, setSuggestions] = useState({});
    const [isSearching, setIsSearching] = useState(false);
    // Fetch saved searches
    const { data: savedSearchesResponse } = useQuery({
        queryKey: ['saved-journal-searches', companyId],
        queryFn: () => apiService.getSavedJournalSearches(true),
        enabled: !!companyId
    });
    const savedSearches = savedSearchesResponse?.data || [];
    // Fetch entry types and accounts for dropdowns
    const { data: entryTypesResponse } = useQuery({
        queryKey: ['journal-entry-types', companyId],
        queryFn: () => apiService.getJournalEntryTypes(companyId),
        enabled: !!companyId
    });
    const { data: accountsResponse } = useQuery({
        queryKey: ['accounts', companyId],
        queryFn: () => apiService.getAccounts(companyId),
        enabled: !!companyId
    });
    const entryTypes = entryTypesResponse?.entryTypes || [];
    const accounts = accountsResponse?.accounts || [];
    // Search mutation
    const searchMutation = useMutation({
        mutationFn: (searchParams) => apiService.searchJournalEntriesAdvanced(searchParams),
        onSuccess: (response) => {
            onSearchResults(response.data);
            toast({ title: "Search Complete", description: `Found ${response.data.entries.length} entries` });
        },
        onError: (error) => {
            toast({ title: "Search Error", description: error?.response?.data?.message || 'Search failed', variant: "destructive" });
        }
    });
    // Save search mutation
    const saveSearchMutation = useMutation({
        mutationFn: (data) => apiService.saveJournalSearch(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['saved-journal-searches'] });
            toast({ title: "Success", description: "Search saved successfully" });
            setShowSaveDialog(false);
            setSaveData({ name: '', description: '', isPublic: false });
        },
        onError: (error) => {
            toast({ title: "Error", description: error?.response?.data?.message || 'Failed to save search', variant: "destructive" });
        }
    });
    // Delete search mutation
    const deleteSearchMutation = useMutation({
        mutationFn: (id) => apiService.deleteJournalSearch(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['saved-journal-searches'] });
            toast({ title: "Success", description: "Search deleted successfully" });
        },
        onError: (error) => {
            toast({ title: "Error", description: error?.response?.data?.message || 'Failed to delete search', variant: "destructive" });
        }
    });
    // Handlers
    const handleSearch = () => {
        setIsSearching(true);
        searchMutation.mutate({
            companyId,
            ...filters
        });
    };
    const handleSaveSearch = () => {
        if (!saveData.name.trim()) {
            toast({ title: "Error", description: "Search name is required", variant: "destructive" });
            return;
        }
        saveSearchMutation.mutate({
            ...saveData,
            filters
        });
    };
    const handleLoadSavedSearch = (savedSearch) => {
        setFilters(savedSearch.filters);
        toast({ title: "Search Loaded", description: `Loaded "${savedSearch.name}"` });
    };
    const handleDeleteSavedSearch = (id) => {
        if (confirm('Are you sure you want to delete this saved search?')) {
            deleteSearchMutation.mutate(id);
        }
    };
    const handleClearFilters = () => {
        setFilters({
            sortBy: 'date',
            sortOrder: 'desc'
        });
    };
    const handleSuggestionRequest = async (field, query) => {
        if (query.length < 2)
            return;
        try {
            const response = await apiService.getJournalSearchSuggestions(field, query);
            setSuggestions(prev => ({
                ...prev,
                [field]: response.data
            }));
        }
        catch (error) {
            // Silently fail for suggestions
        }
    };
    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };
    const updateFilter = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center space-x-2", children: [_jsx(Search, { className: "w-5 h-5" }), _jsx("span", { children: "Advanced Search" })] }), _jsx(CardDescription, { children: "Use multiple filters to find specific journal entries" })] }), _jsxs(CardContent, { className: "space-y-6", children: [_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("h4", { className: "font-medium flex items-center space-x-2", children: [_jsx(Search, { className: "w-4 h-4" }), _jsx("span", { children: "Basic Search" })] }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => toggleSection('basic'), children: expandedSections.basic ? _jsx(ChevronUp, { className: "w-4 h-4" }) : _jsx(ChevronDown, { className: "w-4 h-4" }) })] }), expandedSections.basic && (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "searchTerm", children: "Search Term" }), _jsx(Input, { id: "searchTerm", placeholder: "Search references, memos...", value: filters.searchTerm || '', onChange: (e) => updateFilter('searchTerm', e.target.value) })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "reference", children: "Reference" }), _jsx(Input, { id: "reference", placeholder: "Specific reference...", value: filters.reference || '', onChange: (e) => {
                                                            updateFilter('reference', e.target.value);
                                                            handleSuggestionRequest('reference', e.target.value);
                                                        } }), suggestions.reference && suggestions.reference.length > 0 && (_jsx("div", { className: "mt-1 space-y-1", children: suggestions.reference.slice(0, 5).map((suggestion, index) => (_jsx("div", { className: "text-xs text-gray-600 cursor-pointer hover:bg-gray-100 p-1 rounded", onClick: () => updateFilter('reference', suggestion), children: suggestion }, index))) }))] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "memo", children: "Memo" }), _jsx(Input, { id: "memo", placeholder: "Memo text...", value: filters.memo || '', onChange: (e) => {
                                                            updateFilter('memo', e.target.value);
                                                            handleSuggestionRequest('memo', e.target.value);
                                                        } }), suggestions.memo && suggestions.memo.length > 0 && (_jsx("div", { className: "mt-1 space-y-1", children: suggestions.memo.slice(0, 5).map((suggestion, index) => (_jsx("div", { className: "text-xs text-gray-600 cursor-pointer hover:bg-gray-100 p-1 rounded", onClick: () => updateFilter('memo', suggestion), children: suggestion }, index))) }))] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "status", children: "Status" }), _jsxs(Select, { value: filters.status || 'all', onValueChange: (value) => updateFilter('status', value === 'all' ? undefined : value), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All Status" }), _jsx(SelectItem, { value: "DRAFT", children: "Draft" }), _jsx(SelectItem, { value: "POSTED", children: "Posted" }), _jsx(SelectItem, { value: "REVERSED", children: "Reversed" }), _jsx(SelectItem, { value: "PENDING_APPROVAL", children: "Pending Approval" })] })] })] })] }))] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("h4", { className: "font-medium flex items-center space-x-2", children: [_jsx(Filter, { className: "w-4 h-4" }), _jsx("span", { children: "Advanced Filters" })] }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => toggleSection('advanced'), children: expandedSections.advanced ? _jsx(ChevronUp, { className: "w-4 h-4" }) : _jsx(ChevronDown, { className: "w-4 h-4" }) })] }), expandedSections.advanced && (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "dateFrom", children: "Date From" }), _jsx(Input, { id: "dateFrom", type: "date", value: filters.dateFrom || '', onChange: (e) => updateFilter('dateFrom', e.target.value) })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "dateTo", children: "Date To" }), _jsx(Input, { id: "dateTo", type: "date", value: filters.dateTo || '', onChange: (e) => updateFilter('dateTo', e.target.value) })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "entryType", children: "Entry Type" }), _jsxs(Select, { value: filters.entryType || 'all', onValueChange: (value) => updateFilter('entryType', value === 'all' ? undefined : value), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All Types" }), entryTypes.map((type) => (_jsx(SelectItem, { value: type.id, children: type.name }, type.id)))] })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "accountId", children: "Account" }), _jsxs(Select, { value: filters.accountId || 'all', onValueChange: (value) => updateFilter('accountId', value === 'all' ? undefined : value), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All Accounts" }), accounts.map((account) => (_jsxs(SelectItem, { value: account.id, children: [account.name, " (", account.type, ")"] }, account.id)))] })] })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "isBalanced", checked: filters.isBalanced === true, onCheckedChange: (checked) => updateFilter('isBalanced', checked ? true : undefined) }), _jsx(Label, { htmlFor: "isBalanced", children: "Only Balanced Entries" })] })] }))] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("h4", { className: "font-medium flex items-center space-x-2", children: [_jsx(DollarSign, { className: "w-4 h-4" }), _jsx("span", { children: "Amount Filters" })] }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => toggleSection('amounts'), children: expandedSections.amounts ? _jsx(ChevronUp, { className: "w-4 h-4" }) : _jsx(ChevronDown, { className: "w-4 h-4" }) })] }), expandedSections.amounts && (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "amountMin", children: "Minimum Amount" }), _jsx(Input, { id: "amountMin", type: "number", step: "0.01", placeholder: "0.00", value: filters.amountMin || '', onChange: (e) => updateFilter('amountMin', e.target.value ? parseFloat(e.target.value) : undefined) })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "amountMax", children: "Maximum Amount" }), _jsx(Input, { id: "amountMax", type: "number", step: "0.01", placeholder: "0.00", value: filters.amountMax || '', onChange: (e) => updateFilter('amountMax', e.target.value ? parseFloat(e.target.value) : undefined) })] })] }))] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("h4", { className: "font-medium flex items-center space-x-2", children: [_jsx(Target, { className: "w-4 h-4" }), _jsx("span", { children: "Metadata Filters" })] }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => toggleSection('metadata'), children: expandedSections.metadata ? _jsx(ChevronUp, { className: "w-4 h-4" }) : _jsx(ChevronDown, { className: "w-4 h-4" }) })] }), expandedSections.metadata && (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "department", children: "Department" }), _jsx(Input, { id: "department", placeholder: "Department name...", value: filters.department || '', onChange: (e) => {
                                                            updateFilter('department', e.target.value);
                                                            handleSuggestionRequest('department', e.target.value);
                                                        } }), suggestions.department && suggestions.department.length > 0 && (_jsx("div", { className: "mt-1 space-y-1", children: suggestions.department.slice(0, 5).map((suggestion, index) => (_jsx("div", { className: "text-xs text-gray-600 cursor-pointer hover:bg-gray-100 p-1 rounded", onClick: () => updateFilter('department', suggestion), children: suggestion }, index))) }))] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "project", children: "Project" }), _jsx(Input, { id: "project", placeholder: "Project name...", value: filters.project || '', onChange: (e) => {
                                                            updateFilter('project', e.target.value);
                                                            handleSuggestionRequest('project', e.target.value);
                                                        } }), suggestions.project && suggestions.project.length > 0 && (_jsx("div", { className: "mt-1 space-y-1", children: suggestions.project.slice(0, 5).map((suggestion, index) => (_jsx("div", { className: "text-xs text-gray-600 cursor-pointer hover:bg-gray-100 p-1 rounded", onClick: () => updateFilter('project', suggestion), children: suggestion }, index))) }))] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "location", children: "Location" }), _jsx(Input, { id: "location", placeholder: "Location name...", value: filters.location || '', onChange: (e) => {
                                                            updateFilter('location', e.target.value);
                                                            handleSuggestionRequest('location', e.target.value);
                                                        } }), suggestions.location && suggestions.location.length > 0 && (_jsx("div", { className: "mt-1 space-y-1", children: suggestions.location.slice(0, 5).map((suggestion, index) => (_jsx("div", { className: "text-xs text-gray-600 cursor-pointer hover:bg-gray-100 p-1 rounded", onClick: () => updateFilter('location', suggestion), children: suggestion }, index))) }))] })] }))] }), _jsxs("div", { className: "space-y-4", children: [_jsx("h4", { className: "font-medium", children: "Sort Options" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "sortBy", children: "Sort By" }), _jsxs(Select, { value: filters.sortBy || 'date', onValueChange: (value) => updateFilter('sortBy', value), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "date", children: "Date" }), _jsx(SelectItem, { value: "reference", children: "Reference" }), _jsx(SelectItem, { value: "amount", children: "Amount" }), _jsx(SelectItem, { value: "status", children: "Status" }), _jsx(SelectItem, { value: "created", children: "Created Date" })] })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "sortOrder", children: "Sort Order" }), _jsxs(Select, { value: filters.sortOrder || 'desc', onValueChange: (value) => updateFilter('sortOrder', value), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "asc", children: "Ascending" }), _jsx(SelectItem, { value: "desc", children: "Descending" })] })] })] })] })] }), _jsxs("div", { className: "flex flex-wrap gap-2", children: [_jsx(Button, { onClick: handleSearch, disabled: isSearching, className: "flex-1", children: isSearching ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "w-4 h-4 mr-2 animate-spin" }), "Searching..."] })) : (_jsxs(_Fragment, { children: [_jsx(Search, { className: "w-4 h-4 mr-2" }), "Search"] })) }), _jsxs(Button, { variant: "outline", onClick: handleClearFilters, children: [_jsx(X, { className: "w-4 h-4 mr-2" }), "Clear"] }), _jsx(Dialog, { open: showSaveDialog, onOpenChange: setShowSaveDialog, children: _jsx(DialogTrigger, { asChild: true, children: _jsxs(Button, { variant: "outline", children: [_jsx(Save, { className: "w-4 h-4 mr-2" }), "Save Search"] }) }) }), _jsx(Button, { variant: "outline", onClick: onClose, children: "Close" })] })] })] }), savedSearches.length > 0 && (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center space-x-2", children: [_jsx(Bookmark, { className: "w-5 h-5" }), _jsx("span", { children: "Saved Searches" })] }), _jsx(CardDescription, { children: "Load previously saved search queries" })] }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-2", children: savedSearches.map((search) => (_jsxs("div", { className: "flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("h4", { className: "font-medium", children: search.name }), search.isPublic && (_jsxs(Badge, { variant: "secondary", className: "text-xs", children: [_jsx(Eye, { className: "w-3 h-3 mr-1" }), "Public"] }))] }), search.description && (_jsx("p", { className: "text-sm text-gray-600 mt-1", children: search.description })), _jsxs("p", { className: "text-xs text-gray-500 mt-1", children: ["Created by ", search.createdBy.name, " \u2022 ", new Date(search.createdAt).toLocaleDateString()] })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsxs(Button, { variant: "outline", size: "sm", onClick: () => handleLoadSavedSearch(search), children: [_jsx(Search, { className: "w-4 h-4 mr-1" }), "Load"] }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => handleDeleteSavedSearch(search.id), children: _jsx(Trash2, { className: "w-4 h-4" }) })] })] }, search.id))) }) })] })), _jsx(Dialog, { open: showSaveDialog, onOpenChange: setShowSaveDialog, children: _jsxs(DialogContent, { children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Save Search" }), _jsx(DialogDescription, { children: "Save your current search filters for future use" })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "searchName", children: "Search Name" }), _jsx(Input, { id: "searchName", placeholder: "Enter a name for this search...", value: saveData.name, onChange: (e) => setSaveData(prev => ({ ...prev, name: e.target.value })) })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "searchDescription", children: "Description (Optional)" }), _jsx(Textarea, { id: "searchDescription", placeholder: "Describe this search...", value: saveData.description, onChange: (e) => setSaveData(prev => ({ ...prev, description: e.target.value })), rows: 3 })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "isPublic", checked: saveData.isPublic, onCheckedChange: (checked) => setSaveData(prev => ({ ...prev, isPublic: !!checked })) }), _jsx(Label, { htmlFor: "isPublic", children: "Make this search public" })] }), _jsxs("div", { className: "flex justify-end space-x-2", children: [_jsx(Button, { variant: "outline", onClick: () => setShowSaveDialog(false), children: "Cancel" }), _jsx(Button, { onClick: handleSaveSearch, disabled: saveSearchMutation.isPending, children: saveSearchMutation.isPending ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "w-4 h-4 mr-2 animate-spin" }), "Saving..."] })) : (_jsxs(_Fragment, { children: [_jsx(Save, { className: "w-4 h-4 mr-2" }), "Save Search"] })) })] })] })] }) })] }));
}
