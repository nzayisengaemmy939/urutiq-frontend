import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { 
  BookOpen, 
  Plus, 
  Eye, 
  Edit, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  TrendingUp,
  BarChart3,
  FileText,
  Zap,
  RefreshCw,
  ExternalLink,
  Brain,
  Calculator,
  Target,
  Activity,
  Save,
  Send,
  Copy,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Check,
  X
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '../lib/api';
import { useAuth } from '../contexts/auth-context';
import { getCompanyId } from '../lib/config';
import { useToast } from '../hooks/use-toast';

interface UnifiedJournalWorkflowProps {
  companyId?: string;
  onSuccess?: (entry: any) => void;
  onCancel?: () => void;
  initialData?: any;
  mode?: 'create' | 'edit' | 'duplicate';
}

interface JournalEntryForm {
  date: string;
  reference: string;
  memo?: string;
  entryTypeId?: string;
  lines: JournalLine[];
}

interface JournalLine {
  id?: string;
  accountId: string;
  debit: number;
  credit: number;
  memo?: string;
  department?: string;
  project?: string;
  location?: string;
}

interface Account {
  id: string;
  name: string;
  code: string;
  type: string | { id: string; name: string; [key: string]: any };
  category: string | { id: string; name: string; [key: string]: any };
}

export function UnifiedJournalWorkflow({ 
  companyId, 
  onSuccess,
  onCancel,
  initialData,
  mode = 'create'
}: UnifiedJournalWorkflowProps) {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const currentCompanyId = companyId || getCompanyId();
  
  const [formData, setFormData] = useState<JournalEntryForm>({
    date: new Date().toISOString().split('T')[0],
    reference: '',
    memo: '',
    entryTypeId: '',
    lines: [
      { accountId: '', debit: 0, credit: 0, memo: '' }
    ]
  });
  const [isBalanced, setIsBalanced] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Fetch accounts
  const { data: accountsResponse, isLoading: accountsLoading } = useQuery({
    queryKey: ['accounts', currentCompanyId],
    queryFn: () => apiService.getAccounts(currentCompanyId),
    enabled: !!currentCompanyId && isAuthenticated
  });

  const accounts = accountsResponse?.accounts || [];

  // Fetch entry types
  const { data: entryTypesResponse, isLoading: entryTypesLoading } = useQuery({
    queryKey: ['journal-entry-types', currentCompanyId],
    queryFn: () => apiService.getJournalEntryTypes({ companyId: currentCompanyId }),
    enabled: !!currentCompanyId && isAuthenticated
  });

  const entryTypes = entryTypesResponse?.entryTypes || [];

  // Fetch templates
  const { data: templatesResponse, isLoading: templatesLoading } = useQuery({
    queryKey: ['journal-templates', currentCompanyId],
    queryFn: () => apiService.getJournalTemplates({ companyId: currentCompanyId }),
    enabled: !!currentCompanyId && isAuthenticated
  });

  const templates = templatesResponse?.templates || [];

  // Initialize form data
  useEffect(() => {
    if (initialData) {
      setFormData({
        date: initialData.date || new Date().toISOString().split('T')[0],
        reference: initialData.reference || '',
        memo: initialData.memo || '',
        entryTypeId: initialData.entryTypeId || '',
        lines: initialData.lines || [{ accountId: '', debit: 0, credit: 0, memo: '' }]
      });
    }
  }, [initialData]);

  // Check if journal entry is balanced
  useEffect(() => {
    const totalDebit = formData.lines.reduce((sum, line) => {
      const debit = Number(line.debit) || 0;
      return sum + (isNaN(debit) ? 0 : debit);
    }, 0);
    const totalCredit = formData.lines.reduce((sum, line) => {
      const credit = Number(line.credit) || 0;
      return sum + (isNaN(credit) ? 0 : credit);
    }, 0);
    const balanced = Math.abs(totalDebit - totalCredit) < 0.01;
    setIsBalanced(balanced);
  }, [formData.lines]);

  // Validate form
  const validateForm = () => {
    const errors: string[] = [];
    
    if (!formData.date) errors.push('Date is required');
    if (!isBalanced) errors.push('Journal entry must be balanced (debits = credits)');
    
    const hasEmptyLines = formData.lines.some(line => !line.accountId || (line.debit === 0 && line.credit === 0));
    if (hasEmptyLines) errors.push('All lines must have an account and either debit or credit amount');
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  // Create/Update journal entry mutation
  const createEntryMutation = useMutation({
    mutationFn: (data: any) => {
      if (mode === 'edit' && initialData?.id) {
        return apiService.updateJournalEntry(initialData.id, data);
      }
      return apiService.createJournalEntry(data);
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: `Journal entry ${mode === 'edit' ? 'updated' : 'created'} successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
      queryClient.invalidateQueries({ queryKey: ['journal-hub-summary'] });
      if (onSuccess) onSuccess(data);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.response?.data?.error || 'Failed to save journal entry',
        variant: "destructive",
      });
    }
  });

  // Post journal entry mutation
  const postEntryMutation = useMutation({
    mutationFn: (entryId: string) => apiService.postJournalEntry(entryId),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Journal entry posted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
      queryClient.invalidateQueries({ queryKey: ['journal-hub-summary'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.response?.data?.error || 'Failed to post journal entry',
        variant: "destructive",
      });
    }
  });

  const handleSave = async () => {
    if (!validateForm()) return;
    
    const entryData = {
      ...formData,
      companyId: currentCompanyId,
      status: 'DRAFT'
    };
    
    createEntryMutation.mutate(entryData);
  };

  const handleSaveAndPost = async () => {
    if (!validateForm()) return;
    
    const entryData = {
      ...formData,
      companyId: currentCompanyId,
      status: 'POSTED'
    };
    
    createEntryMutation.mutate(entryData);
  };

  const handleAddLine = () => {
    setFormData(prev => ({
      ...prev,
      lines: [...prev.lines, { accountId: '', debit: 0, credit: 0, memo: '' }]
    }));
  };

  const handleRemoveLine = (index: number) => {
    if (formData.lines.length > 1) {
      setFormData(prev => ({
        ...prev,
        lines: prev.lines.filter((_, i) => i !== index)
      }));
    }
  };

  const handleLineChange = (index: number, field: keyof JournalLine, value: any) => {
    setFormData(prev => ({
      ...prev,
      lines: prev.lines.map((line, i) => 
        i === index ? { ...line, [field]: value } : line
      )
    }));
  };

  const handleUseTemplate = (template: any) => {
    if (template.lines && template.lines.length > 0) {
      setFormData(prev => ({
        ...prev,
        entryTypeId: template.entryTypeId,
        lines: template.lines.map((line: any) => ({
          accountId: line.accountId,
          debit: line.debitFormula ? 0 : line.debit || 0,
          credit: line.creditFormula ? 0 : line.credit || 0,
          memo: line.memo || '',
          department: line.department || '',
          project: line.project || '',
          location: line.location || ''
        }))
      }));
      
      // Show success toast
      toast({
        title: "Template Applied",
        description: `"${template.name}" has been applied successfully`,
      });
    }
  };

  const totalDebit = formData.lines.reduce((sum, line) => {
    const debit = Number(line.debit) || 0;
    return sum + (isNaN(debit) ? 0 : debit);
  }, 0);
  const totalCredit = formData.lines.reduce((sum, line) => {
    const credit = Number(line.credit) || 0;
    return sum + (isNaN(credit) ? 0 : credit);
  }, 0);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Sticky Header with Balance Info - Industry Standard Pattern */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 pb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {mode === 'edit' ? 'Edit Journal Entry' : mode === 'duplicate' ? 'Duplicate Journal Entry' : 'New Journal Entry'}
              </h2>
              <p className="text-sm text-gray-500">Record manual accounting transactions</p>
            </div>
          </div>
          
          {/* Real-time Balance Display - QuickBooks Style */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs text-gray-500 mb-1">DIFFERENCE</div>
              <div className={`text-lg font-bold ${isBalanced ? 'text-green-600' : 'text-red-600'}`}>
                ${Math.abs(totalDebit - totalCredit).toFixed(2)}
              </div>
            </div>
            <div className="w-px h-10 bg-gray-300"></div>
            <div className="text-right">
              <div className="text-xs text-gray-500 mb-1">DEBITS</div>
              <div className="text-lg font-semibold text-gray-900">${(totalDebit || 0).toFixed(2)}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500 mb-1">CREDITS</div>
              <div className="text-lg font-semibold text-gray-900">${(totalCredit || 0).toFixed(2)}</div>
            </div>
            {isBalanced ? (
              <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-700">Balanced</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span className="text-sm font-medium text-red-700">Out of Balance</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Form - NetSuite/Xero Style Single Page Layout */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column - Entry Details */}
        <div className="col-span-12 lg:col-span-4 space-y-4">
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Entry Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="date" className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
                  Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="reference" className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
                  Journal # (optional)
                </Label>
                <Input
                  id="reference"
                  value={formData.reference}
                  onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))}
                  placeholder="e.g., JE-2025-001"
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">Auto-generated if left blank</p>
              </div>
              
              <div>
                <Label htmlFor="entryType" className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
                  Entry Type
                </Label>
                <Select 
                  value={formData.entryTypeId} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, entryTypeId: value }))}
                >
                  <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 mt-1">
                    <SelectValue placeholder="Select type..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__placeholder__" disabled>
                      <span className="text-gray-500">No type selected</span>
                    </SelectItem>
                    {entryTypes.map((type: any) => (
                      <SelectItem key={type.id} value={type.id}>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          {type.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="memo" className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
                  Description / Memo
                </Label>
                <Textarea
                  id="memo"
                  value={formData.memo}
                  onChange={(e) => setFormData(prev => ({ ...prev, memo: e.target.value }))}
                  placeholder="Enter a description for this journal entry..."
                  rows={4}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 resize-none mt-1"
                />
              </div>
            </CardContent>
          </Card>

          {/* Quick Templates - Sidebar Widget */}
          {templates.length > 0 && (
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  Quick Templates
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {templatesLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <RefreshCw className="w-4 h-4 animate-spin text-gray-400" />
                  </div>
                ) : (
                  templates.slice(0, 5).map((template: any) => (
                    <button
                      key={template.id}
                      onClick={() => handleUseTemplate(template)}
                      className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-colors group"
                    >
                      <div className="font-medium text-sm text-gray-900 group-hover:text-blue-600">
                        {template.name}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {template.lines?.length || 0} line items
                      </div>
                    </button>
                  ))
                )}
                {templates.length > 5 && (
                  <button className="w-full text-center text-xs text-blue-600 hover:text-blue-700 font-medium py-2">
                    View all templates →
                  </button>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Line Items Table */}
        <div className="col-span-12 lg:col-span-8">
          <Card className="shadow-sm">
            <CardHeader className="pb-3 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">Line Items</CardTitle>
                <Button 
                  onClick={handleAddLine} 
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Line
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {/* Table Header - Xero/NetSuite Style */}
              <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-700 uppercase tracking-wide">
                <div className="col-span-1">#</div>
                <div className="col-span-4">Account</div>
                <div className="col-span-3">Description</div>
                <div className="col-span-2 text-right">Debit</div>
                <div className="col-span-2 text-right">Credit</div>
              </div>
              
              {/* Line Items */}
              <div className="divide-y divide-gray-200">
                {formData.lines.map((line, index) => (
                  <div key={index} className="grid grid-cols-12 gap-4 px-4 py-3 hover:bg-gray-50 group transition-colors">
                    <div className="col-span-1 flex items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-500">{index + 1}</span>
                        {formData.lines.length > 1 && (
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleRemoveLine(index)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div className="col-span-4">
                      <Select 
                        value={line.accountId} 
                        onValueChange={(value) => handleLineChange(index, 'accountId', value)}
                        disabled={accountsLoading}
                      >
                        <SelectTrigger className="border-gray-300 focus:border-blue-500 h-9 text-sm">
                          <SelectValue placeholder={accountsLoading ? "Loading..." : "Select account"} />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          {accountsLoading ? (
                            <SelectItem value="loading" disabled>
                              <div className="flex items-center gap-2">
                                <RefreshCw className="w-3 h-3 animate-spin" />
                                Loading accounts...
                              </div>
                            </SelectItem>
                          ) : accounts.length === 0 ? (
                            <SelectItem value="no-accounts" disabled>
                              <span className="text-gray-500">No accounts found</span>
                            </SelectItem>
                          ) : (
                            accounts.map((account: Account) => (
                              <SelectItem key={account.id} value={account.id}>
                                <div className="flex flex-col">
                                  <span className="font-medium">{account.code} - {account.name}</span>
                                  <span className="text-xs text-gray-500">
                                    {typeof account.type === 'string' ? account.type : account.type?.name || 'N/A'}
                                    {' • '}
                                    {typeof account.category === 'string' ? account.category : account.category?.name || 'N/A'}
                                  </span>
                                </div>
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="col-span-3">
                      <Input
                        value={line.memo || ''}
                        onChange={(e) => handleLineChange(index, 'memo', e.target.value)}
                        placeholder="Description..."
                        className="border-gray-300 focus:border-blue-500 h-9 text-sm"
                      />
                    </div>
                    
                    <div className="col-span-2">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={line.debit || ''}
                          onChange={(e) => handleLineChange(index, 'debit', parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                          className="border-gray-300 focus:border-blue-500 h-9 text-sm text-right pl-6 font-mono"
                        />
                      </div>
                    </div>
                    
                    <div className="col-span-2">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={line.credit || ''}
                          onChange={(e) => handleLineChange(index, 'credit', parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                          className="border-gray-300 focus:border-blue-500 h-9 text-sm text-right pl-6 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Totals Row - Bold Summary */}
              <div className="grid grid-cols-12 gap-4 px-4 py-4 bg-gray-50 border-t-2 border-gray-300">
                <div className="col-span-8 flex items-center justify-end">
                  <span className="text-sm font-bold text-gray-900 uppercase">Totals</span>
                </div>
                <div className="col-span-2 text-right">
                  <div className="text-base font-bold text-gray-900">
                    ${(totalDebit || 0).toFixed(2)}
                  </div>
                </div>
                <div className="col-span-2 text-right">
                  <div className="text-base font-bold text-gray-900">
                    ${(totalCredit || 0).toFixed(2)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Validation Messages */}
          {validationErrors.length > 0 && (
            <Card className="mt-4 border-red-200 bg-red-50 shadow-sm">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-red-800 mb-2">Please fix the following issues:</h4>
                    <ul className="space-y-1">
                      {validationErrors.map((error, index) => (
                        <li key={index} className="text-sm text-red-700 flex items-center gap-2">
                          <div className="w-1 h-1 rounded-full bg-red-600"></div>
                          {error}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Footer Action Bar - Sticky Bottom */}
      <div className="sticky bottom-0 z-10 bg-white border-t border-gray-200 pt-4 mt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {onCancel && (
              <Button
                variant="outline"
                onClick={onCancel}
                className="border-gray-300"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            {/* Save as Draft */}
            <Button
              variant="outline"
              onClick={handleSave}
              disabled={createEntryMutation.isPending || !formData.date}
              className="border-gray-300"
            >
              {createEntryMutation.isPending ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save as Draft
                </>
              )}
            </Button>
            
            {/* Save and Post */}
            <Button
              onClick={handleSaveAndPost}
              disabled={createEntryMutation.isPending || !isBalanced || validationErrors.length > 0}
              className="bg-blue-600 hover:bg-blue-700 shadow-sm"
            >
              {createEntryMutation.isPending ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Save and Post
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
