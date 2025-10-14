'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { CalendarIcon, PlusIcon, EyeIcon, EditIcon, TrashIcon, AlertTriangleIcon, CheckCircleIcon, XCircleIcon, RefreshCw, Brain, FileText, BarChart3 } from 'lucide-react';
import { apiService } from '@/lib/api';

interface JournalEntry {
  id: string;
  companyId: string;
  tenantId: string;
  date: Date;
  reference: string;
  description: string;
  status: 'draft' | 'posted' | 'voided';
  totalDebit: number;
  totalCredit: number;
  isBalanced: boolean;
  postedAt?: Date;
  postedBy?: string;
  entries: JournalLine[];
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

interface JournalLine {
  accountId: string;
  debit: number;
  credit: number;
  description?: string;
  reference?: string;
  metadata?: any;
}

interface AccountSuggestion {
  accountId: string;
  accountName: string;
  accountCode: string;
  confidence: number;
  reasoning: string;
  suggestedCategory?: string;
}

interface LedgerBalance {
  accountId: string;
  accountName: string;
  accountCode: string;
  openingBalance: number;
  currentBalance: number;
  periodDebit: number;
  periodCredit: number;
  lastTransactionDate?: Date;
}

interface ChartOfAccounts {
  id: string;
  name: string;
  code: string;
  type: string;
  parentId?: string;
  children?: ChartOfAccounts[];
  isActive: boolean;
  balance: number;
  metadata?: any;
}

export function EnhancedJournalManagement() {
  const { toast } = useToast();
  const [selectedCompany, setSelectedCompany] = useState('seed-company-1');
  const [activeTab, setActiveTab] = useState('ai-create');
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [accounts, setAccounts] = useState<ChartOfAccounts[]>([]);
  const [ledgerBalances, setLedgerBalances] = useState<LedgerBalance[]>([]);
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);

  // AI Creation Form
  const [aiForm, setAiForm] = useState({
    description: '',
    amount: '',
    category: '',
    vendor: '',
    customer: '',
    transactionType: 'sale'
  });

  // Manual Entry Form
  const [manualForm, setManualForm] = useState({
    date: new Date().toISOString().split('T')[0],
    reference: '',
    description: '',
    entries: [{ accountId: '', debit: 0, credit: 0, description: '' }]
  });

  // Account Suggestions
  const [accountSuggestions, setAccountSuggestions] = useState<AccountSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    loadData();
  }, [selectedCompany]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [entriesData, accountsData, balancesData, anomaliesData, statsData] = await Promise.all([
        apiService.get(`/enhanced-journal-management/entries/${selectedCompany}`),
        apiService.get(`/enhanced-journal-management/chart-of-accounts/${selectedCompany}`),
        apiService.get(`/enhanced-journal-management/ledger-balances/${selectedCompany}`),
        apiService.get(`/enhanced-journal-management/anomalies/${selectedCompany}`),
        apiService.get(`/enhanced-journal-management/stats/${selectedCompany}`)
      ]);

      setJournalEntries(entriesData.data || []);
      setAccounts(accountsData.data || []);
      setLedgerBalances(balancesData.data || []);
      setAnomalies(anomaliesData.data || []);
      setStats(statsData.data);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load journal management data',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createAIJournalEntry = async () => {
    if (!aiForm.description || !aiForm.amount) {
      toast({
        title: 'Validation Error',
        description: 'Description and amount are required',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await apiService.post('/enhanced-journal-management/create', {
        description: aiForm.description,
        amount: parseFloat(aiForm.amount),
        context: {
          category: aiForm.category,
          vendor: aiForm.vendor,
          customer: aiForm.customer,
          transactionType: aiForm.transactionType
        }
      });

      toast({
        title: 'Success',
        description: 'AI journal entry created successfully',
      });
      setAiForm({
        description: '',
        amount: '',
        category: '',
        vendor: '',
        customer: '',
        transactionType: 'sale'
      });
      loadData();
    } catch (error) {
      console.error('Error creating AI journal entry:', error);
      toast({
        title: 'Error',
        description: 'Failed to create AI journal entry',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getAccountSuggestions = async () => {
    if (!aiForm.description || !aiForm.amount) return;

    try {
      const result = await apiService.post('/enhanced-journal-management/account-suggestions', {
        description: aiForm.description,
        amount: parseFloat(aiForm.amount),
        context: {
          category: aiForm.category,
          vendor: aiForm.vendor,
          customer: aiForm.customer,
          transactionType: aiForm.transactionType
        }
      });

      setAccountSuggestions(result.data || []);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error getting account suggestions:', error);
    }
  };

  const createManualJournalEntry = async () => {
    if (!manualForm.date || !manualForm.reference || !manualForm.description) {
      toast({
        title: 'Validation Error',
        description: 'Date, reference, and description are required',
        variant: 'destructive'
      });
      return;
    }

    // Validate that entries are balanced
    const totalDebit = manualForm.entries.reduce((sum, entry) => sum + (entry.debit || 0), 0);
    const totalCredit = manualForm.entries.reduce((sum, entry) => sum + (entry.credit || 0), 0);

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      toast({
        title: 'Validation Error',
        description: 'Journal entries must be balanced (debits = credits)',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await apiService.post('/enhanced-journal-management/manual', {
        date: manualForm.date,
        reference: manualForm.reference,
        description: manualForm.description,
        entries: manualForm.entries
      });

      toast({
        title: 'Success',
        description: 'Manual journal entry created successfully',
      });
      setManualForm({
        date: new Date().toISOString().split('T')[0],
        reference: '',
        description: '',
        entries: [{ accountId: '', debit: 0, credit: 0, description: '' }]
      });
      loadData();
    } catch (error) {
      console.error('Error creating manual journal entry:', error);
      toast({
        title: 'Error',
        description: 'Failed to create manual journal entry',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addJournalLine = () => {
    setManualForm(prev => ({
      ...prev,
      entries: [...prev.entries, { accountId: '', debit: 0, credit: 0, description: '' }]
    }));
  };

  const removeJournalLine = (index: number) => {
    if (manualForm.entries.length > 1) {
      setManualForm(prev => ({
        ...prev,
        entries: prev.entries.filter((_, i) => i !== index)
      }));
    }
  };

  const updateJournalLine = (index: number, field: string, value: any) => {
    setManualForm(prev => ({
      ...prev,
      entries: prev.entries.map((entry, i) => 
        i === index ? { ...entry, [field]: value } : entry
      )
    }));
  };

  const postJournalEntry = async (entryId: string) => {
    try {
      await apiService.post(`/enhanced-journal-management/post/${entryId}`, {
        postedBy: 'demo-user-id'
      });

      toast({
        title: 'Success',
        description: 'Journal entry posted successfully',
      });
      loadData();
    } catch (error) {
      console.error('Error posting journal entry:', error);
      toast({
        title: 'Error',
        description: 'Failed to post journal entry',
        variant: 'destructive'
      });
    }
  };

  const voidJournalEntry = async (entryId: string) => {
    const reason = prompt('Please provide a reason for voiding this entry:');
    if (!reason) return;

    try {
      await apiService.post(`/enhanced-journal-management/void/${entryId}`, {
        voidedBy: 'demo-user-id',
        reason
      });

      toast({
        title: 'Success',
        description: 'Journal entry voided successfully',
      });
      loadData();
    } catch (error) {
      console.error('Error voiding journal entry:', error);
      toast({
        title: 'Error',
        description: 'Failed to void journal entry',
        variant: 'destructive'
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>;
      case 'posted':
        return <Badge variant="default">Posted</Badge>;
      case 'voided':
        return <Badge variant="destructive">Voided</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Enhanced Journal Management
          </h1>
          <p className="text-muted-foreground text-lg">
            AI-powered journal entry creation and advanced ledger management
          </p>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>AI Assistant Active</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Real-time Sync</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={selectedCompany} onValueChange={setSelectedCompany}>
            <SelectTrigger className="w-48 bg-white shadow-sm">
              <SelectValue placeholder="Select Company" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="seed-company-1">Uruti Hub Limited</SelectItem>
              <SelectItem value="seed-company-2">Acme Trading Co</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={loadData} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Enhanced Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700">Total Entries</CardTitle>
              <CalendarIcon className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900">{stats.entries.total}</div>
              <p className="text-xs text-blue-600 mt-1">
                {stats.entries.draft} draft, {stats.entries.posted} posted
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700">Total Debits</CardTitle>
              <CheckCircleIcon className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-900">{formatCurrency(stats.amounts.totalDebit)}</div>
              <p className="text-xs text-green-600 mt-1">All debit transactions</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-700">Total Credits</CardTitle>
              <XCircleIcon className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-900">{formatCurrency(stats.amounts.totalCredit)}</div>
              <p className="text-xs text-purple-600 mt-1">All credit transactions</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 hover:shadow-lg transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-amber-700">Anomalies</CardTitle>
              <AlertTriangleIcon className="h-5 w-5 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-900">{anomalies.length}</div>
              <p className="text-xs text-amber-600 mt-1">
                {anomalies.filter(a => a.severity === 'critical').length} critical
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 bg-gray-100 p-1 rounded-lg">
          <TabsTrigger value="ai-create" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Brain className="w-4 h-4 mr-2" />
            AI Creation
          </TabsTrigger>
          <TabsTrigger value="manual" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <EditIcon className="w-4 h-4 mr-2" />
            Manual Entry
          </TabsTrigger>
          <TabsTrigger value="entries" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <FileText className="w-4 h-4 mr-2" />
            Journal Entries
          </TabsTrigger>
          <TabsTrigger value="ledger" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <BarChart3 className="w-4 h-4 mr-2" />
            Ledger
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ai-create" className="space-y-6">
          <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Brain className="w-6 h-6 text-blue-600" />
                AI-Powered Journal Entry Creation
              </CardTitle>
              <p className="text-muted-foreground">
                Describe your transaction in natural language and let AI suggest the appropriate accounts
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                    Transaction Description
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="e.g., Paid $500 to ABC Supplies for office equipment"
                    value={aiForm.description}
                    onChange={(e) => setAiForm(prev => ({ ...prev, description: e.target.value }))}
                    className="min-h-[100px] resize-none border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500">
                    Be as specific as possible for better AI suggestions
                  </p>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="amount" className="text-sm font-medium text-gray-700">
                    Amount
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      placeholder="500.00"
                      value={aiForm.amount}
                      onChange={(e) => setAiForm(prev => ({ ...prev, amount: e.target.value }))}
                      className="pl-8 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Enter the total transaction amount
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    placeholder="Office Supplies"
                    value={aiForm.category}
                    onChange={(e) => setAiForm(prev => ({ ...prev, category: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vendor">Vendor</Label>
                  <Input
                    id="vendor"
                    placeholder="ABC Supplies"
                    value={aiForm.vendor}
                    onChange={(e) => setAiForm(prev => ({ ...prev, vendor: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="transactionType">Transaction Type</Label>
                  <Select value={aiForm.transactionType} onValueChange={(value) => setAiForm(prev => ({ ...prev, transactionType: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sale">Sale</SelectItem>
                      <SelectItem value="purchase">Purchase</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                      <SelectItem value="payment">Payment</SelectItem>
                      <SelectItem value="receipt">Receipt</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                <Button 
                  onClick={getAccountSuggestions} 
                  variant="outline" 
                  className="flex-1 sm:flex-none bg-white hover:bg-gray-50 border-gray-300"
                >
                  <Brain className="w-4 h-4 mr-2" />
                  Get Account Suggestions
                </Button>
                <Button 
                  onClick={createAIJournalEntry} 
                  disabled={isLoading}
                  className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <PlusIcon className="w-4 h-4 mr-2" />
                      Create AI Journal Entry
                    </>
                  )}
                </Button>
              </div>

              {showSuggestions && accountSuggestions.length > 0 && (
                <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Brain className="w-5 h-5 text-green-600" />
                      AI Account Suggestions
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Based on your transaction description, here are the recommended accounts
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {accountSuggestions.map((suggestion, index) => (
                        <div key={index} className="flex items-start justify-between p-4 border border-green-200 rounded-lg bg-white hover:shadow-md transition-shadow">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 mb-1">{suggestion.accountName}</div>
                            <div className="text-sm text-gray-600 mb-2">
                              Code: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{suggestion.accountCode}</span> | 
                              Confidence: <span className="font-semibold text-green-600">{(suggestion.confidence * 100).toFixed(1)}%</span>
                            </div>
                            <div className="text-sm text-gray-700 bg-gray-50 p-2 rounded border-l-4 border-green-400">
                              {suggestion.reasoning}
                            </div>
                          </div>
                          <Badge variant="outline" className="ml-4 bg-green-50 text-green-700 border-green-200">
                            {suggestion.suggestedCategory}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manual" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Manual Journal Entry</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="manual-date">Date</Label>
                  <Input
                    id="manual-date"
                    type="date"
                    value={manualForm.date}
                    onChange={(e) => setManualForm(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manual-reference">Reference</Label>
                  <Input
                    id="manual-reference"
                    placeholder="JE-001"
                    value={manualForm.reference}
                    onChange={(e) => setManualForm(prev => ({ ...prev, reference: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manual-description">Description</Label>
                  <Input
                    id="manual-description"
                    placeholder="Office equipment purchase"
                    value={manualForm.description}
                    onChange={(e) => setManualForm(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Journal Lines</Label>
                  <Button onClick={addJournalLine} size="sm">
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Line
                  </Button>
                </div>

                {manualForm.entries.map((entry, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                    <div className="space-y-2">
                      <Label>Account</Label>
                      <Select value={entry.accountId} onValueChange={(value) => updateJournalLine(index, 'accountId', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select account" />
                        </SelectTrigger>
                        <SelectContent>
                          {accounts.map((account) => (
                            <SelectItem key={account.id} value={account.id}>
                              {account.code} - {account.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Debit</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={entry.debit}
                        onChange={(e) => updateJournalLine(index, 'debit', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Credit</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={entry.credit}
                        onChange={(e) => updateJournalLine(index, 'credit', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Input
                        value={entry.description}
                        onChange={(e) => updateJournalLine(index, 'description', e.target.value)}
                      />
                    </div>
                    <Button
                      onClick={() => removeJournalLine(index)}
                      variant="outline"
                      size="sm"
                      disabled={manualForm.entries.length === 1}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                <div className="flex justify-end">
                  <Button onClick={createManualJournalEntry} disabled={isLoading}>
                    {isLoading ? 'Creating...' : 'Create Manual Entry'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="entries" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Journal Entries</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {journalEntries.map((entry) => (
                    <Card key={entry.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            {getStatusBadge(entry.status)}
                            <span className="font-medium">{entry.reference}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            {entry.status === 'draft' && (
                              <Button onClick={() => postJournalEntry(entry.id)} size="sm">
                                Post
                              </Button>
                            )}
                            {entry.status === 'posted' && (
                              <Button onClick={() => voidJournalEntry(entry.id)} size="sm" variant="outline">
                                Void
                              </Button>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{entry.description}</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                          <div>Date: {new Date(entry.date).toLocaleDateString()}</div>
                          <div>Debit: {formatCurrency(entry.totalDebit)}</div>
                          <div>Credit: {formatCurrency(entry.totalCredit)}</div>
                          <div>Balance: {entry.isBalanced ? '✓' : '✗'}</div>
                        </div>
                        {entry.entries && entry.entries.length > 0 && (
                          <div className="mt-2">
                            <div className="text-sm font-medium mb-1">Journal Lines:</div>
                            <div className="space-y-1">
                              {entry.entries.map((line, index) => (
                                <div key={index} className="text-xs flex justify-between">
                                  <span>{line.accountId}</span>
                                  <span>D: {formatCurrency(line.debit)} C: {formatCurrency(line.credit)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ledger" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Chart of Accounts</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-2">
                    {accounts.map((account) => (
                      <div key={account.id} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <div className="font-medium">{account.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Code: {account.code} | Type: {typeof account.type === 'string' ? account.type : (account.type?.name || 'Unknown')}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(account.balance)}</div>
                          <Badge variant={account.isActive ? 'default' : 'secondary'}>
                            {account.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ledger Balances</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-2">
                    {ledgerBalances.map((balance) => (
                      <div key={balance.accountId} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <div className="font-medium">{balance.accountName}</div>
                          <div className="text-sm text-muted-foreground">
                            Code: {balance.accountCode}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(balance.currentBalance)}</div>
                          <div className="text-xs text-muted-foreground">
                            D: {formatCurrency(balance.periodDebit)} C: {formatCurrency(balance.periodCredit)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {anomalies.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Detected Anomalies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {anomalies.map((anomaly, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <div className="font-medium">{anomaly.description}</div>
                        <div className="text-sm text-muted-foreground">Type: {anomaly.type}</div>
                      </div>
                      <Badge variant={anomaly.severity === 'critical' ? 'destructive' : 'secondary'}>
                        {anomaly.severity}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
