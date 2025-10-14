import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Mic, MicOff, Volume2, VolumeX, Settings, History, BarChart3, RefreshCw, CheckCircle, Clock, HelpCircle, Lightbulb, Headphones, Edit, Target } from 'lucide-react';
// API Functions
const api = {
    getSettings: async (companyId, userId) => {
        const response = await fetch(`/api/voice/settings/${companyId}/${userId}`);
        return response.json();
    },
    updateSettings: async (companyId, userId, updates) => {
        const response = await fetch(`/api/voice/settings/${companyId}/${userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
        });
        return response.json();
    },
    startSession: async (companyId, userId, language) => {
        const response = await fetch(`/api/voice/session/${companyId}/${userId}/start`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ language })
        });
        return response.json();
    },
    endSession: async (sessionId) => {
        const response = await fetch(`/api/voice/session/${sessionId}/end`, {
            method: 'PUT'
        });
        return response.json();
    },
    processCommand: async (companyId, userId, audioData, sessionId) => {
        const response = await fetch(`/api/voice/command/${companyId}/${userId}/process`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ audioData, sessionId })
        });
        return response.json();
    },
    getCommandHistory: async (companyId, userId, limit) => {
        const params = new URLSearchParams();
        if (limit)
            params.append('limit', limit.toString());
        const response = await fetch(`/api/voice/commands/${companyId}/${userId}?${params}`);
        return response.json();
    },
    getAnalytics: async (companyId, userId, periodDays) => {
        const params = new URLSearchParams();
        if (periodDays)
            params.append('periodDays', periodDays.toString());
        const response = await fetch(`/api/voice/analytics/${companyId}/${userId}?${params}`);
        return response.json();
    },
    getTemplates: async (companyId) => {
        const response = await fetch(`/api/voice/templates/${companyId}`);
        return response.json();
    },
    getLanguages: async () => {
        const response = await fetch('/api/voice/languages');
        return response.json();
    },
    testWakeWord: async (companyId, userId, wakeWord) => {
        const response = await fetch(`/api/voice/wake-word/${companyId}/${userId}/test`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ wakeWord })
        });
        return response.json();
    },
    getPerformance: async (companyId, userId, periodDays) => {
        const params = new URLSearchParams();
        if (periodDays)
            params.append('periodDays', periodDays.toString());
        const response = await fetch(`/api/voice/performance/${companyId}/${userId}?${params}`);
        return response.json();
    },
    getSuggestions: async (companyId, userId, context) => {
        const params = new URLSearchParams();
        if (context)
            params.append('context', context);
        const response = await fetch(`/api/voice/suggestions/${companyId}/${userId}?${params}`);
        return response.json();
    }
};
// Voice-Enabled Accounting Component
export const VoiceEnabledAccounting = ({ companyId, userId }) => {
    const [activeTab, setActiveTab] = useState('voice');
    const [isListening, setIsListening] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [currentSession, setCurrentSession] = useState(null);
    const [lastCommand, setLastCommand] = useState(null);
    const [isMuted, setIsMuted] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showTemplates, setShowTemplates] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState(30);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const audioContextRef = useRef(null);
    const queryClient = useQueryClient();
    // Queries
    const { data: settings, isLoading: settingsLoading } = useQuery({
        queryKey: ['voiceSettings', companyId, userId],
        queryFn: () => api.getSettings(companyId, userId),
        enabled: activeTab === 'settings'
    });
    const { data: commandHistory, isLoading: historyLoading } = useQuery({
        queryKey: ['voiceCommandHistory', companyId, userId],
        queryFn: () => api.getCommandHistory(companyId, userId, 50),
        enabled: activeTab === 'history'
    });
    const { data: analytics, isLoading: analyticsLoading } = useQuery({
        queryKey: ['voiceAnalytics', companyId, userId, selectedPeriod],
        queryFn: () => api.getAnalytics(companyId, userId, selectedPeriod),
        enabled: activeTab === 'analytics'
    });
    const { data: templates } = useQuery({
        queryKey: ['voiceTemplates', companyId],
        queryFn: () => api.getTemplates(companyId)
    });
    const { data: languages } = useQuery({
        queryKey: ['voiceLanguages'],
        queryFn: () => api.getLanguages()
    });
    const { data: performance } = useQuery({
        queryKey: ['voicePerformance', companyId, userId, selectedPeriod],
        queryFn: () => api.getPerformance(companyId, userId, selectedPeriod)
    });
    const { data: suggestions } = useQuery({
        queryKey: ['voiceSuggestions', companyId, userId],
        queryFn: () => api.getSuggestions(companyId, userId)
    });
    // Mutations
    const updateSettingsMutation = useMutation({
        mutationFn: ({ updates }) => api.updateSettings(companyId, userId, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['voiceSettings', companyId, userId] });
        }
    });
    const startSessionMutation = useMutation({
        mutationFn: ({ language }) => api.startSession(companyId, userId, language),
        onSuccess: (data) => {
            setCurrentSession(data.data);
        }
    });
    const endSessionMutation = useMutation({
        mutationFn: ({ sessionId }) => api.endSession(sessionId),
        onSuccess: () => {
            setCurrentSession(null);
            queryClient.invalidateQueries({ queryKey: ['voiceAnalytics', companyId, userId] });
        }
    });
    const processCommandMutation = useMutation({
        mutationFn: ({ audioData, sessionId }) => api.processCommand(companyId, userId, audioData, sessionId),
        onSuccess: (data) => {
            setLastCommand(data.data);
            queryClient.invalidateQueries({ queryKey: ['voiceCommandHistory', companyId, userId] });
            queryClient.invalidateQueries({ queryKey: ['voiceAnalytics', companyId, userId] });
        }
    });
    // Voice Recording Functions
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];
            mediaRecorderRef.current.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };
            mediaRecorderRef.current.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
                const reader = new FileReader();
                reader.onloadend = async () => {
                    const base64Audio = reader.result;
                    const audioData = base64Audio.split(',')[1]; // Remove data URL prefix
                    setIsProcessing(true);
                    await processCommandMutation.mutateAsync({
                        audioData,
                        sessionId: currentSession?.sessionId
                    });
                    setIsProcessing(false);
                };
                reader.readAsDataURL(audioBlob);
            };
            mediaRecorderRef.current.start();
            setIsListening(true);
            // Start session if not already started
            if (!currentSession) {
                await startSessionMutation.mutateAsync({
                    language: settings?.data?.language
                });
            }
        }
        catch (error) {
            console.error('Error starting recording:', error);
            alert('Error accessing microphone. Please check permissions.');
        }
    };
    const stopRecording = () => {
        if (mediaRecorderRef.current && isListening) {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            setIsListening(false);
        }
    };
    const toggleMute = () => {
        setIsMuted(!isMuted);
    };
    const handleSettingsUpdate = (updates) => {
        updateSettingsMutation.mutate({ updates });
    };
    const playAudioResponse = (audioResponse) => {
        if (isMuted)
            return;
        const audio = new Audio(audioResponse);
        audio.play().catch(error => {
            console.error('Error playing audio response:', error);
        });
    };
    // Auto-play audio response when received
    useEffect(() => {
        if (lastCommand?.audioResponse && !isMuted) {
            playAudioResponse(lastCommand.audioResponse);
        }
    }, [lastCommand, isMuted]);
    // Tab Navigation
    const tabs = [
        { id: 'voice', label: 'Voice Commands', icon: Mic },
        { id: 'settings', label: 'Settings', icon: Settings },
        { id: 'history', label: 'History', icon: History },
        { id: 'analytics', label: 'Analytics', icon: BarChart3 }
    ];
    return (_jsxs("div", { className: "min-h-screen bg-gray-50", children: [_jsx("div", { className: "bg-white shadow-sm border-b", children: _jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: [_jsxs("div", { className: "flex justify-between items-center py-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Voice-Enabled Accounting" }), _jsx("p", { className: "text-gray-600 mt-1", children: "Hands-free accounting with natural language commands" })] }), _jsxs("div", { className: "flex items-center space-x-3", children: [_jsxs("div", { className: "flex items-center space-x-2 text-sm text-gray-500", children: [_jsx(Headphones, { className: "w-4 h-4" }), _jsx("span", { children: "Voice Interface" })] }), settings?.data?.isEnabled && (_jsxs("div", { className: "flex items-center space-x-2 text-sm text-green-600", children: [_jsx(CheckCircle, { className: "w-4 h-4" }), _jsx("span", { children: "Active" })] }))] })] }), _jsx("div", { className: "flex space-x-8", children: tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (_jsxs("button", { onClick: () => setActiveTab(tab.id), className: `flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                                        ? 'border-teal-500 text-teal-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`, children: [_jsx(Icon, { className: "w-4 h-4" }), _jsx("span", { children: tab.label })] }, tab.id));
                            }) })] }) }), _jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: [activeTab === 'voice' && (_jsxs("div", { className: "space-y-6", children: [_jsx("div", { className: "bg-white rounded-lg shadow p-8", children: _jsxs("div", { className: "text-center", children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900 mb-4", children: "Voice Commands" }), _jsx("p", { className: "text-gray-600 mb-8", children: "Use natural language to interact with your accounting system" }), _jsxs("div", { className: "flex items-center justify-center space-x-6 mb-8", children: [_jsx("button", { onClick: isListening ? stopRecording : startRecording, disabled: isProcessing || !settings?.data?.isEnabled, className: `flex items-center justify-center w-20 h-20 rounded-full text-white font-semibold text-lg transition-all duration-200 ${isListening
                                                        ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                                                        : 'bg-teal-500 hover:bg-teal-600'} disabled:opacity-50 disabled:cursor-not-allowed`, children: isProcessing ? (_jsx(RefreshCw, { className: "w-8 h-8 animate-spin" })) : isListening ? (_jsx(MicOff, { className: "w-8 h-8" })) : (_jsx(Mic, { className: "w-8 h-8" })) }), _jsx("button", { onClick: toggleMute, className: `flex items-center justify-center w-12 h-12 rounded-full ${isMuted ? 'bg-gray-300 text-gray-600' : 'bg-blue-500 text-white'} hover:opacity-80 transition-all duration-200`, children: isMuted ? _jsx(VolumeX, { className: "w-5 h-5" }) : _jsx(Volume2, { className: "w-5 h-5" }) })] }), _jsxs("div", { className: "flex items-center justify-center space-x-4 mb-6", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: `w-3 h-3 rounded-full ${isListening ? 'bg-red-500 animate-pulse' : 'bg-gray-300'}` }), _jsx("span", { className: "text-sm text-gray-600", children: isListening ? 'Listening...' : 'Ready' })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: `w-3 h-3 rounded-full ${isProcessing ? 'bg-yellow-500 animate-pulse' : 'bg-gray-300'}` }), _jsx("span", { className: "text-sm text-gray-600", children: isProcessing ? 'Processing...' : 'Idle' })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: `w-3 h-3 rounded-full ${currentSession ? 'bg-green-500' : 'bg-gray-300'}` }), _jsx("span", { className: "text-sm text-gray-600", children: currentSession ? 'Session Active' : 'No Session' })] })] }), _jsxs("div", { className: "flex items-center justify-center space-x-4", children: [_jsxs("button", { onClick: () => setShowTemplates(true), className: "bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors", children: [_jsx(HelpCircle, { className: "w-4 h-4 inline mr-2" }), "Command Templates"] }), _jsxs("button", { onClick: () => setShowSuggestions(true), className: "bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors", children: [_jsx(Lightbulb, { className: "w-4 h-4 inline mr-2" }), "Suggestions"] }), _jsxs("button", { onClick: () => setShowSettings(true), className: "bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors", children: [_jsx(Settings, { className: "w-4 h-4 inline mr-2" }), "Settings"] })] })] }) }), lastCommand && (_jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-4", children: "Last Command" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm text-gray-500", children: "Command:" }), _jsx("span", { className: "text-sm font-medium", children: lastCommand.command })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm text-gray-500", children: "Action:" }), _jsx("span", { className: "text-sm font-medium", children: lastCommand.action })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm text-gray-500", children: "Confidence:" }), _jsxs("span", { className: "text-sm font-medium", children: [Math.round(lastCommand.confidence * 100), "%"] })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm text-gray-500", children: "Response:" }), _jsx("span", { className: "text-sm font-medium", children: lastCommand.response })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm text-gray-500", children: "Status:" }), _jsx("span", { className: `text-sm font-medium ${lastCommand.success ? 'text-green-600' : 'text-red-600'}`, children: lastCommand.success ? 'Success' : 'Error' })] })] })] })), _jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-4", children: "Voice Command Examples" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx("h4", { className: "font-medium text-gray-700", children: "Transactions" }), _jsxs("ul", { className: "space-y-1 text-sm text-gray-600", children: [_jsx("li", { children: "\u2022 \"Add transaction for office supplies fifty dollars\"" }), _jsx("li", { children: "\u2022 \"Record expense for lunch twenty five dollars\"" }), _jsx("li", { children: "\u2022 \"New transaction for utilities one hundred dollars\"" })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("h4", { className: "font-medium text-gray-700", children: "Queries" }), _jsxs("ul", { className: "space-y-1 text-sm text-gray-600", children: [_jsx("li", { children: "\u2022 \"What is the balance of checking account\"" }), _jsx("li", { children: "\u2022 \"Check balance for savings account\"" }), _jsx("li", { children: "\u2022 \"Show me the balance of credit card\"" })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("h4", { className: "font-medium text-gray-700", children: "Reports" }), _jsxs("ul", { className: "space-y-1 text-sm text-gray-600", children: [_jsx("li", { children: "\u2022 \"Generate profit and loss report for this month\"" }), _jsx("li", { children: "\u2022 \"Create cash flow report for last quarter\"" }), _jsx("li", { children: "\u2022 \"Show me the balance sheet for this year\"" })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("h4", { className: "font-medium text-gray-700", children: "Help" }), _jsxs("ul", { className: "space-y-1 text-sm text-gray-600", children: [_jsx("li", { children: "\u2022 \"Help\"" }), _jsx("li", { children: "\u2022 \"What can you do\"" }), _jsx("li", { children: "\u2022 \"Show available commands\"" })] })] })] })] })] })), activeTab === 'settings' && (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900", children: "Voice Settings" }), _jsxs("button", { onClick: () => setShowSettings(true), className: "bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700", children: [_jsx(Edit, { className: "w-4 h-4 inline mr-2" }), "Edit Settings"] })] }), settingsLoading ? (_jsxs("div", { className: "text-center py-8", children: [_jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto" }), _jsx("p", { className: "mt-2 text-sm text-gray-500", children: "Loading settings..." })] })) : settings?.data ? (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-medium text-gray-900 mb-3", children: "General Settings" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm text-gray-500", children: "Voice Enabled" }), _jsx("span", { className: `text-sm font-medium ${settings.data.isEnabled ? 'text-green-600' : 'text-red-600'}`, children: settings.data.isEnabled ? 'Enabled' : 'Disabled' })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm text-gray-500", children: "Language" }), _jsx("span", { className: "text-sm font-medium", children: settings.data.language })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm text-gray-500", children: "Voice Speed" }), _jsxs("span", { className: "text-sm font-medium", children: [settings.data.voiceSpeed, "x"] })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm text-gray-500", children: "Voice Type" }), _jsx("span", { className: "text-sm font-medium capitalize", children: settings.data.voiceType })] })] })] }), _jsxs("div", { children: [_jsx("h3", { className: "font-medium text-gray-900 mb-3", children: "Advanced Settings" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm text-gray-500", children: "Wake Word" }), _jsx("span", { className: "text-sm font-medium", children: settings.data.wakeWord })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm text-gray-500", children: "Auto Transcribe" }), _jsx("span", { className: `text-sm font-medium ${settings.data.autoTranscribe ? 'text-green-600' : 'text-red-600'}`, children: settings.data.autoTranscribe ? 'Enabled' : 'Disabled' })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm text-gray-500", children: "Noise Reduction" }), _jsx("span", { className: `text-sm font-medium ${settings.data.noiseReduction ? 'text-green-600' : 'text-red-600'}`, children: settings.data.noiseReduction ? 'Enabled' : 'Disabled' })] })] })] })] })) : (_jsxs("div", { className: "text-center py-8", children: [_jsx(Mic, { className: "mx-auto h-12 w-12 text-gray-400" }), _jsx("p", { className: "mt-2 text-sm text-gray-500", children: "No settings found" })] }))] }), _jsxs("div", { className: "bg-white rounded-lg shadow", children: [_jsx("div", { className: "px-6 py-4 border-b border-gray-200", children: _jsx("h3", { className: "text-lg font-semibold text-gray-900", children: "Voice Commands" }) }), _jsx("div", { className: "p-6", children: settings?.data?.commands?.length > 0 ? (_jsx("div", { className: "space-y-4", children: settings.data.commands.map((command) => (_jsxs("div", { className: "border rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("h4", { className: "font-medium text-gray-900", children: command.name }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("span", { className: `text-xs px-2 py-1 rounded ${command.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`, children: command.isActive ? 'Active' : 'Inactive' }), _jsxs("span", { className: "text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded", children: ["Priority ", command.priority] })] })] }), _jsx("p", { className: "text-sm text-gray-600 mb-2", children: command.description }), _jsxs("div", { className: "text-xs text-gray-500", children: [_jsxs("div", { children: ["Action: ", command.action] }), _jsxs("div", { children: ["Parameters: ", command.parameters.join(', ')] })] })] }, command.id))) })) : (_jsxs("div", { className: "text-center py-8", children: [_jsx(Settings, { className: "mx-auto h-12 w-12 text-gray-400" }), _jsx("p", { className: "mt-2 text-sm text-gray-500", children: "No voice commands configured" })] })) })] })] })), activeTab === 'history' && (_jsx("div", { className: "space-y-6", children: _jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900", children: "Voice Command History" }), _jsxs("button", { onClick: () => queryClient.invalidateQueries({ queryKey: ['voiceCommandHistory', companyId, userId] }), className: "bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700", children: [_jsx(RefreshCw, { className: "w-4 h-4 inline mr-2" }), "Refresh"] })] }), historyLoading ? (_jsxs("div", { className: "text-center py-8", children: [_jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto" }), _jsx("p", { className: "mt-2 text-sm text-gray-500", children: "Loading history..." })] })) : commandHistory?.data?.length > 0 ? (_jsx("div", { className: "space-y-4", children: commandHistory.data.map((command) => (_jsxs("div", { className: "border rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("span", { className: "text-sm font-medium", children: command.transcription }), _jsx("span", { className: `text-xs px-2 py-1 rounded ${command.processed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`, children: command.processed ? 'Processed' : 'Failed' })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsxs("span", { className: "text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded", children: [Math.round(command.confidence * 100), "%"] }), _jsx("span", { className: "text-xs text-gray-500", children: new Date(command.createdAt).toLocaleString() })] })] }), _jsxs("div", { className: "text-sm text-gray-600", children: [_jsxs("div", { children: ["Type: ", command.commandType] }), command.result && (_jsxs("div", { children: ["Result: ", JSON.stringify(command.result)] }))] })] }, command.id))) })) : (_jsxs("div", { className: "text-center py-8", children: [_jsx(History, { className: "mx-auto h-12 w-12 text-gray-400" }), _jsx("p", { className: "mt-2 text-sm text-gray-500", children: "No voice commands in history" })] }))] }) })), activeTab === 'analytics' && (_jsx("div", { className: "space-y-6", children: _jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900", children: "Voice Analytics" }), _jsxs("div", { className: "flex items-center space-x-3", children: [_jsxs("select", { value: selectedPeriod, onChange: (e) => setSelectedPeriod(Number(e.target.value)), className: "border border-gray-300 rounded-md px-3 py-1 text-sm", children: [_jsx("option", { value: 7, children: "Last 7 days" }), _jsx("option", { value: 30, children: "Last 30 days" }), _jsx("option", { value: 90, children: "Last 90 days" })] }), _jsxs("button", { onClick: () => queryClient.invalidateQueries({ queryKey: ['voiceAnalytics', companyId, userId] }), className: "bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700", children: [_jsx(RefreshCw, { className: "w-4 h-4 inline mr-2" }), "Refresh"] })] })] }), analyticsLoading ? (_jsxs("div", { className: "text-center py-8", children: [_jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto" }), _jsx("p", { className: "mt-2 text-sm text-gray-500", children: "Loading analytics..." })] })) : analytics?.data ? (_jsxs("div", { children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4 mb-6", children: [_jsxs("div", { className: "flex items-center p-4 bg-blue-50 rounded-lg", children: [_jsx("div", { className: "p-2 bg-blue-100 rounded-lg", children: _jsx(Mic, { className: "w-6 h-6 text-blue-600" }) }), _jsxs("div", { className: "ml-4", children: [_jsx("p", { className: "text-sm font-medium text-gray-500", children: "Total Commands" }), _jsx("p", { className: "text-lg font-bold text-gray-900", children: analytics.data.totalCommands })] })] }), _jsxs("div", { className: "flex items-center p-4 bg-green-50 rounded-lg", children: [_jsx("div", { className: "p-2 bg-green-100 rounded-lg", children: _jsx(CheckCircle, { className: "w-6 h-6 text-green-600" }) }), _jsxs("div", { className: "ml-4", children: [_jsx("p", { className: "text-sm font-medium text-gray-500", children: "Success Rate" }), _jsxs("p", { className: "text-lg font-bold text-gray-900", children: [analytics.data.totalCommands > 0
                                                                            ? Math.round((analytics.data.successfulCommands / analytics.data.totalCommands) * 100)
                                                                            : 0, "%"] })] })] }), _jsxs("div", { className: "flex items-center p-4 bg-purple-50 rounded-lg", children: [_jsx("div", { className: "p-2 bg-purple-100 rounded-lg", children: _jsx(Target, { className: "w-6 h-6 text-purple-600" }) }), _jsxs("div", { className: "ml-4", children: [_jsx("p", { className: "text-sm font-medium text-gray-500", children: "Avg Confidence" }), _jsxs("p", { className: "text-lg font-bold text-gray-900", children: [Math.round(analytics.data.averageConfidence * 100), "%"] })] })] }), _jsxs("div", { className: "flex items-center p-4 bg-orange-50 rounded-lg", children: [_jsx("div", { className: "p-2 bg-orange-100 rounded-lg", children: _jsx(Clock, { className: "w-6 h-6 text-orange-600" }) }), _jsxs("div", { className: "ml-4", children: [_jsx("p", { className: "text-sm font-medium text-gray-500", children: "Session Time" }), _jsxs("p", { className: "text-lg font-bold text-gray-900", children: [Math.round(analytics.data.sessionDuration), " min"] })] })] })] }), _jsxs("div", { className: "mb-6", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-3", children: "Most Used Commands" }), _jsx("div", { className: "space-y-2", children: analytics.data.mostUsedCommands.map((cmd, index) => (_jsxs("div", { className: "flex items-center justify-between p-2 bg-gray-50 rounded", children: [_jsx("span", { className: "text-sm font-medium", children: cmd.command }), _jsxs("span", { className: "text-sm text-gray-600", children: [cmd.count, " times"] })] }, index))) })] }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-3", children: "Language Usage" }), _jsx("div", { className: "space-y-2", children: Object.entries(analytics.data.languageUsage).map(([lang, count]) => (_jsxs("div", { className: "flex items-center justify-between p-2 bg-gray-50 rounded", children: [_jsx("span", { className: "text-sm font-medium", children: lang }), _jsxs("span", { className: "text-sm text-gray-600", children: [count, " sessions"] })] }, lang))) })] })] })) : (_jsxs("div", { className: "text-center py-8", children: [_jsx(BarChart3, { className: "mx-auto h-12 w-12 text-gray-400" }), _jsx("p", { className: "mt-2 text-sm text-gray-500", children: "No analytics data available" })] }))] }) }))] })] }));
};
