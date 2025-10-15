import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { SegmentedTabs } from '../components/ui/segmented-tabs';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Brain, MessageSquare, FileText, TrendingUp, BarChart3, Zap, Send, Loader2, CheckCircle, AlertCircle, Lightbulb, Shield } from 'lucide-react';
export const LlamaAIDemo = ({ companyId }) => {
    const API_BASE = import.meta.env.VITE_API_URL || 'https://urutiq-backend-clean-af6v.onrender.com';
    const [activeTab, setActiveTab] = useState('conversational');
    const [message, setMessage] = useState('');
    const [response, setResponse] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [documentContent, setDocumentContent] = useState('');
    const [documentQuery, setDocumentQuery] = useState('');
    const [uploadedPreview, setUploadedPreview] = useState(null);
    const [uploadedBase64, setUploadedBase64] = useState(null);
    const [showAllForecasts, setShowAllForecasts] = useState(false);
    const [predictiveResult, setPredictiveResult] = useState(null);
    const [complianceResult, setComplianceResult] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);
    const [mode, setMode] = useState('fast');
    const [latencyMs, setLatencyMs] = useState(null);
    // Missing handler functions
    const handleDocumentQuery = () => {
        console.log('Document query triggered');
    };
    const handleComplianceAnalysis = () => {
        console.log('Compliance analysis triggered');
    };
    const tabs = [
        { id: 'documents', label: 'Document Intelligence', icon: FileText },
        { id: 'analytics', label: 'Predictive Analytics', icon: TrendingUp },
        { id: 'compliance', label: 'Compliance & Audit', icon: Shield }
    ];
    const handleConversationalQuery = async () => {
        if (!message.trim())
            return;
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
            }
            else {
                throw new Error(result.error || 'Failed to process query');
            }
        }
        catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Unknown error');
            setResponse(null);
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleFileUpload = async (file) => {
        setErrorMessage(null);
        setIsLoading(true);
        try {
            const base64 = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
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
                    insights: (result.data.insights || []).map((i) => ({ type: i.type, description: i.description, confidence: i.confidence, impact: i.impact })),
                    followUpQuestions: [],
                });
            }
            else {
                setErrorMessage(result.error || 'Failed to process upload');
            }
        }
        catch (err) {
            setErrorMessage(err instanceof Error ? err.message : 'Unknown upload error');
        }
        finally {
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
                    insights: (result.data.insights || []).map((i) => ({ type: i.type, description: i.description, confidence: i.confidence, impact: i.impact })),
                    followUpQuestions: [],
                });
            }
            else {
                setErrorMessage(result.error || 'Failed to process uploaded file');
            }
        }
        catch (err) {
            setErrorMessage(err instanceof Error ? err.message : 'Unknown upload processing error');
        }
        finally {
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
            }
            else {
                setErrorMessage(result.error || 'Failed to generate forecast');
            }
        }
        catch (error) {
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
            }
            else {
                setErrorMessage(result.error || 'Compliance analysis failed');
                setComplianceResult(null);
            }
        }
        catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Error parsing compliance analysis response');
            setComplianceResult(null);
        }
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsx("div", { className: "bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6", children: _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "p-3 bg-purple-100 rounded-lg", children: _jsx(Brain, { className: "h-8 w-8 text-purple-600" }) }), _jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-purple-900", children: "Llama AI-Powered Intelligence" }), _jsx("p", { className: "text-purple-700", children: "Advanced conversational AI, document processing, and predictive analytics" })] })] }) }), _jsx("div", { className: "mb-6", children: _jsx(SegmentedTabs, { tabs: tabs.map(t => ({
                        id: t.id,
                        label: t.label,
                        icon: t.icon
                    })), value: activeTab, onChange: (id) => setActiveTab(id) }) }), activeTab === 'conversational' && (_jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center space-x-2", children: [_jsx(MessageSquare, { className: "h-5 w-5" }), _jsx("span", { children: "Chat with Llama AI" })] }), _jsx(CardDescription, { children: "Ask questions about your financial data, get insights, and receive intelligent recommendations" })] }), _jsxs(CardContent, { className: "space-y-4", children: [errorMessage && (_jsx("div", { className: "p-3 rounded-md border border-red-200 bg-red-50 text-red-800 text-sm", children: errorMessage })), _jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [_jsx("span", { className: "text-xs text-gray-500", children: "Mode:" }), ['fast', 'balanced', 'accurate'].map((m) => (_jsx("button", { type: "button", onClick: () => setMode(m), className: `text-xs px-2 py-1 rounded-full border ${mode === m ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-700 hover:bg-gray-50'}`, "aria-pressed": mode === m, children: m.charAt(0).toUpperCase() + m.slice(1) }, m))), latencyMs != null && (_jsxs("span", { className: "ml-auto text-xs text-gray-500", children: ["Latency: ", latencyMs, " ms"] }))] }), _jsx("div", { className: "flex flex-wrap gap-2", children: [
                                            'What are my top 3 expense categories this month?',
                                            'Forecast my cash flow for the next quarter',
                                            'Are there any unusual transactions this week?',
                                            'How can I improve my gross margin?'
                                        ].map((q) => (_jsx("button", { type: "button", onClick: () => setMessage(q), className: "text-xs px-2 py-1 rounded-full border bg-white hover:bg-gray-50 text-gray-700", children: q }, q))) }), _jsx(Textarea, { placeholder: "Ask me anything about your finances... e.g., 'What are my biggest expenses this month?' or 'How is my cash flow trending?'", value: message, onChange: (e) => setMessage(e.target.value), rows: 4 }), _jsx(Button, { onClick: handleConversationalQuery, disabled: isLoading || !message.trim(), className: "w-full", children: isLoading ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }), "Processing..."] })) : (_jsxs(_Fragment, { children: [_jsx(Send, { className: "mr-2 h-4 w-4" }), "Send Message"] })) })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center space-x-2", children: [_jsx(Brain, { className: "h-5 w-5" }), _jsx("span", { children: "AI Response" }), response && (_jsxs(Badge, { variant: "outline", className: "ml-auto", children: [Math.round(response.confidence * 100), "% confidence"] }))] }) }), _jsx(CardContent, { children: response ? (_jsxs("div", { className: "space-y-4", children: [_jsx("div", { className: "p-4 bg-gray-50 rounded-lg", children: _jsx("p", { className: "text-gray-900", children: response.message }) }), response.insights && response.insights.length > 0 ? (_jsxs("div", { children: [_jsx("h4", { className: "font-semibold text-gray-900 mb-2", children: "Insights" }), _jsx("div", { className: "space-y-2", children: response.insights.map((insight, index) => (_jsxs("div", { className: "flex items-start space-x-2", children: [_jsx(Lightbulb, { className: "h-4 w-4 text-yellow-500 mt-0.5" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-700", children: insight.description }), _jsxs(Badge, { variant: "outline", className: "text-xs", children: [insight.impact, " impact"] })] })] }, index))) })] })) : null, response.suggestions && response.suggestions.length > 0 ? (_jsxs("div", { children: [_jsx("h4", { className: "font-semibold text-gray-900 mb-2", children: "Suggestions" }), _jsx("ul", { className: "space-y-1", children: response.suggestions.map((suggestion, index) => (_jsxs("li", { className: "text-sm text-gray-600 flex items-start space-x-2", children: [_jsx(CheckCircle, { className: "h-3 w-3 text-green-500 mt-1" }), _jsx("span", { children: suggestion })] }, index))) })] })) : null, response.followUpQuestions && response.followUpQuestions.length > 0 ? (_jsxs("div", { children: [_jsx("h4", { className: "font-semibold text-gray-900 mb-2", children: "Follow-up Questions" }), _jsx("div", { className: "space-y-1", children: response.followUpQuestions.map((question, index) => (_jsx("button", { onClick: () => setMessage(question), className: "text-sm text-blue-600 hover:text-blue-800 text-left", children: question }, index))) })] })) : null] })) : (_jsxs("div", { className: "text-center py-8 text-gray-500", children: [_jsx(MessageSquare, { className: "h-12 w-12 mx-auto mb-4 text-gray-300" }), _jsx("p", { children: "Send a message to start chatting with Llama AI" })] })) })] })] })), activeTab === 'documents' && (_jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center space-x-2", children: [_jsx(FileText, { className: "h-5 w-5" }), _jsx("span", { children: "Document Analysis" })] }), _jsx(CardDescription, { children: "Upload documents and ask intelligent questions about their content" })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "border rounded-lg p-4 bg-gray-50", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Upload Receipt / Invoice Image" }), _jsx("input", { type: "file", accept: "image/*,application/pdf", onChange: (e) => {
                                                    const f = e.target.files?.[0];
                                                    if (f)
                                                        handleFileUpload(f);
                                                }, className: "block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100" }), uploadedPreview && (_jsx("div", { className: "mt-3", children: _jsx("img", { src: uploadedPreview, alt: "Uploaded preview", className: "max-h-40 rounded border" }) })), _jsx("div", { className: "mt-3 flex gap-2", children: _jsx(Button, { onClick: handleProcessUploaded, disabled: isLoading || !uploadedBase64, children: isLoading ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }), "Processing Upload..."] })) : (_jsxs(_Fragment, { children: [_jsx(Zap, { className: "mr-2 h-4 w-4" }), "Process Uploaded File"] })) }) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Document Content" }), _jsx(Textarea, { placeholder: "Paste document content here (invoices, contracts, receipts, etc.)", value: documentContent, onChange: (e) => setDocumentContent(e.target.value), rows: 6 })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Your Question" }), _jsx(Input, { placeholder: "e.g., 'What is the total amount?' or 'Who is the vendor?'", value: documentQuery, onChange: (e) => setDocumentQuery(e.target.value) })] }), _jsx(Button, { onClick: handleDocumentQuery, disabled: isLoading || !documentContent.trim() || !documentQuery.trim(), className: "w-full", children: isLoading ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }), "Analyzing..."] })) : (_jsxs(_Fragment, { children: [_jsx(Zap, { className: "mr-2 h-4 w-4" }), "Analyze Document"] })) })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center space-x-2", children: [_jsx(Brain, { className: "h-5 w-5" }), _jsx("span", { children: "Analysis Results" })] }) }), _jsx(CardContent, { children: response ? (_jsxs("div", { className: "space-y-4", children: [_jsx("div", { className: "p-4 bg-gray-50 rounded-lg", children: _jsx("p", { className: "text-gray-900", children: response.message }) }), response.entities && Object.keys(response.entities).length > 0 && (_jsxs("div", { children: [_jsx("h4", { className: "font-semibold text-gray-900 mb-2", children: "Extracted Entities" }), _jsx("div", { className: "space-y-2", children: Object.entries(response.entities).map(([key, value]) => (_jsxs("div", { className: "text-sm", children: [_jsxs("div", { className: "font-medium text-gray-600 mb-1", children: [key, ":"] }), Array.isArray(value) ? (_jsx("div", { className: "text-gray-900", children: value.map((v, i) => (_jsxs("span", { className: "mr-1", children: [typeof v === 'object' ? JSON.stringify(v) : String(v), i < value.length - 1 ? ',' : ''] }, i))) })) : typeof value === 'object' && value !== null ? (_jsx("pre", { className: "bg-gray-100 rounded-md p-2 text-xs text-gray-800 overflow-auto", children: JSON.stringify(value, null, 2) })) : (_jsx("span", { className: "text-gray-900", children: String(value) }))] }, key))) })] }))] })) : (_jsxs("div", { className: "text-center py-8 text-gray-500", children: [_jsx(FileText, { className: "h-12 w-12 mx-auto mb-4 text-gray-300" }), _jsx("p", { children: "Upload a document and ask a question to get started" })] })) })] })] })), activeTab === 'analytics' && (_jsxs("div", { className: "space-y-6", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center space-x-2", children: [_jsx(TrendingUp, { className: "h-5 w-5" }), _jsx("span", { children: "Predictive Analytics" })] }), _jsx(CardDescription, { children: "Generate comprehensive business forecasts and insights using Llama AI" })] }), _jsx(CardContent, { children: _jsx(Button, { onClick: handlePredictiveAnalysis, disabled: isLoading, className: "w-full", children: isLoading ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }), "Generating Forecast..."] })) : (_jsxs(_Fragment, { children: [_jsx(BarChart3, { className: "mr-2 h-4 w-4" }), "Generate 12-Month Business Forecast"] })) }) })] }), predictiveResult ? (_jsx("div", { className: "space-y-4", children: _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center space-x-2", children: [_jsx(TrendingUp, { className: "h-5 w-5" }), _jsx("span", { children: "Forecasts" })] }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-3", children: predictiveResult.forecasts && predictiveResult.forecasts.length > 0 ? (_jsxs(_Fragment, { children: [(showAllForecasts ? predictiveResult.forecasts : predictiveResult.forecasts.slice(0, 4)).map((forecast, index) => (_jsxs("div", { className: "p-3 bg-gray-50 rounded-lg", children: [_jsxs("div", { className: "flex justify-between items-center mb-1", children: [_jsx("span", { className: "font-medium text-gray-900 capitalize", children: (forecast.type || 'unknown').replace('_', ' ') }), _jsx(Badge, { variant: "outline", children: forecast.trend || 'stable' })] }), _jsxs("div", { className: "text-lg font-bold text-gray-900", children: ["$", forecast.predictedValue ? forecast.predictedValue.toLocaleString() : '0'] }), _jsxs("div", { className: "text-sm text-gray-500", children: [forecast.period || 'Unknown', " \u2022 ", Math.round((forecast.confidence || 0) * 100), "% confidence"] })] }, index))), predictiveResult.forecasts.length > 4 && (_jsx("div", { className: "text-center pt-2", children: _jsx(Button, { variant: "outline", size: "sm", onClick: () => setShowAllForecasts(!showAllForecasts), children: showAllForecasts ? 'Show Less' : `Show All ${predictiveResult.forecasts.length} Forecasts` }) }))] })) : null }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center space-x-2", children: [_jsx(Lightbulb, { className: "h-5 w-5" }), _jsx("span", { children: "Insights" })] }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-3", children: predictiveResult.insights && predictiveResult.insights.length > 0 ? (predictiveResult.insights.map((insight, index) => (_jsxs("div", { className: "p-3 bg-blue-50 rounded-lg", children: [_jsxs("div", { className: "flex items-center space-x-2 mb-1", children: [_jsx("span", { className: "font-medium text-blue-900", children: insight.title }), _jsxs(Badge, { variant: "outline", className: "text-xs", children: [insight.impact, " impact"] })] }), _jsx("p", { className: "text-sm text-blue-700", children: insight.description }), _jsxs("div", { className: "text-xs text-blue-600 mt-1", children: [Math.round(insight.confidence * 100), "% confidence"] })] }, index)))) : null }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center space-x-2", children: [_jsx(CheckCircle, { className: "h-5 w-5" }), _jsx("span", { children: "Recommendations" })] }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-3", children: predictiveResult.recommendations && predictiveResult.recommendations.length > 0 ? (predictiveResult.recommendations.map((rec, index) => (_jsxs("div", { className: "p-3 bg-green-50 rounded-lg", children: [_jsxs("div", { className: "flex items-center space-x-2 mb-1", children: [_jsx("span", { className: "font-medium text-green-900", children: rec.title }), _jsxs(Badge, { variant: "outline", className: "text-xs", children: [rec.priority, " priority"] })] }), _jsx("p", { className: "text-sm text-green-700", children: rec.description }), _jsxs("div", { className: "text-xs text-green-600 mt-1", children: ["Expected impact: ", Math.round(rec.expectedImpact * 100), "%"] })] }, index)))) : null }) })] })] }) })) : (_jsx("div", { className: "p-4 bg-yellow-50 rounded-lg border border-yellow-200", children: _jsxs("div", { className: "text-center py-8 text-gray-500", children: [_jsx(TrendingUp, { className: "h-12 w-12 mx-auto mb-4 text-gray-300" }), _jsx("p", { children: "Click \"Generate 12-Month Business Forecast\" to get started" })] }) }))] })), activeTab === 'compliance' && (_jsxs("div", { className: "space-y-6", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center space-x-2", children: [_jsx(Shield, { className: "h-5 w-5" }), _jsx("span", { children: "Compliance & Audit Analysis" })] }), _jsx(CardDescription, { children: "Run an automated compliance risk assessment, detect violations, and get remediation recommendations" })] }), _jsxs(CardContent, { children: [errorMessage && (_jsx("div", { className: "mb-4 p-3 rounded-md border border-red-200 bg-red-50 text-red-800 text-sm", children: errorMessage })), _jsx(Button, { onClick: handleComplianceAnalysis, disabled: isLoading, className: "w-full", children: isLoading ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }), "Analyzing Compliance..."] })) : (_jsxs(_Fragment, { children: [_jsx(Shield, { className: "mr-2 h-4 w-4" }), "Run Compliance Analysis"] })) })] })] }), complianceResult && (_jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center space-x-2", children: [_jsx(Shield, { className: "h-5 w-5" }), _jsx("span", { children: "Compliance Overview" })] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "p-3 bg-gray-50 rounded-lg", children: [_jsx("div", { className: "text-sm text-gray-600", children: "Compliance Score" }), _jsxs("div", { className: "text-2xl font-bold text-gray-900", children: [Math.round(complianceResult.complianceScore), " / 100"] })] }), complianceResult.riskAssessment && (_jsxs("div", { className: "p-3 bg-gray-50 rounded-lg", children: [_jsx("div", { className: "text-sm text-gray-600", children: "Overall Risk" }), _jsx("div", { className: "text-lg font-semibold capitalize", children: complianceResult.riskAssessment.overallRisk }), _jsxs("div", { className: "text-xs text-gray-500", children: ["Next review: ", new Date(complianceResult.riskAssessment.nextReviewDate).toLocaleDateString()] })] }))] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center space-x-2", children: [_jsx(AlertCircle, { className: "h-5 w-5" }), _jsx("span", { children: "Detected Violations" }), _jsx(Badge, { variant: "outline", className: "ml-auto", children: (complianceResult.violations || []).length })] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-3", children: [(complianceResult.violations || []).slice(0, 5).map((v, idx) => (_jsxs("div", { className: "p-3 bg-red-50 rounded-lg", children: [_jsxs("div", { className: "flex items-center justify-between mb-1", children: [_jsx("span", { className: "font-medium text-red-900 capitalize", children: v.type }), _jsx(Badge, { variant: "outline", className: "text-xs capitalize", children: v.severity })] }), _jsx("div", { className: "text-sm text-red-800", children: v.description }), v.regulation && (_jsxs("div", { className: "text-xs text-red-700 mt-1", children: ["Regulation: ", v.regulation] })), v.remediation && (_jsxs("div", { className: "text-xs text-red-700 mt-1", children: ["Remediation: ", v.remediation] }))] }, idx))), (complianceResult.violations || []).length === 0 && (_jsx("div", { className: "text-sm text-gray-500", children: "No violations detected." }))] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center space-x-2", children: [_jsx(CheckCircle, { className: "h-5 w-5" }), _jsx("span", { children: "Recommendations" }), _jsx(Badge, { variant: "outline", className: "ml-auto", children: (complianceResult.recommendations || []).length })] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-3", children: [(complianceResult.recommendations || []).slice(0, 5).map((r, idx) => (_jsxs("div", { className: "p-3 bg-green-50 rounded-lg", children: [_jsxs("div", { className: "flex items-center justify-between mb-1", children: [_jsx("span", { className: "font-medium text-green-900", children: r.title }), _jsxs(Badge, { variant: "outline", className: "text-xs capitalize", children: [r.priority, " priority"] })] }), _jsx("div", { className: "text-sm text-green-800", children: r.description }), typeof r.expectedBenefit === 'string' && (_jsxs("div", { className: "text-xs text-green-700 mt-1", children: ["Benefit: ", r.expectedBenefit] }))] }, idx))), (complianceResult.recommendations || []).length === 0 && (_jsx("div", { className: "text-sm text-gray-500", children: "No recommendations at this time." }))] }) })] })] }))] }))] }));
};
