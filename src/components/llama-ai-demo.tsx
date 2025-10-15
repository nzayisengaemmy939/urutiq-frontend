import { useState, FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { SegmentedTabs } from '../components/ui/segmented-tabs';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { 
  Brain, 
  MessageSquare, 
  FileText, 
  TrendingUp, 
  BarChart3, 
  Zap,
  Upload,
  Send,
  Loader2,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Shield
} from 'lucide-react';

type TabId = 'conversational' | 'documents' | 'analytics' | 'compliance';

interface LlamaResponse {
  message: string;
  confidence: number;
  intent: string;
  entities: Record<string, any>;
  suggestions: string[];
  actions: Array<{
    type: string;
    description: string;
    parameters: Record<string, any>;
  }>;
  insights: Array<{
    type: string;
    description: string;
    confidence: number;
    impact: 'high' | 'medium' | 'low';
  }>;
  followUpQuestions: string[];
  ok?: boolean;
  status?: number;
  text?: () => Promise<string>;
  json?: () => Promise<any>;
}

interface PredictiveResult {
  success: boolean;
  forecasts: Array<{
    type: string;
    period: string;
    predictedValue: number;
    confidence: number;
    trend: string;
  }>;
  insights: Array<{
    type: string;
    title: string;
    description: string;
    confidence: number;
    impact: string;
  }>;
  recommendations: Array<{
    category: string;
    title: string;
    description: string;
    expectedImpact: number;
    priority: string;
  }>;
}

interface LlamaAIDemoProps {
  companyId: string;
}

export const LlamaAIDemo: FC<LlamaAIDemoProps> = ({ companyId }) => {
  const API_BASE = import.meta.env.VITE_API_URL || 'https://urutiq-backend-clean-af6v.onrender.com';
  const [activeTab, setActiveTab] = useState<TabId>('conversational');
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState<LlamaResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [documentContent, setDocumentContent] = useState('');
  const [documentQuery, setDocumentQuery] = useState('');
  const [uploadedPreview, setUploadedPreview] = useState<string | null>(null);
  const [uploadedBase64, setUploadedBase64] = useState<string | null>(null);
  const [showAllForecasts, setShowAllForecasts] = useState(false);
  const [predictiveResult, setPredictiveResult] = useState<PredictiveResult | null>(null);
  const [complianceResult, setComplianceResult] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mode, setMode] = useState<'fast' | 'balanced' | 'accurate'>('fast');
  const [latencyMs, setLatencyMs] = useState<number | null>(null);

  // Missing handler functions
  const handleDocumentQuery = () => {
    console.log('Document query triggered');
  };

  const handleComplianceAnalysis = () => {
    console.log('Compliance analysis triggered');
  };

  const tabs = [
    { id: 'documents' as const, label: 'Document Intelligence', icon: FileText },
    { id: 'analytics' as const, label: 'Predictive Analytics', icon: TrendingUp },
    { id: 'compliance' as const, label: 'Compliance & Audit', icon: Shield }
  ];

  const handleConversationalQuery = async () => {
    if (!message.trim()) return;
    if (!companyId) {
      setErrorMessage('Company ID is required');
      setResponse(null);
      return;
    }
    
    const startTime = Date.now();
    setLatencyMs(null);

    const tenantId = localStorage.getItem('tenant_id');
    if (!tenantId) {
      setErrorMessage('Tenant ID is required');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`${API_BASE}/api/llama-ai/conversational/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': tenantId,
          'x-company-id': companyId,
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
        },
        body: JSON.stringify({
          message,
          companyId,
          sessionId: `session_${Date.now()}`,
          mode
        })
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Request failed (${response.status}): ${text || 'Unknown error'}`);
      }

      const result = await response.json();
      const endTime = Date.now();
      setLatencyMs(endTime - startTime);
      
      if (result.success) {
        setResponse(result.data);
      } else {
        throw new Error(result.error || 'Failed to process query');
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error');
      setResponse(null);
    } finally {
      setIsLoading(false);
    }
  };
  const handleFileUpload = async (file: File) => {
    setErrorMessage(null);
    setIsLoading(true);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
      });
      setUploadedPreview(base64);
      setUploadedBase64(base64);
      const response = await fetch(`${API_BASE}/api/llama-ai/documents/process-upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({ imageBase64: base64, companyId })
      });
      if (!response.ok) {
        const text = await response.text();
        setErrorMessage(`Upload failed (${response.status}): ${text || 'Unknown error'}`);
        return;
      }
      const result = await response.json();
      if (result.success) {
        setResponse({
          message: 'Upload processed successfully. Extracted data and insights shown below.',
          confidence: result.data.confidence ?? 0.8,
          intent: 'document',
          entities: { extracted: result.data.extractedData, rawText: result.data.rawText },
          suggestions: result.data.suggestions ?? [],
          actions: [],
          insights: (result.data.insights || []).map((i: any) => ({ type: i.type, description: i.description, confidence: i.confidence, impact: i.impact })),
          followUpQuestions: [],
        });
      } else {
        setErrorMessage(result.error || 'Failed to process upload');
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Unknown upload error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProcessUploaded = async () => {
    if (!uploadedBase64) {
      setErrorMessage('Please upload a file first');
      return;
    }
    setErrorMessage(null);
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/llama-ai/documents/process-upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({ imageBase64: uploadedBase64, companyId })
      });
      if (!response.ok) {
        const text = await response.text();
        setErrorMessage(`Upload processing failed (${response.status}): ${text || 'Unknown error'}`);
        return;
      }
      const result = await response.json();
      if (result.success) {
        setResponse({
          message: 'Upload processed successfully. Extracted data and insights shown below.',
          confidence: result.data.confidence ?? 0.8,
          intent: 'document',
          entities: { extracted: result.data.extractedData, rawText: result.data.rawText },
          suggestions: result.data.suggestions ?? [],
          actions: [],
          insights: (result.data.insights || []).map((i: any) => ({ type: i.type, description: i.description, confidence: i.confidence, impact: i.impact })),
          followUpQuestions: [],
        });
      } else {
        setErrorMessage(result.error || 'Failed to process uploaded file');
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Unknown upload processing error');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePredictiveAnalysis = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/llama-ai/analytics/comprehensive-forecast`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          companyId,
          months: 12
        })
      });
      
      if (!response.ok) {
        const text = await response.text();
        setErrorMessage(`Predictive analysis failed (${response.status}): ${text || 'Unknown error'}`);
        return;
      }

      const result = await response.json();
      
      if (result.success) {
        setPredictiveResult(result.data);
        setShowAllForecasts(false); // Reset to show only first 4 forecasts
        setErrorMessage(null);
      } else {
        setErrorMessage(result.error || 'Failed to generate forecast');
      }
  } catch (error) {
    setErrorMessage(error instanceof Error ? error.message : 'Unknown error generating forecast');
    setPredictiveResult(null);
    return;
  }

  if (!response.ok) {
    const text = await response.text();
    setErrorMessage(`Request failed (${response.status}): ${text || 'Unknown error'}`);
    setComplianceResult(null);
    return;
  }

  try {
    const result = await response.json();
    if (result.success) {
      setComplianceResult(result.data);
      setErrorMessage(null);
    } else {
      setErrorMessage(result.error || 'Compliance analysis failed');
      setComplianceResult(null);
    }
  } catch (error) {
    setErrorMessage(error instanceof Error ? error.message : 'Error parsing compliance analysis response');
    setComplianceResult(null);
  }
};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-purple-100 rounded-lg">
            <Brain className="h-8 w-8 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-purple-900">Llama AI-Powered Intelligence</h1>
            <p className="text-purple-700">Advanced conversational AI, document processing, and predictive analytics</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <SegmentedTabs
          tabs={tabs.map(t => ({
            id: t.id,
            label: t.label,
            icon: t.icon
          }))}
          value={activeTab}
          onChange={(id) => setActiveTab(id as TabId)}
        />
      </div>

      {/* Conversational AI Tab */}
      {activeTab === 'conversational' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5" />
                <span>Chat with Llama AI</span>
              </CardTitle>
              <CardDescription>
                Ask questions about your financial data, get insights, and receive intelligent recommendations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {errorMessage && (
                <div className="p-3 rounded-md border border-red-200 bg-red-50 text-red-800 text-sm">
                  {errorMessage}
                </div>
              )}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-gray-500">Mode:</span>
                {(['fast','balanced','accurate'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMode(m)}
                    className={`text-xs px-2 py-1 rounded-full border ${mode===m ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                    aria-pressed={mode===m}
                  >
                    {m.charAt(0).toUpperCase() + m.slice(1)}
                  </button>
                ))}
                {latencyMs != null && (
                  <span className="ml-auto text-xs text-gray-500">Latency: {latencyMs} ms</span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  'What are my top 3 expense categories this month?',
                  'Forecast my cash flow for the next quarter',
                  'Are there any unusual transactions this week?',
                  'How can I improve my gross margin?'
                ].map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setMessage(q)}
                    className="text-xs px-2 py-1 rounded-full border bg-white hover:bg-gray-50 text-gray-700"
                  >
                    {q}
                  </button>
                ))}
              </div>
              <Textarea
                placeholder="Ask me anything about your finances... e.g., 'What are my biggest expenses this month?' or 'How is my cash flow trending?'"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
              />
              <Button 
                onClick={handleConversationalQuery} 
                disabled={isLoading || !message.trim()}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Message
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-5 w-5" />
                <span>AI Response</span>
                {response && (
                  <Badge variant="outline" className="ml-auto">
                    {Math.round(response.confidence * 100)}% confidence
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {response ? (
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-900">{response.message}</p>
                  </div>
                  
                  {response.insights && response.insights.length > 0 ? (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Insights</h4>
                      <div className="space-y-2">
                        {response.insights.map((insight, index) => (
                          <div key={index} className="flex items-start space-x-2">
                            <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5" />
                            <div>
                              <p className="text-sm text-gray-700">{insight.description}</p>
                              <Badge variant="outline" className="text-xs">
                                {insight.impact} impact
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {response.suggestions && response.suggestions.length > 0 ? (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Suggestions</h4>
                      <ul className="space-y-1">
                        {response.suggestions.map((suggestion, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-start space-x-2">
                            <CheckCircle className="h-3 w-3 text-green-500 mt-1" />
                            <span>{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {response.followUpQuestions && response.followUpQuestions.length > 0 ? (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Follow-up Questions</h4>
                      <div className="space-y-1">
                        {response.followUpQuestions.map((question, index) => (
                          <button
                            key={index}
                            onClick={() => setMessage(question)}
                            className="text-sm text-blue-600 hover:text-blue-800 text-left"
                          >
                            {question}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Send a message to start chatting with Llama AI</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Document Intelligence Tab */}
      {activeTab === 'documents' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Document Analysis</span>
              </CardTitle>
              <CardDescription>
                Upload documents and ask intelligent questions about their content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border rounded-lg p-4 bg-gray-50">
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload Receipt / Invoice Image</label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) handleFileUpload(f)
                  }}
                  className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                />
                {uploadedPreview && (
                  <div className="mt-3">
                    <img src={uploadedPreview} alt="Uploaded preview" className="max-h-40 rounded border" />
                  </div>
                )}
                <div className="mt-3 flex gap-2">
                  <Button onClick={handleProcessUploaded} disabled={isLoading || !uploadedBase64}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing Upload...
                      </>
                    ) : (
                      <>
                        <Zap className="mr-2 h-4 w-4" />
                        Process Uploaded File
                      </>
                    )}
                  </Button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Document Content
                </label>
                <Textarea
                  placeholder="Paste document content here (invoices, contracts, receipts, etc.)"
                  value={documentContent}
                  onChange={(e) => setDocumentContent(e.target.value)}
                  rows={6}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Question
                </label>
                <Input
                  placeholder="e.g., 'What is the total amount?' or 'Who is the vendor?'"
                  value={documentQuery}
                  onChange={(e) => setDocumentQuery(e.target.value)}
                />
              </div>
              <Button 
                onClick={handleDocumentQuery} 
                disabled={isLoading || !documentContent.trim() || !documentQuery.trim()}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-4 w-4" />
                    Analyze Document
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-5 w-5" />
                <span>Analysis Results</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {response ? (
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-900">{response.message}</p>
                  </div>
                  
                  {response.entities && Object.keys(response.entities).length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Extracted Entities</h4>
                      <div className="space-y-2">
                        {Object.entries(response.entities).map(([key, value]) => (
                          <div key={key} className="text-sm">
                            <div className="font-medium text-gray-600 mb-1">{key}:</div>
                            {Array.isArray(value) ? (
                              <div className="text-gray-900">{value.map((v, i) => (
                                <span key={i} className="mr-1">{typeof v === 'object' ? JSON.stringify(v) : String(v)}{i < value.length - 1 ? ',' : ''}</span>
                              ))}</div>
                            ) : typeof value === 'object' && value !== null ? (
                              <pre className="bg-gray-100 rounded-md p-2 text-xs text-gray-800 overflow-auto">
                                {JSON.stringify(value, null, 2)}
                              </pre>
                            ) : (
                              <span className="text-gray-900">{String(value)}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Upload a document and ask a question to get started</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Predictive Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Predictive Analytics</span>
              </CardTitle>
              <CardDescription>
                Generate comprehensive business forecasts and insights using Llama AI
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handlePredictiveAnalysis} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Forecast...
                  </>
                ) : (
                  <>
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Generate 12-Month Business Forecast
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {predictiveResult ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Forecasts */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>Forecasts</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {predictiveResult.forecasts && predictiveResult.forecasts.length > 0 ? (
                      <>
                        {(showAllForecasts ? predictiveResult.forecasts : predictiveResult.forecasts.slice(0, 4)).map((forecast, index) => (
                          <div key={index} className="p-3 bg-gray-50 rounded-lg">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-medium text-gray-900 capitalize">{(forecast.type || 'unknown').replace('_', ' ')}</span>
                              <Badge variant="outline">{forecast.trend || 'stable'}</Badge>
                            </div>
                            <div className="text-lg font-bold text-gray-900">
                              ${forecast.predictedValue ? forecast.predictedValue.toLocaleString() : '0'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {forecast.period || 'Unknown'} • {Math.round((forecast.confidence || 0) * 100)}% confidence
                            </div>
                          </div>
                        ))}
                        {predictiveResult.forecasts.length > 4 && (
                          <div className="text-center pt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setShowAllForecasts(!showAllForecasts)}
                            >
                              {showAllForecasts ? 'Show Less' : `Show All ${predictiveResult.forecasts.length} Forecasts`}
                            </Button>
                          </div>
                        )}
                      </>
                    ) : null}
                  </div>
                </CardContent>
              </Card>

              {/* Insights */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Lightbulb className="h-5 w-5" />
                    <span>Insights</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {predictiveResult.insights && predictiveResult.insights.length > 0 ? (
                      predictiveResult.insights.map((insight, index) => (
                        <div key={index} className="p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-blue-900">{insight.title}</span>
                            <Badge variant="outline" className="text-xs">
                              {insight.impact} impact
                            </Badge>
                          </div>
                          <p className="text-sm text-blue-700">{insight.description}</p>
                          <div className="text-xs text-blue-600 mt-1">
                            {Math.round(insight.confidence * 100)}% confidence
                          </div>
                        </div>
                      ))
                    ) : null}
                  </div>
                </CardContent>
              </Card>

              {/* Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5" />
                    <span>Recommendations</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {predictiveResult.recommendations && predictiveResult.recommendations.length > 0 ? (
                      predictiveResult.recommendations.map((rec, index) => (
                        <div key={index} className="p-3 bg-green-50 rounded-lg">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-green-900">{rec.title}</span>
                            <Badge variant="outline" className="text-xs">
                              {rec.priority} priority
                            </Badge>
                          </div>
                          <p className="text-sm text-green-700">{rec.description}</p>
                          <div className="text-xs text-green-600 mt-1">
                            Expected impact: {Math.round(rec.expectedImpact * 100)}%
                          </div>
                        </div>
                      ))
                    ) : null}
                  </div>
                </CardContent>
              </Card>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="text-center py-8 text-gray-500">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Click "Generate 12-Month Business Forecast" to get started</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Compliance & Audit Tab */}
      {activeTab === 'compliance' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Compliance & Audit Analysis</span>
              </CardTitle>
              <CardDescription>
                Run an automated compliance risk assessment, detect violations, and get remediation recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {errorMessage && (
                <div className="mb-4 p-3 rounded-md border border-red-200 bg-red-50 text-red-800 text-sm">
                  {errorMessage}
                </div>
              )}
              <Button 
                onClick={handleComplianceAnalysis} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing Compliance...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Run Compliance Analysis
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {complianceResult && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Compliance Score & Risk */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5" />
                    <span>Compliance Overview</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600">Compliance Score</div>
                      <div className="text-2xl font-bold text-gray-900">{Math.round(complianceResult.complianceScore)} / 100</div>
                    </div>
                    {complianceResult.riskAssessment && (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-600">Overall Risk</div>
                        <div className="text-lg font-semibold capitalize">{complianceResult.riskAssessment.overallRisk}</div>
                        <div className="text-xs text-gray-500">Next review: {new Date(complianceResult.riskAssessment.nextReviewDate).toLocaleDateString()}</div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Violations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5" />
                    <span>Detected Violations</span>
                    <Badge variant="outline" className="ml-auto">{(complianceResult.violations || []).length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(complianceResult.violations || []).slice(0, 5).map((v: any, idx: number) => (
                      <div key={idx} className="p-3 bg-red-50 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-red-900 capitalize">{v.type}</span>
                          <Badge variant="outline" className="text-xs capitalize">{v.severity}</Badge>
                        </div>
                        <div className="text-sm text-red-800">{v.description}</div>
                        {v.regulation && (
                          <div className="text-xs text-red-700 mt-1">Regulation: {v.regulation}</div>
                        )}
                        {v.remediation && (
                          <div className="text-xs text-red-700 mt-1">Remediation: {v.remediation}</div>
                        )}
                      </div>
                    ))}
                    {(complianceResult.violations || []).length === 0 && (
                      <div className="text-sm text-gray-500">No violations detected.</div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5" />
                    <span>Recommendations</span>
                    <Badge variant="outline" className="ml-auto">{(complianceResult.recommendations || []).length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(complianceResult.recommendations || []).slice(0, 5).map((r: any, idx: number) => (
                      <div key={idx} className="p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-green-900">{r.title}</span>
                          <Badge variant="outline" className="text-xs capitalize">{r.priority} priority</Badge>
                        </div>
                        <div className="text-sm text-green-800">{r.description}</div>
                        {typeof r.expectedBenefit === 'string' && (
                          <div className="text-xs text-green-700 mt-1">Benefit: {r.expectedBenefit}</div>
                        )}
                      </div>
                    ))}
                    {(complianceResult.recommendations || []).length === 0 && (
                      <div className="text-sm text-gray-500">No recommendations at this time.</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
