import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { MessageSquare, Send, Bot, User, Mic, Sparkles, TrendingUp, DollarSign, FileText, Users, BarChart3, Lightbulb, Loader2, Volume2, VolumeX } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiService from '@/lib/api';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth-context';
export function AIAccountingChat({ onActionExecuted }) {
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [sessionId, setSessionId] = useState(null);
    const [selectedCompanyId, setSelectedCompanyId] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [showInsights, setShowInsights] = useState(false);
    const messagesEndRef = useRef(null);
    const queryClient = useQueryClient();
    const { user } = useAuth();
    // Get user's companies
    const { data: companies } = useQuery({
        queryKey: ['companies'],
        queryFn: () => apiService.getCompanies(),
        enabled: !!user
    });
    // Get financial insights
    const { data: insights } = useQuery({
        queryKey: ['financial-insights', selectedCompanyId],
        queryFn: () => apiService.getFinancialInsights(selectedCompanyId),
        enabled: !!selectedCompanyId
    });
    // Send message mutation
    const sendMessageMutation = useMutation({
        mutationFn: (data) => apiService.sendChatMessage(data),
        onSuccess: (response) => {
            if (response.success) {
                // Add user message
                const userMessage = {
                    id: `user_${Date.now()}`,
                    role: 'user',
                    content: response.response.message,
                    timestamp: new Date()
                };
                // Add AI response
                const aiMessage = {
                    id: `ai_${Date.now()}`,
                    role: 'assistant',
                    content: response.response.message,
                    timestamp: new Date(),
                    metadata: {
                        action: response.response.action?.type,
                        confidence: response.response.action?.confidence,
                        suggestions: response.response.suggestions
                    }
                };
                setMessages(prev => [...prev, userMessage, aiMessage]);
                setInputMessage('');
                // Speak the response
                if (response.response.message) {
                    speakText(response.response.message);
                }
            }
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to send message');
        }
    });
    // Execute action mutation
    const executeActionMutation = useMutation({
        mutationFn: (action) => apiService.executeChatAction(action),
        onSuccess: (response) => {
            if (response.success) {
                toast.success(response.message);
                onActionExecuted?.(response.result?.type || 'unknown', response.result);
                queryClient.invalidateQueries({ queryKey: ['invoices'] });
                queryClient.invalidateQueries({ queryKey: ['expenses'] });
                queryClient.invalidateQueries({ queryKey: ['customers'] });
            }
            else {
                toast.error(response.message);
            }
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to execute action');
        }
    });
    // Start session mutation
    const startSessionMutation = useMutation({
        mutationFn: (companyId) => apiService.startChatSession(companyId),
        onSuccess: (response) => {
            if (response.success) {
                setSessionId(response.sessionId);
                // Add welcome message
                const welcomeMessage = {
                    id: `welcome_${Date.now()}`,
                    role: 'assistant',
                    content: `Hi! I'm your AI accounting assistant. I can help you with invoices, expenses, customers, reports, and answer any financial questions. What would you like to do today?`,
                    timestamp: new Date()
                };
                setMessages([welcomeMessage]);
            }
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to start session');
        }
    });
    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);
    // Start session when company is selected
    useEffect(() => {
        if (selectedCompanyId && !sessionId) {
            startSessionMutation.mutate(selectedCompanyId);
        }
    }, [selectedCompanyId]);
    const handleSendMessage = () => {
        if (!inputMessage.trim() || !selectedCompanyId || !sessionId) {
            toast.error('Please select a company and enter a message');
            return;
        }
        sendMessageMutation.mutate({
            message: inputMessage.trim(),
            companyId: selectedCompanyId,
            sessionId,
            conversationHistory: messages
        });
    };
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };
    const handleSuggestionClick = (suggestion) => {
        setInputMessage(suggestion.text);
    };
    const handleActionClick = (action) => {
        executeActionMutation.mutate(action);
    };
    const speakText = (text) => {
        if ('speechSynthesis' in window) {
            setIsSpeaking(true);
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.onend = () => setIsSpeaking(false);
            utterance.onerror = () => setIsSpeaking(false);
            speechSynthesis.speak(utterance);
        }
    };
    const stopSpeaking = () => {
        if ('speechSynthesis' in window) {
            speechSynthesis.cancel();
            setIsSpeaking(false);
        }
    };
    const startListening = () => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'en-US';
            recognition.onstart = () => setIsListening(true);
            recognition.onend = () => setIsListening(false);
            recognition.onerror = () => setIsListening(false);
            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setInputMessage(transcript);
            };
            recognition.start();
        }
        else {
            toast.error('Speech recognition not supported in this browser');
        }
    };
    const getMessageIcon = (role) => {
        switch (role) {
            case 'user': return _jsx(User, { className: "w-4 h-4" });
            case 'assistant': return _jsx(Bot, { className: "w-4 h-4" });
            default: return _jsx(MessageSquare, { className: "w-4 h-4" });
        }
    };
    const getActionIcon = (actionType) => {
        switch (actionType) {
            case 'create_invoice': return _jsx(FileText, { className: "w-4 h-4" });
            case 'create_expense': return _jsx(DollarSign, { className: "w-4 h-4" });
            case 'create_customer': return _jsx(Users, { className: "w-4 h-4" });
            case 'generate_report': return _jsx(BarChart3, { className: "w-4 h-4" });
            case 'analyze_data': return _jsx(TrendingUp, { className: "w-4 h-4" });
            default: return _jsx(Sparkles, { className: "w-4 h-4" });
        }
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Bot, { className: "w-5 h-5" }), "AI Accounting Assistant"] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("div", { className: "flex-1", children: [_jsx(Label, { htmlFor: "company", children: "Select Company" }), _jsxs(Select, { value: selectedCompanyId, onValueChange: setSelectedCompanyId, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Choose a company to chat with AI" }) }), _jsx(SelectContent, { children: companies?.data?.map((company) => (_jsx(SelectItem, { value: company.id, children: company.name }, company.id))) })] })] }), _jsxs(Button, { variant: "outline", onClick: () => setShowInsights(!showInsights), className: "flex items-center gap-2", children: [_jsx(TrendingUp, { className: "w-4 h-4" }), showInsights ? 'Hide' : 'Show', " Insights"] })] }) })] }), showInsights && insights && (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Lightbulb, { className: "w-5 h-5" }), "Financial Insights"] }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 mb-4", children: [_jsxs("div", { className: "text-center", children: [_jsxs("div", { className: "text-2xl font-bold text-green-600", children: ["$", insights.insights.financialSummary.totalRevenue.toLocaleString()] }), _jsx("div", { className: "text-sm text-gray-600", children: "Total Revenue" })] }), _jsxs("div", { className: "text-center", children: [_jsxs("div", { className: "text-2xl font-bold text-red-600", children: ["$", insights.insights.financialSummary.totalExpenses.toLocaleString()] }), _jsx("div", { className: "text-sm text-gray-600", children: "Total Expenses" })] }), _jsxs("div", { className: "text-center", children: [_jsxs("div", { className: `text-2xl font-bold ${insights.insights.financialSummary.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`, children: ["$", insights.insights.financialSummary.netIncome.toLocaleString()] }), _jsx("div", { className: "text-sm text-gray-600", children: "Net Income" })] })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-sm font-medium", children: "AI Recommendations" }), _jsx("div", { className: "space-y-2 mt-2", children: insights.insights.recommendations.map((recommendation, index) => (_jsxs("div", { className: "flex items-start gap-2 p-2 bg-blue-50 rounded-lg", children: [_jsx(Lightbulb, { className: "w-4 h-4 text-blue-600 mt-0.5" }), _jsx("span", { className: "text-sm text-blue-800", children: recommendation })] }, index))) })] })] })] })), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center justify-between", children: [_jsxs("span", { className: "flex items-center gap-2", children: [_jsx(MessageSquare, { className: "w-5 h-5" }), "Chat with AI Assistant"] }), _jsx("div", { className: "flex items-center gap-2", children: isSpeaking ? (_jsx(Button, { variant: "outline", size: "sm", onClick: stopSpeaking, children: _jsx(VolumeX, { className: "w-4 h-4" }) })) : (_jsx(Button, { variant: "outline", size: "sm", onClick: () => speakText(messages[messages.length - 1]?.content || ''), children: _jsx(Volume2, { className: "w-4 h-4" }) })) })] }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "space-y-4 mb-4 max-h-96 overflow-y-auto", children: [messages.map((message) => (_jsxs("div", { className: `flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`, children: [message.role !== 'user' && (_jsx("div", { className: "flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center", children: getMessageIcon(message.role) })), _jsxs("div", { className: `max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.role === 'user'
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-gray-100 text-gray-900'}`, children: [_jsx("div", { className: "text-sm", children: message.content }), _jsx("div", { className: `text-xs mt-1 ${message.role === 'user' ? 'text-blue-100' : 'text-gray-500'}`, children: new Date(message.timestamp).toLocaleTimeString() })] }), message.role === 'user' && (_jsx("div", { className: "flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center", children: getMessageIcon(message.role) }))] }, message.id))), _jsx("div", { ref: messagesEndRef })] }), messages.length > 0 && messages[messages.length - 1]?.metadata?.suggestions && (_jsxs("div", { className: "mb-4", children: [_jsx(Label, { className: "text-sm font-medium mb-2 block", children: "Quick Actions" }), _jsx("div", { className: "flex flex-wrap gap-2", children: messages[messages.length - 1]?.metadata?.suggestions?.map((suggestion, index) => (_jsxs(Button, { variant: "outline", size: "sm", onClick: () => handleSuggestionClick(suggestion), className: "flex items-center gap-2", children: [getActionIcon(suggestion.action), suggestion.text] }, index))) })] })), _jsxs("div", { className: "flex gap-2", children: [_jsx("div", { className: "flex-1", children: _jsx(Textarea, { value: inputMessage, onChange: (e) => setInputMessage(e.target.value), onKeyPress: handleKeyPress, placeholder: "Ask me anything about your finances... (e.g., 'Create an invoice for Acme Corp for $500', 'Show me my expenses this month', 'How's my business doing?')", className: "min-h-[60px] resize-none", disabled: sendMessageMutation.isPending }) }), _jsxs("div", { className: "flex flex-col gap-2", children: [_jsx(Button, { onClick: handleSendMessage, disabled: !inputMessage.trim() || !selectedCompanyId || sendMessageMutation.isPending, className: "flex items-center gap-2", children: sendMessageMutation.isPending ? (_jsx(Loader2, { className: "w-4 h-4 animate-spin" })) : (_jsx(Send, { className: "w-4 h-4" })) }), _jsx(Button, { variant: "outline", size: "sm", onClick: isListening ? undefined : startListening, disabled: isListening, className: "flex items-center gap-2", children: isListening ? (_jsx(Loader2, { className: "w-4 h-4 animate-spin" })) : (_jsx(Mic, { className: "w-4 h-4" })) })] })] }), _jsxs("div", { className: "flex items-center justify-between mt-2 text-xs text-gray-500", children: [_jsxs("div", { children: [sendMessageMutation.isPending && 'AI is thinking...', isListening && 'Listening...', isSpeaking && 'Speaking...'] }), _jsx("div", { children: sessionId && `Session: ${sessionId.slice(-8)}` })] })] })] })] }));
}
