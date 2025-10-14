import React, { useState, useEffect } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Search, 
  Filter, 
  Save, 
  Bookmark, 
  X, 
  ChevronDown, 
  ChevronUp,
  Calendar,
  DollarSign,
  User,
  Building,
  MapPin,
  Folder,
  Target,
  Loader2,
  Plus,
  Edit,
  Trash2,
  Star,
  Eye
} from 'lucide-react';

interface AdvancedSearchProps {
  companyId: string;
  onSearchResults: (results: any) => void;
  onClose: () => void;
}

interface SearchFilters {
  searchTerm?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  entryType?: string;
  accountId?: string;
  amountMin?: number;
  amountMax?: number;
  reference?: string;
  memo?: string;
  createdById?: string;
  department?: string;
  project?: string;
  location?: string;
  isBalanced?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface SavedSearch {
  id: string;
  name: string;
  description?: string;
  filters: SearchFilters;
  isPublic: boolean;
  createdBy: {
    name: string;
    email: string;
  };
  createdAt: string;
}

export function AdvancedJournalSearch({ companyId, onSearchResults, onClose }: AdvancedSearchProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State
  const [filters, setFilters] = useState<SearchFilters>({
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
  const [suggestions, setSuggestions] = useState<Record<string, string[]>>({});
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
    mutationFn: (searchParams: any) => apiService.searchJournalEntriesAdvanced(searchParams),
    onSuccess: (response) => {
      onSearchResults(response.data);
      toast({ title: "Search Complete", description: `Found ${response.data.entries.length} entries` });
    },
    onError: (error: any) => {
      toast({ title: "Search Error", description: error?.response?.data?.message || 'Search failed', variant: "destructive" });
    }
  });

  // Save search mutation
  const saveSearchMutation = useMutation({
    mutationFn: (data: any) => apiService.saveJournalSearch(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-journal-searches'] });
      toast({ title: "Success", description: "Search saved successfully" });
      setShowSaveDialog(false);
      setSaveData({ name: '', description: '', isPublic: false });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error?.response?.data?.message || 'Failed to save search', variant: "destructive" });
    }
  });

  // Delete search mutation
  const deleteSearchMutation = useMutation({
    mutationFn: (id: string) => apiService.deleteJournalSearch(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-journal-searches'] });
      toast({ title: "Success", description: "Search deleted successfully" });
    },
    onError: (error: any) => {
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

  const handleLoadSavedSearch = (savedSearch: SavedSearch) => {
    setFilters(savedSearch.filters);
    toast({ title: "Search Loaded", description: `Loaded "${savedSearch.name}"` });
  };

  const handleDeleteSavedSearch = (id: string) => {
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

  const handleSuggestionRequest = async (field: string, query: string) => {
    if (query.length < 2) return;

    try {
      const response = await apiService.getJournalSearchSuggestions(field, query);
      setSuggestions(prev => ({
        ...prev,
        [field]: response.data
      }));
    } catch (error) {
      // Silently fail for suggestions
    }
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="w-5 h-5" />
            <span>Advanced Search</span>
          </CardTitle>
          <CardDescription>
            Use multiple filters to find specific journal entries
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Search */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium flex items-center space-x-2">
                <Search className="w-4 h-4" />
                <span>Basic Search</span>
              </h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleSection('basic')}
              >
                {expandedSections.basic ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            </div>

            {expandedSections.basic && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="searchTerm">Search Term</Label>
                  <Input
                    id="searchTerm"
                    placeholder="Search references, memos..."
                    value={filters.searchTerm || ''}
                    onChange={(e) => updateFilter('searchTerm', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="reference">Reference</Label>
                  <Input
                    id="reference"
                    placeholder="Specific reference..."
                    value={filters.reference || ''}
                    onChange={(e) => {
                      updateFilter('reference', e.target.value);
                      handleSuggestionRequest('reference', e.target.value);
                    }}
                  />
                  {suggestions.reference && suggestions.reference.length > 0 && (
                    <div className="mt-1 space-y-1">
                      {suggestions.reference.slice(0, 5).map((suggestion, index) => (
                        <div
                          key={index}
                          className="text-xs text-gray-600 cursor-pointer hover:bg-gray-100 p-1 rounded"
                          onClick={() => updateFilter('reference', suggestion)}
                        >
                          {suggestion}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="memo">Memo</Label>
                  <Input
                    id="memo"
                    placeholder="Memo text..."
                    value={filters.memo || ''}
                    onChange={(e) => {
                      updateFilter('memo', e.target.value);
                      handleSuggestionRequest('memo', e.target.value);
                    }}
                  />
                  {suggestions.memo && suggestions.memo.length > 0 && (
                    <div className="mt-1 space-y-1">
                      {suggestions.memo.slice(0, 5).map((suggestion, index) => (
                        <div
                          key={index}
                          className="text-xs text-gray-600 cursor-pointer hover:bg-gray-100 p-1 rounded"
                          onClick={() => updateFilter('memo', suggestion)}
                        >
                          {suggestion}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={filters.status || 'all'}
                    onValueChange={(value) => updateFilter('status', value === 'all' ? undefined : value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="DRAFT">Draft</SelectItem>
                      <SelectItem value="POSTED">Posted</SelectItem>
                      <SelectItem value="REVERSED">Reversed</SelectItem>
                      <SelectItem value="PENDING_APPROVAL">Pending Approval</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>

          {/* Advanced Filters */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium flex items-center space-x-2">
                <Filter className="w-4 h-4" />
                <span>Advanced Filters</span>
              </h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleSection('advanced')}
              >
                {expandedSections.advanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            </div>

            {expandedSections.advanced && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dateFrom">Date From</Label>
                  <Input
                    id="dateFrom"
                    type="date"
                    value={filters.dateFrom || ''}
                    onChange={(e) => updateFilter('dateFrom', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="dateTo">Date To</Label>
                  <Input
                    id="dateTo"
                    type="date"
                    value={filters.dateTo || ''}
                    onChange={(e) => updateFilter('dateTo', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="entryType">Entry Type</Label>
                  <Select
                    value={filters.entryType || 'all'}
                    onValueChange={(value) => updateFilter('entryType', value === 'all' ? undefined : value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {entryTypes.map((type: any) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="accountId">Account</Label>
                  <Select
                    value={filters.accountId || 'all'}
                    onValueChange={(value) => updateFilter('accountId', value === 'all' ? undefined : value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Accounts</SelectItem>
                      {accounts.map((account: any) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name} ({account.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isBalanced"
                    checked={filters.isBalanced === true}
                    onCheckedChange={(checked) => updateFilter('isBalanced', checked ? true : undefined)}
                  />
                  <Label htmlFor="isBalanced">Only Balanced Entries</Label>
                </div>
              </div>
            )}
          </div>

          {/* Amount Filters */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium flex items-center space-x-2">
                <DollarSign className="w-4 h-4" />
                <span>Amount Filters</span>
              </h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleSection('amounts')}
              >
                {expandedSections.amounts ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            </div>

            {expandedSections.amounts && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="amountMin">Minimum Amount</Label>
                  <Input
                    id="amountMin"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={filters.amountMin || ''}
                    onChange={(e) => updateFilter('amountMin', e.target.value ? parseFloat(e.target.value) : undefined)}
                  />
                </div>

                <div>
                  <Label htmlFor="amountMax">Maximum Amount</Label>
                  <Input
                    id="amountMax"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={filters.amountMax || ''}
                    onChange={(e) => updateFilter('amountMax', e.target.value ? parseFloat(e.target.value) : undefined)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Metadata Filters */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium flex items-center space-x-2">
                <Target className="w-4 h-4" />
                <span>Metadata Filters</span>
              </h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleSection('metadata')}
              >
                {expandedSections.metadata ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            </div>

            {expandedSections.metadata && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    placeholder="Department name..."
                    value={filters.department || ''}
                    onChange={(e) => {
                      updateFilter('department', e.target.value);
                      handleSuggestionRequest('department', e.target.value);
                    }}
                  />
                  {suggestions.department && suggestions.department.length > 0 && (
                    <div className="mt-1 space-y-1">
                      {suggestions.department.slice(0, 5).map((suggestion, index) => (
                        <div
                          key={index}
                          className="text-xs text-gray-600 cursor-pointer hover:bg-gray-100 p-1 rounded"
                          onClick={() => updateFilter('department', suggestion)}
                        >
                          {suggestion}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="project">Project</Label>
                  <Input
                    id="project"
                    placeholder="Project name..."
                    value={filters.project || ''}
                    onChange={(e) => {
                      updateFilter('project', e.target.value);
                      handleSuggestionRequest('project', e.target.value);
                    }}
                  />
                  {suggestions.project && suggestions.project.length > 0 && (
                    <div className="mt-1 space-y-1">
                      {suggestions.project.slice(0, 5).map((suggestion, index) => (
                        <div
                          key={index}
                          className="text-xs text-gray-600 cursor-pointer hover:bg-gray-100 p-1 rounded"
                          onClick={() => updateFilter('project', suggestion)}
                        >
                          {suggestion}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="Location name..."
                    value={filters.location || ''}
                    onChange={(e) => {
                      updateFilter('location', e.target.value);
                      handleSuggestionRequest('location', e.target.value);
                    }}
                  />
                  {suggestions.location && suggestions.location.length > 0 && (
                    <div className="mt-1 space-y-1">
                      {suggestions.location.slice(0, 5).map((suggestion, index) => (
                        <div
                          key={index}
                          className="text-xs text-gray-600 cursor-pointer hover:bg-gray-100 p-1 rounded"
                          onClick={() => updateFilter('location', suggestion)}
                        >
                          {suggestion}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sort Options */}
          <div className="space-y-4">
            <h4 className="font-medium">Sort Options</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sortBy">Sort By</Label>
                <Select
                  value={filters.sortBy || 'date'}
                  onValueChange={(value) => updateFilter('sortBy', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="reference">Reference</SelectItem>
                    <SelectItem value="amount">Amount</SelectItem>
                    <SelectItem value="status">Status</SelectItem>
                    <SelectItem value="created">Created Date</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="sortOrder">Sort Order</Label>
                <Select
                  value={filters.sortOrder || 'desc'}
                  onValueChange={(value: 'asc' | 'desc') => updateFilter('sortOrder', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">Ascending</SelectItem>
                    <SelectItem value="desc">Descending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleSearch}
              disabled={isSearching}
              className="flex-1"
            >
              {isSearching ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={handleClearFilters}
            >
              <X className="w-4 h-4 mr-2" />
              Clear
            </Button>

            <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Save className="w-4 h-4 mr-2" />
                  Save Search
                </Button>
              </DialogTrigger>
            </Dialog>

            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Saved Searches */}
      {savedSearches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bookmark className="w-5 h-5" />
              <span>Saved Searches</span>
            </CardTitle>
            <CardDescription>
              Load previously saved search queries
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {savedSearches.map((search: SavedSearch) => (
                <div
                  key={search.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium">{search.name}</h4>
                      {search.isPublic && (
                        <Badge variant="secondary" className="text-xs">
                          <Eye className="w-3 h-3 mr-1" />
                          Public
                        </Badge>
                      )}
                    </div>
                    {search.description && (
                      <p className="text-sm text-gray-600 mt-1">{search.description}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Created by {search.createdBy.name} • {new Date(search.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleLoadSavedSearch(search)}
                    >
                      <Search className="w-4 h-4 mr-1" />
                      Load
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteSavedSearch(search.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Save Search Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Search</DialogTitle>
            <DialogDescription>
              Save your current search filters for future use
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="searchName">Search Name</Label>
              <Input
                id="searchName"
                placeholder="Enter a name for this search..."
                value={saveData.name}
                onChange={(e) => setSaveData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="searchDescription">Description (Optional)</Label>
              <Textarea
                id="searchDescription"
                placeholder="Describe this search..."
                value={saveData.description}
                onChange={(e) => setSaveData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isPublic"
                checked={saveData.isPublic}
                onCheckedChange={(checked) => setSaveData(prev => ({ ...prev, isPublic: !!checked }))}
              />
              <Label htmlFor="isPublic">Make this search public</Label>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSaveSearch}
                disabled={saveSearchMutation.isPending}
              >
                {saveSearchMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Search
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
