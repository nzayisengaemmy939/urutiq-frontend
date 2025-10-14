import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Send, Bot, User, Sparkles, Minimize2, Maximize2, Plus, Search, DollarSign, FileText, Brain, Lightbulb, AlertTriangle, Zap, } from "lucide-react";
import { useToast } from "../hooks/use-toast";
const initialMessages = [
    {
        id: "welcome",
        type: "ai",
        content: "Hi! I'm your enhanced AI accounting assistant powered by Llama 3.1. I can help you with:\n\n• Transaction categorization and bookkeeping\n• Financial analysis and reporting\n• Anomaly detection and fraud prevention\n• Cash flow forecasting and insights\n• Natural language queries\n• Business recommendations\n\nTry asking me to 'categorize my recent transactions' or 'show me a cash flow report for this month'.",
        timestamp: new Date(),
        suggestions: [
            "Categorize my recent transactions",
            "Show me cash flow for this month",
            "Detect any anomalies in my data",
            "Generate a revenue report",
            "Forecast my cash flow for Q2",
            "Find unusual transactions",
        ],
    },
];
export function AIAssistantEnhanced() {
    const [messages, setMessages] = useState(initialMessages);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState("");
    const [aiMode, setAiMode] = useState("assistant");
    const messagesEndRef = useRef(null);
    const idCounterRef = useRef(0);
    const { toast } = useToast();
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    useEffect(() => {
        scrollToBottom();
    }, [messages]);
    const callAIAssistant = async (userQuery) => {
        if (!selectedCompany) {
            return {
                response: "Please select a company first to enable AI assistance.",
                actions: [],
                confidence: 0
            };
        }
        try {
            const response = await fetch('/api/ai/assistant/query', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-tenant-id': 'tenant_demo',
                    'x-company-id': selectedCompany
                },
                body: JSON.stringify({
                    companyId: selectedCompany,
                    query: userQuery,
                    context: {
                        mode: aiMode,
                        timestamp: new Date().toISOString()
                    }
                })
            });
            if (!response.ok) {
                throw new Error('Failed to get AI response');
            }
            const result = await response.json();
            return result.result;
        }
        catch (error) {
            console.error('AI Assistant error:', error);
            return {
                response: "I'm having trouble connecting to the AI service. Please try again or contact support.",
                actions: [],
                confidence: 0
            };
        }
    };
    const categorizeTransactions = async () => {
        if (!selectedCompany) {
            toast({
                title: "Company Required",
                description: "Please select a company first",
                variant: "destructive"
            });
            return;
        }
        try {
            const response = await fetch('/api/ai/categorize/batch', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-tenant-id': 'tenant_demo',
                    'x-company-id': selectedCompany
                },
                body: JSON.stringify({
                    companyId: selectedCompany,
                    transactions: [
                        {
                            id: "1",
                            description: "Payment to Airtel 45,000 RWF",
                            amount: 45000,
                            transactionType: "expense"
                        },
                        {
                            id: "2",
                            description: "Office supplies from Stationery Plus",
                            amount: 25000,
                            transactionType: "expense"
                        }
                    ]
                })
            });
            if (!response.ok) {
                throw new Error('Failed to categorize transactions');
            }
            const result = await response.json();
            return `Successfully categorized ${result.processed} transactions. Categories assigned based on AI analysis.`;
        }
        catch (error) {
            console.error('Categorization error:', error);
            return "Failed to categorize transactions. Please try again.";
        }
    };
    const generateReport = async (query) => {
        if (!selectedCompany) {
            toast({
                title: "Company Required",
                description: "Please select a company first",
                variant: "destructive"
            });
            return;
        }
        try {
            const response = await fetch('/api/ai/reports/natural-language', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-tenant-id': 'tenant_demo',
                    'x-company-id': selectedCompany
                },
                body: JSON.stringify({
                    companyId: selectedCompany,
                    query: query
                })
            });
            if (!response.ok) {
                throw new Error('Failed to generate report');
            }
            const result = await response.json();
            return result.report.summary || result.report.fallback || "Report generated successfully.";
        }
        catch (error) {
            console.error('Report generation error:', error);
            return "Failed to generate report. Please try again.";
        }
    };
    const detectAnomalies = async () => {
        if (!selectedCompany) {
            toast({
                title: "Company Required",
                description: "Please select a company first",
                variant: "destructive"
            });
            return;
        }
        try {
            const response = await fetch('/api/ai/anomalies/enhanced', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-tenant-id': 'tenant_demo',
                    'x-company-id': selectedCompany
                },
                body: JSON.stringify({
                    companyId: selectedCompany,
                    transactions: [
                        {
                            id: "1",
                            description: "Payment to Airtel 45,000 RWF",
                            amount: 45000,
                            transactionDate: new Date(),
                            transactionType: "expense"
                        }
                    ]
                })
            });
            if (!response.ok) {
                throw new Error('Failed to detect anomalies');
            }
            const result = await response.json();
            return `Anomaly detection completed. Found ${result.detected} potential issues.`;
        }
        catch (error) {
            console.error('Anomaly detection error:', error);
            return "Failed to detect anomalies. Please try again.";
        }
    };
    const handleSend = async () => {
        if (!input.trim())
            return;
        const userMessage = {
            id: `msg-${idCounterRef.current++}`,
            type: "user",
            content: input,
            timestamp: new Date(),
        };
        setMessages((prev) => [...prev, userMessage]);
        const currentInput = input;
        setInput("");
        setIsTyping(true);
        try {
            // Determine the type of request and handle accordingly
            const lowerQuery = currentInput.toLowerCase();
            let aiResponse;
            if (lowerQuery.includes('categorize') || lowerQuery.includes('category')) {
                const result = await categorizeTransactions();
                aiResponse = {
                    response: result,
                    actions: ['View categorized transactions', 'Export results', 'Review categories'],
                    confidence: 85
                };
            }
            else if (lowerQuery.includes('report') || lowerQuery.includes('show me') || lowerQuery.includes('generate')) {
                const result = await generateReport(currentInput);
                aiResponse = {
                    response: result,
                    actions: ['Download report', 'Share report', 'Schedule regular reports'],
                    confidence: 90
                };
            }
            else if (lowerQuery.includes('anomaly') || lowerQuery.includes('unusual') || lowerQuery.includes('fraud')) {
                const result = await detectAnomalies();
                aiResponse = {
                    response: result,
                    actions: ['Review anomalies', 'Set up alerts', 'Investigate further'],
                    confidence: 88
                };
            }
            else {
                // General AI assistant query
                aiResponse = await callAIAssistant(currentInput);
            }
            const aiMessage = {
                id: `msg-${idCounterRef.current++}`,
                type: "ai",
                content: aiResponse.response,
                timestamp: new Date(),
                suggestions: aiResponse.actions?.slice(0, 3),
                dataAction: {
                    type: "analyze",
                    data: aiResponse.data,
                    confirmed: false
                },
                confidence: aiResponse.confidence,
                actions: aiResponse.actions
            };
            setMessages((prev) => [...prev, aiMessage]);
        }
        catch (error) {
            console.error('Error processing message:', error);
            const errorMessage = {
                id: `msg-${idCounterRef.current++}`,
                type: "ai",
                content: "I encountered an error processing your request. Please try again or contact support.",
                timestamp: new Date(),
                suggestions: ["Try again", "Contact support", "Check connection"]
            };
            setMessages((prev) => [...prev, errorMessage]);
        }
        finally {
            setIsTyping(false);
        }
    };
    const handleDataAction = (messageId, action) => {
        setMessages((prev) => prev.map((msg) => {
            if (msg.id === messageId && msg.dataAction) {
                const confirmationMessage = {
                    id: Date.now().toString(),
                    type: "ai",
                    content: getDataActionConfirmation(msg.dataAction.type, action),
                    timestamp: new Date(),
                    suggestions: [
                        "Continue with another task",
                        "View results",
                        "Export data",
                        "What else can I help with?",
                    ],
                };
                setTimeout(() => {
                    setMessages((prev) => [...prev, confirmationMessage]);
                }, 500);
                return { ...msg, dataAction: { ...msg.dataAction, confirmed: true } };
            }
            return msg;
        }));
    };
    const getDataActionConfirmation = (actionType, action) => {
        if (action === "Cancel" || action === "Cancel recording") {
            return "Action cancelled. What else can I help you with?";
        }
        switch (actionType) {
            case "categorize":
                return `✅ Transaction categorization completed: ${action}\nThe AI has analyzed and categorized your transactions with high confidence.`;
            case "report":
                return `✅ Report generated successfully: ${action}\nYour natural language report has been created and is ready for review.`;
            case "analyze":
                return `✅ Analysis completed: ${action}\nAI insights and recommendations have been generated based on your data.`;
            case "forecast":
                return `✅ Forecast generated: ${action}\nCash flow predictions and risk assessments have been calculated.`;
            default:
                return "✅ Action completed successfully.";
        }
    };
    const handleSuggestionClick = (suggestion) => {
        setInput(suggestion);
    };
    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };
    const getConfidenceColor = (confidence) => {
        if (confidence >= 90)
            return "text-green-600";
        if (confidence >= 70)
            return "text-yellow-600";
        return "text-red-600";
    };
    const getConfidenceBadge = (confidence) => {
        if (confidence >= 90)
            return _jsx(Badge, { className: "bg-green-100 text-green-700 text-xs", children: "High" });
        if (confidence >= 70)
            return _jsx(Badge, { className: "bg-yellow-100 text-yellow-700 text-xs", children: "Medium" });
        return _jsx(Badge, { className: "bg-red-100 text-red-700 text-xs", children: "Low" });
    };
    return (_jsxs(Card, { className: `bg-card border-border transition-all duration-300 ${isMinimized ? "h-16" : "h-[600px]"}`, children: [_jsx(CardHeader, { className: "pb-2", children: _jsxs(CardTitle, { className: "flex items-center justify-between text-foreground", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Brain, { className: "w-5 h-5 text-cyan-600" }), "Enhanced AI Assistant", _jsxs(Badge, { variant: "secondary", className: "bg-cyan-100 text-cyan-700 text-xs", children: [_jsx(Zap, { className: "w-3 h-3 mr-1" }), "Llama 3.1"] }), _jsxs(Badge, { variant: "secondary", className: "bg-green-100 text-green-700 text-xs", children: [_jsx(Sparkles, { className: "w-3 h-3 mr-1" }), "Smart"] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs(Select, { value: aiMode, onValueChange: setAiMode, children: [_jsx(SelectTrigger, { className: "w-32 h-6 text-xs", children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "assistant", children: "Assistant" }), _jsx(SelectItem, { value: "analyst", children: "Analyst" }), _jsx(SelectItem, { value: "advisor", children: "Advisor" })] })] }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => setIsMinimized(!isMinimized), className: "h-6 w-6 p-0", children: isMinimized ? _jsx(Maximize2, { className: "w-3 h-3" }) : _jsx(Minimize2, { className: "w-3 h-3" }) })] })] }) }), !isMinimized && (_jsxs(CardContent, { className: "flex flex-col h-[520px]", children: [_jsx("div", { className: "mb-4", children: _jsxs(Select, { value: selectedCompany, onValueChange: setSelectedCompany, children: [_jsx(SelectTrigger, { className: "w-full", children: _jsx(SelectValue, { placeholder: "Select company for AI assistance" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "company_1", children: "Demo Company 1" }), _jsx(SelectItem, { value: "company_2", children: "Demo Company 2" })] })] }) }), _jsxs("div", { className: "flex-1 overflow-y-auto space-y-3 mb-4", children: [messages.map((message) => (_jsx("div", { className: `flex gap-3 ${message.type === "user" ? "justify-end" : "justify-start"}`, children: _jsxs("div", { className: `flex gap-2 max-w-[80%] ${message.type === "user" ? "flex-row-reverse" : "flex-row"}`, children: [_jsx("div", { className: `w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${message.type === "user" ? "bg-cyan-600" : "bg-muted"}`, children: message.type === "user" ? (_jsx(User, { className: "w-3 h-3 text-white" })) : (_jsx(Bot, { className: "w-3 h-3 text-muted-foreground" })) }), _jsxs("div", { className: `p-3 rounded-lg ${message.type === "user" ? "bg-cyan-600 text-white" : "bg-muted text-foreground"}`, children: [_jsx("p", { className: "text-sm whitespace-pre-line", children: message.content }), message.confidence && (_jsxs("div", { className: "flex items-center gap-2 mt-2", children: [getConfidenceBadge(message.confidence), _jsxs("span", { className: `text-xs ${getConfidenceColor(message.confidence)}`, children: [message.confidence, "% confidence"] })] })), message.suggestions && (_jsx("div", { className: "flex flex-wrap gap-1 mt-2", children: message.suggestions.map((suggestion, index) => {
                                                        const isDataAction = message.dataAction && !message.dataAction.confirmed;
                                                        const getIcon = (text) => {
                                                            if (text.includes("categorize") || text.includes("record") || text.includes("add"))
                                                                return _jsx(Plus, { className: "w-3 h-3 mr-1" });
                                                            if (text.includes("show") || text.includes("find") || text.includes("export"))
                                                                return _jsx(Search, { className: "w-3 h-3 mr-1" });
                                                            if (text.includes("cash") || text.includes("balance"))
                                                                return _jsx(DollarSign, { className: "w-3 h-3 mr-1" });
                                                            if (text.includes("report") || text.includes("analyze"))
                                                                return _jsx(FileText, { className: "w-3 h-3 mr-1" });
                                                            if (text.includes("anomaly") || text.includes("unusual"))
                                                                return _jsx(AlertTriangle, { className: "w-3 h-3 mr-1" });
                                                            return _jsx(Lightbulb, { className: "w-3 h-3 mr-1" });
                                                        };
                                                        return (_jsxs(Button, { variant: "ghost", size: "sm", onClick: () => isDataAction
                                                                ? handleDataAction(message.id, suggestion)
                                                                : handleSuggestionClick(suggestion), className: "h-6 text-xs px-2 bg-background/20 hover:bg-background/40 text-current flex items-center", children: [getIcon(suggestion), suggestion] }, index));
                                                    }) }))] })] }) }, message.id))), isTyping && (_jsxs("div", { className: "flex gap-3", children: [_jsx("div", { className: "w-6 h-6 rounded-full bg-muted flex items-center justify-center", children: _jsx(Bot, { className: "w-3 h-3 text-muted-foreground" }) }), _jsx("div", { className: "bg-muted p-3 rounded-lg", children: _jsxs("div", { className: "flex gap-1", children: [_jsx("div", { className: "w-2 h-2 bg-muted-foreground rounded-full animate-bounce" }), _jsx("div", { className: "w-2 h-2 bg-muted-foreground rounded-full animate-bounce", style: { animationDelay: "0.1s" } }), _jsx("div", { className: "w-2 h-2 bg-muted-foreground rounded-full animate-bounce", style: { animationDelay: "0.2s" } })] }) })] })), _jsx("div", { ref: messagesEndRef })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Input, { value: input, onChange: (e) => setInput(e.target.value), onKeyPress: handleKeyPress, placeholder: "Ask me anything about your accounting data...", className: "flex-1 text-sm", disabled: isTyping || !selectedCompany }), _jsx(Button, { onClick: handleSend, disabled: !input.trim() || isTyping || !selectedCompany, size: "sm", className: "px-3", children: _jsx(Send, { className: "w-4 h-4" }) })] })] }))] }));
}
