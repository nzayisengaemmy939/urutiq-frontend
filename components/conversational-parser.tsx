'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useToast } from '../hooks/use-toast';
import { apiService } from '../lib/api';
import { 
  MessageSquare, 
  FileText, 
  Calculator, 
  CheckCircle, 
  AlertTriangle, 
  Lightbulb,
  Download,
  Upload,
  History,
  BarChart3,
  Settings,
  Play,
  Save,
  RefreshCw
} from 'lucide-react';

interface ParsedTransaction {
  description: string;
  amount: number;
  currency: string;
  date: Date;
  transactionType: 'expense' | 'income' | 'transfer' | 'payment' | 'receipt';
  category: string;
  confidence: number;
  journalEntries: JournalEntry[];
  metadata: {
    vendor?: string;
    customer?: string;
    account?: string;
    reference?: string;
    notes?: string;
  };
}

interface JournalEntry {
  accountId: string;
  accountName: string;
  debit: number;
  credit: number;
  description: string;
  category: string;
}

interface ParsedPrompt {
  originalText: string;
  parsedTransaction: ParsedTransaction;
  confidence: number;
  reasoning: string;
  suggestions: string[];
  validationErrors: string[];
}

interface ParsingExample {
  category: string;
  examples: string[];
}

export function ConversationalParser({ companyId }: { companyId: string }) {
  const [inputText, setInputText] = useState('');
  const [parsedResult, setParsedResult] = useState<ParsedPrompt | null>(null);
  const [loading, setLoading] = useState(false);
  const [examples, setExamples] = useState<ParsingExample[]>([]);
  const [batchTexts, setBatchTexts] = useState<string[]>(['']);
  const [batchResults, setBatchResults] = useState<ParsedPrompt[]>([]);
  const [activeTab, setActiveTab] = useState('single');
  const [autoCreate, setAutoCreate] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [journalEntryCreated, setJournalEntryCreated] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadExamples();
  }, []);

  const loadExamples = async () => {
    try {
      const response = await apiService.request('/parser/examples');
      setExamples(response.data);
    } catch (error) {
      console.error('Failed to load examples:', error);
    }
  };

  const parseTransaction = async () => {
    if (!inputText.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a transaction description',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.request('/parser/parse', { method: 'POST', body: JSON.stringify({
        text: inputText,
        companyId: companyId || undefined // Allow undefined companyId
      }) });
      
      setParsedResult(response.data);
      
      // Show info about which company was used
      if (response.usedCompanyId && response.usedCompanyId !== companyId) {
        toast({
          title: 'Info',
          description: `Parsed using ${response.companyName || 'default company'}`,
        });
      }
    } catch (error: any) {
      console.error('Failed to parse transaction:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to parse transaction';
      if (error.message?.includes('company_not_found')) {
        errorMessage = 'Company not found. Using default company instead.';
      } else if (error.message?.includes('no_company_available')) {
        errorMessage = 'No company available. Please create a company first.';
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createJournalEntry = async () => {
    if (!parsedResult) return;

    setLoading(true);
    try {
      const response = await apiService.request('/parser/create-entry', { method: 'POST', body: JSON.stringify({
        text: inputText,
        companyId: companyId || undefined, // Allow undefined companyId
        autoCreate: true
      }) });
      
      if (response.data.autoCreated) {
        // Success - Journal entry created automatically
        const journalEntry = response.data.journalEntry;
        const transaction = response.data.transaction;
        
        toast({
          title: '✅ Journal Entry Created Successfully!',
          description: `Journal entry #${journalEntry?.id?.slice(-8) || 'N/A'} created for ${transaction?.amount || parsedResult.parsedTransaction.amount} ${transaction?.currency || parsedResult.parsedTransaction.currency} transaction in ${response.data.companyName || 'default company'}`,
          duration: 5000,
        });
        
        // Mark as created and clear after delay
        setJournalEntryCreated(true);
        setTimeout(() => {
          setInputText('');
          setParsedResult(null);
          setJournalEntryCreated(false);
        }, 2000);
        
      } else {
        // Partial success - Requires manual review
        toast({
          title: '⚠️ Manual Review Required',
          description: `Journal entry created but requires manual review due to low confidence (${parsedResult.confidence}%). Please check the entries before posting.`,
          duration: 4000,
        });
      }
    } catch (error: any) {
      console.error('Failed to create journal entry:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to create journal entry';
      let errorTitle = '❌ Journal Entry Creation Failed';
      
      if (error.message?.includes('company_not_found')) {
        errorMessage = 'Company not found. Using default company instead.';
        errorTitle = '⚠️ Company Issue';
      } else if (error.message?.includes('no_company_available')) {
        errorMessage = 'No company available. Please create a company first.';
        errorTitle = '⚠️ No Company Found';
      } else if (error.message?.includes('validation')) {
        errorMessage = 'Transaction validation failed. Please check your input and try again.';
        errorTitle = '❌ Validation Error';
      } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
        errorMessage = 'Network error. Please check your connection and try again.';
        errorTitle = '🌐 Network Error';
      } else if (error.message?.includes('timeout')) {
        errorMessage = 'Request timed out. Please try again.';
        errorTitle = '⏰ Timeout Error';
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: 'destructive',
        duration: 6000,
      });
    } finally {
      setLoading(false);
    }
  };

  const validateText = async () => {
    if (!inputText.trim()) return;

    try {
      const response = await apiService.request('/parser/validate', { method: 'POST', body: JSON.stringify({
        text: inputText
      }) });
      setValidationResult(response.data);
    } catch (error) {
      console.error('Failed to validate text:', error);
    }
  };

  const batchParse = async () => {
    const validTexts = batchTexts.filter(text => text.trim());
    if (validTexts.length === 0) {
      toast({
        title: 'Error',
        description: 'Please enter at least one transaction',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.request('/parser/batch-parse', { method: 'POST', body: JSON.stringify({
        texts: validTexts,
        companyId
      }) });
      setBatchResults(response.data);
      toast({
        title: 'Success',
        description: `Parsed ${validTexts.length} transactions`,
      });
    } catch (error) {
      console.error('Failed to batch parse:', error);
      toast({
        title: 'Error',
        description: 'Failed to parse transactions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const addBatchText = () => {
    setBatchTexts([...batchTexts, '']);
  };

  const updateBatchText = (index: number, value: string) => {
    const newTexts = [...batchTexts];
    newTexts[index] = value;
    setBatchTexts(newTexts);
  };

  const removeBatchText = (index: number) => {
    const newTexts = batchTexts.filter((_, i) => i !== index);
    setBatchTexts(newTexts);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'bg-green-100 text-green-800';
    if (confidence >= 70) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'expense': return 'bg-red-100 text-red-800';
      case 'income': return 'bg-green-100 text-green-800';
      case 'transfer': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Conversational Transaction Parser</h2>
          <p className="text-gray-600">Convert natural language into structured accounting entries</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setInputText('')}
            disabled={loading}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Clear
          </Button>
          <Button
            onClick={loadExamples}
            disabled={loading}
          >
            <Lightbulb className="w-4 h-4 mr-2" />
            Examples
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="single">Single Transaction</TabsTrigger>
          <TabsTrigger value="batch">Batch Processing</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
          <TabsTrigger value="validation">Validation</TabsTrigger>
        </TabsList>

        <TabsContent value="single" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-cyan-600" />
                Natural Language Transaction
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="transaction-text">Describe your transaction</Label>
                <Textarea
                  id="transaction-text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="e.g., I paid electricity bill 30,000 RWF"
                  rows={3}
                  className="mt-1"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={parseTransaction}
                  disabled={loading || !inputText.trim()}
                >
                  <Play className="w-4 h-4 mr-2" />
                  {loading ? 'Parsing...' : 'Parse Transaction'}
                </Button>
                <Button
                  variant="outline"
                  onClick={validateText}
                  disabled={loading || !inputText.trim()}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Validate
                </Button>
              </div>

              {validationResult && (
                <Alert>
                  <AlertDescription>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span>Word count: {validationResult.wordCount}</span>
                        <span>Has amount: {validationResult.hasAmount ? '✓' : '✗'}</span>
                        <span>Has currency: {validationResult.hasCurrency ? '✓' : '✗'}</span>
                        <span>Has action: {validationResult.hasAction ? '✓' : '✗'}</span>
                      </div>
                      {validationResult.suggestions.length > 0 && (
                        <div>
                          <strong>Suggestions:</strong>
                          <ul className="list-disc list-inside mt-1">
                            {validationResult.suggestions.map((suggestion: string, index: number) => (
                              <li key={index} className="text-sm">{suggestion}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {parsedResult && (
            <Card className={journalEntryCreated ? "border-green-500 bg-green-50/30" : ""}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-cyan-600" />
                  Parsed Result
                  {journalEntryCreated && (
                    <div className="flex items-center gap-1 ml-auto">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-600 font-medium">Journal Entry Created!</span>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Original Text</Label>
                    <p className="text-sm text-gray-600 mt-1">{parsedResult.originalText}</p>
                  </div>
                  <div>
                    <Label>Confidence</Label>
                    <Badge className={`mt-1 ${getConfidenceColor(parsedResult.confidence)}`}>
                      {parsedResult.confidence}%
                    </Badge>
                  </div>
                  <div>
                    <Label>Transaction Type</Label>
                    <Badge className={`mt-1 ${getTransactionTypeColor(parsedResult.parsedTransaction.transactionType)}`}>
                      {parsedResult.parsedTransaction.transactionType}
                    </Badge>
                  </div>
                  <div>
                    <Label>Category</Label>
                    <p className="text-sm text-gray-600 mt-1">{parsedResult.parsedTransaction.category}</p>
                  </div>
                  <div>
                    <Label>Amount</Label>
                    <p className="text-lg font-semibold mt-1">
                      {parsedResult.parsedTransaction.amount.toLocaleString()} {parsedResult.parsedTransaction.currency}
                    </p>
                  </div>
                  <div>
                    <Label>Date</Label>
                    <p className="text-sm text-gray-600 mt-1">
                      {new Date(parsedResult.parsedTransaction.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <Separator />

                <div>
                  <Label>Journal Entries</Label>
                  <div className="mt-2 space-y-2">
                    {parsedResult.parsedTransaction.journalEntries.map((entry, index) => (
                      <div key={index} className="border rounded-lg p-3 bg-gray-50">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{entry.accountName}</span>
                          <div className="flex gap-4">
                            <span className="text-red-600">Debit: {entry.debit.toLocaleString()}</span>
                            <span className="text-green-600">Credit: {entry.credit.toLocaleString()}</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{entry.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {parsedResult.validationErrors.length > 0 && (
                  <Alert variant="destructive">
                    <AlertTriangle className="w-4 h-4" />
                    <AlertDescription>
                      <strong>Validation Errors:</strong>
                      <ul className="list-disc list-inside mt-1">
                        {parsedResult.validationErrors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                {parsedResult.suggestions.length > 0 && (
                  <Alert>
                    <Lightbulb className="w-4 h-4" />
                    <AlertDescription>
                      <strong>Suggestions:</strong>
                      <ul className="list-disc list-inside mt-1">
                        {parsedResult.suggestions.map((suggestion, index) => (
                          <li key={index}>{suggestion}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-2">
                  <Button
                    onClick={createJournalEntry}
                    disabled={loading || parsedResult.validationErrors.length > 0 || journalEntryCreated}
                    className={loading || journalEntryCreated ? "opacity-75 cursor-not-allowed" : ""}
                    variant={journalEntryCreated ? "secondary" : "default"}
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Creating Journal Entry...
                      </>
                    ) : journalEntryCreated ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                        Journal Entry Created!
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Create Journal Entry
                      </>
                    )}
                  </Button>
                  
                  {parsedResult.validationErrors.length > 0 && !journalEntryCreated && (
                    <div className="flex items-center text-red-600 text-sm">
                      <AlertTriangle className="w-4 h-4 mr-1" />
                      Fix validation errors before creating entry
                    </div>
                  )}
                  
                  {journalEntryCreated && (
                    <div className="flex items-center text-green-600 text-sm">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Successfully saved to database
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="batch" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-cyan-600" />
                Batch Transaction Processing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {batchTexts.map((text, index) => (
                  <div key={index} className="flex gap-2">
                    <Textarea
                      value={text}
                      onChange={(e) => updateBatchText(index, e.target.value)}
                      placeholder={`Transaction ${index + 1} (e.g., Paid rent 200,000 RWF)`}
                      rows={2}
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeBatchText(index)}
                      disabled={batchTexts.length === 1}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Button onClick={addBatchText} variant="outline">
                  Add Transaction
                </Button>
                <Button
                  onClick={batchParse}
                  disabled={loading || batchTexts.every(text => !text.trim())}
                >
                  <Play className="w-4 h-4 mr-2" />
                  {loading ? 'Processing...' : 'Process Batch'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {batchResults.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-cyan-600" />
                  Batch Results ({batchResults.length} transactions)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {batchResults.map((result, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium">{result.originalText}</p>
                          <div className="flex gap-2 mt-1">
                            <Badge className={getTransactionTypeColor(result.parsedTransaction.transactionType)}>
                              {result.parsedTransaction.transactionType}
                            </Badge>
                            <Badge className={getConfidenceColor(result.confidence)}>
                              {result.confidence}%
                            </Badge>
                            <span className="text-sm text-gray-600">
                              {result.parsedTransaction.amount.toLocaleString()} {result.parsedTransaction.currency}
                            </span>
                          </div>
                        </div>
                        {result.validationErrors.length > 0 && (
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="examples" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-cyan-600" />
                Transaction Examples
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {examples.map((category) => (
                  <div key={category.category} className="space-y-3">
                    <h3 className="font-semibold text-lg">{category.category}</h3>
                    <div className="space-y-2">
                      {category.examples.map((example, index) => (
                        <div
                          key={index}
                          className="p-3 border rounded-lg hover:border-cyan-300 cursor-pointer transition-colors"
                          onClick={() => setInputText(example)}
                        >
                          <p className="text-sm">{example}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="validation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-cyan-600" />
                Text Validation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Test your transaction description</Label>
                <Textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Enter a transaction description to validate..."
                  rows={3}
                  className="mt-1"
                />
              </div>

              <Button
                onClick={validateText}
                disabled={!inputText.trim()}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Validate Text
              </Button>

              {validationResult && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 border rounded-lg">
                      <div className="text-2xl font-bold">{validationResult.wordCount}</div>
                      <div className="text-sm text-gray-600">Words</div>
                    </div>
                    <div className="text-center p-3 border rounded-lg">
                      <div className="text-2xl font-bold">{validationResult.hasAmount ? '✓' : '✗'}</div>
                      <div className="text-sm text-gray-600">Has Amount</div>
                    </div>
                    <div className="text-center p-3 border rounded-lg">
                      <div className="text-2xl font-bold">{validationResult.hasCurrency ? '✓' : '✗'}</div>
                      <div className="text-sm text-gray-600">Has Currency</div>
                    </div>
                    <div className="text-center p-3 border rounded-lg">
                      <div className="text-2xl font-bold">{validationResult.hasAction ? '✓' : '✗'}</div>
                      <div className="text-sm text-gray-600">Has Action</div>
                    </div>
                  </div>

                  {validationResult.suggestions.length > 0 && (
                    <Alert>
                      <Lightbulb className="w-4 h-4" />
                      <AlertDescription>
                        <strong>Improvement Suggestions:</strong>
                        <ul className="list-disc list-inside mt-1">
                          {validationResult.suggestions.map((suggestion: string, index: number) => (
                            <li key={index}>{suggestion}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
